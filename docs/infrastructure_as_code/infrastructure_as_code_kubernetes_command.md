---
title: 【IT技術の知見】コマンド＠Kubernetes
description: コマンド＠Kubernetesの知見を記録しています。
---

# コマンド＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. kubectlコマンド

### セットアップ

#### ▼ ```~/.kube/config```ファイル

```kubectl```コマンドは、```~/.kube```以下にある```config```ファイルに設定された認証情報を基に、kube-apiserverにアクセスする。

#### ▼ configシンボリックリンク、--kubeconfig

ユーザーが、```config```ファイルを任意のディレクトリで管理する場合、シンボリックリンクを作成するか、あるいはコマンドの実行時に```config```ファイルを明示的に指定する必要がある。

> ℹ️ 参考：https://blog.inductor.me/entry/2021/03/13/205452

```bash
$ cd ~/.kube

# 現在のディレクトリに、configシンボリックリンクを作成する。
$ ln -s /etc/kubernetes/kubeconfig config
```

```bash
$ kubectl get pod --kubeconfig=/etc/kubernetes/kubeconfig
```

<br>

### apply

#### ▼ applyとは

同じ識別子（名前）のリソースが存在しない場合は、リソースを作成し、存在する場合はマニフェストファイルの差分を更新する。全ての項目を更新できるわけでない。

> ℹ️ 参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#apply

#### ▼ -f -R

kube-apiserverに送信するマニフェストファイルを指定する。```-R```オプションでディレクトリ内のファイルを再帰的に指定もできる。

**＊例＊**

マニフェストファイルを指定し、```kubectl apply```コマンドを実行する。

```bash
# リソースを作成する。
$ kubectl apply -f <マニフェストファイルへのパス>

pod/foo-pod created
```

```bash
# 設定値を変更する。
$ kubectl apply -f <マニフェストファイルへのパス>

pod/foo-pod configured
```

```bash
# ディレクトリ内のファイルを再起的に指定する。
$ kubectl apply -f <マニフェストファイルのあるディレクトリ> -R

pod/foo-pod configured
```

<br>

### config

#### ▼ configとは

```kubectl```コマンドに関するパラメーターを操作する。

> ℹ️ 参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#config

#### ▼ current-context

```kubectl```コマンドの宛先になっているkube-apiserverを取得する。

```bash
$ kubectl config current-context

minikube
```

#### ▼ get-contexts

適用できるコンテキストの一覧と現在のコンテキストを取得する。

```bash
$ kubectl config get-contexts                                                                 
CURRENT   NAME             CLUSTER          AUTHINFO         NAMESPACE
*         minikube         minikube         minikube         default
          docker-desktop   docker-desktop   docker-desktop
```

#### ▼ use-context

```kubectl```コマンドの宛先を、指定したKubernetes環境のkube-apiserverに変更する。

**＊例＊**

宛先をMinikubeのkube-apiserverに変更する。

```bash
$ kubectl config use-context minikube
```

宛先をDocker for Desktopのkube-apiserverに変更する。

```bash
$ kubectl config use-context docker-desktop
```

宛先をAWS EKSのkube-apiserverに変更する。

```bash
$ kubectl config use-context arn:aws:eks:ap-northeast-1:<アカウントID>:cluster/<Cluster名>
```

#### ▼ view

パラメーターのデフォルト値が設定された```~/.kude/config```ファイルを取得する。

**＊例＊**

```bash
$ kubectl config view

apiVersion: v1
clusters:
####################################
# Docker for Desktopのコンテキスト情報
####################################
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://kubernetes.docker.internal:6443 # kube-apiserverのIPアドレス
  name: docker-desktop
contexts:
- context:
    cluster: docker-desktop
    user: docker-desktop
  name: docker-desktop
####################################
# Minikubeのコンテキスト情報
####################################
- cluster:
    certificate-authority: /Users/h.hasegawa/.minikube/ca.crt
    extensions:
    - extension:
        last-update: Mon, 21 Mar 2022 20:47:56 JST
        provider: minikube.sigs.k8s.io
        version: v1.25.2
      name: cluster_info
    server: https://*.*.*.*:8443 # kube-apiserverのIPアドレス
  name: minikube
- context:
    cluster: minikube
    extensions:
    - extension:
        last-update: Mon, 21 Mar 2022 20:47:56 JST
        provider: minikube.sigs.k8s.io
        version: v1.25.2
      name: context_info
    namespace: default
    user: minikube
  name: minikube
####################################
# 現在のコンテキスト
####################################
current-context: docker-desktop
kind: Config
preferences: {}
users:
- name: docker-desktop
  user:
    client-certificate-data: REDACTED
    client-key-data: REDACTED
- name: minikube
  user:
    client-certificate: /Users/h.hasegawa/.minikube/profiles/minikube/client.crt
    client-key: /Users/h.hasegawa/.minikube/profiles/minikube/client.key
```

