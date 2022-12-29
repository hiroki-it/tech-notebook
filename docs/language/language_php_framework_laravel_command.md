---
title: 【IT技術の知見】コマンド＠Laravel
description: コマンド＠Laravelの知見を記録しています。
---

# コマンド＠Laravel

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. artisanコマンド

### artisanコマンドとは

アプリケーションの開発に役立つコマンドを提供する。



> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/artisan.html

<br>

### config

#### ▼ キャッシュの削除

キャッシュ（```bootstrap/cache/config.php```ファイル）を削除する。



```bash
$ php artisan config:clear
```

<br>

### make

#### ▼ factory

Factoryを自動的に作成する。



```bash
$ php artisan make:factory <Factory名> --model=<対象とするModel名>
```

#### ▼ HTTP｜controller

```bash
# コントローラークラスを自動作成
$ php artisan make:controller <Controller名>
```

#### ▼ HTTP｜formRequest

FormRequestクラスを自動作成する。



```bash
$ php artisan make:request <Request名>
```

#### ▼ HTTP｜middleware

Middlewareクラスを自動作成する。



```bash
$ php artisan make:middleware <Middleware名>
```

#### ▼ migration

DBマイグレーションファイルを作成する。



```bash
$ php artisan make:migration create_<テーブル名>_table
```

#### ▼ model

Eloquentモデルを自動作成する。



```bash
$ php artisan make:model <Eloquentモデル名>
```

#### ▼ resource

Resourceクラスを自動作成する。



```bash
$ php artisan make:resource <Resource名>
```

#### ▼ provider

Providerクラスを自動作成する。



```bash
$ php artisan make:provider <クラス名>
```

#### ▼ seeder

Seederクラスを自動作成する。



```bash
$ php artisan make:seeder <Seeder名>
```

<br>

### migrate

#### ▼ migrateとは

DBマイグレーションファイルを元にテーブルを作成する。



```bash
$ php artisan migrate
```

コマンド実行時、以下のエラーが出ることがある。

DBマイグレーションファイル名のスネークケースで、これがクラス名のキャメルケースと対応づけられており、ファイル名とクラス名の関係が正しくないために起こるエラーである。



```bash
Symfony\Component\Debug\Exception\FatalThrowableError : Class "CreateFooTable" not found
```

#### ▼ status

DBマイグレーションの結果を確認する。



```bash
$ php artisan migrate:status
```

#### ▼ rollback

指定した履歴数だけ、ロールバックする。



> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/migrations.html#rolling-back-migrations

```bash
$ php artisan migrate:rollback --step=<ロールバック数>
```

実際の使用場面として、DBマイグレーションに失敗した場合、1つ前の状態にロールバックしてDBマイグレーションファイルを修正した後、再びDBマイグレーションを行う。



```bash
# DBマイグレーションに失敗したので、1つ前の状態にロールバック。
$ php artisan migrate:rollback --step=1

# ファイル修正後にDBマイグレーションを実行
$ php artisan migrate
```

#### ▼ reset

初期の状態まで、全てロールバックする。



> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/migrations.html#rolling-back-migrations

```bash
$ php artisan migrate:reset
```

#### ▼ refresh

全てのロールバック（```migrate:reset```）を実行し、次いで```migrate```を実行する。



> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/migrations.html#roll-back-migrate-using-a-single-command

```bash
$ php artisan migrate:refresh
```

#### ▼ fresh

全てのテーブルを削除と```migrate```を実行する。

DBマイグレーションファイルの構文チェックを行わずに、強制的に実行される。



> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/migrations.html#drop-all-tables-migrate

```bash
$ php artisan migrate:fresh
```

DBマイグレーション時、テーブルがすでに存在するエラーが起こることがある。

この場合、テーブルがDBマイグレーションされる前までロールバックし、DBマイグレーションを再実行することが最適である。

しかしそれが難しければ、このコマンドを実行する必要がある。



```bash
SQLSTATE[42S01]: <テーブル名> table or view already exists
```

#### ▼ --force

DBマイグレーション時、本当に実行して良いか確認画面（Yes/No）が表示される。

CI/CDパイプライン時に、この確認画面でYes/Noを入力できないため、確認画面をスキップできるようにする必要がある。



> ℹ️ 参考：https://readouble.com/laravel/8.x/ja/migrations.html#forcing-migrations-to-run-in-production

```bash
$ php artisan migrate --force
```

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

Seederを実行する。Seederを新しく作成した時やSeeder名を変更した時、Composerの```dump-autoload```を実行する必要がある。

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

