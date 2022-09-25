---
title: 【IT技術の知見】Kubernetes＠IaC
description: Kubernetes＠IaCの知見を記録しています。
---

# Kubernetes＠IaC

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Kubernetesの仕組み

### アーキテクチャ

> ℹ️ 参考：https://kubernetes.io/docs/concepts/overview/components/

![kubernetes_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_architecture.png)

<br>

## 02. コントロールプレーンコンポーネント（マスターコンポーネント）

### コントロールプレーンコンポーネントとは

『マスターコンポーネント』ともいう。コントロールプレーンNode上で稼働するコンポーネントのこと。コントロールプレーンコンポーネントは、Cluster内のワーカーNode自体と、ワーカーNode内のPodを管理する。これは、コントロールプレーンNode上でデーモンとして直接的に稼働させる場合と、DeploymentやDaemonSetで複製されたPod内で稼働させる場合がある。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/overview/components/#control-plane-components
> - https://cstoku.dev/posts/2018/k8sdojo-24/
> - https://kubernetes.io/docs/concepts/overview/components/
> - https://thinkit.co.jp/article/17453

<br>

## 02-02. コントロールプレーンNode

### コントロールプレーンNode（kubernetesマスター）とは

kubernetesマスターともいう。コントロールプレーンコンポーネントが稼働する。クライアント（```kubectl```実行者、Kubernetesリソース）がKubernetesリソースを操作しようとリクエストを送信すると、まず最初に、コントロールプレーンNode上のkube-apiserverがリクエストを受信する。コントロールプレーンNodeがマネージドなツールを使用した方がよく、『Nodeのクライアント操作=ワーカーNodeのクライアント操作』と考える。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/#kubernetes%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC
> - https://medium.com/easyread/step-by-step-introduction-to-basic-concept-of-kubernetes-e20383bdd118
> - https://qiita.com/baby-degu/items/ce26507bd954621d6dc5

### クライアント

クライアント（```kubectl```実行者、Kubernetesリソース）は、kube-apiserverにリクエストを送信し、Kubernetesリソースを操作する。

<br>

### 待ち受けるポート番号

コントロールプレーンコンポーネントのために、コントロールプレーンNodeが通信を待ち受けるデフォルトのポート番号は、以下の通りである。

> ℹ️ 参考：https://kubernetes.io/docs/reference/ports-and-protocols/#control-plane

<br>

## 02-04. cloud-controller-manager

### cloud-controller-managerとは

クラウドインフラを操作するcloud-controllerを一括で管理する。cloud-controllerを使用して、kube-apiserverがクラウドインフラを操作できるようにする。

![kubernetes_cloud-controller-manager](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cloud-controller-manager.png)

<br>

## 02-03. etcd（エトセディー）

### etcdとは

![kubernetes_etcd](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_etcd.png)

Cluster内のKubernetesリソースの設定値をキーバリュー型で永続化し、またサービスレジストリーとして働く。語尾の『```d```』は、分散（distribution）の意味である。リクエストを受信したkube-apiserverは、etcdからKubernetesリソースの情報を参照する。Kubernetesに標準で組み込まれているが、別のOSSである。デフォルトでは、コントロールプレーンNodeで直接的に稼働させる場合でも、あるいはPod内で稼働させる場合でも、```/var/lib/etcd```ディレクトリをローカルストレージとする。

> ℹ️ 参考：
>
> - https://thinkit.co.jp/article/17453
> - https://uzimihsr.github.io/post/2019-11-25-kubernetes-components/
> - https://blog.devgenius.io/implementing-service-discovery-for-microservices-df737e012bc2

<br>

### セットアップ

#### ▼ 起動コマンド

```bash
$ etcd \
    --advertise-client-urls=https://*.*.*.*:2379 \
    # HTTPSリクエストを受信するためのSSL証明書
    --cert-file=/etc/kubernetes/pki/etcd/server.crt \
    # HTTPSリクエストを送信するためのクライアント証明書
    --client-cert-auth=true \
    # マニフェストファイルを保管するローカルストレージ
    --data-dir=/var/lib/etcd \
    --initial-advertise-peer-urls=https://*.*.*.*:2380 \
    --initial-cluster=foo-node=https://*.*.*.*:2380 \
    # SSL証明書と対になる秘密鍵
    --key-file=/etc/kubernetes/pki/etcd/server.key \
    --listen-client-urls=https://127.0.0.1:2379,https://*.*.*.*:2379 \
    --listen-metrics-urls=http://127.0.0.1:2381 \
    --listen-peer-urls=https://*.*.*.*:2380 \
    # etcdが稼働するコントロールプレーンNode
    --name=foo-node \
    --peer-cert-file=/etc/kubernetes/pki/etcd/peer.crt \
    --peer-client-cert-auth=true \
    --peer-key-file=/etc/kubernetes/pki/etcd/peer.key \
    --peer-trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt \
    --snapshot-count=10000 \
    --trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt
```

