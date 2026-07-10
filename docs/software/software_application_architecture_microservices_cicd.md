---
title: 【IT技術の知見】CI/CD＠マイクロサービスアーキテクチャ
description: CI/CD＠マイクロサービスアーキテクチャの知見を記録しています。
---

# CI/CD＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## マイクロサービスリポジトリ

### yq

マイクロサービスリポジトリの CI で `yq` コマンドを実行し、Helm チャートリポジトリの yaml を更新する。

```yaml
command: |
  wget https://github.com/mikefarah/yq/releases/download/v4.22.1/yq_linux_amd64
  sudo chmod +x /usr/local/bin/yq
  yq e -i '.image |="<コミットハッシュ値>"' ./values.yaml
```

<br>

### Updatecli

マイクロサービスリポジトリの CI で Updatecli を実行し、Helm チャートリポジトリの yaml を更新する。

```yaml
name: Update image tag on values.yaml

# 共通処理
scms:
  setup:
    kind: github
    spec:
      branch: main

# 変更内容の値
sources:
  imageTag:
    kind: shell
    spec:
      command: echo "{{ env "CI_COMMIT_TAG" }}"

# 変更対象
targets:
  helmValues:
    name: Update image tag on values.yaml
    kind: yaml
    scmid: setup
    spec:
      file: ./values.yaml
      key: $.image.tag
    sourceid: imageTag

# プルリクエストの内容
actions:
  default:
    kind: github/mergerequest
    scmid: setup
    spec:
      automerge: false
      description: |
        values.yamlのイメージタグを `{{ env "CI_COMMIT_TAG" }}` に更新しました
      title: "Update image tag to {{ env "CI_COMMIT_TAG" }} on values.yaml"
```

> - https://github.com/updatecli/updatecli

<br>

## Helmチャートリポジトリ

記入中...

<br>
