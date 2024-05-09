---
title: 【IT技術の知見】L5 ~ L7＠OSI参照モデル
description: L5 ~ L7＠OSI参照モデルの知見を記録しています。
---

# `L5` ~ `L7`＠OSI参照モデル

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. アプリケーション層、プレゼンテーション層、セッション層 (`L5`〜`L7`)

### アプリケーション層とは

アプリが待ち受けるプロトコル (例：HTTP、HTTPS、SMTP、DNS、POP3、など) を処理する層である。

> - https://ja.wikipedia.org/wiki/%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E5%B1%A4

<br>

### アプリケーション層の仕組み

![application_expose-port](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/application_expose-port.png)

`(1)`

: 各アプリがプロセスとして稼働しており、プロセスがパケットペイロードの元になるデータを作成する。

`(2)`

: 各プロセスは特定のポート番号を受信する。

     補足として、ポート番号を使用しているプロセスの一覧は、以下のコマンドで表示できる。

```bash
$ sudo lsof -i -P | grep LISTEN
```

> - https://netdekagaku.com/netstat-command/

<br>

## 02. メールデータのプロトコル

### メールデータの送受信

#### ▼ 仕組み

![smtp_pop3_imap4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/smtp_pop3_imap4.png)

`(1)`

: 送信側アプリ (例：任意のアプリ、Gmail、など) は、メールを送信する。

`(2)`

: SMTPサーバー (送信側メールサーバー) は、メールを受信する。

     なお、受信側にも仲介用のSMTPサーバーがある場合がある。

`(3)`

: SMTPサーバーは、メールをPOP/IMAPサーバー (受信側メールサーバー) に転送する。

`(4)`

: POP/IMAPサーバーは、メールを保管する。

`(5)`

: 受信側アプリ( 例：任意のアプリ、Gmail、など) は、各々が指定したプロトコルに応じて、POP/IMAPサーバーからメールデータを定期的に取得する。

> - https://xtech.nikkei.com/it/pc/article/basic/20120312/1043605/

#### ▼ SMTPサーバーのモック

アプリのメール送信機能を開発する時に、送信テストを実施する必要があり、この内容は公開したくない。

そこで、SMTPサーバーのモック (例：mailtrap、MailCatcher、MailDev、など) を提供するサービスを利用する。

このSMTPサーバーのモックは、アプリから受信したメールをPOP/IMAPサーバーに転送しない。

そのため、POP/IMAPサーバーにテスト用メールを送信することなく、アプリは送信テストを実施できる。

> - https://untitledreport.com/mailhog%E3%81%AE%E5%BE%8C%E7%B6%99fake-smtp%E3%80%81mailpit%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%81%9F/

<br>

### SMTP：Simple Mail Transfer Protocol

#### ▼ SMTPとは

メールデータを送信するためのプロトコルのこと。

#### ▼ SMTP-AUTH：SMTP AUTHentication

SMTPに認証を組み込んだ仕組みのこと。

クライアント (メール送信できるアプリ) からメールサーバーにメールデータをSMTP送信する時、メールサーバーがクライアントに対して認証を実行する。

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

#### ▼ IMAP4の仕組み

IMAPのリクエストは、`<タグ> <リクエストコマンド> <引数>`からなる。

レスポンスは、`<タグ> <ステータス> <レスポンスコード> <メッセージ>`からなる。

```bash
# リクエスト
0001 AUTHENTICATE CRAM-MD5
# レスポンス
* CAPABILITY IMAP4 IMAP4REV1 IDLE NAMESPACE MAILBOX-REFERRALS
SCAN SORT THREAD=REFERENCES
THREAD=ORDEREDSUBJECT MULTIAPPEND
0001 OK AUTHENTICATE completed

# リクエスト
0002 NAMESPACE
# レスポンス
* NAMESPACE (("" "/")("#mhinbox" NIL)("#mh/" "/")) (("~" "/"))
(("#shared/" "/")
("#ftp/" "/")("#news." ".")("#public/" "/"))
0002 OK NAMESPACE completed

# リクエスト
0003 LIST "" "INBOX"
# レスポンス
* LIST (\NoInferiors) NIL INBOX
0003 OK LIST completed

# リクエスト
0004 LIST "" *
# レスポンス
* LIST (\NoInferiors) "/" &kAFP4W4IMH8wojCkMMYw4A-
* LIST (\NoInferiors) "/" &Tgtm+DBN-
* LIST (\NoSelect) "/" fol2
* LIST (\NoInferiors) "/" fol2/fol3
* LIST (\NoInferiors \UnMarked) "/" fol10
* LIST (\NoInferiors) NIL INBOX
0004 OK LIST completed

# リクエスト
0005 CREATE Trash
# レスポンス
0005 OK CREATE completed

# リクエスト
0014 SELECT "INBOX"
# レスポンス
* 5 EXISTS
* 0 RECENT
* OK [UIDVALIDITY 988028003] UID validity status
* OK [UIDNEXT 6] Predicted next UID
* FLAGS (\Answered \Flagged \Deleted \Draft \Seen)
* OK [PERMANENTFLAGS (\* \Answered \Flagged \Deleted \Draft
\Seen)] Permanent flags
* OK [UNSEEN 5] first unseen message in /var/spool/mail/user
0014 OK [READ-WRITE] SELECT completed

# リクエスト
0015 STATUS "INBOX" (MESSAGES UNSEEN UIDNEXT)
# レスポンス
* NO CLIENT BUG DETECTED: STATUS on selected mailbox: INBOX
* STATUS INBOX (MESSAGES 5 UNSEEN 1 UIDNEXT 6)
0015 OK STATUS completed
```

> - https://atmarkit.itmedia.co.jp/ait/articles/0106/13/news001.html
> - https://superuser.com/a/218592

<br>

### APOP：Authenticated POP

#### ▼ APOPとは

メール受信の際に、チャレンジレスポンス方式の認証を実行することにより、平文の認証情報がネットワークに流れるのを防止するプロトコル

<br>
