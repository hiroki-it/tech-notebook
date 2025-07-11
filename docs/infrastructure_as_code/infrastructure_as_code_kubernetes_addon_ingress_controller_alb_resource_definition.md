---
title: 【IT技術の知見】リソース定義＠AWS Load Balancer Controller
description: リソース定義＠AWS Load Balancer Controllerの知見を記録しています。
---

# リソース定義＠AWS Load Balancer Controller

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Ingressの`.metadata.annotations`キー

### Ingressの`.metadata.annotations`キーとは

特定のNginxのルーティングルールを決める。

Ingressで`alb`のIngressClassを指定する必要がある。

AWS Load Balancer Controllerは、Ingressの`.metadata.annotations`キーと`.spec.rules`キーに設定に応じて、AWS ALBを自動的にプロビジョニングする。

> - https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.4/guide/ingress/annotations/
> - https://qiita.com/murata-tomohide/items/ea4d9acefda92e05e20f

<br>

### `alb.ingress.kubernetes.io/certificate-arn`キー

#### ▼ `alb.ingress.kubernetes.io/certificate-arn`キーとは

AWS ALBでHTTPSプロトコルを受け付ける場合、事前に作成したAWS Certificate Managerのサーバー証明書のARNを設定する。

AWS Load Balancer Controllerは、プロビジョニングしたALBにAWS Certificate Managerのサーバー証明書を自動的に紐づける。

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

AWS Certificate Managerのサーバー証明書のARNを指定せずとも、オートディスカバリーを使用して、AWS Certificate Managerのサーバー証明書を紐づけられる。

aws-load-balancer-controllerは、Ingressの`.spec.tls`キーや`.spec.rules[*].host`キーに基づいて、適切なAWS Certificate Managerのサーバー証明書をAWS ALBに自動的に紐づける。

例えばIngressで`.spec.rules[*].hosts`キーに`foo.example.com`を設定していた場合、aws-load-balancer-controllerは`*.example.com`で認証されたサーバー証明書をAWS Certificate Managerから探す。

> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.11/guide/ingress/cert_discovery/#discover-via-ingress-rule-host

<br>

### `alb.ingress.kubernetes.io/healthcheck-path`キー

ヘルスチェック対象としてPodのコンテナのパスを設定する。

`alb.ingress.kubernetes.io/target-type`キー値が`instance`でも`ip`でも、ヘルスチェック対象はPodである。

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

### `alb.ingress.kubernetes.io/healthcheck-port`キー

ヘルスチェック対象として、Podのコンテナのポート番号を設定する。

`alb.ingress.kubernetes.io/target-type`キー値が`instance`でも`ip`でも、ヘルスチェック対象はPodである。

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

### `alb.ingress.kubernetes.io/inbound-cidrs`キー

インバウンド通信で許可するCIDRを設定する。

`alb.ingress.kubernetes.io/wafv2-acl-arn`キーを使用して、同じルールを持ったAWS WAFを紐づけても良い。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/inbound-cidrs: *.*.*.*
```

<br>

### `alb.ingress.kubernetes.io/listen-ports`キー

AWS ALBでインバウンド通信を受け付けるポート番号を設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
```

<br>

### `alb.ingress.kubernetes.io/load-balancer-attributes`キー

AWS ALBの属性を設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/load-balancer-attributes: access_logs.s3.enabled=true,access_logs.s3.bucket=foo-alb-ingress-backet,access_logs.s3.prefix=foo
```

<br>

### `alb.ingress.kubernetes.io/group.name`キー

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

> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/annotations/#ingressgroup

<br>

### `alb.ingress.kubernetes.io/scheme`キー

AWS ALBのスキームを設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
```

<br>

### `alb.ingress.kubernetes.io/success-codes`キー

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

### `alb.ingress.kubernetes.io/subnets`キー

AWS ALBのルーティング先のサブネットを設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/subnets: ["subnet-*****", "subnet-*****"]
```

<br>

### `alb.ingress.kubernetes.io/target-type`キー

#### ▼ `alb.ingress.kubernetes.io/target-type`キーとは

ルーティング先のターゲットタイプを設定する。

#### ▼ `instance`の場合

instanceターゲットタイプを設定する。

インスタンスターゲットタイプの場合、宛先Podの送信元のServiceはNodePort Serviceとする。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/target-type: instance
```

> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.7/guide/ingress/annotations/#traffic-routing
> - https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html

#### ▼ `ip`の場合

IPターゲットタイプを設定する。

IPターゲットタイプの場合、宛先Podの送信元のServiceはClusterIP Serviceとする。

AWS Fargateの場合は、`ip`を設定する必要がある。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/target-type: ip
```

> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.7/guide/ingress/annotations/#traffic-routing
> - https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html
> - https://dev.classmethod.jp/articles/lbc-service-no-target-group/

<br>

### `alb.ingress.kubernetes.io/waf-acl-id`キー

LBに紐付けるAWS WAF v1のIDを設定する。ALBと同じリージョンで、AWS WAF v1を作成する必要がある。

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

### `alb.ingress.kubernetes.io/wafv2-acl-arn`キー

LBに紐付けるAWS WAF v2のARNを設定する。ALBと同じリージョンで、AWS WAF v2を作成する必要がある。

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

## 02. Ingressの`.spec.rules`キー

AWS ALBのリスナールールを定義するために、Ingressの`.spec.rules`キーを設定する。

> - https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/

<br>
