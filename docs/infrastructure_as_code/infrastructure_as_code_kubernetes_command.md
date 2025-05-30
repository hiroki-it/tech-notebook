---
title: 【IT技術の知見】コマンド＠Kubernetes
description: コマンド＠Kubernetesの知見を記録しています。
---

# コマンド＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. kubectlコマンド

### セットアップ

#### ▼ `kubeconfig`ファイル

`~/.kube/config`配下にあり、Clusterの資格情報が定義されている。

`kubectl`コマンドは、`kubeconfig`ファイル上のClusterの資格情報を基に、kube-apiserverにリクエストを送信する。

#### ▼ configシンボリックリンク、--kubeconfig

ユーザーが、`config`ファイルを任意のディレクトリで管理する場合、シンボリックリンクを作成する。

または、コマンドの実行時に`config`ファイルを明示的に指定する。

```bash
$ cd ~/.kube

# 現在のディレクトリに、configシンボリックリンクを作成する。
$ ln -s /etc/kubernetes/kubeconfig config
```

```bash
$ kubectl get pod --kubeconfig=/etc/kubernetes/kubeconfig
```

> - https://blog.inductor.me/entry/2021/03/13/205452

<br>

### annotate

#### ▼ annotateとは

指定したKubernetesリソースのアノテーションを操作する。

#### ▼ --overwrite

指定したアノテーションを書き換える。

```bash
$ kubectl annotate --overwrite pod foo-pod <キー名>=<値> -n foo-namespace
```

`kubectl apply`コマンドではアノテーションを変更できず、また`kubectl diff`コマンドでも差分として認識されない仕様になっている。

そのため、`kubectl annotate`コマンドが必要になる。

キー名の後に`-` (ハイフン) をつけるのアノテーションを削除できる。

```bash
$ kubectl annotate --overwrite pod foo-pod <キー名>- -n foo-namespace
```

<br>

### apply

#### ▼ applyとは

同じ識別子 (名前) のリソースが存在しない場合は、リソースを作成し、存在する場合はマニフェストの差分を更新する。

全ての項目を更新できるわけでない。

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#apply

#### ▼ -f -R

kube-apiserverに送信するマニフェストを指定する。`-R`オプションでディレクトリ内のファイルを再帰的に指定もできる。

**＊例＊**

マニフェストを指定し、`kubectl apply`コマンドを実行する。

```bash
# リソースを作成する。
$ kubectl apply -f <マニフェストへのパス>

pod/foo-pod created
```

```bash
# 設定値を変更する。
$ kubectl apply -f <マニフェストへのパス>

pod/foo-pod configured
```

```bash
# ディレクトリ内のファイルを再起的に指定する。
$ kubectl apply -f <マニフェストのあるディレクトリ> -R

pod/foo-pod configured
```

#### ▼ --server-side

ServerSideApplyを実行する。

```bash
$ kubectl apply --server-side -f manifests.yaml
```

ServerSideApplyではない通常のApplyは、ClientSideApplyという。

ClientSideApplyでは、クライアント側がkube-apiserverからマニフェストの実体を取得し、これを変更してからkube-apiserverに送信する。

一方でServerSideApplyでは、kube-apiserver側でマニフェストを変更する。

ClientSideApplyでは、クライアント側の制約により`metadata.annotations`キーのサイズ制限でエラーになる。

そういった場合は、ServerSideApplyで解決できる。

> - https://kubernetes.io/docs/reference/using-api/server-side-apply/#using-server-side-apply-in-a-controller
> - https://zenn.dev/ap_com/articles/63d61765d43983
> - https://github.com/prometheus-operator/prometheus-operator/issues/4439

<br>

### cluster-info

#### ▼ cluster-infoとは

コントロールプレーンNodeの情報を取得する。

```bash
$ kubectl cluster-info

Kubernetes control plane is running at https://*.*.*.*:443
CoreDNS is running at https://*.*.*.*:443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
Metrics-server is running at https://*.*.*.*:443/api/v1/namespaces/kube-system/services/https:metrics-server:/proxy
```

> - https://cstoku.dev/posts/2018/k8sdojo-23/#cluster-info

<br>

### config

#### ▼ configとは

`kubeconfig`ファイルのパラメーターを操作する。

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#config

#### ▼ current-context

`kubectl`コマンドの宛先になっているkube-apiserverを取得する。

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
...
```

#### ▼ use-context

`kubectl`コマンドの向き先を、指定したKubernetesの実行環境のkube-apiserverに変更する。

**＊例＊**

宛先をMinikubeのkube-apiserverに変更する。

```bash
$ kubectl config use-context minikube
```

宛先をDocker for Desktopのkube-apiserverに変更する。

```bash
$ kubectl config use-context docker-desktop
```

宛先をAWS EKS Clusterのkube-apiserverに変更する。

```bash
$ kubectl config use-context <ClusterのARN>
```

#### ▼ view

パラメーターのデフォルト値が設定された`kubeconfig`ファイルを取得する。

**＊例＊**

```bash
$ kubectl config view

