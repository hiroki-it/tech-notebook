---
title: 【IT技術の知見】バリデーション
description: バリデーションの知見を記録しています。
tags:
  - "言語"
  - "PHP"
  - "言語機能"
---

# バリデーション

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

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
      <th style="text-align:center"><code>isset($var)</code>、<code>!is_null($var)</code></th>
      <th style="text-align:center"><code>if($var)</code>、<code>!empty($var)</code></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:center"><strong><code>null</code></strong></td>
      <td style="text-align:center"></td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td style="text-align:center"><strong><code>0</code></strong></td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td style="text-align:center"><strong><code>1</code></strong></td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center">✅</td>
    </tr>
    <tr>
      <td style="text-align:center"><strong><code>&quot;&quot;</code></strong> (空文字)</td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td style="text-align:center"><strong><code>&quot;あ&quot;</code></strong></td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center">✅</td>
    </tr>
    <tr>
      <td style="text-align:center"><strong><code>array(0)</code></strong></td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td style="text-align:center"><strong><code>array(1)</code></strong></td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center">✅</td>
    </tr>
    <tr>
      <td style="text-align:center"><strong>使いどころ</strong></td>
      <td style="text-align:center"><code>null</code> のみをバリデーションしたい場合</td>
      <td style="text-align:center"><code>null</code>、<code>0</code>、<code>&quot;&quot;</code>、<code>[]</code> をバリデーションしたい場合</td>
    </tr>
  </tbody>
</table>

> - [PHP isset, empty, is_null の違い早見表 #PHP - Qiita](https://qiita.com/shinichi-takii/items/00aed26f96cf6bb3fe62)

<br>

## 02. インスタンスのバリデーション

### 等価演算子

#### ▼ イコールが `2` 個の場合

同じオブジェクトから別々に作られたインスタンスであっても、『同じもの』として認識される。

```injectablephp
<?php

class Example {};

if(new Example == new Example){
    echo "同じです";
} else { echo "異なります"; }

// 実行結果
// 同じです
```

#### ▼ イコールが `3` 個の場合

同じオブジェクトから別々に作られたインスタンスであっても、『異なるもの』として認識される。

```injectablephp
<?php

class Example {};

if (new Example === new Example) {
    echo "同じです";
} else {
    echo "異なります";
}

// 実行結果
// 異なります
```

同じインスタンスの場合のみ、『同じもの』として認識される。

```injectablephp
<?php

class Example {};

$a = $b = new Example;

if ($a === $b) {
    echo "同じです";
} else {
    echo "異なります";
}

// 実行結果
// 同じです
```

<br>
