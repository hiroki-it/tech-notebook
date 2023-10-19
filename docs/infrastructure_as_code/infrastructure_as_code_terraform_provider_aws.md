---
title: 【IT技術の知見】AWSプロバイダー＠Terraform
description: AWSプロバイダー＠Terraformの知見を記録しています。
---

# AWSプロバイダー＠Terraform

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWSプロバイダーとは

TerraformがAWSリソースのAPIと通信可能にする。

これにより、Terraformを使用してAWSリソースを作成できるようになる。

> - https://registry.terraform.io/providers/hashicorp/aws/latest/docs

<br>

## 02. ACM

### SSL証明書のリクエスト

**＊実装例＊**

Eメール検証の場合を示す。

```terraform
# ---------------------------------------------
# For www domain
# ---------------------------------------------
resource "aws_acm_certificate" "www_an1" {
  domain_name               = var.route53_domain_www
  subject_alternative_names = [
    "*.${var.route53_domain_www}"
  ]
  validation_method         = "EMAIL"

  tags = {
    Name = "prd-foo-www-an1-cert"
  }

  lifecycle {
    create_before_destroy = true
  }
}
```

<br>

**＊実装例＊**

DNS検証の場合を示す。

```terraform
# ---------------------------------------------
# For www domain
# ---------------------------------------------
resource "aws_acm_certificate" "www_an1" {
  domain_name               = var.route53_domain_www
  subject_alternative_names = [
    "*.${var.route53_domain_www}"
  ]
  validation_method         = "DNS"

  tags = {
    Name = "prd-foo-www-an1-cert"
  }

  lifecycle {
    create_before_destroy = true
  }
}
```

<br>

### 検証の実行

**＊実装例＊**

Eメール検証の場合を示す。

```terraform
# ---------------------------------------------
# For www domain
# ---------------------------------------------
# 後述の説明を参考にせよ。(1)
resource "aws_acm_certificate_validation" "www_an1" {
  certificate_arn = aws_acm_certificate.www_an1.arn
}
```

**＊実装例＊**

DNS検証の場合を示す。

```terraform
# ---------------------------------------------
# For www domain
# ---------------------------------------------
# 後述の説明を参考にせよ。`(2)`
resource "aws_acm_certificate_validation" "www_an1" {
  certificate_arn         = aws_acm_certificate.www_an1.arn
  validation_record_fqdns = [for record in var.www_an1_route53_record : record.fqdn]
}
```

#### `(1)`AWS以外でドメインを購入した場合は注意

AWS以外でドメインを購入した場合はAWS以外で作業になる。

SSL証明書のDNS検証時に、ドメインを購入したサービスが管理するドメインレジストラに、Route53のNSレコード値を登録する。

#### `(2)`検証のためにメール再送が必要

SSL証明書のEメール検証時に、ドメインの所有者にメールが送信されないことがある。

送信されなかった場合は、メールの再送を実行する。

#### (＊) SSL証明書の検証方法を変更する

もしコンソール画面からSSL証明書の検証方法を変更する場合、検証方法の異なるSSL証明書を作成してこれに切り替えたうえで、古いSSL証明書を削除する必要がある。

これに合わせて、Terraformでもリリースを二回に分ける。

> - https://aws.amazon.com/jp/premiumsupport/knowledge-center/switch-acm-certificate/

<br>

## 03. AMI

### まとめ

**＊実装例＊**

```terraform
# ---------------------------------------------
# For bastion
# ---------------------------------------------
data "aws_ami" "bastion" {
  # 後述の説明を参考にせよ。(1)
  most_recent = false

  # 後述の説明を参考にせよ。(2)
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn-ami-hvm-2018.03.0.20201028.0-x86_64-gp2"]
  }

  filter {
    name   = "image-id"
    values = ["ami-040c9333a9c90b2b6"]
  }
}

# 後述の説明を参考にせよ。(3)

data "aws_ami" "backuped" {
  most_recent = true

  owners      = ["self"]

  filter {
    name   = "name"
    values = ["AwsBackup_*"]
  }

  filter {
    name   = "tag:Env"
    values = ["prd"]
  }
}
```

<br>

### `(1)` 取得するAMIのバージョンを固定

取得するAMIが常に最新になっていると、EC2が再作成されなねない。

そこで、特定のAMIを取得できるようにしておく。

`most_recent`は無効化しておき、特定のAMIをフィルタリングする。

<br>

### `(2)`AWS Backupで作成したAMIを参照

AWS BackupでEC2のAMIを作成している場合に、フィルターの条件を使用して、AMIを参照する。

<br>

## 04. API Gateway

### まとめ

**＊実装例＊**

```terraform
# ---------------------------------------------
# RESTful API
# ---------------------------------------------
resource "aws_api_gateway_rest_api" "foo" {
  name        = "prd-foo-api-for-foo"
  description = "The API that enables two-way communication with prd-foo"

  # VPCリンクのプロキシ統合のAPIを定義したOpenAPI仕様
  # 後述の説明を参考にせよ。(1)
  body = templatefile(
    "${path.module}/open_api.yml",
    {
      api_gateway_vpc_link_foo_id = aws_api_gateway_vpc_link.foo.id
      nlb_dns_name                          = var.nlb_dns_name
    }
  )

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  lifecycle {
    ignore_changes = [
      policy
    ]
  }
}

# ---------------------------------------------
# Deployment
# ---------------------------------------------
resource "aws_api_gateway_deployment" "foo" {
  rest_api_id = aws_api_gateway_rest_api.foo.id

  # 後述の説明を参考にせよ。(1)
  triggers = {
    redeployment = sha1(aws_api_gateway_rest_api.foo.body)
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ---------------------------------------------
# Stage
# ---------------------------------------------
resource "aws_api_gateway_stage" "foo" {
  deployment_id = aws_api_gateway_deployment.foo.id
  rest_api_id   = aws_api_gateway_rest_api.foo.id
  stage_name    = var.environment
}
```

<br>

### `(1)` OpenAPI仕様のインポートと差分認識

あらかじめ用意したOpenAPI仕様の`.yaml`ファイルを`body`オプションのパラメーターとし、これをインポートすることにより、APIを定義できる。

`.yaml`ファイルに変数を渡すこともできる。

APIの再デプロイのトリガーとして、`redeployment`パラメーターに`body`パラメーターのハッシュ値を渡すようにする。

これにより、インポート元の`.yaml`ファイルに差分があった場合、Terraformが`redeployment`パラメーターの値の変化を認識できるようになり、再デプロイを実行できる。

<br>

### (＊) ステージ名を取得する方法はない

API Gatewayのステージ名を参照するためには、resourceを使用する必要があり、dataではこれを取得できない。

もしステージをコンソール画面上から作成している場合、ステージのARNを参照できないため、ARNを自力で作る必要がある。

API Gatewayの各ARNについては、以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/arn-format-reference.html

**＊実装例＊**

WAFにAPI Gatewayを紐付けるために、ステージのARNが必要である。

これは自力で作る。

```terraform
# ---------------------------------------------
# Web ACLアソシエーション
# ---------------------------------------------
resource "aws_wafv2_web_acl_association" "api_gateway" {
  resource_arn = "${var.api_gateway_rest_arn}/stages/prd"
  web_acl_arn  = aws_wafv2_web_acl.api_gateway.arn
}
```

<br>

## 05. CloudWatchログ

### まとめ

```terraform
resource "aws_cloudwatch_log_group" "ecs_service_container_datadog" {
  name = "/prd-foo-ecs-service/container/datadog/log"
}
```

<br>

### `(1)` ECSサービス名をルートとした命名

同じAWSアカウントの異なるECSサービスを作成する場合がある。

この場合、コンテナ名が重複することになるため、CloudWatchログのロググループはECSサービスをルートとして命名する必要がある。

<br>

## 06. CloudFront

### まとめ

**＊実装例＊**

```terraform
resource "aws_cloudfront_distribution" "this" {

  price_class      = "PriceClass_200"
  web_acl_id       = var.cloudfront_wafv2_web_acl_arn
  aliases          = [var.route53_domain_foo]
  comment          = "prd-foo-cf-distribution"
  enabled          = true

  # 後述の説明を参考にせよ。(1)
  retain_on_delete = true

  viewer_certificate {
    acm_certificate_arn      = var.foo_acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2019"
  }

  logging_config {
    bucket          = var.cloudfront_s3_bucket_regional_domain_name
    include_cookies = true
  }

  restrictions {

    geo_restriction {
      restriction_type = "none"
    }
  }

  ...

}
```

