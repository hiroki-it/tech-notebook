---
title: 【知見を書きなぐるサイト】コンポーネント@Laravel
---

# コンポーネント@Laravel

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Laravelの全体像

### ライフサイクル

![laravel-lifecycle](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/laravel-lifecycle.png)

大まかな処理フローは以下の通りである．

参考：https://blog.albert-chen.com/the-integration-of-laravel-with-swoole-part-1/

|      | 用語                                                    | 説明                                                         |
| ---- | ------------------------------------------------------- | ------------------------------------------------------------ |
| 1    | リクエストを受信する．                                  |                                                              |
| 2    | ```index.php```ファイル                                 | エントリポイントから処理が始まる．                           |
| 3    | Autoload                                                | ```autoload.php```ファイルにて，ライブラリを自動でロードする． |
| 4    | Load App                                                | ```bootstrap/app.php```ファイルにて，ServiceContainer（```Illuminate\Foundation\Application.php```）を実行する． |
| 5    | Http Kernel                                             | Kernelを実行する．                                           |
| 6    | ・Register ServiceProviders<br>・Boot Service Providers | ServiceProviderの```register```メソッドや```boot```メソッドを実行する．これにより，ServiceContainerにクラスがバインドされる． |
| 7    | Middleware                                              | BeforeMiddlewareを実行する．                                 |
| 8    | ・Dispatch by Router<br>・Routes Match                  | ```web.php```ファイル，```app.php```ファイルなどのルーティング定義を元に，Routerが実行する． |
| 9    | FormRequest                                             | バリデーションを実行する．                                   |
| 10   | Controller                                              | Controllerを基点として，データベースにまで処理が走る．       |
| 11   | Resource                                                | データベースから取得したコレクション型データを配列型データに変換する． |
| 12   | Response                                                | Responseを実行する．配列型データをJSONデータに変換する．     |
| 13   | Terminate Middleware                                    | AfterMiddlewareが実行される．                                |
| 14   | View                                                    | bladeファイルに基づいて静的ファイルが構築される．            |
| 15   | レスポンスを返信する．                                  |                                                              |

<br>

### コンポーネントのソースコード

Laravelの各コンポーネントには，似たような名前のメソッドが多く内蔵されている．そのため，同様の機能を実現するために，各々が異なるメソッドを使用しがちになる．その時，各メソッドがブラックボックスにならないように，処理の違いをソースコードから確認する必要がある．

参考：https://laravel.com/api/8.x/Illuminate.html

<br>

## 02. Application

### App

#### ・設定方法

```bash
APP_NAME=<サービス名>
APP_ENV=<環境名>
APP_KEY=<セッションの作成やパスワードの暗号化に使う認証キー>
APP_DEBUG=<デバッグモードの有効無効化>
APP_URL=<アプリケーションのURL>
```

#### ・```app.php```ファイルの基本設定

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

    // セッションの作成やパスワードの暗号化に使う認証キー
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

### artisanコマンド

#### ・キャッシュの削除

キャッシュ（```bootstrap/cache/config.php```ファイル）を削除する．

```bash
$ php artisan config:clear
```

<br>

## 04. Console

### Command

artisanコマンドで実行可能なコマンド処理を定義する．

参考：https://readouble.com/laravel/8.x/ja/artisan.html#writing-commands

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
        
        // パラメータを取得します．
        $bar = $this->argument('bar');

        // 何らかのコマンド処理

        Log::info('END: artisan do-foo');
    }
}
```

定義したCommandクラスは，以下のように実行できる．

```bash
$ php artisan command:do-foo
```

<br>

## 05. Database

### データベース接続

#### ・設定方法

環境変数を```.env```ファイルに実装する．```database.php```ファイルから，指定された設定が選択される．

```bash
DB_CONNECTION=<RDB名>
DB_HOST=<ホスト名>
DB_PORT=<ポート番号>
DB_DATABASE=<データベース名>
DB_USERNAME=<アプリケーションユーザー名>
DB_PASSWORD=<アプリケーションユーザーのパスワード>
```

#### ・RDBとRedisの選択

```php
<?php

return [

    // 用いるDBMSを設定
    "default"     => env("DB_CONNECTION", "mysql"),

    "connections" => [

        // データベース接続情報（SQLite）
        "sqlite" => [

        ],

        // データベース接続情報（MySQL）
        "mysql"  => [

        ],

        // データベース接続情報（pgSQL）
        "pgsql"  => [

        ],

        // データベース接続情報（SQLSRV）
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

### Redis

#### ・クエリキャッシュ管理

環境変数を```.env```ファイルに実装する必要がある．

```bash
CACHE_DRIVER=redis
REDIS_HOST=<Redisのホスト>
REDIS_PASSWORD=<Redisのパスワード>
REDIS_PORT=<Redisのポート>
```

<br>



## 	06. Event/Listener

### Event

#### ・Eventとは

ビジネスの出来事がモデリングされたイベントオブジェクトとして機能する．

#### ・構成

イベントに関するデータを保持するだけで，ビジネスロジックを持たない構成となる．

参考：https://readouble.com/laravel/8.x/ja/events.html#defining-events

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

任意の場所でイベントを発行できる．

```php
<?php
    
event(new UserCreatedEvent($user));
```

#### ・EloquentモデルのCRUDイベント

Eloquentモデルでは，DBアクセスに関するメソッドの実行開始や終了の処理タイミングをイベントクラスに紐付けられる．紐付けるために，プロパティで定義するか，あるいは各タイミングで実行されるクロージャーでイベントを発生させる必要がある．

参考：https://readouble.com/laravel/8.x/ja/eloquent.html#events

**＊実装例＊**

プロパティにて，CREATE処理とDELETE処理に独自イベントクラスに紐付ける．

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

クロージャーにて，CREATE処理に独自イベントクラスに紐付ける．


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

#### ・Listenerとは

イベントが発生した時に，これに紐付いてコールされるオブジェクトのこと．

#### ・構成

Listenerクラスがコールされた時に実行する処理を```handle```関数に定義する．

**＊実装例＊**

ユーザーが作成された時に，メールアドレスにメッセージを送信する．

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
        // UserクラスがNotifiableトレイトに依存せずに通知を実行できるように，オンデマンド通知機能を使用します．
        Notification::route('mail', $userEvent->user->userEmailAddress->emailAddress)
            ->notify(new UserCreatedEventNotification($userEvent->user));
    }
}
```

任意の場所でイベントを発行すると，リスナーが自動でコールされる．

```php
<?php
    
event(new UserCreatedEvent($user));
```

#### ・イベントとリスナーの紐付け

EventServiceProviderクラスにて，Eventクラスに紐付ける1つ以上のListenerクラスを設定する．

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

#### ・任意のEloquentモデルCRUDイベントの検知

Laravelの多くのコンポーネントに，```boot```メソッドが定義されている．Eloquentモデルでは，インスタンス生成時に```boot```メソッドがコールされ，これによりに```bootTraits```メソッドが実行される．Traitに```boot+<クラス名>```という名前の静的メソッドが定義されていると，```bootTraits```メソッドはこれをコールする．```bootTraits```メソッドの中でEloquentモデルのイベントを発生させることにより，全てのEloquentモデルのイベントを一括で発火させられる．

参考：https://github.com/laravel/framework/blob/9362a29ce298428591369be8d101d51876406fc8/src/Illuminate/Database/Eloquent/Model.php#L255-L285

**＊実装例＊**

あらかじめTraitを定義する．```saved```メソッドにEloquentモデルの更新イベントを登録できるようにする．

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
            // イベントを発生させる．
            event(new UpdatedModelEvent($updatedModel));
        });

        // 任意のEloquentモデルのdeleteメソッド実行時
        static::deleted(function (Model $updatedModel) {
            // イベントを発生させる．
            event(new UpdatedModelEvent($updatedModel));
        });
    }
    
    /**
     * イベントを発火させずにModelを保存します．
     *
     * @return void
     */
    protected static function saveWithoutEvents(): void
    {
        // 無限ループを防ぐために，save実行時にイベントが発火しないようにする．
        return static::withoutEvents(function () use ($options) {
            
            // プロパティの変更を保存．
            return $this->save($options);
        });
    }    
}
```

イベントを定義する．

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

Model更新イベントが発火してコールされるリスナーを定義する．```create_by```カラムまたは```updated_by```カラムを指定した更新者名に更新できるようにする．なお，イベントとリスナーの対応関係は，EventServiceProviderで登録する．

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

        // create_byプロパティに値が設定されているかを判定．
        if (is_null($updatedModelEvent->updatedModel->created_by)) {     
            $updatedModelEvent->updatedModel->created_by = $by;
        }

        $updatedModelEvent->updatedModel->updated_by = $by;
        
        $updatedModelEvent->updatedModel->saveWithoutEvents();
    }
    
    /**
     * 更新処理の実行者を取得します．
     *
     * @return string
     */
    private function getModelUpdater(): string
    {
        // コンソール経由で実行されたかを判定．
        if (app()->runningInConsole()) {
            return ExecutorConstant::ARTISAN_COMMAND;
        }

        // API認証に成功したかを判定．
        if (auth()->check()) {
            return ExecutorConstant::STAFF . ":" . auth()->id();
        }
        
        return ExecutorConstant::GUEST;
    }    
}
```

実行者名は，定数として管理しておくとよい．

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

エラーハンドリングは4つのステップからなる．LaravelではデフォルトでHandlerクラスが全てのステップをカバーしている．また加えて，異常系レスポンスを自動で返信してくれる．エラーハンドリングのステップのうち，エラー検出については言及しないこととする．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_object_oriented_language_php_logic_error_and_error_handling.html

<br>

### 例外スロー

#### ・例外

ドキュメントとしてまとめられていないが，デフォルトで様々な例外が備わっている．

参考：https://laravel.com/api/8.x/search.html?search=exception

#### ・スタックトレース

Laravelはスローされる例外のメッセージをスタックトレースで生成する．また，Laravel内部で例外キャッチと新たな例外の投げ直しが行われるため，```[previous exception]```によって例外が結合される．スタックトレースには機密性の高い情報が含まれるため，クライアントへの異常系レスポンスのエラーメッセージには割り当てずに，ロギングだけしておく．エラーが複数行にまたがるため，CloudWatchやFluentBitなどのログ収集ツールでは，各行を繋げて扱えるように設定が必要である．ちなみに，ログの詳細度は```APP_DEBUG```環境変数で制御できる．

参考：https://readouble.com/laravel/8.x/ja/errors.html#configuration

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

#### ・```report```メソッド

Laravel内部でキャッチされた例外に基づいて，ロギングを実行する．

参考：https://cpoint-lab.co.jp/article/201905/9841/

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
    
    // ～ 中略 ～

}
```

<br>

### 異常系レスポンスの返信

#### ・```render```メソッド

Laravel内部でキャッチされた例外に基づいて，異常系レスポンスを自動で返信する．異常系レスポンスの返信処理をこれに追加することも可能であるが，異常系レスポンス間が密結合になるため，できるだけいじらない．その代わりに，各コントローラーに```try-catch```と異常系レスポンスの返信処理を実装するようにする．

