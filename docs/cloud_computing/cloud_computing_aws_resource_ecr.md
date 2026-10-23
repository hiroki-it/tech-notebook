---
title: 【IT技術の知見】Amazon ECR＠AWSリソース
description: Amazon ECR＠AWSリソースの知見を記録しています。
---

# Amazon ECR＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Amazon ECR

### Amazon ECR とは

コンテナイメージや helm チャートを管理できる。

<br>

## 02. セットアップ

### コンソール画面の場合

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

### イメージのプッシュ

#### ▼ コンテナイメージの場合

`(1)`

: Amazon ECR にログインする。

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

: Amazon ECR にコンテナイメージをプッシュする。

```bash
# docker push <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
$ docker push <イメージリポジトリURL>:<バージョンタグ>
```

> - [Pushing a Docker image to an Amazon ECR private repository - Amazon ECR](https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html)

#### ▼ helm チャートの場合

調査中...

> - [Pushing a Helm chart to an Amazon ECR private repository - Amazon ECR](https://docs.aws.amazon.com/AmazonECR/latest/userguide/push-oci-artifact.html)

<br>

### ライフサイクル

#### ▼ ライフサイクルポリシー

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

### バージョンタグ

#### ▼ タグ名のベストプラクティス

Docker のベストプラクティスに則り、タグ名に `latest` を使用しないようにする。

代わりに、コンテナイメージのバージョンごとに異なるタグ名となるように、ハッシュ値 (例：GitHub のコミット ID) を使用する。

> - [Docker 開発のベストプラクティス \| Docker ドキュメント](https://matsuand.github.io/docs.docker.jp.onthefly/develop/dev-best-practices/)

<br>

### パーミッション

Amazon ECR へのアクセスの認可スコープを設定する。

AWS IAM ポリシーよりも強い。

```yaml
# 中央集権的にコンテナイメージを提供する Amazon ECR
{"Version": "2008-10-17", "Statement": [
      {
        "Sid": "AllowAccessFromMultipleAccount",
        "Effect": "Allow",
        "Principal": {
            # Amazon ECR に接続できる他の AWS アカウント
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

特に、DockerHub はレートリミットがあるため、DockerHub 上のリポジトリをプライベートリポジトリで管理しておくほうがよい。

このとき、プルスルーキャッシュリポジトリはコピーをプライベートリポジトリに自動的にプルしてくれる。

> - [Amazon ECRに「プルスルーキャッシュリポジトリ」機能が追加されました #reinvent \| DevelopersIO](https://dev.classmethod.jp/articles/ecr-pull-through-cache-repositories/)

<br>
