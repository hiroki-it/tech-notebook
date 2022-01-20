---
title: 【知見を書きなぐるサイト】シェル
---

# シェル

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. シェルスクリプト

### シェルスクリプトとは

ユーティリティの処理を手続き的に実装したファイル．

<br>

### ロジック

#### ・シェバン

最初の『```#!```』をシェバンという．

```bash
#!/bin/bash

echo "foo"
echo "bar"
echo "baz"
```

#### ・ヒアドキュメント

ヒアドキュメントで作成したシェルスクリプトには，各行にechoが追加される．

```bash
#!/bin/bash

cat << EOF > "echo.sh"
#!/bin/bash
hoge
fuga
EOF
```

```bash
#!/bin/bash
echo hoge
echo fuga
```

#### ・for

**＊実装例＊**

```bash
#!/bin/bash
 
for i in 1 2 3 4 5
do
   echo "$i"
done
```

#### ・switch-case

変数に代入された値によって，処理を分ける．全ての場合以外をアスタリスクで定義する．

**＊実装例＊**

```bash
#!/bin/bash

case "$ENV" in
    "dev")
        VAR="foo"
    ;;
    "stg")
        VAR="bar"
    ;;
    "prd")
        VAR="baz"
    ;;
    *)
        echo "The parameter ${ENV} is invalid."
        exit 1
    ;;
esac
```

<br>

### 実行方法

#### ・source

現在開かれているインタラクティブで処理を実行する．そのため，シェルスクリプト内で定義した変数は，シェルスクリプトの実行後も維持される．

```bash
$ source hello.sh
```

#### ・bash

新しくインタラクティブを開き，処理を実行する．そのため，シェルスクリプト内で定義した変数は，シェルスクリプトの実行後に破棄される．

```bash
$ bash hello.sh
```

#### ・ドット

```bash
$ . hello.sh
```

#### ・パス指定

相対パスもしくは絶対パスでシェルスクリプトを指定する．実行するファイルをカレントディレクトリに置くことはできない．

```bash
$ ./hello.sh
```

<br>

## 02. Makefile

### Makefileとは

ユーティリティの特にビルド（コンパイル＋リンク）に関する処理を，シェルスクリプトではなくターゲットとして実装したファイル．ただし，コンパイル以外を実装しても良い．

<br>

### ロジック

#### ・ターゲット

ターゲットとして，単一/複数の名前を定義できる．コマンドはタブで改行する必要がある．

```makefile
foo:
	echo "foo"
  
bar:
	echo "bar"
  
baz qux: # 複数のターゲット名
	echo "baz"
```

#### ・ターゲット間依存関係

特定のターゲットの実行前に，他のターゲットを実行しておきたい場合，依存関係を定義できる．これは複数定義できる．

```makefile
foo:
	echo "foo"
  
bar: foo # fooを事前に実行する．
	echo "bar"
  
baz: foo baz # foo，bazを事前に実行する．
	echo "baz"
```

#### ・```.PHONY```

ターゲットと同じ名前のファイルがある場合，```make```コマンドでターゲットを指定できなくなる．```.PHONY```を用いると，ファイル名ではなくターゲットを明示できる．

参考：https://advancedinsight.jp/using_phony_target_for_makefile/

```makefile
# ターゲットであることを明示する．
.PHONY: foo bar baz qux

foo: # fooという名前のファイルがあると，実行できない．
	echo "foo"
  
bar:
	echo "bar"
  
baz qux:
	echo "baz"
```

<br>

### 実行方法とオプション

#### ・make

Makefileが置かれた階層で，makeコマンドの引数としてターゲット名や環境変数を渡せる．Makefile内で環境変数のデフォルト値を定義できる．

```bash
$ make <ターゲット名> <環境変数名>=<値>
```

**＊実装例＊**

```bash
$ make foo FOO=foo
```

```makefile
FOO=default

foo:
	echo ${FOO}
```

<br>

### Makefileのよくある使い方

一般的に，Makefileはパッケージのビルドとインストールのために実装される．この時に慣例として，ターゲット名は```make```（ターゲット無し）と```install```になっていることが多い．

参考：https://qiita.com/chihiro/items/f270744d7e09c58a50a5

（１）パッケージをインストールする．

```bash
# パッケージを公式からインストールと解答
$ wget <パッケージのリンク>
$ tar <パッケージのフォルダ名>

# ビルド用ディレクトリの作成．
$ mkdir build
$ cd build
```

（２）ルールが定義されたMakefileを```configure```ファイルを元に作成する．

```bash
# configureへのパスに注意．
$ ../configure --prefix="<ソースコードのインストール先のパス>"
```

（３）パッケージのソースコードから```exe```ファイルをビルドする．

```bash
# -j で用いるコア数を宣言し，処理の速度を上げられる．
$ make -j4
```

（４）任意で，```exe```ファイルのテストを行える．

```bash
$ make check
```

（５）生成されたソースコードのファイルを，指定したディレクトリにコピーする．

