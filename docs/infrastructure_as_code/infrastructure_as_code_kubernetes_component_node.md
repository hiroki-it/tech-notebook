---
title: 【IT技術の知見】Nodeコンポーネント＠Kubernetes
description: Nodeコンポーネント＠Kubernetesの知見を記録しています。
---

# Nodeコンポーネント＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Nodeコンポーネントとは

ワーカーNode上で稼働するKubernetesコンポーネントのこと。



> ℹ️ 参考：
>
> - https://cstoku.dev/posts/2018/k8sdojo-24/
> - https://kubernetes.io/docs/concepts/overview/components/

<br>


## 02. ワーカーNode

### ワーカーNodeとは

ノードコンポーネントが稼働する。Kubernetesの実行時に自動的に作成される。

もし手動で作成する場合は、```kubectl```コマンドで```--register-node=false```とする必要がある。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/architecture/nodes/
> - https://kubernetes.io/docs/concepts/architecture/nodes/#manual-node-administration

<br>

### ワーカーNodeで待ち受けるポート番号

ワーカーNodeがパケットを待ち受けるデフォルトのポート番号は、以下の通りである。



> ℹ️ 参考：https://kubernetes.io/docs/reference/ports-and-protocols/#node

<br>


## 03. Nodeグループ

### Nodeグループとは

KubernetesにはNodeグループというリソースがなく、グループを宣言的に定義することはできない。

ただ、クラウドプロバイダーのサーバーオートスケーリング機能（例：AWS EC2AutoScaling）を使用して、Nodeグループを実現できる。

同じ設定値（```.metadata.labels```キー、CPU、メモリ、など）や同じ役割を持ったNodeのグループのこと。

基本的には、Nodeグループは冗長化されたワーカーNodeで構成されており、IDは違えど、ワーカーNode名は全て同じである。

Nodeグループをターゲットとするロードバランサーでは、Nodeグループ内で冗長化ワーカーNodeのいずれかに対してルーティングすることになる。



> ℹ️ 参考：
>
> - https://qiita.com/mumoshu/items/9ee00307d6bbab43edb6
> - https://docs.aws.amazon.com/eks/latest/userguide/autoscaling.html#cluster-autoscaler

<br>

### Nodeグループの粒度

node affinityやnode selectorを実施できるように、```.metadata.labels```キーにNodeグループ名を設定しておく。

キー名は、```node.kubernetes.io/nodegroup```とする。

| Nodeグループ名の例と```.metadata.labels```キー値 | 説明                                                                                                                                                                                      |
|------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```app```、```service```                  | アプリコンテナを稼働させる。                                                                                                                                                                          |
| ```batch```、```job```                    | バッチ処理やジョブ（定期的に実行するように設定されたバッチ処理）のコンテナを配置する。                                                                                                                                  |
| ```deploy```                             | デプロイのためのリソース（例：ArgoCDのPod）のコンテナを配置する。                                                                                                                                                  |
| ```ingress```、```gateway```              | ワーカーNodeへのインバウンド通信の入口になるリソース（例：Ingress、IngressGateway）のコンテナや、API Gatewayのアプリコンテナを配置する。これは単一障害点になりうるため、ワーカーNodeのCPUやメモリを潤沢にしようできるように、他のリソースのコンテナとは別のNodeグループにした方が良い。     |
| ```master```                             | セルフマネージドなKubernetesコントロールプレーンNodeのコンテナを稼働させる。マネージドなコントロールプレーンNode（例：AWS EKS、GCP GKE、など）の場合、このNodeグループは不要になる。                                                                       |
| ```system```                             | ログやメトリクスのデータポイントを収集するリソース（例：Prometheus、Alertmanager、のPod）のコンテナを配置する。また、セルフマネージドなサービスメッシュコントロールプレーンNodeのコンテナを稼働させる。マネージドなコントロールプレーンNode（例：AWS AppMesh、など）の場合、このNodeグループは不要になる。 |

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
  labels:
    node.kubernetes.io/nodegroup: batch
