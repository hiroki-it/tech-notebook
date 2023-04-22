---
title: 【IT技術の知見】CI/CD
description: CI/CDの知見を記録しています。
---

# CI/CD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. CI/CDとは

CI/CDは、DevOpsを構成する『技術的要素』『組織文化的要素』のうち、技術的要素に相当する概念である。

<br>

## 02. CI/CDの必要性

### 自動化による高品質なシステムの維持

CI/CDの一連の流れ (パイプライン) の中でテストを自動化できるため、一定水準以上の品質を維持しやすくする。

システム（ソフトウェアとハードウェア、があるがここでは特にソフトウェア）には、例えば以下の品質の特性がある（ISOの規格の場合）。

- **機能性**
- パフォーマンス効率性
- 互換性
- 利便性（使いやすさ）
- 信頼性
- 安全性
- 保守性
- 移植性（汎用性）

テストステップで特に機能性を検証し、一定水準以上の品質を維持するように設計する。

<br>

### 自動化による工数削減

開発からリリースには、以下のステップがある。

CI/CDの一連の流れ (パイプライン) の中でこれらのステップを自動化できるため、工数を削減できる。

1. アプリケーションのビルド
2. テスト
3. 承認
4. デプロイ
5. DBマイグレーション

<br>

## 03. CI/CDパイプラインのステップについて

### CI/CDパイプラインとは

CIパイプラインとCDパイプラインを組み合わせた手法のこと。

![CICDパイプライン](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/CICDパイプライン.png)

> ↪️ 参考：https://www.redhat.com/ja/topics/devops/what-cicd-pipeline

<br>

### CIパイプライン

アプリケーションの機能追加/変更/削除からテストまでを『自動的』かつ『継続的に』行う。

| ステップ | 詳細                                                                     | 自動化の可否 | 説明                                                 |
| -------- | ------------------------------------------------------------------------ | :----------: | ---------------------------------------------------- |
| ビルド   | アプリケーションのビルド                                                 |    `⭕️`     | CIツールとIaCツールで自動化できる。                  |
| テスト   | ホワイトボックステスト (単体テスト、機能テスト、回帰テスト、など) の実施 |    `⭕️`     | CIツールとテストフレームワークで自動化できる。       |
|          | 結合テスト                                                               |      ×       | ブラックボックステストで、動作を確認する必要がある。 |
|          | コーディング規約に関するレビュー                                         |    `⭕️`     | CIツールと静的解析ツールで自動化できる。             |
|          | 仕様に関するレビュー                                                     |      ×       | GitHub上でレビューする必要がある。                   |

> ↪️ 参考：https://tracpath.com/works/devops/11_topics_for_devops/

<br>

### CDパイプライン

変更内容を『自動的』かつ『継続的に』ステージング環境と本番環境にデプロイする。

| ステップ (ステージング環境の場合) | 詳細                                 | 自動化の可否 | 説明                     |
| --------------------------------- | ------------------------------------ | :----------: | ------------------------ |
| デプロイ                          | ステージング環境に対するデプロイ     |    `⭕️`     | CDツールで自動化できる。 |
| DBマイグレーション                | ステージング環境のDBに対するデプロイ |    `⭕️`     | CDツールで自動化できる。 |

本番環境へのデプロイ前に、承認ステップを設ける。

承認ステップがある場合を、デプロイではなく特に『デリバリー』と呼ぶことがある。

| ステップ (本番環境の場合) | 詳細                           | 自動化の可否 | 説明                     |
| ------------------------- | ------------------------------ | :----------: | ------------------------ |
| 承認                      | 本番環境に対するデプロイの承認 |    `⭕️`     | CDツールで自動化できる。 |
| デプロイ                  | 本番環境に対するデプロイ       |    `⭕️`     | CDツールで自動化できる。 |
| DBマイグレーション        | 本番環境のDBに対するデプロイ   |    `⭕️`     | CDツールで自動化できる。 |

> ↪️ 参考：
>
> - https://blog.kyanny.me/entry/2014/12/24/145001
> - https://aws.amazon.com/jp/devops/continuous-delivery/

