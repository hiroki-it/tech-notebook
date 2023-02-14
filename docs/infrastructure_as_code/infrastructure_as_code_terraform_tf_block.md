---
title: 【IT技術の知見】ブロック＠Terraform
description: ブロック＠Terraformの知見を記録しています。
---

# ブロック＠Terraform

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. ```resource```ブロック

### ```resource```ブロックとは

ルートモジュール/チャイルドモジュールにて、クラウドプロバイダーのAPIに対してリクエストを送信し、クラウドインフラを作成する。



<br>

### ```resource```タイプ

操作されるリソースの種類のこと。

リソースとTerraformの```resource```タイプはおおよそ一致している。



> ↪️ 参考：https://docs.aws.amazon.com/config/latest/developerguide/resource-config-reference.html

<br>

### ```resource```ブロックの実装方法

#### ▼ AWSの場合

**＊実装例＊**

```terraform
# ---------------------------------------------
# Resource ALB
# ---------------------------------------------
resource "aws_lb" "this" {
  name               = "prd-foo-alb"
  load_balancer_type = "application"
  security_groups    = ["*****"]
  subnets            = ["*****","*****"]
}
```

<br>

## 02. ```data```ブロック

### ```data```ブロックとは

クラウドプロバイダーのAPIに対してリクエストを送信し、クラウドインフラに関するデータを取得する。



<br>

### ```data```ブロックの実装方法

#### ▼ AWSの場合

**＊実装例＊**

例として、ECSタスク定義名を指定して、AWSから

```terraform
# ---------------------------------------------
# Data ECS task definition
# ---------------------------------------------
data "aws_ecs_task_definition" "this" {
  task_definition = "prd-foo-ecs-task-definition"
}
```

**＊実装例＊**

例として、AMIを検索した上で、AWSから特定のAMIの値を取得する。



```terraform
# ---------------------------------------------
# Data AMI
# ---------------------------------------------
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

## 03. ```output```ブロック

### ```output```ブロックとは

いくつかのユースケースがある。

可読性の観点から、```resource```ブロック一括で出力するのではなく、```resource```ブロックの特定の```attribute```値を出力するようにした方が良い。



> ↪️ 参考：
>
> - https://www.terraform.io/language/values/outputs#output-values
> - https://www.terraform.io/language/state/remote-state-data#root-outputs-only

<br>

### ユースケースの種類

#### ▼ ルートモジュール内で使用する場合

ルートモジュールが持つ値を、```data```ブロックの```terraform_remote_state```リソースを使用して、異なるバックエンドに出力する。



```yaml
repository/
├── main.tf # ルートモジュール
├── outputs.tf
...
```

> ↪️ 参考：
>
> - https://www.terraform.io/language/values/outputs#output-values
> - https://www.terraform.io/language/state/remote-state-data#root-outputs-only

**＊実装例＊**

ルートモジュール内で```output```ブロックを使用したとする。



```terraform
# @ルートモジュール

# resourceブロックを、outputブロックとして出力する。
output "bastion_ec2_instance_id" {
  value = aws_instance.bastion.id
}

# ローカルモジュールのoutputブロックを、さらにoutputブロックとして出力する。
output "alb_zone_id" {
  value = module.alb.alb_zone_id
}
```

任意の場所で、```data```ブロックの```terraform_remote_state```から```output```ブロックを使用できる。



```terraform
# ---------------------------------------------
# Data
# ---------------------------------------------
data "terraform_remote_state" "alb" {
  backend = "s3"
  config = {
    bucket = "bucket"
    key = "alb.tfstate"
  }
}

data "terraform_remote_state" "ec2" {
  backend = "s3"
  config = {
    bucket = "bucket"
    key = "ec2.tfstate"
  }
}

# ---------------------------------------------
# Resource
# ---------------------------------------------
resource "foo" "this" {
  foo_id = data.terraform_remote_state.alb.outputs.alb_zone_id
}

