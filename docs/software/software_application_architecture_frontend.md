---
title: 【IT技術の知見】フロントエンドアーキテクチャ＠アーキテクチャ
description: フロントエンドアーキテクチャ＠アーキテクチャの知見を記録しています。
---

#  フロントエンドアーキテクチャ＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. SPA (CSR) ：Single Page Application

### SPAとは

| ブラウザレンダリングのステップ | 実行者 |
|-----------------|--------|
| Loading         | ブラウザ   |
| Scripting       | ブラウザ   |
| Rendering       | ブラウザ   |
| Paiting         | ブラウザ   |

1つのWebページの中で、サーバーとデータを非同期通信し、ブラウザ側で部分的に静的ファイルを作成する。

クライアント側でレンダリングを行うため、SSRと比較してCSR：Client Server side Renderingともいう。

非同期通信は、Ajaxの手法を使用して実現される。

また、静的ファイルの部分的な作成は、MVVMアーキテクチャによって実現する。

SPAでは、ページ全体の静的ファイルをリクエストするのは最初のみで、それ以降はページ全体をリクエストすることはない。

２回目以降は、ページ部分的にリクエストを行い、サーバー側からJSONを受け取っていく。



> ↪️ 参考：https://developers.google.com/analytics/devguides/collection/analyticsjs/single-page-applications

![SPアプリにおけるデータ通信の仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SPアプリにおけるデータ通信の仕組み.png)

<br>

### SPAの実装方法

#### ▼ MVVMアーキテクチャ

View層とModel層の間にViewModel層を配置し、View層とViewModel層の間で双方向にデータをやり取り (双方向データバインディング) することによって、View層とModel層の間を疎結合にするための設計手法の一種。

Vue.jsでは、意識せずにMVVMアーキテクチャで実装できるようになっている。

詳しくは、以下のリンクを参考にせよ。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/language/language_js_framework_vuejs.html

![一般的なMVVMアーキテクチャ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/一般的なMVVMアーキテクチャ.png)

<br>

### SPAと従来MPAの比較

#### ▼ 処理速度

MPAと比較して、データを非同期的に通信できるため、1つのWebページの中で必要なデータのみを通信すればよく、レンダリングが速い。

![従来WebアプリとSPアプリの処理速度の違い](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/従来WebアプリとSPアプリの処理速度の違い.png)


> ↪️ 参考：https://www.switchitmaker2.com/seo/spa/


#### ▼ SEO

SPAは、Googleのクローラーがページを認識しにくく、Webページがインデックスされない可能性がある。



> ↪️ 参考：https://www.switchitmaker2.com/seo/spa/

<br>

## 02. SSR：Server Side Rendering

### 広義のSSRとは

ブラウザ側ではなくサーバー側で静的ファイルを作成する。

フレームワークのテンプレートエンジンやCGIを使用して、サーバー側で静的ファイルを作成すること、も含まれる。




| ブラウザレンダリングのステップ | 実行者 |
|-----------------|--------|
| Loading         | サーバー   |
| Scripting       | サーバー   |
| Rendering       | サーバー   |
| Paiting         | ブラウザ   |


> ↪️ 参考：
>
> - https://tadtadya.com/summary-of-the-web-site-display-process-flow/#index-list-8
> - https://ja.nuxtjs.org/docs/2.x/concepts/server-side-rendering

<br>

### 狭義のSSRとは

広義のSSRにSPAを取り入れた方法のこと。

ブラウザ側ではなくサーバー側で静的ファイルを作成する。

広義のSSRと異なる点は、ブラウザ側にレンダリングされた後、アイソモーフィックJavaScriptという仕組みでSPAとして動作する。



> ↪️ 参考：
>
> - https://qiita.com/rita0222/items/66fec6e7be5987bace3c
> - https://qiita.com/kyrieleison/items/4ac5bcc331aee6394440#%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E3%82%B5%E3%82%A4%E3%83%89%E3%81%A8%E3%82%B5%E3%83%BC%E3%83%90%E3%82%B5%E3%82%A4%E3%83%89%E3%81%AE%E3%82%B3%E3%83%BC%E3%83%89%E5%85%B1%E6%9C%89<br>

<br>

## 03. SSG：Static Site Generation

### SSGとは

事前にビルドを行って静的ファイルを作成しておく。

そして、これをレンダリングし、静的サイトとして稼働させる。

動的な要素 (例：ランダム表示) を含む静的ファイルについては、該当の部分でAjaxを使用できるようにしておく。



<br>

## 04. ISR：Incremental Static Regeneration

### ISRとは

SSGの発展型。

SSGとは異なり、事前にビルドせず、静的ファイルを作成しない。

その代わり、クライアントからリクエストがあって初めて、そのWebページのみビルドが実行され、レンダリングされる。

クライアントから一回でもリクエストがあったWebページでは、初回時にビルドされた静的ファイルがその都度レンダリングされる。



> ↪️ 参考：https://nextjs.org/docs/basic-features/data-fetching#incremental-static-regeneration

<br>

## 05. Atomic Design

### Atmic Designとは

フロントエンドを構成する要素を、5つのレイヤー (Atoms、Molecules、Organisms、Templates、Pages) に分ける設計方法のこと。



> ↪️ 参考：https://atomicdesign.bradfrost.com/

<br>

### Nuxt.jsを参考に考える

Nuxt.jsとAtomic Designのレイヤーは以下の様に対応する。



> ↪️ 参考：https://tec.tecotec.co.jp/entry/2020/03/27/090000

| Nuxt.jsのディレクトリ | Atomic Designのレイヤー        |
|----------------|---------------------------|
| components     | Atoms、Molecules、Organisms |
| pages          | Pages                     |
| layouts        | Templates                 |

<br>

## 06. マイクロサービスアーキテクチャにおけるフロントエンド

### UI部品合成

#### ▼ UI部品合成とは

フロントエンドのコンポーネントを、各マイクロサービスに対応するように分割する設計方法。



![composite-ui](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/composite-ui.png)


