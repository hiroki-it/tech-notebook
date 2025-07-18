---
title: 【IT技術の知見】リソース定義＠Kubernetes
description: リソース定義＠Kubernetesの知見を記録しています。
---

# リソース定義＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## APIService

### .spec.group

#### ▼ groupとは

拡張apiserverが受信するAPIグループ名を設定する。

```yaml
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  name: v1beta1.foo.k8s.io
spec:
  group: foo.k8s.io
```

> - https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/api-service-v1/#APIServiceSpec

<br>

### .spec.groupPriorityMinimum

#### ▼ groupPriorityMinimumとは

同じAPIグループがある場合に、優先度を設定する。

```yaml
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  name: v1beta1.foo.k8s.io
spec:
  groupPriorityMinimum: 100
```

> - https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/api-service-v1/#APIServiceSpec

<br>

### .spec.insecureSkipTLSVerify

#### ▼ insecureSkipTLSVerifyとは

```yaml
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  name: v1beta1.foo.k8s.io
spec:
  insecureSkipTLSVerify: true
```

> - https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/api-service-v1/#APIServiceSpec

<br>

### .spec.service

#### ▼ serviceとは

拡張apiserverは、kube-apiserverからリクエストを直接的に受信するのではなく、専用のServiceを介してリクエストを受信する。この時、どのServiceからリクエストを受信するかを設定する。

```yaml
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  name: v1beta1.foo.k8s.io
spec:
  service:
    name: foo-service
    namespace: kube-system
    port: 443
```

> - https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/api-service-v1/#APIServiceSpec

<br>

### .spec.version

#### ▼ versionとは

拡張apiserverが受信するAPIグループのバージョンを設定する。

```yaml
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  name: v1beta1.foo.k8s.io
spec:
  version: v1beta1
```

> - https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/api-service-v1/#APIServiceSpec

<br>

### .spec.versionPriority

#### ▼ versionPriorityとは

同じAPIグループがある場合に、バージョンの優先度を設定する。

```yaml
apiVersion: apiregistration.k8s.io/v1
kind: APIService
metadata:
  name: v1beta1.foo.k8s.io
spec:
  versionPriority: 100
```

> - https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/api-service-v1/#APIServiceSpec

<br>

## CertificateSigningRequest

### .spec.request

#### ▼ requestとは

base64方式でエンコードした証明書署名要求 (`.csr`ファイル) を設定する。

```yaml
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: foo-csr
spec:
  groups:
    - system:authenticated
  # base64方式でエンコードした証明書署名要求ファイル
  request: LS0tL...
  signerName: kubernetes.io/kube-apiserver-client
  usages:
    - digital signature
    - key encipherment
    - client auth
```

> - https://qiita.com/knqyf263/items/aefb0ff139cfb6519e27
> - https://goodbyegangster.hatenablog.com/entry/2021/01/18/131452

定義したCertificateSigningRequestを承認し、サーバー証明書 (`.crt`) を作成するためには、`kubectl certificate approve`コマンドを使用する。

```bash
# 承認
$ kubectl certificate approve foo-csr

# サーバー証明書を取得する。
$ kubectl get csr foo-csr -o jsonpath='{.status.certificate}'| base64 -d > foo.crt
```

<br>

## Config

### clusters

#### ▼ clustersとは

`kubectl`コマンドの向き先となるClusterを設定する。

> - https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

#### ▼ name

Cluster名を設定する。

```yaml
apiVersion: v1
kind: Config
clusters:
  - name: <ClusterのARN>

    ...

  - name: docker-desktop

    ...

  - name: minikube

    ...
```

#### ▼ cluster

kub-apiserverの接続先情報を設定する。

```yaml
apiVersion: v1
kind: Config
clusters:
  - cluster:
      # kube-apiserverのサーバー証明書
      certificate-authority-data: LS0tLS1 ...
      # kube-apiserverのURL
      server: https://*****.gr7.ap-northeast-1.eks.amazonaws.com

    ...

  - cluster:
      certificate-authority-data: LS0tLS1 ...
      server: https://kubernetes.docker.internal:6443

    ...

  - cluster:
      certificate-authority: /Users/hiroki-hasegawa/.minikube/ca.crt
      extensions:
        - extension:
            last-update: Fri, 13 May 2022 16:58:59 JST
            provider: minikube.sigs.k8s.io
            version: v1.25.2
          name: cluster_info
      server: https://127.0.0.1:52192

    ...
```

<br>

### contexts

#### ▼ contextsとは

`kubectl`コマンドの向き先の候補を設定する。

> - https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

#### ▼ name

向き先の名前を設定する。

```yaml
apiVersion: v1
kind: Config
contexts:
  - name: <ClusterのARN>

    ...

  - name: docker-desktop

    ...

  - name: minikube

    ...
```

#### ▼ context

実際に使用するCluster名とServiceAccountユーザー名を、`.contexts[*].context.cluster`キーと`.contexts[*].context.user`キーから選んで設定する。

```yaml
apiVersion: v1
kind: Config
contexts:
  - context:
      cluster: <ClusterのARN>
      user: <ClusterのARN>

    ...

  - context:
      cluster: docker-desktop
      user: docker-desktop

    ...

  - context:
      cluster: minikube
      extensions:
        - extension:
            last-update: Fri, 13 May 2022 16:58:59 JST
            provider: minikube.sigs.k8s.io
            version: v1.25.2
          name: context_info
      namespace: default
      user: minikube

    ...
```

<br>

### current-context

#### ▼ current-contextとは

`kubectl`コマンドの現在の向き先の名前を設定する。

```yaml
apiVersion: v1
kind: Config
current-context: <ClusterのARN>
```

> - https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

<br>

### preferences

#### ▼ preferencesとは

```yaml
apiVersion: v1
kind: Config
preferences: {}
```

> - https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

<br>

### users

#### ▼ usersとは

kube-apiserverのクライアント (特に`kubectl`コマンド実行者) のUserAccountの情報を設定する。

> - https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

#### ▼ name

ユーザー名を設定する。

```yaml

apiVersion: v1
kind: Config
users:
  - name: <ClusterのARN>

    ...

  - name: docker-desktop

    ...

  - name: minikube
```

#### ▼ user

ユーザーの資格情報を設定する。

AWS EKSのように、資格情報を動的に取得するようにしても良い。

```yaml

apiVersion: v1
kind: Config
users:
  - user:
      exec:
        apiVersion: client.authentication.k8s.io/v1
        args:
          - --region
          - ap-northeast-1
          - eks
          - get-token
          - --cluster-name
          - prd-foo-eks-cluster
        command: "aws"

    ...

  - user:
      client-certificate-data: LS0tLS1 ...
      client-key-data: LS0tLS1 ...

    ...

  - user:
      client-certificate: /Users/hiroki-hasegawa/.minikube/profiles/minikube/client.crt
      client-key: /Users/hiroki-hasegawa/.minikube/profiles/minikube/client.key

    ...
```

<br>

## ConfigMap

### data

#### ▼ dataとは

Kubernetesリソースに渡す機密でない変数を設定する。

#### ▼ 変数の管理

ConfigMapに設定する変数を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-config-map
data:
  bar: BAR
```

string型しか設定できないため、デコード後にinteger型やboolean型になってしまう値は、ダブルクオーテーションで囲う必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-config-map
data:
  enableFoo: true # ダブルクオーテーションで囲う。
  number: "1"
```

> - https://stackoverflow.com/questions/63905890/kubernetes-how-to-set-boolean-type-variable-in-configmap

#### ▼ ファイルに管理

パイプ (` |`) を使用すれば、ファイルを変数として設定できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-fluent-bit-conf-config-map
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush         1
        Log_Level     info

    [OUTPUT]
        Name cloudwatch
        Match *
        region ap-northeast-1
        log_group_name /prd-foo-k8s/log
        log_stream_prefix container/fluent-bit/
        auto_create_group true
```

<br>

## CronJob

### .spec.concurrencyPolicy

#### ▼ concurrencyPolicy

CronJob配下のJobの並列実行ルールを設定できる。

#### ▼ Allow

Jobの並列実行を許可する。

#### ▼ Forbid

Jobの並列実行を拒否する。

#### ▼ Allow

もし別のJobを実行していれば、そのJobを停止して新しくJobを実行する。

<br>

### .spec.jobTemplate

#### ▼ jobTemplateとは

CronJobで、定期的に実行するJobを設定する。

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: foo-cronjob
spec:
  # 毎日 00:00 (JST) に実行する
  schedule: "0 15 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: foo-alpine
              image: alpine:latest
              # 定期的に実行するコマンドを設定する。
              command:
                - /bin/bash
                - -c
              args:
                - echo Hello World
          restartPolicy: OnFailure
```

<br>

### .spec.failedJobsHistoryLimit

#### ▼ failedJobsHistoryLimitとは

実行に失敗したJobに関して、上限の履歴数を設定する。

```yaml
apiVersion: io.k8s.api.batch.v1
kind: CronJob
metadata:
  name: foo-cronjob
spec:
  failedJobsHistoryLimit: 2
```

<br>

### .spec.schedule

#### ▼ scheduleとは

Cronのルールを設定する。

```yaml
apiVersion: io.k8s.api.batch.v1
kind: CronJob
metadata:
  name: foo-cronjob
spec:
  # 1時間ごとに実行する
  schedule: "00 * * * *"
```

なお、タイムゾーンはKubernetes Clusterの設定による。

例えば、AWS EKS ClusterはUTCで時間を管理しているため、9時間分ずらす必要がある。

```yaml
apiVersion: io.k8s.api.batch.v1
kind: CronJob
metadata:
  name: foo-cronjob
spec:
  # 毎日 00:00 (JST) に実行する
  schedule: "0 15 * * *"
```

> - https://zenn.dev/k8shiro/articles/k8s-cron-timezone#eks%E3%81%AE%E5%A0%B4%E5%90%88

<br>

### .spec.startingDeadlineSeconds

#### ▼ startingDeadlineSeconds

JobがCronのスケジュール通りに実行されなかった場合に、実行の遅れを何秒まで許容するかを設定する。

指定した秒数を過ぎると、実行を失敗とみなす。

```yaml
apiVersion: io.k8s.api.batch.v1
kind: CronJob
metadata:
  name: foo-cronjob
spec:
  startingDeadlineSeconds: 100
```

> - https://kubernetes.io/ja/docs/concepts/workloads/controllers/cron-jobs/#cron-job-limitations
> - https://qiita.com/tmshn/items/aedf0d739a43a1d6423d#%E3%82%B1%E3%83%BC%E3%82%B93-startingdeadlineseconds

CronJobのデフォルトの仕様として、Jobが`100`回連続で失敗すると、CronJobを再作成しない限りJobを再実行できなくなる。

1時間にJobを1回実行すると仮定すると、簡単に`100`回を超過してしまう。

```bash
停止時間 (8h) * 実行間隔 (60/h) = 480回
```

この時、`.spec.startingDeadlineSeconds`キーを設定しておくと、これの期間に`100`回連続で失敗した時のみ、Jobを再実行できなくなる。

`100`回連続を判定する期間を短くすることで、再作成しなくてもよくなるようにする。

> - https://engineering.mercari.com/blog/entry/k8s-cronjob-20200908/
> - https://qiita.com/sekinet/items/c717104fbb9bd74872f0#%E3%81%AA%E3%81%9C%E5%95%8F%E9%A1%8C%E3%81%8C%E8%B5%B7%E3%81%8D%E3%81%9F%E3%81%8B

<br>

### .spec.successfulJobsHistoryLimit

#### ▼ successfulJobsHistoryLimitとは

実行に成功したJobに関して、上限の履歴数を設定する。

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: foo-cronjob
spec:
  successfulJobsHistoryLimit: 2
```

<br>

## DaemonSet

### .spec.replicas

Deploymentと同じである。

<br>

### .spec.strategy

### .spec.strategy (RollingUpdateの場合)

Podで`.spec.containers[*].ports[*].hostPort`キーを使用する場合、`.spec.strategy.rollingUpdate.maxSurge`キーは`0` (デフォルト値) にしなければならない。

> - https://qiita.com/yosshi_/items/ec042a801ef69fa44ef6#%E6%B3%A8%E6%84%8F%E7%82%B9hostport-%E3%81%AE%E5%88%A9%E7%94%A8
> - https://github.com/kubernetes/enhancements/tree/master/keps/sig-apps/1591-daemonset-surge#proposal

<br>

## Deployment

### .spec.replicas

#### ▼ replicasとは

Cluster内で維持するPodのレプリカ数を設定する。

Cluster内に複数のNodeが存在していて、いずれかのNodeが停止した場合、稼働中のNode内でレプリカ数を維持するようにPod数が増加する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: foo-pod
        app.kubernetes.io/component: app
```

> - https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#deployment-v1-apps
> - https://dr-asa.hatenablog.com/entry/2018/04/02/174006

<br>

### .spec.revisionHistoryLimit

#### ▼ revisionHistoryLimitとは

保管されるリビジョンの履歴数を設定する。

もし依存のリビジョンにロールバックする場合があるのであれば、必要数を設定しておく。

デフォルトは`10`個で、個人的にこれは多い。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  revisionHistoryLimit: 5
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: foo-pod
        app.kubernetes.io/component: app
```

> - https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#deployment-v1-apps

<br>

### .spec.selector

#### ▼ selectorとは

Deploymentで管理するPodを明示的に設定する。

#### ▼ matchLabels

Podの`.metadata.labels`キーを指定する。

Podに複数の`.metadata.labels`キーが付与されている時は、これらを全て指定する必要がある。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels: # Deploymentに紐付けるPodのmetadata.labelsキー
      app.kubernetes.io/name: foo-pod
      app.kubernetes.io/component: app
  template:
    metadata:
      labels: # Podのmetadata.labelsキー
        app.kubernetes.io/name: foo-pod
        app.kubernetes.io/component: app
```

> - https://cstoku.dev/posts/2018/k8sdojo-08/#label-selector

#### ▼ `field is immutable`

Deploymentの`.spec.selector.matchLabels`キーの値は変更できないため、もしこの値を変更する場合は、Deploymentを再作成する必要がある。

例えば、以下のマニフェストの`.spec.selector.matchLabels`キーの値を変更しようとする。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod # 変更しようとする
      app.kubernetes.io/component: app # 変更しようとする
  template:
    metadata:
      labels:
        app.kubernetes.io/name: foo-pod
        app.kubernetes.io/component: app
```

すると、以下のようなエラーになってしまう。

```bash
v1.LabelSelector{MatchLabels:map[string]string{"app.kubernetes.io/name":"foo-pod", "app.kubernetes.io/component":"app"}, MatchExpressions:[]v1.LabelSelectorRequirement(nil)}: field is immutable
```

> - https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#label-selector-updates
> - https://github.com/kubernetes/client-go/issues/508#issuecomment-589296590
> - https://shunyaueta.com/posts/2021-12-02/

<br>

### .spec.strategy

#### ▼ strategyとは

デプロイメントの方法を設定する。

以下のタイミングでDeploymentはPodを再デプロイする。

| 箇所                                 | 説明                                                             |
| ------------------------------------ | ---------------------------------------------------------------- |
| `.spec.replicas`キー                 | Podのレプリカ数を変更すると、DeploymentはPodを再デプロイする。   |
| `.spec.template`キー配下の任意のキー | Podテンプレートを変更した場合、DeploymentはPodを再デプロイする。 |

> - https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#updating-a-deployment

<br>

### .spec.strategy.type (Recreateの場合)

#### ▼ Recreateとは

インプレースデプロイメントを使用して、新しいPodを作成する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: foo-pod
        app.kubernetes.io/component: app
```

> - https://amateur-engineer-blog.com/kubernetes-recreate/

<br>

### .spec.strategy (RollingUpdateの場合)

#### ▼ RollingUpdateとは

ローリングアップデートを使用して、新しいPodを作成する。

ダウンタイムなしでPodを入れ替えられる。

> - https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/

#### ▼ ブルーグリーン方式 (パーセントの場合)

もし`.spec.strategy.rollingUpdate.maxSurge`キーを`100`%、また`.spec.strategy.rollingUpdate.maxUnavailable`キーを`0`%とすると仮定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  # レプリカ数は10とする
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      # デプロイ時に、Podのレプリカ数の50% (5個) だけ、新しいPodを並行的に作成する
      maxSurge: 100%
      # デプロイ時に、Podのレプリカ数の0% (0個) が停止している状態にならないようにする
      maxUnavailable: 00%
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: foo-pod
        app.kubernetes.io/component: app
