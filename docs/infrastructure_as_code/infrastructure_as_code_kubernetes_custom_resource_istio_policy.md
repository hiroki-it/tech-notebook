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

クラウドプロバイダー環境でIstioを稼働させる場合、各AZや各リージョンにコントロールプレーンを```1```個だけセットアップし、できるだけ多くのアプリコンテナのサービスメッシュとなるようにする。



> ℹ️ 参考：https://istio.io/latest/docs/ops/best-practices/deployment/#deploy-fewer-clusters

<br>

### 冗長化

コントロールプレーンの可用性を高めるために、コントロールプレーンを異なるAZに冗長化させる。



> ℹ️ 参考：https://istio.io/latest/docs/ops/best-practices/deployment/#deploy-across-multiple-availability-zones

<br>

### サービスメッシュに登録しないPodの選定

#### ▼ サイドカープロキシメッシュの場合

| 登録しないPod例 | 理由                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 監視系のPod   | サイドカープロキシメッシュに登録するPodが増えると、その分```istio-proxy```コンテナが増える。そのため、Pod当たりのハードウェアリソースの消費量が増えてしまう。可観測性を高める必要のないPod（例：監視を責務に持つPod）は、サイドカープロキシメッシュに登録しないようにする。                                                                                                                                                                                                                                                                                               |
| Job配下のPod  | Job配下のPodに```istio-proxy```コンテナを挿入した場合、Pod内のコンテナが終了しても```istio-proxy```コンテナが終了せず、Pod自体が削除されない問題がある。Job配下のPodは、サイドカープロキシメッシュに登録しないようにする。どうしてもサービスメッシュに登録したい場合は、Pod内のコンテナで、```istio-proxy```コンテナの『```localhost:15020/quitquitquit```』をコールするようなシェルスクリプトを実行する。<br>ℹ️ 参考：<br>・https://www.kabegiwablog.com/entry/2020/08/31/224827 <br>・https://github.com/istio/istio/issues/6324#issuecomment-760156652 <br>・https://youtu.be/2_Nan81j03o?t=1915 |

<br>

## 02. トラフィック管理

### IngressGatewayに関して

#### ▼ NodePort Serviceを選ぶ

IngressGatewayでは、内部的に作成されるServiceのタイプ（NodePort Service、LoadBalancer Service）を選べる。

NodePort Serviceを選ぶ場合、Nodeの前段に開発者がロードバランサーを作成し、NodePort Serviceにインバウンド通信をルーティングできるようにする。

一方で、LoadBalancer Serviceを選ぶ場合、クラウドプロバイダーのロードバランサーが自動的に作成されるため、このロードバランサーからLoadBalancer Serviceにルーティングできるようにする。

LoadBalancer Serviceでは、クラウドプロバイダーのリソースとKubernetesリソースの責務の境界が曖昧になってしまうため、NodePort Serviceを選ぶようにする。

補足として、デフォルトではIngressGatewayの内部ではLoadBalancer Serviceを作成されてしまう。

NodePort Serviceを選ぶためには、IngressGatewayではなく、IstioOperatorやistioチャート上でServiceのタイプを設定し、IngressGatewayを作成する必要がある。



> ℹ️ 参考：
> 
> - https://github.com/istio/istio/issues/28310#issuecomment-733079966
> - https://github.com/istio/istio/blob/bd9ae57cc00a44810496989ec3fa34649d6c8516/manifests/charts/gateway/values.yaml#L39

#### ▼ アプリコンテナごとに作成する

単一障害点になることを防ぐために、```1```個のIngressGatewayで全てのアプリコンテナにルーティングするのではなく、アプリコンテナことに用意する。



<br>


### サブセット名を```1```個にする

Istioリソースで設定するサブセット名は```1```個だけにする。

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

> ℹ️ 参考：https://istio.io/latest/docs/ops/best-practices/traffic-management/#set-default-routes-for-services


<br>

### Istioリソースの使用可能範囲を限定する

Istioリソースの```.spec.exportTo```キーでは『```.```（ドット）』を設定する。

これにより、DestinationRuleを想定外のNamespaceで使用してしまうことを防ぐ。

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

> ℹ️ 参考：https://istio.io/latest/docs/ops/best-practices/traffic-management/#cross-namespace-configuration


