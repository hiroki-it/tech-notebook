---
title: 【IT技術の知見】Node.js＠JavaScriptランタイム
description: Node.js＠JavaScriptランタイムの知見を記録しています。
---

# Node.js＠JavaScriptランタイム

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Node.jsとは

JavaScriptをクライアント側で実行する場合、ブラウザ (例：Chrome)を実行環境として使用できる。

一方で、サーバー側で実行する場合に、Node.jsを実行環境として使用する必要がある。

注意点として、Node.jsは言語ではない。

> - https://kinsta.com/jp/knowledgebase/what-is-node-js/#nodejs-4
> - https://kenko-keep.com/jabascript-nodejs/#toc-1

<br>

## 02. 仕組み

### ハードウェアリソース

cgroup v2を使用した、コンテナのハードウェアリソースの割り当てを決定している。

> - https://www.reddit.com/r/node/comments/1c29sge/comment/kzh8zw4/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

<br>

### 性能の違い

JavaScriptやTypeScriptは、ブラウザよりもNode.jsで実行した方が性能が高い。

つまり、フロントエンドの処理をバックエンドに寄せることで、処理の性能が向上する可能性がある。

| 比較項目    | ブラウザ（例：Chrome）                       | Node.js                            |
| ----------- | -------------------------------------------- | ---------------------------------- |
| CPU、メモリ | ユーザーのローカルPCやスマートフォンに依存   | サーバーに依存                     |
| スレッド    | メインスレッド                               | マルチスレッド                     |
| I/O         | ブラウザとサーバー間のネットワーク通信に依存 | 通信は不要で、サーバーで処理が完結 |

<br>

## 03. セットアップ

### Dockerfile

```dockerfile
FROM node:22.11.0-bookworm-slim

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

# 開発環境の場合
CMD ["yarn", "dev"]
```

<br>

## 04. エラー

### MODULE_NOT_FOUND

> - https://zenn.dev/sasakir/articles/8457791bdd173a#1.-module_not_found

<br>

### EADDRINUSE

> - https://zenn.dev/sasakir/articles/8457791bdd173a#2.-eaddrinuse

<br>

### EACCES

> - https://zenn.dev/sasakir/articles/8457791bdd173a#3.-eacces

<br>

### Unhandled 'error' event

> - https://zenn.dev/sasakir/articles/8457791bdd173a#4.-unhandled-'error'-event

<br>

### ENOTFOUND

> - https://zenn.dev/sasakir/articles/8457791bdd173a#5.-enotfound

<br>

### ECONNREFUSED

> - https://zenn.dev/sasakir/articles/8457791bdd173a#6.-econnrefused

<br>

### ETIMEDOUT

> - https://zenn.dev/sasakir/articles/8457791bdd173a#7.-etimedout

<br>

### EPIPE

> - https://zenn.dev/sasakir/articles/8457791bdd173a#8.-epipe

<br>

### ECONNRESET

> - https://zenn.dev/sasakir/articles/8457791bdd173a#9.-econnreset

<br>

### EMFILE

> - https://zenn.dev/sasakir/articles/8457791bdd173a#10.-emfile

<br>
