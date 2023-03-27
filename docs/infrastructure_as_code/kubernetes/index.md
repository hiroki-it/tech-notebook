# セクションの目次


!!! info "このセクションについて"

    **量が多いため、[IaCセクション](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/index.html) から切り分けています**

<br>

## ☸️ Kubernetes (IaC)

### Kubernetes

* #### [︎Kubernetes](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes.html)

* #### [︎コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_command.html)

* #### <u>コンポーネント</u>
  > * ##### [コントロールプレーンコンポーネント](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_component_control_plane.html)
  > * ##### [Nodeコンポーネント](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_component_node.html)

* #### [ネットワーク](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_network.html)

* #### [︎設計ポリシー](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_policy.html)

<br>

### アドオン

* #### <u>コントロールプレーンNodeのアドオン</u>
  > * ##### [admission-controllers](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_component_control_plane_admission_controllers.html)

* #### Ingressコントローラー
  > * ##### [Ingressコントローラー](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_ingress_controller.html)
  > * ##### [AWS Load Balancerコントローラー](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_ingress_controller_alb.html)

* #### <u>ネットワークアドオン</u>
  > * ##### [CoreDNS](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_network_coredns.html)
  > * ##### [CNI](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_network_cni.html)
  > * ##### [ExternalDNS](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_network_external_dns.html)

* #### <u>SecretsストアCSIドライバー</u>
  > * ##### [SecretsストアCSIドライバー](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_secrets_store_csi_driver.html)
  > * ##### [︎リソース定義](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_secrets_store_csi_driver_resource_definition.html)

* #### <u>︎クラウドプロバイダーアドオン</u>
  > * ##### <u>AWS EKSアドオン</u>
  > > * ##### [AWS EKSアドオン](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_cloud_provider_aws_eks.html)
  > > * ##### [AWS EBS CSIドライバー](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_cloud_provider_aws_eks_ebs_csi_driver.html)

<br>

### ︎ハードウェアリソース管理

* #### [︎addon-resizer](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_hardware_resource_management_addon_resizer.html)

* #### [︎cluster-autoscaler](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_hardware_resource_management_cluster_autoscaler.html)

* #### [︎descheduler](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_hardware_resource_management_descheduler.html)

* #### [karpenter](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_hardware_resource_management_karpenter.html)

* #### [metrics-server](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_hardware_resource_management_metrics_server.html)

<br>

### 開発

* #### [クライアントパッケージ](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_development_client_package.html)

* #### <u>開発環境</u>
  > * ##### <u>Minikube</u>
  > > * ##### [Minikube](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_development_environment_minikube.html)
  > > * ##### [コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_development_environment_minikube_command.html)

* #### <u>開発ツール</u>
  > * ##### <u>静的解析ツール</u>
  > > * ##### [静的解析ツール](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_development_linter.html)
  > > * ##### [pluto](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_development_linter_pluto.html)

<br>

### マニフェスト管理

* #### <u>Helm</u>
  > * ##### [︎Helm](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm.html)
  > * ##### <u>コマンド</u>
  > > * ##### [︎コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_command.html)
  > > * ##### [helmプラグイン](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_command_plugin.html)
  > * ##### <u>チャート</u>
  > > * ##### [チャート](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_chart.html)
  > > * ##### [関数](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_chart_function.html)
  > * ##### [︎設計ポリシー](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_policy.html)
  > * ##### <u>Helmfile</u>
  > > * ##### [︎Helmfile](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_helmfile.html)
  > > * ##### [コマンド](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_helm_helmfile_command.html)

* #### <u>Kustomize</u>
  > * ##### [Kustomize](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_kustomize.html)
  > * ##### [︎設計ポリシー](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_manifests_management_kustomize_policy.html)

<br>

### Kubernetesリソース

* #### [︎Kubernetesリソース](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_resource.html)

* #### <u>︎リソース定義</u>
  > * ##### [︎リソース定義](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_resource_definition.html)
  > * ##### [共通部分](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_resource_definition_common.html)

<br>

### カスタムリソース

* #### [カスタムリソース](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_custom_resource.html)

* #### [カスタムコントローラー](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_custom_resource_custom_controller.html)

<br>
