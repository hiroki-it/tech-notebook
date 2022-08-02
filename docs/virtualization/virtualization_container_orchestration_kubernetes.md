---
title: 【IT技術の知見】Kubernetes＠仮想化
description: Kubernetes＠仮想化の知見を記録しています。
---

# Kubernetes＠仮想化

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Kubernetesの仕組み

### アーキテクチャ

ℹ️ 参考：https://kubernetes.io/docs/concepts/overview/components/

![kubernetes_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_architecture.png)

<br>

### IaC

KubernetesのIaCについては、以下のリンクを参考にせよ。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_container_kubernetes_resource_definition.html

<br>

## 01-02. コントロールプレーンコンポーネント（マスターコンポーネント）

### コントロールプレーンコンポーネントとは

『マスターコンポーネント』ともいう。マスターNode上で稼働するコンポーネントのことで、Cluster内のワーカーNode自体と、ワーカーNode内のPodを管理する。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/overview/components/#control-plane-components
- https://cstoku.dev/posts/2018/k8sdojo-24/
- https://kubernetes.io/docs/concepts/overview/components/
- https://thinkit.co.jp/article/17453

<br>

### cloud-controller-manager

#### ▼ cloud-controller-managerとは

クラウドインフラを操作するcloud-controllerを一括で管理する。cloud-controllerを使用して、kube-apiserverがクラウドインフラを操作できるようにする。

![kubernetes_cloud-controller-manager](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cloud-controller-manager.png)

<br>

### etcd

#### ▼ etcdとは

Clusterの様々な設定値を保持し、冗長化されたKubernetesリソース間にこれを共有する。Kubernetesに標準で組み込まれているが、別のOSSである。

ℹ️ 参考：

- https://thinkit.co.jp/article/17453
- https://landscape.cncf.io/?selected=etcd

![kubernetes_etcd](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_etcd.png)

<br>

### kube-apiserver

#### ▼ kube-apiserverとは

![kubernetes_kube-apiserver](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-apiserver.png)

kubernetesクライアントにkueneretes-APIを公開する。クライアントが```kubectl```コマンドを実行すると、kube-apiserverがコールされ、コマンドに沿ってKubernetesリソースが操作される。何らかの理由でkubernetesクライアントのリクエストのパラメーターと、kube-apiserverのエンドポイントの仕様が合致しないと、kube-apiserverのバリデーションが失敗し、以下のようなエラーログが返却される。

```
the server could not find the requested resource
```

ℹ️ 参考：

- https://thinkit.co.jp/article/17453
- https://vamdemicsystem.black/kubernetes/%E3%80%90macosx%E3%80%91%E3%80%90kubernetes%E3%80%91kubectl-apply%E3%82%92%E3%81%99%E3%82%8B%E3%81%A8%E3%80%8Cfailed-to-download-openapi-the-server-could-not-find-the-requested-resource-falling-bac

#### ▼ ヘルスチェックエンドポイント

kube-apiserverにはヘルスチェック（```healthy```、```liveness```、```readiness```）のエンドポイントがある。```kubectl get```コマンドでヘルスチェックを実行できる。

ℹ️ 参考：https://kubernetes.io/docs/reference/using-api/health-checks/

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

<br>

### kube-controller-manager

#### ▼ kube-controller-managerとは

kube-controlerを一括で管理する。kube-controlerを使用して、kube-apiserverがKubernetesリソースを操作できるようにする。

ℹ️ 参考：https://thinkit.co.jp/article/17453

#### ▼ kube-controller

マニフェストファイルとKubernetes-APIを仲介し、マニフェストファイルの宣言通りにKubernetesリソースを作成する。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/architecture/controller/
- https://github.com/kubernetes/kubernetes/tree/master/pkg/controller

#### ▼ reconciliationループ

![kubernetes_reconciliation-loop](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_reconciliation-loop.png)

kube-controller-managerは、kube-controllerを定期的に実行し、マニフェストファイルの宣言通りにKubernetesリソースを修復する。

ℹ️ 参考：

- https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work#how_operators_reconcile_kubernetes_cluster_states
- https://www.oreilly.com/library/view/programming-kubernetes/9781492047094/ch01.html
- https://speakerdeck.com/yosshi_/korekaraxue-hukubernetesfalsereconciliation-loop?slide=27

<br>

### kube-scheduler

#### ▼ kube-schedulerとは

ワーカーNodeが複数ある場合に、ワーカーNodeとPodのスペックを基に、Podを配置するべきNodeを判定する。

ℹ️ 参考：https://thinkit.co.jp/article/17453

![kubernetes_kube-scheduler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-scheduler.png)

#### ▼ kube-schedulerの仕組み

![kubernetes_kube-scheduler_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-scheduler_flow.png)

