---
title: 【IT技術の知見】Temporal＠CNCF
description: Temporal＠CNCFの知見を記録しています。
---

# Temporal＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Temporalの仕組み

### アーキテクチャ

Temporalは、Temporalクライアント、Temporalサーバー、ステート用データベース、Temporalワーカー (ユーザーのアプリ) 、からなる。

> - https://michaelangelo.io/blog/temporal-sqs#temporal-components
> - https://blog.lorensr.me/how-durable-execution-works-462c060f7cb7

<br>

### Temporalクライアント

Temporalクライアントは、Temporalサーバーをコールし、ワークフローを実行させる。

<br>

### Temporalサーバー

ワークフローを実行し、またステートをデータベースに永続化する。

<br>

### Temporalワーカー

Temporalサーバーをコールし、ワークフローの処理結果を取得する。

Temporalワーカーが実行するべき処理タスクを取得する場合もある。

<br>

## 02. ユースケース

### Sagaオーケストレーターとして

#### ▼ Sagaオーケストレーターとして

TemporalをSagaパターンのオーケストレーターとして使用する。

> - https://learn.temporal.io/tutorials/php/booking_saga/#review-the-saga-architecture-pattern
> - https://temporal.io/blog/saga-pattern-made-easy
> - https://github.com/efortuna/sagas-temporal-trip-booking/tree/main

#### ▼ クライアント

Temporalサーバーをコールするクライアントが必要である。

```go
package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"documentation-samples-go/yourapp"

	"go.temporal.io/sdk/client"
)

func main() {

	// Temporalサーバーに接続する
	temporalClient, err := client.Dial(client.Options{
		HostPort: client.DefaultHostPort,
	})

	if err != nil {
		log.Fatalln("Unable to create Temporal Client", err)
	}

	defer temporalClient.Close()

	...

	workflowOptions := client.StartWorkflowOptions{
		...
	}

	// Temporalサーバーのワークフローを実行する
	workflowRun, err := temporalClient.ExecuteWorkflow(context.Background(), workflowOptions, YourWorkflowDefinition, param)

	if err != nil {
		...
	}
}
```

> - https://docs.temporal.io/develop/go/temporal-clients

<br>
