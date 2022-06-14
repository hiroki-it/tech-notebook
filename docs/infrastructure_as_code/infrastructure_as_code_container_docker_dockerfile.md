---
title: 【知見を記録するサイト】Dockerfile＠Docker
description: Dockerfile＠Dockerの知見をまとめました。
---

# Dockerfile＠Docker

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Dockerfile＠Dockerとは

Dockerを宣言的に定義し、コンテナのプロビジョニングを行う。プロビジョニングされるコンテナについては、以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/virtualization/virtualization_container_docker.html

<br>

### メリット

Dockerfileを使用することにより、イメージの作成からコンテナの構築までを自動化できる。Dockerfileを使用しない場合、各イメージレイヤーのインストールを手動で行わなければならない。

![Dockerfileのメリット](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Dockerfileのメリット.png)<br>

### イメージのデバッグ

**＊例＊**

ビルドに失敗したイメージからコンテナを構築し、接続する。```rm```オプションを設定し、接続の切断後にコンテナを削除する。Dockerfileで、イメージのプロセスの起動コマンドを```ENTRYPOINT```で設定している場合は、後から上書きできなくなるため、```run```コマンドの引数として新しいコマンドを渡せずに、デバッグできないことがある。

```bash
$ docker run --rm -it <ビルドに失敗したイメージID> /bin/bash
```

<br>

## 02. 命令

### ADD

#### ▼ ADDとは

ホスト側のファイルを、コンテナの指定ディレクトリ配下にコピーし、このファイルが```tar```ファイルの場合は解凍する。また、URLを直接的に指定して、ダウンロードから解凍までを実行もできる。

参考：https://docs.docker.com/engine/reference/builder/#add

#### ▼ COPYとの違い

似た命令として```COPY```がある。```ADD```は```COPY```とは異なり、インターネットからファイルをダウンロードし、解凍も行う。イメージのビルド時にコピーされるだけで、ビルド後のコードの変更は反映されない。解凍によって意図しないファイルがDockerfileに組み込まれる可能性があるため、```COPY```が推奨である。

参考：

- https://qiita.com/zembutsu/items/a96b68277d699f79418d
- https://www.slideshare.net/zembutsu/explaining-best-practices-for-writing-dockerfiles

**＊実装例＊**

以下では```ADD```を使用している。URLを直接的に指定し、ダウンロードから解答までを実行している。

```dockerfile
ADD http://example.com/big.tar.xz /usr/src/things/
RUN tar -xJf /usr/src/things/big.tar.xz -C /usr/src/things
RUN make -C /usr/src/things all
```

これは、次のように書き換えるべきである。

```dockerfile
RUN mkdir -p /usr/src/things \
    && curl -SL http://example.com/big.tar.xz \
    | tar -xJC /usr/src/things \
    && make -C /usr/src/things all
```

<br>

### ARG

#### ▼ ARGとは

Dockerfikeの命令で扱える変数を定義する。

#### ▼ ENVとの違い

似た命令として```ENV```がある。```ARG```は```ENV```とは異なり、OS上のコマンド処理に展開するための変数として定義できない。

```dockerfile
# ARGは、OS上のコマンド処理に展開するための変数として定義できない。
ARG PYTHON_VERSION="3.8.0"
RUN pyenv install ${PYTHON_VERSION} # 変数を展開できない

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
FROM centos:${OS_VERSION} # 変数を展開できない
```

そのため、以下の様に使い分けることになる。

```dockerfile
# 最初に全て、ARGで定義
ARG CENTOS_VERSION="8"
ARG PYTHON_VERSION="3.8.0"

# 変数展開できる
FROM centos:${OS_VERSION}

# ARGを事前に宣言
ARG PYTHON_VERSION
# 必要に応じて、事前にENVに詰め替える。
ENV PYTHON_VERSION ${PYTHON_VERSION}

# 変数展開できる
RUN pyenv install ${PYTHON_VERSION}
```

<br>

### CMD

#### ▼ CMDとは

イメージのプロセスの起動コマンドを実行する。パラメータの記述形式には、文字列形式、JSON形式がある。

参考：https://docs.docker.com/engine/reference/builder/#cmd

#### ▼ 注意点

Dockerfileで```CMD```を指定しない場合、イメージのデフォルトのバイナリファイルが割り当てられる。一旦、デフォルトのバイナリファイルを確認した後に、これをDockerfileに明示的に実装する。

```bash
CONTAINER ID   IMAGE   COMMAND     CREATED          STATUS         PORTS                    NAMES
2b2d3dfafee8   *****   "/bin/sh"   11 seconds ago   Up 8 seconds   0.0.0.0:8000->8000/tcp   foo-image
```

静的型付け言語ではプロセスの起動時に、代わりにアーティファクトのバイナリファイルを実行しても良い。その場合、```bin```ディレクトリにバイナリファイルとしてのアーティファクトを配置することになる。しかし、```bin```ディレクトリへのアクセス権限がないことがあるため、その場合は、1つ下にディレクトリを作成し、そこにバイナリファイルを配置するようにする。

