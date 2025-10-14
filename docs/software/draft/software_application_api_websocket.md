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

## 01-02. Websocket

### 仕組み

通常のRESTful-APIでHTTPを使用する場合、双方向通信は実施できない。

一方で、Websocket-APIではHTTPを拡張し、双方向通信は実施できるようにしている。

![websocket](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/websocket.png)

> - https://qiita.com/theFirstPenguin/items/55dd1daa9313f6b90e2f#websocket
> - https://zenn.dev/nameless_sn/articles/websocket_tutorial#websocket%E3%81%8C%E5%8B%95%E3%81%8F%E4%BB%95%E7%B5%84%E3%81%BF
> - https://ja.javascript.info/websocket#ref-1752

<br>

### 実装例

#### ▼ クライアント

```typescript
import WebSocket from "ws";

// WebSocketクライアントのインスタンスを作成
const ws = new WebSocket("ws://localhost:8080");

// WebSocket接続が開いた時の処理をイベントリスナーとして登録する
ws.on("open", () => {
  console.log("WebSocket connection opened");
  // サーバーにメッセージを送信する例
  ws.send("Hello from the client!");
});

// サーバーからメッセージを受信した時の処理をイベントリスナーとして登録する
ws.on("message", (message) => {
  if (typeof message === "string") {
    console.log(`Received message: ${message}`);
  } else if (message instanceof Buffer) {
    console.log(`Received binary data: ${message}`);
  }
});

// WebSocket接続が閉じた時の処理をイベントリスナーとして登録する
ws.on("close", () => {
  console.log("WebSocket connection closed");
});

// エラーが発生した時の処理をイベントリスナーとして登録する
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
	// ws://localhost:8080 で待ち受ける
	http.HandleFunc("/ws", handleWebSocket)

	log.Println("WebSocket server started on :8080")

	err := http.ListenAndServe(":8080", nil)

	if err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
```

#### ▼ リクエストヘッダー

ブラウザはサーバーにHTTPリクエストを送信する。

```yaml
GET /chatService HTTP/1.1

Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Origin: http://example.com
Sec-WebSocket-Protocol: soap, wamp
Sec-WebSocket-Version: 13
```

#### ▼ レスポンスヘッダー

サーバーは、HTTPレスポンスに`Upgrade`ヘッダーを設定する。

これにより、HTTPプロトコルがWebsocketプロトコルに変更される。

```yaml
HTTP/1.1 101 Switching Protocols

Upgrade: WebSocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: wamp
```

<br>

<br>

## 01-03. Websocket over SSL/TLS

### 仕組み

Websocket上の通信を暗号化する。

```javascript
import WebSocket from "ws";

// WebSocket over SSL/TLSクライアントのインスタンスを作成
const wss = new WebSocket("wss://localhost:8080");
```

> - https://ja.javascript.info/websocket

<br>

## 02. MQTT over Websocket

### 仕組み

通常のMQTTの場合、ブラウザでは使用できず、IoTの文脈で使用できる。

一方で、MQTT over WebsocketではWebsocketプロトコルで通信し、MQTTプロトコルを使用する。

これにより、ブラウザからMQTTプロトコルでリクエストを送信できるようになる。

![mqtt-over-websocket](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/mqtt-over-websocket.png)

> - https://www.hivemq.com/blog/understanding-the-differences-between-mqtt-and-websockets-for-iot/
> - https://qiita.com/theFirstPenguin/items/55dd1daa9313f6b90e2f#websocket

<br>

### AWS ALBがある場合

ブラウザはまずAWS ALBに対してHTTPSプロトコルでリクエストを送信する。

AWS ALBからブラウザへのレスポンス後に、ブラウザはWebsocketプロトコルでAWS ALBと通信する。

ブラウザは、AWS ALBのHTTPSのリスナールールを介して、MQTTプロトコルでEmqxにイベントを送信する。

![mqtt-over-websocket-on-aws](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/mqtt-over-websocket-on-aws.png)

<br>

### 実装例

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

// 接続成功時の処理をイベントリスナーとして登録する
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

// メッセージ受信時の処理をイベントリスナーとして登録する
client.on("message", (topic, message) => {
  console.log(`Received message on topic "${topic}": ${message.toString()}`);
});

// 切断時の処理をイベントリスナーとして登録する
client.on("disconnect", () => {
  console.log("Disconnected from EMQX");
});

// 再接続時の処理をイベントリスナーとして登録する
client.on("reconnect", () => {
  console.log("Attempting to reconnect to EMQX...");
});

// エラー発生時の処理をイベントリスナーとして登録する
client.on("error", (err) => {
  console.error("MQTT client error:", err);
});
```

#### ▼ リクエストヘッダー

MQTTクライアントは、MQTTサーバーにHTTPリクエストを送信する。

```yaml
GET /mqtt HTTP/1.1

Host: 0.0.0.0:8083
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: <ランダムキー>
Sec-WebSocket-Version: 13
```

#### ▼ レスポンスヘッダー

MQTTサーバーは、HTTPレスポンスに`Upgrade`ヘッダーを設定する。

これにより、HTTPプロトコルがWebsocketプロトコルに変更される。

このWebsocketプロトコル上で、MQTTプロトコルを使用できる。

```yaml
HTTP/1.1 101 Switching Protocols

Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: <サーバーが生成したキー>
```

<br>