```

この場合、RollingUpdate戦略時に、Podのレプリカ数と同じ数だけ新しいPodを作成するようになる。

`.spec.strategy.rollingUpdate.maxSurge`キーにより、`10`個の新しいPodを並行的に作成する (つまり、デプロイ時に新旧Podが合計`20`個ある) 。

`.spec.strategy.rollingUpdate.maxUnavailable`キーにより、`0`個が停止している状態にならないようにする (停止するPodがない)。

また、Podの停止数がレプリカ数を下回らないようになる。

![kubernetes_deployment_strategy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_deployment_strategy.png)

> - https://kakakakakku.hatenablog.com/entry/2021/09/06/173014
> - https://qiita.com/mochizuki875/items/239c0e93c30f720e687e#rollingupdate

#### ▼ ブルーグリーン方式 (絶対値の場合)

もし`.spec.strategy.rollingUpdate.maxSurge`キーを`10`、また`.spec.strategy.rollingUpdate.maxUnavailable`キーを`0`とすると仮定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  # レプリカ数は10とする
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      # デプロイ時に、Podのレプリカ数の10個だけ、新しいPodを並行的に作成する
      maxSurge: 10
      # デプロイ時に、Podのレプリカ数の0個が停止している状態にならないようにする
      maxUnavailable: 0
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: foo-pod
        app.kubernetes.io/component: app
```

この場合、RollingUpdate戦略時に、Podのレプリカ数と同じ数だけ新しいPodを作成するようになる。

`.spec.strategy.rollingUpdate.maxSurge`キーにより、`10`個の新しいPodを並行的に作成する (つまり、デプロイ時に新旧Podが合計`20`個ある)。

`.spec.strategy.rollingUpdate.maxUnavailable`キーにより、`0`個が停止している状態にならないようにする (停止するPodがない)。

また、Podの停止数がレプリカ数を下回らないようになる。

> - https://qiita.com/mochizuki875/items/239c0e93c30f720e687e#rollingupdate

<br>

### .spec.template

#### ▼ templateとは (設定項目はPodと同じ)

Deploymentで維持管理するPodテンプレートを設定する。

設定項目はPodと同じである。

Deployment自体の`.metadata.labels`キーを更新した場合はPodは再作成しないが、`.spec.template`キー配下の`.metadata.labels`キーの場合は、Podの再作成となる。

> - https://kubernetes.io/docs/concepts/workloads/pods/#pod-templates

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/name: foo-pod
    spec:
      containers:
        - name: app
          image: app:1.0.0
          ports:
            - containerPort: 8080
```

<br>

## EndpointSlice

### .spec.endpoints

#### ▼ endpointsとは

Serviceでルーティング先のPodに関して、『現在の』 宛先情報を設定する。

Kubernetesが自動的に更新するため、ユーザーが管理する必要はない。

#### ▼ addresses

Podの現在のIPアドレスを設定する。

```yaml
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: foo-endpoint-slice
endpoints:
  - addresses:
      - *.*.*.*
```

#### ▼ condition

Podの現在のライフサイクルフェーズを設定する。

```yaml
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: foo-endpoint-slice
endpoints:
  - conditions:
      ready: true
      serving: true
      terminating: false
```

#### ▼ nodeName

PodをスケジューリングさせているNode名を設定する。

これにより、Serviceとそのルーティング先のPodが異なるNode上に存在していたとしても、ServiceはPodにルーティングできる。

```yaml
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: foo-endpoint-slice
endpoints:
  - nodeName: foo-node
```

#### ▼ targetRef

Podの識別子を設定する。

```yaml
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: foo-endpoint-slice
endpoints:
  - targetRef:
      kind: Pod
      name: foo-pod
      namespace: foo-namespace
```

#### ▼ zone

PodをスケジューリングさせているAZを設定する。

```yaml
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: foo-endpoint-slice
endpoints:
  - zone: ap-northeast-1a
```

<br>

### .spec.ports

#### ▼ portsとは

Podが待ち受けるポート番号を設定する。

Kubernetesが自動的に更新するため、ユーザーが管理する必要はない。

```yaml
apiVersion: discovery.k8s.io/v1
kind: EndpointSlice
metadata:
  name: foo-endpoint-slice
ports:
  - name: http-foo
    port: 443
    protocol: TCP
```

<br>

## HTTPRoute

### parentRefs

紐づけるGatewayを設定する。

Gatewayは共有のNamespaceに配置し、HTTPRouteはマイクロサービスのある各Namespaceに配置する。

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: foo
spec:
  parentRefs:
    - name: ingress-nginx
      namespace: ingress-nginx
```

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: foo
spec:
  parentRefs:
    - name: istio-ingressgateway
      namespace: istio-ingress
```

> - https://gateway-api.sigs.k8s.io/concepts/api-overview/?h=reencrypt#attaching-routes-to-gateways
> - https://kubernetes.io/blog/2021/04/22/evolving-kubernetes-networking-with-the-gateway-api/#what-does-the-gateway-api-look-like

<br>

### rules

宛先のServiceを設定する。

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: foo
spec:
  rules:
    - backendRefs:
        - kind: Service
          name: foo
          port: 80
```

> - https://gateway-api.sigs.k8s.io/concepts/api-overview/?h=reencrypt#attaching-routes-to-gateways
> - https://kubernetes.io/blog/2021/04/22/evolving-kubernetes-networking-with-the-gateway-api/#what-does-the-gateway-api-look-like

<br>

## HorizontalPodAutoscaler

### .spec.maxReplicas、spec.minReplicas

#### ▼ maxReplicasとは

自動水平スケーリングのスケールアウト時の最大Pod数を設定する。

最初、Deploymentの`spec.replicas`キーに合わせてPodが作成され、次にHorizontalPodAutoscalerの`.spec.minReplicas`キーが優先される。

この挙動は混乱につながるため、HorizontalPodAutoscalerを使用する場合、Deploymentの`spec.replicas`キーの設定を削除しておくことが推奨である。

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: foo-horizontal-pod-autoscaler
spec:
  maxReplicas: 5
```

> - https://qiita.com/sheepland/items/37ea0b77df9a4b4c9d80
> - https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#migrating-deployments-and-statefulsets-to-horizontal-autoscaling
> - https://stackoverflow.com/a/66431624/12771072

#### ▼ minReplicasとは

自動水平スケーリングのスケールイン時の最小Pod数を設定する。

最初、Deploymentの`spec.replicas`キーに合わせてPodが作成され、次にHorizontalPodAutoscalerの`.spec.minReplicas`キーが優先される。

この挙動は混乱につながるため、HorizontalPodAutoscalerを使用する場合、Deploymentの`spec.replicas`キーの設定を削除しておくことが推奨である。

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: foo-horizontal-pod-autoscaler
spec:
  minReplicas: 3
```

> - https://qiita.com/sheepland/items/37ea0b77df9a4b4c9d80
> - https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#migrating-deployments-and-statefulsets-to-horizontal-autoscaling
> - https://stackoverflow.com/a/66431624/12771072

<br>

### .spec.metrics

#### ▼ metricsとは

自動水平スケーリングのトリガーとするメトリクスと、維持されるターゲット値を設定する。

#### ▼ type

メトリクスの種類を設定する。

以下のタイプを設定できる。

なお、カスタムメトリクスの元になるデータポイントを収集するためには、別途ツール (例：prometheus-adapter) が必要である。

| タイプ名   | 説明                                            | メトリクス例                                   |
| ---------- | ----------------------------------------------- | ---------------------------------------------- |
| `Resource` | リソースメトリクス                              | CPU使用率、メモリ使用率など                    |
| `Pods`     | Podのカスタムメトリクス                         | Queries Per Second、message broker’s queueなど |
| `Object`   | Pod以外のKubernetesリソースのカスタムメトリクス | Ingressに関するメトリクスなど                  |
| `External` | Kubernetes以外の任意のメトリクス                | AWS、Google Cloud、Azureに固有のメトリクス     |

> - https://qiita.com/masahata/items/062a2ee5762b108e8850

#### ▼ Resourceの場合

Deploymentのリソースメトリクスを指定する。

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: foo-horizontal-pod-autoscaler
spec:
  metrics:
    - type: Resource
      resource:
        name: cpu
        targetAverageUtilization: 60
```

> - https://zenn.dev/lapi/articles/e7ae967aa5161b#hpa%E3%81%AE%E8%A8%AD%E5%AE%9A
> - https://qiita.com/sheepland/items/37ea0b77df9a4b4c9d80

#### ▼ Podsの場合

Podのカスタムメトリクスを指定する。

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: foo-horizontal-pod-autoscaler
spec:
  metrics:
    - type: Pods
      resource:
        name: cpu
        targetAverageUtilization: 60
```

#### ▼ Objectの場合

記入中...

#### ▼ Externalの場合

記入中...

<br>

### .spec.scaleTargetRef

#### ▼ scaleTargetRefとは

自動水平スケーリングを実行するKubernetesリソースを設定する。

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: foo-horizontal-pod-autoscaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment # Deploymentで自動水平スケーリングを実行する。
    name: foo-deployment
```

> - https://qiita.com/sheepland/items/37ea0b77df9a4b4c9d80

#### ▼ Deploymentの場合

デプロイ戦略に基づいて、新しいReplicaSetを作成し、Podを自動水平スケーリングする。

#### ▼ ReplicaSetの場合

既存のReplicaSet配下でPodを自動水平スケーリングする。

#### ▼ StatefulSetの場合

デプロイ戦略に基づいて、新しいPodを自動水平スケーリングする。

<br>

## Ingress

### .metadata.annotations

#### ▼ annotationsとは

IngressClassの専用オプションを設定する。

<br>

### .spec.ingressClassName

#### ▼ ingressClassNameとは

IngressClassの`.metadata.name`キーの値を設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-ingress
spec:
  ingressClassName: foo-ingress-class
```

> - https://kubernetes.io/docs/concepts/services-networking/ingress/#the-ingress-resource
> - https://kubernetes.io/docs/concepts/services-networking/ingress/#deprecated-annotation

<br>

### .spec.hosts

#### ▼ hosts

ルーティング条件とするHostヘッダー値を設定する。

`.spec.rules[*].hosts`キーを設定しなければ、全てのHostヘッダー値が対象になる。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-ingress
spec:
  hosts: foo.example.com
```

<br>

### .spec.rules

#### ▼ rulesとは

Serviceへのルーティングルールを設定する。

複数のServiceにインバウンド通信を振り分けられる。

Ingressを使用する場合、宛先のServiceは、ClusterIP Serviceとする。

> - https://chidakiyo.hatenablog.com/entry/2018/09/10/Kubernetes_NodePort_vs_LoadBalancer_vs_Ingress%3F_When_should_I_use_what%3F_%28Kubernetes_NodePort_%E3%81%A8_LoadBalancer_%E3%81%A8_Ingress_%E3%81%AE%E3%81%A9%E3%82%8C%E3%82%92%E4%BD%BF%E3%81%86

#### ▼ .spec.rules[*].host

ホストベースルーティングの判定に使用するパス名を設定する。

本番環境では、ドメインを指定した各種ダッシュボードにリクエストを送信できる必要がある。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-ingress
spec:
  rules:
    - host:
        - prd.monitoring.com
      http:
        paths:
          - path: /
```

#### ▼ .spec.rules[*].http.paths[*].path

パスベースルーティングの判定に使用するパス名を設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-ingress
spec:
  rules:
    - http:
        paths:
          - path: /foo

    - http:
        paths:
          - path: /bar
```

> - https://kubernetes.io/docs/concepts/services-networking/ingress/#examples

#### ▼ .spec.rules[*].http.paths[*].pathType

パスベースルーティング判定時のルールの厳しさを設定する。

| 厳しさ                   | タイプ                 |                                                                                                                                                                                                                                                                                                      |
| ------------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| パス名の前方一致         | Prefix                 | 前方一致である。最初のパスさえ合致すれば、トレイリングスラッシュの有無や最初のパス以降のパスも許容して合致させる。そのため、ワイルドカード (`*`) は不要である。                                                                                                                                      |
| パス名の完全一致         | Exact                  | 完全一致である。指定したパスのみを合致させ、トレイリングスラッシュも有無も許容しない。                                                                                                                                                                                                               |
| IngressClassの機能による | ImplementationSpecific | IngressClass (例：Nginx、ALBなど) の設定に応じて、独自タイプ、Prefix、Exactを自動的に切り替える。そのため、IngressのルーティングルールがIngressClassに依存している。IngressClassの仕様変更や別のIngressClassへの移行があった場合に、Ingress Controllerが想定外のルーティングを実行する可能性がある。 |

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-ingress
spec:
  rules:
    - http:
        paths:
          - path: /foo
            pathType: Prefix

    - http:
        paths:
          - path: /bar
            pathType: Prefix
```

> - https://kubernetes.io/docs/concepts/services-networking/ingress/#examples
> - https://kubernetes.io/blog/2020/04/02/improvements-to-the-ingress-api-in-kubernetes-1.18/#better-path-matching-with-path-types
> - https://github.com/kubernetes-sigs/aws-load-balancer-controller/issues/2066

#### ▼ .spec.rules[*].http.paths[*].backend

宛先のServiceを設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-ingress
spec:
  rules:
    - http:
        paths:
          - path: /foo
            pathType: Prefix
            backend:
              service:
                name: foo-service # CluserIP Serviceとする。
                port:
                  number: 80
    - http:
        paths:
          - path: /bar
            pathType: Prefix
            backend:
              service:
                name: bar-service # CluserIP Serviceとする。
                port:
                  number: 80
```

<br>

## IngressClass

### .metadata.annotations

#### ▼ is-default-class

デフォルトのIngressClassとして設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-ingress-class
  annotations:
    ingressclass.kubernetes.io/is-default-class: true
spec: ...
```

> - https://kubernetes.io/docs/concepts/services-networking/ingress/#default-ingress-class

<br>

### .spec.controller

#### ▼ controllerとは

Ingress Controllerの実体として使用するツールのAPIグループを設定する。

> - https://kubernetes.io/docs/reference/kubernetes-api/service-resources/ingress-class-v1/#IngressClassSpec
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/ingress_class/#deprecated-kubernetesioingressclass-annotation
> - https://kubernetes.github.io/ingress-nginx/#i-have-only-one-ingress-controller-in-my-cluster-what-should-i-do

#### ▼ AWS ALBの場合

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-alb-ingress-class
spec:
  controller: ingress.k8s.aws/alb
```

#### ▼ Nginx Ingressの場合

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-ingress-class
spec:
  controller: k8s.io/ingress-nginx
```

#### ▼ Istio Ingressの場合

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-istio-ingress-class
spec:
  controller: istio.io/ingress-controller
```

> - https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/#specifying-ingressclass

<br>

### .spec.parameters

#### ▼ parametersとは

外部Ingressに応じたオプションを設定する。

代わりに、IngressClassParamsを使用しても良い。

#### ▼ AWS ALBの場合

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-alb-ingress-class
spec:
  parameters:
    apiGroup: elbv2.k8s.aws
    kind: IngressClassParams
    name: foo-alb-ingress-class-params
```

> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/ingress_class/#ingressclass
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/ingress_class/#ingressclassparams

<br>

## Gateway

### spec.gatewayClassName

#### ▼ gatewayClassNameとは

GatewayClassの`.metadata.name`キーの値を設定する。

Gatewayは共有のNamespaceに配置し、HTTPRouteはマイクロサービスのある各Namespaceに配置する。

> - https://gateway-api.sigs.k8s.io/concepts/api-overview/?h=reencrypt#attaching-routes-to-gateways
> - https://kubernetes.io/blog/2021/04/22/evolving-kubernetes-networking-with-the-gateway-api/#what-does-the-gateway-api-look-like

#### ▼ Nginxの場合

Nginxを作成する。

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: gateway
  namespace: istio-ingress
spec:
  gatewayClassName: istio
```

> - https://gateway-api.sigs.k8s.io/api-types/gateway/
> - https://developer.mamezou-tech.com/blogs/2022/07/24/k8s-gateway-api-intro/

#### ▼ istioの場合

Istio Ingress Gatewayを作成する。

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: gateway
  namespace: istio-ingress
spec:
  gatewayClassName: istio
```

