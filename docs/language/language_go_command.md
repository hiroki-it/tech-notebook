---
title: 【IT技術の知見】コマンド＠Go
description: コマンド＠Goの知見を記録しています。
---

# コマンド＠Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. goコマンド

### build

#### ▼ buildとは

指定したパスをビルド対象として、ビルドのアーティファクトを作成する。

`foo_test.go` ファイルはビルドから自動的に除外される。

アーティファクトの出力先を指定しない場合に、

```bash
# cmdディレクトリをビルド対象として、ルートディレクトリにcmdアーティファクトを作成する。
$ go build ./cmd
```

もし、ビルドのエラー時に終了ステータスのみが返却され、原因が不明の場合、`panic` 関数が原因を握りつぶしている可能性を考える。

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

補足として、事前のインストールに失敗し、ビルド対象が存在していないと以下のようなエラーになってしまう。

```bash
package foo is not in GOROOT (/usr/local/go/src/foo)
```

<br>

### commit

#### ▼ -m

コミットメッセージを設定する。

空コミットでよく使う。

```bash
$ git commit --allow-empty -m "first commit"
```

<br>

### clean

モジュールのキャッシュを削除する。

ローカルマシンでの開発中に `go install` コマンドを実行しても、モジュールをアップグレードできない場合に使用する。

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

GO111MODULE="on"
GOARCH="amd64"

...

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

`go get` コマンドとは異なり、Goのバイナリをモジュールとしてでなく、ツールとしてグローバルにインストールする。

コードと外部モジュールに対して `build` コマンドを実行することにより、`$GOPATH` 以下の `bin` ディレクトリまたは `pkg` ディレクトリにインストール (配置) する。

内部または外部のコードからビルドされたアーティファクト (バイナリファイル) であれば `bin` ディレクトリ配下に配置し、それ以外 (例：`.a` ファイル) であれば `pkg` ディレクトリ配下に配置する。

```bash
# asdfでGoをインストールしている場合は、go installコマンドの前に`PATH`を設定しておく
$ export PATH="$(go env GOPATH)/bin:$PATH"

$ go install
```

なお、インストールしたモジュールで `replace` を使用している場合、クローンしてから直接インストールする必要がある。

```bash
$ git clone <モジュールのリポジトリ>
$ cd <バイナリのディレクトリ>
$ go install
```

バイナリは、パスが通っていないため、直接パスを指定して実行する必要がある。

```bash
$ ${GOPATH}/bin/foo-package --version
```

> - https://go.dev/doc/go-get-install-deprecation
> - https://github.com/golang/go/issues/44840#issuecomment-1828537390
> - https://okkun-sh.hatenablog.com/entry/2023/06/16/013008

#### ▼ 最新バージョンの指定

`HEAD` を指定すると、最新のコミットIDを指定できる。

複数のブランチがある場合は、時系列的に最新のコミットIDである。

```bash
$ go install <モジュール名>@HEAD
```

> - https://zenn.dev/podhmo/articles/f7d6b5ccc389b5ecef02

#### ▼ バイナリのアンインストール

`go install` コマンドでインストールしたバイナリは、`rm` コマンドで直接削除する必要がある。

```bash
$ ls ${GOPATH}/bin

foo-package

$ rm ${GOPATH}/bin/foo-package
```

> - https://www.reddit.com/r/golang/comments/zfly1c/comment/izck1cl/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

<br>

### run

#### ▼ runとは

`go build` コマンドを実行しつつ、バイナリを実行する。

ソースコードを変更した後に動作を簡易的に確認する場合に便利である。

ただ、`log` モジュールなど処理中のメッセージは表示されず、`main.go` ファイルの実行結果しかわからないため、エラーのデバッグには使いにくい。

```bash
$ go run ./...
```

<br>

### test

#### ▼ testとは

指定したパスの `foo_test.go` ファイルで『`Test`』から始まるテスト関数を実行する。

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

テスト時に、`foo_test.go` ファイルがあるモジュール内ファイルの命令網羅の網羅率を解析する。

反対に、`foo_test.go` ファイルがなければ、そのモジュールの網羅率は解析しない。

```bash
$ go test -cover ./...
```

#### ▼ -coverpkg

モジュールを指定して、網羅率を解析する。

デフォルトではテストコードがあるモジュールしか解析しないため、全てのモジュールを含めて解析するために `./...` を指定する。

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

モジュール単位、関数単位 (`-func`) 、全体、のカバレッジを指定できる。

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

## 02. モジュール管理系コマンド

### 大前提

Goでは、思想的にモジュールのバージョンを固定して運用せず、常に新しいバージョンを強制的に利用させるような仕組みがある。

<br>

### get

#### ▼ getとは

指定したパスからモジュールをダウンロードし、これに対して `install` コマンドを実行する。

また、`go.mod` ファイルも更新する。

