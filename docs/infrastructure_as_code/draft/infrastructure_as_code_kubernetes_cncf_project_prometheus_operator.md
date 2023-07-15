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

## 02. spec

現状、PrometheusOperatorという名前のカスタムリソースはない。

> - https://github.com/prometheus-operator/kube-prometheus/tree/main/manifests

<br>
