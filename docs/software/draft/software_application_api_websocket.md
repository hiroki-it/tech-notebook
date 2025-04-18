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

![mqtt-over-websocket.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/mqtt-over-websocket.png)

> - https://www.hivemq.com/blog/understanding-the-differences-between-mqtt-and-websockets-for-iot/
> - https://qiita.com/theFirstPenguin/items/55dd1daa9313f6b90e2f#websocket

#### ▼ クライアント

```typescript
import mqtt from "mqtt";

// MQTTクライアントのオプション (必要に応じて設定)
const connectOptions: mqtt.IClientOptions = {
  // ランダムなクライアントIDを生成
  clientId: `mqttjs_${Math.random().toString(16).slice(2, 10)}`,
  // EMQXで認証が必要な場合は設定
  username: "<ユーザー名>",
  // EMQXで認証が必要な場合は設定
  password: "<パスワード>",
  // キープアライブ間隔 (秒)
  keepalive: 60,
  // 再接続試行間隔 (ミリ秒)
  reconnectPeriod: 1000,
  // 接続タイムアウト (ミリ秒)
  connectTimeout: 30000,
  will: {
    topic: "client/offline",
    payload: "Client disconnected unexpectedly",
    qos: 0,
    retain: false,
  },
};

// MQTTクライアントの作成
const client = mqtt.connect("ws://localhost:8083/mqtt", connectOptions);

// 接続成功時の処理
client.on("connect", () => {
  console.log("Connected to EMQX via WebSocket");

  // トピックをサブスクライブする
  const subscribeTopic = "my/topic";
  client.subscribe(subscribeTopic, {qos: 0}, (err) => {
    if (!err) {
      console.log(`Subscribed to topic: ${subscribeTopic}`);
    } else {
      console.error(`Error subscribing to topic ${subscribeTopic}:`, err);
    }
  });

  // メッセージをパブリッシュする
  const publishTopic = "another/topic";
  const message = "Hello from MQTT over WebSocket client!";
  client.publish(publishTopic, message, {qos: 0, retain: false}, (err) => {
    if (!err) {
      console.log(`Published message "${message}" to topic: ${publishTopic}`);
    } else {
      console.error(`Error publishing message to topic ${publishTopic}:`, err);
    }
  });
});

// メッセージ受信時の処理
client.on("message", (topic, message) => {
  console.log(`Received message on topic "${topic}": ${message.toString()}`);
});

// 切断時の処理
client.on("disconnect", () => {
  console.log("Disconnected from EMQX");
});

// 再接続時の処理
client.on("reconnect", () => {
  console.log("Attempting to reconnect to EMQX...");
});

// エラー発生時の処理
client.on("error", (err) => {
  console.error("MQTT client error:", err);
});
```

<br>
