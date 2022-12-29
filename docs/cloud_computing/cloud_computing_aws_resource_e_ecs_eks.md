---
title: 【IT技術の知見】ECS、EKS＠Eで始まるAWSリソース
description: ECS、EKS＠Eで始まるAWSリソースの知見を記録しています。
---

# ECS、EKS＠```E```で始まるAWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. ECS、EKS：Elastic Container/Kubernetes Service

### EKSとKubernetesの対応

> ℹ️ 参考：https://zenn.dev/yoshinori_satoh/articles/2021-02-13-eks-ecs-compare

![eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks.png)

| Kubernetes上でのリソース名       | EKS上でのリソース名               | 補足                                                                                                                                                                                                                                                                     |
|----------------------------|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Cluster                    | EKS Cluster                 | ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/clusters.html                                                                                                                                                                                                   |
| Ingress                    | ALB Ingress                 | IngressはALB Ingressに置き換える必要がある。AWS LBコントローラーを作成すると、ALB Ingressは自動的に作成される。<br>ℹ️ 参考：<br>・https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html <br>・https://blog.linkode.co.jp/entry/2020/06/26/095917#AWS-ALB-Ingress-Controller-for-Kubernetes |
| Ingressコントローラー             | AWS LBコントローラー               | ALB Ingressを自動的に作成する。ℹ️ 参考：https://aws.amazon.com/jp/blogs/news/using-alb-ingress-controller-with-amazon-eks-on-fargate/                                                                                                                                          |
|                            | API Gateway+NLB             | ℹ️ 参考：https://aws.amazon.com/jp/blogs/news/api-gateway-as-an-ingress-controller-for-eks/                                                                                                                                                                               |
| コントロールプレーン                 | EKSコントロールプレーン               | ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/platform-versions.html                                                                                                                                                                                          |
| ワーカーNode                   | FargateワーカーNode、EC2ワーカーNode | ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/eks-compute.html                                                                                                                                                                                                |
| PersistentVolume           | EBS、EFS                     | ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/storage.html                                                                                                                                                                                                    |
| Secret                     | Secrets Manager             | ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/manage-secrets.html                                                                                                                                                                                             |
| ServiceAccount、UserAccount | IAMユーザー                     | ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html                                                                                                                                                                                              |
| Role、ClusterRole           | IAMロール                      | ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html                                                                                                                                                                                              |

<br>

### コントロールプレーンとデータプレーンの対応関係

| コントロールプレーン（コンテナオーケストレーション環境） | データプレーン（コンテナ実行環境） | 説明                                                                                          |
|--------------------------------|-----------------------|---------------------------------------------------------------------------------------------|
| ECS                            | EC2、Fargate           | 単一のOS上でコンテナオーケストレーションを実行する。                                                              |
| EKS                            | EC2、Fargate           | 複数のOS上それぞれでコンテナオーケストレーションを実行する。<br>ℹ️ 参考：https://www.sunnycloud.jp/column/20210315-01/ |

<br>

### コントロールプレーン

#### ▼ コントロールプレーンとは

コンテナオーケストレーションを実行する環境を提供する。

データプレーンのVPC外に存在している。



#### ▼ ECSの場合

開発者や他のAWSリソースからのアクセスを待ち受けるAPI、データプレーンを管理するコンポーネント、からなる。



> ℹ️ 参考：https://aws.amazon.com/jp/blogs/news/under-the-hood-amazon-elastic-container-service-and-aws-fargate-increase-task-launch-rates/

![ecs_control-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_control-plane.png)

#### ▼ EKSの場合

開発者や他のAWSリソースからのアクセスを待ち受けるAPI、アクセスをAPIにルーティングするNLB、データプレーンを管理するコンポーネント、からなる。



> ℹ️ 参考：https://aws.github.io/aws-eks-best-practices/reliability/docs/controlplane/

![eks_control-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_control-plane.png)

<br>

### データプレーン

#### ▼ データプレーンとは

コンテナの実行環境のこと。『```on-EC2```』『```on-Fargate```』という呼び方は、データプレーンがECSの実行環境（```execution environment```）の意味合いを持つからである。

#### ▼ EC2ワーカーNodeの場合

EC2インスタンスをワーカーNodeとして、コンテナを作成する。



#### ▼ FargateワーカーNodeの場合

FargateをワーカーNodeとして、コンテナを作成する。Fargateの実体はEC2インスタンスである（ドキュメントに記載がないが、AWSサポートに確認済み）。

> ℹ️ 参考：https://aws.amazon.com/jp/blogs/news/under-the-hood-fargate-data-plane/

![fargate_data-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/fargate_data-plane.png)

<br>


### 認証/認可

#### ▼ EKSの場合

![eks_auth_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_auth_architecture.png)

（１）IAMユーザーと紐づいた```kubectl```クライアントが、コントロールプレーンにリクエストを送信する。kube-apiserverは、aws-iam-authenticator-serverにWebhookを送信する。admission-controllersアドオンのWebhookではないことに注意する。

（２）aws-iam-authenticator-serverは、IAM APIを使用してIAMユーザーを認証する。

（３）もし認証に成功していた場合に、aws-iam-authenticator-serverは、ConfigMap（aws-auth）から、IAMユーザーに紐づくUserAccountを取得する。

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
    - rolearn: arn:aws:iam::<アカウントID>:role/foo-role # IAMロール名
      username: foo-iam-user # IAMユーザー名
      groups:
        - system:masters # ClusterRoleBindingに定義されたGroup名
    - rolearn: arn:aws:iam::<アカウントID>:role/bar-role # ワーカーNodeに紐づけたロール名
      username: system:node:{{EC2PrivateDNSName}} # ワーカーNodeの識別子
      groups:
        - system:bootstrappers
        - system:nodes
