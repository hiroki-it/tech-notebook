---
title: 【知見を記録するサイト】manifest.yaml＠Kubernetes
description: manifest.yaml＠Kubernetesの知見をまとめました．
---

# manifest.yaml＠Kubernetes

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Kubernetesのmanifest.yamlとは

### IaCとして

#### ▼ Kubernetes

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/virtualization/virtualization_container_orchestration_kubernetes.html

<br>

## 02. apiVersion

### apiVersionとは

Kubernetes-APIのバージョンを設定する．

```yaml
apiVersion: v1
```

<br>

## 03. kind

### kindとは

作成されるリソースの種類を設定する．

| リソース名                 | 補足                                                                                                                                                            |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Deployment            |                                                                                                                                                               |
| Ingress               | 他のリソースとはapiVersionが異なり，```networking.k8s.io/v1```を指定する必要がある．                                                                                                  |
| Namespace             |                                                                                                                                                               |
| Node                  | Kubernetesの実行時に自動的に作成される．もし手動で作成する場合は，kubectlコマンドで```--register-node=false```とする必要がある．                                                                        |
| PersistentVolume      |                                                                                                                                                               |
| PersistentVolumeClaim |                                                                                                                                                               |
| Pod                   | PodをDeploymentやReplicaSetに紐づけずに使用することは非推奨である．<br>参考：https://kubernetes.io/docs/concepts/configuration/overview/#naked-pods-vs-replicasets-deployments-and-jobs |
| ReplicaController     | 旧Deployment．非推奨である．<br>参考：https://stackoverflow.com/questions/37423117/replication-controller-vs-deployment-in-kubernetes                                     |
| ReplicaSet            |                                                                                                                                                               |
| Service               |                                                                                                                                                               |
| StatefulSet           |                                                                                                                                                               |

<br>

## 04. metadata

### metadataとは

Kubernetesリソースの一意に識別するための情報を設定する．

参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/#required-fields

<br>

### annotation

<br>

### labels

#### ▼ labelsとは

Kubernetesリソースを区別するための情報を設定する．

#### ▼ 予約ラベル

以下のリンクを参考にせよ．

参考：https://kubernetes.io/docs/reference/labels-annotations-taints/

<br>

### name

#### ▼ nameとは

Kubernetesリソースを一意に識別するための名前を設定する．

<br>

## 05. rule

### apiGroups

resourceで指定するリソースのKubernetes-APIグループを設定する．空文字はコアグループを表す．

参考：https://kubernetes.io/docs/reference/using-api/#api-groups

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: foo-cluster-role
rules:
  - apiGroups: [""]
```

<br>

### resources

操作対象のリソースの認可スコープを設定する．

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: foo-cluster-role
rules:
  - apiGroups:
      - ""
      - apps
    resources:
      - namespaces
      - deployments
```

<br>

### verbs

リソースに対する操作の認可スコープを設定する．

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: foo-read-only-cluster-role
rules:
  - apiGroups:
      - ""
      - apps
    resources:
      - namespaces
      - deployments
    verbs:
      - get
      - list
      - watch
```

<br>

## 06. spec（Configmapの場合）

### data

#### ▼ dataとは

キー名と値を格納する．

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: config-map
data:
  foo: bar 
```

改行すれば，設定ファイルも格納できる．

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
        Name cloudwatch_logs
        Match *
        region ap-northeast-1
        log_group_name /prd-foo-k8s/log
        log_stream_prefix container/fluent-bit/
        auto_create_group true
```

<br>

## 06-02. spec（Deploymentの場合）

### replicas

#### ▼ replicasとは

Podの複製数を設定する．

参考：https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#deployment-v1-apps

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: foo
      component: app
  template:
    metadata:
      labels:
        app: foo
        component: app
```

<br>

### revisionHistoryLimit

#### ▼ revisionHistoryLimitとは

保存されるリビジョン番号の履歴数を設定する．もし依存のリビジョン番号にロールバックする場合があるのであれば，必要数を設定しておく．

参考：https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#deployment-v1-apps

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  revisionHistoryLimit: 5
  selector:
    matchLabels:
      app: foo
      component: app
  template:
    metadata:
      labels:
        app: foo
        component: app
