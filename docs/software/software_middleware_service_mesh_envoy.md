---
title: 【IT技術の知見】Envoy＠サービスメッシュ系ミドルウェア
description: Envoy＠サービスメッシュ系ミドルウェアの知見を記録しています。
---

# Envoy＠サービスメッシュ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Envoyの仕組み

### アーキテクチャ

![envoy_structure](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_structure.png)

Envoyは、コントロールプレーンに相当するxDSサーバーと、データプレーンに相当するプロキシコンテナから構成される。

Envoyには静的/動的な設定がある。

静的な設定は、Envoyの起動時に適用される。

一方で動的な設定は、xDSサーバーによってEnvoyの実行時に初めて適用される。

Envoyは、xDSサーバーとの間で、リモートプロシージャーコールを双方向で起動時/定期的に実行し、取得した宛先情報を自身に登録する。

> - https://qiita.com/kitauji/items/a2a7b583ed3f5b4cc47e
> - https://i-beam.org/2019/03/13/envoy-xds-server/
> - https://github.com/salrashid123/envoy_discovery#prerequsites

<br>

### ホットリロード

Envoyは、通信を切断することなく、コントロールプレーンから取得した動的な設定を再読み込みできる。

ホットリロードでは、現在のプロセス (プライマリプロセス) を残したまま、新しいプロセス (セカンダリプロセス) を起動し、通信を段階的に移行する。

![envoy_hot-reload.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_hot-reload.png)

> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/hot_restart
> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/draining
> - https://blog.envoyproxy.io/envoy-hot-restart-1d16b14555b5

<br>

### ダブルプロキシ

コントロールプレーンを持たないリバースプロキシの場合、通信の送信元と宛先にいるリバースプロキシは独立している。

一方で、マイクロサービスにおけるEnvoyでは、Envoyのコントロールプレーンが通信の送信元と宛先の両方のリバースプロキシを一緒に管理する。

このようなリバースプロキシの配置方法をダブルプロキシといい、サイドカープロキシメッシュとして機能する。

> - https://www.envoyproxy.io/docs/envoy/latest/intro/deployment_types/double_proxy
> - https://www.envoyproxy.io/docs/envoy/latest/start/sandboxes/double-proxy#install-sandboxes-double-proxy
> - https://engineers.ntt.com/entry/2021/12/04/131157

<br>

## 01-02. コントロールプレーン

### コントロールプレーンとは

コントロールプレーンは、データプレーンのEnvoyを管理する。サービスディスカバリーのためのAPI (XDS-API) を持つ。

<br>

### XDS-API

#### ▼ XDS-APIとは

コントロールプレーンのXDS-APIは、Envoyからリモートプロシージャーコールを受信し、通信の宛先情報を返信するAPIを持つサーバー。主要なサーバーの一覧を示す。

> - https://skyao.io/learning-envoy/xds/

#### ▼ ADS-API：Aggregated XDS

単一のエンドポイントを提供し、適切な順番で各XDS-APIから宛先情報を取得できる。

各XDS-APIから宛先情報を取得しても良いが、ADS-APIで一括して取得することできる。

もしADS-APIで一括して取得しない場合、各XDS-APIから取得できる宛先情報のバージョンがバラバラになってしまい、Envoyの処理コンポーネント間で宛先情報のバージョンの競合が起こることがある。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/overview/xds_api#aggregated-discovery-service
> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/dynamic_configuration#aggregated-xds-ads
> - https://www.amazon.co.jp/dp/B09XN9RDY1
> - https://i-beam.org/2019/01/22/hello-envoy/
> - https://www.alibabacloud.com/blog/architecture-analysis-of-istio-the-most-popular-service-mesh-project_597010

#### ▼ CDS-API：Cluster Discovery Service

単一のエンドポイントを提供し、クラスター値を取得できる。

Envoyの実行時に、ルーティング先のClusterの設定を動的に検出可能にする。

> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/dynamic_configuration#cds
> - https://www.alibabacloud.com/blog/architecture-analysis-of-istio-the-most-popular-service-mesh-project_597010

#### ▼ EDS-API：Endpoint Discovery Service

単一のエンドポイントを提供し、エンドポイント値を取得できる。

