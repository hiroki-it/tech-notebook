---
title: 【知見を記録するサイト】envoy.yaml＠Envoy
description: envoy.yaml＠Envoyの知見をまとめました．
---

# envoy.yaml＠Envoy

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Envoyの仕組み

### 構造

Envoyは，コントロールプレーンとしてのxDSサーバーと，データプレーンとしてのプロキシコンテナから構成される．Envoyには静的/動的な設定がある．静的な設定は，Envoyの起動時に適用される．一方で動的な設定は，xDSサーバーによってEnvoyの実行時に初めて適用される．インバウンド通信を受信したプロキシコンテナは，ルーティングに必要な情報をxDSサーバーに問い合わせ，返却された情報に基づいてルーティングを実行する．

![envoy_structure](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/envoy_structure.png)

参考：

- https://qiita.com/kitauji/items/a2a7b583ed3f5b4cc47e
- https://i-beam.org/2019/03/13/envoy-xds-server/
- https://github.com/salrashid123/envoy_discovery#prerequsites

<br>

### xDSサーバー

動的な設定に関する情報を返却するAPIを持つサーバー．主要なサーバーの一覧を示す．

参考：

- https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/dynamic_configuration
- https://www.netstars.co.jp/kubestarblog/k8s-10/

| サーバー名                           | 説明                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| CDS：Cluster Discovery Service       | Envoyの実行時に，ルーティング先のクラスターの設定を動的に検出できるようにする． |
| EDS：Endpoint Discovery Service      | Envoyの実行時に，ルーティング先のクラスターに含まれるメンバーを動的に検出できるようにする． |
| LDS：Listener Discovery Service      | Envoyの実行時に，リスナーの設定を動的に検出できるようにする． |
| RDS：Route Discovery Service         | Envoyの実行時に，ルーティングの設定を動的に検出できるようにする． |
| SDS：Secret Discovery Service        | Envoyの実行時に，リスナーの暗号化の設定を動的に検出できるようにする． |
| VHDS：Virtual Host Discovery Service | Envoyの実行時に，クラスター内メンバーのルーティングの設定を動的に検出できるようにする． |

<br>

## 01-02. ユースケース

### リバースプロキシサーバーとして

#### ・Pod内の場合

Istioは，マイクロサービスのリバースプロキシコンテナとして，Pod内にistio-proxyコンテナを構築する．Istioによって自動的に構築されるが，Istioを用いなくとも構築できる．マイクロサービスからネットワークに関する責務を分離することを目標としており，各マイクロサービスはリクエスト送信先のマイクロサービスのIPアドレスを知らなくとも，これをEnvoyが解決してくれる．

参考：

- https://blog.linkode.co.jp/entry/2020/07/06/162915
- https://openstandia.jp/oss_info/envoy/
- https://speakerdeck.com/kurochan/ru-men-envoy?slide=33

<br>

#### ・Pod外の場合（フロントプロキシ）

フロントプロキシ機能と呼ばれている．

参考：https://tech.uzabase.com/entry/2020/09/28/140046

<br>

### ロードバランサーのミドルウェアとして

<br>

### フォワードプロキシサーバーとして

<br>

## 02. セットアップ

### インストール

かなり大変なので，DockerfileやIstio経由でインストールすることが推奨．

参考：https://www.envoyproxy.io/docs/envoy/latest/start/install

<br>

### Dockerfile

Dockerfileにて，独自の```envoy.yaml```ファイルを組み込む．拡張子は，```.yml```ではなく，```.yaml```とする．

参考：https://www.envoyproxy.io/docs/envoy/latest/start/docker

```dockerfile
FROM envoyproxy/envoy:v1.20.1
COPY envoy.yaml /etc/envoy/envoy.yaml
RUN chmod go+r /etc/envoy/envoy.yaml
```

<br>

### Istio

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_container_istio_manifest_yml.html

<br>

## 03. admin

### adminとは

参考：https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/admin#admin

<br>

## 03-02. admin.address

### addressとは

<br>

### socket_address

#### ・protocol

