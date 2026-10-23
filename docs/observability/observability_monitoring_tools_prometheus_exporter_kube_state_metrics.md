---
title: 【IT技術の知見】kube-state-metrics＠Prometheus
description: kube-state-metrics＠Prometheus
---

# kube-state-metrics＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. kube-state-metrics の仕組み

記入中

...

<br>

## 02. セットアップ

### チャートとして

チャートリポジトリからチャートをインストールし、Kubernetes リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/kube-state-metrics -n prometheus --version <バージョンタグ>
```

> - [helm-charts/charts/kube-state-metrics at main · prometheus-community/helm-charts · GitHub](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-state-metrics)

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
      hostNetwork: false
      serviceAccountName: kube-state-metrics
      securityContext:
        fsGroup: 65534
        runAsGroup: 65534
        runAsNonRoot: true
        runAsUser: 65534
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: kube-state-metrics
          args:
            - --port=8080
            - --resources=certificatesigningrequests,configmaps,cronjobs,daemonsets,deployments,endpoints,horizontalpodautoscalers,ingresses,jobs,leases,limitranges,mutatingwebhookconfigurations,namespaces,networkpolicies,nodes,persistentvolumeclaims,persistentvolumes,poddisruptionbudgets,pods,replicasets,replicationcontrollers,resourcequotas,secrets,services,statefulsets,storageclasses,validatingwebhookconfigurations,volumeattachments
            # 必要な Kubernetes リソースのラベルをメトリクスに付与する。
            # kube_node_labels、kube_deployment_labels、kube_pod_labels、で取得できる
            # 例えば、クラウドプロバイダーの Node から Node グループ名を含むラベル (例：eks.amazonaws.com/nodegroup) を取得する場合、設定する必要がある。
            - --metric-labels-allowlist=nodes=[*],deployments=[*],pods=[*]
            # 必要な Kubernetes リソースのアノテーションをメトリクスに付与する。
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
> - [kube-state-metrics/docs/developer/cli-arguments.md at main · kubernetes/kube-state-metrics · GitHub](https://github.com/kubernetes/kube-state-metrics/blob/main/docs/developer/cli-arguments.md#available-options)
> - [pod_labels does not exists in kube_pod_labels metric · Issue #1501 · kubernetes/kube-state-metrics · GitHub](https://github.com/kubernetes/kube-state-metrics/issues/1501#issuecomment-991076751)

<br>

### メトリクスの一覧

#### ▼ 確認方法

Node Exporter の場合は、Node の『`127.0.0.1:8001/api/v1/namespaces/kube-system/services/kube-state-metrics:http-metrics/proxy/metrics`』をコールすると、PromQL で使用できるメトリクスの元になるデータポイントを取得できる。

```bash
$ curl http://127.0.0.1:8001/api/v1/namespaces/kube-system/services/kube-state-metrics:http-metrics/proxy/metrics

...

kube_node_info
kube_pod_info
kube_service_info

