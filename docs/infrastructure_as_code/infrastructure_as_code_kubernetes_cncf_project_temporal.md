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

Temporalは、Temporalクライアント、Temporalサーバー、ステート用データベース、Temporalワーカー、からなる。

![temporal_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/temporal_architecture.png)

> - https://medium.com/safetycultureengineering/building-resilient-microservice-workflows-with-temporal-a-next-gen-workflow-engine-a9637a73572d
> - https://michaelangelo.io/blog/temporal-sqs#temporal-components
> - https://blog.lorensr.me/how-durable-execution-works-462c060f7cb7
> - https://temporal.io/blog/sergey-inversion-of-execution

<br>

### Temporalクライアント

Temporalクライアントは、Temporalサーバーをコールし、ワークフローを実行させる。

> - https://medium.com/safetycultureengineering/building-resilient-microservice-workflows-with-temporal-a-next-gen-workflow-engine-a9637a73572d
> - https://temporal.io/blog/sergey-inversion-of-execution

<br>

### Temporalサーバー

Temporalサーバーは、タスクキューを操作してワークフローのステートを管理し、またステートをデータベースに永続化する。

> - https://medium.com/safetycultureengineering/building-resilient-microservice-workflows-with-temporal-a-next-gen-workflow-engine-a9637a73572d
> - https://temporal.io/blog/sergey-inversion-of-execution

<br>

### ステート用データベース

#### ▼ ステート用データベース

ステート用データベースは、Sagaのステートを保管する。

Sagaステートで障害が起こった場合でも、ワークフローの途中から処理を実行できるようにする。

#### ▼ PostgreSQLの場合

```bash
$ psql -U temporal -h temporal-postgresql -p 5432 -d temporal

# 現在はtemporalデータベース
# データベースの一覧
temporal=# \l

                                      List of databases
        Name         |  Owner   | Encoding |  Collate   |   Ctype    |   Access privileges
---------------------+----------+----------+------------+------------+-----------------------
 postgres            | temporal | UTF8     | en_US.utf8 | en_US.utf8 |
 template0           | temporal | UTF8     | en_US.utf8 | en_US.utf8 | =c/temporal          +
                     |          |          |            |            | temporal=CTc/temporal
 template1           | temporal | UTF8     | en_US.utf8 | en_US.utf8 | =c/temporal          +
                     |          |          |            |            | temporal=CTc/temporal
 temporal            | temporal | UTF8     | en_US.utf8 | en_US.utf8 |
 temporal_visibility | temporal | UTF8     | en_US.utf8 | en_US.utf8 |


# 現在のデータベースのテーブル一覧
temporal=# \dt
                   List of relations
 Schema |           Name            | Type  |  Owner
--------+---------------------------+-------+----------
 public | activity_info_maps        | table | temporal
 public | buffered_events           | table | temporal
 ...
```

<br>

### Temporalワーカー

Temporalワーカーは、Temporalサーバーにワークフローやアクティビティを登録する。

また、Temporalサーバーでのワークフローのステートに応じて、アクティビティを実行する。

> - https://learn.temporal.io/examples/go/background-checks/application-design/#what-does-the-component-topology-look-like
> - https://temporal.io/blog/sergey-inversion-of-execution

<br>

## 02. ユースケース

### Sagaオーケストレーターとして

#### ▼ Sagaオーケストレーターとして

TemporalをSagaパターンのオーケストレーターとして使用する。

なお、Temporalサーバー内にメッセージキューが内臓されている。

そのため、タイムアウト処理、リトライ処理、キャンセル処理、などの点でTemporalの外部にメッセージキュー (例：AWS SQS) やメッセージブローカー (例：RebbitMQ) は不要である。

![temporal_saga-pattern.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/temporal_saga-pattern.png)

> - https://learn.temporal.io/tutorials/php/booking_saga/#review-the-saga-architecture-pattern
> - https://temporal.io/blog/saga-pattern-made-easy
> - https://github.com/efortuna/sagas-temporal-trip-booking/tree/main
> - https://community.temporal.io/t/springboot-microservices-managed-by-temporal-io-rabbitmq/1489/4

#### ▼ Temporalクライアント

Temporalクライアントは、Temporalサーバーのエンドポイントをコールするサーバーとして実装する。

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

	// Temporalクライアントがワークフローを実行するエンドポイント
	http.HandleFunc("/start", func(w http.ResponseWriter, r *http.Request) {
		// ワークフローを実行するラッパー関数
		startWorkflowHandler(w, r, temporalClient)
	})

	// サーバーを起動する
	err = http.ListenAndServe(":8091", nil)

	if err != nil {
		log.Fatalln("Unable to run http server", err)
	}
}

func startWorkflowHandler(w http.ResponseWriter, r *http.Request, temporalClient client.Client) {

	workflowOptions := client.StartWorkflowOptions{
		ID:        "your-workflow-id",
		TaskQueue: "your-custom-task-queue-name",
	}

	workflowParams := yourapp.YourWorkflowParam{
		WorkflowParamX: "Hello World!",
		WorkflowParamY: 999,
	}

	// Temporalサーバーのワークフローを実行する
	workflowExecution, err := temporalClient.ExecuteWorkflow(
		context.Background(),
		workflowOptions,
		yourapp.YourWorkflowDefinition,
		workflowParams,
	)

	if err != nil {
		log.Fatalln("Unable to execute the Workflow", err)
	}

	log.Println("Started Workflow!")

	log.Println("WorkflowID:", workflowExecution.GetID())

	log.Println("RunID:", workflowExecution.GetRunID())

	var result yourapp.YourWorkflowResultObject

	workflowExecution.Get(context.Background(), &result)

	if err != nil {
		log.Fatalln("Unable to get Workflow result:", err)
	}

	b, err := json.Marshal(result)

	if err != nil {
		log.Fatalln(err)
		return
	}

	log.Println(string(b))
}
```

> - https://github.com/temporalio/documentation/blob/main/sample-apps/go/yourapp/gateway/main.go
> - https://docs.temporal.io/develop/go/temporal-clients

#### ▼ Temporalサーバーとステート用データベース

Temporalサーバーは、ワークフローを実行するエンドポイントを持つサーバーとして実装する。

各ステップの都度、メッセージキュー (例：AWS SQSなど) やメッセージブローカー (例：RabbitMQ) にステップの処理結果を送信することもできる。

Temporalクライアントと別のアプリとして実行することもできる。

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

#### ▼ Temporalワーカー (マイクロサービス)

Temporalワーカーは、実際にローカルトランザクションを実行するマイクロサービスに相当する。

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

> - https://github.com/temporalio/documentation/blob/main/sample-apps/go/yourapp/worker/main_dacx.go
> - https://docs.temporal.io/develop/go/temporal-clients#get-workflow-results

<br>
