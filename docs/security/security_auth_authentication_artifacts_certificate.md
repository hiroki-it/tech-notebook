---
title: 【IT技術の知見】証明書ベース認証＠認証アーティファクトによる分類
description: 証明書ベース認証＠認証アーティファクトによる分類の知見を記録しています。
---

# 証明書ベース認証＠認証アーティファクトによる分類

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 暗号ダイジェスト (署名) について

### 暗号ダイジェスト (署名) を使用した暗号化技術

#### ▼ 暗号ダイジェスト (署名) とは

『公開鍵暗号方式とは逆の仕組み (※つまり、公開鍵暗号方式ではない) 』と『ハッシュ関数』を利用した暗号化。

『なりすまし』と『改竄』を防げる。

![署名](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/デジタル署名.png)

**＊サーバーが実行すること＊**

`(1)`

: サーバーは、受信者 (クライアント) にあらかじめ公開鍵を配布しておく。

`(2)`

: 平文をハッシュ化し、ダイジェストにする。

`(3)`

: ダイジェストを秘密鍵で暗号化し、暗号ダイジェスト (署名) を作成する。

`(4)`

: 『平文』、『暗号ダイジェスト (署名) 』を送信する。

**＊受信者 (クライアント) が実行すること＊**

`(1)`

: 受信者 (クライアント) は、『平文』と『暗号ダイジェスト (署名) 』を受信する。

`(2)`

: 平文をハッシュ化し、ダイジェストにする。

`(3)`

: 上記`2`個のダイジェストが同一なら、『なりすまし』と『改竄』が行われていないと判断

#### ▼ 暗号ダイジェスト (署名) のメリット

`(1)`

: 改竄を防げる

サーバーから送られた『平文』と『暗号ダイジェスト』のどちらかが、通信の途中で改竄された場合、これらのダイジェストが同じになることは確率的にありえない。

したがって、確かに改竄されていないと判断可能。

`(2)`

: なりすましを防げる

特定の秘密鍵を持つのは、特定のサーバーだけ。

したがって、確かにサーバーによって暗号化されたものだと判断可能。

#### ▼ 暗号ダイジェスト (署名) のデメリット

**★★公開鍵のなりすましを防げない★★**

二者間だけのやり取りでは、あらかじめ受信者に渡される公開鍵が偽の送信者のものであっても、確かめる術がない。

これを保障する仕組みに、PKI (公開鍵基盤) がある。

<br>

### 暗号ダイジェスト (署名) と公開鍵暗号方式を使用した暗号化技術

『なりすまし』と『改竄』を防げる署名に、『情報漏洩』を防げる公開鍵暗号方式を組み込んだ暗号化技術。

![署名と暗号化](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/署名と暗号化.png)

<br>

## 02. ドメイン認証

認証局は、『署名』された『証明書』を作成する。

CA証明書や署名済みの証明書を通信の送受信者に配置し、通信のたびに署名の有効性を『検証』する。

<br>

## 02-02. 公開鍵基盤

### 公開鍵基盤とは

公開鍵検証を使用して、秘密鍵と証明書はドメインの正当性 (偽のサイトではないこと) を担保する仕組みのこと。

署名に使用した秘密鍵とペアになる公開鍵は、なりすました人物による偽の公開鍵の可能性がある。

第三者機関の認証局によって、署名済み証明書を発行し、通信のたびに署名を検証する仕組みを、公開鍵基盤という。

![ssl-certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ssl-certificate.png)

<br>

### 公開鍵基盤の仕組み

公開鍵基盤には、証明書の『署名』と『検証』のフェーズがある。

![public-key-infrastructure](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/public-key-infrastructure.gif)

<br>

### サーバー認証の場合

#### ▼ 証明書の署名

ここでは中間認証局はないものとする。

中間認証局がいる場合、もう少し複雑な仕組みになる。

`(1)`

: サーバーは公開鍵と秘密鍵を作成する。秘密鍵から証明書署名要求を作成する。

