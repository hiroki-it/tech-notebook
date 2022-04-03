---
title: 【知見を記録するサイト】PHP＠コードベースのテスト
description: PHP＠コードベースのテストの知見をまとめました．
---

# PHP＠コードベースのテスト

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ユニットテスト/機能テストの要素

### 構成図

各テストケース（テスト関数）はテストスイート（テストの組）から構成され，全てはテストプランでまとめられる．

![test-plan_test-suite_test-case](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/test-plan_test-suite_test-case.jpg)

<br>

## 02-02. PHPUnitによるユニットテスト/機能テスト

### コマンド

#### ▼ オプション無し

全てのテストファイルを対象として，定義されたメソッドを実行する．

```bash
$ vendor/bin/phpunit
PHPUnit 9.5.0 by Sebastian Bergmann and contributors.

...                                                   3 / 3 (100%)
 
Time: 621 ms, Memory: 24.00 MB
 
OK (3 tests, 3 assertions)
```

#### ▼ --filter

特定のテストファイルを対象として，定義されたメソッドを実行する．

```bash
$ vendor/bin/phpunit --filter Foo
PHPUnit 9.5.0 by Sebastian Bergmann and contributors.

...                                                   1 / 1 (100%)
 
Time: 207 ms, Memory: 8.00 MB
 
OK (1 tests, 1 assertions)
```

#### ▼ --list-tests

テストファイルの一覧を表示する．

```bash
$ vendor/bin/phpunit --list-tests
PHPUnit 9.5.0 by Sebastian Bergmann and contributors.
 
Available test(s):
 - Tests\Unit\FooTest::testFooMethod
 - Tests\Feature\FooTest::testFooMethod
```

<br>

### phpunit.xmlファイル

#### ▼ ```phpunit.xml```ファイルとは

PHPUnitの設定を行う．デフォルトの設定では，あらかじめルートディレクトリに```tests```ディレクトリを配置し，これを```Units```ディレクトリまたは```Feature```ディレクトリに分割しておく．また，```Test```で終わるphpファイルを作成しておく必要がある．

参考：http://phpunit.readthedocs.io/ja/latest/configuration.html

#### ▼ ```testsuites```タグ

テストスイートを定義できる．```testsuites```タグ内の```testsuites```タグを追加変更すると，検証対象のディレクトリを増やし，また対象のディレクトリ名を変更できる．

参考：https://phpunit.readthedocs.io/ja/latest/configuration.html#appendixes-configuration-testsuites

```xml
<phpunit>
    
...
    
    <testsuites>
        <testsuite name="Unit">
            <directory suffix="Test.php">./tests/Unit</directory>
        </testsuite>
        
        <testsuite name="Feature">
            <directory suffix="Test.php">./tests/Feature</directory>
        </testsuite>
    </testsuites>
    
...
    
</phpunit>
```

#### ▼ ```php```タグ

PHPUnitの実行前に設定する```ini_set```関数，```define```関数，グローバル変数，を定義できる．タグ名との対応関係については，以下のリンクを参考にせよ．

参考：https://phpunit.readthedocs.io/ja/latest/configuration.html#php-ini

**＊実装例＊**

Composerの実行時にメモリ不足にならないようにメモリを拡張する．また，テスト用のDBに接続できるよう，DBに関する環境変数を設定する．

```xml
<phpunit>
    
...
    
    <php>
        <!-- <グローバル変数名 name="キー名" value="値"/> -->
        
        <!-- Composerの実行時にメモリ不足にならないようにする -->
        <ini name="memory_limit" value="512M"/>
        
        <!-- DBの接続情報 -->
        <server name="DB_CONNECTION" value="mysql"/>
        <server name="DB_DATABASE" value="test"/>
        <server name="DB_USERNAME" value="test"/>
        <server name="DB_PASSWORD" value="test"/>
    </php>
    
...
    
</phpunit>
```

<br>

### アサーションメソッド

#### ▼ アサーションメソッドとは

実際の値と期待値を比較し，結果に応じて```SUCCESS```または```FAILURES```を返却する．非staticまたはstaticとしてコールできる．