<br>

### cp

#### ▼ cpとは

ホストPCのファイルまたはディレクトリを指定したPod内のコンテナにコピーする。

> ℹ️ 参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#cp

#### ▼ オプション無し

```bash
$ kubectl cp <ホストPCのパス> <Namespace名>/<PodID>:<コンテナのパス>
```

```bash
$ kubectl cp <ホストPCのパス> <Namespace名>/<PodID>:<コンテナのディレクトリパス>/
```

<br>

### create

#### ▼ createとは

様々なリソースを作成する。```kubectl expose```コマンドと```kubectl run```コマンドで作成できるリソースを含む様々なものを作成できるが、オプションが少ない。そのため、```f```オプションで、マニフェストファイルを指定した方が良い。同じ識別子（リソース名）のリソースが存在する場合は重複エラーになる。

> ℹ️ 参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#create

**＊例＊**

マニフェストファイルを指定し、```kubectl create```コマンドを実行する。

```bash
$ kubectl create -f ./kubernetes/foo-pod.yaml

pod/foo-pod created
```

```bash
$ kubectl create -f ./kubernetes/foo-service.yaml

service/foo-service created
```

#### ▼ deployment

Pod数を維持管理するReplicaSetを作成する。Podを削除するためには、Deployment自体を削除しなければならない。

**＊例＊**

```bash
$ kubectl create deployment -f ./kubernetes/foo-deployment.yaml
```

#### ▼ secret docker-registry

イメージレジストリの認証情報を持つSecretを作成する。Podと同じNamespaceに属するする必要があるため、作成時にNamespaceの指定を忘れないようにする。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-secret-docker-registry-em-
> - https://stackoverflow.com/questions/46297949/sharing-secret-across-namespaces

```bash
# DockerHubの場合
$ kubectl create secret docker-registry foo-secret \
    --docker-server=http://bar.example.com \
    --docker-username=bar \
    --docker-password=baz \
    --docker-email=http://baz.example.com \
    -n foo-namespace
```

#### ▼ secret generic

Secretを作成する。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-secret-generic-em-
> - https://qiita.com/toshihirock/items/38d09b2822a347c3f958

**＊例＊**

指定した```.env```ファイルからSecretを作成する。

```bash
$ kubectl create secret generic foo-secret --from-env-file=./foo/.env

secret/foo-secret created
```

指定した```.env```ファイル以外からSecretを作成する。

```bash
$ kubectl create secret generic foo-secret --from-file=./foo/values.txt

secret/foo-secret created
```

キー名と値からSecretを作成する。

```bash
$ kubectl create secret generic foo-secret --from-literal=username="bar" --from-literal=password="baz"

secret/foo-secret created
```

#### ▼ secret tls

SSL証明書を持つSecretを作成する。

> ℹ️ 参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-secret-tls-em-

```bash
$ kubectl create secret tls tls-secret --cert=./foo.cert --key=./foo.key
```

<br>

### describe

#### ▼ describeとは

リソースの詳細な情報を参照する。簡易的な情報を参照する時は、```kubectl get```コマンドを使用する。

> ℹ️ 参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#describe

**＊例＊**

```bash
$ kubectl describe node
```

```grep```コマンドを使用して、PodがスケジューリングされているワーカーNodeを取得する。

```bash
$ kubectl describe pod <Pod名> | grep Node:
```

**＊例＊**

```bash
$ kubectl describe clusterrole foo-cluster-role

Name:         anthos-baremetal-operator
Labels:       <none>
Annotations:  <none>
PolicyRule:
  Resources               Non-Resource URLs  Resource Names  Verbs
  ---------               -----------------  --------------  -----
  pods                    []                 []              [get list watch]
  deployments.apps        []                 []              [create delete get list patch update watch]
...

```

#### ▼ -A

**＊例＊**

全てのワーカーNodeの詳細な情報を取得する。```grep```コマンドを使用し、必要な情報のみを確認する。

