---
title: 【IT技術の知見】Amazon EKS＠AWSリソース
description: Amazon EKS＠AWSリソースの知見を記録しています。
---

# Amazon EKS＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Amazon EKS：Elastic Kubernetes Service

### コントロールプレーン

#### ▼ コントロールプレーンとは

コンテナオーケストレーションを実行する環境を提供する。

データプレーンの Amazon VPC 外に存在している。

> - https://aws.github.io/aws-eks-best-practices/reliability/docs/controlplane/

#### ▼ コントロールプレーンの仕組み

Amazon EKS のコントロールプレーンは、開発者や他の AWS リソースからのリクエストを待ち受ける API、接続を API にルーティングする NLB、データプレーンを管理するコンポーネント、からなる。

![eks_control-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_control-plane.png)

> - https://www.sunnycloud.jp/column/20210315-01/

<br>

### データプレーン

#### ▼ データプレーンとは

複数のホスト (Amazon EC2、Fargate) の OS 上でコンテナオーケストレーションを実行する。

『`on EC2`』『`on Fargate`』という呼び方は、データプレーンが Amazon EKS の実行環境 (`on environment`) の意味合いを持つからである。

<br>

## 01-02. セットアップ (コンソールの場合)

### 設定項目と説明

| 設定項目                         | 説明                                                                                           | 補足                                                                                                                                                                                                                                                                                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 名前                             | クラスターの名前を設定する。                                                                   |                                                                                                                                                                                                                                                                                                                                  |
| Kubernetesバージョン             | Amazon EKS上で稼働するKubernetesのバージョンを設定する。                                       | Amazon EKSが対応できるKubernetesのバージョンは以下を参考にせよ。<br>https://docs.aws.amazon.com/eks/latest/userguide/platform-versions.html                                                                                                                                                                                      |
| クラスターサービスロール         | Amazon EKS Clusterのサービスリンクロールを設定する。                                           | ・https://docs.aws.amazon.com/eks/latest/userguide/service_IAM_role.html                                                                                                                                                                                                                                                         |
| シークレット                     | Secretに保管するデータをAWS KMSの暗号化キーで暗号化するか否かを設定する。                      |                                                                                                                                                                                                                                                                                                                                  |
| Amazon VPC、サブネット           | ENIを配置するサブネットを設定する。                                                            | 複数のAZにまたがっている必要がある。                                                                                                                                                                                                                                                                                             |
| クラスターセキュリティグループ   | Amazon EKS Clusterのセキュリティグループを設定する。                                           | インバウンドとアウトバウンド通信の両方のルールで、すべてのIPアドレスを許可する必要がある。このセキュリティグループは、追加のセキュリティグループとして設定され、別途、AWSによって `eks-cluster-sg-<Amazon EKS Cluster名>` というセキュリティグループも自動設定される。<br>https://yuutookun.hatenablog.com/entry/fargate_for_eks |
| クラスターIPアドレスファミリー   | PodとServiceに割り当てるClusterIPのIPアドレスタイプ (IPv4、IPv6) を設定する。                  |                                                                                                                                                                                                                                                                                                                                  |
| CIDRブロック                     | ClusterIP Serviceに割り当てるIPアドレスのCIDRブロックを設定する。                              |                                                                                                                                                                                                                                                                                                                                  |
| クラスターエンドポイントアクセス | kube-apiserverのリクエスト制限を設定する。                                                     |                                                                                                                                                                                                                                                                                                                                  |
| ネットワークアドオン             | ネットワークに関するAmazon EKSアドオンを設定する。                                             | 執筆時点 (2023/02/05) では、AWS kube-proxy、AWS CoreDNS、Amazon VPC CNIを使用できる。                                                                                                                                                                                                                                            |
| コントロールプレーンのログ       | コントロールプレーンコンポーネントのログをAmazon CloudWatch Logsに出力するかどうかを設定する。 | 執筆時点 (2023/02/05) では、kube-apiserver (処理ログと監査ログの両方) 、aws-iam-authenticator-server (処理ログ) 、kube-controller-manager (処理ログ) 、cloud-controller-manager (処理ログ) 、kube-scheduler (処理ログ) のログを出力できる。                                                                                      |

<br>

## 01-03. セットアップ (Terraformの場合)

ここでは、Terraform の公式モジュールを使用する。

```terraform
module "eks_foo" {
  source = "terraform-aws-modules/eks/aws"

  version = "<モジュールのバージョン>"

  cluster_name    = foo-eks-cluster
  cluster_version = "<Kubernetesのバージョン>"

  # kube-apiserverをプライベートアクセスにするか否か
  cluster_endpoint_private_access = true

  # kube-apiserverにパブリックリクエストできるか否か
  cluster_endpoint_public_access = false

  # Amazon EKS Clusterのkube-apiserverにリクエストを送信できるCIDR
  cluster_endpoint_public_access_cidrs = ["*.*.*.*/32", "*.*.*.*/32", "*.*.*.*/32"]

  # Amazon CloudWatch Logsに送信するログの種類
  cluster_enabled_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler",]

  # ログの保管期間
  cluster_log_retention_in_days = 365

  # セキュリティグループを作成するか否か
  cluster_create_security_group = true

  # セキュリティグループのID
  cluster_security_group_id = "*****"

  # IRSAを有効化するか否か
  enable_irsa = true

  # ワーカーNodeのセキュリティグループを作成するか否か
  worker_create_security_group = true

  # Amazon VPCのID
  vpc_id = "vpc-*****"

  # サブネットのID
  subnets = ["subnet-*****", "subnet-*****", "subnet-*****"]

  # Amazon EKSアドオン
  addons = {

    coredns = {
      resolve_conflicts = "OVERWRITE"
    }

    kube-proxy = {
      resolve_conflicts = "OVERWRITE"
    }

    vpc-cni = {
      resolve_conflicts = "OVERWRITE"
    }
  }

  # Amazon EKSマネージドグループ
  eks_managed_node_groups = {
    foo-group = {
      instance_types = ["m5.large"]
      min_size     = 3
      max_size     = 4
      desired_size = 5
    }
  }
}
```

> - https://registry.terraform.io/modules/terraform-aws-modules/eks/aws/latest#usage

<br>

### Amazon EKS Clusterの資格情報の追加

`kubectl` コマンドで Amazon EKS Cluster を操作するためには、`kubeconfig` ファイルへ Cluster の資格情報を登録する必要がある。

`(1)`

: AWS CLI に資格情報を設定する。

```bash
$ aws configure
```

`(2)`

: Amazon EKS Cluster の名前を指定して、`kubeconfig` ファイルに Cluster の資格情報を登録する。

```bash
$ aws eks update-kubeconfig --region ap-northeast-1 --name foo-eks-cluster
```

`(3)`

: `kubectl` コマンドの向き先を、Amazon EKS Cluster の kube-apiserver に変更する。

```bash
$ kubectl config use-context <ClusterのARN>
```

`(4)`

: `kubectl` コマンドの接続を確認する。

```bash
$ kubectl get pod
```

> - https://docs.aws.amazon.com/eks/latest/userguide/getting-started-console.html
> - https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html#deploy-dashboard

<br>

## 02. コントロールプレーンのコンポーネント

### 対応関係

| コントロールプレーン上のAWSリソース            | Kubernetesリソース       | 補足                                                                    |
| ---------------------------------------------- | ------------------------ | ----------------------------------------------------------------------- |
| Amazon EKSコントロールプレーン                 | コントロールプレーンNode | https://docs.aws.amazon.com/eks/latest/userguide/platform-versions.html |
| kube-apiserver                                 | kube-apiserver           |                                                                         |
| kube-apiserverのロードバランサー (例：HAProxy) | NLB                      |                                                                         |

<br>

### コントロールプレーンNode

コントロールプレーン Node は、ユーザーの管理外の Amazon VPC に所属している。

<br>

### パブリックアクセス/プライベートアクセス

kube-apiserver のインターネットへの公開範囲を設定できる。

プライベートアクセスの場合、Amazon VPC 内部からのみリクエストできるように制限でき、送信元 IP アドレスを指定してアクセスを許可できる。

> - https://dev.classmethod.jp/articles/eks-public-endpoint-access-restriction/

<br>

### 監視

#### ▼ Amazon EKS Upgrade insight

非推奨 apiVersion 検出ツール (例：pluto、kubepug) のようなクライアント側からの検証ではなく、kube-apiserver 側で非推奨 apiVersion を検出する。

kube-apiserver の監査ログから非推奨 apiVersion を検出する。

```yaml
クライアント # pluto で検証
↓
--- Cluster
↓
kube-apiserver
↓
etcd # Amazon EKSアップグレードインサイトで検証
```

> - https://aws.amazon.com/blogs/containers/accelerate-the-testing-and-verification-of-amazon-eks-upgrades-with-upgrade-insights/
> - https://qiita.com/kyohei_tsuno/items/27eafb4cff4c14c9c9bd

<br>

### NLB

記入中...

<br>

## 02-02. kube-apiserver

### aws-auth (ConfigMap) を経由したKubernetes RBACとの連携

![eks_auth_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_auth_architecture.png)

ConfigMap を経由して Kubernetes の RBAC と連携することにより、Kubernetes Cluster 外部の kube-apiserver クライアント (例：開発者、GitOps CD ツール、監視ツールなど) の認可スコープを制御する。

新しいアクセスエントリーよりもセットアップが難しい。

`(1)`

: あらかじめ、kube-apiserver クライアント (`kubectl` クライアント、Kubernetes リソース) に紐づく AWS IAM ユーザーを作成しておく。

`(2)`

: AWS IAM ユーザーが kube-apiserver の URL にリクエストを送信する。

     kube-apiserverは、aws-iam-authenticator-serverにWebhookリクエストを送信する。

     admission-controllersアドオンのWebhookではないことに注意する。

