---
title: 【IT技術の知見】Eで始まるAWSリソース＠AWS
description: Eで始まるAWSリソース＠AWSの知見を記録しています。
---

# ```E```で始まるAWSリソース＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. ECR

### ECRとは

コンテナイメージやhelmチャートを管理できる。

<br>

### セットアップ

#### ▼ コンソール画面

| 設定項目     | 説明                                                               | 補足                                                                               |
|--------------|--------------------------------------------------------------------|------------------------------------------------------------------------------------|
| 可視性       | イメージリポジトリをパブリックあるいはプライベートにするかを設定する。                              | 様々なベンダーがパブリックリポジトリでECRイメージを提供している。<br>ℹ️ 参考：https://gallery.ecr.aws/          |
| タグのイミュータビリティ | 同じタグ名でイメージがプッシュされた場合、バージョンタグを上書きできる/できないかを設定できる。           | -                                                                                  |
| プッシュ時にスキャン  | イメージがプッシュされた時に、コンテナイメージにインストールされているパッケージの脆弱性を検証し、一覧表示する。 | ℹ️ 参考：https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html |
| 暗号化設定   | -                                                                  | -                                                                                  |

<br>

### イメージのプッシュ

#### ▼ コンテナイメージの場合

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html

（１）ECRにログインする。

```bash
$ aws ecr get-login-password --region ap-northeast-1 | docker login \
    --username AWS \
    --password-stdin <イメージリポジトリURL>

Login Succeeded
```

（２）イメージにタグを付与する。

```bash
# docker tag foo:latest <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
$ docker tag <イメージID> <イメージリポジトリURL>:<バージョンタグ>
```

（３）ECRにコンテナイメージをプッシュする。

```bash
# docker push <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
$ docker push <イメージリポジトリURL>:<バージョンタグ>
```

#### ▼ helmチャートの場合

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonECR/latest/userguide/push-oci-artifact.html

<br>

### ライフサイクル

#### ▼ ライフサイクルポリシー

ECRのコンテナイメージの有効期間を定義できる。

| 設定項目     | 説明                                                    | 補足                                                                                          |
|--------------|-------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| ルールの優先順位 | 数字で、ルールの優先度を設定できる。                               | 数字が小さいほど、優先度は高くなる。数字は連続している必要はなく、例えば、```10```、```20```、```90```、のように設定しても良い。 |
| イメージのステータス   | ルールを適用するイメージの条件として、タグの有無や文字列を設定できる。          |                                                                                               |
| 一致条件     | イメージの有効期間として、同条件に当てはまるイメージが削除される閾値を設定できる。 | 個数、プッシュされてからの期間、などを閾値として設定できる。                                                        |

<br>

### バージョンタグ

#### ▼ タグ名のベストプラクティス

Dockerのベストプラクティスに則り、タグ名にlatestを使用しないようにする。代わりとして、コンテナイメージのバージョンごとに異なるタグ名になるようハッシュ値（例：GitHubのコミットID）を使用する。

> ℹ️ 参考：https://matsuand.github.io/docs.docker.jp.onthefly/develop/dev-best-practices/

<br>

## 02. EFS：Elastic File System

![EFSのファイル共有機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/EFSのファイル共有機能.png)

### EFSとは

マウントターゲットと接続された片方のEC2インスタンスから、ファイルを読み出し、これをもう一方に出力する。ファイルの実体はいずれかのEC2に存在しているため、接続を切断している間、片方のEC2インスタンス内のファイルは無くなる。再接続すると、切断直前のファイルが再び表示されようになる。

<br>

### セットアップ

#### ▼ コンソール画面

