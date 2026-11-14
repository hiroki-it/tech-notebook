---
title: 【IT技術の知見】CLB
description: CLBの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
  - "Load Balancer"
---

# CLB

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要

キューを持ち、クラウド `L4`/`L7` ロードバランサーとして働く。

<br>

## 02. 仕組み

ALB、NLB、ではもともと実装されていたキューを廃止した経緯がある。

> - [Elastic Load Balancing 容量のトラブルシューティング \| AWS re:Post](https://repost.aws/ja/knowledge-center/elb-capacity-troubleshooting)
> - https://stackoverflow.com/a/49421971

<br>

## 03. セットアップ

### Terraformによる構築

terraform-aws-modules の ELB モジュールを使用し、HTTP リクエストを 2 台の EC2 インスタンスへ転送する CLB を作成する。

既存のパブリックサブネット、CLB 用のセキュリティグループ、EC2 インスタンスを指定する。

CLB のセキュリティグループではクライアントからの 80 番ポートへの通信と EC2 への送信を許可し、EC2 側では CLB のセキュリティグループからの 80 番ポートへの通信を許可しておく。

EC2 上のアプリケーションには、`/health` へのヘルスチェックに成功するエンドポイントを用意しておく。

```terraform
module "clb" {
  source  = "terraform-aws-modules/elb/aws"
  version = "4.0.3"

  name            = "foo-clb"
  subnets         = ["subnet-0123456789abcdef0", "subnet-0123456789abcdef1"]
  security_groups = ["sg-0123456789abcdef0"]

  listener = [
    {
      lb_port           = 80
      lb_protocol       = "HTTP"
      instance_port     = 80
      instance_protocol = "HTTP"
    }
  ]

  health_check = {
    target              = "HTTP:80/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  number_of_instances = 2
  instances           = ["i-0123456789abcdef0", "i-0123456789abcdef1"]
}
```

> - [terraform-aws-modules/elb/aws (4.0.3) - Terraform Registry](https://registry.terraform.io/modules/terraform-aws-modules/elb/aws/4.0.3)

<br>