resource "bar" "this" {
  bar_id = data.terraform_remote_state.ec2.outputs.bastion_ec2_instance_id
}
```

#### ▼ ローカルモジュール内で使用する場合

ローカルモジュール内の```resource```ブロックが持つ値を、ルートモジュールに出力する。

可読性の観点から、```resource```ブロック一括で出力するのではなく、```resource```ブロックの特定の```attribute```値を出力するようにした方が良い。



```yaml
repository/
├── modules/ # ローカルモジュール
│   ├── foo-module/
│   │   ├── main.tf
│   │   ├── outputs.tf
│   │   ├── variables.tf
...
```



> ↪️ 参考：
>
> - https://www.terraform.io/language/values/outputs#output-values
> - https://www.terraform.io/language/state/remote-state-data#root-outputs-only


**＊実装例＊**

ローカルモジュール内で```output```ブロックを使用したとする。



```terraform
# @ローカルモジュール

# ---------------------------------------------
# Output ALB
# ---------------------------------------------
output "alb_zone_id" {
  value = aws_lb.this.zone_id
}

output "elb_service_account_arn" {
  value = data.aws_elb_service_account.this.arn
}
```

ルートモジュールの```module```ブロックでローカルモジュールをコールし、```output```ブロックを渡せる。



```terraform
# @ルートモジュール

# ルートモジュールでローカルモジュールをコールする。
module "alb" {
  source = "../modules/alb"
}

resource "foo" "this" {
    foo_id = module.alb.alb_zone_id
}
```

#### ▼ リモートモジュール内で使用する場合

リモートモジュールの```resource```ブロックや、リモートモジュール内ローカルモジュールが持つ値を、コール先のルートモジュールに出力する。



```yaml
repository/
├── main.tf # リモートモジュール
├── outputs.tf
...
```


```terraform
# リモートモジュール内のローカルモジュールを出力する。

# ---------------------------------------------
# Output ALB
# ---------------------------------------------
output "alb_zone_id" {
  value = module.alb.alb_zone_id
}

# ---------------------------------------------
# Output EC2
# ---------------------------------------------
output "bastion_ec2_instance_id" {
  value = aws_instance.bastion.id
}
```

ルートモジュールの```module```ブロックでリモートモジュールをコールし、```output```ブロックを渡せる。



```terraform
# @ルートモジュール

# ルートモジュールでリモートモジュールをコールする。
module "alb" {
  source = "git::https://github.com/hiroki-hasegawa/terraform-alb-modules.git"
}
  
resource "foo" "this" {
    foo_id = module.alb.alb_zone_id
}
```


> ↪️ 参考：
>
> - https://www.terraform.io/language/values/outputs#output-values
> - https://www.terraform.io/language/state/remote-state-data#root-outputs-only

<br>

### ```output```ブロックのデータ型

#### ▼ ```count```引数を使用した場合の注意点

```resource```ブロックの作成に```count```引数を使用した場合、その```resource```ブロックはlist型として扱われる。

そのため、```output```ブロックではキー名を指定して出力できる。

補足として、```for_each```引数で作成した```resource```ブロックはアスタリスクでインデックス名を指定できないため、注意。



**＊実装例＊**

例として、VPCのサブネットを示す。

ここでは、パブリックサブネット、applicationサブネット、datastoreサブネット、を```count```引数で作成したとする。



```terraform
# ---------------------------------------------
# Resource パブリックサブネット
# ---------------------------------------------
resource "aws_subnet" "public" {
  count = 2
  
  ...
}

# ---------------------------------------------
# Resource プライベートサブネット
# ---------------------------------------------
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
# ---------------------------------------------
# Output VPC
# ---------------------------------------------
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

インデックスキー (```0```番目) を指定した場合、スカラー型になる。



```terraform
# ---------------------------------------------
# Output VPC
# ---------------------------------------------
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

## 04. ```local```ブロック

### ```local```ブロックとは

通常変数であり、定義されたローカル/リモートモジュール内にのみスコープを持つ。

ルートモジュールとローカル/リモートモジュールが異なるリポジトリで管理されている場合に有効である。

これらが同じリポジトリにある場合は、環境変数を使用した方が可読性が高くなる。


```terraform
locals {
  foo = "FOO"
}

