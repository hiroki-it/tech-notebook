---
title: 【IT技術の知見】DevOps
description: DevOpsの知見を記録しています。
---

# DevOps

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. DevOpsとは

### 高品質システムの維持

![software-quality-attributes_measurement](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/software-quality-attributes_measurement.png)

システムには、例えば以下の品質の特性がある（ISOの規格の場合）。

- 機能性
- パフォーマンス効率性
- 互換性
- 利便性（使いやすさ）
- 信頼性
- 安全性
- 保守性
- 移植性（汎用性）

これらの特性の程度は、例えば以下の観点で定量化できる。

- 採用されたアーキテクチャ
- 採用されたコーディング手法
- ソースコードの複雑さ
- ドキュメントの有無
- 移植性（汎用性）
- ソースコードのサイズ
- SREingの文脈でのユーザーからの満足度

これら観点を管理し、一定水準以上の品質を維持しやすくするためには、維持するための作業を自動的に実施する仕組みづくりが必要である。

> ℹ️ 参考：
>
> - https://iso25000.com/index.php/en/iso-25000-standards/iso-25010
> - https://en.wikipedia.org/wiki/List_of_system_quality_attributes
> - https://en.wikipedia.org/wiki/Software_quality#Measurement

<br>

### DevOpsとは

開発者と運用者が協調して開発と運用を行い、システムを継続的に改善する手法論のこと。DevOpsにて、品質を維持する作業を自動化することにより、一定水準以上の品質を維持しやすくする。DevOpsの実現方法には、CIOpsまたはGitOpsがある。

> ℹ️ 参考：https://e-words.jp/w/DevOps.html

<br>

## 01-02. DevOpsの実現方法

### CIOps

#### ▼ CIOpsとは

CIツールを使用して、CIパイプラインとCDパイプラインの両方を行う手法のこと。例えばCircleCIでアプリケーションのビルドからデプロイまでを実現する。

> ℹ️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/2105/26/news005.html
> - https://medium.com/orangesys/kubernetes-anti-patterns-lets-do-gitops-not-ciops-62cfecd1c1a9

#### ▼ 技術ツール例

- CircleCI
- GitHub Actions
- GitLab CI
- Jenkins
- CodePipeline

#### ▼ アンチパターンとなる場合

KubernetesのCI/CDパイプラインにCIOpsを採用する場合、以下の理由でCIOpsはアンチパターンとされている。

| 理由    | 説明    |補足|
|-----|-----|---|
| セキュリティ    | リポジトリ側に```~/.kube/config```ファイルを置く必要がある。kubeconfigファイルは機密性が高く、漏洩させたくない。ただし、どうしてもCIOpsを採用したいのであれば、sops暗号化キー（例：AWS KMS、GCP KMS、など）でkubeconfigファイルを暗号化しておき、これをCIパイプライン内に出力する。| ℹ️ 参考：https://devops-blog.virtualtech.jp/entry/20220418/1650250499|
| 責務協会の分離    | CIOpsの場合、CIとCDが強く結合しており、切り分けて構築しにくい。そのため、結果的にCIの構築/運用を担当するアプリエンジニアが、CDも構築/運用することになる。一方で、GitOpsであれば、CIとCDを切り分けやすため、CIとCDの構築/運用を別々のチームが担当できるようになる。|ℹ️ 参考：https://news.mynavi.jp/techplus/article/techp5025/|

<br>

### GitOps

#### ▼ GitOpsとは

CIツールを使用してCIパイプラインを、またはCDツールを使用してCDパイプラインを、実現する手法のこと。

> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/2105/26/news005.html

#### ▼ 技術ツール例

- ArgoCD
- Flux
- Jenkins X
- PipeCD
- Harness

<br>

## 01-03. CI/CDパイプライン

### CI/CDパイプラインとは

CIパイプラインとCDパイプラインを組み合わせた手法のこと。

> ℹ️ 参考：https://www.redhat.com/ja/topics/devops/what-cicd-pipeline

![CICDパイプライン](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CICDパイプライン.png)

<br>

### CI/CDパイプラインの構成要素

