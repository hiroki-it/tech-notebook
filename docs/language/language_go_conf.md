---
title: 【IT技術の知見】設定＠Go
description: 設定＠Goの知見を記録しています。
---

# 設定＠Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 環境変数

### 一覧

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

<br>

### `CGO_ENABLED`

c言語製のパッケージの有効化する。

無効化しておかないと、`vet`コマンドが失敗する。

<br>

### `GO111MODULE`

`go.mod`ファイルを有効化する。

<br>

### `GOARCH`

バイナリの対象CPUアーキテクチャを設定する。

Goはクロスコンパイル機能をもっており、Goが稼働するOSやCPUアーキテクチャとは関係なく、様々なOSやCPUアーキテクチャに対応するバイナリを作成できる。

<br>

### `GOBIN`

`go install`コマンドによるアーティファクトを配置する場所を設定する。

指定がない場合、`$GOPATH/bin`になる。

<br>

### `GOHOSTOS`

コンパイラが実行されるOSを設定する。

<br>

### `GOPATH`

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

<br>

### `GOROOT`

複数のバージョンのGoを管理できるようになる。

> - https://tech.librastudio.co.jp/entry/index.php/2018/02/20/post-1792/

<br>
