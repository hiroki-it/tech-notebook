---
title: 【IT技術の知見】ReviewDog＠自動レビューツール
description: ReviewDog＠自動レビューツールの知見を記録しています。
---

# ReviewDog＠自動レビューツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ReviewDogとは

任意のツールの標準エラー出力の結果を、GitHubのプルリクエスト上にPOSTで送信する。

<br>

## 02. コマンド

### -f

#### ▼ -fとは

標準エラー出力のフォーマットを設定する。

#### ▼ phpstanの場合

```bash
$ ./vendor/bin/phpstan analyse --error-format=raw --no-progress -l 5 index.php \
    | reviewdog -reporter=github-pr-review -f=phpstan
```

> - https://r-tech14.com/reviewdog/#toc2

### --list

#### ▼ --listとは

ReviewDogがコメントを送信する時の組み込みフォーマットを表示する。

`-f`オプションで指定できる。

```bash
$ reviewdog --list

rdjson          Reviewdog Diagnostic JSON Format (JSON of DiagnosticResult message)                                             - https://github.com/reviewdog/reviewdog
rdjsonl         Reviewdog Diagnostic JSONL Format (JSONL of Diagnostic message)                                                 - https://github.com/reviewdog/reviewdog
diff            Unified Diff Format                                                                                             - https://en.wikipedia.org/wiki/Diff#Unified_format

...
                                                                                     - https://www.typescriptlang.org/
tslint          An extensible linter for the TypeScript language                                                                - https://github.com/palantir/tslint
typos           Source code spell checker                                                                                       - https://github.com/crate-ci/typos
yamllint        (yamllint -f parsable) A linter for YAML files                                                                  - https://github.com/adrienverge/yamllint
```

<br>

## 03. `.reviewdog.yml`ファイル

```yaml

```

<br>