resource "aws_instance" "example" {
  foo = local.foo
}
```



> ↪️ 参考：
>
> - https://www.terraform.io/language/values/locals
> - https://febc-yamamoto.hatenablog.jp/entry/2018/01/30/185416


<br>

## 05. ```variable```ブロック

### ```variable```ブロックとは

```.tfvars```ファイル、```module```ブロック、```resource```ブロック、で使用する変数に関して、データ型やデフォルト値を定義する。



<br>

### オプション

#### ▼ データ型

単一値、list型、map型を定義できる。



**＊実装例＊**

AZ、サブネットのCIDRブロック、RDSのパラメーターグループ値、などはmap型として保持しておくと良い。

また、IPアドレスのセット、ユーザーエージェント、などはlist型として保持しておくと良い。



```terraform
# ---------------------------------------------
# Variables ECS
# ---------------------------------------------
variable "ecs_container_laravel_port_http" {
  type = number
}

variable "ecs_container_nginx_port_http" {
  type = number
}

# ---------------------------------------------
# Variables RDS
# ---------------------------------------------
variable "rds_auto_minor_version_upgrade" {
  type = bool
}

variable "rds_instance_class" {
  type = string
}

variable "rds_parameter_group_values" {
  type = map(string)
}

# ---------------------------------------------
# Variables VPC
# ---------------------------------------------
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

# ---------------------------------------------
# Variables WAF
# ---------------------------------------------
variable "waf_allowed_global_ip_addresses" {
  type = list(string)
}

variable "waf_blocked_user_agents" {
  type = list(string)
}
```

#### ▼ デフォルト値

変数のデフォルト値を定義できる。

有効な値を設定してしまうと可読性が悪くなる。

そのため、無効値 (例：boolean型であれば```false```、string型であれば空文字、list型であれば空配列、など) を設定する。



**＊実装例＊**

```module```ブロックや```resource```ブロック内で、```count```引数を使用して条件分岐を定義した場合に、そのフラグ値となるboolean型値をデフォルト値として定義すると良い。



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

```resource```ブロック間の依存関係を明示的に定義する。

Terraformでは、基本的に```resource```ブロック間の依存関係が暗黙的に定義されている。

しかし、複数の```resource```ブロックが関わると、```resource```ブロックを適切な順番で作成できない場合があるため、そういった時に使用する。



#### ▼ ALB target group vs. ALB、ECS

例として、ALB target groupを示す。

ALB Target groupとALBの```resource```ブロックを適切な順番で作成できないため、ECSの作成時にエラーが起こる。

ALBの後にALB target groupを作成する必要がある。



**＊実装例＊**

```terraform
# ---------------------------------------------
# Resource ALB target group
# ---------------------------------------------
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

例として、NAT Gatewayを示す。

NAT Gateway、Internet Gateway、の```resource```ブロックを適切な順番で作成できない。

そのため、Internet Gatewayの作成後に、NAT Gatewayを作成するように定義する必要がある。



```terraform
# ---------------------------------------------
# Resource EC2
# ---------------------------------------------
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
# ---------------------------------------------
# Resource Elastic IP
# ---------------------------------------------
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
# ---------------------------------------------
# Resource NAT Gateway
# ---------------------------------------------
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

例として、S3を示す。

バケットポリシーとパブリックアクセスブロックポリシーを同時に作成できないため、作成のタイミングが重ならないようにする必要がある。



```terraform
# ---------------------------------------------
# Resource S3
# ---------------------------------------------

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

指定した数だけ、```resource```ブロックの作成を繰り返す。

```count.index```オプションでインデックス数を展開する。



**＊実装例＊**

