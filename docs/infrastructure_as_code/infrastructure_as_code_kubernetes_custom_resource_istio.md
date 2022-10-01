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

#### ▼ サイドカープロキシによるサービスメッシュ

![istio_sidecar-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_sidecar-mesh_architecture.png)

サイドカープロキシによるサービスメッシュは、データプレーン、Isiodコントロールプレーン、から構成される。サイドカープロキシを使用して、サービスメッシュを実装する。サイドカーは、```L4```（トランスポート層）と```L7```（アプリケーション層）に関する責務を持つ。ただ必ずしも、Istioリソースを使用する必要はなく、代わりとして、KubernetesやOpenShiftに内蔵されたIstioに相当するオプションを使用しても良い。

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/ops/deployment/architecture/
> - https://techblog.zozo.com/entry/zozotown-istio-production-ready
> - https://www.amazon.co.jp/dp/B09XN9RDY1

#### ▼ アンビエントメッシュ

![istio_ambient-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_ambient-mesh_architecture.png)

アンビエントメッシュは、データプレーン、コントロールプレーンNode、から構成される。Node内の単一プロキシを使用して、サービスメッシュを実装する。ztunnel（実体はDamonSet配下のPod）が```L4```（トランスポート層）、waypoint-proxy（実体はDeployment配下のPod）が```L7```（アプリケーション層）に関する責務を持つ。Node外からのインバウンド通信、またNode外へのアウトバウンド通信は、ztunnelのPodを経由して、一度waypoint-proxyのPodにリダイレクトされる。ztunnelのPodを経由した段階でHTTPSプロトコルになる。リソース消費量の少ない```L4```と多い```L7```の責務が分離されているため、サイドカープロキシによるサービスメッシュと比較して、```L4```のみを使用する場合に、ワーカーNodeのリソース消費量を節約できる。サイドカープロキシによるサービスメッシュを将来的に廃止するということはなく、好きな方を選べるようにするらしい。

インバウンド時の経路は以下の通りである。

```
外
↓
ワーカーNode入口
↓
ztunnelのPod（L4）
↓
…
↓
waypointのPod（L7）
↓
Pod
↓
マイクロサービスコンテナ
```

アウトバウンド時の経路は以下の通りである。

```
外
↑
ワーカーNode出口
↑
waypointのPod（L7）
↑
ztunnelのPod（L4）
↑
Pod
↑
マイクロサービスコンテナ
```

> ℹ️ 参考：
>
> - https://istio.io/latest/blog/2022/introducing-ambient-mesh/
> - https://istio.io/latest/blog/2022/get-started-ambient/#install-istio-with-ambient-mode
> - https://github.com/istio/istio/blob/experimental-ambient/manifests/charts/istio-control/istio-discovery/files/waypoint.yaml

<br>

### 他のOSSツールとの比較

> ℹ️ 参考：https://www.amazon.co.jp/dp/1492043788

| 能力（2022/08/21時点）      | Istio | Linkerd | Consul |
|------------------------|:-----:|:--------:|:------:|
| 能力の豊富さ                 | ⭕️   | △       | △     |
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

### Istioを採用する/しない場合の比較

KubernetesとIstioには重複する能力がいくつか（例：サービスディスカバリー）ある。全てのPodの```istio-proxy```コンテナを注入する場合、kube-proxyとServiceによるサービスメッシュは不要になる。ただし、実際の運用場面ではこれを行うことはなく、マイクロサービスコンテナの稼働するPodのみでこれを行えばよい。そのため、```istio-proxy```コンテナを注入しないPodでは、Istioではなく、従来のkube-proxyとServiceによるサービスディスカバリーを使用することになる。

> ℹ️ 参考：
>
> - https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/
> - https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/
> - https://github.com/envoyproxy/go-control-plane
> - https://istiobyexample-ja.github.io/istiobyexample/ingress/

