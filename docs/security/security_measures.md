---
title: 【IT技術の知見】︎対策＠セキュリティ
description: ︎対策＠セキュリティの知見を記録しています。
---

# ︎対策＠セキュリティ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 【`L2`～`L4`】ファイアウォール

### ファイアウォールとは

`L2` (データリンク層) から`L4` (トランスポート層) までに対するサイバー攻撃 (例：そもそものネットワークへの侵入、ポートスキャン、など) を防御する。

> - https://digital-jyoshisu.com/archives/468

![security_protection-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/security_protection-type.png)

<br>

### パケットフィルタリング型ファイアウォール

#### ▼ パケットフィルタリング型ファイアウォールとは

![パケットフィルタリング](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/パケットフィルタリング.gif)

パケットのヘッダー情報の送信元IPアドレスやポート番号などに基づいて、パケットを許可する必要があるか否かを決める。

パケットのデータは検査しない。

ファイアウォールとwebサーバーの間には、NATルーターやNAPTルーターが配置されている。

> - https://www.rworks.jp/system/system-column/sys-entry/21277/
> - https://www.fenet.jp/infla/column/network/%E3%83%95%E3%82%A1%E3%82%A4%E3%82%A2%E3%82%A6%E3%82%A9%E3%83%BC%E3%83%AB%E3%81%AE%E7%A8%AE%E9%A1%9E5%E3%81%A4%EF%BD%9C%E6%B3%A8%E6%84%8F%E7%82%B9%E3%82%84%E3%83%A1%E3%83%AA%E3%83%83%E3%83%88%E3%81%AB/

#### ▼ iptables (Linux/Ubuntu) による標準的ファイアウォール

Linux/Ubuntuでのiptablesは、標準的なNAPTルーターかつパケットフィルタリング型ファイアウォールである。特に、パケットフィルタリングのルールは、`/etc/sysconfig/iptables`ファイルの`filter`テーブルで設定する。`iptables-save`コマンドでこのファイルを作成できる。

| `filter`テーブルに関するチェイン名 | 説明                                          |
| ---------------------------------- | --------------------------------------------- |
| INPUT                              | パケットの受信時に、その送信を許可/拒否する。 |
| FORWARD                            | パケットの転送時に、その転送を許可/拒否する。 |
| OUTPUT                             | パケットの送信時に、その送信を許可/拒否する。 |

**＊例＊**

```bash
$ cat /etc/sysconfig/iptables

...

*filter
:INPUT DROP [5:300]
:FORWARD DROP [0:0]
:OUTPUT ACCEPT [32:3205]
# 22番ポートと80番ポート宛てのTCPプロトコルのインバウンド通信を許可する。
-A INPUT -p tcp -m tcp --dport 22 -j ACCEPT
-A INPUT -p tcp -m tcp --dport 80 -j ACCEPT
COMMIT

...
```

> - https://christina04.hatenablog.com/entry/iptables-outline-
> - https://linuc.org/study/knowledge/540/
> - https://qiita.com/Tocyuki/items/6d90a1ec4dd8e991a1ce#filter%E3%83%86%E3%83%BC%E3%83%96%E3%83%AB

#### ▼ firewalld (CentOS) による標準的ファイアウォール

CentOSでのfirewalldは、標準的なパケットフィルタリング型ファイアウォールである。

デフォルトでは、全てのインバウンド通信が拒否、全てのアウトバウンド通信が許可、となっている。

> - https://tooljp.com/linux/Redhat7/faqRedhat7/html/firewalld-wiki.html
> - https://knowledge.sakura.ad.jp/22269/

**＊例＊**

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

> - https://kaede.jp/2018/02/11022556/

```bash
$ firewall-cmd --get-active-zones

foo-cidr
  sources: 192.168.128.0/23
public
  interfaces: ens192
```

#### ▼ Windowsファイアウォール (Windows) による標準的ファイアウォール

Windowsファイアウォールは、Windowsにおけるファイアウォールである。

![パケットフィルタリングの設定](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/パケットフィルタリングの設定.gif)

