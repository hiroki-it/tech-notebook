---
title: 【IT技術の知見】OpenFeature＠機能フラグ
description: OpenFeature＠機能フラグの知見を記録しています。
---

# OpenFeature＠機能フラグ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 機能フラグクライアント

### Go

```go
package main

import (
	"fmt"
	"context"
	"github.com/open-feature/go-sdk/openfeature"
)

func main() {

	openfeature.SetProvider(openfeature.NoopProvider{})

	client := openfeature.NewClient("app")

	// 機能フラグサービスから、フラグのboolean値を取得する
	v2Enabled, _ := client.BooleanValue(
		context.Background(),
		"v2_enabled",
		true,
		openfeature.EvaluationContext{},
	)

	// 機能フラグが有効な場合
	if v2Enabled {
		fmt.Println("v2 is enabled")
	}
}
```

> - https://openfeature.dev/docs/reference/technologies/server/go
> - https://gofeatureflag.org/docs/relay_proxy

<br>

## 02. 機能フラグサービス

### unleash

> - https://docs.getunleash.io/get-started/unleash-overview

### flagd

> - https://flagd.dev/architecture/#rpc-evaluation

<br>
