---
title: 【IT技術の知見】CloudWatch＠Cで始まるAWSリソース
description: CloudWatch＠Cで始まるAWSリソースの知見を記録しています。
---

# CloudWatch＠```C```で始まるAWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/


<br>

## 01. CloudWatchメトリクス

### CloudWatchメトリクスとは

AWSリソースで発生したメトリクスのデータポイントを収集する。




<br>

### メトリクスの集約

#### ▼ メトリクスの集約とは

![metrics_namespace_dimension](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/metrics_namespace_dimension.png)

CloudWatchは、データポイントからメトリクスを作成しつつ、特定のグループ（例：ディメンション、名前空間）に集約できる。



> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html
> - https://www.slideshare.net/AmazonWebServicesJapan/20190326-aws-black-belt-online-seminar-amazon-cloudwatch/18

#### ▼ 集約の種類

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Statistic
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Aggregation


| 集約名   | 説明                                                                                                                                                                                                                                                                                                                                                                        |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ディメンション  | インスタンスの設定値をグループとした集約のこと（例：インスタンスID、スペック、AZ、など）。ディメンションが大きすぎると、異なる種類のデータポイントがごちゃまぜに集約される（例えば、EC2のストレージで、```/var/lib/foo```パーティションのディスク使用率のデータポイントが```30```%だとする。EC2のインスタンスIDをディメンションにした場合に、```/var/lib/foo```以外のパーティションが```30```%より低いため、インスタンスIDのディメンション全体としては```10%```ほどのディスク使用率になる）。CloudWatchアラームではディメンションしか指定できず、ディメンションを正確に集計する必要がある。 |
| 名前空間 | AWSリソースをグループとした集約のこと（例：EC2、RDS、ALB、など）。AWSリソース名で表す。cloudwatchエージェントでカスタムメトリクスを収集すると、名前空間はCWAgentになる。                                                                                                                                                                                                                                                             |

#### ▼ 集約の確認方法

CloudWatchメトリクス上では、各集約を以下の様に確認できる。

![cloudwatch_namespace_metric_dimension](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/cloudwatch_namespace_metric_dimension.png)


> ℹ️ 参考：https://dev.classmethod.jp/articles/amazon-cloudwatch-logs-announces-dimension-support-for-metric-filters/


<br>

### インサイトメトリクス

#### ▼ インサイトメトリクスは

異なるメトリクスを再集計し、パフォーマンスに関するメトリクスとして提供する。



#### ▼ パフォーマンスインサイト

RDS（Aurora、非Aurora）のパフォーマンスに関するメトリクスのデータポイントを収集する。

特定の集約（例：個別のクエリ）で監視できるようになる。

パラメーターグループの```performance_schema```を有効化する必要がある。

対応するエンジンバージョンとインスタンスタイプについては、以下のリンクを参考にせよ。



> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_PerfInsights.Enabling.html
> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PerfInsights.Overview.Engines.html

#### ▼ Containerインサイト

コンテナに関するAWSリソース（例：ECSクラスター/EKS Cluster、ECSサービス、ECSタスク、ECSコンテナ）のパフォーマンスに関するメトリクスのデータポイントを収集する。

作成したメトリクスを特定の集約（例：個別のコンテナ）で扱えるになる。

また、コンテナ間の繋がりをコンテナマップで視覚化できるようになる。

ECS、EKSのアカウント設定でContainerインサイトを有効化する必要がある。



#### ▼ Lambdaインサイト

Lambdaのパフォーマンスに関するメトリクスのデータポイントを収集する。



<br>

## 02. CloudWatchログ

### CloudWatchログとは

クラウドログサーバーとして働く。

AWSリソースで作成されたログを収集できる。



<br>

### セットアップ

#### ▼ コンソール画面

| 設定項目       | 説明                                                                                  | 補足                                                                       |
|----------------|---------------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| ロググループ         | ログストリームをグループ化して収集するか否かを設定する。                                                    | 基本的に、ログファイルはグループ化せずに、```1```個のロググループには```1```個のログストリームしか含まれないようにする。 |
| メトリクスフィルター     | フィルターパターンに合致した文字列を持つログをトリガーとして、データポイントを発生させる。このデータポイントを集計し、メトリクスとして使用できる。 |                                                                            |
| サブスクリプションフィルター |                                                                                       |                                                                            |

