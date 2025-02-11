---
title: 【IT技術の知見】 Ansible Galaxy＠Ansible
description: Ansible Galaxy＠Ansibleの知見を記録しています。
---

# Ansible Galaxy＠Ansible

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Ansible Galaxyとは

`role`ディレクトリ配下をroleモジュールとして別リポジトリに切り分け、これをリモート参照する仕組みのこと。

> - https://knowledge.sakura.ad.jp/3118/

<br>

## 02. セットアップ

### 参照される側

#### ▼ roleモジュールのディレクトリ構成

`meta`ディレクトリ配下に、roleモジュールを宣言する設定ファイルを配置する。

```yaml
foo-role-module-repository/ # roleモジュール
├── defaults/
│   └── main.yml
│
├── files/
│   └── foo.conf
│
├── meta/
│   └── main.yml
│
└── tasks/
    ├── foo1.yaml
    ├── foo2.yaml
    └── foo3.yml
```

> - https://zaki-hmkc.hatenablog.com/entry/2021/08/19/193243

#### ▼ main.yml

`meta`ディレクトリ配下の`main.yml`ファイルで、roleモジュールであることを宣言する。

```yaml
galaxy_info:
  author: hiroki.hasegawa
  description: common role
  min_ansible_version: "1.0.0"
  galaxy_tags: []
dependencies: []
```

<br>

### 参照する側

#### ▼ ディレクトリ構成

`meta`ディレクトリ配下に、roleモジュールを宣言する設定ファイルを配置する。

```yaml
repository/
├── requirements.yml
└── playbook.yml
```

> - https://zaki-hmkc.hatenablog.com/entry/2021/08/19/193243

#### ▼ requirements.yml

リモート参照するroleモジュールのURLを設定する。

```yaml
- name: foo-role
  scm: git
  src: https://github.com/hiroki-hasegawa/foo-role-module-repository.git
  version: main

- name: bar-role
  scm: git
  src: https://github.com/hiroki-hasegawa/bar-role-module-repository.git
  version: main

- name: baz-role
  scm: git
  src: https://github.com/hiroki-hasegawa/baz-role-module-repository.git
  version: main
```

#### ▼ playbook.yml

`playbook.yml`ファイルでroleモジュール名を設定する。

```yaml
- hosts: all
  become: "true"
  roles:
    - foo
```

<br>

### コマンド

Ansibleのコントロールノードで`ansible-galaxy`コマンドを実行することにより、管理対象ノードの`~/.ansible/roles`ディレクトリ配下にroleモジュールをインストールする。

```bash
$ ansible-galaxy install <roleモジュール名>
```

> - https://note.com/shift_tech/n/n087a9db743d1

<br>
