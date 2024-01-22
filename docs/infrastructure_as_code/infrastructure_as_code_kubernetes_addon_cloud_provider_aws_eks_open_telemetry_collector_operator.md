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

AWS OpenTelemetry Collector Operatorは、OpenTelemetryコレクターに関するカスタムリソースのOperatorである。

> - https://aws.amazon.com/jp/blogs/news/metrics-and-traces-collection-using-amazon-eks-add-ons-for-aws-distro-for-opentelemetry/

<br>

## 02. セットアップ

### EKSアドオンとして

#### ▼ OpenTelemetryによるHelmチャートの場合

OpenTelemetryによるHelmチャートの場合、KubernetesリソースでOpenTelemetryコレクターを作成することになる。

> - https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-collector/README.md

#### ▼ AWSによるHelmチャートの場合

AWSによるHelmチャートを使用する場合、KubernetesリソースでOpenTelemetryコレクターを作成することになる。

執筆時点 (2024/01/22) では、Helmチャートがメトリクス収集の設定にしか対応していない。

> - https://github.com/aws-observability/aws-otel-helm-charts

#### ▼ Terraformの場合

Terraformを使用する場合、カスタムリソースでOpenTelemetryコレクターを作成することになる。

EKSアドオンは、OpenTelemetry Collector Operatorをデプロイする。

Terraformの`aws_eks_addon`でEKSアドオンをインストールし、OpenTelemetryコレクターのOperatorに関するKubernetesリソースを作成する。

```terraform
# AWS EKSアドオンをインストールする。
resource "aws_eks_addon" "aws_ebs_csi_driver" {

  cluster_name                = data.aws_eks_cluster.cluster.name
  addon_name                  = "adot"
  addon_version               = "<バージョン>"
  service_account_role_arn    = module.iam_assumable_role_open_telemetry_operator[0].iam_role_arn
  # Terraformで設定を上書きできるようにする
  resolve_conflicts_on_update = "OVERWRITE"
}
```

OpenTelemetryコレクターのカスタムリソースを作成する。

ここでは、分散トレーシングを送信するとする。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: foo-open-telemetry-collector
spec:
  mode: deployment
  serviceAccount: open-telemetry-collector
  config: |

    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318

    processors:
      batch/traces:
        timeout: 5s
        send_batch_size: 50

    exporters:
      # 宛先はx-rayとする
      awsxray:
        region: ap-northeast-1

    # open-telemetry-collectorの前段のServiceを設定する
    service:
      pipelines:
        traces:
          receivers:
            - otlp
          processors: 
            - batch/traces
          exporters: 
            - awsxray
```

> - https://zenn.dev/nameless_gyoza/articles/aws-distro-for-opentelemetry-with-datadog-handson
> - https://zenn.dev/tmrekk/articles/689cae0e9b41bd

<br>
