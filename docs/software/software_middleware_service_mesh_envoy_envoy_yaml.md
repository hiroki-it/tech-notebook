---
title: 【IT技術の知見】envoy.yaml＠Envoy
description: envoy.yaml＠Envoyの知見を記録しています。
---

# envoy.yaml＠Envoy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### インストール

かなり大変なので、DockerfileやIstio経由でインストールすることが推奨。

ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/start/install

<br>

### Dockerfile

Dockerfileにて、独自の```envoy.yaml```ファイルを組み込む。拡張子は、```.yml```ではなく、```.yaml```とする。

ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/start/docker

```dockerfile
FROM envoyproxy/envoy:v1.20.1
COPY envoy.yaml /etc/envoy/envoy.yaml
RUN chmod go+r /etc/envoy/envoy.yaml
```

<br>

### Istio

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_kubernetes_custom_resource_istio_resource_definition.html

<br>

## 02. admin

### adminとは

ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/admin#admin

<br>

## 02-02. admin.address

### addressとは

<br>

### socket_address

#### ▼ protocol

管理ダッシュボードで受信するインバウンド通信のプロトコルを設定する。

```yaml
admin:
  address:
    socket_address:
      protocol: TCP
```

#### ▼ address

管理ダッシュボードで受信するインバウンド通信のIPアドレスを設定する。『```0.0.0.0```』とすると、全てのIPアドレスを指定できる。

```yaml
admin:
  address:
    socket_address:
      address: 0.0.0.0
```

#### ▼ port_value

管理ダッシュボードでインバウンド通信を待ち受けるポート番号を設定する。

```yaml
admin:
  address:
    socket_address:
      port_value: 9901
```

<br>

## 03. static_resources

### static_resourcesとは

固定値を設定する。

ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#static-resources

<br>

## 03-02. static_resources.listeners

### listenersとは

受信するインバウンド通信のリスナーを設定する。

ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#listeners

<br>

### address

#### ▼ protocol

受信するインバウンド通信のプロトコルを設定する。

```yaml
static_resources:
  listeners:
  - address:
      socket_address:
        protocol: TCP
```

#### ▼ address

受信するインバウンド通信の送信元IPアドレスを設定する。

```yaml
static_resources:
  listeners:
  - address:
      socket_address:
        address: 0.0.0.0
```

#### ▼ port_value

インバウンド通信を待ち受けるポート番号を設定する。


```yaml
static_resources:
  listeners:
  - address:
      socket_address:
        port_value: 80
```

<br>

### filter_chains.filters

#### ▼ name

特定のインバウンド通信を処理するフィルターを設定する。

ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/filter/filter

```yaml
static_resources:
  listeners:
  - filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
```

#### ▼ typed_config.access_log

Envoyのアクセスログの出力先を設定する。

```yaml
static_resources:
  listeners:
  - filter_chains:
    - filters:
      - typed_config:
          access_log:
            - name: envoy.access_loggers.stdout
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.access_loggers.stream.v3.StdoutAccessLog
```

#### ▼ typed_config.http_filters

ℹ️ 参考：

- https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/filters/http/router/v3/router.proto#envoy-v3-api-msg-extensions-filters-http-router-v3-router
- https://i-beam.org/2019/02/03/envoy-static-load-balancer/

```yaml
static_resources:
  listeners:
  - filter_chains:
    - filters:
      - typed_config:
          http_filters:
          - name: envoy.filters.http.router
```

#### ▼ typed_config.route_config

特定のルーティング先に関する処理を設定する。

| 項目                | 説明                                                         |
| ------------------- | ------------------------------------------------------------ |
| ```name```          | ルーティング名を設定する。                                   |
| ```virtual_hosts``` | ルーティング先を設定する。特に```domains```キーには、受信するインバウンド通信の```Host```ヘッダーの値を設定する。ちなみに```Host```ヘッダーには、インバウンド通信のルーティング先のドメイン名が割り当てられている。 |

ℹ️ 参考：

- https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/route/v3/route.proto
- https://blog.kamijin-fanta.info/2020/12/consul-with-envoy/

```yaml
static_resources:
  listeners:
  - filter_chains:
    - filters:
      - typed_config:
          route_config:
            name: foo_route
            virtual_hosts:
            - name: foo_service
              domains: ["*"]
              routes:
              - match:
                  prefix: "/"
                route:
                  cluster: foo_cluster
```

#### ▼ typed_config.stat_prefix

統計ダッシュボードのメトリクスの接頭辞を設定する。

ℹ️ 参考：

- https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/admin#stat-prefix
- https://i-beam.org/2019/02/03/envoy-static-load-balancer/

```yaml
static_resources:
  listeners:
  - filter_chains:
    - filters:
      - typed_config:
          stat_prefix: ingress_http
```

#### ▼ typed_config."@type"

```yaml
static_resources:
  listeners:
    - filter_chains:
      - filters:
        - typed_config:
            "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
```

<br>

### name

インバウンド通信を受信するリスナーの名前を設定する。

ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/listener/v3/listener.proto

```yaml
static_resources:
  listeners:
  - name: foo_listener
```

<br>

## 04. static_resources.clusters

### clustersとは

インバウンド通信のルーティング先のマイクロサービスをグループ化する。対象が1つであっても、```clusters```キーは必須である。

ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#clusters

<br>

### connect_timeout

タイムアウトまでの時間を設定する。

```yaml
static_resources:  
  clusters:
  - connect_timeout: 10s
```

<br>

### dns_lookup_family

```yaml
static_resources:  
  clusters:
  - dns_lookup_family: v4_only
```

<br>

### lb_policy

ルーティングのアルゴリズムを設定する。

```yaml
static_resources:  
  clusters:
  - lb_policy: round_robin
```

<br>

### load_assignment

#### ▼ endpoints

ルーティング先のIPアドレスとポート番号のリストを設定する。

ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/filters/http/router/v3/router.proto#envoy-v3-api-msg-extensions-filters-http-router-v3-router

```yaml
static_resources:  
  clusters:
  - load_assignment:
      endpoints:
        - lb_endpoints:
          - endpoint:
              address: 192.168.0.1
              port_value: 80
          - endpoint:
              address: 192.168.0.1
              port_value: 81
          - endpoint:
              address: bar-service
              port_value: 82
```

#### ▼ cluster_name

ルーティング先のグループの名前を設定する。

```yaml
static_resources:  
  clusters:
  - load_assignment:
      cluster_name: foo_cluster
```

<br>

### name

ルーティング先のグループの名前を設定する。

```yaml
static_resources:  
  clusters:
  - name: foo_cluster
```

<br>

### transport_socket

#### ▼ name

ルーティング時に使用するソケット名を設定する。

```yaml
static_resources:  
  clusters:
  - transport_socket:
      name: envoy.transport_sockets.tls
```

#### ▼ typed_config

```yaml
static_resources:  
  clusters:
  - transport_socket:
      typed_config:
        "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.UpstreamTlsContext
        sni: www.envoyproxy.io
```

<br>

### type

サービスディスカバリーの種類を設定する。ルーティング先のアドレスをIPアドレスではなくドメイン名で指定する場合、必須である。

ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/service_discovery#arch-overview-service-discovery-types

```yaml
static_resources:  
  clusters:
  - type: logical_dns
```

