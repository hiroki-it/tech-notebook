---
title: 【IT技術の知見】Istio＠カスタムリソース
description: Istio＠カスタムリソースの知見を記録しています。
---

# Istio＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Istioの仕組み

### アーキテクチャ

#### ▼ サイドカーメッシュ

![istio_sidecar-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_sidecar-mesh_architecture.png)

サイドカーメッシュは、データプレーン、コントロールプレーン、から構成される。サイドカープロキシを使用して、サービスメッシュを実装する。サイドカーは、```L4```（トランスポート層）と```L7```（アプリケーション層）に関する責務を持つ。ただ必ずしも、Istioリソースを使用する必要はなく、代わりに、KubernetesやOpenShiftに内蔵されたIstioに相当する機能を使用しても良い。

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/ops/deployment/architecture/
> - https://techblog.zozo.com/entry/zozotown-istio-production-ready
> - https://www.amazon.co.jp/dp/B09XN9RDY1

#### ▼ アンビエントメッシュ

![istio_ambient-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_ambient-mesh_architecture.png)

アンビエントメッシュは、データプレーン、コントロールプレーン、から構成される。Node内の単一プロキシを使用して、サービスメッシュを実装する。ztunnel（実体はデーモンとして稼働するエージェント）が```L4```（トランスポート層）、waypoint-proxy（実体はPod）が```L7```（アプリケーション層）に関する責務を持つ。Node外からのインバウンド通信、またNode外へのアウトバウンド通信は、ztunnel経由して、一度waypoint-proxyにリダイレクトされる。ztunnelエージェントを経由した段階でHTTPs通信になる。リソース消費量の少ない```L4```と多い```L7```の責務が分離されているため、サイドカーメッシュと比較して、```L4```のみを使用する場合に、ワーカーNodeのリソース消費量を節約できる。サイドカーメッシュを将来的に廃止するということはなく、好きな方を選べるようにするらしい。

```
インバウンド時：
外 → Node入口 →  ztunnelエージェント（L4）→ … → waypoint Pod（L7） → Pod → アプリコンテナ

アウトバウンド時：
アプリコンテナ → Pod → ztunnelエージェント（L4） → waypoint Pod（L7） → … → Node出口 → 外
```



> ℹ️ 参考：
>
> - https://istio.io/latest/blog/2022/introducing-ambient-mesh/
> - https://airmedltd.com/with-ambient-mesh-google-and-solo-io-offer-an-istio-without-sidecars/

<br>

### 他のOSSツールとの比較

> ℹ️ 参考：https://www.amazon.co.jp/dp/1492043788

| 機能（2022/08/21時点）      | Istio | Linkerd | Consul |
|------------------------|:-----:|:--------:|:------:|
| 機能の豊富さ                 | ⭕️   | △       | △     |
| 異なるClusterのデータプレーン内管理  | ⭕️   | ×       | ⭕️    |
| 仮想サーバーのデータプレーン内管理      | ⭕️ | × | ⭕️ |
| ダッシュボード                | × |    ⭕️    | ⭕️   |
| サービスディスカバリー            | ⭕️   |    ⭕️    | ⭕️    |
| メトリクス収集                | ⭕️   |    ⭕️    | ×     |
| 分散トレース収集               | ⭕️   | ×       | ⭕️    |
| 相互TLS                  | ⭕️   |    ⭕️    | ⭕️    |
| ポリシーベースのACL            | ⭕️   | ×       | ×     |
| 意図ベースのACL              | ×    | ×       | ⭕️    |
| SSL証明書管理               | ⭕️   | ×       | ⭕️    |
| HTTP/1.2、HTTP/2.0、gRPC | ⭕️   |    ⭕️    | ×     |
| TCP                    | ⭕️   |    ⭕️    | ⭕️    |
| カスタムリソース               | ⭕️   |    ⭕️    | ×     |
| サイドカーインジェクション          | ⭕️   |    ⭕️    | ⭕️    |
| ブルー/グリーンデプロイメント        | ⭕️   | ×       | ×     |
| カナリアリリース               | ⭕️   |    ⭕️    | ×     |
| 属性ベースのルーティング           | ⭕️   | ×       | ×     |
| リクエスト数制限（レートリミット）      | ⭕️   |    ⭕️    | ×     |
| OSI層の```L7```に対応       | ⭕️   | ×       | ×     |
| Spiffeに対応              | ⭕️   | ×       | ⭕️    |
| 再試行処理                  | ⭕️   |    ⭕️    | ×     |
| タイムアウト                 | ⭕️   |    ⭕️    | ×     |
| サーキットブレイカー             | ⭕️   | ×       | ×     |
| Ingressコントローラー         | ⭕️   | ×       | ×     |
| Egressコントローラー          | ⭕️   | ×       | ×     |

