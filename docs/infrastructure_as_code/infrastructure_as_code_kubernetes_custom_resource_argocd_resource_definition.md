---
title: 【IT技術の知見】リソース定義＠ArgoCD
description: リソース定義＠ArgoCDの知見を記録しています。
---

# リソース定義＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### インストール

#### ▼ 共通の手順

> ℹ️ 参考：
>
（１）ローカルマシンから本番環境にArgoCDをインストールする場合、```kubectl```コマンドのコンテキストを間違える可能性がある。そのため、```kubectl```コマンド専用の踏み台サーバーを用意してもよい。EKSのコンテキストを作成し、```kubectl```コマンドの宛先を、EKSのkube-apiserverに変更する。

```bash
$ aws eks update-kubeconfig --region ap-northeast-1 --name foo-eks-cluster
$ kubectl config use-context arn:aws:eks:ap-northeast-1:<アカウントID>:cluster/<Cluster名>
```

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/getting-started-console.html
> - https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html
> - https://zenn.dev/yoshinori_satoh/articles/eks-kubectl-instance
> - http://linuxcommand2007.seesaa.net/article/476794217.html

（２）ArgoCDが稼働するNamespaceを作成する。

```bash
$ kubectl create namespace argocd
```

（３）マニフェストファイルを指定し、kube-apiserverに送信する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/getting_started/

```bash
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# applyされたことを確認する。
$ kubectl get all -n argocd
```

（４）ArgoCDダッシュボードを公開する。

```bash
$ kubectl patch svc argocd-server \
    -n argocd \
    -p '{"spec": {"type": "LoadBalancer"}}'
```
（５）Kubernetes上のArgoCDダッシュボードのパスワードを取得する。

```bash
$ kubectl get secret argocd-initial-admin-secret \
    -n argocd \
    -o jsonpath="{.data.password}" | base64 -d; echo
```

（６）```443```番ポートにルーティングできるロードバランサーを作成する。この時、IngressとIngressコントローラーを作成するか、```kubectl port-forward```コマンドなど実行する。```minikube tunnel```ではポート番号を指定できないことに注意する。

```bash
$ kubectl port-forward svc/argocd-server -n argocd 8080:443
```

#### ▼ argocdコマンドを使用して

（７）```argocd```コマンドをインストールする。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/cli_installation/

```bash
$ curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
$ chmod +x /usr/local/bin/argocd
```

（８）ArgoCDにログインする。ユーザー名とパスワードを要求されるため、これらを入力する。

```bash
$ argocd login 127.0.0.1:8080

Username: admin
Password: *****
'admin:login' logged in successfully
```

（９）ArgoCDのアプリケーションを作成する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/release-1.8/user-guide/commands/argocd_app_create/

```bash
$ argocd app create guestbook \
    --project default \
    --repo https://github.com/hiroki-hasegawa/foo-manifests.git \
    --revision main \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace foo \
    --auto-prune \
    --self-heal \
    --sync-option CreateNamespace=true
```

（１０）ArgoCD上でアプリケーションの監視を実行する。事前に```--dry-run```キーで監視対象のリソースを確認すると良い。監視対象リポジトリ（GitHub、Helm）の最新コミットが更新されると、これを自動的にプルしてくれる。アプリケーションのapplyにはCircleCIが関与しておらず、Kubernetes上に存在するArgoCDがapplyを行なっていることに注意する。

```bash
$ argocd app sync guestbook --dry-run
```

（１１）自動Syncを有効化する。

```bash
$ argocd app set guestbook --sync-policy automated
```

（１２）クラウドプロバイダーのコンテナイメージレジストリやチャートレジストリを採用している場合は、ログインが必要になる。

> ℹ️ 参考：
>
> - https://medium.com/@Technorite
> - https://stackoverflow.com/questions/66851895/how-to-deploy-helm-charts-which-are-stored-in-aws-ecr-using-argocd

```bash
# ECRのチャートをプルする場合
$ argocd repo add oci://<チャートレジストリ名> \
    --type helm \
    --name <チャートリポジトリ名> \
    --enable-oci \
    --username AWS \
    --password $(aws ecr get-login-password --region ap-northeast-1)
```

#### ▼ マニフェストファイル経由

（７）```argocd```コマンドの代わりに、マニフェストファイルでArgoCDを操作しても良い。

```bash
$ kubectl apply -f application.yaml
```

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  project: default
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: foo
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

