---
title: 【IT技術の知見】パッケージ@Go
---

# パッケージ@Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## ビルトインパッケージ

### パッケージのコード

> - https://golang.org/pkg/

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

### context

#### ▼ contextとは

HTTPコンテキストの仕組みで、リクエスト/レスポンスを処理する。

contextが持つ情報は、関数やコンテナ間で伝播できる。

#### ▼ タイムアウト

リクエスト/レスポンスを宛先に送信できず、タイムアウトになった場合、`context deadline exceeded`のエラーを返却する。

```go
package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

func main() {

	// タイムアウト時間設定済みのコンテキストを作成する
	ctx, cancel := context.WithTimeout(
		context.Background(),
		// タイムアウト時間を1秒に設定する
		1 * time.Second,
	)

	defer cancel()

	req, err := http.NewRequest("GET", "http://localhost:8080/example", nil)

	if err != nil {
		panic(err)
	}

	req = req.WithContext(ctx)

	client := &http.Client{}

	resp, err := client.Do(req)

	if err != nil {
		// context deadline exceeded エラーになる
		fmt.Println("Request error:", err)
		return
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		panic(err)
	}

	fmt.Println("Response:", string(body))
}

```

> - https://qiita.com/atsutama/items/566c38b4a5f3f0d26e44#http%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E4%BE%8B

タイムアウト時間を伝播できる。

```go
package main

import (
	"context"
	"fmt"
	"time"
)

func fn1(ctx context.Context) {
	log("start fn1")
	defer log("done fn1")
	for i := 1; i <= 4; i++ {
		select {
		case <-ctx.Done():
			return
		default:
			log("loop fn1")
			time.Sleep(1 * time.Second)
		}
	}
}

func fn2(ctx context.Context) {
	log("start fn2")
	defer log("done fn2")
	for i := 1; i <= 4; i++ {
		select {
		case <-ctx.Done():
			return
		default:
			log("loop fn2")
		}
	}
}

func log(timing string) {
	fmt.Printf("%s second:%v\n", timing, time.Now().Second())
}

func main() {

    log("start main")

    defer log("done main")

	// タイムアウト時間設定済みのコンテキストを作成する
	ctx, cancel := context.WithTimeout(
		context.Background(),
		// タイムアウト時間を2秒に設定する
		2 * time.Second,
	)

	defer cancel()

	// タイムアウト時間をfn1に伝播する
	go fn1(ctx)

	// タイムアウト時間をfn1に伝播する
	go fn2(ctx)

	time.Sleep(5 * time.Second)
}
```

> - https://www.wakuwakubank.com/posts/867-go-context/#index_id4

<br>

### encoding/json

#### ▼ `Marshal`関数

構造体をJSONに変換する。

変換前に、マッピングを実行するようにする。

引数のデータ型は、ポインタ型または非ポインタ型のいずれでも問題ない。

ただし、他の多くの関数がポインタ型を引数型としていることから、それに合わせてポインタ型で渡すことが多い。

> - https://golang.org/pkg/encoding/json/#Marshal

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
		log.Printf("ERROR: %#v\n", err)
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
		log.Printf("ERROR: %#v\n", err)
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

> - https://golang.org/pkg/encoding/json/#Unmarshal

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
		log.Printf("ERROR: %#v\n", err)
	}

	fmt.Printf("%#v\n", person) // main.Person{Name:"Hiroki"} (変数が書き換えられた)
}
```

#### ▼ `RawMessage`関数

JSONから構造体にパースするために`Unmarshal`関数を実行した時に、部分的にパースせずにJSONのまま取得できる。

**＊実装例＊**

CloudWatchは様々なイベントを処理するため、一部のJSON構造が動的に変化する。

そのため、`RawMessage`関数が使用されている。

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

import "fmt"

/**
 * Lambdaハンドラー関数
 */
func HandleRequest(event events.CloudWatchEvent) (string) {

	return fmt.Printf("%#v\n", event.Detail)
}
```

> - https://github.com/aws/aws-lambda-go/blob/master/events/cloudwatch_events.go

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
		log.Print(err)
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

### flag

#### ▼ flagとは

#### ▼ Parse

コマンドのオプションの値を解析する。

