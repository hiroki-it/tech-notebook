---
title: 【IT技術の知見】DB＠マイクロサービスアーキテクチャ
description: DB＠マイクロサービスアーキテクチャの知見を記録しています。
---

# DB＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. DBのデザインパターン

### 共有DBパターン (Shared database)

#### ▼ 共有DBパターンとは

各マイクロサービスで共有するDBを`1`個だけ用意する。

この場合、単一のDB上で、スキーマやテーブルをマイクロサービスごとに作成する必要がある。

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2
> - https://microservices.io/patterns/data/shared-database.html

#### ▼ マイクロサービス別のスキーマ

共有DBの場合に、マイクロサービス別にスキーマを作成する。

![microservices_share-db_diff-scheme](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_share-db_diff-scheme.png)

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

<br>

#### ▼ マイクロサービス別のテーブル

共有DBの場合に、マイクロサービス別にテーブルを作成する。

![microservices_share-db_diff-table](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_share-db_diff-table.png)

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

<br>

### マイクロサービス別DBパターン (Database per service)

#### ▼ マイクロサービス別DBパターンとは

各マイクロサービスで個別にDBを用意する。

ローカルトランザクションや分散トランザクションを実施する必要がある。

![microservices_diff-db](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_diff-db.png)

> - https://microservices.io/patterns/data/database-per-service.html
> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

#### ▼ 境界付けられたコンテキスト分割とも相性がいい

マイクロサービスを境界付けられたコンテキスト単位で分割した場合に、マイクロサービスごとに異なる集約エンティティを持つため、永続化のデータ単位を分割できる。

これにより、各マイクロサービスが異なるデータベースを持っていても、トランザクションは異なるはずである。

> - https://www.amazon.co.jp/dp/1098100131

<br>

## 02. マイクロサービス別DBパターンの場合

### ローカルトランザクション

#### ▼ ローカルトランザクションとは

`1`個のトランザクション処理によって、`1`個のマイクロサービスのDBやスキーマ (MySQLの文脈ではスキーマがDBに相当) を操作する。

推奨される。

マイクロサービスアーキテクチャでローカルトランザクションを使用する場合、これを連続的に実行する仕組みが必要になる。

また、これらの各DBに対する各トランザクションを紐付けられるように、トランザクションにID (例：UUID) を割り当てる必要がある。

> - https://software.fujitsu.com/jp/manual/manualfiles/M090098/B1WS0321/03Z200/B0321-00-03-12-01.html
> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

#### ▼ ローカルトランザクションの実行方式の種類

ローカルトランザクションベースのトランザクションパターンとして、Sagaパターンがある。

> - https://qiita.com/yasuabe2613/items/b0c92ab8c45d80318420#%E3%83%AD%E3%83%BC%E3%82%AB%E3%83%AB%E3%83%88%E3%83%A9%E3%83%B3%E3%82%B6%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E7%A8%AE%E9%A1%9E

<br>

### グローバルトランザクション (分散トランザクション)

#### ▼ グローバルトランザクションとは

分散トランザクションとも言う。

`1`個のトランザクション処理によって、複数のマイクロサービスのDBを操作する。

非推奨である。

> - https://thinkit.co.jp/article/14639?page=0%2C1

<br>

## 03. トランザクションパターン

### 共有DBパターンの場合

- モジュラーモノリスベースパターン

> - https://developers.redhat.com/articles/2021/09/21/distributed-transaction-patterns-microservices-compared

### マイクロサービス別DBの場合

- 二相コミットパターン
- Sagaパターン (オーケストレーションベース、コレグラフィベース、並列パイプラインベース)

> - https://developers.redhat.com/articles/2021/09/21/distributed-transaction-patterns-microservices-compared

<br>

## 04. 二相コミット

### 実装パターン

#### ▼ OSSを使用する場合

二相コミットのOSSはなさそう。

> - https://developers.redhat.com/articles/2021/09/21/distributed-transaction-patterns-microservices-compared

<br>

## 04. Sagaパターン

### Sagaパターンとは

Sagaオーケストレーターにコールされるマイクロサービスに、永続化とロールバックに関するAPIを実装する。

Sagaオーケストレーターは、これらのマイクロサービスをコールし、ローカルトランザクションを連続的に実行する。