| 設定項目     | 説明                                                                                   | 補足                                                                                                                                                                                                 |
|--------------|----------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| パフォーマンスモード   |                                                                                        |                                                                                                                                                                                                      |
| スループットモード    | EFSのスループット性能を設定する。                                                                 |                                                                                                                                                                                                      |
| ライフサイクルポリシー  | しばらくリクエストされていないファイルが低頻度アクセス（IA：Infrequent Access）ストレージクラスに移動保存するまでの期限を設定する。 | ・ライフサイクルポリシーを有効にしない場合、スタンダードストレージクラスのみが使用される。<br>・画面から両ストレージのサイズを確認できる。<br>ℹ️ 参考：https://ap-northeast-1.console.aws.amazon.com/efs/home?region=ap-northeast-1#/file-systems/fs-f77d60d6 |
| ファイルシステムポリシー | 他のAWSリソースがEFSを利用する時のポリシーを設定する。                                                   |                                                                                                                                                                                                      |
| 自動バックアップ   | AWS Backupに定期的に保存するか否かを設定する。                                                   |                                                                                                                                                                                                      |
| ネットワーク       | マウントターゲットを設置するサブネット、セキュリティグループを設定する。                                               | ・サブネットは、ファイル供給の速度の観点から、マウントターゲットにアクセスするAWSリソースと同じにする。<br>・セキュリティグループは、EC2からのNFSプロトコルアクセスを許可したものを設定する。EC2のセキュリティグループを通過したアクセスのみを許可するために、IPアドレスでは、EC2のセキュリティグループを設定する。                |

<br>

### スペック

#### ▼ バーストモードの仕組み

スループット性能の自動スケーリングに残高があり、ベースラインを超過した分だけ自動スケーリング残高が減っていく。また、ベースライン未満の分は残高として蓄積されていく。

![burst-mode_balance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/burst-mode_credit-balance-algorithm.png)

元の残高は、ファイルシステムのスタンダードストレージクラスのサイズに応じて大きくなる。

> ℹ️ 参考：https://docs.aws.amazon.com/efs/latest/ug/performance.html#efs-burst-credits

![burst-mode_credit](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/burst-mode_credit-balance-size.png)

残高は、```BurstCreditBalance```メトリクスから確認できる。このメトリクスが常に減少し続けている場合はプロビジョニングモードの方がより適切である。

> ℹ️ 参考：https://docs.aws.amazon.com/efs/latest/ug/performance.html#using-throughputmode

#### ▼ プロビジョニングモードの仕組み

スループット性能の自動スケーリング機能は無いが、一定の性能は保証されている。

> ℹ️ 参考：https://docs.aws.amazon.com/efs/latest/ug/performance.html#provisioned-throughput

![burst-mode_credit](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/provisioning-mode_credit-balance-size.png)

<br>

### マウントポイントの登録と解除

#### ▼ マウントポイントの登録と解除とは

```mount```コマンドと```unmount```コマンドで、EFSに対してマウントポイントの登録と解除を実行できる。

> ℹ️ 参考：https://qiita.com/tandfy/items/829f9fcc68c4caabc660


#### ▼ 登録

```bash
# mount -t efs -o tls <ファイルシステムID>:<マウント元ディレクトリ> <マウントポイント>
$ mount -t efs -o tls fs-*****:/ /var/www/foo
```

#### ▼ 解除

```df```コマンドで、EFSのDNS名と、マウントされているEC2内のディレクトリを確認した後、```unmount```コマンドを実行する。

```bash
$ df
Filesystem                                  1K-blocks Used Available Use% Mounted on
fs-*****.efs.ap-northeast-1.amazonaws.com:/ xxx       xxx  xxx       1%   /var/www/foo

$ umount /var/www/foo
```

<br>

## 03. ElastiCache

### ElasticCacheとは

アプリケーションの代わりとして、セッション、クエリキャッシュ、を管理する。RedisとMemcachedがある。

<br>

## 04-02. ElastiCache for Redis

### セットアップ

#### ▼ コンソール画面

