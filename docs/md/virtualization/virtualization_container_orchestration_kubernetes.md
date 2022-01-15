# Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. Kubernetesの操作

### kubernetesクライアント

#### ・kubernetesクライアントとは

kubernetesクライアントは、kubectlコマンドを用いて、kubernetesマスターAPIをコールできる。

<br>

## 02. kubernetesマスター（マスターノード）

### kubernetesマスターとは

![kubernetes_overview](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_overview.png)

ワーカーノードの操作を担う。『マスターノード』ともいう。クライアントがkubectlコマンドの実行すると、kube-apiserverがコールされ、コマンドに沿ってワーカーノードが操作される。

参考：

- https://kubernetes.io/ja/docs/concepts/#kubernetes%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC
- https://medium.com/easyread/step-by-step-introduction-to-basic-concept-of-kubernetes-e20383bdd118
- https://qiita.com/baby-degu/items/ce26507bd954621d6dc5

<br>

### cloud-controller-manager

#### ・cloud-controller-managerとは

kub-apiserverとクラウドインフラを仲介し、Kubernetesがクラウドインフラを操作できるようにする。

![kubernetes_cloud-controller-manager](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cloud-controller-manager.png)

<br>

### etcd

#### ・etcdとは

クラスターの様々な設定値を保持し、冗長化されたオブジェクト間にこれを共有する。

参考：https://thinkit.co.jp/article/17453

![kubernetes_etcd](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_etcd.png)

<br>

### kube-apiserver

#### ・kube-apiserverとは

kubernetesクライアントにkueneretes-APIを公開する。クライアントがkubernetesコマンドを実行すると、kubernetes-APIがコールされ、コマンドに沿ってオブジェクトが操作される。

参考：https://thinkit.co.jp/article/17453

![kubernetes_kube-apiserver](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-apiserver.png)

<br>

### kube-controller-manager

#### ・kube-controller-managerとは

様々なコントローラーを統括的に実行する。

参考：https://thinkit.co.jp/article/17453

<br>

### kube-scheduler

#### ・kube-schedulerとは

ワーカーノードとPodのスペックに基づいて、ワーカーノードに配置される適切なPod数を決定する。

参考：https://thinkit.co.jp/article/17453

![kubernetes_kube-scheduler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-scheduler.png)

<br>

## 03. クラスター、ワーカーノード

### クラスター

#### ・クラスターとは

ワーカーノードの管理単位のこと。

<br>

### ワーカーノード

#### ・ワーカーノードとは

Podが稼働するサーバー単位こと。

参考：https://kubernetes.io/ja/docs/concepts/architecture/nodes/

<br>

### コンテナランタイム（コンテナエンジン）

#### ・コンテナランタイムとは

イメージのプル、コンテナ構築削除、コンテナ起動停止、などを行う。

参考：https://thinkit.co.jp/article/17453

<br>

### kubelet

#### ・kubeletとは

kube-apiserverからコールされる。ワーカーノードのコンテナランタイムを操作し、Podを作成する。

参考：https://thinkit.co.jp/article/17453

![kubernetes_kubelet](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kubelet.png)

<br>

### kube-proxy

#### ・kube-proxyとは

ワーカーノード外部からのインバウンド通信をPodにルーティングする。モードごとに、Podの名前解決の方法が異なる。

参考：https://qiita.com/tkusumi/items/c2a92cd52bfdb9edd613

| モード    | 説明                                                         | 補足                                                         |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| iptables  | ![kubernetes_kube-proxy_iptables](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_iptables.png) | 参考：https://kubernetes.io/ja/docs/concepts/services-networking/service/#proxy-mode-iptables |
| userspace | ![kubernetes_kube-proxy_userspace](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_userspace.png) | 参考：https://kubernetes.io/ja/docs/concepts/services-networking/service/#proxy-mode-userspace |
| ipvs      | ![kubernetes_kube-proxy_ipvs](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_kube-proxy_ipvs.png) | 参考：https://kubernetes.io/ja/docs/concepts/services-networking/service/#proxy-mode-ipvs |

<br>

### Pod

#### ・Podとは

コンテナの最小グループ単位のこと。Podを単位として、コンテナ起動/停止や水平スケールイン/スケールアウトを実行する。

参考：https://kubernetes.io/ja/docs/concepts/workloads/pods/

