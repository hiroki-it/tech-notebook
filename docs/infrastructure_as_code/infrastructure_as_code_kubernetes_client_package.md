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

Kubernetes の kube-apiserver と通信できるパッケージ。

使用できる API の型を拡張するために、`k8s.io/api` パッケージや `k8s.io/apimachinery` パッケージも必要になる。

> - https://zenn.dev/castaneai/articles/k8s-go-client-first-step

<br>

### セットアップ

kube-apiserver の認証/認可を通過するために、`kubeconfig` ファイルをコンテナにマウントする必要がある。

> - https://nishipy.com/archives/1363

<br>

### client-goパッケージとkube-apiserverのバージョン整合性

#### ▼ client-goパッケージとkube-apiserverの間

`kubectl` コマンドと kube-apiserver のバージョンの整合性と同様にして、client-go パッケージにも kube-apiserver のバージョンと整合性がある。

例えば、client-go パッケージの `0.20.4` は、kube-apiserver の `v1.20.4` をサポートしている。

```
We recommend using the v0.x.y tags for Kubernetes releases >= v1.17.0 and kubernetes-1.x.y tags for Kubernetes releases < v1.17.0.
```

kube-apiserver とクライアント側のバージョン差は、前方/後方の `1` 個のマイナーバージョン以内に収めることが推奨されており、client-go パッケージにもこのポリシーが適用される。

そのため、client-go パッケージを定期的にアップグレードする必要がある。

> - https://github.com/kubernetes/client-go/blob/master/INSTALL.md#using-a-specific-version
> - https://kubernetes.io/releases/version-skew-policy/#kubectl

#### ▼ client-goパッケージとマニフェストの間

Kubernetes のマニフェストには `.apiVersion` キーが定義されている。

kube-apiserver のバージョンに応じて、公式リポジトリが用意するマニフェストにて、`.apiVersion` キーが `v1` から `v2` になることがある。

この場合、client-go パッケージがこの `.apiVersion` キーをサポートしていないと、kube-apiserver にそのマニフェストを送信できない。

反対に、マニフェストですでに廃止済みの `.apiVersion` キーが指定されていて、client-go パッケージでもこれが廃止されていても、同様のことが起こる。

そのため、client-go パッケージを定期的にアップグレードする必要がある。

> - https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#-strong-api-groups-strong-

#### ▼ 調査例

ArgoCD の `2.3.0` では、client-go パッケージのバージョンが `0.23.1` であった。

> - https://github.com/argoproj/argo-cd/blob/v2.3.0/go.mod#L83

このことから、ArgoCD は `2.3.0` が Kubernetes の `1.23.1` で稼働できることがわかる。

なお、デプロイ先の Cluster としていずれのバージョンをサポートしているかは、`gitops-engine` パッケージを確認する必要がある。

Kubernetes の `1.23.1` がサポートしている API グループのバージョンから、マニフェストで使用できる `.apiVersion` がわかる。

> - https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#-strong-api-groups-strong-

<br>