apiVersion: v1
clusters:
# ---------------------------------------------
# Docker for Desktopの資格情報
# ---------------------------------------------
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://kubernetes.docker.internal:6443 # kube-apiserverのIPアドレス
  name: docker-desktop
contexts:
- context:
    cluster: docker-desktop
    user: docker-desktop
  name: docker-desktop
# ---------------------------------------------
# Minikubeの資格情報
# ---------------------------------------------
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
# ---------------------------------------------
# 現在のコンテキスト
# ---------------------------------------------
current-context: docker-desktop
kind: Config
preferences: {}
users:
- name: docker-desktop
  user:
    client-certificate-data: REDACTED # クライアント証明書
    client-key-data: REDACTED # 秘密鍵
- name: minikube
  user:
    client-certificate: /Users/h.hasegawa/.minikube/profiles/minikube/client.crt
    client-key: /Users/h.hasegawa/.minikube/profiles/minikube/client.key
```

<br>

### cordon

#### ▼ cordonとは

指定したNodeにこれ以上Podをスケジューリングできないようにする (`SchedulingDisabled`状態) 。

`kubectl drain`コマンドとは異なり、Podを退避させることはない。

```bash
$ kubectl cordon <Node名>
```

> - https://made.livesense.co.jp/entry/2023/03/28/080000#Pod%E3%81%8C%E9%85%8D%E7%BD%AE%E3%81%95%E3%82%8C%E3%81%AA%E3%81%84%E3%82%88%E3%81%86%E3%81%AB%E3%81%99%E3%82%8BCordon

<br>

### cp

#### ▼ cpとは

ホストPCのファイルまたはディレクトリを指定したPod内のコンテナにコピーする。

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#cp

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

さまざまなリソースを作成する。

`kubectl expose`コマンドと`kubectl run`コマンドで作成できるリソースを含むさまざまなものを作成できるが、オプションが少ない。

そのため、`-f`オプションで、マニフェストを指定した方が良い。

同じ識別子 (リソース名) のKubernetesリソースが存在する場合は重複エラーになってしまう。

**＊例＊**

マニフェストを指定し、`kubectl create`コマンドを実行する。

```bash
$ kubectl create -f ./kubernetes/foo-pod.yaml

pod/foo-pod created
```

```bash
$ kubectl create -f ./kubernetes/foo-service.yaml

service/foo-service created
```

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#create

#### ▼ deployment

Pod数を維持管理するReplicaSetを作成する。

Podを終了するためには、Deployment自体を削除しなければならない。

**＊例＊**

```bash
$ kubectl create deployment -f ./kubernetes/foo-deployment.yaml
```

#### ▼ secret docker-registry

イメージレジストリの資格情報を持つSecretを作成する。

Podと同じNamespaceに所属するする必要があるため、作成時にNamespaceの指定を忘れないようにする。

```bash
# DockerHubの場合
$ kubectl create secret docker-registry foo-secret \
    --docker-server=http://bar.example.com \
    --docker-username=bar \
    --docker-password=baz \
    --docker-email=http://baz.example.com \
    -n foo-namespace
```

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-secret-docker-registry-em-
> - https://stackoverflow.com/questions/46297949/sharing-secret-across-namespaces

#### ▼ secret generic

Secretを作成する。

**＊例＊**

指定した`.env`ファイルからSecretを作成する。

```bash
$ kubectl create secret generic foo-secret --from-env-file=./foo/.env

secret/foo-secret created
```

指定した`.env`ファイル以外からSecretを作成する。

```bash
$ kubectl create secret generic foo-secret --from-file=./foo/values.txt

secret/foo-secret created
```

キー名と値からSecretを作成する。

```bash
$ kubectl create secret generic foo-secret --from-literal=username="bar" --from-literal=password="baz"

secret/foo-secret created
```

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-secret-generic-em-
> - https://qiita.com/toshihirock/items/38d09b2822a347c3f958

#### ▼ secret tls

サーバー証明書を持つSecretを作成する。

```bash
$ kubectl create secret tls tls-secret --cert=/etc/ssl/certs/foo.crt --key=./foo.key
```

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-secret-tls-em-

<br>

### delete

#### ▼ deleteとは

Kubernetesリソースを削除する。

```bash
$ kubectl delete <Kubernetesリソース> <Kubernetesリソース名>
```

**＊例＊**

Podを終了する。

Podの場合、オプションの無い`kubectl delete`コマンドがGraceful Shutdownとなる。

```bash
$ kubectl delete pod foo-pod
```

> - https://kubernetes.io/docs/tasks/run-application/force-delete-stateful-set-pod/#delete-pods

**＊例＊**

指定した名前のPodを全て削除する。

```bash
$ kubectl delete pod -n foo \
    $(kubectl get pod --no-headers -o custom-columns=":metadata.name" -n foo | grep '<指定した名前>'  | tr -s '\n' ' ')
