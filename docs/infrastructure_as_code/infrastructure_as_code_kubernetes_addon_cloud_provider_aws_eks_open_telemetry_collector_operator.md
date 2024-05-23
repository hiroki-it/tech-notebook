---
title: 【IT技術の知見】AWS OpenTelemetry Collector Operator＠AWS EKSアドオン
description: AWS OpenTelemetry Collector Operator＠AWS EKSアドオンの知見を記録しています。
---

# AWS OpenTelemetry Collector Operator＠AWS EKSアドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. アーキテクチャ

AWS OpenTelemetry Collector Operatorは、OpenTelemetry Collectorに関するカスタムリソースのOperatorである。

> - https://aws.amazon.com/jp/blogs/news/metrics-and-traces-collection-using-amazon-eks-add-ons-for-aws-distro-for-opentelemetry/

<br>

## 02. セットアップ

### EKSアドオンとして

#### ▼ OpenTelemetryによるHelmチャートの場合

OpenTelemetryによるHelmチャートの場合、KubernetesリソースでOpenTelemetry Collectorを作成することになる。

ただし、これにはAWS X-Ray exporterが含まれていないため、AWS製のコンテナイメージ (パブリックECRの`public.ecr.aws/aws-observability/aws-otel-collector`) に差し替える。

> - https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector
> - https://developer.mamezou-tech.com/containers/k8s/tutorial/ops/awsxray/
> - https://gallery.ecr.aws/aws-observability/aws-otel-collector

#### ▼ AWSによるHelmチャートの場合

AWSによるHelmチャートを使用する場合、KubernetesリソースでOpenTelemetry Collectorを作成することになる。

執筆時点 (2024/01/22) では、Helmチャートがメトリクス収集の設定にしかサポートしていない。

> - https://github.com/aws-observability/aws-otel-helm-charts

#### ▼ Terraformの場合

Terraformを使用する場合、カスタムリソースでOpenTelemetry Collectorを作成することになる。

EKSアドオンは、OpenTelemetry Collector Operatorをデプロイする。

Terraformの`aws_eks_addon`でEKSアドオンをインストールし、OpenTelemetry CollectorのOperatorに関するKubernetesリソースを作成する。

```terraform
# AWS EKSアドオンをインストールする。
resource "aws_eks_addon" "adot" {

  cluster_name                = data.aws_eks_cluster.cluster.name
  addon_name                  = "adot"
  addon_version               = "<バージョン>"
  service_account_role_arn    = module.iam_assumable_role_open_telemetry_operator[0].iam_role_arn
  # Terraformで設定を上書きできるようにする
  resolve_conflicts_on_update = "OVERWRITE"
}

# X-Ray
resource "aws_xray_group" "environment" {

  group_name        = "foo-prd"

  filter_expression = <<EOF
(annotation.otel_resource_system_name = "foo") AND (annotation.otel_resource_environment = "prd")
EOF

  insights_configuration {
    insights_enabled = true
  }
}
```

OpenTelemetry Collectorのカスタムリソースを作成する。

ここでは、スパンを送信すると仮定する。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: foo-opentelemetry-collector
spec:
  mode: deployment
  serviceAccount: opentelemetry-collector
  config: |

    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: <PodのIPアドレス>:4317
          http:
            endpoint: <PodのIPアドレス>:4318

    processors:
      batch:
        timeout: 5s
        send_batch_size: 50

    exporters:
      awsxray:
        region: ap-northeast-1
      datadog:
        api:
          site: datadoghq.com
          key: *****

    service:
      pipelines:
        traces:
          receivers:
            - otlp
          processors: 
            - batch
          exporters: 
            - awsxray
```

> - https://github.com/aws-observability/observability-best-practices/blob/main/sandbox/eks-addon-adot/otel-collector-xray-cloudwatch-complete.yaml
> - https://github.com/aws-observability/aws-otel-helm-charts/blob/main/charts/adot-exporter-for-eks-on-ec2/templates/adot-collector/configmap.yaml
> - https://zenn.dev/nameless_gyoza/articles/aws-distro-for-opentelemetry-with-datadog-handson
> - https://zenn.dev/tmrekk/articles/689cae0e9b41bd

<br>
