---
title: 【知見を記録するサイト】パッケージ＠ユーティリティ
description: パッケージ＠ユーティリティの知見をまとめました。
---

# パッケージ＠ユーティリティ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. dnsutils/bind-utils

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install dnsutils
```

```bash
$ apt-get install dnsutils
```

#### ▼ yumリポジトリから

```bash
$ yum install -y bind-utils
```

<br>

### nslookup

#### ▼ nslookupとは

正引き/逆引きによる名前解決を行う。もしドメイン名に複数のIPアドレスが割り当てられている場合、正引きを行うと、全てのIPアドレスが返却される。

#### ▼ オプション無し

参考：https://qiita.com/toshihirock/items/1ff01a51570bf6ca4f59

**＊実行例＊**

```bash
# 正引き
$ nslookup google.co.jp

# 非権威DNSサーバー（キャッシュDNSサーバー）からの返信
Non-authoritative answer:
Server:  UnKnown
Address:  2400:2650:7e1:5a00:1111:1111:1111:1111

Name:  google.co.jp
Addresses:  2404:6800:4004:80f::2003 # IPv6アドレス
            172.217.175.3            # IPv4アドレス
```

```bash
# 逆引き
$ nslookup 172.217.175.3

Server:  UnKnown
Address:  2400:2650:7e1:5a00:1111:1111:1111:1111

Name:  nrt20s18-in-f3.1e100.net # IPv4アドレスにマッピングされたドメイン名
Address:  172.217.175.3 # IPv4アドレス
```

権威DNSサーバーを使用して名前解決する場合、引数なしで```nslookup```コマンドを実行する。

参考：

- http://linux.kororo.jp/cont/server/nslookup_dns.php
- https://qiita.com/toshihirock/items/1ff01a51570bf6ca4f59

```bash
$ nslookup

# 入力を求められるため、権威DNSサーバーを指定する。
>  server ns1.google.com
Default server: ns1.google.com
Address: 216.239.32.10#53
Default server: ns1.google.com
Address: 2001:4860:4802:32::a#53

# 入力を求められるため、権威DNSサーバーにドメインを問い合わせる。
> google.co.jp
Server:         ns1.google.com
Address:        216.239.32.10#53

Name:   google.co.jp
Address: 142.251.42.131
```

#### ▼ -type

正引き/逆引きによる名前解決を行い、この時に指定したレコードタイプのレコード値を返却させる。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/cloud_computing/cloud_computing_aws.html

**＊例＊**

名前解決を行い、NSレコード値を返却させる。

```bash
$ nslookup -type=NS google.co.jp

Non-authoritative answer:
Server:  UnKnown
Address:  2400:2650:7e1:5a00:1111:1111:1111:1111

google.co.jp    nameserver = ns3.google.com
google.co.jp    nameserver = ns4.google.com
google.co.jp    nameserver = ns2.google.com
google.co.jp    nameserver = ns1.google.com

ns1.google.com  AAAA IPv6 address = 2001:4860:4802:32::a
ns2.google.com  AAAA IPv6 address = 2001:4860:4802:34::a
ns3.google.com  AAAA IPv6 address = 2001:4860:4802:36::a
ns4.google.com  AAAA IPv6 address = 2001:4860:4802:38::a
ns1.google.com  internet address = 216.239.32.10
ns2.google.com  internet address = 216.239.34.10
ns3.google.com  internet address = 216.239.36.10
ns4.google.com  internet address = 216.239.38.10
(root)  ??? unknown type 41 ???
```

<br>

## 02. net-tools

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install net-tools 
```

```bash
$ apt-get install net-tools
```

#### ▼ yumリポジトリから

```bash
$ yum install -y net-tools 
```

<br>

### 接続状態の一覧

参考：https://atmarkit.itmedia.co.jp/ait/articles/0207/20/news003.html

<br>

### netstat

#### ▼ -plunt

オプション（```-p```、```-l```、```-u```、```-n```、```-t```）の組み合わせ。各プロセスが開放しているポート番号、ポート番号で受信するプロトコル、接続状態、などの一覧を取得する。

参考：https://askubuntu.com/questions/721306/how-many-ports-opened-by-a-single-application

