---
title: 【IT技術の知見】tfnotify＠自動レビューツール
description: tfnotify＠自動レビューツールの知見を記録しています。
---

# tfnotify＠自動レビューツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. tfnotifyとは

`terraform`コマンドの処理結果を、レビューコメントとしてGitHubにPOSTで送信する。

URLや送信内容を設定ファイルで定義する。

CircleCIで利用する場合は、ダウンロードしたtfnotifyのバイナリファイルを実行する。

環境別にtfnotifyを配置しておくと良い。

> - https://github.com/mercari/tfnotify/releases/tag/v0.7.0

tfnotifyをより強化したtfcmtというツールがある。

> - https://github.com/suzuki-shunsuke/tfcmt

tfnotifyもtfcmtもGitHubのAPIにしか対応しておらず、GitLabの場合はtfcmt-gitlabを使用すると良い。

> - https://github.com/hirosassa/tfcmt-gitlab

<br>

## 02. コマンド

### --config

設定ファイルを使用して、tfnotifyを実行する。

**＊実装例＊**

```bash
#!/bin/bash

set -xeuo pipefail

terraform -chdir=./"${ENV}" plan \
  -out="${ENV}".tfplan \
  -parallelism=30 | ./ops/tfnotify --config ./"${ENV}"/tfnotify.yml plan
```

```bash
#!/bin/bash

set -xeuo pipefail

# credentialsの情報を出力します。
source ./aws_envs.sh

terraform -chdir=./"${ENV}" apply \
  -parallelism=30 \
  "${ENV}".tfplan | ./ops/tfnotify --config ./"${ENV}"/tfnotify.yml apply
```

<br>

## 03. `tfnotify.yml`ファイル

### ci

使用するCIツールを設定する。

```yaml
# https://github.com/mercari/tfnotify
---
ci: circleci
```

<br>

### notifier

リポジトリに通知をPOST送信できるように、認証情報を設定する。

```yaml
# https://github.com/mercari/tfnotify
---
notifier:
  github:
    # 環境変数に登録したパーソナルアクセストークン
    token: $GITHUB_TOKEN
    repository:
      # 宛先のユーザー名もしくは組織名
      owner: "foo-company"
      name: "foo-repository"
```

<br>

### terraform

通知内容を設定する。

```yaml
# https://github.com/mercari/tfnotify
---
terraform:
  plan:
    template: |
      {{ .Title }} for staging <sup>[CI link]( {{ .Link }} )</sup>
      {{ .Message }}
      {{ if .Result }}
      <pre><code> {{ .Result }}
      </pre></code>
      {{end}}
      <details><summary>Details (Click me)</summary>

      <pre><code> {{ .Body }}
      </pre></code></details>
  apply:
    template: |
      {{ .Title }}
      {{ .Message }}
      {{ if .Result }}
      <pre><code>{{ .Result }}
      </pre></code>
      {{end}}
      <details><summary>Details (Click me)</summary>

      <pre><code>{{ .Body }}
      </pre></code></details>
```

<br>
