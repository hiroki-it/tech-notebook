---
title: 【IT技術の知見】メソッド/データ@Go
description: メソッド/データ@Goの知見を記録しています。
---

# メソッド/データ@Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. データ型

### データ型の種類

#### ▼ データ型の初期値

データ型には、値が代入されていない時、初期値が代入されている。

#### ▼ プリミティブ型に属するデータ型

| データ型 | 表記           | 初期値        |
| -------- | -------------- | ------------- |
| 数値     | `int`、`float` | `0`           |
| 文字列   | `string`       | `""` (空文字) |
| bool値   | `boolean`      | `false`       |

#### ▼ 合成型に属するデータ型

| データ型 | 表記     | 初期値 |
| -------- | -------- | ------ |
| 構造体   | `struct` |        |
| 配列     | `[i]`    |        |

#### ▼ 参照型に属するデータ型

| データ型 | 表記 | 初期値                    |
| -------- | ---- | ------------------------- |
| ポインタ | `*`  | `nil`                     |
| スライス | `[]` | `nil` (要素数、サイズ：0) |
| マップ   |      | `nil`                     |
| チャネル |      | `nil`                     |

<br>

### プリミティブ型のまとめ

#### ▼ プリミティブ型とは

**＊実装例＊**

```go
// 定義 (初期値として『0』が割り当てられる)
var number int

// 代入
number = 5
```

#### ▼ Defined Typeによる独自のプリミティブ型

Defined Typeを使用して、独自のプリミティブ型を定義する。

元のプリミティブ型とは互換性がなくなる。

**＊実装例＊**

integer型を元に、Age型を定義する。

```go
type Age int
```

**＊実装例＊**

パッケージの型を元に、MyAppWriter型を定義する。

```go
type MyAppWriter io.Writer
```

#### ▼ プリミティブ型とメモリの関係

プリミティブ型の変数を定義すると、データ型のバイト数に応じて、空いているメモリ領域に、変数が割り当てられる。

`1`個のメモリアドレス当たり`1`バイトに相当する。

![basic-variable_memory](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/basic-variable_memory.png)

#### ▼ 各データ型のサイズ

| データ型            | 型名       | サイズ(bit)  | 説明                         |
| ------------------- | ---------- | ------------ | ---------------------------- |
| int (符号付き整数)  | int8       | `8`          |                              |
|                     | int16      | `16`         |                              |
|                     | int32      | `32`         |                              |
|                     | int64      | `64`         |                              |
|                     | int        | `32` or `64` | 実装環境によって異なる。     |
| uint (符号なし整数) | uint8      | `8`          |                              |
|                     | uint16     | `16`         |                              |
|                     | unit32     | `32`         |                              |
|                     | uint64     | `64`         |                              |
|                     | uint       | `32` or `64` | 実装環境によって異なる。     |
| float (浮動小数点)  | float32    | `32`         |                              |
|                     | float64    | `64`         |                              |
| complex (複素数)    | complex64  | `64`         | 実部：float32、虚部：float32 |
|                     | complex128 | `128`        | 実部：float64、虚部：float64 |

<br>

### 構造体

#### ▼ 構造体とは

他の言語でいう『データのみを保持するオブジェクト』に相当する。

**＊実装例＊**

構造体を定義し、変数に代入する。

```go
var person struct {
    Name string
}
```

#### ▼ Defined Typeによる独自の構造体

Defined Typeを使用して、独自のデータ型の構造体を定義する。

フィールド名の頭文字を大文字にした場合は、パッケージ外からのアクセスをパブリックに、小文字にした場合はプライベートになる。

**＊実装例＊**

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

#### ▼ 使用不可のフィールド名

小文字の『`type`』は予約語のため使用不可である。

大文字の`Type`は可能。

```go
type Person struct {
	// 定義不可エラー
	type string

	// 定義可能
	Type string
}
```

#### ▼ 初期化

すでに値が代入されている構造体を初期化する場合、いくつか記法がある。

その中では、タグ付きリテラルが推奨される。

初期化によって作成する構造体は、ポインタ型または非ポインタ型のいずれでも問題ない。

ただし、多くの関数がポインタ型を引数型としていることから、それに合わせてポインタ型を作成することが多い。

**＊実装例＊**

まずは、タグ付きリテラル表記。

```go
package main

import "fmt"

type Person struct {
	Name string
}

func main() {
	person := &Person{
		// タグ付きリテラル表記
		Name: "Hiroki",
	}

	fmt.Printf("%#v\n", person.Name) // "Hiroki"
}
```

2つ目に、タグ無しリテラル表記がある。

```go
package main

import "fmt"

type Person struct {
	Name string
}

func main() {
	person := &Person{
		// タグ無しリテラル表記
		"Hiroki",
	}

	fmt.Printf("%#v\n", person.Name) // "Hiroki"
}
```

`3`個目に、`new`関数とデータ代入による初期化がある。

`new`関数は、データが代入されていない構造体を作成するため、リテラル表記時でも表現できる。

`new`関数は、構造体以外のデータ型でも使用できる。

ポインタ型の構造体を返却する。

```go
package main

import "fmt"

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
	fmt.Printf("%#v\n", person) // &main.Person{Name:""}

	// フィールドに代入する
	person.Name = name

	return person
}

func main() {
	person := newPerson("Hiroki")
	fmt.Printf("%#v\n", person.Name) // "Hiroki"
}
```

#### ▼ DI (依存性注入)

構造体のフィールドとして構造体を保持することにより、依存関係を構成する。

依存される側をサプライヤー、また依存する側をクライアントという。

構造体間に依存関係を構成するには、クライアントにサプライヤーを注入する。

注入方法には、『コンストラクタインジェクション』『セッターインジェクション』『セッターインジェクション』がある。

詳しくは、以下のリンクを参考にせよ。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/language/language_php_class_based.html

```go
package main

import "fmt"

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

	fmt.Printf("%#v\n", person.getName().fullName()) // "Hiroki Hasegawa"
}
```

#### ▼ 埋め込みによる委譲

Goには継承がなく、代わりに委譲がある。

構造体のフィールドとして別の構造体を埋め込むことにより、埋め込まれた構造体に処理を委譲する。

委譲する側の構造体を宣言するのみでなく、フィールドとして渡す必要がある。

この時、実装者が委譲を意識しなくて良くなるように、コンストラクタの中で初期化する。

インターフェースの委譲とは異なり、アップキャストは行えない。

つまり、委譲された構造体は委譲する構造体のデータ型にキャストでき、同じデータ型として扱えない。

**＊実装例＊**

```go
package main

import "fmt"

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

	// myName構造体は、Name構造体のメソッドをコールできる。
	fmt.Printf("%#v\n", myName.fullName()) // "Hiroki Hasegawa"
}
```

もし、委譲する側と委譲される側に、同じ名前のメソッド/フィールドが存在する場合は、委譲された側のものが優先してコールされる。

```go
package main

import "fmt"

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

// 委譲する側と委譲される側で同じメソッド
func (n *MyName) fullName() string {
	return fmt.Sprintf("%s", "委譲された構造体です")
}

//================
// main
//================
func main() {
	myName := NewMyName("Hiroki", "Hasegawa")

	// 同じメソッドがある場合、委譲された側が優先。
	fmt.Printf("%#v\n", myName.fullName()) // "委譲された構造体です"
}
```

#### ▼ 無名構造体

構造体の定義と初期化を同時に行う。

構造体に名前がなく、データ型を割り当てられないため、返却値としては使用できないことに注意する。

**＊実装例＊**

```go
package main

import "fmt"

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

	fmt.Printf("%#v\n", person.Name) // "Hiroki"
}
```

<br>

### JSON

#### ▼ JSONと構造体のマッピング

構造体とJSONの間でパースを実行する時、構造体の各フィールドと、JSONのキー名を、マッピングしておける。

**＊実装例＊**

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
)

type Person struct {
	Name string `json:"name"`
}

