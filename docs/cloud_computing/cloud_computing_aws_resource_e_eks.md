---
title: 【IT技術の知見】EKS＠Eで始まるAWSリソース
description: EKS＠Eで始まるAWSリソースの知見を記録しています。
---

# EKS＠`E`で始まるAWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. EKS：Elastic Kubernetes Service

### コントロールプレーン

#### ▼ コントロールプレーンとは

コンテナオーケストレーションを実行する環境を提供する。

データプレーンのVPC外に存在している。

> ↪️：https://aws.github.io/aws-eks-best-practices/reliability/docs/controlplane/

#### ▼ 仕組み

EKSのコントロールプレーンは、開発者や他のAWSリソースからのアクセスを待ち受けるAPI、アクセスをAPIにルーティングするNLB、データプレーンを管理するコンポーネント、からなる。

![eks_control-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_control-plane.png)

> ↪️：https://www.sunnycloud.jp/column/20210315-01/

<br>

### データプレーン

#### ▼ データプレーンとは

複数のホスト (EC2、Fargate) のOS上でコンテナオーケストレーションを実行する。

『`on-EC2`』『`on-Fargate`』という呼び方は、データプレーンがEKSの実行環境 (`on environment`) の意味合いを持つからである。

<br>

## 01-02. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

| 設定項目                         | 説明                                                                                   | 補足                                                                                                                                                                                                                                                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 名前                             | クラスターの名前を設定する。                                                           |                                                                                                                                                                                                                                                                                                                       |
| Kubernetesバージョン             | EKS上で稼働するKubernetesのバージョンを設定する。                                      | EKSが対応できるKubernetesのバージョンは以下を参考にせよ。<br>↪️：https://docs.aws.amazon.com/eks/latest/userguide/platform-versions.html                                                                                                                                                                              |
| クラスターサービスロール         | EKS Clusterのサービスリンクロールを設定する。                                          | ↪️：https://docs.aws.amazon.com/eks/latest/userguide/service_IAM_role.html                                                                                                                                                                                                                                            |
| シークレット                     | Secretに保持するデータをKMSの暗号化キーで暗号化するか否かを設定する。                  |                                                                                                                                                                                                                                                                                                                       |
| VPC、サブネット                  | ENIを配置するサブネットを設定する。                                                    | 複数のAZにまたがっている必要がある。                                                                                                                                                                                                                                                                                  |
| クラスターセキュリティグループ   | EKS Clusterのセキュリティグループを設定する。                                          | インバウンドとアウトバウンドの両方のルールで、全てのIPアドレスを許可する必要がある。このセキュリティグループは、追加のセキュリティグループとして設定され、別途、AWSによって`eks-cluster-sg-<EKS Cluster名>`というセキュリティグループも自動設定される。<br>↪️：https://yuutookun.hatenablog.com/entry/fargate_for_eks |
| クラスターIPアドレスファミリー   | PodとServiceに割り当てるClusterIPのIPアドレスタイプ (IPv4、IPv6) を設定する。          |                                                                                                                                                                                                                                                                                                                       |
| CIDRブロック                     | ClusterIP Serviceに割り当てるIPアドレスのCIDRブロックを設定する。                      |                                                                                                                                                                                                                                                                                                                       |
| クラスターエンドポイントアクセス | kube-apiserverのアクセス制限を設定する。                                               |                                                                                                                                                                                                                                                                                                                       |
| ネットワークアドオン             | ネットワークに関するAWS EKSアドオンを設定する。                                        | 執筆時点 (2023/02/05) では、aws-eks-kube-proxyアドオン、aws-eks-corednsアドオン、aws-eks-vpc-cniアドオン、を使用できる。                                                                                                                                                                                              |
| コントロールプレーンのログ       | コントロールプレーンコンポーネントのログをCloudWatchログに出力するかどうかを設定する。 | 執筆時点 (2023/02/05) では、kube-apiserver (処理ログと監査ログの両方) 、aws-iam-authenticator-server (処理ログ) 、kube-controller-manager (処理ログ) 、cloud-controller-manager (処理ログ) 、kube-scheduler (処理ログ) 、のログを出力できる。                                                                         |

<br>

### Terraformの公式モジュールの場合

ここでは、Terraformの公式モジュールを使用する。

```terraform
module "eks" {
  source = "terraform-aws-modules/eks/aws"

  version = "<モジュールのバージョン>"

  cluster_name    = foo-eks-cluster
  cluster_version = "<Kubernetesのバージョン>"

  # kube-apiserverをプライベートアクセスにするか否か
  cluster_endpoint_private_access = true

  # kube-apiserverにパブリックアクセスできるか否か
  cluster_endpoint_public_access = false

  # EKS Clusterのkube-apiserverにアクセスできるCIDR
  cluster_endpoint_public_access_cidrs = ["*.*.*.*/32", "*.*.*.*/32", "*.*.*.*/32"]

  # CloudWatchログに送信するログの種類
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

  # VPCのID
  vpc_id = "vpc-*****"

  # サブネットのID
  subnets = ["subnet-*****", "subnet-*****", "subnet-*****"]

  # AWS EKSアドオン
  cluster_addons = {

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

  # AWS EKSマネージドグループ
  eks_managed_node_groups = {
    node_group_name = "foo-group"
    instance_types  = ["m5.large"]
    min_size        = 3
    max_size        = 4
    desired_size    = 5
  }
}
```

> ↪️：https://registry.terraform.io/modules/terraform-aws-modules/eks/aws/latest#usage

<br>

### EKS Clusterの認証情報の追加

`kubectl`コマンドでEKS Clusterを操作するためには、`~/.kube/config`ファイルへClusterの認証情報を登録する必要がある。

`【１】`

: AWS CLIにクレデンシャル情報を設定する。

```bash
$ aws configure
```

