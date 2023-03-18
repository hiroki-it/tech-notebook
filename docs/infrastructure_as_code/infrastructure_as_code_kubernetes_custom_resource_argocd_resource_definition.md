---
title: 【IT技術の知見】リソース定義＠ArgoCD
description: リソース定義＠ArgoCDの知見を記録しています。
---

# リソース定義＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ 非チャートとして

非チャートとして、argo-cdリポジトリのマニフェストを送信し、リソースを作成する。

```bash
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/getting_started/
> - https://github.com/argoproj/argo-cd/blob/master/manifests/install.yaml

#### ▼ チャートとして

カスタムリソース定義をHelmの管理外で作成する。

```bash
$ git clone https://github.com/argoproj/argo-cd

$ kubectl diff -k ./manifests/crds

$ kubectl apply -k ./manifests/crds
```

これは、URLで指定しても良い。

```bash
$ kubectl diff -k "https://github.com/argoproj/argo-cd//manifests/crds?ref=<タグ>"

$ kubectl apply -k "https://github.com/argoproj/argo-cd//manifests/crds?ref=<タグ>"
```

例えば、argocd-cdチャートの`5.26.0`を使用する場合、これはArgoCDの`2.6.5`に対応しているため、以下の値で適用する。

```bash
$ kubectl diff -k "https://github.com/argoproj/argo-cd//manifests/crds?ref=v2.6.5"

$ kubectl apply -k "https://github.com/argoproj/argo-cd//manifests/crds?ref=v2.6.5"
```

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://argoproj.github.io/argo-helm

$ helm repo update

$ kubectl create namespace argocd

$ helm install <リリース名> <チャートリポジトリ名>/argo-cd -n argocd --version <バージョンタグ>
```

> ↪️ 参考：https://github.com/argoproj/argo-helm/tree/main/charts/argo-cd#installing-the-chart

<br>

### アンインストール

#### ▼ argocdコマンドを使用して

ArgoCDのApplicationを削除する。`--cascade`オプションを有効化すると、ArgoCDのApplication自体と、Application配下のKubernetesリソースの両方を連鎖的に削除できる。

反対に無効化すると、Applicationのみを単体で削除する。

```bash
$ argocd app delete <ArgoCDのアプリケーション名> --cascade=false
```

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/faq/
> - https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/

#### ▼ `kubectl`コマンドを使用して

ArgoCDのApplicationを削除する。

```bash
$ kubectl delete app <ArgoCDのアプリケーション名>
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/#deletion-using-kubectl

<br>

## 01-02. ダッシュボード

### ネットワークに公開しない場合

#### ▼ `kubectl`コマンドを使用して

`【１】`

: 既存のServiceをLoadBalancer Serviceに変更する。

```bash
$ kubectl patch service argocd-server \
    -n argocd \
    -p '{"spec": {"type": "LoadBalancer"}}'
```

`【２】`

: Kubernetes上のArgoCDダッシュボードのパスワードを取得する。

```bash
$ kubectl get secret argocd-initial-admin-secret \
    -n argocd \
    -o jsonpath="{.data.password}" | base64 -d; echo
```

`【３】`

: `443`番ポートにルーティングできるロードバランサーを作成する。

     この時、IngressとIngressコントローラーを作成するか、```kubectl port-forward```コマンドなど実行することにより、ダッシュボードにアクセスする。

     ```minikube tunnel```ではポート番号を指定できないことに注意する。

```bash
# Serviceの情報を使用してPodを指定し、ダッシュボードにアクセスできるようにする。
$ kubectl port-forward svc/argocd-server -n argocd 8080:443

# ホストポートを介してPodのポートにアクセスする。
$ curl http://127.0.0.1:8080
```

#### ▼ `argocd`コマンドを使用して

`【１】`

: `argocd`コマンドをインストールする。

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/cli_installation/

```bash
$ curl -L -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64

$ chmod +x /usr/local/bin/argocd
```

`【２】`

: ArgoCDにログインする。ユーザー名とパスワードを要求されるため、これらを入力する。

```bash
$ argocd login 127.0.0.1:8080

Username: admin
password: pass
'admin:login' logged in successfully
```

<br>

### ネットワークに公開する場合

#### ▼ 共通の手順

![argocd_argocd-server_dashboard](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_argocd-server_dashboard.png)

Nodeの外からArgoCDのダッシュボードをネットワークに公開する場合、Node外からargocd-serverにインバウンド通信が届くようにする必要がある。

Ingressを作成する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  namespace: argocd
  name: argocd-ingress
spec:
  ingressClassName: foo-ingress-class
  rules:
    # ドメインを割り当てる場合、Hostヘッダーの合致ルールが必要である。
    - host: foo.argocd.com
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

ClusterIP Serviceを作成する。

```yaml
apiVersion: v1
kind: Service
metadata:
  namespace: argocd
  name: foo-argocd-service
