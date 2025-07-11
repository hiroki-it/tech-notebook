---
title: 【IT技術の知見】IaC：Infrastructure as Code
description: IaC：Infrastructure as Codeの知見を記録しています。
---

# IaC：Infrastructure as Code

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. IaC

### IaCとは

構成ファイルの実装に基づくプロビジョニングによって、インフラ (ハードウェア、OS、そしてミドルウェア) を管理する手法のこと。

> - https://en.wikipedia.org/wiki/Infrastructure_as_code

<br>

### メリット

#### ▼ 変更をコードレビュー可能

画面上からインフラを変更する場合、画面共有しながら操作し、レビューと変更を同時に行うことになる。

コード化により、レビューを事前に行ったうえで変更する、という手順を踏める。

#### ▼ ヒューマンエラーが減る

画面上からの変更であると、ヒューマンエラーが起こってしまう。

コード化すれば、これが減る。

#### ▼ 再利用や冗長化が簡単

複数のアプリケーションのために、同様の設定で同様のインフラを作成する場合や、1つのアプリケーションのために、インフラを冗長化する場合、いくつも手動で作成する必要があり、労力がかかる。

コード化すれば、これが楽になる。

#### ▼ 過去の変更が記録に残る

画面上からの変更であると、過去の変更履歴が残らない。

コードをバージョン管理すれば、Issueと紐付けて、履歴を残せる。

<br>

### デメリット

#### ▼ 変更のスピードが落ちる

変更時に、画面上からの操作であればすぐに終了する変更であるのにも関わらず、コード化により、変更までに時間がかかる。

そのため、例えばAWSとすると、運用時に変更頻度が高いインフラ (例：API Gateway (VPCリンクを含む) 、IAMユーザ (紐付けるロールやポリシーを含む) ) はコード化せず、あえて画面上から作成する。

#### ▼ クラウドプロバイダーの機能追加に追従しにくい

クラウドプロバイダーは日々をオプションを追加している。

画面上からの操作であればすぐにオプションを使用できるが、コード化により、ツールのバージョンをアップグレードしなければ、こを使用できない。

運用時に便利なオプションを使用できず、インフラを改善できないことに繋がる。

#### ▼ リリースの心理的ハードルが高い

画面上から変更すれば、インフラ変更のリリース中に予期せぬエラーが起こることはまずない。

しかし、コード化ツールでは、変更のリリース中に予期せぬエラーが起こる可能性は決して低くないため、リリースの心理的ハードルが高くなる。

<br>

## 02. 手続き型

### 手続き型とは

インフラの構成順序を手続き的に定義することによって、インフラを作成/更新/削除する手法のこと。

インフラの操作順序を人間が理解しておく必要があり、インフラの構成管理のコストが高い。

一方で、順番さえ理解していれば、構成ファイルを簡単に実装できるため、学習コストが低い。

> - https://ja.wikipedia.org/wiki/Infrastructure_as_Code
> - https://techblog.locoguide.co.jp/entry/2021/05/24/145342
> - https://architecting.hateblo.jp/entry/2020/03/22/020137

<br>

### サーバー系

#### ▼ サーバープロビジョニング

プロビジョニングにより、物理サーバーまたは仮想サーバーのインフラ (ハードウェア、OS、そしてミドルウェア) を作成する。

OSとミドルウェアのプロビジョニングが得意であり、クラウドインフラのプロビジョニングでは、クラウドインフラ系のツールと組み合わせることがある。

- Ansible
- Chef

> - https://www.lac.co.jp/lacwatch/service/20201216_002380.html

<br>

### コンテナ系

#### ▼ コンテナプロビジョニング

プロビジョニングにより、コンテナのインフラ (ハードウェア、OS、そしてミドルウェア) を作成する。

OSとミドルウェアのプロビジョニングが得意であり、クラウドインフラのプロビジョニングでは、クラウドインフラ系のツールと組み合わせることがある。

- Ansible Container
- Dockerfile

<br>

### クラウドインフラ系

#### ▼ クラウドインフラプロビジョニング

プロビジョニングにより、クラウドインフラのインフラ (ハードウェア、OS、そしてミドルウェア) を作成する。

- Ansible

<br>

## 03. 宣言型

### 宣言型とは

インフラのあるべき状態を定義することによって、インフラを作成/更新/削除する手法のこと。

ツールごとに独自の宣言方法を持っており、学習コストが高い。

その一方で、最終的な状態を定義しさえすれば、作成/更新/削除の順序はツールが解決してくれるため、インフラの構成管理のコストが少ない。

> - https://ja.wikipedia.org/wiki/Infrastructure_as_Code
> - https://techblog.locoguide.co.jp/entry/2021/05/24/145342

<br>

### サーバー系

#### ▼ サーバープロビジョニング

プロビジョニングにより、物理サーバーまたは仮想サーバーのインフラ (ハードウェア、OS、そしてミドルウェア) を作成する。

