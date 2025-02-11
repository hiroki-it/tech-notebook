---
title: 【IT技術の知見】コマンド＠Packer
description: コマンド＠Packerの知見を記録しています。
---

# コマンド＠Packer

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. packer

### build

```bash
$ packer build template.pkr.hcl
```

> - https://developer.hashicorp.com/packer/docs/commands/build

<br>

### fmt

```bash
$ packer fmt -recursive
```

> - https://developer.hashicorp.com/packer/docs/commands/fmt

<br>

### init

```bash
$ packer init template.pkr.hcl
```

> - https://developer.hashicorp.com/packer/docs/commands/init

<br>

### validate

```bash
$ packer validate template.pkr.hcl
```

> - https://developer.hashicorp.com/packer/docs/commands/validate

<br>
