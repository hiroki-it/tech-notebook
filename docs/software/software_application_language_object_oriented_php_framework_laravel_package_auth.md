---
title: 【知見を記録するサイト】認証/認可系パッケージ@Laravel
description: 認証/認可系パッケージ@Laravelの知見をまとめました．
---

# 認証/認可系パッケージ@Laravel

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 認証

### ガード

#### ・ガードとは

ドライバーとプロバイダーを定義する．

参考：https://readouble.com/laravel/8.x/ja/authentication.html#introduction

| ガードの種類 | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| Webガード    | セッションIDを用いたForm認証のために用いる．                 |
| APIガード    | Bearer認証，APIキー認証，OAuth認証，などのために用いる．それぞれの認証方法に違いについては，以下のリンクを参考にせよ．<br>参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_authentication_authorization.html |

#### ・カスタムガード

Laravelがデフォルトで持たないドライバーとプロバイダーを持つガードを定義する．

参考：https://readouble.com/laravel/8.x/ja/authentication.html#adding-custom-guards

APIガードの認証で用いるトークンをJWTに変更したい時には，以下のパッケージがおすすめ．

参考：https://github.com/tymondesigns/jwt-auth

<br>

### ドライバー

#### ・ドライバーとは


| ドライバーの種類  | 認証の種類                         | 実装クラス         | 備考                                                         |
| ----------------- | ---------------------------------- | ------------------ | ------------------------------------------------------------ |
| sessionドライバー | セッションIDを用いたForm認証       | SessionGuardクラス | https://laravel.com/api/8.x/Illuminate/Auth/SessionGuard.html |
| tokenドライバー   | Bearer認証，APIキー認証，OAuth認証 | TokenGuardクラス   | https://laravel.com/api/8.x/Illuminate/Auth/TokenGuard.html  |

ドライバーの種類に応じて，AuthManagerクラスがGuardインターフェースの実装クラスを返却する．```auth.php```ファイルにて，例えばtokenドライバーを選択した場合は，TokenGuardクラスが返却される．

参考：

- https://teratail.com/questions/171582
- https://laravel.com/api/8.x/Illuminate/Auth/AuthManager.html
- https://laravel.com/api/8.x/Illuminate/Contracts/Auth/Guard.html#method_user
- https://laravel.com/api/8.x/Illuminate/Auth/TokenGuard.html#method_user

```php
<?php

return [

    // ガード
    'guards' => [
        'web' => [
            // セッションドライバー
            'driver'   => 'session',
            'provider' => 'users',
        ],

        'api' => [
            // トークンドライー
            'driver'   => 'token',
            'provider' => 'users',
            'hash'     => false,
        ],
    ],
];
```

#### ・ルーティングの保護

BeforeMiddlwareで認証済みのユーザーかどうかを検証し，もし未認証の場合は，ログインページにリダイレクトさせる．これにより，未認証のユーザーがコントローラーを実行することを防ぐ．

参考：https://qiita.com/yamotuki/items/b96978f8e379e285ecb6

<br>

### プロバイダ

#### ・プロバイダとは

認証データをDBから取得するオブジェクトを定義する．

参考：https://readouble.com/laravel/8.x/ja/authentication.html#introduction

<br>

### セッションIDを用いたForm認証

#### ・sessionドライバー

sessionドライバーを選択する．

#### ・全てのユーザーが同一権限を持つ場合

SessionGuardクラスの```attempt```メソッドをコールしてパスワードをハッシュ化し，DBのハッシュ値と照合する．認証が成功すると，認証セッションを開始する．```redirect```メソッドで，認証後の初期ページにリダイレクトする．

参考：https://readouble.com/laravel/8.x/ja/authentication.html#authenticating-users

