---
title: 【IT技術の知見】Vitest＠JavaScriptユニットテスト
description: Vitest＠JavaScriptユニットテストの知見を記録しています。
---

# Vitest＠JavaScriptユニットテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Vitestとは

ユニットテストと機能テストの実施に必要な機能を提供し、加えてテストを実施する。

<br>

## 02. ユニットテストの設計

### 処理の順番

Arrange-Act-Assertパターンを採用するとよい。

```typescript
import {test, expect, vi} from "vitest";
import axios from "axios";
import {fetchUser} from "./fetchUser";

beforeEach(async () => {
  vi.resetAllMocks();
});

// テストスイート
describe("fetchUser", async () => {
  vi.mock("axios");

  const userId = "1";

  // 正常系テストケース
  test("should return id and name when success", async () => {
    // Arrange
    // テストを準備する
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {
        id: "1",
        name: "Taro",
        executionTime: 123,
        startAtTimestamp: "2024-06-01T12:00:00.000Z",
      },
      status: 200,
    });

    // Act
    // 処理を実行する
    const user = await fetchUser(userId);

    // Assert
    // 結果を評価する
    expect(user.getId()).toBe("1");
    expect(user.getName()).toBe("Taro");
    expect(user.executionTime).toBeGreaterThan(0);
    expect(new Date(user.startAtTimestamp).toISOString()).toBe(
      user.startAtTimestamp,
    );
  });

  // 異常系テストケース
  test("should throw error when failure", async () => {
    // Arrange
    // テストを準備する
    vi.mocked(axios, true).get.mockRejectedValueOnce(
      new Error("Network Error"),
    );

    // Act
    // 処理を実行する
    const result = fetchUser(userId);

    // Assert
    // 結果を評価する
    await expect(result).rejects.toBeInstanceOf(Error);
    await expect(result).rejects.toThrow("Network Error");
  });
});
```

> - https://qiita.com/inasync/items/e0b54e62784710c4b42d

<br>

## 02. セットアップ

### plugin

```typescript
import {defineConfig} from "vitest/config";

export default defineConfig({
  plugins: [],
});
```

<br>

### test

#### ▼ env

```typescript
import {defineConfig} from "vitest/config";
import * as dotenv from "dotenv";

export default defineConfig({
  test: {
    // .env.testファイルを読み込む
    env: dotenv.config({path: ".env.test"}).parsed,
  },
});
```

#### ▼ exclude

```typescript
import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    exclude: [],
  },
});
```

> - https://vitest.dev/config/

#### ▼ globals

```typescript
import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
});
```

#### ▼ include

```typescript
import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    include: ["./src/**/*.spec.ts"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

#### ▼ setupFiles

```typescript
import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

<br>

## 03. 対応言語

### TypeScript

#### ▼ 注意点

VitestはTypeScriptを直接トランスパイルするため、型検証を実施しない。

例えば、TypeScriptのテストコードで、関数に渡す型がまちがってるのにエラーにならない。

Vitestの思想では、テストコードの型検証はエディタやビルド時に実施するべきであり、テストコードの実行時には型検証は済んでいるものという考えがある。

> - https://vite.dev/guide/features.html#transpile-only

<br>

## 04. テストコード例

### ユニットテストとしてDBへのCRUDを検証する

事前処理としてDBデータを挿入し、事後処理としてDBデータを掃除する。

```typescript
import {describe, it, expect, beforeEach, afterEach} from "vitest";
import {prisma} from "~/database/prisma.server";

// ユニットテストの事前処理
beforeEach(async () => {
  await prisma.foo
    .create
    // fooテーブルにDBデータを挿入
    ();
  await prisma.bar
    .create
    // fooテーブルの子にあたるbarテーブルにDBデータを挿入
    ();
});

// ユニットテストの事後処理
afterEach(async () => {
  // 逆順でDBデータを掃除する
  await prisma.bar.deleteMany();
  await prisma.foo.deleteMany();
});

// ここでCRUDに関するユニットテスト
```

> - https://vitest.dev/api/#setup-and-teardown

<br>

