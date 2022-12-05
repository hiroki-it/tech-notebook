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

### サイドカープロキシメッシュのアーキテクチャ

![istio_sidecar-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_sidecar-mesh_architecture.png)

サイドカープロキシメッシュは、データプレーン、Isiodコントロールプレーン、から構成される。サイドカープロキシを使用して、サービスメッシュを実装する。サイドカーは、```L4```（トランスポート層）のプロトコル（例：TCP、UDP、など）と```L7```（アプリケーション層）のプロトコル（例：HTTP、HTTPS、など）を処理する責務を持つ。ただ必ずしも、Istioリソースを使用する必要はなく、代わりとして、KubernetesやOpenShiftに内蔵されたIstioに相当するオプションを使用しても良い。

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/ops/deployment/architecture/
> - https://techblog.zozo.com/entry/zozotown-istio-production-ready
> - https://www.amazon.co.jp/dp/B09XN9RDY1

<br>

### アンビエントメッシュのアーキテクチャ

![istio_ambient-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_ambient-mesh_architecture.png)

アンビエントメッシュは、データプレーン、コントロールプレーンNode、から構成される。Node内の単一プロキシを使用して、サービスメッシュを実装する。ztunnel（実体はDaemonSet配下のPod）が```L4```（トランスポート層）のプロトコル（例：TCP、UDP、など）、またwaypoint-proxy（実体はDeployment配下のPod）が```L7```（アプリケーション層）のプロトコル（例：HTTP、HTTPS、など）を処理する責務を持つ。Node外からのインバウンド通信、またNode外へのアウトバウンド通信は、ztunnelのPodを経由して、一度waypoint-proxyのPodにリダイレクトされる。ztunnelのPodを経由した段階でHTTPSプロトコルになる。リソース消費量の少ない```L4```と多い```L7```のプロコトルの処理の責務が分離されているため、サイドカープロキシメッシュと比較して、```L4```のプロトコルのみを処理する場合に、ワーカーNodeのリソース消費量を節約できる。サイドカープロキシメッシュを将来的に廃止するということはなく、好きな方を選べるようにするらしい。

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

<br>

### デザインパターンの比較

| 項目          | サイドカープロキシメッシュ                                                            | アンビエントメッシュ |
|---------------|--------------------------------------------------------------------------|------------|
| Istioのアップグレード | サイドカーの再作成時に障害が起こる可能性がある。対策としては、Istioのカナリアリリース方式アップグレードがある。 |            |
| リソースの消費量   | サイドカーを各Podに注入することになるため、Pod全体としての合計のリソース消費量が多くなる。              |            |


<br>

## 01-02. Istioを採用するのか否か

### 他のサービスメッシュツールとの比較

> ℹ️ 参考：https://www.amazon.co.jp/dp/1492043788

| 能力（執筆時点2022/08/21）            | Istio | Linkerd | Consul |
|-------------------------------------|:-----:|:-------:|:------:|
| 能力の豊富さ                          |  ⭕️   |    △    |   △    |
| 異なるClusterのデータプレーン内管理           |  ⭕️   |    ×    |   ⭕️   |
| 仮想サーバーのデータプレーン内管理              |  ⭕️   |    ×    |   ⭕️   |
| ダッシュボード                             |   ×   |   ⭕️    |   ⭕️   |
| サービスディスカバリー                         |  ⭕️   |   ⭕️    |   ⭕️   |
| メトリクス収集                           |  ⭕️   |   ⭕️    |   ×    |
| 分散トレース収集                        |  ⭕️   |    ×    |   ⭕️   |
| 相互TLS                             |  ⭕️   |   ⭕️    |   ⭕️   |
| ポリシーベースのACL                         |  ⭕️   |    ×    |   ×    |
| 意図ベースのACL                         |   ×   |    ×    |   ⭕️   |
| SSL証明書管理                       |  ⭕️   |    ×    |   ⭕️   |
| HTTP/1.2、HTTP/2.0、gRPC              |  ⭕️   |   ⭕️    |   ×    |
| TCP                                 |  ⭕️   |   ⭕️    |   ⭕️   |
| カスタムリソース                            |  ⭕️   |   ⭕️    |   ×    |
| サイドカーインジェクション                       |  ⭕️   |   ⭕️    |   ⭕️   |
| ブルー/グリーンデプロイメント                     |  ⭕️   |    ×    |   ×    |
| カナリアリリース                            |  ⭕️   |   ⭕️    |   ×    |
| 属性ベースのルーティング                      |  ⭕️   |    ×    |   ×    |
| リクエスト数制限（レートリミット）                |  ⭕️   |   ⭕️    |   ×    |
| ```L7```（アプリケーション層）のプロトコルを処理可能 |  ⭕️   |    ×    |   ×    |
| Spiffeに対応                         |  ⭕️   |    ×    |   ⭕️   |
| 再試行処理                          |  ⭕️   |   ⭕️    |   ×    |
| タイムアウト                              |  ⭕️   |   ⭕️    |   ×    |
| サーキットブレイカー                          |  ⭕️   |    ×    |   ×    |
| Ingressコントローラー                      |  ⭕️   |    ×    |   ×    |
| Egressコントローラー                       |  ⭕️   |    ×    |   ×    |