これにより、内部または外部のコードからビルドされたアーティファクト (バイナリファイル) であれば `bin` ディレクトリ配下に配置し、それ以外 (例：`.a` ファイル) であれば `pkg` ディレクトリ配下に配置する。

`go get` コマンドは不用意に `go.mod` ファイル上の他のモジュールの定義も更新してしまうため、非推奨である。

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

先にインストールしたモジュールのバージョンが優先になり、このバージョンを基準として他のモジュールのバージョンが決まる。

そのため、開発者によって結果が変わってしまう。

その反面、`go mod tidy` コマンドは同じ結果になる。

もし全てのモジュールのバージョンを開発者に限らず揃えたいなら、`go mod tidy` コマンドを使用する。

> - https://blog.lufia.org/entry/2020/02/24/171513

<br>

### mod edit

#### ▼ mod editとは

`go.mod` ファイルで指定しているバージョンを変更する。

```bash
$ go mod edit
```

<br>

### mod tidy

#### ▼ mod tidyとは

- `import` で指定されているが `go get` コマンドでインストールされていない場合は、これをインストールする。
- `import` で指定のないモジュールは、`go.mod` ファイルと `go.sum` ファイルから削除する。
- `import` で指定されているが `go.mod` ファイルと `go.sum` ファイルに定義がない場合は、これを追加する。
- アップグレード可能なモジュールはバージョンを変更する。

```bash
$ go mod tidy
```

もし `go.sum` ファイルにモジュールの指定があるのにも関わらず、以下のようなエラー (`missing go.sum entry`) が出るときは、`go mod tidy` コマンドを実行して `go.sum` ファイルを更新する必要がある。

```bash
cmd/main.go:4:5: missing go.sum entry for module providing package github.com/foo/foo-package (imported by github.com/hiroki-it/bar/cmd); to add:
        go get github.com/hiroki-hasegawa/bar/cmd
```

> - https://go.dev/ref/mod#go-mod-tidy
> - https://zenn.dev/optimisuke/articles/105feac3f8e726830f8c#go-mod-tidy
> - https://blog.framinal.life/entry/2021/04/11/013819#go-mod-tidy

#### ▼ `-go`

`go.mod` ファイルに記載のGoのバージョンを上書きしつつ、`go.sum` ファイルを更新する。

ただし、`-go` オプションは推奨バージョンを設定できるだけで、これを守らない場合もある。

```bash
$ go mod tidy -go <バージョン>
```

> - https://zenn.dev/spiegel/articles/20210223-go-module-aware-mode#go-%E3%83%87%E3%82%A3%E3%83%AC%E3%82%AF%E3%83%86%E3%82%A3%E3%83%96%E3%82%92%E6%9B%B4%E6%96%B0%E3%81%99%E3%82%8B

#### ▼ `-v`

`import` していないために `go.mod` ファイルから削除したモジュールを、標準出力に出力する。

```bash
$ go mod tidy -v

unused <go.modファイルから削除したモジュール>
```

> - https://developer.so-tech.co.jp/entry/2022/08/16/110108

#### ▼ go getとの使い分け

`go mod tidy` コマンドは、たとえ `-go` オプションを使用しても、インストールするモジュールのバージョンを完全には制御できない。

(Goの思想的にも) できるだけ新しいバージョンを強制しようとするため、想定するバージョンよりも新しいモジュールをインストールしてしまう可能性がある。

そのため、特定のバージョン (特にコミットIDでの指定) は `go get` コマンドでインストールする必要がある。

ただ推奨としては、Goの思想に則り、`go mod tidy` コマンドを実行して常に新しいバージョンを使用するほうが良い。

> - https://blog.lufia.org/entry/2020/02/24/171513

<br>

### mod verify

#### ▼ mod verifyとは

`go.sum` ファイルが正しいかどうかを検証する。

```bash
$ go mod verify

all modules verified
```

> - https://go.dev/ref/mod#go-mod-verify

#### ▼ `but does not contain package`

インポートしたモジュールの依存先モジュールをダウンロードしたが、依存先モジュール内にモジュールがないことを表す。

`// indirect` で自動的に指定しているモジュールは、新しすぎる可能性がある。

この場合、`// indirect` のモジュールを手動で変更する。

**＊例＊**

`// indirect` で指定した依存先モジュール (`go.module.io/foo-dependency`) のバージョンが `1.27` になっている。

しかし、`go.module.io/foo-dependency` (`1.27`) には、`bar` モジュールがないためエラーになっている。

この場合、`bar` モジュールがあるバージョンに手動で書き換える必要がある。

```bash
$ go mod verify

go: finding module for package go.module.io/foo-dependency
        github.com/foo imports
        go.module.io/foo-dependency/bar: module go.module.io/foo-dependency@latest found (v1.27.0), but does not contain package go.module.io/foo-dependency/bar
```

> - https://budougumi0617.github.io/2019/09/20/fix-go-mod-tidy-does-not-contain-package/

<br>

### mod download

#### ▼ mod downloadとは

