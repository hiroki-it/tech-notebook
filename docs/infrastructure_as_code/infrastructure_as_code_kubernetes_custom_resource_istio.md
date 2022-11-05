---
title: 【IT技術の知見】Istio＠カスタムリソース
description: Istio＠カスタムリソースの知見を記録しています。
---

# Istio＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Istioの仕組み

### デザインパターン別

#### ▼ サイドカープロキシによるサービスメッシュのアーキテクチャ

![istio_sidecar-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_sidecar-mesh_architecture.png)

サイドカープロキシによるサービスメッシュは、データプレーン、Isiodコントロールプレーン、から構成される。サイドカープロキシを使用して、サービスメッシュを実装する。サイドカーは、```L4```（トランスポート層）のプロトコル（例：TCP、UDP、など）と```L7```（アプリケーション層）のプロトコル（例：HTTP、HTTPS、など）を処理する責務を持つ。ただ必ずしも、Istioリソースを使用する必要はなく、代わりとして、KubernetesやOpenShiftに内蔵されたIstioに相当するオプションを使用しても良い。

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/ops/deployment/architecture/
> - https://techblog.zozo.com/entry/zozotown-istio-production-ready
> - https://www.amazon.co.jp/dp/B09XN9RDY1

#### ▼ アンビエントメッシュのアーキテクチャ

![istio_ambient-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_ambient-mesh_architecture.png)

アンビエントメッシュは、データプレーン、コントロールプレーンNode、から構成される。Node内の単一プロキシを使用して、サービスメッシュを実装する。ztunnel（実体はDaemonSet配下のPod）が```L4```（トランスポート層）のプロトコル（例：TCP、UDP、など）、またwaypoint-proxy（実体はDeployment配下のPod）が```L7```（アプリケーション層）のプロトコル（例：HTTP、HTTPS、など）を処理する責務を持つ。Node外からのインバウンド通信、またNode外へのアウトバウンド通信は、ztunnelのPodを経由して、一度waypoint-proxyのPodにリダイレクトされる。ztunnelのPodを経由した段階でHTTPSプロトコルになる。リソース消費量の少ない```L4```と多い```L7```のプロコトルの処理の責務が分離されているため、サイドカープロキシによるサービスメッシュと比較して、```L4```のプロトコルのみを処理する場合に、ワーカーNodeのリソース消費量を節約できる。サイドカープロキシによるサービスメッシュを将来的に廃止するということはなく、好きな方を選べるようにするらしい。

インバウンド時の通信の経路は以下の通りである。

```text
外
↓
----- ワーカーNode
↓
リダイレクト
↓
ztunnelのPod（L4）
↓
waypointのPod（L7）
↓
マイクロサービスのPod
```

アウトバウンド時の通信の経路は以下の通りである。

```text
外
↑
----- ワーカーNode
↑
waypointのPod（L7）
↑
ztunnelのPod（L4）
↑
リダイレクト
↑
マイクロサービスのPod
```

> ℹ️ 参考：
>
> - https://istio.io/latest/blog/2022/introducing-ambient-mesh/
> - https://istio.io/latest/blog/2022/get-started-ambient/#install-istio-with-ambient-mode
> - https://github.com/istio/istio/blob/experimental-ambient/manifests/charts/istio-control/istio-discovery/files/waypoint.yaml
> - https://www.sobyte.net/post/2022-09/istio-ambient/
> - https://www.zhaohuabing.com/post/2022-09-08-introducing-ambient-mesh/

#### ▼ デザインパターンの比較

| 項目            | サイドカープロキシによるサービスメッシュ                                       | アンビエントメッシュ             |
|---------------|------------------------------------------------------------|------------------------|
| Istioのアップグレード | サイドカーの再作成時に障害が起こる可能性がある。対策としては、Istioのカナリアリリース方式アップグレードがある。 | |
| リソースの消費量      | サイドカーを各Podに注入することになるため、Pod全体としての合計のリソース消費量が多くなる。           | |


<br>

### 他のOSSツールとの比較

> ℹ️ 参考：https://www.amazon.co.jp/dp/1492043788

