---
title: 【IT技術の知見】モジュール＠Nginx
description: モジュール＠Nginxの知見を記録しています。
---

# モジュール＠Nginx

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## モジュール (静的/動的) のセットアップ方法

### ビルド

Nginxでは、モジュールを事前にビルドし、バイナリに組み込む必要がある。

ただ、すでにビルド済みで提供されている場合は、それをインストールすればよい。

<br>

### Dockerの場合

#### ▼ 未ビルドモジュールの場合

マルチステージビルドを使用して、モジュールのビルド用のステージと実際に使用するステージを分ける。

```dockerfile
# -----------------
# builderステージ
# -----------------
FROM nginx:<バージョン>-alpine as builder

# ここで未ビルドモジュールをビルドする

# -----------------
# mainステージ
# -----------------
FROM nginx:<バージョン>-alpine

# builderステージからビルド後のモジュールを取り出す
COPY --from=builder /usr/lib/nginx/modules/otel_ngx_module.so /usr/lib/nginx/modules/

...

```

> - https://github.com/ymtdzzz/nginx-otel-sample/blob/main/nginx/Dockerfile

#### ▼ ビルド済みモジュールの場合

ビルド済みモジュールをインストール後、そのまま使用する。

```dockerfile
FROM nginx:<バージョン>-alpine

# ビルド済みモジュールをインストールする


...

```

<br>

## gRPCパッケージ

### gRPCパッケージとは

nginxモジュールがgRPCを使用できるようにする。

> - https://github.com/grpc/grpc

<br>

### セットアップ

#### ▼ 未ビルドの場合

パッケージをインポートする前に、ビルドする必要がある。

```bash
$ git clone --shallow-submodules --depth 1 --recurse-submodules -b <バージョン> https://github.com/grpc/grpc
$ cd grpc
$ mkdir -p cmake/build
$ cd cmake/build
$ cmake \
    -DgRPC_INSTALL=ON \
    -DgRPC_BUILD_TESTS=OFF \
    -DCMAKE_INSTALL_PREFIX=/install \
    -DCMAKE_BUILD_TYPE=Release \
    -DgRPC_BUILD_GRPC_NODE_PLUGIN=OFF \
    -DgRPC_BUILD_GRPC_OBJECTIVE_C_PLUGIN=OFF \
    -DgRPC_BUILD_GRPC_PHP_PLUGIN=OFF \
    -DgRPC_BUILD_GRPC_PHP_PLUGIN=OFF \
    -DgRPC_BUILD_GRPC_PYTHON_PLUGIN=OFF \
    -DgRPC_BUILD_GRPC_RUBY_PLUGIN=OFF \
    ../..
$ make -j2
$ make install
```

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/issues/199#issuecomment-1263857801
> - https://qiita.com/MarthaS/items/14da436b6bce5e7d7759#%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E3%81%AE%E3%83%93%E3%83%AB%E3%83%89

<br>

## opentelemetry-cppパッケージ

### opentelemetry-cppパッケージとは

C++でNginxを計装できるようにする。

> - https://github.com/open-telemetry/opentelemetry-cpp

<br>

### セットアップ

#### ▼ 未ビルドの場合

パッケージをインポートする前に、ビルドする必要がある。

```bash
$ git clone --shallow-submodules --depth 1 --recurse-submodules -b <バージョン> https://github.com/open-telemetry/opentelemetry-cpp.git
$ cd opentelemetry-cpp
$ mkdir build
$ cd build
$ cmake -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_INSTALL_PREFIX=/install \
    -DCMAKE_PREFIX_PATH=/install \
    -DWITH_ZIPKIN=OFF \
    -DWITH_JAEGER=OFF \
    -DWITH_OTLP=ON \
    -DWITH_OTLP_GRPC=ON \
    -DWITH_OTLP_HTTP=OFF \
    -DBUILD_TESTING=OFF \
    -DWITH_EXAMPLES=OFF \
    -DWITH_ABSEIL=ON \
    -DCMAKE_POSITION_INDEPENDENT_CODE=ON \
    ..
$ make -j2
$ make install
```

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/issues/199#issuecomment-1263857801
> - https://qiita.com/MarthaS/items/14da436b6bce5e7d7759#%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E3%81%AE%E3%83%93%E3%83%AB%E3%83%89

