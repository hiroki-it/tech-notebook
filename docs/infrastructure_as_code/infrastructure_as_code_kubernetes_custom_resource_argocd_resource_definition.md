---
title: 【IT技術の知見】リソース定義＠ArgoCD
description: リソース定義＠ArgoCDの知見を記録しています。
---

# リソース定義＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. セットアップ

### インストール

#### ▼ 非チャートとして

非チャートとして、argo-cdリポジトリのマニフェストを送信し、リソースを作成する。

```bash
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```
> ℹ️ 参考：
> 
> - https://argo-cd.readthedocs.io/en/stable/getting_started/
> - https://github.com/argoproj/argo-cd/blob/master/manifests/install.yaml


#### ▼ チャートとして

```bash
$ helm repo add <チャートリポジトリ名> https://argoproj.github.io/argo-helm

$ helm repo update

$ kubectl create namespace argocd

$ helm install <リリース名> <チャートリポジトリ名>/argo-cd -n argocd --version <バージョンタグ>
```

> ℹ️ 参考：https://github.com/argoproj/argo-helm/tree/main/charts/argo-cd#installing-the-chart

<br>


### アンインストール

#### ▼ argocdコマンドを使用して

ArgoCDのApplicationを削除する。```--cascade```キーを有効化すると、ArgoCDのApplication自体と、Application配下のKubernetesリソースの両方を連鎖的に削除できる。反対に無効化すると、Applicationのみを単体で削除する。

```bash
$ argocd app delete <ArgoCDのアプリケーション名> --cascade=false
```


> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/faq/
> - https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/


#### ▼ ```kubectl```コマンドを使用して

ArgoCDのApplicationを削除する。


```bash
$ kubectl delete app <ArgoCDのアプリケーション名>
```

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/#deletion-using-kubectl


<br>

## 01-02. ダッシュボード

### ネットワークに公開しない場合

#### ▼ ```kubectl```コマンドを使用して

（１）既存のServiceをLoadBalancer Serviceに変更する。

```bash
$ kubectl patch service argocd-server \
    -n argocd \
    -p '{"spec": {"type": "LoadBalancer"}}'
```

（２）Kubernetes上のArgoCDダッシュボードのパスワードを取得する。

```bash
$ kubectl get secret argocd-initial-admin-secret \
    -n argocd \
    -o jsonpath="{.data.password}" | base64 -d; echo
```

（３）```443```番ポートにルーティングできるロードバランサーを作成する。この時、IngressとIngressコントローラーを作成するか、```kubectl port-forward```コマンドなど実行することにより、ダッシュボードにアクセスする。```minikube tunnel```ではポート番号を指定できないことに注意する。


```bash
# Serviceの情報を使用してPodを指定し、ダッシュボードにアクセスできるようにする。
$ kubectl port-forward svc/argocd-server -n argocd 8080:443
# ホストポートを介してPodのポートにアクセスする。
$ curl http://127.0.0.1:8080
```

#### ▼ ```argocd```コマンドを使用して

（１）```argocd```コマンドをインストールする。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/cli_installation/

```bash
$ curl -L -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
$ chmod +x /usr/local/bin/argocd
```

（２）ArgoCDにログインする。ユーザー名とパスワードを要求されるため、これらを入力する。

```bash
$ argocd login 127.0.0.1:8080

Username: admin
Password: *****
'admin:login' logged in successfully
```

<br>

### ネットワークに公開する場合

![argocd_argocd-server_dashboard](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_argocd-server_dashboard.png)

Nodeの外からArgoCDのダッシュボードをネットワークに公開する場合、Node外からargocd-serverにインバウンド通信が届くようにする必要がある。

> ℹ️ 参考：https://techstep.hatenablog.com/entry/2020/11/15/121503

**＊実装例＊**

Ingressを作成する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: nginx
  namespace: argocd
  name: argocd-ingress
spec:
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

IngressClassを作成する。

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-nginx-ingress-class
spec:
  controller: k8s.io/ingress-nginx
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

<br>


## 02. Application

### Applicationとは

#### ▼ Kuberneresリソースの監視

Kubernetesのカスタムリソースから定義される。

監視対象のKubernetesリソースやカスタムリソースを設定する。

> ℹ️ 参考：
> 
> - https://github.com/argoproj/argo-cd/blob/master/manifests/crds/application-crd.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#multiple-configuration-objects

#### ▼ 自己監視

Application自体もカスタムリソースなため、ApplicationがApplication自身のソースの変更を監視し、Syncできる。



> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/latest/operator-manual/declarative-setup/#manage-argo-cd-using-argo-cd
> - https://github.com/argoproj/argo-cd/discussions/7908
> - https://speakerdeck.com/sshota0809/argocd-teshi-xian-suru-kubernetes-niokeruxuan-yan-de-risosuteriharifalseshi-jian?slide=49

#### ▼ 操作の種類

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/core_concepts/
> - https://github.com/argoproj/argo-cd/discussions/8260

| 操作名       | 説明                                                                                                                                                      |
|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Sync         | 監視対象リポジトリとのマニフェストの差分を確認し、差分があれば```kubectl apply```コマンドを実行する。                                                                                  |
| Refresh      | 監視対象リポジトリとのマニフェストの差分を確認する。差分を確認するのみで、applyは実行しない。                                                                                           |
| Hard Refresh | redis-serverに保管されているキャッシュを削除する。また、監視対象リポジトリとのマニフェストの差分を確認する。差分を確認するのみで、applyは実行しない。                                                     |
| Restart      | すでにapply済みのKubernetesリソース内のコンテナを再デプロイする。コンテナを再起動するのみで、Kubernetesリソースを作成することはない。<br>ℹ️ 参考：https://twitter.com/reoring/status/1476046977599406087 |

#### ▼ ヘルスステータスの種類