`(3)`

: コントロールプレーン Node 上の aws-iam-authenticator-server は、IAM API を使用して AWS IAM ユーザーを認証する。

`(4)`

: もし認証に成功していた場合、aws-iam-authenticator-server は、ConfigMap (aws-auth) を確認する。

     このConfigMapには、そのAWS IAMユーザーに紐づくUserAccount／ServiceAccount／Group／RoleBinding／ClusterRoleBindingが定義されている。

     この時、Kubernetes Cluster外部のkube-apiserverクライアント (例：開発者、GitOps CDツール、監視ツールなど) の場合はUserAccount、Kubernetesリソースの場合はServiceAccountを取得する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-auth
  namespace: kube-system
data:
  mapAccounts: []
  mapUsers: []
  mapRoles: |
    - rolearn: arn:aws:iam::<AWSアカウントID>:role/foo-role # AWS IAMロール名
      username: hiroki-it # AWS IAMユーザー名
      groups:
        - system:masters # ClusterRoleBindingに定義されたGroup名
    - rolearn: arn:aws:iam::<AWSアカウントID>:role/bar-role # ワーカーNodeに紐付けたロール名
      username: system:node:{{EC2PrivateDNSName}} # ワーカーNodeの識別子
      groups:
        - system:bootstrappers
        - system:nodes
```

`(5)`

: aws-iam-authenticator-server は、UserAccount／ServiceAccount／Group、RoleBinding や ClusterRoleBinding の情報を含むレスポンスを kube-apiserver に返信する。

`(6)`

: あとは、Kubernetes の標準の認可の仕組みである。

     kube-apiserverは、UserAccount／ServiceAccount／Groupに紐づくRoleやClusterRoleを、RoleBindingやClusterRoleBindingを経由して取得する。

     AWS IAMユーザーは、Kubernetesリソースを操作できる。

> - https://aws.amazon.com/blogs/containers/kubernetes-rbac-and-iam-integration-in-amazon-eks-using-a-java-based-kubernetes-operator/
> - https://dzone.com/articles/amazon-eks-authentication-amp-authorization-proces
> - https://katainaka0503.hatenablog.com/entry/2019/12/07/091737
> - https://www.karakaram.com/eks-system-masters-group/
> - https://zenn.dev/nameless_gyoza/articles/eks-authentication-authorization-20210211#1.-%E5%A4%96%E9%83%A8%E3%81%8B%E3%82%89eks%E3%81%AB%E5%AF%BE%E3%81%97%E3%81%A6%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%99%E3%82%8B%E5%A0%B4%E5%90%88

<br>

### プリンシパルAWS IAMロールとアクセスエントリーを経由したKubernetes Clusterの操作

#### ▼ 概要

プリンシパル AWS IAM ロールとアクセスエントリーを使用することにより、Kubernetes Cluster 外部の kube-apiserver クライアント (例：開発者、GitOps CD ツール、監視ツールなど) の認可スコープを制御する。

プリンシパル AWS IAM ロールとアクセスエントリーを使用する場合、従来の aws-auth (ConfigMap) と比較して、より簡単にセットアップできる。

プリンシパル AWS IAM ロールに紐づく Pod が Amazon EKS へ接続するとき、アクセスエントリーがこれを中継する。

Kubernetes リソースの認可スコープを IRSA で制御し、この仕組みのなかで、アクセスエントリーはアクセスエントリーポリシーを AWS IAM ロールに動的に紐づける。

#### ▼ `kubectl` クライアント (例：開発者、ArgoCDなど)

```terraform
# Amazon EKS Clusterのkubectlクライアントとなる別のAmazon EKS Cluster

# ArgoCDのPodにスイッチロールの権限を持たせるためのAWS IAMロール
# 対象のAmazon EKS Clusterに接続するためのAWS IAMロールにスイッチロールできる
module "iam_assumable_role_with_oidc_argocd_access_entry_service" {

  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"

  version                       = "<バージョン>"

  # ArgoCDのPodに紐付けるAWS IAMロール
  create_role                   = true
  role_name                     = "foo-argocd-access-entry-service"

  # Amazon EKS ClusterのOIDCプロバイダーURLからhttpsプロトコルを除いたもの
  # ArgoCDは外部のAmazon EKS Clusterで稼働している
  provider_url                  = replace(module.eks_argocd.cluster_oidc_issuer_url, "https://", "")

  # ArgoCDのPodのServiceAccount名
  # ServiceAccountは、Terraformではなく、マニフェストで定義したほうが良い
  oidc_fully_qualified_subjects = [
    # argocd applicaton-controller
    "system:serviceaccount:argocd:foo-argocd-application-controller",
    # argocd-server
    "system:serviceaccount:argocd:foo-argocd-server",
    ...
  ]
}

# 対象のAmazon EKS Clusterに接続するためのAWS IAMロール
# 対象のAmazon EKS Clusterでアクセスエントリーを設定する必要がある
module "iam_assumable_role_argocd_access_entry_cluster" {

  source               = "terraform-aws-modules/iam/aws//modules/iam-assumable-role"

  version              = "<バージョン>"

  create_role          = true
  role_name            = "foo-argocd-access-entry-cluster"

  trusted_role_actions = ["sts:AssumeRole"]

  trusted_role_arns    = [
    module.iam_assumable_role_with_oidc_argocd_access_entry_service.iam_role_arn
  ]

  role_requires_mfa    = false
}
```

Kubernetes Cluster 外部の kube-apiserver クライアント (例：開発者、GitOps CD ツール、監視ツールなど) の Amazon EKS Cluster のサーバー証明書を base64 方式エンコードした値 (`-----BEGIN CERTIFICATE-----` から `-----END CERTIFICATE-----` まで) を `caData` として設定する。

`aws eks describe-cluster` コマンドやコンソール画面から確認できる。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: <クラスター名>
  labels:
    argocd.argoproj.io/secret-type: cluster
type: Opaque
data:
  config: |
    awsAuthConfig:
      clusterName": "<クラスター名>",
      roleARN: "<対象のAmazon EKS ClusterにアクセスするためのAWS IAMロールARN>"
    tlsClientConfig:
      insecure: false,
      caData: "<Amazon EKS Clusterのサーバー証明書をbase64方式エンコードした値>"
  name: "<クラスター名>"
  server: "https://*****.gr7.ap-northeast-1.eks.amazonaws.com"
```

> - https://aws.amazon.com/blogs/containers/a-deep-dive-into-simplified-amazon-eks-access-management-controls/
> - https://dev.classmethod.jp/articles/eks-access-management-with-iam-access-entry/
> - https://github.com/argoproj/argo-cd/issues/2347#issuecomment-1963555799

#### ▼ 宛先

```terraform
# 宛先のAmazon EKS Clusterの設定

# 対象のAmazon EKS Clusterでアクセスエントリーを設定する
resource "aws_eks_access_entry" "argocd" {

  cluster_name      = aws_eks_cluster.foo_argocd.name

  principal_arn     = aws_iam_role.argocd.arn

  type = "STANDARD"
}

resource "aws_eks_access_policy_association" "argocd" {

  cluster_name = "foo-cluster"

  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSViewPolicy"

  principal_arn = aws_iam_role.argocd.arn

  access_scope {
    namespaces = "foo-namespace"
    type       = "namespace"
  }

  depends_on = [
    aws_eks_access_entry.argocd,
  ]
}

resource "aws_iam_role" "access_entry_argocd" {

  name = "access-entry-argocd"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::*****:role/aws-reserved/sso.amazonaws.com/ap-northeast-1/AWSReservedSSO_*****"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

```

> - https://mohibulalam75.medium.com/aws-eks-authentication-a-guide-for-iam-principals-with-terraform-example-71c234e847ab

<br>

## 03. データプレーンのコンポーネント

### 対応関係

![eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks.png)

| データプレーン上のAWSリソース               | Kubernetesリソース          | 補足                                                                                                                                                                                                                                                                                      |
| ------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FargateワーカーNode、Amazon EC2ワーカーNode | ワーカーNode                | ・https://docs.aws.amazon.com/eks/latest/userguide/eks-compute.html                                                                                                                                                                                                                       |
| Amazon EKS Cluster                          | Cluster                     | ・https://docs.aws.amazon.com/eks/latest/userguide/clusters.html                                                                                                                                                                                                                          |
| AWS ALB                                     | Ingress                     | IngressはAWS ALBに置き換える必要がある。AWS Load Balancer Controllerを作成すると、AWS ALBは自動的に作成される。<br>・https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html <br>・https://blog.linkode.co.jp/entry/2020/06/26/095917#AWS-ALB-Ingress-Controller-for-Kubernetes |
| AWS Load Balancer Controller                | Ingress Controller          | AWS ALBを自動的に作成する。<br>・https://aws.amazon.com/jp/blogs/news/using-alb-ingress-controller-with-amazon-eks-on                                                                                                                                                                     |
| Amazon API Gateway + NLB                    |                             | ・https://aws.amazon.com/jp/blogs/news/api-gateway-as-an-ingress-controller-for-eks/                                                                                                                                                                                                      |
| EBS、AWS EFS                                | PersistentVolume            | ・https://docs.aws.amazon.com/eks/latest/userguide/storage.html                                                                                                                                                                                                                           |
| Secrets Manager                             | Secret                      | ・https://docs.aws.amazon.com/eks/latest/userguide/manage-secrets.html                                                                                                                                                                                                                    |
| AWS IAMユーザー                             | ServiceAccount、UserAccount | ・https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html                                                                                                                                                                                                                     |
| AWS IAMロール                               | Role、ClusterRole           | ・https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html                                                                                                                                                                                                                     |

> - https://zenn.dev/yoshinori_satoh/articles/2021-02-13-eks-ecs-compare

