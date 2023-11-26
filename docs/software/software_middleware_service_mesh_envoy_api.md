---
title: 【IT技術の知見】API＠Envoy
description: API＠Envoyの知見を記録しています。
---

# API＠Envoy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Envoy-API

Envoyの設定値をレスポンスとして返信する。ただ、欲しい設定をどのエンドポイントから取得すれば良いのかが個人的にはわかりにくい。

そのため、サービスメッシュツール (例：Istio、Linkerd) でサポートされている付属ツール (例：`istioctl proxy-config`コマンド) を使用した方が良い。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://127.0.0.1:15000/help
```

```bash
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -c istio-proxy \
    -- bash -c "curl http://127.0.0.1:15000/help"

# 執筆時点 (2022/11/13) でのエンドポイント
  /: Admin home page
  /certs: print certs on machine
  /clusters: upstream cluster status
  /config_dump: dump current Envoy configs (experimental)
  /contention: dump current Envoy mutex contention stats (if enabled)
  /cpuprofiler: enable/disable the CPU profiler
  /drain_listeners: drain listeners
  /healthcheck/fail: cause the server to fail health checks
  /healthcheck/ok: cause the server to pass health checks
  /heapprofiler: enable/disable the heap profiler
  /help: print out list of admin commands
  /hot_restart_version: print the hot restart compatibility version
  /init_dump: dump current Envoy init manager information (experimental)
  /listeners: print listener info
  /logging: query/change logging levels
  /memory: print current allocation/heap usage
  /quitquitquit: exit the server
  /ready: print server state, return 200 if LIVE, otherwise return 503
  /reopen_logs: reopen access logs
  /reset_counters: reset all counters to zero
  /runtime: print runtime values
  /runtime_modify: modify runtime values
  /server_info: print server version/status information
  /stats: print server stats
  /stats/prometheus: print server stats in prometheus format
  /stats/recentlookups: Show recent stat-name lookups
  /stats/recentlookups/clear: clear list of stat-name lookups and counter
  /stats/recentlookups/disable: disable recording of reset stat-name lookup names
  /stats/recentlookups/enable: enable recording of reset stat-name lookup names
```

> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/admin
> - https://www.envoyproxy.io/docs/envoy/latest/operations/admin#administration-interface

<br>

## 02. Global

### version_info

宛先情報のバージョンが表示される。

宛先情報が変わった場合、コントロールプレーンは`version_info`キーの値が変更する。

```yaml
[
  {
    # バージョンが更新されていく。
    "version_info": "2022-01-01T12:00:00Z/2",
    "@type": "type.googleapis.com/envoy.admin.v3.ClustersConfigDump.DynamicCluster",
    "cluster": {
       ...
     }

     ...

  }
]
```

> - https://www.envoyproxy.io/docs/envoy/latest/start/sandboxes/dynamic-configuration-control-plane.html?highlight=dynamic_active_clusters#step-8-check-envoy-uses-the-updated-configuration

<br>

## 03. `/clusters`エンドポイント

### `/clusters`エンドポイントとは

静的な設定値 (特に、クラスター) 、サービスディスカバリーによって動的に登録された設定値 (特に、クラスター) を、見やすい形式でレスポンスとして返信する。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://127.0.0.1:15000/clusters
```

> - https://www.envoyproxy.io/docs/envoy/latest/operations/admin#get--clusters

<br>

### サービスメッシュツールごとの比較

#### ▼ Istioの場合

Istioを使用している場合には、宛先のIPアドレスとポート番号が登録されている。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://127.0.0.1:15000/clusters
```

```bash
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -c istio-proxy \
    -- bash -c "curl http://127.0.0.1:15000/clusters"

# 冗長化された宛先インスタンスのIPアドレスとポート番号
# IPアドレスは宛先ごとに異なる
outbound|<Serviceの受信ポート>|<サブセット名>|<Serviceの完全修飾ドメイン名>::<PodのIPアドレス>:<Podのコンテナポート>::<Podのメタデータ>

outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local::10.0.0.1:80::zone::ap-northeast-1a
outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local::10.0.0.2:80::zone::ap-northeast-1a
outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local::10.0.0.3:80::zone::ap-northeast-1a

...

outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local::10.0.0.1:80::region::ap-northeast-1
outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local::10.0.0.2:80::region::ap-northeast-1
outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local::10.0.0.3:80::region::ap-northeast-1

