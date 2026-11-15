---
title: 【IT技術の知見】はじめに
---

# はじめに

## 俺の技術ノートとは

**俺** ([長谷川広樹](https://hiroki-it.github.io/tech-notebook/about.html)) が、業務や学習から得た技術的な知見を、カンニングペーパー形式で記録した技術ノートです。

普段は、業務や学習のなかで知らない知識があると、その都度この技術ノートにどんどん追記しています✌️

<br>

## サイトの目的

以下の目的のために記録しております。

そのため、**記入途中の項目**、**誤った体系化**、**誤った情報**、**わかりにくい日本語**が多く散見されると思います。

- 寝るとすぐに忘れてしまうため、その都度、インプットしたことを自分の言葉で書き、同時にアウトプットする。
- 寝るとすぐに忘れてしまうため、その都度、知見を体系的に整理する。
- 寝るとすぐに忘れてしまうため、その都度、誤った知見を修正する。

学んだ先から忘れていきます😇

<br>

## 使い方

### 検索から

1. 画面右上の検索フォームからキーワードを検索します。

2. 検索結果が複数のノートにまたがる場合、参照する必要があるノートを判断します。

3. ノートをクリックします。

### カテゴリから

1. カテゴリのカードから、参照する必要があるカテゴリを判断します。

2. カードのカテゴリ名をクリックすると、そのカテゴリの目次が表示されます。

3. 目次からノートをクリックします。

<div class="grid cards" markdown>

- 🌳 **[システム](system/index.md)**

  ***

  システムの定義と、可用性や拡張性などのアーキテクチャ特性をまとめています。

- 🧬 **[ソフトウェア](software/index.md)**

  ***

  ソフトウェアの分類と、設計や開発に共通するプラクティスをまとめています。

- 🚀 **[アプリ](software/application/index.md)**

  ***

  アプリケーションアーキテクチャ、フロントエンド設計、マイクロサービスアーキテクチャをまとめています。

- 🤝🏻 **[ミドルウェア](software/middleware/index.md)**

  ***

  Web サーバー、RDB、NoSQL DB、サービスメッシュ、メッセージングなどのミドルウェアをまとめています。

- 🐧 **[OS](software/basic/index.md)**

  ***

  Linux カーネルによるプロセス、メモリ、ストレージ、I/O の管理と、ユーティリティをまとめています。

- 🔠 **[言語](language/index.md)**

  ***

  言語の種類や処理方式、データ構造と、Go、Java、PHP、Python、TypeScript などの言語ごとの知見をまとめています。

- 🧪 **[テスト](testing/index.md)**

  ***

  ホワイトボックステストとブラックボックステストの手法を、アプリとインフラの両面からまとめています。

- 💻 **[ハードウェア](hardware/index.md)**

  ***

  CPU、メモリ、ストレージ、組み込み機器など、コンピューターを構成するハードウェアをまとめています。

- 🌏 **[ネットワーク](network/index.md)**

  ***

  TCP/IP 階層モデルと OSI 参照モデルに沿って、各レイヤーのネットワーク技術をまとめています。

- 🔐 **[セキュリティ](security/index.md)**

  ***

  サイバー攻撃とマルウェア、ネットワークセキュリティ、暗号化技術、認証と認可をまとめています。

- ⛅️ **[3大クラウド](cloud_computing/index.md)**

  ***

  AWS と Google Cloud のリソース、CLI、ツール、プラクティスをまとめています。

- 📦 **[仮想化](virtualization/index.md)**

  ***

  仮想化の方式と、Docker や Containerd などのコンテナ技術をまとめています。

- ⚙️ **[IaC](infrastructure_as_code/index.md)**

  ***

  Terraform、Ansible、Docker などを使い、インフラをコードで管理する方法をまとめています。

- ☸️ **[K8s](infrastructure_as_code/kubernetes/index.md)**

  ***

  Kubernetes のコントロールプレーンと Node のコンポーネント、ネットワーク、リソースをまとめています。

- 🌊 **[K8sアプリ](infrastructure_as_code/development_tools/index.md)**

  ***

  Minikube や Kind などの開発環境と、Helm や Kustomize などのマニフェスト管理ツールをまとめています。

- ⏬ **[K8sアドオン](infrastructure_as_code/kubernetes_addon/index.md)**

  ***

  Ingress Controller、オートスケーラー、CNI など、Kubernetes に機能を追加するアドオンをまとめています。

- ♾️ **[DevOps](devops/index.md)**

  ***

  DevOps、SRE、Platform Engineering の考え方と、それを支える技術や組織文化をまとめています。

- 🔄 **[CI/CD](devops/cicd/index.md)**

  ***

  デプロイ手法と、GitHub Actions、GitLab CI、ArgoCD などの CI/CD ツールをまとめています。

- 🔎 **[可観測性](observability/index.md)**

  ***

  ログ、メトリクス、分散トレースの収集と、監視ツールやインシデント管理をまとめています。

- 🤖 **[LLM](llm/index.md)**

  ***

  エージェンティックコーディングなど、LLM を活用した開発をまとめています。

- 👥 **[開発手法](software_development_methodology/index.md)**

  ***

  開発手法論、組織論、プロダクトマネジメント、Git によるバージョン管理をまとめています。

</div>

<br>

## 構成の方針

本サイトでは、以下を記載し、体系的に整理するようにしております。

- 定義づけ (演繹的な学習)
- 例 (帰納的な学習)
- 概念図 (視覚優位な学習)

そのため、冗長な記載となることをご容赦いただけると幸いです🙇🏻‍

> - https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/how-to-write.pdf

<br>

## おわび

このサイトで使われている説明や画像につきまして、さまざまな書籍やサイトから引用させていただいております。

あくまで、上記の目的のためだけに使用させていただくという名目で、引用元を十分に記載しておりません (リンク切れの場合もあり) 。

深くお詫び申し上げます🙇🏻‍

<br>
