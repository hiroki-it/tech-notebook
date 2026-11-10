---
title: 【IT技術の知見】データ・型
description: データ・型の知見を記録しています。
tags:
  - "言語"
  - "TypeScript"
  - "言語機能"
---

# データ・型

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 型

### プリミティブ型

#### ▼ 文字列 (String)

```typescript
let str: string = "hello";
str = 0; // これはエラーになる
```

> - [TypeScriptの型定義まとめ【Reactも対応】](https://zenn.dev/akkie1030/articles/9f2304544245b2#%E3%83%97%E3%83%AA%E3%83%9F%E3%83%86%E3%82%A3%E3%83%96%E5%80%A4%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9)

#### ▼ 数値 (Number)

```typescript
let num: number = 0;
num = "0"; // これはエラーになる
```

> - [TypeScriptの型定義まとめ【Reactも対応】](https://zenn.dev/akkie1030/articles/9f2304544245b2#%E3%83%97%E3%83%AA%E3%83%9F%E3%83%86%E3%82%A3%E3%83%96%E5%80%A4%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9)

#### ▼ 巨大な数値 (bigint)

```typescript
let big: bigint = 10n;
big = 0; // これはエラーになる
```

> - [TypeScriptの型定義まとめ【Reactも対応】](https://zenn.dev/akkie1030/articles/9f2304544245b2#%E3%83%97%E3%83%AA%E3%83%9F%E3%83%86%E3%82%A3%E3%83%96%E5%80%A4%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9)

#### ▼ 真偽値 (Boolean)

```typescript
let bool: boolean = true;
bool = 1; // これはエラーになる
```

> - [TypeScriptの型定義まとめ【Reactも対応】](https://zenn.dev/akkie1030/articles/9f2304544245b2#%E3%83%97%E3%83%AA%E3%83%9F%E3%83%86%E3%82%A3%E3%83%96%E5%80%A4%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9)

#### ▼ Null

```typescript
let n: null = null;
n = undefined; // これはエラーになる
```

> - [TypeScriptの型定義まとめ【Reactも対応】](https://zenn.dev/akkie1030/articles/9f2304544245b2#%E3%83%97%E3%83%AA%E3%83%9F%E3%83%86%E3%82%A3%E3%83%96%E5%80%A4%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9)

#### ▼ Undefined

```typescript
let u: undefined = undefined;
u = null; // これはエラーになる
```

> - [TypeScriptの型定義まとめ【Reactも対応】](https://zenn.dev/akkie1030/articles/9f2304544245b2#%E3%83%97%E3%83%AA%E3%83%9F%E3%83%86%E3%82%A3%E3%83%96%E5%80%A4%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9)

#### ▼ シンボル (Symbol)

```typescript
let sym: symbol = Symbol();
sym = ""; // これはエラーになる
```

> - [TypeScriptの型定義まとめ【Reactも対応】](https://zenn.dev/akkie1030/articles/9f2304544245b2#%E3%83%97%E3%83%AA%E3%83%9F%E3%83%86%E3%82%A3%E3%83%96%E5%80%A4%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9)

<br>

### 配列型

#### ▼ 配列とは

可変的な要素数、順序は自由、型はすべて同じデータ型である。

#### ▼ 変数

```typescript
const strArray: string[] = ["a", "b", "c"];

strArray.push(0);
```

```typescript
const numArray: number[] = [1, 2, 3];

numArray.push("a");
```

> - [TypeScriptの型定義まとめ【Reactも対応】](https://zenn.dev/akkie1030/articles/9f2304544245b2#%E9%85%8D%E5%88%97%E5%9E%8B%E5%AE%9A%E7%BE%A9)

#### ▼ 配列の走査

```typescript
const numbers = [10, 20, 30];

const total = numbers.reduce<number>(
  (result, value) => {
    // 現在の合計値（result）に、現在の要素（value）を加算する
    return result + value;
  },
  // 合計の初期値を0に設定する
  0,
);

console.log(total); // 60
```

<br>

### タプル型

#### ▼ タプルとは

配列の一種である。

固定の要素数、順序は固定、型は自由なデータ型である。

#### ▼ 返却値

```typescript
const foo = (a: number, b: string): [number, string] => {
  return [a, b];
};

const result = foo(1, "Alice");
```

<br>

### ジェネリクス型

#### ▼ 変数

```typescript
// string[] と同じ
const str: Array<string> = ["a", "b", "c"];
```

```typescript
// (string|number)[] と同じ
const strOrNum: Array<string | number> = ["a", "b", 1, 2];
```

```typescript
// string{} と同じ
const str: Map<string> = {a: "a", b: "b", c: "c"};
```

> - [TypeScriptの型定義まとめ【Reactも対応】](https://zenn.dev/akkie1030/articles/9f2304544245b2#%E3%82%B8%E3%82%A7%E3%83%8D%E3%83%AA%E3%82%AF%E3%82%B9%E5%9E%8B%E5%AE%9A%E7%BE%A9)

#### ▼ 返却値

```typescript
// Promise<型>
async function asyncFn(): Promise<string> {
  // 非同期処理
  return "executed";
}

console.log(await asyncFn());
```

> - [TypeScriptの型定義まとめ【Reactも対応】](https://zenn.dev/akkie1030/articles/9f2304544245b2#%E9%9D%9E%E5%90%8C%E6%9C%9F%E5%87%A6%E7%90%86%E3%81%AE-promise-%E3%81%AE%E6%88%BB%E3%82%8A%E5%80%A4)

#### ▼ 型変数（ジェネリクス）

安全な any 型ともいえる。

型変数では、定義した時点で型が決まっていない。

コール時に型変数へ任意の型を推論で代入し、それに合わせた引数型と返却型の関数を定義できる。

```typescript
// 最初の<T>    型変数を定義
// (value: T)  引数型で型変数を使用
// : T         返却値型で型変数を使用

const foo = <T>(value: T): T => {
  // ...
  return value;
}
```

```typescript
// この時点では、引数型と返却値型は決まっていない
// 変数名はなんでもよく、単語でもいい
const foo = <T>(value: T): T => {
  return value;
}

// 型変数に文字を代入すると、これを推論し、string型の引数型と返却値型を定義していたことになる
foo("a");

// number型の引数型と返却値型を定義していたことになる
foo(1);
```

```typescript
// この時点では、引数型と返却値型は決まっていない
// 変数名はなんでもよく、単語でもいい
const foo = <T>(value: T): Promise<T> => {
  return value;
};

// 型変数に文字を代入すると、これを推論し、Promise<string>型の引数型と返却値型を定義していたことになる
foo("a");

// Promise<string>型の引数型と返却値型を定義していたことになる
foo(1);
```

```typescript
// この時点では、型変数 (T、U) の型は決まっていない
// 変数名はなんでもよく、単語でもいい
const foo = <T, U>(key1: T, key2: U): Array<T | U> => {
  return [key1, key2];
};

// 型変数に文字を代入すると、これを推論し、string型の引数型と返却値型を定義していたことになる
foo<string, string>("a", "b");

// number型の引数型と返却値型を定義していたことになる
foo<number, number>(1, 2);

// boolean型の引数型と返却値型を定義していたことになる
foo<boolean, boolean>(true, false);

// 複数の型を組み合わせることもできる
foo<string, number>("a", 1);
```

```typescript
const measureFunctionExecutionTime = async <T>(
  fn: () => Promise<T>,
): Promise<{result: T; executionTime: number; startAtTimestamp: string}> => {
  // 計測開始
  // 計測にはperformance.now()のほうが適切であるが、ISO形式に変換してタイムスタンプを取得する必要があるため、これに対応するDate.now()を使用する
  const startAt = Date.now();

  const result = await fn();

  // 計測終了
  const executionTime = Date.now() - startAt;
  const startAtTimestamp = new Date(startAt).toISOString();

  // 関数の処理結果と実行時間を返却する
  return {
    result: result,
    executionTime: executionTime,
    startAtTimestamp: startAtTimestamp,
  };
};

// この時点では、引数型と返却値型は決まっていない
// 変数名はなんでもよく、単語でもいい
const foo = <T>(value: T): Promise<T> => {
  return value;
};

// 型変数に文字を代入すると、これを推論し、fn: () => Promise<T> のTが決まる
measureFunctionExecutionTime(foo);
```

> - [TypeScriptの型定義まとめ【Reactも対応】](https://zenn.dev/akkie1030/articles/9f2304544245b2#%E3%82%B8%E3%82%A7%E3%83%8D%E3%83%AA%E3%82%AF%E3%82%B9%E5%9E%8B%E5%AE%9A%E7%BE%A9)

<br>

### 数値型

#### ▼ 引数

```typescript
const sum = (x: number, y: number) => {
  return x + y;
};

console.log(sum(1, 2));

console.log(sum(1, "2")); // Argument of type 'string' is not assignable to parameter of type 'number'.

console.log(sum(1)); // Expected 2 arguments, but got 1.
```

#### ▼ 返却値

```typescript
const sum = (x: number, y: number): number => {
  return x + y;
};
```

> - [TypeScriptの型定義まとめ【Reactも対応】](https://zenn.dev/akkie1030/articles/9f2304544245b2#%E9%96%A2%E6%95%B0%E3%81%AE%E5%BC%95%E6%95%B0%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9)

<br>

### 返却値なし

```typescript
// 返却値がないという型
const logger = (): void => {
  console.log("log");
};
```

> - [TypeScriptの型定義まとめ【Reactも対応】](https://zenn.dev/akkie1030/articles/9f2304544245b2#%E6%88%BB%E3%82%8A%E5%80%A4%E3%81%8C%E3%81%AA%E3%81%84%E5%A0%B4%E5%90%88%E3%81%AE-void)

<br>

### Error オブジェクト型

#### ▼ ビルトイン

```typescript
interface Error {
  name: string;
  message: string;
  stack?: string;
}
```

#### ▼ 独自の Error オブジェクト型

ステータスコードに応じたエラーを継承すると、`try-catch` で扱いやすくなる。

基本的には、ビルトインの Error オブジェクトを継承する。

```typescript
// Errorオブジェクトを継承した独自のErrorオブジェクト
class FooError extends Error {
  private readonly _name: string;
  private readonly _code: number;

  constructor() {
    super(`Fooでエラーがあります`);

    Object.setPrototypeOf(this, new.target.prototype);

    // 親のErrorオブジェクトのプロパティに設定
    this.name = "FooError";
    this._code = 400;
  }
}
```

プロパティを Error オブジェクトの外から渡す場合は、次のとおりで実装する。

```typescript
// Errorオブジェクトを継承した独自のErrorオブジェクト
class FooError extends Error {
  private readonly _name: string;
  private readonly _code: number;

  constructor(message: string, code: number) {
    // message変数はErrorオブジェクトに渡す
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    // 親のErrorオブジェクトのプロパティに設定
    this._name = "FooError";
    this._code = code;
  }
}
```

独自の Error オブジェクトでは、必ずしも、Error オブジェクトを継承する必要はない。

例えば、任意の Error オブジェクトと実行時間や開始時間をプロパティにもつ `FailedResult` クラスがある。

独自の Error オブジェクトのプロパティに実行時間や開始時間を入れればいいと考えるかもしれないが、外部ツールの任意の Error オブジェクトには外からこれらを設定できないため、整合性が合わなくなる。

一方で、Error オブジェクトのプロパティへ実行時間や開始時間を入れれば、任意の Error オブジェクトへ対応できるようになる。

```typescript
export class FailedResult {
  // resultプロパティにはErrorオブジェクトが入る
  private readonly _result: unknown;
  private readonly _executionTime?: number;
  private readonly _startAtTimestamp?: string;

  constructor({
    result,
    executionTime,
    startAtTimestamp,
  }: {
    result: unknown;
    executionTime?: number;
    startAtTimestamp?: string;
  }) {
    this._result = result;
    this._executionTime = executionTime;
    this._startAtTimestamp = startAtTimestamp;
  }

  get result() {
    return this._result;
  }

  get executionTime() {
    return this._executionTime;
  }

  get startAtTimestamp() {
    return this._startAtTimestamp;
  }
}
```

<br>

### 不明／任意

#### ▼ unknown

`unknown` を使用した場合、それ以降の処理では型を無視して処理する。

```typescript
function foo(): string | unknown {
  try {
    // 何らかの処理

    return "success";
  } catch (error: unknown) {
    if (error instanceof Error) {
      // unknownを使用したため、Error型として暗黙的に処理される
      console.error(error.message);
    } else {
      // unknownを使用したため、Error型以外の型として暗黙的に処理される
      console.error("Unknown error:", error);
    }
    return error;
  }
}
```

> - [TypeScript のエラーハンドリングを考える #TypeScript - Qiita](https://qiita.com/frozenbonito/items/e708dfb3ab7c1fd3824d)

#### ▼ any

`any` を使用した場合、それ以降の処理では型を無視して処理する。

```typescript
function foo(): string | any {
  try {
    // 何らかの処理

    return "success";
  } catch (error: any) {
    if (error instanceof Error) {
      // anyを使用したため、Error型ではなく型無しとして暗黙的に処理される
      console.error(error.message);
    } else {
      // anyを使用したため、型無しとして暗黙的に処理される
      console.error("Unknown error:", error);
    }
    return error;
  }
}
```

> - [TypeScript のエラーハンドリングを考える #TypeScript - Qiita](https://qiita.com/frozenbonito/items/e708dfb3ab7c1fd3824d)

<br>

## 02. 型推論

### 暗黙的

```typescript
let name = "John"; // 変数nameは文字列として推論されます
let age = 30; // 変数ageは数値として推論されます
let isProgrammer = true; // 変数isProgrammerはブール値として推論されます
```

> - [TypeScriptの型推論を徹底解説 - Recursion](https://recursionist.io/learn/languages/typescript/introduction/type-inference)

<br>

### 明示的

```typescript
let name: string = "John";
let age: number = 30;
let isProgrammer: boolean = true;
```

> - [TypeScriptの型推論を徹底解説 - Recursion](https://recursionist.io/learn/languages/typescript/introduction/type-inference)

<br>

### 型アサーション

#### ▼ 型アサーションとは

型を上書きする。

キャストではないらしい。

> - [Type Assertion（型アサーション） \| TypeScript Deep Dive 日本語版](https://typescript-jp.gitbook.io/deep-dive/type-system/type-assertion)

#### ▼ `as` 構文

指定した型に上書きする。

```typescript
const value: string | number = "this is a string";
const strLength: number = (value as string).length;
```

> - [型アサーション「as」(type assertion) \| TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/values-types-variables/type-assertion-as#%E5%9E%8B%E3%82%A2%E3%82%B5%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E6%9B%B8%E3%81%8D%E6%96%B9)

#### ▼ アングルブラケット構文

指定した型に上書きする。

```typescript
const value: string | number = "this is a string";
const strLength: number = (<string>value).length;
```

> - [型アサーション「as」(type assertion) \| TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/values-types-variables/type-assertion-as#%E5%9E%8B%E3%82%A2%E3%82%B5%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E6%9B%B8%E3%81%8D%E6%96%B9)

#### ▼ 非 `null` アサーション (`!`)

`null` を含まない型に上書きする。

例えば、変数の型が `<任意の型> | null` である場合に、`<任意の型>` に上書きする。

```typescript
// string型またはnullを許容する
function foo(value: string | null) {
  // nullを含まないstring型に上書きする
  const stringNotNull = value!;
  console.log(stringNotNull.toUpperCase());
}
```

ただし、型ガードしてもよい。こちらのほうが明示的だが、実装量が増えてしまう点がデメリットである。

```typescript
// string型またはnullを許容する
function foo(value: string | null) {
  if (value === null) {
    return;
  }
  // string型として扱われる
  const stringNotNull = value.toUpperCase();
  console.log(stringNotNull);
}
```

> - [【TypeScript】型ガードと型アサーションでunknown型を使い勝手良くする #TypeScript - Qiita](https://qiita.com/terry_6518/items/ba54a60afcb758b9b242#%E5%9E%8B%E3%82%A2%E3%82%B5%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E4%BD%BF%E3%81%84%E6%89%80)

<br>

### 型ガード

複数の型を許容している場合に、`if` 文を使用して型を絞り込むこと。

より寛容な型 (`any`) ほど、型ガードのパターンが増える。

```typescript
// string型またはnumber型を許容する
function foo(value: string | number) {
  if (typeof value === "string") {
    // string型として扱われる
    console.log(value.toUpperCase());
  } else {
    // 残りのnumber型として扱われる
    console.log(value.toFixed(2));
  }
}
```

<br>

### 複数の型

#### ▼ プロパティで複数の型を許容

`name` プロパティは `string` 型と `undefined` 型を許容している。

`undefined` 型のほうが網羅範囲は広い。結果的に `undefined` 型として扱われる。

```typescript
type User = {
  id: number;
  name: string | undefined;
};

const user1: User = {id: 1, name: "Alice"};
const user2: User = {id: "abc123", name: "Bob"};
```

#### ▼ オブジェクト全体で複数の型を用意

`name` プロパティが `string` 型の User と、`undefined` 型の UserWithoutName を別々に定義している。

`undefined` 型のほうが網羅範囲は広い。結果的に `undefined` 型として扱われる。

```typescript
type User = {
  id: number;
  name: string;
};

type UserWithoutName = {
  id: number;
  name: undefined;
};

const user1: User = {id: 1, name: "Alice"};
const user2: UserWithoutName = {id: 1, name: undefined};
```

<br>

## 03. 独自の型宣言

### 比較

type エイリアス宣言のほうが型としての強制力が高い。

また、interface 宣言はオブジェクト指向の文脈でメソッドの仕様を持たせることが多く、型の文脈では適さない（と個人的に思っている）

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>type エイリアス宣言</th>
      <th>interface 宣言</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>継承</td>
      <td>基本はできない (交差型のみできる)</td>
      <td>できる</td>
    </tr>
    <tr>
      <td>継承時の上書き</td>
      <td>基本はできない (交差型のみできる)</td>
      <td>できる</td>
    </tr>
    <tr>
      <td>同名の型</td>
      <td>できない</td>
      <td>できる</td>
    </tr>
    <tr>
      <td>Mapped Types 型</td>
      <td>できる</td>
      <td>できない</td>
    </tr>
  </tbody>
</table>

> - [interfaceとtypeの違い \| TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/object-oriented/interface/interface-vs-type-alias#%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E3%81%A8%E5%9E%8B%E3%82%A8%E3%82%A4%E3%83%AA%E3%82%A2%E3%82%B9%E3%81%AE%E9%81%95%E3%81%84)
> - [interfaceとtypeの違い \| TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/object-oriented/interface/interface-vs-type-alias#%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E3%81%A8%E5%9E%8B%E3%82%A8%E3%82%A4%E3%83%AA%E3%82%A2%E3%82%B9%E3%81%AE%E4%BD%BF%E3%81%84%E5%88%86%E3%81%91)

<br>

### type エイリアス宣言

#### ▼ type エイリアス宣言とは

オブジェクト以外の型を宣言する場合、type エイリアス宣言を使用する。

ただ、オブジェクトで type エイリアス宣言を使用してもよい。

```typescript
type Foo = {
  bar: number;
  baz: Date;
  qux: string;
};
```

#### ▼ オプショナル型

プロパティがないことを許容する型である。

```typescript
type A = {foo?: string; bar?: number};

// fooやbarが存在しない場合も許容する
function method(arg: A): void {
  const fooValue = arg.foo ?? "(fooなし)";
  const barValue = arg.bar ?? "(barなし)";
  console.log(`foo: ${fooValue}`, `bar: ${barValue}`);
}

// fooのみでもOK
method({foo: "FOO"});

// barのみでもOK
method({bar: 1});

// どちらもなくてもOK
method({});
```

#### ▼ 交差型（Intersection）

複数の型を同時に満たす型である。

型を指定した処理では、両方の型を指定しないといけない。

```typescript
type A = {foo: string};
type B = {bar: number};

// 複数の型を同時に満たす
type AB = A & B;

// 両方の型を指定する
function method(arg: AB): void {
  console.log(`foo: ${arg.foo}, bar: ${arg.bar}`);
}
```

> - https://tyotto-good.com/typescript/union-intersection-type

#### ▼ 合併型 (Union)

複数の型のいずれかを満たす型である。

型を指定した処理では、いずれかの型を指定しなければならない。

```typescript
type A = {foo: string};
type B = {bar: number};

// 複数の型のいずれかを満たす
type AB = A | B;

function method(arg: AB): void {
  // いずれかの型を指定しないといけない
  if ("foo" in arg) {
    console.log(`foo: ${arg.foo}`);
    return;
  }

  console.log(`bar: ${arg.bar}`);
  return;
}
```

> - https://tyotto-good.com/typescript/union-intersection-type

<br>

### interface 宣言

オブジェクトの型を宣言する場合、interface 宣言を使用する。

ただ、オブジェクトで type エイリアス宣言を使用してもよい。

```typescript
interface Foo {
  bar: number;
  baz: Date;
  qux: string;
}
```

<br>

