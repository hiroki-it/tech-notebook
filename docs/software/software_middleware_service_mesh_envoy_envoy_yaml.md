---
title: 【IT技術の知見】envoy.yaml＠Envoy
description: envoy.yaml＠Envoyの知見を記録しています。
---

# envoy.yaml＠Envoy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. セットアップ

### インストール

かなり大変なため、DockerfileやIstio経由でインストールすることが推奨。



> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/start/install

<br>

### 手動セットアップの場合

#### ▼ Dockerfile

Dockerfileにて、独自の```/etc/envoy/envoy.yaml```ファイルを組み込む。

拡張子は、```.yml```ではなく、```.yaml```とする。



> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/start/docker

```dockerfile
FROM envoyproxy/envoy:v1.20.1
COPY envoy.yaml /etc/envoy/envoy.yaml
RUN chmod go+r /etc/envoy/envoy.yaml
```

<br>

### 自動セットアップの場合

#### ▼ Istio

Istioは、Envoyをベースとしたリバースプロキシを自動的に挿入する。この場合、```/etc/istio/proxy/envoy-rev0.json```ファイルを設定ファイルとして扱う。

> ℹ️ 参考：
> 
> - https://istio.io/latest/docs/ops/deployment/architecture/#envoy
> - https://cloud.tencent.com/developer/article/1701214

<br>

### 設定ファイルに関する補足情報

#### ▼ ドキュメントの探し方

執筆時点（2022/11/16）では、設定ファイルのドキュメントの記載が不十分である。

設定ファイルのYAMLファイルのデータ型や階層は、APIのJSON形式と同じ構成になっている。

そのため、設定ファイルのドキュメントで探す代わりに、APIのドキュメントを確認した方が良い。



> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/api

#### ▼ 設計ポリシーについて

Envoyでは、YAMLファイルのキー名がスネークケースになっている。

一方で、サービスメッシュツール（例：Istio）では、ローワーキャメルケースを使用している。



> ℹ️ 参考：https://docs.solo.io/gloo-edge/master/guides/security/rate_limiting/envoy/

<br>

## 02. admin

### adminとは

調査中...

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/admin#admin

<br>

### access_log_path

#### ▼ access_log_pathとは

Envoyのログの出力先を設定する。



**＊実装例＊**

```yaml
admin:
  access_log_path: /dev/null
```

<br>

## 02-02. admin.address

### addressとは

調査中...

<br>


### socket_address

#### ▼ protocol

管理ダッシュボードで受信するインバウンド通信のプロトコルを設定する。



**＊実装例＊**

```yaml
admin:
  address:
    socket_address:
      protocol: TCP
```

#### ▼ address

受信したパケットのうちで、宛先IPアドレスでフィルタリングできるようにする。

『```0.0.0.0```』とすると、任意の宛先IPアドレスを指定するパケットをフィルタリングできるようになる。



**＊実装例＊**

```yaml
admin:
  address:
    socket_address:
      address: 0.0.0.0
```

#### ▼ port_value

管理ダッシュボードでインバウンド通信を待ち受けるポート番号を設定する。



**＊実装例＊**

```yaml
admin:
  address:
    socket_address:
      port_value: 9901
```

<br>


## 03. static_resources

### static_resourcesとは

静的な値を設定する。

執筆時点（2022/11/12）では、```listeners```キーと```clusters```キーのみを設定できる。



> ℹ️ 参考：
> 
> - https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#static-resources
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/overview/bootstrap#config-overview-bootstrap

<br>

## 03-02. listeners

### listenersとは

受信するインバウンド通信のリスナーを設定する。



> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#listeners

<br>

### address

#### ▼ protocol

受信するインバウンド通信のプロトコルを設定する。



**＊実装例＊**

```yaml
static_resources:
  listeners:
    - address:
        socket_address:
          protocol: TCP
```

#### ▼ address

受信したパケットのうちで、宛先IPアドレスでフィルタリングできるようにする。

『```0.0.0.0```』とすると、任意の宛先IPアドレスを指定するパケットをフィルタリングできるようになる。



**＊実装例＊**

```yaml
static_resources:
  listeners:
    - address:
        socket_address:
          address: 0.0.0.0
```

