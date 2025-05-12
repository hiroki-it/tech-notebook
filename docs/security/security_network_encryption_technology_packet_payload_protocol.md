---
title: 【IT技術の知見】暗号化プロトコル＠アプリケーションデータの暗号化技術
description: 暗号化プロトコル＠アプリケーションデータの暗号化技術の知見を記録しています。
---

# 暗号化プロトコル＠アプリケーションデータの暗号化技術

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 暗号化プロトコルの種類と扱われる階層

プロトコルとしての暗号化技術である『暗号化プロトコル』は、赤色で示してある。

![encryption_protocol](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/encryption_protocol.png)

> - https://www.it-shikaku.jp/top30.php?hidari=11-05-01.php&migi=km11-05.php

<br>

## 02. 【アプリケーション層】メールデータの暗号化技術

### S/MIME：Secure MIME

#### ▼ S/MINEとは

暗号化ダイジェスト (デジタル署名) を含むデジタル証明書をメールに添付することによって、公開鍵の成りすましを防ぐセキュリティ技術。

![S_MIME](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/S_MIME.png)

#### ▼ S/MIMEにおけるデジタル証明書

デジタル証明書をS/MIMEに使用する場合、特にS/MIME証明書という。

<br>

## 02-02. 【アプリケーション層】リモート通信/操作やファイルフォワーディングの暗号化技術

### SSH：Secure Shell

#### ▼ SSHとは

![ssh_public-key-authentication](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ssh_public-key-authentication.png)

公開鍵暗号方式に基づく暗号化プロトコル。

公開鍵暗号方式と、公開鍵認証方式やパスワード認証方式の技術を使用して、インターネットを経由して、サーバーのリモート通信/操作を実行する。

物理Webサーバーであっても、Webサーバーであっても、SSH公開鍵認証によるリモート通信/操作の仕組みは同じである。

| 要素           | Apache MINA/SSHDの場合 | OpenSSHの場合 | Puttyの場合 | TeraTermの場合 |
| -------------- | ---------------------- | ------------- | ----------- | -------------- |
| 送信元マシン内 | -                      | OpenSSH       | Putty       | TeraTerm       |
| 宛先マシン内   | Apache MINA/SSHD       | OpenSSH       | -           | -              |

#### ▼ SSHポートフォワーディング (SSHポートフォワーディング)

ローカルマシンと踏み台サーバーのSSH公開鍵認証と、ポートフォワーディングを組み合わせることによって、外部ネットワークのプライベートネットワーク内リモートサーバーに間接的にパケットを送受信する。

![ssh-port-forward](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ssh-port-forward.png)

**＊例＊**

このリモートサーバーが、仮想環境の場合もあり、ホストと仮想環境の接続でもSSHポートフォワーディングを使用している。

ホスト外部のパソコンから、ホスト上の仮想環境に接続したい場合、SSHポートフォワーディングを使用することによって、ホストを踏み台とした仮想環境への接続が行えるようになる。

![docker_port-forwarding](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/docker_port-forwarding.png)

<br>

### SCP：Secure Copy Protocol

#### ▼ SCPとは

SSHを経由して、ファイルフォワーディングを実行する。

SSHの能力をより拡張したプロトコルである。

`(1)`

: クライアントは、リモート通信先のサーバーにファイル送信を命令する。

`(2)`

: サーバーは、Shellを使用してSCPプログラムを起動し、クライアントにファイルを送信する。

![SCPの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SCPの仕組み.png)

#### ▼ ファイルを要求する側に必要なソフトウェア

- WinSCP
- Filezilla

#### ▼ ファイルを送信する側に必要なソフトウェア

<br>

### SFTP：SSH File Transfer Protocol

#### ▼ SFTPとは

SSHを経由して、ファイルフォワーディングを実行する。

SSHとFTPを組み合わせたプロトコルではなく、SSHの能力をより拡張したものである。

| 要素           | Filezillaの場合 | WinSCPの場合 |
| -------------- | --------------- | ------------ |
| 送信元マシン内 | Filezilla       | WinSCP       |
| 宛先マシン内   | -               | -            |

<br>

### RDP：Remote Desktop Protocol (リモートデスクトッププロトコル)

