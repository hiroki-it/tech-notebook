---
title: 【IT技術の知見】AWS Lambda関数＠AWS Lambda
description: AWS Lambda関数＠AWS Lambdaの知見を記録しています。
---

# AWS Lambda関数＠AWS Lambda

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ハンドラ関数

### ハンドラ関数とは

自身から起動することはなく、外部から要求されて実行される関数のこと。

> - https://garop.com/36/

<br>

### AWS Lambdaハンドラ関数

#### ▼ 非同期ハンドラ関数 (Async handlers)

AWS Lambdaはハンドラ関数を非同期関数としてコールし、引数のオブジェクト (event) に値をわたす。

ハンドラ関数の初期名は`handler`メソッドであるが別名でも良い。

`return`または`throw`を使用して、AWS Lambdaのコール元にレスポンスを返信する。

レスポンスとして、Promiseオブジェクトを送信もできる。

**＊実装例＊**

Node.jsの場合を示す。

```javascript
exports.handler = async (event) => {
  const response = {
    statusCode: null,
    body: null,
  };

  response.statusCode = 200;
  response.body = "Hello World!";

  // もしくはthrowを使用して、レスポンスを返信する。
  return response;
};
```

```javascript
const aws = require("aws-sdk");
const s3 = new aws.S3();

exports.handler = async function (event) {
  // Promiseオブジェクトをレスポンスとして送信する。
  return s3.listBuckets().promise();
};
```

```javascript
exports.handler = async (event) => {
  // Promiseオブジェクトをレスポンスとして送信する。
  return new Promise((resolve, reject) => {
    // 何らかの処理
  });
};
```

> - https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html#nodejs-handler-async

#### ▼ 同期ハンドラ関数 (Non-async handlers)

AWS Lambdaはハンドラ関数を同期関数としてコールし、引数 (eventオブジェクト、contextオブジェクト、callback関数) に値をわたす。

このオブジェクトにはメソッドとプロパティを持つ。

ハンドラ関数の初期名は`handler`であるが別名でも良い。

`callback`メソッドを使用して、AWS Lambdaのコール元にPromiseオブジェクトのレスポンスを返信する。

> - https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html#nodejs-handler-sync

(※『Non』が翻訳をおかしくしているため、英語版を推奨)

**＊実装例＊**

Node.jsの場合を示す。

レスポンスを返信するには、`done`メソッド、`succeed`メソッド、`callback`メソッドが必要である。

また、処理を終える場合は`return`で返却する必要がある。

```javascript
exports.handler = (event, context, callback) => {
  // なんらかの処理

  // context以前の処理を待機はしない
  context.done(null /*レスポンス*/);

  // 処理を終える場合
  // return context.done(null, /*レスポンス*/)
};
```

```javascript
exports.handler = (event, context, callback) => {
  // なんらかの処理

  // context以前の処理を待機はしない
  context.succeed(/*レスポンス*/);

  // 処理を終える場合
  // return context.succeed( /*レスポンス*/ )
};
```

```javascript
exports.handler = (event, context, callback) => {
  // なんらかの処理

  // callback以前の処理を待機する。
  callback(null /*レスポンス*/);

  // 処理を終える場合
  // return callback(null, /*レスポンス*/)
};
```

#### ▼ 予約された引数の説明

| 引数                | 説明                                                                                                                       | 補足                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| eventオブジェクト   | HTTPリクエストに関するデータが代入されている。                                                                             | AWS Lambdaにリクエストを送信するAWSリソースごとに、オブジェクトの構造が異なる。構造は以下の通り。<br>・https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html |
| contextオブジェクト | AWS Lambdaに関するデータ (名前、バージョンなど) を取得できるメソッドとプロパティが代入されている。                         | オブジェクトの構造は以下の通り<br>・https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html                                                                     |
| callback関数        | 代入されている関数の実体は不明である。全ての処理が終了するまで実行が待機され、AWS Lambdaのコール元にレスポンスを返信する。 | ・https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html                                                                                                       |

#### ▼ テストとデバッグ

