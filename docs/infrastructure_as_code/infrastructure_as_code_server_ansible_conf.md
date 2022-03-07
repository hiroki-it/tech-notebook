---
title: 【知見を記録するサイト】 設定ファイル＠Ansible
description: 設定ファイル＠Ansibleの知見をまとめました．
---

# 設定ファイル＠Ansible

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Ansibleの仕組み

コントロールノードと管理対象ノードから構成される．コントロールノードとしてのデプロイサーバーにはAnsibleがインストールされている．また，管理対象ノードとしてサーバーには実際のアプリケーションもデプロイされる．デプロイサーバー上のAnsibleは，管理対象ノードのサーバーにSSH接続を実行し，設定ファイルに基づいたプロビジョニングを実行する．設定ファイルの実装の変更によって，プロセスの再起動を伴うプロビジョニングが実行される場合，ダウンタイムを考慮する必要がある．

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

## 04. 設計ポリシー

### ディレクトリ構成

参考：

- https://docs.ansible.com/ansible/2.8/user_guide/playbooks_best_practices.html
- https://qiita.com/makaaso-tech/items/0375081c1600b312e8b0

```bash
project
├── playbook.yml
├── group_vars
│   └── foo_group.yml
│
├── host_vars
│   ├── bar_host.yml
│   └── baz_host.yml
│   
├── inventories
│   ├── prd # 本番環境
│   │   ├── hosts_a.yml # 冗長化されたサーバーa
│   │   ├── hosts_c.yml # 冗長化されたサーバーc
│   │   └── host_vars.yml
│   │
│   └── dev
│      
└── roles
    ├── app # appサーバー
    ├── common # 共通
    │   ├── handlers
    │   │   └── main.yml
    │   │   
    │   ├── tasks
    │   └── templates
    │    
    ├── db # DBサーバー
    └── web # Webサーバー
```

<br>

### 命名規則

参考：http://tdoc.info/blog/2014/10/09/ansible_coding.html

<br>

## 05. 設定ファイルの種類

### playbookファイル

#### ・playbookファイルとは

サーバーのセットアップ処理を設定する．実装の種類別に，```roles```ディレクトリに切り分けても良い．

参考：https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter8#%E3%83%97%E3%83%AC%E3%82%A4%E3%83%96%E3%83%83%E3%82%AF%E3%81%A8%E3%81%AF

**＊実装例＊**

appサーバー，dbサーバー，webサーバーをセットアップする．各コンポーネントは```roles```ディレクトリに切り分けている．

```yaml
# roleファイル
# appサーバー
- hosts:          app
  become:         yes
  force_handlers: true
  roles:
    - common/vim
    - app/php

# dbサーバー
- hosts:          db
  become:         yes
  force_handlers: true
  roles:
    - common/vim
    - db/mysql

# webサーバー
- hosts:          web
  become:         yes
  force_handlers: true
  roles:
    - common/vim
    - web/nginx
```

<br>

### ```roles```ディレクトリ

#### ・```roles```ディレクトリとは

特定の機能に関するタスクが設定されたファイルを配置する．```playbook.yml```ファイルを切り分けるために用いる．

参考：https://ansible-workbook.readthedocs.io/ja/latest/role/role.html

#### ・```task```ディレクトリ

playbookファイルから切り分けたセットアップ処理が設定されたtaskファイルを配置する．

**＊実装例＊**

PHP製のアプリケーションが稼働するappサーバーをセットアップする．

```yaml
# taskファイル
- name: Install software-properties-common
  ansible.builtin.apt:
    name:  software-properties-common
    state: present
 
- name: Install packages
  ansible.builtin.apt:
  pkg:
    - php
    - php-fpm
    - php-pdo
  state: present
  notify:
    - restart_php-fpm
    
- name: Upload php.ini
  ansible.builtin.template:
    src:  php.ini.j2
    dest: /etc/php.ini
  notify:
    - restart_php-fpm
    
- name: Upload www.conf
  ansible.builtin.template:
    src:  php-fpm/www.conf.j2
    dest: /etc/php-fpm.d/www.conf
  notify:
    - restart_php-fpm
    
- name: Setup composer
  ansible.builtin.shell: |
  
    # Composerのセットアップ処理
  
    # 〜 中略 〜
```

