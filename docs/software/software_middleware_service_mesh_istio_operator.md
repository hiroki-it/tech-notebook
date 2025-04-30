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

Istioのコンポーネント (Istiodコントロールプレーン、Istio Ingress Gateway、Istio Egress Gatewayなど) を管理する。

IstioOperatorは執筆時点 (2025/03/06) で非推奨であり、代わりにistioctlやHelmでコンポーネントを管理することが推奨である。

![istio_istio-operator](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_istio-operator.png)

> - https://tetrate.io/blog/what-is-istio-operator/

<br>

## 02. 他の管理方法への移行

### Helm管理への移行

#### ▼ B/Gデプロイメント

IstioOperator + Istiod + Istio Ingress Gatewayから、Istiod + Istio Ingress GatewayにB/Gデプロイメントのように移行する。

1. 既存のIstioOperatorを残したまま上記のチャート (istio-base、istiod、gateway) デプロイする。新旧でリソース名が同じだと衝突するかもないので、もし衝突したら名前を調整する。
2. 新しいLoadBalancer Service由来のNLBやチャート由来のistio-ingressgatewayを経由して、データプレーンのマイクロサービスにリクエストを送信できることを確認する
3. 古いLoadBalancer Service由来のNLBとIstoOperator由来のistio-ingressgatewayへの経路は遮断されていることを確認する。
4. IstoOperatorを削除すると、IstioOperatorの管理するリソース (旧Istiod、旧istio-ingressgateway、LoadBalancer Service) は削除される。ただ、チャートで同等のリソース (名前は異なる) を作成しており、IstioOperatorの管理下のリソースはすでに使用していないので問題ない

#### ▼ ラベル置き換え

IstioOperatorが管理対象を判定するラベルを削除する。

> - https://tech.gunosy.io/entry/migrate_from_istio_operator_to_helm

<br>
