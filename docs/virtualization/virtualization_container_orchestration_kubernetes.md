---
title: 【知見を記録するサイト】Kubernetes＠仮想化
description: Kubernetes＠仮想化の知見をまとめました．
---

# Kubernetes＠仮想化

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Kubernetesの仕組み

### 構造

Kubernetesコンポーネントは，リソースから作成されたオブジェクトを操作し，アプリケーションを稼働させる．kubernetesクライアントは，kubectlコマンドをkube-apiserverに送信することで，Kubernetesを操作できる．

参考：https://kubernetes.io/docs/concepts/overview/components/

![kubernetes_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_architecture.png)

<br>

### cloud-controller-manager

#### ・cloud-controller-managerとは

kub-apiserverとクラウドインフラを仲介し，Kubernetesがクラウドインフラを操作できるようにする．

![kubernetes_cloud-controller-manager](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cloud-controller-manager.png)

<br>

### etcd

#### ・etcdとは

Clusterの様々な設定値を保持し，冗長化されたリソース間にこれを共有する．Kubernetesに標準で組み込まれているが，別のOSSである．

参考：

- https://thinkit.co.jp/article/17453
- https://landscape.cncf.io/?selected=etcd

![kubernetes_etcd](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_etcd.png)

<br>

### kube-apiserver

#### ・kube-apiserverとは

kubernetesクライアントにkueneretes-APIを公開する．クライアントがkubectlコマンドを実行すると，kubernetes-APIがコールされ，コマンドに沿ってリソースが操作される．

参考：https://thinkit.co.jp/article/17453

![kubernetes_kube-apiserver](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-apiserver.png)

<br>

### kube-controller-manager

#### ・kube-controller-managerとは

様々なコントローラーを統括的に実行する．

参考：https://thinkit.co.jp/article/17453

<br>

### kube-scheduler

#### ・kube-schedulerとは

ワーカーNodeとPodのスペックを基に，ワーカーNodeに配置される適切なPod数を決定する．

参考：https://thinkit.co.jp/article/17453

![kubernetes_kube-scheduler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-scheduler.png)

<br>

### コンテナランタイム（コンテナエンジン）

#### ・コンテナランタイムとは

イメージのプル，コンテナ構築削除，コンテナ起動停止，などを行う．

参考：https://thinkit.co.jp/article/17453

<br>

### kubelet

#### ・kubeletとは

kube-apiserverからコールされる．ワーカーNodeのコンテナランタイムを操作し，Podを作成する．

参考：https://thinkit.co.jp/article/17453

![kubernetes_kubelet](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kubelet.png)

<br>

### kube-proxy

#### ・kube-proxyとは

ワーカーNode外部からのインバウンド通信をPodにルーティングする．モードごとに，Podの名前解決の方法が異なる．

参考：https://qiita.com/tkusumi/items/c2a92cd52bfdb9edd613

| モード    | 説明                                                         | 補足                                                         |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| iptables  | ![kubernetes_kube-proxy_iptables](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_iptables.png) | 参考：https://kubernetes.io/ja/docs/concepts/services-networking/service/#proxy-mode-iptables |
| userspace | ![kubernetes_kube-proxy_userspace](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_userspace.png) | 参考：https://kubernetes.io/ja/docs/concepts/services-networking/service/#proxy-mode-userspace |
| ipvs      | ![kubernetes_kube-proxy_ipvs](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_ipvs.png) | 参考：https://kubernetes.io/ja/docs/concepts/services-networking/service/#proxy-mode-ipvs |

<br>

## 01-02. Kubernetesの実行環境

### 開発環境

参考：

- https://codefresh.io/kubernetes-tutorial/local-kubernetes-mac-minikube-vs-docker-desktop/
- https://thinkit.co.jp/article/13338ht-kubernetes/
- https://blog.cybozu.io/entry/2019/07/03/170000

