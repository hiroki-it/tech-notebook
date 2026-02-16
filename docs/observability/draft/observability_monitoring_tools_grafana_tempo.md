---
title: 【IT技術の知見】Grafana Tempo＠Grafana
description: Grafana Tempo＠Grafanaの知見を記録しています。
---

# Grafana Tempo＠Grafana

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

## 01. セットアップ

### AWS側

```terraform
module "iam_assumable_role_with_oidc_grafana_tempo" {

  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"

  version                       = "<バージョン>"

  # Grafana LokiのPodに紐付けるIAMロール
  create_role                   = true
  role_name                     = "foo-grafana-tempo"

  # AWS EKS ClusterのOIDCプロバイダーURLからhttpsプロトコルを除いたもの
  provider_url                  = replace(module.eks.cluster_oidc_issuer_url, "https://", "")

  # AWS IAMロールに紐付けるIAMポリシー
  role_policy_arns              = aws_iam_policy.grafana_tempo.arn

  # Grafana LokirのPodのServiceAccount名
  # ServiceAccountは、Terraformではなく、マニフェストで定義したほうが良い
  oidc_fully_qualified_subjects = [
    "system:serviceaccount:grafana-tempo:grafana-tempo"
  ]
}
```

```terraform
resource "aws_iam_role_policy" "grafana_tempo" {
  name = "grafana-tempo"
  role = aws_iam_role.grafana_tempo.id

  # AWS S3をトレースのオブジェクトストレージとして使用する
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
module "s3_grafana_tempo" {
    source = "terraform-aws-modules/s3-bucket/aws"
    version = "4.6.0"

    bucket = "grafana-tempo-logs-bucket"
    object_ownership = "BucketOwnerPreferred"

    versioning = {
        enabled = true
    }
}
```

<br>

## 02. アラート

Grafana Tempoを条件としたアラートを作成できない。

> - https://github.com/grafana/tempo/discussions/2082#discussioncomment-4898549

<br>