func main() {
	person := &Person{
		Name: "Hiroki",
	}

	byteJson, err := json.Marshal(person)

	if err != nil {
		log.Println("JSONエンコードに失敗しました。")
	}

	// エンコード結果を出力
	fmt.Printf("%#v\n", string(byteJson)) // "{\"Name\":\"Hiroki\"}"
}
```

#### ▼ omitempty

値が『`false`、`0`、`nil`、空配列、空slice、空map、空文字』の時に、JSONエンコードでこれを除外できる。

構造体を除外したい場合は、nilになりうるポインタ型としておく。

**＊実装例＊**

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
)

type Person struct {

	// false、0、nil、空配列、空slice、空map、空文字を除外できる。
	Id int `json:"id"`

	// 構造体はポインタ型としておく
	Name *Name `json:"name,omitempty"`
}

type Name struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

func main() {
	person := &Person{
		Id: 1, // Name構造体はnilにしておく
	}

	byteJson, err := json.Marshal(person)

	if err != nil {
		log.Println("JSONエンコードに失敗しました。")
	}

	// エンコード結果を出力
	fmt.Printf("%#v\n", string(byteJson)) // "{\"id\":1}"
}
```

<br>

### 配列

#### ▼ 配列とは

要素、各要素のメモリアドレス、からなるデータのこと。

![aggregate-type_array](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aggregate-type_array.png)

#### ▼ 宣言と代入

配列を宣言し、変数に代入する。

**＊実装例＊**

宣言と代入を別々に行う。

また、要素数の定義が必要である。

```go
package main

import "fmt"

func main() {

	var z [2]string
	z[0] = "Hiroki"
	z[1] = "Gopher"

	fmt.Printf("%#v\n", z) // [Hiroki Gopher]
	fmt.Printf("%#v\n", z) // [2]string{"Hiroki", "Gopher"}
}
```

宣言と代入を同時に行う。

また、要素数の定義が必要である。

```go
package main

import "fmt"

func main() {

	var y [2]string = [2]string{"Hiroki", "Gopher"}

	fmt.Printf("%#v\n", y) // [Hiroki Gopher]
	fmt.Printf("%#v\n", y) // [2]string{"Hiroki", "Gopher"}
}
```

宣言と代入を同時に行う。

また、型推論と要素数省略を行う。

```go
package main

import "fmt"

func main() {

	x := [...]string{"Hiroki", "Gopher"}

	fmt.Printf("%#v\n", x) // [Hiroki Gopher]
	fmt.Printf("%#v\n", x) // [2]string{"Hiroki", "Gopher"}
}
```

#### ▼ 配列とメモリの関係

配列型の変数を定義すると、空いているメモリ領域に、配列がまとまって割り当てられる。

`1`個のメモリアドレス当たり`1`バイトに相当する。

![array-variable_memory](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/array-variable_memory.png)

<br>

### ポインタ

#### ▼ ポインタ型とは

メモリアドレスを代入できるデータ型のこと。

#### ▼ 参照演算子 (`&`)

定義された変数に対して、& (アンパサンド) を宣言すると、メモリアドレスを参照できる。

参照したメモリアドレス値は、ポインタ型の変数に代入する必要があるが、型推論で記述すればこれを意識しなくて良い。

PHPにおけるポインタは、以下のリンクを参考にせよ。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/language/language_php_class_based_method_data.html

**＊実装例＊**

```go
package main

import "fmt"

func main() {
	x := "a"

	// メモリアドレスを参照する。
	var p *string = &x
	// p := &x と同じ

	// メモリアドレスを参照する前
	fmt.Printf("%#v\n", x) // "a"

	// メモリアドレスを参照した後
	fmt.Printf("%#v\n", p) // (*string)(0xc0000841e0)
}
```

#### ▼ 間接参照演算子 (`*`)

ポインタ型の変数に対してアスタリスクを宣言すると、メモリアドレスに割り当てられているデータの実体を取得できる。

ポインタを使用してデータの実体を取得することを『逆参照 (デリファレンス) 』という。

```go
package main

import "fmt"

func main() {

	x := "a"

	p := &x

	// メモリアドレスの実体を取得する (デリファレンス) 。
	y := *p

	// メモリアドレスを参照する前
	fmt.Printf("%#v\n", x) // "a"

	// メモリアドレスを参照した後
	fmt.Printf("%#v\n", p) // (*string)(0xc0000841e0)

	// メモリアドレスに割り当てられたデータ
	fmt.Printf("%#v\n", y) // "a"
}
```

#### ▼ ポインタ型で扱うべきデータ型

| データ型                | ポインタ型で扱うべきか | 説明                                                                                                                                           |
| ----------------------- | :--------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 構造体                  |          ⭕️           | ポインタ型として扱うと、構造体が持つメモリアドレスを処理するのみでよくなる。ポインタ型としない場合と比べて、少ないメモリ消費で構造体を扱える。 |
| slice、map、chan、 func |           △            | データサイズの大きさによる。                                                                                                                   |
| プリミティブ型          |           ×️           | ポインタ型で扱うメリットはない。                                                                                                               |

<br>

### スライス

#### ▼ スライスとは

参照先の配列に対するポインタ、長さ、サイズを持つデータ型である。

![reference-types_slice](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/reference-types_slice.png)

```go
// Goのコードより
type slice struct {
	array unsafe.Pointer
	len   int
	cap   int
}
```

> ↪️ 参考：https://github.com/golang/go/blob/04a4dca2ac3d4f963e3c740045ce7a2959bf0319/src/runtime/slice.go#L13-L17

#### ▼ 宣言と代入

**＊実装例＊**

宣言と代入を同時に行う。

```go
package main

import "fmt"

func main() {

	var y []string = []string{"Hiroki", "Gopher"}

	fmt.Printf("%+v\n", y) // [Hiroki Gopher]
	fmt.Printf("%#v\n", y) // []string{"Hiroki", "Gopher"}
}
```

文字列の宣言と代入を同時に行う。

また、型推論を行う。

```go
package main

import "fmt"

func main() {

	x := []string{"Hiroki", "Gopher"}

	fmt.Printf("%+v\n", x) // [Hiroki Gopher]
	fmt.Printf("%#v\n", x) // []string{"Hiroki", "Gopher"}
}
```

バイト文字列の宣言と代入を同時に行う。

また、型推論を行う。

```go
package main

import "fmt"

func main() {
	x := []byte("abc")

	fmt.Printf("%+v\n", x) // [97 98 99]
	fmt.Printf("%#v\n", x) // []byte{0x61, 0x62, 0x63}
}
```

構造体のスライスの宣言と代入を同時に行う。

また、型推論を行う。

```go
package main

import "fmt"

type Person struct {
	Name string
}

func main() {
	person := []Person{{ Name: "Hiroki" }}

	fmt.Printf("%+v\n", person) // [{Name:Hiroki}]
	fmt.Printf("%#v\n", person) // []main.Person{main.Person{Name:"Hiroki"}}
}
```

#### ▼ 配列の値の参照

全てのスライスが共通の配列を参照しているため、例えば、`xb`変数しか上書きしていないのにも関わらず、他のスライスにもその上書きが反映される。

```go
package main

import "fmt"

func main() {
	// 最後の要素の後にもカンマが必要である。
	x := [5]string{"あ", "い", "う", "え", "お"}
	fmt.Printf("%#v\n", x) // [5]string{"あ", "い", "う", "え", "お"}

    // 0から3番目を参照する。
	xa := x[0:3]
	fmt.Printf("%#v\n", xa) // []string{"あ", "い", "う"}

    // 2から5番目を参照する。
	xb := x[2:5]
	fmt.Printf("%#v\n", xb) // []string{"う", "え", "お"}

	// xbスライスの0番目 ("う") を上書きする。
	xb[0] = "Hiroki"

	// xbしか上書きしていないが、他のスライスにも反映される。
	fmt.Printf("%#v\n", xa) // []string{"あ", "い", "Hiroki"}
	fmt.Printf("%#v\n", xb) // []string{"Hiroki", "え", "お"}
	fmt.Printf("%#v\n", x)  // [5]string{"あ", "い", "Hiroki", "え", "お"}
}
```

#### ▼ 要素の追加