|                        | Minikube                                                     | Docker for Desktop                                           | Kind                                                 |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------- |
| 概要                   | カスタマイズ性が高いため，カスタマイズ次第で本番環境と開発環境の差異を小さくできる．2022年3月の現在では，Kubernetesの開発環境として，ベタープラクティスである． | セットアップが非常に簡単（有効化するだけ）なので，開発に取り掛かるまでが早い． | セットアップが簡単なので，開発に取り掛かるまでが早い |
| セットアップの難易度   | 簡単                                                         | 非常に簡単                                                   | 簡単                                                 |
| Kubernetesのバージョン | 任意のバージョンを指定できる．                               | Docker for Desktopのバージョンごとに，Kubernetesのバージョンが固定される． | 任意のバージョンを指定できる．                       |
| マルチノード           | 不可                                                         | 可能                                                         | 可能                                                 |
| ノードのカスタマイズ性 | 高い                                                         | 低い                                                         | 高い                                                 |

<br>

### 本番環境

|                        | クラウドインフラ（AWS EKS，GCP GKE，など）                   | Rancher                                                      | Kubeadm                                                      |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 概要                   | カスタマイズ性が低い一方で，よりマネージドである，そのため，ユーザーがKubernetesのノードを管理するコストが低い．2022年3月の現在では，Kubernetesの本番環境として，ベタープラクティスである． | カスタマイズ性が高い．そのため，ユーザーがKubernetesのノードを管理するコストが高い． | カスタマイズ性が高い．そのため，ユーザーがKubernetesのノードを管理するコストが高い． |
| ノードのカスタマイズ性 | 低い                                                         | 高い                                                         | 高い                                                         |

<br>

## 02. Kubernetesの操作

### kubernetesクライアント

#### ・kubernetesクライアントとは

kubernetesクライアントは，kubectlコマンドを用いて，kubernetesマスターAPIをコールできる．

<br>

## 03. Kubernetesリソースとオブジェクト

### Kubernetesリソース

Kubernetes上でアプリケーションを稼働させる概念のこと．Kubernetesリソースは，IaCによってマニフェストファイルで定義される．マニフェストファイルについては，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_container_kubernetes_manifest_yml.html

<br>

### Kubernetesオブジェクト

マニフェストファイルによって量産されたKubernetesリソースのインスタンスのこと．

参考：https://qiita.com/cvusk/items/773e222e0971a5391a51

<br>

## 03-02. Workloadリソース

### Workloadリソースとは

コンテナの実行に関する機能を提供する．

参考：https://thinkit.co.jp/article/13542

<br>

### Pod

#### ・Podとは

コンテナの最小グループ単位のこと．Podを単位として，コンテナ起動/停止や水平スケールイン/スケールアウトを実行する．

参考：https://kubernetes.io/ja/docs/concepts/workloads/pods/

**＊例＊**

PHP-FPMコンテナとNginxコンテナを稼働させる場合，これら同じPodに配置する．

![kubernetes_pod_php-fpm_nginx](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_pod_php-fpm_nginx.png)

#### ・同じPod内通信方法

| 通信の状況  | 説明                                                         | 補足                                                         |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 同じPod内   | Podごとにネットワークインターフェースが付与され，またIPアドレスが割り当てられる．そのため，同じPod内のコンテナ間は，『```localhost:<ポート番号>```』で通信できる． | 参考：https://www.tutorialworks.com/kubernetes-pod-communication/#how-do-containers-in-the-same-pod-communicate |
| 異なるPod間 | 異なるPodのコンテナ間は，Serviceを経由して通信できる．       | 参考：https://kubernetes.io/docs/concepts/cluster-administration/networking/ |

#### ・リソースの単位

参考：https://qiita.com/jackchuka/items/b82c545a674975e62c04#cpu

| 単位                | 例                                             |
| ------------------- | ---------------------------------------------- |
| ```m```：millicores | ```1```コア = ```1000```ユニット = ```1000```m |
| ```Mi```：mebibyte  | ```1```Mi = ```1.04858```MB                    |

#### ・名前解決

Cluster内の全てのPodにDNS名が割り当てられている．レコードタイプはA/AAAAレコードのみである．

参考：https://kubernetes.io/ja/docs/concepts/services-networking/dns-pod-service/#pod

