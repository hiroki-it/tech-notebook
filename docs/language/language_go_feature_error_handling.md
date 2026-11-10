---
title: 【IT技術の知見】エラー処理
description: エラー処理の知見を記録しています。
tags:
  - "言語"
  - "Go"
  - "言語機能"
---

# エラー処理

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. エラー時の事後処理

### Graceful Shutdown 処理

#### ▼ Graceful Shutdown 処理とは

正常や異常時に、プロセスの終了前に必ず実行したい関数をまとめてコールし、安全にプロセスを終了する仕組みである。

例えば、トランザクション中にエラーが起こった場合に、トランザクションの完了を待ってからプロセスを終了ステータスコード `0` (`main()` 関数の通常の終わり方) や `1` (`Fatal` 系) で終了する。

関数の実行時とは逆順で、Graceful Shutdown 処理を実行する。

1. 関数内でエラーが発生する
2. 関数内でエラーハンドリングし、関数の呼び出し元に返却する
3. エラーを `main()` 関数のレイヤーまで上げる
4. 最後に、必要な処理を実行しつつ、終了ステータスコード `0` (`main()` 関数の通常の終わり方) や `1` (`Fatal` 系) でプロセスを終える Graceful Shutdown 処理を実行する。

#### ▼ 外部パッケージからコールする

多くのパッケージでは、パッケージの処理を Graceful Shutdown するように実装している。

ここでは、`github.com/gorilla/mux` パッケージのサーバーを使用すると仮定する。

```go
package main

import (
	"net/http"
	"os"
	"time"
	"context"
	"log"
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
			log.Printf("Failed to do something: %v", err)
		}
	}()

	// もし割り込み処理が実行されると、Goroutineが終了する
	// Done()で、Goroutineの終了を検知する
	<-ctx.Done()

	// 割り込み処理の実行後から強制終了までの時間を設定する
	ctx, cancel := context.WithTimeout(
        context.Background(),
		5 * time.Second,
    )

	// タイムアウト時間経過後に処理を中断する
	defer cancel()

	// Graceful Shutdown処理を実行する
	err = srv.Shutdown(ctx)

	if err != nil {
		return err
	}
}

```

