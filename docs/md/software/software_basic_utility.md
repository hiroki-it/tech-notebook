# ユーティリティ（サービスプログラム）

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. ユーティリティの種類

### Unixの場合

このノートにまとめる（RedHat系とDebian系のユーティリティを別々に整理したい...）

<br>

### Windowsの場合

Windowsは、GUIでユーティリティを用いる。よく使うものを記載する。

| システム系         | ストレージデバイス管理系 | ファイル管理系         | その他             |
| ------------------ | ------------------------ | ---------------------- | ------------------ |
| マネージャ         | デフラグメントツール     | ファイル圧縮プログラム | スクリーンセーバー |
| クリップボード     | アンインストーラー       | -                      | ファイアウォール   |
| レジストリクリーナ | -                        | -                      | -                  |
| アンチウイルス     | -                        | -                      | -                  |

<br>

## 02. ユーティリティのバイナリファイルの場所

### ディレクトリとバイナリファイルの種類

| バイナリファイルのディレクトリ | 配置されているバイナリファイルの種類                         |
| ------------------------------ | ------------------------------------------------------------ |
| ```/bin```                     | Unixユーティリティのバイナリファイルの多く。                 |
| ```/usr/bin```                 | 管理ユーティリティによってインストールされるバイナリファイルの多く。 |
| ```/usr/local/bin```           | Unix外のソフトウェアによってインストールされたバイナリファイル。最初は空になっている。 |
| ```/sbin```                    | Unixユーティリティのバイナリファイルうち、```sudo```権限が必要なもの。 |
| ```/usr/sbin```                | 管理ユーティリティによってインストールされたバイナリファイルのうち、```sudo```権限が必要なもの。 |
| ```/usr/local/sbin```          | Unix外のソフトウェアによってインストールされたバイナリファイルのうち、```sudo```権限が必要なもの。最初は空になっている。 |

### バイナリファイルの場所の探し方

```bash
# バイナリファイルが全ての場所で見つからないエラー
$ which python3
which: no python3 in (/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin)

# バイナリファイルの場所
$ which python3 
/usr/bin/python3
```

<br>

## 03. ユーティリティ

### chmod：change mode

#### ・<数字>

ファイルの権限を変更する。よく用いられるパーミッションのパターンは次の通り。

```bash
$ chmod 600 <ファイル名>
```

#### ・-R <数字>

ディレクトリ内のファイルに対して、再帰的に権限を付与する。

```bash
$ chmod -R 600 <ディレクトリ名>
```

#### ・100番刻みの規則性

所有者以外に全権限が与えられない。

| 数字 | 所有者 | グループ | その他 | 特徴                   |
| :--: | :----- | :------- | :----- | ---------------------- |
| 500  | r-x    | ---      | ---    | 所有者以外に全権限なし |
| 600  | rw-    | ---      | ---    | 所有者以外に全権限なし |
| 700  | rwx    | ---      | ---    | 所有者以外に全権限なし |

#### ・111番刻みの規則性

全てのパターンで同じ権限になる。

| 数字 | 所有者 | グループ | その他 | 特徴                 |
| :--: | :----- | :------- | :----- | -------------------- |
| 555  | r-x    | r-x      | r-x    | 全てにWrite権限なし  |
| 666  | rw-    | rw-      | rw-    | 全てにExecut権限なし |
| 777  | rwx    | rwx      | rwx    | 全てに全権限あり     |

#### ・その他でよく使う番号

| 数字 | 所有者 | グループ | その他 | 特徴                               |
| :--: | :----- | :------- | :----- | ---------------------------------- |
| 644  | rw-    | r--      | r--    | 所有者以外にWrite、Execute権限なし |
| 755  | rwx    | r-x      | r-x    | 所有者以外にWrite権限なし          |

#### ・go

現在の```chmod```コマンドの実行者以外にアクセス権限を付与する。

参考：http://www.damp.tottori-u.ac.jp/~ooshida/unix/chmod.html

```bash
$ chmod go+r <ファイル名>
```

<br>

### cp

#### ・-Rp

ディレクトリの属性情報も含めて、ディレクトリ構造とファイルを再帰的にコピー。

