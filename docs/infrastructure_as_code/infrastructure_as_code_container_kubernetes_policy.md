---
title: 【知見を記録するサイト】設計ポリシー＠Kubernetes
description: 設計ポリシー＠Kubernetesの知見をまとめました。
---

# 設計ポリシー＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### 実行環境

#### ▼ 開発環境

参考：

- https://codefresh.io/kubernetes-tutorial/local-kubernetes-mac-minikube-vs-docker-desktop/
- https://blog.cybozu.io/entry/2019/07/03/170000

|                        | Minikube                                                     | Docker for Desktop                                           | Kind                                                 |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------- |
| 概要                   | カスタマイズ性が高いため、カスタマイズ次第で本番環境と開発環境の差異を小さくできる。2022年3月の現在では、Kubernetesの開発環境として、ベタープラクティスである。 | セットアップが非常に簡単（有効化するだけ）なので、開発に取り掛かるまでが早い。 | セットアップが簡単なので、開発に取り掛かるまでが早い |
| セットアップの難易度   | 簡単                                                         | 非常に簡単                                                   | 簡単                                                 |
| Kubernetesのバージョン | 任意のバージョンを指定できる。                               | Docker for Desktopのバージョンごとに、Kubernetesのバージョンが固定される。 | 任意のバージョンを指定できる。                       |
| マルチNode             | 不可                                                         | 可能                                                         | 可能                                                 |
| Nodeのカスタマイズ性   | 高い                                                         | 低い                                                         | 高い                                                 |

#### ▼ 本番環境

参考：https://techstep.hatenablog.com/entry/2019/12/23/000715

|            | 全て自前                                                     | 構築ツール（Kubeadm、Rancher、Kops、Kubespray）              | クラウドプロバイダー（AWS EKS、GCP GKE、など）               |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 説明       | オンプレ、仮想サーバー上にマスターNodeやワーカーNodeとなる仮想サーバーを事前に構築しておく。仮想サーバー上にKubernetesをセットアップする。 | オンプレ/仮想サーバー上にマスターNodeやワーカーNodeとなる仮想サーバーを事前に構築しておく。ツールを使用して、仮想サーバー上にKubernetesをセットアップする。 | クラウドプロバイダーが仮想サーバー上にKubernetesをセットアップしてくれている。 |
| メリット   | 全て自前なため、自由にカスタマイズできる。                   | カスタマイズ性が高い。                                       | マネージドであるため、ユーザーがKubernetesのNodeを管理するコストが低い。2022年3月の現在では、Kubernetesの本番環境として、ベタープラクティスである。 |
| デメリット | ユーザーがKubernetesのNodeを管理するコストが高い。           | ユーザーがKubernetesのNodeを管理するコストが高い。           | カスタマイズ性が低い                                         |

<br>

## 02. ディレクトリ構成

### リポジトリ

#### ▼ アプリケーションとは別

アプリケーションとは異なるリポジトリにて、manifest.yamlファイルを配置する。

```yaml
repository/
├── foo.yaml
...
```

#### ▼ アプリケーションと同じ

アプリケーションと同じリポジトリにて、```kubernetes```ディレクトリを作成し、ここにmanifest.yamlファイルを配置する。

```yaml
repository/
├── src/ # アプリケーション
├── kubernetes/
│   ├── foo.yaml
...
```

<br>

### ディレクトリ/ファイルの構成

#### ▼ マイクロサービス別

マイクロサービス別にディレクトリを作成し、Kubernetesリソースごとに別々のmanifest.yamlファイルを作成する。さらに、実行環境やコンポーネント（app、db）別に分割してもよい。マニフェストの```apply```の順番を制御しにくいデメリットがある。

参考：https://www.amazon.co.jp/dp/B08FZX8PYW

```yaml
repository/
├── foo/ # fooサービス
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── persistent-volume.yaml
│   └── persistent-volume-claim.yaml
│
├── bar/ # barサービス
│   ├── dev # dev環境
│   ... ├── deployment.yaml
│       ├── service.yaml
│       ├── persistent-volume.yaml
│       └── persistent-volume-claim.yaml
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

```yaml
repository/
├── foo.yaml # fooサービス（Deployment、Service、PersistentVolume、...）
├── bar.yaml # barサービス
└── baz.yaml # bazサービス
```

<br>

## 03. 命名規則

### labelキーキー

#### ▼ app.kubernetes.io

Kubernetesに関するlabelキーを以下に示す。

参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/

| キー              | 説明                                               | 値の例                          |
| ----------------- | -------------------------------------------------- | ------------------------------- |
| ```/app```        | マイクロサービス名                                 | ```foo```、```foo-service```    |
| ```/component```  | コンテナの役割名                                   | ```database```                  |
| ```/created-by``` | このKubernetesリソースを作成したリソースやユーザー | ```controller-manager```        |
| ```/env```        | アプリケーションの実行環境名                       | ```prd```、```stg```、```dev``` |
| ```/instance```   | 冗長化されたコンテナのインスタンス名               | ```mysql-12345```               |
| ```/managed-by``` | アプリケーションの管理ツール名                     | ```helm```                      |
| ```/name```       | マイクロサービスを構成するコンテナのベンダー名     | ```mysql```                     |
| ```/part-of```    | マイクロサービス全体のアプリケーション名           | ```bar```                       |
| ```/type```       | リソースの設定方法の種類名                         | ```host```（PVのマウント対象）  |
| ```/version```    | マイクロサービスのリリースバージョン名             | ```5.7.21```                    |

#### ▼ helm.sh

| キー         | 説明                   | 値の例          |
| ------------ | ---------------------- | --------------- |
| ```/chart``` | 使用しているチャート名 | ```foo-chart``` |

<br>

### リソース名

ケバブケースで命名する。マイクロサービスの技術スタックがリプレイスされる場合にも対応できるように、```<マイクロサービス名>-<コンポーネント名>-<Kubernetesリソース名>```とすると良い。

| Kubernetesリソース   | キー値の例                                                              |
|------------------|--------------------------------------------------------------------|
| Service          | ```foo-app-service```、```foo-db-service```                         |
| Pod              | ```foo-app-pod```、```foo-db-pod```                                 |
| PersistentVolume | ```foo-app-perisitent-volume```、```foo-db-pod-perisitent-volume``` |

<br>

### manifest.yamlファイル

#### ▼ ファイル名

ケバブケースとする。ファイル名は、ディレクトリ構成による。

#### ▼ 拡張子

Kubernetesに関する開発プロジェクトを確認すると、そのほとんとで、YAMLファイルの拡張子を```yml```ではなく```.yaml```でしている。そこで、Kubernetesや関連技術（Istio、Helm、Skaffold、Envoy、など）のYAMLファイルの拡張子を```.yaml```で統一する。