<br>

## 01-02. データプレーン（サイドカーメッシュ）

### データプレーンとは

サイドカーメッシュのデータプレーンは、iptables、 ```istio-init```コンテナ、```istio-proxy```コンテナ、から構成される。

> ℹ️ 参考：https://www.tigera.io/blog/running-istio-on-kubernetes-in-production-part-i/

<br>

### ```istio-init```コンテナ

#### ▼ ```istio-init```コンテナとは

コンテナの起動時に、```istio-iptables```コマンドを実行し、iptablesをPodに適用する。

> ℹ️ 参考：https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process
>

![istio_istio-init](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-init.png)

<br>

### iptables

#### ▼ ルーティング先制御

iptablesは、Pod内のネットワークのルーティング先を決定する。

> ℹ️ 参考：https://zenn.dev/tayusa/articles/aa54bbff3d0d2d#iptables%E3%81%8C%E6%9B%B4%E6%96%B0%E3%81%95%E3%82%8C%E3%82%8B%E3%82%BF%E3%82%A4%E3%83%9F%E3%83%B3%E3%82%B0

```bash
# istio-initコンテナの起動時に実行する。
$ istio-iptables \
    -p 15001 \
    -z 15006 \
    -u 1337 \
    -m REDIRECT \
    -i * \
    -x \
    -b * \
    -d 15090,15021,15020
```

#### ▼ インバウンド時

iptablesにより、Pod内へのインバウンドは、```istio-proxy```コンテナの```15006```番ポートにリダイレクトされる。

![istio_iptables_inbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_iptables_inbound.png)

> ℹ️ 参考：https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process

#### ▼ アウトバウンド時

iptablesにより、Pod内へのからのアウトバウンド通信は、```istio-proxy```コンテナの```15001```番ポートにリダイレクトされる。

![istio_iptables_outbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_iptables_outbound.png)

> ℹ️ 参考：https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process

<br>

### ```istio-proxy```コンテナ

#### ▼ ```istio-proxy```コンテナとは

![istio_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-proxy.png)

リバースプロキシの機能を持つサイドカーコンテナである。```pilot-agent```プロセス、```envoy```プロセス、が稼働している。仕様上、NginxやApacheを必須とする言語（例：PHP）では、Pod内にリバースプロキシが```2```個ある構成になってしまうことに注意する。

> ℹ️ 参考：
>
> - https://www.amazon.co.jp/dp/B09XN9RDY1
> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process

#### ▼ ```pilot-agent```プロセス

```istio-proxy```コンテナにて、Istiodコントロールプレーンにリクエスト（他サービスの宛先情報、SSL証明書、）を定期的に送信する。また、受信したレスポンスに応じて、```envoy```プロセスの設定を変更する。

#### ▼ ```envoy```プロセス

```istio-proxy```コンテナにて、リバースプロキシとして機能する。

<br>

### istio-cniアドオンによる```istio-validation```コンテナ

#### ▼ istio-cniアドオンとは

![istio_istio-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-cni.png)

ワーカーNode上で、```istio-cni-node```という名前のDaemonSetとして稼働する。```istio-init```コンテナはiptablesをPodに適用する権限を持っている。しかし、これは最小権限ではなく、脆弱性が指摘されている。```istio-init```コンテナの代替案として、istio-cniアドオンが提供されている。もしistio-cniアドオンを使用する場合は、```istio-init```コンテナが不要になる代わりに、```istio-validation```コンテナが必要になる。

> ℹ️ 参考：
>
> - https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/
> - https://www.redhat.com/architect/istio-CNI-plugin

#### ▼ ```istio-validation```コンテナ

istio-cniを採用している場合にのみそう挿入されるコンテナ。istio-cniのDaemonSetがiptablesを適用し終わることを待機するために、これが完了したかどうかを検証する。

