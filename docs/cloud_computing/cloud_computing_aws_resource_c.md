---
title: 【IT技術の知見】Cで始まるAWSリソース＠AWS
description: Cで始まるAWSリソース＠AWSの知見を記録しています。
---

# ```C```で始まるAWSリソース＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/


## 01. Certificate Manager

### セットアップ

| 設定項目  | 説明                       |
|----------|--------------------------|
| ドメイン名    | 認証をリクエストするドメイン名を設定する。 |
| 検証の方法 | DNS検証かEメール検証かを設定する。  |

<br>

### 認証局

認証局であるATSによって認証されたSSL証明書を管理できる。

| サーバー提供者 | 名前                      |
|---------|---------------------------|
| 中間認証局 | ATS：Amazon Trust Services |
| ルート認証局  | Starfield社               |

<br>

### SSL証明書の検証方法

#### ▼ ドメイン検証

ドメインのSSL証明書を発行するためには、そのドメインの所有者であることを証明する必要がある。ドメインを購入できるサービス（例：AWS、GCP、GMO）に検証方法が用意されている。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/acm/latest/userguide/domain-ownership-validation.html
> - https://jp.globalsign.com/support/proceeding/147.html

#### ▼ DNS検証

CMによってRoute53に自動作成されるCNAMEレコード値を使用して、ドメインの所有者であることを証明する。証明書が失効しそうになった時に、CNAMEレコード値が照合され、CMが証明書を再発行してくれる。注意点として、ドメインをAWS以外（例：お名前ドットコム）で購入している場合は、NSレコード値を購入先のサービスのドメインレジストラに手作業で登録する必要があることに注意する。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html
> - https://dev.classmethod.jp/articles/route53-domain-onamae/

#### ▼ Eメール検証

ドメインの所有者にメールを送信し、これを承認することにより所有者であることを証明する。ドメインをAWS以外（例：お名前ドットコム）で購入している場合は、そちらで設定したメールアドレス宛に確認メールを送信する。

> ℹ️ 参考：https://docs.aws.amazon.com/acm/latest/userguide/email-validation.html

#### ▼ 検証方法の変更

既存のSSL証明書の検証方法は変更できない。そのため、検証方法を変更した証明書を新しく発行し、これを紐づける必要がある。古い証明書は削除しておく。

> ℹ️ 参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/switch-acm-certificate/

<br>

### SSL証明書

#### ▼ セキュリティポリシー

許可するプロトコルを定義したルールこと。SSL/TLSプロトコルを許可しており、対応できるバージョンが異なるため、ブラウザがそのバージョンのSSL/TLSプロトコルを使用できるかを認識しておく必要がある。

| バージョン            | Policy-2016-08 | Policy-TLS-1-1 | Policy-TLS-1-2 |
|------------------|:--------------:|:--------------:|:--------------:|
| Protocol-TLSv1   |       〇        |       ✕        |       ✕        |
| Protocol-TLSv1.1 |       〇        |       〇        |       ✕        |
| Protocol-TLSv1.2 |       〇        |       〇        |       〇        |

#### ▼ SSL証明書の種類

DNS検証またはEメール検証によって、ドメインの所有者であることが証明されると、発行される。SSL証明書は、PKIによる公開鍵検証に使用される。

| 証明書の種類   | 説明                           |
|------------|------------------------------|
| ワイルドカード証明書 | 証明するドメイン名にワイルドカードを使用したもの。 |

#### ▼ SSL証明書の設置場所パターン

AWSの使用上、ACMのSSL証明書を設置できないAWSリソースに対しては、外部のSSL証明書を手に入れて設置する。HTTPSによるSSLプロトコルを受け付けるネットワークの最終地点のことを、SSLターミネーションという。

| パターン<br>（Route53には必ず設置）                                       | SSLターミネーション<br>（HTTPSの最終地点） | 補足                                                                                                                                                   |
|---------------------------------------------------------------|---------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| Route53 → ALB(+ACMのSSL証明書) → EC2                              | ALB                             |                                                                                                                                                        |
| Route53 → CloudFront(+ACMのSSL証明書) → ALB(+ACMのSSL証明書) → EC2 | ALB                             | CloudFrontはバージニア北部で、またALBは東京リージョンで、証明書を作成する必要がある。CloudFrontに送信されたHTTPSリクエストをALBにルーティングするために、両方に紐付ける証明書で承認するドメインは、一致させる必要がある。 |
| Route53 → CloudFront(+ACMのSSL証明書) → EC2                       | CloudFront                      |                                                                                                                                                        |
| Route53 → CloudFront(+ACMのSSL証明書) → S3                        | CloudFront                      |                                                                                                                                                        |
| Route53 → ALB(+ACMのSSL証明書) → EC2(+外部証明書)                 | EC2                             |                                                                                                                                                        |
| Route53 → NLB → EC2(+外部証明書)                                 | EC2                             |                                                                                                                                                        |
| Route53 → EC2(+外部証明書)                                       | EC2                             |                                                                                                                                                        |
| Route53 → Lightsail(+ACMのSSL証明書)                              | Lightsail                       |                                                                                                                                                        |

<br>

### SSL証明書の変更

#### ▼ SSL証明書の確認

Chromeを例に挙げると、SSL証明書はURLの鍵マークから確認できる。

**＊例＊**

CircleCIのサイトは、SSL証明書のためにACMを使用している。

![ssl_certificate_chrome](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ssl_certificate_chrome.png)

#### ▼ ダウンタイム

