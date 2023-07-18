---
title: 【IT技術の知見】クライアントパッケージ＠開発
description: クライアントパッケージ＠開発の知見を記録しています。
---

# クライアントパッケージ＠開発

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. client-go

### client-goとは

Kubernetesのkube-apiserverと通信できるパッケージ。

使用できるAPIの型を拡張するために、`k8s.io/api`パッケージや`k8s.io/apimachinery`パッケージも必要になる。

> - https://zenn.dev/castaneai/articles/k8s-go-client-first-step

<br>

### セットアップ

kube-apiserverの認証/認可を通過するために、`kubeconfig`ファイルをコンテナにマウントする必要がある。

> - https://nishipy.com/archives/1363

<br>

### client-goパッケージとkube-apiserverのバージョン整合性

#### ▼ client-goパッケージとkube-apiserverの間

`kubectl`コマンドとkube-apiserverのバージョンの整合性と同様にして、client-goパッケージにもkube-apiserverのバージョンと整合性がある。

例えば、client-goパッケージの`0.20.4`は、kube-apiserverの`v1.20.4`に対応している。

```
We recommend using the v0.x.y tags for Kubernetes releases >= v1.17.0 and kubernetes-1.x.y tags for Kubernetes releases < v1.17.0.
```

kube-apiserverとクライアント側のバージョン差は、前方/後方の`1`個のマイナーバージョン以内に収めることが推奨されており、client-goパッケージにもこのポリシーが適用される。

そのため、client-goパッケージを定期的にアップグレードする必要がある。

> - https://github.com/kubernetes/client-go/blob/master/INSTALL.md#using-a-specific-version
> - https://kubernetes.io/releases/version-skew-policy/#kubectl

#### ▼ client-goパッケージとマニフェストの間

Kubernetesのマニフェストには`.apiVersion`キーが定義されている。

kube-apiserverのバージョンに応じて、公式リポジトリが用意するマニフェストにて、`.apiVersion`キーが`v1`から`v2`になることがある。

この場合、client-goパッケージがこの`.apiVersion`キーに対応していないと、kube-apiserverにそのマニフェストを送信できない。

反対に、マニフェストですでに廃止済みの`.apiVersion`キーが指定されていて、client-goパッケージでもこれが廃止されていても、同様のことが起こる。

そのため、client-goパッケージを定期的にアップグレードする必要がある。

> - https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#-strong-api-groups-strong-

#### ▼ 調査例

ArgoCDの`2.3.0`では、client-goパッケージのバージョンが`0.23.1`であった。

> - https://github.com/argoproj/argo-cd/blob/v2.3.0/go.mod#L83

このことから、ArgoCDは`2.3.0`がKubernetesの`1.23.1`で稼働できることがわかる。

なお、デプロイ先のClusterとしていずれのバージョンに対応しているかは、`gitops-engine`パッケージを確認する必要がある。

Kubernetesの`1.23.1`が対応しているAPIグループのバージョンから、マニフェストで使用できる`.apiVersion`がわかる。

> - https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#-strong-api-groups-strong-

<br>
