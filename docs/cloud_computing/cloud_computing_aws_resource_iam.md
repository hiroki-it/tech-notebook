---
title: 【IT技術の知見】AWS IAM＠AWSリソース
description: AWS IAM＠AWSリソースの知見を記録しています。
---

# AWS IAM＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS IAMとは：Identify and Access Management

AWS リソースへのアクセスに関する認証/認可を制御する。

認証はアクセスキーID とシークレットアクセスキーによって、また認可は AWS IAM ロール/AWS IAM ポリシー/AWS IAM ステートメントによって制御される。

<br>

## 02. AWS IAMロール

### AWS IAMロールとは

AWS IAM ポリシーのセットを定義する。

<br>

### サービスリンクロール

AWS リソースを作成したときに自動的に作成されるロール。

他には紐付けできない専用のポリシーが紐付けられている。

『`AWSServiceRoleFor*****`』という名前で自動的に作成される。

特に設定せずとも、自動的にリソースに紐付けられる。

関連するリソースを削除するまで、ロール自体できない。

サービスリンクロールの一覧については、以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_aws-services-that-work-with-iam.html

<br>

### クロスアカウントのアクセスロール

記入中...

<br>

### プロバイダのアクセスロール

記入中...

<br>

## 03. AWS IAMポリシー

### アイデンティティベースのポリシー

#### ▼ アイデンティティベースのポリシーとは

AWS IAM ユーザー、AWS IAM グループ、AWS IAM ロール、に紐付けるためのポリシーのこと。

#### ▼ AWS管理ポリシー

AWS が提供しているポリシーのこと。

紐付け式のポリシーのため、すでに紐付けられていても、他のものにも紐付けできる。

#### ▼ カスタマー管理ポリシー

ユーザーが作成したポリシーのこと。

すでに紐付けられていても、他のものにも紐付けできる。

ただ、ユーザー定義の IAM ポリシーを再利用するべきではなく、IAM ロールとユーザー定義 IAM ポリシーを一対一にするべきである。

そのため、カスタマー管理ポリシーの代わりにインラインポリシーを使用するべきである。

#### ▼ インラインポリシー

単一のアイデンティティに紐付けるためのポリシーのこと。

組み込み式のポリシーのため、アイデンティティ間で共有して紐付けできない。

**＊実装例＊**

AWS IAM ロールにインラインポリシーを紐付ける。

このロールを持つユーザーは、ユーザーアカウントのすべての AWS Certificate Manager のサーバー証明書を一覧表示できるようになる。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [{"Effect": "Allow", "Action": "acm:ListCertificates", "Resource": "*"}],
}
```

**＊実装例＊**

AWS IAM ロールにインラインポリシーを紐付ける。

このロールを持つユーザーは、すべての AWS リソースに、任意のアクションを実行できる。

```yaml
{
  "Version": "2012-10-17",
  "Statement": [{"Effect": "Allow", "Action": "*", "Resource": "*"}],
}
```

<br>

### リソースベースのインラインポリシー

#### ▼ リソースベースのインラインポリシーとは

単一の AWS リソースにインポリシーのこと。

すでに紐付けられていると、他のものには紐付けできない。

**＊例＊**

以下に、EC2 の読み出しのみ認可スコープ (`AmazonEC2ReadOnlyAccess`) を紐付けできるポリシーを示す。

この AWS IAM ポリシーには、他の AWS リソースに対する認可スコープも含まれている。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {"Effect": "Allow", "Action": "ec2:Describe*", "Resource": "*"},
      {
        "Effect": "Allow",
        "Action": "elasticloadbalancing:Describe*",
        "Resource": "*",
      },
      {
        "Effect": "Allow",
        "Action":
          [
            "cloudwatch:ListMetrics",
            "cloudwatch:GetMetricStatistics",
            "cloudwatch:Describe*",
          ],
        "Resource": "*",
      },
      {"Effect": "Allow", "Action": "autoscaling:Describe*", "Resource": "*"},
    ],
}
```

#### ▼ バケットポリシー

S3 に紐付けられる、自身へのアクセスを制御するためのインラインポリシーのこと。

#### ▼ ライフサイクルポリシー

Amazon ECR に紐付けられる、コンテナイメージの有効期間を定義するポリシー。

コンソール画面から入力できるため、基本的にポリシーの実装は不要であるが、IaC ツール (例：Terraform) では必要になる。

**＊実装例＊**

```yaml
{
  "rules":
    [
      {
        "rulePriority": 1,
        "description": "Keep last 10 images untagged",
        "selection":
          {
            "tagStatus": "untagged",
            "countType": "imageCountMoreThan",
            "countNumber": 10,
          },
        "action": {"type": "expire"},
      },
      {
        "rulePriority": 2,
        "description": "Keep last 10 images any",
        "selection":
          {
            "tagStatus": "any",
            "countType": "imageCountMoreThan",
            "countNumber": 10,
          },
        "action": {"type": "expire"},
      },
    ],
}
```

#### ▼ 信頼ポリシー

ロールに紐付けられる、Assume Role を実行するためのインラインポリシーのこと。

**＊実装例＊**

例えば、以下の信頼ポリシーを任意のロールに紐付けしたとする。その場合、`Principal` の `ecs-tasks` が信頼されたエンティティと見なされ、ECS タスクにロールを紐付けできるようになる。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Principal": {"Service": "ecs-tasks.amazonaws.com"},
        "Action": "sts:AssumeRole",
      },
    ],
}
```

信頼ポリシーでは、AWS IAM ユーザーを信頼されたエンティティとして設定もできる。

**＊実装例＊**

例えば、以下の信頼ポリシーを任意のロールに紐付けしたとする。

その場合、`Principal` の AWS IAM ユーザーが信頼されたエンティティと見なされ、ロールを紐付けできるようになる。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Principal":
          {"AWS": "arn:aws:iam::<AWSアカウントID>:user/<ユーザー名>"},
        "Action": "sts:AssumeRole",
        "Condition": {
            # 完全一致
            "StringEquals": {"sts:ExternalId": "<適当な文字列>"},
          },
      },
    ],
}
```

