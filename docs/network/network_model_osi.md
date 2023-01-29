---
title: 【IT技術の知見】TCP階層モデル＠ネットワーク＠ネットワーク
description: TCP階層モデル＠ネットワークの知見を記録しています。
---

# OSI参照モデル＠ネットワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. OSI参照モデルの種類

OSI参照モデルは、物理層（```L1```）、データリンク層（```L2```）、ネットワーク層（```L3```）、トランスポート層（```L4```）、セッション層（```L5```）、プレゼンテーション層（```L6```）、アプリケーション層（```L7```）、から構成される。



> ℹ️ 参考：https://www.infraexpert.com/study/networking3.html

![OSI参照モデル](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/OSI参照モデル.png)

<br>

## 02. 各レイヤーの責務

各レイヤーで異なるプロトコルを処理する。

プロトコルとしての暗号化技術である『暗号化プロトコル』は、赤色で示してある。

レイヤー名からとって、プロトコルを『アプリケーションプロトコル』『トランスポートプロトコル』『インターネットプロトコル』『ネットワークインターフェースプロトコル』ともいう。



> ℹ️ 参考：https://www.techwalla.com/articles/host-based-networks-vs-client-server-networks

![encryption_protocol](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/encryption_protocol.png)

<br>

## 03. パケットの通信経路

### アプリケーションへの操作がパケットになるまで

アプリケーション層でパケットのメッセージ部分を作成し、レイヤーを経るたびにヘッダーを追加していく。

パケット自体が暗号化されているため、実際の中身を確認することは難しい。



![osi-reference-model_packet](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/osi-reference-model_packet.png)

【１】アプリケーション層（```L7```）にて、アプリケーションの入力に応じて、パケットのメッセージ（データ）を作成し、```L7```ヘッダを追加する。

【２】プレゼンテーション層（```L6```）にて、メッセージの文字コード変換や暗号化/復号化を実施し、```L6```ヘッダを追加する。

【３】セッション層（```L5```）にて、セッションを開始し、```L5```ヘッダを追加する。

【４】トランスポート層（```L4```）にて、```L4```ヘッダを追加する。

【５】ネットワーク層（```L3```）にて、```L3```ヘッダを追加する。

【６】ネットワークインターフェース層（```L2```）にて、```L2```ヘッダを追加する。

【７】物理層にて（```L1```）にて、```L1```ヘッダが追加される。

【８】パケットをHTTPリクエストとして送信する。

> ℹ️ 参考：
> 
> - https://www.infraexpert.com/study/networking3.html
> - https://www.infraexpert.com/study/networking4.html
> - https://www.n-study.com/network-architecture/osi-communication-flow/

<br>

### 通信機器との対応関係

![OSI参照モデルと通信機器.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/OSI参照モデルと通信機器.jpg)

OSI参照モデルの各レイヤーと通信機器の間の対応関係は以下の通りである。



> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/0007/19/news001_2.html

【１】プライベートネットワークにクライアントPCがある。

【２】クライアントPCにて、Webブラウザのアプリケーションのプロセスが、OSIアプリケーション層、OSIプレゼンテーション層、OSIセッション層で稼働している。ここで、パケットが作成される。

【３】パケットは、クライアントPCのOSIトランスポート層、OSIネットワーク層、OSIデータリンク層、OSI物理層、を経る。各層で、パケットにヘッダー情報が追加される。

【４】PCからルーターにパケットを送信する。

【５】ルーターはOSIネットワーク層に属するため、より上層に一度戻ることになる。

【６】パブリックネットワークを経て、宛先のプライベートネットワークのルーターに到達する。

【７】ルーターからサーバーにパケットを送信する。

【８】パケットは、OSIデータリンク層、OSI物理層（NIC：Network Interface Card（例：LANアダプタ、LANボード、LANカード））、リピータ、LANケーブル、OSIネットワーク層、OSIトランスポート層、を経る。

【９】サーバーにて、アプリケーションのプロセスが特定のポート番で受信している。アプリケーションによってパケットが処理される。