```

（４）aws-iam-authenticator-serverは、kube-apiserverにUserAccountを含むレスポンスを返信する。

（５）あとは、Kubernetesの標準の認可の仕組みである。kube-apiserverは、認可ステップでUserAccountに紐づくClusterRoleを取得する。```kubectl```クライアントは、Kubernetesリソースを操作できる。


> ℹ️ 参考：
>
> - https://aws.amazon.com/blogs/containers/kubernetes-rbac-and-iam-integration-in-amazon-eks-using-a-java-based-kubernetes-operator/
> - https://dzone.com/articles/amazon-eks-authentication-amp-authorization-proces
> - https://katainaka0503.hatenablog.com/entry/2019/12/07/091737
> - https://dev.to/aws-builders/eks-auth-deep-dive-4fib

#### ▼ IRSA：IAM Roles for Service Accounts

KubernetesのServiceAccountにAWSのIAMロールを紐づける仕組み。IRSAが登場するまでは、EKS上でのワーカーNode（例：EC2、Fargate）にしかIAMロールを紐づけることができず、KubernetesリソースにIAMロールを直接的に紐づけることはできなかった。

> ℹ️ 参考：
>
> - https://www.bigtreetc.com/column/eks-irsa/
> - https://katainaka0503.hatenablog.com/entry/2019/12/07/091737#ServiceAccount%E3%81%AEIAM-%E3%83%AD%E3%83%BC%E3%83%ABIRSA

<br>

## 02. ECSデータプレーン

### ECSクラスター

ECSサービスの管理グループ単位のこと。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/userguide/clusters.html

![ecs_cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_cluster.png)

<br>

### ECSサービス

ECSタスクの管理グループ単位のこと。

ECSタスクへのロードバランシング、タスクの数の維持管理や、リリースの成否の管理を行う。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/userguide/service_definition_parameters.html

<br>

### ECSタスク

#### ▼ ECSタスク

コンテナインスタンスの管理グループ単位のこと。

ECSタスク定義を基に作成される。



![ecs_task](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_task.png)

#### ▼ ECSコンテナエージェント

![ecs_task-execution-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_task-execution-role.png)

ECSタスク実行ロールを使用して、ECSタスクのライフサイクルを管理する。

Fargateの場合、ECSコンテナエージェントがプリインストールされている。



> ℹ️ 参考：
>
> - https://dev.classmethod.jp/articles/ecs_ec2_iamrole/
> - https://aws.amazon.com/jp/blogs/news/under-the-hood-task-networking-for-amazon-ecs/

#### ▼ ECSタスク定義

ECSタスクをどのような設定値を基に作成するかを設定できる。

ECSタスク定義は、バージョンを示す『リビジョンナンバー』で番号づけされる。

ECSタスク定義を削除するには、全てのリビジョン番号のECSタスク定義を登録解除する必要がある。



#### ▼ ECSタスクのライフサイクルフェーズ

![ecs_task_lifecycle_phase](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_task_lifecycle_phase.png)

ECSタスクのライフサイクルにはフェーズがある。

ECSタスクは、必須コンテナ異常停止時、デプロイ、自動スケーリング、手動操作、の時にフェーズを持つ。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-lifecycle.html#lifecycle-states

| フェーズ名          | 説明                                                        | 補足                                                                                                                                               |
|-----------------|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| Provisioning    | ECSタスクの起動前に必要な準備（例；ENIの紐付け）があり、これが完了していない。      |                                                                                                                                                    |
| Pending         | ECSタスク内のコンテナの起動がまだ完了していない。                             |                                                                                                                                                    |
| Activating      | ECSタスク内の全てのコンテナの起動が完了したが、ECSタスク全体のセットアップは完了していない。 |                                                                                                                                                    |
| Running         | ECSタスク内の全てのコンテナの起動とECSタスク全体の準備が完了し、実行中である。     | コンテナの起動が完了すれば```Running```フェーズになるが、コンテナ内でビルトインサーバーを起動するようなアプリケーション（例：フレームワークのビルトインサーバー機能）の場合は、```Running```フェーズであっても使用できないことに注意する。 |
| De-activating   | ECSタスク内のコンテナを停止する前に必要な処理があり、これが完了していない。           |                                                                                                                                                    |
| Stopping        | ECSタスク内のコンテナが正常/異常に停止しようとしている途中である。                |                                                                                                                                                    |
| De-provisioning | ECSタスク全体を停止する前に必要な準備（例；ENIの解除）があり、これが完了していない。 |                                                                                                                                                    |
| Stopped         | ECSタスク全体が停止した。                                          | 正常停止と異常停止に関わらず、停止理由を確認できる。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/developerguide/stopped-task-errors.html          |

<br>

### ロール

#### ▼ サービスロール

ECSサービスがECSタスクを操作するために必要なロールである。

サービスリンクロールに含まれ、ECSの作成時に自動的に紐付けられる。



> ℹ️ 参考：
>
> - https://dev.classmethod.jp/articles/ecs_fargate_iamrole/
> - https://dev.classmethod.jp/articles/ecs_ec2_iamrole/

#### ▼ コンテナインスタンスロール

![ecs_container-instance-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_container-instance-role.png)

コンテナのホストが他のAWSリソースにアクセスするために必要なロールである。

Fargateの場合、不要である。



> ℹ️ 参考：
>
> - https://dev.classmethod.jp/articles/ecs_fargate_iamrole/
> - https://dev.classmethod.jp/articles/ecs_ec2_iamrole/

#### ▼ タスクロール

![ecs_task-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_task-role.png)

ECSタスク内のコンテナのアプリケーションが、他のAWSリソースにアクセスするために必要なロールである。

アプリケーションにS3やSystems Managerへの認可スコープを与えたい場合は、タスク実行ロールではなくタスクロールに認可スコープを紐付ける。



> ℹ️ 参考：
>
> - https://dev.classmethod.jp/articles/ecs_fargate_iamrole/
> - https://dev.classmethod.jp/articles/ecs_ec2_iamrole/

**＊実装例＊**

アプリケーションからCloudWatchログにログを送信するために、ECSタスクロールにカスタマー管理ポリシーを紐付ける。



```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:*:*:*"
      ]
    }
  ]
}
```

**＊実装例＊**

パラメーターストアから変数を取得するために、ECSタスクロールにインラインポリシーを紐付ける。



```yaml
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameters"
            ],
            "Resource": "*"
        }
    ]
}
```

#### ▼ タスク実行ロール

![ecs_task-execution-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_task-execution-role.png)

ECSタスク内のECSコンテナエージェントが、他のAWSリソースにアクセスするために必要なロールのこと。

AWS管理ポリシーである『```AmazonECSTaskExecutionRolePolicy```』が紐付けられたロールを、タスクに紐付ける必要がある。

このポリシーには、ECRへの認可スコープの他、CloudWatchログにログを作成するための認可スコープが設定されている。

ECSタスク内のコンテナがリソースにアクセスするために必要なタスクロールとは区別すること。



> ℹ️ 参考：
>
> - https://dev.classmethod.jp/articles/ecs_fargate_iamrole/
> - https://dev.classmethod.jp/articles/ecs_ec2_iamrole/

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

**＊実装例＊**

datadogエージェントがECSクラスターやコンテナにアクセスできるように、ECSタスク実行ロールにカスタマー管理ポリシーを紐付ける。



```yaml
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "ecs:ListClusters",
                "ecs:ListContainerInstances",
                "ecs:DescribeContainerInstances"
            ],
            "Effect": "Allow",
            "Resource": "*"
        }
    ]
}
```

<br>

### ネットワークモードとコンテナ間通信

#### ▼ noneモード

外部ネットワークが無く、タスクと外と通信できない。



#### ▼ hostモード

EC2でのみ使用できる。

Dockerのhostネットワークに相当する。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-networkmode.html#networking-networkmode-host

![network-mode_host-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-mode_host-mode.png)

#### ▼ bridgeモード

EC2でのみ使用できる。

Dockerのbridgeネットワークに相当する。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-networkmode.html#networking-networkmode-bridge

![network-mode_host-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-mode_host-mode.png)

#### ▼ awsvpcモード

FargateとEC2の両方で使用できる。awsの独自ネットワークモード。タスクはElastic Networkインターフェースと紐付けられ、コンテナではなくタスク単位でプライベートIPアドレスが割り当てられる。Fargateの場合、同じタスクに属するコンテナ間は、localhostインターフェイスというENI経由で通信できるようになる（推測ではあるが、FargateとしてのEC2インスタンスにlocalhostインターフェースが紐付けられる）。これにより、コンテナ間でパケットを送受信する時（例：NginxコンテナからPHP-FPMコンテナへのルーティング）は、通信元コンテナにて、通信先のアドレスを『localhost（```127.0.0.1```）』で指定すれば良い。また、awsvpcモードの独自の仕組みとして、同じECSタスク内であれば、互いにコンテナポートを開放せずとも、インバウンド通信を待ち受けるポートを指定するのみで、コンテナ間でパケットを送受信できる。例えば、NginxコンテナからPHP-FPMコンテナにリクエストをルーティングするためには、PHP-FPMプロセスが```9000```番ポートでインバウンド通信を受信し、加えてコンテナが```9000```番ポートを開放する必要がある。しかし、awsvpcモードではコンテナポートを開放する必要はない。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-networkmode.html#networking-networkmode-awsvpc
> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/fargate-task-networking.html

![network-mode_awsvpc](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-mode_awsvpc.png)

<br>

### マルチECSサービス

#### ▼ マルチECSサービスとは

ECSクラスターが複数のECSサービスから構成される。

マイクロサービスアーキテクチャのアプリケーション群を稼働させる時、Kubernetesを使用するのが基本である。

ただし、ECSクラスター内に複数のECSサービスを作成することにより、Kubernetesのような構成を実現できる。



> ℹ️ 参考：https://tangocode.com/2018/11/when-to-use-lambdas-vs-ecs-docker-containers/

![ecs-fargate_microservices](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs-fargate_microservices.png)

#### ▼ ECSサービスディスカバリー

Route53にECSタスクの宛先情報を動的に追加削除することにより、ECSタスクが他のECSタスクと通信できるようにする。



> ℹ️ 参考：
>
> - https://practical-aws.dev/p/ecs-service-discovery/
> - https://medium.com/@toddrosner/ecs-service-discovery-1366b8a75ad6
> - https://dev.classmethod.jp/articles/ecs-service-discovery/

![ecs_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_service-discovery.png)

<br>

### プライベートサブネット内からのアウトバウンド通信

#### ▼ プライベートサブネット内へのデータプレーンの配置

プライベートサブネット内にデータプレーンを配置した場合、パブリックネットワークやVCP外のAWSリソースにアクセスするために、NAT GatewayやVPCエンドポイントが必要になる。

パブリックサブネットに配置すればこれらは不要となるが、パブリックサブネットよりもプライベートサブネットにデータプレーンを配置する方が望ましい。



#### ▼ パブリックネットワークに対する通信

データプレーンをプライベートサブネットに配置した場合、パブリックネットワークに対してアウトバウンド通信を送信するためには、NAT Gatewayを配置する必要がある。



#### ▼ VPC外のAWSリソースに対する通信

データプレーンをプライベートサブネットに配置した場合、VPC外にあるAWSリソース（例：コントロールプレーン、ECR、S3、Systems Manager、CloudWatch、DynamoDB、など）に対してアウトバウンド通信を送信するためには、NAT GatewayあるいはVPCエンドポイントを配置する必要がある。もしNAT Gatewayを設置したとする。この場合、VPCエンドポイントよりもNAT Gatewayの方が高く、AWSリソースに対する通信でもNAT Gatewayを通過するため、高額料金を請求されてしまう。

> ℹ️ 参考：https://zenn.dev/yoshinori_satoh/articles/ecs-fargate-vpc-endpoint

![ecs_nat-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_nat-gateway.png)

代わりとして、VPCエンドポイントを設置する。

より低額でデータプレーンがVPC外のAWSリソースのアクセスできるようになる。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-connecting-vpc.html#networking-connecting-privatelink

![ecs_control-plane_vpc-endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_control-plane_vpc-endpoint.png)

<br>

### ログ転送

#### ▼ awslogsドライバー

標準出力/標準エラー出力に出力されたログをCloudWatch-APIに送信する。



> ℹ️ 参考：
>
> - https://docs.docker.com/config/containers/logging/awslogs/
> - https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html#create_awslogs_logdriver_options

| 設定項目                      | 説明                                                   | 補足                                                                                                                                                                                                       |
|-------------------------------|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```awslogs-group```           | ログ宛先のCloudWatchログのロググループを設定する。                     |                                                                                                                                                                                                            |
| ```awslogs-datetime-format``` | 日時フォーマットを定義し、加えてこれをログの区切り単位としてログストリームに出力する。 | 正規表現で設定する必要があり、加えてJSONでは『```\```』を『```\\```』にエスケープしなければならない。例えば『```\\[%Y-%m-%d %H:%M:%S\\]```』となる。<br>ℹ️ 参考：https://docs.docker.com/config/containers/logging/awslogs/#awslogs-datetime-format |
| ```awslogs-region```          | ログ宛先のCloudWatchログのリージョンを設定する。                      |                                                                                                                                                                                                            |
| ```awslogs-stream-prefix```   | ログ宛先のCloudWatchログのログストリームのプレフィックス名を設定する。          | ログストリームには、『```<プレフィックス名>/<コンテナ名>/<タスクID>```』の形式で送信される。                                                                                                                                               |

<br>

## 02-02. on-EC2

### EC2インスタンスの最適化AMI

任意のEC2インスタンスを使用できるが、AWSが用意している最適化AMIを選んだ方が良い。

このAMIには、EC2がECSと連携するために必要なソフトウェアがプリインストールされており、EC2インスタンスをセットアップする手間が省ける。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI.html

| AMI名                          | 説明                                                                                                                                 | 特に相性の良いアプリ                                    |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| ECS最適化 Amazon Linux 2       | ECSのための標準的なEC2インスタンスを作成できる。最も推奨。                                                                                             |                                                   |
| ECS最適化 Amazon Linux 2022    | Amazon Linux 2よりも先進的な機能を持つEC2インスタンスを作成できる。<br>ℹ️ 参考：https://docs.aws.amazon.com/linux/al2022/ug/compare-al2-to-AL2022.html |                                                   |
| ECS最適化 Amazon Linux         | ECSのための標準的なEC2インスタンスを作成できる。非推奨であり、Amazon Linux 2を使用した方が良い。                                                               |                                                   |
| ECS最適化 Amazon Linux 2 arm64 | arm64ベースのGravitonプロセッサーが搭載されたEC2インスタンスを作成できる。                                                                                    |                                                   |
| ECS最適化 Amazon Linux 2 GPU   | GPUが搭載されたEC2インスタンスを作成できる。                                                                                                        | GPUが必要なアプリケーション（計算処理系、機械学習系のアプリケーション） |
| ECS最適化 Amazon Linux 2 推定  | Amazon EC2 Inf1インスタンスを作成できる。                                                                                                       |                                                   |

<br>

### タスク配置戦略

ECSタスクをECSクラスターに配置する時のアルゴリズムを選択できる。



| 戦略    | 説明                                  |
|---------|-------------------------------------|
| Spread  | ECSタスクを各場所にバランスよく配置する            |
| Binpack | ECSタスクを```1```個の場所にできるだけ多く配置する。 |
| Random  | ECSタスクをランダムに配置する。                   |

<br>

## 02-03. on-Fargate

### セットアップ

#### ▼ ECSサービス

| 設定項目         | 説明                                                                                                                           | 補足                                                                                                                                                                                                                                                                                                                                                                                          |
|------------------|--------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ECSタスク定義       | ECSサービスで維持管理するタスクの定義ファミリー名とリビジョン番号を設定する。                                                                            |                                                                                                                                                                                                                                                                                                                                                                                               |
| 起動タイプ          | ECSタスク内のコンテナの起動タイプを設定する。                                                                                                  |                                                                                                                                                                                                                                                                                                                                                                                               |
| プラットフォームのバージョン   | ECSコントロールプレーンのバージョンを設定する。                                                                                                    | バージョンによって、連携できるAWSリソースが異なる。                                                                                                                                                                                                                                                                                                                                                                |
| サービスタイプ          |                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                               |
| ECSタスクの必要数    | 非スケーリング時またはデプロイ時のタスク数を設定する。                                                                                              | 最小ヘルス率と最大率の設定値に影響する。                                                                                                                                                                                                                                                                                                                                                               |
| 最小ヘルス率        | ECSタスクの必要数の設定を```100```%とし、新しいタスクのデプロイ時に、稼働中タスクの最低合計数を割合で設定する。                                              | 例として、タスク必要数が4個だと仮定する。タスクヘルス最小率を50%とすれば、稼働中タスクの最低合計数は2個となる。デプロイ時の既存タスク停止と新タスク起動では、稼働中の既存タスク/新タスクの数が最低合計数未満にならないように制御される。<br>ℹ️ 参考：https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments                                                                                                                                           |
| 最大率           | ECSタスクの必要数の設定を```100```%とし、新しいタスクのデプロイ時に、稼働中/停止中タスクの最高合計数を割合で設定する。                                       | 例として、タスク必要数が4個だと仮定する。タスク最大率を200%とすれば、稼働中/停止中タスクの最高合計数は８個となる。デプロイ時の既存タスク停止と新タスク起動では、稼働中/停止中の既存タスク/新タスクの数が最高合計数を超過しないように制御される。<br>ℹ️ 参考：https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments                                                                                                                                |
| ヘルスチェックの猶予期間 | デプロイ時のALB/NLBのヘルスチェックの状態を確認するまでの待機時間を設定する。猶予期間を過ぎても、ALB/NLBのヘルスチェックが失敗していれば、サービスはタスクを停止し、新しいタスクを再起動する。 | ALB/NLBではターゲットを登録し、ヘルスチェックを実行するプロセスがある。特にNLBでは、これに時間がかかる。またアプリケーションによっては、コンテナの作成に時間がかかる。そのため、NLBのヘルスチェックが完了する前に、ECSサービスがNLBのヘルスチェックの結果を確認してしまうことがある。例えば、NLBとLaravelを使用する場合は、ターゲット登録とLaravelコンテナの築の時間を加味して、```330```秒以上を目安とする。例えば、ALBとNuxt.js（SSRモード）を使用する場合は、```600```秒以上を目安とする。注意点として、アプリケーションのコンテナ作成にかかる時間は、開発環境での所要時間を参考にする。 |
| タスクの最小数       | スケーリング時のタスク数の最小数を設定する。                                                                                                  |                                                                                                                                                                                                                                                                                                                                                                                               |
| タスクの最大数       | スケーリング時のタスク数の最大数を設定する。                                                                                                  |                                                                                                                                                                                                                                                                                                                                                                                               |
| ロードバランシング        | ALBでルーティングするコンテナを設定する。                                                                                                       |                                                                                                                                                                                                                                                                                                                                                                                               |
| タスク数            | ECSタスクの作成数をいくつに維持するかを設定する。                                                                                              | タスクが何らかの原因で停止した場合、タスクを自動的に作成する。                                                                                                                                                                                                                                                                                                                                                   |
| デプロイメント          | ローリングアップデート、ブルー/グリーンデプロイがある。                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                               |
| サービスロール          |                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                               |

#### ▼ ECSタスク定義

| 設定項目          | 説明                                                         | 補足                                                                                                            |
|-------------------|--------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| ECSタスク定義名      | ECSタスク定義の名前を設定する。                                      |                                                                                                                 |
| ネットワークモード         | ホストとコンテナ間を接続するネットワーク様式を設定する。                          |                                                                                                                 |
| 互換性            |                                                              |                                                                                                                 |
| オペレーティングシステムファミリー |                                                              |                                                                                                                 |
| タスクロール            | ECSタスク内のコンテナのアプリケーションが、他のAWSリソースにアクセスするために必要なロールを設定する。 |                                                                                                                 |
| タスク実行ロール        | ECSタスク内のECSコンテナエージェントが、他のAWSリソースにアクセスするために必要なロールを設定する。 |                                                                                                                 |
| タスクメモリ            | ECSタスク当たりのコンテナの合計メモリサイズを設定する。                           | ECSタスク内のコンテナに割り振ることを想定し、やや多めにメモリを設定した方が良い。                                                            |
| タスクCPU            | ECSタスク当たりのコンテナの合計CPUサイズを設定する。                           | ・ECSタスク内のコンテナに割り振ることを想定し、やや多めにメモリを設定した方が良い。<br>・CPUごとに使用できるメモリサイズに違いがあり、大きなCPUほど小さなメモリを使用できない。 |
| コンテナ定義          | ECSタスク内のコンテナを設定する。                                        | JSONをインポートしても設定できる。                                                                                           |
| サービス統合          |                                                              |                                                                                                                 |
| プロキシ              |                                                              |                                                                                                                 |
| FireLens統合      | FireLensコンテナを使用する場合に有効化する。                            |                                                                                                                 |
| ボリューム             |                                                              |                                                                                                                 |

#### ▼ コンテナ定義

ECSタスク内のコンテナ1つに対して、環境を設定する。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/userguide/task_definition_parameters.html

| 設定項目                        | 対応する```docker```コマンドオプション       | 説明                                                                                                                                                                            | 補足                                                                                                                                                                                                  |
|---------------------------------|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cpu                             | ```--cpus```                      | タスク全体に割り当てられたメモリ（タスクメモリ）のうち、該当のコンテナに最低限割り当てるCPUユニット数を設定する。cpuReservationという名前になっていないことに注意する。 CPUユニット数の比率に基づいて、タスク全体のCPUが各コンテナに割り当てられる。『ソフト制限』ともいう。 | ℹ️ 参考：<br>・https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_environment <br>・https://qiita.com/_akiyama_/items/e9760dd61d94b8031247 |
| dnsServers                      | ```--dns```                       | コンテナが名前解決に使用するDNSサーバーのIPアドレスを設定する。                                                                                                                                      |                                                                                                                                                                                                       |
| essential                       |                                   | コンテナが必須か否かを設定する。                                                                                                                                                           | ・```true```の場合、コンテナが停止すると、タスクに含まれる全コンテナが停止する。<br>```false```の場合、コンテナが停止しても、その他のコンテナは停止しない。                                                                                             |
| healthCheck<br>(command)        | ```--health-cmd```                | ホストからFargateに対して、```curl```コマンドによるリクエストを送信し、レスポンス内容を確認。                                                                                                                  |                                                                                                                                                                                                       |
| healthCheck<br>(interval)       | ```--health-interval```           | ヘルスチェックの間隔を設定する。                                                                                                                                                            |                                                                                                                                                                                                       |
| healthCheck<br>(retries)        | ```--health-retries```            | ヘルスチェックを成功と見なす回数を設定する。                                                                                                                                                   |                                                                                                                                                                                                       |
| hostName                        | ```--hostname```                  | コンテナにホスト名を設定する。                                                                                                                                                              |                                                                                                                                                                                                       |
| image                           |                                   | ECRのURLを設定する。                                                                                                                                                                 | 指定できるURLの記法は、Dockerfileの```FROM```と同じである。<br>ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_docker_dockerfile.html                       |
| logConfiguration<br>(logDriver) | ```--log-driver```                | ログドライバーを指定することにより、ログの出力先を設定する。                                                                                                                                           | Dockerのログドライバーにおおよそ対応しており、Fargateであれば『awslogs、awsfirelens、splunk』に設定できる。EC2であれば『awslogs、json-file、syslog、journald、fluentd、gelf、logentries』を設定できる。                                               |
| logConfiguration<br>(options)   | ```--log-opt```                   | ログドライバーに応じて、詳細な設定を行う。                                                                                                                                                     |                                                                                                                                                                                                       |
| portMapping                     | ```--publish```<br>```--expose``` | ホストとFargateのアプリケーションのポート番号をマッピングし、ポートフォワーディングを行う。                                                                                                                            | ```containerPort```のみを設定し、```hostPort```は設定しなければ、EXPOSEとして定義できる。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_PortMapping.html                                      |
| secrets<br>(volumesFrom)        |                                   | パラメーターストアから出力する変数を設定する。                                                                                                                                                   |                                                                                                                                                                                                       |
| memory                          | ```--memory```                    | コンテナのメモリサイズの閾値を設定し、これを超えた場合にコンテナを停止する『ハード制限』ともいう。                                                                                                                    | ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_memory                                                                       |
| memoryReservation               | ```--memory-reservation```        | タスク全体に割り当てられたメモリ（タスクメモリ）のうち、該当のコンテナに最低限割り当てるメモリ分を設定する。『ソフト制限』ともいう。                                                                                              | ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_memory                                                                       |
| mountPoints                     |                                   | 隠蔽されたホストとコンテナの間でボリュームマウントを実行する。Fargateは、脆弱性とパフォーマンスの観点で、バインドマウントに対応していない。                                                                                           | ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/virtualization/virtualization_container_docker.html                                                                                          |
| ulimit                          | Linuxコマンドの<br>```--ulimit```に相当 |                                                                                                                                                                                 |                                                                                                                                                                                                       |

<br>

### IPアドレス

#### ▼ ECSタスクのIPアドレス

ECSタスクごとに異なるプライベートIPが割り当てられる。

このIPアドレスに対して、ALBはルーティングを行う。



#### ▼ FargateのIPアドレス

![NatGatewayを介したFargateから外部サービスへのアウトバウンド通信](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/NatGatewayを介したFargateから外部サービスへのアウトバウンド通信.png)

Fargateは動的パブリックIPアドレス（Fargateの再作成後に変化するIPアドレス）を持ち、固定パブリックIPアドレスであるElastic IPアドレスを設定できない。アウトバウンド通信の先にある外部サービスが、セキュリティ上で静的なIPアドレスを要求する場合、アウトバウンド通信（パブリックネットワーク向き通信）時に送信元パケットに付加されるIPアドレスが動的になり、リクエストできなくなってしまう。そこで、Fargateのアウトバウンド通信が、Elastic IPアドレスを持つNAT Gatewayを経由する（Fargateは、パブリックサブネットとプライベートサブネットのどちらに置いても良い）。これによって、NAT GatewayのElastic IPアドレスが送信元パケットに付加されるため、Fargateの送信元IPアドレスを見かけ上静的に扱えるようになる。

> ℹ️ 参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/ecs-fargate-static-elastic-ip-address/

<br>

### ECSタスクの一時起動

#### ▼ DBマイグレーション

現在起動中のECSタスクとは別に、新しいタスクを一時的に起動する。

CI/CDパイプライン上で実行する以外に、ローカルマシンから手動で実行する場合もある。

起動時に、```overrides```オプションを使用して、指定したECSタスク定義のコンテナ設定を上書きできる。

正規表現で設定する必要があり、加えてJSONでは『```\```』を『```\\```』にエスケープしなければならない。

コマンドが実行された後に、タスクは自動的にStopped状態になる。



**＊実装例＊**

LaravelのSeederコマンドやロールバックコマンドを、ローカルマシンから実行する。



```bash
#!/bin/bash