> - https://iorilan.medium.com/i-asked-this-system-design-question-to-3-guys-during-a-developer-interview-and-none-of-them-gave-9c23abe45687
> - https://thinkit.co.jp/article/14639?page=0%2C1
> - https://qiita.com/nk2/items/d9e9a220190549107282
> - https://qiita.com/yasuabe2613/items/b0c92ab8c45d80318420

<br>

### デザインパターン

#### ▼ Stateパターン

Sagaオーケストレーターをステートマシン図やStateパターンでモデリングし、ステートマシンを実装する。

> - https://zenn.dev/twugo/books/21cb3a6515e7b8/viewer/b48713
> - https://qiita.com/AsahinaKei/items/ce8e5d7bc375af23c719
> - https://stackoverflow.com/a/20446959/12771072

<br>

## 04-02. オーケストレーションベースのSagaパターン

### オーケストレーションベースのSagaパターンとは

一連のローカルトランザクションの実行をまとめて制御する責務を持ったSagaオーケストレーター (コーディネーター) と、これをコールする別のマイクロサービスを配置する。

各マイクロサービス間の通信方式は、リクエストリプライ方式またはイベント駆動方式のどちらでもよい。

![orchestration](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/orchestration.png)

> - https://learn.microsoft.com/ja-jp/azure/architecture/reference-architectures/saga/saga
> - https://blogs.itmedia.co.jp/itsolutionjuku/2019/08/post_729.html
> - https://medium.com/google-cloud-jp/gcp-saga-microservice-7c03a16a7f9d
> - https://www.fiorano.com/jp/blog/integration/integration-architecture/%E3%82%B3%E3%83%AC%E3%82%AA%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3-vs-%E3%82%AA%E3%83%BC%E3%82%B1%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3/

<br>

### 実装パターン

#### ▼ 自前で実装する場合

Sagaオーケストレーターは、ローカルトランザクションの進捗度 (いずれのローカルトランザクションを実行し終えたかの成否) をDBに都度記録する。

**＊実装例＊**

Sagaオーケストレーターと、これをコールする別のマイクロサービスを配置する。

Sagaオーケストレーターは、各ローカルトランザクションの成否を表すデータをDBで管理する。

Sagaオーケストレーターは、Orderサービス (`T1`) 、Inventoryサービス (`T2`) 、Paymentサービス (`T3`) 、のローカルトランザクションを連続して実行する。

例えば、Paymentサービスのローカルトランザクション (`T3`) が失敗した場合、OrderサービスとPaymentサービスのローカルトランザクションをロールバックする補償トランザクション (`C1`、`C2`) を実行する。

![saga-pattern_orchestrator](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/saga-pattern_orchestrator.png)

> - https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-orchestration.html#saga-orchestration-implementation
> - https://dzone.com/articles/modelling-saga-as-a-state-machine
> - https://www.baeldung.com/cs/saga-pattern-microservices
> - https://medium.com/@vinciabhinav7/saga-design-pattern-569ec942079
> - https://blog.knoldus.com/distributed-transactions-and-saga-patterns/

#### ▼ OSSを使用する場合

SagaオーケストレーターのOSS (Temporal、Netflix Conductor、Uber Cadence、など) を使用する。

Sagaオーケストレーターのドメインモデリングにステートソーシング方式を採用する必要がある。

> - https://developers.redhat.com/articles/2021/09/21/distributed-transaction-patterns-microservices-compared

#### ▼ クラウドプロバイダーのマネージドサービスを使用する場合

クラウドプロバイダー (例：AWS、Google Cloud) が提供するSagaオーケストレーター (例：AWS Step Functions、Google Workflows、など) を使用する。

各マイクロサービスは、Sagaオーケストレーターをメッセージブローカー (これもクラウドプロバイダーが提供しているものでよい) を介して取得する。

> - https://lab.mo-t.com/blog/stepfunctions-for-eom-admin

<br>

### 先行マイクロサービスとの通信パターン

オーケストレーションベースのSagaパターンにて、Sagaオーケストレーターにリクエストを送信するマイクロサービスは、Sagaオーケストレーターの処理結果を知る必要がある。

Sagaオーケストレーターは、処理の開始時に先行マイクロサービスにひとまずレスポンスを返信し、処理の終了時にこれを先行マイクロサービスにリクエスト (またはWeb Hook) を送信する。

> - https://microservices.io/patterns/data/saga.html#resulting-context

<br>

### 後続マイクロサービスとの通信パターン

#### ▼ ポイントツーポイントの場合