参考：https://phpunit.readthedocs.io/ja/latest/assertions.html

```php
$this->assertTrue();
```

```php
self::assertTrue()
```

#### ▼ assertTrue

実際値が```true```かどうかを検証する．

```php
$this->assertTrue($response->isOk());
```

#### ▼ assertEquals

『```==```』を用いて，期待値と実際値の整合性を検証する．データ型を検証できないため，```assertSame```メソッドを用いる方が良い．

```php
$this->assertSame(200, $response->getStatusCode());
```

#### ▼ assertSame

『```===```』を用いて，期待値と実際値の整合性を検証する．値だけでなく，データ型も検証できる．


```php
$this->assertSame(200, $response->getStatusCode());
```

<br>

### ユニットテスト

#### ▼ ユニットテストとは

クラスのメソッドが，それ単体で仕様通りに処理が動作するかを検証する方法．検証対象以外の処理はスタブとして定義する．理想としては，アーキテクチャの層ごとにユニットテストを行う必要がある．この時，データアクセスに関わる層のユニットテストのために，本来のDBとは別に，あらかじめテスト用DBを用意した方が良い．テスト用DBを```docker-compose.yml```ファイルによって用意する方法については，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/virtualization/virtualization_container_orchestration.html

**＊実装例＊**

以降のテスト例では，次のような通知クラスとメッセージクラスが前提にあるとする．

```php
<?php

use CouldNotSendMessageException;
    
class FooNotification
{
    private $httpClient;
        
    private $token;
    
    private $logger;
        
    public function __construct(Clinet $httpClient, string $token, LoggerInterface $logger)
    {
        $this->httpClient = $httpClient;        
        $this->token = $token;
        $this->logger = $logger;
    }
    
    public function sendMessage(FooMessage $fooMessage)
    {
        if (empty($this->token)) {
            throw new CouldNotSendMessageException("API requests is required.");
        }
        
        if (empty($fooMessage->channel_id)) {
            throw new CouldNotSendMessageException("Channel ID is required.");
        }
        
        $json = json_encode($fooMessage->message);
        
        try {
            $this->httpClient->request(
                "POST",
                "https://example.com",
                [
                    "headers" => [
                        "Authorization" => $this->token,
                        "Content-Length" => strlen($json),
                        "Content-Type" => "application/json",
                    ],
                    "form_params" => [
                        "body" =>  $fooMessage->message
                    ]
                ]
            );

        } catch (ClientException $exception) {

            $this->logger->error(sprintf(
                "ERROR: %s at %s line %s",
                $exception->getMessage(),
                $exception->getFile(),
                $exception->getLine()
            ));

            throw new CouldNotSendMessageException($exception->getMessage());
        } catch (\Exception $exception) {

            $this->logger->error(sprintf(
                "ERROR: %s at %s line %s",
                $exception->getMessage(),
                $exception->getFile(),
                $exception->getLine()
            ));

            throw new CouldNotSendMessageException($exception->getMessage());
        }
        
        return true;
    }
}
```

```php
<?php
 
class FooMessage
{
    private $channel_id;
    
    private $message;

    public function __construct(string $channel_id, string $message)
    {
        $this->channel_id = $channel_id;        
        $this->message = $message;
    }
}
```

#### ▼ 正常系テスト例

メソッドのアノテーションで，```@test```を宣言する．

**＊実装例＊**

リクエストにて，チャンネルとメッセージを送信した時に，レスポンスとして```TRUE```が返信されるかを検証する．

```php
<?php

use FooMessage;
use FooNotifiation;
use PHPUnit\Framework\TestCase;

class FooNotificationTest extends TestCase
{
    private $logger;

    private $client;

    public function setUp()
    {
        // 検証対象外のクラスはモックとする．
        $this->client = \Phake::mock(Client::class);
        $this->logger = \Phake::mock(LoggerInterface::class);
    }
    
   /**
    * @test
    */
    public function testSendMessage_FooMessage_ReturnTrue()
    {
        $fooNotification = new FooNotification(
            $this->client,
            "xxxxxxx",
            $this->logger
        );
        
        $fooMessage = new FooMessage("test", "X-CHANNEL");
        
        $this->assertTrue(
            $fooNotification->sendMessage($fooMessage)
        );
    }
}
```