> - https://gateway-api.sigs.k8s.io/api-types/gateway/
> - https://developer.mamezou-tech.com/blogs/2022/07/24/k8s-gateway-api-intro/

#### ▼ istio-waypointの場合

Istioのwaypoint-proxyを作成する。

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: gateway
  namespace: istio-ingress
spec:
  gatewayClassName: istio-waypoint
```

> - https://istio.io/latest/blog/2023/waypoint-proxy-made-simple/

<br>

### spec.listeners

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: gateway
  namespace: istio-ingress
spec:
  # Istio Ingress Gatewayを作成する
  gatewayClassName: istio
  listeners:
    - name: default
      hostname: "*.example.com"
      port: 443
      protocol: HTTPS
      tls:
        certificateRefs:
          - kind: Secret
            group: ""
            name: self-signed-cert
            namespace: istio-ingress
      allowedRoutes:
        namespaces:
          from: All
```

> - https://gateway-api.sigs.k8s.io/api-types/gateway/
> - https://developer.mamezou-tech.com/blogs/2022/07/24/k8s-gateway-api-intro/

<br>

## GatewayClass

### spec.controllerName

#### ▼ controllerNameとは

Gatewayの実体として使用するツールのAPIグループを設定する。

```yaml
kind: GatewayClass
metadata:
  name: foo-gateway
spec:
  controllerName: "example.net/gateway-controller"
```

> - https://gateway-api.sigs.k8s.io/api-types/gatewayclass/

#### ▼ Envoyの場合

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: envoy-gateway
spec:
  controllerName: gateway.envoyproxy.io/gatewayclass-controller
```

> - https://github.com/envoyproxy/gateway/blob/v0.5.0/examples/kubernetes/quickstart.yaml#L1-L6

#### ▼ Istioの場合

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: istio
spec:
  controllerName: istio.io/gateway-controller
```

> - https://openfunction.dev/docs/operations/networking/switch-gateway/
> - https://www.tkng.io/ingress/gateway/

#### ▼ Traefikの場合

記入中...

#### ▼ AWS VPC Latticeの場合

AWS VPC Latticeをプロビジョニングする。

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: amazon-vpc-lattice
spec:
  controllerName: application-networking.k8s.aws/gateway-api-controller
```

> - https://github.com/aws/aws-application-networking-k8s/blob/main/examples/gatewayclass.yaml
> - https://aws.amazon.com/jp/blogs/news/introducing-aws-gateway-api-controller-for-amazon-vpc-lattice-an-implementation-of-kubernetes-gateway-api/

<br>

## NetworkPolicy

### NetworkPolicyとは

自身の所属するNamespaceに対して、インバウンドとアウトバウンドな通信を制限する。

それぞれのNamespaceでNetworkPolicyを作成すると、Namespace間の通信はデフォルトで拒否になる。

そのため、許可するように設定する。

<br>

### egress

許可するアウトバウンド通信を設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: foo-network-policy
  namespace: foo
spec:
  policyTypes:
    - Egress
  egress:
    # アウトバウンド通信の宛先IPアドレス
    - to:
        # 送信を許可するCIDRブロック
        - ipBlock:
            cidr: 10.0.0.0/24
      # アウトバウンド通信の宛先ポート
      ports:
        - protocol: TCP
          port: 5978
```

> - https://kubernetes.io/docs/concepts/services-networking/network-policies/#networkpolicy-resource

<br>

### ingress

許可するインバウンド通信を設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: foo-network-policy
  namespace: foo
spec:
  policyTypes:
    - Ingress
  ingress:
    # インバウンド通信の送信元IPアドレス
    - from:
        # Cluster外からのインバウンド通信のうちで、受信を許可するCIDRブロック
        - ipBlock:
            cidr: 172.17.0.0/16
            except:
              - 172.17.1.0/24
        # 受信を許可するNamespace
        - namespaceSelector:
            matchLabels:
              project: myproject
        # 同じNamespaceに所属するPodからのインバウンド通信のうちで、受信を許可するPod
        - podSelector:
            matchLabels:
              role: frontend
    # インバウンド通信の宛先ポート
    - ports:
        - protocol: TCP
          port: 6379
```

> - https://kubernetes.io/docs/concepts/services-networking/network-policies/#networkpolicy-resource

<br>

### podSelector

#### ▼ podSelectorとは

NetworkPolicyを適用するPodを設定する。

#### ▼ matchLabels

`metadata.labels`キーの値でPodを選ぶ。

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: foo-network-policy
  namespace: foo
spec:
  podSelector:
    matchLabels:
      name: app
```

> - https://kubernetes.io/docs/concepts/services-networking/network-policies/#networkpolicy-resource

#### ▼ 空

空 (`{}`) を設定し、いずれのPodも許可の対象としない。

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: foo-network-policy
  namespace: foo
spec:
  # 全てのPodを拒否する
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

> - https://qiita.com/dingtianhongjie/items/983417de88db2553f0c2#%E3%83%87%E3%83%95%E3%82%A9%E3%83%AB%E3%83%88%E3%83%9D%E3%83%AA%E3%82%B7%E3%83%BC%E3%81%AE%E8%A8%AD%E5%AE%9A

<br>

### policyTypes

許否ルールを適用する通信タイプを設定する。

デフォルト値は`Ingress`タイプが設定される。

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: foo-network-policy
  namespace: foo
spec:
  policyTypes:
    # インバウンド通信に適用する
    - Ingress
    # アウトバウンド通信に適用する
    - Egress
```

<br>

## Job

### .spec.activeDeadlineSeconds

#### ▼ activeDeadlineSecondsとは

Jobの試行の上限実行時間を設定する。

設定された時間を超過すると、エラーが返却される。

`.spec.backoffLimit`キーよりも優先される。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: foo-job
spec:
  activeDeadlineSeconds: 20
```

> - https://kubernetes.io/docs/concepts/workloads/controllers/job/#job-termination-and-cleanup

<br>

### .spec.backoffLimit

#### ▼ backoffLimitとは

Jobの試行の上限数を設定する。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: foo-job
spec:
  backoffLimit: 4
```

<br>

### .spec.parallelism

#### ▼ parallelismとは

同時に起動できるPod数を設定する。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: foo-job
spec:
  parallelism: 3
```

> - https://kubernetes.io/docs/concepts/workloads/controllers/job/#controlling-parallelism

<br>

### .spec.template

#### ▼ templateとは

起動するPodを設定する。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: foo-job
spec:
  template:
    spec:
      containers:
        - name: foo-alpine
          image: alpine:latest
          command:
            - /bin/bash
            - -c
          args:
            - echo Hello World
      restartPolicy: OnFailure
      nodeSelector:
        node.kubernetes.io/nodetype: foo
```

> - https://kubernetes.io/docs/concepts/workloads/controllers/job/#pod-template

<br>

### .spec.ttlSecondsAfterFinished

#### ▼ ttlSecondsAfterFinishedとは

Jobが成功/失敗した場合のJob自体の削除を有効化しつつ、その秒数を設定する。

失敗したJobが残り続けると、データポイント収集ツール (例：Prometheus) でメトリクスが記録され続け、アラートを送信し続けてしまう。

そのため、できるだけJobは削除した方が良い。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: foo-job
spec:
  # Job自体の削除を有効化しつつ、Jobの実行が終了してから30秒後とする
  ttlSecondsAfterFinished: 30
```

> - https://kubernetes.io/docs/concepts/workloads/controllers/job/#clean-up-finished-jobs-automatically
> - https://dev.appswingby.com/kubernetes/kubernetes-%E3%81%A7-job%E3%82%92%E8%87%AA%E5%8B%95%E5%89%8A%E9%99%A4%E3%81%99%E3%82%8Bttlsecondsafterfinished%E3%81%8Cv1-21%E3%81%A7beta%E3%81%AB%E3%81%AA%E3%81%A3%E3%81%A6%E3%81%84%E3%81%9F%E4%BB%B6/

<br>

## Node

Kubernetesの実行時に自動的に作成される。

もし手動で作成する場合は、`kubectl`コマンドを実行することにより、その時に`--register-node`キーを`false`とする必要がある。

<br>

## LimitRange

### .spec.limit

#### ▼ Containerの場合

Namespace内のコンテナのハードウェアリソースの上限必要サイズを設定する。

Podの`.spec.containers[*].resources`キー配下に設定がなくとも、コンテナの実行時に自動的に挿入できる。

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: foo-limit-range
  namespace: foo
spec:
  limits:
    - max:
        cpu: "500m"
      min:
        cpu: "200m"
      type: Container
```

> - https://kubernetes.io/docs/concepts/policy/limit-range/

<br>

## PersistentVolume

### .spec.accessModes

#### ▼ accessModesとは

ボリュームへの認可スコープを設定する。

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes

#### ▼ ReadWriteMany

ボリュームに対して、複数のNodeから読み出し/書き込み可能にする。

Node間でDBを共有したい場合に使用する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  accessModes:
    - ReadWriteMany
```

#### ▼ ReadOnlyMany

ボリュームに対して、複数のNodeから読み出しでき、また単一のNodeのみから書き込み可能にする。

Node間で読み出し処理のみDBを共有したい場合に使用する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  accessModes:
    - ReadOnlyMany
```

#### ▼ ReadWriteOnce

ボリュームに対して、単一のNodeからのみ読み出し/書き込み可能にする。

もしNodeにPodのインスタンスが複数ある場合、`ReadWriteOnce`であっても複数のPodから読み込み/書き込みがある。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  accessModes:
    - ReadWriteOnce
```

> - https://qiita.com/xanadou/items/be8c49eb56e36584891b

<br>

### .spec.capacity

#### ▼ capacityとは

ストレージの最大サイズを設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  capacity:
    storage: 10G
```

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#capacity

<br>

### .spec.hostPath

#### ▼ hostPathとは

PersistentVolumeの一種であるHostPath Volumeを作成する。

Volumeの一種であるPodによるHostPath Volumeとは区別すること。

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/

#### ▼ path

Node側のマウント元のディレクトリを設定する。

Podのマウントポイントは、Podの`.spec.containers[*].volumeMount`キーで設定する。

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  hostPath:
    path: /data/src/foo
```

#### ▼ type

マウント方法を設定する。

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  hostPath:
    type: DirectoryOrCreate
    path: /data/src/foo
```

<br>

### .spec.local

#### ▼ localとは

Node上にストレージ上にボリュームを作成する。

`.spec.nodeAffinity`キーの設定が必須であり、Nodeを明示的に指定できる。

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  local:
    path: /data/src/foo
  nodeAffinity:
    required:
      nodeSelectorTerms:
        - matchExpressions:
            - key: kubernetes.io/hostname
              operator: In
              values:
                - foo-node
```

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/
> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#node-affinity

<br>

### .spec.mountOptions

#### ▼ mountOptionsとは

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  mountOptions:
    - hard
```

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#mount-options

<br>

### .spec.nfs

#### ▼ nfsとは

ホスト上であらかじめNFSサーバーを起動しておく。

NFSサーバーのストレージ上にボリュームを作成する。

Node内のPodを、ホスト上のNFSサーバーにマウントする。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  nfs:
    server: <NFSサーバーのIPアドレス>
    path: /data/src/foo
```

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#mount-options
> - https://ytsuboi.jp/archives/505
> - https://qiita.com/reoring/items/4d80a04dd31e991dd233

<br>

### .spec.nodeAffinity

#### ▼ nodeAffinityとは

PersistentVolumeの作成先とするNodeを設定する。

> - https://qiita.com/ysakashita/items/67a452e76260b1211920

#### ▼ required.nodeSelectorTerms.matchExpressions

作成先のNodeの`.metadata.labels`キーを指定するための条件 (`In`、`NotIn`、`Exists`) を設定する。

| 設定値        | 条件の説明                                                  |
| ------------- | ----------------------------------------------------------- |
| In            | 指定した`metadata.labels`キー配下に、指定した値を持つ。     |
| NotIn         | 指定した`metadata.labels`キー配下に、指定した値を持たない。 |
| Exists        | 指定した`metadata.labels`キーを持つ。                       |
| DoesNotExists | 指定した`metadata.labels`キーを持たない。                   |

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  local:
    path: /data/src/foo
  nodeAffinity:
    required:
      nodeSelectorTerms:
        - matchExpressions:
            # metadata.labelsキー
            - key: node.kubernetes.io/nodetype
              operator: In
              # metadata.labelsキーの値
              values:
                - bar-group
              # 開発環境であれば minikubeを指定する。
              # - minikube
```

> - https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#set-based-requirement
> - https://riyafa.wordpress.com/2020/06/07/kubernetes-matchexpressions-explained/

<br>

### .spec.persistentVolumeReclaimPolicy

#### ▼ persistentVolumeReclaimPolicyとは

PersistentVolumeのライフサイクルを設定する。

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#reclaim-policy

#### ▼ Delete

PersistentVolumeを指定するPersistentVolumeClaimが削除された場合、PersistentVolumeも自動的に削除する。

クラウドプロバイダーのPersistentVolumeの動的プロビジョニングのために使用することが多い。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  persistentVolumeReclaimPolicy: Delete
```

> - https://www.amazon.co.jp/dp/B07HFS7TDT

#### ▼ Recycle (非推奨)

PersistentVolumeを指定するPersistentVolumeClaimが削除された場合、PersistentVolume内のデータのみを削除し、PersistentVolume自体は削除しない。

将来的に廃止予定のため、非推奨。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  persistentVolumeReclaimPolicy: Recycle
```

> - https://www.amazon.co.jp/dp/B07HFS7TDT

#### ▼ Retain

PersistentVolumeを指定するPersistentVolumeClaimが削除されたとしても、PersistentVolumeは削除しない。

割り当てから解除されたPersistentVolumeはReleasedステータスになる。

一度、Releasedステータスになると、他のPersistentVolumeClaimからは指定できなくなる。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  persistentVolumeReclaimPolicy: Retain
```

> - https://www.amazon.co.jp/dp/B07HFS7TDT

<br>

### .spec.storageClassName

#### ▼ storageClassNameとは

ストレージクラス名を設定する。

特に、PersistentVolumeClaimがStorageClassに対応するPersistentVolumeを要求する時に役立つ。

例えば、StorageClassに数種類のボリュームタイプ (`standard`、`fast`、`slow`、`gp2`など) がある場合に、区別しやすくなる。

PersistentVolumeにストレージクラス名を設定しない場合、これを要求できるのは、同じくストレージクラス名を持たないPersistentVolumeClaimだけである。

注意点として、もし異なるStorageClassNameに変更したい場合は、PersistentVolumeを作成し直す必要がある。

| クラス名              | 説明                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `""` (明示的な空文字) | PersistentVolumeに対応するStorageClassがない場合 (PersistentVolumeを使用するが、StorageClassは使用しない場合) につける。 |
| `local`               | PersistentVolumeに対応するStorageClassが中速中容量ストレージの場合につける。                                             |
| `standard`            | PersistentVolumeに対応するStorageClassが中速中容量ストレージの場合につける。                                             |
| `fast`                | PersistentVolumeに対応するStorageClassが高速小容量ストレージの場合につける。                                             |
| `slow`                | PersistentVolumeに対応するStorageClassが低速大容量ストレージの場合につける。                                             |

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  storageClassName: standard
```

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#class
> - https://stackoverflow.com/questions/61187909/how-do-i-change-the-storage-class-of-existing-persistent-volumes
> - https://stackoverflow.com/a/46415672

<br>

## PersistentVolumeClaim

### .spec.accessModes

#### ▼ accessModesとは

要求対象のPersistentVolumeのaccessModeを設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: foo-persistent-volume-claim
spec:
  accessModes:
    - ReadWriteMany
```

<br>

### .spec.resources

#### ▼ resourcesとは

要求する仮想ハードウェアのKubernetesリソースを設定する。

#### ▼ requests

要求対象のPersistentVolumeのrequestsを設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: foo-persistent-volume-claim
spec:
  resources:
    requests:
      storage: 2Gi
```

<br>

### .spec.storageClassName

#### ▼ storageClassNameとは

要求対象のPersistentVolumeのストレージクラス名を設定する。

これを設定しない場合は、ストレージクラス名が`standard`のPersistentVolumeを要求する。

注意点として、もし異なるStorageClassNameに変更したい場合は、PersistentVolumeを作成し直す必要がある。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: foo-persistent-volume-claim
spec:
  storageClassName: standard
```

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#class
> - https://stackoverflow.com/questions/61187909/how-do-i-change-the-storage-class-of-existing-persistent-volumes

