---
title: 【IT技術の知見】設定ファイル＠K3S
description: 設定ファイル＠K3Sの知見を記録しています。
---

# 設定ファイル＠K3S

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. `registries.yaml` ファイル

### configs

#### ▼ configs とは

K3S Cluster 内の Pod が使用するイメージレジストリ情報を設定する。

`/etc/rancher/k3s` ディレクトリ配下に配置する。

```yaml
configs:
  "<AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com":
    auth:
      username: AWS
      password: <パスワード>
```

パスワードは以下のコマンドで取得する。

```bash
$ aws ecr get-login-password --region ap-northeast-1
```

> - [Private Registry Configuration \| K3s](https://docs.k3s.io/installation/private-registry#configs)
> - [k3sでプライベートレジストリー(Private Registry)を使う(containerd編) #private-registry - Qiita](https://qiita.com/ynott/items/29373eb7b23b029333dc)

<br>
