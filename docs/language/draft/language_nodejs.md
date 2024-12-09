---
title: 【IT技術の知見】Go＠言語
description: Go＠言語の知見を記録しています。
---

# Go＠言語

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Node.jsとは

記入中...

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
