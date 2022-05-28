---
title: 【知見を記録するサイト】DevOps
description: DevOpsの知見をまとめました。
---

# DevOps

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. DevOpsとは

開発者と運用者が協調して開発と運用を行い、システムを継続的に改善する手法論のこと。DevOpsは優れたリリースにつながる。

参考：https://e-words.jp/w/DevOps.html

<br>

## 01-02. 優れたリリース

### 優れたリリースとは

#### ▼ リリースが自動化されていること

アプリケーションのリリースまでの各ステップ（ビルド、テスト、デプロイ）を自動化する。これにより、リリースがより簡単になり、ヒューマンエラーを防げる。DevOpsのCI/CDパイプラインを導入することによりこれを実現する。

参考：https://www.atlassian.com/ja/agile/software-development/release

#### ▼ ビッグバンリリースではないこと

アプリケーションのリリースの粒度を小さくし、小さなリリースを頻繁に行う。これにより、人間の確認範囲を小さくし、リリース時に予期せぬ問題が起こることを防げる。アジャイル開発やマイクロサービスアーキテクチャを導入することによりこれを実現する。

参考：https://www.atlassian.com/ja/agile/software-development/release

#### ▼ リリース内容がわかるようにしておく

リリース内容がわかるように、タスクやプルリクへのリンクを明記しておく。これにより、リリース時の予期せぬ問題を即解決できる。リリースノートやPRRモデルを導入することによりこれを実現する。

参考：

- https://www.atlassian.com/ja/agile/software-development/release
- https://tech-blog.optim.co.jp/entry/2020/07/01/080000

<br>

## 01-03. CI/CDパイプライン

### CI/CDパイプラインとは

CIパイプラインとCDパイプラインを組み合わせた手法のこと。

参考：https://www.redhat.com/ja/topics/devops/what-cicd-pipeline

![CICDパイプライン](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CICDパイプライン.png)

<br>

### 構成要素

#### ▼ CI：Continuous Integration

アプリケーションの機能追加/変更/削除からテストまでを『自動的』かつ『継続的に』行う。

参考：https://tracpath.com/works/devops/11_topics_for_devops/

| ステップ | 詳細                    | 自動化の可否 | 説明                       |
|------|-----------------------|--------|--------------------------|
| ビルド  | Build                 | ⭕️     | CIツールとIaCツールで自動化できる。     |
| テスト  | Unitテスト、Functionalテスト | ⭕️     | CIツールとテストフレームワークで自動化できる。 |
|      | Integrationテスト        | ✖️     | テスト仕様書を作成し、動作を確認する必要がある。 |
|      | コーディング規約に関するReview    | ⭕️     | CIツールと静的解析ツールで自動化できる。    |
|      | 仕様に関するReview          | ✖️     | GitHub上でレビューする必要がある。     |


#### ▼ CD：Continuous Delivery

変更内容を『自動的』かつ『継続的に』ステージング環境と本番環境にデプロイする。

| ステップ | 詳細                                 | 自動化の可否 | 説明                                             |
| -------- | ------------------------------------ | ------------ | ------------------------------------------------ |
| デプロイ | ステージング環境へのデプロイ         | ⭕️            | CDツールで自動化できる。                         |
|          | 本番環境へのデプロイ                 | ⭕️            | CDツールで自動化できる。                         |

#### ▼ PD：Progressive Delivery

特にカナリアリリースやブルー/グリーンデプロイメントでデプロイされたアプリケーションに関して、ユーザーのアクセスから収集されたテレメトリーを分析し、問題があればロールバックする。

参考：

- https://r-kaga.com/blog/what-is-progressive-delivery
- https://codezine.jp/article/detail/14476

| ステップ | 詳細                                 | 自動化の可否 | 説明                                                 |
| -------- | ------------------------------------ | ------------ | ---------------------------------------------------- |
| 分析     | ステージング環境のテレメトリーを分析 | ⭕️            | CDツールと可観測性ツールを組み合わせて自動化できる。 |
|          | 本番環境のテレメトリーを分析         | ⭕️            | CDツールと可観測性ツールを組み合わせて自動化できる。 |

<br>

### 実現手法の種類

#### ▼ CIOps

CIツールを使用して、CIパイプラインとCDパイプラインの両方を行う手法のこと。例えばCircleCIでアプリケーションのビルドからデプロイまでを実行する。KubernetesをCIOpsでデプロイすることはアンチパターンとされている。

参考：

- https://atmarkit.itmedia.co.jp/ait/articles/2105/26/news005.html
- https://medium.com/orangesys/kubernetes-anti-patterns-lets-do-gitops-not-ciops-62cfecd1c1a9

#### ▼ GitOps

CIツールを使用してCIパイプラインを、またはCDツールを使用してCDパイプラインを、実行する手法のこと。

参考：https://atmarkit.itmedia.co.jp/ait/articles/2105/26/news005.html

<br>

## 02. デプロイ手法の種類

### インプレースデプロイメント

#### ▼ インプレースデプロイメントとは

最初に古いアプリケーションを停止し、サーバーのOSとミドルウェアの構成はそのままで、アプリケーションのみを上書きする。その後、アプリケーションを再起動する。

参考：

- https://aws.typepad.com/sajp/2015/12/what-is-blue-green-deployment.html
- https://developer.hatenastaff.com/entry/2020/06/26/150300

#### ▼ ダウンタイムの有無

古いアプリケーションの停止から新しいアプリケーションの再起動まで、に相当する時間のダウンタイムが発生する。ただし、CodeDeployの様に、新旧環境のサーバーとロードバランサ－を使用するとダウンタイムを防げる。