参考：https://cpoint-lab.co.jp/article/201905/9841/

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
    
    // ～ 中略 ～
}
```

<br>

## 08. Facade

### Facade

#### ・Facadeとは

Facadeに登録されたクラス（Facadeクラス）とServiceContainerを繋ぐ静的プロキシとして働く．メソッドをコールできるようになる．

#### ・Facadeを用いない場合

new演算子でインスタンスを作成する．

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

#### ・Facadeの静的プロキシ機能を用いる場合

静的メソッドの記法でコールできる．ただし，自作クラスをFacadeの機能を用いてインスタンス化すると，スパゲッティな『Composition（合成）』の依存関係を生じさせてしまう．例えば，Facadeの中でも，```Route```のような，代替するよりもFacadeを使ったほうが断然便利である部分以外は，使用しないほうがよい．

**＊実装例＊**

Facadeとして用いたいクラスを定義する．

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

エイリアス名とクラスの名前空間を```config/app.php```ファイルを```aliases```キーに登録すると，そのエイリアス名でインスタンス化とメソッドコールを行えるようになる．

```php
<?php
  
"aliases" => [
    "Foo" => App\Models\Foo::class,
]
```

インスタンス化とメソッドコールを行う．

```php
<?php

use Illuminate\Support\Facades\Foo;
    
// Facade利用
$result = Foo::method();
```

#### ・Facadeを用いた方が良い場合

Facadeがトレイトの代わりになる場合，Facadeを用いることにより，責務がドメインモデルに集中せずにすむ．

**＊例＊**

NotifiableトレイトをUserクラスで使用せずに，Notificationファサードによるオンデマンド通知を用いることにより，Userクラスが通知処理の責務を持たずに済む．詳しくは，オンデマンド通知の説明を参考にせよ．

#### ・標準登録されたFacadeクラスの種類

以下のクラスは，デフォルトで登録されているFacadeである．

| エイリアス名         | クラス名                                                     | サービスコンテナ結合キー |
| :------------------- | :----------------------------------------------------------- | :----------------------- |
| App                  | [Illuminate\Foundation\Application](https://laravel.com/api/8.x/Illuminate/Foundation/Application.html) | `app`                    |
| Artisan              | [Illuminate\Contracts\Console\Kernel](https://laravel.com/api/8.x/Illuminate/Contracts/Console/Kernel.html) | `artisan`                |
| Auth                 | [Illuminate\Auth\AuthManager](https://laravel.com/api/8.x/Illuminate/Auth/AuthManager.html) | `auth`                   |
| Auth (Instance)      | [Illuminate\Contracts\Auth\Guard](https://laravel.com/api/8.x/Illuminate/Contracts/Auth/Guard.html) | `auth.driver`            |
| Blade                | [Illuminate\View\Compilers\BladeCompiler](https://laravel.com/api/8.x/Illuminate/View/Compilers/BladeCompiler.html) | `blade.compiler`         |
| Broadcast            | [Illuminate\Contracts\Broadcasting\Factory](https://laravel.com/api/8.x/Illuminate/Contracts/Broadcasting/Factory.html) |                          |
| Broadcast (Instance) | [Illuminate\Contracts\Broadcasting\Broadcaster](https://laravel.com/api/8.x/Illuminate/Contracts/Broadcasting/Broadcaster.html) |                          |
| Bus                  | [Illuminate\Contracts\Bus\Dispatcher](https://laravel.com/api/8.x/Illuminate/Contracts/Bus/Dispatcher.html) |                          |
| Cache                | [Illuminate\Cache\CacheManager](https://laravel.com/api/8.x/Illuminate/Cache/CacheManager.html) | `cache`                  |
| Cache (Instance)     | [Illuminate\Cache\Repository](https://laravel.com/api/8.x/Illuminate/Cache/Repository.html) | `cache.store`            |
| Config               | [Illuminate\Config\Repository](https://laravel.com/api/8.x/Illuminate/Config/Repository.html) | `config`                 |
| Cookie               | [Illuminate\Cookie\CookieJar](https://laravel.com/api/8.x/Illuminate/Cookie/CookieJar.html) | `cookie`                 |
| Crypt                | [Illuminate\Encryption\Encrypter](https://laravel.com/api/8.x/Illuminate/Encryption/Encrypter.html) | `encrypter`              |
| DB                   | [Illuminate\Database\DatabaseManager](https://laravel.com/api/8.x/Illuminate/Database/DatabaseManager.html) | `db`                     |
| DB (Instance)        | [Illuminate\Database\Connection](https://laravel.com/api/8.x/Illuminate/Database/Connection.html) | `db.connection`          |
| Event                | [Illuminate\Events\Dispatcher](https://laravel.com/api/8.x/Illuminate/Events/Dispatcher.html) | `events`                 |
| File                 | [Illuminate\Filesystem\Filesystem](https://laravel.com/api/8.x/Illuminate/Filesystem/Filesystem.html) | `files`                  |
| Gate                 | [Illuminate\Contracts\Auth\Access\Gate](https://laravel.com/api/8.x/Illuminate/Contracts/Auth/Access/Gate.html) |                          |
| Hash                 | [Illuminate\Contracts\Hashing\Hasher](https://laravel.com/api/8.x/Illuminate/Contracts/Hashing/Hasher.html) | `hash`                   |
| Lang                 | [Illuminate\Translation\Translator](https://laravel.com/api/8.x/Illuminate/Translation/Translator.html) | `translator`             |
| Log                  | [Illuminate\Log\LogManager](https://laravel.com/api/8.x/Illuminate/Log/LogManager.html) | `log`                    |
| Mail                 | [Illuminate\Mail\Mailer](https://laravel.com/api/8.x/Illuminate/Mail/Mailer.html) | `mailer`                 |
| Notification         | [Illuminate\Notifications\ChannelManager](https://laravel.com/api/8.x/Illuminate/Notifications/ChannelManager.html) |                          |
| Password             | [Illuminate\Auth\Passwords\PasswordBrokerManager](https://laravel.com/api/8.x/Illuminate/Auth/Passwords/PasswordBrokerManager.html) | `auth.password`          |
| Password (Instance)  | [Illuminate\Auth\Passwords\PasswordBroker](https://laravel.com/api/8.x/Illuminate/Auth/Passwords/PasswordBroker.html) | `auth.password.broker`   |
| Queue                | [Illuminate\Queue\QueueManager](https://laravel.com/api/8.x/Illuminate/Queue/QueueManager.html) | `queue`                  |
| Queue (Instance)     | [Illuminate\Contracts\Queue\Queue](https://laravel.com/api/8.x/Illuminate/Contracts/Queue/Queue.html) | `queue.connection`       |
| Queue (Base Class)   | [Illuminate\Queue\Queue](https://laravel.com/api/8.x/Illuminate/Queue/Queue.html) |                          |
| Redirect             | [Illuminate\Routing\Redirector](https://laravel.com/api/8.x/Illuminate/Routing/Redirector.html) | `redirect`               |
| Redis                | [Illuminate\Redis\RedisManager](https://laravel.com/api/8.x/Illuminate/Redis/RedisManager.html) | `redis`                  |
| Redis (Instance)     | [Illuminate\Redis\Connections\Connection](https://laravel.com/api/8.x/Illuminate/Redis/Connections/Connection.html) | `redis.connection`       |
| Request              | [Illuminate\Http\Request](https://laravel.com/api/8.x/Illuminate/Http/Request.html) | `request`                |
| Response             | [Illuminate\Contracts\Routing\ResponseFactory](https://laravel.com/api/8.x/Illuminate/Contracts/Routing/ResponseFactory.html) |                          |
| Response (Instance)  | [Illuminate\Http\Response](https://laravel.com/api/8.x/Illuminate/Http/Response.html) |                          |
| Route                | [Illuminate\Routing\Router](https://laravel.com/api/8.x/Illuminate/Routing/Router.html) | `router`                 |
| Schema               | [Illuminate\Database\Schema\Builder](https://laravel.com/api/8.x/Illuminate/Database/Schema/Builder.html) |                          |
| Session              | [Illuminate\Session\SessionManager](https://laravel.com/api/8.x/Illuminate/Session/SessionManager.html) | `session`                |
| Session (Instance)   | [Illuminate\Session\Store](https://laravel.com/api/8.x/Illuminate/Session/Store.html) | `session.store`          |
| Storage              | [Illuminate\Filesystem\FilesystemManager](https://laravel.com/api/8.x/Illuminate/Filesystem/FilesystemManager.html) | `filesystem`             |
| Storage (Instance)   | [Illuminate\Contracts\Filesystem\Filesystem](https://laravel.com/api/8.x/Illuminate/Contracts/Filesystem/Filesystem.html) | `filesystem.disk`        |
| URL                  | [Illuminate\Routing\UrlGenerator](https://laravel.com/api/8.x/Illuminate/Routing/UrlGenerator.html) | `url`                    |
| Validator            | [Illuminate\Validation\Factory](https://laravel.com/api/8.x/Illuminate/Validation/Factory.html) | `validator`              |
| Validator (Instance) | [Illuminate\Validation\Validator](https://laravel.com/api/8.x/Illuminate/Validation/Validator.html) |                          |
| View                 | [Illuminate\View\Factory](https://laravel.com/api/8.x/Illuminate/View/Factory.html) | `view`                   |
| View (Instance)      | [Illuminate\View\View](https://laravel.com/api/8.x/Illuminate/View/View.html) |                          |

<br>

### Authファサード

#### ・Authファサードとは

認証に関する処理を提供する．Laravelからあらかじめ提供されている認証を用いない場合，Authファサードを用いて，認証ロジックを実装できる．

<br>

### DBファサード

#### ・DBファサードとは

データベースの操作処理を提供する．Eloquentの代わりに，DBファサードを用いても良い．Active Recordのロジックを持たないため，Repositoryパターンのロジックとして使用できる．

#### ・```transaction```メソッド

一連のトランザクション処理を実行する．引数として渡した無名関数が例外を返却した場合，ロールバックを自動的に実行する．例外が発生しなかった場合，無名関数の返却値が，そのまま```transaction```メソッドの返却値になる．さらに```transaction```メソッドの返却値を返却するようにすれば，無名関数の返却値をそのまま使用できる．ちなみに，トランザクション処理は必須ではなく，用いるとアプリケーションがデータベースを操作するために要する時間が増えるため，使用しなくても良い．参考リンクによると，MongoDBに対してトランザクション処理を行う/行わない場合を比較して，処理時間が17%弱長くなったとのこと．

参考：https://rightcode.co.jp/blog/information-technology/node-js-mongodb-transaction-function-use#i-5

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
        // トランザクション処理を開始する．
        DB::beginTransaction();

        try {

            $this->fooDTO->fill([
                    "name"  => $foo->name(),
                    "age"   => $foo->age(),
                ])
                ->save();

            // コミットメントを実行する．
            DB::commit();
        } catch (Exception $e) {

            // ロールバックを実行する．
            DB::rollback();
        }
    }
}

```

#### ・```beginTransaction```メソッド，```commit```メソッド，```rollback```メソッド，

トランザクション処理の各操作を分割して実行する．基本的には，```transaction```メソッドを用いてトランザクション処理を実行すれば良い．

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
     * Fooを更新します．
     *
     * @param Foo $foo
     */
    public function save(Foo $foo)
    {
        // トランザクション処理を開始する．
        DB::beginTransaction();
        
        try {
            $this->fooDTO
            // オブジェクトにデータを設定する．
            ->fill([
                "name"  => $foo->name(),
                "age"   => $foo->age(),
                "email" => $foo->email()
            ])
            // update文を実行する．
            ->save();            
            
            // コミットメントを実行する．
            DB::commit();
        } catch (\Exception $e) {
            
            // ロールバックを実行する．
            DB::rollback();
        }
    }
}
```

<br>

### Routeファサード

#### ・Routeファサードとは

ルーティング処理を提供する．

#### ・ヘルスチェックへの対応

ALBやGlobal Acceleratorから『```/healthcheck```』に対してヘルスチェックを設定した上で，```200```ステータスのレスポンスを返信するようにする．Nginxでヘルスチェックを実装することもできるが，アプリケーションの死活管理としては，Laravelに実装する方が適切である．RouteServiceProviderも参照せよ．

**＊実装例＊**

```php
<?php

