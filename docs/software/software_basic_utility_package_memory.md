---
title: 【IT技術の知見】メモリ系＠パッケージ
description: メモリ系＠パッケージの知見を記録しています。
---

# メモリ系＠パッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. pstree

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

## 02. supervisor

### インストール

#### ▼ pipリポジトリから

> - http://supervisord.org/installing.html#installing-a-distribution-package

```bash
$ pip3 install supervisor
```

<br>

### supervisorの構成要素

#### ▼ supervisor

Python製のユーティリティである。

メモリ上の複数のプロセスをデーモン化し、一括で管理する。

> - http://supervisord.org/index.html
> - https://www.crazyengineers.com/threads/supervisord-vs-systemd-which-is-better-and-why.103871

#### ▼ supervisorctl

supervisordを操作する。

> - http://supervisord.org/introduction.html#supervisor-components

#### ▼ supervisord

supervisor自体のプロセスのこと。

> - http://supervisord.org/introduction.html#supervisor-components

<br>

### supervisordセクション

#### ▼ supervisordセクションとは

supervisorの`supervisord`プロセスのプールを設定する。

```ini
[supervisord]

...
```

> - http://supervisord.org/configuration.html#supervisord-section-settings

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

supervisordをフォアグラウンドで起動するか否かを設定する。

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

デーモン化されたプロセスを設定する。

```ini
[program:<プログラム名>]

...

[program:foo]

...
```

> - http://supervisord.org/configuration.html#program-x-section-settings
> - https://christina04.hatenablog.com/entry/2015/07/21/215525

#### ▼ autorestart

デーモン化されたプロセスの異常停止時に自動的に起動させるか否かを設定する。

```ini
[program:foo]
autorestart=true
```

#### ▼ autostart

supervisordの起動時に、デーモン化されたプロセスを自動的に起動させるか否か、を設定する。

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

デーモン化されたプロセスの標準出力への出力を標準エラー出力に転送するか否かを設定する。

```ini
[program:foo]
redirect_stderr=true
```

#### ▼ startretries

デーモン化されたプロセスの起動に失敗した場合、何回再試行するかを設定する。

```ini
[program:foo]
startretries=10
```

#### ▼ stdout_logfile、stderr_logfile

デーモン化されたプロセスの標準出力/標準エラー出力の出力先を設定する。

デフォルト値は`/var/log/supervisor`ディレクトリである。

もし、`/dev/stdout`ディレクトリまたは`/dev/stderr`ディレクトリを使用する場合は、`logfile_maxbytes `オプションの値を`0` (無制限) とする必要がある。

```ini
[program:foo]

# 標準出力の場所
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0

# 標準エラー出力の場所
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
```

> - http://supervisord.org/configuration.html#supervisord-section-values

#### ▼ stdout_logfile_backups

ログローテートによって作成されるバックアップの世代数。

```ini
[program:foo]
stdout_logfile_backups=10
```

#### ▼ stdout_logfile_maxbytes

ログファイルの最大サイズ。

設定値を超えると、ログローテートが実行される。

これにより、ログファイルがバックアップとして保存され、新しいログファイルが作成される。

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

指定したデーモンを再起動する。

`all`とした場合は、全てを再起動する。

```bash
$ supervisorctl restart <デーモン名>
```

> - http://supervisord.org/running.html#supervisorctl-actions

#### ▼ update

もし`supervisord.conf`ファイルの設定を変更した場合、これを再読み出しする。

```bash
$ supervisorctl update
```

> - http://supervisord.org/running.html#supervisorctl-actions

<br>

## 03. systemctl：system control (新service)

### systemctlの構成要素

#### ▼ systemctl

メモリ上のプロセスをデーモン化する機能を持つsystemdを制御する。

> - https://cameong.hatenablog.com/entry/2016/10/18/121400
> - https://www.crazyengineers.com/threads/supervisord-vs-systemd-which-is-better-and-why.103871

#### ▼ systemd：system daemon

メモリ上の複数のプロセスをデーモン化し、一括で管理する。

ユニットファイルに基づいて、プロセスをユニット別に操作する。

ユニットは拡張子の違いで判別する。

| ユニットタイプ  | ユニットの拡張子 | 説明                                         |
| --------------- | ---------------- | -------------------------------------------- |
| serviceユニット | `.service`       | プロセス起動停止に関するデーモン。           |
| mountユニット   | `.mount`         | ファイルのマウントに関するデーモン。         |
| socketユニット  | `.socket`        | ソケットとプロセスの紐付けに関するデーモン。 |

> - https://www.kabegiwablog.com/entry/2018/06/11/100000

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

### ユニットファイル

#### ▼ ユニットファイルとは

デーモンの起動/停止方法を定義したファイル。

デフォルト値が定義されたファイルは`/usr/lib/systemd/system`ディレクトリ配下に配置され、これは変更できない。

