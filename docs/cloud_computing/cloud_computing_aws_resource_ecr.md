---
title: 【IT技術の知見】Amazon ECR
description: Amazon ECRの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# Amazon ECR

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


### Amazon ECR とは

コンテナイメージや helm チャートを管理できる。

<br>

## 02. 仕組み

## 03. セットアップ

### Terraformによる構築

terraform-aws-modules の ECR モジュールを使用し、既存のビルド用 IAM ロールが読み書きできるプライベートリポジトリを作成する。

この例では、イメージを自動削除するライフサイクルポリシーは作成しない。

```terraform
module "ecr" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "3.2.1"

  repository_name                   = "foo-app"
  repository_read_write_access_arns = ["arn:aws:iam::123456789012:role/foo-build"]
  create_lifecycle_policy           = false
}
```

> - [terraform-aws-modules/ecr/aws (3.2.1) - Terraform Registry](https://registry.terraform.io/modules/terraform-aws-modules/ecr/aws/3.2.1)

<br>

### リポジトリの初期設定

#### ▼ 設定項目と説明

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
      <td>可視性</td>
      <td>イメージリポジトリをパブリックあるいはプライベートにするかを設定する。</td>
      <td>さまざまなベンダーがパブリックリポジトリで Amazon ECR イメージを提供している。<br>・<a href="https://gallery.ecr.aws/">https://gallery.ecr.aws/</a></td>
    </tr>
    <tr>
      <td>タグのイミュータビリティ</td>
      <td>同じタグ名でイメージがプッシュされた場合、バージョンタグを上書きできる/できないかを設定できる。</td>
      <td>-</td>
    </tr>
    <tr>
      <td>プッシュ時にスキャン</td>
      <td>イメージがプッシュされたときに、コンテナイメージにインストールされているパッケージの脆弱性を検証し、一覧表示する。</td>
      <td>・<a href="https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html">https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html</a></td>
    </tr>
    <tr>
      <td>暗号化設定</td>
      <td>-</td>
      <td>-</td>
    </tr>
  </tbody>
</table>

<br>

## 04. イメージのプッシュ

### コンテナイメージの場合

1. Amazon ECR にログインする。

    ```bash
    $ aws ecr get-login-password --region ap-northeast-1 | \
        docker login --username AWS --password-stdin <イメージリポジトリURL>
    
    Login Succeeded
    ```

2. イメージにタグを付与する。

    ```bash
    # docker tag foo:latest <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
    $ docker tag <イメージID> <イメージリポジトリURL>:<バージョンタグ>
    ```

3. Amazon ECR にコンテナイメージをプッシュする。

    ```bash
    # docker push <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
    $ docker push <イメージリポジトリURL>:<バージョンタグ>
    ```

> - [Pushing a Docker image to an Amazon ECR private repository - Amazon ECR](https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html)

### helm チャートの場合

調査中...

> - [Pushing a Helm chart to an Amazon ECR private repository - Amazon ECR](https://docs.aws.amazon.com/AmazonECR/latest/userguide/push-oci-artifact.html)

<br>

## 05. イメージのライフサイクル

### ライフサイクルポリシー

Amazon ECR のコンテナイメージの有効期間を定義できる。

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
      <td>ルールの優先順位</td>
      <td>数字で、ルールの優先度を設定できる。</td>
      <td>数字が小さいほど、優先度は高くなる。数字は連続している必要はなく、例えば、<code>10</code>、<code>20</code>、<code>90</code> のように設定してもよい。</td>
    </tr>
    <tr>
      <td>イメージのステータス</td>
      <td>ルールを適用するイメージの条件として、タグの有無や文字列を設定できる。</td>
      <td></td>
    </tr>
    <tr>
      <td>一致条件</td>
      <td>イメージの有効期間として、同条件に当てはまるイメージが削除される閾値を設定できる。</td>
      <td>個数、プッシュされてからの期間や世代数などを閾値として設定できる。</td>
    </tr>
  </tbody>
</table>

> - [ECRのライフサイクルポリシー設定によるリポジトリ容量の節約 \| DevelopersIO](https://dev.classmethod.jp/articles/ecr-lifecycle/)

<br>

## 06. バージョンタグ

### タグ名のベストプラクティス

Docker のベストプラクティスに則り、タグ名に `latest` を使用しないようにする。

代わりに、コンテナイメージのバージョンごとに異なるタグ名となるように、ハッシュ値 (例：GitHub のコミット ID) を使用する。

> - [Docker 開発のベストプラクティス \| Docker ドキュメント](https://matsuand.github.io/docs.docker.jp.onthefly/develop/dev-best-practices/)

<br>

## 07. リポジトリのアクセス制御

Amazon ECR へのアクセスの認可スコープを設定する。

AWS IAM ポリシーよりも強い。

```json
// 中央集権的にコンテナイメージを提供する Amazon ECR
{"Version": "2008-10-17", "Statement": [
      {
        "Sid": "AllowAccessFromMultipleAccount",
        "Effect": "Allow",
        "Principal": {
            // Amazon ECR に接続できる他の AWS アカウント
            "AWS": ["arn:aws:iam::*****:root"],
          },
        // 操作の認可スコープ
        "Action":
          [
            "ecr:BatchCheckLayerAvailability",
            "ecr:BatchGetImage",
            "ecr:GetDownloadUrlForLayer",
            "ecr:ListImages",
            "ecr:StartLifecyclePolicyPreview",
          ],
      },
    ]}
```

<br>

## 08. プルスルーキャッシュ

特に、DockerHub はレートリミットがあるため、DockerHub 上のリポジトリをプライベートリポジトリで管理しておくほうがよい。

このとき、プルスルーキャッシュリポジトリはコピーをプライベートリポジトリに自動的にプルしてくれる。

> - [Amazon ECRに「プルスルーキャッシュリポジトリ」機能が追加されました #reinvent \| DevelopersIO](https://dev.classmethod.jp/articles/ecr-pull-through-cache-repositories/)

<br>