ALBではSSL証明書の変更でダウンタイムは発生しない。既存のセッションを維持しつつ、新しいSSL証明書が適用される。CloudFrontは謎...

> ℹ️ 参考：https://aws.typepad.com/sajp/2014/04/elb-ssl.html

<br>

## 02. Chatbot

### Chatbotとは

SNSを経由して、CloudWatchからの通知をチャットアプリケーションに転送するAWSリソース。

![ChatbotとSNSの連携](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ChatbotとSNSの連携.png)

<br>

### セットアップ

#### ▼ slack通知の場合

クライアントをSlackとした場合の設定を以下に示す。

| 設定項目   | 説明                                     |
|------------|----------------------------------------|
| Slackチャンネル | 通知の転送先のSlackチャンネルを設定する。           |
| アクセス許可   | SNSを介して、CloudWatchにアクセスするためのロールを設定する。 |
| SNSトピック    | CloudWatchへのアクセス時経由する、SNSトピックを設定する。 |

#### ▼ サポート対象のイベント

AWSリソースのイベントを、EventBridge（CloudWatchイベント）を使用して、Chatbotに転送できるが、全てのAWSリソースをサポートしているわけではない。サポート対象のAWSリソースは以下のリンクを参考にせよ。

> ℹ️ 参考：https://docs.aws.amazon.com/chatbot/latest/adminguide/related-services.html#cloudwatchevents

#### ▼ インシデント

４大シグナルを含む、システム的に良くない事象のこと。

#### ▼ オンコール

インシデントを通知するようにし、通知を受けて対応すること。

<br>

## 03. CloudFront

### CloudFrontとは

CDN（グローバルなキャッシュサーバー）かつクラウドリバースプロキシサーバーとして働く。リバースプロキシでもあるため、CloudFrontの後段にアプリケーションをおけば、アプリケーションをそのまま公開できる。VPCの外側（パブリックネットワーク）に設置されている。オリジンサーバー（コンテンツ提供元）をS3とした場合、動的コンテンツに対するリクエストをEC2に振り分ける。また、静的コンテンツに対するリクエストをキャッシュし、その上でS3へ振り分ける。次回以降の静的コンテンツのリンクエストは、CloudFrontがレンスポンスを行う。

![AWSのクラウドデザイン一例](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CloudFrontによるリクエストの振り分け.png)

### セットアップ

| 設定項目            | 説明 |
|---------------------|------|
| Distributions       |      |
| Reports & analytics |      |

<br>

### Distributions

#### ▼ Distributions

> ℹ️ 参考：https://www.geekfeed.co.jp/geekblog/wordpress%E3%81%A7%E6%A7%8B%E7%AF%89%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%82%8B%E3%82%A6%E3%82%A7%E3%83%96%E3%82%B5%E3%82%A4%E3%83%88%E3%81%ABcloudfront%E3%82%92%E7%AB%8B%E3%81%A6%E3%81%A6%E9%AB%98/

| 設定項目                 | 説明                                       | 補足 |
|--------------------------|--------------------------------------------|------|
| General                  |                                            |      |
| Origin and Origin Groups | コンテンツを提供するAWSリソースを設定する。                |      |
| Behavior                 | オリジンにリクエストが行われた時のCloudFrontの挙動を設定する。 |      |
| ErrorPage                | 指定したオリジンから、指定したファイルを含むレスポンスを返信する。   |      |
| Restriction              |                                            |      |
| Invalidation             | CloudFrontに保存されているキャッシュを削除できる。         |      |

#### ▼ General

| 設定項目            | 説明                                                                                       | 補足                                                                                                                                                                                                             |
|---------------------|------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Price Class         | 使用するエッジロケーションを設定する。                                                                    | Asiaが含まれているものを選択。                                                                                                                                                                                             |
| WAF                 | CloudFrontに紐付けるWAFを設定する。                                                               |                                                                                                                                                                                                                  |
| CNAME               | CloudFrontのデフォルトドメイン名（```*****.cloudfront.net.```）に紐付けるRoute53レコード名を設定する。            | ・Route53からルーティングする場合は必須。<br>・複数のレコード名を設定できる。                                                                                                                                                            |
| SSL Certificate     | HTTPSプロトコルでオリジンにルーティングする場合に設定する。                                                       | 上述のCNAMEを設定した場合、SSL証明書が別途必要になる。また、Certificate Managerを使用する場合、この証明書は『バージニア北部』で申請する必要がある。                                                                                                |
| Security Policy     | リクエストの送信者が使用するSSL/TLSプロトコルや暗号化方式のバージョンに合わせて、CloudFrontが受信できるこれらのバージョンを設定する。 | ・リクエストの送信者には、ブラウザ、APIにリクエストを送信する外部サービス、ルーティング元のAWSリソース、などを含む。<br>・ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html |
| Default Root Object | オリジンのドキュメントルートを設定する。                                                                     | ・何も設定しない場合、ドキュメントルートは指定されず、Behaviorで明示的にルーティングする必要がある。<br>・index.htmlを設定すると、『```/```』でリクエストした時に、オリジンのルートディレクトリ配下にある```index,html```ファイルがドキュメントルートになる。                                           |
| Standard Logging    | CloudFrontのアクセスログをS3に作成するか否かを設定する。                                                    |                                                                                                                                                                                                                  |

#### ▼ Origin and Origin Groups

