---
title: 【IT技術の知見】TCP階層モデル＠ネットワーク
description: TCP階層モデル＠ネットワークの知見を記録しています。
---

# TCP階層モデル＠ネットワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. TCP階層モデルの種類

TCP階層モデルは、ネットワークインターフェース層、インターネット層、トランスポート層、アプリケーション層、から構成される。TCP/IPモデルで使用されるプロトコルのうち、最も代表的な『TCP』と『IP』から名前をとって『TCP/IP』と名付けられた。暗号化プロトコルを使用している場合は、各階層でそのプロトコルがパケットヘッダーを暗号化する。

![encryption_protocol](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/encryption_protocol.png)

<br>

## 03. パケットの通信経路

### データがパケットになるまで

> ℹ️ 参考：https://www.network-engineer.info/network_beginner/%E3%81%9D%E3%82%82%E3%81%9D%E3%82%82ip%E3%83%91%E3%82%B1%E3%83%83%E3%83%88%E3%81%A8%E3%81%AF%E3%81%AA%E3%81%AB%E3%81%8B%EF%BC%9F/

1. アプリケーション層でデータが作成される。
2. トランスポート層でTCPヘッダが追加される。
3. インターネット層でIPヘッダが追加される。
4. ネットワークインターフェース層でEthernetヘッダが追加される。
5. パケットとして送信される。

![パケットの構造](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/パケットの構造.jpg)

<br>

### 各概念層のヘッダ情報認識

送信元で作成されたパケットは、非カプセル化されながら、通信機器に認識される。

> ℹ️ 参考：https://ja.wikipedia.org/wiki/%E3%83%AB%E3%83%BC%E3%82%BF%E3%83%BC

![tcp-ip_structure](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/tcp-ip_structure.png)

<br>

## 03. TCPアプリケーション層

### アプリケーション層とは

各アプリケーションがプロセスとして稼働しており、それぞれがデータ（メッセージ）を作成する。各プロセスは特定のポート番号を受信する。

> ℹ️ 参考：https://netdekagaku.com/netstat-command/

![application_expose-port](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/application_expose-port.png)

ちなみに、ポート番号を使用しているプロセスの一覧は、以下のコマンドで表示できる。

```bash
$ sudo lsof -i -P | grep LISTEN
```

<br>

## 03-02. メールデータの作成

### メールデータの送受信

#### ▼ 仕組み

（１）クライアント（メール送信できるアプリケーション）から受信したメールは、送信側のメールサーバーに送信される。
（２）送信側のメールサーバーは、メールを受信側のメールサーバーに転送する。
（３）受信側のアプリケーションは、各々が指定したプロトコルに応じて、受信側のメールサーバーからメールデータを取得する。

> ℹ️ 参考：https://xtech.nikkei.com/it/pc/article/basic/20120312/1043605/

![smtp_pop3_imap4](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/smtp_pop3_imap4.png)

#### ▼ 送信側のメールサーバーのモック

メールデータの送信機能を開発する時に、送信テストを実施する必要があり、この内容は公開したくない。そこで、送信側のメールサーバーのモックを提供するサービスを利用する。この送信側メールサーバーモックは、クライアントから受信したメールのテストデータを受信側のメールサーバーに転送しないため、安全に送信テストを実施できる。Mailtrapがおすすめである。

> ℹ️ 参考：https://mailtrap.io/

<br>

### SMTP：Simple Mail Transfer Protocol

#### ▼ SMTPとは

メールデータを送信するためのプロトコルのこと。

#### ▼ SMTP-AUTH：SMTP AUTHentication

SMTPに認証を組み込んだ仕組みのこと。クライアント（メール送信できるアプリケーション）からメールサーバーにメールデータをSMTP送信する時、メールサーバーがクライアントに対して認証を実行する。

![SMTP-AUTH](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SMTP-AUTH.png)

<br>

### POP3：Post Official Protocol version 3

#### ▼ POP3とは

メールサーバーに届いたメールを、受信機器にダウンロードし、受信機器で参照するプロトコル。メールの既読未読状況は、他の受信機器と共有される。

<br>

### IMAP4：Internet Message Access Protocol version 4

#### ▼ IMAP4とは

メールサーバーに届いたメールを、受信機器にダウンロードせず、メールサーバーに置いたまま参照するプロトコル。メールの既読未読状況は、他の受信機器と共有されない。

**＊例＊**

GmailでPOPかIMAPを設定できる。

![GmailでPOPorIMAPを設定](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/GmailでPOPかIMAPを設定.jpg)

