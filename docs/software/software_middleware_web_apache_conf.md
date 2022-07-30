---
title: 【IT技術の知見】apache.conf@Apache
description: apache.conf@Apacheの知見を記録しています。
---

# apache.conf@Apache

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Apacheの仕組み

### アーキテクチャ

Apacheは、Apacheコアとモジュールから構成される。モジュールには、静的/動的モジュールがある。静的モジュールはApacheをインストールした時点でApacheコアに組み込まれている。一方で、動的モジュールは```mod_so```を使用して拡張機能的に組み込め、また取り外しできる。

ℹ️ 参考：https://thinkit.co.jp/article/120/1

![apache_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/apache_architecture.png)

<br>

## 01-02. ユースケース

### リバースプロキシサーバーのミドルウェアとして

#### ▼ HTTP/HTTPSプロトコルでルーティング

#### ▼ FastCGIプロトコルでルーティング

mod_fcgidモジュールを読み込むことによって、FastCGIプロトコルでルーティングできるようになる。

ℹ️ 参考：https://httpd.apache.org/mod_fcgid/

<br>

### Appサーバーのミドルウェアとして

mod_phpモジュールを読み込むことによって、Appサーバーのミドルウェアとしても機能させられる。

<br>

## 02. セットアップ

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install apache2
```

<br>

## 03. 設定ファイルの種類

### ```httpd.conf```ファイル

Apacheの主要な設定ファイル。Includeディレクティブを使用すれば、任意の名前で設定ファイルを追加できる。

ℹ️ 参考：https://httpd.apache.org/docs/2.4/ja/configuring.html#main

<br>

### ```.htaccess```ファイル

#### ▼ ```.htaccess```ファイルとは

基本的に、```httpd.conf```ファイルで全ての機能を設定できる。ただし、このファイルはインフラエンジニアの責務であり、アプリエンジニアでApacheの設定を定義したい場合に、```.htaccess```ファイルを使用する。

ℹ️ 参考：

- https://httpd.apache.org/docs/2.4/ja/configuring.html#htaccess
- https://ja.wikipedia.org/wiki/.htaccess

#### ▼ ルートディレクトリに置いた場合

全てのファイルに対して、ディレクティブが適用される。

ℹ️ 参考：https://htaccess.cman.jp/attention/

![htaccess影響範囲](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/htaccess影響範囲.png)

#### ▼ それ以外のディレクトリに置いた場合

設置したディレクトリ配下の階層のファイルに対して適用される。

ℹ️ 参考：https://htaccess.cman.jp/attention/

![htaccess影響範囲_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/htaccess影響範囲_2.png)

<br>

## 04. Coreにおける設定ディレクティブ

### ServerRoot

#### ▼ ServerRootとは

他の設定ディレクティブで、相対パスが設定されている場合に適用される。そのルートディレクトリを設定する。

**＊実装例＊**

通常であれば、etcディレクトリ配下にconfファイルが配置される。

```apacheconf
ServerRoot /etc/httpd
```

CentOSのEPELリポジトリ経由でインストールした場合、Apacheのインストール後に、optディレクトリ配下にconfファイルが設置される。

```apacheconf
ServerRoot /opt/rh/httpd24/root/etc/httpd
```

<br>

### VirtualHost

#### ▼ VirtualHostとは

ディレクティブを囲うディレクティブの一種。特定のホスト名やIPアドレスにリクエストがあった時に実行するディレクティブを設定する。VirtualHostという名前の通り、1 つのサーバー上で、仮想的に複数のドメインを扱うような処理も定義できる。複数のVirtualHostを設定した場合、1つ目がデフォルト設定として認識される。

**＊実装例＊**

```apacheconf
Listen 80
NameVirtualHost *:80

# Defaultサーバーとして扱う。
<VirtualHost *:80>
    DocumentRoot /var/www/foo
    ServerName example.com
</VirtualHost>

<VirtualHost *:80>
    DocumentRoot /var/www/bar
    ServerName example.org
</VirtualHost>
```
#### ▼ IPベースVirtualHost

各ドメインに異なるIPアドレスを割り振るバーチャルホスト。

#### ▼ 名前ベースVirtualHost
全てのドメインに同じIPアドレスを割り振るバーチャルホスト。

<br>

### DocumentRoot

#### ▼ DocumentRootとは

ドキュメントのルートディレクトリを設定する。ドキュメントルートに『```index.html```』というファイルを配置すると、ファイル名を指定しなくとも、ルートディレクトリ内の```index.html```ファイルが、エントリーポイントとして自動的に認識されて表示される。

**＊実装例＊**

```apacheconf
<VirtualHost *:80>
    DocumentRoot /var/www/foo:
    ServerName example.com