<br>

### アンインストール

#### ▼ argocdコマンドを使用して

ArgoCDのApplicationを削除する。```--cascade```キーを有効化すると、ArgoCDのApplication自体と、Application配下のリソースの両方を連鎖的に削除できる。反対に無効化すると、Applicationのみを単体で削除する。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/faq/
> - https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/

```bash
$ argocd app delete <ArgoCDのアプリケーション名> --cascade=false
```

#### ▼ ```kubectl```コマンドを使用して

ArgoCDのApplicationを削除する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/#deletion-using-kubectl

```bash
$ kubectl delete app <ArgoCDのアプリケーション名>
```

<br>

### 開発環境での動作確認

#### ▼ 別のapplyツールを使用する

実装が複雑になることを避けるため、開発環境に対するapplyには、ArgoCD以外のツールを使用する。

（例）Skaffold

#### ▼ ローカルマシンを監視

ローカルマシンのディレクトリをリポジトリとして監視する。あらかじめ、リポジトリの自動プルの設定を無効化しておく必要がある。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/issues/839#issuecomment-452270836

```bash
 $ argocd app sync <ArgoCDのアプリケーション名> --local=<ディレクトリへのパス>
```

<br>

## 02. Application

### Applicationとは

#### ▼ Kuberneresリソースの監視

Kubernetesのカスタムリソースから定義される。監視対象のKubernetesリソースやカスタムリソースを設定する。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/manifests/crds/application-crd.yaml

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

| 操作名       | 説明                                                                                                                                              |
| ------------ |-------------------------------------------------------------------------------------------------------------------------------------------------|
| Sync         | 監視対象リポジトリとのマニフェストファイルの差分を確認し、差分があれば```kubectl apply```コマンドを実行する。                                                                                |
| Refresh      | 監視対象リポジトリとのマニフェストファイルの差分を確認する。差分を確認するだけで、applyは実行しない。                                                                                           |
| Hard Refresh | redis-serverに保管されているキャッシュを削除する。また、監視対象リポジトリとのマニフェストファイルの差分を確認する。差分を確認するだけで、applyは実行しない。                                                         |
| Restart      | すでにapply済みのKubernetesリソース内のコンテナを再デプロイする。コンテナを再起動するだけで、Kubernetesリソースを作成することはない。<br>ℹ️ 参考：https://twitter.com/reoring/status/1476046977599406087 |

#### ▼ ヘルスステータスの種類

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/health/#way-1-define-a-custom-health-check-in-argocd-cm-configmap

| ステータス名 | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| Healthy      | 全てのKubernetesリソースは正常に稼働している。               |
| Progressing  | 一部のKubernetesリソースは正常に稼働していないが、リソースの状態が変化中のため、正常になる可能性がある。この状態の場合は、ステータスが他のいずれかになるまで待機する。 |
| Degraded     | 一部のKubernetesリソースは正常に稼働していない。             |
| Suspended    | 一部のKubernetesリソースは、イベント（例：CronJobなど）が実行されることを待機している。 |
| Missing      | 調査中...                                                    |
| Unknown      | 調査中...                                                    |

<br>

### spec.ignoreDifferences

#### ▼ ignoreDifferencesとは

特定のApplicationのSyncステータス（Synced、OutOfSync）の判定時に、特定のKubernetesリソースの特定の設定値の差分を無視し、OutOfSyncにならないようする。Sync後にKubernetesリソースが変化するような仕様（動的な設定値、Jobによる変更、mutating-admissionステップでのWebhook、マニフェストファイルの自動整形、など）の場合に使用する。

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

注意点として、Syncステータスの判定時に無視されるだけで、内部的にSyncは実行されてしまうため、Syncのたびに設定値が元に戻ってしまう。そこで別途、```RespectIgnoreDifferences```オプションも有効にしておくと良い。

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
  
    # 〜 中略 〜
  
  syncPolicy:
    syncOptions:
      - RespectIgnoreDifferences=true
```

<br>

### spec.project

#### ▼ projectとは

アプリケーションのプロジェクト名を設定する。プロジェクト名は『```default```』は必ず作成する必要がある。```default```以外のプロジェクトは、実行環境別に作成すると良い。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  project: default # その他、dev、stg、prd、などを作成する。
```

<br>

### spec.source

#### ▼ sourceとは

