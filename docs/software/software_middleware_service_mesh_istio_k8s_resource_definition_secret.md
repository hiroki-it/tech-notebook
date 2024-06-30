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

Istiodコントロールプレーン (`discovery`コンテナ) をルート認証局として使用する場合に、CA証明書を設定する。

`discovery`コンテナは、SSL証明書とペアになる秘密鍵を`istio-ca-root-cert` (ConfigMap) に設定する。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: istio-ca-secret
  namespace: istio-system
type: istio.io/ca-root
data:
  ca-cert.pem: *****
  ca-key.pem: *****
  cert-chain.pem: ""
  key.pem: ""
  root-cert.pem: ""
```

<br>

## 02. istio-remote-secret

### istio-remote-secretとは

マルチClusterメッシュを採用する場合に必要である。

プライマリClusterがリモートClusterのkube-apiserverをコールできるように、SSL証明書を持つ。

> - https://istio.io/latest/docs/setup/install/multicluster/primary-remote_multi-network/

<br>
