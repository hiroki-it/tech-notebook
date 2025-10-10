---
title: 【IT技術の知見】コマンド＠TypeScript
description: コマンド＠TypeScriptの知見を記録しています。
---

# コマンド＠TypeScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. tsc

型検証を実行する。

TypeScriptではビルド時に型検証するが、一部のテストツールではビルドせずにいきなりトランスパイルするため、このコマンドが必要になる。

```bash
$ tsc -p tsconfig.json --noEmit
```

<br>
