---
title: 【IT技術の知見】vue-router＠Vue.js
description: vue-router＠Vue.jsの知見を記録しています。
---

# vue-router＠Vue.js

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. vue-router

### vue-router とは

![vue-router](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vue-router.png)

ルーティングパッケージの一種。コンポーネントへのルーティングを設定し、`/<ルート>/<パラメータ>` に応じて、コールするコンポーネントを動的に切り替えられる。

```yaml
GET https://example.com:80/<ルート>/<パスパラメータ>?text1=a&text2=b
```

**＊実装例＊**

```javascript
// vue-routerパッケージを読み込む。
const vueRouter = require("vue-router").default;

// VueRouterインスタンスを作成する。
const router = new VueRouter({
  routes: [
    {path: "/", component: Home},
    {path: "/foo", component: Foo},
  ],
});

// 外部ファイルが、VueRouterインスタンスを読み込めるようにしておく。
module.exports = router;
```

また、vue-router の能力を利用するために、`router` オプションをルートコンポーネントに注入する必要がある。

```javascript
import router from "./router";

// 変数に対する格納を省略しても良い
var vm = new Vue({
  // routerオプション
  router,

  // watchオプション
  watch: {
    // スタック内で履歴の移動が発生した時に、対応付けた無名関数を実行。
    $route: function (to, from) {
      if (to.fullPath !== from.fullPath) {
        // 何らかの処理。
      }
    },
  },
});
```

<br>

### `$router` (Router インスタンス)

Web アプリ全体に 1 つ存在し、全体的な Router 機能を管理しているインスタンス。

スタック型で履歴を保持し、履歴を行き来することにより、ページ遷移する。

<table>
  <thead>
    <tr>
      <th>関数</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>push</code></td>
      <td><code>query</code> オブジェクトを引数とする。履歴スタック内に新しい履歴を追加し、現在をその履歴とする。また、ブラウザの戻る操作で、履歴スタック内の 1 つ前の履歴に移動する。</td>
    </tr>
  </tbody>
</table>

> - [Programmatic Navigation \| Vue Router](https://router.vuejs.org/guide/essentials/navigation.html)

**＊実装例＊**

```javascript
// users/?foo=xyz が履歴スタックに追加される。
this.$router.push({
  path: "/users",
  query: {
    foo: "xyz",
  },
});
```

<br>

### `$route` (Route オブジェクト)

現在のアクティブなルートを持つオブジェクト

<table>
  <thead>
    <tr>
      <th style="text-align:left">プロパティ</th>
      <th>データ型</th>
      <th style="text-align:left">説明</th>
      <th>注意</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left"><code>path</code></td>
      <td><code>string</code></td>
      <td style="text-align:left">現在のルートの文字列。</td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left"><code>query</code></td>
      <td><code>Object</code></td>
      <td style="text-align:left">クエリパラメーターのキー名と値を保持するオブジェクト。<code>/foo?user=1</code> というクエリパラメーターの場合、<code>$route.query.user==1</code> となる。</td>
      <td>もしクエリーがない場合は、空オブジェクト</td>
    </tr>
    <tr>
      <td style="text-align:left"><code>fullPath</code></td>
      <td><code>string</code></td>
      <td style="text-align:left">URL 全体の文字列。</td>
      <td></td>
    </tr>
  </tbody>
</table>

<br>

## 02. その他の Router パッケージ

JQuery には JQueryRouter、React には React-Router がある。

<br>
