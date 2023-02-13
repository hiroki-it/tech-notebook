---
title: 【IT技術の知見】リソース＠Istio
description: リソース＠Istioの知見を記録しています。
---

# リソース＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. リソースとオブジェクト

### Istioリソース

Istioの各コンポーネントのことにより、Kubernetesのカスタムリソースとして定義されている。



<br>

### Istioオブジェクト

マニフェストによって量産されたIstioリソースのインスタンスのこと。



<br>

## 02. インバウンド通信に関するリソース

### IngressGateway

#### ▼ IngressGatewayとは

Gateway、VirtualService、DestinationRuleの設定を基に、Node外からインバウンド通信を受信し、Podにルーティングする。

KubernetesリソースのIngressの代わりとして使用できる。

> ↪️ 参考：https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-control/

#### ▼ IngressGatewayの仕組み

![istio_ingress-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_ingress-gateway.png)

IngressGatewayは、```istio-ingressgateway```というService（NodePort ServiceまたはLoadBalancer Service）と、Deployment配下の```istio-ingressgateway-*****```というPod（```istio-proxy```コンテナのみが稼働）、から構成される。

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
  # ルーティンング先のPod（istio-ingressgateway-*****）の識別子が設定される。
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
      # コンテナの公開ポートがspec.containers[].portsキーに定義されていなくても問題ない。
      ports:
        - containerPort: 15090
          name: http-envoy-prom
          protocol: TCP

      ...

# 重要なところ以外を省略しているため、全体像はその都度確認すること。
```

> ↪️ 参考：
>
> - https://qiita.com/J_Shell/items/296cd00569b0c7692be7
> - https://blog.jayway.com/2018/10/22/understanding-istio-ingress-gateway-in-kubernetes/
> - https://layer5.io/learn/learning-paths/mastering-service-meshes-for-developers/introduction-to-service-meshes/istio/expose-services/

<br>

### Gateway

#### ▼ Gatewayとは

IngressGatewayの能力のうち、Node外から受信したインバウンド通信をフィルタリングする能力を担う。


![istio_gateway_virtual-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_gateway_virtual-service.png)




> ↪️ 参考：
>
> - https://istio.io/latest/blog/2018/v1alpha3-routing/
> - https://micpsm.hatenablog.com/entry/k8s-istio-dx

<br>

### VirtualService

#### ▼ VirtualServiceとは



IngressGatewayの能力のうち、IngressGatewayで受信したインバウンド通信を、Serviceを介してDestinationRuleにルーティングする能力を担う。

ルーティング先のServiceは、Istioのコンポーネントではないに注意する。

ルーティング先のServiceが見つからないと、```404```ステータスを返信する。

![istio_gateway_virtual-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_gateway_virtual-service.png)

> ↪️ 参考：
>
> - https://tech.uzabase.com/entry/2018/11/26/110407
> - https://knowledge.sakura.ad.jp/20489/
> - https://micpsm.hatenablog.com/entry/k8s-istio-dx

#### ▼ Envoyの設定値として

VirtualServiceの設定値は、Envoyのフロントプロキシの設定値としてIstioリソースに適用される。



> ↪️ 参考：
>
> - https://istio.io/latest/docs/concepts/traffic-management/
> - http://blog.fujimisakari.com/service_mesh_and_routing_and_lb/
> - https://sreake.com/blog/istio/

#### ▼ VirtualService数


| 場合                          | VirtualService数                                                                       |
|-----------------------------|---------------------------------------------------------------------------------------|
| API GatewayをIstioで管理する場合  | 外部からのインバウンド通信をAPI GatewayにルーティングするVirtualServiceを1つだけ作成しておけばよい。                  |
| API GatewayをIstioで管理しない場合 | API Gatewayから全てのアプリコンテナにルーティングできるように、各アプリコンテナにルーティングできるVirtualServiceを定義する必要がある。 |

> ↪️ 参考：https://www.moesif.com/blog/technical/api-gateways/How-to-Choose-The-Right-API-Gateway-For-Your-Platform-Comparison-Of-Kong-Tyk-Apigee-And-Alternatives/

<br>

## 03. アウトバウンド通信に関するリソース

### EgressGateway

#### ▼ EgressGatewayとは

Clusterネットワーク内からアウトバウンド通信を受信し、フィルタリングした後、パブリックネットワークにルーティングする。

![istio_gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_gateway.png)

> ↪️ 参考：https://knowledge.sakura.ad.jp/20489/


<br>

### ServiceEntry

#### ▼ ServiceEntryとは

コンフィグストレージにサービスメッシュ外部のドメイン名などを登録する。

![istio_service-entry](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_service-entry.png)

> ↪️ 参考：https://tech.uzabase.com/entry/2018/11/26/110407

<br>

## 04. 両方向通信に関するリソース

### DestinationRule

#### ▼ DestinationRuleとは

| 通信方向 | 能力                                                                                                                                | 補足                                                                                                  |
|----------|-----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| インバウンド   | IngressGatewayの能力のうち、Serviceで受信したインバウンド通信をいずれのPodにルーティングするか、を決める能力を担う。Service自体の設定は、IstioではなくKubernetesで行うことに注意する。 |                                                                                                       |
| アウトバウンド  | ```istio-proxy```コンテナの送信するアウトバウンド通信をTLSで暗号化するか否か、を決める能力を担う。                                                             | ↪️ 参考：https://istio.io/latest/docs/ops/configuration/traffic-management/tls-configuration/#sidecars |

#### ▼ Envoyの設定値として

DestinationRuleの設定値は、Envoyのリバースプロキシコンテナの設定値として```istio-proxy```コンテナに適用される。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/concepts/traffic-management/
> - http://blog.fujimisakari.com/service_mesh_and_routing_and_lb/
> - https://sreake.com/blog/istio/

<br>
