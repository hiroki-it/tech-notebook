---
title: 【IT技術の知見】モジュール＠Terraform
description: モジュール＠Terraformの知見を記録しています。
---

# モジュール＠Terraform

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ルートモジュール

### ルートモジュールとは

`terraform`コマンドの実行に最低限必要な`.tf`ファイルを配置する。

ルートモジュールのみでも問題なく動作するが、チャイルドモジュールを使用する場合、これをコールする実装が必要になる。

> - https://www.terraform.io/language/modules#the-root-module

<br>

## 01-02. ルートモジュールの実装

### `terraform`ブロック

#### ▼ `terraform`ブロックとは

ルートモジュールで、`terraform`コマンドの実行時に、エントリーポイントとして動作する。

#### ▼ required_providers

AWSやGoogle Cloudなど、使用するプロバイダを定義する。

プロバイダによって、異なる`resource`タイプが提供される。

一番最初に読みこまれるファイルのため、通常変数やモジュール化などが行えない。

**＊実装例＊**

```terraform
# @ルートモジュール

terraform {

  required_providers {
    # awsプロバイダを定義
    aws = {
      # グローバルソースアドレスを指定
      source  = "hashicorp/aws"

      # プロバイダーのバージョン変更時は initを実行
      version = "3.0"
    }
  }
}
```

#### ▼ `backend`ブロック

インフラの状態ファイル (`tfstate`ファイル) を管理する場所を設定する。

S3などの実インフラで管理する場合、資格情報を設定する必要がある。

代わりに、`terraform init`コマンド実行時に指定しても良い。

デフォルト値は`local`である。

通常変数を使用できず、ハードコーディングする必要があるため、もし値を動的に変更したい場合は、ローカルマシンでは`providers.tf`ファイルの`backend`オプションを参照し、CDの中で`terraform init`コマンドのオプションを使用して値を渡すようにする。

> - https://www.terraform.io/language/settings/backends/s3

**＊実装例＊**

```terraform
# @ルートモジュール

terraform {

  # ローカルマシンで管理するように設定
  backend "local" {
    path = "${path.module}/terraform.tfstate"
  }
}
```

```terraform
# @ルートモジュール

terraform {

  # AWS S3で管理するように設定
  backend "s3" {
    # バケット名
    bucket                  = "prd-foo-tfstate-bucket"
    # tfstateファイル名
    key                     = "terraform.tfstate"
    region                  = "ap-northeast-1"
    # 資格情報ファイルへのパス
    shared_credentials_file = "$HOME/.aws/credentials"
    # 資格情報ファイルのプロファイル名
    profile                 = "bar-profile"
  }
}
```

どのユーザーもバケット内のオブジェクトを削除できないように、ポリシーを設定しておくと良い。

**＊実装例＊**

```yaml
{
  "Version": "2008-10-17",
  "Statement":
    [
      {
        "Effect": "Deny",
        "Principal": "*",
        "Action": "s3:DeleteObject",
        "Resource": "arn:aws:s3:::prd-foo-tfstate-bucket/*",
      },
    ],
}
```

<br>

### `provider`ブロック

#### ▼ `provider`ブロックとは

ルートモジュールで、Terraformで操作するクラウドインフラベンダーを設定する。

ベンダーでのアカウント認証のため、資格情報を渡す必要がある。

**＊実装例＊**

```terraform
# @ルートモジュール

terraform {
  required_version = "1.3.0"

  required_providers {
    # awsプロバイダを定義
    aws = {
      # 何らかの設定
    }
  }

  backend "s3" {
    # 何らかの設定
  }
}

# awsプロバイダを指定
provider "aws" {
  # アクセスキー、シークレットアクセスキー、はハードコーディングしない。

  # デフォルト値とするリージョン名
  region = "ap-northeast-1"
}
```

**＊実装例＊**

`terraform`ブロックとは異なり、`provider`ブロックでは変数を使用できる。

```terraform
# @ルートモジュール

terraform {
  # 変数を使用できない
}

# awsプロバイダを指定
provider "aws" {

  # 出力
  region = var.region
}
```

```terraform
# リージョンは変数として定義しておく
region = "ap-northeast-1"
```

**＊実装例＊**