渡されたスライスで、後ろから要素を追加する。

```go
package main

import (
	"fmt"
)

func main() {
	s := []int{10, 20, 30, 40}
	fmt.Println(s) // [10 20 30 40]

	// 要素を追加。
	s = append(s, 50, 60, 70, 80)
	fmt.Println(s) // [10 20 30 40 50 60 70 80]
}
```

<br>

### マップ

#### ▼ 単一のプリミティブ型を値に持つマップ

マップの定義と代入を同時に行う。

```go
package main

import "fmt"

func main() {
	// 『数値:文字列』のマップ
	m := map[int]string{
		0: "Hiroki",
		1: "Hiroko",
		2: "Hiroshi",
	}

	fmt.Println(m) // map[0:Hiroki 1:Hiroko 2:Hiroshi]
}
```

定義と代入を別々に行う。

```go
package main

import "fmt"

func main() {
	// 『数値:文字列』のマップ
	m := map[int]string{}

	m[0] = "Hiroki"
	m[1] = "Hiroshi"
	m[2] = "Hiroshi"

	fmt.Println(m) // map[0:Hiroki 1:Hiroko 2:Hiroshi]
}

```

または、`make`関数を使用してマップを作成もできる。

```go
package main

import "fmt"

func main() {
	// 『数値:文字列』のマップ
	m := make(map[int]string)

	m[0] = "Hiroki"
	m[1] = "Hiroshi"
	m[2] = "Hiroshi"

	fmt.Println(m) // map[0:Hiroki 1:Hiroko 2:Hiroshi]
}
```

#### ▼ スライス型を値に持つマップ

```go
package main

import (
	"fmt"
)

func main() {
	// 『文字列:スライス』のマップ
	m := map[string][]string{
		"errors": {
			0: "エラーメッセージ0",
			1: "エラーメッセージ1",
			2: "エラーメッセージ2",
		},
	}

	fmt.Println(m) // map[errors:[エラーメッセージ0 エラーメッセージ1 エラーメッセージ2]]
}
```

#### ▼ 複数のデータ型を持つマップ

マップ型データの値をインターフェース型とすることにより、複数のデータ型を表現できる。

```go
package main

import "fmt"

func main() {
	// 『文字列:複数のプリミティブ型』のマップ
	m := map[string]interface{}{
		"id":   1,
		"name": "Hiroki Hasegawa",
	}

	fmt.Println(m) // map[id:1 name:Hiroki Hasegawa]
}

```

#### ▼ マップ値の抽出

```go
package main

import "fmt"

func main() {
	m := map[int]string{
		1: "Hiroki",
		2: "Hiroko",
		3: "Hiroshi",
	}

	// 値の抽出
	v, ok := m[1]

	// エラーハンドリング
	if ok != true {
		fmt.Println("Value is not found.") // Value is not found.
	}

	fmt.Println(v) // Hiroki
}
```

<br>

### インターフェース

#### ▼ 埋め込みによる委譲

構造体のフィールドとして別のインターフェースを埋め込むことにより、埋め込まれた構造体に処理の全てを委譲する。

ただし、構造体に明示的にインターフェースを埋め込む必要はなく、インターフェースを満たす関数を構造体に紐付けると、インターフェースを暗黙的に実装できる。

構造体の委譲とは異なり、アップキャストを行える。

つまり、委譲された構造体は委譲するインターフェースのデータ型にキャストでき、同じデータ型として扱える。

**＊実装例＊**

InspectImpl構造体にAnimalインターフェースを埋め込み、構造体に`Eat`メソッド、`Sleep`メソッド、`Mating`メソッド、の処理を委譲する。

```go
package main

import "fmt"

// インターフェースとそのメソッドを定義する。
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

// 構造体に関数を紐付ける。インターフェースを暗黙的に実装する。
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
		fmt.Println(err)
	}

	// メソッドを実行する。
	fmt.Println(insect.Name())
	fmt.Println(insect.Eat())
	fmt.Println(insect.Sleep())
}
```

#### ▼ アップキャストの可否を利用した検証

もし、構造体に実装されたメソッドに不足があると、委譲が自動的に取り消される。

エラーは発生しないため、実装されたメソッドが十分であることを実装者が知らなければならない。

アップキャストの可否を使用して、意図的にエラーを発生させるテクニックがある。

> ↪️ 参考：https://github.com/uber-go/guide/blob/master/style.md#verify-interface-compliance

```go
package main

import "fmt"

// アップキャストの可否を使用して、構造体がインターフェースを満たしているを検証する。
var _ AnimalInterface = &InsectImpl{} // もしくは (*InsectImpl)(nil)

// インターフェースとそのメソッドを定義する。
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
		fmt.Println(err)
	}

	// メソッドを実行する。
	fmt.Println(insect.Name())
}
```

```bash
# Eatメソッドを紐付けていない場合
cannot use insect (type Insect) as type Animal in assignment:
Insect does not implement Animal (missing Eat method)
```

#### ▼ 緩い型としてのインターフェース

様々な値をインターフェース型として定義できる。

また、他の型に変換もできる。

**＊実装例＊**

```go
package main

import (
	"fmt"
)

func main() {
	var foo interface{}

	foo = 1
	fmt.Printf("%#v\n", foo) // 1

	foo = 3.14
	fmt.Printf("%#v\n", foo) // 3.14

	foo = "Hiroki"
	fmt.Printf("%#v\n", foo) // "Hiroki"

	foo = [...]uint8{1, 2, 3, 4, 5}
	fmt.Printf("%#v\n", x) // [5]uint8{0x1, 0x2, 0x3, 0x4, 0x5}
}
```

注意点として、インターフェース型は演算できない。

```go
package main

import (
	"fmt"
)

func main() {
	var foo, bar interface{}

	// インターフェース型
	foo, bar = 1, 2
	fmt.Printf("%#v\n", foo) // 1
	fmt.Printf("%#v\n", bar) // 2

	// エラーになる。
	// invalid operation: foo + bar (operator + not defined on interface)
	baz := foo + bar

	fmt.Printf("%#v\n", baz)
}
```

#### ▼ 型アサーション

インターフェース型を他の型に変換する。

インターフェース型の変数で『`.(データ型)`』を宣言する。

```go
package main

import (
	"fmt"
)

func main() {
	var foo, bar interface{}

	// インターフェース型
	foo, bar = 1, 2

	// インターフェース型からinteger型に変換 (変換しないと演算できない)
	a := x.(int)
	b := y.(int)
	z := a + b

	fmt.Printf("%#v\n", z)
}
```

#### ▼ errorインターフェース

Goには、標準搭載されているインターフェースがある。

このインターフェースが強制するメソッドを実装した構造体を定義すると、自動的に委譲が行われる。

**＊例＊**

```go
type error interface {
    Error() string
}
```

#### ▼ stringインターフェース

構造体に`String`メソッドを定義しておくと、Print系関数に構造体を渡した時に、これが実行される。

**＊実装例＊**

```go
package main

import "fmt"

type Foo struct{}

func (f *Foo) String() string {
	return "Stringメソッドを実行しました。"
}

func main() {
	f := &Foo{}
	fmt.Println(f)
}
```

<br>

### nil

#### ▼ nilとは

いくつかのデータ型における初期値のこと。

#### ▼ ポインタの場合

**＊実装例＊**

```go
package main

import "fmt"

func main() {

	x := "x"

	// ポインタ型の定義のみ
	var p1 *string

	// ポインタ型の変数を定義代入
	var p2 *string = &x

	fmt.Printf("%#v\n", p1) // (*string)(nil)
	fmt.Printf("%#v\n", p2) // (*string)(0xc0000841e0)
}
```

#### ▼ インターフェースの場合

**＊実装例＊**

```go
package main

import "fmt"

func main() {
	var foo interface{}

	fmt.Printf("%#v\n", foo) // <nil>
}
```

<br>

## 02. 関数

### main関数

#### ▼ `main`関数とは

goのエントリーポイントとなる。

goのプログラムが起動した時に、各パッケージの`init`関数が実行された後、`main`関数が実行される。

