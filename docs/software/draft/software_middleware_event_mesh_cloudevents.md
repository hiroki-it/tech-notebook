---
title: 【IT技術の知見】CloudEvents＠パブリッシュ／サブスクライブパターン
description: CloudEvents＠パブリッシュ／サブスクライブパターンの知見を記録しています。
---

# CloudEvents＠パブリッシュ／サブスクライブパターン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. CloudEventsの仕組み

### アーキテクチャ

送信元では、メッセージを発行し、メッセージキュー (例：AWS SQSなど) やメッセージブローカー (例：Apache Kafka、RabbitMQなど) に送信する。

また宛先では、メッセージキューからメッセージを受信する。

異なる言語間でメッセージの仕様は同じなため、異なる言語に渡ってメッセージを送受信できる。

![cloudevents_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloudevents_architecture.png)

> - https://github.com/cloudevents/spec
> - https://www.salaboy.com/2022/01/29/event-driven-applications-with-cloudevents-on-kubernetes/

<br>

## 02. Go SDK

### セットアップ

```bash
$ go get github.com/cloudevents/sdk-go/v2@v2.12.0
```

<br>

### メッセージ送信

```go
package main

import cloudevents "github.com/cloudevents/sdk-go/v2"

func main() {
	c, err := cloudevents.NewClientHTTP()

    if err != nil {
		log.Printf("failed to create client, %v", err)
	}

	// Create an Event.
	event :=  cloudevents.NewEvent()
	event.SetSource("example/uri")
	event.SetType("example.type")
	event.SetData(cloudevents.ApplicationJSON, map[string]string{"hello": "world"})

	// Set a target.
	ctx := cloudevents.ContextWithTarget(context.Background(), "http://localhost:8080/")

	// Send that Event.
	if result := c.Send(ctx, event); cloudevents.IsUndelivered(result) {
		log.Printf("failed to send, %v", result)
	} else {
		log.Printf("sent: %v", event)
		log.Printf("result: %v", result)
	}
}
```

> - https://cloudevents.github.io/sdk-go/#send-your-first-cloudevent

<br>

### メッセージ受信

```go
package main

import cloudevents "github.com/cloudevents/sdk-go/v2"

func receive(event cloudevents.Event) {
	// do something with event.
    fmt.Printf("%s", event)
}

func main() {
	// The default client is HTTP.
	c, err := cloudevents.NewClientHTTP()
	if err != nil {
		log.Printf("failed to create client, %v", err)
	}
	if err = c.StartReceiver(context.Background(), receive); err != nil {
		log.Printf("failed to start receiver: %v", err)
	}
}
```

> - https://cloudevents.github.io/sdk-go/#receive-your-first-cloudevent

<br>