参考：

- https://garafu.blogspot.com/2018/11/release-strategy.html
- https://docs.aws.amazon.com/ja_jp/codedeploy/latest/userguide/integrations-aws-elastic-load-balancing.html#integrations-aws-elastic-load-balancing-in-place

#### ▼ 技術ツール例

Capistorano、AWS（CodeDeploy）、Fablic、Git（手動で```git pull```コマンド）、Istio

参考：

- https://qiita.com/zaburo/items/8886be1a733aaf581045
- https://istio.io/latest/docs/setup/upgrade/canary/#control-plane

<br>

### ローリングアップデート（ローリングデプロイメント）

#### ▼ ローリングアップデートとは

特にアプリケーションが冗長化されている場合に使用するデプロイ手法。旧環境と新環境のインスタンスの合計数を維持しながら、新環境インスタンスを段階的にデプロイする。新環境インスタンスが起動が完了したことをヘルスチェックなどで確認し、起動が完了したことを確認できれば、社外を含む全てのアクセスのルーティング先を新環境インスタンスに自動的に切り替えていく。アクセスできる新環境インスタンスを増やしながら、旧環境インスタンスを少しずつ削除していく。この時、マネージドなデプロイツールを使用すると、ルーティング先の切り替え作業がより簡単になる。

参考：

- https://webapp.io/blog/what-are-rolling-deployments/
- https://www.designet.co.jp/ossinfo/kubernetes/update/

ちなみに、Kubernetesのアップグレード手法のインプレースアップグレードも、ローリングアップデートに属する。

参考：

- https://logmi.jp/tech/articles/323033
- https://zenn.dev/nameless_gyoza/articles/how-to-update-eks-cluster-safely

#### ▼ 類似するブルー/グリーンデプロイメントとの違い

ブルー/グリーンデプロイメントとは異なり、冗長化された新環境に自動的に切り替えられるため、開発者のリリース作業の工数が少なくなる。一方で、フロントエンド領域とバックエンド領域が別々のアプリケーションとして稼働している場合に、これらのデプロイを同時に完了できない。また、新環境の起動のみしか自動で確認されないため、具体的な動作が正常かどうかをリリース作業後に確認する必要がある。

#### ▼ ダウンタイムの有無

新しいアプリケーションの起動を確認してから、古いアプリケーションを停止するため、ダウンタイムが発生しない。

参考：https://garafu.blogspot.com/2018/11/release-strategy.html

#### ▼ 技術ツール例

AWS（ECS、EKS）、Kubernetes

<br>

### ブルー/グリーンデプロイメント

#### ▼ ブルー/グリーンデプロイメントとは

旧環境（Prodブルー）を残したまま、新環境（Testグリーン）をデプロイする。特定のポート番号からのみ新環境にアクセスできるようにし、新環境の動作を開発者の目で確認する。新環境の動作に問題がなければ、社外を含む全てのアクセスのルーティング先を、新環境に手動で切り替える。新環境への切り替えが完全に完了した後、新環境から旧環境にロールバックを行う場合に備えて、旧環境は削除せずに残しておく。何を基点にしてルーティング先を切り替えるかによって、具体的な方法が大きく異なり、ロードバランサーを基点とする場合が多い。この時、マネージドなデプロイツールを使用すると、ルーティング先の切り替え作業がより簡単になる。

参考：

- https://aws.typepad.com/sajp/2015/12/what-is-blue-green-deployment.html
- https://developer.hatenastaff.com/entry/2020/06/26/150300
- https://atmarkit.itmedia.co.jp/ait/articles/1612/13/news005_2.html

ちなみに、Kubernetesのアップグレード手法のClusterマイグレーションも、ブルー/グリーンデプロイメントに属する。

参考：

- https://logmi.jp/tech/articles/323033
- https://zenn.dev/nameless_gyoza/articles/how-to-update-eks-cluster-safely

#### ▼ 類似するローリングアップデートとの違い

ローリングアップデートとは異なり、開発者のタイミングでルーティング先を新環境に切り替えられるため、フロントエンド領域とバックエンド領域が別々のアプリケーションとして稼働している場合に、これらのデプロイを同時に完了できる。また、特定の動作が正常かどうかをリリース作業前に確認できる。一方で、開発者のリリース作業の工数が多くなる。

#### ▼ 類似するイミュータブルデプロイメントとの違い

イミュータブルデプロイメントとは異なり、旧環境は削除せずに稼働させたままにしておく。

#### ▼ ダウンタイムの有無

新しいアプリケーションの起動を確認してから、古いアプリケーションを停止するため、ダウンタイムが発生しない。

参考：https://garafu.blogspot.com/2018/11/release-strategy.html

#### ▼ 技術ツール例

AWS（CodeDeploy、ElasticBeanstalk）、ArgoCD

<br>

### カナリアリリース（カナリアデプロイメント）

#### ▼ カナリアリリースとは

旧環境を残したまま、新環境をデプロイする。一部のクライアントのリクエストのみを新環境にルーティングし、その後、新環境にルーティングされるクライアントを、手動で段階的に増やしていく。新環境に問題があれば、ロールバックとして旧環境への重み付けを```100```%とする。新環境への重み付けが```100```%になった後、旧環境を削除する。この時、マネージドなデプロイツールを使用すると、ルーティング先の重み付け値の変更作業がより簡単になる。

#### ▼ 技術ツール例

AWS（API Gateway、Route53やALBによる重み付けルーティング）、ArgoCD
