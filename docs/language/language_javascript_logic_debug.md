---
title: 【IT技術の知見】デバッグロジック＠JavaScript
description: デバッグロジック＠JavaScriptを記録しています。
---

# デバッグロジック＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. JavaScript

### デバッグに有効な関数

#### ▼ Console API

<table>
  <thead>
    <tr>
      <th>関数名</th>
      <th>出力内容</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>console.clear()</code> 関数</td>
      <td>コンソール画面をクリアにする</td>
    </tr>
    <tr>
      <td><code>console.count()</code> 関数</td>
      <td>実行するたびにカウントアップして回数を出力する</td>
    </tr>
    <tr>
      <td><code>console.dir()</code> 関数</td>
      <td>オブジェクトが持つプロパティの一覧をリストで出力する</td>
    </tr>
    <tr>
      <td><code>console.error()</code> 関数</td>
      <td>エラー情報として出力する (他に、<code>info()</code> 関数や <code>warn()</code> 関数もあり)</td>
    </tr>
    <tr>
      <td><code>console.group()</code> 関数</td>
      <td>インデントを付けて出力することにより階層構造を持たせる (<code>groupEnd()</code> 関数で終了する)</td>
    </tr>
    <tr>
      <td><code>console.log()</code> 関数</td>
      <td>任意の値を出力する</td>
    </tr>
    <tr>
      <td><code>console.table()</code> 関数</td>
      <td>配列やオブジェクトなどの構造をテーブル表にして出力する</td>
    </tr>
    <tr>
      <td><code>console.time()</code> 関数</td>
      <td><code>time()</code> 関数から <code>timeEnd()</code> 関数までの間にある処理を計測する</td>
    </tr>
    <tr>
      <td><code>console.trace()</code> 関数</td>
      <td>呼び出し元を出力する。</td>
    </tr>
  </tbody>
</table>

<br>
