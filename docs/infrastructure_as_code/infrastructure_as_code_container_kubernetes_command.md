---
title: 【知見を記録するサイト】コマンド＠Kubernetes
description: コマンド＠Kubernetesの知見をまとめました。
---

# コマンド＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. kubectlコマンド

### apply

#### ▼ applyとは

同じ識別子（名前）のリソースが存在しない場合は、リソースを作成し、存在する場合はmanifest.yamlファイルの差分を更新する。全ての項目を更新できるわけでない。

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#apply

#### ▼ -f -R

manifest.yamlファイルを指定し、```kubectl apply```コマンドを実行する。```-R```オプションでディレクトリ内のファイルを再帰的に指定もできる。

**＊実行例＊**

```bash
# リソースを作成する。
$ kubectl apply -f <manifest.yamlファイルへのパス>

pod/foo-pod created
```

```bash
# 設定値を変更する。
$ kubectl apply -f <manifest.yamlファイルへのパス>

pod/foo-pod configured
```

```bash
# ディレクトリ内のファイルを再起的に指定する。
$ kubectl apply -f <manifest.yamlファイルのあるディレクトリ> -R

pod/foo-pod configured
```

<br>

### config

#### ▼ configとは

kubectlコマンドに関するパラメーターを操作する。

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#config

#### ▼ current-context

kubectlコマンドの宛先になっているkube-apiserverを取得する。

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

kubectlコマンドの宛先を、指定したKubernetes環境のkube-apiserverに変更する。

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
$ aws eks --region ap-northeast-1 update-kubeconfig --name foo-eks-cluster
```

#### ▼ view

パラメーターのデフォルト値が設定された```~/.kude/config```ファイルを取得する。

**＊実行例＊**

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
    server: https://n.n.n.n:8443 # kube-apiserverのIPアドレス
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

ホストPCのファイルまたはディレクトリを指定したPod内コンテナにコピーする。

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#cp

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

様々なリソースを作成する。```kubectl expose```コマンドと```kubectl run```コマンドで作成できるリソースを含む様々なものを作成できるが、オプションが少ない。そのため、```f```オプションでmanifest.yamlファイルを指定し、おぶえジェクトを作成した方が良い。同じ識別子（リソース名）のリソースが存在する場合は重複エラーになる。

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#create

**＊例＊**

manifest.yamlファイルを指定し、```kubectl create```コマンドを実行する。

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

**＊実行例＊**

```bash
$ kubectl create deployment -f ./kubernetes/foo-deployment.yaml
```

#### ▼ secret docker-registry

イメージレジストリの認証情報を持つSecretを作成する。Podと同じNamespaceに存在する必要があるため、作成時にNamespaceの指定を忘れないようにする。

参考：

- https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-secret-docker-registry-em-
- https://stackoverflow.com/questions/46297949/sharing-secret-across-namespaces

```bash
# DockerHubの場合
$ kubectl create secret docker-registry foo-secret \
    --docker-server=http://bar.example.com \
    --docker-username=bar \
    --docker-password=baz \
    --docker-email=http://baz.example.com \
    --namespace=foo-namespace
```

```bash
# ECRの場合
$ kubectl create secret docker-registry foo-secret \
    --docker-server=<アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com \
    --docker-username=AWS \
    --docker-password=$(aws ecr get-login-password --region ap-northeast-1) \
    --namespace=foo-namespace
```

#### ▼ secret generic

Secretを作成する。

参考：

- https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-secret-generic-em-
- https://qiita.com/toshihirock/items/38d09b2822a347c3f958

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

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-secret-tls-em-

```bash
$ kubectl create secret tls tls-secret --cert=./foo.cert --key=./foo.key
```

<br>

### describe

#### ▼ describeとは

リソースの詳細な情報を参照する。簡易的な情報を参照する時は、```kubectl get```コマンドを使用する。

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#describe

```bash
$ kubectl describe nodes 
```

<br>

### exec

#### ▼ execとは

指定したPod内コンテナでコマンドを実行する。

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#exec

#### ▼ -it

**＊例＊**

コンテナを指定して、デタッチモードで ```kubectl exec```コマンドを実行する。

```bash
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>] $ ls -la 
```

コンテナを指定しない場合は、デフォルトのコンテナが選択される。Podのラベル名ではなく、Pod名であることに注意する。

```bash
$ kubectl exec -it <Pod名> -- bash