<br>

## Pod

### .spec.affinity

#### ▼ affinityとは

Podのスケジューリング対象のNodeを設定する。

`.spec.tolerations`キーとは反対の条件である。

`.spec.nodeSelector`キーと比較して、より複雑に条件を設定できる。

DeploymentやStatefulでこれを使用する場合は、Podのレプリカそれぞれが独立し、条件に合わせてkube-schedulerがスケジューリングさせる。

> - https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity
> - https://www.devopsschool.com/blog/understanding-node-selector-and-node-affinity-in-kubernetes/
> - https://hawksnowlog.blogspot.com/2021/03/namespaced-pod-antiaffinity-with-deployment.html#%E7%95%B0%E3%81%AA%E3%82%8B-namespace-%E9%96%93%E3%81%A7-podantiaffinity-%E3%82%92%E4%BD%BF%E3%81%86%E5%A0%B4%E5%90%88

<br>

### .spec.affinity.nodeAffinity

#### ▼ affinity.nodeAffinityとは

Nodeの`.metadata.labels`キーを指定することにより、kube-schedulerがPodをスケジューリングさせるNodeを設定する。

`.spec.nodeSelector`キーと比較して、より複雑に条件を設定できる。

DeploymentやStatefulでこれを使用する場合は、Podのレプリカそれぞれが独立し、kube-schedulerは条件に合わせてスケジューリングさせる。

複数のNodeに同じ`.metadata.labels`キーを付与しておき、このNode群をNodeグループと定義すれば、特定のNodeにPodを作成するのみでなくNodeグループ単位でPodをスケジューリングさせられる。

> - https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity
> - https://www.devopsschool.com/blog/understanding-node-selector-and-node-affinity-in-kubernetes/
> - https://hawksnowlog.blogspot.com/2021/03/namespaced-pod-antiaffinity-with-deployment.html#%E7%95%B0%E3%81%AA%E3%82%8B-namespace-%E9%96%93%E3%81%A7-podantiaffinity-%E3%82%92%E4%BD%BF%E3%81%86%E5%A0%B4%E5%90%88

#### ▼ requiredDuringSchedulingIgnoredDuringExecution (ハード)

条件に合致するNodeにのみPodをスケジューリングさせる。

もし条件に合致するNodeがない場合、Podのスケジューリングを待機し続ける。

共通する`SchedulingIgnoredDuringExecution`の名前の通り、`.spec.affinity`キーによるスケジューリングの制御は新しく作成されるPodにしか適用できず、すでに実行中のPodには適用できず、再スケジューリングさせないといけない。

Podが削除された後にNodeの`.metadata.labels`キーの値が変更されたとしても、一度スケジューリングされたPodが`.spec.affinity`キーの設定で再スケジューリングされることはない。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
  affinity:
    nodeAffinity:
      # ハードアフィニティ
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              # PodをスケジューリングさせたいNodeのmetadata.labelsキー
              # ここでNodeグループのキーを指定しておけば、Nodeグループ単位でスケジューリングさせられる。
              - key: node.kubernetes.io/nodetype
                operator: In
                # 指定した値をキーに持つNodeに、Podをスケジューリングさせる。
                values:
                  - app
```

> - https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity
> - https://cstoku.dev/posts/2018/k8sdojo-18/#%E6%9D%A1%E4%BB%B6%E3%81%AE%E5%BF%85%E9%A0%88%E8%A6%81%E4%BB%B6%E3%81%A8%E6%8E%A8%E5%A5%A8%E8%A6%81%E4%BB%B6

#### ▼ preferredDuringSchedulingIgnoredDuringExecution (ソフト)

条件に合致するNodeに優先的にPodをスケジューリングさせる。

もし条件に合致するNodeがない場合でも、それを許容し、条件に合致しないNodeにPodをスケジューリングさせる。

条件に合致しないNodeの探索で重みづけルールを設定できる。

共通する`SchedulingIgnoredDuringExecution`の名前の通り、`.spec.affinity`キーによるスケジューリングの制御は新しく作成されるPodにしか適用できない。

すでに実行中のPodには適用できず、再スケジューリングさせないといけない。

Podが削除された後にNodeの`.metadata.labels`キーの値が変更されたとしても、一度スケジューリングされたPodが`.spec.affinity`キーの設定で再スケジューリングされることはない。

> - https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity
> - https://cstoku.dev/posts/2018/k8sdojo-18/#%E6%9D%A1%E4%BB%B6%E3%81%AE%E5%BF%85%E9%A0%88%E8%A6%81%E4%BB%B6%E3%81%A8%E6%8E%A8%E5%A5%A8%E8%A6%81%E4%BB%B6

<br>

### .spec.affinity.podAffinity

#### ▼ affinity.podAffinityとは

Node内のPodを、`.metadata.labels`キーで指定することにより、そのPodと同じNode内に、新しいPodをスケジューリングさせる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
  affinity:
    podAffinity:
      # ハードアフィニティー
      requiredDuringSchedulingIgnoredDuringExecution:
        # 分散単位
        - topologyKey: kubernetes.io/hostname
          labelSelector:
            - matchExpressions:
                # Podのmetadata.labelsキー
                - key: app.kubernetes.io/name
                  operator: In
                  # 指定した値をキーに持つPodと同じNodeに、Podをスケジューリングさせる。
                  values:
                    - bar-gin
```

> - https://qiita.com/Esfahan/items/a673317a29ca407e5ae7#pod-affinity
> - https://zenn.dev/geek/articles/c74d204b00ba1a

preferredDuringSchedulingIgnoredDuringExecutionの場合、`podAffinityTerm`キーや`preference`キーが必要である。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
  affinity:
    podAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            topologyKey: kubernetes.io/hostname
            labelSelector:
              - matchExpressions:
                  - key: app.kubernetes.io/name
                    operator: In
                    values:
                      - bar-gin
```

> - https://qiita.com/kanazawa1226/items/4e5bb6715b52da6649d7#podaffinity--podantiaffinity

#### ▼ requiredDuringSchedulingIgnoredDuringExecution (ハード)

`.spec.affinity.nodeAffinity`キーのPod版である。

#### ▼ preferredDuringSchedulingIgnoredDuringExecution (ソフト)

`.spec.affinity.nodeAffinity`キーのPod版である。

<br>

### .spec.affinity.podAntiAffinity

#### ▼ affinity.podAntiAffinityとは

`.metadata.labels`キーを持つNodeとは異なるNode内に、そのPodをスケジューリングさせる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
  affinity:
    podAntiAffinity:
      # ハードアフィニティー
      requiredDuringSchedulingIgnoredDuringExecution:
        # Podの分散単位
        - topologyKey: topology.kubernetes.io/zone
          labelSelector:
            - matchExpressions:
                # Podのmetadata.labelsキー
                - key: app.kubernetes.io/name
                  operator: In
                  # 指定した値をキーに持つPodとは異なるNodeに、Podをスケジューリングさせる。
                  values:
                    - bar-gin
```

> - https://hawksnowlog.blogspot.com/2021/03/namespaced-pod-antiaffinity-with-deployment.html

preferredDuringSchedulingIgnoredDuringExecutionの場合、`podAffinityTerm`キーや`preference`キーが必要である。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            topologyKey: topology.kubernetes.io/zone
            labelSelector:
              - matchExpressions:
                  - key: app.kubernetes.io/name
                    operator: In
                    values:
                      - bar-gin
```

> - https://qiita.com/kanazawa1226/items/4e5bb6715b52da6649d7#podaffinity--podantiaffinity

**＊スケジューリング例＊**

もし、コピーするPodの名前を設定した場合、Podのレプリカ同士は同じNodeにスケジューリングされることを避ける。

また、分散単位に`topology.kubernetes.io/zone`を設定しているため、各AZにPodをバラバラにスケジューリングさせる。

結果として、各AZのNodeにPodが`1`個ずつスケジューリングされるようになる。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
  replicas: 3
  template:
    metadata:
      labels:
        app.kubernetes.io/name: foo-pod
    spec:
      containers:
        - name: app
          image: app:1.0.0
          ports:
            - containerPort: 8080
      affinity:
        podAntiAffinity:
          # ハードアフィニティー
          requiredDuringSchedulingIgnoredDuringExecution:
            # Podの分散単位
            - topologyKey: topology.kubernetes.io/zone
              labelSelector:
                - matchExpressions:
                    # Podのmetadata.labelsキー
                    - key: app.kubernetes.io/name
                      operator: In
                      # 指定した値をキーに持つPodとは異なるNodeに、Podをスケジューリングさせる。
                      values:
                        # 自身がコピーするPodの名前
                        - app
```

#### ▼ requiredDuringSchedulingIgnoredDuringExecution (ハード)

`.spec.affinity.nodeAffinity`キーのアンチPod版である。

#### ▼ preferredDuringSchedulingIgnoredDuringExecution (ソフト)

`.spec.affinity.nodeAffinity`キーのアンチPod版である。

#### ▼ node affinity conflict

ただし、AWSのスポットインスタンスと相性が悪く、特定のAZでしかNodeが作成されなかった場合に、以下のようなエラーになってしまう。

```bash
N node(s) had volume node affinity conflict, N node(s) didn't match Pod's node affinity/selector
```

> - https://hawksnowlog.blogspot.com/2021/03/namespaced-pod-antiaffinity-with-deployment.html#%E7%95%B0%E3%81%AA%E3%82%8B-namespace-%E9%96%93%E3%81%A7-podantiaffinity-%E3%82%92%E4%BD%BF%E3%81%86%E5%A0%B4%E5%90%88

<br>

### .spec.containers

#### ▼ containersとは

Pod内で起動するコンテナを設定する。

PodをDeploymentやReplicaSetに紐付けずに使用することは非推奨である。

> - https://kubernetes.io/docs/concepts/configuration/overview/#naked-pods-vs-replicasets-deployments-and-jobs

#### ▼ name、image

Podを構成するコンテナの名前、ベースイメージを設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
```

AWS ECRからコンテナイメージをプルする場合は、以下の通りである。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository/app:1.0.0
      ports:
        - containerPort: 8080
```

> - https://developer.mamezou-tech.com/containers/k8s/tutorial/app/container-registry/#%E5%8B%95%E4%BD%9C%E7%A2%BA%E8%AA%8D

#### ▼ env

環境変数を設定する。

**＊実装例＊**

`status.podIP`から自身のIPアドレスを取得し、`MY_POD_IP`という名前で設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
      env:
        - name: MY_POD_IP
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: status.podIP
```

#### ▼ envFrom

`.spec.volumes.secret`キー (ファイルをコンテナに設定する) とは異なり、SecretやConfigMapからコンテナに環境変数を出力する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
      envFrom:
        - secretRef:
            # 環境変数としてコンテナに出力するSecret
            name: foo-secret
        - configMapRef:
            # 環境変数としてコンテナに出力するConfigMap
            name: foo-config-map
```

#### ▼ ports

コンテナが待ち受けるポート番号を、仕様として設定する。

単なる仕様であり、ドキュメントとしての役割がある。

コンテナがポート番号を公開してさえいれば、`.spec.containers[*].ports`キーは設定しなくとも問題ない。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      # 待ち受けるポート番号の仕様
      ports:
        # コンテナがポート番号を公開していれば、設定しなくてもポートは公開されている
        - containerPort: 8080
```

> - https://qiita.com/masahata/items/f3792d4ee06b42376cbc

#### ▼ imagePullPolicy

イメージのプルのルールを設定する。

| オプション   | 説明                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| IfNotPresent | Node上にコンテナイメージのキャッシュがあればこれを使用する。なければイメージリポジトリからぷるする。 |
| Always       | Node上のキャッシュを使用せず、常にイメージリポジトリからコンテナイメージをプルする。                 |
| Never        | Node上にコンテナイメージのキャッシュを常にを使用する。                                               |

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      imagePullPolicy: IfNotPresent
      ports:
        - containerPort: 8080
```

> - https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy

#### ▼ resources.requests、resources.limits

Node全体のハードウェアリソースを分母として、Pod内のコンテナが要求するリソースの下限/上限必要サイズを設定する。

各PodはNode内のハードウェアリソース (`cpu`、`memory`、`ephemeral-storage`) を奪い合っており、Nodeが複数ある場合、kube-schedulerは`requests`値以上の余剰があるNode上にPodのスケジューリングを実行する。

この時kube-schedulerは、コンテナの`resource`キーの値に基づいて、どのNodeにPodを作成するかを決めている。

同じPod内に`resources`キーが設定されたコンテナが複数ある場合、下限/上限必要サイズを満たしているか否かの判定は、同じPod内のコンテナの要求サイズの合計値に基づくことになる。

| キー名     | 説明                                             | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `requests` | ハードウェアリソースの下限必要サイズを設定する。 | ・高くしすぎると、そのPod内のコンテナがハードウェアリソースを常に要求するため、他のPodがスケーリングしにくくなる。<br>・もし、設定値がNodeのハードウェアリソース以上の場合、コンテナは永遠に起動しない。<br>・https://qiita.com/jackchuka/items/b82c545a674975e62c04#cpu <br>・もし、これを設定しない場合は、コンテナが使用できるハードウェアリソースの下限がなくなる。そのため、Kubernetesが重要なPodにリソースを必要最低限しか割かず、性能が低くなる可能性がある。                                                                                                                                                                                                                                                                                                                                                                     |
| `limits`   | ハードウェアリソースの上限必要サイズを設定する。 | ・低くしすぎると、コンテナにハードウェアリソースを割り当てられないため、性能が常時悪くなる。<br>・もし、コンテナが上限値以上のハードウェアリソースを要求すると、CPUの場合はPodは削除されずに、コンテナのスロットリング (起動と停止を繰り返す) が起こる。一方でメモリの場合は、OOMキラーによってPodのプロセスが削除され、Podは再作成される。<br>・https://blog.mosuke.tech/entry/2020/03/31/kubernetes-resource/ <br>・もし、これを設定しない場合は、コンテナが使用できるハードウェアリソースの上限がなくなる。そのため、Kubernetesが重要でないPodにリソースを割いてしまう可能性がある。<br>・https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/#if-you-do-not-specify-a-cpu-limit <br>・https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/#if-you-do-not-specify-a-memory-limit |

補足として、Node全体のハードウェアリソースは、`kubectl describe`コマンドから確認できる。

```bash
$ kubectl describe node <Node名>

...

Capacity:
  attachable-volumes-aws-ebs:  20
  cpu:                         4           # NodeのCPU
  ephemeral-storage:           123456789Ki
  hugepages-1Gi:               0
  hugepages-2Mi:               0
  memory:                      1234567Ki   # Nodeのメモリー
  pods:                        10          # スケジューリング可能なPodの最大数
Allocatable:
  attachable-volumes-aws-ebs:  20
  cpu:                         3920m       # 実際に使用可能なCPU
  ephemeral-storage:           123456789
  hugepages-1Gi:               0
  hugepages-2Mi:               0
  memory:                      1234567Ki    # 実際に使用可能なメモリ
  pods:                        10

...
```

> - https://newrelic.com/jp/blog/best-practices/set-requests-and-limits-for-your-clustercapacity-management
> - https://kubernetes.io/docs/concepts/architecture/nodes/#capacity
> - https://smallit.co.jp/blog/667/

#### ▼ resources.requests/limits.<ハードウェアリソース>

| ハードウェアリソース名 |                                                     | 単位                                              |
| ---------------------- | --------------------------------------------------- | ------------------------------------------------- |
| `cpu`                  | コンテナのCPU                                       | m：millicores (`1`m = `1` ユニット = `0.001`コア) |
| `memory`               | コンテナのメモリ                                    | Mi：mebibyte (`1`Mi = `1.04858`MB)                |
| `ephemeral-storage`    | EmptyDir Volume、ログ、ローカルディスクへの書き込み | Mi：mebibyte                                      |

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      resources:
        # 下限必要サイズ
        requests:
          cpu: 250m
          ephemeral-storage: 500Mi
          memory: 64Mi
        # 上限サイズ
        limits:
          cpu: 500m
          ephemeral-storage: 2Gi
          memory: 512Mi
    - name: istio-proxy
      ...