| 設定項目               | 説明                                                                                         | 補足                                                                                                                                                        |
|------------------------|----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Origin Domain Name     | CloudFrontをリバースプロキシサーバーとして、AWSリソースのエンドポイントやDNSにルーティングする。                                     | ・例えば、S3のエンドポイント、ALBのDNS名を設定する。<br>・別アカウントのAWSリソースのDNS名であっても良い。                                                                                       |
| Origin Path            | オリジンのルートディレクトリを設定する。                                                                       | ・何も設定しないと、デフォルトは『```/```』のなる。Behaviorでは、『```/```』の後にパスが追加される。<br>・『```/var/www/foo```』を設定すると、Behaviorで設定したパスが『```/var/www/foo/foo```』のように追加される。 |
| Origin Access Identity | リクエストのルーティング先となるAWSリソースで認可スコープの紐付けが必要な場合に設定する。ルーティング先のAWSリソースでは、アクセスポリシーを紐付ける。 | CloudFrontがS3に対して読み出しを行うために必要。                                                                                                                        |
| Origin Protocol Policy | リクエストのルーティング先となるAWSリソースに対して、HTTPとHTTPSのいずれのプロトコルでルーティングするかを設定する。                         | ・ALBで必要。ALBのリスナーのプロトコルに合わせて設定する。<br>・```HTTP Only```：HTTPでルーティング<br>・```HTTPS Only```：HTTPSでルーティング<br>・```Match Viewer```：両方でルーティング                  |
| HTTPポート                | ルーティング時に指定するオリジンのHTTPのポート番号                                                             |                                                                                                                                                             |
| HTTPSポート               | ルーティング時に指定するオリジンのHTTPSのポート番号                                                            |                                                                                                                                                             |

#### ▼ Behavior

| 設定項目                       | 説明                                               | 補足                                                                                                                                                                                                                                                |
|--------------------------------|--------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Precedence                     | 処理の優先順位。                                     | 最初に作成したBehaviorが『```Default (*)```』となり、これは後から変更できないため、主要なBehaviorをまず最初に設定する。                                                                                                                                                           |
| Path pattern                   | Behaviorを行うパスを設定する。                             |                                                                                                                                                                                                                                                     |
| Origin and Origin Group        | Behaviorを行うオリジンを設定する。                           |                                                                                                                                                                                                                                                     |
| Viewer Protocol Policy         | HTTP/HTTPSのどちらを受信するか、またどのように変換してルーティングするかを設定 | ・```HTTP and HTTPS```：両方受信し、そのままルーティング<br>・```Redirect HTTP to HTTPS```：両方受信し、HTTPSでルーティング<br>・```HTTPS Only```：HTTPSのみ受信し、HTTPSでルーティング                                                                                                   |
| Allowed HTTP Methods           | リクエストのHTTPメソッドのうち、オリジンへのルーティングを許可するものを設定       | ・パスパターンが静的ファイルに対するリクエストの場合、GETのみ許可。<br>・パスパターンが動的ファイルに対するリクエストの場合、全てのメソッドを許可。                                                                                                                                                        |
| Object Caching                 | CloudFrontにコンテンツのキャッシュを保存しておく秒数を設定する。        | ・Origin Cacheヘッダーを選択した場合、アプリケーションからのレスポンスヘッダーのCache-Controlの値が適用される。<br>・カスタマイズを選択した場合、ブラウザのTTLとは別に設定できる。                                                                                                                             |
| TTL                            | CloudFrontにキャッシュを保存しておく秒数を詳細に設定する。         | ・Min、Max、Default、の全てを0秒とすると、キャッシュを無効化できる。<br>・『Headers = All』としている場合、キャッシュが実質無効となるため、最小TTLはゼロでなければならない。<br>・キャッシュの最終的な有効期間は、CloudFrontのTTL秒の設定、```Cache-Control```ヘッダー、```Expires```ヘッダーの値の組み合わせによって決まる。                 |
| Whitelist Header               | Headers を参考にせよ。                                  | ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html#ExpirationDownloadDist・```Accept-*****```：アプリケーションにレスポンスして欲しいデータの種類（データ型など）を指定。<br>・ ```CloudFront-Is-*****-Viewer```：デバイスタイプのboolean値が格納されている。 |
| Restrict Viewer Access         | リクエストの送信元を制限するか否かを設定できる。                   | セキュリティグループで制御できるため、ここでは設定しなくて良い。                                                                                                                                                                                                               |
| Compress Objects Automatically | レスポンス時に```.gzip```ファイルとして圧縮するか否かを設定          | ・クライアントからのリクエストヘッダーのAccept-Encodingにgzipが設定されている場合、レスポンス時に、gzip形式で圧縮して送信するか否かを設定する。設定しない場合、圧縮せずにレスポンスを送信する。<br>・クライアント側のダウンロード速度向上のため、基本的には有効化する。                                                                  |


#### ▼ オリジンに対するリクエストの構造

CloudFrontからオリジンに送信されるリクエストの構造例を以下に示す。

```yaml
GET /foo/
---
# リクエストされたドメイン名
Host: foo.com
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1
Authorization: Bearer <Bearerトークン>
X-Amz-Cf-Id: *****
Via: 2.0 77c20654dd474081d033f27ad1b56e1e.cloudfront.net (CloudFront)
# 各Cookieの値（二回目のリクエスト時に設定される）
Cookie: sessionid=<セッションID>; __ulfpc=<GoogleAnalytics値>; _ga=<GoogleAnalytics値>; _gid=<GoogleAnalytics値>
# 送信元IPアドレス
# ※プロキシ（ALBやCloudFrontなども含む）を経由している場合、それら全てのIPアドレスが順に設定される
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
CloudFront-Is-Mobile-Viewer: true
CloudFront-Is-Tablet-Viewer: false
CloudFront-Is-SmartTV-Viewer: false
CloudFront-Is-Desktop-Viewer: false
# リクエストの送信元の国名
CloudFront-Viewer-Country: JP
# リクエストのプロトコル
CloudFront-Forwarded-Proto: https
```

