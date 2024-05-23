---
title: 【IT技術の知見】ArgoCD＠CNCF
description: ArgoCD＠CNCFの知見を記録しています。
---

# ArgoCD＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ArgoCDの仕組み

### アーキテクチャ

ArgoCDは、argocd-server、repo-server、redis-server、dex-server、application-controller、といったコンポーネントから構成される。

永続化するためのDBを持っておらず、ステートレスである。

![argocd_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/drawio/blog/argocd/argocd_architecture.png)

> - https://www.amazon.co.jp/dp/1617297275
> - https://blog.searce.com/argocd-gitops-continuous-delivery-approach-on-google-kubernetes-engine-2a6b3f6813c0
> - https://www.techmanyu.com/setup-a-gitops-deployment-model-on-your-local-development-environment-with-k3s-k3d-and-argocd-4be0f4f30820
> - https://lab.mo-t.com/blog/kubernetes-argocd

<br>

## 02. repo-server

### repo-serverとは

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/05/02/145115
> - https://www.ibm.com/blogs/solutions/jp-ja/container-cocreation-center-23/
> - https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/#Argo-CD-Architecture
> - https://weseek.co.jp/tech/95/#i-7
> - https://medium.com/@outlier.developer/getting-started-with-argocd-for-gitops-kubernetes-deployments-fafc2ad2af0
> - https://www.amazon.co.jp/dp/1617297275

<br>

## 03. application-controller

### application-controllerとは

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/05/02/145115
> - https://medium.com/geekculture/argocd-deploy-your-first-application-414d2a1692cf
> - https://weseek.co.jp/tech/95/#i-7
> - https://medium.com/@outlier.developer/getting-started-with-argocd-for-gitops-kubernetes-deployments-fafc2ad2af0
> - https://www.amazon.co.jp/dp/1617297275

<br>

### GitOpsエンジン

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/05/02/145115
> - https://github.com/argoproj/gitops-engine/tree/master/pkg
> - https://github.com/argoproj/argo-cd/tree/master/pkg/apiclient

<br>

### 他のコンポーネントとの通信

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/05/02/145115
> - https://www.ibm.com/blogs/solutions/jp-ja/container-cocreation-center-23/
> - https://medium.com/geekculture/argocd-deploy-your-first-application-414d2a1692cf
> - https://weseek.co.jp/tech/95/#i-7
> - https://medium.com/@outlier.developer/getting-started-with-argocd-for-gitops-kubernetes-deployments-fafc2ad2af0

<br>

## 04. redis-server

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/05/02/145115
> - https://weseek.co.jp/tech/95/
> - https://blog.manabusakai.com/2021/04/argo-cd-cache/
> - https://medium.com/geekculture/argocd-deploy-your-first-application-414d2a1692cf

<br>

## 05. dex-server

### dex-serverとは

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/05/02/145115
> - https://github.com/dexidp/dex#connectors
> - https://weseek.co.jp/tech/95/
> - https://qiita.com/superbrothers/items/1822dbc5fc94e1ab5295
> - https://zenn.dev/onsd/articles/a3ea24b01da413

<br>

## 06. argocd-server (argocd-apiserver)

### argocd-serverとは

> - https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/#Argo-CD-Architecture
> - https://weseek.co.jp/tech/95/#i-7
> - https://medium.com/@outlier.developer/getting-started-with-argocd-for-gitops-kubernetes-deployments-fafc2ad2af0

<br>

### 他のコンポーネントとの通信

> - https://hiroki-hasegawa.hatenablog.jp/entry/2023/05/02/145115

<br>

### ログ

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

<br>

### 拡張機能

#### ▼ Argo Rolloutsの場合

Argo Rolloutsをダッシュボードで操作する場合、執筆時点 (2023/05/24) で拡張機能としてインストールする必要がある。

> - https://github.com/argoproj-labs/rollout-extension

<br>

## 07. image-updater

### image-updaterとは

image-updaterを採用しない場合、GitOpsのステップの中で、マニフェストリポジトリ上にプルリクエストを作成するステップがある。

![gitops_without-image-updater](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/gitops_without-image-updater.png)

一方で、image-updaterを採用すると、GitOpsのステップの中で、マニフェストリポジトリ上にプルリクエストを作成するステップを省略できる。

![gitops_with-image-updater](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/gitops_with-image-updater.png)