`main`関数をビルド対象に指定すると、これを開始点として読み込まれるファイルが枝分かれ状にビルドされていく。

ステータス『0』でプロセスを終了する。

**＊実装例＊**

```go
package main

import "fmt"

func main() {
	fmt.Printf("%#v\n", "Hello world!")
}
```

当然、`main`パッケージや`main`関数が無いと、goのプログラムの起動時にエラーが発生する。

```bash
$ go run server.go

go run: cannot run non-main package
```

```bash
$ go run server.go

# command-line-arguments
runtime.main: call to external function main.main
runtime.main: main.main: not defined
runtime.main: undefined: main.main
```

<br>

### 独自関数

#### ▼ 関数とは

構造体に紐付けられていない関数のこと。

**＊実装例＊**

```go
package main

import "fmt"

// 頭文字を大文字する
func Foo(foo string) string {
	fmt.Println(foo)
}

func main() {
	Foo("Hello world!")
}
```

#### ▼ 引数の型

引数の型として、構造体の場合はポインタ型、それ以外のデータの場合はポインタ型以外が推奨される。

> ↪️ 参考：https://github.com/golang/go/wiki/CodeReviewComments#pass-values

#### ▼ Closure (無名関数) とは

名前のない関数のこと。

#### ▼ 即時関数とは

定義したその場でコールされる無名関数のこと。

**＊実装例＊**

main関数で即時関数を実行する。

```go
package main

import "fmt"

func main() {
	result := func() string {
		return "Closure is working!"
	}()

	fmt.Printf("%#v\n", result)
}
```

**＊実装例＊**

即時関数に引数を設定できる。

その場合、仮引数と引数の両方を設定する必要がある。

```go
package main

import "fmt"

func main() {
	// 仮引数を設定
	result := func(x string) string {

		return x

	}("Closure is working!") // 引数に値を渡す

	fmt.Printf("%#v\n", result)
}
```

<br>

### メソッド

#### ▼ メソッドとは

データ型や型リテラルに紐付けられている関数のこと。

Goは、言語としてオブジェクトという機能を持っていないが、構造体に関数を紐付けることにより、擬似的にオブジェクトを表現できる。

#### ▼ レシーバによる紐付け

データ型や型リテラルなどを関数のレシーバとして渡すことによって、それに関数を紐付けられる。

紐付け後、関数はメソッドと呼ばれるようになる。

メソッド名とフィールド名に同じ名前は使用できない。

**＊実装例＊**

integer型を値レシーバとして渡し、構造体に関数を紐付ける。

```go
package main

import "fmt"

type Age int

func (a Age) PrintAge() string {
    return fmt.Sprintf("%dです。", a)
}

func main() {
    var age Age = 20

    fmt.Printf("%#v\n", age.printAge())
}
```

**＊実装例＊**

構造体を値レシーバとして渡し、構造体に関数を紐付ける。

```go
package main

import "fmt"

// 構造体を定義
type Person struct {
	name string
}

// コンストラクタ
func NewPerson(name string) *Person {
	return &Person{
		name: name,
	}
}

// 構造体に関数を紐付ける。
func (p Person) GetName() string {
	return p.name
}

// 構造体から関数をコール
func main() {
	// 構造体を初期化
	person := NewPerson("Hiroki")

	fmt.Printf("%#v\n", person.GetName()) // "Hiroki"
}
```

#### ▼ 値レシーバ

構造体の実体と関数を直接的に紐付ける。

紐付け後、関数はメソッドと呼ばれるようになる。

レシーバとして渡された引数をメソッド内でコピーしてから使用する。

値レシーバによって紐付けられると、そのメソッドは構造体の状態を変えられなくなるため、構造体をイミュータブルにしたい場合は、値レシーバを使用すると良い。

**＊実装例＊**

構造体を値レシーバとして渡し、構造体に関数を紐付ける。

```go
package main

import "fmt"

type Person struct {
	name string
}

// コンストラクタ
func NewPerson(name string) *Person {
	return &Person{
		name: name,
	}
}

// 値レシーバ
func (p Person) SetName(name string) {
	// 引数の構造体をコピーしてから使用
	p.name = name
}

func (p Person) GetName() string {
	return p.name
}

func main() {
	person := NewPerson("Gopher")

	person.SetName("Hiroki")

	fmt.Printf("%#v\n", person.GetName()) // "Gopher"
}
```

#### ▼ ポインタレシーバ

構造体のポインタを使用して、関数と構造体の実体を紐付ける。

紐付け後、関数はメソッドと呼ばれるようになる。

レシーバとして渡された引数をメソッド内でそのまま使用する。

ポインタレシーバによって紐付けられると、そのメソッドは構造体の状態を変えられるようになるため、構造体をミュータブルにしたい場合は、ポインタレシーバを使用すると良い。

構造体を初期化する処理を持つコンストラクタ関数のみをポインタレシーバとし、他のメソッドを全て値レシーバとすると、最低限にミュータブルなプログラムを実装できる。

また、構造体はポインタ型として扱った方がメモリを節約できる。

**＊実装例＊**

```go
package main

import "fmt"

type Person struct {
	Name string
}

// ポインタレシーバ
func (p *Person) SetName(name string) {
    // 引数の構造体をそのまま使用
	p.Name = name
}

func (p *Person) GetName() string {
    return p.Name
}

func main() {
	person := Person{Name: "Gopher"}

	person.SetName("Hiroki")

	fmt.Printf("%#v\n", person.GetName()) // "Hiroki"
}
```

<br>

### defer関数

#### ▼ defer関数とは

全ての処理の最後に必ず実行される遅延実行関数のこと。

たとえ、ランタイムエラーのように処理が強制的に途中終了しても実行される。

**＊実装例＊**

即時関数をdefer関数化している。

処理の最後にランタイムエラーが発生したとき、これを`recover`メソッドで吸収できる。

```go
package main

import "fmt"

func main() {
	fmt.Println("Start")

	// あらかじめdefer関数を定義しておく
	defer func() {
		err := recover()

		if err != nil {
			fmt.Printf("Recover: %#v\n", err)
		}

		fmt.Println("End")
	}()

	// ここで意図的に処理を停止させている。
	panic("Runtime error")
}

// Start
// Recover: "Runtime error"
// End
```

#### ▼ 複数のdefer関数

deferは複数の関数で宣言できる。

複数宣言した場合、後に宣言されたものから実行される。

**＊実装例＊**

```go
package main

import "fmt"

func main() {
    defer fmt.Println("1")
    defer fmt.Println("2")
    defer fmt.Println("3")
}

// 3
// 2
// 1
```

<br>

### 返却値

#### ▼ 複数の返却値

**＊実装例＊**

```go
package main

import "fmt"

func division(x int, y int) (int, int) {

	// 商を計算する。
	quotient := x / y

	// 余りを計算する。
	remainder := x % y

	// 商と余りを返却する。
	return quotient, remainder
}

func main() {
	// 10÷3を計算する。
	q, r := division(10, 3)
	fmt.Printf("商=%d、余り=%d", q, r)
}
```

#### ▼ 返却値の破棄

関数から複数の値が返却される時、使用しない値をアンダースコアに代入することにより、これを破棄できる。

**＊実装例＊**

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    // errorインターフェースを破棄
    file, _ := os.Open("filename.txt")

    // エラーキャッチする必要がなくなる
    fmt.Printf("%#v\n", flle)
}
```

<br>

## 04. 変数

### 定義 (宣言+代入)

#### ▼ 明示的な定義

**＊実装例＊**

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

**＊実装例＊**

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

ただし、複数の変数を宣言する時に、いずれかに新しい変数の宣言が含まれていれば、既存の変数を宣言したとしても、代入のみが実行される。

**＊実装例＊**

```go
package main

import (
	"fmt"
)

func main() {
	x := 1

	// 新しい変数の宣言が含まれている
	foo, bar := 2, 3

	fmt.Printf("%#v\n", x) // 2
	fmt.Printf("%#v\n", y) // 3
}
```

<br>

### 定義位置の種類

#### ▼ パッケージ変数

関数の外部で定義された変数のこと。

スコープとして、宣言されたパッケージ外部でも使用できる。

**＊実装例＊**

パッケージ変数を宣言し、関数内で値を代入する。

```go
package main