```bash
$ kubectl describe node -A | grep -e Name -e cpu

Name:               foo-node
  cpu:                8
  cpu:                7510m
  cpu                1050m (13%)  4850m (64%) # <--- ワーカーNode全体の使用率
Name:               bar-node
  cpu:                4
  cpu:                3520m
  cpu                2183m (62%)  4950m (140%) # <--- ワーカーNode全体の使用率
Name:               baz-node
  cpu:                8
  cpu:                7510m
  cpu                1937m (25%)  10245m (136%) # <--- ワーカーNode全体の使用率
```


<br>

### drain

#### ▼ drainとは

ワーカーNodeへの新しいPodのスケジューリングを無効化（```kubectl cordon```コマンドを実行）し、加えて既存のPodを退避させる。ワーカーNodeが他に存在すれば、そのワーカーNode上でPodが再作成される。

> ℹ️ 参考：
>
> - https://cstoku.dev/posts/2018/k8sdojo-21/
> - https://medium.com/@yanglyu5201/kubernetes-drain-node-vs-cordon-node-8b979eb7bbbe

```bash
$ kubectl drain <ワーカーNode名>
```

<br>

### edit

#### ▼ editとは

Kubernetesリソースの設定値をapplyせずに変更する。Podの設定値は直接的に変更できず、代わりにDeploymentやStatefulSet上での設定値を変更する必要がある。

> ℹ️ 参考：https://github.com/kubernetes/kubernetes/issues/24913

```bash
$ kubectl edit <Pod以外のリソース名>
```

<br>

### exec

#### ▼ execとは

指定したPod内のコンテナでコマンドを実行する。

> ℹ️ 参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#exec

#### ▼ -it

**＊例＊**

コンテナを指定して、デタッチモードで ```kubectl exec```コマンドを実行する。

```bash
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>] $ ls -la 
```

コンテナを指定しない場合は、デフォルトのコンテナが選択される。Podの```metadata.labels```キーではなく、Pod名であることに注意する。

```bash
$ kubectl exec -it <Pod名> -- bash

Defaulted container "foo-container" out of: foo-container, bar-container
```

<br>

### expose

#### ▼ exposeとは

Serviceを作成する。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#expose
> - https://qiita.com/sourjp/items/f0c8c8b4a2a494a80908

#### ▼ --type、--port、--target-port

**＊例＊**

ClusterIP Serviceを作成する。

```bash
$ kubectl expose <Service名> \
    --type=ClusterIP \
    --port=<受信ポート番号> \
    --target-port=<転送先ポート番号>
```

NodePort Serviceを作成する。

```bash
$ kubectl expose <Service名> \
    --type=NodePort \
    --port=<受信ポート番号> \
    --target-port=<転送先ポート番号>
```

LoadBalancer Serviceを作成する。

```bash
$ kubectl expose <Service名> \
    --type=LoadBalancer \
    --port=<受信ポート番号> \
    --target-port=<転送先ポート番号>
```

<br>

### get <リソース>

#### ▼ getとは

リソースの簡易的な情報を参照する。詳細な情報を参照する時は、```kubectl describe```コマンドを使用する。

> ℹ️ 参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#get

**＊例＊**

特定のNamespaceの全てのKubernetesリソースを取得する。

> ℹ️ 参考：https://text.superbrothers.dev/190616-kubectl-get-all-does-not-include-most-resources/

```bash
$ kubectl get "$(kubectl api-resources --namespaced=true --verbs=list -o name | tr "\n" "," | sed -e 's/,$//')" -n foo-namespace
```

**＊例＊**

全てのNodeワーカーNodeの情報を取得する。

```bash
$ kubectl get node 

NAME      STATUS   ROLES                  AGE   VERSION
foo-node  Ready    worker                 12h   v1.22.0 # ワーカーNode
bar-node  Ready    worker                 12h   v1.22.0 # 同上
baz-node  Ready    worker                 12h   v1.22.0 # 同上
# qux-node  Ready    control-plane,master   12h   v1.22.0 # セルフマネージドなコントロールプレーンNodeを使用する場合
```

**＊例＊**

指定したPodの情報を取得する。

```bash
$ kubectl get pod

NAME       READY   STATUS             RESTARTS   AGE
foo-pod    0/2     ImagePullBackOff   0          7m52s
bar-pod    2/2     Running            0          5m01s
```

**＊例＊**

指定したServiceの情報を取得する。

```bash
$ kubectl get service

NAME           TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
foo-service    ClusterIP   *.*.*.*        <none>        80/TCP    10s
kubernetes     ClusterIP   *.*.*.*        <none>        443/TCP   12h
```