| 能力（執筆時点2022/08/21）         | Istio | Linkerd | Consul |
|--------------------------|:-----:|:--------:|:------:|
| 能力の豊富さ                   | ⭕️   | △       | △     |
| 異なるClusterのデータプレーン内管理    | ⭕️   | ×       | ⭕️    |
| 仮想サーバーのデータプレーン内管理        | ⭕️ | × | ⭕️ |
| ダッシュボード                  | × |    ⭕️    | ⭕️   |
| サービスディスカバリー              | ⭕️   |    ⭕️    | ⭕️    |
| メトリクス収集                  | ⭕️   |    ⭕️    | ×     |
| 分散トレース収集                 | ⭕️   | ×       | ⭕️    |
| 相互TLS                    | ⭕️   |    ⭕️    | ⭕️    |
| ポリシーベースのACL              | ⭕️   | ×       | ×     |
| 意図ベースのACL                | ×    | ×       | ⭕️    |
| SSL証明書管理                 | ⭕️   | ×       | ⭕️    |
| HTTP/1.2、HTTP/2.0、gRPC   | ⭕️   |    ⭕️    | ×     |
| TCP                      | ⭕️   |    ⭕️    | ⭕️    |
| カスタムリソース                 | ⭕️   |    ⭕️    | ×     |
| サイドカーインジェクション            | ⭕️   |    ⭕️    | ⭕️    |
| ブルー/グリーンデプロイメント          | ⭕️   | ×       | ×     |
| カナリアリリース                 | ⭕️   |    ⭕️    | ×     |
| 属性ベースのルーティング             | ⭕️   | ×       | ×     |
| リクエスト数制限（レートリミット）        | ⭕️   |    ⭕️    | ×     |
| OSI層の```L7```のプロトコルを処理可能 | ⭕️   | ×       | ×     |
| Spiffeに対応                | ⭕️   | ×       | ⭕️    |
| 再試行処理                    | ⭕️   |    ⭕️    | ×     |
| タイムアウト                   | ⭕️   |    ⭕️    | ×     |
| サーキットブレイカー               | ⭕️   | ×       | ×     |
| Ingressコントローラー           | ⭕️   | ×       | ×     |
| Egressコントローラー            | ⭕️   | ×       | ×     |

<br>

### Istioを採用する/しない場合の比較

KubernetesとIstioには重複する能力がいくつか（例：サービスディスカバリー）ある。全てのPodの```istio-proxy```コンテナを注入する場合、kube-proxyとServiceによるサービスメッシュは不要になる。ただし、実際の運用場面ではこれを行うことはなく、マイクロサービスコンテナの稼働するPodのみでこれを行えばよい。そのため、```istio-proxy```コンテナを注入しないPodでは、Istioではなく、従来のkube-proxyとServiceによるサービスディスカバリーを使用することになる。

| 能力                              | Istio + Kubernetes + Envoy                                                                                                                                                             | Kubernetes + Envoy                | Kubernetesのみ                                 |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|----------------------------------------------|
| サービスメッシュコントロールプレーン              | Istiodコントロールプレーン                                                                                                                                                                       | go-control-plane                  | なし                                           |
| サービスディスカバリーでのルーティング先設定          | DestinationRule                                                                                                                                                                        | ```route```キー                     | kube-proxy + Service                         |
| サービスディスカバリーでのリスナー設定             | EnvoyFilter + EndpointSlice                                                                                                                                                            | ```listener```キー                  | kube-proxy + Service                         |
| サービスディスカバリーでの追加サービス設定           | ServiceEntry + EndpointSlice                                                                                                                                                           | ```cluster```キー                   | EndpointSlice                                |
| Cluster外ワーカーNodeに対するサービスディスカバリー | WorkloadEntry                                                                                                                                                                          | ```endpoint```キー                  | Egress                                       |
| サービスレジストリ                       | 調査中...                                                                                                                                                                                 | etcd                              | etcd                                         |
| ワーカーNode外からのインバウンド通信のルーティング     | ・VirtualService + Gateway（内部的には、NodePort ServiceまたはLoadBalancer Serviceが作成され、これらはワーカーNode外からのインバウンド通信を待ち受けられるため、Ingressは不要である。）<br>・Ingress + Istio Ingressコントローラー + ClusterIP Service | ```route```キー  + ```listener```キー | Ingress + Ingressコントローラー + ClusterIP Service |


> ℹ️ 参考：
>
> - https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/
> - https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/
> - https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/
> - https://layer5.io/learn/learning-paths/mastering-service-meshes-for-developers/introduction-to-service-meshes/istio/expose-services/


<br>

## 01-02. データプレーン（サイドカープロキシによるサービスメッシュの場合）

### データプレーンとは

サイドカープロキシによるサービスメッシュのデータプレーンは、iptables、 ```istio-init```コンテナ、```istio-proxy```コンテナ、から構成される。

> ℹ️ 参考：https://www.tigera.io/blog/running-istio-on-kubernetes-in-production-part-i/

<br>

### ```istio-init```コンテナ

#### ▼ ```istio-init```コンテナとは

コンテナの起動時に、```istio-iptables```コマンドを実行し、iptablesをPodに適用する。

> ℹ️ 参考：https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process

![istio_istio-init](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-init.png)

<br>

### iptables

#### ▼ ルーティング先制御

iptablesは、Pod内のネットワークのルーティング先をを決める。

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

#### ▼ Pod外からのインバウンド通信の場合

Pod外からのインバウンド通信は、iptablesにより、```istio-proxy```コンテナの```15006```番ポートにリダイレクトされる。```istio-proxy```コンテナはこれを受信し、```localhost:<アプリケーションコンテナのポート番号>```でアプリケーションコンテナにルーティングする。

