---
title: 【IT技術の知見】メソッド@Go
description: メソッド@Goの知見を記録しています。
---

# メソッド@Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 関数の種類

### 実行タイミング

`import`、`const`、`var`、`init`関数の順で実行する。

> - https://stackoverflow.com/a/49831018

### init関数

#### ▼ init関数とは

パッケージを`import`したタイミングで実行する。

`main.go`ファイル上で使用すれば`main`関数より先に、それ以外のパッケージで使用すればそのパッケージ上の関数で一番最初に実行できる。

なお、`init`関数は`init.go`ファイルとして切り分けた方が良い。

> - https://one-sthead.hatenablog.com/entry/2021/01/19/191538

<br>

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
	log.Printf("%v", "Hello world!")
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

> - https://www.educative.io/answers/what-is-the-difference-between-a-method-and-a-function

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

#### ▼ 関数名の取得

`runtime.Caller(1)`から、ランタイムの情報を取得できる。

これを使用して、現在実行中の関数名を取得する。

構造体のメソッドで実行すれば、メソッド名を取得できる。

```go
package main

import (
    "fmt"
    "runtime"
)

// 関数名を取得する
// ここでは構造体がいないため、関数名を取得するとする
func GetCurrentFunctionName() string {

	// 他に実行中ファイルや行数も取得できる
	// @see https://pkg.go.dev/runtime#Caller
	pc, _, _, ok := runtime.Caller(1)

	if !ok {
		return "unknown"
	}

	fn := runtime.FuncForPC(pc)

	if fn == nil {
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

> - https://forum.golangbridge.org/t/get-function-name/31529/3
> - https://www.sobyte.net/post/2022-06/go-func-caller/#usage-examples
> - https://stackoverflow.com/a/57949382

#### ▼ 現在のモジュール名の取得

`debug.ReadBuildInfo()`を使用して、現在実行中のモジュール名を取得する。

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

// 以下のモジュール名とする
-- go.mod --
module example.com/foo
```

#### ▼ 引数の型

引数の型として、構造体の場合はポインタ型、それ以外のデータの場合はポインタ型以外が推奨される。

> - https://github.com/golang/go/wiki/CodeReviewComments#pass-values

#### ▼ クロージャー (無名関数) とは

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

	log.Printf("%v", result)
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

	log.Printf("%v", result)
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

    log.Printf("%v", age.printAge())
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

	log.Printf("%v", person.GetName()) // "Hiroki"
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

	log.Printf("%v", person.GetName()) // "Gopher"
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

	log.Printf("%v", person.GetName()) // "Hiroki"
}
```

<br>

### defer関数

#### ▼ defer関数とは

特定の関数の最後に必ず実行される遅延実行関数のこと。

たとえ、ランタイムエラーのように処理が強制的に途中終了しても、その関数の最後に実行される。

#### ▼ 複数のdefer関数

deferは複数の関数で宣言できる。

複数宣言した場合、後に宣言されたものから実行される。

**＊実装例＊**

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

`recover`関数を実行すると、panicになったその処理のみを終了し、他の並行処理を実行し続けられる。

即時関数を`defer`関数化している。

処理の最後にランタイムエラーが発生したとき、これを`recover`メソッドで吸収できる。

**＊実装例＊**

```go
package main

import "fmt"

