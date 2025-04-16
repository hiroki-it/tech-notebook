---
title: 【IT技術の知見】デバッグの豆知識＠JavaScript
description: デバッグの豆知識＠JavaScriptを記録しています。
---

# デバッグの豆知識＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. JavaScript

### デバッグに有効なメソッド

#### ▼ Console API

| メソッド名          | 出力内容                                                                          |
| ------------------- | --------------------------------------------------------------------------------- |
| `console.clear`関数 | コンソール画面をクリアにする                                                      |
| `console.count`関数 | 実行する度にカウントアップして回数を出力する                                      |
| `console.dir`関数   | オブジェクトが持つプロパティの一覧をリストで出力する                              |
| `console.error`関数 | エラー情報として出力する (他に、`info`関数や`warn`関数もあり)                     |
| `console.group`関数 | インデントを付けて出力することにより階層構造を持たせる (`groupEnd`関数で終了する) |
| `console.log`関数   | 任意の値を出力する                                                                |
| `console.table`関数 | 配列やオブジェクトなどの構造をテーブル表にして出力する                            |
| `console.time`関数  | `time`関数から`timeEnd`関数までの間にある処理を計測する                           |
| `console.trace`関数 | 呼び出し元を出力する。                                                            |

<br>
