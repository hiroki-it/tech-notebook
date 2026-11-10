---
title: 【IT技術の知見】Composition API
description: Composition APIの知見を記録しています。
---

# Composition API

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Composition API とは

Vue.js のパッケージの 1 つで、状態を管理する。

Vuex の後継である。

```javascript
import {reactive, computed, readonly} from "vue";

export function useTodo() {
  const items = reactive([]);

  const firstItem = computed(() => items[0] ?? null);

  function add(todo) {
    items.push(todo);
  }

  return {items: readonly(items), firstItem, add};
}
```

> - [【Vue3】もはやVuexとかPiniaって使わなくて良くない？ #Vue.js - Qiita](https://qiita.com/silane1001/items/f5f61f51fd785e031eb1)
> - [「状態管理」って何？](https://zenn.dev/gagaga/articles/state-management)

<br>
