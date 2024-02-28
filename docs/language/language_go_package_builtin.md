---
title: 【IT技術の知見】ビルトインパッケージ@Go
description: ビルトインパッケージ@Goの知見を記録しています。
---

# ビルトインパッケージ@Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## パッケージのコード

> - https://golang.org/pkg/

<br>

## bytes

### `Buffer`メソッド

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

	log.Printf("%v", buffer.String()) // "Hello world!"
}
```

<br>

## context

### contextとは

タイムアウト時間を設定し、またタイムアウトをすぎた場合に処理をキャンセルする。

また、複数の関数に渡って処理の情報 (タイムアウト時間、タイムアウトに関連するキャンセルシグナル、リクエストスコープ、など) を伝達する。

```go
type Context interface {

	// タイムアウト時間
    Deadline() (deadline time.Time, ok bool)

    Done() <-chan struct{}

    Err() error

	// コンテキストの情報
    Value(key interface{}) interface{}
}
```

> - https://zenn.dev/hsaki/books/golang-context/viewer/definition

#### ▼ タイムアウト時間

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

	// タイムアウトの場合に処理を中断する
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

<br>

### 伝達のユースケース

#### ▼ Goroutine間での伝達

> - https://zenn.dev/hsaki/books/golang-context/viewer/definition#%E5%87%A6%E7%90%86%E3%81%8C%E8%A4%87%E6%95%B0%E5%80%8B%E3%81%AE%E3%82%B4%E3%83%BC%E3%83%AB%E3%83%BC%E3%83%81%E3%83%B3%E3%82%92%E3%81%BE%E3%81%9F%E3%81%90%E4%BE%8B

<br>

### 伝達できる情報

#### ▼ タイムアウト時間

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
        // cancel関数が実行された場合
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
		// cancel関数が実行された場合
		case <-ctx.Done():
			return
		default:
			log("loop fn2")
		}
	}
}

func log(timing string) {
	log.Printf("%v second:%v", timing, time.Now().Second())
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

	// タイムアウトの場合に処理を中断する
	defer cancel()

	// タイムアウト時間をfn1に伝播する
	go fn1(ctx)

	// タイムアウト時間をfn1に伝播する
	go fn2(ctx)

	time.Sleep(5 * time.Second)
}
```

> - https://www.wakuwakubank.com/posts/867-go-context/#index_id4

#### ▼ キャンセル

Contextでは親子関係を設定できる。

先に作成したContextが親、後に作成したContextが子になる。

親コンテキストの処理をキャンセルすると、子コンテキストの処理も連鎖的にキャンセルできる。

```go
package main

import (
    "context"
    "log"
)

func main() {

	// 親コンテキストを作成する
    parentCtx, parentCancel := context.WithCancel(context.Background())

	// 親コンテキストをパラメータとして、子コンテキストを作成する
    childCtx, _ := context.WithCancel(parentCtx)

    go func() {
		parentCancel()
    }()

	...
}

```

> - https://golangbyexample.com/using-context-in-golang-complete-guide/
> - https://castaneai.hatenablog.com/entry/2020/01/28/133843

#### ▼ リクエストスコープ

セッションID、認証トークン、などを伝達できる。

> - https://zenn.dev/hsaki/books/golang-context/viewer/usage#%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%97%E3%81%AA%E5%80%A4%E3%81%AE%E5%85%B1%E6%9C%89(session%2C-auth)

<br>

## encoding/json

### `Marshal`関数

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
		log.Printf("ERROR: %v", err)
	}

	// エンコード結果を出力
	log.Printf("%v", string(byteJson)) // "{\"Name\":\"Hiroki\"}"
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
		log.Printf("Failed to marshal: %v", err)
	}

	// エンコード結果を出力
	log.Printf("%v", string(byteJson)) // "{\"Name\":\"Hiroki\"}"
}
```

<br>

### `Unmarshal`関数

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

	log.Printf("%v", person) // main.Person{Name:""} (変数はまだ書き換えられていない)

	// person変数を変換後の値に書き換えている。
	err := json.Unmarshal(byteJson, &person)

	if err != nil {
		log.Printf("ERROR: %v", err)
	}

	log.Printf("%v", person) // main.Person{Name:"Hiroki"} (変数が書き換えられた)
}
```