<br>

### Amazon EKS Cluster

#### ▼ Amazon EKS Clusterとは

Fargate ワーカーNode や Amazon EC2 ワーカーNode の管理グループ単位のこと。

Kubernetes Cluster に相当する。

> - https://www.sunnycloud.jp/column/20210315-01/

<br>

### マルチワーカーNode

#### ▼ マルチワーカーNodeとは

マルチワーカーNode を作成する場合、AZ ごとに Node を作成する。

![eks_multi-node](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_multi-node.png)

> - https://docs.aws.amazon.com/eks/latest/userguide/eks-networking.html

#### ▼ ワーカーNode間のファイル共有

AWS EFS を使用して、ワーカーNode 間でファイルを共有する。

Pod のファイルはワーカーNode にマウントされるため、異なるワーカーNode 上の Pod 間でファイルを共有したい場合 (例：Prometheus のローカルストレージを Pod 間で共有したい) に役立つ。

ただしできるだけ、ワーカーNode をステートフルではなくステートレスにする必要があり、Pod のファイルはワーカーNode の外で管理する必要がある。

> - https://blog.linkode.co.jp/entry/2020/07/01/142155

<br>

### IRSA：IAM Roles for Service Accounts

#### ▼ IRSAとは

![eks_oidc](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_oidc.png)

特に Kubernetes リソースの認可スコープを制御する仕組みのこと。

Kubernetes Cluster 外部の kube-apiserver クライアント (例：開発者、GitOps CD ツール、監視ツールなど) の認可スコープは、RBAC で制御する。

Amazon EKS を SSO の ID プロバイダーとして使用することにより、IAM の認証フェーズを Amazon EKS に委譲する。

#### ▼ セットアップ

ここでは、SSO の種類で OIDC を選ぶとする。

`(1)`

: SSO の ID プロバイダーのタイプは、OIDC とする。

     『Amazon EKS ClusterのOIDCプロバイダーURL』『OIDCプロバイダーのサーバー証明書を署名する中間認証局 (例：CertificateManagerなど) のサムプリント』『IDプロバイダーによるトークンの発行対象 (`sts.amazonaws.com`) 』を使用して、OIDCプロバイダーを作成する。

```terraform
data "tls_certificate" "this" {
  url = module.foo_eks.cluster_oidc_issuer_url
}

# OIDCのIDプロバイダーをAWSに登録する。
resource "aws_iam_openid_connect_provider" "this" {
  url             = module.foo_eks.cluster_oidc_issuer_url
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = data.tls_certificate.this[0].certificates[*].sha1_fingerprint
}
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      volumeMounts:
        - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
          name: kube-api-access-*****
          readOnly: "true"
        # OIDCのプロバイダーによるアクセストークンをコンテナにマウントする
        - mountPath: /var/run/secrets/eks.amazonaws.com/serviceaccount
          name: aws-iam-token
          readOnly: "true"
  volumes:
    - name: kube-api-access-*****
      projected:
        defaultMode: 420
        sources:
          - serviceAccountToken:
              expirationSeconds: 3607
              path: token
          - configMap:
              items:
                - key: ca.crt
                  path: ca.crt
              name: kube-root-ca.crt
          - downwardAPI:
              items:
                - fieldRef:
                    apiVersion: v1
                    fieldPath: metadata.namespace
                  path: namespace
    # Amazon EKSを使用している場合、AWS-APIへのリクエストに必要なトークンも設定される
    - name: aws-iam-token
      projected:
        defaultMode: 420
        sources:
          - serviceAccountToken:
              # OIDCのIDプロバイダーによるトークンの発行対象
              audience: sts.amazonaws.com
              expirationSeconds: 86400
              path: token
```

> - https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html
> - https://zenn.dev/nameless_gyoza/articles/eks-authentication-authorization-20210211#%E7%99%BB%E9%8C%B2%E6%89%8B%E9%A0%86-1
> - https://onsd.hatenablog.com/entry/2019/09/21/015522
> - https://github.com/terraform-aws-modules/terraform-aws-eks/blob/v19.16.0/main.tf#L223-L242
> - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc_verify-thumbprint.html

`(2)`

: IRSA で使用する AWS IAM ロールの信頼されたエンティティに、Amazon EKS Cluster の OIDC プロバイダーURL やユーザー名 (`system:serviceaccount:<Namespac名>:<ServiceAccount名>`) を設定する。

```yaml
{"Version": "2012-10-17", "Statement": [
      {
        "Sid": "",
        "Effect": "Allow",
        "Principal":
          {
            "Federated": "arn:aws:iam::<AWSアカウントID>:oidc-provider/<Amazon EKS ClusterのOIDCプロバイダーURL>",
          },
        # AssumeRoleWithWebIdentityを使用する
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
            # 完全一致
            "StringEquals":
              {
                "<Amazon EKS ClusterのOIDCプロバイダーURL>:sub":
                  ["system:serviceaccount:<Namespac名>:<ServiceAccount名>"],
              },
          },
      },
    ]}
```

`(3)`

: ServiceAccount の `.metadata.annotations.eks.amazonaws.com/role-arn` キーで AWS IAM ロールの ARN を設定する。

     これにより、Amazon EKSで認証済みのServiceAccountにAWS IAMロールを紐付けることができるようになる。

     `automountServiceAccountToken`キーが有効化されていることを確認する。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    eks.amazonaws.com/role-arn: <AWS IAMロールのARN>
  name: <信頼されたエンティティで指定したユーザー名にあるServiceAccount名>
  namespace: <信頼されたエンティティで指定したユーザー名にあるNamespace名>
automountServiceAccountToken: "true"
```

`(4)`

: Pod で、ServiceAccount 名を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
  namespace: foo-namespace
spec:
  serviceAccountName: foo-sa
  containers: ...
```

もし `.metadata.annotations.eks.amazonaws.com/role-arn` キーを使用しない場合、Kubernetes リソースから AWS リソースへのアクセスがあったときは、Amazon EC2 ワーカーNode や Fargate ワーカーNode の AWS IAM ロールが使用される。

IRSA が登場するまでは、Amazon EKS 上でのワーカーNode (例：Amazon EC2、Fargate) にしか AWS IAM ロールを紐付けることができず、Kubernetes リソースに AWS IAM ロールを直接的に紐付けることはできなかった。

ServiceAccount のトークンは、コンテナにファイルとしてマウントされている。

```bash
$ printenv | sort -f

AWS_DEFAULT_REGION=ap-northeast-1
AWS_REGION=ap-northeast-1
AWS_ROLE_ARN=arn:aws:iam::<アカウントID>:role/argocd-reposerver
AWS_STS_REGIONAL_ENDPOINTS=regional
# ServiceAccountのトークン文字列が記載されたファイル
AWS_WEB_IDENTITY_TOKEN_FILE=/var/run/secrets/eks.amazonaws.com/serviceaccount/token

...
```

> - https://aws.amazon.com/jp/blogs/news/diving-into-iam-roles-for-service-accounts/
> - https://www.bigtreetc.com/column/eks-irsa/
> - https://katainaka0503.hatenablog.com/entry/2019/12/07/091737#ServiceAccount%E3%81%AEIAM-%E3%83%AD%E3%83%BC%E3%83%ABIRSA
> - https://aws.amazon.com/blogs/opensource/introducing-fine-grained-iam-roles-service-accounts/
> - https://zenn.dev/nameless_gyoza/articles/eks-authentication-authorization-20210211#2.-eks%E3%81%8B%E3%82%89aws%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%B8%E3%81%A8%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%99%E3%82%8B%E5%A0%B4%E5%90%88

<br>

### デバッグ

#### ▼ ダッシュボード

`(1)`

: Amazon EKS Cluster の名前を指定して、`kubeconfig` ファイルに Cluster の資格情報を登録する。

```bash
$ aws eks update-kubeconfig --region ap-northeast-1 --name foo-eks-cluster
```

> - https://docs.aws.amazon.com/eks/latest/userguide/getting-started-console.html

`(2)`

: `kubectl` コマンドの向き先を、Amazon EKS Cluster の kube-apiserver に変更する。

```bash
$ kubectl config use-context <ClusterのARN>
```

> - https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html#deploy-dashboard

`(3)`

: マニフェストを使用して、ダッシュボードの Kubernetes リソースを Amazon EKS にデプロイする。

```bash
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.5/aio/deploy/recommended.yaml
```

> - https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html#eks-admin-service-account

`(4)`

: ダッシュボードに安全に接続するために、ServiceAccount を Amazon EKS にデプロイする

```bash
$ kubectl apply -f service-account.yml
```

`(5)`

: トークン文字列を取得する。

```bash
$ kubectl -n kube-system describe secret $(kubectl get secret -n kube-system | grep eks-admin | awk '{print $1}')
```

`(6)`

: ローカルマシンから Amazon EKS にポートフォワーディングを実行する。

```bash
$ kubectl proxy
```

`(7)`

: ダッシュボードに接続する。

```yaml
GET http://127.0.0.1:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#!/login HTTP/1.1
```

#### ▼ ワーカーNode (例：Amazon EC2、Fargate) への接続

AWS SSM Session Manager を使用して、ワーカーNode (例：Amazon EC2、Fargate) に接続できる。

<br>

## 03-02. Cluster内のIPアドレス

### ServiceのためのIPアドレス

Service に割り当てる IP アドレスは、Service IP 範囲によって決まる。

`10.100.0.0/16` または `172.20.0.0/16` のいずれかになる。

```bash
$ kubectl get service -A jsonpath='{.spec.clusterIP}'

# IP範囲の中からServiceにIPアドレスを割り当てる
172.20.74.199
172.20.0.1
172.20.123.203
172.20.0.10
```