<br>

### フィルターパターン

#### ▼ フィルターパターンとは

ログ内で検知する文字列を設定する。

大文字と小文字を区別するため、網羅的に設定する必要がある。



> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html
> - https://qiita.com/shimajiri/items/81a4ed0fe39fe337fedb

#### ▼ OR条件

**＊例＊**

OR条件で大文字小文字を考慮し、『```<ログレベル>:```』が含まれるログを検出する。ここでコロンを含まているのは、ログに含まれるファイル名やメソッド名が誤って検知されないようするためである。

```bash
?"WARNING:" ?"Warning:" ?"ERROR:" ?"Error:" ?"CRITICAL:" ?"Critical:" ?"EMERGENCY:" ?"Emergency:" ?"ALERT:" ?"Alert:"
```

**＊例＊**

OR条件で大文字小文字を考慮し、『```<ログレベル> message```』が含まれるログを検出する。

```bash
?"WARNING message" ?"Warning message" ?"ERROR message" ?"Error message" ?"CRITICAL message" ?"Critical message" ?"EMERGENCY message" ?"Emergency message" ?"ALERT message" ?"Alert message"
```

#### ▼ 除外条件

**＊例＊**

『```ERROR:```』が含まれ、かつ『```MethodNotAllowedHttpException```』が含まれないログを検知する。

OR条件と除外条件を組み合わせようとすると、OR条件が認識されずに除外条件だけが適用されてしまう。

そのため、ここではOR条件を使用していない。



> ℹ️ 参考：https://dev.classmethod.jp/articles/cloudwatch-metricsfilter-filterpattern/

```yaml
"ERROR:" -MethodNotAllowedHttpException
```

<br>

### CloudWatchログエージェント（非推奨）

#### ▼ CloudWatchログエージェントとは

インスタンス内で稼働するデーモンのこと。

インスタンス内のデータを収集し、CloudWatchログに対して送信する。

執筆時点（2020/10/05）では非推奨で、cloudwatchエージェントへの設定の移行が推奨されている。



#### ▼ ```/var/awslogs/etc/awslogs.conf```ファイル

CloudWatchログエージェントを設定する。

OS、ミドルウェア、アプリケーションに分類して設定すると良い。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AgentReference.html#agent-configuration-file

**＊実装例＊**

```ini
# ------------------------------------------
# CentOS CloudWatch Logs
# ------------------------------------------
[/var/log/messages]

# タイムスタンプ
#（例）Jan 1 00:00:00
datetime_format = %b %d %H:%M:%S
#（例）2020-01-01 00:00:00
# datetime_format = %Y-%m-%d %H:%M:%S

# 収集したいログファイル。ここでは、CentOSのログを設定する。
file = /var/log/messages

# 文字コードutf_8として送信する。文字コードが合わないと、CloudWatchログの画面上で文字化けする。
encoding = utf_8

# バッファーに蓄える期間
buffer_duration = 5000

# 調査中...
initial_position = start_of_file

# インスタンスID
log_stream_name = {instance_id}

# AWS上で管理するロググループ名
log_group_name = /var/log/messages

# ------------------------------------------
# Nginx CloudWatch Logs
# ------------------------------------------
[/var/log/nginx/error.log]
file             = /var/log/nginx/error.log
buffer_duration  = 5000
log_stream_name  = {instance_id}
initial_position = start_of_file
log_group_name   = /var/log/nginx/error_log.production

# ------------------------------------------
# Application CloudWatch Logs
# ------------------------------------------
[/var/www/project/app/storage/logs/laravel.log]
file             = /var/www/project/app/storage/logs/laravel.log
buffer_duration  = 5000
log_stream_name  = {instance_id}
initial_position = start_of_file
log_group_name   = /var/www/project/app/storage/logs/laravel_log.production
```

#### ▼ コマンド

設定後、```awslogs```コマンドでプロセスを起動する。



**＊例＊**

