---
title: 【IT技術の知見】AWS WAF＠AWSリソース
description: AWS WAF＠AWSリソース
---

# AWS WAF＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS WAFとは：Web Application Firewall

`L7` (アプリケーション層) に対するサイバー攻撃を防御する。

| サイバー攻撃の種類 | 対抗するAWSリソースの種類                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| マルウェア         | なし                                                                                             |
| 傍受、情報漏洩     | AWS VPC内の特にプライベートサブネット間のピアリング接続。VPC外を介さずにパケットを送受信できる。 |
| ポートスキャン     | セキュリティグループ                                                                             |
| DDoS               | AWS Shield                                                                                       |
| ゼロディ           | AWS WAF                                                                                          |
| インジェクション   | AWS WAF                                                                                          |
| XSS                | AWS WAF                                                                                          |
| データ漏洩         | AWS KMS、AWS CloudHSM                                                                            |
| 組織内部での裏切り | AWS IAM                                                                                          |

<br>

## 02. セットアップ

### コンソール画面の場合

| 設定項目           | 説明                                              | 補足                                                                                                                                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Web ACLs           | アクセス許可と拒否のルールを定義する。            | 紐付けるAWSリソースに合わせて、作成するリージョンを切り替える必要がある。                                                                                                                                                                                                                                                                  |
| Bot Control        | Botに関するアクセス許可と拒否のルールを定義する。 |                                                                                                                                                                                                                                                                                                                                            |
| IP Sets            | IPアドレスの共通部品を管理する。                  | アクセスを許可したいIPアドレスセットを作成する時、全てのIPアドレスを`1`個のセットで管理してしまうと、何のIPアドレスかわらなあくなってしまう。そこで、許可するIPアドレスのセットを種類 (例：自社のグローバルIPアドレス、外部の協力A社/B社のグローバルIPアドレスなど) で分割すると良い。一方で、拒否するIPアドレスはひとまとめにしても良い。 |
| Regex pattern sets | 正規表現パターンの共通部品を管理する。            | 許可/拒否する文字列は、意味合いに沿って異なる文字列セット (例：ユーザーエージェントセット、リクエストパスセットなど) として作成する必要がある。                                                                                                                                                                                            |
| Rule groups        | ルールの共通部品を管理する。                      | 各AWS WAFに同じルールを設定する場合、ルールグループを使用する必要がある。ただし、ルールグループを使用すると、これらのルールを共通のメトリクスで監視しなければならなくなる。そのため、もしメトリクスを分けるのであれば、ルールグループを使用しないようにする。                                                                              |

<br>

### Web ACLs

| 設定項目                 | 説明                                                                                                                       | 補足                                                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Overview                 | AWS WAFによって許可/拒否されたリクエストのアクセスログを確認できる。                                                       |                                                                                                                                                        |
| Rules                    | 順番にルールを判定し、一致するルールがあればアクションを実行する。この時、一致するルールの後にあるルールは。判定されない。 | AWSマネージドルールについては、以下のリンクを参考にせよ。<br>- https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list.html |
| Associated AWS resources | AWS WAFを紐付けるAWSリソースを設定する。                                                                                   | AWS CloudFront、AWS ALBなどに紐付けできる。                                                                                                            |
| Logging and metrics      | アクセスログをKinesis Data Firehoseに出力するように設定する。                                                              |                                                                                                                                                        |

### OverviewにおけるSampled requestsの見方

『全てのルール』または『各ルール』におけるアクセス許可/拒否の履歴を確認できる。

AWS ALBやAWS CloudFrontのアクセスログよりも解りやすく、さまざまなデバッグに役立つ。

ただし、３時間分しか残らない。

一例として、AWS CloudFrontに紐付けしたAWS WAFで取得できるログを以下に示す。

```yaml
GET /foo/
---
# ホスト
Host: foo.example.com
Upgrade-Insecure-Requests: 1
# ユーザーエージェント
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
# CORSであるか否か
Sec-Fetch-Site: same-origin
Accept-Encoding: gzip, deflate, br
Accept-Language: ja,en;q=0.9
# Cookieヘッダー
Cookie: sessionid=<セッションID>; _gid=<GoogleAnalytics値>; __ulfpc=<GoogleAnalytics値>; _ga=<GoogleAnalytics値>
```

