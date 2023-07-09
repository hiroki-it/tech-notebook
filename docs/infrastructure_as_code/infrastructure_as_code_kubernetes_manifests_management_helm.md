---
title: 【IT技術の知見】Helm＠マニフェスト管理
description: Helm＠マニフェスト管理の知見を記録しています。
---

# Helm＠マニフェスト管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Helmの仕組み

### アーキテクチャ

Helmは、helmクライアント、チャートレジストリ、複数のチャートリポジトリ、チャート、といったコンポーネントから構成される。

![helm_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/helm_architecture.png)

> - https://cloudacademy.com/course/introduction-to-helm-1034/helm-architecture/
> - https://helm.sh/ja/docs/glossary/
> - https://deeeet.com/writing/2018/01/10/kubernetes-yaml/

<br>

### バージョン管理戦略

#### ▼ バージョン管理戦略とは

HelmのHelmリリースでは、バージョン管理に関する戦略を採用している。

> - https://medium.com/@koteswar.meesala/git-fast-forward-merge-vs-three-way-merge-8591434dd350

#### ▼ 2方向の戦略的マージパッチ

Helmの `v2`では、2方向の戦略的マージパッチを採用している。

この戦略では、『前回のHelmリリースによるマニフェスト』『今回のHelmリリースによるマニフェスト』の2つを比較する。

そのため、Helm以外の方法 (例：`kubectl edit`コマンド、`kubectl apply`コマンド) でマニフェストが変更されたことを検知できず、チャートの宣言通りにHelmリリースやロールバックを実施できなかった。

> - https://helm.sh/docs/faq/changes_since_helm2/#improved-upgrade-strategy-3-way-strategic-merge-patches
> - https://dev.to/derlin/helmfile-difference-between-sync-and-apply-helm-3-28o1

#### ▼ 3方向の戦略的マージパッチ

Helmの `v3`では、3方向の戦略的マージパッチを採用している。

この戦略では、『前回のHelmリリースによるマニフェスト』『今回のHelmリリースのマニフェスト』『前回のHelmリリース後のHelm以外の方法によるマニフェスト』の3つを比較する。

そのため、Helm以外の方法 (例：`kubectl edit`コマンド、`kubectl apply`コマンド) でマニフェストが変更されたことを検知でき、チャートの宣言通りにHelmリリースやロールバックを実施できる。

ただし、すでにHelm以外 (例：`kubectl apply`コマンド、Kustomize) で作成されているマニフェストからHelmに移行する場合、前回のHelmリリースによるマニフェスト自体が存在せず、新規のHelmリリースとなる。

そのため、チャートと現在のマニフェストと比較できない。

> - https://helm.sh/docs/faq/changes_since_helm2/#improved-upgrade-strategy-3-way-strategic-merge-patches
> - https://dev.to/derlin/helmfile-difference-between-sync-and-apply-helm-3-28o1

<br>

## 02. helmクライアント

### helmクライアントとは

helmクライアントは、リポジトリからインストールしたチャートアーカイブ (`.tgz`形式ファイル) に基づいて、現在のコンテキストで指定されているClusterのkube-apiserverにリクエストを送信する。

これにより、Kubernetes上にKubernetesリソースが作成される。

<br>

### バージョン

Helmは、バージョンごとに対応するKubernetesバージョンが異なる。

Kubernetesをアップグレードした場合に、Helmもアップグレードする必要がある。

注意点として、Helmが対応するKubernetesのバージョンに応じて、Helmテンプレートの異なるロジックに入る可能性がある。

このロジックでは、Kubernetesの新しいバージョンでコントロールプレーンコンポーネントに変更があった場合に、それに対応するような処理を実行する。

> - https://helm.sh/docs/topics/version_skew/#supported-version-skew

<br>

## 03. チャートレジストリ

### チャートレジストリとは

チャートレジストリとして使用できるものの一覧を示す。

チャートレジストリ内にリポジトリを配置する。

| レジストリ             | 補足                                               |
| ---------------------- | -------------------------------------------------- |
| ArtifactHub (Helm公式) | - https://helm.sh/docs/topics/chart_repository/    |
| GitHub、GitHub Pages   | - https://zenn.dev/mikutas/articles/2ab146fa1ea35b |
| AWSリソース (ECR、S3)  |                                                    |
| GCPリソース            |                                                    |

<br>

## 04. チャートリポジトリ

### チャートリポジトリとは

チャートをリモートに置いて、インストールできるようになる。