AWS Lambdaで関数を作成すると、AWS CloudWatch Logsのロググループに、『`/aws/lambda/<関数名>`』というグループが自動的に作成される。AWS Lambdaの関数内で発生したエラーや`console.log`メソッドのログはここに出力されるため、都度確認すること。

#### ▼ ベストプラクティス

> - https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html#function-code

<br>

## 02. Goによる実装

### aws-lambda-go

#### ▼ aws-lambda-goとは

Goを使用して、AWS Lambda-APIに対してリクエストを送信し、AWSリソースを操作できる。

> - https://docs.aws.amazon.com/lambda/latest/dg/lambda-golang.html

#### ▼ `Start`関数

Lamda関数を実行するための関数。

`Start`関数に渡すパラメーターには、必ず1つでも`error`インターフェースの実装が含まれている必要がある。

もし含まれていない場合は、AWS Lambdaで内部エラーが起こる。

```go
package main

import (
	"context"
	"fmt"
	"github.com/aws/aws-lambda-go/lambda"
)

type MyEvent struct {
	Name string `json:"name"`
}

// HandleRequest リクエストをハンドリングします。
func HandleRequest(ctx context.Context, name MyEvent) (string, error) {
	return fmt.Sprintf("Hello %s!", name.Name), nil
}

func main() {
	// AWS Lambda関数を実行します。
	lambda.Start(HandleRequest)
}
```

> - https://docs.aws.amazon.com/lambda/latest/dg/golang-handler.html

#### ▼ パラメータ

contextオブジェクトとeventオブジェクトをパラメーターとして使用できる。

> - https://docs.aws.amazon.com/lambda/latest/dg/golang-context.html

<br>

### eventオブジェクトの種類

#### ▼ 全種類

> - https://github.com/aws/aws-lambda-go/tree/master/events#overview

#### ▼ SNSイベントの場合

```go
package main

import (
	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-lambda-go/lambdacontext"
)

/**
 * AWS Lambdaハンドラー関数
 */
func HandleRequest(context context.Context, event events.SNSEvent) (string, error) {

}

func main() {
	lambda.Start(HandleRequest)
}
```

#### ▼ AWS CloudWatchイベントの場合

```go
package main

import (
	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-lambda-go/lambdacontext"
)

/**
 * AWS Lambdaハンドラー関数
 */
func HandleRequest(context context.Context, event events.CloudWatchEvent) (string, error) {

}

func main() {
	lambda.Start(HandleRequest)
}
```

#### ▼ AWS API Gatewayイベントの場合

```go
package main

import (
	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-lambda-go/lambdacontext"
)

/**
 * AWS Lambdaハンドラー関数
 */
func HandleRequest(context context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

}

func main() {
	lambda.Start(HandleRequest)
}
```

<br>

### レスポンス

#### ▼ 正常系

正常系レスポンスの構成要素については以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html#API_Invoke_ResponseElements

文字列を返却すると、AWS Lambdaはその文字列をそのまま返信する。

また、JSONをレスポンスもできる。

> - https://docs.aws.amazon.com/lambda/latest/dg/golang-handler.html#golang-handler-structs

#### ▼ 異常系

AWS Lambdaのエラーレスポンスのステータスコードについては以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html#API_Invoke_Errors

エラーレスポンスのメッセージボディには以下のJSONが割り当てられる。

> - https://docs.aws.amazon.com/lambda/latest/dg/golang-exceptions.html#go-exceptions-createfunction

```yaml
{"errorMessage": "<エラーメッセージ>", "errorType": "<エラータイプ>"}
```

errorsパッケージの`New`関数を使用すると、内部で発生したエラーメッセージをオーバーライドできる。

```go
package main

import (
	"errors"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest() (string, error) {
	return "", errors.New("something went wrong!")
}

func main() {
	lambda.Start(OnlyErrors)
}

/* 結果
{
  "errorMessage": "something went wrong!",
  "errorType": "errorString"
}
*/
```

<br>

### ログ

#### ▼ レポートログ

