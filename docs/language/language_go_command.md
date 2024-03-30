---
title: 【IT技術の知見】コマンド@Go
description: コマンド@Goの知見を記録しています。
---

# コマンド@Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. goコマンド

### build

#### ▼ buildとは

指定したパスをビルド対象として、ビルドのアーティファクトを作成する。

`foo_test.go`ファイルはビルドから自動的に除外される。

```bash
# cmdディレクトリをビルド対象として、ルートディレクトリにcmdアーティファクトを作成する。
$ go build ./cmd
```

もし、ビルドのエラー時に終了ステータスのみが返却され、原因が不明の場合、`panic`メソッドが原因を握りつぶしている可能性を考える。

```bash
exit status 2. Docker build ran into internal error. Please retry. If this keeps happening, please open an issue..
```

#### ▼ `-o`

指定したパスにビルドのアーティファクトを作成する。

ビルド対象パスを指定しない場合、ルートディレクトリのgoファイルをビルドの対象とする。

```bash
# ルートディレクトリ内のgoファイルをビルド対象として
# $HOME/go/binディレクトリにルートディレクトリ名アーティファクトを作成する。
$ go build -o $HOME/go/bin
```

また、指定したパス内のgoファイルをビルド対象として、指定したパスにビルドのアーティファクトを作成もできる。

```bash
# cmdディレクトリ内のgoファイルをビルド対象として
# $HOME/go/binディレクトリにcmdアーティファクトを作成する。
$ go build -o $HOME/go/bin ./cmd
```

補足として、事前のインストールに失敗に、ビルド対象が存在していないと、以下のようなエラーになってしまう。

```bash
package foo is not in GOROOT (/usr/local/go/src/foo)
```

<br>

### clean

モジュールのキャッシュを削除する。

ローカル環境での開発中に`go install`コマンドを実行しても、モジュールをアップグレードできない場合に使用する。

```bash
$ go clean --modcache

$ go mod tidy
```

<br>

### env

#### ▼ envとは

Goに関する環境変数を出力する。

**＊実装例＊**

