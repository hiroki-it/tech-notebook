---
title: 【IT技術の知見】メトリクス＠クライアントパッケージ
description: メトリクス＠クライアントパッケージの知見を記録しています。
---

# メトリクス＠クライアントパッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. クライアントパッケージ

Prometheusからリクエストを受信できるように、メトリクス収集用のエンドポイントを公開する。

```go
package main

import (
	"context"
	"errors"
	"net/http"
	"time"

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
$ curl http://<アプリのIPアドレス>:2112/metrics

# メトリクスの一覧を取得できる
...
```

> - https://prometheus.io/docs/guides/go-application/

<br>
