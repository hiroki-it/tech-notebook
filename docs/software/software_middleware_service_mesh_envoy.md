---
title: 【IT技術の知見】Envoy＠サービスメッシュ系ミドルウェア
description: Envoy＠サービスメッシュ系ミドルウェアの知見を記録しています。
---

# Envoy＠サービスメッシュ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Envoyの仕組み

### アーキテクチャ

![envoy_structure](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/envoy_structure.png)


Envoyは、コントロールプレーンに相当するxDSサーバーと、データプレーンに相当するプロキシコンテナから構成される。Envoyには静的/動的な設定がある。静的な設定は、Envoyの起動時に適用される。一方で動的な設定は、xDSサーバーによってEnvoyの実行時に初めて適用される。インバウンド通信を受信したプロキシコンテナは、ルーティングに必要な情報をxDSサーバーに問い合わせ、返却された情報に基づいてルーティングを実行する。

> ℹ️ 参考：
>
> - https://qiita.com/kitauji/items/a2a7b583ed3f5b4cc47e
> - https://i-beam.org/2019/03/13/envoy-xds-server/
> - https://github.com/salrashid123/envoy_discovery#prerequsites

<br>

## 01-02. コントロールプレーン

### コントロールプレーンとは

コントロールプレーンは、データプレーンのEnvoyを管理する。サービスディスカバリーのためのAPI（XDS-API）を持つ。

<br>

### XDS-API

#### ▼ XDS-APIとは

XDS-APIは、EnvoyからgRPCのコールを受信し、動的な設定を返却するAPIを持つサーバー。主要なサーバーの一覧を示す。


| サービスディスカバリー名    |  説明                                                                         | 
|-------------------------|------------------------------------------------------------------------------|
| CDS：Cluster Discovery Service    | Envoyの実行時に、ルーティング先のClusterの設定を動的に検出できるようにする。|
| EDS：Endpoint Discovery Service    | Envoyの実行時に、ルーティング先のClusterに含まれるメンバーを動的に検出できるようにする。|     
| LDS：Listener Discovery Service    | Envoyの実行時に、リスナーの設定を動的に検出できるようにする。|     
| RDS：Route Discovery Service    | Envoyの実行時に、ルーティングの設定を動的に検出できるようにする。|     
| SDS：Secret Discovery Service    | Envoyの実行時に、リスナーの暗号化の設定を動的に検出できるようにする。|     
| VHDS：Virtual Host Discovery Service    | Envoyの実行時に、Cluster内メンバーのルーティングの設定を動的に検出できるようにする。|     
| ...                                    | ...                                                         |


> ℹ️ 参考：
>
> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/dynamic_configuration
> - https://www.netstars.co.jp/kubestarblog/k8s-10/
> - https://skyao.io/learning-envoy/xds/


<br>

## 01-03. データプレーン

### データプレーンとは

データプレーンでは、Envoyが稼働し、通信を宛先にルーティングする。Envoyは、コントロールプレーンのXDS-APIに定期的にリモートプロシージャーコールを実行し、返却された宛先情報を動的に設定する。Envoyが組み込まれたサービスメッシュツール（例：Istio）では、Envoyのコントロールプレーンへのリモートプロシージャーコール処理が、専用のエージェント（例：```pilot-agent```）に切り分けられている。

> ℹ️ 参考：https://skyao.io/learning-envoy/architecture/concept/#%E8%AF%B7%E6%B1%82%E8%BD%AC%E5%8F%91%E6%A6%82%E5%BF%B5

![envoy_data-plane_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/envoy_data-plane_architecture.png)

<br>

### リスナー

#### ▼ リスナーとは

リスナーでは、Envoyに対する通信を待ち受ける。

#### ▼ リスナーの静的な登録

```envoy.yaml```ファイルにて、```listeners```キーを設定することにより、Envoyに静的にリスナー値を静的に設定できる。

> ℹ️ 参考：
> 
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/overview/examples#static
> - https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#listeners

```yaml
static_resources:
  # リスナー
  listeners:
    - name: listener_0
    - address:
        socket_address:
          address: 127.0.0.1
          port_value: 10000
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                stat_prefix: ingress_http
                codec_type: AUTO
                http_filters:
                  - name: envoy.filters.http.router
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router
                route_config:
                  name: local_route
                  virtual_hosts:
                    - name: 50001
                      domains:
                        - foo-service.foo-namespace.svc.cluster.local
                      # ルート
                      routes:
                        - match:
                            # ホストベースルーティング
                            path: /*
                          route:
                            # クラスター（ここではKubernetesのService）
                            cluster: foo-virtual-service.foo-namespace
                    - name: 50002
                      domains:
                        - bar-service.bar-namespace.svc.cluster.local
                      routes:
                        - match:
                            path: /*
                          route:
                            cluster: bar-virtual-service.bar-namespace
                    - name: 50003
                      domains:
                        - baz-service.baz-namespace.svc.cluster.local
                      routes:
                        - match:
                            path: /*
                          route:
                            cluster: baz-virtual-service.baz-namespace
```

