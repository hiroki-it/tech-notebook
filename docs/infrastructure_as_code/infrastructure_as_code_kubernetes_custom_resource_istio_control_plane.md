---
title: 【IT技術の知見】コントロールプレーン＠Istio
description: コントロールプレーン＠Istioの知見を記録しています。
---

# コントロールプレーン＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. コントロールプレーン（Istiodコントロールプレーン）とは

### サイドカープロキシによるサービスメッシュの場合

![istio_control-plane_ports](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_control-plane_ports.png)

サイドカープロキシによるサービスメッシュのIstiodコントロールプレーンは、istiod-serviceを介して、各種ポート番号で```istio-proxy```コンテナからのリモートプロシージャ〜コールを待ち受ける。語尾の『```d```』は、デーモンの意味であるが、Istiodコントロールプレーンの実体は、istiod-deploymentである。

> ℹ️ 参考：
>
> - https://www.amazon.co.jp/dp/B09XN9RDY1
> - https://istio.io/latest/docs/ops/deployment/requirements/#ports-used-by-istio
> - https://istio.io/latest/docs/ops/integrations/prometheus/#configuration

<br>

### アンビエンドメッシュの場合

調査中...

<br>

## 02. コントロールプレーンの要素

### istiod-deployment

#### ▼ istiod-deploymentとは

コントロールプレーンのPodの可用性を高めるため、これを冗長化する。

#### ▼ Pod

istiod-deployment配下のPodは、Istiodコントロールプレーンの実体である。Pod内では```discovery```コンテナが稼働している。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: istiod
    istio.io/rev: <リビジョン番号>
    release: istiod
  name: istiod-<リビジョン番号>
  namespace: istio-system
spec:
  replicas: 2
  selector:
    matchLabels:
      app: istiod
      istio.io/rev: <リビジョン番号>
  strategy:
    rollingUpdate:
      maxSurge: 100%
      maxUnavailable: 25%
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: istiod
        istio.io/rev: <リビジョン番号>
    spec:
      containers:
        - args:
            - discovery
            # 15014番ポートの開放
            - --monitoringAddr=:15014
            - --log_output_level=default:info
            - --domain
            - cluster.local
            - --keepaliveMaxServerConnectionAge
            - 30m
          image: docker.io/istio/pilot:<リビジョン番号>
          imagePullPolicy: IfNotPresent
          name: discovery
          # 待ち受けるポート番号の仕様
          ports:
            # 8080番ポートの開放
            - containerPort: 8080
              protocol: TCP
            # 15010番ポートの開放
            - containerPort: 15010
              protocol: TCP
            # 15017番ポートの開放
            - containerPort: 15017
              protocol: TCP
          env:
            # 15012番ポートの開放
            - name: ISTIOD_ADDR
              value: istiod-<リビジョン番号>.istio-system.svc:15012 # 15012番ポートの開放
              
          ... 
          
# 重要なところ以外を省略しているので、全体像はその都度確認すること。
```

#### ▼ HorizontalPodAutoscaler

istiod-deployment配下のPodには、HorizontalPodAutoscalerが設定されている。コントロールプレーンの可用性を高められる。

```yaml
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  labels:
    app: istiod
    istio.io/rev: <リビジョン番号>
    release: istiod
  name: istiod-<リビジョン番号>
  namespace: istio-system
spec:
  maxReplicas: 5
  minReplicas: 2
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: istiod-<リビジョン番号>
  targetCPUUtilizationPercentage: 80
```

<br>

### istiod-service

```istio-proxy```コンテナからのリクエストを、Istiodコントロールプレーン（istiod-deployment配下のPod）にポートフォワーディングする。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: istiod-<リビジョン番号>
  namespace: istio-system
  labels:
    app: istiod
    istio: pilot
    istio.io/rev: <リビジョン番号>
    release: istiod
spec:
  ports:
    # webhookサーバーに対するリクエストを待ち受ける。
    - name: https-webhook
      port: 443
      protocol: TCP
      targetPort: 15017
    # xDSサーバーに対するリクエストを待ち受ける。
    - name: grpc-xds
      port: 15010
      protocol: TCP
      targetPort: 15010
    # SSL証明書に関するリクエストを待ち受ける。
    - name: https-dns
      port: 15012
      protocol: TCP
      targetPort: 15012
    # メトリクス収集に関するリクエストを待ち受ける。
    - name: http-monitoring
      port: 15014
      protocol: TCP
      targetPort: 15014
  selector:
    # ルーティング先のistiodコントールプレーン（istiod-deployment配下のPod）
    app: istiod
    istio.io/rev: <リビジョン番号>
```

<br>

### istio-sidecar-injector-configuration

Podの作成/更新時にwebhookサーバーにリクエストを送信できるように、MutatingWebhookConfigurationでMutatingAdmissionWebhookアドオンを設定する。

```yaml
apiVersion: admissionregistration.k8s.io/v1beta1
kind: MutatingWebhookConfiguration
metadata:
  name: istio-sidecar-injector-<リビジョン番号>
  labels:
    app: sidecar-injector
webhooks:
  - name: rev.namespace.sidecar-injector.istio.io
    # mutating-admissionステップ発火条件を登録する。
    rules:
      - apiGroups: [""]
        apiVersions: ["v1"]
        operations: ["CREATE", "UPDATE"]
        resources: ["pods"]
        scope: "*"
    # Webhookの前段にあるServiceの情報を登録する。
    clientConfig:
      service:
        name: istiod-<リビジョン番号>
        namespace: istio-system
        # エンドポイント
        path: "/inject"
        port: 443
      caBundle: Ci0tLS0tQk...
    namespaceSelector:
      matchExpressions:
        - key: istio.io/rev
          operator: In
          values:
            - <リビジョン番号>
```

