---
title: 【IT技術の知見】Vue.js
description: Vue.jsの知見を記録しています。
---

# Vue.js

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Vue.jsを使用したMVVMアーキテクチャ

### MVVMアーキテクチャ、双方向データバインディング

#### ▼ MVVMアーキテクチャとは

> ↪️：https://hiroki-it.github.io/tech-notebook/software/software_application_architecture_frontend.html

#### ▼ MVVMアーキテクチャにおける各層の責務

`【１】`

: View層 (`foo.html`、`/foo.twig`、`foo-component.vue`の`template`タグ部分)

     ViewModel層から渡されたデータを出力するだけ。

`【２】`

: ViewModel層 (`index.js`、`foo-component.vue`の`script`タグ部分)

     プレゼンテーションロジック (フォーマット整形、バリデーション、Webページのローディング、エラーハンドリング、イベント発火など) や、ビジネスロジック (※控えめに) を記述する。

     scriptタグによって、JavaScriptが組み込まれている。

`【３】`

: Model層 (`store.js`または`foo.js`)

     ビジネスロジックや、ajaxメソッドによるデータ送受信、を記述する。

#### ▼ Vueを使用したMVVMアーキテクチャ、双方向データバインディング

Vueは、アプリケーションの設計にMVVMアーキテクチャを使用することを前提として、双方向データバインディングを実現できるような機能を提供する。

`【１】`

: View層では、`foo.html`、`/foo.twig`、`foo-component.vue`の`template`タグ部分)

`【２】`

: ViewModel層では、`index.js`、`foo-component.vue`の`script`タグ部分

`【３】`

: Model層では、Vuex (`store.js`)やJavaScriptからなるモデル (`foo.js`) を配置する。

`【４】`

: これの元、双方向データバインディングが実現される仕組みとして、View層でイベントが起こると、ViewModel層でこれにバインディングされたイベントハンドラ関数がコールされる。

![Vueコンポーネントツリーにおけるコンポーネント間の通信](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VueにおけるMVVMアーキテクチャ.png)

### 親子コンポーネント間のデータ渡し

#### ▼ 親子コンポーネント間のデータ渡しの仕組み (Props Down, Events Up)

まず、双方向データバインディングとは異なる概念なため、混乱しないように注意する。

コンポーネント (`foo-component.vue`) の`script`タグ部分 (ViewModel層) の親子間では、`props`と`$emit`メソッドを使用して、データを渡す。

この仕組みを、Props Down, Events Upという。

![親子コンポーネント間の双方向データバインディング](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/親子コンポーネント間の双方向データバインディング.png)

![component-tree_communication](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/component-tree_communication.png)

<br>

### MVVMアーキテクチャの実装例

#### (1) 【View層】テンプレート (`foo.html`、`foo.twig`)

データが、テンプレートからJavaScriptファイルに渡される仕組みは、フレークワークを使用しない場合と同じである。

データがJavaScriptファイルに渡される状況としては、イベント発火時である。

**＊実装例＊**

例えば、テンプレートの親コンポーネントタグでクリックイベントが発火した時、親コンポーネントから、イベントに紐付いたイベントハンドラ関数がコールされる。

```html
<!-- divタグのidは『app』とする -->
<div id="app">

    <!--
    ・親コンポーネントタグを記述。


    ・dataオプションの値をpropsに渡すように設定。


    ・イベントとイベントハンドラ関数を対応づける。


    -->
    <v-foo-component-1
        :criteria="criteria"
        v-on change="changeQuery"
    ></v-foo-component-1>

    <!-- 親コンポーネントタグを記述 -->
    <v-foo-component-2

    ></v-foo-component-2>

    <!-- 親コンポーネントタグを記述 -->
    <v-foo-component-3

    ></v-foo-component-3>

</div>

<!-- ルートVueインスタンスの作成は外部スクリプトで行う。 -->
<script
    <src={{ asset(".../index.js") }}>
</script>
```

#### (1-2) 【ViewModel層】データの初期化を行うVueコンストラクタ関数 (`index.js`)

![vue-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vue-instance.png)

Vueコンストラクタ関数を使用して、インスタンス化することによって、ルートVueインスタンスが作成される。

インスタンスの変数名`vm`はVIewModelの意味である。

インスタンス化時、全てのコンポーネントのデータが初期化される。