```bash
$ go env

# go.modの有効化
GO111MODULE="on"
# コンパイラが実行されるCPUアーキテクチャ
GOARCH="amd64"
# installコマンドによるアーティファクトを配置するディレクトリ (指定無しの場合、$GOPATH/bin)
GOBIN=""
GOCACHE="/root/.cache/go-build"
GOENV="/root/.config/go/env"
GOEXE=""
GOFLAGS=""
GOHOSTARCH="amd64"
# コンパイラが実行されるOS
GOHOSTOS="linux"
GOINSECURE=""
GOMODCACHE="/go/pkg/mod"
GONOPROXY=""
GONOSUMDB=""
GOOS="linux"
# コードが配置されるディレクトリ
GOPATH="/go"
GOPRIVATE=""
GOPROXY="https://proxy.golang.org,direct"
# Go本体を配置するディレクトリ
GOROOT="/usr/local/go"
GOSUMDB="sum.golang.org"
GOTMPDIR=""
GOTOOLDIR="/usr/local/go/pkg/tool/linux_amd64"
GCCGO="gccgo"
AR="ar"
CC="gcc"
CXX="g++"
# c言語製のパッケージの有効化。無効化しないと、vetコマンドが失敗する。
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

<br>

### fmt

#### ▼ fmtとは

指定したパスのファイルのインデントを整形する。

パスとして『`./...`』を指定して、再帰的に実行するのがおすすめ。

```bash
$ go fmt ./...
```

<br>

### install

#### ▼ installとは

`go get`コマンドとは異なり、Goのバイナリをパッケージとしてでなく、ツールとしてグローバルにインストールする。

コードと外部パッケージに対して`build`コマンドを実行することにより、`$GOPATH`以下の`bin`ディレクトリまたは`pkg`ディレクトリにインストール (配置) する。

内部または外部のコードからビルドされたアーティファクト (バイナリファイル) であれば`bin`ディレクトリ配下に配置し、それ以外 (例：`.a`ファイル) であれば`pkg`ディレクトリ配下に配置する。

```bash
$ go install
```

なお、インストールしたパッケージで`replace`を使用している場合、クローンしてから直接インストールする必要がある。

```bash
$ git clone <パッケージのリポジトリ>
$ cd <バイナリのディレクトリ>
$ go install
```

> - https://go.dev/doc/go-get-install-deprecation
> - https://github.com/golang/go/issues/44840#issuecomment-1828537390

<br>

### run

#### ▼ runとは

`go build`コマンドを実行しつつ、バイナリを実行する。

ソースコードを変更した後に動作を簡易的に確認する場合に便利である。

ただ、`log`パッケージなど処理中のメッセージは表示されず、`main.go`ファイルの実行結果しかわからないため、エラーのデバッグには使いにくい。

```bash
$ go run ./...
```

<br>

### test

#### ▼ testとは

指定したパスの`foo_test.go`ファイルで『`Test`』から始まるテスト関数を実行する。

testディレクトリ内を再帰的に実行するのがおすすめ。

```bash
$ go test ./...
```

#### ▼ -v

テスト時にテストの実施時間を出力する。

```bash
$ go test -v ./...
```

#### ▼ -cover

テスト時に、`foo_test.go`ファイルがあるパッケージ内ファイルの命令網羅の網羅率を解析する。

反対に、`foo_test.go`ファイルがなければ、そのパッケージの網羅率は解析しない。

```bash
$ go test -cover ./...
```

#### ▼ -coverpkg

パッケージを指定して、網羅率を解析する。

デフォルトではテストコードがあるパッケージしか解析しないため、全てのパッケージを含めて解析するために`./...`を指定する。

```bash
$ go test -coverpkg=./... -coverprofile=coverage.txt ./...
```

> - https://www.getto.systems/entry/2020/08/09/190650

#### ▼ -coverprofile

網羅率を解析し、結果からカバレッジレポートを作成する。

```bash
$ go test -coverprofile=coverage.txt ./...
```

> - https://kiririmode.hatenablog.jp/entry/20210204/1612450799

<br>

### tool

#### ▼ cover

カバレッジレポートを使用して、特定のコンポーネントでのカバレッジを算出する。

パッケージ単位、関数単位 (`-func`) 、全体、のカバレッジを指定できる。

```bash
$ go tool cover -func coverage.txt
```

> - https://gihyo.jp/article/2023/03/tukinami-go-05

<br>

### version

#### ▼ -m

バイナリで使用しているGoのバージョンと、モジュールのバージョンを出力する。

```bash
$ go version -m <Goのバイナリのパス>

<Goのバイナリのパス>: go 1.19.5
...
```

> - https://knqyf263.hatenablog.com/entry/2021/02/12/162928

<br>

### vet

#### ▼ vetとは

指定したパスのファイルに対して、静的解析を実施する。

パスとして『`./...`』を指定して、再帰的に実行するのがおすすめ。

```bash
$ go vet ./...
```

<br>

## 02. パッケージ管理系

### 大前提

Goでは、思想的にパッケージのバージョンを固定して運用せず、常に新しいバージョンを強制的に利用させるような仕組みがある。

<br>

### get

#### ▼ getとは

指定したパスからパッケージをダウンロードし、これに対して`install`コマンドを実行する。

また、`go.mod`ファイルも更新する。

これにより、内部または外部のコードからビルドされたアーティファクト (バイナリファイル) であれば`bin`ディレクトリ配下に配置し、それ以外 (例：`.a`ファイル) であれば`pkg`ディレクトリ配下に配置する。

`go get`コマンドは不用意に`go.mod`ファイル上の他のパッケージの定義も更新してしまうため、非推奨である。

```bash
# インストールの場合
$ go get <ドメインをルートとしたURL>@<バージョン>

go: downloading <ドメインをルートとしたURL> <バージョン>
go: added <ドメインをルートとしたURL> <バージョン>
```

```bash
# アップグレードの場合
$ go get <ドメインをルートとしたURL>@<バージョン>

