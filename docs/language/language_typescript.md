---
title: 【IT技術の知見】TypeScript
description: TypeScriptの知見を記録しています。
tags:
  - "言語"
  - "TypeScript"
---

# TypeScript

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>01. TypeScript とは

## 01. TypeScript とは

静的型付けのフロントエンド言語である。

`tsconfig.json` ファイルに基づいて、TypeScript ファイルをコンパイルし、JavaScript ファイルを作成する。

拡張子として、`ts` と `tsx` (TypeScript 内に JSX を実装できる) を使用できる。

> - [TypeScriptの設定ファイル「tsconfig」。最初に知っておきたい設定をピックアップ！ │ Ugo](https://ugo.tokyo/ts-config/#outline__1)

<br>

## 02. 型検証の仕組み

### 型検証の有無

TypeScript は静的型付け言語のため、コンパイル時に型検証 (変数、引数、返却値で指定された型に対して、渡される値の型が一致しているかを検証するプロセス) を実施する。

ほかの静的型付け言語にはない『トランスパイル』というプロセスがあるが、ここでは型を検証しない。

<table>
  <thead>
    <tr>
      <th></th>
      <th style="text-align:center">実行前のコンパイル</th>
      <th style="text-align:center">実行前のトランスパイル</th>
      <th style="text-align:center">実行時</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>型検証</td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center">❌</td>
      <td style="text-align:center">❌</td>
    </tr>
  </tbody>
</table>

### トランスパイル

#### ▼ コンパイル + トランスパイルの両方

```typescript
function greet(name: string) {
  console.log(`Hello, ${name}!`);
}

// 引数を渡さない場合、関数にはundefinedを渡すことになる
greet();
```

```javascript
// トランスパイルされてJavaScriptになる
// undefinedは型不一致のため、コンパイルの型検証によってエラーになる
// error TS2554: Expected 1 arguments, but got 0.
```

#### ▼ トランスパイルのみ

```typescript
function greet(name: string) {
  console.log(`Hello, ${name}!`);
}

// 引数を渡さない場合、関数にはundefinedを渡すことになる
greet();
```

```typescript
// トランスパイルされてJavaScriptになる
// undefinedは型不一致であるが、コンパイルの型検証がないため、エラーにならない
Hello, undefined!
```

<br>

## 03. プログラミングパラダイム

### オブジェクト指向型

オブジェクトは内部に状態を持つ。

副作用はあってもなくてもよい。

状態・振る舞いが結合している。

ほかのプログラミングパラダイムと共存できる。

```typescript
interface User {
  readonly name: string;
  isAdult(): boolean;
}

function createUser(name: string, age: number): User {
  return {
    name,
    // 振る舞い
    isAdult(): boolean {
      return age >= 18;
    },
  };
}

const user = createUser("Alice", 20);
console.log(user.isAdult()); // true
```

<br>

### 関数型

振る舞いは状態を持たず、外部から状態を持つオブジェクトを受け取る。

副作用を起こさず、同じ入力に対して同じ出力を返す。

状態・振る舞いが分離している。

ほかのプログラミングパラダイムと共存できる。

```typescript
// オブジェクト
interface User {
  readonly name: string;
  readonly age: number;
}

// 振る舞い
function isAdult(user: User): boolean {
  return user.age >= 18;
}

// データを作成し、関数へ渡す
const user: User = {name: "Alice", age: 20};
console.log(isAdult(user)); // true
```

<br>

## 04. プログラミングパラダイム

### オブジェクト指向型

振る舞いは内部に状態を持つ。

副作用はあってもなくともよい（同じ入力のときに、出力は同じでも異なってもよい）。

状態・振る舞いが結合している。

ほかの型と共存できる。

```typescript
class User {
  private _name: string;
  private _age: number;

  // オブジェクトの状態を設定する
  constructor(name: string, age: number) {
    this._name = name;
    this._age = age;
  }

  // 振る舞い
  isAdult(): boolean {
    return this._age >= 18;
  }
}

const user = new User("Alice", 20);
console.log(user.isAdult()); // true
```

<br>

### 関数型

振る舞いは状態を持たず、外部から状態を持つオブジェクトを受け取る。

副作用をなくす必要がある（同じ入力であれば、出力も同じである）。

状態・振る舞いが分離している。

ほかの型と共存できる。

```typescript
// オブジェクト
type User = {
  name: string;
  age: number;
};

// 振る舞い
function isAdult(user: User): boolean {
  return user.age >= 18;
}

// オブジェクトの状態を設定する
const u: User = {name: "Alice", age: 20};
console.log(isAdult(u)); // true
```

<br>

### 手続型

振る舞いは存在せず、状態が変化していく。

実装例以外に、反復で数値が増加していく処理も手続型である。

ほかの型と共存できる。

```typescript
// オブジェクトの状態を設定する
let name = "Alice";
let age = 20;

// 手続き的に途中で状態を変更する
let isAdult = false;

if (age >= 18) {
  isAdult = true;
} else {
  isAdult = false;
}

console.log(isAdult); // true
```

<br>

## 05. 実装スタイル

### インターフェースによるオブジェクトの表現

#### ▼ 通常のオブジェクトの場合

インターフェースで型を定義し、生成関数が返すオブジェクトに状態と振る舞いを持たせる。

```typescript
interface User {
  readonly name: string;
  isAdult(): boolean;
}

function createUser(name: string, age: number): User {
  return {
    name,
    isAdult(): boolean {
      return age >= 18;
    },
  };
}

const user = createUser("Alice", 20);
console.log(user.isAdult()); // true
```

#### ▼ エラーの場合

独自エラーは、`instanceof` で実行時の判別と型の絞り込みを行えるよう、標準の `Error` を継承するクラスで定義する。

```typescript
class BadRequestError extends Error {
  override readonly name = "BadRequestError";
  readonly statusCode = 400;

  constructor() {
    super("リクエスト形式が不正です");
  }
}

try {
  throw new BadRequestError();
} catch (error: unknown) {
  // ここではerrorの型はunknown
  // instanceofが実行時の判別と型の絞り込みを行ってくれる
  if (error instanceof BadRequestError) {
    // この分岐ではBadRequestError型に絞り込まれる
    console.log(error.statusCode); // 400
    console.log(error.message);
  } else {
    throw error;
  }
}
```

> - [TypeScript Handbook - instanceof narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#instanceof-narrowing)
> - [Google TypeScript Style Guide - Exception handling](https://google.github.io/styleguide/tsguide.html#exception-handling)
> - [Error - Custom error types - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#custom_error_types)

### クラスによるオブジェクトの表現

クラスで状態と振る舞いを定義し、`new` でオブジェクトを生成する。

できるだけ、「クラスによるオブジェクトの表現」ではなく「インターフェースによるオブジェクトの表現」を使用する。

```typescript
class User {
  constructor(
    public readonly name: string,
    private readonly age: number,
  ) {}

  isAdult(): boolean {
    return this.age >= 18;
  }
}

const user = new User("Alice", 20);
console.log(user.isAdult()); // true
```

<br>

## 06. さまざまなプラクティスのまとめ

```typescript
// エラーハンドリング: Result型で値を型として明示
type Result<T, E> = {ok: true; value: T} | {ok: false; error: E};
type UserFetchError = "UNAUTHORIZED" | "RATE_LIMITED" | "INTERNAL_ERROR";

// 保守性: TypeScriptでAPIレスポンスの型安全性を確保
type UserResponse = {
  id: string;
  name: string;
};

async function getUserNames(
  // 性能: 複数ユーザーIDをまとめて取得することで、N+1問題を回避
  userIds: string[],
  // テストビリティ: 依存性注入により、モックに差し替えできるようにする
  di: DI,
): Promise<Result<Map<string, string>, UserFetchError>> {
  // 信頼性: リトライ機構により、一時的な障害に対応
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // 信頼性: タイムアウトにより、ネットワーク遅延からアプリケーションを保護
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      // 依存性注入された親オブジェクトから子オブジェクトを取り出す
      // 実環境では本物のfetchClientを使用し、テスト環境ではモック用のfakeFetchClientを使用する
      const response = await di.fetchClient(
        // スケーラビリティ: バッチ処理でリクエスト回数を最小化
        // 保守性: URLのベタ書きを排除
        `${di.apiBaseUrl}/users/batch`,
        {
          method: "POST",
          headers: {
            // 認証・認可: JWTでAPIを保護
            // 依存性注入された親オブジェクトから子オブジェクトを取り出す
            Authorization: `Bearer ${await di.jwtProvider()}`,
            "Content-Type": "application/json",
          },
          // 性能: 複数ユーザーIDをまとめて取得することで、N+1問題を回避
          // 性能: 必要なフィールドのみ取得してデータ転送量を最小化
          body: JSON.stringify({ids: userIds, fields: ["id", "name"]}),
          signal: controller.signal,
        },
      );

      // エラーハンドリング: HTTPステータスを適切にハンドリング
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          switch (response.status) {
            // 認証・認可: APIを保護
            case 403:
              throw new NonRetryableError("UNAUTHORIZED", response.status);
            // スケーラビリティ: レート制限対応
            case 429:
              throw new NonRetryableError("RATE_LIMITED", response.status);
            default:
              throw new NonRetryableError("INTERNAL_ERROR", response.status);
          }
        }
        throw response;
      }

      const users = await response.json();

      // セキュリティ: レスポンスを厳密に検証
      if (!isValidUsersResponse(users)) {
        throw new NonRetryableError("INTERNAL_ERROR");
      }

      const results = new Map(users.map((user) => [user.id, user.name]));
      return {ok: true, value: results};
    } catch (error) {
      // 依存性注入された親オブジェクトから子オブジェクトを取り出す
      // 可観測性: 構造化されたログ
      di.logger.error("Failed to fetch users", {
        userIds,
        attempt,
        error,
      });
      // 依存性注入された親オブジェクトから子オブジェクトを取り出す
      // 可観測性: メトリクス
      di.metrics.increment("user_fetch_error", {
        status:
          error instanceof Response || error instanceof RetryFailedError
            ? error.status
            : undefined,
      });

      if (error instanceof RetryFailedError) {
        return {ok: false, error: error.errorType};
      }

      if (attempt < maxRetries) {
        // 信頼性: 指数バックオフ（1秒→2秒→4秒）によるリトライで過負荷を防止
        const delay = 2 ** attempt * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {ok: false, error: "INTERNAL_ERROR"};
}
```

> - [同じ5行のコードが全く違って見える12の瞬間、なぜ私たちは学ぶのか？](https://zenn.dev/coconala/articles/reasons-for-continuing-to-learn#%E3%82%82%E3%81%97%E3%80%81%E3%81%93%E3%81%93%E3%81%BE%E3%81%A7%E3%81%AE%E3%81%99%E3%81%B9%E3%81%A6%E3%82%92%E5%AD%A6%E3%82%93%E3%81%A0%E3%82%89)

<br>

## 07. アンチパターン

### ループ内の線形探索

#### ▼ ループ内の線形探索とは

線形探索とは、配列などを先頭から順に走査し、特定の要素を抽出する処理である。

ループ内で線形探索すると処理量が多くなるため、`Set()` 関数や `Map()` 関数で事前準備しておく。

#### ▼ 悪い例

ループのなかで線形探索の関数 (`some`、`includes`、`find`) を実行してしまっている。

```typescript
// ループ
for (const inputKey of inputKeys) {
  // ループ内で線形探索処理を実行してしまっている
  if (items.some((item) => item.key === inputKey)) {
    // ...
  }
}
```

#### ▼ よい例

```typescript
const keys = items.map((item) => item.key);

// Set関数を使用した事前準備
const keySet = new Set(keys);

// ループ
for (const inputKey of inputKeys) {
  // ループ内で線形探索処理を実行していないからよい
  if (keySet.has(inputKey)) {
    // 存在する
  } else {
    // 存在しない
  }
}
```

```typescript
const keys = items.map((item) => item.key);

// Map関数を使用した事前準備
const entryMap = new Map(items.map((item) => [item.key, item]));

// ループ
for (const inputKey of inputKeys) {
  // ループ内で線形探索処理を実行していないからよい
  const matched = entryMap.get(inputKey);
  if (matched) {
    // 一致したオブジェクトを使う
  } else {
    // 見つからない
  }
}
```
