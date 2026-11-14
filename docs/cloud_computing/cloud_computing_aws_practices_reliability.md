---
title: 【IT技術の知見】信頼性
description: 信頼性の知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "プラクティス集"
---

# 信頼性

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要

障害からの復旧や負荷の変化への対応により、システムが期待される機能を継続して提供できる能力である。

> - [Reliability Pillar - AWS Well-Architected Framework - Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html)

<br>

## 02. 仕組み

## 03. セットアップ

### Terraformによる構築

terraform-aws-modules の VPC モジュールを使用し、2 つの AZ にパブリックサブネットとプライベートサブネットを配置し、AZ ごとに NAT Gateway を作成する。AWS プロバイダーのリージョンは ap-northeast-1 とする。

```terraform
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "6.7.3"

  name = "foo-multi-az"
  azs  = ["ap-northeast-1a", "ap-northeast-1c"]

  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.11.0/24", "10.0.12.0/24"]

  enable_nat_gateway     = true
  one_nat_gateway_per_az = true
}
```

> - [terraform-aws-modules/vpc/aws (6.7.3) - Terraform Registry](https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/6.7.3)

<br>

## 04. 障害への対処と冗長化

### インシデント管理

インシデント管理ツール (例：PagerDuty、Grafana OnCall、AWS Incident Manager、Slack Apps) を採用し、障害をオンコール担当者に迅速に通知する。

> - [Failure management - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/rel-failmgmt.html)

<br>

### 冗長化

#### ▼ マルチ AZ

マルチ AZ を採用する。

それぞれの AZ に Amazon EC2/ECS を冗長化する。

特定の AZ で障害が発生した場合、AWS ALB を起点として、インバウンド通信の向き先を正常な AZ の Amazon EC2/ECS に切り替える。

#### ▼ AWS NAT Gateway

AWS NAT Gateway を冗長化する。

AWS NAT Gateway を AZ 別に用意する。これにより、特定の AZ で障害が起こっても、他の AZ のアウトバウンド通信へ影響しないようにする。

#### ▼ Auto Scaling Group

Auto Scaling Group を採用する。

Amazon EC2 で障害が発生した場合、AWS ALB を起点にして、正常な Amazon EC2 に切り替える。

#### ▼ Amazon EKS マネージド Node グループ

Amazon EKS マネージド Node グループを採用する。

Amazon EC2 Node で障害が発生した場合、AWS ALB を起点にして、正常な Amazon EC2 に切り替える。

#### ▼ Amazon Aurora

Amazon Aurora でフェイルオーバーを採用する。

プライマリーインスタンスで障害が発生した場合、フェイルオーバーにより、リードレプリカがプライマリーインスタンスに昇格します。

<br>

### スケーリング

#### ▼ Amazon EKS マネージド Node グループ

Amazon EC2 Node のスケールアップには、Cluster Autoscaler、Amazon EKS マネージド Node グループを採用する。

Cluster Autoscaler と Amazon EKS マネージド Node グループ、では、Pod による Amazon EC2 Node の負荷に応じて Amazon EC2 Node をスケーリングする。

#### ▼ Auto Scaling Group

Amazon EC2 のスケールアップには、Auto Scaling Group を採用する。

Auto Scaling Group では、Amazon EC2 のハードウェアリソース (CPU、メモリ) の消費率に応じて、自動水平スケーリングします。

<br>

## 05. 災害復旧

### DR リージョン (BCP リージョン) とは

『BCP リージョン』ともいう。

メインリージョンで災害が起こった場合に、システムの障害にならないように、災害回復用リージョンを用意しておく。

> - [Failure management - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/rel-failmgmt.html)

<br>

### バックアップリストア構成

![dr-architecture_backup-restore](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dr-architecture_backup-restore.png)

DR リージョンにメインリージョンの AWS リソース (例：EBS ボリューム、RDS) のスナップショットを定期的に作成しておく。

メインリージョンで障害が起こった場合は、スナップショットを使用して、DR リージョンに AWS リソースを復元する。

