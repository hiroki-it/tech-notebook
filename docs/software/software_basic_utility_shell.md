---
title: 【知見を記録するサイト】シェル＠ユーティリティ
description: シェル＠ユーティリティの知見をまとめました．
---

# シェル＠ユーティリティ

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. シェルとは

### 仕組み

標準入力からの入力を解釈し，カーネルを操作する．また，カーネルの処理結果を解釈し，標準出力/標準エラー出力に出力する．基本的には，いずれのシェルも同じ仕組みである．

参考：http://www.cc.kyoto-su.ac.jp/~hirai/text/shell.html

![shell](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/shell.png)

<br>

### シェルの系譜

参考：https://kengoyamamoto.com/%E3%83%A1%E3%82%B8%E3%83%A3%E3%83%BC%E3%81%AAshell%E3%81%AE%E7%A8%AE%E9%A1%9E%E3%81%BE%E3%81%A8%E3%82%81/

![shell_history](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/shell_history.png)

<br>

### 変数

#### ▼ 変数スコープと親子プロセス

シェルでは，変数のスコープがプロセスの親子関係によって決まる．

参考：https://qiita.com/kure/items/f76d8242b97280a247a1

![shell_variable_scope](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/shell_variable_scope.png)

#### ▼ シェル変数

現在実行中のプロセスでのみ有効な変数のこと．そのため，```source```コマンド以外の方法で実行されたシェルスクリプトでは，親プロセスで定義されたシェル変数を使用できない．

参考：https://qiita.com/kure/items/f76d8242b97280a247

```bash
#!/bin/bash
# foo.shファイル
echo ${FOO}
```

```bash
$ FOO=foo # シェル変数を定義する．

$ bash foo.sh
# 出力されない
```

#### ▼ 環境変数

現在実行中のプロセスと，その子プロセスでも有効な変数のこと．そのため，シェルスクリプトの実行コマンドに限らず用いることができる．

参考：https://qiita.com/kure/items/f76d8242b97280a247a1

```bash
#!/bin/bash
# foo.shファイル
echo ${FOO}
```

```bash
$ export FOO=foo # 環境変数を定義する．

$ bash foo.sh
foo # 出力される
```

<br>

## 02. セットアップ

### インストール

#### ▼ Apk経由

ほとんどのOSではデフォルトでインストールされているが，Alpine Linuxではシェル以外を別途インストールが必要である．

```bash
$ apk add bash
```

<br>



## 03. 入力と出力

### 標準入出力

#### ▼ 標準入出力とは

標準入力/標準出力/標準エラー出力，のこと．

![stdin_stdout_stderr](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/stdin_stdout_stderr.jpg)

#### ▼ stdin（標準入力）

キーボードからのコマンドに対して，データを入力するためのインターフェースのこと．プロセスごとに存在する．

#### ▼ stdout（標準出力）

コマンドからターミナルに対して，エラー以外のデータを出力するためのインターフェースのこと．プロセスごとに存在する．

#### ▼ stderr（標準エラー出力）

コマンドからターミナルに対して，エラーデータを出力するためのインターフェースのこと．プロセスごとに存在する．

<br>

### 出力方法

#### ▼ 標準出力に全て出力

コマンド処理の後に，『```2>&1```』を追加すると，標準エラー出力への出力を標準出力にリダイレクトすることにより，処理の全ての結果を標準出力に出力できるうになる．

参考：https://teratail.com/questions/1285



```bash
$ echo "text" 2>&1
```

また，プロセスの標準出力は```/proc/<プロセスID>/fd```ディレクトリのファイルディスクリプタ番号（１番）で確認できる．プロセスIDは```ps```コマンドで事前に確認する．



PHP-FPMの稼働するアプリケーションの例

```bash
$ ps -aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.6  83736 25408 ?        Ss   01:56   0:03 php-fpm: master process (/usr/local/etc/php-fpm.conf)
www-data  2739  3.6  0.7 247968 29296 ?        Sl   13:24   1:36 php-fpm: pool www
www-data  2815  3.6  0.7 247968 29288 ?        Sl   13:43   0:55 php-fpm: pool www
www-data  2902  3.6  0.7 247968 29304 ?        Sl   14:05   0:07 php-fpm: pool www
root      2928  0.0  0.0   9732  3316 pts/0    R+   14:08   0:00 ps -aux

# 標準出力を確認
$ cat /proc/1/fd/1
```

