# Nuxt.js

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. コマンド

### serverモード（SSRモード）

#### ・serverモードとは

アプリケーションをSSRとして稼働させる．

参考：https://ja.nuxtjs.org/docs/2.x/get-started/commands#target-server

#### ・```dev```

ローカル環境として用いるため，アプリケーションをビルドし，Nodeサーバーを起動する．Webpackは使用されないため，静的ファイルの圧縮や画像ファイル名のハッシュ化は実行されない．

```bash
$ nuxt dev
```

#### ・```build```

本番環境として用いるため，Nodeサーバーの起動前にアプリケーションのビルドを実行する．```dev```コマンドとは異なり，ビルド時にWebpackによる最適化が実行される．これにより，JavaScriptとCSSはminifyされる．minifyにより，不要な改行やインデントが削除され，パッケージの読み込みURLはまとめられ，圧縮される．画像名はハッシュ化される．

```bash
$ nuxt build
```

#### ・```start```

本番環境として用いるため，ビルド完了後にNodeサーバーを起動する．SSRモードのために用いる．

```bash
$ nuxt start
```

<br>

### staticモード（SSGモード）

#### ・staticモードとは

アプリケーションをSSGとして稼働させる．

参考：https://ja.nuxtjs.org/docs/2.x/get-started/commands#target-static

#### ・```dev```

ローカル環境でSSGを稼働させるために用いる．Nodeサーバーを起動し，サーバー内でJavaScriptから静的ファイルを生成する．そのため，SSGは完全な静的ファイルでない．また，```build```コマンドとは異なり，Webpackは使用されないため，静的ファイルの圧縮や画像ファイル名のハッシュ化は実行されない．

```bash
$ nuxt dev
```

#### ・```build```

Node.jsを用いてテストフレームワークを動かすために用いる．```dev```コマンドとは異なり，ビルド時にWebpackによる最適化が実行される．これにより，JavaScriptとCSSはminifyされる．minifyにより，不要な改行やインデントが削除され，パッケージの読み込みURLはまとめられ，圧縮される．画像名はハッシュ化される．

```bash
$ nuxt build
```

#### ・```generate```

本番環境でSSGを稼働させるために用いる．```dev```コマンドとは異なり，Nodeサーバーは起動せず，そのままJavaScriptから静的ファイルを生成する．そのため，SSGは完全な静的ファイルからなる．ビルド時にバックエンドに接続し，データベースに格納したデータ（例：画像ファイルパス）を元に，静的ファイルをビルドすることも可能である．SSGモードのために用いる．

```bash
$ nuxt generate
```

#### ・```start```

静的ホスティングサイトを起動する．

```bash
$ nuxt start
```

<br>

### ビルド時のWebpackオプション

SSRモードとSSGモードで，```build```コマンド時に用いられるWebpackの最適化方法を指定できる．`

https://ja.nuxtjs.org/docs/2.x/get-started/commands#webpack-%E3%81%AE%E8%A8%AD%E5%AE%9A%E3%82%92%E6%A4%9C%E6%9F%BB

<br>

## 02. プロパティ

### ```nuxt.config.js```ファイル

#### ・```nuxt.config.js```ファイルとは

Nuxtがデフォルトで用意している設定をプロパティの設定値で上書きできる．各プロパティは以下のリンク先を参考にせよ．

参考：https://ja.nuxtjs.org/docs/2.x/directory-structure/nuxt-config#nuxtconfigjs

```javascript
import { Configuration } from '@nuxt/types'

const nuxtConfig: Configuration = {
  // プロパティ
}
```

#### ・```.env```ファイルの読み込み

あらかじめ，dotenvモジュールをインストールする．```process.env```から```.env```ファイルの変数を参照する．定数に代入する場合は，まとめて代入するとよい．

参考：https://levelup.gitconnected.com/what-are-env-files-and-how-to-use-them-in-nuxt-7f194f083e3d

```bash
$ npm install @nuxtjs/dotenv
```

```bash
# APIのURL．サーバー上のJavaScriptからAPIへのリクエストで用いる．
API_URL=https://example.com/api
# APIのURL．ブラウザ上のJavaScriptからAPIへのリクエストで用いる．
API_URL_BROWSER=https://example.com/api
# APIのOauth認証の情報
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
# GoogleMapのURL
GOOGLE_MAP_QUERY_URL=https://www.google.com/maps/search/?api=1&query=
# ホームパス
HOME_PATH=/
```

```javascript
import { Configuration } from '@nuxt/types'