func main() {
	fmt.Println("Start")

	// 事後処理
	defer func() {

		// リカバリー処理を実行する
		err := recover()

		if err != nil {
			log.Printf("Failed to run application: %v" %v", err)
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

> - https://go.dev/doc/effective_go#recover
> - https://qiita.com/a-kym/items/1e7c646a776c5b541883

#### ▼ Close処理

```go

```

<br>

### import

#### ▼ 通常のインポート

```go
package main

import "<パッケージ名>"
```

#### ▼ ブランクインポート

Goでは、依存先のパッケージをインポートしなければならず、またこれをインポートしないとエラーになる。

そこで、依存関係のパッケージを読み込むだけで使用しないようにするため、パッケージ名を`_`で宣言する。

```go
package main

import _ "<パッケージ名>"
```

> - https://hogesuke.hateblo.jp/entry/2014/09/12/080005

<br>

## 01-02. 関数の出入力

### 引数のデフォルト値

#### ▼ Functional Options Pattern

Functional Options Patternを使用して、デフォルト値を実現する。

このパターンでは、関数の引数に『デフォルト値を設定する関数』を渡す。

```go
package main

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
		// タイムアウト値を設定する
		option(&srv)
	}

	return &srv, nil
}

func main() {

	...

	srv, err := NewServer(
		"localhost",
		// Timeout関数を引数に渡す
		Timeout(30),
	)

	...
}
```

> - https://qiita.com/yoshinori_hisakawa/items/f0c326c99fec116070d4
> - https://blog.kazu69.net/2018/02/22/golang-functional-options/

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
	log.Printf("商=%d、余り=%d", q, r)
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
    log.Printf("%v", file)
}
```

<br>

## 01-03. エラー時の事後処理

### Graceful Shutdown処理

#### ▼ Graceful Shutdown処理とは

プロセスの終了前に必ず実行したい関数をまとめてコールし、安全にプロセスを終了する仕組みである。

例えば、トランザクション中にエラーが起こった場合に、トランザクションの完了を待ってからプロセスを終了する。

関数の実行時とは逆順で、Graceful Shutdown処理を実行する。

#### ▼ 外部パッケージからコールする

多くのパッケージでは、パッケージの処理をGraceful Shutdownするように実装している。

ここでは、`github.com/gorilla/mux`パッケージのサーバーを使用するとする。

```go
package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os/signal"
	"syscall"

	"github.com/gorilla/mux"
)

func main() {

	// 割り込み処理を設定する
	ctx, stop := signal.NotifyContext(
		context.Background(),
		// SIGTERMシグナル
		syscall.SIGTERM,
		// 中断シグナル
		os.Interrupt,
		// Killシグナル
		os.Kill,
    )

	defer stop()

	srv := &http.Server{
		Addr:    port,
		Handler: mux,
	}

	// Goroutineでサーバーを起動する
	go func() {
		if err := srv.ListenAndServe(); err != nil {
			log.Print(err)
		}
	}()

	// もし割り込み処理が実行されると、Goroutineが終了する
	// Done()で、Goroutineの終了を検知する
	<-ctx.Done()

	// 割り込み処理の実行後から強制終了までの時間を設定する
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

    // タイムアウトの場合に処理を中断する
	defer cancel()

	// Graceful Shutdown処理を実行する
	err = srv.Shutdown(ctx)

	if err != nil {
		return err
	}
}

```

> - https://zenn.dev/nekoshita/articles/dba0a7139854bb
> - https://zenn.dev/pyotarou/articles/87d43169e0abe0
> - https://blog.potproject.net/2019/08/29/golang-graceful-shutdown-queue-process/

#### ▼ 自前で実装する

たとえ、ランタイムエラーのように処理が強制的に途中終了しても、全ての関数の最後に実行される。

- 実行したい関数を追加する関数
- 追加した関数を並行的にコールする関数

を用意する必要がある。

**＊実装例＊**

```go
package main

import (
	"shutdown"
)

func main()

    shutdown.Add(func(ctx context.Context) {
        fmt.Println("start hook1")
        time.Sleep(3 * time.Second)
        fmt.Println("end hook1")
    })

    shutdown.Add(func(ctx context.Context) {
        fmt.Println("start hook2")
        time.Sleep(3 * time.Second)
        fmt.Println("end hook2")
    })

    shutdown.Add(func(ctx context.Context) {
        fmt.Println("start hook3")
        time.Sleep(10 * time.Second)
        fmt.Println("end hook3")
    })

    // タイムアウト時間設定済みのコンテキストを作成する
    ctx, cancel := context.WithTimeout(
        context.Background(),
        5 * time.Second,
    )

	// タイムアウトの場合に処理を中断する
    defer cancel()

	shutdown.Invoke(ctx)
}
```

```go
package shutdown

import (
    "context"
    "sync"
)

var (
	mu    sync.Mutex
	hooks []func(context.Context)
)

// 実行したい関数を追加する関数
func Add(h func(ctx context.Context)) {

	mu.Lock()
    defer mu.Unlock()

    hooks = append(hooks, h)
}

// 追加した関数を並行的にコールする関数
func Invoke(ctx context.Context) error {

	mu.Lock()
    defer mu.Unlock()
    wg := new(sync.WaitGroup)
    wg.Add(len(hooks))

    // Goroutineの関数を反復処理する
    for i := range hooks {
		// Goroutineを宣言して並列化
        go func(i int) {
			// 時間のかかる処理
			defer wg.Done()
            hooks[i](ctx)
        }(i)
    }

	// Goroutineを中断するためのdoneチャンネルを作成
	done := make(chan struct{})

	// Goroutineを宣言して並列化
	go func() {
		// 時間のかかる処理
		wg.Wait()
		// Goroutineを終了する
        close(done)
    }()

    select {
    // close関数が実行された場合
    case <-done:
        return nil
    // cancel関数が実行された場合
    case <-ctx.Done():
        return ctx.Err()
    }
}
```

> - https://christina04.hatenablog.com/entry/go-shudown-hooks
> - https://medium.com/@pthtantai97/mastering-grpc-server-with-graceful-shutdown-within-golangs-hexagonal-architecture-0bba657b8622

**＊実装例＊**

```go
package main

import (
	"shutdown"
)

func init() {

	// Goroutineを宣言して並列化
	go func() {
		// 時間のかかる処理
		for {
			// 関数を返却する関数
			shutdownHook, err := returnFunctions()
			if err != nil {
				time.Sleep(3 * time.Second)
				continue
			}
			shutdown.AddShutdownHook(shutdownHook)
			break
		}
	}()
}
```

```go
package shutdown

var hooks = make([]func(), 0)

// プロセスの終了前に実行したい関数を追加する
func AddShutdownHook(hook func()) {

	hooks = append(hooks, hook)
}

// プロセスを安全に終了する
func GracefulShutdown() {

	hooks := hooks

	for _, fun := range hooks {
		fun()
	}
}
```

<br>

## 02. 変数

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

import "fmt"

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

関数の外部で定義された変数のこと。

スコープとして、宣言されたパッケージ外部でも使用できる。

**＊実装例＊**

グローバル変数を宣言し、関数内で値を代入する。

```go
package main

import "fmt"

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

import "fmt"

// エラーになってしまう。
text := "Hello World!"

func main() {
    log.Printf("%v", text)
}
```

> - https://recursionist.io/learn/languages/go/data-type/variable

#### ▼ ローカル変数

関数の内部で定義された変数のこと。

スコープとして、宣言されたパッケージ内部でしか使用できない。

**＊実装例＊**

```go
package main

import "fmt"

func main() {
    // ローカル変数
    text := "Hello World!"
    log.Printf("%v", text)
}
```

> - https://recursionist.io/learn/languages/go/data-type/variable

<br>

## 03. 定数

### 環境変数

#### ▼ `init`関数による環境変数出力

環境変数は、`.env`ファイルを使用する以外に、`init`関数で出力する方法もある。

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

パッケージ側では、アプリが設定した環境変数を出力できるような処理が必要になる。

この時、フォールバック (変数や定数に値が格納されていない場合に、代わりに使用する処理) で環境変数を取得すると、デフォルト値を設定できる。

環境変数がstring型かfloat64型かに合わせて、関数を定義しておく。

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
)

var (
	Foo string
	Bar string
	Baz string
)

func init() {

	// 環境変数名を指定して値を取得する
	foo := getStringEnv(FooEnvKey, "foo")
	bar := getStringEnv(BarEnvKey, "bar")
	baz := getFloatEnv(BazEnvKey, 1.0)
}

// ゲッター
func GetFoo() string {
    return foo
}

func GetBar() string {
	return bar
}

func GetBaz() string {
	return baz
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
	value, err := strconv.ParseFloat(getStringEnv(key, "1.0"), 64)
	if err != nil {
		return fallback
	}
	return value
}
```

> - https://stackoverflow.com/a/40326580
> - https://hawksnowlog.blogspot.com/2019/09/set-default-value-for-envval.html

<br>

## 04. スコープ

### 変数、定数

#### ▼ パッケージ内外から参照可能

変数名または定数名の頭文字を大文字すると、パッケージ内外でこれをコールできるようになる。

**＊実装例＊**

```go
package foo

// 定数を定義する。
const (
	Foo  = "foo"
)
```

```go
package main

import "fmt"

func main() {
    log.Printf("%v", Foo) // foo
}
```

#### ▼ パッケージ内のみ参照可能

変数名または定数名の頭文字を小文字すると、パッケージ外でこれをコールできなくなる。

**＊実装例＊**

```go
package foo

// 定数を定義する。
const (
	Bar  = "bar"
)
```

```go
package main

import "fmt"

func main() {
    log.Printf("%v", Bar) // コールできずにエラーになる
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

## 05. 制御文

### 条件文

#### ▼ 初期化ステートメント

以下の二つの実装例は同じである。

```go
package main

import (
	"fmt"
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
	"fmt"
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

#### ▼ `if else-if`の代替

Goには`if else-if`があるが、可読性が低い場合は代わりに`if`を連続させる。

事前に`var`で変数を宣言し、各`if`内で変数に値を格納する。

```go
package main

import (
	"fmt"
)

func getFooX() {
	return "FooX"
}

func getFooY() {
	return "FooY"
}

func getFooZ() {
	return "FooZ"
}

func main() {

	var foo string

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

<br>

### 配列またはスライスの走査

#### ▼ `for ... range`

配列またはスライスを走査する。

PHPの`foreach`に相当する。

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

## 06. 処理の種類

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

**＊実装例＊**

```go
...
```

> - https://golang.org/pkg/sync/

<br>

### 並列処理

#### ▼ Goroutineによる並列処理

指定した処理を同時に開始し、それぞれの処理が独立して完了する。

結果、完了する順番は順不同になる。

関数でGoroutine (`go func()`) を宣言すると、その関数の完了を待たずに後続の処理を実行できる。

```go
package main

import (
	"fmt"
	"time"
)

func main() {

    // 6秒の待機後に、quitチャンネルにtrueを格納する
	time.Sleep(time.Second * 6)
	quit <- true

	select {

	// quitチャンネルへのtrueの格納を待機しつつ、Afterの完了も並列的に待機する
	// 先に終了した方のcaseを実行する
	case <-time.After(time.Second * 5):
		fmt.Println("timeout")

	case <-quit:
		fmt.Println("quit")
	}

	fmt.Println("done")
}
```

> - https://build.yoku.co.jp/articles/r_0fovjatm7r#section_2_subsection_1

#### ▼ 返却処理はエラーになる

関数でGoroutine (`go func()`) を宣言すると、その関数の完了を待たずに後続の処理を実行できる。

返却処理 (`return`) は、処理の完了を待つことになるため、Goroutineとは矛盾する。

そのため、Goroutineで実行する関数に返却処理があると、エラーになる。

代わりに、Goroutine間でchannelを介して処理結果を送受信する。

```go
package main

import (
	"fmt"
)

func main() {

	// "unexpected go" というエラーになる
	result := go foo()

	fmt.Println(result)
}

func foo() string {
	return "foo"
}
```

> - https://stackoverflow.com/a/41439170

#### ▼ Goroutineを入れ子にできる

入れ子で実行した場合でも、全く独立してGoroutineを実行する。

Goroutineの親子間に依存関係はない。

```go
package main

import (
	"fmt"
)

func main() {

	go foo()

	// Goroutineを宣言したfoo関数の完了を待たない
	fmt.Println("baz")
}

func foo() string {

	go func() {
		fmt.Println("bar")
    }

	// Goroutineを宣言した無名関数の完了を待たない
	fmt.Println("foo")
}
```

> - https://stackoverflow.com/questions/21789287/should-we-do-nested-goroutines

<br>

## 06-02. Goroutineと合わせて使用する処理

### channel (チャンネル)

#### ▼ channelとは

異なるGoroutine間で値を送受信するキューとして動作する。

キューに値を送信し、加えてキューから値を受信できる。

![go_channel.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/go_channel.png)

```go
package main

import "fmt"

func main() {

	// チャンネルを作成
	channel := make(chan string)

	// Goroutineを宣言して並列化
	go func() {
		// 時間のかかる処理
		// チャンネルに値を送信する。
		channel <- "ping"
	}()

	// チャンネルから値を受信する。
	value := <-channel

	fmt.Println(value)
}
```

> - https://dev-yakuza.posstree.com/golang/channel/#%E3%83%81%E3%83%A3%E3%83%8D%E3%83%AB

#### ▼ Goroutine中断 (done channel、close)

Goroutineを中断するための`done`チャンネルを作成し、これを`close`関数で中断する。

```go
package main

import (
	"context"
	"fmt"
	"log"
)

func main() {

	// タイムアウト時間設定済みのコンテキストを作成する
	ctx, cancel := context.WithCancel(
        context.Background()
    )

	// チャンネルを作成
	channel := make(chan string)
	// Goroutineを中断するためのdoneチャンネルを作成
	done := make(chan struct{})

	// Goroutineを宣言して並列化
	go func() {
		// 時間のかかる処理
		// チャンネルに値を送信する。
		channel <- "ping"
		// Goroutineを中断する
		close(done)
	}()

	for {
		select {

		// チャンネルから値を受信した場合
		case value := <-channel:
			fmt.Println(value)

		// cancel関数が実行された場合
		case <-done:
			log.Printf("Goroutineが完了しました")
			return
		}
	}
}
```

> - https://zenn.dev/hsaki/books/golang-context/viewer/done#context%E5%B0%8E%E5%85%A5%E5%89%8D---done%E3%83%81%E3%83%A3%E3%83%8D%E3%83%AB%E3%81%AB%E3%82%88%E3%82%8B%E3%82%AD%E3%83%A3%E3%83%B3%E3%82%BB%E3%83%AB%E5%87%A6%E7%90%86
> - https://www.reddit.com/r/golang/comments/171i5gv/context_cancel_or_done_channel/
> - https://qiita.com/castaneai/items/7815f3563b256ae9b18d#%E9%80%9A%E7%9F%A5%E3%82%92%E9%80%81%E3%82%8B%E9%9A%9B%E3%81%AF-close-%E3%81%A7%E3%82%88%E3%81%84

#### ▼ Goroutine中断 (context.cancel、context.Done)

`cancel`関数のGoroutineの中断を検知する。

`sync.WaitGroup.Done`関数とは区別する。

```go
package main

import (
	"context"
	"fmt"
	"log"
)

func main() {

	// タイムアウト時間設定済みのコンテキストを作成する
	ctx, cancel := context.WithCancel(
        context.Background()
    )

	// チャンネルを作成
	channel := make(chan string)

	// Goroutineを宣言して並列化
	go func() {
		// 時間のかかる処理
		// チャンネルに値を送信する。
		channel <- "ping"
		// Goroutineを中断する
		cancel()
	}()

	for {
		select {

		// チャンネルから値を受信した場合
		case value := <-channel:
			fmt.Println(value)

		// cancel関数が実行された場合
		case <-ctx.Done():
			log.Printf("Goroutineが完了しました")
			return
		}
	}
}
```

> - https://dev.to/mcaci/how-to-use-the-context-done-method-in-go-22me
> - https://castaneai.hatenablog.com/entry/go-select-ctx-done-tips
> - https://www.slideshare.net/takuyaueda967/goroutine-channel-go#20

#### ▼ select

チャンネルに対する格納を非同期で待機する。

```go
package main

import (
    "fmt"
    "time"
)

func main() {

	// チャンネルを作成する。
    channel1 := make(chan string)
	channel2 := make(chan string)

	// Goroutineを宣言して並列化
    go func() {
		// 時間のかかる処理
		// 完了までに2秒かかるとする。
        time.Sleep(2 * time.Second)
		// 値を送信する。
		channel1 <- "one"
    }()

	// Goroutineを宣言して並列化
    go func() {
		// 時間のかかる処理
		// 完了までに1秒かかるとする。
        time.Sleep(1 * time.Second)
		// 値を送信する。
		channel2 <- "two"
    }()

    for i := 0; i < 2; i++ {
        select {
		// Goroutineの処理の完了タイミングがバラバラになる
		// channel1とchannel2の受信を非同期で待機し、受信した順番で処理する。
		// channel1 <- "one" を受信したタイミングで出力する
        case msg1 := <-channel1:
            fmt.Println("received", msg1)
        // channel2 <- "two" を受信したタイミングで出力する
		case msg2 := <-channel2:
            fmt.Println("received", msg2)
		// 受信が成功しなければ、defaultで処理する。
        default:
			fmt.Println("default")
		}
    }
}
```

> - https://www.spinute.org/go-by-example/select.html
> - https://leben.mobi/go/channel-and-select/go-programming/

#### ▼ WaitGroupとの使い分け

channelを使用すると、異なるGoroutine間で値を送受信できる。

そのため、Goroutineの処理結果を使用したい場合は、WaitGroupではなくchannelを使用する方が良い。

一方で、channelでは`select`関数が必要になり、処理が複雑になることに注意する。

> - https://zenn.dev/mikankitten/articles/6344d71f4f4920#channel-vs-waitgroup

<br>

### WaitGroup

#### ▼ WaitGroupとは

Goroutineを宣言した関数が終了するまで、後続の処理の実行開始を待機する。

`sync.WaitGroup.Add`関数、`sync.WaitGroup.Done`関数、`sync.WaitGroup.Wait`関数、で制御する。

Goroutineの関数の反復処理や異なるGoroutineの関数の並列実行を待機し、その上で後続の処理を実行するような場合に、`WaitGroup`は役立つ。

単一のGoroutineを待機するのは順次実行と変わらないので、`WaitGroup`は使わない。

**実行例**

実行完了に1秒かかる関数があると仮定する。

反復処理でこの関数をコールする場合、毎回の走査に1秒かかるため、反復の回数だけ秒数が増える。

しかし、各関数をGoroutineとして実行すると、各反復処理を並列実行できる。

そのため、反復回数が何回であっても、およそ1秒で処理が終了する。

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {

	slice := []string{"a", "b", "c"}

	wg := &sync.WaitGroup{}

	// 処理の開始時刻を取得
	start := time.Now()

    // Goroutineの関数を反復処理する
	// a、b、c、の分だけ反復する
	for key, value := range slice {

		// インクリメントする
		// 完了の待機カウンターを設定する
		wg.Add(1)

		// Goroutineを宣言して並列化
		go func(key int, value string) {

			print(key, value)
			// デクリメントする
			// Wait関数のカウンターを減らす
			wg.Done()
		}(key, value)
	}

	// カウンターがゼロになるまで待機する
	// 全てのGorourineでDone関数を実行するのを待機する
	wg.Wait()

	// 開始時刻から経過した秒数を取得する
	log.Printf("経過秒数: %s\n", time.Since(start))
}

func print(key int, value string) {
	fmt.Println(key, value)
}

// 2 c
// 0 a
// 1 b
// 経過秒数: 1s
```

> - https://free-engineer.life/golang-sync-waitgroup/
> - https://qiita.com/ruiu/items/dba58f7b03a9a2ffad65

#### ▼ channelとの使い分け

WaitGroupを使用すると、`Add`関数、`Done`関数、`Wait`関数を使用して、Goroutineを簡単に制御できる。

そのため、Goroutineの処理結果を使用したい場合は、WaitGroupではなくchannelを使用する方が良い。

一方で、WaitGroupではGoroutine間で値の送受信はできないことに注意する。

> - https://zenn.dev/mikankitten/articles/6344d71f4f4920#channel-vs-waitgroup

<br>

### errgroup

エラー処理を含む関数でGoroutineを宣言したい時に使用する。

<br>

## 07. エラーキャッチ、例外スロー

### Goにおけるエラーキャッチと例外スロー

#### ▼ 例外スローのある言語の場合

例外スローの意義は、以下の参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/language/language_php_logic_validation.html

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
		log.Printf("ERROR: %v", err)
		return
	}

	log.Printf("%v", file)
}
```

#### ▼ `New`関数による独自エラー

errorsパッケージの`New`メソッドにエラーを設定する。

これにより、ユーザー定義のエラーを保持するerrorインターフェースを定義できる。

errorインターフェースはErrorメソッドを自動的に実行する。

> - https://golang.org/pkg/errors/#New

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
		log.Printf("ERROR: %v", myErr)
		return
	}

	log.Printf("%v", file)
}
```