```bash
# Time: x seconds
# OK
```

#### ▼ 異常系テスト例

メソッドのアノテーションで，```@test```と```@expectedException```を宣言する．

**＊実装例＊**

リクエストにて，メッセージのみを送信しようとした時に，例外を発生させられるかを検証する．

```php
<?php

use FooMessage;
use FooNotifiation;
use PHPUnit\Framework\TestCase;

class FooNotificationTest extends TestCase
{
    private $logger;

    private $client;

    public function setUp()
    {
        // 検証対象外のクラスはモックとする．
        $this->client = \Phake::mock(Client::class);
        $this->logger = \Phake::mock(LoggerInterface::class);
    }

   /**
    * @test
    * @expectedException
    */
    public function testSendMessage_EmptyMessage_ExceptionThrown()
    {
        $fooNotification = new FooNotification(
            $this->client,
            "xxxxxxx",
            $this->logger
        );
        
        $fooMessage = new FooMessage("test", "");

        $fooNotification->sendMessage($fooMessage);
    }
}
```

```bash
# Time: x seconds
# OK
```

<br>

### 機能テスト

#### ▼ 機能テストとは

エンドポイントにリクエストを送信し，レスポンスが正しく返信されるかどうかを検証する方法．スタブを用いることは少ない．メソッドのアノテーションで，```@test```を宣言する必要がある．

**＊実装例＊**

```php
<?php

use PHPUnit\Framework\TestCase;
use GuzzleHttp\Client;

class FooControllerTest extends TestCase
{
    /**
     * @test
     */
    public function testFoo()
    {
        // アプリケーション自身のControllerクラスにリクエストを送信する処理．
        $client = new Client();
        $response = $client->request(
            "GET",
            "https://example.com",
            [
                "query" => [
                    "id" => 1
                ]
            ]
        );
        
        // レスポンスの実際値と期待値の整合性を検証する．
    }
}
```

#### ▼ テストケース例

| HTTPメソッド | 分類   | データの条件                                                 | ```assert```メソッドの検証内容例                             |
| ------------ | ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| POST，PUT    | 正常系 | リクエストのボディにて，必須パラメーターにデータが割り当てられている場合． | ・Controllerが```200```ステータスのレスポンスを返信すること．<br>・更新されたデータのIDが期待通りであること．<br>・レスポンスされたデータが期待通りであること． |
|              |        | リクエストのボディにて，任意パラメーターにデータが割り当てられていない場合． | ・Controllerが```200```ステータスのレスポンスを返信すること．<br>・更新されたデータのIDが期待通りであること．<br>・レスポンスされたデータが期待通りであること． |
|              |        | リクエストのボディにて，空文字やnullが許可されたパラメーターに，データが割り当てられていない場合． | ・Controllerが```200```ステータスのレスポンスを返信すること．<br>・更新されたデータのIDが期待通りであること．<br>・レスポンスされたデータが期待通りであること． |
|              | 異常系 | リクエストのボディにて，必須パラメーターにデータが割り当てられていない場合． | ・Controllerが```400```ステータスのレスポンスを返信すること．<br>・レスポンスされたデータが期待通りであること． |
|              |        | リクエストのボディにて，空文字やnullが許可されたパラメーターに，空文字やnullが割り当てられている場合． | ・Controllerが```400```ステータスのレスポンスを返信すること．<br>・レスポンスされたデータが期待通りであること． |
|              |        | リクエストのボディにて，パラメーターのデータ型が誤っている場合． | ・Controllerが```400```ステータスのレスポンスを返信すること．<br>・レスポンスされたデータが期待通りであること． |
| GET          | 正常系 | リクエストにて，パラメーターにデータが割り当てられている場合． | Controllerが```200```ステータスのレスポンスを返信すること．        |
|              | 異常系 | リクエストのボディにて，パラメーターに参照禁止のデータが割り当てられている場合（認可の失敗）． | Controllerが```403```ステータスのレスポンスを返信すること．        |
| DELETE       | 正常系 | リクエストのボディにて，パラメーターにデータが割り当てられている場合． | ・Controllerが```200```ステータスのレスポンスを返信すること．<br>・削除されたデータのIDが期待通りであること．<br>・レスポンスされたデータが期待通りであること． |
|              | 異常系 | リクエストのボディにて，パラメーターに削除禁止のデータが割り当てられている場合（認可の失敗）． | ・Controllerが```400```ステータスのレスポンスを返信すること．<br>・レスポンスされたデータが期待通りであること． |
| 認証/認可     | 正常系 | リクエストのヘッダーにて，認証されているトークンが割り当てられている場合（認証の成功）． | Controllerが```200```ステータスのレスポンスを返信すること．        |
|              | 異常系 | リクエストのヘッダーにて，認証されていないトークンが割り当てられている場合（認証の失敗）． | Controllerが```401```ステータスのレスポンスを返信すること．        |
|              |        | リクエストのボディにて，パラメーターにアクセス禁止のデータが割り当てられている場合（認可の失敗）． | Controllerが```403```ステータスのレスポンスを返信すること．        |

