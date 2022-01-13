#  フロントエンドアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/

<br>

## 01. SPA（CSR）：Single Page Application

### SPAとは

| ブラウザレンダリングのステップ | 実行者   |
| ------------------------------ | -------- |
| Loading                        | ブラウザ |
| Scripting                      | ブラウザ |
| Rendering                      | ブラウザ |
| Paiting                        | ブラウザ |

1つのWebページの中で、サーバーとデータを非同期通信し、ブラウザ側で部分的に静的ファイルを生成する方法のこと。クライアント側でレンダリングを行うため、SSRと比較してCSR：Client Server side Renderingともいう。非同期通信は、Ajaxの手法を用いて実現される。また、静的ファイルの部分的な生成は、MVVMアーキテクチャによって実現する。SPAでは、ページ全体の静的ファイルをリクエストするのは最初のみで、それ以降はページ全体をリクエストすることはない。２回目以降は、ページ部分的にリクエストを行い、サーバー側からJSONを受け取っていく。

参考：https://developers.google.com/analytics/devguides/collection/analyticsjs/single-page-applications?hl=ja

![SPアプリにおけるデータ通信の仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SPアプリにおけるデータ通信の仕組み.png)

<br>

### SPAの実装方法

#### ・MVVMアーキテクチャ

View層とModel層の間にViewModel層を置き、View層とViewModel層の間で双方向にデータをやり取り（双方向データバインディング）することによって、View層とModel層の間を疎結合にするための設計手法の一種。Vue.jsでは、意識せずにMVVMアーキテクチャで実装できるようになっている。詳しくは、以下のリンク先を参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/software/software_application_object_oriented_language_js_framework_vuejs.html

![一般的なMVVMアーキテクチャ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/一般的なMVVMアーキテクチャ.png)

<br>

### SPAと従来MPAの比較

#### ・処理速度

MPAと比較して、データを非同期的に通信できるため、1つのWebページの中で必要なデータだけを通信すればよく、レンダリングが速い。

![従来WebアプリとSPアプリの処理速度の違い](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/従来WebアプリとSPアプリの処理速度の違い.png)

<br>

## 02. SSR：Server Side Rendering

### 広義のSSRとは

ブラウザ側ではなくサーバー側で静的ファイルを生成する方法のこと。フレームワークのテンプレートエンジンやCGIを用いて、サーバー側で静的ファイルを生成すること、も含まれる。

参考：

- https://tadtadya.com/summary-of-the-web-site-display-process-flow/#index-list-8
- https://ja.nuxtjs.org/docs/2.x/concepts/server-side-rendering

| ブラウザレンダリングのステップ | 実行者   |
| ------------------------------ | -------- |
| Loading                        | サーバー   |
| Scripting                      | サーバー   |
| Rendering                      | サーバー   |
| Paiting                        | ブラウザ |

<br>

### 狭義のSSRとは

広義のSSRにSPAを取り入れた方法のこと。ブラウザ側ではなくサーバー側で静的ファイルを生成する。広義のSSRと異なる点は、ブラウザ側にレンダリングされた後、アイソモーフィックJavaScriptという仕組みでSPAとして動作する。

参考：

- https://qiita.com/rita0222/items/66fec6e7be5987bace3c
- https://qiita.com/kyrieleison/items/4ac5bcc331aee6394440#%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E3%82%B5%E3%82%A4%E3%83%89%E3%81%A8%E3%82%B5%E3%83%BC%E3%83%90%E3%82%B5%E3%82%A4%E3%83%89%E3%81%AE%E3%82%B3%E3%83%BC%E3%83%89%E5%85%B1%E6%9C%89<br>

<br>

## 03. SSG：Static Site Generation

### SSGとは

事前にビルドを行って静的ファイルを生成しておく。そして、これをレンダリングし、静的サイトとして稼働させる。動的な要素（例：ランダム表示）を含む静的ファイルについては、該当の部分でAjaxを使用できるようにしておく。

<br>

## 04. ISR：Incremental Static Regeneration

### ISRとは

SSGの発展型。SSGとは異なり、事前にビルドせず、静的ファイルを生成しない。その代わり、クライアントからリクエストがあって初めて、そのページのみビルドが実行され、レンダリングされる。クライアントから一回でもリクエストがあったページでは、初回時にビルドされた静的ファイルがその都度レンダリングされる。

参考：https://nextjs.org/docs/basic-features/data-fetching#incremental-static-regeneration

<br>

## 05. Atomic Design

### Atmic Designとは

フロントエンドを構成する要素を、５つのレイヤー（Atoms、Molecules、Organisms、Templates、Pages）に分ける設計方法のこと。

参考：https://atomicdesign.bradfrost.com/

<br>

### Nuxt.jsを参考に考える

Nuxt.jsとAtomic Designのレイヤーは以下のように対応する。

参考：https://tec.tecotec.co.jp/entry/2020/03/27/090000

| Nuxt.jsのディレクトリ | Atomic Designのレイヤー     |
| --------------------- | --------------------------- |
| components            | Atoms、Molecules、Organisms |
| pages                 | Pages                       |
| layouts               | Templates                   |

<br>

## 06. マイクロサービスアーキテクチャにおけるフロントエンド

### UI部品合成

#### ・UI部品合成とは

フロントエンドのコンポーネントを、各サービスに対応するように分割する設計方法。

![composite-ui](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/composite-ui.png)

<br>

### BFFパターン：Backends  For Frontends

#### ・BFFパターンとは

クライアントの種類（モバイル、Web、デスクトップ）に応じたAPIを構築し、このAPIから各サービスにルーティングする設計方法。BFFパターンを実装は可能であるが、AWSでいうAPI Gatewayで代用するとより簡単に実現できる。

![bff-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/bff-pattern.png)
