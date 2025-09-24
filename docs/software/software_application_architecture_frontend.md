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

## 02. MVVMアーキテクチャ

### MVVMアーキテクチャとは

以下の要素からなる。

- View：UIロジック（HTML）
- ViewModel：状態と振る舞いのロジック（JavaScript）
- Model：モデルそのもの（JavaScript）

ViewとModelの間にViewModelを配置し、ViewとViewModelの間で双方向にデータをやり取り (双方向データバインディング) する。

これによって、ViewとModelの間を疎結合にする。

Vue.jsでは、意識せずにMVVMアーキテクチャで実装できるようになっている。

![一般的なMVVMアーキテクチャ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/一般的なMVVMアーキテクチャ.png)

<br>

### レンダリングパターンとの関係性

以下のレンダリングパターンを使用している場合、MVVMアーキテクチャで構築することになる。

- CSR

> - http://fluorite2.sblo.jp/article/189587309.html

<br>

## 03. Atomic Design

### Atmic Designとは

フロントエンドを構成する要素を、5つのレイヤー (Atoms、Molecules、Organisms、Templates、Pages) に分ける設計方法のこと。

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
