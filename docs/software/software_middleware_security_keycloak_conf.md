---
title: 【IT技術の知見】設定ファイル＠Keycloak
description: 設定ファイル＠Keycloakの知見を記録しています。
---

# 設定ファイル＠Keycloak

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. 設定方法

Keycloak では、コマンドオプション、環境変数、`keycloak.conf` ファイルのいずれかでパラメーターを設定できる。

> - https://docs.redhat.com/ja/documentation/red_hat_build_of_keycloak/24.0/html/server_guide/configuration-formats-for-configuration#configuration-example-alternative-formats-based-on-configuration-source

<br>

## 02. keycloak.conf

```bash
db=postgres
```

> - [Keycloak Ver.17でデフォルトとなったQuarkusディストリビューションについて #Keycloak - Qiita](https://qiita.com/m-takai/items/7d8b97767cd9544f4f41#%E8%A8%AD%E5%AE%9A%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%E4%BD%BF%E3%81%86%E5%A0%B4%E5%90%88)

<br>

## 03. 環境変数

### Bootstrap Admin

<table>
  <thead>
    <tr>
      <th>変数</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>KC_BOOTSTRAP_ADMIN_USERNAME</code></td>
      <td><code>admin</code></td>
      <td>Keycloak のルートユーザー名を設定する。</td>
    </tr>
    <tr>
      <td><code>KC_BOOTSTRAP_ADMIN_PASSWORD</code></td>
      <td><code>admin</code></td>
      <td>Keycloak のルートユーザーのパスワードを設定する。</td>
    </tr>
  </tbody>
</table>

> - [All configuration - Keycloak](https://www.keycloak.org/server/all-config#category-bootstrap_admin)

<br>

### Cache

<table>
  <thead>
    <tr>
      <th>変数</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>KC_CACHE</code></td>
      <td><code>ispn</code></td>
      <td>セッションデータ管理の仕組みを設定する。例えば <code>ispn</code> の場合、Keycloak クラスターで Infinispan を使用する。</td>
    </tr>
    <tr>
      <td><code>KC_CACHE_STACK</code></td>
      <td><code>kubernetes</code></td>
      <td>Keycloak クラスター内のクラスターインスタンス間の通信方法を設定する。例えば <code>kubernetes</code> の場合、Keycloak クラスターで Kubernetes による通信を使用する。</td>
    </tr>
  </tbody>
</table>

<br>

### Database

#### ▼ Database とは

資格情報の DB (例：MySQL、PostgreSQL など) を使用できる。

Keycloak と各 DB のバージョンの相性を確認しておく必要がある。

> - [Red Hat build of Keycloak Supported Configurations - Red Hat Customer Portal](https://access.redhat.com/articles/7033107)

#### ▼

<table>
  <thead>
    <tr>
      <th>変数</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>KC_DB</code></td>
      <td><code>mysql</code></td>
      <td>Keycloak で使用する DB ベンダーを設定する。 開発環境では、<code>dev-file</code> とするとファイルシステムを使用できる。</td>
    </tr>
    <tr>
      <td><code>KC_DB_URL</code></td>
      <td><code>jdbc:mysql://&lt;ホスト名&gt;:3306/&lt;DB名&gt;</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>KC_DB_URL_DATABASE</code></td>
      <td><code>keycloak</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>KC_DB_USERNAME</code></td>
      <td><code>keycloak</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>KC_DB_PASSWORD</code></td>
      <td><code>password</code></td>
      <td></td>
    </tr>
  </tbody>
</table>

> - [All configuration - Keycloak](https://www.keycloak.org/server/all-config#category-database)

<br>

### HTTP

<table>
  <thead>
    <tr>
      <th>変数</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>KC_HTTP_RELATIVE_PATH</code></td>
      <td><code>/</code></td>
      <td>Keycloak の認証エンドポイントのプレフィクスを設定する。</td>
    </tr>
  </tbody>
</table>

> - [All configuration - Keycloak](https://www.keycloak.org/server/all-config#category-http)

<br>

### Hostname

<table>
  <thead>
    <tr>
      <th>変数</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>KC_HOSTNAME</code></td>
      <td><code>localhost</code> (Docker の場合)</td>
      <td>Keycloak のエンドポイントのホスト名を設定する。各種認証エンドポイント全体のホスト名に影響する。Kubernetes 内に Keycloak を置く場合、これは設定しない。</td>
    </tr>
  </tbody>
</table>

> - [All configuration - Keycloak](https://www.keycloak.org/server/all-config#category-hostname_v2)

<br>

### Logging

<table>
  <thead>
    <tr>
      <th>変数</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>KC_LOG_LEVEL</code></td>
      <td><code>debug</code></td>
      <td>Keycloak のログレベルを設定する。</td>
    </tr>
  </tbody>
</table>

> - [All configuration - Keycloak](https://www.keycloak.org/server/all-config#category-logging)

<br>

### Proxy

<table>
  <thead>
    <tr>
      <th>変数</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>KC_PROXY</code></td>
      <td><code>edge</code></td>
      <td>Keycloaly がリバースプロキシを後ろにあること有効化する。Kubernetes ではこれを <code>edge</code> を設定する必要がある。</td>
    </tr>
  </tbody>
</table>

<br>

### JAVA_OPTS_APPEND

<table>
  <thead>
    <tr>
      <th>変数</th>
      <th>値の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>-Djgroups.dns.query</code></td>
      <td><code>&lt;KeycloakクラスターのService名&gt;.&lt;Namespace名&gt;.svc.cluster.local</code></td>
      <td>Keycloak クラスター内の Keycloak クラスターインスタンスを返却する DNS を設定する。</td>
    </tr>
    <tr>
      <td><code>-Djava.net.preferIPv4Stack</code></td>
      <td><code>true</code></td>
      <td></td>
    </tr>
  </tbody>
</table>

> - [Configuring Keycloak for production - Keycloak](https://www.keycloak.org/server/configuration-production)
> - https://docs.redhat.com/en/documentation/red_hat_data_grid/8.0/html/configuring_data_grid/cluster_transport#jgroups_system_props-configuring

<br>

## 04. `Cookie` ヘッダー

### AUTH_SESSION_ID

Keycloak のログイン後、`Cookie` ヘッダーによって運搬されるセッションデータである。

`<セッションID>.keycloak-0-27504` の形式になる。

> - [KeycloakのCookieについて #Keycloak - Qiita](https://qiita.com/i7a7467/items/57ef85d601a854519ff3#auth_session_id)

<br>

### KEYCLOAK_IDENTITY

アクセストークンである。

JWT のサイトでデコードすると、中身を確認できる。

```yaml
{"alg": "HS512", "typ": "JWT", "kid": "*****"}
```

```yaml
{
  "exp": 1739761077,
  "iat": 1739725077,
  "jti": "*****",
  "iss": "http://localhost:8080/realms/<Realm名>",
  "sub": "*****",
  "typ": "Serialized-ID",
  "sid": "*****",
  "state_checker": "*****",
}
```

> - [KeycloakのCookieについて #Keycloak - Qiita](https://qiita.com/i7a7467/items/57ef85d601a854519ff3#keycloak_identity)
> - https://stackoverflow.com/a/50840122

<br>

### KEYCLOAK_SESSION

> - [KeycloakのCookieについて #Keycloak - Qiita](https://qiita.com/i7a7467/items/57ef85d601a854519ff3#keycloak_session)
> - https://stackoverflow.com/a/50840122

<br>

## 05. JSON

Realm をインポートすることにより、設定を宣言的に定義できる。

ファイルが大きいので、[ここで](https://github.com/hiroki-it/tech-notebook/blob/main/docs/software/large_files/software_middleware_security_keycloak_conf.yaml) に設定ファイルの例を置いている

<br>
