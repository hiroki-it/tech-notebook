---
title: 【IT技術の知見】EventBridge＠AWSリソース
description: EventBridge＠AWSリソースの知見を記録しています。
---

# EventBridge＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. EventBridgeとは

AWSリソースで発生したイベントを受信し、他のAWSリソースや外部APIに送信する。

イベントの書き換えロジックがLambdaで実装するほど複雑でない場合に、Lambdaの代わりに使用できる。

<br>

## 02. セットアップ

### パターン

#### ▼ イベント受信対象のAWSリソース

イベント受信対象のAWSリソースは以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/ja_jp/eventbridge/latest/userguide/eb-service-event-list.html

#### ▼ イベントパターン

指定したAWSリソースでイベントが起こると、以下のようなJSONを送信する。

イベントパターンを定義し、JSON構造が一致するイベントのみをターゲットに送信する。

イベントパターンに定義しないキーは任意のデータと見なされる。

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
  # その時々のイベントごとに異なるデータ
  "detail": {},
}
# SNSのデータ
```

**＊実装例＊**

Amplifyの指定したIDのアプリケーションが、`Amplify Deployment Status Change`のイベントを送信し、これの`jobStatus`が`SUCCEED`/`FAILED`だった場合、これを送信する。

```yaml
{
  "detail": {"appId": ["foo", "bar"], "jobStatus": ["SUCCEED", "FAILED"]},
  "detail-type": ["Amplify Deployment Status Change"],
  "source": "aws.amplify",
}
```

> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/CloudWatchEventsandEventPatterns.html

#### ▼ スケジュール

cron式またはrate式を使用して、スケジュールを定義する。

これとLambdaを組み合わせることにより、ジョブを実行できる。

> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html

<br>

### ターゲット

#### ▼ ターゲットの一覧

> - https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-targets.html

#### ▼ デバッグ

EventBridgeでは、どのようなJSONのイベントをターゲットに送信したかを確認できない。

そこで、デバッグ時はEventBridgeのターゲットにLambdaを設定し、イベント構造をログから確認する。

**＊実装例＊**

あらかじめ、イベントの内容を出力する関数をLambdaに作成しておく。

```javascript
// Lambdaにデバッグ用の関数を用意する
exports.handler = async (event) => {
  console.log(JSON.stringify({event}, null, 2));
};
```

対象のAWSリソースで任意のイベントが発生した時に、EventBridgeからLambdaに送信するように設定する。

```yaml
{"source": "aws.amplify"}
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
      "account": "<AWSアカウントID>",
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

入力パスで使用する値を抽出し、入力テンプレートで送信するJSONを定義できる。

イベントのJSONの値を変数として出力できる。

`event`キーをドルマークとして、ドットで繋いでアクセスする。

**＊実装例＊**

入力パスにて、使用する値を抽出する。

Amplifyで発生したイベントのJSONを変数として取り出す。

ここでは、以下のAmplifyのイベントを受信したとする。

```yaml
{
  "event":
    {
      "version": "0",
      "id": "b4a07570-eda1-9fe1-da5e-b672a1705c39",
      "detail-type": "Amplify Deployment Status Change",
      "source": "aws.amplify",
      "account": "<AWSアカウントID>",
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

JSONのキー名が変数名として動作する。

`$`でJSONのルートのキーを指定して、一旦変数を取り出す。

ここでは、`detail`キーを指定する。

```yaml
{
  "appId": "$.detail.appId",
  "branchName": "$.detail.branchName",
  "jobId": "$.detail.jobId",
  "jobStatus": "$.detail.jobStatus",
  "region": "$.region",
}
```

その後入力テンプレートにて、送信するJSONを定義する。例えばここでは、Slackに送信するJSONに出力する。

出力する時は、入力パスの変数名を『`<>`』で囲う。

Slackに送信するメッセージの作成ツールは、以下のリンクを参考にせよ。

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

> - https://app.slack.com/block-kit-builder

<br>
