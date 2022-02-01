---
title: 【知見を記録するサイト】Composer
---

# パッケージ管理@PHP

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Composerによる管理

### セットアップ

参考：https://getcomposer.org/download/

<br>

### ```composer.json```ファイル

#### ・autoload

名前空間とファイルパスの対応関係を設定する．```require```関数を使用せずに，クラスの名前空間を```use```で指定するだけでファイルを読み込めるようになる．

参考：

- https://getcomposer.org/doc/04-schema.md#autoload
- https://atmarkit.itmedia.co.jp/ait/articles/1808/01/news009_3.html

```bash
{
    "autoload": {
        "psr-4": {
             # "<名前空間>": "<ファイルパス>",
            "App\\": "app/",
            "Database\\Factories\\Infrastructure\\DTO\\": "database/factories/production",
            "Database\\Seeders\\": "database/seeds/production"
        },
        "classmap": [
            "database/seeds",
            "database/factories"
        ]
    }
}
```

#### ・require

インストールされるパッケージとバージョンを設定する．

参考：https://getcomposer.org/doc/04-schema.md#package-links

```bash
# 個人的に一番おすすめ
# キャレット表記
{
  "require": {
    "foo": "^1.1.1",  # >=1.1.1 and <1.2.0
    "bar": "^1.1",    # >=1.1.0 and <1.2.0
    "baz": "^0.0.1"   # >=0.0.1 and <0.0.2
  }
}
```

```bash
# チルダ表記
{
  "require": {
    "foo": "~1.1.1",  # >=1.1.1 and <2.0.0
    "bar": "~1.1",    # >=1.1.0 and <2.0.0
    "baz": "~1"       # >=1.1.0 and <2.0.0
  }
}
```

```bash
# エックス，アスタリスク表記
{
  "require": {
    "foo": "*",     # どんなバージョンでもOK
    "bar": "1.1.x", # >=1.1.0 and <1.2.0 
    "baz": "1.X",   # >=1.0.0 and <2.0.0
    "qux": ""       # "*"と同じことになる = どんなバージョンでもOK
  }
}
```

#### ・scripts

コマンドのエイリアスを設定する．

参考：https://getcomposer.org/doc/04-schema.md#scripts

```bash
{
    "scripts": {
        # エイリアス名
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
}
```

<br>

#### ・version

composerのバージョンを設定する．インストールされているcomposerと齟齬がないようにする．

参考：https://getcomposer.org/doc/04-schema.md#version

```bash
{
  "version": "1.10.23"
}
```

<br>

## 01-02. コマンド

### clear-cache

インストール時に生成されたキャッシュを削除する．

```bash
$ composer clear-cache
```

<br>

### create-project

パッケージが既に組み込まれたプロジェクトを作成する．プロジェクトを```git clone```し，この中で```composer install```を実行することと同じである．新しいディレクトリを作成しつつ，プロジェクトのファイルを展開することもできるが，カレントディレクトリにそのまま展開した方が便利である．なお，ファイルが1つでもあるディレクトリにはプロジェクトのファイルを展開できないため，一時的に削除しておく．

参考：https://getcomposer.org/doc/03-cli.md#create-project

```bash
# カレントディレクトリにプロジェクトを作成する．
$ composer create-project --prefer-dist laravel/lumen .
```

<br>

### diagnose

composerを用いるための準備が揃っているかを検証する．

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

事前に設定された```autoload```プロパティを基に，クラスの名前空間とファイルパスの対応関係を登録する．

参考：https://getcomposer.org/doc/03-cli.md#dump-autoload-dumpautoload-

```bash
$ composer dump-autoload
```

存在するクラスが見つからないエラーに悩まされた時は，クラスが登録されていない可能性があるため，```dump-autoload```を実行すると良い．

```log
 Exception : Target class [FooClass] does not exist.
```

また，```autoload```プロパティに登録されているパスが誤っていないかも確認した方が良い．

```bash
{
    # 〜 中略 〜

    "autoload": {
        "psr-4": {
             # パスが誤っていないか
        }
    },
    
    # 〜 中略 〜
}
```



<br>

### init

対話形式で```composer.json```ファイルを作成する．

参考：https://getcomposer.org/doc/03-cli.md#init

```bash
$ composer init
```

<br>

### install

#### ・オプション無し

アプリケーションにて，```composer.lock```ファイルに実装されたパッケージを全てインストールする．```composer.lock```ファイルのおかげで，リポジトリの利用者が，```composer install```の実行時に，共通のバージョンのパッケージをインストールできる．

参考：https://getcomposer.org/doc/03-cli.md#install-i

```bash
$ composer install 
```

#### ・-vvv

コマンド処理中のログを表示する

```bash
$ composer install -vvv
```

####  ・--no-dev

require-devタグ内のパッケージは除いてインストール

```bash
$ composer install --no-dev
```

