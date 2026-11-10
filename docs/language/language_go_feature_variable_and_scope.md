---
title: 【IT技術の知見】変数・スコープ＠Go
description: 変数・スコープ＠Goの知見を記録しています。
---

# 変数・スコープ＠Go

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 変数

### 定義 (宣言+代入)

#### ▼ 明示的な定義

```go
// 1個の変数を定義 (宣言と代入が同時でない)
var number int
number = 5

// 1個の変数を定義 (宣言と代入が同時)
var number int = 5

// 複数の変数を定義
var foo, bar, baz int
foo, bar, baz = 1, 3, 5
```

#### ▼ 暗黙的な定義 (型推論)

```go
// データ型が自動的に認識される
w := 1
x := true
y := 3.14
z := "abc"

var w = 1

var (
    foo = true
    y = 3.14
    z = "abc"
)
```

```go
package main

import "fmt"

func quotient(x int, y int) int {

	// 商を計算する。
	quotient := x / y

	// を返却する。
	return quotient
}

func main() {
	fmt.Println(quotient(2, 2))
}
```

#### ▼ 再宣言

基本的には、同じスコープ内で既存の変数を再宣言できない。

ただし、複数の変数を宣言するときは注意する。いずれかに新しい変数の宣言が含まれていれば、既存の変数を宣言したとしても代入のみが実行される。

```go
package main

import (
	"log"
)

func main() {
	foo := 1

	// 新しい変数の宣言が含まれている
	foo, bar := 2, 3

	log.Printf("%v", foo) // 2
	log.Printf("%v", bar) // 3
}
```

<br>

### 定義位置の種類

#### ▼ グローバル変数

関数の外部で定義した変数のこと。

スコープとして、宣言されたパッケージ外部でも使用できる。

グローバル変数を宣言し、関数内で値を代入する。

```go
package main

import (
	"log"
)

// グローバル変数
var text string

func main() {
    text = "Hello World!"
    log.Printf("%v", text)
}
```

変数に対する代入は関数内でしかできないため、宣言と代入を同時に実行する型推論を使用するとエラーになってしまう。

```go
package main

import (
	"log"
)

// エラーになってしまう。
text := "Hello World!"

func main() {
    log.Printf("%v", text)
}
```

> - [Go言語の変数を解説 - Recursion](https://recursionist.io/learn/languages/go/data-type/variable)

#### ▼ ローカル変数

関数の内部で定義した変数のこと。

スコープとして、宣言されたパッケージ内部でしか使用できない。

```go
package main

import (
	"log"
)

func main() {
    // ローカル変数
    text := "Hello World!"
    log.Printf("%v", text)
}
```

> - [Go言語の変数を解説 - Recursion](https://recursionist.io/learn/languages/go/data-type/variable)

<br>

## 02. 環境変数

### 環境変数の出入力

#### ▼ `init()` 関数による環境変数出力

環境変数は、`.env` ファイルを使用する以外に、`init()` 関数で出力する方法もある。

#### ▼ アプリ側の環境変数

```go
package config

import "os"

// 環境変数名を設定する
const (
	FooEnvKey = "FOO"
	BarEnvKey = "BAR"
	BazEnvKey = "BAZ"
)

func init() {

	// 環境変数名を指定して値を格納する
	os.Setenv(FooEnvKey, "foo")
	os.Setenv(BarEnvKey, "bar")
	os.Setenv(BazEnvKey, "baz")
}
```

#### ▼ パッケージ側の環境変数

パッケージ側では、アプリケーションが設定した環境変数を出力できるような処理が必要になる。

このとき、フォールバック (変数や定数に値が格納されていない場合に、代わりに使用する処理) で環境変数を取得すると、デフォルト値を設定できる。

環境変数が string 型か float64 型かに合わせて、関数を定義しておく。

```go
package config

import (
	"os"
	"strconv"
)

// 環境変数名を設定する
const (
	FooEnvKey = "FOO"
	BarEnvKey = "BAR"
	BazEnvKey = "Baz"
    QuxEnvKey = "QUX"
)

var (
	foo string
	bar string
	baz float64
	qux bool
)

func init() {
	getEnvs()
}


func getEnvs() {

	// 環境変数名を指定して値を取得する
	foo = getStringEnv(FooEnvKey, "foo")
	bar = getStringEnv(BarEnvKey, "bar")
	baz = getFloatEnv(BazEnvKey, 1.0)
	qux = getBoolEnv(QuxEnvKey, false)
}

// 環境変数をstring型で取得する
func getStringEnv(key string, fallback string) string {

	value := os.Getenv(key)

	// マイクロサービス側で値を設定していれば、それを使用する
	if len(value) != 0 {
		return value
	}

	// 環境変数の値が空文字だった場合は、fallbackをデフォルト値として返却する
	return fallback
}

// 環境変数をfloat64型で取得する
func getFloatEnv(key string, fallback float64) float64 {

	value, err := strconv.ParseFloat(getStringEnv(key, strconv.FormatFloat(fallback, 'f', -1, 64)), 64)

	if err != nil {
		return fallback
	}

	return value
}

// 環境変数をbool型で取得する
func getBoolEnv(key string, fallback bool) bool {

	value, err := strconv.ParseBool(getStringEnv(key, strconv.FormatBool(fallback)))

	if err != nil {
		return fallback
	}

	return value
}
```

> - https://stackoverflow.com/a/40326580
> - [hawksnowlog: golang で環境変数のデフォルト値を設定する方法](https://hawksnowlog.blogspot.com/2019/09/set-default-value-for-envval.html)

<br>

### string 型以外の値

環境変数はすべて string 型で定義する必要がある。

そのため、出入力前に string 型への (からの) 変換が必要になる。

```go
// int型をstring型に変換した上で、環境変数として設定する
os.Setenv("FOO_TIMEOUT", strconv.Itoa(300))

// bool型をstring型に変換した上で、環境変数として設定する
os.Setenv("FOO_ENABLED", strconv.FormatBool(true))
```

<br>

## 03. スコープ

### 変数、定数

#### ▼ パッケージ内外から参照可能

変数名または定数名の頭文字を大文字すると、パッケージ内外でこれをコールできるようになる。

```go
package foo

// 定数を定義する。
const (
	Foo  = "foo"
)
```

```go
package main

import (
	"log"
)

func main() {
    log.Printf("%v", Foo) // foo
}
```

#### ▼ パッケージ内のみ参照可能

変数名または定数名の頭文字を小文字すると、パッケージ外でこれをコールできなくなる。

```go
package foo

// 定数を定義する。
const (
	Bar  = "bar"
)
```

```go
package main

import (
	"log"
)

func main() {
    log.Printf("%v", Bar) // コールできずにエラーになる
}
```

<br>

### 関数

#### ▼ パッケージ内外から参照可能

関数名の頭文字を大文字すると、パッケージ内外でこれをコールできるようになる。

```go
package foo

func Foo() {
    // 何らかの処理
}
```

```go
package main

func main() {
    Foo()
}
```

#### ▼ パッケージ内のみ参照可能

関数名の頭文字を小文字すると、パッケージ外でこれをコールできなくなる。

```go
package main

func foo() {
    // 何らかの処理
}

func main() {
    foo()
}
```

<br>