`【２】`

: EKS Clusterの名前を指定して、Clusterの認証情報を登録する。

```bash
$ aws eks update-kubeconfig --region ap-northeast-1 --name foo-eks-cluster
```

`【３】`

: `kubectl`コマンドの向き先を、EKS Clusterのkube-apiserverに変更する。

```bash
$ kubectl config use-context <ClusterのARN>
```

`【４】`

: `kubectl`コマンドの接続を確認する。

```bash
$ kubectl get pod
```

> ↪️：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/getting-started-console.html
> - https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html#deploy-dashboard

<br>

## 02. コントロールプレーンのコンポーネント

### 対応関係

| コントロールプレーン上のAWSリソース            | Kubernetesリソース       | 補足                                                                        |
| ---------------------------------------------- | ------------------------ | --------------------------------------------------------------------------- |
| EKSコントロールプレーン                        | コントロールプレーンNode | ↪️：https://docs.aws.amazon.com/eks/latest/userguide/platform-versions.html |
| kube-apiserver                                 | kube-apiserver           |                                                                             |
| kube-apiserverのロードバランサー (例：HAProxy) | NLB                      |                                                                             |

<br>

### kube-apiserver

#### ▼ Kubernetes RBACとの連携

![eks_auth_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_auth_architecture.png)

KubernetesのRBACと連携することにより、`kubectl`クライアントの認可スコープを制御する。

Kubernetesリソースの認可スコープは、IRSAで制御する。

`【１】`

: あらかじめ、クライアント (`kubectl`クライアント、Kubernetesリソース) に紐づくIAMユーザーを作成しておく。

`【２】`

: IAMユーザーがkube-apiserverのURLにリクエストを送信する。

     kube-apiserverは、aws-iam-authenticator-serverにWebhookを送信する。

     admission-controllersアドオンのWebhookではないことに注意する。

`【３】`

: コントロールプレーンNode上のaws-iam-authenticator-serverは、IAM APIを使用してIAMユーザーを認証する。

`【４】`

: もし認証に成功していた場合に、aws-iam-authenticator-serverは、ConfigMap (aws-auth) を確認する。

     このConfigMapには、そのIAMユーザーに紐づくUserAccount / ServiceAccount / Group、RoleBinding / ClusterRoleBinding、が定義されている。

     この時、`kubectl`クライアントの場合はUserAccount、Kubernetesリソースの場合はServiceAccount、を取得する。

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
    - rolearn: arn:aws:iam::<AWSアカウントID>:role/foo-role # IAMロール名
      username: hiroki-it # IAMユーザー名
      groups:
        - system:masters # ClusterRoleBindingに定義されたGroup名
    - rolearn: arn:aws:iam::<AWSアカウントID>:role/bar-role # ワーカーNodeに紐付けたロール名
      username: system:node:{{EC2PrivateDNSName}} # ワーカーNodeの識別子
      groups:
        - system:bootstrappers
        - system:nodes
