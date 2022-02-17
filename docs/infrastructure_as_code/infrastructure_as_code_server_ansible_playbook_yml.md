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

## 03. 設計ポリシー

参考：http://tdoc.info/blog/2014/10/09/ansible_coding.html

<br>

## 04. 設定ファイル，ディレクトリの種類

### ```playbook.yml```ファイル

サーバーのセットアップ処理を設定する．

参考：https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter8#%E3%83%97%E3%83%AC%E3%82%A4%E3%83%96%E3%83%83%E3%82%AF%E3%81%A8%E3%81%AF

<br>

### ```group_vars```ディレクトリ

管理対象ノードが複数ある場合に，この設定ファイルを配置する．

<br>

### ```host_vars```ディレクトリ

管理対象ノードが1つだけの場合に，この設定ファイルを配置する．

<br>

### ```inventories```ディレクトリ

#### ・```inventories```ディレクトリとは

管理対象ノードが設定された```inventory```ファイルを配置する．

#### ・```inventory```ファイル

参考：https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter5

```yaml
- all:
    hosts:
      app:
        ansible_host: 192.168.111.101
        ansible_user: vagrant
        ansible_password: vagrant
      db:
        ansible_host: 192.168.111.102
        ansible_user: vagrant
        ansible_password: vagrant
      web:
        ansible_host: 192.168.111.103
        ansible_user: vagrant
        ansible_password: vagrant
```

<br>

### ```roles```ディレクトリ

特定の機能に関するタスクが設定された```role```ファイルを配置する．```playbook.yml```ファイルを切り分けるために用いる．

参考：https://ansible-workbook.readthedocs.io/ja/latest/role/role.html

<br>

## 05. handlersセクション

### handlersセクションとは

taskセクションの後に実行するセットアップ処理を設定する．

<br>

## 05-02. targetsセクション

### targetsセクションとは

プレイの実行対象のノードを設定する．必須である．

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

プレイの実行対象のノードを設定する．

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

## 05-03. tasksセクション

### tasksセクションとは

管理対象ノード上で実行するセットアップ処理を手続き的に設定する．必須である．

参考：https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter8#tasks-%E3%82%BB%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3

<br>

### ansible.builtin.apt，ansible.builtin.yum

管理対象ノード上にパッケージをインストールする．

```yaml
- tasks:
  - name: Install nginx
    ansible.builtin.apt:
      name: nginx
      state: latest
```

<br>

### ansible.builtin.service

管理対象ノード上で```service```コマンドの実行を設定する．

参考：https://docs.ansible.com/ansible/2.9_ja/modules/service_module.html

```yaml
- tasks:
  - ansible.builtin.service:
      name: Start nginx
      state: started
      enabled: yes
```

<br>

### ansible.builtin.template

管理対象ノード上に事前に用意したファイルを配置する．

```yaml
- ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
```

<br>

## 05-04. varsセクション

### varsセクションとは

プレイで用いる設定値を変数として設定する．

```yaml
- vars:
    foo: foo
    bar: bar
```

