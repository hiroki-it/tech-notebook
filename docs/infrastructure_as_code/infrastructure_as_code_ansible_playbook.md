---
title: 【IT技術の知見】 Playbook＠Ansible
description: Playbook＠Ansibleの知見を記録しています。
---

# Playbook＠Ansible

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. playbookファイル

### playbookファイルとは

サーバーのセットアップ処理を設定する。

処理を`roles`ディレクトリに切り分けても良い。

切り分ける場合、`roles`ディレクトリを作業ディレクトリとし、相対パスでファイルを指定することになる。

**＊実装例＊**

Appサーバー、DBサーバー、Webサーバーをセットアップする。

各コンポーネントは`roles`ディレクトリに切り分けている。

```yaml
# roleファイル
# Appサーバー
- hosts: app
  become: yes
  force_handlers: "true"
  # rolesディレクトリ以下に処理を切り分ける。上から順にrolesを実行する。
  roles:
    - shared
    - app

# DBサーバー
- hosts: db
  become: yes
  force_handlers: "true"
  roles:
    - shared
    - db

# Webサーバー
- hosts: web
  become: yes
  force_handlers: "true"
  roles:
    - shared
    - web
```

```yaml
repository/
├── playbook.yml
├── roles/
│   ├── shared/
│   │   └── tasks/
│   │       └── main.yml
│   │
│   ├── app/
│   │   └── tasks/
│   │       └── main.yml
│   │
│   ├── db/
│   │   └── tasks/
│   │       └── main.yml
│   │
│   └── web/
│       └── tasks/
│           └── main.yml
│
```

> - https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter8#%E3%83%97%E3%83%AC%E3%82%A4%E3%83%96%E3%83%83%E3%82%AF%E3%81%A8%E3%81%AF

<br>

## 01-02. playbookファイルの切り分け

### rolesディレクトリ

#### ▼ rolesディレクトリとは

特定の機能に関するタスクが設定されたファイルを配置する。

`playbook.yml`ファイルを切り分けるために使用する。

> - https://ansible-workbook.readthedocs.io/ja/latest/role/role.html

#### ▼ handlersディレクトリ

taskファイルの後続処理が設定されたhandlerファイルを配置する。

taskファイルの`notify`オプションで指定できる。

```yaml
# handlerファイル
- name: Restart php-fpm
  service:
    name: php-fpm
    state: restarted
```

```yaml
# taskファイル
- name: Upload www.conf
  ansible.builtin.template:
    src: php-fpm/www.conf.j2
    dest: /etc/php-fpm.d/www.conf
  notify:
    # handlerの名前を指定する。
    - restart_php-fpm
```

#### ▼ taskディレクトリ

playbookファイルから切り分けたセットアップ処理が設定されたtaskファイルを配置する。

**＊実装例＊**

PHP製のアプリケーションが稼働するAppサーバーをセットアップする。

```yaml
# taskファイル
- name: Install software-properties-common
  ansible.builtin.apt:
    name: software-properties-common
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
    src: php.ini.j2
    dest: /etc/php.ini
  notify:
    - restart_php-fpm

- name: Upload www.conf
  ansible.builtin.template:
    src: php-fpm/www.conf.j2
    dest: /etc/php-fpm.d/www.conf
  notify:
    - restart_php-fpm

- name: Setup composer
  ansible.builtin.shell: |

    # Composerのセットアップ処理

    ...
```

#### ▼ templateディレクトリ

アップロードファイルの鋳型となる`j2`ファイルを配置する。

鋳型に変数を出力できる。

**＊実装例＊**

`php.ini`ファイルの鋳型として、`php.ini.j2`ファイルを配置する。

```ini
; Start a new pool named 'www'.
; the variable $pool can we used in any directive and will be replaced by the
; pool name ('www' here)
[www]

...
```

<br>

### group_varsディレクトリ

#### ▼ group_varsディレクトリとは

複数の管理対象ノードで使用する変数に関するファイルやディレクトリを配置する。

`inventories`ディレクトリと同じ階層に配置し、加えて`inventory`ファイルで設定したグループ名やホスト名と同じ名前にする必要がある。

