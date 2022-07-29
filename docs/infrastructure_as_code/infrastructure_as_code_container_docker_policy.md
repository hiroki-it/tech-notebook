---
title: 【IT技術の知見】設計ポリシー＠Docker
description: 設計ポリシー＠Dockerの知見を記録しています。
---

# 設計ポリシー＠Docker

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. プロセス単位でコンテナを分割する

これは、Dockerの原則である。アプリケーションを稼働させるには、最低限、Webサーバーミドルウェア、アプリケーション、DBMSが必要である。これらのプロセスは、同じコンテナに共存させることなく、個別のコンテナで稼働させ、ネットワークで接続する。

![プロセス単位のコンテナ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/プロセス単位のコンテナ.png)

<br>

## 02. ベースイメージを選ぶ

### イメージレジストリ

イメージは、実行OSによらずに一貫してビルドできるため、配布できる。各イメージレジストリ（DockerHub、ECR、など）には、カスタマイズする上でのベースとなるイメージが提供されている。

<br>

### ベースイメージの種類

#### ▼ 接尾辞の種類

参考：https://prograshi.com/platform/docker/docker-image-tags-difference/

| 接尾辞名                                                   | 説明                                     | OS           | ユーティリティ | パッケージマネージャー系統             |
|--------------------------------------------------------|----------------------------------------|--------------|---------|---------------------------|
| ```scratch```                                          | パッケージを何もインストールしていない。                   | 無            | 無       | 無                         |
| ```alpine```                                           | 最小限のパッケージのみをインストールしている。                | Alpine Linux | 有       | apk                       |
| ```buster```、```bullseye```、```jessie```、```stretch``` | 最小限のパッケージのみをインストールしている。                | Debian       | 有       | Debian系（dpkg、apt-get、apt） |
| ```slim```                                             | 最もオススメの接尾辞。使用頻度の高いパッケージのみをインストールしている。  | イメージによる      | 有       | イメージによる                   |
| 接尾辞なし                                                  | 使用頻度の高いパッケージだけでなく、小さいパッケージもインストールしている。 | イメージによる      | 有       | イメージによる                   |

#### ▼ 対応できるCPUアーキテクチャの種類

Dockerは全てのマシンで稼働できるわけではなく、コンテナイメージごとに対応できるCPUアーキテクチャ（AMD系、ARM系、など）がある。同じOSでも、機種ごとに搭載されるCPUアーキテクチャは異なる。例えば、MacBook 2020 にはIntel、またMacBook 2021（M1 Mac）にはARMベースの独自CPUが搭載されているため、ARMに対応したコンテナイメージを選択する必要がある。ただし、コンテナイメージがOSのCPUアーキテクチャに対応しているか否かを開発者が気にする必要はなく、```docker pull```時に、OSのCPUアーキテクチャに対応したコンテナイメージが自動的に選択されるようになっている。コンテナの現在のCPUアーキテクチャは、```docker inspect```コマンドで確認できる。

参考：https://github.com/docker-library/official-images#architectures-other-than-amd64

```bash
$ docker inspect <コンテナ名>
{
    # 〜 中略 〜
 
        "Architecture": "arm64",
        
    # 〜 中略 〜
}
```

#### ▼ バージョン

イメージのバージョンには種類があり、追跡できるバージョンアップが異なる。

参考：https://hub.docker.com/_/composer/?tab=description&page=1&ordering=last_updated

| バージョン例 | 追跡できるバージョンアップ                                   |
| ------------ | ------------------------------------------------------------ |
| ```2.0.9```  | バージョンを直指定し、追跡しない。                           |
| ```2.0```    | 『```2.0.X```』のマイナーアップデートのみを追跡する。        |
| ```2```      | 『```2.X```』と『```2.0.X```』のマイナーアップデートのみを追跡する。 |
| ```latest``` | メジャーアップデートとマイナーアップデートを追跡する。       |

<br>

## 03. イメージを軽量化する

### 不要なファイルを除外する

#### ▼ ```.dockerignore```ファイル

イメージのビルド時に無視するファイルを設定する。開発環境のみで使用するファイル、```.gitignore```ファイル、```README```ファイル、などはコンテナの稼働には不要である。

```bash
.env.example
.gitignore
README.md
```

#### ▼ キャッシュを削除する

UNIXユーティリティをインストールするとキャッシュが残る。キャッシュが使用されることはないため、削除してしまう。

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

OSベンダーが提供するベースイメージを使用すると、不要なバイナリファイルが含まれてしまう。原則として、1つのコンテナで1つのプロセスしか実行せず、OS全体のシステムは不要なため、OSイメージをベースとしないようにする。

**＊実装例＊**

```dockerfile
# CentOSイメージを、コンテナにインストール
FROM centos:8

# PHPをインストールするために、EPELとRemiリポジトリをインストールして有効化。
RUN dnf upgrade -y \
  && dnf install -y \
      https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm \
      https://rpms.remirepo.net/enterprise/remi-release-8.rpm \
  && dnf module enable php:remi-7.4 \
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
# CentOSイメージを、コンテナにインストール
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

### イメージレイヤーの数を減らす

#### ▼ ```RUN```コマンドをまとめる

イメージレイヤー数が多くなると、コンテナイメージが大きくなる。Dockerfileの各命令によって、コンテナイメージ レイヤーが1つ増えてしまうため、同じ命令に異なるパラメーターを与える時は、『```&&```』で1つにまとめてしまう方が良い。

参考：

- https://www.itbook.info/network/docker02.html
- https://yuhabeem.com/2021/03/27/311/

例えば、以下のような時、

```dockerfile
# ベースイメージ上に、複数のソフトウェアをインストール
RUN yum -y isntall httpd
RUN yum -y install php
RUN yum -y install php-mbstring
RUN yum -y install php-pear
RUN rm -Rf /var/cache/yum
```

これは、以下の様に一行でまとめられる。イメージレイヤーが少なくなり、コンテナイメージを軽量化できる。

```dockerfile
# ベースイメージ上に、複数のソフトウェアをインストール
RUN yum -y install httpd php php-mbstring php-pear \
&& rm -Rf /var/cache/dnf
```

さらに、これは以下の様にも書ける。

```dockerfile
# ベースイメージ上に、複数のソフトウェアをインストール
RUN yum -y install \
     httpd \
     php \
     php-mbstring \
     php-pear \
  && rm -Rf /var/cache/dnf
```

<br>

### マルチステージビルドを採用する

#### ▼ マルチステージビルドとは

1つのDockerfile内に複数の独立したステージを定義する方法。以下の手順で作成する。

1. シングルステージビルドに成功するDockerfileを作成する。
2. ビルドによって作成されたバイナリファイルがどこに配置されるかを場所を調べる。
3. Dockerfileで、2つ目の```FROM```を宣言する。
4. 1つ目のステージで、バイナリファイルをコンパイルするだけで終わらせる。
5. 2つ目のステージで、UNIXユーティリティをインストールする。また、バイナリファイルを1つ目のステージからコピーする。

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

実行環境別にステージを分けることにより、その環境に必要なファイルのみが含まれるようにする。

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

## 04. イメージのサイバー攻撃を対策する

参考：

- https://blog.aquasec.com/docker-security-best-practices
- https://www.creationline.com/lab/aquasecurity/43087

<br>