spec:
  clusterIP: *.*.*.*
  clusterIPs:
    - *.*.*.*
  internalTrafficPolicy: Cluster
  ipFamilies:
    - IPv4
  ipFamilyPolicy: SingleStack
  ports:
    - name: http-foo
      nodePort: 31000
      port: 80
      protocol: TCP
    - name: https-foo
      nodePort: 31001
      port: 443
      protocol: TCP
  selector:
    app.kubernetes.io/name: foo-argocd
  sessionAffinity: None
  type: ClusterIP
```

> ↪️ 参考：https://techstep.hatenablog.com/entry/2020/11/15/121503

#### ▼ 開発環境の場合

IngressClassを作成する。

開発環境では、IngressClassとしてNginxを使用する。

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-ingress-class
spec:
  controller: k8s.io/ingress-nginx
```

#### ▼ 本番環境

IngressClassを作成する。

本番環境では、クラウドプロバイダーのIngressClass (AWS ALB、GCP CLB) を使用する。

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-ingress-class
spec:
  controller: ingress.k8s.aws/alb
```

また、IngressClass (AWS ALB、GCP CLB) に接続できるように、ドメインレジストリ (Route53、CloudDNS) にArgoCDのドメインを登録する。

<br>

## 02. Application

### Applicationとは

#### ▼ Kuberneresリソースの監視

Kubernetesのカスタムリソースから定義される。

監視対象のKubernetesリソースやカスタムリソースを設定する。

> ↪️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/manifests/crds/application-crd.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#multiple-configuration-objects

#### ▼ 自己監視

Application自体もカスタムリソースなため、ApplicationがApplication自身のソースの変更を監視し、Syncできる。

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/latest/operator-manual/declarative-setup/#manage-argo-cd-using-argo-cd
> - https://github.com/argoproj/argo-cd/discussions/7908
> - https://speakerdeck.com/sshota0809/argocd-teshi-xian-suru-kubernetes-niokeruxuan-yan-de-risosuteriharifalseshi-jian?slide=49

#### ▼ 操作の種類

| 操作名       | 説明                                                                                                                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sync         | 監視対象リポジトリとのマニフェストの差分を確認し、差分があれば`kubectl apply`コマンドを実行する。                                                                                                        |
| Refresh      | 監視対象リポジトリとのマニフェストの差分を確認する。差分を確認するのみで、applyは実行しない。                                                                                                            |
| Hard Refresh | redis-serverに保管されているキャッシュを削除する。また、監視対象リポジトリとのマニフェストの差分を確認する。差分を確認するのみで、applyは実行しない。                                                    |
| Restart      | すでにapply済みのKubernetesリソース内のコンテナを再デプロイする。コンテナを再起動するのみで、Kubernetesリソースを作成することはない。<br>↪️ 参考：https://twitter.com/reoring/status/1476046977599406087 |

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/core_concepts/
> - https://github.com/argoproj/argo-cd/discussions/8260

#### ▼ ヘルスステータスの種類

| ステータス名 | 説明                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Healthy      | 全てのKubernetesリソースは正常に稼働している。                                                                                                                         |
| Progressing  | 一部のKubernetesリソースは正常に稼働していないが、リソースの状態が変化中のため、正常になる可能性がある。この状態の場合は、ステータスが他のいずれかになるまで待機する。 |
| Degraded     | 一部のKubernetesリソースは正常に稼働していない。                                                                                                                       |
| Suspended    | 一部のKubernetesリソースは、イベント (例：CronJobなど) が実行されることを待機している。                                                                                |
| Missing      | 記入中...                                                                                                                                                              |
| Unknown      | 記入中...                                                                                                                                                              |

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/health/#way-1-define-a-custom-health-check-in-argocd-cm-configmap

#### ▼ Namespace

Applicationは任意のNamespaceに作成できる。

ただし、ルートのApplicationはargocd-serverと同じNamespaceに配置しないと、UI上にApplicationを表示できない。

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/app-any-namespace/

<br>

### .spec.ignoreDifferences

#### ▼ ignoreDifferencesとは

特定のApplicationのSyncステータス (Synced、OutOfSync) の判定時に、特定のKubernetesリソースの特定の設定値の差分を無視し、OutOfSyncにならないようする。

Sync後にKubernetesリソースが変化するような仕様 (動的な設定値、Jobによる変更、mutating-admissionステップでのWebhook、マニフェストの自動整形、など) の場合に使用する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  ignoreDifferences:
    # KubernetesリソースのAPIグループの名前
    - group: apps
      kind: Deployment
      jsonPointers:
        # .spec.replicas (インスタンス数) の設定値の変化を無視する。
        - /spec/replicas
    - group: autoscaling
      kind: HorizontalPodAutoscaler
      jqPathExpressions:
        # .spec.metrics (ターゲット対象のメトリクス) の自動整形を無視する。
        - /spec/metrics
```

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/#application-level-configuration
> - https://blog.framinal.life/entry/2021/10/04/224722