<br>

### `(1)` 削除保持機能

Terraformでは、`retain_on_delete`で設定できる。

固有の設定で、AWSに対応するものは無い。

<br>

### originブロック

Origins画面に設定するオリジンを定義する。

**＊実装例＊**

```terraform
resource "aws_cloudfront_distribution" "this" {

  ...

  # オリジン (ここではS3としている)
  origin {
    domain_name = var.s3_bucket_regional_domain_name
    origin_id   = "S3-${var.s3_bucket_id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.s3_foo.cloudfront_access_identity_path
    }
  }

  ...

}
```

```terraform
resource "aws_cloudfront_distribution" "this" {

  ...

  # オリジン (ここではALBとしている)
  origin {
    domain_name = var.alb_dns_name
    origin_id   = "ELB-${var.alb_name}"

    custom_origin_config {
      origin_ssl_protocols     = ["TLSv1.2"]
      origin_protocol_policy   = "match-viewer"
      origin_read_timeout      = 30
      origin_keepalive_timeout = 5
      http_port                = var.alb_listener_port_http
      https_port               = var.alb_listener_port_https
    }
  }

  ...
}
```

<br>

### ordered_cache_behaviorブロック

Behavior画面に設定するオリジンにルーティングするパスを定義する。

**＊実装例＊**

```terraform
resource "aws_cloudfront_distribution" "this" {

  ...

  ordered_cache_behavior {
    path_pattern           = "/images/*"
    target_origin_id       = "S3-${var.s3_bucket_id}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    min_ttl                = 0
    max_ttl                = 31536000
    default_ttl            = 86400
    compress               = true

    forwarded_values {
      query_string = true # クエリストリングのキャッシュ

      cookies {
        forward = "none" # Cookieのキャッシュ
      }
    }
  }

  ...

}
```

<br>

### default_cache_behavior

Behavior画面に設定するオリジンにルーティングする標準パスを定義する。

**＊実装例＊**

```terraform
resource "aws_cloudfront_distribution" "this" {

  default_cache_behavior {
    target_origin_id       = "ELB-${var.alb_name}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    min_ttl                = 0
    max_ttl                = 31536000
    default_ttl            = 86400
    compress               = true

    forwarded_values {
      query_string = true # クエリストリングのキャッシュ
      headers      = ["*"] # ヘッダーのキャッシュ

      cookies {
        forward = "all" # Cookieのキャッシュ
      }
    }
  }

  ...

}
```

<br>

## 07. ECR

### ライフサイクルポリシー

ECRに紐付けられる、コンテナイメージの有効期間を定義するポリシー。

コンソール画面から入力できるため、基本的にポリシーの実装は不要であるが、TerraformなどのIaCツールでは必要になる。

```yaml
{
  "rules":
    [
      {
        "rulePriority": 1,
        "description": "Keep last 10 images untagged",
        "selection":
          {
            "tagStatus": "untagged",
            "countType": "imageCountMoreThan",
            "countNumber": 10,
          },
        "action": {"type": "expire"},
      },
      {
        "rulePriority": 2,
        "description": "Keep last 10 images any",
        "selection":
          {
            "tagStatus": "any",
            "countType": "imageCountMoreThan",
            "countNumber": 10,
          },
        "action": {"type": "expire"},
      },
    ],
}
```

<br>

## 08. ECS

### まとめ

**＊実装例＊**

```terraform
# ---------------------------------------------
# ECS Service
# ---------------------------------------------
resource "aws_ecs_service" "this" {
  name                               = "prd-foo-ecs-service"
  cluster                            = aws_ecs_cluster.this.id
  launch_type                        = "FARGATE"
  platform_version                   = "1.4.0"
  desired_count                      = var.ecs_service_desired_count
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  # 後述の説明を参考にせよ。(1)
  health_check_grace_period_seconds = 330

  # 後述の説明を参考にせよ。(2)
  task_definition = "${aws_ecs_task_definition.this.family}:${max(aws_ecs_task_definition.this.revision, data.aws_ecs_task_definition.this.revision)}"

  network_configuration {
    security_groups  = [var.ecs_security_group_id]
    subnets          = [var.private_a_app_subnet_id, var.private_c_app_subnet_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.alb_target_group_arn
    container_name   = "nginx"
    container_port   = 80
  }

  load_balancer {
    target_group_arn = var.nlb_target_group_arn
    container_name   = "nginx"
    container_port   = 80
  }

  depends_on = [
    # 後述の説明を参考にせよ。(3)
    var.alb_listener_https,
    var.nlb_listener
  ]

  lifecycle {
    ignore_changes = [
      # ※後述の説明を参考にせよ(4)
      desired_count,
    ]
  }
}
```

<br>

### `(1)` ヘルスチェック待機時間

ECSタスクの起動が完了する前にサービスがロードバランサ－のヘルスチェックを検証し、Unhealthyと誤認してしまうため、ECSタスクの起動完了を待機する。

例えば、ロードバランサ－が30秒間隔でヘルスチェックを実行する場合は、30秒単位で待機時間を増やし、適切な待機時間を見つけるようにする。

<br>

### `(2)`実インフラのリビジョン番号の追跡

アプリケーションのデプロイによって、実インフラのECSタスク定義のリビジョン番号が増加するため、これを追跡可能にする。

> - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ecs_task_definition

<br>

### `(3)`ALB/NLBリスナーの作成を待機

Terraformは、特に依存関係を実装しない場合、『ターゲットグループ ➡︎ ALB/NLB ➡︎ リスナー』の順で`resource`ブロックを作成する。

問題として、ALB/NLBやリスナーの作成が終了する前に、ECSサービスの作成が始まってしまう。

ALB/NLBの作成 (※リスナーも含む可能性) が完全に完了しない状態では、ターゲットグループはECSサービスに紐付けらず、これが完了する前にECSサービスがターゲットグループを参照しようとするため、エラーになってしまう。

リスナーの後にECSサービスを作成するようにし、『ターゲットグループ ➡︎ ALB/NLB ➡︎ リスナー ➡︎ ECSサービス』の順で`resource`ブロックを作成可能にする。

> - https://github.com/hashicorp/terraform/issues/12634#issuecomment-313215022

<br>

### `(4)`AutoScalingによるECSタスク数の増減を無視

AutoScalingによって、ECSタスク数が増減するため、これを無視する。

<br>

### (＊) ECSタスク定義の更新

TerraformでECSタスク定義を更新すると、現在動いているECSで稼働しているECSタスクはそのままに、新しいリビジョン番号のECSタスク定義が作成される。

コンソール画面の『新しいリビジョンの作成』と同じ挙動である。

実際にECSタスクが増えていることは、サービスに紐付くECSタスク定義一覧から確認できる。

次のデプロイ時に、このECSタスクが使用される。

<br>

### (＊) サービスのデプロイの削除時間

ECSサービスの削除には『ドレイニング』の時間が発生する。

約`2`分`30`秒かかるため、気長に待つこと。

<br>

### (＊) ローリングアップデート

`terraform apply`コマンドで、新しいリビジョン番号のECSタスク定義を作成すると、これを使用してローリングアップデートが自動的に実行されることに注意する。

ただし、ローリングアップデートの仕組み上、新しいECSタスクのヘルスチェックが失敗すれば、既存のECSタスクは停止せずにそのまま稼働するため、安心ではあるが。

<br>

### (＊) ECSコンテナ名

コンテナ名は、役割名 (app、web、monitoring、など) ではなく、ベンダー名 (laravel、nginx、datadog、など) とする。

ただし、AWS FireLensコンテナはlog_routerとしなければならない仕様であり、ベンダー名を使用できない場合は役割名になることを許容する。

<br>

## 09. EC2

### まとめ

**＊実装例＊**

```terraform
# ---------------------------------------------
# For bastion
# ---------------------------------------------
resource "aws_instance" "bastion" {
  ami                         = "*****"
  instance_type               = "t2.micro"
  vpc_security_group_ids      = ["*****"]
  subnet_id                   = "*****"
  associate_public_ip_address = true

  # ※後述の説明を参考にせよ(1)
  key_name = "prd-foo-bastion"

  disable_api_termination = true

  tags = {
    Name = "prd-foo-bastion"
  }

  # ※後述の説明を参考にせよ(2)
  depends_on = [var.internet_gateway]
}
```

