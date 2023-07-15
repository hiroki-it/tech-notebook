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

### ### grafana-datasource-cm用のInitContainer

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

  # InitContainer
  initContainers:
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
          readOnly: true
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
        isDefault: true
        jsonData:
          timeInterval: 30s
```

> - https://grafana.com/grafana/plugins/prometheus/
> - https://grafana.com/docs/grafana/latest/datasources/prometheus/#configure-the-data-source

#### ▼ VictoriaMetricsの場合

VictoriaMetricsの場合、ビルトインの`prometheus`タイプを使用できる。

VictoriaMetricsからメトリクスを収集するために、PromQLを実行する必要がある。

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
        isDefault: false
        jsonData:
          timeInterval: 30s
```

> - https://grafana.com/docs/grafana/latest/datasources/prometheus/#configure-the-data-source

#### ▼ CloudWatchの場合

CloudWatchの場合、`cloudwatch`タイプを指定する。

CloudWatch-APIからメトリクスを収集するために、独自のクエリを実行する必要がある。

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

### grafana-ini-cmとは

Grafanaの`grafana.ini`ファイルを管理する。

> - https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#configuration-file-location
> - https://www.server-world.info/query?os=CentOS_Stream_9&p=grafana

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
    default_home_dashboard_path = /tmp/dashboards/home.json
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
        disableDeletion: false
        allowUiUpdates: false
        updateIntervalSeconds: 30
        options:
          foldersFromFilesStructure: false
          path: /tmp/dashboards
