---
title: 【知見を記録するサイト】設計ポリシー＠Kubernetes
description: 設計ポリシー＠Kubernetesの知見をまとめました。
---

# 設計ポリシー＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ディレクトリ構成

### リポジトリ

#### ▼ アプリケーションとは別

アプリケーションとは異なるリポジトリにて、manifest.yamlファイルを配置する。

```bash
repository/
├── foo.yaml
...
```

#### ▼ アプリケーションと同じ

アプリケーションと同じリポジトリにて、```kubernetes```ディレクトリを作成し、ここにmanifest.yamlファイルを配置する。

```bash
repository/
├── src/ # アプリケーション
├── kubernetes/
│   ├── foo.yaml
...
```

<br>

### ディレクトリ/ファイルの構成

#### ▼ マイクロサービス別

マイクロサービス別にディレクトリを作成し、Kubernetesリソースごとに別々のmanifest.yamlファイルを作成する。さらに、コンポーネント（app、db）別に分割してもよい。マニフェストの```apply```の順番を制御しにくいデメリットがある。

参考：https://www.amazon.co.jp/dp/B08FZX8PYW

```bash
repository/
├── foo/ # fooサービス
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── persistent-volume.yaml
│   └── persistent-volume-claim.yaml
│
├── bar/ # barサービス
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── persistent-volume.yaml
│   └── persistent-volume-claim.yaml
│
└── baz/ # bazサービス
    ├── app/ # appコンポーネント
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   └── persistent-volume.yaml
    │
    └── db/ # dbコンポーネント
        ├── stateful-set.yaml
        ├── service.yaml
        └── persistent-volume.yaml
```

#### ▼ ディレクトリ無し

ディレクトリを作成しない。その代わりに、マイクロサービス別にmanifest.yamlファイルを作成し、関連する全てのKubernetesリソースをこの中で定義する。

```bash
repository/
├── foo.yaml # fooサービス（Deployment、Service、PersistentVolume、...）
├── bar.yaml # barサービス
└── baz.yaml # bazサービス
```

<br>

## 02. 命名規則

### ラベル

参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/

| キー名              | 説明                             | キー値の例                         |
|------------------|--------------------------------|-------------------------------|
| ```app```        | マイクロサービス名                      | ```foo```、```foo-service```   |
| ```component```  | コンテナの役割名                       | ```database```                |
| ```created-by``` | このKubernetesリソースを作成したリソースやユーザー | ```controller-manager```      |
| ```env```        | アプリケーションの実行環境名                 | ```prd```、```stg```、```dev``` |
| ```instance```   | コンテナのインスタンス名                   | ```mysql-abcxzy```            |
| ```managed-by``` | アプリケーションの管理ツール名                | ```helm```                    |
| ```name```       | マイクロサービスを構成するコンテナのベンダー名        | ```mysql```                   |
| ```part-of```    | マイクロサービス全体のアプリケーション名           | ```bar```                     |
| ```type```       | リソースの設定方法の種類名                  | ```host```（PVのマウント対象）         |
| ```version```    | マイクロサービスのリリースバージョン名            | ```5.7.21```                  |

<br>

### リソース名

マイクロサービスの技術スタックがリプレイスされる場合にも対応できるように、```<マイクロサービス名>-<コンポーネント名>-<Kubernetesリソース名>```とするとよい。

| Kubernetesリソース   | キー値の例                                                              |
|------------------|--------------------------------------------------------------------|
| Service          | ```foo-app-service```、```foo-db-service```                         |
| Pod              | ```foo-app-pod```、```foo-db-pod```                                 |
| PersistentVolume | ```foo-app-perisitent-volume```、```foo-db-pod-perisitent-volume``` |

<br>

### manifest.yamlファイル

#### ▼ ファイル名

スネークケースとする。ファイル名は、ディレクトリ構成による。

#### ▼ 拡張子

Kubernetesに関する開発プロジェクトを確認すると、そのほとんとで、YAMLファイルの拡張子を```yml```ではなく```.yaml```でしている。そこで、Kubernetesや関連技術（Istio、Helm、Skaffold、Envoy、など）のYAMLファイルの拡張子を```.yaml```で統一する。
