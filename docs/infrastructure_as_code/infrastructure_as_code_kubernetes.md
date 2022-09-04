---
title: 【IT技術の知見】Kubernetes
description: Kubernetesの知見を記録しています。
---

# Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Kubernetesの仕組み

### アーキテクチャ

> ℹ️ 参考：https://kubernetes.io/docs/concepts/overview/components/

![kubernetes_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_architecture.png)

<br>

## 01-02. コントロールプレーンコンポーネント（マスターコンポーネント）

### コントロールプレーンコンポーネントとは

『マスターコンポーネント』ともいう。マスターNode上で稼働するコンポーネントのことで、Cluster内のワーカーNode自体と、ワーカーNode内のPodを管理する。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/overview/components/#control-plane-components
> - https://cstoku.dev/posts/2018/k8sdojo-24/
> - https://kubernetes.io/docs/concepts/overview/components/
> - https://thinkit.co.jp/article/17453

<br>

### cloud-controller-manager

#### ▼ cloud-controller-managerとは

クラウドインフラを操作するcloud-controllerを一括で管理する。cloud-controllerを使用して、kube-apiserverがクラウドインフラを操作できるようにする。

![kubernetes_cloud-controller-manager](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cloud-controller-manager.png)

<br>

### etcd（エトセディー）

#### ▼ etcdとは

Cluster内のKubernetesリソースの設定値をキーバリュー型で永続化する。語尾の『```d```』は、分散（distribution）の意味である。リクエストを受信したkube-apiserverは、etcdからKubernetesリソースの情報を参照する。Kubernetesに標準で組み込まれているが、別のOSSである。

> ℹ️ 参考：

> - https://thinkit.co.jp/article/17453
> - https://uzimihsr.github.io/post/2019-11-25-kubernetes-components/

![kubernetes_etcd](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_etcd.png)

<br>

### kube-apiserver

#### ▼ kube-apiserverとは

![kubernetes_kube-apiserver](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-apiserver.png)

kubernetesクライアントにマスターNodeを公開する。クライアントが```kubectl```コマンドを実行すると、マスターNode上のkube-apiserverがコールされ、コマンドに沿ってKubernetesリソースが操作される。存在しないリソース定義をリクエストされると、kube-apiserverはリソース定義を見つけられず、以下のエラーレスポンスを返信する。

```log
the server could not find the requested resource
```

> ℹ️ 参考：

> - https://thinkit.co.jp/article/17453
> - https://vamdemicsystem.black/kubernetes/%E3%80%90macosx%E3%80%91%E3%80%90kubernetes%E3%80%91kubectl-apply%E3%82%92%E3%81%99%E3%82%8B%E3%81%A8%E3%80%8Cfailed-to-download-openapi-the-server-could-not-find-the-requested-resource-falling-bac

#### ▼ 認証

![kubernetes_kube-apiserver_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-apiserver_flow.png)

アプリケーションの認証と同じように、```kubectl```コマンドのクライアントが許可されたクライアントかどうかを検証する。Cluster内部からの場合はServiceAccountで、反対にCluster外部からのクライアントの場合はUserAccountに基づいて、クライアントを認証する。サービスアカウントを作成すると、Bearerトークン（『```***-***-***-***-***-***```』のような形式）がSecretに格納される。クライアントは、```Authorization```ヘッダーにBearerトークンを割り当て、リクエストを送信する必要がある。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/security/controlling-access/#authentication
> - https://knowledge.sakura.ad.jp/21129/
> - https://santakalog.com/2020/02/28/k8s-architecture/

#### ▼ 認可

![kubernetes_kube-apiserver_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-apiserver_flow.png)

アプリケーションの認可と同じように、```kubectl```コマンドのクライアントの権限の範囲（認可スコープ）を検証する。認証されたServiceAccountやUserAccountを、RoleBindingされているRoleに基づいて認可する。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/security/controlling-access/#authorization
> - https://santakalog.com/2020/02/28/k8s-architecture/

#### ▼ ヘルスチェックエンドポイント

kube-apiserverにはヘルスチェック（```healthy```、```liveness```、```readiness```）のエンドポイントがある。```kubectl get```コマンドでヘルスチェックを実行できる。

> ℹ️ 参考：https://kubernetes.io/docs/reference/using-api/health-checks/

