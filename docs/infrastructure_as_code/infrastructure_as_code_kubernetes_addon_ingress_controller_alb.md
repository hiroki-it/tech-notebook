---
title: 【IT技術の知見】AWS Load Balancerコントローラー＠Ingressコントローラー
description: AWS Load Balancerコントローラー＠Ingressコントローラーの知見を記録しています。
---

# AWS Load Balancerコントローラー＠Ingressコントローラー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS Load Balancerコントローラーの仕組み

### アーキテクチャ

AWS Load Balancerコントローラーは、aws-load-balancer-controller、TargetGroupBinding、といったコンポーネントから構成されている。

aws-load-balancer-controllerは、etcd上のIngressのマニフェストを検知し、設定値に応じたAWS ALBやAWS NLBをプロビジョニングし、これらのリスナールールごとにターゲットグループもプロビジョングする。

その後、TargetGroupBindingの設定値を介して、ALBのターゲットグループとIngressを紐付ける。

これらにより、Cluster外からの通信をPodにルーティングできるようにする。

![aws_load_balancer_controller_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_load_balancer_controller_architecture.png)

> ↪️ 参考：
>
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.4/how-it-works/
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/service/nlb/
> - https://blog.recruit.co.jp/rmp/infrastructure/post-21469/
> - https://aws.amazon.com/cn/blogs/china/use-aws-load-balancer-controller-s-targetgroupbinding-function-to-realize-flexible-load-balancer-management/

<br>

### AWS Load Balancerコントローラーを使用しない場合

もしAWS CLBを作成したい場合は、AWS Load Balancerコントローラーを使用しない。

LoadBalancer Serviceを作成すると、AWS EKS内のcloud-controller-managerがAWS CLBを自動的にプロビジョニングする。

<br>

### Serviceタイプ

Ingressでインバウンド通信を受信する場合に使用し、NodePort Serviceの場合には使用しない。

```yaml
パブリックネットワーク
⬇︎
AWS Route53
⬇︎
AWS Load Balancerコントローラー、AWS ALB (Ingressの設定で決まる)
⬇︎
ClusterIP Service
⬇︎
Pod
```

<br>

## 01-02. マニフェスト

### マニフェストの種類

AWS Load Balancerコントローラーは、Deployment (aws-load-balancer-controller) 、Service (aws-load-balancer-controller-webhook-service) 、TargetGroupBinding、MutatingWebhookConfiguration、などのマニフェストから構成されている。

<br>

### Deployment配下のPod

#### ▼ aws-load-balancer-controller

Deploymentは、Ingressで`alb`のIngressClassを指定していること検知して、AWS ALBをプロビジョニングする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: aws-load-balancer-controller
  namespace: kube-system
spec:
  containers:
    - args:
        - "--cluster-name=foo-cluster"
        - "--ingress-class=alb"
        - "--aws-region=ap-northeast-1"
        - "--aws-vpc-id=vpc-*****"
      command:
        - /controller
      name: aws-load-balancer-controller
      image: public.ecr.aws/eks/aws-load-balancer-controller:v2.4.0
      ports:
        - containerPort: 9443
          name: webhook-server
          protocol: TCP
        - containerPort: 8080
          name: metrics-server
          protocol: TCP
```

> ↪️ 参考：https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.4/deploy/configurations/#controller-command-line-flags

<br>

### MutatingWebhookConfiguration

Webhookの宛先のServiceを決定する。

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingWebhookConfiguration
metadata:
  name: aws-load-balancer-webhook
webhooks:
  - admissionReviewVersions:
      - v1beta1
    clientConfig:
      caBundle: ...
      service:
        name: aws-load-balancer-webhook-service
        namespace: kube-system
        path: /mutate-v1-pod
        port: 443
    failurePolicy: Fail
    matchPolicy: Exact
    name: mpod.elbv2.k8s.aws
    namespaceSelector:
      matchExpressions:
        - key: elbv2.k8s.aws/pod-readiness-gate-inject
          operator: In
          values:
            - enabled
    objectSelector:
      matchExpressions:
        - key: app.kubernetes.io/name
          operator: NotIn
          values:
            - aws-load-balancer-controller
    reinvocationPolicy: Never
    rules:
      - apiGroups:
          - ""
        apiVersions:
          - v1
        operations:
          - CREATE
        resources:
          - pods
        scope: "*"
    sideEffects: None
    timeoutSeconds: 30
  - admissionReviewVersions:
      - v1beta1
    clientConfig:
      caBundle: ...
      service:
        name: aws-load-balancer-webhook-service
        namespace: kube-system
        path: /mutate-elbv2-k8s-aws-v1beta1-targetgroupbinding
        port: 443
    failurePolicy: Fail
    matchPolicy: Exact
    name: mtargetgroupbinding.elbv2.k8s.aws
    namespaceSelector: {}
    objectSelector: {}
    reinvocationPolicy: Never
    rules:
      - apiGroups:
          - elbv2.k8s.aws
        apiVersions:
          - v1beta1
        operations:
          - CREATE
          - UPDATE
        resources:
          - targetgroupbindings
        scope: "*"
    sideEffects: None
    timeoutSeconds: 30
```

