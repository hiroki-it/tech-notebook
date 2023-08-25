---
title: 【IT技術の知見】K3S＠開発環境
description: K3S＠開発環境の知見を記録しています。
---

# K3S＠開発環境

## 01. セットアップ

```bash
$ curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable-agent" K3S_KUBECONFIG_MODE="644" sh -
$ sudo chmod -R a+rw /etc/rancher/k3s
$ sudo mkdir -p $HOME/.kube && sudo chown -R runner $HOME/.kube
$ sudo k3s kubectl config view --raw > $HOME/.kube/config
$ sudo chown runner $HOME/.kube/config
$ sudo chmod go-r $HOME/.kube/config
```

> - https://future-architect.github.io/articles/20200929/

<br>

## 02. コマンド

<br>