自動的に読み込まれ、`playbook`ファイルや`inventory`ファイルで出力できる。

> - https://qiita.com/WisteriaWave/items/0e5dda7ddc13b22188c7#215-%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97%E5%A4%89%E6%95%B0%E3%83%9B%E3%82%B9%E3%83%88%E5%A4%89%E6%95%B0%E3%81%AE%E5%A4%96%E5%87%BA%E3%81%97

#### ▼ group_varファイル

複数の管理対象ノードで使用する変数を設定する。

```yaml
# group_varファイル
env: prd
domain: example.com
ip_addresses:
  - 192.168.0.1
  - 192.168.0.2
  - 192.168.0.3
ports:
  - 22/tcp
  - 80/tcp
  - 443/tcp
```

ポート番号のリストを`playbook`ファイルで出力する

> - https://bftnagoya.hateblo.jp/entry/2021/03/12/101207

```yaml
---
- name: Add port
  firewalld:
    port: "{{ item }}"
    permanent: yes
    state: enabled
    zone: public
  with_items:
    - "{{ ports }}"

- name: Restart firewalld
  systemd:
    name: firewalld
    state: reloaded
```

<br>

### host_varsディレクトリ

#### ▼ host_varsディレクトリとは

特定の管理対象ノードで使用する変数に関するファイルを配置する。

#### ▼ host_varファイル

特定の管理対象ノードで使用する変数を設定する。

<br>
### inventoriesディレクトリ

#### ▼ inventoriesディレクトリとは

管理対象ノードの情報を設定する。

Ansibleの実行時に、`-i`オプションでディレクトリを指定する。

> - https://tekunabe.hatenablog.jp/entry/2019/02/23/ansible_inventory_merge

```bash
$ ansible-playbook <playbookファイル> -i <inventoriesディレクトリ>
```

#### ▼ inventoryファイル

管理対象ノードを設定する。

複数の拡張子 (`ini`形式、`yml`形式、`json`形式) で定義でき、`ansible-inventory`コマンドで`ini`形式から他の形式に変換できる。

ただし、`ini`形式の場合は拡張子をつけない方が良い。実行環境 (本番/ステージング) 別にファイルを切り分けると良い。

また、サーバーを冗長化している場合は、これも別々に定義しておく。

プロビジョニングの実行対象はロードバランサーから一時的に切り離すようにすることにより、プロビジョニングに伴ってインシデントが起こっても、ユーザーへの影響を防げる。

> - https://docs.ansible.com/ansible/2.9/user_guide/intro_inventory.html#inventoryformat
> - https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter5
> - https://tekunabe.hatenablog.jp/entry/2017/11/08/ansible_inventory_ini

**＊実装例＊**

もし`yml`形式の場合は以下の通りとなる。

```yaml
# inventoryファイル
# テスト環境
- all:
    hosts:
      app:
        # 管理対象ノードのIPアドレス
        ansible_host: 127.0.0.1
        # 管理対象ノードにログインするためのユーザー名
        ansible_user: vagrant
        # 管理対象ノードにログインするためのパスワード
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
          # Appサーバー
          app:
            # 管理対象ノードのIPアドレス
            ansible_host: 192.168.100.101
            # 管理対象ノードにログインするためのユーザー名
            ansible_user: ubuntu
            # 管理対象ノードにログインするためのパスワード
            ansible_password: ubuntu
            # 管理対象ノードへのSSH公開鍵認証に使用する秘密鍵
            ansible_ssh_private_key_file: /etc/ansible/ssh_keys/prd-foo.pem
          # Webサーバー
          web:
            ansible_host: 192.168.100.10
            ansible_user: ubuntu
            ansible_password: ubuntu
            ansible_ssh_private_key_file: /etc/ansible/ssh_keys/prd-foo.pem
      # 冗長化サーバーc
      server_c:
        hosts:
          # Appサーバー
          app:
            ansible_host: 192.168.100.102
            ansible_user: ubuntu
            ansible_password: ubuntu
            ansible_ssh_private_key_file: /etc/ansible/ssh_keys/prd-foo.pem
          # Webサーバー
          web:
            ansible_host: 192.168.100.11
            ansible_user: ubuntu
            ansible_password: ubuntu
            ansible_ssh_private_key_file: /etc/ansible/ssh_keys/prd-foo.pem
```

