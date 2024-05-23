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

各マイクロサービスに永続化とロールバックに関するAPIを実装し、ローカルトランザクションを連続的に実行する。

> - https://iorilan.medium.com/i-asked-this-system-design-question-to-3-guys-during-a-developer-interview-and-none-of-them-gave-9c23abe45687
> - https://thinkit.co.jp/article/14639?page=0%2C1
> - https://qiita.com/nk2/items/d9e9a220190549107282
> - https://qiita.com/yasuabe2613/items/b0c92ab8c45d80318420

<br>

## 04-02. オーケストレーションベースのSagaパターン

### オーケストレーションベースのSagaパターンとは

一連のローカルトランザクションの実行をまとめて制御する責務を持ったオーケストレーターサービス (コーディネーター) と、これをコールする別のマイクロサービスを配置する。

各マイクロサービス間の通信方式をリクエストリプライ方式にする必要がある。

![orchestration](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/orchestration.png)

> - https://learn.microsoft.com/ja-jp/azure/architecture/reference-architectures/saga/saga
> - https://blogs.itmedia.co.jp/itsolutionjuku/2019/08/post_729.html
> - https://news.mynavi.jp/itsearch/article/devsoft/1598
> - https://medium.com/google-cloud-jp/gcp-saga-microservice-7c03a16a7f9d
> - https://www.fiorano.com/jp/blog/integration/integration-architecture/%E3%82%B3%E3%83%AC%E3%82%AA%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3-vs-%E3%82%AA%E3%83%BC%E3%82%B1%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3/

<br>

### 実装パターン

#### ▼ 自前で実装する場合

ステートマシンとしてモデリングすることになる。

オーケストレーターは、現在の進捗度 (いずれのローカルトランザクションを実行し終えたかの成否) をDBや実行ログに都度記録する。

**＊実装例＊**

オーケストレーターサービスと、これをコールする別のマイクロサービスを配置する。

オーケストレーターサービスは、各ローカルトランザクションの成否を表すデータをDBで管理する。

オーケストレーターサービスは、Orderサービス (`T1`) 、Inventoryサービス (`T2`) 、Paymentサービス (`T3`) 、のローカルトランザクションを連続して実行する。

例えば、Paymentサービスのローカルトランザクション (`T3`) が失敗した場合、OrderサービスとPaymentサービスのローカルトランザクションをロールバックする補償トランザクション (`C1`、`C2`) を実行する。

![saga-pattern_orchestrator](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/saga-pattern_orchestrator.png)

> - https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-orchestration.html#saga-orchestration-implementation
> - https://dzone.com/articles/modelling-saga-as-a-state-machine
> - https://www.baeldung.com/cs/saga-pattern-microservices
> - https://medium.com/@vinciabhinav7/saga-design-pattern-569ec942079
> - https://blog.knoldus.com/distributed-transactions-and-saga-patterns/

#### ▼ OSSを使用する場合

オーケストレーターのOSS (Argo Workflow、Netflix Conductor、Uber Cadence、Apache Airflow、など) を使用する。

ステートマシンとしてモデリングすることになる。

> - https://developers.redhat.com/articles/2021/09/21/distributed-transaction-patterns-microservices-compared

#### ▼ クラウドプロバイダーのマネージドサービスを使用する場合

クラウドプロバイダー (例：AWS、Google Cloud) が提供するオーケストレーター (例：AWS Step Functions、Google Workflows、など) を使用する。

ステートマシンとしてモデリングすることになる。

<br>

### イベントのパブリッシュとサブスクライブの方式

#### ▼ ポイントツーポイントの場合

メッセージブローカー (例：Apache Kafka、RabbitMQ、など) を経由しないオーケストレーションベースのSagaパターンを実装する。

メッセージブローカーを経由するよりも、オーケストレーターと各マイクロサービスの結合度が高まってしまうが、オーケストレーターの実装が簡単になる。

現在の進捗度に応じて、次のローカルトラザクションや補償トランザクションを実行する。

