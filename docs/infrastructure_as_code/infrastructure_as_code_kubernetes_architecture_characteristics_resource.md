---
title: 【IT技術の知見】Kubernetesリソース＠アーキテクチャ特性
description: Kubernetesリソース＠アーキテクチャ特性の知見を記録しています。
---

# Kubernetesリソース＠アーキテクチャ特性

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Pod

### 安全性

#### ▼ 認証/認可の実施

RoleやClusterRoleを使用して、ServiceAccountに適切な認可スコープを付与する。

> - https://qiita.com/sheepland/items/67a5bb9b19d8686f389d
> - https://speakerdeck.com/kyohmizu/saibagong-ji-kara-kubernetes-kurasutawoshou-rutamefalsexiao-guo-de-nasekiyuriteidui-ce?slide=18

<br>

### 可用性

#### ▼ 冗長化

ReplicaSetでPodを冗長化し、可用性を担保する。

#### ▼ 水平スケーリング

HorizontalPodAutoscalerでPodを水平スケーリングし、可用性を担保する。

水平スケーリングは、Podの負荷が高くなると冗長化してくれ、高負荷でいずれかのPodで障害が起こっても正常なPodがこれを埋め合わせしてくれるため、システム全体として稼働時間を長くできる。

<br>

### 安全性

#### ▼ Secretの変数を暗号化する

Secretの `.data`キーには、`base64`方式でエンコードされた値を設定する必要がある。

この `base64`方式エンコード値をどのように管理するかには選択肢がある。

| 方法           | リポジトリ                                                 | リポジトリ + キーバリュー型ストア                                                                                                  | リポジトリ + クラウドキーバリュー型ストア                                                                                                                                                                                                                                      |
| -------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| バージョン管理 | 管理できる。                                               | 管理できる。                                                                                                                       | 管理できない。                                                                                                                                                                                                                                                                 |
| 暗号化         | `base64`方式エンコード値をリポジトリ内でそのまま管理する。 | `base64`方式エンコード値を暗号化キー (例：AWS KMS、GCP CKM、GnuPG、PGP、など) で暗号化する。                                       | `base64`方式エンコード値を暗号化キー (例：AWS KMS、GCP CKM、GnuPG、PGP、など) で暗号化する。                                                                                                                                                                                   |
| Secretストア   | なし                                                       | リポジトリ上でキーバリュー型ストア (例：SOPS、kubesec、Hashicorp Vault) で管理する。 Apply時にbase64方式エンコード値に復号化する。 | クラウドプロバイダー内のキーバリュー型ストア (例：AWS パラメーターストア、GCP SecretManager、など) で管理する。 Apply時に、ストア仲介ツール (例：SecretsStoreCSIDriver、External SecretsOperator) を使用してSecretのデータを取得しつつ、`base64`方式エンコード値に復号化する。 |

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/secret-management/
> - https://www.thorsten-hans.com/encrypt-your-kubernetes-secrets-with-mozilla-sops/
> - https://akuity.io/blog/how-to-manage-kubernetes-secrets-gitops/

<br>
