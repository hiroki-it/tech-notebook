---
title: 【IT技術の知見】パッケージ＠JavaScript
---

# パッケージ管理＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Npm：Node Package Manager

### セットアップ

#### ▼ yumリポジトリから

```bash
# リポジトリの作成
$ curl -L https://rpm.nodesource.com/setup_<バージョン>.x | bash -

# nodejsのインストールにnpmも含まれる
$ yum install -y nodejs
```

<br>

### `package.json`ファイル

#### ▼ author

パッケージの作成者名を設定する。

```yaml
{
  "author":
    {
      "name": "Hiroki Hasegawa",
      "email": "example@gmail.com",
      "url": "https://github.com/hiroki-hasegawa",
    },
}
```

> - https://docs.npmjs.com/cli/v7/configuring-npm/package-json#author

#### ▼ bug

不具合の報告先のURLを設定する。

```yaml
{"bugs": {"url": "https://github.com/hiroki-hasegawa/foo/issues"}}
```

> - https://docs.npmjs.com/cli/v7/configuring-npm/package-json#bug

#### ▼ dependencies

本番環境と開発環境で依存するパッケージ名を設定する。

NPMに登録されていないパッケージは、『`git+<GitHubリポジトリURL>`』を指定する。

`npm install`コマンドの実行時に`--production`オプションを有効化すると、`dependencies`キーが使用される。

```yaml
{
  "dependencies":
    {
      "foo": "^1.1.1",
      "bar": "^1.0.0",
      "baz": "git+https://github.com/baz/baz-package.git",
    },
}
```

> - https://docs.npmjs.com/cli/v7/configuring-npm/package-json#dependencies

#### ▼ description

```yaml
{"description": "This is foo package"}
```

> - https://docs.npmjs.com/cli/v7/configuring-npm/package-json#description

#### ▼ devDependencies

開発環境のみ依存するパッケージ名を設定する。

`npm install`コマンドの実行時に`--production`オプションを有効化しないと、`devDependencies`キーが使用される。

```yaml
{
  "devDependencies":
    {
      "foo": "^1.1.1",
      "bar": "^1.0.0",
      "baz": "git+https://github.com/baz/baz-package.git",
    },
}
```

> - https://docs.npmjs.com/cli/v7/configuring-npm/package-json#devdependencies

#### ▼ directories

パッケージのディレクトリ構造を設定する。

`doc`キーでドキュメントのパス、`lib`でパッケージのパスを指定する。

```yaml
{"directories": {"doc": "foo/doc", "lib": "foo/lib"}}
```

> - https://docs.npmjs.com/cli/v7/configuring-npm/package-json#directories

#### ▼ engines

`npm`コマンドのバージョンを設定する。

使用するバージョンを強制し、他のバージョンではコマンドの実行で失敗する。

> - https://qiita.com/suin/items/994458418c737cc9c3e8

```yaml
{"engines": {"node": "1.0.0", "npm": "1.0.0"}}
```

#### ▼ homepage

パッケージを説明するWebサイトのリンクを設定する。

> - https://docs.npmjs.com/cli/v7/configuring-npm/package-json#homepage

```yaml
{"homepage": "https://example.com"}
```

#### ▼ main

エントリポイントとなるファイルを設定する。

> - https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main

```yaml
{"main": "index.js"}
```

#### ▼ name

npmパッケージ名を設定する。

全てのnpmパッケージの中で、一意の名前である必要がある。

```yaml
{"name": "foo"}
```

> - https://docs.npmjs.com/cli/v7/configuring-npm/package-json#name

#### ▼ repository

```yaml
{
  "repository":
    {"type": "git", "url": "https://github.com/hiroki-hasegawa/foo.git"},
}
```

> - https://docs.npmjs.com/cli/v7/configuring-npm/package-json#repository

#### ▼ scripts

汎用コマンドとエイリアスを設定する。`npm run <エイリアス>`コマンドで実行できる。

```yaml
{"scripts": {"foo": "npm install"}}
```

> - https://docs.npmjs.com/cli/v7/configuring-npm/package-json#scripts

#### ▼ version

パッケージのバージョンを設定する。

```yaml
{"version": "<バージョンタグ>"}
```

> - https://docs.npmjs.com/cli/v7/configuring-npm/package-json#version

<br>

### `package.lock`ファイル

Composerの`composer.lock`ファイルに相当する。

<br>

## 01-02. npmコマンド

### init

#### ▼ `package.json`ファイルの作成