<br>

### DestinationRuleを最初に更新する

新しいサブセットを追加する場合、DestinationRuleを最初に更新する。

これにより、ダウンタイムなしでサブセットを追加できる。

DestinationRuleを更新する前に新しいサブセットを持つVirtualServiceを更新してしまうと、VirtualServiceは新しいサブセットを持つDestinationRuleを見つけられず、```503```ステータスを返信してしまう。

DestinationRuleを最初に更新し、正常に完了することを待機した後に、VirtualServiceを更新する。



> ℹ️ 参考：https://istio.io/latest/docs/ops/best-practices/traffic-management/#avoid-503-errors-while-reconfiguring-service-routes

<br>

## 03. アップグレード

### 設計ポリシー

#### ▼ マイナーバージョン単位でアップグレード

Istioの開発プロジェクトでは、マイナーバージョンを```1```個ずつ新しくするアップグレードしか検証していない。

そのため、マイナーバージョンを```2```個以上跨いだアップグレードを推奨していない。

> ℹ️ 参考：
> 
> - https://istio.io/latest/docs/setup/upgrade/
> - https://thenewstack.io/upgrading-istio-without-downtime/

#### ▼ Istiodコントロールプレーンでダウンタイムを発生させない

Istiodコントロールプレーンでダウンタイムが発生すると、```istio-proxy```コンテナ内のpilot-agentが最新の宛先情報を取得できなくなる。

そのため、古いバージョンのアプリコンテナの宛先情報を使用してしまう。

Istiodコントロールプレーンをカナリア方式アップグレードを採用する。

> ℹ️ 参考：https://thenewstack.io/upgrading-istio-without-downtime/

#### ▼ IngressGatewayでダウンタイムを発生させない

IngressGatewayでダウンタイムが発生すると、アプリへのインバウンド通信が遮断されてしまう。

> ℹ️ 参考：https://thenewstack.io/upgrading-istio-without-downtime/

<br>

### インプレース方式

既存のIstiodコントロールプレーンとIngressGatewayの両方をインプレース方式でアップグレードする。

```【１】```

:    カスタムリソース定義を更新する。必要なカスタムリソース定義のマニフェストは、リポジトリで確認する必要がある。

```bash
$ git clone https://github.com/istio/istio.git

$ kubectl apply -f manifests/charts/base/crds
```

```【２】```

:    IstiodコントロールプレーンとIngressGatewayの両方をインプレース方式でアップグレードする。

```bash
$ istioctl upgrade
```

```【３】```

:    データプレーンの```istio-proxy```コンテナを再インジェクションする。

```bash
$ kubectl rollout restart deployment app-deployment -n app
```

> ℹ️ 参考：https://istio.io/latest/docs/setup/upgrade/in-place/

<br>

### カナリア方式

#### ▼ カナリア方式とは

Istiodコントロールプレーンをカナリア方式でアップグレードし、一方でIngressGatewayはインプレース方式でアップグレードする。

異なるバージョンのIstioコントロールプレーンを並行的に稼働させる。

![istio_canary-upgrade_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_canary-upgrade_1.png)


```istio-proxy```コンテナをインジェクションしているNamespaceが複数あるという前提で、特定のNamespaceのラベルを書き換える。

すると、そのNamespace上で新```istio-proxy```コンテナが、それ以外のNamespaceでは旧```istio-proxy```コンテナが動くことになる。

![istio_canary-upgrade_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_canary-upgrade_2.png)


新```istio-proxy```コンテナが正しく動作すれば、残りのNamespaceにも新```istio-proxy```コンテナをインジェクションする。

![istio_canary-upgrade_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_canary-upgrade_3.png)


Istioでは、この状況をカナリア方式（一部のユーザーを新```istio-proxy```コンテナにルーティングして実地的に検証する）と呼称している。

ただし、```istio-proxy```コンテナをインジェクションしているNamespaceが```1```個しかない場合、全ての通信が新```istio-proxy```コンテナにルーティングされるため、カナリアにはならない。

補足として、新しい```istio-proxy```コンテナをインジェクションする方法には```2```個の選択肢がある。

前者は、Namespaceにある```istio.io/rev```キーのリビジョン番号を書き換える方法である。

