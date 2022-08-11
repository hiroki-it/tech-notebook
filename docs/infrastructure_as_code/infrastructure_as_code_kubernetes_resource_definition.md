---
title: 【IT技術の知見】リソース定義＠Kubernetes
description: リソース定義＠Kubernetesの知見を記録しています。
---

# リソース定義＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. apiVersion

Kubernetes-APIのバージョンを設定する。

```yaml
apiVersion: v1
```

<br>

## 01-02. kind

作成されるKubernetesリソースの種類を設定する。

<br>

## 01-03. metadata

### annotation

#### ▼ annotationとは

任意のキーと値を設定する。```metadata.labels```キーとは異なり、設定できる情報に制約がない。

ℹ️ 参考：https://blog.getambassador.io/kubernetes-labels-vs-annotations-95fc47196b6d

#### ▼ kubernetes.io/ingress.class

現在、非推奨である。代わりに、```spec.ingressClassname```キーを指定する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/ingress/#deprecated-annotation

#### ▼ ingressclass.kubernetes.io/is-default-class

IngressがClusterネットワーク内に1つしか存在しない場合、IngressClassに設定することにより、デフォルトとする。Ingressが新しくapplyされた場合、このIngressClassの設定値が使用されるようになる。複数のIngressClassをデフォルトに設定しないようにする。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/services-networking/ingress/#default-ingress-class
- https://kubernetes.github.io/ingress-nginx/#i-have-only-one-ingress-controller-in-my-cluster-what-should-i-do

#### ▼ istio固有のキー

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_kubernetes_custom_resource_istio_resource_definition.html

<br>

### labels

#### ▼ labelsとは

Kubernetesが、Kubernetesリソースの一意に識別するための情報を設定する。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
- https://blog.getambassador.io/kubernetes-labels-vs-annotations-95fc47196b6d

#### ▼ 予約Label

キー名のプレフィクスとして、```kubernetes.io/```と```k8s.io/```は予約されている。

ℹ️ 参考：https://kubernetes.io/docs/reference/labels-annotations-taints/

#### ▼ データ型

string型である必要がある。int型を割り当てようとするとエラーになり、これはHelmの```values```ファイル経由で『数字』を出力しようとする場合に起こる。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set
- https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_kubernetes_helm.html

<br>

### name

Kubernetesリソースを一意に識別するための名前を設定する。

<br>

## 02. Config

### clusters

#### ▼ clustersとは

```kubectl```コマンドの向き先となるClusterを設定する。

ℹ️ 参考：https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

#### ▼ name

Cluster名を設定する。

```yaml
apiVersion: v1
kind: Config
clusters:
  - name: arn:aws:eks:ap-northeast-1:<アカウントID>:cluster/prd-foo-eks-cluster
    
    # 〜 中略 〜
  
  - name: docker-desktop
  
    # 〜 中略 〜  
  
  - name: minikube
  
    # 〜 中略 〜  
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
      
    # 〜 中略 〜  
    
  - cluster:
      certificate-authority-data: LS0tLS1 ...
      server: https://kubernetes.docker.internal:6443
      
    # 〜 中略 〜  
    
  - cluster:
      certificate-authority: /Users/hiroki-hasegawa/.minikube/ca.crt
      extensions:
        - extension:
            last-update: Fri, 13 May 2022 16:58:59 JST
            provider: minikube.sigs.k8s.io
            version: v1.25.2
          name: cluster_info
      server: https://127.0.0.1:52192
      
    # 〜 中略 〜  
```

<br>

### contexts

#### ▼ contextsとは

```kubectl```コマンドの向き先の候補を設定する。

ℹ️ 参考：https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

#### ▼ name

向き先の名前を設定する。

```yaml
apiVersion: v1
kind: Config
contexts:
  - name: arn:aws:eks:ap-northeast-1:<アカウントID>:cluster/prd-foo-eks-cluster
  
    # 〜 中略 〜
  
  - name: docker-desktop
  
    # 〜 中略 〜
  
  - name: minikube
  
    # 〜 中略 〜 
```

#### ▼ context

実際に使用するCluster名とユーザー名を、```clusters```キーと```users```キーから選んで設定する。

```yaml
apiVersion: v1
kind: Config
contexts:
  - context:
      cluster: arn:aws:eks:ap-northeast-1:<アカウントID>:cluster/prd-foo-eks-cluster
      user: arn:aws:eks:ap-northeast-1:<アカウントID>:cluster/prd-foo-eks-cluster
      
    # 〜 中略 〜  
    
  - context:
      cluster: docker-desktop
      user: docker-desktop
      
    # 〜 中略 〜  
    
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
      
    # 〜 中略 〜  
```

<br>

### current-context

#### ▼ current-contextとは

```kubectl```コマンドの現在の向き先の名前を設定する。

ℹ️ 参考：https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

```yaml
apiVersion: v1
kind: Config
current-context: arn:aws:eks:ap-northeast-1:<アカウントID>:cluster/prd-foo-eks-cluster
```

<br>

### preferences

#### ▼ preferencesとは

ℹ️ 参考：https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

```yaml
apiVersion: v1
kind: Config
preferences: {}
```

<br>

### users

#### ▼ usersとは

```kubectl```コマンドのクライアントの認証情報を設定する。

ℹ️ 参考：https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/#define-clusters-users-and-contexts

#### ▼ name

ユーザー名を設定する。

