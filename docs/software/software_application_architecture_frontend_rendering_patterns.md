---
title: 【IT技術の知見】レンダリングパターン＠フロントエンドアーキテクチャ
description: レンダリングパターン＠フロントエンドアーキテクチャの知見を記録しています。
---

# レンダリングパターン＠フロントエンドアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. レンダリングパターン

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

このHTMLをブラウザにサーバーレンダリングする。

サーバーサイドのフレームワークを使用して単純なアプリケーションを作る場合、まだまだ現役の技術である。

> - https://qiita.com/kimizuy/items/d33420330479f8c85449

<br>

## 03. Ajaxによるアプリケーション

1つのWebページの中で、サーバーとデータを非同期通信し、ブラウザ側で部分的に静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) を作成する。

Ajaxの仕組みで作成したアプリはSPAである (CSRとはSPA内部の仕組みが異なる) 。

Ajaxの仕組みで作成したアプリはSPAである。

クライアント側でサーバーレンダリングを実行するため、SSRと比較してCSR：Client Server side Renderingともいう。

| サーバーレンダリングのステップ | 実行者   |
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

ブラウザ側で静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) を作成する。

CSRの仕組みで作成したアプリはSPAである (AjaxとはSPA内部の仕組みが異なる) 。

最初に取得するhtmlファイルはほぼ空で、ブラウザ上でjavascriptファイルを実行し、htmlファイルを全てを作成する。

その後、クライアントの操作で部分的にデータをリクエストし、htmlファイルを部分的に変更する。

大きなjavascriptファイルを最初に読み込むため、初回の読み込み時間が長くなる。

![csr](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/csr.png)

> - https://zenn.dev/bitarts/articles/37260ddb28ae5d
> - https://qiita.com/shinkai_/items/79e539b614ac52e48ca4

<br>

### ブラウザとバックエンド間の通信

CSRでは、ブラウザ上のJavaScriptがバックエンドからデータを取得し、データの出力された静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) をブラウザ上でクライアントレンダリングする。

そのためSSRやSSGとは異なり、ブラウザ上でバックエンドアプリケーションと通信する。

![csr](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/csr.png)

> - https://qiita.com/Dragon1208/items/feac42eb9668a5f75250#1-%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E3%82%B5%E3%82%A4%E3%83%89%E3%83%AC%E3%83%B3%E3%83%80%E3%83%AA%E3%83%B3%E3%82%B0-csr

<br>

### CSRの実装方法

#### ▼ 状態・振る舞い管理

CSRでは、ブラウザ上の操作による現在のデータに応じて、同じページ内でクライアントレンダリングするHTMLが動的に変わり続ける。

これは、同じページでは特定のHTMLしかクライアントレンダリングできない他の方法 (SSR、SSG、ISRなど) とは異なる。

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

    const [fooState setFooState] = useState("");

    useEffect(
        // 実行したい無名な非同期関数
        () => {
            const todoList = await getTodoList()
            setFooState(todoList);
    }, []);

    return state;
};

function App() {

    const state = useTodoList();

    // データがまだ取得できていないならローディング、取得できているならHTMLをクライアントレンダリングする関数
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

MPAと比較して、データを非同期的に通信できるため、1つのWebページの中で必要なデータのみを通信すればよく、クライアントレンダリングが速い。

![従来WebアプリとSPAの処理速度の違い](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/従来ウェブアプリとSPAの処理速度の違い.png)

> - https://www.switchitmaker2.com/seo/spa/

#### ▼ SEO

CSRは、Googleのクローラーがページを認識しにくく、Webページがインデックスされない可能性がある。

> - https://www.switchitmaker2.com/seo/spa/

<br>

### 適するアプリ

- SEOが重要なアプリ
- リアルタイム処理が求められないアプリ

> - https://hitonote.co.jp/column/seo/17901/#サーバーサイドレンダリング

<br>

## 05. SSR：Server Side Rendering

### 広義のSSRとは

SSRでは、フロントエンドアプリケーションへのリクエスト時にバックエンドからデータを取得し、データの出力された静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) をフロントエンドアプリケーション上でサーバーレンダリングする。

また、ブラウザ上で静的ファイルのハイドレーションを実施する。

フレームワークのテンプレートエンジンやCGIを使用して、サーバー側で静的ファイルを作成すること、も含まれる。

| サーバーレンダリングのステップ | 実行者   |
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

SSRでは、フロントエンドアプリケーションへのリクエスト時にバックエンドからデータを取得し、データの出力された静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) をフロントエンドアプリケーション上でサーバーレンダリングする。