注意点として、Syncステータスの判定時に無視されるのみで、内部的にSyncは実行されてしまうため、Syncのたびに設定値が元に戻ってしまう。

そこで別途、`.spec.syncPolicy.syncOptions[].RespectIgnoreDifferences`キーも有効にしておくと良い。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  ignoreDifferences: ...

  syncPolicy:
    syncOptions:
      - RespectIgnoreDifferences=true
```

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#respect-ignore-difference-configs
> - https://mixi-developers.mixi.co.jp/update-argocd-to-v2-3-0-d609bbf16662

<br>

### .spec.project

#### ▼ projectとは

アプリケーションのプロジェクト名を設定する。

プロジェクト名は『`default`』は必ず作成する必要がある。

`default`以外のプロジェクトは、認可スコープと紐づけられるように、チーム別や実行環境別に作成すると良い。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: root-application
spec:
  project: root # アプリケーションコンポーネント。その他、実行環境 (dev、stg、prd) がよい。
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-infra-application
spec:
  project: infra # インフラコンポーネント。その他、実行環境 (dev、stg、prd) がよい。
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-app-application
spec:
  project: app # アプリケーションコンポーネント。その他、実行環境 (dev、stg、prd) がよい。
```

> ↪️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

<br>

### .spec.source

#### ▼ sourceとは

リポジトリ (マニフェストリポジトリ、チャートリポジトリ、OCIリポジトリ) の変更を監視し、これらからプルしたマニフェストで`kubectl apply`コマンドを実行。

| リポジトリの種類                                                   | 管理方法                                | マニフェストのapply方法                                                                                                       |
| ------------------------------------------------------------------ | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| マニフェストリポジトリ (例：GitHub内のリポジトリ)                  | マニフェストそのまま                    | ArgoCDで直接的に`kubectl apply`コマンドを実行する。                                                                           |
| チャートリポジトリ (例：ArtifactHub、GitHub Pages、内のリポジトリ) | チャートアーカイブ (`.tgz`形式ファイル) | Helmを使用して、ArgoCDで間接的に`kubectl apply`コマンドを実行する。パラメーターに応じて、内部的に`helm`コマンドが実行される。 |
| OCIリポジトリ (例：ECR内のリポジトリ)                              | チャートアーカイブ (`.tgz`形式ファイル) | Helmを使用して、ArgoCDで間接的に`kubectl apply`コマンドを実行する。パラメーターに応じて、内部的に`helm`コマンドが実行される。 |

> ↪️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

<br>

### .spec.source (マニフェストリポジトリの場合)

#### ▼ directory

監視対象のマニフェストリポジトリのディレクトリ構造に関して設定する。

また、リポジトリにチャートを配置しているがチャートリポジトリとして扱っていない場合、マニフェストリポジトリ内のローカルのチャートとして、監視することもできる。

| 設定項目  | 説明                                                                                                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `include` | `.spec.source.path`キーで指定したディレクトリ内で、特定のマニフェストのみを指定し、kube-apiserverに送信する                                                                       |
| `exclude` | `.spec.source.path`キーで指定したディレクトリ内で、特定のマニフェストを除外し、kube-apiserverに送信する                                                                           |
| `recurse` | `.spec.source.path`キーで指定したディレクトリにサブディレクトリが存在している場合、全てのマニフェストを指定できるように、ディレクトリ内の再帰的検出を有効化するか否かを設定する。 |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    path: ./manifests
    directory:
      recurse: true
```

> ↪️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml#L78
> - https://argo-cd.readthedocs.io/en/stable/user-guide/tool_detection/

#### ▼ path

監視対象のマニフェストリポジトリのディレクトリを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    path: ./manifests
```

マニフェストリポジトリ内のローカルのチャートも監視できる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    path: ./charts
    helm:
      valueFiles:
        - ./values/values-prd.yaml