```yaml

apiVersion: v1
kind: Config
users:
  - name: arn:aws:eks:ap-northeast-1:<アカウントID>:cluster/prd-foo-eks-cluster
  
    # 〜 中略 〜
    
  - name: docker-desktop
  
    # 〜 中略 〜
  
  - name: minikube
```

#### ▼ user

ユーザーの認証情報を設定する。AWS EKSのように、認証情報を動的に取得するようにしても良い。

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
        command: aws
        
    # 〜 中略 〜  
    
  - user:
      client-certificate-data: LS0tLS1 ...
      client-key-data: LS0tLS1 ...
      
    # 〜 中略 〜  
      
  - user:
      client-certificate: /Users/hiroki-hasegawa/.minikube/profiles/minikube/client.crt
      client-key: /Users/hiroki-hasegawa/.minikube/profiles/minikube/client.key
      
    # 〜 中略 〜  
```

<br>

## 03. ConfigMap

### data

#### ▼ dataとは

Kubernetesリソースに渡す非機密データを設定する。

#### ▼ string型データ

ConfigMapに設定するstring型データを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-config-map
data:
  bar: BAR 
```

string型しか設定できないため、デコード後にinteger型やboolean型になってしまう値は、ダブルクオーテーションで囲う必要がある。

ℹ️ 参考：https://stackoverflow.com/questions/63905890/kubernetes-how-to-set-boolean-type-variable-in-configmap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-config-map
data:
  enableFoo: "true" # ダブルクオーテーションで囲う。
  number: "1"
```

改行すれば、設定ファイルのstring型データも設定できる。

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

### spec.jobTemplate

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
                - /bin/sh
                - -c
                - echo Hello World
          restartPolicy: OnFailure
```

<br>

### spec.failedJobsHistoryLimit

#### ▼ failedJobsHistoryLimitとは

実行に失敗したJobに関して、上限の履歴数を設定する。

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello
spec:
  failedJobsHistoryLimit: 2
```

<br>

### spec.schedule

#### ▼ scheduleとは

Cronのルールを設定する。

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello
spec:
  schedule: "00 * * * *" # 一時間ごとに実行する。
```

<br>

### spec.successfulJobsHistoryLimit

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

## 05 Deployment

### spec.replicas

#### ▼ replicasとは

Cluster内で維持するPodのレプリカ数を設定する。Cluster内に複数のNodeが存在していて、いずれかのNodeが停止した場合、稼働中のNode内でレプリカ数を維持するようにPod数が増加する。

ℹ️ 参考：

- https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#deployment-v1-apps
- https://dr-asa.hatenablog.com/entry/2018/04/02/174006

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app.kubernetes.io/app: foo
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo
        app.kubernetes.io/component: app
```

<br>

### spec.revisionHistoryLimit

#### ▼ revisionHistoryLimitとは

保存されるリビジョン番号の履歴数を設定する。もし依存のリビジョン番号にロールバックする場合があるのであれば、必要数を設定しておく。

ℹ️ 参考：https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#deployment-v1-apps

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  revisionHistoryLimit: 5
  selector:
    matchLabels:
      app.kubernetes.io/app: foo
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo
        app.kubernetes.io/component: app
```

<br>

### spec.selector

#### ▼ selectorとは

Deploymentで管理するPodを明示的に設定する。

#### ▼ matchLabels

Podの```metadata.labels```キーを指定する。Podに複数の```metadata.labels```キーが付与されている時は、これらを全て指定する必要がある。

ℹ️ 参考：https://cstoku.dev/posts/2018/k8sdojo-08/#label-selector

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels: # Deploymentに紐づけるPodのLabel
      app.kubernetes.io/app: foo
      app.kubernetes.io/component: app
  template:
    metadata:
      labels: # PodのLabel
        app.kubernetes.io/app: foo
        app.kubernetes.io/component: app
```

<br>

### spec.strategy

#### ▼ strategyとは

デプロイメントの方法を設定する。

#### ▼ Recreate

インプレースデプロイメントを使用して、新しいPodをapplyする。

ℹ️ 参考：https://amateur-engineer-blog.com/kubernetes-recreate/

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
      app.kubernetes.io/app: foo
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo
        app.kubernetes.io/component: app
```

#### ▼ RollingUpdate

ローリングアップデートを使用して、新しいPodをapplyする。

ℹ️ 参考：https://kakakakakku.hatenablog.com/entry/2021/09/06/173014

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 100% # Podのレプリカ数と同じ数だけ新しいPodをapplyする。
      maxUnavailable: 0% # Podの停止数がレプリカ数を下回らないようにする。
  selector:
    matchLabels:
      app.kubernetes.io/app: foo
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo
        app.kubernetes.io/component: app
```

もし```maxSurge```オプションを```100```%、また```maxUnavailable```オプションを```0```%とすると、ローリングアップデート時に、Podのレプリカ数と同じ数だけ新しいPodをapplyするようになる。また、Podの停止数がレプリカ数を下回らないようになる。

![kubernetes_deployment_strategy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_deployment_strategy.png)

<br>

### spec.template（設定項目はPodと同じ）

Deploymentで維持管理するPodを設定する。設定項目はPodと同じである。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: foo
      app.kubernetes.io/component: app
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo
    spec:
      containers:
        - name: foo-gin
          image: foo-gin:<バージョンタグ>
          ports:
            - containerPort: 8080
```

<br>

## 06. HorizontalPodAutoscaler

### spec.scaleTargetRef

水平スケーリングを紐づけるKubernetesリソースを設定する。

