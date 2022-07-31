---
title: 【IT技術の知見】PrometheusOperator＠Prometheus
description: PrometheusOperator＠Prometheusの知見を記録しています。
---

# PrometheusOperator＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### チャートリポジトリから

#### ▼ kube-prometheus-stackチャートリポジトリから

kube-prometheus-stackチャートをリリースする。このチャート内にPrometheusOperatorが含まれている。

ℹ️ 参考：

- https://prometheus-operator.dev/docs/operator/api/
- https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/
- https://zaki-hmkc.hatenablog.com/entry/2020/10/16/003542

```bash
$ helm install <リリース名> prometheus-community/kube-prometheus-stack
```

<br>

