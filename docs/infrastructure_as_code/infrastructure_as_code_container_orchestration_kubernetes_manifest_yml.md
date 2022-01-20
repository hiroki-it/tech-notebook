---
title: 【知見を記録するサイト】manifest.yml@Kubernetes
---

# manifest.yml@Kubernetes

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. apiVersion

### apiVersionとは

Kubernetes-APIのバージョンを設定する．

```yaml
apiVersion: v1
```

<br>

## 02. kind

### kindとは

作成されるオブジェクトの種類を設定する．

| オブジェクト名                  | 補足                                                         |
| --------------------- | ------------------------------------------------------------ |
| Deployment            |                                                              |
| Ingress               | 他のオブジェクトとはapiVersionが異なり，```networking.k8s.io/v1```を指定する必要がある． |
| Namespace |  |
| PersistentVolume      |                                                              |
| PersistentVolumeClaim |                                                              |
| Pod                   | PodをDeploymentやReplicaSetに紐づけずに用いることは非推奨である．<br>参考：https://kubernetes.io/ja/docs/concepts/configuration/overview/#naked-pods-vs-replicasets-deployments-and-jobs |
| ReplicaController     | 旧Deployment．非推奨である．<br>参考：https://stackoverflow.com/questions/37423117/replication-controller-vs-deployment-in-kubernetes |
| ReplicaSet            |                                                              |
| Service               |                                                              |
| StatefulSet           |                                                              |

<br>

## 03. metadata

### metadataとは

Kubernetesオブジェクトの一意に識別するための情報を設定する．

参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/#required-fields

<br>

### name

Kubernetesオブジェクトを一意に識別するための名前を設定する．

```yaml
metadata:
  name: foo
```

<br>

## 04. spec（Deploymentの場合）

### replicas

Podの複製数を設定する．

参考：https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#deployment-v1-apps

```yaml
kind: Deployment
spec:
  replicas: 1
```

<br>

### revisionHistoryLimit

保存されるリビジョン番号の履歴数を設定する．もし依存のリビジョン番号にロールバックすることがあるのであれば，必要数を設定しておく．

参考：https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#deployment-v1-apps

```yaml
kind: Deployment
spec:
  revisionHistoryLimit: 5
```

<br>

### selector

#### ・matchLabels

Deploymentで管理するPodのラベルを指定する．Podに複数のラベルが付与されている時は，これらを全て指定する必要がある．

参考：https://cstoku.dev/posts/2018/k8sdojo-08/#label-selector

```yaml
kind: Deployment
metadata:
  name: foo-pod
  labels:
    app: foo
spec:
  selector:
    matchLabels:
      app: foo
      type: web
  template:
    metadata:
      labels: # Podのラベル
        app: foo
        type: web
```

<br>

### strategy

#### ・RollingUpdate

ローリングアップデートを用いて，新しいPodをデプロイする．

参考：https://kakakakakku.hatenablog.com/entry/2021/09/06/173014

```yaml
kind: Deployment
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 100% # Podのレプリカ数と同じ数だけ新しいPodをデプロイする．
      maxUnavailable: 0% # Podの停止数がレプリカ数を下回らないようにする．
```

もし```maxSurge```オプションを```100```%，また```maxUnavailable```オプションを```0```%とすると，ローリングアップデート時に，Podのレプリカ数と同じ数だけ新しいPodをデプロイするようになる．また，Podの停止数がレプリカ数を下回らないようになる．

![kubernetes_deployment_strategy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_deployment_strategy.png)

<br>

### template

スケーリング時に複製の鋳型とするPodを設定する．

**＊実装例＊**

```yaml
kind: Deployment
spec:
  template:
    metadata:
      labels:
        app: foo
    spec:
      containers:
        - name: foo-lumen
          image: foo-lumen:latest
          ports:
            - containerPort: 9000
        - name: foo-nginx
          image: foo-nginx:latest
          ports:
            - containerPort: 8000
```

<br>

## 04-02. spec（Ingressの場合）

### rules