参考：https://debimate.jp/2020/07/04/%e8%b5%b7%e5%8b%95%e6%b8%88%e3%81%bf%e3%83%97%e3%83%ad%e3%82%bb%e3%82%b9%ef%bc%88%e4%be%8b%ef%bc%9a%e3%83%87%e3%83%bc%e3%83%a2%e3%83%b3%e3%83%97%e3%83%ad%e3%82%bb%e3%82%b9%ef%bc%89%e3%81%ae%e6%a8%99/

#### ▼ 標準エラー出力に全て出力

コマンド処理の後に，『```1>&2```』を追加すると，標準出力への出力を標準エラー出力にリダイレクトすることにより，処理の全ての結果を標準エラー出力に出力できるうになる．

参考：https://teratail.com/questions/1285

```bash
$ echo "text" 1>&2
```

また，プロセスの標準出力は```/proc/<プロセスID>/fd```ディレクトリのファイルディスクリプタ番号（２番）で確認できる．プロセスIDは```ps```コマンドで事前に確認する．



PHP-FPMの稼働するアプリケーションの例

```bash
$ ps -aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.6  83736 25408 ?        Ss   01:56   0:03 php-fpm: master process (/usr/local/etc/php-fpm.conf)
www-data  2739  3.6  0.7 247968 29296 ?        Sl   13:24   1:36 php-fpm: pool www
www-data  2815  3.6  0.7 247968 29288 ?        Sl   13:43   0:55 php-fpm: pool www
www-data  2902  3.6  0.7 247968 29304 ?        Sl   14:05   0:07 php-fpm: pool www
root      2928  0.0  0.0   9732  3316 pts/0    R+   14:08   0:00 ps -aux

# 標準エラー出力を確認
$ cat /proc/1/fd/2
```

参考：https://debimate.jp/2020/07/04/%e8%b5%b7%e5%8b%95%e6%b8%88%e3%81%bf%e3%83%97%e3%83%ad%e3%82%bb%e3%82%b9%ef%bc%88%e4%be%8b%ef%bc%9a%e3%83%87%e3%83%bc%e3%83%a2%e3%83%b3%e3%83%97%e3%83%ad%e3%82%bb%e3%82%b9%ef%bc%89%e3%81%ae%e6%a8%99/

#### ▼ 標準出力とファイルに出力

パイプラインで```tee```コマンドを繋ぐと，標準出力とファイルの両方に出力できる．

参考：https://glorificatio.org/archives/2903

```bash
$ echo "text" | tee stdout.log
```

<br>

## 04. リダイレクト

### リダイレクトとは

『```<```，```>```』『```<<```，```>>```』の記号のこと．ファイルの内容を特定のプロセスの標準入力に転送する．特定のプロセスの標準出力/標準エラー出力をファイルに転送する．プロセスの標準入力への転送は，多くの場合にユーティリティのパラメーターにファイルを渡すことと同じである．

参考：

- https://qiita.com/r18j21/items/0e7d0e48c02d14ed9893
- https://e-yota.com/webservice/shellscript_stdin_stdout_stderr_symbol/

<br>

### 標準入力へのリダイレクト例

#### ▼ catプロセスへのリダイレクト

catプロセスの標準入力に```stdin.txt```ファイルの内容をリダイレクトする．```cat```コマンドにファイルを渡すことと同じである．

```bash
$ cat < stdin.txt
Hello World
```

<br>

### ファイルへのリダイレクト例

▼ リダイレクトによるファイル作成

リダイレクト前に```stdout.txt```ファイルを新しく作成し，echoプロセスの標準出力をこれにリダイレクトする．

```bash
$ echo 'Hello World' > stdout.txt
```

リダイレクト前に```stderr.txt```ファイルを新しく作成し，lsプロセスの標準出力をこれにリダイレクトする．

```bash
$ ls foo 2> stderr.txt

$ cat error.txt
ls: cannot access foo: No such file or directory
```

#### ▼ リダイレクトによるファイル追記

echoプロセスの標準出力を既存の```stdout.txt```ファイルにリダイレクトし，また追記する．

```bash
$ echo 'Hello World' >> stdout.txt
```

#### ▼ リダイレクトによるファイル上書き（再作成）

