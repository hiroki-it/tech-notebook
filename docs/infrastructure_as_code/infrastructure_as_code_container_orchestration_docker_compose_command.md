---
title: 【知見を記録するサイト】docker-composeコマンド@Docker compose
description: docker-composeコマンド@Docker composeの知見をまとめました。
---

# docker-composeコマンド@Docker compose

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. コマンド

### config

#### ・configとは

バリデーションとして，```docker-compose.yml```ファイルを展開する．ファイル内で，相対パスや変数を用いている場合，これらが正しく設定されているかを確認できる．

#### ・オプション無し

```bash
$ docker-compose config
```

<br>

### build

#### ・buildとは

イメージをビルドする．

#### ・--no-cache

キャッシュを使用せずにイメージをビルドする．

```bash
$ docker-compose build --no-cache
```

<br>

### up 

#### ・upとは

指定したサービスのイメージのビルド，コンテナレイヤー生成，コンテナ構築，コンテナ起動を行う．コンテナ構築までが完了していて停止中が存在する場合，これをコンテナを起動する．また起動中コンテナがあれば，これを再起動する．オプションにより起動モードが異なる．

#### ・オプション無し

指定したサービスのイメージのビルド，コンテナレイヤー生成，コンテナ構築，コンテナ起動を行う．アタッチモードでコンテナを起動する．

```bash
# アタッチモード
$ docker-compose up <サービス名>
```

#### ・-d

指定したサービスのイメージのビルド，コンテナレイヤー生成，コンテナ構築，コンテナ起動を行う．デタッチドモードでコンテナを起動する．

```bash
# デタッチモード
$ docker-compose up -d <サービス名>
```

#### ・--build

イメージをビルドし，コンテナを構築する．

```bash
$ docker-compose up --build -d <サービス名>
```

#### ・-f

ファイルを指定して，docker-composeを実行する．

```bash
$ docker-compose up -f foo-docker-compose.yml
```

<br>

### run

#### ・runとは

すでに停止中または起動中コンテナが存在していても，これとは別にコンテナを新しく構築し，起動する．さらにそのコンテナ内でコマンドを実行する．起動時に```bash```プロセスや```bash```プロセスを実行すると，コンテナに接続できる．何も渡さない場合は，デフォルトのプロセスとして```bash```プロセスが実行される．```run```コマンドでは，アタッチモードとデタッチモードを選択することができる．新しく起動したコンテナを停止後に自動削除する場合は，```rm```オプションを付けるようにする．```service-ports```オプションを用いないと，ホストとコンテナ間のポートフォワーディングを有効化できないため注意する．

#### ・--service-ports

既存コンテナを残して，指定したサービスの新しいコンテナをアタッチモードで起動する．また，ホストとコンテナ間のポートフォワーディングを有効化する．

```bash
# アタッチモード
$ docker-compose run --rm --service-ports <サービス名>
```

#### ・-d --service-ports

既存コンテナを残して，指定したサービスの新しいコンテナをデタッチドモードで起動する．また，ホストとコンテナ間のポートフォワーディングを有効化する．

```bash
# デタッチモード
$ docker-compose run --rm -d --service-ports <サービス名>
```

<br>

### stop

#### ・stopとは

指定したサービスの起動中コンテナを全て停止する．

#### ・オプション無し

```bash
$ docker-compose stop <サービス名>
```

<br>

### down

#### ・downとは

指定したリソースを削除する．

#### ・--rmi --volumes --remove-orphans

全てのリソース（イメージ，コンテナ，ボリューム，ネットワーク）を削除する．

```bash
$ docker-compose down --rmi all --volumes --remove-orphans
```

<br>

### logs

#### ・logsとは

コンテナ内に入ることなく，起動プロセスから出力されるログを確認することできる．

#### ・オプション無し

バックグラウンドでログを表示する．

```bash
$ docker-compose logs <サービス名>
```

#### ・-f

フォアグラウンドでログを表示する．

```bash
$ docker-compose logs -f <サービス名>
```

<br>

