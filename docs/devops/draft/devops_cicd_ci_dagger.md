---
title: 【IT技術の知見】Dagger＠CIツール
description: Dagger＠CIツールの知見を記録しています。
---

# Dagger＠CI ツール

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## Dagger とは

Dagger で CI/CD パイプラインの設定ファイルを実装し、CI ツール上で実行する。

CI ツール上では Dagger をインストールするのみでよい。

これにより、CI ツールへ依存せずに CI/CD パイプラインを実装できる。

> - [DaggerでベンダーフリーなCIパイプラインを作成する](https://zenn.dev/ymtdzzz/articles/43488f08209e8b)