1. フィルタリングを行う。フィルタリングステップでは、まず全てのワーカーNodeの一覧を取得する。その後、Pod作成の条件を満たすNodeを選定する。
2. スコアリングを行う。スコアリングステップでは、まずフィルタリングで選定されたワーカーNodeに点数をつける。その後、点数に基づいて、Pod作成に最も望ましいワーカーNodeを選定する。この時、Podの作成先のNodeグループが設定されていれば、Nodeグループの中から望ましいものを選定する。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/
- https://techblog.ap-com.co.jp/entry/2019/06/20/191459
- https://kubernetes.io/ja/docs/concepts/scheduling-eviction/assign-pod-node/#node%E3%81%AE%E9%9A%94%E9%9B%A2%E3%82%84%E5%88%B6%E9%99%90

<br>

## 01-03. Nodeコンポーネント

### Nodeコンポーネントとは

ワーカーNode上で稼働するKubernetesコンポーネントのこと。

ℹ️ 参考：

- https://cstoku.dev/posts/2018/k8sdojo-24/
- https://kubernetes.io/docs/concepts/overview/components/

<br>

### kubelet

#### ▼ kubeletとは

ワーカーNode上で稼働し、コンテナランタイムを操作することにより、Podを作成する。また、ワーカーNodeやPodを監視し、メトリクスのデータポイントをkube-apiserverに提供する。

ℹ️ 参考：https://thinkit.co.jp/article/17453

![kubernetes_kubelet](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kubelet.png)

<br>

### kube-proxy

#### ▼ kube-proxyとは

![kubernetes_kube-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy.png)

iptablesのルールで定義されたルーティング先のIPアドレスを、その時点のPodのものに書き換える。これにより、PodのIPアドレスが変わっても、ワーカーNode外部からのインバウンド通信をPodに継続的にルーティングできる。モードごとに、Podの名前解決の方法が異なる。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies
- https://www.imagazine.co.jp/%e5%ae%9f%e8%b7%b5-kubernetes%e3%80%80%e3%80%80%ef%bd%9e%e3%82%b3%e3%83%b3%e3%83%86%e3%83%8a%e7%ae%a1%e7%90%86%e3%81%ae%e3%82%b9%e3%82%bf%e3%83%b3%e3%83%80%e3%83%bc%e3%83%89%e3%83%84%e3%83%bc%e3%83%ab/

#### ▼ kube-proxyの種類

| モード    | 説明                                                         | 補足                                                         |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| iptables  | ![kubernetes_kube-proxy_iptables](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_iptables.png) | ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/service/#proxy-mode-iptables |
| userspace | ![kubernetes_kube-proxy_userspace](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_userspace.png) | ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/service/#proxy-mode-userspace |
| ipvs      | ![kubernetes_kube-proxy_ipvs](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_ipvs.png) | ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/service/#proxy-mode-ipvs |

#### ▼ その他のプロキシー

ワーカーNode外部からのインバウンド通信をPodにルーティングするためのプロキシーが、他にもいくつかある。

ℹ️ 参考：https://kubernetes.io/docs/concepts/cluster-administration/proxies/

- ```kubectl proxy```コマンド
- ```minikube tunnel```コマンド
- LoadBalancer

<br>

### コンテナランタイム（コンテナエンジン）

#### ▼ コンテナランタイムとは

イメージのプル、コンテナ作成削除、コンテナ起動停止、などを行う。

ℹ️ 参考：https://thinkit.co.jp/article/17453

<br>

### Nodeグループ

#### ▼ Nodeグループとは

同じ設定値（```metadata.labels```キー、CPU、メモリ、など）や同じ役割を持ったNodeのグループのこと。KubernetesにはNodeグループというリソースがなく、グループを宣言的に定義することはできないが、クラウドプロバイダーの機能を使用して、Nodeグループを実現できる。基本的には、Nodeグループは冗長化されたNodeで構成されており、IDは違えど、Node名は全て同じである。Nodeグループをターゲットとするロードバランサーでは、Nodeグループ内で冗長化Nodeのいずれかに対してルーティングすることになる。

ℹ️ 参考：

- https://qiita.com/mumoshu/items/9ee00307d6bbab43edb6
- https://docs.aws.amazon.com/eks/latest/userguide/autoscaling.html#cluster-autoscaler

#### ▼ Nodeのオートスケーリング

20220720時点で、KubernetesのAPIにはNodeのオートスケーリング機能はない。ただ、cluster-autoscalerアドオンを使用すると、各クラウドプロバイダーのAPIからNodeのオートスケーリングを実行できるようになる。

ℹ️ 参考：

- https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler#cluster-autoscaler
- https://blog.inductor.me/entry/2021/12/06/165743