各コンポーネントで個別に状態を変化させたいものは、`props`オプションではなく、`data`オプションとして扱う。

> ↪️：https://v1-jp.vuejs.org/guide/instance.html

**＊実装例＊**

```javascript
// ルートVueインスタンス
// 変数に対する格納を省略しても良い
var vm = new Vue({
  // Vueインスタンスを使用するdivタグを設定.
  el: "#app",

  /* dataオプション
    ・Vueインスタンスのデータを保持する
    ・異なる場所にある同じコンポーネントは異なるVueインスタンスからなる。


    ・異なるVueインスタンスは異なる値を持つ必要があるため、メソッドとして定義。


    */
  data: function () {
    return {
      isLoading: false,
      staffData: [],
      criteria: {
        id: null,
        name: null,
      },
    };
  },

  /* methodオプション
    ・Vueインスタンスのアクセサメソッドや状態変化メソッド
    ・イベントハンドラ関数、dataオプションのセッターを定義
    */
  method: {
    // イベントハンドラ関数
    changeQuery(criteriaObj) {
      const keys = ["criteria", "limit"];
      for (const key of keys) {
        if (key in criteriaObj) {
          this[key] = criteriaObj[key];
        }
      }
    },

    // dataオプションのセッター
    load(query) {
      // ここでのthisはdataオプションを指す。
      this.isLoading = true;
      this.staffData = [];
      // ajaxメソッドをラッピングしたメソッドをコール
      return (
        Staff.find(query)

          /* done()
                ajaxメソッドによって返却されたJSONが引数になる。


                */
          .done((data) => {
            /*
                    サーバーサイドからのJSONをデシリアライズ。

             
                    dataオプションに設定。


                    */
            this.staffData = _.map(data.staffData, Staff.deserializeStaff);
          })
      );
    },
  },

  /* watchオプション
    ・Vueインスタンス内の値の変化を監視する関数を定義。


    ・vue-routerも参考にせよ。
    */
  watch: {},

  // テンプレートと親コンポーネントの対応になるようにする。
  component: {
    //『HTMLでのコンポーネントのタグ名：子コンポーネント』
    "v-foo-component-1": require(".../component/foo-1.vue"),
    "v-foo-component-2": require(".../component/foo-2.vue"),
    "v-foo-component-3": require(".../component/foo-3.vue"),
  },
});
```

#### (2) 【View + ViewModel層】単一ファイルコンポーネントに相当するコンポーネント (`foo-component.vue`)

コンポーネントは、View層に相当する`template`タグ、ViewModel層に相当する`script`タグと`style`タグを使用して、単一ファイルコンポーネントとする。

**＊実装例＊**

例えば、親コンポーネントの子コンポーネントタグでクリックイベントが発火した時、子コンポーネントから、イベントに紐付いたイベントハンドラ関数がコールされる。

```html
<template>
  <!----------------------------------------
  // View層
  // ・親コンポーネント
  // ・ここに、出力したいHTMLやTWIGを記述する。 
  ------------------------------------------>

  <!-- 
  ・子コンポーネントタグを記述 
  ・下方のdataオプションの値をpropsに渡すように設定。


  -->
  <v-foo-component-4 :aaa="a" :bbb="b"></v-foo-component-4>

  <!-- 条件付きレンダリングを行うディレクション -->
  <template v-if="foo.isOk()">
    <!-- 孫コンポーネントタグを記述 -->
    <v-foo-component-5 :ccc="c" :ddd="d"></v-foo-component-5>
  </template>
</template>

<script>
  //=============
  // ViewModel層
  //=============

  // 親コンポーネント以降では、Vueインスタンスを作成しないようにする。
  module.exports = {
    /* propsオプション
    ・親コンポーネントまたはajaxメソッドからpropsオブジェクトのプロパティに値が格納される。


    */
    props: {
      criteria: {
        type: Object,
        required: true,
      },

      foo: {
        type: Object,
        required: true,
      },
    },

    /* dataオプション
    ・異なる場所にある同じコンポーネントは異なるVueインスタンスからなる。


    ・異なるVueインスタンスは異なる値を持つ必要があるため、メソッドとして定義する。


    */
    data: function () {
      return {
        a: "a",
        b: "b",
        c: "c",
        d: "d",
      };
    },

    // イベントハンドラ関数、dataオプションのセッター
    method: {
      updateCriteria(key, value) {
        /*
        ・コンポーネント (v-foo-component-1) と紐付く処理
        ・changeイベントの発火と、これのイベントハンドラ関数に引数を渡す。


        */
        this.$emit("change", {criteria: localCriteria});
      },

      // ajaxメソッドから受信したデータを使用して、propsを更新
      updateProps(key, value) {},

      // 『HTMLでのコンポーネントのタグ名： JSでのコンポーネントのオブジェクト名』
      component: {
        // 子コンポーネントと孫コンポーネントの対応関係
        "v-foo-component-4": require("./xxx/xxx/foo-4"),
        "v-foo-component-5": require("./xxx/xxx/foo-5"),
      },
    },
  };
</script>
```

