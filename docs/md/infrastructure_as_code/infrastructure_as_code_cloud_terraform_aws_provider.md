# AWSプロバイダー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/

<br>

## 01. ACM

### 証明書のリクエスト

**＊実装例＊**

Eメール検証の場合を示す。

```elixir
###############################################
# For www domain
###############################################
resource "aws_acm_certificate" "www_an1" {
  domain_name               = var.route53_domain_www
  subject_alternative_names = ["*.${var.route53_domain_www}"]
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


```elixir
###############################################
# For www domain
###############################################
resource "aws_acm_certificate" "www_an1" {
  domain_name               = var.route53_domain_www
  subject_alternative_names = ["*.${var.route53_domain_www}"]
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

```elixir
###############################################
# For www domain
###############################################
# 後述の説明を参考にせよ。（１）
resource "aws_acm_certificate_validation" "www_an1" {
  certificate_arn = aws_acm_certificate.www_an1.arn
}
```

**＊実装例＊**

DNS検証の場合を示す。

```elixir
###############################################
# For www domain
###############################################
# 後述の説明を参考にせよ。（２）
resource "aws_acm_certificate_validation" "www_an1" {
  certificate_arn         = aws_acm_certificate.www_an1.arn
  validation_record_fqdns = [for record in var.www_an1_route53_record : record.fqdn]
}
```

#### （１）AWS以外でドメインを購入した場合は注意

AWS以外でドメインを購入した場合はAWS以外で作業になる。証明書のDNS検証時に、ドメインを購入したサービスが管理するドメインレジストラに、Route53のNSレコード値を登録する。

#### （２）検証のためにメール再送が必要

証明書のEメール検証時に、ドメインの所有者にメールが送信されないことがある。送信されなかった場合は、メールの再送を実行する。

#### ※ 証明書の検証方法を変更する

もしコンソール画面から証明書の検証方法を変更する場合、検証方法の異なる証明書を構築してこれに切り替えたうえで、古い証明書を削除する必要がある。これに合わせて、Terraformでもリリースを二回に分ける。

参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/switch-acm-certificate/

<br>

## 02. AMI

### まとめ

**＊実装例＊**

```elixir
###############################################
# For bastion
###############################################
data "aws_ami" "bastion" {
  # 後述の説明を参考にせよ。（１）
  most_recent = false
  
  # 後述の説明を参考にせよ。（１）
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
```

<br>

### （１）取得するAMIのバージョンを固定

取得するAMIが常に最新になっていると、EC2が再構築されなねない。そこで、特定のAMIを取得できるようにしておく。```most_recent```は無効化しておき、特定のAMIをフィルタリングする。

<br>

## 03. API Gateway

### まとめ

**＊実装例＊**

```elixir
###############################################
# REST API
###############################################
resource "aws_api_gateway_rest_api" "foo" {
  name        = "prd-foo-api-for-foo"
  description = "The API that enables two-way communication with prd-foo"
  
  # VPCリンクのプロキシ統合のAPIを定義したOpenAPI仕様
  # 後述の説明を参考にせよ。（１）
  body = templatefile(
    "${path.module}/open_api.yaml",
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

###############################################
# Deployment
###############################################
resource "aws_api_gateway_deployment" "foo" {
  rest_api_id = aws_api_gateway_rest_api.foo.id

  # 後述の説明を参考にせよ。（１）
  triggers = {
    redeployment = sha1(aws_api_gateway_rest_api.foo.body)
  }

  lifecycle {
    create_before_destroy = true
  }
}

###############################################
# Stage
###############################################
resource "aws_api_gateway_stage" "foo" {
  deployment_id = aws_api_gateway_deployment.foo.id
  rest_api_id   = aws_api_gateway_rest_api.foo.id
  stage_name    = var.environment
}
```

<br>

### （１）OpenAPI仕様のインポートと差分認識

あらかじめ用意したOpenAPI仕様のYAMLファイルを```body```オプションのパラメータとし、これをインポートすることにより、APIを定義できる。YAMLファイルに変数を渡すこともできる。APIの再デプロイのトリガーとして、```redeployment```パラメータに```body```パラメータのハッシュ値を渡すようにする。これにより、インポート元のYAMLファイルに差分があった場合、Terraformが```redeployment```パラメータの値の変化を認識できるようになり、再デプロイを実行できる。

<br>

### （＊）ステージ名を取得する方法はない

API Gatewayのステージ名を参照するためには、resourceを用いる必要があり、dataではこれを取得できない。もしステージをコンソール画面上から構築している場合、ステージのARNを参照できないため、ARNを自力で作る必要がある。API Gatewayの各ARNについては、以下を参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/arn-format-reference.html

**＊実装例＊**

WAFにAPI Gatewayを紐付けるために、ステージのARNが必要である。これは自力で作る。

```elixir
###############################################
# Web ACL Association
###############################################
resource "aws_wafv2_web_acl_association" "api_gateway" {
  resource_arn = "${var.api_gateway_rest_arn}/stages/prd"
  web_acl_arn  = aws_wafv2_web_acl.api_gateway.arn
}
```



<br>

## 04. CloudFront

### まとめ

**＊実装例＊**

```elixir
resource "aws_cloudfront_distribution" "this" {

  price_class      = "PriceClass_200"
  web_acl_id       = var.cloudfront_wafv2_web_acl_arn
  aliases          = [var.route53_domain_foo]
  comment          = "prd-foo-cf-distribution"
  enabled          = true
  
  # 後述の説明を参考にせよ。（１）
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
  
  # ～ 中略 ～
  
}
```

<br>

### （１）削除保持機能

Terraformでは、```retain_on_delete```で設定できる。固有の設定で、AWSに対応するものは無い。

<br>

### originブロック

Origins画面に設定するオリジンを定義する。

**＊実装例＊**

```elixir
resource "aws_cloudfront_distribution" "this" {

  # ～ 中略 ～  

  # オリジン（ここではS3としている）
  origin {
    domain_name = var.s3_bucket_regional_domain_name
    origin_id   = "S3-${var.s3_bucket_id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.s3_foo.cloudfront_access_identity_path
    }
  }
  
  # ～ 中略 ～  
  
}
```

```elixir
resource "aws_cloudfront_distribution" "this" {

  # ～ 中略 ～  

  # オリジン（ここではALBとしている）
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
  
  # ～ 中略 ～
}
```

<br>

### ordered_cache_behaviorブロック

Behavior画面に設定するオリジンにルーティングするパスを定義する。

**＊実装例＊**

```elixir
resource "aws_cloudfront_distribution" "this" {

  # ～ 中略 ～

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

  # ～ 中略 ～
  
}
```

<br>

### default_cache_behavior

Behavior画面に設定するオリジンにルーティングする標準パスを定義する。

**＊実装例＊**

```elixir
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
  
  # ～ 中略 ～
  
}
```

<br>

## 05. ECR

### ライフサイクルポリシー

ECRにアタッチされる、イメージの有効期間を定義するポリシー。コンソール画面から入力できるため、基本的にポリシーの実装は不要であるが、TerraformなどのIaCツールでは必要になる。

```bash
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images untagged",
      "selection": {
        "tagStatus": "untagged",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 2,
      "description": "Keep last 10 images any",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
```

<br>

## 06. ECS

### まとめ

**＊実装例＊**

```elixir
###############################################
# ECS Service
###############################################
resource "aws_ecs_service" "this" {
  name                               = "prd-foo-ecs-service"
  cluster                            = aws_ecs_cluster.this.id
  launch_type                        = "FARGATE"
  platform_version                   = "1.4.0"
  desired_count                      = var.ecs_service_desired_count
  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  # 後述の説明を参考にせよ。（１）
  health_check_grace_period_seconds = 330

  # 後述の説明を参考にせよ。（２）
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
    # 後述の説明を参考にせよ。（３）
    var.alb_listener_https,
    var.nlb_listener
  ]

  lifecycle {
    ignore_changes = [
      # ※後述の説明を参考にせよ（４）
      desired_count,
    ]
  }
}
```

<br>

### （１）ヘルスチェック猶予期間

タスクの起動が完了する前にサービスがロードバランサ－のヘルスチェックを検証し、Unhealthyと誤認してしまうため、タスクの起動完了を待機する。例えば、ロードバランサ－が30秒間隔でヘルスチェックを実行する場合は、30秒単位で待機時間を増やし、適切な待機時間を見つけるようにする。

<br>

### （２）実インフラのリビジョン番号の追跡

アプリケーションのデプロイによって、実インフラのタスク定義のリビジョン番号が増加するため、これを追跡できるようにする。

参考：https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ecs_task_definition

<br>

### （３）ALB/NLBリスナーの構築を待機

Teraformは、特に依存関係を実装しない場合、『ターゲットグループ → ALB/NLB → リスナー』の順でリソースを構築する。問題として、ALB/NLBやリスナーの構築が終わる前に、ECSサービスの構築が始まってしまう。ALB/NLBの構築（※リスナーも含む可能性）が完全に完了しない状態では、ターゲットグループはECSサービスに紐付けらず、これが完了する前にECSサービスがターゲットグループを参照しようとするため、エラーになる。リスナーの後にECSサービスを構築するようにし、『ターゲットグループ → ALB/NLB → リスナー → ECSサービス』の順でリソースを構築できるようにする。

参考：https://github.com/hashicorp/terraform/issues/12634#issuecomment-313215022

<br>

### （４）AutoScalingによるタスク数の増減を無視

AutoScalingによって、タスク数が増減するため、これを無視する。

<br>

### （＊）タスク定義の更新

Terraformでタスク定義を更新すると、現在動いているECSで稼働しているタスクはそのままに、新しいリビジョン番号のタスク定義が作成される。コンソール画面の『新しいリビジョンの作成』と同じ挙動である。実際にタスクが増えていることは、サービスに紐付くタスク定義一覧から確認できる。次のデプロイ時に、このタスクが用いられる。

<br>

### （＊）サービスのデプロイの削除時間

ECSサービスの削除には『ドレイニング』の時間が発生する。約2分30秒かかるため、気長に待つこと。

<br>

### （＊）ローリングアップデート

applyで、新しいリビジョン番号のタスク定義を作成すると、これを用いてローリングアップデートが自動で実行されることに注意する。ただ、ローリングアップデートの仕組み上、新しいタスクのヘルスチェックが失敗すれば、既存のタスクは停止せずにそのまま稼働するため、安心ではあるが。

<br>

### （＊）ECSコンテナ名

コンテナ名は、役割名（app、web、monitering、など）ではなく、ベンダー名（laravel、nginx、datadog、など）とする。ただ、AWS FireLensコンテナはlog_routerとしなければならない仕様であり、ベンダー名を使用できない場合は役割名になることを許容する。

## 07. EC2

### まとめ

**＊実装例＊**

```elixir
###############################################
# For bastion
###############################################
resource "aws_instance" "bastion" {
  ami                         = "*****"
  instance_type               = "t2.micro"
  vpc_security_group_ids      = ["*****"]
  subnet_id                   = "*****"
  associate_public_ip_address = true

  # ※後述の説明を参考にせよ（１）
  key_name = "prd-foo-bastion"

  disable_api_termination = true

  tags = {
    Name = "prd-foo-bastion"
  }

  # ※後述の説明を参考にせよ（２）
  depends_on = [var.internet_gateway]
}
```

<br>

### （１）キーペアはコンソール上で設定

誤って削除しないように、またソースコードに機密情報をハードコーディングしないように、キーペアはコンソール画面で作成した後、```key_name```でキー名を指定するようにする。

<br>

### （２）インターネットゲートウェイの後に構築

インターネットゲートウェイの後にEC2を構築できるようにする。

参考：https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/internet_gateway#argument-reference

<br>

## 08. IAMユーザー

### カスタマー管理ポリシーを持つロール

事前に、tpl形式のカスタマー管理ポリシーを定義しておく。構築済みのIAMロールに、```aws_iam_policy```リソースを用いて、AWS管理ポリシーをIAMユーザーにアタッチする。

**＊実装例＊**

ローカルからAWS CLIコマンドを実行する必要がある場合、コマンドを特定の送信元IPアドレスを特定のものに限定する。事前に、list型でIPアドレスを定義する。

```elixir
###############################################
# IP addresses
###############################################
global_ip_addresses = [
  "nn.nnn.nnn.nnn/32",
  "nn.nnn.nnn.nnn/32"
]
```

また事前に、指定した送信元IPアドレス以外を拒否するカスタマー管理ポリシーを定義する。

```bash
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


コンソール画面で作成済みのIAMユーザーの名前を取得する。tpl形式のポリシーにlist型の値を渡す時、```jsonencode```関数を用いる必要がある。

```elixir
###############################################
# For IAM User
###############################################
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

IAMユーザーにAWS管理ポリシーをアタッチする。

**＊実装例＊**

```elixir
###############################################
# For IAM User
###############################################
resource "aws_iam_user_policy_attachment" "aws_cli_command_executor_s3_read_only_access" {
  user       = data.aws_iam_user.aws_cli_command_executor.user_name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}
```

<br>

## 09. IAMロール

### 信頼ポリシーを持つロール

コンソール画面でロールを作成する場合は意識することはないが、特定のリソースにロールをアタッチするためには、ロールに信頼ポリシーを組み込む必要がある。事前に、tpl形式の信頼ポリシーを定義しておく。```aws_iam_role```リソースを用いて、IAMロールを構築すると同時に、これに信頼ポリシーをアタッチする。

**＊実装例＊**

事前に、ECSタスクのための信頼ポリシーを定義する。

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

ECSタスクロールとECSタスク実行ロールに信頼ポリシーアタッチする。

```elixir
###############################################
# IAM Role For ECS Task Execution
###############################################
resource "aws_iam_role" "ecs_task_execution" {
  name        = "prd-foo-ecs-task-execution-role"
  description = "The role for prd-foo-ecs-task"
  assume_role_policy = templatefile(
    "${path.module}/policies/trust_policies/ecs_task_policy.tpl",
    {}
  )
}

###############################################
# IAM Role For ECS Task
###############################################
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

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com",
          "edgelambda.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Lambda実行ロールに信頼ポリシーアタッチする。

```elixir
###############################################
# IAM Role For Lambda@Edge
###############################################

# ロールに信頼ポリシーをアタッチします。
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

事前に、tpl形式のインラインポリシーを定義しておく。```aws_iam_role_policy```リソースを用いて、インラインポリシーを構築すると同時に、これにインラインポリシーをアタッチする。

**＊実装例＊**

事前に、ECSタスクに必要最低限の権限を与えるインラインポリシーを定義する。

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameters"
      ],
      "Resource": "*"
    }
  ]
}
```

ECSタスクロールとECSタスク実行ロールにインラインポリシーアタッチする。

```elixir
###############################################
# IAM Role For ECS Task
###############################################
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