> - https://pc-karuma.net/windows-10-firewall-open-port/

**＊例＊**

<br>

### ゲートウェイ型ファイアウォール (プロキシサーバー型)

パケットのデータに基づいて、パケットを許可する必要があるか否かを決める。

> - https://www.rworks.jp/system/system-column/sys-entry/21277/

<br>

### サーキットレベル型ファイアウォール

`L4` (トランスポート層) の段階でサイバー攻撃を遮断するファイアウォールのこと。

> - https://www.rworks.jp/system/system-column/sys-entry/21277/

<br>

## 02. 【`L3`～`L6`】IPS：Intrusion Prevention System

### IPSとは

`L3` (ネットワーク層) から`L6` (プレゼンテーション層) までに対するサイバー攻撃 (Dos攻撃、Synフラッド攻撃、パケットフラグメンテーション攻撃、など) を遮断するセキュリティシステムのこと。

> - https://digital-jyoshisu.com/archives/468

![security_protection-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/security_protection-type.png)

<br>

## 03. 【`L3`～`L6`】IDS：Intrusion Detection System

### IDSとは

`L3` (ネットワーク層) から`L6` (プレゼンテーション層) までに対するサイバー攻撃を防御する。

不正アクセスと思われるパケットを検出する。

また、検出内容を管理者に通知する。

あくまで通知するのみで、攻撃を防御することはしない。

![IDS](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IDS.png)

<br>

## 04. 【`L3`～`L7`】暗号化プロトコル

`L3` (ネットワーク層) から`L7` (アプリケーション層) までに対するサイバー攻撃を防御する。

> - https://hiroki-it.github.io/tech-notebook/security/security_measures_encryption_technology_encryption_protocol.html

<br>

## 05. 【`L7`】WAF：Web Application Firewall

### WAFとは

`L7` (アプリケーション層) に対するサイバー攻撃 (SQLインジェクション、XSS、OSコマンドインジェクション、など) を防御する。

![security_protection-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/security_protection-type.png)

> - https://digital-jyoshisu.com/archives/468
> - https://www.geeksforgeeks.org/difference-between-waf-and-firewall/

<br>

### WAFの種類

> - hhttps://liskul.com/waf-15products-35757

| WAFの種類        | 説明                                                                              | 例                                                                |
| ---------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| ソフトウェア型   | WAFの能力を持つソフトウェアを自社サーバーにセットアップし、これを配置する。       | SuiteGuard、SmartCloud、など                                      |
| アプライアンス型 | WAFのソフトウェアがすでにセットアップされたハードウェアを購入し、これを配置する。 | FortiWeb、Imperva SecureSphere、SiteGuard、など                   |
| クラウド型       | クラウドプロバイダーが提供するWAFを配置する。                                     | AWS WAF、Google Cloud Armor、Cloudbric、Scutum、CrowdStrike、など |

<br>

## 06. 【`L7`】チェックサム

### チェックサムとは

`L7` (アプリケーション層) に対するサイバー攻撃を防御する。

sha256によって作成された文字列をファイル情報として添付し、これを送受信の両方のアプリケーション側で照合することにより、通知途中でファイルが改竄されていないことを保証する。

通信データを暗号化するわけではない。

> - https://academy.gmocloud.com/know/20200116/8627

<br>

## 07. 【`L7`】ワンタイムトークン

### ワンタイムトークンとは

`L7` (アプリケーション層) に対するサイバー攻撃 (例：CSRF) を防御する。

認証時に、セッションIDのみでなく、ワンタイムトークンも併用する。

認証フォームがリクエストされた時、サーバー側では、ワンタイムトークンを発行し、これを`Set-Cookie`ヘッダーの`csrftoken`パラメーター (フレームワークによっては、これに相当するパラメーター) や独自ヘッダーに割り当てて、レスポンスを返信する。

![csrf-token](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/csrf-token.png)

> - https://terasolunaorg.github.io/guideline/5.2.0.RELEASE/ja/Security/CSRF.html#spring-securitycsrf

<br>

