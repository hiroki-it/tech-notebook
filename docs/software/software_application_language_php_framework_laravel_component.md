---
title: 【IT技術の知見】コンポーネント＠Laravel
description: 認証/認可＠Laravelの知見を記録しています。
---

# コンポーネント＠Laravel

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Laravelの全体像

### ライフサイクル

![laravel-lifecycle](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/laravel-lifecycle.png)

大まかな処理フローは以下の通りである。

> ℹ️ 参考：https://blog.albert-chen.com/the-integration-of-laravel-with-swoole-part-1/

|    | 用語                                                  | 説明                                                                                                |
|----|-------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| 1  | リクエストを受信する。                                         |                                                                                                     |
| 2  | ```index.php```ファイル                                   | エントリーポイントから処理が始まる。                                                                               |
| 3  | Autoload                                              | ```autoload.php```ファイルにて、パッケージを自動的にロードする。                                                        |
| 4  | Load App                                              | ```bootstrap/app.php```ファイルにて、ServiceContainer（```Illuminate\Foundation\Application.php```）を実行する。 |
| 5  | Http Kernel                                           | Kernelを実行する。                                                                                      |
| 6  | ・Register ServiceProviders<br>・Boot Service Providers | ServiceProviderの```register```メソッドや```boot```メソッドを実行する。これにより、ServiceContainerにクラスがバインドされる。        |
| 7  | Middleware                                            | BeforeMiddlewareを実行する。                                                                            |
| 8  | ・Dispatch by Router<br>・Routes Match                  | ```web.php```ファイル、```app.php```ファイルなどのルーティング定義を元に、Routerが実行する。                                 |
| 9  | FormRequest                                           | バリデーションを実行する。                                                                                     |
| 10 | Controller                                            | Controllerを基点として、DBにまで処理が走る。                                                                   |
| 11 | Resource                                              | DBから取得したコレクション型データを配列型データに変換する。                                                             |
| 12 | Response                                              | Responseを実行する。配列型データをJSONデータに変換する。                                                           |
| 13 | Terminate Middleware                                  | AfterMiddlewareが実行される。                                                                            |
| 14 | View                                                  | ```blade.php```ファイルを基に静的ファイルが作成される。                                                            |
| 15 | レスポンスを返信する。                                         |                                                                                                     |

<br>

### コンポーネントのコード

Laravelの各コンポーネントには、似たような名前のメソッドが多く内蔵されている。そのため、同様の能力を実現するために、各々が異なるメソッドを使用しがちになる。その時、各メソッドがブラックボックスにならないように、処理の違いをコードから確認する必要がある。

> ℹ️ 参考：https://laravel.com/api/8.x/Illuminate.html

<br>

## 02. Application

### App

#### ▼ 設定方法

```bash
APP_NAME=<サービス名>
APP_ENV=<実行環境名>	
APP_KEY=<セッションの作成やパスワードの暗号化に使用する認証キー>
APP_DEBUG=<デバッグモードの有効無効化>
APP_URL=<アプリケーションのURL>
```

#### ▼ ```app.php```ファイルの基本設定

```php
<?php

return [
    // アプリケーション名
    "name"            => env("APP_NAME", "Laravel"),

    // 実行環境名
    "env"             => env("APP_ENV", "production"),

    // エラー時のデバッグ画面の有効化
    "debug"           => (bool)env("APP_DEBUG", false),

    // アプリケーションのURL
    "url"             => env("APP_URL", "http://localhost"),

    // assetヘルパーで付与するURL
    "asset_url"       => env("ASSET_URL", null),

    // タイムゾーン
    "timezone"        => "UTC",

    // 言語設定
    "locale"          => "ja",
    "fallback_locale" => "en",
    "faker_locale"    => "ja_JP",

    // セッションの作成やパスワードの暗号化に使用する認証キー
    "key"             => env("APP_KEY"),

    // 暗号化アルゴリズム
    "cipher"          => "AES-256-CBC",

    // サービスプロバイダー
    "providers"       => [

    ],

    // クラス名のエイリアス
    "aliases"         => [

    ],
];
```

<br>

## 03. Config

<br>

## 04. Console

### Command

artisanコマンドで実行できるコマンド処理を定義する。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/artisan.html#writing-commands

```php
<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Log;

class FooCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'do-foo {bar}'; // コマンドとパラメータ

    /**
     * @var string
     */
    protected $description = 'コマンドの仕様を記入します'; // コマンドの説明文

    /**
     * @return void
     */
    public function handle(): void
    {
        Log::info('START: artisan do-foo');
        
        // パラメーターを取得します。
        $bar = $this->argument('bar');

        // 何らかのコマンド処理

        Log::info('END: artisan do-foo');
    }
}
```

定義したCommandクラスは、以下の様に実行できる。

```bash
$ php artisan command:do-foo
```

<br>

## 05. Database

### DB

#### ▼ 設定方法

環境変数を```.env```ファイルに実装する。```database.php```ファイルから、指定された設定が選択される。

```bash
DB_CONNECTION=<RDB名>
DB_HOST=<ホスト名>
DB_PORT=<ポート番号>
DB_DATABASE=<DB名>
DB_USERNAME=<アプリケーションユーザー名>
DB_PASSWORD=<アプリケーションユーザーのパスワード>
```

#### ▼ RDBとRedisの選択

```php
<?php

return [

    // 使用するDBMSを設定
    "default"     => env("DB_CONNECTION", "mysql"),

    "connections" => [

        // DB接続情報（SQLite）
        "sqlite" => [

        ],

        // DB接続情報（MySQL）
        "mysql"  => [

        ],

        // DB接続情報（pgSQL）
        "pgsql"  => [

        ],

        // DB接続情報（SQLSRV）
        "sqlsrv" => [

        ],
    ],

    // マイグレーションファイルのあるディレクトリ
    "migrations"  => "migrations",

    // Redis接続情報
    "redis"       => [

    ],
];
```

<br>

### エンドポイントに応じた設定

#### ▼ 単一のエンドポイント

単一のエンドポイントしかない場合、```DB_HOST```を1つだけ設定する。

```php
<?php

return [

    ...    

    "default" => env("DB_CONNECTION", "mysql"),

    "connections" => [

        ...

        "mysql" => [
            "driver"         => "mysql",
            "url"            => env("DATABASE_URL"),
            "host"           => env("DB_HOST", "127.0.0.1"),
            "port"           => env("DB_PORT", 3306),
            "database"       => env("DB_DATABASE", "forge"),
            "username"       => env("DB_USERNAME", "forge"),
            "password"       => env("DB_PASSWORD", ""),
            "unix_socket"    => env("DB_SOCKET", ""),
            "charset"        => "utf8mb4",
            "collation"      => "utf8mb4_unicode_ci",
            "prefix"         => "",
            "prefix_indexes" => true,
            "strict"         => true,
            "engine"         => null,
            "options"        => extension_loaded("pdo_mysql") ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => env("MYSQL_ATTR_SSL_CA"),
            ]) : [],
        ],
    ],

    ...        

];
```

#### ▼ 複数のエンドポイント

複数のエンドポイントがある場合、書き込み処理と読み出し処理をそれ専用のエンドポイントに向けるようにする。例えばRDSを採用している場合、プライマリーインスタンスに向け、また読み出し処理をリードレプリカに向けることにより、負荷を分散できる。この場合、環境変数に```2```個のインスタンスのエンドポイントを実装する必要がある。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/database.html#contentContainer:~:text=Read%EF%BC%8FWrite%E6%8E%A5%E7%B6%9A

```
DB_HOST_PRIMARY=<プライマリーインスタンスのエンドポイント>
DB_HOST_READ=<リードレプリカのエンドポイント>
```

注意点として、```sticky```キーを有効化しておくと良い。プライマリーインスタンスにおけるデータ更新がリードレプリカに同期される前に、リードレプリカに対して読み出し処理が起こるような場合、これを防げる。

> ℹ️ 参考：https://imanengineer.net/laravel-how-to-configure-master-slave-db/

```php
<?php

return [

    "default"     => env("DB_CONNECTION", "mysql"),

    "connections" => [

        // 〜 中略 〜

        'mysql' => [

            // 〜 中略 〜

            'driver' => 'mysql',
            'url' => env('DATABASE_URL'),
            'read' => [
                'host' => [
                    # リーダーエンドポイントを設定
                    env('DB_HOST_READER', '127.0.0.1'),
                ],
            ],
            'write' => [
                'host' => [
                    # クラスターエンドポイントを設定
                    env('DB_HOST_PRIMARY', '127.0.0.1'),
                ],
            ],
            'sticky' => true,

            // 〜 中略 〜

        ],

        // 〜 中略 〜
    ],
];
```



<br>

### Redis

#### ▼ クエリキャッシュ管理

環境変数を```.env```ファイルに実装する必要がある。

```bash
CACHE_DRIVER=redis
REDIS_HOST=<Redisのホスト>
REDIS_PASSWORD=<Redisのパスワード>
REDIS_PORT=<Redisのポート>
```

<br>



## 	06. Event/Listener

### Event

#### ▼ Eventとは

ビジネスの出来事がモデリングされたイベントオブジェクトとして動作する。

#### ▼ 構成

イベントに関するデータを保持するのみで、ビジネスロジックを持たない構成となる。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/events.html#defining-events

**＊実装例＊**

```php
<?php

namespace App\Events;

use App\Models\User;

final class UserCreatedEvent
{
    /**
     * @var User
     */
    protected User $user;

    /**
     * @return void
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }
}
```

任意の場所でイベントを発行できる。

```php
<?php
    
event(new UserCreatedEvent($user));
```

#### ▼ EloquentモデルのCRUDイベント

Eloquentモデルでは、DBアクセスに関するメソッドの実行開始や終了の処理タイミングをイベントクラスに紐付けられる。紐付けるために、プロパティで定義するか、あるいは各タイミングで実行されるクロージャーでイベントを発生させる必要がある。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/eloquent.html#events

**＊実装例＊**

プロパティにて、CREATE処理とDELETE処理に独自イベントクラスに紐付ける。

```php
<?php

namespace App\Models;

use App\Events\UserDeleted;
use App\Events\UserSaved;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * @var array
     */
    protected $dispatchesEvents = [
        // 処理タイミングを独自イベントに紐付ける
        'saved' => UserSaved::class,
        'deleted' => UserDeleted::class,
    ];
}
```

**＊実装例＊**

クロージャーにて、CREATE処理に独自イベントクラスに紐付ける。


```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * @return void
     */
    protected static function booted()
    {
        static::created(function ($user) {
            event(new UserCreated($user));
        });
    }
}
```

<br>

### Listener

#### ▼ Listenerとは

イベントが発生した時に、これに紐付いてコールされるオブジェクトのこと。

#### ▼ 構成

Listenerクラスがコールされた時に実行する処理を```handle```関数に定義する。

**＊実装例＊**

ユーザーが作成された時に、メールアドレスにメッセージを送信する。

```php
<?php

namespace App\Listeners;

use App\Events\UserCreatedEvent;
use Illuminate\Support\Facades\Notification;

final class UserCreatedEventListener
{
    /**
     * @param UserCreatedEvent $userEvent
     * @return void
     */
    public function handle(UserCreatedEvent $userEvent)
    {
        // UserクラスがNotifiableトレイトに依存せずに通知を実行できるように、オンデマンド通知を使用します。
        Notification::route('mail', $userEvent->user->userEmailAddress->emailAddress)
            ->notify(new UserCreatedEventNotification($userEvent->user));
    }
}
```

任意の場所でイベントを発行すると、リスナーが自動的にコールされる。

```php
<?php
    
event(new UserCreatedEvent($user));
```

#### ▼ イベントとリスナーの紐付け

EventServiceProviderクラスにて、Eventクラスに紐付ける1つ以上のListenerクラスを設定する。

**＊実装例＊**

```php
<?php

declare(strict_types=1);

namespace App\Providers;

use App\Events\UserCreatedEvent;
use App\Listeners\UserCreatedEventListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * @var array
     */
    protected $listen = [
        UserCreatedEvent::class => [
            UserCreatedEventListener::class,
        ],
    ];

    /**
     * @return void
     */
    public function boot()
    {
        parent::boot();

        //
    }
}
```

#### ▼ 任意のEloquentモデルCRUDイベントの検知

Laravelの多くのコンポーネントに、```boot```メソッドが定義されている。Eloquentモデルでは、インスタンス作成時に```boot```メソッドがコールされ、これによりに```bootTraits```メソッドが実行される。Traitに```boot+<クラス名>```という名前の静的メソッドが定義されていると、```bootTraits```メソッドはこれをコールする。```bootTraits```メソッドの中でEloquentモデルのイベントを発生させることにより、全てのEloquentモデルのイベントを一括で発火させられる。

> ℹ️ 参考：https://github.com/laravel/framework/blob/9362a29ce298428591369be8d101d51876406fc8/src/Illuminate/Database/Eloquent/Model.php#L255-L285

**＊実装例＊**

あらかじめTraitを定義する。```saved```メソッドにEloquentモデルの更新イベントを登録できるようにする。

```php
<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Model;
use App\Events\UpdatedModelEvent;

trait UpdatedModelTrait
{
    /**
     * @return void
     */
    protected static function bootUpdatedModelTrait(): void
    {
        // 任意のEloquentモデルのsaveメソッド実行時
        static::saved(function (Model $updatedModel) {
            // イベントを発生させる。
            event(new UpdatedModelEvent($updatedModel));
        });

        // 任意のEloquentモデルのdeleteメソッド実行時
        static::deleted(function (Model $updatedModel) {
            // イベントを発生させる。
            event(new UpdatedModelEvent($updatedModel));
        });
    }
    
    /**
     * イベントを発火させずにModelを保存します。
     *
     * @return void
     */
    protected static function saveWithoutEvents(): void
    {
        // 無限ループを防ぐために、save実行時にイベントが発火しないようにする。
        return static::withoutEvents(function () use ($options) {
            
            // プロパティの変更を保存。
            return $this->save($options);
        });
    }    
}
```

イベントを定義する。

```php
<?php

namespace App\Events;

class UpdatedModelEvent
{
    /**
     * @var Model
     */
    public $updatedModel;

    /**
     * @param Model
     */
    public function __construct(Model $updatedModel)
    {
        $this->$updatedModel = $updatedModel;
    }
}
```

Model更新イベントが発火してコールされるリスナーを定義する。```create_by```カラムまたは```updated_by```カラムを指定した更新者名に更新できるようにする。注意点として、イベントとリスナーの対応関係は、EventServiceProviderで登録する。

```php
<?php

namespace App\Listeners;

use App\Events\UpdatedModelEvent;
use App\Constants\ExecutorConstant;

class UpdatedModelListener
{
    /**
     * @param UpdatedModelEvent
     * @return void
     */
    public function handle(UpdatedModelEvent $updatedModelEvent): void
    {
        $by = $this->getModelUpdater();

        // create_byプロパティに値が設定されているかを判定。
        if (is_null($updatedModelEvent->updatedModel->created_by)) {     
            $updatedModelEvent->updatedModel->created_by = $by;
        }

        $updatedModelEvent->updatedModel->updated_by = $by;
        
        $updatedModelEvent->updatedModel->saveWithoutEvents();
    }
    
    /**
     * 更新処理の実行者を取得します。
     *
     * @return string
     */
    private function getModelUpdater(): string
    {
        // コンソール経由で実行されたかを判定。
        if (app()->runningInConsole()) {
            return ExecutorConstant::ARTISAN_COMMAND;
        }

        // API認証に成功したかを判定。
        if (auth()->check()) {
            return ExecutorConstant::STAFF . ":" . auth()->id();
        }
        
        return ExecutorConstant::GUEST;
    }    
}
```

実行者名は、定数として管理しておくと良い。

