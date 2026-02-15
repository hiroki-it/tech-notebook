---
title: 【IT技術の知見】システム
description: システムの知見を記録しています。
---

# システム

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. システム

### システムとは

ソフトウェア (OS、ミドルウェア、アプリケーション) とハードウェアの要素と合わせたグループのこと。

![software](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software.png)

> - https://thinkit.co.jp/article/11526

<br>

### 構成要素の関係性

ユーザーの操作による命令が、ソフトウェアを経由して、ハードウェアに伝わるまでを以下に示す。

![ソフトウェアとハードウェア](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ソフトウェアとハードウェア.png)

<br>

## 02. Webシステム

### Webシステムとは

システムのうちで、特にWeb技術に関するもののこと。

ハードウェアとしてのWebサーバー/Appサーバー/DBサーバーと、Webに関するソフトウェアからなる。

近年は、仮想環境を使用してWebシステムのハードウェア部分を作成することが多い。

そのため、Web/App/DBサーバーではなく、仮想Web/App/DB環境と呼ぶほうが適切かもしれない。

![web-server_app-server_db-server](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/web-server_app-server_db-server.png)

> - http://www.iwass.co.jp/dev/devweb.html

<br>

### Webシステムのミドルウェア

#### ▼ Webサーバー、Appサーバーが必要な場合

NginxまたはEnvoyを使用する場合で考えるとする。

| 経路             | Javaの一例        | PHPの一例         | Pythonの一例      |
| ---------------- | :---------------- | ----------------- | ----------------- |
| リバースプロキシ | Envoy、Nginx      | Envoy、Nginx      | Envoy、Nginx      |
| ⬇️⬆️             | ⬇️⬆️              | ⬇️⬆️              | ⬇️⬆️              |
| Webサーバー      | Nginx             | Nginx             | Nginx             |
| ⬇️⬆️             | ⬇️⬆️              | ⬇️⬆️              | ⬇️⬆️              |
| Appサーバー      | Apache Tomcat     | なし              | Uvicorn           |
| ⬇️⬆️             | ⬇️⬆️              | ⬇️⬆️              | ⬇️⬆️              |
| DBサーバー       | MySQL、PostgreSQL | MySQL、PostgreSQL | MySQL、PostgreSQL |

> - https://qiita.com/tanayasu1228/items/11e22a18dbfa796745b5#%E3%81%93%E3%81%93%E3%81%A7%E7%96%91%E5%95%8F%E3%81%AB%E6%80%9D%E3%81%86%E3%81%93%E3%81%A8%E3%81%8C%E3%81%82%E3%82%8A%E3%81%BE%E3%81%99%E3%82%88%E3%81%AD
> - https://rikues2012.hatenablog.com/entry/2021/09/10/193349

#### ▼ Webサーバー、Appサーバーが不要な場合

Go、JavaScript、ではWebサーバーとAppサーバーがいらない。

| 経路             | Go、JavaScriptの場合                        |
| ---------------- | :------------------------------------------ |
| リバースプロキシ | Envoy、Nginx                                |
| ⬇️⬆️             | ⬇️⬆️                                        |
| Webサーバー      | なし                                        |
| ⬇️⬆️             | ⬇️⬆️                                        |
| Appサーバー      | なし (Go、JavaScriptのアプリケーションのみ) |
| ⬇️⬆️             | ⬇️⬆️                                        |
| DBサーバー       | MySQL、PostgreSQL                           |

> - https://teratail.com/questions/103909

<br>

## 02-02. フォワード/リバースプロキシサーバー

### フォワード/リバースプロキシサーバーとは

クライアントとWebサーバーの間にあり、Webサーバーへのロードバランシングやキャッシュ作成を担う。

<br>

### Webサーバーとの違い

Webサーバーとは異なり、静的ファイル (例：`html` ファイル、`css` ファイル、画像、動画、メールなど) を直接的に提供できない。

一方で、Webサーバーはロードバランシングが苦手である。

<br>

### 能力

#### ▼ ロードバランシング

![フォワードプロキシサーバーとリバースプロキシサーバー](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/フォワードプロキシサーバーとリバースプロキシサーバー.png)

| サーバー名                 | 処理                                                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| フォワードプロキシサーバー | 特定のクライアントのアウトバウンド通信を、不特定多数の宛先にロードバランシングする。                                                      |
| リバースプロキシサーバー   | 不特定のクライアントからのインバウンド通信を、特定のWebサーバーにロードバランシングする。また、ロードバランサーのように負荷分散もできる。 |

> - https://www.winserver.ne.jp/column/about_reverse-proxy/#i-5
> - https://www.fenet.jp/infla/column/server/%E3%83%AA%E3%83%90%E3%83%BC%E3%82%B9%E3%83%97%E3%83%AD%E3%82%AD%E3%82%B7%E3%81%A8%E3%81%AF%EF%BC%9F%E4%BB%95%E7%B5%84%E3%81%BF%E3%82%84%E7%94%A8%E9%80%94%E3%82%92%E8%A7%A3%E8%AA%AC%EF%BC%81/
> - https://qiita.com/att55/items/162950627dc593c72f23

#### ▼ 静的コンテンツのキャッシュ作成

以前にWebサーバーが返却した静的コンテンツのキャッシュを作成する。

![プロキシサーバーのキャッシュ能力](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/プロキシサーバーのキャッシュ能力.png)