**＊例＊**

```grep```コマンドを使用して、RunningフェーズのPodのみを取得する。

```bash
$ kubectl get pod | grep -e NAME -e Running

NAME       READY   STATUS             RESTARTS   AGE
bar-pod    2/2     Running            0          5m01s
```

#### ▼ -A

指定したKubernetesリソースをNamespaceに関係なく取得する。

```bash
$ kubectl get pod -A
```

```grep```コマンドを使用して、特定のワーカーNodeのみを取得する。

```bash
$ kubectl get pod -A -o wide | grep -e NAMESPACE -e <ワーカーNode名>
```

#### ▼ -o yaml

指定したKubernetesリソースの設定を取得し、```.yaml```形式で出力する。

**＊例＊**

指定したSecretを```.yaml```形式で取得する。正規表現と同様に、一部の文字列ではエスケープする必要がある。

```bash
$ kubectl get secret <Secret名> -o yaml

apiVersion: v1
kind: Secret
metadata:
  creationTimestamp: "2021-12-00T00:00:00Z"
  name: swp-secret
  namespace: default
  resourceVersion: "18329"
  uid: 507e3126-c03b-477d-9fbc-9434e7aa1920
type: Opaque
data:
  FOO: ***** # base64方式エンコード値
  BAR: *****
  BAZ: *****
```

#### ▼ -o jsonpath

指定したKubernetesリソースの特定の設定を出力する。

**＊例＊**

ロードバランサーのIPアドレスを取得する。

```bash
$ kubectl get service istio-ingressgateway \
    -n istio-system \
    -o jsonpath="{.status.loadBalancer.ingress[0].ip}"
```

**＊例＊**

Pod内のコンテナを取得する。

```bash
# 特定のPodを対象とする。
$ kubectl get pod foo-pod \
    -n foo-namespace \
    -o jsonpath="{.spec.containers[*].name}" | sed 's/ /\n/g' && echo

# 全てのPodを対象とする。
$ kubectl get pod \
    -n foo-namespace \
    -o jsonpath="{.items[*].spec.containers[*].name}" | sed 's/ /\n/g' && echo
```


**＊例＊**

IstioOperatorに定義されたIstioのバージョンを取得する。

```bash
$ kubectl get istiooperator \
    -n istio-system \
    -o jsonpath="{.metadata.labels.operator\.istio\.io\/version}"
```

#### ▼ -o wide

指定したリソースの詳細な情報を取得する。ワーカーNodeが複数がある場合、ワーカーNodeに渡ってKubernetesリソースの情報を確認できるところがよい。

**＊例＊**

Podの詳細な情報を取得する。

```bash
$ kubectl get pod -o wide

NAMESPACE   NAME        READY   STATUS        RESTARTS   AGE   IP          NODE       NOMINATED NODE   READINESS GATES
foo         foo-pod     2/2     Running       0          16d   *.*.*.*     foo-node   <none>           <none>
bar         bar-pod     2/2     Running       0          16d   *.*.*.*     bar-node   <none>           <none>
baz         baz-pod     2/2     Running       0          16d   *.*.*.*     bar-node   <none>           <none>
```

**＊例＊**

```grep```コマンドを使用して、特定のPodのみを取得する。

```bash
$ kubectl get pod -o wide | grep -e NAMESPACE -e foo

NAMESPACE   NAME        READY   STATUS        RESTARTS   AGE   IP          NODE       NOMINATED NODE   READINESS GATES
foo         foo-pod     2/2     Running       0          16d   *.*.*.*     foo-node   <none>           <none>
```

```grep```コマンドを使用して、特定のServiceのみを取得する。


```bash
$ kubectl get service -o wide | grep -e NAMESPACE -e foo
NAMESPACE   NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)       AGE   SELECTOR 
foo         foo-service  NodePort    *.*.*.*      <none>        443:443/TCP   2d    app.kubernetes.io/instance=prd-foo-app
```

**＊例＊**

ワーカーNodeの詳細な情報を取得する。