<br>

## 02-05. kube-apiserver

### kube-apiserverとは

![kubernetes_kube-apiserver](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-apiserver.png)

クライアントにコントロールプレーンNodeを公開する。クライアントがリクエストを送信すると、コントロールプレーンNode上のkube-apiserverがコールされ、他のコンポーネントとHTTPプロトコルで通信する。存在しないリソース定義をリクエストされると、kube-apiserverはリソース定義を見つけられず、以下のエラーレスポンスを返信する。

```log
the server could not find the requested resource
```

> ℹ️ 参考：
>
> - https://thinkit.co.jp/article/17453
> - https://vamdemicsystem.black/kubernetes/%E3%80%90macosx%E3%80%91%E3%80%90kubernetes%E3%80%91kubectl-apply%E3%82%92%E3%81%99%E3%82%8B%E3%81%A8%E3%80%8Cfailed-to-download-openapi-the-server-could-not-find-the-requested-resource-falling-bac

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
    # 認証フェーズの設定
    --authentication-token-webhook-config-file=/etc/kubernetes/ais/authentication-webhook.yaml \
    # 認可タイプ
    --authorization-mode=Node,RBAC \
    # 他のコンポーネントにHTTPSリクエストを送信するためのクライアント証明書
    --client-ca-file=/etc/kubernetes/pki/ca.crt \
    # 有効化しているadmissionアドオン
    --enable-admission-plugins=NodeRestriction,PodTolerationRestriction \
    --enable-bootstrap-token-auth=true \
    --encryption-provider-config=/etc/kubernetes/pki/encryption_config.yaml \
    --etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt \
    # etcdにHTTPSリクエストを送信するためのクライアント証明書
    --etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt \
    # クライアント証明書と対になる秘密鍵
    --etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key \
    # etcdの宛先情報
    --etcd-servers=https://127.0.0.1:2379 \
    --feature-gates=ServiceAccountIssuerDiscovery=true,IPv6DualStack=false \
    --kubelet-certificate-authority=/etc/kubernetes/pki/ca.crt \
    # kubeletにHTTPSリクエストを送信するためのクライアント証明書
    --kubelet-client-certificate=/etc/kubernetes/pki/apiserver-kubelet-client.crt \
    # クライアント証明書と対になる秘密鍵
    --kubelet-client-key=/etc/kubernetes/pki/apiserver-kubelet-client.key \
    --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname \
    --profiling=false \
    # front-proxyにHTTPSリクエストを送信するためのクライアント証明書
    --proxy-client-cert-file=/etc/kubernetes/pki/front-proxy-client.crt \
    # クライアント証明書と対になる秘密鍵
    --proxy-client-key-file=/etc/kubernetes/pki/front-proxy-client.key \
    --requestheader-allowed-names=front-proxy-client \
    --requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.crt \
    --requestheader-extra-headers-prefix=X-Extra- \
    --requestheader-group-headers=X-Group \
    --requestheader-username-headers=X-User \
    --secure-port=6444 \
    --service-account-issuer=https://kubernetes.default.svc.cluster.local \
    # 他のKubernetesリソースが持つServiceAccountの秘密鍵と対になる公開鍵
    --service-account-key-file=/etc/kubernetes/pki/sa.pub \
    --service-account-max-token-expiration=48h \
    --service-account-signing-key-file=/etc/kubernetes/pki/sa.key \
    --service-cluster-ip-range=*.*.*.*/n \
    --tls-cert-file=/etc/kubernetes/pki/apiserver.crt \
    --tls-cipher-suites=***** \
    --tls-private-key-file=/etc/kubernetes/pki/apiserver.key \
    ...