**＊実装例＊**

もし`ini`形式の場合は以下の通りとなる。

```ini
# inventoryファイル
# テスト環境

# -------------------
# 冗長化サーバーa
# -------------------

# Appサーバー
[server_a.hosts.app]
# 管理対象ノードのIPアドレス
ansible_host=192.168.100.101
# 管理対象ノードにログインするためのユーザー名
ansible_user=ubuntu
# 管理対象ノードにログインするためのパスワード
ansible_password=ubuntu
# 管理対象ノードへのSSH公開鍵認証に使用する秘密鍵
ansible_ssh_private_key_file=/etc/ansible/ssh_keys/prd-foo.pem

# Webサーバー
[server_a.hosts.web]
ansible_host=192.168.100.10
ansible_user=ubuntu
ansible_password=ubuntu
ansible_ssh_private_key_file=/etc/ansible/ssh_keys/prd-foo.pem

# -------------------
# 冗長化サーバーc
# -------------------

# Appサーバー
[server_c.hosts.app]
ansible_host=192.168.100.102
ansible_user=ubuntu
ansible_password=ubuntu
ansible_ssh_private_key_file=/etc/ansible/ssh_keys/prd-foo.pem

# Webサーバー
[server_c.hosts.web]
ansible_host=192.168.100.11
ansible_user=ubuntu
ansible_password=ubuntu
ansible_ssh_private_key_file=/etc/ansible/ssh_keys/prd-foo.pem
```

```ini
# inventoryファイル
# 本番環境

# -------------------
# 冗長化サーバーa
# -------------------

# Appサーバー
[server_a.hosts.app]
ansible_host=192.168.100.101
ansible_user=ubuntu
ansible_password=ubuntu
ansible_ssh_private_key_file=/etc/ansible/ssh_keys/prd-foo.pem

# Webサーバー
[server_a.hosts.web]
ansible_host=192.168.100.10
ansible_user=ubuntu
ansible_password=ubuntu
ansible_ssh_private_key_file=/etc/ansible/ssh_keys/prd-foo.pem

# -------------------
# 冗長化サーバーc
# -------------------

# Appサーバー
[server_c.hosts.app]
ansible_host=192.168.100.102
ansible_user=ubuntu
ansible_password=ubuntu
ansible_ssh_private_key_file=/etc/ansible/ssh_keys/prd-foo.pem

# Webサーバー
[server_c.hosts.web]
ansible_host=192.168.100.11
ansible_user=ubuntu
ansible_password=ubuntu
ansible_ssh_private_key_file=/etc/ansible/ssh_keys/prd-foo.pem
```

<br>

## 02. /roles/handlersセクション

### handlersセクションとは

taskセクションの後に実行するセットアップ処理を設定する。

<br>

## 02-02. /roles/targetsセクション

### targetsセクションとは

プレイの実行先のノードを設定する。

必須である。

> - https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter8#targets-%E3%82%BB%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3

<br>

### name

#### ▼ nameとは

プレイの名前を設定する。

```yaml
- name: Setup nginx
```

<br>

### hosts

#### ▼ hostsとは

プレイの実行先のノードを設定する。

```yaml
- hosts: all
```

<br>

### become

#### ▼ becomeとは

プレイをroot権限 (sudo権限) で実行するか否かを設定する。

root以外であれば、`become_user`キーを設定する。

```yaml
- become: yes
  become_user: foo-user
```

<br>

### gather_facts

#### ▼ gather_factsとは

ファクト変数を収集するか否かを設定する。

```yaml
- gather_facts: no
```

## 02-03. /roles/tasksセクション

### tasksセクションとは

管理対象ノードで実行するセットアップ処理を手続き的に設定する。

必須である。

> - https://zenn.dev/y_mrok/books/ansible-no-tsukaikata/viewer/chapter8#tasks-%E3%82%BB%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3

<br>

### ansible.builtin.apt

