---
title: 【知見を記録するサイト】設計ポリシー＠Terraform
description: 設計ポリシー＠Terraformの知見をまとめました．
---

# 設計ポリシー＠Terraform

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. バージョン

### バージョン管理

#### ▼ ```lock```ファイル

現在使用中のプロバイダーのバージョンが定義される．これにより，他の人がリポジトリを使用する時に，異なるバージョンのプロバイダーを宣言できないようにする．もし，異なるバージョンを使用したい場合は，以下のコマンドを実行する．これにより，```lock```ファイルのアップグレード/ダウングレードが実行される．

```bash
$ terraform init -upgrade
```

<br>

### Terraformとプロバイダーのアップグレード

#### 1. 現在のTerraformのバージョンで```terraform apply```コマンドを実行

アップグレードと同時に新しいクラウドプロバイダーのリソースをデプロイせずに，アップグレードのみに専念する．そのために，現在のTerraformのバージョンで```terraform apply```コマンドを実行し，差分が無いようにしておく．

#### 2. アップグレード以外の作業を済ませておく

低いバージョンのTerraformに対して，より高いバージョンはデプロイできる．しかし，高いバージョンのTerraformに対して，より低いバージョンをデプロイできない．そのため，アップグレードしてしまうと，それ以外のTerraformバージョンの異なる作業に影響が出る．

#### 3. メジャーバージョン単位でアップグレード＆リリース

Terraformでは，メジャーバージョン単位でアップグレードを行うことが推奨されている．そのため，現在のバージョンと最新バージョンがどんなに離れていても，必ず1つずつメジャーバージョンをアップグレードするように気をつける．この時，次のメジャーバージョンの『最新』までアップグレードしてしまって問題ない（例：現在のバージョンが `v0.13.0` であれば，`0.14`系の最新にアップグレード）．また，アップグレードの都度，リリースを行う．

参考：https://www.terraform.io/upgrade-guides/1-0.html 

#### 4. ```terraform plan```コマンドの警告/エラーを解決

アップグレードに伴って，非推奨/廃止の機能がリリースされ，警告/エラーが出力される場合がある．警告/エラーを解決できるように，記法やオプション値を修正する．場合によってはtfstateファイルの差分として表示されているだけで，実インフラとの差分ではない場合もあるため，```terraform plan```コマンド時に差分があったとしても，実インフラに影響がなければ問題ない．

#### 5. プロバイダーをアップグレードしたい場合はTerraformもアップグレード

Terraformとプロバイダーのバージョンは独立して管理されている．プロバイダーはTerraformが土台になって稼働するため，もしプロバイダーをアップグレードしたい場合は，Terraformもアップグレードする．一方で，Terraformをアップグレードしたい場合は，必ずしもプロバイダーをアップグレードする必要はない．アップグレードガイドについては，以下のリンクを参考せよ．

参考：

- Terraform：https://www.terraform.io/language/upgrade-guides
- AWSプロバイダー：https://registry.terraform.io/providers/hashicorp/aws/latest/docs/guides/version-4-upgrade

#### 6. Terraformとプロバイダーのアップグレードは別々にリリース

プロバイダーをアップグレードしたい場合はTerraformもアップグレードすることになる．この場合，できるだけリリースは分けた方が良い．Terraformまたはプロバイダーのアップグレードを別々にリリースするようにすれば，リリース時にインシデントが起こった時に，どちらが原因なのかを明確化できる．反対に，一緒にリリースしてしまうとどちらが原因なのかわかりにくくなってしまう．

<br>

## 02. ディレクトリ構成

### リポジトリ

#### ▼ アプリケーションとは別（推奨）

アプリケーションとは異なるリポジトリにて，tfファイルを配置する．推奨である．

```bash
repository/
├── foo.tf
...
```

#### ▼ アプリケーションと同じ（非推奨）

アプリケーションと同じリポジトリにて，```terraform```ディレクトリを作成し，ここにtfファイルを配置する．非推奨である．

```bash
repository/
├── src/ # アプリケーション
├── terraform/
│   ├── foo.tf
...
```

<br>

### ルートモジュールの構成

#### ▼ 稼働環境別

稼働環境別に，```foo.tfvars```ファイルで値を定義する．