メッセージブローカー (例：Apache Kafka、RabbitMQ、など) を経由しないオーケストレーションベースのSagaパターンを実装する。

メッセージブローカーを経由するよりも、Sagaオーケストレーターと各マイクロサービスの結合度が高まってしまうが、Sagaオーケストレーターの実装が簡単になる。

ローカルトランザクションの進捗度に応じて、次のローカルトラザクションや補償トランザクションを実行する。

> - https://blog.bitsrc.io/how-to-use-saga-pattern-in-microservices-9eaadde79748
> - https://copilot.rocks/implementing-architectural-patterns/20-implementing-saga-pattern/#architecture-diagrams

#### ▼ メッセージキューを経由する場合

メッセージキュー (例：AWS SQS、など) を経由して、マイクロサービス間で通信する。

#### ▼ メッセージブローカーを経由する場合

メッセージブローカー (例：Apache Kafka、RabbitMQ、など) を使い、オーケストレーションベースのSagaパターンを実装する。

Sagaオーケストレーターは、メッセージブローカーに対してパブリッシュとサブスクライブを実行する。

サブスクライブしたメッセージに応じて、次のメッセージをパブリッシュする。

![orchestration_message-queue](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/orchestration_message-queue.png)

> - https://www.12-technology.com/2021/08/dbsaga.html
> - https://qiita.com/somen440/items/a6c323695627235128e9

<br>

### 補償トランザクション

#### ▼ 補償トランザクションとは

ローカルトランザクションを逆順に実行し、Sagaパターンによるトランザクションの結果を元に戻す仕組みのこと。

マイクロサービスアーキテクチャでは、トランザクションの通常のロールバック機能を使用した場合に、処理に失敗したマイクロサービスだけでロールバックし、それ以前のマイクロサービスではロールバックが起こらない問題がある。

いずれかのマイクロサービスのローカルトランザクションが失敗した場合に、まずそのマイクロサービスは自身のトランザクションをロールバックする。

その後、それまでのローカルトランザクションを擬似的にロールバックするトランザクションを逆順で実行する。

#### ▼ 設計例

受注に関するトランザクションが異なるマイクロサービスにまたがる例。

![saga-pattern_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/saga-pattern_example.png)

補償トランザクションによって、各ローカルトランザクションを元に戻す逆順のトランザクションを実行する。

![saga-pattern_compensating_transaction_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/saga-pattern_compensating-transaction_example.png)

> - https://docs.microsoft.com/ja-jp/dotnet/architecture/cloud-native/distributed-data#distributed-transactions

#### ▼ 実装例 (Goの`defer`関数)

この例では、Goの`defer`関数で補償トランザクションの仕組みを実装している。

ローカルトランザクションで失敗した場合は、まずそのマイクロサービスが自身のトランザクションをロールバックする。

その後、それまでにコールされた`defer`関数を実行し補償トランザクションを実行する。

```go
package saga

import (
	"time"

	"go.uber.org/multierr"

	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

func TransferMoney(ctx workflow.Context, transferDetails TransferDetails) (err error) {
	retryPolicy := &temporal.RetryPolicy{
		InitialInterval:    time.Second,
		BackoffCoefficient: 2.0,
		MaximumInterval:    time.Minute,
		MaximumAttempts:    3,
	}

	options := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute,
		RetryPolicy:         retryPolicy,
	}

	ctx = workflow.WithActivityOptions(ctx, options)

	err = workflow.ExecuteActivity(ctx, Withdraw, transferDetails).Get(ctx, nil)
	if err != nil {
		return err
	}

	// 補償トランザクション
	defer func() {
		if err != nil {
			errCompensation := workflow.ExecuteActivity(ctx, WithdrawCompensation, transferDetails).Get(ctx, nil)
			err = multierr.Append(err, errCompensation)
		}
	}()

	// ローカルトランザクション
	// 失敗した場合、まずは自身のトランザクションをロールバックする
	// その後、前のdefer関数を実行し、前のローカルトランザクションを元に戻す補償トランザクションを実行する
	err = workflow.ExecuteActivity(ctx, Deposit, transferDetails).Get(ctx, nil)
	if err != nil {
		return err
	}

	// 補償トランザクション
	defer func() {
		if err != nil {
			errCompensation := workflow.ExecuteActivity(ctx, DepositCompensation, transferDetails).Get(ctx, nil)
			err = multierr.Append(err, errCompensation)
		}

		// uncomment to have time to shut down worker to simulate worker rolling update and ensure that compensation sequence preserves after restart
		// workflow.Sleep(ctx, 10*time.Second)
	}()

	// ローカルトランザクション
	// 失敗した場合、まずは自身のトランザクションをロールバックする
	// その後、前のdefer関数を実行し、前のローカルトランザクションを元に戻す補償トランザクションを実行する
	err = workflow.ExecuteActivity(ctx, StepWithError, transferDetails).Get(ctx, nil)
	if err != nil {
		return err
	}

	return nil
}
```

