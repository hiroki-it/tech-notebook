---
title: 【IT技術の知見】golangci-lint＠静的解析
description: golangci-lint＠静的解析の知見を記録しています。
---

# golangci-lint＠静的解析

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. golangci-lintとは

Goのさまざまな静的解析ツールをまとめて実行できる。

```yaml
# golangci-lintの公式リポジトリのサンプルを参考にする
# @see https://github.com/golangci/golangci-lint/blob/main/.golangci.yml
version: "2"

linters:
  enable:
    # HTTPレスポンスボディのClose漏れを検出する
    - bodyclose
    # 返却値のエラーハンドリング漏れを検出する
    - errcheck
    # go vetのエラーを検出する
    - govet
    # 意味のない代入を検出する
    - ineffassign
    # 英単語のスペルミスを検出する
    - misspell
    # nolintコメントの不足を検出する
    - nolintlint
    # Goのスタイル規約や命名規約違反を検出する
    - staticcheck
    # 不要な型変換を検出する
    - unconvert
    # 使用されていない引数を検出する
    - unparam
    # 使用されていない関数、型、定数、数などを検出する
    - unused

formatters:
  enable:
    # gofmtによる整形差分を検出する
    - gofmt
    # importの並び順や不要importを検出する
    - goimports
```

> - https://golangci-lint.run/usage/linters/
> - https://zenn.dev/sanpo_shiho/books/61bc1e1a30bf27/viewer/642fe9

<br>

## 02. CIへの導入

### GitLab CI

```yaml
variables:
  GO_VERSION: "<Goのバージョン>"
  # golangci-lintのイメージレイヤーから、使用しているGoバージョンを確認する必要がある
  # @see https://hub.docker.com/layers/golangci/golangci-lint/v1.50-alpine/images/sha256-9f44001cd4ce1e9749f2f1fb63adb76787b7dfcc77cb7b54e65e74ddac4132d8?context=explore
  GOLANGCI_LINT: "<golangci-lintのバージョン>"

stages:
  - build
  - test

go_build:
  stage: build
  image: ${CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX}/golang:${GO_VERSION}
  script:
    # バージョンを確認する
    - go version
    - go mod tidy
    # go mod tidyで差分があれば、CIを失敗させる
    - git diff --exit-code

go_lint:
  stage: test
  image: ${CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX}/golangci/golangci-lint:<必要なGoのバージョンを含むイメージ>-alpine
  script:
    - go version
    # 有効化している静的解析の一覧を表示する
    # GitLab CIでは色が無効になってしまうため、有効化する
    - golangci-lint linters --color always
    # 静的解析を実行する
    # GitLab CIでは色が無効になってしまうため、有効化する
    - golangci-lint run --color always --timeout 5m
```

<br>

## 03. .golangci.yml

golangci-lint v2系では、設定ファイルに `version: "2"` を指定する。

```yaml
version: "2"
```

<br>

### run

```yaml
# 実行のオプションを設定する
run:
  concurrency: 4
  timeout: 5m
  issues-exit-code: 2
  # testファイルがあるか否かを設定する
  tests: false
  # 設定ファイル、go.mod、Gitルート、作業ディレクトリのどれを基準に相対パスを解釈するかを設定する
  relative-path-mode: gomod
  build-tags:
    - mytag
  modules-download-mode: readonly
  allow-parallel-runners: false
  allow-serial-runners: true
  # Goのバージョンを指定する
  go: "1.23"
```

<br>

### output

```yaml
# 結果の出力形式を設定する
output:
  formats:
    text:
      path: stdout
      print-issued-lines: false
      print-linter-name: false
      colors: true
    json:
      path: ./golangci-lint-report.json
  path-prefix: ""
  path-mode: ""
  sort-order:
    - linter
    - severity
    - file
  show-stats: true
```

<br>

### linters

