---
title: 【知見を記録するサイト】言語の種類＠アプリケーション
description: 言語の種類＠アプリケーションをまとめました。
---

# 言語の種類＠アプリケーション

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. プログラミングパラダイムによる分類

### プログラミングパラダイムとは

![プログラミング言語と設計手法の歴史](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/プログラミング言語と設計手法の歴史.png)

プログラミングを行う時の様式のこと。

参考：

- https://www.freecodecamp.org/news/what-exactly-is-a-programming-paradigm/
- https://anken-hyouban.com/blog/2020/10/09/programming-paradigm/
- https://umtp-japan.org/event-seminar/4233

<br>

### 種類

複数の様式でプログラミングできる言語もあり、これは『マルチパラダイム言語』という。

参考：

- https://web-camp.io/magazine/archives/61816
- https://anken-hyouban.com/blog/2020/10/09/programming-paradigm/
- https://style.potepan.com/articles/12941.html

|            | 手続き型 | 構造化 | オブジェクト指向型 | 命令型 | 宣言型 | 関数型 | 論理型 |
|------------|------|-----|-----------|-----|-----|-----|-----|
| C          | ✅    |     |           |     |     |     |     |
| COBOL      | ✅    |     |           |     |     |     |     |
| Go         | ✅    |     |           |     |     |     |     |
| Java       |      |     | ✅         | ✅   |     |     |     |
| JavaScript |      |     | ✅         | ✅   |     | ✅   |     |
| LISP       |      |     |           |     | ✅   |     |     |
| Pascal     |      | ✅   |           |     |     |     |     |
| Perl       | ✅    |     |           |     |     |     |     |
| Prolog     |      |     |           |     |     |     | ✅   |
| PHP        |      |     | ✅         | ✅   |     |     |     |
| PL/I       |      | ✅   |           |     |     |     |     |
| Python     |      |     | ✅         | ✅   |     | ✅   |     |
| R          |      |     |           |     |     | ✅   |     |
| Ruby       |      |     | ✅         | ✅   |     |     |     |
| Scala      |      |     | ✅         |     | ✅   | ✅   |     |
| SQL        |      |     |           |     | ✅   |     |     |

<br>

## 02. 機械語翻訳方式による分類

### 機械語翻訳方式とは

プログラム言語のコードは、言語プロセッサーによって機械語に変換された後、CPUによって実行される。そして、コードに書かれた様々な処理が実行される。機械語に変換されるまでの処理方式には種類がある。

![コンパイル型とインタプリタ型言語](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/コンパイル型とインタプリタ型言語.jpg)

<br>

### 種類

#### ▼ コンパイラ型言語

コンパイラという言語プロセッサーによって、コンパイラ方式で翻訳される言語。

（例）Go、C、C#、など。

#### ▼ インタプリタ型言語

インタプリタという言語プロセッサーによって、インタプリタ方式で翻訳される言語をインタプリタ型言語という。

（例）PHP、Ruby、JavaScript、Python、など。

#### ▼ 中間型言語

Java仮想マシンによって、中間言語方式で翻訳される。

参考：https://kanda-it-school-kensyu.com/java-basic-intro-contents/jbi_ch01/jbi_0102/

（例）Java、Scala、Groovy、Kotlin、など。

<br>

## 03. 型システムによる分類

### 型システムとは

プログラミングの構成要素（データ、変数、関数）に対して、『型』という特性を付与する仕組みのこと。

参考：https://ja.wikipedia.org/wiki/%E5%9E%8B%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0

<br>

### 種類

#### ▼ 静的型付け

（例）C、Go、Java、Scala

#### ▼ 動的型付け

（例）PHP、Python、Ruby

<br>