#### ・```templates```ディレクトリ

アップロードファイルの鋳型となる```j2```ファイルを配置する．鋳型に変数を出力できる．

**＊実装例＊**

```php.ini```ファイルの鋳型として，```php.ini.j2```ファイルを配置する．

```ini
; Start a new pool named 'www'.
; the variable $pool can we used in any directive and will be replaced by the
; pool name ('www' here)
[www]

# 〜 中略 〜
```

#### ・```handlers```ディレクトリ

taskファイルの後続処理が設定されたhandlerファイルを配置する．taskファイルの```notify```オプションで指定できる．

```yaml
# handlerファイル
- name: restart_php-fpm
  service:
    name:  php-fpm
    state: restarted
```

```yaml
# taskファイル
- name: Upload www.conf
  ansible.builtin.template:
    src:  php-fpm/www.conf.j2
    dest: /etc/php-fpm.d/www.conf
  notify:
    # handlerの名前を指定する．
    - restart_php-fpm
```

<br>

### ```group_vars```ディレクトリ

#### ・```group_vars```ディレクトリとは

複数の管理対象ノードで用いる変数に関するファイルを配置する．

#### ・group_varファイル

複数の管理対象ノードで用いる変数を設定する．

```yaml
# group_varファイル
env: prd
domain: example.com
```

<br>

### ```host_vars```ディレクトリ

#### ・```host_vars```ディレクトリとは

特定の管理対象ノードで用いる変数に関するファイルを配置する．

#### ・host_varファイル

特定の管理対象ノードで用いる変数を設定する．

<br>

### ```inventories```ディレクトリ

#### ・```inventories```ディレクトリとは

管理対象ノードが設定された```inventory```ファイルを配置する．

#### ・inventoryファイル

管理対象ノードを設定する．```ini```形式または```yml```形式で定義する．実行環境（本番/ステージング）別にファイルを切り分けると良い．また，サーバーを冗長化している場合は，これも別々に定義しておく．プロビジョニングの実行対象はロードバランサーから一時的に切り離すようにすることで，プロビジョニングに伴ってインシデントが起こっても，ユーザーへの影響を防ぐことができる．

参考：

- https://docs.ansible.com/ansible/2.9/user_guide/intro_inventory.html#inventoryformat
- https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter5

```yaml
# inventoryファイル
# 開発環境
- all:
    hosts:
      app:
        # サーバーのIPアドレス
        ansible_host: 127.0.0.1
        # ログインするためのユーザー名
        ansible_user: vagrant
        # ログインするためのパスワード
        ansible_password: vagrant
      web:
        ansible_host: 127.0.0.1
        ansible_user: vagrant
        ansible_password: vagrant
      db:
        ansible_host: 127.0.0.1
        ansible_user: vagrant
        ansible_password: vagrant 
```

```yaml
# inventoryファイル
# 本番環境
- all:
    children:
      # 冗長化サーバーa
      server_a:
        hosts:
          # appサーバー
          app:
            ansible_host: 192.168.111.101
            ansible_user: ubuntu
            ansible_password: ubuntu
            # SSH接続に用いる秘密鍵
            ansible_ssh_private_key_file: /etc/ssh_keys/prd-foo.pem
          # webサーバー
          web:
            ansible_host: 192.168.111.10
            ansible_user: ubuntu
            ansible_password: ubuntu
            ansible_ssh_private_key_file: /etc/ssh_keys/prd-foo.pem
      # 冗長化サーバーc
      server_c:
        hosts:
          # appサーバー
          app:
            ansible_host: 192.168.111.102
            ansible_user: ubuntu
            ansible_password: ubuntu
            ansible_ssh_private_key_file: /etc/ssh_keys/prd-foo.pem
          # webサーバー
          web:
            ansible_host: 192.168.111.11
            ansible_user: ubuntu
            ansible_password: ubuntu
            ansible_ssh_private_key_file: /etc/ssh_keys/prd-foo.pem
```

