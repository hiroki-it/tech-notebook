---
title: 【IT技術の知見】ロジック＠Terraform
description: ロジック＠Terraformの知見を記録しています。
---

# tfファイル＠Terraform

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. バックエンド内のファイル

### ```.tfstate```ファイル

#### ▼ ```.tfstate```ファイルとは

実インフラのインフラの状態が定義されたjsonファイルのこと。バックエンドの場所に限らず、```terraform apply```コマンドを実行した後、成功もしくは失敗したタイミングで初めて作成される。

> ℹ️ 参考：
>
> - https://blog.gruntwork.io/how-to-manage-terraform-state-28f5697e68fa
> - https://chroju.dev/blog/terraform_state_introduction

```yaml
{
  "version": 4,
  "terraform_version": "1.0.0",
  "serial": 3,
  "lineage": "*****-*****-*****-*****-*****",
  "outputs": { # outputブロックのapplyで追加される。
    "foo_ids": {
      "value": "*****",
      "type": "string"
    }
  },
  "resources": [
    {
      "mode": "data", # dataブロックのapplyで追加される。
      "type": "aws_caller_identity", # resourceタイプ
      "name": "current", # リソース名
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [ # 設定値
        {
          "schema_version": 0,
          "attributes": {
            "account_id": "<アカウントID>",
            "arn": "*****",
            "id": "*****",
            "user_id": "*****"
            ...
          },
          "sensitive_attributes": []
        }
      ]
    },
    {
      "module": "module.ec2", # moduleブロックの場合に追加される。
      "mode": "managed", # importや、resourceブロックのapplyで追加される。
      "type": "aws_instance", # resourceタイプ
      "name": "bastion", # リソース名
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [ # 設定値
        {
          "schema_version": 0,
          "attributes": {
            "arn": "*****",
            "name": "prd-foo-instance",
            "tags": {
              "Env": "prd",
              "ManagedBy": "terraform",
              "Repository": "https://github.com/*****"
            },
            "description": "*****",
            ...
          }
        }
      ]
    }
  ]
}
```

#### ▼ ```.tfstate```ファイルのロック

```.tfstate```ファイルの競合を防ぐために、```terraform apply```コマンドの処理中に```.tfstate```ファイルはロックされる。```terraform apply```コマンドが完了すれば、ロックは解除される。ロックされている間、他のユーザーは一連の```terraform```コマンドを実行できなくなる。

#### ▼ 残骸ロックの解除方法

```terraform apply```コマンドの完了前に処理を強制中断してしまうと、ロックが残ってしまう。これが起こると、以降、一連の```terraform```コマンドを実行できなくなってしまう。

> ℹ️ 参考：https://dev.classmethod.jp/articles/terraform-state-lock-on-local/

```bash
$ terraform plan
Acquiring state lock. This may take a few moments...

Error: Error acquiring the state lock
Error message: resource temporarily unavailable
Lock Info:
   ID:        89e54252-fef0-2a68-17bf-e0bb411ff1e3 # これを使う
   Path:      terraform.tfstate
   Operation: OperationTypeInvalid
   Who:       hiroki-hasegawa
   Version:   1.1.5
   Created:   2022-02-21 06:26:07.435925 +0000 UTC
   Info:      
```

その場合、```terraform force-unlock```コマンドでIDを指定すれば、ロックを解除できる。

```bash
$ terraform force-unlock 89e54252-fef0-2a68-17bf-e0bb411ff1e3
```

<br>

### ```.terraform.lock.hcl```ファイル

#### ▼ ```.terraform.lock```ファイルとは

```terraform```ブロックの設定に基づいて、開発者間で共有するべき情報（バージョン、ハッシュ値、など）が設定される。これにより例えば、他の人がリポジトリを使用する時に、異なるプロバイダーを宣言できないようになる。

> ℹ️ 参考：
>
> - https://www.terraform.io/language/files/dependency-lock
> - https://speakerdeck.com/minamijoyo/how-to-update-terraform-dot-lock-dot-hcl-efficiently
> - https://qiita.com/mziyut/items/0f4109c425165f5011df

もし、異なるプロバイダーを使用したい場合は、以下のコマンドを実行する。これにより、```.terraform.lock.hcl```ファイルのアップグレード/ダウングレードが実行される。

```bash
$ terraform init -upgrade
```

#### ▼ version

プロバイダーのバージョンを設定する。

```terraform
provider "registry.terraform.io/hashicorp/aws" {
  
  ...
  
  version = "4.3.0"
  
  ...

}
```

#### ▼ constraints

```terraform
provider "registry.terraform.io/hashicorp/aws" {
  
  ...
  
  constraints = ">= 3.19.0"
  
  ...

}
```

#### ▼ hashes

ハッシュ値を設定する、タグごとに役割が異なる。

> ℹ️ 参考：https://speakerdeck.com/minamijoyo/how-to-update-terraform-dot-lock-dot-hcl-efficiently?slide=12

| タグ名   | 説明                                                         |
| -------- | ------------------------------------------------------------ |
| ```h1``` | 開発者が使用しているOSを表すハッシュ値を設定する。```zh```タグの```zip```パッケージのOS名に存在しないOS値が、```h1```タグに設定されている場合、通信中に改竄されたと見なされ、エラーになる。 |
| ```zh``` | プロバイダーの```zip```パッケージ（```terraform-provider-aws_<バージョン>_<OS名>```）のチェックサムハッシュ値を設定する。```h1```タグのOS値に存在しないOS名の```zip```パッケージが、```zh```タグに設定されている場合、通信中に改竄されたと見なされ、エラーになる。 |

```terraform
provider "registry.terraform.io/hashicorp/aws" {
  
  ...
  
  hashes = [
    "h1:*****",
    "h1:*****",
    "zh:*****",
    ...
  ]
  
  ...

}
```

<br>

## 02. ホームディレクトリ（```~/```）内のファイル

### ```~/.terraformrc```ファイル

#### ▼ ```.terraformrc```ファイルとは

```terraform```コマンドの実行者のみに適用する動作を設定する。

> ℹ️ 参考：https://www.terraform.io/cli/config/config-file#provider-plugin-cache

#### ▼ plugin_cache_dir