#### ▼ リモートデスクトップとは

![encryption_protocol_remote-desktop](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/encryption_protocol_remote-desktop.png)

ゲートウェイマシン上で稼働するリモートデスクトップツールを経由して、異なるネットワーク内のアプリケーションと通信する。

ローカルマシンとリモートにあるアプリケーション間でコピーアンドペーストができない場合がある。

その場合、ローカルマシンのコピーを一度リモート先にあるメモ帳などにペーストし、これを改めてコピーアンドペーストすると良い。

| 要素                                     | Chromeリモートデスクトップの場合 | Guacamoleの場合         |
| ---------------------------------------- | -------------------------------- | ----------------------- |
| 送信元マシン内                           | Chromeリモートデスクトップ       | -                       |
| ゲートウェイマシン内                     | -                                | Guacamole (guardを含む) |
| 宛先マシン (サーバー、デスクトップPC) 内 | -                                | -                       |

> - https://milestone-of-se.nesuke.com/sv-basic/windows-basic/remote-desktop-security/#toc1
> - https://ja.helpleft.com/internet/what-is-remote-desktop-protocol.html
> - https://openstandia.jp/oss_info/guacamole/

#### ▼ 他の暗号化プロトコルとの組み合わせ

ゲートウェイマシンとさえ通信できれば、該当のアプリケーションと通信できてしまうため、ゲートウェイマシン自体へのリクエストでも暗号化プロトコル (例：VPN) を使用した方がよい。

例えば、VPNで許可されたユーザーのみがゲートウェイマシンに通信できるようにしておく。

> - https://milestone-of-se.nesuke.com/sv-basic/windows-basic/remote-desktop-security/#toc2

<br>

### 証明書の認証方式

#### ▼ サーバー認証

記入中...

#### ▼ クライアント認証

SSL/TLSプロトコルで暗号化するために、VPNツール (例：Zscaler) が中間認証局として機能し、署名したクライアント証明書 (おそらくリーフ証明書と呼ぶ) を発行する。

このクライアント証明書をVPNのクライアント側 (例：開発PC) に設定する必要がある。

また、もしクライアント側で仮想環境を作成したい場合、仮想環境がクライアント証明書が信頼できるように、設定する必要がある。

**＊設定例＊**

Dockerであればプロキシ設定を実施するか、Dockerfileにルート証明書を組み込む必要がある。

![vpn_certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vpn_certificate.png)

> - https://www.nrapki.jp/client-certificate/telework/
> - https://help.zscaler.com/zia/about-ssl-inspection
> - https://docs.docker.com/guides/zscaler/#the-role-of-certificates-in-docker

#### ▼ 相互TLS認証 (mTLS)

アプリケーション層で、双方向のピア認証を実施する。

サーバー認証では、HTTPSリクエストの宛先のみSSL証明書を設定すればよい。

また、クライアント認証では送信元のみにクライアント証明書を設定すればよい。

一方で、相互TLS認証ではHTTPSリクエストの送信元にクライアント証明書が必要になる。

![mtls](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/mtls.png)

> - https://apidog.com/jp/blog/how-to-proceed-mtls-api/#mtls%E3%81%AE%E4%BB%95%E7%B5%84%E3%81%BF

<br>

## 03. 【トランスポート層】ヘッダー情報の暗号化技術

### SSL/TLS：Secure Sockets Layer／Transport Layer Security

#### ▼ SSL/TLSとは

![encryption_protocol_ssh-tls](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/encryption_protocol_ssh-tls.png)

ハイブリッド暗号方式に基づく暗号化プロトコル。

SSL/TLSを使用した通信では、通信の宛先にSSL証明書を設定する必要がある。

トランスポート層で、パケットペイロード内のアプリケーションデータの暗号化を担う。

パケットペイロード全体を暗号化したい場合は、IPSecを使用する必要がある。

> - https://xtech.nikkei.com/it/article/COLUMN/20080609/307119/

#### ▼ SNI (SSL/TLSの拡張)

宛先のサーバーに複数のSSL証明書を配置できるようになる。

従来のSSL/TLSでは、宛先のサーバーに単一のSSL証明書しか配置できなかった。