Envoyの実行時に、ルーティング先のClusterに含まれるメンバーを動的に検出可能にする。

> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/dynamic_configuration#eds
> - https://www.alibabacloud.com/blog/architecture-analysis-of-istio-the-most-popular-service-mesh-project_597010

#### ▼ LDS-API：Listener Discovery Service

単一のエンドポイントを提供し、リスナー値を取得できる。

Envoyの実行時に、リスナーの設定を動的に検出可能にする。

> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/dynamic_configuration#lds
> - https://www.alibabacloud.com/blog/architecture-analysis-of-istio-the-most-popular-service-mesh-project_597010

#### ▼ RDS-API：Route Discovery Service

単一のエンドポイントを提供し、ルート値を取得できる。

Envoyの実行時に、ルーティングの設定を動的に検出可能にする。

> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/dynamic_configuration#rds
> - https://www.alibabacloud.com/blog/architecture-analysis-of-istio-the-most-popular-service-mesh-project_597010

#### ▼ SDS-API：Secret Discovery Service

単一のエンドポイントを提供し、証明書を取得できる。

Envoyの実行時に、リスナーの暗号化の設定を動的に検出可能にする。

> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/dynamic_configuration#sds
> - https://www.alibabacloud.com/blog/architecture-analysis-of-istio-the-most-popular-service-mesh-project_597010

<br>

### XDS-APIのエンドポイント

#### ▼ XDS-APIのエンドポイントとは

コントロールプレーンのXDS-APIにはエンドポイントがある。Envoyからリモートプロシージャーコールを受信し、通信の宛先情報を返信する。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/overview/xds_api#rest-endpoints

#### ▼ 実装

Envoyを使用するサービスディスカバリーツールのいくつか (例：Istio、Linkerd) では、コントロールプレーンに`go-control-plane`パッケージが使用されている。

> - https://github.com/envoyproxy/go-control-plane/blob/v0.11.0/pkg/resource/v3/resource.go#L34-L43
> - https://github.com/envoyproxy/go-control-plane/blob/v0.11.0/pkg/server/v3/gateway.go#L38-L98

```go
package resource

...

const (
	FetchEndpoints        = "/v3/discovery:endpoints"
	FetchClusters         = "/v3/discovery:clusters"
	FetchListeners        = "/v3/discovery:listeners"
	FetchRoutes           = "/v3/discovery:routes"
	FetchScopedRoutes     = "/v3/discovery:scoped-routes"
	FetchSecrets          = "/v3/discovery:secrets"
	FetchRuntimes         = "/v3/discovery:runtime"
	FetchExtensionConfigs = "/v3/discovery:extension_configs"
)

...

```

```go
package server

...

func (h *HTTPGateway) ServeHTTP(req *http.Request) ([]byte, int, error) {
	p := path.Clean(req.URL.Path)

	typeURL := ""
	switch p {
	case resource.FetchEndpoints:
		typeURL = resource.EndpointType
	case resource.FetchClusters:
		typeURL = resource.ClusterType
	case resource.FetchListeners:
		typeURL = resource.ListenerType
	case resource.FetchRoutes:
		typeURL = resource.RouteType
	case resource.FetchScopedRoutes:
		typeURL = resource.ScopedRouteType
	case resource.FetchSecrets:
		typeURL = resource.SecretType
	case resource.FetchRuntimes:
		typeURL = resource.RuntimeType
	case resource.FetchExtensionConfigs:
		typeURL = resource.ExtensionConfigType
	default:
		return nil, http.StatusNotFound, fmt.Errorf("no endpoint")
	}

	...

	out.TypeUrl = typeURL

	...

	res, err := h.Server.Fetch(req.Context(), out)

	...

}
```

<br>

## 01-03. データプレーン

### データプレーンとは

#### ▼ データプレーンの仕組み

![envoy_data-plane_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_data-plane_architecture.png)

データプレーンでは、Envoyが稼働し、通信を宛先にルーティングする。

データプレーンの処理は、コンポーネント (リスナー、ルート、クラスター、エンドポイント) から構成される。