import (
    "fmt"
)

// パッケージ変数
var text string

func main() {
    text = "Hello World!"
    fmt.Printf("%#v\n", text)
}
```

変数に対する代入は関数内でしかできないため、宣言と代入を同時に行う型推論を使用するとエラーになる。

```go
package main

import (
    "fmt"
)

// エラーになる。
text := "Hello World!"

func main() {
    fmt.Printf("%#v\n", text)
}
```

#### ▼ ローカル変数

関数の内部で定義された変数のこと。

スコープとして、宣言されたパッケージ内部でしか使用できない。

**＊実装例＊**

```go
package main

import (
    "fmt"
)

func main() {
    // ローカル変数
    text := "Hello World!"
    fmt.Printf("%#v\n", text)
}
```

<br>

## 03. スコープ

### 変数、定数

#### ▼ パッケージ内外から参照可能

変数名または定数名の頭文字を大文字すると、パッケージ内外でこれをコールできるようになる。

**＊実装例＊**

```go
package foo

// 定数を定義する。
const (
	X  = "X"
)
```

```go
package main

import (
    "fmt"
)

func main() {
    fmt.Printf("%#v\n", foo) // foo
}
```

#### ▼ パッケージ内のみ参照可能

変数名または定数名の頭文字を小文字すると、パッケージ外でこれをコールできなくなる。

**＊実装例＊**

```go
package main

import (
    "fmt"
)

// 定数を定義する。
const (
	yZ = "yZ"
)

func main() {
    fmt.Printf("%#v\n", yZ) // yZ
}
```

<br>

### 関数

#### ▼ パッケージ内外から参照可能

関数名の頭文字を大文字すると、パッケージ内外でこれをコールできるようになる。

**＊実装例＊**

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

**＊実装例＊**

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

## 04. 制御文

### 配列またはスライスの走査

#### ▼ `for ... range`

配列またはスライスを走査する。

PHPの`foreach`に相当する。

```go
package main

import (
	"fmt"
)

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

## 05. 処理の種類

### 同期処理

#### ▼ 同期処理とは

前の処理を待って、次の処理を開始する。

**＊実装例＊**

```go
package main

import "fmt"

func main() {
	fmt.Println("1")
	fmt.Println("2")
	fmt.Println("3")
}

// 1
// 2
// 3
```

<br>

### 非同期処理 (並行処理)

#### ▼ 非同期処理 (並行処理) とは

前の処理の終了を待たずに次の処理を開始し、それぞれの処理が独立して終了する。

結果、終了する順番は順不同になる。

> ↪️ 参考：https://golang.org/pkg/sync/

**＊実装例＊**

```go

```

<br>

### 並列処理

#### ▼ 並列処理

指定した処理を同時に開始し、それぞれの処理が独立して完了する。

結果、完了する順番は順不同になる。

関数でGoルーチンを宣言すると、その関数のコールを並列化できる。

ただし、main関数はGoルーチン宣言された関数の完了を待たずに完了してしまうため、この関数の実行完了を待つようにする必要がある。

方法には、以下の`3`個がある。

#### ▼ channel

値を受信できるキューとして動作する。

キューに値を送信し、加えてキューから値を受信できる。

> ↪️ 参考：https://dev-yakuza.posstree.com/golang/channel/#%E3%83%81%E3%83%A3%E3%83%8D%E3%83%AB

```go
package main

import "fmt"

func main() {
	// チャンネルを作成
	channel := make(chan string)

	go func() {
		// チャンネルに値を送信する。
		channel <- "ping"
	}()

	// チャンネルから値を受信する。
	value := <-channel

	fmt.Println(value)
}
```

#### ▼ WaitGroup

1つまたは複数の関数でGoルーチンを宣言したい時に使用する。

**＊実装例＊**

並列処理により、反復処理を素早く完了できる。

実行完了に一秒かかる関数があると仮定する。

反復処理でこの関数をコールする場合、毎回の走査に一秒かかるため、反復の回数だけ秒数が増える。

しかし、Goルーチンを宣言し並列化することにより、各走査が全て並列に実行されるため、反復回数が何回であっても、一秒で処理が終了する。

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func print(key int, value string) {
	fmt.Println(key, value)
	time.Sleep(time.Second * 1) // 処理完了に一秒かかると仮定する。
}

func main() {
	wg := &sync.WaitGroup{}

	slice := []string{"a", "b", "c"}

	// 処理の開始時刻を取得
	start := time.Now()

	for key, value := range slice {

		wg.Add(1) // go routineの宣言の数

		// Goルーチンを宣言して並列化
		go func(key int, value string) {
			defer wg.Done()
			// 時間のかかる関数
			print(key, value)
		}(key, value)
	}

	// Add関数で指定した数のgo routineが実行されるまで待機
	wg.Wait()

	// 開始時刻から経過した秒数を取得
	fmt.Printf("経過秒数: %s", time.Since(start))
}

// 2 c
// 0 a
// 1 b
// 経過秒数: 1s
```

#### ▼ errgroup

エラー処理を含む関数でGoルーチンを宣言したい時に使用する。

#### ▼ select

チャンネルに対する格納を非同期で待機する。

> ↪️ 参考：
>
> - https://www.spinute.org/go-by-example/select.html
> - https://leben.mobi/go/channel-and-select/go-programming/

```go
package main

import (
    "fmt"
    "time"
)

func main() {

	// チャンネルを作成する。
    c1 := make(chan string)
    c2 := make(chan string)

	// ここに、完了タイミングのバラバラな処理があるとする。
    go func() {
		// 完了までに2秒かかるとする。
        time.Sleep(2 * time.Second)
		// 値を送信する。
        c1 <- "one"
    }()
    go func() {
		// 完了までに1秒かかるとする。
        time.Sleep(1 * time.Second)
		// 値を送信する。
        c2 <- "two"
    }()

    for i := 0; i < 2; i++ {
        select {
		// c1とc2の受信を非同期で待機し、受信した順番で処理する。
        case msg1 := <-c1:
            fmt.Println("received", msg1)
        case msg2 := <-c2:
            fmt.Println("received", msg2)
		// 受信が成功しなければ、defaultで処理する。
        default:
			fmt.Println("default")
		}
    }
}
```

<br>

## 06. エラーキャッチ、例外スロー

### Goにおけるエラーキャッチと例外スロー

#### ▼ 例外スローのある言語の場合

例外スローの意義は、以下の参考にせよ。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/language/language_php_logic_validation.html

#### ▼ Goには例外が無い

例えばPHPでは、エラーをキャッチし、ソフトウェア開発者にわかる言葉に変換した例外としてスローする。

Goには例外クラスに相当するものが無い。

その代わり、エラーそのものがerrorインターフェースに保持されており、これを`1`個の値として扱える。

下流で発生したerrorインターフェースを、そのまま上流に返却する。

<br>

### エラーキャッチ

#### ▼ nilの比較検証

関数から返却されたerrインターフェースが、`nil`でなかった場合、エラーであると見なすようにする。

```go
if err != nil {
    // 何らかの処理
}
```

<br>

### errorインターフェース

#### ▼ 標準エラー

Goでは複数の値を返却できるため、多くの関数ではデフォルトで、最後にerrorインターフェースが返却されるようになっている。

errorインターフェースは暗黙的に`Error`メソッドをコールする。

```go
type error interface {
    Error() string
}
```

**＊実装例＊**

osパッケージの`Open`メソッドからerrorインターフェースが返却される。

errorインターフェースはErrorメソッドを自動的に実行し、標準エラー出力に出力する。

```go
package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	// 処理結果とerrorインターフェースが返却される。
	file, err := os.Open("filename.txt")

	if err != nil {
		// エラーの内容を出力する。
		log.Fatalf("ERROR: %#v\n", err)
	}

	fmt.Printf("%#v\n", flle)
}
```

#### ▼ `New`関数による独自エラー

errorsパッケージの`New`メソッドにエラーを設定する。

これにより、独自のエラーを保持するerrorインターフェースを定義できる。

errorインターフェースはErrorメソッドを自動的に実行する。

> ↪️ 参考：https://golang.org/pkg/errors/#New

**＊実装例＊**

```go
package main

