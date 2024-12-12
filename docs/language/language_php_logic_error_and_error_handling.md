---
title: 【IT技術の知見】エラーとエラーハンドリング＠PHP
description: エラーとエラーハンドリング＠PHPの知見を記録しています。
---

# エラーとエラーハンドリング＠PHP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. エラーとエラーハンドリング

### エラーとは

プログラムの実行が強制的に停止されるランタイムエラー (実行時エラー) 、停止せずに続行される非ランタイムエラー、に分類される。

<br>

### エラーハンドリングとは

エラーハンドリングは以下の４ステップからなる。

`(1)`

: エラー検出

`(2)`

: 例外スロー

`(3)`

: 例外キャッチ

`(4)`

: ロギング

<br>

## 01-02. エラーハンドリングの意義

### DBにとって

DB更新系の処理の途中にエラーが発生すると、DBが中途半端な更新状態になってしまう。

そのため、メソッドコールしたクラスでエラーを検出し、これをきっかけにロールバック処理を実行する必要がある。

注意点として、下層クラスのエラーの内容自体は握りつぶさずに、スタックトレースとしてメソッドコールしたクラスでロギングしておく。

<br>

### ソフトウェア開発者にとって

エラーが画面上に返却されたとしても、これはソフトウェア開発者にとってわかりにくい。

そのため、エラーをメソッドコールしたクラスで検出し、ソフトウェア開発者にわかる言葉に変換した例外としてスローする必要がある。

注意点として、下層クラスのエラー自体は握りつぶさずに、スタックトレースとしてメソッドコールしたクラスでロギングしておく。

<br>

### ユーザーにとって

エラーが画面上に返却されたとしても、ユーザーにとっては何が起きているのかわからない。

また、エラーをメソッドコールしたクラスで検出し、例外としてスローしたとしても、ソフトウェア開発者にとっては理解できるが、ユーザーにとっては理解できない。

そのため、例外スローを別の識別子 (例：boolean値) に変えてメソッドコールしたクラスに持ち上げ、最終的には、これをポップアップなどでわかりやすく通知する必要がある。

これらは、サーバーサイドのtry-catch-finally文や、フロントエンドのポップアップ処理で実現する。

注意点として、子クラスのエラー自体は握りつぶさずに、スタックトレースとしてメソッドコールしたクラスでロギングしておく。

<br>

### 01-03. 例外の定義

### 標準例外クラス

いずれもThrowableインターフェースを実装している。

以下リンクを参考にせよ。

> - https://www.php.net/manual/ja/reserved.exceptions.php

<br>

### 自前例外クラス

#### ▼ 定義

エラーの種類に合わせて、`Exception`クラスを継承した自前例外クラスを実装し、使い分けると良い。

`__construct`メソッドに、メッセージやエラーコード (例外コード) などを渡せる。

エラーコードのデフォルト値はゼロである。

> - https://www.php.net/manual/ja/exception.construct.php

エラーコードはステータスコードと異なり、例外を識別するためのものである。

異常系レスポンスのエラーコードデータとして使用される。

混乱を避けるため、例外クラスのエラーコード値にステータスコードを割り当てないようにする。

ステータスコードはコントローラーにおけるレスポンス処理で割り当てる。

**＊実装例＊**

『Foo変数が見つからない』というエラーに対応する例外クラスを定義する。

```php
<?php

class FooNotFoundException extends Exception
{
    // 基本的に何も実装しない。

    // エラーコードとステータスコードは異なるもののため、以下の様にしないこと。
    // protected $code = 400
}
```

```php
<?php

use Exception\FooNotFound;

function foo(string $foo) {

    if (empty($foo)) {
        throw new FooNotFoundException("foo is not found.");
    }

    return "これは ${foo} です。";
}
```

#### ▼ 命名規則

何のエラーが発生したかを判断できるように、名前は『`<エラー名>Exception`』とする。

また、開発者にとって詳しく理解できるように、コンストラクタの引数にメッセージを渡す。

**＊例＊**

- InvalidArgumentException

> - https://bartlomiej-kielbasa.medium.com/how-to-name-exceptions-its-not-so-obvious-df104014166a