```

`【５】`

: aws-iam-authenticator-serverは、UserAccount / ServiceAccount / Group、RoleBindingやClusterRoleBinding、の情報を含むレスポンスをkube-apiserverに返信する。

`【６】`

: あとは、Kubernetesの標準の認可の仕組みである。

     kube-apiserverは、UserAccount / ServiceAccount / Groupに紐づくRoleやClusterRoleを、RoleBindingやClusterRoleBindingを介して取得する。

     IAMユーザーは、Kubernetesリソースを操作できる。

> ↪️：
>
> - https://aws.amazon.com/blogs/containers/kubernetes-rbac-and-iam-integration-in-amazon-eks-using-a-java-based-kubernetes-operator/
> - https://dzone.com/articles/amazon-eks-authentication-amp-authorization-proces
> - https://katainaka0503.hatenablog.com/entry/2019/12/07/091737
> - https://www.karakaram.com/eks-system-masters-group/
> - https://zenn.dev/nameless_gyoza/articles/eks-authentication-authorization-20210211#1.-%E5%A4%96%E9%83%A8%E3%81%8B%E3%82%89eks%E3%81%AB%E5%AF%BE%E3%81%97%E3%81%A6%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%99%E3%82%8B%E5%A0%B4%E5%90%88

#### ▼ パブリックアクセス/プライベートアクセス

kube-apiserverのインターネットへの公開範囲を設定できる。

プライベートアクセスの場合、VPC内部からのみアクセスできるように制限でき、送信元IPアドレスを指定してアクセスを許可できる。

> ↪️：https://dev.classmethod.jp/articles/eks-public-endpoint-access-restriction/

<br>

## 03. データプレーンのコンポーネント

### 対応関係

![eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks.png)

| データプレーン上のAWSリソース        | Kubernetesリソース          | 補足                                                                                                                                                                                                                                                                                                 |
| ------------------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FargateワーカーNode、EC2ワーカーNode | ワーカーNode                | ↪️：https://docs.aws.amazon.com/eks/latest/userguide/eks-compute.html                                                                                                                                                                                                                                |
| EKS Cluster                          | Cluster                     | ↪️：https://docs.aws.amazon.com/eks/latest/userguide/clusters.html                                                                                                                                                                                                                                   |
| AWS ALB                              | Ingress                     | IngressはAWS ALBに置き換える必要がある。AWS Load Balancerコントローラーを作成すると、AWS ALBは自動的に作成される。<br>↪️：<br>・https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html <br>・https://blog.linkode.co.jp/entry/2020/06/26/095917#AWS-ALB-Ingress-Controller-for-Kubernetes |
| AWS Load Balancerコントローラー      | Ingressコントローラー       | AWS ALBを自動的に作成する。↪️：https://aws.amazon.com/jp/blogs/news/using-alb-ingress-controller-with-amazon-eks-on-fargate/                                                                                                                                                                         |
| API Gateway + NLB                    |                             | ↪️：https://aws.amazon.com/jp/blogs/news/api-gateway-as-an-ingress-controller-for-eks/                                                                                                                                                                                                               |
| EBS、EFS                             | PersistentVolume            | ↪️：https://docs.aws.amazon.com/eks/latest/userguide/storage.html                                                                                                                                                                                                                                    |
| Secrets Manager                      | Secret                      | ↪️：https://docs.aws.amazon.com/eks/latest/userguide/manage-secrets.html                                                                                                                                                                                                                             |
| IAMユーザー                          | ServiceAccount、UserAccount | ↪️：https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html                                                                                                                                                                                                                              |
| IAMロール                            | Role、ClusterRole           | ↪️：https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html                                                                                                                                                                                                                              |

> ↪️：https://zenn.dev/yoshinori_satoh/articles/2021-02-13-eks-ecs-compare

<br>

### EKS Cluster

#### ▼ EKS Clusterとは

FargateワーカーNodeやEC2ワーカーNodeの管理グループ単位のこと。

KubernetesのClusterに相当する。

> ↪️：https://www.sunnycloud.jp/column/20210315-01/

<br>

### マルチワーカーNode

#### ▼ マルチワーカーNodeとは

マルチワーカーNodeを作成する場合、AZごとにNodeを作成する。

![eks_multi-node](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_multi-node.png)

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/eks-networking.html

#### ▼ ワーカーNode間のファイル共有

EFSを使用して、ワーカーNode間でファイルを共有する。

PodのファイルはワーカーNodeにマウントされるため、異なるワーカーNode上のPod間でファイルを共有したい場合 (例：PrometheusのローカルストレージをPod間で共有したい) に役立つ。

ただしできるだけ、ワーカーNodeをステートフルではなくステートレスにする必要があり、PodのファイルはワーカーNodeの外で管理する必要がある。

> ↪️：https://blog.linkode.co.jp/entry/2020/07/01/142155

<br>

### IRSA：IAM Roles for Service Accounts

#### ▼ IRSAとは

![eks_oidc.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_oidc.png)

特にKubernetesリソースの認可スコープを制御する仕組みのこと。

`kubectl`クライアントの認可スコープは、RBACで制御する。

EKSをSSOのIDプロバイダーとして使用することにより、IAMの認証フェーズをEKSに委譲する。

#### ▼ セットアップ

ここでは、SSOの種類でOIDCを選ぶとする。

`【１】`

: SSOのIDプロバイダーのタイプは、OIDCとする。

     『EKS ClusterのOIDCプロバイダーURL』『OIDCプロバイダーのSSL証明書を署名する中間CA認証局 (例：CertificateManagerなど) のサムプリント』『IDプロバイダーによるトークンの発行対象 (`sts.amazonaws.com`)』を使用して、OIDCプロバイダーを作成する。

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
          readOnly: true
        # OIDCのプロバイダーによるトークンをコンテナにマウントする
        - mountPath: /var/run/secrets/eks.amazonaws.com/serviceaccount
          name: aws-iam-token
          readOnly: true
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
    # AWS EKSを使用している場合、AWS-APIへのリクエストに必要なトークンも設定される
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

> ↪️：
>
> - https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/enable-iam-roles-for-service-accounts.html
> - https://zenn.dev/nameless_gyoza/articles/eks-authentication-authorization-20210211#%E7%99%BB%E9%8C%B2%E6%89%8B%E9%A0%86-1
> - https://onsd.hatenablog.com/entry/2019/09/21/015522
> - https://github.com/terraform-aws-modules/terraform-aws-eks/blob/master/main.tf#L223-L242
> - https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/id_roles_providers_create_oidc_verify-thumbprint.html

`【２】`

: IRSAで使用するIAMロールの信頼されたエンティティに、EKS ClusterのOIDCプロバイダーURLやユーザー名 (`system:serviceaccount:<Namespac名>:<ServiceAccount名>`) を設定する。

```yaml
{"Version": "2012-10-17", "Statement": [
      {
        "Sid": "",
        "Effect": "Allow",
        "Principal":
          {
            "Federated": "arn:aws:iam::<AWSアカウントID>:oidc-provider/<EKS ClusterのOIDCプロバイダーURL>",
          },
        # AssumeRoleWithWebIdentityを使用する
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
            # 完全一致
            "StringEquals":
              {
                "<EKS ClusterのOIDCプロバイダーURL>:sub":
                  ["system:serviceaccount:<Namespac名>:<ServiceAccount名>"],
              },
          },
      },
    ]}
```

`【３】`

: ServiceAccountの`.metadata.annotations.eks.amazonaws.com/role-arn`キーでIAMロールのARNを設定することにより、EKSで認証済みのServiceAccountにIAMロールを紐付けることができるようになる。

     `automountServiceAccountToken`キーが有効化されていることを確認する。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    eks.amazonaws.com/role-arn: <IAMロールのARN>
  name: <信頼されたエンティティで指定したユーザー名にあるServiceAccount名>
  namespace: <信頼されたエンティティで指定したユーザー名にあるNamespace名>
automountServiceAccountToken: true
```

`【４】`

: Podで、ServiceAccount名を設定する。

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

もし`.metadata.annotations.eks.amazonaws.com/role-arn`キーを使用しない場合、KubernetesリソースからAWSリソースへのアクセスがあった時は、EC2ワーカーNodeやFargateワーカーNodeのIAMロールが使用される。

IRSAが登場するまでは、EKS上でのワーカーNode (例：EC2、Fargate) にしかIAMロールを紐付けることができず、KubernetesリソースにIAMロールを直接的に紐付けることはできなかった。

ServiceAccountのトークンは、コンテナにファイルとしてマウントされている。

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

