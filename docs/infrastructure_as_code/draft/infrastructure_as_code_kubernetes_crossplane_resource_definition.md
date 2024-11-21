---
title: 【IT技術の知見】リソース定義＠Crossplane
description: リソース定義＠Crossplaneの知見を記録しています。
---

# リソース定義＠Crossplane

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Provider

### AWSの場合

#### ▼ package

```yaml
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-s3
spec:
  # @see https://marketplace.upbound.io/providers/upbound/provider-aws-s3/v1.13.0
  package: xpkg.upbound.io/upbound/provider-aws-s3:v1.13.0
```

```yaml
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-rds
spec:
  # @see https://marketplace.upbound.io/providers/upbound/provider-aws-rds/v1.17.0
  package: xpkg.upbound.io/upbound/provider-aws-rds:v1.17.0
```

```yaml
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-elasticache
spec:
  # @see https://marketplace.upbound.io/providers/upbound/provider-aws-elasticache/v1.17.0
  package: xpkg.upbound.io/upbound/provider-aws-elasticache:v1.17.0
```

> - https://docs.crossplane.io/latest/getting-started/provider-aws/#install-the-aws-provider
> - https://marketplace.upbound.io/providers?query=aws

<br>

## 02. AWSリソース

### S3

```yaml
apiVersion: s3.aws.crossplane.io/v1beta1
kind: Bucket
metadata:
  annotations:
    crossplane.io/external-name: crossplane-example-bucket
  name: test-bucket
spec:
  forProvider:
    accelerateConfiguration:
      status: Enabled
    acl: private
    corsConfiguration:
      corsRules:
        - allowedHeaders:
            - "*"
          allowedMethods:
            - GET
          allowedOrigins:
            - "*"
          exposeHeaders:
            - x-amz-server-side-encryption
    lifecycleConfiguration:
      rules:
        - expiration:
            days: 15
          filter:
            prefix: ola/
          status: Enabled
    locationConstraint: us-east-1
    objectLockEnabledForBucket: false
    publicAccessBlockConfiguration:
      blockPublicPolicy: true
    replicationConfiguration:
      roleRef:
        name: somerole
      rules:
        - deleteMarkerReplication:
            status: Disabled
          destination:
            bucketRef:
              name: repl-dest
            storageClass: STANDARD
          filter:
            prefix: ""
          id: rule-1
          priority: 0
          status: Enabled
    serverSideEncryptionConfiguration:
      rules:
        - applyServerSideEncryptionByDefault:
            sseAlgorithm: AES256
    tagging:
      tagSet:
        - key: key1
          value: val1
        - key: secondKey
          value: val2
        - key: key3
          value: val3
    versioningConfiguration:
      status: Enabled
  providerConfigRef:
    name: example
```

> - https://marketplace.upbound.io/providers/crossplane-contrib/provider-aws/v0.39.0/resources/s3.aws.crossplane.io/Bucket/v1beta1

<br>