> - https://skyao.io/learning-envoy/architecture/concept/#%E8%AF%B7%E6%B1%82%E8%BD%AC%E5%8F%91%E6%A6%82%E5%BF%B5
> - https://www.alibabacloud.com/blog/architecture-analysis-of-istio-the-most-popular-service-mesh-project_597010

#### ▼ アップストリーム/ダウンストリーム

アップストリームは、Envoyのレスポンスの送信元を表す。

ダウンストリームは、Envoyのレスポンスの宛先を表す。

> - https://hinawatts.medium.com/timeout-settings-in-envoy-proxy-a368f3006933
> - https://stackoverflow.com/a/32365658

#### ▼ XDS-APIとの通信の仕組み

Envoyは、XDS-APIにリモートプロシージャーコールを一方向/双方向で実行し、返信/送信された宛先情報を動的に設定する。

Envoyが組み込まれたサービスメッシュツール (例：Istio、Linkerd) では、Envoyのコントロールプレーンへのリモートプロシージャーコール処理の緩衝材として、エージェント (例：pilot-agent) が提供されている。

> - https://www.envoyproxy.io/docs/envoy/latest/api-docs/xds_protocol#streaming-grpc-subscriptions
> - https://i-beam.org/2019/03/13/envoy-xds-server/

`(1)`

: Envoyは、起動時にリスナー値とクラスター値をXDS-APIから取得する。

     取得した宛先情報を自身に設定する。

`(2)`

: Envoyは、リスナー値に紐付ける必要のあるルート値を特定する。

`(3)`

: Envoyは、クラスター値に紐付ける必要のあるエンドポイント値を特定する。

`(4)`

: Envoyは、ルート値とエンドポイント値をXDS-APIから取得する。

     取得した宛先情報を自身に設定する。

`(5)`

: Envoyは、リスナー値とクラスター値をXDS-APIから定期的に取得する。

     取得した宛先情報を自身に設定する。

#### ▼ 実装

```protobuf
message DiscoveryRequest {
  option (udpa.annotations.versioning).previous_message_type = "envoy.api.v2.DiscoveryRequest";

  ...

}
```

```protobuf
message DiscoveryResponse {
  option (udpa.annotations.versioning).previous_message_type = "envoy.api.v2.DiscoveryResponse";

  ...

}
```

> - https://skyao.io/learning-envoy/xds/overview/
> - https://skyao.io/learning-envoy/xds/overview/discovery-message.html
> - https://github.com/envoyproxy/envoy/blob/v1.25.0/api/envoy/service/discovery/v3/discovery.proto#L47-L97
> - https://github.com/envoyproxy/envoy/blob/v1.25.0/api/envoy/service/discovery/v3/discovery.proto#L100-L141

#### ▼ リクエスト内容の種類

記入中...

> - https://www.envoyproxy.io/docs/envoy/latest/api-docs/xds_protocol#resource-types

<br>

### リスナー

#### ▼ リスナーとは

リスナーでは、Envoyに対する通信をIPアドレスとポートで待ち受ける。

#### ▼ 仮想リスナー

#### ▼ リスナーの静的な登録

`envoy.yaml`ファイルにて、`listeners`キーを設定することにより、Envoyに静的にリスナー値を静的に設定できる。

```yaml
static_resources:
  # リスナーのリスト
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
                # HTTPフィルターを指定する
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                stat_prefix: ingress_http
                codec_type: AUTO
                http_filters:
                  - name: envoy.filters.http.router
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router
                route_config:
                  - name: "50001"
                    virtual_hosts:
                      - name: foo-host
                        # ホストベース
                        domains:
                          - "*"
                        # ルートのリスト
                        routes:
                          - match:
                              # パスベース
                              prefix: /
                            route:
                              # クラスター
                              cluster: foo-cluster
                      - name: allow_any
                        domains:
                          - "*"
                        routes:
                          - match:
                              prefix: /
                            route:
                              cluster: PassthroughCluster
                  - name: "50002"
                    virtual_hosts:
                      - name: bar-host
                        domains:
                          - "*"
                        routes:
                          - match:
                              prefix: /
                            route:
                              cluster: bar-cluster
                      - name: allow_any
                        domains:
                          - "*"
                        routes:
                          - match:
                              prefix: /
                            route:
                              cluster: PassthroughCluster
                  - name: "50003"
                    virtual_hosts:
                      - name: baz-host
                        domains:
                          - "*"
                        routes:
                          - match:
                              prefix: /
                            route:
                              cluster: baz-cluster
                      - name: allow_any
                        domains:
                          - "*"
                        routes:
                          - match:
                              prefix: /
                            route:
                              cluster: PassthroughCluster
```

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/overview/examples#static
> - https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#listeners

