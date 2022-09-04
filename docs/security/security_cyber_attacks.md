---
title: 【IT技術の知見】サイバー攻撃＠セキュリティ
description: サイバー攻撃＠セキュリティの知見を記録しています。
---

#  サイバー攻撃＠セキュリティ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. サイバー攻撃の防御方法

### ファイアウォール

#### ▼ ファイアウォールとは

![security_protection-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/security_protection-type.png)

データリンク層からトランスポート層までに対するサイバー攻撃（そもそものネットワークへの侵入、ポートスキャン、など）を遮断する。

> ℹ️ 参考：https://digital-jyoshisu.com/archives/468

#### ▼ パケットフィルタリング型ファイアウォール

![パケットフィルタリング](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/パケットフィルタリング.gif)

パケットのヘッダ情報の送信元IPアドレスやポート番号などに基づいて、パケットを許可するべきか否かを決定する。パケットのデータは検査しない。ファイアウォールとwebサーバーの間には、NATルーターやNAPTルーターが設置されている。

> ℹ️ 参考：
>
> - https://www.rworks.jp/system/system-column/sys-entry/21277/
> - https://www.fenet.jp/infla/column/network/%E3%83%95%E3%82%A1%E3%82%A4%E3%82%A2%E3%82%A6%E3%82%A9%E3%83%BC%E3%83%AB%E3%81%AE%E7%A8%AE%E9%A1%9E5%E3%81%A4%EF%BD%9C%E6%B3%A8%E6%84%8F%E7%82%B9%E3%82%84%E3%83%A1%E3%83%AA%E3%83%83%E3%83%88%E3%81%AB/

**＊例＊**

Ubuntuでのiptablesは、パケットフィルタリング型ファイアウォールである。```/etc/sysconfig/iptables```ファイルにルールを設定する。```iptables-save```コマンドでこのファイルを作成できる。

> ℹ️ 参考：https://linuc.org/study/knowledge/540/

```bash
$ cat /etc/sysconfig/iptables

*filter
:INPUT DROP [5:300]
:FORWARD DROP [0:0]
:OUTPUT ACCEPT [32:3205]
# 22番ポートと80番ポート宛てのTCPプロトコルの通信を許可する。
-A INPUT -p tcp -m tcp --dport 22 -j ACCEPT
-A INPUT -p tcp -m tcp --dport 80 -j ACCEPT
COMMIT
```

**＊例＊**

CentOSでのfirewalldは、パケットフィルタリング型ファイアウォールである。デフォルトでは、全てのインバウンド通信が拒否、全てのアウトバウンド通信が許可、となっている。

> ℹ️ 参考：
>
> - https://tooljp.com/linux/Redhat7/faqRedhat7/html/firewalld-wiki.html
> - https://knowledge.sakura.ad.jp/22269/

アクセスが許可されているポート番号を確認する。

```bash
$ firewall-cmd --list-all

public (active)
  target: default
  icmp-block-inversion: no
  interfaces: eth0
  sources: 
  services: ssh dhcpv6-client
  ports: 22/tcp 80/tcp 443/tcp # アクセスを許可するポート番号
  protocols: 
  masquerade: no
  forward-ports: 
  source-ports: 
  icmp-blocks: 
  rich rules:
```

アクセスが許可されている送信元IPアドレスを確認する。

> ℹ️ 参考：https://kaede.jp/2018/02/11022556/

```bash
$ firewall-cmd --get-active-zones

foo-cidr
  sources: 192.168.128.0/23
public
  interfaces: ens192
```

**＊例＊**

Win10におけるファイアウォール。

> ℹ️ 参考：https://pc-karuma.net/windows-10-firewall-open-port/

![パケットフィルタリングの設定](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/パケットフィルタリングの設定.gif)

#### ▼ ゲートウェイ型ファイアウォール（プロキシサーバー型）

パケットのデータに基づいて、パケットを許可するべきか否かを決定する。

> ℹ️ 参考：https://www.rworks.jp/system/system-column/sys-entry/21277/

#### ▼ サーキットレベル型ファイアウォール

トランスポート層の段階でサイバー攻撃を遮断するファイアウォールのこと。

> ℹ️ 参考：https://www.rworks.jp/system/system-column/sys-entry/21277/

<br>

### IPS：Intrusion Prevention Systemとは

#### ▼ IPSとは

![security_protection-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/security_protection-type.png)