Serviceへのルーティングルールを設定する．複数のServiceにインバウンド通信を振り分けられる．

```yaml
kind: Ingress
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

## 04-03. spec（Namespaceの場合）

<br>

## 04-04. spec（PersistentVolumeの場合）

### accessModes

#### ・accessModesとは

ボリュームへのアクセス権限を設定する．

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes


#### ・ReadWriteMany

ボリュームに対して，複数ノードから読み出し/書き込みできるようにする．ノード間でDBを共有したい場合に用いる．

**＊実装例＊**

```yaml
kind: PersistentVolume
spec:
  accessModes:
    - ReadWriteMany
```

#### ・ReadOnlyMany

ボリュームに対して，複数ノードから読み出しでき，また単一ノードのみから書き込みできるようにする．ノード間で読み出し処理のみDBを共有したい場合に用いる．

**＊実装例＊**

```yaml
kind: PersistentVolume
spec:
  accessModes:
    - ReadOnlyMany
```

#### ・ReadWriteOnce

ボリュームに対して，単一ノードからのみ読み出し/書き込みできるようにする．ノードごとにDBを分割したい場合に用いる．

**＊実装例＊**

```yaml
kind: PersistentVolume
spec:
  accessModes:
    - ReadWriteOnce
```

<br>

### capacity

#### ・capacityとは

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#capacity

**＊実装例＊**

```yaml
kind: PersistentVolume
spec:
  capacity:
    storage: 10G
```

<br>

### hostPath

#### ・hostPathとは

ノード上にストレージ領域を新しく作成し，これをボリュームとする．

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/

**＊実装例＊**

```yaml
kind: PersistentVolume
spec:
  hostPath:
    path: /data
    type: DirectoryOrCreate
```

<br>

### local

#### ・localとは

ノード上にストレージ領域を新しく作成し，これをボリュームとする．```nodeAffinity```キーの設定が必須であり，ノードを明示的に指定できる．

参考：

- https://kubernetes.io/docs/concepts/storage/persistent-volumes/
- https://kubernetes.io/docs/concepts/storage/persistent-volumes/#node-affinity

```yaml
kind: PersistentVolume
spec:
  local:
    path: /data
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

#### ・mountOptionsとは

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#mount-options

**＊実装例＊**

```yaml
kind: PersistentVolume
spec:
  mountOptions:
    - hard
```

<br>

### nfs

#### ・nfsとは

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#mount-options

```yaml
kind: PersistentVolume
spec:
  nfs:
    server: nnn.nnn.nnn.nnn
    path: /nfs/foo
```

<br>

### persistentVolumeReclaimPolicy

#### ・persistentVolumeReclaimPolicyとは

PersistentVolumeのライフサイクルを設定する．

参考：https://kubernetes.io/docs/concepts/storage/persistent-volumes/#reclaim-policy

#### ・Delete

PersistentVolumeを指定する```spec.persistentVolumeClaim```が削除された場合に，PersistentVolumeも自動的に削除する．

**＊実装例＊**

```yaml
kind: PersistentVolume
spec:
  persistentVolumeReclaimPolicy: Delete
```

#### ・Recycle

PersistentVolumeを指定する```spec.persistentVolumeClaim```が削除された場合に，PersistentVolume内のデータのみを削除し，PersistentVolume自体は削除しない．

**＊実装例＊**

```yaml
kind: PersistentVolume
spec:
  persistentVolumeReclaimPolicy: Recycle
```

#### ・Retain

PersistentVolumeを指定する```spec.persistentVolumeClaim```が削除されたとしても，PersistentVolumeは削除しない．

**＊実装例＊**

```yaml
kind: PersistentVolume
spec:
  persistentVolumeReclaimPolicy: Retain
```

<br>

### storageClassName

#### ・fast

SSDをPersistentVolumeとして用いる．

参考：https://kubernetes.io/ja/docs/concepts/storage/_print/#%E5%8B%95%E7%9A%84%E3%83%97%E3%83%AD%E3%83%93%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0%E3%82%92%E6%9C%89%E5%8A%B9%E3%81%AB%E3%81%99%E3%82%8B

