---
title: 【IT技術の知見】設計ポリシー＠Istio
description: 設計ポリシー＠Istioの知見を記録しています。
---

# 設計ポリシー＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### 少ないコントロールプレーン

クラウドプロバイダー環境でIstioを稼働させる場合、各AZや各リージョンにコントロールプレーンを`1`個だけセットアップし、できるだけ多くのアプリコンテナのサービスメッシュとなるようにする。

> - https://istio.io/latest/docs/ops/best-practices/deployment/#deploy-fewer-clusters

<br>

### 冗長化

コントロールプレーンの可用性を高めるために、コントロールプレーンを異なるAZに冗長化させる。

> - https://istio.io/latest/docs/ops/best-practices/deployment/#deploy-across-multiple-availability-zones

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
          command:
            - /bin/bash
            - -c
          args:
            - >
              until curl -fsI http://localhost:15021/healthz/ready; do
                echo "Waiting for Sidecar to be healthy";
                sleep 3;
              done;
              echo "Sidecar available. Running job command..." &&
              <CronJobのコマンド> &&
              x=$(echo $?) &&
              curl -fsI -X POST http://localhost:15020/quitquitquit && 
              exit $x
```

> - https://www.kabegiwablog.com/entry/2020/08/31/224827
> - https://github.com/istio/istio/issues/6324#issuecomment-760156652
> - https://youtu.be/2_Nan81j03o?t=1915

<br>

## 02. トラフィック管理

### IngressGatewayに関して

#### ▼ Istiodコントロールプレーンとは異なるNamespaceにおく

セキュリティ上の理由から、IngressGatewayとIstiodコントロールプレーンは異なるNamespaceにおく方が良い。

> - https://istio.io/latest/docs/setup/additional-setup/gateway/#deploying-a-gateway

#### ▼ NodePort Serviceを選ぶ

IngressGatewayでは、内部的に作成されるServiceのタイプ (NodePort Service、LoadBalancer Service) を選べる。

NodePort Serviceを選ぶ場合、Nodeの前段に開発者がロードバランサーを作成し、NodePort Serviceにインバウンド通信をルーティングできるようにする。

一方で、LoadBalancer Serviceを選ぶ場合、クラウドプロバイダーのロードバランサーが自動的に作成される。

そのため、このロードバランサーからLoadBalancer Serviceにルーティングできるようにする。

LoadBalancer Serviceでは、クラウドプロバイダーのリソースとKubernetesリソースの責務の境界が曖昧になってしまうため、NodePort Serviceを選ぶようにする。

補足として、デフォルトではIngressGatewayの内部ではLoadBalancer Serviceを作成されてしまう。

NodePort Serviceを選ぶためには、IngressGatewayではなく、IstioOperatorやistioチャート上でServiceのタイプを設定し、IngressGatewayを作成する必要がある。

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

> - https://istio.io/latest/docs/ops/best-practices/traffic-management/#set-default-routes-for-services

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

> - https://istio.io/latest/docs/ops/best-practices/traffic-management/#cross-namespace-configuration

<br>

### DestinationRuleを最初に更新する

新しいサブセットを追加する場合、DestinationRuleを最初に更新する。

これにより、ダウンタイムなしでサブセットを追加できる。

DestinationRuleを更新する前に新しいサブセットを持つVirtualServiceを更新してしまうと、VirtualServiceは新しいサブセットを持つDestinationRuleを見つけられず、`503`ステータスを返信してしまう。

DestinationRuleを最初に更新し、正常に完了することを待機した後に、VirtualServiceを更新する。

> - https://istio.io/latest/docs/ops/best-practices/traffic-management/#avoid-503-errors-while-reconfiguring-service-routes

<br>

## 02-02. 通信ルーティングのパターン

### LoadBalancer Serviceの場合

LoadBalancer Serviceを使用する場合、以下のようなネットワーク経路がある。

**＊例＊**

```
パブリックネットワーク
⬇︎
AWS Route53
⬇︎
AWS ALB
⬇︎
LoadBalancer Service (Istio IngressGateway)
⬇︎
Gateway
⬇︎
VirtualService
⬇︎
Service
⬇︎
Pod
```

<br>

### NodePort Serviceの場合

#### ▼ ロードバランサーがない場合

NodeのNICの宛先情報は、Node外から宛先IPアドレスとして指定できるため、インバウンド通信にIngressを必要としない。

**＊例＊**

```
パブリックネットワーク
⬇︎
NodePort Service (Istio IngressGateway)
⬇︎
Gateway
⬇︎
VirtualService
⬇︎
Service
⬇︎
Pod
```

#### ▼ ロードバランサーがある場合

パブリックプロバイダーのロードバランサー (例：AWS ALB) を別に置く (このLBは、Ingressコントローラー由来ではない) 。

**＊例＊**

```
パブリックネットワーク
⬇︎
AWS Route53
⬇︎
AWS ALB
⬇︎
NodePort Service (Istio IngressGateway)
⬇︎
Gateway
⬇︎
VirtualService
⬇︎
Service
⬇︎
Pod
```

<br>

## 03. アップグレード

### 設計ポリシー

#### ▼ サポート期間

Istioでは、マイナーバージョンごとのアップグレードを推奨しており、またマイナーバージョンのサポートが半年ごとに終了する。

実質的に半年ごとにアップグレード工数が発生する。

> - https://istio.io/latest/docs/releases/supported-releases/#support-status-of-istio-releases

#### ▼ マイナーバージョン単位でアップグレード

Istioの開発プロジェクトでは、マイナーバージョンを`1`個ずつ新しくするアップグレードしか検証していない。

そのため、マイナーバージョンを`2`個以上跨いだアップグレードを推奨していない。

> - https://istio.io/latest/docs/setup/upgrade/
> - https://thenewstack.io/upgrading-istio-without-downtime/

#### ▼ Istiodコントロールプレーンでダウンタイムを発生させない

Istiodコントロールプレーンでダウンタイムが発生すると、`istio-proxy`コンテナ内のpilot-agentが最新の宛先情報を取得できなくなる。

そのため、古いバージョンのアプリコンテナの宛先情報を使用してしまう。

Istiodコントロールプレーンをカナリアアップグレードを採用する。

> - https://thenewstack.io/upgrading-istio-without-downtime/

#### ▼ IngressGatewayでダウンタイムを発生させない

IngressGatewayでダウンタイムが発生すると、アプリへのインバウンド通信が遮断されてしまう。

> - https://thenewstack.io/upgrading-istio-without-downtime/

<br>

### インプレース方式

#### ▼ インプレース方式とは

既存のIstiodコントロールプレーンとIngressGatewayの両方をインプレース方式でアップグレードする。

#### ▼ 手順

`【１】`

: CRDを更新する。

     必要なCRDのマニフェストは、リポジトリで確認する必要がある。

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

> - https://istio.io/latest/docs/setup/upgrade/in-place/

<br>

### カナリア方式

#### ▼ カナリア方式とは

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/02/26/202548

#### ▼ `istioctl`コマンドの場合

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/02/26/202548

#### ▼ `helm`コマンドの場合

`【１】`

: HelmではCRDを管理しないようにし、`kubectl`コマンドでこれを作成する。

```bash
$ kubectl diff -f https://raw.githubusercontent.com/istio/istio/1.15.3/manifests/charts/base/crds/crd-all.gen.yaml
```

`【２】`

: istiodチャートを使用して、古いバージョンのMutatingWebhookConfigurationのみを削除する。

    この時、既存のリリースは古いリリースとして扱う。

```bash
$ helm upgrade <古いバージョンのリリース名> <チャートリポジトリ名>/istiod -n istio-system --version <古いバージョン> --set revisionTags=null
```

`【３】`

: istiodチャートを使用して、新しいバージョンのMutatingWebhookConfigurationを作成しつつ、Istiodコントロールプレーンに関するKubernetesリソースを変更する。

     この時、リリースを新しく命名する。

```bash
$ helm upgrade <新しいバージョンのリリース名> <チャートリポジトリ名>/istiod -n istio-system --version <新しいバージョン>
```

`【４】`

: 特定のNamespaceをアップグレードする。

`【５】`

: 動作確認し、問題なければ、残りのNamespaceもアップグレードする。

`【６】`

: istiodチャートを使用して、古いリリースで作成したIstiodコントロールプレーンに関するKubernetesリソースを削除する。

```bash
$ helm upgrade <古いバージョンのリリース名> <チャートリポジトリ名>/istiod -n istio-system --version <古いバージョン> --set revisionTags=null
```

`【７】`

: istio-baseを使用して、Istioに関するCRDを変更する。

     この時、リリースを新しく命名する。

```bash
$ helm upgrade <新しいバージョンのリリース名> <チャートリポジトリ名>/base -n istio-system --version <新しいバージョン>
```

`【８】`

: gatewayチャートを使用して、IstioのIngressGatewayに関するKubernetesリソースを変更する。

     この時、リリースを新しく命名する。

```bash
$ helm upgrade <新しいバージョンのリリース名> <チャートリポジトリ名>/gateway -n istio-ingress --version <新しいバージョン>
```

<br>