<br>

## 02. Kubernetesの操作

### kubernetesクライアント

#### ▼ kubernetesクライアントとは

kubernetesクライアントは、```kubectl```コマンドを使用して、kubernetesマスターAPIをコールできる。

<br>

## 03. Kubernetesリソースとオブジェクト

### Kubernetesリソース

Kubernetes上でアプリケーションを稼働させる概念のこと。Kubernetesリソースは、IaCによってマニフェストファイルで定義される。マニフェストファイルについては、以下のリンクを参考にせよ。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_container_kubernetes_resource_definition.html

<br>

### Kubernetesオブジェクト

マニフェストファイルによって量産されたKubernetesリソースのインスタンスのこと。

ℹ️ 参考：https://qiita.com/cvusk/items/773e222e0971a5391a51

<br>

## 03-02. Workloadリソース

### Workloadリソースとは

コンテナの実行に関する機能を提供する。

ℹ️ 参考：https://thinkit.co.jp/article/13542

<br>

### DaemonSet

#### ▼ DaemonSetとは

ワーカーNode上のPodの個数を維持管理する。ただしReplicaSetとは異なり、ワーカーNode内でPodを1つだけ維持管理する。ワーカーNodeで1つだけ稼働させる必要のあるプロセス（FluentBit、datadogエージェント、cAdvisorエージェントなどのデータ収集プロセス）のために使用される。こういったプロセスが稼働するコンテナは、ワーカーNode内の全てのコンテナからデータを収集し、可観測性のためのデータセットを整備する。

ℹ️ 参考：https://thinkit.co.jp/article/13611

#### ▼ Pod数の固定

DaemonSetは、ワーカーNode内でPodを1つだけ維持管理する。そのため、例えばClusterネットワーク内に複数のNodeが存在していて、いずれかのNodeが停止したとしても、稼働中のNode内のPodを増やすことはない。

<br>

### Deployment

#### ▼ Deploymentとは

ReplicaSetを操作し、新しいPodをapplyする。また、ワーカーNodeのCPUやメモリの使用率に合わせて、Clusterネットワーク内のPodのレプリカ数を維持管理する。ただしStatefulSetとは異なり、ストレートレス（例：appコンテナ）なコンテナを含むPodを扱う。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- https://sorarinu.dev/2021/08/kubernetes_01/

#### ▼ Pod数の維持

Deploymentは、Cluster内のPodのレプリカ数を指定された数だけ維持する。そのため、例えばCluster内に複数のNodeが存在していて、いずれかのNodeが停止した場合、稼働中のNode内でレプリカ数を維持するようにPod数を増やす。

ℹ️ 参考：https://dr-asa.hatenablog.com/entry/2018/04/02/174006

<br>

### Job

#### ▼ Jobとは

複数のPodを作成（SuccessfulCreate）し、指定された数のPodを正常に終了（SuccessfulDelete）させる。デフォルトでは、ログの確認のためにPodは削除されず、Jobが削除されて初めてPodも削除される。```spec.ttlSecondsAfterFinished```キーを使用すると、Podのみを自動削除できるようになる。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/workloads/controllers/job/
- https://qiita.com/MahoTakara/items/82853097a1911671a704
- https://dev.appswingby.com/kubernetes/kubernetes-%E3%81%A7-job%E3%82%92%E8%87%AA%E5%8B%95%E5%89%8A%E9%99%A4%E3%81%99%E3%82%8Bttlsecondsafterfinished%E3%81%8Cv1-21%E3%81%A7beta%E3%81%AB%E3%81%AA%E3%81%A3%E3%81%A6%E3%81%84%E3%81%9F%E4%BB%B6/

<br>

### Pod

#### ▼ Podとは

コンテナの最小グループ単位のこと。Podを単位として、コンテナ起動/停止や水平スケールイン/スケールアウトを実行する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/workloads/pods/

**＊例＊**

PHP-FPMコンテナとNginxコンテナを稼働させる場合、これら同じPodに配置する。

![kubernetes_pod_php-fpm_nginx](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_pod_php-fpm_nginx.png)

#### ▼ リソースの単位

ℹ️ 参考：https://qiita.com/jackchuka/items/b82c545a674975e62c04#cpu

| 単位                | 例                                             |
| ------------------- | ---------------------------------------------- |
| ```m```：millicores | ```1```コア = ```1000```ユニット = ```1000```m |
| ```Mi```：mebibyte  | ```1```Mi = ```1.04858```MB                    |

#### ▼ Podが終了するまでの流れ

![pod_terminating_process](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/pod_terminating_process.png)

ℹ️ 参考：

- https://qiita.com/superbrothers/items/3ac78daba3560ea406b2
- https://zenn.dev/hhiroshell/articles/kubernetes-graceful-shutdown-experiment

