---
title: 【IT技術の知見】AWS：Amazon Web Service
description: AWS：Amazon Web Serviceの知見を記録しています。
---

# AWS：Amazon Web Service（F〜K）

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Global Accelerator

### セットアップ

#### ▼ 基本的設定

| 設定項目            | 説明                                     | 補足                                                      |
|-----------------|----------------------------------------|---------------------------------------------------------|
| Accelerator タイプ | エンドポイントグループへのルーティング時のアルゴリズムを設定する。      | Standard：ユーザーに最も近いリージョンにあるエンドポイントグループに、リクエストがルーティングされる。 |
| IPアドレスプール       | Global Acceleratorに割り当てる静的IPアドレスを設定する。 |                                                         |

#### ▼ リスナー

| 設定項目            | 説明                         | 補足                                                                                                                        |
|-----------------|----------------------------|---------------------------------------------------------------------------------------------------------------------------|
| ポート             | 宛先とするポート番号を設定する。           |                                                                                                                           |
| プロトコル           | ルーティング先のプロトコルを設定する。        |                                                                                                                           |
| Client affinity | ユーザーごとにルーティング先を固定するかを設定する。 | ・None：複数のルーティング先があった場合、各ユーザーの毎リクエスト時のルーティング先は固定されなくなる。<br>・Source IP：複数のルーティング先があったとしても、各ユーザーの毎リクエスト時のルーティング先を固定できるようになる。 |

#### ▼ エンドポイントグループ

| 設定項目               | 説明                                                         | 補足                                                         |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| エンドポイントグループ | 特定のリージョンに紐付くエンドポイントのグループを設定する。 | トラフィックダイヤルにて、各エンドポイントグループの重みを設定できる。 |
| トラフィックダイヤル   | 複数のエンドポイントグループがある場合、それぞれの重み（%）を設定する。 | ・例えば、カナリアリリースのために、新アプリと旧アプリへのルーティングに重みを付ける場合に役立つ。 |
| ヘルスチェック         | ルーティング先に対するヘルスチェックを設定する。             |                                                              |

#### ▼ エンドポイント

| 設定項目                     | 説明                                                         | 補足                                                         |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| エンドポイントタイプ         | ルーティング先のAWSリソースを設定する。                      | ALB、NLB、EC2、Elastic IPを選択できる。                      |
| 重み                         | 複数のエンドポイントがある場合、それぞれの重みを設定する。   | 各エンドポイントの重みの合計値を256とし、1～255で相対値を設定する。 |
| クライアントIPアドレスの保持 | ```X-Forwarded-For```ヘッダーにクライアントIPアドレスを含めてルーティングするか否かを設定する。 |                                                              |

<br>

### 素早いレスポンスの理由

![GlobalAccelerator](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/GlobalAccelerator.png)

最初、クライアントPCからのリクエストはエッジロケーションで受信される。プライベートネットワーク内のエッジロケーションを経由して、ルーティング先のリージョンまで届く。パブリックネットワークを使用しないため、小さなレイテシーでトラフィックをルーティングできる。

![GlobalAccelerator導入後](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/GlobalAccelerator導入後.png)

Global Acceleratorを使用しない場合、クライアントPCのリージョンから指定したリージョンに至るまで、いくつもパブリックネットワークを経由する必要があり、時間がかかってしまう。

![GlobalAccelerator導入前](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/GlobalAccelerator導入前.png)

以下のサイトで、Global Acceleratorを使用した場合としなかった場合のレスポンス速度を比較できる。

ℹ️ 参考：https://speedtest.globalaccelerator.aws/#/

<br>

## 02. Glue

### セットアップ

| 設定項目   | 説明                                                         | 補足                                                         |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ソース     | 元データを管理するデータウェアハウスやデータベースを設定する。 | データウェアハウスの方が、データベースよりも保存形式の柔軟性が高い。<br>ℹ️ 参考：https://www.topgate.co.jp/dwh-db-difference |
| ターゲット | 処理済データを管理するデータウェアハウスやデータベースを設定する。 |                                                              |

