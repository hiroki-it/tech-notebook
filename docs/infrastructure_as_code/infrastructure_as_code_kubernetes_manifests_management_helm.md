---
title: 【IT技術の知見】Helm＠マニフェスト管理
description: Helm＠マニフェスト管理の知見を記録しています。
---

# Helm＠マニフェスト管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Helmの仕組み

### アーキテクチャ

![helm_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/helm_architecture.png)

Helmは、helmクライアント、チャートレジストリ、複数のチャートリポジトリ、チャート、から構成される。

> ℹ️ 参考：
>
> - https://cloudacademy.com/course/introduction-to-helm-1034/helm-architecture/
> - https://helm.sh/ja/docs/glossary/
> - https://deeeet.com/writing/2018/01/10/kubernetes-yaml/

<br>

### helmクライアント

#### ▼ helmクライアントとは

helmクライアントは、リポジトリからインストールしたチャートアーカイブ（```.tgz```形式ファイル）に基づいて、現在のコンテキストで指定されているClusterのkube-apiserverにリクエストを送信する。これにより、Kubernetes上にKubernetesリソースが作成される。

<br>

### チャートレジストリ

#### ▼ チャートレジストリとは

チャートレジストリとして使用できるものの一覧を示す。チャートレジストリ内にリポジトリを配置する。

| レジストリ                 | 補足                                                     |
|-----------------------|----------------------------------------------------------|
| ArtifactHub（Helm公式） | ℹ️ 参考：https://helm.sh/docs/topics/chart_repository/    |
| GitHub、GitHub Pages   | ℹ️ 参考：https://zenn.dev/mikutas/articles/2ab146fa1ea35b |
| AWSリソース（ECR、S3）       |                                                          |
| GCPリソース               |                                                          |


<br>

### チャートリポジトリ

#### ▼ チャートリポジトリとは

チャートをリモートに置いて、インストールできるようになる。チャートのプッシュやプル時に、チャートレジストリ内のリポジトリを指定する場合は、HTTPSプロトコルを使用する。リポジトリにリモートからインストールできないチャートが配置されている場合、そのリポジトリはチャートリポジトリではなく、マニフェストリポジトリである。

> ℹ️ 参考：https://helm.sh/docs/topics/chart_repository/#create-a-chart-repository

|      | URL                                            |
|------|------------------------------------------------|
| 形式 | ```https://<チャートレジストリのドメイン名>/<チャートリポジトリ名>``` |
| 例   | ```https://example.com/foo-chart```            |

#### ▼ OCIリポジトリ

チャートリポジトリのように、リモートにあるチャートをインストールできるようになる。チャートのプッシュやプル時に、OCIレジストリ内のリポジトリを指定する場合は、OCIプロトコルを使用する。

|      | URL                                     |
|------|-----------------------------------------|
| 形式 | ```oci://<チャートレジストリ名>/<チャートリポジトリ名>``` |
| 例   | ```oci://foo-registry/foo-repository``` |

#### ▼ リポジトリをチャートリポジトリとして扱う場合

リポジトリをチャートリポジトリとして扱う場合、チャートリポジトリのルートディレクトリ配下に、```index.yaml```ファイル、各バージョンのチャートアーカイブ（```.tgz```形式ファイル）、を配置する。これらにより、リモートからチャートリポジトリのURLを指定し、チャートをインストールできるようになる。ArtifactHubや、GitHubリポジトリにて```gh-pages```ブランチ上で複数のバージョンのチャートを管理するような使い方は、このチャートリポジトリに相当する。

> ℹ️ 参考：
>
> - https://helm.sh/docs/topics/chart_repository/#the-chart-repository-structure
> - https://zenn.dev/mikutas/articles/2ab146fa1ea35b

```yaml
repository/ # チャートリポジトリ
├── index.yaml
├── foo-chart-1.0.0.tgz # fooチャートアーカイブ
├── foo-chart-2.0.0.tgz 
├── bar-chart-1.0.0.tgz # barチャートアーカイブ
├── bar-chart-2.0.0.tgz
├── baz-chart-1.0.0.tgz # bazチャートアーカイブ
├── baz-chart-2.0.0.tgz
...
```

#### ▼ リポジトリをマニフェストリポジトリとしてのまま扱う場合

リポジトリをチャートリポジトリとして扱わず、ローカルのチャートとして操作する場合、```index.yaml```ファイルとチャートアーカイブ（```.tgz```形式ファイル）が不要になる。リモートからは、チャートをインストールできない。

> ℹ️ 参考：https://codefresh.io/docs/docs/new-helm/helm-best-practices/#helm-repositories-are-optional

```yaml
repository/ # マニフェストリポジトリ
├── foo-chart # fooチャート
├── bar-chart # barチャート
├── baz-chart # bazチャート
...
```

<br>

### チャート

#### ▼ チャートとは

必要なKubernetesリソースを作成するためのマニフェストのセットをパッケージ化し、管理しやすくしたもの。ルートディレクトリに```Chart.yaml```ファイルと```template```ディレクトリを置く必要がある。また、チャートのコントリビュート要件も参考にすること。

```yaml
repository/
├── foo-chart/ # fooチャート
│   ├── charts/ # 依存する他のチャートを配置する。
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
...
```


> ℹ️ 参考：
>
> - https://helm.sh/docs/topics/charts/#the-chart-file-structure
> - https://github.com/helm/charts/blob/master/CONTRIBUTING.md#technical-requirements
> - https://helm.sh/docs/helm/helm_package/
> - https://helm.sh/docs/chart_best_practices/conventions/#usage-of-the-words-helm-and-chart


#### ▼ チャートアーカイブ

```.tgz```形式で圧縮されたチャートのパッケージ。

#### ▼ リリース

実際にインストールされたチャートのインスタンスのこと。

> ℹ️ 参考：https://helm.sh/docs/intro/using_helm/#three-big-concepts

<br>