```bash
# readinessエンドポイントをコールする。
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

#### ▼ 他のコンポーネントとの通信

kube-apiserverは、クライアントからKubernetesリソースの作成/更新/削除リクエストを受信すると、他のコンポーネントと通信してKubernetesリソースを間接的に操作する。ここでは、Podの作成リクエストが送信された場合の流れを記載する。

![kubernetes_kube-apiserver_communication](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-apiserver_communication.png)

> ℹ️ 参考：

> - https://blog.vpantry.net/2020/05/k8s-5/
> - https://medium.com/jorgeacetozi/kubernetes-master-components-etcd-api-server-controller-manager-and-scheduler-3a0179fc8186

（１）クライアントがPodの作成リクエストを送信する。

（２）kube-apiserverはリクエストを受信し、Podの作成宣言の情報をetcdに永続化する。

（３）しばらくすると、kube-controllerは、kube-apiserverを介してetcdにwatchイベントを送信する。kube-controllerは、etcdと実際のワーカーNodeの間に差分があることを検知し、さらにkube-schedulerにPodのスケジューリングをコールする。

（４）kube-schedulerは、Podの配置対象となるワーカーNodeをフィルタリングとスコアリングによって決定する。

（５）kube-apiserverは、バインディング情報（PodとワーカーNodeの紐付き情報）をetcdに永続化する。

（６）しばらくすると、kube-controllerは、kube-apiserverを介してetcdにwatchイベントを送信する。kube-controllerは、バインディング情報が永続化されたことを検知し、さらにkubeletにPodの作成をコールする。

（７）kubeletは、etcdのバインディング情報に基づいて、コンテナランタイム（例：Docker、Containerd）のデーモンにコンテナの作成をコールする。

（８）コンテナランタイムデーモンは、コンテナを作成する。

（９）kubeletは、Podが作成されたことをkube-apiserverに通知する。

（１０）kube-apiserverは、Podの作成完了をetcdに永続化する。

<br>

### kube-controller-manager

#### ▼ kube-controller-managerとは

kube-controllerを一括で管理する。kube-controllerを使用して、kube-apiserverがKubernetesリソースを操作できるようにする。

> ℹ️ 参考：https://thinkit.co.jp/article/17453

#### ▼ kube-controller

マニフェストファイルとkube-apiserverを仲介し、リソース定義の宣言通りにKubernetesリソースを作成する。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/architecture/controller/
> - https://github.com/kubernetes/kubernetes/tree/master/pkg/controller

#### ▼ reconciliationループ

![kubernetes_reconciliation-loop](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_reconciliation-loop.png)

kube-controller-managerは、kube-controllerを反復的に実行する。これにより、Kubernetesリソースはリソース定義の宣言通りに定期的に修復される。

> ℹ️ 参考：

> - https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work#how_operators_reconcile_kubernetes_cluster_states
> - https://www.oreilly.com/library/view/programming-kubernetes/9781492047094/ch01.html
> - https://speakerdeck.com/yosshi_/korekaraxue-hukubernetesfalsereconciliation-loop?slide=27

<br>

### kube-scheduler

#### ▼ kube-schedulerとは

ワーカーNodeが複数ある場合、ワーカーNodeとPodのスペックを基に、Podを配置するべきワーカーNodeを判定する。

> ℹ️ 参考：https://thinkit.co.jp/article/17453

![kubernetes_kube-scheduler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-scheduler.png)

#### ▼ kube-schedulerの仕組み

![kubernetes_kube-scheduler_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-scheduler_flow.png)

1. フィルタリングを行う。フィルタリングステップでは、まず全てのワーカーNodeの一覧を取得する。その後、Pod作成の条件を満たすワーカーNodeを選定する。
2. スコアリングを行う。スコアリングステップでは、まずフィルタリングで選定されたワーカーNodeに点数をつける。その後、点数に基づいて、Pod作成に最も望ましいワーカーNodeを選定する。この時、Podの作成先のNodeグループが設定されていれば、Nodeグループの中から望ましいものを選定する。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/
> - https://techblog.ap-com.co.jp/entry/2019/06/20/191459
> - https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node%E3%81%AE%E9%9A%94%E9%9B%A2%E3%82%84%E5%88%B6%E9%99%90

#### ▼ descheduler

kube-schedulerは、既存のPodを削除して別のワーカーNodeに再スケジューリングすることはない。そのため、ワーカーNodeが障害が起こり、他のワーカーNodeにPodが退避した後、ワーカーNodeが復旧したとしても、Podが元々のワーカーNodeに戻ることはない。```kubectl rollout restart```コマンドを手動で実行すれば良いが、deschedulerを使用すれば、これを自動化できる。deschedulerをJobとして起動させ、Podを自動的に再スケジュールする。

> ℹ️ 参考：

> - https://torumakabe.github.io/post/k8s_descheduler/
> - https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=8

<br>

## 01-03. Nodeコンポーネント

### Nodeコンポーネントとは

ワーカーNode上で稼働するKubernetesコンポーネントのこと。

> ℹ️ 参考：

> - https://cstoku.dev/posts/2018/k8sdojo-24/
> - https://kubernetes.io/docs/concepts/overview/components/

<br>

### kubelet

#### ▼ kubeletとは

ワーカーNode上で稼働し、コンテナランタイムを操作することにより、コンテナとPodを作成する。また、ワーカーNodeやPodを監視し、メトリクスのデータポイントをkube-apiserverに提供する。

> ℹ️ 参考：https://thinkit.co.jp/article/17453

![kubernetes_kubelet](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kubelet.png)

<br>

### kube-proxy

#### ▼ kube-proxyとは

![kubernetes_kube-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy.png)

クライアントやマスターNode上のkube-apiserverが、ワーカーNode外からPodに通信できるようにする。iptablesで定義されたルーティング先のIPアドレスを、その時点のPodのものに書き換える。これにより、PodのIPアドレスが変わっても、ワーカーNode外部からのインバウンド通信をPodに継続的にルーティングできる。モードごとに、Podの名前解決の方法が異なる。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies
> - https://www.imagazine.co.jp/%e5%ae%9f%e8%b7%b5-kubernetes%e3%80%80%e3%80%80%ef%bd%9e%e3%82%b3%e3%83%b3%e3%83%86%e3%83%8a%e7%ae%a1%e7%90%86%e3%81%ae%e3%82%b9%e3%82%bf%e3%83%b3%e3%83%80%e3%83%bc%e3%83%89%e3%83%84%e3%83%bc%e3%83%ab/

#### ▼ kube-proxyの種類

| モード    | 説明                                                         | 補足                                                         |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| iptables  | ![kubernetes_kube-proxy_iptables](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_iptables.png) | ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/service/#proxy-mode-iptables |
| userspace | ![kubernetes_kube-proxy_userspace](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_userspace.png) | ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/service/#proxy-mode-userspace |
| ipvs      | ![kubernetes_kube-proxy_ipvs](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_ipvs.png) | ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/service/#proxy-mode-ipvs |

#### ▼ その他のプロキシー

ワーカーNode外部からのインバウンド通信をPodにルーティングするためのプロキシーが、他にもいくつかある。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/cluster-administration/proxies/

- ```kubectl proxy```コマンド
- ```minikube tunnel```コマンド
- LoadBalancer

<br>

### コンテナランタイム（コンテナエンジン）

#### ▼ コンテナランタイムとは

イメージのプル、コンテナ作成削除、コンテナ起動停止、などを行う。

> ℹ️ 参考：https://thinkit.co.jp/article/17453

#### ▼ コンテナのライフサイクルフェーズ

コンテナのライフサイクルにはフェーズがある。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-states

| フェーズ名 | 説明                                    |
| --------------- |---------------------------------------|
| Waiting         | RunningフェーズとTerminatedフェーズ以外のフェーズにある。 |
| Running         | コンテナの起動が完了し、実行中である。                   |
| Terminated      | コンテナが正常/異常に停止した。                      |

<br>

### Nodeグループ

#### ▼ Nodeグループとは

同じ設定値（```metadata.labels```キー、CPU、メモリ、など）や同じ役割を持ったNodeのグループのこと。KubernetesにはNodeグループというリソースがなく、グループを宣言的に定義することはできないが、クラウドプロバイダーの機能を使用して、Nodeグループを実現できる。基本的には、Nodeグループは冗長化されたワーカーNodeで構成されており、IDは違えど、ワーカーNode名は全て同じである。Nodeグループをターゲットとするロードバランサーでは、Nodeグループ内で冗長化ワーカーNodeのいずれかに対してルーティングすることになる。

> ℹ️ 参考：

> - https://qiita.com/mumoshu/items/9ee00307d6bbab43edb6
> - https://docs.aws.amazon.com/eks/latest/userguide/autoscaling.html#cluster-autoscaler

#### ▼ Nodeグループの粒度

| Nodeグループ名の例     | 説明                                                         |
| ---------------------- | ------------------------------------------------------------ |
| ```apigateway```       | API Gatewayのアプリケーションのコンテナを配置する。これは単一障害点になりうるため、ワーカーNodeのCPUやメモリを潤沢にしようできるように、他のリソースのコンテナとは別のNodeグループにした方が良い。 |
| ```batch```、```job``` | バッチ処理やジョブ（定期的に実行するように設定されたバッチ処理）のコンテナを配置する。 |
| ```collector```        | ログやメトリクスを収集するリソース（例：Prometheus、Alertmanager、のPod）のコンテナを配置する。 |
| ```ingress```          | ワーカーNodeへのインバウンド通信の入口になるリソース（例：Ingress、IngressGateway）のコンテナを配置する。これは単一障害点になりうるため、ワーカーNodeのCPUやメモリを潤沢にしようできるように、他のリソースのコンテナとは別のNodeグループにした方が良い。 |
| ```mesh```             | サービスメッシュ（例：Istio）のコントロールプレーンのコンテナを稼働させる。これは単一障害点になりうるため、ワーカーNodeのCPUやメモリを潤沢にしようできるように、他のリソースのコンテナとは別のNodeグループにした方が良い。 |
| ```service```          | マイクロサービスのアプリケーションのコンテナを稼働させる。   |

#### ▼ ワーカーNodeのオートスケーリング

KubernetesのAPIにはワーカーNodeのオートスケーリング機能はない（2022/07/20執筆時点）。ただ、cluster-autoscalerアドオンを使用すると、各クラウドプロバイダーのAPIからワーカーNodeのオートスケーリングを実行できるようになる。

> ℹ️ 参考：

> - https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler#cluster-autoscaler
> - https://blog.inductor.me/entry/2021/12/06/165743

<br>

## 02. Kubernetesの操作

### kubernetesクライアント

#### ▼ kubernetesクライアントとは

kubernetesクライアントは、```kubectl```コマンドを使用して、kubernetesマスターAPIをコールできる。

<br>

## 03. Kubernetesリソースとオブジェクト

### Kubernetesリソース

Kubernetes上でアプリケーションを稼働させる概念のこと。

<br>

### Kubernetesオブジェクト

マニフェストファイルによって量産されたKubernetesリソースのインスタンスのこと。

> ℹ️ 参考：https://qiita.com/cvusk/items/773e222e0971a5391a51

<br>

## 03-02. Workloadリソース

### Workloadリソースとは

コンテナの実行に関する機能を提供する。

> ℹ️ 参考：https://thinkit.co.jp/article/13542

<br>

### DaemonSet

#### ▼ DaemonSetとは

ワーカーNode上のPodの個数を維持管理する。Podの負荷に合わせてPodを水平スケーリングしない（HorizontalPodAutoscalerが必要である）。ただしReplicaSetとは異なり、ワーカーNode内でPodを1つだけ維持管理する。ワーカーNodeで1つだけ稼働させる必要のあるプロセス（例：kube-proxy、cni、FluentBit、datadogエージェント、cAdvisorエージェント、Prometheusの一部のExporter、など）のために使用される。こういったプロセスが稼働するコンテナは、ワーカーNode内の全てのコンテナからデータを収集し、可観測性のためのデータセットを整備する。

> ℹ️ 参考：

> - https://thinkit.co.jp/article/13611
> - https://github.com/kubernetes/kops/issues/6527#issue-413870064

#### ▼ Pod数の固定

DaemonSetは、ワーカーNode内でPodを1つだけ維持管理する。そのため、例えばClusterネットワーク内に複数のワーカーNodeが存在していて、いずれかのワーカーNodeが停止したとしても、稼働中のワーカーNode内のPodを増やすことはない。

<br>

### Deployment

#### ▼ Deploymentとは

ReplicaSetを操作し、Clusterネットワーク内のPodのレプリカ数を維持管理する。Podの負荷に合わせてPodを水平スケーリングしない（HorizontalPodAutoscalerが必要である）。ただしStatefulSetとは異なり、ストレートレス（例：appコンテナ）なコンテナを含むPodを扱う。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
> - https://sorarinu.dev/2021/08/kubernetes_01/

#### ▼ Pod数の維持

Deploymentは、Cluster内のPodのレプリカ数を指定された数だけ維持する。そのため、例えばCluster内に複数のワーカーNodeが存在していて、いずれかのワーカーNodeが停止した場合、稼働中のワーカーNode内でレプリカ数を維持するようにPod数を増やす。

> ℹ️ 参考：https://dr-asa.hatenablog.com/entry/2018/04/02/174006

<br>

### Job

#### ▼ Jobとは

複数のPodを作成（SuccessfulCreate）し、指定された数のPodを正常に削除（SuccessfulDelete）させる。デフォルトでは、ログの確認のためにPodは削除されず、Jobが削除されて初めてPodも削除される。```spec.ttlSecondsAfterFinished```キーを使用すると、Podのみを自動削除できるようになる。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/workloads/controllers/job/
> - https://qiita.com/MahoTakara/items/82853097a1911671a704
> - https://dev.appswingby.com/kubernetes/kubernetes-%E3%81%A7-job%E3%82%92%E8%87%AA%E5%8B%95%E5%89%8A%E9%99%A4%E3%81%99%E3%82%8Bttlsecondsafterfinished%E3%81%8Cv1-21%E3%81%A7beta%E3%81%AB%E3%81%AA%E3%81%A3%E3%81%A6%E3%81%84%E3%81%9F%E4%BB%B6/

<br>

### Pod

#### ▼ Podとは

コンテナの最小グループ単位のこと。Podを単位として、コンテナ起動/停止や水平スケールアウト/スケールインを実行する。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/workloads/pods/

**＊例＊**

PHP-FPMコンテナとNginxコンテナを稼働させる場合、これら同じPodに配置する。

![kubernetes_pod_php-fpm_nginx](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_pod_php-fpm_nginx.png)

#### ▼ 例外的なマスターNode上のPod

脆弱性の観点で、デフォルトではマスターNodeにPodはスケジューリングされない。これは、マスターNodeには```node-role.kubernetes.io/master: NoSchedule```が設定されているためである。一方で、ワーカーNodeにはこれがないため、Podを稼働させられる。

> ℹ️ 参考：https://stackoverflow.com/questions/43147941/allow-scheduling-of-pods-on-kubernetes-master

```bash
# マスターNodeの場合
$ kubectl describe nodes <マスターNode名> | grep -i taint
Taints: node-role.kubernetes.io/master:NoSchedule

