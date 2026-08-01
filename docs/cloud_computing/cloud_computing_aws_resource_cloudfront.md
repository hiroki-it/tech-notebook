---
title: 【IT技術の知見】Amazon CloudFront＠AWSリソース
description: Amazon CloudFront＠AWSリソースの知見を記録しています。
---

# Amazon CloudFront＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Amazon CloudFront とは

CDN (グローバルなキャッシュサーバー) かつクラウドリバースプロキシサーバーとして働く。

リバースプロキシでもあるため、Amazon CloudFront の後段にアプリケーションをおけば、アプリケーションをそのまま公開できる。

VPC の外側 (パブリックネットワーク) に配置されている。

オリジンサーバー (コンテンツ提供元) を S3 とした場合、動的コンテンツに対するリクエストを EC2 に振り分ける。

また、静的コンテンツに対するリクエストをキャッシュし、そのうえで S3 へ振り分ける。

次回以降の静的コンテンツのリンクエストは、Amazon CloudFront がレンスポンスを実行する。

![AWS のクラウドデザイン一例](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Amazon CloudFront によるリクエストの振り分け.png)

<br>

## 02. セットアップ

### Distributions

#### ▼ Distributions

| 設定項目                 | 説明                                                                      | 補足 |
| ------------------------ | ------------------------------------------------------------------------- | ---- |
| General                  |                                                                           |      |
| Origin and Origin Groups | コンテンツを提供する AWS リソースを設定する。                             |      |
| Behavior                 | オリジンにリクエストが行われたときの Amazon CloudFront の挙動を設定する。 |      |
| ErrorPage                | 指定したオリジンから、指定したファイルを含むレスポンスを返信する。        |      |
| Restriction              |                                                                           |      |
| Invalidation             | Amazon CloudFront に保管されているキャッシュを削除できる。                |      |

> - https://www.geekfeed.co.jp/geekblog/wordpress%E3%81%A7%E6%A7%8B%E7%AF%89%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%82%8B%E3%82%A6%E3%82%A7%E3%83%96%E3%82%B5%E3%82%A4%E3%83%88%E3%81%ABcloudfront%E3%82%92%E7%AB%8B%E3%81%A6%E3%81%A6%E9%AB%98/

#### ▼ General

| 設定項目            | 説明                                                                                                                                            | 補足                                                                                                                                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Price Class         | 使用するエッジロケーションを設定する。                                                                                                          | Asia が含まれているものを選択。                                                                                                                                                                                                                             |
| AWS WAF             | Amazon CloudFront に紐付ける AWS WAF を設定する。                                                                                               |                                                                                                                                                                                                                                                             |
| CNAME               | Amazon CloudFront のデフォルトドメイン名 (`<発行されたランダム文字列>.cloudfront.net.`) に紐付ける DNS レコード名を設定する。                   | ・Amazon Route 53 からルーティングする場合は必須。<br>・複数のレコード名を設定できる。                                                                                                                                                                      |
| SSL Certificate     | HTTPS プロトコルでオリジンにルーティングする場合に設定する。                                                                                    | 上述の CNAME を設定した場合、サーバー証明書が別途必要になる。また、Certificate Manager を使用する場合、この証明書は『バージニア北部』で申請する必要がある。                                                                                                 |
| Security Policy     | リクエストの送信者が使用する SSL/TLS プロトコルや暗号化方式のバージョンに合わせて、Amazon CloudFront が受信できるこれらのバージョンを設定する。 | ・リクエストの送信者には、ブラウザ、API にリクエストを送信する外部サービス、ルーティング元の AWS リソースなどを含む。<br>・- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html  |
| Default Root Object | オリジンのドキュメントルートを設定する。                                                                                                        | ・何も設定しない場合、ドキュメントルートは指定されず、Behavior で明示的にルーティングする必要がある。<br>・index.html を設定すると、『`/`』でリクエストしたときに、オリジンのルートディレクトリ配下にある `index,html` ファイルがドキュメントルートになる。 |
| Standard Logging    | Amazon CloudFront のアクセスログを S3 に作成するか否かを設定する。                                                                              |                                                                                                                                                                                                                                                             |

#### ▼ Origin and Origin Groups