| レコードタイプ | ドメイン名                                           | 名前解決の仕組み              |
| -------------- | ---------------------------------------------------- | ----------------------------- |
| A/AAAAレコード | ```<PodのIPアドレス>.<名前空間>.pod.cluster.local``` | PodのIPアドレスが返却される． |

<br>

### ReplicaSet

#### ・ReplicaSetとは

ワーカーNode上のPod数を維持管理する．ただしDaemonSetとは異なり，Podを指定した個数に維持管理できる．ワーカーNodeのCPUやメモリの使用率に合わせて，Podを動的に増減させる．直接ReplicaSetを操作するのではなく，Deployment用いてこれを行うことが推奨される．

参考：

- https://kubernetes.io/ja/docs/concepts/workloads/controllers/replicaset/#replicaset%E3%82%92%E4%BD%BF%E3%81%86%E3%81%A8%E3%81%8D
- https://thinkit.co.jp/article/13611

<br>

### DaemonSet

#### ・DaemonSetとは

ワーカーNode上のPodの個数を維持管理する．ただしReplicaSetとは異なり，Podを1つだけ維持管理する．ワーカーNodeで1つだけ稼働させる必要のあるプロセス（FluentBit，datadogエージェント，cAdvisorエージェントなどのデータ収集プロセス）のために用いられる．こういったプロセスが稼働するコンテナは，ワーカーNode内の全てのコンテナからデータを収集し，可観測性のためのデータセットを整備する．

参考：https://thinkit.co.jp/article/13611

<br>

### StatefulSet

#### ・StatefulSetとは

ReplicaSetを操作し，ワーカーNodeのCPUやメモリの使用率に合わせて，Podの個数を維持管理する．ただしDeploymentとは異なり，ストレートフルなコンテナ（例：dbコンテナ）を含むPodを扱うことができる．Podが削除されてもPersistentVolumeClaimsは削除されないため，新しいPodにも同じPersistentVolumeを継続的にマウントできる．その代わり，StatefulSetの作成後に一部の設定変更が禁止されている．

```bash
The StatefulSet "foo-pod" is invalid: spec: Forbidden: updates to statefulset spec for fields other than 'replicas', 'template', 'updateStrategy' and 'minReadySeconds' are forbidden
```

参考：

- https://kubernetes.io/ja/docs/concepts/workloads/controllers/statefulset/#%E5%AE%89%E5%AE%9A%E3%81%97%E3%81%9F%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B8
- https://sorarinu.dev/2021/08/kubernetes_01/

<br>

### Deployment

#### ・Deploymentとは

ReplicaSetを操作し，新しいPodをデプロイする．また，ワーカーNodeのCPUやメモリの使用率に合わせて，Podの個数を維持管理する．ただしStatefulSetとは異なり，ストレートレス（例：appコンテナ）なコンテナを含むPodを扱う．

参考：

- https://kubernetes.io/ja/docs/concepts/workloads/controllers/deployment/
- https://sorarinu.dev/2021/08/kubernetes_01/

<br>

## 03-03. Discovery&LBリソース

### Discovery&LBリソースとは

ワーカーNode上のコンテナをNode外に公開する機能を提供する．

参考：https://thinkit.co.jp/article/13542

<br>

### Ingress

#### ・Ingressとは

![kubernetes_ingress](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress.png)

IngressコントローラーによってCluster外部から受信したインバウンド通信を，単一/複数のServiceにルーティングする．NodePort ServiceやLoadBalancer Serviceと同様に，外部からのインバウンド通信を受信する方法の1つである．

参考：

- https://kubernetes.io/docs/concepts/services-networking/ingress/#what-is-ingress
- https://thinkit.co.jp/article/18263

#### ・使用例

| パラメーター |                                                              |
| ------------ | ------------------------------------------------------------ |
| パス         | パスの値に基づいて，Serviceにルーティングする．<br>参考：https://kubernetes.io/docs/concepts/services-networking/ingress/#simple-fanout<br/>![kubernetes_ingress_path](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress_path.png) |
| Hostヘッダー | Hostヘッダーの値に基づいて，Serviceにルーティングする．<br>参考：https://kubernetes.io/docs/concepts/services-networking/ingress/#name-based-virtual-hosting<br>![kubernetes_ingress_host](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress_host.png) |