#### ▼ 正常系GET

Controllerが```200```ステータスのレスポンスを返信することを検証する．

**＊実装例＊**

```php
<?php
    
use GuzzleHttp\Client;    
use PHPUnit\Framework\TestCase;

class FooControllerTest extends TestCase
{
   /**
    * @test
    */    
    public function testGetPage_GetRequest_Return200()
    {
        // 外部サービスがクライアントの場合はモックを用いる．
        $client = new Client();

        // GETリクエスト
        $client->request(
            "GET",
            "/xxx/yyy/"
        );
        
        $response = $client->getResponse();

        // 200ステータスが返却されるかを検証する．
        $this->assertSame(200, $response->getStatusCode());
    }
}
```

#### ▼ 正常系POST

Controllerが```200```ステータスのレスポンスを返信すること，更新されたデータのIDが期待通りであること，レスポンスされたデータが期待通りであることを検証する．

**＊実装例＊**

```php
<?php

use GuzzleHttp\Client;
use PHPUnit\Framework\TestCase;

class FooControllerTest extends TestCase
{
    /**
     * @test
     */
    public function testPostMessage_GetRequest_Return200NormalMessage()
    {      
        $client = new Client();

        // APIにPOSTリクエスト
        $client->request(
            "POST",
            "/xxx/yyy/",
            [
                "id"      => 1,
                "message" => "Hello World!"
            ],
            [
                "HTTP_X_API_Token" => "Bearer *****"
            ]
        );

        $response = $client->getResponse();

        // 200ステータスが返却されるかを検証する．
        $this->assertSame(200, $response->getStatusCode());

        // レスポンスデータを抽出する．
        $actual = json_decode($response->getContent(), true);

        // 更新されたデータのIDが正しいかを検証する．
        $this->assertSame(1, $actual["id"]);

        // レスポンスされたメッセージが正しいかを検証する．
        $this->assertSame(
            [
                "データを変更しました．"
            ],
            $actual["message"]
        );
    }
}
```

#### ▼ 異常系POST

Controllerが```400```ステータスのレスポンスを返信すること，レスポンスされたデータが期待通りであること，を検証する．

**＊実装例＊**

```php
<?php

use GuzzleHttp\Client;
use PHPUnit\Framework\TestCase;

class FooControllerTest extends TestCase
{
    /**
     * @test
     */
    public function testPostMessage_EmptyMessage_Return400ErrorMessage()
    {     
        $client = new Client();

        // APIにPOSTリクエスト
        $client->request(
            "POST",
            "/xxx/yyy/",
            [
                "id"      => 1,
                "message" => ""
            ],
            [
                "HTTP_X_API_Token" => "Bearer *****"
            ]
        );

        $response = $client->getResponse();

        // 400ステータスが返却されるかを検証する．
        $this->assertSame(400, $response->getStatusCode());

        // レスポンスデータのエラーを抽出する．
        $actual = json_decode($response->getContent(), true);

        // レスポンスされたエラーメッセージが正しいかを検証する．
        $this->assertSame(
            [
                "IDは必ず入力してください．",
                "メッセージは必ず入力してください．"
            ],
            $actual["errors"]
        );
    }
}
```