#### ▼ ansible.builtin.aptとは

管理対象ノードで、パッケージをaptリポジトリからインストールする。

任意のバージョンのパッケージをインストールする場合は、`name`キーにそれを指定し、`state`キーの値は`present`とする。

**＊実装例＊**

```yaml
# nginxをインストールします。
- name: Install Nginx
  ansible.builtin.apt:
    name: nginx=1.0.0
    state: present
```

> - https://docs.ansible.com/ansible/latest/collections/ansible/builtin/apt_module.html
> - https://qiita.com/tkit/items/7ad3e93070e97033f604

<br>

### ansible.builtin.dnf

#### ▼ ansible.builtin.dnfとは

管理対象ノードで、パッケージをdnfリポジトリからインストールする。

**＊実装例＊**

```yaml
# cloudwatchエージェントをインストールする。
- name: install amazon-cloudwatch-agent
  ansible.builtin.dnf:
    name: amazon-cloudwatch-agent
    state: present

# カスタムメトリクスの元になるデータポイントを収集するために、collectdをインストールする。
- name: install collectd
  ansible.builtin.dnf:
    name: collectd
    state: present

# 設定ファイルを配置する。
- name: copy amazon-cloudwatch-agent.json
  ansible.builtin.copy:
    src: amazon-cloudwatch-agent.json
    dest: /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
    owner: root
    group: root
    mode: 0644

# cloudwatchエージェントを起動する。
- name: fetch-config config.json
  ansible.builtin.shell: |
    /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
      -a fetch-config \
      -m ec2 \
      -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
      -s

# cloudwatchエージェントをsystemdで管理する。
- name: enable cloudwatch-agent
  ansible.builtin.systemd:
    name: amazon-cloudwatch-agent
    enabled: yes
    daemon_reload: yes
```

#### ▼ バージョン指定

任意のバージョンのパッケージをインストールする場合は、`name`キーにそれを指定し、`state`キーの値は`present`とする。

**＊実装例＊**

```yaml
# nginxをインストールします。
- name: Install Nginx
  ansible.builtin.yum:
    # バージョンを指定する
    name: nginx=1.0.0
    state: present
```

```yaml
# epelリポジトリをインストールします。
- name: Install epel-release
  ansible.builtin.yum:
    name: https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
    state: present
```

> - https://qiita.com/tkit/items/7ad3e93070e97033f604

<br>

### ansible.builtin.lineinfile

#### ▼ ansible.builtin.lineinfileとは

管理対象ノードにあるファイルを行単位で編集する。

**＊実装例＊**

SELinuxを無効化する。

> - https://tekunabe.hatenablog.jp/entry/2019/02/24/ansible_lineinfile_intro#Playbook

**＊実装例＊**

```yaml
# SELinuxを無効化します。
- name: Disable SELinux
  ansible.builtin.lineinfile:
    path: /etc/selinux/config
    regexp: "^SELINUX="
    line: "SELINUX=disabled"
```

**＊実装例＊**

```yaml
# unlimitの設定を追加します
- name: Add ulimit setting
  lineinfile:
    path: /etc/systemd/system.conf.d/50-limits.conf
    regexp: "^DefaultLimitNOFILE=.*$"
    line: "DefaultLimitNOFILE=65536:65536"
```

**＊実装例＊**

```yaml
# rsyslog_conf_fileにstatを格納する
- name: Check if /etc/rsyslog.conf exists
  ansible.builtin.stat:
    path: /etc/rsyslog.conf
  register: rsyslog_conf_file

- name: Create rsyslog.conf
  ansible.builtin.lineinfile:
    line: "$FileCreateMode 0640"
    regexp: "^$FileCreateMode"
    path: /etc/rsyslog.conf
  # もしrsyslog_conf_file内にデータがあれば、実行する
  when: rsyslog_conf_file.stat.exists
```

<br>

### ansible.builtin.copy

#### ▼ ansible.builtin.copyとは

管理対象ノードのディレクトリにファイルをコピーする。

**＊実装例＊**