> - https://github.com/temporalio/samples-go/blob/main/saga/workflow.go

#### ▼ 実装例 (Goのslice)

この例では、Goのsliceで補償トランザクションの仕組みを実装している。

スライス内のローカルトランザクションを順番に実行し、どこかで失敗した場合は逆順に補償トランザクションを実行する。

```go
package main

import (
	"fmt"
	"errors"
)

// ローカルトランザクションを表す関数型
type LocalTransaction func() error

// 補償トランザクションを表す関数型
type CompensatingAction func() error

// Sagaオーケストレーターの各ステップを表す構造体
type SagaStep struct {
	Transaction LocalTransaction // ローカルトランザクション
	Compensate  CompensatingAction // 補償トランザクション
}

// Sagaを表す構造体
type Saga struct {
	Steps []SagaStep // 複数のSagaStepから成る
}

// ローカルトランザクションと補償トランザクションを実行する関数
func (s *Saga) Execute() error {

	for _, step := range s.Steps {
		// ローカルトランザクションを順番に実行する
		if err := step.Transaction(); err != nil {
			// 失敗した場合は、補償トランザクションを逆順で実行する
			for i := len(s.Steps) - 1; i >= 0; i-- {
				if err := s.Steps[i].Compensate(); err != nil {
					// 補償トランザクションが失敗した場合はエラーメッセージを返す
					return errors.New(fmt.Sprintf("failed to compensate for step %d: %v", i, err))
				}
			}
			// 最初のエラーを返す
			return err
		}
	}
	// 全てのトランザクションが成功した場合、nilを返す
	return nil
}

// ローカルトランザクション
// 資金移動
func transferFunds() error {
	return nil
}

// 補償トランザクション
// 資金移動の取り消し
func reverseTransfer() error {
	return nil
}

func main() {
	// Sagaオーケストレーター
	saga := Saga{
		Steps: []SagaStep{
			SagaStep{
				Transaction: transferFunds, // 1つ目のローカルトランザクション
				Compensate:  reverseTransfer, // 1つ目の補償トランザクション
			},
			SagaStep{
				Transaction: transferFunds, // 2つ目のローカルトランザクション
				Compensate:  reverseTransfer, // 2つ目の補償トランザクション
			},
		},
	}

	// Sagaの実行
	if err := saga.Execute(); err != nil {
		fmt.Println("saga failed:", err) // エラーが発生した場合
	} else {
		fmt.Println("saga succeeded") // 正常に完了した場合
	}
}

```

> - https://dsysd-dev.medium.com/writing-temporal-workflows-in-golang-part-1-9f50f6ef23d5
> - https://qiita.com/somen440/items/a6c323695627235128e9#%E3%82%AA%E3%83%BC%E3%82%B1%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%99%E3%83%BC%E3%82%B9%E3%81%AE%E3%82%B5%E3%83%BC%E3%82%AC%E5%AE%9F%E8%A3%85

#### ▼ 実装例 (Typescriptの配列)

この例では、AzureのDurable Functionにて、Typescriptの配列で補償トランザクションの仕組みを実装している。

スライス内のローカルトランザクションを順番に実行し、どこかで失敗した場合は逆順に補償トランザクションを実行する。