```

<br>

### selector

#### ▼ selectorとは

Deploymentで管理するPodを明示的に設定する．

#### ▼ matchLabels

Podのラベルを指定する．Podに複数のラベルが付与されている時は，これらを全て指定する必要がある．

参考：https://cstoku.dev/posts/2018/k8sdojo-08/#label-selector

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
  labels:
    app: foo
spec:
  selector:
    matchLabels: # Deploymentに紐づけるPodのラベル
      app: foo
      component: app
  template:
    metadata:
      labels: # Podのラベル
        app: foo
        component: app
```

<br>

### strategy

#### ▼ strategyとは

デプロイメントの方法を設定する．

#### ▼ RollingUpdate

ローリングアップデートを使用して，新しいPodをデプロイする．

参考：https://kakakakakku.hatenablog.com/entry/2021/09/06/173014

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 100% # Podのレプリカ数と同じ数だけ新しいPodをデプロイする．
      maxUnavailable: 0% # Podの停止数がレプリカ数を下回らないようにする．
  selector:
    matchLabels:
      app: foo
      component: app
  template:
    metadata:
      labels:
        app: foo
        component: app
```

もし```maxSurge```オプションを```100```%，また```maxUnavailable```オプションを```0```%とすると，ローリングアップデート時に，Podのレプリカ数と同じ数だけ新しいPodをデプロイするようになる．また，Podの停止数がレプリカ数を下回らないようになる．

![kubernetes_deployment_strategy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_deployment_strategy.png)

<br>

### template（設定項目はPodと同じ）

Deploymentで維持管理するPodを設定する．設定項目はPodと同じである．

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app: foo
      component: app
  template:
    metadata:
      labels:
        app: foo
    spec:
      containers:
        - name: foo-gin
          image: foo-gin:1.0.0
          ports:
            - containerPort: 8080
```

<br>

## 06-03. spec（Ingressの場合）

### rules

#### ▼ rulesとは

Serviceへのルーティングルールを設定する．複数のServiceにインバウンド通信を振り分けられる．

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
                name: foo-service
                port:
                  number: 80
    - http:
        paths:
          - path: /bar
            pathType: Prefix
            backend:
              service:
                name: bar-service
                port:
                  number: 80
```

<br>

## 06-04. spec（Namespaceの場合）

<br>

## 06-05. spec（PersistentVolumeの場合）

### accessModes

#### ▼ accessModesとは

ボリュームへのアクセス権限を設定する．

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes


#### ▼ ReadWriteMany

ボリュームに対して，複数Nodeから読み出し/書き込みできるようにする．Node間でDBを共有したい場合に使用する．

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
spec:
  accessModes:
    - ReadWriteMany
```

#### ▼ ReadOnlyMany

ボリュームに対して，複数Nodeから読み出しでき，また単一Nodeのみから書き込みできるようにする．Node間で読み出し処理のみDBを共有したい場合に使用する．

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
spec:
  accessModes:
    - ReadOnlyMany
```

#### ▼ ReadWriteOnce

ボリュームに対して，単一Nodeからのみ読み出し/書き込みできるようにする．NodeごとにDBを分割したい場合に使用する．

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
spec:
  accessModes:
    - ReadWriteOnce
```

<br>

### capacity

#### ▼ capacityとは

ストレージの最大容量を設定する．

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#capacity

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
spec:
  capacity:
    storage: 10G
```

<br>

### hostPath

#### ▼ hostPathとは

PersistentVolumeの一種であるHostPathボリュームを作成する．Volumeの一種であるHostPathボリュームとは区別すること．

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/

#### ▼ path

Node側のマウント元のディレクトリを設定する．Podのマウントポイントは，Podの```spec.containers.volumeMount```オプションで設定する．

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
spec:
  hostPath:
    path: /data/src/foo
```

#### ▼ type

マウント方法を設定する．

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
spec:
  hostPath:
    type: DirectoryOrCreate
    path: /data/src/foo
```

<br>

### local

#### ▼ localとは

Node上にストレージ領域を新しく作成し，これをボリュームとする．```nodeAffinity```キーの設定が必須であり，Nodeを明示的に指定できる．

参考：

- https://kubernetes.io/docs/concepts/storage/persistent-volumes/
- https://kubernetes.io/docs/concepts/storage/persistent-volumes/#node-affinity

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
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

### mountOptions

#### ▼ mountOptionsとは

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#mount-options

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
spec:
  mountOptions:
    - hard
```

<br>

### nfs

#### ▼ nfsとは

ホスト上であらかじめNFSサーバーを起動しておく．NFSサーバーにストレージ領域を作成し，これをボリュームとする．ワーカーNode内のPodを，ホスト上のNFSサーバーにマウントする．