#### ▼ リスナーの動的な登録

Envoyは、起動時にコントロールプレーンのLDS-APIにリモートプロシージャーコールを一方向/双方向で実行し、宛先のリスナー値を取得する。

また、Envoyは宛先のリスナー値を自身に動的に設定する。

```protobuf

...

// リモートプロシージャーコール
service ListenerDiscoveryService {
  option (envoy.annotations.resource).type = "envoy.config.listener.v3.Listener";

  // 双方向ストリーミングRPC
  rpc StreamListeners(stream discovery.v3.DiscoveryRequest)
      returns (stream discovery.v3.DiscoveryResponse) {
  }

  rpc DeltaListeners(stream discovery.v3.DeltaDiscoveryRequest)
      returns (stream discovery.v3.DeltaDiscoveryResponse) {
  }

  // 単項RPC
  rpc FetchListeners(discovery.v3.DiscoveryRequest) returns (discovery.v3.DiscoveryResponse) {
    option (google.api.http).post = "/v3/discovery:listeners";
    option (google.api.http).body = "*";
  }
}

...

```

> - https://github.com/envoyproxy/envoy/blob/v1.25.0/api/envoy/service/listener/v3/lds.proto#L23-L42
> - https://github.com/envoyproxy/envoy/blob/v1.25.0/source/common/config/type_to_endpoint.cc#L43-L87

**＊実装例＊**

Istioを使用して、`envoy`コンテナを稼働させるとする。

Kubernetesでは、YAMLファイルのキー名の設計規約がローワーキャメルケースであることに注意する。

```yaml
# foo-pod内のenvoyコンテナが、以下のenvoy.yamlファイルで構成されているとする。
# 仮想アウトバウンドリスナー
- name: 172.16.0.1_50001
  accessLog:
    - filter:
        responseFlagFilter:
          flags:
            - NR
      name: envoy.access_loggers.file
      typedConfig:
        "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
        path: /dev/stdout
  address:
    # 宛先IPアドレスとポート番号が合致した場合に、このリスナーで処理される。
    socketAddress:
      # ServiceのIPアドレス
      address: 172.16.0.1 # 全ての宛先IPアドレスを合致させる場合は、0.0.0.0 とする。
      # Serviceのポート番号
      portValue: 50001
  bindToPort: false
  filterChains:
    - filters:
        - name: istio.stats
          typedConfig:
            "@type": type.googleapis.com/udpa.type.v1.TypedStruct
            typeUrl: type.googleapis.com/envoy.extensions.filters.network.wasm.v3.Wasm
        - name: envoy.filters.network.tcp_proxy
          typedConfig:
            # TCP Proxyフィルターを指定する
            "@type": type.googleapis.com/envoy.extensions.filters.network.tcp_proxy.v3.TcpProxy
            accessLog:
              - name: envoy.access_loggers.file
                typedConfig:
                  "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
                  path: /dev/stdout
            # TCP Proxyフィルターの場合、ルートがなく、直接クラスターを指定することになる
            cluster: outbound|50001|v1|foo-service.foo.svc.cluster.local
            statPrefix: outbound|50001|v1|foo-service.foo.svc.cluster.local
  # アウトバウンド通信のみをこのリスナーで処理する。
  trafficDirection: OUTBOUND
# 仮想アウトバウンドリスナー
- name: 172.16.0.2_50002
  accessLog:
    - filter:
        responseFlagFilter:
          flags:
            - NR
      name: envoy.access_loggers.file
      typedConfig:
        "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
        path: /dev/stdout
  address:
    socketAddress:
      address: 172.16.0.2
      portValue: 50002
  bindToPort: false
  filterChains:
    - filters:
        - name: istio.stats
          typedConfig:
            "@type": type.googleapis.com/udpa.type.v1.TypedStruct
            typeUrl: type.googleapis.com/envoy.extensions.filters.network.wasm.v3.Wasm
        - name: envoy.filters.network.tcp_proxy
          typedConfig:
            # TCP Proxyフィルターを指定する
            "@type": type.googleapis.com/envoy.extensions.filters.network.tcp_proxy.v3.TcpProxy
            accessLog:
              - name: envoy.access_loggers.file
                typedConfig:
                  "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
                  path: /dev/stdout
            # TCP Proxyフィルターの場合、ルートがなく、直接クラスターを指定することになる
            cluster: outbound|50002|v1|bar-service.bar.svc.cluster.local
            statPrefix: outbound|50002|v1|bar-service.bar.svc.cluster.local
  trafficDirection: OUTBOUND
# 仮想アウトバウンドリスナー
- name: 172.16.0.3_50003
  accessLog:
    - filter:
        responseFlagFilter:
          flags:
            - NR
      name: envoy.access_loggers.file
      typedConfig:
        "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
        path: /dev/stdout
  address:
    socketAddress:
      address: 172.16.0.3
      portValue: 50003
  bindToPort: false
  filterChains:
    - filters:
        - name: istio.stats
          typedConfig:
            "@type": type.googleapis.com/udpa.type.v1.TypedStruct
            typeUrl: type.googleapis.com/envoy.extensions.filters.network.wasm.v3.Wasm
        - name: envoy.filters.network.tcp_proxy
          typedConfig:
            # TCP Proxyフィルターを指定する
            "@type": type.googleapis.com/envoy.extensions.filters.network.tcp_proxy.v3.TcpProxy
            accessLog:
              - name: envoy.access_loggers.file
                typedConfig:
                  "@type": type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog
                  path: /dev/stdout
            # TCP Proxyフィルターの場合、ルートがなく、直接クラスターを指定することになる
            cluster: outbound|50003|v1|baz-service.baz.svc.cluster.local
            statPrefix: outbound|50003|v1|baz-service.baz.svc.cluster.local
  trafficDirection: OUTBOUND
```