```php
<?php

namespace App\Http\Controllers\Authentication;

use App\Http\Requests\Authentication\AuthenticationRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

final class AuthenticationController
{
    /**
     * @return RedirectResponse
     */
    public function authenticate(AuthenticationRequest $authenticationRequest)
    {
        $validated = $authenticationRequest->validated();

        if (Auth::attempt($validated)) {
            // セッションID固定化を防ぐために，認証後にセッションを再作成します．
            $authenticationRequest->session()->regenerate();

            // 認証後のWebページにリダイレクトします．
            return redirect(RouteServiceProvider::HOME);
        }

        // 未認証のWebページにリダイレクトします．
        return redirect(RouteServiceProvider::UNAUTHORIZED);
    }
}
```

認証後のページはRouteServiceProviderクラスで定義しておく．

```php
<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    public const HOME = "/home";
}
```

#### ・一部のユーザーが異なる権限を持つ場合

ユーザーごとに認証方法を区別しつつ，同一の認証後のWebページにリダイレクトさせられる．

参考：https://blog.capilano-fw.com/?p=8159

**＊実装例＊**

権限の異なるユーザーに応じたガード，またガードに紐付けるEloquentモデルをプロバイダを定義しておく．

```php
<?php

return [

    // ガード
    'guards' => [
        'web' => [
            'driver'   => 'session',
            'provider' => 'users',
        ],

        'api' => [
            'driver'   => 'token',
            'provider' => 'users',
            'hash'     => false,
        ],
        // 一般ユーザー
        'users'          => [
            'driver'   => 'session',
            'provider' => 'users',
        ],
        // 管理者
        'administrators' => [
            'driver'   => 'session',
            'provider' => 'administrators',
        ],
    ],

    // プロバイダ
    'providers' => [
        // 一般ユーザー
        'users'          => [
            'driver' => 'eloquent',
            'model'  => App\Models\User::class,
        ],
        // 管理者
        'administrators' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Administrator::class,
        ]
    ],
];

```

Authファサードの```guard```メソッドを用いて，ガードに応じた認証を実行する．これにより，同一の認証後ページにリダイレクトした後に，ユーザーのEloquentモデルに応じた処理を実行できるようになる．

```php
<?php

namespace App\Http\Controllers\Authentication;

use App\Http\Requests\Authentication\AuthenticationRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

final class AuthenticationController
{
    /**
     * @return RedirectResponse
     */
    public function login(AuthenticationRequest $authenticationRequest)
    {
        $validated = $authenticationRequest->validated();

        // guardに応じた認証を行います．
        if (Auth::guard($authenticationRequest->guard)->attempt($validated)) {
            
            // セッションID固定化を防ぐために，認証後にセッションを再作成します．
            $authenticationRequest->session()->regenerate();

            // ユーザー用認証後のWebページにリダイレクトします．
            return redirect(RouteServiceProvider::HOME);
        }

        // 未認証のWebページにリダイレクトします．
        return redirect(RouteServiceProvider::UNAUTHORIZED);
    }
}

```

<br>

### 認証済みかどうかの判定

#### ・```user```メソッド

現在のセッションにおけるユーザーが認証済みであれば，ユーザーのEloquentモデルを取得する．

```php
<?php

// Illuminate\Contracts\Auth\Guard
// ドライバーに応じて，リゾルブされるGuardの実装クラス決まる
$user = auth()->user();
```

#### ・```check```メソッド

現在のセッションにおけるユーザーが認証済みであれば，```true```を返却する．

**＊実装例＊**

認証済みのユーザーがブラウザを閉じたとしても，セッションが続いている（例：ログアウトしない）限り，認証処理を改めて実行する必要はない．そのために，BeforeMiddlewareを用いて，認証済みのユーザーからのリクエストを認証済みページにリダイレクトさせる．

````php
<?php