const {
    API_URL,
    API_URL_BROWSER,
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    HOME_PATH
} = process.env

const nuxtConfig: Configuration = {
  // プロパティ
}
```

<br>

### プロパティ一覧

#### ・```hardSource```

ビルド時のキャッシュを有効化する．ビルドの完了が早くなる．

参考：https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-build#hardsource

```javascript
import { Configuration } from '@nuxt/types'

const nuxtConfig: Configuration = {
    
  build: {
    hardSource: true,
  },
}
```

####  ・```privateRuntimeConfig```

クライアントサイドのみで参照できる環境変数を定義する．すなわち，SSRモードのクライアント側のみが対応している．環境変数は，```pages```，```store```，```components```，```plugin```ディレクトリで使用できる．ブラウザのJavaScriptソースタブで公開されてしまうため，機密な値は設定しないようにする．もし```publicRuntimeConfig```で同じ名前の変数が設定されていた場合は，この値を上書きする．環境変数は，```context```オブジェクトの```config```変数から取得できる．

参考：

- https://nuxtjs.org/docs/directory-structure/nuxt-config/#privateruntimeconfig
- https://blog.mktia.com/dotenv-is-no-longer-need-in-nuxt/

```javascript
import { Configuration } from '@nuxt/types'

const {
    API_KEY,
} = process.env

const nuxtConfig: Configuration = {
    
  privateRuntimeConfig: {
    apiKey: API_KEY,
  },
}
```

```bash
# .envファイル
API_KEY=*****
```

```javascript
export function foo() {
  // contextオブジェクトの$configプロパティを分割代入
  const { $config } = useContext()
  
  $config.apiKey
}

```

#### ・```publicRuntimeConfig```

サーバーサイドとクライアントサイドの両方で参照できる環境変数を定義する．すなわち，全モード（SSG/SPA/SSRモード）が対応している．環境変数は，```pages```，```store```，```components```，```plugin```ディレクトリで使用できる．環境変数は，```context```オブジェクトの```config```変数から取得できる．

参考：

- https://nuxtjs.org/docs/directory-structure/nuxt-config/#publicruntimeconfig
- https://blog.mktia.com/dotenv-is-no-longer-need-in-nuxt/

```javascript
import { Configuration } from '@nuxt/types'

const {
  API_URL,
} = process.env

const nuxtConfig: Configuration = {

  publicRuntimeConfig: {
    apiUrl: API_URL
  },
}
```

```bash
# .envファイル
API_URL=https://example.com/api
```

```javascript
export function foo() {
  // contextオブジェクトの$configプロパティを分割代入
  const { $config } = useContext()
  
  $config.apiUrl
}

```

#### ・```quiet```

ビルド時にログを最小限にする．CI/CDツールでログが確認できなくなるため，無効化しておいた方が良い．

参考：https://ja.nuxtjs.org/docs/2.x/configuration-glossary/configuration-build#quiet

```javascript
import { Configuration } from '@nuxt/types'

const nuxtConfig: Configuration = {
    
  build: {
      quiet: false,
  },
}
```

#### ・```serverMiddleware```

リクエストを受信できるエンドポイントと，紐付けるハンドラー関数を定義する．

参考：https://nuxtjs.org/docs/configuration-glossary/configuration-servermiddleware/

```javascript
import { Configuration } from '@nuxt/types'

const nuxtConfig: Configuration = {

  serverMiddleware: [
    {
      path: '/foos',
      handler: '~/foos/index.js'
    },
  ]
}
```

<br>

## 03. ディレクトリ

### ```dist：distribution```

SSGモードの```generate```コマンドの実行時に，アーティファクトが配置される．

参考：https://nuxtjs.org/ja/docs/directory-structure/dist

<br>

### ```module```

参考：https://nuxtjs.org/docs/directory-structure/modules

<br>

### ```plugin```

参考：

- https://nuxtjs.org/docs/directory-structure/plugins/
- https://github.com/nuxt/nuxt.js/issues/2820



<br>