![istio_iptables_inbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_iptables_inbound.png)

> ℹ️ 参考：
> 
> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process
> - https://jimmysong.io/en/blog/istio-sidecar-traffic-types/#type-1-remote-pod---local-pod

#### ▼ Pod外へのアウトバウンド通信の場合

Pod外へのアウトバウンド通信は、iptablesにより、```istio-proxy```コンテナの```15001```番ポートにリダイレクトされる。

![istio_iptables_outbound_other](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_iptables_outbound_other.png)

> ℹ️ 参考：
> 
> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process
> - https://jimmysong.io/en/blog/istio-sidecar-traffic-types/#type-2-local-pod---remote-pod

#### ▼ 自分自身へのアウトバウンド通信の場合

自分自身（Pod内）へのアウトバウンド通信は、iptablesにより、```istio-proxy```コンテナの```15001```番ポートにリダイレクトされる。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-sidecar-traffic-types/#type-4-local-pod---local-pod

![istio_iptables_outbound_self](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_iptables_outbound_self.png)

<br>

### ```istio-proxy```コンテナ

#### ▼ ```istio-proxy```コンテナとは

![istio_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-proxy.png)

リバースプロキシの能力を持つサイドカーコンテナである。```pilot-agent```プロセス、```envoy```プロセス、が稼働している。```istio-proxy```コンテナは、アプリケーションコンテナのあるPodだけでなく、IngressGatewayのPod内にも存在している。Istioのサービスメッシュ外のネットワークからのインバウンド通信では、IngressGateway内の```istio-proxy```コンテナに登録されたPodの宛先情報に基づいて、ルーティングを実行している。一方で、アプリケーションコンテナを持つPod間の通信では、Pod内の```istio-proxy```コンテナに登録されたものに基づいて、Pod間で直接的に通信している。 仕様上、NginxやApacheを必須とする言語（例：PHP）では、Pod内にリバースプロキシが```2```個ある構成になってしまうことに注意する。

> ℹ️ 参考：
>
> - https://www.amazon.co.jp/dp/B09XN9RDY1
> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process
> - https://jimmysong.io/en/blog/istio-sidecar-traffic-types/

#### ▼ ```pilot-agent```プロセス

```istio-proxy```コンテナにて、Istiodコントロールプレーンにリクエスト（他Podの宛先情報、SSL証明書、など）を定期的に送信する。また、受信したレスポンスに応じて、```envoy```プロセスの設定を変更する。

#### ▼ ```envoy```プロセス

```istio-proxy```コンテナにて、リバースプロキシとして動作する。


<br>

### istio-cniアドオンによる```istio-validation```コンテナ

#### ▼ istio-cniアドオンとは

![istio_istio-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-cni.png)

各ワーカーNode上で、```istio-cni-node```という名前のDaemonSetとして稼働する。```istio-init```コンテナはiptablesをPodに適用する権限を持っている。しかし、iptablesを操作するためにはroot権限が必要になるため、脆弱性が指摘されている。```istio-init```コンテナの代替案として、istio-cniアドオンが提供されている。もしistio-cniアドオンを使用する場合は、```istio-init```コンテナが不要になる代わりとして、```istio-validation```コンテナが必要になる。

> ℹ️ 参考：
>
> - https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/
> - https://www.redhat.com/architect/istio-CNI-plugin
> - https://en.wikipedia.org/wiki/Iptables

#### ▼ ```istio-validation```コンテナ

istio-cniを採用している場合にのみそう挿入されるコンテナ。istio-cniのDaemonSetがiptablesを適用し終わることを待機するために、これが完了したかどうかを検証する。

> ℹ️ 参考：https://istio.io/latest/docs/setup/additional-setup/cni/#race-condition-mitigation

<br>

### コンテナで待ち受けるポート番号

#### ▼ ```15000```番

コンテナの```15000```番ポートでは、Envoyのダッシュボードに対するリクエストを待ち受ける。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#15000

#### ▼ ```15001```番

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

#### ▼ ```15004```番

コンテナの```15004```番ポートでは、コントロールプレーンのコンテナの```8080```番ポートと一緒に使用される。用途がわからず調査中...

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#15004

#### ▼ ```15006```番

```15006```番ポートでは、アプリケーションコンテナへのリクエストを待ち受ける。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

#### ▼ ```15020```番

コンテナの```15020```番ポートでは、データプレーンのデバッグエンドポイントに対するリクエストを待ち受ける。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#15020

#### ▼ ```15021```番

コンテナの```15021```番ポートでは、kubeletからの準備済みチェックを待ち受ける。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

#### ▼ ```15053```番

調査中...

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

#### ▼ ```15090```番

コンテナの```15090```番ポートでは、```istio-proxy```コンテナのメトリクス収集ツールからのリクエストを待ち受け、```envoy```プロセスに渡される。リクエストの内容に応じて、データポイントのレスポンスを返信する。