```go
package main

import (
    "flag"
    "fmt"
)

func main() {

	// オプションの値を解析する
    flag.Parse()

	fmt.Println(flag.Args())
}
```

```bash
$ go run main.go foo bar baz

[foo bar baz]
```

> - https://golang.hateblo.jp/entry/2018/10/22/080000

#### ▼ String

コマンドでユーザー定義のオプションを設定する。

```go
package main

import (
	"flag"
	"fmt"
)

func main() {

	kubeconfig = flag.String(
		"kubeconfig",
		filepath.Join(home, ".kube", "config"),
		"(optional) absolute path to the kubeconfig file",
	)

	flag.Parse()
}
```

`help`オプションで確認できる。

```bash
$ go run main.go --help
Usage of main.go:
  -kubeconfig string
        (optional) absolute path to the kubeconfig file (default "/Users/foo/.kube/config")
```

> - https://qiita.com/oruharo/items/8f98e75264b9d6c7df2a#flag

<br>

### fmt

#### ▼ 接頭接尾辞無しメソッド

接頭接尾辞の無いメソッド (例：`Print`メソッド、`Sprint`メソッド、`Fprint`メソッド、など) が所属する。

複数の引数をスペースを挟んで繋ぐ。

> - https://golang.org/pkg/fmt/#Print
> - https://golang.org/pkg/fmt/#Fprint
> - https://golang.org/pkg/fmt/#Sprint

**＊実装例＊**

```go
package main

import "fmt"

func main() {
    fmt.Print("Hello world!") // Hello world!
}
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

接頭辞に`S`のあるメソッド (例：`Sprint`メソッド、`Sprintf`メソッド、`Sprintln`メソッド、など) が所属する。

接頭辞が`F`や`P`のメソッドとは異なり、処理結果を標準出力に出力せずに返却する。

標準出力に出力できる他の関数の引数として渡す必要がある。

**＊実装例＊**

```go
package main

import "fmt"

func main() {
	// Sprintは返却するだけ
	fmt.Print(fmt.Sprint(1, 2, 3)) // 1 2 3
}
```

> - https://golang.org/pkg/fmt/#Sprint
> - https://golang.org/pkg/fmt/#Sprintf
> - https://golang.org/pkg/fmt/#Sprintln

#### ▼ 接尾辞`ln`メソッド

接尾辞に`ln`のあるメソッド (例：`Println`メソッド、`Fprintln`メソッド、`Sprintln`メソッド、など) が所属する。

複数の引数をスペースを挟んで繋ぎ、最後に改行を挿入して結合する。

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
		log.Print(err)
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
		log.Print(err)
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
		log.Print(err)
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
		log.Print("Error ListenAndServe : ", err)
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
		log.Print("Error ListenAndServe : ", err)
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
		log.Print(err)
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
		log.Print(err)
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
		log.Printf("ERROR: %#v\n", err)
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

<br>

## 外部パッケージの管理

### コマンド

#### ▼ `go mod tidy`

`import`で指定されているパッケージに合わせて、`go.mod`ファイルと`go.sum`ファイルを更新する。

`import`で指定のないパッケージは、`go.mod`ファイルから削除する。

また、パッケージがインストールされていない場合は、これをインストールする。

```bash
$ go mod tidy
```

もし`go.sum`ファイルがあるのにも関わらず、以下のようなエラーが出る時は、`go mod tidy`コマンドを実行して`go.sum`ファイルを更新する必要がある。

```bash
cmd/main.go:4:5: missing go.sum entry for module providing package github.com/foo/foo-package (imported by github.com/hiroki-it/bar/cmd); to add:
        go get github.com/hiroki-hasegawa/bar/cmd
```

> - https://zenn.dev/optimisuke/articles/105feac3f8e726830f8c#go-mod-tidy

<br>

### go.modファイル

#### ▼ `go.mod`ファイルとは

PHPにおける`composer.json`ファイルに相当する。

インターネット上における自身のパッケージ名とGoバージョンを定義するために、全てのGoアプリケーションで必ず必要である。

基本的には、パッケージのURLやディレクトリ構成と同じにする。

```go
module github.com/hiroki-hasegawa/foo-repository