| 能力                              | Istio + Kubernetes + Envoy | Kubernetes + Envoy                | Kubernetesのみ             |
|---------------------------------|------------------------|-----------------------------------|--------------------------|
| サービスメッシュコントロールプレーン              | Istiodコントロールプレーン       | go-control-plane                  | なし                       |
| サービスディスカバリーでのルーティング先設定          | DestinationRule | ```route```キー                     | kube-proxy + Service     |
| サービスディスカバリーでのリスナー設定             | EnvoyFilter + EndpointSlice  | ```listener```キー                  | kube-proxy + Service     |
| サービスディスカバリーでの追加サービス設定           | ServiceEntry + EndpointSlice | ```cluster```キー                   | EndpointSlice            |
| Cluster外ワーカーNodeに対するサービスディスカバリー | WorkloadEntry | ```endpoint```キー                  | Egress                   |
| サービスレジストリ                       | 調査中...                 | etcd                              | etcd                     |
| Node外からのインバウンド通信のルーティング         | VirtualService + Gateway | ```route```キー  + ```listener```キー | Ingress + Ingressコントローラー |


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

リバースプロキシの能力を持つサイドカーコンテナである。```pilot-agent```プロセス、```envoy```プロセス、が稼働している。仕様上、NginxやApacheを必須とする言語（例：PHP）では、Pod内にリバースプロキシが```2```個ある構成になってしまうことに注意する。

> ℹ️ 参考：
>
> - https://www.amazon.co.jp/dp/B09XN9RDY1
> - https://www.sobyte.net/post/2022-07/istio-sidecar-proxy/#sidecar-traffic-interception-basic-process

#### ▼ ```pilot-agent```プロセス

```istio-proxy```コンテナにて、Istiodコントロールプレーンにリクエスト（他Podの宛先情報、SSL証明書、など）を定期的に送信する。また、受信したレスポンスに応じて、```envoy```プロセスの設定を変更する。

#### ▼ ```envoy```プロセス

```istio-proxy```コンテナにて、リバースプロキシとして動作する。

<br>

### istio-cniアドオンによる```istio-validation```コンテナ

#### ▼ istio-cniアドオンとは

![istio_istio-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_istio-cni.png)

各ワーカーNode上で、```istio-cni-node```という名前のDaemonSetとして稼働する。```istio-init```コンテナはiptablesをPodに適用する権限を持っている。しかし、これは最小権限ではなく、脆弱性が指摘されている。```istio-init```コンテナの代替案として、istio-cniアドオンが提供されている。もしistio-cniアドオンを使用する場合は、```istio-init```コンテナが不要になる代わりとして、```istio-validation```コンテナが必要になる。

> ℹ️ 参考：
>
> - https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/
> - https://www.redhat.com/architect/istio-CNI-plugin

#### ▼ ```istio-validation```コンテナ

istio-cniを採用している場合にのみそう挿入されるコンテナ。istio-cniのDaemonSetがiptablesを適用し終わることを待機するために、これが完了したかどうかを検証する。

> ℹ️ 参考：https://istio.io/latest/docs/setup/additional-setup/cni/#race-condition-mitigation

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

Podの作成/更新時にwebhookサーバーにリクエストを送信できるように、MutatingAdmissionWebhookアドオンを設定する。

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
        path: "/inject" # エンドポイント
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

### 待ち受けるポート番号

#### ▼ ```8080```番

```8080```番ポートでは、サービスメッシュのデバッグエンドポイントに対するリクエストを待ち受ける。

#### ▼ ```15010```番

![istio_control-plane_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_control-plane_service-discovery.png)

```15010```番ポートでは、```istio-proxy```コンテナからのxDSサーバーに対するリクエストを待ち受け、他のサービス（Pod、ワーカーNode)の宛先情報を含むレスポンスを返信する。```istio-proxy```コンテナはこれを受信し、```pilot-agent```プロセスが```envoy```プロセスの宛先情報設定を動的に変更する（サービスディスカバリー）。なおIstiodコントロールプレーンは、サービスレジストリに登録された情報や、コンフィグストレージに永続化されたマニフェストファイルの宣言（ServiceEntry、WorkloadEntry）から、他のサービス（Pod、ワーカーNode）の宛先情報を取得する。

> ℹ️ 参考：
>
> - https://faun.pub/how-to-integrate-your-service-registry-with-istio-34f54b058697
> - https://www.kubernetes.org.cn/4208.html

#### ▼ ```15012```番