`(2)`

: サーバーはルート認証局に証明書署名要求を送信する。

`(3)`

: ルート認証局は証明書署名要求からハッシュ値を算出し、ルート認証局のもつ秘密鍵を使用してハッシュ値を暗号化する。もとの証明書署名要求とハッシュ値を組み合わせたものを証明書とする。S/MIMEで使用する場合には、『S/MIME証明書』、SSL/TLSで使用する場合には、『サーバー証明書』という。

`(4)`

: サーバーに署名済み証明書 (S/MIME証明書、サーバー証明書) をインストールする。

![certificate_sign](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/certificate_sign.png)

> - https://dev.classmethod.jp/articles/ssl-certificate-system/
> - https://blog.serverworks.co.jp/server-cert-verification

#### ▼ TLSハンドシェイク開始

クライアントはサーバーにTLSハンドシェイクを開始する。

#### ▼ 証明書の検証

ここでは中間認証局はないものとする。

中間認証局がいる場合、もう少し複雑な仕組みになる。

`(1)`

: TLSハンドシェイク開始後、サーバーはクライアント (例：ブラウザ) に署名済み証明書とルート認証局のCA証明書をクライアントに返信する。

`(2)`

: クライアントは、ルート認証局のCA証明書に含まれる公開鍵を使用して、署名済み証明書のハッシュ値を復号する。また、署名済み証明書のもとになった証明書署名要求からハッシュ値を算出する。これらのハッシュ値が同じなら、正しい証明書であると判定する。

![certificate_validate](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/certificate_validate.png)

> - https://dev.classmethod.jp/articles/ssl-certificate-system/
> - https://blog.serverworks.co.jp/server-cert-verification

#### ▼ 識別子の照合

1. 送信元マイクロサービスはサーバー証明書のFQDNが宛先ホスト名と一致しているかを照合する。
2. 宛先マイクロサービスはクライアント証明書のID (例：SPIFEE IDなど) と認可設定を照合する。

#### ▼ 共通鍵交換

暗号スイートで指定された鍵交換アルゴリズム (例：ECDHE) により、送信元マイクロサービスと宛先マイクロサービス間で鍵合意し、共通鍵を共有する。

#### ▼ TLSハンドシェイク終了

記入中...

<br>

## 02-03. 認証局

### 認証局とは

自前の中間認証局あるいはクラウドプロバイダーが中間認証局を利用し、証明書を署名する。

**＊例＊**

| 方法の種類   | 中間認証局名                | ルート認証局名 |
| ------------ | --------------------------- | -------------- |
| 自前         | Vault                       | 記入中...      |
| AWS          | AWS Trust Services          | Starfield社    |
| Google Cloud | Google Cloud Trust Services | 記入中...      |

> - https://speakerdeck.com/jacopen/gai-metexue-bu-vaultfalseji-ben?slide=54

<br>

### 中間認証局をルート認証局で署名する理由

証明書 (S/MIME証明書、サーバー証明書) を発行する中間認証局そのものが、なりすましの可能性がある。

そこで、認証局をランク付けし、ルート認証局が下位ランクの認証局に権限を与えることにより、下位の認証局の信頼性を持たせている。

注意点として、ルート認証局は専門機関から厳しい審査を受けているため、ルート認証局自体がなりすましの可能性は非常に低い。

![認証局自体のなりすまし防止](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/認証局自体の成りすまし防止.png)

> - https://zeropasoakita.livedoor.blog/archives/20294837.html

<br>

## 02-04. 証明書の種類

### CA証明書 (ルート証明書、トラストアンカー)

『ルート証明書』『トラストアンカー』ともいう。

ルート認証局が、自身の信頼性を担保するために発行する証明書のこと。

ルート認証局は、ブラウザの開発会社の厳しい監査を受けているため、CA証明書を自己署名できる。

CA証明書は、各種OSでインストールできる。