```

#### ▼ --force

Podを強制的に削除する。

特に、`Terminating`フェーズのまま削除されないPodに対して有効である。

合わせて`--grace-period`オプションを有効化することにより、即時に削除できる。

```bash
$ kubectl delete pod <TerminatingステータスのままのPod名> --force --grace-period=0
```

> - https://www.opensourcetech.tokyo/entry/20211207/1638879696
> - https://kubernetes.io/docs/tasks/run-application/force-delete-stateful-set-pod/#force-deletion

<br>

### describe

#### ▼ describeとは

リソースの詳細な情報を参照する。

簡易的な情報を参照する時は、`kubectl get`コマンドを使用する。

**＊例＊**

```bash
$ kubectl describe node
```

`grep`コマンドを使用して、PodをスケジューリングさせているNodeを取得する。

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

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#describe

#### ▼ -A

**＊例＊**

全てのNodeの詳細な情報を取得する。

`grep`コマンドを使用し、必要な情報のみを確認する。

```bash
$ kubectl describe node -A | grep -e Name -e cpu

Name:               foo-node
  cpu:                8
  cpu:                7510m
  cpu                1050m (13%)  4850m (64%) # <--- Node全体の使用率
Name:               bar-node
  cpu:                4
  cpu:                3520m
  cpu                2183m (62%)  4950m (140%) # <--- Node全体の使用率
Name:               baz-node
  cpu:                8
  cpu:                7510m
  cpu                1937m (25%)  10245m (136%) # <--- Node全体の使用率
```

<br>

### diff

#### ▼ diffとは

既存のマニフェストと、指定したマニフェストの差分を表示する。

#### ▼ -f

ファイルを指定して、差分を表示する。

CRDをHelmの管理外で作成する場合に役立つ。

```bash
$ curl "https://raw.githubusercontent.com/argoproj/argo-cd/v2.4.15/manifests/crds/application-crd.yaml" \
    | kubectl diff -f -
```

<br>

### drain

#### ▼ drainとは

Nodeにこれ以上Podをスケジューリングできないようにし (`SchedulingDisabled`状態) 、また既存のPodを退避させる。

Nodeが他に存在すれば、そのNode上でPodをスケジューリングさせる。

```bash
$ kubectl drain <Node名>
```

![kubernetes_drain_node](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_drain_node.png)

> - https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/#use-kubectl-drain-to-remove-a-node-from-service
> - https://amazon.co.jp/dp/1491979682
> - https://cstoku.dev/posts/2018/k8sdojo-21/
> - https://medium.com/@yanglyu5201/kubernetes-drain-node-vs-cordon-node-8b979eb7bbbe

<br>

### edit

#### ▼ editとは

マニフェストの設定値を直接的に変更する。

ただし、Podの設定値は直接的に変更できず、代わりにDeploymentやStatefulSet上での設定値を変更する必要がある。

```bash
$ kubectl edit <リソースの種類> <Pod以外のKubernetesリソース名>
```

```bash
$ kubectl edit deployment foo-deployment
```

```bash
$ kubectl edit statefulset foo-statefulset
```

> - https://github.com/kubernetes/kubernetes/issues/24913

<br>

### exec

#### ▼ execとは

指定したPod内のコンテナのシェルを実行し、コンテナにログインする。

注意点として、シェルのないコンテナ (distroless型など) はそもそもシェルを実行できないため、ログインもできない。

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#exec

#### ▼ -it

**＊例＊**

コンテナを指定して、デタッチモードで `kubectl exec`コマンドを実行する。

```bash
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>] $ ls -la
```

コンテナを指定しない場合は、デフォルトのコンテナが選択される。

Podの`.metadata.labels`キーではなく、Pod名であることに注意する。

```bash
$ kubectl exec -it <Pod名> -- bash

Defaulted container "foo-container" out of: foo-container, bar-container
```

<br>

### expose

#### ▼ exposeとは

Serviceを作成する。

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#expose
> - https://qiita.com/sourjp/items/f0c8c8b4a2a494a80908

#### ▼ --type、--port、--target-port

**＊例＊**

ClusterIP Serviceを作成する。

```bash
$ kubectl expose <Service名> \
    --type=ClusterIP \
    --port=<受信ポート番号> \
    --target-port=<フォワーディング先ポート番号>
```

NodePort Serviceを作成する。

```bash
$ kubectl expose <Service名> \
    --type=NodePort \
    --port=<受信ポート番号> \
    --target-port=<フォワーディング先ポート番号>
```

LoadBalancer Serviceを作成する。

```bash
$ kubectl expose <Service名> \
    --type=LoadBalancer \
    --port=<受信ポート番号> \
    --target-port=<フォワーディング先ポート番号>
```

<br>

### get <リソース>

#### ▼ getとは

リソースの簡易的な情報を参照する。

詳細な情報を参照する時は、`kubectl describe`コマンドを使用する。

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#get

**＊例＊**

特定のNamespaceの全てのKubernetesリソースを取得する。

> - https://text.superbrothers.dev/190616-kubectl-get-all-does-not-include-most-resources/

```bash
$ kubectl get "$(kubectl api-resources --namespaced=true --verbs=list -o name | tr "\n" "," | sed -e 's/,$//')" -n foo-namespace
```

**＊例＊**

全てのNodeの情報を取得する。

```bash
$ kubectl get node

