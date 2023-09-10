---
title: 【IT技術の知見】設計規約＠Helm
description: 設計規約＠Helmの知見を記録しています。
---

# 設計規約＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. リポジトリ構成規約

### リポジトリ分割のメリット

リポジトリを分割することにより、以下のメリットがある。

- 認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

<br>

### アプリとIaCを同じリポジトリで管理

```yaml
repository/
├── app/
├── manifests/
│   └── helm/
│       ├── foo-chart/
```

<br>

### アプリとIaCを異なるリポジトリで管理 (推奨)

#### ▼ 各チャートを同じリポジトリで管理する (推奨)

各チャートを同じリポジトリで管理する。

各チャートの全てのバージョンをリポジトリ内で管理すると、`index.yaml`ファイルやチャートアーカイブ (`.tgz`形式ファイル) が必要になってしまう。

そのため、`1`個のバージョンのみを管理するようにする。

```yaml
# KubernetesとHelmを同じリポジトリにする場合
repository/
├── kubernetes/
├── helm/
│   ├── foo-chart/
│   ├── bar-chart/
```

```yaml
# KubernetesとHelmを異なるリポジトリにする場合
repository/
├── foo-chart/
├── bar-chart/
```

#### ▼ 各チャートを異なるリポジトリで管理する

各チャートを異なるリポジトリで管理する。

この方法であると、リポジトリが増えすぎてしまうため、少なくとも同じ種類のチャートは同じリポジトリで管理する方が良い。

```yaml
# KubernetesとHelmを同じリポジトリにする場合
repository/
├── kubernetes/
├── helm/
│   └── foo-chart/
```

```yaml
# KubernetesとHelmを異なるリポジトリにする場合
repository/
├── foo-chart/
```

<br>

## 02. ディレクトリ構成規約

### 通常

最も基本的な構成。

実行環境別に`values`ファイルを作成する。

また、実行環境の差は設定値だけとし、`templates`ディレクトリ配下にマニフェストを配置する。

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

<br>

### 実行環境別

実行環境別に`values`ファイルを作成する。

また、実行環境ごとにマニフェストの構造に差分があるとし、`templates`ディレクトリ配下に実行環境別のディレクトリを配置する。

> - https://github.com/codefresh-contrib/helm-promotion-sample-app

```yaml
repository/
├── foo-chart/
│   ├── templates/
│   │   ├── shared/ # 共通のマニフェストの部品
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

<br>

### リソース別

リソース別にチャートを作成する。

また、`values`ファイルを配置するディレクトリをルートに配置する。

```yaml
repository/
├── kubernetes/
│   ├── templates/
│   ...
│
├── istio/
│   ├── templates/
│   ...
│
├── argocd/
│   ├── templates/
│   ...
│
└── values/
    ├── tes # テスト環境へのインストール時に出力するvaluesファイル
    │   ├── kubernetes/
    │   ├── istio/
    │   └── istio/
    │
    ├── stg/ # ステージング環境へのインストール時に出力するvaluesファイル
    └── prd/ # 本番環境へのインストール時に出力するvaluesファイル
...
```

ルートに配置した`values`ディレクトリには`values`ファイルを置く。

`values`ファイルは、リソース別に管理する。

```yaml
# 共通のvaluesファイル
#============
# Global
#============
labels:
  env: prd

#============
# Deployment
#============
deployment: ...

#============
# Service
#============
service: ...
```

<br>

## 03. コード規約

### テンプレート

#### ▼ 命名規則

ファイル名はスネークケースとする。

可能な限り、Kubernetesリソースの種類名 (例：Deployment、Service、ConfigMap) とする。

ただし、同じKubernetesリソースのマニフェストを複数作成する場合は、識別できる名前をプレフィクスとしてつける。

> - https://helm.sh/docs/chart_best_practices/templates/

#### ▼ ロジック

可能な限り、Kubernetesリソースごとのテンプレートを使い回すようにする。

**＊実装例＊**

このConfigMapのマニフェストが`1`個あれば、`values`ファイルによらずにConfigMapを作成できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-config-map
data:
  {{- range $key, $value := .Values.config | fromYaml }}
  {{ $key }}: {{ $value }}
  {{- end }}
```

#### ▼ 拡張子

拡張子は`.yaml`とする。

> - https://helm.sh/docs/chart_best_practices/templates/

#### ▼ アクションの選定

`.yaml`ファイルを丸ごと出力するようなアクション (例：`include`関数など) はできるだけ避け、マニフェストの共有部分を増やす。

差分があるところに関しては、`Values`関数を使用し、`values`ファイルからパラメーターを渡すだけになるように設計する。

公式リポジトリの実装方法を見て学んだ方が早い。

> - https://github.com/istio/istio/blob/1.14.3/manifests/charts

<br>

## 04. 開発環境

### helmコマンドのセットアップ

#### ▼ バージョンの固定

バージョンを統一するために、`.tool-versions`ファイルを作成する。

```bash
$ asdf local helm <バージョン>
```

