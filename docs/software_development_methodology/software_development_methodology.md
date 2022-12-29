---
title: 【IT技術の知見】ソフトウェア開発手法論
description: ソフトウェア開発手法論の知見を記録しています。
---

# ソフトウェア開発手法論

### はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. チーム開発手法の種類

### ウォーターフォール型開発

#### ▼ ウォーターフォール型開発とは

![ウォーターフォール型](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ウォーターフォール型.png)

#### ▼ 外部設計の詳細

  外部設計では、ユーザ向けのソフトウェア設計が行われる。



![外部設計の詳細](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/外部設計の詳細.png)

<br>

### プロトタイプ型開発

#### ▼ プロトタイプ型開発とは

ソフトウェア設計に入るまでに試作品を作り、要件定義をより正確にする。



> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p456](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p456.png)

<br>

### RAD（Rapid Application Development）

#### ▼ RADとは

Visual Basicなどの開発支援ツールを使用して、短期間で設計～テストまでを繰り返す。



> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p462-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p462-1.png)

![p462-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p462-2.png)

<br>

### スパイラル型開発

#### ▼ スパイラル型開発とは

ソフトウェアをいくつかのサブシステムに分割し、ウォーターフォール型開発で各サブシステムを開発していく。



![p457](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p457.png)

<br>

### アジャイル型開発

#### ▼ アジャイル型開発とは

スパイラルモデルの派生型。

スパイラルモデルよりも短い期間で、設計～テストまでを繰り返す。



> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p463](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p463.png)

<br>

### リバースエンジニアリング

#### ▼ リバースエンジニアリングとは

すでにある具体的な実装から、抽象的なアーキテクチャを導く手法のこと。



<br>

### フルサイクルエンジニアリング

#### ▼ フルサイクルエンジニアリングとは

機能開発に対して、一人のエンジニアが開発から運用までの一連の作業（インフラ/アプリ/デザインの開発、ホワイトボックステスト、ブラックボックステスト、リリース、運用）を行う手法のこと。責務が分離されないことにより、開発からリリースまでの速度が上がり、ユーザーから素早く評価を得られるようになる。そのため、SREの実践になる。

![full-cycle-engineering](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/full-cycle-engineering.png)

<br>

## 02. その他

### CASEツール：Computer Aided Software Enginnering

#### ▼ CASEツールとは

ソフトウェア開発をサポートする手法のこと。



#### ▼ 上流CASEツール

データフロー図、ER図

#### ▼ 下流CASEツール

テスト支援ツール

#### ▼ 保守CASEツール

リバースエンジニアリング

> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p459](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p459.png)

<br>
