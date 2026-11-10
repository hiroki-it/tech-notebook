---
title: 【IT技術の知見】制御構文
description: 制御構文の知見を記録しています。
tags:
  - "言語"
  - "Go"
  - "言語機能"
---

# 制御構文

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 制御文

### 初期化ステートメント

以下の 2 つの実装例は同じである。

```go
package main

import (
	"log"
)

func main() {

	// 数値を取得する
	value := getNum()

	// 通常の記法
	if value > 20 {
		log.Printf("%v: 20より大きいです\n", value)
	}

	log.Printf("%v: 20より小さいです\n", value)
}
```

初期化ステートメントでは、条件に処理の結果を使用できる。

なお、処理の結果自体は条件内でしか使用できない。

```go
package main

import (
	"log"
)

func main() {

	// 簡易記法
	if value := getNum(); value > 20 {
		// value変数は条件内でしか使用できない
		log.Printf("%v: 20より大きいです\n", value)
	}

	log.Printf("%v: 20より小さいです\n", value)
}

func getNum() int {
	return 20
}
```

> - https://code-database.com/knowledges/97

<br>

### `if-else-if` の代替

#### ▼ `if` の連続

Go には `if-else-if` があるが、可読性が低い場合は代わりに `if` を連続させる。

事前に `var` で変数を宣言し、各 `if` 内で変数に値を格納する。

```go
package main

import (
	"fmt"
)

func getFooX() string {
	return "FooX"
}

func getFooY() string {
	return "FooY"
}

func getFooZ() string {
	return "FooZ"
}

func main() {

	var foo string
    isX, isY, isZ := true, false, false

	if isX {
		foo = getFooX()
	}

	if isY {
		foo = getFooY()
	}

	if isZ {
		foo = getFooZ()
	}

	fmt.Print(foo)
}
```

#### ▼ `switch-case`

Go には `if-else-if` があるが、可読性が低い場合は代わりに `switch-case` を使用する。

事前に `var` で変数を宣言し、各 `switch-case` 内で変数に値を格納する。

```go
package main

import (
	"fmt"
)

func getFooX() string {
	return "FooX"
}

func getFooY() string {
	return "FooY"
}

func getFooZ() string {
	return "FooZ"
}

func main() {

	var foo string
    isX, isY, isZ := true, false, false

	switch {
	case isX:
		foo = getFooX()

	case isY:
		foo = getFooY()

	case isZ:
		foo = getFooZ()
	}

	fmt.Print(foo)
}
```

<br>

### 配列または slice の走査

#### ▼ `for ... range`

配列または slice を走査する。

PHP の `foreach` に相当する。

```go
package main

import "fmt"

func main() {

	slice := []string{"a", "b", "c"}

	for key, value := range slice {
		fmt.Println(key, value)
	}
}

// 0 a
// 1 b
// 2 c
```

<br>

