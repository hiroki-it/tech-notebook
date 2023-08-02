---
title: 【IT技術の知見】言語プロセッサー (言語処理プログラム) ＠基本ソフトウェア
description: 言語プロセッサー (言語処理プログラム) ＠基本ソフトウェアの知見を記録しています。
---

# 言語プロセッサー (言語処理プログラム) ＠基本ソフトウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. アセンブラ方式

### アセンブラ方式とは

アセンブリ型言語を機械語に翻訳する。

<br>

## 02. コンパイラ方式

### コンパイラ方式とは

コンパイラ型言語を機械語に翻訳する。

<br>

### 仕組み

#### ▼ 機械語翻訳と実行

コードをバイナリ形式のコードに翻訳した後、CPU上で命令が実行される。

命令の結果はメモリに保管される。

![compiler_language](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/compiler_language.png)

> - https://qiita.com/tk_01/items/a84408b5436ec97bfbe1#%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%A0%E3%81%8C%E5%8B%95%E3%81%8F%E4%BB%95%E7%B5%84%E3%81%BF

#### ▼ コンパイラによるビルド

コンパイルによって、コードは機械語からなるバイナリ形式のコードに変換される。

その後、バイナリ形式のコードはリンクされ。

exeファイルとなる。

この一連のプロセスを『ビルド』という。

また、ビルドによって作成されたファイルを『アーティファクト (成果物) 』という。

![ビルドとコンパイル](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ビルドとコンパイル.jpg)

<br>

### 機械語翻訳とは

![lexical_syntax_semantics](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/lexical_syntax_semantics.png)

#### `(1)` Lexical analysis (字句解析)

コードの文字列を言語の最小単位 (トークン) の列に分解する。

以下に、トークンの分類方法の例を以下に示す。

字句解析のアルゴリズムは、LexやFlexで実装されている。

解析器をルーツを辿れない問題をブートストラップ問題という。

![構文規則と説明](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/構文規則と説明.png)

> - https://en.wikipedia.org/wiki/Flex_(lexical_analyser_generator)

#### `(2)` Syntax analysis (構文解析)

トークンの列をツリー構造に変換する。

構文解析のアルゴリズムは、BisonやYaccで実装されている。

解析器をルーツを辿れない問題をブートストラップ問題という。

コンパイラ型言語の構文解析に失敗した時、これらの構文解析言語はシンタックスエラーを出力する。

> - https://ja.wikipedia.org/wiki/Bison

#### `(3)` Semantics analysis (意味解析)

ツリー構造を基に、コードに論理的な誤りがないかを解析する。

#### `(4)` Code optimization (コード最適化)

コードの冗長な部分を削除または編集する。

機械語をより短くできる。

#### `(5)` Code generation (コード作成)

最適化されたコードをバイナリ形式のコードに変換する。

#### `(6)` リンク

バイナリ形式のコードをリンクする。

#### `(7)` 命令の実行

リンクされたバイナリ形式のコードを基に、命令が実行される。

<br>

## 03. インタプリタ方式

### インタプリタ方式とは

インタプリタ型言語を機械語に翻訳する。

<br>

### 仕組み

#### ▼ 機械語翻訳と実行

コードをバイナリ形式のコードに１行ずつ変換し、その都度、CPU上で命令が実行される。

命令の結果はメモリに保管される。

![interpreted_language](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/interpreted_language.png)

> - https://qiita.com/tk_01/items/a84408b5436ec97bfbe1#%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%A0%E3%81%8C%E5%8B%95%E3%81%8F%E4%BB%95%E7%B5%84%E3%81%BF

<br>

### 機械語翻訳とは

#### `(1)` Lexical analysis (字句解析)

コンパイラ型言語と同じである。

#### `(2)` Syntax analysis (構文解析)

コンパイラ型言語と同じである。

#### `(3)` Semantics analysis (意味解析)

コンパイラ型言語と同じである。

#### `(4)` 命令の実行

コンパイラ型言語と同じである。

#### `(5)`

１から４をコード行ごとに繰り返す

<br>

## 04. 中間型言語の機械語翻訳

### 中間言語方式とは

記入中...

### 仕組み

`(1)`

: JavaまたはJVM型言語のコードを、Javaバイトコードを含むクラスファイルに変換する。

`(2)`

: JVM：Java Virtual Machine内で、インタプリタによって、クラスデータを機械語に翻訳する。

`(3)`

: 結果的に、OS (制御プログラム？) に依存せずに、命令を実行できる (C言語) 。

![Javaによる言語処理_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Javaによる言語処理_1.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/矢印_80x82.jpg)

![Javaによる言語処理_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Javaによる言語処理_2.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/矢印_80x82.jpg)

![Javaによる言語処理_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Javaによる言語処理_3.png)

<br>

### C言語とJavaのOSへの依存度比較

記入中...

![CとJavaのOSへの依存度比較](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/CとJavaのOSへの依存度比較.png)

<br>
