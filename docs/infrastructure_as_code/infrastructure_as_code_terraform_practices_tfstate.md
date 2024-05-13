---
title: 【IT技術の知見】tfstateファイルの分割＠プラクティス集
description: tfstateファイルの分割＠プラクティス集の知見を記録しています。
---

# `tfstate`ファイルの分割＠プラクティス集

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `tfstate`ファイルの分割について

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/07/05/001756

<br>

## 02. ローカル/リモートモジュールのディレクトリ構成

ここから先の話は遊びみたいなもんです👶🏻

ローカルモジュールとリモートモジュールは、”汎用的に使用できる`resource`ブロックや`data`ブロックのセット” である。

これらは、モジュールがローカルリポジトリまたはリモートリポジトリのいずれにあるかの違いしかない。

そのため、このディレクトリ構成はローカル / リモートモジュールの両方に適用できる。

ローカルモジュールに関して、これをリポジトリ内で汎用的に使い回すユースケースのみ作成するべきである。

そのためローカルモジュールに関しては、

- そもそもローカルモジュールを制限使用にする
- ローカルモジュールは自前リモートモジュール化する
- 公式リモートモジュールを使用する

のほうが良い。

ローカル/リモートモジュールのディレクトリ構成に関して、**`tfstate`ファイルは粒度に関係ないので、これといった目安はない**が、参考までに今までに観測したことのある例をあげた。

<br>

### 依存先AWSリソース別

依存先の多いAWSリソースに関して、依存先のAWSリソース別にローカルモジュールを分割する。

依存先AWSリソース別の分割方法は、Terraformの公式リモートモジュールに一番多い構成である。

**＊例＊**

ローカルモジュールの場合

ただ前述の通り、ローカルモジュールの使用するかどうかは考え直したほうが良い。

```yaml
aws-repository/
└── modules/ # ローカルモジュール
    └── eks/ # EKS
        ├── auto_scaling/ # AutoScaling
        │   ├── main.tf
        │   ├── outputs.tf
        │   └── variables.tf
        │
        ├── iam/ # IAMロール
        │   ├── main.tf
        │   ├── outputs.tf
        │   └── variables.tf
        │
        ├── kubernetes/ # Kubernetesリソース（例：RoleBinding、StorageClass、など）
        │   ├── main.tf
        │   ├── outputs.tf
        │   └── variables.tf
        │
        ├── launch_template/ # 起動テンプレート
        │   ├── main.tf
        │   ├── outputs.tf
        │   └── variables.tf
        │
        ├── security_group/ # セキュリティグループ
        │   ├── main.tf
        │   ├── outputs.tf
        │   └── variables.tf
        │
        └── node_group/ # Nodeグループ
            ├── main.tf
            ├── outputs.tf
            └── variables.tf
```

**＊例＊**

リモートモジュールの場合

```yaml
aws-remote-repository/
└── eks/ # EKS
    ├── auto_scaling/ # AutoScaling
    │   ├── main.tf
    │   ├── outputs.tf
    │   └── variables.tf
    │
    ├── iam/ # IAMロール
    │   ├── main.tf
    │   ├── outputs.tf
    │   └── variables.tf
    │
    ├── kubernetes/ # Kubernetesリソース（例：RoleBinding、StorageClass、など）
    │   ├── main.tf
    │   ├── outputs.tf
    │   └── variables.tf
    │
    ├── launch_template/ # 起動テンプレート
    │   ├── main.tf
    │   ├── outputs.tf
    │   └── variables.tf
    │
    ├── security_group/ # セキュリティグループ
    │   ├── main.tf
    │   ├── outputs.tf
    │   └── variables.tf
    │
    └── node_group/ # Nodeグループ
        ├── main.tf
        ├── outputs.tf
        └── variables.tf
```

<br>

### リソース別

最上層は、AWSリソースで分割する。

またスクリプトを使用するAWSリソース（例：Lambda）では、そのソースコードをモジュール下で管理する。

**＊例＊**

ローカルモジュールの場合

ただ前述の通り、ローカルモジュールの使用するかどうかは考え直したほうが良い。

```yaml
aws-repository/
└── modules/ # ローカルモジュール
    ├── acm/ # ACM
    ├── alb/ # ALB
    ├── lambda/ # Lambda
    │   ├── foo_function_src/ # とある関数のソースコード
    ...
```

**＊例＊**

リモートモジュールの場合

```yaml
aws-remote-repository/
├── acm/ # ACM
├── alb/ # ALB
├── lambda/ # Lambda
│   ├── foo_function_src/ # とある関数のソースコード
    ...
```