# ヘルスチェックが送信されるパス
Route::get("/healthcheck", function () {
    return response("success", 200);
});
```

#### ・```middleware```メソッド

コントローラーへのルーティング時に実行するMiddlewareクラスを設定する．引数として，```App\Http\Kernel.php```ファイルで定義されたMiddlewareクラスのエイリアス名を設定する．

**＊実装例＊**

認証方法としてWebガードを用いる場合，```auth```エイリアスを設定する．

```php
<?php

use App\Http\Controllers\Foo\FooController;

// authエイリアスを設定する．
Route::middleware("auth")->group(function () {
    Route::get("/foo", [FooController::class, "getFoo"]);
    Route::get("/foo/{fooId}", [FooController::class, "index"]);
    Route::post("/foo", [FooController::class, "createFoo"]);
    Route::put("/foo/{fooId}", [FooController::class, "updateFoo"]);
    Route::delete("/foo/{fooId}", [FooController::class, "deleteFoo"]);
});

```

デフォルトでは，```App\Http\Kernel.php```ファイルにて，```auth```エイリアスに```\App\Http\Middleware\Authenticate```クラスが紐付けられている．


```php
<?php

namespace App\Http;

use App\Http\Middleware\BeforeMiddleware\FooIdConverterMiddleware;
use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    
    // ～ 中略 ～
    
    protected $routeMiddleware = [
        
        "auth" => \App\Http\Middleware\Authenticate::class,
        
    ];
    
    // ～ 中略 ～    
    
}
```

一方で，認証方法としてAPIガードを用いる場合，```auth:api```エイリアスを設定する．

```php
<?php

// authエイリアスのMiddlewareクラスが用いられる．
Route::middleware("auth:api")->group(function () {
    // 何らのルーティング
});
```

#### ・```prefix```メソッド

エンドポイントが共通として持つ最初のファイルパスを，プレフィクスとして定義する．

**＊実装例＊**

各エンドポイントの最初の『```foos```』をプレフィクスとして定義する．

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

#### ・```where```メソッド，```pattern```メソッド

パスパラメータに対するバリデーションルールを正規表現で定義し，また実行する．RouteServiceProviderの```boot```メソッドにて，```pattern```メソッドで制約を設定することによって，ルーティング時にwhereを用いる必要がなくなる．

**＊実装例＊**

userIdの形式を『0〜9が1つ以上』に設定している．

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

または，RouteServiceProviderクラスに```pattern```メソッドを定義すると，各エンドポイントに対する正規表現を一括で実行できる．

参考：https://readouble.com/laravel/8.x/ja/routing.html#parameters-global-constraints

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
     * ルーティングの設定ファイルをコールします．
     *
     * @return void
     */
    public function boot()
    {
        // バリデーションルールとして『0〜9が1つ以上』を定義する．
        Route::pattern('fooId', '[0-9]+');
        
        // 〜 中略 〜
    }
}
```

#### ・```group```メソッド

複数のグループを組み合わせる場合，```group```メソッドを用いる．

**＊実装例＊**

エンドポイントのプレフィクスとミドルウェアの指定を定義する．

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

#### ・Storageファサードとは

ファイルの入出力処理を提供する．

#### ・ローカルストレージ（非公開）の場合

ファイルを```/storage/app```ディレクトリに保存する．このファイルは非公開であり，リクエストによってアクセスできない．事前に，シンボリックリンクを作成する，また，```filesystems.php```ファイルに設定が必要である．

```bash
$ php artisan storage:link
```

```php
return [

    "default" => env("FILESYSTEM_DRIVER", "local"),
    
     // ～ 中略 ～

    "disks" => [

        "local" => [
            "driver" => "local",
            "root"   => storage_path("app"),
        ],
        
     // ～ 中略 ～
        
    // シンボリックリンクの関係を定義
    "links" => [
        
        // 『/var/www/project/public/storage』から『/var/www/project/storage/app/public』へのリンク
        public_path("storage") => storage_path("app/public"),
    ],
];
```

**＊実装例＊**

Storageファサードの```disk```メソッドを用いてlocalディスクを指定する．```file.txt```ファイルを```storage/app/file.txt```として保存する．

```php
Storage::disk("local")->put("file.txt", "file.txt");
```

ただし，```filesytems.php```ファイルでデフォルトディスクは```local```になっているため，```put```メソッドを直接使用できる．

```php
Storage::put("file.txt", "file.txt");
```

#### ・ローカルストレージ（公開）の場合

ファイルを```storage/app/public```ディレクトリに保存する．このファイルは公開であり，リクエストによってアクセスできる．事前に，```filesystems.php```ファイルに設定が必要である．

```php
return [

    "default" => env("FILESYSTEM_DRIVER", "local"),
    
     // ～ 中略 ～

    "disks" => [
        
        // ～ 中略 ～

        "public" => [
            "driver"     => "local",
            "root"       => storage_path("app/public"),
            "url"        => env("APP_URL") . "/storage",
            "visibility" => "public",
        ],

        // ～ 中略 ～
        
    ],
];
```

**＊実装例＊**

Storageファサードの```disk```メソッドを用いてpublicディスクを指定する．また，```file.txt```ファイルを```storage/app/public/file.txt```として保存する．

```php
Storage::disk("s3")->put("file.txt", "file.txt");
```

ただし，環境変数を用いて，```filesytems.php```ファイルでデフォルトディスクを```s3```に変更すると，```put```メソッドを直接使用できる．

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
        // 保存先をpublicに設定する．
        $disk = Storage::disk("public");

        // 保存対象のファイルを読み込む
        $file_path = "/path/to/public/foo.jpg"
        $contents = file_get_contents($file_path);

        // 保存先パス（ディレクトリ＋ファイル名）
        $saved_file_path = "/images/foo.jpg";

        // foo.jpgを『/images/foo.jpg』に保存
        // ルートディレクトリは『/storage/app/public』
        $disk->put($saved_file_path, $contents);
    }
}
```

#### ・クラウドストレージの場合

ファイルをS3バケット内のディレクトリに保存する．環境変数を```.env```ファイルに実装する必要がある．```filesystems.php```ファイルから，指定された設定が選択される．AWSアカウントの認証情報を環境変数として設定するか，またはS3アクセスポリシーをEC2やECSタスクに付与することにより，S3にアクセスできるようになる．事前に，```filesystems.php```ファイルに設定が必要である．

```bash
# S3アクセスポリシーをEC2やECSタスクに付与してもよい
AWS_ACCESS_KEY_ID=<アクセスキー>
AWS_SECRET_ACCESS_KEY=<シークレットアクセスキー>
AWS_DEFAULT_REGION=<リージョン>

# 必須
AWS_BUCKET=<バケット名>
```

```php
return [

    "default" => env("FILESYSTEM_DRIVER", "local"),
    
     // ～ 中略 ～
    
    "disks" => [

        // ～ 中略 ～

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

Storageファサードの```disk```メソッドを用いてs3ディスクを指定する．また，```file.txt```ファイルをS3バケットのルートに```file.txt```として保存する．

```php
Storage::disk("s3")->put("file.txt", "file.txt");
```

他の実装方法として，環境変数を用いて，```filesytems.php```ファイルでデフォルトディスクを```s3```に変更すると，```put```メソッドを直接使用できる．

```bash
FILESYSTEM_DRIVER=s3
```

```php
Storage::put("file.txt", "file.txt");
```

<br>

### Validatorファサード

#### ・Validatorファサードとは

バリデーション処理を提供する．FormRequestクラスの```validated```メソッドや```validate```メソッドの代わりに，Validatorファサードを用いても良い．

#### ・Validatorクラス，```fails```メソッド

Validateファサードの```make```メソッドを用いて，ルールを定義する．この時，第一引数で，バリデーションを行うリクエストデータを渡す．ルールに反すると，1つ目のルール名（例えば```required```）に基づき，```validation.php```ファイルから対応するエラーメッセージを自動的に選択する．次に，```fails```メソッドを用いて，バリデーションでエラーが起こった場合の処理を定義する．

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

        // バリデーション時にエラーが起こった場合
        if ($validator->fails()) {
            // 指定したWebページにリダイレクト
            // validatorを渡すことでエラーメッセージをViewに渡せる．
            return redirect("error")->withErrors($validator)
                ->withInput();
        }
        
        // 続きの処理
    }
}
```

#### ・```validate```メソッド

Validatorクラスの```validate```メソッドを用いると，FormRequestクラスの```validate```メソッドと同様の処理が実行される．バリデーションでエラーが起こった場合，Handlerクラスの```invalid```メソッドがコールされ，元のWebページにリダイレクトされる．

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
        // 元のWebページにリダイレクトする場合は，validateメソッドを用いる．
        $validator = Validator::make(
            $request->all(),
            [
                "title" => "required|unique:posts|max:255",
                "body"  => "required",
            ])->validate();

        // バリデーション時にエラーが起こった場合
        if ($validator->fails()) {
            // 指定したWebページにリダイレクト
            // validatorを渡すことでエラーメッセージをViewに渡せる．
            return redirect("error")->withErrors($validator)
                ->withInput();
        }
        
        // 続きの処理
    }
}
```

<br>

## 08-02. よく使うグローバルヘルパー関数

### ヘルパー関数

#### ・ヘルパー関数とは

グローバルにコールできるLaravel専用のメソッドのこと．基本的には，ヘルパー関数で実行される処理は，Facadeの内部で実行されるものと同じである．どちらを用いるかは好みである．

参考：https://stackoverflow.com/questions/31324226/laravel-performance-of-facades-vs-helper-methods

#### ・一覧

以下リンクを参照せよ．

https://readouble.com/laravel/8.x/ja/helpers.html#method-view

<br>

### ```auth```ヘルパー

#### ・AuthManagerインスタンスの返却

認証処理を持つAuthManagerクラスのインスタンスを返却する．

参考：https://laravel.com/api/8.x/Illuminate/Auth/AuthManager.html

```php
<?php

// Illuminate\Auth\AuthManager
$auth = auth();
```

<br>

### ```config```ヘルパー

#### ・環境変数ファイルの読み込み

環境変数ファイル名とキー名をドットで指定し，事前に設定された値を出力する．

**＊実装例＊**

デフォルトで搭載されている```app.php```ファイルの```timezone```キーの値を出力する．

```php
<?php

$value = config("app.timezone");
```

#### ・独自環境変数ファイルの作成と読み込み

configディレクトリに任意の名前のphp形式を作成しておく．これは，configヘルパーで読み込める．

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

参考：https://readouble.com/laravel/8.x/ja/helpers.html#method-bcrypt

```php
<?php

$hash = bcrypt('foo'); // 『foo』をハッシュ化して，『$2y$10$ZkYG.whhdcogCCzbG.VlQ』としてDBで管理する．
```

<br>

### ```redirect```ヘルパー

参考：https://blog.capilano-fw.com/?p=566

<br>

### ```response```ヘルパー

#### ・JSONデータのレスポンス

返却されるResponseFactoryクラスの```json```メソッドにレンダリングしたいJSONデータを設定する．```response```ヘルパーは初期値として```200```ステータスが設定されているが，```view```メソッドや```setStatusCode```メソッドを用いて，明示的に設定してもよい．

