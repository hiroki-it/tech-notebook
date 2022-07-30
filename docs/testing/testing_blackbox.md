---
title: 【IT技術の知見】ブラックボックステスト
description: ブラックボックステストの知見を記録しています。
---

# ブラックボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ブラックボックステスト

### ブラックボックステストとは

ホワイトボックステストと組み合わせてユニットテストを構成する。実装内容は気にせず、入力に対して、適切な出力が行われているかを検証する。ユニットテストとホワイト/ブラックボックステストの関係性については、以下の書籍を参考にせよ。

ℹ️ 参考：https://www.amazon.co.jp/dp/477415377X

![p492-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p492-1.jpg)

<br>

### ブラックボックステストの種類

- 結合テスト
- システムテスト

<br>

## 02. 結合テスト

### 結合テストとは

単体テストの次に行うテスト。複数のモジュールを繋げ、モジュール間のインターフェイスが適切に動いているかを検証。

![結合テスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p491-1.jpg)

<br>

### 結合テストの方向

#### ▼ トップダウンテスト

上層のモジュールから下層のモジュールに向かって、結合テストを行う。下層にはテストダブルのスタブを作成する。

![トップダウンテスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/トップダウンテスト.jpg)

<br>

#### ▼ ボトムアップテスト

下層のモジュールから上層のモジュールに向かって、結合テストを行う。上層にはテストダブルのドライバーを作成する。

![ボトムアップテスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ボトムアップテスト.jpg)

<br>

### シナリオテスト

実際の業務フローを参考にし、ユーザーが操作する順にテストを行う。

<br>