```yaml
# 使用するリンターを選ぶ
linters:
  # defaultにはstandard、all、none、fastを指定できる
  default: none
  enable:

    ...

    - gosec
    - govet

    # staticcheckを使用する
    - staticcheck

    ...

  disable:
    - lll

    ...
```

<br>

### linters.settings

```yaml
# 使用するリンターにオプションを設定する
linters:
  settings:
    # staticcheckにオプションを設定する
    staticcheck:
      checks: [ "all" ]

    ...

    govet:
      enable:
        - nilness
        - shadow
      settings:
        printf:
          funcs:
            - (github.com/example/project/pkg/log.Log).Infof

    gocyclo:
      min-complexity: 15
```

<br>

### linters.exclusions

```yaml
# 検証から除外するルールを設定する
linters:
  exclusions:
    # 生成ファイルの除外モードを設定する
    generated: strict
    # 定義済みの除外ルールを使用する
    presets:
      - comments
      - std-error-handling
      - common-false-positives
      - legacy
    rules:
      - path: _test\.go
        linters:
          - gocyclo
          - errcheck
          - dupl
          - gosec
      - path-except: _test\.go
        linters:
          - forbidigo
      - path: internal/hmac/
        text: weak cryptographic primitive
        linters:
          - gosec
      - linters:
          - staticcheck
        text: "SA9003:"
      - linters:
          - lll
        source: "^//go:generate "
    paths:
      - ".*\\.my\\.go$"
      - lib/bad.go
```

<br>

### formatters

```yaml
# 使用するフォーマッターを選ぶ
formatters:
  enable:
    - gofmt
    - goimports
  settings:
    gofmt:
      rewrite-rules:
        - pattern: "interface{}"
          replacement: "any"
    goimports:
      local-prefixes:
        - github.com/example/project
  exclusions:
    paths:
      - test/testdata
```

<br>

### issues

```yaml
# 検出結果の表示方法や差分検出を設定する
issues:
  max-issues-per-linter: 0
  max-same-issues: 0
  uniq-by-line: false
  new: true
  new-from-merge-base: main
  new-from-rev: HEAD
  new-from-patch: path/to/patch/file
  whole-files: true
  fix: true
```

<br>

### severity

```yaml
# 重要度を設定する
severity:
  default: error
  rules:
    - path: _test\.go
      linters:
        - dupl
      severity: info
```

> - https://github.com/golangci/golangci-lint/blob/main/.golangci.yml
> - https://github.com/golangci/golangci-lint/blob/main/.golangci.reference.yml

<br>

### v1系からの変更点

v2系では `linters-settings` は `linters.settings` に移動した。

また、除外ルールは `issues.exclude-rules` ではなく `linters.exclusions.rules` に設定する。

`gofmt` や `goimports` などのフォーマッターは、`linters.enable` ではなく `formatters.enable` に設定する。

<br>

## 04. コマンド

### グローバル

#### ▼ --color

コマンドの実行結果に色をつける。

CIによっては、実行時に色がなくなってしまうが、`always` を有効化すると色がつくようになる。

```bash
$ golangci-lint linters --color always
```

<br>

### run

#### ▼ --go

Goのバージョンを指定して実行する。

```bash
$ golangci-lint run --go <バージョン>
```

#### ▼ --config

設定ファイルを指定する。

```bash
$ golangci-lint run --config .golangci.yml
```

<br>

### linters

有効/無効になっている解析の一覧を取得できる。

```bash
$ golangci-lint linters

# Enabled by your configuration linters:
errcheck: errcheck is a program for checking for unchecked errors in Go code. These unchecked errors can be critical bugs in some cases [fast: false, auto-fix: false]
gosimple: Linter for Go source code that specializes in simplifying code [fast: false, auto-fix: false]
govet: Vet examines Go source code and reports suspicious constructs. It is roughly the same as 'go vet' and uses its passes. [fast: false, auto-fix: false]
ineffassign: Detects when assignments to existing variables are not used [fast: true, auto-fix: false]
staticcheck: It's a set of rules from staticcheck. It's not the same thing as the staticcheck binary. The author of staticcheck doesn't support or approve the use of staticcheck as a library inside golangci-lint. [fast: false, auto-fix: false]
unused: Checks Go code for unused constants, variables, functions and types [fast: false, auto-fix: false]

# Disabled by your configuration linters:
asasalint: check for pass []any as any in variadic func(...any) [fast: false, auto-fix: false]
asciicheck: checks that all code identifiers does not have non-ASCII symbols in the name [fast: true, auto-fix: false]

...
```

