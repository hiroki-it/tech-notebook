---
title: 【IT技術の知見】OpenFeature＠フィーチャーフラグ
description: OpenFeature＠フィーチャーフラグの知見を記録しています。
---

# OpenFeature＠フィーチャーフラグ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Go

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

	// フィーチャーフラグ返信プロキシから、フラグのboolean値を取得する
	v2Enabled, _ := client.BooleanValue(
        context.Background(),
		"v2_enabled",
		true,
		openfeature.EvaluationContext{},
    )

	// フィーチャーフラグが有効な場合
	if v2Enabled {
        fmt.Println("v2 is enabled")
    }
}
```

> - https://openfeature.dev/docs/reference/technologies/server/go
> - https://gofeatureflag.org/docs/relay_proxy

<br>
