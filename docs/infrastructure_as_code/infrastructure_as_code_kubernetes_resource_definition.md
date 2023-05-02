---
title: 【IT技術の知見】リソース定義＠Kubernetes
description: リソース定義＠Kubernetesの知見を記録しています。
---

# リソース定義＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. APIService

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

> ↪️：https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/api-service-v1/#APIServiceSpec

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

> ↪️：https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/api-service-v1/#APIServiceSpec

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

> ↪️：https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/api-service-v1/#APIServiceSpec

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

> ↪️：https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/api-service-v1/#APIServiceSpec

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

> ↪️：https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/api-service-v1/#APIServiceSpec

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

> ↪️：https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/api-service-v1/#APIServiceSpec

<br>

## 02. CertificateSigningRequest

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

> ↪️：
>
> - https://qiita.com/knqyf263/items/aefb0ff139cfb6519e27
> - https://goodbyegangster.hatenablog.com/entry/2021/01/18/131452

定義したCertificateSigningRequestを承認し、SSL証明書 (`.crt`) を作成するためには、`kubectl certificate approve`コマンドを使用する。

```bash
# 承認
$ kubectl certificate approve foo-csr

# SSL証明書を取得する。
$ kubectl get csr foo-csr -o jsonpath='{.status.certificate}'| base64 -d > foo.crt
```

<br>

## 03. Config

### clusters

#### ▼ clustersとは

`kubectl`コマンドの向き先となるClusterを設定する。

> ↪️：https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

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
      # kube-apiserverのSSL証明書
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

> ↪️：https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

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

実際に使用するCluster名とユーザー名を、`.contexts[].context.cluster`キーと`.contexts[].context.user`キーから選んで設定する。

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

> ↪️：https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

<br>

### preferences

#### ▼ preferencesとは

```yaml
apiVersion: v1
kind: Config
preferences: {}
```

> ↪️：https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

<br>

### users

#### ▼ usersとは

kube-apiserverのクライアント (特に`kubectl`コマン実行者) のUserAccountの情報を設定する。

> ↪️：https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

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

ユーザーの認証情報を設定する。

AWS EKSのように、認証情報を動的に取得するようにしても良い。

```yaml

apiVersion: v1
kind: Config
users:
  - user:
      exec:
        apiVersion: client.authentication.k8s.io/v1alpha1
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

## 05. ConfigMap

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
  enableFoo: "true" # ダブルクオーテーションで囲う。
  number: "1"
```

> ↪️：https://stackoverflow.com/questions/63905890/kubernetes-how-to-set-boolean-type-variable-in-configmap

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

## 04. CronJob

### .spec.jobTemplate

#### ▼ jobTemplateとは

CronJobで、定期的に実行するJobを設定する。

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello
spec:
  schedule: "00 * * * *"
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
  name: hello
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
  name: hello
spec:
  schedule: "00 * * * *" # 一時間ごとに実行する。
```

<br>

### .spec.successfulJobsHistoryLimit

#### ▼ successfulJobsHistoryLimitとは

実行に成功したJobに関して、上限の履歴数を設定する。

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello
spec:
  successfulJobsHistoryLimit: 2
```

<br>

## 07. Deployment

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
      app.kubernetes.io/app: foo-pod
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo-pod
        app.kubernetes.io/component: app
```

> ↪️：
>
> - https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#deployment-v1-apps
> - https://dr-asa.hatenablog.com/entry/2018/04/02/174006

<br>

### .spec.revisionHistoryLimit

#### ▼ revisionHistoryLimitとは

保存されるリビジョン番号の履歴数を設定する。

もし依存のリビジョン番号にロールバックする場合があるのであれば、必要数を設定しておく。

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
      app.kubernetes.io/app: foo-pod
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo-pod
        app.kubernetes.io/component: app
```

> ↪️：https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#deployment-v1-apps

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
      app.kubernetes.io/app: foo-pod
      app.kubernetes.io/component: app
  template:
    metadata:
      labels: # Podのmetadata.labelsキー
        app.kubernetes.io/app: foo-pod
        app.kubernetes.io/component: app
```

> ↪️：https://cstoku.dev/posts/2018/k8sdojo-08/#label-selector

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
      app.kubernetes.io/app: foo-pod # 変更しようとする
      app.kubernetes.io/component: app # 変更しようとする
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo-pod
        app.kubernetes.io/component: app
```

すると、以下のようなエラーになってしまう。

```bash
v1.LabelSelector{MatchLabels:map[string]string{"app.kubernetes.io/app":"foo-pod", "app.kubernetes.io/component":"app"}, MatchExpressions:[]v1.LabelSelectorRequirement(nil)}: field is immutable
```

> ↪️：
>
> - https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#label-selector-updates
> - https://github.com/kubernetes/client-go/issues/508#issuecomment-589296590
> - https://shunyaueta.com/posts/2021-12-02/

<br>

### .spec.strategy

#### ▼ strategyとは

デプロイメントの方法を設定する。

#### ▼ Recreate

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
      app.kubernetes.io/app: foo-pod
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo-pod
        app.kubernetes.io/component: app
```

> ↪️：https://amateur-engineer-blog.com/kubernetes-recreate/

#### ▼ RollingUpdate

ローリングアップデートを使用して、新しいPodを作成する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 100% # Podのレプリカ数と同じ数だけ新しいPodを作成する。
      maxUnavailable: 0% # Podの停止数がレプリカ数を下回らないようにする。
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo-pod
        app.kubernetes.io/component: app
```

もし`maxSurge`キーを`100`%、また`maxUnavailable`キーを`0`%とすると、ローリングアップデート時に、Podのレプリカ数と同じ数だけ新しいPodを作成するようになる。

また、Podの停止数がレプリカ数を下回らないようになる。

![kubernetes_deployment_strategy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_deployment_strategy.png)

> ↪️：https://kakakakakku.hatenablog.com/entry/2021/09/06/173014

<br>

### .spec.template

#### ▼ templateとは (設定項目はPodと同じ)

Deploymentで維持管理するPodのテンプレートを設定する。

設定項目はPodと同じである。

Deployment自体の`.metadata.labels`キーを更新した場合はPodは再作成しないが、`.spec.template`キー配下の`.metadata.labels`キーの場合は、Podの再作成となる。

> ↪️：https://kubernetes.io/docs/concepts/workloads/pods/#pod-templates

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo-pod
    spec:
      containers:
        - name: foo-gin
          image: foo-gin:1.0.0
          ports:
            - containerPort: 8080
```

<br>

## 08. EndpointSlice

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

Podが現在スケジューリングされているNode名を設定する。

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

Podが現在スケジューリングされているAZを設定する。

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

## 09. HTTPRoute

記入中...

```yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  name: http
  namespace: foo
spec:
  parentRefs:
    - name: gateway
      namespace: istio-ingress
      sectionName: default
  hostnames:
    - "foo.example.com"
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /foo
      backendRefs:
        - name: foo
          port: 80
```

<br>

## 10. HorizontalPodAutoscaler

### .spec.maxReplicas、spec.minReplicas

#### ▼ maxReplicas、minReplicas、とは

自動水平スケーリングのスケールアウト時の最大/最小Pod数を設定する。

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: foo-horizontal-pod-autoscaler
spec:
  maxReplicas: 5
  minReplicas: 1
```

> ↪️：https://qiita.com/sheepland/items/37ea0b77df9a4b4c9d80

<br>

### .spec.metrics

#### ▼ metricsとは

自動水平スケーリングのトリガーとするメトリクスと、維持されるターゲット値を設定する。

#### ▼ type

メトリクスの種類を設定する。

以下のタイプを設定できる。

| タイプ名   | 説明                                            | メトリクス例                                     |
| ---------- | ----------------------------------------------- | ------------------------------------------------ |
| `Resource` | リソースメトリクス                              | CPU使用率、メモリ使用率、など                    |
| `Pods`     | Podのカスタムメトリクス                         | Queries Per Second、message broker’s queue、など |
| `Object`   | Pod以外のKubernetesリソースのカスタムメトリクス | Ingressに関するメトリクスなど                    |
| `External` | Kubernetes以外の任意のメトリクス                | AWS、GCP、Azureに固有のメトリクス                |

