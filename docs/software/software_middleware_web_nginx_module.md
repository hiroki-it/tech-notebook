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

### grpcモジュール

#### ▼ grpcモジュールとは

NginxがgRPCを使えるようにする。

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

<br>

## 02. OpenTelemetry

### opentelemetry-cppモジュール

#### ▼ opentelemetry-cppモジュールとは

記入中...

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

<br>

### opentelemetry-cpp-contribモジュール

#### ▼ opentelemetry-cpp-contribモジュールとは

記入中...

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

<br>
