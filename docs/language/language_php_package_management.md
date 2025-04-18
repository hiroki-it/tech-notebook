---
title: 【IT技術の知見】パッケージ管理＠PHP
description: パッケージ管理＠PHPの知見を記録しています。
---

# パッケージ管理＠PHP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. パッケージ管理ツールの種類

- composer
-

<br>

## 02. Composer

### セットアップ

#### ▼ インストール

> - https://getcomposer.org/download/

```bash
# インストーラーをダウンロードする。
$ php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"

# インストーラーのハッシュ値を確認する。
$ php -r "if (hash_file('sha384', 'composer-setup.php') === '906a84df04cea2aa72f40b5f787e49f22d4c2f19492ac310e8cba5b96ac8b64115ac402c8cd292b8a03482574915d1a8') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"

# インストーラーを実行する。
$ php composer-setup.php

# インストーラーを削除する。
$ php -r "unlink('composer-setup.php');"
```

<br>

### `composer.json`ファイル

#### ▼ autoload

名前空間とパスの対応関係を設定する。

`require`関数を使用せずに、クラスの名前空間を`use`で指定するのみでファイルを読み込めるようになる。

```yaml
{

    ...

    "autoload": {
        "psr-4": {
            # "<名前空間>": "<パス>",
            "App\\": "app/",
            "Database\\Factories\\Infrastructure\\DTO\\": "database/factories/production",
            "Database\\Seeders\\": "database/seeds/production"
        },
        "classmap": [
            "database/seeds",
            "database/factories"
        ]
    }

    ...

}
```

> - https://getcomposer.org/doc/04-schema.md#autoload
> - https://atmarkit.itmedia.co.jp/ait/articles/1808/01/news009_3.html

#### ▼ config

Composerのコマンドのオプションのデフォルト値を設定する。

```yaml
{

    ...

    "config": {
        "preferred-install": "dist",
        "sort-packages": "true",
        "optimize-autoloader": "true"
    }

    ...

}
```

> - https://getcomposer.org/doc/04-schema.md#config

#### ▼ require

インストールされるパッケージとバージョンを設定する。

パッケージ数が少ないプロジェクトではキャレット表記で積極的にアップグレードし、規模が大きくなるほどチルダ表記で慎重にアップグレードすると良い。

```bash
# キャレット表記
# メジャーバージョンはそのままで、マイナーバージョンとパッチバージョンを自動でアップグレードする
{

    ...

    "require": {
        "foo": "^1.1.1",  # >=1.1.1 and <1.2.0
        "bar": "^1.1",    # >=1.1.0 and <1.2.0
        "baz": "^0.0.1"   # >=0.0.1 and <0.0.2
    }

    ...

}
```

```bash
# チルダ表記
# メジャーバージョンとマイナーバージョンはそのままで、パッチバージョンを自動でアップグレードする
{

    ...

    "require": {
        "foo": "~1.1.1",  # >=1.1.1 and <2.0.0
        "bar": "~1.1",    # >=1.1.0 and <2.0.0
        "baz": "~1"       # >=1.1.0 and <2.0.0
    }

    ...

}
```

```bash
# エックス、アスタリスク表記
{

    ...

    "require": {
        "foo": "*",     # どんなバージョンでもOK
        "bar": "1.1.x", # >=1.1.0 and <1.2.0
        "baz": "1.X",   # >=1.0.0 and <2.0.0
        "qux": ""       # "*"と同じことになる = どんなバージョンでもOK
    }

    ...

}
```

```bash
# 固定
{

    ...

    "require": {
        "bar": "1.1.1", # 1.1.1
    }

    ...

}
```

> - https://getcomposer.org/doc/04-schema.md#package-links

#### ▼ scripts

コマンドのエイリアスを設定する。

```yaml
{

    ...

    "scripts": {
        # エイリアス
        "post-autoload-dump": [
            # 実行するコマンド
            "Illuminate\\Foundation\\ComposerScripts::postAutoloadDump",
            "@php artisan package:discover --ansi"
        ],
        "post-root-package-install": [
            "@php -r \"file_exists(".env") || copy(".env.example", ".env");\""
        ],
        "post-create-project-cmd": [
            "@php artisan key:generate --ansi"
        ]
    }

    ...

}
```

> - https://getcomposer.org/doc/04-schema.md#scripts

#### ▼ version

Composerのバージョンを設定する。

インストールされているcomposerと齟齬がないようにする。

```yaml
{
    ...

    "version": "1.10.23"

    ...
}
```

> - https://getcomposer.org/doc/04-schema.md#version

<br>

### `composer.lock`ファイル

プロジェクトで`composer install`コマンドが実行された時、`composer.json`ファイルでのバージョンの指定方法が『固定』以外であると、コマンドの実行タイミングによって、インストールされるバージョンが変わってしまう。

インストーされるバージョンをチーム内で固定するため、プロジェクトが正しく動作するバージョンのセットを記載した`composer.lock`ファイルを作成しておく必要がある。

