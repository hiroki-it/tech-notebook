---
title: 【知見を記録するサイト】Go
description: Goの知見をまとめました．
---

# Go

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 導入

### 特長

| 項目                          | 説明                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| 並列処理が実装可能             | 個人的にGoで最大の特長．並列処理を簡単に実装できる．並行処理しても結果に影響しなければ，処理を高速化できる． |
| ほどよくシンプル               | 黒魔術的な関数やライブラリがない一方で，基本的な機能は揃っているため，処理の可読性が高い．そのため，後続者が開発しやすく，実装がスケーリングしやすい． |
| 型付けの厳格さと型推論         | 型付けルールが厳しく，定義に必ず型付けが必要である一方で，型推論で型付けの実装を省略できる．そのため，型付けの実装なしに静的型付けのメリットを享受できる．特にバグが許されないような基盤部分に適している． |
| 高速なコンパイル               | 他の静的型付け言語のJavaのコンパイルでは，ソースコードを一度中間言語に変換し，その後機械語に翻訳する．しかしGoのコンパイルでは，プログラムを直接機械語に翻訳するため，より高速である． |
| メモリの安全性を担保する仕組み | メモリアドレスに割り当てられている数値同士を演算する『ポインタ演算』の機能を意図して廃止している．ポインタ演算の例として，10番アドレスと20番アドレスの数値を足して，30番アドレスに新しく割り当てる，といった処理を行う．この時，何らかの原因で片方のアドレスが文字列だった場合，30番アドレスに予期しない値（数値＋文字列）が割り当てられることになる．これは，不具合や悪意ある操作に繋がるため，Goではポインタ演算子の機能がない． |
| クラスや継承がない             | 継承はカプセル化を壊すため，これを回避できる『委譲』の方が優れているとされている．そのため，思想としてクラスや継承を廃止している．埋め込みによって，委譲を実現する．埋め込みについては，本ノート内の説明を参考にせよ． |


<br>

### 補足

<iframe class="speakerdeck-iframe" frameborder="0" src="https://speakerdeck.com/player/89dd94ed0675412da0413c9e14572045" title="Goに入門しよう" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" style="border: 0px; background: padding-box padding-box rgba(0, 0, 0, 0.1); margin: 0px; padding: 0px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 40px; width: 560px; height: 314px;"></iframe>

<br>

## 02. セットアップ

### インストール

#### ・yum経由

参考：https://www.cyberithub.com/install-go-on-centos/

```bash
$ yum install -y epel-release
$ yum install -y golang
```

<br>

### Dockerfile

#### ・Ginを用いる場合

```dockerfile
#===================
# Global ARG
#===================
ARG GO_VERSION=1.16.5
ARG LABEL="Hiroki <hasegawafeedshop@gmail.com>"

#===================
# Build Stage
#===================
FROM golang:${GO_VERSION} as build

# Goのディレクトリ構成のベストプラクティスに則った方法にする．
WORKDIR /go/src

# インストールのキャッシュを活用するためにコピーしておく．
COPY go.mod go.sum /go/src/

# ライブラリをインストールする．
RUN go get github.com/cosmtrek/air@v1.27.3

COPY . /go/src/

# go mod tidyの実行を忘れると，次回のイメージのビルド時に，goのビルドに失敗するようになってしまう．
# そのため，保険としてgo mod tidyを実行しておく．
RUN go mod tidy \
  # リクエストを受信する場合，アプリケーションを実行後にコンテナがすぐ終了しないよう，起動前にフレームワークをインストールしておく．
  # これにより，アプリケーションの実行でインバウンド通信の受信が開始される．
  # Goでインバウンド通信を受信しないアプリケーションであれば，パッケージのインストールはコンテナ起動後に実行しても良い．
  && go mod download -x \
  # ビルドのアーティファクトを/go/binに配置する．
  # netパッケージは標準で動的リンクのため，静的リンクを明示的に指定する必要がある．
  && go build -x -a -tags netgo -installsuffix netgo -o /go/bin ./cmd

#===================
# Production Stage
#===================
FROM golang:${GO_VERSION}-alpine

LABEL maintainer=${LABEL}

# マルチステージビルド
# /go/binにパスを通す．
ENV PATH $PATH:/go/bin

COPY --from=build /go /go/

WORKDIR /go/src

CMD ["/go/bin/cmd"]
```

<br>

## 03. 設計ポリシー

### ディレクトリ構成

#### ・```$GOPATH```

パスは好みであるが，```$HOME/go```とすることが多い．ディレクトリ構成のベストプラクティスは以下のリンクを参考にせよ．

参考：https://github.com/golang-standards/project-layout

```bash
$GOPATH # 例えば，『$HOME/go』とする．
├── bin
├── pkg
└── src
    ├── build # Dockerfileを配置するディレクトリ
    ├── cmd # main.goファイルや，サブmainパッケージを配置するディレクトリ
    │   ├── main.go
    │   └── foo
    │       └── foo.go
    │         
    ├── configs
    │   └── envrc.template
    │     
    ├── docs（ドキュメントを配置する）
    │   ├── BUG.md
    │   ├── ROUTING.md
    │   └── TODO.md
    │     
    ├── internal # cmdディレクトリ内でインポートさせないファイルを配置するディレクトリ
    │   └── pkg
    │ 
    ├── pkg # cmdディレクトリ内でインポートする独自goパッケージを配置するディレクトリ
    │   └── public
    │       └── add.go
    │     
    ├── scripts
    │   └── Makefile
    │     
    ├── test
    │   └── test.go
    │     
    └── web（画像，CSS，など）
        ├── static
        └── template
```

