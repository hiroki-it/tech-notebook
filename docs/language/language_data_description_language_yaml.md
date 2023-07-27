---
title: 【IT技術の知見】YAML：YAML Ain't a Markup Language＠データ記述型言語
description: YAML：YAML Ain't a Markup Language＠データ記述型言語の知見を記録しています。
---

# YAML：YAML Ain't a Markup Language＠データ記述型言語

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 設計規約

### キー名のケース

#### ▼ ローワーキャメルケース

高頻度で使用されている。

例えば、Kubernetesではローワーキャメルケースに統一されている。

> - https://kubernetes.io/docs/contribute/style/style-guide/#use-upper-camel-case-for-api-objects

```yaml
fooBarBaz: ""
```

#### ▼ スネークケース

中頻度で使用されている。

例えば、Envoyではスネークケースに統一されている。

```yaml
foo_bar_baz: ""
```

> - https://docs.solo.io/gloo-edge/master/guides/security/rate_limiting/envoy/

#### ▼ ケバブケース

低頻度で使用されている。

```yaml
foo-bar-baz: ""
```

<br>

## 02. 文法

### 配列

#### ▼ `[]` (括弧)

```yaml
account: 200
fruit: ["banana", "apple"]
```

#### ▼ `-` (マイナス)

```yaml
account: 200
fruit:
  - "banana"
  - "apple"
```

<br>

### 改行

#### ▼ `|` (パイプ)

改行を改行のまま処理する。

また、最終行の改行までを全て保存する。

コマンドを繋ぐ`&&`や`;`は不要である。

```yaml
command: |
  echo foo
  echo bar
```

```yaml
# 処理中の構造
{ "command" => "echo foo\necho bar\n" }
```

> - https://magazine.rubyist.net/articles/0009/0009-YAML.html

#### ▼ `|+` (パイプ、プラス)

改行を改行のまま処理する。

また、最終行の改行のみでなく、それ以降の改行を全て保存する。

コマンドを繋ぐ`&&`や`;`は不要である。

```
command: |+
  echo foo
  echo bar
```

```yaml
# 処理中の構造
{ "command" => "echo foo\necho bar\n" }
```

> - https://magazine.rubyist.net/articles/0009/0009-YAML.html

#### ▼ `|-` (パイプ、マイナス)

改行を改行のまま処理する。

ただし、最終行の改行を削除する。

コマンドを繋ぐ`&&`や`;`は不要である。

```yaml
command: |-
  echo foo
  echo bar
```

```yaml
# 処理中の構造
{ "command" => "echo foo\necho bar" }
```

> - https://magazine.rubyist.net/articles/0009/0009-YAML.html

#### ▼ `>` (大なり)

改行をスペースに変換して処理する。

また、最終行の改行までを全て保存する。

改行した異なるコマンドが、スペースを挟んで繋がってしまうため、`&&`や`;`で繋ぐ必要がある。

```yaml
command: >
  echo foo &&
  echo bar
```

```yaml
# 処理中の構造
{ "command" => "echo foo;echo bar\n" }
```

`>`を使用すれば、１行の条件文を複数行で定義することもできる。

```yaml
command: if [ -z "$VAR" ];then echo foo; else echo bar; fi
```

```yaml
command: >
  if [ -z "$VAR" ];then
    echo foo;
  else
    echo bar;
  fi
```

> - https://magazine.rubyist.net/articles/0009/0009-YAML.html

#### ▼ `>+` (大なり、プラス)

改行をスペースに変換して処理する。

また、最終行の改行のみでなく、それ以降の改行を全て保存する。

値が長くなる場合に便利である。

改行した異なるコマンドが、スペースを挟んで繋がってしまうため、`&&`や`;`で繋ぐ必要がある。

```
command: >+
  echo foo &&
  echo bar
```

```yaml
# 処理中の構造
{ "command" => "echo foo && echo bar\n" }
```

> - https://magazine.rubyist.net/articles/0009/0009-YAML.html

#### ▼ `>-` (大なり、マイナス)

改行をスペースに変換して処理する。

ただし、最終行の改行を削除する。

値が長くなる場合に便利である。

改行した異なるコマンドが、スペースを挟んで繋がってしまうため、`&&`や`;`で繋ぐ必要がある。

```yaml
command: >-
  echo foo &&
  echo bar
```

```yaml
# 処理中の構造
{ "command" => "echo foo && echo bar" }
```

> - https://magazine.rubyist.net/articles/0009/0009-YAML.html

<br>