set -x

echo "Set Variables"
SERVICE_NAME="prd-foo-ecs-service"
CLUSTER_NAME="prd-foo-ecs-cluster"
TASK_NAME="prd-foo-ecs-task-definition"
SUBNETS_CONFIG=$(aws ecs describe-services \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --query "services[].deployments[].networkConfiguration[].awsvpcConfiguration[].subnets[]")
SGS_CONFIG=$(aws ecs describe-services \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --query "services[].deployments[].networkConfiguration[].awsvpcConfiguration[].securityGroups[]")

# 実行したいコマンドをoverridesに設定する。
echo "Run Task"
TASK_ARN=$(aws ecs run-task \
  --launch-type FARGATE \
  --cluster ${CLUSTER_NAME} \
  --platform-version "1.4.0" \
  --network-configuration "awsvpcConfiguration={subnets=${SUBNETS_CONFIG},securityGroups=${SGS_CONFIG}}" \
  --task-definition ${TASK_NAME} \
  --overrides '{\"containerOverrides\": [{\"name\": \"laravel-container\",\"command\": [\"php\", \"artisan\", \"db:seed\", \"--class=DummySeeder\", \"--force\"]}]}' \
  --query "tasks[0].taskArn" | tr -d """)

echo "Wait until task stopped"
aws ecs wait tasks-stopped \
  --cluster ${CLUSTER_NAME} \
  --tasks ${TASK_ARN}

echo "Get task result"
RESULT=$(aws ecs describe-tasks \
  --cluster ${CLUSTER_NAME} \
  --tasks ${TASK_ARN})
echo ${RESULT}

EXIT_STATUS=$(echo ${RESULT} | jq .tasks[0].containers[0].exitStatus)
echo exitStatus ${EXIT_STATUS}
exit ${EXIT_STATUS}
```

注意点として、実行IAMユーザーを作成し、ECSタスクを起動できる必要最低限の認可スコープを紐付ける。



```yaml
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "iam:PassRole",
                "ecs:RunTask",
                "ecs:DescribeServices",
                "ecs:DescribeTasks"
            ],
            "Resource": [
                "arn:aws:ecs:*:<アカウントID>:service/*",
                "arn:aws:ecs:*:<アカウントID>:task/*",
                "arn:aws:ecs:*:<アカウントID>:task-definition/*",
                "arn:aws:iam::<アカウントID>:role/*"
            ]
        }
    ]
}
```

<br>

### ECSタスクのデプロイ手法

#### ▼ ローリングアップデート

![rolling-update](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rolling-update.png)

（１）最小ヘルス率の設定値を基に、ローリングアップデート時の稼働中タスクの最低合計数が決定される。

（２）最大率の設定値を基に、ローリングアップデート時の稼働中/停止中タスクの最高合計数が決まる

（３）ECSは、既存タスクを稼働中のまま、新タスクを最高合計数いっぱいまで作成する。

（４）ECSは、猶予期間後にALB/NLBによる新タスクに対するヘルスチェックの結果を確認する。ヘルスチェックが成功していれば、既存タスクを停止する。ただし、最小ヘルス率によるタスクの最低合計数が保たれる。

（５）『新タスクの起動』と『ヘルスチェック確認後の既存タスクの停止』のプロセスが繰り返し実行され、徐々に既存タスクが新タスクに置き換わる。

（６）全ての既存タスクが新タスクに置き換わる。


> ℹ️ 参考：https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments/


#### ▼ ブルー/グリーンデプロイメント

CodeDeployを使用してデプロイする。



<br>

### プライベートサブネット内のFargateからVPC外のAWSリソースへのアクセス

![ecs_vpc-endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_vpc-endpoint.png)

| VPCエンドポイントの接続先 | プライベートDNS名                                                                                | 説明                                         |
|-------------------|--------------------------------------------------------------------------------------------|--------------------------------------------|
| CloudWatchログ      | ```logs.ap-northeast-1.amazonaws.com```                                                    | ECSコンテナのログをPOSTリクエストを送信するため。               |
| ECR               | ```api.ecr.ap-northeast-1.amazonaws.com```<br>```*.dkr.ecr.ap-northeast-1.amazonaws.com``` | イメージのGETリクエストを送信するため。                      |
| S3                | なし                                                                                         | イメージのレイヤーをPOSTリクエストを送信するため                 |
| Systems Manager   | ```ssm.ap-northeast-1.amazonaws.com```                                                     | Systems ManagerのパラメーターストアにGETリクエストを送信するため。 |
| Secrets Manager   | ```ssmmessage.ap-northeast-1.amazonaws.com```                                              | Secrets Managerを使用するため。                    |

プライベートサブネット内のFargateからVPC外のAWSリソース（例：コントロールプレーン、ECR、S3、Systems Manager、CloudWatch、DynamoDB、など）にアクセスする場合、専用のVPCエンドポイントを設け、これに対してアウトバウンド通信を行うようにすると良い。NAT GatewayとVPCエンドポイントの両方を作成している場合、ルートテーブルでは、VPCエンドポイントへのアウトバウンド通信の方が優先される。そのため、NAT Gatewayがある状態でVPCエンドポイントを作成すると、接続先が自動的に変わってしまうことに注意する。注意点として、パブリックネットワークにアウトバウンド通信を送信する場合は、VPCエンドポイントのみでなくNAT Gatewayも作成する必要がある。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/vpc-endpoints.html#ecs-vpc-endpoint-ecsexec
> - https://zenn.dev/yoshinori_satoh/articles/ecs-fargate-vpc-endpoint
> - https://dev.classmethod.jp/articles/vpc-endpoint-gateway-type/

<br>

### Fargate上のコンテナへの接続

#### ▼ セッションマネージャーを使用したECS Exec

![fargate_ecs-exec](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/fargate_ecs-exec.png)

セッションマネージャーを使用してECSタスク内のコンテナに接続し、コンテナのログインシェルを起動する。

Systems Managerを使用してコンテナに接続する場合、コンテナのホストにsystems-managerエージェントをインストールしておく必要がある。

ただし、FargateとしてのEC2インスタンスには、systems-managerエージェントがプリインストールされているため、これは不要である。



> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/ecs-exec.html
> - https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-setting-up-messageAPIs.html
> - https://qiita.com/Shohei_Miwa/items/6e04c9b7f4c0c862eb9e

（１）ECSサービスで、ECS-Execオプションを有効化する。

（２）VPCエンドポイントにて、ssmmessagesエンドポイントを作成する。

（３）ECSタスク実行ロールにIAMポリシーを付与する。これにより、ECSタスクがセッションマネージャーにアクセスできるようになる。

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        # ssmmessages APIへの認可スコープ
        "ssmmessages:CreateControlChannel",
        "ssmmessages:CreateDataChannel",
        "ssmmessages:OpenControlChannel",
        "ssmmessages:OpenDataChannel"
      ],
      "Resource": "*"
    }
  ]
}
```

（４）ECS Execの実行ユーザーに、IAMポリシーを付与する。

```yaml
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecs:ExecuteCommand",
            ],
            "Resource": [
                "arn:aws:ecs:*:<アカウントID>:cluster/*",
                "arn:aws:ecs:*:<アカウントID>:task/*",
            ]
        }
    ]
}
```

（５）事前の設定がなされているか否かをecs-exec-checkerスクリプトを実行して確認する。

> ℹ️ 参考：https://github.com/aws-containers/amazon-ecs-exec-checker

```bash
#!/bin/bash

ECS_CLUSTER_NAME=prd-foo-ecs-cluster
ECS_TASK_ID=bar

bash <(curl -Ls https://raw.githubusercontent.com/aws-containers/amazon-ecs-exec-checker/main/check-ecs-exec.sh) $ECS_CLUSTER_NAME $ECS_TASK_ID
```

（６）ECSタスク内のコンテナに接続し、コンテナのログインシェルを起動する。bashを実行する時に、『```/bin/bash```』や『```/bin/sh```』で指定すると、binより上のパスもECSに送信されてしまう。例えば、Windowsなら『```C:/Program Files/Git/usr/bin/bash```』を送信する。これはCloudTrailでExecuteCommandイベントとして確認できる。ECSコンテナ内ではbashへのパスが異なるため、接続に失敗する。そのため、bashを直接的に指定する。

```bash
#!/bin/bash

set -xe

ECS_CLUSTER_NAME=prd-foo-ecs-cluster
ECS_TASK_ID=bar
ECS_CONTAINER_NAME=laravel

aws ecs execute-command \
    --cluster $ECS_CLUSTER_NAME \
    --task $ECS_TASK_ID \
    --container $ECS_CONTAINER_NAME \
    --interactive \
    --debug \
    --command "bash"
```

<br>

## 03. EKSデータプレーン

### EKS Cluster

#### ▼ EKS Clusterとは

FargateワーカーNodeやEC2ワーカーNodeの管理グループ単位のこと。

KubernetesのClusterに相当する。



> ℹ️ 参考：https://www.sunnycloud.jp/column/20210315-01/

<br>

### セットアップ

#### ▼ コンソール画面

| 設定項目         | 説明                                                   | 補足                                                                                                                                                                                                                                  |
|------------------|--------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 名前             | クラスターの名前を設定する。                                     |                                                                                                                                                                                                                                       |
| Kubernetesバージョン  | EKS上で稼働するKubernetesのバージョンを設定する。                   | EKSが対応できるKubernetesのバージョンは以下を参考にせよ。<br>ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/platform-versions.html                                                                                                          |
| クラスターサービスロール     | EKS Clusterのサービスリンクロールを設定する。                         | ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/service_IAM_role.html                                                                                                                                                        |
| シークレット           | Secretに保持するデータをAWS KMSの暗号化キーで暗号化するか否かを設定する。 |                                                                                                                                                                                                                                       |
| VPC、サブネット        | ENIを配置するサブネットを設定する。                                | 複数のAZにまたがっている必要がある。                                                                                                                                                                                                               |
| クラスターセキュリティグループ  | EKS Clusterのセキュリティグループを設定する。                         | インバウンドとアウトバウンドの両方のルールで、全てのIPアドレスを許可する必要がある。このセキュリティグループは、追加のセキュリティグループとして設定され、別途、AWSによって```eks-cluster-sg-<EKS Cluster名>```というセキュリティグループも自動設定される。<br>ℹ️ 参考：https://yuutookun.hatenablog.com/entry/fargate_for_eks |
| クラスターIPアドレスファミリー |                                                        |                                                                                                                                                                                                                                       |
| CIDRブロック         |                                                        |                                                                                                                                                                                                                                       |
| クラスターエンドポイントアクセス |                                                        |                                                                                                                                                                                                                                       |
| ネットワークアドオン       |                                                        |                                                                                                                                                                                                                                       |
| コントロールプレーンのログ    |                                                        |                                                                                                                                                                                                                                       |

#### ▼ VPC、サブネット

EKSデータプレーンはプライベートサブネットで稼働させ、パブリックネットワーク上のALBからインバウンド通信を受信すると良い。

この時、パブリックネットワークにあるレジストリから、IstioやArgoCDのコンテナイメージをプルできるように、EKS FargateワーカーNodeとInternet Gateway間のネットワークを繋げる必要がある。

そのために、パブリックサブネットにNAT Gatewayを置く。



> ℹ️ 参考：https://aws.amazon.com/jp/blogs/news/de-mystifying-cluster-networking-for-amazon-eks-worker-nodes/

#### ▼ kubectlクライアント

（１）AWS CLIにクレデンシャル情報を設定する。

```bash
$ aws configure
```

（２）EKSのコンテキストを作成する。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/getting-started-console.html

```bash
$ aws eks update-kubeconfig --region ap-northeast-1 --name foo-eks-cluster
```

（３）```kubectl```コマンドの宛先を、EKSのkube-apiserverに変更する。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html#deploy-dashboard

```bash
$ kubectl config use-context arn:aws:eks:ap-northeast-1:<アカウントID>:cluster/<Cluster名>
```


<br>

### プライベートサブネット内のデータプレーンへのVPC外からのインバウンド通信

#### ▼ Podへのインバウンド通信

EKSでは、Podをプライベートサブネットに配置する必要がある。

そのため、パブリックネットワークからのインバウンド通信をAWS LBコントローラーで受信し、ALB Ingressを使用してPodにルーティングする。



> ℹ️ 参考：https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/deploy-a-grpc-based-application-on-an-amazon-eks-cluster-and-access-it-with-an-application-load-balancer.html

![eks_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_architecture.png)

#### ▼ コントロールプレーンへのインバウンド通信

コントロールプレーンでは、```kubectl```コマンドのエンドポイントとしてNLBが配置されている。

VPC外からNLBへの```443```番ポートに対するアクセスはデフォルトでは許可されているが、拒否するように設定できる。

もし拒否した場合、このNLBは閉じられ、VPC内からしか```443```番ポートでコントロールプレーンにアクセスできなくなる。

この状態でコントロールプレーンにアクセスできるようにする方法としては、以下のパターンがある。



> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html#private-access
> - https://note.com/tyrwzl/n/nf28cd4372b18
> - https://zenn.dev/yoshinori_satoh/articles/eks-kubectl-instance

| 接続元パターン           | 接続方法パターン    |
|----------------------|-----------------|
| ローカルマシン              | セッションマネージャー     |
| VPC内の踏み台EC2インスタンス | セッションマネージャー、SSH |
| VPC内のCloud9         | セッションマネージャー、SSH |

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
  # RDS（Aurora）の宛先情報
  DB_HOST_PRIMARY: <プライマリーインスタンスのエンドポイント>
  DB_HOST_READ: <リードレプリカのエンドポイント>
  DB_USER: bar
  DB_PASSWORD: baz
  # SQSの宛先情報
  SQS_QUEUE_NAME: foo-queue.fifo
  SQS_REGION: ap-northeast-1
```

#### ▼ VPC外の他のAWSリソースへのアウトバウンド通信

EKSでは、Podをプライベートサブネットに配置する必要がある。プライベートサブネットにを配置した場合、VPC外にあるAWSリソース（ECR、S3、Systems Manager、CloudWatch、DynamoDB、など）に対してアウトバウンド通信を送信するためには、NAT GatewayまたはVPCエンドポイントを配置する必要がある。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/network_reqs.html

以下のようなエラーでPodが起動しない場合、Podが何らかの理由でイメージをプルできない可能性がある。

また、Podが作成されない限り、ワーカーNodeも作成されないことに注意する。



```log
Pod provisioning timed out (will retry) for pod
```

#### ▼ VPC外のコントロールプレーンへのアウトバウンド通信

EKS Clusterを作成すると、ENIも作成する。これにより、データプレーンがVPC外のコントロールプレーンと通信できるようになる。執筆時点（2022/05/27）では、データプレーンがコントロールプレーンとパケットを送受信するためには、VPCエンドポイントではなくNAT Gatewayを配置する必要がある。

> ℹ️ 参考：
>
> - https://dev.classmethod.jp/articles/eks_basic/
> - https://aws.amazon.com/jp/blogs/news/de-mystifying-cluster-networking-for-amazon-eks-worker-nodes/

#### ▼ VPC内の他のAWSリソースへのアウトバウンド通信

VPC内にあるAWSリソース（RDSなど）の場合、そのAWS側のセキュリティグループにて、PodのプライベートサブネットのCIDRブロックを許可すればよい。

<br>

### マルチワーカーNode

#### ▼ マルチワーカーNodeとは

マルチワーカーNodeを作成する場合、AZごとにNodeを作成する。



> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/eks-networking.html

![eks_multi-node](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_multi-node.png)

#### ▼ ワーカーNode間のファイル共有

EFSを使用して、ワーカーNode間でファイルを共有する。PodのファイルはワーカーNodeにマウントされるため、異なるワーカーNode上のPod間でファイルを共有したい場合（例：PrometheusのローカルストレージをPod間で共有したい）に役立つ。ただしできるだけ、ワーカーNodeをステートフルではなくステートレスにするべきであり、PodのファイルはワーカーNodeの外で管理するべきである。

> ℹ️ 参考：https://blog.linkode.co.jp/entry/2020/07/01/142155

<br>

### デバッグ

#### ▼ ダッシュボード

（１）EKSのコンテキストを作成する。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/getting-started-console.html

```bash
$ aws eks update-kubeconfig --region ap-northeast-1 --name foo-eks-cluster
```

（２）```kubectl```コマンドの宛先を、EKSのkube-apiserverに変更する。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html#deploy-dashboard

```bash
$ kubectl config use-context arn:aws:eks:ap-northeast-1:<アカウントID>:cluster/<Cluster名>
```

（３）マニフェストを使用して、ダッシュボードのKubernetesリソースをEKSにデプロイする。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html#eks-admin-service-account

```bash
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.5/aio/deploy/recommended.yaml
```

（４）ダッシュボードに安全に接続するために、ServiceAccountをEKSにデプロイする

```bash
$ kubectl apply -f service-account.yml
```

（５）トークンの文字列を取得する。

```bash
$ kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep eks-admin | awk '{print $1}')
```

（６）ローカルマシンからEKSにポートフォワーディングを実行する。

```bash
$ kubectl proxy
```

（７）ダッシュボードに接続する。

```yaml
GET http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#!/login HTTP/1.1
```

<br>

## 03-02. on-Fargate（FargateワーカーNode）

### セットアップ

#### ▼ 制約

EC2にはない制約については、以下のリンクを参考にせよ。



> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/fargate.html
> - https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/install-ssm-agent-on-amazon-eks-worker-nodes-by-using-kubernetes-daemonset.html

#### ▼ メトリクス収集

FargateワーカーNode内のメトリクスのデータポイントを収集する上で、FargateワーカーNodeはDaemonSetに非対応のため、メトリクス収集コンテナをサイドカーコンテナとして設置する必要がある。

収集ツールとして、OpenTelemetryをサポートしている。



> ℹ️ 参考：https://aws.amazon.com/jp/blogs/news/introducing-amazon-cloudwatch-container-insights-for-amazon-eks-fargate-using-aws-distro-for-opentelemetry/

#### ▼ ログルーティング

FargateワーカーNode内のログを転送する上で、FargateはDaemonSetに非対応のため、ログ転送コンテナをサイドカーコンテナとして設置する必要がある。

ロググーティングツールとして、FluentBitをサポートしている。



> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/fargate-logging.html

（１）ログ転送コンテナのためのNamespaceを作成する。名前は、必ず```aws-observability```とする。

> ℹ️ 参考：https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: aws-observability
  labels:
    aws-observability: enabled
```

（２）```aws-observability```内で```aws-logging```という名前のConfigMapを作成することにより、ログ転送コンテナとしてFluentBitコンテナが作成され、PodからCloudWatchログにログを送信できるようになる。名前は、必ず```aws-logging```とする。

> ℹ️ 参考：https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/

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

（３）FargateワーカーNodeにECRやCloudWatchへの認可スコープを持つポッド実行ロールを付与しておく。これにより、KubernetesリソースにAWSへの認可スコープが付与され、ServiceAccountやSecretを作成せずとも、PodがECRからコンテナイメージをプルできる様になる。一方で、Pod内のコンテナには認可スコープが付与されないため、Podが作成された後に必要な認可スコープ（例：コンテナがRDSにアクセスする認可スコープなど）に関しては、ServiceAccountとIAMロールの紐付けが必要である。

> ℹ️ 参考：
>
> - https://nishipy.com/archives/1122
> - https://toris.io/2021/01/how-kubernetes-pulls-private-container-images-on-aws/
> - https://docs.aws.amazon.com/eks/latest/userguide/fargate-getting-started.html
> - https://kumano-te.com/activities/apply-iam-roles-to-eks-service-accounts
> - https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/

<br>

### FargateワーカーNode

#### ▼ FargateワーカーNodeとは

![eks_on_fargate](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_on_fargate.png)

Fargate上で稼働するKubernetesのホストのこと。

KubernetesのワーカーNodeに相当する。

EC2ワーカーNodeと比べてカスタマイズ性が低く、ワーカーNode当たりで稼働するPod数はAWSが管理する。

一方で、各EC2のハードウェアリソースの消費量をユーザーが管理しなくてもよいため、Kubernetesのホストの管理が楽である。

以下の場合は、EC2ワーカーNodeを使用するようにする。



- DaemonSetが必要
- Fargateで設定可能な最大スペックを超えたスペックが必要
- emptyDirボリューム以外が必要

> ℹ️ 参考：
>
> - https://www.sunnycloud.jp/column/20210315-01/
> - https://aws.amazon.com/jp/blogs/news/using-alb-ingress-controller-with-amazon-eks-on-fargate/
> - https://qiita.com/mumoshu/items/c9dea2d82a402b4f9c31#managed-node-group%E3%81%A8eks-on-fargate%E3%81%AE%E4%BD%BF%E3%81%84%E5%88%86%E3%81%91

#### ▼ Fargateプロファイル

Fargateを設定する。



> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/fargate-profile.html#fargate-profile-components

| コンポーネント名          | 説明                                                                     | 補足                                                                                                                                                                                                                                       |
|--------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Pod実行ロール         | kubeletがAWSリソースにアクセスできるように、Podにロールを設定する。                               | ・実行ポリシー（AmazonEKSFargatePodExecutionRolePolicy）には、ECRへの認可スコープのみが付与されている。<br>・信頼されたエンティティでは、```eks-fargate-pods.amazonaws.com```を設定する必要がある。<br>ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/pod-execution-role.html |
| サブネット              | EKS FargateワーカーNodeが起動するサブネットIDを設定する。                                | プライベートサブネットを設定する必要がある。                                                                                                                                                                                                                 |
| ポッドセレクタ（Namespace） | EKS FargateワーカーNodeにスケジューリングするPodを固定できるように、PodのNamespaceの値を設定する。    | ・```kube-system```や```default```を指定するKubernetesリソースが稼働できるように、ポッドセレクタにこれを追加する必要がある。<br>・IstioやArgoCDを、それ専用のNamespaceで稼働させる場合は、そのNamespaceのためのプロファイルを作成しておく必要がある。                                                          |
| ポッドセレクタ（Label）     | EKS FargateワーカーNodeにスケジューリングするPodを固定できるように、Podの任意のlabelキーの値を設定する。 |                                                                                                                                                                                                                                            |

<br>

## 03-03. on-EC2（EC2ワーカーNode）

### EC2ワーカーNode

#### ▼ EC2ワーカーNodeとは

![eks_on_ec2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_on_ec2.png)

EC2で稼働するKubernetesのホストのこと。

Fargateと比べてカスタマイズ性が高く、ワーカーNode当たりで稼働するPod数に重み付けを設定できる。

一方で、各EC2のハードウェアリソースの消費量をユーザーが管理しなければならないため、Kubernetesのホストの管理が大変である。



> ℹ️ 参考：https://www.sunnycloud.jp/column/20210315-01/

<br>

### EC2ワーカーNodeの最適化AMI

#### ▼ EC2ワーカーNodeの最適化AMIとは

任意のEC2ワーカーNodeを使用できるが、AWSが用意している最適化AMIを選んだ方が良い。このAMIには、EC2がEKSと連携するために必要なソフトウェアがプリインストールされており、EC2ワーカーNodeをセットアップする手間が省ける。必ずしも、全てのEC2ワーカーNodeを同じAMIで構築する必要はない。EC2ワーカーNodeを種類ごとに異なるAMIで作成し、特定のアプリを含むPodは特定のEC2ワーカーNodeにスケジューリングする（例：計算処理系アプリはEKS最適化高速AMIのEC2ワーカーNode上で動かす）といった方法でもよい。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/eks-optimized-ami.html

| AMI名                       | 説明                                                | 特に相性の良いPod                                           | 補足                                                                                                                                                                 |
|----------------------------|---------------------------------------------------|----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| EKS 最適化 Amazon Linux     | EKSのための標準的なEC2インスタンスを作成できる。最も推奨。            |                                                          | ℹ️ 参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/eks-optimized-ami.html                                                                                |
| EKS 最適化高速 Amazon Linux | GPUが搭載されたEC2インスタンスやAmazon EC2 Inf1インスタンスを作成できる。 | GPUが必要なアプリケーションの含むPod（計算処理系、機械学習系のアプリケーション） |                                                                                                                                                                      |
| EKS 最適化 Arm Amazon Linux | Armベースのプロセッサーが搭載されたEC2インスタンスを作成できる。             |                                                          |                                                                                                                                                                      |
| EKS 最適化 Bottlerocket AMI | コンテナに特化したEC2インスタンスを作成できる。                       |                                                          | ℹ️ 参考：<br>・https://dev.classmethod.jp/articles/bottlerocket/#toc-1 <br>・https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/eks-optimized-ami-bottlerocket.html |

<br>

### EC2ワーカーNodeのカスタムAMI

#### ▼ EC2ワーカーNodeのカスタムAMIとは

EC2ワーカーNodeの最適化AMIではないAMIのこと。

EC2ワーカーNodeのAMIにカスタムAMIを使用する場合、EC2ワーカーNode起動時のユーザーデータ内で、```bootstrap.sh```ファイルに決められたパラメーターを渡す必要がある。

注意点として、最適化AMIにはデフォルトでこれらのパラメーターが設定されているため、設定は不要である。



> ℹ️ 参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/eks-worker-nodes-cluster/

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



> ℹ️ 参考：
>
> - https://qiita.com/th_/items/8ffb28dd6d27779a6c9d
> - https://garafu.blogspot.com/2020/08/ec2-set-env-from-paramstore.html

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

#### ▼ EC2ワーカーNodeのイメージキャッシュ削除

kubeletのガベージコレクションを使用して、イメージキャッシュを削除する。```--image-gc-high-threshold```オプションで、キャッシュ削除の閾値とするディスク使用率を設定する。```--image-gc-low-threshold```オプションで解放しようとするディスク使用率を設定する。

> ℹ️ 参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/eks-worker-nodes-image-cache/

**＊実装例＊**

ディスク使用率が```70```%を超過した場合に、ディスク使用率```50```%分を解放する。



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


#### ▼ 安全なEC2ワーカーNodeシャットダウン

kubeletを使用してワーカーNodeの停止を待機し、Podが終了する（ワーカーNodeを退避する）までの時間を稼ぐ。待機中に終了できたPodは```Failed```ステータスとなる。```--shutdown-grace-period```オプションで、ワーカーNodeの停止を待機する期間を設定する。```--shutdown-grace-period-critical-pods```オプションで、特に重要なPodの終了のために待機する時間を設定する。

> ℹ️ 参考：
>
> - https://blog.skouf.com/posts/enabling-graceful-node-shutdown-on-eks-in-kubernetes-1-21/
> - https://kubernetes.io/docs/concepts/architecture/nodes/#graceful-node-shutdown

**＊実装例＊**


ワーカーNodeの停止を```6```分だけ待機し、その後に停止を始める。

```6```分のうち後半```2```分を重要なPodのために停止に割り当てる。



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

```Failed```ステータスのPodはそのままでは削除できないため、以下のようなスクリプトを実行できるCronJobを作成するとよい。



> ℹ️ 参考：https://github.com/yteraoka/terminated-pod-cleaner/blob/main/chart/templates/cronjob.yaml#L33-L36

```bash
for ns in $(kubectl get namespace -o name | cut -d / -f 2); do
  echo $ns
  kubectl get pods -n $ns -o json \
    | jq -r '.items[] | select(.status.phase == "Failed") | select(.status.reason == "Shutdown" or .status.reason == "NodeShutdown" or .status.reason == "Terminated") | .metadata.name' \
    | xargs --no-run-if-empty --max-args=100 --verbose kubectl -n $ns delete pods
done
```

<br>


### EC2へのタグ付けの例

#### ▼ マネージドNodeグループ

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/launch-templates.html

| タグ         | 値               | 説明                                                                                                                                                       |
|------------|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```Name``` | EC2ワーカーNodeの名前 | Nodeグループで指定する起動テンプレートのリソースタグに、```Name```タグを設定しておく。起動するEC2ワーカーNodeにEC2インスタンスの名前は```Name```タグで決まる仕組みのため、起動テンプレートによってワーカーNode名を設定させることができる。 |

#### ▼ セルフマネージドNodeグループ

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/worker.html

| タグ                                    | 値               | 説明                                                                                                    |
|---------------------------------------|------------------|-------------------------------------------------------------------------------------------------------|
| ```Name```                            | EC2ワーカーNodeの名前 | EC2インスタンスの名前は```Name```タグで決まる仕組みのため、Nodeグループに参加させるEC2ワーカーNodeの```Name```タグに、ワーカーNode名を設定しておく。 |
| ```kubernetes.io/cluster/<クラスター名>``` | ```owned```      | セルフマネージド型のEC2ワーカーNodeを使用する場合、ユーザーが作成したEC2インスタンスをNodeグループに参加させるために、必要である。                     |

#### ▼ その他

| アドオン名             | タグ                                        | 値          | 説明                                                                                                                                                        |
|--------------------|-------------------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| cluster-autoscaler | ```k8s.io/cluster-autoscaler/<クラスター名>``` | ```owned``` | cluster-autoscalerを使用する場合、cluster-autoscalerがEC2ワーカーNodeを検出するために必要である。<br>ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/autoscaling.html |
| 同上               | ```k8s.io/cluster-autoscaler/enabled```   | ```true```  | 同上                                                                                                                                                        |

<br>



## 04. Nodeグループ on-EC2

### マネージド

#### ▼ マネージドNodeグループ

Nodeグループ内の各EC2ワーカーNodeと、Nodeグループごとのオートスケーリングの設定を、自動的にセットアップする。

オートスケーリングは、EC2ワーカーNodeが配置される全てのプライベートサブネットに適用される。



#### ▼ Nodeのセットアップ方法

起動テンプレートを使用し、EC2ワーカーNodeを作成する。

EC2にタグ付けする場合は、起動テンプレートのタグ付け機能を使用する。



#### ▼ タグ付けを使用した

同じNodeグループのEC2ワーカーNodeの定期アクションを設定する。

EKSのテスト環境の請求料金を節約するために、昼間に通常の個数にスケールアウトし、夜間に```0```個にスケールインするようにすれば、ワーカーNodeを夜間だけ停止させられる。



> ℹ️ 参考：
> 
> - https://docs.aws.amazon.com/eks/latest/userguide/managed-node-groups.html
> - https://blog.framinal.life/entry/2020/07/19/044328#%E3%83%9E%E3%83%8D%E3%83%BC%E3%82%B8%E3%83%89%E5%9E%8B%E3%83%8E%E3%83%BC%E3%83%89%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97

<br>

### セルフマネージド

#### ▼ セルフマネージドNodeグループ

Nodeグループ内の各EC2ワーカーNodeと、Nodeグループごとのオートスケーリングの設定を、手動でセットアップする。



#### ▼ Nodeのセットアップ方法

任意のオートスケーリングでEC2ワーカーNodeを作成する。オートスケーリングのタグ付け機能で、```kubernetes.io/cluster/<クラスター名>```タグをつけ、Nodeグループに参加させる。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/worker.html
> - https://docs.aws.amazon.com/eks/latest/userguide/launch-workers.html

<br>


## 05. Nodeグループ on-Fargate

調査中...


<br>