go: downloading <ドメインをルートとしたURL> <バージョン>
go: upgraded <ドメインをルートとしたURL> <バージョン>
```

> - https://go.dev/doc/go-get-install-deprecation
> - https://qiita.com/eihigh/items/9fe52804610a8c4b7e41

#### ▼ go mod tidyとの使い分け

先にインストールしたパッケージのバージョンが優先になり、このバージョンを基準として他のパッケージのバージョンが決まる。

そのため、開発者によって結果が変わってしまう。

その反面、`go mod tidy`コマンドは同じ結果になる。

もし全てのパッケージのバージョンを開発者に限らず揃えたいなら、`go mod tidy`コマンドを使用する。

> - https://blog.lufia.org/entry/2020/02/24/171513

<br>

### mod edit

#### ▼ mod editとは

`go.mod`ファイルで指定しているバージョンを変更する。

```bash
$ go mod edit -go <バージョン>
```

<br>

### mod tidy

#### ▼ mod tidyとは

- `import`で指定されているが`go get`コマンドでインストールされていない場合は、これをインストールする。
- `import`で指定のないパッケージは、`go.mod`ファイルと`go.sum`ファイルから削除する。
- `import`で指定されているが`go.mod`ファイルと`go.sum`ファイルに定義がない場合は、これを追加する。
- アップグレード可能なパッケージはバージョンを変更する。

```bash
$ go mod tidy
```

もし`go.sum`ファイルにモジュールの指定があるのにも関わらず、以下のようなエラー (`missing go.sum entry`) が出る時は、`go mod tidy`コマンドを実行して`go.sum`ファイルを更新する必要がある。

```bash
cmd/main.go:4:5: missing go.sum entry for module providing package github.com/foo/foo-package (imported by github.com/hiroki-it/bar/cmd); to add:
        go get github.com/hiroki-hasegawa/bar/cmd
```

> - https://go.dev/ref/mod#go-mod-tidy
> - https://zenn.dev/optimisuke/articles/105feac3f8e726830f8c#go-mod-tidy
> - https://blog.framinal.life/entry/2021/04/11/013819#go-mod-tidy

#### ▼ `-go`

Goのバージョンを指定して、`go.mod`ファイルと`go.sum`ファイルを更新する。

ただし、`-go`オプションは推奨バージョンを設定できるだけで、これを守らない場合もある。

```bash
$ go mod tidy -go <バージョン>
```

#### ▼ `-v`

`import`していないために`go.mod`ファイルから削除したパッケージを、標準出力に出力する。

```bash
$ go mod tidy -v

unused <go.modファイルから削除したパッケージ>
```

> - https://developer.so-tech.co.jp/entry/2022/08/16/110108

#### ▼ go getとの使い分け

`go mod tidy`コマンドは、たとえ`-go`オプションを使用しても、インストールするパッケージのバージョンを完全には制御できない。

(Goの思想的にも) できるだけ新しいバージョンを強制しようとするため、想定するバージョンよりも新しいパッケージをインストールしてしまう可能性がある。

そのため、特定のバージョン (特にコミットIDでの指定) は`go get`コマンドでインストールする必要がある。

ただ推奨としては、Goの思想に則り、`go mod tidy`コマンドを実行して常に新しいバージョンを使う方が良いが...

> - https://blog.lufia.org/entry/2020/02/24/171513

<br>

### mod verify

#### ▼ mod verifyとは

`go.sum`ファイルが正しいかどうかを検証する。

```bash
$ go mod verify

all modules verified
```

> - https://go.dev/ref/mod#go-mod-verify

<br>

### mod download

#### ▼ mod downloadとは

- `import`で指定されているが`go get`コマンドでインストールされていない場合は、これをインストールする。
- `import`で指定されているが`go.mod`ファイルと`go.sum`ファイルに定義がない場合は、これを追加する。

> - https://go.dev/ref/mod#go-mod-download
> - https://github.com/golang/go/issues/35832#issuecomment-571799739

<br>

### `go.mod`ファイル

#### ▼ `go.mod`ファイルとは

アプリケーションで必要なパッケージのバージョンを設定する。

パッケージ内に`go.mod`ファイルがある場合、そこに記載のあるバージョンは最低限必要なバージョンになる。

基本的には、パッケージのURLやディレクトリ構成と同じにする。

```go
module github.com/hiroki-hasegawa/foo-repository

