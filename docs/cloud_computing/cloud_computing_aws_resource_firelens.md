---
title: 【IT技術の知見】FireLens＠AWSリソース
description: FireLens＠AWSリソースの知見を記録しています。
---

# FireLens＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. FireLensの仕組み

### アーキテクチャ

![fluent-bit_aws-firelens](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_aws-firelens.png)

`(1)`

: awsfirelensドライバーはFluentdログドライバーをラッピングしたものであり、ログをFireLensコンテナに送信する。Fluentdログドライバーについては、以下のリンクを参考にせよ。

`(2)`

: FireLensコンテナは、これを受信する。

`(3)`

: コンテナ内で稼働するFluentBitのログパイプラインのINPUTに渡され、FluentBitはログを処理する。FireLensコンテナのパイプラインでは、ログは『`<コンテナ名>-firelens-<ECSタスクID>`』というタグ名で処理されている。

```yaml
# 本来、改行はないが、わかりやすいように改行している。
# <コンテナ名>-firelens-<ECSタスクID>
[0] foo-firelens-*****: [
    *****,
    {
        "log"=>"127.0.0.1 -  01/01/2022:0:00:00 +0000 "GET /index.php" 200",
        "container_id"=>"*****",
        "container_name"=>"foo",
        "source"=>"stderr"
    }
]
```

`(4)`

: OUTPUTに渡され、FluentBitは指定した外部にログをルーティングする。

> - https://aws.amazon.com/jp/blogs/news/under-the-hood-firelens-for-amazon-ecs-tasks/
> - https://docs.docker.com/config/containers/logging/fluentd/

### FireLensコンテナ

AWSが提供するFluentBitイメージによって作成されるコンテナである。

サイドカーパターンでFluentBitを採用したい場合に、FireLensを採用する。

FireLensコンテナでは、FluentBitがログルーティングプロセスとして稼働する。

FireLensコンテナを使用せずに、ユーザー定義のコンテナを作成して稼働できるが、FireLensコンテナを使用すれば、主要なセットアップがされているため、より簡単な設定でFluentBitを使用できる。

> - https://aws.amazon.com/jp/blogs/news/under-the-hood-firelens-for-amazon-ecs-tasks/
> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/using_firelens.html

<br>

### ログルーティング

#### ▼ サイドカーコンテナとして

ECS Fargateのサイドカーコンテナとして配置する必要がある。

Fargateからログを送信すると、コンテナ内で稼働するFluentBitがこれを収集し、これを外部にルーティングする。

作成のための実装例については、以下のリンクを参考にせよ。

> - https://github.com/aws-samples/amazon-ecs-firelens-examples
> - https://aws.amazon.com/jp/blogs/news/announcing-firelens-a-new-way-to-manage-container-logs/

#### ▼ ログのルーティング先

FluentBitが対応する宛先にログをルーティングできる。

> - https://docs.fluentbit.io/manual/pipeline/outputs

<br>

## 02. セットアップ

### Dockerfile

#### ▼ AWS ECRパブリックギャラリーを使用する場合

AWS ECSタスクのコンテナ定義にて、AWS ECRパブリックギャラリーのURLを指定し、AWS ECRイメージのプルする。

デフォルトで内蔵されている`conf`ファイルの設定をそのまま使用する場合は、こちらを採用する。

> - https://docs.aws.amazon.com/AmazonECS/latest/developerguide/firelens-using-fluentbit.html#firelens-image-ecr

#### ▼ プライベートAWS ECRリポジトリを使用する場合

あらかじめ、DockerHubからFluentBitイメージをプルするためのDockerfileを作成し、プライベートAWS ECRリポジトリにコンテナイメージをプッシュしておく。

ECSタスクのコンテナ定義にて、プライベートAWS ECRリポジトリのURLを指定し、AWS ECRイメージのプルする。

デフォルトで内蔵されている`conf`ファイルの設定を上書きしたい場合は、こちらを採用する。

```dockerfile
FROM amazon/aws-for-fluent-bit:latest
```

