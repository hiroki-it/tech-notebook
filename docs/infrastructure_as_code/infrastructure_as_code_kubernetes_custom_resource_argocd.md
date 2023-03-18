---
title: 【IT技術の知見】ArgoCD＠カスタムリソース
description: ArgoCD＠カスタムリソースの知見を記録しています。
---

# ArgoCD＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ArgoCDの仕組み

### アーキテクチャ

ArgoCDは、argocd-server、repo-server、redis-server、dex-server、application-controller、といったコンポーネントから構成される。

![argocd_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_architecture.png)

> ↪️ 参考：
>
> - https://blog.searce.com/argocd-gitops-continuous-delivery-approach-on-google-kubernetes-engine-2a6b3f6813c0
> - https://www.techmanyu.com/setup-a-gitops-deployment-model-on-your-local-development-environment-with-k3s-k3d-and-argocd-4be0f4f30820

<br>

### argocd-server

#### ▼ argocd-serverとは

![argocd_argocd-server_dashboard](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_argocd-server_dashboard.png)

クライアント (`argocd`コマンド実行者) のエンドポイントやダッシュボードを公開する。

自身に対するリクエストに応じて、kube-apiserverにリクエストを送信し、ArgoCDのApplicationを操作する。

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

Applicationから返却された情報 (例：マニフェストの差分) をダッシュボード上に公開する。

リポジトリの監視やClusterへのリクエストに必要なクレデンシャル情報を管理し、連携可能な認証/認可ツールに認証/認可処理を委譲する。

> ↪️ 参考：
>
> - https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/#Argo-CD-Architecture
> - https://weseek.co.jp/tech/95/#i-7
> - https://medium.com/@outlier.developer/getting-started-with-argocd-for-gitops-kubernetes-deployments-fafc2ad2af0

<br>

### repo-server

#### ▼ repo-serverとは

監視対象リポジトリを`/tmp`ディレクトリ以下にクローンする。

もしHelmやKustomizeを採用している場合は、repo-serverは`helm template`コマンドを実行し、Node内にマニフェストを出力する。

```bash
$ kubectl -it exec foo-argocd-repo-server \
    -c repo-server \
    -n argocd \
    -- bash -c "ls -la /tmp"
```

> ↪️ 参考：
>
> - https://akuity.io/blog/unveil-the-secret-ingredients-of-continuous-delivery-at-enterprise-scale-with-argocd-kubecon-china-2021/#Argo-CD-Architecture
> - https://weseek.co.jp/tech/95/#i-7
> - https://medium.com/@outlier.developer/getting-started-with-argocd-for-gitops-kubernetes-deployments-fafc2ad2af0

#### ▼ デバッグ

`repo-server`コンテナには`kubectl exec`コマンドでは接続できないが、直接的にコマンドを送信することは可能である。

そのため、デバッグが可能である。

**＊例＊**

プラグインとして使用するためにインストールしたSOPSのバージョンを確認する。

```bash
$ kubectl -it exec foo-argocd-repo-server \
    -c repo-server \
    -n argocd \
    -- bash -c "sops --version"
```

**＊例＊**

`/tmp/<リポジトリ名>`ディレクトリ配下で、`helm template`コマンドを使用してSecretの値を確認する。

```bash
$ kubectl -it exec foo-argocd-repo-server \
    -c repo-server \
    -n argocd \
    -- bash -c "cd /tmp/https___github.com_hiroki-hasegawa_foo-repository && helm template foo-chart -f values-prd.yaml"
```

> ↪️ 参考：https://github.com/argoproj/argo-cd/issues/5145#issuecomment-754931359

<br>

### application-controller

#### ▼ application-controllerとは

![argocd_application-controller.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_application-controller.png)

カスタムコントローラーとして動作し、ArgoCDのカスタムリソースをカスタムリソース定義の宣言通りに定期的に修復する。

また、監視対象リポジトリ上のマニフェストとetcd上のマニフェストの差分を定期的に検出する。

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

repo-serverが取得したクローンからマニフェストを参照し、`kubectl diff`コマンドを実行することにより、差分を検出する。

そのため、もしArgoCDでHelmを使用していたとしても、カスタムリソースのマニフェストの差分を検出できる (通常、Helmではカスタムリソースのマニフェストの差分を検出できない) 。

