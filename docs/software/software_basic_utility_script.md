---
title: 【IT技術の知見】スクリプト＠ユーティリティ
description: スクリプト＠ユーティリティの知見を記録しています。
---

# スクリプト＠ユーティリティ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. シェルスクリプト

### シェルスクリプトとは

ユーティリティの処理を手続き的に実装したファイル。

<br>

### シェバン

最初の『`#!`』をシェバンという。

```bash
#!/bin/bash

echo "foo"
echo "bar"
echo "baz"
```

<br>

### ヒアドキュメント

#### ▼ ヒアドキュメントとは

ヒアドキュメントで作成したシェルスクリプトには、各行に`echo`が追加される。

慣例として、終了文字列には`EOF`/`EOT`/`EOD`を使用するが、どんな文字でも良い。

```bash
#!/bin/bash

cat << EOF > echo.sh
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

> - https://qiita.com/kite_999/items/e77fb521fc39454244e7#%E3%83%92%E3%82%A2%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88%E3%81%A8%E3%81%AF
> - https://webkaru.net/php/here-document/

#### ▼ ヒアドキュメント内の記号エスケープ

一部の記号 (例：`{`、`}`) を文字として使用する場合、エスケープしないとヒアドキュメント内で使用できない。

終了文字列 (例：EOF) をシングルクオートで囲うと、エスケープできる。

```bash
#!/bin/bash

cat << 'EOF' > echo.sh
#!/bin/bash
${FOO}
${BAR}
EOF
```

```bash
#!/bin/bash

echo foo
echo bar
```

> - https://qiita.com/mofmofneko/items/bf003d14670644dd6197

バックスラッシュを使用して、個別にエスケープすることもできる。

```bash
#!/bin/bash

cat << EOF > echo.sh
#!/bin/bash
${FOO}
\${BAR}
EOF
```

```bash
#!/bin/bash

echo foo
echo ${BAR} # エスケープしたため、変数は展開しない
```

> - https://qiita.com/watertight/items/96596f8da4f8c71632b0

#### ▼ ヒアドキュメント内への変数展開

終了文字列をシングルクオートで囲わずにエスケープしないことで、変数の記号 (例：`{`、`}`) を使用できる。

```bash
#!/bin/bash

FOO=foo
BAR=bar

cat << EOF > echo.sh
#!/bin/bash
${FOO}
${BAR}
EOF
```

```bash
#!/bin/bash

echo foo
echo bar
```

> - https://itneko.com/shell-here-document/

<br>

### コメント

#### ▼ 改行時にコメントを挿入

改行時にコメントを挿入すると、以降のオプションがコメントアウトされてしまう。

コメントをバッククオートで囲い、バックスラッシュで区切る必要がある。

```bash
#!/bin/bash

echo foo \
  `# コメント` \
  bar \
  `# コメント` \
  baz
```

> - https://mixi-developers.mixi.co.jp/readable-shell-script-23f881852671

### 反復

#### ▼ for

**＊実装例＊**

```bash
#!/bin/bash

for i in 1 2 3 4 5; do
   echo "$i"
done
```

<br>

### 条件分岐

#### ▼ switch-case

シェル変数に代入された値によって、処理を分ける。

全ての場合以外をアスタリスクで定義する。

**＊実装例＊**

```bash
#!/bin/bash

case "${ENV}" in
    "tes")
        VAR="foo"
    ;;
    "stg")
        VAR="bar"
    ;;
    "prd")
        VAR="baz"
    ;;
    *)
        echo "The parameter "${ENV}" is invalid."
        exit 1
    ;;
esac
```

#### ▼ if

```bash
#!/bin/bash

if [ $VAR="" ]; then
  echo "空文字です";
else
  echo "空文字ではありません";
fi
```

```bash
#!/bin/bash

if [ -z "$VAR" ]; then
  echo "変数なし or 空文字です";
else
  echo "変数が設定されています";
fi
```

```bash
#!/bin/bash

if [ -n "$VAR" ]; then
  echo "NULLです";
else
  echo "NULLではありません";
fi
```

> - https://stackoverflow.com/a/13864829

終了コードを条件とすることで、エラーが起こった場合の条件分岐を実装できる。

```bash
#!/bin/bash

if [ $? -ne 0 ]; then
  echo "エラーなので別の処理を実行します";
else
  echo "エラーではないため、正しい処理を実行します";