# ワーカーNodeの場合
$ kubectl describe nodes <ワーカーNode名> | grep -i taint
Taints: <none>
```

ただし、セルフマネージドなマスターNodeを使用している場合に、全てのマスターNodeでこれを解除すれば、Podを起動させられる。

```bash
$ kubectl taint nodes --all node-role.kubernetes.io/master-
```

#### ▼ Podのライフサイクルフェーズとコンディション

Podのライフサイクルにはフェーズがある。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase

| フェーズ名 | 説明                                                   | 補足                                                         |
| ---------- |------------------------------------------------------| ------------------------------------------------------------ |
| Pending    | PodがワーカーNodeにスケジューリングされたが、Pod内の全てのコンテナの起動がまだ完了していない。 |                                                              |
| Running    | Pod内の全てのコンテナの起動が完了し、実行中である。                          | コンテナの起動が完了すればRunningフェーズになるが、コンテナ内でビルトインサーバーを起動するようなアプリケーション（例：フレームワークのビルトインサーバー機能）の場合は、RunningフェーズであってもReadyコンディションではないことに注意する。 |
| Succeed    | Pod内の全てのコンテナの起動が完了し、その後に正常に停止した。                     |                                                              |
| Failed     | Pod内の全てのコンテナの起動が完了し、その後に異常に停止した。                     |                                                              |
| Unknown    | ワーカーNodeとPodの間の通信に異常があり、ワーカーNodeがPodから情報を取得できなかった。   |                                                              |

各フェーズには詳細なコンディションがある。例えばRunningフェーズであっても、Readyコンディションになっていない可能性がある。そのため、Podが正常であると見なすためには、『Runningフェーズ』かつ『Readyコンディション』である必要がある。

> ℹ️ 参考：

> - https://stackoverflow.com/a/59354112
> - https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-conditions

| 各フェーズのコンディション名 | 説明                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| PodScheduled                 | ワーカーNodeへのPodのスケジューリングが完了した。            |
| ContainersReady              | 全てのコンテナの起動が完了し、加えてコンテナ内のアプリケーションやミドルウェアの準備が完了している。 |
| Initialized                  | 全ての```init```コンテナの起動が完了した。                   |
| Ready                        | Pod全体の準備が完了した。                                    |

#### ▼ Podが削除されるまでの流れ

![pod_terminating_process](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/pod_terminating_process.png)

> ℹ️ 参考：

> - https://qiita.com/superbrothers/items/3ac78daba3560ea406b2
> - https://zenn.dev/hhiroshell/articles/kubernetes-graceful-shutdown-experiment

（１）Kubernetesクライアントは、```kubectl```コマンドがを使用して、Podを削除するリクエストをkube-apiserverに送信する。

（２）Podが、削除を開始する。

（３）preStopフックが起動し、```spec.preStop```キーの設定がコンテナで実行される。

（４）kubeletは、コンテナランタイムを経由して、Pod内コンテナにSIGTERMシグナルを送信する。これにより、コンテナは停止する。この時、```spec.terminationGracePeriodSeconds```キーの設定値を過ぎてもコンテナが停止していない場合は、コンテナにSIGKILLシグナルが送信され、削除プロセスは強制完了する。

（５）他のKubernetesリソース（Deployment、Service、ReplicaSets、など）の管理対象から、該当のPodが削除される。

#### ▼ CPUとメモリの割り当て

そのPodに割り当てられたCPUとメモリを、Pod内のコンテナが分け合って使用する。

> ℹ️ 参考：https://qiita.com/jackchuka/items/b82c545a674975e62c04#cpu

| 単位                | 例                                             |
| ------------------- | ---------------------------------------------- |
| ```m```：millicores | ```1```コア = ```1000```ユニット = ```1000```m |
| ```Mi```：mebibyte  | ```1```Mi = ```1.04858```MB                    |

#### ▼ クライアントがPod内のログを閲覧できる仕組み

![kubernetes_pod_logging](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_pod_logging.png)

（１）クライアントが```kubectl logs```コマンドを実行する。

（２）kube-apiserverが、```/logs/pods/<ログへのパス>```エンドポイントにリクエストを送信する。

（３）kubeletはリクエストを受信し、ワーカーNodeの```/var/log```ディレクトリを読み込む。ワーカーNodeの```/var/log/pods/<名前空間>_<ポッド名>_<UID>/container/0.log```ファイルは、Pod内のコンテナの```/var/lib/docker/container/<ID>/<ID>-json.log```ファイルへのシンボリックリンクになっているため、kubeletを経由して、コンテナのログを確認できる。

> ℹ️ 参考：https://www.creationline.com/lab/29281

補足として、DaemonSetとして稼働するFluentdは、ワーカーNodeの```/var/log```ディレクトリを読み込むことにより、Pod内のコンテナのログを収集する。

> ℹ️ 参考：https://note.com/shift_tech/n/n503b32e5cd35



<br>

### ReplicaSet

#### ▼ ReplicaSetとは

ワーカーNode上のPod数を維持管理する。Podの負荷に合わせてPodを水平スケーリングしない（HorizontalPodAutoscalerが必要である）。DaemonSetとは異なり、Podを指定した個数に維持管理できる。ReplicaSetを直接的に操作するのではなく、Deployment使用してこれを行うことが推奨される。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/#replicaset%E3%82%92%E4%BD%BF%E3%81%86%E3%81%A8%E3%81%8D
> - https://thinkit.co.jp/article/13611

<br>

### StatefulSet

#### ▼ StatefulSetとは

ReplicaSetを操作し、Podの個数を維持管理する。Podの負荷に合わせてPodを水平スケーリングしない（HorizontalPodAutoscalerが必要である）。Deploymentとは異なり、ストレートフルなコンテナ（例：dbコンテナ）を含むPodを扱える。Podが削除されてもPersistentVolumeClaimsは削除されないため、新しいPodにも同じPersistentVolumeを継続的にマウントできる。その代わり、StatefulSetの作成後に一部の設定変更が禁止されている。

```bash
The StatefulSet "foo-pod" is invalid: spec: Forbidden: updates to statefulset spec for fields other than 'replicas', 'template', 'updateStrategy' and 'minReadySeconds' are forbidden
```

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#%E5%AE%89%E5%AE%9A%E3%81%97%E3%81%9F%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B8
> - https://sorarinu.dev/2021/08/kubernetes_01/

#### ▼ ライフサイクル

StatefulSetは、DeploymentやReplicaSetとは異なり、同時にPodを作成しない。作成中のPodがReady状態になってから、次のPodを作成し始める。そのためDeploymentやReplicaSetと比べて、全てのPodが揃うのに時間がかかる。

> ℹ️ 参考：https://thinkit.co.jp/article/13611

<br>

## 03-03. Discovery&LBリソース

### Discovery&LBリソースとは

ワーカーNode上のコンテナをワーカーNode外に公開する機能を提供する。

> ℹ️ 参考：https://thinkit.co.jp/article/13542

<br>

### Ingress

#### ▼ Ingressとは

![kubernetes_ingress](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress.png)

IngressコントローラーによってClusterネットワーク外からインバウンド通信を受信し、単一/複数のServiceにルーティングする。Ingressを使用する場合、ルーティング先のIngressは、Cluster IP Serviceとする。NodePort ServiceやLoadBalancer Serviceと同様に、外部からのインバウンド通信を受信する方法の1つである。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/services-networking/ingress/#what-is-ingress
> - https://thinkit.co.jp/article/18263
> - https://chidakiyo.hatenablog.com/entry/2018/09/10/Kubernetes_NodePort_vs_LoadBalancer_vs_Ingress%3F_When_should_I_use_what%3F_%28Kubernetes_NodePort_%E3%81%A8_LoadBalancer_%E3%81%A8_Ingress_%E3%81%AE%E3%81%A9%E3%82%8C%E3%82%92%E4%BD%BF%E3%81%86

#### ▼ ルーティングパラメーター

| ルーティングパラメーター名 |                                                              |
| ------------ | ------------------------------------------------------------ |
| パス         | パスの値に基づいて、Serviceにルーティングする。<br>ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/ingress/#simple-fanout<br>![kubernetes_ingress_path](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress_path.png) |
| ```Host```ヘッダー | ```Host```ヘッダーの値に基づいて、Serviceにルーティングする。<br>ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/ingress/#name-based-virtual-hosting<br>![kubernetes_ingress_host](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress_host.png) |

<br>

### Ingressコントローラー

#### ▼ Ingressコントローラーとは

![kubernetes_ingress-controller](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress-controller.png)

Ingressコントローラーは、Ingressの設定に基づいてClusterネットワーク外からのインバウンド通信を受信し、単一/複数のIngressにルーティングする。Kubernetesの周辺ツール（Prometheus、AlertManager、Grafana、ArgoCD）のダッシュボードを複数人で共有して閲覧する場合には、何らかのアクセス制限を付与したIngressを作成することになる。

> ℹ️ 参考：

> - https://developers.freee.co.jp/entry/kubernetes-ingress-controller
> - https://www.containiq.com/post/kubernetes-ingress
> - https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/

#### ▼ Ingressコントローラーの種類

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/
> - https://www.nginx.com/blog/how-do-i-choose-api-gateway-vs-ingress-controller-vs-service-mesh/

| コントローラー名                                      | 開発環境 | 本番環境 |
| ----------------------------------------------------- | -------- | -------- |
| minikubeアドオン（実体はNginx Ingressコントローラー） | ✅        |         |
| AWS LBコントローラー                                 |         | ✅        |
| GCP CLBコントローラー                                 |         | ✅        |
| Nginx Ingressコントローラー                           | ✅        | ✅        |
| Istio Ingress                                         | ✅        | ✅        |
| Istio Gateway（Ingressとしても使用できる）            | ✅        | ✅        |

#### ▼ SSL証明書の割り当て

![kubernetes_ingress-controller_certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress-controller_certificate.png)

Ingressコントローラーは、Secretに設定されたSSL証明書を参照し、これを内部のロードバランサー（例：Nginx）に渡す。

> ℹ️ 参考：

> - https://blog.sakamo.dev/post/ingress-nginx/
> - https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/https/

#### ▼ Ingressの設定値のバリデーション

Ingressコントローラーは、『```***-controller-admission```』というServiceでwebhookサーバーを公開している。このwebhookサーバーは、新しく追加されたIngressの設定値のバリデーションを実行する。これにより、不正なIngressが稼働することを防止できる。このwebhookサーバーの登録時、まず『```***-create```』というPodが有効期限の長いSSL証明書を持つSecretを作成する。その後、『```***-patch```』というPodがValidatingWebhookConfigurationにこのSSL証明書を設定し、webhookサーバーにSSL証明書が割り当てられる。

> ℹ️ 参考：

> - https://kubernetes.github.io/ingress-nginx/how-it-works/#avoiding-outage-from-wrong-configuration
> - https://github.com/kubernetes/ingress-nginx/tree/main/charts/ingress-nginx#ingress-admission-webhooks
> - https://blog.sakamo.dev/post/ingress-nginx/

<br>

### Service

#### ▼ Serviceとは

Serviceタイプごとに、特定のネットワーク範囲にPodを公開する。マイクロサービスアーキテクチャのコンポーネントである『Service』とは区別する。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/service/

#### ▼ ClusterIP Service

ClusterネットワークのIPアドレスを返却し、Serviceに対するインバウンド通信をPodにルーティングする。ワーカーNode外からのインバウンド通信にIngressを必要とし、Ingressが無いとClusterネットワーク内からのみしかアクセスできないため、より安全である。ClusterネットワークのIPアドレスは、Podの```/etc/resolv.conf ```ファイルに記載されている。Pod内に複数のコンテナがある場合、各コンテナに同じ内容の```/etc/resolv.conf ```ファイルが配置される。デフォルトのタイプである。他のServiceとは異なり、クラウドプロバイダー環境でIngressに相当するLBが必要になるため、クラウドプロバイダーとKubernetesリソースの境界が曖昧になってしまう。

> ℹ️ 参考：

> - https://zenn.dev/suiudou/articles/aa2194b6f53f8f
> - https://thinkit.co.jp/article/18263

```bash
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>] $ cat /etc/resolv.conf 

