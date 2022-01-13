# ポリシー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. バージョン

### バージョン管理

#### ・```lock```ファイル

現在使用中のプロバイダーのバージョンが定義される。これにより、他の人がリポジトリを用いる時に、異なるバージョンのプロバイダーを宣言できないようにする。もし、異なるバージョンを用いたい場合は、以下のコマンドを実行する。これにより、```lock```ファイルのアップグレード/ダウングレードが実行される。

```bash
$ terraform init -upgrade
```

<br>

### Terraform/プロバイダーのアップグレード

#### 1. 現在のTerraformのバージョンで```apply```コマンドを実行

アップグレードと同時に新しいAWSリソースをデプロイせずに、アップグレードのみに専念する。そのために、現在のTerraformのバージョンで```apply```コマンドを実行し、差分が無いようにしておく。

#### 2. アップグレード以外の作業を済ませておく

低いバージョンのTerraformに対して、より高いバージョンをデプロイすることは可能である。反対に、高いバージョンのTerraoformに対して、より低いバージョンをデプロイできない。そのため、アップグレードしてしまうと、それ以外のTeraformバージョンの異なる作業に影響が出る。

#### 3. メジャーバージョン単位でアップグレード

Terraformでは、メジャーバージョン単位でアップグレードを行うことが推奨されている。そのため、現在のバージョンと最新バージョンがどんなに離れていても、必ず1つずつメジャーバージョンをアップグレードするように気をつける。

参考：https://www.terraform.io/upgrade-guides/1-0.html 

#### 4. ```plan```コマンドの警告/エラーを解消

アップグレードに伴って、非推奨/廃止の機能がリリースされ、警告/エラーが出力される場合がある。警告/エラーを解消できるように、記法やオプション値を修正する。場合によってはtfstateファイルの差分として表示されているだけで、実インフラとの差分ではない場合もあるため、```plan```コマンド時に差分があったとしても、実インフラに影響がなければ問題ない。

#### 5. プロバイダーをアップグレードしたい場合はTerraformもアップグレード

Terraformとプロバイダーのバージョンは独立して管理されている。プロバイダーはTerraformが土台になって稼働するため、もしプロバイダーをアップグレードしたい場合は、Terraformもアップグレードする。一方で、Terraformをアップグレードしたい場合は、必ずしもプロバイダーをアップグレードする必要はない。

#### 6. Terraformとプロバイダーのアップグレードは別々にリリース

プロバイダーをアップグレードしたい場合はTerraformもアップグレードすることになる。この場合、可能であればリリースは分けた方が良い。Terraformまたはプロバイダーのアップグレードを別々にリリースするようにすれば、リリース時にインシデントが起こった時に、どちらが原因なのかを明確化できる。反対に、一緒にリリースしてしまうとどちらが原因なのかわかりにくくなってしまう。

<br>

##  02. ディレクトリ構成

### ルートモジュールの構成

#### ・稼働環境別

稼働環境別に、```foo.tfvars```ファイルで値を定義する。

```bash
terraform_project/
├── modules
│   ├── route53 # Route53
│   │   ├── dev # 開発
│   |   ├── prd # 本番
│   |   └── stg # ステージング
│   | 
│   ├── ssm # SSM
|   |   ├── dev
│   |   ├── prd
│   |   └── stg
│   | 
│   └── waf # WAF
|       ├── dev
│       ├── prd
│       └── stg
|
├── dev # 開発環境ルートモジュール
│   ├── dev.tfvars
│   ├── main.tf
│   ├── providers.tf
│   ├── tfnotify.yml
│   └── variables.tf
│
├── prd # 本番環境ルートモジュール
│   ├── prd.tfvars
│   ├── main.tf
│   ├── providers.tf
│   ├── tfnotify.yml
│   └── variables.tf
│
└── stg # ステージング環境ルートモジュール
      ├── stg.tfvars
      ├── main.tf
      ├── providers.tf
      ├── tfnotify.yml
      └── variables.tf
```