マニフェストリポジトリ、チャートレジストリ、の変更を監視し、これらからプルしたマニフェストファイルで```kubectl apply```コマンドを実行。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

| リポジトリの種類                                   | 管理方法                     | マニフェストファイルのapply方法                                       |
|--------------------------------------------| ---------------------------- |----------------------------------------------------------|
| マニフェストリポジトリ（GitHub）                        | マニフェストファイルそのまま | ArgoCDで直接的に```kubectl apply```コマンドを実行する。                 |
| チャートレジストリ（ArtifactHub、GitHub、GitHub Pages） | チャートアーカイブ           | Helmを使用して、ArgoCDで間接的に```kubectl apply```コマンドを実行する。パラメーターに応じて、内部的に```helm```コマンドが実行される。 |
| OCIレジストリ（ECR）                              | チャートアーカイブ           | Helmを使用して、ArgoCDで間接的に```kubectl apply```コマンドを実行する。パラメーターに応じて、内部的に```helm```コマンドが実行される。 |

<br>

### spec.source（マニフェストリポジトリの場合）

#### ▼ directory

監視対象のマニフェストリポジトリのディレクトリ構造に関して設定する。```path```キーで指定したディレクトリの構造に合わせて、特定のマニフェストファイルを指定できるようにする。

> ℹ️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml#L78
> - https://argo-cd.readthedocs.io/en/stable/user-guide/tool_detection/

| 設定項目      | 説明                                                                                            |
| ------------- |-----------------------------------------------------------------------------------------------|
| ```include``` | ```path```キーで指定したディレクトリ内で、特定のマニフェストファイルのみを指定し、kube-apiserverに送信する                             |
| ```exclude``` | ```path```キーで指定したディレクトリ内で、特定のマニフェストファイルを除外し、kube-apiserverに送信する                                                  |
| ```recurse``` | ```path```キーで指定したディレクトリにサブディレクトリが存在している場合、全てのマニフェストファイルを指定できるように、ディレクトリ内の再帰的検出を有効化するか否かを設定する。 |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    path: ./kubernetes
    directory:
      recurse: true
```

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
    path: ./kubernetes
```

#### ▼ repoURL

監視対象のマニフェストリポジトリのURLを設定する。パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。

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

監視対象のマニフェストリポジトリのブランチやバージョンタグを設定する。各実行環境に、実行環境に対応したブランチを指定するマニフェストファイルを定義しておくとよい。これにより、各実行環境内のApplicationは特定のブランチのみを監視するようになる。

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

```helm```コマンドに渡すパラメーターを設定する。Helmfileと同じように、```helm```コマンドを宣言的に実行できる。

> ℹ️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml#L25
> - https://mixi-developers.mixi.co.jp/argocd-with-helm-fee954d1003c

| 設定項目          | 説明                                         | 補足                                                         |
| ----------------- |--------------------------------------------| ------------------------------------------------------------ |
| ```releaseName``` | 作成するリリース名を設定する。                            |                                                              |
| ```values```      | ```helm```コマンドに渡す```values```ファイルの値をハードコーディングする。 |                                                              |
| ```valueFiles```  | ```helm```コマンドに渡す```values```ファイルを設定する。           | ```values```ファイルは、チャートリポジトリ内にある必要がある。 |


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
      releaseName: prd
      values: |-
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
      releaseName: prd
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
      releaseName: prd
      valueFiles:
        # helm-secretsを使用して暗号化されたvaluesファイル
        - ./secrets.yaml
```

あらかじめ、sopsを使用して、```values```ファイルを暗号化し、疑似的なキーバリュー型ストレージに設定しておく。監視対象のリポジトリに```.sops.yaml```ファイルと```secrets.yaml```ファイル（疑似的なキーバリュー型ストレージ）を配置しておく必要がある。

```yaml
# secrets.yamlファイル