#### ▼ port_value

受信したパケットのうちで、宛先ポート番号でフィルタリングできるようにする。



**＊実装例＊**

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



> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/filter/filter


**＊実装例＊**

```yaml
static_resources:
  listeners:
    - filter_chains:
      - filters:
        - name: envoy.filters.network.http_connection_manager
```

#### ▼ typed_config.access_log

Envoyのアクセスログの出力方法を設定する。



> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/accesslog/v3/accesslog.proto

**＊実装例＊**


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

調査中...

> ℹ️ 参考：
>
> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/filters/http/router/v3/router.proto#envoy-v3-api-msg-extensions-filters-http-router-v3-router
> - https://i-beam.org/2019/02/03/envoy-static-load-balancer/

**＊実装例＊**


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



| 項目                | 説明                                                                                                                                        |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| ```name```          | ルート名を設定する。                                                                                                                               |
| ```virtual_hosts``` | ルーティング先を設定する。特に```domains```キーには、受信するインバウンド通信の```Host```ヘッダーの値を設定する。ちなみに```Host```ヘッダーには、インバウンド通信のルーティング先のドメイン名が割り当てられている。 |

> ℹ️ 参考：
>
> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/route/v3/route.proto
> - https://blog.kamijin-fanta.info/2020/12/consul-with-envoy/

**＊実装例＊**

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
                  # ホストベース
                  domains: 
                    - "*"
                  routes:
                  - match:
                      # パスベース
                      prefix: "/"
                    route:
                      cluster: foo_cluster
```

#### ▼ typed_config.stat_prefix

統計ダッシュボードのメトリクスの接頭辞を設定する。



> ℹ️ 参考：
>
> - https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/admin#stat-prefix
> - https://i-beam.org/2019/02/03/envoy-static-load-balancer/

**＊実装例＊**

```yaml
static_resources:
  listeners:
    - filter_chains:
      - filters:
        - typed_config:
            stat_prefix: ingress_http
```

#### ▼ typed_config."@type"

使用する拡張機能名を設定する。

拡張機能名を指定することで、その拡張機能の設定を定義できるようになる。

これは、Envoy特有の機能ではなく、gRPCの機能である。

RPCでは、JSON内のデータのデータ型を指定するために使用する。



> ℹ️ 参考：
> 
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/overview/extension#config-overview-extension-configuration
> - https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#any

**＊実装例＊**

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

#### ▼ nameとは

インバウンド通信を受信するリスナーの名前を設定する。



> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/listener/v3/listener.proto

**＊実装例＊**

```yaml
static_resources:
  listeners:
    - name: foo_listener
```

<br>

## 03-03. clusters

### clustersとは

インバウンド通信のルーティング先のマイクロサービスをグループ化する。

対象が```1```個であっても、```clusters```キーは必須である。



> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#clusters

<br>

### circuit_breakers

#### ▼ circuit_breakersとは

ルーティング先の同時接続数の制限数を設定する。

制限を超過した場合、宛先へのルーティングが停止し、直近の成功時の処理結果を返信する（サーキットブレイカー）。



> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/configuration/upstream/cluster_manager/cluster_circuit_breakers.html?highlight=circuit_breakers

**＊実装例＊**

```yaml
static_resources:  
  clusters:
    - circuit_breakers:
        thresholds:
          - "priority": "DEFAULT",
            "max_connections": 100000,
            "max_pending_requests": 100000,
            "max_requests": 100000
          - "priority": "HIGH",
            "max_connections": 100000,
            "max_pending_requests": 100000,
            "max_requests": 100000
```

<br>

### connect_timeout

#### ▼ connect_timeoutとは

ルーティング時のタイムアウト時間を設定する。



**＊実装例＊**

```yaml
static_resources:  
  clusters:
    - connect_timeout: 10s
```

<br>

### dns_lookup_family

#### ▼ dns_lookup_familyとは

調査中...

**＊実装例＊**

```yaml
static_resources:  
  clusters:
    - dns_lookup_family: v4_only
```

<br>

### lb_policy

#### ▼ lb_policyとは

ルーティングのアルゴリズムを設定する。



**＊実装例＊**

```yaml
static_resources:  
  clusters:
    - lb_policy: round_robin
