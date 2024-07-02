---
title: 【IT技術の知見】Go
description: Goの知見を記録しています。
---

# Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 導入

### 特長

| 項目                         | 説明                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 並行処理が実装可能           | 個人的にGoで最大の特長。並行処理を簡単に実装できる。並行処理しても結果に影響しなければ、処理を高速化できる。                                                                                                                                                                                                                                                                                                                      |
| ほどよくシンプル             | 黒魔術的な関数やパッケージがない一方で、基本的な機能は揃っているため、処理の可読性が高い。そのため、後続者が開発しやすく、実装がスケーリングしやすい。                                                                                                                                                                                                                                                                            |
| 型付けの厳格さと型推論       | 型付けルールが厳しく、定義に必ず型付けが必要である一方で、型推論で型付けの実装を省略できる。そのため、型付けの実装なしに静的型付けのメリットを享受できる。特にバグが許されないような基盤部分に適している。                                                                                                                                                                                                                        |
| 高速なコンパイル             | 他の静的型付け言語のJavaのコンパイルでは、コードを一度中間言語に変換し、その後機械語に翻訳する。しかしGoのコンパイルでは、プログラムを直接的に機械語に翻訳するため、より高速である。                                                                                                                                                                                                                                              |
| メモリの安全性を高める仕組み | メモリアドレスに割り当てられている数値同士を演算する『ポインタ演算』の能力を意図して廃止している。ポインタ演算の例として、10番アドレスと20番アドレスの数値を足して、30番アドレスに新しく割り当てる、といった処理を行う。この時、何らかの原因で片方のアドレスが文字列だった場合、30番アドレスに予期しない値 (数値+文字列) が割り当てられることになる。これは、不具合や悪意ある操作に繋がるため、Goではポインタ演算子の機能がない。 |
| クラスや継承がない           | 継承はカプセル化を壊すため、これを回避できる『委譲』の方が優れているとされている。そのため、思想としてクラスや継承を廃止している。埋め込みによって、委譲を実現する。                                                                                                                                                                                                                                                              |

<br>

## 02. セットアップ

### インストール

#### ▼ yumリポジトリから

```bash
$ yum install -y epel-release
$ yum install -y golang
```

> - https://www.cyberithub.com/install-go-on-centos/

<br>

### Dockerfile

#### ▼ Ginを使用する場合

```dockerfile
#===================
# Global ARG
#===================
ARG GO_VERSION=1.16.5
ARG LABEL="Hiroki <example@gmail.com>"

#===================
# Build Stage
#===================
FROM golang:${GO_VERSION} as build

# Goのディレクトリ構成規約のベストプラクティスに則った方法にする。
WORKDIR /go/src

# インストールのキャッシュを活用するためにコピーしておく。
COPY go.mod go.sum /go/src/

# モジュールをインストールする。
RUN go get github.com/cosmtrek/air@v1.27.3

COPY ../software /go/src/

# go mod tidyの実行を忘れると、次回のコンテナイメージのビルド時に、goのビルドに失敗 (missing go.sum entry for module providing package) するようになってしまう。
# @see https://stackoverflow.com/a/67203642
RUN go mod tidy \
  `# リクエストを受信する場合、アプリを実行後にコンテナがすぐ終了しないよう、起動前にフレームワークをインストールしておく。` \
  `# これにより、アプリの実行でインバウンド通信の受信が開始される。` \
  `# Goでリクエストを受信しないアプリであれば、パッケージのインストールはコンテナ起動後に実行しても良い。` \
  && go mod download -x \
  `# ビルドのアーティファクトを/go/binに配置する。` \
  `# netパッケージは標準で動的リンクのため、静的リンクを明示的に指定する必要がある。` \
  && go build -x -a -tags netgo -installsuffix netgo -o /go/bin ./cmd

#===================
# Production Stage
#===================
FROM golang:${GO_VERSION}-alpine

LABEL maintainer=${LABEL}

# マルチステージビルド
# /go/binにパスを通す。
ENV PATH $PATH:/go/bin

COPY --from=build /go /go/

WORKDIR /go/src

CMD ["/go/bin/cmd"]
```

<br>

### 環境変数

#### ▼ 一覧

```bash
$ go env