| 設定項目         | 説明                                                                        | 補足                                                                                                                                                          |
|------------------|-----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| クラスターエンジン        | 全てのRedisノードのキャッシュエンジンを設定する。Redis通常モード、Redisクラスターモードから選択する。           | Redisクラスターモードと同様に、Redis通常モードもクラスター構成になる。ただし、クラスターモードとはクラスターの構成方法が異なる。                                                                              |
| ロケーション           |                                                                             |                                                                                                                                                               |
| エンジンバージョンの互換性 | 全てのRedisノードのキャッシュエンジンのバージョンを設定する。                                        | マイナーバージョンが自動的に更新されないように、例えば『```6.x```』は設定しない方が良い。                                                                                                   |
| パラメーターグループ       | 全てのRedisノードのグローバルパラメーターを設定する。                                            | デフォルトを使用せずに独自定義する場合、事前に作成しておく必要がある。                                                                                                             |
| ノードのタイプ          |                                                                             |                                                                                                                                                               |
| レプリケーション数       | プライマリーノードとは別に、リードレプリカノードをいくつ作成するかを設定する。                                | マルチAZにプライマリーノードとリードレプリカノードを1つずつ配置させる場合、ここでは『```1```個』を設定する。                                                                                            |
| マルチAZ            | プライマリーノードとリードレプリカを異なるAZに配置するか否かを設定する。合わせて、自動フェイルオーバーを実行できるようになる。 |                                                                                                                                                               |
| サブネットグループ        | Redisにアクセスできるサブネットを設定する。                                                  |                                                                                                                                                               |
| セキュリティ           | セキュリティグループを設定する。                                                          |                                                                                                                                                               |
| クラスターへのデータのインポート | あらかじめ作成しておいたバックアップをインポートし、これを元にRedisを作成する。                             | セッションやクエリキャッシュを引き継げる。そのため、新しいRedisへのセッションデータの移行に役立つ。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/backups-seeding-redis.html |
| バックアップ           | バックアップの有効化、保持期間、時間を設定する。                                         | バックアップを取るほどでもないため、無効化しておいて問題ない。                                                                                                                         |
| メンテナンス           | メンテナンスの時間を設定する。                                                         |                                                                                                                                                               |

<br>

### Redisクラスター

#### ▼ Redisクラスターとは

![redis-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/redis-cluster.png)

複数のRedisノードを持つRedisシャードから構成されている。```1```個のリクエストを処理するグループ単位である。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Terms.html

> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Clusters

#### ▼ クラスターモード

クラスターモードを有効にすると、Redisクラスター内に複数のRedisシャードが作成される。反対に無効化すると、シャードは1つだけ作成される。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.ReplicationGroups

<br>

### Redisシャード

#### ▼ Redisシャードとは

Redisノードのグループ。同じデータを保持するグループ単位であり、プライマリーノードとレプリカノードが含まれる。同じRedisシャード内にあるRedisノード間では、セッションやクエリキャッシュが同期される。一方で、AuroraのDBクラスターはこれに相当する概念である。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Shards

<br>

### Redisノード

#### ▼ Redisノードとは

セッションやクエリキャッシュを保持するインスタンスのこと。

<br>

### セッション管理機能

#### ▼ セッション管理機能とは

サーバー内のセッションデータの代わりにセッションIDを管理し、冗長化されたアプリケーション間で共通のセッションIDを使用できるようにする。そのため、リリース後に既存のセッションが破棄されることがなくなり、ログイン状態を保持できるようになる。セッションIDについては、以下のリンクを参考にせよ。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html

![ElastiCacheのセッション管理機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ElastiCacheのセッション管理機能.png)

<br>

### クエリキャッシュ管理機能

#### ▼ クエリキャッシュ管理機能とは

RDSに対するSQLと読み出されたデータを、キャッシュとして管理する。

![クエリCache管理機能_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クエリCache管理機能_1.png)

（１）アプリケーションは、RDSの前に、Redisに対してSQLを実行する。

```sql
SELECT * FROM users;
```

（２）始めて実行されたSQLの場合、RedisはSQLをキーとして保存し、キャッシュが無いことがアプリケーションに返却する。

（３）アプリケーションはRDSに対してSQLを実行する。

（４）データが読み出される。

（５）アプリケーションはRedisにデータを登録する。

```bash
# ElastiCacheには、SQLの実行結果がまだ保存されていない

*** no cache ***
{"id"=>"1", "name"=>"alice"}
{"id"=>"2", "name"=>"bob"}
{"id"=>"3", "name"=>"charles"}
{"id"=>"4", "name"=>"donny"}
{"id"=>"5", "name"=>"elie"}
{"id"=>"6", "name"=>"fabian"}
{"id"=>"7", "name"=>"gabriel"}
{"id"=>"8", "name"=>"harold"}
{"id"=>"9", "name"=>"Ignatius"}
{"id"=>"10", "name"=>"jonny"}
```