```bash
$ kubectl get node -o wide

NAME       STATUS   ROLES                  AGE   VERSION   INTERNAL-IP     EXTERNAL-IP   OS-IMAGE         KERNEL-VERSION       CONTAINER-RUNTIME
foo-node   Ready    worker                 17h   v1.22.0   *.*.*.*         <none>        Amazon Linux 2   1.0.0.amzn2.x86_64   containerd://1.0.0
bar-node   Ready    worker                 17h   v1.22.0   *.*.*.*         <none>        Amazon Linux 2   1.0.0.amzn2.x86_64   containerd://1.0.0
baz-node   Ready    worker                 17h   v1.22.0   *.*.*.*         <none>        Amazon Linux 2   1.0.0.amzn2.x86_64   containerd://1.0.0
# qux-node   Ready    control-plane,master   17h   v1.22.0   *.*.*.*         <none>        Amazon Linux 2   1.0.0.amzn2.x86_64   containerd://1.0.0 # セルフマネージドなコントロールプレーンNodeを使用する場合
```

#### ▼ -l

特定の```metadata.labels```キーの値を持つKubernetesリソースを取得する。

```bash
$ kubectl get pod -l <キー>=<値>
```

複数の```metadata.labels```キーをAND条件で指定することもできる。

```bash
$ kubectl get pod -l <キー>=<値>,<キー>=<値>
```

```metadata.labels```キーの値をOR条件で指定することもできる。


```bash
$ kubectl get pod -l <キー>=<値>,<キー>=<値>
```

```bash
$ kubectl get pod -l '<キー> in (<値>,<値>)'
```

**＊例＊**

```metadata.labels.topology.kubernetes.io/zone```キーの値が```ap-northeast-1a```であるワーカーNodeを取得する。

```bash
$ kubectl get node -l topology.kubernetes.io/zone=ap-northeast-1a
```

#### ▼ -L

特定の```metadata.labels```キーを持つKubernetesリソースを取得する。小文字の```-l```オプションもあるが、こちらは値まで絞り込みたい時に使用する。該当のキーがない場合は、空欄で表示される。

```bash
$ kubectl get <Kubernetesリソースの種類> -L <metadata.labelsキー>
```

**＊例＊**

AWS EKSにて、Nodeグループの種類を確認するため、```eks.amazonaws.com/nodegroup```キーを取得する。

```bash
$ kubectl get node -L eks.amazonaws.com/nodegroup

NAME        STATUS   ROLES    AGE    VERSION       NODEGROUP
foo-node    Ready    <none>   31d    v1.22.0-eks   service
bar-node    Ready    <none>   41d    v1.22.0-eks   ingress
baz-node    Ready    <none>   6d8h   v1.22.0-eks   collector
qux-node    Ready    <none>   6d8h   v1.22.0-eks   mesh
...
```

**＊例＊**

ワーカーNodeが作成されたAWSリージョンを確認するため、```topology.kubernetes.io/zone```キーを取得する。

```bash
$ kubectl get node -L topology.kubernetes.io/zone

NAME       STATUS   ROLES    AGE     VERSION   ZONE
foo-node   Ready    <none>   18h     v1.22.0   ap-northeast-1a
bar-node   Ready    <none>   18h     v1.22.0   ap-northeast-1c
baz-node   Ready    <none>   18h     v1.22.0   ap-northeast-1d
```


**＊例＊**

istioのコンテナ注入が有効されているNamespaceを確認するため、```istio.io/rev```キーを取得する。

```bash
$ kubectl get namespace -L istio.io/rev

NAME                   STATUS   AGE     REV
foo-namespace          Active   145d    1-0-0
bar-namespace          Active   145d           # キーが設定されていないNamespace
baz-namespace          Active   145d           # 同上
```

**＊例＊**

特定のKubernetesリソースがどのように管理されているかを取得する。公式のHelmチャートには、Deployment、Daemonset、StatefulSet、にタグがついていることが多い。

```bash
# argocd.argoproj.io/instance：ArgoCDのApplication名
# app.kubernetes.io/managed-by：テンプレート管理のツール名
# helm.sh/chart：テンプレート管理ツールがHelmの場合に、チャート名
# release：Helmチャートのリリース名
$ kubectl get -A <Kubernetesリソース> \
    -L argocd.argoproj.io/instance \
    -L app.kubernetes.io/managed-by \
    -L helm.sh/chart \
    -L release
```


#### ▼ --selector

指定した```spec.selector```キーを持つDeploymentを取得する。

```bash
$ kubectl get deployment --selector<キー>=<値>
```

#### ▼ --watch

指定したPodの情報を継続的に取得する。

> ℹ️ 参考：https://qiita.com/kyontra/items/b435ab6e33ffbed51f10

```bash
$ kubectl get pod --watch
```

<br>

### label

#### ▼ labelとは

指定したリソースの```metadata.labels```キーを操作する。

#### ▼ オプション無し（キーの追加）

指定したリソースに```metadata.labels```キーを作成する。

