---
title: 【IT技術の知見】Gin＠フレームワーク
description: Gin＠フレームワークの知見を記録しています。
---

# Gin＠フレームワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## Context

### Contextとは

受信したリクエストの全てのコンテキスト (例：処理中のコンテキスト) を持つ。

```go
type Context struct {
	Request *http.Request

	Writer  ResponseWriter

	Params Params

	Keys map[string]any

	Errors errorMsgs

	Accepted []string
}
```

> - https://pkg.go.dev/github.com/gin-gonic/gin#Context

<br>

### Request

処理中のコンテキスト (例：デッドライン、キャンセルなど) を持つ。

処理中のコンテキストは、`gin.Context.Request.Context`関数で取得できる。

```go
type Context struct {
	Request *http.Request
}
```

Ginの計装で必要なコンテキストも`gin.Context.Request.Context`である。

```go
func Middleware(service string, opts ...Option) gin.HandlerFunc {

	...


	return func(c *gin.Context) {

		...

		savedCtx := c.Request.Context()

		...

		ctx := cfg.Propagators.Extract(
            savedCtx,
			// Carrierとして使用するHTTPヘッダーを設定し、トレースコンテキストを抽出する
			propagation.HeaderCarrier(c.Request.Header)
        )

		...

        tracer := otel.Tracer("<計装パッケージ名>")
        ctx, span := tracer.Start(ctx, spanName, opts...)

		...
	}
}
```

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.25.0/instrumentation/github.com/gin-gonic/gin/otelgin/gintrace.go#L31-L95

<br>

### Bind

#### ▼ 処理

リクエストからデータを取得し、構造体に紐付ける。

Content-TypeヘッダーのMIMEタイプに応じて、バインド関数をコールし分ける。

> - https://pkg.go.dev/github.com/gin-gonic/gin?utm_source=godoc#Context.Bind

<br>

### BindJSON

#### ▼ 処理

`Content-Type`ヘッダーのMIMEタイプが`application/json`であることが前提である。

リクエストからJSON型データを取得し、構造体に紐付ける。

```go
type User struct {
    Id   int    `json:"id"   binding:"required"`
    Name string `json:"name" binding:"required"`
}
```

> - https://pkg.go.dev/github.com/gin-gonic/gin?utm_source=godoc#Context.BindJSON

<br>

### BindQuery

#### ▼ 処理

クエリパラメーターからデータを取得し、構造体に紐付ける。

<br>

### Get

#### ▼ 処理

同じリクエストにて`Set`関数でセットされたmap型データから、インターフェース型で値を取得する。

値が存在しない場合は、第二返却値で`false`を返却する。

> - https://pkg.go.dev/github.com/gin-gonic/gin#Context.Get

<br>

### ShouldBindQuery (= ShouldBindWith)

#### ▼ 処理

クエリパラメーターからデータを取得し、指定したバインディングツールを使用して、構造体に紐付ける。

<br>

### JSON

#### ▼ 処理

JSON型データとして、レスポンスを返信する。

第二引数の引数型がインターフェースになっているため、さまざまなデータ型を渡せる。

**＊実装例＊**

map型データを渡す。

```go
package server

import (
	"github.com/gin-gonic/gin"
)

func fooHandler(ginCtx *gin.Context) {

	...

	ginCtx.JSON(
		200,
		gin.H{id: 1,"name": "hiroki hasegawa"},
	)

	...
}
```

構造体型データを渡す。

```go
package server

import (
	"github.com/gin-gonic/gin"
)

type Foo struct {
	id int json:"id"
	name string json:"name"
}

func fooHandler(ginCtx *gin.Context) {

	...

	ginCtx.JSON(
		200,
		&Foo{id: 1, name: "hiroki hasegawa"},
    )

	...
}
```

<br>

### MustGet

#### ▼ 処理

同じリクエストにて`Set`関数でセットされたmap型データから、インターフェース型で値を取得する。

値が存在しない場合は、ランタイムエラーとなる。

> - https://pkg.go.dev/github.com/gin-gonic/gin#Context.MustGet

<br>

### Request

#### ▼ Requestとは

受信したリクエストを情報を持つ。

#### ▼ Context

受信したリクエストのコンテキストを取得する。

**＊実装例＊**

```go
package server

import (
	"context"

	"github.com/gin-gonic/gin"
)

func getRequestContext(ginCtx *gin.Context) context.Context {

	// コンテキストを取得する
	ctx := ginCtx.Request.Context()

	return ctx
}
```

#### ▼ Header

受信したリクエストのHTTPヘッダーを操作する。

**＊実装例＊**

```go
package server

import (
	"log"

	"github.com/gin-gonic/gin"
)

func getRequestHeader(ginCtx *gin.Context) string {

	// HTTPヘッダーの特定の値を取得する
	val := ginCtx.Request.Header.Get("<ヘッダーのキー名>")

	log.Print(val)

	return val
}
```

