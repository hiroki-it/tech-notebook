---
title: 【IT技術の知見】ConfigMap系＠Grafana
description: ConfigMap系＠Grafanaの知見を記録しています。
---

# ConfigMap系＠Grafana

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. grafana-datasource-cm

### grafana-datasource-cmとは

Grafanaの`datasource.yaml`ファイルを管理する。

<br>

### サイドカー (grafana-sc-datasources)

Grafanaのコンテナが起動する前に、データソースをセットアップする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: grafana-pod
  namespace: prometheus
spec:
  containers:
    # grafanaコンテナ
    - name: grafana
      image: grafana/grafana:8.0.0

      ...

    # サイドカー
    - name: grafana-sc-datasources
      image: quay.io/kiwigrid/k8s-sidecar:1.14.2

      ...

      env:
        - name: METHOD
          value: LIST
        - name: LABEL
          value: grafana_datasource
        - name: FOLDER
          value: /etc/grafana/provisioning/datasources
        - name: RESOURCE
          value: both
      volumeMounts:
        - mountPath: /etc/grafana/provisioning/datasources
          name: sc-datasources-volume
        - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
          name: kube-api-access-****
          readOnly: "true"
```

> - https://github.com/grafana/helm-charts/tree/main/charts/grafana#sidecar-for-datasources

<br>

### datasources

#### ▼ datasourcesとは

Grafanaのデータソースを設定する。

#### ▼ Prometheusの場合

Prometheusの場合、ビルトインのプラグインを使用できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  datasource.yaml: |
    apiVersion: 1
    datasources:
      - name: prometheus
        type: prometheus
        url: http://<PrometheusのService名>.<PrometheusのNamespace名>:9090/
        access: proxy
        # デフォルトのデータソースとするか否かを設定する
        isDefault: "true"
        jsonData:
          timeInterval: 30s
```

> - https://grafana.com/grafana/plugins/prometheus/
> - https://grafana.com/docs/grafana/latest/datasources/prometheus/#configure-the-data-source

#### ▼ VictoriaMetricsの場合

VictoriaMetricsの場合、ビルトインの`prometheus`タイプを使用できる。

VictoriaMetricsからメトリクスのデータポイントを収集するために、PromQLを実行する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  datasource.yaml: |
    apiVersion: 1
    datasources:
      - name: victoria-metrics
        type: prometheus
        url: http://<VictoriaMetricsのサーバーのIPアドレス>:8248/
        access: proxy
        isDefault: "false"
        jsonData:
          timeInterval: 30s
```

> - https://grafana.com/docs/grafana/latest/datasources/prometheus/#configure-the-data-source

#### ▼ CloudWatchの場合

CloudWatchの場合、`cloudwatch`タイプを指定する。

CloudWatch-APIからメトリクスのデータポイントを収集するために、独自のクエリを実行する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  datasource.yaml: |
    apiVersion: 1
    datasources:
      - name: CloudWatch
        type: cloudwatch
        jsonData:
          authType: default
          defaultRegion: ap-northeast-1
```

> - https://grafana.com/docs/grafana/latest/datasources/aws-cloudwatch/#provision-the-data-source
> - https://grafana.com/docs/grafana/latest/datasources/aws-cloudwatch/query-editor/#common-query-editor-fields

<br>

## 02. grafana-ini-cm

Grafanaの`grafana.ini`ファイルを管理する。

> - https://github.com/grafana/grafana/blob/main/conf/defaults.ini
> - https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#configuration-file-location
> - https://www.server-world.info/query?os=CentOS_Stream_9&p=grafana

<br>

## 02-02. grafana.ini

### auth.anonymousセクション

ユーザー名とパスワード無しでログインできるようにする。

`login_cookie_name`もデフォルト (`grafana_session`) 以外に変更する必要がある。

anonymousユーザーは、デフォルトで`Viewer`ロールを持つ。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [auth]
    login_cookie_name = anonymous_session
    [auth.anonymous]
    enabled = true
    org_role = Viewer
```

> - https://github.com/grafana/grafana/blob/v10.1.0/conf/defaults.ini#L565-L578
> - https://github.com/grafana/grafana/issues/10727#issuecomment-832617680

<br>

### pathsセクション

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [paths]
    ...
```

> - https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#paths

<br>

### serverセクション

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [server]
    ...
```

> - https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#server

<br>

### dashboardセクション

#### ▼ min_refresh_interval

ダッシュボードのPromQLの自動更新間隔の最小値を設定する。

自動更新間隔のデフォルト値が変わるわけではないことに注意する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [dashboard]
    min_refresh_interval = 5s
    default_home_dashboard_path = /var/lib/grafana/dashboards/local/home.json
```