<br>

### PD：Progressive Delivery

特にカナリアリリースやブルー/グリーンデプロイメントでデプロイされたアプリケーションに関して、ユーザーのアクセスから収集されたテレメトリーを分析し、問題が起これば自動的にロールバックする。

問題の判定基準としては、障害の有無やSLO閾値未満がある。

| ステップ | 詳細                                 | 自動化の可否 | 説明                                                         |
| -------- | ------------------------------------ | :----------: | ------------------------------------------------------------ |
| 分析     | ステージング環境のテレメトリーを分析 |    `⭕️`     | CDツールとテレメトリー収集ツールを組み合わせて自動化できる。 |
|          | 本番環境のテレメトリーを分析         |    `⭕️`     | CDツールとテレメトリー収集ツールを組み合わせて自動化できる。 |

> ↪️ 参考：
>
> - https://r-kaga.com/blog/what-is-progressive-delivery
> - https://codezine.jp/article/detail/14476
> - https://speakerdeck.com/tozastation/3-shake-inc-niokeru-progressive-dellivery-dao-ru-madefalsenao-mitoqu-rizu-mi-cndt2021?slide=25

<br>

## 04. 要件定義事項

### そもそもCI/CDを採用する必要があるか

そもそもCI/CDを採用する必要があるかどうかを判断するために、以下をヒアリングする。

各質問の回答が ”困っている” ではなければ、CI/CD採用の優先度を下げるようにする。

| 質問      | 質問の意図 |
| --------- | ---------- |
| 記入中... |            |
| 記入中... |            |

<br>

### CI/CDパイプラインのステップをどこまで採用する必要があるか

CI/CDパイプラインには種々のステップがあり、どこまで採用するべきかを判断するために、以下をヒアリングする。

| 質問      | 質問の意図 |
| --------- | ---------- |
| 記入中... |            |
| 記入中... |            |

<br>

### アプリケーションが動いているインフラの技術スタックについて

CI/CDの設計はアプリケーションが動いているインフラの技術スタックで決まるため、以下をヒアリングする。

| 質問      | 質問の意図 |
| --------- | ---------- |
| 記入中... |            |
| 記入中... |            |

### 技術選定の基準について

システム化するドメイン (例：クレジットカード) によっては、国が用意した規定の要件 (例：PCI DSS) に準拠したシステムを設計しないといけない場合があるため、以下をヒアリングする。

| 質問      | 質問の意図 |
| --------- | ---------- |
| 記入中... |            |
| 記入中... |            |

<br>

## 05. 要件回答に基づく技術選定フローチャート

要件定義でヒアリングした回答に基づいて、要件にあったCI/CDを選択していく。

```mermaid
graph TD;
  A[はじめに] --> B[Opsの種類]

  B ---> | アプリを<br>コンテナ化していない | C[そのまま進む]
  B --> | アプリを<br>コンテナ化している | D[コンテナオーケストレーションツールの種類]

  C ---> | オンプレ | E[オンプレのための<br>CIOps]
  C ---> | AWS EC2, Google GCE | F["IaaSのための<br>CIOps"]
  C ---> | AWS Lambda, Google Cloud Function | G[非コンテナFaaSのための<br>CIOps]

  D ----> | Docker compose on オンプレ | H[Docker composeのための<br>CIOps]
  D ----> | AWS ECS, Google CloudRun  | I[CaaSのための<br>CIOps]
  D --> | いずれも使っていない | J[そのまま進む]
  D ----> | Kubeadm, Rancher, on オンプレ | K[オンプレのための<br>GitOps]
  D ----> | AWS EKS Anywhere Baremetal Deployment, Google Anthos on Baremetal| L[IaaSのための<br>GitOps]
  D ----> | AWS EKS, GCP GKE | M[CaaSのための<br>GitOps]

  J --> | AWS Lambda, Google Cloud Function | N[コンテナ化FaaSのための<br>CIOps]
  J --> | dockerコマンド on オンプレ| O[dockerコマンドのための<br>CIOps]

  E ---> P[CIOpsのための<br>ブランチ戦略]

  F ---> P

  G ---> P

  H ---> P

  I ---> P

  K ---> Q[GitOpsのための<br>ブランチ戦略]

  L ---> Q

  M ---> Q

  N ---> P

  O ---> P
```