#### ▼ CI：Continuous Integration

アプリケーションの機能追加/変更/削除からテストまでを『自動的』かつ『継続的に』行う。

> ℹ️ 参考：https://tracpath.com/works/devops/11_topics_for_devops/

| ステップ        | 詳細                                   |     自動化の可否     | 説明                         |
|-------------|--------------------------------------|:--------------:|----------------------------|
| ビルド         | アプリケーションのビルド                         |       ⭕️       | CIツールとIaCツールで自動化できる。       |
| テスト | ホワイトボックステスト（単体テスト、機能テスト、回帰テスト、など）の実施 |       ⭕️       | CIツールとテストフレームワークで自動化できる。   |
|             | 結合テスト                                |       ×        | ブラックボックステストで、動作を確認する必要がある。 |
|             | コーディング規約に関するレビュー                     |       ⭕️       | CIツールと静的解析ツールで自動化できる。      |
|             | 仕様に関するレビュー                           |       ×        | GitHub上でレビューする必要がある。       |


#### ▼ CD：Continuous Delivery

変更内容を『自動的』かつ『継続的に』ステージング環境と本番環境にデプロイする。

| ステップ | 詳細                                 | 自動化の可否 | 説明                                             |
| -------- | ------------------------------------ |:-------------:| ------------------------------------------------ |
| デプロイ | ステージング環境に対するデプロイ         |      ⭕️       | CDツールで自動化できる。                         |
|          | 本番環境に対するデプロイ                 |      ⭕️       | CDツールで自動化できる。                         |

#### ▼ PD：Progressive Delivery

特にカナリアリリースやブルー/グリーンデプロイメントでデプロイされたアプリケーションに関して、ユーザーのアクセスから収集されたテレメトリーを分析し、問題があれば自動的にロールバックする。問題の判定基準としては、障害の有無やSLO閾値未満がある。

> ℹ️ 参考：
>
> - https://r-kaga.com/blog/what-is-progressive-delivery
> - https://codezine.jp/article/detail/14476
> - https://speakerdeck.com/tozastation/3-shake-inc-niokeru-progressive-dellivery-dao-ru-madefalsenao-mitoqu-rizu-mi-cndt2021?slide=25

| ステップ | 詳細                                 |     自動化の可否     | 説明                                                 |
| -------- | ------------------------------------ |:--------------:| ---------------------------------------------------- |
| 分析     | ステージング環境のテレメトリーを分析 |       ⭕️       | CDツールとテレメトリー収集ツールを組み合わせて自動化できる。 |
|          | 本番環境のテレメトリーを分析         |       ⭕️       | CDツールとテレメトリー収集ツールを組み合わせて自動化できる。 |



<br>

## 02. デプロイ手法の種類

### インプレースデプロイメント

#### ▼ インプレースデプロイメントとは

最初に旧アプリケーションを停止し、サーバーのOSとミドルウェアの構成はそのままで、アプリケーションのみを上書きする。その後、アプリケーションを再起動する。

> ℹ️ 参考：
>
> - https://aws.typepad.com/sajp/2015/12/what-is-blue-green-deployment.html
> - https://developer.hatenastaff.com/entry/2020/06/26/150300

#### ▼ ダウンタイムの有無

旧アプリケーションの停止から新アプリケーションの再起動まで、に相当する時間のダウンタイムが発生する。ただし、CodeDeployの様に、ロードバランサ－を使用して、旧環境と新環境に対するルーティングを切り替えるようにすると、ダウンタイムを防げる。

> ℹ️ 参考：
>
> - https://garafu.blogspot.com/2018/11/release-strategy.html
> - https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-elastic-load-balancing.html#integrations-aws-elastic-load-balancing-in-place

#### ▼ 技術ツール例

- Capistrano
- AWS（CodeDeploy）
- Fablic
- Git（手動で```git pull```コマンド）
- Istio

> ℹ️ 参考：
>
> - https://qiita.com/zaburo/items/8886be1a733aaf581045
> - https://istio.io/latest/docs/setup/upgrade/canary/#control-plane