#### (3) 【Model層】オブジェクトに相当するVuex (`store.js`)

ノート内の『Vuex』の項目を参照せよ。

#### (3-2) 【Model層】オブジェクトに相当するJavaScript (`foo.js`)

クラス宣言で実装する。

**＊実装例＊**

```javascript
class Foo {
  /*
    ・コンポーネントからパケットを受信。


    ・プロパティの宣言と、同時に格納。


    */
  constructor(properties) {
    this.isOk = properties.isOk;
  }

  // コンストラクタによって宣言されているため、アクセスできる。
  isOk() {
    // bool値を返却する例を考える。
    return this.isOk;
  }
}
```

<br>

## 01-02. View層とViewModel層の間での双方向データバインディングの方法

### イベントハンドリング

#### ▼ `v-on:`とは

![Vueにおけるemitとv-onの連携](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Vueにおけるemitとv-onの連携.png)

View層 (`template`タグ部分) のイベントを、ViewModel層 (`script`タグ部分) のイベントハンドラ関数 (`methods:`内にあるメソッド) やインラインJSステートメントにバインディングし、イベントが発火した時点でイベントハンドラ関数をコールする。

コンポーネントの`script`タグ部分 (ViewModel層) の親子間データ渡しである『Props Down, Events Up』とは異なる概念なので注意する。

```
v-on:{イベント名}="{イベントハンドラ関数 (methods: 内にあるメソッド) }"
```

または、省略して、

```
@:{イベント名}="<イベントハンドラ関数>"
```

で記述する。

#### ▼ `v-on:submit="<イベントハンドラ関数>"`、`button`タグ

View層のフォーム送信イベントが起きた時点で、ViewModel層にバインディングされたイベントハンドラ関数をコールする。

例えば、親コンポーネントでは、子コンポーネントによって発火させられる`search`イベントに対して、`result`メソッドというイベントハンドラ関数を紐付けておく。

**＊実装例＊**

```html
<div id="app">
  <v-foo-component
          v-on:search="result()"
  ></v-foo-component>
</div>

<!-- Vueインスタンスの作成は外部スクリプトで行う。 -->
<script src="{{ asset(".../index.js") }}">
</script>
```

index.jsの`methods:`内には、イベントハンドラ関数として`result`メソッドを定義する。

**＊実装例＊**

```javascript
// 変数に対する格納を省略しても良い
var vm = new Vue({
  // Vueインスタンスを使用するdivタグを設定.
  el: "#app",

  // イベントハンドラ関数
  method: {
    result() {
      // 何らかの処理
    },
  },
});
```

`【１】`

: 『検索ボタンを押す』という`submit`イベントの発火によって、`form`タグでイベントに紐付けられているイベントハンドラ関数 (`search`メソッド) がコールされる。
`【２】`

: イベントハンドラ関数内の`emit`メソッドが、親コンポーネントの`search`イベントを発火させる。これに紐付くイベントハンドラ関数 (`result`メソッド) がコールされる。

**＊実装例＊**

```html
<template>
  <!-- submitイベントが発火すると、紐付くイベントハンドラ関数がコールされる -->
  <form v-on:submit.prevent="search()">
    <!-- submitイベントを発火させるbuttonタグ。submitの場合は省略可能 -->
    <button type="submit">検索する</button>
  </form>
</template>

<script>
  // 変数に対する格納を省略しても良い
  var vm = new Vue({
    // イベントハンドラ関数を定義
    methods: {
      search() {
        // 親コンポーネントのsearchイベントを発火させる。
        this.$emit("search");
      },
    },
  });
</script>
```

