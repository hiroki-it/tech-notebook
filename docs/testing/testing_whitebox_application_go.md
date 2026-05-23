---
title: 【IT技術の知見】Goのテストツール＠アプリケーションのホワイトボックステスト
description: Goのテストツール＠アプリケーションのホワイトボックステストの知見を記録しています。
---

# Goのテストツール＠アプリケーションのホワイトボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ホワイトボックステストのツール

### 整形

| ツール名                 | 解析内容 | 理由 |
| ------------------------ | -------- | ---- |
| 標準の `go fmt` コマンド |          |      |

<br>

### 静的解析

#### ▼ ベストプラクティス

| ツール名                 | 解析内容                                                       | 理由                                                                                                                                 |
| ------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 標準の `go vet` コマンド |                                                                |                                                                                                                                      |
| gochecknoinits           | `init()` 関数を使用していないかを検証する。                    | `init()` 関数を使うと、プログラムの挙動が複雑になり、可読性が低下するため、使用しするべきではない。                                  |
| gomnd                    | マジックナンバーを採用していないかを検証する。                 |                                                                                                                                      |
| funlen                   | 関数名が指定した文字数より長くないかを検証する。               |                                                                                                                                      |
| lll                      | 一行が指定した文字数より長くないかを検証する。                 |                                                                                                                                      |
| statickcheck             | パフォーマンスの出る実装方法になっているかを検証する。         |                                                                                                                                      |
| stylecheck               | Effective Goに則った方法で実装しているかを検証する。           | パッケージ名にアンダースコアを使用していないか。キャメルケースの変数名に略語 (例：HTTP、IDなど) を使う場合、略語は全て大文字にする。 |
| whitespace               | 不要な改行がないかを検証する。                                 |                                                                                                                                      |
| gocognit                 | コードが複雑 (例：`if` の入れ子) であるかどうかを検証する。    |                                                                                                                                      |
| godox                    | TODOコメントがあるかどうかを検証する。                         |                                                                                                                                      |
| goimports                | 足りない `import` や余分な `import` があるかどうかを検証する。 |                                                                                                                                      |
| goprintffuncname         | `printf` のような関数の名前が `f` で終わっているかを検証する。 |                                                                                                                                      |
| revive                   | 用意されたコード規約に則っているかを検証する。                 |                                                                                                                                      |

> - https://golangci-lint.run/usage/linters/

#### ▼ 脆弱性

| ツール名    | 解析内容 | 理由 |
| ----------- | -------- | ---- |
| govulncheck |          |      |
| gosec       |          |      |

> - https://golangci-lint.run/usage/linters/
> - https://go.dev/blog/vuln
> - https://forum.golangbridge.org/t/sast-tools-for-golang/32325/3

#### ▼ コード規約違反

ユーザー定義のコード規約違反を検証する。

> - https://golangci-lint.run/usage/linters/

<br>

### ユニットテスト、機能テストツール

- 標準の `go fmt` コマンド

<br>

## 02. 標準のテストツール

### 標準のテストツールとは

`go` コマンドが提供するホワイトボックス機能のこと。

<br>

### 網羅率

網羅率はパッケージを単位として解析される。

<br>

## 03. 設計規約

### パッケージ名

#### ▼ ホワイトボックステスト

テストファイルのパッケージ名が、同じディレクトリ配下にある実際の処理ファイルのパッケージ名と同じ場合、それはホワイトボックステストになる。

#### ▼ ブラックボックス風のホワイトテスト

テストファイルのパッケージ名が、同じディレクトリ配下にある実際の処理ファイルに『`_test`』を加えたパッケージ名の場合、それはブラックボックステスト風のホワイトテストになる。

補足として、Goでは1つのディレクトリ内に1つのパッケージ名しか宣言できないが、ブラックボックステストのために『`_test`』を加えることは許されている。

> - https://medium.com/tech-at-wildlife-studios/testing-golang-code-our-approach-at-wildlife-6f41e489ff36

<br>

### インターフェースの導入

テストできない構造体はモックに差し替えられることなる。

この時、あらかじめ実際の構造体をインターフェースの実装にしておく。

テスト時に、モックもインターフェイスの実装とすれば、モックが実際の構造体と同じデータ型として認識されるようになる。

これにより、モックに差し替えられる。

<br>

### テストケース構成

#### ▼ 手続き的テスト

```go
package test

import (
	"testing"
)

// 正常系
func TestFoo_ShouldReturnSuccess_WhenSomethingSucceeds(t *testing.T) {
	expected := 1
	actual := foo()

	// 実際値が期待値どおりであることを検証する
	if actual != expected {
		t.Errorf("should return %d, got %d", expected, actual)
	}
}
```

#### ▼ テーブル駆動テスト

```go
package test

import (
	"testing"
)

// 正常系
func TestFoo_ShouldReturnSuccess_WhenSomethingSucceeds(t *testing.T) {
	// 入力値
	type Input struct {
		status string
	}

	// 期待値
	type Expected struct {
		status string
	}

	// テストケース
	testCases := []struct {
		// テストケース名
		name string
		// 入力値
		input Input
		// 期待値
		expected Expected
	}{
		{
			name: "TestFoo_ShouldReturnSuccess_WhenSomethingSucceeds",
			input: Input{
				status: "succeed",
			},
			expected: Expected{
				status: "ok",
			},
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			actual := foo(tt.input.status)

			// 実際値が期待値どおりであることを検証する
			if actual != tt.expected.status {
				t.Errorf("should return %s, got %s", tt.expected.status, actual)
			}
		})
	}
}
```