```bash
$ kubectl label <リソース名> foo=bar
```

#### ▼ オプション無し（キーの削除）

指定したリソースの```metadata.labels```キーを削除する。

```bash
$ kubectl label <リソース名> foo-
```

**＊例＊**

```bash
$ kubectl label namespace default istio.io/rev-
```

#### ▼ --overwrite

指定したリソースに```metadata.labels```キーを上書きする。

```bash
$ kubectl label --overwrite <リソースの種類> <リソース名> foo=bar
```

**＊例＊**

```istio-injection```キーを```istio.io/rev```キー（値は```1-0-0```）に上書きする。

```bash
$ kubectl label --overwrite namespace foo istio.io/rev=1-0-0 istio-injection-
```

<br>

### logs

#### ▼ logsとは

指定したリソースのログを取得する。

> ℹ️ 参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#logs

#### ▼ -c

Pod名とコンテナ名を指定し、コンテナのログを取得する。

```bash
$ kubectl logs -n <Namespace名> <Pod名> -c <コンテナ名> | grep -i error

[ERROR] *****
```

**＊例＊**

Namespace名、Pod名、コンテナ名を指定し、kube-proxyのログを確認する。

```bash
$ kubectl logs -n kube-system <Pod名> -c kube-proxy | grep -i error
```

#### ▼ -f

ログを継続的に取得する。

```bash
$ kubectl logs -f <Pod名> | grep -i error
```

#### ▼  --timestamps

タイムスタンプを取得する。

```bash
$ kubectl logs -n <Namespace名>  --timestamps=true <Pod名> -c <コンテナ名> | grep -i error

2021/11/27 08:34:01 [ERROR] *****
```

<br>

### replace

#### ▼ replaceとは

Kubernetesリソースを一度削除し、別のマニフェストファイルで再作成する。

> ℹ️ 参考：https://stackoverflow.com/questions/47241626/what-is-the-difference-between-kubectl-apply-and-kubectl-replace

```bash
$ kubectl replace -f foo.yaml
```

<br>

### rollout

#### ▼ rolloutとは

Deployment、DamonSet、StatefulSet、で複製されたPodを操作する。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#rollout
> - https://aaabbb-200904.hatenablog.jp/entry/2018/05/04/013848

#### ▼ restart

レプリカのPodを再スケジューリングする。PodのVolume（例：ConfigMap、Secret、PersistentVolume、persistentVolumeClaim）の設定を変更した後に、Podに再び読み込ませるために役立つ。

> ℹ️ 参考：
>
> - https://shepherdmaster.hateblo.jp/entry/2021/03/14/100000
> - https://amateur-engineer-blog.com/kubernetes-deployment-rollout/#toc16

**＊例＊**


```bash
# Deployment配下のPodを再スケジューリングする。
$ kubectl rollout restart deployment grafana -n prometheus
```

```bash
# DaemonSet配下のPodを再スケジューリングする。
$ kubectl rollout restart daemonset fluentd -n fluentd
```

<br>

### patch

#### ▼ patchとは

JSON/```.yaml```形式を入力値として、リソースの設定値を変更する。ただし、マニフェストファイルは変更されない。

> ℹ️ 参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#patch

#### ▼ pv

PersistentVolumeの設定値を変更する。

**＊例＊**

削除されないボリュームを削除する。

> ℹ️ 参考：https://github.com/kubernetes/kubernetes/issues/77258#issuecomment-514543465

```bash
$ kubectl get pv \
    | tail -n+2 \
    | awk '{print $1}' \
    | xargs -I{} kubectl patch pv {} -p '{"metadata":{"finalizers": null}}'
```

<br>

### port-forward

#### ▼ port-forwardとは

ポートフォワーディングを実行し、ホストのポートからPodにアクセスできるようにする。Podを直接的に指定する場合と、他のKubernetesリソース（例：Service、Deployment）の情報を使用して、Podを指定する方法がある。この時、通信自体は他のKubernetesリソースを経由しているわけではないことに注意する。開発環境にて、Serviceを介さずに直接的にPodにリクエストを送信したい場合や、SQLクライアントを使用してPod内のDBコンテナにTCP/IP接続したい場合に使用する。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/#forward-a-local-port-to-a-port-on-the-pod
> - https://stackoverflow.com/questions/53898627/mysql-remote-connect-over-ssh-to-a-kubernetes-pod
> - https://qiita.com/superbrothers/items/0dca5d2a10727fc14734#%E3%82%AF%E3%83%A9%E3%82%B9%E3%82%BF%E5%A4%96%E3%81%8B%E3%82%89-clusterip-%E3%81%AB%E7%B4%90%E3%81%A5%E3%81%8F-pod-%E3%81%AB%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%99%E3%82%8B


