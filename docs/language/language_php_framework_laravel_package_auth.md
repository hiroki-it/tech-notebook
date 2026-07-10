---
title: 【IT技術の知見】認証／認可系パッケージ＠Laravel
description: 認証／認可系パッケージ＠Laravelの知見を記録しています。
---

# 認証／認可系パッケージ＠Laravel

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 認証

### ガード

#### ▼ ガードとは

ドライバーとプロバイダーを定義する。

| ガードの種類 | 説明                                                 |
| ------------ | ---------------------------------------------------- |
| Webガード    | フォーム認証のために使用する。                       |
| APIガード    | Bearer認証、APIキー認証、OAuthなどのために使用する。 |

> - https://readouble.com/laravel/8.x/ja/authentication.html#introduction

#### ▼ カスタムガード

Laravel がデフォルトで持たないドライバーとプロバイダーを持つガードを定義する。

> - https://readouble.com/laravel/8.x/ja/authentication.html#adding-custom-guards

API ガードの認証で使用するトークンを JWT に変更したいときには、以下のパッケージがおすすめ。

> - https://github.com/tymondesigns/jwt-auth

<br>

### ドライバー

#### ▼ ドライバーとは

| ドライバーの種類  | 認証の種類                     | 実装クラス         | 備考                                                          |
| ----------------- | ------------------------------ | ------------------ | ------------------------------------------------------------- |
| sessionドライバー | フォーム認証                   | SessionGuardクラス | https://laravel.com/api/8.x/Illuminate/Auth/SessionGuard.html |
| tokenドライバー   | Bearer認証、APIキー認証、OAuth | TokenGuardクラス   | https://laravel.com/api/8.x/Illuminate/Auth/TokenGuard.html   |

ドライバーの種類に応じて、AuthManager クラスが Guard インターフェースの実装クラスを返却する。

`auth.php` ファイルにて、例えば token ドライバーを選択した場合は、TokenGuard クラスが返却される。

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

> - https://teratail.com/questions/171582
> - https://laravel.com/api/8.x/Illuminate/Auth/AuthManager.html
> - https://laravel.com/api/8.x/Illuminate/Contracts/Auth/Guard.html#method_user
> - https://laravel.com/api/8.x/Illuminate/Auth/TokenGuard.html#method_user

#### ▼ ルーティングの保護

BeforeMiddleware で認証済みのユーザーか否かを検証し、もし未認証の場合は、ログインページにリダイレクトさせる。

これにより、未認証のユーザーがコントローラーを実行することを防ぐ。

> - https://qiita.com/yamotuki/items/b96978f8e379e285ecb6

<br>

### プロバイダ

#### ▼ プロバイダとは

アカウントデータを DB から読み込むオブジェクトを定義する。

> - https://readouble.com/laravel/8.x/ja/authentication.html#introduction

<br>

### フォーム認証

#### ▼ sessionドライバー

session ドライバーを選択する。

#### ▼ すべてのユーザーが同一権限を持つ場合

SessionGuard クラスの `attempt()` 関数をコールしてパスワードをハッシュ化し、DB のハッシュ値と照合する。

認証が成功すると、認証セッションを開始する。

`redirect()` 関数で、認証後の初期ページにリダイレクトする。

> - https://readouble.com/laravel/8.x/ja/authentication.html#authenticating-users

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
            // セッションID固定化を防ぐために、認証後にセッションを再作成します。
            $authenticationRequest->session()->regenerate();

            // 認証後のWebページにリダイレクトします。
            return redirect(RouteServiceProvider::HOME);
        }

        // 未認証のWebページにリダイレクトします。
        return redirect(RouteServiceProvider::UNAUTHORIZED);
    }
}
```

認証後のページは RouteServiceProvider クラスで定義しておく。

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

#### ▼ 一部のユーザーが異なる権限を持つ場合

ユーザーごとに認証方法を区別しつつ、同じ認証後の Web ページにリダイレクトさせられる。

> - https://blog.capilano-fw.com/?p=8159

**＊実装例＊**

権限の異なるユーザーに応じたガード、またガードに紐付ける Eloquent モデルをプロバイダを定義しておく。

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

Auth ファサードの `guard()` 関数を使用して、ガードに応じた認証する。

これにより、同じ認証後ページへリダイレクトした後、ユーザーの Eloquent モデルに応じた処理を実行できるようになる。

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

        // guardに応じた認証を行います。
        if (Auth::guard($authenticationRequest->guard)->attempt($validated)) {

            // セッションID固定化を防ぐために、認証後にセッションを再作成します。
            $authenticationRequest->session()->regenerate();

            // ユーザー用認証後のWebページにリダイレクトします。
            return redirect(RouteServiceProvider::HOME);
        }

        // 未認証のWebページにリダイレクトします。
        return redirect(RouteServiceProvider::UNAUTHORIZED);
    }
}
```

