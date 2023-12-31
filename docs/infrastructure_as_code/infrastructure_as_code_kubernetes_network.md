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

## 07. 通信のデバッグ

### Podのアウトバウンド通信のデバッグ

#### ▼ `kubectl run`コマンド

`kubectl exec`コマンドが運用的に禁止されているような状況がある。

そのような状況下で、シングルNodeの場合は、`kubectl run`コマンドで、`--rm`オプションを有効化し、Clusterネットワーク内に`curl`コマンドによる検証用のPodを一時的に新規作成する。

```bash
# シングルNodeの場合

# curl送信用のコンテナを作成する。
# rmオプションを指定し、使用後に自動的に削除されるようにする。
$ kubectl run \
    -n default \
    -it multitool \
    --image=praqma/network-multitool \
    --rm \
    --restart=Never \
    -- /bin/bash

# curlコマンドでデバッグする。
[root@<Pod名>:~] $ curl -X GET https://<Serviceの完全修飾ドメイン名やIPアドレス>

# tcptracerouteコマンドでデバッグする。
[root@<Pod名>:~] $ tcptraceroute <Serviceの完全修飾ドメイン名やIPアドレス>

# mtrコマンドでデバッグする。
[root@<Pod名>:~] $ mtr <Serviceの完全修飾ドメイン名やIPアドレス>
```

#### ▼ `kubectl debug node`コマンド

マルチNodeの場合は、指定したNode上でPodを作成できない。

(たぶん) 名前が一番昇順のNode上でPodが作成されてしまい、Nodeを指定できない。

そのため、代わりに`kubectl debug`コマンドを使用する。

ただし、`kubectl debug`コマンドで作成されたPodは、使用後に手動で削除する必要がある。

```bash
# マルチNodeの場合

# Podが稼働するNodeを確認する。
$ kubectl get pod <Pod名> -o wide

# 指定したNode上で、curl送信用のコンテナを作成する。
# rmオプションはない。
$ kubectl debug node/<Node名> \
    -n default \
    -it \
    --image=praqma/network-multitool

[root@<Pod名>:~] $exit

# 使用後は手動で削除する。
$ kubectl delete -n default node-debugger-*****
```

> - https://qiita.com/tkusumi/items/a62c209972bd0d4913fc
> - https://scrapbox.io/jiroshin-knowledge/kubernetes_cluster%E3%81%ABcurl%E3%81%AEPod%E3%82%92%E7%AB%8B%E3%81%A6%E3%81%A6%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A%E3%83%AD%E3%82%B0%E3%82%A4%E3%83%B3%E3%81%99%E3%82%8B%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89

#### ▼ デバッグ用Podを起動しておく

デバッグ用Podを起動しておく方法もある。

`curl`コマンド専用イメージを使用する場合、コンテナ起動後に`curl`コマンドを実行し、すぐに終了してしまう。

そのため、CrashLoopBackOffになってしまう。

これを防ぐために、`sleep infinity`コマンドを実行し、ずっとスリープするようにしておく。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: foo
  template:
    metadata:
      labels:
        app: foo
    spec:
      containers:
        - name: foo-curl
          image: curlimages/curl:8.5.0
          imagePullPolicy: IfNotPresent
          command:
            - sleep
            - infinity
```

> - https://vamdemicsystem.black/kubernetes/%E3%80%90kubernetes%E3%80%91kubernetes%E3%81%A7ubuntu%E3%82%A4%E3%83%A1%E3%83%BC%E3%82%B8%E3%82%92%E8%B5%B7%E5%8B%95%E3%81%99%E3%82%8Bdeployment%E3%81%AE%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB

<br>
