---
title: 【IT技術の知見】ロジック＠Terraform
description: ロジック＠Terraformの知見を記録しています。
---

# tfファイル＠Terraform

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ルートモジュールにおける実装

### ```.tfstate```ファイル

#### ▼ ```.tfstate```ファイルとは

実インフラのインフラの状態が定義されたjsonファイルのこと。初回時、```terraform apply```コマンドを実行した後、成功もしくは失敗したタイミングで生成される。

参考：https://blog.gruntwork.io/how-to-manage-terraform-state-28f5697e68fa

#### ▼ 読み方

参考：https://chroju.dev/blog/terraform_state_introduction

```yaml
{
  "version": 4,
  "terraform_version": "1.0.6",
  "serial": 3,
  "lineage": "*****-*****-*****-*****-*****",
  "outputs": { # アウトプットのapplyで追加される。
    "foo_ids": {
      "value": "*****",
      "type": "string"
    }
  },
  "resources": [
    {
      "mode": "data", # データリソースのapplyで追加される。
      "type": "aws_caller_identity", # リソースタイプ
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
      "module": "module.ec2", # モジュールの場合に追加される。
      "mode": "managed", # リソースのapplyで追加される。
      "type": "aws_instance", # リソースタイプ
      "name": "foo", # リソース名
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [ # 設定値
        {
          "schema_version": 0,
          "attributes": {
            "arn": "*****",
            "name": "prd-foo-instance"
            "tags": {
              "Env": "prd",
              "ManagedBy": "terraform"
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

<br>

### ```.terraform.lock.hcl```ファイル

#### ▼ ```.terraform.lock.hcl```ファイルとは

開発者間で共有するべき情報（バージョン、ハッシュ値、など）が設定される。これにより例えば、他の人がリポジトリを使用する時に、異なるプロバイダーを宣言できないようになる。

参考：

- https://www.terraform.io/language/files/dependency-lock
- https://speakerdeck.com/minamijoyo/how-to-update-terraform-dot-lock-dot-hcl-efficiently
- https://qiita.com/mziyut/items/0f4109c425165f5011df

もし、異なるプロバイダーを使用したい場合は、以下のコマンドを実行する。これにより、```.terraform.lock.hcl```ファイルのアップグレード/ダウングレードが実行される。

```bash
$ terraform init -upgrade
```

#### ▼ version

プロバイダーのバージョンを設定する。

```terraform
provider "registry.terraform.io/hashicorp/aws" {
  
  # 〜 中略 〜
  
  version = "4.3.0"
  
  # 〜 中略 〜

}
```

#### ▼ constraints

```terraform
provider "registry.terraform.io/hashicorp/aws" {
  
  # 〜 中略 〜
  
  constraints = ">= 3.19.0"
  
  # 〜 中略 〜

}
```

#### ▼ hashes

ハッシュ値を設定する、タグごとに役割が異なる。

参考：https://speakerdeck.com/minamijoyo/how-to-update-terraform-dot-lock-dot-hcl-efficiently?slide=12

| タグ名   | 説明                                                         |
| -------- | ------------------------------------------------------------ |
| ```h1``` | 開発者が使用しているOSを表現するハッシュ値を設定する。```zh```タグの```zip```パッケージのOS名に存在しないOS値が、```h1```タグに設定されている場合、通信中に改竄されたと見なされ、エラーになる。 |
| ```zh``` | プロバイダーの```zip```パッケージ（```terraform-provider-aws_<バージョン>_<OS名>```）のチェックサムハッシュ値を設定する。```h1```タグのOS値に存在しないOS名の```zip```パッケージが、```zh```タグに設定されている場合、通信中に改竄されたと見なされ、エラーになる。 |

```terraform
provider "registry.terraform.io/hashicorp/aws" {
  
  # 〜 中略 〜
  
  hashes = [
    "h1:*****",
    "h1:*****",
    "zh:*****",
    ...
  ]
  
  # 〜 中略 〜

}
```

<br>

### terraform  settings

#### ▼ terraform settingsとは

terraformの実行時に、エントリーポイントとして機能するファイル。

#### ▼ required_providers

AWSやGCPなど、使用するプロバイダを定義する。プロバイダによって、異なるリソースタイプが提供される。一番最初に読みこまれるファイルのため、変数やモジュール化などが行えない。

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

#### ▼ backend

インフラの状態ファイル（```.tfstate```ファイル）を管理する場所を設定する。S3などの実インフラで管理する場合、クレデンシャル情報を設定する必要がある。代わりに、```terraform init```コマンド実行時に指定しても良い。デフォルト値は```local```である。変数を使用できず、ハードコーディングする必要があるため、もし値を動的に変更したい場合は、ローカルマシンでは```providers.tf```ファイルの```backend```オプションを参照し、CDの中で```terraform init```コマンドのオプションを使用して値を渡すようにする。

参考：https://www.terraform.io/language/settings/backends/s3

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

### provider

#### ▼ providerとは

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
  # アカウント認証の設定
}
```