```php
<?php

namespace App\Constants;

/**
 * 実行者定数クラス
 */
class ExecutorConstant
{
    /**
     * Artisanコマンド
     */
    public const ARTISAN_COMMAND = "Artisan Command";

    /**
     * スタッフ
     */
    public const STAFF = "Staff";
    
    /**
     * ゲスト
     */
    public const GUEST = "Guest";    
}
```

<br>

## 07. Exception

### Laravelにおけるエラーハンドリング

エラーハンドリングは```4```個のステップからなる。LaravelではデフォルトでHandlerクラスが全てのステップをカバーしている。また加えて、異常系レスポンスを自動的に返信してくれる。エラーハンドリングのステップのうち、エラー検出については言及しないこととする。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_php_logic_error_and_error_handling.html

<br>

### 例外スロー

#### ▼ 例外

ドキュメントとしてまとめられていないが、デフォルトで様々な例外が備わっている。

> ℹ️ 参考：https://laravel.com/api/8.x/search.html?search=exception

#### ▼ スタックトレース

Laravelはスローされる例外のメッセージをスタックトレースで作成する。また、Laravel内部で例外キャッチと新たな例外の投げ直しが行われるため、```[previous exception]```によって例外が結合される。スタックトレースには機密性の高い情報が含まれるため、クライアントへの異常系レスポンスのエラーメッセージには割り当てずに、ロギングだけしておく。エラーが複数行にまたがるため、CloudWatchやFluentBitなどのログ収集ツールでは、各行を繋げて扱えるように設定が必要である。ちなみに、ログの詳細度は```APP_DEBUG```環境変数で制御できる。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/errors.html#configuration

```bash
[2021-09-00 00:00:00] local.ERROR: *****（エラーメッセージ）
[stacktrace]
#0 /var/www/foo-app/framework/src/Illuminate/Database/Connection.php(652): Illuminate\\Database\\Connection->runQueryCallback('insert into `us...', Array, Object(Closure))
#1 /var/www/foo-app/framework/src/Illuminate/Database/Connection.php(486): Illuminate\\Database\\Connection->run('insert into `us...', Array, Object(Closure))
#2 /var/www/foo-app/framework/src/Illuminate/Database/Connection.php(438): Illuminate\\Database\\Connection->statement('insert into `us...', Array)

...

#60 /var/www/foo-app/framework/src/Illuminate/Foundation/Http/Kernel.php(141): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))
#61 /var/www/foo-app/framework/src/Illuminate/Foundation/Http/Kernel.php(110): Illuminate\\Foundation\\Http\\Kernel->sendRequestThroughRouter(Object(Illuminate\\Http\\Request))
#62 /var/www/foo-app/public/index.php(55): Illuminate\\Foundation\\Http\\Kernel->handle(Object(Illuminate\\Http\\Request))
#63 {main}

[previous exception] [object] *****（エラーメッセージ）
[stacktrace]
#0 /var/www/foo-app/vendor/doctrine/dbal/lib/Doctrine/DBAL/Driver/PDOStatement.php(114): Doctrine\\DBAL\\Driver\\PDO\\Exception::new(Object(PDOException))
#1 /var/www/foo-app/framework/src/Illuminate/Database/Connection.php(485): Doctrine\\DBAL\\Driver\\PDOStatement->execute()
#2 /var/www/foo-app/framework/src/Illuminate/Database/Connection.php(685): Illuminate\\Database\\Connection->Illuminate\\Database\\{closure}('insert into `us...', Array)

...

#63 /var/www/foo-app/framework/src/Illuminate/Foundation/Http/Kernel.php(141): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))
#64 /var/www/foo-app/framework/src/Illuminate/Foundation/Http/Kernel.php(110): Illuminate\\Foundation\\Http\\Kernel->sendRequestThroughRouter(Object(Illuminate\\Http\\Request))
#65 /var/www/foo-app/public/index.php(55): Illuminate\\Foundation\\Http\\Kernel->handle(Object(Illuminate\\Http\\Request))
#66 {main}

[previous exception] [object] *****（エラーメッセージ）
[stacktrace]
#0 /var/www/foo-app/vendor/doctrine/dbal/lib/Doctrine/DBAL/Driver/PDOStatement.php(112): PDOStatement->execute(NULL)
#1 /var/www/foo-app/framework/src/Illuminate/Database/Connection.php(485): Doctrine\\DBAL\\Driver\\PDOStatement->execute()
#2 /var/www/foo-app/framework/src/Illuminate/Database/Connection.php(685): Illuminate\\Database\\Connection->Illuminate\\Database\\{closure}('insert into `us...', Array)

...

#63 /var/www/foo-app/framework/src/Illuminate/Foundation/Http/Kernel.php(141): Illuminate\\Pipeline\\Pipeline->then(Object(Closure))
#64 /var/www/foo-app/framework/src/Illuminate/Foundation/Http/Kernel.php(110): Illuminate\\Foundation\\Http\\Kernel->sendRequestThroughRouter(Object(Illuminate\\Http\\Request))
#65 /var/www/foo-app/public/index.php(55): Illuminate\\Foundation\\Http\\Kernel->handle(Object(Illuminate\\Http\\Request))
#66 {main}
"} 
```

<br>

### ロギング

#### ▼ ```report```メソッド

Laravel内部でキャッチされた例外を基に、ロギングを実行する。

> ℹ️ 参考：https://cpoint-lab.co.jp/article/201905/9841/

```php
<?php

namespace App\Exceptions;

use Throwable;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{
    protected $dontReport = [
        //
    ];

    public function report(Throwable $exception)
    {
        parent::report($exception);
    }
    
    ...

}
```

<br>

### 異常系レスポンスの返信

#### ▼ ```render```メソッド

Laravel内部でキャッチされた例外を基に、異常系レスポンスを自動的に返信する。異常系レスポンスの返信処理もこれに追加できるが、異常系レスポンス間が密結合になるため、できるだけいじらない。代わりとして、各コントローラーに```try-catch```と異常系レスポンスの返信処理を実装する。

> ℹ️ 参考：https://cpoint-lab.co.jp/article/201905/9841/

```php
<?php

namespace App\Exceptions;

use Throwable;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        return parent::render($request, $exception);
    }
    
    ...
}
```

<br>

## 08. Facade

### Facade

#### ▼ Facadeとは

Facadeに登録されたクラス（Facadeクラス）とServiceContainerを繋ぐ静的プロキシとして働く。メソッドをコールできるようになる。

#### ▼ Facadeを使用しない場合

new演算子でインスタンスを作成する。

**＊実装例＊**

```php
<?php
  
namespace App\Domain\DTO; 
    
class Foo
{
    public function method()
    {
        return "foo";
    }
}
```
```php
<?php
    
// 通常
$foo = new Foo();
$foo->method();
```

#### ▼ Facadeの静的プロキシを使用する場合

静的メソッドの記法でコールできる。ただし、自作クラスをFacadeを使用してインスタンス化すると、スパゲッティな『Composition（合成）』の依存関係を生じさせてしまう。例えば、Facadeの中でも、```Route```のような、代替するよりもFacadeを使用したほうが断然便利である部分以外は、使用しないほうが良い。

**＊実装例＊**

Facadeとして使用したいクラスを定義する。

```php
<?php

namespace App\Domain\DTO;

class Foo
{
    public function method()
    {
        return "foo";
    }
}
```

エイリアス名とクラスの名前空間を```config/app.php```ファイルを```aliases```キーに登録すると、そのエイリアス名でインスタンス化とメソッドコールを行えるようになる。

```php
<?php
  
"aliases" => [
    "Foo" => App\Models\Foo::class,
]
```

インスタンス化とメソッドコールを行う。

```php
<?php

use Illuminate\Support\Facades\Foo;
    
// Facade利用
$result = Foo::method();
```

#### ▼ Facadeを使用した方が良い場合

Facadeがトレイトの代わりになる場合、Facadeを使用することにより、責務がドメインモデルに集中せずにすむ。

**＊例＊**

NotifiableトレイトをUserクラスで使用せずに、Notificationファサードによるオンデマンド通知を使用することにより、Userクラスが通知処理の責務を持たずに済む。

#### ▼ 標準登録されたFacadeクラスの種類

以下のクラスは、デフォルトで登録されているFacadeである。

| エイリアス名              | クラス名                                                                                                                               | サービスコンテナ結合キー         |
|:---------------------|:------------------------------------------------------------------------------------------------------------------------------------|:-----------------------|
| App                  | [Illuminate\Foundation\Application](https://laravel.com/api/8.x/Illuminate/Foundation/Application.html)                             | `app`                  |
| Artisan              | [Illuminate\Contracts\Console\Kernel](https://laravel.com/api/8.x/Illuminate/Contracts/Console/Kernel.html)                         | `artisan`              |
| Auth                 | [Illuminate\Auth\AuthManager](https://laravel.com/api/8.x/Illuminate/Auth/AuthManager.html)                                         | `auth`                 |
| Auth (Instance)      | [Illuminate\Contracts\Auth\Guard](https://laravel.com/api/8.x/Illuminate/Contracts/Auth/Guard.html)                                 | `auth.driver`          |
| Blade                | [Illuminate\View\Compilers\BladeCompiler](https://laravel.com/api/8.x/Illuminate/View/Compilers/BladeCompiler.html)                 | `blade.compiler`       |
| Broadcast            | [Illuminate\Contracts\Broadcasting\Factory](https://laravel.com/api/8.x/Illuminate/Contracts/Broadcasting/Factory.html)             |                        |
| Broadcast (Instance) | [Illuminate\Contracts\Broadcasting\Broadcaster](https://laravel.com/api/8.x/Illuminate/Contracts/Broadcasting/Broadcaster.html)     |                        |
| Bus                  | [Illuminate\Contracts\Bus\Dispatcher](https://laravel.com/api/8.x/Illuminate/Contracts/Bus/Dispatcher.html)                         |                        |
| Cache                | [Illuminate\Cache\CacheManager](https://laravel.com/api/8.x/Illuminate/Cache/CacheManager.html)                                     | `cache`                |
| Cache (Instance)     | [Illuminate\Cache\Repository](https://laravel.com/api/8.x/Illuminate/Cache/Repository.html)                                         | `cache.store`          |
| Config               | [Illuminate\Config\Repository](https://laravel.com/api/8.x/Illuminate/Config/Repository.html)                                       | `config`               |
| Cookie               | [Illuminate\Cookie\CookieJar](https://laravel.com/api/8.x/Illuminate/Cookie/CookieJar.html)                                         | `cookie`               |
| Crypt                | [Illuminate\Encryption\Encrypter](https://laravel.com/api/8.x/Illuminate/Encryption/Encrypter.html)                                 | `encrypter`            |
| DB                   | [Illuminate\Database\DatabaseManager](https://laravel.com/api/8.x/Illuminate/Database/DatabaseManager.html)                         | `db`                   |
| DB (Instance)        | [Illuminate\Database\Connection](https://laravel.com/api/8.x/Illuminate/Database/Connection.html)                                   | `db.connection`        |
| Event                | [Illuminate\Events\Dispatcher](https://laravel.com/api/8.x/Illuminate/Events/Dispatcher.html)                                       | `events`               |
| File                 | [Illuminate\Filesystem\Filesystem](https://laravel.com/api/8.x/Illuminate/Filesystem/Filesystem.html)                               | `files`                |
| Gate                 | [Illuminate\Contracts\Auth\Access\Gate](https://laravel.com/api/8.x/Illuminate/Contracts/Auth/Access/Gate.html)                     |                        |
| Hash                 | [Illuminate\Contracts\Hashing\Hasher](https://laravel.com/api/8.x/Illuminate/Contracts/Hashing/Hasher.html)                         | `hash`                 |
| Lang                 | [Illuminate\Translation\Translator](https://laravel.com/api/8.x/Illuminate/Translation/Translator.html)                             | `translator`           |
| Log                  | [Illuminate\Log\LogManager](https://laravel.com/api/8.x/Illuminate/Log/LogManager.html)                                             | `log`                  |
| Mail                 | [Illuminate\Mail\Mailer](https://laravel.com/api/8.x/Illuminate/Mail/Mailer.html)                                                   | `mailer`               |
| Notification         | [Illuminate\Notifications\ChannelManager](https://laravel.com/api/8.x/Illuminate/Notifications/ChannelManager.html)                 |                        |
| Password             | [Illuminate\Auth\Passwords\PasswordBrokerManager](https://laravel.com/api/8.x/Illuminate/Auth/Passwords/PasswordBrokerManager.html) | `auth.password`        |
| Password (Instance)  | [Illuminate\Auth\Passwords\PasswordBroker](https://laravel.com/api/8.x/Illuminate/Auth/Passwords/PasswordBroker.html)               | `auth.password.broker` |
| Queue                | [Illuminate\Queue\QueueManager](https://laravel.com/api/8.x/Illuminate/Queue/QueueManager.html)                                     | `queue`                |
| Queue (Instance)     | [Illuminate\Contracts\Queue\Queue](https://laravel.com/api/8.x/Illuminate/Contracts/Queue/Queue.html)                               | `queue.connection`     |
| Queue (Base Class)   | [Illuminate\Queue\Queue](https://laravel.com/api/8.x/Illuminate/Queue/Queue.html)                                                   |                        |
| Redirect             | [Illuminate\Routing\Redirector](https://laravel.com/api/8.x/Illuminate/Routing/Redirector.html)                                     | `redirect`             |
| Redis                | [Illuminate\Redis\RedisManager](https://laravel.com/api/8.x/Illuminate/Redis/RedisManager.html)                                     | `redis`                |
| Redis (Instance)     | [Illuminate\Redis\Connections\Connection](https://laravel.com/api/8.x/Illuminate/Redis/Connections/Connection.html)                 | `redis.connection`     |
| Request              | [Illuminate\Http\Request](https://laravel.com/api/8.x/Illuminate/Http/Request.html)                                                 | `request`              |
| Response             | [Illuminate\Contracts\Routing\ResponseFactory](https://laravel.com/api/8.x/Illuminate/Contracts/Routing/ResponseFactory.html)       |                        |
| Response (Instance)  | [Illuminate\Http\Response](https://laravel.com/api/8.x/Illuminate/Http/Response.html)                                               |                        |
| Route                | [Illuminate\Routing\Router](https://laravel.com/api/8.x/Illuminate/Routing/Router.html)                                             | `router`               |
| Schema               | [Illuminate\Database\Schema\Builder](https://laravel.com/api/8.x/Illuminate/Database/Schema/Builder.html)                           |                        |
| Session              | [Illuminate\Session\SessionManager](https://laravel.com/api/8.x/Illuminate/Session/SessionManager.html)                             | `session`              |
| Session (Instance)   | [Illuminate\Session\Store](https://laravel.com/api/8.x/Illuminate/Session/Store.html)                                               | `session.store`        |
| Storage              | [Illuminate\Filesystem\FilesystemManager](https://laravel.com/api/8.x/Illuminate/Filesystem/FilesystemManager.html)                 | `filesystem`           |
| Storage (Instance)   | [Illuminate\Contracts\Filesystem\Filesystem](https://laravel.com/api/8.x/Illuminate/Contracts/Filesystem/Filesystem.html)           | `filesystem.disk`      |
| URL                  | [Illuminate\Routing\UrlGenerator](https://laravel.com/api/8.x/Illuminate/Routing/UrlGenerator.html)                                 | `url`                  |
| Validator            | [Illuminate\Validation\Factory](https://laravel.com/api/8.x/Illuminate/Validation/Factory.html)                                     | `validator`            |
| Validator (Instance) | [Illuminate\Validation\Validator](https://laravel.com/api/8.x/Illuminate/Validation/Validator.html)                                 |                        |
| View                 | [Illuminate\View\Factory](https://laravel.com/api/8.x/Illuminate/View/Factory.html)                                                 | `view`                 |
| View (Instance)      | [Illuminate\View\View](https://laravel.com/api/8.x/Illuminate/View/View.html)                                                       |                        |

<br>

### Authファサード

#### ▼ Authファサードとは

認証に関する処理を提供する。Laravelからあらかじめ提供されている認証を使用しない場合、Authファサードを使用して、認証ロジックを実装できる。

<br>

### DBファサード

#### ▼ DBファサードとは

DBの操作処理を提供する。Eloquentの代わりとして、DBファサードを使用しても良い。Active Recordのロジックを持たないため、Repositoryパターンのロジックとして使用できる。

#### ▼ ```transaction```メソッド

一連のトランザクション処理を実行する。引数として渡した無名関数が例外を返却した場合、ロールバックを自動的に実行する。例外が発生しなかった場合、無名関数の返却値が、そのまま```transaction```メソッドの返却値になる。加えて```transaction```メソッドの返却値を返却するようにすれば、無名関数の返却値をそのまま使用できる。ちなみに、トランザクション処理は必須ではなく、使用するとアプリケーションがDBを操作するために要する時間が増えるため、使用しなくても良い。参考リンクによると、MongoDBに対してトランザクション処理を行う/行わない場合を比較して、処理時間が17%弱長くなったとのこと。

> ℹ️ 参考：https://rightcode.co.jp/blog/information-technology/node-js-mongodb-transaction-function-use#i-5

**＊実装例＊**

```php
<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Foo\Entities\Foo;
use App\Domain\Foo\Repositories\FooRepository as DomainFooRepository;
use App\Infrastructure\Foo\DTO\FooDTO;
use Throwable;