また、ブラウザ上で静的ファイルのハイドレーションを実施する。

広義のSSRと異なる点は、ブラウザ側にサーバーレンダリングされた後、アイソモーフィックJavaScriptという仕組みでCSRとして動作する。

![ssr](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ssr.png)

> - https://qiita.com/rita0222/items/66fec6e7be5987bace3c
> - https://qiita.com/kyrieleison/items/4ac5bcc331aee6394440#%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E3%82%B5%E3%82%A4%E3%83%89%E3%81%A8%E3%82%B5%E3%83%BC%E3%83%90%E3%82%B5%E3%82%A4%E3%83%89%E3%81%AE%E3%82%B3%E3%83%BC%E3%83%89%E5%85%B1%E6%9C%89<br>

<br>

### ブラウザとバックエンド間の通信

SSRでは、フロントエンドアプリケーションへのリクエスト時にバックエンドからデータを取得し、データの出力された静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) をフロントエンドアプリケーション上でサーバーレンダリングする。

また、ブラウザ上で静的ファイルのハイドレーションを実施する。

そのためCSRとは異なり、フロントエンドアプリケーション上での静的ファイルのレンダリング時またはブラウザ操作時 (例：クリック操作によるデータ送信など) に、バックエンドアプリケーションと通信する。

![ssr](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ssr.png)

> - https://qiita.com/Dragon1208/items/feac42eb9668a5f75250#2-%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%B5%E3%82%A4%E3%83%89%E3%83%AC%E3%83%B3%E3%83%80%E3%83%AA%E3%83%B3%E3%82%B0-ssr

<br>

### 適するアプリ

- SEOが重要なアプリ
- リアルタイム処理が求められないアプリ

> - https://hitonote.co.jp/column/seo/17901/#サーバーサイドレンダリング

<br>

## 06. SSG：Static Site Generation

### SSGとは

事前にビルドを行って静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) を作成しておく。

そして、これをサーバーレンダリングし、静的サイトとして稼働させる。

動的な要素 (例：ランダム表示) を含む静的ファイルについては、該当の部分でAjaxを使用できるようにしておく。

> - https://qiita.com/Dragon1208/items/feac42eb9668a5f75250#3-%E9%9D%99%E7%9A%84%E3%82%B5%E3%82%A4%E3%83%88%E7%94%9F%E6%88%90-ssg

![ssg](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ssg.png)

<br>

### ブラウザとバックエンド間の通信

SSGでは、フロントエンドアプリケーションのビルド時にバックエンドからデータを取得し、データの出力された静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) をフロントエンドアプリケーション上でサーバーレンダリングする。

そのためCSRとは異なり、フロントエンドアプリケーション上での静的ファイルのサーバーレンダリング時またはブラウザ操作時 (例：クリック操作によるデータ送信など) に、バックエンドアプリケーションと通信する。

![ssg](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ssg.png)

> - https://qiita.com/Dragon1208/items/feac42eb9668a5f75250#3-%E9%9D%99%E7%9A%84%E3%82%B5%E3%82%A4%E3%83%88%E7%94%9F%E6%88%90-ssg

<br>

### 適するアプリ

記入中...

<br>

## 07. ISR：Incremental Static Regeneration

### ISRとは

SSGの発展型。

SSGと同じで事前にビルドし、静的ファイル (例：`html`ファイル、`css`ファイル、画像、動画、メールなど) をサーバーレンダリングする。

また、静的ファイルのキャッシュを作成しておき、静的ファイルを再作成することで定期的にキャッシュを更新する。

![isr](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/isr.png)

> - https://nextjs.org/docs/basic-features/data-fetching#incremental-static-regeneration
> - https://qiita.com/Dragon1208/items/feac42eb9668a5f75250#4-%E3%82%A4%E3%83%B3%E3%82%AF%E3%83%AA%E3%83%A1%E3%83%B3%E3%82%BF%E3%83%AB%E9%9D%99%E7%9A%84%E5%86%8D%E7%94%9F%E6%88%90-isr

<br>

### ブラウザとバックエンド間の通信

![isr](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/isr.png)

> - https://qiita.com/Dragon1208/items/feac42eb9668a5f75250#3-%E9%9D%99%E7%9A%84%E3%82%B5%E3%82%A4%E3%83%88%E7%94%9F%E6%88%90-ssg

<br>

## 08. UR：Universal Rendering

SSRとCSRを組み合わせたレンダリングパターンであり、SST（Server Side Templating）に似ている。

> - https://nuxt.com/docs/4.x/guide/concepts/rendering

<br>

## 09. Streaming SSR

記入中...

<br>