> ↪️：
>
> - https://aws.amazon.com/jp/blogs/news/diving-into-iam-roles-for-service-accounts/
> - https://www.bigtreetc.com/column/eks-irsa/
> - https://katainaka0503.hatenablog.com/entry/2019/12/07/091737#ServiceAccount%E3%81%AEIAM-%E3%83%AD%E3%83%BC%E3%83%ABIRSA
> - https://aws.amazon.com/blogs/opensource/introducing-fine-grained-iam-roles-service-accounts/
> - https://zenn.dev/nameless_gyoza/articles/eks-authentication-authorization-20210211#2.-eks%E3%81%8B%E3%82%89aws%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%B8%E3%81%A8%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%99%E3%82%8B%E5%A0%B4%E5%90%88

<br>

### デバッグ

#### ▼ ダッシュボード

`【１】`

: EKS Clusterの名前を指定して、Clusterの認証情報を登録する。

```bash
$ aws eks update-kubeconfig --region ap-northeast-1 --name foo-eks-cluster
```

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/getting-started-console.html

`【２】`

: `kubectl`コマンドの向き先を、EKS Clusterのkube-apiserverに変更する。

```bash
$ kubectl config use-context <ClusterのARN>
```

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html#deploy-dashboard

`【３】`

: マニフェストを使用して、ダッシュボードのKubernetesリソースをEKSにデプロイする。

```bash
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.5/aio/deploy/recommended.yaml
```

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html#eks-admin-service-account

`【４】`

: ダッシュボードに安全に接続するために、ServiceAccountをEKSにデプロイする

```bash
$ kubectl apply -f service-account.yml
```

`【５】`

: トークン文字列を取得する。

```bash
$ kubectl -n kube-system describe secret $(kubectl get secret -n kube-system | grep eks-admin | awk '{print $1}')
```

`【６】`

: ローカルマシンからEKSにポートフォワーディングを実行する。

```bash
$ kubectl proxy
```

`【７】`

: ダッシュボードに接続する。

```yaml
GET http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#!/login HTTP/1.1
```

#### ▼ ワーカーNodeへの接続

セッションマネージャーを使用して、ワーカーNodeのEC2やFargateに接続できる。

<br>

## 03-02. ネットワーク

### VPC、サブネット

EKSデータプレーンはプライベートサブネットで稼働させ、パブリックネットワーク上のALBからインバウンド通信を受信すると良い。

この時、パブリックネットワークにあるレジストリから、IstioやArgoCDのコンテナイメージをプルできるように、EKS FargateワーカーNodeとInternet Gateway間のネットワークを繋げる必要がある。

そのために、パブリックサブネットにNAT Gatewayを置く。

> ↪️：https://aws.amazon.com/jp/blogs/news/de-mystifying-cluster-networking-for-amazon-eks-worker-nodes/

<br>

### プライベートサブネット内のデータプレーンへのインバウンド通信

#### ▼ Podへのインバウンド通信

Podをプライベートサブネットに配置した場合に、パブリックネットワークからのインバウンド通信をAWS Load Balancerコントローラーで受信し、AWS ALBを使用してPodにルーティングする。

![eks_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_architecture.png)

> ↪️：https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/deploy-a-grpc-based-application-on-an-amazon-eks-cluster-and-access-it-with-an-application-load-balancer.html

<br>

### コントロールプレーンへのインバウンド通信

#### ▼ アクセス制限

コントロールプレーンでは、`kubectl`コマンドのエンドポイントとしてNLBが配置されている。

このNLBを介して、コントロールプレーン内のkube-apiserverにリクエストを送信できる。

VPC外からNLBへの`443`番ポートに対するネットワークからのアクセスはデフォルトでは許可されているが、拒否するように設定できる。

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html

#### ▼ パブリックのみ

基本的には、全てのIPアドレスからkube-apiserverにリクエストを送信できる。

#### ▼ パブリックとプライベートの場合

パブリックとプライベートを許可する場合、指定したCIDRブロックに含まれるIPアドレスからのみ、kube-apiserverにリクエストを送信できる。

また、Cluster内からkube-apiserverへのアクセスには、VPCエンドポイントが必要である。

#### ▼ プライベートのみ

プライベートのみを許可する場合、このNLBは閉じられ、VPC内からしかkube-apiserverにリクエストを送信できなくなる。

この状態で、`kubectl`コマンドでkube-apiserverにアクセスできるようにする方法としては、以下のパターンがある。

| 接続元パターン               | 接続方法パターン            |
| ---------------------------- | --------------------------- |
| ローカルマシン               | セッションマネージャー      |
| VPC内の踏み台EC2インスタンス | セッションマネージャー、SSH |
| VPC内のCloud9                | セッションマネージャー、SSH |

> ↪️：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html#private-access
> - https://note.com/tyrwzl/n/nf28cd4372b18
> - https://zenn.dev/yoshinori_satoh/articles/eks-kubectl-instance

<br>

## 04. on-EC2 (EC2ワーカーNode)

### EC2ワーカーNode

#### ▼ EC2ワーカーNodeとは

EC2で稼働するKubernetesのホストのこと。

Fargateと比べてカスタマイズ性が高く、ワーカーNode当たりで稼働するPod数に重み付けを設定できる。

一方で、各EC2のハードウェアリソースの消費量をユーザーが管理しなければならないため、Kubernetesのホストの管理が大変である。

![eks_on_ec2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_on_ec2.png)

> ↪️：https://www.sunnycloud.jp/column/20210315-01/

<br>

## 04-02. Nodeグループ (on-EC2)

### マネージド

#### ▼ マネージドNodeグループ

Nodeグループ内の各EC2ワーカーNodeと、Nodeグループに紐づくオートスケーリングの設定を、自動的にセットアップする。

オートスケーリングは、EC2ワーカーNodeが配置される全てのプライベートサブネットに適用される。

