---
title: 【IT技術の知見】設計規約＠Docker
description: 設計規約＠Dockerの知見を記録しています。
---

# 設計規約＠Docker

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. プロセス

### プロセス単位でコンテナを分割する

これは、Dockerの原則である。

アプリケーションを稼働させるには、最低限、webサーバーミドルウェア、アプリケーション、DBMSが必要である。

これらのプロセスは、同じコンテナに共存させることなく、個別のコンテナで稼働させ、ネットワークで接続するようにする。

![プロセス単位のコンテナ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/プロセス単位のコンテナ.png)

また、各コンテナでは起動コマンドを単一の親プロセスとし、これに子プロセスが紐づくようにする。

![container_processes.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/container_processes.png)

なお、1コンテナに2つのプロセスがあると、コンテナの終了処理 (SIGTERM) を実行する場合の終了順序を考えないといけない。

プロセス管理ツール (例：supervisor) を使用すると、終了順序を考えやすくなる。

> - https://cloud.google.com/architecture/best-practices-for-building-containers?hl=ja#package_a_single_app_per_container

<br>

### `PID 1`問題

#### ▼ `PID 1`問題とは

サーバーのLinuxでは、`init`プロセスが`PID=1`として稼働している。

![container_pid_1_problem_1.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/container_pid_1_problem_1.png)

`init`プロセスは、配下のいずれかの親プロセスを終了したとする。

![container_pid_1_problem_2.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/container_pid_1_problem_2.png)

すると、これの子プロセスも連鎖的に終了してくれる。

![container_pid_1_problem_3.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/container_pid_1_problem_3.png)

一方でコンテナのLinuxでは、アプリやミドルウェアのプロセスが`PID=1`で動いている。

これらのプロセスは、いずれかの親プロセスを終了しても、これの子プロセスも連鎖的に終了できない。

そのため、子プロセスが残骸として残ってしまう。

![container_pid_1_problem_4.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/container_pid_1_problem_4.png)

> - https://qiita.com/t_katsumura/items/ed105f1c139b24f7fe4f#%E3%82%BE%E3%83%B3%E3%83%93%E3%83%97%E3%83%AD%E3%82%BB%E3%82%B9%E7%99%BA%E7%94%9F%E3%81%AE%E4%BB%95%E7%B5%84%E3%81%BF

#### ▼ 対処方法

`tini`を使用し、アプリやミドルウェアのプロセスを`PID=1`で動かさないようにする。

```dockerfile
FROM node:16-alpine3.15
WORKDIR /app

RUN apk add --no-cache tini

COPY package.json yarn.lock ./
RUN yarn install --prod --frozen-lockfile

COPY . .

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
```

> - https://blog.shinonome.io/nodejs-docker/#for-toc-14

<br>

## 02. 脆弱性に対処する

### 実行ユーザーを非特権化する

コンテナのプロセスの実行ユーザーにルート権限の認可スコープを付与すると、もし実行ユーザーが乗っ取られた場合に、全てのファイルが操作されうる。

これを防ぐために、コンテナのプロセスの実行ユーザーを別途作成し、これに非特権な認可スコープを付与する。

```dockerfile
FROM alpine:3.12

# 実行ユーザーを作成し、必要最低限の認可スコープを付与する。
RUN adduser -D foouser \
  `# ディレクトリに作成した実行ユーザーを設定する。` \
  && chown -R foouser /app-data

# コンテナのプロセスの実行ユーザーを指定する。
USER foouser