```yaml
# 設定ファイルを配置します。
- name: Copy foo.json
  ansible.builtin.copy:
    src: foo.json
    dest: /etc/foo.json
    owner: root
    group: root
    mode: 0644
```

<br>

### ansible.builtin.file

#### ▼ ansible.builtin.fileとは

管理対象ノードでファイルを操作する。

> - https://tekunabe.hatenablog.jp/entry/2019/03/03/ansible_file_intro

**＊実装例＊**

管理対象ノードで`chown`コマンドを実行することにより、ファイルの所有権を設定する。

```yaml
- name: Update foo-binary permission
  ansible.builtin.file:
    path: /usr/local/bin/foo-binary
    owner: root
    group: root
```

<br>

### ansible.builtin.get_url

#### ▼ ansible.builtin.get_urlとは

管理対象ノードで`curl`コマンドを実行する。

> - https://zenn.dev/y_mrok/books/ansible-no-module-no-tsukaikata/viewer/ansible_builtin_get_url

```yaml
- name: Download tool
  ansible.builtin.get_url:
    url: https://github.com/hiroki-hasegawa/foo-tool.tar.gz
    dest: .
```

<br>

### ansible.builtin.service

#### ▼ ansible.builtin.serviceとは

管理対象ノードで`service`コマンドの実行を設定する。

> - https://docs.ansible.com/ansible/2.9/modules/service_module.html

**＊実装例＊**

```yaml
# serviceコマンドを使用して、nginxを起動します。
- name: Start nginx service
  ansible.builtin.service:
    name: Start nginx
    state: started
    enabled: "yes"
```

<br>

### ansible.builtin.shell

#### ▼ ansible.builtin.shellとは

管理対象ノードでシェルを実行する。複数行に渡る場合は、『`|`』を使用する。

> - https://docs.ansible.com/ansible/latest/collections/ansible/builtin/shell_module.html
> - https://blog.ruanbekker.com/blog/2020/01/24/environment-variables-with-ansible/

**＊実装例＊**

```yaml
- name: Echo foo
  ansible.builtin.shell: |
    echo foo
```

**＊実装例＊**

```yaml
- name: fetch-config amazon-cloudwatch-agent.json
  ansible.builtin.shell: |
    /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
      -a fetch-config \
      -m ec2 \
      -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
      -s
```

<br>

### ansible.builtin.systemd

#### ▼ ansible.builtin.systemdとは

管理対象ノードで`systemctl`コマンドの実行を設定する。

> - https://docs.ansible.com/ansible/latest/collections/ansible/builtin/systemd_module.html

**＊実装例＊**

```yaml
# systemdでnginxのプロセスを管理します。
- name: Start nginx systemd
  ansible.builtin.systemd:
    name: Start nginx
    state: started
    enabled: yes
    daemon_reload: yes
```

**＊実装例＊**

```yaml
# systemdでcloudwatchエージェントのプロセスを管理します。
- name: Start cloudwatch-agent systemd
  ansible.builtin.systemd:
    name: amazon-cloudwatch-agent
    state: started
    enabled: yes
    daemon_reload: yes
```

#### ▼ state

ユニットの最終的な状態を設定する。

| 設定値      | 説明                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `reloaded`  | 最終的な状態としてdeamon_reloadするように、ユニットを再読み込みする。 |
| `restarted` | 最終的な状態として再起動するように、ユニットを再起動する。            |
| `started`   | 最終的な状態として停止しているように、ユニットを起動する。            |
| `stopped`   | 最終的な状態として停止しているさうに、ユニットを停止する。            |

> - https://dekitakotono.blogspot.com/2019/05/systemd.html

<br>

### ansible.builtin.template

#### ▼ ansible.builtin.templateとは

テンプレート (`.j2`ファイル) から作成したファイルを管理対象ノードのディレクトリに配置する。

**＊実装例＊**

```yaml
- name: Upload foo.conf
  ansible.builtin.template:
    src: foo.conf.j2
    dest: /etc/foo/foo.conf
```

<br>

### ansible.builtin.unarchive

#### ▼ ansible.builtin.unarchiveとは

コントロールノードまたは管理対象ノードで`tar`コマンドを実行することにより、圧縮ファイルを解凍する。