> - https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#min_refresh_interval

<br>

### databaseセクション

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [database]
    ...
```

> - https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#database

<br>

### remote_cacheセクション

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [remote_cache]
    ...
```

> - https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#remote_cache

<br>

### date_formatsセクション

#### ▼ date_formatsセクション

時間に関して設定する。

#### ▼ default_timezone

タイムゾーンを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [date_formats]
    default_timezone = Asia/Tokyo
```

<br>

### usersセクション

#### ▼ usersセクション

記入中...

#### ▼ default_theme

ダッシュボードのデフォルトのテーマを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [users]
    default_theme = light
```

#### ▼ home_page

Grafanaのダッシュボードのホームを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [users]
    # foo.grafana.com/dashboards がホームになる。
    home_page = dashboards
```

<br>

## 02-03. download_dashboard.sh

### download_dashboard.shとは

リモートからダッシュボードをダウンロードするスクリプトを定義する。

必ず`dashboardproviders.yaml`ファイルも合わせて必要である。

URLの指定の方法として、以下がある。

- GitHubのRawファイルのURL (`https://raw.githubusercontent.com/example/foo.json`)
- GrafanaのコミュニティーのAPI (`https://grafana.com/api/dashboards/<ID>/revisions/<リビジョン番号>/download`)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-grafana
  namespace: prometheus
data:
  download_dashboard.sh: |
    #!/usr/bin/env sh
    set -euf

    curl -skf \
      --connect-timeout 60 \
      --max-time 60 \
      -H "Accept: application/json" \
      -H "Content-Type: application/json;charset=UTF-8" \
      "https://raw.githubusercontent.com/example/foo.json" \
      > "/var/lib/grafana/dashboards/remote/foo.json"
  # 必ずdashboardproviders.yamlファイルが必要である
  dashboardproviders.yaml: |
    apiVersion: 1
    providers:
      - name: local
        options:
          path: /var/lib/grafana/dashboards/local
      - name: remote
        options:
          path: /var/lib/grafana/dashboards/remote
```

> - https://github.com/grafana/helm-charts/issues/127#issuecomment-776311048

<br>

### InitContainer (download-dashboards)

Grafanaの起動時に、リモートからダッシュボードをダウンロードする。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-grafana
  namespace: prometheus
spec:
  replicas: 1
  template:
    metadata:
    spec:
      - containers:
          - name: grafana
            image: "docker.io/grafana/grafana:10.0.3"
          - name: grafana-sc-dashboard
            image: "quay.io/kiwigrid/k8s-sidecar:1.24.6"
          - name: grafana-sc-datasources
            image: "quay.io/kiwigrid/k8s-sidecar:1.24.6"
        initContainers:
          - name: download-dashboards
            image: "docker.io/curlimages/curl:7.85.0"
            imagePullPolicy: IfNotPresent
            command: ["/bin/sh"]
            # ダウンロードスクリプトを実行する
            args:
              [
                "-c",
                "mkdir -p /var/lib/grafana/dashboards/remote && /bin/sh -x /etc/grafana/download_dashboards.sh",
              ]
            volumeMounts:
              # ダウンロードスクリプトをマウントする
              - name: config
                mountPath: "/etc/grafana/download_dashboards.sh"
                subPath: download_dashboards.sh
              - name: storage
                mountPath: "/var/lib/grafana"
        volumes:
          - name: config
            configMap:
              name: foo-grafana-ini-cm
          - name: foo-dashboards
            configMap:
              name: foo-dashboards
```

<br>

## 02-04. dashboardproviders.yaml

ダッシュボードの共通定義をプロバイダーとして設定する。

ローカルやリモートにあるダッシュボードのJSONを動的に読み込んでダッシュボードを作成する場合に必要になる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-grafana
  namespace: prometheus
data:
  dashboardproviders.yaml: |
    apiVersion: 1
    providers:
      - name: local
        options:
          path: /var/lib/grafana/dashboards/local
      - name: remote
        options:
          path: /var/lib/grafana/dashboards/remote
```

> - https://grafana.com/tutorials/provision-dashboards-and-data-sources/#provision-a-dashboard
> - https://github.com/grafana/helm-charts/issues/127#issuecomment-776311048

<br>

## 03. grafana-provider-cm

### grafana-provider-cmとは

Grafanaの`provider.yaml`ファイルを管理する。

ダッシュボードのフォルダを定義できる。

> - https://github.com/ezienecker/grafana-sidecar-folder-sample/tree/master

<br>

### providers

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  provider.yaml: |
    apiVersion: 1
    providers:
      - name: 'sidecarProvider'
        orgId: 1
        folder: ''
        type: file
        disableDeletion: "false"
        allowUiUpdates: "false"
        updateIntervalSeconds: 30
        options:
          foldersFromFilesStructure: "false"
          path: /tmp/dashboards
```