# 疑似的なキーバリュー型ストレージ
data:
  AWS_ACCESS_KEY: ENC[AES256...
  AWS_SECRET_ACCESS_KEY: ENC[AES256...

sops:
  ...
```

ArgoCDは暗号化された```values```ファイルを復号化し、チャートをインストールする。なおArgoCD上では、Secretのdataキーは```base64```方式でエンコードされる。

```yaml
# values.yamlファイルの暗号化された値を展開するテンプレートファイル
apiVersion: v1
kind: Secret
metadata:
  name: foo-aws-credentials
type: Opaque
data:
  AWS_ACCESS_KEY: {{ .Values.data.AWS_ACCESS_KEY | b64en }} # base64方式でエンコードされる。
  AWS_SECRET_ACCESS_KEY: {{ .Values.data.AWS_SECRET_ACCESS_KEY | b64en }}
```

ArgoCDはHelmの```v2```と```v3```の両方を保持している。リリースするチャートの```apiVersion```キーの値が```v1```であれば、ArgoCDはHelmの```v2```を使用して、一方で```apiVersion```キーの値が```v2```であれば、Helmの```v3```を使用するようになっている。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/issues/2383#issuecomment-584441681

内部的に```helm template```コマンドと```kubectl apply```コマンドを組み合わせて実行しているため、```helm list```コマンドでリリース履歴として確認できない。代わりに、```argocd app history```コマンドで確認できる。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#random-data
> - https://qiita.com/kyohmizu/items/118bf654d0288da2294e
> - https://medium.com/@ch1aki/argocd%E3%81%A7helm%E3%82%92%E4%BD%BF%E3%81%86%E6%96%B9%E6%B3%95%E3%81%A8%E6%97%A2%E5%AD%98%E3%81%AErelease%E3%82%92argocd%E7%AE%A1%E7%90%86%E3%81%B8%E7%A7%BB%E8%A1%8C%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95-9108295887

```bash
$ argocd app history <Application名>

ID  DATE                           REVISION
0   2020-04-12 10:22:57 +0900 JST  1.0.0
1   2020-04-12 10:49:14 +0900 JST  <バージョンタグ>
```

#### ▼ repoURL

監視対象のチャートレジストリ内のリポジトリのURLを設定する。パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。

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
    repoURL: https://foo.example.com/foo-chart
```

#### ▼ targetRevision

監視対象のチャートレジストリ内のリポジトリのブランチ（GitHubをチャートリポジトリとしている場合のみ）やバージョンタグを設定する。チャートリポジトリとして、GitHubやArtifactHubを指定できる。

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

監視対象のOCIレジストリ内のリポジトリのURLを設定する。パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。

> ℹ️ 参考：https://stackoverflow.com/questions/68219458/connecting-an-app-in-argocd-to-use-a-helm-oci-repository

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    repoURL: <OCIリポジトリURL>
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

### spec.source.plugin

#### ▼ plugin

argocdのアドオンを使用する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#helm-plugins

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
    namespace: foo
```

#### ▼ server

kube-apiserverのURLを設定する。Kubernetesの実行環境としてEKSやGKEを採用している場合、これのkube-apiserverのエンドポイントを指定する必要がある。

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
    server: https://*****.*****.ap-northeast-1.eks.amazonaws.com
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

GitOpsでのリポジトリ（GitHub、Helm）とKubernetesの間の自動Syncを有効化するか否かを設定する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy

| 設定項目         | 説明                                                         | 補足                                                         |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ```prune```      | リソースを作成しつつ、不要になったリソースを自動削除するか否かを設定する。デフォルトでは、GtiHubリポジトリでマニフェストファイルが削除されても、ArgoCDはリソースを自動的に削除しない。開発者の気づかないうちに、残骸のKubernetesリソースが溜まる可能性があるので、有効化した方が良い。 | ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-pruning |
| ```selfHeal```   | Kubernetes側に変更があった場合、リポジトリ（GitHub、Helm）の状態に戻すようにする。デフォルトでは、Kubernetes側のリソースを変更しても、リポジトリの状態に戻すための自動Syncは実行されない。 | ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-self-healing |
| ```allowEmpty``` | Prune中に、Application配下にリソースを検出できなくなると、Pruneは失敗するようになっている。Applicationが空（配下にリソースがない）状態を許可するか否かを設定する。 | ℹ️ 参考：<br>・https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-pruning-with-allow-empty-v18<br>・https://stackoverflow.com/questions/67597403/argocd-stuck-at-deleting-but-resources-are-already-deleted |

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

#### ▼ syncOptions

GtiOpsでのマニフェストファイルのSync処理の詳細を設定する。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#sync-options
> - https://dev.classmethod.jp/articles/argocd-for-external-cluster/

| 設定項目                     | 説明                                                         | 補足                                                         |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ```CreateNamespace```        | Applicationの作成対象のNamespaceを自動的に作成する。ArgoCDがインストールされるNamespaceと、Applicationを作成するNamespaceが異なる場合、これを有効化しておいた方が良い。 |                                                              |
| ```Validate```               |                                                              |                                                              |
| ```PrunePropagationPolicy``` | Sync後に不要になったKubernetesリソースの削除方法を設定する。削除方法は、Kubernetesでのリソースの削除の仕組みと同様に、バックグラウンド、フォアグラウンド、オルファン、がある。 | ℹ️ 参考：<br>・https://www.devopsschool.com/blog/sync-options-in-argo-cd/<br>・https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/ |
| ```PruneLast```              | 通常のPruneでは、Syncしながら旧いリソースを独立的に削除していく。PruneLastでは、一度全てのリソースをSyncしてしまい、正常に稼働した後に旧いリソースをまとめて削除していく。 | ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#prune-last |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  syncPolicy:
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=background
```

<br>

## 04. ConfigMap

### data.resource.customizations

#### ▼ ignoreDifferences.all

ArgoCD全体で```spec.ignoreDifferences```キーと同じ機能を有効化する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/#system-level-configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/name: argocd-cm
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

<br>

## 05. Job

### metadata

#### ▼ generateName

Syncフェーズフック名を設定する。

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

フックを設定するSyncフェーズ（Sync前、Sync時、Syncスキップ時、Sync後、Sync失敗時）を設定する。

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

同じSyncフェーズに実行するように設定したフックが複数ある場合、これらの実行の優先度付けを設定する。正負の数字を設定でき、数字が小さい方が優先される。優先度が同じ場合、ArgoCDがよしなに順番を決めてしまう。

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

## 06. Rollout

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

デプロイ手法を設定する。大前提として、そもそもArgoCDは```kubectl apply```コマンドでリソースを作成しているだけなので、デプロイ手法は、Deploymentの```spec.strategy```キーや、DaemonSetとStatefulSetの```spec.updateStrategy```キーの設定値に依存する。ArgoCDのstrategyオプションを使用することにより、これらのKubernetesリソース自体を冗長化し、より安全にapplyを行える。

#### ▼ blueGreen

![argocd_blue-green-deployment](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_blue-green-deployment.png)

ブルー/グリーンデプロイメントを使用して、新しいPodをリリースする。

> ℹ️ 参考：
>
> - https://argoproj.github.io/argo-rollouts/features/bluegreen/
> - https://korattablog.com/2020/06/19/argocd%E3%81%AB%E3%82%88%E3%82%8Bbluegreen%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E3%82%92%E8%A9%A6%E3%81%99/

| 設定項目                    | 説明                                                         |
| --------------------------- | ------------------------------------------------------------ |
| ```activeService```         | 旧環境へのルーティングに使用するServiceを設定する。      |
| ```autoPromotionEnabled```  | 旧環境から新環境への自動切り替えを有効化するか否かを設定する。もし無効化した場合、```autoPromotionSeconds```の秒数だけ切り替えを待機する。 |
| ```autoPromotionSeconds```  | 旧環境から新環境への切り替えを手動で行う場合、切り替えを待機する最大秒数を設定する。最大秒数が経過すると、自動的に切り替わってしまうことに注意する。 |
| ```previewReplicaCount```   | 新環境のPod数を設定する。                              |
| ```previewService```        | 新環境へのルーティングに使用するServiceを設定する。    |
| ```scaleDownDelaySeconds``` |                                                              |

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

#### ▼ canary

![argocd_canary-release](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_canary-release.png)

カナリアリリースを使用して、新しいPodをリリースする。

> ℹ️ 参考：
>
> - https://argoproj.github.io/argo-rollouts/features/canary/
> - https://korattablog.com/2020/06/19/argocd%E3%81%AEcanary-deployment%E3%82%92%E8%A9%A6%E3%81%99/

| キー       | 説明                                                         |
| ---------- | ------------------------------------------------------------ |
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

<br>

## 07. Secret

### metadata.labels

#### ▼ argocd.argoproj.io/secret-typeとは

設定値は```repository```とする。監視対象のマニフェストリポジトリ、チャートレジストリ、OCIレジストリの認証情報を設定する。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/bea379b036708bc5035b2a25d70418350bf7dba9/util/db/repository_secrets.go#L60

#### ▼ マニフェストリポジトリの場合

マニフェストリポジトリの認証情報を設定する。マニフェストレジストリごとに、別々のSecretで認証情報を設定する必要がある。ただし、```1```個のチャートレジストリ内のリポジトリしか監視しない場合は、Secretは1つでよい。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repository-credentials

```yaml
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-kubernetes-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-kubernetes-registry # 任意のマニフェストリポジトリ名
  url: <マニフェストリポジトリ名> # git@github.com:hiroki-hasegawa/foo-kubernetes-manifest.git
  type: git
  # SSHによる認証の場合は秘密鍵を設定する。
  sshPrivateKey: |
    MIIC2DCCAcCgAwIBAgIBATANBgkqh ...
---
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-istio-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-istio-registry # 任意のマニフェストリポジトリ名
  url: <マニフェストリポジトリ名> # git@github.com:hiroki-hasegawa/foo-istio-manifest.git
  type: git
  # SSHによる認証の場合は秘密鍵を設定する。
  sshPrivateKey: |
    MIIEpgIBAAKCAQEA7yn3bRHQ5FHMQ ...
```

#### ▼ チャートレジストリの場合

チャートレジストリの認証情報を設定する。チャートレジストリごとに、別々のSecretで認証情報を設定する必要がある。ただし、```1```個のチャートレジストリ内のリポジトリしか監視しない場合は、Secretは1つでよい。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#helm-chart-repositories
> - https://github.com/argoproj/argo-cd/issues/7121#issuecomment-921165708

```yaml
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-kubernetes-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-kubernetes-registry # 任意のチャートレジストリ名
  url: <チャートレジストリ内リポジトリのURL> # https://storage.googleapis.com/foo-kubernetes
  type: helm
  username: foo
  password: bar
---
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-istio-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-istio-registry # 任意のチャートレジストリ名
  url: <チャートレジストリ内リポジトリのURL> # https://storage.googleapis.com/foo-istio
  type: helm
  username: baz
  password: qux
```

#### ▼ OCIレジストリの場合

OCIレジストリの認証情報を設定する。OCIプロトコルの有効化（```enableOCI```キー）が必要であるが、内部的にOCIプロトコルが```repoURL```キーの最初に追記されるため、プロトコルの設定は不要である。チャートレジストリと同様にして、OCIレジストリごとに別々のSecretで認証情報を設定する必要がある。ただし、```1```個のOCIレジストリ内のリポジトリしか監視しない場合は、Secretは1つでよい。

> ℹ️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/util/helm/cmd.go#L262
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#helm-chart-repositories
> - https://github.com/argoproj/argo-cd/issues/7121#issuecomment-921165708

```yaml
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-kubernetes-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-kubernetes-oci-registry
  url: <OCIレジストリ内リポジトリ> # <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com
  type: helm
  username: foo
  password: bar
  enableOCI: "true"
---
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-istio-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-istio-oci-registry # 任意のOCIレジストリ名
  url: <OCIレジストリ内リポジトリ> # <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com
  type: helm
  username: baz
  password: qux
  enableOCI: "true"
```

AWS ECRのように認証情報に有効期限がある場合は、認証情報を定期的に書き換えられるようにする。例えば、aws-ecr-credentialチャートを使用する。

> ℹ️ 参考：
>
> - https://qiita.com/moriryota62/items/7d94027881d6fe9a478d
> - https://stackoverflow.com/questions/66851895/how-to-deploy-helm-charts-which-are-stored-in-aws-ecr-using-argocd
> - https://artifacthub.io/packages/helm/architectminds/aws-ecr-credential

<br>

## 08. Workflow

### spec.entrypoint

#### ▼ entrypointとは

一番最初に使用するテンプレート名を設定する。

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: foo-workflow
spec:
  entrypoint: foo-template
```

<br>

### spec.templates

#### ▼ templatesとは

パイプラインの処理を設定する。WorkflowTemplateとして切り分けても良い。

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: foo-workflow
spec:
  entrypoint: foo-template
  templates:
    - name: foo-template
      script:
        - image: alpline:1.0.0
          command: ['sh']
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
  generateName: foo-workflow
spec:
  workflowTemplateRef:
    name: hello-world-workflow-template
```

<br>

## 08-02. WorkflowTemplate

### spec.templates

#### ▼ templatesとは

パイプラインの処理を設定する。

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
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
  name: hello-world-workflow-template
spec:
  templates:
    - name: foo-template
      script:
        - image: alpline:1.0.0
          command: ['sh']
          source: |
            echo "Hello World"
```

#### ▼ steps

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

<br>