```bash
# installと命令するが，実際はコピー．sudoを付ける．
$ sudo make install
```

（６）元となったソースコードやバイナリ形式のコードを削除．

```bash
$ make clean
```

<br>

## 03. 入力と出力

### 標準入出力

#### ・標準入出力とは

標準入力/標準出力/標準エラー出力，のこと．

![stdin_stdout_stderr](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/stdin_stdout_stderr.jpg)

#### ・stddin（標準入力）

キーボードからのコマンドに対して，データを入力するためのインターフェースのこと．プロセスごとに存在する．

#### ・stdout（標準出力）

コマンドからターミナルに対して，エラー以外のデータを出力するためのインターフェースのこと．プロセスごとに存在する．

#### ・stderr（標準エラー出力）

コマンドからターミナルに対して，エラーデータを出力するためのインターフェースのこと．プロセスごとに存在する．

<br>

### 出力方法

#### ・標準出力に全て出力

コマンド処理の後に，『```2>&1```』を追加すると，標準エラー出力への出力を標準出力にリダイレクトすることにより，処理の全ての結果を標準出力に出力できるうになる．

参考：https://teratail.com/questions/1285

**＊例＊**

```bash
$ echo "text" 2>&1
```

また，プロセスの標準出力は```/proc/<プロセスID>/fd```ディレクトリのファイルディスクリプタ番号（１番）で確認できる．プロセスIDは```ps```コマンドで事前に確認する．

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

参考：https://debimate.jp/2020/07/04/%e8%b5%b7%e5%8b%95%e6%b8%88%e3%81%bf%e3%83%97%e3%83%ad%e3%82%bb%e3%82%b9%ef%bc%88%e4%be%8b%ef%bc%9a%e3%83%87%e3%83%bc%e3%83%a2%e3%83%b3%e3%83%97%e3%83%ad%e3%82%bb%e3%82%b9%ef%bc%89%e3%81%ae%e6%a8%99/

#### ・標準エラー出力に全て出力

コマンド処理の後に，『```1>&2```』を追加すると，標準出力への出力を標準エラー出力にリダイレクトすることにより，処理の全ての結果を標準エラー出力に出力できるうになる．

参考：https://teratail.com/questions/1285

**＊例＊**

```bash
$ echo "text" 1>&2
```

また，プロセスの標準出力は```/proc/<プロセスID>/fd```ディレクトリのファイルディスクリプタ番号（２番）で確認できる．プロセスIDは```ps```コマンドで事前に確認する．

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

参考：https://debimate.jp/2020/07/04/%e8%b5%b7%e5%8b%95%e6%b8%88%e3%81%bf%e3%83%97%e3%83%ad%e3%82%bb%e3%82%b9%ef%bc%88%e4%be%8b%ef%bc%9a%e3%83%87%e3%83%bc%e3%83%a2%e3%83%b3%e3%83%97%e3%83%ad%e3%82%bb%e3%82%b9%ef%bc%89%e3%81%ae%e6%a8%99/

#### ・標準出力とファイルに出力

パイプラインで```tee```コマンドを繋ぐと，標準出力とファイルの両方に出力できる．

参考：https://glorificatio.org/archives/2903

**＊例＊**

```bash
$ echo "text" | tee stdout.log
```

<br>

## 04. pipeline

### pipelineとは

『```|```』の縦棒記号のこと．複数のプログラムの入出力を繋げる．

![pipeline](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/pipeline.png)

<br>

### 組み合わせ技

#### ・awkとの組み合わせ

コマンドの出力結果に対して，```awk```コマンドを行う．

**＊例＊**

検索されたファイルの容量を合計する．

```bash
$ find ./* -name "*.js" -type f -printf "%s\n" | awk "{ sum += $1; } END { print sum; }"
$ find ./* -name "*.css" -type f -printf "%s\n" | awk "{ sum += $1; } END { print sum; }"
$ find ./* -name "*.png" -type f -printf "%s\n" | awk "{ sum += $1; } END { print sum; }"
```

#### ・echoとの組み合わせ

終了ステータスを```echo```コマンドに渡し，値を出力する．

```bash
$ <任意のコマンド> | echo $?
```

#### ・grepとの組み合わせ

コマンドの出力結果を```grep```コマンドに渡し，フィルタリングを行う．

**＊例＊**

検索されたファイル内で，さらに文字列を検索する．

```bash
$ find ./* \
  -type f | xargs grep "<検索文字>"
```

#### ・killとの組み合わせ

コマンドの出力結果に対して，```kill```コマンドを行う．

**＊例＊**

フィルタリングされたプロセスを削除する．

```bash
$ sudo pgrep \
  -f <コマンド名> | sudo xargs kill -9
```

#### ・sortとの組み合わせ

コマンドの出力結果に対して，並び順を変更する．

**＊例＊**

表示された環境変数をAZ昇順に並び替える．

```bash
$ printenv | sort -f
```

<br>

## 05. 終了ステータス

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