<br>

### Service

AWS Load Balancerコントローラーが作成された場合に、WebhookサーバーにWebhookを送信する。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: aws-load-balancer-webhook-service
  namespace: kube-system
spec:
  ports:
    - name: webhook-server
      port: 443
      protocol: TCP
      targetPort: webhook-server
  selector:
    app.kubernetes.io/instance: aws-load-balancer-controller
    app.kubernetes.io/name: aws-load-balancer-controller
  type: ClusterIP
```

<br>

### ServiceAccount

IRSAの仕組みで、PodとIAMロールを紐付ける。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: foo-aws-load-balancer-controller
  namespace: kube-system
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<アカウントID>:role/foo-aws-load-balancer-controller-role
secrets:
  - name: foo-aws-load-balancer-controller-token
```

<br>

### TargetGroupBinding

記入中...

```yaml
kind: TargetGroupBinding
metadata:
  name: foo-target-group-binding
  namespace: foo
spec:
  serviceRef:
    name: foo-service
    port: 80
  targetGroupARN: <ターゲットグループのARN>
```

![alb_targetgroupbinding](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/alb_targetgroupbinding.png)

> ↪️ 参考：https://catalog.workshops.aws/eks-immersionday/en-US/services-and-ingress/targetgroupbinding

<br>

## 02. セットアップ

### AWS側

#### ▼ Terraformの公式モジュールの場合

AWS Load Balancerコントローラーのセットアップのうち、AWS側で必要なものをまとめる。

ここでは、Terraformの公式モジュールを使用する。

コマンド (例：`eksctl`コマンド) を使用しても良い。

```terraform
module "iam_assumable_role_with_oidc_aws_load_balancer_controller" {

  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"

  version                       = "<モジュールのバージョン>"

  # AWS Load BalancerコントローラーのPodに紐付けるIAMロール
  create_role                   = true
  role_name                     = "foo-aws-load-balancer-controller"

  # AWS EKSのOIDCプロバイダーURLからhttpsプロトコルを除いたもの
  provider_url                  = replace(module.eks.cluster_oidc_issuer_url, "https://", "")

  # AWS IAMロールに紐付けるIAMポリシー
  role_policy_arns              = [
    module.iam_policy_aws_load_balancer_controller.arn
  ]

  # AWS Load BalancerコントローラーのPodのServiceAccount名
  # Terraformではなく、マニフェストで定義した方が良い
  oidc_fully_qualified_subjects = [
    "system:serviceaccount:kube-system:foo-aws-load-balancer-controller"
  ]
}

module "iam_policy_aws_load_balancer_controller" {
  source      = "terraform-aws-modules/iam/aws//modules/iam-policy"
  version     = "<モジュールのバージョン>"
  name        = "foo-aws-load-balancer-controller"
  description = "This is the policy of AWS LB Controller"
  policy      = templatefile(
    "${path.module}/policies/aws_load_balancer_controller_policy.tpl",
    {}
  )
}
```

> ↪️ 参考：https://registry.terraform.io/modules/terraform-aws-modules/iam/aws/latest#usage

別途、AWS Load BalancerコントローラーのPodに紐付けるServiceAccountを作成し、IAMロールのARNを設定する。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: foo-aws-load-balancer-controller
  namespace: kube-system
  annotations:
    eks.amazonaws.com/role-arn: <IAMロールのARN>
