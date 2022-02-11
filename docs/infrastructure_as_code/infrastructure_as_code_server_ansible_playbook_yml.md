---
title: 【知見を記録するサイト】playbook.yml＠Ansible
description: playbook.yml＠Ansibleの知見をまとめました．
---

# playbook.yml＠Ansible

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Ansibleの仕組み

コントロールノードと管理対象ノードから構成される．コントロールノードにはAnsibleがインストールされている．このAnsibleは，管理対象ノードにSSH接続を実行し，設定ファイルに基づいたプロビジョニングを実行する．

参考：https://www.softek.co.jp/SID/support/ansible/guide/install-ansible-control-node.html

![ansible](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ansible.png)

<br>

## 02. セットアップ

### インストール

#### ・apt経由

参考：https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter4#ansible-%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

```bash
$ sudo apt -y install sshpass
$ sudo apt -y install python3-pip
$ pip3 install ansible
```

<br>

## 03. 設定ファイル，ディレクトリ

### ```playbook.yml```ファイル

サーバーのセットアップ処理を設定する．

参考：https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter8#%E3%83%97%E3%83%AC%E3%82%A4%E3%83%96%E3%83%83%E3%82%AF%E3%81%A8%E3%81%AF

<br>

### ```inventories```ディレクトリ

反映先のサーバー情報が設定されたファイルを配置する．

<br>

### ```roles```ディレクトリ

特定の機能に関するタスクのみを設定する．```playbook.yml```ファイルを切り分けるために用いる．

参考：https://ansible-workbook.readthedocs.io/ja/latest/role/role.html

<br>

### ```group_vars/*```ファイル

複数の仮想サーバーを構築するための設定ファイルを配置する．

<br>

### ```host_vars```ファイル

単一の仮想サーバーを構築するための設定ファイルを配置する．

<br>

## 04. handlersセクション

### handlersセクションとは

taskセクションの後に実行するセットアップ処理を設定する．

<br>

## 05. targetsセクション

### targetsセクションとは

プレイの実行対象を設定する．必須である．

参考：https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter8#targets-%E3%82%BB%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3

<br>

### name

#### ・nameとは

プレイの名前を設定する．

```yaml
- name: Setup nginx
```

<br>

### hosts

#### ・hostsとは

プレイの実行対象を設定する．

```yaml
- hosts: all
```

<br>

### become

#### ・becomeとは

プレイをroot権限で実行するかどうかを設定する．

```yaml
- become: yes
```

<br>

### gather_facts

#### ・gather_factsとは

ファクト変数を収集するかどうかを設定する．

```yaml
- gather_facts: no
```

<br>

## 06. tasksセクション

### tasksセクションとは

実行するセットアップ処理を手続き的に設定する．必須である．

参考：https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter8#tasks-%E3%82%BB%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3

<br>

### apt，yum

パッケージをインストールする．

```yaml
- tasks:
  - name: Install nginx
    apt:
      name: nginx
      state: latest
```

<br>

### service

Linuxのユーティリティである```service```コマンドの実行を設定する．

参考：https://docs.ansible.com/ansible/2.9_ja/modules/service_module.html

```yaml
- tasks:
  - service:
      name:    Start nginx
      state:   started
      enabled: yes
```

<br>

## 07. varsセクション

### varsセクションとは

プレイで用いる設定値を変数として設定する．

```yaml
vars:
  foo: foo
  bar: bar
```