<br>

### ローリングアップデート （ローリングデプロイメント）

#### ▼ ローリングアップデートとは

特にアプリケーションが冗長化されている場合に使用するデプロイ手法。旧環境と新環境のインスタンスの合計数を維持しながら、新環境インスタンスを段階的にデプロイする。新環境インスタンスが起動が完了したことをヘルスチェックなどで確認し、起動が完了したことを確認できれば、社外を含む全てのアクセスのルーティング先を新環境インスタンスに自動的に切り替えていく。アクセスできる新環境インスタンスを増やしながら、旧環境インスタンスを少しずつ削除していく。この時、マネージドなデプロイツールを使用すると、ルーティング先の切り替え作業がより簡単になる。

> ℹ️ 参考：
>
> - https://webapp.io/blog/what-are-rolling-deployments/
> - https://www.designet.co.jp/ossinfo/kubernetes/update/

ちなみに、Kubernetesのアップグレード手法のインプレースアップグレードも、ローリングアップデートに属する。

> ℹ️ 参考：
>
> - https://logmi.jp/tech/articles/323033
> - https://zenn.dev/nameless_gyoza/articles/how-to-update-eks-cluster-safely

#### ▼ 類似するブルー/グリーンデプロイメントとの違い

ブルー/グリーンデプロイメントとは異なり、冗長化された新環境に自動的に切り替えられるため、開発者のリリース作業の工数が少なくなる。一方で、フロントエンド領域とバックエンド領域が異なるアプリケーションとして稼働している場合、これらのデプロイを同時に完了できない。また、新環境の起動のみしか自動的に確認されないため、具体的な動作が正常か否かをリリース作業後に確認する必要がある。

#### ▼ ダウンタイムの有無

新アプリケーションの起動を確認してから、旧アプリケーションを停止するため、ダウンタイムが発生しない。

> ℹ️ 参考：https://garafu.blogspot.com/2018/11/release-strategy.html

#### ▼ 技術ツール例

- AWS（ECS、EKS）
- Kubernetes

<br>

### ブルー/グリーンデプロイメント

#### ▼ ブルー/グリーンデプロイメントとは

旧環境（Prodブルー）を残したまま、新環境（Testグリーン）をデプロイする。特定のポート番号からのみ新環境にアクセスできるようにし、新環境の動作を開発者の目で確認する。新環境の動作に問題がなければ、社外を含む全てのアクセスのルーティング先を、新環境に手動で切り替える。新環境に対する切り替えが完全に完了した後、新環境から旧環境にロールバックする場合に備えて、旧環境は削除せずに残しておく。何を基点にしてルーティング先を切り替えるかによって、具体的な方法が大きく異なり、ロードバランサーを基点とする場合が多い。この時、マネージドなデプロイツールを使用すると、ルーティング先の切り替え作業がより簡単になる。

> ℹ️ 参考：
>
> - https://aws.typepad.com/sajp/2015/12/what-is-blue-green-deployment.html
> - https://developer.hatenastaff.com/entry/2020/06/26/150300
> - https://atmarkit.itmedia.co.jp/ait/articles/1612/13/news005_2.html

#### ▼ 類似するローリングアップデートとの違い

ローリングアップデートとは異なり、開発者のタイミングでルーティング先を新環境に切り替えられるため、フロントエンド領域とバックエンド領域が異なるアプリケーションとして稼働している場合、これらのデプロイを同時に完了できる。また、特定の動作が正常か否かをリリース作業前に確認できる。一方で、開発者のリリース作業の工数が多くなる。

#### ▼ 類似するイミュータブルデプロイメントとの違い

ブルー/グリーンデプロイメントと似たものとして、イミュータブルデプロイメントがある。これは、ブルー/グリーンデプロイメントと手順はほとんど同じであるが、リリース後に旧環境を削除してしまう。一方でブルー/グリーンデプロイメントでは、旧環境はリリース後も削除せずに稼働させたままにしておく。

#### ▼ ダウンタイムの有無

新アプリケーションの起動を確認してから、旧アプリケーションを停止するため、ダウンタイムが発生しない。

