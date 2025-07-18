---
title: 【IT技術の知見】AWS ECS＠AWSリソース
description: AWS ECS＠AWSリソースの知見を記録しています。
---

# AWS ECS＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS ECS：Elastic Container Service

### コントロールプレーン

#### ▼ コントロールプレーンとは

コンテナオーケストレーションを実行する環境を提供する。

データプレーンのVPC外に存在している。

#### ▼ コントロールプレーンの仕組み

AWS ECSのコントロールプレーンは、開発者や他のAWSリソースからのリクエストを待ち受けるAPI、データプレーンを管理するコンポーネント、からなる。

![ecs_control-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_control-plane.png)

> - https://aws.amazon.com/jp/blogs/news/under-the-hood-amazon-elastic-container-service-and-aws-fargate-increase-task-launch-rates/

<br>

### データプレーン

単一のホスト (AWS EC2、AWS Fargate) のOS上でコンテナオーケストレーションを実行する。

『`on EC2`』『`on Fargate`』という呼び方は、データプレーンがAWS ECSの実行環境 (`on environment`) の意味合いを持つからである。

<br>

### EKSとの機能比較

| ECSの機能                                  | EKSで相当する機能                              |
| ------------------------------------------ | ---------------------------------------------- |
| AWS ECSサービス + AWS ECSタスク            | Deployment                                     |
| Daemon型のAWS ECSサービス                  | DaemonSet                                      |
| Replica型のAWS ECSサービス                 | ReplicaSet                                     |
| なし                                       | StatefulSet                                    |
| AWS ECSタスク                              | Pod                                            |
| ELB                                        | Ingress + Service                              |
| AWS ECSタスクの環境変数                    | ConfigMap                                      |
| AWS Secrets Manager                        | Secret                                         |
| Taskスケーリング                           | HorizontalPodAutoscaler、VerticalPodAutoscaler |
| キャパシティプロバイダー + AWS AutoScaling | CusterAutoscaler、Karpenter                    |
| PodDisruptionBudget                        | Minimum/Maximum Healthy Percent                |
| AWS VPC Lattice、AWS ECS Service Connect   | Istio                                          |

<br>

## 02. コントロールプレーンのコンポーネント

記入中...

<br>

## 03. データプレーンのコンポーネント

### AWS ECSクラスター

AWS ECSサービスの管理グループ単位のこと。

![ecs_cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_cluster.png)

> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/clusters.html

<br>

### AWS ECSサービス

AWS ECSタスクの管理グループ単位のこと。

AWS ECSタスクへのロードバランシング、タスクの数の維持管理や、リリースの成否の管理を実行する。

マイクロサービスは、AWS ECSサービスを単位として作成する。

> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/service_definition_parameters.html

<br>

### AWS ECSタスク

#### ▼ AWS ECSタスク

コンテナインスタンスの管理グループ単位のこと。

AWS ECSタスク定義を基に作成される。

![ecs_task](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_task.png)

#### ▼ AWS ECSコンテナエージェント

AWS ECSタスク実行ロールを使用して、AWS ECSタスクのライフサイクルを管理する。

Fargateの場合、ECSコンテナエージェントがプリインストールされている。

![ecs_task-execution-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_task-execution-role.png)

> - https://dev.classmethod.jp/articles/ecs_ec2_iamrole/
> - https://aws.amazon.com/jp/blogs/news/under-the-hood-task-networking-for-amazon-ecs/

#### ▼ AWS ECSタスク定義

AWS ECSタスクをどのような設定値を基に作成するかを設定できる。

AWS ECSタスク定義は、バージョンを示す『リビジョンナンバー』で番号づけされる。

AWS ECSタスク定義を削除するには、全てのリビジョンのAWS ECSタスク定義を登録解除する必要がある。

#### ▼ AWS ECSタスクのライフサイクルフェーズ

![ecs_task_lifecycle_phase](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_task_lifecycle_phase.png)

AWS ECSタスクのライフサイクルにはフェーズがある。

AWS ECSタスクは、必須コンテナ異常停止時、デプロイ、オートスケーリング、手動操作、の時にフェーズを持つ。