```

各コンテナの実際のハードウェアリソース消費量を確認する場合は、`kubectl top`コマンドを使用する。

『`(実測値) ÷ (メモリ上限値) × 100`』で計算できる。

```bash
$ kubectl top pod --container -n foo-namespace

POD       NAME          CPU(cores)   MEMORY(bytes)
foo-pod   app           1m           19Mi          # 19Mi ÷ 128Mi × 100 = 14%
foo-pod   istio-proxy   5m           85Mi
```

> - https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws/4/html/storage/understanding-ephemeral-storage#storage-ephemeral-storage-scheduling-eviction_understanding-ephemeral-storage

#### ▼ volumeMounts

Pod内のコンテナのマウントポイントを設定する。

パスは相対パスではなく絶対パスで指定する。

`.spec.volumes`キーで設定されたボリュームのうちから、コンテナにマウントするボリュームを設定する。

Node側のマウント元のディレクトリは、PersistentVolumeの`.spec.hostPath`キーで設定する。

volumeMountという名前であるが、『ボリュームマウント』を実行するわけではなく、VolumeやPersistentVolumeで設定された任意のマウントを実行できることに注意する。

> - https://github.com/kubernetes/kubernetes/issues/48749

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
      volumeMounts:
        - name: app-volume
          # 絶対パスにする
          mountPath: /go/src
  volumes:
    - name: app-volume
      persistentVolumeClaim:
        claimName: foo-persistent-volume-claim
```

> - https://stackoverflow.com/questions/62312227/docker-volume-and-kubernetes-volume

**＊実装例＊**

Secretの名前を指定することもできる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
      volumeMounts:
        - name: app-volume
          # 絶対パスにする
          mountPath: /go/src
  volumes:
    - name: app-volume
      secret:
        secretName: app-secret
```

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
      # 資格情報ファイルをマウントする
      volumeMounts:
        - name: credentials-volume
          # 絶対パスにする
          mountPath: /credentials
      env:
        # Google Cloudの資格情報のパスを設定する
        - name: GOOGLE_APPLICATION_CREDENTIALS
          value: /credentials/google_cloud_credentials.json
  volumes:
    - name: credentials-volume
      secret:
        secretName: app-secret
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  google_cloud_credentials.json: *****
```

#### ▼ workingDir

コンテナの作業ディレクトリを設定する。

ただし、作業ディレクトリの設定はアプリケーション側の責務のため、Kubernetesで設定するよりもDockerfileで定義した方が良い。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
      workingDir: /go/src
```

<br>

### .spec.containers[*].livenessProbe

#### ▼ livenessProbeとは

kubeletがヘルスチェックを実行することで、コンテナが正常に動作しているか確認する。

注意点として、LivenessProbeヘルスチェックの間隔が短すぎると、kubeletに必要以上に負荷がかかる。

`terminationGracePeriodSeconds`に関しては、`.spec.terminationGracePeriodSeconds`キーでPod単位での待機時間を設定することもできる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-app-springboot
      image: foo-app-springboot:1.0.0
      livenessProbe:
        httpGet:
          port: 8080
          # SpringBoot製Javaアプリのlivenessエンドポイント
          path: /actuator/health/liveness
          scheme: HTTP
        # 各設定のデフォルト値を示す
        initialDelaySeconds: 0
        periodSeconds: 10
        timeoutSeconds: 1
        successThreshold: 1
        failureThreshold: 3
        terminationGracePeriodSeconds: 30
  terminationGracePeriodSeconds: 30
```

> - https://www.ianlewis.org/jp/kubernetes-health-check
> - https://amateur-engineer-blog.com/livenessprobe-readinessprobe/
> - https://spring.io/blog/2020/03/25/liveness-and-readiness-probes-with-spring-boot

#### ▼ exec

コンテナのLivenessProbeヘルスチェックで、任意のコマンドによるヘルスチェックを実行する。

終了コード`0`なら成功である。

LivenessProbeが対応可能なプロトコル (HTTP、TCP、gRPCによるHTTP) 以外で、ヘルスチェックを実行したい場合に役立つ。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      livenessProbe:
        exec:
          command:
            - source
            - healthcheck.sh
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      livenessProbe:
        exec:
          command:
            - /bin/grpc_health_probe
            - -addr=:5000
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-command
> - https://github.com/grpc-ecosystem/grpc-health-probe?tab=readme-ov-file#example-grpc-health-checking-on-kubernetes

#### ▼ httpGet

コンテナのLivenessProbeヘルスチェックで、`L7`チェックを実行する。

`200`ステータスから`399`ステータスまでの間なら成功である。

具体的には、コンテナの指定したエンドポイントにGETメソッドでHTTPリクエストを送信し、レスポンスのステータスコードを検証する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      livenessProbe:
        httpGet:
          port: 80
          path: /healthcheck
          # またはHTTPS
          scheme: HTTP
```

自身のアプリケーションではエンドポイントを実装する必要があるが、OSSではすでに用意されていることが多い。

| ツール       | エンドポイント   |
| ------------ | ---------------- |
| Alertmaanger | `/-/healthy`     |
| Grafana      | `/healthz`       |
| Kiali        | `/kiali/healthz` |
| Prometheus   | `/-/healthy`     |
| ...          | ...              |

#### ▼ failureThreshold

デフォルト値は`3`である。

コンテナのLivenessProbeヘルスチェックが失敗したとみなす試行回数を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      livenessProbe:
        failureThreshold: 5
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes

#### ▼ initialDelaySecond

デフォルト値は`0`である。

初回のLivenessProbeヘルスチェックを開始するまでの待機時間を設定する。

この時間を過ぎてもコンテナのLivenessProbeヘルスチェックが失敗する場合、Podはコンテナを再起動する。

設定した時間が短すぎると、Podがコンテナの起動を待てずに再起動を繰り返してしまう (デフォルト値の`0`は短すぎる) 。

一方で、設定した時間が長すぎると、Podの作成開始から完了まで時間がかかりすぎてしまう。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      livenessProbe:
        # 初回以降のLivenessProbeヘルスチェックを実行するまでに5秒間待機する。
        initialDelaySeconds: 10
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes

#### ▼ periodSeconds

デフォルト値は`10`である。

コンテナのLivenessProbeヘルスチェックの試行当たりの間隔を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      livenessProbe:
        # 5秒ごとにLivenessProbeヘルスチェックを実行する。
        periodSeconds: 5
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes

#### ▼ successThreshold

デフォルト値は`1`である。

LivenessProbeヘルスチェックの失敗後のリトライで、成功と判定する最小試行回数を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      livenessProbe:
        successThreshold: 1
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes

#### ▼ tcpSocket

コンテナのLivenessProbeヘルスチェックで、`L4`チェックを実行する。

具体的には、コンテナにTCPスリーウェイハンドシェイクを実行し、TCP接続を確立できるかを検証する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      livenessProbe:
        tcpSocket:
          port: 8080
```

#### ▼ terminationGracePeriodSeconds

デフォルト値はPod単位の`.spec.terminationGracePeriodSeconds`キーを継承し、`30`である。

コンテナの終了プロセスを開始するまで待機時間を設定する。

この時間を超えてもコンテナを終了できていない場合は、コンテナを強制的に停止する。

設定した時間が長すぎると、Pod全体の終了プロセスに時間がかかり、Podの削除までに時間がかかりすぎてしまう。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      livenessProbe:
        terminationGracePeriodSeconds: 10
  terminationGracePeriodSeconds: 45
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes

#### ▼ timeoutSeconds

デフォルト値は`1`である。

コンテナのLivenessProbeヘルスチェックのタイムアウト時間を設定する。

この時間を過ぎてもコンテナのLivenessProbeヘルスチェックが失敗する場合、Podはコンテナを再起動する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      livenessProbe:
        # LivenessProbeヘルスチェックのタイムアウト時間を30秒とする。
        timeoutSeconds: 10
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes

<br>

### .spec.containers[*].startupProbe

#### ▼ startupProbeとは

kubeletがヘルスチェックを実行することで、アプリケーションの起動が完了したかを確認する。

ReadinessProbeよりも先に実行される。

言語やフレームワークによってはStartupProbe用のエンドポイントが提供されていない場合があり、ReadinessProbe用のエンドポイントで代用する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-app-springboot
      image: foo-app-springboot:1.0.0
      startupProbe:
        httpGet:
          port: 8080
          # SpringBoot製Javaアプリののstartupエンドポイント
          path: /actuator/startup
        initialDelaySeconds: 10
        periodSeconds: 10
        timeoutSeconds: 10
        successThreshold: 1
        failureThreshold: 5
        terminationGracePeriodSeconds: 10
```

> - https://egashira.dev/blog/k8s-liveness-readiness-startup-probes#startupprobe
> - https://docs.spring.io/spring-boot/api/rest/actuator/startup.html
> - https://qiita.com/suke_masa/items/05570b64b73f3650b807#spring-boot-actuator%E3%81%AEprobe%E5%AF%BE%E5%BF%9C

<br>

### .spec.containers[*].readinessProbe

#### ▼ readinessProbeとは

kubeletがヘルスチェックを実行することで、コンテナがトラフィックを処理可能かを確認する。

`terminationGracePeriodSeconds`に関しては、`.spec.terminationGracePeriodSeconds`キーでPod単位での待機時間を設定することもできる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-app-springboot
      image: foo-app-springboot:1.0.0
      readinessProbe:
        httpGet:
          port: 8080
          # SpringBoot製JavaアプリのReadinessエンドポイント
          path: /actuator/health/readiness
          scheme: HTTP
        # 各設定のデフォルト値を示す
        initialDelaySeconds: 0
        periodSeconds: 10
        timeoutSeconds: 1
        successThreshold: 1
        failureThreshold: 3
        terminationGracePeriodSeconds: 30
  terminationGracePeriodSeconds: 30
```

コンテナが起動してもトラフィックを処理できるようになるまでに時間がかかる場合 (例：Javaのウォームアップ完了まで。Nginxの最初の設定ファイル読み込み完了まで。MySQLの最初の接続受信準備完了まで。) や問題の起きたコンテナにトラフィックを流さないようにする場合に役立つ。

注意点として、ReadinessProbeの間隔が短すぎると、kubeletに必要以上に負荷がかかる。

そのため、`READY`は`0`で、`STATUS`は`Running`になる。

```bash
$ kubectl get pod -n foo-namespace

NAME       READY   STATUS             RESTARTS      AGE
foo-pod    0/1     Running            0             14m
bar-pod    0/1     Running            0             14m
```

```bash
Readiness probe failed: Get "http://*.*.*.*:*/ready": dial tcp *.*.*.*:*: connect: connection refused
```

> - https://www.ianlewis.org/jp/kubernetes-health-check
> - https://amateur-engineer-blog.com/livenessprobe-readinessprobe/#toc4
> - https://kodekloud.com/community/t/what-is-the-meaning-for-a-pod-with-ready-0-1-and-state-running/21660
> - https://spring.io/blog/2020/03/25/liveness-and-readiness-probes-with-spring-boot

#### ▼ exec

コンテナのLivenessProbeヘルスチェックで、任意のコマンドのヘルスチェックを実行する。

終了コード`0`なら成功である。

LivenessProbeが対応可能なプロトコル (HTTP、TCP、gRPCによるHTTP) 以外で、ヘルスチェックを実行したい場合に役立つ。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      readinessProbe:
        exec:
          command:
            - source
            - healthcheck.sh
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      readinessProbe:
        exec:
          command:
            - /bin/grpc_health_probe
            - -addr=:5000
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-command
> - https://github.com/grpc-ecosystem/grpc-health-probe?tab=readme-ov-file#example-grpc-health-checking-on-kubernetes

#### ▼ httpGet

コンテナのReadinessProbeヘルスチェックで、`L7`チェックを実行する。

`200`ステータスから`399`ステータスまでの間なら成功である。

具体的には、コンテナの指定したエンドポイントにGETメソッドでHTTPリクエストを送信し、レスポンスのステータスコードを検証する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      readinessProbe:
        httpGet:
          port: 80
          path: /healthcheck
          # またはHTTPS
          scheme: HTTP
```

#### ▼ failureThreshold

デフォルト値は`3`である。

ReadinessProbeヘルスチェックが失敗したとみなす試行回数を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      readinessProbe:
        failureThreshold: 5
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes

#### ▼ initialDelaySeconds

デフォルト値は`0`である。

初回のReadinessProbeヘルスチェックを開始するまでの待機時間を設定する。

この時間を過ぎてもコンテナのReadinessProbeヘルスチェックが失敗する場合、Podはコンテナを再起動する。

設定した時間が短すぎると、Podがコンテナの起動を待てずに再起動を繰り返してしまう (デフォルト値の`0`は短すぎる) 。

一方で、設定した時間が長すぎると、Podの作成開始から完了まで時間がかかりすぎてしまう。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      readinessProbe:
        initialDelaySeconds: 10
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes

#### ▼ periodSeconds

デフォルト値は`10`である。

ReadinessProbeヘルスチェックの試行当たりの間隔を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      readinessProbe:
        periodSeconds: 5
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes

#### ▼ successThreshold

デフォルト値は`1`である。

ReadinessProbeヘルスチェックの失敗後のリトライで、成功と判定する最小試行回数を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      readinessProbe:
        successThreshold: 1
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes

#### ▼ tcpSocket

ReadinessProbeヘルスチェックで、`L4`チェックを実行する。

コンテナにTCPスリーウェイハンドシェイクを実行し、TCP接続を確立できるかを検証する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      readinessProbe:
        tcpSocket:
          port: 3306
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-tcp-liveness-probe

#### ▼ terminationGracePeriodSeconds

デフォルト値はPod単位の`.spec.terminationGracePeriodSeconds`キーを継承し、`30`である。

コンテナの終了プロセスを開始するまで待機時間を設定する。

この時間を超えてもPodを終了できていない場合は、コンテナを強制的に停止する。

設定した時間が長すぎると、Pod全体の終了プロセスに時間がかかり、Podの削除までに時間がかかりすぎてしまう。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      readinessProbe:
        terminationGracePeriodSeconds: 10
  terminationGracePeriodSeconds: 45
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes

#### ▼ timeoutSeconds

デフォルト値は`1`である。

コンテナのReadinessProbeヘルスチェックのタイムアウト時間を設定する。

この時間を過ぎてもコンテナのReadinessProbeヘルスチェックが失敗する場合、Podはコンテナを再起動する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      readinessProbe:
        # ReadinessProbeヘルスチェックのタイムアウト時間を30秒とする。
        timeoutSeconds: 10
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes

<br>

### .spec.containers[*].securityContext

#### ▼ securityContextとは

Pod内の特定のコンテナに対して、認可スコープを設定する。

オプションは、`.spec.securityContext`キーと同じである。

> - https://qiita.com/dingtianhongjie/items/51a4cea1265c5ec836cc

<br>

### .spec.containers[*].volumeMounts

#### ▼ volumeMountsとは

PodのVolume内のディレクトリをコンテナにマウントする。

パスは相対パスではなく絶対パスで指定する。

> - https://github.com/kubernetes/kubernetes/issues/48749

#### ▼ subPath

PodのVolume内のサブディレクトリを指定し、マウント可能にする。

これを指定しない場合。Volumeのルートディレクトリ配下をコンテナにマウントすることになる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      volumeMounts:
        - name: app-volume
          # foo-volumeにあるwwwディレクトリを指定する
          subPath: www
          # コンテナのvarディレクトリをマウントする
          mountPath: /var

  volumes:
    - name: app-volume
      emptyDir: {}
```

> - https://zaki-hmkc.hatenablog.com/entry/2020/12/27/211908#subPath%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%9F%E3%83%9E%E3%82%A6%E3%83%B3%E3%83%88
> - https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath

ディレクトリではなく、ファイルを指定することもできる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      volumeMounts:
        - name: app-volume
          # foo-volumeにあるwww.confファイルを指定する
          subPath: www.conf
          # コンテナに/etc/www.confファイルとしてマウントする
          mountPath: /etc/www.conf

  volumes:
    - name: app-volume
      emptyDir: {}
```

> - https://stackoverflow.com/a/53503986

<br>

### .spec.enableServiceLinks

#### ▼ enableServiceLinks

Serviceの宛先情報 (IPアドレス、プロトコル、ポート番号) に関する環境変数をPod内に出力するかどうかを設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  enableServiceLinks: false
```

> - https://kakakakakku.hatenablog.com/entry/2022/05/31/093116

<br>

### .spec.hostname