ℹ️ 参考：https://qiita.com/sheepland/items/37ea0b77df9a4b4c9d80

```yaml
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: foo-horizontal-pod-autoscaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment # Deploymentに水平スケーリングを紐づける。
    name: foo-deployment
```

<br>

### spec.maxReplicas

水平スケーリングのスケールアウト時の最大Pod数を設定する。

ℹ️ 参考：https://qiita.com/sheepland/items/37ea0b77df9a4b4c9d80

```yaml
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: foo-horizontal-pod-autoscaler
spec:
  maxReplicas: 5
```

<br>

### spec.minReplicas

水平スケーリングのスケールイン時の最小Pod数を設定する。

ℹ️ 参考：https://qiita.com/sheepland/items/37ea0b77df9a4b4c9d80

```yaml
apiVersion: autoscaling/v2beta1
kind: HorizontalPodAutoscaler
metadata:
  name: foo-horizontal-pod-autoscaler
spec:
  minReplicas: 1
```

<br>

### spec.metrics

#### ▼ metricsとは

水平スケーリングのトリガーとするメトリクスと、維持されるターゲット値を設定する。

#### ▼ type

| タイプ名       | 説明                                            | メトリクス例                                     |
| -------------- | ----------------------------------------------- | ------------------------------------------------ |
| ```Resource``` | リソースメトリクス                              | CPU使用率、メモリ使用率、など                    |
| ```Pods```     | Podのカスタムメトリクス                         | Queries Per Second、message broker’s queue、など |
| ```Object```   | Pod以外のKubernetesリソースのカスタムメトリクス | Ingressに関するメトリクスなど                          |
| ```External``` | Kubernetes以外の任意のメトリクス                | AWS、GCP、Azureに固有のメトリクス                |

メトリクスの種類を設定する。以下のタイプを設定できる。

ℹ️ 参考：

- https://zenn.dev/lapi/articles/e7ae967aa5161b#hpa%E3%81%AE%E8%A8%AD%E5%AE%9A
- https://qiita.com/sheepland/items/37ea0b77df9a4b4c9d80

```yaml
apiVersion: autoscaling/v2beta1
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

<br>

## 07. Ingress

### annotations

#### ▼ annotationsとは

外部Ingressを使用する場合、オプションを設定する。

#### ▼ AWS固有のキ

<br>

### spec.ingressClassName

#### ▼ ingressClassNameとは

標準のIngressの代わりに外部Ingressを使用する場合、IngressClassの```metadata.name```キー値を設定する。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/services-networking/ingress/#the-ingress-resource
- https://kubernetes.io/docs/concepts/services-networking/ingress/#deprecated-annotation

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-ingress
spec:
  ingressClassName: foo-ingress-class
```

<br>

### spec.rules

#### ▼ rulesとは

Serviceへのルーティングルールを設定する。複数のServiceにインバウンド通信を振り分けられる。Ingressを使用する場合、ルーティング対象のServiceは、ClusterIP Serviceとする。

ℹ️ 参考：https://chidakiyo.hatenablog.com/entry/2018/09/10/Kubernetes_NodePort_vs_LoadBalancer_vs_Ingress%3F_When_should_I_use_what%3F_%28Kubernetes_NodePort_%E3%81%A8_LoadBalancer_%E3%81%A8_Ingress_%E3%81%AE%E3%81%A9%E3%82%8C%E3%82%92%E4%BD%BF%E3%81%86

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

## 08. IngressClass

### spec.controller

#### ▼ controllerとは

標準のIngressの代わりに、外部Ingressを使用する場合、そのIngressのマニフェストのAPIを設定する。

ℹ️ 参考：

- https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/ingress_class/#deprecated-kubernetesioingressclass-annotation
- https://kubernetes.github.io/ingress-nginx/#i-have-only-one-ingress-controller-in-my-cluster-what-should-i-do

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-ingress-class
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: ingress.k8s.aws/alb
  # Nginxコントローラーの場合は、k8s.io/ingress-nginx
```

<br>

### spec.parameters

#### ▼ parametersとは

外部Ingressに応じたパラメーターを設定する。代わりに、IngressClassParamsを使用しても良い。

ℹ️ 参考：

- https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/ingress_class/#ingressclass
- https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/guide/ingress/ingress_class/#ingressclassparams

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-ingress-class
spec:
  # AWS ALB Ingressの場合
  parameters:
    apiGroup: elbv2.k8s.aws
    kind: IngressClassParams
    name: foo-ingress-class-params
```

<br>

## 09. Job

### spec.activeDeadlineSeconds

#### ▼ activeDeadlineSecondsとは

Jobの試行の上限実行時間を設定する。設定された時間を超過すると、エラーが返却される。```spec.backoffLimit```キーよりも優先される。

ℹ️ 参考：https://kubernetes.io/docs/concepts/workloads/controllers/job/#job-termination-and-cleanup

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: foo-job
spec:
  activeDeadlineSeconds: 20
```

<br>

### spec.backoffLimit

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

### spec.parallelism

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

<br>

### spec.template

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
            - /bin/sh
            - -c
            - echo Hello World
      restartPolicy: OnFailure
```

<br>

## 10. Node

Kubernetesの実行時に自動的に作成される。もし手動で作成する場合は、```kubectl```コマンドを実行し、その時に```--register-node```オプションを```false```とする必要がある。

<br>

## 11. PersistentVolume

### spec.accessModes

#### ▼ accessModesとは

