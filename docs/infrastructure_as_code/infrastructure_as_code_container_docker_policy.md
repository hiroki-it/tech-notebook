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

## 02. ベースイメージの軽量化

### 不要なファイルを除外する

#### ▼ ```.dockerignore```ファイル

イメージのビルド時に無視するファイルを設定する．開発環境のみで用いるファイル，```.gitignore```ファイル，```README```ファイル，などはコンテナの稼働には不要である．

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

#### ▼ 可能な限りOSイメージをベースとしない

OSベンダーが提供するベースイメージを用いると，不要なバイナリファイルが含まれてしまう．原則として，1つのコンテナで1つのプロセスしか実行せず，OS全体のシステムは不要なため，OSイメージをベースとしないようにする．

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

さらに，これは以下のようにも書くことができる．

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