---
title: 【IT技術の知見】OpenTelemetry Collector＠CNCF
description: OpenTelemetry Collector＠CNCFの知見を記録しています。
---

# OpenTelemetry Collector＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. OpenTelemetry Collectorの仕組み

### アーキテクチャ

『テレメトリーコンシューマー』ともいう。

OpenTelemetry Collectorは、Receiver、Processor、Exporter、といったコンポーネントから構成されている。

otelクライアントパッケージからのテレメトリーデータを、Receiverで受け取り、最終的にテレメトリーデーターの可視化ツールにこれを渡す。

テレメトリーデータをotelクライアントパッケージからバックエンドに直接送信してもよいが、OpenTelemetry Collectorを使用した方が良い。

もし、サービスメッシュツール (例：Istio、Linkerd、など) のサイドカープロキシメッシュとOpenTelemetryの両方を採用する場合、otelクライアントパッケージの代わりに、サイドカーがOpenTelemetry Collectorにテレメトリーデータを送信する責務を持つ。

![open-telemetry_collector](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/open-telemetry_collector.png)

> - https://www.logicmonitor.com/blog/what-is-an-otel-collector
> - https://istio.io/latest/docs/tasks/observability/logs/otel-provider/

<br>

### Receiver

#### ▼ Receiverとは

OTLP形式のテレメトリーを受信する。

HTTPSで受信する場合には、SSL証明書が必要である。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/README.md
> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/configtls/README.md#server-configuration

<br>

### Processor

#### ▼ Processorとは

テレメトリーを監視バックエンドに送信する前に、事前処理を実行する。

OpenTelemetryクライアントのProcessorと同じである。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/README.md

<br>

### Exporter

#### ▼ Exporterとは

OTLP形式やいくつかのOSS形式 (例：Prometheus、Jaeger、など) のテレメトリーを監視バックエンドに送信する。

また、OpenTelemetryのスキーマ (`semconv`パッケージ) を介して、スパンのデータ構造を変換する。

OpenTelemetryクライアントのExporterと同じである。

非対応の監視バックエンド (例：X-Ray) に関しては、その形式の監視バックエンドが提供するExporter (例：AWS Distro for OpenTelemetry CollectorのExporter) を使用する必要がある。

HTTPSで送信する場合には、クライアント証明書が必要である。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/README.md
> - https://azukiazusa.dev/blog/instrumenting-Node-js-applications-with-open-telemetry/#exporters
> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/configtls/README.md#client-configuration

#### ▼ AWS X-Ray Exporter

AWS X-Rayを宛先とし、またスパンをAWS X-Rayのセグメントに変換する。

OpenTelemetryとX-Rayの間で互換性のないデータ (例：OpenTelemetryのAttribute) は、まとめてX-Rayのアノテーションやメタデータに変換する。

注意点として、トレースIDやスパンIDのトレースコンテキスト仕様は変換できず、そのまま転送してしまう。

そのため、X-Rayの対応するトレースコンテキスト仕様 (例：W3C Trace Context、X-Ray仕様) ではない場合、スパンを送ったとしてもX-Ray上で分散トレースを作成できない。

> - https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.96.0/exporter/awsxrayexporter/internal/translator/segment.go#L92-L246
> - https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/v0.96.0/exporter/awsxrayexporter/internal/translator/segment.go#L371-L475

<br>

## 02. セットアップ

### AWS側

#### ▼ Terraformの公式モジュールの場合

ここでは、X-Rayに接続すると仮定する。

OpenTelemetry Collectorのセットアップのうち、AWS側で必要なものをまとめる。

ここでは、Terraformの公式モジュールを使用する。