ボリュームへの認可スコープを設定する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes


#### ▼ ReadWriteMany

ボリュームに対して、複数Nodeから読み出し/書き込みできるようにする。Node間でDBを共有したい場合に使用する。

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

ボリュームに対して、複数Nodeから読み出しでき、また単一Nodeのみから書き込みできるようにする。Node間で読み出し処理のみDBを共有したい場合に使用する。

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

ボリュームに対して、単一Nodeからのみ読み出し/書き込みできるようにする。NodeごとにDBを分割したい場合に使用する。

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

### spec.capacity

#### ▼ capacityとは

ストレージの最大サイズを設定する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#capacity

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

### spec.hostPath

#### ▼ hostPathとは

PersistentVolumeの一種であるHostPathボリュームを作成する。Volumeの一種であるHostPathボリュームとは区別すること。

ℹ️ 参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/

#### ▼ path

Node側のマウント元のディレクトリを設定する。Podのマウントポイントは、Podの```spec.containers.volumeMount```オプションで設定する。

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

### spec.local

#### ▼ localとは

Node上にストレージ領域を新しく作成し、これをボリュームとする。```spec.nodeAffinity```キーの設定が必須であり、Nodeを明示的に指定できる。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/storage/persistent-volumes/
- https://kubernetes.io/docs/concepts/storage/persistent-volumes/#node-affinity

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

### spec.mountOptions

#### ▼ mountOptionsとは

ℹ️ 参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#mount-options

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

<br>

### spec.nfs

#### ▼ nfsとは

ホスト上であらかじめNFSサーバーを起動しておく。NFSサーバーにストレージ領域を作成し、これをボリュームとする。ワーカーNode内のPodを、ホスト上のNFSサーバーにマウントする。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/storage/persistent-volumes/#mount-options
- https://ytsuboi.jp/archives/505
- https://qiita.com/reoring/items/4d80a04dd31e991dd233

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

<br>

### spec.nodeAffinity

#### ▼ nodeAffinityとは

PersistentVolumeの作成先とするワーカーNodeを設定する。

ℹ️ 参考：https://qiita.com/ysakashita/items/67a452e76260b1211920

#### ▼ required.nodeSelectorTerms.matchExpressions

作成先のワーカーNodeの```metadata.labels```キーを指定するための条件（```In```、```NotIn```、```Exists```）を設定する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#set-based-requirement

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
          - key: app.kubernetes.io/nodegroup
            operator: In
            values:
              - bar-group 
            # 開発環境であれば minikubeを指定する。
            # - minikube 
```

<br>

### spec.persistentVolumeReclaimPolicy

#### ▼ persistentVolumeReclaimPolicyとは

PersistentVolumeのライフサイクルを設定する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#reclaim-policy

#### ▼ Delete

PersistentVolumeを指定するPersistentVolumeClaimが削除された場合、PersistentVolumeも自動的に削除する。クラウドプロバイダーのPersistentVolumeの動的プロビジョニングのために使用することが多い。

ℹ️ 参考：https://www.amazon.co.jp/dp/B07HFS7TDT

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  persistentVolumeReclaimPolicy: Delete
```

#### ▼ Recycle（非推奨）

PersistentVolumeを指定するPersistentVolumeClaimが削除された場合、PersistentVolume内のデータのみを削除し、PersistentVolume自体は削除しない。将来的に廃止予定のため、非推奨。

ℹ️ 参考：https://www.amazon.co.jp/dp/B07HFS7TDT

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

PersistentVolumeを指定するPersistentVolumeClaimが削除されたとしても、PersistentVolumeは削除しない。割り当てから解除されたPersistentVolumeはReleasedステータスになる。一度、Releasedステータスになると、他のPerisistentVolumeClaimからは指定できなくなる。

ℹ️ 参考：https://www.amazon.co.jp/dp/B07HFS7TDT

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

### spec.storageClassName

#### ▼ storageClassNameとは

ストレージクラス名を設定する。これは、PersistentVolumeClaimが特定のPersistentVolumeを要求する時に必要になる。

ℹ️ 参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#class

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

| クラス名 | 説明                                | 補足                                                         |
| -------- | ----------------------------------- | ------------------------------------------------------------ |
| standard | デフォルト値である。                |                                                              |
| fast     | SSDをPersistentVolumeとして使用する。 | ℹ️ 参考：https://kubernetes.io/docs/concepts/storage/_print/#%E5%8B%95%E7%9A%84%E3%83%97%E3%83%AD%E3%83%93%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0%E3%82%92%E6%9C%89%E5%8A%B9%E3%81%AB%E3%81%99%E3%82%8B |
| slow     | HDをPersistentVolumeとして使用する。  | ℹ️ 参考：https://kubernetes.io/docs/concepts/storage/_print/#%E5%8B%95%E7%9A%84%E3%83%97%E3%83%AD%E3%83%93%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0%E3%82%92%E6%9C%89%E5%8A%B9%E3%81%AB%E3%81%99%E3%82%8B |

<br>

## 12. PersistentVolumeClaim

### spec.accessModes

#### ▼ accessModesとは

要求対象のPerisitentVolumeのaccessModeを設定する。

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

### spec.resources

#### ▼ resourcesとは

要求する仮想ハードウェアのKubernetesリソースを設定する。

#### ▼ requests

要求対象のPerisitentVolumeのrequestsを設定する。

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

### spec.storageClassName

#### ▼ storageClassNameとは