最初の```terraform init```コマンド時に、プロバイダープラグインのキャッシュを作成する。以降、プロバイダープラグインをインストールする必要がなくなり、```terraform init```コマンドの速度を改善できる。

> ℹ️ 参考：
> 
> - https://blog.jhashimoto.net/entry/2021/12/24/090000
> - https://www.terraform.io/cli/config/config-file#provider-plugin-cache

```terraform
# ~/.terraformrcファイル

plugin_cache_dir = "$HOME/.terraform.d/plugin-cache"
```

<br>

## 03. ルートモジュールの実装

### ルートモジュールとは

```terraform```コマンドの実行に最低限必要な```.tf```ファイルを配置する。

> ℹ️ 参考：https://www.terraform.io/language/modules#the-root-module

<br>

### ```terraform```ブロック

#### ▼ ```terraform```ブロックとは

```terraform```コマンドの実行時に、エントリーポイントとして動作するファイル。

#### ▼ required_providers

AWSやGCPなど、使用するプロバイダを定義する。プロバイダによって、異なる```resource```タイプが提供される。一番最初に読みこまれるファイルのため、通常変数やモジュール化などが行えない。

**＊実装例＊**

```terraform
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

#### ▼ ```backend```ブロック

インフラの状態ファイル（```.tfstate```ファイル）を管理する場所を設定する。S3などの実インフラで管理する場合、クレデンシャル情報を設定する必要がある。代わりに、```terraform init```コマンド実行時に指定しても良い。デフォルト値は```local```である。通常変数を使用できず、ハードコーディングする必要があるため、もし値を動的に変更したい場合は、ローカルマシンでは```providers.tf```ファイルの```backend```オプションを参照し、CDの中で```terraform init```コマンドのオプションを使用して値を渡すようにする。

> ℹ️ 参考：https://www.terraform.io/language/settings/backends/s3

**＊実装例＊**

```terraform
terraform {

  # ローカルマシンで管理するように設定
  backend "local" {
    path = "${path.module}/terraform.tfstate"
  }
}
```

```terraform
terraform {

  # S3で管理するように設定
  backend "s3" {
    # バケット名
    bucket                  = "prd-foo-tfstate-bucket"
    # .tfstateファイル名
    key                     = "terraform.tfstate"
    region                  = "ap-northeast-1"
    # credentialsファイルの場所
    shared_credentials_file = "$HOME/.aws/credentials"
    # credentialsファイルのプロファイル名
    profile                 = "bar-profile"
  }
}
```

どのユーザーもバケット内のオブジェクトを削除できないように、ポリシーを設定しておくと良い。

**＊実装例＊**

```yaml
{
    "Version": "2008-10-17",
    "Statement": [
        {
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:DeleteObject",
            "Resource": "arn:aws:s3:::prd-foo-tfstate-bucket/*"
        }
    ]
}
```

<br>

### ```provider```ブロック

#### ▼ ```provider```ブロックとは

Terraformで操作するクラウドインフラベンダーを設定する。ベンダーでのアカウント認証のため、クレデンシャル情報を渡す必要がある。

**＊実装例＊**

```terraform
terraform {
  required_version = "0.13.5"

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

```terraform
terraform {
  required_version = "0.13.5"

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

#### ▼ マルチprovidersとは

複数の```provider```ブロックを実装し、エイリアスを使用して、これらを動的に切り替える方法。

**＊実装例＊**

```terraform
terraform {
  required_version = "0.13.5"

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

#### ▼ ```module```ブロックでプロバイダーを切り替える

```module```ブロックでプロバイダーを切り替えるには、```module```ブロックに```provider```ブロックの値を明示的に渡す必要がある。

**＊実装例＊**

```terraform
module "route53" {
  source = "../modules/route53"

  providers = {
    aws = aws.ue1
  }
  
  # その他の設定値
}
```

加えて```module```ブロックで、```provider```引数の値を設定する必要がある。

**＊実装例＊**

```terraform
###############################################
# Route53
###############################################
resource "aws_acm_certificate" "example" {
  # CloudFrontの仕様のため、us-east-1リージョンでSSL証明書を作成します。
  provider = aws

  domain_name               = "example.com"
  subject_alternative_names = ["*.example.com"]
  validation_method         = "DNS"

  tags = {
    Name = "prd-foo-cert"
  }

  lifecycle {
    create_before_destroy = true
  }
}
```

<br>

### ```module```ブロック

#### ▼ ```module```ブロックとは

複数の```resource```ブロックをまとめ、```1```個の```resource```ブロックのように扱う。ドキュメントを確認すれば、いずれの```resource```ブロックが```module```ブロックに含まれているかがわかる。任意の```resource```を含めて良いわけではなく、同じ責務を持つ```resource```ブロックをまとめ、凝集度が高くなるようにする。```module```ブロック間で変数を受け渡すときは、必ずルートモジュールを経由し、```module```ブロック内で```module```ブロックを呼び出すことはしない。

> ℹ️ 参考：
>
> - https://www.terraform.io/language/modules/sources
> - https://qiita.com/bigwheel/items/2b420183639416b5c6bb
> - https://registry.terraform.io/namespaces/terraform-aws-modules

#### ▼ ローカルモジュールから読み込む

同じリポジトリ内に```module```ブロックがある場合、それを指定して読み込む。

**＊実装例＊**

```terraform
###############################
# ALB
###############################
module "alb" {
  # moduleブロックを参照する。
  source = "../modules/alb"
  
  # moduleブロックに他のmoduleブロックのoutputを渡す。
  acm_certificate_api_arn = module.acm.acm_certificate_api_arn
}
```

#### ▼ リモートモジュールから読み込む

外部リポジトリに```module```ブロックがある場合、それを指定して読み込む。外部リポジトリとしては、GitHub、Terraformレジストリ、S3、GCS、などを指定できる。HTTPSやSSHでプロトコルを指定できるが、鍵の登録が不要なHTTPの方が簡単なので推奨である。

```terraform
###############################
# ALB
###############################
module "alb" {
  # moduleブロックを参照する。
  # SSHの場合
  source = "git::https://github.com/hiroki-hasegawa/terraform-modules.git"
  
  # moduleブロックに他のmoduleブロックのoutputを渡す。
  acm_certificate_api_arn = module.acm.acm_certificate_api_arn
}
```

サブディレクトリを指定することもできる。リポジトリ以下にスラッシュを２つ（```//```）つけ、その後にパスを続ける。

> ℹ️ 参考：https://www.terraform.io/language/modules/sources#modules-in-package-sub-directories

```terraform
###############################
# ALB
###############################
module "alb" {
  # moduleブロックを参照する。
  # SSHの場合
  source = "git::https://github.com/hiroki-hasegawa/terraform-modules.git//module/alb"
  
  # moduleブロックに他のmoduleブロックのoutputを渡す。
  acm_certificate_api_arn = module.acm.acm_certificate_api_arn
}
```

<br>

### 環境変数

#### ▼ 環境変数の優先順位

> ℹ️ 参考：https://www.terraform.io/language/values/variables#variable-definition-precedence

#### ▼ ```-var```、```-var-file```

```bash
$ terraform plan -var="foo=foo"
$ terraform plan -var="foo=foo" -var="bar=bar"
```

```bash
$ terraform plan -var-file=foo.tfvars
```

#### ▼ ```*.auto.tfvars```ファイル、```*.auto.tfvars.json```ファイル  

#### ▼ ```terraform.tfvars.json```ファイル  

#### ▼ ```terraform.tfvars```ファイル

実行ファイルに入力したい環境変数を定義する。『```terraform.tfvars```』という名前にすると、```terraform```コマンドの実行時に自動的に読み込まれる。

```bash
# ファイルを指定しなくとも読み込まれる
$ terraform plan
```

**＊実装例＊**

```terraform
###############################################
# RDS
###############################################
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

###############################################
# VPC
###############################################
vpc_availability_zones             = { a = "a", c = "c" }
vpc_cidr                           = "*.*.*.*/23"
vpc_subnet_private_datastore_cidrs = { a = "*.*.*.*/27", c = "*.*.*.*/27" }
vpc_subnet_private_app_cidrs       = { a = "*.*.*.*/25", c = "*.*.*.*/25" }
vpc_subnet_public_cidrs            = { a = "*.*.*.*/27", c = "*.*.*.*/27" }

###############################################
# WAF
###############################################
waf_allowed_global_ip_addresses = [
  "*.*.*.*/32",
  "*.*.*.*/32",
]

waf_blocked_user_agents = [
  "baz-agent",
  "qux-agent"
]
```

#### ▼ ```TF_VAR_<環境変数名>```

環境変数としてエクスポートしておくと自動的に読み込まれる。```<環境変数名>```の文字が、実際の環境変数名としてTerraformに渡される。

```bash
$ printenv

TF_VAR_ecr_version_tag=foo
```

<br>

## 03-02. クレデンシャル情報

### 必要な情報

```terraform```コマンドでクラウドプロバイダーと通信するためには、クラウドプロバイダーへの認可スコープが必要にある。

<br>

### 設定方法

#### ▼ ハードコーディングによる設定

リージョンの他、アクセスキーIDとシークレットアクセスキーをハードコーディングで設定する。誤ってコミットしてしまう可能性があるため、ハードコーディングしないようにする。

**＊実装例＊**

```terraform
terraform {
  required_version = "0.13.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "3.0"
    }
  }
  
  backend "s3" {
    bucket     = "prd-foo-tfstate-bucket"
    key        = "terraform.tfstate"
    region     = "ap-northeast-1"
    # アクセスキーID
    access_key = "*****"
    # シークレットアクセスキー
    secret_key = "*****"
  }
}

provider "aws" {
  region     = "ap-northeast-1"
  # アクセスキーID
  access_key = "*****"
  # シークレットアクセスキー
  secret_key = "*****"
}
```

#### ▼ credentialsファイルによる設定

クレデンシャル情報は、```~/.aws/credentials```ファイルに記載されている。

```ini
# 標準プロファイル
[default]
aws_access_key_id=*****
aws_secret_access_key=*****

# 独自プロファイル
[bar-profile]
aws_access_key_id=*****
aws_secret_access_key=*****
```

credentialsファイルを読み出し、プロファイル名を設定することにより、クレデンシャル情報を参照できる。

**＊実装例＊**

```terraform
terraform {
  required_version = "0.13.5"

  required_providers {
  
    aws = {
      source  = "hashicorp/aws"
      version = "3.0"
    }
  }
  
  # credentialsファイルから、アクセスキーID、シークレットアクセスキーを読み込む
  backend "s3" {
    # バケット名
    bucket                  = "prd-foo-tfstate-bucket"
    # .tfstateファイル名とバケット内ディレクトリ構造
    key                     = "terraform.tfstate"
    region                  = "ap-northeast-1"
    # credentialsファイルの場所
    shared_credentials_file = "$HOME/.aws/credentials"
    # credentialsファイルのプロファイル名
    profile                 = "bar-profile"
  }
}

# credentialsファイルから、アクセスキーID、シークレットアクセスキーを読み込む
provider "aws" {
  region                  = "ap-northeast-1"
  profile                 = "foo"
  shared_credentials_file = "$HOME/.aws/<Credentialsファイル名>"
}
```

#### ▼ 環境変数による設定

Credentialsファイルではなく、```export```コマンドを使用して、必要な情報も設定できる。参照できる環境変数名は決まっている。

```bash
# regionの代わり
$ export AWS_DEFAULT_REGION="ap-northeast-1"

# access_keyの代わり
$ export AWS_ACCESS_KEY_ID="*****"

# secret_keyの代わり
$ export AWS_SECRET_ACCESS_KEY="*****"

# profileの代わり
$ export AWS_PROFILE="bar-profile"

# tokenの代わり（AWS STSを使用する場合）
$ export AWS_SESSION_TOKEN="*****"
```

環境変数を設定すると、値が```provider```ブロックに自動的に出力される。CircleCIのような、一時的に環境変数が必要になるような状況では有効な方法である。

```terraform
terraform {
  required_version = "0.13.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "3.0"
    }
  }
  
  # リージョン、アクセスキーID、シークレットアクセスキーは不要
  backend "s3" {
    bucket  = "<バケット名>"
    key     = "<.tfstateファイル名とバケット内ディレクトリ構造>"
  }
}

# リージョン、アクセスキーID、シークレットアクセスキーは不要
provider "aws" {}
```

<br>

## 04. ローカル/リモートモジュールの実装

### ローカル/リモートモジュールとは

Terraformの```2```個以上のブロックをパッケージ化し、モジュールに値を渡せば、それらのブロックを一括でプロビジョニングできるようにする。

> ℹ️ 参考：
> 
> - https://www.terraform.io/language/modules#child-modules
> - https://www.terraform.io/language/modules#published-modules

<br>

### ```resource```ブロック

#### ▼ ```resource```ブロックとは

AWSのAPIに対してリクエストを送信し、クラウドインフラを作成する。

#### ▼ ```resource```タイプ

操作されるリソースの種類のこと。リソースとTerraformの```resource```タイプはおおよそ一致している。

> ℹ️ 参考：https://docs.aws.amazon.com/config/latest/developerguide/resource-config-reference.html

#### ▼ 実装方法

**＊実装例＊**

```terraform
###############################################
# ALB
###############################################
resource "aws_lb" "this" {
  name               = "prd-foo-alb"
  load_balancer_type = "application"
  security_groups    = ["*****"]
  subnets            = ["*****","*****"]
}
```

<br>

### ```data```ブロック

#### ▼ ```data```ブロックとは

AWSのAPIに対してリクエストを送信し、クラウドインフラに関するデータを取得する。ルートモジュールも実装できるが、各モジュールに実装した方が分かりやすい。

#### ▼ 実装方法

**＊実装例＊**

例として、ECSタスク定義名を指定して、AWSから

```terraform
###############################################
# ECS task definition
###############################################
data "aws_ecs_task_definition" "this" {
  task_definition = "prd-foo-ecs-task-definition"
}
```

**＊実装例＊**

例として、AMIを検索した上で、AWSから特定のAMIの値を取得する。

```terraform
###############################################
# AMI
###############################################
data "aws_ami" "bastion" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

  filter {
    name   = "name"
    values = ["amzn-ami-hvm-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "block-device-mapping.volume-type"
    values = ["gp2"]
  }
}
```

<br>

### ```output```ブロック

#### ▼ ```output```ブロックとは

```module```ブロック内の```resource```ブロックが持つ値を```module```ブロック外に出力する。または、他の```.tfstate```ファイルの```resource```ブロックで使用できるようにする。可読性の観点から、```resource```ブロック一括ではなく、具体的な```attribute```を出力するようにした方が良い。

> ℹ️ 参考：https://qiita.com/yukihira1992/items/a674fe717a8ead7263e4

#### ▼ 実装方法

**＊実装例＊**

例として、ALBを示す。```resource```ブロックと```data```ブロックで```output```ブロックの方法が異なる。

```terraform
###############################################
# ALB
###############################################
output "alb_zone_id" {
  value = aws_lb.this.zone_id
}

output "elb_service_account_arn" {
  value = data.aws_elb_service_account.this.arn
}
```

```module```ブロック内の```resource```ブロックが持つ値を```module```ブロック外に出力する場合、```module```から出力する。

```terraform
###############################
# ALB
###############################
module "foo" {
  # moduleブロックを参照する。
  source = "../modules/foo"
  
  # moduleブロックに他のmoduleブロックのoutputを渡す。
  foo_id = module.alb.alb_zone_id
}
```

一方で、他の```.tfstate```ファイルの```resource```ブロックで使用する場合、```terraform_remote_state```ブロックから出力する。

```terraform
# outputのあるtfstateファイルを参照する。
data "terraform_remote_state" "alb" {
    backend = "s3"
    config = {
        bucket = "bucket"
        key = "alb.tfstate"
    }
}

resource "foo" "this" {
    foo_id = data.terraform_remote_state.alb.outputs.alb_zone_id
}
```

#### ▼ ```count```引数を使用した場合の注意点

```resource```ブロックの作成に```count```引数を使用した場合、その```resource```ブロックはlist型として扱われる。そのため、```output```ブロックではキー名を指定して出力できる。ちなみに、```for_each```引数で作成した```resource```ブロックはアスタリスクでインデックス名を指定できないので、注意。

**＊実装例＊**

例として、VPCのサブネットを示す。ここでは、パブリックサブネット、applicationサブネット、datastoreサブネット、を```count```引数で作成したとする。

```terraform
###############################################
# パブリックサブネット
###############################################
resource "aws_subnet" "public" {
  count = 2
  
  ...
}

###############################################
# プライベートサブネット
###############################################
resource "aws_subnet" "private_app" {
  count = 2
  
  ...
}

resource "aws_subnet" "private_datastore" {
  count = 2
  
  ...
}
```

#### ▼ list型```output```ブロック

インデックスキーをアスタリスクを指定した場合、list型になる。

```terraform
###############################################
# Output VPC
###############################################
output "public_subnet_ids" {
  value = aws_subnet.public[*].id # IDのリスト型
}

output "private_app_subnet_ids" {
  value = aws_subnet.private_app[*].id # IDのリスト型
}

output "private_datastore_subnet_ids" {
  value = aws_subnet.private_datastore[*].id # IDのリスト型
}
```

#### ▼ スカラー型```output```ブロック

インデックスキー（```0```番目）を指定した場合、スカラー型になる。

```terraform
output "public_subnet_ids" {
  value = aws_subnet.public[0].id # IDの文字列
}

output "private_app_subnet_ids" {
  value = aws_subnet.private_app[0].id # IDの文字列
}

output "private_datastore_subnet_ids" {
  value = aws_subnet.private_datastore[0].id # IDの文字列
}
```

<br>


### ```local```ブロック

#### ▼ ```local```ブロックとは

通常変数であり、定義されたローカル/リモートモジュール内にのみスコープを持つ。ルートモジュールとローカル/リモートモジュールが異なるリポジトリで管理されている場合に有効であり、これらが同じリポジトリにある場合は、環境変数を使用した方が可読性が高くなる。

> ℹ️ 参考：
>
> - https://www.terraform.io/language/values/locals
> - https://febc-yamamoto.hatenablog.jp/entry/2018/01/30/185416

```terraform
locals {
  foo = "FOO"
}

resource "aws_instance" "example" {
  foo = local.foo
}
```

<br>

## 05. ルート/ローカル/リモートモジュールで共通の実装

### ```variable```ブロック 

#### ▼ ```variable```ブロックとは

```.tfvars```ファイル、```module```ブロック、```resource```ブロック、で使用する変数に関して、データ型やデフォルト値を定義する。

#### ▼ データ型

単一値、list型、map型を定義できる。

**＊実装例＊**

AZ、サブネットのCIDRブロック、RDSのパラメーターグループ値、などはmap型として保持しておくと良い。また、IPアドレスのセット、ユーザーエージェント、などはlist型として保持しておくと良い。

```terraform
###############################################
# ECS
###############################################
variable "ecs_container_laravel_port_http" {
  type = number
}

variable "ecs_container_nginx_port_http" {
  type = number
}

###############################################
# RDS
###############################################
variable "rds_auto_minor_version_upgrade" {
  type = bool
}

variable "rds_instance_class" {
  type = string
}

variable "rds_parameter_group_values" {
  type = map(string)
}

###############################################
# VPC
###############################################
variable "vpc_availability_zones" {
  type = map(string)
}

variable "vpc_cidr" {
  type = string
}

variable "vpc_endpoint_port_https" {
  type = number
}

variable "vpc_subnet_private_datastore_cidrs" {
  type = map(string)
}

variable "vpc_subnet_private_app_cidrs" {
  type = map(string)
}

variable "vpc_subnet_public_cidrs" {
  type = map(string)
}

###############################################
# WAF
###############################################
variable "waf_allowed_global_ip_addresses" {
  type = list(string)
}

variable "waf_blocked_user_agents" {
  type = list(string)
}
```

#### ▼ デフォルト値

変数のデフォルト値を定義できる。有効な値を設定してしまうと可読性が悪くなるので、無効値（例：bool型であれば```false```、string型であれば空文字、list型であれば空配列、など）を設定する。

**＊実装例＊**

```module```ブロックや```resource```ブロック内で、```count```引数を使用して`条件分岐を定義した場合に、そのフラグ値となるbool型値をデフォルト値として定義すると良い。

```terraform
variable "enable_provision" {
  description = "enable provision"
  type        = bool
  default     = false
}
```

<br>

## 06. メタ引数

### メタ引数とは

全ての```resource```ブロックで使用できるオプションのこと。

<br>

### ```depends_on```引数

#### ▼ ```depends_on```引数とは

```resource```ブロック間の依存関係を明示的に定義する。Terraformでは、基本的に```resource```ブロック間の依存関係が暗黙的に定義されている。しかし、複数の```resource```ブロックが関わると、```resource```ブロックを適切な順番で作成できない場合があるため、そういった時に使用する。

#### ▼ ALB target group vs. ALB、ECS

例として、ALB target groupを示す。ALB Target groupとALBの```resource```ブロックを適切な順番で作成できないため、ECSの作成時にエラーが起こる。ALBの後にALB target groupを作成する必要がある。

**＊実装例＊**

```terraform
###############################################
# ALB target group
###############################################
resource "aws_lb_target_group" "this" {
  name                 = "prd-foo-alb-tg"
  port                 = 80
  protocol             = "HTTP"
  vpc_id               = "*****"
  deregistration_delay = "60"
  target_type          = "ip"
  slow_start           = "60"

  health_check {
    interval            = 30
    path                = "/healthcheck"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
    matcher             = 200
  }

  depends_on = [aws_lb.this]
}
```

#### ▼ Internet Gateway vs. EC2、Elastic IP、NAT Gateway

例として、NAT Gatewayを示す。NAT Gateway、Internet Gateway、の```resource```ブロックを適切な順番で作成できないため、Internet Gatewayの作成後に、NAT Gatewayを作成するように定義する必要がある。

```terraform
###############################################
# EC2
###############################################
resource "aws_instance" "bastion" {
  ami                         = "*****"
  instance_type               = "t2.micro"
  vpc_security_group_ids      = ["*****"]
  subnet_id                   = "*****"
  key_name                    = "prd-foo-bastion"
  associate_public_ip_address = true
  disable_api_termination     = true

  tags = {
    Name = "prd-foo-bastion"
  }

  depends_on = [var.internet_gateway]
}
```

```terraform
###############################################
# Elastic IP
###############################################
resource "aws_eip" "nat_gateway" {
  for_each = var.vpc_availability_zones

  vpc = true

  tags = {
    Name = format(
      "prd-foo-ngw-%s-eip",
      each.value
    )
  }

  depends_on = [aws_internet_gateway.this]
}
```

```terraform
###############################################
# NAT Gateway
###############################################
resource "aws_nat_gateway" "this" {
  for_each = var.vpc_availability_zones

  subnet_id     = aws_subnet.public[each.key].id
  allocation_id = aws_eip.nat_gateway[each.key].id

  tags = {
    Name = format(
      "prd-foo-%s-ngw",
      each.value
    )
  }

  depends_on = [aws_internet_gateway.this]
}
```

#### ▼ S3バケットポリシー vs. パブリックアクセスブロックポリシー

例として、S3を示す。バケットポリシーとパブリックアクセスブロックポリシーを同時に作成できないため、作成のタイミングが重ならないようにする必要がある。

```terraform
###############################################
# S3
###############################################

# foo bucket
resource "aws_s3_bucket" "foo" {
  bucket = "prd-foo-bucket"
  acl    = "private"
}

# Public access block
resource "aws_s3_bucket_public_access_block" "foo" {
  bucket                  = aws_s3_bucket.foo.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Bucket policy attachment
resource "aws_s3_bucket_policy" "foo" {
  bucket = aws_s3_bucket.foo.id
  policy = templatefile(
    "${path.module}/policies/foo_bucket_policy.tpl",
    {
      foo_s3_bucket_arn                        = aws_s3_bucket.foo.arn
      s3_cloudfront_origin_access_identity_iam_arn = var.s3_cloudfront_origin_access_identity_iam_arn
    }
  )

  depends_on = [aws_s3_bucket_public_access_block.foo]
}
```

<br>

### ```count```引数

#### ▼ ```count```引数とは

指定した数だけ、```resource```ブロックの作成を繰り返す。```count.index```オプションでインデックス数を展開する。

**＊実装例＊**

```terraform
###############################################
# EC2
###############################################
resource "aws_instance" "server" {
  count = 4
  
  ami           = "ami-a1b2c3d4"
  instance_type = "t2.micro"

  tags = {
    Name = "ec2-${count.index}"
  }
}
```

#### ▼ 作成の有無の条件分岐

特定の実行環境でリソースの作成の有無を切り替えたい場合、```.terraform.tfvars```ファイルからフラグ値を渡し、これがあるかないかを```count```引数で判定し、条件分岐を実現する。フラグ値を渡さない場合は、デフォルト値を渡すようにする。

> ℹ️ 参考：https://cloud.google.com/docs/terraform/best-practices-for-terraform#count

```terraform
# 特定の実行環境の.terraform.tfvarsファイル
enable_provision = true
```

```terraform
variable "enable_provision" {
  description = "enable provision"
  type        = bool
  default     = false
}
```

```terraform
###############################################
# EC2
###############################################
resource "aws_instance" "server" {
  count = var.enable_provision ? 1 : 0
  
  ami           = "ami-a1b2c3d4"
  instance_type = "t2.micro"

  tags = {
    Name = "ec2-${count.index}"
  }
}
```


<br>

### ```for_each```引数

#### ▼ ```for_each```引数とは

事前に```for_each```引数に格納したmap型の```key```の数だけ、```resource```ブロックを繰り返し実行する。繰り返し処理を行う時に、```count```引数とは違い、要素名を指定して出力できる。

**＊実装例＊**

例として、subnetを繰り返し作成する。

```terraform
###############################################
# Variables
###############################################
vpc_availability_zones             = { a = "a", c = "c" }
vpc_cidr                           = "*.*.*.*/23"
vpc_subnet_private_datastore_cidrs = { a = "*.*.*.*/27", c = "*.*.*.*/27" }
vpc_subnet_private_app_cidrs       = { a = "*.*.*.*/25", c = "*.*.*.*/25" }
vpc_subnet_public_cidrs            = { a = "*.*.*.*/27", c = "*.*.*.*/27" }
```

```terraform
###############################################
# パブリックサブネット
###############################################
resource "aws_subnet" "public" {
  for_each = var.vpc_availability_zones

  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.vpc_subnet_public_cidrs[each.key]
  availability_zone       = "${var.region}${each.value}"
  map_public_ip_on_launch = true

  tags = {
    Name = format(
      "prd-foo-pub-%s-subnet",
      each.value
    )
  }
}
```

#### ▼ 冗長化されたAZにおける設定

冗長化されたAZで共通のルートテーブルを作成する場合、そこで、```for_each```引数を使用すると、少ない実装で作成できる。```for_each```引数で作成された```resource```ブロックは```terraform apply```コマンド実行中にmap構造として扱われ、```resource```ブロック名の下層にキー名で```resource```ブロックが並ぶ構造になっている。これを参照するために、『```<resourceタイプ>.<resourceブロック名>[each.key].<attribute>```』とする

**＊実装例＊**

パブリックサブネット、プライベートサブネット、プライベートサブネットに紐付くNAT Gatewayの設定が冗長化されたAZで共通の場合、```for_each```引数で作成する。

```terraform
###############################################
# Variables
###############################################
vpc_availability_zones = { a = "a", c = "c" }
```

```terraform
###############################################
# Internet Gateway
###############################################
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "prd-foo-igw"
  }
}

###############################################
# ルートテーブル (パブリック)
###############################################
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name = "prd-foo-pub-rtb"
  }
}