```bash
# Ubuntuの場合
# https://ubuntu.com/server/docs/security-trust-store
$ apt-get install -y ca-certificates

# Redhatの場合
# https://jermsmit.com/install-a-ca-certificate-on-red-hat-enterprise-linux/
$ yum install -y ca-certificates
```

> - https://itra.co.jp/webmedia/points_of_ssl_ca_certification.html
> - https://www.quora.com/What-is-the-difference-between-CA-certificate-and-SSL-certificate
> - https://www.nic.ad.jp/ja/newsletter/No69/0800.html

<br>

### 中間CA証明書

ルート認証局に自身の信頼性を担保してもらうために、中間認証局が発行する証明書のこと。

ルート認証局が中間認証局の中間CA証明書を署名することにより、中間認証局は自身の信頼性を担保する。

もしルート認証局に署名されていない中間認証局でサーバー証明書を署名すると、『このWebサイトで提示されたセキュリティ証明書は、信頼された証明機関から発行されたものではありません』といったような警告文が出る。

> - https://itra.co.jp/webmedia/points_of_ssl_ca_certification.html

<br>

### リーフ証明書

記入中...

> - https://itkq.jp/blog/2020/06/20/x509-chain/

<br>

### サーバー証明書

証明書をSSLに使用する場合、特にサーバー証明書という。

Webサイトのドメインの購入者が、ペアになる秘密鍵と組み合わせることにより、ドメインの所有者であることを認証する。

ただし、ドメインの購入者は自分で自分を認証できないため、代わりにルート認証局がこれを担保する。

中間CA証明書を使用してサーバー証明書を著名する場合、サーバー証明書の内容と中間CA証明書と連結する。

より下位の証明書から順番に連結していく。

```yaml
---
-----BEGIN CERTIFICATE-----
サーバー証明書の内容
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
最下位の中間CA証明書の内容
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
より上位の中間CA証明書の内容
-----END CERTIFICATE-----
```

> - https://www.mtioutput.com/entry/2019/01/02/090000
> - https://portal.kitcloud.net/documents/1356
> - https://diary.bis5.net/2013/12/10/450.html

<br>

### 証明書バンドル

認証局によってサーバー証明書の発行方法は異なり、単体あるいはセットで発行する場合がある。

ルート認証局と中間認証局のサーバー証明書がセットになったファイルを証明書バンドルという。

> - https://www.ssldragon.com/blog/what-is-a-ca-bundle-and-where-to-find-it/

<br>

### クライアント証明書

リクエストの送信元に配置する証明書である。

サーバー証明書をサーバー側に配置した上で、クライアント証明書を持つクライアントのみがHTTPSリクエストでサーバー側に通信できるようにする。

ペアになる秘密鍵もクライアント側に配置することになるため、クライアント側にはクライアント証明書と秘密鍵の両方を配置することになる。

![client-certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/client-certificate.png)

> - https://www.cybertrust.co.jp/blog/certificate-authority/client-authentication/client-certificate-authentication.html

<br>

## 02-05. 規格

### 一覧

各証明書は、X.509規格で定められた公開鍵や検証アルゴリズムに基づいている。

| 規格名              | 定義元                   | 概要・対象                                                     |
| ------------------- | ------------------------ | -------------------------------------------------------------- |
| X.509               | ITU-T (国際電気通信連合) | デジタル証明書の基本構造と検証モデルを定義する国際規格である。 |
| RFC 5280            | IETF                     | SAN の使用、証明書検証手順、拡張項目の扱いを定義する。         |
| RFC 6125            | IETF                     | TLS におけるサーバー名の検証方法を定義する。                   |
| RFC 2818            | IETF                     | HTTP over TLS (HTTPS) の仕様を定義する。                       |
| RFC 5280 Appendix A | IETF                     | SAN の構文 (ASN.1形式) や使用例を含む技術的詳細を定義する。    |
| RFC 2459            | IETF                     | RFC 5280 の前身である。                                        |