要求対象のPersistentVolumeのストレージクラス名を設定する。これを設定しない場合は、ストレージクラス名が```standard```のPerisitentVolumeを要求する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#class

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: foo-persistent-volume-claim
spec:
  storageClassName: standard
```

<br>

## 13. Pod

### spec.affinity

#### ▼ affinityとは

kube-schedulerがPodを作成するNodeを設定する。```spec.nodeSelector```キーと比較して、より複雑に条件を設定できる。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity
- https://stackoverflow.com/questions/57494369/kubectl-apply-deployment-to-specified-node-group-aws-eks

#### ▼ nodeAffinity

ワーカーNodeの```metadata.labels```キーを指定することにより、そのワーカーNode内にPodを作成する。特定のNodeにPodを作成するだけでなく、複数のNodeに同じ```metadata.labels```キーを付与しておき、このNode群をNodeグループと定義すれば、特定のNodeグループにPodを作成できる。

ℹ️ 参考：https://zenn.dev/geek/articles/c74d204b00ba1a

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      ports:
        - containerPort: 8080
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: app.kubernetes.io/nodegroup # ワーカーNodeのlabel
                operator: In
                values: foo-group
```

#### ▼ podAffinity

Podの```metadata.labels```キーを指定することにより、そのPodと同じワーカーNode内にPodを作成する。

ℹ️ 参考：https://zenn.dev/geek/articles/c74d204b00ba1a

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      ports:
        - containerPort: 8080
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
          - matchExpressions:
            - key: app.kubernetes.io/app # Podのlabel
              operator: In
              values: bar-pod
```

<br>

### spec.containers

#### ▼ containersとは

Pod内で起動するコンテナを設定する。PodをDeploymentやReplicaSetに紐づけずに使用することは非推奨である。

ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/overview/#naked-pods-vs-replicasets-deployments-and-jobs

#### ▼ name、image、port

Podを構成するコンテナの名前、ベースイメージ、受信ポートを設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      ports:
        - containerPort: 8080
```

#### ▼ imagePullPolicy

イメージのプルのルールを設定する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy

| オプション   | 説明                                              |
| ------------ |-------------------------------------------------|
| IfNotPresent | 仮想環境上にビルドされたイメージがあればこれを使用し、なければイメージリポジトリからぷるする。 |
| Always       | イメージリポジトリからコンテナイメージをプルする。                           |
| Never        | イメージをプルせず、仮想環境上にビルドされたイメージを使用する。                |

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      imagePullPolicy: IfNotPresent
      ports:
        - containerPort: 8080
```

#### ▼ resources

Node全体のハードウェアリソースを分母として、Pod内のコンテナが要求するリソースの下限/上限必要サイズを設定する。各Podは、Node内のハードウェアリソースを奪い合っており、Nodeが複数ある場合、kube-schedulerはリソースの空いているNodeのPodをスケーリングする。この時kube-schedulerは、コンテナの```resource```キーの値に基づいて、どのNodeにPodを作成するかを決めている。同じPod内に```resources```キーが設定されたコンテナが複数ある場合、下限/上限必要サイズを満たしているか否かの判定は、同じPod内のコンテナの要求サイズの合計値に基づくことになる。

ℹ️ 参考：https://newrelic.com/jp/blog/best-practices/set-requests-and-limits-for-your-clustercapacity-management

| キー名         | 説明                                             | 補足                                                         |
| -------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| ```requests``` | ハードウェアリソースの下限必要サイズを設定する。 | ・高くしすぎると、他のPodがスケーリングしにくくなる。<br>・もし、設定値がNodeのハードウェアリソース以上の場合、コンテナは永遠に起動しない。<br>ℹ️ 参考：https://qiita.com/jackchuka/items/b82c545a674975e62c04#cpu<br>・もし、これを設定しない場合は、コンテナが使用できるハードウェアリソースの下限がなくなる。そのため、Kubernetesが重要なPodにリソースを必要最低限しか割かず、パフォーマンスが低くなる可能性がある。 |
| ```limits```   | ハードウェアリソースの上限必要サイズを設定する。 | ・低くしすぎると、コンテナのパフォーマンスが常時悪くなる。<br>・もし、コンテナが上限値以上のリソースを要求すると、CPUの場合はPodは削除されずに、コンテナのスロットリング（起動と停止を繰り返す）が起こる。一方でメモリの場合は、OOMキラーによってPodのプロセスが削除され、Podは再作成される。<br>ℹ️ 参考：https://blog.mosuke.tech/entry/2020/03/31/kubernetes-resource/<br>・もし、これを設定しない場合は、コンテナが使用できるハードウェアリソースの上限がなくなる。そのため、Kubernetesが重要でないPodにリソースを割いてしまう可能性がある。<br>ℹ️ 参考： <br>・https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/#if-you-do-not-specify-a-cpu-limit<br>・https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/#if-you-do-not-specify-a-memory-limit |

ちなみに、Node全体のハードウェアリソースは、```kubectl describe```コマンドから確認できる。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/architecture/nodes/#capacity
- https://smallit.co.jp/blog/667/

```yaml
$ kubectl describe node <Node名>

# 〜 中略 〜

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

# 〜 中略 〜
```

| ハードウェアリソース名 | 単位                                                         |
| ---------------------- | ------------------------------------------------------------ |
| ```cpu```              | m：millicores（```1```m = ```1``` ユニット = ```0.001```コア） |
| ```memory```           | Mi：mebibyte（```1```Mi = ```1.04858```MB）                  |

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      resources:
        # 下限必要サイズ
        requests:
          cpu: 250m
          memory: 64Mi
        # 上限サイズ
        limits:
          cpu: 500m
          memory: 128Mi
```

