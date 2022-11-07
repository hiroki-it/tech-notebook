---
title: 【IT技術の知見】API＠Envoy
description: API＠Envoyの知見を記録しています。
---

# envoy.yaml＠Envoy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Global

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

## 02. ConfigDump-API

### ConfigDump-APIとは

```envoy```プロセスの現在の設定値を持つレスポンスを返信する。```envoy```プロセスの稼働するサーバー/コンテナからローカルホストにリクエストを送信すると確認できる。

> ℹ️ 参考：https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto#configdump-proto

```bash
# envoyコンテナ内でローカルホストにリクエストを送信する。
envoy@<コンテナ名>: $ curl http://localhost:15000/config_dump
```


<br>

### ClustersConfigDump

#### ▼ ClustersConfigDump

Envoyは、コントロールプレーン（ビルトイン、Istio、Consul）のXDSに、通信の宛先情報を定期的にリクエストし、レスポンスに含まれる情報を```clusters```キー配下に自動的に設定する。

#### ▼ dynamic_active_clusters

準備済みの宛先を自動的に設定する。

> ℹ️ 参考：
>
> - https://www.envoyproxy.io/docs/envoy/latest/operations/admin#get--config_dump
> - https://www.envoyproxy.io/docs/envoy/latest/start/sandboxes/dynamic-configuration-control-plane#step-2-check-initial-config-and-web-response
> - https://cloud.tencent.com/developer/article/1701214


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

<br>

#### ▼ dynamic_warm_clusters

準備が完了していない（ウォーミングアップ中）に宛先情報を自動的に設定する。もしウォーミングアップ中の宛先にルーティングしてしまった場合は、```404```ステータスや```503```ステータス（特に、Istio）になる。

> ℹ️ 参考：
>
> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/cluster_manager#cluster-warming
> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/admin/v3/config_dump_shared.proto.html?highlight=dynamiccluster#admin-v3-clustersconfigdump

```bash
envoy@<コンテナ名>: $ curl http://localhost:15000/config_dump?resource={dynamic_warming_clusters}

{} # 何もなければ空配列になる。
```



<br>