<br>


### OSI参照モデルの各レイヤーのヘッダ情報認識

送信元で作成されたパケットは、非カプセル化されながら、通信機器に認識される。



> ℹ️ 参考：https://ja.wikipedia.org/wiki/%E3%83%AB%E3%83%BC%E3%82%BF%E3%83%BC

![tcp-ip_structure](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/tcp-ip_structure.png)

<br>

## 04. アプリケーション層、プレゼンテーション層、セッション層（```L5```〜```L7```）

### アプリケーション層とは

アプリケーションが待ち受けるプロトコル（例：HTTP、HTTPS、SMTP、DNS、POP3、など）を処理するレイヤーである。



> ℹ️ 参考：https://ja.wikipedia.org/wiki/%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E5%B1%A4

<br>

### アプリケーション層の仕組み

![application_expose-port](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/application_expose-port.png)

【１】各アプリケーションがプロセスとして稼働しており、プロセスがデータ（メッセージ）を作成する。

【２】各プロセスは特定のポート番号を受信する。

> ℹ️ 参考：https://netdekagaku.com/netstat-command/

補足として、ポート番号を使用しているプロセスの一覧は、以下のコマンドで表示できる。



```bash
$ sudo lsof -i -P | grep LISTEN
```

<br>

## 04-02. メールデータのプロトコル

### メールデータの送受信

#### ▼ 仕組み

【１】クライアント（メール送信できるアプリケーション）から受信したメールは、送信側のメールサーバーに送信される。

【２】送信側のメールサーバーは、メールを受信側のメールサーバーに転送する。

【３】受信側のアプリケーションは、各々が指定したプロトコルに応じて、受信側のメールサーバーからメールデータを取得する。

> ℹ️ 参考：https://xtech.nikkei.com/it/pc/article/basic/20120312/1043605/

![smtp_pop3_imap4](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/smtp_pop3_imap4.png)

#### ▼ 送信側のメールサーバーのモック

メールデータの送信機能を開発する時に、送信テストを実施する必要があり、この内容は公開したくない。

そこで、送信側のメールサーバーのモックを提供するサービスを利用する。

この送信側メールサーバーモックは、クライアントから受信したメールのテストデータを受信側のメールサーバーに転送しないため、安全に送信テストを実施できる。

Mailtrapがおすすめである。



> ℹ️ 参考：https://mailtrap.io/

<br>

### SMTP：Simple Mail Transfer Protocol

#### ▼ SMTPとは

メールデータを送信するためのプロトコルのこと。



#### ▼ SMTP-AUTH：SMTP AUTHentication

SMTPに認証を組み込んだ仕組みのこと。

クライアント（メール送信できるアプリケーション）からメールサーバーにメールデータをSMTP送信する時、メールサーバーがクライアントに対して認証を実行する。



![SMTP-AUTH](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SMTP-AUTH.png)

<br>

### POP3：Post Official Protocol version 3

#### ▼ POP3とは

メールサーバーに届いたメールを、受信機器にダウンロードし、受信機器で参照するプロトコル。

メールの既読未読状況は、他の受信機器と共有される。



<br>

### IMAP4：Internet Message Access Protocol version 4

#### ▼ IMAP4とは

メールサーバーに届いたメールを、受信機器にダウンロードせず、メールサーバーに置いたまま参照するプロトコル。

メールの既読未読状況は、他の受信機器と共有されない。



**＊例＊**

GmailでPOPかIMAPを設定できる。



![GmailでPOPorIMAPを設定](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/GmailでPOPかIMAPを設定.jpg)

<br>

### APOP：Authenticated POP

#### ▼ APOPとは

メール受信の際に、チャレンジレスポンス方式の認証を行うことにより、平文の認証情報がネットワークに流れるのを防止するプロトコル

<br>

## 05. トランスポート層（```L4```）

### トランスポート層とは

