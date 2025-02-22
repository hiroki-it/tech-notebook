---
title: 【IT技術の知見】フロントエンドアーキテクチャ＠アーキテクチャ
description: フロントエンドアーキテクチャ＠アーキテクチャの知見を記録しています。
---

# フロントエンドアーキテクチャ＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. アーキテクチャ

### 歴史

1. SST
2. Ajax
3. CSR
4. SSR
5. SSG
6. ISR

> - https://qiita.com/kimizuy/items/d33420330479f8c85449

<br>

### 共通する仕組み

#### ▼ ビルド

フロントエンドに関するファイルは、ブラウザで実行しやすい状態に変換される (コンパイルではなく) 。

- bundleによって、ファイル間で分割された実装をマージする
- transpileによって、新しい実装規格をブラウザが対応可能な古い規格に変換する
- minifyによって、インデントやコメントを取り除く

> - https://qiita.com/renbowroad/items/47fd562767e5d1c31b4a#%E5%85%B7%E4%BD%93%E7%9A%84%E3%81%AA%E3%83%93%E3%83%AB%E3%83%89%E5%87%A6%E7%90%86%E3%81%A8%E3%81%9D%E3%81%AE%E7%9B%AE%E7%9A%84
> - https://blog.tyspine.com/why-build-javascript/

<br>

## 02. SST：Server Side Templating

サーバーサイドのアプリケーションがテンプレートエンジンを使用してHTMLを生成する。

このHTMLをブラウザにレンダリングする。

サーバーサイドのフレームワークを使用して単純なアプリケーションを作る場合、まだまだ現役の技術である。

> - https://qiita.com/kimizuy/items/d33420330479f8c85449

<br>

## 03. Ajaxによるアプリケーション

1つのWebページの中で、サーバーとデータを非同期通信し、ブラウザ側で部分的に静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) を作成する。

Ajaxの仕組みで作成したアプリはSPAである (CSRとはSPA内部の仕組みが異なる) 。

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

CSRでは、ページ全体の静的ファイルをリクエストするのは最初のみで、それ以降はページ全体をリクエストすることはない。

２回目以降は、ページ部分的にリクエストを行い、サーバー側からJSONを受け取っていく。

![SPアプリにおけるデータ通信の仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SPアプリにおけるデータ通信の仕組み.png)

> - https://developers.google.com/analytics/devguides/collection/analyticsjs/single-page-applications
> - https://zenn.dev/bitarts/articles/37260ddb28ae5d
> - https://qiita.com/kimizuy/items/d33420330479f8c85449

<br>

## 04. CSR：Client Side Rendering

### CSRとは

ブラウザ側で静的ファイルを作成する。

CSRの仕組みで作成したアプリはSPAである (AjaxとはSPA内部の仕組みが異なる) 。

最初に取得するhtmlファイルはほぼ空で、ブラウザ上でjavascriptファイルを実行し、htmlファイルを全てを作成する。

その後、クライアントの操作で部分的にデータをリクエストし、htmlファイルを部分的に変更する。

大きなjavascriptファイルを最初に読み込むため、初回の読み込み時間が長くなる。

> - https://zenn.dev/bitarts/articles/37260ddb28ae5d
> - https://qiita.com/shinkai_/items/79e539b614ac52e48ca4

<br>

### CSRの実装方法

#### ▼ MVVMアーキテクチャ

View層とModel層の間にViewModel層を配置し、View層とViewModel層の間で双方向にデータをやり取り (双方向データバインディング) する。

これによって、View層とModel層の間を疎結合にする。

Vue.jsでは、意識せずにMVVMアーキテクチャで実装できるようになっている。

![一般的なMVVMアーキテクチャ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/一般的なMVVMアーキテクチャ.png)

#### ▼ 状態管理

CSRでは、ブラウザ上の操作による現在のデータに応じて、同じページ内でレンダリングするHTMLが動的に変わり続ける。

これは、同じページでは特定のHTMLしかレンダリングできない他の方法 (SSR、SSG、ISRなど) とは異なる。

CSRは、DOMの現在の状態をDOMから参照するのではなく、相当する状態を状態オブジェクトとして管理する。

そして、状態オブジェクトをその都度変更した上で、実際のDOMにこれを動的に適用し続ける。