<br>

## 03. IAM：Identify and Access Management

### IAM

#### ▼ IAMとは

AWSリソースへのアクセスに関する認証/認可を制御する。認証はアクセスキーIDとシークレットアクセスキーによって、また認可はIAMロール/IAMポリシー/IAMステートメントによって制御される。

#### ▼ IAMロール

IAMポリシーのセットを定義する。

#### ▼ IAMポリシー

IAMステートメントのセットを定義する。

| IAMポリシーの種類                  | 説明                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| アイデンティティベースのポリシー   | IAMユーザー、IAMグループ、IAMロール、に紐付けるためのポリシーのこと。 |
| リソースベースのインラインポリシー | 単一のAWSリソースにインポリシーのこと。                      |
| アクセスコントロールポリシー       | ```.json```形式で定義する必要が無いポリシーのこと。                 |

**＊例＊**

以下に、EC2インスタンスの読み出しのみ認可スコープ（```AmazonEC2ReadOnlyAccess```）を紐付けできるポリシーを示す。このIAMポリシーには、他のAWSリソースに対する認可スコープも含まれている。

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ec2:Describe*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "elasticloadbalancing:Describe*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:ListMetrics",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:Describe*"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "autoscaling:Describe*",
      "Resource": "*"
    }
  ]
}
```

#### ▼ IAMステートメント

AWSリソースに関する認可のスコープを定義する。各アクションについては以下のリンクを参考にせよ。

| AWSリソースの種類 | リンク                                                       |
| ----------------- | ------------------------------------------------------------ |
| CloudWatchログ    | https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/permissions-reference-cwl.html |

**＊例＊**

以下のインラインポリシーが紐付けられたロールを持つAWSリソースは、任意の変数をSMパラメーターストアを取得できるようになる。

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

| Statementの項目 | 説明                                                 |
| --------------- | ---------------------------------------------------- |
| Sid             | 任意の一意な文字列を設定する。空文字でも良い。       |
| Effect          | 許可/拒否を設定する。                                |
| Action          | リソースに対して実行できるアクションを設定する。     |
| Resource        | アクションの実行対象に選択できるリソースを設定する。 |


以下に主要なアクションを示す。

| アクション名 | 説明                   |
| ------------ | ---------------------- |
| Create       | リソースを作成する。   |
| Describe     | リソースを表示する。   |
| Delete       | リソースを削除する。   |
| Get          | リソースを取得する。   |
| Put          | リソースを上書きする。 |

#### ▼ ARN：Amazon Resource Namespace

AWSリソースの識別子のこと。

ℹ️ 参考：https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Resource": "arn:<パーティション>:<AWSリソース>:ap-northeast-1:<アカウントID>:<AWSリソースID>"
    }
  ]
}
```

<br>

### IAMロール

#### ▼ サービスリンクロール

AWSリソースを作成した時に自動的に作成されるロール。他には紐付けできない専用のポリシーが紐付けられている。『```AWSServiceRoleFor*****```』という名前で自動的に作成される。特に設定せずとも、自動的にリソースに紐付けられる。関連するリソースを削除するまで、ロール自体できない。サービスリンクロールの一覧については、以下のリンクを参考にせよ。

ℹ️ 参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_aws-services-that-work-with-iam.html

#### ▼ クロスアカウントのアクセスロール  

#### ▼ プロバイダのアクセスロール  

<br>

### アイデンティティベースのポリシー

#### ▼ アイデンティティベースのポリシーとは

IAMユーザー、IAMグループ、IAMロール、に紐付けるためのポリシーのこと。

#### ▼ AWS管理ポリシー

AWSが提供しているポリシーのこと。紐付け式のポリシーのため、すでに紐付けられていても、他のものにも紐付けできる。