<br>

### `(1)` キーペアはコンソール上で設定

誤って削除しないように、またコードに秘密鍵の内容をハードコーディングしないように、キーペアはコンソール画面で作成した後、`key_name`でキー名を指定する。

<br>

### `(2)`Internet Gatewayの後に作成

Internet Gatewayの後にEC2を作成可能にする。

> - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/internet_gateway#argument-reference

<br>

## 10. EKS

### まとめ

EKSのNodeグループをマネージドとする場合、起動テンプレートも合わせて設定する必要がある。

```terraform
resource "aws_eks_node_group" "this" {

  cluster_name  = "foo-eks-cluster"
  node_role_arn = ""
  subnet_ids    = ""

  scaling_config {
    min_size     = 3
    max_size     = 5
    desired_size = 4
  }

  node_group_name        = ""

  ami_type        = ""
  release_version = ""
  version         = ""

  capacity_type        = ""
  disk_size            = ""
  force_update_version = ""
  instance_types       = ""
  labels               = ""

  # 起動テンプレートを紐づける
  launch_template = {
    id      = ""
    version = ""
  }

  remote_access = {
    ec2_ssh_key               = ""
    source_security_group_ids = ""
  }

  taint = {
    key    = ""
    value  = ""
    effect = ""
  }

  update_config {
    max_unavailable_percentage = ""
    max_unavailable            = ""
  }

  timeouts {
    create = ""
    update = ""
    delete = ""
  }

  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      # ※後述の説明を参考にせよ(1)
      scaling_config[0].desired_size,
    ]
  }

  tags = {
    Name = ""
  }
}
```

> - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/eks_cluster#example-usage

<br>

### `(1)`Node数の増減は無視

EKSでは、cluster-autoscalerを使用して、Nodeをスケーリングさせる。

この時のNode数の増減を無視できるようにしておく。

<br>

## 11. IAMユーザー

### カスタマー管理ポリシーを持つロール

事前に、tpl形式のカスタマー管理ポリシーを定義しておく。

作成済みのIAMロールに、`aws_iam_policy`リソースを使用して、AWS管理ポリシーをIAMユーザーに紐付ける。

**＊実装例＊**

ローカルマシンからAWS CLIコマンドを実行する必要がある場合、コマンドを特定の送信元IPアドレスを特定のものに限定する。

事前に、list型でIPアドレスを定義する。

```terraform
# ---------------------------------------------
# IP addresses
# ---------------------------------------------
global_ip_addresses = [
  "*.*.*.*/32",
  "*.*.*.*/32"
]
```

また事前に、指定した送信元IPアドレス以外を拒否するカスタマー管理ポリシーを定義する。

```yaml
{
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Deny",
    "Action": "*",
    "Resource": "*",
    "Condition": {
      "NotIpAddress": {
        "aws:SourceIp": ${global_ip_addresses}
      }
    }
  }
}
```

コンソール画面で作成済みのIAMユーザーの名前を取得する。

tpl形式のポリシーにlist型の値を渡す時、`jsonencode`関数を使用する必要がある。

```terraform
# ---------------------------------------------
# For IAM User
# ---------------------------------------------
data "aws_iam_user" "aws_cli_command_executor" {
  user_name = "aws_cli_command_executor"
}

resource "aws_iam_policy" "aws_cli_command_executor_ip_address_restriction" {
  name        = "prd-aws-cli-command-executor-ip-address-restriction-policy"
  description = "Allow global IP addresses"
  policy = templatefile(
    "${path.module}/policies/customer_managed_policies/aws_cli_command_executor_ip_address_restriction_policy.tpl",
    {
      global_ip_addresses = jsonencode(var.global_ip_addresses)
    }
  )
}
```

<br>

### AWS管理ポリシー

IAMユーザーにAWS管理ポリシーを紐付ける。

**＊実装例＊**

```terraform
# ---------------------------------------------
# For IAM User
# ---------------------------------------------
resource "aws_iam_user_policy_attachment" "aws_cli_command_executor_s3_read_only_access" {
  user       = data.aws_iam_user.aws_cli_command_executor.user_name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}
```

<br>

## 12. IAMロール

### 信頼ポリシーを持つロール

コンソール画面でロールを作成する場合は意識することはないが、特定の`resource`ブロックにロールを紐付けるためには、ロールに信頼ポリシーを組み込む必要がある。

事前に、tpl形式の信頼ポリシーを定義しておく。

`aws_iam_role`リソースを使用して、IAMロールを作成すると同時に、これに信頼ポリシーを紐付ける。

**＊実装例＊**

事前に、ECSタスクのための信頼ポリシーを定義する。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Principal": {"Service": "ecs-tasks.amazonaws.com"},
        "Action": "sts:AssumeRole",
      },
    ],
}
```

ECSタスクロールとECSタスク実行ロールに信頼ポリシー紐付ける。

```terraform
# ---------------------------------------------
# IAM Role For ECS Task Execution
# ---------------------------------------------
resource "aws_iam_role" "ecs_task_execution" {
  name        = "prd-foo-ecs-task-execution-role"
  description = "The role for prd-foo-ecs-task"
  assume_role_policy = templatefile(
    "${path.module}/policies/trust_policies/ecs_task_policy.tpl",
    {}
  )
}

# ---------------------------------------------
# IAM Role For ECS Task
# ---------------------------------------------
resource "aws_iam_role" "ecs_task" {
  name        = "prd-foo-ecs-task-role"
  description = "The role for prd-foo-ecs-task"
  assume_role_policy = templatefile(
    "${path.module}/policies/trust_policies/ecs_task_policy.tpl",
    {}
  )
}
```

**＊実装例＊**

事前に、Lambda@Edgeのための信頼ポリシーを定義する。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Sid": "",
        "Effect": "Allow",
        "Principal":
          {"Service": ["lambda.amazonaws.com", "edgelambda.amazonaws.com"]},
        "Action": "sts:AssumeRole",
      },
    ],
}
```

Lambda実行ロールに信頼ポリシー紐付ける。

```terraform
# ---------------------------------------------
# IAM Role For Lambda@Edge
# ---------------------------------------------

# ロールに信頼ポリシーを紐付けします。
resource "aws_iam_role" "lambda_execute" {
  name = "prd-foo-lambda-execute-role"
  assume_role_policy = templatefile(
    "${path.module}/policies/lambda_execute_role_trust_policy.tpl",
    {}
  )
}
```

<br>

### インラインポリシーを持つロール

事前に、tpl形式のインラインポリシーを定義しておく。

`aws_iam_role_policy`リソースを使用して、インラインポリシーを作成すると同時に、これにインラインポリシーを紐付ける。

**＊実装例＊**

事前に、ECSタスクに必要最低限の権限を与えるインラインポリシーを定義する。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [{"Effect": "Allow", "Action": ["ssm:GetParameters"], "Resource": "*"}],
}
```

ECSタスクロールとECSタスク実行ロールにインラインポリシー紐付ける。

```terraform
# ---------------------------------------------
# IAM Role For ECS Task
# ---------------------------------------------
resource "aws_iam_role_policy" "ecs_task" {
  name = "prd-foo-ssm-read-only-access-policy"
  role = aws_iam_role.ecs_task_execution.id
  policy = templatefile(
    "${path.module}/policies/inline_policies/ecs_task_policy.tpl",
    {}
  )
}
```

<br>

### AWS管理ポリシーを持つロール

事前に、tpl形式のAWS管理ポリシーを定義しておく。

`aws_iam_role_policy_attachment`リソースを使用して、実インフラにあるAWS管理ポリシーを作成済みのIAMロールに紐付ける。

ポリシーのARNは、AWSのコンソール画面を確認する。

**＊実装例＊**

```terraform
# ---------------------------------------------
# IAM Role For ECS Task Execution
# ---------------------------------------------
resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
```

<br>

### カスタマー管理ポリシーを持つロール

事前に、tpl形式のインラインポリシーを定義しておく。

`aws_iam_role_policy`リソースを使用して、カスタマー管理ポリシーを作成する。

`aws_iam_role_policy_attachment`リソースを使用して、カスタマー管理ポリシーを作成済みのIAMロールに紐付ける。

**＊実装例＊**

事前に、ECSタスクに必要最低限の権限を与えるカスタマー管理ポリシーを定義する。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Action": ["logs:CreateLogStream", "logs:PutLogEvents"],
        "Resource": ["arn:aws:logs:*:*:*"],
      },
    ],
}
```