> ℹ️ 参考：https://jimmysong.io/en/blog/istio-components-and-ports/#ports-in-sidecar

<br>

## 01-03. Isiodコントロールプレーン（サイドカープロキシによるサービスメッシュの場合）

### Isiodコントロールプレーンとは

![istio_control-plane_ports](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_control-plane_ports.png)

サイドカープロキシによるサービスメッシュのIstiodコントロールプレーンは、istiod-serviceを介して、各種ポート番号で```istio-proxy```コンテナからのリクエストを待ち受ける。語尾の『```d```』は、デーモンの意味であるが、Istiodコントロールプレーンの実体は、istiod-deploymentである。

> ℹ️ 参考：
>
> - https://www.amazon.co.jp/dp/B09XN9RDY1
> - https://istio.io/latest/docs/ops/deployment/requirements/#ports-used-by-istio
> - https://istio.io/latest/docs/ops/integrations/prometheus/#configuration

<br>

### コントロールプレーンとその関連コンポーネント

#### ▼ istiod-deployment配下のPod

istiod-deployment配下のPodは、Istiodコントロールプレーンの実体である。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: istiod
    istio.io/rev: <リビジョン番号>
    release: istiod
  name: istiod-<リビジョン番号>
  namespace: istio-system
spec:
  replicas: 2
  selector:
    matchLabels:
      app: istiod
      istio.io/rev: <リビジョン番号>
  strategy:
    rollingUpdate:
      maxSurge: 100%
      maxUnavailable: 25%
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: istiod
        istio.io/rev: <リビジョン番号>
    spec:
      containers:
        - args:
            - discovery
            # 15014番ポートの開放
            - --monitoringAddr=:15014
            - --log_output_level=default:info
            - --domain
            - cluster.local
            - --keepaliveMaxServerConnectionAge
            - 30m
          image: docker.io/istio/pilot:<リビジョン番号>
          imagePullPolicy: IfNotPresent
          name: discovery
          # 待ち受けるポート番号の仕様
          ports:
            # 8080番ポートの開放
            - containerPort: 8080
              protocol: TCP
            # 15010番ポートの開放
            - containerPort: 15010
              protocol: TCP
            # 15017番ポートの開放
            - containerPort: 15017
              protocol: TCP
          env:
            # 15012番ポートの開放
            - name: ISTIOD_ADDR
              value: istiod-<リビジョン番号>.istio-system.svc:15012 # 15012番ポートの開放
              
          ... 
          
# 重要なところ以外を省略しているので、全体像はその都度確認すること。
```

ちなみに、istiod-deployment配下のPodには、HorizontalPodAutoscalerが設定されている。

```yaml
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  labels:
    app: istiod
    istio.io/rev: <リビジョン番号>
    release: istiod
  name: istiod-<リビジョン番号>
  namespace: istio-system
spec:
  maxReplicas: 5
  minReplicas: 2
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: istiod-<リビジョン番号>
  targetCPUUtilizationPercentage: 80
```

#### ▼ istiod-service

```istio-proxy```コンテナからのリクエストを、Istiodコントロールプレーン（istiod-deployment配下のPod）にポートフォワーディングする。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: istiod-<リビジョン番号>
  namespace: istio-system
  labels:
    app: istiod
    istio: pilot
    istio.io/rev: <リビジョン番号>
    release: istiod
spec:
  ports:
    # webhookサーバーに対するリクエストを待ち受ける。
    - name: https-webhook
      port: 443
      protocol: TCP
      targetPort: 15017
    # xDSサーバーに対するリクエストを待ち受ける。
    - name: grpc-xds
      port: 15010
      protocol: TCP
      targetPort: 15010
    # SSL証明書に関するリクエストを待ち受ける。
    - name: https-dns
      port: 15012
      protocol: TCP
      targetPort: 15012
    # メトリクス収集に関するリクエストを待ち受ける。
    - name: http-monitoring
      port: 15014
      protocol: TCP
      targetPort: 15014
  selector:
    # ルーティング先のistiodコントールプレーン（istiod-deployment配下のPod）
    app: istiod
    istio.io/rev: <リビジョン番号>
```

#### ▼ istio-sidecar-injector-configuration

Podの作成/更新時にwebhookサーバーにリクエストを送信できるように、MutatingWebhookConfigurationでMutatingAdmissionWebhookアドオンを設定する。

```yaml
apiVersion: admissionregistration.k8s.io/v1beta1
kind: MutatingWebhookConfiguration
metadata:
  name: istio-sidecar-injector-<リビジョン番号>
  labels:
    app: sidecar-injector
webhooks:
  - name: rev.namespace.sidecar-injector.istio.io
    # mutating-admissionステップ発火条件を登録する。
    rules:
      - apiGroups: [""]
        apiVersions: ["v1"]
        operations: ["CREATE", "UPDATE"]
        resources: ["pods"]
        scope: "*"
    # Webhookの前段にあるServiceの情報を登録する。
    clientConfig:
      service:
        name: istiod-<リビジョン番号>
        namespace: istio-system
        # エンドポイント
        path: "/inject"
        port: 443
      caBundle: Ci0tLS0tQk...
    namespaceSelector:
      matchExpressions:
        - key: istio.io/rev
          operator: In
          values:
            - <リビジョン番号>
```