### Istio、Kubernetes、の同じ機能の比較

KubernetesとIstioには重複する能力がいくつか（例：サービスディスカバリー）ある。全てのPodの```istio-proxy```コンテナを注入する場合、kube-proxyとServiceによるサービスメッシュは不要になる。ただし、実際の運用場面ではこれを行うことはなく、マイクロサービスコンテナの稼働するPodのみでこれを行えばよい。そのため、```istio-proxy```コンテナを注入しないPodでは、Istioではなく、従来のkube-proxyとServiceによるサービスディスカバリーを使用することになる。

| 能力                              | Istio + Kubernetes + Envoy                                                                                                                                                                         | Kubernetes + Envoy                | Kubernetesのみ                                 |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|----------------------------------------------|
| サービスメッシュコントロールプレーン                | Istiodコントロールプレーン                                                                                                                                                                                   | go-control-plane                  | なし                                           |
| サービスディスカバリーでのルーティング先設定         | DestinationRule                                                                                                                                                                                    | ```route```キー                     | kube-proxy + Service                         |
| サービスディスカバリーでのリスナー値               | EnvoyFilter + EndpointSlice                                                                                                                                                                        | ```listener```キー                  | kube-proxy + Service                         |
| サービスディスカバリーでの追加サービス設定         | ServiceEntry + EndpointSlice                                                                                                                                                                       | ```cluster```キー                   | EndpointSlice                                |
| Cluster外ワーカーNodeに対するサービスディスカバリー | WorkloadEntry                                                                                                                                                                                      | ```endpoint```キー                  | Egress                                       |
| サービスレジストリ                         | etcd                                                                                                                                                                                               | etcd                              | etcd                                         |
| ワーカーNode外からのインバウンド通信のルーティング    | ・VirtualService + Gateway（内部的には、NodePort ServiceまたはLoadBalancer Serviceが作成され、これらはワーカーNode外からのインバウンド通信を待ち受けられるため、Ingressは不要である。）<br>・Ingress + Istio Ingressコントローラー + ClusterIP Service | ```route```キー  + ```listener```キー | Ingress + Ingressコントローラー + ClusterIP Service |


> ℹ️ 参考：
>
> - https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/
> - https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/
> - https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/
> - https://layer5.io/learn/learning-paths/mastering-service-meshes-for-developers/introduction-to-service-meshes/istio/expose-services/

### Istioのメリット/デメリット

#### ▼ メリット

![service-discovery_kubernetes_vs_istio](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service-discovery_kubernetes_vs_istio.png)

| 項目                | Kubernetesのみを使用する場合                                                                                                                                                | Istioを使用する場合                                                                                                                                                        |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| サービスディスカバリー         | KubernetesのServiceとkube-proxyによるIPアドレスとポート番号の検出に加えて、CoreDNSによる名前解決を使用する。                                                                                    | Istiodコントロールプレーンと```istio-proxy```コンテナは、サービスディスカバリーを実施する。サービスディスカバリーに必要な要素を一括でセットアップできるが、CoreDNSのセットアップは難しくないため、サービスディスカバリー単体ではメリットは少ないかもしれない。              |
| ロードバランシング           | KubernetesのServiceとkube-proxyを使用する。なお、Serviceとkube-proxyは、同じバージョンのPodにしかロードバランシングできず、もし異なるバージョンを対象にしたい場合、異なるServiceを作成する必要がある。```L4```ロードバランサーとして使用できる。 | Istiodコントロールプレーンと```istio-proxy```コンテナは、ロードバランシングを実施する。```L4```/```L7```のロードバランサーとして使用できる。また、異なるバージョンのPodにさまざまな手法（例：カナリア方式、トラフィックミラーリング方式、など）でロードバランシングできる。 |
| サーキットブレイカー          | Kubernetesには機能がない。                                                                                                                                                   | ```istio-proxy```コンテナは、サーキットブレイカーを実施できる。                                                                                                                              |
| 証明書              | Podの作成に応じて、証明書のKubernetesリソース（Certificate、CertificateSigningRequest、など）を作成する。                                                                                  | Istiodコントロールプレーンと```istio-proxy```コンテナは、Podの作成に応じて、証明書を自動的に設定できる。                                                                                            |
| メトリクスと分散トレースの収集 | メトリクスと分散トレースの収集ツールを個別にセットアップする。                                                                                                                                  | メトリクスと分散トレースの収集ツールを一括してセットアップできる。                                                                                                                                 |