<br>

### アクセスコントロールポリシー

`json` 形式で定義する必要がないポリシーのこと。

<br>

## 03-02. AWS IAMポリシーの構造

### 構造

```yaml
{
  # Sid
  "Sid": "foo",
  # Version
  "Version": "2012-10-17",
  # Statement (AWS IAMステートメント)
  "Statement": [
      {
        # 許可する
        "Effect": "Allow",
        # SSMのAPIへのGetParametersのコールを指定する
        "Action": ["ssm:GetParameters"],
        # 任意のAWSソースを対象とする
        "Resource": "*",
      },
    ],
}
```

<br>

### Sid

任意の一意な文字列を設定する。

空文字でもよい。

<br>

### Version

記入中...

<br>

### Statement (AWS IAMステートメント)

#### ▼ Statementとは

AWS リソースに関する認可のスコープを定義する。

#### ▼ Effect

許可/拒否を設定する。

#### ▼ Action

指定した AWS リソースの API に対するコールを設定する。

以下に主要なアクションを示す。

| アクション名 | 説明                   |
| ------------ | ---------------------- |
| Create       | リソースを作成する。   |
| Describe     | リソースを表示する。   |
| Delete       | リソースを削除する。   |
| Get          | リソースを取得する。   |
| Put          | リソースを上書きする。 |

#### ▼ Resource

アクションの実行対象に選択できるリソースを設定する。

ARN で AWS リソースの識別子を設定する。

リージョンのグループには、`aws`、`aws-cn` (中国系ネットワーク) 、`aws-cn` (政府系ネットワーク) がある。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Resource": "arn:<リージョンのグループ>:<AWSリソース>:ap-northeast-1:<AWSアカウントID>:<AWSリソースID>",
      },
    ],
}
```

> - https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html

#### ▼ Condition

信頼されたエンティティの設定でよく使用する。

AWS IAM ポリシーの取得に使用する文字列の条件の厳格さを設定する。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Principal":
          {"AWS": "arn:aws:iam::<AWSアカウントID>:user/<ユーザー名>"},
        "Action": "sts:AssumeRole",
        "Condition": {
            # 完全一致
            "StringEqual": {"sts:ExternalId": "foo"},
          },
      },
    ],
}
```

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Principal":
          {"AWS": "arn:aws:iam::<AWSアカウントID>:user/<ユーザー名>"},
        "Action": "sts:AssumeRole",
        "Condition": {
            # OR条件
            "StringEqual": {
                # リスト型にすることでOR上限になる
                "sts:ExternalId": ["foo", "bar"],
              },
          },
      },
    ],
}
```

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Principal":
          {"AWS": "arn:aws:iam::<AWSアカウントID>:user/<ユーザー名>"},
        "Action": "sts:AssumeRole",
        "Condition": {
            # 部分一致 (ワイルドカードを使用できる)
            "StringLike": {"sts:ExternalId": "foo-*"},
          },
      },
    ],
}
```

> - https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html
> - https://zenn.dev/toshikish/articles/2d9274783acbae

タグを条件として使用できる。

```yaml
{"Version": "2012-10-17", "Statement": [
      {
        "Effect": "Allow",
        # EC2を起動する
        "Action": "ec2:RunInstances",
        "Resource": "arn:aws:ec2:*:account-id:launch-template/*",
        "Condition": {
            # 特定のタグを持つ起動テンプレートのみを指定できる
            "StringEquals": {"ec2:ResourceTag/foo": "foo"},
          },
      },
    ]}
```

> - https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-launch-template-permissions.html#policy-example-launch-template-ex1

<br>

## 03-03. AWS IAMポリシーを紐付けできる対象

### AWS IAMユーザーに対する紐付け

![AWS IAMユーザにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IAMユーザーにポリシーを付与.jpeg)

<br>

### AWS IAMグループに対する紐付け

![AWS IAMグループにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IAMグループにポリシーを付与.jpeg)

<br>

### AWS IAMロールに対する紐付け

![AWS IAMロールにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IAMロールにポリシーを付与.jpeg)

<br>

## 04. ルートユーザー、AWS IAMユーザー

### ルートユーザーとは

すべての認可スコープをもったアカウントのこと。

<br>

### AWS IAMユーザーとは

特定の認可スコープをもったアカウントのこと。

<br>

## 05. AWS IAMグループ

### AWS IAMグループとは

AWS IAM ユーザーをグループ化したもの。

AWS IAM グループごとに AWS IAM ロールを紐付けすれば、AWS IAM ユーザーの AWS IAM ロールを管理しやすくなる。

![グループ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/グループ.png)

<br>

### AWS IAMグループへのAWS IAMロールの紐付け

AWS IAM グループに対して、AWS IAM ロールを紐付ける。

その AWS IAM グループに対して、AWS IAM ロールを紐付けしたい AWS IAM ユーザーを追加していく。

![グループに属するユーザにロールを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/グループに所属するユーザーにロールを付与.png)

<br>

### グループ一覧

| グループ名      | 説明                                                                                     | 補足 |
| --------------- | ---------------------------------------------------------------------------------------- | ---- |
| Administrator   | すべてのリソースに認可スコープがある。                                                     |      |
| PowerUserAccess | AWS IAMのみが参照の認可スコープであり、それ以外のAWSリソースに変更の認可スコープがある。 |      |
| ViewOnlyAccess  | 参照のみの認可スコープがある。                                                           |      |

<br>
