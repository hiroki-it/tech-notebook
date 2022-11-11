---
title: 【IT技術の知見】設計ポリシー＠Terraform
description: 設計ポリシー＠Terraformの知見を記録しています。
---

# 設計ポリシー＠Terraform

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. リポジトリ構成ポリシー

### リポジトリ分割のメリット

リポジトリを分割することにより、以下のメリットがある。

- 認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

> ℹ️ 参考：https://cloud.google.com/docs/terraform/best-practices-for-terraform#team-boundaries

<br>

### アプリとIaCを同じリポジトリで管理

アプリケーションと同じリポジトリにて、```terraform```ディレクトリを作成し、ここに```.tf```ファイルを配置する。

```yaml
repository/
├── app/ # アプリケーション
├── infra/
│   └── terraform/
│       ├── modules/ # ローカルモジュール
...
```

<br>

### アプリとIaCを異なるリポジトリで管理（推奨）

#### ▼ ローカルモジュールを使用する（推奨）

アプリケーションとは異なるリポジトリにて、```.tf```ファイルを配置しつつ、ルートモジュールとモジュールは同じリポジトリ内で管理する。

```yaml
repository/
├── modules/ # ローカルモジュール
│   ├── foo-module/
│   ...
│  
├── main.tf # ルートモジュール
├── variables.tf
...
```

#### ▼ リモートモジュールを使用する

アプリケーションとは異なるリポジトリにて、```.tf```ファイルを配置しつつ、ルートモジュールとモジュールは異なるリポジトリ内で管理する。ルートモジュールでリモートモジュールのリポジトリのURLを指定し、参照する。

```yaml
repository/
├── main.tf # ルートモジュール（リポジトリのURLを指定し、リモートモジュールを読み込む）
├── variables.tf
...
```

```yaml
repository/
├── main.tf # リモートモジュール
├── outputs.tf
├── variables.tf
...
```

<br>

## 02 ```.tfstate```ファイルを含むルートモジュールの分割

### ```.tfstate```ファイルを含むルートモジュールの分割とは

#### ▼ メリット

```.tfstate```ファイルを分割することにより、以下のメリットがある。

> ℹ️ 参考：https://qiita.com/yukihira1992/items/a674fe717a8ead7263e4

- ```terraform apply```コマンドの実行途中に問題が発生し、```.tfstate```ファイルが破損したとしても、影響範囲をその```.tfstate```ファイルのリソース内に閉じられる。
- ```terraform plan```コマンドや```terraform apply```コマンドの実行時間を短縮できる。
- リソースタイプが同じであっても、同じ名前を付けられる。

#### ▼ 方法

```backend```オプションの```key```オプションで、下層のディレクトリ名に分割名を設定する。

```terraform
# @ルートモジュール
terraform {

  ...
  
  backend "s3" {
    
    ...
    
    bucket     = "prd-foo-tfstate-bucket"
    key        = "<クラウドプロバイダー名>/<コンポーネント名>/terraform.tfstate"
    
    ...
    
  }
  
  ...
  
}
```

<br>

### リポジトリ/最上層ディレクトリの構成方法の種類

#### ▼ クラウドプロバイダー別（必須）

リポジトリまたは最上層ディレクトリで分割し、クラウドプロバイダー別に```providers.tf```ファイルを作成する。これにより、クラウドプロバイダー別に```.tfstate```ファイルが作成される。各環境で独立して作成した```.tfstate```ファイルの管理リソース（AWSならS3バケット）内でディレクトリを作り、各ディレクトリに```.tfstate```ファイルを配置する。

```yaml
repository/
├── aws/ # AWS
│   ├── providers.tf # aws/terraform.tfstate
│   ...
│
├── datadog/ # Datadog
│   ├── providers.tf # datadog/terraform.tfstate
│   ...
│
├── healthchecks/ # Healthchecks 
│   ├── providers.tf # healthchecks/terraform.tfstate
│   ...
│ 
└── pagerduty/ # PagerDuty # pagerduty/terraform.tfstate
    ├── providers.tf
    ...
```

<br>

### 最下層ディレクトリの構成方法の種類

#### ▼ 実行環境別（必須）

最下層ディレクトリで分割し、クラウドプロバイダー別かつ実行環境別に```providers.tfvars```ファイルを作成する。ルートモジュールと一緒に、```providers.tf```ファイルや```tfnotify.yml```ファイルも管理してしまうと良い。これにより、実行環境別に```.tfstate```ファイルが作成される。```terraform apply```コマンドの影響範囲を実行環境内に閉じられる。また、各環境の```.tfstate```ファイルの管理リソース（AWSならS3バケット）も分割した方がよい。


```yaml
repository/
├── aws/ # AWS
│   ├── tes/ # テスト環境
│   │   ├── tes.tfvars
│   │   ├── main.tf
│   │   ├── providers.tf # aws/terraform.tfstate
│   │   ├── tfnotify.yml
│   │   └── variables.tf
│   │
│   ├── stg/ # ステージング環境
│   └── prd/ # 本番環境
│
├── datadog/ # Datadog
│   ├── tes/ # テスト環境
│   ├── stg/ # ステージング環境
│   └── prd/ # 本番環境
│
├── healthchecks/ # Healthchecks 
│   ├── tes/ # テスト環境
│   ├── stg/ # ステージング環境
│   └── prd/ # 本番環境
│ 
└── pagerduty/ # PagerDuty # pagerduty/terraform.tfstate
    ├── tes/ # テスト環境
    ├── stg/ # ステージング環境
    └── prd/ # 本番環境
```

