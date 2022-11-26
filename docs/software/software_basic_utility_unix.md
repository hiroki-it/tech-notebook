---
title: 【IT技術の知見】UNIX系標準ユーティリティ＠ユーティリティ
description: UNIX系標準ユーティリティ＠ユーティリティの知見を記録しています。
---

# UNIX系標準ユーティリティ＠ユーティリティ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## chmod：change mode

### ```<数字>```

ファイルの権限を変更する。よく使用されるパーミッションのパターンは次の通り。

```bash
$ chmod 600 <ファイルへのパス>
```

<br>

### -R ```<数字>```

ディレクトリ内のファイルに対して、再帰的に権限を付与する。ディレクトリ名にスラッシュをつける必要がある。

> ℹ️ 参考：http://raining.bear-life.com/linux/chmod%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%80%81%E3%83%87%E3%82%A3%E3%83%AC%E3%82%AF%E3%83%88%E3%83%AA%E3%81%AE%E3%83%91%E3%83%BC%E3%83%9F%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E5%A4%89%E6%9B%B4

```bash
$ chmod -R 600 <ディレクトリ名>/
```

<br>

### 100番刻みの規則性

所有者以外に全権限が与えられない。

| 数字 | 所有者 | グループ | その他 | 特徴                |
|:----:|:-------|:-----|:-----|-------------------|
| 500  | r-x    | ---  | ---  | 所有者以外に全権限なし |
| 600  | rw-    | ---  | ---  | 所有者以外に全権限なし |
| 700  | rwx    | ---  | ---  | 所有者以外に全権限なし |

<br>

### 111番刻みの規則性

全てのパターンで同じ権限になる。

| 数字 | 所有者 | グループ | その他 | 特徴             |
|:----:|:-------|:-----|:-----|----------------|
| 555  | r-x    | r-x  | r-x  | 全てにWrite権限なし  |
| 666  | rw-    | rw-  | rw-  | 全てにExecut権限なし |
| 777  | rwx    | rwx  | rwx  | 全てに全権限あり     |

<br>

### その他でよく使用する番号

| 数字 | 所有者 | グループ | その他 | 特徴                           |
|:----:|:-------|:-----|:-----|------------------------------|
| 644  | rw-    | r--  | r--  | 所有者以外にWrite、Execute権限なし |
| 755  | rwx    | r-x  | r-x  | 所有者以外にWrite権限なし         |

<br>

### go

現在の```chmod```コマンドの実行者以外に認可スコープを付与する。

> ℹ️ 参考：http://www.damp.tottori-u.ac.jp/~ooshida/unix/chmod.html

```bash
$ chmod go+r <ファイルへのパス>
```

<br>

## chown

### chownとは

ユーザー所有権、グループ所有権、を変更する。

> ℹ️ 参考：https://webkaru.net/linux/chown-command/

```bash
$ chown <ユーザー所有権>:<グループ所有権> <ファイル名>
```

**＊実行例＊**

ユーザー所有権を```foo```に、グループ所有権を```bar```に変更する。

```bash
$ chown foo:foo bar.txt
```

<br>

### -R

ディレクトリと、ディレクトリ内のファイルの所有権を再帰的に変更する。

```bash
$ chown foo:foo ./bar -R
```

<br>

## cp

### -Rp

ディレクトリの属性情報も含めて、ディレクトリとファイルを再帰的にコピーする。

```bash
$ cp -Rp /<ディレクトリ名1>/<ディレクトリ名2> /<ディレクトリ名1>/<ディレクトリ名2>
```

```bash
# 隠しファイルも含めて、ディレクトリの中身を他のディレクトリ内にコピー
# 『アスタリスク』でなく『ドット』にする
$ cp -Rp /<ディレクトリ名>/ /<ディレクトリ名> 
```

<br>

### -p

『```<ファイルへのパス>.YYYYmmdd```』の形式でバックアップファイルを作成する。

```bash
$ cp -p <コピー元ファイルへのパス> <コピー先ファイルへのパス>.`date +"%Y%m%d"`
```

<br>

## cron

### cronとは

UNIXにて、Linuxの能力の一つであるジョブ管理を実現する。あらかじめ、ジョブ（定期的に実行するように設定されたバッチ処理）を登録しておき、指定したスケジュールに従って、ジョブを実行する。

<br>

### ```cron```ファイル

```bash
# /etc/cron.hourly/cron-hourly.txt
# バッチ処理を、毎時・1分ごとに実行するように設定する。
1 * * * * root run-parts /etc/cron.hourly
# <- 最後は改行する。
```

| ディレクトリ名                | 利用者 | 主な用途                          |
|-------------------------|--------|-------------------------------|
| ```/etc/crontab```      | root   | 任意のcronファイルを配置するディレクトリ       |
| ```/etc/cron.hourly```  | root   | 毎時実行されるcronファイルを配置するディレクトリ |
| ```/etc/cron.daily```   | root   | 毎日実行されるcronファイルを配置するディレクトリ |
| ```/etc/cron.monthly``` | root   | 毎月実行されるcronファイルを配置するディレクトリ |
| ```/etc/cron.weekly```  | root   | 毎週実行されるcronファイルを配置するディレクトリ |

**＊実装例＊**

（１）あらかじめ、各ディレクトリにcronファイルを配置しておく。

（２）ジョブを登録するファイルを作成する。```run-parts```コマンドで、指定した時間に、各cronディレクトリ内の```cron```ファイルを一括で実行するように記述しておく。