| フェーズ名      | 説明                                                                                                 | 補足                                                                                                                                                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Provisioning    | AWS ECSタスクの起動前に必要な準備 (例：ENIの紐付け) があり、これが完了していない。                   |                                                                                                                                                                                                                                    |
| Pending         | AWS ECSタスク内のコンテナの起動がまだ完了していない。                                                |                                                                                                                                                                                                                                    |
| Activating      | AWS ECSタスク内の全てのコンテナの起動が完了したが、AWS ECSタスク全体のセットアップは完了していない。 |                                                                                                                                                                                                                                    |
| Running         | AWS ECSタスク内の全てのコンテナの起動とAWS ECSタスク全体の準備が完了し、実行中である。               | コンテナの起動が完了すれば`Running`フェーズになるが、コンテナ内でビルトインサーバーを起動するようなアプリケーション (例：フレームワークのビルトインサーバー機能) の場合は、`Running`フェーズであっても使用できないことに注意する。 |
| De-activating   | AWS ECSタスク内のコンテナを停止する前に必要な処理があり、これが完了していない。                      |                                                                                                                                                                                                                                    |
| Stopping        | AWS ECSタスク内のコンテナが正常/異常に停止しようとしている途中である。                               |                                                                                                                                                                                                                                    |
| De-provisioning | AWS ECSタスク全体を停止する前に必要な準備 (例：ENIの解除) があり、これが完了していない。             |                                                                                                                                                                                                                                    |
| Stopped         | AWS ECSタスク全体が停止した。                                                                        | 正常停止と異常停止に関わらず、停止理由を確認できる。<br>https://docs.aws.amazon.com/AmazonECS/latest/developerguide/stopped-task-errors.html                                                                                       |

> - https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-lifecycle.html#lifecycle-states

<br>

## 03-02. ネットワーク

### AWS ECSタスク内のコンテナ間通信

#### ▼ noneモード

外部ネットワークが無く、タスクと外と通信できない。

#### ▼ hostモード

EC2のみで使用できる。

Dockerのhostネットワークに相当する。

![network-mode_host-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network-mode_host-mode.png)

> - https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-networkmode.html#networking-networkmode-host

#### ▼ bridgeモード

EC2のみで使用できる。

Dockerのbridgeネットワークに相当する。

![network-mode_host-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network-mode_host-mode.png)

> - https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-networkmode.html#networking-networkmode-bridge

#### ▼ awsvpcモード

FargateとEC2の両方で使用できるawsの独自ネットワークモード。

タスクはElastic Networkインターフェースと紐付けられ、コンテナではなくタスク単位でプライベートIPアドレスが割り当てられる。

Fargateの場合、同じタスクに属するコンテナ間は、localhostインターフェイスというENI経由で通信できるようになる (推測ではあるが、FargateとしてのEC2にlocalhostインターフェースが紐付けられる) 。

これにより、コンテナ間でパケットを送受信する時 (例：NginxコンテナからPHP-FPMコンテナへのルーティング) は、通信元コンテナにて、通信先のアドレスを『localhost (`127.0.0.1`) 』で指定すれば良い。

また、awsvpcモードの独自の仕組みとして、同じAWS ECSタスク内であれば、互いにコンテナポートを開放せずとも、通信を待ち受けるポートを指定するのみで、コンテナ間でパケットを送受信できる。

例えば、NginxコンテナからPHP-FPMコンテナにリクエストをルーティングするためには、PHP-FPMプロセスが`9000`番ポートでリクエストを受信し、加えてコンテナが`9000`番ポートを開放する必要がある。

しかし、awsvpcモードではコンテナポートを開放する必要はない。

![network-mode_awsvpc](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network-mode_awsvpc.png)

> - https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-networkmode.html#networking-networkmode-awsvpc
> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/fargate-task-networking.html

<br>

### AWS ECSサービス間の通信

AWS ECS Service Connectを使用する。

> - https://zenn.dev/cadp/articles/ecs-service-mesh-compare

<br>

### AWS ECSタスクからのアウトバウンド

#### ▼ プライベートサブネット内のデータプレーンの配置

プライベートサブネット内にデータプレーンを配置した場合、パブリックネットワークやVCP外のAWSリソースにリクエストを送信するために、AWS NAT GatewayやVPCエンドポイントが必要になる。

パブリックサブネットに配置すればこれらは不要となるが、パブリックサブネットよりもプライベートサブネットにデータプレーンを配置する方が望ましい。

#### ▼ パブリックネットワークに対する通信

データプレーンをプライベートサブネットに配置した場合、パブリックネットワークに対してリクエストを送信するためには、AWS NAT Gatewayを配置する必要がある。

#### ▼ VPC外のAWSリソースに対する通信

データプレーンをプライベートサブネットに配置した場合、VPC外にあるAWSリソース (例：コントロールプレーン、AWS ECR、AWS S3、AWS Systems Manager、AWS CloudWatch Logs、DynamoDBなど) に対してリクエストを送信するためには、AWS NAT GatewayあるいはVPCエンドポイントを配置する必要がある。

