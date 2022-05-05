---
title: 【知見を記録するサイト】設計ポリシー＠Docker
description: 設計ポリシー＠Dockerの知見をまとめました．

---

# 設計ポリシー＠Docker

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. コンテナの分割

### プロセス単位でコンテナを分割する

これは，Dockerの原則である．アプリケーションを稼働させるには，最低限，Webサーバーミドルウェア，アプリケーション，DBMSが必要である．これらを，個別のコンテナで稼働させ，ネットワークで接続する．

![プロセス単位のコンテナ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/プロセス単位のコンテナ.png)

<br>

## 02. ベースイメージの選定

### イメージリポジトリ

イメージは，実行OSによらずに一貫してビルドできるため，配布できる．各イメージリポジトリ（DockerHub，ECR，など）には，カスタマイズする上でのベースとなるイメージが提供されている．

<br>

### ベースイメージの種類

#### ▼ 接尾辞の種類

参考：https://prograshi.com/platform/docker/docker-image-tags-difference/

| 接尾辞名                                                   | 説明                                     | OS           | ユーティリティ | パッケージマネージャー系統             |
|--------------------------------------------------------|----------------------------------------|--------------|---------|---------------------------|
| ```scratch```                                          | パッケージを何もインストールしていない．                   | 無            | 無       | 無                         |
| ```alpine```                                           | 最小限のパッケージのみをインストールしている．                | Alpine Linux | 有       | apk                       |
| ```buster```，```bullseye```，```jessie```，```stretch``` | 最小限のパッケージのみをインストールしている．                | Debian       | 有       | Debian系（dpkg，apt-get，apt） |
| ```slim```                                             | 最もオススメの接尾辞．使用頻度の高いパッケージのみをインストールしている．  | イメージによる      | 有       | イメージによる                   |
| 接尾辞なし                                                  | 使用頻度の高いパッケージだけでなく，小さいパッケージもインストールしている． | イメージによる      | 有       | イメージによる                   |

#### ▼ 対応できるCPUアーキテクチャの種類

Dockerは全てのマシンで稼働できるわけではなく，イメージごとに対応できるCPUアーキテクチャ（AMD系，ARM系，など）がある．同じOSでも，機種ごとに搭載されるCPUアーキテクチャは異なる．例えば，MacBook 2020 にはIntel，またMacBook 2021（M1 Mac）にはARMベースの独自CPUが搭載されているため，ARMに対応したイメージを選択する必要がある．ただし，イメージがOSのCPUアーキテクチャに対応しているかどうかを開発者が気にする必要はなく，```docker pull```時に，OSのCPUアーキテクチャに対応したイメージが自動的に選択されるようになっている．

参考：https://github.com/docker-library/official-images#architectures-other-than-amd64

#### ▼ バージョン

イメージのバージョンには種類があり，追跡できるバージョンアップが異なる．

参考：https://hub.docker.com/_/composer/?tab=description&page=1&ordering=last_updated

| バージョン例 | 追跡できるバージョンアップ                                   |
| ------------ | ------------------------------------------------------------ |
| ```2.0.9```  | バージョンを直指定し，追跡しない．                           |
| ```2.0```    | 『```2.0.X```』のマイナーアップデートのみを追跡する．        |
| ```2```      | 『```2.X```』と『```2.0.X```』のマイナーアップデートのみを追跡する． |
| ```latest``` | メジャーアップデートとマイナーアップデートを追跡する．       |

<br>

## 02-02 イメージの軽量化

### 不要なファイルを除外する

#### ▼ ```.dockerignore```ファイル

イメージのビルド時に無視するファイルを設定する．開発環境のみで使用するファイル，```.gitignore```ファイル，```README```ファイル，などはコンテナの稼働には不要である．

```bash
.env.example
.gitignore
README.md
```

#### ▼ キャッシュを削除する

UNIXユーティリティをインストールするとキャッシュが残る．キャッシュが使用されることはないため，削除してしまう．

**＊実装例＊**


```dockerfile
FROM centos:8

RUN dnf upgrade -y \
  && dnf install -y \
      curl \
  # メタデータ削除
  && dnf clean all \
  # キャッシュ削除
  && rm -rf /var/cache/dnf
```

#### ▼ できる限りOSイメージをベースとしない

OSベンダーが提供するベースイメージを使用すると，不要なバイナリファイルが含まれてしまう．原則として，1つのコンテナで1つのプロセスしか実行せず，OS全体のシステムは不要なため，OSイメージをベースとしないようにする．

