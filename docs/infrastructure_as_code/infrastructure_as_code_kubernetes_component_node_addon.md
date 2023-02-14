---
title: 【IT技術の知見】アドオン＠Nodeコンポーネント
description: アドオン＠Nodeコンポーネントの知見を記録しています。
---

# アドオン＠Nodeコンポーネント

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. 外部Ingressコントローラー

### 外部Ingressコントローラーの種類

| コントローラー名                                       | 開発環境 | 本番環境 |
|-------------------------------------------------|----------|----------|
| minikubeのingressアドオン (実体はNginx Ingressコントローラー)  | ✅        |          |
| AWS LBコントローラー                                   |          | ✅        |
| GCP CLBコントローラー                                  |          | ✅        |
| Nginx Ingressコントローラー                            | ✅        | ✅        |
| Istio Ingress                                   | ✅        | ✅        |
| Istio Gateway                                   | ✅        | ✅        |
| ...                                             | ...      | ...      |


> ↪️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/
> - https://www.nginx.com/blog/how-do-i-choose-api-gateway-vs-ingress-controller-vs-service-mesh/


<br>


## 02. AWS LBコントローラー

### AWS LBコントローラーとは

AWS LBコントローラーは、コントローラーの本体であるPod、TargetGroupBinding、から構成されている。

Ingressでインバウンド通信を受信する場合に使用し、NodePort Serviceの場合には使用しない。

```alb```が宣言されたIngressClassを検知して、AWS上に専用のALBを自動的にプロビジョニングする。

また、TargetGroupBindingを介して、ALBのターゲットグループとIngressを紐づける。


![alb_targetgroupbinding](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/alb_targetgroupbinding.png)

> ↪️ 参考：
>
> - https://blog.recruit.co.jp/rmp/infrastructure/post-21469/
> - https://aws.amazon.com/cn/blogs/china/use-aws-load-balancer-controller-s-targetgroupbinding-function-to-realize-flexible-load-balancer-management/

<br>

### セットアップ

#### ▼ AWS側のセットアップ

AWS LBコントローラーのセットアップのうち、AWS側で必要なものをまとめる。

ここではコマンドを使用しているが、IaC (例：Terraform) を使用しても良い。

```【１】```

:    ローカルマシンにIAMポリシーの```.json```ファイルをダウンロードする。

```bash
$ curl -L https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.4.0/docs/install/iam_policy.json -o iam_policy.json
```

> ↪️ 参考：
> 
> - https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html
> - https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main/helm/aws-load-balancer-controller#setup-iam-for-serviceaccount



```【２】```

:    ```.json```ファイルを使用して、ServiceAccountのIAMロールに紐づけるためのIAMポリシーを作成する。

```bash
$ aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json
```

```【３】```

:    EKS ClusterをOIDCプロバイダーとして使用する。

     これにより、EKS Cluster内で認証されたServiceAccountにIAMロールを紐づけることができるようになる。


```bash
$ eksctl utils associate-iam-oidc-provider \
    --region=ap-northeast-1 \
    --cluster=foo-eks-cluster \
    --approve
    
2022-05-30 23:39:04 [ℹ]  eksctl version 0.96.0
2022-05-30 23:39:04 [ℹ]  using region ap-northeast-1
2022-05-30 23:39:05 [ℹ]  IAM Open ID Connect provider is already associated with cluster "foo-eks-cluster" in "ap-northeast-1"
```

#### ▼ Kubernetes側のセットアップ

AWS LBコントローラーのセットアップのうち、Kubernetes側で必要なものをまとめる。


```【１】```

:    AWS LBコントローラーのPodで使用するServiceAccountを作成する。

```bash
$ eksctl create iamserviceaccount \
    --cluster=foo-eks-cluster \
    -n kube-system \
    --name=aws-load-balancer-controller \
    --attach-policy-arn=arn:aws:iam::<アカウントID>:policy/AWSLoadBalancerControllerIAMPolicy \
    --override-existing-serviceaccounts \
    --approve
```

```【２】```

:    ServiceAccountを作成できたことを確認する。

> ↪️ 参考：https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/

```bash
$ eksctl get iamserviceaccount \
    --cluster foo-eks-cluster \
    --name aws-load-balancer-controller \
    --namespace kube-system

2022-06-06 13:47:33 [ℹ]  eksctl version 0.96.0
2022-06-06 13:47:33 [ℹ]  using region ap-northeast-1
NAMESPACE       NAME                            ROLE ARN
kube-system     aws-load-balancer-controller    arn:aws:iam::<アカウントID>:role/eksctl-foo-eks-cluster-addon-i-Role1-****
```