#### ▼ hostnameとは

Podのホスト名を設定する。

また、`.spec.hostname`キーが設定されていない時は、`.metadata.name`がホスト名として使用される。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  hostname: foo-pod
```

> - https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod%E3%81%AEhostname%E3%81%A8subdomain%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89

<br>

### .spec.hostNetwork

#### ▼ hostNetworkとは

Podが、自身の稼働するNodeのネットワークにリクエストを送信できるかどうかを設定する。

ユーザーが使用するうユースケースは少なく、例えばNode ExporterのPodで使用される。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-node-exporter
spec:
  containers:
    - name: foo-node-exporter
      image: prom/node-exporter:1.0.0
  hostNetwork: true
```

> - https://stackoverflow.com/a/64793701

<br>

### .spec.imagePullSecrets

#### ▼ imagePullSecretsとは

プライベートイメージリポジトリからコンテナイメージをプルするため、プライベートイメージリポジトリの資格情報を持つSecretを設定する。

別途、ServiceAccountの`.imagePullSecrets`キーでも同じSecretを指定しておき、このServiceAccountをPodに紐付ける。

これにより、PodはSecretにあるプライベートリポジトリの資格情報を使用できるようになる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: private-app:1.0.0 # プライベートプライベートイメージリポジトリ
  imagePullSecrets:
    - name: app-repository-credentials-secret # プライベートイメージリポジトリの資格情報を持つSecret
```

> - https://kubernetes.io/docs/concepts/containers/images/#specifying-imagepullsecrets-on-a-pod
> - https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/#create-a-pod-that-uses-your-secret
> - https://medium.com/makotows-blog/kubernetes-private-registry-tips-image-pullsecretse-20dfb808dfc-e20dfb808dfc

<br>

### .spec.initContainers

#### ▼ initContainersとは

`.spec.containers`キーで設定したコンテナよりも先に起動するコンテナ (InitContainer) を設定する。

依存先コンテナ (例：DBコンテナ、インメモリDBコンテナ) の待機処理、依存ツールやサーバー証明書のインストール処理などのために使用する。

#### ▼ command

実行するコマンドを設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
      volumeMounts:
        - name: app-volume
          mountPath: /go/src
  initContainers:
    - name: readiness-check-redis
      image: busybox:1.28
      # StatefulSetのインメモリDBコンテナの6379番ポートに通信できるまで、本Podのappコンテナの起動開始を待機する。
      # StatefulSetでReadinessProbeヘルスチェックを設定しておけば、これのPodがREADYになるまでncコマンドは成功しないようになる。
      command:
        - /bin/bash
        - -c
      args:
        - |
          until nc -z inmemory-db 6379; do
            echo waiting for inmemory-db;
            sleep 2;
          done
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-db
      image: redis:8.0
      ports:
        - containerPort: 6379
      volumeMounts:
        - name: foo-inmemory-db-volume
          mountPath: /var/lib
  volumes:
    - name: foo-inmemory-db-volume
      emptyDir: {}
```

#### ▼ restartPolicy

`Always`値を設定することで、サイドカーコンテナを作成できる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
      volumeMounts:
        - name: app-volume
          mountPath: /go/src
  initContainers:
    - name: sidecar
      image: proxy:1.0.0
      restartPolicy: Always
```

> - https://kubernetes.io/blog/2023/08/25/native-sidecar-containers/
> - https://github.com/kubernetes/enhancements/issues/753
> - https://github.com/kubernetes/enhancements/tree/master/keps/sig-node/753-sidecar-containers

<br>

### .spec.priorityClassName

#### ▼ priorityClassNameとは

Podのスケジューリングの優先度を設定する。

何らかの理由 (例：ハードウェアリソース不足など) でより優先度の高いPodをスケジューリングさせられない場合、より優先度の低いPodをNodeから退去させ、優先度の高いPodをスケジューリングさせる。

| 設定値                                            | 優先度 |
| ------------------------------------------------- | :----: |
| `system-node-critical`、`system-cluster-critical` | 最優先 |
| `high`                                            |        |
| `low-non-preemptible`                             |        |
| `low`                                             | 後回し |

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  priorityClassName: system-node-critical
```

> - https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/#pod-priority

#### ▼ DaemonSet配下のPod

DaemonSet配下のPodは、デフォルトで全てのNodeでスケジューリングされるようになっている。

ただし何らかの理由 (例：ハードウェアリソース不足など) で、特定のNodeでDaemonSet配下のPodをスケジューリングさせられないことがある。

他のPodよりスケジューリングの優先度を上げるために、DaemonSet配下のPodには必ず、`system-node-critical`のPriorityClassNameを設定しておく。

> - https://stackoverflow.com/questions/74987515/k8s-daemonset-pod-placement
> - https://stackoverflow.com/questions/55832300/cluster-autoscaler-not-triggering-scale-up-on-daemonset-deployment

<br>

### .spec.nodeSelector

#### ▼ nodeSelectorとは

Podのスケジューリング対象とするNodeを設定する。

`.spec.affinity`キーと比較して、より単純に条件を設定できる。

複数のNodeに同じ`.metadata.labels`キーを付与しておき、このNode群をNodeグループと定義すれば、特定のNodeにPodを作成するのみでなくNodeグループにPodを作成できる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  nodeSelector:
    node.kubernetes.io/nodetype: foo
```

> - https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity

#### ▼ DaemonSet配下のPod

DaemonSetでは、特定のNodeにPodをスケジューリングさせられる。

> - https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/#running-pods-on-select-nodes

#### ▼ nodeSelectorとaffinittyの両方設定

`.spec.nodeSelector`キーと`.spec.affinity`キーの両方を設定できる。

両方を設定した場合、両方を満たしたNodeにPodをスケジューリングさせられる。

> - https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity

<br>

### .spec.restartPolicy

#### ▼ restartPolicyとは

Pod内のコンテナのライフサイクルの再起動ポリシーを設定する。

#### ▼ Always

コンテナが停止した場合、これが正常 (終了ステータス`0`) か異常 (終了ステータス`1`) か否かに関わらず、常にコンテナを再起動する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  restartPolicy: Always
```

#### ▼ Never

コンテナが停止した場合、コンテナを再起動しない。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  restartPolicy: Never
```

#### ▼ OnFailure

コンテナが停止した場合、これが異常 (終了ステータス`1`) の場合にのみ、常にコンテナを再起動する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  restartPolicy: OnFailure
```

<br>

### .spec.securityContext

#### ▼ securityContextとは

Pod内の全てのコンテナに対して、認可スコープを設定する。

> - https://qiita.com/dingtianhongjie/items/51a4cea1265c5ec836cc

#### ▼ runAsUser

コンテナのプロセスのユーザーIDを設定する。

コンテナがユーザーを提供していない場合、あらじかじめユーザーを作成する必要がある。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  securityContext:
    runAsUser: 999
```

> - https://cstoku.dev/posts/2018/k8sdojo-07/#runasuser
> - https://qiita.com/SnykSec/items/3f3ee4948e90c0e7e3cc

#### ▼ runAsGroup

コンテナのプロセスのグループIDを設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  securityContext:
    runAsGroup: 3000
```

> - https://cstoku.dev/posts/2018/k8sdojo-07/#runasgroup

#### ▼ runAsNonRoot

コンテナを特権モード (root権限) で実行できないようにする。

もしこれを設定したコンテナがroot権限の実行ユーザーを使用しようとすると、コンテナの起動に失敗する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  securityContext:
    runAsNonRoot: true
```

> - https://qiita.com/dingtianhongjie/items/51a4cea1265c5ec836cc#root%E3%83%A6%E3%83%BC%E3%82%B6%E3%81%AE%E5%AE%9F%E8%A1%8C%E5%88%B6%E9%99%90

#### ▼ fsGroup

Pod内のコンテナ内のファイルに以下を実行する。

- 指定した番号のユーザーグループを作成する
- ファイルのユーザーグループ権限を指定したユーザーグループ番号に設定する
- ファイルのアクセス権限を`0660`に設定する

設定しない場合、ボリュームのファイルの権限はrootユーザー (コンテナのデフォルトユーザー) になる。

例えば、`999`にすれば、`999`というユーザーグループが作成され、`999`番グループしかファイルを利用できなくなる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  securityContext:
    fsGroup: 999
```

> - https://cstoku.dev/posts/2018/k8sdojo-07/#fsgroup
> - https://learn.microsoft.com/ja-jp/azure/aks/faq#how-to-avoid-permission-ownership-setting-slow-issues-when-the-volume-has-a-lot-of-files

<br>

### .spec.serviceAccountName

#### ▼ serviceAccountNameとは

PodにServiceAccountを紐付ける。

Podのプロセスに認証済みのIDが付与され、Kubernetesと通信できるようになる。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  serviceAccountName: foo-service-account
```

<br>

### .spec.terminationGracePeriodSeconds

#### ▼ terminationGracePeriodSecondsとは

![pod_terminating_process](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process.png)

Podの終了プロセスを開始するまで待機時間を設定する。

この時間を超えてもPodを終了できていない場合は、コンテナを強制的に停止する。

なお、`.spec.containers[*].xxxProbe.terminationGracePeriodSeconds`キーでコンテナ単位での待機時間を設定することもできる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  terminationGracePeriodSeconds: 45
```

> - https://nulab.com/ja/blog/backlog/graceful-shutdown-of-kubernetes-application/
> - https://qiita.com/superbrothers/items/3ac78daba3560ea406b2
> - https://speakerdeck.com/masayaaoyama/jkd1812-prd-manifests?slide=16

#### ▼ コンテナが複数個ある場合

Pod内にアプリ以外にコンテナ (istio-proxyなど) がある場合、全てのコンテナの終了プロセスの時間を考慮する必要がある。

![pod_terminating_process_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process_istio-proxy.png)

> - https://sreake.com/blog/istio-proxy-stop-behavior/
> - https://christina04.hatenablog.com/entry/k8s-graceful-stop-with-istio-proxy

<br>

### .spec.tolerations

#### ▼ tolerationsとは

TaintsとTolerationsを使用すると、指定した条件に合致するPod以外をNodeにスケジューリングさせないようにできる。

例えば、Workloadが少ないNodeグループ (`monitoring`、`ingress`など) にTaintを設定し、Workloadが多いNodeグループ (`app`、`system`など) にはこれを設定しないようにする。

すると、`.spec.tolerations`キーを設定しない限り、Podが多いNodeグループの方にPodがスケジューリングされる。

そのため、NodeSelectorやNodeAffinityを使用するより、スケジューリング対象のNodeを設定する手間が省ける。

以下の方法で設定する。

事前にNodeにTaintを設定しておく。

```bash
# 非マネージドの場合
$ kubectl taint node foo-node group=monitoring:NoSchedule

# マネージドの場合
# NodeグループやNodeプールで一括してTaintを設定する
```

Taintへの耐性を`.spec.tolerations`キーで設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: prometheus
spec:
  containers:
    - name: app
      image: app:1.0.0
  # Taintへの耐性をtolerationsで定義する
  tolerations:
    - key: <キー>
      operator: Equal
      value: <値>
      effect: <エフェクト>
```

合致する条件の`.spec.tolerations`キーを持つPodしか、Taintを持つNodeにスケジューリングさせられない。

`.spec.affinity`キーとは反対の条件である。

デフォルトでは、Podは以下のNodeの`metadata.labels`キーを条件として、kube-schedulerは該当の値を持たないNodeにPodにスケジューリングさせる。

> - https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/#taint-based-evictions

#### ▼ NoSchedule

指定した条件に合致するNodeにはスケジューリングさせない。

なお、実行中のPodが違反していた場合でも、再スケジューリングさせない。

**＊実装例＊**

`kube-system`で管理したいような重要なPodに`CriticalAddonsOnly`キーのTolerationsを設定する。

合わせてNodeのTaintにも`CriticalAddonsOnly`キーを設定することで、Taintに耐性のあるPod (`CriticalAddonsOnly`キー) しか、このNodeにスケジューリングできなくなる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-coredns
  namespace: kube-system
spec:
  containers:
    - name: coredns
      image: coredns
      imagePullPolicy: IfNotPresent
  # Taintへの耐性をtolerationsで定義する
  tolerations:
    - key: CriticalAddonsOnly
      operator: Exists
```

> - https://news.mynavi.jp/techplus/article/k8ssecurity-6/2

**＊実装例＊**

```bash
$ kubectl taint node foo-node group=monitoring:NoSchedule
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: prometheus
spec:
  containers:
    - name: prometheus
      image: prom/prometheus
      imagePullPolicy: IfNotPresent
  # Taintへの耐性をtolerationsで定義する
  tolerations:
    - key: group
      operator: Equal
      value: monitoring
      effect: NoSchedule
```

> - https://blog.devops.dev/taints-and-tollerations-vs-node-affinity-42ec5305e11a
> - https://qiita.com/sheepland/items/8fedae15e157c102757f#effect%E3%81%AE%E7%A8%AE%E9%A1%9E%E3%81%A8%E3%81%9D%E3%81%AE%E5%8A%B9%E6%9E%9C

#### ▼ NoExecute

指定した条件に合致するNodeにはスケジューリングさせない。

なお、実行中のPodが違反していた場合、再スケジューリングさせる。

**＊実装例＊**

```bash
$ kubectl taint node foo-node group=monitoring:NoExecute
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: prometheus
spec:
  containers:
    - name: prometheus
      image: prom/prometheus
      imagePullPolicy: IfNotPresent
  # Taintへの耐性をtolerationsで定義する
  tolerations:
    - key: group
      operator: Equal
      value: monitoring
      effect: NoExecute
```

> - https://blog.devops.dev/taints-and-tollerations-vs-node-affinity-42ec5305e11a
> - https://qiita.com/sheepland/items/8fedae15e157c102757f#effect%E3%81%AE%E7%A8%AE%E9%A1%9E%E3%81%A8%E3%81%9D%E3%81%AE%E5%8A%B9%E6%9E%9C

<br>

### .spec.topologySpreadConstraints

#### ▼ topologySpreadConstraintsとは

異なるリージョン、AZ、Node、にPodを分散させる。

`.spec.nodeSelector`キーや`.spec.affinity`キーのスーパーセットであり、これと比べて、Podのスケジューリングをより柔軟に定義できる。

> - https://stackoverflow.com/a/73159361
> - https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/

#### ▼ maxSkew

`.spec.topologySpreadConstraints[*].topologyKey`キーで指定した分散の単位の間で、Podの個数差を設定する。

**＊実装例＊**

AZが`2`個あるとすると、各AZ間のPodの個数差を`1`個にする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  topologySpreadConstraints:
    - maxSkew: 1
      # 異なるゾーンに分散させる
      topologyKey: topology.kubernetes.io/zone
```

> - https://zenn.dev/tmrekk/articles/07f30b09c26b50#maxskew%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

#### ▼ topologyKey

Podの分散の単位を設定する。

**＊実装例＊**

AZを分散の単位に設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  topologySpreadConstraints:
    # 異なるゾーンに分散させる
    - topologyKey: topology.kubernetes.io/zone
```

> - https://zenn.dev/tmrekk/articles/07f30b09c26b50#topologykey%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

#### ▼ whenUnsatisfiable

分散の条件に合致するNodeがない場合の振る舞いを設定する。

**＊実装例＊**

分散の条件に合致するNodeがない場合、このPodをスケジューリングさせない。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  topologySpreadConstraints:
    - whenUnsatisfiable: DoNotSchedule
```

> - https://zenn.dev/tmrekk/articles/07f30b09c26b50#whenunsatisfiable%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

#### ▼ labelSelector

分散させるPodの条件を設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
  topologySpreadConstraints:
    - labelSelector:
        app.kubernetes.io/name: foo-pod
```

> - https://zenn.dev/tmrekk/articles/07f30b09c26b50#labelselector%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

<br>

### .spec.volumes

#### ▼ volumesとは

Pod内で使用するボリュームを設定する。

#### ▼ configMap

ConfigMapの`.data`キー配下のキーをファイルとしてマウントする。

Secretをマウントする場合は、`.spec.volumes.secret`キーで設定することに注意する。

**＊実装例＊**

ConfigMapの持つキー (ここでは`fluent-bit.conf`キー) をコンテナにファイルとしてマウントする

