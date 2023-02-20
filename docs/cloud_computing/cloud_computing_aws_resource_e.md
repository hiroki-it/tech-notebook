---
title: 【IT技術の知見】Eで始まるAWSリソース＠AWS
description: Eで始まるAWSリソース＠AWSの知見を記録しています。
---

# `E`で始まるAWSリソース＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ECR

### ECRとは

コンテナイメージやhelmチャートを管理できる。

<br>

### セットアップ

#### ▼ コンソール画面

| 設定項目                 | 説明                                                                                                             | 補足                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 可視性                   | イメージリポジトリをパブリックあるいはプライベートにするかを設定する。                                           | 様々なベンダーがパブリックリポジトリでECRイメージを提供している。<br>↪️ 参考：https://gallery.ecr.aws/ |
| タグのイミュータビリティ | 同じタグ名でイメージがプッシュされた場合、バージョンタグを上書きできる/できないかを設定できる。                  | -                                                                                                      |
| プッシュ時にスキャン     | イメージがプッシュされた時に、コンテナイメージにインストールされているパッケージの脆弱性を検証し、一覧表示する。 | ↪️ 参考：https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html                    |
| 暗号化設定               | -                                                                                                                | -                                                                                                      |

<br>

### イメージのプッシュ

#### ▼ コンテナイメージの場合

> ↪️ 参考：https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html

`【１】`

: ECRにログインする。

```bash
$ aws ecr get-login-password --region ap-northeast-1 | docker login \
    --username AWS \
    --password-stdin <イメージリポジトリURL>

Login Succeeded
```

`【２】`

: イメージにタグを付与する。

```bash
# docker tag foo:latest <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
$ docker tag <イメージID> <イメージリポジトリURL>:<バージョンタグ>
```

`【３】`

: ECRにコンテナイメージをプッシュする。

```bash
# docker push <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
$ docker push <イメージリポジトリURL>:<バージョンタグ>
```

#### ▼ helmチャートの場合

> ↪️ 参考：https://docs.aws.amazon.com/AmazonECR/latest/userguide/push-oci-artifact.html

<br>

### ライフサイクル

#### ▼ ライフサイクルポリシー

ECRのコンテナイメージの有効期間を定義できる。

| 設定項目             | 説明                                                                               | 補足                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ルールの優先順位     | 数字で、ルールの優先度を設定できる。                                               | 数字が小さいほど、優先度は高くなる。数字は連続している必要はなく、例えば、`10`、`20`、`90`、のように設定しても良い。 |
| イメージのステータス | ルールを適用するイメージの条件として、タグの有無や文字列を設定できる。             |                                                                                                                      |
| 一致条件             | イメージの有効期間として、同条件に当てはまるイメージが削除される閾値を設定できる。 | 個数、プッシュされてからの期間、などを閾値として設定できる。                                                         |

<br>

### バージョンタグ

#### ▼ タグ名のベストプラクティス

Dockerのベストプラクティスに則り、タグ名にlatestを使用しないようにする。

代わりとして、コンテナイメージのバージョンごとに異なるタグ名になるようハッシュ値 (例：GitHubのコミットID) を使用する。

> ↪️ 参考：https://matsuand.github.io/docs.docker.jp.onthefly/develop/dev-best-practices/

<br>

## 02. EventBridge (CloudWatchイベント)

### EventBridge (CloudWatchイベント) とは

AWSリソースで発生したイベントを、他のAWSリソースに転送する。

サポート対象のAWSリソースは以下のリンクを参考にせよ。

> ↪️ 参考：https://docs.aws.amazon.com/eventbridge/latest/userguide/what-is-amazon-eventbridge.html

<br>

### パターン

#### ▼ イベントパターン

指定したAWSリソースでイベントが起こると、以下のようなJSONを送信する。

イベントパターンを定義し、JSON構造が一致するイベントのみをターゲットに転送する。

イベントパターンに定義しないキーは任意のデータと見なされる。

> ↪️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/CloudWatchEventsandEventPatterns.html

```yaml
{
  "version": "0",
  "id": "*****",
  "detail-type": "<イベント名>",
  "source": "aws.<AWSリソース名>",
  "account": "*****",
  "time": "2021-01-01T00:00:00Z",
  "region": "us-west-1",
  "resources": ["<イベントを起こしたリソースのARN>"],
  "detail": { // その時々のイベントごとに異なるデータ },
}
```

**＊実装例＊**

Amplifyの指定したIDのアプリケーションが、`Amplify Deployment Status Change`のイベントを送信し、これの`jobStatus`が`SUCCEED`/`FAILED`だった場合、これを転送する。

```yaml
{
  "detail": { "appId": ["foo", "bar"], "jobStatus": ["SUCCEED", "FAILED"] },
  "detail-type": ["Amplify Deployment Status Change"],
  "source": "aws.amplify",
}
```

#### ▼ スケジュール

cron式またはrate式を使用して、スケジュールを定義する。

これとLambdaを組み合わせることにより、ジョブを実行できる。

> ↪️ 参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html

<br>

### ターゲット

#### ▼ ターゲットの一覧

> ↪️ 参考：https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-targets.html

#### ▼ デバッグ

EventBridgeでは、どのようなJSONのイベントをターゲットに転送したかを確認できない。

そこで、デバッグ時はEventBridgeのターゲットにLambdaを設定し、イベント構造をログから確認する。

**＊実装例＊**

あらかじめ、イベントの内容を出力する関数をLambdaに作成しておく。

```javascript
// Lambdaにデバッグ用の関数を用意する
exports.handler = async (event) => {
  console.log(JSON.stringify({ event }, null, 2));
};
```

対象のAWSリソースで任意のイベントが発生した時に、EventBridgeからLambdaに転送するように設定する。

```yaml
{ "source": "aws.amplify" }
```

AWSリソースで意図的にイベントを起こし、Lambdaのロググループから内容を確認する。

`detail`キーにイベントが割り当てられている。

```yaml
{
  "event":
    {
      "version": "0",
      "id": "b4a07570-eda1-9fe1-da5e-b672a1705c39",
      "detail-type": "Amplify Deployment Status Change",
      "source": "aws.amplify",
      "account": "<アカウントID>",
      "time": "<イベントの発生時間>",
      "region": "ap-northeast-1",
      "resources": ["<AmplifyのアプリケーションのARN>"],
      "detail":
        {
          "appId": "<アプリケーションID>",
          "branchName": "<ブランチ名>",
          "jobId": "<ジョブID>",
          "jobStatus": "<CI/CDパイプラインのステータス>",
        },
    },
}
```

<br>

### 入力

#### ▼ 入力トランスフォーマー

入力パスで使用する値を抽出し、入力テンプレートで転送するJSONを定義できる。

イベントのJSONの値を変数として出力できる。

`event`キーをドルマークとして、ドットで繋いでアクセスする。

**＊実装例＊**

入力パスにて、使用する値を抽出する。

Amplifyで発生したイベントのJSONを変数として取り出す。

JSONのキー名が変数名として動作する。

```yaml
{
  "appId": "$.detail.appId",
  "branchName": "$.detail.branchName",
  "jobId": "$.detail.jobId",
  "jobStatus": "$.detail.jobStatus",
  "region": "$.region",
}
```

入力テンプレートにて、転送するJSONを定義する。例えばここでは、Slackに送信するJSONに出力する。出力する時は、入力パスの変数名を『`<>`』で囲う。Slackに送信するメッセージの作成ツールは、以下のリンクを参考にせよ。

> ↪️ 参考：https://app.slack.com/block-kit-builder

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
