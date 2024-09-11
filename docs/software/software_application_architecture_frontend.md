---
title: 【IT技術の知見】フロントエンドアーキテクチャ＠アーキテクチャ
description: フロントエンドアーキテクチャ＠アーキテクチャの知見を記録しています。
---

# フロントエンドアーキテクチャ＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Ajaxによるアプリケーション

1つのWebページの中で、サーバーとデータを非同期通信し、ブラウザ側で部分的に静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) を作成する。

Ajaxの仕組みで作成したアプリはSPAである。

クライアント側でレンダリングを実行するため、SSRと比較してCSR：Client Server side Renderingともいう。

| ブラウザレンダリングのステップ | 実行者   |
| ------------------------------ | -------- |
| Loading                        | ブラウザ |
| Scripting                      | ブラウザ |
| Rendering                      | ブラウザ |
| Paiting                        | ブラウザ |

非同期通信は、Ajaxの手法を使用して実現される。

また、静的ファイルの部分的な作成は、MVVMアーキテクチャによって実現する。

SPAでは、ページ全体の静的ファイルをリクエストするのは最初のみで、それ以降はページ全体をリクエストすることはない。

２回目以降は、ページ部分的にリクエストを行い、サーバー側からJSONを受け取っていく。

![SPアプリにおけるデータ通信の仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SPアプリにおけるデータ通信の仕組み.png)

> - https://developers.google.com/analytics/devguides/collection/analyticsjs/single-page-applications
> - https://zenn.dev/bitarts/articles/37260ddb28ae5d

<br>

## 02. CSR：Client Side Rendering

### CSRとは

ブラウザ側で静的ファイルを作成する。

CSRの仕組みで作成したアプリはSPAである。

最初に取得するhtmlファイルはほぼ空で、ブラウザ上でjavascriptファイルを実行し、htmlファイルを全てを作成する。

その後、クライアントの操作で部分的にデータをリクエストし、htmlファイルを部分的に変更する。

大きなjavascriptファイルを最初に読み込むため、初回の読み込み時間が長くなる。

> - https://zenn.dev/bitarts/articles/37260ddb28ae5d
> - https://qiita.com/shinkai_/items/79e539b614ac52e48ca4

<br>

### SPAの実装方法

#### ▼ MVVMアーキテクチャ

View層とModel層の間にViewModel層を配置し、View層とViewModel層の間で双方向にデータをやり取り (双方向データバインディング) する。

これによって、View層とModel層の間を疎結合にする。

Vue.jsでは、意識せずにMVVMアーキテクチャで実装できるようになっている。

詳しくは、以下のリンクを参考にせよ。

![一般的なMVVMアーキテクチャ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/一般的なMVVMアーキテクチャ.png)

> - https://hiroki-it.github.io/tech-notebook/language/language_js_framework_vuejs.html

<br>

### SPAと従来MPAの比較

#### ▼ 処理速度

MPAと比較して、データを非同期的に通信できるため、1つのWebページの中で必要なデータのみを通信すればよく、レンダリングが速い。

![従来WebアプリとSPアプリの処理速度の違い](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/従来WebアプリとSPアプリの処理速度の違い.png)

> - https://www.switchitmaker2.com/seo/spa/

#### ▼ SEO

SPAは、Googleのクローラーがページを認識しにくく、Webページがインデックスされない可能性がある。

> - https://www.switchitmaker2.com/seo/spa/

<br>

## 02. SSR：Server Side Rendering

### 広義のSSRとは

ブラウザ側ではなくサーバー側で静的ファイルを作成する。

フレームワークのテンプレートエンジンやCGIを使用して、サーバー側で静的ファイルを作成すること、も含まれる。

| ブラウザレンダリングのステップ | 実行者   |
| ------------------------------ | -------- |
| Loading                        | サーバー |
| Scripting                      | サーバー |
| Rendering                      | サーバー |
| Paiting                        | ブラウザ |

> - https://tadtadya.com/summary-of-the-web-site-display-process-flow/#index-list-8
> - https://ja.nuxtjs.org/docs/2.x/concepts/server-side-rendering

<br>

### 狭義のSSRとは

広義のSSRにSPAを取り入れた方法のこと。

ブラウザ側ではなくサーバー側で静的ファイルを作成する。

広義のSSRと異なる点は、ブラウザ側にレンダリングされた後、アイソモーフィックJavaScriptという仕組みでSPAとして動作する。

> - https://qiita.com/rita0222/items/66fec6e7be5987bace3c
> - https://qiita.com/kyrieleison/items/4ac5bcc331aee6394440#%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E3%82%B5%E3%82%A4%E3%83%89%E3%81%A8%E3%82%B5%E3%83%BC%E3%83%90%E3%82%B5%E3%82%A4%E3%83%89%E3%81%AE%E3%82%B3%E3%83%BC%E3%83%89%E5%85%B1%E6%9C%89<br>

<br>

## 03. SSG：Static Site Generation

### SSGとは

事前にビルドを行って静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) を作成しておく。

そして、これをレンダリングし、静的サイトとして稼働させる。

動的な要素 (例：ランダム表示) を含む静的ファイルについては、該当の部分でAjaxを使用できるようにしておく。

<br>

## 04. ISR：Incremental Static Regeneration

### ISRとは

SSGの発展型。

SSGとは異なり、事前にビルドせず、静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) を作成しない。

その代わり、クライアントからリクエストがあって初めて、そのWebページのみビルドが実行され、レンダリングされる。

クライアントから一回でもリクエストがあったWebページでは、初回時にビルドされた静的ファイルがその都度レンダリングされる。

> - https://nextjs.org/docs/basic-features/data-fetching#incremental-static-regeneration

<br>

## 05. Atomic Design

### Atmic Designとは

フロントエンドを構成する要素を、5つのレイヤー (Atoms、Molecules、Organisms、Templates、Pages) に分ける設計方法のこと。

> - https://atomicdesign.bradfrost.com/

<br>

### Nuxt.jsを参考に考える

Nuxt.jsとAtomic Designのレイヤーは以下の様に対応する。

> - https://tec.tecotec.co.jp/entry/2020/03/27/090000

| Nuxt.jsのディレクトリ | Atomic Designのレイヤー     |
| --------------------- | --------------------------- |
| components            | Atoms、Molecules、Organisms |
| pages                 | Pages                       |
| layouts               | Templates                   |

<br>

## 06. クリーンアーキテクチャ風

- Viewレイヤー
- State Managementレイヤー
- API Clientレイヤー

> - https://www.upp-technology.com/blogs/a-different-approach-to-frontend-architecture/

<br>

## 07. マイクロサービスアーキテクチャにおけるフロントエンド

### UI部品合成

#### ▼ UI部品合成とは

フロントエンドのコンポーネントを、各マイクロサービスに対応するように分割する設計方法。

![composite-ui](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/composite-ui.png)

<br>
