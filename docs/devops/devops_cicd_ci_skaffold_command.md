---
title: 【IT技術の知見】コマンド＠Skaffold
description: コマンド＠Skaffoldの知見を記録しています。
---

# コマンド＠Skaffold

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. skaffoldコマンド

### グローバル

#### ▼ --verbosity

ログレベルを指定し、`skaffold`コマンドを実行する。

デフォルトは`warn`である。

```bash
$ skaffold <任意のパラメーター> --verbosity=debug
```

> ↪️：https://skaffold.dev/docs/references/cli/#skaffold

<br>

### build

#### ▼ buildとは

全てのコンテナイメージをビルドする。

```bash
$ skaffold build
```

> ↪️：https://skaffold.dev/docs/references/cli/#skaffold-build

#### ▼ --cache-artifacts

キャッシュを無効化し、`build`コマンドを実行する。

```bash
$ skaffold build --cache-artifacts=false
```

<br>

### dev

#### ▼ dev

アプリケーションのコードを監視し、変更が検出された時に、コンテナイメージの再ビルド/プッシュ/デプロイを実行する。

また、ポートフォワーディングを実行する。

```bash
$ skaffold dev
```

#### ▼ --trigger

一定間隔でコードの変更を監視しつつ、`dev`コマンドを実行する。

```bash
$ skaffold dev --trigger=polling
```

#### ▼ --no-prune、--cache-artifacts

イメージをキャッシュせず、また後処理で全てのコンテナイメージを削除しつつ、`dev`コマンドを実行する。

```bash
$ skaffold dev --no-prune=false --cache-artifacts=false
```

#### ▼ --port-forward

ポートフォワードを実行しつつ、`dev`コマンドを実行する。

```bash
$ skaffold dev --port-forward
```

<br>

### run

#### ▼ run

バックグラウンドで、コンテナイメージのビルド/デプロイを実行する。

```bash
$ skaffold run
```

#### ▼ force

リソースを強制的にデプロイしつつ、`skaffold run`コマンドを実行する。

```bash
$ skaffold run --force
```

#### ▼ --no-prune、--cache-artifacts

イメージをキャッシュせず、また後処理で全てのコンテナイメージを削除しつつ、`skaffold run`コマンドを実行する。

```bash
$ skaffold run --no-prune=false --cache-artifacts=false
```

#### ▼ --tail

フォアグラウンドで`skaffold run`コマンドを実行する。

```bash
$ skaffold run --tail
```

#### ▼ --port-forward

ポートフォワードを実行しつつ、`skaffold run`コマンドを実行する。

```bash
$ skaffold run --port-forward
```

<br>

## 02. ポートフォワーディング

### コマンド別

| コマンド                          | ポートフォワーディングの可否       |
| --------------------------------- | ---------------------------------- |
| `skaffold dev`                    | ユーザー定義を参照                 |
| `skaffold dev --port-forward`     | ユーザー定義を参照                 |
| `skaffold dev --port-forward=off` | ポートフォワーディングを実行しない |
| `skaffold run`                    | ポートフォワーディングを実行しない |
| `skaffold run --port-forward`     | ユーザー定義を参照                 |

> ↪️：https://skaffold.dev/docs/pipeline-stages/port-forwarding/

<br>