```terraform
# ---------------------------------------------
# Resource EC2
# ---------------------------------------------
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

特定の実行環境でリソースの作成の有無を切り替えたい場合、```.terraform.tfvars```ファイルからフラグ値を渡し、これがあるかないかを```count```引数で判定し、条件分岐を実現する。

フラグ値を渡さない場合は、デフォルト値を渡すようにする。



> ↪️ 参考：https://cloud.google.com/docs/terraform/best-practices-for-terraform#count

```terraform
# 特定の実行環境の.terraform.tfvarsファイル
enable_provision = true
```

```terraform
# ---------------------------------------------
# Variables EC2
# ---------------------------------------------
variable "enable_provision" {
  description = "enable provision"
  type        = bool
  default     = false
}
```

```terraform
# ---------------------------------------------
# Resource EC2
# ---------------------------------------------
resource "aws_instance" "server" {
  count = var.enable_provision ? 1 : 0
  
  ami           = "ami-a1b2c3d4"
  instance_type = "t2.micro"

  tags = {
    Name = "ec2-${count.index}"
  }
}
```

注意点として、```count```関数を使用すると、他のブロック (例：```resource```ブロック、```output```ブロック) で設定値にアクセスする時にインデックス番号```0```を指定する必要がある。

```terraform
resource "foo" "server" {
  foo = aws_instance.server.0.ami
}
```

#### ▼ 実行環境別の作成

```terraform
# 特定の実行環境の.terraform.tfvarsファイル
env = dev
```

```terraform
# ---------------------------------------------
# Variables EC2
# ---------------------------------------------
variable "env" {
  description = "system environment"
  type        = string
}
```

```terraform
# ---------------------------------------------
# Resource EC2
# ---------------------------------------------
resource "aws_instance" "server" {
  # dev環境とstg環境以外でプロビジョニングする
  count = (
    var.env != "dev"
    || var.env != "stg"
  ) ? 1 : 0
  
  ami           = "ami-a1b2c3d4"
  instance_type = "t2.micro"

  tags = {
    Name = "ec2-${count.index}"
  }
}
```

#### ▼ ```count```関数で作成されなかった```resource```ブロックを検知

```count```関数で作成したブロックを他のブロックで使用する場合、それを検知できるようにする必要がある。

```count```関数で作成されたリソースが存在するかどうかは、```length```関数で検知できる。


```terraform
resource "aws_kms_key" "foo" {
  count = var.region == "ap-northeast-1" ? 0 : 1
  
  policy = data.aws_iam_policy_document.foo.json
  
  # ここでは、マルチリージョンが必須とする。
  multi_region = true 
  
  tags = {
    Name = foo
  }
}

resource "aws_kms_alias" "foo" {
  # count関数によるaws_kms_key.footリソースがなければ、本リソースも作成しない
  # count = var.region == "ap-northeast-1" ? 0 : 1 でもよい。
  count = length(aws_kms_key.foo)

  name          = "alias/foo"
  target_key_id = aws_kms_key.foo.0.key_id
}

resource "aws_kms_replica_key" "foo" {
  # count関数によるaws_kms_key.fooリソースがなければ、本リソースも作成しない
  # count = var.region == "ap-northeast-1" ? 0 : 1 でもよい。
  count = length(aws_kms_key.k8s_secret)

  provider = aws.ap-northeast-3

  primary_key_arn = aws_kms_key.foo.0.arn
  policy          = data.aws_iam_policy_document.foo.json
  
  tags = {
    Name = foo
  }
}
```

> ↪️ 参考：https://stackoverflow.com/questions/71484962/conditional-creation-of-parent-child-resources/71490413#71490413

#### ▼ ```count```関数で作成されなかった```output```ブロックは```null```

```count```関数で作成されたリソースに対してのみ```output```ブロックで値を出力し、もしリソースがなければ```null```や空文字 (```""```) を出力するようにする。

補足として、```count```関数の結果の検知には、```length```関数を使用する。

```terraform
output "foo_kms_key_arn" {
  value = length(aws_kms_key.foo) > 0 ? aws_kms_key.foo.0.arn : null
}
```


> ↪️ 参考：
> 
> - https://discuss.hashicorp.com/t/output-from-a-module-that-has-conditional-count-0/17234/2
> - https://github.com/hashicorp/terraform/issues/23222#issuecomment-547462883
> - https://www.bioerrorlog.work/entry/terraform-count-resource-output

<br>

### ```for_each```引数

#### ▼ ```for_each```引数とは

事前に```for_each```引数に格納したmap型の```key```の数だけ、```resource```ブロックを繰り返し実行する。

繰り返し処理を行う時に、```count```引数とは違い、要素名を指定して出力できる。



**＊実装例＊**

例として、subnetを繰り返し作成する。



```terraform
# ---------------------------------------------
# Variables Global
# ---------------------------------------------
vpc_availability_zones             = { a = "a", c = "c" }
vpc_cidr                           = "*.*.*.*/23"
vpc_subnet_private_datastore_cidrs = { a = "*.*.*.*/27", c = "*.*.*.*/27" }
vpc_subnet_private_app_cidrs       = { a = "*.*.*.*/25", c = "*.*.*.*/25" }
vpc_subnet_public_cidrs            = { a = "*.*.*.*/27", c = "*.*.*.*/27" }
```

```terraform
# ---------------------------------------------
# Resrouce VPC
# ---------------------------------------------
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

