---
title: 【IT技術の知見】並行・非同期処理＠Go
description: 並行・非同期処理＠Goの知見を記録しています。
---

# 並行・非同期処理＠Go

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 処理の種類

### 単一処理

#### ▼ 単一処理とは

特定の処理のみを実行する。

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

### 並行処理

#### ▼ Goroutine による並行処理

指定した処理をバラバラに開始し、またそれぞれの処理がバラバラに終了する。

関数で Goroutine (`go func()`) を宣言すると、その関数の完了を待たずに後続の処理を並行的に実行できる。

結果、完了する順番は順不同になる。

```text
プログラムを実行する親プロセス
├─ スレッド
│  └─ プロセッサ
│     ├─ goroutine #1（HTTPリクエスト処理）
│     └─ goroutine #3（トランザクション処理）
│
├─ スレッド
│  └─ プロセッサ
│     ├─ goroutine #1（HTTPリクエスト処理）
│     └─ goroutine #2（ファイルI/O処理）
│
└─ スレッド
   └─ プロセッサ
      ├─ goroutine #1（HTTPリクエスト処理）
      └─ goroutine #2（計算処理）
```

**＊実行例＊**

```go
package main

import (
	"time"
	"fmt"
)

func main() {

	fmt.Println("main")

	go func() {
		fmt.Println("hoge")
	}()

	time.Sleep(time.Second)
}
```