<br>

### ルール

#### ▼ ルールの種類

| ルール名     | 説明                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| レートベース | 同じ送信元IPアドレスからの５分間当たりのリクエストの上限数をルールに付与する。 |
| レギュラー   | リクエスト数は制限しない。                                                     |

> - https://docs.aws.amazon.com/waf/latest/developerguide/classic-web-acl-rules-creating.html

#### ▼ ルールの粒度のコツ

わかりやすさの観点から、できる限り設定するステートメントを少なくし、`1`個のルールに`1`個の意味合いのみを持たせるように命名する。

#### ▼ Count (検知) モード

ルールに該当するリクエスト数を数え、許可/拒否せずに次のルールを検証する。

計測結果に応じて、Countモードを無効化し、拒否できるようにする。

> - https://oji-cloud.net/2020/09/18/post-5501/

#### ▼ ルールグループアクションの上書き

ルールのCountモードを有効化している場合、Countアクションに続けて、そのルールの元のアクションを実行する。

そのため、Countアクションしつつ、Blockアクションを実行できる (仕様がややこしすぎるので、なんとかしてほしい) 。

| マネージドルールの元のアクション | Countモード | 上書きオプション | 結果                                                                                                                        |
| -------------------------------- | ----------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Block                            | ON          | ON               | Countし、その後Blockが実行する。そのため、その後のルールは検証せずに完了する。                                              |
| Block                            | ON          | OFF              | Countのみが実行される。そのため、その後のルールも検証する。                                                                 |
| Block                            | OFF         | ON               | そもそもCountモードが無効なため、上書きオプションは能力せずに、Blockが実行される。                                          |
| Block                            | OFF         | OFF              | そもそもCountモードが無効なため、マネージドルールのBlockが実行される (と思っていたが、結果としてCountとして動作する模様) 。 |

> - https://docs.aws.amazon.com/waf/latest/developerguide/web-acl-rule-group-override-options.html

#### ▼ セキュリティグループとの関係

AWS WAFを紐付けられるリソースにセキュリティグループも紐付けている場合、セキュリティグループのルールが先に検証される。

例えば、AWS WAFをAWS ALBに紐付け、かつAWS ALBのセキュリティグループにHTTPSプロトコルのルールを設定した場合、後者が先に検証される。

両方にルールが定義されてると混乱を生むため、HTTPプロトコルやHTTPSプロトコルに関するルールはAWS WAFに定義し、それ以外のプロトコルに関するルールはセキュリティグループで定義するようにしておく。

> - https://dev.classmethod.jp/articles/waf-alb_evaluation-sequence/

<br>

### ログ

#### ▼ マネージドルールのログ

AWS WAFマネージドルールを採用している場合、マネージドルールが`ruleGroupList`キーに配列として格納されている。

もし、Countアクションが実行されていれば、`excludedRules`キーにその旨とルールIDが格納される。

```yaml
{
  "ruleGroupList":
    [
      {
        "ruleGroupId": "AWS#AWSManagedRulesCommonRuleSet#Version_1.2",
        "terminatingRule": null,
        "nonTerminatingMatchingRules": [],
        "excludedRules":
          [
            {
              "exclusionType": "EXCLUDED_AS_COUNT",
              "ruleId": "NoUserAgent_HEADER",
            },
          ],
      },
      {
        "ruleGroupId": "AWS#AWSManagedRulesSQLiRuleSet#Version_1.1",
        "terminatingRule": null,
        "nonTerminatingMatchingRules": [],
        "excludedRules": null,
      },
      {
        "ruleGroupId": "AWS#AWSManagedRulesPHPRuleSet#Version_1.1",
        "terminatingRule": null,
        "nonTerminatingMatchingRules": [],
        "excludedRules": null,
      },
      {
        "ruleGroupId": "AWS#AWSManagedRulesKnownBadInputsRuleSet#Version_1.1",
        "terminatingRule": null,
        "nonTerminatingMatchingRules": [],
        "excludedRules": null,
      },
    ],

  ...,
}
```

### クオータ

定義できるルール数や文字数に制限がある。

以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/waf/latest/developerguide/limits.html

<br>