参考：

- https://kubernetes.io/docs/concepts/storage/persistent-volumes/#mount-options
- https://ytsuboi.jp/archives/505
- https://qiita.com/reoring/items/4d80a04dd31e991dd233

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
spec:
  nfs:
    server: <NFSサーバーのIPアドレス>
    path: /data/src/foo
```

<br>

### nodeAffinity

#### ▼ nodeAffinityとは

PersistentVolumeの作成先とするワーカーNodeを設定する．

参考：https://qiita.com/ysakashita/items/67a452e76260b1211920

#### ▼ required.nodeSelectorTerms.matchExpressions

作成先のワーカーNodeのラベルを指定するための条件（```In```，```NotIn```，```Exists```）を設定する．

参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#set-based-requirement

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
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
            # 開発環境であれば minikubeを指定する．
            # - minikube 
```

<br>

### persistentVolumeReclaimPolicy

#### ▼ persistentVolumeReclaimPolicyとは

PersistentVolumeのライフサイクルを設定する．

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#reclaim-policy

#### ▼ Delete

PersistentVolumeを指定するPersistentVolumeClaimが削除された場合に，PersistentVolumeも自動的に削除する．クラウドプロバイダーのPersistentVolumeの動的プロビジョニングのために使用することが多い．

参考：https://www.amazon.co.jp/dp/B07HFS7TDT

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
spec:
  persistentVolumeReclaimPolicy: Delete
```

#### ▼ Recycle（非推奨）

PersistentVolumeを指定するPersistentVolumeClaimが削除された場合に，PersistentVolume内のデータのみを削除し，PersistentVolume自体は削除しない．将来的に廃止予定のため，非推奨．

参考：https://www.amazon.co.jp/dp/B07HFS7TDT

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
spec:
  persistentVolumeReclaimPolicy: Recycle
```

#### ▼ Retain

PersistentVolumeを指定するPersistentVolumeClaimが削除されたとしても，PersistentVolumeは削除しない．割り当てから解除されたPersistentVolumeはReleasedステータスになる．一度，Releasedステータスになると，他のPerisistentVolumeClaimからは指定できなくなる．

参考：https://www.amazon.co.jp/dp/B07HFS7TDT

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
spec:
  persistentVolumeReclaimPolicy: Retain
```

<br>

### storageClassName

#### ▼ storageClassNameとは

ストレージクラス名を設定する．これは，PersistentVolumeClaimが特定のPersistentVolumeを要求する時に必要になる．

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#class

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
  labels:
    app: foo
spec:
  storageClassName: standard
```

名前の例として以下がある．

| クラス名 | 説明                                | 補足                                                         |
| -------- | ----------------------------------- | ------------------------------------------------------------ |
| standard | デフォルト値である．                |                                                              |
| fast     | SSDをPersistentVolumeとして使用する． | 参考：https://kubernetes.io/docs/concepts/storage/_print/#%E5%8B%95%E7%9A%84%E3%83%97%E3%83%AD%E3%83%93%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0%E3%82%92%E6%9C%89%E5%8A%B9%E3%81%AB%E3%81%99%E3%82%8B |
| slow     | HDをPersistentVolumeとして使用する．  | 参考：https://kubernetes.io/docs/concepts/storage/_print/#%E5%8B%95%E7%9A%84%E3%83%97%E3%83%AD%E3%83%93%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0%E3%82%92%E6%9C%89%E5%8A%B9%E3%81%AB%E3%81%99%E3%82%8B |

<br>

## 06-06. spec（PersistentVolumeClaimの場合）

### accessModes

#### ▼ accessModesとは

要求対象のPerisitentVolumeのaccessModeを設定する．

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: foo-persistent-volume-claim
  labels:
    app: foo
spec:
  accessModes:
    - ReadWriteMany
```

<br>

### resources

#### ▼ resourcesとは

要求する仮想ハードウェアのリソースを設定する．

#### ▼ requests

要求対象のPerisitentVolumeのrequestsを設定する．

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: foo-persistent-volume-claim
  labels:
    app: foo
spec:
  resources:
    requests:
      storage: 2Gi
```

<br>

### storageClassName

#### ▼ storageClassNameとは

要求対象のPersistentVolumeのストレージクラス名を設定する．これを設定しない場合は，ストレージクラス名が```standard```のPerisitentVolumeを要求する．

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#class

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: foo-persistent-volume-claim
  labels:
    app: foo
