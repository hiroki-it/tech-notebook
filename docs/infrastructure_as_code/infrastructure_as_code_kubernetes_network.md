---
title: 【IT技術の知見】ネットワーク＠Kubernetes
description: ネットワーク＠Kubernetesの知見を記録しています。
---

# ネットワーク＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>


## 01. Kubernetesネットワーク

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

[root@<Pod名>:~] $ curl -X GET http://127.0.0.1:<ポート番号>
```

<br>

## 02. Pod間通信

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
> - https://eng-blog.iij.ad.jp/archives/9998

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

<br>

### 通信方法

#### ▼ 事前確認

（１）Serviceがルーティング先のポート番号を確認する。

```bash
$ kubectl get service <Service名> -o yaml | grep targetPort:
```

（２）Serviceがルーティング先のPodにて、コンテナが待ち受けるポート番号を確認する。注意点として、```spec.containers.ports```キーは単なる仕様であり、記載されていなくとも、コンテナのポートが公開されている可能性がある。

```bash
# 先にmetadata.labelキーから、Serviceのルーティング先のPodを確認する
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
