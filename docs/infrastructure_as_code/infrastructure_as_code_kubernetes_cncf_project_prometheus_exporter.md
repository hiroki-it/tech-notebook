---
title: 【IT技術の知見】Exporter＠Prometheus
description: Exporter＠Prometheus
---

# Exporter＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Exporter

### Exporterとは

PrometheusがPull型通信でメトリクスのデータポイントを収集するためのエンドポイントとして動作する。

基本的にはデータポイントを収集したいNode内で稼働させるが、一部のExporter (例：外形監視のblack-exporter) は、Node外で稼働させる。

Pull型通信により、アプリケーションはPrometheusの存在を知る必要がなく、関心を分離できる。収集したいメトリクスに合わせて、ExporterをKubernetesのNodeに導入する必要がある。

また、各Exporterは待ち受けるエンドポイントやポート番号が異なっており、Prometheusが各Exporterにリクエストを送信できるように、各Nodeでエンドポイントやポート番号へのインバウンド通信を許可する必要がある。

> - https://openstandia.jp/oss_info/prometheus
> - https://danielfm.me/prometheus-for-developers/

<br>

### 確認

Nodeで稼働しているExporterを確認する。

```bash
$ ps -aux | grep exporter
```

<br>

### Exporterの種類

#### ▼ パターン

Exporterには、KubernetesのNode上でどう稼働させるかに応じて、配置パターンがある。

| タイプ                  | 配置方法                                         |
| ----------------------- | ------------------------------------------------ |
| DaemonSetパターン       | 各Node上にDaemonSetとして配置する。              |
| Deploymentパターン      | 各Node上にDeploymentとして配置する。             |
| Pod内サイドカーパターン | Pod内にサイドカーとして配置する。                |
| 埋め込み型パターン      | ライブラリとして、アプリケーション内に埋め込む。 |

> - https://atmarkit.itmedia.co.jp/ait/articles/2205/31/news011.html#072
> - https://prometheus.io/docs/instrumenting/exporters/
> - https://grafana.com/oss/prometheus/exporters/

#### ▼ DaemonSetパターン

