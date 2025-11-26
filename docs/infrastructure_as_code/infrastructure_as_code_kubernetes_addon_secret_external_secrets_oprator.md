---
title: 【IT技術の知見】External Secrets Operator＠Secret系
description: External Secrets Operator＠Secret系の知見を記録しています。
---

# External Secrets Operator＠Secret系

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. External Secrets Operatorの仕組み

### アーキテクチャ

External Secrets Operatorは、external-secrets、external-secrets-controller、から構成される。

![external-secrets-operator_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/external-secrets-operator_architecture.png)

> - https://external-secrets.io/v0.8.1/
> - https://techblog.zozo.com/entry/kubernetes-external-secrets-to-external-secrets-operator

<br>

### external-secrets

使用するプロバイダーを設定する。

<br>

### external-secrets-controller

external-secrets-controllerは、プロバイダー (例：AWS、Google Cloud、Vault) のAPIと通信し、プロバイダーのSecretストア (例：AWS Secrets Manager、Google Cloud Secret Manager、Vault SecretsEngine) から変数を取得する。

その後、取得した変数をSecretのデータとして注入する。

Secretを作成せずにPod内コンテナにマウントするSecretsストアCSIドライバーと比較して、Kubernetesとプロバイダーがより疎結合になる。

一方で、同様にSecretのデータとして注入するhelm-secrets/vault-helmと比較して、関係するコンポーネントが増えるため脆弱性が高まる。

<br>

## 02. リソース定義

### ExternalSecret

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: wordpress-admin-secret
  namespace: default
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secret-store
    kind: ClusterSecretStore
  target:
    name: app-secret
    creationPolicy: Owner
  data:
    - secretKey: database-secret
      remoteRef:
        key: aws-secret-manager/database
        property: password
```

<br>

### ClusterSecretStore

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: aws-secret-store
spec:
  provider:
    aws:
      service: SecretsManager
      region: ap-northeast-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets
            namespace: external-secrets
```

<br>
