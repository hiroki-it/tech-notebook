---
title: 【IT技術の知見】AutoScaling＠AWSリソース
description: AutoScaling＠AWSリソースの知見を記録しています。
---

# AutoScaling＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AutoScaling

### AutoScalingとは

ALBを使用して、起動テンプレートを基にしたEC2インスタンスの自動水平スケーリングを実行する。

注意点として、AutoScalingに紐付けるALBでは、ターゲットを登録する必要はなく、起動テンプレートに応じたインスタンスが自動的に登録される。

言い換えると、AutoScalingにターゲットグループを紐付けて初めて、ターゲットにルーティングできるようになる。

![Auto-scaling](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Auto-scaling.png)

> ↪️：https://www.a-frontier.jp/technology/aws10/

<br>

## 02. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

| 項目                 | 説明                                                                                                 | 補足                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| スケーリンググループ | スケーリングのグループ構成を定義する。各グループで最大最小必要数を設定できる。                       |                                                                                                   |
| 起動テンプレート     | スケーリングで起動するインスタンスの詳細 (例：マシンイメージ、インスタンスタイプ、など) を設定する。 |                                                                                                   |
| ネットワーク         | いずれのAZのサブネットでインスタンスを作成するかを設定する。                                         | 選択したAZの個数よりも少ない個数のEC2インスタンスを作成する場合、作成先のAZをランダムに選択する。 |
| スケーリングポリシー | スケーリングの方法を設定する。                                                                       |                                                                                                   |
| アクティビティ通知   | スケーリング時のイベントをSNSに通知するように設定する。                                              |                                                                                                   |

<br>

### Terraformの場合

#### ▼ スケーリンググループ

```terraform
# AutoScalingグループ
resource "aws_autoscaling_group" "foo" {
  name                      = "foo-group"
  max_size                  = 5
  min_size                  = 2
  health_check_grace_period = 300
  health_check_type         = "EC2"
  desired_capacity          = 4
  force_delete              = true
  vpc_zone_identifier       = ["subnet-*****", "subnet-*****"]

  target_group_arns = [
    aws_alb_target_group.foo.arn
  ]

  # Nodeグループの種類だけ、起動テンプレートを設定する
  launch_template {
    id      = aws_launch_template.foo1.id
    version = "$Latest"
  }

  launch_template {
    id      = aws_launch_template.foo2.id
    version = "$Latest"
  }

  timeouts {
    delete = "15m"
  }

  tag {
    key                 = "Name"
    value               = "foo-instance"
    # AutoScalingで起動したEC2インスタンスにタグを伝搬する
    propagate_at_launch = true
  }

  tag {
    key                 = "Service"
    value               = "foo"
    # AutoScalingで起動したEC2インスタンスにタグを伝搬する
    propagate_at_launch = true
  }

  tag {
    key                 = "Env"
    value               = "prd"
    # AutoScalingで起動したEC2インスタンスにタグを伝搬する
    propagate_at_launch = true
  }
}

# ALBターゲットグループ
resource "aws_lb_target_group" "foo" {
  ...
}

# 起動テンプレート
resource "aws_launch_template" "foo" {
  ...
}
```

> ↪️：https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/autoscaling_group

#### ▼ 起動テンプレート

```terraform
# 起動テンプレート
resource "aws_launch_template" "foo" {

  name = "foo-instance"

  block_device_mappings {
    device_name = "/dev/sdf"

    ebs {
      volume_size = 20
    }
  }

  cpu_options {
    core_count       = 4
    threads_per_core = 2
  }

  ebs_optimized = true

  iam_instance_profile {
    name = aws_iam_role.instance_iam_role.name
  }

  # 最適化AMIを使用する
  image_id = "ami-*****"

  instance_market_options {
    market_type = "spot"
  }

  instance_type = "t2.micro"

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
    instance_metadata_tags      = "enabled"
  }

  monitoring {
    enabled = true
  }

  network_interfaces {
    associate_public_ip_address = true
    security_groups = [
      "sg-*****",
      "sg-*****",
      "sg-*****",
    ]
  }

  tag_specifications {
    resource_type = "instance"

    tags = {
      Name = "test"
    }
  }

  user_data = base64encode(templatefile(
    "${path.module}/templates/userdata.sh.tpl",
    {}
  ))
}
```

> ↪️：https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/launch_template

#### ▼ アクティビティ通知

```terraform
# アクティビティ通知
resource "aws_autoscaling_notification" "foo" {

  group_names = [
    aws_autoscaling_group.bar.name,
    aws_autoscaling_group.baz.name,
  ]

  # 通知したいイベントを設定する
  notifications = [
    "autoscaling:EC2_INSTANCE_LAUNCH",
    "autoscaling:EC2_INSTANCE_TERMINATE",
    "autoscaling:EC2_INSTANCE_LAUNCH_ERROR",
    "autoscaling:EC2_INSTANCE_TERMINATE_ERROR",
  ]

  topic_arn = aws_sns_topic.foo.arn
}


# AutoScalingグループ
resource "aws_autoscaling_group" "bar" {
  ...
}


resource "aws_autoscaling_group" "baz" {
  ...
}

# SNS
resource "aws_sns_topic" "foo" {
  ...
}

```

