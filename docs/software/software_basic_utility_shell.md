---
title: 【IT技術の知見】シェル＠ユーティリティ
description: シェル＠ユーティリティの知見を記録しています。
---

# シェル＠ユーティリティ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. シェルとは

### 仕組み

標準入力からの入力を解釈し、Linuxカーネルを操作する。

また、Linuxカーネルの処理結果を解釈し、標準出力/標準エラー出力に出力する。

基本的には、いずれのシェルも同じ仕組みである。

> - http://www.cc.kyoto-su.ac.jp/~hirai/text/shell.html

![shell](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/shell.png)

<br>

## 01-02. 起動方法の種類

### ログインシェル

#### ▼ ログインシェルとは

認証情報を必要とし、認証後に最初に起動するシェルのこと。

パスワードは、`/etc/passwd`ファイルに設定されている。

> - https://xtech.nikkei.com/it/article/Keyword/20090130/323875/
> - https://tooljp.com/windows/chigai/html/Linux/loginShell-interactiveShell-chigai.html

#### ▼ su -

特定のユーザーで認証し、シェルを起動する。

```bash
# ハイフンオプション有り
$ su - <ユーザー名>
```

#### ▼ bash --login

現在のユーザーで認証し、シェルを起動する。

```bash
# --loginオプション有り
$ bash --login
```

#### ▼ ssh

SSH公開鍵認証で認証し、シェルを起動する。

```bash
$ ssh
```

<br>

### インタラクティブシェル

#### ▼ インタラクティブシェルとは

認証情報を必要とせず、最初に起動するシェルのこと。

> - https://tooljp.com/windows/chigai/html/Linux/loginShell-interactiveShell-chigai.html

#### ▼ su <ユーザー名>

特定のユーザーで、認証なしでシェルを起動する。

```bash
# ハイフンオプション無し
$ su <ユーザー名>
```

#### ▼ bash

現在のユーザーで、認証なしでシェルを起動する。

```bash
# --loginオプション無し
$ bash
```

<br>

### 非インタラクティブシェル

#### ▼ 非インタラクティブシェルとは

シェルスクリプトを指定して実行するシェルのこと。

#### ▼ bash -c

```bash
$ bash -c foo.sh
```

<br>

### 確認方法

現在の起動方法の種類は、変数の『`$0`』に格納されたシェルスクリプトのファイル名から確認できる。

```bash
$ echo $0

sh # インタラクティブシェル

# ログインシェルを起動する。ハイフンオプションがあることに注意する。
$ sudo su -
Last login: Mon Jun 20 13:36:40 JST 2022 on pts/0

[root@<IPアドレス> bin] $ echo $0

-bash # ログインシェルの場合、シェルの前にハイフンが付く。
```

> - https://www.delftstack.com/ja/howto/linux/difference-between-a-login-shell-and-a-non-login-shell/

補足として、もしシェルスクリプト内でこれを実行した場合は、これのファイル名を取得できる。

```bash
#!/bin/sh
# foo.shファイル

echo $0 # foo.sh
```

> - https://qiita.com/zayarwinttun/items/0dae4cb66d8f4bd2a337

<br>

### シェルの種類

#### ▼ 系譜

![shell_history](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/shell_history.png)

> - https://kengoyamamoto.com/%E3%83%A1%E3%82%B8%E3%83%A3%E3%83%BC%E3%81%AAshell%E3%81%AE%E7%A8%AE%E9%A1%9E%E3%81%BE%E3%81%A8%E3%82%81/

#### ▼ 設定ファイル

シェルを起動するとき、各種設定ファイルが読み込まれる。

ファイルが存在しなければ、自身で作成する。

| bashの場合                | zshの場合             | 読み込まれるタイミング                                                              |
| ------------------------- | --------------------- | ----------------------------------------------------------------------------------- |
| なし                      | `~/.zshenv`ファイル   | ログインシェル、インタラクティブシェルの起動時                                      |
| `~/.bash_profile`ファイル | `~/.zprofile`ファイル | ログインシェルの起動時                                                              |
| `~/.bashrc`ファイル       | `~/.zshrc`ファイル    | ログインシェルの起動時。ただし、zshではインタラクティブシェルの起動時も含む。       |
| `~/.bash_login`ファイル   | `~/.zlogin`ファイル   | ログインシェルの起動時。profileファイルと機能が重複するため、個人的には使用しない。 |
| `~/.bash_logout`ファイル  | `~/.zlogout`ファイル  | `exit`コマンド時                                                                    |

> - https://tooljp.com/windows/chigai/html/Linux/loginShell-interactiveShell-chigai.html
> - https://leico.github.io/TechnicalNote/Mac/catalina-zsh
> - https://suwaru.tokyo/zshenv/

#### ▼ 確認方法

現在使用しているシェルを確認する。

```bash
$ echo $SHELL

/bin/zsh
```

<br>

### 変数

#### ▼ 変数スコープと親子プロセス

シェルでは、変数のスコープがプロセスの親子関係によって決まる。

> - https://qiita.com/kure/items/f76d8242b97280a247a1

