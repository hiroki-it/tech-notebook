---
title: 【IT技術の知見】Grafana Loki＠Grafana
description: Grafana Loki＠Grafanaの知見を記録しています。
---

# Grafana Loki＠Grafana

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### AWS側

```terraform
module "iam_assumable_role_with_oidc_grafana_loki" {

  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"

  version                       = "<バージョン>"

  # Grafana LokiのPodに紐付けるIAMロール
  create_role                   = true
  role_name                     = "foo-grafana-loki"

  # AWS EKS ClusterのOIDCプロバイダーURLからhttpsプロトコルを除いたもの
  provider_url                  = replace(module.eks.cluster_oidc_issuer_url, "https://", "")

  # AWS IAMロールに紐付けるIAMポリシー
  role_policy_arns              = aws_iam_policy.grafana_loki.arn

  # Grafana LokirのPodのServiceAccount名
  # ServiceAccountは、Terraformではなく、マニフェストで定義した方が良い
  oidc_fully_qualified_subjects = [
    "system:serviceaccount:grafana-loki:grafana-loki"
  ]
}
```

```terraform
resource "aws_iam_role_policy" "grafana_loki" {
  name = "grafana-loki"
  role = aws_iam_role.grafana_loki.id

  # AWS S3をログのオブジェクトストレージとして使用する
  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketLocation",
          "s3:DeleteObject"
        ],
        "Resource": [
          "*"
        ]
      }
    ]
  })
}
```

```terraform
module "grafana_loki" {
    source = "terraform-aws-modules/s3-bucket/aws"
    version = "4.6.0"

    bucket = "grafana-loki-logs-bucket"
    object_ownership = "BucketOwnerPreferred"

    versioning = {
        enabled = true
    }
}
```

<br>

## 02. 機能

### アラート

Grafana LokiのRulerでログを条件としたアラートを作成し、Alertmanagerに送信する。

> - https://d.zinrai.net/public/posts/log-monitoring-using-grafana-loki/
> - https://medium.com/@jieshiun/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8-grafana-loki-%E8%AD%A6%E5%A0%B1%E8%A6%8F%E5%89%87%E4%B8%A6%E9%80%8F%E9%81%8E-alertmanager-%E7%99%BC%E9%80%81%E8%AD%A6%E5%91%8A-723b50f6245a

<br>