ECSタスクロールにカスタマー管理ポリシー紐付ける。

```terraform
# ---------------------------------------------
# IAM Role For ECS Task
# ---------------------------------------------
resource "aws_iam_policy" "ecs_task" {
  name        = "prd-foo-cloudwatch-logs-access-policy"
  description = "Provides access to CloudWatch Logs"
  policy = templatefile(
    "${path.module}/policies/customer_managed_policies/cloudwatch_logs_access_policy.tpl",
    {}
  )
}

resource "aws_iam_role_policy_attachment" "ecs_task" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = aws_iam_policy.ecs_task.arn
}
```

<br>

### サービスリンクロール

サービスリンクロールは、AWSリソースの作成時に自動的に作成され、紐付けられる。

そのため、Terraformの管理外である。

`aws_iam_service_linked_role`リソースを使用して、手動で作成できるが、数が多く実装の負担にもなるため、あえて管理外としても問題ない。

**＊実装例＊**

サービス名を指定して、ApplicationAutoScalingのサービスリンクロールを作成する。

```terraform
# ---------------------------------------------
# IAM Role For ECS Service
# ---------------------------------------------
# Service Linked Role
resource "aws_iam_service_linked_role" "ecs_service_auto_scaling" {
  aws_service_name = "ecs.application-autoscaling.amazonaws.com"
}
```

```terraform
# ---------------------------------------------
# Output IAM Role
# ---------------------------------------------
output "ecs_service_auto_scaling_iam_service_linked_role_arn" {
  value = aws_iam_service_linked_role.ecs_service_auto_scaling.arn
}
```

ApplicationAutoScalingにサービスリンクロールを紐付ける。

手動でも設定できるが、Terraformの管理外で自動的に紐付けられるため、あえて妥協しても良い。

```terraform
# ---------------------------------------------
# Application Auto Scaling For ECS
# ---------------------------------------------
resource "aws_appautoscaling_target" "ecs" {
  service_namespace  = "ecs"
  resource_id        = "service/prd-foo-ecs-cluster/prd-foo-ecs-service"
  scalable_dimension = "ecs:service:DesiredCount"
  max_capacity       = 4
  min_capacity       = 2

  # この設定がなくとも、サービスリンクロールが自動的に作成され、AutoScalingに紐付けられる。
  role_arn           = var.ecs_service_auto_scaling_iam_service_linked_role_arn
}
```

<br>

## 13. リスナーとターゲットグループ

### まとめ

**＊実装例＊**

```terraform
# ---------------------------------------------
# NLB target group
# ---------------------------------------------
resource "aws_lb_target_group" "this" {
  name                 = "prd-foo-nlb-tg"
  port                 = 80
  protocol             = "TCP"
  vpc_id               = "vpc-*****"
  deregistration_delay = "60"
  target_type          = "ip"

  # ※後述の説明を参考にせよ(1)
  slow_start = "0"

  # ※後述の説明を参考にせよ(2)
  health_check {
    protocol          = "HTTP"
    healthy_threshold = 3
    path              = "/healthcheck"
  }

  # stickiness ※後述の説明を参考にせよ(3)
  # https://registry.terraform.io/providers/hashicorp/aws/3.16.0/docs/resources/lb_target_group#stickiness

  lifecycle {
    create_before_destroy = false
  }
}
```

<br>

### `(1)` NLBはスロースタートに非対応

NLBに紐付くターゲットグループはスロースタートに非対応のため、これを明示的に無効化する必要がある。

<br>

### `(2)`NLBヘルスチェックには設定できる項目が少ない

ターゲットグループの転送プロトコルがTCPの場合は、設定できないヘルスチェックオプションがいくつかある。

ヘルスチェックプロトコルがHTTPまたはHTTPSの時のみ、パスを設定できる。

> - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_target_group#health_check

<br>

### `(3)`NLBスティッキーネスは明示的に無効化

スティッキネス機能を無効化する場合、AWSプロバイダーのアップグレード時に問題が起こらないように、このブロックを実装しないようにする。

リンクのNOTE文を参考にせよ。

> - https://registry.terraform.io/providers/hashicorp/aws/3.16.0/docs/resources/lb_target_group#stickiness

<br>

### (＊) ターゲットグループの削除時にリスナーを先に削除できない。

リスナーがターゲットグループに依存しているが、Terraformがターゲットグループの削除時にリスナーを先に削除しようとしない。

そのため、以下のようなエラーが発生する。

```bash
Error deleting Target Group: ResourceInUse: Target group 'arn:aws:elasticloadbalancing:ap-northeast-1:<AWSアカウントID>:targetgroup/*****-tg/*****' is currently in use by a listener or a rule
status code: 400, request id: *****
```

このエラーが発生した場合、コンソール画面上でリスナーを削除したうえで、もう一度`terraform apply`コマンドを実行する。

> - https://github.com/hashicorp/terraform-provider-aws/issues/1315#issuecomment-415423529

<br>

## 14. RDS (Aurora) の場合

### まとめ

**＊実装例＊**

```terraform
# ---------------------------------------------
# RDS Cluster
# ---------------------------------------------
resource "aws_rds_cluster" "this" {
  engine                          = "aurora-mysql"
  engine_version                  = "5.7.mysql_aurora.2.08.3"
  cluster_identifier              = "prd-foo-rds-cluster"

  # 後述の説明を参考にせよ。(1)
  master_username                 = var.rds_db_master_username_ssm_parameter_value
  master_password                 = var.rds_db_master_password_ssm_parameter_value
  port                            = var.rds_db_port_ssm_parameter_value
  database_name                   = var.rds_db_name_ssm_parameter_value

  vpc_security_group_ids          = [var.rds_security_group_id]
  db_subnet_group_name            = aws_db_subnet_group.this.name
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.this.id
  storage_encrypted               = true
  backup_retention_period         = 7
  preferred_backup_window         = "00:00-00:30"
  copy_tags_to_snapshot           = true
  final_snapshot_identifier       = "final-db-snapshot"
  skip_final_snapshot             = false
  enabled_cloudwatch_logs_exports = ["audit", "error", "general", "slowquery"]
  preferred_maintenance_window    = "sun:01:00-sun:01:30"

  # 後述の説明を参考にせよ。(2)
  apply_immediately = true

  # 後述の説明を参考にせよ。(3)
  availability_zones = ["${var.region}${var.vpc_availability_zones.a}", "${var.region}${var.vpc_availability_zones.c}"]

  deletion_protection = true

  lifecycle {
    ignore_changes = [
      # 後述の説明を参考にせよ。(4)
      availability_zones,
      # 後述の説明を参考にせよ。(5)
      engine_version
    ]
  }
}

# ---------------------------------------------
# RDS Cluster Instance
# ---------------------------------------------
resource "aws_rds_cluster_instance" "this" {
  # 後述の説明を参考にせよ。(6)
  for_each = var.vpc_availability_zones

  engine                       = "aurora-mysql"
  engine_version               = "5.7.mysql_aurora.2.08.3"
  identifier                   = "prd-foo-rds-instance-${each.key}"
  cluster_identifier           = aws_rds_cluster.this.id
  db_subnet_group_name         = aws_db_subnet_group.this.id
  db_parameter_group_name      = aws_db_parameter_group.this.id
  monitoring_interval          = 60
  monitoring_role_arn          = var.rds_iam_role_arn
  auto_minor_version_upgrade   = var.rds_auto_minor_version_upgrade
  preferred_maintenance_window = "sun:01:00-sun:01:30"
  apply_immediately            = true

  # 後述の説明を参考にせよ。(7)
  instance_class = var.rds_instance_class[each.key]

  # 後述の説明を参考にせよ。(8)
  # preferred_backup_window
}

# 後述の説明を参考にせよ。(9)
locals {
  rds_cluster_vpc_availability_zones_a = aws_rds_cluster_instance.this[var.vpc_availability_zones.a]
}

resource "aws_rds_cluster_instance" "read_replica" {
  count = 1

  engine                       = local.rds_cluster_vpc_availability_zones_a.engine
  engine_version               = local.rds_cluster_vpc_availability_zones_a.engine_version
  identifier                   = "prd-foo-rds-instance-read-replica-${count.index + 1}"
  instance_class               = local.rds_cluster_vpc_availability_zones_a.instance_class
  cluster_identifier           = local.rds_cluster_vpc_availability_zones_a.cluster_identifier
  db_subnet_group_name         = local.rds_cluster_vpc_availability_zones_a.db_subnet_group_name
  db_parameter_group_name      = local.rds_cluster_vpc_availability_zones_a.db_parameter_group_name
  monitoring_interval          = local.rds_cluster_vpc_availability_zones_a.monitoring_interval
  monitoring_role_arn          = local.rds_cluster_vpc_availability_zones_a.monitoring_role_arn
  auto_minor_version_upgrade   = local.rds_cluster_vpc_availability_zones_a.auto_minor_version_upgrade
  preferred_maintenance_window = local.rds_cluster_vpc_availability_zones_a.preferred_maintenance_window
  apply_immediately            = local.rds_cluster_vpc_availability_zones_a.apply_immediately
}

# ---------------------------------------------
# RDS Subnet Group
# ---------------------------------------------
resource "aws_db_subnet_group" "this" {
  name        = "prd-foo-rds-subnet-gp"
  description = "The subnet group for prd-foo-rds"
  # 後述の説明を参考にせよ。(10)
  subnet_ids  = [var.private_a_datastore_subnet_id, var.private_c_datastore_subnet_id]

  lifecycle {
    create_before_destroy = true
  }
}
```