（１）Kubernetesクライアントは、```kubectl```コマンドがを使用して、Podを削除するリクエストをkube-apiserverに送信する。または、

（２）Podが、終了を開始する。

（３）preStopフックが起動し、```spec.preStop```キーの設定がコンテナで実行される。

（４）kubeletは、コンテナランタイムを経由して、Pod内コンテナにSIGTERMシグナルを送信する。これにより、コンテナは終了する。この時、```spec.terminationGracePeriodSeconds```キーの設定値を過ぎてもコンテナが終了していない場合は、コンテナにSIGKILLシグナルが送信され、削除プロセスは強制完了する。

（５）他のKubernetesリソース（Deployment、Service、ReplicaSets、など）の管理対象から、該当のPodが削除される。

<br>

### ReplicaSet

#### ▼ ReplicaSetとは

ワーカーNode上のPod数を維持管理する。ただしDaemonSetとは異なり、Podを指定した個数に維持管理できる。ワーカーNodeのCPUやメモリの使用率に合わせて、Podを動的に増減させる。ReplicaSetを直接的に操作するのではなく、Deployment使用してこれを行うことが推奨される。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/#replicaset%E3%82%92%E4%BD%BF%E3%81%86%E3%81%A8%E3%81%8D
- https://thinkit.co.jp/article/13611

<br>

### StatefulSet

#### ▼ StatefulSetとは

ReplicaSetを操作し、ワーカーNodeのCPUやメモリの使用率に合わせて、Podの個数を維持管理する。ただしDeploymentとは異なり、ストレートフルなコンテナ（例：dbコンテナ）を含むPodを扱える。Podが削除されてもPersistentVolumeClaimsは削除されないため、新しいPodにも同じPersistentVolumeを継続的にマウントできる。その代わり、StatefulSetの作成後に一部の設定変更が禁止されている。

```bash
The StatefulSet "foo-pod" is invalid: spec: Forbidden: updates to statefulset spec for fields other than 'replicas', 'template', 'updateStrategy' and 'minReadySeconds' are forbidden
```

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#%E5%AE%89%E5%AE%9A%E3%81%97%E3%81%9F%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B8
- https://sorarinu.dev/2021/08/kubernetes_01/

<br>

## 03-03. Discovery&LBリソース

### Discovery&LBリソースとは

ワーカーNode上のコンテナをNode外に公開する機能を提供する。

ℹ️ 参考：https://thinkit.co.jp/article/13542

<br>

### Ingress

#### ▼ Ingressとは

![kubernetes_ingress](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress.png)

IngressコントローラーによってClusterネットワーク外からインバウンド通信を受信し、単一/複数のServiceにルーティングする。Ingressを使用する場合、ルーティング先のIngressは、Cluster IP Serviceとする。NodePort ServiceやLoadBalancer Serviceと同様に、外部からのインバウンド通信を受信する方法の1つである。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/services-networking/ingress/#what-is-ingress
- https://thinkit.co.jp/article/18263
- https://chidakiyo.hatenablog.com/entry/2018/09/10/Kubernetes_NodePort_vs_LoadBalancer_vs_Ingress%3F_When_should_I_use_what%3F_%28Kubernetes_NodePort_%E3%81%A8_LoadBalancer_%E3%81%A8_Ingress_%E3%81%AE%E3%81%A9%E3%82%8C%E3%82%92%E4%BD%BF%E3%81%86

#### ▼ 使用例

| パラメーター |                                                              |
| ------------ | ------------------------------------------------------------ |
| パス         | パスの値に基づいて、Serviceにルーティングする。<br>ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/ingress/#simple-fanout<br>![kubernetes_ingress_path](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress_path.png) |
| ```Host```ヘッダー | ```Host```ヘッダーの値に基づいて、Serviceにルーティングする。<br>ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/ingress/#name-based-virtual-hosting<br>![kubernetes_ingress_host](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress_host.png) |

#### ▼ Ingressコントローラー

![kubernetes_ingress-controller](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress-controller.png)

Ingressの設定に基づいてClusterネットワーク外からのインバウンド通信を受信し、単一/複数のIngressにルーティングする。Kubernetesの周辺ツール（Prometheus、AlertManager、Grafana、ArgoCD）のダッシュボードを複数人で共有して閲覧する場合には、何らかのアクセス制限を付与したIngressを作成することになる。

ℹ️ 参考：

- https://developers.freee.co.jp/entry/kubernetes-ingress-controller
- https://www.containiq.com/post/kubernetes-ingress
- https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/

#### ▼ Ingressコントローラーの種類

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/
- https://www.nginx.com/blog/how-do-i-choose-api-gateway-vs-ingress-controller-vs-service-mesh/

