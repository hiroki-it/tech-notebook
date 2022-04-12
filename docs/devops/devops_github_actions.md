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

<br>

## 06. runs

### composite

#### ▼ compositeとは

stepsを別のファイルに切り分けられる．ファイル名は，```action.yml```ファイルとする必要がある．

```bash
Error: Can't find 'action.yml', 'action.yaml' ...
```

#### ▼ 注意点

チェックアウト処理は定義できない．

```yaml
runs:
  using: "composite"
  steps:
    - name: Checkout # これはエラーになる．
      uses: actions/checkout@v2
    - name: Echo
      shell: bash # シェルの種類を設定する．
      run: |
        echo foo
```

また，```shell```オプションでシェルの種類を指定する必要がある．

参考：https://stackoverflow.com/questions/71041836/github-actions-required-property-is-missing-shell

```yaml
runs:
  using: "composite"
  steps:
    - name: Echo
      shell: bash # シェルの種類を設定する．
      run: |
        echo foo
```

<br>

## 07. 環境変数

### Projectレベル

リポジトリの設定でSecretに名前と値を登録する．プロジェクト内，すなわちリポジトリ内でのみ参照できる．

参考：https://btj0.com/blog/github/use-env/

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Echo
        run: |
          echo ${{ secrets.FOO }}
```

compositeでは使用できず，```input```オプションで環境変数を渡す必要がある．

参考：https://stackoverflow.com/questions/70098241/using-secrets-in-composite-actions-github

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Echo
        uses: ./.github/workflows/composite/echo
        with:
          foo: ${{ secrets.FOO }}
```

```yaml
inputs:
  foo:
    required: true
    
runs:
  using: "composite"
  steps:
    - name: Echo
      shell: bash
      run: |
        echo ${{ inputs.foo }}
```