#### ▼ CloudFrontとオリジン間のHTTPSプロトコル

CloudFrontとオリジン間でHTTPSプロトコルを使用する場合、両方にSSL証明書を割り当てる必要がある。割り当てたとしても、以下の条件を満たさないとHTTPSプロトコルを使用することはできない。CLoudFrontからオリジンに```Host```ヘッダーをルーティングしない設定の場合、オリジンが返却する証明書に『Origin Domain Name』と一致するドメイン名が含まれている必要がある。一方で、```Host```ヘッダーをルーティングしない場合、オリジンが返却する証明書に『Origin Domain Name』と一致するドメイン名が含まれているか、またはオリジンが返却する証明書に、```Host```ヘッダーの値と一致するドメイン名が含まれている必要がある。

<br>

### Reports & analytics

#### ▼ Cache statistics

リクエストに関連する様々なデータを、日付別に集計したものを確認できる。

#### ▼ Popular objects

リクエストに関連する様々なデータを、オブジェクト別に集計したものを確認できる。

<br>

### オリジンリクエストの可否、キャッシュ作成の有無

#### ▼ オリジンリクエストの可否、キャッシュ作成の有無、の決まり方

オリジンにルーティングするべきリクエストを、各種パラメーターのAll（全許可）/一部許可/None（全拒否）で設定できる。また、キャッシュ作成の有無にも関係している。CloudFrontではリクエストがJSONとして扱われており、JSONの値が過去のリクエストに合致した時のみ、そのリクエストと過去のものが同一であると見なす仕組みになっている。キャッシュ判定時のパターンを減らし、ヒット率を向上させるために、全ての項目で『None（全拒否）』を選択した方が良い。最終的に、対象のファイルがCloudFrontのキャッシュ作成の対象となっているかは、レスポンスのヘッダーに含まれる『```X-Cache:```』が『```Hit from cloudfront```』または『```Miss from cloudfront```』のどちらで判断できる。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html
> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html

#### ▼ ヘッダー値に基づくキャッシュ作成

リクエストヘッダーのうち、オリジンへのルーティングを許可し、加えてキャッシュキーと見なすパラメーターを設定する。Cookieとクエリストリングと比べて、同じ設定でもキャッシュ作成の有無が異なることに注意する。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/header-caching.html#header-caching-web

| 機能名     | オリジンリクエストの可否                                 | キャッシュ作成の有無                                                                                                                                                                                                                                       |
|----------|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 全許可     | 全てのヘッダーのルーティングを許可する。                        | キャッシュを作成しない。                                                                                                                                                                                                                                       |
| 一部ルーティング | 一部のヘッダーのルーティングを拒否し、ヘッダーの無いリクエストをルーティングする。 | 指定したヘッダーのみをキャッシュキーとみなす。日付に関するヘッダー（例：Accept-Datetime）などの動的な値をキャッシュキーとしてしまうと。同一と見なすリクエストがほとんどなくなり、ヒットしなくなる。そのため、ヘッダーをオリジンにルーティングしつつ、動的になりやすい値を持つヘッダーをキャッシュキーにしないようにする必要がある。ヒット率の向上のため、クエリストリングやCookieの静的な値をキャッシュキーに設定すると良い。 |
| 全拒否     | 全てのヘッダーのルーティングを拒否し、ヘッダーの無いリクエストをルーティングする。  | キャッシュを作成しない。                                                                                                                                                                                                                                       |

#### ▼ Cookieに基づくキャッシュ作成

Cookie情報のキー名のうち、オリジンへのルーティングを許可し、加えてキャッシュキーと見なすパラメーターを設定する。リクエストのヘッダーに含まれるCookie情報（キー名/値）が変動していると、CloudFrontに保存されたキャッシュがヒットしない。CloudFrontはキー名/値を保持するため、変化しやすいキー名/値は、オリジンにルーティングしないように設定する。例えば、GoogleAnalyticsのキー名（```_ga```）の値は、ブラウザによって異なるため、1ユーザーがブラウザを変えるたびに、異なるキャッシュが作成されることになる。そのため、ユーザーを一意に判定することが難しくなってしまう。GoogleAnalyticsのキーはブラウザからAjaxでGoogleに送信されるもので、オリジンにとっても基本的に不要である。セッションIDは```Cookie```ヘッダーに設定されているため、フォーム送信に関わるパスパターンでは、セッションIDのキー名を許可する必要がある。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Cookies.html

| 機能名     | オリジンリクエストの可否                                     | キャッシュ作成の有無                                                                                                                             |
|----------|--------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| 全許可     | 全てのCookieのルーティングを許可する。                          | 全てのCookieをキャッシュキーとみなす。                                                                                                                    |
| 一部ルーティング | 一部のCookieのルーティングを拒否し、Cookieの無いリクエストをルーティングする。 | 指定したCookieのみキャッシュキーとみなす。Cookieはユーザーごとに一意になることが多く、動的であるが、それ以外のヘッダーやクエリ文字でキャッシュを判定するようになるため、同一と見なすリクエストが増え、ヒット率の向上につながる。 |
| 全拒否     | 全てのCookieのルーティングを拒否し、Cookieの無いリクエストをルーティングする。  | キャッシュを作成しない。                                                                                                                             |