オートスケーリングの機能を使用すれば、EC2ワーカーNodeの自動的な起動/停止を設定できる。

#### ▼ タグ付けを使用した

同じNodeグループのEC2ワーカーNodeの定期アクションを設定する。

EKSのテスト環境の請求料金を節約するために、昼間に通常の個数にスケールアウトし、夜間に`0`個にスケールインするようにすれば、ワーカーNodeを夜間だけ停止させられる。

> ↪️：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/managed-node-groups.html
> - https://blog.framinal.life/entry/2020/07/19/044328#%E3%83%9E%E3%83%8D%E3%83%BC%E3%82%B8%E3%83%89%E5%9E%8B%E3%83%8E%E3%83%BC%E3%83%89%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97

<br>

### セルフマネージド

#### ▼ セルフマネージドNodeグループ

Nodeグループ内の各EC2ワーカーNodeと、Nodeグループごとのオートスケーリングの設定を、手動でセットアップする。

オートスケーリングの機能を使用すれば、EC2ワーカーNodeの自動的な起動/停止を設定できる。

<br>

### EC2ワーカーNodeの最適化AMI

#### ▼ EC2ワーカーNodeの最適化AMIとは

任意のEC2ワーカーNodeを使用できるが、AWSが用意している最適化AMIを選んだ方が良い。

このAMIには、EC2がEKSと連携するために必要なソフトウェアがプリインストールされており、EC2ワーカーNodeをセットアップする手間が省ける。

必ずしも、全てのEC2ワーカーNodeを同じAMIで構築する必要はない。

EC2ワーカーNodeを種類ごとに異なるAMIで作成し、特定のアプリを含むPodは特定のEC2ワーカーNodeにスケジューリングする (例：計算処理系アプリはEKS最適化高速AMIのEC2ワーカーNode上で動かす) といった方法でもよい。

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/eks-optimized-ami.html

#### ▼ EKS 最適化 Amazon Linux

EKSのための標準的なEC2インスタンスを作成できる。最も推奨である。

`aws ssm get-parameter`コマンドを使用すると、公式が提供するマシンイメージのIDを確認できる。

```bash
$ aws ssm get-parameter \
    --name /aws/service/eks/optimized-ami/<バージョン>/amazon-linux-2/recommended/image_id \
    --region ap-northeast-1 \
    --query "Parameter.Value" \
    --output text
```

> ↪️：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/eks-optimized-ami.html
> - https://docs.aws.amazon.com/eks/latest/userguide/retrieve-ami-id.html

#### ▼ EKS 最適化高速 Amazon Linux

GPUが搭載されたEC2インスタンスやAmazon EC2 Inf1インスタンスを作成できる。

GPUが必要なアプリケーションの含むPod (計算処理系、機械学習系のアプリケーション) と相性が良い。

#### ▼ EKS 最適化 ARM Amazon Linux

ARMベースのプロセッサーが搭載されたEC2インスタンスを作成できる。

#### ▼ EKS 最適化 Bottlerocket AMI

コンテナに特化したEC2インスタンスを作成できる。

```bash
$ aws ssm get-parameter \
    --name /aws/service/bottlerocket/aws-k8s-<バージョン>/x86_64/latest/image_id \
    --region ap-northeast-1 \
    --query "Parameter.Value" \
    --output text
```

> ↪️：
>
> - https://dev.classmethod.jp/articles/bottlerocket/#toc-1
> - https://docs.aws.amazon.com/eks/latest/userguide/eks-optimized-ami-bottlerocket.html

<br>

### EC2ワーカーNodeのカスタムAMI

#### ▼ EC2ワーカーNodeのカスタムAMIとは

EC2ワーカーNodeの最適化AMIではないAMIのこと。

EC2ワーカーNodeのAMIにカスタムAMIを使用する場合、EC2ワーカーNode起動時のユーザーデータ内で、`bootstrap.sh`ファイルに決められたパラメーターを渡す必要がある。

注意点として、最適化AMIにはデフォルトでこれらのパラメーターが設定されているため、設定は不要である。

> ↪️：https://aws.amazon.com/jp/premiumsupport/knowledge-center/eks-worker-nodes-cluster/

```bash
#!/bin/bash

set -o xtrace

# 主要なパラメーターは以下の通り。
# その他のパラメーター：https://github.com/awslabs/amazon-eks-ami/blob/584f9a56c76fc9e7e8632f6ea45e29d45f2eab63/files/bootstrap.sh#L14-L35
#
# --b64-cluster-ca：kube-apiserverのSSL証明書の値を設定する。
# --apiserver-endpoint：kube-apiserverのエンドポイントを設定する。
# --container-runtime：コンテナランタイムとしてcontainerdを使用する。代わりとして、dockerも使用できる。

/etc/eks/bootstrap.sh foo-eks-cluster \
  --b64-cluster-ca ***** \
  --apiserver-endpoint https://*****.gr7.ap-northeast-1.eks.amazonaws.com \
  --container-runtime containerd
```

ユーザーデータ内で必要なパラメーターの注意点として、各パラメーターはハードコーディングしないようにする。

パラメーターストアにパラメーターを永続化し、ユーザーデータ内に出力するようにする。

```bash
#!/bin/bash

set -o xtrace

PARAMETERS=$(aws ssm get-parameters-by-path --with-decryption --path "/eks/foo-eks-cluster")

# ClusterのSSL証明書、kube-apiserverのエンドポイントの値をパラメーターストアから取得する。
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

> ↪️：
>
> - https://qiita.com/th_/items/8ffb28dd6d27779a6c9d
> - https://garafu.blogspot.com/2020/08/ec2-set-env-from-paramstore.html

#### ▼ EC2ワーカーNodeのイメージキャッシュ削除

kubeletのガベージコレクションを使用して、イメージキャッシュを削除する。

`--image-gc-high-threshold`オプションで、キャッシュ削除の閾値とするディスク使用率を設定する。

`--image-gc-low-threshold`オプションで、解放しようとするディスク使用率を設定する。

**＊実装例＊**

ディスク使用率が`70`%を超過した場合に、ディスク使用率`50`%分を解放する。

```bash
#!/bin/bash

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