```

<br>

### kube-apiserverの仕組み

#### ▼ 認証

![kubernetes_kube-apiserver_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-apiserver_flow.png)

アプリケーションの認証と同じように、クライアントが許可されたクライアントかどうかを検証する。Cluster内部からの場合はServiceAccountで、反対にCluster外部からのクライアントの場合はUserAccountに基づいて、クライアントを認証する。サービスアカウントを作成すると、Bearerトークン（『```***-***-***-***-***-***```』のような形式）がSecretに格納される。クライアントは、```Authorization```ヘッダーにBearerトークンを割り当て、リクエストを送信する必要がある。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/security/controlling-access/#authentication
> - https://knowledge.sakura.ad.jp/21129/
> - https://santakalog.com/2020/02/28/k8s-architecture/

#### ▼ 認可

![kubernetes_kube-apiserver_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-apiserver_flow.png)

アプリケーションの認可と同じように、クライアントの権限の範囲（認可スコープ）を検証する。認証されたServiceAccountやUserAccountを、RoleBindingされているRoleに基づいて認可する。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/security/controlling-access/#authorization
> - https://santakalog.com/2020/02/28/k8s-architecture/

<br>

### 公開するエンドポイント

#### ▼ ヘルスチェック

kube-apiserverにはヘルスチェック（```healthy```、```liveness```、```readiness```）のエンドポイントがある。```kubectl get```コマンドでヘルスチェックを実行できる。

> ℹ️ 参考：https://kubernetes.io/docs/reference/using-api/health-checks/

```bash
# readinessエンドポイントにリクエストを送信する。
$ kubectl get --raw='/readyz?verbose'

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

<br>

### 他のコンポーネントとの通信

kube-apiserverは、クライアントからKubernetesリソースの作成/更新/削除リクエストを受信すると、他のコンポーネントと通信してKubernetesリソースを間接的に操作する。ここでは、Podの作成リクエストが送信された場合の流れを記載する。

![kubernetes_kube-apiserver_communication](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-apiserver_communication.png)

> ℹ️ 参考：
>
> - https://blog.vpantry.net/2020/05/k8s-5/
> - https://medium.com/jorgeacetozi/kubernetes-master-components-etcd-api-server-controller-manager-and-scheduler-3a0179fc8186

（１）クライアントやKubernetesリソースがPodの作成リクエストを送信する。

（２）kube-apiserverはリクエストを受信し、Podの作成宣言の情報をetcdに永続化する。

（３）しばらくすると、kube-controllerは、kube-apiserverを介してetcdにwatchイベントを送信する。kube-controllerは、etcdとワーカーNode上のKubernetesリソースの間に差分があることを検知する。さらに、kube-schedulerにPodのスケジューリングをコールする。

（４）kube-schedulerは、フィルタリングとスコアリングの結果に基づいて、Podのスケジューリング対象となるワーカーNodeを決定する。

（５）kube-apiserverは、バインディング情報（スケジューリング対象ワーカーNodeとPod間の紐付き情報）をetcdに永続化する。

（６）しばらくすると、kube-controllerは、kube-apiserverを介してetcdにwatchイベントを送信する。kube-controllerは、バインディング情報が永続化されたことを検知する。らに、etcdのバインディング情報に基づいて、特定のワーカーNode上のkubeletにPodの作成をコールする。

（７）kubeletは、コンテナランタイム（例：Docker、Containerd）のデーモンにコンテナの作成をコールする。

（８）コンテナランタイムのデーモンは、コンテナを作成する。

（９）kubeletは、Podが作成されたことをkube-apiserverに返却する。

（１０）kube-apiserverは、Podの作成完了をetcdに永続化する。

<br>

## 02-06. kube-controller-manager

### kube-controller-managerとは

kube-controllerを一括で管理する。kube-controllerを使用して、kube-apiserverがKubernetesリソースを操作できるようにする。

> ℹ️ 参考：https://thinkit.co.jp/article/17453

<br>

### セットアップ

#### ▼ 起動コマンド

```bash
$ kube-controller-manager \
    --allocate-node-cidrs=true \
    --authentication-kubeconfig=/etc/kubernetes/controller-manager.conf \
    --authorization-kubeconfig=/etc/kubernetes/controller-manager.conf \
    --bind-address=127.0.0.1 \
    # kube-apiserverにHTTPSリクエストを送信するためのクライアント証明書
    --client-ca-file=/etc/kubernetes/pki/ca.crt \
    --cluster-cidr=*.*.*.*/* \
    --cluster-name=foo-cluster \
    --cluster-signing-cert-file=/etc/kubernetes/pki/ca.crt \
    --cluster-signing-key-file=/etc/kubernetes/pki/ca.key \
    --controllers=*,bootstrapsigner,tokencleaner \
    --feature-gates=IPv6DualStack=false \
    --kubeconfig=/etc/kubernetes/controller-manager.conf \
    --leader-elect=true \
    # コントロールプレーンNodeのサブネットマスク
    --node-cidr-mask-size=23 \
    --port=0 \
    --profiling=false \
    --requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.crt \
    # ルート認証局の証明書
    --root-ca-file=/etc/kubernetes/pki/ca.crt \
    # kube-apiserverの認証/認可を通過するために必要なServiceAccountの秘密鍵
    # kube-apiserverには、これと対になる公開鍵が割り当てられている。
    --service-account-private-key-file=/etc/kubernetes/pki/sa.key \
    --service-cluster-ip-range=*.*.*.*/* \
    --terminated-pod-gc-threshold=1000 \
    --use-service-account-credentials=true \
    ...
```

