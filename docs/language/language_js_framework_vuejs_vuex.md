---
title: 【IT技術の知見】Vuex＠Vue.js
description: Vuex＠Vue.jsの知見を記録しています。
---

# Vuex＠Vue.js

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Vuexとは

Vue.jsでパッケージの1つで、MVVMアーキテクチャのモデルに相当する機能を提供し、グローバルで参照できる。

異なるコンポーネントで共通したデータを扱いたくとも、双方向データバインディングでは、親子コンポーネント間でしか、データを受け渡しできない。

しかし、Vuexストア内で、データの状態の変化を管理することによって、親子関係なく、全てのコンポーネント間でデータを受け渡しできるようになる。

※Vuexからなるモデルはどうあるべきか、について記入中...

![VueコンポーネントツリーとVuexの関係](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/VueコンポーネントツリーとVuexの関係.png)

<br>

## 02. Vueストア

### Vueストアとは

`Vuex.Store`メソッドで実装できる。

外部のコンポーネントは、各オプションにアクセスできる。

<br>

### メソッド

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
  // getters
  // データから状態を取得するメソッドをいくつか持つ
  // クラスベースオブジェクト指向のGetterメソッドに相当
  getters: {
    staffData(state) {
      return state.staffData;
    },
  },

  // state
  // 状態の変化を管理したいデータを持つ。
  // クラスベースオブジェクト指向のプロパティに相当。
  state: {
    // stateには多くを設定せず、Vueインスタンスのdataオプションに設定しておく。
    staffData: [],
  },

  // mutations
  // データの状態 (state) を変化させるメソッドを持つ。
  // クラスベースオブジェクト指向のSetterメソッドに相当。
  mutations: {
    // Vuexのstateを第一引数、外部からセットしたい値を第二引数
    mutate(state, staffData) {
      exArray.forEach(
        // 矢印はアロー関数を表し、無名関数の即コールを省略できる。
        // 引数で渡されたexArrayの要素を、stateのexArrayに格納する。
        (element) => {
          state.exArray.push(element);
        },

        // アロー関数を使用しなければ、以下の様に記述できる。
        // function(element) { state.exArray.push(element); }
      );
    },
  },

  // actions
  // mutations{}のメソッドを間接的にコールするためのメソッドをいくつか持つ。
  // contextオブジェクトからcommit機能を取り出す必要がある。
  // (※省略記法あり)
  //  クラスベースオブジェクト指向のSetterメソッドに相当。
  actions: {
    // 省略記法 (Argument destructuring)
    mutate({commit}) {
      commit("mutate");
    },
  },
});
```

<br>

## 03. Vuexへのアクセス

### Vuexへのアクセスとは

例えば、子コンポーネントのファイル (`template`タグを持つファイル) の下部に、以下を記述することにより、`Vuex.Store`メソッドとデータを受け渡しできるようになる。

<br>

### メソッド

#### ▼ `computed: {}`

イベントハンドラ関数として、`mapGetters`ヘルパーと`mapState`ヘルパーを設定する。

#### ▼ `methods: {}`

イベントハンドラ関数として、`mapMutations`ヘルパーと`mapActions`ヘルパーを設定する。

#### ▼ `mapGetters`ヘルパー

コンポーネントの`computed:{}`に、`Vuex.Store`メソッドの`getters: {}`をマッピングし、コール可能にする。

#### ▼ `mapState`ヘルパー

コンポーネントの`computed:{}`に、`Vuex.Store`メソッドの`state: {}`をマッピングし、コール可能にする。

#### ▼ `mapMutations`ヘルパー

コンポーネントの`methods: {}`に、Vuex.Store`メソッドの`mutations: {}```をマッピングし、コール可能にする。

#### ▼ `mapActions`ヘルパー

コンポーネントの`methods: {}`に、`Vuex.Store`メソッドの`actions:{}`をマッピングし、コール可能にする。

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
      // mapGettersヘルパー
      // StoreのGetterをローカルマシンのcomputed:{}にマッピングし、コールできるように。
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
