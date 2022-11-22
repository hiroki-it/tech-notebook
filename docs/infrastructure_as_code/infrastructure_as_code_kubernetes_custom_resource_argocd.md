---
title: 【IT技術の知見】ArgoCD＠カスタムリソース
description: ArgoCD＠カスタムリソースの知見を記録しています。
---

# ArgoCD＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. ArgoCDの仕組み

### アーキテクチャ

![argocd_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_architecture.png)

argocd-server、repo-server、application-controller、redis-server、dex-server、から構成される。

> ℹ️ 参考：https://blog.searce.com/argocd-gitops-continuous-delivery-approach-on-google-kubernetes-engine-2a6b3f6813c0

```bash
$ kubectl get pod -n argocd

NAME                                    READY   STATUS    RESTARTS   AGE
argocd-server-*****                     1/1     Running   0          1d
argocd-repo-server-*****                1/1     Running   0          1d
argocd-redis-*****                      1/1     Running   0          1d
argocd-application-controller-*****     1/1     Running   0          1d
argocd-dex-server-*****                 1/1     Running   0          1d
```

<br>

### argocd-server

#### ▼ argocd-serverとは

クライアント（```argocd```コマンド実行者）のエンドポイントやダッシュボードを公開し、リクエストに応じて、ArgoCDのApplicationを操作する。また、リポジトリの監視やKubernetes Clusterへのapplyに必要なクレデンシャル情報を管理し、連携可能な認証/認可ツールに認証/認可処理を委譲する。

> ℹ️ 参考：https://weseek.co.jp/tech/95/#i-7

#### ▼ ダッシュボードの公開

![argocd_argocd-server_dashboard](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_argocd-server_dashboard.png)

ワーカーNodeの外からArgoCDのダッシュボードにアクセスできるようにするために、argocd-serverを公開する必要がある。

> ℹ️ 参考：https://techstep.hatenablog.com/entry/2020/11/15/121503

**＊実装例＊**

Ingress + Ingressコントローラー + ClusterIP Serviceがある。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: nginx
  name: argocd-server-ingress
  namespace: argocd
spec:
  rules:
    - host: argocd.foo.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 80
```

<br>

### repo-server

#### ▼ repo-serverとは

監視対象リポジトリを```/tmp```ディレクトリ以下にクローンする。もし、HelmやKustomizeを採用している場合は、これらを実行し、サーバー内にマニフェストを作成する。

> ℹ️ 参考：https://weseek.co.jp/tech/95/#i-7

#### ▼ デバッグ

```repo-server```コンテナには```kubectl exec```コマンドでは接続できないが、直接的にコマンドを送信することは可能である。そのため、デバッグ（例：```/tmp```ディレクトリ配下で、```helm template```コマンドを使用してSecretの値を確認する）が可能である。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/issues/5145#issuecomment-754931359

```bash
$ kubectl exec foo-argocd-repo-server \
    -c repo-server \
    -n argocd \
    -- bash -c "cd /tmp/https___github.com_hiroki-hasegawa_foo-charts && helm template foo-chart -f values-prd.yaml"