...
```

<br>

## 04. `/config_dump`エンドポイント

### `/config_dump`エンドポイントとは

Envoyの現在の全ての設定値を、JSON形式でレスポンスとして返信する。

Envoyの稼働するサーバー/コンテナからローカルホストにリクエストを送信すると確認できる。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://127.0.0.1:15000/config_dump
```

```yaml
$ kubectl exec \
-it foo-pod \
-n foo-namespace \
-c istio-proxy \
-- bash -c "curl http://127.0.0.1:15000/config_dump" | yq -P '.configs[] | keys' | sort -f
---
- "@type"
- "@type"
- "@type"
- "@type"
- "@type"
- bootstrap
- dynamic_active_clusters
- dynamic_active_secrets
- dynamic_listeners
- dynamic_route_configs
- last_updated
- static_clusters
- static_listeners
- static_route_configs
- version_info
- version_info
```

> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto#configdump-proto

<br>

### include_edsパラメーター

#### ▼ include_edsパラメーターとは

サービスディスカバリーによって動的に登録された設定値 (特に、エンドポイント) を、JSON形式でレスポンスとして返信する。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://127.0.0.1:15000/config_dump?include_eds
```

```yaml
$ kubectl exec \
-it foo-pod \
-n foo-namespace \
-c istio-proxy \
-- bash -c "curl http://127.0.0.1:15000/config_dump?include_eds" | yq -P '.configs[] | keys' | sort -f
---
- "@type"
- "@type"
- "@type"
- "@type"
- "@type"
- "@type"
- "@type"
- bootstrap
- dynamic_active_clusters
- dynamic_active_secrets
- dynamic_endpoint_configs
- dynamic_listeners
- dynamic_route_configs
- last_updated
- static_clusters
- static_endpoint_configs
- static_listeners
- static_route_configs
- version_info
- version_info
```

> - https://www.envoyproxy.io/docs/envoy/latest/operations/admin#get--config_dump?include_eds

#### ▼ `dynamic_endpoint_configs`キー

準備済みのエンドポイント値が設定されている。

`cluster_name`キーは、`/config_dump?resource={dynamic_active_clusters}`エンドポイントから取得できるJSONの`service_name`キーのエイリアスと紐づいている。

**＊例＊**

foo-podに登録されているbar-podの`endpoint`値を確認してみる。

```yaml
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -c istio-proxy \
    -- bash -c "curl http://127.0.0.1:15000/config_dump?include_eds" | yq -P

---
configs:
  dynamic_endpoint_configs:
    - endpoint_config:
        "@type": type.googleapis.com/envoy.config.endpoint.v3.ClusterLoadAssignment
        # エンドポイントの親クラスター名を指定している。
        cluster_name: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
        endpoints:
           # bar-podのあるリージョン
          - locality:
              region: ap-northeast-1
              zone: ap-northeast-1a
            lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      # 冗長化されたbar-podのIPアドレス
                      address: 11.0.0.1
                      # bar-pod内のコンテナが待ち受けているポート番号
                      port_value: 80
                  health_check_config: {}
                health_status: HEALTHY
                metadata:
                  filter_metadata:
                    istio:
                      workload: bar
                    envoy.transport_socket_match:
                      tlsMode: istio
                load_balancing_weight: 1
          - locality:
              region: ap-northeast-1
              zone: ap-northeast-1d
            lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      # 冗長化されたbar-podのIPアドレス
                      address: 11.0.0.2
                      # bar-pod内のコンテナが待ち受けているポート番号
                      port_value: 80
                  health_check_config: {}
                health_status: HEALTHY
                metadata:
                  filter_metadata:
                    istio:
                      workload: bar
                    envoy.transport_socket_match:
                      tlsMode: istio
                load_balancing_weight: 1
          - locality:
              region: ap-northeast-1
              zone: ap-northeast-1d
            lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      # 冗長化されたbaz-podのIPアドレス
                      address: 11.0.0.3
                      # baz-pod内のコンテナが待ち受けているポート番号
                      port_value: 80
                  health_check_config: {}
                health_status: HEALTHY
                metadata:
                  filter_metadata:
                    istio:
                      workload: baz
                    envoy.transport_socket_match:
                      tlsMode: istio
                load_balancing_weight: 1
        policy:
          overprovisioning_factor: 140

    ...

    - endpoint_config:

    ...
