---
title: 【IT技術の知見】ユーティリティパッケージ＠PHP
description: ユーティリティパッケージ＠PHPの知見を記録しています。
---

# ユーティリティパッケージ＠PHP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Carbon パッケージ

### Carbon とは

> - [GitHub - briannesbitt/Carbon: A simple PHP API extension for DateTime. · GitHub](https://github.com/briannesbitt/Carbon)

<br>

### データ型

#### ▼ Date 型

厳密にはデータ型ではないが、便宜上、データ型とする。

タイムスタンプとは、協定世界時(UTC)を基準にした 1970 年 1 月 1 日の 0 時 0 分 0 秒からの経過秒数を表したもの。

<table>
  <thead>
    <tr>
      <th>フォーマット</th>
      <th>実装方法</th>
      <th>備考</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>日付</td>
      <td>2019-07-07</td>
      <td>区切り記号なし、ドット、スラッシュなども可能</td>
    </tr>
    <tr>
      <td>時間</td>
      <td>19:07:07</td>
      <td rowspan="2">区切り記号なし、も可能</td>
    </tr>
    <tr>
      <td>日時</td>
      <td>2019-07-07 19:07:07</td>
    </tr>
    <tr>
      <td>タイムスタンプ (秒)</td>
      <td>1562494027</td>
      <td>1970 年 1 月 1 日の 0 時 0 分 0 秒から 2019-07-07 19:07:07 までの経過秒数</td>
    </tr>
  </tbody>
</table>

<br>

### 関数

#### ▼ `instance()` 関数

DateTime インスタンスを引数として、Carbon インスタンスを作成する。

```injectablephp
<?php

$datetime = new \DateTime("2019-07-07 19:07:07");
$carbon = Carbon::instance($datetime);

echo $carbon; // 2019-07-07 19:07:07
```

#### ▼ `create()` 関数

日時の文字列から Carbon インスタンスを作成する。

**＊実装例＊**

```injectablephp
<?php

$carbon = Carbon::create(2019, 07, 07, 19, 07, 07);

echo $carbon; // 2019-07-07 19:07:07
```

#### ▼ `createFromXXX()` 関数

指定の文字列から、Carbon インスタンスを作成する。

**＊実装例＊**

日時数字から Carbon インスタンスを作成する。

```injectablephp
<?php

// 日時数字から、Carbonインスタンスを作成する。
$carbonFromeDate = Carbon::createFromDate(2019, 07, 07);

echo $carbonFromeDate; // 2019-07-07
```

時間数字から Carbon インスタンスを作成する。

```injectablephp
<?php

// 時間数字から、Carbonインスタンスを作成する。
$carbonFromTime = Carbon::createFromTime(19, 07, 07);

echo $carbonFromTime; // 19:07:07
```

日付、時間、日時フォーマットから Carbon インスタンスを作成する。

第一引数でフォーマットを指定する必要がある。

```injectablephp
<?php

// 日付、時間、日時フォーマットから、Carbonインスタンスを作成する。
// 第一引数でフォーマットを指定する必要がある。
$carbonFromFormat = Carbon::createFromFormat("Y-m-d H:i:s", "2019-07-07 19:07:07");

echo $carbonFromFormat; // 2019-07-07 19:07:07
```

タイムスタンプフォーマットから Carbon インスタンスを作成する。

```injectablephp
<?php

// タイムスタンプフォーマットから、Carbonインスタンスを作成する。
$carbonFromTimestamp = Carbon::createFromTimestamp(1562494027);

echo $carbonFromTimestamp; // 2019-07-07 19:07:07
```

#### ▼ `parse()` 関数

日付、時間、日時フォーマットから、Carbon インスタンスを作成する。

`createFromFormat()` 関数とは異なり、フォーマットを指定する必要がない。

**＊実装例＊**

```injectablephp
<?php

$carbon = Carbon::parse("2019-07-07 19:07:07");
```

<br>

## 02. Pinq パッケージ：Php Integrated Query

### Pinq とは

配列データやオブジェクトデータに対して、クエリを送信できるようになる。

他の同様パッケージとして、Linq がある。

> - [GitHub - TimeToogo/Pinq: PHP Integrated Query, a real LINQ library for PHP · GitHub](https://github.com/TimeToogo/Pinq/)

<br>

### `Traversable::from` 関数

SQL の `SELECT` や `WHERE` といった単語を使用して、`foreach` のように、配列データやオブジェクトデータの各要素に対して、処理を行える。

**＊実装例＊**

```injectablephp
<?php

use Pinq\Traversable;

class Foo
{

    public function getData(array $entities): array
    {

        return [
          "data" => Traversable::from($entities)
            // 1つずつ要素を取り出し、関数に渡す。
            ->select(
              function (object $entity): array {
                  return $this->convertToArray($entity);
              })
            // indexからなる配列として返却。
            ->asArray(),
        ];
    }
}
```

<br>

## 03. Guzzle パッケージ

### Guzzle パッケージとは

通常、リクエストの送受信は、クライアントからサーバに対して、Postman や curl 関数などを使用して行う。

しかし、Guzzle パッケージの Client を使えば、サーバから他サーバ (例：外部の API など) に対して、リクエストの送受信できる。

> - [GitHub - guzzle/guzzle: Guzzle, an extensible PHP HTTP client · GitHub](https://github.com/guzzle/guzzle)

<br>

### リクエスト

#### ▼ GET リクエスト

**＊実装例＊**

```injectablephp
<?php

use GuzzleHttp\Client;

$client = new Client();

// GETリクエスト
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

> - [Quickstart — Guzzle Documentation](https://docs.guzzlephp.org/en/stable/quickstart.html#query-string-parameters)

#### ▼ POST リクエスト

```injectablephp
<?php

use GuzzleHttp\Client;

$client = new Client();

$json = json_encode([
    "message" => "Hello World!"
]);

// POSTリクエスト
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

> - [Quickstart — Guzzle Documentation](https://docs.guzzlephp.org/en/stable/quickstart.html#post-form-requests)

<br>

### レスポンス

#### ▼ レスポンスからボディを取得

**＊実装例＊**

```injectablephp
<?php

use GuzzleHttp\Client;

$client = new Client();

$json = json_encode([
    "message" => "Hello World!"
]);

// POSTリクエスト
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

## 04. KnpLabs/Snappy パッケージ

### KnpLabs/Snappy とは

ローカルまたは指定した URL の `html` ファイルから、PDF や画像のファイルを作成するパッケージ。

> - [GitHub - KnpLabs/snappy: PHP library allowing thumbnail, snapshot or PDF generation from a url or a html page. Wrapper for wkhtmltopdf/wkhtmltoimage · GitHub](https://github.com/KnpLabs/snappy)

<br>

### 関数

#### ▼ `generateFromHtml()` 関数

ローカルディレクトリ配下に、`html` ファイルを基にした PDF ファイルを作成する。

**＊実装例＊**

```injectablephp
<?php

$snappy = new Pdf("/usr/local/bin/wkhtmltopdf");

$snappy->generateFromHtml("foo.html", ".../foo.pdf");
```

<br>

## 05. Respect/Validation パッケージ

### Respect/Validation とは

リクエストされたデータが正しいかを、サーバサイド側で検証する。

フロントエンドからリクエストされるデータには、JavaScript と PHP の両方によるバリデーションが必要である。

> - [GitHub - Respect/Validation: The most awesome validation engine ever created for PHP · GitHub](https://github.com/Respect/Validation)

```injectablephp
<?php

// ここに実装例
```

<br>

## 06. linecorp/line-bot-sdk

### linecorp/line-bot-sdk とは

ボットサーバーにて、LINE プラットフォームに返信するためのレスポンスを作成する。

![line_messaging-api](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/line_messaging-api.png)

> - [GitHub - line/line-bot-sdk-php: LINE Messaging API SDK for PHP · GitHub](https://github.com/line/line-bot-sdk-php)
> - [Messaging APIの概要 \| LINE Developers](https://developers.line.biz/ja/docs/messaging-api/overview/)

<br>