go 1.16
```

#### ▼ インターネットからインポート

パッケージ名とバージョンタグを使用して、インターネットからパッケージをインポートする。

`go mod tidy`コマンドによって`// indirect`コメントのついたパッケージが実装される。

これは、使用しているパッケージではなく、インポートしているパッケージが依存しているパッケージである。

注意点として、パッケージ名は、使用したいパッケージの`go.mod`ファイルを参照すること。

```go
module github.com/hiroki-hasegawa/repository

go 1.16

// 直接的に依存するパッケージ (アプリで使用するパッケージ)
require (
    <パッケージ名> <バージョンタグ>
    github.com/foo v1.3.0
    github.com/bar v1.0.0
	)

// 間接的に依存するパッケージ (アプリで使用するパッケージが依存するパッケージ)
require (
    github.com/baz v1.0.0 // indirect
)
```

```go
import "github.com/bar"

func main() {
    // 何らかの処理
}
```

> - https://github.com/golang/go/wiki/Modules#should-i-commit-my-gosum-file-as-well-as-my-gomod-file
> - https://developer.so-tech.co.jp/entry/2022/08/16/110108

#### ▼ ローカルマシンからインポート

ローカルマシンのみで使用する独自共有パッケージは、インターネット上での自身のリポジトリからインポートせずに、`replace`関数を使用してインポートする必要がある。

独自共有の全パッケージでパッケージ名を置換する必要はなく、プロジェクトのルートパスについてのみ定義すれば良い。

パス実際、`unknown revision`のエラーで、バージョンを見つけられない。

> - https://qiita.com/hnishi/items/a9217249d7832ed2c035

```go
module foo.com/hiroki-it/repository

go 1.16

replace github.com/hiroki-hasegawa/foo-repository => /
```

また、ルートディレクトリのみでなく、各パッケージにも`go.mod`ファイルを配置する必要がある。

```yaml
repository/
├── cmd/
│   └── hello.go
│
├── go.mod
├── go.sum
└── local-pkg/
    ├── go.mod # 各パッケージにgo.modを配置する。
    └── module.go
```

```go
module foo.com/hiroki-it/foo-repository/local-pkg

go 1.16
```

これらにより、ローカルマシンのパッケージをインポートできるようになる。

```go
import "local.packages/local-pkg"

func main() {
    // 何らかの処理
}
```

<br>

### go.sumファイル

#### ▼ `go.sum`ファイルとは

PHPにおける`composer.lock`ファイルに相当する。

`go.mod`ファイルによって実際にインストールされたパッケージが自動的に実装される。

パッケージごとのチェックサムが記録されるため、前回のインストール時と比較して、パッケージに変更があるか否かを検知できる。

<br>

## aws-sdk-go-v2

### aws-sdk-go-v2とは

> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2?tab=versions

<br>

### awsとは

汎用的な関数が同梱されている。

> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/aws?tab=versions

ポインタ型からstring型に変換する`ToString`関数や、反対にstring型からポインタ型に変換する`String`関数をよく使用する。

> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/aws#String
> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/aws#ToString

#### ▼ serviceパッケージ

記入中...

> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/service/amplify?tab=versions

<br>

## aws-lambda-go

### aws-lambda-goとは

以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/cloud_computing/cloud_computing_aws_resource_lambda_function.html

<br>

## go-chi

### go-chiとは

ミドルウェア処理 (特にルーティング) のパッケージである。

```go
package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {

	r := chi.NewRouter()

	r.Use(middleware.Logger)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("welcome"))
	})

	http.ListenAndServe(":3000", r)
}
```

> - https://github.com/go-chi/chi

<br>

## go-grpc-middleware

gRPCに関するミドルウェア処理 (例：認証、ロギング、メトリクス、分散トレーシング、など) を持つ。

なお、gRPCはリモートプロシージャーコールであるため、ミドルウェア処理にルーティングは含まれない。

`v1`系と`v2`系があり、関数の引数の設定方法が異なる。

これを`Chain`関数に渡せば、gRPCで様々なインターセプター処理を簡単に実行できる。

> - https://github.com/grpc-ecosystem/go-grpc-middleware/tree/main#interceptors
> - https://github.com/grpc-ecosystem/go-grpc-middleware/blob/v2.0.0/examples/server/main.go#L136-L152

<br>

## gorm

