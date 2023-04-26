---
title: 【IT技術の知見】ArgoCD＠CNCFプロジェクト
description: ArgoCD＠CNCFプロジェクトの知見を記録しています。
---

# ArgoCD＠CNCFプロジェクト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ArgoCDの仕組み

### アーキテクチャ

ArgoCDは、argocd-server、repo-server、redis-server、dex-server、application-controller、といったコンポーネントから構成される。

永続化するためのDBを持っておらず、ステートレスである。

![argocd_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_architecture.png)

> ↪️ 参考：
>
> - https://www.amazon.co.jp/dp/1617297275
> - https://blog.searce.com/argocd-gitops-continuous-delivery-approach-on-google-kubernetes-engine-2a6b3f6813c0
> - https://www.techmanyu.com/setup-a-gitops-deployment-model-on-your-local-development-environment-with-k3s-k3d-and-argocd-4be0f4f30820
> - https://lab.mo-t.com/blog/kubernetes-argocd

<br>

## 02. argocd-server (argocd-apiserver)

### argocd-serverとは

『argocd-apiserver』ともいう。

argocd-serverは、クライアントや他のargocdコンポーネントと通信する。

```yaml
{
  "grpc.method": "Watch",
  "grpc.request.claims": "<アカウントの情報>",
  "grpc.request.content": {"name": "foo"},
  "grpc.service": "application.ApplicationService",
  "grpc.start_time": "2023-01-27T07:08:59Z",
  "level": "info",
  "msg": "...",
  "span.kind": "server",
  "system": "grpc",
  "time": "2023-01-27T07:08:59Z",
}
```

> ↪️ 参考：
>
> - https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/#Argo-CD-Architecture
> - https://weseek.co.jp/tech/95/#i-7
> - https://medium.com/@outlier.developer/getting-started-with-argocd-for-gitops-kubernetes-deployments-fafc2ad2af0

<br>

### 他のコンポーネントとの通信

#### ▼ クライアントとの通信

argocd-serverは、クライアントからHTTPSリクエストを受信する。

RESTful-APIとRPC-APIのエンドポイントを公開し、クライアント (例：ダッシュボード、`argocd`コマンド実行者、Webhookの送信元、など) からリクエストを受信する。

また、application-controllerから返却された情報 (例：マニフェストの差分) をクライアントに返却する。

ダッシュボードを使用する場合、これをServiveで後悔する必要がある。

![argocd_argocd-server_dashboard](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_argocd-server_dashboard.png)

#### ▼ dex-serverとの通信

argocd-serverは、dex-serverにHTTPSリクエストを送信する。

SSOを採用する時に、SSOの認証認可処理の認証フェーズを外部のIDプロバイダー (例：Auth0、GitHub、KeyCloak、AWS Cognito、Google Auth) に委譲できる。

この時、認証情報 (例：クライアントID、クライアントシークレット、など) を直接的にIDプロバイダーに送信するのではなく、SSOプロキシであるdex-serverを介して送信できる。

argocd-serverの認証認可処理は、AuthN (認証) と AuthZ (認可) から構成されている。

このAuthNの処理でdex-serverに認証情報を送信すると、dex-serverが適切なIDプロバイダーから認証フェーズの処理結果を取得してくれる。

SSO時、argocd-serverは、AuthNの認証処理をIDプロバイダーに委譲する。

argocd-serverは、AuthZで認可処理を実施し、IDプロバイダーから取得したユーザーに認可スコープを紐づける。

![argocd_auth_architecture.jpg](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_auth_architecture.jpg)

> ↪️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/developer-guide/architecture/authz-authn.md

#### ▼ ポーリング対象Clusterのkube-apiserverとの通信

argocd-serverは、ポーリング対象Clusterのkube-apiserverにHTTPSリクエストを送信する。

クライアントから受信したリクエスト (例：ダッシュボード上のSync、`argocd app sync`コマンド) に基づいて、kube-apiserverにリクエストを送信する。

#### ▼ redis-serverとの通信

argocd-serverは、redis-serverにTCPリクエストを送信し、redis-serverからキャッシュを取得する。

その都度、repo-server上のポーリング対象リポジトリのマニフェストを使用するのではなく、redis-serverのキャッシュを使用する。

ダッシュボード上や`argocd app get --hard-refresh`コマンドでキャッシュを削除できる。

<br>

## 03. application-controller

### application-controllerとは

![argocd_application-controller.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_application-controller.png)