プロジェクトの`package.json`ファイルを作成する。

```bash
$ npm init
```

<br>

### install

#### ▼ installとは

アプリケーションにて、`package.lock`ファイルに実装されたパッケージのうちで、インスールされていないものをインストールする。

`package.lock`ファイルのおかげで、リポジトリの利用者が、`npm install`の実行時に、共通のバージョンのパッケージをインストールできる。

```bash
$ npm install
```

指定したパッケージをインストールもできる。

```bash
$ npm install <パッケージ名>
```

#### ▼ --force

パッケージをインストールし、ディレクトリの実行権限不足でインストールが停止する場合がある。

これを無視してインストールを実行する。

```bash
$ npm install --force
```

#### ▼ --global

パッケージをシステムの`node_modules`ディレクトリにインストールする。

```bash
$ npm install --save
```

> - https://docs.npmjs.com/cli/v8/commands/npm-install#global

#### ▼ --save

パッケージを各プロジェクトの`node_modules`ディレクトリにインストールし、`dependencies`キーにパッケージ名とバージョンを書き込む。

デフォルトで`true`である。

```bash
$ npm install --save
```

> - https://docs.npmjs.com/cli/v8/commands/npm-install#global

#### ▼ --save--dev

パッケージをインストールし、`devDependencies`キーにパッケージ名とバージョンを書き込む。

```bash
$ npm install --save--dev
```

<br>

### update

#### ▼ updateとは

全てのパッケージのバージョンを、`package.json`ファイルの範囲内でアップグレードする。

```bash
$ npm update
```

<br>

### run

#### ▼ runとは

ユーザーが定義したエイリアスのコマンドを実行する。

```bash
$ npm run <エイリアス>
```

あらかじめ、任意のエイリアスを`scripts`キー下に定義する。

エイリアスの中で、実行するコマンドのセットを定義する。

補足として、実行するコマンドの中で、再び`npm run`コマンドも定義できる。

```yaml
{
  # コマンド
  "scripts": {
      # "<エイリアス>": "<実行するコマンド>",
      "dev": "npm run development",
      "development": "cross-env NODE_ENV=development node_modules/webpack/bin/webpack.js --progress --hide-modules --config=node_modules/laravel-mix/setup/webpack.config.js",
      "watch": "npm run development -- --watch",
      "watch-poll": "npm run watch -- --watch-poll",
      "hot": "cross-env NODE_ENV=development node_modules/webpack-dev-server/bin/webpack-dev-server.js --inline --hot --disable-host-check --config=node_modules/laravel-mix/setup/webpack.config.js",
      "prod": "npm run production",
      "production": "cross-env NODE_ENV=production node_modules/webpack/bin/webpack.js --no-progress --hide-modules --config=node_modules/laravel-mix/setup/webpack.config.js",
    },
}
```

<br>

### NODE_OPTIONS

メモリ上限を設定する。

```bash
$ export NODE_OPTIONS="--max-old-space-size=2048"
```

<br>

## 02. Yarn

### セットアップ

#### ▼ aptリポジトリから

```bash
$ apt-get install yarn
```

> - https://phoenixnap.com/kb/how-to-install-yarn-ubuntu

#### ▼ npmレジストリから

```bash
$ npm install --global yarn
```

> - https://classic.yarnpkg.com/en/docs/install#mac-stable

<br>

### `package.json`ファイル

Npmと同じ。

<br>

### `yarn.lock`ファイル

Composerの`composer.lock`ファイルに相当する。

<br>

## 02-02. yarnコマンド

### add

#### ▼ addとは

指定したパッケージのバージョンを、`package.json`ファイルを無視してインストールする。

```bash
$ yarn add <パッケージ名>@<バージョンタグ>
```

特定のパッケージのバージョンを検証する場合は、`yarn remove`コマンドと`yarn add`コマンドを使用する。

```bash
$ yarn remove foo && yarn add foo@<バージョンタグ>
```

#### ▼ --dev

パッケージをインストールし、`devDependencies`キーにパッケージ名とバージョンを書き込む。

```bash
$ yarn add <パッケージ名>@<バージョンタグ> --dev
```

<br>

### audit

#### ▼ auditとは

脆弱性のあるパッケージを検出する。

```bash
$ yarn audit
```

> - https://zenn.dev/ymmt1089/articles/20221120_node_vulnerability#%E8%84%86%E5%BC%B1%E6%80%A7%E3%81%AE%E3%81%82%E3%82%8B%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E3%81%AE%E6%A4%9C%E5%87%BA

