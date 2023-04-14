---
title: 【IT技術の知見】IAM＠Iで始まるAWSリソース
description: IAM＠Iで始まるAWSリソースの知見を記録しています。
---

# IAM＠`I`で始まるAWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. IAMとは：Identify and Access Management

AWSリソースへのアクセスに関する認証/認可を制御する。

認証はアクセスキーIDとシークレットアクセスキーによって、また認可はIAMロール/IAMポリシー/IAMステートメントによって制御される。

<br>

## 02. IAMロール

### IAMロールとは

IAMポリシーのセットを定義する。

<br>

### サービスリンクロール

AWSリソースを作成した時に自動的に作成されるロール。

他には紐付けできない専用のポリシーが紐付けられている。

『`AWSServiceRoleFor*****`』という名前で自動的に作成される。

特に設定せずとも、自動的にリソースに紐付けられる。

関連するリソースを削除するまで、ロール自体できない。

サービスリンクロールの一覧については、以下のリンクを参考にせよ。

> ↪️ 参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_aws-services-that-work-with-iam.html

<br>

### クロスアカウントのアクセスロール

記入中...

<br>

### プロバイダのアクセスロール

記入中...

<br>

## 03. IAMポリシー

### アイデンティティベースのポリシー

#### ▼ アイデンティティベースのポリシーとは

IAMユーザー、IAMグループ、IAMロール、に紐付けるためのポリシーのこと。

#### ▼ AWS管理ポリシー

AWSが提供しているポリシーのこと。

紐付け式のポリシーのため、すでに紐付けられていても、他のものにも紐付けできる。

#### ▼ カスタマー管理ポリシー

ユーザーが独自に作成したポリシーのこと。

すでに紐付けられていても、他のものにも紐付けできる。

#### ▼ インラインポリシー

単一のアイデンティティに紐付けるためのポリシーのこと。

組み込み式のポリシーのため、アイデンティティ間で共有して紐付けできない。

**＊実装例＊**

IAMロールにインラインポリシーを紐付ける。

このロールを持つユーザーは、ユーザーアカウントのすべての ACMのSSL証明書を一覧表示できるようになる。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [{"Effect": "Allow", "Action": "acm:ListCertificates", "Resource": "*"}],
}
```

**＊実装例＊**

IAMロールにインラインポリシーを紐付ける。

このロールを持つユーザーは、全てのAWSリソースに、任意のアクションを実行できる。

```yaml
{
  "Version": "2012-10-17",
  "Statement": [{"Effect": "Allow", "Action": "*", "Resource": "*"}],
}
```

<br>

### リソースベースのインラインポリシー

#### ▼ リソースベースのインラインポリシーとは

単一のAWSリソースにインポリシーのこと。

すでに紐付けられていると、他のものには紐付けできない。

**＊例＊**

以下に、EC2インスタンスの読み出しのみ認可スコープ (`AmazonEC2ReadOnlyAccess`) を紐付けできるポリシーを示す。

このIAMポリシーには、他のAWSリソースに対する認可スコープも含まれている。

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

S3に紐付けられる、自身へのアクセスを制御するためのインラインポリシーのこと。

#### ▼ ライフサイクルポリシー

ECRに紐付けられる、コンテナイメージの有効期間を定義するポリシー。

コンソール画面から入力できるため、基本的にポリシーの実装は不要であるが、IaCツール (例：Terraform) では必要になる。

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

ロールに紐付けられる、Assume Roleを行うためのインラインポリシーのこと。

**＊実装例＊**

例えば、以下の信頼ポリシーを任意のロールに紐付けしたとする。その場合、`Principal`の`ecs-tasks`が信頼されたエンティティと見なされ、ECSタスクにロールを紐付けできるようになる。

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

信頼ポリシーでは、IAMユーザーを信頼されたエンティティとして設定もできる。

**＊実装例＊**

例えば、以下の信頼ポリシーを任意のロールに紐付けしたとする。

その場合、`Principal`のIAMユーザーが信頼されたエンティティと見なされ、ロールを紐付けできるようになる。

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

`.json`形式で定義する必要が無いポリシーのこと。

<br>

## 03-02. IAMポリシーの構造

### 構造

```yaml
{
  # Sid
  "Sid": "foo",
  # Version
  "Version": "2012-10-17",
  # Statement (IAMステートメント)
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

空文字でも良い。

<br>

### Version

記入中...

<br>

### Statement (IAMステートメント)

#### ▼ Statementとは

AWSリソースに関する認可のスコープを定義する。

#### ▼ Effect

許可/拒否を設定する。

#### ▼ Action

指定したAWSリソースのAPIに対するコールを設定する。

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

ARNでAWSリソースの識別子を設定する。

リージョンのグループには、`aws`、`aws-cn` (中国系ネットワーク) 、`aws-cn` (政府系ネットワーク) 、がある。

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

> ↪️ 参考：https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html

#### ▼ Condition

信頼されたエンティティの設定でよく使う。

IAMポリシーの取得に使用する文字列の条件の厳格さを設定する。

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
            # 部分一致
            "StringLike": {"sts:ExternalId": "foo-*"},
          },
      },
    ],
}
```

> ↪️ 参考：https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html

<br>

## 03-03. IAMポリシーを紐付けできる対象

### IAMユーザーに対する紐付け

![IAMユーザにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IAMユーザーにポリシーを付与.jpeg)

<br>

### IAMグループに対する紐付け

![IAMグループにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IAMグループにポリシーを付与.jpeg)

<br>

### IAMロールに対する紐付け

![IAMロールにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IAMロールにポリシーを付与.jpeg)

<br>

## 04. ルートユーザー、IAMユーザー

### ルートユーザーとは

全ての認可スコープをもったアカウントのこと。

<br>

### IAMユーザーとは

特定の認可スコープをもったアカウントのこと。

<br>

## 05. IAMグループ

### IAMグループとは

IAMユーザーをグループ化したもの。

IAMグループごとにIAMロールを紐付けすれば、IAMユーザーのIAMロールを管理しやすくなる。

![グループ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/グループ.png)

<br>

### IAMグループへのIAMロールの紐付け

IAMグループに対して、IAMロールを紐付ける。

そのIAMグループに対して、IAMロールを紐付けしたいIAMユーザーを追加していく。

![グループに所属するユーザにロールを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/グループに所属するユーザーにロールを付与.png)

<br>

### グループ一覧

| グループ名      | 説明                                                                              | 補足 |
| --------------- | --------------------------------------------------------------------------------- | ---- |
| Administrator   | 全てのリソースに認可スコープがある。                                              |      |
| PowerUserAccess | IAMのみが参照の認可スコープであり、それ以外のリソースに変更の認可スコープがある。 |      |
| ViewOnlyAccess  | 参照のみの認可スコープがある。                                                    |      |

<br>