<br>

### kube-controller

#### ▼ kube-controllerとは

マニフェストファイルとkube-apiserverを仲介し、リソース定義の宣言通りにKubernetesリソースを作成する。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/architecture/controller/
> - https://github.com/kubernetes/kubernetes/tree/master/pkg/controller

<br>

### kube-controller-managerの仕組み

#### ▼ reconciliationループ

![kubernetes_reconciliation-loop](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_reconciliation-loop.png)

kube-controller-managerは、kube-controllerを反復的に実行する。これにより、Kubernetesリソースはリソース定義の宣言通りに定期的に修復される。

> ℹ️ 参考：
>
> - https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work#how_operators_reconcile_kubernetes_cluster_states
> - https://www.oreilly.com/library/view/programming-kubernetes/9781492047094/ch01.html
> - https://speakerdeck.com/yosshi_/korekaraxue-hukubernetesfalsereconciliation-loop?slide=27

<br>

## 02-07. kube-scheduler

### kube-schedulerとは

ワーカーNodeが複数ある場合、ワーカーNodeとPodのスペックを基に、PodをスケジューリングするべきワーカーNodeを判定する。

> ℹ️ 参考：https://thinkit.co.jp/article/17453

![kubernetes_kube-scheduler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-scheduler.png)

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
    ...
