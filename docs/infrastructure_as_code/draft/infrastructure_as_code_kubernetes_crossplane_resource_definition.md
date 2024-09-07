---
title: 【IT技術の知見】リソース定義＠Crossplane
description: リソース定義＠Crossplaneの知見を記録しています。
---

# リソース定義＠Crossplane

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS Provider

### package

```yaml
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-s3
spec:
  package: xpkg.upbound.io/upbound/provider-aws-s3:v1.1.0
```

> - https://docs.crossplane.io/latest/getting-started/provider-aws/#install-the-aws-provider
> - https://marketplace.upbound.io/providers/upbound/provider-aws-s3/v1.13.0

<br>