### 入力値に対して結果が正しいかを検証する

#### ▼ テスト対象の関数

```typescript
import axios from "axios";

type User = {
  id: string;
  name: string;
  executionTime: number;
  startAtTimestamp: string;
};

// テスト対象の関数
export async function fetchUser(id: string): Promise<User> {
  const res = await axios.get(`/api/users/${id}`);
  return res.data;
}
```

#### ▼ テストコード

```typescript
import {test, expect, vi} from "vitest";
import axios from "axios";
import {fetchUser} from "./fetchUser";

beforeEach(async () => {
  vi.resetAllMocks();
});

// テストスイート
describe("fetchUser", async () => {
  // axiosクライアントのモック
  vi.mock("axios");

  // リクエストのパラメーターに関するテストデータ
  const userId = "1";

  // 正常系テストケース
  test("should return id and name when success", async () => {
    // axiosの型をモックに認識させる。オブジェクト全体をモックにする場合、trueにする。
    // axiosクライアントのモックが一度だけデータを返却するように設定
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {
        id: "1",
        name: "Taro",
        executionTime: 123,
        startAtTimestamp: "2024-06-01T12:00:00.000Z",
      },
      status: 200,
    });

    // 関数をテスト
    // 内部で実行されるaxiosクライアントはモックであり、mockResolvedValueOnceで設定した値を返却する
    const user = await fetchUser(userId);

    // 実際値と期待値を比較検証
    // toBe関数などでオブジェクトのフィールドを１つずつ照合する (toStrictEqual関数などでオブジェクトをひとまとめに照合しない)
    expect(user.getId()).toBe("1");
    expect(user.getName()).toBe("Taro");
    // 実行時間は0秒より大きくなる
    expect(user.executionTime).toBeGreaterThan(0);
    // 処理実行の開始時刻も返却できるとする
    // 実際値をData形式に一度変換し、再び元のISO形式に戻しても元の値と一致することを比較検証する
    // 期待値は固定値じゃないのが不思議であるが、これが適切なテスト方法である
    expect(new Date(user.startAtTimestamp).toISOString()).toBe(
      user.startAtTimestamp,
    );
  });

  // 異常系テストケース
  test("should throw error when failure", async () => {
    // axiosの型をモックに認識させる。オブジェクト全体をモックにする場合、trueにする。
    // axiosクライアントのモックがエラーを一度だけ返すように設定
    vi.mocked(axios, true).get.mockRejectedValueOnce(
      new Error("Network Error"),
    );

    // Error型を比較検証
    // 内部で実行されるaxiosクライアントはモックであり、mockResolvedValueOnceで設定した値を返却する
    await expect(fetchUser(userId)).rejects.toBeInstanceOf(Error);

    // await宣言で完了を待つようにしないと、そのままテスト処理が終わってしまう
    // 実際値と期待値を比較検証
    await expect(
      // 関数をテスト
      // 関数の結果をVitestに直接渡さないと、テストコードが例外で停止してしまう
      // rejects.toThrow関数で照合する
      fetchUser(userId),
    ).rejects.toThrow("Network Error");
  });
});
```

<br>

<br>

### エラーの中身が正しいかを検証する

#### ▼ テスト対象の関数

```typescript
// Errorオブジェクトを継承した独自のErrorオブジェクト
class FooError extends Error {
  private _name: string;
  private _code: number;

  constructor(message: string, code: number) {
    // message変数はErrorオブジェクトに渡す
    super(message);
    this._name = "FooError";
    this._code = code;
  }
}
```

#### ▼ テストコード

エラーの中身を詳細に検証したい場合、`rejects.toThrow("エラー文")`だけでは比較検証できることが少ない。