<br>

## 02. エラー検出と例外スロー

### エラー検出と例外スローの種類

#### ▼ フレームワークの標準機能

多くのフレームワークでは、ランタイムエラーや非ランタイムエラーが発生すると、それを検知して、例外をスローしてくれる。

#### ▼ 自前定義

if-throw文を使用して、エラー検出と例外スローを実行する。

ランタイムエラーは検出できないことに注意する。特定の処理の中に、想定できる例外があり、それを例外クラスとしてするために使用する。

ここでは、全ての例外クラスの親クラスである`Exception`クラスのインスタンスを投げている。

**＊実装例＊**

```php
<?php

function value(int $value) {

    if (empty($value)) {
        // 例外クラスを返却
        throw new Exception("Value is empty");
    }

    return "これは ${value} です。";
}
```

ただし、if-throwでは、都度例外を検証するがあり、様々な可能性を考慮しなければいけなくなる。

```php
<?php

function value() {

    if (...) {
        throw new ExternalApiException();
    }

    if (...) {
        throw new FooInvalidArgumentException();
    }

    return "成功です。"
}
```

<br>

## 03. 例外キャッチ

### 例外キャッチの方法

#### ▼ try-catch-finallyとは

try-catch-finallyでは、特定の処理の中で起こる想定できない例外を捉えられる。定義されたエラー文は、デバック画面に表示される。

**＊実装例＊**

```php
<?php

use \Exception\ExternalApiErrorException;
use \Exception\HttpRequestErrorException;

class Foo
{
    public function sendMessage(Message $message)
    {
        try {

            // ExternalApiErrorException、HttpRequestErrorException、Exceptionが起こる

        } catch (ExternalApiErrorException $exception) {

            // ExternalApiErrorExceptionが発生した時の処理

        } catch (HttpRequestErrorException $exception) {

            // HttpRequestErrorExceptionが発生した時の処理

        } catch (Exception $exception) {

            // その他 (例：自社ソフトウェアなど) のExceptionが起こっ時の処理

        } finally {

            // 例外を補足したか否かに関わらず実行する。
            // try句やcatch句の返却処理や終了処理が行われる直前に実行される。

        }
    }
}

```

finally句は、try句やcatch句の返却処理が行われる直前に実行されるため、finally句では、`return`や`continue`を使用しないようにする。

```php
<?php

use Exception\ExternalApiErrorException;
use Exception\HttpRequestErrorException;

class Foo
{
    public function sendMessage(Message $message)
    {
        try {

            // `(1)`

:
            echo "Aの直前です";
            return "Aです。";

        } catch (ExternalApiErrorException $exception) {

            // `(2)`

:
            echo "Bの直前です";
            return "Bです。";

        } catch (HttpRequestErrorException $exception) {

            // `(3)`

:
            echo "Cの直前です";
            return "Cです。";

        } catch (Exception $exception) {

            // `(4)`

:
            echo "Dの直前です";
            return "Dです。";

        } finally {

            // returnやcontinueを使用しない
            echo "Eです。";

        }
    }
}
```

`(1)`

: ～`(4)`

: のいずれかで返却される時、返却の直前にfinally句が実行されることがわかる。

```php
// `(1)`

:    の場合
// Aの直前です。
// Eです。
// Aです。

// `(2)`

:    の場合
// Bの直前です。
// Eです。
// Bです。

// `(3)`

:    の場合
// Cの直前です。
// Eです。
// Cです。

// `(4)`

:    の場合
// Dの直前です。
// Eです。
// Dです。
```

<br>

### 新たな例外のスローし直し

例外をtry-catchでキャッチした後、別の新しい例外をスローしても良い。

その場合は、例外のコンストラクタの第三引数 (`previous`) を使用して、キャッチされていた元の例外も検知できるようにする。

補足として、この例外をロギングする場合、スタックトレースログとして出力される。

> - http://blog.tojiru.net/article/455279557.html
> - https://www.php.net/manual/ja/exception.construct.php

<br>

### 例外キャッチのレイヤー