```bash
$ netstat -plunt

Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name     
tcp        0      0 0.0.0.0:15090           0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:15090           0.0.0.0:*               LISTEN      -                   
tcp        0      0 127.0.0.1:15000         0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:15001           0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:15001           0.0.0.0:*               LISTEN      -                   
tcp        0      0 127.0.0.1:15004         0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:15006           0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:15006           0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:15021           0.0.0.0:*               LISTEN      -                   
tcp        0      0 0.0.0.0:15021           0.0.0.0:*               LISTEN      -                   
tcp6       0      0 :::9000                 :::*                    LISTEN      1/php-fpm: master p 
tcp6       0      0 :::15020                :::*                    LISTEN      -
```

<br>

## 03. pstree

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install pstree
```

```bash
$ apt-get install pstree
```

<br>

### pstreeとは

プロセスの親子関係をツリー状に取得する。

```bash
# MacOSの場合
$ pstree

-+= 00001 root /sbin/launchd
 |--= 00059 root /usr/sbin/syslogd
 |--= 00060 root /usr/libexec/UserEventAgent (System)
 |-+= 00062 root /Applications/ESET Endpoint Security.app/Contents/MacOS/esets_ctl
 | \-+= 00286 root /Applications/ESET Endpoint Security.app/Contents/MacOS/esets_daemon
 |   |--- 00323 root /Applications/ESET Endpoint Security.app/Contents/MacOS/esets_daemon --scan-process
 |   |--- 00455 root /Applications/ESET Endpoint Security.app/Contents/MacOS/esets_fcor
...
```

<br>

## 04. speedtest-cli

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install speedtest-cli
```

#### ▼ brewリポジトリから

```bash
$ brew install speedtest-cli
```

<br>

### speedtest-cli

SPEEDTESTのAPIを用いて、ダウンロード（下り）とアップロード（上り）の通信速度を解析する。

参考：https://www.speedtest.net/ja

```bash
$ speedtest-cli

Testing download 
Download: 168.61 Mbit/s # ダウンロード速度

Testing upload 
Upload: 182.00 Mbit/s # アップロード速度
```

<br>

## 05. supervisor

### インストール

#### ▼ pipリポジトリから

参考：http://supervisord.org/installing.html#installing-a-distribution-package

```bash
$ pip3 install supervisor
```

<br>

### supervisorの構成要素

#### ▼ supervisor

Python製のユーティリティである。プロセスをデーモン化し、一括で管理する。

参考：

- http://supervisord.org/index.html
- https://www.crazyengineers.com/threads/supervisord-vs-systemd-which-is-better-and-why.103871

#### ▼ supervisorctl

supervisordを操作する。

参考：http://supervisord.org/introduction.html#supervisor-components

#### ▼ supervisord

supervisor自体のプロセスのこと。

参考：http://supervisord.org/introduction.html#supervisor-components

<br>

### supervisordセクション

#### ▼ supervisordセクションとは

supervisorの```supervisord```プロセスのプールを設定する。

参考：http://supervisord.org/configuration.html#supervisord-section-settings

```ini
[supervisord]

# 〜 中略 〜
```

#### ▼ directory

デーモン化されたプロセスの起動コマンドを実行する作業ディレクトリを設定する。

```ini
[supervisord]
directory=/var/www/foo
```

#### ▼ logfile

supervisordのログファイルの場所を設定する。

```ini
[supervisord]
logfile=/var/log/supervisor/supervisord.log
```

#### ▼ loglevel

supervisordのログレベルを設定する。

```ini
[supervisord]
loglevel=info
```

#### ▼ nodaemon

supervisordをフォアグラウンドで起動するかどうかを設定する。

```ini
[supervisord]
nodaemon=true
```

#### ▼ pidfile

supervisordのpidが記載されるファイルを設定する。

```ini
[supervisord]
pidfile=/var/tmp/supervisor/supervisord.pid
```

#### ▼ redirect_stderr

標準出力への出力を標準エラー出力に転送する可動化を設定する。

```ini
[supervisord]
redirect_stderr=true
```

#### ▼ user

supervisordの実行ユーザーを設定する。

```ini
[supervisord]
user=root
```

<br>

### programセクション

#### ▼ programセクションとは

常駐プログラムのプロセスを設定する。

参考：

- http://supervisord.org/configuration.html#program-x-section-settings
- https://christina04.hatenablog.com/entry/2015/07/21/215525

```ini
[program:<プログラム名>]

# 〜 中略 〜

[program:foo]

# 〜 中略 〜
```

#### ▼ autorestart

デーモン化されたプロセスの異常停止時に自動的に起動させるかどうかを設定する。