> ℹ️ 参考：https://istio.io/latest/docs/setup/additional-setup/cni/#race-condition-mitigation

<br>

## 01-03. コントロールプレーン（サイドカーメッシュ）

### コントロールプレーンとは

![istio_control-plane_ports](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_control-plane_ports.png)

サイドカーメッシュのIstiodコントロールプレーンは、各種ポート番号で```istio-proxy```コンテナからのリクエストを待ち受ける。語尾の『```d```』は、デーモンの意味であるが、Istiodコントロールプレーンの実体は、istiod-deploymentである。

> ℹ️ 参考：
>
> - https://www.amazon.co.jp/dp/B09XN9RDY1
> - https://istio.io/latest/docs/ops/deployment/requirements/#ports-used-by-istio
> - https://istio.io/latest/docs/ops/integrations/prometheus/#configuration

<br>

### ポート番号別の機能

#### ▼ ```8080```番

```8080```番ポートでは、サービスメッシュのデバッグエンドポイントに対するリクエストを待ち受ける。

#### ▼ ```15010```番

![istio_control-plane_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_control-plane_service-discovery.png)

```15010```番ポートでは、```istio-proxy```コンテナからのxDSサーバーに対するリクエストを待ち受け、他のPodのマイクロサービスの宛先情報を含むレスポンスを返信する。```istio-proxy```コンテナはこれを受信し、```pilot-agent```プロセスはが```envoy```プロセスの宛先情報設定を動的に変更する（サービスディスカバリー）。なおIstiodコントロールプレーンは、サービスレジストリに登録された情報や、コンフィグストレージに永続化されたマニフェストファイルの宣言（ServiceEntry、WorkloadEntry）から、他のPodのマイクロサービスの宛先情報を取得する。

> ℹ️ 参考：
>
> - https://faun.pub/how-to-integrate-your-service-registry-with-istio-34f54b058697
> - https://www.kubernetes.org.cn/4208.html

#### ▼ ```15012```番

![istio_control-plane_certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_control-plane_certificate.png)

```15012```番ポートでは、マイクロサービス間で相互TLSによるHTTPS通信を行う場合に、```istio-proxy```コンテナからのSSL証明書に関するリクエストを待ち受け、SSL証明書と秘密鍵を含むレスポンスを返信する。```istio-proxy```コンテナはこれを受信し、```pilot-agent```プロセスは```envoy```プロセスにこれらを紐づける。また、SSL証明書の期限が切れれば、```istio-proxy```コンテナからのリクエストに応じて、新しいSSL証明書と秘密鍵を作成する。

> ℹ️ 参考：https://istio.io/latest/docs/concepts/security/#pki

#### ▼ ```15014```番

```15014```番ポートでは、Istiodコントロールプレーンのメトリクスを監視するツールからのリクエストを待ち受け、データポイントを含むレスポンスを返信する。

> ℹ️ 参考：https://istio.io/latest/docs/reference/commands/pilot-discovery/#metrics

#### ▼ ```15017```番

```15017```番ポートでは、Istioの```istid-<リビジョン番号>```というServiceからのポートフォワーディングを待ち受け、AdmissionReviewを含むレスポンスを返信する。


<br>

## 01-04. マルチサービスメッシュ

### 異なるCluster内コンテナのデータプレーン内管理

#### ▼ 同じプライベートネットワーク内の場合

異なるClusterが同じプライベートネットワーク内に属している場合に、Clusterのコントロールプレーン間でデータプレーンを管理し合うことにより、この時、IngressGatewayを使用せずに、異なるClusterのコンテナが直接的に通信できる。

> ℹ️ 参考：https://zenn.dev/kuchima/articles/asm-hybrid-mesh

![istio_multi-service-mesh_cluster_same-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_multi-service-mesh_cluster_same-network.png)

#### ▼ 異なるプライベートネットワーク内の場合

異なるClusterが異なるプライベートネットワーク内に属している場合に、Clusterのコントロールプレーン間でデータプレーンを管理し合うことにより、この時、IngressGatewayを経由して、異なるClusterのコンテナが間接的に通信できる。

> ℹ️ 参考：https://zenn.dev/kuchima/articles/asm-hybrid-mesh

![istio_multi-service-mesh_cluster_difficult-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_multi-service-mesh_cluster_difficult-network.png)