DR リージョンの準備が完了次第、DR リージョンにリクエストをルーティングできるようにする。

障害が起こってから対応することが多いため、RTO が長くなってしまう。

RPO は最後のバックアップ時点である。

一方で金銭的コストが低い。

> - [AWS でのディザスタリカバリ (DR) アーキテクチャ、パートI：クラウドでのリカバリの戦略 \| Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/disaster-recovery-dr-architecture-on-aws-part-1-strategies-for-recovery-in-the-cloud/)
> - [AWS 上でのディザスタリカバリ (DR) 構成 4 パターン \| michimani log](https://michimani.net/post/aws-architecture-for-disaster-recovery/)
> - [バックアップ・リストアによる BCP 対策のためのクラウド構成と料金試算例 \| AWS](https://aws.amazon.com/jp/cdp/cdp-dr/)

<br>

### パイロットライト構成

![dr-architecture_pilot-light](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dr-architecture_pilot-light.png)

DR リージョンに低スペックな DB を作成しておき、メインリージョンと DR リージョンの DB を定期的に同期しておく。

メインリージョンで障害が起こった場合は、DR リージョンで DB 以外のインフラコンポーネント (例：アプリケーション部分など) を作成し、また DB のスペックをメインリージョンと同等に上げる。

DR リージョンの準備が完了次第、DR リージョンにリクエストをルーティングできるようにする。

障害が起こってから対応することが多いため、RTO がやや長くなってしまう。

RPO は最後の同期時点である。

一方で金銭的コストが低い。

> - [AWS でのディザスタリカバリ (DR) アーキテクチャ、パートI：クラウドでのリカバリの戦略 \| Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/disaster-recovery-dr-architecture-on-aws-part-1-strategies-for-recovery-in-the-cloud/)
> - [AWS 上でのディザスタリカバリ (DR) 構成 4 パターン \| michimani log](https://michimani.net/post/aws-architecture-for-disaster-recovery/)

<br>

### ウォームスタンバイ構成

![dr-architecture_warm-standby](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dr-architecture_warm-standby.png)

DR リージョンにメインリージョンよりも低スペックなアプリケーションと DB を作成しておき、メインリージョンと DR リージョンの DB を定期的に同期しておく。

メインリージョンで障害が起こった場合は、DR リージョンでアプリケーションと DB のスペックをメインリージョンと同等に上げる。

DR リージョンの準備が完了次第、DR リージョンにリクエストをルーティングできるようにする。

障害が起こった後、スペックを向上させ、またルーティング先を切り替えるのみで回復できるため、RTO が短い。

RPO は最後の同期時点である。

一方で、金銭的コストが高い。

> - [AWS でのディザスタリカバリ (DR) アーキテクチャ、パートI：クラウドでのリカバリの戦略 \| Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/disaster-recovery-dr-architecture-on-aws-part-1-strategies-for-recovery-in-the-cloud/)
> - [AWS 上でのディザスタリカバリ (DR) 構成 4 パターン \| michimani log](https://michimani.net/post/aws-architecture-for-disaster-recovery/)

<br>

### マルチサイトアクティブ構成

![dr-architecture_multi-site-active](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dr-architecture_multi-site-active.png)

DR リージョンにメインリージョンと同等のアプリケーションと DB を作成しておき、メインリージョンと DR リージョンの DB を定期的に同期しておく。

メインリージョンで障害が起こった場合は、DR リージョンにリクエストをルーティングできるようにする。

障害が起こった後、ルーティング先を切り替えるのみで回復できるため、RTO が短い。

RPO は最後の同期時点である。

一方で、金銭的コストが高い。

> - [AWS でのディザスタリカバリ (DR) アーキテクチャ、パートI：クラウドでのリカバリの戦略 \| Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/disaster-recovery-dr-architecture-on-aws-part-1-strategies-for-recovery-in-the-cloud/)
> - [AWS 上でのディザスタリカバリ (DR) 構成 4 パターン \| michimani log](https://michimani.net/post/aws-architecture-for-disaster-recovery/)

<br>