Defaulted container "foo-container" out of: foo-container, bar-container
```

<br>

### expose

#### ▼ exposeとは

Serviceを作成する。

参考：

- https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#expose
- https://qiita.com/sourjp/items/f0c8c8b4a2a494a80908

#### ▼ --type、--port、--target-port

**＊例＊**

ClusterIP Serviceを作成する。

```bash
$ kubectl expose <Service名> --type=ClusterIP --port=<受信ポート番号> --target-port=<転送先ポート番号>
```

NodePort Serviceを作成する。

```bash
$ kubectl expose <Service名> --type=NodePort --port=<受信ポート番号> --target-port=<転送先ポート番号>
```

LoadBalancer Serviceを作成する。

```bash
$ kubectl expose <Service名> --type=LoadBalancer --port=<受信ポート番号> --target-port=<転送先ポート番号>
```

<br>

### get <リソース>

#### ▼ getとは

リソースの簡易的な情報を参照する。詳細な情報を参照する時は、```kubectl describe```コマンドを使用する。

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#get

**＊例＊**

指定したNodeの情報を取得する。

```bash
$ kubectl get nodes 

NAME             STATUS   ROLES                  AGE   VERSION
docker-desktop   Ready    control-plane,master   12h   v1.21.5 # マスターNode
```

**＊例＊**

指定したPodの情報を取得する。

```bash
$ kubectl get pods

NAME       READY   STATUS             RESTARTS   AGE
foo-pod    0/2     ImagePullBackOff   0          7m52s
bar-pod    2/2     Running            0          5m01s
```

**＊例＊**

指定したServiceの情報を取得する。

```bash
$ kubectl get services

NAME           TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
foo-service    ClusterIP   n.n.n.n        <none>        80/TCP    10s
kubernetes     ClusterIP   n.n.n.n        <none>        443/TCP   12h
```

**＊例＊**

Running状態のPodのみを取得する。

```bash
$ kubectl get pods | grep Running

NAME       READY   STATUS             RESTARTS   AGE
bar-pod    2/2     Running            0          5m01s
```

#### ▼ -o yaml

指定したKubernetesリソースの設定を取得し、YAML形式で出力する。

**＊例＊**

指定したSecretをYAML形式で取得する。正規表現と同様に、一部の文字列ではエスケープする必要がある。

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

**＊例＊**

Istioのバージョンを取得する。

```bash
$ kubectl get customResourceDefinition/istiooperators.install.istio.io \
    --namespace=istio-system \
    -o jsonpath="{.metadata.labels.operator\.istio\.io\/version}"
```

**＊例＊**

ロードバランサーのIPアドレスを取得する。

```bash
$ kubectl get service/istio-ingressgateway \
    --namespace=istio-system \
    -o jsonpath="{.status.loadBalancer.ingress[0].ip}"
```

#### ▼ -o wide

指定したリソースの詳細な情報を取得する。Nodeが複数がある場合に、Nodeに渡ってKubernetesリソースの情報を確認できるところがよい。

```bash
$ kubectl get pod -o wide

NAME        READY   STATUS        RESTARTS   AGE   IP                NODE       NOMINATED NODE   READINESS GATES
foo-pod     2/2     Running       0          16d   nnn.nnn.nnn.n     foo-node   <none>           <none>
bar-pod     2/2     Running       0          16d   nnn.nnn.nnn.n     bar-node   <none>           <none>
```

#### ▼ -l

特定のラベルを持つPodを取得する。Serviceのルーティング先になっているPodを知りたい時に役立つ。

```bash
# 事前にServiceのルーティング先を確認しておく。
$ kubectl describe services foo

Selector: <キー>=<値> # <--- Selectorでルーティング先のPodのラベルがわかる

$ kubectl get pods -l <キー>=<値>
```

複数のラベルをAND条件で指定することもできる。

```bash
$ kubectl get pods -l <キー>=<値>, <キー>=<値>
```

#### ▼ --selector

指定した```spec.selector```キーを持つDeploymentを取得する。

```bash
$ kubectl get deployment --selector=<キー>=<値>
```

<br>

### label

#### ▼ labelとは

指定したリソースのラベルを操作する。

#### ▼ オプション無し

**＊例＊**

指定したリソースにラベルを作成する。

```bash
$ kubectl label <リソース名> foo=bar
```

指定したリソースのラベルを削除する。

```bash
$ kubectl label <リソース名> foo-
```

#### ▼ --overwrite

**＊例＊**

指定したリソースにラベルの値を変更する。

```bash
$ kubectl label --overwrite <リソース名> foo=bar
```

<br>

### logs

#### ▼ logsとは

指定したリソースのログを取得する。

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#logs

#### ▼ -c

Pod名とコンテナ名を指定し、コンテナのログを取得する。

```bash
$ kubectl logs -n <Namespace名> <Pod名> -c <コンテナ名>