```

#### ▼ repoURL

監視対象のマニフェストリポジトリのURLを設定する。

パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

#### ▼ targetRevision

監視対象のマニフェストリポジトリのブランチやバージョンタグを設定する。

各実行環境に、実行環境に対応したブランチを指定するマニフェストを定義しておくと良い。

これにより、各実行環境内のApplicationは特定のブランチのみを監視するようになる。

```yaml
# 本番環境のApplication
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
  labels:
    app.kubernetes.io/env: prd
spec:
  source:
    targetRevision: main # 本番環境に対応するブランチ
```

```yaml
# ステージング環境のApplication
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
  labels:
    app.kubernetes.io/env: stg
spec:
  source:
    targetRevision: develop # ステージング環境に対応するブランチ
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

<br>

### .spec.source (チャートレジストリ内リポジトリの場合)

#### ▼ chart

監視対象のチャートレジストリ内のリポジトリにあるチャート名を設定する。

バージョンタグは、`Chart.yaml`ファイルの`name`キーから確認する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    chart: <チャート名>
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications

#### ▼ helm

`helm`コマンドに渡すパラメーターを設定する。

helmfileと同じように`helm`コマンドを宣言的に実行しつつ、実行を自動化できる。

| 設定項目      | 説明                                                                                                                                                                                                                                         | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `releaseName` | リリース名を設定する。多くのチャートではデフォルトでArgoCDの名前をリリース名としており、リリース名はチャート内のKubernetesリソースのプレフィクスになる。予期せぬApplicationの再作成を防ぐにために、`releaseName`を明示的に設定した方が良い。 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `values`      | `helm`コマンドに渡す`values`ファイルの値をハードコーディングする。                                                                                                                                                                           | 執筆時点 (2022/10/31) では、`values`ファイルは、同じチャートリポジトリ内にある必要がある。チャートと`values`ファイルが異なるリポジトリにある場合 (例：チャートはOSSを参照し、`values`ファイルは独自で定義する) 、`valueFiles`オプションの代わりに`values`オプションを使用する。<br>↪️ 参考：<br>・https://github.com/argoproj/argo-cd/issues/2789#issuecomment-624043936 <br>・https://github.com/argoproj/argo-cd/blob/428bf48734153fa1bcc340a975be8c7e3f34c163/docs/operator-manual/application.yaml#L48-L62 <br><br>ただし、Applicationに`values`ファイルをハードコーディングした場合に、共有`values`ファイルと差分`values`ファイルに切り分けて定義できなくなってしまう。そこで、`values`オプションの一部分をHelmのテンプレート機能で動的に出力するようにする。ただし、新機能として複数のリポジトリの`values`ファイルを参照する方法が提案されており、これを使用すれば異なるリポジトリに`values`ファイルがあっても`valueFiles`オプションで指定できるようになる。新機能のリリースあとはこちらを使用した方が良さそう。<br>↪️ 参考：<br>・https://github.com/argoproj/argo-cd/pull/10432 |
| `valueFiles`  | `helm`コマンドに渡す`values`ファイルを設定する。                                                                                                                                                                                             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `version`     | `helm`コマンドのバージョンを設定する。デフォルトでは、`v3`になる。 ArgoCD自体をHelmでセットアップする場合は、インストールするHelmのバージョンを指定できるため、このオプションを使用する必要はない。                                          | ↪️ 参考：<br>・https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#helm-version <br>・https://github.com/argoproj/argo-helm/blob/main/charts/argo-cd/values.yaml#L720-L733                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#helm-plugins
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml#L25
> - https://mixi-developers.mixi.co.jp/argocd-with-helm-fee954d1003c

`helm`コマンドに渡す`values`ファイルの値をハードコーディングする。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    helm:
      releaseName: foo
      values: |
        foo: foo
        bar: bar
        baz: baz
```

監視対象のリポジトリにある`values`ファイルを使用する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    helm:
      releaseName: foo
      valueFiles:
        - ./prd.yaml
```

暗号化された`values`ファイルを使用することもできる。

> ↪️ 参考：https://github.com/camptocamp/argocd-helm-sops-example

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    helm:
      releaseName: foo
      valueFiles:
        # helm-secretsを使用して暗号化されたvaluesファイル
        - ./secrets.yaml
```

あらかじめ、SOPSを使用して、`values`ファイルを暗号化し、キーバリュー型ストレージに設定しておく。

監視対象のリポジトリに`.sops.yaml`ファイルと`secrets`ファイル (キーバリュー型ストレージ) を配置しておく必要がある。

```yaml
# secretsファイル