```

<br>

### application-controller

#### ▼ application-controllerとは

kube-controllerとして動作し、Applicationの状態がマニフェストの宣言的設定通りになるように制御する。repo-serverからマニフェストを取得し、指定されたKubernetes Clusterにこれを作成する。Applicationが管理するKubernetesリソースのマニフェストと、監視対象リポジトリのマニフェストの間に、差分がないか否かを継続的に監視する。この時、監視対象リポジトリを定期的にポーリングし、もしリポジトリ側に更新があった場合、再Syncを試みる。

> ℹ️ 参考：https://weseek.co.jp/tech/95/#i-7

<br>

### redis-server

#### ▼ redis-serverとは

repo-server内のマニフェストのキャッシュを作成し、これを管理する。ArgoCDでHardRefreshすると、redis-serverのPodを再起動する。

> ℹ️ 参考：
>
> - https://weseek.co.jp/tech/95/
> - https://blog.manabusakai.com/2021/04/argo-cd-cache/

<br>

### dex-server

#### ▼ dex-serverとは

ArgoCDに認証機能を付与し、権限を持つユーザー以外のリクエストを拒否する。

> ℹ️ 参考：
>
> - https://weseek.co.jp/tech/95/
> - https://qiita.com/superbrothers/items/1822dbc5fc94e1ab5295
> - https://zenn.dev/onsd/articles/a3ea24b01da413

<br>

## 01-02. ユースケース

### 共通

#### ▼ 基本構成

![argocd](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd.png)

指定したブランチのコードの状態を監視する。プッシュによってコードが変更された場合、Kubernetesの状態をこれにSyncする。

> ℹ️ 参考：
>
> - https://blog.vpantry.net/2021/01/cicd-2/
> - https://qiita.com/kanazawa1226/items/bb760bddf8bd594379cb
> - https://blog.argoproj.io/introducing-argo-cd-declarative-continuous-delivery-for-kubernetes-da2a73a780cd

#### ▼ 検証

Applicationさえ削除しなければ、Kubernetesリソースをダッシュボード上からマニフェストを修正したり、Kubernetesリソースを削除しても、これが差分として認識される。そのため、Syncすれば元の状態に戻る。こういった点でも、ArgoCDを入れる方が、Kubernetesの修正の検証がしやすい。注意点として、マニフェストに何かを追加するような変更は差分として認識されないため、Syncしても元に戻らない。

> ℹ️ 参考：https://qiita.com/masahata/items/e22b0d30b77251b941d8

<br>

### アプリケーションリポジトリ起点

#### ▼ テンプレート構成管理ツールを使用しない場合

![argocd_eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_eks.png)

（１）アプリケーションリポジトリで、開発者がアプリケーションの変更を```main```ブランチにマージする。

（２）CIツールが、コンテナイメージをECRにプッシュする。

（３）CIツールは、マニフェストリポジトリをクローンし、マニフェストのコンテナイメージのハッシュ値を変更する。このマニフェストの変更は、```yq```コマンドなどで直接的に実行する。変更したマニフェストをマニフェストリポジトリにプッシュする。

（４）プルリクエストを自動作成する。

（５）マニフェストリポジトリで、リリース責任者がプルリクエストを```main```ブランチにマージする。

（６）ArgoCDがマニフェストの変更を検知し、Kubernetesにプルする。

> ℹ️ 参考：https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part1.html

#### ▼ テンプレート構成管理ツールを使用した場合

![argocd_eks_helm](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_eks_helm.png)

（１）同じ

（２）同じ

（３）CIツールは、マニフェストリポジトリをクローンし、チャート内のマニフェストのコンテナイメージのハッシュ値を変更する。このマニフェストの変更は、```yq```コマンドなどで直接的に実行する。

（４）同じ

（５）同じ

（６）ArgoCDがマニフェストの変更を検知し、Kubernetesにプルする。

> ℹ️ 参考：
>
> - https://medium.com/riskified-technology/how-to-build-a-ci-cd-process-that-deploys-on-kubernetes-and-focuses-on-developer-independence-7dc4c20984a
> - https://docs.microsoft.com/ja-jp/azure/architecture/microservices/ci-cd-kubernetes

<br>

### マニフェストリポジトリ起点

![argocd_gcp](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_gcp.png)

（１）マニフェストリポジトリで、開発者がマニフェストの変更を```main```ブランチにマージする。

（２）マニフェストリポジトリで、リリース責任者がマニフェストやチャートの変更を```main```ブランチにマージする。

（３）ArgoCDがマニフェストの変更を検知し、Kubernetesにプルする。


> ℹ️ 参考：https://qiita.com/Nishi53454367/items/4a4716dfbeebd70295d1


<br>

### チャートリポジトリ起点

調査中...

<br>