アプリケーション層のプロトコルを適切なアプリケーションに振り分けるプロトコル（例：TCP、UDP、など）を処理するレイヤーである。



> ℹ️ 参考：https://ja.wikipedia.org/wiki/%E3%83%88%E3%83%A9%E3%83%B3%E3%82%B9%E3%83%9D%E3%83%BC%E3%83%88%E5%B1%A4

<br>

### トランスポート層の仕組み

#### ▼ 全体像

クライアントからのリクエスト時に、ネットワーク層から渡されたパケットのポート番号情報を元に、アプリケーション層の特定のプロセスにパケットを渡す。

また反対に、レスポンス時にアプリケーション層のプロセスから出力されたパケットに情報を付加し、ネットワーク層に渡す。

この時、各アプリケーションはプロセスとして稼働していることに留意する。



![トランスポート層からアプリケーション層へのパケットの移動](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/トランスポート層からアプリケーション層へのパケットの移動.PNG)

#### ▼ クライアントからのリクエスト時（図の 『```→```』 ）

【１】ネットワーク層でプライベートIPアドレスを使用して、リクエスト先のパソコンを識別する。

【２】トランスポート層で、ポート番号を元にして、アプリケーション層のプロセスにパケットを送信する。

**＊例＊**

インバウンド通信を待ち受けるポート番号を```8080```と設定した場合、リクエスト時に以下の様にポート番号を指定すると、```nginx```プロセスにリクエストを送信できる。



```yaml
GET http://127.0.0.1:8080
```

#### ▼ クライアントへのレスポンス時（図の 『```←```』 ）

【１】パケットの通過したポート番号をヘッダ情報として追加する。

【２】ネットワーク層へ送信する。

<br>

## 05-02. ソケットのプロトコル

### ソケット

#### ▼ ソケットとは

トランスポート層に存在し、受信した通信をアプリケーション層の各プロセスに振り分ける受け口をソケットという。

送信元のサーバーが宛先に対して、『```192.168.1.1:50001```（送信元IPアドレス:送信ポート）』『```10.0.0.1:80```（宛先IPアドレス:宛先ポート）』といったように、IPアドレスとポート番号の組合せで指定する。



#### ▼ ソケット接続とは

ソケット間のネットワーク接続をソケット接続という。



<br>

### Unixドメインソケット

#### ▼ Unixドメインソケットとは

![unix-domain-socket](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/unix-domain-socket.png)

Unixで使用されるソケットのこと。

ソケットファイルを介して、同じOS上のプロセス間でパケットを送受信する。



> ℹ️ 参考：
>
> - https://en.wikipedia.org/wiki/Unix_domain_socket
> - https://ascii.jp/elem/000/001/415/1415088/
> - https://blog.bnikka.com/server/unix-socket.html

#### ▼ 通信方法

プロトコルを『```unix:```』としてパケットを送受信する。

ソケットファイル（```.sock```ファイル）自体にファイルとしての実体はなく、エンドポイントのように働く。



```bash
unix://./etc/foo.sock
```

<br>

## 06. ネットワーク層（```L3```）

### ネットワーク層とは

異なるネットワーク間でパケットを相互に転送するプロトコル（例：IP、ICMP、NDP、など）を処理するレイヤーである。



> ℹ️ 参考：https://ja.wikipedia.org/wiki/%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%8D%E3%83%83%E3%83%88%E5%B1%A4

<br>

### ネットワーク層の仕組み

![ネットワークにおけるTCP_IPを使用したデータ通信](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ネットワークにおけるTCP_IPを使用したデータ通信.png)

IPパケットのヘッダ情報を使用して、宛先認識する。



【１】PC-Aは、構成したIPパケットをEthernetに乗せて、ルーターAに送信する。

【２】ルーターAは、IPパケットをデジタル専用線に乗せて、ルーターBに送信する。

【３】ルーターBは、構成したIPパケットをEthernetに乗せて、webサーバーに送信する。ルーターとwebサーバーの間に、プロキシサーバーを配置することもある。

<br>