```bash
$ cp -Rp /<ディレクトリ名1>/<ディレクトリ名2> /<ディレクトリ名1>/<ディレクトリ名2>
```

```bash
# 隠しファイルも含めて、ディレクトリの中身を他のディレクトリ内にコピー
# 『アスタリスク』でなく『ドット』にする
$ cp -Rp /<ディレクトリ名>/ /<ディレクトリ名> 
```

#### ・-p

『```<ファイル名>.YYYYmmdd```』の形式でバックアップファイルを作成

```bash
$ cp -p <ファイル名> <ファイル名>.`date +"%Y%m%d"`
```

<br>

### cron

#### ・cronとは

指定したスケジュールに従って、指定されたプログラムを定期実行する常駐プログラム。

#### ・```cron```ファイル

| ファイル名<br>ディレクトリ名 | 利用者 | 主な用途                                               |
| ---------------------------- | ------ | ------------------------------------------------------ |
| ```/etc/crontab```           | root   | 毎時、毎日、毎月、毎週の自動タスクのメイン設定ファイル |
| ```/etc/cron.hourly```       | root   | 毎時実行される自動タスク設定ファイルを置くディレクトリ |
| ```/etc/cron.daily```        | root   | 毎日実行される自動タスク設定ファイルを置くディレクトリ |
| ```/etc/cron.monthly```      | root   | 毎月実行される自動タスク設定ファイルを置くディレクトリ |
| ```/etc/cron.weekly```       | root   | 毎週実行される自動タスク設定ファイルを置くディレクトリ |

**＊実装例＊**

（１）あらかじめ、各ディレクトリにcronファイルを配置しておく。

（２）cronとして登録するファイルを作成する。```run-parts```コマンドで、指定した時間に、各cronディレクトリ内の```cron```ファイルを一括で実行するように記述しておく。

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

# run-parts
1 * * * * root run-parts /etc/cron.hourly # 毎時・1分
5 2 * * * root run-parts /etc/cron.daily # 毎日・2時5分
20 2 * * 0 root run-parts /etc/cron.weekly # 毎週日曜日・2時20分
40 2 1 * * root run-parts /etc/cron.monthly # 毎月一日・2時40分
@reboot make clean html # cron起動時に一度だけ
```


#### ・cron.dファイル

複数の```cron```ファイルで全ての1つのディレクトリで管理する場合に用いる。

| ディレクトリ名    | 利用者 | 主な用途                                           |
| ----------------- | ------ | -------------------------------------------------- |
| ```/etc/cron.d``` | root   | 上記以外の自動タスク設定ファイルを置くディレクトリ |

<br>

### crond

#### ・crondとは

cronデーモンを起動するためのプログラム

#### ・-n

フォアグラウンドプロセスとしてcronを起動

```bash
$ crond -n
```

<br>

### crontab

#### ・crontabとは

cronデーモンの動作が定義されたcrontabファイルを操作するためのユーティリティ。

#### ・オプション無し

作成した```cron```ファイルを登録する。```cron.d```ファイルは操作できない。

```bash
$ crontab <ファイルパス>
```

#### ・登録されたcronファイルの処理を確認

```bash
$ crontab -l

# crontabコマンドで登録されたcronファイルの処理
1 * * * * rm foo
```

#### ・```cron```ファイルの登録手順

**＊実装例＊**

１. 拡張子は自由で、時刻とコマンドが実装されたファイルを用意する。この時、最後に改行がないとエラー（```premature EOF```）になるため、改行を追加する。

参考：

```bash
# cron-hourly.txt
# 毎時・1分
1 * * * * root run-parts /etc/cron.hourly
# <- 最後は改行する。
```

```bash
# cron-daily.txt
# 毎日・2時5分
5 2 * * * root run-parts /etc/cron.daily
# <- 最後は改行する。                         
```

```bash
# cron-monthly.txt
# 毎週日曜日・2時20分
20 2 * * 0 root run-parts /etc/cron.weekly
# <- 最後は改行する。
```

```bash
# cron-weekly.txt
# 毎月一日・2時40分
40 2 1 * * root run-parts /etc/cron.monthly
# <- 最後は改行する。
```

```bash
# cron起動時に一度だけ
@reboot make clean html
# <- 最後は改行する。
```

２. このファイルをcrontabコマンドで登録する。cronファイルの実体はないことと、ファイルの内容を変更した場合は登録し直さなければいけないことに注意する。

```bash
$ crontab /foo/cron-hourly.txt
```

３. 登録されている処理を表示する。

```bash
$ crontab -l