```terraform
module "iam_assumable_role_with_opentelemetry_collector" {

  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"

  version                       = "<バージョン>"

  # karpenterコントローラーのPodに紐付けるIAMロール
  create_role                   = true
  role_name                     = "foo-opentelemetry-collector"

  # AWS EKS ClusterのOIDCプロバイダーURLからhttpsプロトコルを除いたもの
  provider_url                  = replace(module.eks.cluster_oidc_issuer_url, "https://", "")

  # AWS IAMロールに紐付けるIAMポリシー
  role_policy_arns              = aws_iam_policy.opentelemetry_collector.arn

  # OpenTelemetry CollectorのPodのServiceAccount名
  # ServiceAccountは、Terraformではなく、マニフェストで定義した方が良い
  oidc_fully_qualified_subjects = [
    "system:serviceaccount:opentelemetry:opentelemetry-collector"
  ]
}

resource "aws_iam_policy" "iam_assumable_role_with_oidc_opentelemetry_collector" {
  name = "foo-opentelemetry-collector-policy"
  policy = data.aws_iam_policy_document.opentelemetry_collector_policy.json
}

data "aws_iam_policy_document" "opentelemetry_collector_policy" {

  # X-Rayにアクセスできるようにする
  statement {
    effect = "Allow"
    actions = [
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords",
      "xray:GetSamplingRules",
      "xray:GetSamplingTargets",
      "xray:GetSamplingStatisticSummaries",
    ]
    resources = ["*"]
  }
}
```

> - https://aws-otel.github.io/docs/setup/permissions

<br>

## 03. デザインパターンの種類

### エージェントパターン

#### ▼ エージェントパターンとは

テレメトリーの送信元では、エージェント (OpenTelemetry Collector) が常駐し、テレメトリーを収集する。

さらに、エージェントはテレメトリーを監視バックエンドに送信する。

> - https://opentelemetry.io/docs/collector/deployment/agent/

#### ▼ エージェントパターンの実装例

エージェントは、デーモンプロセス、サイドカー、DaemonSet、などで実装できる。

#### ▼ エージェントパターンのデメリット

もしOpenTelemetryで分散トレースのみを採用しているとする。

エージェントパターンであると、スパンを作らないPodがいるNodeにまでOpenTelemetry Collectorをスケジューリングしてしまう。

スパンを作るPodがいるNodeのためだけに、OpenTelemetry Collectorを配置すればよいため、エージェントパターンは不適である。

<br>

### ゲートウェイパターン

#### ▼ ゲートウェイパターンとは

テレメトリーの送信元では、ゲートウェイ (OpenTelemetry Collector) はL7ロードバランサーを介してテレメトリーを収集する。

さらに、ゲートウェイはテレメトリーを監視バックエンドに送信する。

> - https://opentelemetry.io/docs/collector/deployment/gateway/

#### ▼ ゲートウェイパターンの実装例

L7ロードバランサーはIngressコントローラーや`istio-proxy`コンテナ、ゲートウェイはDeployment、などで実装できる。

#### ▼ ゲートウェイパターンのデメリット

記入中...

<br>

## 04. マニフェスト

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: opentelemetry-collector
data:
  config: |
    ...
```

> - https://github.com/open-telemetry/opentelemetry-helm-charts/blob/opentelemetry-collector-0.80.0/charts/opentelemetry-collector/examples/deployment-otlp-traces/rendered/configmap.yaml

<br>

### DaemonSet (DaemonSetモード)

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: opentelemetry-collector-agent
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: opentelemetry-collector
      app.kubernetes.io/instance: example
      component: agent-collector
  updateStrategy:
    type: RollingUpdate
  template:
    metadata:
      annotations:
        checksum/config: 9e2c733798733e804f0f3840abda595a272a852f3ed54c14212a18bbcbe14d10
      labels:
        app.kubernetes.io/name: opentelemetry-collector
        app.kubernetes.io/instance: example
        component: agent-collector
    spec:
      serviceAccountName: opentelemetry-collector
      containers:
        - name: opentelemetry-collector
          command:
            - /otelcol-contrib
            - --config=/conf/config.yaml
          image: "otel/opentelemetry-collector-contrib:0.93.0"
          imagePullPolicy: IfNotPresent
          ports:
            - name: jaeger-compact
              containerPort: 6831
              protocol: UDP
              hostPort: 6831
            - name: jaeger-grpc
              containerPort: 14250
              protocol: TCP
              hostPort: 14250
            - name: jaeger-thrift
              containerPort: 14268
              protocol: TCP
              hostPort: 14268
            - name: otlp
              containerPort: 4317
              protocol: TCP
              hostPort: 4317
            - name: otlp-http
              containerPort: 4318
              protocol: TCP
              hostPort: 4318
            - name: zipkin
              containerPort: 9411
              protocol: TCP
              hostPort: 9411
          env:
            - name: MY_POD_IP
              valueFrom:
                fieldRef:
                  apiVersion: v1
                  fieldPath: status.podIP
          livenessProbe:
            httpGet:
              path: /
              port: 13133
          readinessProbe:
            httpGet:
              path: /
              port: 13133
          volumeMounts:
            - mountPath: /conf
              name: opentelemetry-collector-configmap
      volumes:
        - name: opentelemetry-collector-configmap
          configMap:
            name: opentelemetry-collector-agent
            items:
              - key: config
                path: config.yaml
      hostNetwork: false
```