```

<br>

### kube-schedulerの仕組み

![kubernetes_kube-scheduler_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-scheduler_flow.png)

1. フィルタリングを行う。フィルタリングステップでは、まず全てのワーカーNodeの一覧を取得する。その後、Pod作成の条件を満たすワーカーNodeを選定する。
2. スコアリングを行う。スコアリングステップでは、まずフィルタリングで選定されたワーカーNodeに点数をつける。その後、点数に基づいて、Pod作成に最も望ましいワーカーNodeを選定する。この時、Podの作成先のNodeグループが設定されていれば、Nodeグループの中から望ましいものを選定する。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/
> - https://techblog.ap-com.co.jp/entry/2019/06/20/191459
> - https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node%E3%81%AE%E9%9A%94%E9%9B%A2%E3%82%84%E5%88%B6%E9%99%90

<br>

### descheduler

#### ▼ deschedulerとは

kube-schedulerは、既存のPodを削除して別のワーカーNodeに再スケジューリングすることはない。そのため、ワーカーNodeが障害が起こり、他のワーカーNodeにPodが退避した後、ワーカーNodeが復旧したとしても、Podが元のワーカーNodeに戻ることはない。```kubectl rollout restart```コマンドを実行しても良いが、deschedulerを使用すればこれを自動化できる。deschedulerをJobとして起動させ、Podを自動的に再スケジュールする。

> ℹ️ 参考：
>
> - https://torumakabe.github.io/post/k8s_descheduler/
> - https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=8

<br>

## 03. Nodeコンポーネント

### Nodeコンポーネントとは

ワーカーNode上で稼働するKubernetesコンポーネントのこと。

> ℹ️ 参考：
>
> - https://cstoku.dev/posts/2018/k8sdojo-24/
> - https://kubernetes.io/docs/concepts/overview/components/

<br>


## 03-02. ワーカーNode

### ワーカーNodeとは

ノードコンポーネントが稼働する。Kubernetesの実行時に自動的に作成される。もし手動で作成する場合は、```kubectl```コマンドで```--register-node=false```とする必要がある。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/architecture/nodes/
> - https://kubernetes.io/docs/concepts/architecture/nodes/#manual-node-administration

<br>

### 待ち受けるポート番号

ワーカーNodeが通信を待ち受けるデフォルトのポート番号は、以下の通りである。

> ℹ️ 参考：https://kubernetes.io/docs/reference/ports-and-protocols/#node

<br>


## 03-03. Nodeグループ

### Nodeグループとは

KubernetesにはNodeグループというリソースがなく、グループを宣言的に定義することはできないが、クラウドプロバイダーを使用して、Nodeグループを実現できる。同じ設定値（```metadata.labels```キー、CPU、メモリ、など）や同じ役割を持ったNodeのグループのこと。基本的には、Nodeグループは冗長化されたワーカーNodeで構成されており、IDは違えど、ワーカーNode名は全て同じである。Nodeグループをターゲットとするロードバランサーでは、Nodeグループ内で冗長化ワーカーNodeのいずれかに対してルーティングすることになる。

> ℹ️ 参考：
>
> - https://qiita.com/mumoshu/items/9ee00307d6bbab43edb6
> - https://docs.aws.amazon.com/eks/latest/userguide/autoscaling.html#cluster-autoscaler

<br>

### Nodeグループの粒度

| Nodeグループ名の例           | 説明                                                                                                                                                              |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```gateway```、```ingress```        | ワーカーNodeへのインバウンド通信の入口になるリソース（例：Ingress、IngressGateway）のコンテナや、API Gatewayのアプリケーションのコンテナを配置する。これは単一障害点になりうるため、ワーカーNodeのCPUやメモリを潤沢にしようできるように、他のリソースのコンテナとは別のNodeグループにした方が良い。 |
| ```batch```、```job``` | バッチ処理やジョブ（定期的に実行するように設定されたバッチ処理）のコンテナを配置する。                                                                                                                     |
| ```collector```       | ログやメトリクスを収集するリソース（例：Prometheus、Alertmanager、のPod）のコンテナを配置する。                                                                                                    |
| ```master```          | セルフマネージドなKubernetesコントロールプレーンNodeのコンテナを稼働させる。マネージドなコントロールプレーンNode（例：AWS EKS、GCP GKE、など）の場合、このNodeグループは不要になる。                                                    |
| ```mesh```            | セルフマネージドなサービスメッシュコントロールプレーンNodeのコンテナを稼働させる。マネージドなコントロールプレーンNode（例：AWS AppMesh、など）の場合、このNodeグループは不要になる。                                                                   |
| ```service```         | マイクロサービスのアプリケーションのコンテナを稼働させる。                                                                                                                                   |

<br>

### ワーカーNodeのオートスケーリング

KubernetesのAPIにはワーカーNodeのオートスケーリング機能はない（2022/07/20執筆時点）。ただ、cluster-autoscalerアドオンを使用すると、各クラウドプロバイダーのAPIからワーカーNodeのオートスケーリングを実行できるようになる。

> ℹ️ 参考：
>
> - https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler#cluster-autoscaler
> - https://blog.inductor.me/entry/2021/12/06/165743

<br>


## 03-04. kubelet

### kubeletとは

各ワーカーNode上で直接デーモンとして稼働し、コンテナランタイムを操作することにより、Podを作成する。また、ワーカーNodeやPodを監視し、メトリクスのデータポイントをkube-apiserverに提供する。

> ℹ️ 参考：https://thinkit.co.jp/article/17453

![kubernetes_kubelet](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kubelet.png)

<br>

### セットアップ

#### ▼ 起動コマンド

> ℹ️ 参考：https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/#options

```bash
$ kubelet \
    --bootstrap-kubeconfig=/etc/kubernetes/bootstrap-kubelet.conf \
    --kubeconfig=/etc/kubernetes/kubelet.conf \
    --config=/var/lib/kubelet/config.yaml \ 
    --authentication-token-webhook=true 
    --authorization-mode=Webhook \
    --container-runtime=remote \
    --container-runtime-endpoint=unix:///run/containerd/containerd.sock \
    --max-pods=250 \
    --node-ip=*.*.*.* \
    --rotate-server-certificates=true \
    --seccomp-default=true \
    --cgroup-driver=systemd \
    --runtime-cgroups=/system.slice/containerd.service \
    ...
```

<br>

## 03-05. kube-proxy

### kube-proxyとは

各ワーカーNode上でDaemonSetとして稼働し、サービスディスカバリー、検出したサービス（Pod）に対するロードバランサー、として働く。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies
> - https://iximiuz.com/en/posts/service-discovery-in-kubernetes

<br>

### セットアップ

#### ▼ 起動コマンド

```bash
$ kube-proxy \
    --config=/var/lib/kube-proxy/config.conf \
    --hostname-override=foo-node \
    ...
