---
title: 【IT技術の知見】VCluster＠本番環境
description: VCluster＠本番環境
---

# VCluster＠本番環境

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. VClusterの仕組み

### アーキテクチャ

VCluster は、コントロールプレーン、Syncer、といったコンポーネントから構成されている。

仮想 Cluster 間では、Namespaced スコープはもちろん、Cluster スコープの Kubernetes リソースも分離できる。

![vcluster_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vcluster_architecture.png)

> - https://www.vcluster.com/docs/architecture/basics
> - https://www.vcluster.com/docs/what-are-virtual-clusters#why-use-virtual-kubernetes-clusters

<br>

### コントロールプレーン

ホスト Cluster 上に、Namespace を単位とした仮想 Cluster を作成する。

仮想 Cluster のバージョンは、ホスト Cluster に合わせる必要がある。

<br>

### Syncer

仮想 Cluster 内の仮想リソース (Service、Pod、ServiceAccount) を、ホスト Cluster にコピーする。

ホスト Cluster で受信したリクエストを実 Service にルーティングできれば、仮想 Cluster にもルーティングできる。

また、ホスト Cluster 上の ServiceAccount にクラウドプロバイダーの認可ロールを紐づければ、IRSA を実装できる。

> - https://www.vcluster.com/docs/operator/external-access

<br>

## 02. セットアップ

### インストール

#### ▼ vcluster cliの場合

```bash
# vcluster cliをインストールする
$ curl -L -o vcluster "https://github.com/loft-sh/vcluster/releases/latest/download/vcluster-linux-arm64"
$ sudo install -c -m 0755 vcluster /usr/local/bin

# 仮想Clusterを作成する
$ vcluster create <Cluster名> \
    -n <ClusterのNamespace名> \
    -f foo-values.yaml \
    --kubernetes-version=<バージョン>
```

> - https://www.vcluster.com/docs/getting-started/deployment
> - https://github.com/loft-sh/vcluster/tree/main/charts/eks#get-helm-repository-info

#### ▼ Helmの場合

Amazon EKS 上で仮想 Cluster を作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://charts.loft.sh

$ helm repo update

$ kubectl create namespace vcluster

# 仮想Clusterを作成する
$ helm install <Helmリリース名> <チャートリポジトリ名>/vcluster-eks -n vcluster --version <バージョンタグ>
```

> - https://www.vcluster.com/docs/getting-started/deployment
> - https://github.com/loft-sh/vcluster/tree/main/charts/eks#get-helm-repository-info

<br>

## 03. vclusterコマンド

### create

#### ▼ createとは

仮想 Cluster を作成する。

```bash
$ vcluster create foo-cluster \
    -n foo \
    --kubernetes-version=<バージョン>
```

> - https://www.vcluster.com/docs/getting-started/deployment

#### ▼ -f

使用する `values` ファイルを指定する。

```bash
$ vcluster create foo-cluster \
    -n foo \
    -f foo-values.yaml \
    --kubernetes-version=<バージョン>
```

#### ▼ --upgrade

仮想 Cluster の Kubernetes のバージョンをアップグレードする。

```bash
$ vcluster create foo-cluster \
    -n foo \
    --upgrade \
    --kubernetes-version=<バージョン>
```

> - https://github.com/loft-sh/vcluster/issues/519#issuecomment-1522026776

#### ▼ --isolate

仮想 Cluster からホスト Cluster へは名前解決不可能できないようにし、仮想 Cluster 間を分離する。

```bash
$ vcluster create foo-cluster \
    -n foo \
    --isolate \
    --kubernetes-version=<バージョン>
```

> - https://www.vcluster.com/docs/operator/security#isolated-mode

<br>

### connect

#### ▼ connectとは

仮想 Cluster にポートフォワーディングを実行する。

これを実行している間、仮想 Cluster に対して `kubectl` コマンドを実行できるようになる。

```bash
$ vcluster connect <Cluster名> \
    -n <ClusterのNamespace名>

[done] √ Virtual cluster kube config written to: ./kubeconfig.yaml. You can access the cluster via `kubectl --kubeconfig ./kubeconfig.yaml get namespaces`
[info]   Starting port forwarding: kubectl port-forward --namespace <Namespace名> <Cluster名> 8443:8443
Forwarding from 127.0.0.1:8443 -> 8443
Forwarding from [::1]:8443 -> 8443
```

> - https://ryusa.hatenablog.com/entry/2021/05/22/221614

なお、仮想 Cluster に直接的にコマンドを送信できる。

```bash
$ vcluster connect <Cluster名> \
    -n <ClusterのNamespace名> \
    -- kubectl get pod -A
```

<br>