```bash
repository/
├── modules/
│   ├── route53/ # Route53
│   │   ├── dev/ # 開発
│   |   ├── prd/ # 本番
│   |   └── stg/ # ステージング
│   | 
│   ├── ssm/ # SSM
|   |   ├── dev/
│   |   ├── prd/
│   |   └── stg/
│   | 
│   └── waf/ # WAF
|       ├── dev/
│       ├── prd/
│       └── stg/
|
├── dev/ # 開発環境ルートモジュール
│   ├── dev.tfvars
│   ├── main.tf
│   ├── providers.tf
│   ├── tfnotify.yml
│   └── variables.tf
│
├── prd/ # 本番環境ルートモジュール
│   ├── prd.tfvars
│   ├── main.tf
│   ├── providers.tf
│   ├── tfnotify.yml
│   └── variables.tf
│
└── stg/ # ステージング環境ルートモジュール
    ├── stg.tfvars
    ├── main.tf
    ├── providers.tf
    ├── tfnotify.yml
    └── variables.tf
```

<br>

### リソースモジュールの構成

#### ・対象リソース別

1つのリソースの設定が対象のリソースごとに異なる場合，冗長性よりも保守性を重視して，リソースに応じたディレクトリに分割する．Lambdaでは，Lambda関数のソースコードをモジュール下で管理する．

```bash
repository/
└── modules/
    ├── cloudwatch/ # CloudWatch
    │   ├── alb/        # ALB
    |   ├── cloudfront/ # CloudFront
    |   ├── ecs/        # ECS
    |   ├── lambda/     # Lambda
    |   |   └── functions/
    |   |       └── foo_function/
    |   |
    |   └── rds/        # RDS    
    |
    └── waf/ # WAF
        ├── alb/         # ALB
        ├── api_gateway/ # API Gateway
        └── cloudfront/  # CloudFront
```

#### ▼ 稼働環境別

1つのリソースの設定が稼働環境ごとに異なる場合，冗長性よりも保守性を重視して，稼働環境に応じたディレクトリに分割する．

```bash
repository/
└── modules/
    ├── route53/ # Route53
    │   ├── dev/ # 開発
    |   ├── prd/ # 本番
    |   └── stg/ # ステージング
    | 
    ├── ssm/ # SSM
    |   ├── dev/
    |   ├── prd/
    |   └── stg/
    | 
    └── waf/ # WAF
        └── alb/ 
            ├── dev/
            ├── prd/
            └── stg/
```

#### ▼ リージョン別

1つのリソースの設定がリージョンごとに異なる場合，冗長性よりも保守性を重視して，リージョンに応じたディレクトリに分割する．

```bash
repository/
└── modules/
    └── acm/ # ACM
        ├── ap-northeast-1/ # 東京リージョン
        └── us-east-1/      # バージニアリージョン  
```

#### ▼ 共通セット別

WAFで使用するIPパターンセットと正規表現パターンセットには，CloudFrontタイプとRegionalタイプがある．Regionalタイプは，同じリージョンの異なるクラウドプロバイダーのリソース間で共通して使用できるため，共通セットとしてディレクトリ分割を行う．

```bash
repository/
└── modules/
    └── waf/ # WAF
        ├── alb/
        ├── api_gateway/
        ├── cloudfront/
        └── regional_sets/ # Regionalタイプのセット
            ├── ip_sets/   # IPセット
            |   ├── prd/
            |   └── stg/
            |    
            └── regex_pattern_sets/ # 正規表現パターンセット
                ├── prd/
                └── stg/
```

#### ▼ ファイルの切り分け

ポリシーのためにJSONを定義する場合，Terraformのコードにハードコーディングせずに，切り分けるようにする．また，『カスタマー管理ポリシー』『インラインポリシー』『信頼ポリシー』も区別し，ディレクトリを分割している．なお，```templatefile```メソッドでこれを読みこむ時，```bash```ファイルではなく，tplファイルとして定義しておく必要あるため，注意する．

```bash
repository/
└── modules/
    ├── ecr/ #ECR
    │   └── ecr_lifecycle_policy.tpl # ECRライフサイクル
    │
    ├── ecs/ # ECS
    │   └── container_definitions.tpl # コンテナ定義
    │
    ├── iam/ # IAM
    │   └── policies/
    |       ├── customer_managed_policies/ # カスタム管理ポリシー
    |       |   ├── aws_cli_executor_access_policy.tpl
    |       |   ├── aws_cli_executor_access_address_restriction_policy.tpl
    |       |   ├── cloudwatch_logs_access_policy.tpl
    |       |   └── lambda_edge_execution_policy.tpl
    |       |     
    |       ├── inline_policies/ # インラインポリシー
    |       |   └── ecs_task_policy.tpl
    |       |     
    |       └── trust_policies/ # 信頼ポリシー
    |           ├── cloudwatch_events_policy.tpl
    |           ├── ecs_task_policy.tpl
    |           ├── lambda_policy.tpl
    |           └── rds_policy.tpl
    |
    └── s3/ # S3
        └── policies/ # バケットポリシー
            └── alb_bucket_policy.tpl
```

