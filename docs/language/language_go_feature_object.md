---
title: 【IT技術の知見】オブジェクト
description: オブジェクトの知見を記録しています。
tags:
  - "言語"
  - "Go"
  - "言語機能"
---

# オブジェクト

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 構造体

### 構造体とは

他の言語でいう『データのみを保持するオブジェクト』に相当する。

構造体を定義し、変数に代入する。

```go
var person struct {
    Name string
}
```

<br>

### Defined Type によるユーザー定義の構造体

Defined Type を使用して、ユーザー定義のデータ型の構造体を定義する。

フィールド名の頭文字を大文字にした場合は、パッケージ外からのアクセスをパブリックに、小文字にした場合はプライベートになる。

パブリックなフィールドを持つ構造体は以下の通り。

```go
type Person struct {
	// パブリック
	Name string
}
```

プライベートなフィールドを持つ構造体は以下の通り。

```go
type Person struct {
	// プライベート
	name string
}
```

<br>

### 使用不可のフィールド名

小文字の『`type`』は予約語のため使用不可である。

大文字の `Type` は可能。

```go
type Person struct {
	// 定義不可エラー
	type string

	// 定義可能
	Type string
}
```

<br>

### 初期化

すでに値が代入されている構造体を初期化する場合、いくつか記法がある。

そのなかでは、タグ付きリテラルが推奨である。

初期化によって作成する構造体は、ポインタ型または非ポインタ型のいずれでも問題ない。

ただし、多くの関数がポインタ型を引数型としていることから、それに合わせてポインタ型を作成することが多い。

まずは、タグ付きリテラル表記。

```go
package main

import "log"

type Person struct {
	Name string
}

func main() {
	person := &Person{
		// タグ付きリテラル表記
		Name: "Hiroki",
	}

	log.Printf("%v", person.Name) // "Hiroki"
}
```

2 つ目に、タグ無しリテラル表記がある。

```go
package main

import "log"

type Person struct {
	Name string
}

func main() {
	person := &Person{
		// タグ無しリテラル表記
		"Hiroki",
	}

	log.Printf("%v", person.Name) // "Hiroki"
}
```

`3` 個目に、`new()` 関数とデータ代入による初期化がある。

`new()` 関数は、データが代入されていない構造体を作成するため、リテラル表記時でも表現できる。

`new()` 関数は、構造体以外のデータ型でも使用できる。

ポインタ型の構造体を返却する。

```go
package main

import "log"

type Person struct {
	Name string
}

/**
 * 型のコンストラクタ
 * ※スコープはパッケージ内のみとする。
 */
func newPerson(name string) *Person {
    // new関数を使用する。
    // &Person{} に同じ。
	person := new(Person)

    // ポインタ型の初期化された構造体が返却される。
	log.Printf("%v", person) // &main.Person{Name:""}

	// フィールドに代入する
	person.Name = name

	return person
}

func main() {
	person := newPerson("Hiroki")
	log.Printf("%v", person.Name) // "Hiroki"
}
```

<br>

### DI (依存性注入、依存オブジェクト注入)

構造体のフィールドとして構造体を保持することにより、依存関係を構成する。

依存される側をサプライヤー、また依存する側をクライアントという。

構造体間に依存関係を構成するには、クライアントにサプライヤーを注入する。

注入方法には、『コンストラクタインジェクション』『セッターインジェクション』『セッターインジェクション』がある。

詳しくは、以下のリンクを参考にせよ。

```go
package main

import (
	"fmt"
	"log"
)

//========================
// サプライヤー側
//========================
type Name struct {
	FirstName string
	LastName  string
}

func NewName(firstName string, lastName string) *Name {

	return &Name{
		FirstName: firstName,
		LastName:  lastName,
	}
}

func (n *Name) fullName() string {
	return fmt.Sprintf("%s %s", n.FirstName, n.LastName)
}

//========================
// クライアント側
//========================
type Person struct {
	Name *Name
}

func NewPerson(name *Name) *Person {
	return &Person{
		Name: name,
	}
}

func (p *Person) getName() *Name {
	return p.Name
}

func main() {
	name := NewName("Hiroki", "Hasegawa")

	// コンストラクタインジェクションによるDI
	person := NewPerson(name)

	log.Printf("%v", person.getName().fullName()) // "Hiroki Hasegawa"
}
```

<br>

### 埋め込みによる委譲

Go には継承がなく、代わりに委譲がある。

構造体のフィールドとして別の構造体を埋め込むことにより、埋め込まれた構造体に処理を委譲する。

委譲する側の構造体を宣言するのみでなく、フィールドとして渡す必要がある。

このとき、実装者が委譲を意識しなくてよくなるように、コンストラクタのなかで初期化する。

インターフェースの委譲とは異なり、アップキャストは行えない。

