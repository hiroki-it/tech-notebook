---
title: 【IT技術の知見】PrometheusOperator＠Prometheus
description: PrometheusOperator＠Prometheusの知見を記録しています。
---

# PrometheusOperator＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. PrometheusOperatorの仕組み

### アーキテクチャ

PrometheusOperatorは、Prometheus、Alertmanager、Expoter (Node exporter、kube-state-metrics) 、Grafana、といったコンポーネントから構成されている。

> - https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

<br>

### セットアップ

PrometheusOperatorは、Prometheus系の全てのカスタムリソースを要求するので、これを作成する必要がある。

**＊例＊**

kube-prometheus-stackが提供するCRDを使用する。

```bash
$ kubectl diff -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-alertmanagerconfigs.yaml"
$ kubectl diff -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-alertmanagers.yaml"
$ kubectl diff -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-podmonitors.yaml"
$ kubectl diff -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-probes.yaml"
$ kubectl diff -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-prometheusagents.yaml"
$ kubectl diff -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-prometheuses.yaml"
$ kubectl diff -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-prometheusrules.yaml"
$ kubectl diff -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-scrapeconfigs.yaml"
$ kubectl diff -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-servicemonitors.yaml"
$ kubectl diff -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-thanosrulers.yaml"

$ kubectl apply --server-side -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-alertmanagerconfigs.yaml"
$ kubectl apply --server-side -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-alertmanagers.yaml"
$ kubectl apply --server-side -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-podmonitors.yaml"
$ kubectl apply --server-side -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-probes.yaml"
$ kubectl apply --server-side -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-prometheusagents.yaml"
$ kubectl apply --server-side -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-prometheuses.yaml"
$ kubectl apply --server-side -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-prometheusrules.yaml"
$ kubectl apply --server-side -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-scrapeconfigs.yaml"
$ kubectl apply --server-side -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-servicemonitors.yaml"
$ kubectl apply --server-side -f "https://raw.githubusercontent.com/prometheus-community/helm-charts/kube-prometheus-stack-<バージョン>/charts/kube-prometheus-stack/charts/crds/crds/crd-thanosrulers.yaml"
```

<br>

## 02. spec

現状、PrometheusOperatorという名前のカスタムリソースはない。

> - https://github.com/prometheus-operator/kube-prometheus/tree/main/manifests

<br>