<br>

### CI/CDディレクトリ

#### ▼ opsディレクトリ

TerraformのCI/CDで必要なシェルスクリプトは，```ops```ディレクトリで管理する．

```bash
repository/
├── .circleci/ # CI/CDツールの設定ファイル
└── ops/ # TerraformのCI/CDの自動化シェルスクリプト
```

<br>

## 03. 命名規則と並び順

### module

#### ▼ 命名規則

ディレクトリ名で命名する．スネークケースによる命名を採用する．

#### ▼ 並び順

環境変数を並べる```# Variables```コメントと，モジュール間の値を受け渡しを並べる```# Output values```コメントに分ける．```# Variables```コメントの部分では，```terraform.tfvars```ファイルと同じ並び順になるようにする．また，```# Output values```コメントの部分では，```output```をモジュールに渡す時にクラウドプロバイダーのリソースのアルファベット順で並べる．

```terraform
###############################################
# ALB root module
###############################################
module "alb" {
  source = "../modules/alb"

  # Variables
  environment                   = var.environment                   # General
  region                        = var.region
  service                       = var.service
  alb_listener_port_http        = var.alb_listener_port_http        # ALB
  alb_listener_port_https       = var.alb_listener_port_https
  ecs_container_nginx_port_http = var.ecs_container_nginx_port_http # ECS

  # Output values
  api_acm_certificate_arn                = module.acm_an1.api_acm_certificate_arn
  global_accelerator_acm_certificate_arn = module.acm_an1.global_accelerator_acm_certificate_arn
  alb_s3_bucket_id                       = module.s3.alb_s3_bucket_id
  alb_security_group_id                  = module.security_group.alb_security_group_id
  public_a_subnet_id                     = module.vpc.public_a_subnet_id
  public_c_subnet_id                     = module.vpc.public_c_subnet_id
  vpc_id                                 = module.vpc.vpc_id
}
```

<br>

### 変数

#### ▼ 命名規則

複数の値を持つlist型やmap型の変数であれば複数形で命名する．一方で，string型など値が1つしかなければ単数形とする．

**＊実装例＊**

例として，VPCを示す．

```terraform
###############################################
# VPC variables
###############################################
vpc_availability_zones             = { a = "a", c = "c" }
vpc_cidr                           = "n.n.n.n/23"
vpc_subnet_private_datastore_cidrs = { a = "n.n.n.n/27", c = "n.n.n.n/27" }
vpc_subnet_private_app_cidrs       = { a = "n.n.n.n/25", c = "n.n.n.n/25" }
vpc_subnet_public_cidrs            = { a = "n.n.n.n/27", c = "n.n.n.n/27" }
```

#### ▼ 並び順

Generalの変数を先頭に配置し，その他のクラウドプロバイダーのリソース別のものはアルファベット順に変数を並べる．

<br>

### 環境変数

#### ▼ 命名規則

環境変数は，```.tfvars```ファイルでは定義できる．複数のリソースで使用する場合（将来的にそうなる可能性も含めて）は，Generalに配置し，グローバルな名前を付ける．クラウドプロバイダーのリソースのアルファベット順に環境変数を並べる．

```terraform
###############################################
# General
###############################################
camel_case_prefix = "Bar"
region            = "ap-northeast-1"
environment       = "stg"
service           = "bar"
```

環境変数の名前は以下のようにする．

```terraform
# 種類が無い時（thisの時）
# 例：ecs_service_desired_count = 2
<使用するクラウドプロバイダーのリソースの名前>_<オプション名> = ****


# 種類がある時
# 例：ecs_task_cpu = 1024
<使用するクラウドプロバイダーのリソースの名前>_<種類名>_<オプション名> = ****
```

list型またはmap型であれば複数形，それ以外であれば単数形とする．

```terraform
###############################################
# Route53
###############################################

# ～ 中略 ～

###############################################
# VPC
###############################################

# ～ 中略 ～

###############################################
# WAF
###############################################
waf_blocked_user_agents = [
  "AdCrawler",
]
```

#### ▼ 並び順

クラウドプロバイダーのリソースのアルファベット順に環境変数を並べる．

<br>

### resource，data

