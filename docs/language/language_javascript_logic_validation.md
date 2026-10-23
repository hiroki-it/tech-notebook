---
title: 【IT技術の知見】バリデーションロジック＠JavaScript
description: バリデーションロジック＠JavaScriptを記録しています。
---

# バリデーションロジック＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. バリデーション

### バリデーションの必要性の有無

#### ▼ 不要な場合

DB から読み込んだ後に直接的に表示する値の場合、DB で Null にならないように制約をかけられる。

そのため、値が想定通りの状態になっているかをあらためてバリデーションする必要はない。

#### ▼ 必要な場合

DB からの値を直接的に表示する場合と異なり、新しく作られる値を使用する場合、その値が想定外の状態になっている可能性がある。

そのため、値が想定通りの状態になっているかをバリデーションする必要がある。

<br>

### バリデーションパターンとバリデーション関数の対応

✅：`TRUE` になる。

空欄：`FALSE` になる。

<table>
  <thead>
    <tr>
      <th style="text-align:center">バリデーションパターン</th>
      <th style="text-align:center"><code>typeof $var</code></th>
      <th style="text-align:center"><code>if($var)</code></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:center"><strong><code>null</code></strong></td>
      <td style="text-align:center"><code>object</code></td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td style="text-align:center"><strong><code>0</code></strong></td>
      <td style="text-align:center"><code>number</code></td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td style="text-align:center"><strong><code>1</code></strong></td>
      <td style="text-align:center"><code>number</code></td>
      <td style="text-align:center">✅</td>
    </tr>
    <tr>
      <td style="text-align:center"><strong><code>&quot;&quot;</code></strong> (空文字)</td>
      <td style="text-align:center"><code>string</code></td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td style="text-align:center"><strong><code>&quot;あ&quot;</code></strong></td>
      <td style="text-align:center"><code>string</code></td>
      <td style="text-align:center">✅</td>
    </tr>
    <tr>
      <td style="text-align:center"><strong><code>NaN</code></strong></td>
      <td style="text-align:center"><code>number</code></td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td style="text-align:center"><strong><code>undefined</code></strong></td>
      <td style="text-align:center"><code>undefined</code></td>
      <td style="text-align:center"></td>
    </tr>
  </tbody>
</table>

<br>
