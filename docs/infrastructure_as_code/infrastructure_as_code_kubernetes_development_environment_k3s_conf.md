---
title: 【IT技術の知見】設定ファイル＠K3S
description: 設定ファイル＠K3Sの知見を記録しています。
---

# 設定ファイル＠K3S

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `registries.yaml`ファイル

### configs

#### ▼ configsとは

K3S Cluster内のPodが使用するイメージレジストリ情報を設定する。

`/etc/rancher/k3s`ディレクトリ配下に配置する。

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

> - https://docs.k3s.io/installation/private-registry#configs
> - https://qiita.com/ynott/items/29373eb7b23b029333dc

<br>
