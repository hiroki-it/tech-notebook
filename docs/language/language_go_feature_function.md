---
title: 【IT技術の知見】関数＠Go
description: 関数＠Goの知見を記録しています。
---

# 関数＠Go

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 関数の種類

### 実行タイミング

`import`、`const`、`var`、`init()` 関数の順で実行する。

> - https://stackoverflow.com/a/49831018

### init 関数

#### ▼ init 関数とは

パッケージを `import` したタイミングで実行する。

`main.go` ファイル上で使用すれば `main()` 関数より先に、それ以外のパッケージで使用すればそのパッケージ上の関数で一番最初に実行できる。

なお、`init()` 関数は `init.go` ファイルとして切り分けたほうがよい。

> - [golangのinit関数は複数回定義できる - One Step Ahead](https://one-sthead.hatenablog.com/entry/2021/01/19/191538)

#### ▼ `log` パッケージは使用できない

仕様上、`init()` 関数内で `log` パッケージを使用できない。

> - [Why does initiating a logger in init function not working outside the init func? - #2 by nizigama - Getting Help - Go Forum](https://forum.golangbridge.org/t/why-does-initiating-a-logger-in-init-function-not-working-outside-the-init-func/23211/2)

<br>

### main 関数

#### ▼ `main()` 関数とは

go のエントリーポイントとなる。

go のプログラムが起動したときに、各パッケージの `init()` 関数が実行された後、`main()` 関数が実行される。

`main()` 関数をビルド対象に指定すると、これを開始点として読み込まれるファイルが枝分かれ状にビルドされていく。

ステータス『0』でプロセスを終了する。

```go
package main

import (
	"log"
)

func main() {
	log.Printf("%v", "Hello world!")
}
```

当然、`main` パッケージや `main()` 関数がないと、go のプログラムの起動時にエラーが発生する。

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

#### ▼ 処理の終え方

`panic()` 関数は、プロセスを強制的に終了する。

`defer()` 関数があれば、`panic()` 関数の前にこれを実行する。

一番強い終了方法であり、基本的には `defer()` 関数と `recover()` 関数と組み合わせて使用する。

```go
package main

import (
	"fmt"
)

func main() {

	// ...

	if err != nil {
		panic(fmt.Sprintf("Failed to do something: %v", err))
	}

	// ...
}
```

`Exit()` 関数は、設定した終了コード (`0` 以外) でプロセスを強制的に終了する。

一般的な強制終了方法である。

`defer()` 関数があても、これを実行せずにプロセスを終了する。

```go
package main

import "os"

func main() {

	// ...

	if err != nil {
		os.Exit(1)
	}

	// ...
}
```

`Goexit()` 関数は、プロセスを強制的に終了する。

`defer()` 関数があれば、`panic()` 関数の前にこれを実行する。

また、Goroutine があればこれを待つ。

`main()` 関数では実行しないほうがよい。

```go
package main

import "runtime"

func main() {

	// ...

	if err != nil {
		runtime.Goexit()
	}

	// ...
}
```

> - [【Golang】Exit, panic, Goexitの違い](https://blog.logicoffee.tech/posts/programming/golang-exit.html)
> - [Goでプログラムを終了するときのお作法 - My External Storage](https://budougumi0617.github.io/2021/06/30/which_termination_method_should_choose_on_go/#go%E3%81%A7%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%A0%E3%82%92%E7%B5%82%E4%BA%86%E3%81%95%E3%81%9B%E3%82%8B%E6%96%B9%E6%B3%95)
> - [Go言語のエラーハンドリングについて ～panic編～ #Go - Qiita](https://qiita.com/nayuneko/items/9534858156dfd50b43fb#panic%E3%82%92%E3%83%AA%E3%82%AB%E3%83%90%E3%83%BC%E3%81%99%E3%82%8Brecoverdefer)
> - [Go言語のエラーハンドリングについて ～panic編～ #Go - Qiita](https://qiita.com/nayuneko/items/9534858156dfd50b43fb#panic%E3%82%92%E3%83%AA%E3%82%AB%E3%83%90%E3%83%BC%E3%81%99%E3%82%8Brecoverdefer)

<br>

### 自前関数

#### ▼ 関数とは

構造体に紐付けられていない関数のこと。

> - [What is the difference between a method and a function?](https://www.educative.io/answers/what-is-the-difference-between-a-method-and-a-function)

```go
package main

import "fmt"

// 頭文字を大文字する
func Foo(foo string) {
	fmt.Println(foo)
}

func main() {
	Foo("Hello world!")
}
```

#### ▼ 関数名の取得

`runtime.Caller(1)` から、ランタイムの情報を取得できる。

これを使用して、現在実行中の関数名を取得する。

構造体の関数で実行すれば、関数名を取得できる。

```go
package main

import (
    "fmt"
    "log"
    "runtime"
)

// 関数名を取得する
// ここでは構造体がいないため、関数名を取得すると仮定する
func GetCurrentFunctionName() string {

	// 他に実行中ファイルや行数も取得できる
	// @see https://pkg.go.dev/runtime#Caller
	pc, _, _, ok := runtime.Caller(1)

	if !ok {
		log.Print("Failed to get function name")
		return "unknown"
	}

	fn := runtime.FuncForPC(pc)

	if fn == nil {
		log.Print("Failed to get function name")
		return "unknown"
	}

	return fn.Name()
}

func foo() {
	fmt.Print(GetCurrentFunctionName())
}

func main() {
	foo()
}

// main.foo
```

> - [Get function name - #3 by skillian - Getting Help - Go Forum](https://forum.golangbridge.org/t/get-function-name/31529/3)
> - [How to get the caller's function name, filename, and line number in a Go function - SoByte](https://www.sobyte.net/post/2022-06/go-func-caller/#usage-examples)
> - https://stackoverflow.com/a/57949382

#### ▼ 現在のモジュール名の取得

`debug.ReadBuildInfo()` を使用して、現在実行中のモジュール名を取得する。

```go
package main

import (
	"fmt"
	"log"
	"runtime/debug"
)

func GetCurrentModuleName() string {

	info, ok := debug.ReadBuildInfo()

	if !ok {
		log.Print("Failed to read build info")
		return "unknown"
	}

	return info.Path
}

func main() {
	fmt.Print(GetCurrentModuleName())
}

// 以下のパッケージ名とする
```

```text title=".mod"
module example.com/foo
```

#### ▼ 引数の型

引数の型は、構造体の場合はポインタ型、それ以外のデータの場合はポインタ型以外が推奨である。

> - [CodeReviewComments · golang/go Wiki · GitHub](https://github.com/golang/go/wiki/CodeReviewComments#pass-values)

#### ▼ クロージャー (無名関数) とは

名前のない関数のこと。

#### ▼ 即時関数とは

定義したその場でコールされる無名関数のこと。

main 関数で即時関数を実行する。

```go
package main

import "log"

func main() {
	result := func() string {
		return "Closure is working!"
	}()

	log.Printf("%v", result)
}
```

即時関数に引数を設定できる。

その場合、仮引数と引数の両方を設定する必要がある。

```go
package main

import "log"

func main() {
	// 仮引数を設定
	result := func(x string) string {

		return x

	}("Closure is working!") // 引数に値を渡す

	log.Printf("%v", result)
}
```

<br>

### メソッド

#### ▼ メソッドとは

データ型や型リテラルに紐付けられている関数のこと。

Go は、言語としてオブジェクトという機能を持っていないが、構造体に関数を紐付けることにより、擬似的にオブジェクトを表現できる。

> - [関数とメソッドの違いがわからなくて少し調べたので自分なりにまとめてみた #Swift - Qiita](https://qiita.com/T-N0121/items/ecf5b911463ac9fa1d3e#%E3%83%A1%E3%82%BD%E3%83%83%E3%83%89%E3%81%A8%E3%81%AF%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E6%8C%87%E5%90%91%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0%E3%81%AB%E3%81%8A%E3%81%84%E3%81%A6%E5%90%84%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%81%8C%E6%8C%81%E3%81%A3%E3%81%A6%E3%81%84%E3%82%8B%E8%87%AA%E8%BA%AB%E3%81%AB%E5%AF%BE%E3%81%99%E3%82%8B%E6%93%8D%E4%BD%9C)

#### ▼ レシーバによる紐付け

データ型や型リテラルなどを関数のレシーバとして渡すことによって、それに関数を紐付けられる。

紐付け後、関数はメソッドとも呼ばれるようになる。

関数名とフィールド名に同じ名前は使用できない。

integer 型を値レシーバとして渡し、構造体に関数を紐付ける。

```go
package main

import (
	"log"
	"fmt"
)

type Age int

func (a Age) PrintAge() string {
    return fmt.Sprintf("%dです。", a)
}

func main() {
    var age Age = 20

    log.Printf("%v", age.PrintAge())
}
```

構造体を値レシーバとして渡し、構造体に関数を紐付ける。

```go
package main

import "log"

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

	log.Printf("%v", person.GetName()) // "Hiroki"
}
```

#### ▼ 値レシーバ

構造体の実体と関数を直接的に紐付ける。

紐付け後、関数はメソッドとも呼ばれるようになる。

レシーバとして渡された引数を関数内でコピーしてから使用する。

値レシーバによって紐付けられると、その関数は構造体の状態を変えられなくなるため、構造体をイミュータブルにしたい場合は、値レシーバを使用するとよい。

構造体を値レシーバとして渡し、構造体に関数を紐付ける。

```go
package main

import "log"

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

	log.Printf("%v", person.GetName()) // "Gopher"
}
```

#### ▼ ポインタレシーバ

構造体のポインタを使用して、関数と構造体の実体を紐付ける。

紐付け後、関数はメソッドとも呼ばれるようになる。

レシーバとして渡された引数を関数内でそのまま使用する。

ポインタレシーバによって紐付けられると、その関数は構造体の状態を変えられるようになるため、構造体をミュータブルにしたい場合は、ポインタレシーバを使用するとよい。

構造体を初期化する処理を持つコンストラクタ関数のみをポインタレシーバとし、他の関数をすべて値レシーバとすると、最低限にミュータブルなプログラムを実装できる。

また、構造体はポインタ型として扱ったほうがメモリを節約できる。

```go
package main

import "log"

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

	log.Printf("%v", person.GetName()) // "Hiroki"
}
```

<br>

### defer 関数

#### ▼ defer 関数とは

特定の関数の最後に必ず実行される遅延実行関数のこと。

たとえ、ランタイムエラーのように処理が強制的に途中終了しても、その関数の最後に実行される。

#### ▼ 複数の defer 関数

defer は複数の関数で宣言できる。

複数宣言した場合、後に宣言されたものから実行される。

```go
package main

import "fmt"

func main() {

	fmt.Println("Start")

	defer fmt.Println("1")
    defer fmt.Println("2")
    defer fmt.Println("3")

	fmt.Println("End")
}

// Start
// 3
// 2
// 1
// End
```

#### ▼ ロギング処理

```go
package main

import (
	"fmt"
	"log"
)

func main() {

	fmt.Println("Start")

	// 事後処理
	defer func() {
		log.Printf("End")
	}()

	fmt.Println("Processing...")
}
```

#### ▼ リカバリー処理

`recover()` 関数を実行すると、panic になったその処理のみを終了し、他の並行処理を実行し続けられる。

即時関数を `defer()` 関数化している。

処理の最後にランタイムエラーが発生したとき、これを `recover()` 関数で吸収できる。

```go
package main

import (
	"fmt"
	"log"
)

func main() {
	fmt.Println("Start")

	// 事後処理
	defer func() {

		// リカバリー処理を実行する
		err := recover()

		if err != nil {
			log.Printf("Failed to run application: %v", err)
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

> - [Effective Go - The Go Programming Language](https://go.dev/doc/effective_go#recover)
> - [【Golang】recoverについて #Go - Qiita](https://qiita.com/a-kym/items/1e7c646a776c5b541883)

#### ▼ Close 処理

```go

```

<br>

## 02. 関数の出入力

### Variadic Functions (可変個引数関数)

要素数が自由な slice 型を引数とした場合、可変な引数を定義できる。

関数に渡す場合は、三点リーダーで slice をアンパック (`...`) する。

```go
package main

import (
	"fmt"
)

// 可変な引数
func showSlice(args ...int) {

	for index, value := range args {
		fmt.Printf("s[%d] = %d\n", index, value)
	}
}

func main() {

	// sliceを定義する
	// 要素数はいくつでもよい
	val := []int{1, 2, 3, 4, 5}

	// 変数をアンパックして渡す
	showSlice(val...)

	// 個別に渡しても同じ
	showSlice(1, 2, 3, 4, 5)
}
```

> - [Go: pack/unpack演算子と可変長引数関数・Slice](<https://zenn.dev/mikankitten/articles/cfa2ef834e338e#%E5%8F%AF%E5%A4%89%E5%80%8B%E5%BC%95%E6%95%B0%E9%96%A2%E6%95%B0(variadic-function)>)

<br>

### 引数のデフォルト値

#### ▼ Functional Options Pattern

Functional Options Pattern を使用して、引数のデフォルト値を実現する。

このパターンでは、可変個引数関数の引数に『デフォルト値を設定する関数』を渡す。

```go
package main

import (
	"net"
	"time"
)

// Optionという関数型を定義する
type Option func (*Server)

// デフォルト値を設定する関数を返却する
func Timeout (t int) Option {

	// 無名関数
	return func (s *Server) {
		s.Timeout = time.Duration(t) * time.Second
	}
}

func NewServer(addr string, options ...Option) (*Server, error) {

	l, err := net.Listen("tcp", addr)

	if err != nil {
		return nil, err
	}

	srv := Server{
		listener: l,
	}

	for _, option := range options {
		// Server構造体を渡す
		// タイムアウト時間を設定する
		option(&srv)
	}

	return &srv, nil
}

func main() {

	// ...

	srv, err := NewServer(
		"localhost",
		// Timeout関数を引数に渡す
		Timeout(30),
	)

	// ...
}
```

> - [Go言語でpythonやscalaのようなDefault引数を実現する #新人プログラマ応援 - Qiita](https://qiita.com/yoshinori_hisakawa/items/f0c326c99fec116070d4)
> - [golangの関数のオプション引数を実現する \| 69log](https://blog.kazu69.net/2018/02/22/golang-functional-options/)

#### ▼ `append()` 関数によるマージ

可変個引数関数にて、使用側で設定したパラメーターと関数内部で設定したパラメーターを `append()` 関数でマージする。

両方のパラメーターは slice 型であるため、`append()` 関数でマージできる。

パラメーターと `append()` 関数の返り値の両方の slice を、アンパック (`...`) する必要がある。

```go
package middleware

import (
	"net/http"
	"fmt"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel/trace"
)

func HttpServerMiddleware(next http.Handler, opts ...otelhttp.Option) http.Handler {

	return otelhttp.NewHandler(
		next,
		"foo-service",
		append(opts, []otelhttp.Option{
			// デフォルト値
			filterHealthCheck(),
			WithSpanNameFormatter(),
		}...)...,
	)
}

// ヘルスチェックパスではスパンを作成しない
func filterHealthCheck() otelhttp.Option {

	return otelhttp.WithFilter(filters.All(filters.Not(filters.Path("/health"))))
}

// スパン名を作成する関数を設定する
func WithSpanNameFormatter() otelhttp.Option {

	return otelhttp.WithSpanNameFormatter(func(operation string, r *http.Request) string {
		// URLパスをスパン名とする
		spanName := r.URL.Path
		if spanName == "" {
			spanName = fmt.Sprintf("HTTP %s route not found", r.Method)
		}
		return spanName
	})
}
```

```go
package middleware

import (
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc/filters"
	"google.golang.org/grpc"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
)

// リクエストを単位としてスパンを自動的に開始/終了する
func ChainUnaryServerInterceptor(opts ...otelgrpc.Option) grpc.ServerOption {
	return grpc.ChainUnaryInterceptor(
		grpc_recovery.UnaryServerInterceptor(),
		otelgrpc.UnaryServerInterceptor(
			append(opts, []otelgrpc.Option{
				// デフォルト値
				InterceptorFilterHealthCheck(),
			}...)...,
		),
	)
}

// リクエストを単位としてスパンを自動的に開始/終了する
func ChainStreamServerInterceptor(opts ...otelgrpc.Option) grpc.ServerOption {
	return grpc.ChainStreamInterceptor(
		grpc_recovery.StreamServerInterceptor(),
		otelgrpc.StreamServerInterceptor(
			append(opts, []otelgrpc.Option{
				// デフォルト値
				InterceptorFilterHealthCheck(),
			}...)...,
		),
	)
}

// ヘルスチェックパスではスパンを作成しない
func InterceptorFilterHealthCheck() otelgrpc.Option {

	return otelgrpc.WithInterceptorFilter(filters.Not(filters.HealthCheck()))
}
```

<br>

### 返却値

#### ▼ 複数の返却値

```go
package main

import (
	"log"
)

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
	log.Printf("商=%d、余り=%d", q, r)
}
```

#### ▼ 返却値の破棄

関数から複数の値が返却されるとき、使用しない値をアンダースコアに代入することにより、これを破棄できる。

```go
package main

import (
	"log"
    "os"
)

func main() {
    // errorインターフェースを破棄
    file, _ := os.Open("filename.txt")

    // エラーキャッチする必要がなくなる
    log.Printf("%v", file)
}
```

#### ▼ 関数の返却

引数型と返却型を指定して、関数を返却できる。

`http.Handler` を引数型、`http.Handler` を返却型、として設定する。

```go
func FooMiddleware() func(http.Handler) http.Handler {

	// Handlerインターフェースを実装する関数を定義する
	fn := func(w http.ResponseWriter, r *http.Request) {

		// ミドルウェア処理
        // そのまま実装すると事前処理になる
        // deferを使用すると事後処理になる

		// 本来の処理
		next.ServeHTTP(w, r)
	}
	// Handlerインターフェースの実装をHandlerFunc型に変換する
	return http.HandlerFunc(fn)
}
```

<br>