/etc/eks/bootstrap.sh your-cluster-name
```

> ↪️：https://aws.amazon.com/jp/premiumsupport/knowledge-center/eks-worker-nodes-image-cache/

#### ▼ 安全なEC2ワーカーNodeシャットダウン

kubeletを使用してワーカーNodeの停止を待機し、Podが終了する (ワーカーNodeを退避する) までの時間を稼ぐ。

待機中に終了できたPodは`Failed`ステータスとなる。

`--shutdown-grace-period`オプションで、ワーカーNodeの停止を待機する期間を設定する。

`--shutdown-grace-period-critical-pods`オプションで、特に重要なPodの終了のために待機する時間を設定する。

**＊実装例＊**

ワーカーNodeの停止を`6`分だけ待機し、その後に停止を始める。

`6`分のうち後半`2`分を重要なPodのために停止に割り当てる。

```bash
#!/bin/bash

set -o xtrace

# --shutdown-grace-periodオプションに値が既に設定されていなければ、設定を挿入する。
if ! grep -q shutdownGracePeriod /etc/kubernetes/kubelet/kubelet-config.json;
then
    sed -i '/"apiVersion*/a \ \ "shutdownGracePeriod": "6m",' /etc/kubernetes/kubelet/kubelet-config.json
fi

# --shutdown-grace-period-critical-podsオプションに値が既に設定されていなければ、設定を挿入する。
if ! grep -q shutdownGracePeriodCriticalPods /etc/kubernetes/kubelet/kubelet-config.json;
then
    sed -i '/"shutdownGracePeriod*/a \ \ "shutdownGracePeriodCriticalPods": "2m",' /etc/kubernetes/kubelet/kubelet-config.json
fi

mkdir -p /etc/systemd/logind.conf.d
cat << EOF > /etc/systemd/logind.conf.d/50-max-delay.conf
[Login]
InhibitDelayMaxSec=360
EOF

sudo systemctl restart systemd-logind
```

> ↪️：
>
> - https://blog.skouf.com/posts/enabling-graceful-node-shutdown-on-eks-in-kubernetes-1-21/
> - https://kubernetes.io/docs/concepts/architecture/nodes/#graceful-node-shutdown

`Failed`ステータスのPodはそのままでは削除できないため、以下のようなスクリプトを実行できるCronJobを作成するとよい。

```bash
for ns in $(kubectl get namespace -o name | cut -d / -f 2); do
  echo $ns
  kubectl get pod -n $ns -o json \
    | jq -r '.items[] | select(.status.phase == "Failed") | select(.status.reason == "Shutdown" or .status.reason == "NodeShutdown" or .status.reason == "Terminated") | .metadata.name' \
    | xargs --no-run-if-empty --max-args=100 --verbose kubectl delete pod -n $ns
done
```

> ↪️：https://github.com/yteraoka/terminated-pod-cleaner/blob/main/chart/templates/cronjob.yaml#L33-L36

<br>

### EC2へのタグ付けの例

#### ▼ マネージドNodeグループ

| タグ   | 値                    | 説明                                                                                                                                                                                                                               |
| ------ | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Name` | EC2ワーカーNodeの名前 | Nodeグループで指定する起動テンプレートのリソースタグに、`Name`タグを設定しておく。起動するEC2ワーカーNodeにEC2インスタンスの名前は`Name`タグで決まる仕組みのため、起動テンプレートによってワーカーNode名を設定させることができる。 |

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/launch-templates.html

#### ▼ セルフマネージドNodeグループ

| タグ                                    | 値                    | 説明                                                                                                                                         |
| --------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `Name`                                  | EC2ワーカーNodeの名前 | EC2インスタンスの名前は`Name`タグで決まる仕組みのため、Nodeグループに参加させるEC2ワーカーNodeの`Name`タグに、ワーカーNode名を設定しておく。 |
| `kubernetes.io/cluster/<EKS Cluster名>` | `owned`               | セルフマネージド型のEC2ワーカーNodeを使用する場合、ユーザーが作成したEC2インスタンスをNodeグループに参加させるために、必要である。           |

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/worker.html

<br>

### パブリックサブネット内のデータプレーンからのアウトバウンド通信

Podをプライベートサブネットに配置した場合に、パブリックネットワークやVPC外にあるAWSリソース (ECR、S3、Systems Manager、CloudWatch、DynamoDB、など) に対してアウトバウンド通信を送信するために特に必要なものは無い。

この時、`POD_SECURITY_GROUP_ENFORCING_MODE=standard`に設定されたaws-eks-vpc-cniアドオンはSNAT処理を実行し、Podのアウトバウンド通信の送信元IPアドレスをEC2ワーカーNodeのプライマリーENI (`eth0`) のIPアドレスに変換する。

> ↪️：
>
> - https://note.com/tyrwzl/n/n715a8ef3c28a
> - https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/security-groups-for-pods.html

<br>

### プライベートサブネット内のデータプレーンからのアウトバウンド通信

#### ▼ 宛先情報の管理方法

アウトバウンド通信の宛先情報は、Secretで管理し、Podにマウントするようにする。

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

#### ▼ VPC外の他のAWSリソースへのアウトバウンド通信

Podをプライベートサブネットに配置した場合に、パブリックネットワークやVPC外にあるAWSリソース (ECR、S3、Systems Manager、CloudWatch、DynamoDB、など) に対してアウトバウンド通信を送信するためには、NAT GatewayまたはVPCエンドポイントを配置する必要がある。

