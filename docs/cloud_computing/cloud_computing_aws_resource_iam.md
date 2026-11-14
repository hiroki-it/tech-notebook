---
title: 【IT技術の知見】AWS IAM
description: AWS IAMの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# AWS IAM

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要

AWS リソースへのアクセスに関する認証/認可を制御する。

<br>

## 02. 仕組み

### 認証と認可

認証はアクセスキーID とシークレットアクセスキーによって、また認可は AWS IAM ロール/AWS IAM ポリシー/AWS IAM ステートメントによって制御される。

## 03. セットアップ

### Terraformによる構築



## 04. ユーザー管理

### ルートユーザーとは

すべての認可スコープをもったアカウントのこと。

<br>

### AWS IAM ユーザーとは

特定の認可スコープをもったアカウントのこと。

<br>

## 05. グループ管理

### AWS IAM グループとは

AWS IAM ユーザーをグループ化したもの。

AWS IAM グループごとに AWS IAM ロールを紐付けすれば、AWS IAM ユーザーの AWS IAM ロールを管理しやすくなる。

![グループ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/グループ.png)

<br>

### AWS IAM グループへの AWS IAM ロールの紐付け

AWS IAM グループに対して、AWS IAM ロールを紐付ける。

その AWS IAM グループに対して、AWS IAM ロールを紐付けしたい AWS IAM ユーザーを追加していく。

![グループに属するユーザにロールを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/グループに所属するユーザーにロールを付与.png)

<br>

### グループ一覧

<table>
  <thead>
    <tr>
      <th>グループ名</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Administrator</td>
      <td>すべてのリソースに認可スコープがある。</td>
      <td></td>
    </tr>
    <tr>
      <td>PowerUserAccess</td>
      <td>AWS IAM のみが参照の認可スコープであり、それ以外の AWS リソースに変更の認可スコープがある。</td>
      <td></td>
    </tr>
    <tr>
      <td>ViewOnlyAccess</td>
      <td>参照のみの認可スコープがある。</td>
      <td></td>
    </tr>
  </tbody>
</table>

<br>
## 06. ロールによる権限の付与

### AWS IAM ロールとは

AWS IAM ポリシーのセットを定義する。

<br>

### サービスリンクロール

AWS リソースを作成したときに自動的に作成されるロール。

他には紐付けできない専用のポリシーが紐付けられている。

『`AWSServiceRoleFor*****`』という名前で自動的に作成される。

特に設定せずとも、自動的にリソースに紐付けられる。

関連するリソースを削除するまで、ロール自体を削除できない。

サービスリンクロールの一覧については、以下のリンクを参考にせよ。

> - [AWS services that work with IAM - AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_aws-services-that-work-with-iam.html)

<br>

### クロスアカウントのアクセスロール

信頼ポリシーで別の AWS アカウントを信頼し、その AWS アカウントのプリンシパルが `sts:AssumeRole` で引き受けられるようにしたロール。

<br>

### プロバイダのアクセスロール

信頼ポリシーで OIDC や SAML の ID プロバイダーを信頼し、ID プロバイダーで認証したユーザーが `sts:AssumeRoleWithWebIdentity` や `sts:AssumeRoleWithSAML` で引き受けられるようにしたロール。

<br>

## 07. ポリシーによるアクセス制御

### アイデンティティベースのポリシー

#### ▼ アイデンティティベースのポリシーとは

AWS IAM ユーザー、AWS IAM グループ、AWS IAM ロール、に紐付けるためのポリシーのこと。

#### ▼ AWS 管理ポリシー

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

AWS IAM ロールにインラインポリシーを紐付ける。

このロールを持つユーザーは、ユーザーアカウントのすべての AWS Certificate Manager のサーバー証明書を一覧表示できるようになる。

```json
{
  "Version": "2012-10-17",
  "Statement":
    [{"Effect": "Allow", "Action": "acm:ListCertificates", "Resource": "*"}],
}
```

AWS IAM ロールにインラインポリシーを紐付ける。

このロールを持つユーザーは、すべての AWS リソースに、任意のアクションを実行できる。

```json
{
  "Version": "2012-10-17",
  "Statement": [{"Effect": "Allow", "Action": "*", "Resource": "*"}],
}
```

<br>

### リソースベースのインラインポリシー

#### ▼ リソースベースのインラインポリシーとは

単一の AWS リソースに紐付けるためのインラインポリシーのこと。

すでに紐付けられていると、他のものには紐付けできない。

以下に、EC2 の読み出しのみ認可スコープ (`AmazonEC2ReadOnlyAccess`) を紐付けできるポリシーを示す。

この AWS IAM ポリシーには、他の AWS リソースに対する認可スコープも含まれている。

```json
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

```json
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

例えば、以下の信頼ポリシーを任意のロールに紐付けしたとする。その場合、`Principal` の `ecs-tasks` が信頼されたエンティティと見なされ、ECS タスクにロールを紐付けできるようになる。