NAME      STATUS   ROLES                  AGE   VERSION
foo-node  Ready    worker                 12h   v1.22.0 # ワーカーNode
bar-node  Ready    worker                 12h   v1.22.0 # 同上
baz-node  Ready    worker                 12h   v1.22.0 # 同上
# qux-node  Ready    control-plane,master   12h   v1.22.0 # セルフマネージドなコントロールプレーンNodeを使用する場合はこれも表示される

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

`grep`コマンドを使用して、`Running`フェーズのPodのみを取得する。

```bash
$ kubectl get pod | grep -e NAME -e Running

NAME       READY   STATUS             RESTARTS   AGE
bar-pod    2/2     Running            0          5m01s
```

**＊例＊**

`wc`コマンドで出力内容の行数を数える。

これにより、Podの個数を確認できる。

> - https://stackoverflow.com/a/61634879

```bash
$ kubectl get pod --no-headers | wc -l

20
```

**＊例＊**

各Nodeで作成できるPodの上限数を確認する。

```bash
$ kubectl get node \
    -o=custom-columns=NODE:.metadata.name,MAX_PODS:.status.allocatable.pods,CAPACITY_PODS:.status.capacity.pods,INSTANCE_TYPE:.metadata.labels."node\.kubernetes\.io/instance-type"
```

さらに、各Nodeで稼働中のPod数を確認する。

```bash
$ for node in $(kubectl get node | awk '{if (NR!=1) {print $1}}'); \
    do echo""; echo "Checking ${node}..."; \
    kubectl describe node ${node} | grep "Non-terminated" ; done
```

**＊例＊**

ArgoCDのApplicationから、`argocd app diff`コマンドで反復的に差分を確認する。

```bash
#!/bin/bash

application=$(kubectl get application -A | grep foo )

# 一列目の実を取得する。
application_names=$(echo "$application" | awk '{if(NR>1) print $1}')

# 差分を取得する。
for application_name in "${application_names[@]}"; do
  argocd app diff "$application_name"
done
```

**＊例＊**

特定の値を持つマニフェストのみを取得する。

```bash
$ kubectl get applications -o yaml -n foo \
    | yq eval '.items[] | select(.spec.destination.namespace == "foo")'
```

#### ▼ -A

指定したKubernetesリソースをNamespaceに関係なく取得する。

```bash
$ kubectl get pod -A
```

`grep`コマンドを使用して、特定のNodeのみを取得する。

```bash
$ kubectl get pod -A -o wide | grep -e NAMESPACE -e <Node名>
```

全てのPodのイメージをアルファベット順で取得する。

```bash
$ kubectl get pod -A -o jsonpath="{.items[*].spec.containers[*].image}" \
    | tr -s '[[:space:]]' '\n' \
    | sort \
    | uniq -c
```

#### ▼ -o custom-columns

指定したKubernetesリソースの情報でユーザー定義のカラムで取得する。

カスタムリソースの情報をいい感じに取得する時に役立つ。

**＊例＊**

Serviceの指定した情報をユーザー定義のカラムで取得する。

```bash
$ kubectl get service \
    -n kube-system \
    -o custom-columns='NAME:.metadata.name,IP:.spec.clusterIP,PORT:.spec.ports[*].targetPort'

NAME                   IP           PORT
kube-dns               10.0.0.10    53,53
kubernetes-dashboard   10.0.0.250   9090
```

なお、さらに`json`形式で出力することもできる。

```bash
$ kubectl get service \
    -n kube-system \
    -o custom-columns='NAME:.metadata.name,IP:.spec.clusterIP,PORT:.spec.ports[*].targetPort' \
    -o json
```

> - https://stackoverflow.com/a/43521302

**＊例＊**

Applicationの指定した情報をユーザー定義のカラムを取得する。

```bash
$ kubectl get application \
    -n foo \
    -o custom-columns="NAME:metadata.name,PROJECT:spec.project,STATUS:status.sync.status"

NAME               PROJECT        STATUS
foo-application    foo-project    Synced
bar-application    bar-project    OutOfSync
baz-application    baz-project    Unknown
```

**＊例＊**

`kubectl`コマンドの結果をマークダウンの表にして出力する。

```bash
$ kubectl get application \
    -n foo \
    -o custom-columns='NAME:metadata.name,PROJECT:spec.project,STATUS:status.sync.status' \
    | awk '
      BEGIN {
        FS="  *"
        OFS=" | "
      }
      {
        if (NR==1) {
          for(i=1; i<=NF; i++) {
            gsub(/ */, "", $i)
            printf "| %s ", $i
          }
          print "|"
          for(i=1; i<=NF; i++) {
            gsub(/./, "-", $i)
            printf "|-%s-", $i
          }
          print "|"
        } else {
          for(i=1; i<=NF; i++) {
            printf "| %s ", $i
          }
          print "|"
        }
      }'
```

複数の結果をマージして、マークダウンの表にして出力する。

