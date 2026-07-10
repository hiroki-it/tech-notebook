---
title: 【IT技術の知見】SecretsストアCSIドライバー＠Secret系
description: SecretsストアCSIドライバー＠Secret系の知見を記録しています。
---

# SecretsストアCSIドライバー＠Secret系

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SecretsストアCSIドライバーとは

Secrets ストア CSI ドライバーは、SecretProviderClass で定義したプロバイダー (例：AWS、Google Cloud、Vault) の API と通信し、プロバイダーの Secret ストア (例：AWS Secrets Manager、Google Cloud SecretManager、Vault SecretsEngine) から変数を取得する。

その後、Secret は使用せずに Pod 内コンテナのファイルとしてマウントする。

Secret のデータとして注入する External Secrets Operator や helm-secrets/vault-helm と比較して、Secret を作成しない点で脆弱性が高い。

一方で、Pod 内コンテナに直接的にマウントするため、Kubernetes とプロバイダーがより密結合になってしまう。

![secrets-store-csi-volume](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/secrets-store-csi-volume.png)

> - https://secrets-store-csi-driver.sigs.k8s.io/concepts.html
> - https://github.com/external-secrets/external-secrets/issues/478#issuecomment-964413129
> - https://www.reddit.com/r/kubernetes/comments/uj4a56/external_secrets_operator_vs_secret_store_csi/

<br>

## 02. SecretsストアCSIドライバーの仕組み

### アーキテクチャ

Secrets ストア CSI ドライバーは、CSI ドライバーから構成される。

<br>
