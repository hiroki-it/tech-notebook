---
title: 【知見を記録するサイト】その他パッケージ＠PHP
description: その他パッケージ＠PHPの知見をまとめました。
---

# その他パッケージ＠PHP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Carbonパッケージ

### Carbonとは

参考：https://github.com/briannesbitt/Carbon

<br>

### データ型

#### ▼ Date型

厳密にはデータ型ではないが、便宜上、データ型とする。タイムスタンプとは、協定世界時(UTC)を基準にした1970年1月1日の0時0分0秒からの経過秒数を表したもの。

| フォーマット         | 実装方法            | 備考                                                         |
| -------------------- | ------------------- | ------------------------------------------------------------ |
| 日付                 | 2019-07-07          | 区切り記号なし、ドット、スラッシュなども可能                 |
| 時間                 | 19:07:07            | 区切り記号なし、も可能                                       |
| 日時                 | 2019-07-07 19:07:07 | 同上                                                         |
| タイムスタンプ（秒） | 1562494027          | 1970年1月1日の0時0分0秒から2019-07-07 19:07:07 までの経過秒数 |

<br>

### メソッド

#### ▼ ```instance```メソッド 

DateTimeインスタンスを引数として、Carbonインスタンスを作成する。

```php
<?php
    
$datetime = new \DateTime("2019-07-07 19:07:07");
$carbon = Carbon::instance($datetime);

echo $carbon; // 2019-07-07 19:07:07
```

<br>

#### ▼ ```create```メソッド

日時の文字列からCarbonインスタンスを作成する。

**＊実装例＊**

```php
<?php
    
$carbon = Carbon::create(2019, 07, 07, 19, 07, 07);

echo $carbon; // 2019-07-07 19:07:07
```

<br>

#### ▼ ```createFromXXX```メソッド

指定の文字列から、Carbonインスタンスを作成する。

**＊実装例＊**

日時数字からCarbonインスタンスを作成する。

```php
<?php
    
// 日時数字から、Carbonインスタンスを作成する。
$carbonFromeDate = Carbon::createFromDate(2019, 07, 07);

echo $carbonFromeDate; // 2019-07-07
```

時間数字からCarbonインスタンスを作成する。

```php
<?php
    
// 時間数字から、Carbonインスタンスを作成する。
$carbonFromTime = Carbon::createFromTime(19, 07, 07);

echo $carbonFromTime; // 19:07:07
```

日付、時間、日時フォーマットからCarbonインスタンスを作成する。第一引数でフォーマットを指定する必要がある。

```php
<?php
    
// 日付、時間、日時フォーマットから、Carbonインスタンスを作成する。
// 第一引数でフォーマットを指定する必要がある。
$carbonFromFormat = Carbon::createFromFormat("Y-m-d H:m:s", "2019-07-07 19:07:07");

echo $carbonFromFormat; // 2019-07-07 19:07:07
```

タイムスタンプフォーマットからCarbonインスタンスを作成する。

```php
<?php
    
// タイムスタンプフォーマットから、Carbonインスタンスを作成する。
$carbonFromTimestamp = Carbon::createFromTimestamp(1562494027);

echo $carbonFromTimestamp; // 2019-07-07 19:07:07
```

<br>

#### ▼ ```parse```メソッド

日付、時間、日時フォーマットから、Carbonインスタンスを作成する。```createFromFormat```メソッドとは異なり、フォーマットを指定する必要がない。

**＊実装例＊**

```php
<?php
    
$carbon = Carbon::parse("2019-07-07 19:07:07")
```

<br>

## 02. Pinqパッケージ：Php Integrated Query

### Pinqとは

配列データやオブジェクトデータに対して、クエリを実行できるようになる。他の同様パッケージとして、Linqがある。

参考：https://github.com/TimeToogo/Pinq/

<br>

### ```Traversable::from```メソッド

