---
title: 【IT技術の知見】Istio＠カスタムリソース
description: Istio＠カスタムリソースの知見を記録しています。
---

# Istio＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Istioの仕組み

### アーキテクチャ

データプレーン、コントロールプレーン、から構成される。```L1```から```L6```上で稼働し、```L7```（アプリケーション層）にて、マイクロサービス間の通信を透過的にする（通信の存在を感じさせない）ことを思想としている。ただ必ずしも、Istioリソースを使用する必要はなく、KubernetesやOpenShiftに内蔵されたIstioに相当する機能を使用しても良い。

ℹ️ 参考：

- https://istio.io/latest/docs/ops/deployment/architecture/
- https://techblog.zozo.com/entry/zozotown-istio-production-ready
- https://www.amazon.co.jp/dp/B09XN9RDY1

![istio_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_architecture.png)

<br>

### 他のOSSツールとの比較

ℹ️ 参考：https://www.amazon.co.jp/dp/1492043788

| 機能                               | Istio | Linkerd | Consul |
| ---------------------------------- |:-----:|:--------:|:------:|
| 機能の豊富さ                       | ⭕️   | △       | △     |
| 異なるClusterのデータプレーン内管理 | ⭕️   | ×       | ⭕️    |
| 仮想マシンのデータプレーン内管理 | ⭕️ | × | ⭕️ |
| ダッシュボード                     | × |    ⭕️    | ⭕️   |
| サービスディスカバリー             | ⭕️   |    ⭕️    | ⭕️    |
| メトリクス収集                     | ⭕️   |    ⭕️    | ×     |
| 分散トレース収集                   | ⭕️   | ×       | ⭕️    |
| 相互TLS                            | ⭕️   |    ⭕️    | ⭕️    |
| ポリシーベースのACL                | ⭕️   | ×       | ×     |
| 意図ベースのACL                    | ×    | ×       | ⭕️    |
| 証明書管理                         | ⭕️   | ×       | ⭕️    |
| HTTP/1.2、HTTP/2.0、gRPC           | ⭕️   |    ⭕️    | ×     |
| TCP                                | ⭕️   |    ⭕️    | ⭕️    |
| カスタムリソース                   | ⭕️   |    ⭕️    | ×     |
| サイドカーインジェクション         | ⭕️   |    ⭕️    | ⭕️    |
| ブルー/グリーンデプロイメント      | ⭕️   | ×       | ×     |
| カナリアリリース                   | ⭕️   |    ⭕️    | ×     |
| 属性ベースのルーティング           | ⭕️   | ×       | ×     |
| リクエスト数制限（レートリミット） | ⭕️   |    ⭕️    | ×     |
| OSI層の```L7```に対応              | ⭕️   | ×       | ×     |
| Spiffeに対応                       | ⭕️   | ×       | ⭕️    |
| 再試行処理                         | ⭕️   |    ⭕️    | ×     |
| タイムアウト                       | ⭕️   |    ⭕️    | ×     |
| サーキットブレイカー               | ⭕️   | ×       | ×     |
| Ingressコントローラー              | ⭕️   | ×       | ×     |
| Egressコントローラー               | ⭕️   | ×       | ×     |

<br>

## 01-02. データプレーン

### データプレーンとは

iptables、 ```istio-init```コンテナ、```istio-proxy```コンテナ、から構成される。

ℹ️ 参考：https://www.tigera.io/blog/running-istio-on-kubernetes-in-production-part-i/

<br>

### 自動注入されるコンポーネント

#### ▼ ```istio-init```コンテナ

![istio_istio-init](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-init.png)

コンテナの起動時に、```istio-iptables```コマンドを実行し、iptablesをPodに適用する。