**＊実装例＊**

```yaml
kind: PersistentVolume
spec:
  storageClassName: fast
```

#### ・slow

HDをPersistentVolumeとして用いる．

参考：https://kubernetes.io/ja/docs/concepts/storage/_print/#%E5%8B%95%E7%9A%84%E3%83%97%E3%83%AD%E3%83%93%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0%E3%82%92%E6%9C%89%E5%8A%B9%E3%81%AB%E3%81%99%E3%82%8B

**＊実装例＊**

```yaml
kind: PersistentVolume
spec:
  storageClassName: slow
```

<br>

## 04-05. spec（PersistentVolumeClaimの場合）

### accessModes

**＊実装例＊**

```yaml
kind: PersistentVolumeClaim
spec:
  accessModes:
    - ReadWriteMany
```

<br>

### resources

**＊実装例＊**

```yaml
kind: PersistentVolumeClaim
spec:
  resources:
    - ReadWriteMany
```

<br>

## 04-06. spec（Podの場合）

### containers

#### ・name，image，port

Podを構成するコンテナの名前，ベースイメージ，受信ポートを設定する．

**＊実装例＊**

```yaml
kind: Pod
spec:
  containers:
    - name: foo-lumen
      image: foo-lumen:latest
      ports:
        - containerPort: 9000
    - name: foo-nginx
      image: foo-nginx:latest
      ports:
        - containerPort: 8000
```

#### ・volumeMount

ボリュームマウントを実行する．```spec.volume```で設定されたボリュームのうちから，コンテナにマウントするボリュームを設定する．

**＊実装例＊**

```yaml
kind: Pod
spec:
  containers:
    - name: foo-lumen
      image: foo-lumen:latest
      ports:
        - containerPort: 9000
      volumeMounts:
         - name: foo-nginx
           mountPath: /var/www/foo
    - name: foo-lumen
      image: foo-lumen:latest
      ports:
        - containerPort: 9000
      volumeMounts:
         - name: foo-nginx
           mountPath: /var/www/foo           
```

<br>

### hostname

Podのホスト名を設定する．また，```spec.hostname```が設定されていない時は，```metadata.name```がホスト名として使用される．

参考：https://kubernetes.io/ja/docs/concepts/services-networking/dns-pod-service/#pod%E3%81%AEhostname%E3%81%A8subdomain%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89

**＊実装例＊**

```yaml
kind: Pod
spec:
  hostname: foo-pod
```

<br>

### volume

#### ・name

要求によって作成するボリューム名を設定する．

#### ・persistentVolumeClaim.claimName

用いるPersistentVolumeClaimオブジェクトの名前を設定する．

参考：https://kubernetes.io/ja/docs/concepts/storage/persistent-volumes/

**＊実装例＊**

```yaml
kind: Pod
spec:
  volumes
    - name: foo-volume
      persistentVolumeClaim:
        claimName: foo-slow-volume-claim
```

persistentVolumeは別途作成しておく必要がある．

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: foo-slow-volume-claim
  labels:
    app: foo
spec:
  storageClassName: slow
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

#### ・emptyDir

EmptyDirボリュームを作成する．そのため，『Pod』が削除されるとこのボリュームも同時に削除される．

参考：

- https://kubernetes.io/docs/concepts/storage/volumes/#emptydir
- https://qiita.com/umkyungil/items/218be95f7a1f8d881415

**＊実装例＊**

```yaml
kind: Pod
spec:
  volumes
    - name: foo-lumen
      emptyDir: {}
    - name: foo-nginx
      emptyDir: {}
```

#### ・hostPath

HostPathボリュームを作成する．そのため，『ノード』が削除されるとこのボリュームも同時に削除される．

参考：

- https://kubernetes.io/docs/concepts/storage/volumes/#hostpath
- https://qiita.com/umkyungil/items/218be95f7a1f8d881415

**＊実装例＊**

```yaml
kind: Pod
spec:
  volumes
  - name: foo-lumen
    hostPath:
      path: /data
      type: DirectoryOrCreate # コンテナ内にディレクトリがなければ作成する
```

