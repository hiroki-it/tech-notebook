---
title: 【IT技術の知見】関数型
description: 関数型の知見を記録しています。
---

# 関数型

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 副作用

同じ入力であっても出力が異なっていたり、外部の状態に依存するロジックのこと。

- ファイルやデータベースへの書き込み
- HTTPリクエストや外部APIとの通信
- DOMの操作や画面描画
- グローバル変数や外部スコープの変更
- ログ出力や例外のスロー

関数型では、副作用のないロジックを持つ関数を定義する必要がある。

<br>

## 02. 関数の引数

### 一覧

| 観点                             | プリミティブ型を渡すべき場合 | オブジェクトを渡すべき場合 |
| -------------------------------- | :--------------------------: | :------------------------: |
| 純粋性を保ちたい                 |              ✅              |                            |
| 汎用性・再利用性を高めたい       |              ✅              |                            |
| 関数の責務を絞りたい             |              ✅              |                            |
| ドメインロジックが値単体に基づく |              ✅              |                            |
| 複数プロパティ間の相互作用がある |                              |             ✅             |

<br>

### プリミティブ型

```typescript
type User = {
  // データ
  name: string;
  age: number;
};

// 振る舞い
function isAdultAge(age: number): boolean {
  return age >= 18;
}

// オブジェクトの状態を設定する
const u: User = {name: "Alice", age: 20};

console.log(isAdultAge(u.age)); // true
```

<br>

### オブジェクト

```typescript
type User = {
  // データ
  name: string;
  age: number;
};

// 振る舞い
function isAdult(number: User): boolean {
  return user.age >= 18;
}

// オブジェクトの状態を設定する
const u: User = {name: "Alice", age: 20};
console.log(isAdult(u)); // true
```

<br>
