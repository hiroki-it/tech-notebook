---
title: 【IT技術の知見】vite＠JavaScript
description: vite＠JavaScriptの知見を記録しています。
---

# vite＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. viteコマンド

### build

本番環境用にJavaScriptファイルをビルドする。

```bash
$ vite build
```

> - https://vite.dev/guide/cli#vite-build

<br>

### dev

#### ▼ devとは

開発環境用にJavaScriptファイルをビルドする。

```bash
$ vite dev

# または
$ vite
```

> - https://vite.dev/guide/cli#vite

#### ▼ --host

開発環境にDockerを使用している場合、viteのポートを全て公開する必要がある。

これにより、ホストOSからコンテナ内のviteに接続できるようにする。

```bash
$ vite dev --host

# または
$ vite dev --host 0.0.0.0
```

> - https://qiita.com/Junpei_Takagi/items/3615505dcabd2e97f3e1
> - https://vite.dev/config/server-options#server-host

<br>

## 02. セットアップ

`vite`コマンドのオプションを設定する。

開発環境と本番環境で共通のオプションを設定すると良い。

```typescript
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

開発環境または本番環境のいずれかでしか使用しないオプションは、`package.json`ファイルの`scripts`キーで設定する。

```yaml
{
  "scripts":
    {
      "dev": "vite --host",
      "build": "tsc -b && vite build",
      "lint": "eslint .",
      "preview": "vite preview",
    },
}
```

<br>