<br>

### 中間ディレクトリ構成方法の種類

#### ▼ 分割の目安

CloudFormationでは、クラウドインフラのリソースの実装変更頻度、運用チームの責務範囲、blast-radius、システムコンポーネント、などを状態管理の単位とすることが推奨されており、Terraformでのコンポーネント分割でもこれを真似すると良い。これらの観点の分割が混在してしまうと可読性が悪くなるので、個人的にはいずれかの観点に統一した方が良い。

> ℹ️ 参考：
>
> - https://zoo200.net/terraform-tutorial-module-and-directory/
> - https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html#organizingstacks
> - https://zenn.dev/hajimeni/articles/e17b9808e0e82e

#### ▼ クラウドインフラのリソースの変更頻度

中間ディレクトリをクラウドインフラのリソースの実装変更頻度ごとに分割する。各環境で独立して作成した```.tfstate```ファイルの管理リソース（AWSならS3バケット）内でディレクトリを作り、各ディレクトリに```.tfstate```ファイルを配置する。

> ℹ️ 参考：
>
> - https://towardsdatascience.com/data-quality-dataops-and-the-trust-blast-radius-4b0e9556bbda
> - https://qiita.com/yukihira1992/items/a674fe717a8ead7263e4

```yaml
repository/
├── aws/ # AWS
│   ├── high-freq # 高頻度リソース（サーバー系、コンテナ系、セキュリティ系、監視系など）
│   │   ├── tes # テスト環境
│   │   │   ├── providers.tf # aws/high-freq/terraform.tfstate
│   │   │   ...
│   │   │
│   │   ├── stg # ステージング環境
│   │   │   ├── providers.tf # aws/low-freq/terraform.tfstate
│   │   │   ...
│   │   │
│   │   └── prd # 本番環境
│   │       ├── providers.tf # aws/middle-freq/terraform.tfstate
│   │       ...
│   │
│   ├── low-freq # 低頻度リソース（ネットワーク系、ストレージ系、など）
│   │   ├── tes
│   │   │   ├── providers.tf
│   │   │   ...
│   │   │
│   │   ├── stg
│   │   │   ├── providers.tf
│   │   │   ...
│   │   │
│   │   └── prd
│   │       ├── providers.tf
│   │       ...
│   │
│   └── middle-freq # 中頻度リソース（高頻度とも低頻度とも言えないリソース）
│       ├── tes
│       │   ├── providers.tf
│       │   ...
│       │
│       ├── stg
│       │   ├── providers.tf
│       │   ...
│       │
│       └── prd
│           ├── providers.tf
│           ...
│    
├── datadog/ # Datadog
├── healthchecks/ # Healthchecks
└── pagerduty/ # PagerDuty
```

#### ▼ 運用チームの責務範囲

中間ディレクトリを運用チームの責務範囲ごとに分割する。また、```tfstate```ファイルを管理するバックエンドにて、ディレクトリ単位で認可スコープを設定する。ただし、チームの責務範囲や数は、組織の大きさに合わせて流動的に変化するものなので、個人的には保守性が高くない。

```yaml
repository/
├── aws/ # AWS
│   ├── foo-team # fooチーム
│   │   ├── tes # テスト環境
│   │   │   ├── providers.tf # aws/foo-team/terraform.tfstate
│   │   │   ...
│   │   │
│   │   ├── stg # ステージング環境
│   │   │   ├── providers.tf # aws/bar-team/terraform.tfstate
│   │   │   ...
│   │   │
│   │   └── prd # 本番環境
│   │       ├── providers.tf # aws/baz-team/terraform.tfstate
│   │       ...
│   │
│   ├── bar-team # barチーム
│   │   ├── tes
│   │   │   ├── providers.tf
│   │   │   ...
│   │   │
│   │   ├── stg
│   │   │   ├── providers.tf
│   │   │   ...
│   │   │
│   │   └── prd
│   │       ├── providers.tf
│   │       ...
│   │
│   └── baz-team # bazチーム
│       ├── tes
│       │   ├── providers.tf
│       │   ...
│       │
│       ├── stg
│       │   ├── providers.tf
│       │   ...
│       │
│       └── prd
│           ├── providers.tf
│           ...
│    
├── datadog/ # Datadog
├── healthchecks/ # Healthchecks
└── pagerduty/ # PagerDuty
```

#### ▼ システムコンポーネント

中間ディレクトリを任意のコンポーネントごとに分割する。この時、各コンポーネントの依存関係が一方向になるようにする。ディレクトリ名に番号を付けてもよい。必ず自分より小さな番号の```.tfstate```ファイルを参照するようにすると良い。

> ℹ️ 参考：https://sreake.com/blog/terraform-state-structure/