これは、`composer update`の実行時に作成される。

`composer install`の実行タイミングに限らず、共通のバージョンのセットをインストールできる。

もし、アプリケーションに実際にインストールされている各パッケージのバージョンを知りたい場合は、`composer.json`ファイルではなく、`composer.lock`ファイルを確認すること。

<br>

### `autoload.php`ファイル

#### ▼ `autoload.php`ファイルとは

プロジェクト内の全てのphpファイルを名前空間に対応づけ、`require`関数を使用せずに名前空間のみでパッケージを読み込めるようにする。

エントリーポイント (`index.php`ファイル) あるいは`bootstrap.php`ファイルで、`autoload.php`ファイルを読み込むようにすると良い。

```php
<?php
# エントリーポイント

require_once realpath(__DIR__ . "/vendor/autoload.php");
```

```php
<?php
# autoload.phpファイルの一部

// autoload_classmap.php @generated by Composer

$vendorDir = dirname(dirname(__FILE__));
$baseDir = dirname($vendorDir);

# 名前空間とファイルの対応関係
return array(
    'App\\Console\\Kernel' => $baseDir . '/app/Console/Kernel.php',
    'App\\Events\\Event' => $baseDir . '/app/Events/Event.php',
    'App\\Events\\ExampleEvent' => $baseDir . '/app/Events/ExampleEvent.php',

    ...

    'phpDocumentor\\Reflection\\Types\\Void_' => $vendorDir . '/phpdocumentor/type-resolver/src/Types/Void_.php',
    'phpDocumentor\\Reflection\\Utils' => $vendorDir . '/phpdocumentor/reflection-docblock/src/Utils.php',
    'voku\\helper\\ASCII' => $vendorDir . '/voku/portable-ascii/src/voku/helper/ASCII.php',
);
```

#### ▼ 確認方法

登録済みのphpファイルと名前空間の対応関係は、`php`コマンドで確認すると良い。

```bash
$ php -r '
    $autoloader = require "vendor/autoload.php";
    echo json_encode($autoloader->getPrefixesPsr4(), JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
  '
```

<br>

## 02-02. composerコマンド

### clear-cache

インストール時に作成されたキャッシュを削除する。

```bash
$ composer clear-cache
```

<br>

### create-project

パッケージが既に組み込まれたプロジェクトを作成する。

プロジェクトを`git clone`コマンドを実行することにより、プロジェクト内で`composer install`コマンドを実行することと同じである。

新しいディレクトリを作成しつつ、プロジェクトのファイルを展開もできるが、カレントディレクトリ配下にそのまま展開した方が便利である。

補足として、ファイルが1つでもあるディレクトリにはプロジェクトのファイルを展開できないため、一時的に削除しておく。

```bash
# カレントディレクトリ配下にプロジェクトを作成する。
$ composer create-project --prefer-dist laravel/lumen .
```

> - https://getcomposer.org/doc/03-cli.md#create-project

<br>

### diagnose

Composerを使用するための準備が揃っているかを検証する。

```bash
$ composer diagnose

You are running Composer with SSL/TLS protection disabled.
Checking composer.json: OK
Checking platform settings: OK
Checking git settings: OK
Checking http connectivity to packagist: OK
Checking https connectivity to packagist: OK
...
```

<br>

### dump-autoload

事前に設定された`autoload`プロパティを基に、クラスの名前空間とパスの対応関係を登録する。

```bash
$ composer dump-autoload
```

存在するクラスが見つからないエラーに悩まされた時は、クラスが登録されていない可能性があるため、`dump-autoload`を実行すると良い。

```bash
 Exception : Target class [FooClass] does not exist.
```

また、`autoload`プロパティに登録されているパスが誤っていないかも確認した方が良い。

```yaml
{"autoload": {"psr-4": {}}}
```

> - https://getcomposer.org/doc/03-cli.md#dump-autoload-dumpautoload-

<br>

### init

対話形式で`composer.json`ファイルを作成する。

```bash
$ composer init
```

> - https://getcomposer.org/doc/03-cli.md#init

<br>

### install

#### ▼ installとは

事前に`composer.json`ファイルに書き込まれたパッケージを、`composer.lock`ファイルに書き込まれたバージョンでインストールする。

```bash
$ composer install
```

> - https://getcomposer.org/doc/03-cli.md#install-i
> - https://prograshi.com/framework/laravel/require-update-install/

#### ▼ -vvv

コマンド処理中のログを表示する

```bash
$ composer install -vvv
```

#### ▼ --no-dev

require-devタグ内のパッケージは除いてインストール

```bash
$ composer install --no-dev
```

#### ▼ --prefer-dist

Composerの配布サイトからインストールする。`prefer-source`オプションを使用するよりも高速でインストールできる。

デフォルトでdistを使用するため、実際は宣言しなくても問題ない。

```bash
$ composer install --prefer-dist
```

