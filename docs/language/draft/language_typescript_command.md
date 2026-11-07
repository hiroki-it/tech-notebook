---
title: 【IT技術の知見】コマンド＠TypeScript
description: コマンド＠TypeScriptの知見を記録しています。
---

# コマンド＠TypeScript

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. tsc

型検証する。

TypeScript ではビルド時に型検証するが、一部のテストツールではビルドせずにいきなりトランスパイルするため、このコマンドが必要になる。

```bash
$ tsc -p tsconfig.json --noEmit
```

<br>
