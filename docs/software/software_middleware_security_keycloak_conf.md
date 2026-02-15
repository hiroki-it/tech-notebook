---
title: 【IT技術の知見】設定ファイル＠Keycloak
description: 設定ファイル＠Keycloakの知見を記録しています。
---

# 設定ファイル＠Keycloak

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 設定方法

Keycloakでは、コマンドオプション、環境変数、`keycloak.conf` ファイルのいずれかでパラメーターを設定できる。

> - https://docs.redhat.com/ja/documentation/red_hat_build_of_keycloak/24.0/html/server_guide/configuration-formats-for-configuration#configuration-example-alternative-formats-based-on-configuration-source

<br>

## 02. keycloak.conf

```bash
db=postgres
```

> - https://qiita.com/m-takai/items/7d8b97767cd9544f4f41#%E8%A8%AD%E5%AE%9A%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%E4%BD%BF%E3%81%86%E5%A0%B4%E5%90%88

<br>

## 03. 環境変数

### Bootstrap Admin

| 変数                          | 値の例  | 説明                                             |
| ----------------------------- | ------- | ------------------------------------------------ |
| `KC_BOOTSTRAP_ADMIN_USERNAME` | `admin` | Keycloakのルートユーザー名を設定する。           |
| `KC_BOOTSTRAP_ADMIN_PASSWORD` | `admin` | Keycloakのルートユーザーのパスワードを設定する。 |

> - https://www.keycloak.org/server/all-config#category-bootstrap_admin

<br>

### Cache

| 変数             | 値の例       | 説明                                                                                                                                               |
| ---------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `KC_CACHE`       | `ispn`       | セッションデータ管理の仕組みを設定する。例えば `ispn` の場合、KeycloakクラスターでInfinispanを使用する。                                             |
| `KC_CACHE_STACK` | `kubernetes` | Keycloakクラスター内のクラスターインスタンス間の通信方法を設定する。例えば `kubernetes` の場合、KeycloakクラスターでKubernetesによる通信を使用する。 |

<br>

### Database

#### ▼ Databaseとは

資格情報のDB (例：MySQL、PostgreSQLなど) を使用できる。

Keycloakと各DBのバージョンの相性を確認しておく必要がある。

> - https://access.redhat.com/articles/7033107

#### ▼

| 変数                 | 値の例                                | 説明                                                                                                    |
| -------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `KC_DB`              | `mysql`                               | Keycloakで使用するDBベンダーを設定する。 開発環境では、`dev-file` とするとファイルシステムを使用できる。 |
| `KC_DB_URL`          | `jdbc:mysql://<ホスト名>:3306/<DB名>` |                                                                                                         |
| `KC_DB_URL_DATABASE` | `keycloak`                            |                                                                                                         |
| `KC_DB_USERNAME`     | `keycloak`                            |                                                                                                         |
| `KC_DB_PASSWORD`     | `password`                            |                                                                                                         |

> - https://www.keycloak.org/server/all-config#category-database

<br>

### HTTP

| 変数                    | 値の例 | 説明                                                   |
| ----------------------- | ------ | ------------------------------------------------------ |
| `KC_HTTP_RELATIVE_PATH` | `/`    | Keycloakの認証エンドポイントのプレフィクスを設定する。 |

> - https://www.keycloak.org/server/all-config#category-http

<br>

### Hostname

| 変数          | 値の例                     | 説明                                                                                                                                               |
| ------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `KC_HOSTNAME` | `localhost` (Dockerの場合) | Keycloakのエンドポイントのホスト名を設定する。各種認証エンドポイント全体のホスト名に影響する。Kubernetes内にKeycloakを置く場合、これは設定しない。 |

> - https://www.keycloak.org/server/all-config#category-hostname_v2

<br>

### Logging

| 変数           | 値の例  | 説明                             |
| -------------- | ------- | -------------------------------- |
| `KC_LOG_LEVEL` | `debug` | Keycloakのログレベルを設定する。 |

> - https://www.keycloak.org/server/all-config#category-logging

<br>

### Proxy

| 変数       | 値の例 | 説明                                                                                                    |
| ---------- | ------ | ------------------------------------------------------------------------------------------------------- |
| `KC_PROXY` | `edge` | Keycloalyがリバースプロキシを後ろにあること有効化する。Kubernetesではこれを `edge` を設定する必要がある。 |

<br>

### JAVA_OPTS_APPEND

| 変数                         | 値の例                                                            | 説明                                                                          |
| ---------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `-Djgroups.dns.query`        | `<KeycloakクラスターのService名>.<Namespace名>.svc.cluster.local` | Keycloakクラスター内のKeycloakクラスターインスタンスを返却するDNSを設定する。 |
| `-Djava.net.preferIPv4Stack` | `true`                                                            |                                                                               |

> - https://www.keycloak.org/server/configuration-production
> - https://docs.redhat.com/en/documentation/red_hat_data_grid/8.0/html/configuring_data_grid/cluster_transport#jgroups_system_props-configuring

<br>

## 04. `Cookie` ヘッダー

### AUTH_SESSION_ID

Keycloakのログイン後、`Cookie` ヘッダーによって運搬されるセッションデータである。

`<セッションID>.keycloak-0-27504` の形式になる。

> - https://qiita.com/i7a7467/items/57ef85d601a854519ff3#auth_session_id

<br>

### KEYCLOAK_IDENTITY

アクセストークンである。

JWTのサイトでデコードすると、中身を確認できる。

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

> - https://qiita.com/i7a7467/items/57ef85d601a854519ff3#keycloak_identity
> - https://stackoverflow.com/a/50840122

<br>

### KEYCLOAK_SESSION

> - https://qiita.com/i7a7467/items/57ef85d601a854519ff3#keycloak_session
> - https://stackoverflow.com/a/50840122

<br>

## 05. JSON

Realmをインポートすることにより、設定を宣言的に定義できる。

ファイルが大きいので、[ここで](https://github.com/hiroki-it/tech-notebook/blob/main/docs/software/large_files/software_middleware_security_keycloak_conf.yaml) に設定ファイルの例を置いている

<br>
