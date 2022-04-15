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

#### ▼ インストール済みソフトウェア

用いるOSに応じて，いくつかの汎用的なソフトウェアがすでにインストールされている．

参考：https://docs.github.com/ja/actions/using-github-hosted-runners/about-github-hosted-runners#preinstalled-software

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
          # これはエラーになる
          # php-version: $PHP_VERSION
```

環境変数を渡すことはできないことに注意する．

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          # これはエラーになる
          php-version: $PHP_VERSION
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

### Projectレベル（Repository）

#### ▼ Projectレベルとは

リポジトリの設定のSecret項目に変数名と値を登録する．プロジェクト内，すなわちリポジトリ内で参照できる．

参考：https://stackoverflow.com/questions/65957197/difference-between-githubs-environment-and-repository-secrets

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Echo
        run: |
          echo ${{ secrets.FOO }}
```

<br>

### Actionレベル（Environment）

#### ▼ Actionレベルとは

リポジトリの設定のEnvironment項目に変数名と値を登録する．GitHub Actionsでのみ参照できる．出力された変数はログでマスキングされる．Projectレベルとは異なり，```env```オプションに明示的に環境変数を渡す必要がある．

参考：

- https://btj0.com/blog/github/use-env/
- https://stackoverflow.com/questions/67972124/github-return-empty-string-as-secrets-while-running-actions

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    environment: FOO
    steps:
      - name: Echo
        run: |
          echo ${{ secrets.FOO }}
```

#### ▼ composite上での扱い

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

なお，```inputs```オプションで渡した値はログに表示されてしまうため，```echo```コマンドを用いる場合は，```::add-mask::```オプションを変数の前で宣言する．これにより，以降の処理で変数の値はマスキングされる．```inputs```オプションを直接マスキングすることは2022/04現在は非対応である．

参考：

- https://qiita.com/nogic1008/items/6934b1b6d6e0cf7912d1
- https://github.com/actions/runner/issues/643#issuecomment-708228940
- https://github.com/actions/runner/issues/475#issuecomment-1092734499

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
        FOO=$(jq -r '.inputs.foo' $GITHUB_EVENT_PATH)
        echo "::add-mask::$FOO"
```

<br>

### Workflowレベル

定義されたYAMLファイル内でのみ参照できる．

```yaml
env:
  FOO: foo
  BAR: bar

jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Echo
        run: |
          echo ${{ env.FOO }}
```

<br>

### Jobsレベル

定義された```jobs```キー内でのみ参照できる．

参考：https://docs.github.com/ja/actions/using-workflows/workflow-commands-for-github-actions#setting-an-environment-variable

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Export envs
        run: |
          echo "FOO=foo" >> $GITHUB_ENV
      - name: Echo
        run: |
          echo "${{ env.FOO }}"
```

<br>

## 08. Actions

### actionsパッケージ

#### ▼ checkout

プロジェクトをクローンする．

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
```

#### ▼ upload-artifact，download-artifact

異なる```jobs```の間でファイルを共有する．

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Upload artifact
        uses: actions/upload-artifact@v2
        with:
          name: artifact
          path: ./foo
  bar:
    needs: bar
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Download artifact
        uses: actions/download-artifact@v2
        with:
          name: artifact # 展開するアーティファクトを設定する．
```

<br>