事前に、tpl形式のAWS管理ポリシーを定義しておく。```aws_iam_role_policy_attachment```リソースを用いて、実インフラにあるAWS管理ポリシーを構築済みのIAMロールにアタッチする。ポリシーのARNは、AWSのコンソール画面を確認する。

**＊実装例＊**

```elixir
###############################################
# IAM Role For ECS Task Execution
###############################################
resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
```

<br>

### カスタマー管理ポリシーを持つロール

事前に、tpl形式のインラインポリシーを定義しておく。```aws_iam_role_policy```リソースを用いて、カスタマー管理ポリシーを構築する。```aws_iam_role_policy_attachment```リソースを用いて、カスタマー管理ポリシーを構築済みのIAMロールにアタッチする。

**＊実装例＊**

事前に、ECSタスクに必要最低限の権限を与えるカスタマー管理ポリシーを定義する。

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:*:*:*"
      ]
    }
  ]
}
```

ECSタスクロールにカスタマー管理ポリシーアタッチする。

```elixir
###############################################
# IAM Role For ECS Task
###############################################
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

サービスリンクロールは、AWSリソースの構築時に自動的に作成され、アタッチされる。そのため、Terraformの管理外である。```aws_iam_service_linked_role```リソースを用いて、手動で構築できるが、数が多く実装の負担にもなるため、あえて管理外としても問題ない。