> - https://repost.aws/questions/QU1ppbhrVsQJaFSuT3Gr0u6A/what-is-service-ipv4-range-in-eks-console
> - https://marcincuber.medium.com/amazon-eks-with-custom-service-ipv4-cidr-a698cece481

<br>

### PodのためのIPアドレス

Pod の IP アドレスは、Amazon EC2 の ENI とセカンダリープライベート IP アドレスに割り当てられる IP アドレスによって決まる。

Amazon VPC CNI 内の L-IPAM デーモンは、ENI とセカンダリープライベート IP アドレスの情報を CNI にプールする。

> - https://aws.github.io/aws-eks-best-practices/networking/vpc-cni/
> - https://qiita.com/hichihara/items/54ff9aeff476bf463509#cni-%E3%82%AA%E3%83%9A%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3

<br>

## 03-03. サブネット内外へのリクエスト

Amazon EKS データプレーンはプライベートサブネットで稼働させ、パブリックネットワーク上の ALB から通信を受信するとよい。

このとき、パブリックネットワークにあるレジストリから、Istio や ArgoCD のコンテナイメージをプルできるように、Amazon EKS Fargate ワーカーNode と Internet Gateway 間のネットワークを繋げる必要がある。

そのために、パブリックサブネットに AWS NAT Gateway を配置する。

> - https://aws.amazon.com/jp/blogs/news/de-mystifying-cluster-networking-for-amazon-eks-worker-nodes/

<br>

## 03-04. データプレーン内外へのリクエスト

### パブリックサブネット内のデータプレーンからのリクエスト

Pod をパブリックサブネットに配置した場合、パブリックネットワークや Amazon VPC 外にある AWS リソース (Amazon ECR、Amazon S3、AWS Systems Manager、Amazon CloudWatch Logs、DynamoDB など) に対してリクエストを送信するために特に必要なものはない。

このとき、`POD_SECURITY_GROUP_ENFORCING_MODE=standard` に設定された Amazon VPC CNI は SNAT 処理を実行し、クライアント側 Pod の送信元 IP アドレスを Amazon EC2 ワーカーNode のプライマリーENI (`eth0`) の IP アドレスに変換する。

> - https://note.com/tyrwzl/n/n715a8ef3c28a
> - https://docs.aws.amazon.com/eks/latest/userguide/security-groups-for-pods.html

<br>

### プライベートサブネット内のデータプレーンからのリクエスト

#### ▼ Pod外から内へのリクエスト

Pod をプライベートサブネットに配置した場合、プライベートサブネット外から内のデータプレーンへのリクエストを AWS Load Balancer Controller で受信し、AWS ALB を使用して Pod にルーティングする。

![eks_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_architecture.png)

> - https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/deploy-a-grpc-based-application-on-an-amazon-eks-cluster-and-access-it-with-an-application-load-balancer.html

#### ▼ 宛先情報の管理方法

リクエストの宛先情報は、Secret で管理し、Pod 内のコンテナにマウントする。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
data:
  # RDS (Aurora) の宛先情報
  DB_HOST_PRIMARY: <プライマリーインスタンスのエンドポイント>
  DB_HOST_READ: <リードレプリカのエンドポイント>
  DB_USER: bar
  DB_PASSWORD: baz
  # SQSの宛先情報
  SQS_QUEUE_NAME: foo-queue.fifo
  SQS_REGION: ap-northeast-1
