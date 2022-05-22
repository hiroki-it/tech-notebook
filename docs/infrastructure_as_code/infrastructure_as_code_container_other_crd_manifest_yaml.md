---
title: 【知見を記録するサイト】manifest.yaml＠その他のカスタムリソース定義
description: manifest.yaml＠その他のカスタムリソース定義の知見をまとめました。
---

# manifest.yaml＠その他のカスタムリソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. IngressClassParams

<br>

## 02. SecretProviderClass

### spec.provider

#### ▼ spec.providerとは

参考：https://secrets-store-csi-driver.sigs.k8s.io/concepts.html

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

プロバイダーに応じて、Secretにマウントする外部Secretのデータを設定する。

参考：https://secrets-store-csi-driver.sigs.k8s.io/concepts.html

#### ▼ objects

外部Sercretを識別する情報を設定する。

参考：https://docs.aws.amazon.com/ja_jp/secretsmanager/latest/userguide/integrating_csi_driver.html#integrating_csi_driver_SecretProviderClass

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: foo-aws-secret-provider-class
spec:
  provider: aws
  parameters:
    # AWSのシークレットマネージャーから取得する。
    objects: |
      - objectName: "arn:aws:secretsmanager:ap-northeast-1:<アカウントID>:secret:<外部Secret名>"
        objectType: "secretsmanager"
```

参考：https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/integrating_csi_driver.html#integrating_csi_driver_mount

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: foo-aws-secret-provider-class
spec:
  provider: aws
  parameters:
    # AWSのシステムマネージャーから取得する。
    objects: |
      - objectName: "FOO"
        objectType: "ssmparameter"
```

<br>