...
```

> - [kube-state-metrics/docs at main · kubernetes/kube-state-metrics · GitHub](https://github.com/kubernetes/kube-state-metrics/tree/main/docs#exposed-metrics)
> - [【Kubernetes】Metrics Serverとkube-state-metrics](https://amateur-engineer-blog.com/kube-state-metrics-and-metrics-server/)

#### ▼ よく使用するメトリクス

<table>
  <thead>
    <tr>
      <th>メトリクス</th>
      <th>メトリクスの種類</th>
      <th>説明</th>
      <th>PromQL 例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>kube_node_status_condition</code></td>
      <td>記入中...</td>
      <td>Node の現在のライフサイクルフェーズを表す。</td>
      <td><code>kube_node_status_condition{job=&quot;kube-state-metrics&quot;,condition=&quot;Ready&quot;,status=&quot;true&quot;}</code></td>
    </tr>
    <tr>
      <td><code>kube_pod_status_phase</code></td>
      <td>記入中...</td>
      <td>Pod の現在ライフサイクルフェーズを表す。</td>
      <td><code>kube_pod_status_phase{job=&quot;kube-state-metrics&quot;,phase=&quot;Succeeded&quot;}</code></td>
    </tr>
    <tr>
      <td><code>kube_pod_container_status_terminated</code></td>
      <td>Count</td>
      <td><code>Terminated</code> フェーズになったコンテナ数を表す。</td>
      <td><code>kube_pod_container_status_terminated{job=&quot;kube-state-metrics&quot;}</code></td>
    </tr>
    <tr>
      <td><code>kube_pod_container_resource_limits</code></td>
      <td>Count</td>
      <td>Pod のハードウェアリソースの <code>.spec.containers[*].resources.limits</code> キーを表す。設定していなければ <code>null</code> になる。</td>
      <td><code>kube_pod_container_resource_limits{job=&quot;kube-state-metrics&quot;}</code></td>
    </tr>
    <tr>
      <td><code>kube_deployment_spec_replicas</code></td>
      <td>Count</td>
      <td>Deployment で指定している Pod のレプリカ数を表す。</td>
      <td><code>kube_deployment_spec_replicas{job=&quot;kube-state-metrics&quot;,deployment=&quot;foo-deployment&quot;,namespace=&quot;foo&quot;}</code></td>
    </tr>
    <tr>
      <td><code>kube_deployment_status_replicas</code></td>
      <td>Count</td>
      <td>Deployment で指定している Pod のレプリカ数のうち、現在実行されている Pod 数を表す。</td>
      <td><code>kube_deployment_status_replicas{job=&quot;kube-state-metrics&quot;,deployment=&quot;foo-deployment&quot;,namespace=&quot;foo&quot;}</code></td>
    </tr>
    <tr>
      <td><code>kube_deployment_status_replicas_available</code></td>
      <td>Count</td>
      <td>Deployment で指定している Pod のレプリカ数のうち、現在利用できる Pod 数を表す。</td>
      <td><code>kube_deployment_status_replicas_available{job=&quot;kube-state-metrics&quot;,deployment=&quot;foo-deployment&quot;,namespace=&quot;foo&quot;}</code></td>
    </tr>
    <tr>
      <td><code>kube_deployment_status_replicas_unavailable</code></td>
      <td>Count</td>
      <td>Deployment で指定している Pod のレプリカ数のうち、現在利用できない Pod 数を表す。</td>
      <td><code>kube_deployment_status_replicas_unavailable{job=&quot;kube-state-metrics&quot;,deployment=&quot;foo-deployment&quot;,namespace=&quot;foo&quot;}</code></td>
    </tr>
    <tr>
      <td><code>kube_daemonset_status_desired_number_scheduled</code></td>
      <td>Count</td>
      <td>DaemonSet で指定している Pod のレプリカ数を表す。</td>
      <td><code>kube_daemonset_status_desired_number_scheduled{job=&quot;kube-state-metrics&quot;,deployment=&quot;foo-deployment&quot;,namespace=&quot;foo&quot;}</code></td>
    </tr>
    <tr>
      <td><code>kube_daemonset_status_current_number_scheduled</code></td>
      <td>Count</td>
      <td>DaemonSet で指定している Pod のレプリカ数のうち、現在実行されている Pod 数を表す。</td>
      <td><code>kube_daemonset_status_current_number_scheduled{job=&quot;kube-state-metrics&quot;,deployment=&quot;foo-deployment&quot;,namespace=&quot;foo&quot;}</code></td>
    </tr>
    <tr>
      <td><code>kube_daemonset_status_number_available</code></td>
      <td>Count</td>
      <td>DaemonSet で指定している Pod のレプリカ数のうち、現在利用できる Pod 数を表す。</td>
      <td><code>kube_daemonset_status_number_available{job=&quot;kube-state-metrics&quot;,deployment=&quot;foo-deployment&quot;,namespace=&quot;foo&quot;}</code></td>
    </tr>
    <tr>
      <td><code>kube_daemonset_status_number_unavailable</code></td>
      <td>Count</td>
      <td>DaemonSet で指定している Pod のレプリカ数のうち、現在利用できない Pod 数を表す。</td>
      <td><code>kube_daemonset_status_number_unavailable{job=&quot;kube-state-metrics&quot;,deployment=&quot;foo-deployment&quot;,namespace=&quot;foo&quot;}</code></td>
    </tr>
  </tbody>
</table>

> - [kube-state-metrics/docs at main · kubernetes/kube-state-metrics · GitHub](https://github.com/kubernetes/kube-state-metrics/tree/main/docs)
> - [Kubernetes モニタリング用メトリクスまとめ](https://zenn.dev/sasakiki/articles/f47e4b2ea08bd1)

<br>