<br>

## 04-07. spec（Serviceの場合）

### ports

#### ・appProtocol

受信するインバウンド通信のプロトコルを設定する．```protocol```キーとは異なり，アプリケーション層のプロトコルを明示的に指定できる．

```yaml
 kind: Service
 spec:
   ports:
   - appProtocol: http
```

```yaml
 kind: Service
 spec:
   ports:
   - appProtocol: tcp
```

もしIstio VirtualServiceからインバウンド通信を受信する場合に，```appProtocol```キーが使用しなければ，```name```キーを『```<プロトコル名>-<任意の文字列>```』で命名しなければならない．

参考：https://istio.io/latest/docs/ops/configuration/traffic-management/protocol-selection/

```yaml
# appProtocolを用いない場合
kind: Service
spec:
  ports:
  - name: http-foo # Istio Gatewayからインバウンド通信を受信
```

```yaml
# appProtocolを用いない場合
kind: Service
spec:
  ports:
  - name: tcp-foo # Istio Gatewayからインバウンド通信を受信
```

#### ・name

プロトコルのポート名を設定する．

```yaml
 kind: Service
 spec:
   ports:
   - name: http
```

```yaml
 kind: Service
 spec:
   ports:
   - name: tcp
```

#### ・protocol

受信するインバウンド通信のプロトコルを設定する．

**＊実装例＊**

```yaml
kind: Service
spec:
  ports:
  - protocol: TCP
```

```yaml
kind: Service
spec:
  ports:
  - protocol: UDP
```

```yaml
kind: Service
spec:
  ports:
  - protocol: SCTP
```

ちなみに，FastCGIプロトコルには変換できず，別にNginxを用いてプロトコルを変換する必要がある．

参考：

- https://github.com/search?q=php-fpm+kubernetes
- https://kubernetes.github.io/ingress-nginx/user-guide/fcgi-services/

#### ・port

インバウンド通信を受信するポート番号を設定する．

**＊実装例＊**

```yaml
kind: Service
spec:
  ports:
  - port: 80
```

```yaml
kind: Service
spec:
  ports:
    - port: 9000
```

####  ・targetPort

受信したインバウンド通信をPodに転送する時に，いずれのポート番号を指定するかどうかを設定する．Pod内で最初にインバウンド通信を受信するコンテナの```containerPort```の番号に合わせるようにする．

**＊実装例＊**

```yaml
kind: Service
spec:
  ports:
  - targetPort: 80
```

```yaml
kind: Service
spec:
  ports:
    - targetPort: 9000
```

<br>

### selector

インバウンド通信の転送先とするPodのラベルのキー名と値を設定する．

参考：https://v1-18.docs.kubernetes.io/ja/docs/concepts/overview/working-with-objects/labels/

**＊実装例＊**

```yaml
kind: Service
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
| ClusterIP（デフォルト値） | クラスター内部からのみ |
| NodePort                  | クラスター外部/内部   |
| LoadBalancer              | クラスター外部/内部   |

<br>

## 04-08. spec（ServiceEntryの場合）

### hosts

送信可能なアウトバウンド通信のドメイン名を設定する．

```yaml
kind: ServiceEntry
spec:
  hosts:
  - '*'
```

<br>

### ports

送信可能なアウトバウンド通信のポート番号を設定する．

```yaml
kind: ServiceEntry
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
kind: ServiceEntry
spec:
  resolution: DNS # DNSサーバーから返却されたIPアドレスを許可する．
```

<br>

## 04-09. spec（StatefulSetの場合）

### volumeClaimTemplates

PersistentVolumeClaimを作成する．設定の項目は```kind: PersistentVolumeClaim```の場合と同じである．StatefulSetが削除されても，これは削除されない．

**＊実装例＊**

```yaml
kind: StatefulSet
spec:
  volumeClaimTemplates:
    - metadata:
        name: foo-slow-volume-claim
        labels:
          app: foo
      spec:
        storageClassName: slow
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 2Gi
```

