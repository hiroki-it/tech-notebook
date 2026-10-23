---
title: 【IT技術の知見】Amazon ECS＠AWSリソース
description: Amazon ECS＠AWSリソースの知見を記録しています。
---

# Amazon ECS＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Amazon ECS：Elastic Container Service

### コントロールプレーン

#### ▼ コントロールプレーンとは

コンテナオーケストレーションを実行する環境を提供する。

データプレーンの VPC 外に存在している。

#### ▼ コントロールプレーンの仕組み

Amazon ECS のコントロールプレーンは、開発者や他の AWS リソースからのリクエストを待ち受ける API、データプレーンを管理するコンポーネントからなる。

![ecs_control-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_control-plane.png)

> - [詳解: Amazon Elastic Container Service と AWS Fargate のタスク起動レートの向上 \| Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/under-the-hood-amazon-elastic-container-service-and-aws-fargate-increase-task-launch-rates/)

<br>

### データプレーン

単一のホスト (Amazon EC2、AWS Fargate) の OS 上でコンテナオーケストレーションを実行する。

『`on EC2`』『`on Fargate`』という呼び方は、データプレーンが Amazon ECS の実行環境 (`on environment`) の意味合いを持つからである。

<br>

### Amazon EKS との機能比較

<table>
  <thead>
    <tr>
      <th>Amazon ECS の機能</th>
      <th>EKS で相当する機能</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Amazon ECS サービス + Amazon ECS タスク</td>
      <td>Deployment</td>
    </tr>
    <tr>
      <td>Daemon 型の Amazon ECS サービス</td>
      <td>DaemonSet</td>
    </tr>
    <tr>
      <td>Replica 型の Amazon ECS サービス</td>
      <td>ReplicaSet</td>
    </tr>
    <tr>
      <td>なし</td>
      <td>StatefulSet</td>
    </tr>
    <tr>
      <td>Amazon ECS タスク</td>
      <td>Pod</td>
    </tr>
    <tr>
      <td>ELB</td>
      <td>Ingress + Service</td>
    </tr>
    <tr>
      <td>Amazon ECS タスクの環境変数</td>
      <td>ConfigMap</td>
    </tr>
    <tr>
      <td>AWS Secrets Manager</td>
      <td>Secret</td>
    </tr>
    <tr>
      <td>Task スケーリング</td>
      <td>HorizontalPodAutoscaler、VerticalPodAutoscaler</td>
    </tr>
    <tr>
      <td>キャパシティプロバイダー + AWS AutoScaling</td>
      <td>CusterAutoscaler、Karpenter</td>
    </tr>
    <tr>
      <td>Minimum/Maximum Healthy Percent</td>
      <td>PodDisruptionBudget</td>
    </tr>
    <tr>
      <td>Amazon VPC Lattice、Amazon ECS Service Connect</td>
      <td>Istio</td>
    </tr>
  </tbody>
</table>

<br>

## 02. コントロールプレーンのコンポーネント

記入中...

<br>

## 03. データプレーンのコンポーネント

### Amazon ECS クラスター

Amazon ECS サービスの管理グループ単位のこと。

![ecs_cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_cluster.png)

> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/clusters.html

<br>

### Amazon ECS サービス

Amazon ECS タスクの管理グループ単位のこと。

Amazon ECS タスクへのロードバランシング、タスクの数の維持管理や、リリースの成否を管理する。

マイクロサービスは、Amazon ECS サービスを単位として作成する。

> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/service_definition_parameters.html

<br>

### Amazon ECS タスク

#### ▼ Amazon ECS タスク

コンテナインスタンスの管理グループ単位のこと。

Amazon ECS タスク定義を基に作成される。

![ecs_task](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_task.png)

#### ▼ Amazon ECS コンテナエージェント

Amazon ECS タスク実行ロールを使用して、Amazon ECS タスクのライフサイクルを管理する。

Fargate の場合、Amazon ECS コンテナエージェントがプリインストールされている。

![ecs_task-execution-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_task-execution-role.png)