#### ▼ クエリストリングに基づくキャッシュ作成

クエリストリングのうち、オリジンへのルーティングを許可し、加えてキャッシュキーと見なすパラメーターを設定する。異なるクエリパラメーターのキャッシュを別々に作成するか否かを設定できる。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/QueryStringParameters.html

| 機能名   | オリジンリクエストの可否                                              | キャッシュ作成の有無                |
|-------|-----------------------------------------------------------|------------------------------|
| 全許可   | 全てのクエリストリングのルーティングを許可する。                                 | 全てのクエリストリングをキャッシュキーとみなす。     |
| 一部拒否 | 一部のクエリストリングのルーティングを拒否し、クエリストリングの無いリクエストをオリジンにルーティングする。 | 指定したクエリストリングのみをキャッシュキーとみなす。 |
| 全拒否   | 全てのクエリストリングのルーティングを拒否し、クエリストリングの無いリクエストをルーティングする。       | キャッシュを作成しない。                |

#### ▼ Cookieやクエリストリングをオリジンにルーティングしつつ、キャッシュを作成しない場合

上記の設定では、Cookieやクエリストリングをオリジンにルーティングしつつ、キャッシュを作成しないようにできない。そこで、キャッシュの最大最小デフォルトの有効期間を```0```秒とすることにより、結果的にキャッシュを動作しないようにさせ、キャッシュが作成されていないかのように見せかけられる。

<br>

### ヘッダーキャッシュのヒット率向上

#### ▼ ヒット率の向上について

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/header-caching.html

<br>

### Cookieキャッシュのヒット率向上

#### ▼ ヒット率の向上について

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Cookies.html

<br>

### クエリストリングキャッシュのヒット率向上

#### ▼ ヒット率の向上について

CloudFrontは、クエリストリングによってオリジンからレスポンスされるファイルのキャッシュを作成し、次回、同じクエリストリングであった場合、キャッシュをレスポンスとして返信する。キャッシュ作成のルールを理解すれば、キャッシュのヒット率を向上させられる。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cache-hit-ratio.html#cache-hit-ratio-query-string-parameters
> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/QueryStringParameters.html#query-string-parameters-optimizing-caching

#### ▼ クエリストリングの順番を固定する

リクエスト時のクエリストリングの順番が異なる場合、CloudFrontはそれぞれを異なるURLに対するリクエストと見なし、別々にキャッシュを作成する。そのため、クエリストリングの順番を固定するようにURLを設計すれば、キャッシュのヒット率を向上させられる。

```yaml
GET https://example.com?fooId=1&barId=2
```

```yaml
GET https://example.com?barId=2&fooId=1
```

#### ▼ クエリストリングの大文字小文字表記を固定する

リクエスト時のクエリストリングの大文字小文字表記が異なる場合、CloudFrontはそれぞれを異なるURLに対するリクエストと見なし、別々にキャッシュを作成する。そのため、クエリストリングの大文字小文字表記を固定するようにURLを設計すれば、キャッシュのヒット率を向上させられる。

```yaml
GET https://example.com?fooId=1&barId=2
```

```yaml
GET https://example.com?FooId=1&BarId=2
```

#### ▼ 署名付きURLと同じクエリストリングを使用しない

S3には、署名付きURLを発行する機能がある。CloudFrontの仕様では、署名付きURLに含まれる```Expires```、```Key-Pair-Id```、```Policy```、```Signature```といったクエリストリングを削除したうえで、オリジンにリクエストをルーティングする。これらのパラメーターは、キャッシュヒットの判定要素として使用できない。そのため、URLの設計時にこれらを使用しないようにする。

<br>

### Invalidation（キャッシュの削除）

TTL秒によるキャッシュの自動削除を待たずに、手動でキャッシュを削除できる。全てのファイルのキャッシュを削除したい場合は『```/*```』、特定のファイルのキャッシュを削除したい場合は『```/<ファイルへのパス>```』、を設定する。CloudFrontに関するエラーページが表示された場合、不具合を修正した後でもキャッシュが残っていると、エラーページが表示されてしまうため、作業後には必ずキャッシュを削除する。

<br>

### エッジロケーションとエッジサーバー

#### ▼ Point Of Presence

CloudFrontは世界中に設置される『Point Of Presence（エッジロケーション+中間層キャッシュ）』にデプロイされる。

> ℹ️ 参考：https://aws.amazon.com/jp/cloudfront/features/?whats-new-cloudfront.sort-by=item.additionalFields.postDateTime&whats-new-cloudfront.sort-order=desc

#### ▼ エッジロケーションにおける全エッジサーバーのIPアドレス

CloudFrontには、エッジロケーションの数だけエッジサーバーがあり、各サーバーにIPアドレスが割り当てられている。以下のコマンドで、全てのエッジサーバーのIPアドレスを確認できる。

```bash
$ curl -X GET https://ip-ranges.amazonaws.com/ip-ranges.json \
    | jq  ".prefixes[]| select(.service=="CLOUDFRONT") | .ip_prefix"
```

もしくは、以下のリンクを直接的に参考し、『```"service": "CLOUDFRONT"```』となっている部分を探す。

> ℹ️ 参考：https://ip-ranges.amazonaws.com/ip-ranges.json