class FooRepository extends Repository implements DomainFooRepository
{
    /**
     * @var FooDTO
     */
    private FooDTO $fooDTO;

    public function __construct(FooDTO $fooDTO)
    {
        $this->fooDTO = $fooDTO;
    }

    /**
     * @param Foo $foo
     * @throws Throwable
     */
    public function save(Foo $foo): void
    {
        // トランザクション処理を開始する。
        DB::beginTransaction();

        try {

            $this->fooDTO->fill([
                    "name"  => $foo->name(),
                    "age"   => $foo->age(),
                ])
                ->save();

            // コミットメントを実行する。
            DB::commit();
        } catch (Exception $e) {

            // ロールバックする。
            DB::rollback();
        }
    }
}

```

#### ▼ ```beginTransaction```メソッド、```commit```メソッド、```rollback```メソッド、

トランザクション処理の各操作を分割して実行する。基本的には、```transaction```メソッドを使用してトランザクション処理を実行すれば良い。

**＊実装例＊**

```php
<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Foo\Entities\Foo;
use App\Domain\Foo\Repositories\FooRepository as DomainFooRepository;
use App\Infrastructure\Foo\DTO\FooDTO;

class FooRepository extends Repository implements DomainFooRepository
{
    /**
     * @var FooDTO
     */
    private FooDTO $fooDTO;
    
    public function __construct(FooDTO $fooDTO)
    {
        $this->fooDTO = $fooDTO;
    }   
    
    /**
     * Fooを更新します。
     *
     * @param Foo $foo
     */
    public function save(Foo $foo)
    {
        // トランザクション処理を開始する。
        DB::beginTransaction();
        
        try {
            $this->fooDTO
            // オブジェクトにデータを設定する。
            ->fill([
                "name"  => $foo->name(),
                "age"   => $foo->age(),
                "email" => $foo->email()
            ])
            // update文を実行する。
            ->save();            
            
            // コミットメントを実行する。
            DB::commit();
        } catch (\Exception $e) {
            
            // ロールバックする。
            DB::rollback();
        }
    }
}
```

<br>

### Routeファサード

#### ▼ Routeファサードとは

ルーティング処理を提供する。

#### ▼ ヘルスチェックへの対応

ALBやGlobal Acceleratorから『```/healthcheck```』に対してヘルスチェックを設定した上で、```200```ステータスを含むレスポンスを返信する。Nginxでヘルスチェックを実装もできるが、アプリケーションの死活管理としては、Laravelに実装する方が適切である。RouteServiceProviderも参照せよ。

**＊実装例＊**

```php
<?php

# ヘルスチェックを受信するパス
Route::get("/healthcheck", function () {
    return response("success", 200);
});
```

#### ▼ ```middleware```メソッド

コントローラーへのルーティング時に実行するMiddlewareクラスを設定する。引数として、```App\Http\Kernel.php```ファイルで定義されたMiddlewareクラスのエイリアス名を設定する。

**＊実装例＊**

認証方法としてWebガードを使用する場合、```auth```エイリアスを設定する。

```php
<?php

use App\Http\Controllers\Foo\FooController;

// authエイリアスを設定する。
Route::middleware("auth")->group(function () {
    Route::get("/foo", [FooController::class, "getFoo"]);
    Route::get("/foo/{fooId}", [FooController::class, "index"]);
    Route::post("/foo", [FooController::class, "createFoo"]);
    Route::put("/foo/{fooId}", [FooController::class, "updateFoo"]);
    Route::delete("/foo/{fooId}", [FooController::class, "deleteFoo"]);
});

```

デフォルトでは、```App\Http\Kernel.php```ファイルにて、```auth```エイリアスに```\App\Http\Middleware\Authenticate```クラスが紐付けられている。


```php
<?php

namespace App\Http;

use App\Http\Middleware\BeforeMiddleware\FooIdConverterMiddleware;
use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    
    ...
    
    protected $routeMiddleware = [
        
        "auth" => \App\Http\Middleware\Authenticate::class,
        
    ];
    
    ...    
    
}
```

一方で、認証方法としてAPIガードを使用する場合、```auth:api```エイリアスを設定する。

```php
<?php

// authエイリアスのMiddlewareクラスが使用される。
Route::middleware("auth:api")->group(function () {
    // 何らのルーティング
});
```

#### ▼ ```prefix```メソッド

エンドポイントが共通として持つ最初のパスを、接頭辞として定義する。

**＊実装例＊**

各エンドポイントの最初の『```foos```』を接頭辞として定義する。

```php
<?php

use App\Http\Controllers\Foo\FooController;

Route::prefix("foos")->group(function () {
    Route::get("/", [FooController::class, "getFoo"]);
    Route::get("/{fooId}", [FooController::class, "index"]);
    Route::post("/", [FooController::class, "createFoo"]);
    Route::put("/{fooId}", [FooController::class, "updateFoo"]);
    Route::delete("/{fooId}", [FooController::class, "deleteFoo"]);
});
```

#### ▼ ```where```メソッド、```pattern```メソッド

パスパラメーターに対するバリデーションルールを正規表現で定義し、加えて実行する。RouteServiceProviderの```boot```メソッドにて、```pattern```メソッドで制約を設定することによって、ルーティング時にwhereを使用する必要がなくなる。

**＊実装例＊**

userIdの形式を『0〜9が1つ以上』に設定している。

```php
<?php

use App\Http\Controllers\Foo\FooController;

Route::prefix("foos")->group(function () {
    Route::get("/", [FooController::class, "getFoo"]);
    Route::get("/{fooId}", [FooController::class, "index"])
        // バリデーションルール
        ->where("fooId", "[0-9]+");
    Route::post("/", [FooController::class, "createFoo"]);
    Route::put("/{fooId}", [FooController::class, "updateFoo"])
        ->where("fooId", "[0-9]+");
    Route::delete("/{fooId}", [FooController::class, "deleteFoo"])
        ->where("fooId", "[0-9]+");
});
```

または、RouteServiceProviderクラスに```pattern```メソッドを定義すると、各エンドポイントに対する正規表現を一括で実行できる。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/routing.html#parameters-global-constraints

**＊実装例＊**

```php
<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * ルーティングの設定ファイルをコールします。
     *
     * @return void
     */
    public function boot()
    {
        // バリデーションルールとして『0〜9が1つ以上』を定義する。
        Route::pattern('fooId', '[0-9]+');
        
        // 〜 中略 〜
    }
}
```

#### ▼ ```group```メソッド

複数のグループを組み合わせる場合、```group```メソッドを使用する。

**＊実装例＊**

エンドポイントの接頭辞とミドルウェアの指定を定義する。

```php
<?php

