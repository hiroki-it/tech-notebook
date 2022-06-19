---
title: 【知見を記録するサイト】GitHub Actions＠DevOps
description: GitHub Actions＠DevOpsの知見をまとめました。
---

# GitHub Actions＠DevOps

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. GitHub Actionsの仕組み

構造に関する記載が見つからず、要勉強...

<br>

## 02. セットアップ

### インストール

```yaml
project
├── .github/
│   └── workflows/
│       └── foo.yml
...
```

<br>

## 03. name

### nameとは

ワークフロー名を設定する。

```yaml
name: foo
```

<br>

### push

#### ▼ branch

プッシュを検知するブランチを設定する。ワイルドカードを使用できる。

```yaml
on:
  push:
    branches:
      - release/**
```

<br>

## 04. jobs

### jobsとは

ワークフローの具体的な処理を設定する。

<br>

### runs-on

GitHub Actionsの実行環境を設定する。

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
```

#### ▼ インストール済みソフトウェア

使用するOSに応じて、いくつかの汎用的なソフトウェアがプリインストールされている。

参考：https://docs.github.com/ja/actions/using-github-hosted-runners/about-github-hosted-runners#preinstalled-software

<br>

### steps

#### ▼ uses

使用するActionsを設定する。

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

任意のコマンドを実行する。

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

Actionsに設定できるパラメーターをわたす。

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

環境変数を渡せないことに注意する。

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

## 05. runs

### composite

#### ▼ compositeとは

親ファイルの```steps```を別のファイルに切り分け、親ファイルでコールできる。```workflows```ディレクトリ以下に任意のサブディレクトリを用意し、そこに```action```ファイルを配置する。親ファイルでディレクトリを指定すると、```action```ファイルが自動的に読み込まれる。

```yaml
project
├── .github/
│   └── workflows/
│       ├── foo.yml
│       └── composite/
│           ├── bar/
│           │   └── action.yml
│           │
│           ├── baz/
│           │   └── action.yml
...        ...
```

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Echo
        # compositeのディレクトリを指定する。
        uses: ./.github/workflows/composite/bar
```

ファイル名は、『```action```』とする必要がある。

```bash
Error: Can't find 'action.yml', 'action.yaml' ...
```

#### ▼ Secretsは使用不可

compositeでは、Secretsを使用できない。そのため、```input```キーのパラメーターとして渡す必要がある。

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
        # パラメーターで渡す。
        with:
          foo: ${{ secrets.FOO }}
```

```yaml
inputs:
  foo:
    description: foo
    required: true
    
runs:
  using: "composite"
  steps:
    - name: Echo
      shell: bash
      run: |
        echo ${{ inputs.foo }}
```

<br>

#### ▼ Checkoutは使用不可

チェックアウト処理は定義できない。

```yaml
runs:
  using: "composite"
  steps:
    - name: Checkout # これはエラーになる。
      uses: actions/checkout@v2
    - name: Echo
      shell: bash # シェルの種類を設定する。
      run: |
        echo foo
```

#### ▼ シェルの種類を要指定

もし```steps```を定義する場合は、```shell```キーでシェルの種類を指定する必要がある。

参考：https://stackoverflow.com/questions/71041836/github-actions-required-property-is-missing-shell

```yaml
runs:
  using: "composite"
  steps:
    - name: Echo
      shell: bash # シェルの種類を設定する。
      run: |
        echo foo
```

<br>

## 06. 環境変数

### Workflowレベル

#### ▼ Workflowレベルとは

定義された```workflow```（YAMLファイル）内でのみ参照できる。

#### ▼ env

環境変数を定義する。Secretの値を設定できない。

参考：https://docs.github.com/en/actions/learn-github-actions/environment-variables#about-environment-variables

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

#### ▼ Jobsレベルとは

定義された```jobs```キー内でのみ参照できる。

#### ▼ env

参考：https://docs.github.com/en/actions/learn-github-actions/environment-variables#about-environment-variables

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    env:
      FOO: foo
    steps:
      - name: Echo
        run: |
          echo ${{ env.FOO }}
```

#### ▼ 環境ファイル

環境ファイル（```GITHUB_ENV```）に値を入力することにより、```job```内の環境変数として使用できるようになる。

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
          echo $FOO
```

なお、マスキングされた値は入力できないことに注意する。

<br>

### Stepレベル

#### ▼ Stepレベルとは

定義された```step```キー内でのみ参照できる。

#### ▼ env

参考：https://docs.github.com/en/actions/learn-github-actions/environment-variables#about-environment-variables

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Echo
        env:
          FOO: foo
        run: |
          echo ${{ env.FOO }}
```

<br>

## 06-02. Secret変数

### Secret変数とは

環境変数と同様にしてGitHub Actions内で使用できる。また、```add-mask```コマンドと同様のマスキングが最初から実行されている。

<br>

### マスキング

#### ▼ スコープ

以降の全ての処理でマスキングが実行される。もちろん、```inputs```キーで渡した値にもマスキングが維持される。

参考：https://zenn.dev/kinjosan/articles/bd82e07aa69080

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Echo
        uses: ./.github/workflows/composite/foo
        with:
          bar: ${{ secrets.FOO }}
```

```yaml
inputs:
  bar:
    required: true
    
