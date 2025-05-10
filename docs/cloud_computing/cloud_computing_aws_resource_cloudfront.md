---
title: 【IT技術の知見】AWS CloudFront＠AWSリソース
description: AWS CloudFront＠AWSリソースの知見を記録しています。
---

# AWS CloudFront＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS CloudFrontとは

CDN (グローバルなキャッシュサーバー) かつクラウドリバースプロキシサーバーとして働く。

リバースプロキシでもあるため、AWS CloudFrontの後段にアプリケーションをおけば、アプリケーションをそのまま公開できる。

VPCの外側 (パブリックネットワーク) に配置されている。

オリジンサーバー (コンテンツ提供元) をS3とした場合、動的コンテンツに対するリクエストをEC2に振り分ける。

また、静的コンテンツに対するリクエストをキャッシュし、その上でS3へ振り分ける。

次回以降の静的コンテンツのリンクエストは、AWS CloudFrontがレンスポンスを実行する。

![AWSのクラウドデザイン一例](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/CloudFrontによるリクエストの振り分け.png)

<br>

## 02. セットアップ

### Distributions

#### ▼ Distributions

| 設定項目                 | 説明                                                               | 補足 |
| ------------------------ | ------------------------------------------------------------------ | ---- |
| General                  |                                                                    |      |
| Origin and Origin Groups | コンテンツを提供するAWSリソースを設定する。                        |      |
| Behavior                 | オリジンにリクエストが行われた時のAWS CloudFrontの挙動を設定する。 |      |
| ErrorPage                | 指定したオリジンから、指定したファイルを含むレスポンスを返信する。 |      |
| Restriction              |                                                                    |      |
| Invalidation             | AWS CloudFrontに保管されているキャッシュを削除できる。             |      |

> - https://www.geekfeed.co.jp/geekblog/wordpress%E3%81%A7%E6%A7%8B%E7%AF%89%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%82%8B%E3%82%A6%E3%82%A7%E3%83%96%E3%82%B5%E3%82%A4%E3%83%88%E3%81%ABcloudfront%E3%82%92%E7%AB%8B%E3%81%A6%E3%81%A6%E9%AB%98/

#### ▼ General

| 設定項目            | 説明                                                                                                                                      | 補足                                                                                                                                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Price Class         | 使用するエッジロケーションを設定する。                                                                                                    | Asiaが含まれているものを選択。                                                                                                                                                                                                                           |
| AWS WAF             | AWS CloudFrontに紐付けるAWS WAFを設定する。                                                                                               |                                                                                                                                                                                                                                                          |
| CNAME               | AWS CloudFrontのデフォルトドメイン名 (`<発行されたランダム文字列>.cloudfront.net.`) に紐付けるDNSレコード名を設定する。                   | ・AWS Route53からルーティングする場合は必須。<br>・複数のレコード名を設定できる。                                                                                                                                                                        |
| SSL Certificate     | HTTPSプロトコルでオリジンにルーティングする場合に設定する。                                                                               | 上述のCNAMEを設定した場合、SSL証明書が別途必要になる。また、Certificate Managerを使用する場合、この証明書は『バージニア北部』で申請する必要がある。                                                                                                      |
| Security Policy     | リクエストの送信者が使用するSSL/TLSプロトコルや暗号化方式のバージョンに合わせて、AWS CloudFrontが受信できるこれらのバージョンを設定する。 | ・リクエストの送信者には、ブラウザ、APIにリクエストを送信する外部サービス、ルーティング元のAWSリソースなどを含む。<br>・- https://docs.aws.amazon.com/Amazon CloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html |
| Default Root Object | オリジンのドキュメントルートを設定する。                                                                                                  | ・何も設定しない場合、ドキュメントルートは指定されず、Behaviorで明示的にルーティングする必要がある。<br>・index.htmlを設定すると、『`/`』でリクエストした時に、オリジンのルートディレクトリ配下にある`index,html`ファイルがドキュメントルートになる。    |
| Standard Logging    | AWS CloudFrontのアクセスログをS3に作成するか否かを設定する。                                                                              |                                                                                                                                                                                                                                                          |

