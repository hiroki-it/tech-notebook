---
title: 【知見を記録するサイト】CI/CD
description: CI/CDの知見をまとめました。
---

# CI/CD

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. リリース

### 優れたリリースの特徴

#### ・リリースが自動化されていること

アプリケーションのリリースまでの各ステップ（ビルド，テスト，デプロイ）を自動化する．これにより，リリースがより簡単になり，ヒューマンエラーを防げる．CI/CDを導入することでこれを実現する．

参考：https://www.atlassian.com/ja/agile/software-development/release

#### ・ビッグバンリリースではないこと

アプリケーションのリリースの粒度を小さくし，小さなリリースを頻繁に行う．これにより，人間の確認範囲を小さくし，リリース時に予期せぬ問題が起こることを防げる．アジャイル開発やマイクロサービスアーキテクチャを導入することでこれを実現する．

参考：https://www.atlassian.com/ja/agile/software-development/release

#### ・リリース内容がわかるようにしておく

リリース内容がわかるように，タスクやプルリクへのリンクを明記しておく．これにより，リリース時の予期せぬ問題を即解決できる．リリースノートやPRRモデルを導入することでこれを実現する．

参考：

- https://www.atlassian.com/ja/agile/software-development/release
- https://tech-blog.optim.co.jp/entry/2020/07/01/080000

<br>

## 02. CI/CDパイプライン

### CI/CDパイプラインとは

アプリケーションの機能追加/変更/削除からテストまでを『自動的』かつ『継続的に』行うことを，CI：Continuous Integrationという．また，変更内容を『自動的』かつ『継続的に』ステージング環境と本番環境にデプロイすることを，CD：Continuous Deliveryという．これらを合わせてCI/CDパイプラインという．

参考：https://www.redhat.com/ja/topics/devops/what-cicd-pipeline

![CICDパイプライン](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CICDパイプライン.png)

<br>

### 自動化可能なリリースステップ

リリースのステップのうちで，自動化可能なものを示す．

| ステップ | 詳細                           | 自動化の可否 | 説明                                              |
| -------- | ------------------------------ | ------------ | ------------------------------------------------- |
| ビルド   | Build                          | 〇           | CI/CDツールとIaCツールで自動化できる．            |
| テスト   | Unitテスト，Functionalテスト   | 〇           | CI/CDツールとテストフレームワークで自動化できる． |
|          | Integrationテスト              | ✕            | テスト仕様書を作成し，動作を確認する必要がある．  |
|          | コーディング規約に関するReview | 〇           | CI/CDツールと静的解析ツールで自動化できる．       |
|          | 仕様に関するReview             | ✕            | GitHub上でレビューする必要がある．                |
| デプロイ | ステージング環境へのデプロイ   | 〇           | CI/CDツールで自動化できる．                       |
|          | 本番環境へのデプロイ           | 〇           | CI/CDツールで自動化できる．                       |

<br>

## 02-02. デプロイ手法の種類

### インプレースデプロイメント

#### ・インプレースデプロイメントとは

サーバーにアプリケーションをデプロイする場合に用いる．最初に古いアプリケーションを停止し，サーバーのOSとミドルウェアの構成はそのままで，アプリケーションのみを上書きする．その後，アプリケーションを再起動する．

参考：

- https://aws.typepad.com/sajp/2015/12/what-is-blue-green-deployment.html
- https://developer.hatenastaff.com/entry/2020/06/26/150300

#### ・ダウンタイムの有無

古いアプリケーションの停止から新しいアプリケーションの再起動まで，に相当する時間のダウンタイムが発生する．ただし，CodeDeployの様に，新旧環境のサーバーとロードバランサ－を用いるとダウンタイムを防げる．

参考：

- https://garafu.blogspot.com/2018/11/release-strategy.html
- https://docs.aws.amazon.com/ja_jp/codedeploy/latest/userguide/integrations-aws-elastic-load-balancing.html#integrations-aws-elastic-load-balancing-in-place

#### ・利用例

Capistorano，CodeDeploy，Fablic，Git（手動で```git pull```コマンド）

参考：https://qiita.com/zaburo/items/8886be1a733aaf581045

<br>

### ブルー/グリーンデプロイメント

#### ・ブルー/グリーンデプロイメントとは

古い環境（Prodブルー）の残したまま，新しい環境（Testグリーン）をデプロイする．社内からのリクエストのみを新しい環境にルーティングし，新しい環境の動作に問題がなければ，社外を含む全てのリクエストを新しい環境にルーティングする．その後，古い環境を削除する．

参考：

- https://aws.typepad.com/sajp/2015/12/what-is-blue-green-deployment.html
- https://developer.hatenastaff.com/entry/2020/06/26/150300

#### ・ダウンタイムの有無

新しいアプリケーションの起動を確認してから，古いアプリケーションを停止するため，ダウンタイムが発生しない．

参考：https://garafu.blogspot.com/2018/11/release-strategy.html

#### ・利用例

CodeDeploy

<br>

### カナリアリリース（カナリアデプロイメント）

#### ・カナリアリリースとは

古い環境の残したまま，新しい環境をデプロイする．一部のクライアントのリクエストのみを新しい環境にルーティングし，その後，新しい環境にルーティングされるクライアントを段階的に増やしていく．

#### ・利用例

API Gateway，Route53やALBによる重み付けルーティング

<br>

### ローリングアップデート（ローリングデプロイメント）

#### ・ローリングアップデートとは

参考：https://webapp.io/blog/what-are-rolling-deployments/

#### ・ダウンタイムの有無

新しいアプリケーションの起動を確認してから，古いアプリケーションを停止するため，ダウンタイムが発生しない．

参考：https://garafu.blogspot.com/2018/11/release-strategy.html

#### ・利用例

ECS，EKS，Kubernetes

