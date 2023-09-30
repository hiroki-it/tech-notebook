---
title: 【IT技術の知見】ArgoCD＠アーキテクチャ特性
description: ArgoCD＠アーキテクチャ特性の知見を記録しています。
---

# ArgoCD＠アーキテクチャ特性

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. repo-server

### 可用性

Podを冗長化させることで、repo-serverの可用性を高める。

ArgoCDの場合、冗長化はrepo-serverの性能設計の改善にもつながる。

<br>

### 性能

#### ▼ 問題

repo-serverは、リポジトリでコミットが更新されるたびにキャッシュを作成する。

#### ▼ レプリカ当たりの処理効率の向上

Applicationがポーリングするリポジトリのパス直下に`.argocd-allow-concurrency`ファイルを置いておくと並行処理をしてくれる。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/high_availability/#enable-concurrent-processing
> - https://blog.manabusakai.com/2021/09/concurrent-processing-of-argo-cd/

#### ▼ レプリカ当たりの負荷の低減

repo-serverは、レプリカ当たり1処理単位のマニフェスト作成しか実行できない。

冗長化によりrepo-serverのレプリカ数 (Pod数) を増やすと、レプリカ当たりのマニフェスト作成処理の負荷を下げられる。

これにより、複数人が同時にDiff操作やSync操作しやすくなる。

> - https://foxutech.com/upscale-your-continuous-deployment-at-enterprise-grade-with-argocd/
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/high_availability/#monorepo-scaling-considerations
> - https://itnext.io/sync-10-000-argo-cd-applications-in-one-shot-bfcda04abe5b
> - https://faun.dev/c/stories/keskad/optimizing-argocd-repo-server-to-work-with-kustomize-in-monorepo/

#### ▼ キャッシュ作成の頻度を下げる

単一のリポジトリで管理するマニフェストやチャートが多くなるほど、コミットの頻度が上がり、キャッシュ再作成の頻度が上がる。

Applicationの`metadata.annotations`キーに`argocd.argoproj.io/manifest-generate-paths`キーを設定し、マニフェストのキャッシュ再作成のトリガーとするディレクトリを設定する。

> - https://foxutech.com/upscale-your-continuous-deployment-at-enterprise-grade-with-argocd/

<br>

## 02. application-controller

### 可用性

Podを冗長化させることで、application-controllerの可用性を高める。

ArgoCDの場合、冗長化はapplication-controllerの性能設計の改善にもつながる。

<br>

### 性能

#### ▼ 問題

テナントにいくつかの実行環境のApplicationを集約する場合に、Application数が増えがちになる。

application-controllerは、デフォルトだとレプリカ当たり`400`個のApplicationまでReconciliationできる。

大量のApplicationをReconciliationする場合、次のような対処方法がある。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/high_availability/#argocd-application-controller

#### ▼ レプリカ当たりの処理効率の向上

application-controllerは、Reconciliation時にApplicationを一つずつ処理していく。

CPUの並列処理数を増やすと、レプリカ当たりの処理効率を上げられる。

Clusterのヘルスチェックの並列処理数は`--status-processors`オプションで、Diff/Sync処理のそれは`--operation-processors`オプションで変更できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmd-params-cm
  namespace: argocd
data:
  controllers.status.processors: 50
  controllers.operation.processors: 25
```

> - https://foxutech.com/upscale-your-continuous-deployment-at-enterprise-grade-with-argocd/
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/high_availability/#argocd-application-controller
> - https://github.com/argoproj/argo-cd/issues/3282#issue-587535971
> - https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/

#### ▼ レプリカ当たりの負荷の低減

application-controllerは、デプロイ対象のClusterと通信する。

冗長化によりapplication-controllerのレプリカ数を増やすと、レプリカ当たりの通信処理の負荷を下げられる。

`ARGOCD_CONTROLLER_REPLICAS`変数で、application-controllerの通信処理を異なるレプリカに分散できる。

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: argocd-application-controller
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: argocd-application-controller
          env:
            - name: ARGOCD_CONTROLLER_REPLICAS
              value: 2
```

> - https://foxutech.com/upscale-your-continuous-deployment-at-enterprise-grade-with-argocd/
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/high_availability/#argocd-application-controller
> - https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/

なお、執筆時点 (2023/08/02) 時点で、単一のClusterの処理をapplication-controllerの異なるレプリカに分散できない。

> - https://github.com/argoproj/argo-cd/issues/6125#issuecomment-1660341387

#### ▼ レプリカ当たりのReconciliation頻度の低減

application-controllerのReconciliationの頻度を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmd-params-cm
  namespace: argocd
data:
  timeout.reconciliation: 180s
```

> - https://foxutech.medium.com/how-to-modify-the-application-reconciliation-timeout-in-argo-cd-833fedf8ebbd

<br>

## 03. argocd-server

### 可用性

Podを冗長化させることで、argocd-serverの可用性を高める。

ArgoCDの場合、冗長化はargocd-serverの性能設計の改善にもつながる。

<br>

### 性能

#### ▼ 問題

argocd-serverは、ステートレスで高負荷になりにくい。

念の為、他のコンポーネントの数に合わせて冗長化するとよい。

#### ▼ レプリカ当たりの負荷の低減

`ARGOCD_API_SERVER_REPLICAS`変数で、argocd-serverの異なるレプリカへのリクエストを分散できる。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: argocd-server
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: argocd-server
          env:
            - name: ARGOCD_API_SERVER_REPLICAS
              value: 3
```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/high_availability/#argocd-server

<br>

### 安全性

ArgoCDには、ダッシュボード上から特定の`kubectl`コマンド (`kubectl logs`コマンド、`kubectl exec`コマンド) を実行できる機能がある。

ダッシュボードの操作者にその権限がない場合、権限を絞る必要がある。

<br>