```typescript
import {test, expect, vi} from "vitest";
import axios from "axios";
import {fetchUser} from "./fetchUser";

beforeEach(async () => {
  vi.resetAllMocks();
});

describe("fetchUser", () => {
  // axiosクライアントのモック
  vi.mock("axios");

  // リクエストのパラメーターに関するテストデータ
  const userId = "1";

  // 異常系テストケース
  test("should throw FooError with correct name, message and code", async () => {
    try {
      // 内部で実行されるaxiosクライアントはモックであり、mockResolvedValueOnceで設定した値を返却する
      await fetchUser(userId);
      // Errorを投げない場合、想定外なのでテストを失敗させる
      expect.fail("should thrown an error");
    } catch (error) {
      if (!(error instanceof FooError)) {
        // FooErrorではない場合、想定外なのでテストを失敗させる
        expect.fail("should throw FooError");
      }
      expect(error.message).toMatch(/error/);
      expect(error.code).toBe(500);
    }
  });
});
```

<br>

### nullを持つオプショナル型が正しいかを検証する

#### ▼ テスト対象のコード

```typescript
import axios from "axios";

type User = {
  name: string;
  age?: number;
};

// テスト対象の関数
export async function fetchUser(id: string): Promise<User> {
  const res = await axios.get(`/api/users/${id}`);
  return res.data;
}
```

#### ▼ テストコード

`toBeDefined`関数と`toBeUndefined`関数を使用し、オプショナル型を事前に検証した上で、値を検証するとよい。

また、プロパティがある場合をテストする時には、非nullアサーションが必要である。

```typescript
import {describe, it, expect} from "vitest";
import axios from "axios";
import {fetchUser} from "./fetchUser";

beforeEach(async () => {
  vi.resetAllMocks();
});

describe("User optional property behavior", () => {
  // axiosクライアントのモック
  vi.mock("axios");

  // リクエストのパラメーターに関するテストデータ
  const userId = "1";

  it("should allow validation when optional property is defined", async () => {
    // axiosの型をモックに認識させる。オブジェクト全体をモックにする場合、trueにする。
    // axiosクライアントのモックが一度だけデータを返却するように設定
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {name: "Alice", age: 25},
      status: 200,
    });

    // 関数をテスト
    // 内部で実行されるaxiosクライアントはモックであり、mockResolvedValueOnceで設定した値を返却する
    const user = await fetchUser(userId);

    // オプショナル型を検証する
    expect(user.age).toBeDefined();

    // 値を検証する
    expect(user.name).toBe("Alice");
    // 非nullアサーションで明示しつつ、値を検証する
    expect(user.age!).toBe(25);
  });

  it("should allow validation when optional property is undefined", async () => {
    // axiosの型をモックに認識させる。オブジェクト全体をモックにする場合、trueにする。
    // axiosクライアントのモックが一度だけデータを返却するように設定
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {name: "Bob"},
      status: 200,
    });

    // 関数をテスト
    // 内部で実行されるaxiosクライアントはモックであり、mockResolvedValueOnceで設定した値を返却する
    const user = await fetchUser(userId);

    // オプショナル型を検証する
    expect(user.age).toBeUndefined();
    // 値を検証する
    expect(user.name).toBe("Bob");
  });
});
```

<br>

### unknown型の値が正しいかを検証する

#### ▼ テスト対象のコード

```typescript
import axios from "axios";

export type User = {
  name: string;
  // 外部サービス（Twitter / GitHub / Googleなど）によって構造が異なるため unknown 型とする
  social?: unknown;
};

// テスト対象の関数
export async function fetchUser(id: string): Promise<User> {
  const res = await axios.get(`/api/users/${id}`);
  return res.data;
}
```

#### ▼ テストコード

