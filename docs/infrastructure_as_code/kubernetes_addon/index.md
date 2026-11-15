---
hide:
  - navigation
tags:
  - "K8sアドオン"
---

# セクションの目次

!!! info "このセクションについて"

    **量が多いため、[K8sセクション](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/kubernetes/index.html) から切り分けています**

<br>

## ⏬ K8s アドオン

### コントロールプレーン系

<div class="grid cards compact" markdown>

- **[admission-controllers](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_component_control_plane_admission_controllers.html)**

  admission プラグインによるリクエストの検証と変更

</div>

<br>

### Ingress Controller 系

<div class="grid cards compact" markdown>

- **[Ingress Controller](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_ingress_controller.html)**

  Ingress を監視してルーティングする Ingress Controller

- **[AWS Load Balancer Controller](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_ingress_controller_alb.html)**

  AWS のロードバランサーと連携する Ingress Controller

  [リソース定義](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_ingress_controller_alb_resource_definition.html)

- **[Nginx Ingress Controller](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_ingress_controller_nginx.html)**

  Nginx を使用する Ingress Controller

  [リソース定義](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_ingress_controller_nginx_resource_definition.html)

</div>

<br>

### ︎ハードウェアリソース管理系

<div class="grid cards compact" markdown>

- **[addon-resizer](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_hardware_resource_management_addon_resizer.html)**

  コンテナのリソース要求量を動的に垂直スケーリング

- **[cluster-autoscaler](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_hardware_resource_management_cluster_autoscaler.html)**

  Node グループの Node 数を自動スケーリング

- **[descheduler](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_hardware_resource_management_descheduler.html)**

  不適切な Node から Pod を退避させるアドオン

- **[metrics-server](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_hardware_resource_management_metrics_server.html)**

  メトリクスの収集と kubectl top、Pod の自動スケーリング

- **[Karpenter](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_hardware_resource_management_karpenter.html)**

  Karpenter による Node の自動プロビジョニング

  [リソース定義](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_hardware_resource_management_karpenter_resource_definition.html)

</div>

<br>

### ネットワーク系

<div class="grid cards compact" markdown>

- **[CNI](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_network_cni.html)**

  CNI のオーバーレイ、ルーティング、アンダーレイモード

- **[Cilium](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_network_cilium.html)**

  Cilium の仕組みと Cilium サービスメッシュ

- **[ExternalDNS](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_network_external_dns.html)**

  Kubernetes リソースから DNS レコードを自動作成

</div>

<br>

### ストレージ系

<div class="grid cards compact" markdown>

- **[ストレージ CSI ドライバー](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_storage_csi_driver.html)**

  Pod にストレージをマウントする CSI ドライバー

</div>

<br>

### Secret 系

<div class="grid cards compact" markdown>

- **[Secrets ストア CSI ドライバー](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_secret_secrets_store_csi_driver.html)**

  外部のシークレットをボリュームとしてマウント

  [リソース定義](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_secret_secrets_store_csi_driver_resource_definition.html)

- **[External Secrets Operator](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_secret_external_secrets_oprator.html)**

  外部のシークレットを Secret として同期

</div>

<br>

### デバッグ系

<div class="grid cards compact" markdown>

- **[Telepresence](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_debug_telepresence.html)**

  Cluster 内の通信をローカル PC で確認するツール

</div>

<br>

### AWS 系

<div class="grid cards compact" markdown>

- **[Amazon EKS アドオン](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_cloud_provider_aws_eks.html)**

  CoreDNS や kube-proxy などの Amazon EKS アドオン

- **[Amazon VPC CNI](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_cloud_provider_aws_eks_vpc_cni.html)**

  Pod に VPC の IP アドレスを割り当てる CNI

- **[AWS EBS CSI ドライバー](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_cloud_provider_aws_eks_ebs_csi_driver.html)**

  AWS EBS を PersistentVolume として使用

- **[AWS OpenTelemetry Collector Operator](https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_addon_cloud_provider_aws_eks_open_telemetry_collector_operator.html)**

  OpenTelemetry Collector を管理する Operator

</div>

<br>