```

<br>

## 04. grafana-dashboard-cm

### grafana-dashboard-cmとは

Grafanaの`dashboard.json`ファイルを管理する。

ファイルサイズが大きくなってしまうため、一つのConfigMapで一つの`dashboard.json`ファイルを管理する方が良い。

これをGrafanaのコンテナにマウントする。

<br>

### grafana-dashboard-cm用のサイドカー

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
          readOnly: true
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

## 04-02. セクション

### セクション一覧

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model

<br>

### id

```yaml
{"id": null}
```

<br>

### uid

```yaml
{"uid": "cLV5GDCkz"}
```

<br>

### title

```yaml
{"title": "New dashboard"}
```

<br>

### tags

他の何らかのチャート (例：kube-prometheus-stack) を使用した場合に、ダッシュボードが作成されることがある。

これと区別できるように、本リポジトリのダッシュボードには`<リポジトリ名>.git`というタグをつけると良い。

```yaml
{"tags": ["<リポジトリ名>.git"]}
```

<br>

### style

```yaml
{"style": "dark"}
```

<br>

### description

ダッシュボード名とそのバージョンを設定する。

コミュニティダッシュボードによってはバージョンの記載がないものがある。

```yaml
{"description": "Foo Dashboard version 1.0.0"}
```

<br>

### gnetId

コミュニティダッシュボードを使用している場合、ダッシュボードIDを設定する。

反対に、nullであればユーザー定義のダッシュボードである。

```yaml
{"gnetId": 1}
```

<br>

### timezone

```yaml
{"timezone": "browser"}
```

<br>

### editable

ダッシュボードをGUIから編集可能かを設定する。

```yaml
{"editable": false}
```

<br>

### graphTooltip

```yaml
{"graphTooltip": 1}
```

<br>

### panels

#### ▼ panelsとは

メトリクスをPromQLでクエリして表示するパネルを定義する。

一番最初にGUIでパネルを作成し、これのJSONを取得する方が実装しやすい。

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/#panels

#### ▼ expr

PromQLを定義する。

複数のラベルをOR条件で表示するようなパネルの場合、GrafanaがPromQL上にOR条件の正規表現を生成する。

そのため、`=~`演算子を使用するようにする。

ラベル変数を使用する場合は、`templating`セクションでその定義が必要である。

```yaml
{
  "panels":
    [
      {
        "targets":
          [
            {
              "expr": '<メトリクス名>{cluster="$cluster", namespace="$namespace", pod="$pod", instance=~"$instance"}',
            },
            {"expr": "..."},
            {"expr": "..."},
          ],
      },
    ],
}
```

#### type

パネルのタイプを設定する。

<br>

### time

```yaml
{"time": {"from": "now-6h", "to": "now"}}
```

<br>

### timepicker

ダッシュボードのデフォルトの時間間隔を設定する。

```yaml
{"timepicker": {"time_options": [], "refresh_intervals": []}}
```

<br>

### templating

#### ▼ templating

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/#templating

#### ▼ enable

templatingセクションを有効化する。

デフォルトで`true`である。

```yaml
{"templating": {"enable": true}}
```

#### ▼ list

PromQLのラベル変数に値を挿入し、メトリクスをフィルタリングできるように、プルダウンを定義する。

ラベル変数でフィルタリングする場合、指定したデータソースでクエリした時のメトリクスがそのラベルを持っている必要がある。

例えば、`kube_pod_info`メトリクスをラベル参照のために使用する場合、これがプルダウンのラベルを持っていなければならない。

加えて、ダッシュボード上のパネルのメトリクスもプルダウンのラベルでフィルタリングできるように、PromQLを定義する必要がある。

例えば、`cluster`ラベル値でフィルタリングする場合、パネル上のPromQLでも`<メトリクス>{cluster=\"$cluster\"}`と定義しなければならない。

```yaml
{"templating": {
      # listセクション
      "list": [
          # データソース値のフィルタリング
          {
            # デフォルトのフィルタリング値
            # プルダウンの値を変更すれば、current値も動的に変わる
            "current": {
                # 固定できるように true としておく
                "selected": true,
                # デフォルトのデータソースのフィルタリング値をPrometheusとする
                "text": "Prometheus",
                "value": "Prometheus",
              },
            "description": null,
            "error": null,
            # プルダウンを常に表示できるように 0 (false) とする
            "hide": 0,
            # multiオプションを無効化しているため、Allのチェックボックスは無効化する
            "includeAll": false,
            "label": null,
            "multi": false,
            # データソース名。変数名としても使用できるようになる。
            "name": "datasource",
            "options": [],
            # 最初のデータソースはPrometheusとする。
            "query": "prometheus",
            "refresh": 1,
            "regex": "",
            "skipUrlSync": false,
            # 変数タイプを設定する。
            "type": "datasource",
          },
          # clusterラベル値のフィルタリング
          {
            "allValue": null,
            # プルダウンが選ばれていない時のデフォルト値を設定する
            "current": {
                # デフォルトのclusterラベルのフィルタリング値を null とする
                "isNone": true,
                # ラベルが選ばれない限り表示されないため、 false としておく
                "selected": false,
                "text": "None",
                "value": "",
              },
            # データソースの指定時に、それを変数として取得する
            "datasource": "$datasource",
            "definition": "",
            "description": null,
            "error": null,
            "hide": 0,
            # multiオプションを無効化しているため、Allのチェックボックスは無効化する
            "includeAll": false,
            "label": null,
            # clusterは1つだけ選ぶようにする
            "multi": false,
            # ラベル名。変数名としても使用できるようになる。
            "name": "cluster",
            "options": [],
            "query": {
                # メトリクスと、それから取得するラベルを設定する。
                # 指定したデータソースの時に、kube_pod_infoメトリクスがclusterラベルを持っている必要がある。
                "query": "label_values(kube_pod_info, cluster)",
                # query<小文字から始まる任意の識別子>で事前定義しておくこともできる。
                # queryを採用する場合、query以降の文字列は、"^[a-z][a-zA-Z0-9_]*$"の正規表現内の文字列にする必要がある。
                "refId": "Prometheus-cluster-Variable-Query",
              },
            "refresh": 2,
            "regex": "",
            "skipUrlSync": false,
            # アルファベットの昇順にする。
            "sort": 1,
            "tagValuesQuery": "",
            "tagsQuery": "",
            "type": "query",
            "useTags": false,
          },
          # namespaceラベル値のフィルタリング
          {
            "allValue": null,
            # プルダウンが選ばれていない時のデフォルト値を設定する
            "current": {
                # デフォルトでは全てのラベル値を選択する
                # multiラベルの場合は、配列とする
                "selected": true,
                "text": ["All"],
                "value": ["$__all"],
              },
            # データソースの指定時に、それを変数として取得する
            "datasource": "$datasource",
            "definition": "",
            "description": null,
            "error": null,
            "hide": 0,
            # multiオプションを無効化しているため、Allのチェックボックスは無効化する
            "includeAll": false,
            "label": null,
            # 全ての値の中から複数選択して選べるようにする。
            "multi": true,
            "name": "namespace",
            "options": [],
            "query": {
                # 指定したデータソースの時に、kube_pod_infoメトリクスが各種ラベルを持っている必要がある。
                "query": 'label_values(kube_pod_info{cluster="$cluster"}, namespace)',
                "refId": "Prometheus-namespace-Variable-Query",
              },
            "refresh": 2,
            "regex": "",
            "skipUrlSync": false,
            "sort": 1,
            "tagValuesQuery": "",
            "tagsQuery": "",
            "type": "query",
            "useTags": false,
          },
          # podラベル値のフィルタリング
          {
            "allValue": null,
            # プルダウンが選ばれていない時のデフォルト値を設定する
            "current": {
                # デフォルトでは全てのラベル値を選択する
                # multiラベルの場合は、配列とする
                "selected": true,
                "text": ["All"],
                "value": ["$__all"],
              },
            # データソースの指定時に、それを変数として取得する
            "datasource": "$datasource",
            "definition": "",
            "description": null,
            "error": null,
            "hide": 0,
            # multiオプションを無効化しているため、Allのチェックボックスは無効化する
            "includeAll": false,
            "label": null,
            # 全ての値の中から複数のラベル値を選択して選べるようにする。
            "multi": true,
            "name": "pod",
            "options": [],
            "query": {
                # 指定したデータソースの時に、kube_pod_infoメトリクスが各種ラベルを持っている必要がある。
                "query": 'label_values(kube_pod_info{cluster="$cluster", namespace="$namespace"}, pod)',
                "refId": "Prometheus-pod-Variable-Query",
              },
            "refresh": 2,
            "regex": "",
            "skipUrlSync": false,
            "sort": 1,
            "tagValuesQuery": "",
            "tagsQuery": "",
            "type": "query",
            "useTags": false,
          },
          # nodeラベル値のフィルタリング
          {
            "allValue": null,
            # プルダウンが選ばれていない時のデフォルト値を設定する
            "current": {
                # デフォルトでは全てのラベルを表示する
                # multiラベルの場合は、配列とする
                "selected": true,
                "text": ["All"],
                "value": ["$__all"],
              },
            # データソースの指定時に、それを変数として取得する
            "datasource": "$datasource",
            "definition": "",
            "description": null,
            "error": null,
            "hide": 0,
            # multiオプションを無効化しているため、Allのチェックボックスは無効化する
            "includeAll": false,
            "label": null,
            # 全ての値の中から複数のラベル値を選択して選べるようにする。
            "multi": true,
            "name": "namespace",
            "options": [],
            "query": {
                # 指定したデータソースの時に、kube_pod_infoメトリクスが各種ラベルを持っている必要がある。
                "query": 'label_values(kube_pod_info{cluster="$cluster", namespace="$namespace", pod="$pod"}, node)',
                "refId": "Prometheus-node-Variable-Query",
              },
            "refresh": 2,
            "regex": "",
            "skipUrlSync": false,
            "sort": 1,
            "tagValuesQuery": "",
            "tagsQuery": "",
            "type": "query",
            "useTags": false,
          },
          # containerラベル値のフィルタリング
          {
            "allValue": null,
            # プルダウンが選ばれていない時のデフォルト値を設定する
            "current": {
                # デフォルトでは全てのラベルを表示する
                # multiラベルの場合は、配列とする
                "selected": true,
                "text": ["All"],
                "value": ["$__all"],
              },
            # データソースの指定時に、それを変数として取得する
            "datasource": "$datasource",
            "definition": "",
            "description": null,
            "error": null,
            "hide": 0,
            # multiオプションを無効化しているため、Allのチェックボックスは無効化する
            "includeAll": false,
            "label": null,
            # 全ての値の中から複数のラベル値を選択して選べるようにする。
            "multi": true,
            "name": "container",
            "options": [],
            "query": {
                # 指定したデータソースの時に、kube_pod_infoメトリクスが各種ラベルを持っている必要がある。
                "query": 'label_values(kube_pod_container_info{cluster=\"$cluster\",pod=~\"$pod\"}, container)',
                "refId": "Prometheus-container-Variable-Query",
              },
            "refresh": 2,
            "regex": "",
            "skipUrlSync": false,
            "sort": 1,
            "tagValuesQuery": "",
            "tagsQuery": "",
            "type": "query",
            "useTags": false,
          },
        ],
    }}
```

> - https://github.com/prometheus-operator/kube-prometheus/discussions/603?sort=top
> - https://stackoverflow.com/questions/64889312/is-there-a-way-to-get-the-cluster-name-of-kubernetes-in-grafana-variables-with-p
> - https://qiita.com/prodigy413/items/c0c2304e1bc28f644526

その上で`panel`セクションで`cluser`ラベルを定義すると、 メトリクスを`cluster`ラベルでフィルタリングできるようになる。

```yaml
{
  "panels": [
    {
      "targets":
        [
          {
            "expr": "sum(rate(sidecar_injection_success_total{cluster=\"$cluster\"}[1m]))"
          }
        ]
    }
  ]
}
}
```

<br>

### annotations

```yaml
{"annotations": {"list": []}}
```

<br>

### refresh

自動更新間隔を設定する。

```yaml
{"refresh": "5s"}
```

<br>

### schemaVersion

```yaml
{"schemaVersion": 17}
```

<br>

### version

```yaml
{"version": 0}
```

<br>

### links

```yaml
{"links": []}
```

<br>

## 04-03. ユーザー定義のダッシュボード

### ユーザー定義のダッシュボードとは

ConfigMapの`.data`キーにJSONを設定すると、ダッシュボードを作成できる。

ConfigMapで作成したダッシュボードは、デフォルトでGrafanaのGUIから変更できないようになっている。

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

> - https://grafana.com/grafana/dashboards/

<br>

### 管理方法

ユーザー定義のダッシュボードを専用のディレクトリで管理する。

```yaml
.
├── Chart.yaml
├── README.md
├── templates
│   ├── custom-dashboards
│   │   ├── slo-1.json
│   │   └── slo-2.json
│   │
```

<br>

### エスケープ

Goのテンプレートでは、『`{{`』と『`}}`』の記号がロジックで使用される。

ダッシュボードのJSONではこれを使用するため、ロジックとして認識されないようにエスケープする必要がある。

エスケープの方法は数種があるが、一番簡単な方法を採用する。

記号を含む文字ごと`` {{ `<記号を含む文字列全体>` }} ``のように挟み、エスケープする。

多くの場合にこの方法で対処できるが、文字列内にバックスラッシュがある場合は対処できない。

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

> - https://stackoverflow.com/a/38941123

### HelmテンプレートによるConfigMap作成

ダッシュボードはJSONファイルとして管理し、これをConfigMapのテンプレートに出力するようにすると、管理しやすい。

ただ出力時にHelm起因のエラーが多発するため、自分はこれを不採用とした。

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14
> - https://stackoverflow.com/questions/64662568/how-can-i-use-a-json-file-in-my-configmap-yaml-helm

<br>

### ホームダッシュボード

ホームダッシュボードとして、ダッシュボードの一覧を表示すると、検索する手間が省ける。

```ini
# grafana.iniファイル
[dashboard]
# Grafanaコンテナでホームダッシュボードのあるパス
default_home_dashboard_path = /tmp/dashboards/home.json
```

```json
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": "-- Grafana --",
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "gnetId": null,
  "graphTooltip": 0,
  "id": null,
  "links": [],
  "panels": [
    {
      "datasource": null,
      "gridPos": {
        "h": 36,
        "w": 24,
        "x": 0,
        "y": 0
      },
      "id": 3,
      "links": [],
      "options": {
        "folderId": 0,
        "maxItems": 100,
        "query": "",
        "showHeadings": true,
        "showRecentlyViewed": false,
        "showSearch": true,
        "showStarred": false,
        "tags": []
      },
      "pluginVersion": "8.0.0",
      "tags": [],
      "title": "Dashboards",
      "type": "dashlist"
    }
  ],
  "refresh": "",
  "schemaVersion": 30,
  "style": "dark",
  "tags": ["<リポジトリ名>.git"],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-6h",
    "to": "now"
  },
  "timepicker": {
    "hidden": true,
    "refresh_intervals": [
      "5s",
      "10s",
      "30s",
      "1m",
      "5m",
      "15m",
      "30m",
      "1h",
      "2h",
      "1d"
    ],
    "time_options": ["5m", "15m", "1h", "6h", "12h", "24h", "2d", "7d", "30d"],
    "type": "timepicker"
  },
  "timezone": "browser",
  "title": "Home",
  "uid": null,
  "version": 0
}
```

> - https://grafana.com/blog/2022/06/06/grafana-dashboards-a-complete-guide-to-all-the-different-types-you-can-build/?pg=webinar-getting-started-with-grafana-dashboard-design-amer&plcmt=related-content-1#the-home-dashboards

<br>

## 04-04. コミュニティダッシュボード

### コミュニティダッシュボードとは

ユーザー定義のダッシュボードを自前で定義しても良いが、セットアップの簡単さやPrometheusのアップグレードへの追従しやすさの観点から、公開されたダッシュボード (例：kubernetes-mixins、Grafanaダッシュボードコミュニティ) を使用した方が良い。

その場合、GitHubなどで公開されているJSONを、ConfigMapの`.data`キーに貼り付ける。

ConfigMapで作成したダッシュボードは、デフォルトでGrafanaのGUIから変更できないようになっている。

<br>

### 管理方法

コミュニティダッシュボードを専用のディレクトリで管理する。

ツールのいずれのバージョンに対応するダッシュボードなのかを、ケバブケースでファイル名に記載すると管理しやすい。

**＊実装例＊**

Istio関連のコミュニティダッシュボードを使用する場合は、以下の通りとする。

```yaml
.
├── Chart.yaml
├── README.md
├── templates
│   ├── community-dashboards
│   │   ├── istio-control-plane-1-15-3.json
│   │   ├── istio-mesh-1-15-3.json
│   │   ├── istio-performance-1-15-3.json
│   │   ├── istio-service-1-15-3.json
│   │   └── istio-workload-1-15-3.json
│   │
```

> - https://monitoring.mixins.dev
> - https://grafana.com/grafana/dashboards/

<br>

### エスケープ

注意点として、ユーザー定義のダッシュボードと同様にして、記号をエスケープする必要がある。

<br>

### コミュニティダッシュボードの採用

#### 【１】ダッシュボードの検索

コミュニティダッシュボードのJSONは、[Grafana Labs](https://grafana.com/grafana/dashboards/) からダウンロードできる。

コミュニティダッシュボードのIDはJSONの`gnetId`セクションから確認でき、ダッシュボードをアップグレードする場合は、IDから該当のものを探すようにする。

反対に、`gnetId`セクションが`null`になっているものは、ユーザー定義のダッシュボードである。

```yaml
{"gnetId": 1}
```

また、コミュニティダッシュボードのバージョンは、`description`セクションから確認できる (コミュニティダッシュボードによってはバージョンの記載がないものがある)。

```yaml
{"description": "Foo Dashboard version 1.0.0"}
```

#### 【２】ダッシュボードのバージョンの選択

ダッシュボードの`__requires`セクションで、PrometheusとGrafanaの最低バージョンを確認する。

Kubernetesで稼働するPrometheusとGrafanaのバージョンに応じたダッシュボードを選ぶ。

他には、ツールとダッシュボードの両方のバージョンが対応関係にある場合がある (例：Istioとダッシュボードの両方のバージョンは対応する)。

ただし、Prometheusの方のバージョンは気にしなくて良さそう (よくあるPrometheusの`5.0.0`なんてバージョンは存在しない)。

```yaml
{
  "__requires": [
    {
      "type": "grafana",
      "id": "grafana",
      "name": "Grafana",
      "version": "<最低バージョン>"
    },

    ...

    {
      "type": "datasource",
      "id": "prometheus",
      "name": "Prometheus",
      "version": "<最低バージョン>"
    },

    ...

  ]
}
```

#### 【３】整形

[任意のサイト](https://r37r0m0d3l.github.io/json_sort/) で、アルファベット順かつスペース`2`個で整形する。

これは、運用方針による。

#### 【４】貼り付け

ConfigMapのJSONファイルのデータとして貼り付ける。

エスケープするのを忘れない。

なお、後々アップグレードしていくことになるため、運用が複雑にならないように、コミュニティダッシュボードはいじらない方が良い。

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

<br>

### コミュニティダッシュボードの共通仕様

#### ▼ USEメトリクス

『`USE`』という名前を含むコミュニティダッシュボードがある。

ダッシュボードは、USEメトリクス (例：CPU使用率、CPUサチュレーション、など) を表示できる。

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/#use-method
> - https://grafana.com/blog/2022/06/06/grafana-dashboards-a-complete-guide-to-all-the-different-types-you-can-build/?pg=webinar-getting-started-with-grafana-dashboard-design-amer&plcmt=related-content-1#usereds-dashboards

#### ▼ REDメトリクス

『`RED`』という名前を含むコミュニティダッシュボードがある。

ダッシュボードは、REDメトリクスを表示できる。

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/#red-method
> - https://grafana.com/blog/2022/06/06/grafana-dashboards-a-complete-guide-to-all-the-different-types-you-can-build/?pg=webinar-getting-started-with-grafana-dashboard-design-amer&plcmt=related-content-1#usereds-dashboards

<br>

### kubernetes-mixinsのGrafanaダッシュボード

#### ▼ Alertmanager

| ダッシュボード名          | 監視対象          | 説明 |
| ------------------------- | ----------------- | ---- |
| `Alertmanager / Overview` | AlertmanagerのPod |      |

#### ▼ CoreDNS

| ダッシュボード名 | 監視対象     | 説明                                                                                               |
| ---------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `CoreDNS`        | CoreDNSのPod | CoreDNSのPodに対するリクエストに関するメトリクス (例：リクエスト数、レスポンスタイム) を取得する。 |

#### ▼ Kubernetesコンポーネント

| ダッシュボード名                                         | 監視対象                | 説明                                                                                                                                                                                                                                |
| -------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Kubernetes / API server`                                | kube-apiserver          | kube-apiserverのSLI、エラーバジェット、ハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率) を取得する。                                                                                                      |
| `Kubernetes / Networking / Cluster`                      | 任意のCluster           | Clusterのネットワークのパフォーマンス指標に関するメトリクス (例：帯域幅、秒当たりパケット受信数) を取得する。                                                                                                                       |
| `Kubernetes / Controller Manager`                        | kube-controller-manager |                                                                                                                                                                                                                                     |
| `Kubernetes / Compute Resources / Cluster`               | 任意のCluster           | Clusterのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。                                                                                                             |
| `Kubernetes / Compute Resources / Namespace (Pods)`      | 任意のPod               | Namespace単位で、Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。同じNamespace複数のPod (削除されたPodも含む) のメトリクスを一括して確認したい場合に便利である。 |
| `Kubernetes / Compute Resources / Node (Pods)`           | 任意のPod               | Node単位で、Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。同じNodeの複数のPod (削除されたPodも含む) のメトリクスを一括して確認したい場合に便利である。         |
| `Kubernetes / Compute Resources / Pod`                   | 任意のPod               | 各Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。個別のPodや特定のPodの状況を確認したい場合に便利である。                                                       |
| `Kubernetes / Compute Resources / Workload`              | 任意のPod               | ワークロード (例：Deployment) 単位で、Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。                                                                           |
| `Kubernetes / Compute Resources / Namespace (Workloads)` | 任意のPod               | ワークロード (例：Deployment) 単位かつNamespace単位で、Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。                                                          |
| `Kubernetes / Kubelet`                                   | kubelet                 |                                                                                                                                                                                                                                     |
| `Kubernetes / Networking / Namespace (Pods)`             | 任意のPod               | Namespace単位で、Podのネットワークに関するメトリクスを取得する。複数のPod (削除されたPodも含む) のメトリクスを一括して確認したい場合に便利である。                                                                                  |
| `Kubernetes / Networking / Namespace (Workload)`         | 任意のPod               | ワークロード (例：Deployment) 単位で、Podのネットワークに関するメトリクスを取得する。                                                                                                                                               |
| `Kubernetes / Persistent Volumes`                        | 任意のPod               | Persistent Volumeの使用率に関するメトリクスを取得する。                                                                                                                                                                             |
| `Kubernetes / Networking / Pod`                          | 任意のPod               | 各Podのネットワークに関するメトリクスを取得する。Podを個別に確認したい場合に便利である。                                                                                                                                            |
| `Kubernetes / Proxy`                                     | kube-proxy              |                                                                                                                                                                                                                                     |
| `Kubernetes / Scheduler`                                 | kube-scheduler          |                                                                                                                                                                                                                                     |
| `Kubernetes / Networking / Workload`                     | kube-scheduler          |                                                                                                                                                                                                                                     |

#### ▼ Node exporter

| ダッシュボード名                       | 監視対象           | 説明 |
| -------------------------------------- | ------------------ | ---- |
| `Node Exporter / USE Method / Cluster` | Node exporterのPod |      |
| `Node Exporter / USE Method / Node`    | Node exporterのPod |      |
| `Node Exporter / Nodes`                | Node exporterのPod |      |

#### ▼ Prometheus

| ダッシュボード名            | 監視対象        | 説明 |
| --------------------------- | --------------- | ---- |
| `Prometheus / Remote Write` | PrometheusのPod |      |
| `Prometheus / Overview`     | PrometheusのPod |      |

> - https://github.com/monitoring-mixins/website/tree/master/assets

#### ▼ Istioダッシュボード

`istioctl dashboard grafana`コマンドでインストールできるダッシュボード。

| ダッシュボード名                 | 監視対象                              | 説明                                                                          |
| -------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| `Istio Wasm Extension Dashboard` |                                       |                                                                               |
| `Istio Mesh Dashboard`           |                                       | HTTPとTCPのメトリクスを確認したい場合に便利である。                           |
| `Istio Control Plane Dashboard`  | IstiodのPod                           |                                                                               |
| `Istio Performance Dashboard`    | IngressGateway、`istio-proxy`コンテナ |                                                                               |
| `Istio Workload Dashboard`       | Istioの任意のカスタムリソース         |                                                                               |
| `Istio Service Dashboard`        | IstioのVirtualService                 | IngressGatewayの宛先のServiceに関するメトリクスを確認したい場合に便利である。 |

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-dashboard-grafana
> - https://github.com/istio/istio/tree/master/manifests/addons/dashboards
> - https://istio.io/latest/docs/tasks/observability/metrics/using-istio-dashboard/#viewing-the-istio-dashboard
> - https://istio.io/latest/docs/tasks/observability/metrics/using-istio-dashboard/#about-the-grafana-dashboards

<br>
