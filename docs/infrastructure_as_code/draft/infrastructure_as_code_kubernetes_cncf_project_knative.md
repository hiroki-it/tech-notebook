---
title: 【IT技術の知見】Knative＠CNCF
description: Knative＠CNCFの知見を記録しています。
---

# Knative＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Knativeとは

Knativeを使わない場合、イベント駆動関数の公開に必要なKubernetesリソース (例：Deployment、Service、Pod、など) をユーザーが作成し、関数を公開する。

一方で、Knativeであれば、イベント駆動関数の公開に必要なKubernetesリソースをフレームワークとして作成し、簡単にPodを公開できる。

> - https://logmi.jp/tech/articles/321365
> - https://qiita.com/takanorig/items/3a3a0b43b5be5b4a124f

<br>

## 02. イベント駆動関数テンプレート

### Goの場合

```go
package main

func Handle(ctx context.Context, res http.ResponseWriter, req *http.Request) {

  body, err := ioutil.ReadAll(req.Body)
  defer req.Body.Close()
  if err != nil {
	http.Error(res, err.Error(), 500)
	return
  }
  
  ...
}
```

> - https://github.com/knative/func/blob/main/docs/function-templates/golang.md


<br>

## 03. コマンド

### func

#### ▼ create

イベント駆動関数のテンプレートを作成する。

```bash
$ func create -l <言語> <関数名>
```

> - https://knative.dev/docs/functions/creating-functions/

#### ▼ deploy

イベント駆動関数、関数の公開に必要なKubernetesリソース、をデプロイする。

```bash
$ func deploy --registry <コンテナレジストリ名>

🙌 Function image built: <registry>/hello:latest
✅ Function deployed in namespace "default" and exposed at URL:
http://hello.default.127.0.0.1.sslip.io
```

> - https://knative.dev/docs/functions/deploying-functions/#procedure

<br>