冗長化されたAZで共通のルートテーブルを作成する場合、そこで、```for_each```引数を使用すると、少ない実装で作成できる。

```for_each```引数で作成された```resource```ブロックは```terraform apply```コマンド実行中にmap構造として扱われ、```resource```ブロック名の下層にキー名で```resource```ブロックが並ぶ構造になっている。

これを参照するために、『```<resourceタイプ>.<resourceブロック名>[each.key].<attribute>```』とする。

**＊実装例＊**

パブリックサブネット、プライベートサブネット、プライベートサブネットに紐付くNAT Gatewayの設定が冗長化されたAZで共通の場合、```for_each```引数で作成する。



```terraform
# ---------------------------------------------
# Variables Global
# ---------------------------------------------
vpc_availability_zones = { a = "a", c = "c" }
```

```terraform
# ---------------------------------------------
# Resrouce Internet Gateway
# ---------------------------------------------
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "prd-foo-igw"
  }
}

# ---------------------------------------------
# Resrouce ルートテーブル (パブリック)
# ---------------------------------------------
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

# ---------------------------------------------
# Resrouce ルートテーブル (プライベート)
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
      "prd-foo-pvt-%s-app-rtb",
      each.value
    )
  }
}

# ---------------------------------------------
# Resrouce NAT Gateway
# ---------------------------------------------
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

```resource```ブロックの作成に```for_each```引数を使用した場合、その```resource```ブロックはmap型として扱われる。

そのため、キー名を指定して出力できる。



```terraform
# ---------------------------------------------
# Variables Global
# ---------------------------------------------
vpc_availability_zones = { a = "a", c = "c" }
```

```terraform
# ---------------------------------------------
# Output VPC
# ---------------------------------------------
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
# ---------------------------------------------
# Variables Global
# ---------------------------------------------
vpc_availability_zones = { a = "a", c = "c" }
```

```terraform
# ---------------------------------------------
# Output VPC
# ---------------------------------------------
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
# ---------------------------------------------
# ALB
# ---------------------------------------------
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



> ↪️ 参考：https://www.terraform.io/language/expressions/dynamic-blocks

#### ▼ map型の場合

**＊実装例＊**

map型のキー名と値の両方を設定値として使用する。

例として、RDSパラメーターグループの```parameter```ブロックを、map型通常変数を使用して繰り返し作成する。



```terraform
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
```

```terraform
# ---------------------------------------------
# Resource RDS Cluster Parameter Group
# ---------------------------------------------
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
# ---------------------------------------------
# Resource Security Group
# ---------------------------------------------
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
# ---------------------------------------------
# Variables WAF
# ---------------------------------------------
waf_blocked_user_agents = [
  "FooCrawler",
  "BarSpider",
  "BazBot",
]
```

```terraform

# ---------------------------------------------
# WAF Regex Pattern Sets
# ---------------------------------------------
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

```resource```ブロックを新しく作成した後に削除するように、変更できる。

通常時、Terraformの処理順序として、```resource```ブロックの削除後に作成が行われる。

しかし、他のリソースと依存関係が存在する場合、先に削除が行われることによって、他のリソースに影響が出てしまう。

これに対処するために、先に新しい```resource```ブロックを作成し、紐付けし直してから、削除する必要がある。



**＊実装例＊**

例として、ACMのSSL証明書を示す。

ACMのSSL証明書は、ALBやCloudFrontに紐付いており、新しい証明書に紐付け直した後に、既存のものを削除する必要がある。



```terraform
# ---------------------------------------------
# For foo domain
# ---------------------------------------------
resource "aws_acm_certificate" "foo" {

  ...

  # 新しいSSL証明書を作成した後に削除する。
  lifecycle {
    create_before_destroy = true
  }
}
```

**＊実装例＊**

例として、RDSのクラスターパラメーターグループとサブネットグループを示す。

クラスターパラメーターグループとサブネットグループは、DBクラスターに紐付いており、新しいクラスターパラメーターグループに紐付け直した後に、既存のものを削除する必要がある。



```terraform
# ---------------------------------------------
# Resource RDS Cluster Parameter Group
# ---------------------------------------------
resource "aws_rds_cluster_parameter_group" "this" {

  ...

  lifecycle {
    create_before_destroy = true
  }
}

