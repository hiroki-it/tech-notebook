---
title: 【IT技術の知見】リソース定義＠AWS Load Balancerコントローラー
description: リソース定義＠AWS Load Balancerコントローラーの知見を記録しています。
---

# リソース定義＠AWS Load Balancerコントローラー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Ingress

### Ingressとは

Ingressで`alb`のIngressClassを指定していること検知する。

AWS Load Balancerコントローラーは、Ingressの`.metadata.annotations`キーと`.spec.rules`キーに設定に応じて、AWS ALBを自動的にプロビジョニングする。

> ↪️：https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/

<br>

### `.metadata.annotations`キー

#### ▼ `.metadata.annotations`キーとは

AWS ALBをリスナールール以外を設定するために、Ingressの`.metadata.annotations`キーを設定する必要がある。

> ↪️：
>
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.4/guide/ingress/annotations/
> - https://qiita.com/murata-tomohide/items/ea4d9acefda92e05e20f

#### ▼ `alb.ingress.kubernetes.io/certificate-arn`キー

AWS ALBでHTTPSプロトコルを受け付ける場合、事前に作成したACMのSSL証明書のARNを設定する。

AWS LBコントローラーは、プロビジョニングしたALBにACMのSSL証明書を自動的に紐づける。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-northeast-1:<AWSアカウントID>:certificate/*****
```

> ↪️：
>
> - https://nobelabo.hatenablog.com/entry/2022/10/01/201138
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.1/guide/ingress/cert_discovery/

#### ▼ `alb.ingress.kubernetes.io/healthcheck-path`キー

ヘルスチェックのパスを設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/healthcheck-path: /healthz
```

#### ▼ `alb.ingress.kubernetes.io/listen-ports`キー

AWS ALBでインバウンド通信を受け付けるポート番号を設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
```

#### ▼ `alb.ingress.kubernetes.io/load-balancer-attributes`キー

AWS ALBの属性を設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/load-balancer-attributes: access_logs.s3.enabled=true,access_logs.s3.bucket=foo-alb-ingress-backet,access_logs.s3.prefix=foo
```

#### ▼ `alb.ingress.kubernetes.io/group.name`キー

Ingressのグループ名を設定する。

同じ`alb.ingress.kubernetes.io/group.name`キーのIngressを作成した場合、新しくALBを作成するのではなく、既存のALBにインバウンドルールのみを追加する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/group.name: foo-common-alb
```

> ↪️：https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/annotations/#ingressgroup

#### ▼ `alb.ingress.kubernetes.io/scheme`キー

AWS ALBのスキームを設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
```

#### ▼ `alb.ingress.kubernetes.io/success-codes`キー

成功した場合のステータスコードを設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/success-codes: "200"
```

#### ▼ `alb.ingress.kubernetes.io/subnets`キー

AWS ALBのルーティング先のサブネットを設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/subnets: ["subnet-*****", "subnet-*****"]
```

#### ▼ `alb.ingress.kubernetes.io/target-type`キー

ルーティング先のターゲットタイプを設定する。

Fargateの場合は、`ip`を設定する必要がある。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/target-type: ip
```

#### ▼ `alb.ingress.kubernetes.io/waf-acl-id`キー

LBに紐付けるWAFv1のIDを設定する。ALBと同じリージョンで、WAFv1を作成する必要がある。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/waf-acl-id: *****
```

#### ▼ `alb.ingress.kubernetes.io/wafv2-acl-arn`キー

LBに紐付けるWAFv2のARNを設定する。ALBと同じリージョンで、WAFv2を作成する必要がある。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/wafv2-acl-arn: *****
```

<br>

### `.spec.rules`キー

AWS ALBのリスナールールを定義するために、Ingressの`.spec.rules`キーを設定する。

> ↪️：https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/

<br>