```bash
# /go/bin にアクセスできない時は、/go/bin/cmdにアーティファクトを配置する。
ERROR: for xxx-container  Cannot start service go: OCI runtime create failed: container_linux.go:367: starting container process caused: exec: "/go/bin": permission denied: unknown

```

<br>

### COPY

#### ▼ COPYとは

ホスト側（第一引数）のディレクトリ/ファイルをコンテナ側（第二引数）にコピーする。コンテナ側のパスは、```WORKDIR```をルートとした相対パスで定義できるが、絶対パスで指定した方がわかりやすい。ディレクトリ内の複数ファイルを丸ごとコンテナ内にコピーする場合は、『```/```』で終える必要がある。イメージのビルド時にコピーされるだけで、ビルド後のコードの変更は反映されない。```nginx.conf```ファイル、```php.ini```ファイル、などの設定ファイルをホストからコンテナにコピーしたい時によく使用する。

参考：https://docs.docker.com/engine/reference/builder/#copy

<br>

### ENTRYPOINT

#### ▼ ENTRYPOINTとは

イメージのプロセスの起動コマンドを実行する。

参考：https://docs.docker.com/engine/reference/builder/#entrypoint

#### ▼ CMDとの違い

似た命令として```CMD```がある。```CMD```とは異なり、後から上書き実行できない。使用者に、コンテナの起動方法を強制させたい場合に適する。イメージのプロセスの起動コマンドを後から上書きできなくなるため、```run```コマンドの引数として新しいコマンドを渡せずに、デバッグできないことがある。

```bash
# 上書きできず、失敗してしまう。
$ docker run --rm -it <イメージ名> /bin/bash
```

<br>

### ENV

#### ▼ ENVとは

OS上のコマンド処理で展開できる変数を定義できる。

参考：https://docs.docker.com/engine/reference/builder/#env

<br>

### EXPOSE

#### ▼ EXPOSEとは

他のコンテナに対してコンテナポートを開放する。また、イメージの利用者にとってのドキュメンテーション機能もあり、ポートマッピングを実行する時に使用できるコンテナポートとして保証する機能もある。ホスト側からはアクセスできないことに注意する。

参考：

- https://docs.docker.com/engine/reference/builder/#expose

- https://www.whitesourcesoftware.com/free-developer-tools/blog/docker-expose-port/

#### ▼ プロセスによるポート受信

コンテナのポートを開放するだけでは不十分である。プロセス自体がインバウンド通信を受信できるようにポートを設定する必要がある。ただし、多くの場合デフォルトでこれが設定されている。例えば、PHP-FPMでは、```/usr/local/etc/www.conf.default```ファイルと```/usr/local/etc/php-fpm.d/www.conf```ファイルには、```listen```オプションの値に```127.0.0.1:9000```が割り当てられている。

<br>

### FROM

#### ▼ FROMとは

ベースのイメージを、コンテナにインストールする。

参考：https://docs.docker.com/engine/reference/builder/#from

```dockerfile
FROM python:latest-slim
```

#### ▼ イメージレジストリの指定

指定できるイメージレジストリの例と記法は以下の通りである。

| レジストリの種類           | 例                                                                                                            | 補足                                                         |
|--------------------|--------------------------------------------------------------------------------------------------------------| ------------------------------------------------------------ |
| DockerHub          | ```php:8.0-fpm```                                                                                            | https://hub.docker.com/_/php                                 |
| クラウドプロバイダー（パブリック）  | ECRパブリックギャラリーの場合：<br>```public.ecr.aws/bitnami/php-fpm:latest```                                             | https://gallery.ecr.aws/bitnami/php-fpm                      |
| クラウドプロバイダー（プライベート） | ECRプライベートレジストリの場合：<br>```<アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/private-foo-php-repository:latest``` | https://ap-northeast-1.console.aws.amazon.com/ecr/repositories?region=ap-northeast-1 |

#### ▼ CPUアーキテクチャの指定

イメージの対応するCPUアーキテクチャを設定する。ただし、DockerがマシンのOSを認識して、自動的に選んでくれるため、ユーザーが設定する必要はない。

参考：https://stackoverflow.com/questions/60251383/dockerfile-from-platform-option

```dockerfile
FROM --platform=linux/amd64 python:latest-slim
```



<br>

### RUN

#### ▼ RUNとは

ベースイメージ上に、ソフトウェアをインストールする。

参考：https://docs.docker.com/engine/reference/builder/#run

<br>

### VOLUME

#### ▼ VOLUMEとは

ボリュームマウントを行う。

参考：

- https://docs.docker.com/engine/reference/builder/#volume
- https://qiita.com/namutaka/items/f6a574f75f0997a1bb1d

<br>

### WORKDIR

#### ▼ WORKDIRとは

ビルド中の各命令の作業ディレクトリを絶対パスで指定する。また、コンテナ接続時の最初のディレクトリも定義できる。

参考：https://docs.docker.com/engine/reference/builder/#workdir

<br>