```bash
# 設定
SHELL=/bin/bash
PATH=/sbin:/bin:/usr/sbin:/usr/bin
MAILTO="example@gmail.com"
LANG=ja_JP.UTF-8
LC_ALL=ja_JP.UTF-8
CONTENT_TYPE=text/plain; charset=UTF-8

# For details see man 4 crontabs

# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name command to be executed

# ジョブ
1 * * * * root run-parts /etc/cron.hourly # 毎時・1分
5 2 * * * root run-parts /etc/cron.daily # 毎日・2時5分
20 2 * * 0 root run-parts /etc/cron.weekly # 毎週日曜日・2時20分
40 2 1 * * root run-parts /etc/cron.monthly # 毎月一日・2時40分
@reboot make clean html # cron起動時に一度だけ
```


<br>

### ```cron.d```ファイル

複数の```cron```ファイルで全ての1つのディレクトリで管理する場合に使用する。

| ディレクトリ名          | 利用者 | 主な用途                               |
|-------------------|--------|------------------------------------|
| ```/etc/cron.d``` | root   | 上記以外の自動タスク設定ファイルを配置するディレクトリ |

<br>

## crond

### crondとは

cronデーモンを起動するためのプログラムである。語尾の『```d```』は、デーモンの意味である。

<br>

### -n

フォアグラウンドプロセスとしてcronを起動する。

```bash
$ crond -n
```

<br>

## crontab

### crontabとは

crontabファイルを操作するためのユーティリティ。作成した```cron```ファイルを登録できる。```cron.d```ファイルは操作できない。

```bash
$ crontab <ファイルへのパス>
```

**＊実装例＊**

（１）拡張子は自由で、時刻とコマンドが実装されたファイルを用意する。この時、最後に改行がないとエラー（```premature EOF```）になるため、改行を追加する。

```bash
# /etc/cron.hourly/cron-hourly.txt
# 毎時・1分
1 * * * * root run-parts /etc/cron.hourly
# <- 最後は改行する。
```

```bash
# /etc/cron.daily/cron-daily.txt
# 毎日・2時5分
5 2 * * * root run-parts /etc/cron.daily
# <- 最後は改行する。                         
```

```bash
# /etc/cron.monthly/cron-monthly.txt
# 毎週日曜日・2時20分
20 2 * * 0 root run-parts /etc/cron.weekly
# <- 最後は改行する。
```

```bash
# /etc/cron.weekly/cron-weekly.txt
# 毎月一日・2時40分
40 2 1 * * root run-parts /etc/cron.monthly
# <- 最後は改行する。
```

```bash
# cron起動時に一度だけ
@reboot make clean html
# <- 最後は改行する。
```

（２）このファイルを```crontab```コマンドで登録する。cronファイルの実体はないことと、ファイルの内容を変更した場合は登録し直さなければいけないことに注意する。

```bash
$ crontab /etc/cron.hourly/cron-hourly.txt
```

（３）登録されている処理を取得する。

```bash
$ crontab -l

1 * * * * root run-parts /etc/cron.hourly/cron.hourly
```

（４）ログに表示されているか否かを確認する。

```bash
$ cd /var/log

$ tail -f cron
```

（５）改行コードを確認。改行コードが表示されない場合はLFであり、問題ない。

```bash
$ file /etc/cron.hourly/cron-hourly.txt

foo.txt: ASCII text
```

<br>

### -e

エディタを開き、登録済みのcronファイルを変更/削除する。

> ℹ️ 参考：https://nontitle.xyz/archives/1065

```bash
$ crontab -e

# 登録されたcronファイルが表示されるため、変更/削除する。
1 * * * * rm foo
```

<br>

### -l

登録済みのcronファイルの一覧を表示する。

```bash
$ crontab -l

# crontabコマンドで登録されたcronファイルの処理
1 * * * * rm foo
```

<br>

## curl

### curlとは

GETリクエストを送信する。```jq```コマンドを使用すると、レスポンスを整形できる。

**＊例＊**

```bash
$ curl -X GET https://example.com/foo/1 | jq . 
```

<br>

### -d

メッセージボディを設定する。

**＊例＊**

```bash
$ curl -X POST -H "Content-Type:application/json" -d '{}' https://example.com/foo
```

<br>

### -k

SSL証明書のエラーを無視する。オレオレ証明書を使用している場合に、以下のようなエラーでHTTPSプロトコルで通信できないため、これを無視する。

```bash
$ curl https://*.*.*.* -H 'Host:example.com'

curl: (60) SSL certificate problem: self signed certificate
More details here: https://curl.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.

# kオプションを有効化する。
$ curl https://*.*.*.* -k -H 'Host:example.com'
```


<br>

### -L

指定したURLでリダイレクトが行われても、リダイレクト後のURLからファイルをインストールする。

**＊例＊**

```bash
$ curl -L https://example.com/foo
```

<br>

### -o（小文字）

インストール後のファイル名を定義する。これを指定しない場合、```-O```オプションを有効化する必要がある。

**＊例＊**

```bash
$ curl -o <ファイルへのパス> https://example.com
```

<br>

### -O（大文字）

インストール後のファイル名はそのままでインストールする。これを指定しない場合、```-o```オプションを有効化する必要がある。

<br>

### --resolve

ドメインとIPアドレスを紐付け、指定した名前解決を行いつつ、```curl```コマンドを実行する。

```bash
$ curl --resolve <ドメイン名>:<ポート番号>:<IPアドレス> https://example.com
```

**＊例＊**

リクエストの名前解決時に、```example.com```を正引きすると```127.0.0.1```が返却されるようにする。

```bash
$ curl --resolve example.com:80:127.0.0.1 https://example.com
```

<br>

### -v

HTTPリクエストの詳細な情報を出力する。

```bash
$ curl -v https://example.com
```

<br>

### -X

HTTPメソッドを設定する。

**＊例＊**

```bash
$ curl -X GET https://example.com
```

