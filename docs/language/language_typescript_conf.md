---
title: 【IT技術の知見】設定＠TypeScript
description: 設定＠TypeScriptの知見を記録しています。
---

# 設定＠TypeScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. tsconfig.json

### exclude

```yaml
{"exclude": ["<ファイル名>"]}
```

> - [tsconfig.jsonの主要オプションを理解する #TypeScript - Qiita](https://qiita.com/ryokkkke/items/390647a7c26933940470#exclude)

<br>

### include

```yaml
{"include": ["<ファイル名>"]}
```

> - [tsconfig.jsonの主要オプションを理解する #TypeScript - Qiita](https://qiita.com/ryokkkke/items/390647a7c26933940470#include)

<br>

### compilerOptions

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
  # any 型を禁止にする
  "noImplicitAny": true,
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

> - [tsconfig.jsonの主要オプションを理解する #TypeScript - Qiita](https://qiita.com/ryokkkke/items/390647a7c26933940470#compileroptions)

<br>