この時、Podのアウトバウンド通信の送信元IPアドレスは、NAT GatewayまたはVPCエンドポイントに紐づくIPアドレスになる。

以下のようなエラーでPodが起動しない場合、Podが何らかの理由でイメージをプルできない可能性がある。

また、Podが作成されない限り、ワーカーNodeも作成されないことに注意する。

```log
Pod provisioning timed out (will retry) for pod
```

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/network_reqs.html

#### ▼ VPC外のコントロールプレーンへのアウトバウンド通信

EKS Clusterを作成すると、ENIも作成する。

これにより、データプレーンがVPC外のコントロールプレーンと通信できるようになる。

執筆時点 (2022/05/27) では、データプレーンがコントロールプレーンとパケットを送受信するためには、VPCエンドポイントではなくNAT Gatewayを配置する必要がある。

> ↪️：
>
> - https://dev.classmethod.jp/articles/eks_basic/
> - https://aws.amazon.com/jp/blogs/news/de-mystifying-cluster-networking-for-amazon-eks-worker-nodes/

#### ▼ VPC内の他のAWSリソースへのアウトバウンド通信

VPC内にあるAWSリソース (RDSなど) の場合、そのAWS側のセキュリティグループにて、PodのプライベートサブネットのCIDRブロックを許可すればよい。

<br>

## 04-03. セットアップ

### コンソール画面の場合

#### ▼ マネージドNodeグループの場合

起動テンプレートを使用し、EC2ワーカーNodeを作成する。

起動テンプレートのタグ付け機能を使用してEC2にタグ付けでき、これは任意である。

#### ▼ セルフマネージドNodeグループの場合

任意のオートスケーリングにて、起動テンプレートを使用してEC2ワーカーNodeを作成する。

オートスケーリングのタグ付け機能を使用して、`kubernetes.io/cluster/<EKS Cluster名>`タグ (値は`owned`) をつけ、Nodeグループに明示的に参加させる必要がある。

なお、起動テンプレートも合わせて使用でき、これは任意である。

> ↪️：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/worker.html
> - https://docs.aws.amazon.com/eks/latest/userguide/launch-workers.html

<br>

### Terraformの場合

#### ▼ マネージドNodeグループの場合