fi
```

<br>

### 実行方法

#### ▼ source

現在の親プロセスのまま、シェルスクリプトを実行する。

そのため、シェルスクリプトの実行前に定義されたシェル変数を使用できる。

また、シェルスクリプト内で定義したシェル変数は、シェルスクリプトの実行後も維持される。

> - https://qiita.com/kure/items/f76d8242b97280a247a1

```bash
$ source hello.sh
```

#### ▼ bash

現在の親プロセスから子プロセスを作成し、シェルスクリプトを実行する。

そのため、シェルスクリプトの実行前 (親プロセス) に定義されたシェル変数を使用できない。

また、シェルスクリプト内 (子プロセス) で定義したシェル変数は、シェルスクリプトの実行後に破棄される。

```bash
$ bash hello.sh
```

> - https://qiita.com/kure/items/f76d8242b97280a247a1

#### ▼ `.` (ドット)

```bash
$ . hello.sh
```

#### ▼ パス指定

新しくインタラクティブを開き、処理を実行する。

そのため、シェル変数のライフサイクルは`bash`コマンドと同じである。

相対パスもしくは絶対パスでシェルスクリプトを指定する。

実行するファイルをカレントディレクトリ配下に配置できない。

```bash
$ ./hello.sh
```

> - https://qiita.com/kure/items/f76d8242b97280a247a1

<br>

## 02. Makefile

### Makefileとは

ユーティリティの特にビルド (コンパイル + リンク) に関する処理を、シェルスクリプトではなくターゲットとして実装したファイル。

ただし、コンパイル以外を実装しても良い。

<br>

### セットアップ

#### ▼ apkリポジトリから

ほとんどのOSで、`make`コマンドはプリインストールされているが、Alpine Linuxでは別途インストールが必要である。

```bash
$ apk add make
```

<br>

### ロジック

#### ▼ シェルの選択

シェルの種類を選択する。

種類ごとに使用できるオプションがやや異なる。

また同時に、`set`コマンドのオプションを有効化でき、これは全てのターゲットに適用される。

```makefile
SHELL=/bin/bash -xeu
```

> - https://askubuntu.com/questions/805816/set-e-o-pipefail-not-working-because-of-make-incompatibility

シェルによって使用できるオプションが少しだけ異なることに注意する。

```makefile
# bashのpipefailオプションを使用する。
SHELL=/bin/bash -o pipefail
```

> - https://stackoverflow.com/questions/23079651/equivalent-of-pipefail-in-gnu-make

#### ▼ ターゲット

ターゲットとして、単一/複数の名前を定義できる。

コマンドはタブで改行する必要がある。

```makefile
foo:
	echo "foo"

bar:
	echo "bar"

baz qux: # 複数のターゲット名
	echo "baz"
```

#### ▼ ターゲット間依存関係

特定のターゲットの実行前に、他のターゲットを実行しておきたい場合、依存関係を定義できる。

これは複数定義できる。

```makefile
foo:
	echo "foo"

bar: foo # fooを事前に実行する。
	echo "bar"

baz: foo baz # foo、bazを事前に実行する。
	echo "baz"
```

#### ▼ `.PHONY`

ターゲットと同じ名前のファイルがある場合、`make`コマンドでターゲットを指定できなくなる。

`.PHONY`を使用すると、ファイル名ではなくターゲットを明示できる。

```makefile
# ターゲットであることを明示する。
.PHONY: foo bar baz qux

foo: # fooという名前のファイルがあると、実行できない。
	echo "foo"

bar:
	echo "bar"

baz qux:
	echo "baz"
```

> - https://advancedinsight.jp/using_phony_target_for_makefile/

<br>

### 変数

#### ▼ 即時評価代入

変数の代入を定義したタイミングで変数の代入が行われる。

```makefile
FOO:=foo

echo:
	echo "${FOO}" # echo
```

> - https://make-muda.net/2014/10/1824/

#### ▼ 遅延評価代入

変数をコールしたタイミングで変数の代入が行われる。

```makefile
FOO=foo

echo:
	echo "${FOO}" # echo foo
```

> - https://make-muda.net/2014/10/1824/

ターゲット内では、標準出力への出力をシェル変数に代入できない。

そのため、シェル変数はターゲット外で定義する必要がある。

また、遅延評価で代入し、`$(shell ...)`とする必要がある。

```makefile
FOO=$(shell echo "foo")

echo:
	echo "${FOO}"
```

> - https://qiita.com/vega77/items/5206c397258b5b372fc4

<br>

### 実行方法とオプション

#### ▼ make

Makefileが配置された階層で、makeコマンドの引数としてターゲット名やシェル変数を渡せる。

Makefile内でシェル変数のデフォルト値を定義できる。

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
	echo "${FOO}"
```

<br>

### Makefileのよくある使い方

一般的に、Makefileはパッケージのビルドとインストールのために実装される。

この時に慣例として、ターゲット名は`make` (ターゲット無し) と`install`になっていることが多い。

> - https://qiita.com/chihiro/items/f270744d7e09c58a50a5

`(1)`

: パッケージをインストールする。

```bash
# パッケージを公式からインストールと解答
$ wget <パッケージのリンク>
$ tar <パッケージのディレクトリ名>


# ビルド用ディレクトリの作成。
$ mkdir build
$ cd build
```

`(2)`

: ルールが定義されたMakefileを`configure`ファイルを元に作成する。

```bash
# configureへのパスに注意。
$ ../configure --prefix="<コードのインストール先のパス>"
```

`(3)`

: パッケージのコードから`exe`ファイルをビルドする。

```bash
# -j で使用するコア数を宣言し、処理速度を上げられる。
$ make -j4
```

`(4)`

: 任意で、`exe`ファイルを検証する。

```bash
$ make check
```

`(5)`

: 作成されたコードのファイルを、指定したディレクトリ配下にコピーする。

```bash
# installと命令するが、実際はコピー。
$ make install
```

`(6)`

: 元となったコードやバイナリ形式のコードを削除。

```bash
$ make clean
```

<br>