もしAWS NAT Gatewayを配置したとする。

この場合、VPCエンドポイントよりもAWS NAT Gatewayの方が高く、AWSリソースに対する通信でもAWS NAT Gatewayを通過するため、高額料金を請求されてしまう。

![ecs_nat-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_nat-gateway.png)

> - https://zenn.dev/yoshinori_satoh/articles/ecs-fargate-vpc-endpoint

代わりに、VPCエンドポイントを配置する。

より低額でデータプレーンがVPC外のAWSリソースのリクエストできるようになる。

![ecs_control-plane_vpc-endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_control-plane_vpc-endpoint.png)

> - https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-connecting-vpc.html#networking-connecting-privatelink

<br>

## 03-03. セキュリティ

### ロール

#### ▼ サービスロール

AWS ECSサービスがAWS ECSタスクを操作するために必要なロールである。

サービスリンクロールに含まれ、ECSの作成時に自動的に紐付けられる。

> - https://dev.classmethod.jp/articles/ecs_fargate_iamrole/
> - https://dev.classmethod.jp/articles/ecs_ec2_iamrole/

#### ▼ コンテナインスタンスロール

コンテナのホストが他のAWSリソースにリクエストを送信するために必要なロールである。

Fargateの場合、不要である。

![ecs_container-instance-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_container-instance-role.png)

> - https://dev.classmethod.jp/articles/ecs_fargate_iamrole/
> - https://dev.classmethod.jp/articles/ecs_ec2_iamrole/

#### ▼ タスクロール

AWS AWS ECSタスク内のコンテナのアプリケーションが、他のAWSリソースにリクエストを送信するために必要なロールである。

アプリケーションにAWS S3やAWS Systems Managerへの認可スコープを与えたい場合は、タスク実行ロールではなくタスクロールに認可スコープを紐付ける。

![ecs_task-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_task-role.png)

> - https://dev.classmethod.jp/articles/ecs_fargate_iamrole/
> - https://dev.classmethod.jp/articles/ecs_ec2_iamrole/

**＊実装例＊**

アプリケーションからAWS CloudWatch Logsにログを送信するために、AWS ECSタスクロールにカスタマー管理ポリシーを紐付ける。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Action": ["logs:CreateLogStream", "logs:PutLogEvents"],
        "Resource": ["arn:aws:logs:*:*:*"],
      },
    ],
}
```

**＊実装例＊**

パラメーターストアから変数を取得するために、AWS ECSタスクロールにインラインポリシーを紐付ける。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [{"Effect": "Allow", "Action": ["ssm:GetParameters"], "Resource": "*"}],
}
```

#### ▼ タスク実行ロール

![ecs_task-execution-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_task-execution-role.png)

AWS ECSタスク内のECSコンテナエージェントが、他のAWSリソースにリクエストを送信するために必要なロールのこと。

AWS管理ポリシーである『`AmazonECSTaskExecutionRolePolicy`』が紐付けられたロールを、タスクに紐付ける必要がある。

このポリシーには、AWS ECRへの認可スコープの他、AWS CloudWatch Logsにログを作成するための認可スコープが設定されている。

AWS ECSタスク内のコンテナがリソースにリクエストを送信するために必要なタスクロールとは区別すること。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Action":
          [
            "ecr:GetAuthorizationToken",
            "ecr:BatchCheckLayerAvailability",
            "ecr:GetDownloadUrlForLayer",
            "ecr:BatchGetImage",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
          ],
        "Resource": "*",
      },
    ],
}
```

**＊実装例＊**

datadogエージェントがECSクラスターやコンテナにリクエストを送信できるように、AWS ECSタスク実行ロールにカスタマー管理ポリシーを紐付ける。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Action":
          [
            "ecs:ListClusters",
            "ecs:ListContainerInstances",
            "ecs:DescribeContainerInstances",
          ],
        "Effect": "Allow",
        "Resource": "*",
      },
    ],
}
```

> - https://dev.classmethod.jp/articles/ecs_fargate_iamrole/
> - https://dev.classmethod.jp/articles/ecs_ec2_iamrole/

<br>

## 03-04. 監視

### ログ

#### ▼ awslogsドライバー

標準出力/標準エラー出力に出力されたログをCloudWatch-APIに送信する。