<br>

### multiple providers

#### ▼ multiple providersとは

複数の```provider```を実装し、エイリアスを使用して、これらを動的に切り替える方法。

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

#### ▼ ネストモジュールでproviderを切り替える

ネストモジュールで```provider```を切り替えるには、ルートモジュールで```provider```の値を明示的に渡す必要がある。

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

さらにネストモジュールで、```provider```の値を設定する必要がある。

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

### クレデンシャル情報の設定方法

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

```
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
    # .tfstateファイル名
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

#tokenの代わり（AWS STSを使用する場合）
$ export AWS_SESSION_TOKEN="*****"
```

環境変数を設定すると、値が```provider```に自動的に出力される。CircleCIのような、一時的に環境変数が必要になるような状況では有効な方法である。

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
    key     = "<バケット内のディレクトリ>"
  }
}

# リージョン、アクセスキーID、シークレットアクセスキーは不要
provider "aws" {}
```

<br>

### module

#### ▼ moduleとは

ルートモジュールでネストモジュール読み出し、ネストモジュールに対して変数を渡す。

参考：https://www.terraform.io/language/modules/sources

#### ▼ 同一リポジトリ内から読み込む

同じリポジトリ内にmoduleがある場合に、それを指定して読み込む。

**＊実装例＊**

```terraform
###############################
# ALB
###############################
module "alb" {
  # モジュールのResourceを参照する。
  source = "../modules/alb"
  
  # モジュールに他のモジュールのoutputを渡す。
  acm_certificate_api_arn = module.acm.acm_certificate_api_arn
}
```

#### ▼ 外部リポジトリから読み込む

外部リポジトリにmoduleがある場合に、それを指定して読み込む。外部リポジトリとしては、GitHub、Terraformレジストリ、S3、GCS、などを指定できる。HTTPSやSSHでプロトコルを指定できるが、鍵の登録が不要なHTTPの方が簡単なので推奨である。

```terraform
###############################
# ALB
###############################
module "alb" {
  # モジュールのResourceを参照する。
  # SSHの場合
  source = "github.com/hiroki-hasegawa/terraform-modules.git"
  
  # モジュールに他のモジュールのoutputを渡す。
  acm_certificate_api_arn = module.acm.acm_certificate_api_arn
}
```

サブディレクトリを指定することもできる。リポジトリ以下にスラッシュを２つ（```//```）つけ、その後にパスを続ける。

参考：https://www.terraform.io/language/modules/sources#modules-in-package-sub-directories

```terraform
###############################
# ALB
###############################
module "alb" {
  # モジュールのResourceを参照する。
  # SSHの場合
  source = "github.com/hiroki-hasegawa/terraform-modules.git//module/alb"
  
  # モジュールに他のモジュールのoutputを渡す。
  acm_certificate_api_arn = module.acm.acm_certificate_api_arn
}
```



