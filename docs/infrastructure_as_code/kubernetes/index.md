---
hide:
  - navigation
tags:
  - "K8s"
---

# セクションの目次

!!! info "このセクションについて"

    **量が多いため、[IaCセクション](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/index.html) から切り分けています**

<br>

## ☸️ Kubernetes

### Kubernetes

!!! cards ":simple-kubernetes: Kubernetes"

    <div class="grid cards compact" markdown>

    - **[Kubernetes](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes.html)**

      Kubernetes の仕組み、証明書、マルチテナント

    </div>

!!! cards ":material-server-network: コントロールプレーンコンポーネント"

    <div class="grid cards compact" markdown>

    - **[コントロールプレーンコンポーネント](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_component_control_plane.html)**

      kube-apiserver などのコントロールプレーンのコンポーネント

    </div>

!!! cards ":material-server: Node コンポーネント"

    <div class="grid cards compact" markdown>

    - **[Node コンポーネント](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_component_node.html)**

      kubelet、kube-proxy、コンテナランタイム

    </div>

!!! cards ":material-console: コマンド"

    <div class="grid cards compact" markdown>

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_command.html)**

      kubectl コマンドの使い方

    </div>

!!! cards ":material-lan: ネットワーク"

    <div class="grid cards compact" markdown>

    - **[ネットワーク](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_network.html)**

      Node、Service、Pod のネットワークと Pod 間通信

    </div>

!!! cards ":material-package-variant: クライアントパッケージ"

    <div class="grid cards compact" markdown>

    - **[クライアントパッケージ](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_client_package.html)**

      client-go による kube-apiserver との通信

    </div>

!!! cards ":material-lightbulb-outline: プラクティス集"

    <div class="grid cards compact" markdown>

    - **[プラクティス集](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_practices.html)**

      Kubernetes リソース、Cluster、コンポーネントの設計

    - **[K8s リソース](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_practices_resource.html)**

      Cluster、Node、Etcd の設計

    - **[K8s Cluster](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_practices_cluster.html)**

      Cluster の運用とアップグレード

    - **[K8s コンポーネント](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_practices_component.html)**

      コントロールプレーン Node、ワーカーNode、コンテナ

    </div>

<br>

### Kubernetes リソース

!!! cards ":material-cube-outline: Kubernetes リソース"

    <div class="grid cards compact" markdown>

    - **[Kubernetes リソース](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_resource.html)**

      Workload、ネットワーク、設定、ストレージ系のリソース

    </div>

!!! cards ":material-file-code-outline: リソース定義"

    <div class="grid cards compact" markdown>

    - **[リソース定義](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_resource_definition.html)**

      Kubernetes リソースのマニフェストの書き方

    - **[共通項目](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_resource_definition_common.html)**

      apiVersion、kind、metadata などの共通キー

    - **[Amazon EKS](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_resource_definition_aws_eks.html)**

      Amazon EKS 固有のラベル

    </div>

<br>

### カスタムリソース

!!! cards ":material-cube-unfolded: カスタムリソース"

    <div class="grid cards compact" markdown>

    - **[カスタムリソース](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_custom_resource.html)**

      カスタムリソースと CRD

    </div>

!!! cards ":material-sync: Custom Controller"

    <div class="grid cards compact" markdown>

    - **[Custom Controller](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_custom_resource_custom_controller.html)**

      Custom Controller、reconciliation、Operator パターン

    </div>

!!! cards ":material-code-braces: ロジック"

    <div class="grid cards compact" markdown>

    - **[ロジック](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_custom_resource_logic.html)**

      Custom Controller の実装例

    </div>

<br>