nameserver *.*.*.* # ClusterネットワークのIPアドレス
search default.svc.cluster.local svc.cluster.local cluster.local 
options ndots:5
```

#### ▼ LoadBalancer Service

ロードバランサーのみからアクセスできるIPアドレスを返却し、Serviceに対するインバウンド通信をPodにルーティングする。ワーカーNode外からのインバウンド通信にIngressを必要とせず、Clusterネットワーク外/内の両方からアクセスできる。本番環境をクラウドインフラ上で稼働させ、AWS ALBからインバウンド通信を受信する場合に使用する。ロードバランサーから各Serviceにインバウンド通信をルーティングすることになるため、通信数が増え、金銭的負担が大きい。ただし、ClusterIP Serviceと比較して、クラウドプロバイダーとKubernetesの境界を明確化できる。

> ℹ️ 参考：

> - https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0
> - https://thinkit.co.jp/article/18263

#### ▼ NodePort Service

ワーカーNodeのIPアドレスを返却し、Serviceの指定したポートに対するインバウンド通信をPodにルーティングする。ワーカーNode外からのインバウンド通信にIngressを必要とせず、Clusterネットワーク外/内の両方からアクセスできる。ワーカーNodeはServiceのIPアドレスを返却するが、Serviceのポート番号と紐づくワーカーNodeのポート番号はデフォルトではランダムであるため、ワーカーNodeのポート番号を固定する必要がある。この時、一つのワーカーNodeのポート番号につき、一つのServiceとしか紐づけられず、Serviceが増えていってしまうため、実際の運用にやや不向きである。ただし、ClusterIP Serviceと比較して、クラウドプロバイダーとKubernetesの境界を明確化できる。

> ℹ️ 参考：

> - https://stackoverflow.com/a/64605782
> - https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0

#### ▼ ExternalName Service

PodのCNAMEを返却し、Serviceに対するインバウンド通信をPodにルーティングする。

> ℹ️ 参考：https://thinkit.co.jp/article/13739

#### ▼ Headless Service

PodのIPアドレスを返却し、Serviceに対するインバウンド通信をPodにルーティングする。Podが複数ある場合は、DNSラウンドロビンのルールでIPアドレスが返却されるため、負荷の高いPodにルーティングされる可能性があり、負荷分散には向いていない。

> ℹ️ 参考：

> - https://thinkit.co.jp/article/13739
> - https://hyoublog.com/2020/05/22/kubernetes-headless-service/

```bash
$ dig <Service名>.<Namespace名>.svc.cluster.local