| 機能名          |                                              |
| --------------- | -------------------------------------------- |
| RequestId       | リクエストID                                 |
| Duration        | イベントの処理時間                           |
| Billed Duration | AWS Lambdaの課金対象の時間                   |
| Memory Size     | AWS Lambdaのメモリサイズ                     |
| Max Memory Used | AWS Lambdaが実際に使用するメモリの最大サイズ |

#### ▼ ログの出力方法

標準パッケージの`fmt`、または任意のロギングパッケージを使用して、標準出力/標準エラー出力に出力する。

AWS CloudWatch Logsにてこれを確認する。

> - https://docs.aws.amazon.com/lambda/latest/dg/golang-logging.html

<br>

## 02-02. 関数例

### Amplify ➡︎ EventBridge ➡︎ AWS Lambda ➡︎ Slack-API

> - https://github.com/hiroki-it/notify-slack-of-amplify-events

<br>

## 03. Node.jsによる実装

### デフォルトで使用できるパッケージ

以下のパッケージでは、npmを使用する必要はない。

パッケージから提供されるパッケージの関数のほとんどが非同期処理として実装されている。

もし後続の処理で非同期処理の結果を使用したい場合、非同期処理の状態をPromiseオブジェクトで管理する必要がある。

| パッケージ名            | 説明                                                                               | 補足                                                                |
| ----------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Node.jsの標準パッケージ | Node.jsにビルトイン関数を使用できる                                                | ・https://nodejs.org/api/index.html                                 |
| aws-sdk.js              | JavaScriptを使用して、AWS-APIに対してリクエストを送信し、AWSリソースを操作できる。 | ・https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html |

> - https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html

<br>

### 非同期処理の成否の管理

#### ▼ Node.jsの標準パッケージの場合

#### ▼ aws-sdk.jsの場合

各AWSオブジェクトのメソッドの後に、`promise`メソッドをチェーンできる。

これにより、各メソッドの非同期処理の成否をPromiseオブジェクトで管理できるようになる。

```javascript
"use strict";

const aws = require("aws-sdk");

/**
 * @param event
 * @returns Promise<json>
 */
exports.handler = async (event) => {
  const ec2 = new aws.EC2({apiVersion: "2014-10-01"});

  // Promiseオブジェクトを返却する
  const ec2Instances = ec2.describeInstances().promise();

  ec2Instances.then(
    (data) => {
      // 非同期処理が成功した時の後続処理
    },
    (error) => {
      // 非同期処理が失敗した時の後続処理
    },
  );
};
```

> - https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/using-promises.html

<br>

## 03-02. 関数例

### Amplify ➡︎ EventBridge ➡︎ AWS Lambda ➡︎ Slack-API

**＊実装例＊**

AmplifyのイベントをEventBridgeでキャッチし、これをAWS Lambdaに転送する。AWS Lambdaでは、メッセージを構成し、Slack-APIに送信する。

