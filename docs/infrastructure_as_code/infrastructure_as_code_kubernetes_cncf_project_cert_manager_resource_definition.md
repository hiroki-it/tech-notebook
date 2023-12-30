---
title: 【IT技術の知見】リソース定義＠CertManager
description: リソース定義＠CertManagerの知見を記録しています。
---

# リソース定義＠CertManager

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### チャートとして

```bash
$ helm repo add <チャートリポジトリ名> https://charts.jetstack.io

$ helm repo update

$ kubectl create namespace cert-manager

$ helm install <Helmリリース名> <チャートリポジトリ名>/cert-manager -n cert-manager --version <バージョンタグ>
```

> - https://cert-manager.io/docs/installation/helm/#steps

<br>

## 02. Certificate

### Certificateとは

認証局を使用して、秘密鍵と証明書署名要求に基づいて、`X.509`のSSL証明書 (`.crt`ファイル) を作成する。

証明書自体は、紐づくSecretに割り当てられる。

> - https://cert-manager.io/docs/concepts/certificate/
> - https://zenn.dev/masaaania/articles/e54119948bbaa2#issuer

<br>

### .spec.secretName

#### ▼ secretNameとは

SSL証明書、SSL証明書と対になる秘密鍵、を保持するSecretの名前を設定する。

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: foo-certificate
  namespace: cert-manager
spec:
  secretName: foo-certificate-secret
```

> - https://zenn.dev/masaaania/articles/e54119948bbaa2#certificate-manifest%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB

#### ▼ SSL証明書を使用する

Ingressの`.spec.tls[*].secretName`キーにて、Secretを設定する。

これにより、IngressにSSL証明書を割り当てられる。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    cert-manager.io/issuer: foo-issuer
  name: foo-ingress
  namespace: foo-namespace
spec:
  tls:
    - hosts:
        - example.com
      secretName: foo-certificate-secret
```

> - https://zenn.dev/masaaania/articles/e54119948bbaa2#ingress-manifest%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB

<br>

### .spec.dnsNames

#### ▼ dnsNamesとは

SSL証明書を取得したいドメインを設定する。

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: foo-certificate
  namespace: cert-manager
spec:
  dnsNames:
    - example.com
    - foo.example.com
```

> - https://zenn.dev/masaaania/articles/e54119948bbaa2#certificate-manifest%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB

<br>

### .spec.issuerRef

#### ▼ issuerRefとは

SSL証明書を発行してもらう認証局 (Issuer) を設定する。

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: foo-certificate
  namespace: cert-manager
spec:
  issuerRef:
    name: foo-issuer
    kind: Issuer
    group: cert-manager.io
```

> - https://zenn.dev/masaaania/articles/e54119948bbaa2#certificate-manifest%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB

<br>

## 03. CertificateRequest

### CertificateRequestとは

秘密鍵から、証明書署名要求 (`.csr`ファイル) を作成する。

> - https://cert-manager.io/docs/concepts/certificaterequest/
> - https://zenn.dev/masaaania/articles/e54119948bbaa2#certificate

<br>

### .spec.request

#### ▼ request

証明書署名要求 (`.csr`ファイル) の作成に必要な秘密鍵を設定する。

```yaml
apiVersion: cert-manager.io/v1
kind: CertificateRequest
metadata:
  name: foo-certificate-request
  namespace: cert-manager
spec:
  request: LS0tL ...
```

<br>

### .spec.isCA

#### ▼ isCAとは

秘密鍵と証明書署名要求 (`.csr`ファイル) に基づいて作成するSSL証明書が中間CA証明書であるか否か、を設定する。

```yaml
apiVersion: cert-manager.io/v1
kind: CertificateRequest
metadata:
  name: foo-certificate-request
  namespace: cert-manager
spec:
  isCA: "false"
```

<br>

### .spec.usages

#### ▼ usagesとは

記入中...

> - https://www.ibm.com/docs/ja/cloud-paks/1.0?topic=certificates-customizing-cert-manager#keyUsage

```yaml
apiVersion: cert-manager.io/v1
kind: CertificateRequest
metadata:
  name: foo-certificate-request
  namespace: cert-manager
spec:
  usages:
    - signing
    - digital signature
    - server auth
```

<br>

### .spec.duration

#### ▼ durationとは

SSL証明書の有効期限を設定する。

```yaml
apiVersion: cert-manager.io/v1
kind: CertificateRequest
metadata:
  name: foo-certificate-request
  namespace: cert-manager
spec:
  duration: 2160h
```

<br>

### .spec.issuerRef

#### ▼ issuerRefとは

SSL証明書の作成に使用する認証局を設定する。

```yaml
apiVersion: cert-manager.io/v1
kind: CertificateRequest
metadata:
  name: foo-certificate-request
  namespace: cert-manager
spec:
  issuerRef:
    name: foo-issuer
    kind: Issuer
    group: cert-manager.io
```

<br>

## 04.ClusterIssuer

### ClusterIssuerとは

異なるNamespaceに対して横断的に証明書を発行する認証局を作成する。

> - https://blog.1q77.com/2020/03/cert-manager/#issuer-%E3%81%AE%E7%99%BB%E9%8C%B2

<br>

### .spec.acme

#### ▼ acmeとは

SSL証明書を自動的に更新するACMEプロトコルについて設定する。

#### ▼ server

ACMEサーバーのURLを設定する。

```yaml
apiVersion: cert-manager.io/v1alpha2
kind: ClusterIssuer
metadata:
  name: foo-cluster-issuer
  namespace: cert-manager
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
```

#### ▼ email

ACMEサーバーのユーザーの登録に使用したメールアドレスを設定する。

```yaml
apiVersion: cert-manager.io/v1alpha2
kind: ClusterIssuer
metadata:
  name: foo-cluster-issuer
  namespace: cert-manager
spec:
  acme:
    email: example@gmail.com
```

#### ▼ privateKeySecretRef

SSL証明書、SSL証明書と対になる秘密鍵、を保持するSecretの名前を設定する。

```yaml
apiVersion: cert-manager.io/v1alpha2
kind: ClusterIssuer
metadata:
  name: foo-cluster-issuer
  namespace: cert-manager
spec:
  acme:
    privateKeySecretRef:
      name: foo-certificate-secret
```

#### ▼ solvers

名前解決の委譲先 (例：AWS Route53、Google CloudDNS、など) を設定する。

```yaml
apiVersion: cert-manager.io/v1alpha2
kind: ClusterIssuer
metadata:
  name: foo-cluster-issuer
  namespace: cert-manager
spec:
  acme:
    solvers:
      - dns01:
          # AWS Route53を委譲先とする。
          route53:
            region: ap-northeast-1
            accessKeyID: <AWSアカウントID>
            secretAccessKeySecretRef:
              # Route53にリクエストを送信するための認証情報を保持するSecret
              name: foo-route53-credentials-secret
              # シークレットアクセスキー名
              key: foo-secret-access-key
```

<br>

## 05. Issuer

### Issuerとは

同じNamespaceに対して証明書を発行する認証局を作成する。

同じNamespaceにあるKubernetesリソースに対して証明書を発行する。

もし複数のNamespaceに対して横断的に証明書を発行したい場合、ClusterIssuerを使用する必要がある。

> - https://cert-manager.io/docs/concepts/issuer/

<br>

### .spec.ca

#### ▼ secretName

SSL証明書、SSL証明書と対になる秘密鍵、を保持するSecretの名前を設定する。

```yaml
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: foo-issuer
  namespace: foo-namespace
spec:
  ca:
    secretName: foo-certificate-secret
```

<br>