### ワンタイムトークンの仕組み

```yaml
200 OK
---
Set-Cookie: csrftoken=<トークン>
# 独自ヘッダー
X-CSRF-TOKEN: <トークン>
```

`(1)`

: ブラウザではレスポンスヘッダーからワンタイムトークンを取り出し、認証フォームのinputタグのhidden属性に割り当てる。

     他に、metaタグにトークンを割り当てることもある。

```html
<form method="POST" action="http://foo.com/bar-form.php">
  <input type="hidden" name="csrftoken" value="<csrfトークン>" />
  <input type="text" name="email" />
  <input type="text" name="password" />
  <input type="submit value="ログイン">
</form>
```

```html
<head>
  <meta name="csrftoken" content="<ヘッダーから取り出したトークン>" />
</head>
```

`(2)`

: 認証のためのPOSTリクエスト時に、リクエストボディや独自ヘッダーにトークンを割り当て、リクエストを送信する。

     どちらを使用するかは、バックエンド側の仕様によって異なる。

```yaml
POST https://example.com/bar-form.php
---
# 独自ヘッダー
x-csrf-token: <トークン>
---
# ボディ
{_token=<トークン>}
```

`(3)`

: サーバー側では、POSTリクエストによって送信されたトークンとワンタイムトークンを比較し、認証を実行する。

     以降、POSTリクエストの場合はそのワンタイムトークンを使い回し、GETリクエストの場合は使用しない。

     トークンが変更されていれば、誤った入力フォームからのリクエストとして判定し、`401`ステータスを返却する。

> - https://qiita.com/Nsystem/questions/1bd6d30748957e1b6700
> - https://qiita.com/mpyw/items/0595f07736cfa5b1f50c#%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%81%AE%E7%94%9F%E6%88%90%E6%96%B9%E6%B3%95

<br>

## 08. 【`L7`】パラメーターの制限

### パラメーターの制限とは

`L7` (アプリケーション層) に対するサイバー攻撃 (例：SQLインジェクション) を防御する。

アプリケーションで、任意のパラメーターを入力できないようにする。

<br>

### 特殊な文字列の無効化

DBのSQLクエリのパラメーターとなる入力では、『シングルクオーテーション』や『バックスラッシュ』などはSQLで特別な意味を持つ。

そのため、これらのパラメーターが割り当てられているリクエストを拒否する。

例えば、WAFを使用する。

> - https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-list.html

<br>

### プレースホルダー

プリペアードステートメントのSQL中にパラメーターを設定し、値をパラメーターに渡した上で、SQLとして発行する。

処理速度が速い。

また、パラメーターに誤ってSQLが渡されても、型をチェックすることにより、実行できなくなるようにできるため、SQLインジェクションの対策になる。

プレースホルダーについては、以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/language/language_php_package_sql.html

<br>

## 09. 【`L7`】CORS：Cross-Origin Resource Sharing (オリジン間リソース共有)

### CORSとは

`L7` (アプリケーション層) に対するサイバー攻撃 (例：CSRF、XSS) を防御する。

異なるドメインで表示されるページからのリクエストを許可する仕組みのこと。

デフォルトでは、異なるドメインで表示されるページからのリクエストは拒否されるようになっている。

異なるドメインで表示されるページからのリクエストを許可したい場合は、ページからのリクエストとサーバーからのレスポンスの両方で対応が必要である。

![cors](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cors.png)

> - https://developer.mozilla.org/ja/docs/Glossary/Origin

<br>

### CORSの仕組み

**＊実装例＊**

`(1)`

: リクエストの`Origin`ヘッダーに送信元オリジンを設定する。

     加えて、`Cookie`ヘッダーを持つリクエストを送信したい場合は、JavaScriptの実装で`withCredentials`オプションに`true`を割り当てる。

     JavaScriptのパッケージによってオプション名が異なるため注意する。