custom-controllerかつポーリング対象Clusterの`kubectl`クライアントとして動作する。

ArgoCDのカスタムリソース (例：Application、AppProject、など) とCRDをポーリングし、etcd上にある宣言通りに作成/変更する。

また、ダッシュボードやCUIの操作に応じて、ポーリング対象Clusterに`kubectl diff`コマンドや`kubectl apply`コマンドを実行する。

```yaml
# application-controllerのPodでログを確認してみる。
{
  "application": "foo-application",
  "dest-name": "",
  "dest-namespace": "foo",
  "dest-server": "https://kubernetes.default.svc",
  "fields.level": 3,
  "level": "info",
  "msg": "Reconciliation completed",
  "time": "2023-01-27T04:19:18Z",
  "time_ms": 14,
}
```

> ↪️ 参考：
>
> - https://medium.com/geekculture/argocd-deploy-your-first-application-414d2a1692cf
> - https://weseek.co.jp/tech/95/#i-7
> - https://medium.com/@outlier.developer/getting-started-with-argocd-for-gitops-kubernetes-deployments-fafc2ad2af0
> - https://www.amazon.co.jp/dp/1617297275

<br>

### GitOpsエンジン

ArgoCDや、その他のGitOpsのためのCDツール (例：Flux) は、gitops-engineパッケージをコールし、ヘルスチェックからデプロイまでの基本的な処理を実行する。

```yaml
gitops-engine
├── pkg
│   ├── cache
│   ├── diff   # リポジトリとClusterの間のマニフェストの差分を検出する。ArgoCDのDiff機能に相当する。
│   ├── engine # 他のパッケージを使い、一連の処理を実行する。
│   ├── health # Clusterのステータスをチェックする。ArgoCDのヘルスチェック機能に相当する。
│   ├── sync   # Clusterにマニフェストをデプロイする。ArgoCDのSync機能に相当する。
│   └── utils  # 他のパッケージに汎用的な関数を提供する。
│
...
```

> ↪️ 参考：
>
> - https://github.com/argoproj/gitops-engine/blob/master/specs/design-top-down.md#design-details
> - https://github.com/argoproj/gitops-engine/tree/master/pkg
> - https://github.com/argoproj/argo-cd/tree/master/pkg/apiclient

<br>

### 他のコンポーネントとの通信

#### ▼ repo-serverとの通信

application-controllerは、repo-serverにHTTPSリクエストを送信し、マニフェストの成果物の作成をコールする。

また、repo-serverが保管するマニフェストのキャッシュを参照し、ポーリング対象Clusterに対して`kubectl diff`コマンドを実行することにより、差分を検出する。

そのため、もしArgoCDでHelmを使用していたとしても、カスタムリソースのマニフェストの差分を検出できる (通常、Helmではカスタムリソースのマニフェストの差分を検出できない) 。

![argocd_application-controller_repo-server.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_application-controller_repo-server.png)

> ↪️ 参考：
>
> - https://www.ibm.com/blogs/solutions/jp-ja/container-cocreation-center-23/
> - https://medium.com/geekculture/argocd-deploy-your-first-application-414d2a1692cf
> - https://weseek.co.jp/tech/95/#i-7
> - https://medium.com/@outlier.developer/getting-started-with-argocd-for-gitops-kubernetes-deployments-fafc2ad2af0

#### ▼ redis-serverとの通信

application-controllerは、redis-serverにTCPリクエストを送信し、自身の処理の結果をredis-serverに保管する。

<br>

## 04. dex-server

### dex-serverとは

ArgoCDでSSOを実施する場合は、外部Webサイトに認証フェーズを委譲することになる。

SSOの認証フェーズに必要な情報をIDプロバイダーに送信し、これに認証フェーズを委譲する。

認証フェーズの委譲先 (例：Auth0、GitHub、KeyCloak、AWS Cognito、Google Auth) は、認証サーバー (例：OIDCであればIDプロバイダー) を公開している。

この時`dex-server`は、ArgoCDが認証サーバーと通信する時のハブとして機能する。

dex-serverの起動に失敗すると、外部Webサイトに情報を送信できずにSSOに失敗してしまう。

ただ、argocd-server自体が認証サーバーと通信することが可能なため、dex-serverを使用するか否かは任意である。

> ↪️ 参考：
>
> - https://github.com/dexidp/dex#connectors
> - https://weseek.co.jp/tech/95/
> - https://qiita.com/superbrothers/items/1822dbc5fc94e1ab5295
> - https://zenn.dev/onsd/articles/a3ea24b01da413