そのため、コンテナには`fluent-bit.conf`ファイルが配置されることになる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-fluent-bit
      image: fluent/fluent-bit:1.0.0
      volumeMounts:
        - name: foo-fluent-bit-conf-volume
          # ConfigMapの持つキー (ここではfluent-bit.confキー) をコンテナにファイルとしてマウントする
          mountPath: /fluent-bit/etc/
  volumes:
    - name: foo-fluent-bit-conf-volume
      configMap:
        # ファイルを持つConfigMap
        name: foo-fluent-bit-conf-config-map
        # ファイルの実行権限
        defaultMode: 420
```

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-fluent-bit-conf-config-map
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush         1
        Log_Level     info

    [OUTPUT]
        Name cloudwatch
        Match *
        region ap-northeast-1
        log_group_name /prd-foo-k8s/log
        log_stream_prefix container/fluent-bit/
        auto_create_group true
```

> - https://amateur-engineer-blog.com/configmap-file-mount/

#### ▼ emptyDir

Volumeの一種であるEmptyDir Volumeを作成する。

『Pod』が削除されると、このEmptyDir Volumeも同時に削除される。

**＊実装例＊**

オンディスクストレージを設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      volumeMounts:
        - name: app-volume
          mountPath: /go/src
  volumes:
    - name: app-volume
      emptyDir: {}
```

> - https://kubernetes.io/docs/concepts/storage/volumes/#emptydir
> - https://qiita.com/umkyungil/items/218be95f7a1f8d881415

**＊実装例＊**

インメモリストレージを設定する。

注意点として、Podが使用できる上限メモリサイズを設定しない場合、PodはスケジューリングされたNodeのメモリ領域を最大限に使ってしまう。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      volumeMounts:
        - name: app-volume
          mountPath: /go/src
  volumes:
    - name: app-volume
      emptyDir:
        medium: Memory
        sizeLimit: 1Gi
```

> - https://www.linkedin.com/pulse/planning-use-memory-backed-volumes-kubernetes-read-once-banerjee/?trk=articles_directory
> - https://kubernetes.io/docs/concepts/storage/volumes/#emptydir

#### ▼ hostPath

Volumeの一種であるHostPath Volumeを作成する。

PersistentVolumeの一種であるHostPath Volumeとは区別すること。

『Node』が削除されると、このHostPath Volumeも同時に削除される。

HostPath Volume自体は本番環境で非推奨である。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      volumeMounts:
        - name: app-volume
          mountPath: /go/src
  volumes:
    - name: app-volume
      hostPath:
        path: /data/src/foo
        # コンテナ内にディレクトリがなければ作成する
        type: DirectoryOrCreate
```

> - https://kubernetes.io/docs/concepts/storage/volumes/#hostpath
> - https://qiita.com/umkyungil/items/218be95f7a1f8d881415

#### ▼ name

要求によって作成するボリューム名を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      volumeMounts:
        - name: app-volume
          mountPath: /go/src
  volumes:
    - name: app-volume
```

#### ▼ projected

複数のソース (Secret、downwardAPI、ConfigMap、ServiceAccountのToken) を同じVolume上のディレクトリに配置する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      volumeMounts:
        - name: app-volume
          mountPath: /go/src
  volumes:
    - name: app-volume
      projected:
        sources:
          - configMap:
              name: foo-cm
          - configMap:
              name: bar-cm
          - configMap:
              name: baz-cm
```

> - https://amateur-engineer-blog.com/multi-configmap-by-projected-volume/

#### ▼ persistentVolumeClaim

PersistentVolumeを使用する場合、PersistentVolumeClaimを設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      volumeMounts:
        - name: app-volume
          mountPath: /go/src
  volumes:
    - name: app-volume
      persistentVolumeClaim:
        claimName: foo-standard-volume-claim
```

PersistentVolumeClaimとPersistentVolumeはあらかじめ作成しておく必要がある。

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: foo-standard-volume-claim
spec:
  storageClassName: standard
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
```

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  storageClassName: standard
  capacity:
    storage: 2Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /data/src/foo
    type: DirectoryOrCreate
```

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/

#### ▼ secret

Secretの`.data`キー配下のキーをファイルとしてマウントする。

`.spec.containers[*].envFrom`キー (環境変数をコンテナに出力する) とは異なり、Secretからファイルを設定する。

ConfigMapをマウントする場合は、`.spec.volumes.configMap`キーで設定することに注意する。

**＊実装例＊**

Secretが持つ資格情報ファイル (ここでは`credentials.json`キー) をコンテナにファイルとしてマウントする

そのため、コンテナには資格情報ファイルが配置されることになる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-fluent-bit
      image: fluent/fluent-bit:1.0.0
      volumeMounts:
        - name: foo-fluent-bit-credentials-volume
          # Secretの持つキー (ここではcredentials.jsonキー) をコンテナにファイルとしてマウントする
          mountPath: /credentials
        - name: foo-fluent-bit-conf-volume
          mountPath: /fluent-bit/etc/
  volumes:
    - name: foo-fluent-bit-secret-volume
      secret:
        # ファイルを持つSecret
        secretName: foo-fluent-bit-credentials
        # ファイルの実行権限
        defaultMode: 420
    - name: foo-fluent-bit-conf-volume
      configMap:
        name: foo-fluent-bit-conf-config-map
        defaultMode: 420
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-fluent-bit-credentials
data:
  credentials.json: *****
```

> - https://kubernetes.io/docs/concepts/configuration/secret/#using-secrets-as-files-from-a-pod
> - https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/#create-a-pod-that-has-access-to-the-secret-data-through-a-volume

<br>

## PodDisruptionBudget

### .spec.maxUnavailable

古いPodをNodeから退避させる時に、Nodeで退避できるPodの最大数を設定する。

これを設定しないと、特定のWorkload (例：Deployment、DaemonSet、StatefulSet、Jobなど) 配下のPodを全て退避してしまう問題が起こる。

まずは`.spec.minAvailable`キーでスケジューリングさせられる新しいPodの個数を制御し、その後に`.spec.minAvailable`キーで退避できる古いPodの個数を制御する。

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: foo-pod-disruption-budget
spec:
  # PodをNodeから退避させる時に、Pod1個のみを退避できる。
  maxUnavailable: 1
```

> - https://qiita.com/tkusumi/items/946b0f31931d21a78058#poddisruptionbudget-%E3%81%AB%E3%82%88%E3%82%8B%E5%AE%89%E5%85%A8%E3%81%AA-drain
> - https://tech.andpad.co.jp/entry/2022/08/30/100000

<br>

### .spec.minAvailable

古いPodをNodeから退避させる時に、起動し続ける利用可能なPodの最小数を設定する。

他のNodeで新しいPodのスケジューリングの完了を待機してから、古いPodを退避させられる。

まずは`.spec.minAvailable`キーでスケジューリングさせられる新しいPodの個数を制御し、その後に`.spec.minAvailable`キーで退避できる古いPodの個数を制御する。

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: foo-pod-disruption-budget
spec:
  # PodをNodeから退避させる時に、他のNodeで新しいPod3個のスケジューリングが完了するまで待機できる。
  minAvailable: 3
```

> - https://kubernetes.io/docs/tasks/run-application/configure-pdb/#specifying-a-poddisruptionbudget
> - https://zenn.dev/sasakiki/articles/a71d9158020266

<br>

### .spec.selector

古いPodをNodeから退避させる時に、Podの`metadata.labels`キーを設定する。

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: foo-pod-disruption-budget
spec:
  selector:
    matchLabels:
      # 対象のPodのラベル
      app.kubernetes.io/name: foo-pod
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    name: foo-pod
spec:
  template:
    metadata:
      # Podのラベル
      labels:
        app.kubernetes.io/name: foo-pod
```

> - https://kubernetes.io/docs/tasks/run-application/configure-pdb/#specifying-a-poddisruptionbudget

<br>

## PriorityClass

### globalDefault

#### ▼ globalDefaultとは

グローバルスコープにするかどうかを設定する。

`true`の場合、PriorityClassを指定していないWorkloadに対しても、PriorityClassを一律に設定する。

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: foo-priority-class
globalDefault: false
```

<br>

### preemptionPolicy

#### ▼ preemptionPolicyとは

スケジューリングの優先度が競合した場合に、どのような優先度にするかを設定する。

#### ▼ `Never`

`Never`とすると、必ず他のPodのスケジューリングを優先するようになる。

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: foo-priority-class
preemptionPolicy: Never
```

> - https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/#non-preempting-priority-class

<br>

### value

#### ▼ valueとは

ユーザー定義のPriorityClassで優先度を設定する。

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: foo-priority-class
value: 1000000
```

> - https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/#how-to-use-priority-and-preemption

#### ▼ `-1`

`-1`とすると、優先度が最低になる。

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: foo-priority-class
value: 1000000
```

<br>

## ReplicaController

旧Deployment。

非推奨である。

> - https://stackoverflow.com/questions/37423117/replication-controller-vs-deployment-in-kubernetes

<br>

## Role、ClusterRole

### rules.apiGroups

#### ▼ apiGroupsとは

resourceキーで指定するKubernetesリソースのAPIグループの名前を設定する。

空文字はコアグループを表す。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: foo-role
rules:
  - apiGroups: [""]
```

> - https://kubernetes.io/docs/reference/using-api/#api-groups

<br>

### rules.resources

#### ▼ resourcesとは

アクション可能なKubernetesリソースの範囲 (認可スコープ) を設定する。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: foo-role
rules:
  - apiGroups: ["", "apps"]
    # Namespace、Deployment、に対してアクションを可能にする。
    resources: ["namespaces", "deployments"]
```

<br>

### rules.verbs

#### ▼ verbsとは

実行可能なアクション範囲 (認可スコープ) を設定する。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: foo-role
rules:
  - apiGroups: [""]
    resources: ["pods"]
    # Get、Watch、Listのアクションを実行可能にする。
    verbs: ["get", "watch", "list"]
```

全Kubernetesリソースへの全アクションを許可する認可スコープの場合、以下の通りとなる。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: foo-role
rules:
  - apiGroups: ["*"]
    resources: ["*"]
    verbs: ["*"]
```

<br>

## RoleBinding、ClusterRoleBinding

### roleRef.name

#### ▼ roleRef.nameとは

RoleBindingを使用して紐付けるRoleの名前を設定する。

> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: foo-role-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: foo-role
```

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: foo-cluster-role-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: foo-cluster-role
```

<br>

### subjects.name

#### ▼ subjects.nameとは

Roleの紐付け先のAccountの名前を設定する。

ServiceAccount名に関しては、ユーザー名でもよい。

```yaml
apiVersion: io.k8s.api.rbac.v1
kind: RoleBinding
metadata:
  name: foo-role-binding
subjects:
  - apiGroup: ""
    # ServiceAccountに紐付ける。
    kind: ServiceAccount
    # ServiceAccountのユーザー名 (system:useraccounts:foo-service-account) でもよい。
    name: foo-service-account
```

```yaml
apiVersion: io.k8s.api.rbac.v1
kind: ClusterRoleBinding
metadata:
  name: foo-cluster-role-binding
subjects:
  - apiGroup: rbac.authorization.k8s.io
    # UserAccountに紐付ける。
    kind: User
    name: foo-user-account
```

> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding
> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-binding-examples
> - https://knowledge.sakura.ad.jp/21129/

<br>

## Secret

### data

#### ▼ dataとは

Kubernetesリソースに渡す機密な変数を設定する。

#### ▼ 変数の管理

Secretで保持するstring型変数を設定する。

使用時に`base64`方式で自動的にデコードされるため、あらかじめ`base64`方式でエンコードしておく必要がある。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
type: Opaque
data:
  # base64方式でエンコードされた値
  username: *****
  password: *****
```

> - https://kubernetes.io/docs/concepts/configuration/secret/#restriction-names-data

string型の変数しか設定できないため、`base64`方式でデコード後にinteger型やboolean型になってしまう値は、ダブルクオーテーションで囲う必要がある。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
type: Opaque
data:
  enableFoo: "*****"
  number: "*****"
```

> - https://stackoverflow.com/questions/63905890/kubernetes-how-to-set-boolean-type-variable-in-configmap

#### ▼ 機密なファイルの管理

パイプ (` |`) を使用すれば、ファイルを変数として設定できる。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
type: Opaque
data:
  # サーバー証明書
  foo.crt: |
    MIIC2DCCAcCgAwIBAgIBATANBgkqh ...
  # サーバー証明書とペアになる秘密鍵
  foo.key: |
    MIIEpgIBAAKCAQEA7yn3bRHQ5FHMQ ...
```

> - https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets

<br>

### stringData

#### ▼ stringDataとは

Kubernetesリソースに渡す機密な変数を設定する。

#### ▼ 機密な変数の管理

Secretで保持するstring型の変数を設定する。

平文で設定しておく必要がある。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
stringData:
  username: bar
  password: baz
```

> - https://kubernetes.io/docs/concepts/configuration/secret/#restriction-names-data

string型の変数しか設定できないため、そのままだとinteger型やboolean型になってしまう値は、ダブルクオーテーションで囲う必要がある。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
stringData:
  # ダブルクオーテーションで囲う。
  enableFoo: true
  number: "1"
```

> - https://stackoverflow.com/questions/63905890/kubernetes-how-to-set-boolean-type-variable-in-configmap

#### ▼ 機密なファイルの管理

パイプ (` |`) を使用すれば、ファイルを変数として設定できる。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
type: Opaque
data:
  config.yaml: |
    apiUrl: "https://my.api.com/api/v1"
    username: bar
    password: baz
```

> - https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-config-file/#specify-unencoded-data-when-creating-a-secret

<br>

### type

#### ▼ typeとは

Secretの種類を設定する。

> - https://kubernetes.io/docs/concepts/configuration/secret/#secret-types

#### ▼ kubernetes.io/basic-auth

ベーシック認証のための変数を設定する。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-basic-auth-secret
type: kubernetes.io/basic-auth
data:
  username: bar
  password: baz
```

> - https://kubernetes.io/docs/concepts/configuration/secret/#basic-authentication-secret

#### ▼ kubernetes.io/dockerconfigjson

イメージレジストリの資格情報を設定する。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-dockerconfigjson-secret
type: kubernetes.io/dockerconfigjson
data:
  .dockercfg: |
    UmVhbGx5IHJlYWxs ...
```

> - https://kubernetes.io/docs/concepts/configuration/secret/#docker-config-secrets
> - https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/
> - https://medium.com/makotows-blog/kubernetes-private-registry-tips-image-pullsecretse-20dfb808dfc-e20dfb808dfc

#### ▼ kubernetes.io/service-account-token

Kubernetesの`v1.24`以降では、Secretが自動的に作成されないようになっている。

`.metadata.annotations`キーと`.type`キーを設定したSecretを作成すると、Kubernetesはこれの`data`キー配下にトークン文字列を自動的に追加する。

このトークンには、失効期限がない。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-service-account-token
  annotations:
    # ServiceAccountの名前を設定する
    kubernetes.io/service-account.name: foo-service-account
# トークンを管理するSecretであることを宣言する
type: kubernetes.io/service-account-token
# 自動的に追加される
data:
  token: xxxxxxxxxx
```

ServiceAccountでは、PodがこのSecretを使用できるように、その名前を設定する。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: foo-service-account
secrets:
  - name: foo-service-account-token
```

> - https://stackoverflow.com/a/72258300
> - https://zaki-hmkc.hatenablog.com/entry/2022/07/27/002213
> - https://kubernetes.io/docs/concepts/configuration/secret/#service-account-token-secrets
> - https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/#token-controller

#### ▼ kubernetes.io/tls

SSL/TLSを使用するための変数を設定する。

サーバー証明書、サーバー証明書とペアになる秘密鍵の文字列が必要である。

ユースケースとしては、変数をIngressに割り当て、IngressとServiceの間をHTTPSプロトコルでパケットを送受信する例がある。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-basic-auth-secret
type: kubernetes.io/tls
data:
  # サーバー証明書
  tls.crt: |
    MIIC2DCCAcCgAwIBAgIBATANBgkqh ...
  # 秘密鍵
  tls.key: |
    MIIEpgIBAAKCAQEA7yn3bRHQ5FHMQ ...
```

> - https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets

#### ▼ Opaque

任意の変数を設定する。

ほとんどのユースケースに適する。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-opaque-secret
type: Opaque
data:
  username: bar
  password: baz
```

> - https://kubernetes.io/docs/concepts/configuration/secret/#opaque-secrets

<br>

## Service

