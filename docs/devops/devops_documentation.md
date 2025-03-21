---
title: 【IT技術の知見】ドキュメンテーション＠DevOps
description: ドキュメンテーション＠DevOpsの知見を記録しています。
---

# ドキュメンテーション＠DevOps

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ドキュメンテーション

### ドキュメンテーションとは

システムに関するあらゆることを体系的にまとめた文書のこと。

> - https://www.amazon.co.jp/dp/4873119618

<br>

### ドキュメントの種類

#### ▼ 技術スタック表

システムを構成する技術を分類する。

システムの構成要素が多くなるほど、分類数が多くなる。

| 大分類                     | 中分類                   | 小分類                         | システムの使用技術                                                         |
| -------------------------- | ------------------------ | ------------------------------ | -------------------------------------------------------------------------- |
| 言語                       | アプリ領域               |                                | Go、PHP                                                                    |
|                            | テスト領域               | ブラックボックスのシナリオ定義 | テストツールによる (例：Grafana k6ならJavaScript)                          |
| アプリ                     | アーキテクチャ           |                                | マイクロサービスアーキテクチャ、各マイクロサービスはクリーンアーキテクチャ |
|                            | API                      |                                | RPC-API、RESTful-API                                                       |
| CI/CD                      | CIツール                 |                                | GitHub Actions                                                             |
|                            | CDツール                 |                                | ArgoCD                                                                     |
| ミドルウェア               | Web系                    |                                | Nginx                                                                      |
|                            | アプリ系                 |                                | FastCGI                                                                    |
|                            | DB系                     |                                | MySQL                                                                      |
|                            | ログ系                   |                                | FluentBit                                                                  |
|                            | セキュリティ系           |                                | Falco                                                                      |
|                            | サービスメッシュ系       |                                | Envoy                                                                      |
| 物理サーバー、仮想サーバー | アーキテクチャ           |                                | DRリージョン構成                                                           |
|                            | 仮想サーバー型IaaS       |                                | AWS                                                                        |
| CDN                        |                          |                                | AWS                                                                        |
| IaC                        |                          |                                | Terraform、Kubernetes、Ansible                                             |
| 監視                       | アプリ監視、インフラ監視 |                                | AWS                                                                        |
|                            | ビジネス指標監視         |                                | Metabase                                                                   |
| セキュリティ               | 機密情報のバージョン管理 |                                | Sops、Vault                                                                |
|                            | VPN                      |                                | OpenVPN                                                                    |
| テスト                     | ホワイトボックス         |                                | `go test`コマンド、PHPUnit                                                 |
|                            | ブラックボックス         |                                | ChaosMesh、Postman、Taurus                                                 |

#### ▼ 設計規約書

- アーキテクチャ
- 命名規則
- コンポーネント間の依存関係
- ステークホルダー
- プロダクト責任者

#### ▼ ドキュメント

- 内部向けAPIドキュメント
- 使い方に関するドキュメント (README)

#### ▼ 手順書

- リリース手順書
- 環境構築手順書
- 運用手順書

> - https://dev.classmethod.jp/articles/non-97-operation-manual/

#### ▼ 調査書

- ポストモーテム

#### ▼ 公開書類

- 外部向けAPIドキュメント
- SLA

<br>

## 02. ドキュメントの品質

### 品質の種類

#### ▼ 構造品質

表記と文法の正しさのこと。

機能品質よりは重要度が低い。

> - https://www.amazon.co.jp/dp/B0BXSYF2N4/

#### ▼ 機能品質

ドキュメントの有用さのこと。

ドキュメントをコードと同じディレクトリなどでバージョン管理し、コードの変更に合わせてドキュメントも変更する。

有用性の品質を保つとともに、ドキュメントの場所を明確にする。

> - https://www.amazon.co.jp/dp/B0BXSYF2N4/

<br>

### 構造品質の担保

#### ▼ ドキュメント自動作成ツール

追加/変更した機能に関するドキュメントを自動作成し、ドキュメントの内容についてもレビューできる仕組みを作る。

| 領域     | ドキュメントの対象の技術 | 説明                                                                                                                                                   | 補足                                                     |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| アプリ   | RESTful-API              | RESTful-APIを採用している場合、ドキュメント作成ツール (例：openapi-generatorなど) を使用して、APIのドキュメントのおおよその部分を自動的に作成する。    |                                                          |
|          | RPC-API                  | RPC-APIを採用している場合、ドキュメント作成ツール (例：protoc-gen-docなど) を使用して、APIのドキュメントのおおよその部分を自動的に作成する。           |                                                          |
| インフラ | Helm                     | ユーザー定義のチャートを採用している場合、外部のドキュメント作成ツール (例：helm-docs) を使用して、チャートのドキュメントを自動的に作成する。          | ・https://github.com/norwoodj/helm-docs                  |
|          | Terraform                | 外部のドキュメント自動作成ツール (例：terraform-docs) を使用して、`variable`ブロック、`output`ブロック、`module`ブロックなどのドキュメントを作成する。 | ・https://qiita.com/yutachaos/items/1a7f5a93ceaf972c76c6 |

#### ▼ 構造検証ツール

ドキュメントの構造を検証するツールを使用して、これを構造を継続的に修正する。

| 能力               | ツール                        | 説明                                                                 | 補足 |
| ------------------ | ----------------------------- | -------------------------------------------------------------------- | ---- |
| 構造整形           | prettier                      | テキストファイル中の不要な改行やインデントなどを整形する。           |      |
| 文章校正           | textlint                      | 設定した校正ルールに応じて、テキストファイルの誤った文法を検出する。 |      |
| リンク切れチェック | markdown-link-check、htmltest | テキストファイル中のURLのリンク切れを検出する。                      |      |

> - https://syu-m-5151.hatenablog.com/entry/2023/03/14/130502

<br>

### 機能品質の担保

#### ▼ 共通編集ツール

ドキュメント共通編集ツール (例：confluence、esa、mkdocs、docusaurusなど) を使用すると、改善しやすくなる (例：フィードバックをもらいやすくなる、誰でも気軽に作成更新できる、構造/機能品質を高めるための機能があるなど) ため、機能品質を高めやすくなる。

<br>