> ↪️：https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/autoscaling_notification

<br>

### シンプルスケーリング

#### ▼ シンプルスケーリングとは

特定のメトリクスに単一の閾値を設定し、それに応じてスケールアウトとスケールインを行う。

<br>

### ステップスケーリング

#### ▼ ステップスケーリングとは

特定のメトリクスに段階的な閾値を設定し、それに応じて段階的にスケールアウトを実行する。

スケールアウトの実行条件となる閾値期間は、CloudWatchメトリクスの連続期間として設定できる。

AWSとしては、ターゲット追跡スケーリングの使用を推奨している。

**＊例＊**

CPU平均使用率に段階的な閾値を設定する。

- 40%の時にEC2インスタンスが1つスケールアウト
- `70`%の時にEC2インスタンスを2つスケールアウト
- `90`%の時にEC2インスタンスを`3`個スケールアウト

#### ▼ ECSの場合

記入中...

> ↪️：https://docs.aws.amazon.com/AmazonECS/latest/userguide/service-autoscaling-stepscaling.html

<br>

### ターゲット追跡スケーリング

#### ▼ ターゲット追跡スケーリングとは

特定のメトリクス (CPU平均使用率やメモリ平均使用率) にターゲット値を設定し、それに収束するように自動的にスケールインとスケールアウトを実行する。

ステップスケーリングとは異なり、スケーリングの実行条件となる閾値期間を設定できない。

**＊例＊**

- ECSサービスのECSタスク数
- DBクラスターのAuroraのリードレプリカ数
- Lambdaのスクリプト同時実行数

#### ▼ ECSの場合

ターゲット値の設定に応じて、自動的にスケールアウトやスケールインが起こるシナリオ例を示す。

`【１】`

: 最小ECSタスク数を`2`、必要ECSタスク数を`4`、最大数を`6`、CPU平均使用率を`40`%に設定する例を考える。

`【２】`

: 平常時、CPU使用率`40`%に維持される。

`【３】`

: リクエストが増加し、CPU使用率`55`%に上昇する。

`【４】`

: ECSタスク数が`6`個にスケールアウトし、CPU使用率`40`%に維持される。

`【５】`

: リクエスト数が減少し、CPU使用率が`20`%に低下する。

`【６】`

: ECSタスク数が`2`個にスケールインし、CPU使用率`40`%に維持される。

| 設定項目                           | 説明                                                                                                  | 補足                                                                                                                                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ターゲット追跡スケーリングポリシー | 監視対象のメトリクスがターゲット値を超過しているか否かを基に、ECSタスク数のスケーリングが実行される。 |                                                                                                                                                                                                                                   |
| ECSサービスメトリクス              | 監視対象のメトリクスを設定する。                                                                      | 『平均CPU』、『平均メモリ』、『ECSタスク当たりのALBからのリクエスト数』を監視できる。SLIに対応するCloudWatchメトリクスも参考にせよ。                                                                                              |
| ターゲット値                       | ECSタスク数のスケーリングが実行される収束値を設定する。                                               | ターゲット値を超過している場合、ECSタスク数がスケールアウトされる。反対に、ターゲット値未満 (正確にはターゲット値の`90`%未満) の場合、ECSタスク数がスケールインされる。                                                           |
| スケールアウトクールダウン期間     | スケールアウトを完了してから、次回のスケールアウトを発動できるまでの時間を設定する。                  | ・期間を短くし過ぎると、ターゲット値を超過する状態が断続的に続いた場合、余分なスケールアウトが連続して実行されてしまうため注意する。<br>・期間を長く過ぎると、スケールアウトが不十分になり、ECSの負荷が緩和されないため注意する。 |
| スケールインクールダウン期間       | スケールインを完了してから、次回のスケールインを発動できるまでの時間を設定する。                      |                                                                                                                                                                                                                                   |
| スケールインの無効化               |                                                                                                       |                                                                                                                                                                                                                                   |

> ↪️：https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-autoscaling-targettracking.html

<br>

### スケーリングなし

#### ▼ スケーリングなしとは

ややわかりにくい機能名であるが、スケジューリングスケーリングと予測スケーリングを指す。

負荷に合わせて動的にスケーリングするのではなく、一定の間隔で規則的にスケーリングする。

> ↪️：
>
> - https://blog.takuros.net/entry/2020/08/11/082712
> - https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-scheduled-scaling.html

<br>