<br>

## df

### dfとは

パーティションの状態をデバイスファイル名で取得する。パーティションで区切られたストレージのうち、マウントされているもののみを取得する。

**＊例＊**

```bash
$ df

Filesystem      512-blocks      Used Available Capacity iused      ifree %iused  Mounted on
/dev/disk1s1s1   976490576  44424136 671194960     7%  559993 4881892887    0%   /
devfs                  393       393         0   100%     681          0  100%   /dev
/dev/disk1s5     976490576  10485816 671194960     2%       5 4882452875    0%   /System/Volumes/VM
/dev/disk1s3     976490576    774096 671194960     1%    1648 4882451232    0%   /System/Volumes/Preboot
/dev/disk1s6     976490576    224048 671194960     1%     450 4882452430    0%   /System/Volumes/Update
/dev/disk1s2     976490576 247856952 671194960    27% 1367035 4881085845    0%   /System/Volumes/Data
map auto_home            0         0         0   100%       0          0  100%   /System/Volumes/Data/home
/dev/disk1s1     976490576  44424136 671194960     7%  553759 4881899121    0%   /System/Volumes/Update/mnt1
/dev/disk2s1        610224    421128    189096    70%     360 4294966919    0%   /Volumes/Kindle
/dev/disk3s1        188336    149544     38792    80%     735 4294966544    0%   /Volumes/Amazon Chime

```

<br>

### -h、-m、-t

ストレージの使用状況をメガバイトで取得する。

```bash
# h：--human-readable
# t：--total
$ df -h -m -t
```

<br>

### fdiskとの違い

類似する```df```コマンドでは、パーティションで区切られたストレージのうちでマウントされたもののみを取得する。一方で```fdisk```コマンドでは、マウントされているか否かに関わらず、パーティションで区切られた全てのストレージを取得する。

> ℹ️ 参考：https://stackoverflow.com/questions/16307484/difference-between-df-h-and-fdisk-command

<br>

## diff

### diffとは

テキストファイルの内容を比較する。別途、```colordiff```パッケージを入れると見やすくなる。

> ℹ️ 参考：https://kimuson.dev/blog/shell/color_diff/

<br>

### -u

プラスとマイナスで差分を取得する。

```bash
$ diff -u foo.txt bar.txt
```


<br>

## du

### duとは

指定したディレクトリ内のサブディレクトリのサイズ、ディレクトリ全体の合計サイズ（KB）、を取得する。

```bash
# 表示結果をサイズの降順に並び替える。
$ du ./ | sort -n

21816   ./vendor/foo/bar/baz/qux
27004   ./vendor/foo/bar/baz
27036   ./vendor/foo/bar
27604   ./vendor/foo
115104  ./vendor
123016  ./
```

<br>

### -h

読みやすい単位で、指定したディレクトリ内のサブディレクトリのサイズ、ディレクトリ全体の合計サイズ（KB）、を再帰的に取得する。ただし、細かい数値が省略されてしまうため、より正確なサイズを知りたい場合は、```-h```オプションを使用しないようにする。

> ℹ️ 参考：https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/6/html/deployment_guide/s2-sysinfo-filesystems-du

```bash
$ du -h ./

21K   ./vendor/foo/bar/baz/qux # 読みやすいが、細かい数値は省略されてしまう。
27K   ./vendor/foo/bar/baz
27K   ./vendor/foo/bar
27K   ./vendor/foo
1.1M  ./vendor
1.2M  ./
```

<br>

### --max-depth=1

再帰的にディレクトリのサイズを取得する時に、階層の深さを設定する。

```bash
$ du -h ./vendor/foo --max-depth=1

27K   ./vendor/foo
26K   ./vendor/foo2
29K   ./vendor/foo3
1.1M  ./vendor
```

<br>

### -s

指定したディレクトリ内の合計サイズ（KB）を取得する。

> ℹ️ 参考：https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/6/html/deployment_guide/s2-sysinfo-filesystems-du

```bash
$ du -s ./

12345678 ./
```

<br>

## echo

### echoとは

定義されたシェル変数を出力する。変数名には```$```マークを付ける。ダブルクオートはあってもなくても良い。

```bash
$ <変数名>=<値>

$ echo $<変数名>

$ echo "$<変数名>"
```

<br>

## export

### exportとは

基本的な手順としては、シェル変数を設定し、これを環境変数に追加する。シェル変数と環境変数については、以下のリンクを参考にせよ。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_utility_shell.html

```bash
# シェル変数を設定
$ PATH=$PATH:<バイナリファイルへのあるディレクトリへの絶対パス>
# 環境変数に追加
$ export PATH
```

シェル変数の設定と、環境変数への追加は、以下の通り同時に記述できる。

```bash
# 環状変数として、指定したバイナリファイル（bin）のあるディレクトリへの絶対パスを追加。
# バイナリファイルを入力すると、絶対パス
$ export PATH=$PATH:<バイナリファイルへのあるディレクトリへの絶対パス>
```

```bash
# 不要なパスを削除したい場合はこちら
# 環状変数として、指定したバイナリファイル（bin）のあるディレクトリへの絶対パスを上書き
$ export PATH=/sbin:/bin:/usr/sbin:/usr/bin
```

<br>

### ```/home/centos/.bashrc```ファイル

OSを再起動すると、```export```コマンドの結果は消去されてしまう。そのため、再起動時に自動的に実行されるよう、```.bashrc```ファイルに追記しておく。