> - [Go v1.16に追加されたsignal.NotifyContextを試す](https://zenn.dev/nekoshita/articles/dba0a7139854bb)
> - [【Go】WebサーバをGraceful Shutdownしてみる](https://zenn.dev/pyotarou/articles/87d43169e0abe0)
> - [Golangで非同期処理のGraceful Shutdownを独自実装する - blog.potproject.net](https://blog.potproject.net/2019/08/29/golang-graceful-shutdown-queue-process/)

#### ▼ 自前で実装する場合

たとえ、ランタイムエラーのように処理が強制的に途中終了しても、すべての関数の最後に実行される。

- 実行したい関数を追加する関数
- 追加した関数を並行的にコールする関数

を用意する必要がある。

```go
package main

import (
    "context"
    "fmt"
    "time"
	"shutdown"
)

func main() {

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
        time.Sleep(5 * time.Second)
        fmt.Println("end hook3")
    })

    // タイムアウト時間を設定し、コンテキストを作成する
    ctx, cancel := context.WithTimeout(
        context.Background(),
        5 * time.Second,
    )

    // タイムアウト時間経過後に処理を中断する
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
		// Goroutineを宣言して並行化
        go func(i int) {
			// 時間のかかる処理
			defer wg.Done()
            hooks[i](ctx)
        }(i)
    }

	// Goroutineを中断するためのdoneチャネルを作成
	done := make(chan struct{})

	// Goroutineを宣言して並行化
	go func() {
		// 時間のかかる処理（例：for文、HTTPリクエスト、ポーリング、DB操作、ファイル操作、計算、暗号化、圧縮解凍など）
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

> - [GoでShutdown Hook - Carpe Diem](https://christina04.hatenablog.com/entry/go-shudown-hooks)
> - https://medium.com/@pthtantai97/mastering-grpc-server-with-graceful-shutdown-within-golangs-hexagonal-architecture-0bba657b8622

```go
package main

import (
    "time"
	"shutdown"
)

func init() {

	// Goroutineを宣言して並行化
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

// プロセスをGraceful Shutdownする
func GracefulShutdown() {

	hooks := hooks

	for _, fun := range hooks {
		fun()
	}
}
```

<br>

## 02. エラーキャッチ、例外スロー

### Go におけるエラーキャッチと例外スロー

#### ▼ 例外スローのある言語の場合

例外スローの意義は、以下の参考にせよ。

> - [【IT技術の知見】バリデーションロジック＠PHP - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/language/language_php_feature_validation.html)

#### ▼ Go には例外がない

例えば PHP では、エラーをキャッチし、ソフトウェア開発者がわかる言葉へ変換した例外としてスローする。

Go には例外クラスに相当するものがない。

その代わり、エラーそのものが `error` インターフェースに保持されており、これを `1` 個の値として扱える。

後続の処理で発生した `error` インターフェースを、そのまま先行の処理に返却する。

<br>

### エラーキャッチ

#### ▼ nil の比較検証

関数から返却された err インターフェースが、`nil` でなかった場合、エラーであると見なすようにする。

```go
if err != nil {
    // 何らかの処理
}
```

#### ▼ よりよいエラーメッセージ

エラーメッセージは、何をどう実行することに失敗したのか (`Failed to do something`) と、その後にプログラム上のエラー (`err` 変数) を出力する。

一方で、成功の場合は何をどう実行することに成功したのか (`Do something successfully`) を出力する。

```go
if err != nil {
	// 失敗
	log.Printf("Failed to do something: %v", err)
	return
}

// 成功
log.Print("Do something successfully")
```

<br>

### error インターフェース

#### ▼ 標準エラー

Go では複数の値を返却できるため、多くの関数ではデフォルトで、最後に `error` インターフェースが返却されるようになっている。

`error` インターフェースは暗黙的に `Error()` 関数をコールする。

```go
type error interface {
    Error() string
}
```

os パッケージの `Open()` 関数から `error` インターフェースが返却される。

`error` インターフェースは `Error()` 関数を自動的に実行し、標準エラー出力に出力する。

```go
package main

import (
	"log"
	"os"
)

func main() {
	// 処理結果とerrorインターフェースが返却される。
	file, err := os.Open("filename.txt")

	if err != nil {
		// エラーの内容を出力する。
		log.Printf("Failed to do something: %v", err)
		return
	}

	log.Printf("%v", file)
}
```

#### ▼ `New()` 関数による自前エラー

errors パッケージの `New()` 関数にエラーを設定する。

これにより、ユーザー定義のエラーを保持する `error` インターフェースを定義できる。

`error` インターフェースは `Error()` 関数を自動的に実行する。

```go
package main

import (
	"errors"
	"log"
	"os"
)

func NewError() error {
	return errors.New("<エラーメッセージ>")
}

func main() {
	file, err := os.Open("filename.txt")

	if err != nil {
		// 自前エラーメッセージを設定する。
		myErr := NewError()
		log.Printf("Failed to do something: %v", myErr)
		return
	}

	log.Printf("%v", file)
}
```

> - https://golang.org/pkg/errors/#New

#### ▼ `fmt.Errorf()` 関数による自前エラー

fmt パッケージの `Errorf()` 関数で自前エラーを作成できる。

事前に定義したフォーマットを元にエラーを設定する。

これにより、ユーザー定義のエラーを保持する `error` インターフェースを定義できる。

`error` インターフェースは `Error()` 関数を自動的に実行する。

```go
package main

import (
	"log"
	"fmt"
	"os"
)

func main() {

	file, err := os.Open("filename.txt")

	if err != nil {
		fmt.Errorf("Failed to do something: %v", err)
		return
	}

	log.Printf("%v", file)
}
```

#### ▼ 構造体による自前エラー

構造体に `Error()` 関数を定義すると、この構造体に `error` インターフェースが自動的に委譲される。

これにより、ユーザー定義のエラーを保持する `error` インターフェースを定義できる。

`error` インターフェースは `Error()` 関数を自動的に実行する。

```go
package main

import (
	"log"
	"fmt"
	"os"
)

type Error struct {
	Message string
}

func (error *Error) Error() string {
	return fmt.Sprintf("Failed to do something: %v", error.Message)
}

func main() {

	file, err := os.Open("filename.txt")

	if err != nil {
		// 構造体に値を設定する。
		myError := &Error{Message: "エラーが発生したため、処理を完了しました。"}
		// 構造体をコールするのみで、Error関数が実行される。
		log.Printf("%v", myError)
		os.Exit(1)
	}

	log.Printf("%v", file)
}
```

> - https://golang.org/pkg/fmt/#Errorf

<br>

### xerrors パッケージ

#### ▼ xerrors パッケージとは

標準の errors パッケージには、エラーにスタックトレース情報が含まれていない。

xerrors パッケージによって作成される `error` インターフェースには、返却された行数がスタックトレースとして含まれている。

#### ▼ `New()` 関数によるトレース付与

```go
package main

import (
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
		log.Printf("Failed to do something: %+v\n", errWithStack)
		return
	}

	log.Printf("%v", file)
}
```

#### ▼ `Errorf()` 関数によるトレース付与

```go
package main

import (
	"golang.org/x/xerrors"
	"log"
	"os"
)

func main() {

	file, err := os.Open("filename.txt")

	if err != nil {
		// errorインターフェースが返却された行数が付与される。
		errWithStack := xerrors.Errorf("Failed to do something: %w", err)
		// %+v\n を使用する。
		log.Printf("Failed to do something: %+v\n", errWithStack)
		return
	}

	log.Printf("%v", file)
}
```

<br>

