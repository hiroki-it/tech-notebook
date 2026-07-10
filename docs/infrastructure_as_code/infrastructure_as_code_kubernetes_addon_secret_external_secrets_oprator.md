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

External Secrets Operator は、external-secrets、external-secrets-controller、から構成される。

![external-secrets-operator_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/external-secrets-operator_architecture.png)

> - https://external-secrets.io/v0.8.1/
> - https://techblog.zozo.com/entry/kubernetes-external-secrets-to-external-secrets-operator

<br>

### external-secrets

使用するプロバイダーを設定する。

<br>

### external-secrets-controller

external-secrets-controller は、プロバイダー (例：AWS、Google Cloud、Vault) の API と通信し、プロバイダーの Secret ストア (例：AWS Secrets Manager、Google Cloud Secret Manager、Vault SecretsEngine) から変数を取得する。

その後、取得した変数を Secret のデータとして注入する。

Secret を作成せずに Pod 内コンテナへマウントする Secrets ストア CSI ドライバーと比較して、Kubernetes とプロバイダーがより疎結合になる。

一方で、同様に Secret のデータとして注入する helm-secrets/vault-helm と比較して、関係するコンポーネントが増える。そのため、脆弱性が高まる。

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