spec:
  storageClassName: standard
```

<br>

## 06-07. spec（Podの場合）

### containers

#### ▼ containersとは

Pod内で起動するコンテナを設定する．

#### ▼ name，image，port

Podを構成するコンテナの名前，ベースイメージ，受信ポートを設定する．

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

#### ▼ imagePullPolicy

イメージのプルのルールを設定する．

参考：https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy

| オプション   | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| IfNotPresent | 仮想環境上にビルドされたイメージがあればこれを使用し，なければリポジトリからぷるする． |
| Always       | リポジトリからイメージをプルする．                           |
| Never        | イメージをプルせず，仮想環境上にビルドされたイメージを使用する． |

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

#### ▼ resources

コンテナのCPUとメモリの最小/最大使用量を設定する．Pod内にコンテナが複数ある場合，最小/最大使用量を満たしているかどうかの判定は，これらのコンテナのリソース使用量の合計値に基づくことになる．

参考：

- https://newrelic.com/jp/blog/best-practices/set-requests-and-limits-for-your-clustercapacity-management
- https://qiita.com/jackchuka/items/b82c545a674975e62c04#cpu

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
        # 最小使用量
        requests:
          cpu: 250m
          memory: 64Mi
        # 最大使用量
        limits:
          cpu: 500m
          memory: 128Mi
```

リソースの使用状況によるPodの挙動は以下の通りである．

| リソース名  | 単位                                                           | request値以上にPodのリソースが余っている場合 | limit値に達した場合  |
|--------|--------------------------------------------------------------|-----------------------------|---------------|
| CPU    | ```m```：millicores（```1```コア = ```1000```ユニット = ```1000```m） | コンテナの負荷が高まれば，自動でスケーリングする．   | 処理がスロットリングする． |
| Memory | ```Mi```：mebibyte（```1```Mi = ```1.04858```MB）               | コンテナの負荷が高まれば，自動でスケーリングする．   | Podが削除される．    |

もし最大使用量を設定しない場合，Podが実行されているNodeのリソースに余力がある限り，Podのリソース使用量は上昇し続けるようになる．

参考：

- https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/#if-you-do-not-specify-a-cpu-limit
- https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/#if-you-do-not-specify-a-memory-limit

<br>

#### ▼ volumeMount

Pod内のコンテナのマウントポイントを設定する．```spec.volume```オプションで設定されたボリュームのうちから，コンテナにマウントするボリュームを設定する．Node側のマウント元のディレクトリは，PersistentVolumeの```spec.hostPath```オプションで設定する．volumeMountという名前であるが，『ボリュームマウント』を実行するわけではなく，VolumeやPerisitentVolumeで設定された任意のマウントを実行できることに注意する．

参考：https://stackoverflow.com/questions/62312227/docker-volume-and-kubernetes-volume

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

#### ▼ workingDir

コンテナの作業ディレクトリを設定する．ただし，作業ディレクトリの設定はアプリケーション側の責務のため，Kubernetesで設定するよりもDockerfileで定義した方が良い．

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

### hostname

#### ▼ hostnameとは

Podのホスト名を設定する．また，```spec.hostname```オプションが設定されていない時は，```metadata.name```がホスト名として使用される．

参考：https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod%E3%81%AEhostname%E3%81%A8subdomain%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89

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

<br>

### imagePullSecrets

#### ▼ imagePullSecretsとは

Podに適用するSecretを設定する．

参考：

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
      image: foo-gin:1.0.0
  imagePullSecrets:
    - name: foo-secret
```

<br>

### restartPolicy

#### ▼ restartPolicyとは

Pod内のコンテナのライフサイクルの再起動ポリシーを設定する．

#### ▼ Always

コンテナが終了した場合に，これが正常（終了ステータス```0```）か異常（終了ステータス```1```）かどうかに関わらず，常にコンテナを再起動する．

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

コンテナが終了した場合に，コンテナを再起動しない．

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

コンテナが終了した場合に，これが異常（終了ステータス```1```）の場合にのみ，常にコンテナを再起動する．

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

### serviceAccountName

#### ▼ serviceAccountNameとは

PodにServiceAccountを紐づける．Podのプロセスに認証済みのIDが付与され，Kubernetesと通信できるようになる．

**＊実装例＊**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-fluent-bit
      image: fluent/fluent-bit:1.0.0
  serviceAccountName: foo-fluent-bit-service-account
```