参考：https://github.com/laravel/framework/blob/8.x/src/Illuminate/Contracts/Routing/ResponseFactory.php

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

        // ～ 中略 ～

        return response()->json([
            "name"  => "Abigail",
            "state" => "CA"
        ], 200);
    }
}
```

#### ・Viewテンプレートのレスポンス

返却されるResponseFactoryクラスの```view```メソッドに，レンダリングしたいデータ（テンプレート，array型データ，ステータスコードなど）を設定する．また，Viewクラスの```header```メソッドにHTTPヘッダーの値を設定する．```response```ヘルパーは初期値として```200```ステータスが設定されているが，```view```メソッドや```setStatusCode```メソッドを用いて，明示的に設定してもよい．

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
        // ～ 中略 ～

        // データ，ステータスコード，ヘッダーなどを設定する場合
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
        // ～ 中略 ～

        // ステータスコードのみ設定する場合
        return response()->view("foo")
            ->setStatusCode(200);
    }
}
```

<br>

### ```route```ヘルパー

#### ・ルートエイリアスに基づいてURL生成

ルートにエイリアスがついている場合，エイリアスに応じてURLを生成する．ドメインは自動で補完される．

参考：https://readouble.com/laravel/8.x/ja/helpers.html#method-route

```php
<?php
    
Route::get('/foo', [FooController::class, 'index'])->name('foos_index');
    
// https://example.com/foo
$url = route('foos_index');
```

<br>

### ```path```系ヘルパー

#### ・```base_path```ヘルパー

引数を設定しない場合，projectルートディレクトリの絶対パスを生成する．また，projectルートディレクトリからの相対パスを引数として，絶対パスを生成する．

```php
<?php

// /var/www/project
$path = base_path();

// /var/www/project/vendor/bin
$path = base_path("vendor/bin");
```

#### ・```public_path```ヘルパー

引数を設定しない場合，publicディレクトリの絶対パスを生成する．また，publicディレクトリからの相対パスを引数として，絶対パスを生成する．

```php
<?php

// /var/www/project/public
$path = public_path();

// /var/www/project/public/css/app.css
$path = public_path("css/app.css");
```

#### ・```storage_path```ヘルパー

引数を設定しない場合，storageディレクトリの絶対パスを生成する．まあ，storageディレクトリからの相対パスを引数として，絶対パスを生成する．

```php
<?php

// /var/www/project/storage
$path = storage_path();

// /var/www/project/storage/app/file.txt
$path = storage_path("app/file.txt");
```

<br>

### ```url```ヘルパー

#### ・パスに基づいてURL生成

指定したパスに応じてURLを生成する．ドメインは自動で補完される．

参考：https://readouble.com/laravel/5.7/ja/urls.html

```php
<?php

// https://example.com/foo
$url = url('/foo');
```

<br>



## 09. Factory

### artisanコマンド

#### ・Factoryの生成

```bash
$ php artisan make:factory <Factory名> --model=<対象とするModel名>
```

<br>

### 初期値レコードの定義

#### ・Fakerによるランダム値生成

Fakerはレコードの値をランダムに生成するためのパッケージである．Farkerクラスは，プロパティにランダムなデータを保持している．このプロパティを特に，Formattersという．

参考：https://fwhy.github.io/faker-docs/

#### ・Factoryによるレコード定義

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

#### ・HasFactoryトレイト

Factoryに対応するEloquentモデルで用いる必要がある．

参考：https://readouble.com/laravel/8.x/ja/database-testing.html#creating-models-using-factories

```php
class Foo
{
    use HasFactory;
}
```

<br>

### 初期ダミーデータの量産

#### ・Seederによるダミーデータ量産

Factoryにおける定義を基にして，指定した数だけダミーデータを量産する．

**＊実装例＊**

FooSeederを定義し，50個のダミーユーザーデータを量産する．

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

また，BarSeederを定義し，50個のダミーユーザーデータを量産する．

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

DatabaseSeederにて，全てのSeederをまとめて実行する．

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
        if (app()->environment("dev")) {
            $this->call([
                // ダミーデータ
                FooSeeder::class,
                BarSeeder::class
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

### artisanコマンド

#### ・クラスの自動生成

```bash
# コントローラークラスを自動作成
$ php artisan make:controller <Controller名>
```

<br>

### リクエストパラメータの取得

#### ・クエリパラメータ/メッセージボディ

クエリパラメータとメッセージボディの両方を取得する．

参考：https://readouble.com/laravel/8.x/ja/requests.html#retrieving-input

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
        $params = $request->all(); // 全てのパラメータを連想配列で取得する．

        $foo = $request->input('foo'); // 指定したパラメータの値を取得する．
        
        $qux = $request->input('foo.qux'); // ネストされたパラメータの値を取得する．

        $params = $request->only(['foo', 'bar']); // 指定したパラメータを連想配列で取得する．

        $params = $request->except(['baz']); // 指定したパラメータ以外を連想配列で取得する．

        $foo = $request->foo; // 指定したパラメータの値を取得する．

        $foo = request('foo'); // 指定したパラメータの値を取得する．
    }
}
```

#### ・クエリパラメータ

クエリパラメータを取得する．

参考：https://readouble.com/laravel/8.x/ja/requests.html#retrieving-input

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
        $params = $request->query(); // 全てのパラメータを連想配列で取得する．

        $foo = $request->query('foo'); // 指定したパラメータの値を取得する．
    }
}
```

#### ・パスパラメータ

パスパラメータを取得する．

参考：

- https://technote.space/posts/wpdb-laravel-get-url-parameter/
- https://laravel.com/api/8.x/Illuminate/Http/Request.html#method_route
- https://laravel.com/api/8.x/Illuminate/Routing/Route.html#method_parameter

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
        $params = $request->route(); // 全てのパラメータを連想配列で取得する．

        $fooId = $request->route('fooId'); // 指定したパラメータの値を取得する．

        $fooId = $request->route->parameter('fooId'); // 指定したパラメータの値を取得する．
    }
}
```

あるいは，コントローラーの第二引数にパスパラメータ名を記述することで，パスパラメータの値を取得できる．

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

## 10-02. HTTP｜Middleware

### artisanコマンド

#### ・クラスの自動生成

Middlewareクラスを自動生成する．

```bash
$ php artisan make:middleware <Middleware名>
```

<br>

### Middlewareの仕組み

#### ・Middlewareの種類

ルーティング後にコントローラーメソッドの前にコールされるBeforeMiddleと，レスポンスの実行時にコールされるAfterMiddlewareがある

![Laravelのミドルウェア](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/LaravelのMiddlewareクラスの仕組み.png)

#### ・BeforeMiddleware

ルーティング時のコントローラーメソッドのコール前に実行する処理を設定できる．一連の処理を終えた後，FormRequestクラスを，次のMiddlewareクラスやControllerクラスに渡す必要がある．これらのクラスはClosure（無名関数）として，```next```変数に格納されている．

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

        // 次のMiddlewareクラスやControllerクラスに，FormRequestクラスを渡す．
        return $next($request);
    }
}
```

#### ・AfterMiddleware

コントローラーメソッドのレスポンスの実行後（テンプレートのレンダリングを含む）に実行する処理を設定できる．あらかじめ，FormRequestクラスを，前のMiddlewareクラスやControllerクラスから受け取る必要がある．これらのクラスはClosure（無名関数）として，```next```変数に格納されている．

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

        // 前のMiddlewareクラスやControllerクラスから，FormRequestクラスを受け取る．
        return $response;
    }
}
```

<br>

### 標準のMiddleware

#### ・EncryptCookies

レスポンス時に，```Cookie```ヘッダーの全ての値を暗号化する．暗号化したくない場合は，```Cookie```ヘッダーのキー名を```except```プロパティに設定する．

参考：https://reffect.co.jp/laravel/laravel-sessions-understand#cookie-2

#### ・StartSession

セッションの開始の開始点になる．

参考：https://qiita.com/wim/items/b1db5202cce6b38bc47b

また，同一セッションで一意なCSRFトークンを生成する．CSRFトークンによるCSRFの防御については，以下のリンク先を参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_cyber_attacks.html

#### ・VerifyCsrfToken

セッションファイルに書かれたCSRFトークンと，リクエストボディに割り当てられたトークンを比較する．セッションファイルは```storage/framework/sessions```ディレクトリに配置されている．一般的に，CSRFトークンは```Cookie```ヘッダーに割り当てることもできるが，Laravelではリクエストボディを用いる必要がある．

参考：https://readouble.com/laravel/8.x/ja/csrf.html#preventing-csrf-requests

<br>

### コール方法のカスタマイズ

#### ・Kernel

Middlewareクラスをコールする時の方法をカスタマイズできる．

**＊実装例＊**

```php
<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * 全てのHTTPリクエストに適用するミドルウェアを定義します．
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
     * エイリアス名とミドルウェアグループを定義します．
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
     * エイリアス名と個別のミドルウェアを定義します．
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
     * ミドルウェアをコールする順番を定義します．
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

## 10-03. HTTP｜FormRequest

### artisanコマンド

#### ・クラスの自動生成

FormRequestクラスを自動作成する．

```bash
$ php artisan make:request <Request名>
```

<br>

### クエリパラメータ/メッセージボディのバリデーション

#### ・ルール定義 ＆ バリデーション手動実行

同じくFormRequestクラスの```validate```メソッドを用いて，ルールを定義し，さらにバリデーションを実行する．```validated```メソッドと間違わないように注意する．ルールに反すると，1つ目のルール名（例えば```required```）に基づき，```validation.php```ファイルから対応するエラーメッセージを自動的に選択する．バリデーションでエラーが起こった場合，Handlerクラスの```invalid```メソッドがコールされ，元のWebページにリダイレクトされる．

参考：

- https://readouble.com/laravel/7.x/ja/validation.html#creating-form-requests
- https://laravel.com/api/8.x/Illuminate/Http/Request.html#method_validate

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
        // クエリパラメータのバリデーションを実行する．
        // エラーが起こった場合は元のWebページにリダイレクト
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
        // ルールの定義，バリデーションの実行
        // エラーが起こった場合は元のWebページにリダイレクト
        $validated = $request->validate([
            "title" => ["required", "string", "max:255"],
            "body"  => ["required", "string", "max:255"],
            "date"  => ["required", "date"],
        ]);

        // 続きの処理
    }
}
```

なお，ルールによっては，配列を使用せずとも定義できる．

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
        // ルールの定義，メッセージボディのバリデーションを実行する．
        // エラーが起こった場合は元のWebページにリダイレクト
        $validated = $request->validate([
            "title" => "required|string|max:5255",
            "body"  => "required|string|max:255",
            "date"  => "required|date",
        ]);

        // 続きの処理
    }
}
```

#### ・ルール定義 & バリデーション自動実行