runs:
  using: "composite"
  steps:
    - name: Echo
      shell: bash
      run: |
        FOO=${{ inputs.bar }}
```

これに関しては以前は非対応であったため、```add-mask```コマンドを使用した方法がネット上で見つかることに注意する。

参考：

- https://qiita.com/nogic1008/items/6934b1b6d6e0cf7912d1
- https://github.com/actions/runner/issues/643#issuecomment-708228940
- https://github.com/actions/runner/issues/475#issuecomment-1092734499

#### ▼ 注意点

注意点として、マスキングされる値と同じ文字列が使用されると、これもマスキングされる。そのため、例えば```input```キーでマスキングされた値と同じ文字列を使用してしまうと、YAMLファイルの構文解析でエラーになってしまう。

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Echo
        uses: ./.github/workflows/composite/foo
        with:
          foo: ${{ secrets.FOO }}
```

```yaml
inputs:
  foo: # マスキングされ、YAMLファイルの構文解析でエラーになる
    required: true
    
runs:
  using: "composite"
  steps:
    - name: Echo
      shell: bash
      run: |
        FOO=${{ inputs.foo }}
```

<br>

### Projectレベル（Repository Secrets）

#### ▼ Projectレベルとは

リポジトリの設定のSecrets項目に変数名と値を登録する。プロジェクト内、すなわちリポジトリ内で参照できる。出力された変数の値は、以降の処理でマスキングされる。

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

### Actionレベル（Environment Secrets）

#### ▼ Actionレベルとは

リポジトリの設定のEnvironment項目に変数名と値を登録する。GitHub Actionsでのみ参照できる。出力された変数の値は、以降の処理でマスキングされる。Projectレベルとは異なり、```env```キーに明示的に環境変数を渡す必要がある。

参考：

- https://btj0.com/blog/github/use-env/
- https://stackoverflow.com/questions/67972124/github-return-empty-string-as-secrets-while-running-actions

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    env: 
      FOO: foo
    steps:
      - name: Echo
        run: |
          echo ${{ secrets.FOO }}
```

<br>

## 07. Actions

### actionsパッケージ

#### ▼ checkout

プロジェクトをクローンする。

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
```

#### ▼ upload-artifact、download-artifact

異なる```jobs```の間でファイルを共有する。

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
          name: artifact # 展開するアーティファクトを設定する。
```

<br>

## 08. ワークフローコマンド

### add-mask

#### ▼ add-maskとは

変数の値をマスキングする。以降、ログに出力される場合は、『```***```』のようにアスタリスクで表示される。

参考：https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#masking-a-value-in-log

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Echo
        run: |
          FOO=foo
          echo "::add-mask::$FOO"
          echo $FOO
```

<br>

### set-output

#### ▼ set-outputとは

GitHub Actionsの独自パラメーターを入力する。

参考：https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Set output
        id: foo_id
        run: |
          echo "::set-output name=FOO::foo"
```

#### ▼ 同じstep内では使用不可

同じ```step```内で、パラメーターの入力と出力を行っても、値は空になる。

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Set output
        id: foo_id
        run: |
          echo "::set-output name=FOO::foo"
          echo ${{ steps.foo_id.outputs.FOO }}
```

#### ▼ 異なるstep間での共有

入力したパラメーターは、異なる```step```の間で出力できる。

参考：https://stackoverflow.com/questions/57819539/github-actions-how-to-share-a-calculated-value-between-job-steps

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Set output
        id: foo_id
        run: |
          echo "::set-output name=FOO::foo"
      - name: Echo
        run: |
          echo "${{ steps.foo_id.outputs.FOO }}"         
```

Secretsや```add-mask```コマンドでマスキングされた値も共有でき、またマスキングを維持できる。

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Set output
        id: foo_id
        run: |
          FOO=foo
          echo "::add-mask::$FOO"
          echo "::set-output name=FOO::$FOO"
      - name: Echo
        # 共有可能。マスキング維持可能。
        run: |
          echo "${{ steps.foo_id.outputs.FOO }}"         
```

#### ▼ 異なるjob間での共有

入力したパラメーターは、異なる```job```の間で出力できる。先に実行される```job```キーの```output```キーに入力する必要がある。

参考：

- https://docs.github.com/en/actions/using-jobs/defining-outputs-for-jobs
- https://swfz.hatenablog.com/entry/2020/04/18/160235

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Set output
        id: foo_id
        run: |
          echo "::set-output name=FOO::foo"
    # 後続のjobに渡すパラメーター
    output:
        FOO: ${{ steps.foo_id.outputs.FOO }}
  bar:
    runs-on: ubuntu-latest
    needs: foo
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Echo
        run: |
          echo "${{ needs.foo.outputs.FOO }}"         
```

ただし異なる```job```では、Secretsや```add-mask```コマンドでマスキングされた値は共有できず、空になってしまう。

```yaml
jobs:
  foo:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Set output
        id: foo_id
        run: |
          FOO=foo
          echo "::add-mask::$FOO"
          echo "::set-output name=FOO::$FOO"
    output:
        FOO: ${{ steps.foo_id.outputs.FOO }}
  bar:
    runs-on: ubuntu-latest
    needs: foo
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      # 空になってしまう。
      - name: Echo
        run: |
          echo "${{ needs.foo.outputs.FOO }}"         
```

<br>