| 設定項目                  | 説明                                                                                   | 補足                                                                                                                                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `awslogs-group`           | ログ宛先のAWS CloudWatch Logsのロググループを設定する。                                |                                                                                                                                                                                                                                |
| `awslogs-datetime-format` | 日時フォーマットを定義し、加えてこれをログの区切り単位としてログストリームに出力する。 | 正規表現で設定する必要があり、加えてJSONでは『`\`』を『`\\`』にエスケープしなければならない。例えば『`\\[%Y-%m-%d %H:%M:%S\\]`』となる。<br>https://docs.docker.com/config/containers/logging/awslogs/#awslogs-datetime-format |
| `awslogs-region`          | ログ宛先のAWS CloudWatch Logsのリージョンを設定する。                                  |                                                                                                                                                                                                                                |
| `awslogs-stream-prefix`   | ログ宛先のAWS CloudWatch Logsのログストリームのプレフィックス名を設定する。            | ログストリームには、『`<プレフィックス名>/<コンテナ名>/<タスクID>`』の形式で送信される。                                                                                                                                       |

> - https://docs.docker.com/config/containers/logging/awslogs/
> - https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html#create_awslogs_logdriver_options

<br>

## 04. on EC2

### on EC2とは

EC2をホストとして、コンテナを作成する。

<br>

### EC2の最適化AMI

任意のEC2を使用できるが、AWSが用意している最適化AMIを選んだ方が良い。

このAMIには、EC2がECSと連携するために必要なソフトウェアがプリインストールされており、EC2をセットアップする手間が省ける。

| AMI名                          | 説明                                                                                                                              | 特に相性の良いアプリ                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ECS最適化 Amazon Linux 2       | ECSのための標準的なEC2を作成できる。最も推奨。                                                                                    |                                                                        |
| ECS最適化 Amazon Linux 2022    | Amazon Linux 2よりも先進的な機能を持つEC2を作成できる。<br>https://docs.aws.amazon.com/linux/al2022/ug/compare-al2-to-AL2022.html |                                                                        |
| ECS最適化 Amazon Linux         | ECSのための標準的なEC2を作成できる。非推奨であり、Amazon Linux 2を使用した方が良い。                                              |                                                                        |
| ECS最適化 Amazon Linux 2 arm64 | arm64ベースのGravitonプロセッサーが搭載されたEC2を作成できる。                                                                    |                                                                        |
| ECS最適化 Amazon Linux 2 GPU   | GPUが搭載されたEC2を作成できる。                                                                                                  | GPUが必要なアプリケーション (計算処理系、機械学習系のアプリケーション) |
| ECS最適化 Amazon Linux 2 推定  | Amazon EC2 Inf1インスタンスを作成できる。                                                                                         |                                                                        |

> - https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI.html

<br>

### タスク配置戦略

AWS ECSタスクをECSクラスターに配置する時のアルゴリズムを選択できる。

| 戦略    | 説明                                                 |
| ------- | ---------------------------------------------------- |
| Spread  | AWS ECSタスクを各場所にバランスよく配置する          |
| Binpack | AWS ECSタスクを`1`個の場所にできるだけ多く配置する。 |
| Random  | AWS ECSタスクをランダムに配置する。                  |

<br>

## 05. on Fargate

### on Fargateとは

Fargateをホストとして、コンテナを作成する。

Fargateの実体はEC2である (ドキュメントに記載がないが、AWSサポートに確認済み) 。

![fargate_data-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fargate_data-plane.png)

> - https://aws.amazon.com/jp/blogs/news/under-the-hood-fargate-data-plane/

<br>

## 05-02. セットアップ

### コンソール画面の場合

#### ▼ AWS ECSサービス

| 設定項目                     | 説明                                                                                                                                                                                     | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS ECSタスク定義            | AWS ECSサービスで維持管理するタスクの定義ファミリー名とリビジョンを設定する。                                                                                                            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 起動タイプ                   | AWS ECSタスク内のコンテナの起動タイプを設定する。                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| プラットフォームのバージョン | Fargateのカーネルとコンテナランタイムのバージョンを設定する。                                                                                                                            | バージョンによって、連携できるAWSリソースが異なる。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| サービスタイプ               |                                                                                                                                                                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| AWS ECSタスクの必要数        | 非スケーリング時またはデプロイ時のタスク数を設定する。                                                                                                                                   | 最小ヘルス率と最大率の設定値に影響する。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 最小ヘルス率                 | AWS ECSタスクの必要数の設定を`100`%とし、新しいタスクのデプロイ時に、稼働中タスクの最低合計数を割合で設定する。                                                                          | 例として、タスク必要数が4個だと仮定する。タスクヘルス最小率を50%とすれば、稼働中タスクの最低合計数は2個となる。デプロイ時の既存タスク停止と新タスク起動では、稼働中の既存タスク/新タスクの数が最低合計数未満にならないように制御される。<br>https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments                                                                                                                                                                                                                                                           |
| 最大率                       | AWS ECSタスクの必要数の設定を`100`%とし、新しいタスクのデプロイ時に、稼働中/停止中タスクの最高合計数を割合で設定する。                                                                   | 例として、タスク必要数が4個だと仮定する。タスク最大率を200%とすれば、稼働中/停止中タスクの最高合計数は８個となる。デプロイ時の既存タスク停止と新タスク起動では、稼働中/停止中の既存タスク/新タスクの数が最高合計数を超過しないように制御される。<br>https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments                                                                                                                                                                                                                                                   |
| ヘルスチェックの待機期間     | デプロイ時のALB/NLBのヘルスチェックを開始するまでの待機時間を設定する。猶予期間を過ぎても、ALB/NLBのヘルスチェックが失敗していれば、サービスはタスクを停止し、新しいタスクを再起動する。 | ALB/NLBではターゲットを登録し、ヘルスチェックを実行するプロセスがある。特にNLBでは、これに時間がかかる。またアプリケーションによっては、コンテナの作成に時間がかかる。そのため、NLBのヘルスチェックが完了する前に、AWS ECSサービスがNLBのヘルスチェックの結果を確認してしまうことがある。例えば、NLBとLaravelを使用する場合は、ターゲット登録とLaravelコンテナの築の時間を加味して、`330`秒以上を目安とする。例えば、ALBとNuxt.js (SSRモード) を使用する場合は、`600`秒以上を目安とする。注意点として、アプリコンテナ作成にかかる時間は、開発環境での所要時間を参考にする。 |
| タスクの最小数               | スケーリング時のタスク数の最小数を設定する。                                                                                                                                             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| タスクの最大数               | スケーリング時のタスク数の最大数を設定する。                                                                                                                                             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ロードバランシング           | ALBでルーティングするコンテナを設定する。                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| タスク数                     | AWS ECSタスクの作成数をいくつに維持するかを設定する。                                                                                                                                    | タスクが何らかの原因で停止した場合、タスクを自動的に作成する。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| デプロイメント               | ローリングアップデート、ブルー/グリーンデプロイがある。                                                                                                                                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| サービスロール               |                                                                                                                                                                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

#### ▼ AWS ECSタスク定義

| 設定項目                           | 説明                                                                                                               | 補足                                                                                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AWS ECSタスク定義名                | AWS ECSタスク定義の名前を設定する。                                                                                |                                                                                                                                                                                     |
| ネットワークモード                 | ホストとコンテナ間を接続するネットワーク様式を設定する。                                                           |                                                                                                                                                                                     |
| 互換性                             |                                                                                                                    |                                                                                                                                                                                     |
| オペレーティングシステムファミリー |                                                                                                                    |                                                                                                                                                                                     |
| タスクロール                       | AWS ECSタスク内のコンテナのアプリケーションが、他のAWSリソースにリクエストを送信するために必要なロールを設定する。 |                                                                                                                                                                                     |
| タスク実行ロール                   | AWS ECSタスク内のECSコンテナエージェントが、他のAWSリソースにリクエストを送信するために必要なロールを設定する。    |                                                                                                                                                                                     |
| タスクメモリ                       | AWS ECSタスク当たりのコンテナの合計メモリサイズを設定する。                                                        | AWS ECSタスク内のコンテナに割り振ることを想定し、やや多めにメモリを設定した方が良い。                                                                                               |
| タスクCPU                          | AWS ECSタスク当たりのコンテナの合計CPUサイズを設定する。                                                           | ・AWS ECSタスク内のコンテナに割り振ることを想定し、やや多めにメモリを設定した方が良い。<br>・CPUごとに使用できるメモリサイズに違いがあり、大きなCPUほど小さなメモリを使用できない。 |
| コンテナ定義                       | AWS ECSタスク内のコンテナを設定する。                                                                              | JSONをインポートしても設定できる。                                                                                                                                                  |
| サービス統合                       |                                                                                                                    |                                                                                                                                                                                     |
| プロキシ                           |                                                                                                                    |                                                                                                                                                                                     |
| FireLens統合                       | FireLensコンテナを使用する場合に有効化する。                                                                       |                                                                                                                                                                                     |
| ボリューム                         |                                                                                                                    |                                                                                                                                                                                     |

#### ▼ コンテナ定義

AWS ECSタスク内のコンテナ1つに対して、環境を設定する。

| 設定項目                        | 対応する`docker`コマンドオプション  | 説明                                                                                                                                                                                                                                                                         | 補足                                                                                                                                                                                                    |
| ------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cpu                             | `--cpus`                            | タスク全体に割り当てられたメモリ (タスクメモリ) のうち、該当のコンテナに最低限割り当てるCPUユニット数を設定する。cpuReservationという名前になっていないことに注意する。 CPUユニット数の比率に基づいて、タスク全体のCPUが各コンテナに割り当てられる。『ソフト制限』ともいう。 | ・https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_environment <br>・https://qiita.com/_akiyama_/items/e9760dd61d94b8031247             |
| dnsServers                      | `--dns`                             | コンテナが名前解決に使用するDNSサーバーのIPアドレスを設定する。                                                                                                                                                                                                              |                                                                                                                                                                                                         |
| essential                       |                                     | コンテナが必須か否かを設定する。                                                                                                                                                                                                                                             | ・`true`の場合、コンテナが停止すると、タスクに含まれる全コンテナが停止する。<br>`false`の場合、コンテナが停止しても、その他のコンテナは停止しない。                                                     |
| healthCheck<br>(command)        | `--health-cmd`                      | ホストからFargateに対して、`curl`コマンドによるリクエストを送信し、レスポンス内容を確認。                                                                                                                                                                                    |                                                                                                                                                                                                         |
| healthCheck<br>(interval)       | `--health-interval`                 | ヘルスチェックの間隔を設定する。                                                                                                                                                                                                                                             |                                                                                                                                                                                                         |
| healthCheck<br>(retries)        | `--health-retries`                  | ヘルスチェックを成功と見なす回数を設定する。                                                                                                                                                                                                                                 |                                                                                                                                                                                                         |
| hostName                        | `--hostname`                        | コンテナにホスト名を設定する。                                                                                                                                                                                                                                               |                                                                                                                                                                                                         |
| image                           |                                     | AWS ECRのURLを設定する。                                                                                                                                                                                                                                                     | 指定できるURLの記法は、Dockerfileの`FROM`処理と同じである。<br>https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_docker_dockerfile.html                           |
| logConfiguration<br>(logDriver) | `--log-driver`                      | ログドライバーを指定することにより、ログの出力先を設定する。                                                                                                                                                                                                                 | Dockerのログドライバーにおおよそ対応しており、Fargateであれば『awslogs、awsfirelens、splunk』に設定できる。EC2であれば『awslogs、json-file、syslog、journald、fluentd、gelf、logentries』を設定できる。 |
| logConfiguration<br>(options)   | `--log-opt`                         | 各ログドライバーのオプションを設定する。                                                                                                                                                                                                                                     |                                                                                                                                                                                                         |
| portMapping                     | `--publish`<br>`--expose`           | ホストとFargateのアプリケーションのポート番号をマッピングし、ポートフォワーディングを実行する。                                                                                                                                                                              | `containerPort`のみを設定し、`hostPort`は設定しなければ、EXPOSEとして定義できる。<br>https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_PortMapping.html                                     |
| secrets<br>(volumesFrom)        |                                     | パラメーターストアから出力する変数を設定する。                                                                                                                                                                                                                               |                                                                                                                                                                                                         |
| memory                          | `--memory`                          | コンテナのメモリサイズの閾値を設定し、これを超えた場合にコンテナを停止する『ハード制限』ともいう。                                                                                                                                                                           | ・https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_memory                                                                               |
| memoryReservation               | `--memory-reservation`              | タスク全体に割り当てられたメモリ (タスクメモリ) のうち、該当のコンテナに最低限割り当てるメモリ分を設定する。『ソフト制限』ともいう。                                                                                                                                         | ・https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_memory                                                                               |
| mountPoints                     |                                     | 隠蔽されたホストとコンテナの間でボリュームマウントを実行する。Fargateは、脆弱性と性能の観点で、バインドマウントに対応していない。                                                                                                                                            | ・https://hiroki-it.github.io/tech-notebook/virtualization/virtualization_container_docker.html                                                                                                         |
| ulimit                          | Linuxコマンドの<br>`--ulimit`に相当 |                                                                                                                                                                                                                                                                              |                                                                                                                                                                                                         |

> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/task_definition_parameters.html

<br>

## 05-03. AWS ECSタスク

### サイドカー

マイクロサービスのコンテナからログを収集する場合に、AWS以外 (Google Cloud Logging) に送信するのであればサイドカーパターンでログルーター (EC2ならFluentBit、FargateならFireLens) を採用しないといけない。

AWS ECSサービスを増えるたびにサイドカーの横展開していく。

<br>

### IPアドレス

#### ▼ AWS ECSタスクのIPアドレス

AWS ECSタスクごとに異なるプライベートIPが割り当てられる。

このIPアドレスに対して、ALBはルーティングを実行する。

#### ▼ FargateのIPアドレス

Fargateは動的パブリックIPアドレス (Fargateの再作成後に変化するIPアドレス) を持ち、固定パブリックIPアドレスであるElastic IPアドレスを設定できない。

リクエストの先にある外部サービスが、セキュリティ上で静的なIPアドレスを要求する場合、リクエスト (パブリックネットワーク向き通信) 時に送信元パケットに付加されるIPアドレスが動的になり、リクエストできなくなってしまう。

そこで、Fargateのリクエストが、Elastic IPアドレスを持つAWS NAT Gatewayを経由する (Fargateは、パブリックサブネットとプライベートサブネットのどちらに配置しても良い) 。

これによって、AWS NAT GatewayのElastic IPアドレスが送信元パケットに付加されるため、Fargateの送信元IPアドレスを見かけ上静的に扱えるようになる。

![NatGatewayを経由したFargateから外部サービスへのリクエスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/NatGatewayを経由したFargateから外部サービスへのリクエスト.png)

> - https://aws.amazon.com/jp/premiumsupport/knowledge-center/ecs-fargate-static-elastic-ip-address/

<br>

### AWS ECSタスクの一時起動

#### ▼ DBマイグレーション

現在起動中のAWS ECSタスクとは別に、新しいタスクを一時的に起動する。

CI/CDパイプライン上で実行する以外に、ローカルマシンから手動で実行する場合もある。

起動時に、`overrides`オプションを使用して、指定したAWS ECSタスク定義のコンテナ設定を上書きできる。

正規表現で設定する必要があり、加えてJSONでは『`\`』を『`\\`』にエスケープしなければならない。

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

注意点として、実行IAMユーザーを作成し、AWS ECSタスクを起動できる必要最低限の認可スコープを紐付ける。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Action":
          [
            "iam:PassRole",
            "ecs:RunTask",
            "ecs:DescribeServices",
            "ecs:DescribeTasks",
          ],
        "Resource":
          [
            "arn:aws:ecs:*:<AWSアカウントID>:service/*",
            "arn:aws:ecs:*:<AWSアカウントID>:task/*",
            "arn:aws:ecs:*:<AWSアカウントID>:task-definition/*",
            "arn:aws:iam::<AWSアカウントID>:role/*",
          ],
      },
    ],
}
```

