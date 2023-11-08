---
title: 【IT技術の知見】リソース＠Istio
description: リソース＠Istioの知見を記録しています。
---

# リソース＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. トラフィック管理系リソース

記入中...

<br>

## 01-02. Cluster外からの通信

### IngressGateway

#### ▼ IngressGatewayとは

`L4`/`L7`ロードバランサーを作成する。

Gateway、VirtualService、DestinationRuleの設定を基に、Node外からインバウンド通信を受信し、Podにルーティングする。

KubernetesリソースのIngressの代わりとして使用できる。

> - https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-control/

#### ▼ IngressGatewayの仕組み

![istio_ingress-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ingress-gateway.png)

IngressGatewayは、`istio-ingressgateway`というService (NodePort ServiceまたはLoadBalancer Service) と、Deployment配下の`istio-ingressgateway-*****`というPod (`istio-proxy`コンテナのみが稼働) 、から構成される。

Serviceは、おおよそGatewayの設定で決まる。

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: istio-ingressgateway
    istio: ingressgateway
  name: istio-ingressgateway
  namespace: ingress
spec:
  # Serviceタイプは選択可能である。
  type: NodePort
  # ルーティンング先のPod (istio-ingressgateway-*****) の識別子が設定される。
  selector:
    app: istio-ingressgateway
    istio: ingressgateway
  # ルーティング先のPodのポート番号が設定される。
  ports:
    - name: http-foo
      nodePort: 30001
      port: 443
      protocol: TCP
      targetPort: 443
    - name: http-bar
      nodePort: 30002
      port: 3000
      protocol: TCP
      targetPort: 3000
    - name: http-baz
      nodePort: 30003
      port: 9090
      protocol: TCP
      targetPort: 9090
```

Podは、おおよそVirtualServiceの設定で決まる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: istio-ingressgateway
    istio: ingressgateway
  name: istio-ingressgateway
  namespace: istio-ingress
spec:
  containers:
    - args:
        # pilot-agent proxyコマンド
        # https://istio.io/latest/docs/reference/commands/pilot-agent/#pilot-agent-proxy
        - proxy
        - router
        - --domain
        - $(POD_NAMESPACE).svc.cluster.local
        - --proxyLogLevel=warning
        - --proxyComponentLogLevel=misc:error
        - --log_output_level=default:info
      image: docker.io/istio/proxyv2:<リビジョン番号>
      name: istio-proxy
      # 待ち受けるポート番号の仕様
      # コンテナの公開ポートがspec.containers[*].portsキーに定義されていなくても問題ない。
      ports:
        - containerPort: 15090
          name: http-envoy-prom
          protocol: TCP

      ...

# 重要なところ以外を省略しているため、全体像はその都度確認すること。
```

> - https://qiita.com/J_Shell/items/296cd00569b0c7692be7
> - https://blog.jayway.com/2018/10/22/understanding-istio-ingress-gateway-in-kubernetes/
> - https://layer5.io/learn/learning-paths/mastering-service-meshes-for-developers/introduction-to-service-meshes/istio/expose-services/

<br>

### Gateway

#### ▼ Gatewayとは

IngressGatewayの能力のうち、Node外から受信したインバウンド通信をフィルタリングする能力を担う。

そのため、Node外からインバウンド通信を受信するわけではない (例：サービスディスカバリーによるインバウンド通信のみを受信) Podでは、Gatewayは不要である。

![istio_gateway_virtual-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_gateway_virtual-service.png)

> - https://istio.io/latest/blog/2018/v1alpha3-routing/
> - https://micpsm.hatenablog.com/entry/k8s-istio-dx

#### ▼ `404`ステータス

受信したインバウンド通信の`Host`ヘッダーが条件に合致していなかったり、ルーティング先のVirtualServiceが見つからなかったりすると、`404`ステータスを返信する。

> - https://stackoverflow.com/a/73824193
> - https://micpsm.hatenablog.com/entry/k8s-istio-dx

<br>

## 01-03. Cluster外への通信

### EgressGateway

#### ▼ EgressGatewayとは

Clusterネットワーク内からアウトバウンド通信を受信し、フィルタリングした後、パブリックネットワークにルーティングする。

![istio_gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_gateway.png)

> - https://knowledge.sakura.ad.jp/20489/

<br>

### ServiceEntry

#### ▼ ServiceEntryとは

コンフィグストレージにサービスメッシュ外部のドメイン名などを登録する。

![istio_service-entry](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_service-entry.png)

> - https://tech.uzabase.com/entry/2018/11/26/110407

<br>

## 01-04. Cluster内外の通信、Pod間通信

### VirtualService

#### ▼ VirtualServiceとは

Cluster外からの通信では、IngressGatewayで受信したインバウンド通信を、Serviceを介してDestinationRuleにルーティングする。

またPod間通信では、宛先Podに紐づくVirtualServiceから情報を取得し、これを宛先とする。

Pod間通信の時は、VirtualServiceとDestinationのみを使用する。

![istio_gateway_virtual-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_gateway_virtual-service.png)

> - https://tech.uzabase.com/entry/2018/11/26/110407
> - https://knowledge.sakura.ad.jp/20489/

#### ▼ Envoyの設定値として

Istioは、VirtualServiceの設定値をEnvoyのリスナー値とルート値に変換する。

