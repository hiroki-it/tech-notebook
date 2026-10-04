---
title: 【IT技術の知見】Istioを採用しない場合との比較＠Istio
description: Istioを採用しない場合との比較＠Istioの知見を記録しています。
---

# Istio を採用しない場合との比較＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. 比較表

### Istio と Kubernetes のみの比較

Kubernetes と Istio には重複する能力がいくつか (例：サービス検出) ある。istio-proxy をインジェクションした Pod 間の通信では、kube-proxy や Service が通信を中継しない。ただし、Service や EndpointSlice は Istio に宛先情報を提供するために必要である。

実際の運用では、サービスメッシュで管理するマイクロサービスなどの Pod に istio-proxy をインジェクションする。

そのため、istio-proxy をインジェクションしない Pod では、Istio ではなく、従来の CoreDNS などによるサービス検出と、kube-proxy と Service によるルーティングを使用することになる。

| 能力                                        | Istio + Kubernetes + Envoy                                                                                                                                                                                                                      | Kubernetes + Envoy             | Kubernetes のみ                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------ |
| サービスメッシュコントロールプレーン        | Istiod コントロールプレーン (`discovery` コンテナ)                                                                                                                                                                                              | go-control-plane               | なし                                             |
| サービス検出でのルーティング先設定          | VirtualService + DestinationRule                                                                                                                                                                                                                                 | `route` キー                   | kube-proxy + Service + CoreDNS                 |
| サービス検出でのリスナー                    | EnvoyFilter + EndpointSlice                                                                                                                                                                                                                     | `listener` キー                | kube-proxy + Service + CoreDNS                 |
| トラフィック管理                            | VirtualService + Service + DestinationRule                                                                                                                                                                                                      | 記入中...                      | Service                                          |
| サービス検出での追加サービス設定            | ServiceEntry + EndpointSlice                                                                                                                                                                                                                    | `cluster` キー                 | EndpointSlice                                    |
| Cluster 外 Node に対するサービス検出        | ServiceEntry + WorkloadEntry                                                                                                                                                                                                                                   | `endpoint` キー                | Egress                                           |
| サービスレジストリ                          | kube-apiserver | etcd                           | kube-apiserver |
| Node 外からのインバウンド通信のルーティング | ・VirtualService + Gateway (内部的には、NodePort Service または LoadBalancer Service が作成され、これらは Node 外からのインバウンド通信を待ち受けられるため、Ingress は不要である) <br>・Ingress + Istio Ingress Controller + ClusterIP Service | `route` キー + `listener` キー | Ingress + Ingress Controller + ClusterIP Service |

> - [Why Do You Need Istio When You Already Have Kubernetes? - The New Stack](https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/)
> - [Kubernetes vs. Istio Gateway: The Ultimate Guide \| Mirantis](https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/)
> - [Istio / Kubernetes Ingress](https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/)
> - [Exposing services through Istio Ingress Gateway](https://layer5.io/learn/learning-paths/mastering-service-meshes-for-developers/introduction-to-service-meshes/istio/expose-services/)

<br>

### Istio API から Kubernetes Gateway API への置き換え

Istio の Gateway や VirtualService は、Kubernetes Gateway API の Gateway や HTTPRoute などに置き換えられる。

しかし、Istio の Gateway や VirtualService がもつ機能の多くに必要であり、例えば HTTPRoute は VirtualService のような Pod 間通信に非対応である。

置き換えることなく、Istio の API をそのまま使用すればよい。

Google Cloud Service Mesh では、HTTPRoute などを補うカスタムリソースとして、Mesh がある。

| Istio API             | Kubernetes Gateway API への置き換え                                  |
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

## 01-02. Istio のメリット/デメリット

### メリット

> - [WTF is Istio?](https://blog.container-solutions.com/wtf-is-istio)
> - https://www.containiq.com/post/kubernetes-service-mesh
> - https://jimmysong.io/en/blog/why-do-you-need-istio-when-you-already-have-kubernetes/#shortcomings-of-kube-proxy
> - [Which One is the Right Choice for the Ingress Gateway of Your Service Mesh? \| 赵化冰的博客 \| Zhaohuabing Blog](https://www.zhaohuabing.com/post/2019-04-16-how-to-choose-ingress-for-service-mesh-english/)
> - [Service Discovery in Microservices \| Baeldung on Computer Science](https://www.baeldung.com/cs/service-discovery-microservices)

<br>

### デメリット

| 項目                                    | 説明                                                                                                                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Node のハードウェアリソースの消費量増加 | Istio の Pod 間通信では、Kubernetes と比べて、通信に必要なコンポーネント (例：Istiod コントロールプレーン、istio-proxy) が増える。そのため、Node のハードウェアリソースの消費量が増え、また宛先 Pod からのレスポンス速度が低くなる。 |
| 学習コストの増加                        | Istio が多機能であり、学習コストが増加する。                                                                                                                                                                                         |

> - https://arxiv.org/pdf/2004.00372.pdf
> - https://www.containiq.com/post/kubernetes-service-mesh

<br>

## 02. トラフィック管理

### Istio + Kubernetes + Envoy

Kubernetes と Istio 上の Pod は、Service の完全修飾ドメイン名の URL (`http://foo-service.default.svc.cluster.local`) を指定すると、その Service の配下にある Pod と HTTP で通信できる。

指定する URL は Kubernetes のみの場合と同じであるが、実際は Service を経由しておらず、Pod 間で直接的に通信している。

Pod 間 (フロントエンド領域とマイクロサービス領域間、マイクロサービス間) では、istio-proxy 間の相互 TLS 認証によって通信を暗号化できる。Auto mTLS が有効な場合、通信元 istio-proxy は宛先に応じて相互 TLS 認証を自動的に選択する。

> - [Istio on Kubernetes: pod to service communication doesn't work · Issue #10864 · istio/istio · GitHub](https://github.com/istio/istio/issues/10864#issue-397801391)
> - https://discuss.istio.io/t/pod-to-pod-communication/8939/5
> - https://stackoverflow.com/a/71502783/12771072

<br>

### Kubernetes のみ

Kubernetes 上の Pod は、Service の完全修飾ドメイン名の URL (`http://foo-service.default.svc.cluster.local`) を指定すると、その Service の配下にある Pod と HTTP で通信できる。

Pod 間 (フロントエンド領域とマイクロサービス領域間、マイクロサービス間) を HTTPS で通信したい場合、外部認証局や各コンポーネントで証明書の発行・取得を実装し、取得した証明書をメモリやマウントしたファイルなどに保持する必要がある。

<br>