<br>

## 05. handlersセクション

### handlersセクションとは

taskセクションの後に実行するセットアップ処理を設定する．

<br>

## 05-02. targetsセクション

### targetsセクションとは

プレイの実行先のノードを設定する．必須である．

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

プレイの実行先のノードを設定する．

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
  - name: Install Nginx
    ansible.builtin.apt:
      name: nginx
      state: latest
```

<br>

### ansible.builtin.service

管理対象ノード上で```service```コマンドの実行を設定する．

参考：https://docs.ansible.com/ansible/2.9/modules/service_module.html

```yaml
- tasks:
  - name: Start nginx service
    ansible.builtin.service:
      name: Start nginx
      state: started
      enabled: yes
```

<br>

### ansible.builtin.shell

管理対象ノードでシェルを実行する．複数行に渡る場合は，『```|```』を用いる．

参考：

- https://docs.ansible.com/ansible/latest/collections/ansible/builtin/shell_module.html
- https://blog.ruanbekker.com/blog/2020/01/24/environment-variables-with-ansible/

```yaml
- task:
  - name: Echo foo
    ansible.builtin.shell: |
      echo foo
```

<br>

### ansible.builtin.template

管理対象ノード上に事前に用意したファイルを配置する．

```yaml
- tasks:
  - name: Upload nginx.conf
    ansible.builtin.template:
      src: nginx.conf.j2
      dest: /etc/nginx/nginx.conf
```

<br>

### ansible_env

管理対象ノードに設定された環境変数を出力する．```gather_facts```オプションを有効化する必要がある．

参考：

- https://docs.ansible.com/ansible/2.9/reference_appendices/faq.html#shell
- https://tekunabe.hatenablog.jp/entry/2019/03/09/ansible_env

**＊実装例＊**

管理対象ノードの環境変数の```FOO```を出力する．```gather_facts```オプションを有効化しておく．

```yaml
- gather_facts: yes
```
```yaml
- vars:
      foo: ansible_env.FOO
  tasks:
    - name: Upload foo.conf
      ansible.builtin.template:
        src: foo.conf.j2
        dest: /etc/foo/foo.conf
```

<br>

### environment

task内で出力できる環境変数を設定する．

参考：https://docs.ansible.com/ansible/2.9/user_guide/playbooks_environment.html

```yaml
- task:
  - name: Echo foo
    ansible.builtin.shell: |
      echo foo
      echo ${FOO}
    environment: 
      FOO: FOO
```

<br>

## 05-04. varsセクション

### varsセクションとは

プレイで用いる設定値を変数として設定する．設定した変数は，```ansible.builtin.template```オプションを用いて```j2```ファイルに出力できる．

参考：

- https://blog.katsubemakito.net/ansible/ansible-1st-4
- https://ksaito11.hatenablog.com/entry/2018/10/24/232929

**＊実装例＊**

```yaml
- vars:
    foo: foo
    bar: bar
  tasks:
    - name: Upload foo.conf
      ansible.builtin.template:
        src: foo.conf.j2
        dest: /etc/foo/foo.conf
```

```bash
# foo.conf.j2ファイル
{{ foo }}
```

<br>

## 06. プラグイン

### lookup

#### ・env

コントロールノードに設定された環境変数を出力する．

参考：

- https://docs.ansible.com/ansible/2.9/reference_appendices/faq.html#shell
- https://tekunabe.hatenablog.jp/entry/2019/03/09/ansible_env

**＊実装例＊**

コントロールノードの環境変数の```FOO```を出力する．

```yaml
- vars:
      foo: lookup("env", "FOO")
  tasks:
    - name: Upload foo.conf
      ansible.builtin.template:
        src: foo.conf.j2
        dest: /etc/foo/foo.conf
```