```typescript
import df from "durable-functions";
import {Task} from "durable-functions/lib/src/classes";

// APIError型の定義。ステータスコードとボディを持つ
type APIError = {
  status: 200 | 400 | 500;
  body: object | string;
};

// APIErrorかどうかをチェックする関数
const isAPIError = (arg: any): arg is APIError => {
  // 引数がオブジェクトでない場合は、トランザクション不可とする
  if (typeof arg !== "object") return false;

  // ステータスコードが200, 400, 500のいずれかでない場合は、トランザクション不可とする
  if (!(arg.status && [200, 400, 500].includes(arg.status))) return false;

  // メッセージが文字列でない場合は、トランザクション不可とする
  if (typeof arg.message !== "string") return false;

  // 全ての条件を満たす場合はトランザクション可とする
  return true;
};

// Sagaオーケストレーター
export const saga = df.orchestrator(function* (context) {
  // 補償トランザクションを格納する配列
  const compensatingTransactions: Task[] = [];

  try {
    // Sagaオーケストレーターの入力を取得
    const {input} = context.df.getInput();

    // ローカルトランザクションとして、doActivityAを実行する
    const a = yield context.df.callActivity("doActivityA", input.body);

    // 補償トランザクションとして、rejectActivityAを追加する
    compensatingTransactions.push(
      context.df.callActivity("rejectActivityA", input.body),
    );

    // ローカルトランザクションとして、doActivityBを実行する
    const b = yield context.df.callActivity("doActivityB", a);

    // 補償トランザクションとして、rejectActivityBを追加する
    compensatingTransactions.push(
      context.df.callActivity("rejectActivityB", b),
    );

    // ローカルトランザクションとして、doActivityCを実行する
    const c = yield context.df.callActivity("doActivityC", b);

    // 補償トランザクションとして、rejectActivityCを追加する
    compensatingTransactions.push(
      context.df.callActivity("rejectActivityC", c),
    );

    // Sagaオーケストレーターのクライアントに正常終了のレスポンスを返す
    return {
      status: 200,
      body: "The process has succeeded.",
    };
  } catch (e) {
    // 例外発生時に補償トランザクションをまとめて実行する
    yield context.df.Task.all(compensatingTransactions);

    // 例外がAPIError型の場合、そのまま返す
    if (isAPIError(e)) return e;

    // その他の例外は500エラーとして、返す
    return {
      status: 500,
      body: (e as Error).message,
    };
  }
});
```

> - https://zenn.dev/tatta/books/4e993c596e7dc9/viewer/83e94d#%E8%A3%9C%E5%84%9F%E3%83%88%E3%83%A9%E3%83%B3%E3%82%B6%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%A8%E3%81%AF

#### ▼ 実装例 (Goのslice)

この例では、アウトボックスパターンでSagaオーケストレーションを実装している。

ちょっと難しいかな...

```go
package saga

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/google/uuid"
	"go.example/saga/pkg/jsonmap"
)

type SagaState struct {
	ID          uuid.UUID
	Version     int8
	Type        string
	Payload     jsonmap.JSONMap
	CurrentStep SagaStep
	StepStatus  jsonmap.JSONMap
	SagaStatus  SagaStatus
}

// Repository
type Repository interface {
	Persist(ctx context.Context, tx *sql.Tx, ss SagaState) error
	Update(ctx context.Context, tx *sql.Tx, ss SagaState) error
	QueryByID(ctx context.Context, tx *sql.Tx, ID string) (*SagaState, error)
}

func NewSaga(sagaType string, payload jsonmap.JSONMap, currentStep SagaStep) SagaState {
	// ステートマシン
	return SagaState{
		ID:          uuid.New(),
		Version:     1,
		Type:        sagaType,
		Payload:     payload,
		CurrentStep: currentStep,
		StepStatus:  jsonmap.JSONMap{string(currentStep): SagaStepStatusStarted},
		SagaStatus:  SagaStatusStarted,
	}
}

// NextSagaStatus evaluate current SagaStepStatuses and set SagaStatus
func (s *SagaState) NextSagaStatus() {
	ss := map[string]bool{}
	for _, v := range s.StepStatus {
		ss[fmt.Sprintf("%v", v)] = true
	}

	if ss[SagaStepStatusSucceeded] && len(ss) == 1 {
		s.SagaStatus = SagaStatusCompleted
	} else if (ss[SagaStepStatusStarted] && len(ss) == 1) || (ss[SagaStepStatusSucceeded] && ss[SagaStepStatusStarted] && len(ss) == 2) {
		s.SagaStatus = SagaStatusStarted
	} else if !ss[SagaStepStatusCompensating] {
		s.SagaStatus = SagaStatusAborted
	} else {
		s.SagaStatus = SagaStatusAborting
	}
}

// IncrementVersion
func (s *SagaState) IncrementVersion() {
	s.Version++
}

// SagaStatus represents the saga status based on steps status
type SagaStatus string

// SagaStatus type
const (
	SagaStatusStarted   = "STARTED"
	SagaStatusAborting  = "ABORTING"
	SagaStatusAborted   = "ABORTED"
	SagaStatusCompleted = "COMPLETED"
)

// SagaStepStatus represent current saga step status
type SagaStepStatus string

// SagaStepStatus type
const (
	SagaStepStatusStarted      = "STARTED"
	SagaStepStatusFailed       = "FAILED"
	SagaStepStatusSucceeded    = "SUCCEEDED"
	SagaStepStatusCompensating = "COMPENSATING"
	SagaStepStatusCompensated  = "COMPENSATED"
)

// SagaStep define saga service step in order to follow
type SagaStep string

// NextSagaStep find saga next step from provided steps and current saga step
func NextSagaStep(steps []SagaStep, currentStep SagaStep) SagaStep {
	if currentStep == "" {
		return steps[0]
	}

	curr := -1
	for i := 0; i < len(steps); i++ {
		if steps[i] == currentStep {
			curr = i
			break
		}
	}

	if curr == -1 || curr+1 == len(steps) {
		return ""
	}

	return steps[curr+1]
}

// PrevSagaStep find saga previous step from provided steps and current saga step
func PrevSagaStep(steps []SagaStep, currentStep SagaStep) SagaStep {
	curr := -1
	for i := 0; i < len(steps); i++ {
		if steps[i] == currentStep {
			curr = i
			break
		}
	}

	if curr == -1 || curr-1 == -1 {
		return ""
	}

	return steps[curr-1]
}
```