<br>

### AWS ECSタスクのデプロイ手法

#### ▼ ローリングアップデート

`(1)`

: 最小ヘルス率の設定値を基に、ローリングアップデート時の稼働中タスクの最低合計数が決定される。

`(2)`

: 最大率の設定値を基に、ローリングアップデート時の稼働中/停止中タスクの最高合計数が決まる

`(3)`

: ECSは、既存タスクを稼働中のまま、新タスクを最高合計数いっぱいまで作成する。

`(4)`

: ECSは、待機時間後にALB/NLBによる新タスクに対するヘルスチェックの結果を確認する。ヘルスチェックが成功していれば、既存タスクを停止する。ただし、最小ヘルス率によるタスクの最低合計数が保たれる。

`(5)`

: 『新タスクの起動』と『ヘルスチェック確認後の既存タスクの停止』のプロセスが繰り返し実行され、徐々に既存タスクが新タスクに置き換わる。

`(6)`

: 全ての既存タスクが新タスクに置き換わる。

![rolling-update](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/rolling-update.png)

> - https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments/

#### ▼ ブルー/グリーンデプロイメント

CodeDeployを使用してデプロイする。

<br>

### プライベートサブネット内のFargateからVPC外のAWSリソースへのアクセス

![ecs_vpc-endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_vpc-endpoint.png)

