---
title: 【IT技術の知見】AWS Load Balancerコントローラー＠Ingressコントローラー
description: AWS Load Balancerコントローラー＠Ingressコントローラーの知見を記録しています。
---

# AWS Load Balancerコントローラー＠Ingressコントローラー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS Load Balancerコントローラーの仕組み

### アーキテクチャ

AWS Load Balancerコントローラーは、aws-load-balancer-controller、TargetGroupBinding、といったコンポーネントから構成されている。

aws-load-balancer-controllerは、etcd上のIngressのマニフェストを検知し、設定値に応じたAWS ALBやAWS NLBをプロビジョニングし、これらのリスナールールごとにターゲットグループもプロビジョングする。

その後、TargetGroupBindingの設定値を介して、ALBのターゲットグループとIngressを紐付ける。

これらにより、Cluster外からの通信をPodにルーティングできるようにする。

![aws_load_balancer_controller_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_load_balancer_controller_architecture.png)

> ↪️：
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

NodePort Serviceを使用しなければならない。

AWS Load Balancerコントローラーを使用しない場合と、NodePort Serviceのポート番号に合わせてAWSターゲットグループを作成する必要がある。

AWS Load Balancerコントローラーを使用する場合は、NodePort Serviceのポート番号をランダムにしても、そのポート番号を指定するAWSターゲットグループをAWS Load Balancerコントローラーがプロビジョニングしてくれる。

```yaml
パブリックネットワーク
⬇︎
AWS Route53
⬇︎
AWS Load Balancerコントローラー、AWS ALB (Ingressの設定で決まる)
⬇︎
NodePort Service (ポート番号はランダムでよい)
⬇︎
Pod
```

> ↪️：
>
> - https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/#%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%82%A2%E3%83%97%E3%83%AA%E3%81%AE%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4
> - https://qiita.com/mksamba/items/c0e41a2a63e62a50aea3#21-%E5%85%AC%E9%96%8B%E5%AF%BE%E8%B1%A1%E3%81%AEdeploymentservice%E3%81%AE%E4%BD%9C%E6%88%90

<br>

## 02. セットアップ

### AWS側

#### ▼ 共通

AWS Load Balancerコントローラーは、サブネットを自動的に検出し、これにAWS ALBをプロビジョニングする。

Ingressで作成するAWS ALBをパブリックサブネットで作成する場合、`kubernetes.io/role/elb`というタグ (値は`1`または空文字) を全てのAWS VPCサブネットに設定する。

プライベートサブネットで作成する場合、`kubernetes.io/role/internal-elb`というタグ (値は`1`または空文字) を設定する。

またいずれの場合であっても`kubernetes.io/cluster/<EKS Clusterの名前>` (値は、複数のEKS Clusterで共有するサブネットの場合は`shared`、単一のEKS Clusterの場合は`owned`とする) を設定する。

> ↪️：
>
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.1/deploy/subnet_discovery/
> - https://repost.aws/knowledge-center/eks-load-balancer-controller-subnets



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

  # AWS EKS ClusterのOIDCプロバイダーURLからhttpsプロトコルを除いたもの
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

> ↪️：https://registry.terraform.io/modules/terraform-aws-modules/iam/aws/latest#usage

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

> ↪️：https://qiita.com/crml1206/items/3f5ceeaae27bba033bb1#ingress%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E6%A4%9C%E7%9F%A5%E3%81%97%E3%81%A6alb%E3%81%8C%E4%BD%9C%E6%88%90%E3%81%95%E3%82%8C%E3%82%8B

#### ▼ `awscli`コマンド、`eksctl`コマンド、の場合

AWS Load Balancerコントローラーのセットアップのうち、AWS側で必要なものをまとめる。

ここではコマンドを使用しているが、IaC (例：Terraform) を使用しても良い。

`【１】`

: ローカルマシンにIAMポリシーの`.json`ファイルをダウンロードする。

```bash
$ curl -L https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.4.0/docs/install/iam_policy.json -o iam_policy.json
```

> ↪️：
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

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/adot-iam.html

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
```

```yaml
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

> ↪️：https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/

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

> ↪️：
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

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html

<br>

## 02-02. マニフェスト

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
        # Cluster名を設定する
        - "--cluster-name=foo-cluster"
        # Ingressに紐づけるIngressClassを設定する
        - "--ingress-class=alb"
        # AWS ALBのあるリージョンを設定する
        - "--aws-region=ap-northeast-1"
        # AWS ALBのあるVPCのIDを設定する
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

> ↪️：https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.4/deploy/configurations/#controller-command-line-flags

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

> ↪️：https://catalog.workshops.aws/eks-immersionday/en-US/services-and-ingress/targetgroupbinding

<br>