<br>

### ルート

#### ▼ ルートとは

リスナーのサブセットである。

ルートでは、リスナーで処理した通信を受け取り、特定のクラスターのIPアドレスとポートにルーティングする。

> - https://www.alibabacloud.com/blog/architecture-analysis-of-istio-the-most-popular-service-mesh-project_597010

#### ▼ ルート値の静的な登録

`static_resources.listeners`キー配下で、リスナーと合わせて設定する。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/overview/examples#static
> - https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#listeners

#### ▼ ルート値の動的な登録

Envoyは、起動時にコントロールプレーンのRDS-APIにリモートプロシージャーコールを一方向/双方向で実行し、宛先のルート値を取得する。

また、Envoyは宛先のルート値を自身に動的に設定する。

```protobuf

...

// リモートプロシージャーコール
service RouteDiscoveryService {
  option (envoy.annotations.resource).type = "envoy.config.route.v3.RouteConfiguration";

  // 双方向ストリーミングRPC
  rpc StreamRoutes(stream discovery.v3.DiscoveryRequest)
      returns (stream discovery.v3.DiscoveryResponse) {
  }

  rpc DeltaRoutes(stream discovery.v3.DeltaDiscoveryRequest)
      returns (stream discovery.v3.DeltaDiscoveryResponse) {
  }

  // 単項RPC
  rpc FetchRoutes(discovery.v3.DiscoveryRequest) returns (discovery.v3.DiscoveryResponse) {
    option (google.api.http).post = "/v3/discovery:routes";
    option (google.api.http).body = "*";
  }
}

...

```

> - https://github.com/envoyproxy/envoy/blob/v1.25.0/api/envoy/service/route/v3/rds.proto#L22-L42
> - https://github.com/envoyproxy/envoy/blob/v1.25.0/source/common/config/type_to_endpoint.cc#L43-L87

**＊実装例＊**

Istioを使用して、`envoy`コンテナを稼働させるとする。

Kubernetesでは、YAMLファイルのキー名の設計規約がローワーキャメルケースであることに注意する。

