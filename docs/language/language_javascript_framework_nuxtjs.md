---
title: 【IT技術の知見】Nuxt.js＠フレームワーク
description: Nuxt.js＠フレームワークの知見を記録しています。
---

# Nuxt.js＠フレームワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Nuxt.jsとは

Vue.jsフレームワークを使用したフレームワークである。

<br>

## 02. Nuxt.js用yarnコマンド

### serverモード (SSRモード)

#### ▼ serverモードとは

アプリケーションをSSRとして稼働させる。

> - https://ja.nuxtjs.org/docs/2.x/get-started/commands#target-server

#### ▼ `dev`

開発環境のため、SSRアプリケーションをビルドし、Nodeサーバーを起動する。

Webpackは使用されないため、静的ファイル (例：`html` ファイル、`css` ファイル、画像、動画、メールなど) の圧縮や画像ファイル名のハッシュ化は実行されない。

> - https://ja.nuxtjs.org/docs/2.x/get-started/commands#target-server

```bash
# リファレンスでは nuxt devとなっているが、yarn devで問題ない。
$ yarn dev
```

補足として、`yarn dev` コマンドを実行した場合、環境変数の `NODE_ENV` が `development` になる。

> - https://qiita.com/y-temp4/items/84bb16e2ccf8efaf82fc

#### ▼ `build`

本番環境のため、JavaScriptサーバーの起動前にSSRアプリケーションのビルドを実行する。

`yarn dev` コマンドとは異なり、ビルド時にWebpackによる最適化が実行される。

これにより、`.js` ファイルと `.css` ファイルはミニファイされる。

ミニファイにより、不要な改行やインデントが削除され、パッケージの読み出し用のURLはまとめられ、圧縮される。

画像名はハッシュ化される。

```bash
# リファレンスでは nuxt buildとなっているが、yarn buildで問題ない。
$ yarn build
```

> - https://ja.nuxtjs.org/docs/2.x/get-started/commands#target-server

次の理由で、`yarn build` コマンドでしか再現できないエラーがあることに注意である

- `yarn build` 時には `yarn dev` にはないミニファイという内部処理があり、その過程でフロントエンドが想定外のビルド結果になる
- `yarn dev` ではReactのHydrationで起こるエラーに寛容であり、`yarn build` では厳しいため、フロントエンドで問題がないように見える

#### ▼ `start`

本番環境のため、`yarn build` コマンドによるビルド完了後にNodeサーバーを起動する。

SSRモードのために使用する。

```bash
# リファレンスでは nuxt startとなっているが、yarn startで問題ない。
$ yarn start
```

> - https://ja.nuxtjs.org/docs/2.x/get-started/commands#target-server

補足として、`yarn start` コマンドを実行した場合、環境変数の `NODE_ENV` が `production` になる。

> - https://qiita.com/y-temp4/items/84bb16e2ccf8efaf82fc

<br>

### staticモード (SSGモード)

#### ▼ staticモードとは

アプリケーションをSSGとして稼働させる。

> - https://ja.nuxtjs.org/docs/2.x/get-started/commands#target-static

#### ▼ `dev`

開発環境でSSGアプリケーションを稼働させるために使用する。

Nodeサーバーを起動し、サーバー内でJavaScriptから静的ファイル (例：`html` ファイル、`css` ファイル、画像、動画、メールなど) を作成する。

そのため、SSGモードで作成されるアプリは完全な静的ファイルでない。

また、`build` コマンドとは異なり、Webpackは使用されないため、静的ファイルの圧縮や画像ファイル名のハッシュ化は実行されない。

```bash
# リファレンスでは nuxt devとなっているが、yarn devで問題ない。
$ yarn dev
```

> - https://nuxtjs.org/ja/docs/get-started/commands/#target-static

補足として、`yarn dev` コマンドを実行した場合、環境変数の `NODE_ENV` が `development` になる。

> - https://qiita.com/y-temp4/items/84bb16e2ccf8efaf82fc

#### ▼ `generate`

本番環境でSSGアプリケーションを稼働させるために使用する。

`yarn dev` コマンドとは異なり、Nodeサーバーは起動せず、そのままJavaScriptから静的ファイル (例：`html` ファイル、`css` ファイル、画像、動画、メールなど) を作成する。