| Exporter名                                                        | 説明                                                                                                                                                                                          | 待ち受けポート番号 | 待ち受けエンドポイント | メトリクス名     |
| :---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------- | ---------------- |
| [Node exporter](https://github.com/prometheus/node_exporter)      | Nodeに関するメトリクスのデータポイントを収集する。                                                                                                                                            | `9100`             | `/metrics`             | `node_*`         |
| [Process exporter](https://github.com/ncabatoff/process-exporter) | Nodeの非コンテナのプロセスに関するメトリクスのデータポイントを収集する。収集対象のプロセス名は`config.yaml`ファイルで設定できる。 <br>・https://qiita.com/kkentaro/items/c01b8cf332da893791bb | `9256`             | 同上                   | `namedprocess_*` |

#### ▼ Deploymentパターン

| Exporter名                                                                               | 説明                                                                                                                                                                                                                                                                                                                                                                           | 待ち受けポート番号 | 待ち受けエンドポイント | メトリクス名 |
| :--------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ---------------------- | ------------ |
| [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics)                   | Kubernetesのリソース単位でメトリクスのデータポイントを収集する。似た名前のツールにmetrics-serverがあるが、こちらはNodeとPodのみを対象としており、またapiserverとして稼働する。<br>・https://tech-blog.abeja.asia/entry/2016/12/20/202631 <br>・https://amateur-engineer-blog.com/kube-state-metrics-and-metrics-server/                                                        | `8080`             | 同上                   | `kube_*`     |
| [Blackbox exporter](https://github.com/prometheus/blackbox_exporter)                     | 指定したプロトコルで外形監視を実施する。外形監視のため、リクエストは一度Cluster外に出る。リクエストの成否以外にも、各種メトリクス (レスポンスタイム、HTTPステータス、など) を収集できる。<br>・https://handon.hatenablog.jp/entry/2019/01/29/005935 <br>・https://medium.com/@lambdaEranga/monitor-kubernets-services-endpoints-with-prometheus-blackbox-exporter-a64e062c05d5 | `9115`             | 同上                   |              |
| [Elasticsearch exporter](https://github.com/prometheus-community/elasticsearch_exporter) | ElasticSearchに関するメトリクスのデータポイントを収集する。                                                                                                                                                                                                                                                                                                                    | `9114`             | 同上                   |              |

#### ▼ Pod内サイドカーパターン

| Exporter名                                                                     | 説明                                                                                                                                        | 待ち受けポート番号 | 待ち受けエンドポイント | メトリクス名 |
| :----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------- | ------------ |
| [Nginx Vts exporter](https://github.com/hnlq715/nginx-vts-exporter)            | Nginxに関するメトリクスのデータポイントを収集する。                                                                                         | `9113`             | 同上                   |              |
| [Apache exporter](https://github.com/Lusitaniae/apache_exporter)               | Apacheに関するメトリクスのデータポイントを収集する。                                                                                        | `9117`             | 同上                   |              |
| [Mysqld exporter](https://github.com/prometheus/mysqld_exporter)               | MySQL/MariaDBに関するメトリクスのデータポイントを収集する。                                                                                 | `9104`             | 同上                   |              |
| [Postgres exporter](https://github.com/prometheus-community/postgres_exporter) | PostgreSQLに関するメトリクスのデータポイントを収集する。<br>・https://grafana.com/oss/prometheus/exporters/postgres-exporter/#metrics-usage | `9187`             | 同上                   |              |
| [Oracledb exporter](https://github.com/iamseth/oracledb_exporter)              | Oracleに関するメトリクスのデータポイントを収集する。                                                                                        | `9121`             | 同上                   |              |
| [Redis exporter](https://github.com/oliver006/redis_exporter)                  | Redisに関するメトリクスのデータポイントを収集する。                                                                                         | `9121`             | 同上                   |              |

### ▼ 埋め込み型パターン

| Exporter名          | 説明 | 待ち受けポート番号 | 待ち受けエンドポイント | メトリクス名 |
| :------------------ | ---- | ------------------ | ---------------------- | ------------ |
| open-telemetryのSDK |      |                    |                        |              |

<br>

### セットアップ

#### ▼ チャートとして

チャートリポジトリから複数のチャートを一括でインストールし、Kubernetesリソースを作成する。

kube-prometheus-stackは、いくつかのExporterをサブチャートとしてインストールしてくれる。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/kube-prometheus-stack -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack

<br>

## 02. Blackbox exporter

### セットアップ

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/prometheus-blackbox-exporter -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-blackbox-exporter#install-chart

<br>

### module

#### ▼ http

外形監視でHTTPリクエストを送信する。

```yaml
modules:
  <好きな名前>:
    prober: http
    http: ...
```

#### ▼ tcp

外形監視でTCPスリーウェイハンドシェイクを実行する。

```yaml
modules:
  <好きな名前>:
    prober: tcp
    tcp: ...
```

#### ▼ dns

外形監視でHTTPリクエストを送信する。

```yaml
modules:
  <好きな名前>:
    prober: dns
    dns: ...
```

#### ▼ icmp

外形監視でICMPリクエストを送信する。

```yaml
modules:
  <好きな名前>:
    prober: icmp
    http: ...
```

#### ▼ grpc

外形監視でgRPCによるHTTPリクエストを送信する。

```yaml
modules:
  <好きな名前>:
    prober: grpc
    http: ...
```

<br>

### http probe

#### ▼ GETリクエストの場合

外形監視でGETリクエストを送信する。

```yaml
modules:
  # GETの場合 (HTTPS)
  https_2xx_get:
    # HTTPプロトコルを使用する
    prober: http
    timeout: 5s
    # http probe
    http:
      # レスポンスの期待ステータスコード
      valid_http_versions:
        - HTTP/1.1
        - HTTP/2.0
      # 優先するIPアドレスの種類
      preferred_ip_protocol: ip4
      # IPV6が使えない場合に、IPv4に切り替える
      ip_protocol_fallback: "true"
      follow_redirects: "true"
    tcp:
      ip_protocol_fallback: "true"
    icmp:
      ip_protocol_fallback: "true"
    dns:
      ip_protocol_fallback: "true"
      recursion_desired: "true"

  # GETの場合 (HTTPS)
  http_2xx_get:
    # HTTPプロトコルを使用する
    prober: http
    timeout: 5s
    # http probe
    http:
      # レスポンスの期待ステータスコード
      valid_http_versions:
        - HTTP/1.1
      # 優先するIPアドレスの種類
      preferred_ip_protocol: ip4
      # IPV6が使えない場合に、IPv4に切り替える
      ip_protocol_fallback: "true"
      tls_config:
        # SSL証明書を任意にする
        insecure_skip_verify: "true"
```

> - https://github.com/prometheus/blackbox_exporter/blob/master/CONFIGURATION.md#http_probe
> - https://github.com/prometheus/blackbox_exporter/blob/master/example.yml

#### ▼ POSTリクエストの場合

外形監視にて、HTTPプロトコルでPOSTリクエストを送信する。

```yaml
modules:
  # POSTの場合
  http_2xx_post:
    # HTTPプロトコルを使用する
    prober: http
    timeout: 30s
    # http probe
    http:
      # レスポンスの期待ステータスコード
      valid_status_codes:
        - 200
      # IPV6が使えない場合に、IPv4に切り替える
      ip_protocol_fallback: "true"
      method: POST
      # リクエストヘッダー
      headers:
        # データ形式
        Accept: application/json
        # 入力フォームへのデータ送信に必要
        Content-Type: application/x-www-form-urlencode
      # メッセージボディ
      body: "{}"
      follow_redirects: "true"
    tcp:
      ip_protocol_fallback: "true"
    icmp:
      ip_protocol_fallback: "true"
    dns:
      ip_protocol_fallback: "true"
      recursion_desired: "true"
```

> - https://github.com/prometheus/blackbox_exporter/blob/master/CONFIGURATION.md#http_probe
> - https://abiydv.github.io/posts/prometheus-blackbox-monitor-post-api/#step-1---blackbox-exporter
> - https://github.com/prometheus/blackbox_exporter/blob/master/example.yml

<br>

## 03. kube-state-metrics

### セットアップ

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/kube-state-metrics -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-state-metrics

<br>

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
            # Nodeのラベルをメトリクスに付与する。
            # クラウドプロバイダーのNodeからNodeグループ名を含むラベル (例：eks.amazonaws.com/nodegroup) を取得する場合、設定する必要がある。            - --metric-labels-allowlist=nodes=[*]
            # Nodeのアノテーションをメトリクスに付与する。
            - --metric-annotations-allowlist=nodes=[*]
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

<br>

### メトリクスの一覧

#### ▼ 確認方法

Node exporterの場合は、Nodeの『`127.0.0.1:8001/api/v1/namespaces/kube-system/services/kube-state-metrics:http-metrics/proxy/metrics`』をコールすると、PromQLで使用できるメトリクスを取得できる。

```bash
$ curl http://127.0.0.1:8001/api/v1/namespaces/kube-system/services/kube-state-metrics:http-metrics/proxy/metrics

...

kube_node_info
kube_pod_info

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

## 04. MySQL exporter

### セットアップ

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/prometheus-mysql-exporter -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-mysql-exporter

<br>

### メトリクスの一覧

#### ▼ 確認方法

PostgreSQL exporterの場合は、Nodeの『`127.0.0.1:9104/metrics`』をコールすると、PromQLで使用できるメトリクスを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9104/metrics

...

postgres_exporter_build_info{branch="",goversion="go1.15.8",revision="",version="0.0.1"} 1

...
```

> - https://grafana.com/oss/prometheus/exporters/postgres-exporter/
> - https://grafana.com/oss/prometheus/exporters/postgres-exporter/assets/postgres_metrics_scrape.txt

<br>

## 05. Node exporter

### セットアップ

#### ▼ バイナリとして

バイナリファイルをインストールする。

```bash
# GitHubのバイナリファイルのリリースページから、テキストのURLを取得する。
# tmpディレクトリ配下にダウンロードする。
$ curl -L https://github.com/prometheus/node_exporter/releases/download/v1.0.0/node_exporter-1.0.0.linux-amd64.tar.gz -o /tmp/node_exporter-1.0.0.linux-amd64.tar.gz
$ tar -xvf /tmp/node_exporter-1.0.0.linux-amd64.tar.gz -C /tmp

# バイナリファイルだけを移動する。
$ mv /tmp/node_exporter/node_exporter-1.0.0.linux-amd64 /usr/local/bin/node_exporter
```

バイナリに直接的にパラメーターを渡せる。

```bash
$ /usr/local/bin/node_exporter --web.listen-address=":9100"
```

> - https://qiita.com/ezaqiita/items/c3cd9faa2fd52da5d7a6#node-exporter%E3%81%AE%E5%A0%B4%E5%90%88

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/prometheus-node-exporter -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-node-exporter

複数のExporterを一括してインストールする場合、例えばkube-prometheus-stackチャートがある。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/kube-prometheus-stack -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack

<br>

### メトリクスの一覧

#### ▼ 確認方法

Node exporterの場合は、Nodeの『`127.0.0.1:9100/metrics`』をコールすると、PromQLで使用できるメトリクスを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9100/metrics

...

node_exporter_build_info{branch="HEAD",goversion="go1.15.8",revision="4e837d4da79cc59ee3ed1471ba9a0d9547e95540",version="1.1.1"} 1

...
```

> - https://prometheus.io/docs/guides/node-exporter/#node-exporter-metrics
> - https://grafana.com/oss/prometheus/exporters/node-exporter/assets/node_exporter_sample_scrape.txt

<br>

### PromQLを使用したメトリクス分析

#### ▼ CPU使用率

NodeのCPU使用率を取得する。

```bash
rate(node_cpu_seconds_total[1m])
```

> - https://qiita.com/Esfahan/items/01833c1592910fb11858#cpu%E4%BD%BF%E7%94%A8%E7%8E%87

#### ▼ メモリ使用率

Nodeのメモリ使用率を取得する。

```bash
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes
```

> - https://qiita.com/Esfahan/items/01833c1592910fb11858#%E3%83%A1%E3%83%A2%E3%83%AA%E4%BD%BF%E7%94%A8%E7%8E%87

#### ▼ ディスク使用率

Nodeのディスク使用率を取得する。

```bash
100 - (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100
```

`mountpoint`ディメンションを使用して、マウントポイント別のディスク使用率を取得する。

```bash
100 - (node_filesystem_avail_bytes{mountpoint="/var/lib/data"} / node_filesystem_size_bytes{mountpoint="/var/lib/data"} ) * 100
```

`job`ディメンションを使用して、収集対象別にのディスク使用率を取得する。

```bash
100 - (node_filesystem_avail_bytes{job="foo-node"} / node_filesystem_size_bytes{job="foo-node"} ) * 100
```

> - https://qiita.com/Esfahan/items/01833c1592910fb11858#%E3%83%87%E3%82%A3%E3%82%B9%E3%82%AF%E5%AE%B9%E9%87%8F

#### ▼ ディスクのI/OによるCPU使用率

ディスクのI/OによるCPU使用率 (ディスクのI/OがNodeのCPUをどの程度使用しているか) を取得する。

`iostat`コマンドの`%util`指標と同じである。

```bash
rate(node_disk_io_time_seconds_total[1m])
```

> - https://brian-candler.medium.com/interpreting-prometheus-metrics-for-linux-disk-i-o-utilization-4db53dfedcfc
> - https://christina04.hatenablog.com/entry/prometheus-node-monitoring
> - https://www.qoosky.io/techs/42affa2c4b

#### ▼ ディスクのI/Oレスポンスタイム

```bash
# 読み出しレスポンスタイム
rate(node_disk_read_time_seconds_total[1m]) / rate(node_disk_reads_completed_total[1m])
```

```bash
# 書き込みレスポンスタイム
rate(node_disk_write_time_seconds_total[1m]) / rate(node_disk_writes_completed_total[1m])
```

> - https://christina04.hatenablog.com/entry/prometheus-node-monitoring

#### ▼ パケットの受信サイズ

Nodeのパケットの受信サイズを取得する。

```bash
node_network_receive_packets_total
```

これを使用して、DDOS攻撃のアラートを作成することもできる。

```bash
(rate(node_network_receive_packets_total[5m]) / rate(node_network_receive_packets_total[5m] offset 5m)) > 10
```

> - https://stackoverflow.com/questions/72947434/how-to-alert-anomalies-on-network-traffic-jump-with-prometheus

<br>

## 06. PostgreSQL exporter

### メトリクスの一覧

#### ▼ 確認方法

PostgreSQL exporterの場合は、Nodeの『`127.0.0.1:9187/metrics`』をコールすると、PromQLで使用できるメトリクスを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9187/metrics

...

mysqld_exporter_build_info{branch="HEAD",goversion="go1.12.7",revision="48667bf7c3b438b5e93b259f3d17b70a7c9aff96",version="0.12.1"} 1

...
```

> - https://grafana.com/oss/prometheus/exporters/mysql-exporter/
> - https://grafana.com/oss/prometheus/exporters/mysql-exporter/assets/mysql_metrics_scrape.txt

<br>

### PromQLを使用したメトリクス分析

#### ▼ PostgreSQLのプロセスのステータス

PostgreSQLのプロセスのステータスを表す。

`pg_up`は、PostgreSQLのプロセスのステータスを表す。

正常な場合に`1`、異常な場合に`0`となる。

```bash
pg_up == 0
```

> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/prometheuspostgresql_top10.html

#### ▼ PostgreSQLの連続稼働時間

`pg_postmaster_start_time_seconds`は、PostgreSQLのマスタープロセス (postmasterプロセス) の連続稼働時間を表す。

```bash
time() - pg_postmaster_start_time_seconds
```

> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/prometheuspostgresql_top10.html
> - https://www.oreilly.com/library/view/postgresql-9-administration/9781849519069/ch02s03.html
> - https://www.ashisuto.co.jp/db_blog/article/20151221_pg_monitoring.html

#### ▼ DBインスタンス間のデータ同期の遅延

PostgreSQLで、RepmgrによるDBクラスターを採用している場合に、DBインスタンス間のデータ同期の遅延を表す。

`pg_replication_lag`は、DBインスタンス間のデータ同期にかかる時間を表す。

```bash
pg_replication_lag > 10
```

> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/prometheuspostgresql_top10.html

#### ▼ 残骸タプルサイズ

DBにたまっている残骸タプルのデータサイズを表す。

```bash
pg_stat_user_tables_n_dead_tup{datname="<DB名>"}
```

> - https://www.adyen.com/blog/postgresql-hot-updates-part2

<br>

## 06. Process exporter

### セットアップ

#### ▼ バイナリとして

バイナリファイルをインストールする。

```bash
# GitHubのバイナリファイルのリリースページから、テキストのURLを取得する。
# tmpディレクトリ配下にダウンロードする。
$ curl -L https://github.com/ncabatoff/process-exporter/releases/download/v0.7.10/process-exporter-0.7.10.linux-amd64.tar.gz -o /tmp/process-exporter-0.7.10.linux-amd64.tar.gz

$ tar -xvf /tmp/process-exporter-0.7.10.linux-amd64.tar.gz -C /tmp
```

#### ▼ チャートとして

執筆時点 (2023/03/26) 時点で、Process exporterのチャートはない。

> - https://github.com/ncabatoff/process-exporter

<br>

### メトリクスの一覧

#### ▼ 確認方法

Process exporterの場合は、Nodeの『`127.0.0.1:9256/metrics`』をコールすると、PromQLで使用できるメトリクスを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9256/metrics

...

process_exporter_build_info{build_date="2021-03-11-03:26:58",commit_sha="d0597c841d2c9fa30ce8b6ded6251d1994822e27",golang_version="go1.16.1",version="v1.18.0"} 1

...
```

> - https://github.com/ncabatoff/process-exporter#exposing-metrics-through-https

<br>

## 07. Redis exporter

### メトリクスの一覧

#### ▼ 確認方法

Redis exporterの場合は、Nodeの『`127.0.0.1:9121/metrics`』をコールすると、PromQLで使用できるメトリクスを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9121/metrics

...

redis_exporter_build_info{build_date="2021-03-11-03:26:58",commit_sha="d0597c841d2c9fa30ce8b6ded6251d1994822e27",golang_version="go1.16.1",version="v1.18.0"} 1

...
```

> - https://grafana.com/oss/prometheus/exporters/redis-exporter/
> - https://grafana.com/oss/prometheus/exporters/redis-exporter/assets/sample_scrape.out.txt

<br>
