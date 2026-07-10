---
title: 【IT技術の知見】コマンド＠Laravel
description: コマンド＠Laravelの知見を記録しています。
---

# コマンド＠Laravel

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. artisanコマンド

### artisanコマンドとは

アプリケーションの開発に役立つコマンドを提供する。

> - https://readouble.com/laravel/8.x/ja/artisan.html

<br>

### config

#### ▼ キャッシュの削除

キャッシュ (`bootstrap/cache/config.php` ファイル) を削除する。

```bash
$ php artisan config:clear
```

<br>

### make

#### ▼ factory

Factory を自動的に作成する。

```bash
$ php artisan make:factory <Factory名> --model=<対象とするModel名>
```

#### ▼ HTTP｜controller

```bash
# コントローラークラスを自動作成
$ php artisan make:controller <Controller名>
```

#### ▼ HTTP｜formRequest

FormRequest クラスを自動作成する。

```bash
$ php artisan make:request <Request名>
```

#### ▼ HTTP｜middleware

Middleware クラスを自動作成する。

```bash
$ php artisan make:middleware <Middleware名>
```

#### ▼ migration

DB マイグレーションファイルを作成する。

```bash
$ php artisan make:migration create_<テーブル名>_table
```

#### ▼ model

Eloquent モデルを自動作成する。

```bash
$ php artisan make:model <Eloquentモデル名>
```

#### ▼ resource

Resource クラスを自動作成する。

```bash
$ php artisan make:resource <Resource名>
```

#### ▼ provider

Provider クラスを自動作成する。

```bash
$ php artisan make:provider <クラス名>
```

#### ▼ seeder

Seeder クラスを自動作成する。

```bash
$ php artisan make:seeder <Seeder名>
```

<br>

### migrate

#### ▼ migrateとは

DB マイグレーションファイルを元にテーブルを作成する。

```bash
$ php artisan migrate
```

コマンド実行時、以下のエラーが表示される場合もある。

DB マイグレーションファイル名のスネークケースで、これがクラス名のキャメルケースと対応づけられており、ファイル名とクラス名の関係が正しくないために起こるエラーである。

```bash
Symfony\Component\Debug\Exception\FatalThrowableError : Class "CreateFooTable" not found
```

#### ▼ status

DB マイグレーションの結果を確認する。

```bash
$ php artisan migrate:status
```

#### ▼ rollback

指定した履歴数だけ、ロールバックする。

```bash
$ php artisan migrate:rollback --step=<ロールバック数>
```

実際の使用場面として、DB マイグレーションに失敗した場合、1 つ前の履歴にロールバックして DB マイグレーションファイルを修正した後、再び DB マイグレーションを行う。

```bash
# DBマイグレーションに失敗したので、1つ前の履歴にロールバック。
$ php artisan migrate:rollback --step=1

# ファイル修正後にDBマイグレーションを実行
$ php artisan migrate
```

> - https://readouble.com/laravel/8.x/ja/migrations.html#rolling-back-migrations

#### ▼ reset

初期の状態まで、すべてロールバックする。

```bash
$ php artisan migrate:reset
```

> - https://readouble.com/laravel/8.x/ja/migrations.html#rolling-back-migrations

#### ▼ refresh

すべてのロールバック (`migrate:reset`) を実行し、次いで `migrate` を実行する。

```bash
$ php artisan migrate:refresh
```

> - https://readouble.com/laravel/8.x/ja/migrations.html#roll-back-migrate-using-a-single-command

#### ▼ fresh

すべてのテーブルを削除と `migrate` を実行する。

DB マイグレーションファイルの構文チェックを行わずに、強制的に実行される。

```bash
$ php artisan migrate:fresh
```

DB マイグレーション時、テーブルがすでに存在するエラーは発生する場合もある。

この場合、テーブルが DB マイグレーションされる前までロールバックし、DB マイグレーションを再実行することが最適である。

しかしそれが難しければ、このコマンドを実行する必要がある。

```bash
SQLSTATE[42S01]: <テーブル名> table or view already exists
```

> - https://readouble.com/laravel/8.x/ja/migrations.html#drop-all-tables-migrate

#### ▼ --force

DB マイグレーション時、本当に実行してよいか確認画面 (Yes/No) が表示される。

CI/CD パイプライン時に、この確認画面で Yes/No を入力できないため、確認画面をスキップできるようにする必要がある。

```bash
$ php artisan migrate --force
```

> - https://readouble.com/laravel/8.x/ja/migrations.html#forcing-migrations-to-run-in-production

<br>

### route

#### ▼ list

登録済みのルーティングの一覧を取得する。

```bash
# ルーティングの一覧を表示する
$ php artisan route:list
```

#### ▼ clear

ルーティングのキャッシュを削除する。

```bash
# ルーティングのキャッシュを削除
$ php artisan route:clear

# 全てのキャッシュを削除
$ php artisan optimize:clear
```

<br>

### db

#### ▼ seed

Seeder を実行する。Seeder を新しく作成したときや Seeder 名を変更したとき、Composer の `dump-autoload` を実行する必要がある。

```bash
$ composer dump-autoload
```

```bash
# 特定のSeederを実行
$ php artisan db:seed --class=<Seeder名>

# DatabaseSeederを指定して、全てのSeederを実行
$ php artisan db:seed --class=<Seeder名>
```

<br>

### storage

#### ▼ link

シンボリックリンクを作成する

```bash
$ php artisan storage:link
```

<br>

### view

#### ▼ clear

キャッシュを削除する。

```bash
# ビューのキャッシュを削除
$ php artisan view:clear

# 全てのキャッシュを削除
$ php artisan optimize:clear
```

<br>