#### ▼ Origin and Origin Groups

| 設定項目               | 説明                                                                                                                                                   | 補足                                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Origin Domain Name     | AWS CloudFrontをリバースプロキシサーバーとして、AWSリソースのエンドポイントやDNSにルーティングする。                                                   | ・例えば、S3のエンドポイント、ALBのDNS名を設定する。<br>・別アカウントのAWSリソースのDNS名であっても良い。                                                                                           |
| Origin Path            | オリジンのルートディレクトリを設定する。                                                                                                               | ・何も設定しないと、デフォルトは『`/`』のなる。Behaviorでは、『`/`』の後にパスが追加される。<br>・『`/var/www/foo`』を設定すると、Behaviorで設定したパスが『`/var/www/foo/foo`』のように追加される。 |
| Origin Access Identity | リクエストのルーティング先となるAWSリソースで認可スコープの紐付けが必要な場合に設定する。ルーティング先のAWSリソースでは、アクセスポリシーを紐付ける。 | AWS CloudFrontがS3に対して読み出しを実行するために必要。                                                                                                                                             |
| Origin Protocol Policy | リクエストのルーティング先となるAWSリソースに対して、HTTPとHTTPSプロトコルのいずれのプロトコルでルーティングするかを設定する。                         | ・ALBで必要。ALBのリスナーのプロトコルに合わせて設定する。<br>・`HTTP Only`：HTTPプロトコルでルーティング<br>・`HTTPS Only`：HTTPSプロトコルでルーティング<br>・`Match Viewer`：両方でルーティング   |
| HTTPポート             | ルーティング時に指定するオリジンのHTTPプロトコルのポート番号                                                                                           |                                                                                                                                                                                                      |
| HTTPSポート            | ルーティング時に指定するオリジンのHTTPSプロトコルのポート番号                                                                                          |                                                                                                                                                                                                      |

#### ▼ Behavior

| 設定項目                       | 説明                                                                                     | 補足                                                                                                                                                                                                                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Precedence                     | 処理の優先順位。                                                                         | 最初に作成したBehaviorが『`Default (*)`』となり、これは後から変更できないため、主要なBehaviorをまず最初に設定する。                                                                                                                                                                                                   |
| Path pattern                   | Behaviorを実行するパスを設定する。                                                       |                                                                                                                                                                                                                                                                                                                       |
| Origin and Origin Group        | Behaviorを実行するオリジンを設定する。                                                   |                                                                                                                                                                                                                                                                                                                       |
| Viewer Protocol Policy         | HTTP/HTTPSプロトコルのどちらを受信するか、またどのように変換してルーティングするかを設定 | ・`HTTP and HTTPS`：両方受信し、そのままルーティング<br>・`Redirect HTTP to HTTPS`：両方受信し、HTTPSプロトコルでルーティング<br>・`HTTPS Only`：HTTPSプロトコルのみ受信し、HTTPSプロトコルでルーティング                                                                                                             |
| Allowed HTTP Methods           | リクエストのHTTPメソッドのうち、オリジンへのルーティングを許可するものを設定             | ・パスパターンが静的ファイルに対するリクエストの場合、GETリクエストのみ許可。<br>・パスパターンが動的ファイルに対するリクエストの場合、全てのメソッドを許可。                                                                                                                                                         |
| Object Caching                 | AWS CloudFrontにコンテンツのキャッシュを保管しておく秒数を設定する。                     | ・Origin Cacheヘッダーを選択した場合、アプリケーションからのレスポンスヘッダーの`Cache-Control`ヘッダーの値が適用される。<br>・カスタマイズを選択した場合、ブラウザのTTLとは別に設定できる。                                                                                                                          |
| TTL                            | AWS CloudFrontにキャッシュを保管しておく秒数を詳細に設定する。                           | ・Min、Max、Defaultの全てを`0`秒とすると、キャッシュを無効化できる。<br>・『Headers = All』としている場合、キャッシュが実質無効となるため、最小TTLはゼロである必要がある。<br>・キャッシュの最終的な有効期間は、AWS CloudFrontのTTL秒の設定、`Cache-Control`ヘッダー、`Expires`ヘッダー値の組み合わせによって決まる。 |
| Whitelist Header               | Headers を参考にせよ。                                                                   | ・`Accept-*****`：アプリケーションにレスポンスして欲しいデータの種類 (データ型など) を指定。<br>・ `AWS CloudFront-Is-*****-Viewer`：デバイスタイプのboolean値が格納されている。<br>- https://docs.aws.amazon.com/Amazon CloudFront/latest/DeveloperGuide/Expiration.html#ExpirationDownloadDist                      |
| Restrict Viewer Access         | クライアント側を制限するか否かを設定できる。                                             | セキュリティグループで制御できるため、ここでは設定しなくて良い。                                                                                                                                                                                                                                                      |
| Compress Objects Automatically | レスポンス時に`gzip`ファイルとして圧縮するか否かを設定                                   | ・クライアントからのリクエストヘッダーのAccept-Encodingにgzipが設定されている場合、レスポンス時に、gzip形式で圧縮して送信するか否かを設定する。設定しない場合、圧縮せずにレスポンスを返信する。<br>・クライアント側のダウンロード速度向上のため、基本的には有効化する。                                               |