spec:
```

<br>

### ワーカーNodeのオートスケーリング

執筆時点（2022/07/20）では、KubernetesのAPIにはワーカーNodeのオートスケーリング機能はない。

ただし、cluster-autoscalerを使用すると、各クラウドプロバイダーのAPIからワーカーNodeのオートスケーリングを実行できるようになる。

> ℹ️ 参考：
>
> - https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler#cluster-autoscaler
> - https://blog.inductor.me/entry/2021/12/06/165743

<br>


## 04. kubelet

### kubeletとは

各ワーカーNode上で直接デーモンとして常駐し、コンテナランタイムを操作することにより、Podを作成する。

また、ワーカーNodeやPodを監視し、メトリクスのデータポイントをkube-apiserverに提供する。

![kubernetes_kubelet](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kubelet.png)

> ℹ️ 参考：https://thinkit.co.jp/article/17453


<br>

### セットアップ

#### ▼ 起動コマンド

```bash
$ kubelet \
    --bootstrap-kubeconfig=/etc/kubernetes/bootstrap-kubelet.conf \
    ``# kubeletの設定ファイル` \
    --kubeconfig=/etc/kubernetes/kubelet.conf \
    --config=/var/lib/kubelet/config.yaml \
    --authentication-token-webhook=true 
    --authorization-mode=Webhook \
    --container-runtime=remote \
    ``# コンテナランタイムの設定` \
    --container-runtime-endpoint=unix:///run/containerd/containerd.sock \
    --max-pods=250 \
    --node-ip=*.*.*.* \
    --rotate-server-certificates=true \
    --seccomp-default=true \
    --cgroup-driver=systemd \
    --runtime-cgroups=/system.slice/containerd.service \
    ...
```

> ℹ️ 参考：https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/#options


#### ▼ kubelet.confファイル

```/etc/kubernetes/kubelet.conf```ファイルにkubeletを設定する。



```yaml
apiVersion: v1
clusters:
  - cluster:
      certificate-authority-data: MIIC2DCCAcCgAwIBAgIBATANBgkqh ...
server: https://*.*.*.*:443
name: default-cluster
contexts:
  - context:
      cluster: default-cluster
      namespace: default
      user: default-auth
    name: default-context
current-context: default-context
kind: Config
preferences: {}
users:
  - name: default-auth
    user:
      client-certificate: /var/lib/kubelet/pki/kubelet-client-current.pem
      client-key: /var/lib/kubelet/pki/kubelet-client-current.pem
```

<br>

### ログ

#### ▼ kubeletのログの確認

kubeletは、ワーカーNodeでデーモンとして常駐しているため、```journalctl```コマンドでログを取得できる。



```bash
$ journalctl -u kubelet.service

-- Logs begin at Mon 2022-04-18 21:04:26 JST, end at Mon 2022-12-05 17:42:29 JST. --
04/21 14:21:55 foo-node systemd[1]: Started kubelet: The Kubernetes Node Agent.
...
```

<br>

## 05. kube-proxy

### kube-proxyとは

kube-proxyは、各ワーカーNode上でDaemonSetとして稼働し、IPアドレスベースのサービスディスカバリー、検出したサービス（Pod）に対する```L4```ロードバランサー、として働く。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies
> - https://iximiuz.com/en/posts/service-discovery-in-kubernetes/

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

#### ▼ CoreDNSと組み合わせたサービスディスカバリー

kube-proxyは、ワーカーNode上で稼働するパケットフィルタリング型ファイアウォール（iptables）や```L4```ロードバランサー（ipvs）に、EndpointSliceで管理するPodの宛先情報を追加/削除する。

Serviceネットワークさえ作成できていれば、ServiceとPodが同じワーカーNode上にあるか否かに限らず、Serviceは、ワーカーNodeの宛先情報ルールを使用してPodを動的に検出できる。

ただし、宛先のIPアドレスは動的に変化するため、別途CoreDNSも使用して、サービスディスカバリーを実装する。

![kubernetes_kube-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy.png)


> ℹ️ 参考：
> 
> - https://www.imagazine.co.jp/%e5%ae%9f%e8%b7%b5-kubernetes%e3%80%80%e3%80%80%ef%bd%9e%e3%82%b3%e3%83%b3%e3%83%86%e3%83%8a%e7%ae%a1%e7%90%86%e3%81%ae%e3%82%b9%e3%82%bf%e3%83%b3%e3%83%80%e3%83%bc%e3%83%89%e3%83%84%e3%83%bc%e3%83%ab/
> - https://kubernetes.io/blog/2018/07/10/coredns-ga-for-kubernetes-cluster-dns/#introduction
> - https://tech-blog.cloud-config.jp/2021-12-07-kubernetes-service/

#### ▼ Podのロードバランサー

ロードバランシングアルゴリズムによって、Serviceがルーティング先のPodを決める。

プロキシモードごとに、使用するロードバランシングアルゴリズムが異なる。



> ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies

#### ▼ 確認方法

```iptable```コマンドで、『```KUBE-SERVICES```』というチェインのターゲットを確認する。

ターゲットには、Serviceのルーティング先となるPod（異なるワーカーNode上にある場合もある）の宛先情報が登録されている。

```source```列に含まれるIPアドレスを持つパケットのみでルールが適用され、各ルールに対応するPodに送信する場合、宛先IPアドレスを```destination```列のIPアドレスに変換する。


```bash
$ iptables -L -n KUBE-SERVICES -t nat --line-number

