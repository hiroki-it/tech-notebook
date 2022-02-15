---
title: 【知見を記録するサイト】設計ポリシー＠Kubernetes
description: 設計ポリシー＠Kubernetesの知見をまとめました．
---

# 設計ポリシー＠Kubernetes

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ディレクトリ構成

### リポジトリ

#### ・アプリケーションとは別

アプリケーションとは異なるリポジトリにて，マニフェストファイルを配置する．

```bash
project
├── foo.yml
...
```

#### ・アプリケーションと同じ

アプリケーションと同じリポジトリにて，```kubernetes```ディレクトリを作成し，ここにマニフェストファイルを配置する．

```bash
project
├── src # アプリケーション
├── kubernetes
│   ├── foo.yml
...
```

<br>

### マニフェストファイルのディレクトリ構成

#### ・マイクロサービス別

マイクロサービス別にディレクトリを作成し，Kubernetesオブジェクトごとに別々のマニフェストファイルを作成する．さらに，コンポーネント（app，db）別に分割してもよい．マニフェストの```apply```の順番を制御しにくいデメリットがある．

参考：https://www.amazon.co.jp/dp/B08FZX8PYWゆーむ

```bash
project
├── foo # fooサービス
│   ├── deployment.yml
│   ├── service.yml
│   ├── persistentVolume.yml
│   └── persistentVolumeClaim.yml
│
├── bar # fooサービス
│   ├── deployment.yml
│   ├── service.yml
│   ├── persistentVolume.yml
│   └── persistentVolumeClaim.yml
│
└── baz # bazサービス
    ├── app # appコンポーネント
    │   ├── deployment.yml
    │   ├── service.yml
    │   └── persistentVolume.yml
    │
    └── db # dbコンポーネント
        ├── statefulSet.yml
        ├── service.yml
        └── persistentVolume.yml
```

#### ・ディレクトリ無し

ディレクトリを作成しない．その代わりに，マイクロサービス別にマニフェストファイルを作成し，関連する全てのKubernetesオブジェクトをこの中で定義する．

```bash
project
├── foo.yml # fooサービス（Deployment，Service，PersistentVolume，...）
├── bar.yml # fooサービス
└── baz.yml # bazサービス
```

<br>

## 02. 命名規則

### ラベル

参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/

| キー名           | 説明                                                       | キー値の例                      |
| ---------------- | ---------------------------------------------------------- | ------------------------------- |
| ```app```        | マイクロサービス名                                         | ```foo```，```foo-service```    |
| ```component```  | コンテナの役割名                                           | ```database```                  |
| ```created-by``` | このKubernetesオブジェクトを作成したオブジェクトやユーザー | ```controller-manager```        |
| ```env```        | アプリケーションの実行環境名                               | ```prd```，```stg```，```dev``` |
| ```instance```   | コンテナのインスタンス名                                   | ```mysql-abcxzy```              |
| ```managed-by``` | アプリケーションの管理ツール名                             | ```helm```                      |
| ```name```       | マイクロサービスを構成するコンテナのベンダー名             | ```mysql```                     |
| ```part-of```    | マイクロサービス全体のアプリケーション名                   | ```bar```                       |
| ```version```    | マイクロサービスのリリースバージョン名                     | ```5.7.21```                    |

<br>

### オブジェクト名

マイクロサービスの技術スタックがリプレイスされる場合にも対応できるように，```<マイクロサービス名>-<コンポーネント名>-<Kubernetesオブジェクト名>```とするとよい．

| Kubernetesオブジェクト | キー値の例 |
| ---------------------- | ------------------------------------------------------------ |
| Service                | ```foo-app-service```，```foo-db-service```                  |
| Pod                    | ```foo-app-pod```，```foo-db-pod```                          |
| PersistentVolume       | ```foo-app-perisitent-volume```，```foo-db-pod-perisitent-volume``` |

