---
title: 【IT技術の知見】コントロールプレーンコンポーネント＠Kubernetes
description: コントロールプレーンコンポーネント＠Kubernetesの知見を記録しています。
---

# コントロールプレーンコンポーネント＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. コントロールプレーンコンポーネントとは

『マスターコンポーネント』ともいう。

コントロールプレーンNode上で稼働するコンポーネントのこと。

コントロールプレーンコンポーネントは、Cluster内のワーカーNode自体と、ワーカーNode内のPodを管理する。

これは、コントロールプレーンNode上でデーモンとして直接的に常駐させる場合と、DeploymentやDaemonSetでコピーされたPod内でコンテナとして常駐させる場合がある。

> - https://kubernetes.io/docs/concepts/overview/components/#control-plane-components
> - https://cstoku.dev/posts/2018/k8sdojo-24/
> - https://kubernetes.io/docs/concepts/overview/components/
> - https://thinkit.co.jp/article/17453

<br>

## 02. コントロールプレーンNode

### コントロールプレーンNode (kubernetesマスター) とは

kubernetesマスターともいう。コントロールプレーンコンポーネントが稼働する。

kube-apiserverクライアント (`kubectl`クライアント、Kubernetesリソース) がKubernetesリソースを操作しようとリクエストを送信すると、まず最初に、コントロールプレーンNode上のkube-apiserverがリクエストを受信する。

> - https://kubernetes.io/docs/concepts/#kubernetes%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC
> - https://medium.com/easyread/step-by-step-introduction-to-basic-concept-of-kubernetes-e20383bdd118
> - https://qiita.com/baby-degu/items/ce26507bd954621d6dc5

### クライアント

kube-apiserverクライアント (`kubectl`クライアント、Kubernetesリソース) は、kube-apiserverにリクエストを送信し、Kubernetesリソースを操作する。

> - https://github.com/kubernetes/design-proposals-archive/blob/main/architecture/resource-management.md

<br>

### コントロールプレーンNodeで待ち受けるポート番号

コントロールプレーンコンポーネントのために、コントロールプレーンNodeがパケットを待ち受けるデフォルトのポート番号は、以下の通りである。

> - https://kubernetes.io/docs/reference/ports-and-protocols/#control-plane

<br>

### Controller

コントロールプレーンNodeではさまざまなControllerが稼働している。

Controllerは、マニフェストで宣言されたKubernetesリソースと同じ実体を作成し、状態を維持する。

> - https://github.com/kubernetes/design-proposals-archive/blob/main/architecture/resource-management.md

<br>

### 高可用性構成

#### ▼ 高可用性構成とは

![control-plane-node_ha-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/control-plane-node_ha-architecture.png)

コントロールプレーンNodeの可用性を高める方法には、デザインパターンがある。

補足として、仮想IPアドレスを管理するkeepalivedと、リクエストを受信して負荷分散するHAProxyを組み合わせ、`L7`ロードバランサーとして使用する多い。

> - https://biscuit.ninja/posts/creating-a-kubernetes-cluster-using-keepalived-and-haproxy-with-ansible/
> - https://blog.adachin.me/archives/3048
> - https://www.opensourcetech.tokyo/entry/20200805/1596611637

#### ▼ Stacked-etcd-topologyパターン

各コントロールプレーンNode内にetcdのストレージを配置するデザインパターン。

> - https://www.techscore.com/blog/2019/03/28/raft-consensus-algorithm/

#### ▼ External-etcd-topologyパターン

各コントロールプレーンNode外にetcdのストレージを配置するデザインパターン。

> - https://www.techscore.com/blog/2019/03/28/raft-consensus-algorithm/

<br>

## 03. cloud-controller-manager

### cloud-controller-managerとは

クラウドインフラを操作するcloud-controllerを一括で管理する。

cloud-controllerを使用して、kube-apiserverがクラウドインフラを操作できるようにする。

![kubernetes_cloud-controller-manager](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cloud-controller-manager.png)

<br>

### AWS EKSの場合

AWS EKSの場合、LoadBalancer Serviceを作成すると、AWS EKS内のcloud-controller-managerがAWS CLBを自動的にプロビジョニングする。