<br>

### コンテナで待ち受けるポート番号

#### ▼ ```8080```番

コンテナの```8080```番ポートでは、コントロールプレーンのデバッグエンドポイントに対するリクエストを待ち受ける。コンテナの```15014```番ポートにポートフォワーディングしながら、別に``` go tool pprof```コマンドを実行することにより、Istioを実装するパッケージのリソース使用量を可視化できる。

> ℹ️ 参考：https://www.zhaohuabing.com/istio-guide/docs/debug-istio/istio-debug/#%E6%9F%A5%E7%9C%8B-istiod-%E5%86%85%E5%AD%98%E5%8D%A0%E7%94%A8

```bash
# ポートフォワーディングを実行する。
$ kubectl -n istio-system port-forward svc/istiod-<リビジョン番号> 15014

$ go tool pprof -http=:8080 localhost:15014/debug/pprof/heap

Fetching profile over HTTP from http://localhost:15014/debug/pprof/heap
Saved profile in /Users/hiroki-hasegawa/pprof/pprof.pilot-discovery.alloc_objects.alloc_space.inuse_objects.inuse_space.002.pb.gz
Serving web UI on http://localhost:8080

# どのパッケージでどのくらいリソースを消費しているか
$ curl http://localhost:8080/ui/flamegraph?si=alloc_objects
```

#### ▼ ```9876```番

コンテナの```9876```番ポートでは、ControlZダッシュボードに対するリクエストを待ち受ける。ControlZダッシュボードでは、istiodコントロールプレーンの設定値を変更できる。

> ℹ️ 参考：
> 
> - https://istio.io/latest/docs/ops/diagnostic-tools/controlz/
> - https://jimmysong.io/en/blog/istio-components-and-ports/

#### ▼ ```15010```番

![istio_control-plane_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_control-plane_service-discovery.png)

コンテナの```15010```番ポートでは、```istio-proxy```コンテナからのxDSサーバーに対するリクエストを待ち受け、コンテナ内部のプロセスに渡す。リクエストの内容に応じて、他のサービス（Pod、ワーカーNode)の宛先情報を含むレスポンスを返信する。```istio-proxy```コンテナはこれを受信し、```pilot-agent```プロセスが```envoy```プロセスの宛先情報設定を動的に変更する（サービスディスカバリー）。なおIstiodコントロールプレーンは、サービスレジストリに登録された情報や、コンフィグストレージに永続化されたマニフェストの宣言（ServiceEntry、WorkloadEntry）から、他のサービス（Pod、ワーカーNode）の宛先情報を取得する。

> ℹ️ 参考：
>
> - https://faun.pub/how-to-integrate-your-service-registry-with-istio-34f54b058697
> - https://www.kubernetes.org.cn/4208.html

#### ▼ ```15012```番

![istio_control-plane_certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_control-plane_certificate.png)

コンテナの```15012```番ポートでは、マイクロサービス間で相互TLSによるHTTPSプロトコルを使用する場合に、```istio-proxy```コンテナからのSSL証明書に関するリクエストを待ち受け、コンテナ内部のプロセスに渡す。リクエストの内容に応じて、SSL証明書と秘密鍵を含むレスポンスを返信する。```istio-proxy```コンテナはこれを受信し、```pilot-agent```プロセスは```envoy```プロセスにこれらを紐づける。また、SSL証明書の期限が切れれば、```istio-proxy```コンテナからのリクエストに応じて、新しいSSL証明書と秘密鍵を作成する。

> ℹ️ 参考：https://istio.io/latest/docs/concepts/security/#pki

#### ▼ ```15014```番

コンテナの```15014```番ポートでは、Istiodコントロールプレーンのメトリクスを監視するツールからのリクエストを待ち受け、コンテナ内部のプロセスに渡す。リクエストの内容に応じて、データポイントを含むレスポンスを返信する。

```bash
# ポートフォワーディングを実行する。
$ kubectl -n istio-system port-forward svc/istiod-<リビジョン番号> 15014

# デバッグダッシュボードにアクセスする。
$ curl http://127.0.0.1:15014/debug
```

> ℹ️ 参考：
> 
> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#metrics
> - https://www.zhaohuabing.com/istio-guide/docs/debug-istio/istio-debug/#istio-%E8%B0%83%E8%AF%95%E6%8E%A5%E5%8F%A3

#### ▼ ```15017```番

コンテナの```15017```番ポートでは、Istioの```istiod-<リビジョン番号>```というServiceからのポートフォワーディングを待ち受け、コンテナ内部のプロセスに渡す。AdmissionReviewを含むレスポンスを返信する。


