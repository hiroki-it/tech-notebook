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

Kubernetes と Istio には重複する能力がいくつか (例：サービス検出) ある。すべての Pod の istio-proxy をインジェクションする場合、kube-proxy と Service によるサービスメッシュは不要になる。

ただし、実際の運用場面ではこれを実行することはなく、マイクロサービスの稼働する Pod のみでこれを行えばよい。

そのため、istio-proxy をインジェクションしない Pod では、Istio ではなく、従来の kube-proxy と Service によるサービス検出を使用することになる。

| 能力                                       | Istio + Kubernetes + Envoy                                                                                                                                                                                                                | Kubernetes + Envoy             | Kubernetesのみ                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------ |
| サービスメッシュコントロールプレーン       | Istiodコントロールプレーン (`discovery` コンテナ)                                                                                                                                                                                         | go-control-plane               | なし                                             |
| サービス検出でのルーティング先設定         | DestinationRule                                                                                                                                                                                                                           | `route` キー                   | kube-proxy + Service (+ CoreDNS)                 |
| サービス検出でのリスナー                   | EnvoyFilter + EndpointSlice                                                                                                                                                                                                               | `listener` キー                | kube-proxy + Service (+ CoreDNS)                 |
| トラフィック管理                           | VirtualService + Service + DestinationRule                                                                                                                                                                                                | 記入中...                      | Service                                          |
| サービス検出での追加サービス設定           | ServiceEntry + EndpointSlice                                                                                                                                                                                                              | `cluster` キー                 | EndpointSlice                                    |
| Cluster外Nodeに対するサービス検出          | WorkloadEntry                                                                                                                                                                                                                             | `endpoint` キー                | Egress                                           |
| サービスレジストリ                         | etcd                                                                                                                                                                                                                                      | etcd                           | etcd                                             |
| Node外からのインバウンド通信のルーティング | ・VirtualService + Gateway (内部的には、NodePort ServiceまたはLoadBalancer Serviceが作成され、これらはNode外からのインバウンド通信を待ち受けられるため、Ingressは不要である) <br>・Ingress + Istio Ingress Controller + ClusterIP Service | `route` キー + `listener` キー | Ingress + Ingress Controller + ClusterIP Service |

> - https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/
> - https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/
> - https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/
> - https://layer5.io/learn/learning-paths/mastering-service-meshes-for-developers/introduction-to-service-meshes/istio/expose-services/

<br>

### Istio APIからKubernetes Gateway APIへの置き換え

Istio の Gateway や VirtualService は、Kubernetes Gateway API の Gateway や HTTPRoute などに置き換えられる。

しかし、Istio の Gateway や VirtualService がもつ機能の多くに必要であり、例えば HTTPRoute は VirtualService のような Pod 間通信に非対応である。

置き換えることなく、Istio の API をそのまま使用すればよい。

Google Cloud Service Mesh では、HTTPRoute などを補うカスタムリソースとして、Mesh がある。

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

Kubernetes と Istio 上の Pod は、Service の完全修飾ドメイン名の URL (`http://foo-service.default.svc.cluster.local`) を指定すると、その Service の配下にある Pod と HTTP で通信できる。

指定する URL は Kubernetes のみの場合と同じであるが、実際は Service を経由しておらず、Pod 間で直接的に通信している。

Pod 間 (フロントエンド領域とマイクロサービス領域間、マイクロサービス間) を HTTPS で通信したい場合、Istio の相互 TLS 認証を有効化する必要がある。

> - https://github.com/istio/istio/issues/10864#issue-397801391
> - https://discuss.istio.io/t/pod-to-pod-communication/8939/5
> - https://stackoverflow.com/a/71502783/12771072

<br>

### Kubernetesのみ

Kubernetes 上の Pod は、Service の完全修飾ドメイン名の URL (`http://foo-service.default.svc.cluster.local`) を指定すると、その Service の配下にある Pod と HTTP で通信できる。

Pod 間 (フロントエンド領域とマイクロサービス領域間、マイクロサービス間) を HTTPS で通信したい場合、Cert Manager などを使用して、Pod にサーバー証明書やクライアント証明書をマウントする必要がある。

<br>
