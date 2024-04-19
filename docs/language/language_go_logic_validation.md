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

### フラグ

フラグを管理する構造体を定義する。

構造体の`bool`型フィールドのゼロ値は`false`である。

```go
package flags

type FooEnabled struct {
	foo1Enabled bool
	foo2Enabled bool
	foo3Enabled bool
}

// EnableFoo1 foo1Enabledを有効化する
func (fooEnabled *FooEnabled) EnableFoo1() *FooEnabled {
	fooEnabled.foo1Enabled = true
	log.Printf("Info: foo1 is enabled")
	return fooEnabled
}

// EnableFoo2 foo2Enabledを有効化する
func (fooEnabled *FooEnabled) EnableFoo2() *FooEnabled {
	fooEnabled.foo2Enabled = true
	log.Printf("Info: foo2 is enabled")
	return fooEnabled
}

// EnableFoo3 foo3Enabledを有効化する
func (fooEnabled *FooEnabled) EnableFoo3() *FooEnabled {
	fooEnabled.foo3Enabled = true
	log.Printf("Info: foo3 is enabled")
	return fooEnabled
}

// GetFoo3Enabled foo1Enabledを取得する
func (fooEnabled *FooEnabled) GetFoo1Enabled() bool {
	return fooEnabled.foo1Enabled
}

// GetFoo2Enabled foo2Enabledを取得する
func (fooEnabled *FooEnabled) GetFoo2Enabled() bool {
	return fooEnabled.foo2Enabled
}

// GetFoo3Enabled foo3Enabledを取得する
func (fooEnabled *FooEnabled) GetFoo3Enabled() bool {
	return fooEnabled.foo3Enabled
}
```

```go
package main

func main() {

	fooEnabled := &FooEnabled{}

	// foo3Enabledを有効化する
	fooEnabled.EnableFoo3()

	// true になる
	fmt.Print(fooEnabled.GetFoo3Enabled)
}
```

<br>

### 重複の検知

```go
package flags

type FooEnabled struct {
	foo1Enabled bool
	foo2Enabled bool
	foo3Enabled bool
}

func NewFooEnabled() *FooEnabled {

	return new(FooEnabled)
}

func (fooEnabled *FooEnabled) IsDuplicateExporter() bool {

	slice := []bool{
		fooEnabled.foo1Enabled,
		fooEnabled.foo2Enabled,
		fooEnabled.foo3Enabled,
	}

	encountered := make(map[bool]bool)

	for _, v := range slice {
        if v {
			if encountered[v] {
				// 重複あり
				return true
			}

			encountered[v] = true
		}
	}

	// 重複なし
	return false
}
// EnableFoo1 foo1Enabledを有効化する
func (fooEnabled *FooEnabled) EnableFoo1() {
	fooEnabled.foo1Enabled = true
}

// EnableFoo2 foo2Enabledを有効化する
func (fooEnabled *FooEnabled) EnableFoo2() {
	fooEnabled.foo2Enabled = true
}

// EnableFoo3 foo3Enabledを有効化する
func (fooEnabled *FooEnabled) EnableFoo3() {
	fooEnabled.foo3Enabled = true
}

// getFoo1Enabled foo1Enabledを取得する
func (fooEnabled *FooEnabled) getFoo1Enabled() bool {
	return fooEnabled.foo1Enabled
}

// getFoo2Enabled foo2Enabledを取得する
func (fooEnabled *FooEnabled) getFoo2Enabled() bool {
	return fooEnabled.foo2Enabled
}

// getFoo3Enabled foo3Enabledを取得する
func (fooEnabled *FooEnabled) getFoo3Enabled() bool {
	return fooEnabled.foo3Enabled
}
```

```go
package main

import (
	"log"
	"os"
)

func main()  {

	fooEnabled := NewFooEnabled()
	var err error

	switch {
	// 有効化が重複する場合
	case fooEnabled.IsDuplicateFoo():
		log.Print("Failed to initialize foo: Foo is duplicate")
		// 後続の処理を実行できないので、ここでプロセスを終了させる
		os.Exit(1)

	// Foo1を使用する場合
	case fooEnabled.getFoo1Enabled():
		foo, err = NewFoo1()

	// Foo2を使用する場合
	case fooEnabled.getFoo2Enabled():
		foo, err = NewFoo2()

	// Foo3を使用する場合
	case fooEnabled.getFoo3Enabled():
		foo, err = NewFoo3()
	}

}
```

<br>