<br>

### 認証済みか否かの判定

#### ▼ `user()` 関数

現在のセッションにおけるユーザーが認証済みであれば、ユーザーの Eloquent モデルを取得する。

```php
<?php

// Illuminate\Contracts\Auth\Guard
// ドライバーに応じて、リゾルブされるGuardの実装クラス決まる
$user = auth()->user();
```

#### ▼ `check()` 関数

現在のセッションにおけるユーザーが認証済みであれば、`true` を返却する。

**＊実装例＊**

認証済みのユーザーがブラウザを閉じたとしても、セッションが続いている (例：ログアウトしない) 限り、認証処理をあらためて実行する必要はない。

そのために、BeforeMiddleware を使用して、認証済みのユーザーからのリクエストを認証済みページにリダイレクトさせる。

```php
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
                // ユーザーが認証済みの場合は、認証後のWebページにリダイレクトします。
                return redirect(RouteServiceProvider::HOME);
            }
        }

        return $next($request);
    }
}
```

<br>

## 02. 認可

### ゲート

#### ▼ ゲートとは

Eloquent モデルレベルの認可スコープを定義する。

指定した Eloquent モデルに紐付くすべての DB レコードにアクセスできなくなる。

<br>

### ポリシー

#### ▼ ポリシーとは

DB レコードレベルの認可スコープを定義する。

Eloquent モデルに紐付く特定のレコードにアクセスできなくなる。

Policy クラスの関数によって、リクエスト中の認証済みユーザーが自動的にインジェクションされる。

Eloquent モデルと Policy クラスの紐付けは AuthServiceProvider クラスで定義する

> - https://qiita.com/mpyw/items/8c5413b99b8e299f7002#%E7%AC%AC1%E5%BC%95%E6%95%B0%E3%81%AF%E5%BF%85%E3%81%9A-authenticatable-%E3%81%AB%E3%81%AA%E3%82%8B%E4%BD%86%E3%81%97

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

#### ▼ AuthorizeMiddlewareによる認可

ルーティング時に DB レコードレベルの認可スコープを定義する。

AuthorizeMiddleware のエイリアスのデフォルト値は `can` であり、Kernel クラスに定義されている。

第一引数に Policy クラスの関数名、第二引数に関連する Eloquent モデルのクラスの名前空間またはそのインスタンスを渡す。

名前空間を渡す場合は、これをハードコーディングせず、関数で名前空間を取得して文字列と結合する。

インスタンスを渡す場合は、暗黙のモデル結合を使用する必要がある。

認可に失敗した場合、`403` ステータスを含むレスポンスを返信する。

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

> - https://readouble.com/laravel/8.x/ja/authorization.html#via-middleware

#### ▼ `authorization()` 関数による認可

コントローラー実行時に DB レコードレベルの認可スコープを定義する。

基底コントローラーを継承したコントローラーでは `authorization()` 関数をコールでき、現在認証されているユーザーの DB アクセスが認可スコープの範囲内か否かを検証する。

第二引数に、ポリシーに紐付くクラス名前空間あるいはそのインスタンスを渡す。

認可に失敗した場合は AuthorizationException を投げる。その後は自前で `403` レスポンスする。

**＊実装例＊**