```

#### ▼ Amazon VPC外のほかのAWSリソースへのリクエスト

Pod をプライベートサブネットに配置した場合、パブリックネットワークや Amazon VPC 外にある AWS リソース (Amazon ECR、Amazon S3、AWS Systems Manager、Amazon CloudWatch Logs、AWS DynamoDB など) に対してリクエストを送信するためには、AWS NAT Gateway または Amazon VPC エンドポイントを配置する必要がある。

このとき、クライアント側 Pod の送信元 IP アドレスは、AWS NAT Gateway または Amazon VPC エンドポイントに紐づく IP アドレスとなる。

以下のようなエラーで Pod が起動しない場合、Pod が何らかの理由でコンテナイメージをプルできない可能性がある。

また、Pod が作成されない限り、ワーカーNode も作成されないことに注意する。

```bash
Pod provisioning timed out (will retry) for pod
```

> - https://docs.aws.amazon.com/eks/latest/userguide/network_reqs.html

#### ▼ Amazon VPC外のコントロールプレーンへのリクエスト

Amazon EKS Cluster を作成すると、ENI も作成する。

これにより、データプレーンが Amazon VPC 外のコントロールプレーンと通信できるようになる。

データプレーンがコントロールプレーンをリクエストを送受信する場合、コントロールプレーンのクラスターエンドポイントの設定 (パブリック、プライベート) によって、マネージドな Interface 型 Amazon VPC エンドポイントまたは AWS NAT Gateway が必要になる。

| Amazon VPCエンドポイントの接続先 | タイプ             | プライベートDNS名                                                                  | 説明                                                                                                          |
| -------------------------------- | ------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Amazon EKSコントロールプレーン   | (たぶん) Interface | マネージド                                                                         | プライベートサブネット内のAmazon EC2 NodeからコントロールプレーンのあるAmazon VPCにリクエストを送信するため。 |
| Amazon CloudWatch Logs           | Interface          | `logs.ap-northeast-1.amazonaws.com`                                                | Pod内のコンテナのログをPOSTリクエストを送信するため。                                                         |
| Amazon ECR                       | Interface          | `api.ecr.ap-northeast-1.amazonaws.com`<br>`*.dkr.ecr.ap-northeast-1.amazonaws.com` | コンテナイメージのGETリクエストを送信するため。                                                               |
| Amazon S3                        | Gateway            | なし                                                                               | コンテナイメージのレイヤーをPOSTリクエストを送信するため                                                      |
| AWS Systems Manager              | Interface          | `ssm.ap-northeast-1.amazonaws.com`                                                 | AWS Systems ManagerのパラメーターストアにGETリクエストを送信するため。                                        |
| AWS Secrets Manager              | Interface          | `ssmmessage.ap-northeast-1.amazonaws.com`                                          | Secrets Managerを使用するため。                                                                               |

> - https://dev.classmethod.jp/articles/eks_basic/
> - https://aws.amazon.com/jp/blogs/news/de-mystifying-cluster-networking-for-amazon-eks-worker-nodes/

#### ▼ Amazon VPC内のほかのAWSリソースへのリクエスト

Amazon VPC 内にある AWS リソース (RDS など) の場合、その AWS 側のセキュリティグループにて、Pod のプライベートサブネットの CIDR ブロックを許可すればよい。

<br>

## 03-05. コントロールプレーン内外へのリクエスト

### コントロールプレーンとワーカーNodeのネットワーク

コントロールプレーンは Amazon VPC 外にあり、ワーカーNode は Amazon VPC 内にある。

`kubectl` コマンドやワーカーNode からのリクエストのエンドポイントとして NLB が配置されている。

この NLB を経由して、コントロールプレーン内の kube-apiserver にリクエストを送信できる。

Amazon VPC 外から NLB への `443` 番ポートに対するネットワークからのリクエストはデフォルトでは許可されているが、拒否するように設定できる。

![eks_control-plane_worker_network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_control-plane_worker_network.png)

> - https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html

<br>

### クラスターエンドポイントのリクエスト制限

#### ▼ パブリックのみの場合

基本的には、すべての IP アドレスから kube-apiserver にリクエストを送信できる。

プライベートサブネット内にワーカーNode がある場合、AWS NAT Gateway を経由して、kube-apiserver にリクエストを送信することになる。

> - https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html#private-access

#### ▼ パブリックとプライベートの場合

パブリックとプライベートを許可する場合、指定した CIDR ブロックに含まれる IP アドレスからのみ、kube-apiserver にリクエストを送信できる。

プライベートサブネット内にワーカーNode がある場合、以下のいずれかの経路で kube-apiserver にリクエストを送信することになる。

- AWS NAT Gateway を経由して、AWS NAT Gateway を経由して、パブリック制限を通過する
- ENI (Interface 型の Amazon VPC エンドポイント) を経由して、プライベート制限を通過する

![eks_control-plane_worker_network_public_private_endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_control-plane_worker_network_public_private_endpoint.png)

Amazon VPC 外の AWS リソース (例：Amazon EKS コントロールプレーン、Amazon ECR、Amazon S3、AWS Systems Manager、Amazon CloudWatch Logs、DynamoDB など) にリクエストを送信する場合、専用の Amazon VPC エンドポイントを設ける必要がある。

| Amazon VPCエンドポイントの接続先 | タイプ             | プライベートDNS名                                                                  | 説明                                                                                                          |
| -------------------------------- | ------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Amazon EKSコントロールプレーン   | (たぶん) Interface | マネージド                                                                         | プライベートサブネット内のAmazon EC2 NodeからコントロールプレーンのあるAmazon VPCにリクエストを送信するため。 |
| Amazon CloudWatch Logs           | Interface          | `logs.ap-northeast-1.amazonaws.com`                                                | Pod内のコンテナのログをPOSTリクエストを送信するため。                                                         |
| Amazon ECR                       | Interface          | `api.ecr.ap-northeast-1.amazonaws.com`<br>`*.dkr.ecr.ap-northeast-1.amazonaws.com` | コンテナイメージのGETリクエストを送信するため。                                                               |
| Amazon S3                        | Gateway            | なし                                                                               | コンテナイメージのレイヤーをPOSTリクエストを送信するため                                                      |
| AWS Systems Manager              | Interface          | `ssm.ap-northeast-1.amazonaws.com`                                                 | AWS Systems ManagerのパラメーターストアにGETリクエストを送信するため。                                        |
| Secrets Manager                  | Interface          | `ssmmessage.ap-northeast-1.amazonaws.com`                                          | Secrets Managerを使用するため。                                                                               |

> - https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html#private-access

#### ▼ プライベートのみの場合

プライベートのみを許可する場合、この NLB は閉じられ、Amazon VPC 内からしか kube-apiserver にリクエストを送信できなくなる。

プライベートサブネット内にワーカーNode がある場合、Amazon VPC エンドポイントを経由して、kube-apiserver にリクエストを送信することになる。

この状態で、`kubectl` コマンドで kube-apiserver にリクエストを送信できるようにする方法としては、以下のパターンがある。

- ローカルマシンから
- Amazon VPC 内の踏み台 Amazon EC2 から
- Amazon VPC 内の Cloud9 から

> - https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html#private-access
> - https://note.com/tyrwzl/n/nf28cd4372b18
> - https://zenn.dev/yoshinori_satoh/articles/eks-kubectl-instance

<br>

## 04. on Amazon EC2 (Amazon EC2ワーカーNode)

### Amazon EC2ワーカーNode

#### ▼ Amazon EC2ワーカーNodeとは

Amazon EC2 で稼働する Kubernetes のホストのこと。

Fargate と比べてカスタマイズ性が高く、ワーカーNode 当たりで稼働する Pod 数に重み付けを設定できる。

一方で、各 Amazon EC2 のハードウェアリソースの消費量をユーザーが管理しなければならないため、Kubernetes のホストの管理が大変である。

![eks_on_ec2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_on_ec2.png)

> - https://www.sunnycloud.jp/column/20210315-01/

<br>

### セットアップ

#### ▼ IAMポリシー

Amazon EC2 ワーカーNode が、自身の所属する Cluster にリクエストを送信できるように、Amazon EC2 ワーカーNode に `AmazonEKSWorkerNodePolicy` を付与する必要がある。

Amazon EC2 ワーカーNode 内の Pod が Amazon ECR からコンテナイメージをプルできるように、Amazon EC2 ワーカーNode に `AmazonEC2ContainerRegistryReadOnly` を付与する必要がある。

これにより、Pod のコンテナごとに AWS の資格情報をマウントする必要がなくなる。

`aws-node` の Pod が AWS のネットワーク系の API にリクエストを送信できるように、IRSA 用の ServiceAccount に `AmazonEKS_CNI_Policy` (IPv4 の場合) または `AmazonEKS_CNI_IPv6_Policy` (IPv6 の場合) を付与する必要がある。

> - https://docs.aws.amazon.com/eks/latest/userguide/create-node-role.html
> - https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSWorkerNodePolicy.html
> - https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEC2ContainerRegistryReadOnly.html
> - https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKS_CNI_Policy.html

<br>

### 監視

#### ▼ ログ収集

| Node上のログの場所                   | 説明                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `/var/log/containers	`                | このディレクトリに、そのAmazon EC2ワーカーNode上のPod内コンテナのログファイルのシンボリックリンクを作成する。 |
| `var/log/aws-routed-eni/ipamd.log`   | このディレクトリに、Amazon VPC CNIのL-IPAMデーモンのログを出力する。                                          |
| `/var/log/aws-routed-eni/plugin.log` | 同上                                                                                                          |

> - https://docs.aws.amazon.com/prescriptive-guidance/latest/implementing-logging-monitoring-cloudwatch/kubernetes-eks-logging.html#eks-node-application-logging

<br>

## 04-02. Nodeグループ (on Amazon EC2)

### マネージド

#### ▼ マネージドNodeグループ

- Node グループ内の各 Amazon EC2 ワーカーNode の作成
- Node グループに紐づく AWS Auto Scaling グループの作成
- Amazon EC2 ワーカーNode の OS やミドルウェアの各種アップグレード

を自動化する。

Node グループは、Amazon EC2 ワーカーNode が配置されるプライベートサブネットの AZ にこれをスケジューリングさせるように、AWS Auto Scaling グループに各 AZ を自動的に設定する。

AWS Auto Scaling グループの機能を使用すれば、Amazon EC2 ワーカーNode の自動的な起動/停止やヘルスチェックを設定できる。

> - https://docs.aws.amazon.com/eks/latest/userguide/managed-node-groups.html
> - https://www.techtarget.com/searchaws/tip/2-options-to-deploy-Kubernetes-on-AWS-EKS-vs-self-managed
> - https://www.reddit.com/r/kubernetes/comments/v8pckh/eks_selfmanaged_nodes_vs_node_group/

#### ▼ Nodeグループの定期アクション

同じ Node グループの Amazon EC2 ワーカーNode の定期アクションを設定する。

Amazon EKS のテスト環境の請求料金を節約するため、昼間に通常の個数へスケールアウトし、夜間に `0` 個へスケールインするようにすれば、ワーカーNode を夜間だけ停止させられる。

> - https://docs.aws.amazon.com/eks/latest/userguide/managed-node-groups.html
> - https://blog.framinal.life/entry/2020/07/19/044328#%E3%83%9E%E3%83%8D%E3%83%BC%E3%82%B8%E3%83%89%E5%9E%8B%E3%83%8E%E3%83%BC%E3%83%89%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97

#### ▼ 起動テンプレートとAWS Auto Scalingグループとの紐付け

マネージド Node グループは、あくまで Amazon EC2 Node のライフサイクルを管理するだけである。

どのような Amazon EC2 Node を管理するのかは起動テンプレートと AWS Auto Scaling グループを使用して定義する必要がある。

> - https://aws.amazon.com/jp/blogs/containers/introducing-launch-template-and-custom-ami-support-in-amazon-eks-managed-node-groups/
> - https://qiita.com/Uro3/items/d966b9bf77dc2b81e7f2

<br>

### セルフマネージド

#### ▼ セルフマネージドNodeグループ

- Node グループ内の各 Amazon EC2 ワーカーNode の作成
- Node グループに紐づく AWS Auto Scaling グループの作成
- Amazon EC2 ワーカーNode の OS やミドルウェアの各種アップグレード

をユーザーが管理する。

AWS Auto Scaling グループの機能を使用すれば、Amazon EC2 ワーカーNode の自動的な起動/停止やヘルスチェックを設定できる。

> - https://www.techtarget.com/searchaws/tip/2-options-to-deploy-Kubernetes-on-AWS-EKS-vs-self-managed
> - https://www.reddit.com/r/kubernetes/comments/v8pckh/eks_selfmanaged_nodes_vs_node_group/

<br>

### Node数の変更

Node グループ (マネージド Node グループ、セルフマネージド Node グループ) では、希望数を変更することで現在の Node 数を変更できる。

設定後、AWS Auto Scaling グループは希望数で設定した Node 数を維持する (Karpenter のドキュメントでは、これを『静的』と表現している)。

希望数のほかにも最大数と最小数を設定できるが、これらは実際には機能しない。

もし負荷の状況に応じてスケーリングしたい場合、Node のスケーリングツール (例：ClusterAutoscaler、Karpenter など) を使用しないと、最大数と最小数の設定に応じたスケーリングを実施してくれない。

> - https://qiita.com/motani/items/b32f1607d34ae8e5bc00#%E6%A6%82%E8%A6%81
> - https://aws.github.io/aws-eks-best-practices/karpenter/#use-karpenter-for-workloads-with-changing-capacity-needs

<br>

### Amazon EC2へのタグ付けの例

#### ▼ マネージドNodeグループ

| タグ   | 値                           | 説明                                                                                                                                                                                                                            |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Name` | Amazon EC2ワーカーNodeの名前 | Nodeグループで指定する起動テンプレートのタグに、`Name` タグを設定しておく。起動するAmazon EC2ワーカーNodeにAmazon EC2の名前は `Name` タグで決まる仕組みのため、起動テンプレートによってワーカーNode名を設定させることができる。 |

> - https://docs.aws.amazon.com/eks/latest/userguide/launch-templates.html

#### ▼ セルフマネージドNodeグループ

| タグ                                           | 値                           | 説明                                                                                                                                               |
| ---------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Name`                                         | Amazon EC2ワーカーNodeの名前 | Amazon EC2の名前は `Name` タグで決まる仕組みのため、Nodeグループに参加させるAmazon EC2ワーカーNodeの `Name` タグに、ワーカーNode名を設定しておく。 |
| `kubernetes.io/cluster/<Amazon EKS Cluster名>` | `owned`                      | セルフマネージド型のAmazon EC2ワーカーNodeを使用する場合、ユーザーが作成したAmazon EC2をNodeグループに参加させるために、必要である。               |

> - https://docs.aws.amazon.com/eks/latest/userguide/worker.html

<br>

### Amazon EC2のヘルスチェック

#### ▼ Amazon EC2に関するヘルスチェック

Amazon EC2 に関するヘルスチェック (例：Amazon EC2 の正常性) は、AWS Auto Scaling グループで設定できる。

#### ▼ Nodeに関するヘルスチェック

Node に関するヘルスチェック (例：Amazon EC2 内の kubelet の正常性) は、Amazon EKS アドオンの Node 監視エージェントで設定できる。

> - https://www.reddit.com/r/aws/comments/1hg998p/comment/m2hfdns/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
> - https://docs.aws.amazon.com/eks/latest/userguide/node-health.html

<br>

## 04-03. Amazon EC2 Node AMI

### Amazon EC2ワーカーNodeの最適化AMI

#### ▼ Amazon EC2ワーカーNodeの最適化AMIとは

任意の Amazon EC2 ワーカーNode を使用できるが、AWS が用意している最適化 AMI を選んだほうがよい。

この AWS AMI には、Amazon EC2 が Amazon EKS と連携するために必要なソフトウェアがプリインストールされており、Amazon EC2 ワーカーNode をセットアップする手間が省ける。

必ずしも、すべての Amazon EC2 ワーカーNode を同じ AWS AMI で構築する必要はない。

Amazon EC2 ワーカーNode を種類ごとに異なる AWS AMI で作成し、特定のアプリケーションを含む Pod は特定の Amazon EC2 ワーカーNode にスケジューリングさせる (例：計算処理系アプリは Amazon EKS 最適化高速 AMI の Amazon EC2 ワーカーNode 上で動かす) といった方法でもよい。

> - https://docs.aws.amazon.com/eks/latest/userguide/eks-optimized-ami.html

#### ▼ Amazon EKS 最適化 Amazon Linux

Amazon EKS のための標準的な Amazon EC2 を作成できる。もっとも推奨である。

`aws ssm get-parameter` コマンドを使用すると、公式が提供するマシンコンテナイメージの ID を確認できる。

注意点として、AWS AMI のマイナーバージョンは固定できるが、パッチバージョンは固定できない。

そのため、パッチバージョンがアップグレードされるたびに、AWS AMI の ID は変わる。

AWS AMI の ID を固定するためには、AWS AMI をダウンロードして自前で管理する必要がある。

```bash
$ aws ssm get-parameter \
    --name /aws/service/eks/optimized-ami/<バージョン>/amazon-linux-2/recommended/image_id \
    --region ap-northeast-1 \
    --query "Parameter.Value" \
    --output text