#### ▼ level

検出する重要度を設定する。

```bash
$ yarn audit --level critical
```

> - https://zenn.dev/ymmt1089/articles/20221120_node_vulnerability#%E8%84%86%E5%BC%B1%E6%80%A7%E3%81%AE%E3%81%82%E3%82%8B%E3%83%91%E3%83%83%E3%82%B1%E3%83%BC%E3%82%B8%E3%81%AE%E6%A4%9C%E5%87%BA

<br>

### build

本番環境用アプリケーションをビルドする。

`package.json`ファイルに定義があり、実際にはフレームワークの起動コマンド (例：Next.jsなら`next build`コマンド) を実行している。

```bash
$ yarn build
```

<br>

### install

#### ▼ installとは

指定したバージョンのパッケージを、`package.json`ファイルの範囲内でインストールする。

```bash
$ yarn install <パッケージ名>@<バージョンタグ>
```

#### ▼ --check-files

必要なパッケージが`node_modules`ディレクトリ内にインストールされているかを確認しつつ、不足があれば`install`コマンドを実行する。

```bash
$ yarn install --check-files
```

> - https://classic.yarnpkg.com/en/docs/cli/install/#toc-yarn-install-check-files

#### ▼ --production

デフォルト値は`false`である。

`package.json`ファイルの`devDependencies`キーのパッケージをインストールしない。

`NODE_ENV`変数に`production`を設定しても有効化できる。

```bash
$ yarn install --production
```

> - https://miyahara.hikaru.dev/posts/20200414/

#### ▼ --verbose

詳細な処理ログを出力する。

```bash
$ yarn install --verbose
```

<br>

### dev

開発環境用アプリケーションを起動する。

`package.json`ファイルに定義があり、実際にはフレームワークの起動コマンド (例：Next.jsなら`next dev`コマンド) を実行している。

<br>

### lint

静的解析を実行する。

`package.json`ファイルに定義があり、実際には`eslint`コマンドを実行している。

```bash
$ yarn lint
```

> - https://zenn.dev/yhay81/articles/def73cf8a02864#%E5%B0%8E%E5%85%A5%E6%96%B9%E6%B3%95

<br>

### list

指定したパッケージのバージョンを取得する。

```bash
$ yarn list --depth=0 | grep <パッケージ名>
```

<br>

### remove

指定したパッケージをアンインストールする。

```bash
$ yarn remove <パッケージ名>
```

<br>

### start

ビルド済みの本番環境用アプリケーションを起動する。

`package.json`ファイルに定義があり、実際にはフレームワークの起動コマンド (例：Next.jsなら`next start`コマンド) を実行している。

```bash
$ yarn build
```

<br>

### upgrade

#### ▼ upgradeとは

指定したパッケージを`package.json`ファイルの範囲内でアップグレードする。

パッケージ数が少ないプロジェクトではキャレット表記で積極的にアップグレードし、規模が大きくなるほどチルダ表記で慎重にアップグレードすると良い。

```bash
$ yarn upgrade <パッケージ名>@<バージョンタグ>

# キャレット表記
$ yarn upgrade <パッケージ名>@^<バージョンタグ>

# チルダ表記
$ yarn upgrade <パッケージ名>@~<バージョンタグ>
```

> - https://qiita.com/teinen_qiita/items/18ca1fb433914e09c9e4

#### ▼ latest

全てのパッケージを、`package.json`ファイルを無視して最新までアップグレードする。

```bash
$ yarn upgrade --latest
```

> - https://qiita.com/teinen_qiita/items/18ca1fb433914e09c9e4

<br>

## 03. モジュールバンドル

### モジュールバンドルとは

#### ▼ 読み込むパッケージをまとめる

`js`ファイルを読み込むscriptタグを1つにまとめる。

`html`ファイルがブラウザにレンダリングされると、JavaScriptのファイルに対するリクエスト数が減るため、Webページの読み出しが早くなる。

**＊例＊**

以下のような`html`ファイルがあるとする。

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>webpack tutorial</title>
  </head>
  <body>
    <script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
    <script src="js/app.js"></script>
  </body>
</html>
```

モジュールバンドルは、scriptタグでのパッケージの読み出しをまとめる。

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>webpack tutorial</title>
  </head>
  <body>
    <!-- jQueryもバンドルされたファイル -->
    <script src="js/bundle.js"></script>
  </body>
</html>
```

> - https://qiita.com/soarflat/items/28bf799f7e0335b68186

<br>