<br>

### テストデータ

#### ▼ Data Provider

テスト対象のメソッドの引数を事前に用意する．メソッドのアノテーションで，```@test```と```@dataProvider データプロバイダ名```を宣言する．データプロバイダの返却値として配列を設定し，配列の値の順番で，引数に値を渡すことができる．

参考：https://phpunit.readthedocs.io/ja/latest/writing-tests-for-phpunit.html#writing-tests-for-phpunit-data-providers

**＊実装例＊**

```php
<?php

use PHPUnit\Framework\TestCase;

class FooTest extends TestCase
{
    /** 
     * findメソッドをテストします．
     *
     * @test
     * @dataProvider methodDataProvider
     */
    public function testFind_Bar_Baz($paramA, $paramB, $paramC)
    {
        // 何らかの処理 
    }
    
    /** 
     * findメソッドを引数を用意します．
     *
     * @return array
     */    
    public function methodDataProvider(): array
    {
        return [
            // 配列データは複数あっても良い，
            ["1", "2", "3"]
        ];
    }
}
```

<br>

### 前処理と後処理

#### ▼ ```setUp```メソッド

前処理として，全てのテスト関数の前にコールされるメソッドである．

**＊実装例＊**

DIコンテナを事前に生成する．

```php
<?php

use PHPUnit\Framework\TestCase;

class FooTest extends TestCase
{
    protected $container;
    
    // 全てのテスト関数の前に実行される．
    protected function setUp()
    {
        // DIコンテナにデータを格納する．
        $this->container["option"];
    }
}
```

**＊実装例＊**

単体テストで検証するクラスが実際の処理の中でインスタンス化される時，依存先のクラスはすでにインスタンス化されているはずである．そのため，これと同じように依存先のクラスのモックを事前に生成しておく．

```php
<?php
    
use PHPUnit\Framework\TestCase;

class FooTest extends TestCase
{
    protected $foo;
    
    protected function setUp()
    {
        // 基本的には，一番最初に記述する．
        parent::setUp();
        
        // 事前にモックを生成しておく．
        $this->bar = Phake::mock(Bar::class);
    }
    
    public function testFoo_Xxx_Xxx()
    {
        // 実際の処理では，インスタンス化時に，FooクラスはBarクラスに依存している．
        $foo = new Foo($this->bar)
            
        // 何らかのテストコード
    }
}
```

#### ▼ ```tearDown```メソッド

後処理として，全てのテスト関数の後にコールされるメソッドである．グローバル変数やサービスコンテナにデータを格納する場合，後の検証でもそのデータが誤って使用されてしまわないように，サービスコンテナを破棄するために用いられる．

**＊実装例＊**

```php
<?php

use PHPUnit\Framework\TestCase;

class FooTest extends TestCase
{
    protected $container;
    
    protected function setUp()
    {
        $this->container["option"];
    }
    
    // 全てのテスト関数の後に実行される．
    protected function tearDown()
    {
        // DIコンテナにnullを格納する．
        $this->container = null;
    }
}
```

<br>

### 命名規則

#### ▼ テストケース名

Roy Osherove氏の命名規則に従って，『テスト対象のメソッド名』『入力値』『期待される返却値』の三要素でテスト関数を命名する．期待される返却値の命名で『正常系テスト』か『異常系テスト』かと識別する．例えば，正常系であれば『```testFoo_Xxx_ReturnXxx```』，また異常系であれば『```testFoo_Xxx_ExceptionThrown```』や『```testFoo_Xxx_ErrorThrown```』とする．Roy Osherove氏の命名規則については，以下のリンクを参考にせよ．

参考：https://osherove.com/blog/2005/4/3/naming-standards-for-unit-tests.html

#### ▼ アサーションの比較値