#### ▼ Resourceの場合

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

> ↪️：
>
> - https://zenn.dev/lapi/articles/e7ae967aa5161b#hpa%E3%81%AE%E8%A8%AD%E5%AE%9A
> - https://qiita.com/sheepland/items/37ea0b77df9a4b4c9d80

#### ▼ Podsの場合

記入中...

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

> ↪️：https://qiita.com/sheepland/items/37ea0b77df9a4b4c9d80

<br>

## 11. Ingress

### .metadata.annotations

#### ▼ annotationsとは

外部Ingressを使用する場合、オプションを設定する。

<br>

### .spec.ingressClassName

#### ▼ ingressClassNameとは

標準のIngressの代わりに外部Ingressを使用する場合、IngressClassの`.metadata.name`キーの値を設定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-ingress
spec:
  ingressClassName: foo-ingress-class
```

> ↪️：
>
> - https://kubernetes.io/docs/concepts/services-networking/ingress/#the-ingress-resource
> - https://kubernetes.io/docs/concepts/services-networking/ingress/#deprecated-annotation

<br>

### .spec.hosts

#### ▼ hosts

ルーティング条件とするHostヘッダーの値を設定する。

`.spec.hosts`キーを設定しなければ、全てのHostヘッダー値が対象になる。

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

Ingressを使用する場合、ルーティング先のServiceは、ClusterIP Serviceとする。

> ↪️：https://chidakiyo.hatenablog.com/entry/2018/09/10/Kubernetes_NodePort_vs_LoadBalancer_vs_Ingress%3F_When_should_I_use_what%3F_%28Kubernetes_NodePort_%E3%81%A8_LoadBalancer_%E3%81%A8_Ingress_%E3%81%AE%E3%81%A9%E3%82%8C%E3%82%92%E4%BD%BF%E3%81%86

#### ▼ .spec.rules[].host

ホストベースルーティングの判定に使用するパス名を設定する。

本番環境では、ドメインを指定した各種ダッシュボードにアクセスできるようにする必要がある。

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

#### ▼ .spec.rules[].http.paths[].path

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

> ↪️：https://kubernetes.io/docs/concepts/services-networking/ingress/#examples

#### ▼ .spec.rules[].http.paths[].pathType

パスベースルーティング判定時のルールの厳しさを設定する。

| 厳しさ                   | タイプ                 |                                                                                                                                                                                                                                                                                                             |
| ------------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| パス名の前方一致         | Prefix                 | 前方一致である。最初のパスさえ合致すれば、トレイリングスラッシュの有無や最初のパス以降のパスも許容して合致させる。そのため、ワイルドカード (`*`) は不要である。                                                                                                                                             |
| パス名の完全一致         | Exact                  | 完全一致である。指定したパスのみを合致させ、トレイリングスラッシュも有無も許容しない。                                                                                                                                                                                                                      |
| IngressClassの機能による | ImplementationSpecific | IngressClass (例：Nginx、ALB、など) の設定に応じて、独自タイプ、Prefix、Exact、を自動的に切り替える。そのため、IngressのルーティングルールがIngressClassに依存しており、IngressClassの仕様変更や別のIngressClassへの移行があった場合に、Ingressコントローラーが想定外のルーティングを実行する可能性がある。 |

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

> ↪️：
>
> - https://kubernetes.io/docs/concepts/services-networking/ingress/#examples
> - https://kubernetes.io/blog/2020/04/02/improvements-to-the-ingress-api-in-kubernetes-1.18/#better-path-matching-with-path-types

#### ▼ .spec.rules[].http.paths[].backend

ルーティング先のServiceを設定する。

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

## 12. IngressClass

### .spec.controller

#### ▼ controllerとは

標準のIngressの代わりに外部Ingressを使用する場合、外部のIngressとIngressコントローラーを紐付けられるように、コントローラーのAPIグループを設定する。

> ↪️：
>
> - https://kubernetes.io/docs/reference/kubernetes-api/service-resources/ingress-class-v1/#IngressClassSpec
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/ingress_class/#deprecated-kubernetesioingressclass-annotation
> - https://kubernetes.github.io/ingress-nginx/#i-have-only-one-ingress-controller-in-my-cluster-what-should-i-do

#### ▼ AWS ALBの場合

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-alb-ingress-class
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: ingress.k8s.aws/alb
```

#### ▼ Nginx Ingressの場合

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-ingress-class
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: k8s.io/ingress-nginx
```

#### ▼ Istio Ingressの場合

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-istio-ingress-class
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: istio.io/ingress-controller
```

> ↪️：https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/#specifying-ingressclass

<br>

### .spec.parameters

#### ▼ parametersとは

外部Ingressに応じたパラメーターを設定する。

代わりとして、IngressClassParamsを使用しても良い。

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

> ↪️：
>
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/ingress_class/#ingressclass
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/ingress_class/#ingressclassparams

<br>

## 13. Gateway

記入中...

```yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: Gateway
metadata:
  name: gateway
  namespace: istio-ingress
spec:
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

<br>

## 14. Job

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

> ↪️：https://kubernetes.io/docs/concepts/workloads/controllers/job/#job-termination-and-cleanup

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

並列的に起動できるPod数を設定する。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: foo-job
spec:
  parallelism: 3
```

> ↪️：https://kubernetes.io/docs/concepts/workloads/controllers/job/#controlling-parallelism

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
```

> ↪️：https://kubernetes.io/docs/concepts/workloads/controllers/job/#pod-template

<br>

### .spec.ttlSecondsAfterFinished

#### ▼ ttlSecondsAfterFinishedとは

Jobが成功/失敗した場合のJob自体の削除を有効化しつつ、その秒数を設定する。

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: foo-job
spec:
  # Job自体の削除を有効化しつつ、Jobの実行が終了してから30秒後とする
  ttlSecondsAfterFinished: 30
```

> ↪️：
>
> - https://kubernetes.io/docs/concepts/workloads/controllers/job/#clean-up-finished-jobs-automatically
> - https://dev.appswingby.com/kubernetes/kubernetes-%E3%81%A7-job%E3%82%92%E8%87%AA%E5%8B%95%E5%89%8A%E9%99%A4%E3%81%99%E3%82%8Bttlsecondsafterfinished%E3%81%8Cv1-21%E3%81%A7beta%E3%81%AB%E3%81%AA%E3%81%A3%E3%81%A6%E3%81%84%E3%81%9F%E4%BB%B6/

<br>

## 15. Node

Kubernetesの実行時に自動的に作成される。

もし手動で作成する場合は、`kubectl`コマンドを実行することにより、その時に`--register-node`キーを`false`とする必要がある。

<br>

## 16. PersistentVolume

### .spec.accessModes

#### ▼ accessModesとは

ボリュームへの認可スコープを設定する。

> ↪️：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes

#### ▼ ReadWriteMany

ボリュームに対して、複数のNodeから読み出し/書き込みできるようにする。

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

ボリュームに対して、複数のNodeから読み出しでき、また単一のNodeのみから書き込みできるようにする。

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

ボリュームに対して、単一のNodeからのみ読み出し/書き込みできるようにする。

NodeごとにDBを分割したい場合に使用する。

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

<br>

### .spec.capacity

#### ▼ capacityとは

ストレージの最大サイズを設定する。

> ↪️：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#capacity

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

<br>

### .spec.hostPath

#### ▼ hostPathとは

PersistentVolumeの一種であるHostPathボリュームを作成する。

Volumeの一種であるHostPathボリュームとは区別すること。

> ↪️：https://kubernetes.io/docs/concepts/storage/persistent-volumes/

#### ▼ path

Node側のマウント元のディレクトリを設定する。

Podのマウントポイントは、Podの`.spec.containers[].volumeMount`キーで設定する。

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

### .spec.initContainers

`.spec.containers`キーで設定したコンテナよりも先に起動するコンテナ (InitContainer) を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      ports:
        - containerPort: 8080
      volumeMounts:
        - name: foo-gin-volume
          mountPath: /go/src
  initContainers:
    - name: readiness-check-db
      image: busybox:1.28
      # StatefulSetのDBコンテナの3306番ポートに通信できるまで、本Podのfoo-ginコンテナの起動を待機する。
      # StatefulSetでredinessProbeを設定しておけば、これのPodがREADYになるまでncコマンドは成功しないようになる。
      command:
        - /bin/bash
        - -c
      args:
        - >
          until nc -z db 3306; do
            sleep 1;
          done
