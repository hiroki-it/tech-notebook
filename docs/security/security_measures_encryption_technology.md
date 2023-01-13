---
title: 【IT技術の知見】通信データの暗号化技術＠セキュリティ
description: 通信データの暗号化技術＠セキュリティの知見を記録しています。
---

# 通信データの暗号化技術＠セキュリティ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. 通信データを暗号化する目的

### 盗聴（通信データの盗み取り）を防ぐため

『共通鍵暗号方式』や『公開鍵暗号方式』によって実現される。

暗号アルゴリズムに基づく暗号方式を使用してデータを暗号化することによって、通信データの盗聴を防ぐ。



![盗聴_改竄_成りすまし](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/盗聴_改竄_成りすまし_1.png)

<br>

### 改竄（通信データの書き換え）を防ぐため

『デジタル署名』や『ハッシュ関数』によって実現される。

相手に送ったデータと相手が受け取ったデータが同じか否かを確認することによって、通信データの改竄を防ぐ。



![盗聴_改竄_成りすまし](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/盗聴_改竄_成りすまし_2.png)

<br>

### 成りすましを防ぐため

『デジタル署名』によって実現される。

正しい相手であることを証明することによって、成りすましを防ぐ。



![盗聴_改竄_成りすまし](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/盗聴_改竄_成りすまし_3.png)

<br>


## 02. 暗号ダイジェスト（デジタル署名）について

### 暗号ダイジェスト（デジタル署名）を使用した暗号化技術

#### ▼ 暗号ダイジェスト（デジタル署名）とは

『公開鍵暗号方式とは逆の仕組み（※つまり、公開鍵暗号方式ではない）』と『ハッシュ関数』を利用した暗号化。

『成りすまし』と『改竄』を防げる。



![デジタル署名](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/デジタル署名.png)

**＊サーバーが行うこと＊**

（１）サーバーは、受信者（クライアント）にあらかじめ公開鍵を配布しておく。

（２）平文をハッシュ化し、ダイジェストにする。

（３）ダイジェストを秘密鍵で暗号化し、暗号ダイジェスト（デジタル署名）を作成する。

（４）『平文』、『暗号ダイジェスト（デジタル署名）』を送信する。

**＊受信者（クライアント）が行うこと＊**

（１）受信者（クライアント）は、『平文』と『暗号ダイジェスト（デジタル署名）』を受信する。

（２）平文をハッシュ化し、ダイジェストにする。

（３）上記```2```個のダイジェストが同一なら、『成りすまし』と『改竄』が行われていないと判断

#### ▼ 暗号ダイジェスト（デジタル署名）のメリット

（１）改竄を防げる

サーバーから送られた『平文』と『暗号ダイジェスト』のどちらかが、通信の途中で改竄された場合、これらのダイジェストが同じになることは確率的にありえない。

したがって、確かに改竄されていないと判断可能。



（２）成りすましを防げる

特定の秘密鍵を持つのは、特定のサーバーだけ。

したがって、確かにサーバーによって暗号化されたものだと判断可能。



#### ▼ 暗号ダイジェスト（デジタル署名）のデメリット

**★★公開鍵の成りすましを防げない★★**

二者間だけのやり取りでは、あらかじめ受信者に渡される公開鍵が偽の送信者のものであっても、確かめる術がない。

これを保障する仕組みに、PKI（公開鍵基盤）がある。



<br>

### 暗号ダイジェスト（デジタル署名）と公開鍵暗号方式を使用した暗号化技術

『成りすまし』と『改竄』を防げるデジタル署名に、『盗聴』を防げる公開鍵暗号方式を組み込んだ暗号化技術。



![デジタル署名と暗号化](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/デジタル署名と暗号化.png)

<br>

### ハッシュ関数によるハッシュ化

何かのデータを入力すると、規則性のない一定の桁数の値を出力する演算手法。



![ハッシュ関数](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ハッシュ関数.png)

<br>

## 03. ドメイン認証

### ドメイン認証の仕組み

#### ▼ 公開鍵基盤

秘密鍵とデジタル証明書はドメインの正当性（偽のサイトではないこと）を担保するものである。

デジタル署名に使用した秘密鍵に対応する公開鍵は、成りすました人物による偽の公開鍵である可能性がある。

第三者機関の認証局によって、公開鍵を検証するインフラのことを、公開鍵基盤という。



#### ▼ 公開鍵基盤による公開鍵検証の仕組み

![デジタル証明書（SSL証明書）](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/デジタル証明書（SSL証明書）.gif)