<br>

## 02. 変数

### 環境変数

#### ▼ 優先順位

上の項目ほど優先される。

参考：https://www.terraform.io/language/values/variables#variable-definition-precedence

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

```bash
# ファイルを指定しなくとも読み込まれる
$ terraform plan
```

#### ▼ ```TF_VAR_<変数名>```

環境変数としてエクスポートしておくと自動的に読み込まれる。```<変数名>```の文字が、実際の変数名としてTerraformに渡される。

```bash
$ printenv

TF_VAR_ecr_version_tag=foo
```

<br>

### ```.tfvars```ファイル

#### ▼ ```.tfvars```ファイルの用途

実行ファイルに入力したい環境変数を定義する。『```terraform.tfvars```』という名前にすると、terraformコマンドの実行時に自動的に読み込まれる。各サービスの間で実装方法が同じため、VPCのみ例を示す。

**＊実装例＊**

```terraform
###############################
# VPC
###############################
vpc_cidr_block = "*.*.*.*/n" # CIDRブロック
```

#### ▼ 値のデータ型

単一値、list型、map型で定義できる。AZ、サブネットのCIDRブロック、RDSのパラメーターグループ値、などはmap型として保持しておくと良い。また、IPアドレスのセット、ユーザーエージェント、などはlist型として保持しておくと良い。なお、RDSのパラメーターグループの適正値については、以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/cloud_computing/cloud_computing_aws.html

**＊実装例＊**

```terraform
###############################################
# RDS
###############################################
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

<br>

### variable 

#### ▼ variableとは

リソースで使用する変数のデータ型を定義する。

**＊実装例＊**

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
```

<br>

### local　

#### ▼ localとは

ネストモジュール内にスコープを持つ変数。ルートモジュールとネストモジュールが別のリポジトリで管理されている場合に有効であり、これらが同じリポジトリにある場合は、環境変数を使用した方が可読性が高くなる。

参考：

- https://www.terraform.io/language/values/locals
- https://febc-yamamoto.hatenablog.jp/entry/2018/01/30/185416

```terraform
locals {
  foo = "FOO"
}

resource "aws_instance" "example" {
  foo = local.foo
}
```

<br>

## 03. リソースの実装

### resource

#### ▼ resourceとは

AWSのAPIに対してリクエストを送信し、クラウドインフラを作成する。

#### ▼ リソースタイプ

操作されるAWSリソースの種類のこと。AWSリソースタイプとTerraformのリソースタイプはおおよそ一致している。

参考：https://docs.aws.amazon.com/config/latest/developerguide/resource-config-reference.html

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

### data

#### ▼ dataとは

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

### output

#### ▼ outputとは

モジュールで作成されたリソースが持つ特定の値を出力する。可読性の観点から、リソース一括ではなく、具体的なattributeを出力するようにした方が良い。

#### ▼ 実装方法

**＊実装例＊**

例として、ALBを示す。```resource```ブロックと```data```ブロックで```output```の方法が異なる。

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
#### ▼ ```count```関数の```output```