> - https://yuji-ueda.hatenadiary.jp/entry/2019/10/13/104227

**＊実装例＊**

```go
package server

import (
	"log"

	"github.com/gin-gonic/gin"
)

func printRequestHeaderList(ginCtx *gin.Context) {

	// HTTPヘッダーのリストを取得する
	for k, vals := range ginCtx.Request.Header {
		log.Printf("%v", k)
		for _, v := range vals {
			log.Printf("%v", v)
		}
	}
}
```

> - https://gist.github.com/178inaba/a428496ebdc31edd16c84e78103d45ac

<br>

### Param

#### ▼ 処理

クエリパラメーターからデータを取得する。

この後、構造体に紐付ける場合は、`BindQuery`関数を使用した方が良い。

<br>

### Set

#### ▼ 処理

当該のリクエストで利用できるmap型データに、値を保管する。

> - https://pkg.go.dev/github.com/gin-gonic/gin#Context.Set

#### ▼ 注意点

データ型を変換した値を`Set`関数で保管しないようにすることによりある。

`Set`関数後に`Get`関数で取得される値は、元のデータ型に関係なくインターフェース型に変換されてしまう。

そのため、例えば、タイプID型として値を保管したとしても、`Get`関数で得られたインターフェース型データを改めて変換しないといけなくなってしまう。

**＊実装例＊**

```go
package middlewares

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// ConvertId パスパラメーターのidのデータ型を変換します。
func ConvertId() gin.HandlerFunc {

	return func(ginCtx *gin.Context) {

		id, err := strconv.Atoi(ginCtx.Param("id"))

		if err != nil {
			_ = ginCtx.Error(fmt.Sprintf("Failed to do something: %v", err))
			return
		}

		ginCtx.Set("id", id)

		ginCtx.Next()
	}
}

```

```go
package controller

type UserController struct {
	*interfaces.Controller
	userInteractor *interactor.UserInteractor
}

func (uc *UserController) GetUser(ginCtx *gin.Context) {

    // インターフェース型になってしまう。
	userId, ok := ginCtx.Get("id")

	if !ok {
		uc.SendErrorJson(
            ginCtx,
            400,
            []string{"Parameters are not found."},
        )

		return
	}
```

<br>

## Engine

### Engine

#### ▼ Engineとは

ルーティングを定義する。

```go
router := gin.New()
```

<br>

### Use

#### ▼ Useとは

ユーザー定義のミドルウェアを使用する。

`gin.HandlerFunc`関数というGin固有のデータ型が必要である。

ミドルウェアは、`Use`した順番で実行する。

```go
package main

func main() {

	...

	router := gin.New()
	router.Use(FooMiddleware)

	...
}

func FooMiddleware() gin.HandlerFunc {
	return func(ginCtx *gin.Context) {
		// ミドルウェアとして実行したい処理
	}
}
```

#### ▼ `http.Handler`や`http.HandlerFunc`から`gin.HandlerFunc`への変換

`gin.HandlerFunc`関数を引数にとるパッケージに`http.Handler`関数や`http.HandlerFunc`関数を渡すことができる。

`WrapH`関数や`WrapF`関数を使用すると、`http.Handler`や`http.HandlerFunc`から`gin.HandlerFunc`に変換できる。

```go
package main

func main() {

	...

	router.Use(gin.WrapH(BarMiddleware(router)))
	router.Use(gin.WrapF(BazMiddleware(router)))

	...
}

func BarMiddleware(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		// ミドルウェアとして実行したい処理
	}

	return http.HandlerFunc(fn)
}

func BazMiddleware(next http.Handler) http.HandlerFunc {
	fn := func(w http.ResponseWriter, r *http.Request) {
		// ミドルウェアとして実行したい処理
	}

	return http.HandlerFunc(fn)
}
```

> - https://github.com/gin-gonic/gin/issues/293#issuecomment-103681813

#### ▼ `gin.HandlerFunc`から`http.Handler`への変換

`http.Handler`関数を引数にとるパッケージに`gin.HandlerFunc`関数を渡すことは諦めた方がいい。

`gin.HandlerFunc`関数は`http.Handler`のラッパーである。

そのため、`http.Handler`関数から`gin.HandlerFunc`関数への変換は簡単にできるが、その逆は`gin.HandlerFunc`関数から値を取り出さないといけず、難しい。

<br>

## Util

### H

map型の変数のエイリアスとして働く。

```go
type H map[string]interface{}
```

```go
ginCtx.JSON(
  200,
  gin.H{"id": 1,"name": "hiroki hasegawa"},
)
```

```go
ginCtx.JSON(
  400,
  gin.H{"errors": []string{"Fooエラーメッセージ", "Barエラーメッセージ"}},
)
```

<br>

## Validator

### tag

#### ▼ binding

バリデーションのルールを定義する。

標準のルールの一覧は、以下のリンクを参考にせよ。

> - https://github.com/go-playground/validator/blob/v10.15.1/baked_in.go#L70-L235

<br>
