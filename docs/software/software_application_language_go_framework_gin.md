---
title: 【IT技術の知見】Gin
description: Ginの知見を記録しています。
---

# Gin

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/index.html

<br>

## Context

### Bind

#### ▼ 処理

リクエストメッセージからデータを取得し、構造体に紐付ける。Cotent-TypeヘッダーのMIMEタイプに応じて、バインド関数をコールし分ける。

> ℹ️ 参考：https://pkg.go.dev/github.com/gin-gonic/gin?utm_source=godoc#Context.Bind

<br>

### BindJSON

#### ▼ 処理

```Content-Type```ヘッダーのMIMEタイプが```application/json```であることが前提である。リクエストメッセージからJSONデータを取得し、構造体に紐付ける。

> ℹ️ 参考：https://pkg.go.dev/github.com/gin-gonic/gin?utm_source=godoc#Context.BindJSON

<br>

### BindQuery

#### ▼ 処理

クエリパラメーターからデータを取得し、構造体に紐付ける。

<br>

### Get

#### ▼ 処理

同じリクエストにて```Set```関数でセットされたマップ型データから、インターフェース型で値を取得する。値が存在しない場合は、第二返却値で```false```を返却する。

> ℹ️ 参考：https://pkg.go.dev/github.com/gin-gonic/gin#Context.Get

<br>

### ShouldBindQuery（= ShouldBindWith）

#### ▼ 処理

クエリパラメーターからデータを取得し、指定したバインディングツールを使用して、構造体に紐付ける。

<br>

### JSON

#### ▼ 処理

JSONデータとして、レスポンスを返信する。第二引数の引数型がインターフェースになっているため、様々なデータ型を渡せる。

 **＊実装例＊**

マップ型データを渡す。

```go
c.JSON(200, gin.H{
    "id": 1,
    "name": "hiroki hasegawa",
})
```

構造体型データを渡す。

```go
type Foo struct {
	id int json:"id"
	name string json:"name"
}

c.JSON(200, &Foo{
    id: 1,
    name: "hiroki hasegawa",
})
```

<br>

### MustGet

#### ▼ 処理

同じリクエストにて```Set```関数でセットされたマップ型データから、インターフェース型で値を取得する。値が存在しない場合は、ランタイムエラーとなる。

> ℹ️ 参考：https://pkg.go.dev/github.com/gin-gonic/gin#Context.MustGet

<br>

### Param

#### ▼ 処理

クエリパラメーターからデータを取得する。この後、構造体に紐付ける場合は、```BindQuery```関数を使用した方が良い。

<br>

### Set

#### ▼ 処理

当該のリクエストで利用できるマップ型データに、値を保存する。

> ℹ️ 参考：https://pkg.go.dev/github.com/gin-gonic/gin#Context.Set

#### ▼ 注意点

データ型を変換した値を```Set```関数で保存しないようにすることによりある。```Set```関数後に```Get```関数で取得される値は、元のデータ型に関係なくインターフェース型に変換されてしまう。そのため、例えば、タイプID型として値を保存したとしても、```Get```関数で得られたインターフェース型データを改めて変換しないといけなくなってしまう。

**＊実装例＊**

```go
package middlewares

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// ConvertId パスパラメーターのidのデータ型を変換します。
func ConvertId() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		id, err := strconv.Atoi(ctx.Param("id"))

		if err != nil {
			_ = ctx.Error(err)
			return
		}

		ctx.Set("id", id)

		ctx.Next()
	}
}

```

```go
package controller

type UserController struct {
	*interfaces.Controller
	userInteractor *interactor.UserInteractor
}

func (uc *UserController) GetUser(ctx *gin.Context) {
    
    // インターフェース型になってしまう。
	userId, ok := ctx.Get("id")

	if !ok {
		uc.SendErrorJson(ctx, 400, []string{"Parameters are not found."})
		return
	}
```

<br>

## Util

### H

マップ型の変数のエイリアスとして働く。

```go
type H map[string]interface{}
```

```go
c.JSON(200, gin.H{
    "id": 1,
    "name": "hiroki hasegawa",
})
```

```go
c.JSON(400, gin.H{
    "errors": []string{
        "Fooエラーメッセージ",
        "Barエラーメッセージ",
    }
})
```

<br>

## Validator

### tag

#### ▼ binding

バリデーションのルールを定義する。標準のルールの一覧は、以下のリンクを参考にせよ。

> ℹ️ 参考：https://github.com/go-playground/validator/blob/65bb1236771df9bc1630c78a43b0bfea10fe7122/baked_in.go#L70