```ini
[program:foo]
autorestart=true
```

#### ▼ autostart

supervisordの起動時に、デーモン化されたプロセスを自動的に起動させるかどうか、を設定する。

```ini
[program:foo]
autostart=true
```

#### ▼ command

デーモン化されたプロセスの起動コマンドを設定する。

```ini
[program:foo]
command=/usr/sbin/crond -n
```

#### ▼ redirect_stderr

デーモン化されたプロセスの標準出力への出力を標準エラー出力に転送するかどうかを設定する。

```ini
[program:foo]
redirect_stderr=true
```

#### ▼ startretries

デーモン化されたプロセスの起動に失敗した場合に、何回再試行するかを設定する。

```ini
[program:foo]
startretries=10
```

#### ▼ stdout_logfile、stderr_logfile

デーモン化されたプロセスの標準出力/標準エラー出力の出力先を設定する。デフォルト値は```/var/log/supervisor```ディレクトリである。もし、```/dev/stdout```ディレクトリまたは```/dev/stderr```ディレクトリを使用する場合は、```logfile_maxbytes ```オプションの値を```0```（無制限）とする必要がある。

参考：http://supervisord.org/configuration.html#supervisord-section-values

```ini
[program:foo]

# 標準出力の場所
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0

# 標準エラー出力の場所
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
```

#### ▼ stdout_logfile_backups

ログローテートによって作成されるバックアップの世代数。

```ini
[program:foo]
stdout_logfile_backups=10
```

#### ▼ stdout_logfile_maxbytes

ログファイルの最大サイズ。設定値を超えると、ログローテートが実行される。これにより、ログファイルがバックアップとして保存され、新しいログファイルが作成される。

```ini
[program:foo]
stdout_logfile_maxbytes=50MB
```

#### ▼ user

デーモン化されたプロセスの実行ユーザーを設定する。

```ini
[program:foo]
user=root
```

<br>

### groupセクション

#### ▼ priority

```ini
[group]
priority=999
```

#### ▼ programs

グループ化するデーモン名を設定する。

```ini
[group]
programs=bar,baz
```

<br>

### supervisorctl

#### ▼ restart

指定したデーモンを再起動する。```all```とした場合は、全てを再起動する。

参考：http://supervisord.org/running.html#supervisorctl-actions

```bash
$ supervisorctl restart <デーモン名>
```

#### ▼ update

もし```supervisord.conf```ファイルの設定を変更した場合に、これを読み出し直す。

参考：http://supervisord.org/running.html#supervisorctl-actions

```bash
$ supervisorctl update
```

<br>

## 06. sops

### インストール

#### ▼ brewリポジトリから

```bash
$ brew install sops
```

<br>

### ```.sops.yaml```ファイル

コマンドのパラメーターを定義する。

参考：https://github.com/mozilla/sops#211using-sopsyaml-conf-to-select-kmspgp-for-new-files

```yaml
creation_rules:
  - path_regex: /foo/foo.yaml
    kms: "arn:aws:kms:ap-northeast-1:<アカウントID>:key/*****"
  - path_regex: /bar/.*\.yaml # 再帰的に指定できる。
    kms: "arn:aws:kms:ap-northeast-1:<アカウントID>:key/*****"
```

<br>

### サブコマンド無し

#### ▼ -d

YAMLファイル/JSONファイルの値の部分を復号化する。標準出力に出力されるため、ファイルに書き出すようにすると良い。

```bash
sops -e <復号前のYAMLファイル/JSONファイル> > <復号後のYAMLファイル/JSONファイル>
```

#### ▼ -e

暗号化ルールに基づいて、YAMLファイル/JSONファイルの値の部分を暗号化する。環境変数や```.sops.yaml```ファイルで暗号化ルールを定義しておく必要がある。標準出力に出力されるため、ファイルに書き出すようにすると良い。

```bash
# AWS KMSをルールとして使用する。
$ export SOPS_KMS_ARN="arn:aws:kms:ap-northeast-1:<アカウントID>:key/*****"

$ sops -e <暗号化前のYAMLファイル/JSONファイル> > <暗号化後のYAMLファイル/JSONファイル>
```

<br>

## 07. systemctl：system control（旧service）

### systemctlの構成要素

#### ▼ systemctl

プロセスをデーモン化する機能を持つsystemdを制御するためのユーティリティ。

参考：