```javascript
"use strict";

const aws = require("aws-sdk");
const https = require("https");
const {format} = require("util");

/**
 * @param event
 * @returns Promise<json>
 */
exports.handler = async (event) => {
  console.log(JSON.stringify({event}, null, 2));

  const amplify = new aws.Amplify({apiVersion: "2017-07-25"});

  const option = {
    appId: event.detail.appId,
    branchName: event.detail.branchName,
  };

  let result;

  try {
    // Amplifyのブランチ情報を取得します。
    const app = await amplify.getBranch(option).promise();

    console.log(JSON.stringify({app}, null, 2));

    const message = buildMessage(event, app);

    console.log(message);

    result = await postMessageToSlack(message);
  } catch (error) {
    console.error(error);
  }

  console.log(JSON.stringify({result}, null, 2));

  return result;
};

/**
 * メッセージを作成します。


 *
 * @param event
 * @param app
 * @returns string
 */
const buildMessage = (event, app) => {
  return JSON.stringify({
    channel: process.env.SLACK_CHANNEL_ID,
    text: "develop環境 通知",
    attachments: [
      {
        color: event.detail.jobStatus === "SUCCEED" ? "#00FF00" : "#ff0000",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: format(
                "%s環境",
                event.detail.appId === process.env.AMPLIFY_APP_ID_PC
                  ? ":computer: PC"
                  : ":iphone: SP",
              ),
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: format(
                  "*結果*: %s",
                  event.detail.jobStatus === "SUCCEED" ? "成功" : "失敗",
                ),
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: format("*ブランチ名*: %s", event.detail.branchName),
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: format(
                  "*プルリクエストURL*: https://github.com/foo-repository/compare/%s",
                  event.detail.branchName,
                ),
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: format(
                  "*検証URL*: https://%s.%s.amplifyapp.com",
                  app.branch.displayName,
                  event.detail.appId,
                ),
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: format(
                  ":amplify: <https://%s.console.aws.amazon.com/amplify/home?region=%s#/%s/%s/%s|*Amplifyコンソール画面はこちら*>",
                  event.region,
                  event.region,
                  event.detail.appId,
                  app.branch.displayName,
                  event.detail.jobId,
                ),
              },
            ],
          },
          {
            type: "divider",
          },
        ],
      },
    ],
  });
};

/**
 * メッセージを送信します。


 *
 * @param message
 * @returns Promise<json>
 */
const postMessageToSlack = (message) => {
  // 非同期処理を持つ関数をコンストラクタに渡し、非同期処理を管理します。
  return new Promise((resolve, reject) => {
    const options = {
      host: "slack.com",
      path: "/api/chat.postMessage",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.SLACK_API_TOKEN,
        "Content-Length": Buffer.byteLength(message),
      },
    };

    // 非同期処理
    const request = https.request(options, (response) => {
      console.info({response}, null, 2);

      let tmp;

      // 正常なレスポンスからデータを取り出します。
      response.on("data", (data) => {
        tmp = data;
      });

      // 異常なレスポンスからエラーを取り出します。
      response.on("error", (error) => {
        tmp = error;
      });

      //  data、error、end、の間でawaitの効力は横断できない。
      // そのため、できるだけendで事後処理を実装し、awaitを使用する。
      response.on("end", async () => {
        tmp = param.toString(tmp);
        const body = JSON.parse(tmp);
        const result = {
          statusCode: response.statusCode,
          body: body,
        };
        if (!response.statusCode === 200 || !body.ok) {
          return reject(result);
        }
        return resolve(result);
      });
    });

    request.on("error", (error) => {
      console.error(JSON.stringify({error}, null, 2));
    });

    // メッセージボディを設定して、リクエストを送信します。
    request.write(message);

    request.end();

    console.log(JSON.stringify({request}, null, 2));
  });
};
```

> - https://stackoverflow.com/questions/38533580/nodejs-how-to-promisify-http-request-reject-got-called-two-times
> - https://gist.github.com/ktheory/df3440b01d4b9d3197180d5254d7fb65#file-httppromise-js

<br>

### AWS API Gateway ➡︎ AWS Lambda ➡︎ S3

**＊実装例＊**

AWS API Gatewayでリクエストを受信し、それに応じて特定のデータをS3に保管する。

AWS LambdaがS3に対してアクションを実行できるように、事前に、AWS管理ポリシーの『`LambdaExecute`』が紐付けられたロールをAWS Lambdaに紐付けしておく必要がある。

```javascript
"use strict";

const aws = require("aws-sdk");

const s3 = new aws.S3();

exports.handler = (event, context, callback) => {
  // AWS API Gatewayとのプロキシ統合を意識したJSON構造にする。
  // レスポンスの初期値
  const response = {
    statusCode: null,
    body: null,
  };

  // 認証バリデーション
  if (event.headers["X-API-Key"] !== process.env.X_API_KEY) {
    response.statusCode = 401;
    response.body = "An API key is invalid.";
    return callback(null, response);
  }

  // リクエストバリデーション
  if (!event.headers || !event.body) {
    response.statusCode = 400;
    response.body = "Parameters are not found.";
    return callback(null, response);
  }

  s3.putObject(
    {
      Bucket: "<バケット名>",
      Key: "<パスを含む保管先ファイル>",
      Body: "<保管データ>",
    },
    (err, data) => {
      if (err) {
        response.statusCode = 500;
        response.body = "[ERROR] " + err;
        return callback(null, response);
      }
      response.statusCode = 200;
      response.body = "OK";
      return callback(null, response);
    },
  );
};
```