| 設定項目               | 説明                                                                                                                                                       | 補足                                                                                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Origin Domain Name     | Amazon CloudFront をリバースプロキシサーバーとして、AWS リソースのエンドポイントや DNS にルーティングする。                                                | ・例えば、S3 のエンドポイント、ALB の DNS 名を設定する。<br>・別アカウントの AWS リソースの DNS 名であってもよい。                                                                                     |
| Origin Path            | オリジンのルートディレクトリを設定する。                                                                                                                   | ・何も設定しないと、デフォルトは『`/`』のなる。Behavior では、『`/`』の後にパスが追加される。<br>・『`/var/www/foo`』を設定すると、Behavior で設定したパスが『`/var/www/foo/foo`』のように追加される。 |
| Origin Access Identity | リクエストのルーティング先となる AWS リソースで認可スコープの紐付けが必要な場合に設定する。ルーティング先の AWS リソースでは、アクセスポリシーを紐付ける。 | Amazon CloudFront が S3 に対して読み出しを実行するために必要。                                                                                                                                         |
| Origin Protocol Policy | リクエストのルーティング先となる AWS リソースへ、HTTP と HTTPS プロトコルのいずれでルーティングするかを設定する。                                      | ・ALB で必要。ALB のリスナーのプロトコルに合わせて設定する。<br>・`HTTP Only`：HTTP プロトコルでルーティング<br>・`HTTPS Only`：HTTPS プロトコルでルーティング<br>・`Match Viewer`：両方でルーティング |
| HTTP ポート            | ルーティング時に指定するオリジンの HTTP リクエストのポート番号                                                                                             |                                                                                                                                                                                                        |
| HTTPS ポート           | ルーティング時に指定するオリジンの HTTPS リクエストのポート番号                                                                                            |                                                                                                                                                                                                        |

#### ▼ Behavior

| 設定項目                       | 説明                                                                                      | 補足                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Precedence                     | 処理の優先順位。                                                                          | 最初に作成した Behavior が『`Default (*)`』となり、これは後から変更できないため、主要な Behavior をまず最初に設定する。                                                                                                                                                                                                              |
| Path pattern                   | Behavior を実行するパスを設定する。                                                       |                                                                                                                                                                                                                                                                                                                                      |
| Origin and Origin Group        | Behavior を実行するオリジンを設定する。                                                   |                                                                                                                                                                                                                                                                                                                                      |
| Viewer Protocol Policy         | HTTP/HTTPS プロトコルのどちらを受信するか、またどのように変換してルーティングするかを設定 | ・`HTTP and HTTPS`：両方受信し、そのままルーティング<br>・`Redirect HTTP to HTTPS`：両方受信し、HTTPS プロトコルでルーティング<br>・`HTTPS Only`：HTTPS プロトコルのみ受信し、HTTPS プロトコルでルーティング                                                                                                                         |
| Allowed HTTP Methods           | リクエストの HTTP メソッドのうち、オリジンへのルーティングを許可するものを設定            | ・パスパターンが静的ファイルに対するリクエストの場合、GET リクエストのみ許可。<br>・パスパターンが動的ファイルに対するリクエストの場合、すべてのメソッドを許可。                                                                                                                                                                     |
| Object Caching                 | Amazon CloudFront にコンテンツのキャッシュを保管しておく秒数を設定する。                  | ・Origin Cache ヘッダーを選択した場合、アプリケーションからのレスポンスヘッダーの `Cache-Control` ヘッダーの値が適用される。<br>・カスタマイズを選択した場合、ブラウザの TTL とは別に設定できる。                                                                                                                                    |
| TTL                            | Amazon CloudFront にキャッシュを保管しておく秒数を詳細に設定する。                        | ・Min、Max、Default のすべてを `0` 秒とすると、キャッシュを無効化できる。<br>・『Headers = All』としている場合、キャッシュが実質無効となるため、最小 TTL はゼロである必要がある。<br>・キャッシュの最終的な有効期間は、Amazon CloudFront の TTL 秒の設定、`Cache-Control` ヘッダー、`Expires` ヘッダー値の組み合わせによって決まる。 |
| Whitelist Header               | Headers を参考にせよ。                                                                    | ・`Accept-*****`：アプリケーションにレスポンスしてほしいデータの種類 (データ型など) を指定。<br>・ `CloudFront-Is-*****-Viewer`：デバイスタイプの boolean 値が格納されている。<br>- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html#ExpirationDownloadDist                                        |
| Restrict Viewer Access         | クライアント側を制限するか否かを設定できる。                                              | セキュリティグループで制御できるため、ここでは設定しなくてよい。                                                                                                                                                                                                                                                                     |
| Compress Objects Automatically | レスポンス時に `gzip` ファイルとして圧縮するか否かを設定                                  | ・クライアントからのリクエストヘッダーの Accept-Encoding に gzip が設定されている場合、レスポンス時に、gzip 形式で圧縮して送信するか否かを設定する。設定しない場合、圧縮せずにレスポンスを返信する。<br>・クライアント側のダウンロード速度向上のため、基本的には有効化する。                                                         |