;; QUESTION SECTION:
;<Service名>.<Namespace名>.svc.cluster.local. IN   A

;; ANSWER SECTION:
<Service名>.<Namespace名>.svc.cluster.local. 30 IN A       10.8.0.30
<Service名>.<Namespace名>.svc.cluster.local. 30 IN A       10.8.1.34
<Service名>.<Namespace名>.svc.cluster.local. 30 IN A       10.8.2.55
```

また、Headless ServiceからStatefulSetにルーティングする場合は、唯一、Podで直接的に名前解決できるようになる。

> ℹ️ 参考：https://thinkit.co.jp/article/13739

```bash
$ dig <Pod名>.<Service名>.<Namespace名>.svc.cluster.local

;; QUESTION SECTION:
;<Pod名>.<Service名>.<Namespace名>.svc.cluster.local. IN A

;; ANSWER SECTION:
<Pod名>.<Service名>.<Namespace名>.svc.cluster.local. 30 IN A 10.8.0.30
```

<br>

## 03-04. Config&Storageリソース

### Config&Storageリソースとは

Kubernetesリソースの設定データ、機密データ、ボリュームに関する機能を提供する。

> ℹ️ 参考：https://thinkit.co.jp/article/13542

<br>

### ConfigMap

#### ▼ ConfigMapとは

データをマップ型で保持できる。改行することにより、設定ファイルも値に格納できる。

<br>

### PersistentVolumeClaim

#### ▼ PersistentVolumeClaimとは

設定された条件に基づいて、作成済みのPersistentVolumeを要求し、指定したKubernetesリソースに割り当てる。

<br>

### Secret

#### ▼ Secretとは

変数を永続化し、Podに出力する。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#uses-for-secrets

#### ▼ コンテナイメージプルのパラメーターとして

Podの起動時に、kubectlコマンドが実行され、コンテナイメージをプルする。Secretに永続化された値を復号化し、```kubectl```コマンドにパラメーターとして出力できる。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#using-imagepullsecrets

#### ▼ コンテナの環境変数として

永続化された値を復号化し、Pod内のコンテナに環境変数として出力できる。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#using-secrets-as-environment-variables

<br>

## 03-05. Clusterリソース

### Clusterリソースとは

セキュリティやクォーターに関する機能を提供する。

> ℹ️ 参考：https://thinkit.co.jp/article/13542

<br>

### Account

#### ▼ Accountとは

Kubernetesに関する実行ユーザーに認証/認可を設定する。

> ℹ️ 参考：

> - https://kubernetes.io/docs/reference/access-authn-authz/authentication/
> - https://tech-blog.cloud-config.jp/2021-12-04-kubernetes-authentication/

| アカウント名         | 説明                                                                                                                   | 補足                                                                                         |
|----------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| ServiceAccount | Kubernetesリソースのプロセスの実行ユーザーに、認証/認可を設定する。認証済みの実行ユーザーのプロセスは、Kubernetes自体と通信する権限を持つ。また、RoleBindingを使用して認可スコープも設定できる。       | Kubernetesリソースの各オブジェクトには自動的にServiceAccountが設定される。認証済みのユーザーに実行されたオブジェクトのみがKubernetesと通信できる。 |
| UserAccount    | Kubernetes自体を操作するクライアントに実行ユーザーに、認証/認可を設定する。認証済みの実行ユーザーのクライアントは、Kubernetes自体を操作する権限を持つ。また、RoleBindingを使用して認可スコープも設定できる。 | アカウント情報は、``` ~/.kube/config/kubeconfig```ファイルにクライアント証明書として定義する必要がある。                       |

<br>

### NetworkPolicy

#### ▼ NetworkPolicyとは

Pod間で通信する場合のインバウンド/アウトバウンド通信の送受信ルールを設定する。

> ℹ️ 参考：

> - https://www.amazon.co.jp/dp/B08FZX8PYW
> - https://qiita.com/dingtianhongjie/items/983417de88db2553f0c2

#### ▼ Ingress

他のPodからの受信するインバウンド通信のルールを設定する。Ingressとは関係がないことに注意する。

#### ▼ Egress

他のPodに送信するアウトバウンド通信のルールを設定する。

<br>

### Node

#### ▼ マスターNode（kubernetesマスター）

kubernetesマスターともいう。コントロールプレーンコンポーネントが稼働する。クライアントが```kubectl```コマンドの実行すると、kube-apiserverがコールされ、コマンドに沿ってワーカーNodeが操作される。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/#kubernetes%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC
> - https://medium.com/easyread/step-by-step-introduction-to-basic-concept-of-kubernetes-e20383bdd118
> - https://qiita.com/baby-degu/items/ce26507bd954621d6dc5

#### ▼ ワーカーNode

ノードコンポーネントが稼働する。Kubernetesの実行時に自動的に作成される。もし手動で作成する場合は、```kubectl```コマンドで```--register-node=false```とする必要がある。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/architecture/nodes/
> - https://kubernetes.io/docs/concepts/architecture/nodes/#manual-node-administration

<br>

### PersistentVolume

#### ▼ PersistentVolumeとは

新しく作成したストレージ領域をPluggableなボリュームとし、これをコンテナにボリュームマウントする。Node上のPod間でボリュームを共有できる。PodがPersistentVolumeを使用するためには、PersistentVolumeClaimにPersistentVolumeを要求させておき、PodでこのPersistentVolumeClaimを指定する必要がある。アプリケーションのディレクトリ名を変更した場合は、PersistentVolumeを再作成しないと、アプリケーション内のディレクトリの読み出しでパスを解決できない場合がある。

> ℹ️ 参考：

> - https://thinkit.co.jp/article/14195

Dockerのボリュームとは独立した機能であることに注意する。

> - https://stackoverflow.com/questions/62312227/docker-volume-and-kubernetes-volume
> - https://stackoverflow.com/questions/53062547/docker-volume-vs-kubernetes-persistent-volume

#### ▼ HostPath（本番環境で非推奨）

Node上に新しく作成したストレージ領域をボリュームとし、これをコンテナにバインドマウントする。機能としては、Volumeの一種であるHostPathと同じである。マルチNodeには対応していないため、本番環境では非推奨である。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes
> - https://thenewstack.io/10-kubernetes-best-practices-you-can-easily-apply-to-your-clusters/

#### ▼ Local（本番環境で推奨）

Node上に新しく作成したストレージ領域をボリュームとし、これをコンテナにバインドマウントする。マルチNodeに対応している（明言されているわけではく、HostPathとの明確な違いがよくわからない）。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/storage/volumes/#local
> - https://qiita.com/sotoiwa/items/09d2f43a35025e7be782#local

<br>

### Role、ClusterRole

#### ▼ Role、ClusterRoleとは

![kubernetes_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_authorization.png)

認可スコープを設定する。

> ℹ️ 参考：

> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html

| ロール名    | 説明                                   | 補足                                                         |
| ----------- | -------------------------------------- | ------------------------------------------------------------ |
| Role        | Namespace内の認可スコープを設定する。   | RoleとRoleBindingは同じNamespaceに属する必要がある。            |
| ClusterRole | Cluster内の認可スコープを設定する。 | ClusterRoleとClusterRoleBindingは同じNamespaceに属する必要がある。 |

<br>

### RoleBinding、ClusterRoleBinding

#### ▼ RoleBinding、ClusterRoleBindingとは

![kubernetes_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_authorization.png)

定義された認可スコープをAccountに紐づける。

> ℹ️ 参考：

> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding
> - https://support.huaweicloud.com/intl/en-us/usermanual-cce/cce_01_0189.html

| バインディング名   | 説明                             | 補足                                                         |
| ------------------ | -------------------------------- | ------------------------------------------------------------ |
| RoleBinding        | RoleをAccountに紐づける。        | RoleとRoleBindingは同じNamespaceに属する必要がある。            |
| ClusterRoleBinding | ClusterRoleをAccountに紐づける。 | ClusterRoleとClusterRoleBindingは同じNamespaceに属する必要がある。 |

<br>

### Volume

#### ▼ Volumeとは

既存（ワーカーNode、NFS、iSCSI、Cephなど）のボリュームをそのままKubernetesのボリュームとして使用する。

> ℹ️ 参考：https://thinkit.co.jp/article/14195

Dockerのボリュームとは独立した機能であることに注意する。

> - https://stackoverflow.com/questions/62312227/docker-volume-and-kubernetes-volume
> - https://stackoverflow.com/questions/53062547/docker-volume-vs-kubernetes-persistent-volume

```bash
# Podに接続する
kubectl exec -it <Pod名> -c <コンテナ名> -- bash