```jsx
import {useEffect, useState} from "react";


// APIからデータを取ってくる
const getTodoList = async () => {

    return ["遊ぶ", "買い物", "宿題"];
};

// カスタムフック
const useTodoList = () => {

    const [state, setState] = useState("");

    useEffect(() => {
      const todoList = await getTodoList()
      setState(todoList);
    }, []);

    return state;
};

function App() {

    const state = useTodoList();

    // データがまだ取得できていないならローディング、取得できているならHTMLをレンダリングする関数
    return (
        <ul>
          {state ? state.map(e => <li>{e}</li>) : "Loding"}
        </ul>
    );
}
```

> - https://zenn.dev/gagaga/articles/state-management
> - https://qiita.com/shohta-noda/items/a6c1b5264cb2fee7fc6d#%E7%8A%B6%E6%85%8B%E7%AE%A1%E7%90%86

<br>

### CSRによるSPAと従来MPAの比較

#### ▼ 処理速度

MPAと比較して、データを非同期的に通信できるため、1つのWebページの中で必要なデータのみを通信すればよく、レンダリングが速い。

![従来WebアプリとSPアプリケーションの処理速度の違い](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/従来WebアプリとSPアプリケーションの処理速度の違い.png)

> - https://www.switchitmaker2.com/seo/spa/

#### ▼ SEO

CSRは、Googleのクローラーがページを認識しにくく、Webページがインデックスされない可能性がある。

> - https://www.switchitmaker2.com/seo/spa/

<br>

### 適するアプリ

- SEOが重要なアプリ
- リアルタイム性の優先度が低いアプリ

> - https://hitonote.co.jp/column/seo/17901/#サーバーサイドレンダリング

<br>

## 05. SSR：Server Side Rendering

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

広義のSSRにCSRを取り入れた方法のこと。

ブラウザ側ではなくサーバー側で静的ファイルを作成する。

広義のSSRと異なる点は、ブラウザ側にレンダリングされた後、アイソモーフィックJavaScriptという仕組みでCSRとして動作する。

> - https://qiita.com/rita0222/items/66fec6e7be5987bace3c
> - https://qiita.com/kyrieleison/items/4ac5bcc331aee6394440#%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E3%82%B5%E3%82%A4%E3%83%89%E3%81%A8%E3%82%B5%E3%83%BC%E3%83%90%E3%82%B5%E3%82%A4%E3%83%89%E3%81%AE%E3%82%B3%E3%83%BC%E3%83%89%E5%85%B1%E6%9C%89<br>

<br>

### 適するアプリ

- SEOが重要なアプリ
- リアルタイム性の優先度が低いアプリ

> - https://hitonote.co.jp/column/seo/17901/#サーバーサイドレンダリング

<br>

## 06. SSG：Static Site Generation

### SSGとは

事前にビルドを行って静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) を作成しておく。

そして、これをレンダリングし、静的サイトとして稼働させる。

動的な要素 (例：ランダム表示) を含む静的ファイルについては、該当の部分でAjaxを使用できるようにしておく。

<br>

### 適するアプリ

記入中...

<br>

## 07. ISR：Incremental Static Regeneration

### ISRとは

SSGの発展型。

SSGとは異なり、事前にビルドせず、静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) を作成しない。

その代わり、クライアントからリクエストがあって初めて、そのWebページのみビルドが実行され、レンダリングされる。

クライアントから一回でもリクエストがあったWebページでは、初回時にビルドされた静的ファイルがその都度レンダリングされる。

> - https://nextjs.org/docs/basic-features/data-fetching#incremental-static-regeneration

<br>

## 08. Atomic Design

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

## 09. クリーンアーキテクチャ風

- Viewレイヤー
- State Managementレイヤー
- API Clientレイヤー

> - https://www.upp-technology.com/blogs/a-different-approach-to-frontend-architecture/

<br>

## 10. マイクロフロントエンド

### UI部品合成とは

静的ファイルのコンポーネントを、各マイクロサービスに対応するように分割する設計方法。

![composite-ui](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/composite-ui.png)

<br>

### ビルド時合成パターン

#### ▼ ビルド時合成パターンとは

フロントエンドアプリケーションのビルド時に合成する。

<br>

### クライアントサイド合成パターン

#### ▼ クライアントサイド合成パターンとは

クライアント側 (ブラウザ上) で、静的ファイルを合成する。

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

サーバーサイド側 (ブラウザ上) で、静的ファイルを合成する。

> - https://martinfowler.com/articles/micro-frontends.html#Server-sideTemplateComposition

<br>
