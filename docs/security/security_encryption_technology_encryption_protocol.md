---
title: 【IT技術の知見】暗号化プロトコル＠通信データの暗号化技術
description: 暗号化プロトコル＠通信データの暗号化技術の知見を記録しています。
---

# 暗号化プロトコル＠通信データの暗号化技術

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 暗号化プロトコル

### 暗号化プロトコルの種類と扱われる階層

プロトコルとしての暗号化技術である『暗号化プロトコル』は、赤色で示してある。

> ℹ️ 参考：https://www.it-shikaku.jp/top30.php?hidari=11-05-01.php&migi=km11-05.php

![encryption_protocol](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/encryption_protocol.png)

<br>

### 暗号化プロトコルで扱われる通信データ

#### ▼ 通信データの種類

- Webコンテンツデータ
- メールデータ

#### ▼ 通信データの作成、ヘッダ情報追加、カプセル化

パケット交換方式におけるパケットのヘッダ情報は、パソコンの各概念層のプロトコルによって追加されていく。

> ℹ️ 参考：https://www.network-engineer.info/network_beginner/%E3%81%9D%E3%82%82%E3%81%9D%E3%82%82ip%E3%83%91%E3%82%B1%E3%83%83%E3%83%88%E3%81%A8%E3%81%AF%E3%81%AA%E3%81%AB%E3%81%8B%EF%BC%9F/

![パケットの構造](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/パケットの構造.jpg)

<br>

## 02. 【アプリケーション層】メールデータの暗号化技術

### S/MIME：Secure MIME

#### ▼ S/MINEとは

暗号化ダイジェスト（デジタル署名）を含むデジタル証明書をメールに添付することによって、公開鍵の成りすましを防ぐセキュリティ技術。

![S_MIME](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/S_MIME.png)

#### ▼ S/MIMEにおけるデジタル証明書

デジタル証明書をS/MIMEに使用する場合、特にS/MIME証明書という。

<br>

## 02-02. 【アプリケーション層】リモート通信/操作やファイル転送の暗号化技術

### SSH：Secure Shell

#### ▼ SSHとは

![ssh接続](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ssh接続.png)

公開鍵暗号方式に基づく暗号化プロトコル。公開鍵暗号方式と、公開鍵認証方式やパスワード認証方式の技術を使用して、インターネットを経由して、サーバーのリモート通信/操作を行う。物理webサーバーであっても、webサーバーであっても、SSHによるリモート通信/操作の仕組みは同じである。

| インストール先 | ツール例                   |
|---------|------------------------|
| 送信元マシン内 | OpenSSH、TeraTerm、Putty、など |
| 宛先マシン内  | OpenSSH、Apache MINA/SSHD、など               |

#### ▼ SSHポートフォワーディング（SSHポート転送）

ローカルマシンと踏み台サーバーのSSH接続と、ポートフォワーディングを組み合わせることによって、外部ネットワークのプライベートネットワーク内リモートサーバーに間接的に通信する。

**＊例＊**

ローカルマシンの```20000```番ポートに対する通信を、踏み台サーバーを介して、リモートサーバーの```3306```番ポートにポートフォワーディングする。

```bash
$ ssh -L20000:<リモートサーバー>:3306 username@<踏み台サーバーのIPアドレス>
```

![ssh-port-forward](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ssh-port-forward.png)

**＊例＊**

このリモートサーバーが、仮想環境の場合もあり、ホストと仮想環境の接続でもSSHポートフォワーディングを使用している。ホスト外部のパソコンから、ホスト上の仮想環境に接続したい場合、SSHポートフォワーディングを使用することによって、ホストを踏み台とした仮想環境への接続が行えるようになる。

![docker_port-forwarding](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker_port-forwarding.png)

<br>

### SCP：Secure Copy Protocol

#### ▼ SCPとは

SSHを介して、ファイル転送を行う。SSHの能力をより拡張したプロトコルである。

1. クライアントは、リモート通信先のサーバーにファイル送信を命令する。
2. サーバーは、Shellを使用してSCPプログラムを起動し、クライアントにファイルを送信する。

![SCPの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SCPの仕組み.png)

#### ▼ ファイルを要求する側に必要なソフトウェア

- WinSCP
- Filezilla

#### ▼ ファイルを送信する側に必要なソフトウェア

<br>

### SFTP：SSH File Transfer Protocol

#### ▼ SFTPとは