SQLの```SELECT```や```WHERE```といった単語を使用して、```foreach```のように、配列データやオブジェクトデータの各要素に対して、処理を行える。

**＊実装例＊**

```php
<?php
    
use Pinq\Traversable;

class Foo
{
    
    public function getData(array $entities)
    {
        
        return [
          "data" => Traversable::from($entities)
            // 1つずつ要素を取り出し、関数に渡す。
            ->select(
              function ($entity) {
                  return $this->convertToArray($entity);
              })
            // indexからなる配列として返却。
            ->asArray(),
        ];
    }
}
```

<br>

## 03. Guzzleパッケージ

### Guzzleパッケージとは

通常、リクエストメッセージの送受信は、クライアントからサーバに対して、Postmanやcurl関数などを使用して行う。しかし、GuzzleパッケージのClientを使えば、サーバから他サーバ（外部のAPIなど）に対して、リクエストメッセージの送受信できる。

参考：https://github.com/guzzle/guzzle

<br>

### リクエスト

#### ▼ GET送信

参考：https://docs.guzzlephp.org/en/stable/quickstart.html#query-string-parameters

**＊実装例＊**

```php
<?php

use GuzzleHttp\Client;

$client = new Client();

// GET送信
$response = $client->request(
    "GET",
    "https://example.com",
    [
        "query" => [
            "id" => 1
        ]
    ]
);
```

#### ▼ POST送信

参考：https://docs.guzzlephp.org/en/stable/quickstart.html#post-form-requests

```php
<?php

use GuzzleHttp\Client;

$client = new Client();

$json = json_encode([
    "message" => "Hello World!"
]);

// POST送信
$response = $client->request(
    "POST",
    "https://example.com",
    [
        "headers"     => [
            "Authorization"  => $this->token,
            "Content-Length" => strlen($json),
            "Content-Type"   => "application/json",
        ],
        "form_params" => [
            "body" => $message
        ]
    ]
);
```

<br>

### レスポンス

#### ▼ レスポンスメッセージからボディを取得

**＊実装例＊**

```php
<?php

use GuzzleHttp\Client;

$client = new Client();

$json = json_encode([
    "message" => "Hello World!"
]);

// POST送信
$response = $client->request(
    "POST",
    "https://example.com",
    [
        "headers"     => [
            "Authorization"  => $this->token,
            "Content-Length" => strlen($json),
            "Content-Type"   => "application/json",
        ],
        "form_params" => [
            "body" => $message
        ]
    ]
);

$body = json_decode($response->getBody(), true);
```

<br>

## 04. KnpLabs/Snappyパッケージ

### KnpLabs/Snappyとは

ローカルまたは指定したURLの```.html```ファイルから、PDFや画像のファイルを生成するパッケージ。

参考：https://github.com/KnpLabs/snappy

<br>

### メソッド

#### ▼ ```generateFromHtml```メソッド

ローカルディレクトリ配下に、```.html```ファイルを基にしたPDFファイルを作成する。

**＊実装例＊**

```php
<?php
    
$snappy = new Pdf("/usr/local/bin/wkhtmltopdf");

$snappy->generateFromHtml("foo.html", ".../foo.pdf");
```

<br>

## 05. Respect/Validationパッケージ

### Respect/Validationとは

リクエストされたデータが正しいかを、サーバサイド側で検証する。フロントエンドからリクエストされるデータに関しては、JavaScriptとPHPの両方によるバリデーションが必要である。

参考：https://github.com/Respect/Validation

```php
<?php
    
// ここに実装例
```

<br>

## 06. linecorp/line-bot-sdk

### linecorp/line-bot-sdkとは

![line_messaging-api](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/line_messaging-api.png)

ボットサーバーにて、LINEプラットフォームに返信するためのレスポンスを作成する。

参考：

- https://github.com/line/line-bot-sdk-php
- https://developers.line.biz/ja/docs/messaging-api/overview/
