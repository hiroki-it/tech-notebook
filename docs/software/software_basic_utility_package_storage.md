---
title: 【IT技術の知見】ストレージ系＠パッケージ
description: ストレージ系＠パッケージの知見を記録しています。
---

# ストレージ系＠パッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/index.html

<br>

## 01. pstree

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install pstree
```

```bash
$ apt-get install pstree
```

<br>

### pstreeとは

プロセスの親子関係をツリー状に取得する。

```bash
# MacOSの場合
$ pstree

-+= 00001 root /sbin/launchd
 |--= 00059 root /usr/sbin/syslogd
 |--= 00060 root /usr/libexec/UserEventAgent (System)
 |-+= 00062 root /Applications/ESET Endpoint Security.app/Contents/MacOS/esets_ctl
 | \-+= 00286 root /Applications/ESET Endpoint Security.app/Contents/MacOS/esets_daemon
 |   |--- 00323 root /Applications/ESET Endpoint Security.app/Contents/MacOS/esets_daemon --scan-process
 |   |--- 00455 root /Applications/ESET Endpoint Security.app/Contents/MacOS/esets_fcor
...
```

<br>
