---
title: 【IT技術の知見】SecretsストアCSIドライバー＠Secretアドオン
description: SecretsストアCSIドライバー＠Secretアドオンの知見を記録しています。
---

# SecretsストアCSIドライバー＠Secretアドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SecretsストアCSIドライバーの仕組み

### アーキテクチャ

SecretsストアCSIドライバーは、CSIドライバーから構成される。

<br>

### CSIドライバー

#### ▼ CSIドライバーとは

CSIドライバーは、SecretProviderClassで定義されたプロバイダー (例：AWS、GCP、Vault) のAPIと通信し、プロバイダーのSecretストア (例：AWS SecretManager、GCP SecretManager、Vault SecretsEngine) から変数を取得する。

その後、Secretは使用せずにPod内コンテナのファイルとしてマウントする。

Secretのデータとして注入するExternalSecretsOperatorやhelm-secrets/vault-helmと比較して、Secretを作成しない点で脆弱性が高い。

一方で、Pod内コンテナに直接的にマウントするため、Kubernetesとプロバイダーがより密結合になってしまう。

![secrets-store-csi-volume](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/secrets-store-csi-volume.png)

> ↪️：
>
> - https://secrets-store-csi-driver.sigs.k8s.io/concepts.html
> - https://github.com/external-secrets/external-secrets/issues/478#issuecomment-964413129
> - https://www.reddit.com/r/kubernetes/comments/uj4a56/external_secrets_operator_vs_secret_store_csi/

<br>