そのため、SSGは完全な静的ファイルからなる。

ビルド時はバックエンドへ接続し、DBへ格納したデータ (例：画像パス) を元に静的ファイルをビルドできる。

SSGモードのために使用する。

```bash
# リファレンスでは nuxt generateとなっているが、yarn generateで問題ない。
$ yarn generate
```

> - https://nuxtjs.org/ja/docs/get-started/commands/#target-static

#### ▼ `start`

静的ホスティングサイトを起動する。

```bash
# リファレンスでは nuxt startとなっているが、yarn startで問題ない。
$ yarn start
```

補足として、`yarn start` コマンドを実行した場合、環境変数の `NODE_ENV` が `production` になる。

> - https://qiita.com/y-temp4/items/84bb16e2ccf8efaf82fc

<br>

### ビルド時のWebpackオプション

SSRモードとSSGモードで、`build` コマンド時に使用されるWebpackの最適化方法を指定できる。

`

> - https://ja.nuxtjs.org/docs/2.x/get-started/commands#webpack-%E3%81%AE%E8%A8%AD%E5%AE%9A%E3%82%92%E6%A4%9C%E6%9F%BB

<br>

### キャッシュ削除

Nuxt.jsのキャッシュは `node_modules/.cache` ディレクトリ配下に作成される。

そのため、キャッシュを削除したい場合はこのディレクトリごと削除する。

```bash
$ rm -rf node_modules/.cache/hard-source/
```

<br>

## 03. `nuxt.config.js` ファイル

### `nuxt.config.js` ファイルとは

Nuxtがデフォルトで用意している設定をプロパティの設定値で上書きできる。

各プロパティは以下のリンクを参考にせよ。

```javascript
import {Configuration} from "@nuxt/types";

const nuxtConfig: Configuration = {
    // プロパティ
};
```

> - https://ja.nuxtjs.org/docs/2.x/directory-structure/nuxt-config#nuxtconfigjs

<br>

### `process.env` への環境変数格納

#### ▼ `dotenv` パッケージの利用

あらかじめ、dotenvモジュールをインストールしておく。

`process.env` から `.env` ファイルの環境変数を参照する。

定数に代入する場合は、まとめて代入すると良い。

なお、依存パッケージが増えてしまうため、代替の方法があるならそちらのほうが良い。

```bash
$ npm install @nuxtjs/dotenv
```

```bash
# APIのURL。サーバー上のJavaScriptからAPIに対するリクエストで使用する。
API_URL=https://example.com/api
# APIのURL。ブラウザ上のJavaScriptからAPIに対するリクエストで使用する。
API_URL_BROWSER=https://example.com/api
# APIのOAuthの情報
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
# Google MapのURL
GOOGLE_MAP_QUERY_URL=https://www.google.com/maps/search/?api=1&query=
# ホームパス
HOME_PATH=/
```

```javascript
import {Configuration} from "@nuxt/types";

// envファイルから読み込んだ値を定数に格納する
const {
  API_URL,
  API_URL_BROWSER,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  HOME_PATH,
} = process.env;

console.log(API_URL);
```

> - https://levelup.gitconnected.com/what-are-env-files-and-how-to-use-them-in-nuxt-7f194f083e3d
> - https://zenn.dev/osachi/articles/5e765cf6540591#process.env%E3%81%AB%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E6%B8%A1%E3%81%992%E3%81%A4%E3%81%AE%E3%82%A2%E3%83%97%E3%83%AD%E3%83%BC%E3%83%81

#### ▼ 実行環境への出力

実行環境に環境変数を出力する。

```bash
# 仮想サーバー
$ export API_URL=https://example.com/api
```

```yaml
# コンテナ
services:
  nuxt:
    environment:
      API_URL: https://example.com/api
```

> - https://zenn.dev/osachi/articles/5e765cf6540591#process.env%E3%81%AB%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E6%B8%A1%E3%81%992%E3%81%A4%E3%81%AE%E3%82%A2%E3%83%97%E3%83%AD%E3%83%BC%E3%83%81

<br>

## 03-02. プロパティ

### build

#### ▼ hardSource

ビルド時のキャッシュを有効化するか否かを設定する。

ビルドの完了が早くなる。

```javascript
import {Configuration} from "@nuxt/types";