| コントローラー名                                      | 開発環境 | 本番環境 |
| ----------------------------------------------------- | -------- | -------- |
| minikubeアドオン（実体はNginx Ingressコントローラー） | ✅        |         |
| AWS LBコントローラー                                 |         | ✅        |
| GCP CLBコントローラー                                 |         | ✅        |
| Nginx Ingressコントローラー                           | ✅        | ✅        |
| Istio Ingress                                         | ✅        | ✅        |
| Istio Gateway（Ingressとしても使用できる）            | ✅        | ✅        |

<br>

### Service

#### ▼ Serviceとは

Serviceタイプごとに、特定のネットワーク範囲にPodを公開する。マイクロサービスアーキテクチャのコンポーネントである『Service』とは区別する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/service/

#### ▼ ClusterIP Service

ClusterネットワークのIPアドレスを返却し、Serviceに対するインバウンド通信をPodにルーティングする。Clusterネットワーク内からのみアクセスできる。ClusterネットワークのIPアドレスは、Podの```/etc/resolv.conf ```ファイルに記載されている。Pod内に複数のコンテナがある場合、各コンテナに同じ内容の```/etc/resolv.conf ```ファイルが配置される。デフォルトのタイプである。

ℹ️ 参考：

- https://zenn.dev/suiudou/articles/aa2194b6f53f8f
- https://thinkit.co.jp/article/18263

```bash
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>] $ cat /etc/resolv.conf 

nameserver *.*.*.* # ClusterネットワークのIPアドレス
search default.svc.cluster.local svc.cluster.local cluster.local 
options ndots:5
```

#### ▼ LoadBalancer Service

ロードバランサーのみからアクセスできるIPアドレスを返却し、Serviceに対するインバウンド通信をPodにルーティングする。Clusterネットワーク外/内の両方からアクセスできる。本番環境をクラウドインフラ上で稼働させ、AWS ALBからインバウンド通信を受信する場合に使用する。ロードバランサーから各Serviceにインバウンド通信をルーティングすることになるため、通信数が増え、金銭的負担が大きい。

ℹ️ 参考：

- https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0
- https://thinkit.co.jp/article/18263

#### ▼ NodePort Service

NodeのIPアドレスを返却し、Serviceの指定したポートに対するインバウンド通信をPodにルーティングする。Clusterネットワーク外/内の両方からアクセスできる。1つのポートから1つのServiceにしかルーティングできない。ServiceNodeのIPアドレスは別に確認する必要があり、NodeのIPアドレスが変わるたびに、これに合わせて他の設定を変更しなければならず、本番環境には向いていない。AWSのAurora RDSのClusterエンドポイントには、NodePortの概念が取り入れられている。

ℹ️ 参考：

- https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0
- https://thinkit.co.jp/article/18263

#### ▼ ExternalName Service

PodのCNAMEを返却し、Serviceに対するインバウンド通信をPodにルーティングする。

ℹ️ 参考：https://thinkit.co.jp/article/13739

#### ▼ Headless Service

PodのIPアドレスを返却し、Serviceに対するインバウンド通信をPodにルーティングする。Podが複数ある場合は、DNSラウンドロビンのルールでIPアドレスが返却されるため、負荷の高いPodにルーティングされる可能性があり、負荷分散には向いていない。

ℹ️ 参考：

- https://thinkit.co.jp/article/13739
- https://hyoublog.com/2020/05/22/kubernetes-headless-service/

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

ℹ️ 参考：https://thinkit.co.jp/article/13739

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

ℹ️ 参考：https://thinkit.co.jp/article/13542

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

セキュリティに関するデータを管理し、コンテナに選択的に提供する。

#### ▼ コンテナの環境変数として

機密性の高い値を暗号化した状態で管理し、復号化した上で、環境変数としてPodに出力する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#using-secrets-as-environment-variables

<br>

## 03-05. Clusterリソース

### Clusterリソースとは

セキュリティやクォーターに関する機能を提供する。

ℹ️ 参考：https://thinkit.co.jp/article/13542

<br>

### Account

#### ▼ Accountとは

Kubernetesに関する実行ユーザーに認証認可を設定する。

ℹ️ 参考：

- https://kubernetes.io/docs/reference/access-authn-authz/authentication/
- https://tech-blog.cloud-config.jp/2021-12-04-kubernetes-authentication/

