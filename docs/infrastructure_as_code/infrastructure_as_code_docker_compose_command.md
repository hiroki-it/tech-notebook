---
title: 【IT技術の知見】コマンド＠Docker compose
description: コマンド＠Docker composeの知見を記録しています。
---

# コマンド＠Docker compose

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `docker compose`コマンド

### config

#### ▼ configとは

バリデーションとして、`docker-compose.yml`ファイルを展開する。ファイル内で、相対パスや変数を使用している場合、これらが正しく設定されているかを確認できる。

```bash
$ docker compose config
```

<br>

### build

#### ▼ buildとは

イメージをビルドする。

#### ▼ --no-cache

キャッシュを使用せずにコンテナイメージをビルドする。

```bash
$ docker compose build --no-cache
```

<br>

### up

#### ▼ upとは

指定したサービスのコンテナイメージのビルド、コンテナレイヤー作成、コンテナ作成、コンテナ起動を行う。

コンテナ作成までが完了していて停止中が存在する場合、これをコンテナを起動する。

また起動中コンテナがあれば、これを再起動する。

オプションにより起動モードが異なる。

#### ▼ オプション無し

指定したサービスのコンテナイメージのビルド、コンテナレイヤー作成、コンテナ作成、コンテナ起動を行う。

アタッチモードでコンテナを起動する。

```bash
# アタッチモード
$ docker compose up <サービス名>
```

#### ▼ -d

指定したサービスのコンテナイメージのビルド、コンテナレイヤー作成、コンテナ作成、コンテナ起動を行う。

デタッチドモードでコンテナを起動する。

```bash
# デタッチモード
$ docker compose up -d <サービス名>
```

#### ▼ --build

イメージをビルドし、コンテナを作成する。

```bash
$ docker compose up --build -d <サービス名>
```

#### ▼ -f

ファイルを指定して、docker-composeを実行する。

```bash
$ docker compose up -f foo-docker-compose.yml
```

<br>

### run

#### ▼ runとは

すでに停止中または起動中コンテナが存在していても、これとは別にコンテナを新しく作成し、起動する。加えてそのコンテナ内でコマンドを実行する。起動時に`bash`プロセスや`shell`プロセスを実行すると、コンテナに通信できる。何も渡さない場合は、デフォルトのプロセスとして`bash`プロセスが実行される。`docker-compose run`コマンドでは、アタッチモードとデタッチモードを選択できる。新しく起動したコンテナを停止後に自動削除する場合は、`rm`オプションを付けるようにする。`service-ports`オプションを使用しないと、ホストとコンテナ間のポートフォワーディングを有効化できないため注意する。

#### ▼ --service-ports

既存コンテナを残して、指定したサービスの新しいコンテナをアタッチモードで起動する。

また、ホストとコンテナ間のポートフォワーディングを有効化するか否かを設定する。

```bash
# アタッチモード
$ docker compose run --rm --service-ports <サービス名>
```

#### ▼ -d --service-ports

既存コンテナを残して、指定したサービスの新しいコンテナをデタッチドモードで起動する。

また、ホストとコンテナ間のポートフォワーディングを有効化するか否かを設定する。

```bash
# デタッチモード
$ docker compose run --rm -d --service-ports <サービス名>
```

<br>

### stop

#### ▼ stopとは

指定したサービスの起動中コンテナを全て停止する。

```bash
$ docker compose stop <サービス名>
```

<br>

### down

#### ▼ downとは

指定したリソースを削除する。

#### ▼ --rmi --volumes --remove-orphans

全てのリソース (イメージ、コンテナ、ボリューム、ネットワーク) を削除する。

```bash
$ docker compose down --rmi all --volumes --remove-orphans
```

<br>

### logs

#### ▼ logsとは

コンテナ内に入ることなく、起動プロセスから出力されるログを確認できる。

オプションごとに、ログの表示タイプが異なる。

#### ▼ オプション無し

バックグラウンドでログを取得する。

```bash
$ docker compose logs <サービス名>
```

#### ▼ -f

フォアグラウンドでログを取得する。

```bash
$ docker compose logs -f <サービス名>
```

<br>

## 02. compose-cli

### down

クラウドインフラストラクチャの削除をプロビジョニングする。

コンテキストがAWSの場合は、AWS ECSクラスターとその中身を削除する。

> ↪️ 参考：https://github.com/docker/compose-cli

<br>

### up

クラウドインフラストラクチャの作成をプロビジョニングする。

コンテキストがAWSの場合は、AWS ECSクラスターとその中身を作成する。

> ↪️ 参考：https://github.com/docker/compose-cli

<br>