go 1.16
```

#### ▼ パブリックリポジトリから (リリース済み)

パッケージ名とバージョンタグを使用して、パブリックリポジトリからリリース済みのパッケージをインポートする。

`go mod tidy`コマンドによって`// indirect`コメントのついたパッケージが実装される。

これは、使用しているパッケージではなく、インポートしているパッケージが依存しているパッケージである。

注意点として、パッケージ名は、使用したいパッケージの`go.mod`ファイルを参照すること。

```go
module github.com/hiroki-hasegawa/foo-repository

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

#### ▼ パブリックリポジトリから (開発中)

コミットIDやバージョンタグを使用して、パブリックリポジトリから開発中のパッケージをインポートする。

この場合、`go get`コマンドで特定のコミットIDやバージョンタグを指定し、モジュールをインストールする。

```bash
$ go get github.com/foo@<コミットID>

go: downloading github.com/foo v0.0.0-<コミット日時のタイムスタンプ>-<コミットID>
go: added github.com/foo v0.0.0-<コミット日時のタイムスタンプ>-<コミットID>
```

`go get`コマンドは、`go.mod`ファイルにインポート定義を追加する。

```go
module github.com/hiroki-hasegawa/foo-repository

go 1.16

require (
    github.com/foo v0.0.0-<コミット日時のタイムスタンプ>-<コミットID> // indirect
)
```

> - https://stackoverflow.com/a/53682399

#### ▼ プライベートリポジトリから

デフォルトでは、プライベートリポジトリのパッケージをインポートできない。

```bash
$ go get github.com/foo@<コミットID/バージョンタグ>

github.com/foo@v1.0.0: verifying module: github.com/foo@v1.0.0: reading https://sum.golang.org/lookup/github.com/foo@v1.0.0: 410 Gone
	server response:
	not found: github.com/foo@v1.0.0: invalid version: git ls-remote -q origin in /tmp/gopath/pkg/mod/cache/vcs/*****: exit status 128:
		fatal: unable to look up github.com/foo.git (port 9418) (Name or service not known)
```

`GOPRIVATE`変数にプライベートリポジトリのURLを設定することで、インポートできるようになる。

```bash
$ go env -w GOPRIVATE=github.com/foo.git,github.com/bar.git,...
```

> - https://goproxy.io/docs/GOPRIVATE-env.html
> - https://kawaken.dev/posts/20220426_goprivate/

#### ▼ ローカルマシンから

ローカルマシンのみで使用する自前共有パッケージがあるとする。

```yaml
foo-repository/
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
// go.modファイル
module github.com/hiroki-hasegawa/foo-repository/local-pkg

go 1.16
```

この場合、パブリックリポジトリ上での自身のリポジトリからインポートせずに、`replace`関数を使用してインポートする必要がある。

自前共有の全パッケージでパッケージ名を置換する必要はなく、プロジェクトのルートパスについてのみ定義すれば良い。

パス実際、`unknown revision`のエラーで、バージョンを見つけられない。

> - https://qiita.com/hnishi/items/a9217249d7832ed2c035

```go
module github.com/hiroki-hasegawa/foo-repository

go 1.16

replace github.com/hiroki-hasegawa/foo-repository/local-pkg => /
```

これらにより、ローカルマシンのパッケージをインポートできるようになる。

```go
package main

import "local.packages/local-pkg"

func main() {
    // 何らかの処理
}
```

<br>

### `go.sum`ファイル

#### ▼ `go.sum`ファイルとは

PHPにおける`composer.lock`ファイルに相当する。

`go.mod`ファイルによって実際にインストールされたパッケージが自動的に実装される。

パッケージごとのチェックサムが記録されるため、前回のインストール時と比較して、パッケージに変更があるか否かを検知できる。

<br>