ノート内の[こちら](#count)を参考にせよ。

#### ▼ ```for_each```関数の```output```

ノート内の[こちら](#for_each)を参考にせよ。

<br>

## 04. メタ引数

### メタ引数とは

全てのリソースで使用できるオプションのこと。

<br>

### depends_on

#### ▼ depends_onとは

リソース間の依存関係を明示的に定義する。Terraformでは、基本的にリソース間の依存関係が暗黙的に定義されている。しかし、複数のリソースが関わると、リソースを適切な順番で作成できない場合があるため、そういったときに使用する。

#### ▼ ALB target group vs. ALB、ECS

例として、ALB target groupを示す。ALB Target groupとALBのリソースを適切な順番で作成できないため、ECSの作成時にエラーが起こる。ALBの後にALB target groupを作成する必要がある。

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

例として、NAT Gatewayを示す。NAT Gateway、Internet Gateway、のリソースを適切な順番で作成できないため、Internet Gatewayの作成後に、NAT Gatewayを作成するように定義する必要がある。

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

### count

#### ▼ countとは

指定した数だけ、リソースの作成を繰り返す。```count.index```でインデックス数を展開する。

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

#### ▼ list型で```output```

リソースの作成に```count```関数を使用した場合、そのリソースはlist型として扱われる。そのため、キー名を指定して```output```できる。この時、```output```はlist型になる。ちなみに、```for_each```関数で作成したリソースはアスタリスクでインデックス名を指定できないので、注意。

**＊実装例＊**

例として、VPCのサブネットを示す。ここでは、パブリックサブネット、applicationサブネット、datastoreサブネット、を```count```関数で作成したとする。

```terraform
###############################################
# パブリックサブネット
###############################################
resource "aws_subnet" "public" {
  count = 2
  
  # ～ 中略 ～
}

###############################################
# プライベートサブネット
###############################################
resource "aws_subnet" "private_app" {
  count = 2
  
  # ～ 中略 ～
}

resource "aws_subnet" "private_datastore" {
  count = 2
  
  # ～ 中略 ～
}
```

```terraform
###############################################
# Output VPC
###############################################
output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_app_subnet_ids" {
  value = aws_subnet.private_app[*].id
}

output "private_datastore_subnet_ids" {
  value = aws_subnet.private_datastore[*].id
}
```

<br>

### for_each

#### ▼ for_eachとは

事前に```for_each```に格納したmap型の```key```の数だけ、リソースを繰り返し実行する。繰り返し処理を行う時に、```count```とは違い、要素名を指定して出力できる。

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

冗長化されたAZで共通のルートテーブルを作成する場合、そこで、```for_each```関数を使用すると、少ない実装で作成できる。```for_each```関数で作成されたリソースは```apply```中にmap構造として扱われ、リソース名の下層にキー名でリソースが並ぶ構造になっている。これを参照するために、『```<リソースタイプ>.<リソース名>[each.key].<attribute>```』とする

**＊実装例＊**

パブリックサブネット、プライベートサブネット、プライベートサブネットに紐付くNAT Gatewayの設定が冗長化されたAZで共通の場合、```for_each```関数で作成する。

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

#### ▼ 単一値で```output```

リソースの作成に```for_each```関数を使用した場合、そのリソースはmap型として扱われる。そのため、キー名を指定して```output```できる。

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

#### ▼ map型で```output```

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

### dynamic

#### ▼ dynamicとは

指定したブロックを繰り返し作成する。

**＊実装例＊**

例として、RDSパラメーターグループの```parameter```ブロックを、map型変数を使用して繰り返し作成する。

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
      name  = parameter.key
      value = parameter.value
    }
  }
}
```

**＊実装例＊**

例として、WAFの正規表現パターンセットの```regular_expression```ブロックを、list型変数を使用して繰り返し作成する。

```terraform
###############################################
# Variables
###############################################
waf_blocked_user_agents = [
  "FooCrawler",
  "BarSpider",
  "BazBot",
]

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
      regex_string = regular_expression.value
    }
  }
}
```

<br>

### lifecycle

#### ▼ lifecycleとは

リソースの作成、更新、そして削除のプロセスをカスタマイズする。

#### ▼ create_before_destroy

リソースを新しく作成した後に削除するように、変更できる。通常時、Terraformの処理順序として、リソースの削除後に作成が行われる。しかし、他のAWSリソースと依存関係が存在する場合、先に削除が行われることによって、他のAWSリソースに影響が出てしまう。これに対処するために、先に新しいリソースを作成し、紐付けし直してから、削除する必要がある。

**＊実装例＊**

例として、ACMのSSL証明書を示す。ACMのSSL証明書は、ALBやCloudFrontに紐付いており、新しい証明書に紐付け直した後に、既存のものを削除する必要がある。

```terraform
###############################################
# For foo domain
###############################################
resource "aws_acm_certificate" "foo" {

  # ～ 中略 ～

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

  # ～ 中略 ～

  lifecycle {
    create_before_destroy = true
  }
}

