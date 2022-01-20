---
title: 【知見を書きなぐるサイト】パッケージ@JavaScript
---

# パッケージ@JavaScript

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. npmによるパッケージの管理

### init

#### ・```package.json```ファイルの作成

プロジェクトの```package.json```ファイルを作成する．

```bash
$ npm init
```

<br>

#### ・```package.json```ファイルの構造

```bash
{
  # npmパッケージ名．全てのnpmパッケージの中で，一意の名前でなければならない．
  "name": "tech-notebook-mkdocs",
  "version": "1.0.0",
  "description": "tech-notebook-mkdocs",
  "main": "index.js",
  "directories": {},
  # 本番環境と開発環境で依存するパッケージ名．パッケージ名は一意に識別できる．
  "dependencies": {
    "gitbook-plugin-advanced-emoji": "^0.2.2",
    "gitbook-plugin-anchors": "^0.7.1",
    "gitbook-plugin-back-to-top-button": "^0.1.4",
    "gitbook-plugin-copy-code-button": "^0.0.2",
    "gitbook-plugin-ga": "^1.0.1",
    "gitbook-plugin-github-buttons": "^3.0.0",
    "gitbook-plugin-hide-published-with": "^1.0.3",
    "gitbook-plugin-intopic-toc": "^1.1.1",
    # パッケージとして登録されていないもの『リポジトリURLから直接参照する．『git+』を忘れないこと．
    "gitbook-plugin-prism": "git+https://github.com/hiroki-it/gitbook-plugin-prism.git",
    "gitbook-plugin-search-pro-fixed": "^1.0.1",
    "gitbook-plugin-sunlight-highlighter": "^0.4.3",
    "gitbook-plugin-toolbar": "^0.6.0"
  },
  # 開発環境のみ依存するパッケージ名．
  "devDependencies": {},
  "scripts": {},
  "repository": {
    "type": "git",
    "url": "https://github.com/hiroki-it/tech-notebook-mkdocs.git"
  },
  # 著者名
  "author": {
    "name": "Hiroki Hasegawa",
    "email": "example@gmail.com",
    "url": "https://github.com/hiroki-it"
  },
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/hiroki-it/tech-notebook-mkdocs/issues"
  },
  "homepage": "https://github.com/hiroki-it/tech-notebook-mkdocs"
}
```

<br>

### install

#### ・オプション無し

アプリケーションにて，```package.lock```ファイルに実装されたパッケージのうちで，インスールされていないものをインストールする．```package.lock```ファイルのおかげで，リポジトリの利用者が，```npm install```の実行時に，共通のバージョンのパッケージをインストールできる．

```bash
$ npm install
```

#### ・--force

パッケージのインストール時に，ディレクトリの実行権限不足でインストールが停止することがある．これを無視してインストールを行う．

```bash
$ npm install --force
```

#### ・--save

デフォルトで有効化されている．パッケージのインストール時に，依存するパッケージとして，```dependencies```キーにパッケージ名とバージョンを書き込む．

```bash
$ npm install --save
```

<br>

### update

#### ・オプション無し

アプリケーションにて，```package.json```ファイルに実装されたバージョンの指定をもとに，更新可能なパッケージを更新する．

```bash
$ npm update
```

<br>

### run

#### ・オプション無し

ユーザーが定義したエイリアス名のコマンドを実行する．

```bash
$ npm run <エイリアス名>
```

あらかじめ，任意のエイリアス名を```scripts```キー下に定義する．エイリアスの中で，実行するコマンドのセットを定義する．ちなみに，実行するコマンドの中で，再び```run```コマンドを定義することも可能である．

```bash
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

メモリ上限を設定する．

```bash
$ export NODE_OPTIONS="--max-old-space-size=2048"
```

<br>

## 02. yarnによるパッケージ管理

<br>

## 03. モジュールバンドル

### モジュールバンドルとは

#### ・読み込むパッケージをまとめる

JavaScriptファイルを読み込むscriptタグを1つにまとめる．HTMLがブラウザにレンダリングされると，JavaScriptのファイルへのリクエスト数が減るため，Webページの読み込みが早くなる．

参考：https://qiita.com/soarflat/items/28bf799f7e0335b68186

**＊例＊**

以下のようなHTMLファイルがあるとする．

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

モジュールバンドルは，scriptタグでのパッケージの読み込みをまとめる．

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