#### ▼ --prefer-source

GitHubのComposerリポジトリからインストールする。

Composerの開発者用である。

```bash
$ composer install --prefer-source
```

<br>

### reinstall

#### ▼ reinstallとは

指定したパッケージをアンインストールした後、再インストールする。

> - https://getcomposer.org/doc/03-cli.md#reinstall

```bash
$ composer reinstall <パッケージ名>
```

再インストールで問題を解決できなければ、全てのパッケージを再インストールすると良い。

composerキャッシュと`vendor`ディレクトリを削除し、`composer install`コマンドを実行する。

```bash
$ composer clearcache
$ rm -rf vendor
$ composer install -vvv
```

<br>

### remove

#### ▼ removeとは

パッケージを`composer.json`ファイルと`composer.lock`ファイルの両方から削除する。

```bash
$ composer remove <パッケージ名>
```

> - https://5balloons.info/remove-composer-package-and-its-dependencies-from-laravel/
> - https://getcomposer.org/doc/03-cli.md#remove

<br>

### require

#### ▼ requireとは

パッケージ名を`composer.json`ファイルと`composer.lock`ファイルの両方に書き込み、インストールする。

または、パッケージのアップグレード/ダウングレードする場合、パッケージのバージョンを書き換える。

コマンドを使用せずに自分で実装しても良い。

> - https://getcomposer.org/doc/03-cli.md#require
> - https://prograshi.com/framework/laravel/require-update-install/

```bash
$ composer require <パッケージ名>:^1.0
```

<br>

### scripts

事前に設定された`scripts`プロパティに設定されたスクリプトを実行する。

```bash
$ composer <スクリプト名>
```

<br>

### update

#### ▼ updateとは

事前に`composer.json`ファイルに書き込まれたパッケージを最新のバージョンでインストールし、`composer.lock`ファイルを書き換える。

`composer.lock`ファイルに全てのパッケージ情報を書き込むため、リポジトリの利用者がインストールするパッケージにも影響を与える。

パッケージ内でエラーが発生したら、`composer update`コマンドによるパッケージの更新が原因だと考えた方が良い。

いずれかのパッケージで新バージョンがリリースされたが、これに不具合があった可能性が高い。

```bash
# 必要なパッケージをcomposer.jsonファイルに追加した上で実行する。
$ composer update
```

> - https://getcomposer.org/doc/03-cli.md#update
> - https://prograshi.com/framework/laravel/require-update-install/

#### ▼ -vvv

コマンド処理中のログを表示する

```bash
$ composer update -vvv
```

<br>

### 環境変数

#### ▼ `COMPOSER_MEMORY_LIMIT`

Composerのコマンドの実行時のメモリ上限を設定する。

メモリ上限を無しにして、コマンドを実行できる。

phpバイナリファイルを使用する。

コンテナ内で実行する場合、設定画面からコンテナのCPUやメモリを増設もできる。

```bash
$ COMPOSER_MEMORY_LIMIT=-1 composer install --prefer-dist -vvv
```

```bash
$ COMPOSER_MEMORY_LIMIT=-1 composer update -vvv
```

<br>

## 03. バージョンアップの手順

### 事前確認の重要性

バージョン更新により、アプリケーションやこれに関係する他のアプリケーションに影響が起こる可能性がある。

そのため、想定外の影響が起こらないように、マニュアルやリリースノートにて、バージョン間の差異を全て確認しておく必要がある。

<br>

### バージョン間の互換性を確認

破壊的変更のためにバージョン間で互換性が全くなく、旧バージョンと新バージョンで使用方法やオプションが異なる可能性がある。

一方で、互換性があるものの、大きな変更がなされている可能性がある。

<br>

### 追加、廃止、非推奨を確認

バージョンアップにより、新機能が追加されている可能性がある。

一方で、今までの方法が廃止または非推奨に移行している可能性がある。

<br>

### 予約語や関数を確認

バージョンアップにより、予約語や関数が変更されている可能性がある。

予約語を自身が使用しているとバッティングしてエラーになってしまう。

<br>

### アプリケーションの修正作業の考慮

バージョンアップに伴ってコードの修正が必要なことがわかった場合、バージョンアップの手順自体に修正作業を組み込む必要がある。

<br>

### メンテナンスページの表示

バージョンアップによりダウンタイムが発生する場合、その間はメンテナンスページを表示する必要がある、例えば、AWS ALBにはメンテナンスページを表示するための機能がある。

<br>

### 更新作業をリハーサル

テスト環境で更新作業をリハーサルし、問題なく完了することを確認する。

<br>

### アプリケーションのテスト

テスト環境のバージョンアップ後に、アプリケーションを検証する必要がある。

<br>

### リードレプリカを最初にアップデート

<br>

### 切り戻し作業の考慮

本番環境のバージョンアップ後に想定外の問題が起こることも考慮して、バージョンアップの手順自体に切り戻し作業を組み込む必要がある。

<br>