#### ▼ オリジンに対するリクエストの構造

AWS CloudFrontからオリジンに送信されるリクエストの構造例を以下に示す。

```yaml
GET /foo/
---
# リクエストされたドメイン名
Host: foo.example.com
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1
Authorization: Bearer <Bearerトークン>
X-Amz-Cf-Id: *****
Via: 2.0 <発行されたランダム文字列>.cloudfront.net (AWS CloudFront)
# 各Cookieヘッダーの値 (二回目のリクエスト時に設定される)
Cookie: sessionid=<セッションID>; __ulfpc=<GoogleAnalytics値>; _ga=<GoogleAnalytics値>; _gid=<GoogleAnalytics値>
# 送信元IPアドレス
# ※プロキシ (AWS ALBやAWS CloudFrontなども含む) を経由している場合、それら全てのIPアドレスが順に設定される
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

#### ▼ AWS CloudFrontとオリジン間のHTTPSプロトコル

AWS CloudFrontとオリジン間でHTTPSプロトコルを使用する場合、両方にSSL証明書を割り当てる必要がある。

割り当てたとしても、以下の条件を満たさないとHTTPSプロトコルを使用することはできない。

CLoudFrontからオリジンに`Host`ヘッダーをルーティングしない設定の場合、オリジンが返却する証明書に『Origin Domain Name』と一致するドメイン名が含まれている必要がある。

一方で、`Host`ヘッダーをルーティングしない場合、オリジンが返却する証明書に『Origin Domain Name』と一致するドメイン名が含まれているか、またはオリジンが返却する証明書に、`Host`ヘッダー値と一致するドメイン名が含まれている必要がある。

<br>

### Reports & analytics

#### ▼ Cache statistics

リクエストに関連するさまざまなデータを、日付別に集計したものを確認できる。

#### ▼ Popular objects

リクエストに関連するさまざまなデータを、オブジェクト別に集計したものを確認できる。

<br>

## 03. AWS CloudFrontの仕組み

### Point Of Presence

AWS CloudFrontは世界中に配置される『Point Of Presence (エッジロケーション+中間層キャッシュ) 』にデプロイされる。

> - https://aws.amazon.com/jp/cloudfront/features/?whats-new-cloudfront.sort-by=item.additionalFields.postDateTime&whats-new-cloudfront.sort-order=desc

<br>

### AWS CloudFront DNS

AWS CloudFrontのドメイン (`<発行されたランダム文字列>.cloudfront.net`) の正引きに応じて、エッジサーバーのIPアドレスを返却する。

AWS CloudFrontのドメインは、AWS Route53のDNSレコードとして登録する。

![cloudfront_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloudfront_architecture.png)

> - https://aws.amazon.com/jp/builders-flash/202311/learn-cloudfront-with-trainer/?awsf.filter-name
> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HowCloudFrontWorks.html

<br>

### エッジサーバー

#### ▼ エッジサーバーとは

地理的にクライアントから最も近い場所にあるキャッシュサーバーである。

> - https://xtech.nikkei.com/it/atclncf/service/00040/101700001/
> - https://aws.amazon.com/jp/builders-flash/202311/learn-cloudfront-with-trainer/?awsf.filter-name

#### ▼ 全エッジサーバーのIPアドレス

AWS CloudFrontには、エッジロケーションの数だけエッジサーバーがあり、各サーバーにIPアドレスが割り当てられている。

以下のコマンドで、全てのエッジサーバーのIPアドレスを確認できる。

```bash
$ curl -X GET https://ip-ranges.amazonaws.com/ip-ranges.json \
    | jq ".prefixes[]| select(.service=="CLOUDFRONT") | .ip_prefix"