### gormとは

Go製のORMである。

その他のORMについては、以下のリポジトリが参考になる。

執筆時点 (2022/01/31) では、GormとBeegoが接戦している。

> - https://github.com/d-tsuji/awesome-go-orms

<br>

### DBとの接続

#### ▼ MySQLの場合

> - https://gorm.io/docs/connecting_to_the_database.html#MySQL

```go
func NewDB() (*gorm.DB, error) {

    // 接続情報。sprintfメソッドを使用すると、可読性が高い。
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_DATABASE"),
	)

    // DBに接続します。
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		return nil, err
	}

	return db, nil
}

func Close(db *gorm.DB) error {

	sqlDb, err := db.DB()

	if err != nil {
		return err
	}

    // DBとの接続を切断します。
	err = sqlDb.Close()

	if err != nil {
		return err
	}

	return nil
}
```

<br>

### Gormモデル

#### ▼ Gormモデル埋め込み

構造体にGormモデルを埋め込むと、IDやタイムスタンプレコードがフィールドとして追加される。

構造体をマッピングしたテーブルに、`id`カラム、`created_at`カラム、`updated_at`カラム、`deleted_at`カラムが追加される。

> - https://gorm.io/docs/models.html#embedded_struct

```go
type User struct {
	gorm.Model
	Name string
}

// 以下と同じ
type User struct {
	ID        uint `gorm:"primaryKey"`
    Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeleteAt `gorm:"index"`
}
```

#### ▼ プライマリーキー

『ID』という名前のフィールドを認識して、これをプライマリーキーとしてデータをマッピングする。もし、他の名前のフィールドをIDとして使用したい場合は、`gorm:"primaryKey"`タグをつける。

```go
type User struct {
	ID   string // プライマリーキーとして使用される。
	Name string
}
```

```go
type User struct {
	UserID string `gorm:"primaryKey"` // プライマリーキーとして使用される。
	Name   string
}
```

> - https://gorm.io/docs/conventions.html#ID-as-Primary-Key

#### ▼ SoftDelete

構造体が、`gorm.DeleteAt`をデータ型とするフィールドを持っていると、その構造体を使用した`DELETE`処理では論理削除が実行される。

Gormモデルを埋め込むことによりこのフィールドを持たせるか、または独自定義することにより、SoftDeleteを有効化できる。

```go
type User struct {
	ID      int
	Deleted gorm.DeletedAt
	Name    string
}
```

```go
user := User{Id: 111}

// UPDATE users SET deleted_at="2013-10-29 10:23" WHERE id = 111;
db.Delete(&user)

// UPDATE users SET deleted_at="2013-10-29 10:23" WHERE age = 20;
db.Where("age = ?", 20).Delete(&User{})

// SELECT * FROM users WHERE age = 20 AND deleted_at IS NULL;
db.Where("age = 20").Find(&user)
```

> - https://gorm.io/docs/delete.html#Soft-Delete

<br>

### DBマイグレーション

#### ▼ `TableName`メソッド

デフォルトではGormモデルの名前をスネークケースに変更し、加えて複数形とした名前のテーブルが作成される。

`TableName`メソッドにより、ユーザー定義のテーブル名をつけられる。

```go
// テーブル名はデフォルトでは『users』になる。
type User struct {
	ID      int
	Deleted gorm.DeletedAt
	Name    string
}

// テーブル名を『foo』になる。
func (User) TableName() string {
	return "foo"
}
```

> - https://gorm.io/docs/conventions.html#TableName

<br>

### Create

Gormモデルのフィールドに設定された値を元に、カラムを作成する。

作成したカラムのプライマリーキーを、構造体から取得できる。

```go
user := User{Name: "Jinzhu", Age: 18, Birthday: time.Now()}

result := db.Create(&user) // pass pointer of data to Create

user.ID             // returns inserted data's primary key
result.Error        // returns error
result.RowsAffected // returns inserted records count
```

> - https://gorm.io/docs/create.html#Create-Record

<br>

### Read

#### ▼ 全カラム取得

```go
user := User{}

// Get all records
result := db.Find(&users)
// SELECT * FROM users;

result.RowsAffected // returns found records count, equals `len(users)`
result.Error        // returns error
```