```bash
# cloudwatchエージェントの再起動
# 注意: restartだとCloudWatchに反映されない時がある。
$ service awslogs restart

# もしくは
$ service awslogs stop
$ service awslogs start

# ログが新しく作成されないと変更が適用されないことがあるため、ログファイルに適当な文字列行を増やしてみる。
```

<br>

### Logインサイト

#### ▼ Logインサイトとは

クエリを使用してログを抽出する。



#### ▼ クエリ例

汎用的なクエリを示す。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html

**＊例＊**

小文字と大文字を区別せずに、Errorを含むログを検索する。



```sql
fields @timestamp, @message, @logStream
| filter @message like /(?i)(Error)/
| sort @timestamp desc
| limit 100
```

**＊例＊**

小文字と大文字を区別せずに、WarningまたはErrorを含むログを検索する。



```sql
fields @timestamp, @message, @logStream
| filter @message like /(?i)(Warning|Error)/
| sort @timestamp desc
| limit 100
```

<br>


## 02-02. cloudwatchエージェント

### cloudwatchエージェントとは

インスタンス系AWSリソース（EC2、ECS、EKS、Lambda）内で稼働するデーモンのこと。

インスタンス内のメトリクスのデータポイントやログを収集し、CloudWatchに送信する。

多くの場合、インスタンス系リソースは基本的なメトリクスを収集するが、一部のメトリクス（例：EC2のメモリ使用率やディスク使用率）やログそのものを収集しない。

cloudwatchエージェントを使用することにより、カスタムメトリクスやログを収集できるようにする。



> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html
> - https://engineers.weddingpark.co.jp/aws-cloudwatch-ec2/
> - https://aws.amazon.com/jp/premiumsupport/knowledge-center/cloudwatch-memory-metrics-ec2/

プロセスは、デーモン化しておくと良い。



```bash
$ systemctl list-unit-files --type=service | grep amazon-cloudwatch-agent

$ systemctl status amazon-cloudwatch-agent

● amazon-cloudwatch-agent.service - Amazon CloudWatch Agent
   Loaded: loaded (/etc/systemd/system/amazon-cloudwatch-agent.service; enabled; vendor preset: disabled)
   Active: active (running) since Thu 2022-06-13 19:04:56 JST; 42min ago
 Main PID: 2959 (amazon-cloudwat)
   CGroup: /system.slice/amazon-cloudwatch-agent.service
           └─2959 /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent -config /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.toml -envconfig /opt/aws/amazon-cloudwatch-agent/etc/env-config.json -pidfile /opt/aws/amazon-cloudwatch-agent/var/amazon-cloudwatch-agent.pid

Oct 13 19:04:56 *** systemd[1]: Started Amazon CloudWatch Agent.
Oct 13 19:04:57 *** start-amazon-cloudwatch-agent[2959]: /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json does not exist or cannot read. Skipping it.
Oct 13 19:04:57 *** start-amazon-cloudwatch-agent[2959]: I! Detecting run_as_user...
```

<br>

### インストール

#### ▼ yumリポジトリから

```bash
$ yum install amazon-cloudwatch-agent -y

# カスタムメトリクスの収集のために、collectdパッケージを使用する場合
$ yum install collectd -y
```

<br>

### 設定ファイルの配置

#### ▼ ウィザードの場合

ウィザードを使用して設定ファイル（```amazon-cloudwatch-agent.json```ファイル）をセットアップする場合、ウィザードは```amazon-cloudwatch-agent.json```ファイルを```/opt/aws/amazon-cloudwatch-agent/bin```ディレクトリ配下に自動的に作成する。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/create-cloudwatch-agent-configuration-file-wizard.html

#### ▼ 手動の場合

手動で設定ファイル（```amazon-cloudwatch-agent.json```ファイル）をセットアップする場合、```amazon-cloudwatch-agent.json```ファイルを指定されたディレクトリに配置する必要がある。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html

| OS      | 配置先のパス                                           |
|---------|-----------------------------------------------------|
| Linux   | ```/opt/aws/amazon-cloudwatch-agent/etc```          |
| Windows | ```$Env:ProgramData\Amazon\AmazonCloudWatchAgent``` |

<br>

