---
title: 【知見を記録するサイト】コマンド＠Kubernetes
description: コマンド＠Kubernetesの知見をまとめました．
---

# コマンド＠Kubernetes

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. kubectlコマンド

### apply

#### ▼ applyとは

同じ識別子（名前）のリソースが存在しない場合は，リソースを作成し，存在する場合はマニフェストファイルの差分を更新する．全ての項目を更新できるわけでない．

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#apply

#### ▼ -f -R

マニフェストファイルを指定し，```kubectl apply```コマンドを実行する．```-R```オプションでディレクトリ内のファイルを再帰的に指定もできる．

**＊例＊**

```bash
# リソースを作成する．
$ kubectl apply -f <マニフェストファイルへのパス>

pod/foo-pod created
```

```bash
# 設定値を変更する．
$ kubectl apply -f <マニフェストファイルへのパス>

pod/foo-pod configured
```

```bash
# ディレクトリ内のファイルを再起的に指定する．
$ kubectl apply -f <マニフェストファイルのあるディレクトリ> -R

pod/foo-pod configured
```

<br>

### config

#### ▼ configとは

kubectlコマンドに関するパラメーターを操作する．

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#config

#### ▼ current-context

kubectlコマンドの宛先になっているkube-apiserverを表示する．

```bash
$ kubectl config current-context

minikube
```

#### ▼ get-contexts

適用可能なコンテキストの一覧と現在のコンテキストを表示する．

```bash
$ kubectl config get-contexts                                                                 
CURRENT   NAME             CLUSTER          AUTHINFO         NAMESPACE
*         minikube         minikube         minikube         default
          docker-desktop   docker-desktop   docker-desktop
```

#### ▼ use-context

kubectlコマンドの宛先を，指定したKubernetes環境のkube-apiserverに変更する．

**＊例＊**

宛先をMinikubeのkube-apiserverに変更する．

```bash
$ kubectl config use-context minikube
```

宛先をDocker for Desktopのkube-apiserverに変更する．

```bash
$ kubectl config use-context docker-desktop
```

宛先をAWS EKSのkube-apiserverに変更する．

```bash
$ aws eks --region ap-northeast-1 update-kubeconfig --name foo-eks-cluster
```

#### ▼ view

パラメーターのデフォルト値が設定された```~/.kude/config```ファイルを表示する．

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

ホストPCのファイルまたはディレクトリを指定したPod内のコンテナにコピーする．

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#cp

#### ▼ オプション無し

```bash
$ kubectl cp <ホストPCのファイルパス> <名前空間名>/<PodID>:<コンテナのファイルパス>
```

```bash
$ kubectl cp <ホストPCのファイルパス> <名前空間名>/<PodID>:<コンテナのディレクトリパス>/
```

<br>

### create

#### ▼ createとは

様々なリソースを作成する．```kubectl expose```コマンドと```kubectl run```コマンドで作成できるリソースを含む様々なものを作成できるが，オプションが少ない．そのため，```f```オプションでマニフェストファイルを指定し，おぶえジェクトを作成した方が良い．同じ識別子（リソース名）のリソースが存在する場合は重複エラーになる．

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#create

**＊例＊**

マニフェストファイルを指定し，```kubectl create```コマンドを実行する．

```bash
$ kubectl create -f ./kubernetes/foo-pod.yaml

pod/foo-pod created
```

```bash
$ kubectl create -f ./kubernetes/foo-service.yaml

service/foo-service created
```

#### ▼ deployment

Pod数を維持管理するReplicaSetを作成する．Podを削除するためには，Deployment自体を削除しなければならない．

**＊例＊**

```bash
$ kubectl create deployment -f ./kubernetes/foo-deployment.yaml
```

#### ▼ secret generic

Secretを作成する．

参考：

- https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-secret-generic-em-
- https://qiita.com/toshihirock/items/38d09b2822a347c3f958

**＊例＊**

指定した```.env```ファイルからSecretを作成する．

```bash
$ kubectl create secret generic foo-secret --from-env-file=./foo/.env

secret/foo-secret created
```

指定した```.env```ファイル以外からSecretを作成する．

```bash
$ kubectl create secret generic foo-secret --from-file=./foo/values.txt

secret/foo-secret created
```

キー名と値からSecretを作成する．

```bash
$ kubectl create secret generic foo-secret --from-literal=username="test" --from-literal=password="test"

secret/foo-secret created
```

<br>

### describe

#### ▼ describeとは