#### ▼ エッジロケーションの使用中サーバーのIPアドレス

CloudFrontには、エッジロケーションがあり、各ロケーションにサーバーがある。以下のコマンドで、エッジロケーションにある使用中サーバーのIPアドレスを確認できる。

```bash
$ nslookup <割り当てられた文字列>.cloudfront.net
```

<br>

### カスタムエラーページ

#### ▼ カスタムエラーページとは

オリジンに該当のファイルが存在しない場合、オリジンはCloudFrontに以下の```403```ステータスを含むレスポンスを返信する。カスタムエラーページを設定しない場合、CloudFrontはこの```403```ステータスをそのままレスポンスしてしまうため、オリジンに配置したカスタムエラーページを```404```ステータスでレスポンスするように設定する。

```html
This XML file does not appear to have any style information associated with it. The document tree is shown below.
<Error>
<Code>AccessDenied</Code>
<Message>Access Denied</Message>
<RequestId>*****</RequestId>
<HostId>*****</HostId>
</Error>
```

#### ▼ 設定方法

オリジンからカスタムエラーページをレスポンスするパスパターンを定義する。Lamnda@Edgeを使用したCloudFrontの場合は、Lambda@Edgeを経由して、カスタムエラーページをレスポンスする必要がある。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HTTPStatusCodes.html

<br>

## 04. CloudTrail

### CloudTrailとは

IAMユーザーによる操作や、ロールの紐付けの履歴を記録し、ログファイルとしてS3に転送する。CloudWatchと連携もできる。

![CloudTrailとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CloudTrailとは.jpeg)

<br>

## 05. CloudWatchメトリクス

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


| 集約名     | 説明    |
|-----|-----|
| ディメンション    | インスタンスの設定値をグループとした集約のこと（例：インスタンスID、スペック、AZ、など）。ディメンションが大きすぎると、異なる種類のデータポイントがごちゃまぜに集約される（例えば、EC2のストレージで、```/var/lib/foo```パーティションのストレージ使用率のデータポイントが```30```%だとする。EC2のインスタンスIDをディメンションにした場合に、```/var/lib/foo```以外のパーティションが```30```%より低いため、インスタンスIDのディメンション全体としては```10%```ほどのストレージ使用率になる）。CloudWatchアラームではディメンションしか指定できず、ディメンションを正確に集計する必要がある。
| 名前空間    | AWSリソースをグループとした集約のこと（例：EC2、RDS、ALB、など）。AWSリソース名で表す。cloudwatchエージェントでカスタムメトリクスを収集すると、名前空間はCWAgentになる。

#### ▼ 集約の確認方法

CloudWatchメトリクス上では、各集約を以下の様に確認できる。

> ℹ️ 参考：https://dev.classmethod.jp/articles/amazon-cloudwatch-logs-announces-dimension-support-for-metric-filters/

![cloudwatch_namespace_metric_dimension](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/cloudwatch_namespace_metric_dimension.png)

<br>

### インサイトメトリクス

#### ▼ インサイトメトリクスは

異なるメトリクスを再集計し、パフォーマンスに関するメトリクスとして提供する。

#### ▼ パフォーマンスインサイト

RDS（Aurora、非Aurora）のパフォーマンスに関するメトリクスのデータポイントを収集する。特定の集約（例：個別のクエリ）で監視できるようになる。パラメーターグループの```performance_schema```を有効化する必要がある。対応するエンジンバージョンとインスタンスタイプについては、以下のリンクを参考にせよ。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_PerfInsights.Enabling.html
> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PerfInsights.Overview.Engines.html

#### ▼ Containerインサイト

コンテナに関するAWSリソース（例：ECSクラスター/EKS Cluster、ECSサービス、ECSタスク、ECSコンテナ）のパフォーマンスに関するメトリクスのデータポイントを収集する。作成したメトリクスを特定の集約（例：個別のコンテナ）で扱えるになる。また、コンテナ間の繋がりをコンテナマップで視覚化できるようになる。ECS、EKSのアカウント設定でContainerインサイトを有効化する必要がある。

#### ▼ Lambdaインサイト

Lambdaのパフォーマンスに関するメトリクスのデータポイントを収集する。

<br>

## 06-02. CloudWatchログ

### CloudWatchログとは

クラウドログサーバーとして働く。AWSリソースで作成されたログを収集できる。

<br>

### セットアップ

| 設定項目       | 説明                                                                                  | 補足                                                                       |
|----------------|---------------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| ロググループ         | ログストリームをグループ化して収集するか否かを設定する。                                                    | 基本的に、ログファイルはグループ化せずに、```1```個のロググループには```1```個のログストリームしか含まれないようにする。 |
| メトリクスフィルター     | フィルターパターンに合致した文字列を持つログをトリガーとして、データポイントを発生させる。このデータポイントを集計し、メトリクスとして使用できる。 |                                                                            |
| サブスクリプションフィルター |                                                                                       |                                                                            |

<br>

### フィルターパターン

#### ▼ フィルターパターンとは

ログ内で検知する文字列を設定する。大文字と小文字を区別するため、網羅的に設定する必要がある。

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

『```ERROR:```』が含まれ、かつ『```MethodNotAllowedHttpException```』が含まれないログを検知する。OR条件と除外条件を組み合わせようとすると、OR条件が認識されずに除外条件だけが適用されてしまう。そのため、ここではOR条件を使用していない。

> ℹ️ 参考：https://dev.classmethod.jp/articles/cloudwatch-metricsfilter-filterpattern/

