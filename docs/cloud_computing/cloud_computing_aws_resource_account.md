---
title: 【IT技術の知見】アカウント
description: アカウントの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# アカウント

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要

AWS リソースの所有と利用料金の請求を管理し、リソースへのアクセスを分離する単位である。

> - [What is an AWS account? - AWS Account Management](https://docs.aws.amazon.com/accounts/latest/reference/accounts-welcome.html)

<br>

## 02. 仕組み

### アカウント・リージョン・AZ

#### AWS アカウント

AWS リソースの操作単位である。

Web サイトのクラウドインフラの実行環境ごとに作成したほうがよい。

アカウント ID は機密ではないため、仮にバージョン管理してしまうようなことがあっても問題ない。

> - [View AWS account identifiers - AWS Account Management](https://docs.aws.amazon.com/accounts/latest/reference/manage-acct-identifiers.html)
> - [Are AWS account IDs sensitive information? - Last Week in AWS Blog](https://www.lastweekinaws.com/blog/are-aws-account-ids-sensitive-information/)

<br>

#### リージョン

##### ▼ リージョンとは

物理サーバーがあるデータセンターの地域名のこと。

##### ▼ グローバルサービス

グローバルサービスは、物理サーバーが世界中にあり、これらの間ではパブリックネットワークが作成されている。

そのため、特定のリージョンに依存せず、すべてのリージョンと連携できる。

![edge-location](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/edge-location.png)

##### ▼ リージョン間ネットワーク遅延

同じリージョン内よりも異なるリージョン間のほうがレイテンシー (≒レスポンスタイム) は大きくなる。

`cloudping.so` というサイトで、リージョン間のレイテンシーの大きさを確認できる。

例えば、Tokyo (`ap-northeast-1`) から Virginia (`us-east-1`) への通信の色で、レイテンシーの程度がわかる。

> - https://www.cloudping.co/grid
> - [GitHub - mda590/cloudping.co: AWS Inter-Region Latency Monitoring · GitHub](https://github.com/mda590/cloudping.co)

<br>

#### AZ：Availability Zones

##### ▼ AZ とは

リージョンは、各データセンターは物理的に独立した AZ というロケーションから構成されている。

例えば、東京リージョンには、`3` 個の AZ (`a`、`c`、`d`) がある。

AZ に跨いで冗長化すると、いずれかのデータセンターで障害が起こっても、残った AZ 上でシステムを稼働し続けられる (可用性を高められる) 。

もし、AZ を跨いで作成できないような AWS リソースの場合は、リージョンを跨ぐようにする。

<br>

## 03. セットアップ

### Terraformによる構築

terraform-aws-modules の IAM Account モジュールを使用し、既存の AWS アカウントにエイリアスと IAM ユーザーのパスワードポリシーを設定する。エイリアスには一意の名前を指定する。

```terraform
variable "account_alias" {
  type = string
}

module "iam_account" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-account"
  version = "6.8.2"

  account_alias           = var.account_alias
  minimum_password_length = 14
}
```

> - [terraform-aws-modules/iam/aws//modules/iam-account (6.8.2) - Terraform Registry](https://registry.terraform.io/modules/terraform-aws-modules/iam/aws/6.8.2/submodules/iam-account)

<br>

## 04. タグによるリソースの分類

### タグ付け戦略

#### ▼ よくあるタグ

<table>
  <thead>
    <tr>
      <th>タグ名</th>
      <th>用途</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Environment</td>
      <td>同じ AWS アカウント内に異なる実行環境が存在している場合、それらを区別するために、実行環境名を設定する。</td>
      <td><code>prd</code></td>
    </tr>
    <tr>
      <td>Name</td>
      <td>リソース自体に名前を付けられない場合、代わりにタグによる名前を設定する。</td>
      <td><code>prd-foo-instance</code></td>
    </tr>
    <tr>
      <td>ManagedBy</td>
      <td>クラウドプロビジョニングツールを使用して AWS リソースを作成している場合、そのツール名を設定する。</td>
      <td><code>terraform</code></td>
    </tr>
    <tr>
      <td>Repository</td>
      <td>クラウドプロビジョニングツールを使用して AWS リソースを作成している場合、ツールの実装を管理しているリポジトリの URL を設定する。</td>
      <td><code>https://github.com/*****</code></td>
    </tr>
    <tr>
      <td>Service</td>
      <td>同じ AWS アカウント内に複数のプロダクトが存在している場合、そのプロダクト名を設定する。</td>
      <td><code>foo</code></td>
    </tr>
    <tr>
      <td>User</td>
      <td>同じ AWS アカウント内に複数のリソース使用者が存在している場合、それらを区別できるように、使用者名を設定する。</td>
      <td><code>hiroki-hasegawa</code></td>
    </tr>
  </tbody>
</table>

#### ▼ タグ付けによる検索

AWS の各リソースには、タグをつけられる。

例えば、AWS コストエクスプローラーにて、このタグで検索することにより、任意のタグが付いたリソースの請求合計額を確認できる。

<br>
