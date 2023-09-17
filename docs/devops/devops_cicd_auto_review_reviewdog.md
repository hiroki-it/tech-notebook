---
title: 【IT技術の知見】reviewdog＠自動レビューツール
description: reviewdog＠自動レビューツールの知見を記録しています。
---

# reviewdog＠自動レビューツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. reviewdogとは

任意のツールの標準出力/標準エラー出力の結果を、レビューコメントとしてGitHubにPOSTで送信する。

<br>

## 02. コマンド

### -conf

`reviewdog.yml`ファイルを指定して、`review`コマンドを実行する。

```bash
$ reviewdog -conf=.reviewdog.yml
```

<br>

### -f

#### ▼ -fとは

`reviewdog`コマンドに渡す時の標準出力/標準エラー出力のフォーマットを設定する。

このフォーマットに基づいて、`reviewdog`コマンドは処理結果を認識する。

ビルトインのフォーマットがあればこれを使用でき、無い場合はユーザーがツールの出力内容に基づいて設定する必要がある。

#### ▼ phpstanの場合

PHPStanが標準出力/標準エラー出力に出力する結果のフォーマットを設定する。

```bash
$ ./vendor/bin/phpstan analyse --error-format=raw --no-progress -l 5 index.php \
    | reviewdog -reporter=github-pr-review -f=phpstan
```

> - https://qiita.com/ishii1648/items/4878b01823113b50128d#%E5%AE%9F%E8%A3%85
> - https://r-tech14.com/reviewdog/#toc2

#### ▼ yamllint

```bash
$ yamllint foo.yaml \
   | reviewdog -reporter=github-pr-review -f=yamllint
```

<br>

### --list

#### ▼ --listとは

宛先に送信するビルトインのエラーフォーマットを表示する。

`-f`オプションで指定できる。

```bash
$ reviewdog --list

rdjson          Reviewdog Diagnostic JSON Format (JSON of DiagnosticResult message)                                             - https://github.com/reviewdog/reviewdog
rdjsonl         Reviewdog Diagnostic JSONL Format (JSONL of Diagnostic message)                                                 - https://github.com/reviewdog/reviewdog
diff            Unified Diff Format                                                                                             - https://en.wikipedia.org/wiki/Diff#Unified_format

...

tslint          An extensible linter for the TypeScript language                                                                - https://github.com/palantir/tslint
typos           Source code spell checker                                                                                       - https://github.com/crate-ci/typos
yamllint        (yamllint -f parsable) A linter for YAML files                                                                  - https://github.com/adrienverge/yamllint
```

<br>

## 03. `.reviewdog.yml`ファイル

`reviewdog`コマンドのオプションを宣言的に設定できる。

```yaml
runner:
  golint:
    cmd: golint $(go list ./... | grep -v /vendor/)
    format: golint
    level: warning
  govet:
    cmd: go vet $(go list ./... | grep -v /vendor/)
    format: govet
  errcheck:
    cmd: errcheck -asserts -ignoretests -blank $(go list ./... | grep -v /vendor/)
    errorformat:
      - "%f:%l:%c:%m"
    level: warning
  staticcheck:
    cmd: staticcheck $(go list ./... | grep -v /vendor/)
    errorformat:
      - "%f:%l:%c: %m"
  misspell:
    cmd: misspell $(git ls-files)
    errorformat:
      - "%f:%l:%c: %m"
  unparam:
    cmd: unparam $(go list ./... | grep -v /vendor/)
    errorformat:
      - "%f:%l:%c: %m"
  revive:
    cmd: revive -config=.revive.toml $(go list ./... | grep -v /vendor/)
    format: golint
    level: warning
  golangci:
    cmd: golangci-lint run --out-format=line-number ./...
    errorformat:
      - "%E%f:%l:%c: %m"
      - "%E%f:%l: %m"
      - "%C%.%#"
    level: warning
```

> - https://github.com/reviewdog/reviewdog/tree/master#reviewdog-config-file
> - https://github.com/reviewdog/reviewdog/blob/master/.reviewdog.yml

<br>