```

> - https://docs.aws.amazon.com/eks/latest/userguide/eks-optimized-ami.html
> - https://docs.aws.amazon.com/eks/latest/userguide/retrieve-ami-id.html

#### ▼ Amazon EKS 最適化高速 Amazon Linux

GPU が搭載された Amazon EC2 や Amazon EC2 Inf1 インスタンスを作成できる。

GPU が必要なアプリケーションの含む Pod (計算処理系、機械学習系のアプリケーション) と相性がよい。

#### ▼ Amazon EKS 最適化 ARM Amazon Linux

ARM ベースのプロセッサーが搭載された Amazon EC2 を作成できる。

#### ▼ Amazon EKS 最適化 Bottlerocket AMI

コンテナに特化した Amazon EC2 を作成できる。

```bash
$ aws ssm get-parameter \
    --name /aws/service/bottlerocket/aws-k8s-<バージョン>/x86_64/latest/image_id \
    --region ap-northeast-1 \
    --query "Parameter.Value" \
    --output text
```

> - https://dev.classmethod.jp/articles/bottlerocket/#toc-1
> - https://docs.aws.amazon.com/eks/latest/userguide/eks-optimized-ami-bottlerocket.html

<br>

### Amazon EC2ワーカーNodeのカスタムAMI

#### ▼ Amazon EC2ワーカーNodeのカスタムAMIとは

Amazon EC2 ワーカーNode の最適化 AMI ではない AWS AMI のこと。

<br>

### `kubelet-config.json` ファイル (KubeletConfiguration)

Amazon EC2 ワーカーNode の kubelet を設定する。

```yaml
{
  "kind": "KubeletConfiguration",
  "apiVersion": "kubelet.config.k8s.io/v1beta1",
  "address": "0.0.0.0",
  "authentication":
    {
      "anonymous": {"enabled": "false"},
      "webhook": {"cacheTTL": "2m0s", "enabled": "true"},
      "x509": {"clientCAFile": "/etc/kubernetes/pki/ca.crt"},
    },
  "authorization":
    {
      "mode": "Webhook",
      "webhook": {"cacheAuthorizedTTL": "5m0s", "cacheUnauthorizedTTL": "30s"},
    },
  "clusterDomain": "cluster.local",
  "hairpinMode": "hairpin-veth",
  "readOnlyPort": 0,
  "cgroupDriver": "cgroupfs",
  "cgroupRoot": "/",
  "featureGates": {"RotateKubeletServerCertificate": "true"},
  "protectKernelDefaults": "true",
  "serializeImagePulls": "false",
  "serverTLSBootstrap": "true",
  # 暗号スイート
  "tlsCipherSuites":
    [
      "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
      "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
      "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305",
      "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
      "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305",
      "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384",
      "TLS_RSA_WITH_AES_256_GCM_SHA384",
      "TLS_RSA_WITH_AES_128_GCM_SHA256",
    ],
}
```

> - https://github.com/awslabs/amazon-eks-ami/blob/v20231106/files/kubelet-config.json

<br>

### ユーザーデータファイル

#### ▼ ユーザーデータファイルとは

Amazon EC2 Node の起動時に任意のコマンドを実行できるようにする。

また、セルフマネージド Node グループやマネージド Node グループにて、Amazon EC2 ワーカーNode の AWS AMI にカスタム AMI を使用したり、任意の AWS AMI で起動テンプレートを使用する場合、AWS 側で決められたコマンド (`bootstrap.sh` ファイル) を実行する必要がある。

一方で、マネージド Node グループにて、起動テンプレートを使用せずに Amazon EC2 ワーカーNode を作成する場合、ユーザーデータファイルを自動で作成してくれるため、これは不要である。

> - https://aws.amazon.com/jp/premiumsupport/knowledge-center/eks-worker-nodes-cluster/
> - https://docs.aws.amazon.com/eks/latest/userguide/launch-templates.html#launch-template-user-data
> - https://github.com/terraform-aws-modules/terraform-aws-eks/blob/master/docs/user_data.md

#### ▼ `bootstrap.sh` ファイル

Amazon EC2 ワーカーNode のカスタム AMI に必要なファイルである。

Amazon EC2 ワーカーNode 起動時のユーザーデータファイル内で、`bootstrap.sh` ファイルに決められたパラメーターを渡す必要がある。

ユーザーデータファイル内で、`bootstrap.sh` ファイルにパラメーターを渡す必要がある。

```bash
#!/bin/bash

# ユーザーデータファイル

set -o xtrace

# 主要なパラメーターは以下の通り。
# その他のパラメーター：https://github.com/awslabs/amazon-eks-ami/blob/584f9a56c76fc9e7e8632f6ea45e29d45f2eab63/files/bootstrap.sh#L14-L35
#
# --b64-cluster-ca：kube-apiserverのサーバー証明書の値を設定する。
# --apiserver-endpoint：kube-apiserverのエンドポイントを設定する。
# --container-runtime：コンテナランタイムとしてcontainerdを使用する。代わりに、dockerも使用できる。

/etc/eks/bootstrap.sh foo-eks-cluster \
  --b64-cluster-ca ***** \
  --apiserver-endpoint https://*****.gr7.ap-northeast-1.eks.amazonaws.com \
  --container-runtime containerd
```

なお、設定可能なすべてのパラメーターは、以下から確認できる。

よく使用するパラメーター配下の通りである。

| パラメーター            | 例                                          | 説明                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--apiserver-endpoint ` |                                             | Amazon EKS Clusterのkube-apiserverのエンドポイントを設定する。                                                                                                                                   |
| `--b64-cluster-ca`      |                                             | kube-apiserverのエンドポイントを設定した場合、HTTPSでリクエストするために、サーバー証明書を設定する。                                                                                            |
| `--container-runtime`   | `containerd`                                | コンテナランタイムの種類を設定する。                                                                                                                                                             |
| `--kubelet-extra-args`  | `--node-labels=nodetype=foo --max-pods=110` | KubeletConfigurationのデフォルト値を上書きする。                                                                                                                                                 |
| `--use-max-pods`        | `false`                                     | kubeletの `--max-pods` オプションを有効化するフラグを設定する。Kubeletが実行可能なPod数を設定する。Kubeletではこのオプションは非推奨になっており、代わりにKubeletConfigurationに渡すようにする。 |

> - https://github.com/awslabs/amazon-eks-ami/blob/v20231106/files/bootstrap.sh#L17-L41
> - https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/

ユーザーデータファイル内で必要なパラメーターの注意点として、各パラメーターはハードコーディングしないようにする。

パラメーターストアにパラメーターを永続化し、ユーザーデータファイル内に出力する。

```bash
#!/bin/bash

# ユーザーデータファイル

set -o xtrace

PARAMETERS=$(aws ssm get-parameters-by-path --with-decryption --path "/eks/foo-eks-cluster")

# Clusterのサーバー証明書、kube-apiserverのエンドポイントの値をパラメーターストアから取得する。
for parameter in $(echo ${PARAMETERS} | jq -r '.Parameters[] | .Name + "=" + .Value'); do
  echo "export ${parameter##*/}"
done >> "${EXPORT_ENVS}"

# 出力する。
source "${EXPORT_ENVS}"

/etc/eks/bootstrap.sh foo-eks-cluster \
  --b64-cluster-ca $B64_CLUSTER_CA \
  --apiserver-endpoint $APISERVER_ENDPOINT \
  --container-runtime containerd
```

> - https://qiita.com/th_/items/8ffb28dd6d27779a6c9d
> - https://garafu.blogspot.com/2020/08/ec2-set-env-from-paramstore.html

#### ▼ Amazon EC2ワーカーNodeのコンテナイメージキャッシュ削除

kubelet は、Node のコンテナイメージのキャッシュを作成する。

コンテナイメージのキャッシュは、kubelet によるガベージコレクションまたは Node の再作成で削除される。

KubeletConfiguration の `--image-gc-high-threshold` オプションで、キャッシュ削除の閾値とするディスク使用率を設定する。

`--image-gc-low-threshold` オプションで、解放しようとするディスク使用率を設定する。

**＊実装例＊**

ディスク使用率が `70`%を超過した場合、ディスク使用率 `50`%分を解放する。

