---
title: 【IT技術の知見】Istioを採用しない場合との比較＠Istio
description: Istioを採用しない場合との比較＠Istioの知見を記録しています。
---

# Istioを採用しない場合との比較＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 比較表

### IstioとKubernetesのみの比較

KubernetesとIstioには重複する能力がいくつか (例：サービス検出) ある。全てのPodのistio-proxyをインジェクションする場合、kube-proxyとServiceによるサービスメッシュは不要になる。

ただし、実際の運用場面ではこれを実行することはなく、マイクロサービスの稼働するPodのみでこれを行えばよい。

そのため、istio-proxyをインジェクションしないPodでは、Istioではなく、従来のkube-proxyとServiceによるサービス検出を使用することになる。

| 能力                                       | Istio + Kubernetes + Envoy                                                                                                                                                                                                                | Kubernetes + Envoy           | Kubernetesのみ                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------ |
| サービスメッシュコントロールプレーン       | Istiodコントロールプレーン (`discovery`コンテナ)                                                                                                                                                                                          | go-control-plane             | なし                                             |
| サービス検出でのルーティング先設定         | DestinationRule                                                                                                                                                                                                                           | `route`キー                  | kube-proxy + Service (+ CoreDNS)                 |
| サービス検出でのリスナー                   | EnvoyFilter + EndpointSlice                                                                                                                                                                                                               | `listener`キー               | kube-proxy + Service (+ CoreDNS)                 |
| トラフィック管理                           | VirtualService + Service + DestinationRule                                                                                                                                                                                                | 記入中...                    | Service                                          |
| サービス検出での追加サービス設定           | ServiceEntry + EndpointSlice                                                                                                                                                                                                              | `cluster`キー                | EndpointSlice                                    |
| Cluster外Nodeに対するサービス検出          | WorkloadEntry                                                                                                                                                                                                                             | `endpoint`キー               | Egress                                           |
| サービスレジストリ                         | etcd                                                                                                                                                                                                                                      | etcd                         | etcd                                             |
| Node外からのインバウンド通信のルーティング | ・VirtualService + Gateway (内部的には、NodePort ServiceまたはLoadBalancer Serviceが作成され、これらはNode外からのインバウンド通信を待ち受けられるため、Ingressは不要である) <br>・Ingress + Istio Ingress Controller + ClusterIP Service | `route`キー + `listener`キー | Ingress + Ingress Controller + ClusterIP Service |

> - https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/
> - https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/
> - https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/
> - https://layer5.io/learn/learning-paths/mastering-service-meshes-for-developers/introduction-to-service-meshes/istio/expose-services/

<br>

### Istio APIからKubernetes Gateway APIへの置き換え

IstioのGatewayやVirtualServiceは、Kubernetes Gateway APIのGatewayやHTTPRouteなどに置き換えられる。

しかし、IstioのGatewayやVirtualServiceがもつ機能の多くに必要であり、例えばHTTPRouteはVirtualServiceのようなPod間通信に非対応である。

置き換えることなく、IstioのAPIをそのまま使用すればよい。

Google Cloud Service Meshでは、HTTPRouteなどを補うカスタムリソースとして、Meshがある。

| Istio API             | Kubernetes Gateway APIへの置き換え                                   |
| --------------------- | -------------------------------------------------------------------- |
| AuthorizationPolicy   | そのまま使用                                                         |
| DestinationRule       | そのまま使用                                                         |
| EnvoyFilter           | そのまま使用                                                         |
| Gateway               | Kubernetes Gateway                                                   |
| PeerAuthentication    | そのまま使用                                                         |
| ProxyConfig           | そのまま使用                                                         |
| RequestAuthentication | そのまま使用                                                         |
| ServiceEntry          | そのまま使用                                                         |
| Sidecar               | そのまま使用                                                         |
| Telemetry             | そのまま使用                                                         |
| VirtualService        | ・GRPCRoute<br>・HTTPRoute<br>・TCPRoute<br>・TLSRoute<br>・UDPRoute |
| WasmPlugin            | そのまま使用                                                         |
| WorkloadEntry         | そのまま使用                                                         |
| WorkloadGroup         | そのまま使用                                                         |

<br>

## 01-02. Istioのメリット/デメリット

### メリット

> - https://blog.container-solutions.com/wtf-is-istio
> - https://www.containiq.com/post/kubernetes-service-mesh
> - https://jimmysong.io/en/blog/why-do-you-need-istio-when-you-already-have-kubernetes/#shortcomings-of-kube-proxy
> - https://www.zhaohuabing.com/post/2019-04-16-how-to-choose-ingress-for-service-mesh-english/
> - https://www.baeldung.com/cs/service-discovery-microservices

<br>

### デメリット

| 項目                                   | 説明                                                                                                                                                                                                                         |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nodeのハードウェアリソースの消費量増加 | IstioのPod間通信では、Kubernetesと比べて、通信に必要なコンポーネント (例：Istiodコントロールプレーン、istio-proxy) が増える。そのため、Nodeのハードウェアリソースの消費量が増え、また宛先Podからのレスポンス速度が低くなる。 |
| 学習コストの増加                       | Istioが多機能であり、学習コストが増加する。                                                                                                                                                                                  |

> - https://arxiv.org/pdf/2004.00372.pdf
> - https://www.containiq.com/post/kubernetes-service-mesh

<br>

## 02. トラフィック管理

### Istio + Kubernetes + Envoy

KubernetesとIstio上のPodは、Serviceの完全修飾ドメイン名のURL (`http://foo-service.default.svc.cluster.local`) を指定すると、そのServiceの配下にあるPodとHTTPで通信できる。

指定するURLはKubernetesのみの場合と同じであるが、実際はServiceを経由しておらず、Pod間で直接的に通信している。

Pod間 (フロントエンド領域とマイクロサービス領域間、マイクロサービス間) をHTTPSで通信したい場合、Istioの相互TLS認証を有効化する必要がある。

> - https://github.com/istio/istio/issues/10864#issue-397801391
> - https://discuss.istio.io/t/pod-to-pod-communication/8939/5
> - https://stackoverflow.com/a/71502783/12771072

<br>

### Kubernetesのみ

Kubernetes上のPodは、Serviceの完全修飾ドメイン名のURL (`http://foo-service.default.svc.cluster.local`) を指定すると、そのServiceの配下にあるPodとHTTPで通信できる。

Pod間 (フロントエンド領域とマイクロサービス領域間、マイクロサービス間) をHTTPSで通信したい場合、Cert Managerなどを使用して、Podにサーバー証明書やクライアント証明書をマウントする必要がある。

<br>