```bash
# Source global definitions
if [ -f /etc/bashrc ]; then
  . /etc/bashrc
fi

# User specific environment
PATH="$HOME/.local/bin:$HOME/bin:$PATH"

# fooバイナリファイルのパスを追加 を追加 <--- ここに追加
PATH=$PATH:/usr/local/sbin/foo

export PATH

# Uncomment the following line if you don"t like systemctl"s auto-paging feature:
# export SYSTEMD_PAGER=

# User specific aliases and functions
```

<br>

## fdisk

### -l

パーティションの一覧を取得する。

> ℹ️ 参考：
>
> - https://qiita.com/aosho235/items/ad9a4764e77ba43c9d76#%E3%83%87%E3%82%A3%E3%82%B9%E3%82%AF%E3%83%91%E3%83%BC%E3%83%86%E3%82%A3%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E6%83%85%E5%A0%B1%E3%82%92%E8%AA%BF%E3%81%B9%E3%82%8B
> - https://atmarkit.itmedia.co.jp/ait/articles/1610/24/news017.html#sample1

```bash
$ fdisk -l

ディスク /dev/vda: 20 GiB, 21474836480 バイト, 41943040 セクタ
単位: セクタ (1 * 512 = 512 バイト)
セクタサイズ (論理 / 物理): 512 バイト / 512 バイト
I/O サイズ (最小 / 推奨): 512 バイト / 512 バイト
ディスクラベルのタイプ: gpt
ディスク識別子: 301D27AA-0BF9-4B81-9B4A-3138251A4FD7

# パーティションの情報
デバイス   開始位置 最後から セクタ サイズ タイプ                 UUID
/dev/vda1      2048   206847   204800   100M Linux ファイルシステム 56713D43-4900-46EB-92D5-1D09C9449B11
/dev/vda2    206848  4401151  4194304     2G Linux スワップ         D156FFCF-97DE-45EB-A6B0-21A9B876129A
/dev/vda3   4401152 41943006 37541855  17.9G Linux ファイルシステム C7A19722-4C31-4646-8ED4-DD4D86EFBC50
```

<br>

## file

### fileとは

ファイルの改行コードを取得する。

```bash
# LFの場合（何も表示されない）
$ file foo.txt
foo.txt: ASCII text

# CRLFの場合
$ file foo.txt
foo.txt: ASCII text, with CRLF line terminators

# CRの場合
$ file foo.txt
foo.txt: ASCII text, with CR line terminators<br>
```

<br>

## find

### -type

ファイルを検索するためのユーティリティ。アスタリスクを付けなくとも、自動的にワイルドカードが働く。

```bash
$ find ./* -type f | xargs grep "<検索文字>"
```

```bash
# パーミッションエラーなどのログを破棄して検索。
$ find ./* -type f | xargs grep "<検索文字>" 2> /dev/null
```

<br>

### -name

ファイル名が```.conf```で終わるものを全て検索する。

```bash
$ find ./* -name "*.conf" -type f
```

名前が dir で終わるディレクトリを全て検索する。

```bash
$ find ./* -name "*dir" -type d
```

ルートディレクトリ配下で、 ```<検索文字> ```という文字をもち、ファイル名が```.conf```で終わるファイルを全て検索する。

```bash
$ find ./* -name "*.conf" -type f | xargs grep "<検索文字>"
```

指定した拡張子のファイルを全て削除する。

```bash
$ find ./* -name "*.txt" -type f | xargs rm -rf
```

<br>

## free

### -m、--t

物理メモリ、スワップ領域、の使用状況をメガバイトで取得する。

```bash
# m：--mega
# t：--total
$ free -m --t

              total        used        free      shared  buff/cache   available
Mem:          15387        2682        6672           1        6032       12459
Swap:             0           0           0
```

メモリ使用率は、以下の計算式で算出できる。

> ℹ️ 参考：https://support.site24x7.com/portal/en/kb/articles/how-is-the-total-memory-utilization-calculated-for-a-linux-server-monitor

```mathematica
メモリ使用率 =
( ( Total - Free ) / Total * 100 ) =
((15387 - 12459) / 15387) * 100 = 19 %
```

<br>

## grep

### grepとは

標準出力に出力された文字列のうち、合致するもののみを取得する。文字列の表示に関する様々なユーティリティ（例：```ls```、```cat```、```find```、など）と組み合わせられる。

```bash
$ cat foo.txt | grep bar
```

```bash
$ cat foo.txt | grep bar
```

```grep```コマンドを忘れると、後続のコマンドに取得内容をパラメーターとして渡すことになるが、これで問題が起こることがある...

> ℹ️ 参考：https://zenn.dev/kobayashiyabako/articles/85902e6095ab0cdb7cf5

<br>

### -A、-B、-C

標準出力に出力された文字列のうち、周辺（以降、以前、前後）の数行を取得する。

```bash
# 以降5行
$ cat foo.txt | grep bar -A 5
```
```bash
# 以前5行
$ cat foo.txt | grep bar -B 5
```
```bash
# 前後5行
$ cat foo.txt | grep bar -C 5
```

<br>

### -e

標準出力に出力された文字列のうち、複数の文字列を取得する。

```bash
$ cat foo.txt | grep -e bar -e baz
```

<br>

### -i

標準出力に出力された文字列のうち、大文字と小文字を区別せずに、合致するもののみを取得する。

```bash
$ cat foo.txt | grep -i bar
```

<br>

## history

### historyとは

指定した履歴数でコマンドを取得する。

```bash
$ history 100
```

履歴1000件の中からコマンドを検索する。

```bash
$ history 1000 | grep <過去のコマンド>
```

<br>

## iptables

### iptablesとは

iptablesの設定を取得/変更する。


<br>

### サブコマンド

#### ▼ -L（--list）

全てのChainのルールの一覧を取得する。

> ℹ️ 参考：https://xtech.nikkei.com/it/article/COLUMN/20140512/556022/