```yaml
repository/
├── aws/ # AWS
│   ├── 01-foo/
│   │   ├── tes # テスト環境
│   │   │   ├── providers.tf # aws/foo-team/terraform.tfstate
│   │   │   ...
│   │   │
│   │   ├── stg # ステージング環境
│   │   │   ├── providers.tf # aws/bar-team/terraform.tfstate
│   │   │   ...
│   │   │
│   │   └── prd # 本番環境
│   │       ├── providers.tf # aws/baz-team/terraform.tfstate
│   │       ...
│   │
│   ├── 02-bar/
│   ├── 03-baz/
│   ├── 04-qux/
│   ├── 05-quux/
│   └── 06-corge/
│    
├── datadog/ # Datadog
├── healthchecks/
└── pagerduty/
```


<br>

## 03. ローカルモジュールのディレクトリ構成ポリシー

### ルートディレクトリ構成方法の種類

#### ▼ 対象リソース別

特定のリソースの設定が対象のリソースごとに異なる場合、冗長性よりも保守性を重視して、リソースに応じたディレクトリに分割する。またスクリプトを使用するリソース（例：Lambda）では、そのソースコードをモジュール下で管理する。

```yaml
repository/
└── modules/ # ローカルモジュール
    ├── cloudwatch/ # CloudWatch
    │   ├── alb/        # ALB
    │   ├── cloudfront/ # CloudFront
    │   ├── ecs/        # ECS
    │   ├── lambda/     # Lambda
    │   │   └── functions/
    │   │       └── foo_function/ # スクリプト
    │   │
    │   └── rds/        # RDS    
    │
    └── waf/ # WAF
        ├── alb/         # ALB
        ├── api_gateway/ # API Gateway
        └── cloudfront/  # CloudFront
```

<br>

### サブディレクトリ構成方法の種類

#### ▼ 実行環境別

特定のリソースの設定が実行環境ごとに異なる場合、冗長性よりも保守性を重視して、実行環境に応じたディレクトリに分割する。

```yaml
repository/
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

#### ▼ リージョン別

特定のリソースの設定がリージョンごとに異なる場合、冗長性よりも保守性を重視して、リージョンに応じたディレクトリに分割する。

```yaml
repository/
└── modules/ # ローカルモジュール
    └── acm/ # ACM
        ├── ap-northeast-1/ # 東京リージョン
        └── us-east-1/      # バージニアリージョン  
```

#### ▼ 共通セット別

WAFで使用するIPパターンセットと正規表現パターンセットには、CloudFrontタイプとRegionalタイプがある。Regionalタイプは、同じリージョンの異なるクラウドプロバイダーのリソース間で共通して使用できるため、共通セットとしてディレクトリ分割を行う。

```yaml
repository/
└── modules/ # ローカルモジュール
    └── waf/ # WAF
        ├── alb/
        ├── api_gateway/
        ├── cloudfront/
        └── regional_sets/ # Regionalタイプのセット
            ├── ip_sets/   # IPセット
            │   ├── tes/
            │   ├── stg/
            │   └── prd/
            │    
            └── regex_pattern_sets/ # 正規表現パターンセット
                ├── tes/
                ├── stg/
                └── prd/
```

#### ▼ リソースのセットアップ別

リソースをセットアップする上で異なる種類のリソースが必要になる場合に、それらの```resource```ブロックを一つにまとめて管理する。

```yaml
repository/
└── modules/ # ローカルモジュール
    └── eks/ # EKS
        ├── auto_scaling/ # オートスケーリング
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

### その他

#### ▼ policiesディレクトリ

ポリシーのために```.json```形式を定義する場合、Terraformのコードにハードコーディングせずに、切り分けるようにする。また、『カスタマー管理ポリシー』『インラインポリシー』『信頼ポリシー』も区別し、ディレクトリを分割している。注意点として、```templatefile```関数でこれを読みこむ時、```bash```ファイルではなく、tplファイルとして定義しておく必要あるため、注意する。

> ℹ️ 参考：https://cloud.google.com/docs/terraform/best-practices-for-terraform#static-files

```yaml
repository/
└── modules/ # ローカルモジュール
    ├── ecr/ # ECR
    │   └── ecr_lifecycle_policy.tpl # ECRライフサイクル
    │
    ├── ecs/ # ECS
    │   └── container_definitions.tpl # コンテナ定義
    │
    ├── iam/ # IAM
    │   └── policies/
    │       ├── customer_managed_policies/ # カスタム管理ポリシー
    │       │   ├── aws_cli_executor_access_policy.tpl
    │       │   ├── aws_cli_executor_access_address_restriction_policy.tpl
    │       │   ├── cloudwatch_logs_access_policy.tpl
    │       │   └── lambda_edge_execution_policy.tpl
    │       │     
    │       ├── inline_policies/ # インラインポリシー
    │       │   └── ecs_task_policy.tpl
    │       │     
    │       └── trust_policies/ # 信頼ポリシー
    │           ├── cloudwatch_events_policy.tpl
    │           ├── ecs_task_policy.tpl
    │           ├── lambda_policy.tpl
    │           └── rds_policy.tpl
    │
    └── s3/ # S3
        └── policies/ # バケットポリシー
            └── alb_bucket_policy.tpl
```

#### ▼ opsディレクトリ

CI/CDパイプライン上の```terraform```コマンドの実行で必要なシェルスクリプトは、```ops```ディレクトリで管理する。