# ストレージを表示する
[root@<Pod名>:/var/www/html] $ df -h

Filesystem      Size  Used Avail Use% Mounted on
overlay          59G   36G   20G  65% /
tmpfs            64M     0   64M   0% /dev
tmpfs           3.9G     0  3.9G   0% /sys/fs/cgroup
/dev/vda1        59G   36G   20G  65% /etc/hosts
shm              64M     0   64M   0% /dev/shm
overlay          59G   36G   20G  65% /var/www/foo # 作成したボリューム
tmpfs           7.8G   12K  7.8G   1% /run/secrets/kubernetes.io/serviceaccount
tmpfs           3.9G     0  3.9G   0% /proc/acpi
tmpfs           3.9G     0  3.9G   0% /sys/firmware
```

#### ▼ HostPath（本番環境で非推奨）

ワーカーNode上の既存のストレージ領域をボリュームとし、コンテナにバインドマウントする。バインドマウントは、ワーカーNodeとPod内コンテナ間で実行され、同一ワーカーNode上のPod間でこのボリュームを共有できる。

> ℹ️ 参考：https://qiita.com/umkyungil/items/218be95f7a1f8d881415

HostPathは非推奨である。

> ℹ️ 参考：https://thenewstack.io/10-kubernetes-best-practices-you-can-easily-apply-to-your-clusters/

```bash
# ワーカーNode内でdockerコマンドを実行
$ docker inspect <コンテナID>
  
    {

        # 〜 中略 〜

        "HostConfig": {
            "Binds": [
                "/data:/var/www/foo",
                "/var/lib/kubelet/pods/*****/volumes/kubernetes.io~projected/kube-api-access-*****:/var/run/secrets/kubernetes.io/serviceaccount:ro",
                "/var/lib/kubelet/pods/*****/etc-hosts:/etc/hosts",
                "/var/lib/kubelet/pods/*****/containers/foo/*****:/dev/termination-log"
            ],
            
            # 〜 中略 〜
        },
        
        # 〜 中略 〜
        
        "Mounts": [
        
            # 〜 中略 〜
            
            {
                "Type": "bind", # バインドマウントが使用されている。
                "Source": "/data",
                "Destination": "/var/www/foo",
                "Mode": "",
                "RW": true,
                "Propagation": "rprivate"
            },

            # 〜 中略 〜
        ]
    }