```bash
#!/bin/bash

# 各Applicationを全て抽出する。
kubectl get application \
  -n foo \
  -o custom-columns='NAME:metadata.name,PROJECT:spec.project' >| foo.txt

kubectl get application \
  -n bar \
  -o custom-columns='NAME:metadata.name,PROJECT:spec.project' >| bar.txt

kubectl get application \
  -n baz \
  -o custom-columns='NAME:metadata.name,PROJECT:spec.project' >| baz.txt

# ヘッダーを削除する。
# https://akiniwa.hatenablog.jp/entry/2014/05/01/123126
tail -n +2 foo.txt >| foo-without-header.txt
tail -n +2 bar.txt >| bar-without-header.txt
tail -n +2 baz.txt >| baz-without-header.txt

# 並び替える。
# 後述のuniqコマンドでは、隣り合う重複しか削除できないため、ここでソートしておく。
cat foo-without-header.txt bar-without-header.txt baz-without-header.txt \
  | sort >| sorted.txt

# 行の重複を削除する。
cat sorted.txt \
  | uniq >| uniq.txt

# ヘッダーをつけ直す。
echo 'Application Project' >| merged.txt

# ヘッダーとそれ移行を接続する
cat uniq.txt >> merged.txt

# マークダウン表として出力する。
cat merged.txt | awk '
      BEGIN {
        FS="  *"
        OFS=" | "
      }
      {
        if (NR==1) {
          for(i=1; i<=NF; i++) {
            gsub(/ */, "", $i)
            printf "| %s ", $i
          }
          print "|"
          for(i=1; i<=NF; i++) {
            gsub(/./, "-", $i)
            printf "|-%s-", $i
          }
          print "|"
        } else {
          for(i=1; i<=NF; i++) {
            printf "| %s ", $i
          }
          print "|"
        }
      }' >| merged.md


# 場合によっては、他のフォーマットに変換する
# 例えばWiki記法の表に変換する
md2confl merged.md >| merged.wiki
```

#### ▼ -o custom-columns-file

事前に定義したユーザー定義のカラムに基づいて、Kubernetesリソースを取得する。

**＊例＊**

Applicationの指定した情報をユーザー定義のカラムを取得する。

```bash
$ cat columns-file
NAME:metadata.name,PROJECT:spec.project,STATUS:status.sync.status


$ kubectl get application \
    -n foo \
    -o custom-columns-file=columns-file

NAME               PROJECT        STATUS
foo-application    foo-project    Synced
bar-application    bar-project    OutOfSync
baz-application    baz-project    Unknown
```

> - https://kubernetes.io/docs/reference/kubectl/#formatting-output

#### ▼ -o jsonpath

指定したKubernetesリソースの特定の設定を出力する。

**＊例＊**

`L4`ロードバランサーのIPアドレスを取得する。

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

Podの現在のIPアドレスを取得する。

```bash
$ kubectl get pod foo-pod \
    -n foo-namespace \
    -o jsonpath="{.status.podIP}"
```

**＊例＊**

IstioOperatorに定義したIstioのバージョンを取得する。

```bash
$ kubectl get istiooperator \
    -n istio-system \
    -o jsonpath="{.metadata.labels.operator\.istio\.io\/version}"
```

#### ▼ -o wide

指定したリソースの詳細な情報を取得する。

Nodeが複数がある場合、Nodeに渡ってKubernetesリソースの情報を確認できるところがよい。

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

`grep`コマンドを使用して、特定のPodのみを取得する。

```bash
$ kubectl get pod -o wide | grep -e NAMESPACE -e foo

NAMESPACE   NAME        READY   STATUS        RESTARTS   AGE   IP          NODE       NOMINATED NODE   READINESS GATES
foo         foo-pod     2/2     Running       0          16d   *.*.*.*     foo-node   <none>           <none>
```

`grep`コマンドを使用して、特定のServiceのみを取得する。

```bash
$ kubectl get service -o wide | grep -e NAMESPACE -e foo

NAMESPACE   NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)       AGE   SELECTOR
foo         foo-service  NodePort    *.*.*.*      <none>        443:443/TCP   2d    app.kubernetes.io/instance=prd-foo-app
```

**＊例＊**

Nodeの詳細な情報を取得する。

```bash
$ kubectl get node -o wide

NAME       STATUS   ROLES                  AGE   VERSION   INTERNAL-IP     EXTERNAL-IP   OS-IMAGE         KERNEL-VERSION       CONTAINER-RUNTIME
foo-node   Ready    worker                 17h   v1.22.0   *.*.*.*         <none>        Amazon Linux 2   1.0.0.amzn2.x86_64   containerd://1.0.0
bar-node   Ready    worker                 17h   v1.22.0   *.*.*.*         <none>        Amazon Linux 2   1.0.0.amzn2.x86_64   containerd://1.0.0
baz-node   Ready    worker                 17h   v1.22.0   *.*.*.*         <none>        Amazon Linux 2   1.0.0.amzn2.x86_64   containerd://1.0.0
# qux-node   Ready    control-plane,master   17h   v1.22.0   *.*.*.*         <none>        Amazon Linux 2   1.0.0.amzn2.x86_64   containerd://1.0.0 # セルフマネージドなコントロールプレーンNodeを使用する場合
```

#### ▼ -o yaml

指定したKubernetesリソースの設定を取得し、`yaml`形式で出力する。

**＊例＊**

指定したSecretを`yaml`形式で取得する。

正規表現と同様に、一部の文字列ではエスケープする必要がある。