#### ▼ オリジンに対するリクエストの構造

Amazon CloudFront からオリジンに送信されるリクエストの構造例を以下に示す。

```yaml
GET /foo/
---
# リクエストされたドメイン名
Host: foo.example.com
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1
Authorization: Bearer <Bearerトークン>
X-Amz-Cf-Id: *****
Via: 2.0 <発行されたランダム文字列>.cloudfront.net (Amazon CloudFront)
# 各 Cookie ヘッダーの値 (二回目のリクエスト時に設定される)
Cookie: sessionid=<セッションID>; __ulfpc=<GoogleAnalytics値>; _ga=<GoogleAnalytics値>; _gid=<GoogleAnalytics値>
# 送信元 IP アドレス
# ※プロキシ (AWS ALB や Amazon CloudFront なども含む) を経由している場合、それら全ての IP アドレスが順に設定される
X-Forwarded-For: <client>, <proxy1>, <proxy2>
Accept-Language: ja,en;q=0.9
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Accept-Encoding: gzip, deflate, br
pragma: no-cache
cache-control: no-cache
upgrade-insecure-requests: 1
sec-fetch-site: none
sec-fetch-mode: navigate
sec-fetch-user: ?1
sec-fetch-dest: document
# デバイスタイプ
CloudFront-Is-Mobile-Viewer: "true"
CloudFront-Is-Tablet-Viewer: "false"
CloudFront-Is-SmartTV-Viewer: "false"
CloudFront-Is-Desktop-Viewer: "false"
# クライアント側の国名
CloudFront-Viewer-Country: JP
# リクエストのプロトコル
CloudFront-Forwarded-Proto: https
```

#### ▼ Amazon CloudFront とオリジン間の HTTPS プロトコル

Amazon CloudFront とオリジン間で HTTPS プロトコルを使用する場合、両方にサーバー証明書を割り当てる必要がある。

割り当てたとしても、以下の条件を満たさない限り、HTTPS プロトコルは使用できない。

CLoudFront からオリジンに `Host` ヘッダーをルーティングしない設定の場合、オリジンが返却する証明書に『Origin Domain Name』と一致するドメイン名が含まれている必要がある。

一方で、`Host` ヘッダーをルーティングしない場合、オリジンが返却する証明書に『Origin Domain Name』と一致するドメイン名が含まれているか、またはオリジンが返却する証明書に、`Host` ヘッダー値と一致するドメイン名が含まれている必要がある。

<br>

### Reports & analytics

#### ▼ Cache statistics

リクエストに関連するさまざまなデータを、日付別に集計したものを確認できる。

#### ▼ Popular objects

リクエストに関連するさまざまなデータを、オブジェクト別に集計したものを確認できる。

<br>

## 03. Amazon CloudFront の仕組み

### Point Of Presence

Amazon CloudFront は世界中に配置される『Point Of Presence (エッジロケーション+中間層キャッシュ) 』にデプロイされる。

> - https://aws.amazon.com/jp/cloudfront/features/?whats-new-cloudfront.sort-by=item.additionalFields.postDateTime&whats-new-cloudfront.sort-order=desc

<br>

### Amazon CloudFront DNS