ネットワーク層からプレゼンテーション層までに対するサイバー攻撃（Dos攻撃、Synフラッド攻撃、パケットフラグメンテーション攻撃、など）を遮断するセキュリティシステムのこと。

> ℹ️ 参考：https://digital-jyoshisu.com/archives/468

<br>

### WAF：Web Application Firewall

#### ▼ WAFとは

![security_protection-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/security_protection-type.png)

アプリケーション層に対するサイバー攻撃（SQLインジェクション、XSS、OSコマンドインジェクション、など）を遮断するセキュリティシステムのこと。

> ℹ️ 参考：
>
> - https://digital-jyoshisu.com/archives/468
> - https://www.geeksforgeeks.org/difference-between-waf-and-firewall/

#### ▼ WAFの種類

> ℹ️ 参考：hhttps://liskul.com/waf-15products-35757

| WAFの種類        | 説明                                                         | 例                                                   |
| ---------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| ソフトウェア型   | WAFの機能を持つソフトウェアを自社サーバーにセットアップし、これを設置する。 | SuiteGuard、SmartCloud、など                         |
| アプライアンス型 | WAFのソフトウェアがすでにセットアップされたハードウェアを購入し、これを設置する。 | FortiWeb、Imperva SecureSphere、SiteGuard、など      |
| クラウド型       | クラウドプロバイダーが提供するWAFを設置する。                | AWS WAF、Google Cloud Armor、Cloudbric、Scutum、など |

<br>

## 01-02. サイバー攻撃の検出

### Detection Systemとは

#### ▼ Detection Systemとは

ネットワーク上を流れるトラフィックを監視し、不正アクセスと思われるパケットを検出する。また、検出内容を管理者に通知する。あくまで通知するだけで、攻撃を防御することはしない。

![IDS](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IDS.png)

<br>

## 02. Malware の種類と特徴

### Malware の語源

『malicious（悪意のある）+ software（ソフトウェア）』

<br>

### Macroウイルス

#### ▼ Macroウイルスとは

ワープロアプリ（例：Word）や、表計算アプリケーション（例：Excel）に感染

![Macroウイルス](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Macroウイルス.jpg)

<br>

### Worm

#### ▼ Wormとは

自己複製し、1つのコンピュータから、```4```個の経路（ネットワーク、メール、共有ディレクトリ、USB）を辿って、他のコンピュータに感染を広げていく。パソコンがグローバルIPで直接的にインターネットに接続していると感染しやすい。ワームを防ぐためには、パソコンにプライベートIPアドレスを設定し、NATやNAPTなどを介して、インターネットに接続させる必要がある。

**＊例＊**

共有ディレクトリ経由での感染拡大

![worm](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/worm.jpg)

<br>

### トロイの木馬

#### ▼ トロイの木馬とは

**＊例＊**

Google play で、過去にアプリとして忍び込んでいたトロイの木馬

![トロイの木馬](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/トロイの木馬.jpg)

感染方法がギリシャ神話上のトロイの木馬に似ていることに由来する。有用なプログラムであるように見せかけて、パソコン利用者に実行させることにより、感染。裏で不正な処理を行う。

※トロイの木馬はギリシャ神話に登場する。ギリシャ軍は難攻不落のトロイ城を陥落させるため、中に精鋭部隊を忍び込ませた木馬をトロイ城の近くに置いて帰った。戦利品だと勘違いしたトロイ軍は、城内に木馬を持ち帰った。夜中、木馬の中に隠れた精鋭部隊が自軍の兵士をトロイ城に引き入れ、城を制圧した。

<br>

### Spyware

#### ▼ Spywareとは

パソコン利用者の個人情報を収集し、外部に送信する。

![スパイウェア](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スパイウェア.png)

<br>

### Bot

#### ▼ Botとは

あらかじめBot化させておいたパソコンを踏み台として、攻撃者の命令通りに動かす。

#### ▼ パソコンがボット化するまでのプロセス

![ボット化のプロセス（パソコン）](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ボット化のプロセス（パソコン）.jpg)

#### ▼ スマホがボット化するまでのプロセス

![ボット化のプロセス（スマホ）](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ボット化のプロセス（スマホ）.jpg)

#### ▼ Bot の使われ方

  まず、攻撃先のネットワーク内にあるパソコンをBot化させる。攻撃者は、Bot化したパソコンを踏み台としてサーバーを攻撃させるように、C&Cサーバーに命令を出す。