```bash
#!/bin/bash

# ユーザーデータファイル

set -o xtrace

# --image-gc-high-thresholdオプションに値が既に設定されていなければ、設定を挿入する。
if ! grep -q imageGCHighThresholdPercent /etc/kubernetes/kubelet/kubelet-config.json;
then
    sed -i '/"apiVersion*/a \ \ "imageGCHighThresholdPercent": 70,' /etc/kubernetes/kubelet/kubelet-config.json
fi

# --image-gc-low-thresholdオプションに値が既に設定されていなければ、設定を挿入する。
if ! grep -q imageGCLowThresholdPercent /etc/kubernetes/kubelet/kubelet-config.json;
then
    sed -i '/"imageGCHigh*/a \ \ "imageGCLowThresholdPercent": 50,' /etc/kubernetes/kubelet/kubelet-config.json
fi

/etc/eks/bootstrap.sh foo-eks-cluster \
  --b64-cluster-ca $B64_CLUSTER_CA \
  --apiserver-endpoint $APISERVER_ENDPOINT \
  --container-runtime containerd
```

> - https://aws.amazon.com/jp/premiumsupport/knowledge-center/eks-worker-nodes-image-cache/

#### ▼ Amazon EC2ワーカーNodeのGraceful Shutdown

デフォルトでは、Amazon EC2 ワーカーNode は新しい Pod のスケジューリングを禁止した後、Pod の退避を待たずに停止してしまう。

kubelet を使用して Amazon EC2 ワーカーNode の停止を待機し、Pod が終了する (ワーカーNode から退避させる) までの時間を稼ぐ。

ワーカーNode の停止までの待機中に終了できた Pod は、`Failed` ステータスとなる。

KubeletConfiguration の `--shutdown-grace-period` オプション (`shutdownGracePeriod`) で、ワーカーNode の停止を待機する期間を設定する。

また `--shutdown-grace-period-critical-pods` オプション (`shutdownGracePeriodCriticalPods`) で、特に重要な Pod の終了のために待機する時間を設定する。

`InhibitDelayMaxSec` には、`--shutdown-grace-period` オプションと同じ秒数 (単位は不要) を設定する。

注意点として、この時間が長すぎると、ワーカーNode の停止の全体時間が長くなるため、結果的にローリングアップグレードで Node の所要時間も長くなってしまう。

**＊実装例＊**

ワーカーNode の停止を `6` 分だけ待機し、その後に停止を始める。

`6` 分のうち後半 `2` 分を、重要な Pod の停止に割り当てる。

```bash
#!/bin/bash

# ユーザーデータファイル

set -o xtrace

# --shutdown-grace-periodオプションに値が既に設定されていなければ、設定を挿入する。
if ! grep -q shutdownGracePeriod /etc/kubernetes/kubelet/kubelet-config.json;
then
    sed -i '/"apiVersion*/a \ \ "shutdownGracePeriod": "360s",' /etc/kubernetes/kubelet/kubelet-config.json
fi

# --shutdown-grace-period-critical-podsオプションに値が既に設定されていなければ、設定を挿入する。
if ! grep -q shutdownGracePeriodCriticalPods /etc/kubernetes/kubelet/kubelet-config.json;
then
    sed -i '/"shutdownGracePeriod*/a \ \ "shutdownGracePeriodCriticalPods": "120s",' /etc/kubernetes/kubelet/kubelet-config.json
fi

mkdir -p /etc/systemd/logind.conf.d
cat <<EOF > /etc/systemd/logind.conf.d/50-max-delay.conf
[Login]
InhibitDelayMaxSec=360
EOF

sudo systemctl restart systemd-logind

/etc/eks/bootstrap.sh foo-eks-cluster \
  --b64-cluster-ca $B64_CLUSTER_CA \
  --apiserver-endpoint $APISERVER_ENDPOINT \
  --container-runtime containerd
```

> - https://blog.skouf.com/posts/enabling-graceful-node-shutdown-on-eks-in-kubernetes-1-21/
> - https://kubernetes.io/docs/concepts/architecture/nodes/#graceful-node-shutdown

`Failed` ステータスの Pod は、そのままでは削除できない。

そのため、`Failed` ステータスな Pod を自動で削除してくれるツール (例：descheduler) や、以下のような削除コマンドを持つ CronJob を作成するとよい。

```bash
for ns in $(kubectl get namespace -o name | cut -d / -f 2); do
  echo $ns
  kubectl get pod -n $ns -o json \
    | jq -r '.items[] | select(.status.phase == "Failed") | select(.status.reason == "Shutdown" or .status.reason == "NodeShutdown" or .status.reason == "Terminated") | .metadata.name' \
    | xargs --no-run-if-empty --max-args=100 --verbose kubectl delete pod -n $ns
done
```

> - https://github.com/yteraoka/terminated-pod-cleaner/blob/main/chart/templates/cronjob.yaml#L33-L36

<br>

### 組み込みミドルウェア

#### ▼ 時刻調整処理

Node 間の時刻が異なると、時刻をもとにした処理 (例：認証) が失敗する可能性がある。

各 Node には、時刻を正しく調整するミドルウェア (`configure-clocksource`) があらかじめインストールされている。

```bash
################################################################################
### Time #######################################################################
################################################################################

sudo cp -v $WORKING_DIR/shared/configure-clocksource.service /etc/systemd/system/configure-clocksource.service
sudo systemctl enable configure-clocksource
```

```ini
# configure-clocksource
[Unit]
Description=Configure kernel clocksource
# the script needs to use IMDS, so wait for the network to be up
Wants=network-online.target
After=network-online.target

[Service]
ExecStart=/usr/bin/configure-clocksource

[Install]
WantedBy=multi-user.target
```

ちなみに、タイムゾーンは `timedatectl` コマンドで変更できる。

```bash
$ timedatectl set-timezone America/Vancouver
```

> - https://github.com/awslabs/amazon-eks-ami/blob/main/templates/al2023/provisioners/install-worker.sh#L94-L95
> - https://github.com/awslabs/amazon-eks-ami/blob/main/templates/shared/runtime/configure-clocksource.service
> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/change-time-zone-of-instance.html

<br>

## 04-04. セットアップ (コンソールの場合)

### マネージドNodeグループの場合

起動テンプレートを使用し、Amazon EC2 ワーカーNode を作成する。

起動テンプレートのタグ付け機能を使用して Amazon EC2 にタグ付けでき、これは任意である。

### セルフマネージドNodeグループの場合

任意の AWS Auto Scaling グループにて、起動テンプレートを使用して Amazon EC2 ワーカーNode を作成する。

AWS Auto Scaling グループのタグ付け機能を使用して、`kubernetes.io/cluster/<Amazon EKS Cluster名>` タグ (値は `owned`) をつけ、Node グループに明示的に参加させる必要がある。

なお、起動テンプレートも合わせて使用でき、これは任意である。

> - https://docs.aws.amazon.com/eks/latest/userguide/worker.html
> - https://docs.aws.amazon.com/eks/latest/userguide/launch-workers.html

<br>

## 04-04. セットアップ (Terraformの場合)

### マネージドNodeグループの場合

起動テンプレートを使用し、Amazon EC2 ワーカーNode を作成する。

```terraform
# Nodeグループ
resource "aws_eks_node_group" "foo" {

  ...

  # Nodeグループの種類だけ、起動テンプレートを設定する
  launch_template {
    id      = aws_launch_template.foo1.id
    version = "$Latest"
  }

  launch_template {
    id      = aws_launch_template.foo2.id
    version = "$Latest"
  }

  ...
}

# 起動テンプレート
resource "aws_launch_template" "foo" {

  # タグ付けは任意である
  tag_specifications {
    tags = {
      Env  = var.environment
    }
  }

  ...
}

# Nodeグループのタグ
resource "aws_autoscaling_group_tag" "foo" {
  for_each = local.tags

  autoscaling_group_name = aws_eks_node_group.foo.name

  # Nodeグループに設定する全てのタグに対して適用する
  tag {
    key                 = each.key
    value               = each.value
    # 実装時点 (2023/06/06) で、マネージドNodeグループは自身の作成するAWS Auto Scalingグループにタグ付けできない
    # そのままではterraform planのたびに、AWS Auto Scalingグループにタグ付けしようとする差分がでてしまうため、Nodeグループ外からAWS Auto Scalingグループのタグ付けを有効化する
    # @see
    # https://github.com/aws/containers-roadmap/issues/608
    # https://github.com/terraform-aws-modules/terraform-aws-eks/issues/1558#issuecomment-1030633280
    propagate_at_launch = true
  }
}
```

> - https://github.com/terraform-aws-modules/terraform-aws-eks/blob/v19.16.0/modules/eks-managed-node-group/main.tf

### セルフマネージドNodeグループの場合

任意の AutoScaling にて、起動テンプレートを使用して Amazon EC2 ワーカーNode を作成する。

```terraform
resource "aws_autoscaling_group" "foo" {

  ...

  tag {
    key   = "Name"
    value = "foo-instance"
  }

  # AutoScalingのタグに kubernetes.io/cluster/<Amazon EKS Cluster名> をつける必要がある
  tag {
    key   = "kubernetes.io/cluster/<Amazon EKS Cluster名>"
    value = "owned"
  }

  # 起動テンプレートは任意である
  launch_template {
    id      = aws_launch_template.foo.id
    version = "$Latest"
  }

  ...
}
```

> - https://github.com/terraform-aws-modules/terraform-aws-eks/blob/v19.16.0/modules/self-managed-node-group/main.tf

<br>

## 05. on Fargate (FargateワーカーNode)

### on Fargate (FargateワーカーNode) とは

記入中...

<br>

### 監視

#### ▼ データポイント収集

Fargate ワーカーNode 内のメトリクスの元になるデータポイントを収集するうえで、Fargate ワーカーNode は DaemonSet に非対応である。

そのため、データポイント収集コンテナをサイドカーコンテナとして配置する必要がある。

収集ツールとして、OpenTelemetry をサポートしている。

> - https://aws.amazon.com/jp/blogs/news/introducing-amazon-cloudwatch-container-insights-for-amazon-eks-fargate-using-aws-distro-for-opentelemetry/