namespace App\Http\Middleware\Auth;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticated
{
    /**
     * @param Request $request
     * @param Closure $next
     * @param mixed   ...$guards
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$guards)
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (auth()->guard($guard)->check()) {
                // ユーザーが認証済みの場合は，認証後のWebページにリダイレクトします．
                return redirect(RouteServiceProvider::HOME);
            }
        }

        return $next($request);
    }
}

````

<br>

## 02. 認可

### ゲート

#### ・ゲートとは

Eloquentモデルレベルの認可スコープを定義する．指定したEloquentモデルに紐付く全てのDBレコードにアクセスできなくなる．

<br>

### ポリシー

#### ・ポリシーとは

DBレコードレベルの認可スコープを定義する．Eloquentモデルに紐付く特定のレコードにアクセスできなくなる．Policyクラスのメソッドによって，リクエスト中の認証済みユーザーが自動的にインジェクションされる．EloquentモデルとPolicyクラスの紐付けはAuthServiceProviderクラスで定義する

参考：https://qiita.com/mpyw/items/8c5413b99b8e299f7002#%E7%AC%AC1%E5%BC%95%E6%95%B0%E3%81%AF%E5%BF%85%E3%81%9A-authenticatable-%E3%81%AB%E3%81%AA%E3%82%8B%E4%BD%86%E3%81%97

```php
<?php

namespace App\Policies;

use App\Models\Foo;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

final class FooPolicy
{
    use HandlesAuthorization;

    /**
     * @param User $user
     * @return bool
     */
    public function create(User $user): bool
    {
        $id = $user->id; // 認証中のユーザー
    }

    /**
     * @param User $user
     * @param Foo  $foo
     * @param int  $barId
     * @return bool
     */
    public function show(User $user, Foo $foo, int $barId): bool
    {
        $id = $foo->id; // ルーターまたはコントローラーから渡されたインスタンス
    }

    /**
     * @param User $user
     * @param Foo  $foo
     * @param int  $barId
     * @return bool
     */
    public function update(User $user, Foo $foo, int $barId): bool
    {
        //
    }

    /**
     * @param User $user
     * @param Foo  $foo
     * @param int  $barId
     * @return bool
     */
    public function delete(User $user, Foo $foo, int $barId): bool
    {
        //
    }
}
```

```php
<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Foo;
use App\Policies\FooPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * @var array
     */
    protected $policies = [
        Foo::class => FooPolicy::class,
    ];

    /**
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();
    }
}
```

#### ・AuthorizeMiddlewareによる認可

ルーティング時にDBレコードレベルの認可スコープを定義する．AuthorizeMiddlewareのエイリアス名はデフォルトで```can```であり，Kernelクラスに定義されている．第一引数にPolicyクラスのメソッド名，第二引数に関連するEloquentモデルのクラスの名前空間またはそのインスタンスを渡す．名前空間を渡す場合は，これをハードコーディングせず，関数で名前空間を取得して文字列と結合するようにする．インスタンスを渡す場合は，暗黙のモデル結合を用いる必要がある．認可に失敗した場合，```403```ステータスのレスポンスを返信する．

参考：https://readouble.com/laravel/8.x/ja/authorization.html#via-middleware

**＊実装例＊**

```php
<?php

declare(strict_types=1);

use App\Http\Controllers\FooController;

Route::group(['middleware' => ['auth:web']], function () {

    Route::group(['prefix' => 'foos'], function () {
        Route::get('/{id}', [FooController::class, 'showFoo'])->middleware('can:show,'. Foo::class);
        Route::get('/', [FooController::class, 'indexFoo']);
        Route::post('/', [FooController::class, 'createFoo']);
        Route::put('/{id}', [FooController::class, 'updateFoo'])->middleware('can:update,'. Foo::class);
        Route::delete('/{id}', [FooController::class, 'deleteFoo'])->middleware('can:delete,'. Foo::class);
    });
});
```

#### ・```authorization```メソッドによる認可

コントローラー実行時にDBレコードレベルの認可スコープを定義する．基底コントローラーを継承したコントローラーでは```authorization```メソッドをコールでき，現在認証されているユーザーのDBアクセスが認可スコープの範囲内かどうかを検証する．第二引数に，ポリシーに紐付くクラス名前空間あるいはそのインスタンスを渡す．認可に失敗した場合にAuthorizationExceptionを投げるため，その後は自前で```403```ステータスのレスポンスするようにする．

参考：

- https://readouble.com/laravel/8.x/ja/authorization.html#via-controller-helpers
- https://readouble.com/laravel/8.x/ja/authorization.html#supplying-additional-context

**＊実装例＊**

ユーザーが該当IDのFooモデルを更新する権限があるかどうかを検証する．

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class FooController extends Controller
{
    /**
     * @param Request $request
     * @param int     $id
     * @return JsonResponse
     */
    public function updateFoo(Request $request, int $id): JsonResponse
    {
        try {
            $foo = new Foo();

            // 認可が失敗した場合，AuthorizationExceptionを投げる．
            $this->authorize('update', [$foo->find($id), $request->barId]);

            // Eloquentモデルが不要な検証であれば名前空間
            // $this->authorize('create', Foo::class);

            $foo->fill($request->all())->save();
        } catch (Throwable $e) {
            // 自前で403ステータスのレスポンスを返信する．
            return response()->json(['error' => $e->getMessage()], 403);
        }

        // 続きの処理
    }
}