> - https://github.com/open-telemetry/opentelemetry-helm-charts/blob/opentelemetry-collector-0.80.0/charts/opentelemetry-collector/examples/daemonset-only/rendered/daemonset.yaml
> - https://medium.com/opentelemetry/deploying-the-opentelemetry-collector-on-kubernetes-2256eca569c9

<br>

### Deployment (Deploymentモード)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: opentelemetry-collector
spec:
  replicas: 1
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      app.kubernetes.io/name: opentelemetry-collector
      app.kubernetes.io/instance: example
      component: standalone-collector
  strategy:
    type: RollingUpdate
  template:
    metadata:
      annotations:
        checksum/config: 53da0e3c13d88832e551b80c5e4058ab64e37b0b6a27d08a06a3f09c105a9f15
      labels:
        app.kubernetes.io/name: opentelemetry-collector
        app.kubernetes.io/instance: example
        component: standalone-collector
    spec:
      serviceAccountName: opentelemetry-collector
      containers:
        - name: opentelemetry-collector
          command:
            - /otelcol-contrib
            - --config=/conf/config.yaml
          image: "otel/opentelemetry-collector-contrib:0.93.0"
          imagePullPolicy: IfNotPresent
          ports:
            - name: otlp
              containerPort: 4317
              protocol: TCP
            - name: otlp-http
              containerPort: 4318
              protocol: TCP
          env:
            - name: MY_POD_IP
              valueFrom:
                fieldRef:
                  apiVersion: v1
                  fieldPath: status.podIP
          livenessProbe:
            httpGet:
              path: /
              port: 13133
          readinessProbe:
            httpGet:
              path: /
              port: 13133
          volumeMounts:
            - mountPath: /conf
              name: opentelemetry-collector-configmap
      volumes:
        - name: opentelemetry-collector-configmap
          configMap:
            name: opentelemetry-collector
            items:
              - key: config
                path: config.yaml
      hostNetwork: false
```

> - https://github.com/open-telemetry/opentelemetry-helm-charts/blob/opentelemetry-collector-0.80.0/charts/opentelemetry-collector/examples/deployment-otlp-traces/rendered/deployment.yaml
> - https://medium.com/opentelemetry/deploying-the-opentelemetry-collector-on-kubernetes-2256eca569c9

<br>

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: opentelemetry-collector
spec:
  type: ClusterIP
  ports:
    - name: otlp
      port: 4317
      targetPort: 4317
      protocol: TCP
      appProtocol: grpc
    - name: otlp-http
      port: 4318
      targetPort: 4318
      protocol: TCP
  selector:
    app.kubernetes.io/name: opentelemetry-collector
    app.kubernetes.io/instance: example
    component: standalone-collector
  internalTrafficPolicy: Cluster
```

> - https://github.com/open-telemetry/opentelemetry-helm-charts/blob/opentelemetry-collector-0.80.0/charts/opentelemetry-collector/examples/deployment-otlp-traces/rendered/service.yaml

<br>

### StatefulSet (StatefulSetモード)

記入中...

<br>

## 05. カスタムリソースを使用する場合

カスタムリソースを使用して、OpenTelemetryを定義することもできる。

この場合、OpenTelemetry OperatorがInitContainerを介して、アプリコンテナにOpenTelemetryの実装を挿入する。

> - https://medium.com/opentelemetry/using-opentelemetry-auto-instrumentation-agents-in-kubernetes-869ec0f42377
> - https://speakerdeck.com/k6s4i53rx/getting-started-auto-instrumentation-with-opentelemetry?slide=52

<br>