<br>

## 05. image-updater

### image-updaterとは

image-updaterを採用しない場合、GitOpsのステップの中で、マニフェストリポジトリ上にプルリクエストを作成するステップがある。

![gitops_without-image-updater.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/gitops_without-image-updater.png)

一方で、image-updaterを採用すると、GitOpsのステップの中で、マニフェストリポジトリ上にプルリクエストを作成するステップを省略できる。

![gitops_with-image-updater.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/gitops_with-image-updater.png)

image-updaterは、アプリリポジトリからイメージリポジトリにコンテナイメージをプッシュした後、イメージリポジトリの更新を検知し、Cluster内のマニフェストを自動的に書き換える。

その後、マニフェストリポジトリに書き換えをコミットする。

> ↪️ 参考：https://zenn.dev/nekoshita/articles/02c1e59a487fb4

<br>

## 06. redis-server

### redis-serverとは

application-controllerの処理 (マニフェスト取得、Clusterの状態確認、など) の結果のキャッシュを作成し、argocd-serverに提供する。

> ↪️ 参考：
>
> - https://weseek.co.jp/tech/95/
> - https://blog.manabusakai.com/2021/04/argo-cd-cache/
> - https://medium.com/geekculture/argocd-deploy-your-first-application-414d2a1692cf

<br>

## 07. repo-server

### repo-serverとは

![argocd_repo-server.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_repo-server.png)

ポーリング対象リポジトリのマニフェストをクローンし、`/tmp/_argocd-repo/<UUID>`ディレクトリ (`2.3`以前は`/tmp`ディレクトリ) に保管する。

マニフェスト管理ツール (例：Helm、Kustomize) を使用してマニフェストを作成し、またキャッシュを作成する。

そのため、repo-serverは`helm template`コマンドを手動で実行することにより、成果物を確認できる。

```bash
$ kubectl -it exec foo-argocd-repo-server \
    -c repo-server \
    -n foo \
    -- bash -c "ls /_argocd-repo/<UUID>"

# 古いバージョンでは、ディレクトリ名はURLで決まる。
# https://github.com/argoproj/argo-cd/issues/1446#issue-432385992
https___github.com_hiroki-hasegawa_foo-repository

# 新しいバージョンでは、UUIDになる。
# https://github.com/argoproj/argo-cd/discussions/9889#discussioncomment-3093809
*****-*****-*****-*****
```

```bash
$ kubectl -it exec foo-argocd-repo-server \
    -c repo-server \
    -n foo \
    -- bash -c "ls /tmp/_argocd-repo/<UUID>/https___github.com_hiroki-hasegawa_foo-repository"

Chart.yaml  README.md  templates  values.yaml
```

なお、ArgoCDでHardRefreshすると、マニフェストのキャッシュを削除し、ポーリングリポジトリのマニフェストを改めてキャッシュを作成する。

> ↪️ 参考：
>
> - https://www.ibm.com/blogs/solutions/jp-ja/container-cocreation-center-23/
> - https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/#Argo-CD-Architecture
> - https://weseek.co.jp/tech/95/#i-7
> - https://medium.com/@outlier.developer/getting-started-with-argocd-for-gitops-kubernetes-deployments-fafc2ad2af0
> - https://www.amazon.co.jp/dp/1617297275

<br>

### デバッグ

`repo-server`コンテナには`kubectl exec`コマンドでは接続できないが、直接的にコマンドを送信することは可能である。

そのため、デバッグが可能である。

**＊例＊**

プラグインとして使用するためにインストールしたSOPSのバージョンを確認する。

```bash
$ kubectl -it exec foo-argocd-repo-server \
    -c repo-server \
    -n foo \
    -- bash -c "sops --version"
```

**＊例＊**

`/tmp/_argocd-repo/<UUID>/<リポジトリ名>`ディレクトリ配下で、`helm template`コマンドを使用してSecretの値を確認する。

```bash
$ kubectl -it exec foo-argocd-repo-server \
    -c repo-server \
    -n foo \
    -- bash -c "cd /tmp/_argocd-repo/<UUID>/https___github.com_hiroki-hasegawa_foo-repository && helm template foo-chart -f values-prd.yaml"
```

> ↪️ 参考：
>
> - https://github.com/argoproj/argo-cd/issues/1446#issue-432385992
> - https://github.com/argoproj/argo-cd/issues/5145#issuecomment-754931359

