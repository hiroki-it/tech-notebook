---
title: 【IT技術の知見】kube-state-metrics＠Prometheus
description: kube-state-metrics＠Prometheus
---

# kube-state-metrics＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. kube-state-metricsの仕組み

記入中

...

<br>

## 02. セットアップ

### チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/kube-state-metrics -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-state-metrics

<br>

## 03. マニフェスト

### マニフェストの種類

#### ▼ Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kube-state-metrics
  namespace: prometheus
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: kube-state-metrics
  replicas: 1
  template:
    spec:
      hostNetwork: "false"
      serviceAccountName: kube-state-metrics
      securityContext:
        fsGroup: 65534
        runAsGroup: 65534
        runAsNonRoot: "true"
        runAsUser: 65534
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: kube-state-metrics
          args:
            - --port=8080
            - --resources=certificatesigningrequests,configmaps,cronjobs,daemonsets,deployments,endpoints,horizontalpodautoscalers,ingresses,jobs,leases,limitranges,mutatingwebhookconfigurations,namespaces,networkpolicies,nodes,persistentvolumeclaims,persistentvolumes,poddisruptionbudgets,pods,replicasets,replicationcontrollers,resourcequotas,secrets,services,statefulsets,storageclasses,validatingwebhookconfigurations,volumeattachments
            # 必要なKubernetesリソースのラベルをメトリクスに付与する。
            # kube_node_labels、kube_deployment_labels、kube_pod_labels、で取得できる
            # 例えば、クラウドプロバイダーのNodeからNodeグループ名を含むラベル (例：eks.amazonaws.com/nodegroup) を取得する場合、設定する必要がある。
            - --metric-labels-allowlist=nodes=[*],deployments=[*],pods=[*]
            # 必要なKubernetesリソースのアノテーションをメトリクスに付与する。
            - --metric-annotations-allowlist=nodes=[*],deployments=[*],pods=[*]
          imagePullPolicy: IfNotPresent
          image: registry.k8s.io/kube-state-metrics/kube-state-metrics:v2.9.2
          ports:
            - containerPort: 8080
              name: "http"
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            timeoutSeconds: 5
          readinessProbe:
            httpGet:
              path: /
              port: 8080
            initialDelaySeconds: 5
            timeoutSeconds: 5
          securityContext:
            allowPrivilegeEscalation: "false"
            capabilities:
              drop:
                - ALL
```

> - https://www.densify.com/docs/WebHelp_Densify_Cloud/Content/Data_Collection_for_Public_Cloud_Systems/Container_Data_Collection_Prerequisites.htm
> - https://github.com/kubernetes/kube-state-metrics/blob/main/docs/developer/cli-arguments.md#available-options
> - https://github.com/kubernetes/kube-state-metrics/issues/1501#issuecomment-991076751

<br>

### メトリクスの一覧

#### ▼ 確認方法

Node Exporterの場合は、Nodeの『`127.0.0.1:8001/api/v1/namespaces/kube-system/services/kube-state-metrics:http-metrics/proxy/metrics`』をコールすると、PromQLで使用できるメトリクスを取得できる。

```bash
$ curl http://127.0.0.1:8001/api/v1/namespaces/kube-system/services/kube-state-metrics:http-metrics/proxy/metrics

...

kube_node_info
kube_pod_info
kube_service_info

...
```

> - https://github.com/kubernetes/kube-state-metrics/tree/main/docs#exposed-metrics
> - https://amateur-engineer-blog.com/kube-state-metrics-and-metrics-server/

#### ▼ よく使用するメトリクス

| メトリクス                                       | メトリクスの種類 | 説明                                                                                                          | PromQL例                                                                                                               |
| ------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `kube_node_status_condition`                     | 記入中...        | Nodeの現在のライフサイクルフェーズを表す。                                                                    | `kube_node_status_condition{job="kube-state-metrics",condition="Ready",status="true"}`                                 |
| `kube_pod_status_phase`                          | 記入中...        | Podの現在ライフサイクルフェーズを表す。                                                                       | `kube_pod_status_phase{job="kube-state-metrics",phase="Succeeded"}`                                                    |
| `kube_pod_container_status_terminated`           | Count            | `Terminated`フェーズになったコンテナ数を表す。                                                                | `kube_pod_container_status_terminated{job="kube-state-metrics"}`                                                       |
| `kube_pod_container_resource_limits`             | Count            | Podのハードウェアリソースの`.spec.containers[*].resources.limits`キーを表す。設定していなければ`null`になる。 | `kube_pod_container_resource_limits{job="kube-state-metrics"}`                                                         |
| `kube_deployment_spec_replicas`                  | Count            | Deploymentで指定しているPodのレプリカ数を表す。                                                               | `kube_deployment_spec_replicas{job="kube-state-metrics",deployment="foo-deployment",namespace="foo"}`                  |
| `kube_deployment_status_replicas`                | Count            | Deploymentで指定しているPodのレプリカ数のうち、現在実行されているPod数を表す。                                | `kube_deployment_status_replicas{job="kube-state-metrics",deployment="foo-deployment",namespace="foo"}`                |
| `kube_deployment_status_replicas_available`      | Count            | Deploymentで指定しているPodのレプリカ数のうち、現在利用できるPod数を表す。                                    | `kube_deployment_status_replicas_available{job="kube-state-metrics",deployment="foo-deployment",namespace="foo"}`      |
| `kube_deployment_status_replicas_unavailable`    | Count            | Deploymentで指定しているPodのレプリカ数のうち、現在利用できないPod数を表す。                                  | `kube_deployment_status_replicas_unavailable{job="kube-state-metrics",deployment="foo-deployment",namespace="foo"}`    |
| `kube_daemonset_status_desired_number_scheduled` | Count            | DaemonSetで指定しているPodのレプリカ数を表す。                                                                | `kube_daemonset_status_desired_number_scheduled{job="kube-state-metrics",deployment="foo-deployment",namespace="foo"}` |
| `kube_daemonset_status_current_number_scheduled` | Count            | DaemonSetで指定しているPodのレプリカ数のうち、現在実行されているPod数を表す。                                 | `kube_daemonset_status_current_number_scheduled{job="kube-state-metrics",deployment="foo-deployment",namespace="foo"}` |
| `kube_daemonset_status_number_available`         | Count            | DaemonSetで指定しているPodのレプリカ数のうち、現在利用できるPod数を表す。                                     | `kube_daemonset_status_number_available{job="kube-state-metrics",deployment="foo-deployment",namespace="foo"}`         |
| `kube_daemonset_status_number_unavailable`       | Count            | DaemonSetで指定しているPodのレプリカ数のうち、現在利用できないPod数を表す。                                   | `kube_daemonset_status_number_unavailable{job="kube-state-metrics",deployment="foo-deployment",namespace="foo"}`       |

> - https://github.com/kubernetes/kube-state-metrics/tree/main/docs
> - https://zenn.dev/sasakiki/articles/f47e4b2ea08bd1

<br>