```

IRSAにより、ServiceAccountにAWSのIAMロールが紐づく。

![aws_load_balancer_controller_irsa](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_load_balancer_controller_irsa.png)

> ↪️ 参考：https://qiita.com/crml1206/items/3f5ceeaae27bba033bb1#ingress%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E6%A4%9C%E7%9F%A5%E3%81%97%E3%81%A6alb%E3%81%8C%E4%BD%9C%E6%88%90%E3%81%95%E3%82%8C%E3%82%8B

#### ▼ `awscli`コマンド、`eksctl`コマンド、の場合

AWS Load Balancerコントローラーのセットアップのうち、AWS側で必要なものをまとめる。

ここではコマンドを使用しているが、IaC (例：Terraform) を使用しても良い。

`【１】`

: ローカルマシンにIAMポリシーの`.json`ファイルをダウンロードする。

```bash
$ curl -L https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.4.0/docs/install/iam_policy.json -o iam_policy.json
```

> ↪️ 参考：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html
> - https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main/helm/aws-load-balancer-controller#setup-iam-for-serviceaccount

`【２】`

: `.json`ファイルを使用して、ServiceAccountのIAMロールに紐付けるためのIAMポリシーを作成する。

```bash
$ aws iam create-policy \
    --policy-name AWSLoad BalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json
```

`【３】`

: EKS ClusterをOIDCプロバイダーとして使用する。

     これにより、EKS Cluster内で認証済みのServiceAccountにIAMロールを紐付けることができるようになる。

```bash
$ eksctl utils associate-iam-oidc-provider \
    --region=ap-northeast-1 \
    --cluster=foo-eks-cluster \
    --approve

2022-05-30 23:39:04 [ℹ]  eksctl version 0.96.0
2022-05-30 23:39:04 [ℹ]  using region ap-northeast-1
2022-05-30 23:39:05 [ℹ]  IAM Open ID Connect provider is already associated with cluster "foo-eks-cluster" in "ap-northeast-1"
```

<br>

`【４】`

: AWS Load BalancerコントローラーのPodのServiceAccountと、これに紐づくIAMロールを作成する。

```bash
$ eksctl create iamserviceaccount \
    --cluster=foo-eks-cluster \
    -n kube-system \
    --name=aws-load-balancer-controller \
    --attach-policy-arn=arn:aws:iam::<AWSアカウントID>:policy/AWSLoad BalancerControllerIAMPolicy \
    --override-existing-serviceaccounts \
    --approve
```

> ↪️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/adot-iam.html

`【５】`

: ServiceAccountを作成できたことを確認する。IAMロールはコンソール画面から確認する。

```bash
$ eksctl get iamserviceaccount \
    --cluster foo-eks-cluster \
    --name foo-aws-load-balancer-controller \
    --namespace kube-system

2022-06-06 13:47:33 [ℹ]  eksctl version 0.96.0
2022-06-06 13:47:33 [ℹ]  using region ap-northeast-1
NAMESPACE       NAME                                ROLE ARN
kube-system     foo-aws-load-balancer-controller    arn:aws:iam::<AWSアカウントID>:role/eksctl-foo-eks-cluster-addon-i-Role1-****
```

```bash
$ kubectl get serviceaccount -n kube-system foo-aws-load-balancer-controller -o yaml

# 作成されたServiceAccount
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<AWSアカウントID>:role/eksctl-foo-eks-cluster-addon-i-Role1-****
  creationTimestamp: "2022-05-29T12:59:15Z"
  labels:
    app.kubernetes.io/managed-by: eksctl
  name: foo-aws-load-balancer-controller
  namespace: kube-system
  resourceVersion: "2103515"
  uid: *****
secrets:
- name: foo-aws-load-balancer-controller-token-****
```

> ↪️ 参考：https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/

<br>

### Kubernetes側

#### ▼ Helmの場合

AWS Load Balancerコントローラーのセットアップのうち、Kubernetes側で必要なものをまとめる。

`【１】`

: 指定したリージョンにAWS Load Balancerコントローラーをデプロイする。

     この時、事前にマニフェストや`eksclt create iamserviceaccount`コマンドで作成したServiceAcountをALBに紐付ける。

     IRSAの仕組みにより、ServiceAccountを介してPodとAWS IAMロールが紐づく。

```bash
$ helm repo add <チャートリポジトリ名> https://aws.github.io/eks-charts

