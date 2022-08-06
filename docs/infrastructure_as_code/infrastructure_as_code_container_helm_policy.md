---
title: 【IT技術の知見】設計ポリシー＠Helm
description: 設計ポリシー＠Helmの知見を記録しています。
---

# 設計ポリシー＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. リポジトリ構成ポリシー

### リポジトリ分割のメリット

リポジトリを分割することにより、以下のメリットがある。

- 認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

<br>

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
# KubernetesとHelmを同じリポジトリにする場合
repository/
├── kubernetes/
├── helm/
│   ├── foo-chart/
│   ├── bar-chart/
...
```

```yaml
# KubernetesとHelmを異なるリポジトリにする場合
repository/
├── foo-chart/
├── bar-chart/
...
```

#### ▼ 各チャートを異なるリポジトリにする

```yaml
# KubernetesとHelmを同じリポジトリにする場合
repository/
├── kubernetes/
├── helm/
│   └── foo-chart/
...
```

```yaml
# KubernetesとHelmを異なるリポジトリにする場合
repository/
├── foo-chart/
...
```

<br>

## 02. ディレクトリ構成ポリシー 

### chartディレクトリ

#### ▼ 必須の要素

ルートディレクトリに```Chart.yaml```ファイルと```template```ディレクトリを置く必要がある。また、チャートのコントリビュート要件も参考にすること。

ℹ️ 参考：

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
├── chart-<バージョンタグ>.tgz # チャートアーカイブ。
...
```

#### ▼ 実行環境別

実行環境別に```values```ファイルと```.tpl```ファイルを作成する。```.tpl```ファイルは```templates```ディレクトリ内に置く必要がある。テンプレートからマニフェストファイルを作成する時に、各環境の```values.yaml```を参照する。

ℹ️ 参考：https://github.com/codefresh-contrib/helm-promotion-sample-app

```yaml
repository/
├── chart/
│   ├── temlaptes/
│   │   ├── manifests/ # 共通のマニフェストファイル
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

ℹ️ 参考：https://helm.sh/docs/chart_best_practices/templates/

#### ▼ 拡張子

拡張子は```.yaml```とする。

ℹ️ 参考：https://helm.sh/docs/chart_best_practices/templates/

<br>

## 04. リリースのアップグレード

### リリースのアップグレードとは

Helmのチャートのアップグレードは、リリースをアップグレードすることにより、対応する。

<br>

### 非カスタムリソースのみからなるチャート場合

非カスタムリソースのみからなるリリースのアップグレードは以下の手順で行う。アップグレードが正常に完了したことがわかるように、```--wait```オプションを有効化すると良い。

ℹ️ 参考：https://helm.sh/docs/intro/using_helm/#helpful-options-for-installupgraderollback

（１）```helm upgrade```コマンドを実行し、既存のリリースをアップグレードする。

```bash
$ helm upgrade -f <valuesファイルへのパス> <リリース名> <チャートへのパス> --version <バージョンタグ> --wait
```

（２）リリースのバージョンが新しくなっていることを確認する。

```bash
$ helm list
```

<br>

### カスタムリソースを含むチャートの場合

Helmは、カスタムリソースを含むチャートのインストールはサポートしているが、アップグレードとアンインストールをサポートしていない。そのため、アップグレードとアンインストールは```kubectl```コマンドで実行する必要がある。

ℹ️ 参考：https://helm.sh/docs/chart_best_practices/custom_resource_definitions/#method-1-let-helm-do-it-for-you

（１）```kubectl apply```コマンドを実行し、新しいバージョンのカスタムリソースをapplyする。

```bash
$ kubectl apply -f <新しいバージョンのカスタムリソースのマニフェストファイルのURL>
```

（２）```kubectl delete```コマンドを実行し、古いバージョンのカスタムリソースをdeleteする。

```bash
$ kubectl delete -f <古いバージョンのカスタムリソースのマニフェストファイルのURL>
```

<br>

## 05. レビュー

### （１）差分が正しいかを確認

#### ▼ 大前提

```helm diff```コマンドの結果は可読性が高いわけではないため、差分が多くなるほど確認が大変になる。リリースの粒度を小さくし、差分が少なくなるようにする。

#### ▼ CI/CDパイプラインがある場合

HelmによるKubernetesリソースの変更をCI/CDパイプライン中に実行している場合、GitOpsツールの差分機能を使用し、リリース間のマニフェストファイルの差分を確認できるようにしておく。

ℹ️ 参考：https://www.youtube.com/watch?v=k_zp_Som7Mc

#### ▼ CI/CDパイプラインがある場合

HelmによるKubernetesリソースの変更を手動で実行している場合、```helm diff```コマンドの結果をクリップボードに出力し、これをプルリクに貼り付ける。これを確認し、差分が正しいかをレビューする。

```bash
$ helm diff <チャート名> -f values.yaml | pbcopy
```
<br>