| サーバー名                 | 処理                                                                       |
| -------------------------- | -------------------------------------------------------------------------- |
| フォワードプロキシサーバー | クライアント側にて、ロードバランシングのレスポンスのキャッシュを作成する。 |
| リバースプロキシサーバー   | サーバー側にて、ロードバランシングのレスポンスのキャッシュを作成する。     |

> - https://www.winserver.ne.jp/column/about_reverse-proxy/#i-5
> - https://www.fenet.jp/infla/column/server/%E3%83%AA%E3%83%90%E3%83%BC%E3%82%B9%E3%83%97%E3%83%AD%E3%82%AD%E3%82%B7%E3%81%A8%E3%81%AF%EF%BC%9F%E4%BB%95%E7%B5%84%E3%81%BF%E3%82%84%E7%94%A8%E9%80%94%E3%82%92%E8%A7%A3%E8%AA%AC%EF%BC%81/
> - https://software.fujitsu.com/jp/manual/manualfiles/M100003/B1WN9491/07Z201/ihs02/ihs00016.htm

#### ▼ SSL/TLS終端

リバースプロキシをSSL/TLS終端として、HTTPプロトコルでWebサーバーにリクエストをロードバランシングする。

> - https://pig-log.com/nginx-reverseproxy-ssl/

<br>

### 配置場所

#### ▼ 物理サーバーの場合

フォワードプロキシサーバーはプロバイダの会社に、リバースプロキシサーバーはリクエスト先の社内ネットワークに配置されている。

![proxy-server](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/proxy-server.png)

#### ▼ クラウド上の場合

クラウドの場合も、仮想環境が作成されるのみで、配置場所は同じである。

各CDNが提供するDNS (例：Akamaiなら `<ドメイン名>.edgekey.net`、AWSなら `<自動発行されるランダム文字列>.cloudfront.net`) を、ドメインレジストリのレコードに登録する。

このDNSからエッジサーバーのIPアドレスを正引きできる。

- Akamai
- AWS CloudFront
- CDNetworks
- Cloudflare
- Fastly

> - https://www.underworks.co.jp/dmj/2023/01/23/content-delivery-network-service/

<br>

## 02-03. Webサーバー

### Webサーバーとは

静的コンテンツを返却するミドルウェア (例：Apache、Nginxなど) を稼働させるためのサーバーのこと。

また、WebサーバーかつAppサーバーのミドルウェアとして動作する (例：NGINX Unit) がインストールされていることもある。

<br>

### 能力

#### ▼ 静的コンテンツのレスポンス

ブラウザから静的コンテンツのみのリクエストがあった場合、静的コンテンツをレスポンスする。

Appサーバーにはリクエストを送信しない。

| 経路             | 処理の内容                                     |
| ---------------- | :--------------------------------------------- |
| リバースプロキシ | ロードバランシング、静的コンテンツのキャッシュ |
| ⬇️⬆️             | ⬇️⬆️                                           |
| Webサーバー      | 静的コンテンツの返却                           |
| ⬇️⬆️             |                                                |
| Appサーバー      |                                                |
| ⬇️⬆️             |                                                |
| DBサーバー       |                                                |

#### ▼ 静的 + 動的コンテンツのレスポンス

静的コンテンツと動的コンテンツの両方のリクエストがあった場合、Appサーバーに動的コンテンツのリクエストを送信する。

Appサーバーからレスポンスを受け取り、ブラウザにレスポンスを実行する。

| 経路             | 処理の内容                                     |
| ---------------- | :--------------------------------------------- |
| リバースプロキシ | ロードバランシング、静的コンテンツのキャッシュ |
| ⬇️⬆️             | ⬇️⬆️                                           |
| Webサーバー      | 静的コンテンツの返却                           |
| ⬇️⬆️             | ⬇️⬆️                                           |
| Appサーバー      | 動的コンテンツの返却                           |
| ⬇️⬆️             |                                                |
| DBサーバー       |                                                |

#### ▼ SSL/TLS終端

WebサーバーをSSL/TLS終端として、HTTPプロトコルでAppサーバーにリクエストをロードバランシングする。

> - https://www.f5.com/ja_jp/glossary/https

<br>

## 02-04. Appサーバー

### Appサーバーとは

動的コンテンツを返却するミドルウェア (例：PHPならPHP-FPM、JavaならApache Tomcat) を稼働させるためのサーバーのこと。

<br>

### 能力

#### ▼ 動的コンテンツのレスポンス

Webサーバーから動的コンテンツのリクエストがあった場合、プログラミング言語を言語プロセッサーで翻訳し、DBサーバーにクエリを送信する。

DBサーバーからのレスポンスを受け取り、Webサーバーに動的なコンテンツのレスポンスを実行する。

| 経路             | 処理の内容                                     |
| ---------------- | :--------------------------------------------- |
| リバースプロキシ | ロードバランシング、静的コンテンツのキャッシュ |
| ⬇️⬆️             | ⬇️⬆️                                           |
| Webサーバー      | 動的コンテンツの返却                           |
| ⬇️⬆️             | ⬇️⬆️                                           |
| Appサーバー      | 動的コンテンツの返却                           |
| ⬇️⬆️             | ⬇️⬆️                                           |
| DBサーバー       | DBレコードの返却                               |

<br>

## 02-05. DBサーバー

### DBサーバーとは

DB管理システムを稼働させるためのサーバーのこと。

<br>
