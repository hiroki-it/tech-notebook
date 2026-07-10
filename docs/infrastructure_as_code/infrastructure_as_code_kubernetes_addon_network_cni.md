---
title: 【IT技術の知見】CNI＠ネットワーク系
description: CNI＠ネットワーク系の知見を記録しています。
---

# CNI＠ネットワーク系

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. CNI

### CNIとは

CNI は、Cluster 内に `L2` または `L3` を提供する (CNI によってさまざま) 。

Pod を新しく作成するときに、kubelet からのリクエストによって、新しい Pod を Cluster ネットワークに参加させる。

kubelet は、設定ファイルで指定された CNI を実行する。

その後、CNI は Pod に仮想 NIC を紐付け、Node 内の Cluster ネットワークの IP アドレスを Pod の仮想 NIC に割り当てる。

Pod を Node 内の Cluster ネットワークに参加させると、異なる Node 上の Pod 間で通信できるようになる。

![kubernetes_cni-plugin](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cni-plugin.png)

> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=29
> - https://kubernetes.io/docs/concepts/cluster-administration/networking/
> - https://techblog.yahoo.co.jp/infrastructure/kubernetes_calico_networking/

<br>

### CNIとCRIの関係

> - https://jimmysong.io/blog/cni-deep-dive/

<br>

### CNIによるクラスター内の通信

#### ▼ PodとNode間の通信

> - https://zenn.dev/taisho6339/books/fc6facfb640d242dc7ec/viewer/166890

#### ▼ 同じNode上のPod間

> - https://zenn.dev/taisho6339/books/fc6facfb640d242dc7ec/viewer/238ea7

#### ▼ 異なるNode上のPod間

> - https://zenn.dev/taisho6339/books/fc6facfb640d242dc7ec/viewer/0d112c#calico%E6%96%B9%E5%BC%8F

<br>

## 02. オーバーレイモード

### オーバーレイモードとは

オーバーレイモードは、複数のコンポーネントから構成される。例えば、Pod のネットワークインターフェース (`eth`) 、Node の仮想ネットワークインターフェース (`veth`) 、Node のブリッジ (`cni`) がある。また、NAT ルーター (Cilium 以外の CNI は iptables、Cilium CNI は Cilium) と、Node のネットワークインターフェース (`eth`) がある。

オーバーレイネットワークを使用して、Cluster ネットワークを作成し、異なる Node 上の Pod 間を接続する。

![kubernetes_cni-addon_overlay-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cni-addon_overlay-mode.png)

> - https://www.netone.co.jp/knowledge-center/netone-blog/20191226-1/
> - https://www.netstars.co.jp/kubestarblog/k8s-3/
> - https://www1.gifu-u.ac.jp/~hry_lab/rs-overlay.html
> - https://www.slideshare.net/ThomasGraf5/cilium-bringing-the-bpf-revolution-to-kubernetes-networking-and-security#28
> - https://caddi.tech/archives/3864

<br>

### CNI例

CNI によって、`L2` または `L3` を提供する。

- calico-ipip (`L3`、Kubeadm で推奨)
- flannel-vxlan (`L2`)
- Weave (`L2`)
- Cilium (`L3`/`L4`/`L7`)

> - https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#pod-network
> - https://techblog.yahoo.co.jp/infrastructure/kubernetes_calico_networking/
> - https://zenn.dev/taisho6339/books/fc6facfb640d242dc7ec/viewer/0d112c#flannel%E6%96%B9%E5%BC%8F
> - https://medium.com/mhiro2/learn-calico-3f4962b2c26c

<br>

### オーバーレイモードの仕組み

#### ▼ 同一Node上のPod間通信

Pod のネットワークインターフェース (`eth`) 、Node の仮想ネットワークインターフェース (`veth`) 、Node のブリッジ (`cni`) を使用して、同じ Node 上の Pod 間でパケットを送受信する。

![kubernetes_cni-addon_overlay-mode_same-node](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cni-addon_overlay-mode_same-node.png)

> - https://qiita.com/sugimount/items/ed07a3e77a6d4ab409a8#pod%E5%90%8C%E5%A3%AB%E3%81%AE%E9%80%9A%E4%BF%A1%E5%90%8C%E4%B8%80%E3%81%AEnode

#### ▼ 異なるNode上のPod間通信

Pod のネットワークインターフェース (`eth`) 、Node の仮想ネットワークインターフェース (`veth`) 、Node のブリッジ (`cni`) を使用する。また、NAT ルーター (Cilium 以外は iptables、Cilium) と Node のネットワークインターフェース (`eth`) を使用する。そして、異なる Node 上の Pod 間でパケットを送受信する。

![kubernetes_cni-addon_overlay-mode_diff-node](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cni-addon_overlay-mode_diff-node.png)

> - https://qiita.com/sugimount/items/ed07a3e77a6d4ab409a8#pod%E5%90%8C%E5%A3%AB%E3%81%AE%E9%80%9A%E4%BF%A1%E7%95%B0%E3%81%AA%E3%82%8Bnode

<br>

## 03. ルーティングモード

### ルーティングモードとは

ルーティングテーブルを使用して、Cluster ネットワークを作成し、異なる Node 上の Pod 間を接続する。

> - https://www.netstars.co.jp/kubestarblog/k8s-3/
> - https://medium.com/elotl-blog/kubernetes-networking-on-aws-part-ii-47906de2921d

<br>

### CNI例

CNI によって、`L2` または `L3` を提供する。

- calico-bgp (`L3`、Kubeadm で推奨)
- flannel-hostgw (`L3`)
- sriov

> - https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#pod-network
> - https://techblog.yahoo.co.jp/infrastructure/kubernetes_calico_networking/
> - https://medium.com/mhiro2/learn-calico-3f4962b2c26c

<br>

## 04. アンダーレイモード

### アンダーレイモードとは

アンダーレイネットワークを使用して、Cluster ネットワークを作成し、異なる Node 上の Pod 間を接続する。

> - https://www.netstars.co.jp/kubestarblog/k8s-3/

<br>

### CNI例

CNI によって、`L2` または `L3` を提供する。

- Aliyun

<br>

## 06. その他のCNI

- Antrea (`L3`/`L4`)
- Multus
- Whereabout

> - https://qiita.com/ynakaoku/items/14884f4fb04423bf9747
> - https://antrea.io/docs/v1.11.3/

<br>
