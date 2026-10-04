---
title: 【IT技術の知見】言語の種類＠言語
description: 言語の種類＠言語を記録しています。
---

# 言語の種類＠言語

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. プログラミングパラダイムによる分類

### プログラミングパラダイムとは

プログラミングを行うときの様式のこと。

![プログラミング言語と設計手法の歴史](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/プログラミング言語と設計手法の歴史.png)

> - [What exactly is a programming paradigm?](https://www.freecodecamp.org/news/what-exactly-is-a-programming-paradigm/)
> - [プログラミングパラダイム一覧！種類やそれぞれの概要を簡単に解説！ ｜ 案件評判](https://anken-hyouban.com/blog/2020/10/09/programming-paradigm/)
> - [第9回UMTPモデリング技術ワークショップ 議論詳細 - UMTP 特定非営利活動法人UMLモデリング推進協議会](https://umtp-japan.org/event-seminar/4233)

<br>

### 様式に基づく言語の種類

複数の様式でプログラミングできる言語もあり、これは『マルチパラダイム言語』という。

|            | 手続き型 | 構造化 | オブジェクト指向型 | 命令型 | 宣言型 | 関数型 | 論理型 |
| ---------- | :------: | :----: | :----------------: | :----: | :----: | :----: | :----: |
| C          |    ✅    |        |                    |        |        |        |        |
| COBOL      |    ✅    |        |                    |        |        |        |        |
| Go         |    ✅    |        |                    |        |        |        |        |
| Java       |          |        |         ✅         |   ✅   |        |        |        |
| JavaScript |          |        |         ✅         |   ✅   |        |   ✅   |        |
| LISP       |          |        |                    |        |   ✅   |        |        |
| Pascal     |          |   ✅   |                    |        |        |        |        |
| Perl       |    ✅    |        |                    |        |        |        |        |
| Prolog     |          |        |                    |        |        |        |   ✅   |
| PHP        |          |        |         ✅         |   ✅   |        |        |        |
| PL/I       |          |   ✅   |                    |        |        |        |        |
| Python     |          |        |         ✅         |   ✅   |        |   ✅   |        |
| R          |          |        |                    |        |        |   ✅   |        |
| Ruby       |          |        |         ✅         |   ✅   |        |        |        |
| Rust       |    ✅    |   ✅   |         ✅         |   ✅   |        |   ✅   |        |
| Scala      |          |        |         ✅         |        |   ✅   |   ✅   |        |
| SQL        |          |        |                    |        |   ✅   |        |        |

> - [プログラミングパラダイムとは？種類やそれぞれの特徴を詳しく解説 - SHIFT TERAS CAMPUS](https://web-camp.io/magazine/archives/61816)
> - [プログラミングパラダイム一覧！種類やそれぞれの概要を簡単に解説！ ｜ 案件評判](https://anken-hyouban.com/blog/2020/10/09/programming-paradigm/)
> - [プログラミングの考え方を変えるパラダイムとは？分かりやすく解説しました！ \| ポテパンスタイル](https://style.potepan.com/articles/12941.html)

<br>

## 02. 機械語翻訳方式による分類

### 機械語翻訳方式とは

プログラム言語のコードは、言語プロセッサーによって機械語に変換された後、CPU によって実行される。

そして、コードに書かれたさまざまな処理が実行される。

機械語に変換されるまでの処理方式には種類がある。

![コンパイル型とインタプリタ型言語](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/コンパイル型とインタプリタ型言語.jpg)

<br>

### 方式に基づく言語の種類

#### ▼ コンパイラ型言語

コンパイラという言語プロセッサーによって、コンパイラ方式で翻訳される言語。

**＊例＊**

- Go
- C
- C#

#### ▼ インタプリタ型言語

インタプリタという言語プロセッサーによって、インタプリタ方式で翻訳される言語をインタプリタ型言語という。

**＊例＊**

- PHP
- Ruby
- JavaScript
- Python

#### ▼ 中間型言語

JVM (Java Virtual Machine) によって、中間言語方式で翻訳される。

**＊例＊**

- Java
- Scala
- Groovy
- Kotlin

> - [1.2 Javaとは \| 神田ITスクール](https://kanda-it-school-kensyu.com/java-basic-intro-contents/jbi_ch01/jbi_0102/)

<br>

## 03. 型システムによる分類

### 型システムとは

プログラミングの構成要素 (データ、変数、関数) に対して、『型』という特性を付与する仕組みのこと。

> - [型システム - Wikipedia](https://ja.wikipedia.org/wiki/%E5%9E%8B%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0)

<br>

### 型付けに基づく言語の種類

#### ▼ 静的型付け

**＊例＊**

- C
- Go
- Java
- Scala

#### ▼ 動的型付け

**＊例＊**

- PHP
- Python
- Ruby

<br>