###############################################
# ルートテーブル (プライベート)
###############################################
resource "aws_route_table" "private_app" {
  for_each = var.vpc_availability_zones

  vpc_id = aws_vpc.this.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.this[each.key].id
  }

  tags = {
    Name = format(
      "prd-foo-pvt-%s-app-rtb",
      each.value
    )
  }
}

###############################################
# NAT Gateway
###############################################
resource "aws_nat_gateway" "this" {
  for_each = var.vpc_availability_zones

  subnet_id     = aws_subnet.public[each.key].id
  allocation_id = aws_eip.nat_gateway[each.key].id

  tags = {
    Name = format(
      "prd-foo-%s-ngw",
      each.value
    )
  }

  depends_on = [aws_internet_gateway.this]
}
```

#### ▼ 単一値で```output```ブロック

```resource```ブロックの作成に```for_each```引数を使用した場合、その```resource```ブロックはmap型として扱われる。そのため、キー名を指定して出力できる。

```terraform
###############################################
# Variables
###############################################
vpc_availability_zones = { a = "a", c = "c" }
```

```terraform
###############################################
# Output VPC
###############################################
output "public_a_subnet_id" {
  value = aws_subnet.public[var.vpc_availability_zones.a].id
}

output "public_c_subnet_id" {
  value = aws_subnet.public[var.vpc_availability_zones.c].id
}
```

#### ▼ map型で```output```ブロック

**＊実装例＊**

```terraform
###############################################
# Variables
###############################################
vpc_availability_zones = { a = "a", c = "c" }
```

```terraform
###############################################
# Output VPC
###############################################
output "public_subnet_ids" {
  value = {
    a = aws_subnet.public[var.vpc_availability_zones.a].id,
    c = aws_subnet.public[var.vpc_availability_zones.c].id
  }
}