**＊サーバーが行うこと＊**

（１）サーバーは、公開鍵と秘密鍵を作り、認証局に公開鍵とデジタル署名を提出する。

（２）認証局から、暗号ダイジェスト（デジタル署名）を含むデジタル証明書（S/MIME証明書、SSL証明書）を発行してもらう。デジタル証明書が、公開鍵の本人証明になる。デジタル証明書は、S/MIMEで使用する場合には、『S/MIME証明書』、SSL/TLSで使用する場合には、『SSL証明書』という。

（３）受信者（クライアント）にメール、暗号ダイジェスト（デジタル署名）を含むデジタル証明書を送信する。

**＊受信者（クライアント）が行うこと＊**

（１）受信者（クライアント）は、暗号ダイジェスト（デジタル署名）を含むデジタル証明書（S/MIME証明書、SSL証明書）を受信する。

（２）認証局からもらった公開鍵を使用して、デジタル証明書の暗号ダイジェスト（デジタル署名）部分を復号し、ハッシュ値が同じなら、認証局そのものが成りすましでないと判断する。

<br>

### 認証局

#### ▼ 認証局そのものの成りすましの防止策

デジタル証明書（S/MIME証明書、SSL証明書）を発行する認証局そのものが、成りすましの可能性がある。

そこで、認証局をランク付けし、ルート認証局が下位ランクの認証局に権限を与えることにより、下位の認証局の信頼性を持たせている。

注意点として、ルート認証局は専門機関から厳しい審査を受けているため、ルート認証局自体がなりすましである可能性は非常に低い。



> ℹ️ 参考：https://zeropasoakita.livedoor.blog/archives/20294837.html

![認証局自体の成りすまし防止](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/認証局自体の成りすまし防止.png)

#### ▼ 認証局の例

自前の中間認証局あるいはクラウドプロバイダーが中間認証局を利用し、デジタル証明書を認証する。



> ℹ️ 参考：https://speakerdeck.com/jacopen/gai-metexue-bu-vaultfalseji-ben?slide=54

**＊例＊**

| 方法 | 中間認証局名          | ルート認証局名 |
|------|-----------------------|------------|
| 自前 | Vault                 | 調査中...   |
| AWS  | Amazon Trust Services | Starfield社 |
| GCP  | Google Trust Services | 調査中...   |

<br>

### 証明書の種類

#### ▼ ルート証明書

ルート認証局が、自身の信頼性を担保するために発行する証明書のこと。

ルート認証局は、ブラウザの開発会社の厳しい監査を受けているため、ルート証明書を使用して自分で自分を証明できる。

> ℹ️ 参考：https://itra.co.jp/webmedia/points_of_ssl_ca_certification.html

#### ▼ 中間CA証明書

中間認証局が、自身の信頼性を担保するために発行する証明書のこと。

ただし、中間認証局は中間CA証明書を使用して自分で自分を証明できないため、代わりにルート認証局がこれを担保する。

> ℹ️ 参考：https://itra.co.jp/webmedia/points_of_ssl_ca_certification.html

#### ▼ SSL証明書

デジタル証明書をSSLに使用する場合、特にSSL証明書という。

Webサイトのドメインの購入者が、対になる秘密鍵と組み合わせることにより、ドメインの所有者であることを証明する。

ただし、ドメインの購入者は自分で自分を証明できないため、代わりにルート認証局がこれを担保する。

中間CA証明書を使用してSSL証明書を証明する場合、SSL証明書の内容と中間CA証明書と連結する。

より下位の証明書から順番に連結していく。

```text
-----BEGIN CERTIFICATE-----
SSL証明書の内容
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
最下位の中間CA証明書の内容
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
より上位の中間CA証明書の内容
-----END CERTIFICATE-----
```

> ℹ️ 参考：
> 
> - https://www.mtioutput.com/entry/2019/01/02/090000
> - https://portal.kitcloud.net/documents/1356
> - https://diary.bis5.net/2013/12/10/450.html

#### ▼ 証明書バンドル



認証局によってSSL証明書の発行方法は異なり、単体あるいはセットで発行する場合がある。

ルート認証局と中間認証局のSSL証明書がセットになったファイルを証明書バンドルという。

> ℹ️ 参考：https://www.ssldragon.com/blog/what-is-a-ca-bundle-and-where-to-find-it/

<br>

### クライアント証明書

#### ▼ クライアント証明書とは

クライアント側に配置する証明書である。

必須ではないが、SSL証明書のみを使用する場合よりも安全性が高くなる。