GO111MODULE="on"
GOARCH="amd64"
GOBIN=""
GOCACHE="/root/.cache/go-build"
GOENV="/root/.config/go/env"
GOEXE=""
GOFLAGS=""
GOHOSTARCH="amd64"
GOHOSTOS="linux"
GOINSECURE=""
GOMODCACHE="/go/pkg/mod"
GONOPROXY=""
GONOSUMDB=""
GOOS="linux"
GOPATH="$HOME/go"
GOPRIVATE=""
GOPROXY="https://proxy.golang.org,direct"
GOROOT="/usr/local/go"
GOSUMDB="sum.golang.org"
GOTMPDIR=""
GOTOOLDIR="/usr/local/go/pkg/tool/linux_amd64"
GCCGO="gccgo"
AR="ar"
CC="gcc"
CXX="g++"
CGO_ENABLED="0"
GOMOD="/go/src/go.mod"
CGO_CFLAGS="-g -O2"
CGO_CPPFLAGS=""
CGO_CXXFLAGS="-g -O2"
CGO_FFLAGS="-g -O2"
CGO_LDFLAGS="-g -O2"
PKG_CONFIG="pkg-config"
GOGCCFLAGS="-fPIC -m64 -fmessage-length=0 -fdebug-prefix-map=/tmp/go-build887404645=/tmp/go-build -gno-record-gcc-switches"
```

#### ▼ `CGO_ENABLED`変数

c言語製のパッケージの有効化する。

無効化しておかないと、`vet`コマンドが失敗する。

#### ▼ `GO111MODULE`変数

`go.mod`ファイルを有効化する。

#### ▼ `GOARCH`変数

コンパイラが実行されるCPUアーキテクチャを設定する。

#### ▼ `GOBIN`変数

`go install`コマンドによるアーティファクトを配置する場所を設定する。

指定がない場合、`$GOPATH/bin`になる。

#### ▼ `GOHOSTOS`変数

コンパイラが実行されるOSを設定する。

#### ▼ `GOPATH`変数

Goのファイルを管理するパスを設定する。

パスは好みであるが、`$HOME/go`とすることが多い。

ローカルマシンで仮想環境を使用せずにGoのアプリを直接的にビルドする場合、プロジェクトを`GOPATH配下に配置しなければならない。

```yaml
$GOPATH/ # 例えば、『$HOME/go』とする。
├── bin/
└── pkg/
    └── mod/
        └── github
            ├── foo-package@v1.0/
            └── foo-package@v2.0/
```

#### ▼ `GOROOT`変数

複数のバージョンのGoを管理できるようになる。

> - https://tech.librastudio.co.jp/entry/index.php/2018/02/20/post-1792/

<br>

### アップグレード

#### ▼ GitHubリポジトリ

`(1)`

: 最新のバイナルをインストールする。

```bash
$ go install golang.org/dl/go<新しいバージョン>@HEAD

$ go<新しいバージョン> download
```

`(2)`

: 新しいバージョンに切り替える。

```bash
# GOROOTの場所を見つける
$ go<新しいバージョン> env GOROOT

/home/hiroki-hasegawa/sdk/go1.22.1

$ export GOROOT=$(go1.22.1 env GOROOT)
$ export PATH=$GOROOT/bin:$PATH
$ source ~/.zshrc
```

`(3)`

: `go.mod`ファイルのGoのバージョン定義や、Goパッケージをアップグレードする。

    `-go`オプションがあるが、基本的にはgoのバイナリのバージョンをアップグレードする。

```bash
# 新しいバージョンになっていることを確認する
$ go version

$ go mod tidy -go <新しいバージョン>
```

`(4)`

: 古いバージョンのGoバイナリをアンインストールする。

```bash
# which goでバイナリの場所を確認する
$ rm -rf /usr/local/go

# もし、asdfでGoをインストールしている場合
$ asdf uninstall go <古いバージョン>
```

> - https://zenn.dev/wasuwa/articles/3d2e65516b760e
> - https://qiita.com/snyt45/items/2425a849db8947001587

#### ▼ PPAリポジトリから

`(1)`

: PPAリポジトリを登録する。

```bash
$ add-apt-repository ppa:longsleep/golang-backports
```

`(2)`

: 新しいバイナルをインストールする。

```bash
$ apt update
$ apt install golang-go
```