アサーションで値を比較する場合，値を定数として管理した方が良い．

参考：https://osherove.com/blog/2005/4/3/naming-standards-for-unit-tests.html

<br>

## 02-03. Test Double（テストダブル）

### テストダブルの種類

#### ▼ モックツール，スタブツール

PHPUnit，Phake，Mockery，JUnit

#### ▼ モック

上層クラスが下層クラスを正しくコールできるかどうかを検証したい時に，上層クラス以外の部分の処理は不要であり，下層クラスの実体があるかのように見せかける．この時，見せかけの下層クラスとして用いる擬似オブジェクトを『モック』という．スタブとは，用いられるテストが異なるが，どちらも擬似オブジェクトである．スタブについては後述の説明を参考にせよ．モックでは，クラスのメソッドとデータが全てダミー実装に置き換わる．もし下層クラスを正しい回数実行できているかを検証したい場合は，下層クラスのモックを定義し，実体のある上層クラスが下層クラスにパラメーターを渡した時のコール回数と指定回数を比較する．なお，用語の定義はテストフレームワークごとにやや異なることに注意する．PHPUnitにおけるモックについては，以下のリンクを参考にせよ．

参考：https://phpunit.readthedocs.io/ja/latest/test-doubles.html#test-doubles-mock-objects

| ツール名 | モックのメソッドの返却値                                     | 補足                                                         |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| PHPUnit  | メソッドは，```null```を返却する．                           | 注意点として，```final```，```private```なメソッドはモック化されず，実体をそのまま引き継ぐ．また，```static```なメソッドは```BadMethodCallException```をスローするモックに置き換わる． |
| JUnit    | メソッドは，元のオブジェクトのメソッドの返却値の型を基に，初期値を返却する<br>（例：bool型なら```false```） |                                                              |

#### ▼ スタブ

クラスのメソッドの処理を検証したい時に，検証対象外のクラスに依存している部分は，実体があるかのように見せかける．この時，見せかけの下層クラスとして用いる擬似オブジェクトを『スタブ』という．モックとは，用いられるテストが異なるが，どちらも擬似オブジェクトである．モックと同様にスタブでも，クラスのメソッドとデータが全てダミー実装に置き換わる．スタブには，正しい処理を実行するように引数と返却値を持つメソッドを定義し，その他の実体のある処理が正しく実行されるかを検証する．これらにより，検証対象の処理のみが実体であっても，一連の処理を実行できる．なお，用語の定義はテストフレームワークごとにやや異なることに注意する．PHPUnitにおけるスタブについては，以下のリンクを参考にせよ．

参考：https://phpunit.readthedocs.io/ja/latest/test-doubles.html#test-doubles-stubs

<br>

### PHPUnit

#### ▼ ```createMock```メソッド

クラスの名前空間を元に，モックまたはスタブとして用いる擬似オブジェクトを生成する．以降の処理での用途によって，呼び名が異なることに注意する．ちなみに，PHPUnitの場合，モックのメソッドは```null```を返却する．

```php
<?php
    
use PHPUnit\Framework\TestCase;

class FooTest extends TestCase
{   
   /**
    * @test
    */    
    public function testFoo()
    {    
        // モックとして用いる擬似オブジェクトを作成する．
        $mock = $this->createMock(Foo::class);
        
        // null
        $foo = $mock->find(1)
    }
}
```

```php
<?php

class Foo
{
    /**
    * @param  int
    * @return array
    */   
    public function find(int $id)
    {
        // 参照する処理
    }
}
```

#### ▼ ```method```メソッド

 モックまたはスタブのメソッドに対して，処理の内容を定義する．特定の変数が渡された時に，特定の値を返却させられる．

```php
<?php

use PHPUnit\Framework\TestCase;

class FooTest extends TestCase
{   
   /**
    * @test
    */    
    public function testFoo_Xxx_Xxx()
    {    
        // スタブとして用いる擬似オブジェクトを作成する．
        $stub = $this->createMock(Foo::class);
        
        // スタブのメソッドに処理内容を定義する．
        $stub->method("find")
            ->with(1)
            ->willReturn([]);
        
        // []（空配列）
        $result = $stub->find(1)
    }
}
```