1 * * * * root run-parts /etc/cron.hourly
```

４. ログに表示されているかを確認する。

```bash
$ cd /var/log

$ tail -f cron
```

５. 改行コードを確認。改行コードが表示されない場合はLFであり、問題ない。

```bash
$ file /foo/cron-hourly.txt

foo.txt: ASCII text
```

<br>

### curl

#### ・オプション無し

GETリクエストを送信する。```jq```コマンドを用いると、レスポンスを整形できる。

```bash
$ curl https://example.com/foos/1 | jq . 
```

#### ・-L

指定したURLでリダイレクトが行われても、リダイレクト後のURLからファイルをインストールする。

```bash
$ curl -L https://example.com/foos
```

#### ・-o（小文字）

インストール後のファイル名を定義する。これを指定しない場合、```-O```オプションを有効化する必要がある。

```bash
$ curl -o <ファイル名> https://example.com
```

#### ・-O（大文字）

インストール後のファイル名はそのままでインストールする。これを指定しない場合、```-o```オプションを有効化する必要がある。

#### ・--resolve

ドメインとIPアドレスを紐付け、指定した名前解決を行いつつ、```curl```コマンドを実行する。

```bash
$ curl --resolve <ドメイン名>:<ポート番号>:<IPアドレス> https://example.com
```

**＊実装例＊**

リクエストの名前解決時に、```example.com```を正引きすると```127.0.0.1```が返却されるようにする。

```bash
$ curl --resolve example.com:80:127.0.0.1 https://example.com
```

#### ・-X、-T、-d

Content-Typeを指定して、POSTリクエストを送信する。

```bash
$ curl -X POST -H "Content-Type: application/json" -d '{}' https://example.com/foos
```

#### 

<br>

### df

#### ・オプション無し

パーティションで区切られたストレージのうち、マウントされているもののみを表示する。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/software/software_basic_kernel.html

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

#### ・-h、-m、-t

ストレージの使用状況をメガバイトで表示する。

```bash
# h：--human-readable
# t: -total
$ df -h -m -t
```

#### ・fdiskとの違い

類似する```df```コマンドでは、パーティションで区切られたストレージのうちでマウントされたもののみを表示する。一方で```fdisk```コマンドでは、マウントされているか否かに関わらず、パーティションで区切られた全てのストレージを表示する。

参考：https://stackoverflow.com/questions/16307484/difference-between-df-h-and-fdisk-command

<br>

### du

#### ・-s

全てのディレクトリの合計容量を表示する。

```bash
$ du -s ./
12345678 ./
```

#### ・-x

ディレクトリごとに合計容量を表示する。

```bash
# 表示結果を容量の降順に並び替える。
$ du -x ./ | sort -n

# 〜 中略 〜

21816   ./vendor/foo/bar/baz/qux
27004   ./vendor/foo/bar/baz
27036   ./vendor/foo/bar
27604   ./vendor/foo
115104  ./vendor
123016  ./
```

<br>

### echo

#### ・オプション無し

定義されたシェル変数を出力する。変数名には```$```マークを付ける。ダブルクオートはあってもなくてもよい。

```bash
$ <変数名>=<値>

$ echo $<変数名>

$ echo "$<変数名>"
```

<br>

### export

#### ・オプション無し

基本的な手順としては、シェル変数を設定し、これを環境変数に追加する。

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

#### ・```.bashrc```への追記


OSを再起動すると、```export```コマンドの結果は消去されてしまう。そのため、再起動時に自動的に実行されるよう、```/home/centos/.bashrc```ファイルに追記しておく。

```bash
# Source global definitions
if [ -f /etc/bashrc ]; then
	. /etc/bashrc
fi

# User specific environment
PATH="$HOME/.local/bin:$HOME/bin:$PATH"

