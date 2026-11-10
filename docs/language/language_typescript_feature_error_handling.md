---
title: 【IT技術の知見】エラー処理
description: エラー処理の知見を記録しています。
tags:
  - "言語"
  - "TypeScript"
  - "言語機能"
---

# エラー処理

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. エラーハンドリング

### エラーハンドリングとは

Typescript では `throw` は、Error オブジェクトだけでなく、どんな型でも返却できる。

ちなみに、よくある型は Error オブジェクト型、object 型、string 型である。

これを `catch` する場合、さまざまな型を考慮する必要がある。

<br>

### まずは緩い型で `catch` する

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

### `catch` した型に応じた処理

#### ▼ `catch` した型に応じた処理とは

TypeScript の `try-catch` で捕捉したエラーの型に応じて処理を実行し分ける場合、`catch` ブロックを複数書くのではなく、`if` 文を使用する必要がある。

```typescript
import axios, {AxiosError} from "axios";

export async function fetchUser(id: string) {
  try {
    const response = await axios.get(`/api/users/${id}`);
    return response.data;
  } catch (error: unknown) {
    // axiosが投げたエラーの場合
    if (axios.isAxiosError(error)) {
      throw new Error(
        `通信エラーが発生しました (${error.response?.status ?? "unknown"})`,
      );
    }

    // 通常のErrorオブジェクトの場合
    if (error instanceof Error) {
      throw new Error(`予期しないエラー: ${error.message}`);
    }

    // その他（string, object, nullなど）の場合
    throw new Error("不明なエラーが発生しました");
  }
}
```

#### ▼ エラーメッセージの取得

TypeScript では、エラーの構造がさまざまある。

型安全のために、これらを条件分岐で処置する必要がある。

```typescript
// Remixの場合
import {Response} from "@remix-run/node";

/**
 * エラーの構造に応じてエラーメッセージを取得する
 */
export async function getErrorMessage(error: unknown): Promise<string> {
  // RemixのResponseオブジェクトの場合
  // 例：スローしたjson関数によるエラーを捕捉した場合
  if (error instanceof Response) {
    try {
      const body = await error.json();
      if (typeof body?.message === "string") {
        return body.message;
      }
      if (typeof body?.error === "string") {
        return body.error;
      }
      if (error.statusText) {
        return error.statusText;
      }
      return "An unexpected error occurred.";
    } catch {
      if (error.statusText) {
        return error.statusText;
      }
      return "An unexpected error occurred.";
    }
  }

  // Typescript組み込みのErrorオブジェクトの場合
  // 例：Remixの内部的なエラーを捕捉した場合
  if (error instanceof Error) {
    if (error.message) {
      return error.message;
    }
    return "An unexpected error occurred.";
  }

  // その他の場合
  // 例：null、string、number、objectなどの想定外のエラーを捕捉した場合
  return String(error);
}
```

```typescript
// Remixの場合
export const action = async ({request, params}: ActionArgs) => {
  try {
    // リクエストハンドリング
  } catch (error) {
    const errorMessage = await getErrorMessage(error);
    console.error("An error occurred:", errorMessage);
  }
};
```

#### ▼ ステータスコードの取得

```typescript
/**
 * エラーの構造に応じてHTTPステータスコードを取得する
 */
export function getErrorStatusCode(error: unknown): number {
  // RemixのResponseオブジェクトの場合
  // 例：スローしたjson関数によるエラーを捕捉した場合
  if (error instanceof Response) {
    return error.status;
  }

  // ZodによるエラーやJSONパースエラーを補足した場合
  if (error instanceof z.ZodError || error instanceof SyntaxError) {
    return 400;
  }

  // どのようなエラーの型が来るかわからないため、よくある構造で決め打ちする
  const errorObject = error as {
    response?: {status?: unknown};
    status?: unknown;
  };

  // AxiosErrorなどのエラーを補足した場合
  if (typeof errorObject.response?.status === "number") {
    return errorObject.response.status;
  }

  // 独自Errorなどのエラーを補足した場合
  if (typeof errorObject.status === "number") {
    return errorObject.status;
  }

  // 想定外のエラーを補足した場合
  return 500;
}
```

<br>

