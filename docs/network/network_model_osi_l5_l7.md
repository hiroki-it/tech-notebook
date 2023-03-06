---
title: 【IT技術の知見】L5 - L7＠OSI参照モデル
description: L5 - L7＠OSI参照モデルの知見を記録しています。
---

# L5 - L7＠OSI参照モデル

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. アプリケーション層、プレゼンテーション層、セッション層 (`L5`〜`L7`)

### アプリケーション層とは

アプリケーションが待ち受けるプロトコル (例：HTTP、HTTPS、SMTP、DNS、POP3、など) を処理するレイヤーである。

> ↪️ 参考：https://ja.wikipedia.org/wiki/%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E5%B1%A4

<br>

### アプリケーション層の仕組み

![application_expose-port](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/application_expose-port.png)

`【１】`

: 各アプリケーションがプロセスとして稼働しており、プロセスがデータ (メッセージ) を作成する。

`【２】`

: 各プロセスは特定のポート番号を受信する。

     補足として、ポート番号を使用しているプロセスの一覧は、以下のコマンドで表示できる。

```bash
$ sudo lsof -i -P | grep LISTEN
```

> ↪️ 参考：https://netdekagaku.com/netstat-command/

<br>

## 02. メールデータのプロトコル

### メールデータの送受信

#### ▼ 仕組み

`【１】`

: クライアント (メール送信できるアプリケーション) から受信したメールは、送信側のメールサーバーに送信される。

`【２】`

: 送信側のメールサーバーは、メールを受信側のメールサーバーに転送する。

`【３】`

: 受信側のアプリケーションは、各々が指定したプロトコルに応じて、受信側のメールサーバーからメールデータを取得する。

![smtp_pop3_imap4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/smtp_pop3_imap4.png)

> ↪️ 参考：https://xtech.nikkei.com/it/pc/article/basic/20120312/1043605/

#### ▼ 送信側のメールサーバーのモック

メールデータの送信機能を開発する時に、送信テストを実施する必要があり、この内容は公開したくない。

そこで、送信側のメールサーバーのモックを提供するサービスを利用する。

この送信側メールサーバーモックは、クライアントから受信したメールのテストデータを受信側のメールサーバーに転送しないため、安全に送信テストを実施できる。

Mailtrapがおすすめである。

> ↪️ 参考：https://mailtrap.io/

<br>

### SMTP：Simple Mail Transfer Protocol

#### ▼ SMTPとは

メールデータを送信するためのプロトコルのこと。

#### ▼ SMTP-AUTH：SMTP AUTHentication

SMTPに認証を組み込んだ仕組みのこと。

クライアント (メール送信できるアプリケーション) からメールサーバーにメールデータをSMTP送信する時、メールサーバーがクライアントに対して認証を実行する。

![SMTP-AUTH](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SMTP-AUTH.png)

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

![GmailでPOPorIMAPを設定](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/GmailでPOPかIMAPを設定.jpg)

<br>

### APOP：Authenticated POP

#### ▼ APOPとは

メール受信の際に、チャレンジレスポンス方式の認証を行うことにより、平文の認証情報がネットワークに流れるのを防止するプロトコル

<br>
