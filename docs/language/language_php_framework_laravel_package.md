---
title: 【IT技術の知見】専用パッケージ＠Laravel
description: 専用パッケージ＠Laravelの知見を記録しています。
---

# 専用パッケージ＠Laravel

## 01. Laravel Mixパッケージ

### Laravel Mixパッケージとは

WebpackをLaravelを介して操作できるパッケージのこと。

Breezeパッケージにも同梱されている。

> - https://readouble.com/laravel/8.x/ja/mix.html

<br>

### Webpackを操作するコマンド

#### ▼ アセットの初期コンパイル

アセットのコンパイルを実行する。

```bash
$ npm run dev
```

#### ▼ アセットの自動再コンパイル

アセットのコードが変更された時に、これと検知し、自動的に再コンパイルを実行する。

```bash
$ npm run watch
```

<br>

## 02. 認証系パッケージ

> - https://hiroki-it.github.io/tech-notebook/language/language_php_framework_laravel_package_auth.html

<br>

## 03. 非公式パッケージ

### laravel-enum

#### ▼ コード

> - https://github.com/BenSampo/laravel-enum

#### ▼ enum型のクラスの定義

BenSampoのenum型のクラスを継承し、区分値と判定メソッドを実装する。

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
     * コールセンター職の区分値を持つか否かを判定します。


     */
    public function isCallRole()
    {
        return $this->is(self::CALL_ROLE);
    }

    /**
     * 開発職の区分値を持つかを判定します。


     */
    public function isDevelopmentRole()
    {
        return $this->is(self::DEVELOPMENT_ROLE);
    }

    /**
     * 経理職の区分値を持つか否かを判定します。


     */
    public function isFinanceRole()
    {
        return $this->is(self::FINANCE_ROLE);
    }

    /**
     * 企画職の区分値を持つか否かを判定します。


     */
    public function isPlanRole()
    {
        return $this->is(self::PLAN_ROLE);
    }

    /**
     * 営業職の区分値を持つか否かを判定します。


     */
    public function isSalesRole()
    {
        return $this->is(self::SALES_ROLE);
    }
}
```

#### ▼ enum型のクラスの使い方

**＊実装例＊**

DBから区分値をSELECTした後、これを元にenum型のクラスを作成する。

```php
<?php

// Staff
$staff = new Staff();

// DBから取得した区分値 (開発職：2) からenum型のクラスを作成
$staff->roleType = new RoleType($fetched["role_type"]);
// 以下の方法でも良い。
// $staff->roleType = RoleType::fromValue($fetched["role_type"]);

// StaffがいずれのRoleTypeを持つか
$staff->roleType->isDevelopmentRole(); // true
$staff->roleType->isSalesRole(); // false
```

<br>

### laravel-ide-helper

#### ▼ laravel-ide-helperとは

PHPStromでLaravelを開発する場合、拡張機能を提供する。

> - https://github.com/barryvdh/laravel-ide-helper#phpstorm-meta-for-container-instances
> - https://pleiades.io/help/phpstorm/laravel.html

プロバイダーを`app.php`ファイルに登録する必要がある。

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

#### ▼ Facade

PHPStromで、メソッドが定義された場所にジャンプできるように、`_ide_helper.php`ファイルを作成する。

> - https://github.com/barryvdh/laravel-ide-helper#automatic-phpdoc-generation-for-laravel-facades

```bash
$ php artisan ide-helper:generate
```

#### ▼ アノテーション作成

PHPStromで、LaravelのEloquentモデルでのアノテーションを自動作成する。

> - https://github.com/barryvdh/laravel-ide-helper#automatic-PHPDocs-for-models

```bash
$ php artisan ide-helper:models
```

#### ▼ 予測表示

PHPStromで、Laravelのメソッドを予測表示できるように、`phpstorm.meta.php`ファイルを作成する。

> - https://github.com/barryvdh/laravel-ide-helper#phpstorm-meta-for-container-instances

```bash
$ php artisan ide-helper:meta
```