```bash
$ iptables -L

Chain PREROUTING (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         

...

Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         

...

Chain POSTROUTING (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         

...

Chain OUTPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination 

...
```

Chain名を指定することもできる。

```bash
$ iptables -L <Chain名>
```

#### ▼ -S

全てのChainのルールをコマンド形式で取得する。

> ℹ️ 参考：https://xtech.nikkei.com/it/article/COLUMN/20140512/556022/

```bash
$ iptables -S

-P PREROUTING ACCEPT
-P INPUT ACCEPT
-P POSTROUTING ACCEPT
-P OUTPUT ACCEPT

...
```


<br>

### オプション

#### ▼ --line-number

Chain内の各ルールを番号付きで取得する。

> ℹ️ 参考：http://redcinfo-c.blogspot.com/2010/09/iptables.html

```bash
$ iptables --line-number
```

#### ▼ -t（--table）

指定したテーブル（```filter```、```nat```、```mangle```、```Raw```）を持つChainのみを取得する。

> ℹ️ 参考：https://xtech.nikkei.com/it/article/COLUMN/20140512/556022/

```bash
$ iptables -L -t nat
```

#### ▼ -n（--numeric）

ChainのIPアドレスを名前解決せずに、IPアドレスのまま取得する。

> ℹ️ 参考：https://xtech.nikkei.com/it/article/COLUMN/20140512/556022/

```bash
$ iptables -L -n
```

#### ▼ -v

Chain内のルールを詳しく取得する。


> ℹ️ 参考：https://xtech.nikkei.com/it/article/COLUMN/20140512/556022/

```bash
$ iptables -L -v
```


<br>

## less

### lessとは

標準出力への出力内容が膨大な場合に、ページングしながら出力する。出力内容が大きい場合に『```...```』を出力してしまうようなツールにも有用である。

```bash
$ cat foo.txt | less
```

<br>

## ln

### シンボリックリンクとは

ファイルやディレクトリのショートカットのこと。シンボリックリンクに対する処理は、リンク先のファイルやディレクトリに転送される。


<br>

### -s

カレントディレクトリ配下に、シンボリックリンクを作成する。リンクの元になるディレクトリやパスを指定する。

```bash
$ ln -s <リンク先までのパス> <シンボリックリンク名> 
```

<br>

## kill

### -9

指定したPIDのプロセスを削除する。

```bash
$ kill -9 <プロセスID>
```

指定したコマンドによるプロセスを全て削除する。

```bash
$ sudo pgrep -f <コマンド名> | sudo xargs kill -9
```

<br>

## logrotate

### logrotateとは

ファイルには```2```GBを超えてテキストを書き込めない。そのため、ログを継続的にファイルに書き込む場合は、定期的に、書き込み先を新しいファイルに移行する必要がある。ローテションされた過去のログファイルでは、ファイル名の末尾に最終日付（例：```-20220101```）をつけておく。

> ℹ️ 参考：
>
> - http://proger.blog10.fc2.com/blog-entry-66.html
> - https://milestone-of-se.nesuke.com/sv-basic/linux-basic/logrotate/

<br>

## ls

### -1

ファイル名のみを一列で取得する。

```bash
$ ls -1

foo
bar
baz
qux
```


<br>

### -l、-a

隠しファイルや隠しディレクトリも含めて、全ての詳細を取得する。

```bash
$ ls -l -a

-rw-r--r--  1 root   8238708 Jun 19 20:18 foo
-rw-r--r--  1 root     20734 Jun 19 20:18 bar
-rw-r--r--  1 root 266446929 Jun 19 20:18 baz
-rw-r--r--  1 root 174540990 Jun 19 20:18 qux
```


<br>

### -h

ファイルサイズをわかりやすい単位で取得する。ディレクトリのサイズは取得できない。

```bash
$ ls -l -h

-rw-r--r-- 1 root root 7.9M Jun 19 20:18 foo
-rw-r--r-- 1 root root 21K  Jun 19 20:18 bar
-rw-r--r-- 1 root root 255M Jun 19 20:18 baz
-rw-r--r-- 1 root root 167M Jun 19 20:18 qux
```

<br>

## lsblk

### lsblkとは

ストレージ上にある、物理ボリューム、パーティション、論理ボリューム、を取得する。個別に取得したければ、物理ボリュームは```pvdisplay```コマンド、パーティションは```fdisk```コマンド、論理ボリュームは```lvdisplay```コマンド、で確認する。

```bash
$ lsblk

NAME          MAJ:MIN RM   SIZE  RO  TYPE  MOUNTPOINT
xvda          202:0    0    16G   0  disk             # ストレージ
└─xvda1       202:1    0     8G   0  part  /          # パーティション
  ├─root      253:0    0     5G   0   lvm  /          # 論理ボリューム
  └─swap      253:1    0     3G   0   lvm  [SWAP]
nvme1n1       259:1    0   200G   0  disk  /var/lib   # ストレージ
```

<br>

## lsof：List open file

### -i、-P

使用中のポートをプロセス別に取得する。

```bash
$ lsof -i -P | grep LISTEN

phpstorm   4145 hasegawa   25u  IPv6 *****      0t0  TCP localhost:6942 (LISTEN)
phpstorm   4145 hasegawa   27u  IPv6 *****      0t0  TCP localhost:63342 (LISTEN)
com.docke 46089 hasegawa   63u  IPv6 *****      0t0  TCP *:3500 (LISTEN)
com.docke 46089 hasegawa   75u  IPv4 *****      0t0  TCP localhost:6443 (LISTEN)
com.docke 46089 hasegawa   78u  IPv6 *****      0t0  TCP *:8500 (LISTEN)
com.docke 46089 hasegawa   80u  IPv6 *****      0t0  TCP *:3000 (LISTEN)
LINE      48583 hasegawa    7u  IPv4 *****      0t0  TCP localhost:10400 (LISTEN)
Google    93754 hasegawa  140u  IPv4 *****      0t0  TCP localhost:56772 (LISTEN)
minikube  97246 hasegawa   19u  IPv4 *****      0t0  TCP 192.168.64.1:50252 (LISTEN)
```