```

<br>

### kube-proxyの仕組み

#### ▼ サービスディスカバリー

![kubernetes_kube-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy.png)

ワーカーNode上で稼働するパケットフィルタリング型ファイアウォール（iptables）やロードバランサー（ipvs）に、EndpointSliceで管理するPodの宛先情報を追加/削除する。Service内ネットワークさえ作成できていれば、ServiceとPodが同じワーカーNode上にあるかどうかに限らず、Serviceは、ワーカーNodeの宛先情報ルールを使用してPodを動的に検出できる。プロキシモードごとに、Podの名前解決の方法が異なる。

> ℹ️ 参考：https://www.imagazine.co.jp/%e5%ae%9f%e8%b7%b5-kubernetes%e3%80%80%e3%80%80%ef%bd%9e%e3%82%b3%e3%83%b3%e3%83%86%e3%83%8a%e7%ae%a1%e7%90%86%e3%81%ae%e3%82%b9%e3%82%bf%e3%83%b3%e3%83%80%e3%83%bc%e3%83%89%e3%83%84%e3%83%bc%e3%83%ab/

#### ▼ Podのロードバランサー

ロードバランシングアルゴリズムによって、Serviceがルーティング先とするPodを決定する。プロキシモードごとに、使用するロードバランシングアルゴリズムが異なる。

> ℹ️ 参考：https://kubernetes.io/ja/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies

<br>

### プロキシモードの種類

#### ▼ iptablesプロキシモード


![kubernetes_kube-proxy_iptables](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_iptables.png)

| 項目              | 仕組み                                                                                  |
|-----------------|--------------------------------------------------------------------------------------|
| サービスディスカバリー     | ServiceとそのService配下のEndpointSliceの追加と削除を監視し、これらの増減に合わせて、ワーカーNode上で稼働するiptablesを更新する。 |
| ロードバランシングアルゴリズム | ランダム方式のみ。                                                                            |

> ℹ️ 参考：
> 
> - https://kubernetes.io/docs/concepts/services-networking/service/#proxy-mode-iptables
> - https://www.mtioutput.com/entry/kube-proxy-iptable
> - https://github.com/kubernetes/kubernetes/pull/81430

#### ▼ userspaceプロキシモード

![kubernetes_kube-proxy_userspace](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_userspace.png)


| 項目              | 仕組み                                                                                  |
|-----------------|--------------------------------------------------------------------------------------|
| サービスディスカバリー     | ServiceとそのService配下のEndpointSliceの追加と削除を監視し、これらの増減に合わせて、ワーカーNode上で稼働するiptablesを更新する。 |
| ロードバランシングアルゴリズム | ラウンドロビン方式のみ。                                                                         |

> ℹ️ 参考：
> 
> - https://kubernetes.io/docs/concepts/services-networking/service/#proxy-mode-userspace
> - https://github.com/kubernetes/kubernetes/pull/81430


#### ▼ ipvsプロキシモード

![kubernetes_kube-proxy_ipvs](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_ipvs.png)

| 項目              | 仕組み                                                                              |
|-----------------|----------------------------------------------------------------------------------|
| サービスディスカバリー     | ServiceとそのService配下のEndpointSliceの追加と削除を監視し、これらの増減に合わせて、ワーカーNode上で稼働するipvsを更新する。 |
| ロードバランシングアルゴリズム | ラウンドロビン方式、コネクションの最低数、送信先ハッシュ値、送信元ハッシュ値、など。                                       |


> ℹ️ 参考：
> 
> - https://kubernetes.io/docs/concepts/services-networking/service/#proxy-mode-ipvs
> - https://github.com/kubernetes/kubernetes/pull/81430


<br>

### その他のプロキシー

ワーカーNode外部からのインバウンド通信をPodにルーティングするためのプロキシーが、他にもいくつかある。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/cluster-administration/proxies/

- ```kubectl proxy```コマンド
- ```minikube tunnel```コマンド
- LoadBalancer

<br>

## 03-06. コンテナランタイム（コンテナエンジン）

### コンテナランタイムとは

イメージのプル、コンテナ作成削除、コンテナ起動停止、などを行う。

> ℹ️ 参考：https://thinkit.co.jp/article/17453

<br>

### コンテナのライフサイクルフェーズ

コンテナのライフサイクルにはフェーズがある。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-states

| フェーズ名 | 説明                                    |
| --------------- |---------------------------------------|
| Waiting         | RunningフェーズとTerminatedフェーズ以外のフェーズにある。 |
| Running         | コンテナの起動が完了し、実行中である。                   |
| Terminated      | コンテナが正常/異常に停止した。                      |

<br>

## 04. Kubernetesネットワーク

### Cluster内ネットワーク

#### ▼ Cluster内ネットワークとは

![kubernetes_cluster-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cluster-network.png)

同じCluster内ネットワーク内にあるPodの仮想NIC（veth）間を接続するネットワーク。Cluster内ネットワークの作成は、cniアドオンが担う。

> ℹ️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=11

<br>

### Node内ネットワーク

#### ▼ Node内ネットワークとは

![kubernetes_node-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_node-network.png)

同じサブネットマスク内にあるワーカーNodeのNIC間を接続するネットワーク。Node内ネットワークの作成は、Kubernetesの実行環境のネットワークが担う。

> ℹ️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=10

<br>

### Service内ネットワーク

#### ▼ Service内ネットワークとは

![kubernetes_service-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_service-network.png)

Podのアウトバウンド通信に割り当てられたホスト名を認識し、そのホスト名を持つServiceまでアウトバウンド通信を送信する。Service内ネットワークの作成は、Kubernetesが担う。

> ℹ️ 参考：
>
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=13
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=39

<br>

### Pod内ネットワーク

#### ▼ Pod内ネットワークとは

Pod内のネットワークのみを経由して、他のコンテナにアウトバウンド通信を送信する。Podごとにネットワークインターフェースが付与され、またIPアドレスが割り当てられる。

> ℹ️ 参考：https://www.tutorialworks.com/kubernetes-pod-communication/#how-do-containers-in-the-same-pod-communicate

#### ▼ 通信方法

同じPod内のコンテナ間は『```localhost:<ポート番号>```』で通信できる。

```bash
# Pod内のコンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>:~] $ curl -X GET http://localhost:<ポート番号>
```

<br>

## 04-02. Pod間通信

### Pod間通信の経路

Pod内のコンテナから宛先のPodにアウトバウンド通信を送信する。この時、PodのスケジューリングされているワーカーNodeが同じ/異なるかのいずれの場合で、経由するネットワークが異なる。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/cluster-administration/networking/

| 条件             | 経由するネットワーク                                         |
| ---------------- | ------------------------------------------------------------ |
| ワーカーNodeが異なる場合 | Node内ネットワーク + Cluster内ネットワーク + Service内ネットワーク |
| ワーカーNodeが同じ場合   | Cluster内ネットワーク + Service内ネットワーク                    |

<br>

### IPアドレスを使用する場合

#### ▼ ServiceのIPアドレス

kubeletは、Pod内のコンテナにServiceの宛先情報（IPアドレス、プロトコル、ポート番号）を出力する。Pod内のコンテナは、これを使用し、Serviceを介してPodにアウトバウンド通信を送信する。

> ℹ️ 参考：
> 
> - https://kubernetes.io/docs/concepts/services-networking/service/#discovering-services
> - https://kakakakakku.hatenablog.com/entry/2022/05/31/093116

**＊実装例＊**

foo-app-serviceというServiceを作成した場合の環境変数を示す。

```bash
$ kubectl exec -it foo-pod -- printenv | sort -n

