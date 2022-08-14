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

#### ▼ 各チャートを同じリポジトリで管理する（推奨）

各チャートを同じリポジトリで管理する。各チャートの全てのバージョンをリポジトリ内で管理すると、```index.yaml```ファイルやチャートアーカイブが必要になってしまうため、一つのバージョンのみを管理するようにする。

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

#### ▼ 各チャートを異なるリポジトリで管理する

各チャートを異なるリポジトリで管理する。この方法であると、リポジトリが増えすぎてしまうため、少なくとも同じ種類のチャートは同じリポジトリで管理する方が良い。

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

#### ▼ 通常

最も基本的な構成。実行環境別に```values```ファイルを作成する。また、実行環境の差は設定値だけとし、```templates```ディレクトリ配下にマニフェストファイルを配置する。

```yaml
repository/
├── foo-chart/
│   ├── templates/
│   │   ├── config-map.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ...
│   │
│   ├── values/
│   │   ├── tes.yaml # テスト環境へのapply時に出力する値
│   │   ├── stg.yaml # ステージング環境へのapply時に出力する値
│   │   └── prd.yaml # 本番環境へのapply時に出力する値
...
```

#### ▼ 実行環境別

実行環境別に```values```ファイルを作成する。また、実行環境ごとにマニフェストファイルの構造に差分があるとし、、```templates```ディレクトリ配下に実行環境別のディレクトリを配置する。

ℹ️ 参考：https://github.com/codefresh-contrib/helm-promotion-sample-app

```yaml
repository/
├── foo-chart/
│   ├── templates/
│   │   ├── common/ # 共通のマニフェストファイルの部品
│   │   ├── prd/ # 本番環境のみで適用するマニフェストの部品
│   │   ├── stg/
│   │   └── tes/         
│   │
│   ├── values/
│   │   ├── tes.yaml # テスト環境へのapply時に出力する値
│   │   ├── stg.yaml # ステージング環境へのapply時に出力する値
│   │   └── prd.yaml # 本番環境へのapply時に出力する値
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
│   ├── tes.yaml # テスト環境へのapply時に出力する値
│   ├── stg.yaml # ステージング環境へのapply時に出力する値
│   └── prd.yaml # 本番環境へのapply時に出力する値
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

## 04. 開発環境

#### ▼ asdfパッケージを使用する場合

バージョンを統一するために、```.tool-versions```ファイルを作成する。

```bash
# .tool-versionsファイル
helm <バージョンタグ>
```

asdfパッケージを使用して、```helm```コマンドをインストールする。```.tool-versions```ファイルに定義されたバージョンがインストールされる。

```bash
$ asdf plugin list all | grep helm

helm   *https://github.com/Antiarchitect/asdf-helm.git
...


$ asdf plugin add https://github.com/Antiarchitect/asdf-helm.git
$ asdf install
```

<br>

## 05. チャートのアップグレード

### チャートのアップグレードとは

新しいバージョンのチャートを使用して、改めてリリースを実行することにより、チャートをアップグレードする。
<br>

### チャートのアップグレード方法

#### ▼ 非カスタムリソースのみからなるチャート場合

非カスタムリソースのみからなるチャートのアップグレードは以下の手順で行う。アップグレードが正常に完了したことがわかるように、```--wait```オプションを有効化すると良い。

ℹ️ 参考：https://helm.sh/docs/intro/using_helm/#helpful-options-for-installupgraderollback

（１）```helm upgrade```コマンドを実行し、インストール済みのチャートをアップグレードする。

```bash
$ helm upgrade -f <valuesファイルへのパス> <リリース名> <チャートへのパス> --version <バージョンタグ> --wait
```

（２）リリースのリビジョン番号が新しくなっていることを確認する。

```bash
$ helm list
```

#### ▼ カスタムリソースを含むチャートの場合

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

### 新バージョンの自動検出

外部のツール（例：Renovate）を使用し、チャートの新しいバージョンを自動的に検出する。

<br>

## 06. CIパイプライン

### チャートのホワイトボックステスト

#### ▼ 静的解析

| 観点          | 説明                                                         | 補足 |
|-------------| ------------------------------------------------------------ | ---- |
| 文法の誤り       | Helmの静的解析コマンド（```helm lint```コマンド）を使用し、機能追加/変更を含むチャートの静的解析を実施する。 |      |
| ベストプラクティス違反 |                                                              |      |
| 脆弱性         | 外部の脆弱性テストツール（例：checkov）を使用し、チャートの脆弱性テストを実施する。 |      |

#### ▼ ドライラン

テスト環境に対して```helm diff```コマンドを実行し、ドライランを実施する。```helm diff```コマンドの結果は可読性が高いわけではないため、差分が多くなるほど確認が大変になる。リリースの粒度を小さくし、差分が少なくなるようにする。

ℹ️ 参考：https://www.infoq.com/presentations/automated-testing-terraform-docker-packer/

#### ▼ 単体テスト

Helmの単体テストコマンド（```helm test```コマンド）を使用して、機能追加/変更を含むチャートが単体で正しく動作するか否かを検証する。外部のテストツール（例：Terratest）を使用しても良い。```helm test```コマンドを使用する場合、チャートの```/templates/test```ディレクトリ以下にテストコードを配置する必要がある。そのため、```helm upgrade```コマンドでインストールされるリリースにテストコードも含まれてしまうことに注意する。

ℹ️ 参考：

- https://www.infoq.com/presentations/automated-testing-terraform-docker-packer/
- https://camunda.com/blog/2022/03/test/

#### ▼ 回帰テスト

ゴールデンファイルを事前に作成しておき、既存のチャートの回帰テストを実施する。

ℹ️ 参考：https://camunda.com/blog/2022/03/test/

<br>

### ホワイトボックステスト結果の通知

#### ▼ CDパイプラインがある場合

```helm diff```コマンドをGitOpsによるCDパイプライン上で実行している場合、GitOpsツールの差分機能を使用し、差分画面のURLを共有する。または通知ツール（例：argocd-bot）を使用し、GitHub上に差分の結果が通知されるようにする。

ℹ️ 参考：https://github.com/argoproj-labs/argocd-bot

#### ▼ CDパイプラインがない場合

```helm diff```コマンドをGitOpsによるCDパイプライン上で実行していない（手動で実行している）場合、```helm diff```コマンドの結果をクリップボードに出力し、これをプルリクに貼り付ける。

```bash
$ helm diff <チャート名> -f values.yaml | pbcopy
```

<br>

## 05-02. CDパイプライン

### チャートのブラックボックステスト

#### ▼ 結合テスト

テスト環境に対して```helm upgrade```コマンドを実行し、追加/変更を含む複数のチャートが正しく連携するか否かを検証する。これは、CDパイプライン上で実施しても良いが、デメリットとして```helm upgrade```コマンドで出力される警告ログを確認できなくなってしまう。

ℹ️ 参考：

- https://www.infoq.com/presentations/automated-testing-terraform-docker-packer/
- https://camunda.com/blog/2022/03/test/
- https://github.com/camunda/camunda-platform-helm/tree/main/charts/camunda-platform/test
- https://zenn.dev/johnn26/articles/detect-kubernetes-deplicated-api-automatically

#### ▼ 総合テスト

テスト環境に対して```helm upgrade```コマンドを実行し、既存機能/追加/変更を含む全てのチャートを組み合わせた総合テストを実施する。これは、GitOpsによるCDパイプライン上で実施しても良いが、デメリットとしてGitOpsツール上では```helm upgrade```コマンドで出力される警告ログを確認できなくなってしまう。

ℹ️ 参考：https://camunda.com/blog/2022/03/test/

<br>



