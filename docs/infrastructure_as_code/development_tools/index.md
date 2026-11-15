---
hide:
  - navigation
tags:
  - "K8sアプリ"
---

# セクションの目次

!!! info "このセクションについて"

    **量が多いため、[K8sセクション](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/kubernetes/index.html) から切り分けています**

<br>

## 🌊 K8s アプリ

### <u>開発環境</u>

!!! cards ":simple-kubernetes: Minikube"

    <div class="grid cards compact" markdown>

    - **[Minikube](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_environment_development_minikube.html)**

      Minikube によるローカルの Kubernetes 環境

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_environment_development_minikube_command.html)**

      minikube コマンドとデバッグ

    </div>

!!! cards ":simple-kubernetes: Kind"

    <div class="grid cards compact" markdown>

    - **[Kind](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_environment_development_kind.html)**

      Kind によるコンテナ上の Kubernetes 環境

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_environment_development_kind_command.html)**

      kind コマンドによる Cluster の作成

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_environment_development_kind_conf.html)**

      kind-config.yaml による Node の設定

    </div>

!!! cards ":simple-kubernetes: K3D"

    K3D による軽量な Kubernetes 環境

    <div class="grid cards compact" markdown>

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_environment_development_k3d_command.html)**

      k3d の cluster と config コマンド

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_environment_development_k3d_conf.html)**

      servers や agents などの設定ファイル

    </div>

!!! cards ":simple-k3s: K3s"

    K3s による軽量な Kubernetes ディストリビューション

    <div class="grid cards compact" markdown>

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_environment_development_k3s_command.html)**

      K3s のセットアップとコマンド

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_environment_development_k3s_conf.html)**

      registries.yaml によるイメージレジストリの設定

    </div>

### <u>本番環境</u>

!!! cards ":simple-kubernetes: VCluster"

    <div class="grid cards compact" markdown>

    - **[VCluster](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_environment_production_vcluster.html)**

      VCluster による仮想的な Kubernetes Cluster

    </div>

<br>

### マニフェスト管理

!!! cards ":simple-helm: Helm"

    <div class="grid cards compact" markdown>

    - **[Helm](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm.html)**

      Helm のチャート、関数、Helmfile

    - **[コマンド (コマンド)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_command.html)**

      helm コマンドの使い方

    - **[helm プラグイン (コマンド)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_command_plugin.html)**

      helm-diff や helm-secrets などのプラグイン

    - **[チャート (チャート)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_chart.html)**

      Chart.yaml、values.yaml などのチャートの構成

    - **[関数 (チャート)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_chart_function.html)**

      テンプレートや values ファイルの関数

    - **[共通項目 (チャート)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_chart_common.html)**

      Helm のラベルとアノテーション

    - **[プラクティス集](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_practices.html)**

      リポジトリとチャートの構成規約、アップグレード

    - **[Helmfile (Helmfile)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_helmfile.html)**

      Helmfile の仕組み、設計規約、関数

    - **[コマンド (Helmfile)](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_helmfile_command.html)**

      helmfile コマンドの使い方

    </div>

!!! cards ":simple-kubernetes: Kustomize"

    <div class="grid cards compact" markdown>

    - **[Kustomize](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_kustomize.html)**

      Kustomize によるマニフェストの差分管理

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_kustomize_command.html)**

      kustomize コマンドと kubectl による適用

    - **[プラクティス集](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_kustomize_practices.html)**

      実行環境ごとのディレクトリ構成

    </div>