<br>

### リージョン別

AWSリソースのプロビジョニング先のリージョン別にローカルモジュールを分割する。

例えば、ACMは同じリージョンのAWSリソースにしかアタッチできない制約があるため、AWSリソースによっては複数リージョン必要になる。

**＊例＊**

ローカルモジュールの場合

ただ前述の通り、ローカルモジュールの使用するかどうかは考え直したほうが良い。

```yaml
aws-repository/
└── modules/ # ローカルモジュール
    └── acm/ # ACM
        ├── ap-northeast-1/ # 東京リージョン
        └── us-east-1/      # バージニアリージョン

```

**＊例＊**

リモートモジュールの場合

```yaml
aws-remote-repository/
└── acm/ # ACM
    ├── ap-northeast-1/ # 東京リージョン
    └── us-east-1/      # バージニアリージョン
```

<br>

### 実行環境別

環境ごとに差分が大きいAWSリソースに関して、実行環境別にローカルモジュールを分割する。

なおcountで条件分岐しても良い

**＊例＊**

ローカルモジュールの場合

ただ前述の通り、ローカルモジュールの使用するかどうかは考え直したほうが良い。

```yaml
aws-repository/
└── modules/ # ローカルモジュール
    ├── route53/ # Route53
    │   ├── tes/ # テスト環境
    │   ├── stg/ # ステージング環境
    │   └── prd/ # 本番環境
    │
    ├── ssm/ # Systems Manager
    │   ├── tes/
    │   ├── stg/
    │   └── prd/
    │
    └── waf/ # WAF
        └── alb/
            ├── tes/
            ├── prd/
            └── stg/
```

**＊例＊**

リモートモジュールの場合

```yaml
aws-remote-repository/
├── route53/ # Route53
│   ├── tes/ # テスト環境
│   ├── stg/ # ステージング環境
│   └── prd/ # 本番環境
│
├── ssm/ # Systems Manager
│   ├── tes/
│   ├── stg/
│   └── prd/
│
└── waf/ # WAF
    └── alb/
        ├── tes/
        ├── prd/
        └── stg/
```

<br>

## 03. モノリスな`tfstate`ファイルを分割する

モノリスな`tfstate`ファイルとは、例えば特定のAWSアカウント内のAWSリソースを全て一つの`tfstate`ファイルで管理している場合である。

AWSリソース値を参照しない関係であれば、これらは別の`tfstate`ファイルに分割できる。

`(1)`

: 既存のバックエンド内に新しいディレクトリを作成し、その配下に`tfstate`ファイルを新しく作成する。

     ここでは、サブシステムを分割すると仮定する。

```yaml
repository/
├── foo/
│   ├── backend.tf # バックエンド内の/foo/terraform.tfstate
│   ├── provider.tf
│   ...
│
├── bar/
│   ├── backend.tf # バックエンド内の/bar/terraform.tfstate
│   ├── remote_state.tfvars # terraform_remote_stateブロックを使用し、fooのtfstateファイルから状態を参照する
│   ├── resource.tf # fooのtfstateファイルから参照した状態を使用する
│   ├── provider.tf
│   ...
│
...
```

```terraform
terraform {
  backend "s3" {
    bucket = "foo-tfstate"
    key    = "foo-sub-system/terraform.tfstate"
    region = "ap-northeast-1"
  }
}
```

`(2)`

: bar側では、foo側の`tfstate`ファイルからリソース値を取得しつつ、

```terraform
# 分割した異なるfooというtfstateファイルから取得する
data "terraform_remote_state" "foo" {
  backend = "s3"

  config = {
    bucket = "foo-tfstate"
    key    = "foo/terraform.tfstate"
    region = "ap-northeast-1"
  }
}
```

`(3)`

: 新しい`tfstate`ファイルに、既存のサブシステムの状態をインポートする。

     事前に、バックエンドを新しいサブシステムの`tfstate`ファイルに切り替える。

```bash
$ terraform init -reconfigure -backend-config=foo-sub-backend.tfvars
$ terraform import
```

`(4)`

: サブシステムの`tfstate`ファイルで差分がないことを確認する。

```bash
$ terraform init -reconfigure -backend-config=foo-sub-backend.tfvars
$ terraform plan
```

`(5)`

: モノリスな`tfstate`ファイルから、サブシステムの状態を削除する。

     事前に、バックエンドをモノリスな`tfstate`ファイルに切り替える。

```bash
$ terraform init -reconfigure -backend-config=foo-backend.tfvars
$ terraform state rm <サブシステムの状態>
```

<br>