FOO_APP_SERVICE_PORT=tcp://10.110.235.51:80
FOO_APP_SERVICE_PORT_80_TCP=tcp://10.110.235.51:80
FOO_APP_SERVICE_PORT_80_TCP_ADDR=10.110.235.51
FOO_APP_SERVICE_PORT_80_TCP_PORT=80
FOO_APP_SERVICE_PORT_80_TCP_PROTO=tcp
FOO_APP_SERVICE_SERVICE_HOST=10.110.235.51
FOO_APP_SERVICE_SERVICE_PORT=80
FOO_APP_SERVICE_SERVICE_PORT_HTTP_ACCOUNT=80
```

<br>

### 完全修飾ドメイン名を使用する場合

#### ▼ Serviceの完全修飾ドメイン名

Kubernetesに採用できる権威DNSサーバー（kube-dns、CoreDNS、HashiCorp Consul、など）は、ServiceのNSレコードを管理し、Serviceの完全修飾ドメイン名で名前解決できるようになる。Podのスケジューリング時に、kubeletはPod内のコンテナの```/etc/resolv.conf```ファイルに権威DNSサーバーのIPアドレスを設定する。Pod内のコンテナは、自身の```/etc/resolv.conf```ファイルでPodの宛先情報を確認し、Podにアウトバウンド通信を送信する。

> ℹ️ 参考：
>
> - https://blog.mosuke.tech/entry/2020/09/09/kuubernetes-dns-test/
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=42

```bash
# Pod内のコンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