#### ▼ ログ収集

Fargate ワーカーNode 内のログをフォワーディングするうえで、Fargate は DaemonSet に非対応のため、ログフォワーディングコンテナをサイドカーコンテナとして配置する必要がある。

ロググーティングツールとして、FluentBit をサポートしている。

> - https://docs.aws.amazon.com/eks/latest/userguide/fargate-logging.html

`(1)`

: ログフォワーディングコンテナのための Namespace を作成する。

     名前は、必ず`aws-observability`とする。

> - https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: aws-observability
  labels:
    aws-observability: enabled
```

`(2)`

: `aws-observability` 内で `aws-logging` という名前の ConfigMap を作成する。

     これより、ログフォワーディングコンテナとしてFluentBitコンテナが作成され、PodからAmazon CloudWatch Logsにログを送信できるようになる。

     名前は、必ず`aws-logging`とする。

> - https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/

```yaml
$ kubectl apply -f config-map.yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-logging
  namespace: aws-observability
data:
  output.conf: |
    [OUTPUT]
        Name cloudwatch
        Match *
        region ap-northeast-1
        log_group_name fluent-bit-cloudwatch
        log_stream_prefix from-fluent-bit-
        auto_create_group true
```

`(3)`

: Fargate ワーカーNode に Amazon ECR や CloudWatch への認可スコープを持つポッド実行ロールを付与しておく。

     これにより、KubernetesリソースにAWSへの認可スコープが付与され、ServiceAccountやSecretを作成せずとも、PodがAmazon ECRからコンテナイメージをプルできる様になる。

     一方で、Pod内のコンテナには認可スコープが付与されない。

     そのため、Podが作成された後に必要な認可スコープ (例：コンテナがRDSにリクエストを送信する認可スコープなど) に関しては、ServiceAccountとAWS IAMロールの紐付けが必要である。

> - https://nishipy.com/archives/1122
> - https://toris.io/2021/01/how-kubernetes-pulls-private-container-images-on-aws/
> - https://docs.aws.amazon.com/eks/latest/userguide/fargate-getting-started.html
> - https://kumano-te.com/activities/apply-iam-roles-to-eks-service-accounts
> - https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/

<br>

<br>

## 05-02. セットアップ (コンソールの場合)

### Amazon EC2ワーカーNodeとの比較

Amazon EC2 ワーカーNode と比較して、使用できない機能については、以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/eks/latest/userguide/fargate.html
> - https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/install-ssm-agent-on-amazon-eks-worker-nodes-by-using-kubernetes-daemonset.html

<br>

### FargateワーカーNode

#### ▼ FargateワーカーNodeとは

![eks_on_fargate](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_on_fargate.png)

Fargate 上で稼働する Kubernetes のホストのこと。

Kubernetes のワーカーNode に相当する。

Amazon EC2 ワーカーNode と比べてカスタマイズ性が低く、ワーカーNode 当たりで稼働する Pod 数は AWS が管理する。

一方で、各 Amazon EC2 のハードウェアリソースの消費量をユーザーが管理しなくてもよいため、Kubernetes のホストの管理が楽である。

> - https://www.sunnycloud.jp/column/20210315-01/

#### ▼ FargateワーカーNodeを使用できない場合

以下の場合は、Amazon EC2 ワーカーNode を使用する。

- Fargate ワーカーNode では、DaemonSet が使えない。サイドカーを配置する必要がある。
- Fargate で設定可能な最大スペックを超えたスペックが必要である。
- EmptyDir Volume 以外が必要である。
- Fargate ワーカーNode では、サービスメッシュに AppMesh しか使えない。もし、AppMesh を使いたくない場合は、Amazon EC2 ワーカーNode を使用する。

> - https://qiita.com/mumoshu/items/c9dea2d82a402b4f9c31#managed-node-group%E3%81%A8eks-on-fargate%E3%81%AE%E4%BD%BF%E3%81%84%E5%88%86%E3%81%91

#### ▼ Fargateプロファイル

Fargate を設定する。

| コンポーネント名           | 説明                                                                                                              | 補足                                                                                                                                                                                                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pod実行ロール              | kubeletがAWSリソースにリクエストを送信できるように、Podにロールを設定する。                                       | ・実行ポリシー (`AmazonEKSFargatePodExecutionRolePolicy`) には、Amazon ECRへの認可スコープのみが付与されている。<br>・信頼されたエンティティでは、`eks-fargate-pods.amazonaws.com` を設定する必要がある。<br>https://docs.aws.amazon.com/eks/latest/userguide/pod-execution-role.html |
| サブネット                 | Amazon EKS FargateワーカーNodeが起動するサブネットIDを設定する。                                                  | プライベートサブネットを設定する必要がある。                                                                                                                                                                                                                                          |
| ポッドセレクタ (Namespace) | Amazon EKS FargateワーカーNodeにスケジューリングさせるPodを固定できるように、PodのNamespaceの値を設定する。       | ・`kube-system` や `default` を指定するKubernetesリソースが稼働できるように、ポッドセレクタにこれを追加する必要がある。<br>・IstioやArgoCDを、それ専用のNamespaceで稼働させる場合は、そのNamespaceのためのプロファイルを作成しておく必要がある。                                      |
| ポッドセレクタ (Label)     | Amazon EKS FargateワーカーNodeにスケジューリングさせるPodを固定できるように、Podの任意のlabelキーの値を設定する。 |                                                                                                                                                                                                                                                                                       |

> - https://docs.aws.amazon.com/eks/latest/userguide/fargate-profile.html#fargate-profile-components

<br>

## 05-02. Nodeグループ (on Fargate)

記入中...

<br>

## 06. アップグレード

### アップグレードとは

Amazon EKS Cluster にて、コントロールプレーンとデータプレーンをローリング方式でアップグレードする。

AWS は IaaS のため、AWS AMI を指定すれば、Node の OS のアップグレードも実施してくれる。

執筆時点 (2022/01/28) では、AWS の API を経由して `updateConfig` 値を設定すれば、アップグレード時のサージ数を設定できる。

> - https://docs.aws.amazon.com/eks/latest/userguide/managed-node-update-behavior.html
> - https://docs.aws.amazon.com/eks/latest/APIReference/API_UpdateNodegroupConfig.html#API_UpdateNodegroupConfig_RequestSyntax

<br>

### アップグレードの仕組み

#### ▼ データプレーンの場合

Amazon EKS Cluster のアップグレード時、以下の仕組みでデータプレーンのワーカーNode をローリングアップグレードする。

また、Node グループに紐づく AWS Auto Scaling グループの AZ リバランシングの仕組みによって、既存のワーカーNode と同じ AZ でワーカーNode を再作成する。

`(1)`

: Node グループ単位でローリングアップグレードできるように、Amazon EKS Cluster のワーカーNode 数の設定 (Node 希望数、Node 最大数) を自動的に増加させる。

`(2)`

: 旧ワーカーNode を残して、新しい AWS AMI を使用したワーカーNode を作成する。

     旧ワーカーNodeが稼働しているAZで新ワーカーNodeを作成する。

     旧ワーカーNodeを残せるのは、あらかじめAmazon EKS ClusterのワーカーNode数の設定 (Node希望数、Node最大数) を増加させているためである。

`(3)`

: 各 AZ で新ワーカーNode を正しく作成できることを検証する。

`(4)`

: AZ リバランシングが成功すれば、旧ワーカーNode で Drain が開始され、Pod のスケジューリングが無効化される。

`(5)`

: 新ワーカーNode 上で Pod をスケジューリングさせ直し、旧ワーカーNode を削除する。

`(6)`

: 最終的に、アップグレード前のワーカーNode 数 (Node 希望数) に戻る。

> - https://docs.aws.amazon.com/eks/latest/userguide/managed-node-update-behavior.html
> - https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-benefits.html#AutoScalingBehavior.InstanceUsage
> - https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-instance-termination.html#common-scenarios-termination-rebalancing

<br>

### 手順

#### ▼ インプレース

Amazon EKS Cluster はおおよそ以下の方法でインプレースアップグレードする。

`(1)`

: コントロールプレーン Node をアップグレードする。

`(2)`

: ワーカーNode をアップグレードする。

     コントロールプレーン上のkube-apiserverのバージョンに応じた新しいAWS AMIを使用して、ワーカーNodeを再作成する。

`(3)`

: ワーカーNode 上の Amazon EKS アドオン (例：AWS CoreDNS、AWS kube-proxy、Amazon VPC CNI など) をアップグレードする。

> - https://inside.dmm.com/entry/2022/08/26/eks_is_hard

#### ▼ ブルー/グリーン

Amazon EKS Cluster はおおよそ以下の方法でブルー/グリーンアップグレードする。

`(1)`

: 新しいバージョン Amazon EKS クラスターを構築する。またマイクロサービスなどをデプロイする。

`(2)`

: このままだと、新旧の EKS クラスターでバッチサービスの実行が衝突する。

    そこで、`kubectl patch cronjobs foo-batch -p '{"spec" : {"suspend" : true }}'`を実行し、旧EKSクラスターのバッチサービスを止める。

`(3)`

: 新しい Amazon EKS クラスターの Ingress Controller や Ingress Gateway の Pod に対して、ポートフォワーディングを実行し、アプリケーションを動作確認する。

`(4)`

: 既存の AWS ALB ターゲットグループにグリーン環境の Amazon EKS クラスターの Node を登録する。

`(5)`

: 既存の AWS ALB ターゲットグループからブルー環境の Amazon EKS クラスターの Node を解除する。

`(6)`

: ワーカーNode 上の Amazon EKS アドオン (例：AWS CoreDNS、AWS kube-proxy、Amazon VPC CNI など) をアップグレードする。

<br>
