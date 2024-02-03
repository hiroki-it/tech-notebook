---
title: 【IT技術の知見】Cilium@ネットワーク系ミドルウェア
description: Cilium@ネットワーク系ミドルウェアの知見を記録しています。
---

# Cilium@ネットワーク系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Ciliumの仕組み

### アーキテクチャ

Ciliumは、Ciliumエージェント、CNIプラグイン、から構成される。

> - https://caddi.tech/archives/3864

<br>

### Ciliumエージェント

コンテナ上のプロセスは、コンテナのカーネルに対してシステムコールを実行する。

Ciliumエージェントは、システムコールのイベントが発生した時にeBPFを実行し、Ciliumの処理をフックする。

これにより、Ciliumはシステムコールのテレメトリーを収集できる。

> - https://www.publickey1.jp/blog/22/grafanaciliumebpfciliumgrafana.html
> - https://gihyo.jp/admin/column/newyear/2022/cloudnative-prospect

<br>

### Cilium CNIプラグイン

コンテナのネットワークを制御する。

KubernetesのデフォルトのCNIと衝突するため、これを無効化する必要がある。

<br>

## 02. Ciliumサービスメッシュ

### Ciliumサービスメッシュの仕組み

Ciliumエージェント上ではEnvoyプロセスが動いている。

マイクロサービス間の通信時には、eBPFではなくEnvoyを使用する。

なお、Ciliumサービスメッシュは前提としてCilium CNIプラグインを必要とする。

そのため、Istioのように、既存のKubernetesのネットワークを残したままサービスメッシュを導入することはできない。

> - https://docs.cilium.io/en/stable/network/servicemesh/
> - https://caddi.tech/archives/3864

<br>