> - https://zenn.dev/tamagram/articles/fd744d10e2e680

<br>

## 03. ディレクトリ構成規約

### アプリの場合

```yaml
go-repository/
├── api/ # API仕様書、プロトコルバッファー
├── build/ # Dockerfileを配置するディレクトリ
├── cmd/ # main.goファイルや、サブmainパッケージを配置するディレクトリ
│   ├── main.go
│   └── foo/
│       └── foo.go
│
├── configs/
│   └── envrc.template
│
├── docs/ # ドキュメントを配置する
│   ├── BUG.md
│   ├── ROUTING.md
│   └── TODO.md
│
├── init/ # プロセスマネージャー (systemd、supervisord、など)
│
├── internal/ # cmdディレクトリ内でインポートさせないファイルを配置するディレクトリ
│   └── pkg/
│
├── pkg/ # cmdディレクトリ内でインポートする自前goパッケージを配置するディレクトリ
│   └── public/
│       └── add.go
│
├── scripts/
│   └── Makefile
│
├── test/
│   └── test.go
│
└── web/ # 画像、CSS、を配置する。
    ├── static
    └── template
```

> - https://github.com/golang-standards/project-layout

#### ▼ `bin`

ビルドされたアーティファクト (バイナリファイル) を配置するディレクトリ。

バイナリファイル名を指定すると、処理を実行できる。

`go install`コマンドは、`bin`ディレクトリ内にバイナリを保管する。

#### ▼ `pkg`

アーティファクトとは別に作成されるファイルを配置するディレクトリ

#### ▼ `src`

コードを配置するディレクトリ

<br>

### パッケージの場合

パッケージの場合、`main.go`ファイルは不要である。

その代わりに、以下を定義しておく。

- 環境変数を格納するための処理 (例：`config.go`)
- バージョンを取得するための処理 (例：`version.go`)
- 安全に処理を終了するGraceful Shutdown処理 (例：`shutdown.go`)

```yaml
go-repository/
├── config.go
├── version.go
├── foo/
├── bar/
├── baz/
└── shutdown/
└── shutdown.go
```

<br>

## 04. ファイルの要素

### package

名前空間として、パッケージ名を定義する。

`1`個のディレクトリ内では、`1`個のパッケージ名しか宣言できない。

```go
package main
```

<br>

### import

#### ▼ importとは

ビルトインパッケージ、内部パッケージ、事前にインストールされた外部パッケージを読み込む。

```go
import "<パッケージ名>"
```

インポートするということは対象に依存するということであり、互いに依存し合う循環参照エラー (`import cycle not allowed`) になる。

インターフェースと構造体の両方を同じパッケージに置いていると、インターフェースが他からインポートされ、構造体が他をインポートするようになり、発生しやすい。

![golang_import_cycle](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/golang_import_cycle.png)

#### ▼ 他の言語でGo製パッケージをインポートする

言語によっては、Go製パッケージをインポートできるパッケージが用意されている。

- `ctypes` (Python)
- `ffi` (Ruby)
- `node-ffi` (Node.js)
- `jna`、`jni`、`swig` (Java)

> - https://medium.com/learning-the-go-programming-language/calling-go-functions-from-other-languages-4c7d8bcc69bf

<br>

### func

詳しくは、関数を参考にせよ。

```go
func foo() {

}
```

<br>

### type

データ型にユーザー定義の名前をつけられる。

`func`と同じファイルに定義する。

```go
type Foo int

type Bar string

type Baz struct {
	...
}
```

<br>

### 文の区切り

Goでは文の処理はセミコロンで区切られる。

ただし、セミコロンはコンパイル時に補完され、実装時には省略できる。

<br>

## 05. 命名規則

### GitHubWikiによる規則

Goの命名規則は、GitHubのWikiに記載されている。

> - https://github.com/golang/go/wiki/CodeReviewComments

<br>

### ディレクトリ名

小文字一単語またはケバブケースで命名する。

ビルド時にシンタックスエラーとなる可能性があるため、できる限りハイフンを使用しない方が良い。

<br>

### パッケージ名

親ディレクトリ名で命名する。

また、処理中の変数名と被るとパッケージのインポートに失敗するため、変数名と被らないように、できるだけ省略しない名前の方が良い。

