---
title: 【IT技術の知見】コマンド＠Lima
description: コマンド＠Limaの知見を記録しています。
---

# コマンド＠Lima

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. limactl

### delete

```bash
$ limactl delete foo-instance
```

<br>

### start template

テンプレートを指定して、仮想サーバーを起動すう。

```bash
$ limactl start template://ubuntu-24.10 \
    --name=ubuntu2410 \
    --cpu 4 \
    --memory 8G \
    --disk 30G
```

> - [Templates \| Lima](https://lima-vm.io/docs/templates/)

<br>

### stop

```bash
$ limactl stop foo-instance
```

<br>