対になる秘密鍵もクライアント側に配置することになるため、クライアント側にはクライアント証明書と秘密鍵の両方を配置することになる。



<br>

### 自己署名SSL証明書の作成

#### ▼ SSL証明書の作成に必要なもの

| ファイル           | 説明                                               | 拡張子                                                |
|----------------|--------------------------------------------------|-------------------------------------------------------|
| 秘密鍵         | SSL証明書と対になる秘密鍵として動作する。                    | ```pem```、```.key```、```.txt```                       |
| 証明書署名要求 | 秘密鍵から作成され、公開鍵であるSSL証明書を作成するために使用する。 | ```.csr```、```.txt```                                 |
| SSL証明書      | 秘密鍵と対になる公開鍵として動作する。                       | ```pem```、```.crt```、```.cert```、```.ca```、```.txt``` |

> ℹ️ 参考：
>
> - https://www.ssl-concier.com/news/topics/164
> - https://install-memo.hatenadiary.org/entry/20110906/1315291837
> - https://qiita.com/kunichiko/items/12cbccaadcbf41c72735#crt-cer-key-csr%E3%81%AF%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E3%82%A8%E3%83%B3%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E3%81%A7%E3%81%AF%E3%81%AA%E3%81%8F%E5%86%85%E5%AE%B9%E3%82%92%E8%A1%A8%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B

#### ▼ 作成手順

以下のコマンドで、秘密鍵、証明書署名要求、SSL証明書、を作成できる。

この時の認証局は『自分』である。



> ℹ️ 参考：
>
> - https://www.karakaram.com/creating-self-signed-certificate/
> - https://qiita.com/marcy-terui/items/2f63d7f170ff82531245#comment-15815a021373f84e74bd
> - https://weblabo.oscasierra.net/openssl-gencert-1/


（１）SSL証明書の有効期限が切れてしまい、HTTPSプロトコルで通信できなくなってしまったとする。

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

（２）秘密鍵（```.key```ファイル）を作成する。

```bash
$ openssl genrsa 2048 -keyout server.key

Generating RSA private key, 2048 bit long modulus
.............................................+++
.....................................................................+++
e is 65537 (0x10001)
```

（３）秘密鍵から、証明書署名要求（```.csr```ファイル）を作成する。対話形式で入力を求められるため、『Common Name』に、Webサイトで使用する完全修飾ドメイン名を入力する以外は、何も入力せずにエンターとする。

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

（４）中間認証局を『自分』として、秘密鍵と証明書署名要求に基づいて、SSL証明書（```.crt```ファイル）を作成する。有効期限は```10```年（```3650```日）とする。

```bash
$ openssl x509 -days 3650 -req -sha256 -signkey server.key -in server.csr -out server.crt
```

（５）秘密鍵（```.key```ファイル）、SSL証明書（```.crt```ファイル）、を該当の箇所に設定する。例えば、Nginxの設定ファイルなら、以下の通りとなる。

```nginx
#-------------------------------------
# HTTPリクエスト
#-------------------------------------
server {
    # 443番ポートで待ち受けるようにし、SSL証明書を使用する。
    # listen 80;
    listen 443 ssl;
    
    # Hostヘッダー
    server_name foo.example.com;

    # SSL証明書を設定する。
    ssl_certificate     /etc/nginx/ssl/server.crt;
    # 秘密鍵を設定する。
    ssl_certificate_key /etc/nginx/ssl/server.key;
}
```

（６）SSL証明書の開始日と失効日が新しくなっており、HTTPSプロと凍ることがわかる。

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
*  start date: Dec 21 02:08:29 2022 GMT # SSL証明書の開始日
*  expire date: Jan 22 02:08:28 2024 GMT # SSL証明書の失効日
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


<br>

## 04. その他のセキュリティ技術

### メール受信におけるセキュリティ

#### ▼ OP25B（Outbound Port 25 Blocking）

#### ▼ SPF（Sender Policy Framework）

<br>

### パスワードの保存方法

平文で保存しておくと、流出した時に勝手に使用されてしまうため、ハッシュ値で保存するべきである。



![ハッシュ値で保存](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ハッシュ値で保存.png)

<br>

### 生体認証

調査中...

![生体認証-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/生体認証-1.png)

![生体認証-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/生体認証-2.png)

<br>

### Web beacon

webページに、サーバーに対してHTTPリクエストを送信するプログラムを設置し、送信されたリクエストを集計するアクセス解析方法。

例えば、1x1の小さなGif『画像』などを設置する。



<br>

