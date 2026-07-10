---
title: 【IT技術の知見】プラクティス集＠ArgoCD
description: プラクティス集＠ArgoCDの知見を記録しています。
---

# プラクティス集＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. repo-server

### 可用性

Pod を冗長化させることで、repo-server の可用性を高める。

<br>

### 性能

#### ▼ 問題

repo-server は、リポジトリでコミットが更新されるたびにキャッシュを作成する。

Volume の種類によるが、EmptyDir Volume であれば、Pod を再作成するたびにリポジトリをクローンする。

#### ▼ レプリカ数

repo-server の冗長化は、可用性だけでなく性能設計の改善にもつながる。

例えば、レプリカ数を `3` 倍にすると、Sync 時間が 1/3 になる。

> - https://itnext.io/sync-10-000-argo-cd-applications-in-one-shot-bfcda04abe5b
> - https://saikiranpikili.medium.com/make-your-argocd-super-fast-9c75fa94b840

#### ▼ 並列数 (`--parallelismlimit`)

マニフェスト作成処理を並列化する。

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: argocd-repo-server
spec:
  template:
    spec:
      containers:
        - name: argocd-repo-server
          command:
            - --parallelismlimit
            - 5
```

#### ▼ レプリカ当たりの処理効率の向上 (`.argocd-allow-concurrency` ファイル)

repo-server は、レプリカ当たり同時に 1 つの処理しかできない。

このとき、リポジトリがモノリポジトリ (たくさんの Helm チャートが含まれる) であり、複数の Application がこの単一のモノリポジトリをポーリングしていると仮定する。

すると、各 Application のマニフェスト作成処理は repo-server のレプリカ数に影響を受ける。

Application がポーリングするリポジトリのパス直下に `.argocd-allow-concurrency` ファイルを配置しておくと並行処理をしてくれる。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/high_availability/#monorepo-scaling-considerations
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/high_availability/#enable-concurrent-processing
> - https://blog.manabusakai.com/2021/09/concurrent-processing-of-argo-cd/
> - https://saikiranpikili.medium.com/make-your-argocd-super-fast-9c75fa94b840

#### ▼ キャッシュ作成範囲を小さくする (`manifest-generate-paths`)

repo-server は、デプロイ対象のリポジトリにあるマニフェストのキャッシュを積極的に作成する

このとき、リポジトリがモノリポジトリ (たくさんの Helm チャートが含まれる) であり、複数の Application がこの単一のモノリポジトリをポーリングしていると仮定する。

例えば、Application が `500` 個でリポジトリが `1` 個のような場合である。

すると、各 Application ではデプロイ対象の Helm チャートだけでなく、それ以外の Helm チャートの変更でもキャッシュを再作成してしまう。

これが、パフォーマンスの問題になる。

そのため、モノリポジトリには注意が必要である。

Application の `metadata.annotations` キーに `argocd.argoproj.io/manifest-generate-paths` キーを設定し、マニフェストのキャッシュ再作成のトリガーとするディレクトリを設定する。

これにより、`argocd_app_reconcile_count` と `argocd_git_request_total` のメトリクスを改善できる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: app-a
  annotations:
    argocd.argoproj.io/manifest-generate-paths: services/foo
spec:
  project: default
  source:
    repoURL: https://github.com/example/monorepo.git
    targetRevision: HEAD
    path: services/foo
  destination:
    server: https://kubernetes.default.svc
    namespace: default
```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/high_availability/#manifest-paths-annotation
> - https://foxutech.com/upscale-your-continuous-deployment-at-enterprise-grade-with-argocd/
> - https://medium.com/@michail.gebka/optimizing-argocd-for-monorepo-setup-7c5f548e5575
> - https://faun.dev/c/stories/keskad/optimizing-argocd-repo-server-to-work-with-kustomize-in-monorepo/

<br>

## 02. application-controller

### 可用性

Pod を冗長化させることで、application-controller の可用性を高める。

ArgoCD の場合、冗長化は application-controller の性能設計の改善にもつながる。

<br>

### 性能

#### ▼ 問題

テナントにいくつかの実行環境の Application を集約する場合に、Application 数が増えがちになる。

application-controller は、デフォルトだとレプリカ当たり `400` 個の Application まで Reconciliation できる。

- `--status-processors` は、application-controller がデプロイ対象の Cluster に対してヘルスチェックするためのプロセッサ数
- `--operation-processors` は、application-controller がデプロイ対象の Cluster に対して、差分確認 (`kubectl diff`) と Sync (`kubectl apply`) するためのプロセッサ数

#### ▼ レプリカ当たりの処理効率の向上 (`--status-processors`、`--operation-processors`)

application-controller は、Reconciliation 時に Application を 1 つずつ処理していく。

CPU の並列処理数を増やすと、レプリカ当たりの処理効率を上げられる。