<br>

### volume

#### ▼ volumeとは

Pod内で使用するボリュームを設定する．

#### ▼ configMap

ConfigMapのデータをコンテナのディレクトリにマウントする．

**＊実装例＊**

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
        Name cloudwatch_logs
        Match *
        region ap-northeast-1
        log_group_name /prd-foo-k8s/log
        log_stream_prefix container/fluent-bit/
        auto_create_group true
```

#### ▼ emptyDir

Volumeの一種であるEmptyDirボリュームを作成する．EmptyDirボリュームのため，『Pod』が削除されるとこのボリュームも同時に削除される．

参考：

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
      image: foo-gin:1.0.0
      volumeMounts:
        - name: foo-gin-volume
          mountPath: /go/src
  volumes:
    - name: foo-gin-volume
      emptyDir: {}
```

#### ▼ hostPath

Volumeの一種であるHostPathボリュームを作成する．PersistentVolumeの一種であるHostPathボリュームとは区別すること．HostPathボリュームのため，『Node』が削除されるとこのボリュームも同時に削除される．HostPathボリューム自体は本番環境で非推奨である．

参考：

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
      image: foo-gin:1.0.0
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

要求によって作成するボリューム名を設定する．

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

PersistentVolumeを使用する場合に，PersistentVolumeClaimを設定する．

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/

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

PersistentVolumeClaimとPersistentVolumeはあらかじめ作成しておく必要がある．

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: foo-standard-volume-claim
  labels:
    app: foo
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
  labels:
    app: foo
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

## 06-08. spec（Secretの場合）

### data

Secretで保持するデータを設定する．使用前にbase64方式で自動的にデコードされるため，あらかじめエンコード値を設定しておく必要がある．

参考：https://kubernetes.io/docs/concepts/configuration/secret/#restriction-names-data

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
data:
  username: *****
  password: *****
```

<br>

### stringData

Secretで保持するデータを設定する．平文で設定しておく必要がある．

参考：https://kubernetes.io/docs/concepts/configuration/secret/#restriction-names-data

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
data:
  username: bar
  password: baz
```

<br>

### type

#### ▼ typeとは

Secretの種類を設定する．

参考：https://kubernetes.io/docs/concepts/configuration/secret/#secret-types

#### ▼ kubernetes.io/basic-auth

Basic認証のためのデータを設定する．

参考：https://kubernetes.io/docs/concepts/configuration/secret/#basic-authentication-secret

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

イメージレジストリの認証情報を設定する．

参考：

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

ただしAWS EKSでは，このSecretは不要であり，ワーカーノード（Fargate，EC2）にECRへのアクセス権限を付与しておけばよい．

参考：https://nishipy.com/archives/1122

#### ▼ kubernetes.io/service-account-token

ServiceAccountのためのデータを設定する．ただし，自動的に構築されるため，ユーザーが設定する必要はない．

参考：https://kubernetes.io/docs/concepts/configuration/secret/#service-account-token-secrets

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

SSL/TLSを使用するためのデータを設定する．SSL証明書と秘密鍵の文字列が必要である．ユースケースとしては，データをIngressに割り当て，IngressとServiceの間をHTTPSで通信する例がある．

参考：https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets

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

任意のデータを設定する．ほとんどのユースケースに適する．

参考：https://kubernetes.io/docs/concepts/configuration/secret/#opaque-secrets

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

## 06-09. spec（Serviceの場合）

### ports

#### ▼ appProtocol

受信するインバウンド通信のプロトコルを設定する．```protocol```キーとは異なり，アプリケーション層のプロトコルを明示的に指定できる．

```yaml
apiVersion: v1
kind: Service
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
  labels:
    app: foo
spec:
  ports:
    - appProtocol: tcp
      port: 9000
```

もしIstio VirtualServiceからインバウンド通信を受信する場合に，```appProtocol```キーが使用しなければ，```name```キーを『```<プロトコル名>-<任意の文字列>```』で命名しなければならない．

参考：https://istio.io/latest/docs/ops/configuration/traffic-management/protocol-selection/

```yaml
# appProtocolを使用しない場合
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
  labels:
    app: foo
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
  labels:
    app: foo
spec:
  ports:
    - name: tcp-foo # Istio Gatewayからインバウンド通信を受信
      port: 9000
```

#### ▼ name

