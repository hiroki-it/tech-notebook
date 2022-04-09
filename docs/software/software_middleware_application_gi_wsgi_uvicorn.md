---
title: 【知見を記録するサイト】Uvicorn＠ミドルウェア
description: Uvicorn＠ミドルウェアの知見をまとめました．
---

# Uvicorn＠ミドルウェア

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Uvicornの仕組み

### 構造

要学習...

<br>

## 02. uvicornコマンド

### uvicornコマンドとは

開発環境でUvicornを起動するために用いる．

<br>

### オプション無し

ルートディレクトリにエントリーポイントのファイルを配置している場合は，```<モジュール名>.<インスタンス名>```となる．

```bash
$ uvicorn main:app
```

もし，サブディレクトリ配下にこのファイルを配置している場合は，```<ディレクトリ名>.<モジュール名>.<インスタンス名>```となる．

```bash
$ uvicorn src.main:app
```

<br>

## 03. gunicornコマンド

### gunicornコマンドとは

本番環境でUvicornを起動するために用いる．

参考：https://www.uvicorn.org/#running-with-gunicorn

なお，gunicornコマンドを用いる場合には，standardタイプのUvicornをインストールする必要がある．

参考：https://www.uvicorn.org/#quickstart

```bash
$ pip3 install uvicorn[standard]
```