```yaml
repository/
├── .circleci/ # CIツールの設定ファイル
└── ops/ # TerraformのCI/CDの自動化シェルスクリプト
```

<br>

## 04. 命名規則と並び順

### 環境変数（通常変数も同じ）

#### ▼ 対象リソースに合わせる命名

複数のリソースで共通して使用する場合（将来的にそうなる可能性も含めて）は、Generalに配置し、グローバルな名前を付ける。クラウドプロバイダーのリソースのアルファベット順に環境変数を並べる。

```terraform
###############################################
# General
###############################################
camel_case_prefix = "Bar"
region            = "ap-northeast-1"
environment       = "stg"
service           = "bar"
```

一方で、特定のリソースのみで使用する環境変数/通常変数の場合は、対象のリソース、種類名、オプション名、がわかるように命名する。

> ℹ️ 参考：https://cloud.google.com/docs/terraform/best-practices-for-terraform#naming-convention

```terraform
# 種類が無い時（thisの時）
# 例：ecs_service_desired_count = 2
<使用するクラウドプロバイダーのリソースの名前>_<オプション名> = ****


# 種類がある時
# 例：ecs_task_cpu = 1024
<使用するクラウドプロバイダーのリソースの名前>_<種類名>_<オプション名> = ****
```

#### ▼ list型、map型の命名

複数の値を持つlist型やmap型の環境変数であれば複数形で命名する。一方で、string型など値が```1```個しかなければ単数形とする。

> ℹ️ 参考：https://cloud.google.com/docs/terraform/best-practices-for-terraform#variables

**＊実装例＊**

例として、VPCを示す。

```terraform
# @ルートモジュール

###############################################
# Variables VPC
###############################################
vpc_availability_zones             = { a = "a", c = "c" }
vpc_cidr                           = "*.*.*.*/23"
vpc_subnet_private_datastore_cidrs = { a = "*.*.*.*/27", c = "*.*.*.*/27" }
vpc_subnet_private_app_cidrs       = { a = "*.*.*.*/25", c = "*.*.*.*/25" }
vpc_subnet_public_cidrs            = { a = "*.*.*.*/27", c = "*.*.*.*/27" }
```

#### ▼ boolean型の命名

```count```引数による条件分岐でリソースの作成の有無を切り替えている場合、```enable_***```という名前のboolean型環境変数を用意する。

> ℹ️ 参考：https://cloud.google.com/docs/terraform/best-practices-for-terraform#variables

```terraform
enable_foo = true
```

<br>

### ```module```ブロック

#### ▼ 命名規則

```source```オプションで指定するディレクトリ名で命名する。スネークケースによる命名を採用する。

```terraform
# @ルートモジュール

###############################
# ALB
###############################
module "alb" {
  # ローカルモジュール
  source = "../modules/alb"
}
```

```terraform
# @ルートモジュール

module "alb" {
  # リモートモジュールを参照する。
  source = "git::https://github.com/hiroki-hasegawa/terraform-alb-modules.git"
}
```

<br>

### ```resource```ブロック、```data```ブロック

#### ▼ リソースに種類がある場合

リソース名で、リソースタイプを繰り返さないようにする。もし種類がある場合、リソース名でその種類を表す。

**＊実装例＊**

例として、VPCを示す。

```terraform
###############################################
# Resource VPC ルートテーブル
###############################################

# 良い例
resource "aws_route_table" "public" {

}

resource "aws_route_table" "private" {

}
```

```terraform
###############################################
# Resource VPC ルートテーブル
###############################################

# 悪い例
resource "aws_route_table" "route_table_public" {

}

resource "aws_route_table" "route_table_private" {

}
```

#### ▼ リソースに種類が無い場合

リソースタイプに、```1```個のリソースしか種類が存在しない場合、```this```で命名する。`this`と命名されたresourceで、後から種類が増える場合は、既存の`this`は後からリファクタリングするとして、新規リソースには種類名を名付ける。ただし、リファクタリングすることが大変なため、非推奨である。

**＊実装例＊**

```terraform
###############################################
# Resource Internet Gateway
###############################################

resource "aws_internet_gateway" "this" {

}
```

#### ▼ 接頭辞、接尾辞の場合

Lambda以外では、作成されるクラウドプロバイダーのリソースの名前は以下の通りとする。

- ケバブケース
- `<接頭辞>-<種類>-<接尾辞>`とする。
- 接頭辞は、 `<実行環境>-<サービス名>`とする。
- 接尾辞は、クラウドプロバイダーのリソース名とする。

**＊実装例＊**

例として、CloudWatchを示す。

- 接尾辞は、 `<実行環境>-<サービス名>`
- 種類は、alb-httpcode-4xx-count
- クラウドプロバイダーのリソース名は、CloudWatchAlarmを省略してAlarm

```terraform
resource "aws_cloudwatch_metric_alarm" "alb_httpcode_target_4xx_count" {

  alarm_name = "prd-foo-alb-httpcode-target-4xx-count-alarm"
  
}
```

LambdaではLambda関数が稼働する。接尾辞にfunctionとつけることは冗長と判断したため、関数名のみで命名する。

**＊実装例＊**

例として、Lambdaをしめす。