Controllerで，FormRequestクラスを引数に指定すると，コントローラーのメソッドをコールする前にバリデーションを自動的に実行する．そのため，コントローラーの中ではバリデーションを実行する必要はない．代わりに，ルールをFormRequestクラスの```rule```メソッドに定義する必要がある．FormRequestクラスの```validated```メソッドを用いて，バリデーション済みのデータを取得できる．バリデーションでエラーが起こった場合，Handlerクラスの```invalid```メソッドがコールされ，元のWebページにリダイレクトされる．

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
        // クエリパラメータのバリデーションを実行する．
        // エラーが起こった場合は元のWebページにリダイレクト
        $validated = $request->validated();

        // 続きの処理
    }

    /**
     * @param Request $request
     */
    public function update(Request $request)
    {
        // メッセージボディのバリデーションを実行する．
        // エラーが起こった場合は元のWebページにリダイレクト
        $validated = $request->validated();

        // 続きの処理
    }
}
```

FormRequestクラスの```rules```メソッドを用いて，ルールを定義する．ルールに反すると，1つ目のルール名（例えば```required```）に基づき，```validation.php```ファイルから対応するエラーメッセージを自動的に選択する．

**＊実装例＊**

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FooRequest extends FormRequest
{
    /**
     * ルールを返却します．
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

### パスパラメータのバリデーション

#### ・ルールの定義 ＆ バリデーション自動実行

Routeファサードの```pattern```メソッドまたは```where```メソッドで定義する．Routeファサードの説明を参考にせよ．

<br>

### エラーメッセージ

#### ・標準のエラーメッセージ

標準のバリデーションメッセージは，```resources/lang/ja/validation.php```ファイルで定義できる．バリデーションルールの組み合わせによって，```validation.php```ファイルから自動的にメッセージが選択される．例えばルールとして最大値を設定した場合は，データ型に合わせてメッセージが選択される．日本語翻訳```validation.php```ファイルについては，以下のリンク先を参考にせよ．

参考：https://readouble.com/laravel/8.x/ja/validation-php.html

```php
<?php

return [

    # 〜 中略 〜

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

    # 〜 中略 〜

];
```

なお，言語設定を行わない場合，デフォルトでは```/resources/lang/en/validation.php```ファイルをバリデーションメッセージとして参照するため，```app.php```ファイルで言語を変更することと，日本語翻訳```validation.php```ファイルが必要である．

```php
<?php

return [

    # 〜 中略 〜

    'locale' => 'ja'
    
    # 〜 中略 〜
    
];
```

#### ・画面上でのエラーメッセージ出力

バリデーションでエラーがあった場合，Handlerクラスの```invalid```メソッドがコールされ，MessageBagクラスがViewに渡される．選択されたバリデーションメッセージが配列型でMessageBagクラスに格納されている．

参考：

- https://laravel.com/api/8.x/Illuminate/Foundation/Exceptions/Handler.html#method_invalid
- https://laravel.com/api/8.x/Illuminate/Support/MessageBag.html

```bash
( 
  [title] => Array
         (
            [0] => タイトルの入力は必須です
            [1] => タイトルは，最大255文字以下で指定してください
         )

  [body] => Array
         (
            [0] => 本文の入力は必須です
            [1] => 本文は，最大255文字以下で指定してください
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

#### ・```exists```メソッド

指定されたテーブルのカラムに値が存在しているかを検証する．

参考：https://laravel.com/api/8.x/Illuminate/Validation/Rule.html#method_exists

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FooRequest extends FormRequest
{
    /**
     * ルールを返却します．
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

テーブルにカラム数が多い場合は，Where句をつけることで，特定のカラムのみ検証することもできる．

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FooRequest extends FormRequest
{
    /**
     * ルールを返却します．
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

#### ・```in```メソッド

決められた複数の値に合致する値であるかどうかを検証する．

参考：https://laravel.com/api/8.x/Illuminate/Validation/Rule.html#method_in

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FooRequest extends FormRequest
{
    /**
     * ルールを返却します．
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

#### ・独自ルール/メッセージ

独自ルールを定義する場合は，Ruleクラスを継承したクラスを用意し，```rule```メソッドの中でインスタンスを作成する．独自Ruleクラスでは，```passes```メソッドでルールを定義する．また，```messages```メソッドでバリデーションメッセージを定義する．```validation.php```ファイルでメッセージを定義し，これを参照しても良い．

参考：https://laravel.com/docs/8.x/validation#custom-validation-rules

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
        // return trans('validation.uppercase'); validation.phpファイルから参照する．
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
     * ルールを返却します．
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

#### ・セッション変数の取得

FormRequestクラスの```session```メソッドを用いて，セッション変数を取得する．

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

全てのセッション変数を取得することもできる．

```php
$session = $request->session()->all();
```

#### ・フラッシュデータの設定

現在のセッションで，今回と次回のリクエストだけで有効な一時データを設定できる．

```php
$request->session()
    ->flash("status", "Task was successful!");
```

<br>

### Requestの認証

#### ・```authorize```メソッド

ユーザーがリソースに対してCRUD操作を行う権限を持っているかを，コントローラーのメソッドを実行する前に，判定する．

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

#### ・Authファサード

Authファサードの説明を参考にせよ．

<br>

## 11. Logging

### ログの出力先

#### ・設定方法

環境変数を```.env```ファイルに実装する．```logging.php```ファイルから，指定された設定が選択される．

参考：https://readouble.com/laravel/8.x/ja/logging.html#available-channel-drivers

```
LOG_CHANNEL=<オプション名>
```

なお，```storage```ディレクトリ以下にログファイルを生成するようなログチャンネルを設定した場合に，phpがこのディレクトリへのアクセス権限を持たないため，アクセスできるようにする必要がある．権限を変更したファイルは差分としてGitに認識されるため，これを共有すればチーム内で権限変更を共有できる．

```bash
# Failed to open stream: Permission denied
$ chmod -R 777 /var/www/foo/storage
```

#### ・PHP-FPMのログについて

LaravelとPHP-FPMのプロセスはそれぞれ独立しているため，Laravelのログの出力先を変更しても，PHP-FPMのログの出力先は変更されない．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_middleware_application_php_fpm.html

#### ・```stack```キー

他の単一/複数のチャンネルを利用するチャンネル．

```php
return [

    // ～ 中略 ～    

    "default"  => env("LOG_CHANNEL", "stack"),
    "channels" => [
        "stack" => [
            "driver"            => "stack",
            // 複数チャンネルを設定可能．（例）["single", "stack"]
            "channels"          => ["single"],
            "ignore_exceptions" => false,
        ],

        // ～ 中略 ～

    ]
];
```

#### ・```single```キー

全てのログを```/storage/logs/laravel.log```ファイルに対して出力する．

```php
return [

    // ～ 中略 ～    

    "default"  => env("LOG_CHANNEL", "stack"),
    "channels" => [
        "daily" => [
            "driver" => "daily",
            "path"   => storage_path("logs/laravel.log"),
            "level"  => env("LOG_LEVEL", "debug"),
            "days"   => 14,
        ],

        // ～ 中略 ～

    ]
];
```

#### ・```daily```キー

全てのログを```/storage/logs/laravel-<日付>.log```ファイルに対して出力する．

```php
return [

    // ～ 中略 ～    

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

        // ～ 中略 ～

    ]
];
```

#### ・```stderr```キー

全てのログを標準エラー出力に対して出力する．Docker上でLaravelを稼働させる場合は，生成されるログファイルでコンテナの容量が肥大化することを防ぐために，これを選択する．なお，独自カスタマイズとして，```stream```キーをstdout変更すれば，標準出力にログを出力することもできる．

```php
return [

    // ～ 中略 ～

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

        // ～ 中略 ～

    ]
];
```

<br>

### ログの出力

#### ・```error```メソッド

エラーメッセージを定義する時，```sprintf```メソッドを用いると便利である．

**＊実装例＊**

外部のAPIに対してリクエストを送信し，データを取得する．取得したJSONデータを，クライアントにレスポンスする．この時，リクエスト処理のために，Guzzleパッケージを用いている．

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

#### ・```info```メソッド

<br>


## 12. Migration

### artisanコマンド

#### ・マイグレーションファイルを作成

```bash
$ php artisan make:migration create_<テーブル名>_table
```

#### ・テーブル作成

マイグレーションファイルを元にテーブルを作成する．

```bash
$ php artisan migrate
```

コマンド実行時，以下のエラーが出ることがある．マイグレーションファイル名のスネークケースで，これがクラス名のキャメルケースと対応づけられており，ファイル名とクラス名の関係が正しくないために起こるエラーである．

```bash
Symfony\Component\Debug\Exception\FatalThrowableError : Class "CreateFooTable" not found
```

#### ・マイグレーションの結果を確認

```bash
$ php artisan migrate:status
```

#### ・指定した履歴数だけテーブルを元に戻す

指定した履歴数だけ，ロールバックを行う．

参考：https://readouble.com/laravel/8.x/ja/migrations.html#rolling-back-migrations

```bash
$ php artisan migrate:rollback --step=<ロールバック数>
```

実際の使用場面として，マイグレーションに失敗した場合，1つ前の状態にロールバックしてマイグレーションファイルを修正した後，再びマイグレーションを行う．

```bash
# マイグレーションに失敗したので，1つ前の状態にロールバック．
$ php artisan migrate:rollback --step=1

# ファイル修正後にマイグレーションを実行
$ php artisan migrate
```

#### ・初期の状態までテーブルを元に戻す

初期の状態まで，全てのロールバックを実行する．

参考：https://readouble.com/laravel/8.x/ja/migrations.html#rolling-back-migrations

```bash
$ php artisan migrate:reset
```

#### ・テーブルを元に戻してから再作成

全てのロールバック（```migrate:reset```）を実行し，次いで```migrate```を実行する．

参考：https://readouble.com/laravel/8.x/ja/migrations.html#roll-back-migrate-using-a-single-command

```bash
$ php artisan migrate:refresh
```
#### ・テーブルを削除してから再作成

全てのテーブルを削除と```migrate```を実行する．マイグレーションファイルの構文チェックを行わずに，強制的に実行される．

参考：https://readouble.com/laravel/8.x/ja/migrations.html#drop-all-tables-migrate

```bash
$ php artisan migrate:fresh
```

マイグレーション時，テーブルがすでに存在するエラーが起こることがある．この場合，テーブルがマイグレーションされる前までロールバックし，マイグレーションを再実行することが最適である．しかしそれが難しければ，このコマンドを実行する必要がある．

```bash
SQLSTATE[42S01]: <テーブル名> table or view already exists
```

#### ・確認画面の入力をスキップ

マイグレーション時，本当に実行して良いか確認画面（Yes/No）が表示される．CI/CDで，この確認画面でYes/Noを入力できないため，確認画面をスキップできるようにする必要がある．

参考：https://readouble.com/laravel/8.x/ja/migrations.html#forcing-migrations-to-run-in-production

```bash
$ php artisan migrate --force
```

<br>

### テーブルの作成/削除

#### ・```up```メソッド，```down```メソッド

コマンドによるマイグレーション時にコールされる．```up```メソッドでテーブル，カラム，インデックスのCREATEを実行する．```down```メソッドでCREATEのロールバックを実行する．

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

            // MigrationMacroServiceProviderのメソッドを用いる．
            $table->systemColumns();

            // deleted_atカラムを追加する．
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

#### ・なし

指定したカラムを追加する．

**＊実装例＊**

カラムを追加するためだけにマイグレーションファイルを作成する．

```bash
$ php artisan make:migration add_column --table=foos
```

追加したいカラムのみを定義する．

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

マイグレーションを実行すると，指定したテーブルのカラムが追加される．実行後は，作成したマイグレーションファイルを削除する．

```bash
$ php artisan migrate
```

#### ・```renameColumn```メソッド

指定したカラムの名前を変更する．

**＊実装例＊**

カラム名を変更するためだけにマイグレーションファイルを作成する．

```bash
$ php artisan make:migration rename_column --table=foos
```

テーブルのカラム名を定義し，```renameColumn```メソッドをコールする．変更後でも，ロールバックできるように，```down```メソッドも定義しておく．

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
        // データ型の変更後でも，ロールバックできるようにしておく．
        Schema::table('foos', function (Blueprint $table) {
            $table->renameColumn('foo_id', 'foo_id');
        });
    }
}
```

マイグレーションを実行すると，指定したテーブルのカラム名が変更される．実行後は，作成したマイグレーションファイルを削除する．

```bash
$ php artisan migrate
```

#### ・```change```メソッド

指定したカラムのデータ型を変更する．

**＊実装例＊**

データ型を変更するためだけにマイグレーションファイルを作成する．

```bash
$ php artisan make:migration change_column_data_type --table=foos
```

テーブルのカラムのデータ型を定義し，```change```メソッドをコールする．変更後でも，ロールバックできるように，```down```メソッドも定義しておく．

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
        // データ型の変更後でも，ロールバックできるようにしておく．
        Schema::table('foos', function (Blueprint $table) {
            $table->string('bar')->change();
        });
    }
}
```

マイグレーションを実行すると，指定したテーブルのカラムのデータ型が変更される．実行後は，作成したマイグレーションファイルを削除する．

```bash
$ php artisan migrate
```

#### ・```dropColumn```メソッド

指定したカラムを削除する．

**＊実装例＊**

カラムを削除するためだけにマイグレーションファイルを作成する．

```bash
$ php artisan make:migration drop_column --table=foos
```

削除するカラムを```dropColumn```メソッドで指定する．変更後でも，ロールバックできるように，```down```メソッドも定義しておく．

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

マイグレーションを実行すると，指定したテーブルのカラムが追加される．実行後は，作成したマイグレーションファイルを削除する．

```bash
$ php artisan migrate
```

<br>

### よく使うカラムタイプ

#### ・```bigIncrements```メソッド

AutoIncrementのINT型カラムを作成する．

**＊実装例＊**

```php
Schema::create("foos", function (Blueprint $table) {
    
    // ～ 中略 ～
    
    $table->bigIncrements("foo_id");
    
    // ～ 中略 ～
    
});
```

#### ・```string```メソッド

VARCHAR型カラムを作成する．

**＊実装例＊**

```php
Schema::create("foos", function (Blueprint $table) {
  
    // ～ 中略 ～    
    
    $table->string("name");
    
    // ～ 中略 ～
    
});
```

#### ・```timestamp```メソッド

TIMESTAMP型カラムを作成する．

**＊実装例＊**

```php
Schema::create("foos", function (Blueprint $table) {
    
    // ～ 中略 ～
    
    $table->timestamp("created_at");
    
    // ～ 中略 ～
});
```

<br>

## 13. Notification

### artisanコマンド

```bash

```

<br>

### 通知内容

#### ・Notification

通知内容を定義する．```via```メソッドで受信チャンネルを定義する．この時，Laravelがデフォルトで用意しているチャンネル（Mail，SMS，Slackチャンネル，Databaseチャンネル）以外に送信したい場合，Channelクラスを定義する必要がある．複数の値を設定した場合は，それぞれに通信が送信される．```toMail```メソッド，```toSms```メソッド，```toSlack```メソッド，```toArray```メソッド，を用いて，Laravelの標準のチャンネルに渡す通知内容を定義できる．

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
        // 受信チャンネルを選択します．
    }

    /**
     * @param $notifiable
     * @return string
     */
    public function toSms($notifiable)
    {
        // SMSのメッセージ内容を返却します．
    }

    /**
     * @param $notifiable
     * @return MailMessage
     */
    public function toMail($notifiable)
    {
        // Emailのメッセージ内容を返却します．
    }

    /**
     * @param $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        // DBへの保存方法を返却します．
    }
}
```

#### ・Eメール通知内容の定義

MailMessageクラスのメソッドを用いて，Eメール通知の内容を生成する．```markdown```メソッドを用いることで，マークダウン形式で定義できる．

参考：

- https://readouble.com/laravel/8.x/ja/notifications.html#writing-the-message
- https://laravel.com/api/8.x/Illuminate/Notifications/Messages/MailMessage.html#method_markdown

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
            $notifiable->prefers_sms ? [AwsSnsChannel::class] : [EmailChannel::class], // SMSでない場合は，Eメール通知とします．
            'database'
        ];
    }

    /**
     * @param $notifiable
     * @return MailMessage
     */
    public function toMail($notifiable)
    {
        // Emailのメッセージ内容を返却します．
        return (new MailMessage())->subject("コードを送信いたしました．")
            ->markdown("template.mail", [
                "tfa_token" => $notifiable->tfaToken()
            ]);
    }
}
```

```html
@component("mail::message")

認証コード『{ $tfa_token }}』を入力して下さい．<br>

+++++++++++++++++++++++++++++++++++++<br>
本アドレスは送信専用です．ご返信頂いてもお答えできませんので、ご了承ください．

@endcomponent
```

#### ・SMS通知内容の定義

参考：https://readouble.com/laravel/8.x/ja/notifications.html#formatting-sms-notifications

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
            $notifiable->prefers_sms ? [AwsSnsChannel::class] : [EmailChannel::class], // SMSの場合は，AWS-SNSを使用します．
            'database'
        ];
    }

    /**
     * @param $notifiable
     * @return string
     */
    public function toSms($notifiable)
    {
        // SMSのメッセージ内容を返却します．
        return view("template.sms", [
            "subject"   => "コードを送信いたしました．",
            "tfa_token" => $notifiable->tfaToken()
        ]);
    }  
}
```

#### ・Slack通知内容の定義

参考：https://readouble.com/laravel/8.x/ja/notifications.html#formatting-slack-notifications

#### ・DB通知内容の定義

配列でDBに保存する内容を定義する．

参考：https://readouble.com/laravel/7.x/ja/notifications.html#database-notifications

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
        // notificationsテーブルのdataカラムに，JSONで保存されます．
        return [
            "tfa_token" => $notifiable->tfaToken(),
        ];
    }
}
```

<br>

### 受信チャンネル（通知方法）

#### ・Channel

Laravelがデフォルトで用意しているチャンネル以外に送信したい場合，独自の受信チャンネルを定義する．これは，Notificationクラスの```via```メソッドで用いられる．

**＊実装例＊**

AWS SNSを受信チャンネルとする．AWSから配布されているパッケージが必要である．

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

            // AWS SNSにメッセージを送信します．
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
        // E.164形式の日本電話番号を返却します．
        return "+81" . substr($phoneNumeber, 1);
    }
}
```