ENTRYPOINT ["/app"]
```

> - https://blog.aquasec.com/docker-security-best-practices
> - https://www.forcia.com/blog/002273.html

<br>

### `sudo`を実行しない。

不必要に権限を昇格させないためにsudoを使わない。

sudoを使いたければ、gosuを使う。

> - https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#use-multi-stage-builds

<br>

### 信頼できるベースイメージを選ぶ

インストールされているパッケージを把握できるベースイメージを使用する。

> - https://www.forcia.com/blog/002273.html

<br>

### Docker in Dockerの脆弱性に対処する

コンテナの中でコンテナを作成するという入れ子構造のこと。

中へのコンテナが外へのコンテナのアクセス権限が必要である。

Docker in Dockerは、特権モードが必要になり、安全性に問題がある。

一部のコンテナイメージビルドツール (例：Kaniko) では、Docker in Dockerを回避できるようになっている。

> - https://www.howtogeek.com/devops/how-and-why-to-run-docker-inside-docker/
> - https://shisho.dev/blog/posts/docker-in-docker/

<br>

### コンテナイメージを署名する

コンテナイメージをビルドインのコマンド (例：`docker trust`コマンド) やコンテナイメージ署名ツール (例：cosign) を使用して、信頼された (ログイン済みの) イメージリポジトリから信頼されたコンテナイメージをプルできるようにする。

`docker trust`コマンドの内部では、notaryが使用されている。

> - https://matsuand.github.io/docs.docker.jp.onthefly/engine/security/trust/#signing-images-with-docker-content-trust
> - https://codezine.jp/article/detail/15119

<br>

## 03. イメージタグにlatestを設定しない

#### ▼ `latest`タグを指定しない方が良い理由

イメージタグにlatestを設定すると、誤ったバージョンのイメージタグを選択してしまい、障害が起こりかねない。

そこで、イメージはセマンティックバージョニングでタグ付けし、コンテナでは特定のバージョンをプルように設定する。

なお、各コンテナイメージのアーキテクチャに割り当てられたダイジェスト値を指定することもできるが、DockerがホストのCPUアーキテクチャに基づいてよしなに選んでくれるので、ダイジェスト値は指定しない。

#### ▼ タグの種類

イメージのタグには種類があり、追跡できるバージョンアップが異なる。

| バージョン例 | 追跡できるバージョンアップ                                   |
| ------------ | ------------------------------------------------------------ |
| `2.0.9`      | バージョンを直指定し、追跡しない。                           |
| `2.0`        | 『`2.0.X`』のマイナーアップデートのみを追跡する。            |
| `2`          | 『`2.X`』と『`2.0.X`』のマイナーアップデートのみを追跡する。 |
| `latest`     | メジャーアップデートとマイナーアップデートを追跡する。       |

> - https://hub.docker.com/_/composer/?tab=description&page=1&ordering=last_updated

#### ▼ CPUアーキテクチャの種類

コンテナは全てのマシンで稼働できるわけではなく、コンテナイメージごとに対応できるホストのCPUアーキテクチャ (例：Intel、AMD、ARM) がある。

| 項目  | 表記                        | 補足                                                                                                      |
| ----- | --------------------------- | --------------------------------------------------------------------------------------------------------- |
| Intel | `amd64` (`x86_64`)          | IntelとAMDは互換性があるので、CPUアーキテクチャがIntelであっても、AMD対応のコンテナイメージを使用できる。 |
| Arm   | `arm64`、`arm/v5`、`arm/v7` |                                                                                                           |
| Amd   | `amd64`                     |                                                                                                           |

> - https://blog.future.ad.jp/small-talk-about-it-001-why-is-amd64-even-though-the-intel-cpu

例えば、`MacBook 2020`にはIntel、また`MacBook 2021 (M1 Mac)`にはARMベースの独自CPUが搭載されているため、ARMに対応したコンテナイメージを選択する必要がある。

ただし、コンテナイメージがホストのCPUアーキテクチャに対応しているか否かを開発者が気にする必要はない。

`docker pull`時に、ホストのCPUアーキテクチャに対応したコンテナイメージが自動的に選択されるようになっている。

コンテナの現在のCPUアーキテクチャは、以下のいずれかの方法で確認できる。

```bash
$ docker inspect <コンテナ名>

{
    ...

        "Architecture": "arm64",

    ...
}
```

```bash
$ docker exec -it <起動中コンテナ名> /bin/bash -- uname -m

arm64
```

> - https://github.com/docker-library/official-images#architectures-other-than-amd64
> - https://zenn.dev/suzuki_hoge/books/2021-12-m1-docker-5ac3fe0b1c05de/viewer/2-arm
> - https://linuxfan.info/post-2745

<br>

## 04. イメージサイズを削減する

### 不要なファイルを含めない

#### ▼ ベースイメージの種類

| ベースイメージの種類名 | 接尾辞                                    | 説明                                                                         | OSの有無       | ユーティリティの有無 | パッケージマネージャー系統の有無 |
| ---------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- | -------------- | -------------------- | -------------------------------- |
| distribution型         | `scratch`                                 | パッケージを何もインストールしていない。                                     | 無             | 無                   | 無                               |
|                        | `alpine`                                  | 最小限のパッケージのみをインストールしている。                               | Alpine Linux   | 有                   | apk                              |
|                        | `buster`、`bullseye`、`jessie`、`stretch` | 最小限のパッケージのみをインストールしている。                               | Debian         | 有                   | Debian系 (dpkg、apt-get、apt)    |
|                        | `slim`                                    | 最もオススメの接尾辞。使用頻度の高いパッケージのみをインストールしている。   | イメージによる | 有                   | イメージによる                   |
|                        | 接尾辞なし                                | 使用頻度の高いパッケージのみでなく、小さいパッケージもインストールしている。 | イメージによる | 有                   | イメージによる                   |
| distroless型           | 接尾辞なし                                | 最小限のパッケージのみをインストールしている。                               | イメージによる | 有 (非常に少ない)    | イメージによる                   |

> - https://prograshi.com/platform/docker/docker-image-tags-difference/
> - https://dev.classmethod.jp/articles/docker-build-meetup-1/#toc-9
> - https://qiita.com/t_katsumura/items/462e2ae6321a9b5e473e
> - https://zenn.dev/jrsyo/articles/e42de409e62f5d#%E9%81%B8%E6%8A%9E%E8%82%A2-3.-ubuntu-%2B-slim-%E3%82%A4%E3%83%A1%E3%83%BC%E3%82%B8-(%E3%83%90%E3%83%A9%E3%83%B3%E3%82%B9-%E2%97%8E)

#### ▼ `.dockerignore`ファイル

イメージのビルド時に無視するファイルを設定する。

開発環境のみで使用するファイル、`.gitignore`ファイル、`README`ファイル、などはコンテナの稼働には不要である。

```ignore
.env.example
.gitignore
README.md
```

> - https://cloud.google.com/architecture/best-practices-for-building-containers?hl=ja#remove_unnecessary_tools

#### ▼ キャッシュを削除する

Unixユーティリティをインストールするとキャッシュが残る。

キャッシュが使用されることはないため、削除してしまう。

**＊実装例＊**

```dockerfile
FROM centos:8

