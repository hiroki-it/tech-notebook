---
title: 【IT技術の知見】入出力＠PHP
description: 入出力＠PHPの知見を記録しています。
---

# 入出力＠PHP

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. ビルトインラッパー関数

### 入出力ストリームへのアクセス

#### ▼ 入出力ストリームとは

一度にすべてのデータを入出力するのではなく、少しずつ入出力する処理のこと。

#### ▼ php://stdin

stdin：standard in (標準入力) を意味する。

PHP のプロセスが、標準入力に対して、読み出し処理を送信できるようになる。

```injectablephp
<?php

// ログを読み出す
$stdin = fopen("php://stdin", "r");
```

#### ▼ php://stdout

stdout：standard out (標準出力) を意味する。

PHP のプロセスが、標準出力に対して、書き込み処理を送信できるようになる。

```injectablephp
<?php

// ログを書き込む
$stderr = fopen("php://stdout", "w");
fwrite($stderr, "ログです。");
```

#### ▼ php://stderr

stderr：standard error (標準出力エラー) を意味する。

PHP のプロセスが、標準エラー出力に対して、書き込み処理を送信できるようになる。

```injectablephp
<?php

// エラーログを書き込む
$stderr = fopen("php://stderr", "w");
fwrite($stderr, "エラーログです。");
```

<br>

## 02. その他の関数

### ファイルシステム関数

#### ▼ file_put_contents

ファイルに文字列を出力する。

```injectablephp
<?php

$array = [];

// array型をJSON型に変換
$json = json_encode($array);

// fopen()、fwrite()、fclose()を実行できる。
file_put_contents(
    "data.json",
    $json
);
```

<br>

