---
title: 【IT技術の知見】フロントエンドアーキテクチャ＠フロントエンドアーキテクチャ
description: フロントエンドアーキテクチャ＠フロントエンドアーキテクチャの知見を記録しています。
---

# フロントエンドアーキテクチャ＠フロントエンドアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. MVVMアーキテクチャ

View層とModel層の間にViewModel層を配置し、View層とViewModel層の間で双方向にデータをやり取り (双方向データバインディング) する。

これによって、View層とModel層の間を疎結合にする。

Vue.jsでは、意識せずにMVVMアーキテクチャで実装できるようになっている。

![一般的なMVVMアーキテクチャ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/一般的なMVVMアーキテクチャ.png)

## 02. Atomic Design

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

## 03. クリーンアーキテクチャ風

- Viewレイヤー
- State Managementレイヤー
- API Clientレイヤー

> - https://www.upp-technology.com/blogs/a-different-approach-to-frontend-architecture/

<br>

## 04. マイクロフロントエンド

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
