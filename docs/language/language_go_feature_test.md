---
title: 【IT技術の知見】テスト
description: テストの知見を記録しています。
tags:
  - "言語"
  - "Go"
  - "言語機能"
---

# テスト

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. テスト

### テストの順番

`go test` コマンドは、テストファイルを並行的に実行する。

そのため、実行の順番は制御できない。

> - https://stackoverflow.com/a/29272701

<br>

### 事前/事後処理

#### ▼ 環境変数の出入力

アプリケーション外 (例：ConfigMap、`.env` ファイルなど) で環境変数を管理している場合、これをテスト時は事前に出入力する必要がある。

```go
package test

import (
	"os"
	"testing"
)

func setup() func() {

	// 環境変数を設定する
	os.Setenv("FOO_TIMEOUT", "300")
	os.Setenv("FOO_ENABLED", "false")

	return func() {
		// 事後処理
		os.Unsetenv("FOO_TIMEOUT")
		os.Unsetenv("FOO_ENABLED")
	}
}

func TestServer(t *testing.T) {

	t.Helper()
	teardown := setup()
	defer teardown()

	// ...
}
```

<br>

```go
package test

import (
	"net/http"
	"testing"
)

// setup ユニットテストの前処理の結果と，後処理の関数を返却する
func setup() (*http.Client, func()) {

	// クライアントを作成する
	client := &http.Client{}

	return client, func() {
		// 事後処理
	}
}

// TestIntegration 結合テストを実行する
func TestIntegration(t *testing.T) {

	t.Helper()
	client, teardown := setup()
	defer teardown()
    _ = client // 後続のテストで使用する

	// ...
}
```

<br>
