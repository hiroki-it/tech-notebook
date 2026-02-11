---
title: 【IT技術の知見】フロントエンドアーキテクチャ＠フロントエンドアーキテクチャ
description: フロントエンドアーキテクチャ＠フロントエンドアーキテクチャの知見を記録しています。
---

# フロントエンドアーキテクチャ＠フロントエンドアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. MVCアーキテクチャ

### MVCアーキテクチャとは

記入中...

<br>

### レンダリングパターンとの関係性

以下のレンダリングパターンを使用している場合、MVCアーキテクチャで構築することになる。

- SSR

> - http://fluorite2.sblo.jp/article/189587309.html

<br>

## 02. Atomic Design

### Atmic Designとは

UIレンダリングロジックを構成する要素を、5つのレイヤー (Atoms、Molecules、Organisms、Templates、Pages) に分ける設計方法のこと。

> - https://atomicdesign.bradfrost.com/

<br>

### Nuxt.jsを参考に考える

Nuxt.jsとAtomic Designのレイヤーは以下の様に対応する。

| Nuxt.jsのディレクトリ | Atomic Designのレイヤー     |
| --------------------- | --------------------------- |
| components            | Atoms、Molecules、Organisms |
| pages                 | Pages                       |
| layouts               | Templates                   |

> - https://tec.tecotec.co.jp/entry/2020/03/27/090000

<br>

## 03. Feature Sliced Design (機能スライス設計)

```yaml
.
├─ app/ # レイヤー
│  ├─ routes/
│  └─ analytics/
│
├─ pages/ # レイヤー
│  ├─ home/ # スライス
│  ├─ article/ # スライス
│  │  ├─ ui/ # セグメント
│  │  └─ api/
│  │
│  └─ settings/
│
└─ shared/ # レイヤー
   ├─ ui/
   └─ api/
```

> - https://feature-sliced.design/ja/docs/get-started/overview
> - https://zenn.dev/moneyforward/articles/e1ed48c3974811
> - https://feature-sliced.github.io/documentation/examples
> - https://github.com/feature-sliced/documentation

<br>

## 04. クリーンアーキテクチャ

フロントエンドにはビジネスロジックがないため、クリーンアーキテクチャを採用する意義がない。

やめましょう。

> - https://panda-program.com/posts/clean-architecture-and-frontend

<br>

## 05. マイクロフロントエンド

### UI部品合成とは

静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) のコンポーネントを、各マイクロサービスに対応するように分割する設計方法。

![composite-ui](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/composite-ui.png)

<br>

### ビルド時合成パターン

#### ▼ ビルド時合成パターンとは

フロントエンドアプリケーションのビルド時に合成する。

<br>

### クライアントサイド合成パターン

#### ▼ クライアントサイド合成パターンとは

クライアント側 (ブラウザ上) で、静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) を合成する。

#### ▼ iframeタグ

ページにコンポーネントに対応する`iframe`タグを組み込むする。

各`iframe`タグが表示したいコンポーネントのURLを`src`タグで指定する

> - https://martinfowler.com/articles/micro-frontends.html#Run-timeIntegrationViaIframes

#### ▼ `script`タグ

> - https://martinfowler.com/articles/micro-frontends.html#Run-timeIntegrationViaJavascript

#### ▼ webコンポーネント

> - https://martinfowler.com/articles/micro-frontends.html#Run-timeIntegrationViaWebComponents

<br>

### エッジサイド合成パターン

#### ▼ エッジサイド合成パターンとは

> - https://martinfowler.com/articles/micro-frontends.html#Build-timeIntegration

<br>

### サーバーサイド合成パターン

#### ▼ サーバーサイド合成パターンとは

サーバーサイド側 (ブラウザ上) で、静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) を合成する。

> - https://martinfowler.com/articles/micro-frontends.html#Server-sideTemplateComposition

<br>
