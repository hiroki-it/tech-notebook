---
title: 【IT技術の知見】Knative＠パブリッシュ/サブスクライブパターン
description: Knative＠パブリッシュ/サブスクライブパターンの知見を記録しています。
---

# Knative＠パブリッシュ/サブスクライブパターン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Knativeとは

Knativeを使用しない場合、イベント駆動関数の公開に必要なKubernetesリソース (例：Deployment、Service、Podなど) をユーザーが作成し、関数を公開する。

一方で、Knativeであれば、イベント駆動関数の公開に必要なKubernetesリソースをフレームワークとして作成し、簡単にPodを公開できる。

> - https://logmi.jp/tech/articles/321365
> - https://qiita.com/takanorig/items/3a3a0b43b5be5b4a124f

.png<br>

## 02. Knativeの仕組み

### アーキテクチャ

Knativeは、Service、Route、Configuration、Revision、から構成される。

![knative_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/knative_architecture.png)

> - https://opensource.com/article/21/11/knative-serving-serverless
> - https://www.syntio.net/en/labs-musings/knative-overview/

<br>

### イベントメッシュ

Knativeのイベントメッシュは、イベントブローカー、イベントトリガー、からなる。

イベントブローカーは、送信元マイクロサービスのメッセージキューやメッセージブローカーのクライアントSDKとして機能する。

イベントトリガーは宛先マイクロサービスに送信するイベントをフィルタリングする。

![knative_architecture_event-mesh](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/knative_architecture_event-mesh.png)

> - https://knative.dev/docs/eventing/event-mesh/
> - https://www.salaboy.com/2022/01/29/event-driven-applications-with-cloudevents-on-kubernetes/
> - https://qiita.com/ryutoyasugi/items/3801660d83826a802718#knative-eventing%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

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
