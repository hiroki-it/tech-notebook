---
title: 【IT技術の知見】 confest＠実装ポリシー違反
description: confest＠実装ポリシー違反の知見を記録しています。
---

# confest＠実装ポリシー違反

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. confestの仕組み

### 検出項目

Regoの実装ポリシー定義に基づいて、様々なツールの設定ファイルの実装ポリシー違反を検証する。

ビルトインの実装ポリシーを持っていない。

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

### 実装ポリシーの定義

```erlang
package main

deny[msg] {
  input.kind == "Deployment"
  not input.spec.template.spec.securityContext.runAsNonRoot

  msg := "Containers must not run as root"
}

deny[msg] {
  input.kind == "Deployment"
  not input.spec.selector.matchLabels.app

  msg := "Containers must provide app label for pod selectors"
}
```

> - https://github.com/open-policy-agent/conftest

<br>

## コマンド

### test

IaCの設定ファイルを検査する。

```bash
$ conftest test deployment.yaml
FAIL - deployment.yaml - Containers must not run as root
FAIL - deployment.yaml - Containers must provide app label for pod selectors

2 tests, 0 passed, 0 warnings, 2 failures, 0 exceptions
```

> - https://www.conftest.dev/

<br>
