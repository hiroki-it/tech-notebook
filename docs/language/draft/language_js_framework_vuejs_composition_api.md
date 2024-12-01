---
title: 【IT技術の知見】Composition API＠Vue.js
description: Composition API＠Vue.jsの知見を記録しています。
---

# Composition API＠Vue.js

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Composition APIとは

Vue.jsでパッケージの1つで、状態管理を実施する。

Vuexの後継である。

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

> - https://qiita.com/silane1001/items/f5f61f51fd785e031eb1
> - https://zenn.dev/gagaga/articles/state-management

<br>
