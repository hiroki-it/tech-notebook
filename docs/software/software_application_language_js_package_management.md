---
title: 【IT技術の知見】パッケージ＠JavaScript
---

# パッケージ管理＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Npmによる管理：Node Package Manager

### セットアップ

#### ▼ yumリポジトリから

```bash
# リポジトリの作成
$ curl -sL https://rpm.nodesource.com/setup_<バージョン>.x | bash -

# nodejsのインストールにnpmも含まれる
$ yum install -y nodejs
```

<br>

### ```package.json```ファイル

#### ▼ author

パッケージの作成者名を設定する。

```yaml
{
  "author": {
    "name": "Hiroki Hasegawa",
    "email": "example@gmail.com",
    "url": "https://github.com/hiroki-hasegawa"
  },
}
```

#### ▼ bug

不具合の報告先のURLを設定する。

```yaml
{
  "bugs": {
    "url": "https://github.com/hiroki-hasegawa/foo/issues"
  },
}
```

#### ▼ dependencies

本番環境と開発環境で依存するパッケージ名を設定する。NPMに登録されていないパッケージは、『```git+<GitHubリポジトリURL>```』を指定する。

```yaml
{
  "dependencies": {
    "foo": "^1.1.1",
    "baz": "^1.0.1",
    "baz": "git+https://github.com/baz/baz-package.git",
  },
}
```

#### ▼ description

```yaml
{
  "description": "This is foo package",
}
```

#### ▼ devDependencies

開発環境のみ依存するパッケージ名を設定する。

```yaml
{
  "devDependencies": {},
}
```

#### ▼ directories

```yaml
{
  "directories": {},
}
```

#### ▼ homepage

```yaml
{
  "homepage": "https://example.com"
}
```
#### ▼ main

```yaml
{
  "main": "index.js",
}
```

#### ▼ name

npmパッケージ名を設定する。全てのnpmパッケージの中で、一意の名前でなければならない。

```yaml
{
  "name": "foo",
}
```

#### ▼ repository

```yaml
{
  "repository": {
    "type": "git",
    "url": "https://github.com/hiroki-hasegawa/foo.git"
  }
}
```

#### ▼ scripts

汎用コマンドとエイリアスを設定する。

```yaml
{
  "scripts": {
    "foo": "npm install"
  }
}
```

#### ▼ version

パッケージのバージョンを設定する。

```yaml
{
  "version": "<バージョンタグ>",
}
```

<br>

### ```package.lock```ファイル

Composerの```composer.lock```ファイルに相当する。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_php_package_management.html

<br>

## 01-02. npmコマンド

### init

#### ▼ ```package.json```ファイルの作成

プロジェクトの```package.json```ファイルを作成する。

```bash
$ npm init
```

<br>

### install

#### ▼ installとは

アプリケーションにて、```package.lock```ファイルに実装されたパッケージのうちで、インスールされていないものをインストールする。```package.lock```ファイルのおかげで、リポジトリの利用者が、```npm install```の実行時に、共通のバージョンのパッケージをインストールできる。

```bash
$ npm install
```

指定したパッケージをインストールもできる。

```bash
$ npm install <パッケージ名>
```

#### ▼ --force

パッケージのインストール時に、ディレクトリの実行権限不足でインストールが停止する場合がある。これを無視してインストールを行う。

```bash
$ npm install --force
```

#### ▼ --save

デフォルトで有効化されている。パッケージのインストール時に、依存するパッケージとして、```dependencies```キーにパッケージ名とバージョンを書き込む。

```bash
$ npm install --save
```

<br>

### update

#### ▼ updateとは

全てのパッケージのバージョンを、```package.json```ファイルの範囲内でアップグレードする。

```bash
$ npm update
```

<br>

### run

#### ▼ runとは

ユーザーが定義したエイリアス名のコマンドを実行する。

```bash
$ npm run <エイリアス名>
```

