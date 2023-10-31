---
title: 【IT技術の知見】ネットワーク＠Kubernetes
description: ネットワーク＠Kubernetesの知見を記録しています。
---

# ネットワーク＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Nodeネットワーク

### Nodeネットワークとは

同じサブネットマスク内にあるNodeのNIC間を接続するネットワーク。

Nodeネットワークの作成は、Kubernetesの実行環境のネットワークが担う。

![kubernetes_node-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_node-network.png)

> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=10

<br>

## 02. Serviceネットワーク

### Serviceネットワークとは

Podのアウトバウンド通信に割り当てられたホスト名を認識し、そのホスト名を持つServiceまでリクエストを送信する。

Serviceネットワークの作成は、Kubernetesが担う。

![kubernetes_service-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_service-network.png)

> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=13
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=39

<br>

## 03. Clusterネットワーク

### Clusterネットワークとは

同じClusterネットワーク内にあるPodの仮想NIC (veth) 間を接続するネットワーク。

Clusterネットワークの作成は、CNIアドオンが担う。

![kubernetes_cluster-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cluster-network.png)

> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=11

<br>

## 04. Podネットワーク

### Podネットワークとは

Pod内のネットワークのみを経由して、他のコンテナにリクエストを送信する。

Podごとにネットワークインターフェースが付与され、またIPアドレスが割り当てられる。

> - https://www.tutorialworks.com/kubernetes-pod-communication/#how-do-containers-in-the-same-pod-communicate

<br>

### 名前空間

#### ▼ 名前空間の種類

Podのネットワークは複数の種類の名前空間から構成される。

ネットワークの範囲に応じて、コンテナが同じNode内のいずれのコンポーネントのプロセスと通信できるようになるのかが決まる。

注意点として、Dockerとは名前空間の種類が異なる。

![kubernetes_pod-network_namespace.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_pod-network_namespace.png)

> - https://www.ianlewis.org/en/what-are-kubernetes-pods-anyway

#### ▼ IPC名前空間

プロセスは、同じIPC名前空間に属する他のプロセスと通信できる。

Kubernetesのセキュリティ上の理由から、デフォルトではPod内のコンテナはホスト (Node) とは異なるIPC名前空間を使用し、ネットワークを分離している。

そのため、コンテナのプロセスはNodeのプロセスと通信できないようになっている。

> - https://qiita.com/mamorita/items/15437a1dbcc00919fa4e
> - https://www.fairwinds.com/blog/kubernetes-basics-tutorial-host-ipc-should-not-be-configured
> - https://medium.com/@chrispisano/limiting-pod-privileges-hostpid-57ce07b05896

### Network名前空間

<br>

### PID名前空間

<br>

### Hostname名前空間

<br>

### cgroup名前空間

<br>

## 05. ネットワークレイヤー

### Ingressコントローラー由来の`L7`ロードバランサーの場合

Ingressコントローラーの場合、`L7`ロードバランサーをプロビジョニングする。

Ingressコントローラーによる`L7`ロードバランサーは、受信した通信をServiceにルーティングする。

Serviceは`L4`ロードバランサーとして、インバウンド通信をPodにルーティングする。

![kubernetes_network_l4-l7.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_network_l4-l7.png)

> - https://www.netone.co.jp/media/detail/20191226-1/

<br>

### LoadBalancer Service由来の`L4`ロードバランサーの場合

LoadBalancer Serviceの場合、`L4`ロードバランサーをプロビジョニングする。

<br>

## 06. Pod間通信

### Pod間通信の経路

Pod内のコンテナから宛先のPodにリクエストを送信する。

この時、PodをスケジューリングさせているNodeが同じ/異なるかのいずれの場合で、経由するネットワークが異なる。

| 条件             | 経由するネットワーク                                         |
| ---------------- | ------------------------------------------------------------ |
| Nodeが異なる場合 | Nodeネットワーク + Clusterネットワーク + Serviceネットワーク |
| Nodeが同じ場合   | Clusterネットワーク + Serviceネットワーク                    |

> - https://kubernetes.io/docs/concepts/cluster-administration/networking/

<br>

### 通信方法

同じPod内のコンテナ間は『`localhost:<ポート番号>`』で通信できる。

```bash
# Pod内のコンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>:~] $ curl -X GET http://127.0.0.1:<ポート番号>
```

<br>

### PodのIPアドレスを指定する場合

#### ▼ 仕組み

Pod内のコンテナで、宛先のPodのIPアドレスやポート番号を直接的に指定する。