> - [【Goのやさしい記事】goroutineと排他制御を10分で入門しよう！ #Go - Qiita](https://qiita.com/gold-kou/items/8e5342d8a30ae8f34dff#goroutine%E3%82%92%E5%8B%95%E3%81%8B%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B)

#### ▼ 時間のかかる処理と相性がいい

時間のかかる処理（例：`for` 文、HTTP リクエスト、ループ、ポーリング、DB 操作、ファイル操作、計算、暗号化、圧縮解凍など）と相性がいい。

```go
package main

import (
)

func main() {

	go func() {
		// for文、HTTPリクエスト、ポーリング、DB操作、ファイル操作、計算、暗号化、圧縮解凍など
		// 実装方法を調べて書く
	}()

	// 並行して実行したい処理
}
```

#### ▼ 返却処理はエラーになる

返却処理 (`return`) は、処理の完了を待つことになるため、Goroutine とは矛盾する。

そのため、Goroutine で実行する関数に返却処理があると、エラーになる。

代わりに、Goroutine 間で channel を介して処理結果を送受信する。

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

#### ▼ Goroutine を入れ子にできる

入れ子で実行した場合でも、全く独立して Goroutine を実行する。

Goroutine の親子間に依存関係はない。

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

## 02. Goroutine と合わせて使用する処理

### channel (チャネル)

#### ▼ channel とは

異なる Goroutine 間で値を送受信するキューとして動作する。

キューに値を送信し、加えてキューから値を受信できる。

![go_channel](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/go_channel.png)

```go
package main

import "fmt"

func main() {

	// チャネルを作成
	channel := make(chan string)

	// Goroutineを宣言して並行化
	go func() {
		// 時間のかかる処理
		// チャネルに値を送信する。
		channel <- "ping"
	}()

	// チャネルから値を受信する。
	value := <-channel

	fmt.Println(value)
}
```

> - [\[Golang\] チャネル \| DeKu](https://dev-yakuza.posstree.com/golang/channel/#%E3%83%81%E3%83%A3%E3%83%8D%E3%83%AB)

#### ▼ Goroutine 中断方法１ (done channel、close)

Goroutine を中断するための `done` チャネルを作成し、これを `close()` 関数で中断する。

`done` チャネルは使い捨てのため、サイズがゼロの空構造体として定義するとよい。

```go
package main

import (
	"fmt"
	"log"
)

func main() {

	// チャネルを作成
	channel := make(chan string)
	// Goroutineを中断するためのdoneチャネルを作成
	// 空構造体はサイズがゼロなため、使い捨てのチャネルと相性がいい
	done := make(chan struct{})

	// Goroutineを宣言して並行化
	go func() {
		// 時間のかかる処理
		// チャネルに値を送信する。
		channel <- "ping"
		// Goroutineを中断する
		close(done)
	}()

	for {
		select {

		// 先に終了したcaseに条件分岐する
		// チャネルから値を受信した場合
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

> - [Doneメソッド｜よくわかるcontextの使い方](https://zenn.dev/hsaki/books/golang-context/viewer/done#context%E5%B0%8E%E5%85%A5%E5%89%8D---done%E3%83%81%E3%83%A3%E3%83%8D%E3%83%AB%E3%81%AB%E3%82%88%E3%82%8B%E3%82%AD%E3%83%A3%E3%83%B3%E3%82%BB%E3%83%AB%E5%87%A6%E7%90%86)
> - https://www.reddit.com/r/golang/comments/171i5gv/context_cancel_or_done_channel/
> - [goroutine を安全に止める方法 #Go - Qiita](https://qiita.com/castaneai/items/7815f3563b256ae9b18d#%E9%80%9A%E7%9F%A5%E3%82%92%E9%80%81%E3%82%8B%E9%9A%9B%E3%81%AF-close-%E3%81%A7%E3%82%88%E3%81%84)
> - https://stackoverflow.com/a/22627240

#### ▼ Goroutine 中断方法２ (context.cancel、context.Done)

`cancel()` 関数の Goroutine の中断を検知する。

`sync.WaitGroup.Done()` 関数とは区別する。

```go
package main

import (
	"time"
	"context"
	"fmt"
	"log"
)

func main() {

	// タイムアウト時間を設定し、コンテキストを作成する
	ctx, cancel := context.WithTimeout(
        context.Background(),
		5 * time.Second,
	)

	// チャネルを作成
	channel := make(chan string)

	// Goroutineを宣言して並行化
	go func() {
		// 時間のかかる処理
		// チャネルに値を送信する。
		channel <- "ping"
		// Goroutineを中断する
		cancel()
	}()

	for {
		select {

		// 先に終了したcaseに条件分岐する
		// チャネルから値を受信した場合
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

> - [How to use the context.Done() method in Go to signal goroutine completion - DEV Community](https://dev.to/mcaci/how-to-use-the-context-done-method-in-go-22me)
> - [Go: selectでctx.Done()を受信するときの注意点 - castaneaiのブログ](https://castaneai.hatenablog.com/entry/go-select-ctx-done-tips)
> - https://www.slideshare.net/takuyaueda967/goroutine-channel-go#20

#### ▼ select

チャネルに対する格納を非同期で待機する。

```go
package main

import (
    "fmt"
    "time"
)

func main() {

	// チャネルを作成する。
    channel1 := make(chan string)
	channel2 := make(chan string)

	// Goroutineを宣言して並行化
    go func() {
		// 時間のかかる処理
		// 完了までに2秒かかるとする。
        time.Sleep(2 * time.Second)
		// 値を送信する。
		channel1 <- "one"
    }()

	// Goroutineを宣言して並行化
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

> - [サンプルで学ぶ Go 言語：Select](https://www.spinute.org/go-by-example/select.html)
> - https://leben.mobi/go/channel-and-select/go-programming/

#### ▼ WaitGroup との使い分け

channel を使用すると、異なる Goroutine 間で値を送受信できる。

そのため、Goroutine の処理結果を使用したい場合は、WaitGroup ではなく channel を使用するほうがよい。

一方で、channel では `select()` 関数が必要になって、処理が複雑になる点は注意する。

> - [GoroutineとChannel](https://zenn.dev/mikankitten/articles/6344d71f4f4920#channel-vs-waitgroup)

<br>

### WaitGroup

#### ▼ WaitGroup とは

Goroutine を宣言した関数が終了するまで、後続の処理の実行開始を待機する。

`sync.WaitGroup.Add()` 関数、`sync.WaitGroup.Done()` 関数、`sync.WaitGroup.Wait()` 関数、で制御する。

Goroutine の関数の反復処理や異なる Goroutine の関数の並行実行を待機し、そのうえで後続の処理を実行するような場合に、`WaitGroup` は役立つ。

単一の Goroutine を待機するのは順次実行と変わらないため、`WaitGroup` は使用しない。

**実行例**

実行完了に 1 秒かかる関数があると仮定する。

反復処理でこの関数をコールする場合、毎回の走査に 1 秒かかるため、反復の回数だけ秒数が増える。

しかし、各関数を Goroutine として実行すると、各反復処理を並行実行できる。

そのため、反復回数が何回であっても、およそ 1 秒で処理が終了する。

```go
package main

import (
	"sync"
	"log"
	"fmt"
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

		// Goroutineを宣言して並行化
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
> - [sync.WaitGroupの正しい使い方 #Go - Qiita](https://qiita.com/ruiu/items/dba58f7b03a9a2ffad65)

#### ▼ channel との使い分け

WaitGroup を使用すると、`Add()` 関数、`Done()` 関数、`Wait()` 関数を使用して、Goroutine を簡単に制御できる。

そのため、Goroutine の処理結果を使用したい場合は、WaitGroup ではなく channel を使用するほうがよい。

一方で、WaitGroup では Goroutine 間で値の送受信はできないことに注意する。

> - [GoroutineとChannel](https://zenn.dev/mikankitten/articles/6344d71f4f4920#channel-vs-waitgroup)

<br>

### errgroup

エラー処理を含む関数で Goroutine を宣言したいときに使用する。

<br>