#### ▼ `v-on:click="<イベントハンドラ関数>"`

View層でクリックイベントが起きた時点で発火し、ViewModel層でバインディングされたイベントハンドラ関数をコールする。

#### ▼ `v-on:change="<イベントハンドラ関数>"`

View層で`input`タグや`select`タグで、値の入力後にマウスフォーカスがタグから外れた時点で発火し、ViewModel層でバインディングされたイベントハンドラ関数をコールする

#### ▼ `v-on:input="<イベントハンドラ関数>"`

View層で`input`タグで、一文字でも値が入力された時点で発火し、ViewModel層バインディングされたイベントハンドラ関数をコールする。`v-on:change`とは、イベントが発火するタイミングが異なるため、共存できる。

<br>

### 条件付きレンダリング

#### ▼ `v-show`/`v-if`とは

条件分岐を行うタグであり、`v-show`または`v-if`を使用して、プロパティ名を指定する。親テンプレートから渡された`props`内のプロパティ名が持つ値が`TRUE`の時に表示し、`FALSE`の時に非表示にする。もし頻繁に表示と非表示の切り替えを行うようなら、`v-if`の方が、描画コストが重たくなるリスクが高くなる為、`v-show`推奨である。

| タグ   | 使い分け                        |
| ------ | :------------------------------ |
| v-if   | 単発の切り替えがメインの場合    |
| v-show | 表示/非表示の切替回数が多い場合 |

<br>

### 属性データバインディング

#### ▼ `v-bind`とは

記入中...

<br>

### フォーム入力データバインディング

#### ▼ `v-model`とは

実装方法は、`v-on:input="<イベントハンドラ関数>"`と同じである。例えば、以下の2つは同じである。

```html
<input
    type="text"
    v-model="foo">
</input>
```

```html
<input
    type="text"
    :value="foo"
    @input="eventHandler">
</input>
```

<br>

### その他のディレクティブ

#### ▼ `v-cloak`とは

記入中...

<br>

## 01-03. コンポーネント

### コンポーネントの登録方法

#### ▼ グローバル登録

**＊実装例＊**

```javascript
Vue.component("v-foo-component", {
  template: require("./xxx/xxx/foo"),
});

// 変数に対する格納を省略しても良い
var vm = new Vue({
  el: "#app",
});
```

#### ▼ ローカル登録

**＊実装例＊**

```javascript
var vFooComponent = {
  // テンプレートと親コンポーネントの対応関係
  template: require("./xxx/xxx/foo"),
};

// 変数に対する格納を省略しても良い
var vm = new Vue({
  el: "#app",

  components: {
    // 親コンポーネントにオブジェクト名をつける。
    "v-foo-component": vFooComponent,
  },
});
```

ただし、コンポーネントのオブジェクト名の定義は、以下の様に省略できる。

**＊実装例＊**

```javascript
// 変数に対する格納を省略しても良い
var vm = new Vue({
  el: "#app",

  components: {
    // テンプレートと親コンポーネントの対応関係
    "v-foo-component": require("./xxx/xxx/foo"),
  },
});
```

<br>

## 02. vue-routerパッケージによるルーティング

### vue-router

#### ▼ vue-routerとは

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

#### ▼ `$router` (Routerインスタンス)

Webアプリケーション全体に1つ存在し、全体的なRouter機能を管理しているインスタンス。

スタック型で履歴を保持し、履歴を行き来することにより、ページ遷移を行う。

| メソッド | 説明                                                                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `push`   | `query`オブジェクトを引数とする。履歴スタック内に新しい履歴を追加し、現在をその履歴とする。また、ブラウザの戻る操作で、履歴スタック内の1つ前の履歴に移動する。 |

> ↪️：https://router.vuejs.org/guide/essentials/navigation.html

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

#### ▼ `$route` (Routeオブジェクト)

現在のアクティブなルートを持つオブジェクト

| プロパティ | データ型 | 説明                                                                                                                              | 注意                                     |
| :--------- | -------- | :-------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `path`     | `string` | 現在のルートの文字列。                                                                                                            |                                          |
| `query`    | `Object` | クエリパラメーターのキー名と値を保持するオブジェクト。`/foo?user=1`というクエリパラメーターの場合、`$route.query.user==1`となる。 | もしクエリーがない場合は、空オブジェクト |
| `fullPath` | `string` | URL全体の文字列。                                                                                                                 |                                          |