**＊実装例＊**

サービス名を指定して、Application Auto Scalingのサービスリンクロールを構築する。

```elixir
###############################################
# IAM Role For ECS Service
###############################################
# Service Linked Role
resource "aws_iam_service_linked_role" "ecs_service_auto_scaling" {
  aws_service_name = "ecs.application-autoscaling.amazonaws.com"
}
```

```elixir
###############################################
# Output IAM Role
###############################################
output "ecs_service_auto_scaling_iam_service_linked_role_arn" {
  value = aws_iam_service_linked_role.ecs_service_auto_scaling.arn
}
```

Application Auto Scalingにサービスリンクロールをアタッチする。手動で設定することも可能であるが、Terraformの管理外で自動的にアタッチされるため、あえて妥協しても良い。

```elixir
#########################################
# Application Auto Scaling For ECS
#########################################
resource "aws_appautoscaling_target" "ecs" {
  service_namespace  = "ecs"
  resource_id        = "service/prd-foo-ecs-cluster/prd-foo-ecs-service"
  scalable_dimension = "ecs:service:DesiredCount"
  max_capacity       = 4
  min_capacity       = 2
  
  # この設定がなくとも、サービスリンクロールが自動的に構築され、AutoScalingにアタッチされる。
  role_arn           = var.ecs_service_auto_scaling_iam_service_linked_role_arn
}
```

