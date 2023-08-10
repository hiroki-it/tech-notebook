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

静的解析を実施する。

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

PHPStanの設定を行う。

#### ▼ `includes`

```yaml
includes:
  - ./vendor/nunomaduro/larastan/extension.neon
```

#### ▼ `parameters`

静的解析の設定を行う。

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

  checkMissingIterableValueType: false
  inferPrivatePropertyTypeFromConstructor: true
```

<br>