```

#### ▼ EmptyDir

Podの既存のストレージ領域をボリュームとし、コンテナにボリュームマウントする。そのため、Podが削除されると、このボリュームも同時に削除される。ワーカーNode上のPod間でボリュームを共有できない。

> ℹ️ 参考：https://qiita.com/umkyungil/items/218be95f7a1f8d881415

#### ▼ 外部ボリューム

クラウドプロバイダーやNFSから提供されるストレージ領域を使用したボリュームとし、コンテナにマウントする。

> ℹ️ 参考：https://zenn.dev/suiudou/articles/31ab107f3c2de6#%E2%96%A0kubernetes%E3%81%AE%E3%81%84%E3%82%8D%E3%82%93%E3%81%AA%E3%83%9C%E3%83%AA%E3%83%A5%E3%83%BC%E3%83%A0

<br>

## 03-06. Metadataリソース

### Metadataリソースとは

> ℹ️ 参考：https://thinkit.co.jp/article/13542

<br>

### HorizontalPodAutoscaler

#### ▼ HorizontalPodAutoscalerとは

![horizontal-pod-autoscaler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/horizontal-pod-autoscaler.png)

Podの水平スケーリングを実施する。metrics-serverから取得したPodに関するメトリクス値とターゲット値を比較し、Podをスケールアウト/スケールインさせる。設定されたターゲットを超過しているようであればスケールアウトし、反対に下回っていればスケールインする。HorizontalPodAutoscalerを使用するためには、metrics-serverも別途インストールしておく必要がある。

> ℹ️ 参考：

> - https://www.stacksimplify.com/aws-eks/aws-eks-kubernetes-autoscaling/learn-to-master-horizontal-pod-autoscaling-on-aws-eks/
> - https://dev.classmethod.jp/articles/trying-auto-scaling-eksworkshop/

#### ▼ 最大Pod数の求め方

オートスケーリング時の現在のPod数は、次の計算式で算出される。算出結果に基づいて、スケールアウト/スケールインが実行される。

> ℹ️ 参考：https://speakerdeck.com/oracle4engineer/kubernetes-autoscale-deep-dive?slide=14

```mathematica
(必要な最大Pod数)
= (現在のPod数) x (現在のPodのCPU平均使用率) ÷ (現在のPodのCPU使用率のターゲット値)
```

例えば、『```現在のPod数 = 5```』『```現在のPodのCPU平均使用率 = 90```』『```現在のPodのCPU使用率のターゲット値 = 70```』だとすると、『```必要な最大Pod数 = 7```』となる。算出結果と比較して、現在のPod数不足しているため、スケールアウトが実行される。

<br>

### VerticalPodAutoscaler

#### ▼ VerticalPodAutoscalerとは

Podの垂直スケーリングを実行する。

> ℹ️ 参考：

> - https://ccvanishing.hateblo.jp/entry/2018/10/02/203205
> - https://speakerdeck.com/oracle4engineer/kubernetes-autoscale-deep-dive?slide=8

<br>

## 04. Kubernetesネットワーク

### Nodeネットワーク

#### ▼ Nodeネットワークとは

同じサブネットマスク内にあるワーカーNodeのNIC間を接続するネットワーク。

> ℹ️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=10

![kubernetes_node-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_node-network.png)

<br>

### Clusterネットワーク

#### ▼ Clusterネットワークとは

同じClusterネットワーク内にあるPodの仮想NIC（veth）間を接続するネットワーク。

> ℹ️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=11

![kubernetes_cluster-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cluster-network.png)

<br>

### Serviceネットワーク

#### ▼ Serviceネットワークとは

Podのアウトバウンド通信に割り当てられたホスト名を認識し、そのホスト名を持つServiceまでアウトバウンド通信を送信する。

> ℹ️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=13

![kubernetes_service-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_service-network.png)

<br>

## 04-02. 同じPod内のコンテナ間通信

### 通信経路

同じPod内のコンテナ間で通信するため、Pod内のネットワークのみを経由する。Podごとにネットワークインターフェースが付与され、またIPアドレスが割り当てられる。

> ℹ️ 参考：https://www.tutorialworks.com/kubernetes-pod-communication/#how-do-containers-in-the-same-pod-communicate

<br>

### デバッグ

#### ▼ 疎通確認

同じPod内コンテナ間は『```localhost:<ポート番号>```』で通信でき、以下の様に通信経路をデバッグできる。

```bash
# Pod内コンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>:~] $ curl -X GET http://localhost:<ポート番号>
```

<br>

## 04-03. 異なるPodのコンテナ間通信

### 通信経路

Podの稼働するワーカーNodeが同じ/異なるで経由するネットワークが異なる。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/cluster-administration/networking/

| 条件             | 経由するネットワーク                                         |
| ---------------- | ------------------------------------------------------------ |
| ワーカーNodeが異なる場合 | Nodeネットワーク + Clusterネットワーク + Serviceネットワーク |
| ワーカーNodeが同じ場合   | Clusterネットワーク + Serviceネットワーク                    |

<br>

### デバッグ

#### ▼ 疎通確認

異なるPod内コンテナ間は、Podが紐づくServiceのドメイン名やIPアドレスで通信でき、```kubectl exec```コマンドでコンテナに接続後、通信経路をデバッグできる。

```bash
# Pod内コンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>:~] $ curl -X GET http://<Serviceのドメイン名やIPアドレス>
```

一方で、```kubectl exec```コマンドが運用的に禁止されているような状況もある。そのような状況下で、シングルワーカーNodeの場合は、```kubectl run```コマンドで、```--rm```オプションを有効化しつつ、Clusterネットワーク内にcurlコマンドによるデバッグ用のPodを一時的に新規作成する。マルチワーカーNodeの場合は、（たぶん）名前が一番昇順のワーカーNode上でPodが作成されてしまい、ワーカーNodeを指定できない。そのため、代わりに```kubectl debug```コマンドを使用する。ただし、```kubectl debug```コマンドで作成されたPodは、使用後に手動で削除する必要がある。デバッグの実行環境として、```yauritux/busybox-curl```イメージは、軽量かつ```curl```コマンドと```nslookup```コマンドの両方が使用できるのでおすすめである。

> ℹ️ 参考：

> - https://qiita.com/tkusumi/items/a62c209972bd0d4913fc
> - https://scrapbox.io/jiroshin-knowledge/kubernetes_cluster%E3%81%ABcurl%E3%81%AEPod%E3%82%92%E7%AB%8B%E3%81%A6%E3%81%A6%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A%E3%83%AD%E3%82%B0%E3%82%A4%E3%83%B3%E3%81%99%E3%82%8B%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89

```bash
# シングルワーカーNodeの場合