<br>

### 仮想サーバー内コンテナのデータプレーン内管理

#### ▼ 同じプライベートネットワーク内の場合

仮想サーバーがコントロールプレーンと同じプライベートネットワーク内に属している場合に、この仮想サーバーに```istio-proxy```コンテナを注入することにより、データプレーン内で仮想サーバーを管理できるようになる。この時、IngressGatewayを使用せずに、Kubernetes上のコンテナと仮想サーバー上のコンテナが直接的に通信できる。

> ℹ️ 参考：https://istio.io/latest/docs/ops/deployment/vm-architecture/

![istio_multi-service-mesh_vm_same-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_multi-service-mesh_vm_same-network.png)

#### ▼ 異なるプライベートネットワーク内の場合

仮想サーバーがコントロールプレーンと異なるプライベートネットワーク内に属している場合に、この仮想サーバーに```istio-proxy```コンテナを注入することにより、データプレーン内で管理できるようになる。この時、IngressGatewayを経由して、Kubernetes上のコンテナと仮想サーバー上のコンテナが間接的に通信できる。

![istio_multi-service-mesh_vm_difficult-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_multi-service-mesh_vm_difficult-network.png)

<br>

## 01-05.  Istio、Envoy（Istio無し）、Kubernetes

### 対応関係

Kubernetes、Envoy、Kubernetesの比較は以下の通りである。

> ℹ️ 参考：
>
> - https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/
> - https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/
> - https://github.com/envoyproxy/go-control-plane
> - https://istiobyexample-ja.github.io/istiobyexample/ingress/

| Istio+Kubernetes + Envoy | Kubernetes + Envoy | Kubernetesのみ                 |
|--------------------------|--------------------| ------------------------------ |
| DestinationRule          | Route              | kube-proxy                     |
| EnvoyFilter              | Listener           | kube-proxy                     |
| Istiodコントロールプレーン         | go-control-plane   | -                              |
| ServiceEntry             | Cluster            | Service                        |
| VirtualService+Gateway   | Route+Listener     | Ingress+Ingressコントローラー |
| WorkloadEntry            | Endpoint           | Endpoint                       |

<br>

## 02. リソースとオブジェクト

### Istioリソース

Istioの各コンポーネントのことにより、Kubernetesのカスタムリソースとして定義されている。

<br>

### Istioオブジェクト

マニフェストファイルによって量産されたIstioリソースのインスタンスのこと。

<br>

## 02-02. インバウンド通信に関するリソース

### IngressGateway

#### ▼ IngressGatewayとは

![istio_ingress-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_ingress-gateway.png)

Gateway、VirtualService、DestinationRuleの設定を基に、Clusterネットワーク外からインバウンド通信を受信し、Podにルーティングする。```istio-ingressgateway```というLoadBalancer Serviceと、```istio-ingressgateway-*****```というPodから構成される

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-control/
> - https://qiita.com/kenyashiro/items/b94197890de434ed9ceb
> - https://qiita.com/J_Shell/items/296cd00569b0c7692be7
> - https://blog.jayway.com/2018/10/22/understanding-istio-ingress-gateway-in-kubernetes/

<br>

### Gateway

#### ▼ Gatewayとは

IngressGatewayの機能のうち、Clusterネットワーク外から受信したインバウンド通信をフィルタリングする機能を担う。

> ℹ️ 参考：https://istio.io/latest/blog/2018/v1alpha3-routing/

<br>

### VirtualService

#### ▼ VirtualServiceとは

IngressGatewayの機能のうち、IngressGatewayで受信したインバウンド通信をいずれのServiceにルーティングするか、を決定する機能を担う。Service自体の設定は、IstioではなくKubernetesで行うことに注意する。ルーティング先のServiceが見つからないと、```404```ステータスを返信する。

> ℹ️ 参考：
>
> - https://tech.uzabase.com/entry/2018/11/26/110407
> - https://knowledge.sakura.ad.jp/20489/

#### ▼ Envoyの設定値として

VirtualServiceの設定値は、Envoyのフロントプロキシの設定値としてIstioリソースに適用される。

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/concepts/traffic-management/
> - http://blog.fujimisakari.com/service_mesh_and_routing_and_lb/
> - https://sreake.com/blog/istio/