</VirtualHost>
```

index.html以外の名前をエントリーポイントにする場合、ファイル名を指定する必要がある。

**＊実装例＊**

```apacheconf
<VirtualHost *:80>
    DocumentRoot /var/www/foo:/start-up.html
    ServerName example.com
</VirtualHost>
```

<br>

### Directory

#### ▼ Directoryとは

ディレクティブを囲うディレクティブの一種。指定したディレクトリ内にリクエストがあった時に実行するディレクティブを設定する。

**＊実装例＊**

```apacheconf
<Directory "/var/www/foo">
    DirectoryIndex index.php
    AllowOverride All
</Directory>
```

<br>

### User、Group

#### ▼ Userとは

httpdプロセスのユーザー名を設定する。httpdプロセスによって作成されたファイルの所有者名は、このディレクティブで定義したものになる。

**＊実装例＊**

```apacheconf
User apache
```

#### ▼ Groupとは

httpdプロセスのグループ名を設定する。httpdプロセスによって作成されたファイルのグループ名は、このディレクティブで定義したものになる。

**＊実装例＊**

```apacheconf
Group apache
```

<br>

### KeepAlive、MaxKeepAliveRequests、KeepAliveTimeout

#### ▼ KeepAliveとは

HTTPプロトコルのリクエストのクライアントに対して、セッションIDを付与するか否かを設定する。

**＊実装例＊**

```apacheconf
KeepAlive On
```

#### ▼ KeepAliveTimeout

セッションIDを付与中のクライアントで、再びリクエストを送信するまでに何秒間空いたら、セッションIDを破棄するか、を設定する。

**＊実装例＊**

```apacheconf
# KeepAliveがOnの時のみ
KeepAliveTimeout 5
```

#### ▼ MaxKeepAliveRequests

セッションIDを付与中のクライアントで、リクエストのファイルの最大数を設定する。

**＊実装例＊**

```apacheconf
# KeepAliveがOnの時のみ
MaxKeepAliveRequests 1000
```

<br>

## 04-02. mod_soにおける設定ディレクティブ

### LoadModule

#### ▼ LoadModule

モジュールを読み出し、設定ディレクティブを宣言できるようにする。

**＊実装例＊**

相対パスを指定し、ServerRootを適用させる。これにより、httpdディレクトリのmodulesディレクトリが参照される。

```apacheconf
# ServerRoot が /opt/rh/httpd24/root/etc/httpd だとする。

LoadModule dir_module modules/mod_dir.so
```

<br>

## 04-03. mod_dirにおける設定ディレクティブ

### DirectoryIndex

#### ▼ DirectoryIndexとは

Directoryディレクティブによってリクエストされたディレクトリのインデックスファイルをレスポンスする。

**＊実装例＊**

```apacheconf
<Directory "/var/www/foo">
    DirectoryIndex index.html index.php
</Directory>
```
**＊実装例＊**

```apacheconf
<Directory "/var/www/foo">
    DirectoryIndex index.html
    DirectoryIndex index.php
</Directory>
```

<br>

### AllowOverride

#### ▼ AllowOverrideとは

別に用意した```.htaccess```ファイルにて、有効化するディレクティブを設定する。

**＊実装例＊**

```apacheconf
<Directory "/var/www/foo">
    DirectoryIndex index.php
    AllowOverride All
</Directory>
```

#### ▼ All

別に用意した```.htaccess```ファイルにて、実装できるディレクティブを全て有効化する。

**＊実装例＊**

```apacheconf
AllowOverride All
```

#### ▼ None

別に用意した```.htaccess```ファイルにて、実装できるディレクティブを全て無効化する。

**＊実装例＊**

```apacheconf
AllowOverride None
```

#### ▼ Indexes

別に用意した```.htaccess```ファイルにて、DirectoryIndexディレクティブを有効化するか否かを設定する。

**＊実装例＊**

```apacheconf
AllowOverride Indexes
```

<br>

## 04-04. mod_writeにおける設定ディレクティブ

### RewriteCond

#### ▼ RewriteCondとは

条件分岐と、それによる処理を設定する。

**＊実装例＊**

```apacheconf
RewriteCond %変数名 条件
```

**＊実装例＊**

```apacheconf
RewriteCond %{HTTP:X-Forwarded-Port} !^443$
```

<br>

### RewriteRule

#### ▼ リダイレクトとリライトの違い

以下のリンクを参考にせよ。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html

#### ▼ RewriteRuleとは

条件分岐による処理を設定する。

```apacheconf
RewriteRule URL書換＆ルーティングの記述
```

**＊実装例＊**

リクエストをHTTPSプロトコルに変換して、リダイレクトする。

```apacheconf
RewriteRule ^(.*)?$ https://%{HTTP_HOST}$1 [R=301,L]
```

<br>

## 04-05. mod_setenvifにおける設定ディレクティブ

### SetEnvIf

#### ▼ SetEnvIfとは

条件分岐と環境変数の設定を設定する。

```apacheconf
# クエリパラメーターが以下の拡張子の場合
SetEnvIf Request_URI "\.(gif|jpe?g|png|js|css)$" object-is-ignore
```

#### ▼ nolog

ログを出力しない場合を設定できる。

<br>

## 04-06. mod_log_configにおける設定ディレクティブ

### LogFormat

#### ▼ LogFormatとは

アクセスログファイルの書式を設定する。

#### ▼ アクセスログ形式と出力内容

アクセスログの出力先ログファイルとフォーマットを合わせて設定する。

**＊実装例＊**

```apacheconf
# common形式
CustomLog logs/access_log common
LogFormat "%h %l %u %t "%r" %>s %b" common

