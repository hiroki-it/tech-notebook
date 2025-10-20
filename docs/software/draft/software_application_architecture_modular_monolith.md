---
title: 【IT技術の知見】モジュラーモノリス＠アーキテクチャ
description: モジュラーモノリス＠アーキテクチャの知見を記録しています。
---

# モジュラーモノリス＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## ディレクトリ

```yaml
/src
├── /presentation    # プレゼンテーション層
├── /features        # 機能単位のモジュール
│   ├── /users       # ユーザー管理モジュール
│   │   ├── /domain  # ドメイン層
│   │   │   ├── /User.ts
│   │   │   ├── /UserId.ts
│   │   │   └── /IUserRepository.ts
│   │   │
│   │   ├── /application # アプリケーション層
│   │   │   ├── /UserApplicationService.ts
│   │   │   └── /commands
│   │   │
│   │   └── /infrastructure # インフラストラクチャ層
│   │       ├── /PrismaUserRepository.ts
│   │       └── /externalApi.ts
│   │
│   └── /products # 商品管理モジュール
│       ├── /domain
│       ├── /application
│       └── /infrastructure
│
...
```

<br>