- `import` で指定されているが `go get` コマンドでインストールされていない場合は、これをインストールする。
- `import` で指定されているが `go.mod` ファイルと `go.sum` ファイルに定義がない場合は、これを追加する。

> - https://go.dev/ref/mod#go-mod-download
> - https://github.com/golang/go/issues/35832#issuecomment-571799739

<br>

## 02-02. モジュール管理系ファイル

### `go.mod` ファイル

#### ▼ `go.mod` ファイルとは

アプリケーションで必要なモジュールのバージョンを設定する。

モジュール内に `go.mod` ファイルがある場合、そこに記載のあるバージョンは最低限必要なバージョンになる。

基本的には、モジュールのURLやディレクトリ構成と同じにする。

```go
module github.com/hiroki-hasegawa/foo-repository

go 1.16
```

#### ▼ パブリックリポジトリから (リリース済み)

モジュール名とバージョンタグを使用して、パブリックリポジトリからリリース済みのモジュールをインポートする。

`go mod tidy` コマンドによって `// indirect` コメントのついたモジュールが実装される。

これは、インポートしたモジュールではなく、インポートしているモジュールが依存しているモジュールである。

注意点として、モジュール名は、使用したいモジュールの `go.mod` ファイルを参照すること。

```go
module github.com/hiroki-hasegawa/foo-repository

go 1.16

// 直接的に依存するモジュール (アプリで使用するモジュール)
require (
    <モジュール名> <バージョンタグ>
    github.com/foo v1.3.0
    github.com/bar v1.0.0
)

// 間接的に依存するモジュール (アプリで使用するモジュールが依存するモジュール)
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

コミットIDやバージョンタグを使用して、パブリックリポジトリから開発中のモジュールをインポートする。

この場合、`go get` コマンドで特定のコミットIDやバージョンタグを指定し、モジュールをインストールする。

```bash
$ go get github.com/foo@<コミットID>

go: downloading github.com/foo v0.0.0-<コミット日時のタイムスタンプ>-<コミットID>
go: added github.com/foo v0.0.0-<コミット日時のタイムスタンプ>-<コミットID>
```

`go get` コマンドは、`go.mod` ファイルにインポート定義を追加する。

```go
module github.com/hiroki-hasegawa/foo-repository

go 1.16

require (
    github.com/foo v0.0.0-<コミット日時のタイムスタンプ>-<コミットID> // indirect
)
```

> - https://stackoverflow.com/a/53682399

#### ▼ プライベートリポジトリから

デフォルトでは、プライベートリポジトリのモジュールをインポートできない。

```bash
$ go get github.com/foo@<コミットID/バージョンタグ>

github.com/foo@v1.0.0: verifying module: github.com/foo@v1.0.0: reading https://sum.golang.org/lookup/github.com/foo@v1.0.0: 410 Gone
	server response:
	not found: github.com/foo@v1.0.0: invalid version: git ls-remote -q origin in /tmp/gopath/pkg/mod/cache/vcs/*****: exit status 128:
		fatal: unable to look up github.com/foo.git (port 9418) (Name or service not known)
```

`GOPRIVATE` 変数にプライベートリポジトリのURLを設定することで、インポートできるようになる。

```bash
$ go env -w GOPRIVATE=github.com/foo.git,github.com/bar.git,...
```

> - https://goproxy.io/docs/GOPRIVATE-env.html
> - https://kawaken.dev/posts/20220426_goprivate/

#### ▼ ローカルマシンから

ローカルマシンのみで使用する自前共有モジュールがあるとする。

```yaml
foo-repository/
├── cmd/
│   └── hello.go
│
├── go.mod
├── go.sum
└── local-pkg/
    ├── go.mod # 各モジュールにgo.modを配置する。
    └── module.go
```

```go
// go.modファイル
module github.com/hiroki-hasegawa/foo-repository/local-pkg

go 1.16
```

この場合、パブリックリポジトリ上での自身のリポジトリからインポートせずに、`replace` 関数を使用してインポートする必要がある。

自前共有の全モジュールでモジュール名を置換する必要はなく、プロジェクトのルートパスについてのみ定義すれば良い。

パス実際、`unknown revision` のエラーで、バージョンを見つけられない。

> - https://qiita.com/hnishi/items/a9217249d7832ed2c035

```go
module github.com/hiroki-hasegawa/foo-repository

go 1.16

replace github.com/hiroki-hasegawa/foo-repository/local-pkg => /
```

これらにより、ローカルマシンのモジュールをインポートできるようになる。

```go
package main

import "local.packages/local-pkg"

func main() {
    // 何らかの処理
}
```

<br>

### `go.sum` ファイル

#### ▼ `go.sum` ファイルとは

PHPにおける `composer.lock` ファイルに相当する。

`go.mod` ファイルによって実際にインストールされたモジュールが自動的に実装される。

モジュールごとのチェックサムが記録されるため、前回のインストール時と比較して、モジュールに変更があるか否かを検知できる。

<br>