ただし、テストファイルに関しては、パッケージ名を『`foo_test`』として良い。

> - https://github.com/golang/go/wiki/CodeReviewComments#package-names

<br>

### モジュール名

リポジトリ名で命名する。

<br>

### ファイル名

小文字一単語またはスネークケースで命名する。

ファイル名とパッケージ名は合わせる必要はないが、自前ルールを設けても良い。

例えばドメイン駆動設計の場合、ルートエンティティのファイル名とパッケージ名を合わせるように工夫できる。

> - https://ja.stackoverflow.com/q/41599

<br>

### 関数名、type、構造名

アッパーキャメルケースまたはローワーキャメルケースで命名する。

<br>

### インターフェース名

末尾に『`er`』をつける。

> - https://golang.org/doc/effective_go#interface-names

<br>

### レシーバ名

構造体名の頭一文字または頭二文字を取って命名する。

アプリ内で構造体名の頭文字が重複すると、同じレシーバ名の構造体が乱立してしまうため、これを防ぐために二文字を取ると良い。

また、修飾語と組み合わせて構成される構造体名の場合、被修飾語の頭二文字を取る。

オブジェクト指向で使われる『`this`』『`self`』

**＊例＊**

httpClientであれば、修飾語は『`http`』被修飾語『`client`』である。

そのため、レシーバ名または引数名では『`cl`』とする。

> - https://github.com/golang/go/wiki/CodeReviewComments#receiver-names
> - https://yyh-gl.github.io/tech-blog/blog/go-ddd-entity-vo/

<br>

### 一時的な変数名

英単語の頭一文字、頭二文字、略語、で命名する。

これは、実際の処理を強調し、変数を目立たなくするためである。

ただし、スコープの大きな変数に省略した名前をつけると、重複する可能性があるため、省略せずにローワーキャメルケースで命名しても良い。

> - https://github.com/golang/go/wiki/CodeReviewComments#variable-names

省略名については、略語検索サイトで探す。

代わりに、Goリファレンスからその単語がどう省略されているかを探しても良い。

> - https://www.allacronyms.com/

<br>

### モックの変数

モック構造体を代入するための変数は、『`m`』とする。

<br>

### error構造体の変数

error構造体を変数に代入する場合、『`Err`』と接頭辞をつける。

<br>

### キー名の検証

map型やslice型で指定したキー名が存在するか検証する場合、boolean値を代入する変数を『`ok`』とする。

**＊実装例＊**

```go
package main

import (
	"fmt"
	"log"
)

func main() {
	userIds := map[string]int{
		"user_id": 1,
	}

	// user_idキーが存在する場合、okにtrueが返却される。
	userId, ok := userIds["user_id"]

	if !ok {
		fmt.Print("user_id does not exist") // 2009/11/10 23:00:00 user_id does not exist
	}

	log.Printf("%v", userId) // 1
}
```

<br>

## 06. その他のお作法

### コメントの書式

記入中...

> - https://github.com/golang/go/wiki/CodeReviewComments#comment-sentences

<br>

### Uber風のお作法

Uber社が採用しているお作法。

> - https://github.com/uber-go/guide/blob/master/style.md

<br>

### イミュータブルにできない

Goには、標準でイミュータブルの機能がなく、これを無理に実現しようとすると逆に保守性が低くなることがある。

そのため、イミュータブルにするか否かは慎重に判断する。

> - https://zenn.dev/nobonobo/articles/9a9f12b27bfde9#go%E3%81%AF%E3%81%AA%E3%81%9C%E3%82%A4%E3%83%9F%E3%83%A5%E3%83%BC%E3%82%BF%E3%83%96%E3%83%AB%E4%BF%AE%E9%A3%BE%E3%81%8C%E3%81%AA%E3%81%84%E3%81%AE%EF%BC%9F
> - https://future-architect.github.io/articles/20190713/#Q-immutable%E3%81%AA%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0%E3%81%8C%E3%81%97%E3%81%9F%E3%81%84%E3%81%AE%E3%81%A7%E3%81%99%E3%81%8C%E3%81%A9%E3%81%86%E3%81%99%E3%82%8C%E3%81%B0%E3%81%84%E3%81%84%E3%81%A7%E3%81%97%E3%82%87%E3%81%86%E3%81%8B%EF%BC%9F

<br>
