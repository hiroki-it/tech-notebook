---
title: 【IT技術の知見】Knative＠イベント駆動方式
description: Knative＠イベント駆動方式の知見を記録しています。
---

# Knative＠イベント駆動方式

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Knativeとは

Knativeを使用しない場合、イベント駆動関数の公開に必要なKubernetesリソース (例：Deployment、Service、Pod、など) をユーザーが作成し、関数を公開する。

一方で、Knativeであれば、イベント駆動関数の公開に必要なKubernetesリソースをフレームワークとして作成し、簡単にPodを公開できる。

> - https://logmi.jp/tech/articles/321365
> - https://qiita.com/takanorig/items/3a3a0b43b5be5b4a124f

<br>

## 02. Knativeの仕組み

### アーキテクチャ

Knativeは、Service、Route、Configuration、Revision、から構成される。

<br>

## 03. イベント駆動関数テンプレート

### Goの場合

```go
package main

func Handle(ctx context.Context, w http.ResponseWriter, r *http.Request) {

    body, err := ioutil.ReadAll(r.Body)

    defer w.Body.Close()

    if err != nil {
  	    http.Error(w, err.Error(), 500)
        return
    }

    ...
}
```

> - https://github.com/knative/func/blob/main/docs/function-templates/golang.md

<br>