RUN dnf upgrade -y \
  && dnf install -y \
      curl \
  `# メタデータ削除` \
  && dnf clean all \
  `# キャッシュ削除` \
  && rm -rf /var/cache/dnf
```

> - https://cloud.google.com/architecture/best-practices-for-building-containers?hl=ja#optimize-for-the-docker-build-cache

<br>

### できる限りOSイメージをベースとしない

OSベンダーが提供するベースイメージを使用すると、不要なバイナリファイルが含まれてしまう。

原則として、1つのコンテナで1つのプロセスしか実行せず、OS全体のシステムは不要なため、OSイメージをベースとしないようにする。

> - https://cloud.google.com/architecture/best-practices-for-building-containers?hl=ja#build-the-smallest-image-possible

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
  `# フレームワークの要件のPHP拡張機能をインストール` \
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

### イメージレイヤー数を削減する

#### ▼ `RUN`を多用しない

イメージレイヤー数が多くなると、コンテナイメージが大きくなる。

Dockerfileの各命令によって、コンテナイメージレイヤーが1つ増えてしまうため、同じ命令に異なるパラメーターを与える時は、『`&&`』で1つにまとめてしまう方が良い。

例えば、以下のような時、

```dockerfile
# ベースイメージ上に、複数のソフトウェアをインストール
RUN yum -y isntall httpd
RUN yum -y install php
RUN yum -y install php-mbstring
RUN yum -y install php-pear
RUN rm -Rf /var/cache/yum
```

これは、以下の様に１行でまとめられる。

イメージレイヤーが少なくなり、コンテナイメージを軽量化できる。

```dockerfile
# ベースイメージ上に、複数のソフトウェアをインストール
RUN yum -y install httpd php php-mbstring php-pear \
  && rm -Rf /var/cache/dnf
```

加えて、これは以下の様にも書ける。

```dockerfile
# ベースイメージ上に、複数のソフトウェアをインストール
RUN yum -y install \
     httpd \
     php \
     php-mbstring \
     php-pear \
  && rm -Rf /var/cache/dnf
```

> - https://www.itbook.info/network/docker02.html
> - https://yuhabeem.com/2021/03/27/311/

<br>

### マルチステージビルドを採用する

#### ▼ マルチステージビルドとは

1つのDockerfile内に複数の独立したステージを定義する。

以下の手順で作成する。

`(1)`

: シングルステージビルドに成功するDockerfileを作成する。

`(2)`

: ビルドによって作成されたバイナリファイルがどこに配置されるかを場所を調べる。

`(3)`

: Dockerfileで、2つ目の`FROM`を宣言する。

`(4)`

: 1つ目のステージで、バイナリファイルをコンパイルするのみで終了させる。

`(5)`

: 2つ目のステージで、Unixユーティリティをインストールする。

     また、バイナリファイルを1つ目のステージからコピーする。

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
# コンテナからHTTPSリクエストを送信するために、ルート証明書をインストールする
RUN apk --no-cache add ca-certificates \
  && update-ca-certificates
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
  `# キャッシュ削除` \
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

## 05. ホワイトボックステストする

### 静的解析

| 観点                                     | 説明                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dockerfileの文法の誤りテスト             | Dockerのビルトインのコマンド (例：`docker build`コマンド) を使用する。Dockerfileの文法の誤りを検証する。                                                                                                                                                                                                                                  |
| Dockerfileのベストプラクティス違反テスト | 外部のベストプラクティス違反テストツール (例：hadolint) を使用する。Dockerfileのベストプラクティス違反を検証する。                                                                                                                                                                                                                        |
| Dockerfileの脆弱性テスト                 | 外部の脆弱性テストツール (例：hadolint) を使用する。報告されたCVEに基づいて、Dockerfileの実装方法の実装や使用パッケージに起因するコンテナイメージの脆弱性を検証する。補足として、イメージスキャン (例：trivy) は既にビルドされたコンテナイメージを検証するため、ここには含めない。                                                        |
| コンテナ構造テスト                       | 外部の脆弱性テストツール (例：container-structure-test) を使用する。報告されたCVEに基づいて、Dockerfileのコンテナの構造を検証する (例：期待するファイルが存在するか、コンテナ起動時の`ENTRYPOINT`が正しく動作するか、など) 。 <br>- https://qiita.com/tsubasaogawa/items/d41807d368e7b2635e77#container-structure-test-%E3%81%A8%E3%81%AF |

<br>
