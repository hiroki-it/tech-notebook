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

ブラウザかいなかに関わらず、JavaScriptを実行できるようにするための実行環境である。

注意点として、言語ではない。

> - https://kinsta.com/jp/knowledgebase/what-is-node-js/#nodejs-4
> - https://qr.ae/pYhcLo

<br>

## 02. セットアップ

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

## 03. エラー

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