リソースの詳細な情報を参照する．簡易的な情報を参照する時は，```kubectl get```コマンドを使用する．

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#describe

```bash
$ kubectl describe nodes 
```

<br>

### exec

#### ▼ execとは

指定したPod内のコンテナでコマンドを実行する．

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#exec

#### ▼ -it

**＊例＊**

コンテナを指定して，デタッチモードで ```kubectl exec```コマンドを実行する．

```bash
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>] $ ls -la 
```

コンテナを指定しない場合は，デフォルトのコンテナが選択される．Podのラベル名ではなく，Pod名であることに注意する．

```bash
$ kubectl exec -it <Pod名> -- bash

Defaulted container "foo-container" out of: foo-container, bar-container
```

<br>

### expose

#### ▼ exposeとは

Serviceを作成する．

参考：

- https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#expose
- https://qiita.com/sourjp/items/f0c8c8b4a2a494a80908

#### ▼ --type，--port，--target-port

**＊例＊**

ClusterIP Serviceを作成する．

```bash
$ kubectl expose <Service名> --type=ClusterIP --port=<受信ポート番号> --target-port=<転送先ポート番号>
```

NodePort Serviceを作成する．

```bash
$ kubectl expose <Service名> --type=NodePort --port=<受信ポート番号> --target-port=<転送先ポート番号>
```

LoadBalancer Serviceを作成する．

```bash
$ kubectl expose <Service名> --type=LoadBalancer --port=<受信ポート番号> --target-port=<転送先ポート番号>
```

<br>

### get <リソース>

#### ▼ getとは

リソースの簡易的な情報を参照する．詳細な情報を参照する時は，```kubectl describe```コマンドを使用する．

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#get

**＊例＊**

指定したNodeの情報を表示する．

```bash
$ kubectl get nodes 

NAME             STATUS   ROLES                  AGE   VERSION
docker-desktop   Ready    control-plane,master   12h   v1.21.5 # マスターNode
```

指定したPodの情報を表示する．

```bash
$ kubectl get pods

NAME       READY   STATUS             RESTARTS   AGE
foo-pod    0/2     ImagePullBackOff   0          7m52s
```

**＊例＊**

指定したServiceの情報を表示する．

```bash
$ kubectl get services

NAME           TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
foo-service    ClusterIP   n.n.n.n        <none>        80/TCP    10s
kubernetes     ClusterIP   n.n.n.n        <none>        443/TCP   12h
```

#### ▼ -o

**＊例＊**

指定したSecretをYAML形式で表示する．正規表現と同様に，一部の文字列ではエスケープする必要がある．

```bash
$ kubectl get secret <Secret名> -o yaml

apiVersion: v1
data:
  FOO: ***** # base64方式エンコード値
  BAR: *****
  BAZ: *****
kind: Secret
metadata:
  creationTimestamp: "2021-12-00T00:00:00Z"
  name: swp-secret
  namespace: default
  resourceVersion: "18329"
  uid: 507e3126-c03b-477d-9fbc-9434e7aa1920
type: Opaque
```

**＊例＊**

Istioのバージョンを取得する．

```bash
$ kubectl get customResourceDefinition/istiooperators.install.istio.io \
  --namespace=istio-system \
  -o jsonpath="{.metadata.labels.operator\.istio\.io\/version}"
```

**＊例＊**

ロードバランサーのIPアドレスを取得する．

```bash
$ kubectl get service/istio-ingressgateway \
  --namespace=istio-system \
  -o jsonpath="{.status.loadBalancer.ingress[0].ip}"
```



<br>

### label

#### ▼ labelとは

指定したリソースのラベルを操作する．

#### ▼ オプション無し

**＊例＊**

指定したリソースにラベルを作成する．

```bash
$ kubectl label <リソース名> foo=bar
```

指定したリソースのラベルを削除する．

```bash
$ kubectl label <リソース名> foo-
```

#### ▼ --overwrite

**＊例＊**

指定したリソースにラベルの値を変更する．

```bash
$ kubectl label --overwrite <リソース名> foo=bar
```

<br>

### logs

#### ▼ logsとは

指定したリソースのログを表示する．

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#logs

Pod名とコンテナ名を指定し，コンテナのログを表示する．

```bash
$ kubectl logs -n <名前空間名> <Pod名> -c <コンテナ名>

2021/11/27 08:34:01 [emerg] *****
```

名前空間，Pod名，コンテナ名を指定し，kube-proxyのログを確認する．

