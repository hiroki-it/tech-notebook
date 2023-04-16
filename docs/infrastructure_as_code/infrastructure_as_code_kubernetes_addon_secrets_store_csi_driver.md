---
title: 【IT技術の知見】SecretsストアCSIドライバー＠Secretアドオン
description: SecretsストアCSIドライバー＠Secretアドオンの知見を記録しています。
---

# SecretsストアCSIドライバー＠Secretアドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SecretsストアCSIドライバーの仕組み

### アーキテクチャ

SecretsストアCSIドライバーは、CSIドライバー、CSIボリューム、などのコンポーネントから構成される。

<br>

### CSIドライバー

#### ▼ CSIドライバーとは

CSIドライバーは、SecretProviderClassで定義されたプロバイダーのAPIと通信し、プロバイダーのSecretストアから変数を取得する。

その後、Secretは使用せずにPod内コンテナのファイルとしてマウントする。

ExternalSecretsOperatorと比較して、Secretを作成しない点で脆弱性が高い一方で、Kubernetesとプロバイダーが密結合になってしまう。

![secrets-store-csi-volume](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/secrets-store-csi-volume.png)

> ↪️ 参考：
>
> - https://secrets-store-csi-driver.sigs.k8s.io/concepts.html
> - https://github.com/external-secrets/external-secrets/issues/478#issuecomment-964413129
> - https://www.reddit.com/r/kubernetes/comments/uj4a56/external_secrets_operator_vs_secret_store_csi/

<br>

### CSIボリューム

#### ▼ CSIボリュームとは

CSIの仕様によって標準化された外部サービスが提供するVolume。

外部ストレージ上にボリュームを作成し、これをVolumeとしてコンテナにバインドマウントする。

> ↪️ 参考：https://thinkit.co.jp/article/17635

<br>
