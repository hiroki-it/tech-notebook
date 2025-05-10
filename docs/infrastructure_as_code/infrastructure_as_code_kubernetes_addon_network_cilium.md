---
title: 【IT技術の知見】Cilium@ネットワーク系
description: Cilium@ネットワーク系の知見を記録しています。
---

# Cilium@ネットワーク系

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Ciliumの仕組み

### アーキテクチャ

Ciliumは、Ciliumエージェント、Cilium CNI、から構成される。

> - https://caddi.tech/archives/3864

<br>

### Ciliumエージェント

#### ▼ Ciliumエージェントとは

コンテナ上のプロセスは、コンテナのカーネルに対してシステムコールを実行する。

Ciliumエージェントは、システムコールのイベントが発生した時にeBPFを実行し、Ciliumの処理をフックする。

これにより、Ciliumはシステムコールのテレメトリーを収集できる。

> - https://www.publickey1.jp/blog/22/grafanaciliumebpfciliumgrafana.html
> - https://gihyo.jp/admin/column/newyear/2022/cloudnative-prospect

<br>

### Cilium CNI

#### ▼ Cilium CNIとは

KubernetesのデフォルトのCNIと衝突するため、これを無効化する必要がある。

デフォルトのCNIを無効化すると、このCNIとkube-proxyがCilium CNIに置き換わる。

> - https://docs.cilium.io/en/stable/network/kubernetes/kubeproxy-free/

#### ▼ Istioとの連携

Cilium CNIとistio-proxyを組み合わせて、トラフィックを制御する。

Ciliumのサービスメッシュ機能は、あくまでCiliumの中で一機能としてでしかない。

そのため、IstioとCilium CNIであれば連携できる。

- Istio + kube-proxy + 従来のCNI
- Istio + Cilium CNI
- Ciliumサービスメッシュ + Cilium CNI
- Ciliumサービスメッシュ + Istio (CiliumサービスメッシュとIstioが部分的に競合するので、どちらかのサービスメッシュで設定の無効化が必要) + Cilium CNI

> - https://www.slideshare.net/techcet/kernel-advantages-for-istio-realized-with-cilium#12
> - https://www.reddit.com/r/kubernetes/comments/1cygujm/comment/l5lf7ua/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

IstioとCiliumサービスメッシュの間で競合する機能 (例えば、L7のトラフィック管理) については、以下の箇所に対処方法がある。

しかし、全体としてかなり複雑な設定になりそうです

> - https://docs.cilium.io/en/latest/network/servicemesh/istio/#istio-configuration

<br>

## 02. Ciliumサービスメッシュ

### Ciliumサービスメッシュの仕組み

Ciliumエージェント上ではEnvoyプロセスが動いている。

マイクロサービス間の通信時には、eBPFではなくEnvoyを使用する。

なお、Ciliumサービスメッシュは前提としてCilium CNIを必要とする。

そのため、Istioのように、既存のKubernetesのネットワークを残したままサービスメッシュを導入することはできない。

> - https://docs.cilium.io/en/stable/network/servicemesh/
> - https://caddi.tech/archives/3864

<br>

### パケットのアプリケーションデータの暗号化

Node上のPod間の通信をIPSecやWireGuardで暗号化する。

![cilium-service-mesh_tls](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cilium-service-mesh_tls.png)

> - https://isovalent.com/blog/post/2022-05-03-servicemesh-security/

<br>