```bash
# .tool-versionsファイル
helm <バージョンタグ>
```

asdfパッケージを使用して、`helm`コマンドをインストールする。

`.tool-versions`ファイルに定義されたバージョンがインストールされる。

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

新バージョンのチャートを使用して、改めてHelmリリースを実行することにより、チャートをアップグレードする。

<br>

### チャートのアップグレード方法

#### ▼ 非CRDのみからなるチャート場合

非CRDのみからなるチャートのアップグレードは以下の手順で行う。

アップグレードが正常に完了したことがわかるように、`--wait`オプションを有効化すると良い。

> - https://helm.sh/docs/intro/using_helm/#helpful-options-for-installupgraderollback

`(1)`

: `helm upgrade`コマンドを実行することにより、インストール済みのチャートをアップグレードする。

```bash
$ helm upgrade <Helmリリース名> <チャートへのパス> -f foo-values.yaml --version <バージョンタグ> --wait
```

`(2)`

: Helmリリースのリビジョン番号が新しくなっていることを確認する。

```bash
$ helm list
```

#### ▼ CRDを含むチャートの場合

Helmは、CRDを含むチャートのインストールはサポートしているが、アップグレードとアンインストールをサポートしていない。

そのため、アップグレードとアンインストールは`kubectl`コマンドで実行する必要がある。

補足として、他のツール (例：ArgoCD、Flux) を介してHelmを実行する場合、`helm upgrade`コマンドではなく、`helm template`コマンドと`kubectl apply`コマンドを使用しているため、この問題は考慮しなくともよくなる。

> - https://helm.sh/docs/chart_best_practices/custom_resource_definitions/#method-1-let-helm-do-it-for-you

`(1)`

: kube-apiserverにCRDのマニフェストを送信し、新バージョンのCRDを更新する。

     Helmは、CRDの更新に対応していない (作成には対応している) .

     そのため、`kubectl`コマンドを使用してこれを更新する。

```bash
$ kubectl apply -f <新バージョンのCRDのマニフェストのURL>
```

`(2)`

: kube-apiserverにカスタムリソースのマニフェストを送信する。

```bash
$ helm install <Helmリリース名> <チャートリポジトリ名>/foo-crd -n foo --version <バージョンタグ>
```

`(3)`

: 補足として、もしCRDをインストールする前にカスタムリソースをインストールしようとすると、カスタムリソースを定義できずにエラーになってしまう。

```bash
Error: unable to build kubernetes objects from release manifest: [unable to recognize "": no matches for kind "<カスタムリソース名>>" in version "<カスタムリソースのAPIグループ>"
```

`(4)`

: 旧バージョンのCRDを削除する。

     Helmは、CRDの削除に対応していないため、`kubectl delete`コマンドを使用する。

```bash
$ kubectl delete -f <旧バージョンのCRDのマニフェストのURL>
```

<br>

### 新バージョンの自動検出

外部のツール (例：renovate) を使用して、チャートの新バージョンを自動的に検出する。

<br>

## 06. CIパイプライン

### 仕様書自動作成

helm-docsを使用して、`values`ファイルの仕様書を作成する。

作成した仕様書を自動コミットできるようにする。

```bash
$ helm-docs -f <valuesファイル名>
```

```html
# チャート名 ![Version:
0.2.0](https://img.shields.io/badge/Version-0.2.0-informational?style=flat-square)
![Type:
application](https://img.shields.io/badge/Type-application-informational?style=flat-square)
... ## Maintainers | Name | Email | Url | | ---- | ----- | --- | --- | | ... |
... | ... | ... | ## Source Code ... ## Requirements | Repository | Name |
Version | | ---------- | ---- | ------- | --- | | ... | ... | ... | ... | ##
Values | Key | Type | Default | Description | | --- | ---- | ------- |
----------- | | ... | ... | ... | ... | --- Autogenerated from chart metadata
using [helm-docs
v1.11.0](https://github.com/norwoodj/helm-docs/releases/v1.11.0)
```

> - https://github.com/norwoodj/helm-docs

<br>

### チャートのホワイトボックステスト

#### ▼ ホワイトボックステストの実行環境

Helmで作成したマニフェストをツールの標準入力に渡し、Helmを検証する。

静的解析の実行環境は、実際のマニフェストデプロイ時の実行環境 (ArgoCDであればrepo-serverのコンテナ) と同じにする。

#### ▼ 静的解析

| 観点                                   | 説明                                                                                                                                                                                                                                                                                             | 補足                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| チャートの構造テスト                   | Helmの静的解析コマンド (`helm lint`コマンド) を使用する。チャートの構造 (valuesファイルがあるか、Chart.yamlがあるか、など) を検証する。                                                                                                                                                          |                                                        |
| チャートのベストプラクティス違反テスト | 外部のベストプラクティス違反テストツール (例：記入中...) を使用する。マニフェストではなく、チャートのベストプラクティス違反を検証する。                                                                                                                                                          |                                                        |
| チャートの脆弱性テスト                 | 外部の脆弱性テストツール (例：記入中...) を使用する。マニフェストではなく、チャートの実装方法に起因する脆弱性を検証する。補足として、チャートのインストールによるKubernetesリソースのセキュリティスキャン (例：trivy) は、既に作成されたKubernetesリソースに対する検証のため、ここには含めない。 | - https://blog.aquasec.com/trivy-v0.29.0-rbac-security |

