---
title: 【IT技術の知見】リソース定義＠SecretProviderClass
description: リソース定義＠SecretProviderClassの知見を記録しています。
---

# リソース定義＠SecretProviderClass

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### チャートとして

#### ▼ GitHubリポジトリから

プロバイダーが提供するCSIドライバーを、Kubernetes上にインストールする必要がある。GitHubリポジトリからsecrets-store-csi-driverチャートをインストールし、リソースを作成する。

> ℹ️ 参考：https://secrets-store-csi-driver.sigs.k8s.io/getting-started/installation.html

```bash
$ helm repo add secrets-store-csi-driver https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts
$ helm repo update

$ helm install csi-secrets-store secrets-store-csi-driver/secrets-store-csi-driver -n kube-system 
```

<br>

## 02. spec

### spec.provider

#### ▼ spec.providerとは



> ℹ️ 参考：https://secrets-store-csi-driver.sigs.k8s.io/concepts.html

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: foo-aws-secret-provider-class
spec:
  provider: aws
```

<br>

### spec.parameters

#### ▼ spec.parametersとは

プロバイダーに応じて、参照する外部Secretストアのデータを設定する。

> ℹ️ 参考：https://secrets-store-csi-driver.sigs.k8s.io/concepts.html

#### ▼ objects

外部Sercretを識別する情報を設定する。

> ℹ️ 参考：https://docs.aws.amazon.com/secretsmanager/latest/userguide/integrating_csi_driver.html#integrating_csi_driver_SecretProviderClass

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: foo-aws-secret-provider-class
spec:
  provider: aws
  parameters:
    # AWSのSecrets Managerから取得する。
    objects: |
      - objectName: "arn:aws:secretsmanager:ap-northeast-1:<アカウントID>:secret:<外部Secretストア名>"
        objectType: "secretsmanager"
```

> ℹ️ 参考：https://docs.aws.amazon.com/systems-manager/latest/userguide/integrating_csi_driver.html#integrating_csi_driver_mount

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: foo-aws-secret-provider-class
spec:
  provider: aws
  parameters:
    # AWSのSystems Managerから取得する。
    objects: |
      - objectName: "FOO"
        objectType: "ssmparameter"
```

<br>
