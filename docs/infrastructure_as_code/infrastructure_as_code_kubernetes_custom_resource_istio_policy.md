---
title: 【IT技術の知見】設計ポリシー＠Istio
description: 設計ポリシー＠Istioの知見を記録しています。
---

# 設計ポリシー＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### 少ないコントロールプレーン

クラウドプロバイダー環境でIstioを稼働させる場合、各AZや各リージョンにコントロールプレーンを`1`個だけセットアップし、できるだけ多くのアプリコンテナのサービスメッシュとなるようにする。

> ↪️ 参考：https://istio.io/latest/docs/ops/best-practices/deployment/#deploy-fewer-clusters

<br>

### 冗長化

コントロールプレーンの可用性を高めるために、コントロールプレーンを異なるAZに冗長化させる。

> ↪️ 参考：https://istio.io/latest/docs/ops/best-practices/deployment/#deploy-across-multiple-availability-zones

<br>

### サービスメッシュに登録しないPodの選定 (サイドカープロキシメッシュの場合)

#### ▼ 監視系のPod

サイドカープロキシメッシュに登録するPodが増えると、その分`istio-proxy`コンテナが増える。

そのため、Pod当たりのハードウェアリソースの消費量が増えてしまう。

テレメトリーを収集する必要のないPod (例：監視を責務に持つPod) は、サイドカープロキシメッシュに登録しないようにする。

#### ▼ Job配下のPod

Job配下のPodに`istio-proxy`コンテナを挿入した場合、Pod内のコンテナが終了しても`istio-proxy`コンテナが終了せず、Pod自体が削除されない問題がある。

Job配下のPodは、サイドカープロキシメッシュに登録しないようにする。

どうしてもサービスメッシュに登録したい場合は、Pod内のコンテナで、`istio-proxy`コンテナの『`localhost:15020/quitquitquit`』をコールするようなシェルスクリプトを実行する。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: foo-job
spec:
  template:
    metadata:
      name: foo-job
    spec:
      containers:
        - name: foo
          command: ["/bin/bash", "-c"]
          args:
            - >
              until curl -fsI http://localhost:15021/healthz/ready;
              do
                echo "Waiting for Sidecar to be healthy";
                sleep 3;
              done;
              echo "Sidecar available. Running job command...";
              <CronJobのコマンド>;
              x=$(echo $?);
              curl -fsI -X POST http://localhost:15020/quitquitquit && 
              exit $x
```

> ↪️ 参考：
>
> - https://www.kabegiwablog.com/entry/2020/08/31/224827
> - https://github.com/istio/istio/issues/6324#issuecomment-760156652
> - https://youtu.be/2_Nan81j03o?t=1915

<br>

## 02. トラフィック管理

### IngressGatewayに関して

#### ▼ Istiodコントロールプレーンとは異なるNamespaceにおく

セキュリティ上の理由から、IngressGatewayとIstiodコントロールプレーンは異なるNamespaceにおく方が良い。

> ↪️ 参考：https://istio.io/latest/docs/setup/additional-setup/gateway/#deploying-a-gateway

#### ▼ NodePort Serviceを選ぶ

IngressGatewayでは、内部的に作成されるServiceのタイプ (NodePort Service、LoadBalancer Service) を選べる。

NodePort Serviceを選ぶ場合、Nodeの前段に開発者がロードバランサーを作成し、NodePort Serviceにインバウンド通信をルーティングできるようにする。

一方で、LoadBalancer Serviceを選ぶ場合、クラウドプロバイダーのロードバランサーが自動的に作成される。

そのため、このロードバランサーからLoadBalancer Serviceにルーティングできるようにする。

LoadBalancer Serviceでは、クラウドプロバイダーのリソースとKubernetesリソースの責務の境界が曖昧になってしまうため、NodePort Serviceを選ぶようにする。

補足として、デフォルトではIngressGatewayの内部ではLoadBalancer Serviceを作成されてしまう。

NodePort Serviceを選ぶためには、IngressGatewayではなく、IstioOperatorやistioチャート上でServiceのタイプを設定し、IngressGatewayを作成する必要がある。

> ↪️ 参考：
>
> - https://github.com/istio/istio/issues/28310#issuecomment-733079966
> - https://github.com/istio/istio/blob/bd9ae57cc00a44810496989ec3fa34649d6c8516/manifests/charts/gateway/values.yaml#L39

#### ▼ アプリコンテナごとに作成する

単一障害点になることを防ぐために、`1`個のIngressGatewayで全てのアプリコンテナにルーティングするのではなく、アプリコンテナことに用意する。

<br>

### サブセット名を`1`個にする

Istioリソースで設定するサブセット名は`1`個だけにする。

これにより、IngressGatewayで受信したインバウンド通信を、特定のバージョンのPodにルーティングできる。

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

> ↪️ 参考：https://istio.io/latest/docs/ops/best-practices/traffic-management/#set-default-routes-for-services

<br>

### Istioリソースの使用可能範囲を限定する

Istioリソースの`.spec.exportTo`キーでは『`.` (ドット) 』を設定する。

これにより、DestinationRuleを想定外のNamespaceで使用してしまうことを防ぐ。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  hosts:
    - "*"
  exportTo:
    - "."
  http:
    - route:
        - destination:
            host: myservice
```