> ℹ️ 参考：https://garafu.blogspot.com/2018/11/release-strategy.html

#### ▼ 技術ツール例

- AWS（CodeDeploy、ElasticBeanstalk）
- ArgoCD

<br>

### カナリアリリース（カナリアデプロイメント）

#### ▼ カナリアリリースとは

『カナリア』という言葉は、炭鉱内に一酸化炭素があるか否かを判断するために、炭鉱夫が自身よりも先に死ぬカナリアを一緒に持ち歩いたこと、に由来する。旧環境を残したまま、新環境をデプロイする。一部の一般ユーザーのリクエストのみを新環境にルーティングし、実際のユーザー（由来のカナリアに相当）の手を借りて、本番環境で実地的に検証する。この実地的なテストで新環境で問題が起こらなければ、ルーティングされるユーザーを手動で段階的に増やしていく。新環境に問題があれば、ロールバックとして旧環境に対する重み付けを```100```%とする。新環境に対する重み付けが```100```%になった後、旧環境を削除する。この時、マネージドなデプロイツールを使用すると、ルーティング先の重み付け値の変更作業がより簡単になる。

> ℹ️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/1804/12/news071.html
> - https://codechacha.com/ja/what-is-canary-development-test/

#### ▼ 類似するダークカナリアリリースとの違い

ダークカナリアリリースとは異なり、特定の関係者ではなく、一般ユーザーを新環境にルーティングする。

#### ▼ 技術ツール例

- AWS（API Gateway、Route53やALBによる重み付けルーティング）
- ArgoCD

<br>

### ダークカナリアリリース

#### ▼ ダークカナリアリリースとは

特定の関係者（社員、協力会社）のリクエストのみを新環境にルーティングし、これらの手を借りて、本番環境で実地的に検証する。

> ℹ️ 参考：https://blog.bltinc.co.jp/entry/2020/04/27/090000

#### ▼ 類似するカナリアリリースとの違い

カナリアリリースとは異なり、一般ユーザーではなく、特定の関係者のみを新環境にルーティングする。

<br>

### ダークローンチ

#### ▼ ダークローンチ

全ての一般ユーザーがルーティングされるデプロイ手法（例：カナリアリリース以外）と組み合わせる。ただし、機能をこっそりリリースしておく。を使用したいユーザーだけがトグルなどで有効化できるようにしておき、本番環境で実地的に検証する。

> ℹ️ 参考：
>
> - https://scrapbox.io/nobuoka-pub/%E3%83%80%E3%83%BC%E3%82%AF%E3%83%AD%E3%83%BC%E3%83%B3%E3%83%81
> - https://newrelic.com/jp/resources/undefined/next-phase-of-devops

<br>

## 02-02. 品質を高めるリリース

### 品質を高めるリリースとその実現方法

#### ▼ リリースが自動化されていること

アプリケーションのリリースまでの各ステップ（ビルド、ホワイトボックステスト、デプロイ）を自動化する。これにより、リリースがより簡単になり、ヒューマンエラーを防げる。DevOpsのCI/CDパイプラインを導入することによりこれを実現する。

> ℹ️ 参考：https://www.atlassian.com/ja/agile/software-development/release

#### ▼ ビッグバンリリースではないこと

アプリケーションのリリースの粒度を小さくし、小さなリリースを頻繁に行う。これにより、人間の確認範囲を小さくし、リリース時に予期せぬ問題が起こることを防げる。アジャイル開発やマイクロサービスアーキテクチャを導入することによりこれを実現する。

> ℹ️ 参考：https://www.atlassian.com/ja/agile/software-development/release

#### ▼ リリース内容がわかるようにしておく

リリース内容がわかるように、タスクやプルリクエストに対するリンクを明記しておく。これにより、リリース時の予期せぬ問題を即解決できる。リリースノートやPRRモデルを導入することによりこれを実現する。

> ℹ️ 参考：
>
> - https://www.atlassian.com/ja/agile/software-development/release
> - https://tech-blog.optim.co.jp/entry/2020/07/01/080000

<br>
