---
title=【IT技術の知見】keycloak.conf＠Keycloak
description=keycloak.conf＠Keycloakの知見を記録しています。
---

# keycloak.conf＠Keycloak

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 環境変数

### 管理者

| 変数                       | 値の例     | 説明                                                                           |
| -------------------------- | ---------- | ------------------------------------------------------------------------------ |
| `KEYCLOAK_ADMIN`           | `admin`    |                                                                                |
| `KEYCLOAK_ADMIN_PASSWORD`  | `password` |                                                                                |
| `PROXY_ADDRESS_FORWARDING` | `true`     | Keycloakの前段にリバースプロキシ (サイドカーも含む) がある場合に`true`とする。 |

> - https://www.keycloak.org/server/all-config#category-bootstrap_admin

<br>

### データベース

| 変数                 | 値の例                             | 説明 |
| -------------------- | ---------------------------------- | ---- |
| `KC_DB`              | `mysql`                            |      |
| `KC_DB_URL`          | `jdbc:mysql://mysql:3306/keycloak` |      |
| `KC_DB_URL_DATABASE` | `keycloak`                         |      |
| `KC_DB_USERNAME`     | `keycloak`                         |      |
| `KC_DB_PASSWORD`     | `password`                         |      |

> - https://www.keycloak.org/server/all-config#category-database

<br>