# combine形式
CustomLog logs/access_log combined
LogFormat "%h %l %u %t "%r" %>s %b "%{Referer}i" "%{User-Agent}i"" combined
```

以下のようなログになる。

```log
# common形式
118.86.194.71 - - [17/Aug/2011:23:04:03 +0900] "GET /home/name/category/web HTTP/1.1" 200 11815
```
```log
# combine形式
118.86.194.71 - - [17/Aug/2011:23:04:03 +0900] "GET /home/name/category/web HTTP/1.1" 200 11815 "http://naoberry.com/home/name/" "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.112 Safari/535.1"
```

#### ▼ ログの変数一覧

| 変数           | 値                                  | 例                                                           |
| -------------- | ----------------------------------- | ------------------------------------------------------------ |
| %h             | リモートホスト                      | 118.86.194.71                                                |
| %l             | リモートログ名（基本”-“になる）     | -                                                            |
| %u             | リモートユーザ（Basic認証のユーザ） | -                                                            |
| %t             | リクエスト受付時刻                  | [17/Aug/2011:23:04:03 +0900]                                 |
| %r             | リクエストの最初の行                | GET /home/name/category/web HTTP/1.1                         |
| %s             | ステータス                          | 200                                                          |
| %b             | レスポンスのバイト数                | 11815                                                        |
| %{Referer}i    | リファラ                            | http://naoberry.com/home/name/                               |
| %{User-Agent}i | ユーザエージェント                  | Mozilla/5.0 (Windows NT 6.1) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.112 Safari/535.1 |

<br>

### ErrorLog

#### ▼ ErrorLogとは

エラーログファイルの書式を設定する。

#### ▼ エラーログ形式と出力内容

エラーログの出力先を設定する。

**＊実装例＊**

```apacheconf
ErrorLog /var/log/httpd/error_log
```

<br>

### LogLevel

#### ▼ LogLevelとは

ログに出力する最低のレグレベルを設定する。

```apacheconf
LogLevel warn
```

<br>

## 04-07. mod_sslにおける設定ディレクティブ 

### SSLCertificateFile

#### ▼ SSLCertificateFileとは

PKIにおける公開鍵の検証に必要なSSL証明書のディレクトリを設定する。本番環境ではAWSのACMの証明書を使用することが多いため、基本的な用途としては、ローカル開発でのオレオレ証明書読み出しのために使用する。

**＊実装例＊**

```apacheconf
SSLCertificateFile /etc/httpd/conf.d/server.crt
```

<br>

### SSLCertificateKeyFile

#### ▼ SSLCertificateKeyFileとは

PKIにおける公開鍵の検証に必要な秘密鍵のディレクトリを設定する。

**＊実装例＊**

```apacheconf
SSLCertificateKeyFile /etc/httpd/conf.d/server.key
```

<br>

## 04-08. mod_headersにおける設定ディレクティブ

### Header

#### ▼ Headerとは

レスポンスヘッダーを設定する。```set```、```append```、```add```、```unset```、```echo```オプションを設定できる。デフォルトでは```2xx```と```3xx```のステータスコードのみで設定が適用される。オプションとして、```always```を設定することにより、全てのステータスコードでヘッダーを設定する。

#### ▼ set

レスポンスヘッダーを追加する。

**＊実装例＊**

```Referrer-Policy```ヘッダーを追加し、値を```no-referrer-when-downgrade```とする。ちなみに、Chrome85以降の```Referrer-Policy```ヘッダー初期値の仕様変更については、以下のリンクを参考にせよ。

ℹ️ 参考：https://www.chromestatus.com/feature/6251880185331712

```apacheconf
Header set Referrer-Policy "no-referrer-when-downgrade"
```

```apacheconf
Header set Referrer-Policy "no-referrer-when-downgrade" always
```

#### ▼ unset

レスポンスヘッダーを削除する。

**＊実装例＊**

```Referrer-Policy```ヘッダーを削除する

```apacheconf
Header unset Referrer-Policy "no-referrer-when-downgrade"
```

```apacheconf
Header unset Referrer-Policy "no-referrer-when-downgrade" always
```