```json
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

例えば、以下の信頼ポリシーを任意のロールに紐付けしたとする。

その場合、`Principal` の AWS IAM ユーザーが信頼されたエンティティと見なされ、ロールを紐付けできるようになる。

```json
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
            // 完全一致
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

### ポリシーの記述方法

#### 構造

```json
{
  // Sid
  "Sid": "foo",
  // Version
  "Version": "2012-10-17",
  // Statement (AWS IAM ステートメント)
  "Statement": [
      {
        // 許可する
        "Effect": "Allow",
        // SSM の API への GetParameters のコールを指定する
        "Action": ["ssm:GetParameters"],
        // 任意の AWS ソースを対象とする
        "Resource": "*",
      },
    ],
}
```

<br>

#### Sid

任意の一意な文字列を設定する。

空文字でもよい。

<br>

#### Version

ポリシー言語のバージョンを設定し、現在のバージョンである `2012-10-17` を設定する。

<br>

#### Statement (AWS IAM ステートメント)

##### ▼ Statement とは

AWS リソースに関する認可のスコープを定義する。

##### ▼ Effect

許可/拒否を設定する。

##### ▼ Action

指定した AWS リソースの API に対するコールを設定する。

以下に主要なアクションを示す。

<table>
  <thead>
    <tr>
      <th>アクション名</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Create</td>
      <td>リソースを作成する。</td>
    </tr>
    <tr>
      <td>Describe</td>
      <td>リソースを表示する。</td>
    </tr>
    <tr>
      <td>Delete</td>
      <td>リソースを削除する。</td>
    </tr>
    <tr>
      <td>Get</td>
      <td>リソースを取得する。</td>
    </tr>
    <tr>
      <td>Put</td>
      <td>リソースを上書きする。</td>
    </tr>
  </tbody>
</table>

##### ▼ Resource

アクションの実行対象に選択できるリソースを設定する。

ARN で AWS リソースの識別子を設定する。

リージョンのグループには、`aws`、`aws-cn` (中国系ネットワーク) 、`aws-us-gov` (政府系ネットワーク) がある。

```json
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

##### ▼ Condition

信頼されたエンティティの設定でよく使用する。

AWS IAM ポリシーの取得に使用する文字列の条件の厳格さを設定する。

```json
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
            // 完全一致
            "StringEqual": {"sts:ExternalId": "foo"},
          },
      },
    ],
}
```

```json
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
            // OR 条件
            "StringEqual": {
                // リスト型にすることで OR 上限になる
                "sts:ExternalId": ["foo", "bar"],
              },
          },
      },
    ],
}
```

```json
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
            // 部分一致 (ワイルドカードを使用できる)
            "StringLike": {"sts:ExternalId": "foo-*"},
          },
      },
    ],
}
```

> - [IAM JSON policy elements: Condition operators - AWS Identity and Access Management](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html)
> - [AWS IAM ポリシーの StringNotEquals 条件の複数値指定は AND になる](https://zenn.dev/toshikish/articles/2d9274783acbae)

タグを条件として使用できる。

```json
{"Version": "2012-10-17", "Statement": [
      {
        "Effect": "Allow",
        // EC2 を起動する
        "Action": "ec2:RunInstances",
        "Resource": "arn:aws:ec2:*:account-id:launch-template/*",
        "Condition": {
            // 特定のタグを持つ起動テンプレートのみを指定できる
            "StringEquals": {"ec2:ResourceTag/foo": "foo"},
          },
      },
    ]}
```

> - [Control Amazon EC2 launch template usage in Auto Scaling groups - Amazon EC2 Auto Scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-launch-template-permissions.html#policy-example-launch-template-ex1)

<br>

### ポリシーの紐付け

#### AWS IAM ユーザーに対する紐付け

AWS IAM ユーザーに AWS IAM ポリシーを直接紐付けると、AWS IAM ユーザーは紐付けた AWS IAM ポリシーの認可スコープをもち、同じ AWS IAM ポリシーを複数の AWS IAM ユーザーで共有できる。

![AWS IAMユーザにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IAMユーザーにポリシーを付与.jpeg)

<br>

#### AWS IAM グループに対する紐付け

AWS IAM グループに AWS IAM ポリシーを紐付けると、AWS IAM グループに所属する AWS IAM ユーザーがまとめて同じ認可スコープをもつため、AWS IAM ユーザーごとに AWS IAM ポリシーを紐付けずに済む。

![AWS IAMグループにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IAMグループにポリシーを付与.jpeg)

<br>

#### AWS IAM ロールに対する紐付け

AWS IAM ロールに AWS IAM ポリシーを紐付けると、AWS IAM ロールを割り当てた EC2 などの AWS リソースが、AWS IAM ポリシーの認可スコープで他の AWS リソースを操作できる。

![AWS IAMロールにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IAMロールにポリシーを付与.jpeg)

<br>