<br>

## 10. LBリスナーとターゲットグループ

### まとめ

**＊実装例＊**

```elixir
###############################################
# NLB target group
###############################################
resource "aws_lb_target_group" "this" {
  name                 = "prd-foo-nlb-tg"
  port                 = 80
  protocol             = "TCP"
  vpc_id               = "*****"
  deregistration_delay = "60"
  target_type          = "ip"

  # ※後述の説明を参考にせよ（１）
  slow_start = "0"

  # ※後述の説明を参考にせよ（２）
  health_check {
    protocol          = "HTTP"
    healthy_threshold = 3
    path              = "/healthcheck"
  }

  # stickiness ※後述の説明を参考にせよ（３）
  # https://registry.terraform.io/providers/hashicorp/aws/3.16.0/docs/resources/lb_target_group#stickiness

  lifecycle {
    create_before_destroy = false
  }
}
```

<br>

### （１）NLBはスロースタートに非対応

NLBに紐付くターゲットグループはスロースタートに非対応のため、これを明示的に無効化する必要がある。

<br>

### （２）NLBヘルスチェックには設定可能な項目が少ない

ターゲットグループの転送プロトコルがTCPの場合は、設定できないヘルスチェックオプションがいくつかある。ヘルスチェックプロトコルがHTTPまたはHTTPSの時のみ、パスを設定できる。