| VPCエンドポイントの接続先 | タイプ    | プライベートDNS名                                                                  | 説明                                                                   |
| ------------------------- | --------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| AWS CloudWatch Logs       | Interface | `logs.ap-northeast-1.amazonaws.com`                                                | ECSコンテナのログをPOSTリクエストを送信するため。                      |
| AWS ECR                   | Interface | `api.ecr.ap-northeast-1.amazonaws.com`<br>`*.dkr.ecr.ap-northeast-1.amazonaws.com` | イメージのGETリクエストを送信するため。                                |
| AWS S3                    | Gateway   | なし                                                                               | イメージのレイヤーをPOSTリクエストを送信するため                       |
| AWS Systems Manager       | Interface | `ssm.ap-northeast-1.amazonaws.com`                                                 | AWS Systems ManagerのパラメーターストアにGETリクエストを送信するため。 |
| AWS Secrets Manager       | Interface | `ssmmessage.ap-northeast-1.amazonaws.com`                                          | AWS Secrets Managerを使用するため。                                    |

プライベートサブネット内のFargateからVPC外のAWSリソース (例：コントロールプレーン、AWS ECR、AWS S3、AWS Systems Manager、AWS CloudWatch Logs、DynamoDBなど) にリクエストを送信する場合、専用のVPCエンドポイントを設ける必要がある。

