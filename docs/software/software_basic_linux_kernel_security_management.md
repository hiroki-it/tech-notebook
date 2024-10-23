---
title: 【IT技術の知見】セキュリティ＠基本ソフトウェア
description: セキュリティ＠基本ソフトウェアの知見を記録しています。
---

# セキュリティ＠基本ソフトウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## /etc/security

### limits

システムのリソース (プロセス数、ファイル数など) を制限する。

`/etc/systemd/limits.conf`ファイルとしても設定できる。

> - https://qiita.com/hot_study_man/items/24e2bb953d4dca539c75
> - https://kazuhira-r.hatenablog.com/entry/2021/12/02/161200

<br>

## 02. SELinux：Security Enhanced Linux

### SELinuxとは

Linuxにデフォルトで導入されているミドルウェアで、セキュリティを制御する。

<br>

### 設定

#### ▼ SELinuxの無効化

アプリケーションと他のソフトウェアの通信を遮断してしまうことがあるため、基本的には無効にしておく。

`(1)`

: SELinuxの状態を確認

```bash
$ getenforce

# 有効の場合
Enforcing
```

`(2)`

: `/etc/selinux/config`を修正する。

```ini
# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#     enforcing - SELinux security policy is enforced.
#     permissive - SELinux prints warnings instead of enforcing.
#     disabled - No SELinux policy is loaded.

# disabledに変更する。
SELINUX=disabled

# SELINUXTYPE= can take one of these three values:
#     targeted - Targeted processes are protected,
#     minimum - Modification of targeted policy. Only selected processes are protected.
#     mls - Multi Level Security protection.
SELINUXTYPE=targeted
```

`(3)`

: OSを再起動

OSを再起動しないと設定が反映されない。

<br>