静的解析のコマンドセットを使用してよい。

> - https://github.com/helm/chart-testing

#### ▼ ドライラン

テスト環境に対して`helm diff`コマンドを実行することにより、ドライランを実施する。

`helm diff`コマンドの結果は可読性が高いわけではないため、差分が多くなるほど確認が大変になる。

Helmリリースの粒度を小さくし、差分が少なくなるようにする。

> - https://www.infoq.com/presentations/automated-testing-terraform-docker-packer/

#### ▼ 単体テスト

Helmの単体テストコマンド (`helm test`コマンド) を使用して、機能追加/変更を含むチャートが単体で正しく動作するか否かを検証する。

代わりに、外部のテストツール (例：Terratest) を使用しても良い。

`helm test`コマンドを使用する場合、チャートの`/templates/test`ディレクトリ以下にテストコードを配置する必要がある。

そのため、`helm upgrade`コマンドでインストールされるHelmリリースにテストコードも含まれてしまうことに注意する。

> - https://www.infoq.com/presentations/automated-testing-terraform-docker-packer/
> - https://camunda.com/blog/2022/03/test/

#### ▼ 回帰テスト

事前に、既存のチャートでゴールデンファイルを作成しておき、回帰テストを実施する。

> - https://camunda.com/blog/2022/03/test/

<br>

### ホワイトボックステスト結果の通知

#### ▼ Helmを採用する場合

Helmには通知能力がなく、手動で知らせる必要がある。

そこで、`helm diff`コマンドをGitOpsによるCDパイプライン上で実行していない (手動で実行している) 場合、`helm diff`コマンドの結果をクリップボードに出力し、これをプルリクに貼り付ける。

```bash
$ helm diff <チャート名> -f foo-values.yaml --no-color \
    | grep -A 1000 Comparing \
    | pbcopy
```

あるいは、Namespaceを指定すると、追加/変更/削除の箇所のみ取得できる。

```bash
$ helm diff <チャート名> -f foo-values.yaml --no-color \
    | grep foo-namespace \
    | pbcopy

foo-namespace, foo-deployment, Deployment (apps) has been added:
...
```

#### ▼ Helm以外を使用する場合

GitOpsツールの差分を使用して、差分画面のURLを共有する。またはCDツールの通知能力 (例：argocd-bot) を使用して、CDパイプラインの結果が通知されるようにする。

> - https://github.com/argoproj-labs/argocd-bot

<br>

### チャートのブラックボックステスト

#### ▼ ブラックボックステストの実行環境

Helmで作成したマニフェストをClusterにデプロイし、動作を検証する。

実際のCluster上でマニフェストを検証してもよいし、本番のCluster (例：AWS EKS、GCP GKE、Azure AKE、Kubeadm、など) に相当する実行環境 (例：Kind、K3SやK3D、Minikube、など) をCI上に作成してもよい。

GitHub Actionsであれば、CI上にCluster構築するActionが提供されている。

> - https://github.com/helm/kind-action
> - https://github.com/medyagh/setup-minikube
> - https://github.com/debianmaster/actions-k3s
> - https://github.com/AbsaOSS/k3d-action

#### ▼ 結合テスト

テスト環境に対して`helm upgrade`コマンドを実行することにより、追加/変更を含む複数のチャートが正しく連携するか否かを検証する。

これは、CDパイプライン上で実施しても良いが、デメリットとして`helm upgrade`コマンドで出力される警告ログを確認できなくなってしまう。

> - https://www.infoq.com/presentations/automated-testing-terraform-docker-packer/
> - https://camunda.com/blog/2022/03/test/
> - https://github.com/camunda/camunda-platform-helm/tree/main/charts/camunda-platform/test
> - https://zenn.dev/johnn26/articles/detect-kubernetes-deplicated-api-automatically

#### ▼ 総合テスト

テスト環境に対して`helm upgrade`コマンドを実行することにより、既存機能/追加/変更を含む全てのチャートを組み合わせた総合テストを実施する。

これは、GitOpsによるCDパイプライン上で実施しても良いが、デメリットとしてGitOpsツール上では`helm upgrade`コマンドで出力される警告ログを確認できなくなってしまう。

> - https://camunda.com/blog/2022/03/test/

## 06-02. CDパイプライン

### デプロイ

> - https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_policy.html

<br>

### ロールバック

#### ▼ Helmを採用する場合

`helm history`コマンドで過去のHelmリリースタグ (リビジョン) を確認し、`helm rollback`コマンドでロールバックする。

#### ▼ Helm以外を使用する場合

> - https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_policy.html

<br>

## 06-03. 事後処理

### デプロイの通知

> - https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_cncf_project_argocd_policy.html

<br>