[ERROR] *****
```

**＊例＊**

Namespace、Pod名、コンテナ名を指定し、kube-proxyのログを確認する。

```bash
$ kubectl logs -n kube-system <Pod名> -c kube-proxy
```

#### ▼  --timestamps

タイムスタンプを取得する。

```bash
$ kubectl logs -n <Namespace名>  --timestamps=true <Pod名> -c <コンテナ名> 

2021/11/27 08:34:01 [ERROR] *****
```

<br>

### rollout

#### ▼ rolloutとは

Kubernetesリソースをダウンタイム無しで更新する。

参考：

- https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#rollout
- https://aaabbb-200904.hatenablog.jp/entry/2018/05/04/013848

#### ▼ restart

指定したKubernetesをローリングリスタートする。

参考：https://stackoverflow.com/questions/57559357/how-to-rolling-restart-pods-without-changing-deployment-yaml-in-kubernetes

```bash
$ kubectl rollout restart deployment -n kube-system
```

<br>

### patch

#### ▼ patchとは

JSON/YAML形式を入力値として、リソースの設定値を変更する。ただし、manifest.yamlファイルは変更されない。

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#patch

#### ▼ pv

PersistentVolumeの設定値を変更する。

**＊例＊**

削除されないボリュームを削除する。

参考：https://github.com/kubernetes/kubernetes/issues/77258#issuecomment-514543465

```bash
$ kubectl get pv \
  | tail -n+2 \
  | awk '{print $1}' \
  | xargs -I{} kubectl patch pv {} -p '{"metadata":{"finalizers": null}}'
```

<br>

### port-forward

#### ▼ port-forwardとは

ホストのポートから指定したリソースのポートに対して、ポートフォワーディングを実行する。開発環境にて、Serviceを経由せずに直接的にPodにリクエストを送信したい場合や、SQLクライアントを使用してPod内のDBコンテナにTCP/IP接続したい場合に使用する。

参考：

- https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/#forward-a-local-port-to-a-port-on-the-pod
- https://stackoverflow.com/questions/53898627/mysql-remote-connect-over-ssh-to-a-kubernetes-pod

**＊実行例＊**

```bash
$ kubectl port-forward <Pod名> <ホストポート>:<Podポート>
```

<br>

### proxy

#### ▼ proxyとは

ローカルホストとkube-apiserverの間にフォワード/リバースプロキシサーバーとして機能するリソースを作成する。kube-proxyとは異なるリソースであることに注意する。

#### ▼ --address、--accept-hosts

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#proxy

**＊実行例＊**

```bash
$ kubectl proxy --address=0.0.0.0 --accept-hosts='.*'  

Starting to serve on [::]:8001
```

<br>

### run

#### ▼ runとは

Deployment、Pod、ジョブを作成する。

参考：https://qiita.com/sourjp/items/f0c8c8b4a2a494a80908

#### ▼ --restart、--image、--port

**＊例＊**

もし```restart```オプションが```Always```なら、Deploymentが作成される。


```bash
$ kubectl run <Deployment名> --restart=Always --image=<イメージ名>:<バージョンタグ> --port=<ポート番号>
```

もし```restart```オプションが```Never```なら、Podが作成される。

```bash
$ kubectl run <Pod名> --restart=Never --image=<イメージ名>:<バージョンタグ> --port=<ポート番号>
```

もし```restart```オプションが```OnFailure```なら、ジョブが作成される。

```bash
$ kubectl run <ジョブ名> --restart=OnFailure --image=<イメージ名>:<バージョンタグ> --port=<ポート番号>
```

<br>

### top

NodeやPodのサチュレーションを取得する。

```bash
$ kubectl top node

NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%   
minikube   523m         13%    4393Mi          27%       
```

<br>

### version

kubectlとKubernetesのバージョンをそれぞれ取得する。両方のバージョンに差があっても、1つ以内のメジャーバージョンであれば許容範囲である。

参考：

- https://stackoverflow.com/questions/60991658/kubectl-what-does-client-vs-server
- https://github.com/kubernetes/kubernetes/issues/93635#issuecomment-667702194

```bash
$ kubectl version                                                             

# kubectlのバージョン
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

# Kubernetesのバージョン
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