<br>

### コンテナ注入の仕組み

#### ▼ 全体像

![istio_container-injection](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_container-injection.png)

#### ▼ クライアント → kube-apiserver

（１）クライアント（```kubectl```コマンド実行者、Kubernetesリソース）が、Pod（Deployment、DaemonSet、StatefulSet、も含む）の作成リクエストを送信する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo-pod
    spec:
      containers:
      - name: foo
        image: foo:1.0.0
        ports:
          - containerPort: 80
```

#### ▼ kube-apiserver → Service + webhookサーバー

（２）kube-apiserverは、認証ステップ、認可ステップ、を実行する。

（３）kube-apiserverは、admission-controllersアドオンを実行する。

（４）kube-apiserverは、admission-controllersアドオンのmutating-admissionステップにて、AdmissionReview構造体のAdmissionRequestにリクエストパラメーターを詰める。

```yaml
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  # AdmissionRequest
  "request": {

    ...

    # 変更されるKubernetesリソースの種類を表す。
    "resource": {
      "group": "apps",
      "version": "v1",
      "resource": "deployments"
    },
    # kube-apiserverの操作の種類を表す。
    "operation": "CREATE",

    # 認証認可された操作の種類を表す。
    "options": {
      "apiVersion": "meta.k8s.io/v1",
      "kind": "CreateOptions"
    },

    ...

  }
}
```

（５）AdmissionReview構造体の```operation```キー値が```CREATE```になっているため、kube-apiserverは、IstioのService（istiod-service）の```/inject```エンドポイント（```443```番ポート）にAdmissionReviewのリクエストを送信する。 発火条件や宛先はMutatingWebhookConfigurationに設定されている

![kubernetes_admission-controllers_admission-review_request](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_admission-review_request.png)

#### ▼ Service + webhookサーバー → kube-apiserver

（６）IstioのServiceはAdmissionReviewを受信する。Serviceは、リクエストをIstiodコントロールプレーン（```15017```番ポート）にポートフォワーディングする。

（７）Istiodコントロールプレーン内のwebhookサーバーは、AdmissionReviewを```/inject```エンドポイントで受信する。

```yaml
# patch処理の例
[

  ...

  {
    "op": "add",
    # spec.initContainers[1] を指定する。
    "path": "/spec/initContainers/1",
    # マニフェストに追加される構造を表す。
    "value": {
        "name": "istio-init",
        "resources": {}
    }
  },
  {
    "op": "add",
    # spec.containers[1] を指定する。
    "path": "/spec/containers/1",
    # マニフェストに追加される構造を表す。
    "value": {
        "name": "istio-proxy",
        "resources": {}
    }
  }
  
  ...
    
]
```

> ℹ️ 参考：
>
> - https://github.com/istio/istio/blob/a19b2ac8af3ad937640f6e29eed74472034de2f5/pkg/kube/inject/webhook.go#L171-L172
> - https://github.com/istio/istio/blob/b3d1566a2af8591d8a74c648108e549c3879d45f/pkg/kube/inject/webhook_test.go#L960-L975
> - https://github.com/istio/istio/blob/1d3fdfd8b7fb81615ad75e6bba6598cb62c97264/pilot/pkg/bootstrap/server.go#L302

（８）webhookサーバーで、コンテナ（```istio-init```コンテナ、```istio-proxy```コンテナ）を注入するpatch処理を定義する。

> ℹ️ 参考：https://github.com/istio/istio/blob/e1f63e8ce82e3bad28c2bb0a87f4bc7ffefac1b9/pkg/kube/inject/webhook.go#L909-L915

```yaml
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  # AdmissionResponse
  "response": {
    "uid": "<value from request.uid>",
    "allowed": true,
    "patchType": "JSONPatch",
    # Patch処理の対象となるKubernetesリソースと処理内容を表す。base64方式でエンコードされている。
    "patch": "W3sib3AiOiAiYWRkIiwgInBhdGgiOiAiL3NwZWMvcmVwbGljYXMiLCAidmFsdWUiOiAzfV0="
  }
}
```

（９）webhookサーバーは、kube-apiserverにAdmissionReviewを返信する。

![kubernetes_admission-controllers_admission-review_response](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_admission-review_response.png)

#### ▼ kube-apiserver → kubelet → コンテナランタイムのデーモン

（１０）kube-apiserverは、AdmissionReviewを受信する。patch処理の定義に基づいて、リクエストの内容を書き換える。

（１１）kube-apiserverは、kubeletにPodの作成をコールする。（実際は、kube-controller、etcd、kube-scheduler、と通信がある）

（１２）kubeletは、コンテナランタイムデーモンを操作し、コンテナ（```app```、```istio-init```、```istio-proxy```）を作成する。

<br>

### サービスディスカバリーの仕組み

#### ▼ 全体像

（１）KubernetesのEndpointSliceに基づいて、Istiodコントロールプレーンは宛先情報をサービスレジストリに動的に登録する。

（２）Pod内の```isti-proxy```コンテナは、Istioコントロールプレーンにリクエストを送信し、レスポンスされたPodの宛先情報を、自身の```envoy```プロセスに登録する。

（３）Pod内のコンテナはアウトバウンド通信を送信する。

（４）アウトバウンド通信は、一度```istio-proxy```コンテナにリダイレクトされる。

（５）Podは、```istio-proxy```コンテナに登録されたPodの宛先情報を使用して、Serviceを介さずに、Podに直接的にアウトバウンド通信を送信する。ちなみに、もしIstioを使用していない場合は、kube-proxyとServiceによるサービスディスカバリーによって、Serviceを介してPodにリクエストを送信する。

> ℹ️ 参考：
>
> - https://medium.com/@bikramgupta/tracing-network-path-in-istio-538335b5bb4f
> - https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/

#### ▼ 確認

（１）```ps```コマンドを使用して、```istio-proxy```コンテナのプロセスのID（PID）を取得する。

```bash
# PIDが出力結果の2行目である。そのため、awkコマンドを使用して、2行目のみを取得している。
$ ps aux | grep envoy | awk '{print $2}'