- 接尾辞は、 `<実行環境>-<サービス名>`
- 種類は、echo-helloworld
- クラウドプロバイダーのリソース名のlambdaは省略する。

```terraform
resource "aws_lambda_function" "echo_helloworld" {

  function_name    = "prd-foo-echo-helloworld"
  
}
```

<br>

### ```output```ブロック

#### ▼ リソースに種類がある場合

『```<リソース名>_<リソースタイプ>_<attribute名>```』で命名する。可読性の観点から、リソース一括ではなく、具体的なattributeを出力する。

**＊実装例＊**

例として、CloudWatchを示す。リソース名は```ecs_container_nginx```、リソースタイプは```aws_cloudwatch_log_group```、attributeは```name```オプションである。

```terraform
output "ecs_container_nginx_cloudwatch_log_group_name" {
  value = aws_cloudwatch_log_group.ecs_container_nginx.name
}
```

**＊実装例＊**

例として、IAM Roleを示す。

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

#### ▼ リソースに種類が無い場合

リソース名が```this```である場合、```output```ブロック名ではこれを省略しても良い。

**＊実装例＊**

例として、ALBを示す。

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

#### ▼ 冗長な場合（アンチパターン）

ルール通りに命名すると、一部のクラウドプロバイダーのリソースで冗長な名前になってしまうことがある。この場合は、省略を許容する。

**＊実装例＊**

ルール通りに名付けると、『```laravel_ecr_repository_repository_url```』という```output```ブロック名になってしまう。repositoryが二回繰り返されることになるため、1つ省略している。

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

### ```description```オプション

一部のクラウドプロバイダーのリソースでは、`description`オプションで説明文を設定できる。基本的には英語で説明する。また、文章ではなく、『関係代名詞/形容詞/副詞/前置詞 + 単語』を使用して、『〇〇 な △△』『〇〇 の △△』といった説明になるようにする。

<br>

## 04-02. 並び順

### 環境変数

#### ▼ 並び順

Generalな環境変数を先頭に配置し、その他のクラウドプロバイダーのリソース固有の環境変数はアルファベット順に変数を並べる。

<br>

### ```module```ブロック

#### ▼ 並び順

環境変数を並べる```# Variables```コメントと、モジュール間の値を受け渡しを並べる```# Output values```コメントに分ける。```# Variables```コメントの部分では、```terraform.tfvars```ファイルと同じ並び順になるようにする。また、```# Output values```コメントの部分では、```output```ブロックをモジュールに渡す時にクラウドプロバイダーのリソースのアルファベット順で並べる。

```terraform
# @ルートモジュール

###############################
# ALB
###############################
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

### ```resource```ブロック、```data```ブロック

#### ▼ 設定の並び順、行間

最初に```count```引数や```for_each```引数を設定し改行する。その後、各リソース別の設定を行間を空けずに記述する（この順番にルールはなし）。最後に共通の設定として、`tags`、`depends_on`、`lifecycle`、の順で配置する。ただし実際、これらの全ての設定が必要なリソースはない。

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

## 05. 開発環境

### terraformコマンドのセットアップ

#### ▼ docker-compose.ymlファイルを用いる場合

作業者間で```terraform```コマンドのバージョンを統一するために、```docker-compose.yml```ファイルを作成する。

```yaml
version: "3.8"

services:
  terraform:
    container_name: foo-terraform
    image: hashicorp/terraform:1.0.0
    volumes:
      - .:/var/infra
    working_dir: /var/infra
```

goのバイナリファイルを実行するためには、```docker-compose run```コマンドの実行する必要がある。ただし、実行のたびにコンテナが増えてしまうため、```--rm```を使用するようにする。また、毎度コマンドを実行することが面倒なので、Makefileでまとめてしまう。

```makefile
# NOTE:
# ローカル環境にて、以下の形式でコマンドを実行できます。
# make <ターゲット名> env=<環境ディレクトリ名>

env=

init:
	docker-compose run --rm terraform -chdir=./"$ENV" init -reconfigure

fmt:
	docker-compose run --rm terraform fmt -recursive

validate: init fmt
	docker-compose run --rm terraform -chdir=./"$ENV" validate
```

#### ▼ asdfパッケージを使用する場合

バージョンを統一するために、```.tool-versions```ファイルを作成する。

```bash
asdf local terraform <バージョン>
```

```bash
# .tool-versionsファイル
terraform <バージョンタグ>
```

asdfパッケージを使用して、```terraform```コマンドをインストールする。```.tool-versions```ファイルに定義されたバージョンがインストールされる。

```bash
$ asdf plugin list all | grep terraform

terraform   *https://github.com/asdf-community/asdf-hashicorp.git
...


