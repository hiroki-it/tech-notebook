---
title: 【IT技術の知見】Dockerfile＠Docker
description: Dockerfile＠Dockerの知見を記録しています。
---

# Dockerfile＠Docker

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ aptリポジトリから

Dockerエンジン、CLI、インストールする。

```bash
$ apt-get install -y \
    docker-ce \
    docker-ce-cli
```

> - https://docs.docker.com/engine/install/ubuntu/#install-docker-engine

`docker`プロセスをデーモンとして起動する。

```bash
$ systemctl start docker
```

> - https://docs.docker.com/config/daemon/systemd/#start-the-docker-daemon

<br>

### イメージのデバッグ

**＊例＊**

ビルドに失敗したコンテナイメージからコンテナを作成し、接続する。

`rm`オプションを設定し、接続の切断後にコンテナを削除する。

Dockerfileで、コンテナイメージのプロセスの起動コマンドを`ENTRYPOINT`で設定している場合は、後から上書きできなくなる。

そのため、`docker run`コマンドの引数として新しいコマンドを渡せずに、デバッグできないことがある。

```bash
$ docker run --rm -it <ビルドに失敗したコンテナイメージID> /bin/bash
```

その他、プルしたコンテナイメージ内でちょっとしたコマンドを検証したいといった場合にも役立つ。

```bash
$ docker run --rm -it <検証したいコンテナイメージID> ls
```

<br>

## 02. ADD

### ADDとは

ホスト側のファイルを、コンテナの指定ディレクトリ配下にコピーし、このファイルが`tar`ファイルの場合は解凍する。

また、URLを直接的に指定して、ダウンロードから解凍までを実行もできる。

> - https://docs.docker.com/engine/reference/builder/#add

<br>

### COPYとの違い

似た命令として`COPY`処理がある。

`ADD`処理は`COPY`処理とは異なり、インターネットからファイルをダウンロードして解凍した上で、コピーする。

解凍によって意図しないファイルがDockerfileに組み込まれる可能性があるため、`COPY`処理が推奨である。

**＊実装例＊**

以下では`ADD`処理を使用している。

URLを直接的に指定し、ダウンロードから解答までを実行している。

```dockerfile
ADD http://example.com/big.tar.xz /usr/src/things/
RUN tar -xJf /usr/src/things/big.tar.xz -C /usr/src/things
RUN make -C /usr/src/things all
```

これは、次のように書き換えるべきである。

```dockerfile
RUN mkdir -p /usr/src/things \
  && curl -SL http://example.com/big.tar.xz | tar -xJC /usr/src/things \
  && make -C /usr/src/things all
```

> - https://qiita.com/zembutsu/items/a96b68277d699f79418d
> - https://www.slideshare.net/zembutsu/explaining-best-practices-for-writing-dockerfiles/44

<br>

## 03. ARG

### ARGとは

Dockerfikeの命令で扱える変数を定義する。

<br>

### ENVとの違い

似た命令として`ENV`がある。

`ARG`は`ENV`とは異なり、OS上のコマンド処理に展開するための変数として定義できない。

```dockerfile
# ARGは、OS上のコマンド処理に展開するための変数として定義できない。
ARG PYTHON_VERSION="3.8.0"
# 変数を展開できない
RUN pyenv install ${PYTHON_VERSION}

# ENVは、OS上のコマンド処理に展開するための変数として定義できる。
ARG PYTHON_VERSION="3.8.0"
RUN pyenv install ${PYTHON_VERSION}
```

一方で、Dockerfikeの命令に展開するための変数として定義できる。

```dockerfile
# ARGは、Dockerfikeの命令に展開するための変数として定義できる。
ARG OS_VERSION="8"
FROM centos:${OS_VERSION}

# ENVは、Dockerfikeの命令に展開するため変数として定義できない。
ENV OS_VERSION "8"
# 変数を展開できない
FROM centos:${OS_VERSION}
```