<br>

### `RawMessage`関数

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

	return log.Printf("%v", event.Detail)
}
```

> - https://github.com/aws/aws-lambda-go/blob/master/events/cloudwatch_events.go

<br>

### `Indent`関数

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

## flag

### flagとは

記入中...

<br>

### Parse

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

<br>

### String

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

## fmt

### fmtとは

標準エラー出力に出力する`log`パッケージとは異なり、標準出力に設定したメッセージを出力する。

> - https://zenn.dev/link/comments/0247de9ed6c174

<br>

### 接頭接尾辞無しメソッド

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

<br>

### 接頭辞`S`メソッド

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

<br>

### 接尾辞`ln`メソッド

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

<br>

### 接尾辞`f`メソッド

渡された引数を、事前に定義したフォーマットにも基づいて結合する。

| よく使用する識別子 | 標準出力に出力されるもの     | 備考                                                 |
| ------------------ | ---------------------------- | ---------------------------------------------------- |
| `%s`               | 文字列またはスライスとして   |                                                      |
| `%p`               | ポインタとして               |                                                      |
| `%v`               | 様々な型として               |                                                      |
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

## log

### logとは

標準出力に出力する`fmt`パッケージとは異なり、標準エラー出力に設定したメッセージを出力する。

Goにはデフォルトで、ロギング用パッケージが用意されている。

> - https://pkg.go.dev/log
> - https://zenn.dev/link/comments/0247de9ed6c174

<br>

### 接尾辞`Print`メソッド

渡された値を標準出力に出力する。

**＊実装例＊**

渡された`error`インターフェースを標準出力に出力する。

```go
if err != nil {
	log.Printf("ERROR: %v", err)
}
```

<br>

### 接尾辞`Fatal`メソッド

渡された値を標準出力に出力し、`os.Exit(1)`を実行して、ステータス `1` で処理を完了する。

ただ、この仕様がわかりにくいため、`os.Exit(1)`と`log.Printf`関数を別々に実行した方が良い。

**＊実装例＊**

渡された`error`インターフェースを標準出力に出力する。

```go
if err != nil {
	// 内部でos.Exit(1)を実行する。
	log.Fatalf("ERROR: %v", err)
}
```

> - https://zenn.dev/snowcrush/articles/21f28163e067cb

<br>

### 接尾辞`Panic`メソッド

渡された値を標準出力に出力し、予期せぬエラーが起きたと見なして`panic`メソッドを実行する。

補足として、`panic`メソッドによって、エラーメッセージ出力、スタックトレース出力、処理停止が行われる。

ただし、`panic`ではビルドやアーティファクト実行のエラー時に完了ステータスのみを返却することがあり、その場合に何が原因でエラーが発生したのかわからないことがあるため、非推奨である (ビルド失敗の原因がわからずに時間を溶かした経験あり) 。

> - https://github.com/golang/go/wiki/CodeReviewComments#dont-panic

**＊実装例＊**

渡された`error`インターフェースを標準出力に出力する。

```go
if err != nil {
    // panicメソッドを実行する。
    log.Panicf("ERROR: %v", err)
}
```

<br>

## net/http

### httpパッケージとは

HTTPクライアントまたはWebサーバを提供する。

そのため、GoではNginxやApacheが不要である。

ただし、Goによるwebサーバーは機能が不十分である、そのため、NginxやApacheをWebサーバとして、GoをAppサーバとして使用した方が良い。

> - https://golang.org/pkg/net/http/#pkg-index
> - https://stackoverflow.com/questions/17776584/what-are-the-benefits-of-using-nginx-in-front-of-a-webserver-for-go

<br>

### ミドルウェア処理

#### ▼ 認証系

**＊実装例＊**

HTMLをレスポンスとして返信するサーバ (`http://127.0.0.1:8080`) を起動する。

