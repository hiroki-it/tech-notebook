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

#### ▼ axiosを使用したHTTPリクエスト

```typescript
// テスト対象の関数
import axios from "axios";

export async function fetchUser(id: string) {
  const res = await axios.get(`/api/users/${id}`);
  return res.data;
}
```

```typescript
// テストコード
import { test, expect, vi } from 'vitest'
import axios from 'axios'
import { fetchUser } from './fetchUser'

describe('fetchUser', async () => {

  // リクエストのパラメーターに関するテストデータ
  const userId = '1'

  // レスポンスに関するテストデータ
  const response = {
    id: '1',
    name: 'Taro',
  }

  // 正常系のテスト
  test('success', async () => {

    // axiosクライアントのモック
    vi.mock('axios')
    // axiosクライアントのモックが一度だけデータを返却するように設定
    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: response })

    // 関数をテスト
    const user = await fetchUser(userId)

    // 実際値と期待値を比較検証
    expect(user).toStrictEqual({id: '1', name: 'Taro'})
  })

  // 異常系のテスト
  test('failure', async () => {
    // axiosクライアントのモックがエラーを一度だけ返すように設定
    vi.mocked(axios, true).get.mockRejectedValueOnce(new Error('Network Error'))

    // 関数をテスト
    // 関数の結果をVitestに直接渡さないと、テストコードが例外で停止してしまう
    // 実際値と期待値を比較検証
    expect(fetchUser(userId)).rejects.toThrow('Network Error')
  })
}
```

<br>
