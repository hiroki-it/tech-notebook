---
title: 【IT技術の知見】リソース定義＠AWS Load Balancer Controller
description: リソース定義＠AWS Load Balancer Controllerの知見を記録しています。
---

# リソース定義＠AWS Load Balancer Controller

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Ingressの `.metadata.annotations` キー

### Ingressの `.metadata.annotations` キーとは

特定の Nginx のルーティングルールを決める。

Ingress で `alb` の IngressClass を指定する必要がある。

AWS Load Balancer Controller は、Ingress の `.metadata.annotations` キーと `.spec.rules` キーの設定に応じて、AWS ALB を自動的にプロビジョニングする。

> - https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.4/guide/ingress/annotations/
> - https://qiita.com/murata-tomohide/items/ea4d9acefda92e05e20f

<br>

### `alb.ingress.kubernetes.io/certificate-arn` キー

#### ▼ `alb.ingress.kubernetes.io/certificate-arn` キーとは

AWS ALB で HTTPS プロトコルを受け付ける場合、事前に作成した AWS Certificate Manager のサーバー証明書の ARN を設定する。

AWS Load Balancer Controller は、プロビジョニングした ALB に AWS Certificate Manager のサーバー証明書を自動的に紐づける。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-northeast-1:<AWSアカウントID>:certificate/*****
```

> - https://nobelabo.hatenablog.com/entry/2022/10/01/201138
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.11/guide/ingress/cert_discovery/

#### ▼ オートディスカバリー

AWS Certificate Manager のサーバー証明書の ARN を指定せずとも、オートディスカバリーを使用して、AWS Certificate Manager のサーバー証明書を紐づけられる。

aws-load-balancer-controller は、Ingress の `.spec.tls` キーや `.spec.rules[*].host` キーに基づいて、適切な AWS Certificate Manager のサーバー証明書を AWS ALB に自動的に紐づける。

例えば Ingress で `.spec.rules[*].hosts` キーに `foo.example.com` を設定していた場合、aws-load-balancer-controller は `*.example.com` で認証されたサーバー証明書を AWS Certificate Manager から探す。

> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.11/guide/ingress/cert_discovery/#discover-via-ingress-rule-host

<br>

### `alb.ingress.kubernetes.io/healthcheck-path` キー

ヘルスチェック対象として Pod のコンテナのパスを設定する。

`alb.ingress.kubernetes.io/target-type` キー値が `instance` でも `ip` でも、ヘルスチェック対象は Pod である。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-http-ingress
  annotations:
    # HTTPヘルスチェックのパス
    # HTTPヘルスチェックのパスはPodの種類によって異なる
    alb.ingress.kubernetes.io/healthcheck-path: /healthz/ready
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-grpc-ingress
  annotations:
    # gRPCのヘルスチェックパス
    # gRPCのヘルスチェックパスはPodの種類によらず同じ
    alb.ingress.kubernetes.io/healthcheck-path: /grpc.health.v1.Health/Check
```

> - https://lab.mo-t.com/blog/k8s-update-load-balancer
> - https://dev.classmethod.jp/articles/ingress-healthcheck-ip-or-instance/#toc-3

<br>

### `alb.ingress.kubernetes.io/healthcheck-port` キー

ヘルスチェック対象として、Pod のコンテナのポート番号を設定する。

`alb.ingress.kubernetes.io/target-type` キー値が `instance` でも `ip` でも、ヘルスチェック対象は Pod である。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/healthcheck-port: 80
```

> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.11/guide/ingress/annotations/#health-check
> - https://dev.classmethod.jp/articles/ingress-healthcheck-ip-or-instance/#toc-3

<br>

### `alb.ingress.kubernetes.io/inbound-cidrs` キー

インバウンド通信で許可する CIDR を設定する。

`alb.ingress.kubernetes.io/wafv2-acl-arn` キーを使用して、同じルールを持った AWS WAF を紐づけてもよい。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/inbound-cidrs: *.*.*.*
```

<br>

### `alb.ingress.kubernetes.io/listen-ports` キー

AWS ALB でインバウンド通信を受け付けるポート番号を設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
```

<br>

### `alb.ingress.kubernetes.io/load-balancer-attributes` キー

AWS ALB の属性を設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/load-balancer-attributes: access_logs.s3.enabled=true,access_logs.s3.bucket=foo-alb-ingress-backet,access_logs.s3.prefix=foo
```

<br>

### `alb.ingress.kubernetes.io/group.name` キー

Ingress のグループ名を設定する。

同じ `alb.ingress.kubernetes.io/group.name` キーの Ingress を作成した場合、新しく ALB を作成するのではなく、既存の ALB にインバウンドルールのみを追加する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/group.name: foo-common-alb
```

> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/annotations/#ingressgroup

<br>

### `alb.ingress.kubernetes.io/scheme` キー

AWS ALB のスキームを設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
```

<br>

### `alb.ingress.kubernetes.io/success-codes` キー

成功した場合のステータスコードを設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/success-codes: "200"
```

<br>

### `alb.ingress.kubernetes.io/subnets` キー

AWS ALB のルーティング先のサブネットを設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/subnets: ["subnet-*****", "subnet-*****"]
```

<br>

### `alb.ingress.kubernetes.io/target-type` キー

#### ▼ `alb.ingress.kubernetes.io/target-type` キーとは

ルーティング先のターゲットタイプを設定する。

#### ▼ `instance` の場合

instance ターゲットタイプを設定する。

インスタンスターゲットタイプの場合、宛先 Pod の送信元の Service は NodePort Service とする。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    # Ingressに紐づけるServiceはNodePort Serviceとする
    alb.ingress.kubernetes.io/target-type: instance
```

> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.7/guide/ingress/annotations/#traffic-routing
> - https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html

#### ▼ `ip` の場合

IP ターゲットタイプを設定する。

IP ターゲットタイプの場合、宛先 Pod の送信元の Service は ClusterIP Service とする。

AWS Fargate の場合は、`ip` を設定する必要がある。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    # Ingressに紐づけるServiceはClusterIP Serviceとする
    alb.ingress.kubernetes.io/target-type: ip
```

> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.7/guide/ingress/annotations/#traffic-routing
> - https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html
> - https://dev.classmethod.jp/articles/lbc-service-no-target-group/

<br>

### `alb.ingress.kubernetes.io/waf-acl-id` キー

LB に紐付ける AWS WAF v1 の ID を設定する。ALB と同じリージョンで、AWS WAF v1 を作成する必要がある。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/waf-acl-id: *****
```

> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/annotations/#wafv2-acl-arn

<br>

### `alb.ingress.kubernetes.io/wafv2-acl-arn` キー

LB に紐付ける AWS WAF v2 の ARN を設定する。ALB と同じリージョンで、AWS WAF v2 を作成する必要がある。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/wafv2-acl-arn: arn:aws:wafv2:ap-northeast-1:<AWSアカウントID>:regional/webacl/<WAFのACL名>/<ID>
```

> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/annotations/#wafv2-acl-arn

<br>

## 02. Ingressの `.spec.rules` キー

AWS ALB のリスナールールを定義するために、Ingress の `.spec.rules` キーを設定する。

> - https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/

<br>