そのため、以下の様に使い分けることになる。

```dockerfile
# 最初に全て、ARGで定義
ARG CENTOS_VERSION="8"
ARG PYTHON_VERSION="3.8.0"

# 変数展開できる
FROM centos:${CENTOS_VERSION}

# ARGを事前に宣言
ARG PYTHON_VERSION
# 必要に応じて、事前にENVに詰め替える。
ENV PYTHON_VERSION ${PYTHON_VERSION}

# 変数展開できる
RUN pyenv install ${PYTHON_VERSION}
```

<br>

## 04. CMD

### CMDとは

イメージのプロセスの起動コマンドを実行する。

パラメーターの記述形式には、文字列形式、`.json`形式がある。

> - https://docs.docker.com/engine/reference/builder/#cmd

<br>

### 注意点

Dockerfileで`CMD`を指定しない場合、コンテナイメージのデフォルトのバイナリファイルが割り当てられる。

一旦、デフォルトのバイナリファイルを確認した後に、これをDockerfileに明示的に実装する。

```bash
CONTAINER ID   IMAGE   COMMAND     CREATED          STATUS         PORTS                    NAMES
2b2d3dfafee8   *****   "/bin/sh"   11 seconds ago   Up 8 seconds   0.0.0.0:8000->8000/tcp   foo-image
```

静的型付け言語ではプロセスの起動時に、代わりにアーティファクトのバイナリファイルを実行しても良い。

その場合、`bin`ディレクトリにバイナリファイルとしてのアーティファクトを配置することになる。

しかし、`bin`ディレクトリへの認可スコープがないことがあるため、その場合は、1つ下にディレクトリを作成し、そこにバイナリファイルを配置するようにする。

```bash
# /go/bin にアクセスできない時は、/go/bin/cmdにアーティファクトを配置する。
ERROR: for xxx-container  Cannot start service go: OCI runtime create failed: container_linux.go:367: starting container process caused: exec: "/go/bin": permission denied: unknown

```

<br>

## 05. COPY

### COPYとは

ホスト側 (第一引数) のディレクトリ/ファイルをコンテナ側 (第二引数) にコピーする。

コンテナ側のパスは、`WORKDIR`をルートとした相対パスで定義できるが、絶対パスで指定した方がわかりやすい。

ディレクトリ内の複数ファイルを丸ごとコンテナ内にコピーする場合は、『`/`』で終える必要がある。

イメージのビルド時にコピーされるのみで、ビルド後のコードの変更は反映されない。

設定ファイル (例：`nginx.conf`ファイル、`php.ini`ファイル) をホストからコンテナにコピーしたい時によく使用する。

> - https://docs.docker.com/engine/reference/builder/#copy

<br>

## 06. ENTRYPOINT

### ENTRYPOINTとは

イメージのプロセスの起動コマンドを実行する。

> - https://docs.docker.com/engine/reference/builder/#entrypoint

<br>

### CMDとの違い

似た命令として`CMD`がある。

`CMD`とは異なり、後から上書き実行できない。

使用者に、コンテナの起動方法を強制させたい場合に適する。

イメージのプロセスの起動コマンドを後から上書きできなくなるため、`docker run`コマンドの引数として新しいコマンドを渡せずに、デバッグできないことがある。

```bash
# 上書きできず、失敗してしまう。
$ docker run --rm -it <コンテナイメージ名>:<バージョンタグ> /bin/bash
```

<br>

## 07. ENV

### ENVとは

OS上のコマンド処理で展開できる変数を定義できる。

> - https://docs.docker.com/engine/reference/builder/#env

<br>

## 08. EXPOSE

### EXPOSEとは

他のコンテナに対してコンテナポートを開放する。

また、コンテナイメージの利用者にとってのドキュメンテーション機能もあり、ポートマッピングを実行する時に使用できるコンテナポートとして保証する機能もある。