1234567
2345678
3456789
```

（２）```nsenter```コマンドを使用して、コンテナの稼働するユーザー空間を介し、コンテナに```iptables```コマンドを送信する。Istioによって管理されているChainのルールを取得できる。

```bash
$ nsenter -t <istio-proxyコンテナのPID> -n iptables -L -n -t nat --line-number


Chain PREROUTING (policy ACCEPT)
...


Chain INPUT (policy ACCEPT)
...


Chain OUTPUT (policy ACCEPT)
...


Chain POSTROUTING (policy ACCEPT)
...


# istio-proxyコンテナへのインバウンド通信時に、NAPT処理を実行する。
Chain ISTIO_INBOUND (1 references)
num  target             prot  opt  source     destination
1    RETURN             tcp   --   0.0.0.0/0  0.0.0.0/0    tcp dpt:15008
2    RETURN             tcp   --   0.0.0.0/0  0.0.0.0/0    tcp dpt:15090 # メトリクス収集ツールからのリクエストを待ち受ける。
3    RETURN             tcp   --   0.0.0.0/0  0.0.0.0/0    tcp dpt:15021 # kubeletからの準備済みチェックを待ち受ける。
4    RETURN             tcp   --   0.0.0.0/0  0.0.0.0/0    tcp dpt:15020 # データプレーンのデバッグエンドポイントに対するリクエストを待ち受ける。
5    ISTIO_IN_REDIRECT  tcp   --   0.0.0.0/0  0.0.0.0/0


Chain ISTIO_IN_REDIRECT (3 references)
num  target    prot  opt  source     destination
1    REDIRECT  tcp   --   0.0.0.0/0  0.0.0.0/0    redir ports 15006 #


# istio-proxyコンテナからのアウトバウンド通信時に、NAPT処理を実行する。
Chain ISTIO_OUTPUT (1 references)
num  target             prot  opt  source     destination
1    RETURN             all   --   127.0.0.6  0.0.0.0/0
2    ISTIO_IN_REDIRECT  all   --   0.0.0.0/0  !127.0.0.1   owner UID match 1337
3    RETURN             all   --   0.0.0.0/0  0.0.0.0/0    ! owner UID match 1337
4    RETURN             all   --   0.0.0.0/0  0.0.0.0/0    owner UID match 1337
5    ISTIO_IN_REDIRECT  all   --   0.0.0.0/0  !127.0.0.1   owner GID match 1337
6    RETURN             all   --   0.0.0.0/0  0.0.0.0/0    ! owner GID match 1337
7    RETURN             all   --   0.0.0.0/0  0.0.0.0/0    owner GID match 1337
8    RETURN             all   --   0.0.0.0/0  127.0.0.1
9    ISTIO_REDIRECT     all   --   0.0.0.0/0  0.0.0.0/0