```

#### ・```can```メソッドによる認可

コントローラー実行時にDBレコードレベルの認可スコープを定義する．現在認証されているユーザーのインスタンスから```can```メソッドをコールできる．第二引数として，ポリシーに紐付くクラス名前空間またはそのクラスのインスタンスを渡す．DBアクセスが，そのユーザーの認可スコープの範囲内かどうかを検証する．認可に失敗した場合に```false```を返却するため，その後は自前で```403```ステータスのレスポンスするようにする．

参考：

- https://readouble.com/laravel/8.x/ja/authorization.html#via-the-user-model
- https://readouble.com/laravel/8.x/ja/authorization.html#supplying-additional-context

**＊実装例＊**

ユーザーがFooモデルを作成する権限があるかどうかを検証する．

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * @param Request $request
     * @param int     $id
     * @return JsonResponse
     */
    public function updateFoo(Request $request, int $id): JsonResponse
    {
        $foo = new Foo();

        // 認可が失敗した場合，falseが返却される．
        if (!auth()->user()->can('update', [$foo->find($id), $request->barId])) {
            // 自前で403ステータスのレスポンスを返信する．
            return response()->json(['error' => '認可エラー'], 403);
        }

        // Eloquentモデルが不要な検証であれば名前空間
        // if (!auth()->user()->can('update', Foo::class) {}

        $foo->fill($request->all())->save();
    }
}
```

<br>

## 03. Passportパッケージ

### Passportパッケージとは

Ouath認証を実装できる．OAuth認証については，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_authentication_authorization.html

<br>

### セットアップ

#### ・インストール

composerでインストールする必要がある．

参考：https://readouble.com/laravel/8.x/ja/passport.html

```bash
$ composer require laravel/passport
```

#### ・OAuth認証のトークン管理テーブルを生成

事前に，Passportの管理テーブルを生成する必要があるため，マイグレーションを実行する．

```bash
$ php artisan migrate

Migrating: 2014_10_12_000000_create_users_table
Migrated:  2014_10_12_000000_create_users_table (0.02 seconds)
Migrating: 2014_10_12_100000_create_password_resets_table
Migrated:  2014_10_12_100000_create_password_resets_table (0 seconds)
Migrating: 2016_06_01_000001_create_oauth_auth_codes_table
Migrated:  2016_06_01_000001_create_oauth_auth_codes_table (0 seconds)
Migrating: 2016_06_01_000002_create_oauth_access_tokens_table
Migrated:  2016_06_01_000002_create_oauth_access_tokens_table (0 seconds)
Migrating: 2016_06_01_000003_create_oauth_refresh_tokens_table
Migrated:  2016_06_01_000003_create_oauth_refresh_tokens_table (0 seconds)
Migrating: 2016_06_01_000004_create_oauth_clients_table
Migrated:  2016_06_01_000004_create_oauth_clients_table (0 seconds)
Migrating: 2016_06_01_000005_create_oauth_personal_access_clients_table
Migrated:  2016_06_01_000005_create_oauth_personal_access_clients_table 
```