```

> ↪️：https://memo.koya-it.com/software_service/kubernetes.html#initcontainers-pod%E8%B5%B7%E5%8B%95%E5%89%8D%E3%81%AB%E5%AE%9F%E8%A1%8C%E3%81%99%E3%82%8B%E5%87%A6%E7%90%86%E3%82%92%E6%9B%B8%E3%81%8F

<br>

### .spec.local

#### ▼ localとは

Node上にストレージ上にボリュームを作成する。

`.spec.nodeAffinity`キーの設定が必須であり、Nodeを明示的に指定できる。

> ↪️：
>
> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/
> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#node-affinity

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

> ↪️：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#mount-options

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

> ↪️：
>
> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#mount-options
> - https://ytsuboi.jp/archives/505
> - https://qiita.com/reoring/items/4d80a04dd31e991dd233

<br>

### .spec.nodeAffinity

#### ▼ nodeAffinityとは

PersistentVolumeの作成先とするNodeを設定する。

> ↪️：https://qiita.com/ysakashita/items/67a452e76260b1211920

#### ▼ required.nodeSelectorTerms.matchExpressions

作成先のNodeの`.metadata.labels`キーを指定するための条件 (`In`、`NotIn`、`Exists`) を設定する。

| 設定値        | 条件の説明                                                  |
| ------------- | ----------------------------------------------------------- |
| In            | 指定した`metadata.labels`キー配下に、指定した値を持つ。     |
| NotIn         | 指定した`metadata.labels`キー配下に、指定した値を持たない。 |
| Exists        | 指定した`metadata.labels`キーを持つ。                       |
| DoesNotExists | 指定した`metadata.labels`キーを持たない。                   |

> ↪️：
>
> - https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#set-based-requirement
> - https://riyafa.wordpress.com/2020/06/07/kubernetes-matchexpressions-explained/

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
            - key: node.kubernetes.io/nodegroup # metadata.labelsキー
              operator: In
              values: # metadata.labelsキーの値
                - bar-group
              # 開発環境であれば minikubeを指定する。
              # - minikube
```

<br>

### .spec.persistentVolumeReclaimPolicy

#### ▼ persistentVolumeReclaimPolicyとは

PersistentVolumeのライフサイクルを設定する。

> ↪️：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#reclaim-policy

#### ▼ Delete

PersistentVolumeを指定するPersistentVolumeClaimが削除された場合、PersistentVolumeも自動的に削除する。

クラウドプロバイダーのPersistentVolumeの動的プロビジョニングのために使用することが多い。

> ↪️：https://www.amazon.co.jp/dp/B07HFS7TDT

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  persistentVolumeReclaimPolicy: Delete
```

#### ▼ Recycle (非推奨)

PersistentVolumeを指定するPersistentVolumeClaimが削除された場合、PersistentVolume内のデータのみを削除し、PersistentVolume自体は削除しない。

将来的に廃止予定のため、非推奨。

> ↪️：https://www.amazon.co.jp/dp/B07HFS7TDT

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  persistentVolumeReclaimPolicy: Recycle
```

#### ▼ Retain

PersistentVolumeを指定するPersistentVolumeClaimが削除されたとしても、PersistentVolumeは削除しない。

割り当てから解除されたPersistentVolumeはReleasedステータスになる。

一度、Releasedステータスになると、他のPersistentVolumeClaimからは指定できなくなる。

> ↪️：https://www.amazon.co.jp/dp/B07HFS7TDT

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  persistentVolumeReclaimPolicy: Retain
```

<br>

### .spec.storageClassName

#### ▼ storageClassNameとは

ストレージクラス名を設定する。

これは、PersistentVolumeClaimが特定のPersistentVolumeを要求する時に必要になる。

注意点として、もし異なるStorageClassNameに変更したい場合は、PersistentVolumeを作成し直す必要がある。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  storageClassName: standard
```

名前の例として以下がある。

| クラス名 | 説明                                  | 補足                                                                                                                                                                                                     |
| -------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| standard | デフォルト値である。                  |                                                                                                                                                                                                          |
| fast     | SSDをPersistentVolumeとして使用する。 | ↪️：https://kubernetes.io/docs/concepts/storage/_print/#%E5%8B%95%E7%9A%84%E3%83%97%E3%83%AD%E3%83%93%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0%E3%82%92%E6%9C%89%E5%8A%B9%E3%81%AB%E3%81%99%E3%82%8B |
| slow     | HDをPersistentVolumeとして使用する。  | ↪️：https://kubernetes.io/docs/concepts/storage/_print/#%E5%8B%95%E7%9A%84%E3%83%97%E3%83%AD%E3%83%93%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0%E3%82%92%E6%9C%89%E5%8A%B9%E3%81%AB%E3%81%99%E3%82%8B |

> ↪️：
>
> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#class
> - https://stackoverflow.com/questions/61187909/how-do-i-change-the-storage-class-of-existing-persistent-volumes

<br>

## 17. PersistentVolumeClaim

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

> ↪️：
>
> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#class
> - https://stackoverflow.com/questions/61187909/how-do-i-change-the-storage-class-of-existing-persistent-volumes

<br>

## 18. Pod

### .spec.affinity

#### ▼ affinityとは

kube-schedulerがPodをスケジューリングするNodeを設定する。

`.spec.nodeSelector`キーと比較して、より複雑に条件を設定できる。

DeploymentやStatefulでこれを使用する場合は、Podのレプリカそれぞれが独立し、条件に合わせてスケジューリングされる。

> ↪️：
>
> - https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity
> - https://www.devopsschool.com/blog/understanding-node-selector-and-node-affinity-in-kubernetes/
> - https://hawksnowlog.blogspot.com/2021/03/namespaced-pod-antiaffinity-with-deployment.html#%E7%95%B0%E3%81%AA%E3%82%8B-namespace-%E9%96%93%E3%81%A7-podantiaffinity-%E3%82%92%E4%BD%BF%E3%81%86%E5%A0%B4%E5%90%88

<br>

### .spec.affinity.nodeAffinity

#### ▼ affinity.nodeAffinityとは

Nodeの`.metadata.labels`キーを指定することにより、kube-schedulerがPodをスケジューリングするNodeを設定する。

`.spec.nodeSelector`キーと比較して、より複雑に条件を設定できる。

DeploymentやStatefulでこれを使用する場合は、Podのレプリカそれぞれが独立し、条件に合わせてスケジューリングされる。

複数のNodeに同じ`.metadata.labels`キーを付与しておき、このNode群をNodeグループと定義すれば、特定のNodeにPodを作成するのみでなくNodeグループ単位でPodをスケジューリングできる。

> ↪️：
>
> - https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity
> - https://www.devopsschool.com/blog/understanding-node-selector-and-node-affinity-in-kubernetes/
> - https://hawksnowlog.blogspot.com/2021/03/namespaced-pod-antiaffinity-with-deployment.html#%E7%95%B0%E3%81%AA%E3%82%8B-namespace-%E9%96%93%E3%81%A7-podantiaffinity-%E3%82%92%E4%BD%BF%E3%81%86%E5%A0%B4%E5%90%88

#### ▼ requiredDuringSchedulingIgnoredDuringExecution (hard)

条件に合致するNodeにのみPodをスケジューリングする。

もし条件に合致するNodeがない場合、Podのスケジューリングを待機し続ける。

共通する`SchedulingIgnoredDuringExecution`の名前の通り、`.spec.affinity`キーによるスケジューリングの制御は新しく作成されるPodにしか適用できず、すでに実行中のPodには適用できず、再スケジューリングしないといけない。

Podが削除された後にNodeの`.metadata.labels`キーの値が変更されたとしても、一度スケジューリングされたPodが`.spec.affinity`キーの設定で再スケジューリングされることはない。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      ports:
        - containerPort: 8080
  affinity:
    nodeAffinity:
      # ハードアフィニティ
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              # PodをスケジューリングしたいNodeのmetadata.labelsキー
              # ここでNodeグループのキーを指定しておけば、Nodeグループ単位でスケジューリングできる。
              - key: node.kubernetes.io/nodegroup
                operator: In
                # 指定した値をキーに持つNodeに、Podをスケジューリングする。
                values:
                  - app