#### ・Ingressコントローラー

![kubernetes_ingress-controller](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress-controller.png)

Ingressの設定に基づいてCluster外部からのインバウンド通信を受信し，単一/複数のIngressにルーティングする．

参考：

- https://developers.freee.co.jp/entry/kubernetes-ingress-controller
- https://www.containiq.com/post/kubernetes-ingress
- https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/

#### ・Ingressコントローラーとして使用可能なもの

参考：

- https://kubernetes.io/ja/docs/concepts/services-networking/ingress-controllers/
- https://www.nginx.com/blog/how-do-i-choose-api-gateway-vs-ingress-controller-vs-service-mesh/

| コントローラー名                                      | 開発環境 | 本番環境 |
| ----------------------------------------------------- | -------- | -------- |
| minikubeアドオン（実体はNginx Ingressコントローラー） | ✅        |         |
| AWS ALBコントローラー                                 |         | ✅        |
| GCP CLBコントローラー                                 |         | ✅        |
| Nginx Ingressコントローラー                           | ✅        | ✅        |
| Istio Ingress                                         | ✅        | ✅        |
| Istio Gateway（Ingressとしても用いることができる）            | ✅        | ✅        |

<br>

### Service

#### ・Serviceとは

Serviceタイプごとに，特定のネットワーク範囲にPodを公開する．マイクロサービスアーキテクチャのコンポーネントである『Service』とは区別する．

参考：https://kubernetes.io/ja/docs/concepts/services-networking/service/

#### ・ClusterIP Service

ClusterのIPアドレスを返却し，Serviceに対するインバウンド通信をPodにルーティングする．Cluster内部からのみアクセスできる．ClusterのIPアドレスは，Podの```/etc/resolv.conf ```ファイルに記載されている．Pod内に複数のコンテナがある場合，各コンテナに同じ内容の```/etc/resolv.conf ```ファイルが配置される．デフォルトのタイプである．

参考：

- https://zenn.dev/suiudou/articles/aa2194b6f53f8f
- https://thinkit.co.jp/article/18263

```bash
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>] $ cat /etc/resolv.conf 

nameserver n.n.n.n # ClusterのIPアドレス
search default.svc.cluster.local svc.cluster.local cluster.local 
options ndots:5
```

#### ・LoadBalancer Service

ロードバランサーのみからアクセスできるIPアドレスを返却し，Serviceに対するインバウンド通信をPodにルーティングする．Cluster外部/内部の両方からアクセスできる．本番環境をクラウドインフラ上で稼働させ，AWS ALBからインバウンド通信を受信する場合に用いる．ロードバランサーから各Serviceにインバウンド通信をルーティングすることになるため，通信数が増え，金銭的負担が大きい．

参考：

- https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0
- https://thinkit.co.jp/article/18263

#### ・NodePort Service

NodeのIPアドレスを返却し，Serviceの指定したポートに対するインバウンド通信をPodにルーティングする．Cluster外部/内部の両方からアクセスできる．1つのポートから1つのServiceにしかルーティングできない．ServiceNodeのIPアドレスは別に確認する必要があり，NodeのIPアドレスが変わるたびに，これに合わせて他の設定を変更しなければならず，本番環境には向いていない．AWSのAurora RDSのClusterエンドポイントには，NodePortの概念が取り入れられている．

参考：

- https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0
- https://thinkit.co.jp/article/18263

#### ・ExternalName Service

PodのCNAMEを返却し，Serviceに対するインバウンド通信をPodにルーティングする．

参考：https://thinkit.co.jp/article/13739

#### ・Headless Service

PodのIPアドレスを返却し，Serviceに対するインバウンド通信をPodにルーティングする．Podが複数ある場合は，DNSラウンドロビンのルールでIPアドレスが返却される．

参考：https://thinkit.co.jp/article/13739

<br>

## 03-04. Config&Storageリソース

### Config&Storageリソースとは

リソースの設定データ，機密データ，ボリュームに関する機能を提供する．

参考：https://thinkit.co.jp/article/13542

<br>

### PersistentVolumeClaim

#### ・PersistentVolumeClaimとは