Cluster のヘルスチェックの並列処理数は `--status-processors` オプションで、Diff/Sync 処理のそれは `--operation-processors` オプションで変更できる。

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: argocd-application-controller
spec:
  template:
    spec:
      containers:
        - name: argocd-application-controller
          command:
            - --status-processors
            - 20
            - --operation-processors
            - 10
```

ConfigMap でも同様に設定できる。

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
> - https://web.archive.org/web/20231202091510/https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/

- Application`1000` 個の場合、`--status-processors` に `50`、`--operation-processors` に `25` を指定
- Application`400` 個の場合、`--status-processors` に `20`、`--operation-processors` に `10` を指定 (デフォルト値)

Application 数が多くなるほど、Reconciliation の処理キューを空にするまでに時間がかかる。

大量の Application を Reconciliation する場合、次のような対処方法がある。

> - https://aws.amazon.com/jp/blogs/opensource/argo-cd-application-controller-scalability-testing-on-amazon-eks/
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/high_availability/#argocd-application-controller
> - https://itnext.io/sync-10-000-argo-cd-applications-in-one-shot-bfcda04abe5b
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/server-commands/argocd-application-controller/

#### ▼ レプリカ当たりの負荷を低減 (`ARGOCD_CONTROLLER_REPLICAS`)

application-controller は、デプロイ対象の Cluster を処理する。

レプリカ数を単純に増やしても、application-controller の各レプリカはすべての Cluster に対する処理を実行してしまう。

例えば、`ARGOCD_CONTROLLER_REPLICAS` をレプリカ数と同じ数値で設定すると、application-controller のレプリカは、Cluster に対する処理を分業するようになる。

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
> - https://saikiranpikili.medium.com/make-your-argocd-super-fast-9c75fa94b840

なお、執筆時点 (2023/08/02) 時点で、単一の Kubernetes Cluster の処理を application-controller の異なるレプリカに分散できない。

> - https://github.com/argoproj/argo-cd/issues/6125#issuecomment-1660341387

#### ▼ レプリカ当たりのReconciliationの頻度を低減 (`timeout.reconciliation`)

application-controller の Reconciliation の頻度を設定する。

ArgoCD のカスタムリソースに対する Reconcile の頻度が下がれば、平常時の application-controller の負荷は下がる。

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
> - https://saikiranpikili.medium.com/make-your-argocd-super-fast-9c75fa94b840

#### ▼ 処理結果のキャッシュの更新頻度を低減 (`ARGOCD_CLUSTER_CACHE_RESYNC_DURATION`)

application-controller は、クラスターの処理結果のキャッシュを定期的に削除する (デフォルトでは `12` 時間) 。

キャッシュの削除時の間、Sync や Refresh の処理を実施できなくなる。

Application 数が多いほど、キャッシュの削除時間が長くなる。

キャッシュの頻度を下げたり、無効化することにより、削除時間の長期化を低減できる。

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
            - name: ARGOCD_CLUSTER_CACHE_RESYNC_DURATION
              value: 0
```

> - https://domc.me/2024/09/02/argocd_mono_repo_performance_optimization_second/
> - https://github.com/argoproj/argo-cd/issues/15464#issuecomment-2340985236
> - https://github.com/argoproj/argo-cd/blob/v2.12.6/controller/cache/cache.go#L48
> - https://saikiranpikili.medium.com/make-your-argocd-super-fast-9c75fa94b840

#### ▼ Reconciliationのスパイクを軽減

Reconciliation の頻度をランダムに遅延させる。

argocd-application-controller の Pod が一斉に Reconciliation を実行しないようにし、スパイクを軽減する。

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: argocd-application-controller
spec:
  template:
    spec:
      containers:
        - name: argocd-application-controller
          command:
            - --app-resync-jitter
            - 60s
```

#### ▼ タイムアウトを短くする

argocd-application-controller から repo-server へのリクエストのタイムアウトを設定する。

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: argocd-application-controller
spec:
  template:
    spec:
      containers:
        - name: argocd-application-controller
          command:
            - --repo-server-timeout-seconds
            - 60s
```

<br>

## 03. argocd-server

### 可用性

Pod を冗長化させることで、argocd-server の可用性を高める。

ArgoCD の場合、冗長化は argocd-server の性能設計の改善にもつながる。

<br>

### 性能

#### ▼ 問題

argocd-server は、ステートレスで高負荷になりにくい。

念のため、他のコンポーネントの数に合わせて冗長化するとよい。

#### ▼ レプリカ当たりの負荷を低減

`ARGOCD_API_SERVER_REPLICAS` 変数で、argocd-server の異なるレプリカへのリクエストを分散できる。

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

#### ▼ サイドカーのメモリ

argocd-server のサイドカー上 (`***-cmp-server`) で `helm` コマンドのなどを実行する場合、マニフェストの展開にはスパイク的にメモリが必要になる。