# xxxバイナリファイルのファイルパスを追加 を追加 <--- ここに追加
PATH=$PATH:/usr/local/sbin/xxxx

export PATH

# Uncomment the following line if you don"t like systemctl"s auto-paging feature:
# export SYSTEMD_PAGER=

# User specific aliases and functions
```

<br>

### fdisk

#### ・-l

パーティションで区切られた全てのストレージを表示する。

<br>

### file

#### ・オプション無し

ファイルの改行コードを表示する。

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

### find

#### ・-type

ファイルを検索するためのユーティリティ。アスタリスクを付けなくとも、自動的にワイルドカードが働く。

```bash
$ find /* -type f | xargs grep "<検索文字>"
```

```bash
# パーミッションエラーなどのログを破棄して検索。
$ find /* -type f | xargs grep "<検索文字>" 2> /dev/null
```

#### ・-name

ファイル名が```.conf``` で終わるものを全て検索する。

```bash
$ find /* -name "*.conf" -type f
```

名前が dir で終わるディレクトリを全て検索する。

```bash
$ find /* -name "*dir" -type d
```

ルートディレクトリ以下で、 ```<検索文字> ```という文字をもち、ファイル名が```.conf```で終わるファイルを全て検索する。

```bash
$ find /* -name "*.conf" -type f | xargs grep "<検索文字>"
```

<br>

### free

#### ・-m、-total

物理メモリ、スワップ領域、の使用状況をメガバイトで表示する。

```bash
# m：Mega Bytes
# t: -total
$ free -m -total
```

<br>

### kill

#### ・-9

指定したPIDのプロセスを削除する。

```bash
$ kill -9 <プロセスID（PID）>
```

指定したコマンドによるプロセスを全て削除する。

```bash
$ sudo pgrep -f <コマンド名> | sudo xargs kill -9
```

<br>

### history

#### ・オプション無し

履歴1000件の中からコマンドを検索する。

```bash
$ history | grep <過去のコマンド>
```

<br>

### ln

####  ・シンボリックリンクとは

ファイルやディレクトリのショートカットのこと。シンボリックリンクに対する処理は、リンク元のファイルやディレクトリに転送される。

#### ・-s

カレントディレクトリに、シンボリックリンクを作成する。リンクの元になるディレクトリやファイルパスを指定する。

```bash
$ ln -s <リンク元までのパス> <シンボリックリンク名> 
```

<br>

### logrotate

#### ・logrotate

ファイルには```2```GBを超えてテキストを書き込めない。そのため、ログを継続的にファイルに書き込む場合は、定期的に、書き込み先を新しいファイルに移行する必要がある。

参考：

- http://proger.blog10.fc2.com/blog-entry-66.html
- https://milestone-of-se.nesuke.com/sv-basic/linux-basic/logrotate/

<br>

### ls

#### ・-l、-a

隠しファイルや隠しディレクトリも含めて、全ての詳細を表示する。

```bash
$ ls -l -a
```

<br>

### lsof：List open file

#### ・-i、-P

使用中のポートをプロセス別に表示する。

```bash
$ lsof -i -P | grep "LISTEN"
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

### mkdir

#### ・-p

複数階層のディレクトリを作成する。

```bash
$ mkdir -p /<ディレクトリ名1>/<ディレクトリ名2>
```

<br>

### mkswap、swapon、swapoff

#### ・スワッピング方式

物理メモリのアドレス空間管理の方法の一種。

![スワッピング方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スワッピング方式.png)

#### ・スワップ領域の作成方法

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

### od：octal dump

#### ・オプション無し

ファイルを8進数の機械語で出力する。

```bash
$ od <ファイル名>
```

#### ・-Ad、-tx

ファイルを16進数の機械語で出力する。

```bash
$ od -Ad -tx <ファイル名>
```

<br>

### printenv

#### ・オプション無し

全ての環境変数を表示する。

```bash
$ printenv
```

また、特定の環境変数を表示する。

```bash
$ printenv VAR
```

<br>

### ps： process status

#### ・-aux

稼働しているプロセスの詳細情報を表示するためのユーティリティ。

```bash
# 稼働しているプロセスのうち、詳細情報に『xxx』を含むものを表示する。
$ ps -aux | grep "<検索文字>"
```

<br>

### rm

#### ・-R

ディレクトリ自体と中のファイルを再帰的に削除する。

```bash
$ rm -R <ディレクトリ名> 
```

<br>

### set

#### ・オプション無し

現在設定されているシェル変数の一覧を表示する。

```bash
$ set
```

#### ・-n

シェルスクリプトの構文解析を行う。

```bash
$ set -n
```

#### ・-e

一連の処理の途中で```0```以外の終了ステータスが出力された場合、全ての処理を終了する。

```bash
$ set -e
```

#### ・-x

一連の処理をデバッグ情報として出力する。

```bash
$ set -x
```

#### ・-u

一連の処理の中で、未定義の変数が存在した場合、全ての処理を終了する。

```bash
$ set -u
```

#### ・-o pipefail

パイプライン（```|```）内の一連の処理の途中で、エラーが発生した場合、その終了ステータスを出力し、全ての処理を終了する。

```bash
$ set -o pipefail
```

<br>

### ssh：secure shell

#### ・-l、-p、<ポート>、-i、-T

事前に、秘密鍵の権限は『```600```』にしておく。tty（擬似ターミナル）を用いる場合は、```-T```オプションをつける。

```bash
$ ssh -l <サーバーのユーザ名>@<サーバーのホスト名> -p 22 -i <秘密鍵のパス> -T
```

#### ・-l、-p、<ポート>、-i、-T、-vvv

```bash
# -vvv：ログを出力する
$ ssh -l <サーバーのユーザ名>@<サーバーのホスト名> -p 22 -i <秘密鍵のパス> -T -vvv
```

#### ・設定ファイル（```~/.ssh/config```）

設定が面倒な```ssh```コマンドのオプションの引数を、```~/.ssh/config```ファイルに記述しておく。

```bash
# サーバー１
Host <接続名1>
    User <サーバー１のユーザ名>
    Port 22
    HostName <サーバー１のホスト名>
    IdentityFile <秘密鍵へのパス>

# サーバー２
Host <接続名２>
    User <サーバー２のユーザ名>
    Port 22
    HostName <サーバー２のホスト名>
    IdentityFile <秘密へのパス>
```

これにより、コマンド実行時の値渡しを省略できる。tty（擬似ターミナル）を用いる場合は、-Tオプションをつける。

```bash
# 秘密鍵の権限は、事前に『600』にしておく
$ ssh <接続名> -T
```

<br>

### tar

#### ・-x

圧縮ファイルを解凍する。

```bash
$ tar -xf foo.tar.gz
```

#### ・-f

圧縮ファイル名を指定する。これを付けない場合、テープドライブが指定される。

```bash
$ tar -xf foo.tar.gz
```

#### ・-v

解凍中のディレクトリ/ファイルの生成ログを表示する。

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

#### ・-g

gzip拡張子の圧縮ファイルを解凍する。ただし、デフォルトで有効になっているため、オプションは付けないくても問題ない。

```bash
$ tar -zxf foo.tar.gz
```

<br>

### timedatactl

#### ・set-timezone

```bash
# タイムゾーンを日本時間に変更
$ timedatectl set-timezone Asia/Tokyo

# タイムゾーンが変更されたかを確認
$ date
```

<br>


### top

#### ・オプション無し

各プロセスの稼働情報（ユーザ名、CPU、メモリ）を表示する。 CPU使用率昇順に並べる

```bash
$ top
```

#### ・-a

メモリ使用率昇順に表示する。

```bash
$ top -a
```

<br>

### tr

#### ・オプション無し

指定した文字列をトリミングする。

```bash
#!/bin/bash

cat ./src.txt | tr "\n" "," > ./dst.txt
```

<br>

### unlink

#### ・オプション無し

カレントディレクトリのシンボリックリンクを削除する。

```bash
$ unlink <シンボリックリンク名>
```

<br>

### vim：Vi Imitaion、Vi Improved  

#### ・オプション無し

vim上でファイルを開く。

```bash
$ vim <ファイル名>
```