| アカウント名         | 説明                                                                                                                   | 補足                                                                                         |
|----------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| ServiceAccount | Kubernetesリソースのプロセスの実行ユーザーに、認証認可を設定する。認証済みの実行ユーザーのプロセスは、Kubernetes自体と通信する権限を持つ。また、RoleBindingを使用して認可スコープも設定できる。       | Kubernetesリソースの各オブジェクトには自動的にServiceAccountが設定される。認証済みのユーザーに実行されたオブジェクトのみがKubernetesと通信できる。 |
| UserAccount    | Kubernetes自体を操作するクライアントに実行ユーザーに、認証認可を設定する。認証済みの実行ユーザーのクライアントは、Kubernetes自体を操作する権限を持つ。また、RoleBindingを使用して認可スコープも設定できる。 | アカウント情報は、``` ~/.kube/config/kubeconfig```ファイルにクライアント証明書として定義する必要がある。                       |

<br>

### NetworkPolicy

#### ▼ NetworkPolicyとは

Pod間で通信する場合のインバウンド/アウトバウンド通信の送受信ルールを設定する。

ℹ️ 参考：

- https://www.amazon.co.jp/dp/B08FZX8PYW
- https://qiita.com/dingtianhongjie/items/983417de88db2553f0c2

#### ▼ Ingress

他のPodからの受信するインバウンド通信のルールを設定する。Ingressとは関係がないことに注意する。

#### ▼ Egress

他のPodに送信するアウトバウンド通信のルールを設定する。

<br>

### Node

#### ▼ マスターNode（kubernetesマスター）

kubernetesマスターともいう。コントロールプレーンコンポーネントが稼働する。クライアントが```kubectl```コマンドの実行すると、kube-apiserverがコールされ、コマンドに沿ってワーカーNodeが操作される。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/#kubernetes%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC
- https://medium.com/easyread/step-by-step-introduction-to-basic-concept-of-kubernetes-e20383bdd118
- https://qiita.com/baby-degu/items/ce26507bd954621d6dc5

#### ▼ ワーカーNode

ノードコンポーネントが稼働する。Kubernetesの実行時に自動的に作成される。もし手動で作成する場合は、```kubectl```コマンドで```--register-node=false```とする必要がある。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/architecture/nodes/
- https://kubernetes.io/docs/concepts/architecture/nodes/#manual-node-administration

<br>

### PersistentVolume

#### ▼ PersistentVolumeとは

新しく作成したストレージ領域をPluggableなボリュームとし、これをコンテナにボリュームマウントする。Node上のPod間でボリュームを共有できる。PodがPersistentVolumeを使用するためには、PersistentVolumeClaimにPersistentVolumeを要求させておき、PodでこのPersistentVolumeClaimを指定する必要がある。アプリケーションのディレクトリ名を変更した場合は、PersistentVolumeを再作成しないと、アプリケーション内のディレクトリの読み出しでパスを解決できない場合がある。

ℹ️ 参考：

- https://thinkit.co.jp/article/14195

Dockerのボリュームとは独立した機能であることに注意する。

- https://stackoverflow.com/questions/62312227/docker-volume-and-kubernetes-volume
- https://stackoverflow.com/questions/53062547/docker-volume-vs-kubernetes-persistent-volume

#### ▼ HostPath（本番環境で非推奨）

Node上に新しく作成したストレージ領域をボリュームとし、これをコンテナにバインドマウントする。機能としては、Volumeの一種であるHostPathと同じである。マルチNodeには対応していないため、本番環境では非推奨である。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes
- https://thenewstack.io/10-kubernetes-best-practices-you-can-easily-apply-to-your-clusters/

#### ▼ Local（本番環境で推奨）

Node上に新しく作成したストレージ領域をボリュームとし、これをコンテナにバインドマウントする。マルチNodeに対応している（明言されているわけではく、HostPathとの明確な違いがよくわからない）。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/storage/volumes/#local
- https://qiita.com/sotoiwa/items/09d2f43a35025e7be782#local

<br>

### Role、ClusterRole

#### ▼ Role、ClusterRoleとは

認可スコープを設定する。

ℹ️ 参考：https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole

| ロール名    | 説明                                   | 補足                                                         |
| ----------- | -------------------------------------- | ------------------------------------------------------------ |
| Role        | Namespace内の認可スコープを設定する。   | RoleとRoleBindingは同じNamespaceに属する必要がある。            |
| ClusterRole | Cluster内の認可スコープを設定する。 | ClusterRoleとClusterRoleBindingは同じNamespaceに属する必要がある。 |

<br>

### RoleBinding、ClusterRoleBinding

#### ▼ RoleBinding、ClusterRoleBindingとは

定義された認可スコープをAccountに紐づける。

ℹ️ 参考：https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding

| バインディング名   | 説明                             | 補足                                                         |
| ------------------ | -------------------------------- | ------------------------------------------------------------ |
| RoleBinding        | RoleをAccountに紐づける。        | RoleとRoleBindingは同じNamespaceに属する必要がある。            |
| ClusterRoleBinding | ClusterRoleをAccountに紐づける。 | ClusterRoleとClusterRoleBindingは同じNamespaceに属する必要がある。 |