<br>

## 04. grafana-dashboard-cm

### grafana-dashboard-cmとは

Grafanaの`dashboard.json`ファイルを管理する。

ファイルサイズが大きくなってしまうため、一つのConfigMapで一つの`dashboard.json`ファイルを管理する方が良い。

これをGrafanaのコンテナにマウントする。

<br>

### サイドカー (grafana-sc-dashboard)

Kubernetesの通常の仕組みであれば、ConfigMapの数だけVolumeMountでマウントする必要がある。

これに関して、ダッシュボードのConfigMapの数だけVolumeMountを実行してくれるサイドカーが開発されている。

なお、ダッシュボードが増えるほどConfigMapのVolumeMountが必要になるため、Podで必要なストレージの容量が増えていく。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: grafana-pod
  namespace: prometheus
spec:
  containers:
    # grafanaコンテナ
    - name: grafana
      image: grafana/grafana:8.0.0

      ...

    # サイドカー
    - name: grafana-sc-dashboard
      image: quay.io/kiwigrid/k8s-sidecar:1.14.2

      ...


      env:
          - name: METHOD
            value: WATCH
          - name: LABEL
            value: grafana_dashboard
          # ダッシュボードのJSONファイルを配置するgrafanaコンテナのディレクトリ
          - name: FOLDER
            value: /tmp/dashboards
          - name: RESOURCE
            value: both
          # サイドカーがConfigMapを検知するNamespace
          - name: NAMESPACE
            value: ALL
      volumeMounts:
        - mountPath: /tmp/dashboards
          name: sc-dashboard-volume
        - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
          name: kube-api-access-*****
          readOnly: "true"
```

サイドカーがConfigMapを検知できるように、`metadata.labels`キーにデフォルトで`grafana_dashboard: "1"`を設定する必要がある。

言い方を変えれば、`grafana_dashboard: "1"キーを持つConfigMapのみをダッシュボードの設定として読み込ませられる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-dashboard
  namespace: prometheus
  labels:
    grafana_dashboard: "1"
data:
  foo.json: |-
    {{ `
    ダッシュボードのJSON
    ` }}
```

> - https://www.grugrut.net/posts/202008032123/
> - https://github.com/grafana/helm-charts/tree/main/charts/grafana#sidecar-for-dashboards

<br>

### セットアップ

#### ▼ grafanaチャートの場合

grafanaチャートでは、`values`ファイルの`dashboards.label`キーや`dashboards.labelValue`キーを使用して、サイドカーが検知するConfigMapを設定できる。

```yaml
# valuesファイル
  dashboards:

    ...

    # サイドカー検知用の.metadata.labelsキー
    label: grafana_dashboard
    # .metadata.labelsキーの値
    labelValue: null

    ...

  datasources:

    ...

    label: grafana_datasource
    labelValue: null
```

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-grafana-dashboard
  labels:
    grafana_dashboard: "<labelValueに設定した値>"
data:
  foo.json: |-
    {{ `
    ダッシュボードのJSON
    ` }}
```

> - https://github.com/grafana/helm-charts/blob/main/charts/grafana/values.yaml

#### ▼ kube-prometheus-stackチャートの場合

kube-prometheus-stackチャートでは、prometheusのチャートの他、grafanaチャートなどに依存している。

kube-prometheus-stackチャートの`values`ファイルでは、サイドカー用の`grafana_dashboard`キーに`1`が割り当てられている。

```yaml
# valuesファイル

  sidecar:
    dashboards:

      ...

      # サイドカー検知用の.metadata.labelsキー
      label: grafana_dashboard
      # .metadata.labelsキーの値
      labelValue: "1"

      ...

    datasources:

      ...

      label: grafana_datasource
      labelValue: "1"
```

> - https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/values.yaml

そのため、kube-prometheus-stackチャートを用いる場合は`grafana_dashboard`キーの値が`1`のConfigMapのみがダッシュボードの設定として読み込まれる。

マニフェストから作成したダッシュボードは、GUIからは削除できないようになっている。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-grafana-dashboard
  namespace: prometheus
  labels:
    grafana_dashboard: "1"
data:
  foo.json: |-
    {{ `
    ダッシュボードのJSON
    ` }}
```

> - https://rancher.com/docs/rancher/v2.6/en/monitoring-alerting/guides/persist-grafana/

補足として、kube-prometheus-stackチャートではダッシュボードのConfigMapはすでに用意されている。

またその他に、kubernetes-mixinsも同時にインストールするようになっている。

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14
> - https://monitoring.mixins.dev

<br>