AWS NAT GatewayとVPCエンドポイントの両方を作成している場合、ルートテーブルでは、VPCエンドポイントへのリクエストの方が優先される。

そのため、AWS NAT Gatewayがある状態でVPCエンドポイントを作成すると、接続先が自動的に変わってしまうことに注意する。

注意点として、パブリックネットワークにリクエストを送信する場合は、VPCエンドポイントのみでなくAWS NAT Gatewayも作成する必要がある。

> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/vpc-endpoints.html#ecs-vpc-endpoint-ecsexec
> - https://zenn.dev/yoshinori_satoh/articles/ecs-fargate-vpc-endpoint
> - https://dev.classmethod.jp/articles/vpc-endpoint-gateway-type/

<br>

### Fargate上のコンテナへの接続

#### ▼ AWS SSM Session Managerを使用したECS Exec

![fargate_ecs-exec](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fargate_ecs-exec.png)

AWS SSM Session Managerを使用してAWS ECSタスク内のコンテナに接続し、コンテナのログインシェルを起動する。

AWS Systems Managerを使用してコンテナに接続する場合、コンテナのホストにsystems-managerエージェントをインストールしておく必要がある。

ただし、AWS FargateとしてのAWS EC2には、systems-managerエージェントがプリインストールされているため、これは不要である。