SSHを介して、ファイル転送を行う。SSHとFTPを組み合わせたプロトコルではなく、SSHの能力をより拡張したものである。

| インストール先 | ツール例                |
|---------|---------------------|
| 送信元マシン内 | WinSCP、Filezilla、など |
| 宛先マシン内  | なし                  |

<br>

### RDP：Remote Desktop（リモートデスクトップ）

#### ▼ リモートデスクトップとは

![encryption_protocol_remote-desktop](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/encryption_protocol_remote-desktop.png)

ゲートウェイマシン上で稼働するリモートデスクトップツールを介して、異なるネットワーク内のアプリケーションと通信する。

| インストール先  | ツール例                   |
|----------|------------------------|
| 送信元マシン内  | Chromeリモートデスクトップ、など    |
| ゲートウェイマシン内 | Guacamole（guardを含む）、など |
| 宛先マシン内   | なし                     |


> ℹ️ 参考：
>  
> - https://milestone-of-se.nesuke.com/sv-basic/windows-basic/remote-desktop-security/#toc1
> - https://ja.helpleft.com/internet/what-is-remote-desktop-protocol.html
> - https://openstandia.jp/oss_info/guacamole/

#### ▼ 他の暗号化プロトコルとの組み合わせ

ゲートウェイマシンとさえ通信できれば、該当のアプリケーションと通信できてしまうため、ゲートウェイマシン自体への通信でも暗号化プロトコル（例：VPN）を使用した方がよい。例えば、VPNで許可されたユーザーのみがゲートウェイマシンに通信できるようにしておく。

> ℹ️ 参考：https://milestone-of-se.nesuke.com/sv-basic/windows-basic/remote-desktop-security/#toc2

<br>

## 03. 【トランスポート層】ヘッダ情報の暗号化技術

### SSL/TLS：Secure Sockets Layer / Transport Layer Security

#### ▼ SSL/TLSとは

ハイブリッド暗号方式に基づく暗号化プロトコル。SSL/TLSを使用した通信では、通信の受信側にSSL証明書を設定する必要がある。トランスポート層で、パケットのヘッダ情報の暗号化を担う。具体的には、HTTPプロトコルで、GET送信のヘッダ部分、またPOST送信のヘッダ部分とボディ部分を暗号化する。

![encryption_protocol_ssh-tls](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/encryption_protocol_ssh-tls.png)

**＊例＊**

Chromeでは、HTTPSプロトコルの使用時にSSL証明書に不備がある（例：オレオレ証明書を使用している）と、以下のような警告が表示される。

![SSL接続に不備がある場合の警告](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SSL接続に不備がある場合の警告.jpg)

#### ▼ SSL証明書の作成に必要なもの

| ファイル       | 説明                                  | 拡張子                                                    |
| -------------- |-------------------------------------| --------------------------------------------------------- |
| 秘密鍵         | SSL証明書と対になる秘密鍵として動作する。              | ```pem```、```.key```、```.txt```                         |
| 証明書署名要求 | 秘密鍵から作成され、公開鍵であるSSL証明書を作成するために使用する。 | ```.csr```、```.txt```                                    |
| SSL証明書      | 秘密鍵と対になる公開鍵として動作する。                 | ```pem```、```.crt```、```.cert```、```.ca```、```.txt``` |

> ℹ️ 参考：
>
> - https://www.ssl-concier.com/news/topics/164
> - https://install-memo.hatenadiary.org/entry/20110906/1315291837
> - https://qiita.com/kunichiko/items/12cbccaadcbf41c72735#crt-cer-key-csr%E3%81%AF%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E3%82%A8%E3%83%B3%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E3%81%A7%E3%81%AF%E3%81%AA%E3%81%8F%E5%86%85%E5%AE%B9%E3%82%92%E8%A1%A8%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B

#### ▼ オレオレSSL証明書の作成

以下のコマンドで、秘密鍵、証明書署名要求、SSL証明書、を作成できる。この時の認証局は『自分』である。

> ℹ️ 参考：
>
> - https://www.karakaram.com/creating-self-signed-certificate/
> - https://qiita.com/marcy-terui/items/2f63d7f170ff82531245#comment-15815a021373f84e74bd
> - https://weblabo.oscasierra.net/openssl-gencert-1/

（１）秘密鍵（```.key```ファイル）を作成する。