<br>

### リソースのモジュールの構成

####　・対象リソース別

1つのリソースの設定が対象のリソースごとに異なる場合、冗長性よりも保守性を重視して、リソースに応じたディレクトリに分割する。

```bash
terraform_project/
└── modules
    ├── cloudwatch # CloudWatch
    │   ├── alb        # ALB
    |   ├── cloudfront # CloudFront
    |   ├── ecs        # ECS
    |   ├── lambda     # Lambda
    |   └── rds        # RDS    
    |
    └── waf # WAF
        ├── alb         # ALB
        ├── api_gateway # API Gateway
        └── cloudfront  # CloudFront
```

#### ・稼働環境別

1つのリソースの設定が稼働環境ごとに異なる場合、冗長性よりも保守性を重視して、稼働環境に応じたディレクトリに分割する。

```bash
terraform_project/
└── modules
    ├── route53 # Route53
    │   ├── dev # 開発
    |   ├── prd # 本番
    |   └── stg # ステージング
    | 
    ├── ssm # SSM
    |   ├── dev
    |   ├── prd
    |   └── stg
    | 
    └── waf # WAF
        └── alb 
            ├── dev
            ├── prd
            └── stg
```

#### ・リージョン別

1つのリソースの設定がリージョンごとに異なる場合、冗長性よりも保守性を重視して、リージョンに応じたディレクトリに分割する。

```bash
terraform_project/
└── modules
    └── acm # ACM
        ├── ap-northeast-1 # 東京リージョン
        └── us-east-1      # バージニアリージョン  
```

#### ・共通セット別

WAFで用いるIPパターンセットと正規表現パターンセットには、CloudFrontタイプとRegionalタイプがある。Regionalタイプは、同じリージョンの異なるAWSリソース間で共通して使用できるため、共通セットとしてディレクトリ分割を行う。

```bash
terraform_project/
└── modules
    └── waf # WAF
        ├── alb
        ├── api_gateway
        ├── cloudfront       
        └── regional_sets # Regionalタイプのセット
            ├── ip_sets   # IPセット
            |   ├── prd
            |   └── stg
            |    
            └── regex_pattern_sets # 正規表現パターンセット
                ├── prd
                └── stg
```

#### ・ファイルの切り分け

ポリシーのためにJSONを定義する場合、Terraformのソースコードにハードコーディングせずに、切り分けるようにする。また、『カスタマー管理ポリシー』『インラインポリシー』『信頼ポリシー』も区別し、ディレクトリを分割している。なお、```templatefile```メソッドでこれを読みこむ時、```bash```ファイルではなく、tplファイルとして定義しておく必要あるため、注意する。

```bash
terraform_project/
└── modules 
    ├── ecr #ECR
    │   └── ecr_lifecycle_policy.tpl # ECRライフサイクル
    │
    ├── ecs # ECS
    │   └── container_definitions.tpl # コンテナ定義
    │
    ├── iam # IAM
    │   └── policies  
    |       ├── customer_managed_policies # カスタム管理ポリシー
    |       |   ├── aws_cli_executor_access_policy.tpl
    |       |   ├── aws_cli_executor_access_address_restriction_policy.tpl
    |       |   ├── cloudwatch_logs_access_policy.tpl
    |       |   └── lambda_edge_execution_policy.tpl
    |       |     
    |       ├── inline_policies # インラインポリシー
    |       |   └── ecs_task_policy.tpl
    |       |     
    |       └── trust_policies # 信頼ポリシー
    |           ├── cloudwatch_events_policy.tpl
    |           ├── ecs_task_policy.tpl
    |           ├── lambda_policy.tpl
    |           └── rds_policy.tpl
    |
    └── s3 # S3
        └── policies # バケットポリシー
            └── alb_bucket_policy.tpl
```

<br>

### CI/CDディレクトリ

#### ・opsディレクトリ

TerraformのCI/CDで必要なシェルスクリプトは、```ops```ディレクトリで管理する。