| ステータス名     | 説明                                                                                                            |
|-------------|---------------------------------------------------------------------------------------------------------------|
| Healthy     | 全てのKubernetesリソースは正常に稼働している。                                                                               |
| Progressing | 一部のKubernetesリソースは正常に稼働していないが、リソースの状態が変化中のため、正常になる可能性がある。この状態の場合は、ステータスが他のいずれかになるまで待機する。 |
| Degraded    | 一部のKubernetesリソースは正常に稼働していない。                                                                             |
| Suspended   | 一部のKubernetesリソースは、イベント（例：CronJobなど）が実行されることを待機している。                                                     |
| Missing     | 調査中...                                                                                                       |
| Unknown     | 調査中...                                                                                                       |

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/health/#way-1-define-a-custom-health-check-in-argocd-cm-configmap

<br>

### spec.ignoreDifferences

#### ▼ ignoreDifferencesとは

特定のApplicationのSyncステータス（Synced、OutOfSync）の判定時に、特定のKubernetesリソースの特定の設定値の差分を無視し、OutOfSyncにならないようする。Sync後にKubernetesリソースが変化するような仕様（動的な設定値、Jobによる変更、mutating-admissionステップでのWebhook、マニフェストの自動整形、など）の場合に使用する。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/#application-level-configuration
> - https://blog.framinal.life/entry/2021/10/04/224722

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
        # spec.replicas（インスタンス数）の設定値の変化を無視する。
        - /spec/replicas
    - group: autoscaling
      kind: HorizontalPodAutoscaler
      jqPathExpressions:
        # .spec.metrics（ターゲット対象のメトリクス）の自動整形を無視する。
        - /spec/metrics
```

注意点として、Syncステータスの判定時に無視されるのみで、内部的にSyncは実行されてしまうため、Syncのたびに設定値が元に戻ってしまう。

そこで別途、```RespectIgnoreDifferences```オプションも有効にしておくと良い。



> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#respect-ignore-difference-configs
> - https://mixi-developers.mixi.co.jp/update-argocd-to-v2-3-0-d609bbf16662

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  ignoreDifferences:
  
    ...
  
  syncPolicy:
    syncOptions:
      - RespectIgnoreDifferences=true
```

<br>

### spec.project

#### ▼ projectとは

アプリケーションのプロジェクト名を設定する。

プロジェクト名は『```default```』は必ず作成する必要がある。

```default```以外のプロジェクトは、コンポーネント別や実行環境別に作成すると良い。



> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: root-application
spec:
  project: root # アプリケーションコンポーネント。その他、実行環境（dev、stg、prd）がよい。
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-infra-application
spec:
  project: infra # インフラコンポーネント。その他、実行環境（dev、stg、prd）がよい。
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-app-application
spec:
  project: app # アプリケーションコンポーネント。その他、実行環境（dev、stg、prd）がよい。
```

<br>

### spec.source

#### ▼ sourceとは

リポジトリ（マニフェストリポジトリ、チャートリポジトリ、OCIリポジトリ）の変更を監視し、これらからプルしたマニフェストで```kubectl apply```コマンドを実行。




| リポジトリの種類                                      | 管理方法                      | マニフェストのapply方法                                                                                    |
|-----------------------------------------------|-------------------------------|---------------------------------------------------------------------------------------------------|
| マニフェストリポジトリ（例：GitHub内のリポジトリ）                  | マニフェストそのまま                    | ArgoCDで直接的に```kubectl apply```コマンドを実行する。                                                       |
| チャートリポジトリ（例：ArtifactHub、GitHub Pages、内のリポジトリ） | チャートアーカイブ（```.tgz```形式ファイル） | Helmを使用して、ArgoCDで間接的に```kubectl apply```コマンドを実行する。パラメーターに応じて、内部的に```helm```コマンドが実行される。 |
| OCIリポジトリ（例：ECR内のリポジトリ）                        | チャートアーカイブ（```.tgz```形式ファイル） | Helmを使用して、ArgoCDで間接的に```kubectl apply```コマンドを実行する。パラメーターに応じて、内部的に```helm```コマンドが実行される。 |

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

<br>

### spec.source（マニフェストリポジトリの場合）

#### ▼ directory

監視対象のマニフェストリポジトリのディレクトリ構造に関して設定する。

また、リポジトリにチャートを配置しているがチャートリポジトリとして扱っていない場合、マニフェストリポジトリ内のローカルのチャートとして、監視することもできる。


| 設定項目      | 説明                                                                                                           |
|---------------|--------------------------------------------------------------------------------------------------------------|
| ```include``` | ```path```キーで指定したディレクトリ内で、特定のマニフェストのみを指定し、kube-apiserverに送信する                                         |
| ```exclude``` | ```path```キーで指定したディレクトリ内で、特定のマニフェストを除外し、kube-apiserverに送信する                                           |
| ```recurse``` | ```path```キーで指定したディレクトリにサブディレクトリが存在している場合、全てのマニフェストを指定できるように、ディレクトリ内の再帰的検出を有効化するか否かを設定する。 |

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



> ℹ️ 参考：
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



> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

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

#### ▼ targetRevision

監視対象のマニフェストリポジトリのブランチやバージョンタグを設定する。

各実行環境に、実行環境に対応したブランチを指定するマニフェストを定義しておくと良い。

これにより、各実行環境内のApplicationは特定のブランチのみを監視するようになる。



> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

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

<br>

### spec.source（チャートレジストリ内リポジトリの場合）

#### ▼ chart

監視対象のチャートレジストリ内のリポジトリにあるチャート名を設定する。

バージョンタグは、```Chart.yaml```ファイルの```name```キーから確認する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications

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

#### ▼ helm

```helm```コマンドに渡すパラメーターを設定する。

helmfileと同じように```helm```コマンドを宣言的に実行しつつ、実行を自動化できる。



| 設定項目          | 説明                                                                                                                     | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|-------------------|------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```releaseName``` | リリース名を設定する。多くのチャートではデフォルトでArgoCDの名前をリリース名としてしまうため、これを上書きするために```releaseName```を設定した方が良い。                               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ```values```      | ```helm```コマンドに渡す```values```ファイルの値をハードコーディングする。                                                                       | 執筆時点（2022/10/31）では、```values```ファイルは、同じチャートリポジトリ内にある必要がある。チャートと```values```ファイルが異なるリポジトリにある場合（例：チャートはOSSを参照し、```values```ファイルは独自で定義する）、```valueFiles```オプションの代わりに```values```オプションを使用する。<br>ℹ️ 参考：<br>・https://github.com/argoproj/argo-cd/issues/2789#issuecomment-624043936  <br>・https://github.com/argoproj/argo-cd/blob/428bf48734153fa1bcc340a975be8c7e3f34c163/docs/operator-manual/application.yaml#L48-L62 <br><br>ただし、Applicationに```values```ファイルをハードコーディングした場合に、共有```values```ファイルと差分```values```ファイルに切り分けて定義できなくなってしまう。そこで、```values```オプションの一部分をHelmのテンプレート機能で動的に出力するようにする。ただし、新機能として複数のリポジトリの```values```ファイルを参照する方法が提案されており、これを使用すれば異なるリポジトリに```values```ファイルがあっても```valueFiles```オプションで指定できるようになる。新機能のリリースあとはこちらを使用した方が良さそう。<br>ℹ️ 参考：<br>・https://github.com/argoproj/argo-cd/pull/10432 |
| ```valueFiles```  | ```helm```コマンドに渡す```values```ファイルを設定する。                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ```version```     | ```helm```コマンドのバージョンを設定する。デフォルトでは、```v3```になる。 ArgoCD自体をHelmでセットアップする場合は、インストールするHelmのバージョンを指定できるため、このオプションを使用する必要はない。 | ℹ️ 参考：<br>・https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#helm-version <br>・https://github.com/argoproj/argo-helm/blob/main/charts/argo-cd/values.yaml#L720-L733                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |


> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#helm-plugins
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml#L25
> - https://mixi-developers.mixi.co.jp/argocd-with-helm-fee954d1003c


```helm```コマンドに渡す```values```ファイルの値をハードコーディングする。



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

監視対象のリポジトリにある```values```ファイルを使用する。



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

暗号化された```values```ファイルを使用することもできる。



> ℹ️ 参考：https://github.com/camptocamp/argocd-helm-sops-example

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

あらかじめ、sopsを使用して、```values```ファイルを暗号化し、キーバリュー型ストレージに設定しておく。

監視対象のリポジトリに```.sops.yaml```ファイルと```secrets```ファイル（キーバリュー型ストレージ）を配置しておく必要がある。



```yaml
# secretsファイル

