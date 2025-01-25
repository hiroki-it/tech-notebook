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

## 02. 環境変数

### Bootstrap Admin

| 変数                          | 値の例     | 説明                                                                           |
| ----------------------------- | ---------- | ------------------------------------------------------------------------------ |
| `KC_BOOTSTRAP_ADMIN_USERNAME` | `admin`    | Keycloakのルートユーザー名を設定する。                                         |
| `KC_BOOTSTRAP_ADMIN_PASSWORD` | `password` | Keycloakのルートユーザーのパスワードを設定する。                               |
| `PROXY_ADDRESS_FORWARDING`    | `true`     | Keycloakの前段にリバースプロキシ (サイドカーも含む) がある場合に`true`とする。 |

> - https://www.keycloak.org/server/all-config#category-bootstrap_admin
> - https://blog.linkode.co.jp/entry/2021/06/23/061829#%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%81%AB-PROXY_ADDRESS_FORWARDINGtrue-%E3%82%92%E6%8C%87%E5%AE%9A%E3%81%99%E3%82%8B

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

## 02. conf

記入中...

<br>
