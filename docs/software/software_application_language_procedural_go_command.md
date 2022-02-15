---
title: 【知見を記録するサイト】goコマンド
description: goコマンドの知見をまとめました．
---

# goコマンド

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. コマンド

### install

#### ・オプション無し

コードと外部パッケージに対して```build```コマンドを実行し，```$GOPATH```以下の```bin```ディレクトリまたは```pkg```ディレクトリにインストール（配置）する．内部または外部のコードからビルドされたアーティファクト（バイナリファイル）であれば```bin```ディレクトリ下に配置し，それ以外（例：```.a```ファイル）であれば```pkg```ディレクトリ下に配置する．

```bash
$ go install
```

<br>

### get

#### ・オプション無し

指定したパスからパッケージをダウンロードし，これに対して```install```コマンドを実行する．これにより，内部または外部のコードからビルドされたアーティファクト（バイナリファイル）であれば```bin```ディレクトリ下に配置し，それ以外（例：```.a```ファイル）であれば```pkg```ディレクトリ下に配置する．

```bash
$ go get <ドメインをルートとしたURL>
```

<br>

### build

#### ・オプション無し

指定したパスをビルド対象として，ビルドのアーティファクトを生成する．```foo_test.go```ファイルはビルドから自動的に除外される．

```bash
# cmdディレクトリをビルド対象として，ルートディレクトリにcmdアーティファクトを生成する．
$ go build ./cmd
```

もし，ビルドのエラー時に終了ステータスのみが返却され，原因が不明の場合，```panic```メソッドが原因を握りつぶしている可能性を考える．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_procedural_go_logic_method_data.html

```bash
exit status 2. Docker build ran into internal error. Please retry. If this keeps happening, please open an issue..
```

#### ・```-o```

指定したパスにビルドのアーティファクトを生成する．ビルド対象パスを指定しない場合，ルートディレクトリのgoファイルをビルドの対象とする．

```bash
# ルートディレクトリ内のgoファイルをビルド対象として
# $HOME/go/binディレクトリにルートディレクトリ名アーティファクトを生成する．
$ go build -o $HOME/go/bin
```

また，指定したパス内のgoファイルをビルド対象として，指定したパスにビルドのアーティファクトを生成することもできる．

```bash
# cmdディレクトリ内のgoファイルをビルド対象として
# $HOME/go/binディレクトリにcmdアーティファクトを生成する．
$ go build -o $HOME/go/bin ./cmd
```

 ちなみに，事前のインストールに失敗に，ビルド対象が存在していないと，以下のようなエラーになる．

```bash
package foo is not in GOROOT (/usr/local/go/src/foo)
```

<br>

### env

#### ・オプション無し

Goに関する環境変数を出力する．

**＊実装例＊**

```bash
$ go env

# go.modの有効化
GO111MODULE="on"
# コンパイラが実行されるCPUアーキテクチャ
GOARCH="amd64"
# installコマンドによるアーティファクトを配置するディレクトリ（指定無しの場合，$GOPATH/bin）
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
# c言語製のライブラリの有効化．無効化しないと，vetコマンドが失敗する．
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

#### ・オプション無し

指定したパスのファイルのインデントを整形する．パスとして『```./...```』を指定して，再帰的に実行するのがおすすめ．

```bash
$ go fmt ./...
```

<br>

### vet

#### ・オプション無し

指定したパスのファイルに対して静的解析を行う．パスとして『```./...```』を指定して，再帰的に実行するのがおすすめ．

```bash
$ go vet ./...
```

<br>

### test

#### ・オプション無し

指定したパスの```foo_test.go```ファイルで『```Test```』から始まるテスト関数を実行する．testディレクトリ内を再帰的に実行するのがおすすめ．

```bash
$ go test ./...
```

#### ・-v

テスト時にテストの実行時間を出力する．

```bash
$ go test -v ./...
```

#### ・-cover

テスト時に，```foo_test.go```ファイルがあるパッケージ内ファイルの命令網羅の網羅率を解析する．反対に，```foo_test.go```ファイルがなければ，そのパッケージの網羅率は解析しない．網羅条件については，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_object_oriented_php_testing_based_on_code.html

```bash
$ go test -cover ./...
```