マイグレーション後，以下のテーブルが作成される．

| テーブル名                    | 説明                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| oauth_access_tokens           | 全てのアクセストークンを管理する．                           |
| oauth_auth_codes              | Authorization Code Grantタイプの情報を管理する．             |
| oauth_clients                 | Passportで用いている付与タイプを管理する．                   |
| oauth_personal_access_clients | Personal Access Tokenタイプの情報を管理する．                |
| oauth_refresh_tokens          | リフレッシュトークンを管理する．アクセストークンの有効期限が切れた時に，再生成をリクエストするために用いる．<br>参考：https://auth0.com/blog/jp-refresh-tokens-what-are-they-and-when-to-use-them/ |

#### ・トークンを生成

コマンド実行により，```/storage/oauth```キー，Personal Access Client，Password Grant Clientを生成する．

```bash
$ php artisan passport:install

Personal access client created successfully.
Client ID: 1
Client secret: *****
Password grant client created successfully.
Client ID: 2
Client secret: *****
```

これにより，例えばoauth_clientsテーブルでは以下が作成される．

| id      | user_id    | name                                 | secret      | ...  |
| ------- | ---------- | ------------------------------------ | ----------- | ---- |
| ```1``` | ```NULL``` | ```Laravel Personal Access Client``` | ```*****``` | ...  |
| ```2``` | ```NULL``` | ```Laravel Password Grant Client```  | ```*****``` | ...  |

あるいは，```/storage/oauth```キー，Personal Access Client，Password Grant Clientを個別に作成しても良い．

```bash
# oauthキーを生成
$ php artisan passport:keys

# Persinal Access Tokenを作成する．
$ php artisan passport:client --personal

## Password Grant Tokenの場合
$ php artisan passport:client --password
```

<br>

### 実装可能なOAuth認証の種類

#### ・OAuth認証

OAuth認証に関して，以下のトークン付与タイプを実装できる．

| 付与タイプ               | 説明                                                         |
| ------------------------ | ------------------------------------------------------------ |
| Authorization Code Grant | 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_authentication_authorization.html |
| Client Credentials Grant | 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_authentication_authorization.html |
| Implicit Grant           | 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_authentication_authorization.html |
| Password Grant           | 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_authentication_authorization.html |

#### ・その他

| 認証方法              | 説明                                                         |
| --------------------- | ------------------------------------------------------------ |
| Personal Access Token | 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_authentication_authorization.html |

<br>

### Password Grant

#### ・バックエンド側の実装

1. ```guards```キーにて，認証方式を設定する．ここでは，```api```を設定する．

```php
return [

    // ～ 中略 ～

    "defaults" => [
        "guard" => "api",
        "passwords" => "users",
    ],

    // ～ 中略 ～
];
```

2. OAuth認証（認証フェーズ＋認可フェーズ）を行うために，```auth.php```ファイルで，```driver```キーにpassportドライバを設定する．また，```provider```キーで，```users```を設定する．

**＊実装例＊**

```php
return [
    
    // ～ 中略 ～
    
    "guards" => [
        "web" => [
            "driver"   => "session",
            "provider" => "users",
        ],

        "api" => [
            "driver"   => "passport",
            "provider" => "users",
            "hash"     => false,
        ],
    ],

    // ～ 中略 ～
];
```