![shell_variable_scope](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/shell_variable_scope.png)

#### ▼ シェル変数

現在実行中のプロセスでのみ有効な変数のこと。

そのため、`source`コマンド以外の方法で実行されたシェルスクリプトでは、親プロセスで定義されたシェル変数を使用できない。

> - https://qiita.com/kure/items/f76d8242b97280a247a1

```bash
#!/bin/bash
# foo.shファイル
echo "${FOO}"
```

```bash
$ FOO=foo # シェル変数を定義する。

$ bash foo.sh
# 出力されない
```

補足として、標準出力に対する出力をシェル変数に代入することもできる。

```bash
FOO=$(echo "foo")
```

#### ▼ 環境変数

現在実行中のプロセスと、その子プロセスでも有効な変数のこと。

そのため、シェルスクリプトの実行コマンドに限らず使用できる。

> - https://qiita.com/kure/items/f76d8242b97280a247a1

```bash
#!/bin/bash
# foo.shファイル
echo "${FOO}"
```

```bash
$ export FOO=foo # 環境変数を定義する。

$ bash foo.sh

foo # 出力される
```

<br>

## 02. セットアップ

### インストール

#### ▼ apkリポジトリから

ほとんどのOSで、`bash`コマンドはプリインストールされているが、Alpine Linuxではシェル以外を別途インストールが必要である。

```bash
$ apk add bash
```

<br>

## 03. 終了ステータス

### 終了ステータスとは

プロセスは別の新しいプロセスを作成できる。

子プロセスの終了時に、親プロセスに終了ステータス (`0`〜`255`) が返却される。

> - https://en.wikipedia.org/wiki/Exit_status

<br>

### 終了ステータスの種類

| 値        | 意味                                   | エラーの原因                                                                              | 発生例                                       |
| --------- | -------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------- |
| `0`       | 正常な完了                             | -                                                                                         | -                                            |
| `1`       | 一般的なエラー                         | 構文エラーではないが、ロジックが誤っている可能性がある。                                  | `$ let "var 1 = 1 / 0"`                      |
| `2`       | シェルビルトインな機能の誤用           | シェルの構文や権限が誤っている可能性がある。                                              | `$ empty_function(){}`                       |
| `126`     | 呼び出したコマンドが実行できなかった時 | 権限やその他の理由でコマンドを実行できてない可能性がある。                                | `$ /dev/null`                                |
| `127`     | コマンドが見つからない時               | バイナリファイルの`$PATH`の未設定や、コマンドのタイポの可能性がある。                     | `$ illegal_command`                          |
| `128`     | `exit`コマンドに不正な引数を渡した時   | `exit`コマンドに0〜255以外の整数を渡している可能性がある。                                | `$ exit 3.14159`                             |
| `128 + n` | シグナル `n`で致命的なエラー           | killがシグナル`n`で実行された可能性がある。                                               | `$ kill -9 $PPID`<br>(`128 + 9 = 137`で終了) |
| `128 + 2` | スクリプトが `Ctrl+C`で終了            | `Ctrl+C`はシグナル`2`で終了するため、`Ctrl+C`が実行された可能性がある。 (`128 + 2 = 130`) | Ctrl+C                                       |
| `255`     | 範囲外の終了ステータス                 | `exit`コマンドに0〜255以外の整数を渡している可能性がある。                                | `$ exit -1`                                  |

> - https://tldp.org/LDP/abs/html/exitcodes.html
> - https://qiita.com/Linda_pp/items/1104d2d9a263b60e104b

<br>

## 04. コマンドの実行タイミング

### 順次実行

#### ▼ 終了ステータスがいずれであっても

連結したコマンドを順次実行する。

前のコマンドがいずれかの終了ステータスで完了しない限り、後ろのコマンドを実行しない。

```bash
$ echo foo; echo bar; echo baz
```

> - https://jehupc.exblog.jp/15729095/
> - https://qiita.com/egawa_kun/items/714394609eef6be8e0bf

#### ▼ 終了ステータスが`0`の場合のみ

連結したコマンドを順次実行する。

前のコマンドが終了ステータスが`0`で完了しない限り、後ろのコマンドを実行しない。

```bash
$ echo foo && echo bar && echo baz
```

> - https://jehupc.exblog.jp/15729095/
> - https://qiita.com/egawa_kun/items/714394609eef6be8e0bf

#### ▼ 終了ステータスが`0`以外の場合のみ

連結したコマンドを順次実行する。

前のコマンドが終了ステータスが`0`以外で完了しない限り、後ろのコマンドを実行しない。

```bash
$ echo foo || echo bar || echo baz
```

> - https://jehupc.exblog.jp/15729095/
> - https://qiita.com/egawa_kun/items/714394609eef6be8e0bf

<br>

### 並列実行

連結したコマンドを並列実行する。

前のコマンドが完了しない限り、後ろのコマンドを実行しない。

```bash
$ echo foo & echo bar & echo baz
```

> - https://jehupc.exblog.jp/15729095/
> - https://qiita.com/egawa_kun/items/714394609eef6be8e0bf

<br>