設定された条件に基づいて，作成済みのPersistentVolumeを要求し，指定したKubernetesリソースに割り当てる．

<br>

### Secret

#### ・Secretとは

セキュリティに関するデータを管理し，コンテナに選択的に提供する．

#### ・コンテナの環境変数として

機密性の高い値を暗号化した状態で管理し，復号化した上で，環境変数としてPodに出力する．

参考：https://kubernetes.io/ja/docs/concepts/configuration/secret/#using-secrets-as-environment-variables

<br>

## 03-05. Clusterリソース

### Clusterリソースとは

セキュリティやクォーターに関する機能を提供する．

参考：https://thinkit.co.jp/article/13542

<br>

### マスターNode（kubernetesマスター）

#### ・マスターNodeとは

kubernetesマスターともいう．ワーカーNodeの操作を担う．クライアントがkubectlコマンドの実行すると，kube-apiserverがコールされ，コマンドに沿ってワーカーNodeが操作される．

参考：

- https://kubernetes.io/ja/docs/concepts/#kubernetes%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC
- https://medium.com/easyread/step-by-step-introduction-to-basic-concept-of-kubernetes-e20383bdd118
- https://qiita.com/baby-degu/items/ce26507bd954621d6dc5

<br>

### ワーカーNode

#### ・ワーカーNodeとは

Podが稼働するサーバー単位こと．

参考：https://kubernetes.io/ja/docs/concepts/architecture/nodes/

<br>

### Volume

#### ・Volumeとは

既存（ホスト，NFS，iSCSI，Cephなど）のボリュームをそのままKubernetesのボリュームとして用いる方法のこと．

参考：https://thinkit.co.jp/article/14195

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

#### ・HostPath（本番環境で非推奨）

Node上の既存のストレージ領域をボリュームとし，コンテナにマウントする．NodeとPod内コンテナ間のバインドマウントによって作成され，同一Node上のPod間でこのボリュームを共有できる．

参考：https://qiita.com/umkyungil/items/218be95f7a1f8d881415

以下の通り，HostPathではバインドマウントが使用されていることを確認できる．

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
                "Type": "bind", # バインドマウントが使用されている．
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

#### ・EmptyDir

Podの既存のストレージ領域をボリュームとし，コンテナにマウントする．そのため，Podが削除されると，このボリュームも同時に削除される．ボリュームマウントによって作成され，Node上のPod間でボリュームを共有できない．

参考：https://qiita.com/umkyungil/items/218be95f7a1f8d881415

#### ・外部ボリューム

クラウドベンダーやNFSから提供されるストレージ領域を用いたボリュームとし，コンテナにマウントする．

参考：https://zenn.dev/suiudou/articles/31ab107f3c2de6#%E2%96%A0kubernetes%E3%81%AE%E3%81%84%E3%82%8D%E3%82%93%E3%81%AA%E3%83%9C%E3%83%AA%E3%83%A5%E3%83%BC%E3%83%A0

<br>

### PersistentVolume

#### ・PersistentVolumeとは

新しく作成したストレージ領域をPluggableなボリュームとし，これをコンテナにマウントする方法のこと．ボリュームマウントによって作成され，Node上のPod間でボリュームを共有できる．PodがPersistentVolumeを用いるためには，PersistentVolumeClaimリソースにPersistentVolumeを要求させておき，PodでこのPersistentVolumeClaimリソースを指定する必要がある．アプリケーションのディレクトリ名を変更した場合は，PersistVolumeを再作成しないと，アプリケーション内のディレクトリの読み出しでパスを解決できない場合がある．

参考：https://thinkit.co.jp/article/14195

#### ・HostPath（本番環境で非推奨）

Node上に新しく作成したストレージ領域をボリュームとし，これをコンテナにマウントする．機能としては，VolumeでのHostPathと同じである．マルチNodeには対応していないため，本番環境では非推奨である．

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes

#### ・Local（本番環境で推奨）

Node上に新しく作成したストレージ領域をボリュームとし，これをコンテナにマウントする．マルチNodeに対応している（明言されているわけではく，HostPathとの明確な違いがよくわからない）．

参考：