#### ▼ リスナーの動的な登録

Envoyは、起動時にコントロールプレーンのLDS-APIにリモートプロシージャーコールを実行し、宛先のリスナー値を取得する。また、Envoyは宛先のリスナー値を自身に動的に設定する。

> ℹ️ 参考：
> 
> - https://github.com/envoyproxy/envoy/blob/main/api/envoy/service/listener/v3/lds.proto#L23-L42
> - https://github.com/envoyproxy/envoy/blob/main/source/common/config/type_to_endpoint.cc#L43-L87

```protobuf

...

service ListenerDiscoveryService {
  option (envoy.annotations.resource).type = "envoy.config.listener.v3.Listener";
  
  ...

  // リモートプロシージャーコール
  rpc FetchListeners(discovery.v3.DiscoveryRequest) returns (discovery.v3.DiscoveryResponse) {
    option (google.api.http).post = "/v3/discovery:listeners";
    option (google.api.http).body = "*";
  }
}

...

```

<br>

### ルーター

#### ▼ ルーターとは

ルーターでは、リスナーで処理した通信を受け取り、特定のクラスターにルーティングする。

#### ▼ ルーター値の静的な登録

```static_resources.listeners```キー配下で、リスナーと合わせて設定する。


> ℹ️ 参考：
>
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/overview/examples#static
> - https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#listeners


#### ▼ ルーター値の動的な登録

Envoyは、起動時にコントロールプレーンのRDS-APIにリモートプロシージャーコールを実行し、宛先のルート値を取得する。また、Envoyは宛先のルート値を自身に動的に設定する。

> ℹ️ 参考：
> 
> - https://github.com/envoyproxy/envoy/blob/main/api/envoy/service/route/v3/rds.proto#L22-L42
> - https://github.com/envoyproxy/envoy/blob/main/source/common/config/type_to_endpoint.cc#L43-L87


```protobuf

...

service RouteDiscoveryService {
  option (envoy.annotations.resource).type = "envoy.config.route.v3.RouteConfiguration";
  
  ...

  // リモートプロシージャーコール
  rpc FetchRoutes(discovery.v3.DiscoveryRequest) returns (discovery.v3.DiscoveryResponse) {
    option (google.api.http).post = "/v3/discovery:routes";
    option (google.api.http).body = "*";
  }
}

...

```

<br>


### クラスター

#### ▼ クラスターとは

クラスターでは、ルーターからルーティングされた通信を受け取り、いずれかのエンドポイントにロードバランシングする。

#### ▼ クラスター値の静的な登録

```envoy.yaml```ファイルにて、```clusters```キーを設定することにより、Envoyに静的にクラスター値を静的に設定できる。

> ℹ️ 参考：
> 
> - https://skyao.io/learning-envoy/architecture/concept/cluster.html
> - https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#clusters

```yaml
static_resources:
  # クラスター
  clusters:
    # クラスター（ここではKubernetesのService）
    - name: "outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local"
      connect_timeout: 0.25s
      type: STATIC
      lb_policy: ROUND_ROBIN
      load_assignment:
        cluster_name: "outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local"
        # エンドポイント
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      # エンドポイント（ここではPod）の宛先情報
                      address: 10.0.0.1
                      port_value: 80
              - endpoint:
                  address:
                    socket_address:
                      address: 10.0.0.2
                      port_value: 80
    - name: "outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local"
      connect_timeout: 0.25s
      type: STATIC
      lb_policy: ROUND_ROBIN
      load_assignment:
        cluster_name: "outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local"
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: 11.0.0.1
                      port_value: 80
              - endpoint:
                  address:
                    socket_address:
                      address: 11.0.0.2
                      port_value: 80
    - name: "outbound|50003|v1|baz-service.baz-namespace.svc.cluster.local"
      connect_timeout: 0.25s
      type: STATIC
      lb_policy: ROUND_ROBIN
      load_assignment:
        cluster_name: "outbound|50003|v1|baz-service.baz-namespace.svc.cluster.local"
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: 12.0.0.1
                      port_value: 80
              - endpoint:
                  address:
                    socket_address:
                      address: 12.0.0.2
                      port_value: 80
```

#### ▼ クラスター値の動的な登録

Envoyは、起動時にコントロールプレーンのCDS-APIにリモートプロシージャーコールを実行し、宛先のクラスター値を取得する。また、Envoyは宛先のクラスター設定を自身に動的に設定する。

> ℹ️ 参考：
> 
> - https://github.com/envoyproxy/envoy/blob/main/api/envoy/service/cluster/v3/cds.proto#L22-L38
> - https://github.com/envoyproxy/envoy/blob/main/source/common/config/type_to_endpoint.cc#L43-L87