Route::group(["prefix" => "foo" , "middleware" => "auth"], (function () {
    Route::get("/", [FooController::class, "getFoo"]);
    Route::get("/{fooId}", [FooController::class, "index"]);
    Route::post("/", [FooController::class, "createFoo"]);
    Route::put("/{fooId}", [FooController::class, "updateFoo"]);
    Route::delete("/{fooId}", [FooController::class, "deleteFoo"]);
});
```

<br>

### Storageファサード

#### ▼ Storageファサードとは

ファイルの入出力処理を提供する。

#### ▼ ローカルストレージ（非公開）の場合

ファイルを```/storage/app```ディレクトリ配下に保存する。このファイルは非公開であり、リクエストによってアクセスできない。事前に、シンボリックリンクを作成する、また、```filesystems.php```ファイルに設定が必要である。

```bash
$ php artisan storage:link
```

```php
return [

    "default" => env("FILESYSTEM_DRIVER", "local"),
    
     ...

    "disks" => [

        "local" => [
            "driver" => "local",
            "root"   => storage_path("app"),
        ],
        
     ...
        
    // シンボリックリンクの関係を定義
    "links" => [
        
        // 『/var/www/project/public/storage』から『/var/www/project/storage/app/public』へのリンク
        public_path("storage") => storage_path("app/public"),
    ],
];
```

**＊実装例＊**

Storageファサードの```disk```メソッドを使用してlocalディスクを指定する。```file.txt```ファイルを```storage/app/file.txt```として保存する。

```php
Storage::disk("local")->put("file.txt", "file.txt");
```

ただし、```filesytems.php```ファイルでデフォルトディスクは```local```になっているため、```put```メソッドを直接的に使用できる。

```php
Storage::put("file.txt", "file.txt");
```

#### ▼ ローカルストレージ（公開）の場合

ファイルを```storage/app/public```ディレクトリ配下に保存する。このファイルは公開であり、リクエストによってアクセスできる。事前に、```filesystems.php```ファイルに設定が必要である。

```php
return [

    "default" => env("FILESYSTEM_DRIVER", "local"),
    
     ...

    "disks" => [
        
        ...

        "public" => [
            "driver"     => "local",
            "root"       => storage_path("app/public"),
            "url"        => env("APP_URL") . "/storage",
            "visibility" => "public",
        ],

        ...
        
    ],
];
```

**＊実装例＊**

Storageファサードの```disk```メソッドを使用してpublicディスクを指定する。また、```file.txt```ファイルを```storage/app/public/file.txt```として保存する。

```php
Storage::disk("s3")->put("file.txt", "file.txt");
```

ただし、環境変数を使用して、```filesytems.php```ファイルでデフォルトディスクを```s3```に変更すると、```put```メソッドを直接的に使用できる。

```php
FILESYSTEM_DRIVER=s3
```

```php
Storage::put("file.txt", "file.txt");
```

**＊実装例＊**


```php
<?php

namespace App\Http\Controllers;

use Storage;

class FileSystemPublicController extends Controller
{
    /**
     * ファイルをpublicディスクに保存する
     */
    public function putContentsInPublicDisk()
    {
        // 保存先をpublicに設定する。
        $disk = Storage::disk("public");

        // 保存先のファイルを読み込む
        $file_path = "/path/to/public/foo.jpg"
        $contents = file_get_contents($file_path);

        // 保存先パス（ディレクトリ+ファイル名）
        $saved_file_path = "/images/foo.jpg";

        // foo.jpgを『/images/foo.jpg』に保存
        // ルートディレクトリは『/storage/app/public』
        $disk->put($saved_file_path, $contents);
    }
}
```

#### ▼ クラウドストレージの場合

ファイルをS3バケット内のディレクトリ配下に保存する。環境変数を```.env```ファイルに実装する必要がある。```filesystems.php```ファイルから、指定された設定が選択される。AWSアカウントの認証情報を環境変数として設定するか、またはS3アクセスポリシーをEC2やECSタスクに付与することにより、S3にアクセスできるようになる。事前に、```filesystems.php```ファイルに設定が必要である。

```bash
# S3アクセスポリシーをEC2やECSタスクに付与してもよい
AWS_ACCESS_KEY_ID=<アクセスキーID>
AWS_SECRET_ACCESS_KEY=<シークレットアクセスキー>
AWS_DEFAULT_REGION=ap-northeast-1

# 必須
AWS_BUCKET=<バケット名>
```

```php
return [

    "default" => env("FILESYSTEM_DRIVER", "local"),
    
     ...
    
    "disks" => [

        ...

        "s3" => [
            "driver"   => "s3",
            "key"      => env("AWS_ACCESS_KEY_ID"),
            "secret"   => env("AWS_SECRET_ACCESS_KEY"),
            "region"   => env("AWS_DEFAULT_REGION"),
            "bucket"   => env("AWS_BUCKET"),
            "url"      => env("AWS_URL"),
            "endpoint" => env("AWS_ENDPOINT"),
        ],
    ],
];
```

**＊実装例＊**

Storageファサードの```disk```メソッドを使用してs3ディスクを指定する。また、```file.txt```ファイルをS3バケットのルートに```file.txt```として保存する。

```php
Storage::disk("s3")->put("file.txt", "file.txt");
```

他の実装方法として、環境変数を使用して、```filesytems.php```ファイルでデフォルトディスクを```s3```に変更すると、```put```メソッドを直接的に使用できる。

```bash
FILESYSTEM_DRIVER=s3
```

```php
Storage::put("file.txt", "file.txt");
```

<br>

### Validatorファサード

#### ▼ Validatorファサードとは

バリデーション処理を提供する。FormRequestクラスの```validated```メソッドや```validate```メソッドの代わりとして、Validatorファサードを使用しても良い。

#### ▼ Validatorクラス、```fails```メソッド

Validateファサードの```make```メソッドを使用して、ルールを定義する。この時、第一引数で、バリデーションを行うリクエストデータを渡す。ルールに反すると、1つ目のルール名（例：```required```）に基づき、```validation.php```ファイルから対応するエラーメッセージを自動的に選択する。次に、```fails```メソッドを使用して、バリデーションでエラーが発生した場合の処理を定義する。

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FooController extends Controller
{
    /**
     * 新しいブログポストの保存
     *
     * @param Request $request
     */
    public function update(Request $request)
    {
        // ルールの定義
        $validator = Validator::make(
            $request->all(), [
            "title" => "required|unique:posts|max:255",
            "body"  => "required",
        ]);

        // バリデーション時にエラーが発生した場合
        if ($validator->fails()) {
            // 指定したWebページにリダイレクト
            // validatorを渡すことにより、エラーメッセージをViewに渡せる。
            return redirect("error")->withErrors($validator)
                ->withInput();
        }
        
        // 続きの処理
    }
}
```

#### ▼ ```validate```メソッド

Validatorクラスの```validate```メソッドを使用すると、FormRequestクラスの```validate```メソッドと同様の処理が実行される。バリデーションでエラーが発生した場合、Handlerクラスの```invalid```メソッドがコールされ、元のWebページにリダイレクトされる。

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FooController extends Controller
{
    /**
     * 新しいブログポストの保存
     *
     * @param Request $request
     */
    public function update(Request $request)
    {
        // 元のWebページにリダイレクトする場合は、validateメソッドを使用する。
        $validator = Validator::make(
            $request->all(),
            [
                "title" => "required|unique:posts|max:255",
                "body"  => "required",
            ])->validate();

        // バリデーション時にエラーが発生した場合
        if ($validator->fails()) {
            // 指定したWebページにリダイレクト
            // validatorを渡すことにより、エラーメッセージをViewに渡せる。
            return redirect("error")->withErrors($validator)
                ->withInput();
        }
        
        // 続きの処理
    }
}
```

<br>

## 08-02. よく使用するグローバルヘルパー関数

### ヘルパー関数

#### ▼ ヘルパー関数とは

グローバルにコールできるLaravel専用のメソッドのこと。基本的には、ヘルパー関数で実行される処理は、Facadeの内部で実行されるものと同じである。どちらを使用するかは好みである。

> ℹ️ 参考：https://stackoverflow.com/questions/31324226/laravel-performance-of-facades-vs-helper-methods

#### ▼ 一覧

以下リンクを参考にせよ。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/helpers.html#method-view

<br>

### ```auth```ヘルパー

#### ▼ AuthManagerインスタンスの返却

認証処理を持つAuthManagerクラスのインスタンスを返却する。

> ℹ️ 参考：https://laravel.com/api/8.x/Illuminate/Auth/AuthManager.html

```php
<?php

// Illuminate\Auth\AuthManager
$auth = auth();
```

<br>

### ```config```ヘルパー

#### ▼ 環境変数ファイルの読み出し

環境変数ファイル名とキー名をドットで指定し、事前に設定された値を出力する。

**＊実装例＊**

デフォルトで搭載されている```app.php```ファイルの```timezone```キーの値を出力する。

```php
<?php

$value = config("app.timezone");
```

#### ▼ 独自環境変数ファイルの作成と読み出し

任意の名前のphp形式ファイルを```config```ディレクトリ配下に作成しておく。これは、configヘルパーで読み込める。

**＊実装例＊**


```php
<?php

$requestUrl = config("api.foo.endpoint_url");
```


```php
<?php

return [
    "foo" => [
        "endpoint_url" => env("ENDPOINT_URL", ""),
        "api_key"      => env("API_KEY"),
    ],
    "bar" => [
        "endpoint_url" => env("ENDPOINT_URL", ""),
        "api_key"      => env("API_KEY"),
    ]
];
```

<br>

### ```bcrypt```ヘルパー

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/helpers.html#method-bcrypt

```php
<?php

$hash = bcrypt('foo'); // 『foo』をハッシュ化して、『$2y$10$ZkYG.whhdcogCCzbG.VlQ』としてDBで管理する。
```

<br>

### ```redirect```ヘルパー

> ℹ️ 参考：https://blog.capilano-fw.com/?p=566

<br>

### ```response```ヘルパー

#### ▼ JSONデータを含むレスポンス

返却されるResponseFactoryクラスの```json```メソッドにレンダリングしたいJSONデータを設定する。```response```ヘルパーは初期値として```200```ステータスが設定されているが、```view```メソッドや```setStatusCode```メソッドを使用して、明示的に設定しても良い。

> ℹ️ 参考：https://github.com/laravel/framework/blob/8.x/src/Illuminate/Contracts/Routing/ResponseFactory.php

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;

class FooController extends Controller
{
    public function index()
    {

        ...

        return response()->json([
            "name"  => "Abigail",
            "state" => "CA"
        ], 200);
    }
}
```

#### ▼ Viewテンプレートのレスポンス

返却されるResponseFactoryクラスの```view```メソッドに、レンダリングしたいデータ（テンプレート、array型データ、ステータスコードなど）を設定する。また、Viewクラスの```header```メソッドにHTTPヘッダーの値を設定する。```response```ヘルパーは初期値として```200```ステータスが設定されているが、```view```メソッドや```setStatusCode```メソッドを使用して、明示的に設定しても良い。

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers\Foo;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;

class FooController extends Controller
{
    public function index()
    {
        ...

        // データ、ステータスコード、ヘッダーなどを設定する場合
        return response()->view(
            "foo",
            $data,
            200
        )->header(
            "Content-Type",
            $type
        );
    }
}
```

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;

class FooController extends Controller
{
    public function index()
    {
        ...

        // ステータスコードのみ設定する場合
        return response()->view("foo")
            ->setStatusCode(200);
    }
}
```

<br>

### ```route```ヘルパー

#### ▼ ルートエイリアスを基にURL作成

ルートにエイリアスがついている場合、エイリアスに応じてURLを作成する。ドメインは自動的に補完される。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/helpers.html#method-route

```php
<?php
    
Route::get('/foo', [FooController::class, 'index'])->name('foos_index');
    
// https://example.com/foo
$url = route('foos_index');
```

<br>

### ```path```系ヘルパー

#### ▼ ```base_path```ヘルパー

引数を設定しない場合、projectルートディレクトリの絶対パスを作成する。また、projectルートディレクトリからの相対パスを引数として、絶対パスを作成する。

```php
<?php

// /var/www/project
$path = base_path();

// /var/www/project/vendor/bin
$path = base_path("vendor/bin");
```

#### ▼ ```public_path```ヘルパー

引数を設定しない場合、publicディレクトリの絶対パスを作成する。また、publicディレクトリからの相対パスを引数として、絶対パスを作成する。

```php
<?php

// /var/www/project/public
$path = public_path();

// /var/www/project/public/css/app.css
$path = public_path("css/app.css");
```

#### ▼ ```storage_path```ヘルパー

引数を設定しない場合、storageディレクトリの絶対パスを作成する。まあ、storageディレクトリからの相対パスを引数として、絶対パスを作成する。

```php
<?php

// /var/www/project/storage
$path = storage_path();

// /var/www/project/storage/app/file.txt
$path = storage_path("app/file.txt");
```

<br>

### ```url```ヘルパー

#### ▼ パスを基にURL作成

指定したパスに応じてURLを作成する。ドメインは自動的に補完される。

> ℹ️ 参考：https://readouble.com/laravel/5.7/ja/urls.html

```php
<?php

// https://example.com/foo
$url = url('/foo');
```

<br>



## 09. Factory

### 初期値レコードの定義

#### ▼ Fakerによるランダム値作成

Fakerはレコードの値をランダムに作成するためのパッケージである。Farkerクラスは、プロパティにランダムなデータを保持している。このプロパティを特に、Formattersという。

> ℹ️ 参考：https://fwhy.github.io/faker-docs/

#### ▼ Factoryによるレコード定義

**＊実装例＊**

```php
<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Foo;
use Illuminate\Database\Eloquent\Factories\Factory;

class FooFactory extends Factory
{
    /**
     * @var string
     */
    protected $model = Foo::class;

    /**
     * @return array
     */
    public function definition()
    {
        return [
            'name'          => $this->faker->name,
            'email_address' => $this->faker->unique()->safeEmail,
            'password'      => 'password',
        ];
    }
}
```

#### ▼ HasFactoryトレイト

Factoryに対応するEloquentモデルで使用する必要がある。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/database-testing.html#creating-models-using-factories

```php
class Foo
{
    use HasFactory;
}
```

<br>

### 初期ダミーデータの量産

#### ▼ Seederによるダミーデータ量産

Factoryにおける定義を基にして、指定した数だけダミーデータを量産する。

**＊実装例＊**

FooSeederを定義し、```50```個のダミーユーザーデータを量産する。

```php
<?php

use App\Models\Foo;
use Illuminate\Database\Seeder;

class FooSeeder extends Seeder
{
    private const NUM_TEST_DATA = 3;
    
    /**
     * @return void
     */
    public function run()
    {
        factory()->count(self::NUM_TEST_DATA)->create();
    }
}
```

また、BarSeederを定義し、```50```個のダミーユーザーデータを量産する。

```php
<?php

use App\Models\Bar;
use Illuminate\Database\Seeder;

class BarSeeder extends Seeder
{
    private const NUM_TEST_DATA = 3;
    
    /**
     * @return void
     */
    public function run()
    {
        factory()->count(self::NUM_TEST_DATA)->create();
    }
}
```

DatabaseSeederにて、全てのSeederをまとめて実行する。

```php
<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * @return void
     */
    public function run()
    {
        // 開発環境用の初期データ
        if (app()->environment("local")) {
            $this->call([
                // ダミーデータ
                FooSeeder::class,
                BarSeeder::class
            ]);
        }

        // テスト環境用の初期データ
        if (app()->environment("tes")) {
            $this->call([
                // リアルデータ
            ]);
        }
                
        // ステージング環境用の初期データ
        if (app()->environment("stg")) {
            $this->call([
                // リアルデータ
            ]);
        }
        
        // 本番環境用の初期データ
        if (app()->environment("prd")) {
            $this->call([
                // リアルデータ
            ]);
        }
    }
}
```

<br>

## 10. HTTP｜Controller

<br>

## 10-02. HTTP｜FormRequest

### クエリパラメーター/メッセージボディのバリデーション

#### ▼ ルール定義 ＆ バリデーション手動実行

同じくFormRequestクラスの```validate```メソッドを使用して、ルールを定義し、加えてバリデーションを実行する。```validated```メソッドと間違わないように注意する。ルールに反すると、1つ目のルール名（例：```required```）に基づき、```validation.php```ファイルから対応するエラーメッセージを自動的に選択する。バリデーションでエラーが発生した場合、Handlerクラスの```invalid```メソッドがコールされ、元のWebページにリダイレクトされる。

> ℹ️ 参考：
>
> - https://readouble.com/laravel/7.x/ja/validation.html#creating-form-requests
> - https://laravel.com/api/8.x/Illuminate/Http/Request.html#method_validate

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * @param Request $request
     */
    public function index(Request $request)
    {
        // クエリパラメーターのバリデーションを実行する。
        // エラーが発生した場合は元のWebページにリダイレクト
        $validated = $request->validate([
            "limit" => ["required", Rule::in([25, 50, 100])],
            "order" => ["required", Rule::in(["ascend", "descend"])],
        ]);

        // 続きの処理
    }

    /**
     * @param Request $request
     */
    public function update(Request $request)
    {
        // ルールの定義、バリデーションの実行
        // エラーが発生した場合は元のWebページにリダイレクト
        $validated = $request->validate([
            "title" => ["required", "string", "max:255"],
            "body"  => ["required", "string", "max:255"],
            "date"  => ["required", "date"],
        ]);

        // 続きの処理
    }
}
```

注意点として、ルールによっては、配列を使用せずとも定義できる。

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * @param Request $request
     */
    public function update(Request $request)
    {
        // ルールの定義、メッセージボディのバリデーションを実行する。
        // エラーが発生した場合は元のWebページにリダイレクト
        $validated = $request->validate([
            "title" => "required|string|max:5255",
            "body"  => "required|string|max:255",
            "date"  => "required|date",
        ]);

        // 続きの処理
    }
}
```

#### ▼ ルール定義 & バリデーション自動実行

Controllerで、FormRequestクラスを引数に指定すると、コントローラーのメソッドをコールする前にバリデーションを自動的に実行する。そのため、コントローラーの中ではバリデーションを実行する必要はない。代わりとして、ルールをFormRequestクラスの```rule```メソッドに定義する必要がある。FormRequestクラスの```validated```メソッドを使用して、バリデーション済みのデータを取得できる。バリデーションでエラーが発生した場合、Handlerクラスの```invalid```メソッドがコールされ、元のWebページにリダイレクトされる。

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * @param Request $request
     */
    public function index(Request $request)
    {
        // クエリパラメーターのバリデーションを実行する。
        // エラーが発生した場合は元のWebページにリダイレクト
        $validated = $request->validated();

        // 続きの処理
    }

    /**
     * @param Request $request
     */
    public function update(Request $request)
    {
        // メッセージボディのバリデーションを実行する。
        // エラーが発生した場合は元のWebページにリダイレクト
        $validated = $request->validated();

        // 続きの処理
    }
}
```

FormRequestクラスの```rules```メソッドを使用して、ルールを定義する。ルールに反すると、1つ目のルール名（例：```required```）に基づき、```validation.php```ファイルから対応するエラーメッセージを自動的に選択する。

**＊実装例＊**

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FooRequest extends FormRequest
{
    /**
     * ルールを返却します。
     *
     * @return array
     */
    public function rules()
    {
        // ルールの定義
        return [
            "title"  => ["required", "string", "max:255"],
            "body"   => ["required", "string", "max:255"],
            "type"   => ["required", Rule::in([1, 2, 3])],
            "author" => ["required", "string", new UppercaseRule()],
            "date"   => ["required", "date"],
        ];
    }
}
```

<br>

### パスパラメーターのバリデーション

#### ▼ ルールの定義 ＆ バリデーション自動実行

Routeファサードの```pattern```メソッドまたは```where```メソッドで定義する。

<br>

### エラーメッセージ

#### ▼ 標準のエラーメッセージ

標準のバリデーションメッセージは、```resources/lang/ja/validation.php```ファイルで定義できる。バリデーションルールの組み合わせによって、```validation.php```ファイルから自動的にメッセージが選択される。例えばルールとして最大値を設定した場合は、データ型に合わせてメッセージが選択される。日本語翻訳```validation.php```ファイルについては、以下のリンクを参考にせよ。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/validation-php.html

```php
<?php

return [

    // 〜 中略 〜

    'required' => ':attributeは必須です',

    'string' => ':attribute は文字列のみ有効です',

    'max' => [
        'numeric' => ':attributeには、:max以下の数字を指定してください',
        'file'    => ':attributeには、:max kB以下のファイルを指定してください',
        'string'  => ':attributeは、:max文字以下で指定してください',
        'array'   => ':attributeは:max個以下指定してください',
    ],

    'date' => ':attribute を有効な日付形式にしてください',

    'attributes' => [
        'title' => 'タイトル',
        'body'  => '本文',
        'date'  => '作成日',
    ],

    // 〜 中略 〜

];
```

注意点として、言語設定を行わない場合、デフォルトでは```/resources/lang/en/validation.php```ファイルをバリデーションメッセージとして参照するため、```app.php```ファイルで言語を変更することと、日本語翻訳```validation.php```ファイルが必要である。

```php
<?php

return [

    // 〜 中略 〜

    'locale' => 'ja'
    
    // 〜 中略 〜
    
];
```

#### ▼ 画面上でのエラーメッセージ出力

バリデーションでエラーがあった場合、Handlerクラスの```invalid```メソッドがコールされ、MessageBagクラスがViewに渡される。選択されたバリデーションメッセージが配列型でMessageBagクラスに格納されている。

> ℹ️ 参考：
>
> - https://laravel.com/api/8.x/Illuminate/Foundation/Exceptions/Handler.html#method_invalid
> - https://laravel.com/api/8.x/Illuminate/Support/MessageBag.html

```bash
( 
  [title] => Array
         (
            [0] => タイトルの入力は必須です
            [1] => タイトルは、最大255文字以下で指定してください
         )

  [body] => Array
         (
            [0] => 本文の入力は必須です
            [1] => 本文は、最大255文字以下で指定してください
         )
  [data] => Array
         (
            [0] => 作成日の入力は必須です
            [1] => 作成日を有効な日付形式にしてください
         )    
)
```

<br>

### Rule

#### ▼ ```exists```メソッド

指定されたテーブルのカラムに値が存在しているかを検証する。

> ℹ️ 参考：https://laravel.com/api/8.x/Illuminate/Validation/Rule.html#method_exists

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FooRequest extends FormRequest
{
    /**
     * ルールを返却します。
     *
     * @return array
     */
    public function rules()
    {
        // ルールの定義
        return [
            "prefectureId" => ["nullable", "integer", Rule::exists("prefectures", "id")],
            "cityId"       => ["nullable", "integer", Rule::exists("cities", "id")]
        ];
    }
}
```

テーブルにカラム数が多い場合は、Where句をつけることにより、特定のカラムのみ検証もできる。

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FooRequest extends FormRequest
{
    /**
     * ルールを返却します。
     *
     * @return array
     */
    public function rules()
    {
        // ルールの定義
        return [
            "prefectureId" => ["nullable", "integer", Rule::exists("prefectures", "id")],
            "cityId"       => ["nullable", "integer", Rule::exists("cities", "id")->whereNull("deleted_at")],
        ];
    }
}
```

