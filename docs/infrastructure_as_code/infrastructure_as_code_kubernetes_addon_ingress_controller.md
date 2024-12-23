---
title: 【IT技術の知見】Ingressコントローラー＠Ingressコントローラー系
description: Ingressコントローラー＠Ingressコントローラー系の知見を記録しています。
---

# Ingressコントローラー＠Ingressコントローラー系

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Ingressコントローラーとは

Ingressコントローラーは、kube-controllerのように単一/複数のIngressにwatchイベントを送信する、

これのルールに応じたリバースプロキシやロードバランサー (Ingressコントローラーの種類による) を作成し、Node外からの受信した通信をServiceにルーティングする。

注意点として、IngressコントローラーがServiceにルーティングするのであって、Ingressはあくまでルーティングのルールを定義しているだけである。

Kubernetesの周辺ツール (例：Prometheus、AlertManager、Grafana、ArgoCDなど) のダッシュボードを複数人で共有して参照する場合には、何らかのアクセス制限を付与したIngressを作成することになる。

![kubernetes_ingress-controller](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_ingress-controller.png)

> - https://cloud.google.com/community/tutorials/nginx-ingress-gke
> - https://developers.freee.co.jp/entry/kubernetes-ingress-controller
> - https://www.containiq.com/post/kubernetes-ingress
> - https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/
> - https://traefik.io/glossary/kubernetes-ingress-and-ingress-controller-101/

<br>

## 02. 外部Ingressコントローラーの使用

### 外部Ingressコントローラーの種類

Ingressコントローラーには種類があり、コントローラーごとに作成するリバースプロキシやロードバランサーが異なる。

| 外部Ingressコントローラーの種類                               | リバースプロキシ、ロードバランサー | 開発環境 | 本番環境 |
| ------------------------------------------------------------- | ---------------------------------- | :------: | :------: |
| Nginx Ingressコントローラー                                   | Nginx                              |    ✅    |    ✅    |
| minikubeのingressアドオン (実体はNginx Ingressコントローラー) | Nginx                              |    ✅    |          |
| AWS Load Balancerコントローラー                               | AWS ALB                            |          |    ✅    |
| Google Cloud CLBコントローラー                                | Google Cloud CLB                   |          |    ✅    |
| Istio Ingressコントローラー                                   | Istio IngressGateway (実体はEnvoy) |    ✅    |    ✅    |
| Contourコントローラー                                         | Envoy                              |    ✅    |    ✅    |
| ...                                                           | ...                                |   ...    |   ...    |

> - https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/
> - https://www.nginx.com/blog/how-do-i-choose-api-gateway-vs-ingress-controller-vs-service-mesh/
> - https://www.rancher.co.jp/docs/rancher/v2.x/en/cluster-admin/tools/istio/setup/gateway/
> - https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/#specifying-ingressclass
> - https://github.com/projectcontour/contour

<br>

### AWS Load Balancerコントローラーの場合

```yaml
パブリックネットワーク
⬇⬆︎︎
AWS Route53
⬇⬆︎︎
# L7ロードバランサー (単一のL7ロードバランサーを作成し、異なるポートを開放する複数のL4ロードバランサーの振り分ける)
AWS Load BalancerコントローラーによるAWS ALB
⬇⬆︎︎
# L4ロードバランサー
NodePort Service (ポート番号はランダムでよい)
⬇⬆︎︎
Pod
```

<br>

### Istio Ingressコントローラーの場合

```yaml
パブリックネットワーク
⬇⬆︎︎
AWS Route53
⬇⬆︎︎
  # L7ロードバランサー (単一のL7ロードバランサーを作成し、異なるポートを開放する複数のL4ロードバランサーの振り分ける)
AWS ALB
⬇⬆︎︎
  # L4ロードバランサー
NodePort Service (Istio IngressGateway)
⬇⬆︎︎
Gateway
⬇⬆︎︎
VirtualService
⬇⬆︎︎
  # L4ロードバランサー
ClusterIP Service
⬇⬆︎︎
Pod
```

<br>

## 03. 機能

### Ingressの検知

Ingressに定義されたルーティングのルールを検知する。

Kubernetes Clusterに単一のIngressコントローラーを作成するとよい。

また、各Namespace用に定義されたIngressを使用して、各NamespaceのServiceにルーティングするとよい。

<br>

### インバウンド/アウトバウンド

Ingressコントローラーは、名前ではIngressとなっているがEgress (アウトバウンド) の通信も扱う。

> - https://www.f5.com/ja_jp/company/blog/nginx/guide-to-choosing-ingress-controller-part-1-identify-requirements

<br>

### Ingressの設定値のバリデーション

Ingressコントローラーは、『`***-controller-admission`』というServiceでwebhookサーバーを公開している。

このwebhookサーバーは、新しく追加されたIngressの設定値のバリデーションを実行する。

これにより、不正なIngressが稼働することを防止できる。

このwebhookサーバーの登録時、まず『`***-create`』というJob配下のPodが、有効期限の長いSSL証明書を持つSecretを作成する。

その後、『`***-patch`』というJob配下のPodが、ValidatingWebhookConfigurationにこのSSL証明書を設定し、webhookサーバーにSSL証明書が割り当てられる。

> - https://kubernetes.github.io/ingress-nginx/how-it-works/#avoiding-outage-from-wrong-configuration
> - https://github.com/kubernetes/ingress-nginx/tree/main/charts/ingress-nginx#ingress-admission-webhooks
> - https://blog.sakamo.dev/post/ingress-nginx/

<br>

### SSL証明書の割り当て

Ingressコントローラーは、Secretに設定されたSSL証明書を参照し、これを自身のロードバランサー (例：Nginx) に渡す。

![kubernetes_ingress-controller_certificate](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_ingress-controller_certificate.png)

> - https://blog.sakamo.dev/post/ingress-nginx/
> - https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/https/

<br>