Amazon CloudFront のドメイン (`<発行されたランダム文字列>.cloudfront.net`) の正引きに応じて、エッジサーバーの IP アドレスを返却する。

Amazon CloudFront のドメインは、Amazon Route 53 の DNS レコードとして登録する。

![cloudfront_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloudfront_architecture.png)

> - https://aws.amazon.com/jp/builders-flash/202311/learn-cloudfront-with-trainer/?awsf.filter-name
> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HowCloudFrontWorks.html

<br>

### エッジサーバー

#### ▼ エッジサーバーとは

地理的にクライアントからもっとも近い場所にあるキャッシュサーバーである。

> - https://xtech.nikkei.com/it/atclncf/service/00040/101700001/
> - https://aws.amazon.com/jp/builders-flash/202311/learn-cloudfront-with-trainer/?awsf.filter-name

#### ▼ 全エッジサーバーの IP アドレス

Amazon CloudFront には、エッジロケーションの数だけエッジサーバーがあり、各サーバーに IP アドレスが割り当てられている。

以下のコマンドで、すべてのエッジサーバーの IP アドレスを確認できる。

```bash
$ curl -X GET https://ip-ranges.amazonaws.com/ip-ranges.json \
    | jq ".prefixes[]| select(.service=="CLOUDFRONT") | .ip_prefix"
```

もしくは、以下のリンクを直接的に参考し、『`"service": "CLOUDFRONT"`』となっている部分を探す。

> - https://ip-ranges.amazonaws.com/ip-ranges.json

#### ▼ 使用中サーバーの IP アドレス

Amazon CloudFront には、エッジロケーションがあり、各ロケーションにサーバーがある。

以下のコマンドで、エッジロケーションにある使用中サーバーの IP アドレスを確認できる。

```bash
$ nslookup <発行されたランダム文字列>.cloudfront.net
```

<br>

## 04. キャッシュ

### オリジンリクエストの可否、キャッシュ作成の有無の決まり方

オリジンにルーティングする必要があるリクエストを、各種パラメーターの All (全許可) /一部許可/None (全拒否) で設定できる。

また、キャッシュ作成の有無にも関係している。

Amazon CloudFront ではリクエストが JSON として扱われており、JSON の値が過去のリクエストに合致したときのみ、そのリクエストと過去のものが同一であると見なす仕組みになっている。

キャッシュ判定時のパターンを減らし、ヒット率を向上させるために、すべての項目で『None (全拒否) 』を選択したほうがよい。

最終的に、対象のファイルが Amazon CloudFront のキャッシュ作成の対象となっているかは、レスポンスのヘッダーに含まれる『`X-Cache:`』が『`Hit from cloudfront`』または『`Miss from cloudfront`』のどちらで判断できる。

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html
> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html

<br>

### キャッシュを作成する

#### ▼ ヘッダー値に基づくキャッシュ作成

リクエストヘッダーのうち、オリジンへのルーティングを許可し、加えてキャッシュキーと見なすオプションを設定する。

`Cookie` ヘッダーとクエリストリングと比べて、同じ設定でもキャッシュ作成の有無が異なることに注意する。

| 機能名           | オリジンリクエストの可否                                                             | キャッシュ作成の有無                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 全許可           | すべてのヘッダーのルーティングを許可する。                                           | キャッシュを作成しない。                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 一部ルーティング | 一部のヘッダーのルーティングを拒否し、ヘッダーのないリクエストをルーティングする。   | 指定したヘッダーのみをキャッシュキーとみなす。日付に関するヘッダー (例：Accept-Datetime) などの動的な値をキャッシュキーとしてしまうと。同一と見なすリクエストがほとんどなくなり、ヒットしなくなる。そのため、ヘッダーをオリジンにルーティングしつつ、動的になりやすい値を持つヘッダーをキャッシュキーにしないようにする必要がある。ヒット率の向上のため、クエリストリングや `Cookie` ヘッダーの静的な値をキャッシュキーに設定するとよい。 |
| 全拒否           | すべてのヘッダーのルーティングを拒否し、ヘッダーのないリクエストをルーティングする。 | キャッシュを作成しない。                                                                                                                                                                                                                                                                                                                                                                                                                  |

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/header-caching.html#header-caching-web