ユーザーが該当 ID の Foo モデルを更新する権限があるか否かを検証する。

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

            // 認可が失敗した場合、AuthorizationExceptionを投げる。
            $this->authorize('update', [$foo->find($id), $request->barId]);

            // Eloquentモデルが不要な検証であれば名前空間
            // $this->authorize('create', Foo::class);

            $foo->fill($request->all())->save();
        } catch (Throwable $e) {
            // 自前で403ステータスを含むレスポンスを返信する。
            return response()->json(['error' => $e->getMessage()], 403);
        }

        // 続きの処理
    }
}
```

> - https://readouble.com/laravel/8.x/ja/authorization.html#via-controller-helpers
> - https://readouble.com/laravel/8.x/ja/authorization.html#supplying-additional-context

#### ▼ `can()` 関数による認可

コントローラー実行時に DB レコードレベルの認可スコープを定義する。

現在認証されているユーザーのインスタンスから `can()` 関数をコールできる。

第二引数として、ポリシーに紐付くクラス名前空間またはそのクラスのインスタンスを渡す。

DB アクセスが、そのアカウントの認可スコープの範囲内か否かを検証する。

認可に失敗した場合は `false` を返却する。その後は自前で `403` レスポンスする。

**＊実装例＊**

ユーザーが Foo モデルを作成する権限があるか否かを検証する。

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

        // 認可が失敗した場合、falseが返却される。
        if (!auth()->user()->can('update', [$foo->find($id), $request->barId])) {
            // 自前で403ステータスを含むレスポンスを返信する。
            return response()->json(['error' => '認可エラー'], 403);
        }

        // Eloquentモデルが不要な検証であれば名前空間
        // if (!auth()->user()->can('update', Foo::class) {}

        DB::transaction(function () use ($foo) {
            $foo->fill($request->all())->save();
        }
    }
}
```

> - https://readouble.com/laravel/8.x/ja/authorization.html#via-the-user-model
> - https://readouble.com/laravel/8.x/ja/authorization.html#supplying-additional-context

<br>

## 03. Passportパッケージ

### Passportパッケージとは

OAuth を実装できる。

<br>

### セットアップ

#### ▼ インストール

Composer でインストールする必要がある。

```bash
$ composer require laravel/passport
```

> - https://readouble.com/laravel/8.x/ja/passport.html

#### ▼ OAuthのトークン管理テーブルを作成

事前に、Passport の管理テーブルを作成する必要があるため、DB マイグレーションを実行する。

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

DB マイグレーション後、以下のテーブルを作成する。

| テーブル名                    | 説明                                                                                                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| oauth_access_tokens           | すべてのアクセストークンを管理する。                                                                                                                                                               |
| oauth_auth_codes              | Authorization Code Grantタイプの情報を管理する。                                                                                                                                                   |
| oauth_clients                 | Passportで使用している付与タイプを管理する。                                                                                                                                                       |
| oauth_personal_access_clients | パーソナルアクセストークンタイプの情報を管理する。                                                                                                                                                 |
| oauth_refresh_tokens          | リフレッシュトークンを管理する。アクセストークンの有効期限が切れたときに、再作成をリクエストするために使用する。<br>- https://auth0.com/blog/jp-refresh-tokens-what-are-they-and-when-to-use-them/ |

#### ▼ トークンを作成

コマンド実行により、`/storage/oauth` キー、Personal Access Client、Password Grant Client を作成する。

```bash
$ php artisan passport:install

Personal access client created successfully.
Client ID: 1
Client secret: *****
Password grant client created successfully.
Client ID: 2
Client secret: *****
```

これにより、例えば oauth_clients テーブルでは以下を作成する。

| id  | user_id | name                             | secret  | ... |
| --- | ------- | -------------------------------- | ------- | --- |
| `1` | `NULL`  | `Laravel Personal Access Client` | `*****` | ... |
| `2` | `NULL`  | `Laravel Password Grant Client`  | `*****` | ... |

代わりに、`/storage/oauth` キー、Personal Access Client、Password Grant Client を個別に作成してもよい。

```bash
# oauthキーを作成
$ php artisan passport:keys

# Persinal Access Tokenを作成する。
$ php artisan passport:client --personal

## Password Grant Tokenの場合
$ php artisan passport:client --password
```

<br>

### 実装できるOAuthの種類

#### ▼ OAuth

OAuth に関して、以下のトークン付与タイプを実装できる。

| 付与タイプ               |
| ------------------------ |
| Authorization Code Grant |
| Client Credentials Grant |
| Implicit Grant           |
| Password Grant           |

#### ▼ その他

| 認証方法                   |
| -------------------------- |
| パーソナルアクセストークン |

<br>

### Password Grant

#### ▼ バックエンド側の実装

