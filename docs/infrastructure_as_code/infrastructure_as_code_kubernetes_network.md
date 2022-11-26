---
title: 【IT技術の知見】ネットワーク＠Kubernetes
description: ネットワーク＠Kubernetesの知見を記録しています。
---

# ネットワーク＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. Kubernetesネットワーク

### Nodeネットワーク

#### ▼ Nodeネットワークとは

![kubernetes_node-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_node-network.png)

同じサブネットマスク内にあるワーカーNodeのNIC間を接続するネットワーク。Nodeネットワークの作成は、Kubernetesの実行環境のネットワークが担う。

> ℹ️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=10

<br>

### Serviceネットワーク

#### ▼ Serviceネットワークとは

![kubernetes_service-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_service-network.png)

Podのアウトバウンド通信に割り当てられたホスト名を認識し、そのホスト名を持つServiceまでアウトバウンド通信を送信する。Serviceネットワークの作成は、Kubernetesが担う。

> ℹ️ 参考：
>
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=13
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=39



<br>


### Clusterネットワーク

#### ▼ Clusterネットワークとは

![kubernetes_cluster-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cluster-network.png)

同じClusterネットワーク内にあるPodの仮想NIC（veth）間を接続するネットワーク。Clusterネットワークの作成は、cniアドオンが担う。

> ℹ️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=11

<br>

### Podネットワーク

#### ▼ Podネットワークとは

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

| 条件              | 経由するネットワーク                               |
|-----------------|--------------------------------------------|
| ワーカーNodeが異なる場合 | Nodeネットワーク + Clusterネットワーク + Serviceネットワーク |
| ワーカーNodeが同じ場合  | Clusterネットワーク + Serviceネットワーク              |

<br>

### ServiceのIPアドレスを使用する場合


kubeletは、Pod内のコンテナにServiceの宛先情報（IPアドレス、プロトコル、ポート番号）を出力する。Pod内のコンテナは、これを使用し、Serviceを介してPodにアウトバウンド通信を送信する。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/service/#discovering-services
> - https://cstoku.dev/posts/2018/k8sdojo-09/#%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%82%92%E5%88%A9%E7%94%A8%E3%81%97%E3%81%9Fservice%E3%81%B8%E3%81%AE%E6%8E%A5%E7%B6%9A 

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

### Serviceの完全修飾ドメイン名を使用する場合

Kubernetesに採用できる権威DNSサーバー（kube-dns、CoreDNS、HashiCorp Consul、など）は、ServiceのNSレコードを管理し、Serviceの完全修飾ドメイン名で名前解決できるようになる。Podのスケジューリング時に、kubeletはPod内のコンテナの```/etc/resolv.conf```ファイルに権威DNSサーバーのIPアドレスを設定する。Pod内のコンテナは、自身の```/etc/resolv.conf```ファイルで権威DNSサーバーのIPアドレスを確認し、DNSサーバーにPodのIPアドレスを正引きする。レスポンスに含まれる宛先のPodのIPアドレスを使用して、Podにアウトバウンド通信を送信する。

> ℹ️ 参考：
>
> - https://amateur-engineer-blog.com/kubernetes-dns/
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
```

<br>