プロトコルのポート名を設定する．

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
  labels:
    app: foo
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
  labels:
    app: foo
spec:
  ports:
    - name: tcp
      port: 9000
```

#### ▼ protocol

受信するインバウンド通信のプロトコルを設定する．

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
  labels:
    app: foo
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
  labels:
    app: foo
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
  labels:
    app: foo
spec:
  ports:
    - protocol: SCTP
      port: 22
```

ちなみに，FastCGIプロトコルには変換できず，別にNginxを使用してプロトコルを変換する必要がある．

参考：

- https://github.com/search?q=php-fpm+kubernetes
- https://kubernetes.github.io/ingress-nginx/user-guide/fcgi-services/

#### ▼ port

インバウンド通信を待ち受けるポート番号を設定する．

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
  labels:
    app: foo
spec:
  ports:
    - port: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
  labels:
    app: foo
spec:
  ports:
    - port: 9000
```

#### ▼ targetPort

受信したインバウンド通信をPodに転送する時に，いずれのポート番号を指定するかどうかを設定する．Pod内で最初にインバウンド通信を受信するコンテナの```containerPort```の番号に合わせるようにする．

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
  labels:
    app: foo
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
  labels:
    app: foo
spec:
  ports:
    - targetPort: 9000
      port: 9000
```

<br>

### selector

インバウンド通信の転送先とするPodのラベルのキー名と値を設定する．

参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/

**＊実装例＊**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-app-service
  labels:
    app: foo
spec:
  selector:
    app: foo
```

<br>

### type

Serviceのタイプを設定する．

参考：

- https://zenn.dev/smiyoshi/articles/c86fc3532b4f8a
- https://www.netone.co.jp/knowledge-center/netone-blog/20210715-01/

| 値                        | IPアドレスの公開範囲   |
| ------------------------- | ---------------------- |
| ClusterIP（デフォルト値） | Cluster内部からのみ |
| NodePort                  | Cluster外部/内部   |
| LoadBalancer              | Cluster外部/内部   |

<br>

## 06-10. spec（ServiceAccountの場合）

### automountServiceAccountToken

#### ▼ automountServiceAccountTokenとは

ServiceAccountのPodへの自動紐付けの有効化する．デフォルトで有効化されている．

参考：https://kakakakakku.hatenablog.com/entry/2021/07/12/095208

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: foo-service-account
automountServiceAccountToken: false
```

<br>

## 06-11. spec（ServiceEntryの場合）

### hosts

送信可能なアウトバウンド通信のドメイン名を設定する．

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: foo-app-service-entry
  labels:
    app: foo
spec:
  hosts:
    - '*'
```

<br>

### ports

送信可能なアウトバウンド通信のポート番号を設定する．

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: foo-app-service-entry
  labels:
    app: foo
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

### resolution

送信可能なアウトバウンド通信のIPアドレスの設定する．

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: foo-app-service-entry
  labels:
    app: foo
spec:
  resolution: DNS # DNSサーバーから返却されたIPアドレスを許可する．
```

<br>

## 06-12. spec（StatefulSetの場合）

### serviceName

#### ▼ serviceNameとは

StatefulSetによって管理されるPodにルーティングするServiceを設定する．

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: StatefulSet
spec:
  selector:
    matchLabels:
      app: foo
      component: db
  serviceName: foo-db-service
  template:
    metadata:
      labels:
        app: foo
        component: db
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
          app: foo
          component: db
      spec:
        storageClassName: standard
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 2Gi
```

<br>

### template（設定項目はPodと同じ）

#### ▼ templateとは

StatefulSetで維持管理するPodを設定する．設定項目はPodと同じである．

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: StatefulSet
spec:
  selector:
    matchLabels:
      app: foo
      component: db
  serviceName: foo-db-service
  template:
    metadata:
      labels:
        app: foo
        component: db
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
          app: foo
          component: db
      spec:
        storageClassName: standard
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 2Gi
```

### volumeClaimTemplates

#### ▼ volumeClaimTemplatesとは

PersistentVolumeClaimを作成する．設定の項目は```kind: PersistentVolumeClaim```の場合と同じである．StatefulSetが削除されても，これは削除されない．

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: StatefulSet
spec:
  selector:
    matchLabels:
      app: foo
      component: db
  serviceName: foo-db-service
  template:
    metadata:
      labels:
        app: foo
        component: db
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
          app: foo
          component: db
      spec:
        storageClassName: standard
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 2Gi
```

<br>