import (
	"errors"
	"fmt"
	"log"
	"os"
)

func NewError() error {
	return errors.New("<エラーメッセージ>")
}

func main() {
	file, err := os.Open("filename.txt")

	if err != nil {
		// 独自エラーメッセージを設定する。
		myErr := NewError()
		log.Fatalf("ERROR: %#v\n", myErr)
	}

	fmt.Printf("%#v\n", flle)
}
```

#### ▼ `fmt.Errorf`メソッドによる独自エラー

fmtパッケージの`Errorf`メソッドで独自エラーを作成できる。

事前に定義したフォーマットを元にエラーを設定する。

これにより、独自のエラーを保持するerrorインターフェースを定義できる。

errorインターフェースはErrorメソッドを自動的に実行する。

> ↪️ 参考：https://golang.org/pkg/fmt/#Errorf

**＊実装例＊**

```go
package main

import (
	"fmt"
	"os"
)

func main() {

	file, err := os.Open("filename.txt")

	if err != nil {
		fmt.Errorf("ERROR: %s", err)
	}

	fmt.Printf("%#v\n", flle)
}
```

#### ▼ 構造体による独自エラー

構造体に`Error`メソッドを定義すると、この構造体にerrorインターフェースが自動的に委譲される。

これにより、独自のエラーを保持するerrorインターフェースを定義できる。

errorインターフェースはErrorメソッドを自動的に実行する。

**＊実装例＊**

```go
package main

import (
	"fmt"
	"os"
)

type Error struct {
	Message string
}

func (error *Error) Error() string {
	return fmt.Sprintf("ERROR: %s", error.Message)
}

func main() {

	file, err := os.Open("filename.txt")

	if err != nil {
		// 構造体に値を設定する。
		myError := &Error{Message: "エラーが発生したため、処理を完了しました。"}
		// 構造体をコールするのみで、Errorメソッドが実行される。
		fmt.Printf("%#v\n", myError)
		os.Exit(1)
	}

	fmt.Printf("%#v\n", flle)
}
```

<br>

### xerrorsパッケージ

#### ▼ xerrorsパッケージとは

標準のerrorsパッケージには、エラーにスタックトレース情報が含まれていない。

xerrorsパッケージによって作成されるerrorインターフェースには、errorインターフェースが返却された行数がスタックトレースとして含まれている。

#### ▼ `New`関数によるトレース付与

**＊実装例＊**

```go
package main

import (
	"fmt"
	"golang.org/x/xerrors"
	"log"
	"os"
)

func NewErrorWithTrace() error {
	return xerrors.New("<エラーメッセージ>")
}

func main() {
	file, err := os.Open("filename.txt")

	if err != nil {
		// errorインターフェースが返却された行数が付与される。
		errWithStack := NewErrorWithTrace()
		// %+v\n を使用する。
		log.Fatalf("ERROR: %+v\n", errWithStack)
	}

	fmt.Printf("%#v\n", flle)
}
```

#### ▼ `Errorf`メソッドによるトレース付与

```go
package main

import (
	"fmt"
	"golang.org/x/xerrors"
	"log"
	"os"
)

func main() {

	file, err := os.Open("filename.txt")

	if err != nil {
		// errorインターフェースが返却された行数が付与される。
		errWithStack := xerrors.Errorf("ERROR: %w", err)
		// %+v\n を使用する。
		log.Fatalf("ERROR: %+v\n", errWithStack)
	}

	fmt.Printf("%#v\n", flle)
}
```

<br>

## 06-02. ロギング

### logパッケージ

#### ▼ logパッケージとは

Goにはデフォルトで、ロギング用パッケージが用意されている。

ただし、機能が乏しいため、外部パッケージ (例：logrus) も推奨である。

> ↪️ 参考：
>
> - https://pkg.go.dev/log
> - https://github.com/sirupsen/logrus

#### ▼ 接尾辞`Print`メソッド

渡された値を標準出力に出力する。

**＊実装例＊**

渡されたerrorインターフェースを標準出力に出力する。

```go
if err != nil {
	log.Printf("ERROR: %#v\n", err)
}
```

#### ▼ 接尾辞`Fatal`メソッド

渡された値を標準出力に出力し、`os.Exit(1)`を実行して、ステータス『1』で処理を完了する。

**＊実装例＊**

渡されたerrorインターフェースを標準出力に出力する。

```go
if err != nil {
	// 内部でos.Exit(1)を実行する。
	log.Fatalf("ERROR: %#v\n", err)
}
```

#### ▼ 接尾辞`Panic`メソッド

渡された値を標準出力に出力し、予期せぬエラーが起きたと見なして`panic`メソッドを実行する。

補足として、`panic`メソッドによって、エラーメッセージ出力、スタックトレース出力、処理停止が行われる。

ただし、`panic`ではビルドやアーティファクト実行のエラー時に完了ステータスのみを返却することがあり、その場合に何が原因でエラーが発生したのかわからないことがあるため、非推奨である (ビルド失敗の原因がわからずに時間を溶かした経験あり) 。

> ↪️ 参考：https://github.com/golang/go/wiki/CodeReviewComments#dont-panic

**＊実装例＊**

渡されたerrorインターフェースを標準出力に出力する。

```go
if err != nil {
    // panicメソッドを実行する。
    log.Panicf("ERROR: %#v\n", err)
}
```

<br>

## 07. テンプレート

### ロジック

#### ▼ コメント

Goのコメントの前に不要な改行が挿入されないように、`{{-`とする方が良い。

```yaml
{{- /* コメント */}}
```

もしコメントの後にも改行が挿入されてしまう場合は、`-}}`も付ける。

```yaml
{{- /* コメント */-}}
```

`*/}}`にはスペースを含めずに、一繋ぎで定義する。

#### ▼ 条件分岐

```yaml
{{ if x==100 }}
  ...
{{ else }}
  ...
{{ end }}
```

<br>

### テンプレート内のエスケープ

#### ▼ テンプレート内のエスケープとは

テンプレートでは、『`{{ `』と『`}}`』の記号がロジックで使用される。

これを、文字として使用する場合は、ロジックとして認識されないように、エスケープする必要がある。

#### ▼ `{{ "<記号>" }}`

各記号を`{{ "<記号>" }}`のように挟み、エスケープする。

> ↪️ 参考：https://stackoverflow.com/a/17642427

```yaml
{{ "{{ " }} foo {{ " }}" }}
```

#### ▼ `` {{ ` <記号を含む文字> ` }} ``

記号を含む文字ごと`` {{ `<記号を含む文字列全体>` }} ``のように挟み、エスケープする。

> ↪️ 参考：https://stackoverflow.com/a/38941123

```yaml
{{ `{{  foo  }}` }}
```

<br>

## 08. ビルトインパッケージ

### パッケージのコード

> ↪️ 参考：https://golang.org/pkg/

<br>

### bytes

#### ▼ `Buffer`メソッド

渡された文字列を結合し、標準出力に出力する。

**＊実装例＊**

```go
package main

import (
	"bytes"
	"fmt"
)

func main() {
	var buffer bytes.Buffer

	buffer.WriteString("Hello ")

	buffer.WriteString("world!")

	fmt.Printf("%#v\n", buffer.String()) // "Hello world!"
}
```

<br>

### encoding/json

#### ▼ `Marshal`関数

構造体をJSONに変換する。

変換前に、マッピングを行うようにする。

引数のデータ型は、ポインタ型または非ポインタ型のいずれでも問題ない。

ただし、他の多くの関数がポインタ型を引数型としていることから、それに合わせてポインタ型で渡すことが多い。

> ↪️ 参考：https://golang.org/pkg/encoding/json/#Marshal

**＊実装例＊**

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
)

type Person struct {
	// Marshalに渡す構造体のフィールドはパブリックが必須
	Name string `json:"name"`
}

func main() {
	person := &Person{Name: "Hiroki"}

	// ポインタ型と非ポインタ型の両方の引数に対応
	byteJson, err := json.Marshal(person)

	if err != nil {
		log.Fatalf("ERROR: %#v\n", err)
	}

	// エンコード結果を出力
	fmt.Printf("%#v\n", string(byteJson)) // "{\"Name\":\"Hiroki\"}"
}
```

