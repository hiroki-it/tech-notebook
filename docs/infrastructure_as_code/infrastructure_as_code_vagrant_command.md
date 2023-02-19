---
title: 【IT技術の知見】コマンド＠Vagrant
description: コマンド＠Vagrantの知見を記録しています。
---

# コマンド＠Vagrant

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. vagrantコマンド

### box add

ボックスをインストールする。

```bash
$ vagrant box add <ボックス名> <URL>
```

> ↪️ 参考：https://www.vagrantup.com/docs/cli/box#box-add


<br>

### box list

インストールできるボックス名の一覧を取得する。




```bash
$ vagrant box list
```

> ↪️ 参考：https://www.vagrantup.com/docs/cli/box#box-list


<br>

### global-status

起動中の仮想環境の一覧を取得する。


```bash
$ vagrant global-status
```

> ↪️ 参考：https://www.vagrantup.com/docs/cli/global-status


<br>

### halt

仮想環境を停止する。

```bash
$ vagrant halt
```

> ↪️ 参考：https://www.vagrantup.com/docs/cli/halt


<br>

### reload

仮想環境を再起動する。



```bash
$ vagrant reload
```

<br>

### ssh

仮想環境にSSH公開鍵認証で接続する。

```bash
$ vagrant ssh
```

> ↪️ 参考：https://www.vagrantup.com/docs/cli/ssh


<br>

### up

仮想環境を起動する。

```bash
$ vagrant up
```

> ↪️ 参考：https://www.vagrantup.com/docs/cli/up


<br>