<br>

### その他のRouterパッケージ

JQueryにはJQueryRouter、ReactにはReact-Routerがある。

<br>

## 03. Vuexパッケージによるデータの状態変化の管理

### Vuex

#### ▼ Vuexとは

Vue.jsでパッケージの1つで、MVVMアーキテクチャのモデルに相当する機能を提供し、グローバルで参照できる。

異なるコンポーネントで共通したデータを扱いたくとも、双方向データバインディングでは、親子コンポーネント間でしか、データを受け渡しできない。

しかし、Vuexストア内で、データの状態の変化を管理することによって、親子関係なく、全てのコンポーネント間でデータを受け渡しできるようになる。

※Vuexからなるモデルはどうあるべきか、について記入中...

![VueコンポーネントツリーとVuexの関係](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VueコンポーネントツリーとVuexの関係.png)

<br>

### `Vuex.Store`メソッドによるVuexストアの実装

外部のコンポーネントは、各オプションにアクセスできる。

#### ▼ `getters:{}`

データから状態を取得するメソッドをいくつか持つ。

クラスベースオブジェクト指向でいうところの、Getterメソッドに相当する。

※ MVVMで、モデルにゲッターを持たせてはいけないというルールについては、記入中...

#### ▼ `state:{}`

データの状態の変化をいくつか管理する。

クラスベースオブジェクト指向でいうところの、データ (プロパティ) に相当する。

#### ▼ `mutations:{}`

データに状態 (`state`) を設定するメソッドをいくつか持つ。

保守性の観点から、`mutations:{}`におくメソッド間は同期的に実行されるようにしておかなければならない。

クラスベースオブジェクト指向でいうところの、Setterメソッドに相当する。

#### ▼ `actions:{}`

定義された`mutations{}`のメソッドを間接的にコールするためのメソッドをいくつか持つ。

また、JQueryの`ajax`メソッド をコールし、サーバー側からレスポンスされたデータを`mutations:{}`へ渡す。

クラスベースオブジェクト指向でいうところの、Setterメソッドに相当する。

**＊実装例＊**

```javascript
// Vuexパッケージを読み込む。
const vuex = require("vuex");

// 外部ファイルが、このStoreインスタンスを読み込めるようにする。
module.exports = new Vuex.Store({
  /* getters
    ・データから状態を取得するメソッドをいくつか持つ
    ・クラスベースオブジェクト指向のGetterメソッドに相当.
    */
  getters: {
    staffData(state) {
      return state.staffData;
    },
  },

  /* state
    ・状態の変化を管理したいデータを持つ。


    ・クラスベースオブジェクト指向のプロパティに相当。


    */
  state: {
    // stateには多くを設定せず、Vueインスタンスのdataオプションに設定しておく。
    staffData: [],
  },

  /* mutations
    ・データの状態 (state) を変化させるメソッドを持つ。


    ・クラスベースオブジェクト指向のSetterメソッドに相当。


    */
  mutations: {
    // Vuexのstateを第一引数、外部からセットしたい値を第二引数
    mutate(state, staffData) {
      exArray.forEach(
        /*
                ・矢印はアロー関数を表し、無名関数の即コールを省略できる。


                ・引数で渡されたexArrayの要素を、stateのexArrayに格納する。


                */
        (element) => {
          state.exArray.push(element);
        },

        /* 
                ※アロー関数を使用しなければ、以下の様に記述できる。


                function(element) { state.exArray.push(element); }
                */
      );
    },
  },

  /* actions
    ・mutations{}のメソッドを間接的にコールするためのメソッドをいくつか持つ。


    ・contextオブジェクトからcommit機能を取り出す必要がある。

 (※省略記法あり) 
    ・クラスベースオブジェクト指向のSetterメソッドに相当。


    */
  actions: {
    // 省略記法 (Argument destructuring)
    mutate({commit}) {
      commit("mutate");
    },
  },
});
```

<br>

### コンポーネントからVuexに対するアクセス

例えば、子コンポーネントのファイル (`template`タグを持つファイル) の下部に、以下を記述することにより、`Vuex.Store`メソッドとデータを受け渡しできるようになる。

#### ▼ `computed: {}`

イベントハンドラ関数として、`mapGetters`ヘルパーと`mapState`ヘルパーを設定する。

#### ▼ `methods: {}`