3. ```auth.php```ファイルにて，```driver```キーにeloquentドライバを設定する．また，```model```キーで認証情報テーブルに対応するEloquentのEloquentモデルを設定する．ここでは，Userクラスを設定する．Laravelでは，Eloquentモデルに対応するテーブル名はクラス名の複数形になるため，usersテーブルに認証情報が格納されることになる．もしDBファサードのクエリビルダを用いたい場合は，```database```ドライバを設定する．

```php
return [

    // ～ 中略 ～

    "providers" => [
        "users" => [
            "driver" => "eloquent",
            // Eloquentモデルは自由に指定できる．
            "model"  => App\Models\User::class,
        ],

        // "users" => [
        //     "driver" => "database",
        //     "table" => "users",
        // ],
    ],

    // ～ 中略 ～
];
```

4. Userへのルーティング時に，```middleware```メソッドによる認証ガードを行う．これにより，OAuth認証に成功したユーザーのみがルーティングを行えるようになる．

**＊実装例＊**

```php
Route::get("user", "UserController@index")->middleware("auth:api");
```

5. 認証ガードを行ったEloquentモデルに対して，HasAPIToken，NotifiableのTraitをコールするようにする．

**＊実装例＊**

```php
<?php
  
namespace App\Domain\DTO;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;
    
    // ～ 中略 ～
}
```

6. Passportの```routes```メソッドをコールするようにする．これにより，Passportの認証フェーズに関わる全てのルーティング（``````/oauth/xxx``````）が有効になる．また，アクセストークンを発行できるよになる．

**＊実装例＊**

```php
<?php
  
use Laravel\Passport\Passport;

class AuthServiceProvider extends ServiceProvider
{
    // ～ 中略 ～

    public function boot()
    {
        $this->registerPolicies();

        Passport::routes();
    }
}
```

7. 暗号キーとユーザーを作成する．

```bash
$ php artisan passport:keys

$ php artisan passport:client --password
```

#### ・クライアントアプリ側の実装

1. 『認証』のために，アクセストークンのリクエストを送信する．ユーザー側のアプリケーションは，```/oauth/authorize```へリクエストを送信する必要がある．ここでは，リクエストGuzzleパッケージを用いて，リクエストを送信するものとする．

**＊実装例＊**

```php
<?php

$http = new GuzzleHttp\Client;

$response = $http->post("http://your-app.com/oauth/token", [
    "form_params" => [
        "grant_type"    => "password",
        "client_id"     => "client-id",
        "client_secret" => "client-secret",
        "username"      => "taylor@laravel.com",
        "password"      => "my-password",
        "scope"         => "",
    ],
]);
```

2. アクセストークンを含むJSON型データを受信する．

**＊実装例＊**

```json
{
  "token_type":"Bearer",
  "expires_in":31536000,
  "access_token":"*****"
}
```

3. ヘッダーにアクセストークンを含めて，認証ガードの設定されたバックエンド側のルーティングに対して，リクエストを送信する．レスポンスのメッセージボディからデータを取得する．

**＊実装例＊**

```php
<?php
  
$response = $client->request("GET", "/api/user", [
    "headers" => [
        "Accept"        => "application/json",
        "Authorization" => "Bearer *****",
    ]
]);

return (string)$response->getBody();
```

#### ・APIガード用のテーブル

