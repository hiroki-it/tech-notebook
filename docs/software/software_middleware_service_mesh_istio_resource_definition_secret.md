---
title: 【IT技術の知見】Secret系＠リソース定義
description: Secret系＠リソース定義の知見を記録しています。
---

# Secret系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 専用Secret

Istioの各種コンポーネントの機密な変数やファイルを管理する。

<br>

## 02. istio-ca-secret

### istio-ca-secretとは

Istiodコントロールプレーンのための証明書を管理する。

Istiodコントロールプレーンは、`istio-ca-secret`を使用して、自身がルート認証局であることを署名する。

![istio_istio-ca-root-cert](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_istio-ca-root-cert.png)

<br>

### ca-cert.pem

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: istio-ca-secret
  namespace: istio-system
type: istio.io/ca-root
data:
  ca-cert.pem: *****
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: istio-ca-secret
  namespace: istio-system
type: istio.io/ca-root
data:
  ca-key.pem: *****
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: istio-ca-secret
  namespace: istio-system
type: istio.io/ca-root
data:
  cert-chain.pem: ""
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: istio-ca-secret
  namespace: istio-system
type: istio.io/ca-root
data:
  key.pem: ""
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: istio-ca-secret
  namespace: istio-system
type: istio.io/ca-root
data:
  root-cert.pem: ""
```

<br>

## 02. istio-remote-secret

### istio-remote-secretとは

マルチClusterメッシュを採用する場合に必要である。

プライマリClusterがリモートClusterのkube-apiserverをコールできるように、SSL証明書を持つ。

> - https://istio.io/latest/docs/setup/install/multicluster/primary-remote_multi-network/

<br>
