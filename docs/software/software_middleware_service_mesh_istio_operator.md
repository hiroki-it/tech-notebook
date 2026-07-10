---
title: 【IT技術の知見】IstioOperator＠Istio
description: IstioOperator＠Istioの知見を記録しています。
---

# IstioOperator＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. IstioOperatorとは

Istio のコンポーネント (Istiod コントロールプレーン、Istio Ingress Gateway、Istio Egress Gateway など) を管理する。

IstioOperator は執筆時点 (2025/03/06) で非推奨であり、代わりに istioctl や Helm でコンポーネントを管理することが推奨である。

もし、IstioOperator と同じようなツールを使用したい場合、SailOperator を使用するとよい。

![istio_istio-operator](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_istio-operator.png)

> - https://tetrate.io/blog/what-is-istio-operator/
> - https://github.com/istio-ecosystem/sail-operator/blob/main/docs/README.md#migrating-from-istio-in-cluster-operator

<br>

## 02. 他の管理方法への移行

### Helm管理への移行

#### ▼ B/Gデプロイメント

IstioOperator + Istiod + Istio Ingress Gateway から、Istiod + Istio Ingress Gateway に B/G デプロイメントのように移行する。

1. 既存の IstioOperator を残したまま上記のチャート (istio-base、istiod、gateway) デプロイする。新旧でリソース名が同じだと衝突するかもないので、もし衝突したら名前を調整する。
2. 新しい LoadBalancer Service 由来の NLB やチャート由来の istio-ingressgateway を経由して、データプレーンのマイクロサービスにリクエストを送信できることを確認する
3. 古い LoadBalancer Service 由来の NLB と IstoOperator 由来の istio-ingressgateway への経路は遮断されていることを確認する。
4. IstoOperator を削除すると、IstioOperator の管理するリソース (旧 Istiod、旧 istio-ingressgateway、LoadBalancer Service) は削除される。ただ、チャートで同等のリソース (名前は異なる) を作成しており、IstioOperator の管理下のリソースはすでに使用していないので問題ない

#### ▼ ラベル置き換え

IstioOperator が管理対象を判定するラベルを削除する。

> - https://tech.gunosy.io/entry/migrate_from_istio_operator_to_helm

<br>