# ---------------------------------------------
# Resource RDS Subnet Group
# ---------------------------------------------
resource "aws_db_subnet_group" "this" {

  ...

  lifecycle {
    create_before_destroy = true
  }
}
```

**＊実装例＊**

例として、Redisのパラメーターグループとサブネットグループを示す。

ラメータグループとサブネットグループは、RDSに紐付いており、新しいパラメーターグループとサブネットグループに紐付け直した後に、既存のものを削除する必要がある。



```terraform
# ---------------------------------------------
# Resource Redis Parameter Group
# ---------------------------------------------
resource "aws_elasticache_parameter_group" "redis" {

  ...

  lifecycle {
    create_before_destroy = true
  }
}

# ---------------------------------------------
# Resource Redis Subnet Group
# ---------------------------------------------
resource "aws_elasticache_subnet_group" "redis" {

  ...

  lifecycle {
    create_before_destroy = true
  }
}
```

#### ▼ ignore_changes

実インフラのみで発生した```resource```ブロックの作成・更新・削除を無視し、```.tfstate```ファイルに反映しないようにする。

これにより、```ignore_changes```引数を定義したタイミング以降、実インフラと```.tfstate```ファイルに差分があっても、```.tfstate```ファイルの値が更新されなくなる。



**＊実装例＊**

例として、ECSを示す。

ECSでは、オートスケーリングによってECSタスク数が増加する。

そのため、これらを無視する必要がある。



```terraform
# ---------------------------------------------
# Resource ECS Service
# ---------------------------------------------
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

例として、Redisを示す。

Redisでは、オートスケーリングによってプライマリー数とレプリカ数が増減する。

そのため、これらを無視する必要がある。




```terraform
# ---------------------------------------------
# Resource Redis Cluster
# ---------------------------------------------
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

使用例はすくないが、補足として```resource```ブロック全体を無視する場合は```all```値を設定する。



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

正規表現ルールに基づいて、文字列の中から文字を抽出する。

これを応用して、特定の文字列を含む場合に条件を分岐させるようにできる。



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
    # 環境が複数あるとする。 (prd-1、prd-2、stg-1、stg-2) 
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

第一引数でポリシーが定義されたファイルを読み出し、第二引数でファイルに変数を渡す。

ファイルの拡張子はtplとするのが良い。



**＊実装例＊**

例として、S3を示す。



```terraform
# ---------------------------------------------
# Resource S3 bucket policy
# ---------------------------------------------
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

バケットポリシーを定義するtpl形式ファイルでは、string型の場合は```"${}"```で、integer型の場合は```${}```で変数を展開する。

ここで拡張子をjsonにしてしまうと、integer型の出力をjsonの構文エラーとして扱われてしまう。

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


| 変数                      | 値                                             | 例                         |
|---------------------------|------------------------------------------------|----------------------------|
| ```path.module```         | ```path```式が実行された```.tf```ファイルがあるディレクトリのパス。 | ```/project/module/foo/``` |
| ```path.root```           | ```terraform```コマンドの作業ディレクトリのパス              | ```/var/www/```            |
| ```path.root```           | ```module```ディレクトリのルートパス                       | ```/project/module/```     |
| ```terraform.workplace``` | 現在使用しているワークスペース名                          | ```prd```                  |

> ↪️ 参考：https://www.terraform.io/language/expressions/references#filesystem-and-workspace-info

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

integer型を通常変数として渡せるように、拡張子をjsonではなくtplとするのが良い。

```image```キーでは、ECRイメージのURLを設定する。

バージョンタグは任意で指定でき、もし指定しない場合は、『```latest```』という名前のタグが自動的に割り当てられる。

バージョンタグにハッシュ値が割り当てられている場合、Terraformでは時系列で最新のタグ名を取得する方法がないため、```secrets```キーでは、パラメーターストアの値を参照できる。

ログ分割の目印を設定する```awslogs-datetime-format```キーでは、タイムスタンプを表す```\\[%Y-%m-%d %H:%M:%S\\]```を設定すると良い。

これにより、同じ時間に発生したログを1つのログとしてまとめられるため、スタックトレースが見やすくなる。

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
        # スタックトレースのグループ化 (同時刻ログのグループ化) 
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

<br>