# キーバリュー型ストレージ
data:
  AWS_ACCESS_KEY: ENC[AES256...
  AWS_SECRET_ACCESS_KEY: ENC[AES256...

sops: ...
```

ArgoCDは暗号化された`values`ファイルを復号化し、チャートをインストールする。

補足としてArgoCD上では、Secretのdataキーは`base64`方式でエンコードされる。

```yaml
# values.yamlファイルの暗号化された値を出力するテンプレートファイル
apiVersion: v1
kind: Secret
metadata:
  name: foo-aws-credentials
type: Opaque
data:
  AWS_ACCESS_KEY: {{.Values.data.AWS_ACCESS_KEY | b64en}} # base64方式でエンコードされる。
  AWS_SECRET_ACCESS_KEY: {{.Values.data.AWS_SECRET_ACCESS_KEY | b64en}}
```

ArgoCDはHelmの`v2`と`v3`の両方を保持している。

リリースするチャートの`.apiVersion`キーの値が`v1`であれば、ArgoCDはHelmの`v2`を使用して、一方で`.apiVersion`キーの値が`v2`であれば、Helmの`v3`を使用するようになっている。

> ↪️ 参考：https://github.com/argoproj/argo-cd/issues/2383#issuecomment-584441681

ArgoCDを介してHelmを実行する場合、内部的には`helm template`コマンドとetcd上のマニフェストを`kubectl diff`コマンドで比較し、生じた差分を`kubectl apply`コマンドを使用してデプロイしている。

```bash
$ helm template . --include-crds | kubectl diff -f -

$ helm template . --include-crds | kubectl apply -f -
```

> ↪️ 参考：
>
> - https://github.com/helm/helm/issues/6930#issuecomment-555242131
> - https://qiita.com/kyohmizu/items/118bf654d0288da2294e

そのため、Helmを手動でマニフェストをリリースする場合とは異なり、カスタムリソースのマニフェストの設定値を変更できる。

一方で、リリース履歴が存在しない。

Helmのリリース履歴の代わりとして、`argocd app history`コマンドで確認できる。

```bash
$ argocd app history <Application名>

ID  DATE                           REVISION
0   2020-04-12 10:22:57 +0900 JST  1.0.0
1   2020-04-12 10:49:14 +0900 JST  <バージョンタグ>
```

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#random-data
> - https://medium.com/@ch1aki/argocd%E3%81%A7helm%E3%82%92%E4%BD%BF%E3%81%86%E6%96%B9%E6%B3%95%E3%81%A8%E6%97%A2%E5%AD%98%E3%81%AErelease%E3%82%92argocd%E7%AE%A1%E7%90%86%E3%81%B8%E7%A7%BB%E8%A1%8C%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95-9108295887
> - https://github.com/argoproj/argo-cd/issues/4537#issuecomment-707997759

#### ▼ repoURL

監視対象のチャートレジストリ内のリポジトリのURLを設定する。

パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。

チャートリポジトリとして扱うために、リポジトリのルート直下に`index.yaml`ファイルと`.tgz`ファイルを配置して、チャートリポジトリとして扱えるようにしておく必要がある。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    # 例えば、GitHub内のGitHub Pagesをチャートリポジトリとして扱う。
    repoURL: https://github.com/hiroki-hasegawa/foo-repository.git
```

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications
> - https://cloud.redhat.com/blog/continuous-delivery-with-helm-and-argo-cd

#### ▼ targetRevision

監視対象のチャートレジストリ内のリポジトリにあるチャートのバージョンタグを設定する。

バージョンタグは、`Chart.yaml`ファイルの`version`キーから確認する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    targetRevision: <バージョンタグ>
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

<br>

### .spec.source (OCIレジストリ内リポジトリの場合)

#### ▼ chart

チャートレジストリと同じ。

#### ▼ helm

チャートレジストリと同じ。

#### ▼ repoURL

監視対象のOCIレジストリ内のリポジトリのURLを設定する。

パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    # 例えば、ECR内のリポジトリをOCIリポジトリとして扱う。
    repoURL: oci://<AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/<チャート名>
```

> ↪️ 参考：https://stackoverflow.com/questions/68219458/connecting-an-app-in-argocd-to-use-a-helm-oci-repository

#### ▼ targetRevision

監視対象のOCIレジストリ内のリポジトリのバージョンタグを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    targetRevision: <バージョンタグ>
```

<br>

### .spec.destination

#### ▼ destinationとは

apply先のKubernetesを設定する。

> ↪️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

#### ▼ namespace

apply先のNamespaceを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  destination:
    namespace: foo-namespace
```

注意点として、Applicationがリポジトリで検知したKubernetesリソースの`metadata.namespace`キーで、別のNamespaceで作成されている場合、そちらが優先される。

> ↪️ 参考：
>
> - https://github.com/argoproj/argo-cd/issues/2280#issuecomment-530030455
> - https://github.com/argoproj/argo-cd/issues/6274#issuecomment-844494318

#### ▼ server

kube-apiserverのURLを設定する。

ArgoCDの稼働しているClusterを指定する場合は、in-cluster (`https://kubernetes.default.svc`) を設定する。

一方で、外部のClusterを指定する場合、これのkube-apiserverのエンドポイントを指定する必要がある。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  destination:
    server: https://kubernetes.default.svc
```

```yaml
# AWS EKSの場合
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  destination:
    # 外部のAWS EKS Clusterのkube-apiserverのエンドポイントを指定する。
    server: https://*****.gr7.ap-northeast-1.eks.amazonaws.com
```

<br>

### .spec.syncPolicy

#### ▼ syncPolicyとは

GitOpsでのリポジトリ (例：GitHub、Helm、など) とKubernetesの間の自動Syncを設定する。

ArgoCDはリポジトリを`3`分間ごとにポーリングしており、このタイミングでリポジトリとの間でマニフェストの状態を同期する。

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml#L113

#### ▼ automated

GitOpsでのリポジトリ (例：GitHub、Helm、など) とKubernetesの間の自動Syncを有効化するか否かを設定する。

開発者には参照権限のみの認可スコープを付与し、ArgoCDの自動Syncを有効化すれば、開発者がデプロイできなくなり、安全性が増す。

また、複数の実行環境ある場合に、Sync漏れを防げる。

| 設定項目     | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 補足                                                                                                                                                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allowEmpty` | Prune中に、Application配下にリソースを検出できなくなると、Pruneは失敗するようになっている。Applicationが空 (配下にリソースがない) 状態を許可するか否かを設定する。                                                                                                                                                                                                                                                                                                                                                                     | ↪️ 参考：<br>・https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-pruning-with-allow-empty-v18<br>・https://stackoverflow.com/questions/67597403/argocd-stuck-at-deleting-but-resources-are-already-deleted |
| `prune`      | リソースを作成しつつ、不要になったリソースを自動削除するか否かを設定する。デフォルトでは、GitHubリポジトリでマニフェストが削除されても、ArgoCDはリソースを自動的に削除しない。開発者の気づかないうちに、残骸のKubernetesリソースが溜まる可能性があるため、有効化した方が良い。`rev:<番号>`という表記があるKubernetesリソースは、`prune`を忘れて新旧バージョンが存在していることを表す。Applicationを削除する時には、Application配下のKubernetesリソースが残骸にならないように、Application配下のKubernetesリソースを先に削除しておく。 | ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-pruning                                                                                                                                         |
| `selfHeal`   | ArgoCD以外の方法でCluster内でマニフェストを変更した場合、リポジトリ (例：GitHub、Helm) の状態に自動Syncする。デフォルトでは、ArgoCD以外の方法で変更しても、自動Syncは実行しない。                                                                                                                                                                                                                                                                                                                                                      | ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-self-healing                                                                                                                                    |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  syncPolicy:
    automated:
      allowEmpty: true
      prune: true
      selfHeal: true
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy

#### ▼ syncOptions

GitOpsでのマニフェストのSync処理の詳細を設定する。

| 設定項目                 | 説明                                                                                                                                                                                     | 補足                                                                                                                                                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CreateNamespace`        | Applicationの作成対象のNamespaceを自動的に作成する。                                                                                                                                     | Namespaceので出どころがわからなくなるため、ArgoCDの`createNamespace`オプションは無効化し、Namespaceのマニフェストを定義しておく方が良い。                                                                                      |
| `Validate`               |                                                                                                                                                                                          |                                                                                                                                                                                                                                |
| `PrunePropagationPolicy` | Sync後に不要になったKubernetesリソースの削除方法を設定する。削除方法は、KubernetesでのKubernetesリソースの削除の仕組みと同様に、バックグラウンド、フォアグラウンド、オルファン、がある。 | ↪️ 参考：<br>・https://www.devopsschool.com/blog/sync-options-in-argo-cd/<br>・https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/ |
| `PruneLast`              | 通常のPruneでは、Syncしながら古いリソースを独立的に削除していく。PruneLastでは、一度全てのKubernetesリソースをSyncしてしまい、正常に稼働した後に古いリソースをまとめて削除していく。     | ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#prune-last                                                                                                                                          |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  syncPolicy:
    syncOptions:
      - CreateNamespace=false
      - PrunePropagationPolicy=background
```

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#sync-options
> - https://dev.classmethod.jp/articles/argocd-for-external-cluster/

<br>

## 03. ApplicationSet

### ApplicationSet

ArgoCDのApplicationは、`1`個のClusterにしかマニフェストを送信できない。

そのため、Clusterの数だけApplicationを個別に管理しなければならない。

一方で、ApplicationSetであれば、異なるClusterに対応するApplicationを一括して管理できる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: guestbook
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - cluster: foo-eks-cluster
            url: https://*****.gr7.ap-northeast-1.eks.amazonaws.com
          - cluster: foo-kubeadm-cluster
            url: https://kubernetes.default.svc
  template:
    metadata:
      # Cluster名を出力する。
      name: "{{cluster}}"
    spec:
      project: default
      source:
        repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
        targetRevision: HEAD
        path: .
      destination:
        # ClusterのURLを出力する。
        server: "{{url}}"
        namespace: foo-namespace
```

> ↪️ 参考：
>
> - https://techstep.hatenablog.com/entry/2021/12/02/085034
> - https://blog.argoproj.io/introducing-the-applicationset-controller-for-argo-cd-982e28b62dc5

<br>

## 04. AppProject

### AppProjectとは

Applicationの責務境界をProjectとして管理する。

同じProject内では、ArgoCDのApplication名は一意にする必要がある。

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#projects

<br>

### sourceNamespace

AppProject配下のKubernetesリソースを作成できるNamespaceを設定する。

ArgoCDのApplicationを作成できるNamespaceは、デフォルトであると`argocd`のため、それ以外を許可するためにも必要である。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd
  namespace: foo # サービス名、など
spec:
  sourceNamespaces:
    - "*"
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/app-any-namespace/#implementation-details

<br>

### sourceRepos

プロジェクト内で監視可能なリポジトリを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # 実行環境名、運用チーム名など
  namespace: foo # サービス名、など
spec:
  sourceRepos:
    - "*"
```

<br>

### description

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # 実行環境名、運用チーム名など
  namespace: foo # サービス名、など
spec:
  description: This is application in prd environment
```

<br>

### destinations

プロジェクトに属するApplicationが指定可能なClusterを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # 実行環境名、運用チーム名など
  namespace: foo # サービス名、など
spec:
  destinations:
    - namespace: "*" # 属するApplictionは、全てのNamespaceにデプロイできる。
      server: https://*****.gr7.ap-northeast-1.eks.amazonaws.com # 属するApplictionは、指定したURLのClusterのみを指定できる。
```

<br>

### clusterResourceWhitelist

プロジェクト内でデプロイ可能なリソースを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # 実行環境名、運用チーム名など
  namespace: foo # サービス名、など
spec:
  clusterResourceWhitelist:
    - group: "*"
      kind: "*"
```

<br>

## 05. ArgoCD Notification

### セットアップ

```bash
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/manifests/install.yaml
```

> ↪️ 参考：https://argocd-notifications.readthedocs.io/en/stable/#getting-started

<br>

## 06. ConfigManagementPlugin

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_custom_resource_argocd_resource_definition_plugin.html

<br>

## 07. Rollout

### .spec.analysis

#### ▼ analysisとは

Progressive Deliveryを使用する場合、詳細を設定する。

> ↪️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

#### ▼ successfulRunHistoryLimit

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-rollout
spec:
  analysis:
    successfulRunHistoryLimit: 10
```

#### ▼ unsuccessfulRunHistoryLimit

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-rollout
spec:
  analysis:
    unsuccessfulRunHistoryLimit: 10
```

<br>

### .spec.strategy

#### ▼ strategyとは

デプロイ手法を設定する。

大前提として、そもそもArgoCDは`kubectl apply`コマンドでリソースを作成しているだけなため、デプロイ手法は、Deploymentの`.spec.strategy`キーや、DaemonSetとStatefulSetの`.spec.updateStrategy`キーの設定値に依存する。

ArgoCDのstrategyオプションを使用することにより、これらのKubernetesリソース自体を冗長化し、より安全にapplyを行える。

#### ▼ blueGreen

![argocd_blue-green-deployment](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_blue-green-deployment.png)

ブルー/グリーンデプロイメントを使用して、新しいPodをリリースする。

| 設定項目                | 説明                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeService`         | 旧環境へのルーティングに使用するServiceを設定する。                                                                                                  |
| `autoPromotionEnabled`  | 旧環境から新環境への自動切り替えを有効化するか否かを設定する。もし無効化した場合、`autoPromotionSeconds`の秒数だけ切り替えを待機する。               |
| `autoPromotionSeconds`  | 旧環境から新環境への切り替えを手動で行う場合、切り替えを待機する最大秒数を設定する。最大秒数が経過すると、自動的に切り替わってしまうことに注意する。 |
| `previewReplicaCount`   | 新環境のPod数を設定する。                                                                                                                            |
| `previewService`        | 新環境へのルーティングに使用するServiceを設定する。                                                                                                  |
| `scaleDownDelaySeconds` |                                                                                                                                                      |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-blue-green-rollout
spec:
  strategy:
    # ブルー/グリーンデプロイメイト
    blueGreen:
      activeService: foo-active-service
      previewService: foo-preview-service
      previewReplicaCount: 1
      autoPromotionEnabled: true
      scaleDownDelaySeconds: 30
```

> ↪️ 参考：
>
> - https://argoproj.github.io/argo-rollouts/features/bluegreen/
> - https://argoproj.github.io/argo-rollouts/concepts/#blue-green
> - https://korattablog.com/2020/06/19/argocd%E3%81%AB%E3%82%88%E3%82%8Bbluegreen%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E3%82%92%E8%A9%A6%E3%81%99/

#### ▼ canary

![argocd_canary-release](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/argocd_canary-release.png)

カナリアリリースを使用して、新しいPodをリリースする。

| キー   | 説明                                                                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `step` | カナリアリリースの手順を設定する。<br>・`setWeight`：新しいPodへの重み付けを設定する。<br>・`pause`：次の手順に移行せずに待機する。待機秒数を設定できる。 |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-canary-rollout
spec:
  strategy:
    # カナリアリリース
    canary:
      steps:
        - setWeight: 25
        - pause:
            duration: 10
```

> ↪️ 参考：
>
> - https://argoproj.github.io/argo-rollouts/features/canary/
> - https://argoproj.github.io/argo-rollouts/concepts/#canary
> - https://korattablog.com/2020/06/19/argocd%E3%81%AEcanary-deployment%E3%82%92%E8%A9%A6%E3%81%99/

<br>

## 08. Workflow

### .spec.entrypoint

#### ▼ entrypointとは

一番最初に使用するテンプレート名を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  namespace: argocd
  generateName: foo-workflow
spec:
  entrypoint: foo-template
```

> ↪️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

<br>

### .spec.templates

#### ▼ templatesとは

パイプラインの処理を設定する。

WorkflowTemplateとして切り分けても良い。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  namespace: argocd
  generateName: foo-workflow
spec:
  entrypoint: foo-template
  templates:
    - name: foo-template
      script:
        - image: alpline:1.0.0
          command: ["/bin/bash", "-c"]
          source: |
            echo "Hello World"
```

> ↪️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

<br>

### .spec.workflowTemplateRef

#### ▼ workflowTemplateRefとは

切り分けたWorkflowTemplateの名前を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  namespace: argocd
  generateName: foo-workflow
spec:
  workflowTemplateRef:
    name: hello-world-workflow-template
```

> ↪️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

<br>

## 09. WorkflowTemplate

### .spec.templates

#### ▼ templatesとは

パイプラインの処理を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  namespace: argocd
  name: hello-world-workflow-template
spec:
  templates:
    - name: foo-template
      script:
        - image: alpline:1.0.0
          cource: |
            echo "Hello World"
```

> ↪️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

#### ▼ script

コンテナをプルし、コンテナ内でスクリプトを実行する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  namespace: argocd
  name: hello-world-workflow-template
spec:
  templates:
    - name: foo-template
      script:
        - image: alpline:1.0.0
          command: ["/bin/bash", "-c"]
          source: |
            echo "Hello World"
```

> ↪️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

#### ▼ steps

> ↪️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

<br>

### ConfigMap

#### ▼ data.trigger

通知条件を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-notification-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  trigger.on-sync-status-unknown: |
    - when: app.status.sync.status == 'Unknown'
      send: [app-sync-status, github-commit-status]
  trigger.sync-operation-change: |
    - when: app.status.operationState.phase in ['Error', 'Failed']
      send: [app-sync-failed, github-commit-status]
  trigger.on-deployed: |
    - when: app.status.operationState.phase in ['Succeeded'] and app.status.health.status == 'Healthy'
      oncePer: app.status.sync.revision
      send: [app-sync-succeeded]
```

> ↪️ 参考：https://zenn.dev/nameless_gyoza/articles/introduction-argocd-notifications#triggers

#### ▼ data.service

通知先のURLを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-notifications-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  service.slack: |
    token: *****
```

> ↪️ 参考：https://zenn.dev/nameless_gyoza/articles/introduction-argocd-notifications#services

#### ▼ data.template

通知内容を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-notifications-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  context: |
    env: prd

  template.a-slack-template-with-context: |
    message: "ArgoCD sync in {{ .context.env }}"
```

> ↪️ 参考：https://zenn.dev/nameless_gyoza/articles/introduction-argocd-notifications#templates

<br>