```yaml
$ kubectl get secret <Secret名> -o yaml
---
apiVersion: v1
kind: Secret
metadata:
  creationTimestamp: "2021-12-00T00:00:00Z"
  name: swp-secret
  namespace: default
  resourceVersion: "18329"
type: Opaque
data:
  FOO: ***** # base64方式のエンコード値
  BAR: *****
  BAZ: *****
```

#### ▼ -l

特定の`.metadata.labels`キーと値を持つKubernetesリソースを取得する。

大文字の`-L`オプションとは異なり、特定のラベルの値をもつKubernetesリソースを絞り込める。

**＊例＊**

```bash
$ kubectl get pod -l <キー>=<値>
```

複数の`.metadata.labels`キーをAND条件で指定することもできる。

```bash
$ kubectl get pod -l <キー>=<値>,<キー>=<値>
```

`.metadata.labels`キーの値をOR条件で指定することもできる。

```bash
$ kubectl get pod -l <キー>=<値>,<キー>=<値>
```

```bash
$ kubectl get pod -l '<キー> in (<値>,<値>)'
```

**＊例＊**

`.metadata.labels.topology.kubernetes.io/zone`キーの値が`ap-northeast-1a`であるNodeを取得する。

```bash
$ kubectl get node -l topology.kubernetes.io/zone=ap-northeast-1a
```

#### ▼ -L

特定の`.metadata.labels`キーを持つKubernetesリソースを取得し、`kubectl get`コマンドの結果に新しい列として追加する。

小文字の`-l`オプションとは異なり、特定のラベルを持つKubernetesリソースを一覧で表示する。

該当のキーがない場合は、空欄で表示される。

```bash
$ kubectl get <Kubernetesリソースの種類> -L <metadata.labelsキー>
```

**＊例＊**

AWS EKSにて、Nodeグループの種類を確認するため、`eks.amazonaws.com/nodegroup`キーを取得する。

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

Nodeが作成されたAWSリージョンを確認するため、`topology.kubernetes.io/zone`キーを取得する。

```bash
$ kubectl get node -L topology.kubernetes.io/zone

NAME       STATUS   ROLES    AGE     VERSION   ZONE
foo-node   Ready    <none>   18h     v1.22.0   ap-northeast-1a
bar-node   Ready    <none>   18h     v1.22.0   ap-northeast-1c
baz-node   Ready    <none>   18h     v1.22.0   ap-northeast-1d
```

**＊例＊**

istioのコンテナインジェクションが有効されているNamespaceを確認するため、`.metadata.labels.istio.io/rev`キーを取得する。

```bash
$ kubectl get namespace -L istio.io/rev

NAME                   STATUS   AGE     REV
foo-namespace          Active   145d    1-0-0
bar-namespace          Active   145d           # キーが設定されていないNamespace
baz-namespace          Active   145d           # 同上
```

**＊例＊**

特定のKubernetesリソースがどのように管理されているかを取得する。

公式のHelmチャートでは、Deployment、Daemonset、StatefulSetがタグを持つことが多い。

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

指定した`.spec.selector`キーを持つDeploymentを取得する。

**＊例＊**

```bash
$ kubectl get deployment --selector<キー>=<値>
```

#### ▼ --show-labels

指定したKubernetesリソースの`.metadata.labels`キーの値を表示する。

**＊例＊**

全てのKubernetesリソースの`.metadata.labels`キーの値を表示する。

```bash
$ kubectl get all -A --show-labels
```

**＊例＊**

全てのKubernetesリソースの中から、ArgoCDで管理していないものの`.metadata.labels`キーの値を表示する。

```bash
$ kubectl get all -A --show-labels | grep -v "argocd.argoproj.io/instance"
```

#### ▼ --watch (-w)

指定したPodの情報 (フェーズ、ステータスなど) を継続的に取得し、情報に変更があれば出力を追記していく。

別ツールで時間のかかるKubernetesリソースを作成しながら、`--watch`オプションを使用すると、作成状況を確認できる。

**＊例＊**

```bash
$ kubectl get pod -w
```

> - https://qiita.com/kyontra/items/b435ab6e33ffbed51f10

<br>

### label

#### ▼ labelとは

指定したリソースの`.metadata.labels`キーを操作する。

#### ▼ オプション無し (キーの追加)

指定したリソースに`.metadata.labels`キーを作成する。

**＊例＊**

```bash
$ kubectl label <リソースの種類> <リソース名> foo=bar
```

```bash
$ kubectl label ns default istio.io/rev=stable
```

#### ▼ オプション無し (キーの削除)

指定したリソースの`.metadata.labels`キーを削除する。

```bash
$ kubectl label <リソースの種類> <リソース名> foo-
```

**＊例＊**

```bash
$ kubectl label ns default istio.io/rev-
```

#### ▼ --overwrite

指定したリソースに`.metadata.labels`キーを上書きする。

```bash
$ kubectl label --overwrite <リソースの種類> <リソース名> foo=bar
```

**＊例＊**

`.metadata.labels.istio-injection`キーを`.metadata.labels.istio.io/rev`キー (値は`1-0-0`) に上書きする。

```bash
$ kubectl label --overwrite namespace foo istio.io/rev=1-0-0 istio-injection-
```