<br>

### `(1)` パラメーターストア

Terraformに値をハードコーディングしたくない場合は、パラメーターストアで値を管理し、これを`data`ブロックで取得する。

<br>

### `(2)`メンテナンスウインドウ時に変更適用

メンテナンスウインドウ時の変更適用をTerraformで行う場合、一段階目に`apply_immediately`オプションを`false`に変更して`terraform apply`コマンドを実行することにより、二段階目に修正を`terraform apply`コマンドを実行する。

<br>

### `(3)`DBクラスターにはAZが`3`個必要

DBクラスターでは、レプリケーションのために、`3`個のAZが必要である。

そのため、指定したAZが2つであっても、コンソール画面上で`3`個のAZが自動的に設定される。

Terraformがこれを認識しないように、`ignore_changes`引数でAZを指定しておく必要がある。

> - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/rds_cluster#availability_zones
> - https://github.com/hashicorp/terraform-provider-aws/issues/7307#issuecomment-457441633
> - https://github.com/hashicorp/terraform-provider-aws/issues/1111

<br>

### `(4)`インスタンスを配置するAZは選択できない

事前にインスタンスにAZを表す識別子を入れたとしても、Terraformはインスタンスを配置するAZを選択できない。

そのため、AZと識別子の関係が逆になってしまうことがある。

多くの場合、 `c`ゾーンのインスタンスが最初に作成されるため、インスタンスのゾーン名と配置される`a`/`c`ゾーンが逆になる。

その場合は、デプロイ後に手動で名前を変更すれば良い。

この変更は、Terraformが差分として認識しないので問題ない。

<br>

### `(5)`エンジンバージョンのアップグレードは画面から

運用でTerraformでエンジンバージョンをアップグレードすることに抵抗感がある場合、コンソール画面からアップグレードをTerraformで無視すると良い。

ただし、画面からの変更後にTerraformのコードも変更しておく必要がある。

Terraformを書き換えなくとも問題は起こらないが、Terraformのコードと実インフラが乖離してしまう。

<br>

### `(6)``for_each`引数を使用して

Auroraでは、クラスターにインスタンスを1つだけ紐付けると、プライマリーインスタンスとして作成される。

また以降インスタンスを紐付けると、リードレプリカとして自動的に作成されていく。

AZのマップデータに対して`for_each`引数を使用することにより、各AZに最低1つのインスタンスを配置するように設定できる。

> - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/rds_cluster_instance
> - https://github.com/hashicorp/terraform/issues/5333

<br>

### `(7)`インスタンスタイプは別々に設定する

インスタンスタイプに`for_each`引数で値を渡さない場合、各DBインスタンスのインスタンスタイプを同時に変更することになる。

この場合、インスタンスのフェイルオーバーを使用できず、ダウンタイムを最小化できない。

そのため、`for_each`引数を使用して、DBインスタンスごとにインスタンスタイプを設定する。

インスタンスごとに異なるインスタンスタイプを設定する場合は、`for_each`引数で割り当てる値の順番を考慮する必要があるため、配置されているAZを事前に確認する必要がある。

<br>

### `(8)`インスタンスにバックアップウインドウは設定しない

DBクラスターとDBインスタンスの両方に、`preferred_backup_window`オプションを設定できるが、RDSインスタンスに設定してはいけない。

<br>

### `(9)`リードレプリカの追加

クラスターに `count`引数で量産したインスタンスを紐付ける。

`count`引数は本来非推奨であるが、同じ設定のインスタンスを単に量産するだけなため、許容する。

<br>

### `(10)`マルチAZを有効化する

Auroraでは、紐付けられたサブネットグループが複数のAZのサブネットで構成されている場合、各インスタンスを自動的にAZに配置するようになっている。

そのため、サブネットグループに複数のサブネットを紐付けるようにする。

> - https://github.com/hashicorp/terraform/issues/5333

<br>

## 15. Route53

### まとめ

**＊実装例＊**

```terraform
# ---------------------------------------------
# For foo domain
# ---------------------------------------------
resource "aws_route53_zone" "foo" {
  name = var.route53_domain_foo
}

resource "aws_route53_record" "foo" {
  zone_id = aws_route53_zone.foo.id
  name    = var.route53_domain_foo
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = false
  }
}
```

\*＊実装例＊\*\*

```terraform
# ---------------------------------------------
# For foo domain
# ---------------------------------------------
resource "aws_route53_zone" "foo" {
  name = var.route53_domain_foo
}

resource "aws_route53_record" "foo" {
  zone_id = aws_route53_zone.foo.id
  name    = var.route53_domain_foo
  type    = "NS"
  ttl     = 30
  # NSレコードのリストを出力する
  records = aws_route53_zone.foo.name_servers
  # AWSが自動的に作成するNSレコードとTerraformによるそれが衝突するため、Terraform側が上書き可能にする
  allow_overwrite = true
}
```

<br>

## 16. ルートテーブル

### メインルートテーブルは自動作成

Terraformを使用してVPCを作成した時、メインルートテーブルが自動的に作成される。

そのため、これはTerraformの管理外である。

<br>

## 17. S3

### バケットポリシー

S3紐付けられる、自身へのアクセスを制御するためにインラインポリシーのこと。

定義したバケットポリシーは、`aws_s3_bucket_policy`リソースでロールに紐付けできる。

<br>

### ALBアクセスログ

ALBがバケットにログを書き込めるように、『ELBのサービスアカウントID』を許可する必要がある。

**＊実装例＊**

```terraform
# ---------------------------------------------
# S3 bucket policy
# ---------------------------------------------

# S3にバケットポリシーを紐付けします。
resource "aws_s3_bucket_policy" "alb" {
  bucket = aws_s3_bucket.alb_logs.id
  policy = templatefile(
    "${path.module}/policies/alb_bucket_policy.tpl",
    {}
  )
}
```

ALBのアクセスログを送信するバケット内には、自動的に『/AWSLogs/<AWSアカウントID>』の名前でディレクトリが作成される。

そのため、『`arn:aws:s3:::<バケット名>/*`』の部分を最小権限として、『`arn:aws:s3:::<バケット名>/AWSLogs/<AWSアカウントID>/;*`』にしても良い。

東京リージョンのELBサービスアカウントIDは『`582318560864`』である。

> - https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html#access-logging-bucket-permissions

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Principal": {"AWS": "arn:aws:iam::582318560864:root"},
        "Action": "s3:PutObject",
        "Resource": "arn:aws:s3:::<バケット名>/*",
      },
    ],
}
```

<br>

### NLBアクセスログ

ALBがバケットにログを書き込めるように、『`delivery.logs.amazonaws.com`』からのアクセスを許可する必要がある。

**＊実装例＊**

```terraform
# ---------------------------------------------
# S3 bucket policy
# ---------------------------------------------

