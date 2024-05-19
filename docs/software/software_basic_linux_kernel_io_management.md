---
title: 【IT技術の知見】I/O (入出力) 管理＠Linuxカーネル
description: I/O (入出力) 管理＠Linuxカーネルの知見を記録しています。
---

# I/O (入出力) 管理＠Linuxカーネル

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. I/Oの意味合い

### I/Oの意味合いの種類

I/Oは、文脈によって意味合いが異なる。

| 文脈                   | 意味合い                             |
| ---------------------- | ------------------------------------ |
| シェルの場合           | 標準入力、標準出力、標準エラー出力   |
| ファイルシステムの場合 | ファイルへの読み書き                 |
| ストレージの場合       | ストレージへの読み書き               |
| ネットワークの場合     | インバウンド通信、アウトバウンド通信 |

> - https://www.idcf.jp/words/io.html
> - https://itkq.jp/blog/2017/05/10/linux-file-and-io/

<br>

### IOPS：I/O per second

ストレージへのI/O (数/毎秒) を表す。

I/O自体が文脈によって意味合いが異なるが、IOPSはストレージの文脈でしか使用しない。

> - https://dev-labo.com/aws/difference-iops-throughput/

<br>

## 02. 標準入出力

### stdin (標準入力)

#### ▼ 標準入力とは

キーボードやプログラムからのコマンドに対して、データを入力するためのインターフェースのこと。

プロセスごとに存在する。

![stdin_stdout_stderr](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/stdin_stdout_stderr.png)

> - http://www.cas.cmc.osaka-u.ac.jp/~paoon/Lectures/2020-7Semester-AppliedMath7/04_standard-io/

<br>

### stdout (標準出力)

#### ▼ 標準出力とは

エラー以外のデータをプログラムや外部デバイスに出力するためのインターフェースのこと。

プロセスごとに存在する。

![stdin_stdout_stderr](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/stdin_stdout_stderr.png)

> - http://www.cas.cmc.osaka-u.ac.jp/~paoon/Lectures/2020-7Semester-AppliedMath7/04_standard-io/

#### ▼ 標準出力に全て出力

コマンド処理の後に、『`2>&1`』を追加すると、標準エラー出力に対する出力を標準出力にリダイレクトすることにより、処理の全ての結果を標準出力に出力できるうになる。

> - https://teratail.com/questions/1285

**＊例＊**

```bash
$ echo "text" 2>&1
```

また、プロセスの標準出力は`/proc/<プロセスID>/fd`ディレクトリのファイルディスクリプタ番号 (`1`番) で確認できる。プロセスIDは`ps`コマンドで事前に確認する。

**＊例＊**

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

> - https://debimate.jp/2020/07/04/%e8%b5%b7%e5%8b%95%e6%b8%88%e3%81%bf%e3%83%97%e3%83%ad%e3%82%bb%e3%82%b9%ef%bc%88%e4%be%8b%ef%bc%9a%e3%83%87%e3%83%bc%e3%83%a2%e3%83%b3%e3%83%97%e3%83%ad%e3%82%bb%e3%82%b9%ef%bc%89%e3%81%ae%e6%a8%99/

#### ▼ 標準出力とファイルに出力

パイプラインで`tee`コマンドを繋ぐと、標準出力とファイルの両方に出力できる。

```bash
$ echo "text" | tee stdout.log
```

> - https://glorificatio.org/archives/2903

<br>

### stderr (標準エラー出力)

#### ▼ 標準エラー出力とは

コマンドからターミナルに対して、エラーデータを出力するためのインターフェースのこと。

プロセスごとに存在する。

#### ▼ 標準エラー出力に全て出力

コマンド処理の後に、『`1>&2` (または`>&2`)』を追加すると、標準出力に対する出力を標準エラー出力にリダイレクトする。

`1`は標準出力であり、`2`は標準エラー出力、を表す。

これにより、処理の全ての結果を標準エラー出力に出力できるうになる。

> - https://teratail.com/questions/1285

```bash
$ echo "text" 1>&2

# または

$ echo "text" >&2
```

また、プロセスの標準出力は`/proc/<プロセスID>/fd`ディレクトリのファイルディスクリプタ番号【２番) で確認できる。プロセスIDは`ps`コマンドで事前に確認する。

**＊例＊**

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

> - https://debimate.jp/2020/07/04/%e8%b5%b7%e5%8b%95%e6%b8%88%e3%81%bf%e3%83%97%e3%83%ad%e3%82%bb%e3%82%b9%ef%bc%88%e4%be%8b%ef%bc%9a%e3%83%87%e3%83%bc%e3%83%a2%e3%83%b3%e3%83%97%e3%83%ad%e3%82%bb%e3%82%b9%ef%bc%89%e3%81%ae%e6%a8%99/

<br>

## 02-02. リダイレクト

### リダイレクトとは

『`<`、`>`』『`<<`、`>>`』の記号のこと。ファイルの内容を特定のプロセスの標準入力に転送する。

あるいは反対に、特定のプロセスの標準出力/標準エラー出力をファイルに転送する。

プロセスの標準入力に対する転送は、多くの場合にユーティリティのパラメーターにファイルを渡すことと同じである。

> - https://qiita.com/r18j21/items/0e7d0e48c02d14ed9893
> - https://e-yota.com/webservice/shellscript_stdin_stdout_stderr_symbol/

<br>

### 標準入力に対するリダイレクト例