```

<br>

### load_assignment

#### ▼ endpoints

ルーティング先のIPアドレスとポート番号のリストを設定する。



> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/filters/http/router/v3/router.proto#envoy-v3-api-msg-extensions-filters-http-router-v3-router

**＊実装例＊**

```yaml
static_resources:  
  clusters:
    - load_assignment:
        endpoints:
          - lb_endpoints:
            - endpoint:
                address: 192.168.0.1 # クラスターのIPアドレス
                port_value: 80
            - endpoint:
                address: 192.168.0.1
                port_value: 81
            - endpoint:
                address: foo-service.foo-namespace.svc.cluster.local # クラスター（ここではKubernetesのService）の完全修飾ドメイン名
                port_value: 82
```

#### ▼ cluster_name

ルーティング先のグループの名前を設定する。



**＊実装例＊**

```yaml
static_resources:  
  clusters:
    - load_assignment:
        cluster_name: foo_cluster
```

<br>

### name

#### ▼ nameとは

ルーティング先のグループの名前を設定する。



**＊実装例＊**

```yaml
static_resources:  
  clusters:
    - name: foo_cluster
```

<br>

### transport_socket

#### ▼ name

ルーティング時に使用するソケット名を設定する。



**＊実装例＊**

```yaml
static_resources:  
  clusters:
    - transport_socket:
        name: envoy.transport_sockets.tls
```

#### ▼ typed_config

インバウンド通信/アウトバウンド通信をHTTPSで送受信する場合に、証明書を設定する。



**＊実装例＊**

サービスメッシュツールを使用せずに、```envoy```コンテナを直接的に稼働させるとする。

また、静的な値を設定したとする。



> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/configuration/security/secret#example-one-static-resource

```yaml
static_resources:
  clusters:
    ...
    - connect_timeout: 0.25s
      load_assignment:
        cluster_name: local_service_tls
        transport_socket:
          name: envoy.transport_sockets.tls
          typed_config:
            "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.UpstreamTlsContext
            common_tls_context:
              # static_resources.secretsキーで定義したクライアント証明書を設定する。
              tls_certificate_sds_secret_configs:
                - name: client-cert

  listeners:
    ...
    - filter_chains:
        transport_socket:
          name: envoy.transport_sockets.tls
          typed_config:
            "@type": type.googleapis.com/envoy.extensions.transport_sockets.tls.v3.DownstreamTlsContext
            common_tls_context:
              # static_resources.secretsキーで定義したSSL証明書を設定する。
              tls_certificate_sds_secret_configs:
                - name: server-cert
              validation_context_sds_secret_config:
                name: validation_context

  secrets:
    ## SSL証明書
    - name: server-cert
      tls_certificate:
        certificate_chain:
          filename: certs/server-cert.pem
        private_key:
          filename: certs/server-key.pem
    # クライアント証明書
    - name: client-cert
      tls_certificate:
        certificate_chain:
          filename: certs/client-cert.pem
        private_key:
          filename: certs/client-key.pem
    - name: validation_context
      validation_context:
        trusted_ca:
          filename: certs/ca-cert.pem
        verify_certificate_hash:
          E0:F3:C8:CE:5E:2E:A3:05:F0:70:1F:F5:12:E3:6E:2E:97:92:82:84:A2:28:BC:F7:73:32:D3:39:30:A1:B6:FD
```


**＊実装例＊**

サービスメッシュツールを使用せずに、```envoy```コンテナを直接的に稼働させるとする。また、コントロールプレーンのSDS-APIから取得した動的な値を設定したとする。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/configuration/security/secret#example-two-sds-server

<br>

### type

#### ▼ typeとは

サービスディスカバリーの種類を設定する。

ルーティング先のアドレスをIPアドレスではなくドメイン名で指定する場合、必須である。



> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/service_discovery#arch-overview-service-discovery-types

**＊実装例＊**

```yaml
static_resources:  
  clusters:
    - type: logical_dns