Chain ISTIO_REDIRECT (1 references)
num  target     prot  opt  source     destination
1    REDIRECT   tcp   --   0.0.0.0/0  0.0.0.0/0    redir ports 15001
```

> ℹ️ 参考：
>
> - https://jimmysong.io/en/blog/sidecar-injection-iptables-and-traffic-routing/
> - https://www.mapion.co.jp/news/column/cobs2366068-1-all/
> - https://zenn.dev/tayusa/articles/aa54bbff3d0d2d

<br>

## 02. トラフィック管理

### アウトバウンド通信の監視

> ℹ️ 参考：https://istiobyexample.dev/monitoring-egress-traffic/

| 宛先の種類              | 説明                          |
|--------------------|-----------------------------|
| PassthroughCluster | 明示的に設定された宛先                 |
| BlackHoleCluster   | 設定されていない任意の宛先               |
| 外部のサービス            | KubernetesのClusterの外にあるサービス |

<br>

### Faultインジェクション

#### ▼ Faultインジェクションとは

障害を意図的に注入し、サービスメッシュの動作を検証する。

> ℹ️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/

#### ▼ テストの種類

| テスト名         | 内容                                                                                                                                                    |
| --------------- |-------------------------------------------------------------------------------------------------------------------------------------------------------|
| Delayインジェクション | マイクロサービスに対するインバウンド通信にて、意図的に通信の遅延を発生させる。<br>ℹ️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-delay-fault |
| Abortインジェクション | マイクロサービスに対するインバウンド通信にて、意図的に通信の中止を発生させる。<br>ℹ️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-abort-fault |

<br>


## 03. 通信セキュリティ管理

### SSL証明書

> ℹ️ 参考：https://istio.io/latest/docs/concepts/security/#pki

<br>

### 認証

#### ▼ 仕組み

マイクロサービスアーキテクチャにおける認証にはいくつか種類がある。そのうち、Istioは『分散型』と『ゲートウェイ分散型』の認証を実現することを助ける。

> ℹ️ 参考：https://istio.io/latest/docs/concepts/security/#authentication-architecture

<br>

### 認可

#### ▼ 仕組み

> ℹ️ 参考：https://istio.io/latest/docs/concepts/security/#authorization-architecture

<br>

## 04. 可観測性の管理

### メトリクス

> ℹ️ 参考：https://istio.io/latest/docs/tasks/observability/metrics/

<br>

### ログ

> ℹ️ 参考：https://istio.io/latest/docs/tasks/observability/logs/

<br>

### 分散トレース

#### ▼ メタデータ伝播（分散コンテキスト伝播）

Istioは、分散トレースのためのメタデータを作成するが、これをマイクロサービス間で伝播することはしない。そのため、伝播のための実装が必要になる。

> ℹ️ 参考：
> 
> - https://istio.io/latest/docs/tasks/observability/distributed-tracing/overview/
> - https://github.com/istio/istio/blob/a9f4988c313b7df36f5d1da6b3b87cbe698935ae/samples/bookinfo/src/productpage/productpage.py#L180-L237
> - https://github.com/istio/istio/blob/a9f4988c313b7df36f5d1da6b3b87cbe698935ae/samples/bookinfo/src/details/details.rb#L130-L187

<br>

## 05. マルチサービスメッシュ

### マルチサービスメッシュとは

> ℹ️ 参考：https://istio.io/latest/docs/ops/deployment/deployment-models/#multiple-meshes

### 異なるCluster内コンテナのデータプレーン内管理

#### ▼ 同じプライベートネットワーク内の場合

異なるClusterが同じプライベートネットワーク内に属している場合に、ClusterのコントロールプレーンNode間でデータプレーンを管理し合うことにより、この時、IngressGatewayを使用せずに、異なるClusterのコンテナが直接的に通信できる。

> ℹ️ 参考：https://zenn.dev/kuchima/articles/asm-hybrid-mesh

![istio_multi-service-mesh_cluster_same-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_multi-service-mesh_cluster_same-network.png)

#### ▼ 異なるプライベートネットワーク内の場合

異なるClusterが異なるプライベートネットワーク内に属している場合に、ClusterのコントロールプレーンNode間でデータプレーンを管理し合うことにより、この時、IngressGatewayを経由して、異なるClusterのコンテナが間接的に通信できる。

> ℹ️ 参考：https://zenn.dev/kuchima/articles/asm-hybrid-mesh

![istio_multi-service-mesh_cluster_difficult-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_multi-service-mesh_cluster_difficult-network.png)

<br>

### 仮想サーバー内コンテナのデータプレーン内管理

#### ▼ 同じプライベートネットワーク内の場合

仮想サーバーがコントロールプレーンNodeと同じプライベートネットワーク内に属している場合に、この仮想サーバーに```istio-proxy```コンテナを注入することにより、データプレーン内で仮想サーバーを管理できるようになる。この時、IngressGatewayを使用せずに、Kubernetes上のコンテナと仮想サーバー上のコンテナが直接的に通信できる。

> ℹ️ 参考：https://istio.io/latest/docs/ops/deployment/vm-architecture/

![istio_multi-service-mesh_vm_same-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_multi-service-mesh_vm_same-network.png)

#### ▼ 異なるプライベートネットワーク内の場合

仮想サーバーがコントロールプレーンNodeと異なるプライベートネットワーク内に属している場合に、この仮想サーバーに```istio-proxy```コンテナを注入することにより、データプレーン内で管理できるようになる。この時、IngressGatewayを経由して、Kubernetes上のコンテナと仮想サーバー上のコンテナが間接的に通信できる。

![istio_multi-service-mesh_vm_difficult-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_multi-service-mesh_vm_difficult-network.png)

<br>