管理ダッシュボードで受信するインバウンド通信のプロトコルを設定する．

```yaml
admin:
  address:
    socket_address:
      protocol: TCP
```

#### ・address

管理ダッシュボードで受信するインバウンド通信のIPアドレスを設定する．『```0.0.0.0```』とすると，全てのIPアドレスを指定できる．

```yaml
admin:
  address:
    socket_address:
      address: 0.0.0.0
```

#### ・port_value

管理ダッシュボードでインバウンド通信を待ち受けるポート番号を設定する．

```yaml
admin:
  address:
    socket_address:
      port_value: 9901
```

<br>

## 04. static_resources

### static_resourcesとは

固定値を設定する．

参考：https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#static-resources

<br>

## 04-02. static_resources.listeners

### listenersとは

受信するインバウンド通信のリスナーを設定する．

参考：https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#listeners

<br>

### address

#### ・protocol

受信するインバウンド通信のプロトコルを設定する．

```yaml
static_resources:
  listeners:
  - address:
      socket_address:
        protocol: TCP
```

#### ・address

受信するインバウンド通信の送信元IPアドレスを設定する．

```yaml
static_resources:
  listeners:
  - address:
      socket_address:
        address: 0.0.0.0
```

#### ・port_value

インバウンド通信を待ち受けるポート番号を設定する．


```yaml
static_resources:
  listeners:
  - address:
      socket_address:
        port_value: 80
```

<br>

### filter_chains.filters

#### ・name

特定のインバウンド通信を処理するフィルターを設定する．

参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/filter/filter

```yaml
static_resources:
  listeners:
  - filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
```

#### ・typed_config.access_log

Envoyのアクセスログの出力先を設定する．

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

#### ・typed_config.http_filters

参考：

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

#### ・typed_config.route_config

特定のルーティング先に関する処理を設定する．

| 項目                | 説明                                                         |
| ------------------- | ------------------------------------------------------------ |
| ```name```          | ルーティング名を設定する．                                   |
| ```virtual_hosts``` | ルーティング先を設定する．特に```domains```キーには，受信するインバウンド通信の```Host```ヘッダーの値を設定する．ちなみに```Host```ヘッダーには，インバウンド通信のルーティング先のドメイン名が割り当てられている． |

参考：

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

#### ・typed_config.stat_prefix

統計ダッシュボードのメトリクスの接頭辞を設定する．

参考：

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

#### ・typed_config."@type"

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

インバウンド通信を受信するリスナーの名前を設定する．

参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/listener/v3/listener.proto

```yaml
static_resources:
  listeners:
  - name: foo_listener
```

<br>

## 05. static_resources.clusters

### clustersとは

インバウンド通信のルーティング先のマイクロサービスをグループ化する．対象が一つであっても，```clusters```キーは必須である．

参考：https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#clusters

<br>

### connect_timeout

タイムアウトまでの時間を設定する．

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

ルーティングのアルゴリズムを設定する．

```yaml
static_resources:  
  clusters:
  - lb_policy: round_robin
```

<br>

### load_assignment

#### ・endpoints

ルーティング先のIPアドレスとポート番号のリストを設定する．

参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/filters/http/router/v3/router.proto#envoy-v3-api-msg-extensions-filters-http-router-v3-router

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

#### ・cluster_name

ルーティング先のグループの名前を設定する．

```yaml
static_resources:  
  clusters:
  - load_assignment:
      cluster_name: foo_cluster
```

<br>

### name

ルーティング先のグループの名前を設定する．

```yaml
static_resources:  
  clusters:
  - name: foo_cluster
```

<br>

### transport_socket

#### ・name

ルーティング時に用いるソケット名を設定する．

```yaml
static_resources:  
  clusters:
  - transport_socket:
      name: envoy.transport_sockets.tls
```

#### ・typed_config

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

サービスディスカバリーの種類を設定する．ルーティング先のアドレスをIPアドレスではなくドメイン名で指定する場合，必須である．

参考：https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/service_discovery#arch-overview-service-discovery-types

```yaml
static_resources:  
  clusters:
  - type: logical_dns
```