つまり、委譲された構造体は委譲する構造体のデータ型にキャストでき、同じデータ型として扱えない。

```go
package main

import (
	"fmt"
	"log"
)

//========================
// 委譲する側 (埋め込む構造体)
//========================
type Name struct {
	FirstName string
	LastName  string
}

func (n *Name) fullName() string {
	return fmt.Sprintf("%s %s", n.FirstName, n.LastName)
}

//========================
// 委譲される側 (埋め込まれる構造体)
//========================
type MyName struct {
	*Name
}

func NewMyName(firstName string, lastName string) *MyName {
	return &MyName{
		// コンストラクタ内で委譲する構造体を初期化する。
		Name: &Name{
			FirstName: firstName,
			LastName:  lastName,
		},
	}
}

//================
// main
//================
func main() {
	myName := NewMyName("Hiroki", "Hasegawa")

	// myName構造体は、Name構造体の関数をコールできる。
	log.Printf("%v", myName.fullName()) // "Hiroki Hasegawa"
}
```

もし、委譲する側と委譲される側に、同じ名前の関数/フィールドが存在する場合は、委譲された側のものが優先してコールされる。

```go
package main

import (
	"fmt"
	"log"
)

//========================
// 委譲する側 (埋め込む構造体)
//========================
type Name struct {
	FirstName string
	LastName  string
}

func (n *Name) fullName() string {
	return fmt.Sprintf("%s %s", n.FirstName, n.LastName)
}

//========================
// 委譲される側 (埋め込まれる構造体)
//========================
type MyName struct {
	*Name
}

func NewMyName(firstName string, lastName string) *MyName {
	return &MyName{
		// コンストラクタ内で委譲する構造体を初期化する。
		Name: &Name{
			FirstName: firstName,
			LastName:  lastName,
		},
	}
}

// 委譲する側と委譲される側で同じ関数
func (n *MyName) fullName() string {
	return fmt.Sprintf("%s", "委譲された構造体です")
}

//================
// main
//================
func main() {
	myName := NewMyName("Hiroki", "Hasegawa")

	// 同じ関数がある場合、委譲された側が優先。
	log.Printf("%v", myName.fullName()) // "委譲された構造体です"
}
```

<br>

### 無名構造体

構造体の定義と初期化を同時に実行する。

構造体に名前がなく、データ型を割り当てられないため、返却値としては使用できないことに注意する。

```go
package main

import "log"

type Person struct {
	Name string
}

func main() {
	person := &struct {
		Name string
	}{
		// タグ付きリテラル表記 (タグ無しリテラル表記も可能)
		Name: "Hiroki",
	}

	log.Printf("%v", person.Name) // "Hiroki"
}
```

<br>

## 02. インターフェース

### 委譲

#### ▼ 暗黙的に実装する

インターフェースを満たす関数を構造体に紐付けると、インターフェースを暗黙的に実装した構造体を作成できる。

構造体の委譲とは異なり、アップキャストを行える。

つまり、委譲された構造体は委譲するインターフェースのデータ型にキャストでき、同じデータ型として扱える。

InspectImpl 構造体に Animal インターフェースを埋め込み、構造体に `Eat()` 関数、`Sleep()` 関数、`Mating()` 関数の処理を委譲する。

```go
package main

import (
	"fmt"
	"log"
)

// インターフェースとその関数を定義する。
type AnimalInterface interface {
	Name() string
	Eat() string
	Sleep() string
}

type InsectImpl struct {
	name string
}

type FishImpl struct {
	name string
}

type MammalImpl struct {
	name string
}

// コンストラクタ
func NewInsect(name string) (*InsectImpl, error) {
	return &InsectImpl{
		name: name,
	}, nil
}

// インターフェースを満たす関数 (ここでいうName、Eat、Sleep) を構造体に紐付ける
// インターフェースを暗黙的に実装した構造体を作成できる
func (i *InsectImpl) Name() string {
	return i.name
}

func (i *InsectImpl) Eat() string {
	return "食べる"
}

func (i *InsectImpl) Sleep() string {
	return "眠る"
}

func main() {
	insect, err := NewInsect("カブトムシ")

	if err != nil {
		log.Printf("Failed to do something: %v", err)
		return
	}

	// 関数を実行する。
	fmt.Println(insect.Name())
	fmt.Println(insect.Eat())
	fmt.Println(insect.Sleep())
}
```

