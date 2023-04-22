---
title: 【IT技術の知見】ExternalSecretsOperator＠Secretアドオン
description: ExternalSecretsOperator＠Secretアドオンの知見を記録しています。
---

# ExternalSecretsOperator＠Secretアドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ExternalSecretsOperatorの仕組み

### アーキテクチャ

ExternalSecretsOperatorは、external-secrets、external-secrets-controller、から構成される。

![external-secrets-operator_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/external-secrets-operator_architecture.png)

> ↪️ 参考：https://techblog.zozo.com/entry/kubernetes-external-secrets-to-external-secrets-operator

<br>

### external-secrets

使用するプロバイダーを設定する。

<br>

### external-secrets-controller

external-secrets-controllerは、プロバイダー (例：AWS、GCP、Vault) のAPIと通信し、プロバイダーのSecretストア (例：AWS SecretManager、GCP SecretManager、Vault SecretsEngine) から変数を取得する。

その後、取得した変数をSecretのデータとして注入する。

Secretを作成せずにPod内コンテナにマウントするSecretsストアCSIドライバーと比較して、Kubernetesとプロバイダーがより疎結合になる。

一方で、同様にSecretのデータとして注入するhelm-secretsと比較して、関係するコンポーネントが増えるため脆弱性が高まる。

<br>