### ```amazon-cloudwatch-agent.json```ファイル

#### ▼ ```amazon-cloudwatch-agent.json```ファイルとは

cloudwatchエージェントのオプションを設定する。セットアップ方法ごとに、設定後、```amazon-cloudwatch-agent-ctl```コマンドで設定ファイルを読み込ませる。全てのセクションを設定する必要はなく、```logs```セクションまたは```metrics```セクションのいずれかのみを設定でもよい（例：cloudwatchエージェントを使用してCloudWatchにログファイルを送信するのみであれば、```log```セッションのみ）。注意点として、cloudwatchエージェントは、起動後に```amazon-cloudwatch-agent.json```ファイルを```/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.d/file_amazon-cloudwatch-agent.json```ファイルとして移動してしまい、元々の```amazon-cloudwatch-agent.json```ファイルは無くなってしまう。

> ℹ️ 参考：https://zenn.dev/tokku5552/articles/ansible-cloudwatch-local

#### ▼ ```amazon-cloudwatch-agent-ctl```コマンド

```amazon-cloudwatch-agent-ctl```コマンドを使用して、設定ファイルを読み込みつつ、cloudwatchエージェントを起動できる。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/install-CloudWatch-Agent-commandline-fleet.html

**＊例＊**

設定ファイルを読み込み、EC2インスタンス上のcloudwatchエージェントを起動/再起動する。



```bash
$ /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
    -s
```

cloudwatchエージェントをデーモンとして起動するためのユニットファイルが、自動的に作成される。



```ini
[Unit]
Description=Amazon CloudWatch Agent
After=network.target

[Service]
Type=simple
ExecStart=/opt/aws/amazon-cloudwatch-agent/bin/start-amazon-cloudwatch-agent
KillMode=process
Restart=on-failure
RestartSec=60s

[Install]
WantedBy=multi-user.target
```

**＊例＊**

プロセスのステータスを確認する。



```bash
$ /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -m ec2 \
    -a status
```

#### ▼ ```agent```セクション

cloudwatchエージェント全体を設定する。

ウィザードを使用した場合、このセクションの設定はスキップされる。

実装しなかった場合、デフォルト値が適用される。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html#CloudWatch-Agent-Configuration-File-Agentsection

```yaml
{
  "agent": {
    # プロセスのユーザー名を設定する。
    "run_as_user": "cwagent",
    "metrics_collection_interval": 60,
    # 別のAWSアカウントにログを送信する場合に、必要な認可スコープを付与したIAMロール
    "credentials": "arn:aws:iam::<アカウントID>:role/<IAMロール名>"
  }
}
```

#### ▼ ```metrics```セクション

AWSリソースが標準で収集しないカスタムメトリクスのデータポイントの収集について設定する。

ウィザードを使用した場合、このセクションの設定はスキップされる。

実装しなかった場合、何も設定されない。



> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html#CloudWatch-Agent-Configuration-File-Metricssection
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/metrics-collected-by-CloudWatch-agent.html

```yaml
{
  "agent": {
    "run_as_user": "cwagent"
  },
  "metrics": {
    # メトリクスの集約とする名前空間のユーザー定義名
    # デフォルトでCWAgentになる。
    "namespace": "CWAgent",
    # メトリクスの集約とするディメンション
    "aggregation_dimensions": [
      [
        # インスタンスID
        "InstanceId",
        # パーティションに紐づくファイルシステムのパス
        "path"
      ]
    ],
    # ディメンションのユーザー定義名
    "append_dimensions": {
      "AutoScalingGroupName": "${aws:AutoScalingGroupName}",
      "ImageId": "${aws:ImageId}",
      "InstanceId": "${aws:InstanceId}",
      "InstanceType": "${aws:InstanceType}"
    },
    # メモリ上のバッファーの保存時間
    "force_flush_interval": 60,
    # 収集対象のカスタムメトリクスの一覧（collectdパッケージまたはStatsDパッケージを使用する場合）
    "metrics_collected": {
      # collectdパッケージの使用を宣言する。必ず設定する必要がある。
      "collectd": {
        "metrics_aggregation_interval": 60
      },
      # ストレージ系
      "disk": {
        "measurement": [
          # ディスク使用率メトリクス
          "used_percent"
        ],
        "metrics_collection_interval": 60,
        # マウントポイントを設定する。
        "resources": [
          "*"
        ]
      },
      # メモリ系
      "mem": {
        "measurement": [
          # メモリ使用率メトリクス
          "mem_used_percent"
        ],
        "metrics_collection_interval": 60
      }
    }
  }
}
```

