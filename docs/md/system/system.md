# システム

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. システム

### システムとは

ソフトウェア（OS、ミドルウェア、アプリケーション）とハードウェアのこと。

参考：https://thinkit.co.jp/article/11526

![software](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/software.png)

<br>

## 02. Webシステム

### Webシステムとは

システムのうちで、特にWeb技術に関するもののこと。ハードウェアとしてのWebサーバー/Appサーバー/DBサーバーと、Webに関するソフトウェアからなる。近年は、仮想サーバーまたはコンテナを用いてWebシステムのハードウェア部分を構築することが多いため、Web/App/DBサーバーではなく、仮想Web/App/DB環境と呼ぶ方が適切かもしれない。

![web-server_app-server_db-server](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/web-server_app-server_db-server.png)

<br>

### Webサーバー

#### ・Webサーバーとは

プロキシのミドルウェア（Apache、Nginxなど）を稼働させるためのサーバーのこと。また、Web兼Appサーバーのミドルウェアとして機能する（NGINX Unit）がインストールされていることもある。

#### ・機能

![NginxとPHP-FPMの組み合わせ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/NginxとPHP-FPMの組み合わせ.png)

|                                | Webサーバー |  →   | Appサーバー |  →   | DBサーバー |
| ------------------------------ | :---------: | :--: | :---------: | :--: | :--------: |
| 静的コンテンツ                 |  静的レス   |      |     ー      |      |     ー     |
| 静的コンテンツ＋動的コンテンツ |  静的レス   |      |  動的レス   |      | データ管理 |

ブラウザから静的コンテンツのみのリクエストがあった場合、静的コンテンツをレスポンスする。また、静的コンテンツと動的コンテンツの両方のリクエストがあった場合、Appサーバーに動的コンテンツのリクエストを行う。Appサーバーからレスポンスを受け取り、ブラウザにレスポンスを行う。

<br>

### Appサーバー

#### ・Appサーバーとは

Webアプリケーションのミドルウェア（PHPならPHP-FPM、JavaならTomcat）を稼働させるためのサーバーのこと。

#### ・機能

|                                | Webサーバー |  →   | Appサーバー |  →   | DBサーバー |
| ------------------------------ | :---------: | :--: | :---------: | :--: | :--------: |
| 静的コンテンツ                 |  静的レス   |      |     ー      |      |     ー     |
| 静的コンテンツ＋動的コンテンツ |  静的レス   |      |  動的レス   |      | データ管理 |


Webサーバーから動的コンテンツのリクエストがあった場合、プログラミング言語を言語プロセッサで翻訳し、DBサーバーにリクエストを行う。DBサーバーからのレスポンスを受け取り、Webサーバーに動的なコンテンツのレスポンスを行う。

<br>

### DBサーバー

#### ・DBサーバーとは

DB管理システムを稼働させるためのサーバーのこと。

<br>