# S3にバケットポリシーを紐付けします。
resource "aws_s3_bucket_policy" "nlb" {
  bucket = aws_s3_bucket.nlb_logs.id
  policy = templatefile(
    "${path.module}/policies/nlb_bucket_policy.tpl",
    {}
  )
}
```

NLBのアクセスログを送信するバケット内には、自動的に『`/AWSLogs/<AWSアカウントID>`』の名前でディレクトリが作成される。

そのため、『`arn:aws:s3:::<バケット名>/*`』の部分を最小権限として、『`arn:aws:s3:::<バケット名>/AWSLogs/<AWSアカウントID>/;*`』にしても良い。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Sid": "AWSLogDeliveryWrite",
        "Effect": "Allow",
        "Principal": {"Service": "delivery.logs.amazonaws.com"},
        "Action": "s3:PutObject",
        "Resource": "arn:aws:s3:::<バケット名>/*",
        "Condition": {
            # 完全一致
            "StringEquals": {"s3:x-amz-acl": "bucket-owner-full-control"},
          },
      },
      {
        "Sid": "AWSLogDeliveryAclCheck",
        "Effect": "Allow",
        "Principal": {"Service": "delivery.logs.amazonaws.com"},
        "Action": "s3:GetBucketAcl",
        "Resource": "arn:aws:s3:::<バケット名>",
      },
    ],
}
```

<br>

## 18. Systems Manager

### まとめ

```terraform
# ---------------------------------------------
# For RDS
# ---------------------------------------------
output "rds_db_name_ssm_parameter_value" {
  sensitive = true # 後述の説明を参考にせよ。(1)
  value     = data.aws_ssm_parameter.rds_db_name.value
}

output "rds_db_master_password_ssm_parameter_value" {
  sensitive = true
  value     = data.aws_ssm_parameter.rds_db_master_password.value
}

output "rds_db_master_username_ssm_parameter_value" {
  sensitive = true
  value     = data.aws_ssm_parameter.rds_db_master_username.value
}

output "rds_db_port_ssm_parameter_value" {
  sensitive = true
  value     = data.aws_ssm_parameter.rds_db_port.value
}
```

<br>

### `(1)`terraform plan`コマンド時に非表示

CIの`terraform plan`コマンド時に値が公開されないように`output`ブロックで`sensitive`オプションを有効化する。

<br>

## 19. VPC

### まとめ

```terraform
# 後述の説明を参考にせよ。(1)
vpc_availability_zones             = { a = "a", c = "c" }
vpc_cidr                           = "*.*.*.*/23"
vpc_subnet_public_cidrs            = { a = "*.*.*.*/27", c = "*.*.*.*/27" }
vpc_subnet_private_datastore_cidrs = { a = "*.*.*.*/27", c = "*.*.*.*/27" }
vpc_subnet_private_app_cidrs       = { a = "*.*.*.*/25", c = "*.*.*.*/25" }
```

```terraform
# ---------------------------------------------
# VPC
# ---------------------------------------------
resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.environment}-${var.service}-vpc"
  }
}

# ---------------------------------------------
# Internet Gateway
# ---------------------------------------------
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.environment}-${var.service}-igw"
  }
}

# ---------------------------------------------
# パブリックサブネット
# ---------------------------------------------
resource "aws_subnet" "public" {
  for_each = var.vpc_availability_zones

  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.vpc_subnet_public_cidrs[each.key]
  availability_zone       = "${var.region}${each.value}"
  map_public_ip_on_launch = true

  tags = {
    Name = format(
      "${var.environment}-${var.service}-pub-%s-subnet",
      each.value
    )
  }
}

# ---------------------------------------------
# プライベートサブネット
# ---------------------------------------------

# App subnet
resource "aws_subnet" "private_app" {
  for_each = var.vpc_availability_zones

  vpc_id            = aws_vpc.this.id
  cidr_block        = var.vpc_subnet_private_app_cidrs[each.key]
  availability_zone = "${var.region}${each.value}"

  tags = {
    Name = format(
      "${var.environment}-${var.service}-pvt-%s-app-subnet",
      each.value
    )
  }
}

# Datastore subnet
resource "aws_subnet" "private_datastore" {
  for_each = var.vpc_availability_zones

  vpc_id            = aws_vpc.this.id
  cidr_block        = var.vpc_subnet_private_datastore_cidrs[each.key]
  availability_zone = "${var.region}${each.value}"

  tags = {
    Name = format(
      "${var.environment}-${var.service}-pvt-%s-datastore-subnet",
      each.value
    )
  }
}

# ---------------------------------------------
# ルートテーブル (パブリック)
# ---------------------------------------------
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name = "${var.environment}-${var.service}-pub-rtb"
  }
}

# ---------------------------------------------
# ルートテーブル (プライベート)
# ---------------------------------------------
resource "aws_route_table" "private_app" {
  for_each = var.vpc_availability_zones

  vpc_id = aws_vpc.this.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.this[each.key].id
  }

  tags = {
    Name = format(
      "${var.environment}-${var.service}-pvt-%s-app-rtb",
      each.value
    )
  }
}

# ---------------------------------------------
# ルートテーブルアソシエーション (パブリック)
# ---------------------------------------------
resource "aws_route_table_association" "public" {
  for_each = var.vpc_availability_zones

  subnet_id      = aws_subnet.public[each.key].id
  route_table_id = aws_route_table.public.id
}

# ---------------------------------------------
# ルートテーブルアソシエーション (プライベート)
# ---------------------------------------------
resource "aws_route_table_association" "private_app" {
  for_each = var.vpc_availability_zones

  subnet_id      = aws_subnet.private_app[each.key].id
  route_table_id = aws_route_table.private_app[each.key].id
}

# ---------------------------------------------
# NAT Gateway
# ---------------------------------------------
resource "aws_nat_gateway" "this" {
  for_each = var.vpc_availability_zones

  subnet_id     = aws_subnet.public[each.key].id
  allocation_id = aws_eip.nat_gateway[each.key].id

  tags = {
    Name = format(
      "${var.environment}-${var.service}-%s-ngw",
      each.value
    )
  }

  depends_on = [aws_internet_gateway.this]
}

# ---------------------------------------------
# Elastic IP
# ---------------------------------------------
resource "aws_eip" "nat_gateway" {
  for_each = var.vpc_availability_zones

  vpc = true

  tags = {
    Name = format(
      "${var.environment}-${var.service}-ngw-%s-eip",
      each.value
    )
  }

  depends_on = [aws_internet_gateway.this]
}
```

<br>

### `(1)` 冗長化されたAWSリソースをfor_each関数で作成

AZを上長化している場合、VPC内のサブネットと関連のAWSリソース (ルートテーブル、NAT Gateway、Elastic IPなど) も冗長化することになる。

各AZをキーとするマップ型で定義しておいた変数を`for_each`引数に渡し、AWSリソースをAZごとに作成する。

<br>

## 20. VPC endpoint

### まとめ

```terraform
# ---------------------------------------------
# VPC endpoint
# ---------------------------------------------
resource "aws_vpc_endpoint" "cloudwatch_logs" {
  vpc_id              = aws_vpc.this.id
  subnet_ids          = [aws_subnet.private_app[var.vpc_availability_zones.a].id, aws_subnet.private_app[var.vpc_availability_zones.c].id]
  vpc_endpoint_type   = "Interface"
  service_name        = "com.amazonaws.${var.region}.logs"
  private_dns_enabled = true
  security_group_ids  = [var.cloudwatch_logs_endpoint_security_group_id]

  tags = {
    Name = "${var.environment}-${var.service}-cw-logs-ep"
  }
}

resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.this.id
  subnet_ids          = [aws_subnet.private_app[var.vpc_availability_zones.a].id, aws_subnet.private_app[var.vpc_availability_zones.c].id]
  vpc_endpoint_type   = "Interface"
  service_name        = "com.amazonaws.${var.region}.ecr.api"
  private_dns_enabled = true
  security_group_ids  = [var.ecr_endpoint_security_group_id]

  tags = {
    Name = "${var.environment}-${var.service}-ecr-api-ep"
  }
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.this.id
  subnet_ids          = [aws_subnet.private_app[var.vpc_availability_zones.a].id, aws_subnet.private_app[var.vpc_availability_zones.c].id]
  vpc_endpoint_type   = "Interface"
  service_name        = "com.amazonaws.${var.region}.ecr.dkr"
  private_dns_enabled = true
  security_group_ids  = [var.ecr_endpoint_security_group_id]

  tags = {
    Name = "${var.environment}-${var.service}-ecr-dkr-ep"
  }
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.this.id
  route_table_ids   = [aws_route_table.private_app[var.vpc_availability_zones.a].id, aws_route_table.private_app[var.vpc_availability_zones.c].id]
  vpc_endpoint_type = "Gateway"
  service_name      = "com.amazonaws.${var.region}.s3"

  tags = {
    Name = "${var.environment}-${var.service}-s3-ep"
  }
}