image-updaterは、アプリリポジトリからイメージリポジトリにコンテナイメージをプッシュした後、イメージリポジトリの更新を検知し、Cluster内のマニフェストを自動的に書き換える。

その後、マニフェストリポジトリに書き換えをコミットする。

> - https://zenn.dev/nekoshita/articles/02c1e59a487fb4

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

`/tmp/_argocd-repo/<URLに基づくUUID>`ディレクトリ配下で、`helm template`コマンドを使用してSecretの値を確認する。

この時、`nl`コマンドを使用すると、作成したマニフェストの行数を表示できる。

```bash
$ kubectl -it exec foo-argocd-repo-server \
    -c repo-server \
    -n foo \
    -- bash -c "cd /tmp/_argocd-repo/<URLに基づくUUID> && helm template . -f foo-values.yaml | nl"
```

> - https://github.com/argoproj/argo-cd/issues/1446#issue-432385992
> - https://github.com/argoproj/argo-cd/issues/5145#issuecomment-754931359

<br>

## 08. ユースケース

### 共通

#### ▼ 基本構成

指定したブランチのコードの状態をポーリングする。

プッシュによってコードが変更された場合、Kubernetesの状態をこれにSyncする。

![argocd](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd.png)

> - https://blog.vpantry.net/2021/01/cicd-2/
> - https://qiita.com/kanazawa1226/items/bb760bddf8bd594379cb
> - https://blog.argoproj.io/introducing-argo-cd-declarative-continuous-delivery-for-kubernetes-da2a73a780cd

#### ▼ 検証

Applicationさえ削除しなければ、Kubernetesリソースをダッシュボード上からマニフェストを修正したり、Kubernetesリソースを削除しても、これが差分として認識される。

そのため、Syncすれば元の状態に戻る。

こういった点でも、ArgoCDを入れる方が、Kubernetesの修正の検証がしやすい。

注意点として、マニフェストに何かを追加するような変更は差分として認識されないため、Syncしても元に戻らない。

> - https://qiita.com/masahata/items/e22b0d30b77251b941d8

<br>

### アプリケーションリポジトリ起点

#### ▼ テンプレート構成管理ツールを使用しない場合

![argocd_eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_eks.png)

`(1)`

: アプリケーションリポジトリで、開発者がアプリケーションの変更を`main`ブランチにマージする。

`(2)`

: CIツールが、コンテナイメージをECRにプッシュする。

`(3)`

: CIツールは、マニフェストリポジトリをクローンし、マニフェストのコンテナイメージのハッシュ値を変更する。

     このマニフェストの変更は、`yq`コマンドなどで直接的に実行する。

     変更したマニフェストをマニフェストリポジトリにプッシュする。

`(4)`

: プルリクエストを自動作成する。

`(5)`

: マニフェストリポジトリで、リリース責任者がプルリクエストを`main`ブランチにマージする。

`(6)`

: ArgoCDがマニフェストの変更を検知し、Kubernetesにプルする。

> - https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part1.html

#### ▼ テンプレート構成管理ツールを使用した場合

![argocd_eks_helm](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_eks_helm.png)

`(1)`

: 同じ

`(2)`

: 同じ

`(3)`

: CIツールは、マニフェストリポジトリをクローンし、チャート内のマニフェストのコンテナイメージのハッシュ値を変更する。

     このマニフェストの変更は、`yq`コマンドなどで直接的に実行する。

`(4)`

: 同じ

`(5)`

: 同じ

`(6)`

: ArgoCDがマニフェストの変更を検知し、Kubernetesにプルする。

> - https://medium.com/riskified-technology/how-to-build-a-ci-cd-process-that-deploys-on-kubernetes-and-focuses-on-developer-independence-7dc4c20984a
> - https://docs.microsoft.com/ja-jp/azure/architecture/microservices/ci-cd-kubernetes

<br>

### マニフェストリポジトリ起点

![argocd_gcp](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_gcp.png)

`(1)`

: マニフェストリポジトリで、開発者がマニフェストの変更を`main`ブランチにマージする。

`(2)`

: マニフェストリポジトリで、リリース責任者がマニフェストやチャートの変更を`main`ブランチにマージする。

`(3)`

: ArgoCDがマニフェストの変更を検知し、Kubernetesにプルする。

> - https://qiita.com/Nishi53454367/items/4a4716dfbeebd70295d1

<br>

### チャートリポジトリ起点

記入中...

<br>