> - https://ja.wikipedia.org/wiki/X.509

<br>
### SAN (Subject Alternative Name)

証明書の識別子である。

- DNS Name (例：`www.example.com`)
- IPアドレス (例：`192.0.2.1`)
- URI (例：`spiffe://cluster.local/ns/default/sa/default`)
- メールアドレス
- ディレクトリ名 (LDAP識別子など)

## 02-06. CA証明書の配置

### 自己署名CA証明書 (オレオレCA証明書) の作成

サーバーやクライアント自身が自己署名する方法があるが、別に自己署名したルート認証局を作成する方法もある。

自己署名したオレオレのルート認証局で署名して、オレオレのサーバー証明書やクライアント証明書を作成することもできる。

```bash
$ openssl x509 \
    -days 3650 \
    -req \
    -sha256 \
    -signkey ca.key \
    -in ca.csr \
    -out ca.crt
```

> - https://qiita.com/paseri2022/items/a250ccf415819996163b#%E3%83%AB%E3%83%BC%E3%83%88%E8%AA%8D%E8%A8%BC%E5%B1%80%E3%82%AA%E3%83%AC%E3%82%AA%E3%83%AC%E8%AA%8D%E8%A8%BC%E5%B1%80%E3%82%92%E4%BD%9C%E6%88%90%E3%81%99%E3%82%8B
> - https://ken-ohwada.hatenadiary.org/entry/2021/02/27/122111

<br>

## 02-08. サーバー証明書の配置

### サーバー証明書と秘密鍵の配置場所

#### ▼ ミドルウェアの場合

ミドルウェアごとに、デフォルトのディレクトリが異なる。

例えばNginxならば、`/etc/nginx/ssl`ディレクトリ配下にサーバー証明書 (`.crt`) と`/etc/ssl/private`ディレクトリ配下に秘密鍵 (`.key`) の両方を配置する。

> - https://www.networkinghowtos.com/howto/configure-nginx-to-use-ssl-certificates/
> - https://qiita.com/yuta_vamdemic/items/613490ca284bd50da213

#### ▼ OSの場合

OSごとに、デフォルトのディレクトリが異なる。

例えばUbuntuならば、`/etc/ssl/certs`ディレクトリ配下にサーバー証明書 (`.crt`) を、`/etc/ssl/private`ディレクトリ配下に秘密鍵 (`.key`) を配置する。

> - https://ubuntu.com/server/docs/security-certificates
> - https://scrapbox.io/nwtgck/Ubuntu%E3%81%A7SSL%E8%A8%BC%E6%98%8E%E6%9B%B8%E3%81%AF%E3%81%A9%E3%81%AE%E3%83%87%E3%82%A3%E3%83%AC%E3%82%AF%E3%83%88%E3%83%AA%E5%86%85%E3%81%AB%E7%BD%AE%E3%81%8F%E3%81%B9%E3%81%8D%E3%81%8B%EF%BC%9F

<br>

### 自己署名サーバー証明書 (オレオレサーバー証明書) の作成

#### ▼ サーバー証明書の作成に必要なもの

| ファイル       | 説明                                                                     | 拡張子                                |
| -------------- | ------------------------------------------------------------------------ | ------------------------------------- |
| 秘密鍵         | サーバー証明書とペアになる秘密鍵として動作する。                         | `pem`、`.key`、`.txt`                 |
| 証明書署名要求 | 秘密鍵から作成され、公開鍵であるサーバー証明書を作成するために使用する。 | `.csr`、`.txt`                        |
| サーバー証明書 | 秘密鍵とペアになる公開鍵として動作する。                                 | `pem`、`.crt`、`.cert`、`.ca`、`.txt` |

