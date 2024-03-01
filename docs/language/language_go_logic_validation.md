---
title: 【IT技術の知見】検証ロジック＠Go
description: 検証ロジック＠Goの知見を記録しています。
---

# 検証ロジック＠Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## ビルトイン

### 検証パターンと検証メソッドの対応

記入中...

✅：`TRUE`になる。

空欄：`FALSE`になる。

|     検証パターン      | `if (var)` | `if len(var) == 0` | `if var != nil` | `in var == 0`、`if reflect.ValueOf(var).IsZero()` |
| :-------------------: | :--------: | :----------------: | :-------------: | :-----------------------------------------------: |
|       **`nil`**       |            |                    |                 |                                                   |
|        **`0`**        |            |                    |                 |                        ✅                         |
|        **`1`**        |            |                    |                 |                                                   |
|   **`""`** (空文字)   |            |         ✅         |                 |                                                   |
|      **`"あ"`**       |            |                    |                 |                                                   |
|      **`false`**      |            |                    |                 |                                                   |
|      **`true`**       |     ✅     |                    |                 |                                                   |
| **`[]`** (空スライス) |            |                    |                 |                                                   |

> - https://stackoverflow.com/a/18595217
> - https://www.geeksforgeeks.org/zero-value-in-golang/
> - https://stackoverflow.com/a/61877328
> - https://stackoverflow.com/a/38512327
> - https://tutuz-tech.hatenablog.com/entry/2019/10/20/145302

<br>

## ユーザー定義

### 重複の検知

```go
package main

import (
	"errors"
	"log"
	"os"
)

func IsDuplicateFoo() bool {

	slice := []bool{
		isFoo1,
		isFoo2,
		isFoo3,
	}

	encountered := make(map[bool]bool)

	for _, v := range slice {
		if encountered[v] {
			return true
		}
		encountered[v] = true
	}

	return false
}

func main()  {
	var foo Foo
	var err error

	switch {
	// 有効化が重複する場合
	case IsDuplicateFoo():
		log.Print("Failed to initialize foo: Foo is duplicate")
		// 後続の処理を実行できないので、ここでプロセスを終了させる
		os.Exit(1)

	// Foo1を使用する場合
	case IsFoo1():
		foo, err = NewFoo1()

	// Foo2を使用する場合
	case isFoo2():
		foo, err = NewFoo2()

	// Foo3を使用する場合
	case isFoo3():
		foo, err = NewFoo3()
	}

}
```

<br>
