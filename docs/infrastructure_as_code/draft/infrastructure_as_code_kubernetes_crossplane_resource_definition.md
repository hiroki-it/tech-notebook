---
title: 【IT技術の知見】リソース定義＠Crossplane
description: リソース定義＠Crossplaneの知見を記録しています。
---

# リソース定義＠Crossplane

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS

### AWS RDS

#### ▼ カスタムリソース一覧

> - https://marketplace.upbound.io/providers/upbound/provider-aws-rds/v1.17.0

#### ▼ Cluster

```yaml
apiVersion: rds.aws.upbound.io/v1beta1
kind: Cluster
metadata:
  annotations:
    meta.upbound.io/example-id: rds/v1beta1/clusterendpoint
  labels:
    testing.upbound.io/example-name: default-ce
  name: example-ce
spec:
  forProvider:
    engine: aurora-postgresql
    masterPasswordSecretRef:
      key: password
      name: sample-cluster-password
      namespace: upbound-system
    masterUsername: cpadmin
    region: us-west-1
    skipFinalSnapshot: true
  writeConnectionSecretToRef:
    name: sample-rds-cluster-secret
    namespace: upbound-system
```

> - https://marketplace.upbound.io/providers/upbound/provider-aws-rds/v1.17.0/resources/rds.aws.upbound.io/Cluster/v1beta1

<br>

### AWS S3

#### ▼ カスタムリソース一覧

> - https://marketplace.upbound.io/providers/upbound/provider-aws-s3/v1.17.0

#### ▼ AWS S3バケット

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

## 02. Composition

### pipeline

Compositionの作成で実行される一連の処理を設定する。

```yaml
apiVersion: apiextensions.crossplane.io/v1
kind: Composition
metadata:
  name: example
spec:
  compositeTypeRef:
    apiVersion: custom-api.example.org/v1alpha1
    kind: AcmeBucket
  mode: Pipeline
  pipeline:
    - step: patch-and-transform
      # 関数
      functionRef:
        name: function-patch-and-transform
      input:
        apiVersion: pt.fn.crossplane.io/v1beta1
        kind: Resources
        resources:
          - name: storage-bucket
            base:
              # AWS S3
              apiVersion: s3.aws.upbound.io/v1beta1
              kind: Bucket
              spec:
                forProvider:
                  region: "us-east-2"
```

> - https://docs.crossplane.io/master/concepts/compositions/

<br>

## 03. Function

### Function Patch and Transform

特定のフィールドから値をコピーし、別のフィールドに適用する。

```yaml
apiVersion: apiextensions.crossplane.io/v1
kind: Composition
metadata:
  name: example
spec:
  compositeTypeRef:
    apiVersion: custom-api.example.org/v1alpha1
    kind: AcmeBucket
  mode: Pipeline
  pipeline:
    - step: patch-and-transform
      functionRef:
        name: function-patch-and-transform
      input:
        apiVersion: pt.fn.crossplane.io/v1beta1
        kind: Resources
        resources:
          - name: storage-bucket
            base:
              apiVersion: s3.aws.upbound.io/v1beta1
              kind: Bucket
              spec:
                forProvider:
                  region: "us-east-2"
            patches:
              - type: FromCompositeFieldPath
                # AcmeBucket XRの.spec.desiredRegionフィールドから値をコピーする
                fromFieldPath: spec.desiredRegion
                # Bucketの.spec.forProvider.regionフィールドに値を適用する
                toFieldPath: spec.forProvider.region
```

> - https://docs.crossplane.io/master/guides/function-patch-and-transform/

<br>

## 04. Provider

### AWSの場合

#### ▼ package

```yaml
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-s3
spec:
  # AWS S3
  # @see https://marketplace.upbound.io/providers/upbound/provider-aws-s3/v1.13.0
  package: xpkg.upbound.io/upbound/provider-aws-s3:v1.13.0
```

```yaml
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-rds
spec:
  # AWS RDS
  # @see https://marketplace.upbound.io/providers/upbound/provider-aws-rds/v1.17.0
  package: xpkg.upbound.io/upbound/provider-aws-rds:v1.17.0
```

```yaml
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-elasticache
spec:
  # AWS Elasticache
  # @see https://marketplace.upbound.io/providers/upbound/provider-aws-elasticache/v1.17.0
  package: xpkg.upbound.io/upbound/provider-aws-elasticache:v1.17.0
```

> - https://docs.crossplane.io/latest/concepts/providers/#install-a-provider
> - https://docs.crossplane.io/latest/getting-started/provider-aws/#install-the-aws-provider

<br>

### Helmの場合

#### ▼ package

Helm Releaseを管理する。

```yaml
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-helm
spec:
  # @see https://marketplace.upbound.io/providers/upbound/provider-helm/v0.20.0
  package: xpkg.upbound.io/upbound/provider-helm:v0.20.0
```

<br>

## 05. Helm

### Release

```yaml
apiVersion: helm.crossplane.io/v1beta1
kind: Release
metadata:
  name: wordpress-example
spec:
  forProvider:
    chart:
      name: wordpress
      repository: oci://localhost:5000/helm-charts
      version: 15.2.5
    namespace: wordpress
    set:
      - name: param1
        value: value2
    values:
      service:
        type: ClusterIP
  providerConfigRef:
    name: helm-provider
```

> - https://marketplace.upbound.io/providers/crossplane-contrib/provider-helm/v0.19.0/resources/helm.crossplane.io/Release/v1beta1

<br>