> - https://github.com/golang/go/wiki/TableDrivenTests

<br>

### アサーション

#### ▼ 標準

```go
package test

import (
	"testing"
)

// 正常系
func TestFoo_ShouldReturnSuccess_WhenSomethingSucceeds(t *testing.T) {
	expected := 1
	actual := foo()

	// 実際値が期待値どおりであることを検証する
	if actual != expected {
		t.Errorf("should return %d, got %d", expected, actual)
	}
}
```

#### ▼ パッケージ

```go
package test

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// 正常系
func TestFoo_ShouldReturnSuccess_WhenSomethingSucceeds(t *testing.T) {
	expected := 1
	actual := foo()

	// 実際値が期待値どおりであることを検証する
	assert.Equal(t, expected, actual)
}
```

<br>

### 期待値と入力値

#### ▼ 構造体定義の場合

```go
package test

import "testing"

// 正常系
func TestFoo_ShouldReturnSuccess_WhenSomethingSucceeds(t *testing.T) {

	// 入力値
	type Input struct {
		status string
	}

	// 期待値
	type Expected struct {
		status string
	}

	// テストケース
	testCases := []struct {
		// テストケース名
		name string
		// 入力値
		input Input
		// 期待値
		expected Expected
	}{
		{
			// 正常系テストケース
			name: "TestFoo_ShouldReturnSuccess_WhenSomethingSucceeds",
			expected: Expected{
				status: "ok",
			},
			input: Input{
				status: "succeed",
			},
		},
	}

	// テストケースを反復で検証する
	for _, tt := range testCases {
		// 実際値が期待値どおりであることを検証する
	}
}
```

#### ▼ ファイル定義の場合

期待値のファイルは『ゴールデンファイル』ともいう。

```go
package test

import (
	"io/ioutil"
	"testing"
)

// 正常系
func TestFoo_ShouldReturnSuccess_WhenSomethingSucceeds(t *testing.T) {

	// 入力値
	input_foo_succeed_status, _ := ioutil.ReadFile("../testdata/data/foo_succeed_status.json")

	// 期待値
	expected_foo_succeed_status, _ := ioutil.ReadFile("../testdata/expected/foo_succeed_status.json")

	// テストケース
	cases := []struct {
		// テストケース名
		name string
		// 期待値
		expected string
		// 入力値
		input []byte
	}{
		{
            // 正常系テストケース
			name:     "TestFoo_ShouldReturnSuccess_WhenSomethingSucceeds",
			expected: expected_foo_succeed_status,
			input:    input_foo_succeed_status,
		},
	}

	// テストケースを反復で検証する
	for _, tt := range cases {
		// 実際値が期待値どおりであることを検証する
	}
}
```

<br>

### テストケース

#### ▼ テストケース名

ユニットテストの命名規則は、Goで一般的な方法（`<テストスイート名>_<テストケース名>`）にする。

`<テストケース名>` は、`〇〇の場合に~するはず`という意味で、 `<助動詞><動詞>...When...` にする。

つまり、`<テストスイート名>_<助動詞><動詞>...When...`のようになる。

```go
package test

import "testing"

// 正常系
func TestFoo_ShouldReturnSuccess_WhenSomethingSucceeds(t *testing.T) {

}
```

```go
package test

import "testing"

// 異常系
func TestFoo_ShouldReturnError_WhenSomethingFailed(t *testing.T) {

}
```

#### ▼ 正常系

```go
package test

import "testing"

// 正常系
func TestFoo_ShouldReturnSuccess_WhenSomethingSucceeds(t *testing.T) {
	// 入力値
	type Input struct {
		status string
	}

	// 期待値
	type Expected struct {
		status string
	}

	// テストケース
	testCases := []struct {
		// テストケース名
		name string
		// 期待値
		expected Expected
		// 入力値
		input Input
	}{
		{
			// 正常系テストケース
			name: "TestFoo_ShouldReturnSuccess_WhenSomethingSucceeds",
			expected: Expected{
				status: "ok",
			},
			input: Input{
				status: "succeed",
			},
		},
	}

	// テストケースを反復で検証する
	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {

			// foo関数を実行し、実際値を作成する。
			actual := foo(tt.input.status)

			// 期待値と実際値を比較する。
			if actual != tt.expected.status {
				t.Errorf("should return %s, got %s", tt.expected.status, actual)
			}
		})
	}
}
```

#### ▼ 異常系

```go
package test

import "testing"

// 異常系
func TestFoo_ShouldReturnError_WhenSomethingFailed(t *testing.T) {
	// 入力値
	type Input struct {
		status string
	}

	// 期待値
	type Expected struct {
		status string
	}

	// テストケース
	testCases := []struct {
		// テストケース名
		name string
		// 期待値
		expected Expected
		// 入力値
		input Input
	}{
		{
			// 異常系テストケース
			name: "TestFoo_ShouldReturnError_WhenSomethingFailed",
			expected: Expected{
				status: "error",
			},
			input: Input{
				status: "failed",
			},
		},
	}

	// テストケースを反復で検証する
	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {

			// foo関数を実行し、実際値を作成する。
			actual := foo(tt.input.status)

			// 期待値と実際値を比較する。
			if actual != tt.expected.status {
				t.Errorf("should return %s, got %s", tt.expected.status, actual)
			}
		})
	}
}
```

<br>

### モック