```go
package main

import (
	"log"
	"net/http"
)

// ミドルウェア処理として、Cookieヘッダーに "admin" を持つかをHandler処理前に検証する
func requireAdminCookie(handler http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		_, err := r.Cookie("admin")
		if err != nil {
			http.Error(w, "No admin cookie", http.StatusForbidden)
			return
		}
		// Cookieヘッダーに問題がなければ、引数のリクエスト処理を返却する
		handler.ServeHTTP(w, r)
	}
	return http.HandlerFunc(fn)
}

func myHandler(w http.ResponseWriter, r *http.Request) {
	// HTMLをレスポンスとして返信する。
	fmt.Fprintf(w, "<h1>Hello world!</h1>")
}

func main() {
	mux := http.NewServeMux()
	// Handler処理前にミドルウェア処理を実行する
	mux.Handle("/admin", requireAdminCookie(http.HandlerFunc(handleAdmin)))
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Print(err)
	}
}
```

> - https://journal.lampetty.net/entry/implementing-middleware-with-http-package-in-go

#### ▼ ロギング系

記入中...

#### ▼ メトリクス系

記入中...

#### ▼ リカバー系

HTTPの処理で起こったパニックを、`Internal Server Error`として処理する。

```go
package main

import (
	"log"
	"net/http"
)

// RecoverHttpMiddleware HttpHandlerのパニックをリカバーする
func RecoverHttpMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			// 事後処理
			defer func() {
				if err := recover(); err != nil && err != http.ErrAbortHandler {
					log.Printf("Failed to handle http: %v", err)
					// Internal Server Errorとして処理する
					w.WriteHeader(http.StatusInternalServerError)
				}
			}()

			next.ServeHTTP(w, r)
		}
		return http.HandlerFunc(fn)
	}
}

func myHandler(w http.ResponseWriter, r *http.Request) {
	// HTMLをレスポンスとして返信する。
	fmt.Fprintf(w, "<h1>Hello world!</h1>")
}

func main() {
	mux := http.NewServeMux()
	// Handler処理前にミドルウェア処理を実行する
	mux.Handle("/foo", RecoverHttpMiddleware(http.HandlerFunc(myHandler)))
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Print(err)
	}
}
```

> - https://medium.com/@masnun/panic-recovery-middleware-for-go-http-handlers-51147c941f9

<br>

### `Get`メソッド

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

<br>

### `Post`メソッド

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

<br>

### `NewRequest`メソッド

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
		"https://example.api.com", // URL
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

<br>

### `ListenAndServe`メソッド

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

<br>

### `NewServeMux`メソッド

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

func myHandler(w http.ResponseWriter, r *http.Request) {
	// HTMLをレスポンスとして返信する。
	fmt.Fprintf(w, "<h1>Hello world!</h1>")
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

func myHandler(w http.ResponseWriter, r *http.Request) {

	user := NewUser(1, "Hiroki")

	byteJson, err := json.Marshal(user)

	if err != nil {
		log.Print(err)
	}

	// JSONをレスポンスとして返信する。
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Write(byteJson)
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

## os

### `Open`関数

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
		log.Printf("ERROR: %v", err)
	}

	log.Printf("%v", file)
}
```

<br>

## reflect

### `TypeOf`メソッド、`ValueOf`メソッド

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

## signal

### NotifyContext

プロセスのシグナル

```go
package main

import (
    "context"
    "fmt"
    "os"
    "os/signal"
    "time"
)

func main() {

	// 割り込み処理を設定する
	ctx, stop := signal.NotifyContext(
		context.Background(),
		// 中断シグナル
		os.Interrupt,
	)

	// 処理を終了する
    defer stop()

	...
}
```

> - https://zenn.dev/nekoshita/articles/dba0a7139854bb
> - https://pkg.go.dev/context#CancelFunc

<br>

## strings

### `Builder`関数

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