![C&Cサーバー](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/C&Cサーバー.png)

<br>

## 03. サイバー攻撃/その対策

### Man In The Middle攻撃（中間者攻撃）

#### ▼ 中間者攻撃とは

二者間の通信に割り込み、盗聴/改竄/成りすましによって通信を攻撃する。

> ℹ️ 参考：https://www.rapid7.com/ja/fundamentals/man-in-the-middle-mitm-attacks/

#### ▼ 【対策】通信の暗号化

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_encryption_technology.html

#### ▼ 【対策】チェックサム

sha256によって作成された文字列をファイル情報として添付し、これを送受信の両側で照合することにより、通知途中でファイルが改竄されていないことを保証する。

> ℹ️ 参考：https://academy.gmocloud.com/know/20200116/8627

<br>

### CSRF：Cross-Site Request Forgeries

#### ▼ CSRFとは

ユーザーがとあるフォームからログイン後、セッションIDを保持したまま悪意のあるサイトにアクセスしたとする。悪意のあるサイトのサーバーは、ユーザーのセッションIDを使用して、ログインしていた元のサイトのサーバーを攻撃する。サーバーは、正しいフォームからのリクエストと誤認してしまい、攻撃を許容してしまう。

> ℹ️ 参考：https://www.ipa.go.jp/security/vuln/websecurity-HTML-1_6.html

![csrf](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/csrf.png)

#### ▼ 【対策】ワンタイムトークン

![csrf-token](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/csrf-token.png)

認証時に、セッションIDだけでなく、ワンタイムトークンも併用する。認証フォームがリクエストされた時、サーバー側では、ワンタイムトークンを発行し、これを```Set-Cookie```ヘッダーの```csrftoken```パラメーター（フレームワークによっては、これに相当するパラメーター）や独自ヘッダーに割り当てて、レスポンスを返信する。

```yaml
200 OK

Set-Cookie: csrftoken=<トークン>
# 独自ヘッダー
X-CSRF-TOKEN: <トークン>
```

ブラウザではレスポンスヘッダーからワンタイムトークンを取り出し、認証フォームのinputタグのhidden属性に割り当てる。他に、metaタグにトークンを割り当てることもある。

```html
<form method="POST" action="http://foo.com/bar-form.php">
    <input type="hidden" name="csrftoken" value="<csrfトークン>">
    <input type="text" name="email">
    <input type="text" name="password">
    <input type="submit value="ログイン">
</form>
```

```html
<head>
    <meta name="csrftoken" content="<ヘッダーから取り出したトークン>">
</head>
```

認証のためのPOSTリクエスト時に、リクエストボディや独自ヘッダーにトークンを割り当て、リクエストを送信する。どちらを使用するかは、バックエンド側の仕様によって異なる。

```yaml
POST https://example.com/bar-form.php

# 独自ヘッダー
x-csrf-token: <トークン>

{
  _token=<トークン>
}
```

サーバー側では、POSTリクエストによって送信されたトークンとワンタイムトークンを比較し、認証を実行する。以降、POSTリクエストの場合はそのワンタイムトークンを使い回し、GETリクエストの場合は使用しない。トークンが変更されていれば、誤った入力フォームからのリクエストとして判定し、```401```ステータスを返却する。

> ℹ️ 参考：
>
> - https://terasolunaorg.github.io/guideline/5.2.0.RELEASE/ja/Security/CSRF.html#spring-securitycsrf
> - https://qiita.com/Nsystem/questions/1bd6d30748957e1b6700
> - https://qiita.com/mpyw/items/0595f07736cfa5b1f50c#%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%81%AE%E7%94%9F%E6%88%90%E6%96%B9%E6%B3%95

#### ▼ 【対策】CORS

