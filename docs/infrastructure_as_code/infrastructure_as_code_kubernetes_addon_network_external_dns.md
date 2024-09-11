---
title: 【IT技術の知見】ExternalDNS＠ネットワーク系
description: ExternalDNS＠ネットワーク系の知見を記録しています。
---

# ExternalDNS＠ネットワーク系

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ExternalDNSアドオンの仕組み

### アーキテクチャ

ExternalDNSコントローラーは、ネットワークからのリクエストにDNSレコードを必要とするKubernetesリソース (例：Ingress、Serviceなど) の設定値に応じて、DNSプロバイダー (例：AWS Route53) にDNSレコードを自動的に作成する。

Ingressコントローラー (例：aws-load-balancer-controller、glb-controller) と合わせて使用し、パブリックネットワークからのリクエストをArgoCDのダッシュボード (argocd-server) にルーティング可能にする。

![external-dns_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/external-dns_architecture.png)

> - https://networkop.co.uk/post/2020-08-k8s-gateway/
> - https://github.com/kubernetes-sigs/external-dns/blob/master/docs/faq.md#how-do-i-specify-a-dns-name-for-my-kubernetes-objects

<br>

### AWSの場合

以下のようなIngressを定義したとする。

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

するとExternalDNSアドオンは、Ingressの`.spec.rules[*].host`キーに応じて、AWS Route53にAレコードとTXTレコードを作成する。

```bash
$ kubectl logs external-dns -n kube-system | grep example.com

time="2023-02-28T10:09:30Z" level=info msg="Desired change: CREATE example.com A [Id: /hostedzone/*****]"
time="2023-02-28T10:09:30Z" level=info msg="Desired change: CREATE example.com TXT [Id: /hostedzone/*****]"
```

> - https://kubernetes-sigs.github.io/external-dns/v0.12.2/tutorials/alb-ingress/#ingress-examples

<br>

## 02. マニフェスト

### マニフェストの種類

ExternalDNSアドオンは、Deployment (external-dns) 、Serviceなどのマニフェストから構成される。

<br>

### Deployment配下のPod

#### ▼ external-dns

記入中...

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: external-dns
  namespace: kube-system
spec:
  serviceAccountName: external-dns
  containers:
    - name: external-dns
      image: registry.k8s.io/external-dns/external-dns:v0.13.2
      args:
        # DNSゾーンタイプを設定する
        - --aws-zone-type=public
        - --log-level=info
        - --log-format=text
        - --registry=txt
        # DNSレコード追加のために検知するKubernetesリソースを設定する
        - --source=service
        - --source=ingress
        # DNSレコード追加対象のDNSゾーン (例：AWS Route53のホストゾーン) を設定する
        - --domain-filter=example.com
        # Ingressからルールを削除した場合に、対応するAWSリソース (AWS ALBリスナールール、AWS Route53 DNSレコード) も削除する
        - --policy=sync
        - --provider=aws
        - --txt-owner-id=external-dns
      env:
        - name: AWS_DEFAULT_REGION
          value: ap-northeast-1

  ...
```

> - https://kubernetes-sigs.github.io/external-dns/v0.12.2/tutorials/ANS_Group_SafeDNS/#manifest-for-clusters-with-rbac-enabled
> - https://qiita.com/nakamasato/items/8215b7b86add58f77810

この時、`--annotation-filter`オプションを使用すると、条件に合致するアノテーションを持つIngressやServiceを、ExternalDNSの検知から除外する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: external-dns
  namespace: kube-system
spec:
  serviceAccountName: external-dns
  containers:
    - name: external-dns
      image: registry.k8s.io/external-dns/external-dns:v0.13.2
      args:

        ...


        - --annotation-filter=<任意の.metadata.annotationsキー名> in <値>
        - --annotation-filter=<任意の.metadata.annotationsキー名> notin <値>

  ...

```

> - https://github.com/kubernetes-sigs/external-dns/blob/master/docs/faq.md#running-an-internal-and-external-dns-service
> - https://github.com/kubernetes-sigs/external-dns/issues/1910#issuecomment-803640491

<br>

### ServiceAccount、ClusterRole

#### ▼ external-dns

ExternalDNSコントローラーがDNSプロバイダー (例：AWS Route53) にリクエストを送信できるように、ExternalDNSコントローラーにはClusterRoleに基づく認可スコープを持つ。

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

> - https://kubernetes-sigs.github.io/external-dns/v0.12.2/tutorials/aws/#manifest-for-clusters-without-rbac-enabled

<br>

## 03. セットアップ

### Kubernetes側

#### ▼ Helmの場合

Helmを使用する。

別途、IngressやServiceの作成が必要である。

```bash
$ helm repo add <チャートリポジトリ名> https://kubernetes-sigs.github.io/external-dns/

$ helm install <Helmリリース名> <チャートリポジトリ名>/external-dns -n kube-system --version <バージョンタグ>
```

> - https://github.com/kubernetes-sigs/external-dns/tree/master/charts/external-dns

<br>

### AWS側

#### ▼ Terraformの公式モジュールの場合

ArgoCDのセットアップのうち、AWS側で必要なものをまとめる。

ここでは、Terraformの公式モジュールを使用する。

```terraform
module "iam_assumable_role_with_oidc_external_dns" {

  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"

  version                       = "<バージョン>"

  # ExternalDNSのPodに紐付けるIAMロール
  create_role                   = true
  role_name                     = "foo-external-dns"

  # AWS EKS ClusterのOIDCプロバイダーURLからhttpsプロトコルを除いたもの
  provider_url                  = replace(module.eks.cluster_oidc_issuer_url, "https://", "")

  # AWS IAMロールに紐付けるIAMポリシー
  role_policy_arns              = [
    "arn:aws:iam::<AWSアカウントID>:policy/ExternalDNSIAMPolicy"
  ]

  # ExternalDNSのPodのServiceAccount名
  # ServiceAccountは、Terraformではなく、マニフェストで定義した方が良い
  oidc_fully_qualified_subjects = [
    "system:serviceaccount:kube-system:foo-external-dns",
    ...
  ]

}
```

```terraform
module "acm" {
  source  = "terraform-aws-modules/acm/aws"
  version = "~> 4.3.2"

  domain_name = aws_route53_zone.foo.name
  zone_id     = aws_route53_zone.foo.zone_id
  # ワイルドカード証明書とする
  subject_alternative_names = [
    "*.example.com"
  ]
}

resource "aws_route53_zone" "foo" {
  name = "example.com"
}

resource "aws_route53_record" "foo" {
  zone_id = aws_route53_zone.foo.id
  name    = "foo.example.com"
  # Route53のTerraformとExternalDNSのマニフェストを分離するために、NSタイプを使用する
  type    = "NS"
  ttl     = 30
  records = aws_route53_zone.foo.name_servers
}
```

<br>