#### ▼ `fmt.Errorf`メソッドによる独自エラー

fmtパッケージの`Errorf`メソッドで独自エラーを作成できる。

事前に定義したフォーマットを元にエラーを設定する。

これにより、ユーザー定義のエラーを保持するerrorインターフェースを定義できる。

errorインターフェースはErrorメソッドを自動的に実行する。

> - https://golang.org/pkg/fmt/#Errorf

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
		fmt.Errorf("ERROR: %v", err)
		return
	}

	log.Printf("%v", file)
}
```

#### ▼ 構造体による独自エラー

構造体に`Error`メソッドを定義すると、この構造体にerrorインターフェースが自動的に委譲される。

これにより、ユーザー定義のエラーを保持するerrorインターフェースを定義できる。

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
	return fmt.Sprintf("ERROR: %v", error.Message)
}

func main() {

	file, err := os.Open("filename.txt")

	if err != nil {
		// 構造体に値を設定する。
		myError := &Error{Message: "エラーが発生したため、処理を完了しました。"}
		// 構造体をコールするのみで、Errorメソッドが実行される。
		log.Printf("%v", myError)
		os.Exit(1)
	}

	log.Printf("%v", file)
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
		log.Printf("ERROR: %+v\n", errWithStack)
		return
	}

	log.Printf("%v", file)
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
		log.Printf("ERROR: %+v\n", errWithStack)
		return
	}

	log.Printf("%v", file)
}
```