OSとミドルウェアのプロビジョニングが得意であり、クラウドインフラのプロビジョニングでは、クラウドインフラ系のツールと組み合わせることがある。

- CFEngine
- Puppet
- Vagrantfile

> - https://www.lac.co.jp/lacwatch/service/20201216_002380.html

#### ▼ マシンイメージプロビジョニング

プロビジョニングにより、マシンイメージのインフラ (ハードウェア、OS、そしてミドルウェア) を作成する。

- Packer

<br>

### コンテナ系

#### ▼ コンテナプロビジョニング

プロビジョニングにより、コンテナのインフラ (ハードウェア、OS、そしてミドルウェア) を作成する。

OSとミドルウェアのプロビジョニングが得意であり、クラウドインフラのプロビジョニングでは、クラウドインフラ系のツールと組み合わせることがある。

- Vagrantfile

#### ▼ コンテナイメージプロビジョニング

プロビジョニングにより、コンテナイメージのインフラ (ハードウェア、OS、そしてミドルウェア) を作成する。

- Packer

#### ▼ コンテナオーケストレーション

- Ansible Container
- Docker compose
- Docker Swarm
- Kubernetes

> - https://qiita.com/kounan13/items/57adfbf3a5f209afa586
> - https://knowledge.sakura.ad.jp/9473/
> - https://www.aquasec.com/cloud-native-academy/docker-container/docker-orchestration/

<br>

### クラウドインフラ系

#### ▼ クラウドインフラプロビジョニング

プロビジョニングにより、クラウドインフラのインフラ (ハードウェア、OS、そしてミドルウェア) を作成する。

ただし、OSとミドルウェアのプロビジョニングは得意ではなく、サーバー系やコンテナ系のツールと組み合わせることがある。

- AWS CloudFormation
- Azure Resource Manager
- Google Cloud Deployment Manager
- SAM
- Serverless Framework
- Terraform
- Vagrant

> - https://www.lac.co.jp/lacwatch/service/20201216_002380.html

#### ▼ クラウドインフライメージプロビジョニング

- Packer

<br>

## 04. プロビジョニング

### サーバープロビジョニング

#### ▼ サーバープロビジョニングとは

サーバーを最終的な状態に至らせるまでの一連の処理のこと。

> - https://securesamba.com/term/%E3%83%97%E3%83%AD%E3%83%93%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0/
> - https://www.redhat.com/ja/topics/automation/what-is-provisioning#%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%83%97%E3%83%AD%E3%83%93%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0

<br>

### コンテナプロビジョニング

#### ▼ コンテナプロビジョニングとは

コンテナを最終的な状態に至らせるまでの一連の作業のこと。

<br>

### クラウドインフラプロビジョニング

#### ▼ クラウドインフラプロビジョニングとは

クラウドインフラを最終的な状態に至らせるまでの一連の作業のこと。

<br>

## 05. コンテナオーケストレーション

### コンテナオーケストレーション

複数のコンテナの稼働 (プロビジョニング、デプロイメインと、スケーリング、コンテナ間ネットワークなど) を一括で管理する。

> - https://www.vmware.com/topics/glossary/content/container-orchestration.html

<br>

### コンテナオーケストレーションの種類

#### ▼ 単一ホストの場合

単一ホスト上のコンテナが対象である。

異なるDockerfileを基に、コンテナイメージのビルド、コンテナレイヤーの作成、コンテナの作成、コンテナの起動を実行できる。

- Docker
- Docker Compose

#### ▼ 複数ホストの場合

複数ホスト上のコンテナが対象である。

どのホスト上のdockerデーモンに対して、どのコンテナに関する操作を行うのかを選択的に命令できる。

- Docker Swarm
- Kubernetes

> - https://www.techrepublic.com/article/simplifying-the-mystery-when-to-use-docker-docker-compose-and-kubernetes/

<br>

## 05-02. デザインパターンの種類

### サイドカーパターン

#### ▼ サイドカーパターンとは

アプリコンテナと同じPod内や、AWS ECSタスク内に、アプリケーションの一部の機能のみを持つコンテナを配置する。

#### ▼ サイドカーパターンの使用例

| 例                               | 説明                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| ロギングコンテナの配置           | ログルーティングコンテナをサイドカーコンテナとして稼働させ、アプリコンテナから受信したログを監視バックエンドに送信する。       |
| データポイント収集コンテナの配置 | データポイント収集コンテナをサイドカーコンテナとして稼働させ、アプリコンテナからメトリクスの元になるデータポイントを収集する。 |

<br>

### アンバサダーパターン

#### ▼ アンバサダーパターンとは

アプリコンテナと同じPod内や、AWS ECSタスク内に、リバースプロキシコンテナ (Envoy、Linkerdなど) を配置する。

サービスメッシュを実現するために採用される。

サイドカーパターンではないが、このプロキシコンテナのことをサイドカーコンテナともいう。

> - https://logmi.jp/tech/articles/321841

<br>

### アダプターパターン

記入中...

<br>
