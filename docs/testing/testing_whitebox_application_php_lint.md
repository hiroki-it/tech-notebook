---
title: 【IT技術の知見】静的解析＠PHPのテストツール
description: 静的解析＠PHPのテストツールの知見を記録しています。
---

# 静的解析＠PHPのテストツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. PHPStan

### PHPStanとは

レベルに応じて、静的解析を実施する。

最初は、必ず検出したい項目 (例：未定義関数、引数/戻り値の型の誤り) を決めて、これを検出できるレベルを設定すると良い。

> - https://phpstan.org/user-guide/rule-levels
> - https://creators-note.chatwork.com/entry/2022/05/24/084828#%E8%A7%A3%E6%9E%90%E3%83%AC%E3%83%99%E3%83%AB%E3%82%92%E6%B1%BA%E5%AE%9A%E3%81%99%E3%82%8B

<br>

### コマンド

#### ▼ オプション無し

全てのファイルを対象として、静的解析を実施する。

```bash
$ vendor/bin/phpstan analyse
```

<br>

### phpstan.neonファイル

#### ▼ `phpstan.neonファイル`とは

PHPStanの設定を実行する。

#### ▼ `includes`

```yaml
includes:
  - ./vendor/nunomaduro/larastan/extension.neon
```

#### ▼ `parameters`

静的解析の設定を実行する。

**＊実装例＊**

```yaml
parameters:
  # 解析対象のディレクトリ
  paths:
    - src
  # 解析の厳格さ (最大レベルは８】。各レベルの解析項目については以下のリンクを参考にせよ。
  # https://phpstan.org/user-guide/rule-levels
  level: 5
  # 発生を無視するエラーメッセージ
  ignoreErrors:
    - "#Unsafe usage of new static#"
  # 解析対象として除外するディレクトリ
  excludes_analyse:
    - ./src/Foo/*

  checkMissingIterableValueType: "false"
  inferPrivatePropertyTypeFromConstructor: "true"
```

<br>