```

> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto#envoy-v3-api-msg-admin-v3-endpointsconfigdump-dynamicendpointconfig

<br>

### resourceパラメーター

#### ▼ resourceパラメーターとは

`config_dump`エンドポイントのJSON形式のレスポンスのうち、JSONのルートに反復して出現するキーをフィルタリングし、返信する。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://127.0.0.1:15000/config_dump?resource={}
```

> - https://www.envoyproxy.io/docs/envoy/latest/operations/admin#get--config_dump?resource=

#### ▼ dynamic_active_clusters

準備済みのクラスター値を、JSON形式でレスポンスとして返信する。

クラスターに紐づく宛先に関して、`load_assignment`キーで宛先IPアドレスを直接的に設定する場合と、`service_name`キーでエイリアスを設定する場合がある。

`service_name`キーに紐づく宛先情報は、`/config_dump?include_eds`エンドポイントのレスポンスの`dynamic_endpoint_configs`キー配下にある`cluster_name`キーで確認できる。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://127.0.0.1:15000/config_dump?resource={dynamic_active_clusters} | grep ClustersConfigDump.DynamicCluster -A 120
```

> - https://www.envoyproxy.io/docs/envoy/latest/start/sandboxes/dynamic-configuration-control-plane#step-5-dump-envoy-s-dynamic-active-clusters-config
> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto#envoy-v3-api-msg-admin-v3-clustersconfigdump-dynamiccluster

**＊例＊**

foo-podに登録されているbar-podの`dynamic_active_clusters`値を確認してみる。

```yaml
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -c istio-proxy \
    -- bash -c "curl http://127.0.0.1:15000/config_dump?resource={dynamic_active_clusters}" | yq -P

---
configs:
  - "@type": type.googleapis.com/envoy.admin.v3.ClustersConfigDump.DynamicCluster
    version_info: 2022-11-24T12:13:05Z/468
    cluster:
      "@type": type.googleapis.com/envoy.config.cluster.v3.Cluster
      # クラスター名
      name: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
      type: EDS
      eds_cluster_config:
        eds_config:
          ads: {}
          initial_fetch_timeout: 0s
          resource_api_version: V3
        # 本クラスターに紐づくエンドポイントの親クラスター名を指定している。
        # https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/cluster/v3/cluster.proto#envoy-v3-api-field-config-cluster-v3-cluster-edsclusterconfig-service-name
        service_name: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
  ...

  - "@type": type.googleapis.com/envoy.admin.v3.ClustersConfigDump.DynamicCluster

  ...
```

> - https://www.envoyproxy.io/docs/envoy/latest/operations/admin#get--config_dump
> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto#admin-v3-clustersconfigdump
> - https://www.envoyproxy.io/docs/envoy/latest/start/sandboxes/dynamic-configuration-control-plane#step-2-check-initial-config-and-web-response
> - https://cloud.tencent.com/developer/article/1701214

#### ▼ dynamic_warm_clusters

準備が完了していない (ウォーミングアップ中の) クラスター値を、JSON形式でレスポンスとして返信する。

もしウォーミングアップ中の宛先にルーティングしてしまった場合は、`404`ステータスや`503`ステータス (特に、Istio) になる。

```bash
envoy@<コンテナ名>: $ curl http://127.0.0.1:15000/config_dump?resource={dynamic_warming_clusters}

{} # ウォーミングアップ中のクラスター値が無ければ、空配列になる。
```

> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/cluster_manager#cluster-warming
> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto#admin-v3-clustersconfigdump

**＊例＊**

foo-podに登録されているbar-podの`dynamic_warming_clusters`値を確認してみる。

```yaml
$ kubectl exec \
-it foo-pod \
-n foo-namespace \
-c istio-proxy \
-- bash -c "curl http://127.0.0.1:15000/config_dump?resource={dynamic_warming_clusters}" | yq -P
---
{} # ウォーミングアップ中のクラスター値が無ければ、空配列になる。
```

#### ▼ dynamic_active_secrets

記入中...

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://127.0.0.1:15000/config_dump?resource={dynamic_active_secrets}
```

#### ▼ dynamic_listeners

サービスディスカバリーによって動的に登録された設定値 (特に、リスナー) を、JSON形式でレスポンスとして返信する。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://127.0.0.1:15000/config_dump?resource={dynamic_listeners}
```

> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto#envoy-v3-api-msg-admin-v3-listenersconfigdump-dynamiclistener

**＊例＊**

foo-podに登録されているbar-podの`dynamic_listeners`値を確認してみる。

```yaml
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -c istio-proxy \
    -- bash -c "curl http://127.0.0.1:15000/config_dump?resource={dynamic_listeners}" | yq -P

