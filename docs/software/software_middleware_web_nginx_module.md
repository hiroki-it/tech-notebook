---
title: 【IT技術の知見】モジュール＠Nginx
description: モジュール＠Nginxの知見を記録しています。
---

# モジュール＠Nginx

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. モジュールの組み込み方

### Docker

マルチステージビルドを使用して、モジュールのビルド用のステージと実際に使用するステージを分ける。

```dockerfile
# -----------------
# builderステージ
# -----------------
FROM nginx:<バージョン>-alpine as builder

# ここでモジュールをビルドする

# -----------------
# mainステージ
# -----------------
FROM nginx:<バージョン>-alpine

# builderステージからビルド後のモジュールを取り出す
COPY --from=builder /usr/lib/nginx/modules/otel_ngx_module.so /usr/lib/nginx/modules/

...

```

> - https://github.com/ymtdzzz/nginx-otel-sample/blob/main/nginx/Dockerfile

<br>

## 02. gRPC

### gRPCパッケージ

#### ▼ gRPCパッケージとは

nginxモジュールがgRPCを使用できるようにする。

> - https://github.com/grpc/grpc

#### ▼ ビルド

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

## 03. OpenTelemetry

### httpd

OpenTelemetryコミュニティ製のモジュールであり、ApacheをOpenTelemetryで計装できるようにする。

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/httpd

<br>

### opentelemetry-cppパッケージ

#### ▼ opentelemetry-cppパッケージとは

C++でNginxを計装できるようにする。

> - https://github.com/open-telemetry/opentelemetry-cpp

#### ▼ ビルド

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

### otel_ngx_module

#### ▼ otel_ngx_moduleとは

OpenTelemetryコミュニティ製のモジュールであり、NginxをOpenTelemetryで計装できるようにする。

gRPC Exporterを使用するために、gRPCパッケージが必要である。

また、NginxはC++で実装されているため、opentelemetry-cppパッケージが必要である。

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx

#### ▼ ビルド

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

その後、`nginx.conf`ファイルでモジュールや設定ファイルをインポートする。

```nginx
load_module /path/to/otel_ngx_module.so;

http {
    # 設定ファイル
    opentelemetry_config /conf/otel-nginx.toml;
}

server {
    location / {
        # トレースコンテキスト仕様として、W3C Trace Contextを設定する
        opentelemetry_propagate

        # スパン名を設定する
        opentelemetry_operation_name $request_uri

        proxy_pass http://127.0.0.1:8080;
    }
}
```

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/issues/199#issuecomment-1263857801
> - https://qiita.com/MarthaS/items/14da436b6bce5e7d7759#%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E3%81%AE%E3%83%93%E3%83%AB%E3%83%89
> - https://qiita.com/MarthaS/items/14da436b6bce5e7d7759#%E5%88%86%E6%95%A3%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%B3%E3%82%B0%E3%81%AE%E8%A8%AD%E5%AE%9A

<br>

### otel_webserver_module

#### ▼ otel_webserver_moduleとは

ApacheまたはNginxをOpenTelemetryで計装できるようにする。

otel_apache_moduleとngx_http_opentelemetry_moduleの両方を含んでいる。

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/otel-webserver-module

#### ▼ otel_apache_module

OpenTelemetryコミュニティ製のモジュールであり、ApacheをOpenTelemetryで計装できるようにする。

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/otel-webserver-module#apache-webserver-module
> - https://opentelemetry.io/blog/2022/instrument-apache-httpd-server/

#### ▼ ngx_http_opentelemetry_module

OpenTelemetryコミュニティ製のモジュールであり、NginxをOpenTelemetryで計装できるようにする。

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/otel-webserver-module#nginx-webserver-module

<br>

### ngx_otel_module

#### ▼ ngx_otel_moduleとは

Nginxコミュニティ製のモジュールであり、NginxをOpenTelemetryで計装できるようにする。

#### ▼ ビルド

モジュールをインポートする前に、ビルドする必要がある。

```bash
$ git clone https://github.com/nginxinc/nginx-otel.git
$ cd nginx-otel
$ mkdir build
$ cd build
$ cmake -DNGX_OTEL_NGINX_BUILD_DIR=/path/to/configured/nginx/objs
$ make -j2
$ make install
```

その後、`nginx.conf`ファイルでモジュールをインポートする。

```nginx
load_module /path/to/ngx_otel_module.so;
```

> - https://github.com/nginxinc/nginx-otel

<br>