参考：https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_target_group#health_check

<br>

### （３）NLBスティッキーネスは明示的に無効化

スティッキネス機能を無効化する場合、AWSプロバイダーのアップグレード時に問題が起こらないように、このブロックを実装しないようにする。リンク先のNOTE文を参考にせよ。

参考：https://registry.terraform.io/providers/hashicorp/aws/3.16.0/docs/resources/lb_target_group#stickiness

<br>

### （＊）ターゲットグループの削除時にリスナーを先に削除できない。

LBリスナーがターゲットグループに依存しているが、Terraformがターゲットグループの削除時にリスナーを先に削除しようとしないため、以下のようなエラーが発生する。

```bash
Error deleting Target Group: ResourceInUse: Target group 'arn:aws:elasticloadbalancing:ap-northeast-1:123456789:targetgroup/*****-tg/*****' is currently in use by a listener or a rule
	status code: 400, request id: *****
```

このエラーが発生した場合、コンソール画面上でLBリスナーを削除したうえで、もう一度applyする。

参考：https://github.com/hashicorp/terraform-provider-aws/issues/1315#issuecomment-415423529

<br>

## 11. RDS（Aurora MySQLの場合）

### まとめ

**＊実装例＊**

```elixir
#########################################
# RDS Cluster
#########################################
resource "aws_rds_cluster" "this" {
  engine                          = "aurora-mysql"
  engine_version                  = "5.7.mysql_aurora.2.08.3"
  cluster_identifier              = "prd-foo-rds-cluster"
  
  # 後述の説明を参考にせよ。（１）
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
  
  # 後述の説明を参考にせよ。（２）
  apply_immediately = true

  # 後述の説明を参考にせよ。（３）
  availability_zones = ["${var.region}${var.vpc_availability_zones.a}", "${var.region}${var.vpc_availability_zones.c}"]

  deletion_protection = true

  lifecycle {
    ignore_changes = [
      # 後述の説明を参考にせよ。（４）
      availability_zones,
      # 後述の説明を参考にせよ。（５）
      engine_version
    ]
  }
}

###############################################
# RDS Cluster Instance
###############################################
resource "aws_rds_cluster_instance" "this" {
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
  
  # 後述の説明を参考にせよ。（６）
  instance_class = var.rds_instance_class[each.key]

  # 後述の説明を参考にせよ。（７）
  # preferred_backup_window
}
```

<br>

### （１）SSMパラメータストア

Terraformに値をハードコーディングしたくない場合は、SSMパラメータストアで値を管理し、これをデータリソースで取得するようにする。

<br>

### （２）メンテナンスウインドウ時に変更適用

