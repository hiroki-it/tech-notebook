---
title: 【IT技術の知見】モジュール
tags:
  - "言語"
  - "JavaScript"
  - "言語機能"
---

# モジュール

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. ファイル外で読み込む

関数の前で `export` を宣言する。

関数の定義と `export` の宣言を同時に実行する。

```javascript
export function foo() {
  return "foo";
}
```

あるいは、別々に実行する。

```javascript
const foo = () => {
  return "foo";
};

export default foo;
```

<br>