**＊例＊**

PHP-FPMコンテナとNginxコンテナを稼働させる場合、これら同じPodに配置する。

![kubernetes_pod_php-fpm_nginx](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_pod_php-fpm_nginx.png)

#### ・同じPod内/異なるPod間の通信方法

同じPod内のコンテナ間は、『```localhost:<ポート番号>```』で通信できる。

参考：https://www.tutorialworks.com/kubernetes-pod-communication/#how-do-containers-in-the-same-pod-communicate

異なるPodのコンテナ間は、Serviceを経由して通信できる。

参考：https://kubernetes.io/docs/concepts/cluster-administration/networking/

<br>

### Service

#### ・Serviceとは

Serviceタイプごとに、特定のネットワーク範囲にPodを公開する。マイクロサービスアーキテクチャのコンポーネントである『Service』とは区別する。

参考：https://kubernetes.io/ja/docs/concepts/services-networking/service/

#### ・ClusterIP Service

クラスターのIPアドレスを返却し、Serviceに対するインバウンド通信をPodにルーティングする。クラスター内部からのみアクセスできる。クラスターのIPアドレスは、Podの```/etc/resolv.conf ```ファイルに記載されている。Pod内に複数のコンテナがある場合、各コンテナに同じ内容の```/etc/resolv.conf ```ファイルが配置される。デフォルトのタイプである。

参考：

- https://zenn.dev/suiudou/articles/aa2194b6f53f8f
- https://thinkit.co.jp/article/18263

```bash
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>] $ cat /etc/resolv.conf 

nameserver nn.nn.n.nn # クラスターのIPアドレス
search default.svc.cluster.local svc.cluster.local cluster.local 
options ndots:5
```

#### ・LoadBalancer Service

ロードバランサーのみからアクセスできるIPアドレスを返却し、Serviceに対するインバウンド通信をPodにルーティングする。クラスター外部/内部の両方からアクセスできる。本番環境をクラウドインフラ上で稼働させ、AWS ALBからインバウンド通信を受信する場合に用いる。ロードバランサーから各Serviceにインバウンド通信をルーティングすることになるため、通信数が増え、金銭的負担が大きい。

参考：

- https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0
- https://thinkit.co.jp/article/18263

#### ・NodePort Service

ノードのIPアドレスを返却し、Serviceの指定したポートに対するインバウンド通信をPodにルーティングする。クラスター外部/内部の両方からアクセスできる。1つのポートから1つのServiceにしかルーティングできない。ServiceノードのIPアドレスは別に確認する必要があり、ノードのIPアドレスが変わるたびに、これに合わせて他の設定を変更しなければならず、本番環境には向いていない。AWSのAurora RDSのクラスターエンドポイントには、NodePortの概念が取り入れられている。

参考：

- https://medium.com/google-cloud/kubernetes-nodeport-vs-loadbalancer-vs-ingress-when-should-i-use-what-922f010849e0
- https://thinkit.co.jp/article/18263

#### ・ExternalName Service

PodのCNAMEを返却し、Serviceに対するインバウンド通信をPodにルーティングする。

参考：https://thinkit.co.jp/article/13739

#### ・Headless Service

PodのIPアドレスを返却し、Serviceに対するインバウンド通信をPodにルーティングする。Podが複数ある場合は、DNSラウンドロビンのルールでIPアドレスが返却される。

参考：https://thinkit.co.jp/article/13739

<br>

### Ingress

#### ・Ingressとは

![kubernetes_ingress](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_ingress.png)

Ingressコントローラーによってクラスター外部から受信したインバウンド通信を、単一/複数のServiceにルーティングする。NodePort ServiceやLoadBalancer Serviceと同様に、外部からのインバウンド通信を受信する方法の1つである。

参考：

- https://kubernetes.io/docs/concepts/services-networking/ingress/#what-is-ingress
- https://thinkit.co.jp/article/18263

#### ・Ingressコントローラー

クラスター外部のインバウンド通信をIngressにルーティングする。

参考：https://www.nginx.com/blog/how-do-i-choose-api-gateway-vs-ingress-controller-vs-service-mesh/

#### ・Ingressコントローラーとして使用可能なもの

参考：https://kubernetes.io/ja/docs/concepts/services-networking/ingress-controllers/

