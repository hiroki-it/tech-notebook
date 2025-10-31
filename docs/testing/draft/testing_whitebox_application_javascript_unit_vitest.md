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

### 外部とのリクエスト／レスポンス

```typescript
// テスト対象の関数
import axios from "axios";

export async function fetchUser(id: string) {
  const res = await axios.get(`/api/users/${id}`);
  return res.data;
}
```

```typescript
import {test, expect, vi} from "vitest";
import axios from "axios";
import {fetchUser} from "./fetchUser";

// axiosクライアントのモック
vi.mock("axios");

// テストスイート
describe("fetchUser", async () => {
  // リクエストのパラメーターに関するテストデータ
  const userId = "1";

  // 正常系テストケース
  test("success", async () => {
    // レスポンスに関するテストデータ
    const response = {
      id: "1",
      name: "Taro",
    };

    // axiosクライアントを実行する場合、モックに差し替える
    // axiosクライアントのモックが一度だけデータを返却するように設定
    vi.mocked(axios, true).get.mockResolvedValueOnce({data: response});

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
  test("foo failure", async () => {
    // レスポンスに関するテストデータ
    const response = new Error("Network Error");

    // axiosクライアントを実行する場合、モックに差し替える
    // axiosクライアントのモックがエラーを一度だけ返すように設定
    vi.mocked(axios, true).get.mockRejectedValueOnce(response);

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

### 外部とのパブリッシュ／サブスクライブ

```typescript
// テスト対象の関数
export async function publishMessage(url: string) {
  try {
    await publishMessageToEmqx(url, "$share/test-topic", "Hello EMQX");
    return "success";
  } catch (err) {
    throw new Error("failed to publish message");
  }
}

// テスト対象の関数
export async function subscribeMessage(url: string) {
  try {
    await subscribeMessageToEmqx(url, "$share/test-topic", "Hello EMQX");
    return "success";
  } catch (err) {
    throw new Error("failed to subscribe message");
  }
}

async function publishMessageToEmqx(
  url: string,
  topic: string,
  message: string,
): Promise<void> {
  // ...

  // ここでEMQXとの通信を実行するとする

  // ...

  console.log(`topic=${topic}, message=${message}`);
}

async function subscribeMessageToEmqx(
  url: string,
  topic: string,
  message: string,
): Promise<void> {
  // ...

  // ここでEMQXとの通信を実行するとする

  // ...

  console.log(`topic=${topic}, message=${message}`);
}
```

```typescript
import {describe, test, expect, vi} from "vitest";
import {publishMessage, subscribeMessage} from "./emqx";
import {publishMessageToEmqx, subscribeMessageToEmqx} from "../emqx";

describe("publishMessage", () => {
  // 実際にパブリッシュを行わないように、関数をモック化
  vi.mock("../emqx", () => ({
    publishMessageToEmqx: vi.fn(),
  }));

  const url = "mqtt://localhost:1883";

  // 正常系テストケース
  test("should return success when message is published", async () => {
    vi.mocked(publishMessageToEmqx).mockResolvedValueOnce(undefined);
    const result = await publishMessage(url);

    // publishMessageによる送信処理が正常に完了したことを比較検証する
    expect(result).toBe("success");
    // 内部でpublishMessageToEmqxが実行されていることを比較検証する
    expect(publishMessageToEmqx).toHaveBeenCalledWith(
      url,
      "$share/test-topic",
      "Hello EMQX",
    );
  });

  // 異常系テストケース
  test("should throw error when publish is failed", async () => {
    vi.mocked(publishMessageToEmqx).mockRejectedValueOnce(
      new Error("network error"),
    );

    // publishMessageが例外をスローすることを比較検証する
    await expect(publishMessage(url)).rejects.toThrow("failed to send message");
    // 内部でpublishMessageToEmqxが実行されていることを比較検証する
    expect(publishMessageToEmqx).toHaveBeenCalledWith(
      url,
      "$share/test-topic",
      "Hello EMQX",
    );
  });
});

describe("subscribeMessage", () => {
  // 実際にサブスクライブを行わないように、関数をモック化
  vi.mock("../emqx", () => ({
    subscribeMessageToEmqx: vi.fn(),
  }));

  const url = "mqtt://localhost:1883";

  // 正常系テストケース
  test("should return success when message is subscribed", async () => {
    vi.mocked(subscribeMessageToEmqx).mockResolvedValueOnce(undefined);
    const result = await subscribeMessage(url);

    // subscribeMessageによる受信処理が正常に完了したことを比較検証する
    expect(result).toBe("success");
    // 内部でsubscribeMessageToEmqxが実行されていることを比較検証する
    expect(subscribeMessageToEmqx).toHaveBeenCalledWith(
      url,
      "$share/test-topic",
      "Hello EMQX",
    );
  });

  // 異常系テストケース
  test("should throw error when subscribe is failed", async () => {
    vi.mocked(subscribeMessageToEmqx).mockRejectedValueOnce(
      new Error("network error"),
    );

    // subscribeMessageが例外をスローすることを比較検証する
    await expect(subscribeMessage(url)).rejects.toThrow(
      "failed to subscribe message",
    );
    // 内部でsubscribeMessageToEmqxが実行されていることを比較検証する
    expect(subscribeMessageToEmqx).toHaveBeenCalledWith(
      url,
      "$share/test-topic",
      "Hello EMQX",
    );
  });
});
```

<br>

### エラーの中身を詳細に検証

エラーの中身を詳細に検証したい場合、`rejects.toThrow("エラー文")`だけでは比較検証できることが少ない。

```typescript
import {test, expect, vi} from "vitest";
import axios from "axios";
import {fetchUser} from "./fetchUser";

// axiosクライアントのモック
vi.mock("axios");

describe("fetchUser", () => {
  // リクエストのパラメーターに関するテストデータ
  const userId = "1";

  // 異常系テストケース
  test("should throw CustomError with correct message, code, and timestamp", async () => {
    try {
      // 内部で実行されるaxiosクライアントはモックであり、mockResolvedValueOnceで設定した値を返却する
      await fetchUser(userId);
      // fail関数を実行しないといけない
      expect.fail("should thrown an error");
    } catch (e) {
      const error = e as CustomError;
      expect(error.name).toBe("CustomError");
      expect(error.message).toMatch(/error/);
      expect(error.code).toBe(500);
    }
  });
});
```

<br>
