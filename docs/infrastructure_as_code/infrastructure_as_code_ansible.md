---
title: 【IT技術の知見】 Ansible＠IaC
description: Ansible＠IaCの知見を記録しています。
---

# Ansible

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Ansibleの仕組み

Ansibleは、コントロールノード (デプロイサーバー) と管理対象ノード (デプロイ先サーバー) から構成される。

コントロールノードと管理対象ノードに当たるサーバー (例：物理サーバー、仮想サーバー) をセットアップしておき、コントロールノードにAnsibleをインストールする。

もし、ローカルマシンでansibleコマンドを実行する場合は、ローカルマシンがコントロールノードに相当する。

また、管理対象ノードとしてサーバーには実際のアプリケーションもデプロイされる。

コントロールノード上のAnsibleは、管理対象ノードのサーバーにSSH公開鍵認証を実行し、設定ファイルに基づいたプロビジョニングを実行する。

設定ファイルの実装の変更によって、プロセスの再起動を伴うプロビジョニングが実行される場合、ダウンタイムを考慮する必要がある。

![ansible](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ansible.png)

> ↪️：https://www.softek.co.jp/SID/support/ansible/guide/install-ansible-control-node.html

<br>

## 02. セットアップ

### インストール

#### ▼ aptリポジトリから

```bash
$ sudo apt -y install sshpass
$ sudo apt -y install python3-pip
$ pip3 install ansible
```

> ↪️：https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter4#ansible-%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

<br>

## 03. 設計ポリシー

### ディレクトリ構成ポリシー

#### ▼ `group_vars`ディレクトリの構成

```yaml
repository/
├── playbook.yml
├── group_vars/
│   ├── tes/ # テスト環境
│   │   └── foo.yml
│   │
│   ├── stg/ # ステージング環境
│   └── prd/ # 本番環境
│
...
```

> ↪️：
>
> - https://docs.ansible.com/ansible/2.8/user_guide/playbooks_best_practices.html#alternative-directory-layout
> - https://qiita.com/makaaso-tech/items/0375081c1600b312e8b0
> - https://thinkit.co.jp/article/9871

#### ▼ `host_vars`ディレクトリの構成

```yaml
repository/
├── playbook.yml
├── host_vars/
│   ├── bar_host.yml
│   └── baz_host.yml
│
```

> ↪️：
>
> - https://docs.ansible.com/ansible/2.8/user_guide/playbooks_best_practices.html#alternative-directory-layout
> - https://qiita.com/makaaso-tech/items/0375081c1600b312e8b0
> - https://thinkit.co.jp/article/9871

#### ▼ `inventories`ディレクトリの構成

```yaml
repository/
├── playbook.yml
├── inventories/
│   ├── tes/ # テスト環境
│   │   ├── hosts_a.yml # 冗長化されたサーバーa
│   │   ├── hosts_c.yml # 冗長化されたサーバーc
│   │   └── host_vars.yml
│   │
│   ├── stg/ # ステージング環境
│   └── prd/ # 本番環境
│
...
```

> ↪️：https://docs.ansible.com/ansible/2.8/user_guide/playbooks_best_practices.html#alternative-directory-layout

#### ▼ `roles`ディレクトリの構成

```yaml
repository/
├── playbook.yml
├── roles/
│   ├── app/ # appサーバー
│   │   ├── defaults/ # rolesディレクトリ内で使用するデフォルト変数を配置する。
│   │   │   └── foo.yml
│   │   │
│   │   ├── files/ # 管理対象ノードにコピーするファイルを配置する。
│   │   │   └── foo.conf
│   │   │
│   │   ├── handlers/
│   │   │   └── main.yml
│   │   │
│   │   ├── meta/
│   │   │   └── main.yml
│   │   │
│   │   ├── tasks/ # プロビジョニング時に実行するコマンドを配置する。
│   │   │   └── main.yml
│   │   │
│   │   ├── templates/ # テンプレートを配置する。
│   │   │   └── foo.conf.j2
│   │   │
│   │   └── vars/ # rolesディレクトリ内で使用する上書き変数を配置する。
│   │       └── main.yml
│   │
│   ├── shared/ # 共通
│   ├── db/ # dbサーバー
│   └── web/ # webサーバー
│
...
```

> ↪️：https://docs.ansible.com/ansible/latest/user_guide/playbooks_reuse_roles.html#role-directory-structure

<br>

### 命名規則

> ↪️：http://tdoc.info/blog/2014/10/09/ansible_coding.html

<br>

## 04. 連携

### Vault

Ansibleの設定値を暗号化し、キーバリュー型ストアとして管理する。

Ansibleの実行時にパスワードを要求し、これが正しければ復号化し、設定値として出力する。

パスワード自体をファイル上でバージョン管理したい場合、暗号化ツール (例：SOPS) で暗号化することもできる。

![ansible_ansible-vault](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ansible_ansible-vault.png)

> ↪️：https://redj.hatenablog.com/entry/2020/05/02/044527

<br>
