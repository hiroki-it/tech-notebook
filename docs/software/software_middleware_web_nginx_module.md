---
title: 【IT技術の知見】モジュール＠Nginx
description: モジュール＠Nginxの知見を記録しています。
---

# モジュール＠Nginx

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. gRPC

### gRPCパッケージ

#### ▼ gRPCパッケージとは

nginxモジュールがgRPCを使用できるようにする。

> - https://github.com/grpc/grpc

#### ▼ ビルド

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

## 02. OpenTelemetry

### opentelemetry-cppパッケージ

#### ▼ opentelemetry-cppパッケージとは

C++でNginxを計装できるようにする。

> - https://github.com/open-telemetry/opentelemetry-cpp

#### ▼ ビルド

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

### otel_ngx_moduleモジュール

#### ▼ otel_ngx_moduleモジュールとは

OpenTelemetryコミュニティ製で、NginxをOpenTelemetryで計装できるようにする。

gRPC Exporterを使用するために、gRPCパッケージが必要である。

また、NginxはC++で実装されているため、opentelemetry-cppパッケージが必要である。

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx

#### ▼ ビルド

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

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/issues/199#issuecomment-1263857801
> - https://qiita.com/MarthaS/items/14da436b6bce5e7d7759#%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E3%81%AE%E3%83%93%E3%83%AB%E3%83%89

<br>

### ngx_otel_moduleモジュール

#### ▼ ngx_otel_moduleモジュールとは

Nginxコミュニティ製で、NginxをOpenTelemetryで計装できるようにする。

#### ▼ ビルド

```bash
$ git clone https://github.com/nginxinc/nginx-otel.git
$ cd nginx-otel
$ mkdir build
$ cd build
$ cmake -DNGX_OTEL_NGINX_BUILD_DIR=/path/to/configured/nginx/objs ..
$ make
```

> - https://github.com/nginxinc/nginx-otel

<br>
