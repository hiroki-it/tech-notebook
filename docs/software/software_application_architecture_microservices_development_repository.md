---
title: 【IT技術の知見】リポジトリの編成＠開発体制
description: リポジトリの編成＠開発体制の知見を記録しています。
---

# リポジトリの編成＠開発体制

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. リポジトリの分割

### リポジトリ分割のメリット

リポジトリを分割することにより、以下のメリットがある。

- 認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

ただし、バージョン管理システム (例：GitHub) によっては、リポジトリのディレクトリ単位で認可スコープを設定できるものがある。

> - https://docs.github.com/ja/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
> - https://qiita.com/FumiyaShibusawa/items/c7a3ff4d0793ca2d281f

<br>

### 分割パターン

#### ▼ モノレポ

バックエンドのマイクロサービス、バックエンドから分離されたフロントエンドアプリケーション、IaC ツール (例：Kubernetes、Terraform など) を、`1` 個のリポジトリで管理する。各要素はディレクトリで分割する。

ただし、バックエンド/フロントエンド/IaC ツールは異なるモノレポとしてもよい。

Google ではモノレポによるマイクロサービスアーキテクチャが採用されており、自前のバージョン管理システム (Piper/CitC) を使用している。

その他にも、アメリカの IT 大企業 (例：Facebook、Microsoft、Uber、Airbnb、Twitter など) でもモノリポを採用している。

![monorepo](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/monorepo.png)

> - https://en.wikipedia.org/w/index.php?title=Monorepo
> - https://www.fourtheorem.com/blog/monorepo
> - https://www.school.ctc-g.co.jp/columns/nakai2/nakai220.html

#### ▼ ポリレポ

バックエンドのマイクロサービス、バックエンドから分離されたフロントエンドアプリケーション、IaC ツール (例：Kubernetes、Terraform など) をそれぞれ異なるリポジトリで管理する。

![polyrepo](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/polyrepo.png)

> - https://www.fourtheorem.com/blog/monorepo

<br>

## 02. アプリケーションリポジトリ

### 開発環境

アプリエンジニアとインフラエンジニアの責務を完全に分離する場合、アプリエンジニアは IaC ツールの存在を知る必要がない。

ただし便宜上、アプリエンジニアは Docker compose 使用して開発するとよい。

各マイクロサービスへ `docker-compose.yml` ファイルを置き、基本的には他のマイクロサービスへ依存せず開発可能にする必要がある。モノレポ/ポリレポでも同じだ。

ただし、マイクロサービス間のネットワークを繋げないと、マイクロサービス間でパケットを送受信できない。そのため、Docker compose の `external` オプションを使用して、マイクロサービス間のネットワークを接続する。

このときに、開発環境でサービスメッシュを使用している場合、マイクロサービス間の通信で名前解決しやすい。

一方で、これを使用していない場合、開発環境のみでコンテナのホスト名を指定する。

```yaml
# モノレポの場合
backend_mono_repository/
├── src/
│   ├── foo/
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile
│   │   ...
│   │
│   ├── bar/
│   └── baz/
│
```

```yaml
# モノレポの場合
frontend_mono_repository/
├── src/
│   ├── qux/
│   │   ├── docker-compose.yml
│   │   ├── Dockerfile
│   │   ...
│   │
│   ├── quux/
│   └── corge/
│
```

<br>

### エディタ

多くのエディタでは、専用の設定ファイルがプロジェクトのルートディレクトリに置かれる。

基本的には、他のマイクロサービスへ依存せず開発可能にする必要がある。モノレポ/ポリレポでも同じだ。

そこで、各マイクロサービスにエディタの設定ファイルを配置するようにする。

```yaml
# バックエンドモノレポの場合
# JetBrains製品をエディタとする場合
backend_mono_repository/
├── src/
│   ├── foo/
│   │   ├── .idea/
│   │   ...
│   │
│   ├── bar/
│   └── baz/
│
```

```yaml
# フロントエンドモノレポの場合
# JetBrains製品をエディタとする場合
frontend_mono_repository/
├── src/
│   ├── qux/
│   │   ├── .idea/
│   │   ...
│   │
│   ├── quux/
│   └── corge/
│
```

<br>

## 03. コンテナIaCツールリポジトリ

### 開発環境

IaC ツールに Kubernetes を使用した場合を示す。

開発環境で Kubernetes を稼働させる場合、Skaffold などのコンテナイメージビルドツールを使用するとよい。

このとき、コンテナイメージのビルドのために、アプリケーションリポジトリにある Dockerfile を指定する必要がある。

開発環境では同じ階層にリポジトリを配置しておき、ビルドツールで相対パスを指定することにより、同階層のアプリケーションリポジトリを参照可能にする。

```yaml
project/
├── backend_mono_repository
├── frontend_mono_repository
└── manifests_repository # コンテナのIaCツールを管理するリポジトリ
    ├── skaffold.yaml # 相対パスを設定し、mono_repositoryを参照可能にする。
    ├── argocd/
    ├── kubernetes/
    ├── istio/
    ...
```

<br>

## 04. クラウドインフラIaCツールリポジトリ

IaC ツールに Terraform を使用した場合を示す。

```yaml
# クラウドインフラのIaCツールを管理するリポジトリ
infrastructure_repository/
├── modules/
├── prd/
├── stg/
│
```

<br>
