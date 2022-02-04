---
title: 【知見を記録するサイト】デバッグの豆知識＠PHP
---

# デバッグの豆知識＠PHP

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. デバッグのTips

### ```var_dump```メソッドでデータの中身を確認

#### ・ 基本形

ブラウザの『デベロッパーツール＞Network＞出力先ページのPreviewタブまたはResponseタブ』で確認できる．

**＊実装例＊**

```php
<?php
  
var_dump($var);
```

#### ・例外処理との組み合わせ

ブラウザのデベロッパーツール＞Network＞出力先ページのPreviewタブで例外エラー画面が表示される．エラー画面の上部で，```var_dump($var)```の結果を確認できる．

**＊実装例＊**

```php
<?php

throw new \Exception(var_dump($var));
```

<br>

### ```var_dump```メソッドの結果が表示されない

#### ・処理の通過地点の特定

処理が```var_dump```メソッドを通過していないことが原因．任意の場所に```var_dump("文字列")```を記述し，どこに記述した時に文字列が出力されるかを確認する．

**＊実装例＊**

```php
<?php

if ($foo = 1){
  return 1;
}

if ($foo = 2){
  var_dump("文字列"); // echo "文字列" でも良い．
  return 2;
}

if ($foo = 3){
  return 3;
}
```

<br>

### ```500```ステータスの位置を特定できない

#### ・エラー箇所の特定

任意の場所に```exit```メソッドを記述し，どこに記述した時に，```500```ステータスが起こらずに処理が終了する（レスポンス無し）かを確認する．

**＊実装例＊**

```php
<?php

if ($foo = 1){
  return 1;
}

if ($foo = 2){
  exit(); // エラー箇所前でexit()をすると500エラーは起こらない
  return 2;
}

if ($foo = 3){
  return 3; // ここでエラーが起こっているとする
}
```

#### ・文字コードの修正

文字コードが異なっていることが原因．以下を，```var_dump```メソッドよりも上流に追加する．

```PHP
<?php
header("Content-Type: text/html; charset=UTF-8");
```

<br>

## 02. Xdebugによるデバッグ

### セットアップ

#### 1. ローカル仮想環境へのインストール

ローカル仮想環境で以下のコマンドを実行．

```bash
$ sudo pecl install xdebug-2.2.7
```

#### 2. Xdebugの設定

Xdebugのあるローカル仮想環境から見て，PhpStromビルトイン仮想環境を接続先と見なす．

```ini
zend_extension=/usr/lib64/php/modules/xdebug.so

xdebug.default_enable=1
# リモートデバッグの有効化．
xdebug.remote_enable=1

# DBGプロトコル
xdebug.remote_handler=dbgp

# エディタ仮想環境のプライベートIPアドレス．
xdebug.remote_host=10.0.2.2

# エディタ仮想環境で開放するポート番号．
xdebug.remote_port=9001

# 常にデバッグセッションを実行．
xdebug.remote_autostart=1

# DBGpハンドラーに渡すIDEキーを設定．
xdebug.idekey=PhpStorm
```

#### 3. ローカル仮想環境を再起動

```bash
$ sudo service httpd restart
```

#### 4. PhpStormビルトインの設定

<br>

### デバッグにおける通信の仕組み

#### 1. エディタ仮想環境の構築

エディタは仮想サーバーを構築し，```9000```番ポートを開放する．

#### 2. エディタからデバッガーエンジンへのリクエスト

デバッガーエンジン（Xdebug）は```80```番ポートを開放する．エディタ仮想環境はこれに対して，セッション開始のリクエストをHTTPプロトコルで送信する．

#### 3. デバッガーエンジンから仮想環境へのリクエスト

デバッガーエンジン（Xdebug）はセッションを開始し，エディタ仮想環境の```9000```番ポートに対して，レスポンスを送信する．

#### 4. Breakpointの設定

エディタ仮想環境は，デバッガーエンジンに対して，Breakpointを設定するリクエストを送信する．

#### 5. DBGプロトコル：Debuggerプロトコルによる相互通信の確立

DBGプロトコルを使用し，エディタ仮想環境とデバッガーエンジンの間の相互通信を確立する．

#### 6. 相互通信の実行

エディタは，デバッガーエンジンに対してソースコードを送信する．デバッガーエンジンは，Breakpointまでの各変数の中身を解析し，エディタ仮想環境に返信する．

![Xdebug仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Xdebug仕組み.png)