<br>

### logs

#### ▼ logsとは

指定したリソースのログを取得する。

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#logs

#### ▼ -c

Pod名とコンテナ名を指定し、コンテナのログを取得する。

**＊例＊**

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

#### ▼ --previous

停止済みの前回のコンテナのログを取得する。

```bash
$ kubectl logs -f <Pod名> --previous
```

> - https://stackoverflow.com/a/34097447/12771072

#### ▼ --timestamps

タイムスタンプを取得する。

コンテナがタイムスアンプを出力していない場合に役立つ。

```bash
$ kubectl logs -n <Namespace名> --timestamps <Pod名> -c <コンテナ名> | grep -i error

2021/11/27 08:34:01 [ERROR] *****
```

<br>

### replace

#### ▼ replaceとは

Kubernetesリソースを安全に削除し、別のマニフェストで再作成する。

```bash
$ kubectl replace -f foo.yaml
```

> - https://stackoverflow.com/questions/47241626/what-is-the-difference-between-kubectl-apply-and-kubectl-replace

#### ▼ --force

Kubernetesリソースを強制的に削除し、別のマニフェストで再作成する。

```bash
$ kubectl replace --force -f foo.yaml
```

<br>

### rollout

#### ▼ rolloutとは

Deployment、DaemonSet、StatefulSet、でコピーされたPodを操作する。

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#rollout
> - https://aaabbb-200904.hatenablog.jp/entry/2018/05/04/013848

#### ▼ restart

配下のPodを再作成する。

PodのVolume (例：ConfigMap、Secret、PersistentVolume、persistentVolumeClaim) の設定を変更した後に、Podに再び読み込ませるために役立つ。

**＊例＊**

```bash
# Deployment配下のPodを再作成する。
$ kubectl rollout restart deployment foo-deployment -n foo-namespace
```

```bash
# DaemonSet配下のPodを再作成する。
$ kubectl rollout restart daemonset foo-daemonset -n foo-namespace
```

```bash
# StatefulSet配下のPodを再作成する。
$ kubectl rollout restart statefulset foo-statefulset -n foo-namespace
```

> - https://shepherdmaster.hateblo.jp/entry/2021/03/14/100000
> - https://amateur-engineer-blog.com/kubernetes-deployment-rollout/#toc16
> - https://qiita.com/rururu_kenken/items/508ebef59e2f30d957dc

<br>

### patch

#### ▼ patchとは

JSON/`yaml`形式を入力値として、リソースの設定値を変更する。

ただし、マニフェストは変更されない。

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#patch

#### ▼ pv

PersistentVolumeの設定値を変更する。

**＊例＊**

削除されないボリュームを削除する。

> - https://github.com/kubernetes/kubernetes/issues/77258#issuecomment-514543465

```bash
$ kubectl get pv \
    |  tail -n+2 \
    |  awk '{print $1}' \
    |  xargs -I{} kubectl patch pv {} -p '{"metadata":{"finalizers": null}}'
```

<br>

### port-forward

#### ▼ port-forwardとは

ポートフォワーディングを実行し、ホストのポートからPodにリクエストを送信できるようにする。

Podを直接的に指定する場合と、他のKubernetesリソース (例：Service、Deployment) の情報を使用して、Podを指定する方法がある。

この時、通信自体は他のKubernetesリソースを経由しているわけではないことに注意する (例えば、Kialiを確認すると、Ingress Controllerを経由していないことがわかる) 。

開発環境にて、Serviceを介さずに直接的にPodにリクエストを送信したい場合や、SQLクライアントを使用してPod内のDBコンテナにTCP/IP接続したい場合に使用する。

```bash
# Podを直接的に指定する場合
$ kubectl port-forward pod/<Pod名> <ホストポート番号>:<Podのポート番号>

# Serviceの情報を使用して、Podを指定する場合
$ kubectl port-forward svc/<Service名> <ホストポート番号>:<Serviceのポート番号>

# ホストポートを介してPodのポートにリクエストを送信する。
$ curl http://127.0.0.1:<ホストポート番号>
```

> - https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/#forward-a-local-port-to-a-port-on-the-pod
> - https://stackoverflow.com/questions/53898627/mysql-remote-connect-over-ssh-to-a-kubernetes-pod
> - https://qiita.com/superbrothers/items/0dca5d2a10727fc14734#%E3%82%AF%E3%83%A9%E3%82%B9%E3%82%BF%E5%A4%96%E3%81%8B%E3%82%89-clusterip-%E3%81%AB%E7%B4%90%E3%81%A5%E3%81%8F-pod-%E3%81%AB%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%99%E3%82%8B

#### ▼ 複数のポートをフォワーディングする

同じPodやServiceで複数のポートが公開されている場合、同時にポートフォワーディングできる。

```bash
$ kubectl port-forward svc/<Service名> 8080:8080 8443:8443 9090:9090

Forwarding from 127.0.0.1:8080 -> 8080
Forwarding from [::1]:8080 -> 8080
Forwarding from 127.0.0.1:8443 -> 8443
Forwarding from [::1]:8443 -> 8443
Forwarding from 127.0.0.1:8443 -> 9090
Forwarding from [::1]:8443 -> 9090
```