![クエリCache管理機能_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クエリCache管理機能_2.png)

（６）次回、アプリケーションは、RDSの前に、Redisに対してSQLを実行する。

```sql
SELECT * FROM users;
```

（７）Redisは、SQLをキーにしてデータを特定し、アプリケーションに返却する。

```bash
# ElastiCacheには、SQLの実行結果が既に保存されている

*** cache hit ***
{"id"=>"1", "name"=>"alice"}
{"id"=>"2", "name"=>"bob"}
{"id"=>"3", "name"=>"charles"}
{"id"=>"4", "name"=>"donny"}
{"id"=>"5", "name"=>"elie"}
{"id"=>"6", "name"=>"fabian"}
{"id"=>"7", "name"=>"gabriel"}
{"id"=>"8", "name"=>"harold"}
{"id"=>"9", "name"=>"Ignatius"}
{"id"=>"10", "name"=>"jonny"}
```

#### ▼ クエリキャッシュの操作

```bash
# Redis接続コマンド
$ /usr/local/sbin/redis-stable/src/redis-cli \
    -c \
    -h <Redisのホスト名> \
    -p 6379
```

```bash
# Redis接続中の状態
# 全てのキーを表示
redis *****:6379> keys *
```

```bash
# Redis接続中の状態
# キーを指定して、対応する値を表示
redis *****:6379> type <キー名>
```

```bash
# Redis接続中の状態
# Redisが受け取ったコマンドをフォアグラウンドで表示
redis *****:6379> monitor
```

<br>

### 障害対策

#### ▼ Redisのフェイルオーバー

プライマリーノードで障害が起こった場合に、リードレプリカノードをプライマリーノードに自動的に昇格する。

| 障害の発生したノード | 挙動                                                   |
|----------------|------------------------------------------------------|
| プライマリーノード      | リードレプリカの1つがプライマリーノードに昇格し、障害が起きたプライマリーノードと置き換わる。 |
| リードレプリカノード     | 障害が起きたリードレプリカノードが、別の新しいものに置き換わる。                |

<br>

### Redisクラスターのダウンタイム

#### ▼ ダウンタイムの発生条件

| 変更する項目 | ダウンタイムの有無 | ダウンタイム                               |
|------------|-------------|--------------------------------------|
| エンジンバージョン  | あり          | ```1```分```30```秒ほどのダウンタイムが発生する。 |

<br>

### 計画的なダウンタイム

#### ▼ 計画的なダウンタイムとは

Redisクラスターでは、設定値（例：エンジンバージョン）のアップグレード時に、Redisノードの再起動が必要である。サイトの利用者に与える影響を小さくできるように、計画的にダウンタイムを発生させる必要がある。

#### ▼ バックアップとインポートによるダウンタイムの最小化

以下の手順で、ダウンタイムを最小限にしてアップグレードできる。

（１）RedisのセッションやクエリキャッシュをS3にエクスポートする。

（２）新しいRedisを作成する。この時、インポートを使用して、セッションやクエリキャッシュを引き継いだRedisクラスターを別途作成する。

（３）新しく作成したRedisクラスターをアップグレードする。

（４）アプリケーションの接続先を古いRedisクラスターから新しいものに変更する。

（５）古いRedisクラスターを削除する。

<br>

## 05. EventBridge（CloudWatchイベント）

### EventBridge（CloudWatchイベント）とは

AWSリソースで発生したイベントを、他のAWSリソースに転送する。サポート対象のAWSリソースは以下のリンクを参考にせよ。

> ℹ️ 参考：https://docs.aws.amazon.com/eventbridge/latest/userguide/what-is-amazon-eventbridge.html

<br>

### パターン

#### ▼ イベントパターン

指定したAWSリソースでイベントが起こると、以下のようなJSONを送信する。イベントパターンを定義し、JSON構造が一致するイベントのみをターゲットに転送する。イベントパターンに定義しないキーは任意のデータと見なされる。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/CloudWatchEventsandEventPatterns.html