<br>

### 通知対象モデル

#### ・Notifiableトレイトの```notify```メソッド

通知対象となるモデルを定義する．Notifiableトレイトを継承する．これにより，```notify```メソッドを使用できるようになる．

参考：https://laravel.com/api/8.x/Illuminate/Notifications/Notifiable.html

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

通知対象のクラスから```notify```メソッドをコールし，任意のNotificationクラスを渡す．これにより，通知処理が実行される．

参考：https://laravel.com/api/8.x/Illuminate/Notifications/RoutesNotifications.html#method_notify

```php
<?php

$user->notify(new FooNotification());
```

#### ・Notificationファサード

通知対象となるモデルを定義する．Notifiableトレイトを継承する．

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

Notificationファサードに通知対象のモデルと通知クラスを渡す．

```php
<?php

Notification::send($users, new FooNotification());
```

#### ・オンデマンド通知

オンデマンド通知を用いると，通知対象となるモデルがNotificableトレイトに依存せずに通知を実行できる．

参考：

- https://laracasts.com/discuss/channels/laravel/notifications-without-eloquent-user-model
- https://readouble.com/laravel/8.x/ja/notifications.html#on-demand-notifications

```php
<?php

Notification::route('mail', $user->email_address)
            ->route('nexmo', $user->phone_number)
            ->route('slack', $slackMessage->usl)
            ->notify(new FooMotification());
```

<br>

## 14. Resource

### artisanコマンド

#### ・Resourceの生成

Resourceクラスを自動生成する．

```bash
$ php artisan make:resource <Resource名>
```

<br>

### レスポンスデータ作成前のデータ型変換

#### ・データ型変換の必要性

EloquentモデルをJSONデータとしてレスポンスする時に，一旦，配列データに変換する必要がある．

#### ・単一のEloquentモデルの配列化

単一のEloquentモデルを配列に変換する．Resourceクラスの```toArray```メソッドにて，```this```変数は自身ではなく，Resourceクラス名につくEloquentモデル名になる．また，```this```変数からゲッターを経由せずに直接プロパティにアクセスできる．Controllerにて，ResouceクラスにEloquentモデルを渡すようにする．LaravelはレスポンスのJSONデータを作成するために，まず```toArray```メソッドにより配列化し，さらにこれをJSONデータに変換する．

**＊実装例＊**

Fooクラスからデータを取り出し，配列化する．

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FooJsonResource extends JsonResource
{
    /**
     * オブジェクトを配列に変換します．
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
}．
```

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * クライアントにデータを返却します．
     *
     * @param  Request  $request
     * @return Response
     */
    public function index(Request $request)
    {
        // ここに，Eloquentモデルをデータベースから取得する処理
        
        // Eloquentモデルを渡す．
        return new FooResource($foo);
    }
}
```

#### ・複数のEloquentモデル（Collection型）の配列化

複数のEloquentモデル（Collection型）を配列に変換する．

```php
// ここに実装例
```

<br>

## 15. Routing

### artisanコマンド

#### ・ルーティング一覧

```bash
# ルーティングの一覧を表示する
$ php artisan route:list
```

#### ・キャッシュ削除

```bash
# ルーティングのキャッシュを削除
$ php artisan route:clear

# 全てのキャッシュを削除
$ php artisan optimize:clear
```

<br>

### ```api.php```ファイル

#### ・Middlewareの適用

APIのエンドポイントとして働くルーティング処理を実装する．実装したルーティング処理時には，Kernelクラスの```middlewareGroups```プロパティの```api```キーで設定したミドルウェアが実行される．APIのエンドポイントは外部公開する必要があるため，```web```キーと比較して，セキュリティのためのミドルウェアが設定されていない．

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

#### ・Middlewareの適用

API以外のルーティング処理を実装する．実装したルーティング処理時には，Kernelクラスの```middlewareGroups```プロパティの```web```キーで設定したミドルウェアが実行される．API以外のルーティングは外部公開する必要がないため，```api```キーと比較して，セキュリティのためのミドルウェアが多く設定されている．例えば，CSRF対策のためのVerifyCsrfTokenクラスがある．

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

ヘルスチェックなど，API認証が不要なルーティング処理を実装する．

<br>

### 暗黙のモデル結合

#### ・コントローラー使用時

ルーティング時に用いるパラメータ名とコントローラーのメソッドの引数型と変数名が同じであり，かつパラメータに数値が割り当てられた場合，その数値をIDとするEloquentモデルが自動的にインジェクションされる．

参考：https://readouble.com/laravel/8.x/ja/routing.html#implicit-binding

**＊実装例＊**

ルーティング時に，パスパラメータ名を```user```としておく．

```php
<?php
    
Route::get('/users/{user}', 'UserController@index');
```

かつ，コントローラーのメソッドの引数型/変数名を```User```/```$user```とする．または．この時，『```/users/1```』に対してリクエストが送信されると，ユーザーIDが```1```のユーザーがDBから読み出され，コントローラーにインジェクションされる．

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
        $id = $user->id; // パスパラメータのidに紐付くユーザーが自動的に渡されている．
    }
}
```

<br>

## 16. Seeder

### artisanコマンド

#### ・Seederの生成

Seederクラスを自動生成する．

```bash
$ php artisan make:seeder <Seeder名>
```

#### ・Seederの実行

Seederを新しく作成した時やSeeder名を変更した時，Composerの```dump-autoload```を実行する必要がある．

```bash
$ composer dump-autoload
```