カスタムユニットファイルは、`/etc/sytemd/system`ディレクトリ配下に配置する。

> - https://tex2e.github.io/blog/linux/create-my-systemd-service
> - https://zaki-hmkc.hatenablog.com/entry/2021/04/11/003202
> - https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/system_administrators_guide/sect-managing_services_with_systemd-unit_file_modify

#### ▼ Unitセクション

ユニットの種類に関係ない全般的なオプションを設定する。

```ini
[Unit]
Description=The Apache HTTP Server
# このユニットの前に実行するユニット
After=network.target remote-fs.target nss-lookup.target
Documentation=man:httpd(8)
Documentation=man:apachectl(8)
# ユニットが失敗状態時に起動するユニット
OnFailure=notify-email@%i.service
```

#### ▼ Serviceセクション

serviceユニットのオプションを設定する。

```ini
[Service]
# デーモンの実行ユーザーを。もし設定しない場合、root権限の実行ユーザーを使用する。
# https://www.golinuxcloud.com/run-systemd-service-specific-user-group-linux/
User=foo
Type=notify
# コマンドの引数 ($OPTIONS変数) を定義したファイルを設定する。
EnvironmentFile=/etc/sysconfig/httpd
# systemctl startコマンド時に実行するコマンド
ExecStart=/usr/sbin/httpd $OPTIONS -DFOREGROUND
# systemctl reloadコマンド時に実行するコマンド
ExecReload=/usr/sbin/httpd $OPTIONS -k graceful
# systemctl stopコマンド時に実行するコマンド
ExecStop=/bin/kill -WINCH ${MAINPID}
KillSignal=SIGCONT
PrivateTmp=true
```

`EnvironmentFile`として使用する`sysconfig`ファイルには、`.env`ファイルと同じような形式のものを作成する。

```bash
OPTIONS=foo
```

> - https://serverfault.com/a/806620

#### ▼ Installセクション

ユニットのインストール (`systemctl enable`コマンドの実行) 時のオプションを設定する。

```ini
[Install]
# シンボリックリンクを作成するディレクトリ (/etc/systemd/system/<設定値>)
WantedBy=multi-user.target
```

<br>

### systemctl

#### ▼ daemon-reload

サーバー内で`/etc/sytemd/system`ディレクトリ配下のカスタムユニットファイルを直接変更した場合に使用する。

全てのデーモンのカスタムユニットファイルを再読み込みする。

ただし、デーモンが既に稼働中の場合は、`systemctl restart`コマンドが別途必要になる。

```bash
$ systemctl daemon-reload
```

> - https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/system_administrators_guide/sect-managing_services_with_systemd-unit_file_modify

#### ▼ disable

OSの起動時に、デーモン化されたプロセスが自動起動しないように設定する。

```bash
$ systemctl disable <ユニット名>

# 例：Cron、Apache
$ systemctl disable crond.service
$ systemctl disable httpd.service
```

#### ▼ enable

OSの起動時に、デーモン化されたプロセスが自動起動するように設定する。

```bash
$ systemctl enable <ユニット名>

# 例：Cron、Apache
$ systemctl enable crond.service
$ systemctl enable httpd.service
```

#### ▼ list-units

デーモン化されたプロセスの稼働状態を一覧を取得する。

`grep`と組み合わせて、起動中 (`active`) 、停止中 (`inactive`) 、起動失敗 (`failed`) のデーモンのみを取得すると良い。

```bash
$ systemctl list-units --type=<ユニットの拡張子>
```

```bash
$ systemctl list-units --type=service | grep active

UNIT                             LOAD    ACTIVE  SUB      DESCRIPTION
abrt-ccpp.service                loaded  active  exited   Install ABRT coredump hook
abrt-oops.service                loaded  active  running  ABRT kernel log watcher
abrtd.service                    loaded  active  running  ABRT Automated Bug Reporting Tool
...
```

```bash
$ systemctl list-units --type=mount | grep active

UNIT                              LOAD   ACTIVE SUB     DESCRIPTION
-.mount                           loaded active mounted /
dev-hugepages.mount               loaded active mounted Huge Pages File System
dev-mqueue.mount                  loaded active mounted POSIX Message Queue File System
...
```

> - https://milestone-of-se.nesuke.com/sv-basic/linux-basic/systemctl/

#### ▼ list-unit-files

デーモン化されたプロセスのUnitの一覧と、OS起動時にデーモンが自動起動するようになっているか否か、を取得する。

```bash
$ systemctl list-unit-files --type=<ユニットの拡張子>
```

```bash
$ systemctl list-unit-files --type=service

UNIT FILE                   STATE
crond.service               enabled  # enable：自動起動する
supervisord.service         disabled # disable：自動起動しない
systemd-reboot.service      static   # enable：他サービス依存
```

