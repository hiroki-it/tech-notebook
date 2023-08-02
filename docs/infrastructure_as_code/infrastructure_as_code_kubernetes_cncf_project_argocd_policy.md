---
title: 【IT技術の知見】設計規約＠ArgoCD
description: 設計規約＠ArgoCDの知見を記録しています。
---

# 設計規約＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ポーリング対象のClusterのデザインパターン

### 内部Clusterパターン

ArgoCDのApplicationと、ポーリング対象のClusterを同じClusterで管理する。

ApplicationとClusterを一括で管理できる。

<br>

### 外部Clusterパターン

ArgoCDのApplicationと、ポーリング対象のClusterを別々のClusterで管理する。

複数のClusterにデプロイするApplicationを管理しやすい。

> - https://twitter.com/yaml_villager/status/1625857205928075267

<br>

## 02. リポジトリ構成規約

### リポジトリ分割のメリット

リポジトリを分割することにより、以下のメリットがある。

- 認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

<br>

### マニフェストリポジトリ

#### ▼ マニフェストリポジトリとは

マニフェストやチャートを管理する。

GitOpsのベストプラクティスに則って、アプリケーションリポジトリとマニフェストリポジトリに分割する。

> - https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices

#### ▼ アプリ領域

アプリ領域のマニフェストやチャートは、ArgoCDとは別に管理する。

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

インフラ領域のマニフェストやチャートは、ArgoCDとは別に管理する。

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

## 03. Applicationのデザインパターン

### Appパターン (通常パターン)

ポーリング対象リポジトリごとにApplicationを作成し、これらを同じリポジトリで管理する。

この時、全てのApplicationには親Applicationが存在しない。

ポーリング対象リポジトリにはKubernetesリソースのマニフェストやhelmチャートが管理されている。

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

### App-Of-Appsパターン

#### ▼ App-Of-Appsパターンとは

親Applicationで子Applicationをグループ化したように構成する。

Applicationの`.resource`キー配下で、紐づく子Applicationを管理している。

