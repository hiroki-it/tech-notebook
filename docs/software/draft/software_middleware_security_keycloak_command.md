---
title=【IT技術の知見】コマンド＠Keycloak
description=コマンド＠Keycloakの知見を記録しています。
---

# コマンド＠Keycloak

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. kc.sh

### build

```bash
$ kc.sh build
```

<br>

### start

#### ▼ startとは

本番環境モードで起動する。

以下がデフォルトで設定されている。

- HTTPが無効
- ホスト名が必須
- HTTPSが推奨

```bash
$ kc.sh start
```

> - https://www.keycloak.org/server/configuration#_starting_keycloak

#### ▼ --cache-stack

JGroupsのレプリケーション間通信で使用するクラスターインスタンス検出方法を設定する。

```bash
$ kc.sh start --cache-stack kubernetes
```

| 値           | 検出方法  | プロトコル | ポート番号      |
| ------------ | --------- | ---------- | --------------- |
| `jdbc-ping`  | JDBC_PING | TCP        | `7800`、`57800` |
| `kubernetes` | DNS_PING  | TCP        |

> - https://www.keycloak.org/server/caching#_transport_stacks
> - https://www.keycloak.org/server/caching#_network_ports

#### ▼ --import-realm

起動時に`/opt/keycloak/data/import`ディレクトリ内にあるrealm定義ファイル (`<任意の名前>.json`ファイル) をインポートする。

コンテナであれば、`/opt/keycloak/data/import`ディレクトリ内にrealm定義ファイルをマウントしておく。

```bash
$ kc.sh start --import-realm
```

> - https://www.keycloak.org/server/importExport#_importing_a_realm_during_startup

#### ▼ --optimized

```bash
# 事前に kc.sh build コマンドを実行する

$ kc.sh start --optimized
```

> - https://www.keycloak.org/server/configuration#_creating_an_optimized_keycloak_build

<br>

### start-dev

開発環境モードで起動する。

以下がデフォルトで設定されている。

- HTTPが有効
- ホスト名が任意
- キャッシュ設定がローカル
- テーマキャッシュとテンプレートキャッシュが無効

```bash
$ kc.sh start-dev
```

> - https://www.keycloak.org/server/configuration#_starting_keycloak

<br>