<br>

## 02-02. ```descovery```コンテナ

### 待ち受けるポート番号

#### ▼ ```8080```番

```discovery```コンテナの```8080```番ポートでは、コントロールプレーンのデバッグエンドポイントに対するリクエストを待ち受ける。```descovery```コンテナの```15014```番ポートにポートフォワーディングしながら、別に``` go tool pprof```コマンドを実行することにより、Istioを実装するパッケージのリソース使用量を可視化できる。

> ℹ️ 参考：https://www.zhaohuabing.com/istio-guide/docs/debug-istio/istio-debug/#%E6%9F%A5%E7%9C%8B-istiod-%E5%86%85%E5%AD%98%E5%8D%A0%E7%94%A8

```bash
# ポートフォワーディングを実行する。
$ kubectl -n istio-system port-forward svc/istiod-<リビジョン番号> 15014

$ go tool pprof -http=:8080 localhost:15014/debug/pprof/heap

Fetching profile over HTTP from http://localhost:15014/debug/pprof/heap
Saved profile in /Users/hiroki-hasegawa/pprof/pprof.pilot-discovery.alloc_objects.alloc_space.inuse_objects.inuse_space.002.pb.gz
Serving web UI on http://localhost:8080

# どのパッケージでどのくらいリソースを消費しているか
$ curl http://localhost:8080/ui/flamegraph?si=alloc_objects
```

#### ▼ ```9876```番

```descovery```コンテナの```9876```番ポートでは、ControlZダッシュボードに対するリクエストを待ち受ける。ControlZダッシュボードでは、istiodコントロールプレーンの設定値を変更できる。

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/ops/diagnostic-tools/controlz/
> - https://jimmysong.io/en/blog/istio-components-and-ports/

#### ▼ ```15010```番

![istio_control-plane_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_control-plane_service-discovery.png)

```descovery```コンテナの```15010```番ポートでは、```istio-proxy```コンテナからのxDSサーバーに対するリモートプロシージャーコールを待ち受け、```descovery```コンテナ内のプロセスに渡す。コールの内容に応じて、他のサービス（Pod、ワーカーNode)の宛先情報を含むレスポンスを返信する。```istio-proxy```コンテナはこれを受信し、```pilot-agent```プロセスが```envoy```プロセスの宛先情報設定を動的に変更する（サービスディスカバリー）。

> ℹ️ 参考：https://www.zhaohuabing.com/post/2020-06-12-third-party-registry-english/

![istio_service-registry](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_service-registry.png)

Istiodコントロールプレーンは、サービスレジストリ（例：kube-apiserverを介したetcd、consul catalog、nocos、cloud foundry）に登録された情報や、コンフィグストレージに永続化されたマニフェストの宣言（ServiceEntry、WorkloadEntry）から、他のサービス（Pod、ワーカーNode）の宛先情報を取得する。```descovery```コンテナは、取得した宛先情報を自身に保管する。

> ℹ️ 参考：
>
> - https://www.zhaohuabing.com/post/2019-02-18-pilot-service-registry-code-analysis/
> - https://github.com/istio/istio/blob/693d97627e70f1e4eadeaede8bb5a18136c8feed/pilot/pkg/serviceregistry/provider/providers.go#L20-L27
> - https://juejin.cn/post/7028572651421433892
> - https://www.kubernetes.org.cn/4208.html


#### ▼ ```15012```番

![istio_control-plane_certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_control-plane_certificate.png)

```descovery```コンテナの```15012```番ポートでは、マイクロサービス間で相互TLSによるHTTPSプロトコルを使用する場合に、```istio-proxy```コンテナからのSSL証明書に関するリクエストを待ち受け、```descovery```コンテナ内のプロセスに渡す。リクエストの内容に応じて、SSL証明書と秘密鍵を含むレスポンスを返信する。```istio-proxy```コンテナはこれを受信し、```pilot-agent```プロセスは```envoy```プロセスにこれらを紐づける。また、SSL証明書の期限が切れれば、```istio-proxy```コンテナからのリクエストに応じて、新しいSSL証明書と秘密鍵を作成する。

> ℹ️ 参考：https://istio.io/latest/docs/concepts/security/#pki

#### ▼ ```15014```番

コンテナの```15014```番ポートでは、Istiodコントロールプレーンのメトリクスを監視するツールからのリクエストを待ち受け、```descovery```コンテナ内のプロセスに渡す。リクエストの内容に応じて、データポイントを含むレスポンスを返信する。

```bash
# ポートフォワーディングを実行する。
$ kubectl -n istio-system port-forward svc/istiod-<リビジョン番号> 15014

# デバッグダッシュボードにアクセスする。
$ curl http://127.0.0.1:15014/debug
```

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#metrics
> - https://www.zhaohuabing.com/istio-guide/docs/debug-istio/istio-debug/#istio-%E8%B0%83%E8%AF%95%E6%8E%A5%E5%8F%A3

#### ▼ ```15017```番

```descovery```コンテナの```15017```番ポートでは、Istioの```istiod-<リビジョン番号>```というServiceからのポートフォワーディングを待ち受け、```descovery```コンテナ内のプロセスに渡す。AdmissionReviewを含むレスポンスを返信する。


<br>