```yaml
"ERROR:" -MethodNotAllowedHttpException
```

<br>

### CloudWatchログエージェント（非推奨）

#### ▼ CloudWatchログエージェントとは

インスタンス内で稼働するデーモンのこと。インスタンス内のデータを収集し、CloudWatchログに対して送信する。執筆時点（2020/10/05）では非推奨で、cloudwatchエージェントへの設定の移行が推奨されている。

#### ▼ ```/var/awslogs/etc/awslogs.conf```ファイル

CloudWatchログエージェントを設定する。OS、ミドルウェア、アプリケーションに分類して設定すると良い。

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


## 06-03. cloudwatchエージェント

### cloudwatchエージェントとは

インスタンス系AWSリソース（EC2、ECS、EKS、Lambda）内で稼働するデーモンのこと。インスタンス内のメトリクスのデータポイントやログを収集し、CloudWatchに送信する。多くの場合、インスタンス系リソースは基本的なメトリクスを収集するが、一部のメトリクス（例：EC2のメモリ使用率やストレージ使用率）やログそのものを収集しない。cloudwatchエージェントを使用することにより、カスタムメトリクスやログを収集できるようにする。

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

cloudwatchエージェント全体を設定する。ウィザードを使用した場合、このセクションの設定はスキップされる。実装しなかった場合、デフォルト値が適用される。

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

AWSリソースが標準で収集しないカスタムメトリクスのデータポイントの収集について設定する。ウィザードを使用した場合、このセクションの設定はスキップされる。実装しなかった場合、何も設定されない。

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
          # ストレージ使用率メトリクス
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

## 06-04. CloudWatchアラーム

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

## 06-05. CloudWatchシンセティック

### CloudWatchシンセティックとは

合成監視を行えるようになる。

<br>

## 07. Code系サービス

### Code系サービス

#### ▼ CodePipeline

CodeCommit、CodeBuild、CodeDeployを連携させて、AWSに対するCI/CDパイプラインを作成する。CodeCommitは、他のコード管理サービスで代用できる。

![code-pipeline](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/code-pipeline.png)

#### ▼ CodeCommit

コードをバージョン管理する。

#### ▼ CodeBuild

ビルドフェーズとテストフェーズを実行する。

#### ▼ CodeDeploy

デプロイフェーズを実行する。

<br>

## 07-02. Code系サービス：CodeBuild

### ```buildspec.yml```ファイル

#### ▼ ECSの場合

ECSのために、CodeBuildの設定を行う。ルートディレクトリの直下に配置しておく。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html
> - https://docs.aws.amazon.com/codepipeline/latest/userguide/ecs-cd-pipeline.html

**＊実装例＊**

コンテナをビルドする場合を示す。コミットのハッシュ値でコンテナイメージをプッシュしたい場合、CodeBuildの設計上、```latest```タグもプッシュしておいた方が良い。

> ℹ️ 参考：https://stackoverflow.com/questions/61070900/can-codepipeline-use-a-specific-commit

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      docker: 18
  preBuild:
    commands:
      # ECRにログイン
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com
      # ECRのURLをCodeBuildの環境変数から作成
      - REPOSITORY_URI=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_REPO_NAME}
      # バージョンタグはコミットのハッシュ値を使用
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}
  build:
    commands:
      # タグ付けしてイメージをビルド
      - docker build -t $REPOSITORY_URI:latest .
      - docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG
  postBuild:
    commands:
      # ECRにコンテナイメージをプッシュする。
      # コミットハッシュ値のタグの前に、latestタグのコンテナイメージをプッシュしておく。
      - docker push $REPOSITORY_URI:latest
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      # ECRにあるデプロイ先のコンテナイメージの情報（imageDetail.json）
      - printf '[{"name":"hello-world","imageUri":"%s"}]' $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json
    
# デプロイ対象とするビルドのアーティファクト    
artifacts:
  files: imageDetail.json
```

<br>

## 07-03. CodeDeploy（EC2の場合）

### 利用できるデプロイメント手法

インプレースデプロイ、ブルー/グリーンデプロイメント、を利用できる。

> ℹ️ 参考：https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments.html

<br>

### インプレースデプロイメント

> ℹ️ 参考：https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html#welcome-deployment-overview-in-place

<br>

### ブルー/グリーンデプロイメント

> ℹ️ 参考：https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-groups-create-blue-green.html

<br>

## 07-03-02. CodeDeploy（Lambdaの場合）

### 利用できるデプロイメント手法

ブルー/グリーンデプロイメント、を利用できる。

> ℹ️ 参考：https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments.html

<br>

## 07-03-03. CodeDeploy（ECSの場合）

### 利用できるデプロイメント手法

ローリングアップデート、ブルー/グリーンデプロイメント、を利用できる。

> ℹ️ 参考：https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments.html

<br>

### ローリングアップデート

#### ▼ ```imagedefinitions.json```ファイル

新しいリビジョン番号のECSタスク定義を作成するために、新しいコンテナ名とイメージリポジトリURLを定義する。リポジトリに事前に配置するのではなく、CI/CDパイプライン中で動的に作成するようにした方が良い。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/codepipeline/latest/userguide/file-reference.html#pipelines-create-image-definitions
> - https://ngyuki.hatenablog.com/entry/2021/04/07/043415

```yaml
[
  {
    "imageUri": "<イメージリポジトリURL>", # <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/<イメージリポジトリ名>:latest
    "name": "<コンテナ名>"
  }
]
```

<br>

### ブルー/グリーンデプロイメント

#### ▼ 仕組み

![blue-green-deployment](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/blue-green-deployment.jpeg)

以下の手順でデプロイする。

1. ECRのコンテナイメージを更新
2. ECSタスク定義の新しいリビジョンを作成。
3. サービスを更新。
4. CodeDeployによって、ECSタスク定義を基に、現行の旧環境（Prodブルー）のECSタスクとは別に、新環境（Testグリーン）が作成される。ロードバランサーの接続先を、旧環境（Prodブルー）のターゲットグループ（Primaryターゲットグループ）に加えて、新環境（Testグリーン）にも向ける。
5. 社内から新環境（Testグリーン）のALBに、特定のポート番号でアクセスし、動作を確認する。
6. 動作確認で問題なければ、Console画面からの入力で、ロードバランサーの接続先を新環境（Testグリーン）のみに設定する。
7. 新環境（Testグリーン）が新しい旧環境としてユーザーに公開される。
8. 元の旧環境（Prodブルー）は削除される。

#### ▼ ```appspec.yml```ファイル

ルートディレクトリの直下に配置しておく。仕様として、複数のコンテナをデプロイできない。ECSタスク定義名を```<TASK_DEFINITION>```とすると、```taskdef.json```ファイルの値を元にして、新しいECSタスク定義が自動的に代入される。

> ℹ️ 参考：https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-resources.html

```yaml
version: 0.0

