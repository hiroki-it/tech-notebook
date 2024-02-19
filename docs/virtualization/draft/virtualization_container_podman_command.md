---
title: 【IT技術の知見】コマンド＠Podman
description: コマンド＠Dockerの知見を記録しています。
---

# コマンド＠Podman

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `podman`コマンド

### `podman`コマンドとは

基本的には`docker`コマンドと同じオプションで使用できる。

<br>

### machine

仮想マシンを作成する。

```bash
$ podman machine init
```

<br>

### start

仮想マシンを起動する。

```bash
$ podman machine start
```

<br>

### stop

仮想マシンを停止する。

```bash
$ podman machine stop
```

<br>

### ssh

仮想マシンに接続する。

```bash
$ podman machine ssh

Connecting to vm podman-machine-default. To close connection, use `~.` or `exit`
Fedora CoreOS 39.20240210.2.0
Tracker: https://github.com/coreos/fedora-coreos-tracker
Discuss: https://discussion.fedoraproject.org/tag/coreos

core@localhost:~$
```

<br>

## 02. `podman-compose`

### up

コンテナを起動する。

```bash
$ podman-compose up
```

<br>