resource "aws_vpc_endpoint" "ssm" {
  vpc_id              = aws_vpc.this.id
  subnet_ids          = [aws_subnet.private_app[var.vpc_availability_zones.a].id, aws_subnet.private_app[var.vpc_availability_zones.c].id]
  vpc_endpoint_type   = "Interface"
  service_name        = "com.amazonaws.${var.region}.ssm"
  private_dns_enabled = true
  security_group_ids  = [var.ssm_endpoint_security_group_id]

  tags = {
    Name = "${var.environment}-${var.service}-ssm-ep"
  }
}

resource "aws_vpc_endpoint" "ssmmessages" {
  vpc_id              = aws_vpc.this.id
  subnet_ids          = [aws_subnet.private_app[var.vpc_availability_zones.a].id, aws_subnet.private_app[var.vpc_availability_zones.c].id]
  vpc_endpoint_type   = "Interface"
  service_name        = "com.amazonaws.${var.region}.ssmmessages"
  private_dns_enabled = true
  security_group_ids  = [var.ssmmessages_endpoint_security_group_id]

  tags = {
    Name = "${var.environment}-${var.service}-ssmmessages-ep"
  }
}

```

<br>

## 21. WAF

### ruleブロック

**＊実装例＊**

API Gateway用のWAFに、特定のユーザーエージェントを拒否するルールを設定する。

```terraform
resource "aws_wafv2_web_acl" "api_gateway" {

  rule {
    name     = "block-user-agents"
    priority = 0

    statement {

      regex_pattern_set_reference_statement {
        # 別ディレクトリのmain.tfファイルに分割した正規表現パターンセットを参照する。
        arn = var.wafv2_regex_pattern_set_regional_block_user_agents_arn

        field_to_match {
          # ヘッダーを検証する。
          single_header {
            name = "user-agent"
          }
        }

        text_transformation {
          priority = 0
          type     = "NONE"
        }
      }
    }

    action {
      block {}
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "APIGatewayWAFBlockUserAgentsRule"
      sampled_requests_enabled   = true
    }
  }

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "APIGatewayALBWAFRules"
    sampled_requests_enabled   = true
  }

  ...

}
```

**＊実装例＊**

API Gateway用のWAFに、特定のグローバルIPアドレスを拒否するルールを設定する。

```terraform
resource "aws_wafv2_web_acl" "api_gateway" {

  rule {
    name     = "block-global-ip-addresses"
    priority = 0

    statement {

      ip_set_reference_statement {
        # 別ディレクトリのmain.tfファイルに分割したIPアドレスセットを参照する。
        arn = var.waf_blocked_global_ip_addresses
      }
    }

    action {
      block {}
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "APIGatewayWAFBlockGlobalIPAddressesRule"
      sampled_requests_enabled   = true
    }

  }

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "APIGatewayWAFRules"
    sampled_requests_enabled   = true
  }

  ...

}
```

**＊実装例＊**

API Gateway用のWAFに、SQLインジェクションを拒否するマネージドルールを設定する。

```terraform
resource "aws_wafv2_web_acl" "api_gateway" {

  rule {
    name     = "block-sql-injection"
    priority = 0

    statement {

      # マネージドルールを使用する。
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesSQLiRuleSet"
      }
    }

    override_action {
      count {}
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "APIGatewayWAFBlockSQLInjectionRule"
      sampled_requests_enabled   = true
    }
  }

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "APIGatewayWAFRules"
    sampled_requests_enabled   = true
  }

  ...

}
```

**＊実装例＊**

ALB用のWAFに、APIキーまたはBearerトークンをOR条件ルールを設定する。

あくまで例としてで、本来であれば、異なるルールとした方が良い。

```terraform
resource "aws_wafv2_web_acl" "api_gateway" {

  # x-api-keyヘッダーにAPIキーを含むリクエストを許可します。
  rule {
    name     = "allow-request-including-api-key"
    priority = 3

    statement {

      or_statement {

        # APIキーを持つのリクエストを許可します。
        statement {

          byte_match_statement {
            positional_constraint = "EXACTLY"
            search_string         = var.waf_api_key_ssm_parameter_value

            field_to_match {

              single_header {
                name = "x-api-key"
              }
            }

            text_transformation {
              priority = 0
              type     = "NONE"
            }
          }
        }

        # Bearerトークンを持つリクエストを許可します。
        statement {

          byte_match_statement {
            positional_constraint = "EXACTLY"
            search_string         = var.waf_bearer_token_ssm_parameter_value

            field_to_match {

              single_header {
                name = "authorization"
              }
            }

            text_transformation {
              priority = 0
              type     = "NONE"
            }
          }
        }
      }
    }

    action {
      allow {}
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "APIGatewayWAFAllowRequestIncludingAPIKeyRule"
      sampled_requests_enabled   = true
    }
  }

  ...

}
```

<br>

### IPセットの依存関係

WAFのIPセットと他設定の依存関係に癖がある。

新しいIPセットへの付け換えと古いIPセットの削除を同時にデプロイしないようにする。

もし同時に行った場合、Terraformは古いIPセットの削除処理を先に実行するが、これはWAFに紐付いているため、ここでエラーが起こってしまう。

そのため、IPセットを新しく再設定する場合は、以下の通り`2`個の段階に分けてデプロイする。

補足として、IPセットの名前を変更する場合は、更新処理ではなく削除を伴う再作成処理が実行されるため注意する。

(1) 新しいIPセットのresourceを実装し、ACLに紐付け、デプロイする。

(2)古いIPセットのresourceを削除し、デプロイする。

もし、これを忘れてしまった場合は、画面上で適当なIPセットに付け換えて、削除処理を実行可能にする。

<br>

## 22. Terraform管理外のAWSリソース

### 判断基準

以下の理由で、個人的には、一部のAWSリソースではTerraformを使用しない方が良い。

代わりに、コンソール画面やAWS CLIでAWSリソースで構築する。

- ビジネスロジックを持つAWSリソースでは、継続的な改善のサイクルが早い (変更の要望頻度が高い) ため、リリースまでに時間がかかるTerraformで管理すると、このサイクルを阻害してしまう：

  - API Gateway、IAMユーザー/グループ、IAMユーザー/グループに関連するロール/ポリシー、など

- セキュリティを含むAWSリソースでは、Terraformのリポジトリで機密な変数やファイルを管理するわけにはいかず、また`tfstate`ファイルに書き込まれないようにする：

  - EC2の秘密鍵、パラメーターストア、など

- Terraformによる初期作成時に必要であり、それがないとそもそも`terraform apply`コマンドできない：

  - Terraform用IAMユーザー、tfstateを管理するS3バケット、など
  - これに関しては、CloudFormationで作成しても良い。

- Terraformの誤操作で削除してはいけないAWSリソースでは、Terraformで管理しないことにより、削除を防げる：

  - tfstateを管理するS3バケットなど

- Terraformで特定のAWSリソースを作成すると、それに伴って自動的に作成されてしまう：

  - ENIなど

- そもそもAWSがAPIを公開していないことが理由で、Terraformで実装できない：
  - Chatbotなど

<br>

### 詳細

| AWSリソース                  | 管理外の部分                         | 管理外の理由                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ACM                          | 全て                                 | `terraform apply`コマンド中に承認作業が発生し、プロビジョニングが止まってしまうため。ただし、承認を自動で実行できる場合には、Terraformで管理しても良い。                                                                                                                                                                                                                                                     |
| API Gateway、紐付くVPCリンク | 全て                                 | ビジネスロジックを持ち、変更の要望頻度が高い。バックエンドチームがスムーズにAPIを作成できるようになる。                                                                                                                                                                                                                                                                                                      |
| Chatbot                      | 全て                                 | AWSがAPIを公開していないため、Terraformで作成できない。                                                                                                                                                                                                                                                                                                                                                      |
| DynamoDB                     | 全て                                 | `state.lock`ファイルをテーブルとして管理する。                                                                                                                                                                                                                                                                                                                                                               |
| EC2                          | 秘密鍵                               | Terraformで作成する時にGitHubで秘密鍵を管理する必要があるため、セキュリティ上の理由で却下する。                                                                                                                                                                                                                                                                                                              |
| ENI                          | 全て                                 | 特定のAWSリソース (ALB、セキュリティグループなど) の作成に伴って、自動的に作成されるため、Terraformで管理できない。                                                                                                                                                                                                                                                                                          |
| EventBridge                  | StepFunctionsGetEventsForECSTaskRule | StepFunctionsでECS RunTaskの『ECSタスクが完了するまで待機』オプションを選択すると自動的に作成されるため、Terraformで管理できない。このルールは、ECSのECSタスクの状態がSTOPPEDになったことを検知し、StepFunctionsに通知してくれる。STOPPED は、ECSタスクが正常に停止 (完了？) した状態を表す。                                                                                                                |
| Global Accelerator           | セキュリティグループ                 | リソースを作成するとセキュリティグループが自動作成されるため、セキュリティグループのみTerraformで管理できない。                                                                                                                                                                                                                                                                                              |
| IAMユーザー                  | 全て                                 | ビジネスロジックを持ち、変更の要望頻度が高い。                                                                                                                                                                                                                                                                                                                                                               |
| IAMユーザーグループ          | 全て                                 | ビジネスロジックを持ち、変更の要望頻度が高い。                                                                                                                                                                                                                                                                                                                                                               |
| IAMロール                    | ユーザーに紐付くロール               | ビジネスロジックを持ち、変更の要望頻度が高い。                                                                                                                                                                                                                                                                                                                                                               |
|                              | サービスリンクロール                 | サービスリンクロールは自動的に作成されるが、これが行われる前に事前にTerraformで作成でき、以下のリンクにて各AWSリソースにサービスリンクロールが存在しているのか否かを確認できる。しかし、数が多く、また初回作成時のみしかエラーは起こらないため、サービスリンクロールはTerraformで作成しないようにする。<br>- https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_aws-services-that-work-with-iam.html |
| IAMポリシー                  |                                      | ビジネスロジックを持ち、変更の要望頻度が高い。ただし、IPアドレス制限ポリシーなど、自動化した方が便利になる場合はこの限りではない。                                                                                                                                                                                                                                                                           |
| RDS                          | admin以外のユーザー                  | 個別のユーザー作成のために、mysql providerを使用する必要がある。ただし、moduleディレクトリ配下に`provider.tf`ファイルを配置する必要があるため、ディレクトリ構成規約に難がある。                                                                                                                                                                                                                              |
| Route53                      | NSレコード                           | ホストゾーンを作成すると、レコードとして、NSレコード値が自動的に設定される。これは、Terraformの管理外である。                                                                                                                                                                                                                                                                                                |
| S3                           | `tfstate`ファイルの管理バケット      | ・リモートバックエンドとして`tfstate`ファイルを格納するため、Terraformのデプロイより先に存在している必要がある。<br>・Terraformで誤って削除してしまわないようにする。<br>・`terraform destroy`コマンドの実行時に、他のAWSリソースを削除する前に`tfstate`ファイルのS3バケットを先に削除してしまう。                                                                                                           |
| SES                          | 全て                                 | `terraform apply`コマンド中に承認作業が発生し、プロビジョニングが止まってしまうため。ただし、承認を自動で実行できる場合には、Terraformで管理しても良い。                                                                                                                                                                                                                                                     |
| パラメーターストア           | 全て                                 | セキュリティを含むAWSリソースでは、Terraformのリポジトリで機密な変数やファイルを管理するわけにはいかず、また`tfstate`ファイルに書き込まれてしまうため。パラメーターストアの代わりとして、キーバリュー型ストア (例：SOPS、kubesec、Hashicorp Vault) を使用しつつ、暗号化された状態でリポジトリで管理しても良い。                                                                                              |

<br>

### AWS CLIによるセットアップ例

#### ▼ S3バケット

以下のコマンドを実行し、`tfstate`ファイル用のS3バケットを作成する。

```bash
AWS_REGION="ap-northeast-1"
PREFIX=foo
ENV=prd