**＊実装例＊**

```yaml
- name: Unarchive file
  ansible.builtin.unarchive:
    src: /tmp/foo-tool.tar.gz
    dest: /usr/local/bin
    remote_src: yes # 管理対象ノード上の圧縮ファイルを指定する場合はyesとする。
```

> - https://docs.ansible.com/ansible/latest/collections/ansible/builtin/unarchive_module.html

<br>

### ansible.builtin.user

#### ▼ ansible.builtin.userとは

シェルのユーザーを操作する。

**＊実装例＊**

ユーザーを作成する。

無効なシェルを設定し、ログインできないようにしておく。

> - https://docs.ansible.com/ansible/latest/collections/ansible/builtin/unarchive_module.html

```yaml
- name: add user
  ansible.builtin.user:
    name: foo
    shell: /bin/false
```

<br>

### ansible.builtin.yum

#### ▼ ansible.builtin.yumとは

管理対象ノードで、パッケージをyumリポジトリからインストールする。

代わりに`ansible.builtin.dnf`モジュールを使うと良い。

<br>

### ansible_env

#### ▼ ansible_envとは

管理対象ノードに設定された環境変数を出力する。

`gather_facts`オプションを有効化する必要がある。

> - https://docs.ansible.com/ansible/2.9/reference_appendices/faq.html#shell
> - https://tekunabe.hatenablog.jp/entry/2019/03/09/ansible_env

**＊実装例＊**

管理対象ノードの環境変数の`FOO`を出力する。

`gather_facts`オプションを有効化しておく。

```yaml
- gather_facts: yes
```

```yaml
- vars:
    FOO: ansible_env.FOO
```

<br>

### environment

#### ▼ environmentとは

task内で出力できる環境変数を設定する。

> - https://docs.ansible.com/ansible/2.9/user_guide/playbooks_environment.html

**＊実装例＊**

```yaml
- name: Echo foo
  ansible.builtin.shell: |
    echo foo
    echo "${FOO}"
  environment:
    FOO: FOO
```

<br>

## 02-04. /roles/varsセクション

### varsセクションとは

プレイで使用する設定値を変数として設定する。

設定した変数は、`ansible.builtin.template`オプションを使用して`j2`ファイルに出力できる。

> - https://blog.katsubemakito.net/ansible/ansible-1st-4
> - https://ksaito11.hatenablog.com/entry/2018/10/24/232929

**＊実装例＊**

```yaml
- name: Upload foo.conf
  ansible.builtin.template:
    src: foo.conf.j2
    dest: /etc/foo/foo.conf
  vars:
    foo: FOO
    bar: BAR
```

```yaml
# foo.conf.j2ファイル
{{foo}}
```

<br>

## 02-05. プラグイン

### lookup

#### ▼ env

コントロールノードに設定された環境変数を出力する。

> - https://docs.ansible.com/ansible/2.9/reference_appendices/faq.html#shell
> - https://tekunabe.hatenablog.jp/entry/2019/03/09/ansible_env

**＊実装例＊**

コントロールノードの環境変数の`FOO`を出力する。

```yaml
- name: Upload foo.conf
  ansible.builtin.template:
    src: foo.conf.j2
    dest: /etc/foo/foo.conf
  vars:
    foo: 'lookup("env", "FOO")'
```

<br>

## 03. AWS

### amazon.aws.ec2_ami

AWS EC2を作成する。

これはTerraformでも代替できる。

```yaml
- name: Basic AMI Creation
  amazon.aws.ec2_ami:
    instance_id: i-xxxxxx
    wait: true
    name: newtest
    architecture: x86_64
    virtualization_type: hvm
    root_device_name: /dev/xvda
    device_mapping:
      - device_name: /dev/sda1
        size: XXX
        delete_on_termination: true
        volume_type: gp2
      - device_name: /dev/sdb
        size: YYY
        delete_on_termination: false
        volume_type: gp2
    tags:
      Name: newtest
      Service: TestService
```

> - https://docs.ansible.com/ansible/latest/collections/amazon/aws/ec2_ami_module.html#examples

<br>