<br>

### Volume

#### ▼ Volumeとは

既存（ワーカーNode、NFS、iSCSI、Cephなど）のボリュームをそのままKubernetesのボリュームとして使用する。

ℹ️ 参考：https://thinkit.co.jp/article/14195

Dockerのボリュームとは独立した機能であることに注意する。

- https://stackoverflow.com/questions/62312227/docker-volume-and-kubernetes-volume
- https://stackoverflow.com/questions/53062547/docker-volume-vs-kubernetes-persistent-volume

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

Node上の既存のストレージ領域をボリュームとし、コンテナにバインドマウントする。バインドマウントは、NodeとPod内コンテナ間で実行され、同一Node上のPod間でこのボリュームを共有できる。

ℹ️ 参考：https://qiita.com/umkyungil/items/218be95f7a1f8d881415

HostPathは非推奨である。

ℹ️ 参考：https://thenewstack.io/10-kubernetes-best-practices-you-can-easily-apply-to-your-clusters/

```bash
# Node内でdockerコマンドを実行
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

Podの既存のストレージ領域をボリュームとし、コンテナにボリュームマウントする。そのため、Podが削除されると、このボリュームも同時に削除される。Node上のPod間でボリュームを共有できない。

ℹ️ 参考：https://qiita.com/umkyungil/items/218be95f7a1f8d881415

#### ▼ 外部ボリューム

クラウドプロバイダーやNFSから提供されるストレージ領域を使用したボリュームとし、コンテナにマウントする。

ℹ️ 参考：https://zenn.dev/suiudou/articles/31ab107f3c2de6#%E2%96%A0kubernetes%E3%81%AE%E3%81%84%E3%82%8D%E3%82%93%E3%81%AA%E3%83%9C%E3%83%AA%E3%83%A5%E3%83%BC%E3%83%A0

<br>

## 03-06. Metadataリソース

### Metadataリソースとは

ℹ️ 参考：https://thinkit.co.jp/article/13542

<br>

### HorizontalPodAutoscaler

#### ▼ HorizontalPodAutoscalerとは

Kubernetesリソースの水平スケーリングを定義する。Metric serverから取得したKubernetesリソースのメトリクス値のうち、指定したメトリクス値とターゲット値の比較に基づいて、Podをスケールイン/スケールアウトさせる。

ℹ️ 参考：https://www.stacksimplify.com/aws-eks/aws-eks-kubernetes-autoscaling/learn-to-master-horizontal-pod-autoscaling-on-aws-eks/

![horizontal-pod-autoscaler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/horizontal-pod-autoscaler.png)

#### ▼ 最大Pod数の求め方

オートスケーリング時の現在のPod数は、次の計算式で算出される。算出結果に基づいて、スケールアウト/スケールインが実行される。

ℹ️ 参考：https://speakerdeck.com/oracle4engineer/kubernetes-autoscale-deep-dive?slide=14

```mathematica
(必要な最大Pod数)
= (現在のPod数) x (現在のPodのCPU平均使用率) ÷ (現在のPodのCPU使用率のターゲット値)
```

例えば、『```現在のPod数 = 5```』『```現在のPodのCPU平均使用率 = 90```』『```現在のPodのCPU使用率のターゲット値 = 70```』だとすると、『```必要な最大Pod数 = 7```』となる。算出結果と比較して、現在のPod数不足しているため、スケールアウトが実行される。

<br>

### VertialPodAutoscaler

#### ▼ HorizontalPodAutoscalerとは

<br>

## 03-07. カスタムリソース

### カスタムリソースとは

Kubernetesに標準で備わっていないKubernetesリソースを提供する。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/
- https://www.amazon.co.jp/dp/B08FZX8PYW

<br>

### SecretProviderClass

#### ▼ SecretProviderClassとは

外部Secretストアのデータを参照するための機能を提供する。

#### ▼ セットアップ

プロバイダーが提供するCSIドライバーを、Kubernetes上にインストールする必要がある。

ℹ️ 参考：https://secrets-store-csi-driver.sigs.k8s.io/getting-started/installation.html

```bash
$ helm install -n kube-system csi-secrets-store secrets-store-csi-driver/secrets-store-csi-driver
```

#### ▼ CSIドライバー

SecretProviderClassで定義されたプロバイダーのAPIと通信し、外部Secretのデータを参照する。その後、tmpfとしてVolumeに書き込む。

ℹ️ 参考：https://secrets-store-csi-driver.sigs.k8s.io/concepts.html

![secrets-store-csi-volume](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/secrets-store-csi-volume.png)

#### ▼ CSI Volume

CSIの仕様によって標準化された外部ボリューム。プロバイダー上に新しく作成したストレージ領域をボリュームとし、これをコンテナにバインドマウントする。

ℹ️ 参考：https://thinkit.co.jp/article/17635

<br>

## 04. Kubernetesネットワーク

### Nodeネットワーク

#### ▼ Nodeネットワークとは

同じサブネットマスク内にあるNodeのNIC間を接続するネットワーク。

ℹ️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=10

![kubernetes_node-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_node-network.png)

<br>

### Clusterネットワーク

#### ▼ Clusterネットワークとは

同じClusterネットワーク内にあるPodの仮想NIC（veth）間を接続するネットワーク。

ℹ️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=11

![kubernetes_cluster-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cluster-network.png)

<br>

### Serviceネットワーク

#### ▼ Serviceネットワークとは

Podのアウトバウンド通信に割り当てられたホスト名を認識し、そのホスト名を持つServiceまでアウトバウンド通信を送信する。

ℹ️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=13

![kubernetes_service-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_service-network.png)

<br>

## 04-02. 同じPod内のコンテナ間通信

### 通信経路

同じPod内のコンテナ間で通信するため、Pod内のネットワークのみを経由する。Podごとにネットワークインターフェースが付与され、またIPアドレスが割り当てられる。

ℹ️ 参考：https://www.tutorialworks.com/kubernetes-pod-communication/#how-do-containers-in-the-same-pod-communicate

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

Podの稼働するNodeが同じ/異なるで経由するネットワークが異なる。

ℹ️ 参考：https://kubernetes.io/docs/concepts/cluster-administration/networking/

| 条件             | 経由するネットワーク                                         |
| ---------------- | ------------------------------------------------------------ |
| Nodeが異なる場合 | Nodeネットワーク + Clusterネットワーク + Serviceネットワーク |
| Nodeが同じ場合   | Clusterネットワーク + Serviceネットワーク                    |

<br>

### デバッグ

#### ▼ 疎通確認

異なるPod内コンテナ間は、Podが紐づくServiceのドメイン名やIPアドレスで通信でき、```kubectl exec```コマンドでコンテナに接続後、通信経路をデバッグできる。

```bash
# Pod内コンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>:~] $ curl -X GET http://<Serviceのドメイン名やIPアドレス>
```

一方で、```kubectl exec```コマンドが運用的に禁止されているような状況もある。そのような状況下で、シングルNodeの場合は、```kubectl run```コマンドで、```--rm```オプションを有効化しつつ、Clusterネットワーク内にcurlコマンドによるデバッグ用のPodを一時的に新規作成する。マルチNodeの場合は、（たぶん）名前が一番昇順のNode上でPodが作成されてしまい、Nodeを指定できない。そのため、代わりに```kubectl debug```コマンドを使用する。ただし、```kubectl debug```コマンドで作成されたPodは、使用後に手動で削除する必要がある。デバッグの実行環境として、```yauritux/busybox-curl```イメージは、軽量かつ```curl```コマンドと```nslookup```コマンドの両方が使用できるのでおすすめである。

ℹ️ 参考：

- https://qiita.com/tkusumi/items/a62c209972bd0d4913fc
- https://scrapbox.io/jiroshin-knowledge/kubernetes_cluster%E3%81%ABcurl%E3%81%AEPod%E3%82%92%E7%AB%8B%E3%81%A6%E3%81%A6%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A%E3%83%AD%E3%82%B0%E3%82%A4%E3%83%B3%E3%81%99%E3%82%8B%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89

```bash
# シングルNodeの場合

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
# マルチNodeの場合

# Podが稼働するNodeを確認する。
$ kubectl get pod <Pod名> -o wide

# 指定したNode上で、curl送信用のコンテナを作成する。
$ kubectl debug node/<Node名> \
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

また、Serviceがルーティング対象とするPodにて、コンテナが待ち受けているポート番号を確認する。

```bash
# 先にlabelから、Serviceのルーティング対象のPodを確認する
$ kubectl get pod -l <名前>=<値> -o wide

$ kubectl get pod <Pod名> -o yaml | grep containerPort:
```

両方のポート番号が一致しているかを確認する。

<br>

### 環境変数を使用する場合

#### ▼ 環境変数の設定

Serviceにリクエストを送信するために必要な情報を、環境変数として出力する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/service/#discovering-services

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

ℹ️ 参考：

- https://blog.mosuke.tech/entry/2020/09/09/kuubernetes-dns-test/
- https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=42

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

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#services
- https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=44

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

ℹ️ 参考：

- https://blog.mosuke.tech/entry/2020/09/09/kuubernetes-dns-test/
- https://kubernetes.io/docs/tasks/debug-application-cluster/debug-service/#does-the-service-work-by-dns-name

<br>