そのため、サイドカー (`***-cmp-server`) にはたくさんのメモリを割り当てるようにする。

<br>

### 安全性

ArgoCD には、ダッシュボード上から特定の `kubectl` コマンド (`kubectl logs` コマンド、`kubectl exec` コマンド) を実行できる機能がある。

ダッシュボードの操作者にその権限がない場合、権限を絞る必要がある。

<br>

## 04. ポーリング対象のClusterのデザインパターン

### 内部Clusterパターン

ArgoCD の Application と、ポーリング対象の Cluster を同じ Cluster で管理する。

Application と Cluster を一括で管理できる。

<br>

### 外部Clusterパターン

ArgoCD の Application と、ポーリング対象の Cluster を別々の Cluster で管理する。

複数 Kubernetes Cluster にデプロイする Application を管理しやすい。

> - https://twitter.com/yaml_villager/status/1625857205928075267

<br>

## 05. リポジトリの編成規約

### リポジトリ分割のメリット

リポジトリを分割することにより、以下のメリットがある。

- 認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

<br>

### マニフェストリポジトリ

#### ▼ マニフェストリポジトリとは

マニフェストやチャートを管理する。

GitOps のベストプラクティスに則って、アプリケーションリポジトリとマニフェストリポジトリに分割する。

> - https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices

#### ▼ アプリ領域

アプリ領域のマニフェストやチャートは、ArgoCD とは別に管理する。

```yaml
# アプリ領域のマニフェスト
app-manifest-repository/
├── tes/
│   ├── deployment.yaml
│   ...
│
├── stg/
└── prd/
```

#### ▼ インフラ領域

インフラ領域のマニフェストやチャートは、ArgoCD とは別に管理する。

```yaml
# インフラ領域のマニフェスト
infra-manifest-repository/
├── tes/
│   ├── deployment.yaml
│   ...
│
├── stg/
└── prd/
```

<br>

### アプリリポジトリ

アプリケーションのソースコードを管理する。

説明は省略する。

<br>

## 06. Applicationのデザインパターン

### Appパターン (通常パターン)

ポーリング対象リポジトリごとに Application を作成し、これらを同じリポジトリで管理する。

このとき、すべての Application には親 Application が存在しない。

ポーリング対象リポジトリには Kubernetes リソースのマニフェストや helm チャートが管理されている。

```yaml
argocd-repository/
├── tes/
│   ├── app-application.yaml
│   └── infra-application.yaml
│
├── stg/
└── prd/
```

```yaml
app-manifest-repository/ # マニフェストリポジトリまたはチャートリポジトリ
├── tes/
│   ├── deployment.yaml
│   ....
│
├── stg/
└── prd/
```

```yaml
infra-manifest-repository/ # マニフェストリポジトリまたはチャートリポジトリ
├── tes/
│   ├── deployment.yaml
│   ...
│
├── stg/
└── prd/
```

> - https://atmarkit.itmedia.co.jp/ait/articles/2107/30/news018.html#04

<br>

### App Of Appsパターン

#### ▼ App Of Appsパターンとは

親 Application で子 Application をグループ化したように構成する。

Application の `.resource` キー配下で、紐づく子 Application を管理している。

