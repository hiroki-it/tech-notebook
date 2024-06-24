---
title: 【IT技術の知見】vue-router＠Vue.js
description: vue-router＠Vue.jsの知見を記録しています。
---

# vue-router＠Vue.js

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. vue-router

### vue-routerとは

![vue-router](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vue-router.png)

ルーティングパッケージの一種。コンポーネントに対してルーティングを行い、`/<ルート>/<パラメータ>`に応じて、コールするコンポーネントを動的に切り替えられる。

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

また、vue-routerの能力を利用するために、`router`オプションをルートコンポーネントに注入する必要がある。

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

### `$router` (Routerインスタンス)

Webアプリ全体に1つ存在し、全体的なRouter機能を管理しているインスタンス。

スタック型で履歴を保持し、履歴を行き来することにより、ページ遷移を実行する。

| メソッド   | 説明                                                                                  |
|--------|-------------------------------------------------------------------------------------|
| `push` | `query`オブジェクトを引数とする。履歴スタック内に新しい履歴を追加し、現在をその履歴とする。また、ブラウザの戻る操作で、履歴スタック内の1つ前の履歴に移動する。 |

> - https://router.vuejs.org/guide/essentials/navigation.html

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

### `$route` (Routeオブジェクト)

現在のアクティブなルートを持つオブジェクト

| プロパティ      | データ型     | 説明                                                                                 | 注意                   |
|:-----------|----------|:-----------------------------------------------------------------------------------|----------------------|
| `path`     | `string` | 現在のルートの文字列。                                                                        |                      |
| `query`    | `Object` | クエリパラメーターのキー名と値を保持するオブジェクト。`/foo?user=1`というクエリパラメーターの場合、`$route.query.user==1`となる。 | もしクエリーがない場合は、空オブジェクト |
| `fullPath` | `string` | URL全体の文字列。                                                                         |                      |

<br>

## 02. その他のRouterパッケージ

JQueryにはJQueryRouter、ReactにはReact-Routerがある。

<br>
