---
title: 【IT技術の知見】 confest＠コード規約違反
description: confest＠コード規約違反の知見を記録しています。
---

# confest＠コード規約違反

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. confestの仕組み

### 検出項目

Regoのユーザー定義のポリシーに基づいて、様々なツールの設定ファイルのコード規約違反を検証する。

ビルトインのコード規約はなく、ユーザーがRegoで規約を実装しないといけない。

> - https://github.com/open-policy-agent/conftest
> - https://www.conftest.dev/examples/

<br>

## セットアップ

### インストール

#### ▼ Brew

```bash
$ brew install conftest
```

<br>

## コード規約

### 重要度レベル

#### ▼ deny

コード規約に違反した場合に、終了コード `1` を出力する。

```erlang
package main

deny[msg] {
  input.kind == "Deployment"

  not input.spec.template.spec.securityContext.runAsNonRoot

  msg := "Containers must not run as root"
}
```

> - https://github.com/open-policy-agent/conftest
> - https://qiita.com/Udomomo/items/10ed2dbfef85812808da#conftest%E3%81%A7policy%E3%82%92%E6%9B%B8%E3%81%84%E3%81%A6%E3%81%BF%E3%82%8B

#### ▼ violation

コード規約に違反した場合に、終了コード `0` を出力する。

```erlang
package main

violation[msg] {
  input.kind == "Deployment"

  not input.spec.template.spec.securityContext.runAsNonRoot

  msg := "Containers must not run as root"
}
```

> - https://qiita.com/Udomomo/items/10ed2dbfef85812808da#conftest%E3%81%A7policy%E3%82%92%E6%9B%B8%E3%81%84%E3%81%A6%E3%81%BF%E3%82%8B

<br>

## コマンド

### test

#### ▼ testとは

設定ファイルを検査する。

#### ▼ -p

Regoファイルのあるディレクトリ名を設定する。

```bash
$ conftest test deployment.yaml -p ./policies
FAIL - deployment.yaml - Containers must not run as root
FAIL - deployment.yaml - Containers must provide app label for pod selectors

2 tests, 0 passed, 0 warnings, 2 failures, 0 exceptions
```

> - https://www.conftest.dev/

<br>
