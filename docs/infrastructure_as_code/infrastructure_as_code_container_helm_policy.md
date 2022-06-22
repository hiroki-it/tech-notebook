---
title: 【知見を記録するサイト】設計ポリシー＠Helm
description: 設計ポリシー＠Helmの知見をまとめました。
---

# 設計ポリシー＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. リポジトリ構成

### モノリポジトリ

```yaml
repository/
├── app/
├── manifests/
│   └── helm/
│       ├── foo-chart/
...
```

<br>

### ポリリポジトリ（推奨）

#### ▼ 各チャートを同じリポジトリにする（推奨）

```yaml
# KubernetesとHelmを同じディレクトリにする場合
repository/
├── kubernetes/
├── helm/
│   ├── foo-chart/
│   ├── bar-chart/
...
```

```yaml
# KubernetesとHelmを異なるディレクトリにする場合
repository/
├── foo-chart/
├── bar-chart/
...
```

#### ▼ 各チャートを異なるリポジトリにする

```yaml
# KubernetesとHelmを同じディレクトリにする場合
repository/
├── kubernetes/
├── helm/
│   └── foo-chart/
...
```

```yaml
# KubernetesとHelmを異なるディレクトリにする場合
repository/
├── foo-chart/
...
```

<br>

## 02. ディレクトリ構成 

### chartディレクトリ

#### ▼ 必須の要素

ルートディレクトリに```Chart.yaml```ファイルと```template```ディレクトリを置く必要がある。また、チャートのコントリビュート要件も参考にすること。

参考：

- https://github.com/helm/charts/blob/master/CONTRIBUTING.md#technical-requirements
- https://helm.sh/docs/topics/charts/#the-chart-file-structure
- https://mixi-developers.mixi.co.jp/argocd-with-helm-7ec01a325acb
- https://helm.sh/docs/helm/helm_package/
- https://helm.sh/docs/chart_best_practices/conventions/#usage-of-the-words-helm-and-chart

```yaml
repository/
├── chart/
│   ├── charts/ # 依存する他のチャートを配置する。
│   ├── temlaptes/ # ユーザー定義のチャートを配置する。ディレクトリ構造は自由である。
│   │   ├── tests/
│   │   ├── _helpers.tpl # ヘルパー関数のみを設定する。
│   │   └── template.yaml # チャートの共通ロジックを設定する。
│   │
│   ├── .helmignore # チャートアーカイブの作成時に無視するファイルを設定する。
│   ├── Chart.yaml # チャートの概要を設定する。頭文字は大文字である必要がある。
│   └── values.yaml # テンプレートの変数に出力する値を設定する。
│
├── chart-1.0.0.tgz # チャートアーカイブ。
...
```

#### ▼ 実行環境別

実行環境別に```values```ファイルと```.tpl```ファイルを作成する。```.tpl```ファイルは```templates```ディレクトリ内に置く必要がある。テンプレートからmanifest.yamlファイルを作成する時に、各環境の```values.yaml```を参照する。

参考：https://github.com/codefresh-contrib/helm-promotion-sample-app

```yaml
repository/
├── chart/
│   ├── temlaptes/
│   │   ├── manifests/ # 共通のmanifest.yamlファイル
│   │   ├── tpls/ # .tplファイル
│   │   │   ├── prd/
│   │   │   ├── stg/
│   │   │   └── dev/         
│   │   ...
│   │
│   ├── values/
│   │   ├── prd.yaml # 本番環境へのapply時に出力する値
│   │   ├── stg.yaml # ステージング環境へのapply時に出力する値
│   │   └── dev.yaml # 開発環境へのapply時に出力する値
...
```

#### ▼ リソース別

リソース別にチャートを作成する。また、```values```ファイルを配置するディレクトリをルートに配置する。

```yaml
repository/
├── kubernetes/
│   ├── temlaptes/
│   ...
│
├── istio/
│   ├── temlaptes/
│   ...
│
├── argocd/
│   ├── temlaptes/
│   ...
│
├── values/
...
```

ルートに配置した```values```ディレクトリには```values```ファイルを置く。```values```ファイルは、リソース間で共通に管理するか、あるいはリソース別に管理する。

```yaml
# 共通のvaluesファイル
#============
# General
#============
labels:
  env: prd
#============
# Kubernetes
#============

#============
# Istio
#============

#============
# ArgoCD
#============
```


<br>

## 03. 命名規則

### templateディレクトリ

#### ▼ 命名規則

ファイル名はスネークケースとし、Kubernetesリソースを識別できる名前とする。

参考：https://helm.sh/docs/chart_best_practices/templates/

#### ▼ 拡張子

拡張子は```.yaml```とする。

参考：https://helm.sh/docs/chart_best_practices/templates/

<br>