```bash
# Podを直接的に指定する場合
$ kubectl port-forward pod/<Pod名> <ホストポート番号>:<Podのポート番号>

# Serviceの情報を使用して、Podを指定する場合
$ kubectl port-forward svc/<Service名> <ホストポート番号>:<Serviceのポート番号>

# ホストポートを介してPodのポートにアクセスする。
$ curl http://127.0.0.1:<ホストポート番号>
```

<br>

### proxy

#### ▼ proxyとは

kube-apiserverの前段にフォワード/リバースプロキシサーバーとして動作するリソースを作成する。kube-proxyとは異なるリソースであることに注意する。

#### ▼ --address、--accept-hosts

> ℹ️ 参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#proxy

**＊例＊**

```bash
$ kubectl proxy --address=0.0.0.0 --accept-hosts='.*'  

Starting to serve on [::]:8001
```

<br>

### run

#### ▼ runとは

Deployment、Pod、Jobを作成する。

> ℹ️ 参考：https://qiita.com/sourjp/items/f0c8c8b4a2a494a80908

#### ▼ --restart、--image、--port

**＊例＊**

もし```restart```オプションが```Always```なら、Deploymentを作成する。


```bash
$ kubectl run <Deployment名> --restart=Always --image=<コンテナイメージ名>:<バージョンタグ> --port=<ポート番号>
```

もし```restart```オプションが```Never```なら、Podを作成する。

```bash
$ kubectl run <Pod名> --restart=Never --image=<コンテナイメージ名>:<バージョンタグ> --port=<ポート番号>
```

もし```restart```オプションが```OnFailure```なら、Jobを作成する。

```bash
$ kubectl run <Job名> --restart=OnFailure --image=<コンテナイメージ名>:<バージョンタグ> --port=<ポート番号>
```

#### ▼ Podのアウトバウンド通信のデバッグ

```kubectl exec```コマンドが運用的に禁止されているような状況がある。そのような状況下で、シングルワーカーNodeの場合は、```kubectl run```コマンドで、```--rm```オプションを有効化しつつ、Clusterネットワーク内に```curl```コマンドによる検証用のPodを一時的に新規作成する。マルチワーカーNodeの場合は、（たぶん）名前が一番昇順のワーカーNode上でPodが作成されてしまい、ワーカーNodeを指定できない。そのため、代わりに```kubectl debug```コマンドを使用する。ただし、```kubectl debug```コマンドで作成されたPodは、使用後に手動で削除する必要がある。

> ℹ️ 参考：
>
> - https://qiita.com/tkusumi/items/a62c209972bd0d4913fc
> - https://scrapbox.io/jiroshin-knowledge/kubernetes_cluster%E3%81%ABcurl%E3%81%AEPod%E3%82%92%E7%AB%8B%E3%81%A6%E3%81%A6%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A%E3%83%AD%E3%82%B0%E3%82%A4%E3%83%B3%E3%81%99%E3%82%8B%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89

ネットワークのトラブルシューティングに役立つツールがインストールされているイメージがいくつかある。


> ℹ️ 参考：
>
> - https://hub.docker.com/r/praqma/network-multitool
> - https://hub.docker.com/r/nicolaka/netshoot

```bash
# シングルワーカーNodeの場合

# curl送信用のコンテナを作成する。
# rmオプションを指定し、使用後に自動的に削除されるようにする。
$ kubectl run \                
    -n default \
    -it multitool \
    --image=praqma/network-multitool \
    --rm \
    --restart=Never \
    -- /bin/bash

# curlコマンドでデバッグする。
[root@<Pod名>:~] $ curl -X GET https://<Serviceの完全修飾ドメイン名やIPアドレス>

# tcptracerouteコマンドでデバッグする。
[root@<Pod名>:~] $ tcptraceroute <Serviceの完全修飾ドメイン名やIPアドレス>

# mtrコマンドでデバッグする。
[root@<Pod名>:~] $ mtr <Serviceの完全修飾ドメイン名やIPアドレス>
```