#### ▼ ```in```メソッド

決められた複数の値に合致する値であるか否かを検証する。

> ℹ️ 参考：https://laravel.com/api/8.x/Illuminate/Validation/Rule.html#method_in

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FooRequest extends FormRequest
{
    /**
     * ルールを返却します。
     *
     * @return array
     */
    public function rules()
    {
        // ルールの定義
        return [
            "type"  => ["required", Rule::in([1, 2, 3])],
        ];
    }
}
```

#### ▼ 独自ルール/メッセージ

独自ルールを定義する場合は、Ruleクラスを継承したクラスを用意し、```rule```メソッドの中でインスタンスを作成する。独自Ruleクラスでは、```passes```メソッドでルールを定義する。また、```messages```メソッドでバリデーションメッセージを定義する。```validation.php```ファイルでメッセージを定義し、これを参照しても良い。

> ℹ️ 参考：https://laravel.com/docs/8.x/validation#custom-validation-rules

**＊実装例＊**

```php
<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class UppercaseRule implements Rule
{
	/**
     * バリデーションの成功を判定
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
	public function passes($attribute, $value)
	{
		return strtoupper($value) === $value;
	}

	/**
     * バリデーションエラーメッセージの取得
     *
     * @return string
     */
	public function message()
	{
		return 'The :attribute must be uppercase.';
        // return trans('validation.uppercase'); validation.phpファイルから参照する。
	}
}
```

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FooRequest extends FormRequest
{
    /**
     * ルールを返却します。
     *
     * @return array
     */
    public function rules()
    {
        // ルールの定義
        return [
            "author"  => ["required", "string", new UppercaseRule()]
        ];
    }
}
```

<br>

### セッション

#### ▼ セッション変数の取得

FormRequestクラスの```session```メソッドを使用して、セッション変数を取得する。

**＊実装例＊**

```php
<?php
  
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * @param  Request  $request
     * @param  int  $id
     */
    public function show(Request $request, int $id)
    {
        $session = $request->session()
            ->get("key");
    }
}
```

全てのセッション変数を取得もできる。

```php
$session = $request->session()->all();
```

#### ▼ フラッシュデータの設定

現在のセッションで、今回と次回のリクエストのみで有効な一時データを設定できる。

```php
$request->session()
    ->flash("status", "Task was successful!");
```

<br>

### 認証

#### ▼ ```authorize```メソッド

ユーザーがリソースに対してCRUD操作を行う権限を持っているかを、コントローラーのメソッドを実行する前に、判定する。

**＊実装例＊**

```php
/**
 * ユーザーがこのリクエストの権限を持っているかを判断する
 *
 * @return bool
 */
public function authorize()
{
    $comment = Comment::find($this->route("comment"));

    return $comment&& $this->user()->can("update", $comment);
}
```

#### ▼ Authファサード

ノート内の[こちら](#Authファサード)を参考にせよ。

<br>

## 10-03. HTTP｜Middleware

### Middlewareの仕組み

#### ▼ Middlewareの種類

ルーティング後にコントローラーメソッドの前にコールされるBeforeMiddleと、レスポンスの実行時にコールされるAfterMiddlewareがある

![Laravelのミドルウェア](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/LaravelのMiddlewareクラスの仕組み.png)

#### ▼ BeforeMiddleware

ルーティング時のコントローラーメソッドのコール前に実行する処理を設定できる。一連の処理を終えた後、FormRequestクラスを、次のMiddlewareクラスやControllerクラスに渡す必要がある。これらのクラスはClosure（無名関数）として、```next```変数に格納されている。

**＊実装例＊**

```php
<?php

namespace App\Http\Middleware;

use Closure;

class FooBeforeMiddleware
{
    /**
     * @param  Request  $request
     * @param  \Closure  $next
     */
    public function handle($request, Closure $next)
    {
        // 何らかの処理

        // 次のMiddlewareクラスやControllerクラスに、FormRequestクラスを渡す。
        return $next($request);
    }
}
```

#### ▼ AfterMiddleware

コントローラーメソッドのレスポンスの実行後（テンプレートのレンダリングを含む）に実行する処理を設定できる。あらかじめ、FormRequestクラスを、前のMiddlewareクラスやControllerクラスから受け取る必要がある。これらのクラスはClosure（無名関数）として、```next```変数に格納されている。

**＊実装例＊**


```php
<?php

namespace App\Http\Middleware;

use Closure;

class FooAfterMiddleware
{
    /**
     * @param  Request  $request
     * @param  \Closure  $next
     */    
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        // 何らかの処理

        // 前のMiddlewareクラスやControllerクラスから、FormRequestクラスを受け取る。
        return $response;
    }
}
```

<br>

### 標準のMiddleware

#### ▼ EncryptCookies

レスポンス時に、```Cookie```ヘッダーの全ての値を暗号化する。暗号化したくない場合は、```Cookie```ヘッダーのキー名を```except```プロパティに設定する。

> ℹ️ 参考：https://reffect.co.jp/laravel/laravel-sessions-understand#cookie-2

#### ▼ StartSession

セッションの開始の開始点になる。

> ℹ️ 参考：https://qiita.com/wim/items/b1db5202cce6b38bc47b

また、同一セッションで一意なCSRFトークンを作成する。CSRFトークンによるCSRFの防御については、以下のリンクを参考にせよ。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_cyber_attacks.html

#### ▼ VerifyCsrfToken

セッションデータに書かれたCSRFトークンと、リクエストボディに割り当てられたトークンを比較する。セッションデータは```storage/framework/sessions```ディレクトリ配下に配置されている。一般的に、CSRFトークンは```Cookie```ヘッダーに割り当てることもできるが、Laravelではリクエストボディを使用する必要がある。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/csrf.html#preventing-csrf-requests

<br>

### コール方法のカスタマイズ

#### ▼ Kernel

Middlewareクラスをコールする時の方法をカスタマイズできる。

**＊実装例＊**

```php
<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * 全てのHTTPリクエストに適用するミドルウェアを定義します。
     *
     * @var array
     */
    protected $middleware = [
        \App\Http\Middleware\Auth\TrustProxies::class,
        \App\Http\Middleware\Auth\CheckForMaintenanceMode::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \App\Http\Middleware\Auth\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    /**
     * エイリアス名とミドルウェアグループを定義します。
     *
     * @var array
     */
    protected $middlewareGroups = [
        'web' => [
        ],

        'api' => [
            'throttle:60,1',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    /**
     * エイリアス名と個別のミドルウェアを定義します。
     *
     * @var array
     */
    protected $routeMiddleware = [
        'auth'                 => \App\Http\Middleware\Auth\Authenticate::class,
        'auth.basic'           => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'bindings'             => \Illuminate\Routing\Middleware\SubstituteBindings::class,
        'cache.headers'        => \Illuminate\Http\Middleware\SetCacheHeaders::class,
        'can'                  => \Illuminate\Auth\Middleware\Authorize::class,
        'guest'                => \App\Http\Middleware\Auth\RedirectIfAuthenticated::class,
        'password.confirm'     => \Illuminate\Auth\Middleware\RequirePassword::class,
        'signed'               => \Illuminate\Routing\Middleware\ValidateSignature::class,
        'throttle'             => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'verified'             => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,

        // Fooミドルウェアクラス
        'foo' => \App\Http\Middleware\Before\FooMiddleware::class
    ];

    /**
     * ミドルウェアをコールする順番を定義します。
     *
     * @var string[]
     */
    protected $middlewarePriority = [
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \App\Http\Middleware\Auth\Authenticate::class,
        \Illuminate\Routing\Middleware\ThrottleRequests::class,
        \Illuminate\Session\Middleware\AuthenticateSession::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        \Illuminate\Auth\Middleware\Authorize::class,
    ];
}
```

<br>

## 10-04. HTTP｜Request

### リクエストパラメーターの取得

#### ▼ クエリパラメーター/メッセージボディ

クエリパラメーターとメッセージボディの両方を取得する。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/requests.html#retrieving-input

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * @param Request $request
     */
    public function update(Request $request)
    {
        $params = $request->all(); // 全てのパラメーターを連想配列で取得する。

        $foo = $request->input('foo'); // 指定したパラメーターの値を取得する。
        
        $qux = $request->input('foo.qux'); // ネストされたパラメーターの値を取得する。

        $params = $request->only(['foo', 'bar']); // 指定したパラメーターを連想配列で取得する。

        $params = $request->except(['baz']); // 指定したパラメータ以外を連想配列で取得する。

        $foo = $request->foo; // 指定したパラメーターの値を取得する。

        $foo = request('foo'); // 指定したパラメーターの値を取得する。
    }
}
```

#### ▼ クエリパラメーター

クエリパラメーターを取得する。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/requests.html#retrieving-input

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * @param Request $request
     */
    public function index(Request $request)
    {
        $params = $request->query(); // 全てのパラメーターを連想配列で取得する。

        $foo = $request->query('foo'); // 指定したパラメーターの値を取得する。
    }
}
```

#### ▼ パスパラメータ

パスパラメーターを取得する。

> ℹ️ 参考：
>
> - https://technote.space/posts/wpdb-laravel-get-url-parameter/
> - https://laravel.com/api/8.x/Illuminate/Http/Request.html#method_route
> - https://laravel.com/api/8.x/Illuminate/Routing/Route.html#method_parameter

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * @param Request $request
     */
    public function update(Request $request)
    {
        $params = $request->route(); // 全てのパラメーターを連想配列で取得する。

        $fooId = $request->route('fooId'); // 指定したパラメーターの値を取得する。

        $fooId = $request->route->parameter('fooId'); // 指定したパラメーターの値を取得する。
    }
}
```

代わりとして、コントローラーの第二引数にパスパラメーター名を記述することにより、パスパラメーターの値を取得しても良い。

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * @param Request $request
     * @param         $fooId
     */
    public function update(Request $request, $fooId)
    {

    }
}
```

<br>

### バリデーション

Requestではなく、FormRequestを使用した方がバリデーションがおすすめである。

> ℹ️ 参考：https://www.larajapan.com/2020/03/09/formrequest%E3%82%92%E4%BD%BF%E3%81%86/

```php
namespace App\Http\Controllers;
 
use Illuminate\Http\Request;
 
class FooController extends Controller
{
    public function update(Request $request)
    {
        // リクエストのバリデーション
        $validated = $request->validate([
            'name'  => 'required',
            'email' => 'required|email',
        ]);
        
        // 〜 中略 〜
    }
}
```

<br>

## 11. Logging

### ログの出力先

#### ▼ 設定方法

環境変数を```.env```ファイルに実装する。```logging.php```ファイルから、指定された設定が選択される。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/logging.html#available-channel-drivers

```
LOG_CHANNEL=<オプション名>
```

注意点として、```storage```ディレクトリ配下にログファイルを作成するようなログチャンネルを設定した場合、phpがこのディレクトリへの認可スコープを持たないため、アクセスできるようにする必要がある。権限を変更したファイルは差分としてGitに認識されるため、これを共有すればチーム内で権限変更を共有できる。

```bash
# Failed to open stream: Permission denied
$ chmod -R 777 /var/www/foo/storage
```

#### ▼ PHP-FPMのログについて

LaravelとPHP-FPMのプロセスはそれぞれ独立しているため、Laravelのログの出力先を変更しても、PHP-FPMのログの出力先は変更されない。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_middleware_application_gi_fastcgi_php_fpm.html

#### ▼ ```stack```キー

他の単一/複数のチャンネルを利用するチャンネル。

```php
<?php
    
return [

    ...    

    "default"  => env("LOG_CHANNEL", "stack"),
    "channels" => [
        "stack" => [
            "driver"            => "stack",
            // 複数チャンネルを設定できる。（例）["single", "stack"]
            "channels"          => ["single"],
            "ignore_exceptions" => false,
        ],

        ...

    ]
];
```

#### ▼ ```single```キー

全てのログを```/storage/logs/laravel.log```ファイルに対して出力する。

```php
<?php

return [

    ...    

    "default"  => env("LOG_CHANNEL", "stack"),
    "channels" => [
        "daily" => [
            "driver" => "daily",
            "path"   => storage_path("logs/laravel.log"),
            "level"  => env("LOG_LEVEL", "debug"),
            "days"   => 14,
        ],

        ...

    ]
];
```

#### ▼ ```daily```キー

全てのログを```/storage/logs/laravel-<日付>.log```ファイルに対して出力する。

```php
return [

    ...    

    "default"  => env("LOG_CHANNEL", "stack"),
    "channels" => [
        "stderr" => [
            "driver"    => "monolog",
            "handler"   => StreamHandler::class,
            "formatter" => env("LOG_STDERR_FORMATTER"),
            "with"      => [
                "stream" => "php://stderr",
            ],
        ],

        ...

    ]
];
```

#### ▼ ```stderr```キー

全てのログを標準エラー出力に対して出力する。Docker上でLaravelを稼働させる場合は、作成されるログファイルでコンテナのサイズが肥大化することを防ぐために、これを選択する。注意点として、独自カスタマイズとして、```stream```キーをstdout変更すれば、標準出力にログを出力もできる。

```php
return [

    ...

    "default"  => env("LOG_CHANNEL", "stack"),
    "channels" => [
        "stderr" => [
            "driver"    => "monolog",
            "handler"   => StreamHandler::class,
            "formatter" => env("LOG_STDERR_FORMATTER"),
            "with"      => [
                "stream" => "php://stderr",
            ],
        ],

        ...

    ]
];
```

<br>

### ログの出力

#### ▼ ```error```メソッド

エラーメッセージを定義する時、```sprintf```メソッドを使用すると便利である。

**＊実装例＊**

外部のAPIに対してリクエストを送信し、データを取得する。取得したJSONデータを、クライアントにレスポンスする。この時、リクエスト処理のために、Guzzleパッケージを使用している。

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\Response;

class FooController extends Controller
{
    public function index()
    {
        $client = new Client();
        $requestUrl = config("api.foo.endpoint_url");

        try {

            $response = $client->request(
                "GET",
                $requestUrl,
                [
                    "headers" => [
                        "Content-Type" => "application/json",
                        "X-API-Key"    => "api.foo.api_key",
                    ]
                ]
            );

            // JSONをクライアントにレスポンス
            return $response->getBody()
                ->getContents();

        } catch (GuzzleException $e) {

            Log::error(sprintf(
                    "%s : %s at %s line %s",
                    get_class($e),
                    $e->getMessage(),
                    $e->getFile(),
                    $e->getLine())
            );

            return response()->json(
                [],
                $e->getCode()
            );
        }
    }
}
```

```php
<?php

return [
    "foo" => [
        "endpoint_url" => env("ENDPOINT_URL", ""),
        "api_key"      => env("API_KEY"),
    ],
    "bar" => [
        "endpoint_url" => env("ENDPOINT_URL", ""),
        "api_key"      => env("API_KEY"),
    ]
];
```

#### ▼ ```info```メソッド

<br>


## 12. Migration

### テーブルの作成/削除

#### ▼ ```up```メソッド、```down```メソッド

コマンドによるマイグレーション時にコールされる。```up```メソッドでテーブル、カラム、インデックスのCREATEを実行する。```down```メソッドで```up```メソッドの結果をロールバックする。

**＊実装例＊**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFooTable extends Migration
{
    /**
     * @return void
     */
    public function up()
    {
        Schema::create("foos", function (Blueprint $table) {
            
            $table->bigIncrements("foo_id")->comment("ID");
            $table->string("name")->comment("名前");

            // MigrationMacroServiceProviderのメソッドを使用する。
            $table->systemColumns();

            // deleted_atカラムを追加する。
            $table->softDeletes();
        });
    }

    /**
     * @return void
     */
    public function down()
    {
        Schema::drop("foos");
    }
}
```