ただし、PodのIPアドレスは動的に変化するため、現実的な方法ではない。

**＊例＊**

foo-podから、IPアドレス (`11.0.0.1`) とポート番号 (`80`) を指定して、bar-podにパケットを送信してみる。

```bash
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -- bash -c "traceroute 11.0.0.1 -p 80"

traceroute to 11.0.0.1 (11.0.0.1), 30 hops max, 46 byte packets
 1  *-*-*-*.prometheus-kube-proxy.kube-system.svc.cluster.local (*.*.*.*)    0.007 ms  0.022 ms  0.005 ms
 2  *-*-*-*.prometheus-node-exporter.prometheus.svc.cluster.local (*.*.*.*)  1.860 ms  1.846 ms  1.803 ms
 3  11.0.0.1.bar-service.bar-namespace.svc.cluster.local (11.0.0.1)          1.848 ms  1.805 ms  1.834 ms # 宛先のPod
```

```bash
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -- bash -c "traceroute -n 11.0.0.1 -p 80"

traceroute to 11.0.0.1 (11.0.0.1), 30 hops max, 46 byte packets
 1  *.*.*.*   0.007 ms  0.022 ms  0.005 ms
 2  *.*.*.*   1.860 ms  1.846 ms  1.803 ms
 3  11.0.0.1  1.848 ms  1.805 ms  1.834 ms # 宛先のPod
```

<br>

### ServiceのIPアドレスを指定する場合

#### ▼ 仕組み

kubeletは、Pod内のコンテナにServiceの宛先情報 (プロトコル、IPアドレス、ポート番号) を出力する。

Pod内のコンテナは、これを使用し、Serviceを介してPodにリクエストを送信する。

> - https://kubernetes.io/docs/concepts/services-networking/service/#discovering-services
> - https://cstoku.dev/posts/2018/k8sdojo-09/#%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%82%92%E5%88%A9%E7%94%A8%E3%81%97%E3%81%9Fservice%E3%81%B8%E3%81%AE%E6%8E%A5%E7%B6%9A

**＊実装例＊**

foo-serviceというServiceを作成した場合の環境変数を示す。

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

### Serviceの完全修飾ドメイン名を指定する場合

#### ▼ 仕組み

Kubernetesに採用できる権威DNSサーバー (kube-dns、CoreDNS、HashiCorp Consul、など) は、ServiceのNSレコードを管理し、Serviceの完全修飾ドメイン名で名前解決できるようになる。

Podのスケジューリング時に、kubeletはPod内のコンテナの`/etc/resolv.conf`ファイルに権威DNSサーバーのIPアドレスを設定する。

Pod内のコンテナは、自身の`/etc/resolv.conf`ファイルで権威DNSサーバーのIPアドレスを確認し、DNSサーバーにPodのIPアドレスを正引きする。

レスポンスに含まれる宛先のPodのIPアドレスを使用して、Podにリクエストを送信する。

```bash
# Pod内のコンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

# コンテナのresolv.confファイルの中身を確認する
[root@<Pod名>] $ cat /etc/resolv.conf

# 権威DNSサーバーのIPアドレス
nameserver 10.96.0.10
search default.svc.cluster.local svc.cluster.local cluster.local
# 名前解決時のローカルドメインの優先度
options ndots:5
```

> - https://amateur-engineer-blog.com/kubernetes-dns/
> - https://blog.mosuke.tech/entry/2020/09/09/kuubernetes-dns-test/
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=42

#### ▼ ndots

宛先コンテナの名前解決時のドット数を設定する。

ドット数が多ければ多いほど、ローカルドメインから網羅的に名前解決を実施するため、ハードウェアリソースの消費が高くなる。

例えば、`ndots:5`としたPodが`example.com`を名前解決する場合、ドット数は`5`になる。

そのため、最初は`example.com.default.svc.cluster.local.`から名前解決を始め、`example.com.`で終わる。

`(1)`

: `example.com.default.svc.cluster.local.`

`(2)`

: `example.com.svc.cluster.local.`

`(3)`

: `example.com.cluster.local.`

`(4)`

: `example.com.ec2.internal.`

`(5)`

: `example.com.`

> - https://techblog.stanby.co.jp/entry/EKS_Coredns
> - https://zenn.dev/toversus/articles/d9faba80f68ea2#kubernetes-%E3%81%AE%E8%A8%AD%E8%A8%88%E6%80%9D%E6%83%B3

<br>