メンテナンスウインドウ時の変更適用をTerraformで行う場合、一段階目に```apply_immediately```オプションを```false```に変更してapplyし、二段階目に修正をapplyする。

<br>

### （３）DBクラスターにはAZが3つ必要

DBクラスターでは、レプリケーションのために、3つのAZが必要である。そのため、指定したAZが2つであっても、コンソール画面上で3つのAZが自動的に設定される。Terraformがこれを認識しないように、```ignore_changes```でAZを指定しておく必要がある。

参考：

- https://github.com/hashicorp/terraform-provider-aws/issues/7307#issuecomment-457441633
- https://github.com/hashicorp/terraform-provider-aws/issues/1111

<br>

### （４）インスタンスを配置するAZは選べない

事前にインスタンスにAZを表す識別子を入れたとしても、Terraformはインスタンスを配置するAZを選べない。そのため、AZと識別子の関係が逆になってしまうことがある。多くの場合、 Cゾーンのインスタンスが最初に構築されるため、インスタンスのゾーン名と配置されるA/Cゾーンが逆になる。その場合は、デプロイ後に手動で名前を変更すればよい。この変更は、Terraformが差分として認識しないので問題ない。

<br>

### （５）エンジンバージョンのアップグレードは画面から

運用でTerraformでエンジンバージョンをアップグレードすることに抵抗感がある場合、コンソール画面からアップグレードをTerraformで無視するようにするとよい。ただし、画面からの変更後にTerraformのソースコードも変更しておく必要がある。Terraformを書き換えなくとも問題は起こらないが、Terraformのソースコードと実インフラが乖離してしまう。

<br>

### （６）インスタンスタイプは別々に設定する

インスタンスタイプに```each```で値を渡さない場合、各DBインスタンスのインスタンスタイプを同時に変更することになる。この場合、インスタンスのフェイルオーバーを使用できず、ダウンタイムを最小化できない。そのため、```each```を用いて、DBインスタンスごとにインスタンスタイプを設定するようにする。インスタンスごとに異なるインスタンスタイプを設定する場合は、```each```で割り当てる値の順番を考慮する必要があるため、配置されているAZを事前に確認する必要がある。

<br>

### （７）インスタンスにバックアップウインドウは設定しない

DBクラスターとDBインスタンスの両方に、```preferred_backup_window```を設定できるが、RDSインスタンスに設定してはいけない。

<br>

## 12. Route53

### まとめ

**＊実装例＊**

```elixir
###############################################
# For foo domain
###############################################
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

<br>

## 13. Route Table

### メインルートテーブルは自動構築

Terraformを用いてVPCを構築した時、メインルートテーブルが自動的に構築される。そのため、これはTerraformの管理外である。

<br>

## 14. S3

### バケットポリシー

S3アタッチされる、自身へのアクセスを制御するためにインラインポリシーのこと。定義したバケットポリシーは、```aws_s3_bucket_policy```でロールにアタッチできる。

<br>

### ALBアクセスログ

ALBがバケットにログを書き込めるように、『ELBのサービスアカウントID』を許可する必要がある。

**＊実装例＊**

```elixir
###############################################
# S3 bucket policy
###############################################