```terraform
# @ルートモジュール

terraform {
  required_version = "1.3.0"

  required_providers {
    # gcpプロバイダを定義
    gcp = {
      # 何らかの設定
    }
  }

  backend "gcs" {
    # 何らかの設定
  }
}

# gcpプロバイダを指定
provider "google" {
  # アクセスキー、シークレットアクセスキー、はハードコーディングしない。

  # デフォルト値とするリージョン名
  region = "asia-northeast1"
}
```

**＊実装例＊**

PagerDutyの状態をAWS S3バケットで管理する場合。

```terraform
terraform {

  backend "s3" {}

  required_version = "1.3.0"

  required_providers {

    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.19.0"
    }

    pagerduty = {
      source  = "pagerduty/pagerduty"
      version = ">= 2.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
}

provider "pagerduty" {
  token = "<PagerDutyのトークン>"
}
```

#### ▼ マルチprovidersとは

複数の`provider`ブロックを実装し、エイリアスを使用して、これらを動的に切り替える方法。

**＊実装例＊**

```terraform
# @ルートモジュール

terraform {
  required_version = "1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "3.0"
    }
  }
}

provider "aws" {
  # デフォルト値とするリージョン
  region = "ap-northeast-1"
}

provider "aws" {
  # 別リージョン
  alias  = "ue1"
  region = "us-east-1"
}
```

#### ▼ default_tags

Terraformで作成するリソースに一括してタグを設定できる。

**＊実装例＊**

```terraform
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.67.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"

  default_tags {
    tags = local.tags
  }
}

locals {
  service = "foo"
  # プロダクト名
  name    = "bar"

  tags = {
    Service   = local.service
    Env       = var.env
    # 管理するリポジトリ
    ManagedBy = "https://github.com/hiroki-hasegawa/foo-terraform.git"
  }
}
```

反対に、default_tagsを無効化する`provider`ブロックを定義しておくと良い。

**＊実装例＊**

```terraform
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.67.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"

  default_tags {
    tags = local.tags
  }
}

# デフォルトタグを無効化したいリソースでは、こちらのプロバイダーを設定する
provider "aws" {
  region = "ap-northeast-1"
  alias  = "disable_default_tags"
}

# デフォルトタグあり
resource "aws_s3_bucket" "foo" {
  bucket = "foo-bucket"
}

# デフォルトタグ無し
resource "aws_s3_bucket" "bar" {
  provider = aws.disable_default_tags

  bucket = "bar-bucket"
}
```

> - https://dev.to/drewmullen/terraform-prevent-defaulttags-on-a-specific-resource-n19

#### ▼ モジュールに渡すプロバイダーを切り替える

モジュールにプロバイダーをパラメーターとして設定する場合、`provider`ブロックを使用する。

**＊実装例＊**

```terraform
# @ルートモジュール

module "route53" {
  source = "../modules/route53"

  providers = {
    aws = aws.ue1
  }

  # その他の設定値
}
```

加えてモジュールに`provider`ブロックでオプションを設定する必要がある。

**＊実装例＊**

```terraform
# @ルートモジュール

# ---------------------------------------------
# AWS Route53
# ---------------------------------------------
resource "aws_acm_certificate" "example" {
  # CloudFrontの仕様のため、us-east-1リージョンでサーバー証明書を作成します。
  provider = aws

  domain_name               = "example.com"
  subject_alternative_names = [
    "*.example.com"
  ]
  validation_method         = "DNS"

  tags = {
    Name = "prd-foo-cert"
  }

  lifecycle {
    create_before_destroy = true
  }
}
```

#### ▼ バージョン表記について

| 表記 | 説明                             |
| ---- | -------------------------------- |
| `~>` | 指定したバージョンを上限とする。 |
| `=`  | 指定したバージョンで固定する。   |

> - https://dev.classmethod.jp/articles/about-terraform-version-required-constraints/

<br>

### `module`ブロック

#### ▼ `module`ブロックとは

ルートモジュールで、ローカルモジュールやリモートモジュールをコールし、オプションを設定する。

> - https://www.terraform.io/language/modules/sources
> - https://qiita.com/bigwheel/items/2b420183639416b5c6bb
> - https://registry.terraform.io/namespaces/terraform-aws-modules

#### ▼ ローカルモジュールをコールする場合

ローカルモジュールをコールし、オプションを設定する。

**＊実装例＊**