output "private_app_subnet_ids" {
  value = {
    a = aws_subnet.private_app[var.vpc_availability_zones.a].id,
    c = aws_subnet.private_app[var.vpc_availability_zones.c].id
  }
}

output "private_datastore_subnet_ids" {
  value = {
    a = aws_subnet.private_datastore[var.vpc_availability_zones.a].id,
    c = aws_subnet.private_datastore[var.vpc_availability_zones.c].id
  }
}
```

```terraform
###############################################
# ALB
###############################################
resource "aws_lb" "this" {
  name                       = "prd-foo-alb"
  subnets                    = values(private_app_subnet_ids)
  security_groups            = [var.alb_security_group_id]
  internal                   = false
  idle_timeout               = 120
  enable_deletion_protection = true

  access_logs {
    enabled = true
    bucket  = var.alb_s3_bucket_id
  }
}
```

<br>

### ```dynamic```引数

#### ▼ ```dynamic```引数とは

指定したブロックを繰り返し作成する。

> ℹ️ 参考：https://www.terraform.io/language/expressions/dynamic-blocks

#### ▼ map型の場合

**＊実装例＊**

map型のキー名と値の両方を設定値として使用する。例として、RDSパラメーターグループの```parameter```ブロックを、map型通常変数を使用して繰り返し作成する。

```terraform
###############################################
# Variables
###############################################
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
```

```terraform