Resources:
  - TargetService:
      # 使用するAWSリソース
      Type: AWS::ECS::Service
      Properties:
        # 使用するECSタスク定義
        TaskDefinition: "<TASK_DEFINITION>"
        # 使用するロードバランサー
        LoadBalancerInfo:
          ContainerName: "<コンテナ名>"
          ContainerPort: "80"
        PlatformVersion: "1.4.0"
```

#### ▼ ```imageDetail.json```ファイル

新バージョンタグを含むイメージリポジトリURLを、```taskdef.json```ファイルの ```<IMAGE1_NAME>```に代入するために必要である。これはリポジトリに事前に配置するのではなく、CI/CDパイプライン中で動的に作成するようにした方が良い。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/codepipeline/latest/userguide/file-reference.html#file-reference-ecs-bluegreen
> - https://ngyuki.hatenablog.com/entry/2021/04/07/043415

#### ▼ ```taskdef.json```ファイル

デプロイされるECSタスク定義を実装し、ルートディレクトリの直下に配置する。CodeDeployは、CodeBuildから渡された```imageDetail.json```ファイルを検知し、ECRからコンテナイメージを取得する。この時、```taskdef.json```ファイルのコンテナイメージ名を```<IMAGE1_NAME>```としておくと、```imageDetail.json```ファイルの値を元にして、新バージョンタグを含むイメージリポジトリURLが自動的に代入される。

> ℹ️ 参考：
>
> - https://ngyuki.hatenablog.com/entry/2021/04/07/043415
> - https://docs.aws.amazon.com/codepipeline/latest/userguide/tutorials-ecs-ecr-codedeploy.html#tutorials-ecs-ecr-codedeploy-taskdefinition

```yaml
{
  "family": "<ECSタスク定義名>",
  "requiresCompatibilities": [
    "FARGATE"
  ],
  "networkMode": "awsvpc",
  "taskRoleArn": "<タスクロールのARN>",
  "executionRoleArn": "<タスク実行ロールのARN>",
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "<コンテナ名>",
      "image": "<IMAGE1_NAME>",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80,
          "protocol": "tcp"
        }
      ],
      "secrets": [
        {
          "name": "DB_HOST",
          "valueFrom": "/ecs/DB_HOST"
        },
        {
          "name": "DB_DATABASE",
          "valueFrom": "/ecs/DB_DATABASE"
        },
        {
          "name": "DB_PASSWORD",
          "valueFrom": "/ecs/DB_PASSWORD"
        },
        {
          "name": "DB_USERNAME",
          "valueFrom": "/ecs/DB_USERNAME"
        },
        {
          "name": "REDIS_HOST",
          "valueFrom": "/ecs/REDIS_HOST"
        },
        {
          "name": "REDIS_PASSWORD",
          "valueFrom": "/ecs/REDIS_PASSWORD"
        },
        {
          "name": "REDIS_PORT",
          "valueFrom": "/ecs/REDIS_PORT"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "<ログストリーム名>",
          # スタックトレースのログを紐付けられるように、日付で区切るようにする。
          "awslogs-datetime-format": "\\[%Y-%m-%d %H:%M:%S\\]",
          "awslogs-region": "ap-northeast-1",
          "awslogs-stream-prefix": "<ログストリーム名の接頭辞>"
        }
      }
    }
  ]
}
```

<br>

## 07-03-04. CodeDeployと他のAWSリソースとの連携

### オートスケーリング

> ℹ️ 参考：https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-auto-scaling.html

### ALB、ELB、NLB

#### ▼ インプレースデプロイメントの場合

CodeDeployのデプロイの途中、ターゲットグループからインスタンスを切り離すことにより、インバウンド通信のインスタンスへのルーティングを遮断する。そのため、デプロイ中にユーザーはアプリにアクセスできなくなる。デプロイが正常に完了次第、ターゲットグループにインスタンスを再登録し、アクセスできるようにする。

> ℹ️ 参考：https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-elastic-load-balancing.html#integrations-aws-elastic-load-balancing-in-place