```

> ↪️：
>
> - https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity
> - https://cstoku.dev/posts/2018/k8sdojo-18/#%E6%9D%A1%E4%BB%B6%E3%81%AE%E5%BF%85%E9%A0%88%E8%A6%81%E4%BB%B6%E3%81%A8%E6%8E%A8%E5%A5%A8%E8%A6%81%E4%BB%B6

#### ▼ preferredDuringSchedulingIgnoredDuringExecution (soft)

条件に合致するNodeに優先的にPodをスケジューリングする。

もし条件に合致するNodeがない場合でも、それを許容し、条件に合致しないNodeにPodをスケジューリングする。

条件に合致しないNodeの探索で重みづけルールを設定できる。

共通する`SchedulingIgnoredDuringExecution`の名前の通り、`.spec.affinity`キーによるスケジューリングの制御は新しく作成されるPodにしか適用できず、すでに実行中のPodには適用できず、再スケジューリングしないといけない。

Podが削除された後にNodeの`.metadata.labels`キーの値が変更されたとしても、一度スケジューリングされたPodが`.spec.affinity`キーの設定で再スケジューリングされることはない。

> ↪️：
>
> - https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity
> - https://cstoku.dev/posts/2018/k8sdojo-18/#%E6%9D%A1%E4%BB%B6%E3%81%AE%E5%BF%85%E9%A0%88%E8%A6%81%E4%BB%B6%E3%81%A8%E6%8E%A8%E5%A5%A8%E8%A6%81%E4%BB%B6

<br>

### .spec.affinity.podAffinity

#### ▼ affinity.podAffinityとは

Node内のPodを、`.metadata.labels`キーで指定することにより、そのPodと同じNode内に、新しいPodをスケジューリングする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
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
                  # 指定した値をキーに持つPodと同じNodeに、Podをスケジューリングする。
                  values:
                    - bar-gin
```

> ↪️：
>
> - https://qiita.com/Esfahan/items/a673317a29ca407e5ae7#pod-affinity
> - https://zenn.dev/geek/articles/c74d204b00ba1a

#### ▼ requiredDuringSchedulingIgnoredDuringExecution (ハード)

`.spec.affinity.nodeAffinity`キーのPod版である。

#### ▼ preferredDuringSchedulingIgnoredDuringExecution (ソフト)

`.spec.affinity.nodeAffinity`キーのPod版である。

<br>

### .spec.affinity.podAntiAffinity

#### ▼ affinity.podAntiAffinityとは

`.metadata.labels`キーを持つNodeとは異なるNode内に、そのPodをスケジューリングする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
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
                  # 指定した値をキーに持つPodとは異なるNodeに、Podをスケジューリングする。
                  values:
                    - bar-gin
```

> ↪️：https://hawksnowlog.blogspot.com/2021/03/namespaced-pod-antiaffinity-with-deployment.html

**＊スケジューリング例＊**

もし、複製するPodの名前を設定した場合、Podのレプリカ同志は同じNodeにスケジューリングされることを避ける。

また、分散単位に`topology.kubernetes.io/zone`を設定しているため、各AZにPodをバラバラにスケジューリングする。

結果として、各AZのNodeにPodが`1`個ずつスケジューリングされるようになる。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod
  replicas: 3
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo-pod
    spec:
      containers:
        - name: foo-gin
          image: foo-gin:1.0.0
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
                      # 指定した値をキーに持つPodとは異なるNodeに、Podをスケジューリングする。
                      values:
                        # 自身が複製するPodの名前
                        - foo-gin
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

> ↪️：https://hawksnowlog.blogspot.com/2021/03/namespaced-pod-antiaffinity-with-deployment.html#%E7%95%B0%E3%81%AA%E3%82%8B-namespace-%E9%96%93%E3%81%A7-podantiaffinity-%E3%82%92%E4%BD%BF%E3%81%86%E5%A0%B4%E5%90%88

<br>

### .spec.containers

#### ▼ containersとは

Pod内で起動するコンテナを設定する。

PodをDeploymentやReplicaSetに紐付けずに使用することは非推奨である。

> ↪️：https://kubernetes.io/docs/concepts/configuration/overview/#naked-pods-vs-replicasets-deployments-and-jobs

#### ▼ name、image

Podを構成するコンテナの名前、ベースイメージ、を設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      ports:
        - containerPort: 8080
```

#### ▼ envFrom

`.spec.volumes.secret`キーとは異なり、環境変数としてコンテナに出力するSecretやConfigMapを設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      ports:
        - containerPort: 8080
      envFrom:
        - secretRef:
            name: foo-secret # 環境変数としてコンテナに出力するSecret
        - configMapRef:
            name: foo-config-map # 環境変数としてコンテナに出力するConfigMap
```

#### ▼ ports

コンテナが待ち受けるポート番号を、仕様として設定する。

単なる仕様であるため、コンテナがポート番号を公開してさえいれば、`.spec.containers[].ports`キーは設定しなくとも問題ない。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      # 待ち受けるポート番号の仕様
      ports:
        - containerPort: 8080
```

> ↪️：https://qiita.com/masahata/items/f3792d4ee06b42376cbc

#### ▼ imagePullPolicy

イメージのプルのルールを設定する。

| オプション   | 説明                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------ |
| IfNotPresent | 仮想環境上にビルドされたイメージがあればこれを使用して、なければイメージリポジトリからぷるする。 |
| Always       | イメージリポジトリからコンテナイメージをプルする。                                               |
| Never        | イメージをプルせず、仮想環境上にビルドされたイメージを使用する。                                 |

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      imagePullPolicy: IfNotPresent
      ports:
        - containerPort: 8080
```

> ↪️：https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy

#### ▼ resources

Node全体のハードウェアリソースを分母として、Pod内のコンテナが要求するリソースの下限/上限必要サイズを設定する。

各Podは、Node内のハードウェアリソースを奪い合っており、Nodeが複数ある場合、kube-schedulerはリソースの空いているNode上のPodのスケーリングを実行する。

この時kube-schedulerは、コンテナの`resource`キーの値に基づいて、どのNodeにPodを作成するかを決めている。

同じPod内に`resources`キーが設定されたコンテナが複数ある場合、下限/上限必要サイズを満たしているか否かの判定は、同じPod内のコンテナの要求サイズの合計値に基づくことになる。

| キー名     | 説明                                             | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `requests` | ハードウェアリソースの下限必要サイズを設定する。 | ・高くしすぎると、他のPodがスケーリングしにくくなる。<br>・もし、設定値がNodeのハードウェアリソース以上の場合、コンテナは永遠に起動しない。<br>↪️：https://qiita.com/jackchuka/items/b82c545a674975e62c04#cpu <br>・もし、これを設定しない場合は、コンテナが使用できるハードウェアリソースの下限がなくなる。そのため、Kubernetesが重要なPodにリソースを必要最低限しか割かず、パフォーマンスが低くなる可能性がある。                                                                                                                                                                                                                                                                                                                                                                                               |
| `limits`   | ハードウェアリソースの上限必要サイズを設定する。 | ・低くしすぎると、コンテナのパフォーマンスが常時悪くなる。<br>・もし、コンテナが上限値以上のハードウェアリソースを要求すると、CPUの場合はPodは削除されずに、コンテナのスロットリング (起動と停止を繰り返す) が起こる。一方でメモリの場合は、OOMキラーによってPodのプロセスが削除され、Podは再作成される。<br>↪️：https://blog.mosuke.tech/entry/2020/03/31/kubernetes-resource/ <br>・もし、これを設定しない場合は、コンテナが使用できるハードウェアリソースの上限がなくなる。そのため、Kubernetesが重要でないPodにリソースを割いてしまう可能性がある。<br>↪️： <br>・https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/#if-you-do-not-specify-a-cpu-limit <br>・https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/#if-you-do-not-specify-a-memory-limit |

> ↪️：https://newrelic.com/jp/blog/best-practices/set-requests-and-limits-for-your-clustercapacity-management

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

> ↪️：
>
> - https://kubernetes.io/docs/concepts/architecture/nodes/#capacity
> - https://smallit.co.jp/blog/667/

| ハードウェアリソース名 | 単位                                              |
| ---------------------- | ------------------------------------------------- |
| `cpu`                  | m：millicores (`1`m = `1` ユニット = `0.001`コア) |
| `memory`               | Mi：mebibyte (`1`Mi = `1.04858`MB)                |

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      resources:
        # 下限必要サイズ
        requests:
          cpu: 250m
          memory: 64Mi
        # 上限サイズ
        limits:
          cpu: 500m
          memory: 128Mi
    - name: istio-proxy
      ...
```