#### ▼ カスタマー管理ポリシー

ユーザーが独自に作成したポリシーのこと。すでに紐付けられていても、他のものにも紐付けできる。

#### ▼ インラインポリシー

単一のアイデンティティに紐付けるためのポリシーのこと。組み込み式のポリシーのため、アイデンティティ間で共有して紐付けできない。

**＊実装例＊**

IAMロールにインラインポリシーを紐付ける。このロールを持つユーザーは、ユーザーアカウントのすべての ACMのSSL証明書を一覧表示できるようになる。

```yaml
{
  "Version": "2012-10-17",
  "Statement":[
    {
      "Effect": "Allow",
      "Action": "acm:ListCertificates",
      "Resource": "*"
    }
  ]
}
```

**＊実装例＊**

IAMロールにインラインポリシーを紐付ける。このロールを持つユーザーは、全てのAWSリソースに、任意のアクションを実行できる。

```yaml
{
  "Version": "2012-10-17",
  "Statement":[
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }
  ]
}
```

<br>

### リソースベースのインラインポリシー

#### ▼ リソースベースのインラインポリシーとは

単一のAWSリソースにインポリシーのこと。すでに紐付けられていると、他のものには紐付けできない。

#### ▼ バケットポリシー

S3に紐付けられる、自身へのアクセスを制御するためのインラインポリシーのこと。

#### ▼ ライフサイクルポリシー

ECRに紐付けられる、コンテナイメージの有効期間を定義するポリシー。コンソール画面から入力できるため、基本的にポリシーの実装は不要であるが、IaCツール（例：Terraform）では必要になる。

**＊実装例＊**

```yaml
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images untagged",
      "selection": {
        "tagStatus": "untagged",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 2,
      "description": "Keep last 10 images any",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
```

#### ▼ 信頼ポリシー

ロールに紐付けられる、Assume Roleを行うためのインラインポリシーのこと。

**＊実装例＊**

例えば、以下の信頼ポリシーを任意のロールに紐付けしたとする。その場合、```Principal```の```ecs-tasks```が信頼されたエンティティと見なされ、ECSタスクにロールを紐付けできるようになる。

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

信頼ポリシーでは、IAMユーザーを信頼されたエンティティとして設定もできる。

**＊実装例＊**