#### ▼ catプロセスに対するリダイレクト

catプロセスの標準入力に`stdin.txt`ファイルの内容をリダイレクトする。

`cat`コマンドにファイルを渡すことと同じである。

```bash
$ cat < stdin.txt

Hello World
```

<br>

### ファイルに対するリダイレクト例

#### ▼ `2>`

リダイレクト前に`stdout.txt`ファイルを新しく作成し、`echo`コマンドの標準出力をこれにリダイレクトする。

```bash
$ echo 'Hello World' 2> stdout.txt
```

#### ▼ `>|`

リダイレクト前に`stdout.txt`ファイルを新しく作成し、`echo`コマンドの標準出力をこれにリダイレクトする。

また、すでにファイルが存在している場合は、ファイルを上書き (再作成) する。

```bash
$ echo 'Hello World' >| stdout.txt
```

#### ▼ `>>`

`echo`コマンドの標準出力を既存の`stdout.txt`ファイルにリダイレクトし、加えて追記する。

```bash
$ echo 'Hello World' >> stdout.txt
```

<br>

## 02-03. パイプライン

### パイプラインとは

『`|`』の縦棒記号のこと。特定のプロセスの標準出力/標準エラー出力を他のプロセスの標準入力に繋げる。

![pipeline](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pipeline.png)

シェルは、プロセスの処理結果をパイプラインに出力する。

その後、パイプラインから出力内容をそのまま受け取り、別のプロセスに再び入力する。

![pipeline_shell](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pipeline_shell.png)

> - http://www.cc.kyoto-su.ac.jp/~hirai/text/shell.html

<br>

### 標準入力に対する入力例

#### ▼ awkプロセスに対する入力

コマンドの出力結果に対して、`awk`コマンドを実行する。

**＊例＊**

検索で取得されたファイルのサイズを合計する。

```bash
$ find ./* -name "*.js" -type f -printf "%s\n" \
    | awk "{ sum += $1; } END { print sum; }"

$ find ./* -name "*.css" -type f -printf "%s\n" \
    | awk "{ sum += $1; } END { print sum; }"

$ find ./* -name "*.png" -type f -printf "%s\n" \
    | awk "{ sum += $1; } END { print sum; }"
```

**＊例＊**

パケットのうちで、`443`番ポートに送信しているもののみを取得し、出力結果の３列目のみをフィルタリングする。

```bash
$ tcpdump dst port 443 \
    | awk -F ' ' '{print $3}'

*.*.*.*
*.*.*.*
...
```

> - https://it-ojisan.tokyo/awk-f/

#### ▼ `echo`コマンドに対する入力

終了ステータスを`echo`コマンドに渡し、値を出力する。

```bash
$ <任意のコマンド> | echo $?
```

▼ grepプロセスに対する入力

コマンドの出力結果を`grep`コマンドに渡し、フィルタリングを実行する。

**＊例＊**

検索されたファイル内で、加えて文字列を検索する。

```bash
$ find ./* \
  -type f | xargs grep "<検索文字>"
```

#### ▼ killプロセスに対する入力

コマンドの出力結果に対して、`kill`コマンドを実行する。

**＊例＊**

フィルタリングされたプロセスを削除する。

```bash
$ sudo pgrep \
  -f <コマンド名> | sudo xargs kill -9
```

#### ▼ lessプロセスに対する入力

コマンドの出力情報をページングして取得する。

ファイルの行数が多い場合に役立つ。

| キー       | 説明                                 |
| ---------- | ------------------------------------ |
| `Enter`    | １行送り                             |
| `Space`    | 一ページ送り                         |
| `Ctrl + f` | 一ページ送り                         |
| `Ctrl + b` | 一ページ戻り                         |
| `/文字列`  | 以降の文字を検索し、ハイライトする。 |

> - https://tech.pjin.jp/blog/infra_engneer/more-less/

**＊例＊**

巨大な`.yaml`ファイルをページングして出力する。

```bash
$ cat foo.yaml | less
```

#### ▼ sortプロセスに対する入力

コマンドの出力結果に対して、並び順を変更する。

**＊例＊**

表示された環境変数をAZ昇順に並び替える。

```bash
$ printenv | sort -f
```

**＊例＊**

表示された表を重複を削除して (`uniq`と同じ) AZ昇順に並び替える。

```bash
$ cat table.txt | sort -f -u
```

> - https://academy.gmocloud.com/know/20210625/12063
> - https://atmarkit.itmedia.co.jp/ait/articles/1611/14/news021.html#sample1

#### ▼ uniqプロセスに対する入力

コマンドの出力結果に関して、行が重複する場合は`1`個だけ残して削除する。

隣り合っている重複しか削除できないため、あらかじめ`sort`コマンドを実行しておく必要がある。

```bash
$ tcpdump dst port 443 \
    | awk -F ' ' '{print $3}' >> source_ips.txt

# 必ずsortの結果を渡す
$ cat source_ips.txt \
    | sort | uniq
```

> - https://uxmilk.jp/53546

<br>

## 03. 印刷デバイスへのデータ出力

アプリケーションから印刷デバイスへデータを出力する時、まず、CPUはスプーラにデータを出力する。

Spoolerは、全てのデータをまとめて出力するのではなく、一時的にストレージ (Spool) にためておく。

その後、少しずつ印刷デバイスにデータを出力 (Spooling) し、印刷デバイスにデータを印刷させる。

![スプーリング](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/スプーリング.jpg)

<br>