この時、構造体のフィールドはパブリックにする必要がある。

しかし、`MarshalJSON`関数を構造体に定義すると、`Marshal`関数の代わりにこれがコールされるようになる。

構造体にゲッターを用意して、`MarshalJSON`関数でパブリックな構造体を作成すると、プライベートな構造体に対しても`Marshal`関数を使用できるようになる。

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
)

type Person struct {
	name string
}

func NewPerson(name string) *Person {
	return &Person{
		name: name,
	}
}

func (p *Person) Name() string {
	return p.name
}

func (p *Person) MarshalJSON() ([]byte, error) {

	byteJson, err := json.Marshal(&struct {
		// ここでjsonタグを定義する。
		Name string `json:"name"`
	}{
		Name: p.Name(),
	})

	return byteJson, err
}

func main() {
	person := NewPerson("Hiroki")

	byteJson, err := json.Marshal(person)

	if err != nil {
		log.Fatalf("ERROR: %#v\n", err)
	}

	// エンコード結果を出力
	fmt.Printf("%#v\n", string(byteJson)) // "{\"Name\":\"Hiroki\"}"
}
```

#### ▼ `Unmarshal`関数

JSONを構造体に変換する。

リクエストの受信によく使われる。

リクエストのメッセージボディにはバイト型データが割り当てられているため、`Unmarshal`関数の第一引数はバイト型になる。

また、第二引数として、変換後の構造体のメモリアドレスを渡すことにより、第一引数がその構造体に変換される。

内部的には、そのメモリアドレスに割り当てられている変数を書き換えている。

`Unmarshal`関数に渡す構造体のフィールドはパブリックが必要であるが、`Marshal`関数と同様にして、`UnMarshalJSON`関数を構造体に定義すれば、代わりにこれをコールできる。

> ↪️ 参考：https://golang.org/pkg/encoding/json/#Unmarshal

**＊実装例＊**

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
)

type Person struct {
	// Unmarshalに渡す構造体のフィールドはパブリックが必須
	Name string
}

func main() {
	// リクエストを受信した場合を想定する。
	byte := []byte(`{"name":"Hiroki"}`)

	var person Person

	fmt.Printf("%#v\n", person) // main.Person{Name:""} (変数はまだ書き換えられていない)

	// person変数を変換後の値に書き換えている。
	err := json.Unmarshal(byteJson, &person)

	if err != nil {
		log.Fatalf("ERROR: %#v\n", err)
	}

	fmt.Printf("%#v\n", person) // main.Person{Name:"Hiroki"} (変数が書き換えられた)
}
```

#### ▼ `RawMessage`関数

JSONから構造体にパースするために`Unmarshal`関数を実行した時に、部分的にパースせずにJSONのまま取得できる。

**＊実装例＊**

CloudWatchは様々なイベントを処理するため、一部のJSON構造が動的に変化する。

そのため、`RawMessage`関数が使用されている。

> ↪️ 参考：https://github.com/aws/aws-lambda-go/blob/master/events/cloudwatch_events.go

```go
package events

import (
	"encoding/json"
	"time"
)

type CloudWatchEvent struct {
	Version    string          `json:"version"`

    ...

	Resources  []string        `json:"resources"`

    // 動的に変化するJSON構造
	Detail     json.RawMessage `json:"detail"`
}
```

イベントのJSONを文字列のまま取得できる。

```go
package handler

import (
	"fmt"
)

/**
 * Lambdaハンドラー関数
 */
func HandleRequest(event events.CloudWatchEvent) (string) {

	return fmt.Printf("%#v\n", event.Detail)
}
```

#### ▼ `Indent`関数

渡されたJSONにインデントを挿入する。

タブを挿入する場合は『`\t`』、空白2つを挿入する場合は『`  `』を設定する。

標準出力に出力すると、整形されたJSONを確認できる。

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
)

type Objects struct {
	Id   int
	Name string
}

func main() {
	objects := []Objects{
		{1, "Hiroki"},
		{2, "Hiroko"},
		{3, "Hiroshi"},
	}

	byteJson, err := json.Marshal(objects)

	if err != nil {
		log.Fatal(err)
	}

	var buf bytes.Buffer

	// インデント (タブ、空白) を挿入する。
	json.Indent(&buf, byteJson, "", "\t")
    // json.Indent(&buf, byteJson, "", "  ")

	fmt.Println(buf.String())
}