`(1)`

: AWS ECSサービスで、ECS-Execオプションを有効化する。

`(2)`

: AWS VPCエンドポイントにて、ssmmessagesエンドポイントを作成する。

`(3)`

: AWS ECSタスク実行ロールにIAMポリシーを付与する。

     これにより、AWS AWS ECSタスクがAWS SSM Session Managerにリクエストを送信できるようになる。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Action":
          [
            "ssmmessages:CreateControlChannel",
            "ssmmessages:CreateDataChannel",
            "ssmmessages:OpenControlChannel",
            "ssmmessages:OpenDataChannel",
          ],
        "Resource": "*",
      },
    ],
}
```

`(4)`

: ECS Execの実行ユーザーに、IAMポリシーを付与する。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Action": ["ecs:ExecuteCommand"],
        "Resource":
          [
            "arn:aws:ecs:*:<AWSアカウントID>:cluster/*",
            "arn:aws:ecs:*:<AWSアカウントID>:task/*",
          ],
      },
    ],
}
```

`(5)`

: 事前の設定がなされているか否かをecs-exec-checkerスクリプトを実行して確認する。

> - https://github.com/aws-containers/amazon-ecs-exec-checker

```bash
#!/bin/bash

ECS_CLUSTER_NAME=prd-foo-ecs-cluster
ECS_TASK_ID=bar

bash <(curl -Ls https://raw.githubusercontent.com/aws-containers/amazon-ecs-exec-checker/main/check-ecs-exec.sh) $ECS_CLUSTER_NAME $ECS_TASK_ID
```

`(6)`

: AWS ECSタスク内のコンテナに接続し、コンテナのログインシェルを起動する。bashを実行する時に、『`/bin/bash`』や『`/bin/sh`』で指定すると、binより上のパスもECSに送信されてしまう。

     例えば、Windowsなら『```C:/Program Files/Git/usr/bin/bash```』を送信する。

     これはCloudTrailでExecuteCommandイベントとして確認できる。

     ECSコンテナ内ではbashへのパスが異なるため、接続に失敗する。そのため、bashを直接的に指定する。

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

> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/ecs-exec.html
> - https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-setting-up-messageAPIs.html
> - https://qiita.com/Shohei_Miwa/items/6e04c9b7f4c0c862eb9e

<br>
