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

![kubernetes_cni-plugin](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cni-plugin.png)

Podを新しく作成する時に、kubeletからのリクエストによって、新しいPodをClusterネットワークに参加させる。

kubeletは、設定ファイルで指定されたCNIを実行する。

その後、CNIはPodに仮想NICを紐付け、Node内のClusterネットワークのIPアドレスをPodの仮想NICに割り当てる。

PodをNode内のClusterネットワークに参加させると、異なるNode上のPod間で通信できるようになる。

> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=29
> - https://kubernetes.io/docs/concepts/cluster-administration/networking/

<br>

### CNIとCRIの関係

> - https://jimmysong.io/blog/cni-deep-dive/

<br>

## 02. オーバーレイモード

### オーバーレイモードとは

オーバーレイモードは、Podのネットワークインターフェース (`eth`) 、Nodeの仮想ネットワークインターフェース (`veth`) 、Nodeのブリッジ (`cni`) 、NATルーター (Cilium以外のCNIはiptables、CiliumアドオンはCilium) 、Nodeのネットワークインターフェース (`eth`) 、といったコンポーネントから構成される。

オーバーレイネットワークを使用して、Clusterネットワークを作成し、異なるNode上のPod間を接続する。

![kubernetes_cni-addon_overlay-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cni-addon_overlay-mode.png)

> - https://www.netone.co.jp/knowledge-center/netone-blog/20191226-1/
> - https://www.netstars.co.jp/kubestarblog/k8s-3/
> - https://www1.gifu-u.ac.jp/~hry_lab/rs-overlay.html
> - https://www.slideshare.net/ThomasGraf5/cilium-bringing-the-bpf-revolution-to-kubernetes-networking-and-security#28
> - https://caddi.tech/archives/3864

<br>

### アドオン例

- calico-ipip (`L3`、Kubeadmで推奨)
- flannel-vxlan (`L2`)
- Weave
- Cilium

> - https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#pod-network
> - https://techblog.yahoo.co.jp/infrastructure/kubernetes_calico_networking/

<br>

### オーバーレイモードの仕組み

#### ▼ 同一Node上のPod間通信

Podのネットワークインターフェース (`eth`) 、Nodeの仮想ネットワークインターフェース (`veth`) 、Nodeのブリッジ (`cni`) 、を使用して、同じNode上のPod間でパケットを送受信する。

![kubernetes_cni-addon_overlay-mode_same-node](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cni-addon_overlay-mode_same-node.png)

> - https://qiita.com/sugimount/items/ed07a3e77a6d4ab409a8#pod%E5%90%8C%E5%A3%AB%E3%81%AE%E9%80%9A%E4%BF%A1%E5%90%8C%E4%B8%80%E3%81%AEnode

#### ▼ 同一Node上のPod間通信

Podのネットワークインターフェース (`eth`) 、Nodeの仮想ネットワークインターフェース (`veth`) 、Nodeのブリッジ (`cni`) 、NATルーター (Cilium以外はiptables、Cilium) 、Nodeのネットワークインターフェース (`eth`) を使用して、異なるNode上のPod間でパケットを送受信する。

![kubernetes_cni-addon_overlay-mode_diff-node](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cni-addon_overlay-mode_diff-node.png)

> - https://qiita.com/sugimount/items/ed07a3e77a6d4ab409a8#pod%E5%90%8C%E5%A3%AB%E3%81%AE%E9%80%9A%E4%BF%A1%E7%95%B0%E3%81%AA%E3%82%8Bnode

<br>

## 03. ルーティングモード

### ルーティングモードとは

ルーティングテーブルを使用して、Clusterネットワークを作成し、異なるNode上のPod間を接続する。

> - https://www.netstars.co.jp/kubestarblog/k8s-3/
> - https://medium.com/elotl-blog/kubernetes-networking-on-aws-part-ii-47906de2921d

<br>

### アドオン例

- calico-bgp (`L3`、Kubeadmで推奨)
- flannel-hostgw (`L2`)
- sriov

> - https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/#pod-network
> - https://techblog.yahoo.co.jp/infrastructure/kubernetes_calico_networking/

<br>

## 04. アンダーレイモード

### アンダーレイモードとは

アンダーレイネットワークを使用して、Clusterネットワークを作成し、異なるNode上のPod間を接続する。

> - https://www.netstars.co.jp/kubestarblog/k8s-3/

<br>

### アドオン例

- Aliyun

<br>

## 05. AWSの独自モード

### AWSの独自モードとは

> - https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_cloud_provider_aws_eks.html

<br>

### アドオン例

- aws-eks-vpc-cni (AWS EKSで推奨)

<br>

## 06. 未分類のアドオン

- Antrea
- Multus
- Whereabout

> - https://qiita.com/ynakaoku/items/14884f4fb04423bf9747

<br>
