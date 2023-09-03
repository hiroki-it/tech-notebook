---
title: 【IT技術の知見】Kubernetesプロバイダー＠Terraform
description: Kubernetesプロバイダー＠Terraformの知見を記録しています。
---

# Kubernetesプロバイダー＠Terraform

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kubernetesプロバイダー

### Kubernetesプロバイダーとは

TerraformがKubernetesのkube-apiserverと通信できるようにする。

これにより、Terraformを使用してKubernetesリソースを作成できるようになる。

もしクラウドプロバイダーのCluster (例：AWS EKS、Google GKE、Azure AKE、など) を使用している場合、これのkube-apiserverである。

```terraform
provider "kubernetes" {
  alias                  = "foo_eks_cluster"
  host                   = foo_eks_cluster.cluster_endpoint
  cluster_ca_certificate = foo_eks_cluster.cluster_ca_certificate
  token                  = foo_eks_cluster.cluster_token
}
```

> - https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs

<br>

### バージョン

Kubernetesとの対応バージョンは、client-goパッケージのバージョンを確認する。

> - https://github.com/hashicorp/terraform-provider-kubernetes/blob/main/go.mod

<br>