```

もしくは、以下のリンクを直接的に参考し、『`"service": "CLOUDFRONT"`』となっている部分を探す。

> - https://ip-ranges.amazonaws.com/ip-ranges.json

#### ▼ 使用中サーバーのIPアドレス

AWS CloudFrontには、エッジロケーションがあり、各ロケーションにサーバーがある。

以下のコマンドで、エッジロケーションにある使用中サーバーのIPアドレスを確認できる。

```bash
$ nslookup <発行されたランダム文字列>.cloudfront.net
```

<br>

## 04. キャッシュ

### オリジンリクエストの可否、キャッシュ作成の有無の決まり方

オリジンにルーティングする必要があるリクエストを、各種パラメーターのAll (全許可) /一部許可/None (全拒否) で設定できる。

また、キャッシュ作成の有無にも関係している。

AWS CloudFrontではリクエストがJSONとして扱われており、JSONの値が過去のリクエストに合致した時のみ、そのリクエストと過去のものが同一であると見なす仕組みになっている。

キャッシュ判定時のパターンを減らし、ヒット率を向上させるために、全ての項目で『None (全拒否) 』を選択した方が良い。

最終的に、対象のファイルがAWS CloudFrontのキャッシュ作成の対象となっているかは、レスポンスのヘッダーに含まれる『`X-Cache:`』が『`Hit from cloudfront`』または『`Miss from cloudfront`』のどちらで判断できる。

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html
> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html

<br>

### キャッシュを作成する

#### ▼ ヘッダー値に基づくキャッシュ作成

リクエストヘッダーのうち、オリジンへのルーティングを許可し、加えてキャッシュキーと見なすオプションを設定する。

`Cookie`ヘッダーとクエリストリングと比べて、同じ設定でもキャッシュ作成の有無が異なることに注意する。

| 機能名           | オリジンリクエストの可否                                                           | キャッシュ作成の有無                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 全許可           | 全てのヘッダーのルーティングを許可する。                                           | キャッシュを作成しない。                                                                                                                                                                                                                                                                                                                                                                                                                |
| 一部ルーティング | 一部のヘッダーのルーティングを拒否し、ヘッダーの無いリクエストをルーティングする。 | 指定したヘッダーのみをキャッシュキーとみなす。日付に関するヘッダー (例：Accept-Datetime) などの動的な値をキャッシュキーとしてしまうと。同一と見なすリクエストがほとんどなくなり、ヒットしなくなる。そのため、ヘッダーをオリジンにルーティングしつつ、動的になりやすい値を持つヘッダーをキャッシュキーにしないようにする必要がある。ヒット率の向上のため、クエリストリングや`Cookie`ヘッダーの静的な値をキャッシュキーに設定すると良い。 |
| 全拒否           | 全てのヘッダーのルーティングを拒否し、ヘッダーの無いリクエストをルーティングする。 | キャッシュを作成しない。                                                                                                                                                                                                                                                                                                                                                                                                                |

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/header-caching.html#header-caching-web

#### ▼ `Cookie`ヘッダーに基づくキャッシュ作成

`Cookie`ヘッダー情報のキー名のうち、オリジンへのルーティングを許可し、加えてキャッシュキーと見なすオプションを設定する。

リクエストのヘッダーに含まれる`Cookie`ヘッダー情報 (キー名/値) が変動していると、AWS CloudFrontに保管したキャッシュがヒットしない。

AWS CloudFrontはキー名/値を保持するため、変化しやすいキー名/値は、オリジンにルーティングしないように設定する。

例えば、GoogleAnalyticsのキー名 (`_ga`) の値は、ブラウザによって異なるため、1ユーザーがブラウザを変えるたびに、異なるキャッシュが作成されることになる。

そのため、ユーザーを一意に判定することが難しくなってしまう。

GoogleAnalyticsのキーはブラウザからAjaxでGoogleに送信されるもので、オリジンにとっても基本的に不要である。

セッションIDは`Cookie`ヘッダーに設定されているため、フォーム送信に関わるパスパターンでは、セッションIDのキー名を許可する必要がある。

| 機能名           | オリジンリクエストの可否                                                                           | キャッシュ作成の有無                                                                                                                                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 全許可           | 全ての`Cookie`ヘッダーのルーティングを許可する。                                                   | 全ての`Cookie`ヘッダーをキャッシュキーとみなす。有効期限                                                                                                                                                                                             |
| 一部ルーティング | 一部の`Cookie`ヘッダーのルーティングを拒否し、`Cookie`ヘッダーの無いリクエストをルーティングする。 | 指定した`Cookie`ヘッダーのみキャッシュキーとみなす。`Cookie`ヘッダーはユーザーごとに一意になることが多く、動的であるが、それ以外のヘッダーやクエリ文字でキャッシュを判定するようになるため、同一と見なすリクエストが増え、ヒット率の向上につながる。 |
| 全拒否           | 全ての`Cookie`ヘッダーのルーティングを拒否し、`Cookie`ヘッダーの無いリクエストをルーティングする。 | キャッシュを作成しない。                                                                                                                                                                                                                             |

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Cookies.html

#### ▼ クエリストリングに基づくキャッシュ作成

クエリストリングのうち、オリジンへのルーティングを許可し、加えてキャッシュキーと見なすオプションを設定する。

異なるクエリパラメーターのキャッシュを別々に作成するか否かを設定できる。

| 機能名   | オリジンリクエストの可否                                                                                     | キャッシュ作成の有無                                   |
| -------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| 全許可   | 全てのクエリストリングのルーティングを許可する。                                                             | 全てのクエリストリングをキャッシュキーとみなす。       |
| 一部拒否 | 一部のクエリストリングのルーティングを拒否し、クエリストリングの無いリクエストをオリジンにルーティングする。 | 指定したクエリストリングのみをキャッシュキーとみなす。 |
| 全拒否   | 全てのクエリストリングのルーティングを拒否し、クエリストリングの無いリクエストをルーティングする。           | キャッシュを作成しない。                               |

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/QueryStringParameters.html

<br>

### キャッシュを作成しない

#### ▼ `Cookie`ヘッダーやクエリストリングをオリジンにルーティングしつつ、キャッシュを作成しない場合

上記の設定では、`Cookie`ヘッダーやクエリストリングをオリジンにルーティングしつつ、キャッシュを作成しないようにできない。

そこで、キャッシュの最大最小デフォルトの有効期間を`0`秒とすることにより、結果的にキャッシュを動作しないようにさせ、キャッシュが作成されていないかのように見せかけられる。

<br>

### 有効期限

#### ▼ CloudFront

以下の設定で、レスポンスに付与するHTTPヘッダーを設定できる。

- `Cache-Control`ヘッダー
- `Expires`ヘッダー
- TTLの設定

> - https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/RequestAndResponseBehaviorS3Origin.html#RequestS3Caching

#### ▼ オリジン

オリジンがAWS S3の場合、メタデータからレスポンスに付与するHTTPヘッダーを設定できる。

> - https://techblog.insightedge.jp/entry/aws-cf-s3-cache

<br>

## 04-02. ヒット率の向上

### ヘッダーキャッシュによるヒット率向上

#### ▼ ヒット率の向上について

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/header-caching.html

<br>

### `Cookie`ヘッダーキャッシュによるヒット率向上

#### ▼ ヒット率の向上について

AWS CloudFrontは、最初のフォワーディング時に、`Cookie`ヘッダーを使用してリジンからレスポンスされるファイルのキャッシュを作成する。

次回、同じクエリストリングであった場合、キャッシュをレスポンスとして返信する。

キャッシュ作成のルールを理解すれば、キャッシュのヒット率を向上させられる。

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Cookies.html

<br>

### クエリストリングによるキャッシュのヒット率向上

#### ▼ ヒット率の向上について

AWS CloudFrontは、最初のフォワーディング時に、クエリストリングを使用してリジンからレスポンスされるファイルのキャッシュを作成する。

次回、同じクエリストリングであった場合、キャッシュをレスポンスとして返信する。

キャッシュ作成のルールを理解すれば、キャッシュのヒット率を向上させられる。

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cache-hit-ratio.html#cache-hit-ratio-query-string-parameters
> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/QueryStringParameters.html#query-string-parameters-optimizing-caching

#### ▼ クエリストリングの順番を固定する

リクエスト時のクエリストリングの順番が異なる場合、AWS CloudFrontはそれぞれを異なるURLに対するリクエストと見なし、別々にキャッシュを作成する。

そのため、クエリストリングの順番を固定するようにURLを設計すれば、キャッシュのヒット率を向上させられる。

```yaml
GET https://example.com?fooId=1&barId=2
```

```yaml
GET https://example.com?barId=2&fooId=1
```

#### ▼ クエリストリングの大文字小文字表記を固定する

リクエスト時のクエリストリングの大文字小文字表記が異なる場合、AWS CloudFrontはそれぞれを異なるURLに対するリクエストと見なし、別々にキャッシュを作成する。

そのため、クエリストリングの大文字小文字表記を固定するようにURLを設計すれば、キャッシュのヒット率を向上させられる。

```yaml
GET https://example.com?fooId=1&barId=2
```

```yaml
GET https://example.com?FooId=1&BarId=2
```

#### ▼ 署名付きURLと同じクエリストリングを使用しない

S3には、署名付きURLを発行する機能がある。

AWS CloudFrontの仕様では、署名付きURLに含まれる`Expires`、`Key-Pair-Id`、`Policy`、`Signature`といったクエリストリングを削除したうえで、オリジンにリクエストをルーティングする。

これらのパラメーターは、キャッシュヒットの判定要素として使用できない。

そのため、URLの設計時にこれらを使用しないようにする。

<br>

### Invalidation (キャッシュの削除)

TTL秒によるキャッシュの自動削除を待たずに、手動でキャッシュを削除できる。

全てのファイルのキャッシュを削除したい場合は『`/*`』、特定のファイルのキャッシュを削除したい場合は『`/<ファイルへのパス>`』を設定する。

AWS CloudFrontに関するエラーページが表示された場合、不具合を修正した後でもキャッシュが残っていると、エラーページが表示されてしまう。

そのため、作業後には必ずキャッシュを削除する。

<br>

## 05. カスタムエラーページ

### カスタムエラーページとは

オリジンに該当のファイルが存在しない場合、オリジンはAWS CloudFrontに以下の`403`ステータスを含むレスポンスを返信する。

カスタムエラーページを設定しない場合、AWS CloudFrontはこの`403`ステータスをそのままレスポンスしてしまう。

そのため、オリジンに配置したカスタムエラーページを`404`ステータスでレスポンスするように設定する。

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

Lamnda@Edgeを使用したAWS CloudFrontの場合は、AWS Lambda@Edgeを経由して、カスタムエラーページをレスポンスする必要がある。

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HTTPStatusCodes.html

<br>