#### ▼ volumeMount

Pod内コンテナのマウントポイントを設定する。```spec.volumes```オプションで設定されたボリュームのうちから、コンテナにマウントするボリュームを設定する。Node側のマウント元のディレクトリは、PersistentVolumeの```spec.hostPath```オプションで設定する。volumeMountという名前であるが、『ボリュームマウント』を実行するわけではなく、VolumeやPerisitentVolumeで設定された任意のマウントを実行できることに注意する。

ℹ️ 参考：https://stackoverflow.com/questions/62312227/docker-volume-and-kubernetes-volume

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
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

#### ▼ workingDir

コンテナの作業ディレクトリを設定する。ただし、作業ディレクトリの設定はアプリケーション側の責務のため、Kubernetesで設定するよりもDockerfileで定義した方が良い。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      ports:
        - containerPort: 8080
      workingDir: /go/src
```

<br>

### spec.hostname

#### ▼ hostnameとは

Podのホスト名を設定する。また、```spec.hostname```オプションが設定されていない時は、```metadata.name```がホスト名として使用される。

ℹ️ 参考：https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod%E3%81%AEhostname%E3%81%A8subdomain%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
  hostname: foo-pod
```

<br>

### spec.imagePullSecrets

#### ▼ imagePullSecretsとは

Podに適用するSecretを設定する。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/containers/images/#specifying-imagepullsecrets-on-a-pod
- https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/#create-a-pod-that-uses-your-secret
- https://medium.com/makotows-blog/kubernetes-private-registry-tips-image-pullsecretse-20dfb808dfc-e20dfb808dfc

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
  imagePullSecrets:
    - name: foo-secret
```

<br>

### spec.livenessProbe

#### ▼ livenessProbeとは

コンテナが起動しているか否かのヘルスチェックを設定する。

ℹ️ 参考：https://www.ianlewis.org/jp/kubernetes-health-check

#### ▼ httpGet

ヘルスチェックのエンドポイントを設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      livenessProbe:
        httpGet:
          port: 80
          path: /healthcheck
```

#### ▼ failureThreshold

ヘルスチェックが失敗したとみなす試行回数を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      livenessProbe:
        failureThreshold: 5
```

#### ▼ periodSeconds

ヘルスチェックの試行当たりの間隔を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      livenessProbe:
        periodSeconds: 5
```

<br>

### spec.nodeSelector

kube-schedulerがPodを作成するNodeを設定する。```spec.affinity```キーと比較して、より単純に条件を設定できる。特定のNodeにPodを作成するだけでなく、複数のNodeに同じ```metadata.labels```キーを付与しておき、このNode群をNodeグループと定義すれば、特定のNodeグループにPodを作成できる。

ℹ️ 参考：https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
  nodeSelector:
    app.kubernetes.io/nodegroup: bar-group
```

<br>

### spec.readinessProbe

#### ▼ readinessProbeとは

すで起動中のコンテナが仕様上正しく稼働しているか否かの準備済みチェックを設定する。何らかの仕様でコンテナの起動に時間がかかる場合、などで使用する。

ℹ️ 参考：

- https://www.ianlewis.org/jp/kubernetes-health-check
- https://amateur-engineer-blog.com/livenessprobe-readinessprobe/#toc4

#### ▼ httpGet

準備済みチェックのエンドポイントを設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      livenessProbe:
        httpGet:
          port: 80
          path: /ready
```

#### ▼ failureThreshold

準備済みチェックが失敗したとみなす試行回数を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      livenessProbe:
        failureThreshold: 5
```

#### ▼ periodSeconds

準備済みチェックの試行当たりの間隔を設定する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      livenessProbe:
        periodSeconds: 5
```

<br>

### spec.restartPolicy

#### ▼ restartPolicyとは

Pod内コンテナのライフサイクルの再起動ポリシーを設定する。

#### ▼ Always

コンテナが終了した場合、これが正常（終了ステータス```0```）か異常（終了ステータス```1```）か否かに関わらず、常にコンテナを再起動する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
  restartPolicy: Always
```

#### ▼ Never

コンテナが終了した場合、コンテナを再起動しない。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
  restartPolicy: Never
```

#### ▼ OnFailure

コンテナが終了した場合、これが異常（終了ステータス```1```）の場合にのみ、常にコンテナを再起動する。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
  restartPolicy: OnFailure
```

<br>

### spec.serviceAccountName

#### ▼ serviceAccountNameとは

PodにServiceAccountを紐づける。Podのプロセスに認証済みのIDが付与され、Kubernetesと通信できるようになる。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin::<バージョンタグ>
  serviceAccountName: foo-service-account
```

<br>

### spec.terminationGracePeriodSeconds

#### ▼ terminationGracePeriodSecondsとは

Podが終了する時の待機時間を設定する。

![pod_terminating_process](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/pod_terminating_process.png)

ℹ️ 参考：

- https://qiita.com/superbrothers/items/3ac78daba3560ea406b2
- https://speakerdeck.com/masayaaoyama/jkd1812-prd-manifests?slide=16

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin::<バージョンタグ>
  terminationGracePeriodSeconds: 300
