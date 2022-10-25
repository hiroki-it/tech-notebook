---
title: 【IT技術の知見】Linux標準＠セキュリティ系ミドルウェア
description: Linux標準＠セキュリティ系ミドルウェアの知見を記録しています。
---

# Linux標準＠セキュリティ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/index.html

<br>

## 01. SELinux：Security Enhanced Linux

### SELinuxとは

Linuxにデフォルトで導入されているミドルウェアで、セキュリティを制御する。

<br>

### SELinuxの無効化

アプリケーションと他のソフトウェアの通信を遮断してしまうことがあるため、基本的には無効にしておく。

（１）SELinuxの状態を確認

```bash
$ getenforce

# 有効の場合
Enforcing
```

（２）```/etc/sellnux/config```を修正する。

```bash
# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#     enforcing - SELinux security policy is enforced.
#     permissive - SELinux prints warnings instead of enforcing.
#     disabled - No SELinux policy is loaded.

SELINUX=disabled # <---- disabledに変更

# SELINUXTYPE= can take one of these three values:
#     targeted - Targeted processes are protected,
#     minimum - Modification of targeted policy. Only selected processes are protected. 
#     mls - Multi Level Security protection.
SELINUXTYPE=targeted
```

（３）OSを再起動

OSを再起動しないと設定が反映されない。

<br>