<br>

## 06. CIOps

### CIOpsとは

DevOpsを実現する技術的要素の一つ。

CIツール (例：GitHub Actions、CircleCI、など) を使用して、CIパイプラインとCDパイプラインの両方を行う手法のこと。

![devops_ciops](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/devops_ciops.png)

> ↪️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/2105/26/news005.html
> - https://medium.com/orangesys/kubernetes-anti-patterns-lets-do-gitops-not-ciops-62cfecd1c1a9

<br>

### CIOpsを採用する場合のCIツールの一覧

CIOpsでは、全ての手順をCIツールで実施する。

そのため、多機能かつユーザーフレンドリーなツールが良い。

- CircleCI
- GitHub Actions
- GitLab CI
- Jenkins
- CodePipeline

<br>

### アンチパターンとなる場合

#### ▼ セキュリティ

KubernetesのCI/CDパイプラインにCIOpsを採用する場合、セキュリティ上の理由でCIOpsはアンチパターンとされている。

リポジトリ側に`~/.kube/config`ファイルを置く必要がある。

`~/.kube/config`ファイルは機密性が高く、漏洩させたくない。

ただし、どうしてもCIOpsを採用したいのであれば、暗号化キー (例：AWS KMS、Google CKM、など) で`~/.kube/config`ファイルを暗号化しておき、これをCIパイプライン内に出力する。

> ↪️ 参考：https://devops-blog.virtualtech.jp/entry/20220418/1650250499

#### ▼ 責務境界の分離

KubernetesのCI/CDパイプラインにCIOpsを採用する場合、責務協会の分離上の理由でCIOpsはアンチパターンとされている。

CIOpsの場合、CIとCDが強く結合しており、切り分けにくい。

そのため、結果的にCIの構築/運用を担当するアプリエンジニアが、CDも構築/運用することになる。

特に、CDはインフラに影響するため、アプリエンジニアチームが責任を持つべきではない。

一方でGitOpsであれば、CIとCDを切り分けやすため、CIとCDの構築/運用をアプリチームとSREチームで分担できるようになる。

> ↪️ 参考：https://news.mynavi.jp/techplus/article/techp5025/

<br>

## 07. GitOps

### GitOpsとは

DevOpsを実現する技術的要素の一つ。

CIツール (例：GitHub Actions、CircleCI、など)を使用してCIパイプラインを、またはCDツール (例：ArgoCD、Flux、など) を使用してCDパイプラインを、実装する手法のこと。

![devops_gitops](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/devops_gitops.png)

> ↪️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/2105/26/news005.html
> - https://github.com/argoproj/gitops-engine/blob/master/specs/design.md

<br>

### 技術ツール例

GitOpsでは、CDツールで実施する手順が多いため、多機能かつユーザーフレンドリーなツールが良い。

執筆時点 (2022/11/09) ではどのようなユースケースでも、OSSの開発が活発なArgoCDが良いかも。

- ArgoCD
- Flux
- Jenkins X
- PipeCD
- Harness

<br>

### 相性の良いCIツール

CIOpsでなくGitOpsを採用する場合、アプリケーションはマイクロサービスアーキテクチャを採用しているはずである。

GitOpsでは、CIツールで実施する手順が少ないため、基本的にいずれのツールを使用しても問題ない。

ただし、リポジトリの分割戦略にポリリポジトリ (マイクロサービスごとにリポジトリを用意する) を採用している場合、リポジトリで同じ設定ファイルを横展開するよりも、CIツールの設定ファイルの共有部分はは特定のリポジトリで中央集権的に管理し、他のリポジトリでこれを読み込むようにした方が楽である。

外部リポジトリに置いた設定ファイルをリモート参照できるような機能を持つCIツール (例：GitLab CI) であれば、ポリリポジトリ戦略と相性が良い。

<br>