> - https://hub.docker.com/r/amazon/aws-for-fluent-bit
> - https://github.com/aws/aws-for-fluent-bit
> - https://docs.aws.amazon.com/AmazonECS/latest/developerguide/firelens-using-fluentbit.html#firelens-image-dockerhub

<br>

### コンテナ定義

#### ▼ `container_definition.json`ファイル

ECSタスクのコンテナ定義にて、アプリコンテナと`log_router`コンテナを設定する。

log_routerという名前以外を設定できないことに注意する。

```yaml
[
  {
    "name": "foo",
    "image": "<イメージリポジトリURL>:<バージョンタグ>", # <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/<イメージリポジトリ名>:latest
    "essential": "false",
    "logConfiguration": {
        # FluentBitの設定はconfファイルで実行するため、optionsキーは何も設定しない。
        "logDriver": "awsfirelens",
      },
  },
  {
    # log_router以外の名前を設定できない
    "name": "log_router",
    "image": "<イメージリポジトリURL>:<バージョンタグ>", # <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/<イメージリポジトリ名>:latest
    "essential": "false",
    "logConfiguration": {
        # ログドライバー
        "logDriver": "awslogs",
        "options": {
            # FireLensコンテナ自体がAWS CloudWatchログにログアウトプット
            "awslogs-group": "<ログストリーム名>",
            "awslogs-region": "ap-northeast-1",
            "awslogs-stream-prefix": "<ログストリームの接頭辞>",
          },
      },
    "firelensConfiguration": {
        # FireLensコンテナでFluentBitを稼働させる
        "type": "fluentbit",
        "options": {
            "config-file-type": "file",
            # 設定上書きのため読み出し
            "config-file-value": "/fluent-bit/etc/fluent-bit_custom.conf",
            # ECSの情報をFireLensコンテナに送信するか否か
            "enable-ecs-log-metadata": "true",
          },
      },
    "portMappings": [],
    "memoryReservation": 50,
    "environment":
      [
        {"name": "DD_ENV", "value": "prd"},
        {"name": "DD_SERVICE", "value": "foo"},
        {"name": "REGION", "value": "ap-northeast-1"},
      ],
    "secrets": [{"name": "DD_API_KEY", "valueFrom": "DD_API_KEY"}],
  },
]
```

#### ▼ `logConfiguration`キーの詳細

| 項目                                           | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                                         | メインコンテナからFireLensコンテナにログを送信できるように、ログドライバーのタイプとして『`fluentbit`』を設定する。                                                                                                                                                                                                                                                                                                                                               |
| `config-file-type`                             | FluentBitの設定ファイルを読み込むために、`file`とする。                                                                                                                                                                                                                                                                                                                                                                                                           |
| `config-file-value`                            | `options`キーにて、ログルーティングを設定できるが、それらは`fluent-bit.conf`ファイルにも設定できるため、ルーティングの設定はできるだけ`fluent-bit.conf`ファイルに実装する。FireLensコンテナ自体のログは、AWS CloudWatchログに送信するように設定し、メインコンテナから受信したログは、ログ監視バックエンド (Datadogなど) にルーティングする。                                                                                                                      |
| `enable-ecs-log-metadata` (デフォルトで有効化) | 有効化した場合、Datadogのログコンソールで、例えば以下のようなタグが付けられる。<br>![ecs-meta-data_true](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs-meta-data_true.png)<br>反対に無効にした場合、以下のようなタグが付けられる。<br>![ecs-meta-data_false](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs-meta-data_false.png)<br>- https://tech.spacely.co.jp/entry/2020/11/28/173356 |
| `environment`、`secrets`                       | コンテナ内の`fluent-bit.conf`ファイルに変数をアウトプットできるように、コンテナの環境変数に値を設定する。                                                                                                                                                                                                                                                                                                                                                         |
| `options`                                      | FluentBitの設定ファイルでOUTPUTセクションを定義する代わりに、`options`キーからも設定できる。                                                                                                                                                                                                                                                                                                                                                                      |

> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/firelens-example-taskdefs.html#firelens-example-forward

<br>

## 03. 設定ファイルの種類

### 設定ファイル一覧

aws-for-fluent-bitイメージの`/fluent-bit/etc`ディレクトリにはデフォルトで設定ファイルが用意されている。

追加設定を実行するファイルはここに配置する。

```bash
[root@<コンテナID>:/fluent-bit/etc]$ ls -la

-rw-r--r-- 1 root root  251 Sep  1 17:57 fluent-bit.conf
-rw-r--r-- 1 root root 1564 Sep 27 02:15 fluent-bit_custom.conf # 追加設定用
-rw-r--r-- 1 root root 4664 Sep  1 18:07 parsers.conf
-rw-r--r-- 1 root root  584 Sep  1 18:07 parsers_ambassador.conf
-rw-r--r-- 1 root root  226 Sep  1 18:07 parsers_cinder.conf
-rw-r--r-- 1 root root 2798 Sep  1 18:07 parsers_extra.conf
-rw-r--r-- 1 root root  240 Sep  1 18:07 parsers_java.conf
-rw-r--r-- 1 root root  845 Sep  1 18:07 parsers_mult.conf
-rw-r--r-- 1 root root  291 Sep 27 02:15 parsers_multiline.conf
-rw-r--r-- 1 root root 2954 Sep  1 18:07 parsers_openstack.conf
-rw-r--r-- 1 root root  579 Sep 27 02:15 stream_processor.conf # 追加設定用
```

<br>

### `/fluent-bit/etc/fluent-bit.conf`

#### ▼ `fluent-bit.conf`とは

FireLensコンテナのデフォルトの設定ファイル。

ローカルマシンでFluentBitコンテナを起動した場合と異なる構成になっていることに注意する。

> - https://dev.classmethod.jp/articles/check-fluent-bit-conf/

```bash
[INPUT]
    Name tcp
    Listen 127.0.0.1
    Port 8877
    Tag firelens-healthcheck

[INPUT]
    Name forward
    unix_path /var/run/fluent.sock

[INPUT]
    Name forward
    Listen 127.0.0.1
    Port 24224

[FILTER]
    Name record_modifier
    Match *
    Record ecs_cluster sample-test-cluster
    Record ecs_task_arn arn:aws:ecs:ap-northeast-1:123456789012:task/sample-test-cluster/d4efc1a0fdf7441e821a3683836ad69a
    Record ecs_task_definition sample-test-webapp-taskdefinition:15

[OUTPUT]
    Name null
    Match firelens-healthcheck
```

<br>

### `/fluent-bit/etc/fluent-bit_custom.conf`ファイル

#### ▼ `fluent-bit_custom.conf`ファイルとは

FireLensコンテナにカスタム値を設定する。

コンテナ定義の`config-file-value`キーで指定し、追加設定を実行する。

これにより、FireLensコンテナの`fluent-bit.conf`ファイルに、カスタムファイルを読み込むためのINCLUDE文が挿入される。

> - https://dev.classmethod.jp/articles/check-fluent-bit-conf/

```bash
[INPUT]
    Name tcp
    Listen 127.0.0.1
    Port 8877
    Tag firelens-healthcheck

[INPUT]
    Name forward
    unix_path /var/run/fluent.sock

[INPUT]
    Name forward
    Listen 127.0.0.1
    Port 24224

[FILTER]
    Name record_modifier
    Match *
    Record ecs_cluster prd-foo-ecs-cluster
    Record ecs_task_arn arn:aws:ecs:ap-northeast-1:<AWSアカウントID>:task/prd-foo-ecs-cluster/*****
    Record ecs_task_definition prd-foo-ecs-task-definition:1

# fluent-bit.confファイルに、カスタムファイルを読み込むためのINCLUDE文が挿入される。
@INCLUDE /fluent-bit/etc/fluent-bit_custom.conf

[OUTPUT]
    Name laravel
    Match laravel-firelens*

[OUTPUT]
    Name nginx
    Match nginx-firelens*
```