**＊実装例＊**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * @return void
     */
    public function up()
    {
        Schema::create("users", function (Blueprint $table) {
            
            $table->bigIncrements("user_id")->comment("ユーザーID");
            $table->string("name")->comment("ユーザー名");
            $table->string("api_token")->unique()->comment("APIトークン");

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
        Schema::drop("users");
    }
}
```

<br>

### Personal Access Token

#### ・バックエンド側の実装

1. 暗号キーとユーザーを作成する．

```bash
$ php artisan passport:keys

$ php artisan passport:client --personal
```

2. 作成したユーザーに，クライアントIDを付与する．

```php
/**
 * 全認証/認可の登録
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::routes();

    Passport::personalAccessClientId("client-id");
}
```

3. ユーザーからのリクエスト時，クライアントIDを元に『認証』を行い，アクセストークンをレスポンスする．

```php
<?php

$user = User::find(1);

// スコープ無しのトークンを作成する
$token = $user->createToken("Token Name")->accessToken;

// スコープ付きのトークンを作成する
$token = $user->createToken("My Token", ["place-orders"])->accessToken;
```

<br>

## 03-02. Sanctumパッケージ

### Sanctumパッケージとは

APIキー認証とセッションIDを用いたForm認証機能の認証処理のみを提供する．ルーティングとDBアクセスに関する処理は提供しない．

参考：https://readouble.com/laravel/8.x/ja/sanctum.html

APIキー認証とセッションIDを用いたForm認証については，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_authentication_authorization.html

<br>

### セットアップ

#### ・インストール

```bash
$ composer require laravel/sanctum
```

<br>

### APIトークン認証

フロントエンド（外部のアプリケーションを含む）は任意とし，APIのみを実装する場合，使用が適している．

参考：

- https://readouble.com/laravel/8.x/ja/sanctum.html#api-token-authentication
- https://stackoverflow.com/questions/65550823/laravel-sanctum-api-token-security
- https://laracasts.com/discuss/channels/laravel/why-is-it-bad-to-use-sanctum-api-tokens-to-authenticate-your-own-first-party-spa

<br>

### SPA認証

フロントエンドにファーストパーティのSPA（自社のSPA）を用いて，バックエンドのAPIを実装する場合，使用が適している．

参考：

- https://readouble.com/laravel/8.x/ja/sanctum.html#spa-authentication
- https://stackoverflow.com/questions/65550823/laravel-sanctum-api-token-security
- https://laracasts.com/discuss/channels/laravel/why-is-it-bad-to-use-sanctum-api-tokens-to-authenticate-your-own-first-party-spa

<br>

## 03-03. Fortifyパッケージ

### Fortifyパッケージとは

Laravelが持つ全ての認証機能のバックエンド処理を提供する．

参考：

- https://readouble.com/laravel/8.x/ja/fortify.html
- https://readouble.com/laravel/8.x/ja/fortify.html#laravel-fortify-and-laravel-sanctum

<br>

## 03-04. Breezeパッケージ

### Breezeパッケージとは

Laravelが持つ全ての認証機能のバックエンド（認証＋ルーティング＋DBアクセス）処理と，これに対応するフロントエンド処理を提供する．

参考：

- https://readouble.com/laravel/8.x/ja/starter-kits.html#laravel-breeze
- https://readouble.com/laravel/8.x/ja/fortify.html#laravel-fortify-and-laravel-sanctum

<br>

### セットアップ

参考：https://github.com/laravel/breeze

#### ・インストール

パッケージをインストールする．

``` sh
$ composer require laravel/breeze:^1.0 --dev
```

#### ・認証処理ファイルの自動生成

認証処理に関連するクラスを自動生成できる．Bladeに組み合わせるJavaScriptを選択できる．

```bash
$ php artisan breeze:install
```

<br>

## 03-05. UIパッケージ（Laravel 7系以前）

### UIパッケージとは

Laravelが持つ全ての認証機能のバックエンド（認証＋ルーティング＋DBアクセス）処理と，これに対応するフロントエンド処理を提供する．

参考：https://readouble.com/laravel/7.x/ja/authentication.html

<br>

### セットアップ

#### ・インストール

パッケージをインストールする．

```bash
$ composer require laravel/ui:^1.0 --dev
```

#### ・認証処理ファイルの自動生成

認証処理に関連するクラスを自動生成できる．Bladeに組み合わせるJavaScriptを選択できる．

```bash
# Vuejsを用いる場合．
$ php artisan ui vue --auth

# Reactを用いる場合
$ php artisan ui react --auth

# Bootstrapを用いる場合．
$ php artisan ui bootstrap --auth 
```