> ↪️ 参考：https://istio.io/latest/docs/ops/best-practices/traffic-management/#cross-namespace-configuration

<br>

### DestinationRuleを最初に更新する

新しいサブセットを追加する場合、DestinationRuleを最初に更新する。

これにより、ダウンタイムなしでサブセットを追加できる。

DestinationRuleを更新する前に新しいサブセットを持つVirtualServiceを更新してしまうと、VirtualServiceは新しいサブセットを持つDestinationRuleを見つけられず、`503`ステータスを返信してしまう。

DestinationRuleを最初に更新し、正常に完了することを待機した後に、VirtualServiceを更新する。

> ↪️ 参考：https://istio.io/latest/docs/ops/best-practices/traffic-management/#avoid-503-errors-while-reconfiguring-service-routes

<br>

## 03. アップグレード

### 設計ポリシー

#### ▼ サポート期間

Istioでは、マイナーバージョンごとのアップグレードを推奨しており、またマイナーバージョンのサポートが半年ごとに終了する。

実質的に半年ごとにアップグレード工数が発生する。

> ↪️ 参考：https://istio.io/latest/docs/releases/supported-releases/#support-status-of-istio-releases

#### ▼ マイナーバージョン単位でアップグレード

Istioの開発プロジェクトでは、マイナーバージョンを`1`個ずつ新しくするアップグレードしか検証していない。

そのため、マイナーバージョンを`2`個以上跨いだアップグレードを推奨していない。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/setup/upgrade/
> - https://thenewstack.io/upgrading-istio-without-downtime/

#### ▼ Istiodコントロールプレーンでダウンタイムを発生させない

Istiodコントロールプレーンでダウンタイムが発生すると、`istio-proxy`コンテナ内のpilot-agentが最新の宛先情報を取得できなくなる。

そのため、古いバージョンのアプリコンテナの宛先情報を使用してしまう。

Istiodコントロールプレーンをカナリアアップグレードを採用する。

> ↪️ 参考：https://thenewstack.io/upgrading-istio-without-downtime/

#### ▼ IngressGatewayでダウンタイムを発生させない

IngressGatewayでダウンタイムが発生すると、アプリへのインバウンド通信が遮断されてしまう。

> ↪️ 参考：https://thenewstack.io/upgrading-istio-without-downtime/

<br>

### インプレース方式

#### ▼ インプレース方式とは

既存のIstiodコントロールプレーンとIngressGatewayの両方をインプレース方式でアップグレードする。

#### ▼ 手順

`【１】`

: カスタムリソース定義を更新する。

     必要なカスタムリソース定義のマニフェストは、リポジトリで確認する必要がある。

```bash
$ git clone https://github.com/istio/istio.git

$ kubectl apply -f manifests/charts/base/crds
```

`【２】`

: IstiodコントロールプレーンとIngressGatewayの両方をインプレース方式でアップグレードする。

```bash
$ istioctl upgrade
```

`【３】`

: データプレーンの`istio-proxy`コンテナを再インジェクションする。

```bash
$ kubectl rollout restart deployment app-deployment -n app
```

> ↪️ 参考：https://istio.io/latest/docs/setup/upgrade/in-place/

<br>

### カナリア方式

#### ▼ カナリア方式とは

> ↪️ 参考：https://hiroki-hasegawa.hatenablog.jp/entry/2023/02/26/202548

<br>

## 04. 監視ポリシー

### `istio-proxy`コンテナ

メトリクスの名前空間を`istio-proxy`コンテナとした時の監視ポリシーは以下の通りである。

| メトリクス                                                          | 単位     | 説明                                                                                                                                                                                              | アラート条件例 (合致したら発火) |
| ------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 総リクエスト数 (`istio_requests_total`)                             | カウント | `istio-proxy`コンテナが受信した総リクエスト数を表す。メトリクスの名前空間に対して様々なディメンションを設定できる。<br>↪️ 参考：https://blog.christianposta.com/understanding-istio-telemetry-v2/ |                                 |
| 総gRPCリクエスト数 (`istio_request_messages_total`)                 | カウント | `istio-proxy`コンテナが受信した総gRPCリクエスト数を表す。                                                                                                                                         |                                 |
| 総gRPCレスポンス数 (`istio_response_messages_total`)                | カウント | `istio-proxy`コンテナが受信した総gRPCレスポンス数を表す。                                                                                                                                         |                                 |
| Pod間通信リトライ数 (`envoy_cluster_upstream_rq_retry`)             | カウント | `istio-proxy`コンテナの他のPodへの通信に関するリトライ数を表す。                                                                                                                                  |                                 |
| Pod間通信リトライ成功数 (`envoy_cluster_upstream_rq_retry_success`) | カウント | `istio-proxy`コンテナが他のPodへの通信に関するリトライ成功数を表す。                                                                                                                              |

> ↪️ 参考：
>
> - https://istio.io/latest/docs/reference/config/metrics/
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/upstream/cluster_manager/cluster_stats
> - https://www.zhaohuabing.com/post/2023-02-14-istio-metrics-deep-dive/

<br>