<br>

## lvdisplay

論理ボリュームの一覧を取得する。

> ℹ️ 参考：
>
> - https://atmarkit.itmedia.co.jp/flinux/rensai/linuxtips/a065lvminfo.html
> - https://centossrv.com/lvm-extend.shtml

```bash
$ lvdisplay

  --- Logical volume ---
  LV Name               /dev/VolGroup00/LogVol00
  VG Name               VolGroup00
  LV UUID               m2sx31-yglu-wjsG-yqq0-WPPn-3grk-n2LJBD
  LV Write Access       read/write
  LV Status             available
  # open                1
  LV Size               230.81 GB
  Current LE            7386
  Segments              1
  Allocation            inherit
  Read ahead sectors    0
  Block device          253:0

  --- Logical volume ---
  LV Name               /dev/VolGroup00/LogVol01
  VG Name               VolGroup00
  LV UUID               VR4EHJ-mpxW-uadd-CpTX-lEyz-2OEU-0TyYDn
  LV Write Access       read/write
  LV Status             available
  # open                1
  LV Size               1.94 GB
  Current LE            62
  Segments              1
  Allocation            inherit
  Read ahead sectors    0
  Block device          253:1
```

<br>

## lvextend

### lvextendとは

論理ボリュームに紐づくデバイスファイルを指定し、論理ボリュームのサイズを拡張する。

> ℹ️ 参考：https://centossrv.com/lvm-extend.shtml


<br>

### -l

指定した条件で、論理ボリュームを拡張する。

> ℹ️ 参考：https://takuya-1st.hatenablog.jp/entry/2017/01/16/182756

**＊例＊**

パーティションの空き領域の100%を使用して拡張する。

```bash
$ lvextend -l +100%FREE <デバイスファイル名>
```

50G分の領域を拡張する。

```bash
$ lvextend -l +50G <デバイスファイル名>
```


**＊例＊**

あらかじめ、論理ボリュームに紐づくデバイスファイル名を確認する。

```bash
$ lvdisplay

--- Logical volume ---
LV Name               /dev/VolGroup00/LogVol00
VG Name               VolGroup00
LV UUID               m2sx31-yglu-wjsG-yqq0-WPPn-3grk-n2LJBD
LV Write Access       read/write
LV Status             available
# open                1
LV Size               230.81 GB
Current LE            7386
Segments              1
Allocation            inherit
Read ahead sectors    0
Block device          253:0
```

論理ボリュームのサイズを拡張する。

```bash
# 空き領域の100%を使用して拡張する。
$ lvextend -l +100%FREE /dev/VolGroup00/LogVol00
```

<br>

## mkdir

### -p

複数階層のディレクトリを作成する。

```bash
$ mkdir -p /<ディレクトリ名1>/<ディレクトリ名2>
```

<br>

## mkswap、swapon、swapoff

### スワッピング方式

物理メモリのアドレス空間管理の方法の一種。

![スワッピング方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スワッピング方式.png)


<br>

### スワップ領域の作成方法

```bash
# 指定したディレクトリをスワップ領域として使用
$ mkswap /swap_volume
```

```bash
# スワップ領域を有効化
# 優先度のプログラムが、メモリからディレクトリに、一時的に退避されるようになる
$ swapon /swap_volume
```

```bash
# スワップ領域の使用状況を確認
$ swapon -s
```

```bash
# スワップ領域を無効化
$ swapoff /swap_volume
```

<br>

## mount

### mountとは

指定したデバイスファイルを、これに紐づくディレクトリ（マウントポイント）にマウントする。

> ℹ️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/1802/15/news035.html
> - https://atmarkit.itmedia.co.jp/ait/articles/1802/23/news024.html

```bash
$ mount -t /dev/sdb1 <マウントポイントとなるディレクトリ>
```


<br>

### -t

マウントのファイル共有システムの種類を設定する。種類によって、パラメーターの入力方法が異なる。

> ℹ️ 参考：
>
> - https://docs.oracle.com/cd/E19455-01/806-2717/6jbtqleh6/index.html
> - https://webkaru.net/linux/mount-command/

NFSによるマウントを実行する。

```bash
$ mount -t nfs <NFSサーバーのホスト名>:<マウント元ディレクトリ> <マウント先ディレクトリ>
```

<br>

## nc：netcat

### ncとは

指定したIPアドレス/ドメインに、TCPプロトコルでパケットを送信する。

> ℹ️ 参考：https://qiita.com/chenglin/items/70f06e146db19de5a659

```bash
$ nc <IPアドレス/ドメイン> <ポート番号>
```


<br>

### -v

ログを出力しつつ、```nc```コマンドを実行する。

```bash
$ nc -v <IPアドレス/ドメイン> <ポート番号>
```

パケットに```9000```番ポートに送信する。

```bash
$ nc -v 127.0.0.1 9000

# 失敗の場合
nc: connect to 127.0.0.1 port 9000 (tcp) failed: Connection refused

# 成功の場合
Connection to 127.0.0.1 9000 port [tcp/*] succeeded!
```

<br>

## od：octal dump

### odとは

ファイルを8進数の機械語で出力する。

```bash
$ od <ファイルへのパス>
```

<br>

### -Ad、-tx

ファイルを16進数の機械語で出力する。