![root-application](https://raw.githubusercontent.com/hiroki-it/helm-charts-practice/main/root-application.png)

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/#app-of-apps-pattern
> - https://medium.com/dzerolabs/turbocharge-argocd-with-app-of-apps-pattern-and-kustomized-helm-ea4993190e7c
> - https://www.arthurkoziel.com/setting-up-argocd-with-helm/

#### ▼ root-application (第１階層のApplication)

すべての Application をポーリングする最上位 Application のこと。

root-application と AppProject は同じ Namespace に所属する必要がある。

状態の影響範囲を加味して、デプロイ先の Cluster (異なる実行環境も含む) を粒度として、root-application を作成する。

root-application は、`default` や `root` の AppProject に配置する。

```yaml
# 最上位Application
root-argocd-repository/
├── tes/
│   └── root-application.yaml
│
├── stg/
└── prd/
```

#### ▼ parent-application (第２階層のApplication)

各 AppProject の子 Application をポーリングする親 Application のこと。

管理チームごとに Application (app-parent-application、infra-parent-application) を作成するとよい。

parent-application は、実行環境名 (dev、stg、prd) の AppProject に配置する。

```yaml
# 親Application
parent-argocd-repository/
├── tes/
│   ├── app-parent-application.yaml # appのAppProjectをポーリングするapplication
│   └── infra-parent-application.yaml # infraのAppProjectをポーリングするapplication
│
├── stg/
└── prd/
```

#### ▼ child-application (第３階層のApplication)

各 AppProject で、マニフェストリポジトリやチャートリポジトリをポーリングする Application のこと。

マイクロサービス単位のマニフェストやチャートごとに作成するとよい。

child-application は、そのマイクロサービスをデプロイする権限を持つチーム名の AppProject に配置する。

child-application は、実行環境名 (dev、stg、prd) の AppProject に配置する。

```yaml
# 子Application
child-argocd-repository/
├── tes/
│   ├── app
│   │   ├── account-application.yaml
│   │   ├── customer-application.yaml
│   │   ├── orchestrator-application.yaml
│   │   ├── order-application.yaml
│   │   └── shared-application.yaml
│   │
│   └── infra
│       ├── fluentd-application.yaml
│       ├── grafana-application.yaml
│       ├── istio-application.yaml
│       ├── kiali-application.yaml
│       ├── prometheus-application.yaml
│       ├── shared-application.yaml
│       └── victoria-metrics-application.yaml
│
├── stg/
└── prd/
```

#### ▼ grand-parent-application

記入中...

> - https://tech.isid.co.jp/entry/2022/12/05/Argo_CD%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6Istio%E3%82%92%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3%E3%82%A2%E3%83%83%E3%83%97%E3%81%99%E3%82%8B

<br>

## 07. ディレクトリ構成規約

### 実行環境別 (必須)

必須の構成である。

実行環境別に、Application を異なるディレクトリで管理する。

Application では、実行環境に対応するブランチのみをポーリングする。

```yaml
repository/
├── tes/ # テスト環境
├── stg/ # ステージング環境
└── prd/ # 本番環境
```

<br>

## 08. 命名規則

### Application

同じ Cluster 内では Application 名を一意にする必要がある。

また、GUI 上での実行環境の選択ミスを予防するために、実行環境名をつける。

例えば、Application 名にサービス名と実行環境名 (例：`<サービス名>-<実行環境名>`) で命名する。

執筆時点 (2023/03/08) で、ArgoCD の ConfigMap に、親 Application を指定するためのラベル名を設定できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  application.instanceLabelKey: argocd.argoproj.io/instance
```

ArgoCD は、Kubernetes リソースの `.metadata.labels` キーにこのラベル (ここでは `argocd.argoproj.io/instance` キー) を自動的に設定する。

AppProject が異なる限り、同じ Cluster 内にある同じ `argocd.argoproj.io/instance` キー値を持つ Application は区別される。

一方で、同じ AppProject にある Application は、たとえ Namespace が異なっていても区別できない。

そのため、Kubernetes リソースが複数の Application に紐づいてしまう。

これらの理由から、同じ Cluster 内では Application 名を一意にする必要がある。

<br>

### AppProject

実行環境名 (dev、stg、prd) とする。

ArgoCD では、認可スコープ (argocd-rbac-cm) と AppProject を紐付けられるため、特定の実行環境の AppProject に所属する ArgoCD 系リソースのみを操作できるようになる。

<br>

### Namespace

プロダクト名とする。

同じ Cluster 内に、複数のプロダクト用の ArgoCD を配置できるようになる。

<br>

## 09. CDツールに関するテスト

### 脆弱性対策

#### ▼ 公式側

対象のソースコードの脆弱性ではなく、CD ツールに関するそれに対処する。

CD ツール (例：ArgoCD、Flux など) によっては、公式リポジトリで脆弱性診断を実施してくれている。

> - https://argo-cd.readthedocs.io/en/stable/developer-guide/static-code-analysis/
> - https://github.com/argoproj/argo-cd/blob/v2.6.0/.github/workflows/README.md

<br>

### 認証／認可

#### ▼ ArgoCDの操作ユーザーの場合

ArgoCD のデフォルトの認証方法は、Bearer 認証である。

利便性のため SSO を採用しつつ、二要素認証を組み合わせて強度を高める。

そのために、認証フェーズを信頼性の高い ID プロバイダー (例：Auth0、AWS Cognito、GitHub、Google Cloud Auth、Keycloak、Zitadel) に委譲し、SSO (OAuth、SAML、OIDC) を採用する。

さらに、SSO と二要素認証を組み合わせ、上記の認証フェーズ時に PC やスマホのワンタイムパスワードを要求する。

| 認証／認可方法          | 二要素認証 | 推奨/非推奨 |
| ----------------------- | :--------: | :---------: |
| Bearer認証 (デフォルト) |     -      |   非推奨    |
| OAuth                   |    あり    |    推奨     |
|                         |    なし    |   非推奨    |
| OIDC                    |    あり    |    推奨     |
|                         |    なし    |   非推奨    |
| SAML                    |    あり    |    推奨     |
|                         |    なし    |   非推奨    |

#### ▼ ArgoCD自体の場合

ArgoCD を ServiceAccount で認証し、また ClusterRole で認可する。

| 期限   | 説明                                                                 | 方法                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 推奨/非推奨 |
| ------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
| 恒久的 | CDツールを恒久的に認証し、また同様に認可スコープを恒久的に付与する。 | Kubernetes `v1.21` 以前では、ServiceAccountの認証用のトークンに期限がない。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |   非推奨    |
| 一時的 | CDツールを一時的に認証し、また同様に認可スコープを一時的に付与する。 | Kubernetes `v1.22` 以降では、BoundServiceAccountTokenVolumeにより、ServiceAccountのトークンに `1` 時間の有効期限がある。kube-apiserverのクライアント側が特定のバージョンのclientパッケージを使用していれば、認証用のトークンが定期的に再作成されるようになっており、一時的な認証を実現できている。一方で、CDツールにClusterRoleの認可スコープ一時的に付与する方法は、調査した限り見つからなかったが、preSyncなどを使用すればできるかも。<br>参考：<br>・https://github.com/argoproj/argo-cd/issues/9417#issuecomment-1162548782 <br>・https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/#bound-service-account-token-volume |    推奨     |

<br>

### 機密な変数やファイルの管理

#### ▼ Secretの変数の場合

記入中...

> - https://akuity.io/blog/how-to-manage-kubernetes-secrets-gitops/

<br>

## 10. 事後処理

### 通知

CD パイプライン上で実行しているステップ (例：デプロイ、ロールバックなど) の結果が通知されるようにする。

通知があることと品質を高めることは直接的には関係ないが、開発者の作業効率が上がるため、間接的に品質を高めることにつながる。

<br>

## 11. エラー解決

### AppProjectが見つからない

argocd-server または application-controller が、Application で指定された AppProject を見つけられず、以下のエラーを返すことがある。

```bash
Application referencing project foo-project which does not exist
```

<br>

### 削除できない系

#### ▼ Applicationを削除できない

Prune による Kubernetes リソースの削除を有効化し、フォアグラウンドで削除した場合、Application が配下にリソースを持たないことにより、Application を削除できないことがある。

これらの場合には、以下の手順で Application を削除する。

> - https://stackoverflow.com/questions/67597403/argocd-stuck-at-deleting-but-resources-are-already-deleted

`(1)`

: Application の `.spec.syncPolicy.allowEmpty` キーを有効化する。

`(2)`

: フォアグラウンドで削除すると、Application の `.metadata.finalizers` キーの値に削除中のリソースが設定される。

     この配列を空配列に変更する。ArgoCDのUIからは変更できず、`kubectl patch`コマンドを使用する必要がある。

```bash
$ kubectl patch crd applications.argoproj.io \
    -p '{"metadata":{"finalizers":[]}}' \
    --type=merge
```

> - https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/

`(3)`

: 1 つ目の `.spec.syncPolicy.allowEmpty` キーの変更を元に戻す。

#### ▼ Namespaceを削除できない

```bash
$ kubectl patch ns argocd \
    -p '{"metadata":{"finalizers":[]}}' \
    --type=merge
```

<br>

### Helmチャートが大きすぎるとArgoCDがフリーズする

今現在、Helm にはインストールしたチャートのキャッシュを作成する機能がない。

そのため、大きすぎるチャートを ArgoCD で使用すると、毎回大きなチャートをインストールすることになり、ArgoCD が高負荷でフリーズすることがある。

Helm で、チャートのキャッシュ機能が実装されれば、ArgoCD のフリーズも解消できるはずである。

> - https://github.com/helm/community/pull/185

<br>

### ConfigMapやSecretの設定変更が反映されない

ArgoCD を使用しない場合と同様にして、ConfigMap や Secret の設定変更を反映する場合、Deployment/StatefulSet/DaemonSet を再起動する必要がある。

<br>

### すでに終了したPodがポーリングされ続ける

すでに終了した Pod をポーリングし続けてしまうことがある。

この問題が起こった場合、以下のいずれかで解決する。

- argocd-server を再起動する。親になるリソースを削除する必要がなく、apply 先の Cluster には影響がないため、安全な方法である。ArgoCD の使用者に周知しさえすれば問題ない。
- Workload (例：Deployment、DaemonSet、StatefulSet、Job など) を一度削除する。ただし、親になるリソースを削除する必要があるため、やや危険である。

<br>

### `Progressing` 状態でスタックする

Ingress、StatefulSet、DaemonSet、で特定の設定値を使用していると、ArgoCD の `Progressing` 状態でスタックすることがある。

> - https://argo-cd.readthedocs.io/en/stable/faq/#why-is-my-application-stuck-in-progressing-state

<br>

### SyncしてもOutOfSyncステータスが解消されない

Sync 後に Kubernetes リソースの状態が変更されるような場合、Sync しても Synced ステータスではなく OutOfSync ステータスになってしまう。

> - https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/
> - https://argo-cd.readthedocs.io/en/stable/faq/#why-is-my-application-still-outofsync-immediately-after-a-successful-sync

<br>

## 12. アーキテクチャ特性の担保

### 可用性の場合

可用性を高めるために、ArgoCD の各コンポーネントを冗長化する。

<br>

## 13. アップグレード

### ArgoCD自体のアップグレード

#### ▼ 対応バージョンについて

ArgoCD のアップグレードでは、ArgoCD 自身が動く Cluster と、デプロイ先 Cluster の両方のバージョンを考慮する必要がある。

ArgoCD のコンポーネントのうちで、argocd-server は client-go パッケージを使用して、自身が動く Cluster の kube-apiserver と通信する。

一方で、application-controller も同様に client-go パッケージ (gitops-engine がこれを持つ) を使用して通信する。

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/go.mod#L94
> - https://github.com/argoproj/gitops-engine/blob/v0.6.2/go.mod#L17

ArgoCD では、CI 上で Cluster のバージョンをテストしており、CI の実行環境 (K3S や K3D を使用している) のバージョンから、テスト済みの Cluster のバージョンを確認できる。

このテストでは、CI 上に特定のバージョンの Kubernetes Cluster を作成し、またこの Cluster に対して ArgoCD の稼働や各種処理 (マニフェストデプロイ) を実行する。

例えば、ArgoCD の `v2.7.3` は、K3S の `v1.26.0`/`v1.25.4`/`v1.24.3`/`v1.23.3` をサポートしているため、これらのバージョンの Cluster で稼働しつつ、マニフェストをデプロイできることが保証されている。

> - https://github.com/argoproj/argo-cd/blob/v2.7.3/.github/workflows/ci-build.yaml#L359-L462
> - https://github.com/argoproj/argo-cd/tree/master/test/e2e

#### ▼ CRDについて

ArgoCD 自体を ArgoCD で管理できないため、手動やマニフェスト管理ツール (Helm、Kustomize) で ArgoCD をアップグレードする必要がある。

特に CRD は、マニフェスト管理ツールで更新できない (作成はできる) 場合がある。

そのため、チャートリポジトリにある該当のディレクトリ配下の CRD のマニフェストを指定し、直接的に更新する。

<br>

### ArgoCDを使用したツールのアップグレード

マニフェストリポジトリやチャートリポジトリの設計によっては、新バージョンの Kubernetes リソース名にリビジョンがつくようになっていることがある (例：Istio のチャート) 。

この場合、Prune を無効化したうえで、既存の Kubernetes リソースをそのままに、新バージョンを新しく作成する。

新バージョンの動作が問題なければ、旧バージョンの Kubernetes リソースを Prune で削除する。

<br>

## 13-02. B/G式のアップグレード (Amazon EKSの場合)

### AWS Load Balancer Controllerを採用している場合

#### ▼ 新しくAWS ALBを作成する場合

- 別のドメインで B/G Cluster に接続する方法。DNS レコードが異なる。一番簡単だが、ドメインを変更しないといけない。
- B/G Cluster を Amazon Route 53 で切り替える方法。DNS レコードは既存のものを使って、これに紐づく AWS ALB が異なる。DNS キャッシュに注意する。

> - https://masayosu.hatenablog.com/entry/2022/12/14/090000

#### ▼ 既存のAWS ALBを使用する場合

- TargetGroupBinding を新しく採用し、AWS ALB の振り分けの重みづけで B/G Cluster を切り替える方法。ArgoCD が複数のプロダクトを管理している場合、プロダクトごとに切り替えられない。

> - https://masayosu.hatenablog.com/entry/2022/12/14/090000

<br>

### AWS ALB、Nginx Controllerを採用している場合

AWS ALB のターゲットグループで B/G Cluster を切り替える方法。

<br>

## 13-03. インプレース

ArgoCD と同時に Kubernetes もアップグレードする場合、問題を切り分けやすいように、別々にアップグレードする。

検証時は `1` バージョンずつアップグレードし、最終的な設定方法を探る。

検証後は、最終的な設定方法で一気にアップグレードするとよい。

> - https://github.com/argoproj/argo-cd/blob/v2.7.3/.github/workflows/ci-build.yaml#L359-L462
> - https://github.com/argoproj/argo-cd/tree/master/test/e2e

<br>

## 14. Prometheusによる監視

### メトリクスの種類

ArgoCD はデータポイントを作成し、これを Prometheus で収集できる。

| Prometheusのメトリクス                | メトリクスの種類 | 説明                                                                                                                                                                                                                                      |
| ------------------------------------- | :--------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `argocd_app_info`                     |      Gauge       | Applicationの状態を表す。                                                                                                                                                                                                                 |
| `argocd_app_k8s_request_total`        |     Counter      | 差分の検出時に、Applicationからポーリング対象Clusterに送信されたリクエスト数を表す。                                                                                                                                                      |
| `argocd_app_labels`                   |      Gauge       | 記入中...                                                                                                                                                                                                                                 |
| `argocd_app_reconcile`                |    Histogram     | Applicationの性能を表す。                                                                                                                                                                                                                 |
| `argocd_app_sync_total`               |     Counter      | ApplicationのSync数を表す。                                                                                                                                                                                                               |
| `argocd_cluster_api_resource_objects` |      Gauge       | ポーリング対象Clusterに関して、キャッシュしているKubernetesリソースのマニフェスト数を表す。                                                                                                                                               |
| `argocd_cluster_api_resources`        |      Gauge       | ポーリング対象Clusterに関して、検知しているKubernetesリソースのマニフェスト数を表す。                                                                                                                                                     |
| `argocd_cluster_cache_age_seconds`    |      Gauge       | ポーリング対象Clusterに関して、キャッシュの有効期間を表す。                                                                                                                                                                               |
| `argocd_cluster_connection_status`    |      Gauge       | ポーリング対象Clusterに関して、現在の接続状態を表す。                                                                                                                                                                                     |
| `argocd_cluster_events_total`         |     Counter      | ポーリング対象Clusterに関して、イベントの合計数を表す。                                                                                                                                                                                   |
| `argocd_cluster_info`                 |      Gauge       | ポーリング対象Clusterの状態を表す。                                                                                                                                                                                                       |
| `argocd_kubectl_exec_pending`         |      Gauge       | ArgoCDのexecのPending数を表す。                                                                                                                                                                                                           |
| `argocd_kubectl_exec_total`           |     Counter      | ArgoCDのexecの合計数を表す。                                                                                                                                                                                                              |
| `argocd_redis_request_duration`       |    Histogram     | Redisへのリクエストのレイテンシーを表す。                                                                                                                                                                                                 |
| `argocd_redis_request_total`          |     Counter      | Redisへのリクエスト数を表す。                                                                                                                                                                                                             |
| `app_reconciliation_queue`            |     Counter      | application-controllerはカスタムリソースのReconciliation処理をキューに格納する。これの処理数を表す。                                                                                                                                      |
| `app_operation_processing_queue`      |     Counter      | application-controllerはSync処理をキューに格納する。これの処理数を表す。                                                                                                                                                                  |
| `argocd_git_request_total`            |     Counter      | repo-serverの `git ls-remote` コマンドや `git fetch` コマンドの実行数を表す。これらは、`request_type` ラベルで `ls-remote` と `fetch` という値で取得できる。キャッシュが更新される頻度が高いと `git fetch` コマンドの実行頻度も高くなる。 |

> - https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/#Monitoring-and-Alerting
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/metrics/
> - https://aws.amazon.com/blogs/opensource/argo-cd-application-controller-scalability-testing-on-amazon-eks/
> - https://itnext.io/sync-10-000-argo-cd-applications-in-one-shot-bfcda04abe5b
> - https://argo-cd.readthedocs.io/en/stable/proposals/004-scalability-benchmarking/#proposal

<br>

### Grafanaダッシュボード

#### ▼ 性能ヒートマップ

縦軸で Reconciliation の秒数を表し、横軸の色で Reconciliation の処理数を表現する。

グラフの上部にたくさんの処理が分布するほど、Reconciliation の性能が低いとわかる。

> - https://blog.argoproj.io/argo-cd-v1-5-generally-available-a16b9a2347ba

<br>

### 必要なKubernetesリソース

#### ▼ ServiceMonitor

ServiceMonitor を作成し、ArgoCD のコンポーネントの Pod を監視する。

ServiceMonitor は、ArgoCD のコンポーネントがテナントごとにあっても、1 つ作成すればよい。

```yaml
# application-controllerのPodを監視する
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: argocd-application-controller
  namespace: prometheus
spec:
  endpoints:
    - port: http-metrics
  namespaceSelector:
    any: "true"
  selector:
    matchLabels:
      app.kubernetes.io/name: argocd-metrics
---
# redisのPodを監視する
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: argocd-redis
  namespace: prometheus
spec:
  endpoints:
    - port: http-metrics
  namespaceSelector:
    any: "true"
  selector:
    matchLabels:
      app.kubernetes.io/name: argocd-redis
---
# repo-serverのPodを監視する
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: argocd-repo-server
  namespace: prometheus
spec:
  endpoints:
    - port: http-metrics
  namespaceSelector:
    any: "true"
  selector:
    matchLabels:
      app.kubernetes.io/name: argocd-repo-server-metrics
---
# argocd-serverのPodを監視する
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: argocd-server
  namespace: prometheus
spec:
  endpoints:
    - port: http-metrics
  namespaceSelector:
    any: "true"
  selector:
    matchLabels:
      app.kubernetes.io/name: argocd-server-metrics
```

#### ▼ Service

リクエスト専用の Service を作成し、ServiceMonitor からリクエストを受信できるようにする。

```yaml
# application-controller用のServiceMonitorからリクエストを受信する
apiVersion: v1
kind: Service
metadata:
  name: foo-argocd-application-controller-metrics
  namespace: foo
spec:
  type: ClusterIP
  ports:
    - name: http-metrics
      protocol: TCP
      port: 8082
      targetPort: metrics
  selector:
    app.kubernetes.io/name: argocd-application-controller
    app.kubernetes.io/instance: foo
---
# redis用のServiceMonitorからリクエストを受信する
apiVersion: v1
kind: Service
metadata:
  name: foo-argocd-redis-metrics
  namespace: foo
spec:
  type: ClusterIP
  clusterIP: None
  ports:
    - name: http-metrics
      protocol: TCP
      port: 9121
      targetPort: metrics
  selector:
    app.kubernetes.io/name: argocd-redis
    app.kubernetes.io/instance: foo
    app.kubernetes.io/component: redis
---
# repo-server用のServiceMonitorからリクエストを受信する
apiVersion: v1
kind: Service
metadata:
  name: foo-argocd-repo-server-metrics
  namespace: foo
spec:
  type: ClusterIP
  ports:
    - name: http-metrics
      protocol: TCP
      port: 8084
      targetPort: metrics
  selector:
    app.kubernetes.io/name: argocd-repo-server
    app.kubernetes.io/instance: foo
---
# argocd-server用のServiceMonitorからリクエストを受信する
apiVersion: v1
kind: Service
metadata:
  name: foo-argocd-server-metrics
  namespace: foo
spec:
  type: ClusterIP
  ports:
    - name: http-metrics
      protocol: TCP
      port: 8083
      targetPort: metrics
  selector:
    app.kubernetes.io/name: argocd-server
    app.kubernetes.io/instance: foo
```

<br>

## 15. マルチテナント

### ArgoCDでテナント分割が必要な理由

異なる Cluster をデプロイ先とする ArgoCD を同じ Cluster で管理する場合、ArgoCD は Namespace 単位でテナント分割できない。

ArgoCD のコンポーネント (特に、application-controller、argocd-server) には、Cluster スコープな Kubernetes リソース (例：ClusterRole の認可スコープを紐づける) が必要である。

そのため、Namespace ごとに ArgoCD のコンポーネントを分割したとしても、argocd-server が異なる Namespace の application-controller の処理結果を取得してしまい、想定外のエラーが起こる。

そこで、異なる Cluster 用の ArgoCD を単一の Kubernetes Cluster で管理する場合、以下方法でマルチテナントを実現する。

> - https://akuity.io/blog/argo-cd-architectures-explained/

<br>

### AppProjectを使用する場合

単一 Kubernetes Cluster 上に複数の AppProject を作成し、これを単位として ArgoCD を作成する。

各テナントは、ArgoCD を共有する。

この場合、レプリカ数や CPU 数を増やすことにより、並列処理数を増やす必要がある。

> - https://github.com/argoproj/argo-cd/issues/11116
> - https://techblog.zozo.com/entry/measure-argocd-introduction
> - https://zenn.dev/hodagi/articles/2bc3fa10df186c

<br>

### 仮想Cluster単位の場合

単一 Kubernetes Cluster 内に仮想 Cluster (例：vcluster) を構築し、これを単位として ArgoCD を作成する。

各テナントは、ArgoCD を共有しない。

> - https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/

<br>

### 実Cluster単位の場合

テナントごとに異なる実 Cluster を作成し、これを単位として ArgoCD を作成する。

各テナントは、ArgoCD を共有しない。

<br>

## 16. アクセスを制御する

### ローカルマシン ➡️ (アクセス制御) ➡️ ArgoCD の部分

```yaml
ローカルマシン
⬇️
(アクセス制御)
⬇️
ArgoCD
⬇️
(アクセス制御)
⬇️
Cluster
```

- ArgoCD の送信元の AWS ALB に AWS WAF を紐づけ、特定の IP アドレス以外を `403` ステータス (認可エラー) にする。
- ArgoCD のログインに SSO を使用し、利用者以外を `401` ステータス (認証エラー) にする

### ArgoCD ➡️ (アクセス制御) ➡️ Cluster の部分

```yaml
ローカルマシン
⬇️
(アクセス制御)
⬇️
ArgoCD
⬇️
(アクセス制御)
⬇️
Cluster
```

- `policy.csv` ファイルで ArgoCD 上の認可スコープを定義し、 `403` (認可エラー) にする。 ただし、SSO が成功すれば ArgoCD の閲覧は可能とする。
- Cluster 側で ArgoCD の送信元 IP アドレス (AWS なら NAT Gateway) を許可し、特定の ArgoCD 以外を `403` (認可エラー) にする。
- Amazon EKS Cluster の ARN を登録しない場合は、`404` にする。 (これは、ArgoCD が `cluster 'https://*****.gr7.ap-northeast-1.eks.amazonaws.com' has not been configured` を返却してくれる)

<br>
