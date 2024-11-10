---
title: 【IT技術の知見】Blackbox Exporter＠Prometheus
description: Blackbox Exporter＠Prometheus
---

# Blackbox Exporter＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Blackbox Exporterの仕組み

### アーキテクチャ

Blackbox Exporterは、外部システムに特定のプロトコル (例：HTTP、HTTPS、DNS、ICMP、SSH、SMTP) でヘルスチェックを実施する。

また、Prometheusにメトリクスを公開する。

![blackbox_exporter_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/blackbox_exporter_architecture.png)

> - https://medium.com/cloud-native-daily/blackbox-exporter-to-probe-or-not-to-probe-57a7a495534b
> - https://medium.com/@squadcast/prometheus-blackbox-exporter-a-guide-for-monitoring-external-systems-a8fff19a8bd0

<br>

### Prometheusによるメトリクス収集

![blackbox_exporter_prometheus_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/blackbox_exporter_prometheus_architecture.png)

> - https://devopscounsel.com/prometheus-blackbox-exporter-setup-on-kubernetes/

<br>

## 02. セットアップ

### チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/prometheus-blackbox-exporter -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-blackbox-exporter#install-chart

<br>

## 03. マニフェスト

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: blackbox-exporter
  namespace: prometheus
  labels:
    k8s-app: blackbox-exporter
data:
  blackbox.yaml: |
    modules:
      http_2xx:
        http:
          no_follow_redirects: true
          preferred_ip_protocol: ip4
          valid_http_versions:
          - HTTP/1.1
          - HTTP/2.0
          valid_status_codes: []
        prober: http
        timeout: 5s
```

> - https://devopscounsel.com/prometheus-blackbox-exporter-setup-on-kubernetes/

<br>

### Deployment配下のPod

外部システムに対してヘルスチェックを実施する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: blackbox-exporter
  namespace: prometheus
  labels:
    k8s-app: blackbox-exporter
spec:
  restartPolicy: Always
  containers:
    - name: blackbox-exporter
      image: "prom/blackbox-exporter"
      imagePullPolicy: IfNotPresent
      securityContext:
        readOnlyRootFilesystem: true
        runAsNonRoot: true
        runAsUser: 1000
      args:
        # 設定ファイルを読み込む
        - "--config.file=/config/blackbox.yaml"
      resources: {}
      ports:
        - containerPort: 9115
          name: http
      livenessProbe:
        httpGet:
          path: /health
          port: http
      readinessProbe:
        httpGet:
          path: /health
          port: http
      volumeMounts:
        - mountPath: /config
          name: config
  volumes:
    - name: config
      configMap:
        name: blackbox-exporter
```

> - https://devopscounsel.com/prometheus-blackbox-exporter-setup-on-kubernetes/

<br>

### Service

PrometheusがBlack ExporterのPodからメトリクスを収集するためServiceである。

```yaml
kind: Service
apiVersion: v1
metadata:
  name: blackbox-exporter
  namespace: prometheus
  labels:
    k8s-app: blackbox-exporter
spec:
  type: ClusterIP
  ports:
    - name: http
      port: 9115
      protocol: TCP
  selector:
    k8s-app: blackbox-exporter
```

> - https://devopscounsel.com/prometheus-blackbox-exporter-setup-on-kubernetes/

<br>

## 03. blackbox.yaml

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

外形監視でPing (ICMPエコーリクエスト) を送信する。

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