| コントローラー名                                      | 開発環境 | 本番環境 |
| ----------------------------------------------------- | -------- | -------- |
| minikubeアドオン（実体はNginx Ingressコントローラー） | ◯        | ×        |
| AWS ALBコントローラー                                 | ×        | ◯        |
| GCP CLBコントローラー                                 | ×        | ◯        |
| Nginx Ingressコントローラー                           | ◯        | ◯        |
| Istio Ingress                                         | ◯        | ◯        |
| Istio Gateway（Ingressとしても使用できる）            | ◯        | ◯        |

<br>

### Secret

#### ・Secretとは

セキュリティに関するデータを管理し、コンテナに選択的に提供する。

#### ・コンテナの環境変数として

機密性の高い値を暗号化した状態で管理し、復号化した上で、環境変数としてPodに出力する。

参考：https://kubernetes.io/ja/docs/concepts/configuration/secret/#using-secrets-as-environment-variables

<br>

### ReplicaSet

#### ・ReplicaSetとは

ワーカーノード上のPod数を維持管理する。ただしDaemonSetとは異なり、Podを指定した個数に維持管理できる。ワーカーノードのCPUやメモリの使用率に合わせて、Podを動的に増減させる。直接ReplicaSetを操作するのではなく、Deployment用いてこれを行うことが推奨される。

参考：

- https://kubernetes.io/ja/docs/concepts/workloads/controllers/replicaset/#replicaset%E3%82%92%E4%BD%BF%E3%81%86%E3%81%A8%E3%81%8D
- https://thinkit.co.jp/article/13611

<br>

### DaemonSet

#### ・DaemonSetとは

ワーカーノード上のPod数を維持管理する。ただしReplicaSetとは異なり、Podを1つだけ維持管理する。ワーカーノードで1つだけ稼働させる必要のあるプロセス（FluentBit、Datadogなど）のために用いられる。

参考：https://thinkit.co.jp/article/13611

<br>

### StatefulSet

・StatefulSetとは

ReplicaSetを操作し、ワーカーノードのCPUやメモリの使用率に合わせて、Podを動的に増減させる。ただしDeploymentとは異なり、ストレートフルなコンテナを含むPodを扱うことができる。Podが削除されてもPersistentVolumeClaimsは削除されないため、新しいPodにも同じPersistentVolumeを継続的にマウントできる。その代わり、StatefulSetの作成後に一部の設定変更が禁止されている。

```bash
The StatefulSet "foo-pod" is invalid: spec: Forbidden: updates to statefulset spec for fields other than 'replicas', 'template', 'updateStrategy' and 'minReadySeconds' are forbidden
```

参考：

- https://kubernetes.io/ja/docs/concepts/workloads/controllers/statefulset/#%E5%AE%89%E5%AE%9A%E3%81%97%E3%81%9F%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B8
- https://sorarinu.dev/2021/08/kubernetes_01/

<br>

### Deployment

#### ・Deploymentとは

ReplicaSetを操作し、ワーカーノードのCPUやメモリの使用率に合わせて、Podを動的に増減させる。ただしStatefulSetとは異なり、ストレートレスなコンテナを含むPodを扱う。

参考：

- https://kubernetes.io/ja/docs/concepts/workloads/controllers/deployment/
- https://sorarinu.dev/2021/08/kubernetes_01/

<br>

## 04. ボリューム

### Volume

#### ・Volumeとは

既存のボリュームをそのままKubernetesのボリュームとして用いる方法のこと。

参考：https://thinkit.co.jp/article/14195

#### ・HostPath（本番環境で非推奨）

ノード上の既存のストレージ領域をボリュームとし、コンテナにマウントする。ノードとPod内コンテナ間のバインドマウントによって作成され、同一ノード上のPod間でこのボリュームを共有できる。

参考：https://qiita.com/umkyungil/items/218be95f7a1f8d881415

以下の通り、HostPathではバインドマウントが使用されていることを確認できる。