あらかじめ、任意のエイリアス名を```scripts```キー下に定義する。エイリアスの中で、実行するコマンドのセットを定義する。ちなみに、実行するコマンドの中で、再び```npm run```コマンドも定義できる。

```yaml
{
    "scripts": {
         # "<エイリアス名>": "<実行するコマンド>",
        "dev": "npm run development",
        "development": "cross-env NODE_ENV=development node_modules/webpack/bin/webpack.js --progress --hide-modules --config=node_modules/laravel-mix/setup/webpack.config.js",
        "watch": "npm run development -- --watch",
        "watch-poll": "npm run watch -- --watch-poll",
        "hot": "cross-env NODE_ENV=development node_modules/webpack-dev-server/bin/webpack-dev-server.js --inline --hot --disable-host-check --config=node_modules/laravel-mix/setup/webpack.config.js",
        "prod": "npm run production",
        "production": "cross-env NODE_ENV=production node_modules/webpack/bin/webpack.js --no-progress --hide-modules --config=node_modules/laravel-mix/setup/webpack.config.js"
    }
}
```

<br>

### NODE_OPTIONS

メモリ上限を設定する。

```bash
$ export NODE_OPTIONS="--max-old-space-size=2048"
```

<br>

## 02. Yarnによる管理

### セットアップ

#### ▼ aptリポジトリから

ℹ️ 参考：https://phoenixnap.com/kb/how-to-install-yarn-ubuntu

```bash
$ apt-get install yarn
```

#### ▼ npmレジストリから

ℹ️ 参考：https://classic.yarnpkg.com/en/docs/install#mac-stable

```bash
$ npm install --global yarn
```

<br>

### ```package.json```ファイル

Npmと同じ。

<br>

### ```yarn.lock```ファイル

Composerの```composer.lock```ファイルに相当する。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_php_package_management.html

<br>

## 02-02. yarnコマンド

### add

指定したパッケージのバージョンを、```package.json```ファイルを無視してインストールする。

```bash
$ yarn add <パッケージ名>@<バージョンタグ>
```

特定のパッケージのバージョンを検証する場合は、```yarn remove```コマンドと```yarn add```コマンドを使用する。

```bash
$ yarn remove foo && yarn add foo@<バージョンタグ>
```

<br>

### install

#### ▼ installとは

指定したバージョンのパッケージを、```package.json```ファイルの範囲内でインストールする。

```bash
$ yarn add <パッケージ名>@<バージョンタグ>
```

#### ▼ --check-files

必要なパッケージが```node_modules```ディレクトリ内にインストールされているかを確認しつつ、不足があれば```install```コマンドを実行する。

ℹ️ 参考：https://classic.yarnpkg.com/en/docs/cli/install/#toc-yarn-install-check-files

```bash
$ yarn install --check-files
```

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

### upgrade

#### ▼ upgradeとは

指定したパッケージを```package.json```ファイルの範囲内でアップグレードする。

ℹ️ 参考：https://qiita.com/teinen_qiita/items/18ca1fb433914e09c9e4

```bash
$ yarn upgrade <パッケージ名>@<バージョンタグ>
```

#### ▼ latest

全てのパッケージを、```package.json```ファイルを無視して最新までアップグレードする。

ℹ️ 参考：https://qiita.com/teinen_qiita/items/18ca1fb433914e09c9e4

```
yarn upgrade --latest
```

<br>

## 03. モジュールバンドル

### モジュールバンドルとは

#### ▼ 読み込むパッケージをまとめる

JavaScriptファイルを読み込むscriptタグを1つにまとめる。```.html```ファイルがブラウザにレンダリングされると、JavaScriptのファイルへのリクエスト数が減るため、Webページの読み出しが早くなる。

ℹ️ 参考：https://qiita.com/soarflat/items/28bf799f7e0335b68186

**＊例＊**

以下のような```.html```ファイルがあるとする。

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
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
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>webpack tutorial</title>
</head>
<body>
<!-- jQueryもバンドルされたファイル -->
<script src="js/bundle.js"></script>
</body>
</html>
```



