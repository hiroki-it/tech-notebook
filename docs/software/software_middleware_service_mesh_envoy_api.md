---
title: 【IT技術の知見】API＠Envoy
description: API＠Envoyの知見を記録しています。
---

# API＠Envoy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Envoy-API

Envoyの設定値をレスポンスとして返信する。ただ、欲しい設定をどのエンドポイントから取得すれば良いのかが個人的にはわかりにくく、サービスメッシュツール（例：Istio）でサポートされている付属ツール（例：```istioctl proxy-config```コマンド）を使用した方が良い。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://localhost:15000/help

# 執筆時点（2022/11/13）でのエンドポイント
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


> ℹ️ 参考：
>
> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/admin
> - https://www.envoyproxy.io/docs/envoy/latest/operations/admin#administration-interface


<br>

## 02. Global

### version_info

宛先情報のバージョンが表示される。宛先情報が変わった場合、コントロールプレーンは```version_info```キーの値が変更する。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/start/sandboxes/dynamic-configuration-control-plane.html?highlight=dynamic_active_clusters#step-8-check-envoy-uses-the-updated-configuration

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

<br>

## 03. ```/clusters```エンドポイント

### ```/clusters```エンドポイントとは

静的な設定値（特に、クラスター）、サービスディスカバリーによって動的に登録された設定値（特に、クラスター）を、見やすい形式でレスポンスとして返信する。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/operations/admin#get--clusters

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://localhost:15000/clusters
```

<br>

### サービスメッシュツールごとの比較

#### ▼ Istioの場合

Istioを使用している場合には、宛先のIPアドレスとポート番号が登録されている。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://localhost:15000/clusters


# 冗長化された宛先インスタンスのIPアドレスとポート番号
# IPアドレスは宛先ごとに異なる
outbound|<Serviceの受信ポート>|<サブセット名>|<Serviceの完全修飾ドメイン名>::<PodのIPアドレス>:<Podのコンテナポート>::<Podのメタデータ>

outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local::10.0.0.1:80::zone::ap-northeast-1a
outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local::10.0.0.2:80::zone::ap-northeast-1a
outbound|50001|v1|foo-servive.foo-namespace.svc.cluster.local::10.0.0.3:80::zone::ap-northeast-1a

...

outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local::10.0.0.1:80::region::ap-northeast-1
outbound|50001|v1|foo-service.foo-namespace.svc.cluster.local::10.0.0.2:80::region::ap-northeast-1
outbound|50001|v1|foo-servive.foo-namespace.svc.cluster.local::10.0.0.3:80::region::ap-northeast-1

...
```

<br>

## 04. ```/config_dump```エンドポイント

### ```/config_dump```エンドポイントとは

Envoyの現在の全ての設定値を、JSON形式でレスポンスとして返信する。Envoyの稼働するサーバー/コンテナからローカルホストにリクエストを送信すると確認できる。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto#configdump-proto

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://localhost:15000/config_dump
```

<br>

### include_edsパラメーター

#### ▼ include_edsパラメーターとは

サービスディスカバリーによって動的に登録された設定値（特に、エンドポイント）を、JSON形式でレスポンスとして返信する。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/operations/admin#get--config_dump?include_eds

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://localhost:15000/config_dump?include_eds
```

<br>

### resourceパラメーター

#### ▼ resourceパラメーターとは

```config_dump```エンドポイントのJSON形式のレスポンスのうち、JSONのルートに反復して出現するキーをフィルタリングし、返信する。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/operations/admin#get--config_dump?resource=

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://localhost:15000/config_dump?resource={}
```

#### ▼ dynamic_active_clusters

準備済みのクラスター値を、JSON形式でレスポンスとして返信する。


```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://localhost:15000/config_dump?resource={dynamic_active_clusters}

[
  ...

  {
    ...
    
    "@type": "type.googleapis.com/envoy.admin.v3.ClustersConfigDump.DynamicCluster",
    "cluster": {
      "@type": "type.googleapis.com/envoy.config.cluster.v3.Cluster",
      "name": "foo-service",
      "type": "EDS",
      "eds_cluster_config":{
        "eds_config": {
          "ads": {},
          "initial_fetch_timeout": "0s",
          "resource_api_version": "V3"
        },
        "service_name": "foo-service"
      }
    }
    
    ...
  }
  
  ...
]
```

```grep```コマンドを使用して、```service_name```キーのみを取得すれば、宛先を一覧で取得できる。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://localhost:15000/config_dump?resource={dynamic_active_clusters} | grep service_name
```


> ℹ️ 参考：
>
> - https://www.envoyproxy.io/docs/envoy/latest/operations/admin#get--config_dump
> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto#admin-v3-clustersconfigdump
> - https://www.envoyproxy.io/docs/envoy/latest/start/sandboxes/dynamic-configuration-control-plane#step-2-check-initial-config-and-web-response
> - https://cloud.tencent.com/developer/article/1701214


#### ▼ dynamic_warm_clusters

準備が完了していない（ウォーミングアップ中の）クラスター値を、JSON形式でレスポンスとして返信する。もしウォーミングアップ中の宛先にルーティングしてしまった場合は、```404```ステータスや```503```ステータス（特に、Istio）になる。

> ℹ️ 参考：
>
> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/cluster_manager#cluster-warming
> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto#admin-v3-clustersconfigdump

```bash
envoy@<コンテナ名>: $ curl http://localhost:15000/config_dump?resource={dynamic_warming_clusters}

{} # ウォーミングアップ中のクラスター値が無ければ、空配列になる。
```


#### ▼ dynamic_active_secrets

調査中...

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://localhost:15000/config_dump?resource={dynamic_active_secrets}
```

#### ▼ dynamic_listeners

サービスディスカバリーによって動的に登録された設定値（特に、リスナー）を、JSON形式でレスポンスとして返信する。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto#admin-v3-listenersconfigdump

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://localhost:15000/config_dump?resource={dynamic_listeners}
```

#### ▼ dynamic_route_configs

サービスディスカバリーによって動的に登録された設定値（特に、ルート）を、JSON形式でレスポンスとして返信する。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto#admin-v3-listenersconfigdump

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://localhost:15000/config_dump?resource={dynamic_route_configs}
```


#### ▼ static_listeners

静的なリスナー値を返信する。

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://localhost:15000/config_dump?resource={static_listeners}

{
 "configs": [
  {
   "@type": "type.googleapis.com/envoy.admin.v3.ListenersConfigDump.StaticListener",
   "listener": {
    "@type": "type.googleapis.com/envoy.config.listener.v3.Listener",
    "address": {
     "socket_address": {
      "address": "0.0.0.0",
      "port_value": 15090 # メトリクス収集ツールからのリクエストを受信するためのポート番号
     }
    },
    
    ...
    
  },
  {
   "@type": "type.googleapis.com/envoy.admin.v3.ListenersConfigDump.StaticListener",
   "listener": {
    "@type": "type.googleapis.com/envoy.config.listener.v3.Listener",
    "address": {
     "socket_address": {
      "address": "0.0.0.0",
      "port_value": 15021 # kubeletからのヘルスチェックを受信するためのポート番号
     }
    },
    
    ...
    
  }
 ]
}
```


<br>