```typescript
import {describe, it, expect, vi} from "vitest";
import axios from "axios";
import {fetchUser} from "./fetchUser";

beforeEach(async () => {
  vi.resetAllMocks();
});

describe("User.social unknown property behavior", () => {
  // axiosクライアントのモック
  vi.mock("axios");

  // リクエストのパラメーターに関するテストデータ
  const userId = "1";

  it("should allow validation when unknown property (object) is defined", async () => {
    // axiosの型をモックに認識させる。オブジェクト全体をモックにする場合、trueにする。
    // axiosクライアントのモックが一度だけデータを返却するように設定
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {
        name: "Alice",
        social: {twitter: "@alice_dev", github: "alice"},
      },
      status: 200,
    });

    // 関数をテスト
    // 内部で実行されるaxiosクライアントはモックであり、mockResolvedValueOnceで設定した値を返却する
    const user = await fetchUser(userId);

    // unknown型の値を検証する
    expect(user).toHaveProperty(
      "social.twitter",
      expect.stringMatching(/^@[\w_]+$/),
    );
    expect(user).toHaveProperty(
      "social.github",
      expect.stringMatching(/^[a-zA-Z0-9_-]+$/),
    );

    // 値を検証する
    expect(user.name).toBe("Alice");
  });

  it("should allow validation when unknown property is undefined", async () => {
    // axiosの型をモックに認識させる。オブジェクト全体をモックにする場合、trueにする。
    // axiosクライアントのモックが一度だけデータを返却するように設定
    vi.mocked(axios, true).get.mockResolvedValueOnce({
      data: {name: "Bob"},
      status: 200,
    });

    // 関数をテスト
    // 内部で実行されるaxiosクライアントはモックであり、mockResolvedValueOnceで設定した値を返却する
    const user = await fetchUser(userId);

    // 値が存在しない場合で、unknown型の値を検証する
    expect(user).not.toHaveProperty("social");

    // 値を検証する
    expect(user.name).toBe("Bob");
  });
});
```

<br>

### 異なるファイルにある関数同士で、内部で関数が呼ばれたかを検証する

#### ▼ テスト対象のコード

これらの関数は別のファイルにある前提である。

```typescript
// utils.ts
export function doInternalWork(value: number): number {
  return value * 2;
}
```

```typescript
// task.ts
export function runTask(num: number): string {
  const result = doInternalWork(num);
  return `result=${result}`;
}
```

#### ▼ テストコード

プライベート関数に仮の返却値を返却させるために、`spyOn`関数を使用している。

```typescript
import {describe, test, expect, vi} from "vitest";
import {runTask} from "./task";
import * as utils from "./utils";

describe("runTask", () => {
  test("should call doInternalWork internally", () => {
    // spyOn関数を使用し、プライベート関数に仮の返却値を返却させる
    const spy = vi.spyOn(utils, "doInternalWork").mockReturnValueOnce(999);

    // runTask関数を実行する
    const output = runTask(123);

    // utilsの内部でdoInternalWorkが1回呼ばれたかを検証する
    expect(spy).toHaveBeenCalled();
    // utilsの内部でdoInternalWorkに渡された引数を検証する
    expect(spy).toHaveBeenCalledWith(123);

    expect(output).toBe("result=999");
  });
});
```

> - https://vitest.dev/api/vi.html#vi-spyon

<br>

### 独自のクライアントクラスをモック化する

#### ▼ テスト対象の関数

`axios`関数のようなクライアントではなく、独自のクライアントクラスがあるとする。

```typescript
// httpClient.ts
export class HttpClient {
  constructor(private baseUrl: string) {}

  async get(path: string): Promise<any> {
    return fetch(`${this.baseUrl}${path}`).then((res) => res.json());
  }
}
```

```typescript
// userService.ts
import {HttpClient} from "./httpClient";

export async function fetchUser() {
  const client = new HttpClient("https://api.example.com");
  const data = await client.get("/user");
  return data;
}
```

#### ▼ テストコード

```typescript
import {describe, test, expect, vi} from "vitest";
import {fetchUser} from "./userService";
import {HttpClient} from "./httpClient";

beforeEach(async () => {
  vi.resetAllMocks();
});

describe("fetchUser", () => {
  // クライアントクラス全体をモック化する
  vi.mock("./httpClient");

  test("should mock HttpClient and return its instance", async () => {
    // モッククラスのインスタンスを定義する
    const mockInstance = {
      get: vi.fn().mockResolvedValueOnce({id: 1, name: "Alice"}),
    };

    // モッククラスがモックインスタンスを返却する
    vi.mocked(HttpClient).mockReturnValueOnce(mockInstance as any);

    const result = await fetchUser();

    expect(mockInstance.get).toHaveBeenCalledWith("/user");

    expect(result).toEqual({id: 1, name: "Alice"});
  });
});
```

<br>