```bash
$ systemctl list-unit-files --type=mount

UNIT FILE                     STATE
dev-hugepages.mount           static
dev-mqueue.mount              static
proc-fs-nfsd.mount            static
proc-sys-fs-binfmt_misc.mount static
```

#### ▼ log

`systemctl`コマンドにはログを取得するオプションがないため、代わりに`journalctl`コマンドを使用する。

#### ▼ reload

デーモン化されたプロセスを安全に再起動する。

```bash
$ systemctl reload <ユニット名>
```

```bash
$ systemctl reload nginx.service
```

#### ▼ restart

デーモン化されたプロセスを強制的に再起動する。

```bash
$ systemctl restart <ユニット名>
```

```bash
$ systemctl restart httpd.service
```

```bash
$ systemctl restart nginx.service
```

#### ▼ start

デーモン化されたプロセスを起動する。

```bash
$ systemctl start <ユニット名>
```

```bash
$ systemctl start httpd.service
```

```bash
$ systemctl start nginx.service
```

#### ▼ status

デーモン化されたプロセスの状態を確認する。

```bash
$ systemctl status <ユニット名>
```

```bash
$ systemctl status rsyslog.service

rsyslog.service - System Logging Service
Loaded: loaded (/usr/lib/systemd/system/rsyslog.service; enabled; vendor preset: enabled)
Active: active (running) since Thr 2017-12-07 07:03:21 JST; 8h left
Main PID: 959 (rsyslogd)
CGroup: /system.slice/rsyslog.service
mq959 /usr/sbin/rsyslogd -n
```

> - https://milestone-of-se.nesuke.com/sv-basic/linux-basic/systemctl/

#### ▼ stop

デーモン化されたプロセスを停止する。

```bash
$ systemctl stop <ユニット名>
```

```bash
$ systemctl stop httpd.service
```

```bash
$ systemctl stop nginx.service
```

<br>

### journalctl

#### ▼ journalctlとは

systemで管理する全てのユニットのログを取得する。

`grep`コマンドで特定のエラーログレベルに絞る必要がある。

```bash
$ journalctl | grep error
```

> - https://qiita.com/aosho235/items/9fbff75e9cccf351345c

#### ▼ -u

特定のユニットのみのログを取得する。

```bash
$ journalctl -u foo.service | grep error
```

<br>

### systemdのアラート

#### ▼ アラートを直接的に通知する場合

デーモンが失敗状態になった時に、メールアドレスやチャット宛にアラートを直接的に送信するためには、`OnFailure`オプションを使用する。

この時に指定するユニットファイル名には、「`@%i`』が必要である (実際のファイル名に`%i`は不要である) 。

```ini
[Unit]

...

# ユニットが失敗状態時に起動するユニット
OnFailure=notify-email@%i.service
```

`/etc/systemd/system/notify-email@.service`ファイルで、失敗状態時に起動するユニットを定義しておく。`ExecStart`オプションで、特定のアドレスにメールを送信する。

```ini
# notify-email@.serviceファイル
[Unit]
Description=Sent email

[Service]
Type=oneshot
ExecStart=/usr/bin/bash -c \
    'systemctl status %i | /mailx -Ssendwait -s "[SYSTEMD_%i] Fail" example@gmail.com'

[Install]
WantedBy=multi-user.target
```

> - https://serverfault.com/a/924434
> - https://northernlightlabs.se/2014-07-05/systemd-status-mail-on-unit-failure.html

#### ▼ アラートを間接的に通知する場合

デーモンが失敗状態になった時に、出力したログを使用してアラートを送信するためには、`StandardOutput`オプションや`StandardError`オプションを使用する。

一度、ログとして出力し、このログをCloudWatchログなどに送信する。

```ini
[Service]

...

StandardOutput=file:/var/log/foo-service/stdout.log
StandardError=file:/var/log/foo-service/stderr.log
```

> - https://gist.github.com/adam-hanna/06afe09209589c80ba460662f7dce65c

<br>

## 04. xclip

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install xclip
```

```bash
$ apt-get install xclip
```

#### ▼ yumリポジトリから

```bash
$ yum install -y xclip
```

<br>

### xclipとは

標準出力/標準エラー出力の内容をコピーし、メモリ上に保持する。

> - https://linux.die.net/man/1/xclip

<br>

### -selection

#### ▼ -selectionとは

コピーした内容を保持する場所を選択する。

> - https://linuxfan.info/xclip

**＊例＊**

ファイルの内容を、メモリ上のクリップボードにコピーする。

```bash
$ cat foo.txt | xclip -selection clipboard
```

**＊例＊**

コマンドの実行結果を、メモリ上のクリップボードにコピーする。

```bash
$ ls -la | xclip -selection clipboard
```

#### ▼ -o

保持した内容をファイルに出力する。

**＊例＊**

クリップボードの内容をファイルに出力する。

```bash
$ xclip -selection clipboard -o > foo.txt
```

> - https://linuxfan.info/xclip

<br>
