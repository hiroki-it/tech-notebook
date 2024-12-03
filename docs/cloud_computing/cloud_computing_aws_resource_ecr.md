---
title: 【IT技術の知見】AWS ECR＠AWSリソース
description: AWS ECR＠AWSリソースの知見を記録しています。
---

# AWS ECR＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS ECR

### AWS ECRとは

コンテナイメージやhelmチャートを管理できる。

<br>

## 02. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

| 設定項目                 | 説明                                                                                                             | 補足                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 可視性                   | イメージリポジトリをパブリックあるいはプライベートにするかを設定する。                                           | 様々なベンダーがパブリックリポジトリでAWS ECRイメージを提供している。<br>・https://gallery.ecr.aws/ |
| タグのイミュータビリティ | 同じタグ名でイメージがプッシュされた場合、バージョンタグを上書きできる/できないかを設定できる。                  | -                                                                                                   |
| プッシュ時にスキャン     | イメージがプッシュされた時に、コンテナイメージにインストールされているパッケージの脆弱性を検証し、一覧表示する。 | ・https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html                        |
| 暗号化設定               | -                                                                                                                | -                                                                                                   |

<br>

### イメージのプッシュ

#### ▼ コンテナイメージの場合

`(1)`

: AWS ECRにログインする。

```bash
$ aws ecr get-login-password --region ap-northeast-1 | \
    docker login --username AWS --password-stdin <イメージリポジトリURL>

Login Succeeded
```

`(2)`

: イメージにタグを付与する。

```bash
# docker tag foo:latest <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
$ docker tag <イメージID> <イメージリポジトリURL>:<バージョンタグ>
```

`(3)`

: AWS ECRにコンテナイメージをプッシュする。

```bash
# docker push <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
$ docker push <イメージリポジトリURL>:<バージョンタグ>
```

> - https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html

#### ▼ helmチャートの場合

調査中...

> - https://docs.aws.amazon.com/AmazonECR/latest/userguide/push-oci-artifact.html

<br>

### ライフサイクル

#### ▼ ライフサイクルポリシー

AWS ECRのコンテナイメージの有効期間を定義できる。

| 設定項目             | 説明                                                                               | 補足                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ルールの優先順位     | 数字で、ルールの優先度を設定できる。                                               | 数字が小さいほど、優先度は高くなる。数字は連続している必要はなく、例えば、`10`、`20`、`90`、のように設定しても良い。 |
| イメージのステータス | ルールを適用するイメージの条件として、タグの有無や文字列を設定できる。             |                                                                                                                      |
| 一致条件             | イメージの有効期間として、同条件に当てはまるイメージが削除される閾値を設定できる。 | 個数、プッシュされてからの期間などを閾値として設定できる。                                                           |

<br>

### バージョンタグ

#### ▼ タグ名のベストプラクティス

Dockerのベストプラクティスに則り、タグ名に`latest`を使用しないようにする。

代わりに、コンテナイメージのバージョンごとに異なるタグ名になるようハッシュ値 (例：GitHubのコミットID) を使用する。

> - https://matsuand.github.io/docs.docker.jp.onthefly/develop/dev-best-practices/

<br>

### パーミッション

AWS ECRへのアクセスの認可スコープを設定する。

AWS IAMポリシーよりも強い。

```yaml
# 中央集権的にコンテナイメージを提供するAWS ECR
{"Version": "2008-10-17", "Statement": [
      {
        "Sid": "AllowAccessFromMultipleAccount",
        "Effect": "Allow",
        "Principal": {
            # AWS ECRにアクセスできる他のAWSアカウント
            "AWS": ["arn:aws:iam::*****:root"],
          },
        # 操作の認可スコープ
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

### プルスルーキャッシュリポジトリ

特に、DockerHubはレートリミットがあるため、DockerHub上のリポジトリをプライベートリポジトリで管理しておく方が良い。

この時、プルスルーキャッシュリポジトリはコピーをプライベートリポジトリに自動的にプルしてくれる。

> - https://dev.classmethod.jp/articles/ecr-pull-through-cache-repositories/

<br>
