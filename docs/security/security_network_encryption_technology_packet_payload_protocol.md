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

## 02. 暗号化技術の目的

### 情報漏洩 (アプリケーションデータの盗み取り) を防ぐため

『共通鍵暗号方式』や『公開鍵暗号方式』によって実現される。

暗号アルゴリズムに基づく暗号方式を使用してアプリケーションデータを暗号化することによって、アプリケーションデータの情報漏洩を防ぐ。

![情報漏洩_改竄_なりすまし](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/情報漏洩_改竄_なりすまし_1.png)

> - https://nrm.recruitment.jp/column/detail/id=631
> - https://secure.stylemap.co.jp/enforce-security/security-measures-using-the-stride-model/

<br>

### 改竄 (アプリケーションデータの書き換え) を防ぐため

『署名』や『ハッシュ関数』によって実現される。

署名とハッシュ関数を使用して、送信したアプリケーションデータと受信したアプリケーションデータが同じか否かを確認することによって、アプリケーションデータの改竄を防ぐ。

![情報漏洩_改竄_なりすまし](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/情報漏洩_改竄_なりすまし_2.png)

> - https://nrm.recruitment.jp/column/detail/id=631
> - https://secure.stylemap.co.jp/enforce-security/security-measures-using-the-stride-model/

<br>

### なりすましを防ぐため

『署名』によって実現される。

署名を使用して正しい相手であることを認証することによって、なりすましを防ぐ。

![情報漏洩_改竄_なりすまし](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/情報漏洩_改竄_なりすまし_3.png)

> - https://nrm.recruitment.jp/column/detail/id=631
> - https://secure.stylemap.co.jp/enforce-security/security-measures-using-the-stride-model/

<br>

### 否認を防ぐため

『署名』によって実現される。

署名の証跡によって、否認を防ぐ。

> - https://nrm.recruitment.jp/column/detail/id=631
> - https://secure.stylemap.co.jp/enforce-security/security-measures-using-the-stride-model/

<br>

## 02-02. 【アプリケーション層】メールデータの暗号化技術

### S/MIME：Secure MIME

#### ▼ S/MINEとは

暗号化ダイジェスト (署名) を含む証明書をメールに添付することによって、公開鍵のなりすましを防ぐセキュリティ技術。

![S_MIME](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/S_MIME.png)

#### ▼ S/MIMEにおける証明書

証明書をS/MIMEに使用する場合、特にS/MIME証明書という。

<br>

<br>

### OP25B (Outbound Port 25 Blocking)

記入中...

<br>

### SPF (Sender Policy Framework)

記入中...

<br>

<br>

<br>

## 02-03. 【アプリケーション層】リモート通信/操作やファイルフォワーディングの暗号化技術

### SSH：Secure Shell

#### ▼ SSHとは

![ssh_public-key-authentication](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ssh_public-key-authentication.png)

公開鍵暗号方式に基づく暗号化プロトコル。

公開鍵暗号方式と、公開鍵認証方式やパスワード認証方式の技術を使用して、インターネットを経由し、サーバーのリモート通信/操作を実施する。

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

ゲートウェイマシン上で稼働するブラウザを経由して、異なるネットワーク内のWebアプリと通信する。

送信元マシンから宛先マシン上Webアプリケーションに対してコピーアンドペーストできない場合がある。

その場合、ローカルマシンのコピーを一度リモート先にあるメモ帳などにペーストし、これをあらためてコピーアンドペーストすると良い。

| 役割               | 概説                                                                                  | Chromeリモートデスクトップ |           Guacamole            | AWS AppStream |
| ------------------ | ------------------------------------------------------------------------------------- | :------------------------: | :----------------------------: | :-----------: |
| 送信元マシン       | ゲートウェイマシンのクライアントである。                                              |             ✅             |                                |               |
| ゲートウェイマシン | 宛先マシンで稼働するWebアプリケーションのクライアントであり、ブラウザが稼働している。 |                            | ✅ (Guacamoleサーバー + guard) |      ✅       |
| 宛先マシン         | 異なるネットワーク内でWebアプリが稼働している。                                       |                            |                                |               |