もしAWS ALBやAWS NLBを作成したい場合、AWS Load Balancer Controllerが必要である。

<br>

## 04. etcd (エトセディー)

### etcdとは

![kubernetes_etcd](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_etcd.png)

Cluster内のKubernetesリソースの設定値をキーバリュー型で永続化し、またサービスレジストリとして働く。

語尾の『`d`』は、分散 (distribution) の意味である。リクエストを受信したkube-apiserverは、etcdからKubernetesリソースの情報を参照する。

Kubernetesに標準で組み込まれているが、別のOSSである。

デフォルトでは、コントロールプレーンNodeで直接的に稼働させる場合でも、あるいはPod内で稼働させる場合でも、`/var/lib/etcd`ディレクトリをローカルストレージとする。

> - https://thinkit.co.jp/article/17453
> - https://uzimihsr.github.io/post/2019-11-25-kubernetes-components/
> - https://blog.devgenius.io/implementing-service-discovery-for-microservices-df737e012bc2

<br>

### セットアップ

#### ▼ 起動コマンド

```bash
$ etcd \
    --advertise-client-urls=https://*.*.*.*:2379 \
    `# HTTPSリクエストを受信するためのSSL証明書` \
    --cert-file=/etc/kubernetes/pki/etcd/server.crt \
    `# HTTPSリクエストを送信するためのクライアント証明書` \
    --client-cert-auth=true \
    `# マニフェストを保管するローカルストレージ` \
    --data-dir=/var/lib/etcd \
    --initial-advertise-peer-urls=https://*.*.*.*:2380 \
    --initial-cluster=foo-node=https://*.*.*.*:2380 \
    `# SSL証明書とペアになる秘密鍵` \
    --key-file=/etc/kubernetes/pki/etcd/server.key \
    --listen-client-urls=https://127.0.0.1:2379,https://*.*.*.*:2379 \
    --listen-metrics-urls=http://127.0.0.1:2381 \
    --listen-peer-urls=https://*.*.*.*:2380 \
    `# etcdが稼働するコントロールプレーンNode` \
    --name=foo-node \
    --peer-cert-file=/etc/kubernetes/pki/etcd/peer.crt \
    --peer-client-cert-auth=true \
    --peer-key-file=/etc/kubernetes/pki/etcd/peer.key \
    --peer-trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt \
    --snapshot-count=10000 \
    --trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt
```

<br>

## 05. kube-apiserver

### kube-apiserverとは

![kubernetes_kube-apiserver](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_kube-apiserver.png)

クライアントにコントロールプレーンNodeを公開する。

クライアントがリクエストを送信すると、コントロールプレーンNode上のkube-apiserverがコールされ、他のコンポーネントとHTTPプロトコルでパケットを送受信する。

存在しないリソース定義をリクエストされると、kube-apiserverはリソース定義を見つけられず、以下のエラーレスポンスを返信する。

```bash
the server could not find the requested resource
```

> - https://thinkit.co.jp/article/17453
> - https://vamdemicsystem.black/kubernetes/%E3%80%90macosx%E3%80%91%E3%80%90kubernetes%E3%80%91kubectl-apply%E3%82%92%E3%81%99%E3%82%8B%E3%81%A8%E3%80%8Cfailed-to-download-openapi-the-server-could-not-find-the-requested-resource-falling-bac

<br>

### アーキテクチャ

![kubernetes_kube-apiserver_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_kube-apiserver_architecture.png)

| レイヤー                               | 責務                                                                 |
| -------------------------------------- | -------------------------------------------------------------------- |
| UI                                     | ハンドラーチェインで、認証／認可を実施する。                         |
| 〃                                     | リソースハンドラーのadmissionで、バリデーションを実施する。          |
| アプリケーション + ドメイン + インフラ | リソースハンドラーのREST logicで、リソースの状態をetcdに永続化する。 |

> - https://www.slideshare.net/sttts/kubernetes-api-codebase-tour#15
> - https://speakerdeck.com/bells17/kube-api-server?slide=41
> - https://www.amazon.co.jp/Programming-Kubernetes-Developing-Cloud-native-Applications/dp/1492047104

<br>

### セットアップ

#### ▼ 起動コマンド

```bash
$ kube-apiserver \
    --advertise-address=*.*.*.* \
    --allow-privileged=true \
    --audit-policy-file=/etc/kubernetes/audit-policy.yaml \
    --audit-webhook-batch-buffer-size=500 \
    --audit-webhook-batch-max-size=40 \
    --audit-webhook-batch-throttle-burst=400 \
    --audit-webhook-batch-throttle-qps=300 \
    --audit-webhook-config-file=/etc/kubernetes/audit-webhook.config \
    --audit-webhook-mode=batch \
    --audit-webhook-truncate-enabled=true \
    `# 認証フェーズの設定` \
    --authentication-token-webhook-config-file=/etc/kubernetes/ais/authentication-webhook.yaml \
    `# 認可タイプ` \
    --authorization-mode=Node,RBAC \
    `# 他のコンポーネントにHTTPSリクエストを送信するためのクライアント証明書` \
    --client-ca-file=/etc/kubernetes/pki/ca.crt \
    `# 有効化しているadmissionアドオン` \
    --enable-admission-plugins=NodeRestriction,PodTolerationRestriction \
    --enable-bootstrap-token-auth=true \
    --encryption-provider-config=/etc/kubernetes/pki/encryption_config.yaml \
    --etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt \
    `# etcdにHTTPSリクエストを送信するためのクライアント証明書` \
    --etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt \
    `# クライアント証明書とペアになる秘密鍵` \
    --etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key \
    `# etcdの宛先情報` \
    --etcd-servers=https://127.0.0.1:2379 \
    --feature-gates=ServiceAccountIssuerDiscovery=true,IPv6DualStack=false \
    --kubelet-certificate-authority=/etc/kubernetes/pki/ca.crt \
    `# kubeletにHTTPSリクエストを送信するためのクライアント証明書` \
    --kubelet-client-certificate=/etc/kubernetes/pki/apiserver-kubelet-client.crt \
    `# クライアント証明書とペアになる秘密鍵` \
    --kubelet-client-key=/etc/kubernetes/pki/apiserver-kubelet-client.key \
    --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname \
    --profiling=false \
    `# front-proxyにHTTPSリクエストを送信するためのクライアント証明書` \
    --proxy-client-cert-file=/etc/kubernetes/pki/front-proxy-client.crt \
    `# クライアント証明書とペアになる秘密鍵` \
    --proxy-client-key-file=/etc/kubernetes/pki/front-proxy-client.key \
    --requestheader-allowed-names=front-proxy-client \
    --requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.crt \
    --requestheader-extra-headers-prefix=X-Extra- \
    --requestheader-group-headers=X-Group \
    --requestheader-username-headers=X-User \
    --secure-port=6444 \
    --service-account-issuer=https://kubernetes.default.svc.cluster.local \
    `# 他のKubernetesリソースが持つServiceAccountの秘密鍵とペアになる公開鍵` \
    --service-account-key-file=/etc/kubernetes/pki/sa.pub \
    --service-account-max-token-expiration=48h \
    --service-account-signing-key-file=/etc/kubernetes/pki/sa.key \
    --service-cluster-ip-range=*.*.*.*/* \
    --tls-cert-file=/etc/kubernetes/pki/apiserver.crt \
    --tls-cipher-suites=***** \
    --tls-private-key-file=/etc/kubernetes/pki/apiserver.key \
    ...
```

<br>

### kube-apiserverの仕組み

#### ▼ 認証

![kubernetes_kube-apiserver_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_kube-apiserver_flow.png)

アプリケーションの認証と同じように、許可されたクライアントか否かを検証する。

Kubernetesリソース (特に、Pod) からのリクエストの場合はServiceAccountで、反対にクライアントからの場合はUserAccountに基づいて、クライアントを認証する。

ServiceAccountを作成すると、Bearerトークン (『`***-***-***-***-***-***`』のような形式) がSecretに格納される。

クライアントは、`Authorization`ヘッダーにBearerトークンを割り当て、リクエストを送信する必要がある。

このトークンは、Kubernetes `v1.22`以降で定期的に更新されるようになった。

> - https://kubernetes.io/docs/concepts/security/controlling-access/#authentication
> - https://knowledge.sakura.ad.jp/21129/
> - https://santakalog.com/2020/02/28/k8s-architecture/

#### ▼ 認可

![kubernetes_kube-apiserver_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_kube-apiserver_flow.png)

アプリケーションの認可と同じように、クライアントの権限の範囲 (認可スコープ) を検証する。

認証済みのServiceAccountやUserAccountを、RoleBindingされているRoleに基づいて認可する。

> - https://kubernetes.io/docs/concepts/security/controlling-access/#authorization
> - https://santakalog.com/2020/02/28/k8s-architecture/

<br>

### 公開するエンドポイント

#### ▼ Kubernetesリソース情報

指定したKubernetesリソースの情報を取得する。

```bash
# apps/v1の場合
$ kubectl get --raw /apis/apps/v1 | jq .

{
  "kind": "APIResourceList",
  "apiVersion": "v1",
  "groupVersion": "apps/v1",
  "resources": [
    ...
  ]
}
```

複数のAPIバージョンが存在するKubernetesリソースの場合、利用可能なバージョンと推奨バージョンを確認できる。

```bash
# autoscalingの場合
$ kubectl get --raw /apis/autoscaling | jq .

{
  "kind": "APIGroup",
  "apiVersion": "v1",
  "name": "autoscaling",
  # 利用可能なバージョン
  "versions": [
    {
      "groupVersion": "autoscaling/v2",
      "version": "v2"
    },
    {
      "groupVersion": "autoscaling/v1",
      "version": "v1"
    }
  ],
  # 推奨バージョン
  "preferredVersion": {
    "groupVersion": "autoscaling/v2",
    "version": "v2"
  }
}
```

> - https://zenn.dev/bells17/scraps/81b6ade4cbd40d
> - https://stackoverflow.com/questions/70884866/understand-capabilities-apiversions-has-in-helm

#### ▼ ヘルスチェック

kube-apiserverは、ヘルスチェック (Healthy、LivenessProbe、ReadinessProbe) ごとにエンドポイントを持つ。

`kubectl get`コマンドでヘルスチェックを実施できる。

```bash
# kube-apiserverのReadinessエンドポイントにヘルスチェックを実施する。
$ kubectl get --raw=/readyz?verbose

[+]ping ok
[+]log ok
[+]etcd ok
[+]poststarthook/start-kube-apiserver-admission-initializer ok
[+]poststarthook/generic-apiserver-start-informers ok
[+]poststarthook/start-apiextensions-informers ok
[+]poststarthook/start-apiextensions-controllers ok
[+]poststarthook/crd-informer-synced ok
[+]poststarthook/bootstrap-controller ok
[+]poststarthook/rbac/bootstrap-roles ok
[+]poststarthook/scheduling/bootstrap-system-priority-classes ok
[+]poststarthook/start-cluster-authentication-info-controller ok
[+]poststarthook/start-kube-aggregator-informers ok
[+]poststarthook/apiservice-registration-controller ok
[+]poststarthook/apiservice-status-available-controller ok
[+]poststarthook/kube-apiserver-autoregistration ok
[+]autoregister-completion ok
[+]poststarthook/apiservice-openapi-controller ok
healthz check passed
```

> - https://kubernetes.io/docs/reference/using-api/health-checks/

<br>

### SLI/SLO

kube-apiserverには、SLIとSLOが設定されている。

> - https://povilasv.me/kubernetes-api-server-slo-alerts-the-definitive-guide/
> - https://github.com/kubernetes/community/tree/master/sig-scalability/slos

<br>

### 他のコンポーネントとの通信

kube-apiserverは、クライアントからKubernetesリソースの作成/更新/削除リクエストを受信すると、他のコンポーネントと通信してKubernetesリソースを間接的に操作する。ここでは、Podの作成リクエストが送信された場合の流れを記載する。

![kubernetes_kube-apiserver_communication](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_kube-apiserver_communication.png)

`(1)`

: クライアントやKubernetesリソースがPodの作成リクエストを送信する。

`(2)`

: kube-apiserverはリクエストを受信し、Podの作成宣言の情報をetcdに永続化する。

`(3)`

: しばらくすると、kube-controllerは、kube-apiserverを経由してetcdにwatchイベントを送信する。

    kube-controllerは、etcdとNode上のKubernetesリソースの間に差分があることを検知する。さらに、kube-schedulerにPodのスケジューリングをコールする。

`(4)`

: kube-schedulerは、フィルタリングとスコアリングの結果に基づいて、Podのスケジューリング対象となるNodeを決める。

`(5)`

: kube-apiserverは、バインディング情報 (スケジューリング対象NodeとPod間の紐付き情報) をetcdに永続化する。

`(6)`

: しばらくすると、kube-controllerは、kube-apiserverを経由してetcdにwatchイベントを送信する。

    kube-controllerは、バインディング情報が永続化されたことを検知する。さらに、etcdのバインディング情報に基づいて、特定のNode上のkubeletにPodの作成をコールする。

`(7)`

: kubeletは、コンテナランタイム (例：Docker、Containerd) のデーモンにコンテナの作成をコールする。

`(8)`

: コンテナランタイムのデーモンは、コンテナを作成する。

`(9)`

: kubeletは、Podが作成されたことをkube-apiserverに返信する。

`(10)`

: kube-apiserverは、Podの作成完了をetcdに永続化する。

> - https://blog.vpantry.net/2020/05/k8s-5/
> - https://medium.com/jorgeacetozi/kubernetes-master-components-etcd-api-server-controller-manager-and-scheduler-3a0179fc8186

<br>

### 拡張apiverver (aggregated apiserver)

#### ▼ 拡張apiververとは

標準のkube-apiserverを拡張したapiserverのこと。

> - https://itnext.io/comparing-kubernetes-api-extension-mechanisms-of-custom-resource-definition-and-aggregated-api-64f4ca6d0966
> - https://qiita.com/go_vargo/items/c7a526c0d4dbc9199dd4
> - https://software.fujitsu.com/jp/manual/manualfiles/m220004/j2ul2762/01z201/j2762-00-02-11-01.html

##### ▼ 拡張apiserverの例

- metrics-server
- kube-discovery

> - https://itnext.io/comparing-kubernetes-api-extension-mechanisms-of-custom-resource-definition-and-aggregated-api-64f4ca6d0966

<br>

## 06. kube-controller-manager

### kube-controller-managerとは

kube-controllerを一括で管理する。

kube-controllerを使用して、kube-apiserverがKubernetesリソースを操作できるようにする。

> - https://thinkit.co.jp/article/17453

<br>

### セットアップ

#### ▼ 起動コマンド

```bash
$ kube-controller-manager \
    --allocate-node-cidrs=true \
    --authentication-kubeconfig=/etc/kubernetes/controller-manager.conf \
    --authorization-kubeconfig=/etc/kubernetes/controller-manager.conf \
    --bind-address=127.0.0.1 \
    `# kube-apiserverにHTTPSリクエストを送信するためのクライアント証明書` \
    --client-ca-file=/etc/kubernetes/pki/ca.crt \
    --cluster-cidr=*.*.*.*/* \
    --cluster-name=foo-cluster \
    --cluster-signing-cert-file=/etc/kubernetes/pki/ca.crt \
    --cluster-signing-key-file=/etc/kubernetes/pki/ca.key \
    --controllers=*,bootstrapsigner,tokencleaner \
    --feature-gates=IPv6DualStack=false \
    --kubeconfig=/etc/kubernetes/controller-manager.conf \
    --leader-elect=true \
    `# コントロールプレーンNodeのサブネットマスク` \
    --node-cidr-mask-size=23 \
    --port=0 \
    --profiling=false \
    --requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.crt \
    `# ルート認証局のCA証明書` \
    --root-ca-file=/etc/kubernetes/pki/ca.crt \
    `# kube-apiserverの認証/認可を通過するために必要なServiceAccountの秘密鍵` \
    `# kube-apiserverには、これとペアになる公開鍵が割り当てられている。` \
    --service-account-private-key-file=/etc/kubernetes/pki/sa.key \
    --service-cluster-ip-range=*.*.*.*/* \
    --terminated-pod-gc-threshold=1000 \
    --use-service-account-credentials=true \
    ...
```

<br>

### kube-controller

#### ▼ kube-controllerとは

kube-controllerは、kube-apiserverを経由して、etcdにwatchイベントを送信している。

Kubernetesリソースのマニフェストを何らかの方法 (例：`kubectl apply`コマンド、`kubectl edit`コマンドなど) でetcd上に永続化したとする。

すると、kube-controllerはetcd上でKubernetesリソースのマニフェストを検知し、実際にKubernetesリソースを作成/変更する。

クライアントからのマニフェストの作成/変更は、etcd上のマニフェストの設定値を変更しているのみで、実際のKubernetesリソースを作成/変更しているわけではないことに注意する。

> - https://kubernetes.io/docs/concepts/architecture/controller/
> - https://github.com/kubernetes/kubernetes/tree/master/pkg/controller

#### ▼ kube-controllerの種類

各Kubernetesリソースに対応して、kube-controllerがいる。

- deployment-controller
- replicaset-controller
- daemonset-controller

...

> - https://speakerdeck.com/bells17/controllerwozuo-tutemiyou-kubernetes-controllerhansuon?slide=13

<br>

### kube-controller-managerの仕組み

#### ▼ reconciliationループ

kube-controller-managerは、kube-controllerを反復的に実行する。

これにより、Kubernetesリソースはリソース定義の宣言通りに定期的に修復される。

注意点として、reconciliationループを実現しているのはkube-controllerではなくkube-controller-managerである。

![kubernetes_reconciliation-loop](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_reconciliation-loop.png)

> - https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work#how_operators_reconcile_kubernetes_cluster_states
> - https://www.oreilly.com/library/view/programming-kubernetes/9781492047094/ch01.html
> - https://speakerdeck.com/yosshi_/korekaraxue-hukubernetesfalsereconciliation-loop?slide=27

<br>

## 07. kube-scheduler

### kube-schedulerとは

Nodeが複数ある場合、NodeとPodのスペックを基に、PodをスケジューリングさせるべきNodeを選定する。

また、kubeletによるヘルスチェックでNodeが`NotReady`になった場合に、kube-schedulerはこれを検知し、新しいNodeを作成する。

なお、kube-schedulerは一度スケジューリングしたPodを再スケジューリングできず、deschedulerを使用する必要がある。

![kubernetes_kube-scheduler](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_kube-scheduler.png)

> - https://thinkit.co.jp/article/17453
> - https://discuss.kubernetes.io/t/rescheduling-pod-after-scale-up/18967/7

<br>

### セットアップ

#### ▼ 起動コマンド

```bash
$ kube-scheduler \
    --authentication-kubeconfig=/etc/kubernetes/scheduler.conf \
    --authorization-kubeconfig=/etc/kubernetes/scheduler.conf \
    --bind-address=127.0.0.1 \
    --feature-gates=IPv6DualStack=false \
    --kubeconfig=/etc/kubernetes/scheduler.conf \
    --leader-elect=true \
    --port=0 \
    --profiling=false \
    --secure-port=10259 \
    ...
```

> - https://kubernetes.io/docs/reference/command-line-tools-reference/kube-scheduler/

<br>

### kube-schedulerの仕組み

`(1)`

: 全てのNodeの一覧を取得する。

`(2)`

: Predicatesフェーズである。

    条件 (例：`.spec.nodeSelector`キー、ハードウェアリソースの空き容量) に応じて、Nodeをフィルタリングする。

`(3)`

: Prioritiesフェーズである。

     フィルタリングで選定されたNodeに点数をつける。

`(4)`

: 点数に基づいて、Pod作成に最も望ましいNodeを選定する。

![kubernetes_kube-scheduler_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_kube-scheduler_flow.png)

> - https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/
> - https://techblog.ap-com.co.jp/entry/2019/06/20/191459
> - https://qiita.com/tkusumi/items/58fdadbe4053812cb44e#%E6%9C%80%E9%81%A9%E3%81%AA%E3%83%8E%E3%83%BC%E3%83%89%E3%81%AE%E9%81%B8%E6%8A%9E

<br>
