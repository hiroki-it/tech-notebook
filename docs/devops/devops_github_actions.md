---
title: 【知見を記録するサイト】GitHub Actions＠DevOps
description: GitHub Actions＠DevOpsの知見をまとめました．
---

# GitHub Actions＠DevOps

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. GitHub Actionsの仕組み

要勉強...

<br>

## 02. セットアップ

### インストール

```bash
project
├── .github/
│   └── workflows/
│       └── foo.yml
...
```

<br>

## 03. name

### nameとは

ワークフロー名を設定する．

```yaml
name: foo
```

<br>

## 04. on

### onとは

GitHub Actionsを発火させる条件を設定する．

<br>

### push

#### ▼ branch

プッシュを検知するブランチを設定する．ワイルドカードを使用できる．

```yaml
on:
  push:
    branches:
      - release/**
```

<br>

## 05. jobs

### jobsとは

ワークフローの具体的な処理を設定する．

<br>

### runs-on

GitHub Actionsの実行環境を設定する．

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
```

<br>

### steps

#### ▼ uses

用いるActionsを設定する．

参考：https://github.com/marketplace?category=&query=&type=actions&verification=

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
```

#### ▼ run

任意のコマンドを実行する．

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Git config
        run: |
          git config --local user.email "example@gmail.com"
          git config --local user.name "github-actions"
          git config pull.rebase false
```

#### ▼ with

Actionsに設定可能なパラメーターをわたす．

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 7.4
```

