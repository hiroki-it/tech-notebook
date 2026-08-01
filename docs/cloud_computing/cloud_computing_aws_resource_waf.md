---
title: 【IT技術の知見】AWS WAF＠AWSリソース
description: AWS WAF＠AWSリソース
---

# AWS WAF＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS WAF とは：Web Application Firewall

`L7` (アプリケーション層) に対するサイバー攻撃を防御する。

| サイバー攻撃の種類 | 対抗する AWS リソースの種類                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| マルウェア         | なし                                                                                                  |
| 傍受、情報漏洩     | Amazon VPC 内の特にプライベートサブネット間のピアリング接続。VPC 外を介さずにパケットを送受信できる。 |
| ポートスキャン     | セキュリティグループ                                                                                  |
| DDoS               | AWS Shield                                                                                            |
| ゼロディ           | AWS WAF                                                                                               |
| インジェクション   | AWS WAF                                                                                               |
| XSS                | AWS WAF                                                                                               |
| データ漏洩         | AWS KMS、AWS CloudHSM                                                                                 |
| 組織内部での裏切り | AWS IAM                                                                                               |

<br>

## 02. セットアップ (コンソールの場合)

## 2-02. セットアップ (Terraform の場合)

```terraform
# 記入中...
```

### 設定項目

| 設定項目           | 説明                                               | 補足                                                                                                                                                                                                                                                                                                                                                              |
| ------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web ACLs           | アクセス許可と拒否のルールを定義する。             | 紐付ける AWS リソースに合わせて、作成するリージョンを切り替える必要がある。                                                                                                                                                                                                                                                                                       |
| Bot Control        | Bot に関するアクセス許可と拒否のルールを定義する。 |                                                                                                                                                                                                                                                                                                                                                                   |
| IP Sets            | IP アドレスの共通部品を管理する。                  | アクセスを許可したい IP アドレスセットを作成するとき、すべての IP アドレスを `1` 個のセットで管理してしまうと、何の IP アドレスかわらなあくなってしまう。そこで、許可する IP アドレスのセットを種類 (例：自社のグローバル IP アドレス、外部の協力 A 社/B 社のグローバル IP アドレスなど) で分割するとよい。一方で、拒否する IP アドレスはひとまとめにしてもよい。 |
| Regex pattern sets | 正規表現パターンの共通部品を管理する。             | 許可/拒否する文字列は、意味合いに沿って異なる文字列セット (例：ユーザーエージェントセット、リクエストパスセットなど) として作成する必要がある。                                                                                                                                                                                                                   |
| Rule groups        | ルールの共通部品を管理する。                       | 各 AWS WAF に同じルールを設定する場合、ルールグループを使用する必要がある。ただし、ルールグループを使用すると、これらのルールを共通のメトリクスで監視しなければならなくなる。そのため、もしメトリクスを分けるのであれば、ルールグループを使用しないようにする。                                                                                                   |

<br>

### Web ACLs

| 設定項目                 | 説明                                                                                                                         | 補足                                                                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview                 | AWS WAF によって許可/拒否されたリクエストのアクセスログを確認できる。                                                        |                                                                                                                                                         |
| Rules                    | 順番にルールを判定し、一致するルールがあればアクションを実行する。このとき、一致するルールの後にあるルールは。判定されない。 | AWS マネージドルールについては、以下のリンクを参考にせよ。<br>- https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list.html |
| Associated AWS resources | AWS WAF を紐付ける AWS リソースを設定する。                                                                                  | Amazon CloudFront、AWS ALB などに紐付けできる。                                                                                                         |
| Logging and metrics      | アクセスログを Kinesis Data Firehose に出力するように設定する。                                                              |                                                                                                                                                         |

### Overview における Sampled requests の見方

『すべてのルール』または『各ルール』のアクセス許可/拒否の履歴を確認できる。

AWS ALB や Amazon CloudFront のアクセスログよりも解りやすく、さまざまなデバッグに役立つ。

ただし、３時間分しか残らない。

一例として、Amazon CloudFront に紐付けした AWS WAF で取得できるログを以下に示す。

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
# CORS であるか否か
Sec-Fetch-Site: same-origin
Accept-Encoding: gzip, deflate, br
Accept-Language: ja,en;q=0.9
# Cookie ヘッダー
Cookie: sessionid=<セッションID>; _gid=<GoogleAnalytics値>; __ulfpc=<GoogleAnalytics値>; _ga=<GoogleAnalytics値>
```

<br>

### ルール

#### ▼ ルールの種類

| 種類                             | 説明                                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| カスタムルール                   |                                                                                                                                                      |
| マネージドルール                 | AWS が事前に用意している防御ルールで、よくある `L7` に対するサイバー攻撃（例：SQL インジェクション、XSS、OS コマンドインジェクション）を防御できる。 |
| カスタムルールグループ           |                                                                                                                                                      |
| マーケットプレイスルールグループ |                                                                                                                                                      |

#### ▼ ルールの粒度のコツ

わかりやすさの観点から、できる限り設定するステートメントを少なくし、`1` 個のルールに `1` 個の意味合いのみを持たせるように命名する。

#### ▼ Count (検知) モード

ルールに該当するリクエスト数を数え、許可/拒否せずに次のルールを検証する。

計測結果に応じて、Count モードを無効化し、拒否できるようにする。

> - https://oji-cloud.net/2020/09/18/post-5501/

#### ▼ ルールグループアクションの上書き

ルールの Count モードを有効化している場合、Count アクションに続けて、そのルールに設定されていた元のアクションを実行する。

そのため、Count アクションしつつ、Block アクションを実行できる (仕様がややこしすぎるので、なんとかしてほしい) 。

| マネージドルールの元のアクション | Count モード | 上書きオプション | 結果                                                                                                                              |
| -------------------------------- | ------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Block                            | ON           | ON               | Count し、その後 Block が実行する。そのため、その後のルールは検証せずに完了する。                                                 |
| Block                            | ON           | OFF              | Count のみが実行される。そのため、その後のルールも検証する。                                                                      |
| Block                            | OFF          | ON               | そもそも Count モードが無効なため、上書きオプションは能力せずに、Block が実行される。                                             |
| Block                            | OFF          | OFF              | そもそも Count モードが無効なため、マネージドルールの Block が実行される (と思っていたが、結果として Count として動作する模様) 。 |

> - https://docs.aws.amazon.com/waf/latest/developerguide/web-acl-rule-group-override-options.html

#### ▼ セキュリティグループとの関係

AWS WAF を紐付けられるリソースにセキュリティグループも紐付けている場合、セキュリティグループのルールが先に検証される。

例えば、AWS WAF を AWS ALB に紐付け、かつ AWS ALB のセキュリティグループに HTTPS プロトコルのルールを設定した場合、後者が先に検証される。

両方にルールが定義されてると混乱を生むため、HTTP プロトコルや HTTPS プロトコルに関するルールは AWS WAF に定義し、それ以外のプロトコルに関するルールはセキュリティグループで定義するようにしておく。

> - https://dev.classmethod.jp/articles/waf-alb_evaluation-sequence/

<br>

### ログ

#### ▼ マネージドルールのログ

AWS WAF マネージドルールを採用している場合、マネージドルールが `ruleGroupList` キーに配列として格納されている。

もし、Count アクションが実行されていれば、`excludedRules` キーにその旨とルール ID が格納される。

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