```yaml
{
  "version": "0",
  "id": "*****",
  "detail-type": "<イベント名>",
  "source": "aws.<AWSリソース名>",
  "account": "*****",
  "time": "2021-01-01T00:00:00Z",
  "region": "us-west-1",
  "resources": [
    "<イベントを起こしたリソースのARN>"
  ],
  "detail": {
    // その時々のイベントごとに異なるデータ
  }
}
```

**＊実装例＊**

Amplifyの指定したIDのアプリケーションが、```Amplify Deployment Status Change```のイベントを送信し、これの```jobStatus```が```SUCCEED```/```FAILED```だった場合、これを転送する。

```yaml
{
  "detail": {
    "appId": [
      "foo",
      "bar"
    ],
    "jobStatus": [
      "SUCCEED",
      "FAILED"
    ]
  },
  "detail-type": [
    "Amplify Deployment Status Change"
  ],
  "source": "aws.amplify"
}
```

#### ▼ スケジュール

cron式またはrate式を使用して、スケジュールを定義する。これとLambdaを組み合わせることにより、ジョブを実行できる。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html

<br>

### ターゲット

#### ▼ ターゲットの一覧

> ℹ️ 参考：https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-targets.html

#### ▼ デバッグ

EventBridgeでは、どのようなJSONのイベントをターゲットに転送したかを確認できない。そこで、デバッグ時はEventBridgeのターゲットにLambdaを設定し、イベント構造をログから確認する。

**＊実装例＊**

あらかじめ、イベントの内容を出力する関数をLambdaに作成しておく。

```javascript
// Lambdaにデバッグ用の関数を用意する
exports.handler = async (event) => {
    console.log(JSON.stringify({event}, null, 2));
};
```

対象のAWSリソースで任意のイベントが発生した時に、EventBridgeからLambdaに転送するように設定する。

```yaml
{
  "source": "aws.amplify"
}
```

AWSリソースで意図的にイベントを起こし、Lambdaのロググループから内容を確認する。```detail```キーにイベントが割り当てられている。

```yaml
{
    "event": {
        "version": "0",
        "id": "b4a07570-eda1-9fe1-da5e-b672a1705c39",
        "detail-type": "Amplify Deployment Status Change",
        "source": "aws.amplify",
        "account": "<アカウントID>",
        "time": "<イベントの発生時間>",
        "region": "ap-northeast-1",
        "resources": [
            "<AmplifyのアプリケーションのARN>"
        ],
        "detail": {
            "appId": "<アプリケーションID>",
            "branchName": "<ブランチ名>",
            "jobId": "<ジョブID>",
            "jobStatus": "<CI/CDパイプラインのステータス>"
        }
    }
}
```

<br>

### 入力

#### ▼ 入力トランスフォーマー

入力パスで使用する値を抽出し、入力テンプレートで転送するJSONを定義できる。イベントのJSONの値を変数として出力できる。```event```キーをドルマークとして、ドットで繋いでアクセスする。

**＊実装例＊**

入力パスにて、使用する値を抽出する。Amplifyで発生したイベントのJSONを変数として取り出す。JSONのキー名が変数名として動作する。

```yaml
{
  "appId": "$.detail.appId",
  "branchName": "$.detail.branchName",
  "jobId": "$.detail.jobId",
  "jobStatus": "$.detail.jobStatus",
  "region": "$.region"
}
```

入力テンプレートにて、転送するJSONを定義する。例えばここでは、Slackに送信するJSONに出力する。出力する時は、入力パスの変数名を『```<>```』で囲う。Slackに送信するメッセージの作成ツールは、以下のリンクを参考にせよ。

> ℹ️ 参考：https://app.slack.com/block-kit-builder

```yaml
{
  "channel": "foo",
  "text": "Amplifyデプロイ完了通知",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":github: プルリクエスト環境"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "*結果*: <jobStatus>"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "*ブランチ名*: <branchName>"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "*検証URL*: https://<branchName>.<appId>.amplifyapp.com"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": ":amplify: <https://<region>.console.aws.amazon.com/amplify/home?region=<region>#/<appId>/<branchName>/<jobId>|*Amplifyコンソール*"

```

<br>