###############################################
# RDS Cluster Parameter Group
###############################################
resource "aws_rds_cluster_parameter_group" "this" {
  name        = "prd-foo-cluster-pg"
  description = "The cluster parameter group for prd-foo-rds"
  family      = "aurora-mysql5.7"

  dynamic "parameter" {
    for_each = var.rds_parameter_group_values

    content {
      # parameterブロックのnameオプションとvalueオプションに出力する。
      name  = parameter.key
      value = parameter.value
    }
  }
}
```

**＊実装例＊**

map型の値を設定値として使用する。

```terraform
security_group_ingress_ec2_ssh = {
  cidr_blocks = "*.*.*.*"
  description = "SSH access from foo ip address"
  from_port   = 22
  to_port     = 22
  protocol    = "TCP"
}
```

```terraform

resource "aws_security_group" "ec2" {

  ...

  dynamic ingress {
    for_each = var.security_group_ingress_ec2_ssh
    content {
      cidr_blocks = [ ingress.value["cidr_blocks"] ]
      description = ingress.value["description"]
      from_port   = ingress.value["from_port"]
      to_port     = ingress.value["to_port"]
      protocol    = ingress.value["protocol"]
    }
  }
  
  ...
}
```

#### ▼ list型の場合

**＊実装例＊**

例として、WAFの正規表現パターンセットの```regular_expression```ブロックを、list型通常変数を使用して繰り返し作成する。

```terraform
###############################################
# Variables
###############################################
waf_blocked_user_agents = [
  "FooCrawler",
  "BarSpider",
  "BazBot",
]
```

```terraform