```bash
# コンテナの起動時
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

ℹ️ 参考：

- https://istio.io/v1.13/blog/2019/data-plane-setup/#traffic-flow-from-application-container-to-sidecar-proxy	
- https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process
- https://zenn.dev/tayusa/articles/aa54bbff3d0d2d#iptables%E3%81%8C%E6%9B%B4%E6%96%B0%E3%81%95%E3%82%8C%E3%82%8B%E3%82%BF%E3%82%A4%E3%83%9F%E3%83%B3%E3%82%B0


#### ▼ iptables

![istio_iptables](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_iptables.png)

Pこのiptablesにより、Pod内へのインバウンド（または外へのアウトバウンド通信）は、一度、istio-proxyコンテナの```15006```（または```15001```）番ポートにリダイレクトされるようになる（画像はアウトバウンド時の経路）。


ℹ️ 参考：

- https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#traffic-interception-implementation-details
- https://github.com/istio/istio/blob/a19b2ac8af3ad937640f6e29eed74472034de2f5/tools/istio-iptables/pkg/cmd/root.go#L219
- https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process

#### ▼ ```istio-proxy```コンテナ（サイドカーコンテナ）

![istio_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-proxy.png)

リバースプロキシの機能を持つサイドカーコンテナである。ミドルウェアとしてEnvoy、デーモンとしてpilot-agent、が稼働している。Istiodにメトリクスを提供する。VirtualServiceとDestinationRuleの設定値はenvoyの構成情報としてコンテナに適用される。仕様上、NginxやApacheを必須とする言語（例：PHP）では、Pod内にリバースプロキシが```2```個ある構成になってしまうことに注意する。

ℹ️ 参考：

- https://istio.io/v1.13/blog/2019/data-plane-setup/
- https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process

<br>

### ```istio-proxy```コンテナ注入の仕組み

#### ▼ kube-apiserver内のmutating-admissionステップ

この処理は、admission-controllersアドオンのmutating-admissionステップでのWebhookを使用した機能である。```metadata.labels.istio-injection```キーが有効になっている場合、Podの作成処理時にkube-apiserverは、1. kube-apiserverは、admission-controllersアドオンのmutating-admissionステップにて、AdmissionReview構造体のAdmissionRequestにリクエストパラメーターを詰める。その後、Istiod内のwebhook-serviceの```/inject```エンドポイントの```443```番ポートにAdmissionReviewのリクエストを送信する。

ℹ️ 参考：

- https://www.sobyte.net/post/2022-07/istio-sidecar-injection/#istio-sidecar-auto-injection-implementation
- https://www.solo.io/blog/istios-networking-in-depth/

![kubernetes_admission-controllers_istio-injection](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_istio-injection.png)

```yaml
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  # AdmissionRequest
  "request": {

    # 〜 中略 〜

    # 変更されるKubernetesリソースの種類を表す。
    "resource": {
      "group": "apps",
      "version": "v1",
      "resource": "deployments"
    },
    # kube-apiserverの操作の種類を表す。
    "operation": "UPDATE",
    # 新しく認証/認可されたオブジェクトを表す。
    "object": {
      "apiVersion": "autoscaling/v1",
      "kind": "Scale"
    },
    # Kubernetesリソースの操作前の状態を表す。
    "oldObject": {
      "apiVersion": "autoscaling/v1",
      "kind": "Scale"
    },
    # 認証/認可された操作の種類を表す。
    "options": {
      "apiVersion": "meta.k8s.io/v1",
      "kind": "UpdateOptions"
    },

    # 〜 中略 〜

  }
}
```

#### ▼ webbhook-service

Istiod内のwebhook-serviceはAdmissionReviewのリクエストを受信する。webhook-serviceは、リクエストをIstiod内のdiscoveryコンテナの```15017```番ポートにポートフォワーディングする。

#### ▼ webhookサーバー

![istio_sidecar-injection_istiod](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_sidecar-injection_istiod.png)

Istiod内のwebhookサーバーは、AdmissionReviewを```/inject```エンドポイントで受信する。その後、```istio-proxy```コンテナを作成するための処理をAdmissionReview内のAdmissionResponseに格納し、kube-apiserverに返信する。kube-apiserverはこれを受信し、Pod内にサイドカーコンテナを作成する。

ℹ️ 参考：

- https://github.com/istio/istio/blob/a19b2ac8af3ad937640f6e29eed74472034de2f5/pkg/kube/inject/webhook.go#L171-L172
- https://github.com/istio/istio/blob/a19b2ac8af3ad937640f6e29eed74472034de2f5/pkg/kube/inject/webhook.go#L963
- https://www.amazon.co.jp/dp/B09XN9RDY1

#### ▼ AdmissionResponse

Istioでサイドカーインジェクション機能が有効化されている場合に、webhookサーバーは、AdmissionReview内のAdmissionResponseにサイドカーコンテナを作成するpatch処理を格納し、レスポンスとして返信する。

ℹ️ 参考：

- https://github.com/istio/istio/blob/e1f63e8ce82e3bad28c2bb0a87f4bc7ffefac1b9/pkg/kube/inject/webhook.go#L909-L915
- https://github.com/istio/istio/blob/b3d1566a2af8591d8a74c648108e549c3879d45f/pkg/kube/inject/webhook_test.go#L960-L975

```yaml
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  # AdmissionResponse
  "response": {
    "uid": "<value from request.uid>",
    "allowed": true,
    # PathによるPatch処理を行う。
    "patchType": "JSONPatch",
    # Patch処理の対象となるKubernetesリソースと処理内容を表す。base64方式でエンコードされている。
    "patch": "W3sib3AiOiAiYWRkIiwgInBhdGgiOiAiL3NwZWMvcmVwbGljYXMiLCAidmFsdWUiOiAzfV0="
  }
}
```

```yaml
[

  # 〜 中略 〜

  {
    "op": "add",
    # キー（spec.initContainers[1]）の部分にvalueキー値を追加する。
    "path": "/spec/initContainers/1",
    # マニフェストファイルに追加される構造を表す。
    "value": {
        "name": "istio-init",
        "resources": {}
    }
  },
  {
    "op": "add",
    # キー（spec.containers[1]）の部分にvalueキー値を追加する。
    "path": "/spec/containers/1",
    # マニフェストファイルに追加される構造を表す。
    "value": {
        "name": "istio-proxy",
        "resources": {}
    }
  }
  
  # 〜 中略 〜
    
]
```

<br>

## 01-03. コントロールプレーン

### コントロールプレーンとは

Istiodは、Pilot機能、Citadel機能、Galley機能、を持つ。語尾の『```d```』は、デーモンの意味であるが、Istiodの実体は、istiod-deploymentである。

ℹ️ 参考：

- https://project.nikkeibp.co.jp/idg/atcl/idg/17/020100207/020100001/?ST=idg-cm-network&P=2
- https://www.tigera.io/blog/running-istio-on-kubernetes-in-production-part-i/
- https://istio.io/latest/docs/ops/integrations/prometheus/#configuration

<br>

### Pilot機能

| ポート番号 | 役割                                                                                                      |
|-------|---------------------------------------------------------------------------------------------------------|
| 8080  | サービスメッシュのデバッグエンドポイントに対するリクエストを待ち受ける。                                                                    |
| 15010 | XDSサーバーに対するリクエストを待ち受ける。                                                                                 |
| 15017 | コンテナを注入するwebhookサーバーに対するリクエストを待ち受ける。webhook-serviceは、discoveryコンテナの```15017```番ポートにリクエストをポートフォワーディングする。 |

Istiodに対するリクエストを様々なポート番号で待ち受ける。リクエストに応じて、Kubernetes側のPod内の```istio-proxy```コンテナの設定を変更する。 各種ポート番号（```8080```、```15010```、```15017```）でリクエストを待ち受ける。

ℹ️ 参考：

- https://www.amazon.co.jp/dp/B09XN9RDY1
- https://hub.docker.com/r/istio/pilot/tags
- https://istio.io/latest/docs/ops/deployment/requirements/#ports-used-by-istio
- https://qiita.com/Takagi_/items/89985b4cbc6647860c8c

<br>

### Citadel機能

マイクロサービス間で相互TLSによるHTTPS通信を行う場合に、そのSSL証明書を作成し、また期限が切れたら更新する。

ℹ️ 参考：https://github.com/istio/istio/blob/1aca7a67afd7b3e1d24fafb2fbfbeaf1e41534c0/operator/pkg/object/objects_test.go#L122

<br>

### Galley機能

調査中...

ℹ️ 参考：https://github.com/istio/istio/blob/1aca7a67afd7b3e1d24fafb2fbfbeaf1e41534c0/operator/pkg/object/objects_test.go#L152


<br>

###  Mixer

```v1.5```から、データプレーン側に統合された。

ℹ️ 参考：https://www.elastic.co/jp/blog/istio-monitoring-with-elastic-observability

<br>

## 01-04. マルチサービスメッシュ

### 異なるCluster内コンテナのデータプレーン内管理

#### ▼ 同じプライベートネットワーク内の場合

異なるClusterが同じプライベートネットワーク内に属している場合に、Clusterのコントロールプレーン間でデータプレーンを管理し合うことにより、この時、IngressGatewayを使用せずに、異なるClusterのコンテナが直接的に通信できる。

ℹ️ 参考：https://zenn.dev/kuchima/articles/asm-hybrid-mesh

![istio_multi-service-mesh_cluster_same-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_multi-service-mesh_cluster_same-network.png)

#### ▼ 異なるプライベートネットワーク内の場合

異なるClusterが異なるプライベートネットワーク内に属している場合に、Clusterのコントロールプレーン間でデータプレーンを管理し合うことにより、この時、IngressGatewayを経由して、異なるClusterのコンテナが間接的に通信できる。

ℹ️ 参考：https://zenn.dev/kuchima/articles/asm-hybrid-mesh

![istio_multi-service-mesh_cluster_difficult-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_multi-service-mesh_cluster_difficult-network.png)

<br>

### 仮想サーバー内コンテナのデータプレーン内管理

#### ▼ 同じプライベートネットワーク内の場合

仮想マシンがコントロールプレーンと同じプライベートネットワーク内に属している場合に、この仮想マシンに```istio-proxy```コンテナを注入することにより、データプレーン内で仮想マシンを管理できるようになる。この時、IngressGatewayを使用せずに、Kubernetes上のコンテナと仮想マシン上のコンテナが直接的に通信できる。

ℹ️ 参考：https://istio.io/latest/docs/ops/deployment/vm-architecture/

![istio_multi-service-mesh_vm_same-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_multi-service-mesh_vm_same-network.png)

#### ▼ 異なるプライベートネットワーク内の場合

仮想マシンがコントロールプレーンと異なるプライベートネットワーク内に属している場合に、この仮想マシンに```istio-proxy```コンテナを注入することにより、データプレーン内で管理できるようになる。この時、IngressGatewayを経由して、Kubernetes上のコンテナと仮想マシン上のコンテナが間接的に通信できる。

![istio_multi-service-mesh_vm_difficult-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_multi-service-mesh_vm_difficult-network.png)

<br>

## 01-05.  Istio、Envoy（Istio無し）、Kubernetesの対応関係

Kubernetes、Envoy、Kubernetesの比較は以下の通り

ℹ️ 参考：

- https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/
- https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/
- https://github.com/envoyproxy/go-control-plane
- https://istiobyexample-ja.github.io/istiobyexample/ingress/

| Istio＋Kubernetes＋Envoy | Kubernetes＋Envoy | Kubernetesのみ                 |
| ------------------------ | ----------------- | ------------------------------ |
| DestinationRule          | Route             | kube-proxy                     |
| EnvoyFilter              | Listener          | kube-proxy                     |
| Istiod                   | go-control-plane  | -                              |
| ServiceEntry             | Cluster           | Service                        |
| VirtualService＋Gateway  | Route＋Listener   | Ingress＋Ingressコントローラー |
| WorkloadEntry            | Endpoint          | Endpoint                       |

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

ℹ️ 参考：

- https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-control/
- https://qiita.com/kenyashiro/items/b94197890de434ed9ceb
- https://qiita.com/J_Shell/items/296cd00569b0c7692be7
- https://blog.jayway.com/2018/10/22/understanding-istio-ingress-gateway-in-kubernetes/

<br>

### Gateway

#### ▼ Gatewayとは

IngressGatewayの機能のうち、Clusterネットワーク外から受信したインバウンド通信をフィルタリングする機能を担う。

ℹ️ 参考：https://istio.io/latest/blog/2018/v1alpha3-routing/

<br>

### VirtualService

#### ▼ VirtualServiceとは

IngressGatewayの機能のうち、IngressGatewayで受信したインバウンド通信をいずれのServiceにルーティングするか、を決定する機能を担う。Service自体の設定は、IstioではなくKubernetesで行うことに注意する。ルーティング先のServiceが見つからないと、```404```ステータスを返信する。

ℹ️ 参考：

- https://tech.uzabase.com/entry/2018/11/26/110407
- https://knowledge.sakura.ad.jp/20489/

#### ▼ Envoyの設定値として

VirtualServiceの設定値は、Envoyのフロントプロキシの設定値としてIstioリソースに適用される。

ℹ️ 参考：

- https://istio.io/latest/docs/concepts/traffic-management/
- http://blog.fujimisakari.com/service_mesh_and_routing_and_lb/
- https://sreake.com/blog/istio/

#### ▼ VirtualService数

ℹ️ 参考：https://www.moesif.com/blog/technical/api-gateways/How-to-Choose-The-Right-API-Gateway-For-Your-Platform-Comparison-Of-Kong-Tyk-Apigee-And-Alternatives/ 

| 場合                                 | VirtualService数                                             |
| ------------------------------------ | ------------------------------------------------------------ |
| API GatewayをIstio内で管理する場合   | 外部からのインバウンド通信をAPI GatewayにルーティングするVirtualServiceを1つだけ作成しておけばよい。 |
| API GatewayをIstio内で管理しない場合 | API Gatewayから全てのマイクロサービスにルーティングできるように、各マイクロサービスにルーティングできるVirtualServiceを定義する必要がある。 |

<br>

## 02-03. アウトバウンド通信に関するリソース

### EgressGateway

#### ▼ EgressGatewayとは

Clusterネットワーク内からアウトバウンド通信を受信し、フィルタリングした後、パブリックネットワークにルーティングする。

ℹ️ 参考：https://knowledge.sakura.ad.jp/20489/

![istio_gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_gateway.png)

<br>

### ServiceEntry

#### ▼ ServiceEntryとは

アウトバウンド通信のうち、送信できるもののみを指定したドメインやEgressGatewayにルーティングする。ServiceEntryを使用しない場合は、全てのアウトバウンド通信がルーティングされる。

ℹ️ 参考：https://tech.uzabase.com/entry/2018/11/26/110407

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

ℹ️ 参考：

- https://istio.io/latest/docs/concepts/traffic-management/
- http://blog.fujimisakari.com/service_mesh_and_routing_and_lb/
- https://sreake.com/blog/istio/

<br>

## 03. Injectionテスト

### Faultインジェクション

#### ▼ Faultインジェクションとは

障害を意図的に注入し、サービスメッシュの動作を検証する。

ℹ️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/

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

ℹ️ 参考：https://digitalvarys.com/what-is-circuit-breaker-design-pattern/

![circuit-breaker](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/circuit-breaker.png)

<br>

## 05. 認証

マイクロサービスアーキテクチャにおける認証にはいくつか種類がある。そのうち、Istioは『分散型』と『ゲートウェイ分散型』の認証を実現することを助ける。

ℹ️ 参考：

- https://istio.io/latest/docs/concepts/security/#authentication-architecture
- https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_architecture_backend_microservices.html

<br>

## 05-02. 認可

ℹ️ 参考：https://istio.io/latest/docs/concepts/security/#authorization

<br>

## 06. アドオン

### istio-cniアドオン

#### ▼ istio-cniアドオンとは

![istio_istio-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-cni.png)

ワーカーNode上で、```istio-cni-node```という名前のDaemonSetとして稼働する。```istio-init```コンテナと同様にして、Podにiptablesを適用する。OSに干渉するような認可スコープは過剰であることが問題視されている。もしistio-cniアドオンを使用する場合は、```istio-init```コンテナが不要になる代わりに、```istio-validation```コンテナが必要になる。

ℹ️ 参考：

- https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/
- https://www.redhat.com/architect/istio-CNI-plugin

#### ▼ ```istio-validation```コンテナ

istio-cniを使用している場合にのみそう挿入されるコンテナ。istio-cniのDaemonSetがiptablesを適用し終わることを待機するために、これが完了したかどうかを検証する。

ℹ️ 参考：https://istio.io/latest/docs/setup/additional-setup/cni/#race-condition-mitigation

<br>