<br>

## otel_ngx_module

### otel_ngx_moduleとは

OpenTelemetryコミュニティ製のモジュールであり、NginxをOpenTelemetryで計装できるようにする。

gRPC Exporterを使用するために、gRPCパッケージが必要である。

また、NginxはC++で実装されているため、opentelemetry-cppパッケージが必要である。

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx

<br>

### セットアップ

#### ▼ 未ビルドの場合

モジュールをインポートする前に、ビルドする必要がある。

```bash
$ git clone https://github.com/open-telemetry/opentelemetry-cpp-contrib.git
$ cd opentelemetry-cpp-contrib/instrumentation/nginx
$ mkdir build
$ cd build
$ cmake -DCMAKE_BUILD_TYPE=Release \
    -DNGINX_BIN=/usr/sbin/nginx \
    -DCMAKE_PREFIX_PATH=/install \
    -DCMAKE_INSTALL_PREFIX=/usr/lib/nginx/modules \
    -DCURL_LIBRARY=/usr/lib/libcurl.so.4 \
    ..
$ make -j2
$ make install
```

`otel_ngx_module`は動的モジュールであるため、`nginx.conf`ファイルでモジュールをインポートする必要がある。

```nginx
load_module modules/otel_ngx_module.so;
```

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/issues/199#issuecomment-1263857801
> - https://qiita.com/MarthaS/items/14da436b6bce5e7d7759#%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E3%81%AE%E3%83%93%E3%83%AB%E3%83%89
> - https://qiita.com/MarthaS/items/14da436b6bce5e7d7759#%E5%88%86%E6%95%A3%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%B3%E3%82%B0%E3%81%AE%E8%A8%AD%E5%AE%9A

<br>

### ディレクティブ

#### ▼ opentelemetry_config

モジュールの`toml`ファイルを設定する。

```nginx
http {
    opentelemetry_config /conf/otel-nginx.toml;
}
```

#### ▼ opentelemetry_operation_name

スパン名を設定する。

```nginx
server {

    location / {
        opentelemetry_operation_name $request_uri;
        proxy_pass $scheme://$host$request_uri;
    }
}
```

#### ▼ opentelemetry_propagate

トレースコンテキスト仕様として、W3C Trace Contextを設定する。

```nginx
server {

    opentelemetry_propagate;

    location / {
        proxy_pass $scheme://$host$request_uri;
    }
}
```

<br>

## otel_webserver_module

### otel_webserver_moduleとは

ApacheまたはNginxをOpenTelemetryで計装できるようにする。

otel_apache_moduleとngx_http_opentelemetry_moduleの両方を含んでいる。

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/otel-webserver-module

<br>

### otel_apache_module

OpenTelemetryコミュニティ製のモジュールであり、ApacheをOpenTelemetryで計装できるようにする。

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/otel-webserver-module#apache-webserver-module
> - https://opentelemetry.io/blog/2022/instrument-apache-httpd-server/

<br>

### ngx_http_opentelemetry_module

OpenTelemetryコミュニティ製のモジュールであり、NginxをOpenTelemetryで計装できるようにする。

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/otel-webserver-module#nginx-webserver-module

<br>

## ngx_otel_module

### ngx_otel_moduleとは

Nginxコミュニティ製のモジュールであり、NginxをOpenTelemetryで計装できるようにする。

執筆時点 (2024/03/10) では、セットアップの簡単さやパフォーマンスでOpenTelemetry製の`otel_ngx_module`に勝っているらしい。

> - https://github.com/nginxinc/nginx-otel?tab=readme-ov-file
> - https://github.com/nginxinc/nginx-otel/issues/42

<br>

### セットアップ

#### ▼ 未ビルドの場合

モジュールをインポートする前に、ビルドする必要がある。

なお、gRPCのビルドは`30`分ほどかかるため、gRPCを含むビルド済みのモジュールをインストールした方が良い。

```bash
$ git clone https://github.com/nginxinc/nginx-otel.git
$ cd nginx-otel
$ mkdir build
$ cd build
$ cmake -DNGX_OTEL_NGINX_BUILD_DIR=/path/to/configured/nginx/objs
$ make -j2
$ make install
```