```bash
# マルチワーカーNodeの場合

# Podが稼働するワーカーNodeを確認する。
$ kubectl get pod <Pod名> -o wide

# 指定したワーカーNode上で、curl送信用のコンテナを作成する。
# rmオプションはない。
$ kubectl debug node/<ワーカーNode名> \                
    -n default \
    -it \
    --image=praqma/network-multitool

[root@<Pod名>:~] $exit

# 使用後は手動で削除する。
$ kubectl delete -n default node-debugger-*****
```

<br>

### taint

#### ▼ taintとは

ワーカーNodeにTaintを付与する。エフェクトごとに、Tolerationが付与されたPodのスケジューリング方法が異なる。

| エフェクト | 説明                                                                                                                           |
|-------|------------------------------------------------------------------------------------------------------------------------------|
| NoExecute      | Tolerationが付与されたPodしかスケジューリングできない。付与したPodがすでに稼働している場合、そのPodも再スケジューリングする。                                                     |
| NoSchedule      | Tolerationが付与されたPodしかスケジューリングできない。付与したPodがすでに稼働している場合、そのPodは再スケジューリングしない。                                                    |
| PreferNoSchedule      | Tolerationが付与されたPodをスケジューリングするが、いずれのPodにもこれが付与されていなければ、付与されていないPodもスケジューリングする。付与したPodがすでにスケジューリングされている場合、そのPodは再スケジューリングしない。 |


**＊例＊**

ワーカーNodeにTaint（```app=batch:NoSchedule```）を付与する。

```bash
$ kubectl taint node foo-node app=batch:NoSchedule
```

これにより、以下の```spec.tolerations```キーが付与されたPodしかスケジューリングできない。

> ℹ️ 参考：https://qiita.com/sheepland/items/8fedae15e157c102757f#pod%E3%81%ABtolerations%E3%82%92%E8%A8%AD%E5%AE%9A%E3%81%99%E3%82%8B%E4%BE%8B

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:dev
      imagePullPolicy: IfNotPresent
      ports:
        - containerPort: 8080
  tolerations:
    - key: app
      value: batch
      operator: Equal
      effect: NoSchedule
```

**＊例＊**

コントロールプレーンNodeとして扱うTaintを付与する。キー名のみ指定し、値は指定していない。

```bash
$ kubectl taint node foo-node node-role.kubernetes.io/master:NoSchedule
```

これにより、以下の```spec.tolerations```キーが付与されたPodしかスケジューリングできない。

> ℹ️ 参考：https://qiita.com/sheepland/items/8fedae15e157c102757f#pod%E3%81%ABtolerations%E3%82%92%E8%A8%AD%E5%AE%9A%E3%81%99%E3%82%8B%E4%BE%8B

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-gin
      image: foo-gin:dev
      imagePullPolicy: IfNotPresent
      ports:
        - containerPort: 8080
  tolerations:
    - key: node-role.kubernetes.io/master
      operator: Exists
      effect: NoSchedule
```

#### ▼ ```-```（ラベル値のハイフン）

指定したワーカーNodeからTaintを削除する。

> ℹ️ 参考：https://garafu.blogspot.com/2019/06/asign-pod-strategy-2.html#taints-setdel

**＊例＊**

```bash
$ kubectl taint node foo-node app=batch:NoSchedule-
```

<br>

### top

ワーカーNodeやPodのサチュレーションを取得する。

```bash
$ kubectl top node

NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%   
minikube   523m         13%    4393Mi          27%       
```

<br>

### version

kubectlとKubernetesのバージョンをそれぞれ取得する。両方のバージョンに差があっても、1つ以内のメジャーバージョンであれば許容範囲である。

> ℹ️ 参考：
>
> - https://stackoverflow.com/questions/60991658/kubectl-what-does-client-vs-server
> - https://github.com/kubernetes/kubernetes/issues/93635#issuecomment-667702194

```bash
$ kubectl version                                                             

# kubectlコマンドのバージョン
Client Version: version.Info{
  Major:"1",
  Minor:"22",
  GitVersion:"v1.22.4",
  GitCommit:"*****",
  GitTreeState:"clean",
  BuildDate:"2021-11-17T15:41:42Z",
  GoVersion:"go1.16.10",
  Compiler:"gc",
  Platform:"darwin/amd64"
}

# kube-apiserverのバージョン
Server Version: version.Info{
  Major:"1",
  Minor:"22",
  GitVersion:"v1.22.3",
  GitCommit:"*****",
  GitTreeState:"clean",
  BuildDate:"2021-10-27T18:35:25Z",
  GoVersion:"go1.16.9",
  Compiler:"gc",
  Platform:"linux/amd64"
}
```

<br>