> ℹ️ 参考：
>
> - https://blog.container-solutions.com/wtf-is-istio
> - https://www.containiq.com/post/kubernetes-service-mesh
> - https://jimmysong.io/en/blog/why-do-you-need-istio-when-you-already-have-kubernetes/#shortcomings-of-kube-proxy
> - https://www.zhaohuabing.com/post/2019-04-16-how-to-choose-ingress-for-service-mesh-english/
> - https://www.baeldung.com/cs/service-discovery-microservices

#### ▼ デメリット

| 項目                 | 説明                                                                                                                                                      |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Nodeのリソース消費量の増加 | IstioのPod間通信では、Kubernetesと比べて、通信に必要なコンポーネント（例：Istiodコントロールプレーン、```istio-proxy```コンテナ）が増える。そのため、Nodeのリソース消費量が増え、また宛先Podからのレスポンス速度が低くなる。 |
| 学習コストの増加         | Istioが多機能であり、学習コストが増加する。                                                                                                                           |

> ℹ️ 参考：
> 
> - https://arxiv.org/pdf/2004.00372.pdf
> - https://www.containiq.com/post/kubernetes-service-mesh

<br>

## 02. サイドカープロキシメッシュの場合

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

（１）Kubernetesは、EndpointSliceに基づいて、Podの宛先情報をサービスレジストリ（ここでは、kube-apiserverを介したetcd）に動的に登録する。

（２）Pod内の```isti-proxy```コンテナは、起動時に、Istioコントロールプレーンとの間でリモートプロシージャーコールを双方向で実行する。取得したPodの宛先情報を、自身のEnvoyに登録する。

（３）Pod内のアプリケーションコンテナは、Podの宛先情報を指定して、アウトバウンド通信を送信する。

（４）アウトバウンド通信は、一度```istio-proxy```コンテナにリダイレクトされる。

（５）```istio-proxy```コンテナは、Podの宛先情報を使用して、実際のServiceを介さずに、Podに直接的にアウトバウンド通信を送信する（```istio-proxy```コンテナ自体がServiceのように働く）。ちなみに、もしIstioを使用していない場合は、kube-proxyとServiceによるサービスディスカバリーによって、Serviceを介してPodにリクエストを送信する。

（６）Pod内の```isti-proxy```コンテナは、定期的に、Istioコントロールプレーンとの間でリモートプロシージャーコールを双方向で実行する。取得したPodの宛先情報を、自身のEnvoyに登録する。

> ℹ️ 参考：
>
> - https://medium.com/@bikramgupta/tracing-network-path-in-istio-538335b5bb4f
> - https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/
> - https://www.toptal.com/kubernetes/service-mesh-comparison
> - http://blog.yanick.site/2021/02/07/networking/istio/feature/dns-agent/
> - https://medium.com/namely-labs/a-crash-course-for-running-istio-1c6125930715

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


<br>


## 02. トラフィック管理

### アウトバウンド通信の監視

> ℹ️ 参考：https://istiobyexample.dev/monitoring-egress-traffic/

| 宛先の種類          | 説明                         |
|--------------------|-----------------------------|
| PassthroughCluster | 明示的に設定された宛先           |
| BlackHoleCluster   | 設定されていない任意の宛先          |
| 外部のサービス          | KubernetesのClusterの外にあるサービス |

<br>

### Faultインジェクション

#### ▼ Faultインジェクションとは

障害を意図的に注入し、サービスメッシュの動作を検証する。

> ℹ️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/

#### ▼ テストの種類

| テスト名         | 内容                                                                                                                                                                |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Delayインジェクション | マイクロサービスに対するインバウンド通信にて、意図的に通信の遅延を発生させる。<br>ℹ️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-delay-fault |
| Abortインジェクション | マイクロサービスに対するインバウンド通信にて、意図的に通信の中止を発生させる。<br>ℹ️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-abort-fault |

<br>


## 03. 認証/認可の管理

### 認証

#### ▼ 仕組み

マイクロサービスアーキテクチャにおける認証にはいくつか種類がある。そのうち、Istioは『分散型』と『ゲートウェイ分散型』の認証を実装する。

> ℹ️ 参考：https://istio.io/latest/docs/concepts/security/#authentication-architecture

<br>

### 認可

#### ▼ 仕組み

> ℹ️ 参考：https://istio.io/latest/docs/concepts/security/#authorization-architecture

<br>

## 04. SSL証明書の管理

### 中間認証局

#### ▼ Istiod

デフォルトでは、Istiodが中間認証局として働く。Istiodは、SSL証明書を必要とするKubernetesリソースに証明書を提供する。

#### ▼ 外部の中間認証局

Istiodを使用する代わりに、外部の中間認証局を使用して、SSL証明書を必要とするKubernetesリソースに証明書を提供する。

- cert-manager
- カスタムコントローラー

<br>

## 05. 可観測性の管理

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

## 06. マルチサービスメッシュ

### マルチサービスメッシュとは

> ℹ️ 参考：https://istio.io/latest/docs/ops/deployment/deployment-models/#multiple-meshes

<br>

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