`ngx_otel_module`は動的モジュールであるため、`nginx.conf`ファイルでモジュールをインポートする必要がある。

```nginx
load_module modules/ngx_otel_module.so;
```

> - https://github.com/nginxinc/nginx-otel

その他、alpineはMercurialからインストールすると良い。

> - https://hg.nginx.org/pkg-oss/file/tip/alpine

#### ▼ ビルド済みの場合

ビルド済みモジュールをインストールする。

Nginx (`1.25.3`) であればビルトインパッケージになっているため、ビルドが不要である。

```bash
# aptリポジトリから
$ apt install -y nginx-module-otel
```

```bash
# yumリポジトリから
$ yum install -y nginx-module-otel
```

> - https://github.com/nginxinc/nginx-otel?tab=readme-ov-file#installing-the-otel-module-from-packages
> - https://nginx.org/packages/mainline/alpine/

Alpineの場合は、執筆時点 (2024/03/13) でalpineリポジトリに`ngx_otel_module`がなく、Nginxのalpineリポジトリにパッケージがある。

`apk`コマンドはそのまま使うと常に最新をインストールしてしまう。

そこで、`wget`コマンドで一度ファイルを取得し、`apk`コマンドでそのファイルからモジュールをインストールする。

```bash
# nginxのalpineリポジトリから
$ wget -qO nginx-module-otel-<リビジョン>.apk https://nginx.org/packages/mainline/alpine/<バージョン>/main/x86_64/nginx-module-otel-<リビジョン>.apk
$ apk add --allow-untrusted nginx-module-otel-<バージョン>.apk
```

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/issues/302#issuecomment-1978230701
> - https://uepon.hatenadiary.com/entry/2023/03/20/165648

<br>

### ディレクティブ

#### ▼ otel_exporter

Exporterを設定する。

執筆時点 (2024/03/14) 時点では、gRPC用のエンドポイントしかありません。

```nginx
http {

    otel_exporter {
        endpoint foo-opentelemetry-collector.foo-namespace.svc.cluster.local:4317;
    }
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#otel_exporter

#### ▼ otel_service_name

```nginx
http {
    otel_service_name foo-service;
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#otel_service_name

#### ▼ otel_trace

分散トレースを有効化するかどうかを設定する。

```nginx
http {
    otel_trace on;
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#otel_trace

#### ▼ otel_trace_context

```nginx
http {
    # 受信したCarrierにトレースコンテキストがない場合はInjectし、あればExtractする
    otel_trace_context propagate;
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#otel_trace_context
> - https://raffaelemarcello.medium.com/nginx-plus-monitoring-and-tracing-harnessing-the-power-of-opentelemetry-65477020d864

#### ▼ otel_span_name

スパン名を設定する。

デフォルトでは、リクエストのLocation値がスパン名になる。

```nginx
http {

    location / {
        otel_span_name foo;
        proxy_pass $scheme://$host$request_uri;
    }
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#otel_span_name
> - https://www.nginx.co.jp/blog/tutorial-configure-opentelemetry-for-your-applications-using-nginx/

#### ▼ otel_span_attr

スパンの属性を設定する。

```nginx
http {

    location / {
        otel_span_attr otel.resource.deployment.environment <実行環境名>;
        proxy_pass $scheme://$host$request_uri;
    }
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#otel_span_attr

<br>

### 変数

#### ▼ `$otel_trace_id`

トレースIDが割り当てられている。

> - https://nginx.org/en/docs/ngx_otel_module.html#variables

#### ▼ `$otel_span_id`

現在のスパンIDが割り当てられている。

> - https://nginx.org/en/docs/ngx_otel_module.html#variables

#### ▼ `$otel_parent_id`

親スパンのスパンIDが割り当てられている。

> - https://nginx.org/en/docs/ngx_otel_module.html#variables

#### ▼ `$otel_parent_sampled`

受信したリクエストに親スパンが存在する場合、`1`になる。

Parent Basedなサンプリングを実行できる。

```nginx
http {
    otel_trace $otel_parent_sampled;
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#variables

<br>
