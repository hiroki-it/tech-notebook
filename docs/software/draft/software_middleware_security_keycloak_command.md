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
