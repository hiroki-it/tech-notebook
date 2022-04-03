---
title: 【知見を記録するサイト】可観測性ツール＠Kubernetes
description: 可観測性ツール＠Kubernetesの知見をまとめました．
---

# 可観測性ツール＠Kubernetes

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. メトリクス系

### Prometheus

#### ▼ 仕組み

KubernetesやIstioに関するメトリクスの収集/分析/可視化を行う．

参考：https://prometheus.io/docs/introduction/overview/

![prometheus_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_architecture.png)

#### ▼ セットアップ

```bash
$ ISTIO_VERSION=1.12

$ kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-${ISTIO_VERSION}/samples/addons/prometheus.yaml
```

<br>

### Kiali

#### ▼ 仕組み

Prometheusで収集されたメトリクスを再収集し，Istioの可視化を拡張する．

参考：https://kiali.io/docs/architecture/architecture/

![kiali_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kiali_architecture.png)

#### ▼ セットアップ

```bash
$ ISTIO_VERSION=1.12

$ kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-${ISTIO_VERSION}/samples/addons/kiali.yaml
```



<br>

## 02. ログ系

### Grafana

#### ▼ 仕組み

#### ▼ セットアップ

```bash
$ ISTIO_VERSION=1.12

$ kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-${ISTIO_VERSION}/samples/addons/grafana.yaml
```

<br>

## 03. 分散トレース系

### Jaeger

#### ▼ 仕組み

KubernetesやIstioに関する分散トレースの収集/分析/可視化を行う．

参考：https://www.jaegertracing.io/docs/1.31/architecture/

![jaeger_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/jaeger_architecture.png)

#### ▼ セットアップ

```bash
$ ISTIO_VERSION=1.12

$ kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-${ISTIO_VERSION}/samples/addons/jaeger.yaml
```

<br>