# コンテナのresolv.confファイルの中身を確認する
[root@<Pod名>] $ cat /etc/resolv.conf 

nameserver 10.96.0.10 # 権威DNSサーバーのIPアドレス
search default.svc.cluster.local svc.cluster.local cluster.local 
options ndots:5

# CoreDNSを権威DNSサーバーとして使用している場合
$ kubectl get service -n kube-system

NAME       TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
kube-dns   ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   1m0s
```

#### ▼ レコードタイプと完全修飾ドメイン名の関係

Cluster内ネットワーク内の全てのServiceに完全修飾ドメイン名が割り当てられている。レコードタイプごとに、完全修飾ドメイン名が異なる。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#services
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=44

| レコードタイプ | 完全修飾ドメイン名                                           | 名前解決の仕組み                                             | 補足                                                                                                                                                                                                               |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------------ |------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A/AAAAレコード | ```<Service名>.<Namespace名>.svc.cluster.local```        | ・通常のServiceの名前解決ではClusterIPが返却される。<br>・一方でHeadless Serviceの名前解決ではPodのIPアドレスが返却される。 | ・```svc.cluster.local```は省略でき、```<Service名>.<Namespace名>```でも名前解決できる。また、同じNamespace内から通信する場合は、さらに```<Namespace名>```も省略でき、```<Service名>```のみで名前解決できる。<br>ℹ️ 参考：https://ameblo.jp/bakery-diary/entry-12613605860.html |
| SRVレコード    | ```_<ポート名>._<プロトコル>.<Service名>.<Namespace名>.svc.cluster.local``` | 調査中...                                                       | Serviceの```spec.ports.name```キー数だけ、完全修飾ドメイン名が作成される。                                                                                                                                                              |

#### ▼ Serviceに対する名前解決

Pod内のコンテナから宛先のServiceに対して、```nslookup```コマンドの正引きを検証する。Serviceに```metadata.name```キーが設定されている場合、Serviceの完全修飾ドメイン名は、```metadata.name```キーの値になる。完全修飾ドメイン名の設定を要求された時は、設定ミスを防げるため、```metadata.name```キーの値よりも完全修飾ドメイン名の方が推奨である。

```bash
# Pod内のコンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

# Pod内のコンテナから宛先のServiceに対して、正引きの名前解決を行う
[root@<Pod名>:~] $ nslookup <Service名>

Server:         10.96.0.10
Address:        10.96.0.10#53

Name:  <Service名>.<Namespace名>.svc.cluster.local
Address:  10.105.157.184
```

ちなみに、異なるNamespaceに属するServiceの名前解決を行う場合は、Serviceの完全修飾ドメイン名の後にNamespaceを指定する必要がある。

```bash
# Pod内のコンテナから正引きの名前解決を行う。
[root@<Pod名>:~] $ nslookup <Service名>.<Namespace名>
```

> ℹ️ 参考：
>
> - https://blog.mosuke.tech/entry/2020/09/09/kuubernetes-dns-test/
> - https://kubernetes.io/docs/tasks/debug-application-cluster/debug-service/#does-the-service-work-by-dns-name


### 通信方法

#### ▼ 事前確認

（１）Serviceがルーティング先とするポート番号を確認する。

```bash
$ kubectl get service <Service名> -o yaml | grep targetPort:
```

（２）Serviceがルーティング対象とするPodにて、コンテナが待ち受けるポート番号を確認する。注意点として、```spec.containers.ports```キーは単なる仕様であり、記載されていなくとも、コンテナのポートが公開されている可能性がある。

```bash
# 先にmetadata.labelキーから、Serviceのルーティング対象のPodを確認する
$ kubectl get pod -l <名前>=<値> -o wide

$ kubectl get pod <Pod名> -o yaml | grep containerPort:
```

（３）両方のポート番号が一致しているかを確認する。

#### ▼ Serviceを介したアウトバウンド通信の送信

Serviceを介して、宛先のPodにHTTPSプロトコルでアウトバウンド通信を送信する。完全修飾ドメイン名またはIPアドレスを指定できる。

```bash
# Pod内のコンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>:~] $ curl -X GET https://<Serviceの完全修飾ドメイン名/IPアドレス>:<ポート番号>
```

<br>