Chain KUBE-SERVICES (2 references)
num  target                     prot   opt   source      destination         
1    KUBE-SVC-ERIFXISQEP7F7OF4  tcp    --    0.0.0.0/0   10.96.0.10           /* kube-system/kube-dns:dns-tcp cluster IP */ tcp dpt:53
2    KUBE-SVC-V2OKYYMBY3REGZOG  tcp    --    0.0.0.0/0   10.101.67.107        /* default/nginx-service cluster IP */ tcp dpt:8080
3    KUBE-SVC-NPX46M4PTMTKRN6Y  tcp    --    0.0.0.0/0   10.96.0.1            /* default/kubernetes:https cluster IP */ tcp dpt:443
4    KUBE-SVC-JD5MR3NA4I4DYORP  tcp    --    0.0.0.0/0   10.96.0.10           /* kube-system/kube-dns:metrics cluster IP */ tcp dpt:9153
5    KUBE-SVC-TCOU7JCQXEZGVUNU  udp    --    0.0.0.0/0   10.96.0.10           /* kube-system/kube-dns:dns cluster IP */ udp dpt:53
6    KUBE-NODEPORTS             all    --    0.0.0.0/0   0.0.0.0/0            /* kubernetes service nodeports; NOTE: this must be the last rule in this chain */ ADDRTYPE match dst-type LOCAL
```


> ℹ️ 参考：
>
> - https://dream.jp/vps/support/manual/mnl_security_04.html
> - https://zenn.dev/tayusa/articles/c705cd65b6ee74

<br>

### プロキシモードの種類

#### ▼ iptablesプロキシモード

![kubernetes_kube-proxy_iptables](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_iptables.png)

デフォルトのプロキシモードである。



| 項目                     | 仕組み                                                                                                |
|--------------------------|----------------------------------------------------------------------------------------------------|
| IPアドレスベースのサービスディスカバリー    | ServiceとそのService配下のEndpointSliceの追加と削除を監視し、これらの増減に合わせて、ワーカーNode上で稼働するiptablesを更新する。 |
| ```L4```のロードバランシングアルゴリズム | ランダム方式のみ。                                                                                          |

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/service/#proxy-mode-iptables
> - https://www.mtioutput.com/entry/kube-proxy-iptable
> - https://github.com/kubernetes/kubernetes/pull/81430


#### ▼ userspaceプロキシモード

![kubernetes_kube-proxy_userspace](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_userspace.png)


| 項目                     | 仕組み                                                                                                |
|--------------------------|----------------------------------------------------------------------------------------------------|
| IPアドレスベースのサービスディスカバリー    | ServiceとそのService配下のEndpointSliceの追加と削除を監視し、これらの増減に合わせて、ワーカーNode上で稼働するiptablesを更新する。 |
| ```L4```のロードバランシングアルゴリズム | ラウンドロビン方式のみ。                                                                                       |

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/service/#proxy-mode-userspace
> - https://github.com/kubernetes/kubernetes/pull/81430


#### ▼ ipvsプロキシモード


![kubernetes_kube-proxy_ipvs](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_ipvs.png)


kube-proxyの起動時に、```--feature-gates```オプションに```SupportIPVSProxyMode=true```、```--proxy-mode```オプションに```ipvs```を設定する。

| 項目                     | 仕組み                                                                                            |
|--------------------------|------------------------------------------------------------------------------------------------|
| IPアドレスベースのサービスディスカバリー    | ServiceとそのService配下のEndpointSliceの追加と削除を監視し、これらの増減に合わせて、ワーカーNode上で稼働するipvsを更新する。 |
| ```L4```のロードバランシングアルゴリズム | ラウンドロビン方式、コネクションの最低数、宛先ハッシュ値、送信元ハッシュ値、など。                                            |


> ℹ️ 参考：
>
> - https://qiita.com/superbrothers/items/5a6a34c5eb919ce872aa#kube-proxy-alpha-ipvs-%E3%83%A2%E3%83%BC%E3%83%89%E3%82%92%E3%82%B5%E3%83%9D%E3%83%BC%E3%83%88
> - https://kubernetes.io/docs/concepts/services-networking/service/#proxy-mode-ipvs
> - https://github.com/kubernetes/kubernetes/pull/81430


<br>

### その他のプロキシー

ワーカーNode外部からのインバウンド通信をPodにルーティングするためのプロキシーが、他にもいくつかある。

- ```kubectl proxy```コマンド
- ```minikube tunnel```コマンド
- LoadBalancer

> ℹ️ 参考：https://kubernetes.io/docs/concepts/cluster-administration/proxies/


<br>

## 06. コンテナランタイム（コンテナエンジン）

### コンテナランタイムとは

イメージのプル、コンテナ作成削除、コンテナ起動停止、などを行う。



> ℹ️ 参考：https://thinkit.co.jp/article/17453

<br>

### セットアップ（Containerdの場合）

#### ▼ Containerdのインストールの事前作業

（１）```/etc/modules-load.d/containerd.conf```ファイルに、カーネルモジュールを設定する。

> ℹ️ 参考：https://kubernetes.io/ja/docs/setup/production-environment/container-runtimes/#%E5%BF%85%E8%A6%81%E3%81%AA%E8%A8%AD%E5%AE%9A%E3%81%AE%E8%BF%BD%E5%8A%A0

```bash
overlay
br_netfilter
```

（２）カーネルモジュールを読み込む。

```bash
$ modprobe overlay
$ modprobe br_netfilter
```

（３）```/etc/sysctl.d/99-kubernetes-cri.conf```ファイルに、カーネルパラメーターを設定する。

> ℹ️ 参考：https://www.memotansu.jp/kubernetes/3790/#toc2

```bash
net.bridge.bridge-nf-call-iptables=1
net.ipv4.ip_forward=1
net.bridge.bridge-nf-call-ip6tables=1
```

（４）カーネルに設定を反映する。

```bash
$ sysctl --system
```

#### ▼ Containerdのインストール

（１）要件のパッケージをインストールする。


```bash
$ apt-get update -y \ 
  && apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common