<br>

### カラムの追加/変更/削除

#### ▼ なし

指定したカラムを追加する。

**＊実装例＊**

カラムを追加するためだけにマイグレーションファイルを作成する。

```bash
$ php artisan make:migration add_column --table=foos
```

追加したいカラムのみを定義する。

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddColumn extends Migration
{
    /**
     * @return void
     */
    public function up()
    {
        Schema::table('foos', function (Blueprint $table) {
            $table->string('foo_name');
        });
    }
}
```

マイグレーションを実行すると、指定したテーブルのカラムが追加される。実行後は、作成したマイグレーションファイルを削除する。

```bash
$ php artisan migrate
```

#### ▼ ```renameColumn```メソッド

指定したカラムの名前を変更する。

**＊実装例＊**

カラム名を変更するためだけにマイグレーションファイルを作成する。

```bash
$ php artisan make:migration rename_column --table=foos
```

テーブルのカラム名を定義し、```renameColumn```メソッドをコールする。変更後でも、ロールバックできるように、```down```メソッドも定義しておく。

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RenameColumn extends Migration
{
    /**
     * @return void
     */
    public function up()
    {
        Schema::table('foos', function (Blueprint $table) {
            $table->renameColumn('id', 'foo_id');
        });
    }

    /**
     * @return void
     */
    public function down()
    {
        // データ型の変更後でも、ロールバックできるようにしておく。
        Schema::table('foos', function (Blueprint $table) {
            $table->renameColumn('foo_id', 'foo_id');
        });
    }
}
```

マイグレーションを実行すると、指定したテーブルのカラム名が変更される。実行後は、作成したマイグレーションファイルを削除する。

```bash
$ php artisan migrate
```

#### ▼ ```change```メソッド

指定したカラムのデータ型を変更する。

**＊実装例＊**

データ型を変更するためだけにマイグレーションファイルを作成する。

```bash
$ php artisan make:migration change_column_data_type --table=foos
```

テーブルのカラムのデータ型を定義し、```change```メソッドをコールする。変更後でも、ロールバックできるように、```down```メソッドも定義しておく。

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangeColumnDataType extends Migration
{
    /**
     * @return void
     */
    public function up()
    {
        Schema::table('foos', function (Blueprint $table) {
            $table->integer('bar')->change();
        });
    }

    /**
     * @return void
     */
    public function down()
    {
        // データ型の変更後でも、ロールバックできるようにしておく。
        Schema::table('foos', function (Blueprint $table) {
            $table->string('bar')->change();
        });
    }
}
```

マイグレーションを実行すると、指定したテーブルのカラムのデータ型が変更される。実行後は、作成したマイグレーションファイルを削除する。

```bash
$ php artisan migrate
```

#### ▼ ```dropColumn```メソッド

指定したカラムを削除する。

**＊実装例＊**

カラムを削除するためだけにマイグレーションファイルを作成する。

```bash
$ php artisan make:migration drop_column --table=foos
```

削除するカラムを```dropColumn```メソッドで指定する。変更後でも、ロールバックできるように、```down```メソッドも定義しておく。

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class DropColumn extends Migration
{
    /**
     * @return void
     */
    public function up()
    {
        Schema::table('foos', function (Blueprint $table) {
            $table->dropColumn('foo_name');
        });
    }

    /**
     * @return void
     */
    public function down()
    {
        Schema::table('foos', function (Blueprint $table) {
            $table->string('foo_name');
        });
    }
}
```

マイグレーションを実行すると、指定したテーブルのカラムが追加される。実行後は、作成したマイグレーションファイルを削除する。

```bash
$ php artisan migrate
```

<br>

### よく使用するカラムタイプ

#### ▼ ```bigIncrements```メソッド

自動増分ありのinteger型カラムを作成する。プライマリーキーとするIDカラムのために使用する。自動増分のカラムは```1```個のテーブルに1つしか定義できず、他のIDカラムは```unsignedBigInteger```メソッドを使用して定義する。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/migrations.html#column-method-bigIncrements

**＊実装例＊**

```php
Schema::create("foos", function (Blueprint $table) {
    
    ...
    
    $table->bigIncrements("foo_id");
    
    ...
    
});
```

#### ▼ ```unsignedBigInteger```メソッド

自動増分なしのinteger型カラムを作成する。プライマリーキーではないIDカラムのために使用する。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/migrations.html#column-method-unsignedBigInteger

```php
Schema::create("foos", function (Blueprint $table) {
    
    ...
    
    $table->bigIncrements("foo_id");
    $table->unsignedBigInteger("bar_id");
    
    ...
    
});
```

#### ▼ ```string```メソッド

VARCHAR型カラムを作成する。

**＊実装例＊**

```php
Schema::create("foos", function (Blueprint $table) {
  
    ...    
    
    $table->string("name");
    
    ...
    
});
```

#### ▼ ```timestamp```メソッド

TIMESTAMP型カラムを作成する。

**＊実装例＊**

```php
Schema::create("foos", function (Blueprint $table) {
    
    ...
    
    $table->timestamp("created_at");
    
    ...
});
```

<br>

## 13. Notification

### artisanコマンド

```bash

```

<br>

### 通知内容

#### ▼ Notification

通知内容を定義する。```via```メソッドで受信チャンネルを定義する。この時、Laravelがデフォルトで用意しているチャンネル（Mail、SMS、Slackチャンネル、Databaseチャンネル）以外に送信したい場合、Channelクラスを定義する必要がある。複数の値を設定した場合は、それぞれに通信が送信される。```toMail```メソッド、```toSms```メソッド、```toSlack```メソッド、```toArray```メソッド、を使用して、Laravelの標準のチャンネルに渡す通知内容を定義できる。

**＊実装例＊**

```php
<?php

namespace App\Notifications;

use App\Models\User;
use App\Notifications\Channels\EmailChannel;
use App\Notifications\Channels\AwsSnsChannel;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TfaTokenNotification extends Notification
{
    /**
     * @param $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        // 受信チャンネルを選択します。
    }

    /**
     * @param $notifiable
     * @return string
     */
    public function toSms($notifiable)
    {
        // SMSのメッセージ内容を返却します。
    }

    /**
     * @param $notifiable
     * @return MailMessage
     */
    public function toMail($notifiable)
    {
        // Emailのメッセージ内容を返却します。
    }

    /**
     * @param $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        // DBへの保存方法を返却します。
    }
}
```

#### ▼ Eメール通知内容の定義

MailMessageクラスのメソッドを使用して、Eメール通知の内容を作成する。```markdown```メソッドを使用することにより、マークダウン形式で定義できる。

> ℹ️ 参考：
>
> - https://readouble.com/laravel/8.x/ja/notifications.html#writing-the-message
> - https://laravel.com/api/8.x/Illuminate/Notifications/Messages/MailMessage.html#method_markdown

```php
<?php

namespace App\Notifications;

use App\Models\User;
use App\Notifications\Channels\EmailChannel;
use App\Notifications\Channels\AwsSnsChannel;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TfaTokenNotification extends Notification
{
    /**
     * @param $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return [
            $notifiable->prefers_sms ? [AwsSnsChannel::class] : [EmailChannel::class], // SMSでない場合は、Eメール通知とします。
            'database'
        ];
    }

    /**
     * @param $notifiable
     * @return MailMessage
     */
    public function toMail($notifiable)
    {
        // Emailのメッセージ内容を返却します。
        return (new MailMessage())->subject("コードを送信いたしました。")
            ->markdown("template.mail", [
                "tfa_token" => $notifiable->tfaToken()
            ]);
    }
}
```

```html
@component("mail::message")

認証コード『{ $tfa_token }}』を入力して下さい。<br>

+++++++++++++++++++++++++++++++++++++<br>
本アドレスは送信専用です。ご返信頂いてもお答えできませんので、ご了承ください。

@endcomponent
```

#### ▼ SMS通知内容の定義

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/notifications.html#formatting-sms-notifications

```php
<?php

namespace App\Notifications;

use App\Models\User;
use App\Notifications\Channels\EmailChannel;
use App\Notifications\Channels\AwsSnsChannel;
use Illuminate\Notifications\Notification;

class TfaTokenNotification extends Notification
{
    /**
     * @param $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return [
            $notifiable->prefers_sms ? [AwsSnsChannel::class] : [EmailChannel::class], // SMSの場合は、AWS-SNSを使用します。
            'database'
        ];
    }

    /**
     * @param $notifiable
     * @return string
     */
    public function toSms($notifiable)
    {
        // SMSのメッセージ内容を返却します。
        return view("template.sms", [
            "subject"   => "コードを送信いたしました。",
            "tfa_token" => $notifiable->tfaToken()
        ]);
    }  
}
```

#### ▼ Slack通知内容の定義

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/notifications.html#formatting-slack-notifications

#### ▼ DB通知内容の定義

配列でDBに保存する内容を定義する。

> ℹ️ 参考：https://readouble.com/laravel/7.x/ja/notifications.html#database-notifications

```php
<?php

namespace App\Notifications;

use App\Models\User;
use App\Notifications\Channels\EmailChannel;
use App\Notifications\Channels\AwsSnsChannel;
use Illuminate\Notifications\Notification;

class TfaTokenNotification extends Notification
{
    /**
     * @param $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return [
            $notifiable->prefers_sms ? [AwsSnsChannel::class] : [EmailChannel::class],
            'database' // DB受信チャンネル
        ];
    }
    
    /**
     * @param $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        // notificationsテーブルのdataカラムに、JSONで保存されます。
        return [
            "tfa_token" => $notifiable->tfaToken(),
        ];
    }
}
```

<br>

### 受信チャンネル（通知方法）

#### ▼ Channel

Laravelがデフォルトで用意しているチャンネル以外に送信したい場合、独自の受信チャンネルを定義する。これは、Notificationクラスの```via```メソッドで使用される。

**＊実装例＊**

AWS SNSを受信チャンネルとする。AWSから配布されているパッケージが必要である。

```bash
$ composer require aws/aws-sdk-php-laravel
```

```php
<?php

namespace App\Notifications\Channels;

use Aws\Sns\SnsClient;
use Aws\Exception\AwsException;
use Illuminate\Notifications\Notification;

class AwsSnsChannel
{
    /**
     * @param SnsClient $awsSnsClient
     */
    public function __construct(SnsClient $awsSnsClient)
    {
        $this->awsSnsClient = $awsSnsClient;
    }

    /**
     * @param              $notifiable
     * @param Notification $notification
     */
    public function send($notifiable, Notification $notification)
    {
        try {
            $message = $notification->toSms($notifiable);

            // AWS SNSにメッセージを送信します。
            $this->awsSnsClient->publish([
                "Message"     => $message,
                "PhoneNumber" => $this->toE164nizeInJapan(
                    $notifiable->phoneNumber()
                ),
            ]);
        } catch (AwsException $e) {

            Log::error(sprintf(
                    "%s : %s at %s line %s",
                    get_class($e),
                    $e->getMessage(),
                    $e->getFile(),
                    $e->getLine())
            );

            throw new AwsException($e->getMessage());
        }
    }

    /**
     * @param string
     * @return string
     */
    private function toE164nizeInJapan(string $phoneNumeber): string
    {
        // E.164形式の日本電話番号を返却します。
        return "+81" . substr($phoneNumeber, 1);
    }
}
```

<br>

### 通知対象モデル

#### ▼ Notifiableトレイトの```notify```メソッド

通知対象となるモデルを定義する。Notifiableトレイトを継承する。これにより、```notify```メソッドを使用できるようになる。

> ℹ️ 参考：https://laravel.com/api/8.x/Illuminate/Notifications/Notifiable.html

```php
<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;
}
```

通知先のクラスから```notify```メソッドをコールし、任意のNotificationクラスを渡す。これにより、通知処理が実行される。

> ℹ️ 参考：https://laravel.com/api/8.x/Illuminate/Notifications/RoutesNotifications.html#method_notify

```php
<?php

$user->notify(new FooNotification());
```

#### ▼ Notificationファサード

通知対象となるモデルを定義する。Notifiableトレイトを継承する。

```php
<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;
}
```

Notificationファサードに通知先のモデルと通知クラスを渡す。

```php
<?php

Notification::send($users, new FooNotification());
```

#### ▼ オンデマンド通知

オンデマンド通知を使用すると、通知対象となるモデルがNotificableトレイトに依存せずに通知を実行できる。

> ℹ️ 参考：
>
> - https://laracasts.com/discuss/channels/laravel/notifications-without-eloquent-user-model
> - https://readouble.com/laravel/8.x/ja/notifications.html#on-demand-notifications

```php
<?php

Notification::route('mail', $user->email_address)
            ->route('nexmo', $user->phone_number)
            ->route('slack', $slackMessage->usl)
            ->notify(new FooMotification());
```

<br>

## 14. Resource

### レスポンスデータ作成前のデータ型変換

#### ▼ データ型変換の必要性

EloquentモデルをJSONデータとしてレスポンスする時に、一旦、配列データに変換する必要がある。

#### ▼ 単一のEloquentモデルの配列化

単一のEloquentモデルを配列に変換する。Resourceクラスの```toArray```メソッドにて、```this```変数は自身ではなく、Resourceクラス名につくEloquentモデル名になる。また、```this```変数からゲッターを経由せずに直接的にプロパティにアクセスできる。Controllerにて、ResouceクラスにEloquentモデルを渡すようにする。LaravelはレスポンスのJSONデータを作成するために、まず```toArray```メソッドにより配列化し、加えてこれをJSONデータに変換する。

**＊実装例＊**

Fooクラスからデータを取り出し、配列化する。

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FooJsonResource extends JsonResource
{
    /**
     * オブジェクトを配列に変換します。
     *
     * @param  Request
     * @return array
     */
    public function toArray($request)
    {
        return [
            "id"       => $this->id,
            "name"     => $this->name,
        ];
    }
}。
```

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * クライアントにデータを返却します。
     *
     * @param  Request  $request
     * @return Response
     */
    public function index(Request $request)
    {
        // ここに、EloquentモデルをDBから取得する処理
        
        // Eloquentモデルを渡す。
        return new FooResource($foo);
    }
}
```

#### ▼ 複数のEloquentモデル（Collection型）の配列化

複数のEloquentモデル（Collection型）を配列に変換する。

```php
// ここに実装例
```

<br>

## 15. Routing

### ```api.php```ファイル

#### ▼ Middlewareの適用

APIのエンドポイントとして働くルーティング処理を実装する。実装したルーティング処理時には、Kernelクラスの```middlewareGroups```プロパティの```api```キーで設定したミドルウェアが実行される。APIのエンドポイントは外部公開する必要があるため、```web```キーと比較して、セキュリティのためのミドルウェアが設定されていない。

```php
<?php

namespace App\Http;

use App\Http\Middleware\BeforeMiddleware\FooIdConverterMiddleware;
use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    // 〜 中略 〜
    
    /**
     * The application"s route middleware groups.
     *
     * @var array
     */
    protected $middlewareGroups = [

        // 〜 中略 〜

        "api" => [
            "throttle:60,1",
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];
    
    // 〜 中略 〜
}
```

<br>

### ```web.php```ファイル

#### ▼ Middlewareの適用

API以外のルーティング処理を実装する。実装したルーティング処理時には、Kernelクラスの```middlewareGroups```プロパティの```web```キーで設定したミドルウェアが実行される。API以外のルーティングは外部公開する必要がないため、```api```キーと比較して、セキュリティのためのミドルウェアが多く設定されている。例えば、CSRF対策のためのVerifyCsrfTokenクラスがある。