```bash
# 特定のSeederを実行
$ php artisan db:seed --class=<Seeder名>

# DatabaseSeederを指定して，全てのSeederを実行
$ php artisan db:seed --class=<Seeder名>
```

<br>

### 初期リアルデータの定義

#### ・DBファサードによる定義

```php
<?php

use Illuminate\Database\Seeder;
use App\Constants\ExecutorConstant;

class ProductsSeeder extends Seeder
{
    /**
     * Seederを実行します．
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
            
            // ～ 中略 ～
            
        ]);
    }
}
```

実行者名は，定数として管理しておくとよい．

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

#### ・CSVファイルによる定義

```php
// ここに実装例
```

<br>

### Seederの実行

DatabaseSeederにて，全てのSeederをまとめて実行する．

```php
<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seederを実行します．
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
        
        // ステージング環境用の初期データ
        if (App::environment("staging")) {
            $this->call([
                // リアルデータ
                ProductsSeeder::class
            ]);
        }
        
        // 本番環境用の初期データ
        if (App::environment("production")) {
            $this->call([
                // リアルデータ
                ProductsSeeder::class
            ]);
        }
    }
}
```

<br>

## 17. ServiceProvider

### artisanコマンド

#### ・クラスの自動生成

```bash
$ php artisan make:provider <クラス名>
```

<br>

### ServiceProvider

#### ・ServiceProviderの用途

| 用途の種類                                                   | 説明                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| AppServiceProvider                                           | ・ServiceContainerへのクラスのバインド（登録）<br>・ServiceContainerからのインスタンスのリゾルブ（生成） |
| MacroServiceProvider                                         | ServiceContainerへのメソッドのバインド（登録）               |
| RouteServiceProvider<br>（```app.php```，```web.php```も使用） | ルーティングとコントローラーの対応関係の定義                   |
| EventServiceProvider                                         | EventListenerとEventhandler関数の対応関係の定義              |

#### ・ServiceProviderのコール

クラスの名前空間を，```config/app.php```ファイルの```providers```配列に登録すると，アプリケーションの起動時にServiceProviderをコールできるため，ServiceContainerへのクラスのバインドが自動的に完了する．

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

#### ・ServiceContainer，バインド，リゾルブとは

ServiceContainer，バインド，リゾルブについては，以下を参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_object_oriented_language_php_class_based.html

```php
<?php

namespace Illuminate\Contracts\Container;

use Closure;
use Psr\Container\ContainerInterface;

interface Container extends ContainerInterface
{
    /**
     * 通常のバインディングとして，自身にバインドする．
     * 第二引数は，クロージャー，もしくはクラス名前空間
     *
     * @param  string  $abstract
     * @param  \Closure|string|null  $concrete
     * @param  bool  $shared
     * @return void
     */
    public function bind($abstract, $concrete = null, $shared = false);
    
    /**
     * singletonとして，自身にバインドする．
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

#### ・単一のクラスをバインド/リゾルブ

AppSeriveProviderにて，ServiceContainerにクラスをバインドすることによって，ServiceContainerがインスタンスをリゾルブできるようになる．これにより，メソッドの引数でクラスを指定しさえすれば，そのクラスのインスタンスが渡されるため，自動的に依存オブジェクト注入が実行されたことになる．Laravelでは，クラスはServiceContainerに自動的にバインドされており，引数でクラスを指定するだけでインスタンスが生成されるため，以下の実装を実行する必要はない．ただし，混合型の場合は引数の型を指定できないため，リゾルブは実行できない．

参考：https://readouble.com/laravel/8.x/ja/container.html#automatic-injection

**＊実装例＊**

バインドする．なお，Laravelでは不要である．

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

引数の型を元に，クラスのインスタンスがリゾルブされる．

```php
<?php

class Qux
{
    /**
     * @param Foo $foo
     */
    public function method(Foo $foo) // リゾルブされる．
    {
        $foo->bar;
        $foo->baz;
    }
}
```

引数の型を指定しない場合は，手動で渡す必要がある．

```php
<?php

use App\Models\Foo;

class Qux
{
    /**
     * @param Foo $foo
     */
    public function __construct($foo) // 引数の型を指定しない場合，リゾルブされない．
    {
        $foo->bar;
        $foo->baz;
    }
}

$foo = new Foo();
$qux = new Qux($foo); // 手動で渡す
```

混合型の場合は，引数の型を指定できないため，リゾルブを実行できない．

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

#### ・複数のクラスをバインド/リゾルブ

メソッドの引数でクラスを指定しさえすれば，そのクラスのインスタンスが渡されるため，自動的に依存オブジェクト注入が実行されたことになる．

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
    * 二つ目のクラスをバインド
    */    
    private function registerBar()
    {
        $this->app->bind(Bar::class, function ($app) {
            return new Bar();
        });
    }
    
    /**
    * 三つ目のクラスをバインド
    */
    private function registerBaz()
    {
        $this->app->bind(Baz::class, function ($app) {
            return new Baz();
        });
    }
}
```

#### ・インターフェースをバインドし，実装クラスをリゾルブ

Laravelではクラスが自動的にバインドされ，これのインスタンスがリゾルブされる，しかし，バインドされたクラスとは別のクラスのインスタンスをリゾルブしたい場合は，ServiceProviderにそれを定義すれば，自動的なバインドを上書きできる．これを用いて，インターフェースをバインドし，実装クラスをリゾルブできるようにする．この方法は，上位レイヤーが抽象に依存することが必要な場面（例：依存性逆転の原則）で役立つ．

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
    public function __constructor(FooRepositoryIF $fooRepository) // リゾルブされる．
    {
        $this->fooRepository = $fooRepository;
    }
}
```

#### ・```make```メソッド

引数の型でリゾルブを実行する以外に，```make```メソッドを用いることも可能である．```make```メソッドの引数にクラスの名前空間を渡すことで，インスタンスがリゾルブされる．

参考：https://readouble.com/laravel/8.x/ja/container.html#the-make-method

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

// Fooクラスをリゾルブし，そのままmethodをコール
$result = app()->make(Foo::class)
    ->method();

// Fooクラスをリゾルブ
$foo = App::make(Foo::class);
$result = $foo->method();
```

#### ・```register```メソッドと```boot```メソッドの違い

Laravelのライフサイクルで，ServiceContainerへのクラスのバインドの時には，まずServiceProviderの```register```メソッドが実行され，その後に```boot```メソッドが実行される．そのため，ServiceProviderが他のServiceProviderをコールするような処理を実装したいとき，これは```boot```メソッドに実装することが適している．

<br>

### MigrationMacroServiceProvider

複数のテーブルに共通のカラムを構築するマイグレーション処理を提供する．

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
     * サービスコンテナにマイグレーションメソッドをバインドします．
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

マイグレーションファイルにて，定義した```systemColumn```メソッドをコールする．

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
            
            // MigrationMacroServiceProviderのメソッドを用いる．
            $table->systemColumns();
            
            // deleted_atカラムを追加する．
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

最後に，```app.php```ファイルにて，MigrationMacroServiceProviderを新しく読み込む．

```php
<?php

return [
    
    # 中略
    
    'providers' => [
        // マクロサービスプロバイダー
        App\Providers\MigrationMacroServiceProvider::class,  
    ],
    
    # 中略
    
];        
```



<br>

### RouteServiceProvider

#### ・全てのルーティングへの処理

ルーティングの設定ファイルをコールする．また，全てのルーティングに適用する処理を定義する．

参考：https://readouble.com/laravel/8.x/ja/routing.html#parameters-global-constraints

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
     * ルーティングの設定ファイルをコールします．
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

#### ・リクエスト数制限

一分間当たりに許容するリクエスト数とその制限名を```configureRateLimiting```メソッドで定義する．さらに，Throttleミドルウェアに制限名を渡し，指定したルートにリクエスト数制限を適用させる，もし制限を超えた場合，```configureRateLimiting```メソッドによって，```429```ステータスでレスポンスが返信される．

参考：https://readouble.com/laravel/8.x/ja/routing.html#rate-limiting

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
            // throttleミドルウェアを適用する．
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
            // 一分間当たり1000リクエストまでを許可する．
            return Limit::perMinute(1000);
        });
    }
}
```



<br>

### EventServiceProvider

#### ・EventとListenerの登録

EventとListenerの対応関係を定義する．なお，Eventを発火させてListenerを実行する方法は，Eventコンポーネントを参照せよ．

```php
<?php

namespace App\Providers;

use App\Events\UpdatedModelEvent;
use App\Listeners\UpdatedModelListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * イベントとリスナーの対応関係を配列で定義します．
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

### セキュリティ

#### ・CSRF対策

セッション開始時にCSRFトークンが生成される．Bladeを用いてサーバ側のCSRFトークンを取り出し，inputタグのhidden属性にCSRFトークンを割り当て送信する．

参考：https://readouble.com/laravel/8.x/ja/csrf.html

```html
<form method="POST" action="/profile">
    @csrf
    ...
</form>
```

Bladeを用いない場合，セッション開始時のレスポンスの```Set-Cookie```にCSRFトークンが割り当てられるため，これを取り出して```X-CSRF-TOKEN```ヘッダーや```X-XSRF-TOKEN```ヘッダーに割り当てるようにする．リクエストのたびに異なるCSRFトークンがレスポンスされ，これを次のリクエストで用いる必要がある．

参考：

- https://readouble.com/laravel/8.x/ja/csrf.html#csrf-x-csrf-token
- https://readouble.com/laravel/8.x/ja/csrf.html#csrf-x-xsrf-token
- https://stackoverflow.com/questions/42408177/what-is-the-difference-between-x-xsrf-token-and-x-csrf-token

ちなみに，PostmanなどのHTTPクライアントツールをフロントエンドの代わりに用いる場合は，レスポンスで返信されるCSRFトークを扱えない，そこで，各リクエストで事前にルートパスのエンドポイントをコールし，CSRFトークンをPostmanの環境変数に保存するようなスクリプトを設定しておくと良い．

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

    // laravelによってエンコードされたトークンをデコードする．
    const xsrfToken = decodeURIComponent(xsrfTokenHeader['value']);
    // 環境変数を挿入するために，該当する環境名をCollection全体に適用しておく必要がある．
    pm.environment.set('XSRF_TOKEN', xsrfToken);
    console.log(xsrfToken);
    return true;
});
```

#### ・XSS対策

#### ・常時HTTPS化

<br>

### MySQL

#### ・単一のデータベースの場合

単一のデータベースに接続する場合，```DB_HOST```を1つだけ設定する．

```php
<?php