```

<br>

## 04. dynamic_resources

### dynamic_resourcesとは

動的に宛先情報を設定する。



> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-dynamic-filesystem#dynamic-resources

<br>

### ads_config

#### ▼ ads_configとは

ADS-APIに関して設定する。EnvoyがADS-APIにリクエストを送信するように設定できる。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/configuration/overview/xds_api#aggregated-discovery-service

#### ▼ grpc_services

ADS-APIとして使用するクラスター名を設定する。クラスターとはgRPCを使用してパケットを送受信する。ADS-APIの宛先情報は、```static_resources.clusters```キー配下で設定しておく。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/core/v3/grpc_service.proto#envoy-v3-api-msg-config-core-v3-grpcservice-envoygrpc

**＊実装例＊**

サービスメッシュツールを使用せずに、```envoy```コンテナを直接的に稼働させるとする。



> ℹ️ 参考：
> 
> - https://github.com/salrashid123/envoy_control/blob/eaa30c1ec5d6bb7baa8ddc1a3a78d9125313cb6a/baseline.yaml#L9-L15
> - https://github.com/salrashid123/envoy_control/blob/eaa30c1ec5d6bb7baa8ddc1a3a78d9125313cb6a/baseline.yaml#L27-L40
> - https://github.com/salrashid123/envoy_discovery/blob/master/envoy_config.yaml#L39-L74
> - https://i-beam.org/2019/03/13/envoy-xds-server/

```yaml
dynamic_resources:
  ads_config:
    api_type: grpc
    grpc_services:
      - envoy_grpc:
          cluster_name: xds_cluster

# Envoyの識別子を設定する。
node:
  cluster: foo-cluster
  id: foo-id

static_resources:
  clusters:
    # XDS-APIをクラスターとする。
    - name: xds_cluster
      connect_timeout: 0.25s
      lb_policy: ROUND_ROBIN
      http2_protocol_options: {}
      load_assignment:
        cluster_name: xds_cluster
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    # XDS-APIの宛先情報
                    socket_address:
                      address: 127.0.0.1
                      port_value: 15010
    # 定義したXDS-APIのクラスターを指定する。
    - name: services_cluster
      type: EDS
      connect_timeout: 0.25s
      lb_policy: ROUND_ROBIN
      eds_cluster_config:
        eds_config:
          resource_api_version: V3
          api_config_source:
            api_type: GRPC
            transport_api_version: V3
            grpc_services:
              - envoy_grpc:
                  cluster_name: xds_cluster
```

**＊実装例＊**

Istioを使用して、```envoy```コンテナを稼働させるとする。

Kubernetesでは、YAMLファイルのキー名の設計ポリシーがローワーキャメルケースであることに注意する。



```yaml
dynamicResources:
  adsConfig:
    apiType: grpc
    grpcServices:
      - envoyGrpc:
          clusterName: xds-grpc

staticResources:
  clusters:
    - connectTimeout: 1s
      http2ProtocolOptions: {}
      name: xdsCluster
      type: static
      # xds-apiの宛先情報を設定する。
      loadAssignment:
        clusterName: xdsCluster
        endpoints:
          - lbEndpoints:
              - endpoint:
                  address:
                    pipe:
                      # ここではソケットファイルを指定している。
                      # envoyとxds-apiのプロセス間で、パケットを送受信する。
                      path: ./etc/istio/proxy/xds
```

#### ▼ set_node_on_first_message_only

調査中...

**＊実装例＊**

```yaml
dynamic_resources:
  ads_config:
    set_node_on_first_message_only: true
```

#### ▼ transport_api_version

調査中...

**＊実装例＊**

```yaml
dynamic_resources:
  ads_config:
    transport_api_version: V3
```

<br>

### cds_config

#### ▼ cds_configとは

CDS-APIに関して設定する。

#### ▼ path

```cds.yaml```ファイル（CDS-APIから取得した動的な宛先情報が設定されたファイル）を読み込む。

**＊実装例＊**

```yaml
dynamic_resources:
  cds_config:
    path: /var/lib/envoy/cds.yaml
```

<br>

### lds_config

#### ▼ lds_configとは

LDS-APIに関して設定する。

#### ▼ path

```lds.yaml```ファイル（LDS-APIから取得した動的な宛先情報が設定されたファイル）を読み込む。

**＊実装例＊**

```yaml
dynamic_resources:
  lds_config:
    path: /var/lib/envoy/lds.yaml
```

<br>