### .spec.externalIPs

ServiceのIPアドレスを固定する。

Serviceに紐づくPodを外部に直接公開したい場合 (例：POP/IMAPコンテナ) に役立つ。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-imap-service
spec:
  externalIPs:
    # 複数のIPアドレスを設定できる
    - *.*.*.*
    - *.*.*.*
    - *.*.*.*
```

> - https://docker-mailserver.github.io/docker-mailserver/edge/config/advanced/kubernetes/#external-ips-service

<br>

### .spec.externalTrafficPolicy

#### ▼ externalTrafficPolicyとは

記入中...

#### ▼ Local

ServiceのSNAT処理を無効化し、送信元IPアドレスを変換しなようにする。

代わりに、そのServiceが属するNode上のPodにしかルーティングできない。

NodePort ServiceとLoadBalancer Serviceで使用でき、ClusterIP Serviceでは使用できない。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  type: NodePort
  externalTrafficPolicy: Local
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  type: LoadBalancer
  externalTrafficPolicy: Local
```

> - https://kubernetes.io/docs/tutorials/services/source-ip/#source-ip-for-services-with-type-nodeport
> - https://thinkit.co.jp/article/13738?page=0%2C1
> - https://gist.github.com/IMOKURI/fc27c28139c575b7decf3ac1126db767

<br>

### .spec.ports

#### ▼ portsとは

受信する通信を設定する。

#### ▼ appProtocol

受信する通信のプロトコルを設定する。

`.spec.ports.protocol`キーとは異なり、アプリケーション層のプロトコルを明示的に指定できる。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    - appProtocol: http
      port: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    - appProtocol: tcp
      port: 9000
```

#### ▼ name

プロトコルのポート名を設定する。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    - name: http
      port: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    - name: tcp-foo
      port: 9000
```

#### ▼ protocol

受信する通信のプロトコルを設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    - protocol: TCP
      port: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    - protocol: UDP
      port: 53
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    - protocol: SCTP
      port: 22
```

#### ▼ port

インバウンド通信を待ち受けるポート番号を設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    - port: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    - port: 9000
```

#### ▼ targetPort

受信した通信をPodにフォワーディングする時に、いずれのポート番号を指定するか否かを設定する。

Pod内で最初にインバウンド通信を受信するコンテナの`containerPort`の番号に合わせるようにする。

デフォルトでは、`.spec.ports.port`キーと同じに値になる。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    - port: 8080
      targetPort: 8080 # デフォルトでは、spec.ports.portキーと同じ値になる。
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    - port: 9000
      targetPort: 9000 # デフォルトでは、spec.ports.portキーと同じ値になる。
```

> - https://qiita.com/MahoTakara/items/d18d8f9b36416353066c#%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AE%E5%AE%9A%E7%BE%A9

<br>

### .spec.loadBalancerSourceRanges

#### ▼ loadBalancerSourceRangesとは

LoadBalancer Serviceのみで設定できる。

プロビジョニングされる`L4`ロードバランサーのインバウンド通信で許可するCIDRを設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  type: NodePort
  ports:
    - name: http-foo
      protocol: TCP
      nodePort: 30000
      port: 8080
      targetPort: 8080
  loadBalancerSourceRanges:
    - *.*.*.*/*
```

> - https://repost.aws/ja/knowledge-center/eks-cidr-ip-address-loadbalancer
> - https://cloud.google.com/kubernetes-engine/docs/concepts/service-load-balancer-parameters?hl=ja

<br>

### .spec.selector

#### ▼ selectorとは

インバウンド通信のフォワーディング先とするPodの`.metadata.labels`キー名と値を設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  selector:
    app.kubernetes.io/name: foo-pod
```

> - https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/

<br>

### .spec.sessionAffinity

#### ▼ sessionAffinityとは

Podへのルーティング時にセッションを維持する (スティッキーセッション) かどうかを設定する。

セッションIDは、Node上に保管する。

なお、Ingressにも同じ機能がある。

> - https://stackoverflow.com/a/58960523

#### ▼ ClientIP

同じセッション内であれば、特定のクライアントからのリクエストをService配下の同じPodにルーティングし続けられる。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  sessionAffinity: ClientIP
```

> - https://kubernetes.io/docs/reference/networking/virtual-ips/#session-affinity
> - https://gist.github.com/fjudith/e8acc791f015adf6fd47e5ad7be736cb
> - https://cstoku.dev/posts/2018/k8sdojo-09/#sessionaffinity

#### ▼ None

sessionAffinityを無効化する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  sessionAffinity: None
```

> - https://cstoku.dev/posts/2018/k8sdojo-09/#sessionaffinity

<br>

### .spec.sessionAffinityConfig

#### ▼ sessionAffinityConfigとは

`.spec.sessionAffinity`キーを使用している場合に、セッションのタイムアウト時間を設定する。

タイムアウト時間を過ぎると、Node上に保管したセッションIDを削除する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 3600
```

> - https://kubernetes.io/docs/reference/networking/virtual-ips/#session-stickiness-timeout

<br>

### .spec.type

#### ▼ typeとは

Serviceのタイプを設定する。

#### ▼ ClusterIPの場合

ClusterIP Serviceを設定する。

`.spec.clusterIP`キーでCluster-IPを指定しない場合は、ランダムにIPアドレスが割り当てられる。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  type: ClusterIP
  ports:
    - name: http-foo
      protocol: TCP
      port: 8080 # Serviceが待ち受けるポート番号
      targetPort: 8080 # ルーティング先のポート番号 (containerPort名でもよい)
  selector:
    app.kubernetes.io/name: foo-pod
  # clusterIP: *.*.*.*
```

> - https://qiita.com/tkusumi/items/da474798c5c9be88d9c5#%E8%83%8C%E6%99%AF

#### ▼ ExternalNameの場合

ExternalName Serviceを設定する。

Cluster内DNS名とCluster外CNAMEを紐づける。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-db-service
spec:
  type: ExternalName
  # foo-db-service.default.svc.cluster.local を指定すると、*****.rds.amazonaws.comに問い合わせる
  externalName: *****.rds.amazonaws.com
```

> - https://blog.mosuke.tech/entry/2021/08/26/kubernetes-externalname-service/

#### ▼ NodePortの場合

NodePort Serviceを設定する。

Serviceが待ち受けるポート番号とは別に、NodeのNICで待ち受けるポート番号 (`30000` 〜 `32767`) を指定する。

これを指定しない場合、コントロールプレーンNodeがランダムでポート番号を決める。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  type: NodePort
  ports:
    - name: http-foo
      protocol: TCP
      # Nodeが待ち受けるポート番号
      # 指定しなければ、コントロールプレーンNodeがランダムで決める。
      nodePort: 30000
      # Serviceが待ち受けるポート番号
      port: 8080
      # ルーティング先のポート番号 (containerPort名でもよい)
      targetPort: 8080
  selector:
    app.kubernetes.io/name: foo-pod
```

NodePortのポート番号は、`30000` 〜 `32767`番である必要がある。

```bash
spec.ports[0].nodePort: Invalid value: 80: provided port is not in the valid range. The range of valid ports is 30000-32767
```

> - https://kubernetes.io/docs/concepts/services-networking/service/#nodeport

#### ▼ LoadBalancerの場合

LoadBalancer Serviceを設定する。

クラウドプロバイダーでLoadBalancer Serviceを作成すると、External-IPを宛先IPアドレスとするロードバランサーを自動的にプロビジョニングする。

同時に、`.status.loadBalancer`キーが自動的に追加される。

`.status.loadBalancer.ingress`キーは、KubernetesのIngressとは無関係であり、インバウンドを表す『`ingress`』である。

`.status.loadBalancer.ingress.ip`キーには、ロードバランサーで指定するServiceのExternal-IPが設定される。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  type: LoadBalancer
  ports:
    - name: http-foo
      protocol: TCP
      port: 8080 # Serviceが待ち受けるポート番号
      targetPort: 8080 # ルーティング先のポート番号 (containerPort名でもよい)
  selector:
    app.kubernetes.io/name: foo-pod
# Kubernetesが自動的に追加するキー
status:
  loadBalancer:
    # インバウンド通信の意味のingressである
    ingress:
      # External-IP
      - ip: 192.0.2.127
```

> - https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer

<br>

## ServiceAccount

### automountServiceAccountToken

#### ▼ automountServiceAccountTokenとは

ServiceAccountのPod内のコンテナへのマウントを有効化する。

デフォルト値は`true`である。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: foo-service-account
automountServiceAccountToken: true
```

service-account-admission-controllerは、AdmissionWebhookの仕組みでPodの作成時にマニフェストを変更する。

これにより、Volume上の`/var/run/secrets/kubernetes.io/serviceaccount`ディレクトリをコンテナに自動的にマウントするようになる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      volumeMounts:
        # service-account-admission-controllerは、コンテナに自動的にマウントする
        - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
          name: kube-api-access-*****
          readOnly: true
        - mountPath: /var/run/secrets/eks.amazonaws.com/serviceaccount
          name: aws-iam-token
          readOnly: true
  volumes:
    # kube-apiserverへのリクエストに必要なトークンが設定される
    - name: kube-api-access-*****
      projected:
        defaultMode: 420
        sources:
          # ServiceAccountのトークン
          - serviceAccountToken:
              expirationSeconds: 3607
              path: token
          # kube-apiserverにリクエストを送信するためのサーバー証明書
          - configMap:
              items:
                - key: ca.crt
                  path: ca.crt
              name: kube-root-ca.crt
          - downwardAPI:
              items:
                - fieldRef:
                    apiVersion: v1
                    fieldPath: metadata.namespace
                  path: namespace
    # AWS EKSを使用している場合、AWS-APIへのリクエストに必要なトークンも設定される
    - name: aws-iam-token
      projected:
        defaultMode: 420
        sources:
          - serviceAccountToken:
              # IDプロバイダーによるトークンの発行対象
              audience: sts.amazonaws.com
              expirationSeconds: 86400
              path: token
```

マウント後、トークンの文字列はコンテナの`/var/run/secrets/kubernetes.io/serviceaccount/token`ファイルに記載されている。

もし、AWS EKSを使用している場合、加えて`/var/run/secrets/eks.amazonaws.com/serviceaccount/token`ファイルにもトークンの文字列が記載されている。

```yaml
[root@<foo-pod:/] $ cat /var/run/secrets/kubernetes.io/serviceaccount/token | base64 -d; echo

{
  "alg":"RS256",
  "kid":"*****"
}

# AWS EKSを使用している場合
[root@<foo-pod:/] $ cat /var/run/secrets/eks.amazonaws.com/serviceaccount/token | base64 -d; echo

{
  "alg":"RS256",
  "kid":"*****"
}

```

> - https://kakakakakku.hatenablog.com/entry/2021/07/12/095208
> - https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/#serviceaccount-admission-controller
> - https://qiita.com/hiyosi/items/35c22507b2a85892c707
> - https://aws.amazon.com/jp/blogs/news/diving-into-iam-roles-for-service-accounts/

<br>

### imagePullSecrets

#### ▼ imagePullSecretsとは

プライベートイメージリポジトリの資格情報を持つSecretを設定する。

これにより、ServiceAccountが紐付けられたPodは、プライベートイメージリポジトリの資格情報を使用できるようになる。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: foo-service-account
imagePullSecrets:
  - name: foo-repository-credentials-secret
```

> - https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#add-image-pull-secret-to-service-account

<br>

### secrets

#### ▼ secretsとは

ServiceAccountに紐付けたPodが使用できるSecretの一覧を設定する。

ServiceAccountにトークンを持つSecretを紐づけるために使用することがある。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: foo-service-account
secrets:
  - name: foo-service-account-token
```

Secretでは、ServiceAccountの名前を指定する。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-service-account-token
  annotations:
    kubernetes.io/service-account.name: foo-service-account
type: kubernetes.io/service-account-token
data:
  token: xxxxxxxxxx
```

<br>

## StatefulSet

### .spec.serviceName

#### ▼ serviceNameとは

StatefulSetによって管理されるPodにルーティングするServiceを設定する。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: StatefulSet
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
      app.kubernetes.io/component: db
  serviceName: foo-mysql-service
  template:
    metadata:
      labels:
        app.kubernetes.io/name: foo
        app.kubernetes.io/component: db
    spec:
      containers:
        - name: mysql
          image: mysql:5.7
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3306
          volumeMounts:
            - name: foo-mysql-host-path-persistent-volume-claim
              mountPath: /var/volume
  volumeClaimTemplates:
    - metadata:
        name: foo-standard-volume-claim
        labels:
          app.kubernetes.io/name: foo
          app.kubernetes.io/component: db
      spec:
        storageClassName: standard
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 2Gi
```

<br>

### .spec.template (設定項目はPodと同じ)

#### ▼ templateとは

StatefulSetで維持管理するPodを設定する。

設定項目はPodと同じである。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: StatefulSet
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
      app.kubernetes.io/component: db
  serviceName: foo-mysql-service
  template:
    metadata:
      labels:
        app.kubernetes.io/name: foo-pod
        app.kubernetes.io/component: db
    spec:
      containers:
        # MySQLコンテナ
        - name: mysql
          image: mysql:5.7
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3306
          env:
            - name: MYSQL_ROOT_PASSWORD
              value: root
            - name: MYSQL_DATABASE
              value: dev_db
            - name: MYSQL_USER
              value: dev_user
            - name: MYSQL_PASSWORD
              value: dev_password
          volumeMounts:
            - name: foo-mysql-host-path-persistent-volume-claim
              mountPath: /var/volume
  volumeClaimTemplates:
    - metadata:
        name: foo-standard-volume-claim
        labels:
          app.kubernetes.io/name: foo
          app.kubernetes.io/component: db
      spec:
        storageClassName: standard
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 2Gi
```

### .spec.volumeClaimTemplates

#### ▼ volumeClaimTemplatesとは

PersistentVolumeClaimを作成する。

設定の項目は`kind: PersistentVolumeClaim`の場合と同じである。

StatefulSetが削除されても、これは削除されない。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: StatefulSet
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-pod
      app.kubernetes.io/component: db
  serviceName: foo-mysql-service
  template:
    metadata:
      labels:
        app.kubernetes.io/name: foo-pod
        app.kubernetes.io/component: db
    spec:
      containers:
        - name: mysql
          image: mysql:5.7
          ports:
            - containerPort: 3306
          volumeMounts:
            - name: foo-mysql-host-path-persistent-volume-claim
              mountPath: /var/volume
  volumeClaimTemplates:
    - metadata:
        name: foo-standard-volume-claim
        labels:
          app.kubernetes.io/name: foo
          app.kubernetes.io/component: db
      spec:
        storageClassName: standard
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 2Gi
```

<br>

## StorageClass

### allowVolumeExpansion

対応するPersistentVolumeClaimのサイズを拡張した場合に、対応する外部Volumeも自動的に拡張するようにする。

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: foo-storage-class
parameters:
  type: gp3
allowVolumeExpansion: true
```

> - https://kubernetes.io/docs/concepts/storage/storage-classes/#allow-volume-expansion

<br>

### parameters

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: foo-storage-class
parameters:
  type: gp3
```

<br>

### provisioner

Node外ストレージツールのプロビジョナーを設定する。

プロビジョナーは、StorageClassに合致するPersistentVolumeを自動的に作成する。

本番環境ではクラウドのNode外ストレージツールのプロビジョナーでPersistentVolumeを作成し、一方で開発環境では開発ツール (例：Minikube) のプロビジョナーを使用するとよい。

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: aws-ebs-csi
# AWS EBS CSIドライバー
provisioner: ebs.csi.aws.com
```

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
# Minikube CSIドライバー
provisioner: k8s.io/minikube-hostpath
```

> - https://cstoku.dev/posts/2018/k8sdojo-12/#pvc-storageclass%E3%82%92pv%E3%82%92%E5%8B%95%E7%9A%84%E3%81%ABprovisioning%E3%81%99%E3%82%8B

<br>

### reclaimPolicy

PersistentVolumeClaimが削除された時に、Node外ストレージツール (例：AWS EBS、NFS、iSCSI、Cephなどなど) が提供するVolumeを削除する否かを設定する。

PersistentVolumeにも同様の機能がある。

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: foo-storage-class
reclaimPolicy: Delete
```

<br>

### volumeBindingMode

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: foo-storage-class
volumeBindingMode: WaitForFirstConsumer
```

<br>
