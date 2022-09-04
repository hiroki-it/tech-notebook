---
title: 【IT技術の知見】コマンド＠Vagrant
description: コマンド＠Vagrantの知見を記録しています。
---

# コマンド＠Vagrant

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. vagrantコマンド

### box add

ボックスをインストールする。

> ℹ️ 参考：https://www.vagrantup.com/docs/cli/box#box-add

```bash
$ vagrant box add <ボックス名> <URL>
```

<br>

### box list

インストールできるボックス名の一覧を取得する。

> ℹ️ 参考：https://www.vagrantup.com/docs/cli/box#box-list

```bash
$ vagrant box list
```

<br>

### global-status

起動中の仮想環境の一覧を取得する。

> ℹ️ 参考：https://www.vagrantup.com/docs/cli/global-status

```bash
$ vagrant global-status
```

<br>

### halt

仮想環境を停止する。

> ℹ️ 参考：https://www.vagrantup.com/docs/cli/halt

```bash
$ vagrant halt
```

<br>

### reload

仮想環境を再起動する。

```bash
$ vagrant reload
```

<br>

### ssh

仮想環境にSSH接続を行う。

> ℹ️ 参考：https://www.vagrantup.com/docs/cli/ssh

```bash
$ vagrant ssh
```

<br>

### up

仮想環境を起動する。

> ℹ️ 参考：https://www.vagrantup.com/docs/cli/up

```bash
$ vagrant up
```

<br>