後者はより新しい手法で、MutatingWebhookConfigurationのエイリアスに紐づくリビジョン番号を書き換える方法である。

> ℹ️ 参考：
> 
> - https://medium.com/snowflake/blue-green-upgrades-of-istio-control-plane-7642bb2c39c2
> - https://istio.io/latest/blog/2021/direct-upgrade/#upgrade-from-18-to-110
> - https://istio.io/latest/blog/2021/revision-tags/



#### ▼ 手順（Helmを使用する場合）

```【１】```

:    カスタムリソース定義を更新する。必要なカスタムリソース定義のマニフェストは、リポジトリで確認する必要がある。Helmは、カスタムリソース定義の更新に対応していない（作成には対応している）ため、```kubectl```コマンドを使用してこれを更新する。

```bash
$ git clone https://github.com/istio/istio.git

$ kubectl apply -f manifests/charts/base/crds
```

```【２】```

:    カスタムリソース定義以外のマニフェストを送信し、旧Istiodコントロールプレーンを残したまま、新Istiodコントロールプレーンを作成する。この手順は、```istioctl install```コマンドによるIstiodのインストールに相当する。

```bash
# アップグレード先が1.1.0とする。
$ helm install istiod istio/istiod --set revision=1-1-0 -n istio-system
```

```【３】```

:    新しいIstiodコントロールプレーンを確認する。

```bash
# Deployment
$ kubectl get deployment -n istio-system

NAME                READY   STATUS    RESTARTS   AGE
istiod-1-0-0        1/1     Running   0          1m  # 1-0-0
istiod-1-1-0        1/1     Running   0          1m  # 1-1-0（今回のアップグレード先）


# Service
$ kubectl get svc -n istio-system

NAME             TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)                                                AGE
istiod-1-0-0     ClusterIP   10.32.6.58    <none>        15010/TCP,15012/TCP,443/TCP,15014/TCP,53/UDP,853/TCP   12m
istiod-1-1-0     ClusterIP   10.32.6.58    <none>        15010/TCP,15012/TCP,443/TCP,15014/TCP,53/UDP,853/TCP   12m # 新しい方


# MutatingWebhookConfiguration
$ kubectl get mutatingwebhookconfigurations

NAME                                  WEBHOOKS   AGE
istio-sidecar-injector-1-0-0          1          7m56s # 1-0-0
istio-sidecar-injector-1-1-0          1          7m56s # 1-1-0（今回のアップグレード先）
istio-revision-tag-default            1          3m18s # 現在のリビジョン番号（1-0-0）を定義するdefaultタグを持つ
```




```【４】```

:    ここでは```2```個の選択肢がある。```1```個目は、Istioの```istio.io/rev```キーのリビジョン番号を書き換えて、新しい```istio-proxy```コンテナをインジェクションする。多くの場合、```istio-proxy```コンテナはIngressGatewayとアプリケーションのPodのNamespaceにインジェクションしているはずである。そこで、それらのNamespaceを指定する。もしGitOpsツール（例：ArgoCD）でNamespaceを管理している場合は、```kubectl label```コマンドの代わりに、GitHub上でリビジョン番号を変更することになる。


```bash
# IngressGatewayの特定のNamespace
$ kubectl label namespace ingress istio.io/rev=1-1-0 istio-injection- --overwrite

# アプリの特定のNamespace
$ kubectl label namespace foo-app istio.io/rev=1-1-0 istio-injection- --overwrite
```


> ℹ️ 参考：https://istio.io/latest/docs/setup/upgrade/canary/

```【４】```

:    ```2```個目は、Istioの```istio.io/rev```キーのエイリアスの実体を書き換えて、新しい```istio-proxy```コンテナをインジェクションする。具体的には、Istioのmutating-admissionを設定するMutatingWebhookConfigurationのラベル値を変更する。MutatingWebhookConfigurationの```.metadata.labels```キーにあるエイリアスの実体が旧バージョンのままなため、新バージョンに変更する。

```bash
$ istioctl tag set default --revision 1-1-0 --overwrite
```

> ℹ️ 参考：https://istio.io/latest/blog/2021/direct-upgrade/#upgrade-from-18-to-110

```【５】```

:    IngressGatewayとアプリのPodを再スケジューリングし、新バージョンの```istio-proxy```コンテナを自動的にインジェクションする。

