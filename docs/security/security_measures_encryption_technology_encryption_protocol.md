---
title: 【IT技術の知見】暗号化プロトコル＠通信データの暗号化技術
description: 暗号化プロトコル＠通信データの暗号化技術の知見を記録しています。
---

# 暗号化プロトコル＠通信データの暗号化技術

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

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

公開鍵暗号方式に基づく暗号化プロトコル。

公開鍵暗号方式と、公開鍵認証方式やパスワード認証方式の技術を使用して、インターネットを経由して、サーバーのリモート通信/操作を行う。

物理webサーバーであっても、webサーバーであっても、SSHによるリモート通信/操作の仕組みは同じである。



| 要素        | ツール例                       |
|-----------|-----------------------------|
| 送信元マシン内 | OpenSSH、TeraTerm、Putty、など   |
| 宛先マシン内   | OpenSSH、Apache MINA/SSHD、など |

#### ▼ SSHポートフォワーディング（SSHポート転送）

ローカルマシンと踏み台サーバーのSSH接続と、ポートフォワーディングを組み合わせることによって、外部ネットワークのプライベートネットワーク内リモートサーバーに間接的にパケットを送受信する。



![ssh-port-forward](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ssh-port-forward.png)

**＊例＊**

このリモートサーバーが、仮想環境の場合もあり、ホストと仮想環境の接続でもSSHポートフォワーディングを使用している。

ホスト外部のパソコンから、ホスト上の仮想環境に接続したい場合、SSHポートフォワーディングを使用することによって、ホストを踏み台とした仮想環境への接続が行えるようになる。



![docker_port-forwarding](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker_port-forwarding.png)

<br>

### SCP：Secure Copy Protocol

#### ▼ SCPとは

SSHを介して、ファイル転送を行う。

SSHの能力をより拡張したプロトコルである。



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

SSHを介して、ファイル転送を行う。

SSHとFTPを組み合わせたプロトコルではなく、SSHの能力をより拡張したものである。



| 要素        | ツール例               |
|-----------|---------------------|
| 送信元マシン内 | WinSCP、Filezilla、など |
| 宛先マシン内   | なし                  |

<br>

### RDP：Remote Desktop Protocol（リモートデスクトッププロトコル）

#### ▼ リモートデスクトップとは

![encryption_protocol_remote-desktop](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/encryption_protocol_remote-desktop.png)

ゲートウェイマシン上で稼働するリモートデスクトップツールを介して、異なるネットワーク内のアプリケーションと通信する。



| 要素                     | ツール例                   |
|-------------------------|-------------------------|
| 送信元マシン内              | Chromeリモートデスクトップ、など     |
| ゲートウェイマシン内              | Guacamole（guardを含む）、など |
| 宛先マシン（サーバー、デスクトップPC）内 | なし                      |


> ℹ️ 参考：
>  
> - https://milestone-of-se.nesuke.com/sv-basic/windows-basic/remote-desktop-security/#toc1
> - https://ja.helpleft.com/internet/what-is-remote-desktop-protocol.html
> - https://openstandia.jp/oss_info/guacamole/

#### ▼ 他の暗号化プロトコルとの組み合わせ

ゲートウェイマシンとさえ通信できれば、該当のアプリケーションと通信できてしまうため、ゲートウェイマシン自体への通信でも暗号化プロトコル（例：VPN）を使用した方がよい。

例えば、VPNで許可されたユーザーのみがゲートウェイマシンに通信できるようにしておく。



> ℹ️ 参考：https://milestone-of-se.nesuke.com/sv-basic/windows-basic/remote-desktop-security/#toc2

<br>

## 03. 【トランスポート層】ヘッダ情報の暗号化技術

### SSL/TLS：Secure Sockets Layer / Transport Layer Security

#### ▼ SSL/TLSとは

![encryption_protocol_ssh-tls](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/encryption_protocol_ssh-tls.png)

ハイブリッド暗号方式に基づく暗号化プロトコル。

SSL/TLSを使用した通信では、通信の受信側にSSL証明書を設定する必要がある。

トランスポート層で、パケットのヘッダ情報の暗号化を担う。

具体的には、HTTPプロトコルで、GET送信のヘッダ部分、またPOST送信のヘッダ部分とボディ部分を暗号化する。



**＊例＊**

Chromeでは、HTTPSプロトコルの使用時にSSL証明書に不備がある（例：オレオレ証明書を使用している）と、以下のような警告が表示される。



![SSL接続に不備がある場合の警告](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SSL接続に不備がある場合の警告.jpg)


#### ▼ 相互TLS（mTLS）

通常のSSL/TLSを使用した通信では、通信の受信側のみSSL証明書を設定すればよいが、相互TLSでは受信側のみでなく送信側にも設定が必要になる。



> ℹ️ 参考：https://qiita.com/horit0123/items/8eb45bfcef6b848971a4

<br>

## 05. 【ネットワーク層】ヘッダ情報の暗号化技術

### IPsec：Internet Protocol Security

#### ▼ IPSecとは

共通鍵暗号方式に基づく暗号化プロトコル。

ネットワーク層で、パケットのヘッダ情報の暗号化を担う。

例えば、リモートワーク時に、自宅PCと会社のネットワークをVPN接続するために使用される。

VPN接続されると、自宅PCからのTCPプロトコルのリクエストが会社のルーターを通過するため、送信元IPアドレスが会社のものにかわる。

盗聴を防げる。



![IPsecによるインターネットVPN](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IPsecによるインターネットVPN.jpg)

#### ▼ IPsecによるパケットのカプセル化

![IPsecによるカプセル化](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IPsecによるカプセル化.jpg)

<br>

### VPN：Virtual Private Network（仮想プライベートネットワーク）

#### ▼ VPNとは

![VPN（ネットワーク間）](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPN（ネットワーク間）.png)

異なるネットワーク間で安全な通信を行うための仕組み。

異なるネットワーク内の特定のアプリケーションにのみと通信できるリモートデスクトッププロトコルよりも、広範囲に通信できる。



| 要素         | ツール例                                                   |
|------------|---------------------------------------------------------|
| 送信元マシン内  | OpenVpnClient、FortiClient、Zapp（クラウドZscalerのクライアントツール）など |
| 中継VPNマシン内 | OpenVpn、FortiGate、SDPゲートウェイ（クラウドZscalerのVPNマシン）など       |
| 宛先マシン内    | なし                                                      |

> ℹ️ 参考：
>
> - www.amazon.co.jp/dp/B0756SS7N3
> - https://www.securelink.com/blog/whats-difference-vpn-desktop-sharing-remote-access/
> - https://www.netmotionsoftware.com/ja/blog/connectivity/jpn-5-vpn-protocols
> - https://www.iim.co.jp/products/zscaler/zpa/

#### ▼ 通信データの暗号化/復号化

リクエスト時、SSL/TLSプロトコルによって通信は暗号化され、接続先のネットワーク内にあるVPNゲートウェイというプロキシサーバーで復号化される。

反対にレスポンス時、VPNゲートウェイで再び暗号化され、クライアントに返信される。

接続先のネットワーク内のサーバがリクエストを受信する時、リクエストのIPアドレスはVPNゲートウェイのものになっている。



> ℹ️ 参考：https://www.n-study.com/internet-vpn/ssl-vpn-overview/

![SSLによるインターネットVPN](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SSLによるインターネットVPN.jpg)


<br>