```yaml
- name: "50001"
  virtualHosts:
    - name: foo-service.foo-namespace.svc.cluster.local:50001
      # ホストベース
      domains:
        - foo-service.foo-namespace.svc.cluster.local
        - foo-service.foo-namespace.svc.cluster.local:50001
        - foo-service
        - foo-service:50001
        - foo-service.foo-namespace.svc
        - foo-service.foo-namespace.svc:50001
        - foo-service.foo-namespace
        - foo-service.foo-namespace:50001
        - 172.16.0.1
        - 172.16.0.1:50001
      # ルートのリスト
      routes:
        - match:
            # パスベース
            prefix: /
          route:
            # クラスター (ここではKubernetesのService)
            cluster: outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local
    - name: allow_any
      domains:
        - "*"
      routes:
        - match:
            prefix: /
          route:
            cluster: PassthroughCluster
# Node外からbar-podにリクエストを送信する時に選ばれる。
- name: "50002"
  virtualHosts:
    - name: bar-service.bar-namespace.svc.cluster.local:50002
      domains:
        - bar-service.bar-namespace.svc.cluster.local
        - bar-service.bar-namespace.svc.cluster.local:50002
        - bar-service
        - bar-service:50002
        - bar-service.bar-namespace.svc
        - bar-service.bar-namespace.svc:50002
        - bar-service.bar-namespace
        - bar-service.bar-namespace:50002
        - 172.16.0.2
        - 172.16.0.2:50002
      routes:
        - match:
            prefix: /
          route:
            cluster: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
    - name: allow_any
      domains:
        - "*"
      routes:
        - match:
            prefix: /
          route:
            cluster: PassthroughCluster
# Node外からbaz-podにリクエストを送信する時に選ばれる。
- name: "50003"
  virtualHosts:
    - name: baz-service.baz-namespace.svc.cluster.local:50003
      domains:
        - baz-service.baz-namespace.svc.cluster.local
        - baz-service.baz-namespace.svc.cluster.local:50003
        - baz-service
        - baz-service:50003
        - baz-service.baz-namespace.svc
        - baz-service.baz-namespace.svc:50003
        - baz-service.baz-namespace
        - baz-service.baz-namespace:50003
        - 172.16.0.3
        - 172.16.0.3:50003
      routes:
        - match:
            prefix: /
          route:
            cluster: outbound|50003|v1|baz-service.baz-namespace.svc.cluster.local
    - name: allow_any
      domains:
        - "*"
      routes:
        - match:
            prefix: /
          route:
            cluster: PassthroughCluster
```

<br>

### クラスター

#### ▼ クラスターとは

クラスターでは、ルートからルーティングされた通信を受け取り、いずれかのエンドポイントのIPアドレスとポートにロードバランシングする。

#### ▼ クラスター値の静的な登録

`envoy.yaml`ファイルにて、`clusters`キーを設定することにより、Envoyに静的にクラスター値を静的に設定できる。

```yaml
static_resources:
  # クラスターのリスト
  clusters:
    # クラスター
    - name: foo-cluster
      connect_timeout: 0.25s
      type: STATIC
      lb_policy: ROUND_ROBIN
      load_assignment:
        cluster_name: foo-cluster
        # エンドポイントのリスト
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      # 宛先のIPアドレス
                      address: 10.0.0.1
                      # 宛先が待ち受けているポート番号
                      port_value: 80
              - endpoint:
                  address:
                    socket_address:
                      address: 10.0.0.2
                      port_value: 80
    - name: bar-cluster
      connect_timeout: 0.25s
      type: STATIC
      lb_policy: ROUND_ROBIN
      load_assignment:
        cluster_name: bar-cluster
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    # 冗長化された宛先の情報
                    socket_address:
                      address: 11.0.0.1
                      port_value: 80
              - endpoint:
                  # 冗長化された宛先の情報
                  socket_address:
                    address: 11.0.0.2
                    port_value: 80
    - name: baz-cluster
      connect_timeout: 0.25s
      type: STATIC
      lb_policy: ROUND_ROBIN
      load_assignment:
        cluster_name: baz-cluster
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    # 冗長化された宛先の情報
                    socketAddress:
                      address: 12.0.0.1
                      port_value: 80
              - endpoint:
                  address:
                    # 冗長化された宛先の情報
                    socketAddress:
                      address: 12.0.0.2
                      port_value: 80
```