```terraform
# @ルートモジュール

# ---------------------------------------------
# ALB
# ---------------------------------------------
module "alb" {
  # ローカルモジュールを参照する。
  source = "../modules/alb"

  # ローカルモジュールに、他のローカルモジュールのoutputブロックを渡す。
  acm_certificate_api_arn = module.acm.acm_certificate_api_arn
}
```

#### ▼ リモートモジュールをコールする場合

リモートモジュールをコールし、オプションを設定する。

外部リポジトリとしては、GitHub、Terraformレジストリ、AWS S3、Google Cloud Storageなどを指定できる。

リポジトリの認証時にベーシック認証やSSH公開鍵認証で接続できるが、鍵の登録が不要なベーシック認証の方が簡単である。

**＊実装例＊**

```terraform
# @ルートモジュール

# ---------------------------------------------
# ALB
# ---------------------------------------------
module "alb" {
  # リモートモジュールを参照する。
  # SSHの場合
  source = "git::https://github.com/hiroki-hasegawa/terraform-alb-modules.git"

  # ローカルモジュールに、他のリモートモジュールのoutputブロックを渡す。
  acm_certificate_api_arn = module.acm.acm_certificate_api_arn
}
```

**＊実装例＊**

サブディレクトリを指定することもできる。リポジトリ以下にスラッシュを２つ (`//`) つけ、その後にパスを続ける。

```terraform
# @ルートモジュール

# ---------------------------------------------
# ALB
# ---------------------------------------------
module "alb" {
  # リモートモジュールを参照する。
  # SSHの場合
  source = "git::https://github.com/hiroki-hasegawa/terraform-alb-modules.git//module/sub-directory"

  # ローカルモジュールに、他のリモートモジュールのoutputブロックを渡す。
  acm_certificate_api_arn = module.acm.acm_certificate_api_arn
}
```

> - https://www.terraform.io/language/modules/sources#modules-in-package-sub-directories

**＊実装例＊**

特定のタグを指定できる。

```terraform
# @ルートモジュール

# ---------------------------------------------
# ALB
# ---------------------------------------------
module "alb" {
  # リモートモジュールを参照する
  # タグを指定する
  source = "git::https://github.com/hiroki-hasegawa/terraform-alb-modules.git?ref=v1.2.0"

  # ローカルモジュールに、他のリモートモジュールのoutputブロックを渡す
  acm_certificate_api_arn = module.acm.acm_certificate_api_arn
}
```

> - https://developer.hashicorp.com/terraform/language/modules/sources#selecting-a-revision

特定のブランチを指定できる。

```terraform
# @ルートモジュール

# ---------------------------------------------
# ALB
# ---------------------------------------------
module "alb" {
  # リモートモジュールを参照する
  # ブランチを指定する
  source = "git::https://github.com/hiroki-hasegawa/terraform-alb-modules.git?ref=foo_branch"

  # ローカルモジュールに、他のリモートモジュールのoutputブロックを渡す
  acm_certificate_api_arn = module.acm.acm_certificate_api_arn
}
```

> - https://stackoverflow.com/a/69226878

特定のコミットIDを指定できる。

```terraform
# @ルートモジュール

# ---------------------------------------------
# ALB
# ---------------------------------------------
module "alb" {
  # リモートモジュールを参照する
  # コミットIDを指定する
  source = "git::https://github.com/hiroki-hasegawa/terraform-alb-modules.git?ref=51d462976d84fdea54b47d80dcabbf680badcdb8"

  # ローカルモジュールに、他のリモートモジュールのoutputブロックを渡す
  acm_certificate_api_arn = module.acm.acm_certificate_api_arn
}
```

> - https://developer.hashicorp.com/terraform/language/modules/sources#selecting-a-revision

<br>

### 環境変数

#### ▼ 環境変数の優先順位

> - https://www.terraform.io/language/values/variables#variable-definition-precedence

#### ▼ `-var`、`-var-file`

```bash
$ terraform plan -var="foo=foo"
$ terraform plan -var="foo=foo" -var="bar=bar"
```

```bash
$ terraform plan -var-file=foo.tfvars
```

#### ▼ `*.auto.tfvars`ファイル、`*.auto.tfvars.json`ファイル

#### ▼ `terraform.tfvars.json`ファイル

#### ▼ `terraform.tfvars`ファイル

実行ファイルに入力したい環境変数を定義する。

『`terraform.tfvars`』という名前にすると、`terraform`コマンドの実行時に自動的に読み込まれる。