```go
package reservation

import (
	"context"
	"database/sql"
	"fmt"
	"go.example/saga/pkg/saga"
	"go.example/saga/pkg/store/postgres"
	"go.example/saga/reservation/pkg/model"
	"log"
)

...

func (c *Controller) PostReservation(ctx context.Context, cmd model.ReservationCmd) (*model.Reservation, error) {
	r := model.NewReservation(cmd.HotelID, cmd.RoomID, cmd.GuestID, cmd.PaymentDue, cmd.StartDate, cmd.EndDate, cmd.CreditCardNO)

	if _, err := c.store.Transact(ctx, func(tx *sql.Tx) (interface{}, error) {

		// persist reservation
		if err := c.repository.Add(ctx, tx, r); err != nil {
			return nil, err
		}

		payload := r.ToJSONMap()
		currStep := saga.NextSagaStep(sagaSteps, "")
		sagaState := saga.NewSaga(roomReservationSaga, payload, currStep)

		if err := c.sagaRepository.Persist(ctx, tx, sagaState); err != nil {
			return nil, err
		}

		outboxEvent := postgres.NewEvent(sagaState.ID.String(), string(currStep), postgres.RequestEventType, payload)
		if err := outboxEvent.Persist(ctx, tx); err != nil {
			return nil, err
		}

		log.Printf("Started Saga for reservationID %s sagaID %s", r.ID, sagaState.ID)

		return r, nil
	}); err != nil {
		return nil, err
	}

	return r, nil
}

...
```

> - https://github.com/semotpan/saga-orchestration-go/blob/main/src/pkg/saga/saga.go
> - https://github.com/semotpan/saga-orchestration-go/blob/main/src/reservation/internal/controller/reservation/controller.go

<br>

<br>

### DB

Sagaオーケストレーターは、ローカルトランザクションの進捗度をDBに永続化する。

SagaオーケストレーターごとにDBを分割すると良い。

AWS StepFunctionsのステートも設計例として、参考になる。

| `id` | `order_saga_execution_id`              | `order_saga_current_step` | `order_id` | `order_saga_payload`                                                                                           | `order_saga_status` | `order_saga_state`                                             | `order_saga_version`                                    | `start_data` | `end_data` |
| ---- | -------------------------------------- | ------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------- | ------------------------------------------------------- | ------------ | ---------- |
| 1    | `9db5b6da-daba-4633-b3cf-9c79f2bcf6f5` | CreditApproval            | 1          | `"\"order-id\": 1, \"customer-id\": 456, \"payment-due\": 4999, \"credit-card-no\": \"xxxx-yyyy-dddd-9999\"}"` | SUCCEEDED           | `"{\"creditApproval\":\"SUCCEEDED\"}"`                         | 楽観的ロックに使用するバージョン値 (例：最終更新日など) | 開始時刻     | 終了時刻   |
| 2    | `b1f14b72-393d-432b-8ec2-782974a6ed60` | Payment                   | 1          | `"{ \"order-id\": 1, \"customer-id\": 456, ... }"`                                                             | STARTED             | `"{\"creditApproval\":\"SUCCEEDED\",\"payment\":\"STARTED\"}"` | 〃                                                      | 〃           | 〃         |
| 3    | `b38229c6-30df-4166-a725-8b2c578e5ed5` | CreditApproval            | 2          | `"{ \"order-id\": 2, \"customer-id\": 456, ... }"`                                                             | STARTED             | `"{\"creditApproval\":\"STARTED\"}"`                           | 〃                                                      | 〃           | 〃         |
| ...  | ...                                    | ...                       | ...        | ...                                                                                                            | ...                 | ...                                                            | ...                                                     | ...          | ...        |