kube-apiserverにマニフェストを送信し、指定されたClusterにKubernetesリソースを作成する。

Applicationが管理するKubernetesリソースのマニフェストと、監視対象リポジトリのマニフェストの間に、差分がないか否かを継続的に監視する。

この時、監視対象リポジトリを定期的にポーリングし、もしリポジトリ側に更新があった場合、再Syncを試みる。

> ↪️ 参考：
>
> - https://medium.com/geekculture/argocd-deploy-your-first-application-414d2a1692cf
> - https://weseek.co.jp/tech/95/#i-7
> - https://medium.com/@outlier.developer/getting-started-with-argocd-for-gitops-kubernetes-deployments-fafc2ad2af0

<br>

### redis-server

#### ▼ redis-serverとは

repo-server内のマニフェストのキャッシュを作成し、これを管理する。

ArgoCDでHardRefreshすると、redis-serverのPodを再起動する。

> ↪️ 参考：
>
> - https://weseek.co.jp/tech/95/
> - https://blog.manabusakai.com/2021/04/argo-cd-cache/

<br>

### dex-server

#### ▼ dex-serverとは

ArgoCDでSSOを実施する場合は、外部Webサイトに認証フェーズを委譲することになる。

委譲先 (例：KeyCloak) は、認証サーバー (例：OIDCであればIDプロバイダー) を公開しており、`dex-server`は、ArgoCDが認証サーバーと通信する時のハブとして機能する。

dex-serverの起動に失敗すると、外部Webサイトに情報を送信できずにSSOに失敗してしまう。

ただ、argocd-server自体が認証サーバーと通信することが可能なため、dex-serverを使用するか否かは任意である。

> ↪️ 参考：
>
> - https://weseek.co.jp/tech/95/
> - https://qiita.com/superbrothers/items/1822dbc5fc94e1ab5295
> - https://zenn.dev/onsd/articles/a3ea24b01da413

<br>

## 01-02. マニフェスト

### マニフェストの種類

ArgoCDは、Deployment (argocd-server、repo-server、redis-server、dex-server)、StatefulSet (application-controller)、といったコンポーネントから構成される。

```bash
$ kubectl get deployment -n argocd

NAME                                         READY    UP-TO-DATE   AVAILABLE   AGE
deployment.apps/argocd-dex-server    1/1     1        1            119d
deployment.apps/argocd-redis         1/1     1        1            119d
deployment.apps/argocd-repo-server   1/1     1        1            119d
deployment.apps/argocd-server        1/1     1        1            119d


$ kubectl get statefulset -n argocd

NAME                                                    READY   AGE
statefulset.apps/argocd-application-controller   1/1     119d
```

<br>

### Deployment配下のPod

#### ▼ argocd-server

記入中...

#### ▼ repo-server

記入中...

#### ▼ redis-server

記入中...

#### ▼ dex-server

記入中...

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-dex-server
  namespace: argocd
spec:
  containers:
    - name: dex-server
      image: ghcr.io/dexidp/dex:v2.35.3
      imagePullPolicy: IfNotPresent
      command:
        - /shared/argocd-dex
      args:
        - rundex
      env:
        - name: ARGOCD_DEX_SERVER_DISABLE_TLS
          valueFrom:
            configMapKeyRef:
              name: argocd-cmd-params-cm
              key: dexserver.disable.tls
              optional: true
      ports:
        - name: http
          containerPort: 5556
          protocol: TCP
        - name: grpc
          containerPort: 5557
          protocol: TCP
        - name: metrics
          containerPort: 5558
          protocol: TCP
      resources:
        {}
      securityContext:
        allowPrivilegeEscalation: false
        capabilities:
          drop:
            - ALL
        readOnlyRootFilesystem: false
        runAsNonRoot: false
        seccompProfile:
          type: RuntimeDefault
      volumeMounts:
        - name: static-files
          mountPath: /shared
        - name: dexconfig
          mountPath: /tmp
        - name: argocd-dex-server-tls
          mountPath: /tls

  ...

```

<br>

### StatefulSet

#### ▼ application-controller

記入中...

<br>

## 02. ユースケース

### 共通

#### ▼ 基本構成

指定したブランチのコードの状態を監視する。

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

     このマニフェストの変更は、```yq```コマンドなどで直接的に実行する。

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