起動テンプレートを使用し、EC2ワーカーNodeを作成する。

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
```

> ↪️：https://github.com/terraform-aws-modules/terraform-aws-eks/blob/master/modules/eks-managed-node-group/main.tf

#### ▼ セルフマネージドNodeグループの場合

任意のオートスケーリングにて、起動テンプレートを使用してEC2ワーカーNodeを作成する。

```terraform
resource "aws_autoscaling_group" "foo" {

  tag {
    key   = "Name"
    value = "foo-instance"
  }

  # オートスケーリングのタグに kubernetes.io/cluster/<EKS Cluster名> をつける必要がある
  tag {
    key   = "kubernetes.io/cluster/<EKS Cluster名>"
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

> ↪️：https://github.com/terraform-aws-modules/terraform-aws-eks/blob/master/modules/self-managed-node-group/main.tf

<br>

## 05. on-Fargate (FargateワーカーNode)

### on-Fargate (FargateワーカーNode) とは

<br>

## 05-02. セットアップ

### コンソール画面の場合

#### ▼ 制約

EC2にはない制約については、以下のリンクを参考にせよ。

> ↪️：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/fargate.html
> - https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/install-ssm-agent-on-amazon-eks-worker-nodes-by-using-kubernetes-daemonset.html

#### ▼ メトリクス収集

FargateワーカーNode内のメトリクスのデータポイントを収集する上で、FargateワーカーNodeはDaemonSetに非対応のため、メトリクス収集コンテナをサイドカーコンテナとして配置する必要がある。

収集ツールとして、OpenTelemetryをサポートしている。

> ↪️：https://aws.amazon.com/jp/blogs/news/introducing-amazon-cloudwatch-container-insights-for-amazon-eks-fargate-using-aws-distro-for-opentelemetry/

#### ▼ ログルーティング

FargateワーカーNode内のログを転送する上で、FargateはDaemonSetに非対応のため、ログ転送コンテナをサイドカーコンテナとして配置する必要がある。

ロググーティングツールとして、FluentBitをサポートしている。

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/fargate-logging.html

`【１】`

: ログ転送コンテナのためのNamespaceを作成する。

     名前は、必ず`aws-observability`とする。

> ↪️：https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: aws-observability
  labels:
    aws-observability: enabled
```

`【２】`

: `aws-observability`内で`aws-logging`という名前のConfigMapを作成する。

     これより、ログ転送コンテナとしてFluentBitコンテナが作成され、PodからCloudWatchログにログを送信できるようになる。

     名前は、必ず`aws-logging`とする。

> ↪️：https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/

```bash
$ kubectl apply -f config-map.yaml
```

```yaml
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

`【３】`

: FargateワーカーNodeにECRやCloudWatchへの認可スコープを持つポッド実行ロールを付与しておく。

     これにより、KubernetesリソースにAWSへの認可スコープが付与され、ServiceAccountやSecretを作成せずとも、PodがECRからコンテナイメージをプルできる様になる。

     一方で、Pod内のコンテナには認可スコープが付与されない。

     そのため、Podが作成された後に必要な認可スコープ (例：コンテナがRDSにアクセスする認可スコープなど) に関しては、ServiceAccountとIAMロールの紐付けが必要である。

> ↪️：
>
> - https://nishipy.com/archives/1122
> - https://toris.io/2021/01/how-kubernetes-pulls-private-container-images-on-aws/
> - https://docs.aws.amazon.com/eks/latest/userguide/fargate-getting-started.html
> - https://kumano-te.com/activities/apply-iam-roles-to-eks-service-accounts
> - https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/

<br>

### FargateワーカーNode

#### ▼ FargateワーカーNodeとは

![eks_on_fargate](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/eks_on_fargate.png)

Fargate上で稼働するKubernetesのホストのこと。

KubernetesのワーカーNodeに相当する。

EC2ワーカーNodeと比べてカスタマイズ性が低く、ワーカーNode当たりで稼働するPod数はAWSが管理する。

一方で、各EC2のハードウェアリソースの消費量をユーザーが管理しなくてもよいため、Kubernetesのホストの管理が楽である。

> ↪️：https://www.sunnycloud.jp/column/20210315-01/

#### ▼ FargateワーカーNodeを使用できない場合

以下の場合は、EC2ワーカーNodeを使用するようにする。

- FargateワーカーNodeでは、DaemonSetが使えない。サイドカーを配置する必要がある。
- Fargateで設定可能な最大スペックを超えたスペックが必要である。
- emptyDirボリューム以外が必要である。
- FargateワーカーNodeでは、サービスメッシュにAppMeshしか使えない。もし、AppMeshを使いたくない場合は、EC2ワーカーNodeを使用する。

> ↪️：https://qiita.com/mumoshu/items/c9dea2d82a402b4f9c31#managed-node-group%E3%81%A8eks-on-fargate%E3%81%AE%E4%BD%BF%E3%81%84%E5%88%86%E3%81%91

#### ▼ Fargateプロファイル

Fargateを設定する。

| コンポーネント名           | 説明                                                                                                     | 補足                                                                                                                                                                                                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pod実行ロール              | kubeletがAWSリソースにアクセスできるように、Podにロールを設定する。                                      | ・実行ポリシー (AmazonEKSFargatePodExecutionRolePolicy) には、ECRへの認可スコープのみが付与されている。<br>・信頼されたエンティティでは、`eks-fargate-pods.amazonaws.com`を設定する必要がある。<br>↪️：https://docs.aws.amazon.com/eks/latest/userguide/pod-execution-role.html |
| サブネット                 | EKS FargateワーカーNodeが起動するサブネットIDを設定する。                                                | プライベートサブネットを設定する必要がある。                                                                                                                                                                                                                                    |
| ポッドセレクタ (Namespace) | EKS FargateワーカーNodeにスケジューリングするPodを固定できるように、PodのNamespaceの値を設定する。       | ・`kube-system`や`default`を指定するKubernetesリソースが稼働できるように、ポッドセレクタにこれを追加する必要がある。<br>・IstioやArgoCDを、それ専用のNamespaceで稼働させる場合は、そのNamespaceのためのプロファイルを作成しておく必要がある。                                   |
| ポッドセレクタ (Label)     | EKS FargateワーカーNodeにスケジューリングするPodを固定できるように、Podの任意のlabelキーの値を設定する。 |                                                                                                                                                                                                                                                                                 |

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/fargate-profile.html#fargate-profile-components

<br>

## 05-02. Nodeグループ (on-Fargate)

記入中...

<br>

## 06. アップグレード

### アップグレードとは

EKS Clusterにて、コントロールプレーンとデータプレーンをローリング方式でアップグレードする。

AWSはIaaSのため、AMIを指定すれば、NodeのOSのアップグレードも実施してくれる。

執筆時点 (2022/01/28) では、AWSのAPIを介して`updateConfig`値を設定すれば、アップグレード時のサージ数を設定できる。

> ↪️：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/managed-node-update-behavior.html
> - https://docs.aws.amazon.com/eks/latest/APIReference/API_UpdateNodegroupConfig.html#API_UpdateNodegroupConfig_RequestSyntax

### 仕組み

#### ▼ データプレーンの場合

EKS Clusterのアップグレード時、以下の仕組みでデータプレーンのワーカーNodeをローリングアップグレードする。

また、Nodeグループに紐づくオートスケーリンググループのAZリバランシングの仕組みによって、既存のワーカーNodeと同じAZでワーカーNodeを再作成する。

`【１】`

: Nodeグループ単位でローリングアップグレードできるように、EKS ClusterのワーカーNode数の設定 (Node希望数、Node最大数) を自動的に増加させる。

`【２】`

: 旧ワーカーNodeを残して、新しいAMIを使用したワーカーNodeを作成する。

     旧ワーカーNodeが稼働しているAZで新ワーカーNodeを作成する。

     旧ワーカーNodeを残せるのは、あらかじめEKS ClusterのワーカーNode数の設定 (Node希望数、Node最大数) を増加させているためである。

`【３】`

: 各AZで新ワーカーNodeを正しく作成できることを検証する。

`【４】`

: AZリバランシングが成功すれば、旧ワーカーNodeでDrainが開始され、Podのスケジューリングが無効化される。

`【５】`

: 新ワーカーNode上でPodをスケジューリングし直し、旧ワーカーNodeを削除する。

`【６】`

: 最終的に、アップグレード前のワーカーNode数 (Node希望数) に戻る。

> ↪️：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/managed-node-update-behavior.html
> - https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-benefits.html#AutoScalingBehavior.InstanceUsage
> - https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-instance-termination.html#common-scenarios-termination-rebalancing

### 手順

EKS Clusterはおおよそ以下の方法でアップグレードする。

`【１】`

: コントロールプレーンNodeをアップグレードする。

`【２】`

: ワーカーNodeをアップグレードする。

     コントロールプレーン上のkube-apiserverのバージョンに応じた新しいAMIを使用して、ワーカーNodeを再作成する。

`【３】`

: ワーカーNode上のAWS EKSアドオン (例：aws-eks-codednsアドオン、aws-eks-kube-proxyアドオン、aws-eks-vpc-cniアドオン、など) をアップグレードする。

> ↪️：https://inside.dmm.com/entry/2022/08/26/eks_is_hard

<br>