$ asdf plugin add terraform https://github.com/asdf-community/asdf-hashicorp.git
$ asdf install
```

<br>

### 開発方法

前提として、バックエンドにS3を使用しているものとする。Makefileのコマンドを実行する前に、```provider.tf```ファイルの```backend```オプションを、『s3』から『local』に変更する。

> ℹ️ 参考：https://repl.info/archives/1435/

```terraform
terraform {

  backend "local" {
  }
}
```

GitHubリポジトリにこの変更をプッシュしないように気を付ける必要がある。ただし、バックエンドに```s3```を指定する```terraform init```コマンドをCIのステップを設けておけば、```provider.tf```ファイルで```local```の指定していことがエラーになるような仕組みを作れる。もし間違えてコミットしてしまった場合は、元に戻すように再コミットすればよい。

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

## 06. CIツールに関する脆弱性対策

> ℹ️ 参考：
> 
> - https://cloud.google.com/docs/terraform/best-practices-for-terraform#credentials
> - https://hiroki-it.github.io/tech-notebook-mkdocs/devops/devops_circleci_policy.html

<br>

### 機密な変数やファイルの扱い

#### ▼ パラメーターの暗号化と管理場所

| 方法                                  | バージョン管理 | 暗号化と管理場所                                                                                                                                                                             |
|-------------------------------------|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GitHubリポジトリ                         | ⭕️  |```base64```方式エンコード値をGitHubリポジトリ内でそのまま管理する。非推奨である。                                                                                                                             |
| GitHubリポジトリ + キーバリュー型ストレージ      | ⭕|```base64```方式エンコード値を暗号化キー（例：AWS KMS、GCP KMS、など）で暗号化した上で、リポジトリ上でキーバリュー型ストレージ（例：sops、Hashicorp Vault）で管理する。クラウドインフラへのプロビジョニング時に```base64```方式エンコード値に復号化する。                                  |
| GitHubリポジトリ + クラウドキーバリュー型ストレージ |  × |```base64```方式エンコード値を暗号化キー（例：AWS KMS、GCP KMS、など）で暗号化した上で、クラウドプロバイダー内のキーバリュー型ストレージ（例：AWS パラメーターストア、GCP SecretManager、など）で管理する。クラウドインフラへのプロビジョニング時に```base64```方式エンコード値に復号化する。 |


#### ▼ ```tfstate```ファイルへの書き込みを防ぐ

機密な変数を```ignore_changes```引数を使用して、```.tfstate```ファイルへの書き込みを防ぐ。その上で、特定の方法（例：sops、Secrets Manager）で実際の値を管理し、これを```data```ブロックで参照する。


（１）初期構築時にダミー値を割り当ててプロビジョニングする。この時点で、```.tfstate```ファイルにはダミー値が書き込まれる。

（２）```ignore_changes```引数を設定した後に、実際の値を設定する。

（３）以降のプロビジョニングで、```.tfstate```ファイル上はダミー値のままになる。

> ℹ️ 参考：https://cloud.google.com/docs/terraform/best-practices-for-terraform#storing-secrets

```terraform
# AWS RDSの場合
resource "aws_rds_cluster" "this" {
  
  # 実際の値はSecrets Managerから参照する。
  master_username = var.rds_db_master_username_ssm_parameter_value
  master_password = var.rds_db_master_password_ssm_parameter_value  
  
  lifecycle {
    ignore_changes = [
      # ユーザー名とパスワードが.tfstateファイルに書き込まれなくなる。
      master_username,
      master_password
    ]
  }
}
```

<br>

### ```.tfstate```ファイルの暗号化

バックエンドのファイル暗号化を使用する。バックエンド内の```.tfstate```ファイルを暗号化しておき、ダウンロード時だけ復号化するようにしておく。

> ℹ️ 参考：https://cloud.google.com/docs/terraform/best-practices-for-terraform#encrypt-state

<br>

### ```output```ブロックの暗号化

```output```ブロックに機密な変数を含む場合は、```sensitive```オプションを有効化する。

> ℹ️ 参考：https://cloud.google.com/docs/terraform/best-practices-for-terraform#sensitive-outputs

<br>

## 07. アップグレード

### アップグレードの手順

#### 1. 現在のTerraformのバージョンで```terraform apply```コマンドを実行

アップグレードと同時に新しいクラウドプロバイダーのリソースをデプロイせずに、アップグレードのみに専念する。そのために、現在のTerraformのバージョンで```terraform apply```コマンドを実行し、差分が無いようにしておく。

#### 2. アップグレード以外の作業を済ませておく

低いバージョンのTerraformに対して、より高いバージョンはデプロイできる。しかし、高いバージョンのTerraformに対して、より低いバージョンをデプロイできない。そのため、アップグレードしてしまうと、それ以外のTerraformバージョンの異なる作業に影響が出る。

#### 3. メジャーバージョン単位でアップグレード＆リリース

Terraformでは、メジャーバージョン単位でアップグレードを行うことが推奨されている。そのため、現在のバージョンと最新バージョンがどんなに離れていても、必ず1つずつメジャーバージョンをアップグレードするように気をつける。この時、次のメジャーバージョンの『最新』までアップグレードしてしまって問題ない（例：現在のバージョンが```v0.13.0```であれば、```0.14```系の最新にアップグレード）。また、アップグレードの都度、リリースを行う。

> ℹ️ 参考：https://www.terraform.io/upgrade-guides/1-0.html 

#### 4. terraform planコマンドの警告/エラーを解決

アップグレードに伴って、非推奨/廃止の機能がリリースされ、警告/エラーが出力される場合がある。警告/エラーを解決できるように、記法やオプション値を修正する。場合によっては```.tfstate```ファイルの差分として表示されているだけで、実インフラとの差分ではない場合もあるため、```terraform plan```コマンド時に差分があったとしても、実インフラに影響がなければ問題ない。

#### 5. プロバイダーをアップグレードしたい場合はTerraformもアップグレード

Terraformとプロバイダーのバージョンは独立して管理されている。プロバイダーはTerraformが土台になって稼働するため、もしプロバイダーをアップグレードしたい場合は、Terraformもアップグレードする。一方で、Terraformをアップグレードしたい場合は、必ずしもプロバイダーをアップグレードする必要はない。アップグレードガイドについては、以下のリンクを参考せよ。

> ℹ️ 参考：
>
- Terraform：https://www.terraform.io/language/upgrade-guides
- AWSプロバイダー：https://registry.terraform.io/providers/hashicorp/aws/latest/docs/guides/version-4-upgrade

#### 6. Terraformとプロバイダーのアップグレードは別々にリリース

プロバイダーをアップグレードしたい場合はTerraformもアップグレードすることになる。この場合、できるだけリリースは分けた方が良い。Terraformまたはプロバイダーのアップグレードを別々にリリースするようにすれば、リリース時にインシデントが発生した時に、どちらが原因なのかを明確化できる。反対に、一緒にリリースしてしまうとどちらが原因なのかわかりにくくなってしまう。

<br>

### 新バージョンの自動検出

外部のツール（例：renovate）を使用して、プロバイダーやTerraformの新バージョンを自動的に検出する。

<br>

## 08. CIパイプライン

### 仕様書自動作成

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software_development_methodology/software_development_methodology_site_reliability_engineering_documentation.html

<br>

### 各ブロックのホワイトボックステスト

#### ▼ 整形

Terraformの整形コマンド（```terraform fmt```コマンド）を使用して、ソースコードを整形する。

#### ▼ 静的解析

| 観点          | 説明                                                                                                                 | 補足 |
|-------------|--------------------------------------------------------------------------------------------------------------------| ---- |
| 文法の誤りテスト        | Terraformの静的解析コマンド（```terraform validate```コマンド）を使用して、機能追加/変更を含むブロックの文法の誤りを検証する。代わりとして、外部の静的解析ツール（例：tflint）を使用しても良い。 |      |
| ベストプラクティス違反テスト  |                                                                                                                    |      |
| 脆弱性テスト          | 外部の脆弱性テストツール（例：tfsec）を使用して、Terraformの実装方法に起因する脆弱性を検証する。                                                                     |      |

#### ▼ ドライラン

テスト環境に対して```terraform plan```コマンドを実行し、ドライランを実施する。```terraform plan```コマンドの結果は可読性が高いわけではないため、差分が多くなるほど確認が大変になる。リリースの粒度を小さくし、差分が少なくなるようにする。

> ℹ️ 参考：https://www.infoq.com/presentations/automated-testing-terraform-docker-packer/

#### ▼ 単体テスト

テスト環境に対して```terraform apply```コマンドを実行し、機能追加/変更を含むブロックが単体で正しく動作するか否かを検証する。代わりとして、外部のテストツール（例：Terratest）を使用しても良い。この時、リソース名をランダム値にしておくと、他の開発者とリソース名が重複せずに良い。また、確認後にリソースを```terraform destory```コマンドで削除する。残骸のリソースが残ることがあるので、合わせてテスト環境の全てのリソースをツール（例：cloud-nuke）で削除する。

> ℹ️ 参考：
>
> - https://www.infoq.com/presentations/automated-testing-terraform-docker-packer/
> - https://cloud.google.com/docs/terraform/best-practices-for-terraform?hl=ja#test

#### ▼ 結合テスト

テスト環境に対して```terraform apply```コマンドを実行し、機能追加/変更を含む複数のブロックを組み合わせた結合テストを実施する。代わりとして、外部のテストツール（例：Terratest）を使用しても良い。この時、リソース名をランダム値にしておくと、他の開発者とリソース名が重複せずに良い。また、確認後にリソースを```terraform destory```コマンドで削除する。残骸のリソースが残ることがあるので、合わせてテスト環境の全てのリソースをツール（例：cloud-nuke）で削除する。

> ℹ️ 参考：https://www.infoq.com/presentations/automated-testing-terraform-docker-packer/

<br>


### ホワイトボックステスト結果の通知

#### ▼ Terraformを使用する場合

Terraformには通知能力がなく、手動で知らせる必要がある。そこで、```terraform plan```コマンドの結果をクリップボードに出力し、これをプルリクに貼り付ける。```grep```コマンドを使用して、差分の表記部分のみを取得すると良い。これを確認し、差分が正しいかをレビューする。

```bash
$ terraform plan -var-file=foo.tfvars -no-color \
    | grep -A 1000 'Terraform will perform the following actions' \
    | pbcopy