<br>

### CloudFront ➡︎ AWS Lambda@Edge ➡︎ S3

![lambda-edge_dynamic-origin](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/lambda-edge_dynamic-origin.png)

**＊実装例＊**

eventオブジェクトの`domainName`と`host.value`に代入されたバケットのドメイン名によって、転送先のバケットが決まる。

そのため、この値を切り替えれば動的オリジンを実現できる。

注意点として、各バケットには同じオリジンアクセスアイデンティティを設定する必要がある。

```javascript
"use strict";

exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  // ログストリームに変数を出力する。
  console.log(JSON.stringify({request}, null, 2));

  const headers = request.headers;
  const s3Backet = getBacketBasedOnDeviceType(headers);

  request.origin.s3.domainName = s3Backet;
  request.headers.host[0].value = s3Backet;
  // ログストリームに変数を出力する。
  console.log(JSON.stringify({request}, null, 2));

  return callback(null, request);
};

/**
 * デバイスタイプを基に、オリジンを切り替える。
 *
 * @param   {Object} headers
 * @param   {string} env
 * @returns {string} pcBucket|spBucket
 */
const getBacketBasedOnDeviceType = (headers) => {
  const pcBucket = env + "-bucket.s3.amazonaws.com";
  const spBucket = env + "-bucket.s3.amazonaws.com";

  if (
    headers["cloudfront-is-desktop-viewer"] &&
    headers["cloudfront-is-desktop-viewer"][0].value === "true"
  ) {
    return pcBucket;
  }

  if (
    headers["cloudfront-is-tablet-viewer"] &&
    headers["cloudfront-is-tablet-viewer"][0].value === "true"
  ) {
    return pcBucket;
  }

  if (
    headers["cloudfront-is-mobile-viewer"] &&
    headers["cloudfront-is-mobile-viewer"][0].value === "true"
  ) {
    return spBucket;
  }

  return spBucket;
};
```

オリジンリクエストは、以下のeventオブジェクトのJSON型データにマッピングされている。

注意点として、一部のキーは省略している。

```yaml
{
  "Records":
    [
      {
        "cf":
          {
            "request":
              {
                "body":
                  {
                    "action": "read-only",
                    "data": "",
                    "encoding": "base64",
                    "inputTruncated": "false",
                  },
                "clientIp": "*.*.*.*",
                "headers":
                  {
                    "host":
                      [
                        {
                          "key": "Host",
                          "value": "sp-bucket.s3.ap-northeast-1.amazonaws.com",
                        },
                      ],
                    "cloudfront-is-mobile-viewer":
                      [{"key": "CloudFront-Is-Mobile-Viewer", "value": "true"}],
                    "cloudfront-is-tablet-viewer":
                      [{"key": "loudFront-Is-Tablet-Viewer", "value": "false"}],
                    "cloudfront-is-smarttv-viewer":
                      [
                        {
                          "key": "CloudFront-Is-SmartTV-Viewer",
                          "value": "false",
                        },
                      ],
                    "cloudfront-is-desktop-viewer":
                      [
                        {
                          "key": "CloudFront-Is-Desktop-Viewer",
                          "value": "false",
                        },
                      ],
                    "user-agent":
                      [{"key": "User-Agent", "value": "Amazon CloudFront"}],
                  },
                "method": "GET",
                "origin":
                  {
                    "s3":
                      {
                        "authMethod": "origin-access-identity",
                        "customHeaders":
                          {"env": [{"key": "env", "value": "prd"}]},
                        "domainName": "sp-bucket.s3.amazonaws.com",
                        "path": "",
                        "port": 443,
                        "protocol": "https",
                        "region": "ap-northeast-1",
                      },
                  },
                "querystring": "",
                "uri": "/images/12345",
              },
          },
      },
    ],
}
```

<br>