return [

    // ～ 中略 ～    

    "default" => env("DB_CONNECTION", "mysql"),

    "connections" => [

        // ～ 中略 ～

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

    // ～ 中略 ～        

];
```

#### ・DBクラスターの場合

DBクラスターに接続する場合，書き込み処理をプライマリインスタンスに向け，また読み出し処理をリードレプリカに向けることにより，負荷を分散できる．この場合，環境変数に二つのインスタンスのホストを実装する必要がある．

参考：https://readouble.com/laravel/8.x/ja/database.html#contentContainer:~:text=Read%EF%BC%8FWrite%E6%8E%A5%E7%B6%9A

```
DB_HOST_PRIMARY=<プライマリインスタンスのホスト>
DB_HOST_READ=<リードレプリカのホスト>
```

なお，```sticky```キーを有効化しておくとよい．プライマリインスタンスにおけるデータ更新がリードレプリカに同期される前に，リードレプリカに対して読み出し処理が起こるような場合，これを防げる．

```php
<?php
    
return [

    // ～ 中略 ～

    "default" => env("DB_CONNECTION", "mysql"),

    "connections" => [

        // ～ 中略 ～

        "mysql" => [
            "driver"         => "mysql",
            "url"            => env("DATABASE_URL"),
            "read"           => [
                "host" => [
                    env("DB_HOST_PRIMARY", "127.0.0.1"),
                ],
            ],
            "write"          => [
                "host" => [
                    env("DB_HOST_READ", "127.0.0.1"),
                ],
            ],
            # stickyキーは有効化しておいたほうがよい．
            "sticky"         => true,
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

    // ～ 中略 ～

];
```

<br>

## 18. Session

### セッションの操作

#### ・設定ファイル

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

    // Set-Cookieヘッダーのdomain属性に値を割り当てる．
    'domain'    => env('SESSION_DOMAIN', null),

    // Set-Cookieヘッダーのsecure属性を有効化する．
    'secure'    => env('SESSION_SECURE_COOKIE', false),

    // Set-CookieヘッダーのHttpOnly属性を有効化する．
    'http_only' => true,

    // Set-CookieヘッダーのsameSite属性に値を割り当てる．nullの場合，Laxとなる．
    'same_site' => null,
];
```

#### ・よく使う操作メソッド

FormRequestクラスの```session```メソッドはStoreクラスを返却する．このクラスのメソッドを用いて，セッションを操作できる．

| メソッド名   | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| ```get```    | セッションのキー名を指定して，1つの値を取得する．           |
| ```all```    | セッションの全ての値を取得する．                             |
| ```forget``` | セッションのキー名を指定して，値を取得する．キー名を配列で渡して，複数個を削除することも可能． |
| ```flush```  | セッションの全ての値を取得する．                             |
| ```pull```   | セッションのキー名を指定して，1つの値を取得し，取得後に削除する． |
| ```has```    | セッションのキー名を指定して，値が存在しているかを検証する．```null```は```false```として判定する． |

参考：https://laravel.com/api/8.x/Illuminate/Session/Store.html

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

#### ・セッションファイルがStoreクラスに至るまで

全てを追うことは難しいので，StartSessionクラスの```handle```メソッドが実行されるところから始めるものとする．ここで，```handleStatefulRequest```メソッドの中の```startSession```メソッドが実行される．これにより，Storeクラスの```start```メソッド，```loadSession```メソッド，```readFromHandler```メソッドが実行され，```SessionHandlerInterface```の実装クラスの```read```メソッドが実行される．```read```メソッドは，```storage/framework/sessions```にあるセッションファイルに書き込まれたセッションを読み出し，```attribute```プロパティに格納する．Sessionクラスのメソッドは，```attribute```プロパティを用いて，セッションを操作する．最終的に,```handleStatefulRequest```では，```saveSession```メソッドの中の```save```メソッドが実行され，セッションファイルに新しい値が書き込まれる．

参考：

- https://laravel.com/api/8.x/Illuminate/Session/Middleware/StartSession.html#method_handle
- https://laravel.com/api/8.x/Illuminate/Session/Middleware/StartSession.html#method_handleStatefulRequest
- https://laravel.com/api/8.x/Illuminate/Session/Middleware/StartSession.html#method_startSession
- https://laravel.com/api/8.x/Illuminate/Session/Store.html#method_start
- https://laravel.com/api/8.x/Illuminate/Session/Store.html#method_loadSession
- https://laravel.com/api/8.x/Illuminate/Session/Store.html#method_readFromHandler
- https://www.php.net/manual/ja/sessionhandlerinterface.read.php
- https://laravel.com/api/8.x/Illuminate/Session/Middleware/StartSession.html#method_saveSession
- https://laravel.com/api/8.x/Illuminate/Session/Store.html#method_save
- https://www.php.net/manual/ja/sessionhandlerinterface.write.php

<br>

## 19. Views

### arisanによる操作

#### ・キャッシュの削除

```bash
# ビューのキャッシュを削除
$ php artisan view:clear

# 全てのキャッシュを削除
$ php artisan optimize:clear
```

<br>

### データの出力

#### ・データの出力

Controllerクラスから返却されたデータは，```{{ 変数名 }}```で取得できる．`

**＊実装例＊**

```html
<html>
    <body>
        <h1>Hello!! {{ $data }}</h1>
    </body>
</html>
```

#### ・バリデーションメッセージの出力

バリデーションでエラーが起こった場合，バリデーションでエラーがあった場合，Handlerクラスの```invalid```メソッドがコールされ，MessageBagクラスがViewに渡される．MessageBagクラスは，Blade上で```errors```変数に格納されており，各メソッドをコールしてエラーメッセージを出力できる．

参考：https://laravel.com/api/8.x/Illuminate/Support/MessageBag.html

**＊実装例＊**

MessageBagクラスの```all```メソッドで，全てのエラーメッセージを出力する．

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
        <p>登録が完了しました．</p>
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

#### ・```@include```（サブビュー）

読み込んだファイル全体を出力する．読み込むファイルに対して，変数を渡すこともできる．```@extentds```との使い分けとして，親子関係のないテンプレートの間で用いるのがよい．両者は，PHPでいう```extends```（クラスチェーン）と```require```（単なる読み込み）の関係に近い．

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

#### ・```@yield```，```@extends```，```@section```，```@endsection```

子テンプレートのレンダリング時に，子テンプレートで新しく定義したHTMLの要素を，親テンプレートの指定した場所に出力する．親テンプレートにて，```@yield("foo")```を定義する．

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

これを子テンプレートで```@extends```で継承すると，レンダリング時に，子テンプレートの```@section("foo")```-```@endsection```で定義した要素が，親テンプレートの```@yieid```メソッド部分に出力される．

**＊実装例＊**

```html
<!-- 子テンプレート -->

@extends("layouts.parent")

@section("content")
    <p>子テンプレートのレンダリング時に，yieldに出力される要素</p>
@endsection
```

ちなみに，子テンプレートは，レンダリング時に以下のように出力される．

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
        <p>子テンプレートのレンダリング時に，yieldに出力される要素</p>
    </body>
</html>
```

#### ・```@section```，```@show```，```@extends```，```@parent```

子テンプレートのレンダリング時に，親テンプレートと子テンプレートそれぞれで新しく定義したHTMLの要素を，親テンプレートの指定した場所に出力する．親テンプレートにて，```@section```-```@show```で要素を定義する．

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

子テンプレートの```@section```にて，```@parent```を用いる．親テンプレートと子テンプレートそれぞれの要素が出力される．

**＊実装例＊**

```html
<!-- 子テンプレート -->

@extends("layouts.app")

@section("sidebar")
    @parent
    <p>子テンレプートのサイドバーに追加される要素</p>
@endsection
```

ちなみに，子テンプレートは，レンダリング時に以下のように出力される．

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

#### ・```@stack```，```@push```

子テンプレートのレンダリング時に，CSSとJavaScriptのファイルを動的に出力する場合に用いる．親テンプレートにて，```@stack("foo")```を定義する．これを継承した子テンプレートのレンダリング時に，```@push("foo")```-```@endpush```で定義した要素が，```@stack```メソッド部分に出力される．

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

#### ・Bladeで実装した場合

**＊実装例＊**

```html
<!-- 親テンプレート -->

<html>
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

#### ・Twigで実装した場合

**＊実装例＊**

```html
<!-- 親テンプレート -->

<html>
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

<br>

## 21. Laravel Mixパッケージ

### Laravel Mixパッケージとは

WebpackをLaravelを介して操作できるパッケージのこと．Breezeパッケージにも同梱されている．

参考：https://readouble.com/laravel/8.x/ja/mix.html

<br>

### Webpackを操作するコマンド

#### ・アセットの初期コンパイル

アセットのコンパイルを実行する．

```bash
$ npm run dev
```

#### ・アセットの自動再コンパイル

アセットのソースコードが変更された時に，これと検知し，自動的に再コンパイルを実行する．

```bash
$ npm run watch
```

<br>

## 22. 非公式パッケージ

### laravel-enum

#### ・ソースコード

参考：https://github.com/BenSampo/laravel-enum

#### ・Enumクラスの定義

BenSampoのEnumクラスを継承し，区分値と判定メソッドを実装する．

**＊実装例＊**

```php
<?php

namespace App\Domain\ValueObject\Type;

use BenSampo\Enum\Enum;

class RoleType extends Enum
{
    public const CALL_ROLE = 1;        // コールセンター職  
    public const DEVELOPMENT_ROLE = 2; // 開発職    
    public const FINANCE_ROLE = 3;     // 経理職     
    public const PLAN_ROLE = 4;        // 企画職       
    public const SALES_ROLE = 5;       // 営業職
    
    /**
     * コールセンター職の区分値を持つかどうかを判定します．
     */    
    public function isCallRole()
    {
        return $this->is(self::CALL_ROLE);
    }
    
    /**
     * 開発職の区分値を持つかを判定します．
     */       
    public function isDevelopmentRole()
    {
        return $this->is(self::DEVELOPMENT_ROLE);
    }
    
    /**
     * 経理職の区分値を持つかどうかを判定します．
     */       
    public function isFinanceRole()
    {
        return $this->is(self::FINANCE_ROLE);
    }
    
    /**
     * 企画職の区分値を持つかどうかを判定します．
     */       
    public function isPlanRole()
    {
        return $this->is(self::PLAN_ROLE);
    }  
    
    /**
     * 営業職の区分値を持つかどうかを判定します．
     */       
    public function isSalesRole()
    {
        return $this->is(self::SALES_ROLE);
    }        
}
```

#### ・Enumクラスの使い方

**＊実装例＊**

データベースから区分値をSELECTした後，これを元にEnumクラスを作成する．

```php
<?php

// Staff
$staff = new Staff();
 
// データベースから取得した区分値（開発職：2）からEnumクラスを作成
$staff->roleType = new RoleType($fetched["role_type"]);
// 以下の方法でもよい．
// $staff->roleType = RoleType::fromValue($fetched["role_type"]);

// StaffがいずれのRoleTypeを持つか
$staff->roleType->isDevelopmentRole(); // true
$staff->roleType->isSalesRole(); // false
```

<br>

### laravel-ide-helper

#### ・laravel-ide-helperとは

PHPStromでLaravelを開発する場合，拡張機能を提供する．

参考：

- https://github.com/barryvdh/laravel-ide-helper#phpstorm-meta-for-container-instances
- https://pleiades.io/help/phpstorm/laravel.html

プロバイダーの登録が必要．

```php
<?php
    
return [

    // ...

    'providers' => [
        
        // ...
        
        // Laravel IDE helper
        'Barryvdh\LaravelIdeHelper\IdeHelperServiceProvider::class',
    ],
    
    // ...

];
```

#### ・Facade

PHPStromで，メソッドが定義された場所にジャンプできるように，```_ide_helper.php```ファイルを生成する．

参考：https://github.com/barryvdh/laravel-ide-helper#automatic-phpdoc-generation-for-laravel-facades

```bash
$ php artisan ide-helper:generate
```

#### ・アノテーション生成

PHPStromで，LaravelのEloquentモデルでのアノテーションを自動生成する．

参考：https://github.com/barryvdh/laravel-ide-helper#automatic-PHPDocs-for-models

```bash
$ php artisan ide-helper:models
```

#### ・予測表示

PHPStromで，Laravelのメソッドを予測表示できるように，phpstorm.meta.php```ファイルを生成する．

参考：https://github.com/barryvdh/laravel-ide-helper#phpstorm-meta-for-container-instances

```bash
$ php artisan ide-helper:meta
```