#### ・--prefer-dist

Composerの配布サイトからインストールする．```prefer-source```オプションを用いるよりも高速でインストールできる．デフォルトでdistを用いるため，実際は宣言しなくても問題ない．

```bash
$ composer install --prefer-dist
```

#### ・--prefer-source

GitHubのComposerリポジトリからインストールする．Composerの開発者用である．

```bash
$ composer install --prefer-source
```

<br>

### reinstall

#### ・オプション無し

指定したパッケージをアンインストールした後，再インストールする．

参考：https://getcomposer.org/doc/03-cli.md#reinstall

```bash
$ composer reinstall <パッケージ名>
```

再インストールで問題を解決できなければ，全てのパッケージを再インストールすると良い．composerキャッシュと```vendor```ディレクトリを削除し，```install```コマンドを実行する．

```bash
$ composer clearcache
$ rm -rf vendor
$ composer install
```

<br>

### require

#### ・オプション無し

パッケージ名を```composer.json```ファイルを書き込む．インストールは行わない．コマンドを使用せずに自分で実装しても良い．

```bash
$ composer require <パッケージ名>:^x.x
```

<br>

### scripts

事前に設定された```scripts```プロパティに設定されたスクリプトを実行する．

```bash
$ composer <スクリプト名>
```

<br>

### update

#### ・オプション無し

アプリケーションにて，```composer.json```ファイルに実装されたパッケージのうちで，インストールされていないものをインストールする．また，バージョンの指定を基に更新可能なパッケージを更新する．```composer.lock```ファイルに全てのパッケージ情報を書き込むため，リポジトリの利用者がインストールするパッケージにも影響を与える．

```bash
$ composer update
```

パッケージ内でエラーが発生したら，```update```コマンドによるパッケージの更新が原因だと考えた方が良い．いずれかのパッケージで新しいバージョンがリリースされたが，これに不具合があった可能性が高い．

####  ・-vvv

コマンド処理中のログを表示する

```bash
$ composer install -vvv
```

####  ・COMPOSER_MEMORY_LIMIT=-1

phpのメモリ上限を無しにして，任意のcomposerコマンドを実行する．phpバイナリファイルを用いる．dockerコンテナ内で実行する場合，設定画面からコンテナのCPUやメモリを増設することもできる．

```bash
$ COMPOSER_MEMORY_LIMIT=-1 composer update -vvv
```

```bash
$ COMPOSER_MEMORY_LIMIT=-1 composer install --prefer-dist -vvv
```

<br>

## 01-03. パッケージの読み込み

### ```autoload.php```ファイルの読み込み

パッケージが，```vendor```ディレクトリ下に保存されていると仮定する．パッケージを用いるたびに，各クラスでディレクトリを読み込むことは手間なので，エントリーポイント（```index.php```）あるいは```bootstrap.php```で，最初に読み込んでおき，クラスでは読み込まなくて良いようにする．

**＊実装例＊**

```php
<?php
    
require_once realpath(__DIR__ . "/vendor/autoload.php");
```

<br>

## 02. バージョンアップの手順

### 事前確認の重要性

バージョン更新により，アプリケーションやこれに関係する他のアプリケーションに影響が起こる可能性がある．そのため，予想外の影響が起こらないように，マニュアルやリリースノートにて，バージョン間の差異を全て確認しておく必要がある．

<br>

### バージョン間の互換性を確認

破壊的変更のためにバージョン間で互換性が全くなく，古いバージョンと新しいバージョンで使用方法やオプションが異なる可能性がある．一方で，互換性があるものの，大きな変更がなされている可能性がある．

<br>

### 追加，廃止，非推奨を確認

バージョンアップにより，新しい機能が追加されている可能性がある．一方で，今までの方法が廃止または非推奨に移行している可能性がある．

<br>

### 予約語や関数を確認

バージョンアップにより，予約語や関数が変更されている可能性がある．予約語を自身が用いているとバッティングしてエラーになってしまう．

<br>

### アプリケーションの修正作業の考慮

バージョンアップに伴ってソースコードの修正が必要なことがわかった場合，バージョンアップの手順自体に修正作業を組み込む必要がある．

<br>

### メンテナンスページの表示

バージョンアップによりダウンタイムが発生する場合，その間はメンテナンスページを表示する必要がある，例えば，ALBにはメンテナンスページを表示するための機能がある．

<br>

### 更新作業をリハーサル

テスト環境で更新作業をリハーサルし，問題なく完了することを確認する．

<br>

### アプリケーションのテスト

テスト環境のバージョンアップ後に，アプリケーションをテストする必要がある．

<br>

### リードレプリカを最初にアップデート

<br>

### 切り戻し作業の考慮

本番環境のバージョンアップ後に想定外の問題が起こることも考慮して，バージョンアップの手順自体に切り戻し作業を組み込む必要がある．