```bash
terraform_project/
├── .circleci # CI/CDツールの設定ファイル
└── ops # TerraformのCI/CDの自動化シェルスクリプト
```

<br>

## 03. 命名規則と並び順

### module

#### ・命名規則

ディレクトリ名で命名する。スネークケースによる命名を採用する。

#### ・並び順

環境変数を並べる`# Variables`と、モジュール間の値を受け渡しを並べる`# Output values`に分ける。```# Variables```の部分では、```terraform.tfvars```ファイルと同じ並び順になるようにする。また、```# Output values```の部分では、```output```をモジュールに渡す時にAWSリソースのアルファベット順で並べる。

```elixir
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

#### ・命名規則

複数の値を持つlist型やmap型の変数であれば複数形で命名する。一方で、string型など値が1つしかなければ単数形とする。

**＊実装例＊**

例として、VPCを示す。

```elixir
###############################################
# VPC variables
###############################################
vpc_availability_zones             = { a = "a", c = "c" }
vpc_cidr                           = "n.n.n.n/23"
vpc_subnet_private_datastore_cidrs = { a = "n.n.n.n/27", c = "n.n.n.n/27" }
vpc_subnet_private_app_cidrs       = { a = "n.n.n.n/25", c = "n.n.n.n/25" }
vpc_subnet_public_cidrs            = { a = "n.n.n.n/27", c = "n.n.n.n/27" }
```

#### ・並び順

Generalの変数を先頭に置き、その他のAWSリソース別のものはアルファベット順に変数を並べる。

<br>

### 環境変数

#### ・命名規則

tfvarsファイルでは環境変数を定義できる。複数のリソースで使用する場合（将来的にそうなる可能性も含めて）は、Generalに置き、グローバルな名前を付ける。AWSリソースのアルファベット順に環境変数を並べる。

```elixir
###############################################
# General
###############################################
camel_case_prefix = "Bar"
region            = "ap-northeast-1"
environment       = "stg"
service           = "bar"
```

環境変数の名前は以下のようにする。

```elixir
# 種類が無い時（thisの時）
# 例：ecs_service_desired_count = 2
<使用するAWSリソースの名前>_<オプション名> = ****


# 種類がある時
# 例：ecs_task_lumonde_front_ssr_cpu = 1024
<使用するAWSリソースの名前>_<種類名>_<オプション名> = ****
```

list型またはmap型であれば複数形、それ以外であれば単数形とする。

```elixir
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

#### ・並び順

AWSリソースのアルファベット順に環境変数を並べる。

<br>

### resource、data

#### ・種類がある場合

リソース名で、リソースタイプを繰り返さないようにする。もし種類がある場合、リソース名でその種類を表現する。

**＊実装例＊**

例として、VPCを示す。

```elixir
###############################################
# VPC route table
###############################################

# 良い例
resource "aws_route_table" "public" {

}

resource "aws_route_table" "private" {

}
```

```elixir
###############################################
# VPC route table
###############################################

# 悪い例
resource "aws_route_table" "route_table_public" {

}

resource "aws_route_table" "route_table_private" {

}
```

#### ・種類が無い場合

1つのリソースタイプに、1つのリソースしか種類が存在しない場合、```this```で命名する。`this`と命名されたresourceで、後から種類が増える場合は、既存の`this`は後からリファクタリングするとして、新規リソースには種類名を名付ける。ただし、リファクタリングすることが大変なため、非推奨である。

**＊実装例＊**

```elixir
resource "aws_internet_gateway" "this" {

}
```

#### ・接頭辞、接尾辞

Lambda以外では、構築されるAWSリソースの名前は以下の通りとする。

- ケバブケース
- `<接頭辞>-<種類>-<接尾辞>`とする。
- 接頭辞は、 `<稼働環境>-<サービス名>`とする。
- 接尾辞は、AWSリソース名とする。

**＊実装例＊**

例として、CloudWatchを示す。

