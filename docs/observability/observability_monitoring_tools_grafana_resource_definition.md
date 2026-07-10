---
title: 【IT技術の知見】リソース定義＠Grafana
description: リソース定義＠Grafanaの知見を記録しています。
---

# リソース定義＠Grafana

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetes リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://grafana.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

# Prometheusと連携するために、Prometheusと同じNamespaceにインストールする。
$ helm install <Helmリリース名> <チャートリポジトリ名>/grafana -n prometheus --version <バージョンタグ>
```

> - https://github.com/grafana/helm-charts/tree/main/charts/grafana

Prometheus のコンポーネントとしてインストールしたい場合は、GitHub から全部入りの kube-prometheus-stack チャートをインストールし、リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/kube-prometheus-stack -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-operator/prometheus-operator#helm-chart
> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack
> - https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/

<br>

#### ▼ ドキュメントから

Grafana のドキュメントから `yaml` ファイルをコピーし、`grafana.yaml` ファイルを作成する。

これを作成する。

> - https://grafana.com/docs/grafana/latest/installation/kubernetes/

```bash
$ kubectl apply -f grafana.yaml
```

<br>

### ダッシュボードの公開

Node の外から Prometheus のダッシュボードをネットワークに公開する場合、Node 外から Prometheus サーバーにインバウンド通信が届くようにする必要がある。

**＊実装例＊**

Ingress を作成する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  namespace: grafana
  name: foo-grafana-ingress
spec:
  ingressClassName: foo-ingress-class
  rules:
    # ドメインを割り当てる場合、Hostヘッダーの合致ルールが必要である。
    - host: foo.grafana.com
      http:
        paths:
          - backend:
              service:
                name: foo-grafana-service
                port:
                  number: 80
            path: /
            pathType: Prefix
```

IngressClass を作成する。

開発環境では、IngressClass として Nginx を使用する。

本番環境では、クラウドプロバイダーの IngressClass (AWS ALB、Google Cloud CLB) を使用する。

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-ingress-class
spec:
  # AWSの場合、ingress.k8s.aws/alb
  controller: k8s.io/ingress-nginx
```

ClusterIP Service を作成する。

```yaml
apiVersion: v1
kind: Service
metadata:
  namespace: grafana
  name: foo-grafana-service
spec:
  clusterIP: *.*.*.*
  clusterIPs:
    - *.*.*.*
  internalTrafficPolicy: Cluster
  ipFamilies:
    - IPv4
  ipFamilyPolicy: SingleStack
  ports:
    - name: tcp-foo
      port: 80
      protocol: TCP
      targetPort: 3000
  selector:
    app.kubernetes.io/name: foo-grafana
  sessionAffinity: None
  type: ClusterIP
```

<br>

### 接続

Grafana のダッシュボードに接続できる。

ユーザー名は `admin`、パスワードは `prom-operator` がデフォルト値である。

```bash
$ kubectl port-forward svc/grafana -n prometheus 8000:80
```

<br>