###############################################
# RDS Subnet Group
###############################################
resource "aws_db_subnet_group" "this" {

  # ～ 中略 ～

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

  # ～ 中略 ～

  lifecycle {
    create_before_destroy = true
  }
}

###############################################
# Redis Subnet Group
###############################################
resource "aws_elasticache_subnet_group" "redis" {

  # ～ 中略 ～

  lifecycle {
    create_before_destroy = true
  }
}
```

#### ▼ ignore_changes

実インフラのみで起こったリソースの作成・更新・削除を無視し、```tfstate```ファイルに反映しないようにする。これにより、オプションを```ignore_changes```したタイミング以降、実インフラと```tfstate```ファイルに差分があっても、```tfstate```ファイルの値が更新されなくなる。

**＊実装例＊**

例として、ECSを示す。ECSでは、AutoScalingによってECSタスク数が増加する。そのため、これらを無視する必要がある。

```terraform
###############################################
# ECS Service
###############################################
resource "aws_ecs_service" "this" {

  # ～ 中略 ～

  lifecycle {
    ignore_changes = [
      # AutoScalingによるECSタスク数の増減を無視。
      desired_count,
    ]
  }
}
```

**＊実装例＊**

例として、Redisを示す。Redisでは、AutoScalingによってプライマリー数とレプリカ数が増減する。そのため、これらを無視する必要がある。


```terraform
###############################################
# Redis Cluster
###############################################
resource "aws_elasticache_replication_group" "redis" {

  # ～ 中略 ～

  lifecycle {
    ignore_changes = [
      # プライマリー数とレプリカ数の増減を無視します。
      number_cache_clusters
    ]
  }
}
```

**＊実装例＊**

使用例はすくないが、ちなみにリソース全体を無視する場合は```all```値を設定する。

```terraform
resource "aws_foo" "foo" {

  # ～ 中略 ～

  lifecycle {
    ignore_changes = all
  }
}
```

<br>

## 05. tpl形式の切り出しと読み出し

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

参考：https://www.terraform.io/language/expressions/references#filesystem-and-workspace-info

| 変数                      | 値                                                     | 例                         |
| ------------------------- | ------------------------------------------------------ | -------------------------- |
| ```path.module```         | ```path```式が実行された```.tf```ファイルがあるディレクトリのパス。 | ```/project/module/foo/``` |
| ```path.root```           | terraformコマンドの作業ディレクトリのパス              | ```/var/www/```            |
| ```path.root```           | ```module```ディレクトリのルートパス                   | ```/project/module/```     |
| ```terraform.workplace``` | 現在使用しているワークスペース名                       | ```prd```                  |

<br>

### ポリシーのアタッチ

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

   # 〜 中略 〜

}
```

#### ▼ 設定方法

integer型を変数として渡せるように、拡張子をjsonではなくtplとするのが良い。```image```キーでは、ECRイメージのURLを設定する。バージョンタグは任意で指定でき、もし指定しない場合は、『```latest```』という名前のタグが自動的に割り当てられる。バージョンタグにハッシュ値が割り当てられている場合、Terraformでは時系列で最新のタグ名を取得する方法がないため、```secrets```キーでは、Systems Managerパラメータストアの値を参照できる。ログ分割の目印を設定する```awslogs-datetime-format```キーでは、タイムスタンプを表す```\\[%Y-%m-%d %H:%M:%S\\]```を設定すると良い。これにより、同じ時間に発生したログを1つのログとしてまとめられるため、スタックトレースが見やすくなる。

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