> - https://www.ssl-concier.com/news/topics/164
> - https://install-memo.hatenadiary.org/entry/20110906/1315291837
> - https://qiita.com/kunichiko/items/12cbccaadcbf41c72735#crt-cer-key-csr%E3%81%AF%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E3%82%A8%E3%83%B3%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E3%81%A7%E3%81%AF%E3%81%AA%E3%81%8F%E5%86%85%E5%AE%B9%E3%82%92%E8%A1%A8%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B

#### ▼ 作成手順

以下のコマンドをサーバー側で実施し、秘密鍵 (後にサーバー証明書とペアになる) 、証明書署名要求、サーバー証明書を作成する。

この時のルート認証局は『自分』である。

`(1)`

: サーバー証明書の有効期限が切れてしまい、HTTPSリクエストを送信できなくなってしまったとする。

```bash
$ curl https://foo.example.com -v

*   Trying *.*.*.*...
* TCP_NODELAY set
* Connected to foo.example.com (*.*.*.*) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* Cipher selection: ALL:!EXPORT:!EXPORT40:!EXPORT56:!aNULL:!LOW:!RC4:@STRENGTH
* successfully set certificate verify locations:
*   CAfile: /etc/pki/tls/certs/ca-bundle.crt
  CApath: none
* TLSv1.2 (OUT), TLS header, Certificate Status (22):
* TLSv1.2 (OUT), TLS handshake, Client hello (1):
* TLSv1.2 (IN), TLS handshake, Server hello (2):
* TLSv1.2 (IN), TLS handshake, Certificate (11):
* TLSv1.2 (OUT), TLS alert, certificate expired (557):
* SSL certificate problem: certificate has expired
* Closing connection 0
curl: (60) SSL certificate problem: certificate has expired
More details here: https://curl.haxx.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.
```

`(2)`

: 秘密鍵 (`.key`ファイル) を作成する。

```bash
$ openssl genrsa 2048 -keyout server.key

Generating RSA private key, 2048 bit long modulus
.............................................+++
.....................................................................+++
e is 65537 (0x10001)
```

`(3)`

: 秘密鍵 (`.key`ファイル) から、証明書署名要求 (`.csr`ファイル) を作成する。

     対話形式で入力を求められるため、『Common Name』に、Webサイトで使用する完全修飾ドメイン名を入力する以外は、何も入力せずにエンターとする。

```bash
$ openssl req -new -key server.key -out server.csr

Country Name (2 letter code) []:
State or Province Name (full name) []:
Locality Name (eg, city) []:
Organization Name (eg, company) []:
Organizational Unit Name (eg, section) []:
Common Name (eg, fully qualified host name) []:<完全修飾ドメイン名> # これのみ入力する。
Email Address []:
```

`(4)`

: 自己署名のサーバー証明書を作成する。

     認証局はサーバー自身なため、サーバーの秘密鍵 (`.key`ファイル) と証明書署名要求 (`.csr`ファイル) による署名で、サーバー証明書 (`.crt`ファイル) を作成する。

     この時、あらかじめルート認証局を別に作成しておき、`signkey`オプションの代わりに`CA`オプションと`CAkey`オプションを使用して、ルート認証局が証明書で署名する方法もある。

     有効期限は`10`年 (`3650`日) とする。

```bash
$ openssl x509 \
    -days 3650 \
    -req \
    -sha256 \
    -signkey server.key \
    -in server.csr \
    -out server.crt
```

`(5)`

: サーバー証明書 (`.crt`ファイル) 、サーバー証明書とペアになる秘密鍵 (`.key`ファイル) を該当の箇所に設定する。

     例えば、Nginxの設定ファイルなら、以下の通りとなる。

```nginx
#-------------------------------------
# HTTPリクエスト
#-------------------------------------
server {
    # 443番ポートで待ち受けるようにし、サーバー証明書を使用する。
    # listen 80;
    listen 443 ssl;

    # Hostヘッダー
    server_name foo.example.com;

    # サーバー証明書を設定する。
    ssl_certificate     /etc/nginx/ssl/server.crt;
    # 秘密鍵を設定する。
    ssl_certificate_key /etc/nginx/ssl/server.key;
}
```