各コンテナの実際のハードウェアリソース消費量を確認する場合は、`kubectl top`コマンドを使用する。

『`(実際の値) ÷ (メモリ上限値) × 100`』で計算できる。

```bash
$ kubectl top pod --container -n foo-namespace

POD       NAME            CPU(cores)   MEMORY(bytes)
foo-pod   foo-gin         1m           19Mi          # 19Mi ÷ 128Mi × 100 = 14%
foo-pod   istio-proxy     5m           85Mi
```

#### ▼ volumeMounts

Pod内のコンテナのマウントポイントを設定する。

`.spec.volumes`キーで設定されたボリュームのうちから、コンテナにマウントするボリュームを設定する。

Node側のマウント元のディレクトリは、PersistentVolumeの`.spec.hostPath`キーで設定する。

volumeMountという名前であるが、『ボリュームマウント』を実行するわけではなく、VolumeやPersistentVolumeで設定された任意のマウントを実行できることに注意する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      ports:
        - containerPort: 8080
      volumeMounts:
        - name: foo-gin-volume
          mountPath: /go/src
  volumes:
    - name: foo-gin-volume
      persistentVolumeClaim:
        claimName: foo-persistent-volume-claim
```

> ↪️：https://stackoverflow.com/questions/62312227/docker-volume-and-kubernetes-volume

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
    - name: foo-gin
      image: foo-gin:1.0.0
      ports:
        - containerPort: 8080
      workingDir: /go/src
```

<br>

### .spec.containers[].livenessProbe

#### ▼ livenessProbeとは

kubeletは、Pod内のコンテナが起動しているか否かのヘルスチェックを行う。

ReadinessProbeチェックよりもヘルスチェックの意味合いが強い。

コンテナのLivenessProbeヘルスチェックに失敗すると、Podはコンテナを自動的に再起動する。

> ↪️：
>
> - https://www.ianlewis.org/jp/kubernetes-health-check
> - https://amateur-engineer-blog.com/livenessprobe-readinessprobe/

#### ▼ httpGet

コンテナのLivenessProbeヘルスチェックのエンドポイントを設定する。

自身のアプリケーションではエンドポイントを実装する必要があるが、OSSではすでに用意されていることが多い。

| ツール       | エンドポイント   |
| ------------ | ---------------- |
| Alertmaanger | `/-/healthy`     |
| Grafana      | `/healthz`       |
| Kiali        | `/kiali/healthz` |
| Prometheus   | `/-/healthy`     |
| ...          | ...              |

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      livenessProbe:
        httpGet:
          port: 80
          path: /healthcheck
```

#### ▼ failureThreshold

コンテナのLivenessProbeヘルスチェックが失敗したとみなす試行回数を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      livenessProbe:
        failureThreshold: 5
```

#### ▼ gracePeriodSeconds

`2`回目以降のLivenessProbeヘルスチェックを開始するまでの待機時間を設定する。

注意として、初回のLivenessProbeヘルスチェックは、`.spec.containers[].livenessProbe.initialDelaySeconds`キーで設定する。

この時間を過ぎてもコンテナのLivenessProbeヘルスチェックが失敗する場合、Podはコンテナを再起動する。

設定した時間が短すぎると、Podがコンテナの起動を待てずに再起動を繰り返してしまう。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      livenessProbe:
        # 2回目以降のLivenessProbeヘルスチェックを実行するまでに5秒間待機する。
        gracePeriodSeconds: 5
```

#### ▼ initialDelaySeconds

初回のLivenessProbeヘルスチェックを開始するまでの待機時間を設定する。

注意として、`2`回目以降のLivenessProbeによる再起動は、`.spec.containers[].livenessProbe.gracePeriodSeconds`キーで設定する。

この時間を過ぎてもコンテナのLivenessProbeヘルスチェックが失敗する場合、Podはコンテナを再起動する。

設定した時間が短すぎると、Podがコンテナの起動を待てずに再起動を繰り返してしまう。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      livenessProbe:
        # 初回以降のLivenessProbeヘルスチェックを実行するまでに5秒間待機する。
        initialDelaySeconds: 5
```

#### ▼ timeoutSeconds

コンテナのLivenessProbeヘルスチェックのタイムアウト時間を設定する。

この時間を過ぎてもコンテナのLivenessProbeヘルスチェックが失敗する場合、Podはコンテナを再起動する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      livenessProbe:
        # LivenessProbeヘルスチェックのタイムアウト時間を30秒とする。
        timeoutSeconds: 30
```

#### ▼ periodSeconds

コンテナのLivenessProbeヘルスチェックの試行当たりの間隔を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      livenessProbe:
        # 5秒ごとにLivenessProbeヘルスチェックを実行する。
        periodSeconds: 5
```

<br>

### .spec.containers[].readinessProbe

#### ▼ readinessProbeとは

kubeletは、Pod内ですでに起動中のコンテナが仕様上正しく稼働しているか否かのチェックを行う。

コンテナが起動してもプロセスの起動に時間がかかる場合 (例：DB) などで使用する。

> ↪️：
>
> - https://www.ianlewis.org/jp/kubernetes-health-check
> - https://amateur-engineer-blog.com/livenessprobe-readinessprobe/#toc4

#### ▼ failureThreshold

ReadinessProbeチェックが失敗したとみなす試行回数を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-mysql
      image: foo-mysql:1.0.0
      readinessProbe:
        failureThreshold: 5
```

#### ▼ gracePeriodSeconds

`2`回目以降のReadinessProbeヘルスチェックを開始するまでの待機時間を設定する。

注意として、初回のReadinessProbeヘルスチェックは、`.spec.containers[].readinessProbe.initialDelaySeconds`キーで設定する。

この時間を過ぎてもコンテナのLivenessProbeヘルスチェックが失敗する場合、Podはコンテナを再起動する。

設定した時間が短すぎると、Podがコンテナの起動を待てずに再起動を繰り返してしまう。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-mysql
      image: foo-mysql:1.0.0
      readinessProbe:
        # 2回目以降のReadinessProbeヘルスチェックを実行するまでに5秒間待機する。
        gracePeriodSeconds: 5
```

#### ▼ initialDelaySeconds

初回のReadinessProbeヘルスチェックを開始するまでの待機時間を設定する。

注意として、`2`回目以降のreadinessProbeによる再起動は、`.spec.containers[].readinessProbe.gracePeriodSeconds`キーで設定する。

この時間を過ぎてもコンテナのReadinessProbeヘルスチェックが失敗する場合、Podはコンテナを再起動する。

設定した時間が短すぎると、Podがコンテナの起動を待てずに再起動を繰り返してしまう。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-mysql
      image: foo-mysql:1.0.0
      readinessProbe:
        initialDelaySeconds: 10
```

#### ▼ periodSeconds

ReadinessProbeチェックの試行当たりの間隔を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-mysql
      image: foo-mysql:1.0.0
      readinessProbe:
        periodSeconds: 5
```

#### ▼ tcpSocket

ReadinessProbeチェックのTCPプロトコルのポート番号を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-mysql
      image: foo-mysql:1.0.0
      readinessProbe:
        tcpSocket:
          port: 3306