# S3にバケットポリシーをアタッチします。
resource "aws_s3_bucket_policy" "alb" {
  bucket = aws_s3_bucket.alb_logs.id
  policy = templatefile(
    "${path.module}/policies/alb_bucket_policy.tpl",
    {}
  )
}
```

ALBのアクセスログを送信するバケット内には、自動的に『/AWSLogs/<アカウントID>』の名前でディレクトリが生成される。そのため、『```arn:aws:s3:::<バケット名>/*```』の部分を最小権限として、『```arn:aws:s3:::<バケット名>/AWSLogs/<アカウントID>/;*```』にしてもよい。東京リージョンのELBサービスアカウントIDは、『582318560864』である。

参考：https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/load-balancer-access-logs.html#access-logging-bucket-permissions

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::582318560864:root"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::<バケット名>/*"
    }
  ]
}
```

<br>

### NLBアクセスログ

ALBがバケットにログを書き込めるように、『```delivery.logs.amazonaws.com```』からのアクセスを許可する必要がある。

**＊実装例＊**

```elixir
###############################################
# S3 bucket policy
###############################################

# S3にバケットポリシーをアタッチします。
resource "aws_s3_bucket_policy" "nlb" {
  bucket = aws_s3_bucket.nlb_logs.id
  policy = templatefile(
    "${path.module}/policies/nlb_bucket_policy.tpl",
    {}
  )
}
```

NLBのアクセスログを送信するバケット内には、自動的に『/AWSLogs/<アカウントID>』の名前でディレクトリが生成される。そのため、『```arn:aws:s3:::<バケット名>/*```』の部分を最小権限として、『```arn:aws:s3:::<バケット名>/AWSLogs/<アカウントID>/;*```』にしてもよい。

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AWSLogDeliveryWrite",
      "Effect": "Allow",
      "Principal": {
        "Service": "delivery.logs.amazonaws.com"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::<バケット名>/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-acl": "bucket-owner-full-control"
        }
      }
    },
    {
      "Sid": "AWSLogDeliveryAclCheck",
      "Effect": "Allow",
      "Principal": {
        "Service": "delivery.logs.amazonaws.com"
      },
      "Action": "s3:GetBucketAcl",
      "Resource": "arn:aws:s3:::<バケット名>"
    }
  ]
}
```

<br>

## 15. SM

### まとめ

```elixir
###############################################
# For RDS
###############################################
output "rds_db_name_ssm_parameter_value" {
  sensitive = true # 後述の説明を参考にせよ。（１）
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

### （１）```plan```コマンド時に非表示

CIの```plan```コマンド時に値が公開されないように```output```で```sensitive```オプションを有効化する。

<br>

## 16. WAF

### ruleブロック

**＊実装例＊**

API Gateway用のWAFに、特定のユーザーエージェントを拒否するルールを設定する。

```elixir
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
  
  # ～ 中略 ～  
  
}  
```

**＊実装例＊**

API Gateway用のWAFに、特定のグローバルIPアドレスを拒否するルールを設定する。

```elixir
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
  
  # ～ 中略 ～
  
}  
```

**＊実装例＊**

API Gateway用のWAFに、SQLインジェクションを拒否するマネージドルールを設定する。

```elixir
resource "aws_wafv2_web_acl" "api_gateway" {

  rule {
    name     = "block-sql-injection"
    priority = 0

    statement {

      # マネージドルールを用いる。
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
  
  # ～ 中略 ～
  
}
```

**＊実装例＊**

ALB用のWAFに、APIキーまたはBearerトークンをOR条件ルールを設定する。あくまで例としてで、本来であれば、別々のルールとした方が良い。

```elixir
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
  
  # ～ 中略 ～  
  
}  
```

<br>

### IPセットの依存関係

WAFのIPセットと他設定の依存関係に癖がある。新しいIPセットへの付け換えと古いIPセットの削除を同時にデプロイしないようにする。もし同時に行った場合、Terraformは古いIPセットの削除処理を先に実行するが、これはWAFに紐付いているため、ここでエラーが起こってしまう。そのため、IPセットを新しく設定し直す場合は、以下の通り二つの段階に分けてデプロイするようにする。ちなみに、IPセットの名前を変更する場合は、更新処理ではなく削除を伴う再構築処理が実行されるため注意する。

1. 新しいIPセットのresourceを実装し、ACLに紐付け、デプロイする。
2. 古いIPセットのresourceを削除し、デプロイする。

もし、これを忘れてしまった場合は、画面上で適当なIPセットに付け換えて、削除処理を実行できるようにする。

<br>

## 17. Terraform管理外のAWSリソース

### 判断基準

以下の理由で、一部のAWSリソースではTerraformを用いない方が良い。

- ビジネスロジックを持つAWSリソースでは、継続的な改善のサイクルが早い（変更の要望頻度が高い）ため、リリースまでに時間がかかるTerraformで管理すると、このサイクルを阻害してしまう：（API Gateway、IAMユーザー/グループ、IAMユーザー/グループに関連するロール/ポリシー、など）
- セキュリティを含むAWSリソースでは、Terraformのリポジトリで機密な値を管理するわけにはいかない：（EC2の秘密鍵、SSMパラメータストア、など）
- Terraformによる初期構築時に必要であり、それがないとそもそもapplyできない：（Terraform用IAMユーザー、tfstateを管理するS3バケット、など）
- Terraformの誤操作で削除してはいけないAWSリソースでは、Terraformで管理しないことで削除を防げる：（tfstateを管理するS3バケットなど）
- Terraformで特定のAWSリソースを構築すると、それに伴って自動で構築されてしまう：（ENIなど）
- そもそもAWSがAPIを公開していないことが理由で、Terraformで実装できない：（Chatbotなど）

<br>

### 詳細

また、AWSの仕様上の理由で、管理外になってしまうものもある。Terraformの管理外のリソースには、コンソール画面上から、『```Not managed by = Terraform```』というタグをつけた方が良い。

| AWSリソース                  | 管理外の部分                         | 管理外の理由                                                 |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| API Gateway、紐付くVPCリンク | 全て                                 | ビジネスロジックを持ち、変更の要望頻度が高い。バックエンドチームがスムーズにAPIを構築できるようになる。 |
| Chatbot                      | 全て                                 | AWSがAPIを公開していないため、Terraformで構築できない。      |
| EC2                          | 秘密鍵                               | Terraformで構築する時にGitHubで秘密鍵を管理する必要があるため、セキュリティ上の理由で却下する。 |
| EventBridge                  | StepFunctionsGetEventsForECSTaskRule | StepFunctionsでECS RunTaskの『タスクが完了するまで待機』オプションを選択すると自動で構築されるため、Terraformで管理できない。このルールは、ECSのタスクの状態がSTOPPEDになったことを検知し、StepFunctionsに通知してくれる。STOPPED は、ECSタスクが正常に停止（完了？）した状態を表す。 |
| Global Accelerator           | セキュリティグループ                 | リソースを構築するとセキュリティグループが自動生成されるため、セキュリティグループのみTerraformで管理できない。 |
| IAMユーザー                    | 全て                                 | ビジネスロジックを持ち、変更の要望頻度が高い。               |
| IAMユーザーグループ            | 全て                                 | ビジネスロジックを持ち、変更の要望頻度が高い。               |
| IAMロール                    | ユーザーに紐付くロール                 | ビジネスロジックを持ち、変更の要望頻度が高い。               |
|                              | サービスリンクロール                 | サービスリンクロールは自動的に構築されるが、これが行われる前に事前にTerraformで構築することが可能であり、以下のリンクにて各AWSリソースにサービスリンクロールが存在しているのか否かを確認できる。しかし、数が多く、また初回構築時のみしかエラーは起こらないため、サービスリンクロールはTerraformで作成しないようにする。<br>参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_aws-services-that-work-with-iam.html |
| IAMポリシー                  |                                      | ビジネスロジックを持ち、変更の要望頻度が高い。ただし、IPアドレス制限ポリシーなど、自動化した方が便利になる場合はこの限りではない。 |
| ENI                          | 全て                                 | 特定のAWSリソース（ALB、セキュリティグループなど）の構築に伴って、自動的に構築されるため、Terraformで管理できない。 |
| RDS                          | admin以外のユーザー                    | 個別のユーザー作成のために、mysql providerという機能を用いる必要がある。ただ、moduleディレクトリ以下に```provider.tf```ファイルを配置する必要があるため、ディレクトリ構造に難がある。 |
| Route53                      | NSレコード                           | ホストゾーンを作成すると、レコードとして、NSレコード値が自動的に設定される。これは、Terraformの管理外である。 |
| S3                           | tfstateの管理バケット                | tfstateファイルを格納するため、Terraformのデプロイより先に存在している必要がある。また、Terraformで誤って削除してしまわないようにする。 |
| SSMパラメータストア          | 全て                                 | AWSリソースで使用する機密な環境変数を出力するため。          |

<br>

## 18. 複数のAWSリソースに共通のTips

### 削除保護機能のあるAWSリソース

削除保護設定のあるAWSリソースに癖がある。削除保護の無効化とリソースを削除を同時にデプロイしないようにする。もし同時に行った場合、削除処理を先に実行するが、削除は保護されたままなので、エラーになる。エラーになる。そのため、このAWSリソースを削除する時は、以下の通り二つの段階に分けてデプロイするようにする。

1. 削除保護を無効化（`false`）に変更し、デプロイする。
2. ソースコードを削除し、デプロイする。

もし、これを忘れてしまった場合は、画面上で削除処理を無効化し、削除処理を実行できるようにする。

| AWSリソース名 | Terraform上での設定名            |
| ------------- | -------------------------------- |
| ALB           | ```enable_deletion_protection``` |
| EC2           | ```disable_api_termination```    |
| RDS           | ```deletion_protection```        |