> - https://milestone-of-se.nesuke.com/sv-basic/windows-basic/remote-desktop-security/#toc1
> - https://ja.helpleft.com/internet/what-is-remote-desktop-protocol.html
> - https://openstandia.jp/oss_info/guacamole/

#### ▼ 他の暗号化プロトコルとの組み合わせ

ゲートウェイマシンとさえ通信できれば、該当のアプリケーションと通信できてしまうため、ゲートウェイマシン自体へのリクエストでも暗号化プロトコル (例：VPN) を使用したほうがよい。

例えば、VPNで許可されたユーザーのみがゲートウェイマシンへ通信できるようにしておく。

> - https://milestone-of-se.nesuke.com/sv-basic/windows-basic/remote-desktop-security/#toc2

<br>

## 03. 【トランスポート層】ヘッダー情報の暗号化技術

### SSL/TLS：Secure Sockets Layer／Transport Layer Security

#### ▼ SSL/TLSとは

ハイブリッド暗号方式に基づく暗号化プロトコル。

SSL/TLSを使用した通信では、TLSライブラリ (例：OpenSSL、BoringSSL、LibreSSLなど) で証明書を作成し、認証方式に応じた場所へ証明書を設定する必要がある。

トランスポート層で、パケットペイロード内のアプリケーションデータの暗号化を担う。

パケットペイロード全体を暗号化したい場合は、IPSecを使用する必要がある。

![encryption_protocol_ssh-tls](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/encryption_protocol_ssh-tls.png)

> - https://xtech.nikkei.com/it/article/COLUMN/20080609/307119/

#### ▼ SNI (SSL/TLSの拡張)

宛先のサーバーに複数のサーバー証明書を配置できるようになる。

従来のSSL/TLSでは、宛先のサーバーに単一のサーバー証明書しか配置できなかった。

仮想ホストを使用してサーバーに複数のドメインを設定していても、サーバー証明書は1つになってしまう。

各ドメインを異なるユーザーが使用するようなシステム (例：レンタルサーバー) では、ユーザーのドメインごとにSSL/TLSを分離できない。

これに対処するため、SNIを使用する。

> - https://www.idcf.jp/rentalserver/user-support/knowledge/ssl/sni.html
> - https://qiita.com/ikm82/items/d48298d21ab46d102a67#sni%E3%81%AE%E5%BF%85%E8%A6%81%E6%80%A7

#### ▼ `L5`〜`L7` のプロトコルの暗号化

`L5`〜`L7` のプロトコル (例：HTTP、HTTPS、SMTP、DNS、POP3など) を暗号化する。

『`S`』 (例：SMTPS) や『`over TLS/SSL`』 (例：HTTP over TLS/SSL、SMTP over TLS/SSL) をつけて表記する。

暗号化プロトコルを使用する場合、`L6` にて `L7` のアプリケーションデータを暗号化/復号する。

**＊例＊**

Chromeでは、HTTPSリクエストの使用時にサーバー証明書の不備 (例：自己署名サーバー証明書を使用している場合) があると、以下のような警告が表示される。

![SSL接続に不備がある場合の警告](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SSL接続に不備がある場合の警告.jpg)

> - https://xtech.nikkei.com/it/atcl/column/16/072100153/072100007/

<br>

### プロトコルのTLS化の仕組み

#### ▼ 概要