#### ▼ INPUTセクション

標準出力/標準エラー出力に出力されたログをそのままインプットするために、FireLensコンテナではforwardプラグインを設定する必要がある。

ただし、デフォルトの設定ファイルには、INPUTがすでに定義されているため、`fluent-bit_custom.conf`ファイルではINPUTを定義しなくても問題ない。

```bash
[INPUT]
    Name        forward
    Listen      0.0.0.0
    Port        24224

[OUTPUT]
    Name cloudwatch
    Match **
    region us-east-1
    log_group_name fluent-bit-cloudwatch
    log_stream_prefix from-fluent-bit-
    auto_create_group true
```

> - https://github.com/aws/aws-for-fluent-bit/blob/mainline/fluent-bit.conf

#### ▼ OUTPUTセクションとプラグイン

AWSやDatadogにルーティングするための設定が必要である。

もし`fluent-bit_custom.conf`ファイルでOUTPUTセクションを設定した場合は、awsfirelensログドライバーの`options`キーは何も設定する必要がない。

```yaml
"logConfiguration": {
	"logDriver": "awsfirelens",
}
```

ファイルで設定する代わりに、`options`キーでOUTPUTセクションを設定もできる。

```yaml
"logConfiguration": {
	"logDriver": "awsfirelens",
	"options": {
	   "Name": "datadog",
	   "Host": "http-intake.logs.datadoghq.com",
	   "TLS": "on",
	   "apikey": "<DATADOG_API_KEY>",
	   "dd_service": "prd-foo",
	   "dd_source": "prd-foo",
	   "dd_tags": "env:prd-foo",
	   "provider": "ecs"
   }
}
```

AWSから提供されているベースイメージには、AWSリソースにログをルーティングするためのOUTPUTプラグインがすでに含まれている。

補足として、datadogプラグインはFluentBit自体にインストール済みである。

AWS ECRパブリックギャラリーからプルしたコンテナイメージをそのまま使用する場合と、プライベートAWS ECRリポジトリで再管理してから使用する場合がある。

```bash
[root@<コンテナID>:/fluent-bit]$ ls -la

-rw-r--r-- 1 root root 26624256 Sep  1 18:04 cloudwatch.so # 執筆時点 (2023/05/29) でcloudwatch_logsプラグインという名前に変わった模様
-rw-r--r-- 1 root root 26032656 Sep  1 18:04 firehose.so   # kinesis_firehoseプラグイン
-rw-r--r-- 1 root root 30016544 Sep  1 18:03 kinesis.so    # kinesis_streamsプラグイン
...
```

> - https://docs.aws.amazon.com/AmazonECS/latest/developerguide/firelens-using-fluentbit.html
> - https://github.com/aws/aws-for-fluent-bit/blob/mainline/examples/fluent-bit/systems-manager-ec2/plugins.conf
> - https://dev.classmethod.jp/articles/fluent-bit-used-cloudwatch-logs-new-plugin/#toc-4

<br>

### `/fluent-bit/etc/parser.conf`ファイル

#### ▼ `parser.conf`ファイルとは

FireLensコンテナで処理中のログのキーの値を修正したい場合、`parser.conf`ファイルでPARSERセクションを設定する必要がある。

#### ▼ PARSERセクション

AWS ECSが送信したログ

AWS ECSのプラットフォームバージョンが`v1.3.0`の時、メタデータのDockerNameは『`/ecs-<ECSタスク定義名>-<リビジョン番号>-<コンテナ名>-<通し番号>`』になる (例：`/ecs-foo-task-definition-1-bar-123456789`) 。

これを`v1.4.0`にアップグレードすればコンテナ名になるが、すぐにアップグレードに対応できないこともある。

その場合はPARSERセクションにて、正規表現の名前付きキャプチャを使用してコンテナ名を抽出すると、以降のセクションで処理しやすくなる。

> - https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-metadata-endpoint-v3.html