#### ▼ VirtualService数

> ℹ️ 参考：https://www.moesif.com/blog/technical/api-gateways/How-to-Choose-The-Right-API-Gateway-For-Your-Platform-Comparison-Of-Kong-Tyk-Apigee-And-Alternatives/ 

| 場合                                 | VirtualService数                                             |
| ------------------------------------ | ------------------------------------------------------------ |
| API GatewayをIstio内で管理する場合   | 外部からのインバウンド通信をAPI GatewayにルーティングするVirtualServiceを1つだけ作成しておけばよい。 |
| API GatewayをIstio内で管理しない場合 | API Gatewayから全てのマイクロサービスにルーティングできるように、各マイクロサービスにルーティングできるVirtualServiceを定義する必要がある。 |

<br>

## 02-03. アウトバウンド通信に関するリソース

### EgressGateway

#### ▼ EgressGatewayとは

Clusterネットワーク内からアウトバウンド通信を受信し、フィルタリングした後、パブリックネットワークにルーティングする。

> ℹ️ 参考：https://knowledge.sakura.ad.jp/20489/

![istio_gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_gateway.png)

<br>

### ServiceEntry

#### ▼ ServiceEntryとは

アウトバウンド通信のうち、送信できるもののみを指定したドメインやEgressGatewayにルーティングする。ServiceEntryを使用しない場合は、全てのアウトバウンド通信がルーティングされる。

> ℹ️ 参考：https://tech.uzabase.com/entry/2018/11/26/110407

![istio_service-entry](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_service-entry.png)

<br>

## 02-04. 両方向通信に関するリソース

### DestinationRule

#### ▼ DestinationRuleとは

| 通信方向       | 機能                                                         | 補足                                                         |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| インバウンド   | IngressGatewayの機能のうち、Serviceで受信したインバウンド通信をいずれのPodにルーティングするか、を決定する機能を担う。Service自体の設定は、IstioではなくKubernetesで行うことに注意する。 |                                                              |
| アウトバウンド | ```istio-proxy```コンテナの送信するアウトバウンド通信をTLSで暗号化するか否か、を決定する機能を担う。 | ℹ️ 参考：https://istio.io/latest/docs/ops/configuration/traffic-management/tls-configuration/#sidecars |

#### ▼ Envoyの設定値として

DestinationRuleの設定値は、Envoyのリバースプロキシコンテナの設定値として```istio-proxy```コンテナに適用される。

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/concepts/traffic-management/
> - http://blog.fujimisakari.com/service_mesh_and_routing_and_lb/
> - https://sreake.com/blog/istio/

<br>

## 03. Injectionテスト

### Faultインジェクション

#### ▼ Faultインジェクションとは

障害を意図的に注入し、サービスメッシュの動作を検証する。

> ℹ️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/

#### ▼ テストの種類

| テスト名         | 内容                                                         |
| ---------------- | ------------------------------------------------------------ |
| Deplayインジェクション | マイクロサービスに対するインバウンド通信にて、意図的に通信の遅延を引き起こす。<br>ℹ️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-delay-fault |
| Abortインジェクション  | マイクロサービスに対するインバウンド通信にて、意図的に通信の中止を引き起こす。<br>ℹ️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-abort-fault |

<br>

## 04. 障害対策

### サーキットブレイカー

#### ▼ サーキットブレイカーとは

マイクロサービス間に設置され、他のマイクロサービスに連鎖的に起こる障害（カスケード障害）を吸収する仕組みのこと。爆発半径を最小限にできる。下流マイクロサービスに障害が発生した時に、上流マイクロサービスにエラーを返してしまわないよう、一旦マイクロサービスへのルーティングを停止し、直近の成功時の処理結果を返信する。

> ℹ️ 参考：https://digitalvarys.com/what-is-circuit-breaker-design-pattern/

![circuit-breaker](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/circuit-breaker.png)

<br>

## 05. 認証

マイクロサービスアーキテクチャにおける認証にはいくつか種類がある。そのうち、Istioは『分散型』と『ゲートウェイ分散型』の認証を実現することを助ける。

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/concepts/security/#authentication-architecture
> - https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_architecture_backend_microservices.html

<br>

## 05-02. 認可

> ℹ️ 参考：https://istio.io/latest/docs/concepts/security/#authorization

<br>

