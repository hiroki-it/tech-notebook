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

#### ▼ コンソール画面

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

<br>

## 08. ControlTower

### ControlTowerとは

複数のAWSアカウントとIAMグループを```1```個のダッシュボードで管理する。既存のアカウントをControlTowerに移行する場合、既存のアカウントで作成されたIAMユーザーとIAMグループが不要になるため、これらを削除する必要がある。

<br>