`(6)`

: サーバー証明書の開始日と失効日が新しくなっている。

```bash
$ curl https://foo.example.com -v
*   Trying *.*.*.*...
* TCP_NODELAY set
* Connected to foo.example.com (*.*.*.*) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* Cipher selection: ALL:!EXPORT:!EXPORT40:!EXPORT56:!aNULL:!LOW:!RC4:@STRENGTH
* successfully set certificate verify locations:
*   CAfile: /etc/pki/tls/certs/ca-bundle.crt
  CApath: none
* TLSv1.2 (OUT), TLS header, Certificate Status (22):
* TLSv1.2 (OUT), TLS handshake, Client hello (1):
* TLSv1.2 (IN), TLS handshake, Server hello (2):
* TLSv1.2 (IN), TLS handshake, Certificate (11):
* TLSv1.2 (IN), TLS handshake, Server key exchange (12):
* TLSv1.2 (IN), TLS handshake, Server finished (14):
* TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
* TLSv1.2 (OUT), TLS change cipher, Change cipher spec (1):
* TLSv1.2 (OUT), TLS handshake, Finished (20):
* TLSv1.2 (IN), TLS change cipher, Change cipher spec (1):
* TLSv1.2 (IN), TLS handshake, Finished (20):
* SSL connection using TLSv1.2 / *-*-*-*-*
* ALPN, server accepted to use h2
* Server certificate:
*  subject: C=JP; ST=Tokyo; L=***; O=***; CN=*.example.com
*  start date: Dec 21 02:08:29 2022 GMT # サーバー証明書の開始日
*  expire date: Jan 22 02:08:28 2024 GMT # サーバー証明書の失効日
*  subjectAltName: host "foo.example.com" matched cert's "*.example.com"
*  issuer: C=BE; O=* nv-sa; CN=* RSA OV SSL CA 2018
*  SSL certificate verify ok.
* Using HTTP2, server supports multi-use
* Connection state changed (HTTP/2 confirmed)
* Copying HTTP/2 data in stream buffer to connection buffer after upgrade: len=0
* Using Stream ID: 1 (easy handle *****)
> GET /v1/health HTTP/2
> Host: foo.example.com
> User-Agent: curl/7.61.1
> Accept: */*
>
* Connection state changed (MAX_CONCURRENT_STREAMS == 2147483647)!
< HTTP/2 200
< content-type: application/json; charset=utf-8
< date: Thu, 12 Jan 2023 02:07:12 GMT
< content-length: 2
< server: nginx
<
* Connection #0 to host foo.example.com left intact
```

> - https://www.karakaram.com/creating-self-signed-certificate/
> - https://qiita.com/marcy-terui/items/2f63d7f170ff82531245#comment-15815a021373f84e74bd
> - https://weblabo.oscasierra.net/openssl-gencert-1/
> - https://gist.github.com/x-yuri/8178c9aa2dcf8acbe4ccc2a07313b22d
> - https://ozuma.hatenablog.jp/entry/20130511/1368284304

#### ▼ 一括管理

`openssl`コマンド以外にも、サーバー証明書を作成できるツールがある。

各ツールで追加機能がある。

```bash
$ ssh-keygen -t rsa
```

```bash
# サーバー証明書の作成のほかにキーストアを操作できる
$ keytool -import -alias <エイリアス> -file <秘密鍵>.pem -keystore <公開鍵の作成先のディレクトリ>
```

> - https://superuser.com/questions/1535116/generating-privatepublic-keypair-for-ssh-difference-between-ssh-keygen-and-ope
> - https://security.stackexchange.com/a/98290

<br>

## 02-07. クライアント証明書の配置

### サーバー証明書と秘密鍵の配置場所

記入中

<br>

### 自己署名クライアント証明書 (オレオレクライアント証明書) の作成

#### ▼ クライアント証明書の作成に必要なもの