```protobuf

...

service ClusterDiscoveryService {
  option (envoy.annotations.resource).type = "envoy.config.cluster.v3.Cluster";
  
  ...

  // リモートプロシージャーコール
  rpc FetchClusters(discovery.v3.DiscoveryRequest) returns (discovery.v3.DiscoveryResponse) {
    option (google.api.http).post = "/v3/discovery:clusters";
    option (google.api.http).body = "*";
  }
}

...

```

<br>

### エンドポイント

#### ▼ エンドポイントとは

エンドポイントでは、クラスターでロードバランシングされた通信を受け取り、IPアドレスとポート番号を指定して、宛先に送信する。

#### ▼ エンドポイント値の静的な登録

```static_resources.clusters```キー配下で、リスナーと合わせて設定する。


> ℹ️ 参考：
>
> - https://skyao.io/learning-envoy/architecture/concept/cluster.html
> - https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#clusters


#### ▼ エンドポイント値の動的な登録

Envoyは、起動時にコントロールプレーンのEDS-APIにリモートプロシージャーコールを実行し、宛先のエンドポイント値を取得する。また、Envoyはルーターに宛先のエンドポイント設定を自身に動的に設定する。

> ℹ️ 参考：https://github.com/envoyproxy/envoy/blob/main/api/envoy/service/endpoint/v3/eds.proto#L21-L40


```protobuf

...

service EndpointDiscoveryService {
option (envoy.annotations.resource).type = "envoy.config.endpoint.v3.ClusterLoadAssignment";
  
  ...

  // リモートプロシージャーコール
  rpc FetchEndpoints(discovery.v3.DiscoveryRequest) returns (discovery.v3.DiscoveryResponse) {
    option (google.api.http).post = "/v3/discovery:endpoints";
    option (google.api.http).body = "*";
  }
}

...

```


<br>

## 02. ユースケース

### リバースプロキシのミドルウェアとして

#### ▼ 構成

リバースプロキシのミドルウェアとして使用する場合、Envoyをパブリックネットワークに公開しさえすれば、パブリックネットワークからEnvoyを介して、後段のアプリケーションにアクセスできるようになる。

#### ▼ Pod内の場合

Istioは、マイクロサービスのリバースプロキシコンテナとして、Pod内に```istio-proxy```コンテナを注入する。Istioによって自動的に作成されるが、Istioリソースを使用しなくとも作成できる。マイクロサービスからネットワークに関する責務を分離することを目標としており、各マイクロサービスはリクエスト宛先のマイクロサービスのIPアドレスを知らなくとも、これをEnvoyが解決してくれる。

> ℹ️ 参考：
>
> - https://blog.linkode.co.jp/entry/2020/07/06/162915
> - https://openstandia.jp/oss_info/envoy/
> - https://speakerdeck.com/kurochan/ru-men-envoy?slide=33

<br>

#### ▼ Pod外の場合（フロントプロキシ）

フロントプロキシと呼ばれている。

> ℹ️ 参考：https://tech.uzabase.com/entry/2020/09/28/140046

<br>

### ロードバランサーのミドルウェアとして

調査中...

<br>

### フォワードプロキシのミドルウェアとして

調査中...

<br>

## 03. 分散トレースID

### Envoyによるトレーシング

Envoyは、分散トレースを作成できるように、自分自身を通過した通信にHTTPヘッダーやRPCヘッダーに分散トレースIDを割り当てる。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/observability/tracing#arch-overview-tracing-context-propagation

<br>

### HTTPヘッダーの場合

#### ▼ 標準ヘッダー

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers

| HTTPヘッダー名     | 説明                             |
| ------------------ | -------------------------------- |
| ```X-REQUEST-ID``` | トレースIDが割り当てられている。 |

#### ▼ zipkin系ヘッダー

Envoyは、Zipkinが使用するヘッダーを追加する。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers

| HTTPヘッダー名          | 説明                                                         |
| ----------------------- | ------------------------------------------------------------ |
| ```X-B3-SAMPLED```      |                                                              |
| ```X-B3-SPANID```       | スパンIDが割り当てられている。                               |
| ```X-B3-TRACEID```      | トレースIDが割り当てられている。                             |
| ```X-B3-PARENTSPANId``` | 親のスパンIDが割り当てられている。ルートスパンの場合、このヘッダーは追加されない。 |

#### ▼ AWS X-Ray系ヘッダー

Envoyは、AWS X-Rayが使用するヘッダーを追加する。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers

| HTTPヘッダー名        | 説明                             |
| --------------------- | -------------------------------- |
| ```X-AMZN-TRACE-ID``` | トレースIDが割り当てられている。 |

<br>

### RPCヘッダーの場合

#### ▼ 標準ヘッダー

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/trace/v3/opencensus.proto#enum-config-trace-v3-opencensusconfig-tracecontext

| RPCヘッダー名        | 説明                             |
| -------------------- | -------------------------------- |
| ```GRPC-TRACE-BIN``` | トレースIDが割り当てられている。 |

<br>
