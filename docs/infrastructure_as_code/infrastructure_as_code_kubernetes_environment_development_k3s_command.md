---
title: 【IT技術の知見】コマンド
description: K3Sの知見を記録しています。
tags:
  - "K8sアプリ"
  - "開発環境"
  - "K3S"
---

# コマンド

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. セットアップ

### バイナリの場合

```bash
$ curl -Lo /usr/local/bin/k3s https://github.com/k3s-io/k3s/releases/download/v1.28.0+k3s1/k3s
$ chmod a+x /usr/local/bin/k3s

$ k3s version
```

> - [Configuration Options \| K3s](https://docs.k3s.io/installation/configuration#configuration-with-binary)

<br>

### インストールスクリプトの場合

```bash
$ curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable-agent" K3S_KUBECONFIG_MODE="644" sh -
$ sudo chmod -R a+rw /etc/rancher/k3s
$ sudo mkdir -p $HOME/.kube && sudo chown -R runner $HOME/.kube
$ sudo k3s kubectl config view --raw > $HOME/.kube/config
$ sudo chown runner $HOME/.kube/config
$ sudo chmod go-r $HOME/.kube/config
```

> - [k3sを知る、動かす、感じる \| フューチャー技術ブログ](https://future-architect.github.io/articles/20200929/)
> - [Configuration Options \| K3s](https://docs.k3s.io/installation/configuration#configuration-with-install-script)

<br>

## 02. コマンド

### kubectl

K3S Cluster に `kubectl` コマンドを実行する。

```bash
$ k3s kubectl get pod
```

<br>

### server

K3S Cluster を作成する。

```bash
$ k3s server
```

> - [server \| K3s](https://docs.k3s.io/cli/server)

<br>