###############################################
# WAF Regex Pattern Sets
###############################################
resource "aws_wafv2_regex_pattern_set" "cloudfront" {
  name        = "blocked-user-agents"
  description = "Blocked user agents"
  scope       = "CLOUDFRONT"

  dynamic "regular_expression" {
    for_each = var.waf_blocked_user_agents

    content {
      # regex_stringブロックのregex_stringオプションに出力する。
      regex_string = regular_expression.value
    }
  }
}
```

<br>

### ```lifecycle```引数

#### ▼ ```lifecycle```引数とは

```resource```ブロックの作成、更新、そして削除のプロセスをカスタマイズする。

#### ▼ create_before_destroy

```resource```ブロックを新しく作成した後に削除するように、変更できる。通常時、Terraformの処理順序として、```resource```ブロックの削除後に作成が行われる。しかし、他のリソースと依存関係が存在する場合、先に削除が行われることによって、他のリソースに影響が出てしまう。これに対処するために、先に新しい```resource```ブロックを作成し、紐付けし直してから、削除する必要がある。

**＊実装例＊**

例として、ACMのSSL証明書を示す。ACMのSSL証明書は、ALBやCloudFrontに紐付いており、新しい証明書に紐付け直した後に、既存のものを削除する必要がある。

```terraform
###############################################
# For foo domain
###############################################
resource "aws_acm_certificate" "foo" {

  ...

  # 新しいSSL証明書を作成した後に削除する。
  lifecycle {
    create_before_destroy = true
  }
}
```

**＊実装例＊**

例として、RDSのクラスターパラメーターグループとサブネットグループを示す。クラスターパラメーターグループとサブネットグループは、DBクラスターに紐付いており、新しいクラスターパラメーターグループに紐付け直した後に、既存のものを削除する必要がある。

```terraform
###############################################
# RDS Cluster Parameter Group
###############################################
resource "aws_rds_cluster_parameter_group" "this" {

  ...

  lifecycle {
    create_before_destroy = true
  }
}

