---
title: 【IT技術の知見】メトリクス
description: メトリクスの知見を記録しています。
tags:
  - "可観測性"
  - "監視ツール"
  - "Prometheus"
  - "メトリクス"
---

# メトリクス

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. クライアントパッケージ

Prometheus がメトリクスの元になるデータポイントを収集できるように、データポイント収集用のエンドポイントを公開する。

```go
package main

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func init() {

	// Goroutineを宣言して並列化
	go func() {
		// 時間のかかる処理

		// Prometheusに公開するパスを設定する
		http.Handle("/metrics", promhttp.Handler())

		// Prometheusに公開するポート番号を設定する
		http.ListenAndServe(":2112", nil)
    }()
}
```

```bash
$ curl http://<アプリケーションのIPアドレス>:2112/metrics

# メトリクスの一覧を取得できる
...
```

> - [Instrumenting a Go application for Prometheus \| Prometheus](https://prometheus.io/docs/guides/go-application/)

<br>