```php
<?php

namespace App\Http;

use App\Http\Middleware\BeforeMiddleware\FooIdConverterMiddleware;
use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    // 〜 中略 〜
    
    /**
     * @var array
     */
    protected $middlewareGroups = [
        "web" => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            // \Illuminate\Session\Middleware\AuthenticateSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
        
        // 〜 中略 〜
        
    ];
    
    // 〜 中略 〜
}
```

<br>

### ```guest.php```ファイル

ヘルスチェックなど、API認証が不要なルーティング処理を実装する。

<br>

### 暗黙のモデル結合

#### ▼ コントローラー使用時

ルーティング時に使用するパラメーター名とコントローラーのメソッドの引数型と変数名が同じであり、かつパラメーターに数値が割り当てられた場合、その数値をIDとするEloquentモデルが自動的にインジェクションされる。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/routing.html#implicit-binding

**＊実装例＊**

ルーティング時に、パスパラメーター名を```user```としておく。

```php
<?php
    
Route::get('/users/{user}', 'UserController@index');
```

かつ、コントローラーのメソッドの引数型/変数名を```User```/```$user```とする。または。この時、『```/users/1```』に対してリクエストを送信すると、ユーザーIDが```1```のユーザーがDBから読み出され、コントローラーにインジェクションされる。

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    /**
     * @param User $user
     */
    public function index(User $user)
    {
        $id = $user->id; // パスパラメーターのidに紐付くユーザーが自動的に渡されている。
    }
}
```

<br>

## 16. Security

### CSRF対策

#### ▼ アプリケーション側の対応

セッション開始時にCSRFトークンが作成される。Bladeを使用してサーバ側のCSRFトークンを取り出し、inputタグのhidden属性にCSRFトークンを割り当て送信する。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/csrf.html

```html
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

Bladeを使用しない場合、セッション開始時のレスポンスの```Set-Cookie```にCSRFトークンが割り当てられるため、これを取り出して```X-CSRF-TOKEN```ヘッダーや```X-XSRF-TOKEN```ヘッダーに割り当てるようにする。リクエストのたびに異なるCSRFトークンがレスポンスされ、これを次のリクエストで使用する必要がある。

> ℹ️ 参考：
>
> - https://readouble.com/laravel/8.x/ja/csrf.html#csrf-x-csrf-token
> - https://readouble.com/laravel/8.x/ja/csrf.html#csrf-x-xsrf-token
> - https://stackoverflow.com/questions/42408177/what-is-the-difference-between-x-xsrf-token-and-x-csrf-token

#### ▼ HTTPクライアントツール側の対応

PostmanなどのHTTPクライアントツールをフロントエンドの代わりに使用する場合は、レスポンスで返信されるCSRFトークを扱えない、そこで、各リクエストで事前にルートパスのエンドポイントをコールし、CSRFトークンをPostmanの環境変数に保存するようなスクリプトを設定しておくと良い。

```javascript
if (pm.request.method == 'GET') {
    return true;
}

return pm.sendRequest("http://127.0.0.1:8000", (error, response, {cookies}) => {
    
    if (error) {
        console.error(error);
        return false;
    }

    const xsrfTokenHeader = cookies.one("XSRF-TOKEN");

    if (!xsrfTokenHeader) {
        console.log("トークンがありません");
        return false;
    }

    // laravelによってエンコードされたトークンをデコードする。
    const xsrfToken = decodeURIComponent(xsrfTokenHeader['value']);
    // 環境変数を挿入するために、該当する実行環境名をCollection全体に適用しておく必要がある。
    pm.environment.set('XSRF_TOKEN', xsrfToken);
    console.log(xsrfToken);
    return true;
});
```

#### ▼ XSS対策

#### ▼ 常時HTTPS化

<br>

## 17. Seeder

### 初期データの定義

#### ▼ DBファサードによる定義

DBファサードを使用して、初期データを定義する。

```php
<?php

use Illuminate\Database\Seeder;
use App\Constants\ExecutorConstant;

class ProductsSeeder extends Seeder
{
    /**
     * Seederを実行します。
     *
     * @return void
     */
    public function run()
    {
        DB::table("products")->insert([
                "product_name" => "シャープペンシル",
                "price"        => 300,
                "product_type" => 1,
                "created_by"   => ExecutorConstant::ARTISAN_COMMAND,
                "updated_by"   => ExecutorConstant::ARTISAN_COMMAND,            
                "created_at"   => NOW(),
                "updated_at"   => NOW(),
                "deleted_at"   => NULL
            ],
            [
                "product_name" => "ノート",
                "price"        => 200,
                "product_type" => 2,
                "created_by"   => ExecutorConstant::ARTISAN_COMMAND,
                "updated_by"   => ExecutorConstant::ARTISAN_COMMAND,            
                "created_at"   => NOW(),
                "updated_at"   => NOW(),
                "deleted_at"   => NULL                
            ],            
            [
                "product_name" => "消しゴム",
                "price"        => 100,
                "product_type" => 3,
                "created_by"   => ExecutorConstant::ARTISAN_COMMAND,
                "updated_by"   => ExecutorConstant::ARTISAN_COMMAND,            
                "created_at"   => NOW(),
                "updated_at"   => NOW(),
                "deleted_at"   => NULL                
            ],
            
            ...
            
        ]);
    }
}
```

実行者名は、定数として管理しておくと良い。

```php
<?php

namespace App\Constants;

/**
 * 実行者定数クラス
 */
class ExecutorConstant
{
    /**
     * Artisanコマンド
     */
    public const ARTISAN_COMMAND = "Artisan Command";

    /**
     * スタッフ
     */
    public const STAFF = "Staff";
    
    /**
     * ゲスト
     */
    public const GUEST = "Guest";    
}
```

#### ▼ CSVファイルによる定義

CSVファイルを使用して、初期データを定義する。DBファサードを使用するよりも。大サイズのデータを定義しやすい。この時、```LOAD DATA LOCAL INFILE```文を使用すると、高速で処理できる。

> ℹ️ 参考：https://i-407.com/blog/tech/n3/

```php
<?php

use Illuminate\Database\Seeder;
use App\Constants\ExecutorConstant;

class ProductsSeeder extends Seeder
{
    /**
     * Seederを実行します。
     *
     * @return void
     */
    public function run()
    {
        // 〜 中略 〜 
    
        $this->importCsv();
        
        // 〜 中略 〜 
    }

    /**
     * CSVを読み込んでDBにデータを保存します。
     */
    private function importCsv(): void
    {
        foreach ($this->tables as $table) {
        
            // S3に保存してあるCSVファイルを読み込む。
            $csv = \Storage::get(migrations/csv/ . $table . '.csv');
            
            // 一時CSVファイルに書き込む。
            file_put_contents('/tmp/csv', $csv);

            // 一時ファイルを使用して、DBにCSVファイルの中身を書き込む。
            \DB::statement(
                "LOAD DATA LOCAL INFILE '/tmp/csv'
                INTO TABLE {$table}
                FIELDS terminated by ','
                ENCLOSED BY '\"'
                ESCAPED BY '\\\'
                LINES TERMINATED BY '\n'
                IGNORE 1 LINES"
            );
        }
    }
}
```

<br>

### Seederの実行

DatabaseSeederにて、全てのSeederをまとめて実行する。

```php
<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seederを実行します。
     *
     * @return void
     */
    public function run()
    {
        // 開発環境用の初期データ
        if (App::environment("local")) {
            $this->call([
                // ダミーデータ
            ]);
        }
        
        // テスト環境用の初期データ
        if (app()->environment("tes")) {
            $this->call([
                // リアルデータ
            ]);
        }
        
        // ステージング環境用の初期データ
        if (App::environment("stg")) {
            $this->call([
                // リアルデータ
                ProductsSeeder::class
            ]);
        }
        
        // 本番環境用の初期データ
        if (App::environment("prd")) {
            $this->call([
                // リアルデータ
                ProductsSeeder::class
            ]);
        }
    }
}
```

<br>

## 18. ServiceProvider

### ServiceProvider

#### ▼ ServiceProviderの用途

| 用途の種類                                                  | 説明                                                                       |
|------------------------------------------------------------|--------------------------------------------------------------------------|
| AppServiceProvider                                         | ・ServiceContainerへのクラスのバインド（登録）<br>・ServiceContainerからのインスタンスのリゾルブ（作成） |
| MacroServiceProvider                                       | ServiceContainerへのメソッドのバインド（登録）                                          |
| RouteServiceProvider<br>（```app.php```、```web.php```も使用） | ルーティングとコントローラーの対応関係の定義                                               |
| EventServiceProvider                                       | EventListenerとEventhandler関数の対応関係の定義                               |

#### ▼ ServiceProviderのコール

クラスの名前空間を、```config/app.php```ファイルの```providers```配列に登録すると、アプリケーションの起動時にServiceProviderをコールできるため、ServiceContainerへのクラスのバインドが自動的に完了する。

**＊実装例＊**

```php
<?php

"providers" => [
    
    // 複数のServiceProviderが実装されている

    App\Providers\ComposerServiceProvider::class,
],
```

<br>

### ServiceContainer

#### ▼ ServiceContainer、バインド、リゾルブとは

ServiceContainer、バインド、リゾルブについては、以下のリンクを参考にせよ。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_php_class_based.html

```php
<?php

namespace Illuminate\Contracts\Container;

use Closure;
use Psr\Container\ContainerInterface;

interface Container extends ContainerInterface
{
    /**
     * 通常のバインディングとして、自身にバインドする。
     * 第二引数は、クロージャー、もしくはクラス名前空間
     *
     * @param  string  $abstract
     * @param  \Closure|string|null  $concrete
     * @param  bool  $shared
     * @return void
     */
    public function bind($abstract, $concrete = null, $shared = false);
    
    /**
     * singletonとして、自身にバインドする。
     *
     * @param  string  $abstract
     * @param  \Closure|string|null  $concrete
     * @return void
     */
    public function singleton($abstract, $concrete = null);
}
```

<br>

### AppServiceProvider

#### ▼ 単一のクラスをバインド/リゾルブ

AppSeriveProviderにて、ServiceContainerにクラスをバインドすることによって、ServiceContainerがインスタンスをリゾルブできるようになる。これにより、メソッドの引数でクラスを指定しさえすれば、そのクラスのインスタンスが渡されるため、自動的に依存オブジェクト注入が実行されたことになる。Laravelでは、クラスはServiceContainerに自動的にバインドされており、引数でクラスを指定するのみでインスタンスが作成されるため、以下の実装を実行する必要はない。ただし、混合型の場合は引数の型を指定できないため、リゾルブは実行できない。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/container.html#automatic-injection

**＊実装例＊**

バインドする。注意点として、Laravelでは不要である。

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Bar;
use App\Models\Baz;
use App\Models\Foo;

class FooServiceProvider extends ServiceProvider
{
    /**
     * コンテナにバインド
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(Foo::class, function ($app) {
            return new Foo(new Bar, new Baz);
        });
    }
}
```

引数の型を元に、クラスのインスタンスがリゾルブされる。

```php
<?php

class Qux
{
    /**
     * @param Foo $foo
     */
    public function method(Foo $foo) // リゾルブされる。
    {
        $foo->bar;
        $foo->baz;
    }
}
```

引数の型を指定しない場合は、手動で渡す必要がある。

```php
<?php

use App\Models\Foo;

class Qux
{
    /**
     * @param Foo $foo
     */
    public function __construct($foo) // 引数の型を指定しない場合、リゾルブされない。
    {
        $foo->bar;
        $foo->baz;
    }
}

$foo = new Foo();
$qux = new Qux($foo); // 手動で渡す
```

混合型の場合は、引数の型を指定できないため、リゾルブを実行できない。

```php
<?php

use App\Models\Foo1;
use App\Models\Foo2;
use App\Models\Foo3;

class Qux
{
    /**
     * @param Foo1|Foo2|Foo3 $mixed
     */
    public function __construct($mixed) // 混合型では引数の型を指定できない
    {
        $mixed->bar;
        $mixed->baz;
    }
}

$foo1 = new Foo1();
$foo2 = new Foo2();
$foo3 = new Foo3();

$qux = new Qux($foo1);
```

#### ▼ 複数のクラスをバインド/リゾルブ

メソッドの引数でクラスを指定しさえすれば、そのクラスのインスタンスが渡されるため、自動的に依存オブジェクト注入が実行されたことになる。

**＊実装例＊**

```php
<?php

namespace App\Providers;

use App\Models\Foo\Entities;
use App\Models\Bar;
use App\Models\Baz;
use Illuminate\Support\ServiceProvider;

class FoosServiceProvider extends ServiceProvider
{
     /**
     * 各registerメソッドをコール
     *
     * @return void
     */
    public function register()
    {
        $this->registerFoo();
        $this->registerBar();
        $this->registerBaz();
    }
    
    /**
    * 1つ目のクラスをバインド
    */
    private function registerFoo()
    {
        $this->app->bind(Foo::class, function ($app) {
            return new Foo();
        });
    }
    
    /**
    * 2つ目のクラスをバインド
    */    
    private function registerBar()
    {
        $this->app->bind(Bar::class, function ($app) {
            return new Bar();
        });
    }
    
    /**
    * 3つ目のクラスをバインド
    */
    private function registerBaz()
    {
        $this->app->bind(Baz::class, function ($app) {
            return new Baz();
        });
    }
}
```

#### ▼ インターフェースをバインドし、実装クラスをリゾルブ

Laravelではクラスが自動的にバインドされ、これのインスタンスがリゾルブされる、しかし、バインドされたクラスとは別のクラスのインスタンスをリゾルブしたい場合は、ServiceProviderにそれを定義すれば、自動的なバインドを上書きできる。これを使用して、インターフェースをバインドし、実装クラスをリゾルブできるようにする。この方法は、上位レイヤーが抽象に依存することが必要な場面（例：依存性逆転の原則）で役立つ。

**＊実装例＊**

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domain\FooRepository as FooRepositoryInterface;
use App\Infrastructure\FooRepository;

class FooServiceProvider extends ServiceProvider
{
    /**
     * コンテナにバインド
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(
            "App\Domain\Foo\Repositories\FooRepositoryInterface", // インターフェース
            "App\Infrastructure\Doo\Repositories\FooRepository" // 実装クラス
        );
    }
}
```

```php
<?php

class Interactor
{
    /**
     * @var FooRepositoryIF 
     */
    private FooRepositoryIF $fooRepository;
    
    /**
     * @param FooRepositoryIF $fooRepository
     */
    public function __constructor(FooRepositoryIF $fooRepository) // リゾルブされる。
    {
        $this->fooRepository = $fooRepository;
    }
}
```

#### ▼ ```make```メソッド

引数の型でリゾルブを実行する以外に、```make```メソッドも使用できる。```make```メソッドの引数にクラスの名前空間を渡すことにより、インスタンスがリゾルブされる。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/container.html#the-make-method

**＊実装例＊**

```php
<?php

class Foo
{
    public function method()
    {
        return "foo";
    }
}

// Fooクラスをリゾルブし、そのままmethodをコール
$result = app()->make(Foo::class)
    ->method();

// Fooクラスをリゾルブ
$foo = App::make(Foo::class);
$result = $foo->method();
```

#### ▼ ```register```メソッドと```boot```メソッドの違い

Laravelのライフサイクルで、ServiceContainerへのクラスのバインドの時には、まずServiceProviderの```register```メソッドが実行され、その後に```boot```メソッドが実行される。そのため、ServiceProviderが他のServiceProviderをコールするような処理を実装したいとき、これは```boot```メソッドに実装することが適している。

<br>

### MigrationMacroServiceProvider

複数のテーブルに共通のカラムを作成するマイグレーション処理を提供する。