> - https://www.infoq.com/articles/saga-orchestration-outbox/
> - https://docs.aws.amazon.com/step-functions/latest/dg/concepts-states.html

<br>

## 04-03. Choreography (コレオグラフィ) ベースのSagaパターン

### コレオグラフィベースのSagaパターンとは

マイクロサービスは、自身のローカルトランザクションを完了させた後に、次のマイクロサービスをコールする。

各マイクロサービス間の通信方式は、イベント駆動方式にする必要がある。

![choreography](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/choreography.png)

> - https://learn.microsoft.com/ja-jp/azure/architecture/reference-architectures/saga/saga
> - https://blogs.itmedia.co.jp/itsolutionjuku/2019/08/post_729.html
> - https://zenn.dev/yoshii0110/articles/74dfcf4132a805
> - https://www.fiorano.com/jp/blog/integration/integration-architecture/%E3%82%B3%E3%83%AC%E3%82%AA%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3-vs-%E3%82%AA%E3%83%BC%E3%82%B1%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3/

<br>

### 実装パターン

#### ▼ 自前で実装する場合

**＊実装例＊**

以下のリポジトリを参考にせよ。

![choreography_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/choreography_example.png)

> - https://github.com/fedeoliv/microservices-transactions

#### ▼ OSSを使用する場合

コレオグラフィのOSS (例：Debezium、Maxwell、など) を使用する。

Sagaオーケストレーターのドメインモデリングにイベントソーシング方式を採用する必要がある。

> - https://developers.redhat.com/articles/2021/09/21/distributed-transaction-patterns-microservices-compared

<br>

### 後続マイクロサービスとの通信パターン

各マイクロサービスにパブリッシュとサブスクライブを処理する責務を持たせる。

![choreography_message-queue](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/choreography_message-queue.png)

> - https://www.12-technology.com/2021/08/dbsaga.html

![saga-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/saga-pattern.png)

<br>

## 04-04. 並列パイプラインベースのSagaパターン

### 並列パイプラインベースのSagaパターンとは

オーケストレーションベースとコレオグラフィベースのパターンを組み合わせる。

イベント駆動のマイクロサービスを連続的にコールするルーターサービスを配置する。

> - https://developers.redhat.com/articles/2021/09/21/distributed-transaction-patterns-microservices-compared#

<br>

### 実装パターン

#### ▼ OSSを使用する場合

並列パイプラインのOSS (例：Apache Camel、など) を使用する。

> - https://developers.redhat.com/articles/2021/09/21/distributed-transaction-patterns-microservices-compared

<br>

## 05. TCCパターン

### TCCパターンとは

各マイクロサービスに各処理フェーズ (Try、Confirm、Cancel) を実行するAPIを実装し、APIを順に実行する。

Tryフェーズでは、ローカルトランザクションを開始する。

Confirmフェーズでは、ローカルトランザクションをコミットする。

Cancelフェーズでは、以前のフェーズで問題が合った場合に、ロールバックを実施する。

> - https://www.ibm.com/blogs/think/jp-ja/microservices-applications-enabled-by-ibmcloud-managed-services/
> - https://dev.to/yedf2/best-practice-for-tcc-distributed-transaction-in-go-402m
> - https://www.oracle.com/a/otn/docs/jp-dev-days-microservices.pdf#page=9

<br>

## 06. クエリパターン

### API Composition

複数のマイクロサービスにまたがるread処理がある場合に、結果を結合してレスポンスする。

> - https://crishantha.medium.com/microservices-patterns-api-composition-pattern-27040cae5bd3

<br>