```

#### ▼ Terraform以外を使用する場合

通知ツール（例：tfnotify、tfcmt）を使用して、GitHub上に```terraform plan```コマンドの結果が通知されるようにする。これを確認し、差分が正しいかをレビューする。


<br>

## 08-02. CDパイプライン

### レビュー

#### ▼ コンソール画面にログイン

ただコードを眺めているより、レビュー対象がコンソール画面のどこに相当するのかも並行して確認した方が、Terraformを理解しやすい。コンソール画面にログインする。

#### ▼ クラウドプロバイダーのドキュメントや技術記事を確認

コンソール画面の相当する設定箇所がわかったところで、設定値が正しいか否かを確認する。以下を確認する。

- クラウドプロバイダーのドキュメント
- 技術記事

#### ▼ Terraformのドキュメントや技術記事を確認

AWSを作成する場合、TerraformのAWSプロバイダーを使用している。以下を確認する。

- TerraformのAWSプロバイダーのドキュメント：https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- 技術記事

注意点として、AWSプロバイダーのバージョンを確認し、リファレンスの閲覧バージョンを切り替える必要がある。以下の点でレビューする。

- プロジェクトの設計ポリシーに即しているか
- リファレンスに非推奨と注意書きされた方法で実装していないか
- リリースの粒度は適切か

#### ▼ ```develop```ブランチへのマージは問題ないか

```develop```ブランチにマージするコミット = 次にリリースするコミット である。他にリリースの優先度が高い対応がある場合、またリリースの粒度が大きすぎる場合、同時にリリースしないように、```develop```ブランチへのマージに『待った！』をかけること。

<br>

### 各ブロックのブラックボックステスト

#### ▼ 結合テスト

ステージング環境に対して```terraform apply```コマンドを実行し、機能追加/変更を含む複数のブロックが正しく連携するか否かを検証する

> ℹ️ 参考：https://www.infracloud.io/blogs/testing-iac-terratest/

#### ▼ 総合テスト（擬似的総合テストも含む）

ステージング環境に対して```terraform apply```コマンドを実行し、既存機能/追加/変更を含む全てのブロックを組み合わせた総合テストを実施する。クラウドプロバイダーのモックを使用して、擬似的な総合テストを実施しても良い。

> ℹ️ 参考：https://docs.localstack.cloud/ci/


<br>

### デプロイ

#### ▼ 大原則：プルリクエストを1つずつリリース

基本的には、プルリクエストを1つずつリリースする。ただし、軽微なupdate処理が実行されるプルリクエストであれば、まとめてリリースしても良い。もしリリース時に問題が発生した場合、インフラのバージョンのロールバックする必要がある。経験則で、create処理やdestroy処理よりもupdate処理の方がエラーが少ないため、ロールバックにもたつきにくい。プルリクエストを複数まとめてリリースすると、create処理やdestroy処理が実行されるロールバックに失敗する可能性が高くなる。

#### ▼ 既存のリソースに対して、新しいリソースを紐づける場合

既存のリソースに対して、新しいリソースを紐づける場合、新しいリソースの作成と紐づけを別々にリリースする。ロールバックでもたつきにくく、またTerraformで問題が発生したとしても変更点が紐づけだけなので、原因を追究しやすい。

#### ▼ Terraformとプロバイダーの両方をアップグレードする場合

Terraformとプロバイダーを別々にリリースする。

#### ▼ DBインスタンスの設定変更でダウンタイムが発生する場合

DBインスタンスの設定変更でダウンタイムが発生する場合、それぞれのDBインスタンスに対する変更を別々にリリースする。また、リリース順序は以下の通りとする。プライマリーインスタンスのリリース時にフェールオーバーが発生するため、ダウンタイムを短縮できる。

1. リードレプリカの変更をリリースする。
2. プライマリーインスタンスの変更をリリースする。リリース時にフェールオーバーを発生し、現プライマリーインスタンスはリードレプリカに降格する。また、前のリリースですでに更新されたリードレプリカがプライマリーインスタンスに昇格する。新しいリードレプリカがアップグレードされる間、代わりに新しいプライマリーインスタンスが動作する。

ダウンタイムが発生するDBインスタンスの設定項目は以下のリンクを参考にせよ。RDSの項目として書かれており、Auroraではないが、おおよそ同じなため参考にしている。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.Settings

<br>

### ロールバック

#### ▼ Terraformを使用する場合

Terraformには、クラウドインフラのバージョンのロールバック機能がなく、手動でロールバックする必要がある。そこで、過去のリリースタグを```terraform apply```コマンドでデプロイすることにより、バージョンをロールバックする。今回のリリースのcreate処理が少ないほど```terraform apply```コマンドでdestroy処理が少なく、反対にdestroy処理が少ないほどcreate処理が少なくなる。もしリリース時に問題が発生した場合、インフラのバージョンのロールバックする必要があるが、経験則でcreate処理やdestroy処理よりもupdate処理の方がエラーが少ないため、ロールバックにもたつきにくい。そのため、Rerun時にどのくらいのcreate処理やdestroy処理が実行されるかと考慮し、過去のリリースタグを```terraform apply```コマンドを実行するか否かを判断する。

#### ▼ Terraform以外を使用する場合

CDパイプラインがない場合と同じである。

<br>

## 08-03. 事後処理

### デプロイの通知

#### ▼ Terraformを使用する場合

Terraformには通知能力がなく、手動で知らせる必要がある。```terraform apply```コマンドの結果をクリップボードに出力し、これをリリースチケットに貼り付ける。

#### ▼ Terraform以外を使用する場合

通知ツール（例：tfnotify、tfcmt）を使用して、GitHub上に```terraform apply```コマンドの結果が通知されるようにする。

<br>