> - https://gorm.io/docs/query.html#Retrieving-all-objects

#### ▼ 単一/複数カラム取得

Gormモデルとプライマリーキーを指定して、プライマリーキーのモデルに紐付けられたカラムを取得する。

```go
user := User{}

db.First(&user, 10)
// SELECT * FROM users WHERE id = 10;

db.First(&user, "10")
// SELECT * FROM users WHERE id = 10;

db.Find(&users, []int{1,2,3})
// SELECT * FROM users WHERE id IN (1,2,3);
```

> - https://gorm.io/docs/query.html#Retrieving-objects-with-primary-key

<br>

### Update

#### ▼ 単一カラム更新 (暗黙的)

フィールドとは無関係に、渡された値を元にUPDATE分を実行する。

> - https://gorm.io/docs/update.html#Update-single-column

```go
// Update with conditions
db.Model(&User{}).Where("active = ?", true).Update("name", "hello")
// UPDATE users SET name='hello', updated_at='2013-11-17 21:34:10' WHERE active=true;

user := User{Id:111}

// User's ID is `111`:
db.Model(&user).Update("name", "hello")
// UPDATE users SET name='hello', updated_at='2013-11-17 21:34:10' WHERE id=111;

// Update with conditions and model value
db.Model(&user).Where("active = ?", true).Update("name", "hello")
// UPDATE users SET name='hello', updated_at='2013-11-17 21:34:10' WHERE id=111 AND active=true;
```

#### ▼ 複数カラム更新 (暗黙的)

Gormモデルのフィールドを暗黙的に指定して、複数のカラム値を更新する。

または、フィールドとは無関係に、マップデータを元にUPDATE文を実行する。

Gormモデルを使用した場合、フィールド値がゼロ値であると、これに紐付けられたカラム値の更新はスキップされてしまう。

> - https://gorm.io/docs/update.html#Updates-multiple-columns

```go
user := User{Id:111}

// Update attributes with `struct`, will only update non-zero fields
db.Model(&user).Updates(User{Name: "hello", Age: 18, Active: "false"})
// UPDATE users SET name='hello', age=18, updated_at = '2013-11-17 21:34:10' WHERE id = 111;

// Update attributes with `map`
db.Model(&user).Updates(map[string]interface{}{"name": "hello", "age": 18, "active": "false"})
// UPDATE users SET name='hello', age=18, active=false, updated_at='2013-11-17 21:34:10' WHERE id=111;
```

#### ▼ 複数カラム更新 (明示的)

Gormモデルのフィールドを明示的に指定して、複数のカラム値を更新する。

フィールド値がゼロ値であっても、スキップされない。

> - https://gorm.io/docs/update.html#Update-Selected-Fields

```go
user := User{Id:111}

// Select with Struct (select zero value fields)
db.Model(&user).Select("Name", "Age").Updates(User{Name: "new_name", Age: 0})
// UPDATE users SET name='new_name', age=0 WHERE id=111;

// Select all fields (select all fields include zero value fields)
db.Model(&user).Select("*").Updates(User{Name: "jinzhu", Role: "admin", Age: 0})
// UPDATE users SET name='new_name', age=0 WHERE id=111;
```

#### ▼ 全カラム更新

Gormモデルのフィールドを暗黙的に全て指定して、全てのカラム値を強制的に更新する。

> - https://gorm.io/docs/update.html#Save-All-Fields

```go
user := User{Id:111}

db.First(&user)

user.Name = "jinzhu 2"
user.Age = 100
db.Save(&user)
// UPDATE users SET name='jinzhu 2', age=100, birthday='2016-01-01', updated_at = '2013-11-17 21:34:10' WHERE id=111;
```

<br>

## grpc-go

### grpc-goとは

GoでgRPCを扱えるようにする。

> - https://github.com/grpc/grpc-go

<br>

## otelgrpc

### otelgrpcとは

gRPCによるHTTPリクエストの受信処理からコンテキストを抽出 (Extract) し、次のリクエストの送信処理に注入 (Inject) する。

`otelgrpc`を使用しない場合、これらを自前で実装する必要がある。

> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc
> - https://blog.cybozu.io/entry/2023/04/12/170000

<br>

## otelhttp

### otelhttpとは