[こちら](#XSS：Cross Site Scripting)の説明を参考にせよ

<br>

### セッションID固定化

#### ▼ セッションID固定化とは

> ℹ️ 参考：https://www.ipa.go.jp/security/vuln/websecurity-HTML-1_4.html

![session-fixation](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/session-fixation.png)

<br>

### Directory traversal

#### ▼ Directory traversalとは

traversalは、横断する（ディレクトリを乗り越える）の意味。パス名を使用してファイルを指定し、管理者の意図していないファイルを不正に閲覧またはダウンロードする。

![ディレクトリトラバーサル](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ディレクトリトラバーサル.jpg)

<br>

### DoS攻撃：Denial of Service

#### ▼ DoS攻撃、DDos攻撃とは

アクセスが集中することによりwebサーバーがパンクすることを利用し、悪意を持ってwebサーバーに多くのデータを送りつける手法。リクエストの送信元が1つの場合はDos攻撃、複数の場合はDDos攻撃という。

![DoS攻撃](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/DoS攻撃.png)

#### ▼ 【対策】POSTリクエストのリクエスト数制限

php.iniファイルにて、一度に受信できるPOSTリクエストの上限値を設定できる。

```ini
max_input_vars = 1000
```

#### ▼ 【対策】同一送信元のリクエスト制限

同じ送信元からの一分間あたりのリクエスト数を制限する。例えば、WAF、API Gatewayの機能を使用する。

<br>

### SQLインジェクション

#### ▼ SQLインジェクションとは

DBのSQLクエリのパラメーターとなる入力に、不正な文字列を入力して不正なSQLクエリを実行させ、DBの情報を抜き取る手法。ただし、近年は減少傾向にある。

![SQLインジェクション](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SQLインジェクション.jpg)

#### ▼ 【対策】特殊な文字列の無効化

DBのSQLクエリのパラメーターとなる入力では、『シングルクオーテーション』や『バックスラッシュ』などはSQLで特別な意味を持つ。そのため、これらのパラメーターが割り当てられているリクエストメッセージを拒否する。例えば、WAFの機能を使用する。

> ℹ️ 参考：https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list.html

#### ▼ 【対策】プレースホルダー

プリペアードステートメントのSQL中にパラメーターを設定し、値をパラメーターに渡した上で、SQLとして発行する方法。処理速度が速い。また、パラメーターに誤ってSQLが渡されても、型をチェックすることにより、実行できなくなるようにできるため、SQLインジェクションの対策になる。プレースホルダーについては、以下のリンクを参考にせよ。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_php_package_sql.html

<br>

### XSS：Cross Site Scripting

#### ▼ XSSとは

WebアプリケーションによるHTML出力のエスケープ処理の欠陥を悪用し、利用者のWebブラウザで悪意のあるスクリプトを実行させる 。

![cross-cite-scripting](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/cross-cite-scripting.png)

#### ▼ 【対策】CORS：Cross-Origin Resource Sharing（オリジン間リソース共有）

![cors](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/cors.png)

異なるドメインで表示されるページからのリクエストを許可する仕組みのこと。デフォルトでは、異なるドメインで表示されるページからのリクエストは拒否されるようになっている。異なるドメインで表示されるページからのリクエストを許可したい場合は、ページからのリクエストメッセージとサーバーからのレスポンスメッセージの両方で対応が必要である。

> ℹ️ 参考：https://developer.mozilla.org/ja/docs/Glossary/Origin

**＊実装例＊**

まず、リクエストメッセージの```Origin```ヘッダーに送信元オリジンを設定する。加えて、```Cookie```ヘッダーを持つリクエストメッセージを送信したい場合は、JavaScriptの実装で```withCredentials```オプションに```true```を割り当てる。JavaScriptのパッケージによってオプション名が異なるため注意する。

> ℹ️ 参考：https://qiita.com/tomoyukilabs/items/81698edd5812ff6acb34#%E3%82%B7%E3%83%B3%E3%83%97%E3%83%AB%E3%81%AB%E3%83%87%E3%83%BC%E3%82%BF%E3%81%AE%E8%AA%AD%E3%81%BF%E8%BE%BC%E3%81%BF%E3%82%92%E8%A8%B1%E5%8F%AF%E3%81%97%E3%81%9F%E3%81%84%E5%A0%B4%E5%90%88

```yaml
GET https://foo.com/bar

# 送信元オリジン
Origin: https://example.com
```

```javascript
import axios from 'axios'

const client = axios.create({
  baseURL: "https://foo.co.jp",
  withCredentials: true, // オプションの有効化
})

return new Promise((resolve, reject) => {
  client.get('/bar')
    .then((data) => {
      resolve(data)
    })
    .catch((err) => {
      reject(err)
    })
})
```

次に、レスポンスメッセージの```Access-Control-Allow-Origin```ヘッダーに、許可された送信元オリジンを割り当てて返信する。```Cookie```ヘッダーを持つリクエストメッセージを許可する場合、同じくレスポンスメッセージの```Access-Control-Allow-Credentials```ヘッダーに```true```を割り当てる。その他、許可するHTTPメソッドやHTTPヘッダーを定義できる。例えば、許可されていないHTTPメソッドを使用して、異なるオリジンにリクエストを送信すると、```405```ステータスでエラーレスポンスが返信される。

> ℹ️ 参考：
>
> - https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials
> - https://stackoverflow.com/questions/24687313/what-exactly-does-the-access-control-allow-credentials-header-do

```yaml
200 OK

# 許可された送信元オリジン
Access-Control-Allow-Origin: https://example.com
# リクエストメッセージがCookieヘッダーを持つことを許可する場合
Access-Control-Allow-Credentials: true
# 許可するHTTPメソッド
Access-Control-Allow-Methods: GET,POST,HEAD,OPTIONS
# その他、許可するHTTPヘッダー
Access-Control-Allow-Headers: Content-Type
```

ちなみに、```Cookie```ヘッダーを持つリクエストメッセージを許可しない場合に限り、全てのオリジンやヘッダーを許可できる。

```yaml
200 OK

# 全てのオリジンを許可
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: *
```

#### ▼ 【対策】```Set-Cookie```ヘッダーのDomain属性

リクエストメッセージが```Cookie```ヘッダーを持つことを許可した場合、サブドメインのオリジンにも```Cookie```ヘッダーの送信を許可するか否かを制御できる。サブドメインレスポンスメッセージの```Set-Cookie```ヘッダーにて、Domain属性にドメインが割り当てなかった場合は、ページを表示するサーバーのドメインにのみ```Cookie```ヘッダーを持つリクエストを許可でき、サブドメインへの送信を拒否できる。一方で、ドメインが割り当てた場合は、そのページからサブドメインに対しても、```Cookie```ヘッダーを持つリクエストを許可できる。ドメインではなく、オリジンであることに注意する。

> ℹ️ 参考：
>
> - https://zenn.dev/agektmr/articles/f8dcd345a88c97
> - https://azisava.sakura.ne.jp/programming/0017.html#sec4-1

**＊実装例＊**

Domain属性に```example.com```が割り当てられていたとする。最初にドットがついているドメイン（```.example.com```）でも、同じ値として認識される。この場合、```example.com```に加えて、サブドメイン（```foo.example.com```）に対しても、```Cookie```ヘッダーを持つリクエストを送信できる。

```yaml
200 OK

Set-Cookie: domain=example.com
```

```yaml
POST http://foo.example.com/bar-form.php

# 送信元オリジン
Origin: https://example.com
Cookie: sessionid=<セッションID>; csrftoken=<トークン>
```

#### ▼ 【対策】```Set-Cookie```ヘッダーのHttpOnly属性

これを有効化した場合、```Set-Cookie```ヘッダーに```HttpOnly```属性が割り当てられるようになる。JavaScriptから```Cookie```ヘッダーにアクセスできなくできる。

```yaml
200 OK

Set-Cookie: HttpOnly
```

#### ▼ 【対策】```Set-Cookie```ヘッダーのsameSite属性

| 属性値   | 説明                                                         |
| ------ | ------------------------------------------------------------ |
| None   | 異なるドメインから受信した全てのリクエストが```Cookie```ヘッダーを持つことを許可する。 |
| Lax    | 異なるドメインから受信した一部のリクエストが```Cookie```ヘッダーを持つことを許可する。 |
| Strict | 異なるドメインから受信した全てのリクエストが```Cookie```ヘッダーを持つことを拒否する。 |

異なるドメインからのリクエストが```Cookie```ヘッダーを持つことを許可/拒否する。ここでリクエストを制御しているのは、オリジンではなく、ドメインであることに注意する。

> ℹ️ 参考：https://zenn.dev/agektmr/articles/f8dcd345a88c97

```yaml
200 OK

Set-Cookie: SameSite=None
```

#### ▼ 【対策】```Set-Cookie```ヘッダーのSecure属性

これを有効化した場合、```Set-Cookie```ヘッダーに```Secure```属性が割り当てられるようになる。HTTPSプロトコルを使用した場合のみ、リクエストメッセージに```Cookie```ヘッダーを割り当てられるようになる。

```yaml
200 OK

Set-Cookie: Secure
```

<br>

### パスワードリスト攻撃

#### ▼ パスワードリスト攻撃とは

漏洩したパスワードを使用して、正面から正々堂々とアクセスする手法。

![パスワードリスト攻撃](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/パスワードリスト攻撃.png)

<br>

### Brute-force攻撃とReverse Brute-force攻撃

#### ▼ Brute-force攻撃とReverse Brute-force攻撃とは

Brute-forceは力ずくの意味。IDを固定して、パスワードを総当たりで試す手法。例えば、5桁数字のパスワードなら、9の5乗通りの組み合わせを試す。一方で、Reverse Brute-forceは、パスワードを固定して、IDを総当たりで試す手法。

![brute-force-attack_reverse-brute-force-attack](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/brute-force-attack_reverse-brute-force-attack.png)

#### ▼ パスワードのパターン数

![パスワードのパターン数](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/パスワードのパターン数.png)

<br>

### レインボー攻撃

#### ▼ レインボー攻撃とは

レインボーテーブルの文字列とハッシュ値の対応関係を元にして、ハッシュ化された暗号からパスワードを推測する手法。

![レインボー攻撃](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Rainbow攻撃.png)

#### ▼ 【対策】BCryptによるハッシュ化

BCryptを使用して、Blowfish方式に基づく暗号化を実行する。Blowfish方式では、同じパスワードの文字列であっても異なるハッシュ値が作成されるため、レインボー攻撃を防げる。Blowfish方式で作成されたハッシュ値は、異なるルールで作成された複数のハッシュ値の組み合わせである。

> ℹ️ 参考：
>
> - https://medium-company.com/%E3%82%B9%E3%83%88%E3%83%AC%E3%83%83%E3%83%81%E3%83%B3%E3%82%B0/
> - https://medium-company.com/bcrypt/

```
# <アルゴリズムバージョン> + <ストレッチング回数> + <ランダム文字列> + <パスワードハッシュ値>
$2y$10$1QVmWNzk.TsaZQLQ/zeI9OAZL02AWP.VdFPPyAc9hSc2Cp4yOXKtG
```

| 文字列                                          | 説明                                                         |
| ----------------------------------------------- | ------------------------------------------------------------ |
| ```$2y$```（4文字）                             | 暗号化アルゴリズムのバージョンを表す。他に、```2```、```2a```、```2b```、```2x```がある。 |
| ```$10$```（4文字）                             | ストレッチング（ハッシュ化の反復）の回数を表す。```10```とした場合は、2^10回反復でハッシュ化を実行する。 |
| ```1QVmWNzk.TsaZQLQ/zeI9O```（22文字）          | ソルト（ランダムな文字列）を表す。                           |
| ```AZL02AWP.VdFPPyAc9hSc2Cp4yOXKtG```（31文字） | パスワードそのもののハッシュ値を表す。                       |

<br>

## 04. その他のサイバー攻撃

### ソーシャルエンジニアリング

#### ▼ ソーシャルエンジニアリングとは

技術的な手法ではなく、物理的な手法（例：盗み見、盗み聞き、成りすまし、詐欺など）によってパスワードを取得し、アクセスする手法。

![ソーシャルエンジニアリング](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ソーシャルエンジニアリング.png)

<br>

### 踏み台攻撃

#### ▼ 踏み台攻撃とは

対象のインターネット内のパソコンに攻撃プログラムを仕込んで配置し、攻撃者からの命令でサーバーを攻撃させる手法（※ボットを使用した攻撃など）

#### ▼ パソコンがボット化するまでのプロセス（再掲）

![ボット化のプロセス（パソコン）](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ボット化のプロセス（パソコン）.jpg)

#### ▼ スマホがボット化するまでのプロセス（再掲）

![ボット化のプロセス（スマホ）](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ボット化のプロセス（スマホ）.jpg)

#### ▼ Bot の使われ方（再掲）

![C&Cサーバー](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/C&Cサーバー.png)

<br>

### DNS Cache Poisoning

#### ▼ DNS Cache Poisoningとは

キャッシュDNSサーバーが持つIPアドレスを偽のIPアドレスに変え、偽のサイトに強制的にアクセスさせる手法。

![DNSキャッシュポイズニング](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/DNSキャッシュポイズニング.gif)

<br>

### Back Door

#### ▼ Back Doorとは

例えば、サイトのカード決済画面やサーバーに潜ませることによって、カード情報を第三者に送信する手法。

![バックドア](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/バックドア.png)