> - https://skyao.io/learning-envoy/architecture/concept/cluster.html
> - https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#clusters

#### ▼ クラスター値の動的な登録

Envoyは、起動時にコントロールプレーンのCDS-APIにリモートプロシージャーコールを一方向/双方向で実行し、宛先のクラスター値を取得する。

また、Envoyは宛先のクラスター設定を自身に動的に設定する。

```protobuf

...

// リモートプロシージャーコール
service ClusterDiscoveryService {
  option (envoy.annotations.resource).type = "envoy.config.cluster.v3.Cluster";

  // 双方向ストリーミングRPC
  rpc StreamClusters(stream discovery.v3.DiscoveryRequest)
      returns (stream discovery.v3.DiscoveryResponse) {
  }

  rpc DeltaClusters(stream discovery.v3.DeltaDiscoveryRequest)
      returns (stream discovery.v3.DeltaDiscoveryResponse) {
  }

  // 単項RPC
  rpc FetchClusters(discovery.v3.DiscoveryRequest) returns (discovery.v3.DiscoveryResponse) {
    option (google.api.http).post = "/v3/discovery:clusters";
    option (google.api.http).body = "*";
  }
}

...

```

> - https://github.com/envoyproxy/envoy/blob/v1.25.0/api/envoy/service/cluster/v3/cds.proto#L22-L38
> - https://github.com/envoyproxy/envoy/blob/v1.25.0/source/common/config/type_to_endpoint.cc#L43-L87

**＊実装例＊**

Istioを使用して、`envoy`コンテナを稼働させるとする。

Kubernetesでは、YAMLファイルのキー名の設計規約がローワーキャメルケースであることに注意する。

```yaml
# foo-pod内のenvoyコンテナが、以下のenvoy.yamlファイルで構成されているとする。
# クラスター (ここではKubernetesのService)
- name: outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local
  connectTimeout: 0.25s
  type: STATIC
  lbPolicy: ROUND_ROBIN
  loadAssignment:
    clusterName: outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local
    # エンドポイントのリスト
    endpoints:
      - lbEndpoints:
          - endpoint:
              address:
                socketAddress:
                  # 宛先 (ここではPod) のIPアドレス
                  address: 10.0.0.1
                  # 宛先が待ち受けるポート番号
                  portValue: 80
          - endpoint:
              address:
                socketAddress:
                  address: 10.0.0.2
                  portValue: 80
- name: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
  connectTimeout: 0.25s
  type: STATIC
  lbPolicy: ROUND_ROBIN
  loadAssignment:
    clusterName: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
    endpoints:
      - lbEndpoints:
          - endpoint:
              address:
                socketAddress:
                  address: 11.0.0.1
                  portValue: 80
          - endpoint:
              address:
                socketAddress:
                  address: 11.0.0.2
                  portValue: 80
- name: outbound|50003|v1|baz-service.baz-namespace.svc.cluster.local
  connectTimeout: 0.25s
  type: STATIC
  lbPolicy: ROUND_ROBIN
  loadAssignment:
    clusterName: outbound|50003|v1|baz-service.baz-namespace.svc.cluster.local
    endpoints:
      - lbEndpoints:
          - endpoint:
              address:
                socketAddress:
                  address: 12.0.0.1
                  portValue: 80
          - endpoint:
              address:
                socketAddress:
                  address: 12.0.0.2
                  portValue: 80
```

<br>

### エンドポイント

#### ▼ エンドポイントとは

クラスターのサブセットである。

エンドポイントでは、クラスターでロードバランシングされた通信を受け取り、IPアドレスとポート番号を指定して、宛先に送信する。

> - https://www.alibabacloud.com/blog/architecture-analysis-of-istio-the-most-popular-service-mesh-project_597010

#### ▼ エンドポイント値の静的な登録

`static_resources.clusters`キー配下で、リスナーと合わせて設定する。

> - https://skyao.io/learning-envoy/architecture/concept/cluster.html
> - https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/configuration-static#clusters

#### ▼ エンドポイント値の動的な登録

