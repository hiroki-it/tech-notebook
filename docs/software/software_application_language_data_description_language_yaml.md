---
title: 【IT技術の知見】YAML：YAML Ain't a Markup Language＠データ記述型言語
description: YAML：YAML Ain't a Markup Language＠データ記述型言語の知見を記録しています。
---

# YAML：YAML Ain't a Markup Language＠データ記述型言語

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. 文法

### 配列

#### ▼ ```[]```（括弧）

```yaml
account: 200  
fruit: [
  "banana",
  "apple"
]
```

#### ▼ ```-```（マイナス）

```yaml
account: 200  
fruit:
  - "banana"
  - "apple"
```

<br>

### 改行

#### ▼ ```|```（パイプ）

改行を改行のまま処理する。また、最終行の改行までを全て保存する。コマンドを繋ぐ```&&```は不要である。

> ℹ️ 参考：https://magazine.rubyist.net/articles/0009/0009-YAML.html

```yaml
command: |
  echo foo
  echo bar
```

```yaml
# 処理中の構造
{ "command" => "echo foo\necho bar\n" }
```

#### ▼ ```|+```（パイプ、プラス）

改行を改行のまま処理する。また、最終行の改行だけでなく、それ以降の改行を全て保存する。コマンドを繋ぐ```&&```は不要である。

> ℹ️ 参考：https://magazine.rubyist.net/articles/0009/0009-YAML.html

```yaml
command: |+
  echo foo
  echo bar
```

```yaml
# 処理中の構造
{ "command" => "echo foo\necho bar\n" }
```

#### ▼ ```|-```（パイプ、マイナス）

改行を改行のまま処理する。ただし、最終行は改行しない。コマンドを繋ぐ```&&```は不要である。

> ℹ️ 参考：https://magazine.rubyist.net/articles/0009/0009-YAML.html

```yaml
command: |-
  echo foo
  echo bar
```

```yaml
# 処理中の構造
{ "command" => "echo foo\necho bar" }
```

#### ▼ ```>```（大なり）

改行をスペースに変換して処理する。また、最終行の改行までを全て保存する。改行した異なるコマンドが、スペースを挟んで繋がってしまうため、```&&```で繋ぐ必要がある。

> ℹ️ 参考：https://magazine.rubyist.net/articles/0009/0009-YAML.html

```yaml
command: >
  echo foo &&
  echo bar
```


```yaml
# 処理中の構造
{ "command" => "echo foo && echo bar\n" }
```

```>```を使用すれば、一行の条件文を複数行で定義することもできる。

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

#### ▼ ```>+```（大なり、プラス）

改行をスペースに変換して処理する。また、最終行の改行だけでなく、それ以降の改行を全て保存する。改行した異なるコマンドが、スペースを挟んで繋がってしまうため、```&&```で繋ぐ必要がある。


> ℹ️ 参考：https://magazine.rubyist.net/articles/0009/0009-YAML.html

```yaml
command: >+
  echo foo &&
  echo bar
```

```yaml
# 処理中の構造
{ "command" => "echo foo && echo bar\n" }
```


#### ▼ ```>-```（大なり、マイナス）

改行をスペースに変換して処理する。ただし、最終行は改行しない。改行した異なるコマンドが、スペースを挟んで繋がってしまうため、```&&```で繋ぐ必要がある。

> ℹ️ 参考：https://magazine.rubyist.net/articles/0009/0009-YAML.html

```yaml
command: >-
  echo foo &&
  echo bar
```

```yaml
# 処理中の構造
{ "command" => "echo foo && echo bar" }
```


<br>