#### ▼ 種類がある場合

リソース名で，リソースタイプを繰り返さないようにする．もし種類がある場合，リソース名でその種類を表現する．

**＊実装例＊**

例として，VPCを示す．

```terraform
###############################################
# VPC ルートテーブル
###############################################

# 良い例
resource "aws_route_table" "public" {

}

resource "aws_route_table" "private" {

}
```

```terraform
###############################################
# VPC ルートテーブル
###############################################

# 悪い例
resource "aws_route_table" "route_table_public" {

}

resource "aws_route_table" "route_table_private" {

}
```

#### ▼ 種類が無い場合

1つのリソースタイプに，1つのリソースしか種類が存在しない場合，```this```で命名する．`this`と命名されたresourceで，後から種類が増える場合は，既存の`this`は後からリファクタリングするとして，新規リソースには種類名を名付ける．ただし，リファクタリングすることが大変なため，非推奨である．

**＊実装例＊**

```terraform
resource "aws_internet_gateway" "this" {

}
```

#### ▼ 接頭辞，接尾辞

Lambda以外では，構築されるクラウドプロバイダーのリソースの名前は以下の通りとする．

- ケバブケース
- `<接頭辞>-<種類>-<接尾辞>`とする．
- 接頭辞は， `<稼働環境>-<サービス名>`とする．
- 接尾辞は，クラウドプロバイダーのリソース名とする．

**＊実装例＊**

例として，CloudWatchを示す．

- 接尾辞は， `<稼働環境>-<サービス名>`
- 種類は，alb-httpcode-4xx-count
- クラウドプロバイダーのリソース名は，CloudWatchAlarmを省略してAlarm

```terraform
resource "aws_cloudwatch_metric_alarm" "alb_httpcode_target_4xx_count" {

  alarm_name = "prd-foo-alb-httpcode-target-4xx-count-alarm"
  
}
```

LambdaではLambda関数が稼働する．接尾辞にfunctionとつけることは冗長と判断したため，関数名のみで命名する．

**＊実装例＊**

例として，Lambdaをしめす．

- 接尾辞は， `<稼働環境>-<サービス名>`
- 種類は，echo-helloworld
- クラウドプロバイダーのリソース名のlambdaは省略する．

```terraform
resource "aws_lambda_function" "echo_helloworld" {

  function_name    = "prd-foo-echo-helloworld"
  
}
```

#### ▼ 設定の並び順，行間

最初に`count`や`for_each`を設定し改行する．その後，各リソース別の設定を行間を空けずに記述する（この順番にルールはなし）．最後に共通の設定として，`tags`，`depends_on`，`lifecycle`，の順で配置する．ただし実際，これらの全ての設定が必要なリソースはない．

**＊実装例＊**

```terraform
###############################################
# EXAMPLE
###############################################
resource "aws_baz" "this" {
  for_each = var.vpc_availability_zones # 最初にfor_each
  # スペース
  subnet_id = aws_subnet.public[*].id # 各設定（順番にルールなし）
  # スペース
  tags = {
    Name = format(
      "prd-foo-%d-baz",
      each.value
    )
  }
  # スペース
  depends_on = []
  # スペース
  lifecycle {
    create_before_destroy = true
  }
}
```

<br>

### output

#### ▼ 種類がある場合

『```<リソース名>_<リソースタイプ>_<attribute名>```』で命名する．可読性の観点から，リソース一括ではなく，具体的なattributeを出力する．

**＊実装例＊**

例として，CloudWatchを示す．リソース名は`ecs_container_nginx`，リソースタイプは`aws_cloudwatch_log_group`，attributeは`name`オプションである．

```terraform
output "ecs_container_nginx_cloudwatch_log_group_name" {
  value = aws_cloudwatch_log_group.ecs_container_nginx.name
}
```

**＊実装例＊**

例として，IAM Roleを示す．

```terraform
###############################################
# Output IAM Role
###############################################
output "ecs_task_execution_iam_role_arn" {
  value = aws_iam_role.ecs_task_execution.arn
}

output "lambda_execute_iam_role_arn" {
  value = aws_iam_role.lambda_execute.arn
}

output "rds_enhanced_monitoring_iam_role_arn" {
  value = aws_iam_role.rds_enhanced_monitoring.arn
}
```

#### ▼ 種類が無い場合

リソース名が```this```である場合，```output```名ではこれを省略しても良い．

**＊実装例＊**

例として，ALBを示す．

