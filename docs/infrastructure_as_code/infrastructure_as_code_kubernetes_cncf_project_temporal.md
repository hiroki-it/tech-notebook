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

Temporalサーバーは、ワークフローを実行し、またステートをデータベースに永続化する。

<br>

### Temporalワーカー

Temporalワーカーは、Temporalサーバーをコールし、ワークフローの処理結果を取得する。

Temporalワーカーが実行するべき処理タスクを取得する場合もある。

<br>

## 02. ユースケース

### Sagaオーケストレーターとして

#### ▼ Sagaオーケストレーターとして

TemporalをSagaパターンのオーケストレーターとして使用する。

> - https://learn.temporal.io/tutorials/php/booking_saga/#review-the-saga-architecture-pattern
> - https://temporal.io/blog/saga-pattern-made-easy
> - https://github.com/efortuna/sagas-temporal-trip-booking/tree/main

#### ▼ Temporalクライアント

クライアントは、Temporalサーバーをコールする必要である。

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

#### ▼ Temporalサーバー

Temporalサーバーは、ワークフローを実行し、またステートをデータベースに永続化する。

各ステップの都度、メッセージキュー (例：AWS SQSなど) やメッセージブローカー (例：RabbitMQ) にステップの処理結果を送信することもできる。

```go
package yourapp

import (
	"context"

	"go.temporal.io/sdk/activity"
)

// パラメーター
type YourActivityParam struct {
	ActivityParamX string
	ActivityParamY int
}


type YourActivityObject struct {
	Message *string
	Number  *int
}

// アクション
func (a *YourActivityObject) PrintInfo(ctx context.Context, param YourActivityParam) error {
	logger := activity.GetLogger(ctx)

	logger.Info("The message is:", param.ActivityParamX)

	logger.Info("The number is:", param.ActivityParamY)

	return nil
}

// アクション
func (a *YourActivityObject) GetInfo(ctx context.Context) (*YourActivityResultObject, error) {

	return &YourActivityResultObject{
		ResultFieldX: *a.Message,
		ResultFieldY: *a.Number,
	}, nil
}
```

> - https://github.com/temporalio/documentation/blob/main/sample-apps/go/yourapp/your_activity_definition_dacx.go

```go
package yourapp

import (
	"time"

	"go.temporal.io/sdk/workflow"
)

func YourWorkflowDefinition(ctx workflow.Context, param YourWorkflowParam) (*YourWorkflowResultObject, error) {

	activityOptions := workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Second,
	}

	ctx = workflow.WithActivityOptions(ctx, activityOptions)

	// ワークフローのパラメーターを定義する
	activityParam := YourActivityParam{
		ActivityParamX: param.WorkflowParamX,
		ActivityParamY: param.WorkflowParamY,
	}

	var a *YourActivityObject

	var activityResult YourActivityResultObject

	// (1)
	// ワークフローのステップを実行する
	// パラメーターの入力
	err := workflow.ExecuteActivity(ctx, a.YourActivityDefinition, activityParam).Get(ctx, &activityResult)

	if err != nil {
		return nil, err
	}

	var infoResult *YourActivityResultObject

	// (2)
	// ワークフローのステップを実行する
	// GetInfoアクション
	err = workflow.ExecuteActivity(ctx, a.GetInfo).Get(ctx, &infoResult)

	if err != nil {
		return nil, err
	}

	infoParam := YourActivityParam{
		ActivityParamX: infoResult.ResultFieldX,
		ActivityParamY: infoResult.ResultFieldY,
	}

	// (3)
	// ワークフローのステップを実行する
	// PrintInfoアクション
	err = workflow.ExecuteActivity(ctx, a.PrintInfo, infoParam).Get(ctx, nil)

	if err != nil {
		return nil, err
	}

	workflowResult := &YourWorkflowResultObject{
		WFResultFieldX: activityResult.ResultFieldX,
		WFResultFieldY: activityResult.ResultFieldY,
	}

	// ワークフロー全体の処理結果を返却する
	return workflowResult, nil
}
```

> - https://github.com/temporalio/documentation/blob/main/sample-apps/go/yourapp/your_workflow_definition_dacx.go
> - https://docs.temporal.io/develop/go/core-application#develop-workflows

#### ▼ Temporalワーカー\_

Temporalワーカーは、Temporalサーバーからワークフロー全体の処理結果を取得する必要がある。

TemporalサーバーとTemporalワーカーの間にメッセージキュー (例：AWS SQSなど) やメッセージブローカー (例：RabbitMQ) を置くこともできる。

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

	workflowRun := temporalClient.GetWorkflow(context.Background, "<ワークフローのID>")

	var result workflowResponse

	// ワークフローの結果を取得する
	err = workflowRun.Get(context.Background(), &result)

	if err != nil {
		...
	}
}
```

> - https://docs.temporal.io/develop/go/temporal-clients#get-workflow-results

<br>