チャートのプッシュやプル時に、チャートレジストリ内のリポジトリを指定する場合は、HTTPSプロトコルを使用する。

リポジトリにリモートからインストールできないチャートが配置されている場合、そのリポジトリはチャートリポジトリではなく、マニフェストリポジトリである。

|      | URL                                                               |
| ---- | ----------------------------------------------------------------- |
| 形式 | `https://<チャートレジストリのドメイン名>/<チャートリポジトリ名>` |
| 例   | `https://example.com/foo-chart`                                   |

> - https://helm.sh/docs/topics/chart_repository/#create-a-chart-repository

<br>

### OCIリポジトリ

チャートリポジトリのように、リモートにあるチャートをインストールできるようになる。

チャートのプッシュやプル時に、OCIレジストリ内のリポジトリを指定する場合は、OCIプロトコルを使用する。

|      | URL                                                   |
| ---- | ----------------------------------------------------- |
| 形式 | `oci://<チャートレジストリ名>/<チャートリポジトリ名>` |
| 例   | `oci://foo-registry/foo-repository`                   |

<br>

### チャートリポジトリ化

#### ▼ リポジトリをチャートリポジトリとして扱う場合

リポジトリをチャートリポジトリとして扱う場合、チャートリポジトリのルートディレクトリ配下に、`index.yaml`ファイル、各バージョンのチャートアーカイブ (`.tgz`形式ファイル) 、を配置する。

これらにより、リモートからチャートリポジトリのURLを指定し、チャートをインストールできるようになる。

ArtifactHubや、GitHubリポジトリにて `gh-pages`ブランチ上で複数のバージョンのチャートを管理するような使い方は、このチャートリポジトリに相当する。

```yaml
repository/ # チャートリポジトリ
├── index.yaml
├── foo-chart-1.0.0.tgz # fooチャートアーカイブ
├── foo-chart-2.0.0.tgz
├── bar-chart-1.0.0.tgz # barチャートアーカイブ
├── bar-chart-2.0.0.tgz
├── baz-chart-1.0.0.tgz # bazチャートアーカイブ
├── baz-chart-2.0.0.tgz
│
...
```

> - https://helm.sh/docs/topics/chart_repository/#the-chart-repository-structure
> - https://zenn.dev/mikutas/articles/2ab146fa1ea35b

#### ▼ リポジトリをマニフェストリポジトリとしてのまま扱う場合

リポジトリをチャートリポジトリとして扱わず、ローカルのチャートとして操作する場合、`index.yaml`ファイルとチャートアーカイブ (`.tgz`形式ファイル) が不要になる。

リモートからは、チャートをインストールできない。

```yaml
repository/ # マニフェストリポジトリ
├── foo-chart # fooチャート
├── bar-chart # barチャート
├── baz-chart # bazチャート
│
...
```

> - https://codefresh.io/docs/docs/new-helm/helm-best-practices/#helm-repositories-are-optional

<br>

## 05. チャート

### チャートとは

必要なKubernetesリソースを作成するためのマニフェストのセットをパッケージ化し、管理しやすくしたもの。

ルートディレクトリに `Chart.yaml`ファイルと `template`ディレクトリを置く必要がある。

また、チャートのコントリビュート要件も参考にすること。

```yaml
repository/
├── foo-chart/ # fooチャート
│   ├── charts/ # 依存対象のサブチャートを配置する。
│   ├── templates/ # ユーザー定義のチャートを配置する。ディレクトリ構造は自由である。
│   │   ├── tests/
│   │   ├── _helpers.tpl # ヘルパー関数のみを設定する。
│   │   └── template.yaml # チャートの共通ロジックを設定する。
│   │
│   ├── .helmignore # チャートアーカイブの作成時に無視するファイルを設定する。
│   ├── Chart.yaml # チャートの概要を設定する。頭文字は大文字である必要がある。
│   └── values.yaml # テンプレートの変数に出力する値を設定する。
│
├── bar-chart/ # barチャート
│
...
```

> - https://helm.sh/docs/topics/charts/#the-chart-file-structure
> - https://github.com/helm/charts/blob/master/CONTRIBUTING.md#technical-requirements
> - https://helm.sh/docs/helm/helm_package/
> - https://helm.sh/docs/chart_best_practices/conventions/#usage-of-the-words-helm-and-chart

<br>

### チャートアーカイブ

`.tgz`形式で圧縮されたチャートのパッケージ。

<br>

### Helmリリース

実際にインストールされたチャートのインスタンスのこと。

> - https://helm.sh/docs/intro/using_helm/#three-big-concepts

<br>