- https://cameong.hatenablog.com/entry/2016/10/18/121400
- https://www.crazyengineers.com/threads/supervisord-vs-systemd-which-is-better-and-why.103871

#### ▼ systemd：system daemon

各プロセスを、```/usr/lib/systemd/system```や```/etc/systemd/system```下でユニット別に管理し、ユニットごとに起動する。ユニットは拡張子の違いで判別する。

| ユニットの拡張子 | 説明                     | デーモン例             |
| ---------------- |------------------------|-------------------|
| mount            | ファイルのマウントに関するデーモン。     |                   |
| service          | プロセス起動停止に関するデーモン。      | httpd：http daemon |
| socket           | ソケットとプロセスの紐付けに関するデーモン。 |                   |

<br>

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install systemd
```

```bash
$ apt-get install systemd
```

<br>

### disable

OSの起動時に、デーモン化されたプロセスが自動起動しないように設定する。

```bash
$ systemctl disable <プロセス名>

# 例：Cron、Apache
$ systemctl disable crond.service
$ systemctl disable httpd.service
```

### enable

OSの起動時に、デーモン化されたプロセスが自動起動するように設定する。

```bash
$ systemctl enable <プロセス名>

# 例：Cron、Apache
$ systemctl enable crond.service
$ systemctl enable httpd.service
```

<br>

### list-units

デーモン化されたプロセスの稼働状態を一覧を取得する。```grep```と組み合わせて、起動中（```active```）、停止中（```inactive```）、起動失敗（```failed```）のデーモンのみを取得すると良い。

参考：https://milestone-of-se.nesuke.com/sv-basic/linux-basic/systemctl/

```bash
$ systemctl list-units --type=service | grep active

UNIT                             LOAD    ACTIVE  SUB      DESCRIPTION
abrt-ccpp.service                loaded  active  exited   Install ABRT coredump hook
abrt-oops.service                loaded  active  running  ABRT kernel log watcher
abrtd.service                    loaded  active  running  ABRT Automated Bug Reporting Tool
...
```

<br>

### list-unit-files

デーモン化されたプロセスのUnitの一覧を取得する。

```bash
$ systemctl list-unit-files --type=service

crond.service           enabled  # enable：自動起動する
supervisord.service     disabled # disable：自動起動しない
systemd-reboot.service  static   # enable：他サービス依存
```

<br>

### reload

デーモン化されたプロセスを安全に再起動する。

```bash
$ systemctl reload nginx
```

<br>

### restart

デーモン化されたプロセスを強制的に再起動する。

```bash
$ systemctl restart httpd
```

```bash
$ systemctl restart nginx
```

<br>

### start

デーモン化されたプロセスを起動する。

```bash
$ systemctl start httpd
```

```bash
$ systemctl start nginx
```

<br>

### status

デーモン化されたプロセスの状態を確認する。

参考：https://milestone-of-se.nesuke.com/sv-basic/linux-basic/systemctl/

```bash
$ systemctl status rsyslog

rsyslog.service - System Logging Service
Loaded: loaded (/usr/lib/systemd/system/rsyslog.service; enabled; vendor preset: enabled)
Active: active (running) since Thr 2017-12-07 07:03:21 JST; 8h left
Main PID: 959 (rsyslogd)
CGroup: /system.slice/rsyslog.service
mq959 /usr/sbin/rsyslogd -n
```

<br>

### stop

デーモン化されたプロセスを停止する。

```bash
$ systemctl stop httpd
```

```bash
$ systemctl stop nginx
```

<br>

## 08. tcpdump

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install tcpdump
```

```bash
$ apt-get install tcpdump
```

#### ▼ yumリポジトリから

```bash
$ yum install -y tcpdump
```

<br>

### -i <ネットワークインターフェース名>

指定したネットワークインターフェースにて、パケットの内容を取得する。

参考：https://qiita.com/tossh/items/4cd33693965ef231bd2a

```bash
$ tcpdump -i eth0
```

<br>

### -nn <プロトコル名>

全てのネットワークインターフェースにて、指定したプロトコルを使用したパケットの内容を取得する。

参考：https://go-journey.club/archives/1472

```bash
$ tcpdump -nn ip
```

<br>

### -nn port <ポート番号>

全てのネットワークインターフェースにて、指定したポート番号に対するパケットの内容を取得する。

参考：https://go-journey.club/archives/1472

```bash
$ tcpdump -nn port 80
```

<br>