```bash
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -c istio-proxy \
    -- bash -c "curl http://127.0.0.1:15000/config_dump?resource={dynamic_listeners}" | yq -P

configs:
  - "@type": type.googleapis.com/envoy.admin.v3.ListenersConfigDump.DynamicListener
    # リスナー値
    name: 0.0.0.0_50002
    active_state:
      version_info: 2022-11-24T12:13:05Z/468
      listener:
        "@type": type.googleapis.com/envoy.config.listener.v3.Listener
        name: 0.0.0.0_50002
        address:
          socket_address:
            address: 0.0.0.0
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
                    route_config_name: 50002
  ...

  - "@type": type.googleapis.com/envoy.admin.v3.ListenersConfigDump.DynamicListener

  ...
```

```bash
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -c istio-proxy \
    -- bash -c "curl http://127.0.0.1:15000/config_dump?resource={dynamic_route_configs}" | yq -P

configs:
  - "@type": type.googleapis.com/envoy.admin.v3.RoutesConfigDump.DynamicRouteConfig
    # ルート値
    version_info: 2022-11-24T12:13:05Z/468
    route_config:
      "@type": type.googleapis.com/envoy.config.route.v3.RouteConfiguration
      name: 50002
      virtual_hosts:
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

つまり、VirtualServiceとDestinationRuleの情報を使用し、IngressGatewayで受信したインバウンド通信とPod間通信の両方を実施する。

```bash
クライアント
⬇︎
envoy
⬇︎
------------
⬇︎
envoy # クライアント側Envoyからのリクエストをアプリが受信できるように、リスナー値とルート値になる
⬇︎
アプリ
```

> - https://taisho6339.hatenablog.com/entry/2020/05/11/235435
> - https://sreake.com/blog/istio/

#### ▼ `404`ステータス

Gatewayから受信したインバウンド通信の`Host`ヘッダーが条件に合致していなかったり、ルーティング先のVirtualServiceが見つからなかったりすると、`404`ステータスを返信する。

#### ▼ VirtualService数

|                    | API GatewayをIstioで管理する場合                                                                     | API GatewayをIstioで管理しない場合                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| VirtualServiceの数 | 外部からのインバウンド通信をAPI GatewayにルーティングするVirtualServiceを1つだけ作成しておけばよい。 | API Gatewayから全てのアプリコンテナにルーティングできるように、各アプリコンテナにルーティングできるVirtualServiceを定義する必要がある。 |

> - https://www.moesif.com/blog/technical/api-gateways/How-to-Choose-The-Right-API-Gateway-For-Your-Platform-Comparison-Of-Kong-Tyk-Apigee-And-Alternatives/

<br>

### DestinationRule

#### ▼ DestinationRuleとは

Cluster外からの通信では、IngressGatewayに紐づくVirtualServiceで受信したインバウンド通信を、いずれのPodにルーティングするかを決める。

またPod間通信では、`istio-proxy`コンテナの送信するアウトバウンド通信をTLSで暗号化するか否かを決める。

> - https://istio.io/latest/docs/ops/configuration/traffic-management/tls-configuration/#sidecars

#### ▼ Envoyの設定値として

Istioは、DestinationRuleの設定値をEnvoyのクラスター値とエンドポイント値に変換する。

```bash
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -c istio-proxy \
    -- bash -c "curl http://127.0.0.1:15000/config_dump?resource={dynamic_active_clusters}" | yq -P

configs:
  - "@type": type.googleapis.com/envoy.admin.v3.ClustersConfigDump.DynamicCluster
    # クラスター値
    version_info: 2022-11-24T12:13:05Z/468

    cluster:
      "@type": type.googleapis.com/envoy.config.cluster.v3.Cluster
      name: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
      type: EDS
      eds_cluster_config:
        eds_config:
          ads: {}
          initial_fetch_timeout: 0s
          resource_api_version: V3
        service_name: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
  ...

  - "@type": type.googleapis.com/envoy.admin.v3.ClustersConfigDump.DynamicCluster

  ...
```

```bash
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -c istio-proxy \
    -- bash -c "curl http://127.0.0.1:15000/config_dump?include_eds" | yq -P

configs:
  # エンドポイント値
  dynamic_endpoint_configs:
    - endpoint_config:
        "@type": type.googleapis.com/envoy.config.endpoint.v3.ClusterLoadAssignment
        cluster_name: outbound|50002|v1|bar-service.bar-namespace.svc.cluster.local
        endpoints:
          - locality:
              region: ap-northeast-1
              zone: ap-northeast-1a
            lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: 11.0.0.1
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
                      address: 11.0.0.2
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
                      address: 11.0.0.3
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

つまり、VirtualServiceとDestinationRuleの情報を使用し、IngressGatewayで受信したインバウンド通信とPod間通信の両方を実施する。

Pod間通信の時は、VirtualServiceとDestinationのみを使用する。

```bash
クライアント
⬇︎
envoy
⬇︎
------------
⬇︎
envoy # クライアント側Envoyからのリクエストをアプリが受信できるように、クラスター値とエンドポイント値になる
⬇︎
アプリ
```

> - https://taisho6339.hatenablog.com/entry/2020/05/11/235435
> - https://sreake.com/blog/istio/

> - <br>

## 02. 認証系リソース

### PeerAuthentication

Pod間通時に、相互TLS認証を実施する。

> - https://news.mynavi.jp/techplus/article/kubernetes-30/

<br>

### RequestAuthentication

Pod間通信時に、JWTによるBearer認証を実施する。

> - https://news.mynavi.jp/techplus/article/kubernetes-30/

<br>