![root-application](https://raw.githubusercontent.com/hiroki-it/helm-charts-practice/main/root-application.png)

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/#app-of-apps-pattern
> - https://medium.com/dzerolabs/turbocharge-argocd-with-app-of-apps-pattern-and-kustomized-helm-ea4993190e7c
> - https://www.arthurkoziel.com/setting-up-argocd-with-helm/

#### ▼ root-application (第１階層のApplication)

全てのApplicationをポーリングする最上位Applicationのこと。

root-applicationとAppProjectは同じNamespaceに属する必要がある。

状態の影響範囲を加味して、デプロイ先のCluster (異なる実行環境も含む) を粒度として、root-applicationを作成する。

root-applicationは、`default`や`root`のAppProjectに配置する。

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

各AppProjectの子Applicationをポーリングする親Applicationのこと。

管理チームごとにApplication (app-parent-application、infra-parent-application) を作成すると良い。

parent-applicationは、実行環境名 (dev、stg、prd) のAppProjectに配置する。

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

各AppProjectで、マニフェストリポジトリやチャートリポジトリをポーリングするApplicationのこと。

マイクロサービス単位のマニフェストやチャートごとに作成すると良い。

child-applicationは、そのマイクロサービスをデプロイする権限を持つチーム名のAppProjectに配置する。

child-applicationは、実行環境名 (dev、stg、prd) のAppProjectに配置する。

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

## 04. ディレクトリ構成規約

### 実行環境別 (必須)

必須の構成である。

実行環境別に、Applicationを異なるディレクトリで管理する。

Applicationでは、実行環境に対応するブランチのみをポーリングする。

```yaml
repository/
├── tes/ # テスト環境
├── stg/ # ステージング環境
└── prd/ # 本番環境
```

<br>

## 05. 命名規則

### Application

同じCluster内ではApplication名を一意にする必要がある。

また、GUI上での実行環境の選択ミスを予防するために、実行環境名をつける。

例えば、Application名にサービス名と実行環境名 (例：`<サービス名>-<実行環境名>`) で命名する。

執筆時点 (2023/03/08) で、ArgoCDのConfigMapに、親Applicationを指定するためのラベル名を設定できる。

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

ArgoCDは、Kubernetesリソースの`.metadata.labels`キーにこのラベル (ここでは`argocd.argoproj.io/instance`キー) を自動的に設定する。

AppProjectが異なる限り、同じCluster内にある同じ`argocd.argoproj.io/instance`キー値を持つApplicationは区別される。

一方で、同じAppProjectにあるApplicationは、たとえNamespaceが異なっていても区別できない。

そのため、Kubernetesリソースが複数のApplicationに紐づいてしまう。

これらの理由から、同じCluster内ではApplication名を一意にする必要がある。

<br>

### AppProject

実行環境名 (dev、stg、prd) とする。

ArgoCDでは、認可スコープ (argocd-rbac-cm) とAppProjectを紐付けられるため、特定の実行環境のAppProjectに属するArgoCD系リソースのみを操作できるようになる。

<br>

### Namespace

プロダクト名とする。

同じCluster内に、複数のプロダクト用のArgoCDを配置できるようになる。

<br>

## 06. CDツールに関するテスト

### 脆弱性対策

#### ▼ 公式側

対象のソースコードの脆弱性ではなく、CDツールに関するそれに対処する。

CDツール (例：ArgoCD) によっては、公式リポジトリで脆弱性テストを実施してくれている。

> - https://argo-cd.readthedocs.io/en/stable/developer-guide/static-code-analysis/
> - https://github.com/argoproj/argo-cd/blob/master/.github/workflows/README.md

<br>

### 認証/認可

#### ▼ ArgoCDの操作ユーザーの場合

ArgoCDのデフォルトの認証方法は、Bearer認証である。

利便性のためSSOを採用しつつ、二要素認証を組み合わせて強度を高める。

そのために、認証フェーズを信頼性の高い外部サービス (Auth0、GitHub、GitLab、など) に委譲し、SSO (OAuth、SAML、OIDC) を採用する。

さらに、SSOと二要素認証を組み合わせ、上記の認証フェーズ時にPCやスマホのワンタイムパスワードを要求するようにする。

| 認証/認可方法           | 二要素認証 | 推奨/非推奨 |
| ----------------------- | :--------: | :---------: |
| Bearer認証 (デフォルト) |     -      |   非推奨    |
| OAuth                   |    あり    |    推奨     |
|                         |    なし    |   非推奨    |
| OIDC                    |    あり    |    推奨     |
|                         |    なし    |   非推奨    |
| SAML                    |    あり    |    推奨     |
|                         |    なし    |   非推奨    |

#### ▼ ArgoCD自体の場合

ArgoCDをServiceAccountで認証し、またClusterRoleで認可する。

| 期限   | 説明                                                                 | 方法                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 推奨/非推奨 |
| ------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------: |
| 恒久的 | CDツールを恒久的に認証し、また同様に認可スコープを恒久的に付与する。 | Kubernetes `v1.21` 以前では、ServiceAccountの認証用のトークンに期限がない。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |   非推奨    |
| 一時的 | CDツールを一時的に認証し、また同様に認可スコープを一時的に付与する。 | Kubernetes `v1.22` 以降では、BoundServiceAccountTokenVolumeにより、ServiceAccountのトークンに`1`時間の有効期限がある。kube-apiserverのクライアント側が特定のバージョンのclientパッケージを使用していれば、認証用のトークンが定期的に再作成されるようになっており、一時的な認証を実現できている。一方で、CDツールにClusterRoleの認可スコープ一時的に付与する方法は、調査した限り見つからなかったが、preSyncなどを使用すればできるかも。<br>参考：<br>・https://github.com/argoproj/argo-cd/issues/9417#issuecomment-1162548782 <br>・https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/#bound-service-account-token-volume |    推奨     |

<br>

### 機密な変数やファイルの管理

#### ▼ Secretの変数の場合

記入中...

> - https://akuity.io/blog/how-to-manage-kubernetes-secrets-gitops/

<br>

## 07. 事後処理

### 通知

CDパイプライン上で実行しているステップ (例：デプロイ、ロールバック、など) の結果が通知されるようにする。

通知があることと品質を高めることは直接的には関係ないが、開発者の作業効率が上がるため、間接的に品質を高めることにつながる。

<br>

## 08. エラー解決

### AppProjectが見つからない

argocd-serverまたはapplication-controllerが、Applicationで指定されたAppProjectを見つけられず、以下のエラーを返すことがある。

```bash
Application referencing project foo-project which does not exist
```

<br>

### 削除できない系

#### ▼ Applicationを削除できない

PruneによるKubernetesリソースの削除を有効化し、フォアグラウンドで削除した場合、Applicationが配下にリソースを持たないことにより、Applicationを削除できないことがある。

これらの場合には、以下の手順でApplicationを削除する。

> - https://stackoverflow.com/questions/67597403/argocd-stuck-at-deleting-but-resources-are-already-deleted

`(1)`

: Applicationの`.spec.syncPolicy.allowEmpty`キーを有効化する。

`(2)`

: フォアグラウンドで削除すると、Applicationの`.metadata.finalizers`キーの値に削除中のリソースが設定される。

     この配列を空配列に変更する。ArgoCDのUIからは変更できず、`kubectl patch`コマンドを使用する必要がある。

```bash
$ kubectl patch crd applications.argoproj.io \
    -p '{"metadata":{"finalizers":[]}}' \
    --type=merge
```

> - https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/

`(3)`

: 1つ目の`.spec.syncPolicy.allowEmpty`キーの変更を元に戻す。

#### ▼ Namespaceを削除できない

```bash
$ kubectl patch ns argocd \
    -p '{"metadata":{"finalizers":[]}}' \
    --type=merge
```

<br>

### Helmチャートが大きすぎるとArgoCDがフリーズする

今現在、Helmにはインストールしたチャートのキャッシュを作成する機能がない。

そのため、大きすぎるチャートをArgoCDで使用すると、毎回大きなチャートをインストールすることになり、ArgoCDが高負荷でフリーズすることがある。

Helmで、チャートのキャッシュ機能が実装されれば、ArgoCDのフリーズも解消できるはずである。

> - https://github.com/helm/community/pull/185

<br>

### ConfigMapやSecretの設定変更が反映されない

ArgoCDを使用しない場合と同様にして、ConfigMapやSecretの設定変更を反映する場合、Deployment/StatefulSet/DaemonSetを再起動する必要がある。

<br>

### すでに削除されたPodがポーリングされ続ける

すでに削除したPodをポーリングし続けてしまうことがあり、この場合Podが存在しないため、Podの削除すらできなくなってしまう。

この問題が起こった場合、以下のいずれかで解決する。

- argocd-serverを再起動する。親になるリソースを削除する必要がなく、apply先のClusterには影響がないため、安全な方法である。ArgoCDの使用者に周知しさえすれば問題ない。
- 親になるリソース (Deployment、DaemonSet、など) を一度削除する。ただし、親になるリソースを削除する必要があるため、やや危険である。

<br>

### `Progressing`状態でスタックする

Ingress、StatefulSet、DaemonSet、で特定の設定値を使用していると、ArgoCDの`Progressing`状態でスタックすることがある。

> - https://argo-cd.readthedocs.io/en/stable/faq/#why-is-my-application-stuck-in-progressing-state

<br>

### SyncしてもOutOfSyncステータスが解消されない

Sync後にKubernetesリソースの状態が変更されるような場合、SyncしてもSyncedステータスではなくOutOfSyncステータスになってしまう。

> - https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/
> - https://argo-cd.readthedocs.io/en/stable/faq/#why-is-my-application-still-outofsync-immediately-after-a-successful-sync

<br>

## 09. アーキテクチャ特性の担保

### 可用性の場合

可用性を高めるために、ArgoCDの各コンポーネントを冗長化する。

<br>

## 10. アップグレード

### ArgoCD自体のアップグレード

#### ▼ 対応バージョンについて

ArgoCDのアップグレードでは、ArgoCD自身が動くClusterと、デプロイ先Clusterの両方のバージョンを考慮する必要がある。

ArgoCDのコンポーネントのうちで、argocd-serverはclient-goパッケージを使用して、自身が動くClusterのkube-apiserverと通信する。

一方で、application-controllerも同様にclient-goパッケージ (gitops-engineがこれを持つ) を使用して通信する。

> - https://github.com/argoproj/argo-cd/blob/master/go.mod#L94
> - https://github.com/argoproj/gitops-engine/blob/master/go.mod#L17

ArgoCDでは、CI上でClusterのバージョンをテストしており、CIの実行環境 (K3sを使用している) のバージョンから、テスト済みのClusterのバージョンを確認できる。

例えば、ArgoCDの`v2.7.3`は、K3sの`v1.26.0`/`v1.25.4`/`v1.24.3`/`v1.23.3`に対応しているため、これらのバージョンのClusterで稼働しつつ、マニフェストをデプロイできることが保証されている。

> - https://github.com/argoproj/argo-cd/blob/master/.github/workflows/ci-build.yaml#L359-L462
> - https://github.com/argoproj/argo-cd/tree/master/test/e2e

#### ▼ CRDについて

ArgoCD自体をArgoCDで管理することはできないため、手動やマニフェスト管理ツール (Helm、Kustomize) でArgoCDをアップグレードする必要がある。

特にCRDは、マニフェスト管理ツールで更新できない (作成はできる) 場合がある。

そのため、チャートリポジトリにある該当のディレクトリ配下のCRDのマニフェストを指定し、直接的に更新するようにする。

<br>

### ArgoCDを使用したツールのアップグレード

マニフェストリポジトリやチャートリポジトリの設計によっては、新バージョンのKubernetesリソース名にリビジョン番号がつくようになっていることがある (例：Istioのチャート) 。

この場合、Pruneを無効化した上で、既存のKubernetesリソースをそのままに、新バージョンを新しく作成する。

新バージョンの動作が問題なければ、旧バージョンのKubernetesリソースをPruneで削除する。

<br>

## 11. 権限設定

ArgoCDには、ダッシュボード上から特定の`kubectl`コマンド (`kubectl logs`コマンド、`kubectl exec`コマンド) を実行できる機能がある。

ダッシュボードの操作者にその権限がない場合、権限を絞る必要がある。

<br>

## 12. Prometheusによる監視

ArgoCDはデータポイントを作成し、これをPrometheusで収集できる。

| Prometheusのメトリクス                | メトリクスの種類 | 説明                                                                                        |
| ------------------------------------- | :--------------: | ------------------------------------------------------------------------------------------- |
| `argocd_app_info`                     |      Gauge       | Applicationの状態を表す。                                                                   |
| `argocd_app_k8s_request_total`        |     Counter      | 差分の検出時に、Applicationからポーリング対象Clusterに送信されたリクエスト数を表す。        |
| `argocd_app_labels`                   |      Gauge       | 記入中...                                                                                   |
| `argocd_app_reconcile`                |    Histogram     | Applicationの性能を表す。                                                                   |
| `argocd_app_sync_total`               |     Counter      | ApplicationのSync数を表す。                                                                 |
| `argocd_cluster_api_resource_objects` |      Gauge       | ポーリング対象Clusterに関して、キャッシュしているKubernetesリソースのマニフェスト数を表す。 |
| `argocd_cluster_api_resources`        |      Gauge       | ポーリング対象Clusterに関して、検知しているKubernetesリソースのマニフェスト数を表す。       |
| `argocd_cluster_cache_age_seconds`    |      Gauge       | ポーリング対象Clusterに関して、キャッシュの有効期間を表す。                                 |
| `argocd_cluster_connection_status`    |      Gauge       | ポーリング対象Clusterに関して、現在の接続状態を表す。                                       |
| `argocd_cluster_events_total`         |     Counter      | ポーリング対象Clusterに関して、イベントの合計数を表す。                                     |
| `argocd_cluster_info`                 |      Gauge       | ポーリング対象Clusterの状態を表す。                                                         |
| `argocd_kubectl_exec_pending`         |      Gauge       | ArgoCDのexecのPending数を表す。                                                             |
| `argocd_kubectl_exec_total`           |     Counter      | ArgoCDのexecの合計数を表す。                                                                |
| `argocd_redis_request_duration`       |    Histogram     | Redisへのリクエストのレイテンシーを表す。                                                   |
| `argocd_redis_request_total`          |     Counter      | Redisへのリクエスト数を表す。                                                               |

> - https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/#Monitoring-and-Alerting
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/metrics/

<br>

## 13. CDパイプライン

### デプロイ

ArgoCD自体はArgoCD以外でデプロイする必要がある。

GitOpsを採用できないため、CIOpsになる。

本番環境に対して、ローカルマシンまたはCIツール (例：GitHub Actions、CircleCI、GitLab CI) を使用して、ArgoCDをデプロイする。

> - https://developer.mamezou-tech.com/oss-intro/setup-helmfile/

<br>

## 14. マルチテナント

### ArgoCDでテナント分割が必要な理由

異なるClusterをデプロイ先とするArgoCDを同じClusterで管理する場合、ArgoCDはNamespace単位でテナント分割できない。

ArgoCDのコンポーネント (特に、application-controller、argocd-server) には、ClusterスコープなKubernetesリソース (例：ClusterRoleの認可スコープを紐づける) が必要である。

そのため、NamespaceごとにArgoCDのコンポーネントを分割したとしても、argocd-serverが異なるNamespaceのapplication-controllerの処理結果を取得してしまい、想定外のエラーが起こる。

そこで、異なるCluster用のArgoCDを単一のClusterで管理する場合、以下方法でマルチテナントを実現する。

> - https://akuity.io/blog/argo-cd-architectures-explained/

<br>

### AppProjectを使用する場合

単一Cluster上に複数のAppProjectを作成し、これを単位としてArgoCDを作成する。

各テナントは、ArgoCDを共有する。

この場合、高負荷になるためレプリカ数や並行処理数などを考慮する必要がある。

> - https://github.com/argoproj/argo-cd/issues/11116
> - https://techblog.zozo.com/entry/measure-argocd-introduction
> - https://zenn.dev/hodagi/articles/2bc3fa10df186c

<br>

### 仮想Cluster単位の場合

単一Cluster内に仮想Cluster (例：vcluster) を構築し、これを単位としてArgoCDを作成する。

各テナントは、ArgoCDを共有しない。

> - https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/

<br>

### 実Cluster単位の場合

テナントごとに異なる実Clusterを作成し、これを単位としてArgoCDを作成する。

各テナントは、ArgoCDを共有しない。

<br>