> - [【Golang】Goでインターフェースを実装する方法3選](https://zenn.dev/koudai/articles/27f8f64d45c795#%E3%82%84%E3%82%8A%E6%96%B9%E3%81%9D%E3%81%AE1%3A-%E6%9D%A1%E4%BB%B6%E3%82%92%E5%85%A8%E3%81%A6%E6%BA%80%E3%81%9F%E3%81%99)

#### ▼ インターフェースを構造体に埋め込む

構造体のフィールドとして別のインターフェースを埋め込むことにより、埋め込まれた構造体に処理のすべてを委譲する。

> - [【Golang】Goでインターフェースを実装する方法3選](https://zenn.dev/koudai/articles/27f8f64d45c795#%E3%82%84%E3%82%8A%E6%96%B9%E3%81%9D%E3%81%AE2%3A-%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E3%82%92%E6%A7%8B%E9%80%A0%E4%BD%93%E3%81%AB%E5%9F%8B%E3%82%81%E8%BE%BC%E3%82%80)

#### ▼ インターフェースを実装する構造体を構造体に埋め込む

> - [【Golang】Goでインターフェースを実装する方法3選](https://zenn.dev/koudai/articles/27f8f64d45c795#%E3%82%84%E3%82%8A%E6%96%B9%E3%81%9D%E3%81%AE3%3A-%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E3%82%92%E6%BA%80%E3%81%9F%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E6%A7%8B%E9%80%A0%E4%BD%93%E3%82%92%E5%9F%8B%E3%82%81%E8%BE%BC%E3%82%80)

<br>

### アップキャストの可否を利用した検証

もし、構造体で実装された関数に不足があると、委譲が自動的に取り消される。

エラーは発生しないため、実装された関数が十分であることを実装者が知らなければならない。

アップキャストの可否を使用して、意図的にエラーを発生させるテクニックがある。

> - [guide/style.md at master · uber-go/guide · GitHub](https://github.com/uber-go/guide/blob/master/style.md#verify-interface-compliance)

```go
package main

import (
	"fmt"
	"log"
)

// アップキャストの可否を使用して、構造体がインターフェースを満たしているを検証する。
var _ AnimalInterface = &InsectImpl{} // もしくは (*InsectImpl)(nil)

// インターフェースとその関数を定義する。
type AnimalInterface interface {
	Name() string
	Eat() string
}

type InsectImpl struct {
	name string
}

// コンストラクタ
func NewInsect(name string) (*InsectImpl, error) {
	return &InsectImpl{
		name: name,
	}, nil
}

// 構造体に関数を紐付ける。インターフェースを暗黙的に実装する。
func (i *InsectImpl) Name() string {
	return i.name
}

func main() {
	insect, err := NewInsect("カブトムシ")

	if err != nil {
		log.Printf("Failed to do something: %v", err)
		return
	}

	// 関数を実行する。
	fmt.Println(insect.Name())
}
```

```bash
# Eat関数を紐付けていない場合
cannot use insect (type Insect) as type Animal in assignment:
Insect does not implement Animal (missing Eat method)
```

<br>

### 緩い型としてのインターフェース

さまざまな値をインターフェース型として定義できる。

エイリアスとして、`any` 型でも定義できる。

また、他の型に変換もできる。

```go
package main

import "log"

func main() {
	var foo interface{}

	foo = 1
	log.Printf("%v", foo) // 1

	foo = 3.14
	log.Printf("%v", foo) // 3.14

	foo = "Hiroki"
	log.Printf("%v", foo) // "Hiroki"

	foo = [...]uint8{1, 2, 3, 4, 5}
	log.Printf("%v", foo) // [5]uint8{0x1, 0x2, 0x3, 0x4, 0x5}
}
```

注意点として、インターフェース型は演算できない。

```go
package main

import "log"

func main() {
	var foo, bar interface{}

	// インターフェース型
	foo, bar = 1, 2
	log.Printf("%v", foo) // 1
	log.Printf("%v", bar) // 2

	// エラーになってしまう。
	// invalid operation: foo + bar (operator + not defined on interface)
	baz := foo + bar

	log.Printf("%v", baz)
}
```

> - [Go 1.18 で interface{} の代わりに any が使えるようになる話](https://zenn.dev/syumai/articles/c6q5un1j0msim0aj0ca0)

<br>

### 型アサーション

インターフェース型を他の型に変換する。

インターフェース型の変数で『`.(データ型)`』を宣言する。

```go
package main

import "log"

func main() {
	var foo, bar interface{}

	// インターフェース型
	foo, bar = 1, 2

	// インターフェース型からinteger型に変換 (変換しないと演算できない)
	fooInt := foo.(int)
	barInt := bar.(int)
	baz := fooInt + barInt

	log.Printf("%v", baz)
}
```

<br>

### error インターフェース

Go には、標準搭載されているインターフェースがある。

このインターフェースが強制する関数を実装した構造体を定義すると、自動的に委譲する。

```go
type error interface {
    Error() string
}
```

<br>

### string インターフェース

構造体に `String()` 関数を定義しておくと、Print 系関数に構造体を渡したときに、これが実行される。

```go
package main

import "fmt"

type Foo struct{}

func (f *Foo) String() string {
	return "String関数を実行しました。"
}

func main() {
	f := &Foo{}
	fmt.Println(f)
}
```

<br>