```bash
$ kubectl get serviceaccount -n kube-system aws-load-balancer-controller -o yaml

# 作成されたServiceAccount
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<アカウントID>:role/eksctl-foo-eks-cluster-addon-i-Role1-****
  creationTimestamp: "2022-05-29T12:59:15Z"
  labels:
    app.kubernetes.io/managed-by: eksctl
  name: aws-load-balancer-controller
  namespace: kube-system
  resourceVersion: "2103515"
  uid: *****
secrets:
- name: aws-load-balancer-controller-token-****
```

```【３】```

:    指定したリージョンにAWS LBコントローラーをデプロイする。

     この時、事前に作成したServiceAcountをALBに紐づける。



```bash
$ helm repo add <チャートリポジトリ名> https://aws.github.io/eks-charts

# FargateにAWS LBコントローラーをデプロイする場合
$ helm install <リリース名> <チャートリポジトリ名>/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName=foo-eks-cluster \
    --set serviceAccount.create=false \
    --set serviceAccount.name=aws-load-balancer-controller \
    --set image.repository=602401143452.dkr.ecr.ap-northeast-1.amazonaws.com/amazon/aws-load-balancer-controller \
    --set region=ap-northeast-1 \
    --set vpcId=<VPCID>


AWS Load Balancer controller installed!
```

```bash
$ helm repo add <チャートリポジトリ名> https://aws.github.io/eks-charts

# EC2にAWS LBコントローラーをデプロイする場合
$ helm install <リリース名> <チャートリポジトリ名>/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName=foo-eks-cluster \
    --set serviceAccount.create=false \
    --set serviceAccount.name=aws-load-balancer-controller \
    --set image.repository=602401143452.dkr.ecr.ap-northeast-1.amazonaws.com/amazon/aws-load-balancer-controller


AWS Load Balancer controller installed!
```

> ↪️ 参考：
> 
> - https://github.com/aws/eks-charts/tree/master/stable/aws-load-balancer-controller
> - https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main/helm/aws-load-balancer-controller#tldr

```【４】```

:    AWS LBコントローラーがデプロイされ、READY状態になっていることを確認する。

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

```【５】```

:    もし、以下の様に、```53```番ポートへの接続でエラーになる場合は、CoreDNSによる名前解決が正しくできていない。

     そのため、CoreDNSが正常に稼働しているか否かを確認する。



```yaml
{
   "level":"error",
   "ts":"*****.*****",
   "logger":"controller-runtime.manager.controller.ingress",
   "msg":"Reconciler error",
   "name":"foo-ingress",
   "namespace":"foo",
   "error":"ingress: foo/foo-ingress: WebIdentityErr: failed to retrieve credentials\ncaused by: RequestError: send request failed\ncaused by: Post \"https://sts.ap-northeast-1.amazonaws.com/\": dial tcp: lookup sts.ap-northeast-1.amazonaws.com on *.*.*.*:53: read udp *.*.*.*:43958->*.*.*.*:53: read: connection refused"
}
```

```【６】```

:    Ingressをデプロイし、IngressからALB Ingressを自動的に作成させる。

     以下の条件を満たす必要がある。

> ↪️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html

<br>

### Ingress

#### ▼ ```.metadata.annotations```キー

IngressとALBを紐づけるために、```.metadata.annotations```キーを設定する必要がある。

| 項目                                            | 説明                                                           |
|-------------------------------------------------|--------------------------------------------------------------|
| ```alb.ingress.kubernetes.io/certificate-arn``` | ALB IngressでHTTPSプロトコルを受け付ける場合、SSL証明書のARNを設定する。       |
| ```alb.ingress.kubernetes.io/listen-ports```    | ALB Ingressでインバウンド通信を受け付けるポート番号を設定する。                  |
| ```alb.ingress.kubernetes.io/scheme```          | ALB Ingressのスキームを設定する。                                       |
| ```alb.ingress.kubernetes.io/subnets```         | ALB Ingressのルーティング先のサブネットを設定する。                             |
| ```alb.ingress.kubernetes.io/target-type```     | ルーティング先のターゲットタイプを設定する。Fargateの場合は、```ip```を設定する必要がある。 |
| ```alb.ingress.kubernetes.io/waf-acl-id```      | LBに紐づけるWAFv1のIDを設定する。ALBと同じリージョンで、WAFv1を作成する必要がある。     |
| ```alb.ingress.kubernetes.io/wafv2-acl-arn```   | LBに紐づけるWAFv2のARNを設定する。ALBと同じリージョンで、WAFv2を作成する必要がある。    |


> ↪️ 参考：
>
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.4/guide/ingress/annotations/
> - https://qiita.com/murata-tomohide/items/ea4d9acefda92e05e20f


<br>

### TargetGroupBinding

調査中...

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

> ↪️ 参考：https://catalog.workshops.aws/eks-immersionday/en-US/services-and-ingress/targetgroupbinding

<br>