![istio_control-plane_certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_control-plane_certificate.png)

```15012```番ポートでは、マイクロサービス間で相互TLSによるHTTPSプロトコルを使用する場合に、```istio-proxy```コンテナからのSSL証明書に関するリクエストを待ち受け、SSL証明書と秘密鍵を含むレスポンスを返信する。```istio-proxy```コンテナはこれを受信し、```pilot-agent```プロセスは```envoy```プロセスにこれらを紐づける。また、SSL証明書の期限が切れれば、```istio-proxy```コンテナからのリクエストに応じて、新しいSSL証明書と秘密鍵を作成する。

> ℹ️ 参考：https://istio.io/latest/docs/concepts/security/#pki

#### ▼ ```15014```番

```15014```番ポートでは、Istiodコントロールプレーンのメトリクスを監視するツールからのリクエストを待ち受け、データポイントを含むレスポンスを返信する。

> ℹ️ 参考：https://istio.io/latest/docs/reference/commands/pilot-discovery/#metrics

#### ▼ ```15017```番

```15017```番ポートでは、Istioの```istiod-<リビジョン番号>```というServiceからのポートフォワーディングを待ち受け、AdmissionReviewを含むレスポンスを返信する。


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

    # 〜 中略 〜

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

    # 〜 中略 〜

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

  # 〜 中略 〜

  {
    "op": "add",
    # spec.initContainers[1] を指定する。
    "path": "/spec/initContainers/1",
    # マニフェストファイルに追加される構造を表す。
    "value": {
        "name": "istio-init",
        "resources": {}
    }
  },
  {
    "op": "add",
    # spec.containers[1] を指定する。
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

（１）KubernetesのEndpointSliceに基づいて、Istiodコントロールプレーンは宛先情報をサービスレジストリに動的に登録する。

（２）Pod内の```isti-proxy```コンテナは、Istioコントロールプレーンにリクエストを送信し、レスポンスされたPodの宛先情報を、自身の```envoy```プロセスに登録する。

（３）Pod内のコンテナはアウトバウンド通信を送信する。

（４）アウトバウンド通信は、一度```istio-proxy```コンテナにリダイレクトされる。

（５）Podは、```istio-proxy```コンテナに登録されたPodの宛先情報を使用して、Serviceを介さずに、Podに直接的にアウトバウンド通信を送信する。ちなみに、もしIstioを使用していない場合は、kube-proxyとServiceによるサービスディスカバリーによって、Serviceを介してPodにリクエストを送信する。

> ℹ️ 参考：
>
> - https://medium.com/@bikramgupta/tracing-network-path-in-istio-538335b5bb4f
> - https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/

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
| ---------------- |-------------------------------------------------------------------------------------------------------------------------------------------------------|
| Deplayインジェクション | マイクロサービスに対するインバウンド通信にて、意図的に通信の遅延を発生させる。<br>ℹ️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-delay-fault |
| Abortインジェクション  | マイクロサービスに対するインバウンド通信にて、意図的に通信の中止を発生させる。<br>ℹ️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-abort-fault |

<br>

### サーキットブレイカー

#### ▼ サーキットブレイカーとは

マイクロサービス間に設置され、他のマイクロサービスに連鎖的に起こる障害（カスケード障害）を吸収する仕組みのこと。爆発半径を最小限にできる。下流マイクロサービスに障害が発生した時に、上流マイクロサービスにエラーを返してしまわないよう、一旦マイクロサービスへのルーティングを停止し、直近の成功時の処理結果を返信する。

> ℹ️ 参考：https://digitalvarys.com/what-is-circuit-breaker-design-pattern/

![circuit-breaker](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/circuit-breaker.png)

<br>

## 03. セキュリティ

### 認証

マイクロサービスアーキテクチャにおける認証にはいくつか種類がある。そのうち、Istioは『分散型』と『ゲートウェイ分散型』の認証を実現することを助ける。

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/concepts/security/#authentication-architecture
> - https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_architecture_backend_microservices.html

<br>

### 認可

> ℹ️ 参考：https://istio.io/latest/docs/concepts/security/#authorization

<br>


## 04. マルチサービスメッシュ

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