<br>

## 08. テンプレート

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

Goのテンプレートでは、『`{{ `』と『`}}`』の記号がロジックで使用される。

これを文字として使用する場合は、ロジックとして認識されないようにエスケープする必要がある。

#### ▼ {{ "<記号>" }}

各記号を`{{ "<記号>" }}`のように挟み、エスケープする。

```yaml
{{ " {{ " }} foo {{ " }} " }}
```

> - https://stackoverflow.com/a/17642427

#### ▼ {{ `<記号を含む文字>` }}

記号を含む文字ごと``{{ `<記号を含む文字列全体>` }}``のように挟み、エスケープする。

多くの場合にこの方法で対処できるが、文字列内にバックスラッシュがある場合は対処できない。

```yaml
{{ `{{  foo  }}` }}
```

> - https://stackoverflow.com/a/38941123

<br>

## 09. テスト

### 事前/事後処理

```go
package integration

import (
	"net/http"
	"testing"
)

// setup ユニットテストの前処理の結果と，後処理の関数を返却します．
func setup() (*http.Client, func()) {

	// クライアントを作成します．
	client := &http.Client{}

	return client, func() {
		// 事後処理
	}
}

// TestIntegration 統合テストを実行します．
func TestIntegration(t *testing.T) {

	t.Helper()
	client, teardown := setup()
	defer teardown()

	...
}
```

<br>
