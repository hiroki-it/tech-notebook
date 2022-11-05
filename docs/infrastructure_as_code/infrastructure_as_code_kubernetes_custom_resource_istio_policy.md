---
title: 【IT技術の知見】設計ポリシー＠Istio
description: 設計ポリシー＠Istioの知見を記録しています。
---

# 設計ポリシー＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. セットアップ

### 少ないコントロールプレーン

クラウドプロバイダー環境でIstioを稼働させる場合、各AZや各リージョンにコントロールプレーンを```1```個だけセットアップし、できるだけ多くのマイクロサービスのサービスメッシュとなるようにする。

> ℹ️ 参考：https://istio.io/latest/docs/ops/best-practices/deployment/#deploy-fewer-clusters

### 冗長化

コントロールプレーンの可用性を高めるために、コントロールプレーンを異なるAZに冗長化させる。

> ℹ️ 参考：https://istio.io/latest/docs/ops/best-practices/deployment/#deploy-across-multiple-availability-zones

<br>

## 02. トラフィック管理

### IngressGatewayに関して

#### ▼ NodePort Serviceを選ぶ

IngressGatewayでは、内部的に作成されるServiceのタイプ（NodePort Service、LoadBalancer Service）を選べる。NodePort Serviceを選ぶ場合、ワーカーNodeの前段に開発者がロードバランサーを作成し、NodePort Serviceにインバウンド通信をルーティングできるようにする。一方で、LoadBalancer Serviceを選ぶ場合、クラウドプロバイダーのロードバランサーが自動的に作成されるため、このロードバランサーからLoadBalancer Serviceにルーティングできるようにする。LoadBalancer Serviceでは、クラウドプロバイダーのリソースとKubernetesリソースの責務の境界が曖昧になってしまうため、NodePort Serviceを選ぶようにする。なお、デフォルトではIngressGatewayの内部ではLoadBalancer Serviceを作成されてしまう。NodePort Serviceを選ぶためには、IngressGatewayではなく、IstioOperatorやistioチャート上でServiceのタイプを設定し、IngressGatewayを作成する必要がある。

> ℹ️ 参考：
> 
> - https://github.com/istio/istio/issues/28310#issuecomment-733079966
> - https://github.com/istio/istio/blob/bd9ae57cc00a44810496989ec3fa34649d6c8516/manifests/charts/gateway/values.yaml#L39

#### ▼ マイクロサービスごとに作成する

単一障害点になることを防ぐために、一つのIngressGatewayで全てのマイクロサービスにルーティングするのではなく、マイクロサービスことに用意する。

<br>


### サブセット名を一つにする

Istioリソースで設定するサブセット名は一つだけにする。これにより、IngressGatewayで受信したインバウンド通信を、特定のバージョンのPodにルーティングできる。

> ℹ️ 参考：https://istio.io/latest/docs/ops/best-practices/traffic-management/#set-default-routes-for-services

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  hosts:
    - reviews
  http:
    - route:
      - destination:
          host: reviews
          subset: v1
```

<br>

### Istioリソースの使用可能範囲を限定する

Istioリソースの```spec.exportTo```キーでは『```.```（ドット）』を設定する。これにより、DestinationRuleを想定外のNamespaceで使用してしまうことを防ぐ。

> ℹ️ 参考：https://istio.io/latest/docs/ops/best-practices/traffic-management/#cross-namespace-configuration

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  hosts:
    - foo-service.com
  exportTo:
    - "."
  http:
    - route:
      - destination:
          host: myservice
```

<br>

### DestinationRuleを最初に更新する

新しいサブセットを追加する場合、DestinationRuleを最初に更新する。これにより、ダウンタイムなしでサブセットを追加できる。DestinationRuleを更新する前に新しいサブセットを持つVirtualServiceを更新してしまうと、VirtualServiceは新しいサブセットを持つDestinationRuleを見つけられず、```503```ステータスを返却してしまう。DestinationRuleを最初に更新し、正常に完了することを待機した後に、VirtualServiceを更新する。

> ℹ️ 参考：https://istio.io/latest/docs/ops/best-practices/traffic-management/#avoid-503-errors-while-reconfiguring-service-routes

<br>

## 03. アップグレード

### インプレース方式

> ℹ️ 参考：https://istio.io/latest/docs/setup/upgrade/in-place/

<br>

### カナリアリリース方式

> ℹ️ 参考：
>
> - https://istio.io/v1.10/docs/setup/upgrade/canary/
> - https://jimmysong.io/blog/istio-canary-upgrade/
> - https://medium.com/snowflake/blue-green-upgrades-of-istio-control-plane-7642bb2c39c2

（１）旧コントロールプレーンNodeを残したまま、新コントロールプレーンNodeを作成する。

（２）特定のNamespaceの```metadata.labels.istio.io/rev```キーのリビジョン値を新バージョンに変更する。これにより、コントロールプレーンNodeはNamespace内の```istio-proxy```コンテナをアップグレードする。

![istio_canary-upgrade_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_canary-upgrade_1.png)

（３）新バージョンの```istio-proxy```コンテナの動作が問題なければ、Namespaceの```metadata.labels.istio.io/rev```キーのリビジョン値を順番に変更していく。

![istio_canary-upgrade_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_canary-upgrade_2.png)

（４）もし途中で問題が起これば、```metadata.labels.istio.io/rev```キーのリビジョン値順番に元に戻していく。

（５）全てのNamespaceの```istio-proxy```コンテナのアップグレードが完了し、動作に問題がなければ、旧コントロールプレーンNodeを削除する。

<br>

## 03. 監視ポリシー

### ```istio-proxy```コンテナ

名前空間を```istio-proxy```コンテナとしたメトリクスの監視ポリシーは以下の通りである。

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/metrics/

| メトリクス                                   | 単位     | 説明                                                                       | アラート条件例（合致したら発火）                                                 |
|-----------------------------------------| -------- |--------------------------------------------------------------------------|---------------------------------------------------------|
| 総リクエスト数（```istio_requests_total```）     | カウント | ```istio-proxy```コンテナが受信した総リクエスト数を表す。メトリクスの名前空間に対して様々なディメンションを設定できる。<br>ℹ️ 参考：https://blog.christianposta.com/understanding-istio-telemetry-v2/ |   |
| 総gRPCリクエスト数（```istio_request_messages_total```） | カウント | ```istio-proxy```コンテナが受信した総gRPCリクエスト数を表す。                                |   |
| 総gRPCレスポンス数（```istio_response_messages_total```） | カウント | ```istio-proxy```コンテナが受信した総gRPCレスポンス数を表す。                                |   |

<br>