例えば、以下の信頼ポリシーを任意のロールに紐付けしたとする。その場合、```Principal```のIAMユーザーが信頼されたエンティティと見なされ、ロールを紐付けできるようになる。

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<アカウントID>:user/<ユーザー名>"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "<適当な文字列>"
        }
      }
    }
  ]
}
```

<br>

### IAMポリシーを紐付けできる対象

#### ▼ IAMユーザーに対する紐付け

![IAMユーザにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IAMユーザーにポリシーを付与.jpeg)

#### ▼ IAMグループに対する紐付け

![IAMグループにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IAMグループにポリシーを付与.jpeg)

#### ▼ IAMロールに対する紐付け

![IAMロールにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IAMロールにポリシーを付与.jpeg)

<br>

### ルートユーザー、IAMユーザー

#### ▼ ルートユーザーとは

全ての認可スコープをもったアカウントのこと。

#### ▼ IAMユーザーとは

特定の認可スコープをもったアカウントのこと。

<br>

### IAMグループ

#### ▼ IAMグループとは

IAMユーザーをグループ化したもの。IAMグループごとにIAMロールを紐付けすれば、IAMユーザーのIAMロールを管理しやすくなる。

![グループ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/グループ.png)

#### ▼ IAMグループへのIAMロールの紐付け

IAMグループに対して、IAMロールを紐付ける。そのIAMグループに対して、IAMロールを紐付けしたいIAMユーザーを追加していく。

![グループに所属するユーザにロールを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/グループに所属するユーザーにロールを付与.png)

#### ▼ グループ一覧

| グループ名           | 説明                                         | 補足 |
|-----------------|--------------------------------------------| ---- |
| Administrator   | 全てのリソースに認可スコープがある。                             |      |
| PowerUserAccess | IAMのみが閲覧の認可スコープであり、それ以外のリソースに変更の認可スコープがある。 |      |
| ViewOnlyAccess  | 閲覧のみの認可スコープがある。                            |      |


<br>

## 04. Kinesis Data Streams

### Kinesis Data Streamsとは

リアルタイムなストリーミングデータ（例：動画データ、音声データ、など）を継続的に収集し、保管する。

ℹ️ 参考：https://docs.aws.amazon.com/streams/latest/dev/amazon-kinesis-streams.html

<br>

## 04-02. Kinesis Data Firehose（Kinesis Delivery Stream）

### Kinesis Data Firehoseとは

リアルタイムなストリーミングデータ（例：動画データ、音声データ、など）を継続的に収集し、保管/可視化/分析/レポート作成/アラートができる外部サービスやAWSリソースに転送する。転送時にLambda関数を使用することにより、収集したデータを加工できる。

ℹ️ 参考：https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html

<br>

### セットアップ

| 項目       | 説明                                                                                                          | 補足                                                                                                                                                        |
|----------|-------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| レコードの変換  | バッファーに蓄えられたログを、指定された形式で転送する前に、テキストの内容を変換する。                                                                 | Lambdaを使用する。<br>ℹ️ 参考：https://docs.aws.amazon.com/firehose/latest/dev/data-transformation.html                                                         |
| 転送先      | 転送先とするS3バケットを設定する。                                                                                          |                                                                                                                                                           |
| ディレクトリ名  | S3への転送時に、S3に作成するディレクトリの名前を設定できる。デフォルトで```YYYY/MM/dd/HH```形式でディレクトリが作成され、執筆時点（2021/11/09）では、UTCのみ設定できる。      | もしJSTにしたい場合はLambdaに変換処理を実装し、Kinesis Data Firehoseと連携する必要がある。<br>ℹ️ 参考：https://qiita.com/qiita-kurara/items/b697b65772cb0905c0f2#comment-ac3a2eb2f6d30a917549 |
| バッファー    | Kinesis Data Firehoseでは、受信したログを一旦バッファーに蓄え、一定期間あるいは一定サイズが蓄えられた時点で、ログファイルとして転送する。この時、バッファーに蓄える期間や上限サイズを設定できる。 | ℹ️ 参考：https://docs.aws.amazon.com/firehose/latest/dev/basic-deliver.html#frequency                                                                     |
| ファイル形式   | 転送時のファイル形式を設定できる。                                                                                           | ログファイルの最終到達地点がS3の場合は圧縮形式で問題ないが、S3から加えて他のツール（例：Datadog）に転送する場合はデータ形式を設定しない方が良い。                                                                            |
| バックアップ   | 収集したデータを加工する場合、加工前データを保管しておく。                                                                               |                                                                                                                                                           |
| 暗号化      |                                                                                                             |                                                                                                                                                           |
| エラーログの収集 | データの転送時にエラーが発生した場合、エラーログをCloudWatchログに送信する。                                                                 |                                                                                                                                                           |
| IAMロール   | Kinesis Data FirehoseがAWSリソースにデータを転送できるように、認可スコープを設定する。                                                         | KinesisではIAMロールの細やかな設定が正しく機能しないことがあり、最小認可スコープを諦め、FullAccess権限のロールを付与してしまう方がよい。最低限、CloudWatchログとS3の認可スコープが必要である。                                               |

<br>

## 04-03. Kinesis Data Analytics

### Kinesis Data Analyticsとは

リアルタイムなストリーミングデータ（例：動画データ、音声データ、など）を継続的に収集し、分析する。

ℹ️ 参考：https://docs.aws.amazon.com/kinesisanalytics/latest/dev/what-is.html

<br>