#### ▼ `Cookie` ヘッダーに基づくキャッシュ作成

`Cookie` ヘッダー情報のキー名のうち、オリジンへのルーティングを許可し、加えてキャッシュキーと見なすオプションを設定する。

リクエストのヘッダーに含まれる `Cookie` ヘッダー情報 (キー名/値) が変動していると、Amazon CloudFront に保管したキャッシュがヒットしない。

Amazon CloudFront はキー名/値を保持するため、変化しやすいキー名/値は、オリジンにルーティングしないように設定する。

例えば、GoogleAnalytics のキー名 (`_ga`) の値は、ブラウザによって異なるため、1 ユーザーがブラウザを変えるたびに、異なるキャッシュが作成されることになる。

そのため、ユーザーを一意に判定することが難しくなってしまう。

GoogleAnalytics のキーはブラウザから Ajax で Google に送信されるもので、オリジンにとっても基本的に不要である。

セッション ID は `Cookie` ヘッダーに設定されているため、フォーム送信に関わるパスパターンでは、セッション ID のキー名を許可する必要がある。

| 機能名           | オリジンリクエストの可否                                                                                | キャッシュ作成の有無                                                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 全許可           | すべての `Cookie` ヘッダーのルーティングを許可する。                                                    | すべての `Cookie` ヘッダーをキャッシュキーとみなす。有効期限                                                                                                                                                                                            |
| 一部ルーティング | 一部の `Cookie` ヘッダーのルーティングを拒否し、`Cookie` ヘッダーのないリクエストをルーティングする。   | 指定した `Cookie` ヘッダーのみキャッシュキーとみなす。`Cookie` ヘッダーはユーザーごとに一意になることが多く、動的であるが、それ以外のヘッダーやクエリ文字でキャッシュを判定するようになるため、同一と見なすリクエストが増え、ヒット率の向上につながる。 |
| 全拒否           | すべての `Cookie` ヘッダーのルーティングを拒否し、`Cookie` ヘッダーのないリクエストをルーティングする。 | キャッシュを作成しない。                                                                                                                                                                                                                                |

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Cookies.html

#### ▼ クエリストリングに基づくキャッシュ作成

クエリストリングのうち、オリジンへのルーティングを許可し、加えてキャッシュキーと見なすオプションを設定する。

異なるクエリパラメーターのキャッシュを別々に作成するか否かを設定できる。

| 機能名   | オリジンリクエストの可否                                                                                     | キャッシュ作成の有無                                   |
| -------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| 全許可   | すべてのクエリストリングのルーティングを許可する。                                                           | すべてのクエリストリングをキャッシュキーとみなす。     |
| 一部拒否 | 一部のクエリストリングのルーティングを拒否し、クエリストリングのないリクエストをオリジンにルーティングする。 | 指定したクエリストリングのみをキャッシュキーとみなす。 |
| 全拒否   | すべてのクエリストリングのルーティングを拒否し、クエリストリングのないリクエストをルーティングする。         | キャッシュを作成しない。                               |

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/QueryStringParameters.html

<br>

### キャッシュを作成しない

#### ▼ `Cookie` ヘッダーやクエリストリングをオリジンにルーティングしつつ、キャッシュを作成しない場合

上記の設定では、`Cookie` ヘッダーやクエリストリングをオリジンにルーティングしつつ、キャッシュを作成しないようにできない。

そこで、キャッシュの最大最小デフォルトの有効期間を `0` 秒とすることにより、結果的にキャッシュを動作しないようにさせ、キャッシュが作成されていないかのように見せかけられる。

<br>

### 有効期限

#### ▼ Amazon CloudFront

以下の設定で、レスポンスに付与する HTTP ヘッダーを設定できる。

- `Cache-Control` ヘッダー
- `Expires` ヘッダー
- TTL の設定

> - https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/RequestAndResponseBehaviorS3Origin.html#RequestS3Caching

#### ▼ オリジン

オリジンが Amazon S3 の場合、メタデータからレスポンスに付与する HTTP ヘッダーを設定できる。

> - https://techblog.insightedge.jp/entry/aws-cf-s3-cache

<br>

## 04-02. ヒット率の向上

### ヘッダーキャッシュによるヒット率向上