#### ▼ ```logs```セクション

ログの収集について設定する。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html#CloudWatch-Agent-Configuration-File-Logssection

**＊実装例＊**

```yaml
{
  "agent": {
    "run_as_user": "cwagent"
  },
  "logs": {
    # メモリ上のバッファーの保存時間
    "force_flush_interval": 60,
    "logs_collected": {
      "files": {
        # 収集対象のログの一覧
        "collect_list": [
          {
            # 収集対象のログのディレクトリ
            "file_path": "/var/log/nginx/error.log",
            # CloudWatchログ上でのロググループ名
            "log_group_name": "/foo-www/var/log/nginx/error_log",
            # CloudWatchログ上でのログストリーム名
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/var/log/php-fpm/error.log",
            "log_group_name": "/foo-www/var/log/php-fpm/error_log",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
```

<br>

### ログ

#### ▼ ```amazon-cloudwatch-agent.log```ファイル

cloudwatchエージェントのプロセスに関するログを出力する。



```bash
$ tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
```

#### ▼ ```configuration-validation.log```ファイル

cloudwatchエージェントの設定ファイルの構文チェックに関するログを出力する。



```bash
$ tail -f /opt/aws/amazon-cloudwatch-agent/logs/configuration-validation.log
```

<br>

### IAMロール

#### ▼ EC2インスタンスの場合

EC2インスタンスでcloudwatchエージェントを稼働させる場合、CloudWatchAgentServerPolicyが付与されたIAMロールをEC2に紐づける必要がある。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/create-iam-roles-for-cloudwatch-agent.html

#### ▼ AWS外のサーバーの場合

AWS外（オンプレミス、他のクラウドプロバイダー）のサーバーでcloudwatchエージェントを稼働させる場合、CloudWatchAgentServerPolicyが付与されたIAMロールをcloudwatchエージェント用のIAMユーザーに紐づける必要がある。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/create-iam-roles-for-cloudwatch-agent.html

<br>

## 03. CloudWatchアラーム

### セットアップ

#### ▼ ログが監視対象の場合

| 設定項目 | 説明                                                                              | 補足                                       |
|----------|---------------------------------------------------------------------------------|--------------------------------------------|
| 名前空間 | 紐付くロググループが属する名前空間を設定する。CloudWatchログが、設定した名前空間に対して、値を発行する。      |                                            |
| メトリクス    | 紐付くロググループが属する名前空間内のメトリクスを設定する。CloudWatchログが、設定したメトリクスに対して、値を発行する。 |                                            |
| メトリクス値  | フィルターパターンでログが検知された時に、データポイントとして発生させる値のこと。                                   | 例えば『検出数』を発行する場合は、『```1```』を設定する。 |

#### ▼ メトリクスが監視対象の場合



#### ▼ 条件

| 設定項目           | 説明                                | 補足                                                                                                                                                                                                                                                                                                                                   |
|------------------|-------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 閾値の種類          |                                     |                                                                                                                                                                                                                                                                                                                                        |
| アラートを実行するデータポイント | アラートを発生させるデータポイント数を設定する。       |                                                                                                                                                                                                                                                                                                                                        |
| 欠落データの処理       | データポイントが発生しないことをどう判定するかを設定する。 | データポイントが一切発生しないことを正常とし、これが発生することを異常とする場合（例：エラーイベント、など）は『```notBreaching```』とする。反対に、データポイントが継続的に発生することを正常とし、これが発生しないことを異常とする場合（例：CPU使用率、メモリ使用率、など）は、『```breaching```』とする。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarms-and-missing-data |

<br>

## 04. CloudWatchシンセティック

### CloudWatchシンセティックとは

合成監視を行えるようになる。



<br>