```

（２）Dockerの公式GPGキーを追加する。

```bash
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
```

（３）リポジトリを追加する。

```bash
$ add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) \
    stable"
```

（４）Containerdをインストールする。

```bash
$ apt-get update && apt-get install containerd.io
```


> ℹ️ 参考：https://kubernetes.io/ja/docs/setup/production-environment/container-runtimes/#containerd%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

#### ▼ Containerdの設定ファイルの準備

（１）設定ファイルとして、```/etc/containerd/config.toml```ファイルを作成する。

> ℹ️ 参考：https://kubernetes.io/ja/docs/setup/production-environment/container-runtimes/#containerd%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

```bash
$ mkdir -p /etc/containerd
$ containerd config default | sudo tee /etc/containerd/config.toml
```

（２）Containerdに設定を反映する。

```bash
$ systemctl restart containerd
```

#### ▼ kubeletによるContainerdの指定

kubeletの起動時に、```--container-runtime```オプションと```--container-runtime-endpoint```オプションを使用する。

```bash
$ kubelet \
    --container-runtime=remote \
    --container-runtime-endpoint=unix:///run/containerd/containerd.sock
    ...
```

> ℹ️ 参考：https://repl.info/archives/2894/


<br>

### ログ

ワーカーNodeでデーモンとして常駐しているため、```journalctl```コマンドでログを取得できる。



```bash
$ journalctl -u containerd.service

-- Logs begin at Mon 2022-04-18 21:04:26 JST, end at Mon 2022-12-05 17:43:49 JST. --
04/19 18:10:17 fo-node systemd[1]: Starting containerd container runtime...
```

<br>

### コンテナのライフサイクルフェーズ

#### ▼ ライフサイクルフェーズとは

コンテナのライフサイクルにはフェーズがある。

| フェーズ名     | 説明                                                |
|------------|---------------------------------------------------|
| Waiting    | ```Running```フェーズと```Terminated```フェーズ以外のフェーズにある。 |
| Running    | コンテナの起動が完了し、実行中である。                          |
| Terminated | コンテナが正常/異常に停止した。                              |


> ℹ️ 参考：https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-states

<br>
