---
title: 【IT技術の知見】Goのテストツール＠アプリのホワイトボックステスト
description: Goのテストツール＠アプリのホワイトボックステストの知見を記録しています。
---

# Goのテストツール＠アプリのホワイトボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ホワイトボックステストのツール

### 整形

| ツール名               | 解析内容 | 理由 |
| ---------------------- | -------- | ---- |
| 標準の`go fmt`コマンド |          |      |

<br>

### 静的解析

#### ▼ ベストプラクティス

| ツール名               | 解析内容                                                        | 理由                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 標準の`go vet`コマンド |                                                                 |                                                                                                                                      |
| gochecknoinits         | `init`関数を使用していないかを検証する。                        | `init`関数を使うと、プログラムの挙動が複雑になり、可読性が低下するため、使用しするべきではない。                                     |
| gomnd                  | マジックナンバーを採用していないかを検証する。                  |                                                                                                                                      |
| funlen                 | メソッド名が指定した文字数より長くないかを検証する。            |                                                                                                                                      |
| lll                    | 一行が指定した文字数より長くないかを検証する。                  |                                                                                                                                      |
| statickcheck           | パフォーマンスの出る実装方法になっているかを検証する。          |                                                                                                                                      |
| stylecheck             | Effective Goに則った方法で実装しているかを検証する。            | パッケージ名にアンダースコアを使用していないか。キャメルケースの変数名に略語 (例：HTTP、IDなど) を使う場合、略語は全て大文字にする。 |
| whitespace             | 不要な改行がないかを検証する。                                  |                                                                                                                                      |
| gocognit               | コードが複雑 (例：`if`の入れ子) であるかどうかを検証する。      |                                                                                                                                      |
| godox                  | TODOコメントがあるかどうかを検証する。                          |                                                                                                                                      |
| goimports              | 足りない`import`や余分な`import`があるかどうかを検証する。      |                                                                                                                                      |
| goprintffuncname       | `printf`のようなメソッドの名前が`f`で終わっているかを検証する。 |                                                                                                                                      |
| revive                 | 用意されたコード規約に則っているかを検証する。                  |                                                                                                                                      |

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

- 標準の`go fmt`コマンド

<br>

## 02. 標準のテストツール

### 標準のテストツールとは

`go`コマンドが提供するホワイトボックス機能のこと。

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

これにより、モックに差し替えられるようになる。

<br>

### テーブル駆動テスト

テストデータ (`data`、`in`) と期待値 (`expected`、`want`) をファイル (例：`json`、`yaml`) として用意しておく。

これを`ReadFile`関数で読み出し、テストケースの構造体を定義する。

テストケースの構造体を反復処理し、テストを実施する。

```go
package test

import (
	"io/ioutil"
	"testing"
)

/**
 * foo関数をテストする
 */
func TestFoo(t *testing.T) {

	// ファイルを読み込む。
	expected_foo_succeed_status, _ := ioutil.ReadFile("../testdata/expected/foo_succeed_status.json")
	data_foo_succeed_status, _ := ioutil.ReadFile("../testdata/data/foo_succeed_status.json")

	expected_foo_failed_status, _ := ioutil.ReadFile("../testdata/expected/foo_succeed_status.json")
	data_foo_failed_status, _ := ioutil.ReadFile("../testdata/data/foo_succeed_status.json")

	// テストケース
	cases := []struct {
		// テストケース名
		name string
		// 期待値
		expected string
		// テストデータ
		data []byte
	}{
		{
			name:     "TestFoo_SucceedStatus_ReturnOk",
			expected: expected_foo_succeed_status,
			data:     data_foo_succeed_status,
		},
		{
			name:     "TestFoo_FailedStatus_ReturnOk",
			expected: expected_foo_failed_status,
			data:     data_foo_failed_status,
		},
	}

	// テストケースを反復で処理する。
	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {

			// foo関数を実行し、実際値を作成する。

			// 期待値と実際値を比較する。
			assert.JSONEq(t, tt.expected, actual)
		})
	}
}
```

> - https://github.com/golang/go/wiki/TableDrivenTests

<br>