> - https://qiita.com/tomoyukilabs/items/81698edd5812ff6acb34#%E3%82%B7%E3%83%B3%E3%83%97%E3%83%AB%E3%81%AB%E3%83%87%E3%83%BC%E3%82%BF%E3%81%AE%E8%AA%AD%E3%81%BF%E8%BE%BC%E3%81%BF%E3%82%92%E8%A8%B1%E5%8F%AF%E3%81%97%E3%81%9F%E3%81%84%E5%A0%B4%E5%90%88

```yaml
GET https://foo.com/bar
---
# 送信元オリジン
Origin: https://example.com
```

```javascript
import axios from "axios";

const client = axios.create({
  baseURL: "https://foo.co.jp",
  withCredentials: true, // オプションの有効化
});

return new Promise((resolve, reject) => {
  client
    .get("/bar")
    .then((data) => {
      resolve(data);
    })
    .catch((err) => {
      reject(err);
    });
});
```

`(2)`

: 次に、レスポンスの`Access-Control-Allow-Origin`ヘッダーに、許可された送信元オリジンを割り当てて返信する。

     `Cookie`ヘッダーを持つリクエストを許可する場合、同じくレスポンスの`Access-Control-Allow-Credentials`ヘッダーに`true`を割り当てる。

     その他、許可するHTTPメソッドやHTTPヘッダーを定義できる。

     例えば、許可されていないHTTPメソッドを使用して、異なるオリジンにリクエストを送信すると、`405`ステータスでエラーレスポンスが返信される。

> - https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials
> - https://stackoverflow.com/questions/24687313/what-exactly-does-the-access-control-allow-credentials-header-do

```yaml
200 OK
---
# 許可された送信元オリジン
Access-Control-Allow-Origin: https://example.com
# リクエストがCookieヘッダーを持つことを許可する場合
Access-Control-Allow-Credentials: true
# 許可するHTTPメソッド
Access-Control-Allow-Methods: GET,POST,HEAD,OPTIONS
# その他、許可するHTTPヘッダー
Access-Control-Allow-Headers: Content-Type
```

補足として、`Cookie`ヘッダーを持つリクエストを許可しない場合に限り、全てのオリジンやヘッダーを許可できる。

```yaml
200 OK
---
# 全てのオリジンを許可
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: *
```

<br>

## 10. 【`L7`】`Set-Cookie`ヘッダー

### `Set-Cookie`ヘッダーとは

`L7` (アプリケーション層) に対するサイバー攻撃 (例：XSS) を防御する。

属性を有効化することにより、リクエストヘッダーの作成を制限できる。

<br>

### Domain属性

#### ▼ Domain属性とは

リクエストが`Cookie`ヘッダーを持つことを許可した場合、サブドメイン名のオリジンにも`Cookie`ヘッダーの送信を許可するか否かを制御できる。

サブドメイン名のレスポンスの`Set-Cookie`ヘッダーにて、Domain属性にドメインが割り当てなかった場合は、ページを表示するサーバーのドメインにのみ`Cookie`ヘッダーを持つリクエストを許可でき、サブドメイン名への送信を拒否できる。

一方で、ドメインが割り当てた場合は、そのページからサブドメイン名に対しても、`Cookie`ヘッダーを持つリクエストを許可できる。

ドメインではなく、オリジンであることに注意する。

> - https://zenn.dev/agektmr/articles/f8dcd345a88c97
> - https://azisava.sakura.ne.jp/programming/0017.html#sec4-1

#### ▼ Domain属性の仕組み

**＊実装例＊**

Domain属性に`example.com`が割り当てられていたとする。

最初にドットがついているドメイン (`.example.com`) でも、同じ値として認識される。

この場合、`example.com`に加えて、サブドメイン名 (`foo.example.com`) に対しても、`Cookie`ヘッダーを持つリクエストを送信できる。

```yaml
200 OK
---
Set-Cookie: domain=example.com
```

```yaml
POST http://foo.example.com/bar-form.php
---
# 送信元オリジン
Origin: https://example.com
Cookie: sessionid=<セッションID>; csrftoken=<トークン>
```

<br>

### HttpOnly属性

#### ▼ HttpOnly属性とは