仮想ホストを使用してサーバーに複数のドメインを設定していても、SSL証明書は一つになってしまう。

各ドメインを異なるユーザーが使用するようなシステム (例：レンタルサーバー) では、ユーザーのドメインごとにSSL/TLSを分離できない。

これに対処するために、SNIを使用する。

> - https://www.idcf.jp/rentalserver/user-support/knowledge/ssl/sni.html
> - https://qiita.com/ikm82/items/d48298d21ab46d102a67#sni%E3%81%AE%E5%BF%85%E8%A6%81%E6%80%A7

#### ▼ `L5`〜`L7`のプロトコルの暗号化

`L5`〜`L7`のプロトコル (例：HTTP、HTTPS、SMTP、DNS、POP3など) を暗号化する。

『`S`』 (例：SMTPS) や『`over TLS/SSL`』 (例：HTTP over TLS/SSL、SMTP over TLS/SSL) をつけて表記する。

暗号化プロトコルを使用する場合、`L6`にて`L7`のアプリケーションデータを暗号化/復号かする。

**＊例＊**

Chromeでは、HTTPSプロトコルの使用時にSSL証明書に不備がある (例：自己署名SSL証明書を使用している) と、以下のような警告が表示される。

![SSL接続に不備がある場合の警告](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SSL接続に不備がある場合の警告.jpg)

> - https://xtech.nikkei.com/it/atcl/column/16/072100153/072100007/

<br>

## 04. 【ネットワーク層】ヘッダー情報の暗号化技術

### IPsec：Internet Protocol Security

#### ▼ IPSecとは

共通鍵暗号方式に基づく暗号化プロトコル。

ネットワーク層で、パケットペイロード全体の暗号化を担う。

SSL/TLSはアプリケーションデータしか暗号化できないため、より安全である。

例えば、リモートワーク時に、自宅PCと会社のネットワークをVPN接続するために使用される。

VPN接続されると、自宅PCからのTCPスリーウェイハンドシェイクが会社のルーターを通過するため、送信元IPアドレスが会社のものにかわる。

盗聴を防げる。

![IPsecによるインターネットVPN](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IPsecによるインターネットVPN.jpg)

> - https://xtech.nikkei.com/it/article/COLUMN/20080609/307119/

#### ▼ IPsecによるパケットのカプセル化

![IPsecによるカプセル化](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IPsecによるカプセル化.jpg)

<br>

### VPN：Virtual Private Network (仮想プライベートネットワーク)

#### ▼ VPNとは

![vpn_between_network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vpn_between_network.png)

異なるネットワーク間で安全な通信を実行するための仕組み。

異なるネットワーク内の特定のアプリケーションにのみと通信できるリモートデスクトッププロトコルよりも、広範囲に通信できる。

| 要素            | Fortiの場合 | OpenVPNの場合 | Zscalerの場合                                |
| --------------- | ----------- | ------------- | -------------------------------------------- |
| 送信元マシン内  | FortiClient | OpenVpnClient | Zapp (クラウドZscalerのクライアントツール)   |
| 中継VPNマシン内 | FortiGate   | OpenVpn       | SDPゲートウェイ (クラウドZscalerのVPNマシン) |
| 宛先マシン内    | -           | -             | -                                            |

> - www.amazon.co.jp/dp/B0756SS7N3
> - https://www.securelink.com/blog/whats-difference-vpn-desktop-sharing-remote-access/
> - https://www.netmotionsoftware.com/ja/blog/connectivity/jpn-5-vpn-protocols
> - https://www.iim.co.jp/products/zscaler/zpa/

#### ▼ アプリケーションデータの暗号化/復号化

リクエスト時、SSL/TLSプロトコルによって通信は暗号化され、接続先のネットワーク内にあるVPNゲートウェイというプロキシサーバーで復号化される。

反対にレスポンス時、VPNゲートウェイで再び暗号化され、クライアントに返信される。

接続先のネットワーク内のサーバがリクエストを受信する時、リクエストのIPアドレスはVPNゲートウェイのものになっている。

![SSLによるインターネットVPN](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SSLによるインターネットVPN.jpg)

> - https://www.n-study.com/internet-vpn/ssl-vpn-overview/

<br>
