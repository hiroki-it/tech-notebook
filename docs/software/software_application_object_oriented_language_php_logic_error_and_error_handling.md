---
title: 【知見を記録するサイト】エラーとエラーハンドリング＠PHP
---

# エラーとエラーハンドリング＠PHP

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. エラーとエラーハンドリング

### エラーとは

プログラムの実行が強制停止されるランタイムエラー（実行時エラー），停止せずに続行される非ランタイムエラー，に分類される．

<br>

### エラーハンドリングとは

エラーハンドリングは以下の４ステップからなる．

1. エラー検出
2. 例外スロー
3. 例外キャッチ
4. ロギング

<br>

## 01-02. エラーハンドリングの意義

### データベースにとって

データベース更新系の処理の途中にエラーが発生すると，データベースが中途半端な更新状態になってしまう．そのため，メソッドコールしたクラスでエラーを検出し，これをきっかけにロールバック処理を実行する必要がある．なお，下層クラスのエラーの内容自体は握りつぶさずに，スタックトレースとしてメソッドコールしたクラスでロギングしておく．

<br>

### ソフトウェア開発者にとって

エラーが画面上に返却されたとしても，これはソフトウェア開発者にとってわかりにくい．そのため，エラーをメソッドコールしたクラスで検出し，ソフトウェア開発者にわかる言葉に変換した例外としてスローする必要がある．なお，下層クラスのエラー自体は握りつぶさずに，スタックトレースとしてメソッドコールしたクラスでロギングしておく．

<br>

### ユーザーにとって

エラーが画面上に返却されたとしても，ユーザーにとっては何が起きているのかわからない．また，エラーをメソッドコールしたクラスで検出し，例外としてスローしたとしても，ソフトウェア開発者にとっては理解できるが，ユーザーにとっては理解できない．そのため，例外スローを別の識別子（例えば真偽値）に変えてメソッドコールしたクラスに持ち上げ，最終的には，これをポップアップなどでわかりやすく通知する必要がある．これらは，サーバーサイドのtry-catch-finally文や，フロントエンドのポップアップ処理で実現する．なお，下流クラスのエラー自体は握りつぶさずに，スタックトレースとしてメソッドコールしたクラスでロギングしておく．

<br>

### 01-03. 例外の定義

### 標準例外クラス

いずれもThrowableインターフェースを実装している．以下リンクを参考にせよ．

参考：https://www.php.net/manual/ja/reserved.exceptions.php

<br>

### 独自例外クラス

#### ・定義

エラーの種類に合わせて，```Exception```クラスを継承した独自例外クラスを実装し，使い分けると良い．```__construct```メソッドに，メッセージやエラーコード（例外コード）などを渡せる．エラーコードのデフォルト値はゼロである．

参考：https://www.php.net/manual/ja/exception.construct.php

エラーコードはステータスコードと異なり，例外を識別するためのものである．異常系レスポンスのエラーコードデータとして用いられる．混乱を避けるため，例外クラスのエラーコード値にステータスコードを割り当てないようにする．ステータスコードはコントローラーにおけるレスポンス処理で割り当てる．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html

**＊実装例＊**

『Foo変数が見つからない』というエラーに対応する例外クラスを定義する．

```php
<?php

class FooNotFoundException extends Exception
{
    // 基本的に何も実装しない．
    
    // エラーコードとステータスコードは異なるもののため，以下のようにしないこと．
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
    
    return "これは ${foo} です．";
}
```

#### ・命名規則

何のエラーが発生したかを判断できるように，名前は『```<エラー名>Exception ```』とする．また，開発者にとって詳しく理解できるように，コンストラクタの引数にメッセージを渡す．

（例）InvalidArgumentException，

参考：https://bartlomiej-kielbasa.medium.com/how-to-name-exceptions-its-not-so-obvious-df104014166a

<br>

## 02. エラー検出と例外スロー

### エラー検出と例外スローの種類

#### ・フレームワークの標準機能

多くのフレームワークでは，ランタイムエラーや非ランタイムエラーが発生すると，それを検知して，例外をスローしてくれる．

#### ・独自定義

if-throw文を用いて，エラー検出と例外スローを実行する．ランタイムエラーは検出できないことに注意する．特定の処理の中に，想定できる例外があり，それを例外クラスとしてするために用いる．ここでは，全ての例外クラスの親クラスである```Exception```クラスのインスタンスを投げている．

**＊実装例＊**

```php
<?php

function value(int $value) {
    
    if (empty($value)) {
        // 例外クラスを返却
        throw new Exception("Value is empty");
    }
    
    return "これは ${value} です．";
}
```

ただし，if-throwでは，都度例外を検証するがあり，様々な可能性を考慮しなければいけなくなる．

```php
<?php
    
function value() {
    
    if (...) {
        throw new ExternalApiException();
    }
    
    if (...) {
        throw new FooInvalidArgumentException();
    }
        
    return "成功です．"
}
```

<br>

### アーキテクチャにおける層別の例外スロー

層別の例外については，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_architecture_backend_domain_driven_design.html

<br>

## 03. 例外キャッチ

### 例外キャッチの方法

#### ・try-catch-finally文とは