<br>

### APOP：Authenticated POP

#### ▼ APOPとは

  メール受信の際に、チャレンジレスポンス方式の認証を行うことにより、平文の認証情報がネットワークに流れるのを防止するプロトコル

  <br>

## 04. TCPトランスポート層

### トランスポート層とは

#### ▼ 全体像

クライアントからのリクエスト時に、ネットワーク層から渡されたパケットのポート番号情報を元に、アプリケーション層の特定のプロセスにパケットを渡す。また反対に、レスポンス時にアプリケーション層のプロセスから出力されたパケットに情報を付加し、ネットワーク層に渡す。この時、各アプリケーションはプロセスとして稼働していることに留意する。

![トランスポート層からアプリケーション層へのパケットの移動](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/トランスポート層からアプリケーション層へのパケットの移動.PNG)

#### ▼ クライアントからのリクエスト時（図の 『→』 ）

まず、ネットワーク層でプライベートIPアドレスを使用して、リクエスト先のパソコンを識別する。その後、トランスポート層で、ポート番号を元にして、アプリケーション層のプロセスにパケットを送信する。

**＊例＊**

インバウンド通信を待ち受けるポート番号を```8080```と設定した場合、リクエスト時に以下の様にポート番号を指定すると、nginxプロセスにリクエストを送信できる。

```yaml
GET http://127.0.0.1:8080
```

#### ▼ クライアントへのレスポンス時（図の 『←』 ）

パケットの通過したポート番号をヘッダ情報として追加する。これを、ネットワーク層へ送信する。

#### ▼ ソケット、ソケット接続とは

トランスポート層に存在し、受信した通信をアプリケーション層の各プロセスに振り分ける受け口をソケットという。送信元のサーバーが宛先に対して、『```192.168.1.1:50001```（送信元IPアドレス:送信ポート）』『```10.0.0.1:80```（宛先IPアドレス:宛先ポート）』といったように、IPアドレスとポート番号の組合せで指定する。オリジンとは似て非なるものなので注意。サーバー間のソケット間のネットワーク接続をソケット接続という。

<br>

## 04-02. ポート番号

### ポート番号とは

アプリケーションのプロセスへのパケット送受信に、プロセスを区別するために各プロセスに割り当てられる番号。アプリケーションには、それぞれポート番号が割り当てられており、トランスポート層で、ポート番号を元にして、特定のプロセスにパケットを送信する。

<br>

### ポート番号の種類

#### ▼ Well known ポート番号（```0``` ～ ```1023```）

IANA：Internet Assigned Numbers Authority（インターネット割当番号公社）によって管理されているポート番号。主要ポートが使われている場合は、代替ポートを使用することになる。各プロトコルで慣例として使われている代替ポートは、以下の検索サイトを参考にせよ。

> ℹ️ 参考：https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml?search=alt

![ポート番号とプロトコルの対応関係](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ポート番号とプロトコルの対応関係.png)

#### ▼ 登録済みポート番号（```1024``` ～ ```49151```）

IANAが登録申請を受けて公開しているポート番号。企業が作成した独自のアプリなどに対して割り当てられる。

#### ▼ 動的/非公式ポート番号（```49152``` ～ ```65535```）

自由に使用できるポート番号。

<br>

### ポートフォワーディング（ポート転送）

#### ▼ ポートフォワーディングとは

サーバー内の特定のポート番号のアプリケーションに対して、パケットが送信されてきた時、これを異なるポート番号のアプリケーションに転送すること。SSHプロトコルと組み合わせると、SSHポートフォワーディングを実現できる。

<br>

### ポートスキャナ

#### ▼ ポートスキャナとは

ポートスキャナを使用することによって、各ポート番号にアクセスし、応答があるか否かや、どのようなソフトウェアが応答するかを調べ、一覧表示できる。

<br>

## 05. TCPインターネット層

### インターネット層とは

IPパケットのヘッダ情報を使用して、宛先認識する。

1. PC-Aは、構成したIPパケットをEthernetに乗せて、ルーターAに送信する。
2. ルーターAは、IPパケットをデジタル専用線に乗せて、ルーターBに送信する。
3. ルーターBは、構成したIPパケットをEthernetに乗せて、webサーバーに送信する。ルーターとwebサーバーの間に、プロキシサーバーを配置することもある。

![ネットワークにおけるTCP_IPを使用したデータ通信](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ネットワークにおけるTCP_IPを使用したデータ通信.png)

<br>

