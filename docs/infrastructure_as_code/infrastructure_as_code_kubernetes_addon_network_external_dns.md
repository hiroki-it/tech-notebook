---
title: 【IT技術の知見】ExternalDNS＠ネットワークアドオン
description: ExternalDNS＠ネットワークアドオンの知見を記録しています。
---

# ExternalDNS＠ネットワークアドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ExternalDNSアドオンの仕組み

### アーキテクチャ

ExternalDNSアドオンは、ExternalDNSコントローラー、から構成される。

ネットワークからのアクセスにDNSレコードを必要とするKubernetesリソース (例：Ingress、Service、など) の設定値に応じて、DNSプロバイダー (例：AWS Route53) にDNSレコードを自動的に作成する。

![external-dns_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/external-dns_architecture.png)

> ↪️ 参考：
>
> - https://networkop.co.uk/post/2020-08-k8s-gateway/
> - https://github.com/kubernetes-sigs/external-dns/blob/master/docs/faq.md#how-do-i-specify-a-dns-name-for-my-kubernetes-objects

<br>

### セットアップ

#### ▼ Helmの場合

```bash
$ helm repo add <リポジトリ名> https://kubernetes-sigs.github.io/external-dns/

$ helm install <リリース名> <チャートリポジトリ名>/external-dns -n kube-system --version <バージョンタグ>
```

> ↪️ 参考：https://github.com/kubernetes-sigs/external-dns/tree/master/charts/external-dns

<br>

### ExternalDNSコントローラー

#### ▼ Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: external-dns
  labels:
    app.kubernetes.io/name: external-dns
spec:
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app.kubernetes.io/name: external-dns
  template:
    metadata:
      labels:
        app.kubernetes.io/name: external-dns
    spec:
      serviceAccountName: external-dns
      containers:
        - name: external-dns
          image: registry.k8s.io/external-dns/external-dns:v0.13.2
          args:
            - --source=service
            - --source=ingress
            - --domain-filter=example.com
            - --provider=aws
            - --policy=upsert-only
            - --aws-zone-type=public
            - --registry=txt
            - --txt-owner-id=external-dns
          env:
            - name: AWS_DEFAULT_REGION
              value: ap-northeast-1
```

> ↪️ 参考：https://kubernetes-sigs.github.io/external-dns/v0.12.2/tutorials/ANS_Group_SafeDNS/#manifest-for-clusters-with-rbac-enabled

#### ▼ ServiceAccount、ClusterRole

ExternalDNSコントローラーがDNSプロバイダー (例：AWS Route53) にアクセスできるように、ExternalDNSコントローラーにはClusterRoleに基づく認可スコープを持つ。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: external-dns
  namespace: kube-system
  labels:
    app.kubernetes.io/name: external-dns
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: external-dns
  labels:
    app.kubernetes.io/name: external-dns
rules:
  - apiGroups: [""]
    resources: ["services", "endpoints", "pods", "nodes"]
    verbs: ["get", "watch", "list"]
  - apiGroups: ["extensions", "networking.k8s.io"]
    resources: ["ingresses"]
    verbs: ["get", "watch", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: external-dns-viewer
  labels:
    app.kubernetes.io/name: external-dns
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: external-dns
subjects:
  - kind: ServiceAccount
    name: external-dns
    namespace: kube-system
```

> ↪️ 参考：https://kubernetes-sigs.github.io/external-dns/v0.12.2/tutorials/aws/#manifest-for-clusters-without-rbac-enabled

<br>

## 02. Ingressの場合

### AWS ALBの場合

以下のようなIngressを定義し、IPv4タイプのAWS ALBをプロビジョニングするとする。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
spec:
  ingressClassName: alb
  rules:
    - host: example.com
      http:
        paths:
          - backend:
              service:
                name: foo-service
                port:
                  number: 80
            path: /
            pathType: Prefix
```

するとExternalDNSアドオンは、Ingressの`.spec.rules[].host`キーに応じて、AWS Route53にAレコードとTXTレコードを作成する。

```bash
$ kubectl logs external-dns -n kube-system | grep example.com

time="2023-02-28T10:09:30Z" level=info msg="Desired change: CREATE example.com A [Id: /hostedzone/*****]"
time="2023-02-28T10:09:30Z" level=info msg="Desired change: CREATE example.com TXT [Id: /hostedzone/*****]"
```

> ↪️ 参考：https://kubernetes-sigs.github.io/external-dns/v0.12.2/tutorials/alb-ingress/#ingress-examples

<br>