###############################################
# RDS Subnet Group
###############################################
resource "aws_db_subnet_group" "this" {

  ...

  lifecycle {
    create_before_destroy = true
  }
}
```

**＊実装例＊**

例として、Redisのパラメーターグループとサブネットグループを示す。ラメータグループとサブネットグループは、RDSに紐付いており、新しいパラメーターグループとサブネットグループに紐付け直した後に、既存のものを削除する必要がある。

```terraform
###############################################
# Redis Parameter Group
###############################################
resource "aws_elasticache_parameter_group" "redis" {

  ...

  lifecycle {
    create_before_destroy = true
  }
}

###############################################
# Redis Subnet Group
###############################################
resource "aws_elasticache_subnet_group" "redis" {

  ...

  lifecycle {
    create_before_destroy = true
  }
}
```

#### ▼ ignore_changes

実インフラのみで発生した```resource```ブロックの作成・更新・削除を無視し、```.tfstate```ファイルに反映しないようにする。これにより、```ignore_changes```引数を定義したタイミング以降、実インフラと```.tfstate```ファイルに差分があっても、```.tfstate```ファイルの値が更新されなくなる。

**＊実装例＊**

例として、ECSを示す。ECSでは、オートスケーリングによってECSタスク数が増加する。そのため、これらを無視する必要がある。

```terraform
###############################################
# ECS Service
###############################################
resource "aws_ecs_service" "this" {

  ...

  lifecycle {
    ignore_changes = [
      # オートスケーリングによるECSタスク数の増減を無視。
      desired_count,
    ]
  }
}
```

**＊実装例＊**

例として、Redisを示す。Redisでは、オートスケーリングによってプライマリー数とレプリカ数が増減する。そのため、これらを無視する必要がある。


```terraform
###############################################
# Redis Cluster
###############################################
resource "aws_elasticache_replication_group" "redis" {

  ...

  lifecycle {
    ignore_changes = [
      # プライマリー数とレプリカ数の増減を無視します。
      number_cache_clusters
    ]
  }
}
```

**＊実装例＊**

使用例はすくないが、ちなみに```resource```ブロック全体を無視する場合は```all```値を設定する。

```terraform
resource "aws_foo" "foo" {

  ...

  lifecycle {
    ignore_changes = all
  }
}
```

<br>

### ```regexall```引数

#### ▼ ```regexall```引数とは

正規表現ルールに基づいて、文字列の中から文字を抽出する。これを応用して、特定の文字列を含む場合に条件を分岐させるようにできる。

```terraform
security_group_ingress_ec2_ssh = {
  prd = {
    cidr_blocks = "*.*.*.*"
    description = "SSH access from foo ip address"
    from_port   = 22
    to_port     = 22
    protocol    = "TCP"
  }
  stg = {
    cidr_blocks = "*.*.*.*"
    description = "SSH access from foo ip address"
    from_port   = 22
    to_port     = 22
    protocol    = "TCP"
  }
}
```

```terraform
resource "aws_security_group" "ec2" {

  ...

  dynamic ingress {
    # 環境が複数あるとする。（prd-1、prd-2、stg-1、stg-2）
    # 環境名がprdという文字を含むキーがあった場合、全てprdキーの方を使用する。
    for_each = length(regexall("prd", var.env)) > 0 ? var.security_group_ingress_ec2_ssh.prd : var.security_group_ingress_ec2_ssh.stg
    content {
      cidr_blocks = [ ingress.value["cidr_blocks"] ]
      description = ingress.value["description"]
      from_port   = ingress.value["from_port"]
      to_port     = ingress.value["to_port"]
      protocol    = ingress.value["protocol"]
    }
  }

  ...
}
```

<br>

## 07. tpl形式の切り出しと読み出し

### ```templatefile```関数

#### ▼ ```templatefile```関数とは

第一引数でポリシーが定義されたファイルを読み出し、第二引数でファイルに変数を渡す。ファイルの拡張子はtplとするのが良い。

**＊実装例＊**

例として、S3を示す。

```terraform
###############################################
# S3 bucket policy
###############################################
resource "aws_s3_bucket_policy" "alb" {
  bucket = aws_s3_bucket.alb_logs.id
  policy = templatefile(
    "${path.module}/policies/alb_bucket_policy.tpl",
    {
      aws_elb_service_account_arn = var.aws_elb_service_account_arn
      aws_s3_bucket_alb_logs_arn  = aws_s3_bucket.alb_logs.arn
    }
  )
}
```

バケットポリシーを定義するtpl形式ファイルでは、string型の場合は```"${}"```で、integer型の場合は```${}```で変数を展開する。ここで拡張子をjsonにしてしまうと、integer型の出力をjsonの構文エラーとして扱われてしまう。

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "${aws_elb_service_account_arn}/*"
      },
      "Action": "s3:PutObject",
      "Resource": "${aws_s3_bucket_alb_logs_arn}/*"
    }
  ]
}
```