1. 証明書ベース認証 (サーバー認証、クライアント認証、相互TLS認証) の種類に応じて、認証局が事前に証明書を発行する。
2. クライアントのTLSライブラリはTLSハンドシェイクを開始する。
3. クライアントがTLSバージョンや暗号スイートを送信し、サーバーが使用するものを返信する。
4. 証明書ベース認証 (サーバー認証、クライアント認証、相互TLS認証) を実施する。証明書ベース認証の種類に応じて、クライアントとサーバー間で証明書を送受信する。証明書の受信側は証明書の署名を検証する。
5. 暗号スイートで指定された鍵交換アルゴリズム (例：ECDHE) により、クライアントとサーバー間で鍵合意し、共通鍵を共有する。
6. TLSハンドシェイクが完了する。
7. クライアントは共通鍵でアプリケーションデータを暗号化し、HTTPSリクエストをサーバーに送信する。サーバーは共通鍵でアプリケーションデータを復号する。

#### ▼ サーバー認証

記入中...

#### ▼ クライアント認証

SSL/TLSプロトコルで暗号化するために、VPNツール (例：Zscaler) が中間認証局として機能し、署名したクライアント証明書 (おそらくリーフ証明書と呼ぶ) を発行する。

このクライアント証明書をVPNのクライアント側 (例：開発PC) に設定する必要がある。

また、もしクライアント側で仮想環境を作成したい場合、仮想環境内でクライアント証明書を信頼できるように設定する必要がある。

**＊設定例＊**

Dockerであればプロキシ設定を実施するか、Dockerfileにルート証明書を組み込む必要がある。

![vpn_certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vpn_certificate.png)

> - https://www.nrapki.jp/client-certificate/telework/
> - https://help.zscaler.com/zia/about-ssl-inspection
> - https://docs.docker.com/guides/zscaler/#the-role-of-certificates-in-docker

#### ▼ 相互TLS認証 (mTLS)

アプリケーション層で、双方向のピア認証を実施する。

サーバー認証では、HTTPSリクエストの宛先のみサーバー証明書を設定すればよい。

また、クライアント認証では送信元のみにクライアント証明書を設定すればよい。

一方で、相互TLS認証ではHTTPSリクエストの送信元にクライアント証明書が必要になる。

![mtls](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/mtls.png)

> - https://apidog.com/jp/blog/how-to-proceed-mtls-api/#mtls%E3%81%AE%E4%BB%95%E7%B5%84%E3%81%BF

<br>

## 04. 【ネットワーク層】ヘッダー情報の暗号化技術

### IPsec：Internet Protocol Security

#### ▼ IPSecとは

共通鍵暗号方式に基づく暗号化プロトコル。

ネットワーク層で、パケットペイロード全体の暗号化を担う。

SSL/TLSプロトコルはアプリケーションデータしか暗号化できないため、より安全である。

例えば、リモートワーク時に、自宅PCと会社のネットワークをVPN接続するために使用される。

VPN接続されると、自宅PCからのTCPスリーウェイハンドシェイクが会社のルーターを通過するため、送信元IPアドレスが会社のものにかわる。

情報漏洩を防げる。

![IPsecによるインターネットVPN](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IPsecによるインターネットVPN.jpg)

> - https://xtech.nikkei.com/it/article/COLUMN/20080609/307119/

#### ▼ IPsecによるパケットのカプセル化

![IPsecによるカプセル化](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IPsecによるカプセル化.jpg)

<br>

### VPN：Virtual Private Network (仮想プライベートネットワーク)

#### ▼ VPNとは

![vpn_between_network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vpn_between_network.png)

異なるネットワーク間で安全な通信するための仕組み。

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

#### ▼ アプリケーションデータの暗号化/復号

リクエスト時、SSL/TLSプロトコルによって通信は暗号化され、接続先のネットワーク内にあるVPNゲートウェイというプロキシサーバーで復号される。

反対にレスポンス時、VPNゲートウェイで再び暗号化され、クライアントに返信される。

接続先のネットワーク内のサーバがリクエストを受信するとき、リクエストのIPアドレスはVPNゲートウェイのものになっている。

![SSLによるインターネットVPN](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SSLによるインターネットVPN.jpg)

> - https://www.n-study.com/internet-vpn/ssl-vpn-overview/

<br>