```terraform
###############################################
# Output ALB
###############################################
output "alb_zone_id" {
  value = aws_lb.this.zone_id
}

output "alb_dns_name" {
  value = aws_lb.this.dns_name
}
```

#### ▼ 冗長な場合

ルール通りに命名すると，一部のクラウドプロバイダーのリソースで冗長な名前になってしまうことがある．この場合は，省略を許容する．

**＊実装例＊**

ルール通りに名付けると，『```laravel_ecr_repository_repository_url```』というoutput名になってしまう．repositoryが二回繰り返されることになるため，1つ省略している．

```terraform
###############################################
# Output ECR
###############################################
output "laravel_ecr_repository_url" {
  value = aws_ecr_repository.laravel.repository_url
}

output "nginx_ecr_repository_url" {
  value = aws_ecr_repository.nginx.repository_url
}
```

<br>

### descriptionオプション

一部のクラウドプロバイダーのリソースでは，`description`オプションで説明文を設定できる．基本的には英語で説明する．また，文章ではなく，『関係代名詞/形容詞/副詞/前置詞＋単語』を使用して，『〇〇 な △△』『〇〇 の △△』といった説明になるようにする．

<br>

## 04. 開発環境

### 開発方法

前提として，バックエンドにS3を使用しているものとする．Makefileのコマンドを実行する前に，```provider.tf```ファイルのbackendオプションを，『s3』から『local』に変更する．

```terraform
terraform {

  backend "local" {
  }
}
```

GitHubにこの変更をプッシュしないように気を付ける必要がある．ただ，バックエンドに```s3```を指定する```terraform init```コマンドをCIのステップを設けておけば，```provider.tf```ファイルで```local```の指定していことがエラーになるような仕組みを作れる．もし間違えてコミットしてしまった場合は，元に戻すように再コミットすればよい．

```bash
#!/bin/bash

terraform -chdir=./prd init \
  -upgrade \
  -reconfigure \
  -backend=true \
  -backend-config="bucket=prd-foo-tfstate-bucket" \
  -backend-config="key=terraform.tfstate" \
  -backend-config="encrypt=true"
```

```bash
Error: Invalid backend configuration argument

The backend configuration argument "bucket" given on the command line is not expected for the selected backend type.
```

<br>

### ファイル

#### ▼ docker-compose.ymlファイル

```yaml
version: "3.8"

services:
  terraform:
    container_name: foo-terraform
    image: hashicorp/terraform:1.0.11
    volumes:
      - .:/var/infra
    working_dir: /var/infra
```

#### ▼ Makefile

goのバイナリファイルを実行するためには，```docker-compose run```コマンドの実行する必要がある．ただ，実行のたびにコンテナが増えてしまうため，```--rm```を使用するようにする．また，毎度コマンドを実行することが面倒なので，Makefileでまとめてしまう．

```makefile
# NOTE:
# ローカル環境にて，以下の形式でコマンドを実行できます．
# make <ターゲット名> env=<環境ディレクトリ名>

env=

init:
	docker-compose run --rm terraform -chdir=./${ENV} init -reconfigure

fmt:
	docker-compose run --rm terraform fmt -recursive

validate: init fmt
	docker-compose run --rm terraform -chdir=./${ENV} validate
```



## 05. レビュー手順

### （１）コンソール画面にログイン

ただコードを眺めているより，レビュー対象がコンソール画面のどこに相当するのかも並行して確認した方が，Terraformを理解しやすい．コンソール画面にログインする．

<br>

### （２）クラウドプロバイダーのドキュメントや技術記事を確認

コンソール画面の相当する設定箇所がわかったところで，設定値が正しいかどうかを確認する．以下を確認する．

- クラウドプロバイダーのドキュメント
- 技術記事

<br>

### （３）Terraformのドキュメントや技術記事を確認

AWSを構築する場合，TerraformのAWSプロバイダーを使用している．以下を確認する．

- TerraformのAWSプロバイダーのドキュメント：https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- 技術記事

注意点として，AWSプロバイダーのバージョンを確認し，リファレンスの閲覧バージョンを切り替える必要がある．以下の点でレビューする．

- プロジェクトの設計ポリシーに即しているか
- リファレンスに非推奨と注意書きされた方法で実装していないか
- リリースの粒度は適切か

<br>

### （４）developブランチへのマージは問題ないか

developブランチにマージするコミット = 次にリリースするコミット である．他にリリースの優先度が高い対応がある場合，またリリースの粒度が大きすぎる場合，同時にリリースしないように，developブランチへのマージに『待った！』をかけること．

<br>
