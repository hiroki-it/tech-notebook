---
title: 【知見を記録するサイト】スクリプト＠ユーティリティ
description: スクリプト＠ユーティリティの知見をまとめました．
---

# スクリプト＠ユーティリティ

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. シェルスクリプト

### シェルスクリプトとは

ユーティリティの処理を手続き的に実装したファイル．

<br>

### ロジック

#### ▼ シェバン

最初の『```#!```』をシェバンという．

```bash
#!/bin/bash

echo "foo"
echo "bar"
echo "baz"
```

#### ▼ ヒアドキュメント

ヒアドキュメントで作成したシェルスクリプトには，各行にechoが追加される．

```bash
#!/bin/bash

cat << EOF > "echo.sh"
#!/bin/bash
foo
bar
EOF
```

```bash
#!/bin/bash
echo foo
echo bar
```

#### ▼ for

**＊実装例＊**

```bash
#!/bin/bash
 
for i in 1 2 3 4 5
do
   echo "$i"
done
```

#### ▼ switch-case

シェル変数に代入された値によって，処理を分ける．全ての場合以外をアスタリスクで定義する．

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

#### ▼ source

現在の親プロセスのまま，シェルスクリプトを実行する．そのため，シェルスクリプトの実行前に定義されたシェル変数を用いることができる．また，シェルスクリプト内で定義したシェル変数は，シェルスクリプトの実行後も維持される．

参考：https://qiita.com/kure/items/f76d8242b97280a247a1

```bash
$ source hello.sh
```

#### ▼ bash

現在の親プロセスから子プロセスを作成し，シェルスクリプトを実行する．そのため，シェルスクリプトの実行前（親プロセス）に定義されたシェル変数を使用できない．また，シェルスクリプト内（子プロセス）で定義したシェル変数は，シェルスクリプトの実行後に破棄される．

参考：https://qiita.com/kure/items/f76d8242b97280a247a1

```bash
$ bash hello.sh
```

#### ▼ ドット

```bash
$ . hello.sh
```

#### ▼ パス指定

新しくインタラクティブを開き，処理を実行する．そのため，シェル変数のライフサイクルは```bash```コマンドと同じである．相対パスもしくは絶対パスでシェルスクリプトを指定する．実行するファイルをカレントディレクトリ下に配置することはできない．

参考：https://qiita.com/kure/items/f76d8242b97280a247a1

```bash
$ ./hello.sh
```

#### ▼ オプション間コメントは禁止

コマンドのオプションの間にコメントを挿入すると，以降のオプションがコメントアウトされてしまうため，禁止である．

```makefile
foo:
	echo "foo" \
		# 最後の改行を出力しない
		-n \
		# エスケープシーケンスを解釈する．
		-e
```

<br>

## 02. Makefile

### Makefileとは

ユーティリティの特にビルド（コンパイル＋リンク）に関する処理を，シェルスクリプトではなくターゲットとして実装したファイル．ただし，コンパイル以外を実装しても良い．

<br>

### セットアップ

#### ▼ Apk経由

ほとんどのOSではデフォルトでインストールされているが，Alpine Linuxでは別途インストールが必要である．

```bash
$ apk add make
```

<br>

### ロジック

#### ▼ シェルの選択

シェルの種類を選択する．種類ごとに用いることができるオプションがやや異なる．また同時に，```set```コマンドのオプションを有効化でき，これは全てのターゲットに適用される．

参考：https://askubuntu.com/questions/805816/set-e-o-pipefail-not-working-because-of-make-incompatibility

```makefile
SHELL=/bin/bash -xeu
```

シェルによって用いることができるオプションが少しだけ異なることに注意する．

```makefile
# bashのpipefailオプションを用いる．
SHELL=/bin/bash -o pipefail
```

参考：https://stackoverflow.com/questions/23079651/equivalent-of-pipefail-in-gnu-make

#### ▼ ターゲット

ターゲットとして，単一/複数の名前を定義できる．コマンドはタブで改行する必要がある．

```makefile
foo:
	echo "foo"
  
bar:
	echo "bar"
  
baz qux: # 複数のターゲット名
	echo "baz"
```

#### ▼ ターゲット間依存関係

特定のターゲットの実行前に，他のターゲットを実行しておきたい場合，依存関係を定義できる．これは複数定義できる．

```makefile
foo:
	echo "foo"
  
bar: foo # fooを事前に実行する．
	echo "bar"
  
baz: foo baz # foo，bazを事前に実行する．
	echo "baz"
```

#### ▼ ```.PHONY```

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

### 変数

#### ▼ 即時評価代入

変数の代入を定義したタイミングで変数の代入が行われる．

参考：https://make-muda.net/2014/10/1824/

```makefile
FOO:=foo

echo:
	echo ${FOO} # echo
```

#### ▼ 遅延評価代入

変数をコールしたタイミングで変数の代入が行われる．

参考：https://make-muda.net/2014/10/1824/

```makefile
FOO=foo

echo:
	echo ${FOO} # echo foo
```

処理結果を変数に代入する時，ターゲット内では処理結果をシェル変数に代入できない．そのため，シェル変数はターゲット外で定義する必要がある．また，遅延評価で代入し，```$(shell ...)```とする必要がある．

参考：https://qiita.com/vega77/items/5206c397258b5b372fc4

```makefile
FOO=$(shell echo "foo")

echo:
	echo ${FOO}
```

<br>

### 実行方法とオプション

#### ▼ make

Makefileが配置された階層で，makeコマンドの引数としてターゲット名やシェル変数を渡せる．Makefile内でシェル変数のデフォルト値を定義できる．

```bash
$ make <ターゲット名> <シェル変数名>=<値>
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
$ tar <パッケージのフォルダー名>

# ビルド用ディレクトリの作成．
$ mkdir build
$ cd build
```

（２）ルールが定義されたMakefileを```configure```ファイルを元に作成する．

```bash
# configureへのパスに注意．
$ ../configure --prefix="<コードのインストール先のパス>"
```

（３）パッケージのコードから```exe```ファイルをビルドする．

```bash
# -j で用いるコア数を宣言し，処理の速度を上げられる．
$ make -j4
```

（４）任意で，```exe```ファイルのテストを行える．

```bash
$ make check
```

（５）生成されたコードのファイルを，指定したディレクトリ下にコピーする．

```bash
# installと命令するが，実際はコピー．sudoを付ける．
$ sudo make install
```

（６）元となったコードやバイナリ形式のコードを削除．

```bash
$ make clean
```

<br>