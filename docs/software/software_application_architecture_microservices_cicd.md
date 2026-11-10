---
title: 【IT技術の知見】CI/CD＠マイクロサービスアーキテクチャ
description: CI/CD＠マイクロサービスアーキテクチャの知見を記録しています。
---

# CI/CD＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

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

GitHub Actions のタグ push 時に Updatecli を実行し、タグ名で Helm チャートリポジトリの yaml を更新する。

実行ステップでは、タグの場合のみ `IMAGE_TAG` にタグ名を設定する。

```yaml
- name: Update image tag
  if: github.ref_type == 'tag'
  env:
    IMAGE_TAG: ${{ github.ref_type == 'tag' && github.ref_name || '' }}
  run: updatecli apply --config updatecli.yaml
```

`updatecli.yaml` を以下のように設定する。

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
      command: echo "{{ env "IMAGE_TAG" }}"

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
        values.yamlのイメージタグを `{{ env "IMAGE_TAG" }}` に更新しました
      title: 'Update image tag to {{ env "IMAGE_TAG" }} on values.yaml'
```

> - [GitHub - updatecli/updatecli: A Declarative Update Policy Engine · GitHub](https://github.com/updatecli/updatecli)

<br>

## Helm チャートリポジトリ

Helm チャートリポジトリでは、マイクロサービスリポジトリの CI が作成したプルリクエストをマージし、CD ツール (例：ArgoCD) が更新後のチャートを Kubernetes Cluster にデプロイする。

<br>
