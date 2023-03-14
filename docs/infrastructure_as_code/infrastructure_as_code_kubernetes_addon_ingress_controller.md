---
title: 【IT技術の知見】Ingressコントローラー＠ワーカーNodeのアドオン
description: Ingressコントローラー＠ワーカーNodeのアドオンの知見を記録しています。
---

# Ingressコントローラー＠アドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Ingressコントローラー

### Ingressコントローラーとは

Ingressコントローラーは、Ingressの設定に基づいてNode外からのインバウンド通信を受信し、単一/複数のIngressにルーティングする。

Kubernetesの周辺ツール (Prometheus、AlertManager、Grafana、ArgoCD) のダッシュボードを複数人で共有して参照する場合には、何らかのアクセス制限を付与したIngressを作成することになる。

![kubernetes_ingress-controller](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_ingress-controller.png)

> ↪️ 参考：
>
> - https://developers.freee.co.jp/entry/kubernetes-ingress-controller
> - https://www.containiq.com/post/kubernetes-ingress
> - https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/

<br>

### SSL証明書の割り当て

Ingressコントローラーは、Secretに設定されたSSL証明書を参照し、これをロードバランサー (例：Nginx) に渡す。

![kubernetes_ingress-controller_certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_ingress-controller_certificate.png)

> ↪️ 参考：
>
> - https://blog.sakamo.dev/post/ingress-nginx/
> - https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/https/

<br>

### Ingressの設定値のバリデーション

Ingressコントローラーは、『`***-controller-admission`』というServiceでwebhookサーバーを公開している。

このwebhookサーバーは、新しく追加されたIngressの設定値のバリデーションを実行する。

これにより、不正なIngressが稼働することを防止できる。

このwebhookサーバーの登録時、まず『`***-create`』というJob配下のPodが、有効期限の長いSSL証明書を持つSecretを作成する。

その後、『`***-patch`』というJob配下のPodが、ValidatingWebhookConfigurationにこのSSL証明書を設定し、webhookサーバーにSSL証明書が割り当てられる。

> ↪️ 参考：
>
> - https://kubernetes.github.io/ingress-nginx/how-it-works/#avoiding-outage-from-wrong-configuration
> - https://github.com/kubernetes/ingress-nginx/tree/main/charts/ingress-nginx#ingress-admission-webhooks
> - https://blog.sakamo.dev/post/ingress-nginx/

<br>

## 02. 外部Ingressコントローラー

### 外部Ingressコントローラーの種類

Ingressコントローラーや、それに相当するもの (AWS Load Balancerコントローラー、Istio Ingressコントローラー) が必要である。

| コントローラー名                                              | Ingressの実体        | 開発環境 | 本番環境 |
| ------------------------------------------------------------- | -------------------- | :------: | :------: |
| Nginx Ingressコントローラー                                   | Nginx                |    ✅    |    ✅    |
| minikubeのingressアドオン (実体はNginx Ingressコントローラー) | Nginx                |    ✅    |          |
| AWS Load Balancerコントローラー                               | AWS ALB              |          |    ✅    |
| GCP CLBコントローラー                                         | GCP CLB              |          |    ✅    |
| Istio Ingressコントローラー                                   | Istio IngressGateway |    ✅    |    ✅    |
| ...                                                           | ...                  |   ...    |   ...    |

> ↪️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/
> - https://www.nginx.com/blog/how-do-i-choose-api-gateway-vs-ingress-controller-vs-service-mesh/
> - https://www.rancher.co.jp/docs/rancher/v2.x/en/cluster-admin/tools/istio/setup/gateway/
> - https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/#specifying-ingressclass

<br>