| ファイル           | 説明                                                                         | 拡張子                                |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------------------- |
| 秘密鍵             | クライアント証明書とペアになる秘密鍵として動作する。                         | `pem`、`.key`、`.txt`                 |
| 証明書署名要求     | 秘密鍵から作成され、公開鍵であるクライアント証明書を作成するために使用する。 | `.csr`、`.txt`                        |
| クライアント証明書 | 秘密鍵とペアになる公開鍵として動作する。                                     | `pem`、`.crt`、`.cert`、`.ca`、`.txt` |

> - https://vpslife.server-memo.net/create_client_cert/

#### ▼ 作成手順

以下のコマンドをクライアント側で実施し、秘密鍵 (後にクライアント証明書とペアになる) 、証明書署名要求、クライアント証明書を作成できる。

この時のルート認証局は『自分』である。

`(1)`

: クライアント証明書の有効期限が切れてしまい、リクエストを拒否されてしまったとする。

```bash
$ curl https://foo.example.com -v
```

`(2)`

: 秘密鍵 (`.key`ファイル) を作成する。

```bash
$ openssl genrsa 2048 -keyout client.key
```

`(3)`

: 秘密鍵 (`.key`ファイル) から、証明書署名要求 (`.csr`ファイル) を作成する。

     対話形式で入力を求められるため、『Common Name』に、Webサイトで使用する完全修飾ドメイン名を入力する以外は、何も入力せずにエンターとする。

```bash
$ openssl req -new -key client.key -out client.csr

Country Name (2 letter code) []:
State or Province Name (full name) []:
Locality Name (eg, city) []:
Organization Name (eg, company) []:
Organizational Unit Name (eg, section) []:
Common Name (eg, fully qualified host name) []:<完全修飾ドメイン名> # これのみ入力する。
Email Address []:
```

`(4)`

: 自己署名のクライアント証明書を作成する。

     認証局はクライアント自身なため、クライアントの秘密鍵 (`.key`ファイル) と証明書署名要求 (`.csr`ファイル) による署名で、クライアント証明書 (`.crt`ファイル) を作成する。

     この時、あらかじめルート認証局を別に作成しておき、`signkey`オプションの代わりに`CA`オプションと`CAkey`オプションを使用して、ルート認証局が証明書で署名する方法もある。

     有効期限は`10`年 (`3650`日) とする。

     未来の俺に託すが、クライアント証明書の作成時に`signkey`オプションを使用している例が見つからず、基本的には`CA`オプションと`CAkey`オプションを使った方法になるっぽい。

```bash
$ openssl x509 \
    -days 3650 \
    -req \
    -sha256 \
    -signkey client.key \
    -in client.csr \
    -out client.crt
```

`(5)`

: 秘密鍵 (`.key`ファイル) とクライアント証明書 (`.crt`ファイル) のpkcs12形式ペア (`.p12`ファイル) をエクスポートする。

     これをクライアントのマシン (例：ブラウザ、サーバーなど) に登録する。

```bash
$ openssl pkcs12 -export -inkey client.key -in client.crt -out client.p12
```

`(6)`

: クライアント証明書 (`.crt`ファイル) 、クライアント証明書とペアになる秘密鍵 (`.key`ファイル) を該当の箇所に設定する。

`(7)`

: クライアント証明書の開始日と失効日が新しくなっている。

```bash
$ curl https://foo.example.com -v
```

> - https://www.konekuri.com/87/
> - https://www.tumblr.com/y-yagi/18179788088/%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E8%A8%BC%E6%98%8E%E6%9B%B8%E3%81%AE%E4%BD%9C%E3%82%8A%E6%96%B9
> - https://vpslife.server-memo.net/create_client_cert/
> - https://qiita.com/deko2369/items/1c7757a7b19e97a3e7a4#%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E8%A8%BC%E6%98%8E%E6%9B%B8
> - https://vpslife.server-memo.net/import_client_chrome_edge/

<br>