```bash
# ノード内でdockerコマンドを実行
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

#### ・EmptyDir

Podの既存のストレージ領域をボリュームとし、コンテナにマウントする。そのため、Podが削除されると、このボリュームも同時に削除される。ボリュームマウントによって作成され、ノード上のPod間でボリュームを共有できない。

参考：https://qiita.com/umkyungil/items/218be95f7a1f8d881415

#### ・外部ボリューム

クラウドベンダーやNFSから提供されるストレージ領域を用いたボリュームとし、コンテナにマウントする。

参考：https://zenn.dev/suiudou/articles/31ab107f3c2de6#%E2%96%A0kubernetes%E3%81%AE%E3%81%84%E3%82%8D%E3%82%93%E3%81%AA%E3%83%9C%E3%83%AA%E3%83%A5%E3%83%BC%E3%83%A0

<br>

### PersistentVolume

#### ・PersistentVolumeとは

新しく作成したストレージ領域をPluggableなボリュームとし、これをコンテナにマウントする方法のこと。ボリュームマウントによって作成され、ノード上のPod間でボリュームを共有できる。PodがPersistentVolumeを用いるためには、PersistentVolumeClaimオブジェクトにPersistentVolumeを要求させておき、PodでこのPersistentVolumeClaimオブジェクトを指定する必要がある。

参考：https://thinkit.co.jp/article/14195

#### ・HostPath（本番環境で非推奨）

ノード上に新しく作成したストレージ領域をボリュームとし、これをコンテナにマウントする。機能としては、VolumeでのHostPathと同じである。マルチノードには対応していないため、本番環境では非推奨である。

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes

#### ・Local（本番環境で推奨）

ノード上に新しく作成したストレージ領域をボリュームとし、これをコンテナにマウントする。マルチノードに対応している（明言されているわけではく、HostPathとの明確な違いがよくわからない）。

参考：

- https://kubernetes.io/docs/concepts/storage/volumes/#local
- https://qiita.com/sotoiwa/items/09d2f43a35025e7be782#local

<br>

### 確認方法

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

<br>

## 05. ネットワーキング

### Serviceの名前解決

#### ・レコードタイプとドメイン名の関係

クラスター内の全てのServiceにDNS名が割り当てられている。レコードタイプごとに、DNS名が異なる。

参考：https://kubernetes.io/ja/docs/concepts/services-networking/dns-pod-service/#services

| レコードタイプ | 完全修飾ドメイン名                                           | 名前解決の仕組み                                             |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| A/AAAAレコード | ```<Service名>.<名前空間>.svc.<クラスターのドメイン名>```   | 通常のServiceの名前解決ではClusterIPが返却される。一方でHeadless Serviceの名前解決ではPodのIPアドレスが返却される。 |
| SRVレコード    | ```_<ポート名>._<プロトコル>.<Service名>.<名前空間>.svc.cluster.local``` | 要勉強                                                       |

#### ・名前解決

Serviceのドメイン名を用いて、Pod内から```nslookup```コマンドの正引きを実行する。Serviceに```meta.name```タグが設定されている場合、Serviceのドメイン名は、```meta.name```タグの値になる。ドメイン名の設定を要求された時は、設定ミスを防げるため、```meta.name```タグの値よりも完全修飾ドメイン名の方が推奨である。

参考：https://kubernetes.io/docs/tasks/debug-application-cluster/debug-service/#does-the-service-work-by-dns-name

```bash
# Pod内から正引き
[root@<Pod名>:〜] $ nslookup <Serviceのmeta.name値>

Server:         10.96.0.10
Address:        10.96.0.10#53

Name:  <Serviceのmeta.name値>.<名前空間>.svc.cluster.local
Address:  10.105.157.184
```

ちなみに、異なる名前空間にあるServiceの名前解決を行う場合は、Serviceのドメイン名の後に名前空間を指定する必要がある。

```bash
# Pod内から正引き
[root@<Pod名>:〜] $ nslookup <Serviceのmeta.name値>.<名前空間>
```

<br>

### Podの名前解決

#### ・ドメイン名

クラスター内の全てのPodにDNS名が割り当てられている。レコードタイプはA/AAAAレコードのみである。

参考：https://kubernetes.io/ja/docs/concepts/services-networking/dns-pod-service/#pod

| レコードタイプ | ドメイン名                                              | 名前解決の仕組み                 |
| -------------- | ------------------------------------------------------- | -------------------------------- |
| A/AAAAレコード | ```<PodのIPアドレス>.<名前空間>.pod.cluster.local``` | PodのIPアドレスが返却される。 |