リダイレクト前に```stdout.txt```ファイルを新しく作成し，echoプロセスの標準出力をこれにリダイレクトする．また，すでにファイルが存在している場合は，ファイルを上書き（再作成）する．

```bash
$ echo 'Hello World' >| stdout.txt
```

<br>

## 05. パイプライン

### パイプラインとは

『```|```』の縦棒記号のこと．特定のプロセスの標準出力/標準エラー出力を他のプロセスの標準入力に繋げる．

![pipeline](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/pipeline.png)

シェルは，プロセスの処理結果をパイプラインに出力する．その後，パイプラインから出力内容をそのまま受け取り，別のプロセスに再び入力する．

参考：http://www.cc.kyoto-su.ac.jp/~hirai/text/shell.html

![pipeline_shell](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/pipeline_shell.png)

<br>

### 標準入力への入力例

#### ▼ awkプロセスへの入力

コマンドの出力結果に対して，```awk```コマンドを行う．

検索されたファイルの容量を合計する．

```bash
$ find ./* -name "*.js" -type f -printf "%s\n" | awk "{ sum += $1; } END { print sum; }"
$ find ./* -name "*.css" -type f -printf "%s\n" | awk "{ sum += $1; } END { print sum; }"
$ find ./* -name "*.png" -type f -printf "%s\n" | awk "{ sum += $1; } END { print sum; }"
```

#### ▼ echoプロセスへの入力

終了ステータスを```echo```コマンドに渡し，値を出力する．

```bash
$ <任意のコマンド> | echo $?
```

#### ▼ grepプロセスへの入力

コマンドの出力結果を```grep```コマンドに渡し，フィルタリングを行う．

検索されたファイル内で，さらに文字列を検索する．

```bash
$ find ./* \
  -type f | xargs grep "<検索文字>"
```

#### ▼ killプロセスへの入力

コマンドの出力結果に対して，```kill```コマンドを行う．

フィルタリングされたプロセスを削除する．

```bash
$ sudo pgrep \
  -f <コマンド名> | sudo xargs kill -9
```

#### ▼ sortプロセスへの入力

コマンドの出力結果に対して，並び順を変更する．

表示された環境変数をAZ昇順に並び替える．

```bash
$ printenv | sort -f
```

<br>

## 06. 終了ステータス

### 終了ステータスとは

プロセスは別の新しいプロセスを作成できる．子プロセスの終了時に，親プロセスに終了ステータス（```0```〜```255```）が返却される．

参考：https://en.wikipedia.org/wiki/Exit_status

<br>

### 種類

参考：

- https://tldp.org/LDP/abs/html/exitcodes.html
- https://qiita.com/Linda_pp/items/1104d2d9a263b60e104b

| 値            | 意味                                      | エラーの原因                                                 | 発生例                                                 |
| ------------- | ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| ```0```       | 正常な完了                                | -                                                            | -                                                      |
| ```1```       | 一般的なエラー                            | 構文エラーではないが，ロジックが誤っている可能性がある．     | ```$ let "var 1 = 1 / 0"```                            |
| ```2```       | シェルビルトインな機能の誤用              | シェルの構文や権限が誤っている可能性がある．                 | ```$ empty_function(){}```                             |
| ```126```     | 呼び出したコマンドが実行できなかった時    | 権限やその他の理由でコマンドを実行できてない可能性がある．   | ```$ /dev/null```                                      |
| ```127```     | コマンドが見つからない時                  | バイナリファイルの```$PATH```の未設定や，コマンドのタイポの可能性がある． | ```$ illegal_command```                                |
| ```128```     | ```exit``` コマンドに不正な引数を渡した時 | ```exit``` コマンドに0〜255以外の整数を渡している可能性がある． | `$ exit 3.14159`                                       |
| ```128 + n``` | シグナル ```n```で致命的なエラー          | killがシグナル```n```で実行された可能性がある．              | ```$ kill -9 $PPID```<br>（```128 + 9 = 137```で終了） |
| ```128 + 2``` | スクリプトが ```Ctrl+C```で終了           | ```Ctrl+C```はシグナル```2```で終了するため，```Ctrl+C```が実行された可能性がある．（```128 + 2 = 130```） | Ctrl+C                                                 |
| ```255```     | 範囲外の終了ステータス                    | ```exit```コマンドに0〜255以外の整数を渡している可能性がある． | ```$ exit -1```                                        |