<br>

### パフォーマンス改善

#### ▼ 並列処理

単一のリポジトリで管理するApplication数が多くなるほど、repo-serverの性能が落ちる。

この場合、repo-serverの並列処理を有効化した方が良い。

並列処理を有効化しない場合は、代わりにレプリカ数を増やす。

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/high_availability/#monorepo-scaling-considerations
> - https://github.com/argoproj/argo-cd/issues/3282#issue-587535971
> - https://itnext.io/sync-10-000-argo-cd-applications-in-one-shot-bfcda04abe5b
> - https://faun.dev/c/stories/keskad/optimizing-argocd-repo-server-to-work-with-kustomize-in-monorepo/

#### ▼ メモリ拡張

マニフェスト管理ツールの実行時にはメモリ使用量が増加する。

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/high_availability/#argocd-repo-server

<br>

## 08. ユースケース

### 共通

#### ▼ 基本構成

指定したブランチのコードの状態をポーリングする。

プッシュによってコードが変更された場合、Kubernetesの状態をこれにSyncする。

![argocd](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd.png)

> ↪️ 参考：
>
> - https://blog.vpantry.net/2021/01/cicd-2/
> - https://qiita.com/kanazawa1226/items/bb760bddf8bd594379cb
> - https://blog.argoproj.io/introducing-argo-cd-declarative-continuous-delivery-for-kubernetes-da2a73a780cd

#### ▼ 検証

Applicationさえ削除しなければ、Kubernetesリソースをダッシュボード上からマニフェストを修正したり、Kubernetesリソースを削除しても、これが差分として認識される。

そのため、Syncすれば元の状態に戻る。

こういった点でも、ArgoCDを入れる方が、Kubernetesの修正の検証がしやすい。

注意点として、マニフェストに何かを追加するような変更は差分として認識されないため、Syncしても元に戻らない。

> ↪️ 参考：https://qiita.com/masahata/items/e22b0d30b77251b941d8

<br>

### アプリケーションリポジトリ起点

#### ▼ テンプレート構成管理ツールを使用しない場合

![argocd_eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_eks.png)

`【１】`

: アプリケーションリポジトリで、開発者がアプリケーションの変更を`main`ブランチにマージする。

`【２】`

: CIツールが、コンテナイメージをECRにプッシュする。

`【３】`

: CIツールは、マニフェストリポジトリをクローンし、マニフェストのコンテナイメージのハッシュ値を変更する。

     このマニフェストの変更は、`yq`コマンドなどで直接的に実行する。

     変更したマニフェストをマニフェストリポジトリにプッシュする。

`【４】`

: プルリクエストを自動作成する。

`【５】`

: マニフェストリポジトリで、リリース責任者がプルリクエストを`main`ブランチにマージする。

`【６】`

: ArgoCDがマニフェストの変更を検知し、Kubernetesにプルする。

> ↪️ 参考：https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part1.html

#### ▼ テンプレート構成管理ツールを使用した場合

![argocd_eks_helm](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_eks_helm.png)

`【１】`

: 同じ

`【２】`

: 同じ

`【３】`

: CIツールは、マニフェストリポジトリをクローンし、チャート内のマニフェストのコンテナイメージのハッシュ値を変更する。

     このマニフェストの変更は、`yq`コマンドなどで直接的に実行する。

`【４】`

: 同じ

`【５】`

: 同じ

`【６】`

: ArgoCDがマニフェストの変更を検知し、Kubernetesにプルする。

> ↪️ 参考：
>
> - https://medium.com/riskified-technology/how-to-build-a-ci-cd-process-that-deploys-on-kubernetes-and-focuses-on-developer-independence-7dc4c20984a
> - https://docs.microsoft.com/ja-jp/azure/architecture/microservices/ci-cd-kubernetes

<br>

### マニフェストリポジトリ起点

![argocd_gcp](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_gcp.png)

`【１】`

: マニフェストリポジトリで、開発者がマニフェストの変更を`main`ブランチにマージする。

`【２】`

: マニフェストリポジトリで、リリース責任者がマニフェストやチャートの変更を`main`ブランチにマージする。

`【３】`

: ArgoCDがマニフェストの変更を検知し、Kubernetesにプルする。

> ↪️ 参考：https://qiita.com/Nishi53454367/items/4a4716dfbeebd70295d1

<br>

### チャートリポジトリ起点

記入中...

<br>