HTTPリクエストの受信処理からコンテキストを抽出 (Extract) し、次のリクエストの送信処理に注入 (Inject) する。

`otelhttp`を使用しない場合、これらを自前で実装する必要がある。

> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp
> - https://blog.cybozu.io/entry/2023/04/12/170000

<br>

## otlptracegrpc

### otlptracegrpcとは

OTLP形式で送信するエクスポーターを提供する。

gRPCによるHTTPリクエスト処理のテレメトリーを監視バックエンド (デフォルトでは` https://127.0.0.1:4317`) に送信する。

> - https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc

<br>

## otel

### otelとは

OpenTelemetryを提供する。

<br>

### otel/sdk

OpenTelemetryのTraceProviderを提供する。

<br>

## otlptracehttp

### otlptracehttpとは

OTLP形式で送信するエクスポーターを提供する。

HTTPリクエスト処理のテレメトリーを監視バックエンド (デフォルトでは`https://127.0.0.1:4318/v1/traces`) に送信する。

> - https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp

<br>

## testify

### testifyとは

モック、スタブ、アサーションの関数を提供する。

Goではオブジェクトの概念がないため、モックオブジェクトとは言わない。

<br>

### mock、assert

#### ▼ モック化

| よく使用するメソッド | 説明                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| なし                 | データとして、構造体に`Mock`を設定すれば、その構造体はモック化される。 |

**＊実装例＊**

AWSクライアントをモック化する。

```go
package amplify

import (
	"github.com/stretchr/testify/mock"
)

/**
 * AWSクライアントをモック化します。


 */
type MockedAwsClient struct {
	mock.Mock
}
```

#### ▼ スタブ化

| よく使用するメソッド      | 説明                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Mock.Called`メソッド     | 関数の一部の処理をスタブ化する時に使用する。関数に値が渡されたことをモックに伝える。                                         |
| `Arguments.Get`メソッド   | 関数の一部の処理をスタブ化する時に使用する。引数として、返却値の順番を渡す。ユーザー定義のデータ型を返却する処理を定義する。 |
| `Arguments.Error`メソッド | 関数の一部の処理をスタブ化する時に使用する。引数として、返却値の順番を渡す。エラーを返却する処理を定義する。                 |

**＊実装例＊**

関数の一部の処理をスタブ化し、これをAWSクライアントのモックに紐付ける。

```go
package amplify

import (
	aws_amplify "github.com/aws/aws-sdk-go-v2/service/amplify"
	"github.com/stretchr/testify/mock"
)

type MockedAmplifyAPI struct {
	mock.Mock
}

/**
 * AmplifyのGetBranch関数の処理をスタブ化します。


 */
func (mock *MockedAmplifyAPI) GetBranch(ctx context.Context, params *aws_amplify.GetBranchInput, optFns ...func(*aws_amplify.Options)) (*aws_amplify.GetBranchOutput, error) {
	arguments := mock.Called(ctx, params, optFns)
	return arguments.Get(0).(*aws_amplify.GetBranchOutput), arguments.Error(1)
}
```

> - https://pkg.go.dev/github.com/stretchr/testify/mock?tab=versions

#### ▼ アサーションメソッドによる検証

| よく使用するメソッド              | 説明                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `Mock.On`メソッド                 | 関数の検証時に使用する。関数内部のスタブに引数として渡される値と、その時の返却値を定義する。   |
| `Mock.AssertExpectations`メソッド | 関数の検証時に使用する。関数内部のスタブが正しく実行されたか否かを検証する。                   |
| `assert.Exactly`メソッド          | 関数の検証時に使用する。期待値と実際値の整合性を検証する。値のみでなく、データ型も検証できる。 |

> - https://pkg.go.dev/github.com/stretchr/testify/mock?tab=versions
> - https://pkg.go.dev/github.com/stretchr/testify/assert?tab=versions

#### ▼ 事前処理と事後処理

テスト関数を実行する直前に、事前処理を実行する。

モックの作成のために使用すると良い。

事前処理と事後処理については、以下のリンクを参考にせよ。

| よく使用する関数 | 実行タイミング | 説明                                                                                                                                              |
| ---------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SetupSuite`     | 1              | テストスイート内の全てのテストの事前処理として、一回だけ実行する。                                                                                |
| `SetupTest`      | 2              | テストスイート内の各テストの事前処理として、テストの度に事前に実行する。`BeforeTest`関数よりも前に実行されることに注意する。                      |
| `BeforeTest`     | 3              | テストスイート内の各テストの直前の事前処理として、テストの度に事前に実行する。必ず、『`suiteName`』『`testName`』を引数として設定する必要がある。 |
| `AfterTest`      | 4              | テストスイート内の各テストの直後の事後処理として、テストの度に事後に実行する。必ず、『`suiteName`』『`testName`』を引数として設定する必要がある。 |
| `TearDownTest`   | 5              | テストスイート内の各テストの事後処理として、テストの度に事後に実行する。`BeforeTest`関数よりも後に実行されることに注意する。                      |
| `TearDownSuite`  | 6              | テストスイート内の全てのテストの事後処理として、一回だけ実行する。                                                                                |