ホスト側からはアクセスできないことに注意する。

> - https://docs.docker.com/engine/reference/builder/#expose
> - https://www.whitesourcesoftware.com/free-developer-tools/blog/docker-expose-port/

<br>

### プロセスによるポート受信

コンテナのポートを開放するのみでは不十分である。

プロセス自体がインバウンド通信を受信できるようにポートを設定する必要がある。

ただし、多くの場合デフォルトでこれが設定されている。

例えば、PHP-FPMでは、`/usr/local/etc/www.conf.default`ファイルと`/usr/local/etc/php-fpm.d/www.conf`ファイルには、`listen`オプションの値に`127.0.0.1:9000`が割り当てられている。

<br>

## 09. FROM

### FROMとは

ベースのコンテナイメージを、コンテナにインストールする。

> - https://docs.docker.com/engine/reference/builder/#from

```dockerfile
FROM python:latest-slim
```

<br>

### イメージレジストリの指定

指定できるイメージレジストリの例と記法は以下の通りである。

#### ▼ DockerHub

PHP-FPMをインストールする場合は、`php:8.0-fpm`である。

> - https://hub.docker.com/_/php

#### ▼ クラウドプロバイダー (パブリック)

パブリックなAWS ECR、GCP GCR、GCP Artifact Registry、RedHat Quay、からイメージをプルする。

ECRパブリックギャラリーからPHP-FPMをインストールする場合は、`public.ecr.aws/bitnami/php-fpm:latest`である。

> - https://gallery.ecr.aws/bitnami/php-fpm

#### ▼ クラウドプロバイダー (プライベート)

プライベートなAWS ECR、GCP GCR、GCP Artifact Registry、RedHat Quay、からイメージをプルする。

ECRプライベートレジストリからPHP-FPMをインストールする場合は、`<AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/private-foo-php-repository:latest`である。

> - https://ap-northeast-1.console.aws.amazon.com/ecr/repositories?region=ap-northeast-1

<br>

### バージョンの指定

### タグ

```dockerfile
FROM python:latest
```

<br>

### ダイジェスト値

ダイジェスト値 (イメージの識別子) を指定する／

```dockerfile
FROM python@sha256:*****
```

> - https://hackernoon.com/docker-images-name-vs-tag-vs-digest

<br>

### レートリミット

#### ▼ DockerHub

DockerHubのレートリミットは、匿名アカウントであれば`100`プル/`6`時間、無料アカウントであれば`200`プル/`6`時間、である。

CIパイプライン上でコンテナイメージをビルドしていると、これにひっかかりやすい。

クラウドプロバイダーのレートリミットの方が寛容なため、クラウドプロバイダー (パブリック/プライベート) からプルする方法もよい。

> - https://www.docker.com/increase-rate-limits/

<br>

### CPUアーキテクチャの指定

イメージの対応するCPUアーキテクチャ (例：Intel、AMD、ARM) を設定する。

ただし、DockerがホストのOSを認識して、自動的に選んでくれるため、ユーザーが設定する必要はない。

```dockerfile
FROM --platform=linux/amd64 python:latest-slim
```

> - https://stackoverflow.com/questions/60251383/dockerfile-from-platform-option

<br>

## 10. RUN

### RUNとは

ベースイメージ上に、ソフトウェアをインストールする。

> - https://docs.docker.com/engine/reference/builder/#run

<br>

## 11. VOLUME

### VOLUMEとは

ボリュームマウントを行う。

> - https://docs.docker.com/engine/reference/builder/#volume
> - https://qiita.com/namutaka/items/f6a574f75f0997a1bb1d

<br>

## 12. WORKDIR

### WORKDIRとは

ビルド中の各命令の作業ディレクトリを絶対パスで指定する。

また、コンテナ接続時の最初のディレクトリも定義できる。

> - https://docs.docker.com/engine/reference/builder/#workdir

<br>