```php
<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\ServiceProvider;

/**
 * マイグレーションマクロサービスプロバイダクラス
 */
class MigrationMacroServiceProvider extends ServiceProvider
{
    /**
     * サービスコンテナにマイグレーションメソッドをバインドします。
     *
     * @return void
     */
    public function register()
    {
        Blueprint::macro("systemColumns", function () {
            $this->string("created_by")
                ->comment("レコードの作成者")
                ->nullable();
            $this->string("updated_by")
                ->comment("レコードの最終更新者")
                ->nullable();
            $this->timestamp("created_at")
                ->comment("レコードの作成日")
                ->nullable();
            $this->timestamp("updated_at")
                ->comment("レコードの最終更新日")
                ->nullable();
            $this->timestamp("deleted_at")
                ->comment("レコードの削除日")
                ->nullable();
        });
        
        Blueprint::macro("dropSystemColumns", function () {
            $this->dropColumn(
                "created_by",
                "updated_by",                
                "created_at",
                "updated_at",
                "deleted_at"
            );
        });        
    }
}
```

マイグレーションファイルにて、定義した```systemColumn```メソッドをコールする。

```php
<?php
  
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFooTable extends Migration
{
    /**
     * マイグレート
     *
     * @return void
     */
    public function up()
    {
        Schema::create("foos", function (Blueprint $table) {
            $table->bigIncrements("foo_id")
                ->comment("ID");
            $table->string("name")
                ->comment("名前");
            
            // MigrationMacroServiceProviderのメソッドを使用する。
            $table->systemColumns();
            
            // deleted_atカラムを追加する。
            $table->softDeletes();
        });
    }

    /**
     * ロールバック
     *
     * @return void
     */
    public function down()
    {
        Schema::drop("foos");
    }
}
```

最後に、```app.php```ファイルにて、MigrationMacroServiceProviderを新しく読み込む。

```php
<?php

return [
    
    ...
    
    'providers' => [
        // マクロサービスプロバイダー
        App\Providers\MigrationMacroServiceProvider::class,  
    ],
    
    ...
    
];        
```



<br>

### RouteServiceProvider

#### ▼ 全てのルーティングへの処理

ルーティングの設定ファイルをコールする。また、全てのルーティングに適用する処理を定義する。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/routing.html#parameters-global-constraints

**＊実装例＊**

```php
<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * ルーティングの設定ファイルをコールします。
     *
     * @return void
     */
    public function boot()
    {
        // ヘルスチェック
        Route::prefix('api')
            ->middleware('api')
            ->namespace($this->namespace)
            ->group(base_path('routes/healthcheck.php'));

        // API
        Route::prefix('api')
            ->middleware('api')
            ->namespace($this->namespace)
            ->group(base_path('routes/api.php'));
    }
}
```

#### ▼ リクエスト数制限

```1```分間当たりに許容するリクエスト数とその制限名を```configureRateLimiting```メソッドで定義する。加えて、Throttleミドルウェアに制限名を渡し、指定したルートにリクエスト数制限を適用させる、もし制限を超えた場合、```configureRateLimiting```メソッドによって、```429```ステータスでレスポンスが返信される。

> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/routing.html#rate-limiting

**＊実装例＊**

```php
<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * @var array
     */
    protected $middlewareGroups = [

        'web' => [
        ],

        'api' => [
            // throttleミドルウェアを適用する。
            'throttle:limit_per_minute',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    /**
     * @return void
     */
    public function configureRateLimiting()
    {
        RateLimiter::for('limit_per_minute', function (Request $request) {
            // 一分間当たり1000リクエストまでを許可する。
            return Limit::perMinute(1000);
        });
    }
}
```



<br>

### EventServiceProvider

#### ▼ EventとListenerの登録

EventとListenerの対応関係を定義する。注意点として、Eventを発火させてListenerを実行する方法は、Eventコンポーネントを参考にせよ。

```php
<?php

namespace App\Providers;

use App\Events\UpdatedModelEvent;
use App\Listeners\UpdatedModelListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * イベントとリスナーの対応関係を配列で定義します。
     * [イベント => リスナー]
     *
     * @var array
     */
    protected $listen = [
        // Eloquentモデル更新イベント
        UpdatedModelEvent::class => [
            UpdatedModelListener::class,
        ],
    ];

    /**
     * @return void
     */
    public function boot()
    {
    }
}
```

<br>

## 19. Session

### セッションの操作

#### ▼ 設定ファイル

```php
<?php

use Illuminate\Support\Str;

return [

    'driver' => env('SESSION_DRIVER', 'file'),

    'lifetime' => env('SESSION_LIFETIME', 120),

    'expire_on_close' => false,

    'encrypt' => false,

    'files' => storage_path('framework/sessions'),

    'connection' => env('SESSION_CONNECTION', null),

    'table' => 'sessions',

    'store' => env('SESSION_STORE', null),

    'lottery' => [2, 100],

    'cookie' => env(
        'SESSION_COOKIE',
        Str::slug(env('APP_NAME', 'laravel'), '_') . '_session'
    ),

    'path'      => '/',

    // Set-Cookieヘッダーのdomain属性に値を割り当てる。
    'domain'    => env('SESSION_DOMAIN', null),

    // Set-Cookieヘッダーのsecure属性を有効化する。
    'secure'    => env('SESSION_SECURE_COOKIE', false),

    // Set-CookieヘッダーのHttpOnly属性を有効化する。
    'http_only' => true,

    // Set-CookieヘッダーのsameSite属性に値を割り当てる。nullの場合、Laxとなる。
    'same_site' => null,
];
```

#### ▼ よく使用する操作メソッド

FormRequestクラスの```session```メソッドはStoreクラスを返却する。このクラスのメソッドを使用して、セッションを操作できる。

| メソッド名       | 説明                                                                   |
|--------------|----------------------------------------------------------------------|
| ```get```    | セッションのキー名を指定して、```1```個の値を取得する。                                 |
| ```all```    | セッションの全ての値を取得する。                                                   |
| ```forget``` | セッションのキー名を指定して、値を取得する。キー名を配列で渡して、複数を削除することも可能。         |
| ```flush```  | セッションの全ての値を取得する。                                                   |
| ```pull```   | セッションのキー名を指定して、```1```個の値を取得し、取得後に削除する。                    |
| ```has```    | セッションのキー名を指定して、値が存在しているかを検証する。```null```は```false```として判定する。 |

> ℹ️ 参考：https://laravel.com/api/8.x/Illuminate/Session/Store.html

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * @param  Request  $request
     * @param  int  $id
     * @return Response
     */
    public function index(Request $request, $id)
    {
        // getメソッド
        $data = $request->session()->get("foo");
        
        // allメソッド
        $data = $request->session()->all();
        
        // forgetメソッド
        $request->session()->forget("foo");
        $request->session()->forget(["foo", "bar"]);
        
        // flush
        $request->session()->flush();
        
        // pullメソッド
        $data = $request->session()->pull("foo");
        
        // hasメソッド
        if ($request->session()->has("foo")) {
    
        }
    }
}
```

#### ▼ セッションデータがStoreクラスに至るまで

全てを追うことは難しいため、StartSessionクラスの```handle```メソッドが実行されるところから始めるものとする。ここで、```handleStatefulRequest```メソッドの中の```startSession```メソッドが実行される。これにより、Storeクラスの```start```メソッド、```loadSession```メソッド、```readFromHandler```メソッドが実行され、```SessionHandlerInterface```の実装クラスの```read```メソッドが実行される。```read```メソッドは、```storage/framework/sessions```にあるセッションデータに書き込まれたセッションを読み出し、```attribute```プロパティに格納する。Sessionクラスのメソッドは、```attribute```プロパティを使用して、セッションを操作する。最終的に,```handleStatefulRequest```では、```saveSession```メソッドの中の```save```メソッドが実行され、セッションデータに新しい値が書き込まれる。

> ℹ️ 参考：
>
> - https://laravel.com/api/8.x/Illuminate/Session/Middleware/StartSession.html#method_handle
> - https://laravel.com/api/8.x/Illuminate/Session/Middleware/StartSession.html#method_handleStatefulRequest
> - https://laravel.com/api/8.x/Illuminate/Session/Middleware/StartSession.html#method_startSession
> - https://laravel.com/api/8.x/Illuminate/Session/Store.html#method_start
> - https://laravel.com/api/8.x/Illuminate/Session/Store.html#method_loadSession
> - https://laravel.com/api/8.x/Illuminate/Session/Store.html#method_readFromHandler
> - https://www.php.net/manual/ja/sessionhandlerinterface.read.php
> - https://laravel.com/api/8.x/Illuminate/Session/Middleware/StartSession.html#method_saveSession
> - https://laravel.com/api/8.x/Illuminate/Session/Store.html#method_save
> - https://www.php.net/manual/ja/sessionhandlerinterface.write.php

<br>

## 20. Views

### データの出力

#### ▼ データの出力

Controllerクラスから返却されたデータは、```{{ 変数名 }}```で取得できる。`

**＊実装例＊**

```html
<html>
    <body>
        <h1>Hello!! {{ $data }}</h1>
    </body>
</html>
```

#### ▼ バリデーションメッセージの出力

バリデーションでエラーが発生した場合、バリデーションでエラーがあった場合、Handlerクラスの```invalid```メソッドがコールされ、MessageBagクラスがViewに渡される。MessageBagクラスは、Blade上で```errors```変数に格納されており、各メソッドをコールしてエラーメッセージを出力できる。

> ℹ️ 参考：https://laravel.com/api/8.x/Illuminate/Support/MessageBag.html

**＊実装例＊**

MessageBagクラスの```all```メソッドで、全てのエラーメッセージを出力する。

```html
<!-- /resources/views/foo/create.blade.php -->

<h1>ポスト作成</h1>

@if ($errors->any())
    <div>
        @foreach ($errors->all() as $error)
            <p class="alert alert-danger">{{ $error }}</p>
        @endforeach        
    </div>
@endif

@isset ($status)
    <div class="complete">
        <p>登録が完了しました。</p>
    </div>
@endisset

<!-- ポスト作成フォーム -->
```

```css
.errors {
    /* 何らかのデザイン */
}

.complete {
    /* 何らかのデザイン */
}
```

<br>

### 要素の共通化

#### ▼ ```@include```（サブビュー）

読み込んだファイル全体を出力する。読み込むファイルに対して、変数を渡すこともできる。```@extentds```との使い分けとして、親子関係のないテンプレートの間で使用するのが良い。両者は、PHPでいう```extends```（クラスチェーン）と```require```（単なる読み出し）の関係に近い。

**＊実装例＊**

```html
<div>
    @include("shared.errors")
    <form><!-- フォームの内容 -->
    </form>
</div>
```

<br>

### 要素の継承

#### ▼ ```@yield```、```@extends```、```@section```、```@endsection```

子テンプレートのレンダリング時に、子テンプレートで新しく定義したHTMLの要素を、親テンプレートの指定した場所に出力する。親テンプレートにて、```@yield("foo")```を定義する。

**＊実装例＊**

```html
<!-- 親テンプレート -->

<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="utf-8">
        <title>アプリケーション</title>
    </head>
    <body>
        <h2>タイトル</h2>        
        @yield("content")
    </body>
</html>
```

これを子テンプレートで```@extends```で継承すると、レンダリング時に、子テンプレートの```@section("foo")```-```@endsection```で定義した要素が、親テンプレートの```@yieid```メソッド部分に出力される。

**＊実装例＊**

```html
<!-- 子テンプレート -->

@extends("layouts.parent")

@section("content")
    <p>子テンプレートのレンダリング時に、yieldに出力される要素</p>
@endsection
```

ちなみに、子テンプレートは、レンダリング時に以下の様に出力される。

**＊実装例＊**

```html
<!-- 子テンプレート -->

<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="utf-8">
        <title>アプリケーション</title>
    </head>
    <body>
        <h2>タイトル</h2>
        <p>子テンプレートのレンダリング時に、yieldに出力される要素</p>
    </body>
</html>
```

#### ▼ ```@section```、```@show```、```@extends```、```@parent```

子テンプレートのレンダリング時に、親テンプレートと子テンプレートそれぞれで新しく定義したHTMLの要素を、親テンプレートの指定した場所に出力する。親テンプレートにて、```@section```-```@show```で要素を定義する。

**＊実装例＊**

```html
<!-- 親テンプレート -->

<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="utf-8">
        <title>アプリケーション</title>
    </head>
    <body>
        <h2>タイトル</h2>
        @section("sidebar")
        <p>親テンプレートのサイドバーとなる要素</p>
        @show
    </body>
</html>
```

子テンプレートの```@section```にて、```@parent```を使用する。親テンプレートと子テンプレートそれぞれの要素が出力される。

**＊実装例＊**

```html
<!-- 子テンプレート -->

@extends("layouts.app")

@section("sidebar")
    @parent
    <p>子テンレプートのサイドバーに追加される要素</p>
@endsection
```

ちなみに、子テンプレートは、レンダリング時に以下の様に出力される。

**＊実装例＊**

```html
<!-- 子テンプレート -->

<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="utf-8">
        <title>アプリケーション</title>
    </head>
    <body>
        <h2>タイトル</h2>
        <p>親テンプレートのサイドバーとなる要素</p>
        <p>子テンレプートのサイドバーに追加される要素</p>
    </body>
</html>
```

<br>

#### ▼ ```@stack```、```@push```

子テンプレートのレンダリング時に、```.css```ファイルと```.js```ファイルを動的に出力する場合に使用する。親テンプレートにて、```@stack("foo")```を定義する。これを継承した子テンプレートのレンダリング時に、```@push("foo")```-```@endpush```で定義した要素が、```@stack```メソッド部分に出力される。

**＊実装例＊**

```html
<!-- 親テンプレート -->

<head>
    <!-- Headの内容 -->

    @stack("scripts")
</head>
```

```html
<!-- 子テンプレート -->

@push("scripts")
    <script src="/foo.js"></script>
@endpush
```

<br>

### Twigとの互換

#### ▼ Bladeで実装した場合

**＊実装例＊**

```html
<!-- 親テンプレート -->

<!DOCTYPE html>
<html lang="">
    <head>
        <title>@yield("title")</title>
    </head>
    <body>

        @section("sidebar")
            親テンプレートのサイドバーとなる要素
        @show

        <div class="container">
            @yield("content")
        </div>
    </body>
</html>
```

```html
<!-- 子テンプレート -->

@extends("layouts.master")

@section("title", "子テンプレートのタイトルになる要素")

@section("sidebar")
    @parent
    <p>子テンレプートのサイドバーに追加される要素</p>
@endsection

@section("content")
    <p>子テンプレートのコンテンツになる要素</p>
@endsection
```

#### ▼ Twigで実装した場合

**＊実装例＊**

```html
<!-- 親テンプレート -->

<!DOCTYPE html>
<html lang="">
    <head>
        <title>{% block title %}{% endblock %}</title>
    </head>
    <body>

        {% block sidebar %} <!-- @section("sidebar") に相当 -->
            親テンプレートのサイドバーとなる要素
        {% endblock %}

        <div class="container">
            {% block content %}<!-- @yield("content") に相当 -->
            {% endblock %}
        </div>
    </body>
</html>
```
```html
<!-- 子テンプレート -->

{% extends "layouts.master" %} <!-- @extends("layouts.master") に相当 -->

{% block title %} <!-- @section("title", "Page Title") に相当 -->
    子テンプレートのタイトルになる要素
{% endblock %}

{% block sidebar %} <!-- @section("sidebar") に相当 -->
    {{ parent() }} <!-- @parent に相当 -->
    <p>子テンレプートのサイドバーに追加される要素</p>
{% endblock %}

{% block content %} <!-- @section("content") に相当 -->
    <p>子テンプレートのコンテンツになる要素</p>
{% endblock %}
```