これを有効化した場合、`Set-Cookie`ヘッダーに`HttpOnly`属性が割り当てられるようになる。JavaScriptから`Cookie`ヘッダーにアクセスできなくできる。

```yaml
200 OK
---
Set-Cookie: HttpOnly
```

<br>

### sameSite属性

#### ▼ sameSite属性とは

| 属性値 | 説明                                                                               |
| ------ | ---------------------------------------------------------------------------------- |
| None   | 異なるドメインから受信した全てのリクエストが`Cookie`ヘッダーを持つことを許可する。 |
| Lax    | 異なるドメインから受信した一部のリクエストが`Cookie`ヘッダーを持つことを許可する。 |
| Strict | 異なるドメインから受信した全てのリクエストが`Cookie`ヘッダーを持つことを拒否する。 |

異なるドメインからのリクエストが`Cookie`ヘッダーを持つことを許可/拒否する。

ここでリクエストを制御しているのは、オリジンではなく、ドメインであることに注意する。

> - https://zenn.dev/agektmr/articles/f8dcd345a88c97

```yaml
200 OK
---
Set-Cookie: SameSite=None
```

<br>

### Secure属性

#### ▼ Secure属性とは

これを有効化した場合、`Set-Cookie`ヘッダーに`Secure`属性が割り当てられるようになる。HTTPSプロトコルを使用した場合のみ、リクエストに`Cookie`ヘッダーを割り当てられるようになる。

```yaml
200 OK
---
Set-Cookie: Secure
```

<br>

## 11. 認証/認可情報の複雑化

### 認証/認可情報の複雑化とは

`L7` (アプリケーション層) に対するサイバー攻撃 (例：SQLインジェクション) を防御する。

認証/認可で必要になる情報を簡単に特定できないようにする。

<br>

### BCryptによるハッシュ化

#### ▼ BCryptによるハッシュ化

BCryptを使用して、Blowfish方式に基づく暗号化を実行する。

Blowfish方式では、同じパスワードの文字列であっても異なるハッシュ値が作成されるため、レインボー攻撃を防げる。

Blowfish方式で作成されたハッシュ値は、異なるルールで作成された複数のハッシュ値の組み合わせである。

> - https://medium-company.com/%E3%82%B9%E3%83%88%E3%83%AC%E3%83%83%E3%83%81%E3%83%B3%E3%82%B0/
> - https://medium-company.com/bcrypt/

#### ▼ 構造

```yaml
# <アルゴリズムバージョン> + <ストレッチング回数> + <ランダム文字列> + <パスワードハッシュ値>
$2y$10$1QVmWNzk.TsaZQLQ/zeI9OAZL02AWP.VdFPPyAc9hSc2Cp4yOXKtG
```

| 文字列                                     | 説明                                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `$2y$` (4文字)                             | 暗号アルゴリズムのバージョンを表す。他に、`2`、`2a`、`2b`、`2x`がある。                              |
| `$10$` (4文字)                             | ストレッチング (ハッシュ化の反復) の回数を表す。`10`とした場合は、2^10回反復でハッシュ化を実行する。 |
| `1QVmWNzk.TsaZQLQ/zeI9O` (22文字)          | ソルト (ランダムな文字列) を表す。                                                                   |
| `AZL02AWP.VdFPPyAc9hSc2Cp4yOXKtG` (31文字) | パスワードそのもののハッシュ値を表す。                                                               |

<br>

## 12. 【`L7`】アプリケーションのリクエスト数制限

### リクエスト数制限とは

`L3` (ネットワーク層) から`L4` (トランスポート層) までに対するサイバー攻撃 (例：Dos攻撃、DDos攻撃、など) を防御する。

<br>

### POSTリクエストのリクエスト制限

**＊実装例＊**

`php.ini`ファイルにて、一度に受信できるPOSTリクエストの上限値を設定できる。

```ini
max_input_vars = 1000
```

<br>

### 同一送信元のリクエスト制限

同じ送信元からの`1`分間あたりのリクエスト数を制限する。

例えば、WAF、API Gatewayを使用する。

<br>