イベントハンドラ関数として、`mapMutations`ヘルパーと`mapActions`ヘルパーを設定する。

#### ▼ `mapGetters`ヘルパー

コンポーネントの`computed:{}`に、`Vuex.Store`メソッドの`getters: {}`をマッピングし、コールできるようにする。

#### ▼ `mapState`ヘルパー

コンポーネントの`computed:{}`に、`Vuex.Store`メソッドの`state: {}`をマッピングし、コールできるようにする。

#### ▼ `mapMutations`ヘルパー

コンポーネントの`methods: {}`に、Vuex.Store`メソッドの`mutations: {}```をマッピングし、コールできるようにする。

#### ▼ `mapActions`ヘルパー

コンポーネントの`methods: {}`に、`Vuex.Store`メソッドの`actions:{}`をマッピングし、コールできるようにする。

**＊実装例＊**

```html
<!-- 子コンポーネント -->
<template> ... </template>
<script>
  // Vuex.Store()を読み込む。
  const store = require("./_store");

  // Vuex.Store()のgetters、mutations、actionsをマッピングできるように読み込む。
  const mapGetters = require("vuex").mapGetters;
  const mapActions = require("vuex").mapActions;
  const mapMutaions = require("vuex").mapMutaions;

  module.exports = {
    // イベントハンドラ関数を定義 (※データを状態の変更を保持したくないもの)
    computed: {
      /* mapGettersヘルパー。


      StoreのGetterをローカルマシンのcomputed:{}にマッピングし、コールできるように。


      */
      ...mapGetters(["x-Function"]),
    },

    // イベントハンドラ関数を定義 (※データを状態の変更を保持したいもの)
    methods: {
      // mapMutationsヘルパー
      ...mapMutations(["y-Function"]),

      // mapActionsヘルパー
      ...mapActions(["z-Function"]),
    },
  };
</script>
```

<br>

## 04. ライフサイクル

### ライフサイクルフック

#### ▼ ライフサイクルフックとは

Vueインスタンスの作成から破棄までの間に実行される関数のこと。

全ての関数を使用する必要はない。

| 順番 | フック名      | タイミング                                               |
| :--- | :------------ | :------------------------------------------------------- |
| 1    | beforeCreate  | Vueインスタンスの作成前                                  |
| 2    | created       | Vueインスタンスの作成後                                  |
| 3    | beforeMount   | Vueインスタンスがマウントされる前                        |
| 4    | mounted       | Vueインスタンスがマウントされた後                        |
| 5    | beforeUpdate  | データ更新時の再レンダリング前                           |
| 6    | updated       | データ更新時の再レンダリング後                           |
| 7    | beforeDestroy | Vueインスタンスが削除される前 (`$destroy`メソッド実行前) |
| 8    | destroyed     | Vueインスタンスが削除された後 (`$destroy`メソッド実行後) |

> ↪️：https://jp.vuejs.org/v2/api/index.html#%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3-%E3%83%A9%E3%82%A4%E3%83%95%E3%82%B5%E3%82%A4%E3%82%AF%E3%83%AB%E3%83%95%E3%83%83%E3%82%AF

#### ▼ マウントとは

ブラウザ上のリアルDOMの要素を、Vue.jsの処理によって作成される仮想DOMの要素で置き換えること。

> ↪️：https://jp.vuejs.org/v2/guide/render-function.html#%E3%83%8E%E3%83%BC%E3%83%89%E3%80%81%E3%83%84%E3%83%AA%E3%83%BC%E3%80%81%E3%81%8A%E3%82%88%E3%81%B3%E4%BB%AE%E6%83%B3-DOM

#### ▼ beforeCreate

Vueインスタンスの作成前に実行される。

**＊検証例＊**

beforeCreateフックの動作を検証する。

`data`オプションは、Vueインスタンス作成後に有効になるため、beforeCreateフックでコールできず、`undefined`になる。

```html
<template>
  <div>{{ name }}</div>
</template>
<script>
  new Vue({
    data() {
      return {
        foo: "Hiroki",
      };
    },

    beforeCreate() {
      console.log(this.name);
    },
  });