#### ▼ ヒット率の向上について

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/header-caching.html

<br>

### `Cookie` ヘッダーキャッシュによるヒット率向上

#### ▼ ヒット率の向上について

Amazon CloudFront は、最初のフォワーディング時に、`Cookie` ヘッダーを使用してリジンからレスポンスされるファイルのキャッシュを作成する。

次回、同じクエリストリングであった場合、キャッシュをレスポンスとして返信する。

キャッシュ作成のルールを理解すれば、キャッシュのヒット率を向上させられる。

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Cookies.html

<br>

### クエリストリングによるキャッシュのヒット率向上

#### ▼ ヒット率の向上について

Amazon CloudFront は、最初のフォワーディング時に、クエリストリングを使用してリジンからレスポンスされるファイルのキャッシュを作成する。

次回、同じクエリストリングであった場合、キャッシュをレスポンスとして返信する。

キャッシュ作成のルールを理解すれば、キャッシュのヒット率を向上させられる。

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cache-hit-ratio.html#cache-hit-ratio-query-string-parameters
> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/QueryStringParameters.html#query-string-parameters-optimizing-caching

#### ▼ クエリストリングの順番を固定する

リクエスト時のクエリストリングの順番が異なる場合、Amazon CloudFront はそれぞれを異なる URL に対するリクエストと見なし、別々にキャッシュを作成する。

そのため、クエリストリングの順番を固定するように URL を設計すれば、キャッシュのヒット率を向上させられる。

```yaml
GET https://example.com?fooId=1&barId=2
```

```yaml
GET https://example.com?barId=2&fooId=1
```

#### ▼ クエリストリングの大文字小文字表記を固定する

リクエスト時のクエリストリングの大文字小文字表記が異なる場合、Amazon CloudFront はそれぞれを異なる URL に対するリクエストと見なし、別々にキャッシュを作成する。

そのため、クエリストリングの大文字小文字表記を固定するように URL を設計すれば、キャッシュのヒット率を向上させられる。

```yaml
GET https://example.com?fooId=1&barId=2
```

```yaml
GET https://example.com?FooId=1&BarId=2
```

#### ▼ 署名付き URL と同じクエリストリングを使用しない

S3 には、署名付き URL を発行する機能がある。

Amazon CloudFront の仕様では、署名付き URL に含まれる `Expires`、`Key-Pair-Id`、`Policy`、`Signature` といったクエリストリングを削除したうえで、オリジンにリクエストをルーティングする。

これらのパラメーターは、キャッシュヒットの判定要素として使用できない。

そのため、URL の設計時にこれらを使用しないようにする。

<br>

### Invalidation (キャッシュの削除)

TTL 秒によるキャッシュの自動削除を待たずに、手動でキャッシュを削除できる。

すべてのファイルのキャッシュを削除したい場合は『`/*`』、特定のファイルのキャッシュを削除したい場合は『`/<ファイルへのパス>`』を設定する。

Amazon CloudFront に関するエラーページが表示された場合、不具合を修正した後でもキャッシュが残っていると、エラーページが表示されてしまう。

そのため、作業後には必ずキャッシュを削除する。

<br>

## 05. カスタムエラーページ

### カスタムエラーページとは

オリジンに該当のファイルが存在しない場合、オリジンは Amazon CloudFront に以下の `403` ステータスを含むレスポンスを返信する。

カスタムエラーページを設定しない場合、Amazon CloudFront はこの `403` ステータスをそのままレスポンスしてしまう。

そのため、オリジンに配置したカスタムエラーページを `404` ステータスでレスポンスするように設定する。

```html
This XML file does not appear to have any style information associated with it.
The document tree is shown below.
<Error>
  <code>AccessDenied</code>
  <Message>Access Denied</Message>
  <RequestId>*****</RequestId>
  <HostId>*****</HostId>
</Error>
```

<br>

### 設定方法

オリジンからカスタムエラーページをレスポンスするパスパターンを定義する。

Lamnda@Edge を使用した Amazon CloudFront の場合は、AWS Lambda@Edge を経由して、カスタムエラーページをレスポンスする必要がある。

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HTTPStatusCodes.html

<br>