```

<br>

### .spec.containers[].securityContext

#### ▼ securityContextとは

Pod内の特定のコンテナに対して、認可スコープを設定する。

オプションは、`.spec.securityContext`キーと同じである。

> ↪️：https://qiita.com/dingtianhongjie/items/51a4cea1265c5ec836cc

<br>

### .spec.containers[].volumeMounts

#### ▼ volumeMountsとは

PodのVolume内のディレクトリをコンテナにマウントする。

#### ▼ subPath

PodのVolume内のサブディレクトリを指定し、マウントできるようにする。

これを指定しない場合。Volumeのルートディレクトリ配下をコンテナにマウントすることになる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      volumeMounts:
        - name: foo-volume
          # foo-volumeにあるwwwディレクトリを指定する
          subPath: www
          # コンテナのvarディレクトリをマウントする
          mountPath: /var

  volumes:
    - name: foo-volume
      emptyDir: {}
```

> ↪️：
>
> - https://zaki-hmkc.hatenablog.com/entry/2020/12/27/211908#subPath%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%9F%E3%83%9E%E3%82%A6%E3%83%B3%E3%83%88
> - https://kubernetes.io/ja/docs/concepts/storage/volumes/#using-subpath

ディレクトリではなく、ファイルを指定することもできる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      volumeMounts:
        - name: foo-volume
          # foo-volumeにあるwww.confファイルを指定する
          subPath: www.conf
          # コンテナに/etc/www.confファイルとしてマウントする
          mountPath: /etc/www.conf

  volumes:
    - name: foo-volume
      emptyDir: {}
```

> ↪️：https://stackoverflow.com/a/53503986

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
    - name: foo-gin
      image: foo-gin:1.0.0
  enableServiceLinks: false
```

> ↪️：https://kakakakakku.hatenablog.com/entry/2022/05/31/093116

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
    - name: foo-gin
      image: foo-gin:1.0.0
  hostname: foo-pod
```

> ↪️：https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod%E3%81%AEhostname%E3%81%A8subdomain%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89

<br>

### .spec.hostNetwork

#### ▼ hostNetworkとは

Podが、自身の稼働するNodeのネットワークにアクセスできるかどうかを設定する。

ユーザーが使用するうユースケースは少なく、例えばNode exporterのPodで使用される。

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

> ↪️：https://stackoverflow.com/a/64793701

<br>

### .spec.imagePullSecrets

#### ▼ imagePullSecretsとは

プライベートリポジトリからコンテナイメージをプルするため、プライベートリポジトリのクレデンシャル情報を持つSecretを設定する。

別途、ServiceAccountの`.imagePullSecrets`キーでも同じSecretを指定しておき、このServiceAccountをPodに紐付ける。

これにより、PodはSecretにあるプライベートリポジトリのクレデンシャル情報を使用できるようになる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: private-foo-gin:1.0.0 # プライベートリポジトリ
  imagePullSecrets:
    - name: foo-repository-credentials-secret # プライベートリポジトリのクレデンシャル情報を持つSecret
```

> ↪️：
>
> - https://kubernetes.io/docs/concepts/containers/images/#specifying-imagepullsecrets-on-a-pod
> - https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/#create-a-pod-that-uses-your-secret
> - https://medium.com/makotows-blog/kubernetes-private-registry-tips-image-pullsecretse-20dfb808dfc-e20dfb808dfc

<br>

### .spec.priorityClassName

#### ▼ priorityClassNameとは

Podのスケジューリングの優先度を設定する。

何らかの理由 (例：ハードウェアリソース不足、など) でより優先度の高いPodをスケジューリングできない場合、より優先度の低いPodをNodeから退去させ、優先度の高いPodをスケジューリングする。

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
    - name: foo-gin
      image: foo-gin:1.0.0
  priorityClassName: system-node-critical
```

> ↪️：https://kubernetes.io/ja/docs/concepts/scheduling-eviction/pod-priority-preemption/#pod-priority

#### ▼ DaemonSet配下のPod

DaemonSet配下のPodは、デフォルトで全てのNodeでスケジューリングされるようになっている。

ただし何らかの理由(例：ハードウェアリソース不足、など) で、特定のNodeでDaemonSet配下のPodをスケジューリングできないことがある。

こういった場合に備えて、DaemonSet配下のPodには必ず、`system-node-critical`のPriorityClassNameを設定しておく。

> ↪️：
>
> - https://stackoverflow.com/questions/74987515/k8s-daemonset-pod-placement
> - https://stackoverflow.com/questions/55832300/cluster-autoscaler-not-triggering-scale-up-on-daemonset-deployment

<br>

### .spec.nodeSelector

#### ▼ nodeSelectorとは

kube-schedulerがPodをスケジューリングするNodeを設定する。

`.spec.affinity`キーと比較して、より単純に条件を設定できる。

複数のNodeに同じ`.metadata.labels`キーを付与しておき、このNode群をNodeグループと定義すれば、特定のNodeにPodを作成するのみでなくNodeグループにPodを作成できる。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
  nodeSelector:
    node.kubernetes.io/nodegroup: foo-node-group
```

> ↪️：https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity

<br>

### .spec.securityContext

#### ▼ securityContextとは

Pod内の全てのコンテナに対して、認可スコープを設定する。

> ↪️：https://qiita.com/dingtianhongjie/items/51a4cea1265c5ec836cc

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
    - name: foo-gin
      image: foo-gin:1.0.0
  securityContext:
    runAsUser: 999
```

> ↪️：
>
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
    - name: foo-gin
      image: foo-gin:1.0.0
  securityContext:
    runAsGroup: 3000
```

> ↪️：https://cstoku.dev/posts/2018/k8sdojo-07/#runasgroup

#### ▼ runAsNonRoot

コンテナを特権モード (root権限) で実行できないようにする。

もしこれを設定したコンテナがrootユーザーでプロセスを実行しようとすると、コンテナの起動に失敗する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
  securityContext:
    runAsNonRoot: true
```

> ↪️：https://qiita.com/dingtianhongjie/items/51a4cea1265c5ec836cc#root%E3%83%A6%E3%83%BC%E3%82%B6%E3%81%AE%E5%AE%9F%E8%A1%8C%E5%88%B6%E9%99%90

#### ▼ fsGroup

Podにマウントされているボリュームのファイルに関して、アクセス権限を設定する。

設定した番号を使用して、Podのボリューム`chown`コマンドと`chmod`コマンドを再帰的に実行する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
  securityContext:
    fsGroup: 999
```

> ↪️：
>
> - https://cstoku.dev/posts/2018/k8sdojo-07/#fsgroup
> - https://learn.microsoft.com/ja-jp/azure/aks/faq#how-to-avoid-permission-ownership-setting-slow-issues-when-the-volume-has-a-lot-of-files

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
    - name: foo-gin
      image: foo-gin:1.0.0
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
    - name: foo-gin
      image: foo-gin:1.0.0
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
    - name: foo-gin
      image: foo-gin:1.0.0
  restartPolicy: OnFailure
```

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
    - name: foo-gin
      image: foo-gin:1.0.0
  serviceAccountName: foo-service-account
```

<br>

### .spec.terminationGracePeriodSeconds

#### ▼ terminationGracePeriodSecondsとは

![pod_terminating_process](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process.png)

Podの削除プロセスを開始するまで待機時間を設定する。

この時間を超えてもPodを削除できていない場合は、コンテナを強制的に停止する。

なお、Pod側でコンテナの終了時間を制御することはできない。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
  terminationGracePeriodSeconds: 300
```

> ↪️：
>
> - https://nulab.com/ja/blog/backlog/graceful-shutdown-of-kubernetes-application/
> - https://qiita.com/superbrothers/items/3ac78daba3560ea406b2
> - https://speakerdeck.com/masayaaoyama/jkd1812-prd-manifests?slide=16

<br>

### .spec.topologySpreadConstraints

#### ▼ topologySpreadConstraintsとは

異なるリージョン、AZ、Node、にPodを分散させる。

#### ▼ maxSkew

`.spec.topologySpreadConstraints[].topologyKey`キーで指定した分散の単位の間で、Podの個数差を設定する。

**＊実装例＊**

AZが`2`個あるとすると、各AZ間のPodの個数差を`1`個にする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
```

> ↪️：https://zenn.dev/tmrekk/articles/07f30b09c26b50#maxskew%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

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
    - name: foo-gin
      image: foo-gin:1.0.0
  topologySpreadConstraints:
    - topologyKey: topology.kubernetes.io/zone
