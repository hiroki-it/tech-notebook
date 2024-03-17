---
title: 【IT技術の知見】CloudEvents＠CNCF
description: CloudEvents＠CNCFの知見を記録しています。
---

# CloudEvents＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. CloudEventsとは

メッセージを発行する。

また、発行したメッセージをメッセージキュー (例：AWS SQS、など) やメッセージブローカー (例：Apache Kafka、など) に送信し、またこれらから受信する。

異なる言語間でメッセージの仕様は同じなため、異なる言語に渡ってメッセージを送受信できる。

> - https://github.com/cloudevents/spec

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
		log.Fatalf("failed to create client, %v", err)
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
		log.Fatalf("failed to send, %v", result)
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
		log.Fatalf("failed to create client, %v", err)
	}
	if err = c.StartReceiver(context.Background(), receive); err != nil {
		log.Fatalf("failed to start receiver: %v", err)
	}
}
```

> - https://cloudevents.github.io/sdk-go/#receive-your-first-cloudevent

<br>
