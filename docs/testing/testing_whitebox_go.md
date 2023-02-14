---
title: 【IT技術の知見】Goの場合＠ホワイトボックステスト
description: Goの場合＠ホワイトボックステストの知見を記録しています。
---

# Goの場合＠ホワイトボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. ホワイトボックステストのツール

### 整形

標準の```go fmt```コマンド

<br>

### 静的解析

標準の```go vet```コマンド

<br>

### 単体テスト、機能テストツール

標準の```go fmt```コマンド

<br>

## 02. 標準のテストツール

### 標準のテストツールとは

```go```コマンドが提供するホワイトボックス機能のこと。



<br>

### 網羅率

網羅率はパッケージを単位として解析される。



<br>

## 03. 設計ポリシー

### パッケージ名

#### ▼ ホワイトボックステスト

テストファイルのパッケージ名が、同じディレクトリ配下にある実際の処理ファイルのパッケージ名と同じ場合、それはホワイトボックステストになる。



#### ▼ ブラックボックス風のホワイトテスト

テストファイルのパッケージ名が、同じディレクトリ配下にある実際の処理ファイルに『```_test```』を加えたパッケージ名の場合、それはブラックボックステスト風のホワイトテストになる。

補足として、Goでは1つのディレクトリ内に1つのパッケージ名しか宣言できないが、ブラックボックステストのために『```_test```』を加えることは許されている。



> ↪️ 参考：https://medium.com/tech-at-wildlife-studios/testing-golang-code-our-approach-at-wildlife-6f41e489ff36

<br>

### インターフェースの導入

テストできない構造体はモックに差し替えられることなる。

この時、あらかじめ実際の構造体をインターフェースの実装にしておく。

テスト時に、モックもインターフェイスの実装とすれば、モックが実際の構造体と同じデータ型として認識されるようになる。

これにより、モックに差し替えられるようになる。



<br>

### テーブル駆動テスト

テストデータ (```data```、```in```) と期待値 (```expected```、```want```) をファイル (例：```.json```、```.yaml```) として用意しておく。

これを```ReadFile```関数で読み出し、テストケースの構造体を定義する。

テストケースの構造体を反復処理し、テストを実施する。



> ↪️ 参考：https://github.com/golang/go/wiki/TableDrivenTests


```go
package test

import (
	"io/ioutil"
	"testing"
)

/**
 * fooメソッドをテストします。


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

			// fooメソッドを実行し、実際値を作成する。

			// 期待値と実際値を比較する。
			assert.JSONEq(t, tt.expected, actual)
		})
	}
}

```

<br>
