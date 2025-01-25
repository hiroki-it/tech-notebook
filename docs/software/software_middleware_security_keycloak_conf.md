---
title=【IT技術の知見】設定ファイル＠Keycloak
description=設定ファイル＠Keycloakの知見を記録しています。
---

# 設定ファイル＠Keycloak

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 設定方法

Keycloakでは、コマンドオプション、環境変数、`keycloak.conf`ファイルのいずれかでパラメーターを設定できる。

> - https://docs.redhat.com/ja/documentation/red_hat_build_of_keycloak/24.0/html/server_guide/configuration-formats-for-configuration#configuration-example-alternative-formats-based-on-configuration-source

<br>

## 02. keycloak.conf

記入中...

<br>

## 03. 環境変数

### Bootstrap Admin

| 変数                          | 値の例     | 説明                                             |
| ----------------------------- | ---------- | ------------------------------------------------ |
| `KC_BOOTSTRAP_ADMIN_USERNAME` | `admin`    | Keycloakのルートユーザー名を設定する。           |
| `KC_BOOTSTRAP_ADMIN_PASSWORD` | `password` | Keycloakのルートユーザーのパスワードを設定する。 |

> - https://www.keycloak.org/server/all-config#category-bootstrap_admin

<br>

### Cache

| 変数       | 値の例 | 説明                                                                                   |
| ---------- | ------ | -------------------------------------------------------------------------------------- |
| `KC_CACHE` | `ispn` | セッションデータ管理の仕組みを設定する。`ispn`の場合、Infinispanクラスターを実行する。 |

<br>

### Database

| 変数                 | 値の例                             | 説明                                     |
| -------------------- | ---------------------------------- | ---------------------------------------- |
| `KC_DB`              | `mysql`                            | Keycloakで使用するDBベンダーを設定する。 |
| `KC_DB_URL`          | `jdbc:mysql://mysql:3306/keycloak` |                                          |
| `KC_DB_URL_DATABASE` | `keycloak`                         |                                          |
| `KC_DB_USERNAME`     | `keycloak`                         |                                          |
| `KC_DB_PASSWORD`     | `password`                         |                                          |

> - https://www.keycloak.org/server/all-config#category-database

<br>

### Hostname

| 変数          | 値の例      | 説明                                         |
| ------------- | ----------- | -------------------------------------------- |
| `KC_HOSTNAME` | `localhost` | Keycloakのダッシュボードのホスト名を設定する |

> - https://www.keycloak.org/server/all-config#category-hostname_v2

<br>

### Logging

| 変数           | 値の例  | 説明                             |
| -------------- | ------- | -------------------------------- |
| `KC_LOG_LEVEL` | `debug` | Keycloakのログレベルを設定する。 |

> - https://www.keycloak.org/server/all-config#category-logging

<br>

### JAVA_OPTS_APPEND

| 変数                         | 値の例                                         | 説明                                                      |
| ---------------------------- | ---------------------------------------------- | --------------------------------------------------------- |
| `-Djgroups.dns.query`        | `keycloak-headless.keycloak.svc.cluster.local` | Keycloakクラスターのインスタンスを返却するDNSを設定する。 |
| `-Djava.net.preferIPv4Stack` | `true`                                         |                                                           |

> - https://www.keycloak.org/server/configuration-production
> - https://docs.redhat.com/en/documentation/red_hat_data_grid/8.0/html/configuring_data_grid/cluster_transport#jgroups_system_props-configuring

<br>