```bash
$ kubectl logs -n kube-system <Pod名> -c kube-proxy

I1211 05:34:22.262955       1 node.go:172] Successfully retrieved node IP: n.n.n.n
I1211 05:34:22.263084       1 server_others.go:140] Detected node IP n.n.n.n
W1211 05:34:22.263104       1 server_others.go:565] Unknown proxy mode "", assuming iptables proxy
I1211 05:34:22.285367       1 server_others.go:206] kube-proxy running in dual-stack mode, IPv4-primary
I1211 05:34:22.285462       1 server_others.go:212] Using iptables Proxier.
I1211 05:34:22.285484       1 server_others.go:219] creating dualStackProxier for iptables.
W1211 05:34:22.285508       1 server_others.go:495] detect-local-mode set to ClusterCIDR, but no IPv6 cluster CIDR defined, , defaulting to no-op detect-local for IPv6
I1211 05:34:22.286807       1 server.go:649] Version: v1.22.3
I1211 05:34:22.289459       1 config.go:315] Starting service config controller
I1211 05:34:22.289479       1 shared_informer.go:240] Waiting for caches to sync for service config
I1211 05:34:22.289506       1 config.go:224] Starting endpoint slice config controller
I1211 05:34:22.289525       1 shared_informer.go:240] Waiting for caches to sync for endpoint slice config
I1211 05:34:22.389800       1 shared_informer.go:247] Caches are synced for endpoint slice config 
I1211 05:34:22.389956       1 shared_informer.go:247] Caches are synced for service config 
```

<br>

### rollout

#### ▼ rolloutとは

Kubernetesリソースをダウンタイム無しで更新する．

参考：

- https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#rollout
- https://aaabbb-200904.hatenablog.jp/entry/2018/05/04/013848

#### ▼ restart

指定したKubernetesをローリングリスタートする．

参考：https://stackoverflow.com/questions/57559357/how-to-rolling-restart-pods-without-changing-deployment-yaml-in-kubernetes

```bash
$ kubectl rollout restart deployment -n kube-system
```

<br>

### patch

#### ▼ patchとは

JSON/YAML形式を入力値として，リソースの設定を変更する．

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#patch

**＊例＊**

削除されないボリュームを削除する．

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

ホストのポートから指定したリソースのポートに対して，ポートフォワーディングを実行する．開発環境にて，Serviceを経由せずに直接的にPodにリクエストを送信したい場合や，SQLクライアントを使用してPod内のDBコンテナにTCP/IP接続したい場合に使用する．

参考：

- https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/#forward-a-local-port-to-a-port-on-the-pod
- https://stackoverflow.com/questions/53898627/mysql-remote-connect-over-ssh-to-a-kubernetes-pod

**＊例＊**

```bash
$ kubectl port-forward <Pod名> <ホストポート>:<Podポート>
```

<br>

### proxy

#### ▼ proxyとは

ローカルホストとkube-apiserverの間にフォワード/リバースプロキシサーバーとして機能するリソースを作成する．kube-proxyとは異なるリソースであることに注意する．

#### ▼ --address，--accept-hosts

参考：https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#proxy

**＊例＊**

```bash
$ kubectl proxy --address=0.0.0.0 --accept-hosts='.*'  

Starting to serve on [::]:8001
```

<br>

### run

#### ▼ runとは

Deployment，Pod，ジョブを作成する．

参考：https://qiita.com/sourjp/items/f0c8c8b4a2a494a80908

#### ▼ --restart，--image，--port

**＊例＊**

もし```restart```オプションが```Always```なら，Deploymentが作成される．


```bash
$ kubectl run <Deployment名> --restart=Always --image=<イメージ名>:<バージョンタグ> --port=<ポート番号>
```

もし```restart```オプションが```Never```なら，Podが作成される．

```bash
$ kubectl run <Pod名> --restart=Never --image=<イメージ名>:<バージョンタグ> --port=<ポート番号>
```

もし```restart```オプションが```OnFailure```なら，ジョブが作成される．

```bash
$ kubectl run <ジョブ名> --restart=OnFailure --image=<イメージ名>:<バージョンタグ> --port=<ポート番号>
```

<br>

### top

NodeやPodのサチュレーションを表示する．

```bash
$ kubectl top node

NAME       CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%   
minikube   523m         13%    4393Mi          27%       
```

<br>

### version

kubectlとKubernetesのバージョンをそれぞれ表示する．両方のバージョンに差があっても，1つ以内のメジャーバージョンであれば許容範囲である．

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
