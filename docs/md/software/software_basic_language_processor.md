# 言語プロセッサ（言語処理プログラム）

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. プログラミング言語

### 言語の種類

プログラム言語のソースコードは、言語プロセッサによって機械語に変換された後、CPUによって実行される。そして、ソースコードに書かれた様々な処理が実行される。

![コンパイル型とインタプリタ型言語](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/コンパイル型とインタプリタ型言語.jpg)

<br>

### コンパイラ型言語

#### ・コンパイラ型言語とは

コンパイラという言語プロセッサによって、コンパイラ方式で翻訳される言語。

#### ・例

Go、C、C#、など。

<br>

### インタプリタ型言語

#### ・インタプリタ型言語とは

インタプリタという言語プロセッサによって、インタプリタ方式で翻訳される言語をインタプリタ型言語という。

#### ・例

PHP、Ruby、JavaScript、Python、など。

<br>

### 中間型言語

#### ・中間型言語とは

Java仮想マシンによって、中間言語方式で翻訳される。

参考：https://kanda-it-school-kensyu.com/java-basic-intro-contents/jbi_ch01/jbi_0102/

#### ・例

Java、Scala、Groovy、Kotlin、など。

<br>

## 02. 言語プロセッサによる翻訳方式

### アセンブラ方式

#### ・アセンブラ方式とは

アセンブリ型言語を機械語に翻訳する方法のこと。

<br>

### コンパイラ方式

#### ・コンパイラ方式とは

コンパイラ型言語を機械語に翻訳する方法のこと。

<br>

### インタプリタ方式

#### ・インタプリタ方式とは

インタプリタ型言語を機械語に翻訳する方法のこと。

<br>

## 02-02. アセンブリ型言語の機械語翻訳

<br>

## 02-03. コンパイラ型言語の機械語翻訳

### コンパイラ方式

#### ・機械語翻訳と実行

ソースコードをバイナリ形式のコードに翻訳した後、CPU上で命令が実行される。命令の結果はメモリに保管される。

参考：

- http://samuiui.com/2019/02/24/google-colaboratory%E3%81%A7python%E5%85%A5%E9%96%80/
- https://qiita.com/tk_01/items/a84408b5436ec97bfbe1#%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%A0%E3%81%8C%E5%8B%95%E3%81%8F%E4%BB%95%E7%B5%84%E3%81%BF

![compiler_language](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/compiler_language.png)

#### ・コンパイラによるビルド

コンパイルによって、ソースコードは機械語からなるバイナリ形式のコードに変換される。その後、バイナリ形式のコードはリンクされ。exeファイルとなる。この一連のプロセスを『ビルド』という。また、ビルドによって生成されたファイルを『アーティファクト（成果物）』という。

![ビルドとコンパイル](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ビルドとコンパイル.jpg)

<br>

### 仕組み

![lexical_syntax_semantics](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/lexical_syntax_semantics.png)

#### （１）Lexical analysis（字句解析）

ソースコードの文字列を言語の最小単位（トークン）の列に分解する。 以下に、トークンの分類方法の例を以下に示す。

![構文規則と説明](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/構文規則と説明.png)

#### （２）Syntax analysis（構文解析）

トークンの列をツリー構造に変換する。

#### （３）Semantics analysis（意味解析）

ツリー構造を基に、ソースコードに論理的な誤りがないかを解析する。

#### （４）Code optimization（コード最適化）

ソースコードの冗長な部分を削除または編集する。機械語をより短くするこができる。

#### （５）Code generation（コード生成）

最適化されたコードをバイナリ形式のコードに変換する。

#### （６）リンク

バイナリ形式のコードをリンクする。

#### （７）命令の実行

リンクされたバイナリ形式のコードを基に、命令が実行される。

<br>

## 02-04. インタプリタ型言語の機械語翻訳

### インタプリタ方式

#### ・機械語翻訳と実行

ソースコードをバイナリ形式のコードに一行ずつ変換し、その都度、CPU上で命令が実行される。命令の結果はメモリに保管される。

参考：

- http://samuiui.com/2019/02/24/google-colaboratory%E3%81%A7python%E5%85%A5%E9%96%80/
- https://qiita.com/tk_01/items/a84408b5436ec97bfbe1#%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%A0%E3%81%8C%E5%8B%95%E3%81%8F%E4%BB%95%E7%B5%84%E3%81%BF

![interpreted_language](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/interpreted_language.png)

コマンドラインでそのまま入力し、機械語翻訳と実行を行える。

```bash
#===========
# PHPの場合
#===========

# PHPなので、処理終わりにセミコロンが必要
$ php -r "<何らかの処理>"

# Hello Worldを出力
$ php -r "echo "Hello World";"

# phpinfoを出力
$ php -r "phpinfo();"

# （おまけ）phpinfoの出力をテキストファイルに保存
$ php -r "phpinfo();" > phpinfo.txt
```

```bash
# php.iniの読み込み状況を出力
$ php --ini
```

<br>

### 仕組み

![lexical_syntax_semantics](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/lexical_syntax_semantics.png)

#### （１）Lexical analysis（字句解析）

ソースコードの文字列を言語の最小単位（トークン）の列に分解。 以下に、トークンの分類方法の例を以下に示す。

![構文規則と説明](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/構文規則と説明.png)

#### （２）Syntax analysis（構文解析）

トークンの列をツリー構造に変換。ソースコードから構造体を構築することを構文解析といい、htmlを構文解析してDOMツリーを構築する処理とは別物なので注意。

#### （３）Semantics analysis（意味解析）

ツリー構造を基に、ソースコードに論理的な誤りがないか解析。

#### （４）命令の実行

意味解析の結果を基に、命令が実行される。

#### （５）１から４をコード行ごとに繰り返す

<br>

## 02-05. 中間型言語の機械語翻訳

### 中間言語方式

#### ・中間言語方式の機械語翻訳の流れ

1. JavaまたはJVM型言語のソースコードを、Javaバイトコードを含むクラスファイルに変換する。
2. JVM：Java Virtual Machine内で、インタプリタによって、クラスデータを機械語に翻訳する。
3. 結果的に、OS（制御プログラム？）に依存せずに、命令を実行できる。（C言語）

![Javaによる言語処理_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Javaによる言語処理_1.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![Javaによる言語処理_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Javaによる言語処理_2.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![Javaによる言語処理_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Javaによる言語処理_3.png)

#### ・C言語とJavaのOSへの依存度比較

![CとJavaのOSへの依存度比較](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CとJavaのOSへの依存度比較.png)

- JVM言語

ソースコード

<br>