`(1)`

: `guards` キーにて、認証方式を設定する。ここでは、`api` を設定する。

```php
return [

    ...

    "defaults" => [
        "guard" => "api",
        "passwords" => "users",
    ],

    ...
];
```

`(2)`

: OAuth (認証フェーズ + 認可フェーズ) を実行するために、`auth.php` ファイルで、`driver` キーに passport ドライバを設定する。また、`provider` キーで、`users` を設定する。

**＊実装例＊**

```php
return [

    ...

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

    ...
];
```

`(3)`

: `auth.php` ファイルにて、`driver` キーに eloquent ドライバを設定する。

     また、`model`キーで資格情報テーブルに対応するEloquentのEloquentモデルを設定する。

     ここでは、Userクラスを設定する。Laravelでは、Eloquentモデルに対応するテーブル名はクラス名の複数形になるため、usersテーブルに資格情報が格納されることになる。

     もしDBファサードのクエリビルダーを使用したい場合は、`database`ドライバを設定する。

```php
return [

    ...

    "providers" => [
        "users" => [
            "driver" => "eloquent",
            // Eloquentモデルは自由に指定できる。
            "model"  => App\Models\User::class,
        ],

        // "users" => [
        //     "driver" => "database",
        //     "table" => "users",
        // ],
    ],

    ...
];
```

`(4)`

: User へのルーティング時に、`middleware()` 関数による認証ガードを実行する。

     これにより、OAuthに成功したユーザーのみがルーティングを行えるようになる。

**＊実装例＊**

```php
Route::get("user", "UserController@index")->middleware("auth:api");
```

`(5)`

: 認証ガードを行った Eloquent モデルに対して、HasAPIToken、Notifiable の Trait をコールする。

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

    ...
}
```

`(6)`

: Passport の `routes()` 関数をコールする。

     これにより、Passportの認証フェーズに関わる全てのルーティング (`/oauth/xxx`) が有効になる。

     また、リフレッシュトークンを含むアクセストークンを発行できるようになる。

**＊実装例＊**

```php
<?php

use Laravel\Passport\Passport;

class AuthServiceProvider extends ServiceProvider
{
    ...

    public function boot()
    {
        $this->registerPolicies();

        Passport::routes();
    }
}
```

`(7)`

: 暗号キーとユーザーを作成する。

```bash
$ php artisan passport:keys

$ php artisan passport:client --password
```

#### ▼ クライアントアプリ側の実装

`(1)`

: 『認証』のために、アクセストークンのリクエストを送信する。

     ユーザー側のアプリケーションは、`/oauth/authorize`へリクエストを送信する必要がある。

     ここでは、リクエストGuzzleパッケージを使用して、リクエストを送信するものとする。

**＊実装例＊**

```php
<?php

$http = new GuzzleHttp\Client;

$response = $http->post("http://your-app.com/oauth/token", [
    "form_params" => [
        "grant_type"    => "password",
        "client_id"     => "client-id",
        "client_secret" => "client-secret",
        "username"      => "foo@example.com",
        "password"      => "my-password",
        "scope"         => "",
    ],
]);
```

`(2)`

: アクセストークンを含む JSON 型データを受信する。

**＊実装例＊**

```yaml
{"token_type": "Bearer", "expires_in": 31536000, "access_token": "*****"}
```

`(3)`

: ヘッダーにアクセストークンを含めて、認証ガードの設定されたバックエンド側のルーティングに対して、リクエストを送信する。

     レスポンスのメッセージボディからデータを取得する。

**＊実装例＊**

```php
<?php

$response = $client->request("GET", "/api/user", [
    "headers" => [
        "Accept"        => "application/json",
        "Authorization" => "Bearer <アクセストークン>",
    ]
]);

return (string)$response->getBody();
```

#### ▼ APIガード用のテーブル

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
            $table->string("api_token")->unique()->comment("APIキー");

            // MigrationMacroServiceProviderの関数を使用する。
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
        Schema::drop("users");
    }
}
```

<br>

### パーソナルアクセストークン

#### ▼ バックエンド側の実装

`(1)`

: 暗号キーとユーザーを作成する。

```bash
$ php artisan passport:keys

$ php artisan passport:client --personal
```

`(2)`