```bash
$ kubectl rollout restart deployment istio-ingressgateway -n istio-ingress

# まずはfoo-appで検証する。
$ kubectl rollout restart deployment app-deployment -n app

# 新バージョンのistio-proxyコンテナがインジェクションされたことを確認する。
$ istioctl proxy-status

NAME                     CLUSTER        CDS        LDS        EDS        RDS          ISTIOD           VERSION
foo-app                  Kubernetes     SYNCED     SYNCED     SYNCED     SYNCED       istiod-1-1-0     1.1.0
bar-app                  Kubernetes     SYNCED     SYNCED     SYNCED     SYNCED       istiod-1-0-0     1.0.0 # まだ古いIstiodコントロールプレーンと紐づく
istio-ingressgateway     Kubernetes     SYNCED     SYNCED     SYNCED     NOT SENT     istiod-1-1-0     1.1.0
```



```【６】```

:    新バージョンの```istio-proxy```コンテナをインジェクションしたNamespaceで、アプリの動作を確認する。


```【７】```

:    新バージョンの```istio-proxy```コンテナに問題がなければ、他のアプリのNamespaceの```.metadata.labels.istio.io/rev```キーのリビジョン番号を順番に変更していく。

```bash
# 他のNamespaceでも新istio-proxyコンテナを検証していく。
$ kubectl label namespace bar-app istio.io/rev=1-1-0 istio-injection- --overwrite

$ kubectl label namespace baz-app istio.io/rev=1-1-0 istio-injection- --overwrite
```


```【８】```

:    もし途中で問題が起これば、```.metadata.labels.istio.io/rev```キーのリビジョン番号順番に元に戻していく。あるいは、エイリアスの実体を元に戻す。

```【９】```

:    全てのNamespaceの```istio-proxy```コンテナのアップグレードが完了し、動作に問題がないかを確認する。



```【１０】```

:    古いIstiodコントロールプレーンをアンインストールする。

```bash
$ istioctl uninstall --revision 1-0-0 -y
```

```【１２】```

:    古いIstiodコントロールプレーンが削除されたことを確認する。

```bash
# Deployment
$ kubectl get deployment -n istio-system

NAME                READY   STATUS    RESTARTS   AGE
istiod-1-1-0        1/1     Running   0          1m  # 1-1-0


# Service
$ kubectl get svc -n istio-system

NAME             TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)                                                AGE
istiod-1-1-0     ClusterIP   10.32.6.58    <none>        15010/TCP,15012/TCP,443/TCP,15014/TCP,53/UDP,853/TCP   12m # 新しい方


# MutatingWebhookConfiguration
$ kubectl get mutatingwebhookconfigurations

NAME                                  WEBHOOKS   AGE
istio-sidecar-injector-1-1-0          1          7m56s # 1-1-0
istio-revision-tag-default            1          3m18s # 現在のリビジョン番号（1-1-0）を定義するdefaultタグを持つ
```

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/setup/upgrade/helm/#canary-upgrade-recommended
> - https://istio.io/v1.10/docs/setup/upgrade/canary/
> - https://jimmysong.io/blog/istio-canary-upgrade/


<br>

## 04. 監視ポリシー

### ```istio-proxy```コンテナ

メトリクスの名前空間を```istio-proxy```コンテナとした時の監視ポリシーは以下の通りである。


| メトリクス                                              | 単位 | 説明                                                                                                                                                           | アラート条件例（合致したら発火） |
|----------------------------------------------------|------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------|
| 総リクエスト数（```istio_requests_total```）              | カウント | ```istio-proxy```コンテナが受信した総リクエスト数を表す。メトリクスの名前空間に対して様々なディメンションを設定できる。<br>ℹ️ 参考：https://blog.christianposta.com/understanding-istio-telemetry-v2/ |                         |
| 総gRPCリクエスト数（```istio_request_messages_total```）  | カウント | ```istio-proxy```コンテナが受信した総gRPCリクエスト数を表す。                                                                                                                 |                         |
| 総gRPCレスポンス数（```istio_response_messages_total```） | カウント | ```istio-proxy```コンテナが受信した総gRPCレスポンス数を表す。                                                                                                                 |                         |

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/metrics/


<br>