# FargateにAWS Load Balancerコントローラーをデプロイする場合
$ helm install <リリース名> <チャートリポジトリ名>/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName=foo-eks-cluster \
    --set serviceAccount.create=false \
    --set serviceAccount.name=foo-aws-load-balancer-controller \
    --set image.repository=602401143452.dkr.ecr.ap-northeast-1.amazonaws.com/amazon/aws-load-balancer-controller \
    --set region=ap-northeast-1 \
    --set vpcId=vpc-*****


AWS Load Balancer controller installed!
```

```bash
$ helm repo add <チャートリポジトリ名> https://aws.github.io/eks-charts

# EC2にAWS Load Balancerコントローラーをデプロイする場合
$ helm install <リリース名> <チャートリポジトリ名>/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName=foo-eks-cluster \
    --set serviceAccount.create=false \
    --set serviceAccount.name=foo-aws-load-balancer-controller \
    --set image.repository=602401143452.dkr.ecr.ap-northeast-1.amazonaws.com/amazon/aws-load-balancer-controller


AWS Load Balancer controller installed!
```

> ↪️ 参考：
>
> - https://github.com/aws/eks-charts/tree/master/stable/aws-load-balancer-controller
> - https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main/helm/aws-load-balancer-controller#tldr

`【２】`

: AWS Load Balancerコントローラーがデプロイされ、READY状態になっていることを確認する。

```bash
$ helm list -n kube-system

NAME                            NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                                   APP VERSION
aws-load-balancer-controller    kube-system     2               2022-01-01 00:00:00.309065 +0900 JST    deployed        aws-load-balancer-controller-1.4.2      v2.4.2
```

```bash
$ kubectl get deployment -n kube-system aws-load-balancer-controller

NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
aws-load-balancer-controller   2/2     2            0           22m
```

`【３】`

: もし、以下の様に、`53`番ポートへの接続でエラーになってしまう場合は、CoreDNSによる名前解決が正しくできていない。

     そのため、CoreDNSが正常に稼働しているか否かを確認する。

```yaml
{
  "level": "error",
  "ts": "*****.*****",
  "logger": "controller-runtime.manager.controller.ingress",
  "msg": "Reconciler error",
  "name": "foo-ingress",
  "namespace": "foo",
  "error": "ingress: foo/foo-ingress: WebIdentityErr: failed to retrieve credentials\ncaused by: RequestError: send request failed\ncaused by: Post \"https://sts.ap-northeast-1.amazonaws.com/\": dial tcp: lookup sts.ap-northeast-1.amazonaws.com on *.*.*.*:53: read udp *.*.*.*:43958->*.*.*.*:53: read: connection refused",
}
```

`【４】`

: Ingressをデプロイし、IngressからAWS ALBを自動的に作成させる。

     以下の条件を満たす必要がある。

> ↪️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html

<br>

## 03. Ingress

### Ingress

Ingressで`alb`のIngressClassを指定していること検知する。

AWS Load Balancerコントローラーは、Ingressの`.metadata.annotations`キーと`.spec.rules`キーに設定に応じて、AWS ALBを自動的にプロビジョニングする。

> ↪️ 参考：https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/

<br>

### `.metadata.annotations`キー

#### ▼ `.metadata.annotations`キーとは

AWS ALBをリスナールール以外を設定するために、Ingressの`.metadata.annotations`キーを設定する必要がある。

> ↪️ 参考：
>
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.4/guide/ingress/annotations/
> - https://qiita.com/murata-tomohide/items/ea4d9acefda92e05e20f

#### ▼ `alb.ingress.kubernetes.io/certificate-arn`キー

AWS ALBでHTTPSプロトコルを受け付ける場合、事前に作成したSSL証明書のARNを設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-alb-ingress
  annotations:
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-northeast-1:<AWSアカウントID>:certificate/*****
```

> ↪️ 参考：https://nobelabo.hatenablog.com/entry/2022/10/01/201138

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

> ↪️ 参考：https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/annotations/#ingressgroup

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

> ↪️ 参考：https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/

<br>
