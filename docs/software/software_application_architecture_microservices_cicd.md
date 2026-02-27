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

CIで、`yq` コマンドを使用してHelmチャートリポジトリのyamlを更新する。

```yaml
command: |
  wget https://github.com/mikefarah/yq/releases/download/v4.22.1/yq_linux_amd64
  sudo chmod +x /usr/local/bin/yq
  yq e -i '.image |="<コミットハッシュ値>"' ./values.yaml
```

<br>

### updatecli

```yaml
name: Update Helm values image with commit hash

scms:
  default:
    kind: git
    spec:
      branch: main

sources:
  commitHash:
    name: Commit hash
    kind: shell
    spec:
      command: git rev-parse --short HEAD

targets:
  ValuesImage:
    name: Update values.yaml
    kind: yaml
    spec:
      file: ./values.yaml
      key: image
    sourceid: commitHash
```

> - https://github.com/updatecli/updatecli

<br>

## Helmチャートリポジトリ

記入中...

<br>
