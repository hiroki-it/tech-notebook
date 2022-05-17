---
title: 【知見を記録するサイト】コマンド＠Ansible
description: コマンド＠Ansibleの知見をまとめました。
---

# コマンド＠Ansible

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ansibleコマンド

<br>

## 02. ansible-playbookコマンド

### -i

inventoryファイルを指定する。これにより、プロビジョニングの実行先の管理対象ノードが決まる。

```bash
$ ansible-playbook <playbookファイル> -i <inventoryファイル>
```

<br>