# curl送信用のコンテナを作成する。
$ kubectl run \
    -n default \
    -it curl \
    --image=yauritux/busybox-curl \
    --rm \
    --restart=Never \
    -- bash

[root@<Pod名>:~] $ curl -X GET http://<Serviceのドメイン名やIPアドレス>
```

```bash
# マルチワーカーNodeの場合

# Podが稼働するワーカーNodeを確認する。
$ kubectl get pods <Pod名> -o wide

# 指定したワーカーNode上で、curl送信用のコンテナを作成する。
$ kubectl debug node/<ワーカーNode名> \
    -n default \
    -it \
    --image=yauritux/busybox-curl

[root@<Pod名>:~] $exit

# 使用後は手動で削除する。
$ kubectl delete -n default node-debugger-*****
```

#### ▼ ポート番号の確認

Serviceがルーティング先とするポート番号を確認する。

```bash
$ kubectl get service <Service名> -o yaml | grep targetPort:
```

Serviceがルーティング対象とするPodにて、コンテナが待ち受けているポート番号を確認する。

```bash
# 先にlabelから、Serviceのルーティング対象のPodを確認する
$ kubectl get pods -l <名前>=<値> -o wide

$ kubectl get pods <Pod名> -o yaml | grep containerPort:
```

両方のポート番号が一致しているかを確認する。

<br>

### 環境変数を使用する場合

#### ▼ 環境変数の設定

Serviceにリクエストを送信するために必要な情報を、環境変数として出力する。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/service/#discovering-services

**＊実装例＊**

foo-app-serviceというServiceを作成した場合の環境変数を示す。

```bash
$ printenv | sort -n

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

### 権威DNSサーバーを使用する場合

#### ▼ 権威DNSサーバーの設定

Cluster内に権威DNSサーバーとしてのKubernetesリソース（CoreDNS、kube-dns、HashiCorp Consul、など）を配置し、Serviceの名前解決を行う。Podを作成すると、kubeletによって、Pod内コンテナの```/etc/resolv.conf```ファイルに権威DNSサーバーのIPアドレスが自動的に設定される。Pod内コンテナが他のコンテナにアウトバウンド通信を送信する場合、自身の```/etc/resolv.conf```ファイルを確認し、権威DNSサーバーによって宛先のコンテナの名前解決を行う。

> ℹ️ 参考：

> - https://blog.mosuke.tech/entry/2020/09/09/kuubernetes-dns-test/
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=42

```bash
# Pod内コンテナに接続する。
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

#### ▼ レコードタイプとドメイン名の関係

Clusterネットワーク内の全てのServiceにDNS名が割り当てられている。レコードタイプごとに、DNS名が異なる。

> ℹ️ 参考：

> - https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#services
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=44

| レコードタイプ | 完全修飾ドメイン名                                           | 名前解決の仕組み                                             | 補足                                                         |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| A/AAAAレコード | ```<Service名>.<Namespace名>.svc.svc.cluster.local```        | ・通常のServiceの名前解決ではClusterIPが返却される。<br>・一方でHeadless Serviceの名前解決ではPodのIPアドレスが返却される。 | ・```svc.cluster.local```は省略可能。<br>・同じNamespace内から通信する場合は、```<Service名>```のみで良い。 |
| SRVレコード    | ```_<ポート名>._<プロトコル>.<Service名>.<Namespace名>.svc.cluster.local``` | 調査中...                                                       | Serviceの```spec.ports.name```キー数だけ、完全修飾ドメイン名が作成される。 |

#### ▼ Serviceに対する名前解決

Pod内コンテナから宛先のServiceに対して、```nslookup```コマンドの正引きを検証する。Serviceに```meta.name```タグが設定されている場合、Serviceのドメイン名は、```meta.name```タグの値になる。ドメイン名の設定を要求された時は、設定ミスを防げるため、```meta.name```タグの値よりも完全修飾ドメイン名の方が推奨である。

```bash
# Pod内コンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

# Pod内コンテナから宛先のServiceに対して、正引きの名前解決を行う
[root@<Pod名>:~] $ nslookup <Service名>

Server:         10.96.0.10
Address:        10.96.0.10#53

Name:  <Service名>.<Namespace名>.svc.cluster.local
Address:  10.105.157.184
```

ちなみに、異なるNamespaceに属するServiceの名前解決を行う場合は、Serviceのドメイン名の後にNamespaceを指定する必要がある。

```bash
# Pod内コンテナから正引きの名前解決を行う。
[root@<Pod名>:~] $ nslookup <Service名>.<Namespace名>
```

> ℹ️ 参考：

> - https://blog.mosuke.tech/entry/2020/09/09/kuubernetes-dns-test/
> - https://kubernetes.io/docs/tasks/debug-application-cluster/debug-service/#does-the-service-work-by-dns-name

<br>

## 05. 証明書

![kubernetes_certificates](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_certificates.png)

| 設置場所                      | 種類               | 説明                                                         |
| ----------------------------- | ------------------ | ------------------------------------------------------------ |
| kube-apiserver                | SSL証明書          | kube-apiserverが各コンポーネントからHTTPリクエストを受信するため。 |
| kube-apiserver                | クライアント証明書 | kube-apiserverが、kubeletにHTTPSリクエストを送信するため。   |
| kube-apiserver                | クライアント証明書 | kube-apiserverが、etcdにHTTPSリクエストを送信するため。      |
| ```kubectl```コマンドのクライアント | クライアント証明書 | ```kubectl```コマンドのクライアントが、kube-apiserverにHTTPSリクエストを送信するため。 |
| kubelet                       | クライアント証明書 | kubeletが、kube-apiserverを認証するため。                    |
| kube-controller-manager               | クライアント証明書 | kube-controller-managerがkube-apiserverにHTTPリクエストを送信するため。証明書とは別に、```kubeconfig```ファイルも必要になる。 |
| kube-scheduler                | クライアント証明書 | kube-schedulerがkube-apiserverにHTTPリクエストを送信するため。証明書とは別に、```kubeconfig```ファイルも必要になる。 |
| front-proxy                   | クライアント証明書 |                                                              |
|                               | SSL証明書          |                                                              |

> ℹ️ 参考：

> - https://qiita.com/nsawa/items/4f11ac89707aad2c3d4a#tls%E8%A8%BC%E6%98%8E%E6%9B%B8%E3%81%AF%E3%81%A9%E3%81%93%E3%81%A7%E4%BD%BF%E3%82%8F%E3%82%8C%E3%81%A6%E3%81%84%E3%82%8B%E3%81%8B
> - https://kubernetes.io/docs/setup/best-practices/certificates/#all-certificates