<br>

### Phake

#### ▼ Phakeとは

モックとスタブを提供するパッケージ．

参考：https://github.com/mlively/Phake#phake

#### ▼ ```mock```メソッド

クラスの名前空間を元に，モックまたはスタブとして用いる擬似オブジェクトを生成する．以降の処理での用途によって，呼び名が異なることに注意する．

```php
<?php

// モックとして用いる擬似オブジェクトを作成する．
$mock = Phake::mock(Foo::class);

// スタブとして用いる擬似オブジェクトを作成する．
$stub = Phake::mock(Foo::class);
```

#### ▼ ```when```メソッド

モックまたはスタブのメソッドに対して，処理の内容を定義する．また，特定の変数が渡された時に，特定の値を返却させられる．

**＊実装例＊**

モックの```find```メソッドは，```1```が渡された時に，空配列を返却する．

```php
<?php
    
// スタブとして用いる擬似オブジェクトを作成する．    
$stub = Phake::mock(Foo::class);

// スタブのメソッドに処理内容を定義する．
\Phake::when($stub)
    ->find(1)
    ->thenReturn([]);
```

#### ▼ ```verify```メソッド

上層オブジェクトが下層オブジェクトをコールできることを確認するために，モックのメソッドが```n```回実行できたことを検証する．

**＊実装例＊**

```php
<?php

use PHPUnit\Framework\TestCase;

class FooTest extends TestCase
{   
   /**
    * @test
    */    
    public function testFoo_Bar_Baz()
    {    
        // モックとして用いる擬似オブジェクトを作成する．
        $mockFooRepository = Phake::mock(FooRepository::class);
        $fooId = Phake::mock(FooId::class);

        // モックのメソッドに処理内容を定義する．
        \Phake::when($mockFooRepository)
            ->find($fooId)
            ->thenReturn(new User(1)); 
        
        // 上層クラスに対して，下層クラスのモックのインジェクションを行う
        $foo = new Foo($mockFooRepository);
        
        // 上層クラスの内部にある下層モックのfindメソッドをコールする
        $foo->getUser($fooId)

        // 上層のクラスが，下層モックにパラメーターを渡し，メソッドを実行したことを検証する．
        Phake::verify($mockFooRepository, Phake::times(1))->find($fooId);
    }
}
```

<br>

## 03. ブラックテスト/ホワイトボックステスト

### ブラックボックステスト

#### ▼ ブラックボックステストとは

ホワイトボックステストと組み合わせてユニットテストを構成する．実装内容は気にせず，入力に対して，適切な出力が行われているかを検証する．ユニットテストとホワイト/ブラックボックステストの関係性については，以下の書籍を参考にせよ．

参考：https://www.amazon.co.jp/dp/477415377X/

![p492-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p492-1.jpg)

<br>

### ホワイトボックステスト

#### ▼ ホワイトボックステストとは

![p492-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p492-2.jpg)

ブラックボックステストと組み合わせてユニットテストを構成する．実装内容が適切かを確認しながら，入力に対して，適切な出力が行われているかを検証する．網羅条件がいくつかあり，求められるソフトウェア品質に応じたものを採用する．ユニットテストとホワイト/ブラックボックステストの関係性については，以下の書籍を参考にせよ．

参考：https://www.amazon.co.jp/dp/477415377X/

**＊実装例＊**

```php
if (A = 1 && B = 1) {
　return X;
}
```

#### ▼ C０：Statement Coverage（命令網羅）

![p494-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p494-1.png)

全ての命令が実行されるかを検証する．

**＊例＊**

AとBは，『1』または『0』になり得るとする．

| 条件         | 処理実行の有無                    |
| ------------ | --------------------------------- |
| A = 1，B = 1 | ```return X``` が実行されること． |

#### ▼ C１：Decision Coverage（判定条件網羅/分岐網羅）

![p494-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p494-2.png)

全ての判定が実行されるかを検証する．

**＊例＊**