- https://kubernetes.io/docs/concepts/storage/volumes/#local
- https://qiita.com/sotoiwa/items/09d2f43a35025e7be782#local

<br>

## 03-06. Metadataリソース

### Metadataリソースとは

参考：https://thinkit.co.jp/article/13542

<br>

## 03-07. セキュリティ

### Account

#### ・Accountとは

Kubernetesに関する実行ユーザーを設定する．

参考：

- https://kubernetes.io/docs/reference/access-authn-authz/authentication/
- https://tech-blog.cloud-config.jp/2021-12-04-kubernetes-authentication/

| アカウント名   | 説明                                                         | 補足                                                         |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ServiceAccount | Kubernetes内の各リソースのプロセスに実行ユーザーの仕組みを設定する．正しい実行ユーザーのプロセスは，Kubernetes自体と通信する権限を持つ． | Kubernetesリソースの各オブジェクトには自動的にServiceAccountが設定される．正しいユーザーに実行されたオブジェクトのみがKubernetesと通信できる． |
| UserAccount    | Kubernetes自体を操作するクライアントに実行ユーザーの仕組みを設定する．正しい実行ユーザーのクライアントは，Kubernetes自体を操作する権限を持つ． | アカウント情報は，``` ~/.kube/config/kubeconfig```ファイルにクライアント証明書として定義する必要がある． |

<br>

### NetworkPolicy

#### ・NetworkPolicyとは

Pod間で通信する場合のインバウンド/アウトバウンド通信の送受信ルールを設定する．

参考：

- https://www.amazon.co.jp/dp/B08FZX8PYW
- https://qiita.com/dingtianhongjie/items/983417de88db2553f0c2

#### ・Ingress

他のPodからの受信するインバウンド通信のルールを設定する．Ingressリソースとは関係がないことに注意する．

#### ・Egress

他のPodに送信するアウトバウンド通信のルールを設定する．

<br>

## 04. サービスディスカバリー

### 環境変数の場合

Serviceにリクエストを送信するために必要な情報を，環境変数として出力する．

参考：https://kubernetes.io/docs/concepts/services-networking/service/#discovering-services

**＊実装例＊**

foo-app-serviceというServiceを構築した場合の環境変数を示す．

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

### クラスター内DNSの場合

#### ・レコードタイプとドメイン名の関係

Cluster内の全てのServiceにDNS名が割り当てられている．レコードタイプごとに，DNS名が異なる．

参考：https://kubernetes.io/ja/docs/concepts/services-networking/dns-pod-service/#services

| レコードタイプ | 完全修飾ドメイン名                                           | 名前解決の仕組み                                             |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| A/AAAAレコード | ```<Service名>.<名前空間>.svc.<Clusterのドメイン名>```   | 通常のServiceの名前解決ではClusterIPが返却される．一方でHeadless Serviceの名前解決ではPodのIPアドレスが返却される． |
| SRVレコード    | ```_<ポート名>._<プロトコル>.<Service名>.<名前空間>.svc.cluster.local``` | 要勉強                                                       |

#### ・名前解決

Serviceのドメイン名を用いて，Pod内から```nslookup```コマンドの正引きを実行する．Serviceに```meta.name```タグが設定されている場合，Serviceのドメイン名は，```meta.name```タグの値になる．ドメイン名の設定を要求された時は，設定ミスを防げるため，```meta.name```タグの値よりも完全修飾ドメイン名の方が推奨である．

参考：https://kubernetes.io/docs/tasks/debug-application-cluster/debug-service/#does-the-service-work-by-dns-name

```bash
# Pod内から正引き
[root@<Pod名>:〜] $ nslookup <Serviceのmeta.name値>

Server:         10.96.0.10
Address:        10.96.0.10#53

Name:  <Serviceのmeta.name値>.<名前空間>.svc.cluster.local
Address:  10.105.157.184
```

ちなみに，異なる名前空間にあるServiceの名前解決を行う場合は，Serviceのドメイン名の後に名前空間を指定する必要がある．

```bash
# Pod内から正引き
[root@<Pod名>:〜] $ nslookup <Serviceのmeta.name値>.<名前空間>
```

<br>