#### ▼ コントローラー/ミドルウェア派

想定外のエラーも含めて、全てのエラーを検出できるように、コントローラーまたはミドルウェアにtry-catch文を実装する。

> - https://www.reddit.com/r/dotnet/comments/kyoe83/web_api_trycatch_in_controller_or_not/
> - https://softwareengineering.stackexchange.com/questions/393307/where-would-you-handle-exceptions-controller-service-repository

#### ▼ ユースケース派

コントローラーの実装をより単純にするべく、より下位のユースケースにtry-catchを実装する。

> - https://www.reddit.com/r/dotnet/comments/kyoe83/web_api_trycatch_in_controller_or_not/

<br>

## 04. ロギング

### ロギング関数

#### ▼ `error_log`関数

> - https://www.php.net/manual/ja/function.error-log.php

```php
error_log(
    "<エラーメッセージ>",
    "<メッセージの出力先 (3の場合にファイル出力) >",
    "<ログファイルへのパス>"
)
```

**＊実装例＊**

```php
<?php

class Notification
{
    public function sendMessage()
    {
        try {

            // 子クラスによる例外スローを含む処理

        } catch (\exception $exception) {

            error_log(
                sprintf(
                    "ERROR: %s at %s line %s",
                    $exception->getMessage(),
                    $exception->getFile(),
                    $exception->getLine()
                ),
                3,
                __DIR__ . "/error.log"
            );
        }
    }
}
```

他に、Loggerインターフェースを使用することも多い。

> - https://github.com/php-fig/log

```php
<?php

use Psr\Log\LoggerInterface;

class Notification
{
    private $logger;

    public function __construct(LoggerInterface $logger = null)
    {
        $this->logger = $logger;
    }

    public function sendMessage()
    {
        try {

            // 子クラスによる例外スローを含む処理

        } catch (\exception $exception) {

            $this->logger->error(sprintf(
                "ERROR: %s at %s line %s",
                $exception->getMessage(),
                $exception->getFile(),
                $exception->getLine()
            ));
        }
    }
}
```

<br>

### ロギングのレイヤー

try-catchに伴うロギングの場合、catch句の中でこれを実行する。そのため、ロギングを実行するレイヤーはtry-catchのレイヤーと同じになる。

<br>

### ログの種類別の振り分け

#### ▼ 例外ごとのロギング

例えば、メッセージアプリケーションのAPIに対してメッセージ作成のリクエストを送信する時、例外の種類に合わせて、外部APIとの接続失敗によるエラーログを作成と、自社ソフトウェアなどその他原因によるエラーログを作成を行う必要がある。

**＊実装例＊**

```php
<?php

use Exception\ExternalApiErrorException;
use Exception\HttpRequestErrorException;

class Foo
{
    public function sendMessage(Message $message)
    {
        try {

            // 外部APIのURL、送信方法、トークンなどのパラメーターが存在するかを検証。
            // 外部APIのためのリクエストを作成。
            // 外部APIのURL、送信方法、トークンなどのパラメーターを設定。

        } catch (\HttpRequestErrorException $exception) {

            // 子クラスによる例外スローを含む処理

            // 外部APIとの接続失敗によるエラーをロギング
            $this->logger->error(sprintf(
                "ERROR: %s at %s line %s",
                $exception->getMessage(),
                $exception->getFile(),
                $exception->getLine()
            ));

        } catch (\ExternalApiErrorException $exception) {

            // 子クラスによる例外スローを含む処理

            // 外部APIのソフトウェアエラーをロギング
            $this->logger->error(sprintf(
                "ERROR: %s at %s line %s",
                $exception->getMessage(),
                $exception->getFile(),
                $exception->getLine()
            ));

        } catch (\Exception $exception) {

            // 子クラスによる例外スローを含む処理

            // その他 (例：自社ソフトウェアなど) によるエラーをロギング
            $this->logger->error(sprintf(
                "ERROR: %s at %s line %s",
                $exception->getMessage(),
                $exception->getFile(),
                $exception->getLine()
            ));
        }

        // 問題なければTRUEを返却。
        return true;
    }
}
```

<br>