#### ・```bin```

ビルドされたアーティファクト（バイナリファイル）を配置するディレクトリ．バイナリファイル名を指定すると，処理を実行できる．

#### ・```pkg```

アーティファクトとは別に生成されるファイルを配置するディレクトリ

#### ・```src```

ソースコードを配置するディレクトリ

<br>

### ファイルの要素

#### ・package

名前空間として，パッケージ名を定義する．1つのディレクトリ内では，1つのパッケージ名しか宣言できない．

```go
package main
```

#### ・import

ビルトインパッケージ，内部パッケージ，事前にインストールされた外部パッケージを読み込む．

```go
import "<パッケージ名>"
```

互いにインポートし合うと，循環参照エラー（```mport cycle not allowed```）になる．インターフェースと構造体の両方を同じパッケージに置いていると，インターフェースが他からインポートされ，構造体が他をインポートするようになり，起こりやすい．

![golang_import_cycle](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/golang_import_cycle.png)

#### ・func

詳しくは，関数を参考にせよ．

```go
func foo() {

}
```

#### ・文の区切り

Goでは文の処理はセミコロンで区切られる．ただし，セミコロンはコンパイル時に補完され，実装時には省略できる．

<br>

### 命名規則

#### ・GitHubWikiによる規則

Goの命名規則は，GitHubのWikiに記載されている．

参考：https://github.com/golang/go/wiki/CodeReviewComments

#### ・ディレクトリ名

小文字一単語またはケバブケースで命名する．ビルド時にシンタックスエラーとなる可能性があるため，可能な限りハイフンを用いない方が良い．

#### ・パッケージ名

小文字一単語で命名する．ディレクトリ名に小文字一単語が使用されている場合は，これと同じにするとなお良い．また，処理中の変数名と被るとパッケージのインポートに失敗するため，変数名と被らないように，できるだけ省略しない名前の方が良い．ただし，テストファイルに関しては，パッケージ名を『```foo_test```』として良い．

参考：https://github.com/golang/go/wiki/CodeReviewComments#package-names

#### ・ファイル名

小文字一単語またはスネークケースで命名する．ファイル名とパッケージ名は合わせる必要はないが，独自ルールを設けても良い．例えばドメイン駆動設計の場合，ルートエンティティのファイル名とパッケージ名を合わせるように工夫できる．

参考：https://ja.stackoverflow.com/q/41599

参考：

#### ・関数，type，構造体

アッパーキャメルケースまたはローワーキャメルケースで命名する．

#### ・インターフェース名

末尾に『```er```』をつける．

参考：https://golang.org/doc/effective_go#interface-names

#### ・レシーバ名

構造体名の頭一文字または頭二文字を取って命名する．アプリケーション内で構造体名の頭文字が重複すると，同じレシーバ名の構造体が乱立してしまうため，これを防ぐために二文字を取ると良い．また，修飾語と組み合わせて構成される構造体名の場合，被修飾語の頭二文字を取る．オブジェクト指向で使われる『```this```』『```self```』

参考：

- https://github.com/golang/go/wiki/CodeReviewComments#receiver-names
- https://yyh-gl.github.io/tech-blog/blog/go-ddd-entity-vo/

**＊例＊**

httpClientであれば，修飾語は『```http```』被修飾語『```client```』である．そのため，レシーバ名または引数名では『```cl```』とする．`

#### ・一時的な変数名

英単語の頭一文字，頭二文字，略語，で命名する．これは，実際の処理を強調し，変数を目立たなくするためである．ただし，スコープの大きな変数に省略した名前をつけると，重複する可能性があるため，省略せずにローワーキャメルケースで命名しても良い．

参考：https://github.com/golang/go/wiki/CodeReviewComments#variable-names

省略名については，略語検索サイトで探す．あるいは，Goリファレンスからその単語がどう省略されているかを探しても良い．

参考：https://www.allacronyms.com/

#### ・モックの変数

モック構造体を代入するための変数は，『```m```』とする．

#### ・error構造体の変数

error構造体を変数に代入する場合，『```Err```』とプレフィクスをつける．

#### ・キー名の検証

マップ型やスライス型で指定したキー名が存在するか検証する場合，真偽値を代入する変数を『```ok```』とする．

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

	// user_idキーが存在する場合，okにtrueが返却される．
	userId, ok := userIds["user_id"]

	if ok == false {
		log.Fatal("user_id does not exist") // 2009/11/10 23:00:00 user_id does not exist
	}

	fmt.Printf("%#v\n", userId) // 1
}
```

<br>

### その他のお作法

#### ・コメントの書式

参考：https://github.com/golang/go/wiki/CodeReviewComments#comment-sentences

#### ・Uber風のお作法

Uber社が採用しているお作法．

参考：https://github.com/uber-go/guide/blob/master/style.md
