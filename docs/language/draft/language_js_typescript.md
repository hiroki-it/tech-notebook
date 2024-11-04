---
title: 【IT技術の知見】Typescript
description: Typescriptの知見を記録しています。
---

# Typescript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Typescriptとは

静的型付けのフロントエンド言語である。

`tsconfig.json`ファイルに基づいて、TypeScriptファイルをコンパイルし、JavaScriptファイルを作成する。

拡張子として、`ts`と`tsx` (Typescript内にJSXを実装できる) を使用できる。

> - https://ugo.tokyo/ts-config/#outline__1

<br>

## 02. セットアップ

### tsconfig.json

#### ▼ exclude

```yaml
{"exclude": ["<ファイル名>"]}
```

> - https://qiita.com/ryokkkke/items/390647a7c26933940470#exclude

<br>

#### ▼ include

```yaml
{"include": ["<ファイル名>"]}
```

> - https://qiita.com/ryokkkke/items/390647a7c26933940470#include

<br>

#### ▼ compilerOptions

```yaml
{
  "compilerOptions": {
  "lib": [ "DOM", "DOM.Iterable", "ES2019" ],
  "types": [ "vitest/globals" ],
  "isolatedModules": true,
  "esModuleInterop": true,
  "jsx": "react-jsx",
  "module": "CommonJS",
  "moduleResolution": "node",
  "resolveJsonModule": true,
  "target": "ES2019",
  "strict": true,
  "allowJs": true,
  "forceConsistentCasingInFileNames": true,
  "baseUrl": ".",
  "paths": {
    "~/*": [ "./app/*" ]
  },
  "skipLibCheck": true,
  "noEmit": true
}
```

> - https://qiita.com/ryokkkke/items/390647a7c26933940470#compileroptions

<br>