```

> ↪️：https://zenn.dev/tmrekk/articles/07f30b09c26b50#topologykey%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

#### ▼ whenUnsatisfiable

分散の条件に合致するNodeがない場合の振る舞いを設定する。

**＊実装例＊**

分散の条件に合致するNodeがない場合、このPodをスケジューリングしない。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
  topologySpreadConstraints:
    - whenUnsatisfiable: DoNotSchedule
```

> ↪️：https://zenn.dev/tmrekk/articles/07f30b09c26b50#whenunsatisfiable%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

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
    - name: foo-gin
      image: foo-gin:1.0.0
  topologySpreadConstraints:
    - labelSelector:
        app.kubernetes.io/app: foo-pod
```

> ↪️：https://zenn.dev/tmrekk/articles/07f30b09c26b50#labelselector%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

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

> ↪️：https://amateur-engineer-blog.com/configmap-file-mount/

#### ▼ emptyDir

Volumeの一種であるEmptyDirボリュームを作成する。

EmptyDirボリュームのため、『Pod』が削除されるとこのボリュームも同時に削除される。

**＊実装例＊**

オンディスクストレージを設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      volumeMounts:
        - name: foo-gin-volume
          mountPath: /go/src
  volumes:
    - name: foo-gin-volume
      emptyDir: {}
```

> ↪️：

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
    - name: foo-gin
      image: foo-gin:1.0.0
      volumeMounts:
        - name: foo-gin-volume
          mountPath: /go/src
  volumes:
    - name: foo-gin-volume
      emptyDir:
        medium: Memory
        sizeLimit: 1Gi
```

> ↪️：
>
> - https://www.linkedin.com/pulse/planning-use-memory-backed-volumes-kubernetes-read-once-banerjee/?trk=articles_directory
> - https://kubernetes.io/docs/concepts/storage/volumes/#emptydir

#### ▼ hostPath

Volumeの一種であるHostPathボリュームを作成する。

PersistentVolumeの一種であるHostPathボリュームとは区別すること。

HostPathボリュームのため、『Node』が削除されるとこのボリュームも同時に削除される。

HostPathボリューム自体は本番環境で非推奨である。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      volumeMounts:
        - name: foo-gin-volume
          mountPath: /go/src
  volumes:
    - name: foo-gin-volume
      hostPath:
        path: /data/src/foo
        # コンテナ内にディレクトリがなければ作成する
        type: DirectoryOrCreate
```

> ↪️：
>
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
    - name: foo-gin
      volumeMounts:
        - name: foo-gin-volume
          mountPath: /go/src
  volumes:
    - name: foo-gin-volume
```

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
    - name: foo-gin
      volumeMounts:
        - name: foo-gin-volume
          mountPath: /go/src
  volumes:
    - name: foo-gin-volume
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

> ↪️：https://kubernetes.io/docs/concepts/storage/persistent-volumes/

#### ▼ secret

Secretの`.data`キー配下のキーをファイルとしてマウントする。

`.spec.containers[].envFrom`キー (環境変数としてコンテナに出力する) とは異なり、ファイルを持つSecretを設定する。

ConfigMapをマウントする場合は、`.spec.volumes.configMap`キーで設定することに注意する。

**＊実装例＊**

Secretの持つキー (ここでは`credentials.json`キー) をコンテナにファイルとしてマウントする

そのため、コンテナには`credentials.json`ファイルが配置されることになる。

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

> ↪️：
>
> - https://kubernetes.io/docs/concepts/configuration/secret/#using-secrets-as-files-from-a-pod
> - https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/#create-a-pod-that-has-access-to-the-secret-data-through-a-volume

<br>

## 19. PodDisruptionBudget

### .spec.maxUnavailable

対象のPodを新しいNodeでスケジューリングする時に、既存のNodeで削除できるPodの最大数を設定する。

```yaml
apiVersion: policy/v1beta1
kind: PodDisruptionBudget
metadata:
  name: foo-pod-disruption-budget
spec:
  maxUnavailable: 1
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod # 対象のPod
```

> ↪️：https://qiita.com/tkusumi/items/946b0f31931d21a78058#poddisruptionbudget-%E3%81%AB%E3%82%88%E3%82%8B%E5%AE%89%E5%85%A8%E3%81%AA-drain

<br>

### .spec.minAvailable

対象のPodを新しいNodeでスケジューリングする時に、新しいPodのスケジューリングの完了を待機してから、既存のPodを退避させられる。

このスケジューリングを待機するPodの最低限数を設定する。

```yaml
apiVersion: policy/v1beta1
kind: PodDisruptionBudget
metadata:
  name: foo-pod-disruption-budget
spec:
  # 新しいNodeで、3個のPodのスケジューリングが完了するまで待機する。
  minAvailable: 3
  selector:
    matchLabels:
      # 対象のPod
      app.kubernetes.io/app: foo-pod
```

> ↪️：
>
> - https://kubernetes.io/docs/tasks/run-application/configure-pdb/#specifying-a-poddisruptionbudget
> - https://zenn.dev/sasakiki/articles/a71d9158020266

<br>

### .spec.selector

対象のPodを設定する。

```yaml
apiVersion: policy/v1beta1
kind: PodDisruptionBudget
metadata:
  name: foo-pod-disruption-budget
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod # 対象のPod
```

> ↪️：https://kubernetes.io/docs/tasks/run-application/configure-pdb/#specifying-a-poddisruptionbudget

<br>

## 20. PriorityClass

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

> ↪️：https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/#how-to-use-priority-and-preemption

<br>

## 21. ReplicaController

旧Deployment。

非推奨である。

> ↪️：https://stackoverflow.com/questions/37423117/replication-controller-vs-deployment-in-kubernetes

<br>

## 22. Role、ClusterRole

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

> ↪️：https://kubernetes.io/docs/reference/using-api/#api-groups

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
    # Get、Watch、List、のアクションを実行可能にする。
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

## 23. RoleBinding、ClusterRoleBinding

### roleRef.name

#### ▼ roleRef.nameとは

RoleBindingを使用して紐付けるRoleの名前を設定する。

> ↪️：https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding

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
    # ユーザー名 (system:useraccounts:foo-service-account) でもよい。
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

> ↪️：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding
> - https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-binding-examples
> - https://knowledge.sakura.ad.jp/21129/

<br>

## 24. Secret

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

> ↪️：https://kubernetes.io/docs/concepts/configuration/secret/#restriction-names-data

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

> ↪️：https://stackoverflow.com/questions/63905890/kubernetes-how-to-set-boolean-type-variable-in-configmap

#### ▼ 機密なファイルの管理

パイプ (` |`) を使用すれば、ファイルを変数として設定できる。

> ↪️：https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
type: Opaque
data:
  # SSL証明書
  foo.crt: |
    MIIC2DCCAcCgAwIBAgIBATANBgkqh ...
  # SSL証明書と対になる秘密鍵
  foo.key: |
    MIIEpgIBAAKCAQEA7yn3bRHQ5FHMQ ...
```

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

> ↪️：https://kubernetes.io/docs/concepts/configuration/secret/#restriction-names-data

string型の変数しか設定できないため、そのままだとinteger型やboolean型になってしまう値は、ダブルクオーテーションで囲う必要がある。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
stringData:
  # ダブルクオーテーションで囲う。
  enableFoo: "true"
  number: "1"
```

> ↪️：https://stackoverflow.com/questions/63905890/kubernetes-how-to-set-boolean-type-variable-in-configmap

#### ▼ 機密なファイルの管理

パイプ (` |`) を使用すれば、ファイルを変数として設定できる。

> ↪️：https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-config-file/#specify-unencoded-data-when-creating-a-secret

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

<br>

### type

#### ▼ typeとは

Secretの種類を設定する。

> ↪️：https://kubernetes.io/docs/concepts/configuration/secret/#secret-types

#### ▼ kubernetes.io/basic-auth

Basic認証のための変数を設定する。

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

> ↪️：https://kubernetes.io/docs/concepts/configuration/secret/#basic-authentication-secret

#### ▼ kubernetes.io/dockerconfigjson

イメージレジストリの認証情報を設定する。

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

> ↪️：
>
> - https://kubernetes.io/docs/concepts/configuration/secret/#docker-config-secrets
> - https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/
> - https://medium.com/makotows-blog/kubernetes-private-registry-tips-image-pullsecretse-20dfb808dfc-e20dfb808dfc

#### ▼ kubernetes.io/service-account-token

ServiceAccountのための変数を設定する。

ただし、自動的に作成されるため、ユーザーが設定する必要はない。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-account-token-secret
  annotations:
    kubernetes.io/service-account.name: foo-account
type: kubernetes.io/service-account-token
data:
  foo-token: bar
```