<br>

## 05. コメントアウト

### 静的解析の無視

#### ▼ プロジェクト全体

```yaml
linters:
  settings:
    staticcheck:
      checks:
        - all
        # マイナスをつけると無視できる
        - "-SA1000"
        - "-SA1004"
```

> - https://golangci-lint.run/usage/false-positives/#specific-linter-excludes

#### ▼ 特定のパス

```yaml
linters:
  exclusions:
    rules:
      - path-except: '(.+)_test\.go'
        linters:
          - staticcheck
```

> - https://golangci-lint.run/usage/false-positives/#exclude-or-skip

#### ▼ 特定のファイル

```go
//nolint:staticcheck
package pkg
```

> - https://golangci-lint.run/usage/false-positives/#nolint-directive

#### ▼ 特定のコード

コメントアウトのコードに対して、指定した番号の静的解析を無視する。

注意点として、各ツールの用意しているignoreコメントではなく、golangci-lint専用のコメントである。

特定の番号 (例：`SA1019`) を無視することは難しそう。

```go
package grpc

import (
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc/filters"
	"google.golang.org/grpc"

	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
)

// ChainUnaryServerInterceptor gRPCサーバー側の計装に必要なUnaryServerInterceptorをチェインする
// NOTE:
// このミドルウェアを実行すると、リクエストを単位としてスパンを自動的に開始/終了できる
func ChainUnaryServerInterceptor(opts ...otelgrpc.Option) grpc.ServerOption {
	return grpc.ChainUnaryInterceptor(
		grpc_recovery.UnaryServerInterceptor(),
		//nolint:staticcheck // NewServerHandlerが推奨となっているが、実装時点 (2027/07/02) のバージョンではNewServerHandlerはオプションが少ないため、止むを得ず非推奨のUnaryServerInterceptorを使う
		otelgrpc.UnaryServerInterceptor(
			append(opts, []otelgrpc.Option{
				InterceptorFilterHealthCheck(),
			}...)...,
		),
	)
}

// ChainStreamServerInterceptor gRPCサーバー側の計装に必要なStreamServerInterceptorをチェインする
// NOTE:
// このミドルウェアを実行すると、リクエストを単位としてスパンを自動的に開始/終了できる
func ChainStreamServerInterceptor(opts ...otelgrpc.Option) grpc.ServerOption {
	return grpc.ChainStreamInterceptor(
		grpc_recovery.StreamServerInterceptor(),
		//nolint:staticcheck // NewServerHandlerが推奨となっているが、実装時点 (2027/07/02) のバージョンではNewServerHandlerはオプションが少ないため、止むを得ず非推奨のStreamServerInterceptorを使う
		otelgrpc.StreamServerInterceptor(
			append(opts, []otelgrpc.Option{
				InterceptorFilterHealthCheck(),
			}...)...,
		),
	)
}

// InterceptorFilterHealthCheck ヘルスチェックパスではスパンを作成しない
func InterceptorFilterHealthCheck() otelgrpc.Option {

	//nolint:staticcheck // gRPCのstats handlerが推奨となっているが、実装時点 (2027/07/02) のバージョンではstats handlerはオプションが少ないため、止むを得ず非推奨のWithInterceptorFilterを使う
	return otelgrpc.WithInterceptorFilter(filters.Not(filters.HealthCheck()))
}
```

> - https://golangci-lint.run/usage/false-positives/#nolint-directive

<br>