</script>
```

```bash
# 結果
undefined
```

#### ▼ created

フックの中で特によく使用する。

Vueインスタンスの作成後に実行される。

マウント前に必要な処理を実装する。

**＊実装例＊**

非同期通信によるデータを取得、マウント時に必要なデータの準備、など

**＊検証例＊**

createdフックの動作を検証する。

`data`オプションは、Vueインスタンス作成後に設定されるため、createdフックでコールでき、処理結果が表示される。

```html
<template>
  <div>{{ name }}</div>
</template>
<script>
  // 変数に対する格納を省略しても良い
  var vm = new Vue({
    data() {
      return {
        name: "Hiroki",
      };
    },

    created() {
      console.log(this.name);
    },
  });
</script>
```

```bash
# 結果
"Hiroki"
```

#### ▼ beforeMount

Vueインスタンスがマウントされる前に実行される。

**＊検証例＊**

beforeMountフックの動作を検証する。

`data`オプションから`name`変数に対する展開は、マウントによって実行される。

そのため、beforeMountフックの段階では要素自体が作成されておらず、何も表示されない。

```html
<template>
  <div>{{ name }}</div>
</template>
<script>
  // 変数に対する格納を省略しても良い
  var vm = new Vue({
    data() {
      return {
        name: "",
      };
    },

    beforeMount() {
      this.name = "Hiroki";
    },
  });
</script>
```

```bash
# 結果
# 要素が作成されていないため、何も表示されない。
```

#### ▼ mounted

フックの中で特によく使用する。

Vueインスタンスがマウントされた後に実行される。

要素を操作する処理を実装する。

まず、Vueインスタンスに`el`オプションが設定されているかを識別し、これに応じて処理の流れが分岐する。

SSRの場合には使用できない。

**＊実装例＊**

Vue.js以外の外部パッケージの読み出し、検索実行時のイベントハンドラ関数、ページング実行時のイベントハンドラ関数、など

**＊検証例＊**

beforeMountフックの動作を検証する。

`data`オプションから`name`変数に対する展開は、elementに対するマウント中に実行される。

そのため、`mounted`メソッドが実行され、空文字が上書きされる。

```html
<template>
  <div>{{ name }}</div>
</template>
<script>
  // 変数に対する格納を省略しても良い
  var vm = new Vue({
    data() {
      return {
        name: "",
      };
    },

    mounted() {
      this.name = "Hiroki";
    },
  });
</script>
```

```bash
# 結果
"Hiroki"
```

ただし、全ての子コンポーネントでマウントが完了したことを待つために、`nextTick`メソッドを使用する必要がある。

```html
<template>
  <div>{{ name }}</div>
</template>
<script>
  // 変数に対する格納を省略しても良い
  var vm = new Vue({
    data() {
      return {
        name: "",
      };
    },

    mounted() {
      this.$nextTick(function () {
        this.name = "Hiroki";
      });
    },
  });
</script>
```

#### ▼ beforeUpdate

データが更新される時の再レンダリング前に実行される。

再レンダリング前に要素を操作する処理を実装する。

**＊実装例＊**

WindowオブジェクトやDocumentオブジェクトのメソッドによる要素の取得、など

**＊検証例＊**

```html
<template>
  <div>{{ name }}</div>
</template>
<script>
  // 変数に対する格納を省略しても良い
  var vm = new Vue({
    data() {
      return {
        name: "",
      };
    },

    mounted() {
      this.$nextTick(function () {
        this.name = "Hiroki";
      });
    },

    beforeUpdate() {
      console.log(this.name);
    },
  });
</script>
```

```bash
# 結果
"Hiroki"
```

#### ▼ updated

データが更新される時の再レンダリング後に実行される。

再レンダリング後に要素を操作する処理を実装する。

```html
<template>
  <div>{{ name }}</div>
</template>
<script>
  // 変数に対する格納を省略しても良い
  var vm = new Vue({
    data() {
      return {
        name: "",
      };
    },

    mounted() {
      this.$nextTick(function () {
        this.name = "Hiroki";
      });
    },

    beforeUpdate() {
      console.log(this.name);
    },
  });
</script>
```

```bash
# 結果
"Hiroki"
```

#### ▼ beforeDestroy

Vueインスタンスが削除される前に実行する。

インスタンスを削除する前に無効化しておく必要のある処理を実装する。

SSRの場合には使用できない。

#### ▼ destroyed

Vueインスタンスが削除された後に実行する。

インスタンスを削除した後のTearDown処理を実装する。

SSRの場合には使用できない。

<br>