const nuxtConfig: Configuration = {
    build: {
        hardSource: "true",
    },
};
```

> - https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-build#hardsource

#### ▼ privateRuntimeConfig

クライアントサイドのみで参照できる環境変数を設定する。

すなわち、SSRモードのクライアント側のみが対応している。

環境変数は、`pages`、`store`、`components`、`plugin` ディレクトリで使用できる。

ブラウザのJavaScriptソースタブで公開されてしまうため、機密な変数は設定しないようにする。

もし `publicRuntimeConfig` で同じ名前の変数が設定されていた場合は、この値を上書きする。

環境変数は、`context` オブジェクトの `config` 変数から取得できる。

```javascript
import {Configuration} from "@nuxt/types";

const {API_KEY} = process.env;

const nuxtConfig: Configuration = {
    privateRuntimeConfig: {
        apiKey: API_KEY,
    },
};
```

```bash
# .envファイル

API_KEY=*****
```

```javascript
export function foo() {
  // contextオブジェクトの$configプロパティを分割代入
  const {$config} = useContext();

  $config.apiKey;
}
```

> - https://nuxtjs.org/docs/directory-structure/nuxt-config/#privateruntimeconfig
> - https://blog.mktia.com/dotenv-is-no-longer-need-in-nuxt/

#### ▼ publicRuntimeConfig

サーバーサイドとクライアントサイドの両方で参照できる環境変数を設定する。

すなわち、全モード (SSG/CSR/SSRモード) が対応している。

環境変数は、`pages`、`store`、`components`、`plugin` ディレクトリで使用できる。

環境変数は、`context` オブジェクトの `config` 変数から取得できる。

```javascript
import {Configuration} from "@nuxt/types";

const {API_URL} = process.env;

const nuxtConfig: Configuration = {
    publicRuntimeConfig: {
        apiUrl: API_URL,
    },
};
```

```bash
# .envファイル
API_URL=https://example.com/api
```

```javascript
export function foo() {
  // contextオブジェクトの$configプロパティを分割代入
  const {$config} = useContext();

  $config.apiUrl;
}
```

> - https://nuxtjs.org/docs/directory-structure/nuxt-config/#publicruntimeconfig
> - https://blog.mktia.com/dotenv-is-no-longer-need-in-nuxt/

#### ▼ quiet

ビルド時にログを最小限にする。

CIツールでログが確認できなくなるため、無効化しておいたほうが良い。

```javascript
import {Configuration} from "@nuxt/types";

const nuxtConfig: Configuration = {
    build: {
        quiet: "false",
    },
};
```

> - https://ja.nuxtjs.org/docs/2.x/configuration-glossary/configuration-build#quiet

#### ▼ serverMiddleware

リクエストを受信できるエンドポイントと、紐付けるハンドラー関数を設定する。

```javascript
import {Configuration} from "@nuxt/types";

const nuxtConfig: Configuration = {
    serverMiddleware: [
        {
            path: "/foo",
            handler: "~/foo/index.js",
        },
    ],
};
```

> - https://nuxtjs.org/docs/configuration-glossary/configuration-servermiddleware/

<br>

### buildModules

SSG/SSRモードの `yarn dev` (開発用コマンド) 、またSSRモードの `yarn build` の時のみ、`node_module` ディレクトリ内に作成するパッケージを設定する。

```javascript
import {Configuration} from "@nuxt/types";

const nuxtConfig: Configuration = {
    buildModules: ["@nuxt/typescript-build", "@nuxtjs/composition-api"],
};
```

> - https://www.reddit.com/r/Nuxt/comments/gnzgrp/nuxtconfig_modules_vs_build_modules/

<br>

## 04. ディレクトリ

### `dist` ディレクトリ：`distribution`

SSGモードの `generate` コマンドの実行時に、アーティファクトが配置される。

> - https://nuxtjs.org/ja/docs/directory-structure/dist

<br>

### `module` ディレクトリ

> - https://nuxtjs.org/docs/directory-structure/modules

<br>

### `plugin` ディレクトリ

> - https://nuxtjs.org/docs/directory-structure/plugins/
> - https://github.com/nuxt/nuxt.js/issues/2820

<br>