Envoyは、起動時にコントロールプレーンのEDS-APIにリモートプロシージャーコールを一方向/双方向で実行し、宛先のエンドポイント値を取得する。

また、Envoyはルートに宛先のエンドポイント設定を自身に動的に設定する。

```protobuf

...

// リモートプロシージャーコール
service EndpointDiscoveryService {
  option (envoy.annotations.resource).type = "envoy.config.endpoint.v3.ClusterLoadAssignment";

  // 双方向ストリーミングRPC
  rpc StreamEndpoints(stream discovery.v3.DiscoveryRequest)
      returns (stream discovery.v3.DiscoveryResponse) {
  }

  rpc DeltaEndpoints(stream discovery.v3.DeltaDiscoveryRequest)
      returns (stream discovery.v3.DeltaDiscoveryResponse) {
  }

  // 単項RPC
  rpc FetchEndpoints(discovery.v3.DiscoveryRequest) returns (discovery.v3.DiscoveryResponse) {
    option (google.api.http).post = "/v3/discovery:endpoints";
    option (google.api.http).body = "*";
  }
}

...

```

> - https://github.com/envoyproxy/envoy/blob/v1.25.0/api/envoy/service/endpoint/v3/eds.proto#L21-L40

<br>

## 02. ユースケース

### リバースプロキシのミドルウェアとして

#### ▼ 外からインバウンド通信から待ち受ける (Ingressリスナー / インバウンドリスナー)

Envoyは、リバースプロキシとして、外部 (例：ロードバランサー、他のEnvoy) からインバウンド通信を待ち受ける。

サービスメッシュ外や他のPodからリクエストを受信するために使用する。

![envoy_ingress-listener.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_ingress-listener.png)

> - https://www.envoyproxy.io/docs/envoy/latest/intro/deployment_types/service_to_service#service-to-service-ingress-listener
> - https://www.envoyproxy.io/docs/envoy/latest/intro/life_of_a_request#network-topology
> - https://blog.51cto.com/wangguishe/5789228

#### ▼ ローカルホストにあるマイクロサービスから待ち受ける (Egressリスナー / アウトバウンドリスナー)

Envoyは、リバースプロキシとして、ローカルホストにあるマイクロサービスからアウトバウンド通信を待ち受ける。

サービスメッシュ外や他のPodにリクエストを送信するために使用する。

![envoy_egress-listener.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_egress-listener.png)

> - https://www.envoyproxy.io/docs/envoy/latest/intro/deployment_types/service_to_service#service-to-service-egress-listener
> - https://www.envoyproxy.io/docs/envoy/latest/intro/life_of_a_request#network-topology
> - https://blog.51cto.com/wangguishe/5789228

#### ▼ ローカルホスト外にあるマイクロサービスにプロキシする

Envoyは、リバースプロキシとして、ローカルホスト外にあるマイクロサービスに通信をプロキシする

```yaml
Envoy
⬇⬆︎
⬇⬆︎ # HTTP/TCPプロトコル
⬇⬆︎
マイクロサービス
```

なお、Envoyは一部のプロトコル (例：FastCGIプロトコル) に対応していない。

その場合、そのプロトコルに対応可能なリバースプロキシ (例：Nginx、Apache) を置く必要があり、二重のリバースプロキシになる。

```yaml
Envoy
⬇⬆︎
⬇⬆︎ # TCPプロトコル
⬇⬆︎
Nginx
⬇⬆︎
⬇⬆︎ # FastCGIプロトコル
⬇⬆︎
マイクロサービス
```

> - https://blog.linkode.co.jp/entry/2020/07/06/162915
> - https://openstandia.jp/oss_info/envoy/
> - https://speakerdeck.com/kurochan/ru-men-envoy?slide=33

<br>

### `L4`/`L7`ロードバランサーのミドルウェアとして

Envoyの文脈では、ロードバランサーとしての使い方を『フロントプロキシ』『エッジプロキシ』とも呼んでいる。

![envoy_loadbalancer.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_loadbalancer.png)

> - https://www.envoyproxy.io/docs/envoy/latest/intro/deployment_types/front_proxy
> - https://www.envoyproxy.io/docs/envoy/latest/start/sandboxes/front_proxy
> - https://blog.51cto.com/wangguishe/5789228

<br>