> - https://blog.bitsrc.io/how-to-use-saga-pattern-in-microservices-9eaadde79748
> - https://copilot.rocks/implementing-architectural-patterns/20-implementing-saga-pattern/#architecture-diagrams

#### ▼ メッセージキューを経由する場合

メッセージキュー (例：AWS SQS、など) を経由して、マイクロサービス間で通信する。

#### ▼ メッセージブローカーを経由する場合

メッセージブローカー (例：Apache Kafka、RabbitMQ、など) を使い、オーケストレーションベースのSagaパターンを実装する。

オーケストレーターは、メッセージブローカーに対してパブリッシュとサブスクライブを実行する。

サブスクライブしたメッセージに応じて、次のメッセージをパブリッシュする。

![orchestration_message-queue](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/orchestration_message-queue.png)

> - https://www.12-technology.com/2021/08/dbsaga.html
> - https://qiita.com/somen440/items/a6c323695627235128e9

<br>

### 補償トランザクション

#### ▼ 補償トランザクションとは

ローカルトランザクションを逆順に実行し、Sagaパターンによるトランザクションの結果を元に戻す仕組みのこと。

マイクロサービスアーキテクチャでは、トランザクションの通常のロールバック機能を使用した場合に、処理に失敗したマイクロサービスだけでロールバックし、それ以前のマイクロサービスではロールバックが起こらない問題がある。

各マイクロサービスで実装したロールバック処理のAPIを逆順でコールする。

#### ▼ 例

受注に関するトランザクションが異なるマイクロサービスにまたがる例。

![saga-pattern_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/saga-pattern_example.png)

補償トランザクションによって、各ローカルトランザクションを元に戻す逆順のクエリ処理が実行される。

![saga-pattern_compensating_transaction_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/saga-pattern_compensating-transaction_example.png)

> - https://docs.microsoft.com/ja-jp/dotnet/architecture/cloud-native/distributed-data#distributed-transactions

#### ▼ 例

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
		// Timeout options specify when to automatically timeout Activity functions.
		StartToCloseTimeout: time.Minute,
		// Optionally provide a customized RetryPolicy.
		// Temporal retries failures by default, this is just an example.
		RetryPolicy: retryPolicy,
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

	// このローカルトランザクションで失敗した場合は、前のdefer関数を実行し、前のローカルトランザクションを元に戻す補償トランザクションを実行する
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

	// このローカルトランザクションで失敗した場合は、前のdefer関数を実行し、前のローカルトランザクションを元に戻す補償トランザクションを実行する
	err = workflow.ExecuteActivity(ctx, StepWithError, transferDetails).Get(ctx, nil)
	if err != nil {
		return err
	}

	return nil
}
```

> - https://github.com/temporalio/samples-go/blob/main/saga/workflow.go


<br>

## 04-03. Choreography (コレオグラフィ) ベースのSagaパターン

### コレオグラフィベースのSagaパターンとは

マイクロサービスは、自身のローカルトランザクションを完了させた後に、次のマイクロサービスをコールする。

各マイクロサービス間の通信方式をイベント駆動方式にする必要がある。

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

> - https://developers.redhat.com/articles/2021/09/21/distributed-transaction-patterns-microservices-compared

<br>

### イベントのパブリッシュとサブスクライブの方式

各マイクロサービスにパブリッシュとサブスクライブを処理する責務を持たせる。

各マイクロサービスをイベント駆動方式で実装する必要がある。

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

## 06. オブジェクトモデリング方式

### イベントソーシング

#### ▼ イベントソーシングとは

ビジネスの出来事をモデリングし、データとして永続化する。

現在の状態を取得する場合は、初期のデータに全ての出来事を適用する。

CQRSと相性が良い。

> - https://qiita.com/suin/items/f559e3dcde7c811ed4e1
> - https://martinfowler.com/articles/201701-event-driven.html

<br>

### ステートソーシング

#### ▼ ステートソーシングとは

ビジネスの現在の状態をモデリングし、データとして永続化する。

過去の状態は上書きされる。

> - http://masuda220.jugem.jp/?eid=435

<br>