**＊実装例＊**

```dockerfile
# CentOSイメージを，コンテナにインストール
FROM centos:8

# PHPをインストールするために，EPELとRemiリポジトリをインストールして有効化．
RUN dnf upgrade -y \
  && dnf install -y \
      https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm \
      https://rpms.remirepo.net/enterprise/remi-release-8.rpm \
  && dnf module enable php:remi-${PHP_VERSION} \
  # フレームワークの要件のPHP拡張機能をインストール
  && dnf install -y \
      php \
      php-bcmath \
      php-ctype \
      php-fileinfo \
      php-json \
      php-mbstring \
      php-openssl \
      php-pdo \
      php-tokenizer \
      php-xml \
  && dnf clean all \
  && rm -Rf /var/cache/dnf

# DockerHubのComposerイメージからバイナリファイルを取得
COPY --from=composer /usr/bin/composer /usr/bin/composer
```

**＊実装例＊**

```dockerfile
# CentOSイメージを，コンテナにインストール
FROM centos:8

# nginxをインストール
RUN dnf upgrade -y \
  && dnf install -y \
     nginx \
     curl \
  && dnf clean all \
  && rm -Rf /var/cache/dnf

COPY infra/docker/web/nginx.conf /etc/nginx/nginx.conf

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]

EXPOSE 80
```

<br>

<br>

### イメージレイヤーを減らす

#### ▼ ```RUN```コマンドをまとめる

Dockerfileの各命令によって，イメージ レイヤーが1つ増えてしまうため，同じ命令に異なるパラメーターを与える時は，これを1つにまとめてしまう方が良い．例えば，以下のような時，

```dockerfile
# ベースイメージ上に，複数のソフトウェアをインストール
RUN yum -y isntall httpd
RUN yum -y install php
RUN yum -y install php-mbstring
RUN yum -y install php-pear
```

これは，以下のように一行でまとめられる．イメージレイヤーが少なくなり，イメージを軽量化できる．

```dockerfile
# ベースイメージ上に，複数のソフトウェアをインストール
RUN yum -y install httpd php php-mbstring php-pear
```

さらに，これは以下のようにも書ける．

```dockerfile
# ベースイメージ上に，複数のソフトウェアをインストール
RUN yum -y install \
     httpd \
     php \
     php-mbstring \
     php-pear
```

<br>

### マルチステージビルドを採用する

#### ▼ マルチステージビルドとは

1つのDockerfile内に複数の独立したステージを定義する方法．以下の手順で作成する．

1. シングルステージビルドに成功するDockerfileを作成する．
2. ビルドによって生成されたバイナリファイルがどこに配置されるかを場所を調べる．
3. Dockerfileで，二つ目の```FROM```を宣言する．
4. 1つ目のステージで，バイナリファイルをコンパイルするだけで終わらせる．
5. 二つ目のステージで，UNIXユーティリティをインストールする．また，バイナリファイルを1つ目のステージからコピーする．

#### ▼ コンパイル済バイナリファイルを再利用する場合

**＊実装例＊**

```dockerfile
# 中間イメージ
FROM golang:1.7.3 AS builder
WORKDIR /go/src/github.com/alexellis/href-counter/
RUN go get -d -v golang.org/x/net/html  
COPY app.go /go/src/github.com/alexellis/href-counter/
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

# 最終イメージ
FROM alpine:latest  
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /go/src/github.com/alexellis/href-counter/app .
CMD ["./app"]  
```

#### ▼ 実行環境別にステージを分ける場合

実行環境別にステージを分けることで，その環境に必要なファイルのみが含まれるようにする．

**＊実装例＊**

```dockerfile
#===================
# Global ARG
#===================
ARG NGINX_VERSION="1.19"
ARG LABEL="Hiroki <example@gmail.com>"

#===================
# Build Stage
#===================
FROM nginx:${NGINX_VERSION} as build

RUN apt-get update -y \
  && apt-get install -y \
     curl \
     vim \
  # キャッシュ削除
  && apt-get clean

#===================
# Develop Stage
#===================
FROM build as develop
LABEL mantainer=${LABEL}

COPY ./infra/docker/www/develop.nginx.conf /etc/nginx/nginx.conf

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]

#===================
# Production Stage
#===================
FROM build as production
LABEL mantainer=${LABEL}

COPY ./infra/docker/www/production.nginx.conf /etc/nginx/nginx.conf

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
```

<br>