#### ▼ path式

> ℹ️ 参考：https://www.terraform.io/language/expressions/references#filesystem-and-workspace-info

| 変数                      | 値                                                     | 例                         |
| ------------------------- | ------------------------------------------------------ | -------------------------- |
| ```path.module```         | ```path```式が実行された```.tf```ファイルがあるディレクトリのパス。 | ```/project/module/foo/``` |
| ```path.root```           | ```terraform```コマンドの作業ディレクトリのパス              | ```/var/www/```            |
| ```path.root```           | ```module```ディレクトリのルートパス                   | ```/project/module/```     |
| ```terraform.workplace``` | 現在使用しているワークスペース名                       | ```prd```                  |

<br>

### ポリシーの紐付け

<br>

### containerDefinitionsの設定

#### ▼ containerDefinitionsとは

ECSタスク定義のうち、コンテナを定義する部分のこと。

**＊実装例＊**

```yaml
{
  "ipcMode": null,
  "executionRoleArn": "<ecsTaskExecutionRoleのARN>",
  "containerDefinitions": [
    
  ],

   ...

}
```

#### ▼ 設定方法

integer型を通常変数として渡せるように、拡張子をjsonではなくtplとするのが良い。```image```キーでは、ECRイメージのURLを設定する。バージョンタグは任意で指定でき、もし指定しない場合は、『```latest```』という名前のタグが自動的に割り当てられる。バージョンタグにハッシュ値が割り当てられている場合、Terraformでは時系列で最新のタグ名を取得する方法がないため、```secrets```キーでは、パラメーターストアの値を参照できる。ログ分割の目印を設定する```awslogs-datetime-format```キーでは、タイムスタンプを表す```\\[%Y-%m-%d %H:%M:%S\\]```を設定すると良い。これにより、同じ時間に発生したログを1つのログとしてまとめられるため、スタックトレースが見やすくなる。

**＊実装例＊**

```yaml
[
  {
    # コンテナ名
    "name": "laravel",
    # ECRのURL。タグを指定しない場合はlatestが割り当てられる。
    "image": "${laravel_ecr_repository_url}",
    "essential": true,
    "portMappings": [
      {
        "containerPort": 80,
        "hostPort": 80,
        "protocol": "tcp"
      }
    ],
    "secrets": [
      {
        # アプリケーションの環境変数名
        "name": "DB_HOST",
        # Systems Managerのパラメーター名
        "valueFrom": "/prd-foo/DB_HOST"
      },
      {
        "name": "DB_DATABASE",
        "valueFrom": "/prd-foo/DB_DATABASE"
      },
      {
        "name": "DB_PASSWORD",
        "valueFrom": "/prd-foo/DB_PASSWORD"
      },
      {
        "name": "DB_USERNAME",
        "valueFrom": "/prd-foo/DB_USERNAME"
      },
      {
        "name": "REDIS_HOST",
        "valueFrom": "/prd-foo/REDIS_HOST"
      },
      {
        "name": "REDIS_PASSWORD",
        "valueFrom": "/prd-foo/REDIS_PASSWORD"
      },
      {
        "name": "REDIS_PORT",
        "valueFrom": "/prd-foo/REDIS_PORT"
      }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        # ロググループ名
        "awslogs-group": "/prd-foo/laravel/log",
        # スタックトレースのグループ化（同時刻ログのグループ化）
        "awslogs-datetime-format": "\\[%Y-%m-%d %H:%M:%S\\]",
        # リージョン
        "awslogs-region": "ap-northeast-1",
        # ログストリーム名の接頭辞
        "awslogs-stream-prefix": "/container"
      }
    }
  }
]
```

