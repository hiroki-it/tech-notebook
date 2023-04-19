---
title: 【IT技術の知見】リソース定義＠Grafana
description: リソース定義＠Grafanaの知見を記録しています。
---

# リソース定義＠Grafana

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://grafana.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

# Prometheusと連携するために、Prometheusと同じNamespaceにインストールする。
$ helm install <リリース名> <チャートリポジトリ名>/grafana -n prometheus --version <バージョンタグ>
```

> ↪️ 参考：https://github.com/grafana/helm-charts/tree/main/charts/grafana

Prometheusのコンポーネントとしてインストールしたい場合は、GitHubから全部入りのkube-prometheus-stackチャートをインストールし、リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <リリース名> <チャートリポジトリ名>/kube-prometheus-stack -n prometheus --version <バージョンタグ>
```

> ↪️ 参考：
>
> - https://github.com/prometheus-operator/prometheus-operator#helm-chart
> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack
> - https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/

<br>

#### ▼ ドキュメントから

Grafanaのドキュメントから`.yaml`ファイルをコピーし、`grafana.yaml`ファイルを作成する。

これを作成する。

> ↪️ 参考：https://grafana.com/docs/grafana/latest/installation/kubernetes/

```bash
$ kubectl apply -f grafana.yaml
```

<br>

### ダッシュボードの公開

Nodeの外からPrometheusのダッシュボードをネットワークに公開する場合、Node外からPrometheusサーバーにインバウンド通信が届くようにする必要がある。

**＊実装例＊**

Ingressを作成する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  namespace: grafana
  name: foo-grafana-ingress
spec:
  ingressClassname: foo-ingress-class
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

IngressClassを作成する。

開発環境では、IngressClassとしてNginxを使用する。

本番環境では、クラウドプロバイダーのIngressClass (AWS ALB、Google CLB) を使用する。

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-ingress-class
spec:
  # AWSの場合、ingress.k8s.aws/alb
  controller: k8s.io/ingress-nginx
```

ClusterIP Serviceを作成する。

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

Grafanaのダッシュボードに接続できる。

ユーザー名は`admin`、パスワードは`prom-operator`がデフォルト値である。

```bash
$ kubectl port-forward svc/grafana -n prometheus 8000:80
```

<br>
