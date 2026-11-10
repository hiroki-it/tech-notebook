---
title: 【IT技術の知見】モジュール
description: モジュールの知見を記録しています。
tags:
  - "言語"
  - "Go"
  - "言語機能"
---

# モジュール

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. import

### ▼ 通常のインポート

```go
package main

import "<パッケージ名>"
```

### ▼ ブランクインポート

パッケージ内の `init()` 関数のみを実行したい場合がある。

この場合、パッケージ名を `_` で宣言する。

```go
package main

import _ "<パッケージ名>" // init関数のみを実行する
```

> - [Go言語にて依存関係を解決するためのimportにはアンダースコア（ブランク識別子）を別名とする - 映画館のイス](https://hogesuke.hateblo.jp/entry/2014/09/12/080005)
> - [Go言語のブランクimport(\_ "パッケージ名")とは？ #Go - Qiita](https://qiita.com/atsutama/items/0444ad3fdb25f095b0d6#%E3%83%96%E3%83%A9%E3%83%B3%E3%82%AFimport%E3%81%A3%E3%81%A6)

<br>