/* 結果
[
	{
		"Id": 1,
		"Name": "Hiroki"
	},
	{
		"Id": 2,
		"Name": "Hiroko"
	},
	{
		"Id": 3,
		"Name": "Hiroshi"
	}
]
*/
```

<br>

### fmt

#### ▼ 接頭接尾辞無しメソッド

接頭接尾辞の無いメソッド (例：`Print`メソッド、`Sprint`メソッド、`Fprint`メソッド、など) が属する。

複数の引数をスペースを挟んで繋ぐ。

> ↪️ 参考：
>
> - https://golang.org/pkg/fmt/#Print
> - https://golang.org/pkg/fmt/#Fprint
> - https://golang.org/pkg/fmt/#Sprint

**＊実装例＊**

```go
package mainimport "fmt"func main() {    fmt.Print("Hello world!") // Hello world! }
```

**＊実装例＊**

```go
package main

import "fmt"

func main() {

    // 複数の引数をスペースで挟んで繋ぐ
    fmt.Print(1, 2, 3) // 1 2 3
}
```

ただし、引数のいずれかがstring値の場合、スペースが挿入されない。

```go
package main

import "fmt"

func main() {
	// いずれかが文字列
	fmt.Print("Hello", "world!", 12345) // Helloworld!12345
}
```

また、連続で使用しても、改行が挿入されない。

```go
package main

import "fmt"

func main() {
    fmt.Print("Hello", "world!")
    fmt.Print("Hello", "world!")

    // Hello world!Hello world!
}
```

#### ▼ 接頭辞`S`メソッド

接頭辞に`S`のあるメソッド (例：`Sprint`メソッド、`Sprintf`メソッド、`Sprintln`メソッド、など) が属する。

接頭辞が`F`や`P`のメソッドとは異なり、処理結果を標準出力に出力せずに返却する。

標準出力に出力できる他の関数の引数として渡す必要がある。

> ↪️ 参考：
>
> - https://golang.org/pkg/fmt/#Sprint
> - https://golang.org/pkg/fmt/#Sprintf
> - https://golang.org/pkg/fmt/#Sprintln

**＊実装例＊**

```go
package mainimport "fmt"func main() {        // Sprintは返却するだけ    fmt.Print(fmt.Sprint(1, 2, 3)) // 1 2 3}
```

#### ▼ 接尾辞`ln`メソッド

接尾辞に`ln`のあるメソッド (例：`Println`メソッド、`Fprintln`メソッド、`Sprintln`メソッド、など) が属する。

複数の引数をスペースを挟んで繋ぎ、最後に改行を挿入して結合する。

> ↪️ 参考：
>
> - https://golang.org/pkg/fmt/#Println
> - https://golang.org/pkg/fmt/#Fprintln
> - https://golang.org/pkg/fmt/#Sprintln

**＊実装例＊**

文字を連続で標準出力に出力する。

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello", "world!")
    fmt.Println("Hello", "world!")
    // Hello world!
    // Hello world!
}
```

#### ▼ 接尾辞`f`メソッド

渡された引数を、事前に定義したフォーマットにも基づいて結合する。

| よく使用する識別子 | 標準出力に出力されるもの     | 備考                                                 |
| ------------------ | ---------------------------- | ---------------------------------------------------- |
| `%s`               | 文字列またはスライスとして   |                                                      |
| `%p`               | ポインタとして               |                                                      |
| `%+v`              | フィールドを含む構造体として | データの構造を確認できるため、デバッグに有効である。 |
| `%#v`              | Go構文として                 | データの構造を確認できるため、デバッグに有効である。 |

> ↪️ 参考：
>
> - https://golang.org/pkg/fmt/#Printf
> - https://golang.org/pkg/fmt/#Fprintf
> - https://golang.org/pkg/fmt/#Sprintf

**＊実装例＊**

渡された引数を文字列として結合する

```go
package main

import "fmt"

func main() {
    fmt.Printf("String is %s", "Hello world!")
}
```

また、連続して使用しても、改行は挿入されない。

```go
package main

import "fmt"

func main() {
    fmt.Printf("String is %s", "Hello world!")
    fmt.Printf("String is %s", "Hello world!")

    // String is Hello world!String is Hello world!
}
```

**＊実装例＊**

渡された引数をポインタとして結合する。

```go
package main

import "fmt"

type Person struct {
    Name     string
}

func main() {
    person:= new(Person)

    person.Name = "Hiroki"

    fmt.Printf("Pointer is %p", person) // 0xc0000821e0
}
```

**＊実装例＊**

渡された複数の引数を文字列として結合する。

```go
package main

import "fmt"

func main() {

    var first string = "Hiroki"

    var last string = "Hasegawa"

    fmt.Printf("Im %s %s", first, last)

    // Im Hiroki Hasegawa
}
```

<br>

### net/http

#### ▼ httpパッケージとは

HTTPクライアントまたはWebサーバを提供する。

そのため、GoではNginxやApacheが不要である。

ただし、Goによるwebサーバーは機能が不十分である、そのため、NginxやApacheをWebサーバとして、GoをAppサーバとして使用した方が良い。

> ↪️ 参考：
>
> - https://golang.org/pkg/net/http/#pkg-index
> - https://stackoverflow.com/questions/17776584/what-are-the-benefits-of-using-nginx-in-front-of-a-webserver-for-go

#### ▼ `Get`メソッド

**＊実装例＊**

```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	response, err := http.Get("https://example/api.com")

	defer response.Body.Close()

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(response.Body)
}
```

#### ▼ `Post`メソッド

**＊実装例＊**

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type User struct {
	id   int    `json:"id"`
	name string `json:"name"`
}

// コンストラクタ
func NewUser(id int, name string) *User {
	return &User{
		id:   id,
		name: name,
	}
}

func main() {
	user := NewUser(1, "Hiroki")

	byteJson, err := json.Marshal(user)

	response, err := http.Post(
		"http://foo-api.com",      // URL
		"application/json",        // Content-Type
		bytes.NewBuffer(byteJson), // メッセージボディ
	)

	defer response.Body.Close()

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(response.Body)
}
```

#### ▼ `NewRequest`メソッド

**＊実装例＊**

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type User struct {
	id   int    `json:"id"`
	name string `json:"name"`
}

// コンストラクタ
func NewUser(id int, name string) *User {

	return &User{
		id:   id,
		name: name,
	}
}

func main() {

	user := NewUser(1, "Hiroki")

	byteJson, err := json.Marshal(user)

	// リクエストを作成する。
	request, err := http.NewRequest(
		"POST",                    // HTTPメソッド
		"https://example.api.com",      // URL
		bytes.NewBuffer(byteJson), // メッセージボディ
	)

	// ヘッダーを作成する。
	request.Header.Set("Content-Type", "application/json") // Content-Type

	// クライアントを作成する。
	client := &http.Client{}

	// リクエストを送信する。
	response, err := client.Do(request)

	defer response.Body.Close()

	if err != nil || response.StatusCode != 200 {
		log.Fatal(err)
	}

	// レスポンスのボディを取得する。
	// 代わりに、httputil.DumpResponseを使用しても良い。
	body, _ := ioutil.ReadAll(response.Body)

	log.Println(string(body))
}
```

#### ▼ `ListenAndServe`メソッド

サーバを起動する。

第一引数にサーバーのURL、第二引数にServeMux関数 (マルチプレクサ関数) を渡す。

第二引数に`nil`を渡した場合、デフォルト引数として`http.DefaultServeMux`が渡される。

**＊実装例＊**

```go
package main

import (
	"net/http"
	"log"
)

func main() {

	err := http.ListenAndServe(":8080", nil)

	// 以下でも同じ。
	// http.ListenAndServe(":8080", http.DefaultServeMux)

	if err != nil {
		log.Fatal("Error ListenAndServe : ", err)
	}
}
```

#### ▼ `NewServeMux`メソッド

サーバーを起動する`ListenAndServe`メソッドに対して、自身で定義したServeMux関数を渡す場合、`NewServeMux`メソッドを使用する必要がある。

これの`HandleFunc`関数に対してルーティングと関数を定義する。

**＊実装例＊**

HTMLをレスポンスとして返信するサーバ (`http://127.0.0.1:8080`) を起動する。

```go
package main

import (
	"log"
	"net/http"
)

func myHandler(writer http.ResponseWriter, request *http.Request) {
	// HTMLをレスポンスとして返信する。
	fmt.Fprintf(writer, "<h1>Hello world!</h1>")
}

func main() {
	mux := http.NewServeMux()

	// ルーティングと関数を設定する。
	mux.HandleFunc("/", myHandler)

	// サーバを起動する。
	err := http.ListenAndServe(":8080", mux)

	if err != nil {
		log.Fatal("Error ListenAndServe : ", err)
	}
}
```

JSONをレスポンスとして返信するサーバ (`http://127.0.0.1:8080`) を起動する。

```go
package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type User struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

// コンストラクタ
func NewUser(id int, name string) *User {

	return &User{
		Id:   id,
		Name: name,
	}
}

func myHandler(writer http.ResponseWriter, request *http.Request) {

	user := NewUser(1, "Hiroki")

	byteJson, err := json.Marshal(user)

	if err != nil {
		log.Fatal(err)
	}

	// JSONをレスポンスとして返信する。
	writer.Header().Set("Content-Type", "application/json; charset=utf-8")
	writer.Write(byteJson)
}

func main() {
	mux := http.NewServeMux()

	// ルーティングと関数を設定する。
	mux.HandleFunc("/", myHandler)

	// サーバを起動する。
	err := http.ListenAndServe(":8080", mux)

	if err != nil {
		log.Fatal(err)
	}
}
```

<br>

### os

#### ▼ `Open`関数

ファイルをReadOnly状態にする。

```go
package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	file, err := os.Open("filename.txt")

	if err != nil {
		log.Fatalf("ERROR: %#v\n", err)
	}

	fmt.Printf("%#v\n", file)
}
```

<br>

### reflect

#### ▼ `TypeOf`メソッド、`ValueOf`メソッド

構造体からフィールド情報を取得する。

フィールドが複数ある場合は、要素番号の指定が必要になるため、事前に要素数を取得するようにしておく。

```go
package main

import (
	"fmt"
	"reflect"
)

type Foo struct {
	bar string
	baz int
}

func main() {
	foo := &Foo{bar: "BAR", baz: 1}

	fields := reflect.TypeOf(*foo)
	fmt.Println(fields)

	values := reflect.ValueOf(*foo)

	// 再帰的にフィールドと値を取得する
	for i := 0; i < fields.NumField(); i++ {

		fmt.Println("===", i, "===")

		// フィールドを取得
		field := fields.Field(i)
		fmt.Println(field.Name)

		// 値を取得
		value := values.Field(i)
		fmt.Println(field.Type)

		fmt.Println(value)
	}
}

/*
=== 0 ===
bar
string
BAR
=== 1 ===
baz
int
1
*/
```

<br>

### strings

#### ▼ `Builder`関数

渡された文字列を結合し、標準出力に出力する。

**＊実装例＊**

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	var builder strings.Builder

	builder.WriteString("Hello ")

	builder.WriteString("world!")

	fmt.Println(builder.String()) // Hello world!
}
```