> - [ECS(EC2)で利用するIAMロールを整理する \| DevelopersIO](https://dev.classmethod.jp/articles/ecs_ec2_iamrole/)
> - [詳解: Amazon ECSのタスクネットワーク \| Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/under-the-hood-task-networking-for-amazon-ecs/)

#### ▼ Amazon ECS タスク定義

Amazon ECS タスクをどのような設定値を基に作成するかを設定できる。

Amazon ECS タスク定義は、バージョンを示す『リビジョンナンバー』で番号づけされる。

Amazon ECS タスク定義を削除するには、すべてのリビジョンの Amazon ECS タスク定義を登録解除する必要がある。

#### ▼ Amazon ECS タスクのライフサイクルフェーズ

![ecs_task_lifecycle_phase](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_task_lifecycle_phase.png)

Amazon ECS タスクのライフサイクルにはフェーズがある。

Amazon ECS タスクは、必須コンテナの異常停止時、デプロイ時、オートスケーリング時、手動操作時にフェーズを持つ。

<table>
  <thead>
    <tr>
      <th>フェーズ名</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Provisioning</td>
      <td>Amazon ECS タスクの起動前に必要な準備 (例：ENI の紐付け) があり、これが完了していない。</td>
      <td></td>
    </tr>
    <tr>
      <td>Pending</td>
      <td>Amazon ECS タスク内のコンテナの起動がまだ完了していない。</td>
      <td></td>
    </tr>
    <tr>
      <td>Activating</td>
      <td>Amazon ECS タスク内のすべてのコンテナの起動が完了したが、Amazon ECS タスク全体のセットアップは完了していない。</td>
      <td></td>
    </tr>
    <tr>
      <td>Running</td>
      <td>Amazon ECS タスク内のすべてのコンテナの起動と Amazon ECS タスク全体の準備が完了し、実行中である。</td>
      <td>コンテナの起動が完了すれば <code>Running</code> フェーズになるが、コンテナ内でビルトインサーバーを起動するようなアプリケーション (例：フレームワークのビルトインサーバー機能) の場合は、<code>Running</code> フェーズであっても使用できないことに注意する。</td>
    </tr>
    <tr>
      <td>De-activating</td>
      <td>Amazon ECS タスク内のコンテナを停止する前に必要な処理があり、これが完了していない。</td>
      <td></td>
    </tr>
    <tr>
      <td>Stopping</td>
      <td>Amazon ECS タスク内のコンテナが正常/異常に停止しようとしている途中である。</td>
      <td></td>
    </tr>
    <tr>
      <td>De-provisioning</td>
      <td>Amazon ECS タスク全体を停止する前に必要な準備 (例：ENI の解除) があり、これが完了していない。</td>
      <td></td>
    </tr>
    <tr>
      <td>Stopped</td>
      <td>Amazon ECS タスク全体が停止した。</td>
      <td>正常停止と異常停止に関わらず、停止理由を確認できる。<br><a href="https://docs.aws.amazon.com/AmazonECS/latest/developerguide/stopped-task-errors.html">https://docs.aws.amazon.com/AmazonECS/latest/developerguide/stopped-task-errors.html</a></td>
    </tr>
  </tbody>
</table>

> - https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-lifecycle.html#lifecycle-states

<br>

## 03-02. ネットワーク

### Amazon ECS タスク内のコンテナ間通信

#### ▼ none モード

外部ネットワークが無く、タスクと外と通信できない。

#### ▼ host モード

EC2 のみで使用できる。

Docker の host ネットワークに相当する。

![network-mode_host-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network-mode_host-mode.png)

> - https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-networkmode.html#networking-networkmode-host

#### ▼ bridge モード

EC2 のみで使用できる。

Docker の bridge ネットワークに相当する。

![network-mode_host-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network-mode_host-mode.png)

> - https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-networkmode.html#networking-networkmode-bridge

#### ▼ awsvpc モード

Fargate と EC2 の両方で使用できる aws の独自ネットワークモード。

タスクは Elastic Network インターフェースと紐付けられ、コンテナではなくタスク単位でプライベート IP アドレスが割り当てられる。

Fargate の場合、同じタスクに属するコンテナ間は、localhost インターフェイスという ENI 経由で通信できるようになる (推測ではあるが、Fargate としての EC2 に localhost インターフェースが紐付けられる) 。

これにより、コンテナ間でパケットを送受信するとき (例：Nginx コンテナから PHP-FPM コンテナへのルーティング) は、通信元コンテナにて、通信先のアドレスを『localhost (`127.0.0.1`) 』で指定すればよい。

また、awsvpc モードの独自の仕組みとして、同じ Amazon ECS タスク内であれば、互いにコンテナポートを開放せずともパケットを送受信できる。通信を待ち受けるポートを指定するだけでよい。

例えば、Nginx コンテナから PHP-FPM コンテナにリクエストをルーティングするためには、PHP-FPM プロセスが `9000` 番ポートでリクエストを受信し、加えてコンテナが `9000` 番ポートを開放する必要がある。

しかし、awsvpc モードではコンテナポートを開放する必要はない。

![network-mode_awsvpc](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network-mode_awsvpc.png)

> - https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-networkmode.html#networking-networkmode-awsvpc
> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/fargate-task-networking.html

<br>

### Amazon ECS サービス間の通信

Amazon ECS Service Connect を使用する。

> - https://zenn.dev/cadp/articles/ecs-service-mesh-compare

<br>

### Amazon ECS タスクからのアウトバウンド

#### ▼ プライベートサブネット内のデータプレーンの配置

プライベートサブネット内にデータプレーンを配置した場合、パブリックネットワークや VCP 外の AWS リソースにリクエストを送信するために、AWS NAT Gateway や VPC エンドポイントが必要になる。

パブリックサブネットに配置すればこれらは不要となるが、パブリックサブネットよりもプライベートサブネットにデータプレーンを配置するほうが望ましい。

#### ▼ パブリックネットワークに対する通信

データプレーンをプライベートサブネットに配置した場合、パブリックネットワークへリクエストを送信するためには、AWS NAT Gateway を配置する必要がある。

#### ▼ Amazon VPC 外の AWS リソースに対する通信

データプレーンをプライベートサブネットに配置した場合、VPC 外にある AWS リソース (例：コントロールプレーン、Amazon ECR、Amazon S3、AWS Systems Manager、Amazon CloudWatch Logs、DynamoDB など) へリクエストを送信するためには、AWS NAT Gateway あるいは VPC エンドポイントを配置する必要がある。

もし AWS NAT Gateway を配置したとする。

この場合、VPC エンドポイントよりも AWS NAT Gateway のほうが高く、AWS リソースに対する通信でも AWS NAT Gateway を通過するため、高額料金を請求されてしまう。

![ecs_nat-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_nat-gateway.png)

> - [ECS FargateでVPCエンドポイントを使用する](https://zenn.dev/yoshinori_satoh/articles/ecs-fargate-vpc-endpoint)

代わりに、VPC エンドポイントを配置する。

より低額でデータプレーンが VPC 外の AWS リソースのリクエストできるようになる。

![ecs_control-plane_vpc-endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_control-plane_vpc-endpoint.png)

> - https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-connecting-vpc.html#networking-connecting-privatelink

<br>

## 03-03. セキュリティ

### ロール

#### ▼ サービスロール

Amazon ECS サービスが Amazon ECS タスクを操作するために必要なロールである。

サービスリンクロールに含まれ、Amazon ECS の作成時に自動的に紐付けられる。

> - [ECS(Fargate)で利用するIAMロールを整理する \| DevelopersIO](https://dev.classmethod.jp/articles/ecs_fargate_iamrole/)
> - [ECS(EC2)で利用するIAMロールを整理する \| DevelopersIO](https://dev.classmethod.jp/articles/ecs_ec2_iamrole/)

#### ▼ コンテナインスタンスロール

コンテナのホストが他の AWS リソースにリクエストを送信するために必要なロールである。

Fargate の場合、不要である。

![ecs_container-instance-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_container-instance-role.png)

> - [ECS(Fargate)で利用するIAMロールを整理する \| DevelopersIO](https://dev.classmethod.jp/articles/ecs_fargate_iamrole/)
> - [ECS(EC2)で利用するIAMロールを整理する \| DevelopersIO](https://dev.classmethod.jp/articles/ecs_ec2_iamrole/)

#### ▼ タスクロール

Amazon ECS タスク内のコンテナのアプリケーションが、他の AWS リソースにリクエストを送信するために必要なロールである。

アプリケーションに Amazon S3 や AWS Systems Manager への認可スコープを与えたい場合は、タスク実行ロールではなくタスクロールに認可スコープを紐付ける。

![ecs_task-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_task-role.png)

> - [ECS(Fargate)で利用するIAMロールを整理する \| DevelopersIO](https://dev.classmethod.jp/articles/ecs_fargate_iamrole/)
> - [ECS(EC2)で利用するIAMロールを整理する \| DevelopersIO](https://dev.classmethod.jp/articles/ecs_ec2_iamrole/)

**＊実装例＊**

アプリケーションから Amazon CloudWatch Logs にログを送信するために、Amazon ECS タスクロールにカスタマー管理ポリシーを紐付ける。

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

パラメーターストアから変数を取得するために、Amazon ECS タスクロールにインラインポリシーを紐付ける。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [{"Effect": "Allow", "Action": ["ssm:GetParameters"], "Resource": "*"}],
}
```

#### ▼ タスク実行ロール

![ecs_task-execution-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_task-execution-role.png)

Amazon ECS タスク内の Amazon ECS コンテナエージェントが、他の AWS リソースにリクエストを送信するために必要なロールのこと。

AWS 管理ポリシーである『`AmazonECSTaskExecutionRolePolicy`』が紐付けられたロールを、タスクに紐付ける必要がある。

このポリシーには、Amazon ECR への認可スコープのほか、Amazon CloudWatch Logs にログを作成するための認可スコープが設定されている。

Amazon ECS タスク内のコンテナがリソースにリクエストを送信するために必要なタスクロールとは区別すること。

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

datadog エージェントが Amazon ECS クラスターやコンテナにリクエストを送信できるように、Amazon ECS タスク実行ロールにカスタマー管理ポリシーを紐付ける。

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

> - [ECS(Fargate)で利用するIAMロールを整理する \| DevelopersIO](https://dev.classmethod.jp/articles/ecs_fargate_iamrole/)
> - [ECS(EC2)で利用するIAMロールを整理する \| DevelopersIO](https://dev.classmethod.jp/articles/ecs_ec2_iamrole/)

<br>

## 03-04. 監視

### ログ

#### ▼ awslogs ドライバー

標準出力/標準エラー出力に出力されたログを CloudWatch-API に送信する。

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>awslogs-group</code></td>
      <td>ログ宛先の Amazon CloudWatch Logs のロググループを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td><code>awslogs-datetime-format</code></td>
      <td>日時フォーマットを定義し、加えてこれをログの区切り単位としてログストリームに出力する。</td>
      <td>正規表現で設定する必要があり、加えて JSON では『<code>\</code>』を『<code>\\</code>』にエスケープしなければならない。例えば『<code>\\[%Y-%m-%d %H:%M:%S\\]</code>』となる。<br><a href="https://docs.docker.com/config/containers/logging/awslogs/#awslogs-datetime-format">https://docs.docker.com/config/containers/logging/awslogs/#awslogs-datetime-format</a></td>
    </tr>
    <tr>
      <td><code>awslogs-region</code></td>
      <td>ログ宛先の Amazon CloudWatch Logs のリージョンを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td><code>awslogs-stream-prefix</code></td>
      <td>ログ宛先の Amazon CloudWatch Logs のログストリームのプレフィックス名を設定する。</td>
      <td>ログストリームには、『<code>&lt;プレフィックス名&gt;/&lt;コンテナ名&gt;/&lt;タスクID&gt;</code>』の形式で送信される。</td>
    </tr>
  </tbody>
</table>

> - https://docs.docker.com/config/containers/logging/awslogs/
> - [Send Amazon ECS logs to CloudWatch - Amazon Elastic Container Service](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html#create_awslogs_logdriver_options)

<br>

## 04. on Amazon EC2

### on Amazon EC2 とは

EC2 をホストとして、コンテナを作成する。

<br>

### Amazon EC2 の最適化 AMI

任意の EC2 を使用できるが、AWS が用意している最適化 AMI を選んだほうがよい。

この AMI には、EC2 が Amazon ECS と連携するために必要なソフトウェアがプリインストールされており、EC2 をセットアップする手間が省ける。

<table>
  <thead>
    <tr>
      <th>AMI 名</th>
      <th>説明</th>
      <th>特に相性のよいアプリ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Amazon ECS 最適化 Amazon Linux 2</td>
      <td>Amazon ECS のための標準的な EC2 を作成できる。推奨方式。</td>
      <td></td>
    </tr>
    <tr>
      <td>Amazon ECS 最適化 Amazon Linux 2022</td>
      <td>Amazon Linux 2 よりも先進的な機能を持つ EC2 を作成できる。<br><a href="https://docs.aws.amazon.com/linux/al2022/ug/compare-al2-to-AL2022.html">https://docs.aws.amazon.com/linux/al2022/ug/compare-al2-to-AL2022.html</a></td>
      <td></td>
    </tr>
    <tr>
      <td>Amazon ECS 最適化 Amazon Linux</td>
      <td>Amazon ECS のための標準的な EC2 を作成できる。非推奨であり、Amazon Linux 2 を使用したほうがよい。</td>
      <td></td>
    </tr>
    <tr>
      <td>Amazon ECS 最適化 Amazon Linux 2 arm64</td>
      <td>arm64 ベースの Graviton プロセッサーが搭載された EC2 を作成できる。</td>
      <td></td>
    </tr>
    <tr>
      <td>Amazon ECS 最適化 Amazon Linux 2 GPU</td>
      <td>GPU が搭載された EC2 を作成できる。</td>
      <td>GPU が必要なアプリケーション (計算処理系、機械学習系のアプリケーション)</td>
    </tr>
    <tr>
      <td>Amazon ECS 最適化 Amazon Linux 2 推定</td>
      <td>Amazon EC2 Inf1 インスタンスを作成できる。</td>
      <td></td>
    </tr>
  </tbody>
</table>

> - [Amazon ECS-optimized Linux AMIs - Amazon Elastic Container Service](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI.html)

<br>

### タスク配置戦略

Amazon ECS タスクを Amazon ECS クラスターに配置するときのアルゴリズムを選択できる。

<table>
  <thead>
    <tr>
      <th>戦略</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Spread</td>
      <td>Amazon ECS タスクを各場所にバランスよく配置する</td>
    </tr>
    <tr>
      <td>Binpack</td>
      <td>Amazon ECS タスクを <code>1</code> 個の場所にできるだけ多く配置する。</td>
    </tr>
    <tr>
      <td>Random</td>
      <td>Amazon ECS タスクをランダムに配置する。</td>
    </tr>
  </tbody>
</table>

<br>

## 05. on Fargate

### on Fargate とは

Fargate をホストとして、コンテナを作成する。

Fargate の実体は EC2 である (ドキュメントに記載がないが、AWS サポートに確認済み) 。

![fargate_data-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fargate_data-plane.png)

> - [詳細: Fargate データプレーン \| Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/under-the-hood-fargate-data-plane/)

<br>

## 05-02. セットアップ

### コンソール画面の場合

#### ▼ Amazon ECS サービス

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Amazon ECS タスク定義</td>
      <td>Amazon ECS サービスで維持管理するタスクの定義ファミリー名とリビジョンを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>起動タイプ</td>
      <td>Amazon ECS タスク内のコンテナの起動タイプを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>プラットフォームのバージョン</td>
      <td>Fargate のカーネルとコンテナランタイムのバージョンを設定する。</td>
      <td>バージョンによって、連携できる AWS リソースが異なる。</td>
    </tr>
    <tr>
      <td>サービスタイプ</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Amazon ECS タスクの必要数</td>
      <td>非スケーリング時またはデプロイ時のタスク数を設定する。</td>
      <td>最小ヘルス率と最大率の設定値に影響する。</td>
    </tr>
    <tr>
      <td>最小ヘルス率</td>
      <td>Amazon ECS タスクの必要数の設定を <code>100</code>%とし、新しいタスクのデプロイ時に、稼働中タスクの最低合計数を割合で設定する。</td>
      <td>例として、タスク必要数が 4 個だと仮定する。タスクヘルス最小率を 50%とすれば、稼働中タスクの最低合計数は 2 個となる。デプロイ時の既存タスク停止と新タスク起動では、稼働中の既存タスク/新タスクの数が最低合計数未満にならないように制御される。<br><a href="https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments">https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments</a></td>
    </tr>
    <tr>
      <td>最大率</td>
      <td>Amazon ECS タスクの必要数の設定を <code>100</code>%とし、新しいタスクのデプロイ時に、稼働中/停止中タスクの最高合計数を割合で設定する。</td>
      <td>例として、タスク必要数が 4 個だと仮定する。タスク最大率を 200%とすれば、稼働中/停止中タスクの最高合計数は８個となる。デプロイ時の既存タスク停止と新タスク起動では、稼働中/停止中の既存タスク/新タスクの数が最高合計数を超過しないように制御される。<br><a href="https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments">https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments</a></td>
    </tr>
    <tr>
      <td>ヘルスチェックの待機期間</td>
      <td>デプロイ時の ALB/NLB のヘルスチェックを開始するまでの待機時間を設定する。猶予期間を過ぎても、ALB/NLB のヘルスチェックが失敗していれば、サービスはタスクを停止し、新しいタスクを再起動する。</td>
      <td>ALB/NLB ではターゲットを登録し、ヘルスチェックを実行するプロセスがある。特に NLB では、これに時間がかかる。またアプリケーションによっては、コンテナの作成に時間がかかる。そのため、NLB のヘルスチェックが完了する前に、Amazon ECS サービスが NLB のヘルスチェックの結果を確認してしまうことがある。例えば、NLB と Laravel を使用する場合は、ターゲット登録と Laravel コンテナの築の時間を加味して、<code>330</code> 秒以上を目安とする。例えば、ALB と Nuxt.js (SSR モード) を使用する場合は、<code>600</code> 秒以上を目安とする。注意点として、アプリコンテナ作成にかかる時間は、開発環境での所要時間を参考にする。</td>
    </tr>
    <tr>
      <td>タスクの最小数</td>
      <td>スケーリング時のタスク数の最小数を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>タスクの最大数</td>
      <td>スケーリング時のタスク数の最大数を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>ロードバランシング</td>
      <td>ALB でルーティングするコンテナを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>タスク数</td>
      <td>Amazon ECS タスクの作成数をいくつに維持するかを設定する。</td>
      <td>タスクが何らかの原因で停止した場合、タスクを自動的に作成する。</td>
    </tr>
    <tr>
      <td>デプロイメント</td>
      <td>ローリングアップデート、ブルー/グリーンデプロイがある。</td>
      <td></td>
    </tr>
    <tr>
      <td>サービスロール</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

#### ▼ Amazon ECS タスク定義

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Amazon ECS タスク定義名</td>
      <td>Amazon ECS タスク定義の名前を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>ネットワークモード</td>
      <td>ホストとコンテナ間を接続するネットワーク様式を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>互換性</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>オペレーティングシステムファミリー</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>タスクロール</td>
      <td>Amazon ECS タスク内のコンテナのアプリケーションが、他の AWS リソースにリクエストを送信するために必要なロールを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>タスク実行ロール</td>
      <td>Amazon ECS タスク内の Amazon ECS コンテナエージェントが、他の AWS リソースにリクエストを送信するために必要なロールを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>タスクメモリ</td>
      <td>Amazon ECS タスク当たりのコンテナの合計メモリサイズを設定する。</td>
      <td>Amazon ECS タスク内のコンテナに割り振ることを想定し、やや多めにメモリを設定したほうがよい。</td>
    </tr>
    <tr>
      <td>タスク CPU</td>
      <td>Amazon ECS タスク当たりのコンテナの合計 CPU サイズを設定する。</td>
      <td>・Amazon ECS タスク内のコンテナに割り振ることを想定し、やや多めにメモリを設定したほうがよい。<br>・CPU ごとに使用できるメモリサイズに違いがあり、大きな CPU ほど小さなメモリを使用できない。</td>
    </tr>
    <tr>
      <td>コンテナ定義</td>
      <td>Amazon ECS タスク内のコンテナを設定する。</td>
      <td>JSON をインポートしても設定できる。</td>
    </tr>
    <tr>
      <td>サービス統合</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>プロキシ</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>FireLens 統合</td>
      <td>FireLens コンテナを使用する場合に有効化する。</td>
      <td></td>
    </tr>
    <tr>
      <td>ボリューム</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

#### ▼ コンテナ定義

Amazon ECS タスク内のコンテナ 1 つに環境を設定する。

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>対応する <code>docker</code> コマンドオプション</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>cpu</td>
      <td><code>--cpus</code></td>
      <td>タスク全体に割り当てられたメモリ (タスクメモリ) のうち、該当のコンテナに最低限割り当てる CPU ユニット数を設定する。cpuReservation という名前になっていないことに注意する。 CPU ユニット数の比率に基づいて、タスク全体の CPU が各コンテナに割り当てられる。『ソフト制限』ともいう。</td>
      <td>・<a href="https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_environment">https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_environment</a> <br>・<a href="https://qiita.com/_akiyama_/items/e9760dd61d94b8031247">https://qiita.com/_akiyama_/items/e9760dd61d94b8031247</a></td>
    </tr>
    <tr>
      <td>dnsServers</td>
      <td><code>--dns</code></td>
      <td>コンテナが名前解決に使用する DNS サーバーの IP アドレスを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>essential</td>
      <td></td>
      <td>コンテナが必須か否かを設定する。</td>
      <td>・<code>true</code> の場合、コンテナが停止すると、タスクに含まれる全コンテナが停止する。<br><code>false</code> の場合、コンテナが停止しても、その他のコンテナは停止しない。</td>
    </tr>
    <tr>
      <td>healthCheck<br>(command)</td>
      <td><code>--health-cmd</code></td>
      <td>ホストから Fargate に対して、<code>curl</code> コマンドによるリクエストを送信し、レスポンス内容を確認。</td>
      <td></td>
    </tr>
    <tr>
      <td>healthCheck<br>(interval)</td>
      <td><code>--health-interval</code></td>
      <td>ヘルスチェックの間隔を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>healthCheck<br>(retries)</td>
      <td><code>--health-retries</code></td>
      <td>ヘルスチェックを成功と見なす回数を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>hostName</td>
      <td><code>--hostname</code></td>
      <td>コンテナにホスト名を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>image</td>
      <td></td>
      <td>Amazon ECR の URL を設定する。</td>
      <td>指定できる URL の記法は、Dockerfile の <code>FROM</code> 処理と同じである。<br><a href="https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_docker_dockerfile.html">https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_docker_dockerfile.html</a></td>
    </tr>
    <tr>
      <td>logConfiguration<br>(logDriver)</td>
      <td><code>--log-driver</code></td>
      <td>ログドライバーを指定することで、ログの出力先を設定する。</td>
      <td>Docker のログドライバーにおおよそ対応しており、Fargate であれば『awslogs、awsfirelens、splunk』に設定できる。EC2 であれば『awslogs、json-file、syslog、journald、fluentd、gelf、logentries』を設定できる。</td>
    </tr>
    <tr>
      <td>logConfiguration<br>(options)</td>
      <td><code>--log-opt</code></td>
      <td>各ログドライバーのオプションを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>portMapping</td>
      <td><code>--publish</code><br><code>--expose</code></td>
      <td>ホストと Fargate のアプリケーションのポート番号をマッピングし、ポートフォワーディングを実行する。</td>
      <td><code>containerPort</code> のみを設定し、<code>hostPort</code> は設定しなければ、EXPOSE として定義できる。<br><a href="https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_PortMapping.html">https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_PortMapping.html</a></td>
    </tr>
    <tr>
      <td>secrets<br>(volumesFrom)</td>
      <td></td>
      <td>パラメーターストアから出力する変数を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>memory</td>
      <td><code>--memory</code></td>
      <td>コンテナのメモリサイズの閾値を設定し、これを超えた場合にコンテナを停止する『ハード制限』ともいう。</td>
      <td>・<a href="https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_memory">https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_memory</a></td>
    </tr>
    <tr>
      <td>memoryReservation</td>
      <td><code>--memory-reservation</code></td>
      <td>タスク全体に割り当てられたメモリ (タスクメモリ) のうち、該当のコンテナに最低限割り当てるメモリ分を設定する。『ソフト制限』ともいう。</td>
      <td>・<a href="https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_memory">https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_memory</a></td>
    </tr>
    <tr>
      <td>mountPoints</td>
      <td></td>
      <td>隠蔽されたホストとコンテナの間でボリュームマウントを実行する。Fargate は、脆弱性と性能の観点で、バインドマウントに対応していない。</td>
      <td>・<a href="https://hiroki-it.github.io/tech-notebook/virtualization/virtualization_container_docker.html">https://hiroki-it.github.io/tech-notebook/virtualization/virtualization_container_docker.html</a></td>
    </tr>
    <tr>
      <td>ulimit</td>
      <td>Linux コマンドの<br><code>--ulimit</code> に相当</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/task_definition_parameters.html

<br>

## 05-03. Amazon ECS タスク

### サイドカー

マイクロサービスのコンテナからログを収集する場合に、AWS 以外 (Google Cloud Logging) に送信するのであればサイドカーパターンでログルーター (EC2 なら FluentBit、Fargate なら FireLens) を採用しないといけない。

Amazon ECS サービスを増えるたびにサイドカーの横展開していく。

<br>

### IP アドレス

#### ▼ Amazon ECS タスクの IP アドレス

Amazon ECS タスクごとに異なるプライベート IP が割り当てられる。

この IP アドレスに対して、ALB はルーティングを実行する。

#### ▼ Fargate の IP アドレス

Fargate は動的パブリック IP アドレス (Fargate の再作成後に変化する IP アドレス) を持ち、固定パブリック IP アドレスである Elastic IP アドレスを設定できない。

リクエストの先にある外部サービスが、セキュリティ上で静的な IP アドレスを要求する場合、リクエスト (パブリックネットワーク向き通信) 時に送信元パケットに付加される IP アドレスが動的になり、リクエストできなくなってしまう。

そこで、Fargate のリクエストが、Elastic IP アドレスを持つ AWS NAT Gateway を経由する (Fargate は、パブリックサブネットとプライベートサブネットのどちらに配置してもよい) 。

これによって、AWS NAT Gateway の Elastic IP アドレスが送信元パケットに付加されるため、Fargate の送信元 IP アドレスを見かけ上静的に扱えるようになる。

![NatGatewayを経由したFargateから外部サービスへのリクエスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/NatGatewayを経由したFargateから外部サービスへのリクエスト.png)

> - https://aws.amazon.com/jp/premiumsupport/knowledge-center/ecs-fargate-static-elastic-ip-address/

<br>

### Amazon ECS タスクの一時起動

#### ▼ DB マイグレーション

現在起動中の Amazon ECS タスクとは別に、新しいタスクを一時的に起動する。

CI/CD パイプライン上で実行する以外に、ローカルマシンから手動で実行する場合もある。

起動時に、`overrides` オプションを使用して、指定した Amazon ECS タスク定義のコンテナ設定を上書きできる。

正規表現で設定する必要があり、加えて JSON では『`\`』を『`\\`』にエスケープしなければならない。

コマンドが実行された後に、タスクは自動的に Stopped 状態になる。

**＊実装例＊**

Laravel の Seeder コマンドやロールバックコマンドを、ローカルマシンから実行する。

```bash
#!/bin/bash

set -x

echo "Set Variables"
SERVICE_NAME="dev-foo-ecs-service"
CLUSTER_NAME="dev-foo-ecs-cluster"
TASK_NAME="dev-foo-ecs-task-definition"
SUBNETS_CONFIG=$(aws ecs describe-services \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --query "services[].deployments[].networkConfiguration[].awsvpcConfiguration[].subnets[]")
SGS_CONFIG=$(aws ecs describe-services \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --query "services[].deployments[].networkConfiguration[].awsvpcConfiguration[].securityGroups[]")

# 実行したいコマンドをoverridesに設定する
# AWSのステージング環境では、動作確認のために使用する初期データを挿入する
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

注意点として、実行 IAM ユーザーを作成し、Amazon ECS タスクを起動できる必要最低限の認可スコープを紐付ける。

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

### Amazon ECS タスクのデプロイ手法

#### ▼ ローリングアップデート

`(1)`

: 最小ヘルス率の設定値を基に、ローリングアップデート時の稼働中タスクの最低合計数が決定される。

`(2)`

: 最大率の設定値を基に、ローリングアップデート時の稼働中/停止中タスクの最高合計数が決まる

`(3)`

: Amazon ECS は、既存タスクを稼働中のまま、新タスクを最高合計数いっぱいまで作成する。

`(4)`

: Amazon ECS は、待機時間後に ALB/NLB による新タスクに対するヘルスチェックの結果を確認する。ヘルスチェックが成功していれば、既存タスクを停止する。ただし、最小ヘルス率によるタスクの最低合計数が保たれる。

`(5)`

: 『新タスクの起動』と『ヘルスチェック確認後に既存タスクを停止する』プロセスが繰り返し実行され、徐々に既存タスクが新タスクに置き換わる。

`(6)`

: すべての既存タスクが新タスクに置き換わる。

![rolling-update](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/rolling-update.png)

> - [Amazon ECS でのコンテナデプロイの高速化 \| トリの部屋](https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments/)

#### ▼ ブルー/グリーンデプロイメント

CodeDeploy を使用してデプロイする。

<br>

### プライベートサブネット内の Fargate から Amazon VPC 外の AWS リソースへのアクセス

![ecs_vpc-endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_vpc-endpoint.png)

<table>
  <thead>
    <tr>
      <th>VPC エンドポイントの接続先</th>
      <th>タイプ</th>
      <th>プライベート DNS 名</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Amazon CloudWatch Logs</td>
      <td>Interface</td>
      <td><code>logs.ap-northeast-1.amazonaws.com</code></td>
      <td>Amazon ECS コンテナのログを POST リクエストを送信するため。</td>
    </tr>
    <tr>
      <td>Amazon ECR</td>
      <td>Interface</td>
      <td><code>api.ecr.ap-northeast-1.amazonaws.com</code><br><code>*.dkr.ecr.ap-northeast-1.amazonaws.com</code></td>
      <td>イメージの GET リクエストを送信するため。</td>
    </tr>
    <tr>
      <td>Amazon S3</td>
      <td>Gateway</td>
      <td>なし</td>
      <td>イメージのレイヤーを POST リクエストを送信するため</td>
    </tr>
    <tr>
      <td>AWS Systems Manager</td>
      <td>Interface</td>
      <td><code>ssm.ap-northeast-1.amazonaws.com</code></td>
      <td>AWS Systems Manager のパラメーターストアに GET リクエストを送信するため。</td>
    </tr>
    <tr>
      <td>AWS Secrets Manager</td>
      <td>Interface</td>
      <td><code>ssmmessage.ap-northeast-1.amazonaws.com</code></td>
      <td>AWS Secrets Manager を使用するため。</td>
    </tr>
  </tbody>
</table>

プライベートサブネット内の Fargate から VPC 外の AWS リソース (例：コントロールプレーン、Amazon ECR、Amazon S3、AWS Systems Manager、Amazon CloudWatch Logs、DynamoDB など) にリクエストを送信する場合、専用の VPC エンドポイントを設ける必要がある。

AWS NAT Gateway と VPC エンドポイントの両方を作成している場合、ルートテーブルでは、VPC エンドポイントへのリクエストのほうが優先される。

そのため、AWS NAT Gateway がある状態で VPC エンドポイントを作成すると、接続先が自動的に変わってしまうことに注意する。

注意点として、パブリックネットワークにリクエストを送信する場合は、VPC エンドポイントのみでなく AWS NAT Gateway も作成する必要がある。

> - https://docs.aws.amazon.com/AmazonECS/latest/userguide/vpc-endpoints.html#ecs-vpc-endpoint-ecsexec
> - [ECS FargateでVPCエンドポイントを使用する](https://zenn.dev/yoshinori_satoh/articles/ecs-fargate-vpc-endpoint)
> - [2つのVPCエンドポイントの違いを知る \| DevelopersIO](https://dev.classmethod.jp/articles/vpc-endpoint-gateway-type/)

<br>

### Fargate 上のコンテナへの接続

#### ▼ AWS SSM Session Manager を使用した Amazon ECS Exec

![fargate_ecs-exec](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fargate_ecs-exec.png)

AWS SSM Session Manager を使用して Amazon ECS タスク内のコンテナに接続し、コンテナのログインシェルを起動する。

AWS Systems Manager を使用してコンテナに接続する場合、コンテナのホストに systems-manager エージェントをインストールしておく必要がある。

ただし、AWS Fargate としての Amazon EC2 には、systems-manager エージェントがプリインストールされているため、これは不要である。

`(1)`

: Amazon ECS サービスで、ECS-Exec オプションを有効化する。

`(2)`

: Amazon VPC エンドポイントにて、ssmmessages エンドポイントを作成する。

`(3)`

: Amazon ECS タスク実行ロールに IAM ポリシーを付与する。

     これにより、Amazon ECSタスクがAWS SSM Session Managerにリクエストを送信できるようになる。

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

: Amazon ECS Exec の実行ユーザーに、IAM ポリシーを付与する。

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

: 事前の設定がなされているか否かを ecs-exec-checker スクリプトを実行して確認する。

> - [GitHub - aws-containers/amazon-ecs-exec-checker: 🚀 Pre-flight checks for ECS Exec · GitHub](https://github.com/aws-containers/amazon-ecs-exec-checker)

```bash
#!/bin/bash

ECS_CLUSTER_NAME=prd-foo-ecs-cluster
ECS_TASK_ID=bar

bash <(curl -Ls https://raw.githubusercontent.com/aws-containers/amazon-ecs-exec-checker/main/check-ecs-exec.sh) $ECS_CLUSTER_NAME $ECS_TASK_ID
```

`(6)`

: Amazon ECS タスク内のコンテナに接続し、コンテナのログインシェルを起動する。bash を実行するときに、『`/bin/bash`』や『`/bin/sh`』で指定すると、bin より上のパスも Amazon ECS に送信されてしまう。

     例えば、Windowsなら『```C:/Program Files/Git/usr/bin/bash```』を送信する。

     これはCloudTrailでExecuteCommandイベントとして確認できる。

     Amazon ECSコンテナ内ではbashへのパスが異なるため、接続に失敗する。そのため、bashを直接的に指定する。

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
> - [Reference: ec2messages, ssmmessages, and other API operations - AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-setting-up-messageAPIs.html)
> - https://qiita.com/Shohei_Miwa/items/6e04c9b7f4c0c862eb9e

<br>