**＊実装例＊**

事前にモックを作成するために、`BeforeTest`関数を使用する。

```go
package foo

import (
	"testing"
)

/**
 * 単体テストのテストスイートを構成する。


 */
type FooSuite struct {
	suite.Suite
	fooMock *FooMock
}

/**
 * 単体テストの直前の事前処理を実行する。


 */
func (suite *FooSuite) BeforeTest(suiteName string, testName string) {

	// モックを作成する。
	suite.fooMock = &FooMock{}
}

/**
 * 単体テストのテストスイートを実行する。


 */
func TestFooSuite(t *testing.T) {
	suite.Run(t, &FooSuite{})
}
```

```go
package foo

import (
	"github.com/stretchr/testify/assert"
)

/**
 * Methodメソッドが成功することを検証する。


 */
func (suite *FooSuite) TestMethod() {

	suite.T().Helper()

	// 事前処理で作成したモックを使用する。
	fooMock := suite.fooMock

	// 以降にテスト処理
}
```

> - https://github.com/google/go-github/blob/master/github/github_test.go#L36-L66

<br>

## validator

### validatorとは

<br>

### バリデーションとエラーメッセージ

```go
package validators

import (
	"fmt"

	"github.com/go-playground/validator"
)

type FoobarbazValidator struct {
	Foo string `json:"foo" validate:"required"`
	Bar string `json:"bar" validate:"required"`
	Baz string `json:"baz" validate:"required"`
}

// NewValidator コンストラクタ
func NewValidator() *Validator {

	return &Validator{}
}

// Validate バリデーションを実行します。
func (v *FoobarbazValidator) Validate() map[string]string {

	err := validator.New().Struct(v)

	var errorMessages = make(map[string]string)

	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			switch err.Field() {
			// フィールドごとにマップ形式でバリデーションメッセージを構成します。
			case "foo":
				errorMessages["foo"] = v.stringValidation(err)
				errorMessages["foo"] = v.requiredValidation(err)
			case "bar":
				errorMessages["bar"] = v.stringValidation(err)
			case "baz":
				errorMessages["baz"] = v.stringValidation(err)
				errorMessages["baz"] = v.requiredValidation(err)
			}
		}
	}

	return errorMessages
}

// stringValidation string型指定のメッセージを返却します。
func (v *FoobarbazValidator) stringValidation(err validator.FieldError) string {
	return fmt.Sprintf("%s は文字列のみ有効です", err.Field())
}

// requiredValidation 必須メッセージを返却します。
func (v *FoobarbazValidator) requiredValidation(err validator.FieldError) string {
	return fmt.Sprintf("%s は必須です", err.Field())
}
```

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/foobarbaz-repository/validators"
)

func main() {
	v := NewFoobarbazValidator()

	// JSONを構造体にマッピングします。
	err := json.Unmarshal([]byte(`{"foo": "test", "bar": "test", "baz": "test"}`), v)

	if err != nil {
		log.Print(err)
		return
	}

	// バリデーションを実行します。
	errorMessages := v.Validate()

	if len(errorMessages) > 0 {
		// マップをJSONに変換します。
		byteJson, _ := json.Marshal(errorMessages)
		fmt.Printf("%#v\n", byteJson)
	}

	// エンコード結果を出力します。
	fmt.Println("データに問題はありません。")
}
```

<br>
