---
title: 【IT技術の知見】Websocket-API＠API
description: Websocket-API＠APIの知見を記録しています。
---

# Websocket-API＠API

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Websocket-APIの仕組み

### アーキテクチャ

クライアントの間で双方向通信を実施する。

> - https://hackernoon.com/lang/ja/%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E8%A8%AD%E8%A8%88%E3%83%81%E3%83%BC%E3%83%88%E3%82%B7%E3%83%BC%E3%83%88-API-%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB-REST-%E3%82%B0%E3%83%A9%E3%83%95QL-WebSocket-Webhook-RPCGRPC-SOAP

<br>

### HTTPプロトコルの場合

#### ▼ 仕組み

通常のRESTful-APIでHTTPを使用する場合、双方向通信は実施できない。

一方で、Websocket-APIではHTTPを拡張し、双方向通信は実施できるようにしている。

> - https://qiita.com/theFirstPenguin/items/55dd1daa9313f6b90e2f#websocket

#### ▼ クライアント

```typescript
import WebSocket from "ws";

// WebSocketクライアントのインスタンスを作成
const ws = new WebSocket("ws://localhost:8080");

// WebSocket接続が開いた時の処理
ws.on("open", () => {
  console.log("WebSocket connection opened");
  // サーバーにメッセージを送信する例
  ws.send("Hello from the client!");
});

// サーバーからメッセージを受信した時の処理
ws.on("message", (message) => {
  if (typeof message === "string") {
    console.log(`Received message: ${message}`);
  } else if (message instanceof Buffer) {
    console.log(`Received binary data: ${message}`);
  }
});

// WebSocket接続が閉じた時の処理
ws.on("close", () => {
  console.log("WebSocket connection closed");
});

// エラーが発生した時の処理
ws.on("error", (error) => {
  console.error(`WebSocket error: ${error}`);
});
```

<br>

#### ▼ サーバー

```go
package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// 全てのオリジンからの接続を許可
		return true
	},
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}
	defer conn.Close()

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("received: %s", p)

		err = conn.WriteMessage(messageType, p)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

func main() {
	http.HandleFunc("/ws", handleWebSocket)
	log.Println("WebSocket server started on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
```

<br>

### MQTT over Websocketの場合

#### ▼ 仕組み

通常のMQTTの場合、ブラウザでは使用できず、IoTの文脈で使用できる。

一方で、MQTT over WebsocketではWebsocketで接続を確立し、MQTTプロトコルを使用する。

これにより、ブラウザからMQTTプロトコルでリクエストを送信できるようになる。

> - https://qiita.com/theFirstPenguin/items/55dd1daa9313f6b90e2f#websocket

<br>
