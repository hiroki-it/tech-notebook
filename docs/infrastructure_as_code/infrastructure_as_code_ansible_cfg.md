---
title: 【IT技術の知見】 ansible.cfg＠Ansible
description: ansible.cfg＠Ansibleの知見を記録しています。
---

# ansible.cfg＠Ansible

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/index.html

<br>

## 01. ```ansible.cfg```ファイル

Ansible自体を設定する。代わりに、環境変数を使用しても良い。

> ℹ️ 参考：
> 
> - http://yamada.daiji.ro/blog/?p=618
> - https://docs.ansible.com/ansible/2.9_ja/reference_appendices/general_precedence.html#id2

<br>

## 02. defaultsセクション

### hostfile

#### ▼ hostfileとは

inventoryファイルの場所を指定する

> ℹ️ 参考：https://qiita.com/_croissant_/items/33f06298d7d05bf1e295#defaults%E3%82%BB%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3

```ini
[defaults]
hostfile = /etc/ansible/inventories
```

<br>

### remote_user

#### ▼ remote_userとは

タスクの実行ユーザーを設定する。

> ℹ️ 参考：https://qiita.com/_croissant_/items/33f06298d7d05bf1e295#defaults%E3%82%BB%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3

```ini
[defaults]
remote_user = ansible
```

<br>

### private_key_file

#### ▼ private_key_fileとは

管理対象ノードへのSSH接続に使用する秘密鍵を設定する。

> ℹ️ 参考：https://qiita.com/_croissant_/items/33f06298d7d05bf1e295#defaults%E3%82%BB%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3

```ini
[defaults]
private_key_file = /etc/ansible/ssh_keys/prd-foo.pem
```

<br>

### host_key_checking

#### ▼ host_key_checkingとは

管理対象ノードに関するフィンガープリント値が作成されているか否かを検証する。

> ℹ️ 参考：
> 
> - https://docs.ansible.com/ansible/latest/reference_appendices/config.html#host-key-checking
> - https://tekunabe.hatenablog.jp/entry/2021/01/17/ansible_stumble_26

```ini
[defaults]
host_key_checking = False
```

<br>

## 03. inventory

### host_pattern_mismatch

#### ▼ host_pattern_mismatchとは

管理対象ノードがinventoryファイルに見つからない場合の返却値を設定する。

> ℹ️ 参考：
> 
> - https://docs.ansible.com/ansible/latest/reference_appendices/config.html#host-pattern-mismatch
> - https://zenn.dev/akira6592/scraps/24a748660fdea4

```ini
[defaults]
host_pattern_mismatch = error
```

<br>