```bash
[PARSER]
    Name      docker-name-parser
    Format    regex
    # 例：/ecs-foo-task-definition-1-bar-123456789
    # 正規表現の名前付きキャプチャを使用する
    Regex     ^\/ecs-.*-(?<container_name>.*)-(.*)$
```

```bash
[SERVICE]
    Parsers_File    parser.conf

[FILTER]
    Name            parser
    Match           *
    Key_Name        container_name
    # 使用するパーサールール
    Parser          docker-name-parser
    # 解析されたキーの元の値を保持するか否か
    Preserve_Key    false
    # 解析されたキー以外を保持するか否か
    Reserve_Data    true
```

PARSERセクションでコンテナ名を抽出したおかげで、STREAM_TASKのログクエリのWHERE句で指定できるようになる。

```bash
# WHERE句でコンテナ名を指定
[STREAM_TASK]
    Name foo-stream-task
    # SELECT句の結果に、WITH句でfooタグを付与し、fooデータストリームを作成する。
    Exec CREATE STREAM foo WITH (tag='foo') AS SELECT log FROM TAG:'*-firelens-*' WHERE container_name = 'foo';
```

<br>

### `/fluent-bit/etc/parsers_multiline.conf`ファイル

#### ▼ `parsers_multiline.conf`ファイル

FireLensコンテナで複数行のログを処理したい場合、`parsers_multiline.conf`ファイルでMULTILINE_PARSERを設定する必要がある。

> - https://github.com/aws-samples/amazon-ecs-firelens-examples/blob/mainline/examples/fluent-bit/filter-multiline/README.md

#### ▼ MULTILINE_PARSERセクション

```bash
[MULTILINE_PARSER]
    name          laravel
    type          regex
    flush_timeout 1000
    rule          "start_state"   "/(Dec \d+ \d+\:\d+\:\d+)(.*)/"  "cont"
    rule          "cont"          "/^\s+at.*/"                     "cont"
```

```bash
[SERVICE]
    ...
    parsers_file          /parsers_multiline.conf

[FILTER]
    name                  multiline
    match                 *
    multiline.key_content log
    # ファイルを読み込む。ビルトインパーサ (goなど) を使用することも可能。
    multiline.parser      go, laravel
```

<br>

### `/fluent-bit/etc/stream_processor.conf`ファイル

#### ▼ `stream_processor.conf`ファイルとは

ログの作成元のコンテナごとに異なる処理を設定したい場合、`stream_processor.conf`ファイルでSTREAM_TASKセクションを定義する必要がある。

#### ▼ STREAM_TASKセクション

FireLensコンテナで処理中のログのタグ名は『`<コンテナ名>-firelens-<ECSタスクID>`』になっている。

そのため、Stream Processorでログを抽出するためには、クエリで『`FROM TAG:'*-firelens-*'`』を指定する必要がある。

補足として、STREAM_TASKでタグ付けされたログは、INPUTから再び処理し直される。

＊実装例＊

```bash
# laravelコンテナのログへのタグ付け
[STREAM_TASK]
    Name laravel
    # SELECT句の結果に、WITH句でfooタグを付与し、laravelデータストリームを作成する。
    Exec CREATE STREAM laravel WITH (tag='foo') AS SELECT log FROM TAG:'*-firelens-*' WHERE container_name = 'foo';

# nginxコンテナのログへのタグ付け
[STREAM_TASK]
    Name nginx
    # SELECT句の結果に、WITH句でbarタグを付与し、nginxデータストリームを作成する。
    Exec CREATE STREAM nginx WITH (tag='bar') AS SELECT log FROM TAG:'*-firelens-*' WHERE container_name = 'bar';

# 全てのコンテナのログへのタグ付け
[STREAM_TASK]
    Name containers
    Exec CREATE STREAM container WITH (tag='containers') AS SELECT * FROM TAG:'*-firelens-*';
```

```bash
[SERVICE]
    ...
    Streams_File stream_processor.conf
```

> - https://aws.amazon.com/jp/blogs/news/under-the-hood-firelens-for-amazon-ecs-tasks/

<br>