: 作成したユーザーに、クライアント ID を付与する。

    IDプロバイダーでクライアントIDを事前に発行しておく。

```php
/**
 * 全認証／認可の登録
 *
 * @return void
 */
public function boot()
{
    $this->registerPolicies();

    Passport::routes();

    Passport::personalAccessClientId("<クライアントID>");
}
```

`(3)`

: Laravel にクライアント ID を含むリクエストを送信すると、Laravel はアクセストークンをレスポンスする。

```php
<?php

$user = User::find(1);

// スコープ無しのアクセストークンを作成する
$token = $user->createToken("<任意のアクセストークン文字列>")->accessToken;

// スコープ付きのアクセストークンを作成する
$token = $user->createToken("<任意のアクセストークン文字列>", ["place-orders"])->accessToken;
```

> - https://readouble.com/laravel/8.x/ja/passport.html#personal-access-tokens

<br>

## 03-02. Sanctumパッケージ

### Sanctumパッケージとは

API キー認証とフォーム認証機能の認証処理のみを提供する。

ルーティングと DB アクセスに関する処理は提供しない。

> - https://readouble.com/laravel/8.x/ja/sanctum.html

<br>

### セットアップ

#### ▼ インストール

```bash
$ composer require laravel/sanctum
```

<br>

### APIキー認証

フロントエンド (外部のアプリケーションを含む) は任意とし、API のみを実装する場合、使用が適している。

> - https://readouble.com/laravel/8.x/ja/sanctum.html#api-token-authentication
> - https://stackoverflow.com/questions/65550823/laravel-sanctum-api-token-security
> - https://laracasts.com/discuss/channels/laravel/why-is-it-bad-to-use-sanctum-api-tokens-to-authenticate-your-own-first-party-spa

<br>

### SPA認証

フロントエンドにファーストパーティの SPA (自社の SPA) を使用して、バックエンドの API を実装する場合、使用が適している。

> - https://readouble.com/laravel/8.x/ja/sanctum.html#spa-authentication
> - https://stackoverflow.com/questions/65550823/laravel-sanctum-api-token-security
> - https://laracasts.com/discuss/channels/laravel/why-is-it-bad-to-use-sanctum-api-tokens-to-authenticate-your-own-first-party-spa

<br>

## 03-03. Fortifyパッケージ

### Fortifyパッケージとは

Laravel が持つすべての認証機能のバックエンド処理を提供する。

> - https://readouble.com/laravel/8.x/ja/fortify.html
> - https://readouble.com/laravel/8.x/ja/fortify.html#laravel-fortify-and-laravel-sanctum

<br>

## 03-04. Breezeパッケージ

### Breezeパッケージとは

Laravel が持つすべての認証機能のバックエンド (認証+ルーティング+DB アクセス) 処理と、これに対応するフロントエンド処理を提供する。

> - https://readouble.com/laravel/8.x/ja/starter-kits.html#laravel-breeze
> - https://readouble.com/laravel/8.x/ja/fortify.html#laravel-fortify-and-laravel-sanctum

<br>

### セットアップ

> - https://github.com/laravel/breeze

#### ▼ インストール

パッケージをインストールする。

```bash
$ composer require laravel/breeze:^1.0 --dev
```

#### ▼ 認証処理ファイルの自動作成

認証処理に関連するクラスを自動作成できる。

Blade に組み合わせる JavaScript を選択できる。

```bash
$ php artisan breeze:install
```

<br>

## 03-05. UIパッケージ (Laravel 7系以前)

### UIパッケージとは

Laravel が持つすべての認証機能のバックエンド (認証+ルーティング+DB アクセス) 処理と、これに対応するフロントエンド処理を提供する。

> - https://readouble.com/laravel/7.x/ja/authentication.html

<br>

### セットアップ

#### ▼ インストール

パッケージをインストールする。

```bash
$ composer require laravel/ui:^1.0 --dev
```

#### ▼ 認証処理ファイルの自動作成

認証処理に関連するクラスを自動作成できる。

Blade に組み合わせる JavaScript を選択できる。

```bash
# Vue.jsを使用する場合。
$ php artisan ui vue --auth

# Reactを使用する場合
$ php artisan ui react --auth

# Bootstrapを使用する場合。
$ php artisan ui bootstrap --auth
```

<br>