> - https://github.com/derailed/k9s/issues/779#issue-642826402

異なるPodやServiceの場合、`&` (一つだけ) でつなぐと、同時にポートフォワーディングできる。

```bash
$ kubectl port-forward svc/<Service名> 8080:8080 & \
    kubectl port-forward svc/<Service名> 8443:8443 & \
    kubectl port-forward svc/<Service名> 9090:9090

Forwarding from 127.0.0.1:8080 -> 8080
Forwarding from [::1]:8080 -> 8080
Forwarding from 127.0.0.1:8443 -> 8443
Forwarding from [::1]:8443 -> 8443
Forwarding from 127.0.0.1:8443 -> 9090
Forwarding from [::1]:8443 -> 9090
```

> - https://stackoverflow.com/a/72983554

<br>

### proxy

#### ▼ proxyとは

kube-apiserverの送信元にフォワード/リバースプロキシサーバーとして動作するリソースを作成する。

kube-proxyとは異なるリソースであることに注意する。

#### ▼ --address、--accept-hosts

**＊例＊**

```bash
$ kubectl proxy --address=0.0.0.0 --accept-hosts='.*'

Starting to serve on [::]:8001
```

> - https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#proxy

<br>

### run

#### ▼ runとは

Deployment、Pod、Jobを作成する。

> - https://qiita.com/sourjp/items/f0c8c8b4a2a494a80908

#### ▼ --restart、--image、--port

**＊例＊**

もし`--restart`オプションが`Always`なら、Deploymentを作成する。

```bash
$ kubectl run <Deployment名> --restart=Always --image=<コンテナイメージ名>:<バージョンタグ> --port=<ポート番号>
```

もし`--restart`オプションが`Never`なら、Podを作成する。

```bash
$ kubectl run <Pod名> --restart=Never --image=<コンテナイメージ名>:<バージョンタグ> --port=<ポート番号>
```

もし`--restart`オプションが`OnFailure`なら、Jobを作成する。

```bash
$ kubectl run <Job名> --restart=OnFailure --image=<コンテナイメージ名>:<バージョンタグ> --port=<ポート番号>
```

### taint

#### ▼ taintとは

NodeにTaintを付与する。

エフェクトごとに、Tolerationが付与されたPodのスケジューリング方法が異なる。

| エフェクト       | 説明                                                                                                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NoExecute        | Tolerationが付与されたPodしか、そのNodeにスケジューリングさせられない。付与したPodがすでに稼働している場合、そのPodも再スケジューリングさせる。                                                                                                                                       |
| NoSchedule       | Tolerationが付与されたPodしか、そのNodeにスケジューリングさせられない。付与したPodがすでに稼働している場合、そのPodは再スケジューリングさせない。                                                                                                                                     |
| PreferNoSchedule | Tolerationが付与されたPodをそのNodeにスケジューリングさせる。ただし、いずれのPodにもTolerationが付与されていなければ、付与されていないPodもそのNodeにスケジューリングさせる。Tolerationが付与されたPodがすでにスケジューリングをさせている場合、そのPodは再スケジューリングさせない。 |

**＊例＊**

NodeにTaint (`app=batch:NoSchedule`) を付与する。

```bash
$ kubectl taint node foo-node app=batch:NoSchedule
```

これにより、以下の`.spec.tolerations`キーが付与されたPodしかスケジューリングさせられない。

> - https://qiita.com/sheepland/items/8fedae15e157c102757f#pod%E3%81%ABtolerations%E3%82%92%E8%A8%AD%E5%AE%9A%E3%81%99%E3%82%8B%E4%BE%8B

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
  tolerations:
    - key: app
      value: batch
      operator: Equal
      effect: NoSchedule
```

**＊例＊**

コントロールプレーンNodeとして扱うTaintを付与する。

キー名のみ指定し、値は指定していない。

```bash
$ kubectl taint node foo-node node-role.kubernetes.io/master:NoSchedule
```

これにより、以下の`.spec.tolerations`キーが付与されたPodしかスケジューリングさせられない。

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
  tolerations:
    - key: node-role.kubernetes.io/master
      operator: Exists
      effect: NoSchedule
```

> - https://qiita.com/sheepland/items/8fedae15e157c102757f#pod%E3%81%ABtolerations%E3%82%92%E8%A8%AD%E5%AE%9A%E3%81%99%E3%82%8B%E4%BE%8B

#### ▼ `-` (ラベル値のハイフン)

指定したNodeからTaintを削除する。

**＊例＊**

```bash
$ kubectl taint node foo-node app=batch:NoSchedule-
```

> - https://garafu.blogspot.com/2019/06/asign-pod-strategy-2.html#taints-setdel

<br>

### version

kubectlとKubernetesのバージョンをそれぞれ取得する。

両方のバージョンに差があっても、1つ以内のマイナーバージョンであれば許容範囲である。

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

> - https://stackoverflow.com/questions/60991658/kubectl-what-does-client-vs-server
> - https://github.com/kubernetes/kubernetes/issues/93635#issuecomment-667702194

<br>