```bash
# ファイルを指定しなくとも読み込まれる
$ terraform plan
```

**＊実装例＊**

```terraform
# @ルートモジュール

# ---------------------------------------------
# Variables RDS
# ---------------------------------------------
rds_parameter_group_values = {
  time_zone                = "asia/tokyo"
  character_set_client     = "utf8mb4"
  character_set_connection = "utf8mb4"
  character_set_database   = "utf8mb4"
  character_set_results    = "utf8mb4"
  character_set_server     = "utf8mb4"
  server_audit_events      = "connect,query,query_dcl,query_ddl,query_dml,table"
  server_audit_logging     = 1
  server_audit_logs_upload = 1
  general_log              = 1
  slow_query_log           = 1
  long_query_time          = 3
}

# ---------------------------------------------
# Variables VPC
# ---------------------------------------------
vpc_availability_zones             = { a = "a", c = "c" }
vpc_cidr                           = "*.*.*.*/23"
vpc_subnet_private_datastore_cidrs = { a = "*.*.*.*/27", c = "*.*.*.*/27" }
vpc_subnet_private_app_cidrs       = { a = "*.*.*.*/25", c = "*.*.*.*/25" }
vpc_subnet_public_cidrs            = { a = "*.*.*.*/27", c = "*.*.*.*/27" }

# ---------------------------------------------
# Variables WAF
# ---------------------------------------------
waf_allowed_global_ip_addresses = [
  "*.*.*.*/32",
  "*.*.*.*/32",
]

waf_blocked_user_agents = [
  "baz-agent",
  "qux-agent"
]
```

#### ▼ `TF_VAR_<環境変数名>`

環境変数としてエクスポートしておくと自動的に読み込まれる。`<環境変数名>`の文字が、実際の環境変数名としてTerraformに渡される。

```bash
$ printenv

TF_VAR_ecr_version_tag=foo
```

<br>

## 02. チャイルドモジュール

### チャイルドモジュールとは

#### ▼ チャイルドモジュールとは

ルートモジュールから使用するモジュールのこと。

Terraformの`2`個以上のブロックをパッケージ化することにより、複数の`resource`ブロックをまとめ、`1`個の`resource`ブロックのように扱う。

チャイルドモジュール内でチャイルドモジュールを作成すると、チャイルドモジュール内に`provider`ブロックを定義することになり、チャイルドモジュールを削除できない問題になる。

そのため、チャイルドモジュール内でチャイルドモジュールを作成しないようにする。

> - https://www.terraform.io/language/modules#child-modules
> - https://qiita.com/bigwheel/items/2b420183639416b5c6bb#%E3%82%A2%E3%83%B3%E3%83%81%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3%E3%81%AE%E7%90%86%E7%94%B1-3

#### ▼ ローカルモジュール

ルートモジュールと同じリポジトリにあるチャイルドモジュールのこと。

任意の`resource`ブロックを含めて良いわけではなく、同じ責務を持つ`resource`ブロックをまとめ、凝集度が高くなるようにする。

ローカルモジュール間で変数を受け渡すときは、必ずルートモジュールを経由し、ローカルモジュール内でローカルモジュールをコールすることはしない。

> - https://learn.hashicorp.com/tutorials/terraform/module#local-and-remote-modules

#### ▼ リモートモジュール (パブリッシュモジュール)

ルートモジュールと異なるリポジトリにあるチャイルドモジュールのこと。

パブリックに公開されている場合は、特に『パブリッシュモジュール』ともいう。

モジュール内の処理を追うのが大変になるため、多用しない。

ドキュメントを確認すれば、いずれの`resource`ブロックがリモートモジュールに含まれているかがわかる。

任意の`resource`ブロックを含めて良いわけではなく、同じ責務を持つ`resource`ブロックをまとめ、凝集度が高くなるようにする。

リモートモジュール間で変数を受け渡すときは、必ずルートモジュールを経由し、リモートモジュール内でリモートモジュールをコールすることはしない。

また、相互依存による循環参照エラーが起こるため、ローカルモジュール内でリモートモジュールをコールするようなことはせず、ルートモジュールでリモートモジュールを直接的にコールする。

> - https://learn.hashicorp.com/tutorials/terraform/module#local-and-remote-modules
> - https://www.terraform.io/language/modules#published-modules

<br>