```bash
$ od -Ad -tx <ファイルへのパス>
```

<br>

## opsnssl

### opsnsslとは

指定した暗号化アルゴリズムを使用して、文字列を暗号化/復号化する。

> ℹ️ 参考：https://memo.open-code.club/OpenSSL/%E3%81%AF%E3%81%98%E3%82%81%E3%81%AB/%E5%85%B1%E9%80%9A%E9%8D%B5%E6%9A%97%E5%8F%B7.html

<br>

### enc

#### ▼ -d

指定したアルゴリズムを使用して、文字列を復号化する。

> ℹ️ 参考：https://www.karakaram.com/file-encryption-using-openssl/

```bash
$ opsnssl enc -aes-256-cbc -d -in encrypted.txt -out plane.txt
```

#### ▼ -e

指定したアルゴリズムを使用して、文字列を暗号化する。

> ℹ️ 参考：https://www.karakaram.com/file-encryption-using-openssl/

```bash
$ opsnssl enc -aes-256-cbc -e -in plan.txt -out encrypted.txt
```

<br>

### list-cipher-algorithms

#### ▼ list-cipher-algorithmsとは

使用できる暗号化アルゴリズムの一覧を取得する。

> ℹ️ 参考：https://en.wikipedia.org/wiki/OpenSSL#Algorithms

```bash
$ openssl list-cipher-algorithms

AES-128-CBC
AES-128-CFB
AES-128-CFB1

...

RC4
RC4-40
RC4-HMAC-MD5
```

よく使用するAES-256アルゴリズムは、以下の通りである。

```bash
$ openssl list-cipher-algorithms | grep AES-256

AES-256-CBC
AES-256-CFB
AES-256-CFB1
AES-256-CFB8
AES-256-CTR
AES-256-ECB
AES-256-OFB
AES-256-XTS
AES256 => AES-256-CBC
AES-256-CBC
AES-256-CFB
AES-256-CFB1
AES-256-CFB8
AES-256-CTR
AES-256-ECB
AES-256-OFB
AES-256-XTS
aes256 => AES-256-CBC
```

<br>

### x509

#### ▼ -dates

証明書の有効期限を取得する。

> ℹ️ 参考：https://pcvogel.sarakura.net/2019/01/07/31902

```bash
$ openssl x509 -noout -dates -in foo.crt

notBefore=Dec  9 09:31:55 2020 GMT # 開始日
notAfter=Jan 10 09:31:55 2022 GMT  # 終了日
```

<br>

## printenv

### printenvとは

全ての環境変数を取得する。

```bash
$ printenv
```

また、特定の環境変数を取得する。

```bash
$ printenv VAR
```

<br>

## ps： process status

### psとは

プロセスを取得する。

<br>

### -aux

稼働しているプロセスの詳細情報を表示するためのユーティリティ。

```bash
# 稼働しているプロセスのうち、詳細情報に『xxx』を含むものを取得する。
$ ps -aux | grep <検索文字>
```

<br>


## rm

### -rf

トレイリングスラッシュなしの場合、ディレクトリ自体と中のファイルを再帰的に削除する。

```bash
$ rm -rf <ディレクトリ名>
```

トレイリングスラッシュとワイルドカードありの場合、ディレクトリ内のみを削除する。

```bash
$ rm -rf <ディレクトリ名>/*/*
```

<br>

## sed

### -i -e ```s/<置換前>/<置換後>/g```

文字列を置換する。また、```-i```オプションで元のファイルを上書きする。```find```コマンドと組み合わせて、特定のファイルのみで実行できるようにすると良い。複数の置換を実行する場合は、```-e```オプションを並べる。

```bash
$ find ./* \
    -name "*.md" \
    -type f | xargs sed -i -e 's/、/、/g' -e 's/。/。/g'
```

スラッシュを含む文字列を置換する場合には、スラッシュをエスケープする必要である。

```bash
$ find ./* \
    -name "*.md" \
    -type f | xargs sed -i -e 's/foo\/bar/FooBar/g'
```

ちなみにMacOSで```-i```オプションを使用する場合は、オプションの引数に空文字を渡す必要がある。

```bash
# MacOSの場合
$ find ./* \
    -name "*.md" \
    -type f | xargs sed -i '' -e 's/foo\/bar/FooBar/g'
```


<br>

### ```1s/^```

ファイルの一行目にテキストを追加する。

> ℹ️ 参考：https://stackoverflow.com/questions/9533679/how-to-insert-a-text-at-the-beginning-of-a-file

```bash
find ./* \
  -name "*.md" \
  -type f | xargs sed -i '1s/^/一行目にFooを挿入して改行\n\n/'
```

```bash
# MacOSの場合
find ./* \
  -name "*.md" \
  -type f | xargs sed -i '' '1s/^/一行目にFooを挿入して改行\n\n/'
```

<br>

## service

アプリケーション系ミドルウェア（PHP-FPM、uWSGI）、Web系ミドルウェア（Apache、Nginx）、データ収集系エージェント（datadogエージェント、cloudwatchエージェント）などで様々なデーモンの操作に使用される。ただし、デーモン自体もコマンドを提供しているため、できる限りデーモンを使用する。

<br>

## set

### setとは

現在設定されているシェル変数の一覧を取得する。

```bash
$ set
```


<br>

### -n

シェルスクリプトの構文解析を行う。

```bash
$ set -n
```


<br>

### -e

一連の処理の途中で```0```以外の終了ステータスが出力された場合、全ての処理を途中終了する。

```bash
$ set -e
```


<br>

### -x

一連の処理をデバッグ情報として出力する。

```bash
$ set -x
```


<br>

### -u

