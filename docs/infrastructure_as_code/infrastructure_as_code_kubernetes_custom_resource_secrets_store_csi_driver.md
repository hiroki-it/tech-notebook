---
title: 【IT技術の知見】SecretsストアCSIドライバー＠カスタムリソース
description: SecretsストアCSIドライバー＠カスタムリソースの知見を記録しています。
---

# SecretsストアCSIドライバー＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. SecretsストアCSIドライバーの仕組み

### アーキテクチャ

SecretsストアCSIドライバーは、CSIドライバー、CSIボリューム、から構成される。

<br>

### CSIドライバー

#### ▼ CSIドライバーとは

CSIドライバーは、SecretProviderClassで定義されたプロバイダーのAPIと通信し、外部Secretのデータを参照する。その後、tmpfとしてVolumeに書き込む。

> ℹ️ 参考：https://secrets-store-csi-driver.sigs.k8s.io/concepts.html

![secrets-store-csi-volume](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/secrets-store-csi-volume.png)

<br>

### CSIボリューム

#### ▼ CSIボリュームとは

CSIの仕様によって標準化された外部ボリューム。プロバイダー上に新しく作成したストレージ領域をボリュームとし、これをコンテナにバインドマウントする。

> ℹ️ 参考：https://thinkit.co.jp/article/17635

<br>