BUCKET_NAME=${ENV}-${PREFIX}-tfstate

if aws s3 ls | grep --silent ${BUCKET_NAME}; then
  echo "${BUCKET_NAME} already exists"
  exit 1
fi

aws s3api create-bucket \
  --region ${AWS_REGION} \
  --bucket ${BUCKET_NAME} \
  --create-bucket-configuration LocationConstraint=${AWS_REGION}

aws s3api put-public-access-block \
  --region ${AWS_REGION} \
  --bucket ${BUCKET_NAME} \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws s3api put-bucket-versioning \
  --region ${AWS_REGION} \
  --bucket ${BUCKET_NAME} \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --region ${AWS_REGION} \
  --bucket ${BUCKET_NAME} \
  --server-side-encryption-configuration '
  {
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'
```

#### ▼ DynamoDB

DynamoDBでは、`state.lock`ファイルをテーブルとして管理できる。

以下のコマンドを実行し、`state.lock`ファイル用のDynamoDBを作成する。

```bash
AWS_REGION="ap-northeast-1"
PREFIX=foo
ENV=prd
TABLE_NAME=${ENV}-${PREFIX}-state-lock

aws dynamodb create-table\
  --region ${AWS_REGION} \
  --table-name ${TABLE_NAME} \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1
```

![dymanodb_terraform_state-lock.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dymanodb_terraform_state-lock.png)

> - https://blog-benri-life.com/terraform-state-lock-s3/

<br>

### `tfstate`ファイルに関連するAWSリソースをTerraformで管理する

#### ▼ S3バケットの場合

`tfstate`ファイルを管理するS3バケットをTerraformで管理しないプラクティスが一般的ではあるが、実はTerraformで管理する裏技がある。

それは、`tfstate`ファイルのS3バケットのみを、別のローカルバックエンドの`tfsftate`ファイルで管理する方法である。

このローカルバックエンドの`tfstate`ファイルが管理するS3バケットをリモートバックエンドとして、メインの`tfstate`ファイルを配置する。

もちろん、ローカルバックエンドの`tfstate`ファイルがS3バケットに配置されたメインの`tfstate`ファイルを検知しないように、無視する必要がある。

```terraform
terraform {
  backend "local" {}

  required_version = "1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
}
```

```terraform
resource "aws_s3_bucket" "tfstate" {
  bucket = "tfstate-bucket"
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.tfstate.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_kms_key" "tfstate" {
}
```

#### ▼ DynamoDBの場合

`state.lock`ファイルを管理するDynamoDBをTerraformで管理しないプラクティスが一般的ではあるが、実はTerraformで管理する裏技がある。

```terraform
resource "aws_dynamodb_table" "tfstate" {
  name         = "tfstate-lock-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}
```

<br>

## 23. 複数のAWSリソースに共通のプラクティス

### 環境変数

#### ▼ AZに関するマップ型データ

AZのデータ自体をマップ型データで用意しておく。

また、AZごとに異なる値を設定できるように、その他のデータではAZ名をキー名としたマップデータを定義しておく。

```terraform
availability_zones = { a = "a", c = "c" }

# ---------------------------------------------
# RDS
# ---------------------------------------------
rds_instance_class             = { a = "db.r6g.xlarge", c = "db.r6g.xlarge" }

# ---------------------------------------------
# VPC
# ---------------------------------------------
vpc_cidr                           = "*.*.*.*/23"
vpc_subnet_private_datastore_cidrs = { a = "*.*.*.*/27", c = "*.*.*.*/27" }
vpc_subnet_private_app_cidrs       = { a = "*.*.*.*/25", c = "*.*.*.*/25" }
vpc_subnet_public_cidrs            = { a = "*.*.*.*/27", c = "*.*.*.*/27" }
```

<br>

### 削除保護機能のあるAWSリソース

削除保護設定のあるAWSリソースに癖がある。

削除保護の無効化と`resource`ブロックの削除を同時にデプロイしないようにする。

もし同時に行った場合、削除処理を先に実行するが、削除は保護されたままなため、エラーになってしまう。

エラーになってしまう。

そのため、このAWSリソースを削除する時は、以下の通り`2`個の段階に分けてデプロイする。

`(1)`

: 削除保護を無効化 (`false`) に変更し、デプロイする。

`(2)`

: コードを削除し、デプロイする。

もし、これを忘れてしまった場合は、画面上で削除処理を無効化し、削除処理を実行可能にする。

| AWSリソース名 | Terraform上での設定名        |
| ------------- | ---------------------------- |
| ALB           | `enable_deletion_protection` |
| EC2           | `disable_api_termination`    |
| RDS           | `deletion_protection`        |

<br>