一連の処理の中で、未定義の変数が存在した場合、全ての処理を途中終了する。

```bash
$ set -u
```

### -o pipefail

パイプライン（```|```）内の一連の処理の途中で、エラーが発生した場合、その終了ステータスを出力し、全ての処理を途中終了する。

```bash
$ set -o pipefail
```

<br>

## ssh：secure shell

### -l、-p、```<ポート番号>```、-i、-T

事前に、秘密鍵の権限は『```600```』にしておく。tty（擬似ターミナル）を使用する場合は、```-T```オプションをつける。

```bash
$ ssh -l <サーバーのユーザー名>@<サーバーのホスト名> -p 22 -i <秘密鍵へのパス> -T
```

<br>

### -l、-p、```<ポート番号>```、-i、-T、-vvv

```bash
# -vvv：ログを出力する
$ ssh -l <サーバーのユーザー名>@<サーバーのホスト名> -p 22 -i <秘密鍵へのパス> -T -vvv
```

<br>

### ```~/.ssh/config```ファイル

設定が面倒な```ssh```コマンドのオプションの引数を、```~/.ssh/config```ファイルに記述しておく。

```bash
# サーバー１
Host <接続名1>
    User <サーバー１のユーザー名>
    Port 22
    HostName <サーバー１のホスト名>
    IdentityFile <秘密鍵へのパス>

# サーバー２
Host <接続名２>
    User <サーバー２のユーザー名>
    Port 22
    HostName <サーバー２のホスト名>
    IdentityFile <秘密へのパス>
```

これにより、コマンド実行時の値渡しを省略できる。tty（擬似ターミナル）を使用する場合は、-Tオプションをつける。

```bash
# 秘密鍵の権限は、事前に『600』にしておく
$ ssh <接続名> -T
```

<br>

## strace

### straceとは

ユーティリティによるシステムコールをトレースする。

```bash
$ strace <任意のユーティリティ>
```

<br>

### -c

システムコールごとに情報を取得する。

```bash
# curlコマンドのシステムコールをトレースする。
$ strace -c curl -s -o /dev/null https://www.google.com/

% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 17.15    0.010642          76       139           mmap
 16.64    0.010329         120        86         2 read
 16.64    0.010326         137        75           rt_sigaction

...

  0.08    0.000048          24         2         2 access
  0.00    0.000000           0         1           execve
------ ----------- ----------- --------- --------- ----------------
100.00    0.062070                   584        12 total
```

<br>

### -e

トレースの内容をフィルタリングし、取得する。

```bash
# ネットワークに関する情報のみを取得する。
$ strace -e trace=network curl -s -o /dev/null https://www.google.com/    

socket(AF_INET6, SOCK_DGRAM, IPPROTO_IP) = 3
socket(AF_INET, SOCK_STREAM, IPPROTO_TCP) = 3
setsockopt(3, SOL_TCP, TCP_NODELAY, [1], 4) = 0

...

sin_addr=inet_addr("*.*.*.*")}, [128->16]) = 0
getsockname(3, {sa_family=AF_INET, sin_port=htons(60714), sin_addr=inet_addr("*.*.*.*")}, [128->16]) = 0

+++ exited with 0 +++
```

<br>

### -p

ユーティリティがすでに実行途中の場合、プロセスIDを指定してシステムコールをトレースする。

> ℹ️ 参考：https://tech-lab.sios.jp/archives/17394

```bash
$ strace -p <プロセスID>
```

<br>

## tail

### tailとは

指定したファイルの最終行から数行を取得する。全てを取得する```cat```コマンドとは異なり、巨大なファイル（例：ログ）の内容を取得するために使用する。

> ℹ️ 参考：https://eng-entrance.com/linux-command-tail

```bash
$ tail foo.log
```

<br>

### -f

テキストのリアルタイムな追記に追従しながら、内容を取得する。

```bash
$ tail -f foo.log
```

<br>

## tar

### -x

圧縮ファイルを解凍する。

```bash
$ tar -xf foo.tar.gz
```

<br>

### -f

圧縮ファイル名を指定する。これを付けない場合、テープドライブが指定される。

```bash
$ tar -xf foo.tar.gz
```

<br>

### -v

解凍中のディレクトリ/ファイルの作成ログを取得する。

```bash
$ tar -xvf foo.tar.gz

./
./opt/
./opt/foo/
./opt/foo/bar/
./opt/foo/bar/install.sh
./opt/foo/bar/baz/
./opt/foo/bar/baz/init.sh
```

<br>

### -g

圧縮ファイル（```.gzip```形式）を解凍する。ただし、デフォルトで有効になっているため、オプションは付けないくても問題ない。

```bash
$ tar -zxf foo.tar.gz
```

<br>

## timedatactl

### timedatactlとは

タイムゾーンを操作する。

<br>

### set-timezone

```bash
# タイムゾーンを日本時間に変更
$ timedatectl set-timezone Asia/Tokyo

# タイムゾーンが変更されたかを確認
$ date
```

<br>


## top

### topとは

各プロセスの稼働情報（ユーザー名、CPU、メモリ）を取得する。 CPU使用率昇順に並べる

```bash
$ top
```

<br>

### -a

メモリ使用率昇順に取得する。

```bash
$ top -a
```

<br>

## tr

### trとは

指定した文字列をトリミングする。

```bash
#!/bin/bash

cat ./src.txt | tr "\n" "," > ./dst.txt
```

<br>


## unlink

### unlinkとは

カレントディレクトリのシンボリックリンクを削除する。

```bash
$ unlink <シンボリックリンク名>
```

<br>

## vim：Vi Imitaion、Vi Improved

### vimとは

ファイルを開き、編集する。

```bash
$ vim <ファイルへのパス>
```