# キーバリュー型ストレージ
data:
  AWS_ACCESS_KEY: ENC[AES256...
  AWS_SECRET_ACCESS_KEY: ENC[AES256...

sops:
  ...
```

ArgoCDは暗号化された```values```ファイルを復号化し、チャートをインストールする。

なおArgoCD上では、Secretのdataキーは```base64```方式でエンコードされる。



```yaml
# values.yamlファイルの暗号化された値を出力するテンプレートファイル
apiVersion: v1
kind: Secret
metadata:
  name: foo-aws-credentials
type: Opaque
data:
  AWS_ACCESS_KEY: {{ .Values.data.AWS_ACCESS_KEY | b64en }} # base64方式でエンコードされる。
  AWS_SECRET_ACCESS_KEY: {{ .Values.data.AWS_SECRET_ACCESS_KEY | b64en }}
```

ArgoCDはHelmの```v2```と```v3```の両方を保持している。

リリースするチャートの```apiVersion```キーの値が```v1```であれば、ArgoCDはHelmの```v2```を使用して、一方で```apiVersion```キーの値が```v2```であれば、Helmの```v3```を使用するようになっている。



> ℹ️ 参考：https://github.com/argoproj/argo-cd/issues/2383#issuecomment-584441681

ArgoCDを介してHelmを実行する場合、内部的には```helm template```コマンドとetcd上のマニフェストを```kubectl diff```コマンドで比較し、生じた差分を```kubectl apply```コマンドを使用してデプロイしている。

そのため、Helmを手動でマニフェストをリリースする場合とは異なり、カスタムリソースのマニフェストの設定値を変更できる。

一方で、リリース履歴が存在しない。

Helmのリリース履歴の代わりとして、```argocd app history```コマンドで確認できる。



```bash
$ helm template . | kubectl diff
```

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#random-data
> - https://qiita.com/kyohmizu/items/118bf654d0288da2294e
> - https://medium.com/@ch1aki/argocd%E3%81%A7helm%E3%82%92%E4%BD%BF%E3%81%86%E6%96%B9%E6%B3%95%E3%81%A8%E6%97%A2%E5%AD%98%E3%81%AErelease%E3%82%92argocd%E7%AE%A1%E7%90%86%E3%81%B8%E7%A7%BB%E8%A1%8C%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95-9108295887
> - https://github.com/argoproj/argo-cd/issues/4537#issuecomment-707997759

```bash
$ argocd app history <Application名>

ID  DATE                           REVISION
0   2020-04-12 10:22:57 +0900 JST  1.0.0
1   2020-04-12 10:49:14 +0900 JST  <バージョンタグ>
```

#### ▼ repoURL

監視対象のチャートレジストリ内のリポジトリのURLを設定する。

パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。

チャートリポジトリとして扱うために、リポジトリのルート直下に```index.yaml```ファイルと```.tgz```ファイルを配置して、チャートリポジトリとして扱えるようにしておく必要がある。



> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications
> - https://cloud.redhat.com/blog/continuous-delivery-with-helm-and-argo-cd

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    # 例えば、GitHub内のGitHub Pagesをチャートリポジトリとして扱う。
    repoURL: https://github.com/hiroki.hasegawa/foo-repository
```

#### ▼ targetRevision

監視対象のチャートレジストリ内のリポジトリにあるチャートのバージョンタグを設定する。

バージョンタグは、```Chart.yaml```ファイルの```version```キーから確認する。


> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

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

### spec.source（OCIレジストリ内リポジトリの場合）

#### ▼ chart

チャートレジストリと同じ。



#### ▼ helm

チャートレジストリと同じ。



#### ▼ repoURL

監視対象のOCIレジストリ内のリポジトリのURLを設定する。

パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。



> ℹ️ 参考：https://stackoverflow.com/questions/68219458/connecting-an-app-in-argocd-to-use-a-helm-oci-repository

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  # 例えば、ECR内のリポジトリをOCIリポジトリとして扱う。
  repoURL: oci://<アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/<チャート名>
```

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


### spec.destination

#### ▼ destinationとは

apply先のKubernetesを設定する。



> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

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

#### ▼ server

kube-apiserverのURLを設定する。

Kubernetesの実行環境としてEKSやGKEを採用している場合、これのkube-apiserverのエンドポイントを指定する必要がある。

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
# EKSの場合
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  destination:
    # EKSのkube-apiserverのエンドポイントを指定する。
    server: https://*****.gr7.ap-northeast-1.eks.amazonaws.com
```

<br>

### spec.syncPolicy

#### ▼ syncPolicyとは

GitOpsでのリポジトリ（GitHub、Helm）とKubernetesの間の自動Syncを設定する。



> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml#L113

#### ▼ automated

GitOpsでのリポジトリ（例：GitHub、Helm、など）とKubernetesの間の自動Syncを有効化するか否かを設定する。

開発者には参照権限のみの認可スコープを付与し、ArgoCDの自動Syncを有効化すれば、開発者がデプロイできなくなり、安全性が増す。




| 設定項目         | 説明                                                                                                                                                                                                                       | 補足                                                                                                                                                                                                                           |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```prune```      | リソースを作成しつつ、不要になったリソースを自動削除するか否かを設定する。デフォルトでは、GtiHubリポジトリでマニフェストが削除されても、ArgoCDはリソースを自動的に削除しない。開発者の気づかないうちに、残骸のKubernetesリソースが溜まる可能性があるため、有効化した方が良い。```rev:n```という表記があるKubernetesリソースは、```prune```を忘れて新旧バージョンが存在していることを表す。 | ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-pruning                                                                                                                                       |
| ```selfHeal```   | Kubernetes側に変更があった場合、リポジトリ（GitHub、Helm）の状態に戻すようにする。デフォルトでは、Kubernetesリソースを変更しても、リポジトリの状態に戻すための自動Syncは実行されない。                                                                                                             | ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-self-healing                                                                                                                                  |
| ```allowEmpty``` | Prune中に、Application配下にリソースを検出できなくなると、Pruneは失敗するようになっている。Applicationが空（配下にリソースがない）状態を許可するか否かを設定する。                                                                                                                        | ℹ️ 参考：<br>・https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-pruning-with-allow-empty-v18<br>・https://stackoverflow.com/questions/67597403/argocd-stuck-at-deleting-but-resources-are-already-deleted |

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

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy


#### ▼ syncOptions

GitOpsでのマニフェストのSync処理の詳細を設定する。



| 設定項目                     | 説明                                                                                                                               | 補足                                                                                                                                                                                                                        |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```CreateNamespace```        | Applicationの作成対象のNamespaceを自動的に作成する。 | Namespaceので出どころがわからなくなるため、ArgoCDの```createNamespace```オプションは無効化し、Namespaceのマニフェストを定義しておく方が良い。                                                                                                                                  |
| ```Validate```               |                                                                                                                                    |                                                                                                                                                                                                                           |
| ```PrunePropagationPolicy``` | Sync後に不要になったKubernetesリソースの削除方法を設定する。削除方法は、KubernetesでのKubernetesリソースの削除の仕組みと同様に、バックグラウンド、フォアグラウンド、オルファン、がある。   | ℹ️ 参考：<br>・https://www.devopsschool.com/blog/sync-options-in-argo-cd/<br>・https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/ |
| ```PruneLast```              | 通常のPruneでは、Syncしながら古いリソースを独立的に削除していく。PruneLastでは、一度全てのKubernetesリソースをSyncしてしまい、正常に稼働した後に古いリソースをまとめて削除していく。      | ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#prune-last                                                                                                                                        |

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


> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#sync-options
> - https://dev.classmethod.jp/articles/argocd-for-external-cluster/


<br>

## 03. ApplicationSet

### ApplicationSet

ArgoCDのApplicationは、```1```個のKubernetes Clusterにしかマニフェストを送信できない。

そのため、二重管理になってしまうが、同じ設定値のApplicationをKubernetes Clusterに作成しなければならない。

一方で、ApplicationSetであれば、対応するKubernetes ClusterごとにApplicationを自動作成してくれる。



> ℹ️ 参考：
> 
> - https://techstep.hatenablog.com/entry/2021/12/02/085034
> - https://blog.argoproj.io/introducing-the-applicationset-controller-for-argo-cd-982e28b62dc5

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
      name: '{{cluster}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
        targetRevision: HEAD
        path: .
      destination:
        # ClusterのURLを出力する。
        server: '{{url}}'
        namespace: foo-namespace
```

<br>

## 04. AppProject

### AppProjectとは

Applicationの責務境界をProjectとして管理する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#projects

### sourceRepos

プロジェクト内で監視可能なリポジトリを設定する。



```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # その他、運用チーム名など
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
  name: prd # その他、運用チーム名など
spec:
  description: This is application in prd environment
```

<br>

### destinations

プロジェクト内でデプロイ先として指定可能なスコープを設定する。



```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # その他、運用チーム名など
spec:
  destinations:
    - namespace: "*" # 全てのNamespaceにデプロイできる。
      server: https://kubernetes.default.svc
```

<br>

### clusterResourceWhitelist

プロジェクト内でデプロイ可能なリソースを設定する。



```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # その他、運用チーム名など
spec:
  clusterResourceWhitelist:
    - group: "*"
      kind: "*"
```


<br>


## 05. Rollout

### spec.analysis

#### ▼ analysisとは

Progressive Deliveryを使用する場合、詳細を設定する。



> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

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

### spec.strategy

#### ▼ strategyとは

デプロイ手法を設定する。

大前提として、そもそもArgoCDは```kubectl apply```コマンドでリソースを作成しているだけなため、デプロイ手法は、Deploymentの```.spec.strategy```キーや、DaemonSetとStatefulSetの```.spec.updateStrategy```キーの設定値に依存する。

ArgoCDのstrategyオプションを使用することにより、これらのKubernetesリソース自体を冗長化し、より安全にapplyを行える。



#### ▼ blueGreen

![argocd_blue-green-deployment](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_blue-green-deployment.png)

ブルー/グリーンデプロイメントを使用して、新しいPodをリリースする。



| 設定項目                    | 説明                                                                                                           |
|-----------------------------|----------------------------------------------------------------------------------------------------------------|
| ```activeService```         | 旧環境へのルーティングに使用するServiceを設定する。                                                                           |
| ```autoPromotionEnabled```  | 旧環境から新環境への自動切り替えを有効化するか否かを設定する。もし無効化した場合、```autoPromotionSeconds```の秒数だけ切り替えを待機する。  |
| ```autoPromotionSeconds```  | 旧環境から新環境への切り替えを手動で行う場合、切り替えを待機する最大秒数を設定する。最大秒数が経過すると、自動的に切り替わってしまうことに注意する。 |
| ```previewReplicaCount```   | 新環境のPod数を設定する。                                                                                           |
| ```previewService```        | 新環境へのルーティングに使用するServiceを設定する。                                                                           |
| ```scaleDownDelaySeconds``` |                                                                                                                |

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


> ℹ️ 参考：
>
> - https://argoproj.github.io/argo-rollouts/features/bluegreen/
> - https://argoproj.github.io/argo-rollouts/concepts/#blue-green
> - https://korattablog.com/2020/06/19/argocd%E3%81%AB%E3%82%88%E3%82%8Bbluegreen%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E3%82%92%E8%A9%A6%E3%81%99/


#### ▼ canary

![argocd_canary-release](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_canary-release.png)

カナリアリリースを使用して、新しいPodをリリースする。



| キー         | 説明                                                                                                                      |
|------------|-------------------------------------------------------------------------------------------------------------------------|
| ```step``` | カナリアリリースの手順を設定する。<br>・```setWeight```：新しいPodへの重み付けを設定する。<br>・```pause```：次の手順に移行せずに待機する。待機秒数を設定できる。 |

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


> ℹ️ 参考：
>
> - https://argoproj.github.io/argo-rollouts/features/canary/
> - https://argoproj.github.io/argo-rollouts/concepts/#canary
> - https://korattablog.com/2020/06/19/argocd%E3%81%AEcanary-deployment%E3%82%92%E8%A9%A6%E3%81%99/


<br>

## 06 Workflow

### spec.entrypoint

#### ▼ entrypointとは

一番最初に使用するテンプレート名を設定する。



> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  namespace: argocd
  generateName: foo-workflow
spec:
  entrypoint: foo-template
```

<br>

### spec.templates

#### ▼ templatesとは

パイプラインの処理を設定する。

WorkflowTemplateとして切り分けても良い。



> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

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

<br>

### spec.workflowTemplateRef

#### ▼ workflowTemplateRefとは

切り分けたWorkflowTemplateの名前を設定する。



> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

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

<br>

## 07. WorkflowTemplate

### spec.templates

#### ▼ templatesとは

パイプラインの処理を設定する。



> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

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

#### ▼ script

コンテナをプルし、コンテナ内でスクリプトを実行する。



> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

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

#### ▼ steps

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

<br>

## 08. ArgoCD Notification

### セットアップ

> ℹ️ 参考：https://argocd-notifications.readthedocs.io/en/stable/#getting-started

```bash
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/manifests/install.yaml
```

<br>

### ConfigMap

#### ▼ data.trigger

通知条件を設定する。



> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/introduction-argocd-notifications#triggers

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

#### ▼ data.service

通知先のURLを設定する。



> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/introduction-argocd-notifications#services

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

#### ▼ data.template

通知内容を設定する。



> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/introduction-argocd-notifications#templates

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

<br>


## 09. 専用ConfigMap

ArgoCDの各コンポーネントの機密でない変数やファイルを管理する。

ConfigMapでは、```.metadata.labels```キー配下に、必ず```app.kubernetes.io/part-of: argocd```キーを割り当てる必要がある。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#atomic-configuration

<br>

## 09-02. argocd-cm（必須）

### argocd-cmとは

ArgoCDの各コンポーネントで共通する値を設定する。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-cm.yaml

<br>

### カスタムリソースの設定

#### ▼ resource.customizations.ignoreDifferences.all

ArgoCD全体で```.spec.ignoreDifferences```キーと同じ機能を有効化する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/#system-level-configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  resource.customizations.ignoreDifferences.all: |
    jsonPointers:
      # spec.replicas（インスタンス数）の設定値の変化を無視する。
      - /spec/replicas
    jqPathExpressions:
      # .spec.metrics（ターゲット対象のメトリクス）の自動整形を無視する。
      - /spec/metrics
```

#### ▼ repositories

ConfigMapでリポジトリのURLを管理する方法は、将来的に廃止される予定である。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#legacy-behaviour


<br>

### OIDCの設定

#### ▼ 委譲先Webサイトに直接的に接続する場合

ArgoCDから認証の委譲先のWebサイトに情報を直接的に接続する。

OIDCに必要なクライアントIDやクライアントシークレット（例：KeyCloakで発行されるもの、GitHubでOAuthAppsを作成すると発行される）を設定する。

ここでは、プライベートなマニフェストリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。


> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#existing-oidc-provider
> - https://argo-cd.readthedocs.io/en/stable/user-guide/external-url/


```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
data:
  admin.enabled: "true"
  # OIDCに必要なIDやトークンを設定する。
  oidc.config: |
    connectors:
      - type: github
        id: github
        name: GitHub SSO
        config:
          clientID: *****
          clientSecret: *****
        # 委譲先のWebサイトがOIDCのリクエストを待ち受けるURLを設定する。
        redirectURI: https://example.com/api/dex
  # ArgoCDのダッシュボードのNode外公開URLを設定する。
  # 開発環境では、https://localhost:8080
  url: <URL>
```


#### ▼ Dexを介して委譲先Webサイトに接続する場合

ArgoCDから認証の委譲先のWebサイトに直接的に接続するのではなく、ハブとしてのDexを使用する。

Dexは```dex-server```コンテナとして稼働させる。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#oidc-configuration-with-dex
> - https://dexidp.io/docs/connectors/oidc/
> - https://argo-cd.readthedocs.io/en/stable/user-guide/external-url/

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
data:
  admin.enabled: "true"
  # OIDCに必要なIDやトークンを設定する。
  dex.config: |
    connectors:
      - type: github
        id: github
        name: GitHub SSO
        config:
          clientID: *****
          clientSecret: *****
        # 委譲先のWebサイトがOIDCのリクエストを待ち受けるURLを設定する。
        redirectURI: https://example.com/api/dex
  # ArgoCDのダッシュボードのNode外公開URLを設定する。
  # 開発環境では、https://localhost:8080
  url: <URL>
```

<br>


## 09-03. argocd-cmd-params-cm

### argocd-cmd-params-cmとは

ArgoCDの各コンポーネント（application-controller、dex-server、redis-server、repo-server）で個別に使用する値を設定する。

<br>

### 設定

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmd-params-cm
  namespace: argocd
data:
  controller.log.format: text
  controller.log.level: warn
  controller.operation.processors: "10"
  controller.repo.server.timeout.seconds: "60"
  controller.self.heal.timeout.seconds: "5"
  controller.status.processors: "20"
  otlp.address: ""
  redis.server: argocd-redis:6379
  repo.server: argocd-repo-server:8081
  reposerver.log.format: text
  reposerver.log.level: warn
  reposerver.parallelism.limit: "0"
  server.basehref: /
  server.dex.server: https://argocd-dex-server:5556
  server.dex.server.strict.tls: "false"
  server.disable.auth: "false"
  server.enable.gzip: "false"
  server.insecure: "false"
  server.log.format: text
  server.log.level: warn
  server.repo.server.strict.tls: "false"
  server.rootpath: ""
  server.staticassets: /shared/app
  server.x.frame.options: sameorigin
```

> ℹ️ 参考：
> 
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-cmd-params-cm.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/server-commands/additional-configuration-method/

<br>

## 09-04. argocd-rbac-cm

ArgoCDを構成するKubernetesリソースにアクセスするための認可スコープを紐づける。

> ℹ️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-rbac-cm.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/

<br>

### 認可スコープの設定

Casbinの記法を使用して、```.csv```形式で認可スコープを定義する。

ダッシュボードやCLIでArgoCDを操作する時に使用する。

| 記号    | 説明                 |
|---------|--------------------|
| ```p``` | ロールに認可スコープを紐付ける。 |
| ```g``` | グループにロールを紐付ける。     |


> ℹ️ 参考：
> 
> - https://stackoverflow.com/a/73784100
> - https://github.com/argoproj/argo-cd/blob/master/assets/model.conf

<br>

### ArgoCDで認証する場合

ロールに付与するポリシーの認可スコープは、プロジェクト単位にするとよい。

管理チーム単位でプロジェクトを作成した上で、プロジェクト配下のみ認可スコープを持つロールを定義する。

これにより、その管理チームに所属するエンジニアしかSyncできなくなる。

**＊実装例＊**

以下のように、ロールと認可スコープを紐づける。

- ```admin```ロールに全ての認可スコープ
- ```app```ロールに```app```プロジェクト配下の全ての認可スコープ
- ```infra```ロールに```infra```プロジェクト配下の全ての認可スコープ

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  # デフォルトのロール
  policy.default: role:readonly
  policy.csv: |
    # ロールに認可スコープを紐づける。
    p, role:admin, *, *, *, allow
    p, role:app, *, *, app/*, allow
    p, role:infra, *, *, infra/*, allow
    
    # グループにロールを紐づける。
    g, admin, role:admin
    g, app-team, role:app
    g, infra-team, role:infra
  scopes: '[groups]'
```

> ℹ️ 参考：
>
> - https://krrrr.hatenablog.com/entry/2022/01/23/201700
> - https://qiita.com/dtn/items/9bcae313b8cb3583977e#argocd-cm-rbac-configmap-%E3%81%AE%E4%BD%9C%E6%88%90
> - https://github.com/argoproj/argo-cd/blob/master/assets/builtin-policy.csv
> - https://weseek.co.jp/tech/95/#SSO_RBAC

<br>

### ArgoCDの認証を外部Webサイトに委譲する場合（SSOの場合）

#### ▼ 外部Webサイトのチームに紐づける場合

以下のように、ロールと認可スコープを紐づける。

- ```admin```ロールに全ての認可スコープ
- ```app```ロールに```app```プロジェクト配下の全ての認可スコープ
- ```infra```ロールに```infra```プロジェクト配下の全ての認可スコープ

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  # デフォルトのロール
  policy.default: role:readonly
  policy.csv: |
    # ロールに認可スコープを紐づける。
    p, role:admin, *, *, *, allow
    p, role:app, *, *, app/*, allow
    p, role:infra, *, *, infra/*, allow
    
    # グループにロールを紐づける。
    g, example-org.github.com:admin, role:admin
    g, example-org.github.com:app-team, role:app
    g, example-org.github.com:infra-team, role:infra
  scopes: '[groups]'
```

> ℹ️ 参考：
>
> - https://hatappi.blog/entry/2020/08/23/025033
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/#tying-it-all-together
> - https://github.com/argoproj/argo-cd/blob/master/assets/builtin-policy.csv


#### ▼ 外部Webサイトのメールアドレスに紐づける場合

以下のように、ロールと認可スコープを紐づける。

- ```admin```ロールに全ての認可スコープ
- ```app```ロールに```app```プロジェクト配下の全ての認可スコープ
- ```infra```ロールに```infra```プロジェクト配下の全ての認可スコープ

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  # デフォルトのロール
  policy.default: role:readonly
  policy.csv: |
    # ロールに認可スコープを紐づける。
    p, role:admin, *, *, *, allow
    p, role:app, *, *, app/*, allow
    p, role:infra, *, *, infra/*, allow
    
    # グループにロールを紐づける。
    g, admin@gmail.com, role:admin
    g, app-team@gmail.com, role:app
    g, infra-team@gmail.com, role:infra
  scopes: '[email]'
```

> ℹ️ 参考：
> 
> - https://hatappi.blog/entry/2020/08/23/025033
> - https://github.com/argoproj/argo-cd/blob/master/assets/builtin-policy.csv

<br>

## 09-05. argocd-tls-cets-cm

リポジトリをHTTPSプロコトルで監視するために、argocd-serverで必要なSSL証明書を設定する。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-tls-certs-cm.yaml



<br>

## 09-06. argocd-ssh-nown-hosts-cm

SSH公開鍵認証でリポジトリに接続して監視する場合に、argocd-serverで必要な```known_hosts```ファイルを設定する。

```known_hosts```ファイルには、SSHプロコトルに必要なホスト名や秘密鍵を設定する。


```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-ssh-known-hosts-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  ssh_known_hosts: |
    bitbucket.org ssh-rsa AAAAB ...
    github.com ecdsa-sha2-nistp256 AAAAE ...
    github.com ssh-ed25519 AAAAC ...
    github.com ssh-rsa AAAAB ...
    gitlab.com ecdsa-sha2-nistp256 AAAAE ...
    gitlab.com ssh-ed25519 AAAAC ...
    gitlab.com ssh-rsa AAAAB ...
    ssh.dev.azure.com ssh-rsa AAAAB ...
    vs-ssh.visualstudio.com ssh-rsa AAAAB ...
```


> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-ssh-known-hosts-cm.yaml

<br>


## 10. 専用Role

ArgoCDのコンポーネント（application-controller、argocd-server、repo-server、dex-server）によっては、kube-apiserverにリクエストを送信する必要がある。

そのため、コンポーネントに紐づけるためのRoleを作成する。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: argocd
  name:  argocd-application-controller
  labels:
    app.kubernetes.io/part-of: argocd
rules:
  - apiGroups:
      - ""
    resources:
      - secrets
      - configmaps
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - argoproj.io
    resources:
      - applications
      - appprojects
    verbs:
      - create
      - get
      - list
      - watch
      - update
      - patch
      - delete
  - apiGroups:
      - ""
    resources:
      - events
    verbs:
      - create
      - list
```

<br>


## 11. 専用RoleBinding

ServiceAccountとRoleを紐づけるために、RoleBindingを作成する。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  namespace: argocd
  name: argocd-argocd-repo-server
  labels:
    app.kubernetes.io/part-of: argocd
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: argocd-application-controller
subjects:
  - kind: ServiceAccount
    name: argocd-application-controller
    namespace: argocd
```

<br>


## 12. 専用Job

### metadata

#### ▼ generateName

```Sync```フェーズフック名を設定する。



> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/#generate-name

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  generateName: foo-hook
```

<br>

### metadata.annotations

#### ▼ argocd.argoproj.io/hook

フックを設定する```Sync```フェーズ（Sync前、Sync時、Syncスキップ時、Sync後、Sync失敗時）を設定する。



> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/#usage
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/#sync-phases-and-waves

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail # Sync失敗時
```

#### ▼ argocd.argoproj.io/sync-wave

同じ```Sync```フェーズに実行するように設定したフックが複数ある場合、これらの実行の優先度付けを設定する。

正負の数字を設定でき、数字が小さい方が優先される。

優先度が同じ場合、ArgoCDがよしなに順番を決めてしまう。



> ℹ️ 参考：
>
> - https://weseek.co.jp/tech/95/
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/#how-do-i-configure-waves

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/sync-wave: -1 # 優先度-1（3個の中で一番優先される。）
```

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/sync-wave: 0 # 優先度0（デフォルトで0になる。）
```

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/sync-wave: 1 # 優先度1
```

<br>



## 13. 専用Secret

ArgoCDの各種コンポーネントの機密な変数やファイルを管理する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#atomic-configuration

<br>


## 13-02. argocd-repo


### argocd-repoとは

ArgoCDがプライベートリポジトリを監視する時に必要な認証情報を設定する。

```argocd-repo-creds```とは異なり、```1```個の認証情報で```1```個のリポジトリにアクセスできるようにする。


パブリックリポジトリの場合は、不要である。


> ℹ️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-repositories.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories

<br>


### ```.metadata.labels```キー

#### ▼ ```argocd.argoproj.io/secret-type```キー（必須）

Secretタイプは```repository```とする。

監視対象のプライベートなマニフェストリポジトリ、チャートレジストリ、OCIレジストリの認証情報を設定する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories

<br>

### マニフェストリポジトリの場合

#### ▼ 注意点

プライベートなマニフェストリポジトリの認証情報を設定する。

プライベートなマニフェストレジストリごとに、異なるSecretで認証情報を設定する必要がある。

ただし、監視する複数のリポジトリが、全て```1```個のマニフェストレジストリ内にある場合は、Secretは```1```個でよい。



> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repository-credentials
> - https://speakerdeck.com/satokota/2-argocdniyorugitopstodeployguan-li?slide=42

#### ▼ Basic認証の場合

Basic認証に必要なユーザー名とパスワードを設定する。

ここでは、プライベートなマニフェストリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
# foo-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-repository # マニフェストリポジトリ名
  url: https://github.com:hiroki-hasegawa/foo-manifest.git
  type: git
  # Basic認証に必要なユーザー名とパスワードを設定する。
  username: hiroki-it
  password: *****
---
# bar-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: bar-repository # マニフェストリポジトリ名
  url: https://github.com:hiroki-hasegawa/bar-manifest.git
  type: git
  # Basic認証に必要なユーザー名とパスワードを設定する。
  username: hiroki-it
  password: *****
```

#### ▼ SSH公開鍵認証の場合

SSH公開鍵認証に必要な秘密鍵を設定する。

ここでは、プライベートなマニフェストリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。



```yaml
# foo-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-repository # マニフェストリポジトリ名
  url: git@github.com:hiroki-hasegawa/foo-manifest.git
  type: git
  # SSH公開鍵認証に必要な秘密鍵を設定する。
  sshPrivateKey: |
    MIIC2 ...
---
# bar-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: bar-repository # マニフェストリポジトリ名
  url: git@github.com:hiroki-hasegawa/bar-manifest.git
  type: git
  # SSH公開鍵認証に必要な秘密鍵を設定する。
  sshPrivateKey: |
    MIIEp ...
```

<br>

### チャートリポジトリの場合

#### ▼ 注意点

プライベートなチャートリポジトリごとに、異なるSecretで認証情報を設定する必要がある。

ただし、監視する複数のプライベートなチャートリポジトリが、全て```1```個のチャートレジストリ内にある場合は、Secretは```1```個でよい。



> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#helm-chart-repositories
> - https://github.com/argoproj/argo-cd/issues/7121#issuecomment-921165708

#### ▼ Basic認証の場合

Basic認証に必要なユーザー名とパスワードを設定する。

ここでは、プライベートなチャートリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。



```yaml
# foo-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-repository # チャートリポジトリ名
  url: https://github.com/hiroki.hasegawa/foo-charts # チャートリポジトリのURL
  type: helm
  username: foo
  password: bar
---
# bar-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: bar-repository # チャートリポジトリ名
  url: https://github.com/hiroki.hasegawa/bar-charts # チャートリポジトリのURL
  type: helm
  username: baz
  password: qux
```

<br>

### OCIリポジトリの場合

#### ▼ 注意点

OCIプロトコルの有効化（```enableOCI```キー）が必要であるが、内部的にOCIプロトコルが```repoURL```キーの最初に追記されるため、プロトコルの設定は不要である。

プライベートなチャートリポジトリの場合と同様にして、OCIリポジトリごとに異なるSecretで認証情報を設定する必要がある。

ただし、監視する複数のリポジトリが、全て```1```個のOCIレジストリ内にある場合は、Secretは```1```個でよい。



> ℹ️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/util/helm/cmd.go#L262
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#helm-chart-repositories
> - https://github.com/argoproj/argo-cd/issues/7121#issuecomment-921165708

#### ▼ Basic認証の場合

Basic認証に必要なユーザー名とパスワードを設定する。

ここでは、プライベートなOCIリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。



```yaml
# foo-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-oci-repository # OCIリポジトリ名
  url: <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com # OCIリポジトリのURL
  type: helm
  username: foo
  password: bar
  enableOCI: "true" # OCIリポジトリを有効化する。
---
# bar-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: bar-oci-repository # OCIリポジトリ名
  url: <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com # OCIリポジトリのURL
  type: helm
  username: baz
  password: qux
  enableOCI: "true" # OCIリポジトリを有効化する。
```

AWS ECRのように認証情報に有効期限がある場合は、認証情報を定期的に書き換えられるようにする。例えば、aws-ecr-credentialチャートを使用する。

> ℹ️ 参考：
>
> - https://qiita.com/moriryota62/items/7d94027881d6fe9a478d
> - https://stackoverflow.com/questions/66851895/how-to-deploy-helm-charts-which-are-stored-in-aws-ecr-using-argocd
> - https://artifacthub.io/packages/helm/architectminds/aws-ecr-credential

<br>



## 13-03. argocd-repo-creds

### argocd-repo-credsとは

ArgoCDがプライベートリポジトリを監視する時に必要な認証情報を設定する。

```argocd-repo```とは異なり、```1```個の認証情報で複数にリポジトリにアクセスできるようにする。

パブリックリポジトリの場合は、不要である。


> ℹ️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-repo-creds.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repository-credentials

<br>

## 13-04. argo-secret（必須）


### argocd-secretとは

以下の認証情報やSSL証明書を設定する。

- クライアントが、任意の認証認可方法でArgoCDにログインするためのユーザー名とパスワード
- ArgoCDがapiserverにリクエストを送信するためのSSL証明書と秘密鍵
- Webhookでリクエストを送信するためのSSL証明書

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-secret.yaml

<br>

### 初期パスワードの設定

ArgoCDが```argocd-initial-admin-secret```というSecretを自動的に作成してくれる。

これに、初期パスワードが設定されている。

```yaml
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: argocd-initial-admin-secret
type: Opaque
data:
  password: *****
```

<br>


## 14. 専用ServiceAccount

ArgoCDのServiceAccountを作成する。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: argocd-application-controller
  labels:
    app.kubernetes.io/part-of: argocd
automountServiceAccountToken: true
secrets:
  - name: argocd-application-controller-token-*****
```

<br>