---
configs:
  - "@type": type.googleapis.com/envoy.admin.v3.ListenersConfigDump.DynamicListener
    # リスナー名
    name: 0.0.0.0_50002
    active_state:
      version_info: 2022-11-24T12:13:05Z/468
      listener:
        "@type": type.googleapis.com/envoy.config.listener.v3.Listener
        name: 0.0.0.0_50002
        address:
          socket_address:
            # 受信したパケットのうちで、宛先IPアドレスでフィルタリングできるようにする。
            address: 0.0.0.0
            # 受信したパケットのうちで、宛先ポート番号でフィルタリングできるようにする。
            port_value: 50002
        filter_chains:
          - filter_chain_match:
              transport_protocol: raw_buffer
              application_protocols:
                - http/1.1
                - h2c
            filters:
              - name: envoy.filters.network.http_connection_manager
                typed_config:
                  "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                  stat_prefix: outbound_0.0.0.0_50001
                  rds:
                    config_source:
                      ads: {}
                      initial_fetch_timeout: 0s
                      resource_api_version: V3
                    # 本リスナーに紐づくルート名を指定している。
                    route_config_name: 50002
  ...

  - "@type": type.googleapis.com/envoy.admin.v3.ListenersConfigDump.DynamicListener

  ...
```

#### ▼ dynamic_route_configs

サービスディスカバリーによって動的に登録された設定値 (特に、ルート) を、JSON形式でレスポンスとして返信する。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://127.0.0.1:15000/config_dump?resource={dynamic_route_configs}
```

> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto#envoy-v3-api-msg-admin-v3-routesconfigdump-dynamicrouteconfig

**＊例＊**

foo-podに登録されているbar-podの`dynamic_route_configs`値を確認してみる。

```yaml
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -c istio-proxy \
    -- bash -c "curl http://127.0.0.1:15000/config_dump?resource={dynamic_route_configs}" | yq -P

---
configs:
  - "@type": type.googleapis.com/envoy.admin.v3.RoutesConfigDump.DynamicRouteConfig
    version_info: 2022-11-24T12:13:05Z/468
    route_config:
      "@type": type.googleapis.com/envoy.config.route.v3.RouteConfiguration
      # ルート名
      name: 50002
      virtual_hosts:
        # 仮想ホスト名
        # foo-podからbar-podにリクエストを送信する時に選ばれる。
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
                # 本ルートに紐づくクラスター名を指定している。
                cluster: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
                timeout: 0s
                retry_policy:
                  retry_on: connect-failure,refused-stream,unavailable,cancelled,retriable-status-codes
                  num_retries: 2
                  retry_host_predicate:
                    - name: envoy.retry_host_predicates.previous_hosts
                  host_selection_retry_max_attempts: "5"
                  retriable_status_codes:
                    - 503
                max_stream_duration:
                  max_stream_duration: 0s
                  grpc_timeout_header_max: 0s
              decorator:
                operation: bar-service.bar-namespace.svc.cluster.local:50002/*

  ...

  - '@type': type.googleapis.com/envoy.admin.v3.RoutesConfigDump.DynamicRouteConfig

  ...
```

#### ▼ static_listeners

静的なリスナー値を返信する。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://127.0.0.1:15000/config_dump?resource={static_listeners}
```

**＊例＊**

foo-podに登録されているbar-podの`static_listeners`値を確認してみる。

```yaml
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -c istio-proxy \
    -- bash -c "curl http://127.0.0.1:15000/config_dump?resource={static_listeners}" | yq -P

---
configs:
  - "@type": type.googleapis.com/envoy.admin.v3.ListenersConfigDump.StaticListener
    listener:
      "@type": type.googleapis.com/envoy.config.listener.v3.Listener
      address:
        socket_address:
          address: 0.0.0.0
          # メトリクス収集ツールからのリクエストを受信するためのポート番号
          port_value: 15090

  ...

  - "@type": type.googleapis.com/envoy.admin.v3.ListenersConfigDump.StaticListener
    listener:
      "@type": type.googleapis.com/envoy.config.listener.v3.Listener
      address:
        socket_address:
          address: 0.0.0.0
          # kubeletからのヘルスチェックを受信するためのポート番号
          port_value: 15021

   ...
```

<br>
