---
title: 【IT技術の知見】パッケージ＠JavaScript
---

# パッケージ管理＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Npmによる管理：Node Package Manager

### セットアップ

#### ▼ yumリポジトリから

```bash
# リポジトリの作成
$ curl -L https://rpm.nodesource.com/setup_<バージョン>.x | bash -

# nodejsのインストールにnpmも含まれる
$ yum install -y nodejs
```

<br>

### ```package.json```ファイル

#### ▼ author

パッケージの作成者名を設定する。



> ↪️ 参考：https://docs.npmjs.com/cli/v7/configuring-npm/package-json#author

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



> ↪️ 参考：https://docs.npmjs.com/cli/v7/configuring-npm/package-json#bug


```yaml
{
  "bugs": {
    "url": "https://github.com/hiroki-hasegawa/foo/issues"
  },
}
```

#### ▼ dependencies

本番環境と開発環境で依存するパッケージ名を設定する。

NPMに登録されていないパッケージは、『```git+<GitHubリポジトリURL>```』を指定する。

```npm install```コマンドの実行時に```--production```オプションを有効化すると、```dependencies```キーが使用される。



```yaml
{
  "dependencies": {
    "foo": "^1.1.1",
    "bar": "^1.0.0",
    "baz": "git+https://github.com/baz/baz-package.git",
  },
}
```

> ↪️ 参考：https://docs.npmjs.com/cli/v7/configuring-npm/package-json#dependencies


#### ▼ description

> ↪️ 参考：https://docs.npmjs.com/cli/v7/configuring-npm/package-json#description

```yaml
{
  "description": "This is foo package",
}
```

#### ▼ devDependencies

開発環境のみ依存するパッケージ名を設定する。

```npm install```コマンドの実行時に```--production```オプションを有効化しないと、```devDependencies```キーが使用される。



```yaml
{
  "devDependencies": {
    "foo": "^1.1.1",
    "bar": "^1.0.0",
    "baz": "git+https://github.com/baz/baz-package.git",
  },
}
```

> ↪️ 参考：https://docs.npmjs.com/cli/v7/configuring-npm/package-json#devdependencies


#### ▼ directories

パッケージのディレクトリ構造を設定する。




```yaml
{
  "directories": {
      "doc": "foo/doc", # ドキュメント
      "lib": "foo/lib" # 実装
  },
}
```

> ↪️ 参考：https://docs.npmjs.com/cli/v7/configuring-npm/package-json#directories


#### ▼ engines

```npm```コマンドのバージョンを設定する。

使用するバージョンを強制し、他のバージョンではコマンドの実行で失敗させるようにする。



> ↪️ 参考：https://qiita.com/suin/items/994458418c737cc9c3e8

```yaml
{
  "engines": {
     "node": "1.0.0",
     "npm": "1.0.0"
  },
}
```

#### ▼ homepage

パッケージを説明するWebサイトのリンクを設定する。



> ↪️ 参考：https://docs.npmjs.com/cli/v7/configuring-npm/package-json#homepage

```yaml
{
  "homepage": "https://example.com"
}
```

#### ▼ main

エントリポイントとなるファイルを設定する。



> ↪️ 参考：https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main

```yaml
{
  "main": "index.js",
}
```

#### ▼ name

npmパッケージ名を設定する。

全てのnpmパッケージの中で、一意の名前でなければならない。


```yaml
{
  "name": "foo",
}
```

> ↪️ 参考：https://docs.npmjs.com/cli/v7/configuring-npm/package-json#name


#### ▼ repository


```yaml
{
  "repository": {
    "type": "git",
    "url": "https://github.com/hiroki-hasegawa/foo.git"
  }
}
```

> ↪️ 参考：https://docs.npmjs.com/cli/v7/configuring-npm/package-json#repository

#### ▼ scripts

汎用コマンドとエイリアスを設定する。```npm run <エイリアス名>```コマンドで実行できる。


```yaml
{
  "scripts": {
    "foo": "npm install"
  }
}
```

> ↪️ 参考：https://docs.npmjs.com/cli/v7/configuring-npm/package-json#scripts



#### ▼ version

パッケージのバージョンを設定する。

```yaml
{
  "version": "<バージョンタグ>",
}
```


> ↪️ 参考：https://docs.npmjs.com/cli/v7/configuring-npm/package-json#version



<br>

### ```package.lock```ファイル

Composerの```composer.lock```ファイルに相当する。

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

アプリケーションにて、```package.lock```ファイルに実装されたパッケージのうちで、インスールされていないものをインストールする。

```package.lock```ファイルのおかげで、リポジトリの利用者が、```npm install```の実行時に、共通のバージョンのパッケージをインストールできる。



```bash
$ npm install
```

指定したパッケージをインストールもできる。



```bash
$ npm install <パッケージ名>
```

#### ▼ --force

パッケージのインストール時に、ディレクトリの実行権限不足でインストールが停止する場合がある。

これを無視してインストールを行う。



```bash
$ npm install --force
```

#### ▼ --save

デフォルトで有効化されている。

パッケージのインストール時に、依存するパッケージとして、```dependencies```キーにパッケージ名とバージョンを書き込む。



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

あらかじめ、任意のエイリアス名を```scripts```キー下に定義する。

エイリアスの中で、実行するコマンドのセットを定義する。

補足として、実行するコマンドの中で、再び```npm run```コマンドも定義できる。



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

```bash
$ apt-get install yarn
```


> ↪️ 参考：https://phoenixnap.com/kb/how-to-install-yarn-ubuntu


#### ▼ npmレジストリから


```bash
$ npm install --global yarn
```

> ↪️ 参考：https://classic.yarnpkg.com/en/docs/install#mac-stable


<br>

### ```package.json```ファイル

Npmと同じ。



<br>

### ```yarn.lock```ファイル

Composerの```composer.lock```ファイルに相当する。

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




```bash
$ yarn install --check-files
```

> ↪️ 参考：https://classic.yarnpkg.com/en/docs/cli/install/#toc-yarn-install-check-files


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


```bash
$ yarn upgrade <パッケージ名>@<バージョンタグ>
```

> ↪️ 参考：https://qiita.com/teinen_qiita/items/18ca1fb433914e09c9e4


#### ▼ latest

全てのパッケージを、```package.json```ファイルを無視して最新までアップグレードする。


```bash
$ yarn upgrade --latest
```

> ↪️ 参考：https://qiita.com/teinen_qiita/items/18ca1fb433914e09c9e4


<br>

## 03. モジュールバンドル

### モジュールバンドルとは

#### ▼ 読み込むパッケージをまとめる

JavaScriptファイルを読み込むscriptタグを1つにまとめる。

```.html```ファイルがブラウザにレンダリングされると、JavaScriptのファイルに対するリクエスト数が減るため、Webページの読み出しが早くなる。



> ↪️ 参考：https://qiita.com/soarflat/items/28bf799f7e0335b68186

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

<br>