```

<br>

### spec.volumes

#### ▼ volumesとは

Pod内で使用するボリュームを設定する。

#### ▼ configMap

ConfigMapのデータをコンテナのディレクトリにマウントする。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-fluent-bit
      image: fluent/fluent-bit:<バージョンタグ>
      volumeMounts:
        - name: foo-fluent-bit-conf-volume
          mountPath: /fluent-bit/etc/
  volumes:
    - name: foo-fluent-bit-conf-volume
      configMap:
        name: foo-fluent-bit-conf-config-map
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

#### ▼ emptyDir

Volumeの一種であるEmptyDirボリュームを作成する。EmptyDirボリュームのため、『Pod』が削除されるとこのボリュームも同時に削除される。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/storage/volumes/#emptydir
- https://qiita.com/umkyungil/items/218be95f7a1f8d881415

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      volumeMounts:
        - name: foo-gin-volume
          mountPath: /go/src
  volumes:
    - name: foo-gin-volume
      emptyDir: {}
```

#### ▼ hostPath

Volumeの一種であるHostPathボリュームを作成する。PersistentVolumeの一種であるHostPathボリュームとは区別すること。HostPathボリュームのため、『Node』が削除されるとこのボリュームも同時に削除される。HostPathボリューム自体は本番環境で非推奨である。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/storage/volumes/#hostpath
- https://qiita.com/umkyungil/items/218be95f7a1f8d881415

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:<バージョンタグ>
      volumeMounts:
        - name: foo-gin-volume
          mountPath: /go/src
  volumes:
  - name: foo-gin-volume
    hostPath:
      path: /data/src/foo
      type: DirectoryOrCreate # コンテナ内にディレクトリがなければ作成する
```

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

ℹ️ 参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/

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

<br>

## 14. ReplicaController

旧Deployment。非推奨である。

ℹ️ 参考：https://stackoverflow.com/questions/37423117/replication-controller-vs-deployment-in-kubernetes

<br>

## 15. Role、ClusterRole

### rules.apiGroups

#### ▼ apiGroupsとは

resourceキーで指定するKubernetesリソースのKubernetes-APIグループ名を設定する。空文字はコアグループを表す。

ℹ️ 参考：https://kubernetes.io/docs/reference/using-api/#api-groups

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: foo-cluster-role
rules:
  - apiGroups: [""]
```

<br>

### rules.resources

#### ▼ resourcesとは

操作対象のKubernetesリソースの認可スコープを設定する。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: foo-cluster-role
rules:
  - apiGroups: ["", "apps"]
    resources: ["namespaces", "deployments"]
```

<br>

### rules.verbs

#### ▼ verbsとは

Kubernetesリソースの操作内容の認可スコープを設定する。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: foo-cluster-role
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "watch", "list"]
```

<br>

## 16. RoleBinding、ClusterRoleBinding

### roleRef.name

#### ▼ roleRef.nameとは

RoleBindingを使用して紐づけるRoleの名前を設定する。

ℹ️ 参考：https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding

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
kind: RoleBinding
metadata:
  name: foo-cluster-role-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: foo-cluster-role
```

<br>

### subjects.name

#### ▼ subjects.nameとは

Roleの紐付け先のAccountの名前を設定する。

ℹ️ 参考：https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: foo-role-binding
subjects:
  - apiGroup: ""
    kind: ServiceAccount
    name: foo-service-account
```

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: foo-cluster-role-binding
subjects:
  - apiGroup: rbac.authorization.k8s.io
    kind: Group
    name: foo-group
```

<br>

## 17. Secret

### data

#### ▼ dataとは

Kubernetesリソースに渡す機密データを設定する。

#### ▼ string型データ

Secretで保持するstring型データを設定する。使用前にbase64方式で自動的にデコードされるため、あらかじめエンコード値を設定しておく必要がある。

ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#restriction-names-data

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
data:
  username: *****
  password: *****
```

string型しか設定できないため、デコード後にinteger型やboolean型になってしまう値は、ダブルクオーテーションで囲う必要がある。

ℹ️ 参考：https://stackoverflow.com/questions/63905890/kubernetes-how-to-set-boolean-type-variable-in-configmap

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
data:
  enableFoo: "*****"
  number: "*****"
```

<br>

### stringData

#### ▼ stringDataとは

Kubernetesリソースに渡す機密データを設定する。

#### ▼ string型データ

Secretで保持するstring型データを設定する。平文で設定しておく必要がある。

ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#restriction-names-data

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
data:
  username: bar
  password: baz
```

string型しか設定できないため、そのままだとinteger型やboolean型になってしまう値は、ダブルクオーテーションで囲う必要がある。

ℹ️ 参考：https://stackoverflow.com/questions/63905890/kubernetes-how-to-set-boolean-type-variable-in-configmap

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
stringData:
  enableFoo: "true" # ダブルクオーテーションで囲う。
  number: "1"
```

<br>

### type

#### ▼ typeとは

Secretの種類を設定する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#secret-types

#### ▼ kubernetes.io/basic-auth

Basic認証のためのデータを設定する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#basic-authentication-secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-basic-auth-secret
type: kubernetes.io/basic-auth
stringData:
  username: bar
  password: baz
```

#### ▼ kubernetes.io/dockerconfigjson

イメージレジストリの認証情報を設定する。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/configuration/secret/#docker-config-secrets
- https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/
- https://medium.com/makotows-blog/kubernetes-private-registry-tips-image-pullsecretse-20dfb808dfc-e20dfb808dfc

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

#### ▼ kubernetes.io/service-account-token