> ↪️：https://kubernetes.io/docs/concepts/configuration/secret/#service-account-token-secrets

#### ▼ kubernetes.io/tls

SSL/TLSを使用するための変数を設定する。

SSL証明書と秘密鍵の文字列が必要である。

ユースケースとしては、変数をIngressに割り当て、IngressとServiceの間をHTTPSプロトコルでパケットを送受信する例がある。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-basic-auth-secret
type: kubernetes.io/tls
data:
  # SSL証明書
  tls.crt: |
    MIIC2DCCAcCgAwIBAgIBATANBgkqh ...
  # 秘密鍵
  tls.key: |
    MIIEpgIBAAKCAQEA7yn3bRHQ5FHMQ ...
```

> ↪️：https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets

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

> ↪️：https://kubernetes.io/docs/concepts/configuration/secret/#opaque-secrets

<br>

## 25. Service

### .spec.ports

#### ▼ portsとは

受信するインバウンド通信を設定する。

#### ▼ appProtocol

受信するインバウンド通信のプロトコルを設定する。

`.spec.ports.protocol`キーとは異なり、アプリケーション層のプロトコルを明示的に指定できる。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - appProtocol: http
      port: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - appProtocol: tcp
      port: 9000
```

もしIstio VirtualServiceからインバウンド通信を受信する場合、`.spec.ports.appProtocol`キーが使用しなければ、`.spec.ports.name`キーを『`<プロトコル名>-<任意の文字列>`』で命名しなければならない。

> ↪️：https://istio.io/latest/docs/ops/configuration/traffic-management/protocol-selection/

```yaml
# appProtocolを使用しない場合
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - name: http-foo # Istio Gatewayからインバウンド通信を受信
      port: 80
```

```yaml
# appProtocolを使用しない場合
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - name: tcp-foo # Istio Gatewayからインバウンド通信を受信
      port: 9000
```

#### ▼ name

プロトコルのポート名を設定する。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - name: http
      port: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - name: tcp-foo
      port: 9000
```

#### ▼ protocol

受信するインバウンド通信のプロトコルを設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - protocol: TCP
      port: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - protocol: UDP
      port: 53
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - protocol: SCTP
      port: 22
```

補足として、FastCGIプロトコルには変換できず、別にNginxを使用してプロトコルを変換する必要がある。

> ↪️：
>
> - https://github.com/search?q=php-fpm+kubernetes
> - https://kubernetes.github.io/ingress-nginx/user-guide/fcgi-services/

#### ▼ port

インバウンド通信を待ち受けるポート番号を設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - port: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - port: 9000
```

#### ▼ targetPort

受信したインバウンド通信をPodに転送する時に、いずれのポート番号を指定するか否かを設定する。

Pod内で最初にインバウンド通信を受信するコンテナの`containerPort`の番号に合わせるようにする。

デフォルトでは、`.spec.ports.port`キーと同じに値になる。

> ↪️：https://qiita.com/MahoTakara/items/d18d8f9b36416353066c#%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AE%E5%AE%9A%E7%BE%A9

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - port: 8080
      targetPort: 8080 # デフォルトでは、spec.ports.portキーと同じ値になる。
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - port: 9000
      targetPort: 9000 # デフォルトでは、spec.ports.portキーと同じ値になる。
```

<br>

### .spec.selector

#### ▼ selectorとは

インバウンド通信の転送先とするPodの`.metadata.labels`キー名と値を設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  selector:
    app.kubernetes.io/app: foo-pod
```

> ↪️：https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/

<br>

### .spec.type

#### ▼ typeとは

Serviceのタイプを設定する。

#### ▼ ClusterIPの場合

ClusterIP Serviceを設定する。`.spec.clusterIP`キーでCluster-IPを指定しない場合は、ランダムにIPアドレスが割り当てられる。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-clusterip-service
spec:
  type: ClusterIP
  ports:
    - name: http-foo
      protocol: TCP
      port: 8080 # Serviceが待ち受けるポート番号
      targetPort: 8080 # ルーティング先のポート番号 (containerPort名でもよい)
  selector:
    app.kubernetes.io/app: foo-pod
  # clusterIP: *.*.*.*
```

> ↪️：https://qiita.com/tkusumi/items/da474798c5c9be88d9c5#%E8%83%8C%E6%99%AF

#### ▼ NodePortの場合

NodePort Serviceを設定する。

Serviceが待ち受けるポート番号とは別に、NodeのNICで待ち受けるポート番号 (`30000` 〜 `32767`) を指定する。

これを指定しない場合、コントロールプレーンNodeがランダムでポート番号を決める。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-nodeip-service
spec:
  type: NodePort
  ports:
    - name: http-foo
      protocol: TCP
      nodePort: 30000 # 指定しなければ、コントロールプレーンNodeがランダムで決める。
      port: 8080 # Serviceが待ち受けるポート番号
      targetPort: 8080 # ルーティング先のポート番号 (containerPort名でもよい)
  selector:
    app.kubernetes.io/app: foo-pod
```

NodePortのポート番号は、`30000` 〜 `32767`番である必要がある。

```bash
spec.ports[0].nodePort: Invalid value: 80: provided port is not in the valid range. The range of valid ports is 30000-32767
```

> ↪️：https://kubernetes.io/docs/concepts/services-networking/service/#nodeport

#### ▼ LoadBalancerの場合

LoadBalancer Serviceを設定する。

クラウドプロバイダー環境でLoadBalancer Serviceを作成すると、External-IPを宛先IPアドレスとするロードバランサーを自動的にプロビジョニングする。

同時に、`.status.loadBalancer`キーが自動的に追加される。

`.status.loadBalancer.ingress`キーは、KubernetesのIngressとは無関係であり、インバウンドを表す『`ingress`』である。

`.status.loadBalancer.ingress.ip`キーには、ロードバランサーで指定するServiceのExternal-IPが設定される。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-loadbalancer-service
spec:
  type: LoadBalancer
  ports:
    - name: http-foo
      protocol: TCP
      port: 8080 # Serviceが待ち受けるポート番号
      targetPort: 8080 # ルーティング先のポート番号 (containerPort名でもよい)
  selector:
    app.kubernetes.io/app: foo-pod
# Kubernetesが自動的に追加するキー
status:
  loadBalancer:
    # インバウンドの意味のingressである
    ingress:
      # External-IP
      - ip: 192.0.2.127
```

> ↪️：https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer

<br>

## 26. ServiceAccount

### automountServiceAccountToken

#### ▼ automountServiceAccountTokenとは

ServiceAccountのPodへの自動紐付けの有効化する。

デフォルトで有効化されている。

> ↪️：https://kakakakakku.hatenablog.com/entry/2021/07/12/095208

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: foo-service-account
automountServiceAccountToken: false
```

<br>

### imagePullSecrets

#### ▼ imagePullSecretsとは

プライベートリポジトリのクレデンシャル情報を持つSecretを設定する。

これにより、ServiceAccountが紐付けられたPodは、プライベートリポジトリのクレデンシャル情報を使用できるようになる。

> ↪️：https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#add-image-pull-secret-to-service-account

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: foo-service-account
imagePullSecrets:
  - name: foo-repository-credentials-secret
```

<br>

## 27. StatefulSet

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
      app.kubernetes.io/app: foo-pod
      app.kubernetes.io/component: db
  serviceName: foo-mysql-service
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo
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
          app.kubernetes.io/app: foo
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
      app.kubernetes.io/app: foo-pod
      app.kubernetes.io/component: db
  serviceName: foo-mysql-service
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo-pod
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
          app.kubernetes.io/app: foo
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
      app.kubernetes.io/app: foo-pod
      app.kubernetes.io/component: db
  serviceName: foo-mysql-service
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo-pod
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
          app.kubernetes.io/app: foo
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