- 接尾辞は、 `<稼働環境>-<サービス名>`
- 種類は、alb-httpcode-4xx-count
- AWSリソース名は、CloudWatchAlarmを省略してAlarm

```elixir
resource "aws_cloudwatch_metric_alarm" "alb_httpcode_target_4xx_count" {

  alarm_name = "prd-foo-alb-httpcode-target-4xx-count-alarm"
  
}
```

LambdaではLambda関数が稼働する。接尾辞にfunctionとつけることは冗長と判断したため、関数名のみで命名する。

**＊実装例＊**

例として、Lambdaをしめす。

- 接尾辞は、 `<稼働環境>-<サービス名>`
- 種類は、echo-helloworld
- AWSリソース名のlambdaは省略する。

```elixir
resource "aws_lambda_function" "echo_helloworld" {

  function_name    = "prd-foo-echo-helloworld"
  
}
```

#### ・設定の並び順、行間

最初に`count`や`for_each`を設定し改行する。その後、各リソース別の設定を行間を空けずに記述する（この順番にルールはなし）。最後に共通の設定として、`tags`、`depends_on`、`lifecycle`、の順で配置する。ただし実際、これらの全ての設定が必要なリソースはない。

**＊実装例＊**

```elixir
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

#### ・種類がある場合

『```<リソース名>_<リソースタイプ>_<attribute名>```』で命名する。可読性の観点から、リソース一括ではなく、具体的なattributeを出力する。

**＊実装例＊**

例として、CloudWatchを示す。リソース名は`ecs_container_nginx`、リソースタイプは`aws_cloudwatch_log_group`、attributeは`name`オプションである。

```elixir
output "ecs_container_nginx_cloudwatch_log_group_name" {
  value = aws_cloudwatch_log_group.ecs_container_nginx.name
}
```

**＊実装例＊**

例として、IAM Roleを示す。

```elixir
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

#### ・種類が無い場合

リソース名が```this```である場合、```output```名ではこれを省略してもよい。

**＊実装例＊**

例として、ALBを示す。

```elixir
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

#### ・冗長な場合

ルール通りに命名すると、一部のAWSリソースで冗長な名前になってしまうことがある。この場合は、省略を許容する。

**＊実装例＊**

ルール通りに名付けると、『```laravel_ecr_repository_repository_url```』というoutput名になってしまう。repositoryが二回繰り返されることになるため、一つ省略している。

```elixir
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

一部のAWSリソースでは、`description`オプションで説明文を設定できる。基本的には英語で説明する。また、文章ではなく、『関係代名詞/形容詞/副詞/前置詞 ＋ 単語』を用いて、『〇〇 な △△』『〇〇 の △△』といった説明になるようにする。

<br>

## 04. レビュー手順

### （１）コンソール画面にログイン

ただソースコードを眺めているより、レビュー対象がコンソール画面のどこに相当するのかも並行して確認した方が、Terraformを理解しやすい。コンソール画面にログインする。

<br>

### （２）AWSのドキュメントや技術記事を確認

コンソール画面の相当する設定箇所がわかったところで、設定値が正しいかどうかを確認する。以下を確認する。

- AWSのドキュメント
- 技術記事

<br>

### （３）Terraformのドキュメントや技術記事を確認

AWSを構築する場合、TerraformのAWSプロバイダーを用いている。以下を確認する。

- TerraformのAWSプロバイダーのドキュメント：https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- 技術記事

注意点として、AWSプロバイダーのバージョンを確認し、リファレンスの閲覧バージョンを切り替える必要がある。以下の点でレビューする。

- 実装方法がプロジェクトの実装ルールに即しているか
- リファレンスに非推奨と注意書きされた方法で実装していないか
- リリースの粒度は適切か

<br>

### （４）developブランチへのマージは問題ないか

developブランチにマージするコミット = 次にリリースするコミット である。他にリリースの優先度が高い対応がある場合、またリリースの粒度が大きすぎる場合、同時にリリースしないように、developブランチへのマージに『待った！』をかけること。