```bash
$ openssl genrsa 2048 -keyout server.key

Generating RSA private key, 2048 bit long modulus
.............................................+++
.....................................................................+++
e is 65537 (0x10001)
```

（２）秘密鍵から、証明書署名要求（```.csr```ファイル）を作成する。対話形式で入力を求められるため、『Common Name』に、Webサイトで使用する完全修飾ドメイン名を入力する以外は、何も入力せずにエンターとする。

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

（３）認証局を『自分』として、秘密鍵と証明書署名要求から、SSL証明書（```.crt```ファイル）を作成する。有効期限は```10```年（```3650```日）とする。

```bash
$ openssl x509 -days 3650 -req -sha256 -signkey server.key -in server.csr -out server.crt
```

（４）秘密鍵（```.key```ファイル）、SSL証明書（```.crt```ファイル）、を該当の箇所に設定する。例えば、Nginxの設定ファイルなら、以下の通りとなる。

```nginx
#-------------------------------------
# HTTPリクエスト
#-------------------------------------
server {
    # 443番ポートで待ち受けるようにし、SSL証明書を使用する。
    # listen 80;
    listen 443 ssl;

    # SSL証明書を設定する。
    ssl_certificate     /etc/nginx/ssl/server.crt;
    # 秘密鍵を設定する。
    ssl_certificate_key /etc/nginx/ssl/server.key;        ：
}
```

#### ▼ 証明書バンドル

認証局によってSSL証明書の発行方法は異なり、単体あるいはセットで発行する場合がある。ルート認証局と中間認証局のSSL証明書がセットになったファイルを証明書バンドルという。

> ℹ️ 参考：https://www.ssldragon.com/blog/what-is-a-ca-bundle-and-where-to-find-it/

#### ▼ 相互TLS（mTLS）

通常のSSL/TLSを使用した通信では、通信の受信側のみSSLサーバー証明書を設定すればよいが、相互TLSでは受信側だけでなく送信側にも設定が必要になる。

> ℹ️ 参考：https://qiita.com/horit0123/items/8eb45bfcef6b848971a4

#### ▼ SSL/TLSにおけるデジタル証明書とドメイン認証

デジタル証明書をSSLに使用する場合、特にSSL証明書という。提供される秘密鍵と組み合わせて、ドメインの認証に使用される。

<br>

## 05. 【ネットワーク層】ヘッダ情報の暗号化技術

### IPsec：Internet Protocol Security

#### ▼ IPSecとは

共通鍵暗号方式に基づく暗号化プロトコル。ネットワーク層で、パケットのヘッダ情報の暗号化を担う。例えば、リモートワーク時に、自宅PCと会社のネットワークをVPN接続するために使用される。VPN接続されると、自宅PCからのTCPプロトコルのリクエストが会社のルーターを通過するため、送信元IPアドレスが会社のものにかわる。盗聴を防げる。

![IPsecによるインターネットVPN](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IPsecによるインターネットVPN.jpg)

#### ▼ IPsecによるパケットのカプセル化

![IPsecによるカプセル化](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IPsecによるカプセル化.jpg)

<br>

### VPN：Virtual Private Network（仮想プライベートネットワーク）

#### ▼ VPNとは

![VPN（ネットワーク間）](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPN（ネットワーク間）.png)

異なるネットワーク間で安全な通信を行うための仕組み。異なるネットワーク内の特定のアプリケーションにのみと通信できるリモートデスクトッププロトコルよりも、広範囲に通信できる。

> ℹ️ 参考：
>
> - www.amazon.co.jp/dp/B0756SS7N3
> - https://www.securelink.com/blog/whats-difference-vpn-desktop-sharing-remote-access/
> - https://www.netmotionsoftware.com/ja/blog/connectivity/jpn-5-vpn-protocols

#### ▼ 通信の暗号化/復号化

リクエスト時、SSL/TLSプロトコルによって通信は暗号化され、接続先のネットワーク内にあるVPNゲートウェイというプロキシサーバーで復号化される。反対にレスポンス時、VPNゲートウェイで再び暗号化され、クライアントに返信される。接続先のネットワーク内のサーバがリクエストを受信する時、リクエストのIPアドレスはVPNゲートウェイのものになっている。

> ℹ️ 参考：https://www.n-study.com/internet-vpn/ssl-vpn-overview/

![SSLによるインターネットVPN](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SSLによるインターネットVPN.jpg)


<br>