try-catch-finally文では，特定の処理の中で起こる想定できない例外を捉えられる．定義されたエラー文は，デバック画面に表示される．

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

            // ExternalApiErrorException，HttpRequestErrorException，Exceptionが起こる

        } catch (ExternalApiErrorException $exception) {

            // ExternalApiErrorExceptionが起こったときの処理

        } catch (HttpRequestErrorException $exception) {

            // HttpRequestErrorExceptionが起こったときの処理

        } catch (Exception $exception) {

            // その他（自社ソフトウェアなど）のExceptionが起こっときの処理

        } finally {

            // 例外を補足したかどうかに関わらず実行する．
            // try句やcatch句の返却処理や終了処理が行われる直前に実行される．

        }
    }
}

```

finally句は，try句やcatch句の返却処理が行われる直前に実行されるため，finally句では，```return```や```continue```を用いないようにする．

```php
<?php

use Exception\ExternalApiErrorException;
use Exception\HttpRequestErrorException;

class Foo
{
    public function sendMessage(Message $message)
    {
        try {

            // （１）
            echo "Aの直前です";
            return "Aです．";
            
        } catch (ExternalApiErrorException $exception) {

            // （２）
            echo "Bの直前です";
            return "Bです．";
            
        } catch (HttpRequestErrorException $exception) {

            // （３）
            echo "Cの直前です";
            return "Cです．";
            
        } catch (Exception $exception) {

            // （４）
            echo "Dの直前です";
            return "Dです．";
            
        } finally {

            // returnやcontinueを用いない
            echo "Eです．";

        }
    }
}
```


（１）～（４）のいずれかで返却される時，返却の直前にfinally句が実行されることがわかる．

```php
// （１）の場合
// Aの直前です．
// Eです．
// Aです．

// （２）の場合
// Bの直前です．
// Eです．
// Bです．

// （３）の場合
// Cの直前です．
// Eです．
// Cです．

// （４）の場合
// Dの直前です．
// Eです．
// Dです．
```

<br>

### 新たな例外のスローし直し

例外をtry-catch文でキャッチした後，別の新しい例外をスローしても良い．その場合は，例外のコンストラクタの第三引数（```previous```）を用いて，キャッチされていた元の例外も検知できるようにする．ちなみに，この例外をロギングする場合，スタックトレースログとして出力される．

参考：

- http://blog.tojiru.net/article/455279557.html
- https://www.php.net/manual/ja/exception.construct.php

<br>

### 例外キャッチのレイヤー

#### ・コントローラー/ミドルウェア派

想定外のエラーも含めて，全てのエラーを検出できるように，コントローラーまたはミドルウェアにtry-catch文を実装する．

参考：

- https://www.reddit.com/r/dotnet/comments/kyoe83/web_api_trycatch_in_controller_or_not/
- https://softwareengineering.stackexchange.com/questions/393307/where-would-you-handle-exceptions-controller-service-repository

#### ・ユースケース派

コントローラーの実装をより単純にするべく，より下位のユースケースにtry-catch文を実装する．

参考：https://www.reddit.com/r/dotnet/comments/kyoe83/web_api_trycatch_in_controller_or_not/

<br>

## 04. ロギング

### ロギング関数

#### ・```error_log```関数

参考：https://www.php.net/manual/ja/function.error-log.php

```php
error_log(
    "<エラーメッセージ>",
    "<メッセージの出力先（3の場合にファイル出力）>",
    "<ログファイルの場所>"
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

            // 下流クラスによる例外スローを含む処理

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

他に，Loggerインターフェースを用いることも多い．

参考：https://github.com/php-fig/log

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

            // 下流クラスによる例外スローを含む処理

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

try-catch文に伴うロギングの場合，catch句の中でこれを実行する．そのため，ロギングを実行するレイヤーはtray-catch文のレイヤーと同じになる．

<br>

### 種類別の振り分け

#### ・例外ごとのロギング

例えば，メッセージアプリのAPIに対してメッセージ生成のリクエストを送信する時，例外の種類に合わせて，外部APIとの接続失敗によるエラーログを生成と，自社ソフトウェアなどその他原因によるエラーログを生成を行う必要がある．

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

            // 外部APIのURL，送信方法，トークンなどのパラメーターが存在するかを検証．
            // 外部APIのためのリクエストメッセージを生成．
            // 外部APIのURL，送信方法，トークンなどのパラメーターを設定．

        } catch (\HttpRequestErrorException $exception) {
            
            // 下流クラスによる例外スローを含む処理

            // 外部APIとの接続失敗によるエラーをロギング
            $this->logger->error(sprintf(
                "ERROR: %s at %s line %s",
                $exception->getMessage(),
                $exception->getFile(),
                $exception->getLine()
            ));

        } catch (\ExternalApiErrorException $exception) {
            
            // 下流クラスによる例外スローを含む処理

            // 外部APIのソフトウェアエラーをロギング
            $this->logger->error(sprintf(
                "ERROR: %s at %s line %s",
                $exception->getMessage(),
                $exception->getFile(),
                $exception->getLine()
            ));

        } catch (\Exception $exception) {
            
            // 下流クラスによる例外スローを含む処理

            // その他（自社ソフトウェアなど）によるエラーをロギング
            $this->logger->error(sprintf(
                "ERROR: %s at %s line %s",
                $exception->getMessage(),
                $exception->getFile(),
                $exception->getLine()
            ));
        }

        // 問題なければTRUEを返却．
        return true;
    }
}
```

