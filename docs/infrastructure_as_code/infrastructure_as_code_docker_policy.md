---
title: 【IT技術の知見】設計ポリシー＠Docker
description: 設計ポリシー＠Dockerの知見を記録しています。
---

# 設計ポリシー＠Docker

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. プロセス単位でコンテナを分割する

これは、Dockerの原則である。アプリケーションを稼働させるには、最低限、webサーバーミドルウェア、アプリケーション、DBMSが必要である。これらのプロセスは、同じコンテナに共存させることなく、個別のコンテナで稼働させ、ネットワークで接続する。

![プロセス単位のコンテナ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/プロセス単位のコンテナ.png)

<br>

## 02. Dockerfileの脆弱性対策

### 実行ユーザーの非特権化

コンテナのプロセスの実行ユーザーにルート権限の認可スコープを付与すると、もし実行ユーザーが乗っ取られた場合に、全てのファイルが操作されうる。これを防ぐために、コンテナのプロセスの実行ユーザーを別途作成し、これに非特権な認可スコープを付与する。

> ℹ️ 参考：
>
> - https://blog.aquasec.com/docker-security-best-practices
> - https://www.forcia.com/blog/002273.html

```dockerfile
FROM alpine:3.12

# 実行ユーザーを作成し、必要最低限の認可スコープを付与する。
RUN adduser -D foouser && chown -R foouser /app-data

# コンテナのプロセスの実行ユーザーを指定する。
USER foouser
 
ENTRYPOINT ["/app"]
```



<br>

### 信頼できるベースイメージの選定

#### ▼ 信頼できるベースイメージとは

インストールされているパッケージを把握できるベースイメージを使用する。

> ℹ️ 参考：https://www.forcia.com/blog/002273.html

#### ▼ ベースイメージの種類

> ℹ️ 参考：
>
> - https://prograshi.com/platform/docker/docker-image-tags-difference/
> - https://dev.classmethod.jp/articles/docker-build-meetup-1/#toc-9
> - https://qiita.com/t_katsumura/items/462e2ae6321a9b5e473e

| ベースイメージの種類名 | 接尾辞                                                    | 説明                                                         | OSの有無       | ユーティリティの有無 | パッケージマネージャー系統の有無 |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------ | -------------- | -------------------- | -------------------------------- |
| distribution型         | ```scratch```                                             | パッケージを何もインストールしていない。                     | 無             | 無                   | 無                               |
|                        | ```alpine```                                              | 最小限のパッケージのみをインストールしている。               | Alpine Linux   | 有                   | apk                              |
|                        | ```buster```、```bullseye```、```jessie```、```stretch``` | 最小限のパッケージのみをインストールしている。               | Debian         | 有                   | Debian系（dpkg、apt-get、apt）   |
|                        | ```slim```                                                | 最もオススメの接尾辞。使用頻度の高いパッケージのみをインストールしている。 | イメージによる | 有                   | イメージによる                   |
|                        | 接尾辞なし                                                | 使用頻度の高いパッケージだけでなく、小さいパッケージもインストールしている。 | イメージによる | 有                   | イメージによる                   |
| distroless型           | 接尾辞なし                                                | 最小限のパッケージのみをインストールしている。               | イメージによる | 有（非常に少ない）   | イメージによる                   |

#### ▼ 対応できるCPUアーキテクチャの種類

Dockerは全てのマシンで稼働できるわけではなく、コンテナイメージごとに対応できるCPUアーキテクチャ（AMD系、ARM系、など）がある。同じOSでも、機種ごとに搭載されるCPUアーキテクチャは異なる。例えば、MacBook 2020 にはIntel、またMacBook 2021（M1 Mac）にはARMベースの独自CPUが搭載されているため、ARMに対応したコンテナイメージを選択する必要がある。ただし、コンテナイメージがOSのCPUアーキテクチャに対応しているか否かを開発者が気にする必要はなく、```docker pull```時に、OSのCPUアーキテクチャに対応したコンテナイメージが自動的に選択されるようになっている。コンテナの現在のCPUアーキテクチャは、```docker inspect```コマンドで確認できる。

> ℹ️ 参考：https://github.com/docker-library/official-images#architectures-other-than-amd64

```bash
$ docker inspect <コンテナ名>
{
    ...
 
        "Architecture": "arm64",
        
    ...
}
```

#### ▼ バージョン

イメージのバージョンには種類があり、追跡できるバージョンアップが異なる。

> ℹ️ 参考：https://hub.docker.com/_/composer/?tab=description&page=1&ordering=last_updated

| バージョン例 | 追跡できるバージョンアップ                                   |
| ------------ | ------------------------------------------------------------ |
| ```2.0.9```  | バージョンを直指定し、追跡しない。                           |
| ```2.0```    | 『```2.0.X```』のマイナーアップデートのみを追跡する。        |
| ```2```      | 『```2.X```』と『```2.0.X```』のマイナーアップデートのみを追跡する。 |
| ```latest``` | メジャーアップデートとマイナーアップデートを追跡する。       |

<br>

## 03. イメージサイズ

### 不要なファイルの除外

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

### イメージレイヤー数の抑制

#### ▼ ```RUN```コマンドをまとめる

イメージレイヤー数が多くなると、コンテナイメージが大きくなる。Dockerfileの各命令によって、コンテナイメージ レイヤーが1つ増えてしまうため、同じ命令に異なるパラメーターを与える時は、『```&&```』で1つにまとめてしまう方が良い。

> ℹ️ 参考：
>
> - https://www.itbook.info/network/docker02.html
> - https://yuhabeem.com/2021/03/27/311/

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

<br>

### マルチステージビルドの採用

#### ▼ マルチステージビルドとは

1つのDockerfile内に複数の独立したステージを定義する。以下の手順で作成する。

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

## 04. CIパイプライン

### コンテナイメージの署名

コンテナイメージをビルドインのコマンド（例：```docker trust```コマンド）やコンテナイメージ署名ツール（例：cosign）を使用して、信頼された（ログイン済みの）イメージリポジトリから信頼されたコンテナイメージをプルできるようにする。```docker trust```コマンドの内部では、notaryが使用されている。

> ℹ️ 参考：
> 
> - https://matsuand.github.io/docs.docker.jp.onthefly/engine/security/trust/#signing-images-with-docker-content-trust
> - https://codezine.jp/article/detail/15119

<br>

### Dockerfileのホワイトボックステスト

#### ▼ 静的解析

| 観点             | 説明                                                                                                                                                                                                                                           |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 文法の誤りテスト       | Dockerのビルトインのコマンド（例：```docker build```コマンド）を使用して、Dockerfileの文法の誤りを検証する。                                                                                                                                                                      |
| ベストプラクティス違反テスト | 外部のベストプラクティス違反テストツール（例：hadolint）を使用して、Dockerfileのベストプラクティス違反を検証する。                                                                                                                                                                           |
| 脆弱性テスト （イメージスキャン）  | 外部の脆弱性テストツール（例：trivy）を使用して、Dockerfileの実装方法の実装や使用パッケージに起因する脆弱性を検証する。                                                                                                                                                                          |
| コンテナ構造テスト | 外部の脆弱性テストツール（例：container-structure-test）を使用して、Dockerfileのコンテナの構造を検証する。（例：期待するファイルが存在するか、コンテナ起動時の```ENTRYPOINT```が正しく動作するか、など）<br>ℹ️ 参考：https://qiita.com/tsubasaogawa/items/d41807d368e7b2635e77#container-structure-test-%E3%81%A8%E3%81%AF |

<br>