AとBは，『1』または『0』になり得るとする．

| 条件         | 処理実行の有無                      |
| ------------ | ----------------------------------- |
| A = 1，B = 1 | ```return X``` が実行されること．   |
| A = 1，B = 0 | ```return X``` が実行されないこと． |

#### ▼ C２：Condition Coverage（条件網羅）

![p494-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p494-3.png)

各条件が，取り得る全ての値で実行されるかを検証する．

**＊例＊**

AとBは，『1』または『0』になり得るとする．

| 条件         | 処理実行の有無                      |
| ------------ | ----------------------------------- |
| A = 1，B = 0 | ```return X``` が実行されないこと． |
| A = 0，B = 1 | ```return X``` が実行されないこと． |

または，次の組み合わせでも良い．

| 条件         | 処理実行の有無                      |
| ------------ | ----------------------------------- |
| A = 1，B = 1 | ```return X``` が実行されること．   |
| A = 0，B = 0 | ```return X``` が実行されないこと． |

#### ▼ MCC：Multiple Condition Coverage（複数条件網羅）

![p494-4](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p494-4.png)

各条件が，取り得る全ての値で，かつ全ての組み合わせが実行されるかを検証する．一般的に，複数条件網羅を採用すれば，最低限のソフトウェア品質を担保できていると言える．

**＊例＊**

AとBは，『1』または『0』になり得るとする．

| 条件         | 処理実行の有無                      |
| ------------ | ----------------------------------- |
| A = 1，B = 1 | ```return X``` が実行されること．   |
| A = 1，B = 0 | ```return X``` が実行されないこと． |
| A = 0，B = 1 | ```return X``` が実行されないこと． |
| A = 0，B = 0 | ```return X``` が実行されないこと． |

<br>

### ホワイトボックステストの指標

#### ▼ 網羅率

採用した網羅で考えられる全ての条件のうち，テストで検証できている割合のこと． 網羅率はテストスイートやパッケージを単位として解析され，これは言語別に異なる．Goで命令網羅の網羅率を検出するユニットテストについては，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_go_command.html

PHPUnitで網羅率を解析する方法については，以下のリンクを参考にせよ．

参考：https://phpunit.readthedocs.io/ja/latest/code-coverage-analysis.html

#### ▼ 循環的複雑度

コードの複雑さの程度のこと．おおよそ判定条件網羅の経路数の程度である．

参考：

- https://jp.mathworks.com/discovery/cyclomatic-complexity.html
- https://szk-takanori.hatenablog.com/entry/20111219/p1

| 循環的複雑度 | 複雑さの状態                 | バグ混入率 |
| ------------ | ---------------------------- | ---------- |
| ```10```以下 | 非常に良い                   | ```25```%  |
| ```30```以上 | 構造的なリスクあり           | ```40```%  |
| ```50```以上 | テスト不可能                 | ```70```%  |
| ```75```以上 | 変更によって誤修正が生じる． | ```98```%  |

<br>

## 04. PHPStanによる静的解析

### コマンド

#### ▼ オプション無し

全てのファイルを対象として，静的解析を行う．

```bash
$ vendor/bin/phpstan analyse
```

<br>

### phpstan.neonファイル

#### ▼ ```phpstan.neonファイル```とは

PHPStanの設定を行う．

#### ▼ ```includes```

```yaml
includes:
    - ./vendor/nunomaduro/larastan/extension.neon
```

#### ▼ ```parameters```

静的解析の設定を行う．

**＊実装例＊**

```yaml
parameters:
    # 解析対象のディレクトリ
    paths:
        - src
    # 解析の厳格さ（最大レベルは８）．各レベルの解析項目については以下のリンクを参考にせよ．
    # https://phpstan.org/user-guide/rule-levels
    level: 5
    # 発生を無視するエラーメッセージ
    ignoreErrors:
        - '#Unsafe usage of new static#'
    # 解析対象として除外するディレクトリ
    excludes_analyse:
        - ./src/Foo/*
        
    checkMissingIterableValueType: false
    inferPrivatePropertyTypeFromConstructor: true
```