ServiceAccountのためのデータを設定する。ただし、自動的に作成されるため、ユーザーが設定する必要はない。

ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#service-account-token-secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-account-token-secret
  annotations:
    kubernetes.io/service-account.name: foo-account
type: kubernetes.io/service-account-token
stringData:
  foo-token: bar
```

#### ▼ kubernetes.io/tls

SSL/TLSを使用するためのデータを設定する。SSL証明書と秘密鍵の文字列が必要である。ユースケースとしては、データをIngressに割り当て、IngressとServiceの間をHTTPSで通信する例がある。

ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets

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

#### ▼ Opaque

任意のデータを設定する。ほとんどのユースケースに適する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/configuration/secret/#opaque-secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-opaque-secret
type: Opaque
stringData:
  username: bar
  password: baz
```

<br>

## 18. Service

### spec.ports

#### ▼ portsとは

受信するインバウンド通信を設定する。

#### ▼ appProtocol

受信するインバウンド通信のプロトコルを設定する。```spec.ports.protocol```キーとは異なり、アプリケーション層のプロトコルを明示的に指定できる。

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

もしIstio VirtualServiceからインバウンド通信を受信する場合、```spec.ports.appProtocol```キーが使用しなければ、```spec.ports.name```キーを『```<プロトコル名>-<任意の文字列>```』で命名しなければならない。

ℹ️ 参考：https://istio.io/latest/docs/ops/configuration/traffic-management/protocol-selection/

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
    - name: tcp
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

ちなみに、FastCGIプロトコルには変換できず、別にNginxを使用してプロトコルを変換する必要がある。

ℹ️ 参考：

- https://github.com/search?q=php-fpm+kubernetes
- https://kubernetes.github.io/ingress-nginx/user-guide/fcgi-services/

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

受信したインバウンド通信をPodに転送する時に、いずれのポート番号を指定するか否かを設定する。Pod内で最初にインバウンド通信を受信するコンテナの```containerPort```の番号に合わせるようにする。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
  - targetPort: 8080
    port: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  ports:
    - targetPort: 9000
      port: 9000
```

<br>

### spec.selector

インバウンド通信の転送先とするPodの```metadata.labels```キー名と値を設定する。

ℹ️ 参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
spec:
  selector:
    app.kubernetes.io/app: foo
```

<br>

### spec.type

Serviceのタイプを設定する。

ℹ️ 参考：

- https://zenn.dev/smiyoshi/articles/c86fc3532b4f8a
- https://www.netone.co.jp/knowledge-center/netone-blog/20210715-01/

| 値                        | IPアドレスの公開範囲 |
| ------------------------- | ----------------- |
| ClusterIP（デフォルト値） | Clusterネットワーク内からのみ |
| NodePort                  | Clusterネットワーク外/内 |
| LoadBalancer              | Clusterネットワーク外/内 |

<br>

## 19. ServiceAccount

### automountServiceAccountToken

#### ▼ automountServiceAccountTokenとは

ServiceAccountのPodへの自動紐付けの有効化する。デフォルトで有効化されている。

ℹ️ 参考：https://kakakakakku.hatenablog.com/entry/2021/07/12/095208

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

新しく作成されたPod内コンテナに自動挿入する```imagePullSecrets```キーを設定する。

ℹ️ 参考：https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#add-image-pull-secret-to-service-account

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: foo-service-account
imagePullSecrets:
  - name: foo-secret
```

<br>

## 20. ServiceEntry

### spec.hosts

#### ▼ hostsとは

送信できるアウトバウンド通信のドメイン名を設定する。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: foo-app-service-entry
spec:
  hosts:
    - '*'
```

<br>

### spec.ports

#### ▼ portsとは

送信できるアウトバウンド通信のポート番号を設定する。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: foo-app-service-entry
spec:
  ports:
    - name: http
      number: 80
      protocol: HTTP
    - name: https
      number: 443
      protocol: HTTPS
```

<br>

### spec.resolution

#### ▼ resolutionとは

送信できるアウトバウンド通信のIPアドレスの設定する。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: foo-app-service-entry
spec:
  resolution: DNS # DNSサーバーから返却されたIPアドレスを許可する。
```

<br>

## 21. StatefulSet

### spec.serviceName

#### ▼ serviceNameとは

StatefulSetによって管理されるPodにルーティングするServiceを設定する。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: StatefulSet
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: foo
      app.kubernetes.io/component: db
  serviceName: foo-db-service
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
            - name: foo-db-host-path-persistent-volume-claim
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

### spec.template（設定項目はPodと同じ）

#### ▼ templateとは

StatefulSetで維持管理するPodを設定する。設定項目はPodと同じである。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: StatefulSet
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: foo
      app.kubernetes.io/component: db
  serviceName: foo-db-service
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo
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
            - name: foo-db-host-path-persistent-volume-claim
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

### spec.volumeClaimTemplates

#### ▼ volumeClaimTemplatesとは

PersistentVolumeClaimを作成する。設定の項目は```kind: PersistentVolumeClaim```の場合と同じである。StatefulSetが削除されても、これは削除されない。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: StatefulSet
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: foo
      app.kubernetes.io/component: db
  serviceName: foo-db-service
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo
        app.kubernetes.io/component: db
    spec:
      containers:
        - name: mysql
          image: mysql:5.7
          ports:
            - containerPort: 3306
          volumeMounts:
            - name: foo-db-host-path-persistent-volume-claim
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
