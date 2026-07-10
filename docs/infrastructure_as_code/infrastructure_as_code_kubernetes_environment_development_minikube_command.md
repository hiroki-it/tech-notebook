---
title: 【IT技術の知見】コマンド＠Minikube
description: コマンド＠Minikubeの知見を記録しています。
---

# コマンド＠Minikube

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. minikubeコマンド

### addons

#### ▼ addonsとは

Minikube のアドオンを操作する。

#### ▼ enable

アドオンを有効化するか否かを設定する。

> - https://minikube.sigs.k8s.io/docs/commands/addons/

**＊例＊**

開発環境専用の Ingress Controller として、Nginx Ingress Controller を有効化するか否かを設定する。

本番環境では、同じく Nginx Ingress Controller や、クラウドプロバイダーのロードバランサーなどを使用する。

> - https://kubernetes.io/docs/tasks/access-application-cluster/ingress-minikube/

```bash
$ minikube addons enable ingress


# IngressClassがNginxのIngressが作成されている。
$ kubectl get ingress

NAME          CLASS   HOSTS   ADDRESS        PORTS   AGE
foo-ingress   nginx   *       <IPアドレス>    80      12m
```

#### ▼ list

有効できるアドオンの一覧を取得する。

```bash
$ minikube addons list

|-------------------------------|------------|----------------|-------------------------|
| ADDON NAME                    | PROFILE    | STATUS         | MAINTAINER              |
|-------------------------------|------------|----------------|-------------------------|
| ambassador                    | minikube   | disabled       | unknown (third-party)   |
| auto-pause                    | minikube   | disabled       | google                  |
| csi-hostpath-driver           | minikube   | disabled       | kubernetes              |
| dashboard                     | minikube   | enabled ✅      | kubernetes              |
| default-storageclass          | minikube   | enabled ✅      | kubernetes              |
| efk                           | minikube   | disabled       | unknown (third-party)   |
| freshpod                      | minikube   | disabled       | google                  |
| gcp-auth                      | minikube   | disabled       | google                  |
| gvisor                        | minikube   | disabled       | google                  |
| helm-tiller                   | minikube   | disabled       | unknown (third-party)   |
| ingress                       | minikube   | enabled ✅      | unknown (third-party)   |
| ingress-dns                   | minikube   | disabled       | unknown (third-party)   |
| istio                         | minikube   | disabled       | unknown (third-party)   |
| istio-provisioner             | minikube   | disabled       | unknown (third-party)   |
| kubevirt                      | minikube   | disabled       | unknown (third-party)   |
| logviewer                     | minikube   | disabled       | google                  |
| metallb                       | minikube   | disabled       | unknown (third-party)   |
| metrics-server                | minikube   | disabled       | kubernetes              |
| nvidia-driver-installer       | minikube   | disabled       | google                  |
| nvidia-gpu-device-plugin      | minikube   | disabled       | unknown (third-party)   |
| olm                           | minikube   | disabled       | unknown (third-party)   |
| pod-security-policy           | minikube   | disabled       | unknown (third-party)   |
| portainer                     | minikube   | disabled       | portainer.io            |
| registry                      | minikube   | disabled       | google                  |
| registry-aliases              | minikube   | disabled       | unknown (third-party)   |
| registry-creds                | minikube   | disabled       | unknown (third-party)   |
| storage-provisioner           | minikube   | enabled ✅      | kubernetes              |
| storage-provisioner-gluster   | minikube   | disabled       | unknown (third-party)   |
| volumesnapshots               | minikube   | disabled       | kubernetes              |
| ----------------------------- | ---------- | -------------- | ----------------------- |
```

<br>

### cni

使用する CNI を設定する。

```bash
$ minikube start --cni=auto
```

```bash
$ minikube start --cni=bridge
```

```bash
$ minikube start --cni=cilium
```

> - https://minikube.sigs.k8s.io/docs/commands/start/

<br>

### config

#### ▼ configとは

`minikube` コマンドに関するパラメーターを操作する。

#### ▼ set

`kubectl` コマンド実行時のデフォルト値を設定する。

**＊例＊**

デフォルトのドライバーを設定する。

```bash
$ minikube config set driver virtualbox
```

CPU サイズの上限値を設定する。

```bash
$ minikube config set cpus 4
```

メモリサイズの上限値を設定する。

```bash
$ minikube config set memory 16384
```

Kubernetes のバージョンのデフォルト値を設定する。

```bash
$ minikube config set kubernetes-version=v1.23.0
```

> - https://minikube.sigs.k8s.io/docs/commands/config/
> - https://stackoverflow.com/questions/45181585/how-to-use-new-release-of-kubernetes-as-default-in-minikube

<br>

### dashboard

#### ▼ dashboardとは

Kubernetes のダッシュボードを開発環境に作成する。

**＊例＊**

```bash
$ minikube dashboard

🤔  Verifying dashboard health ...
🚀  Launching proxy ...
🤔  Verifying proxy health ...
🎉  Opening http://127.0.0.1:55712/*****/ in your default browser...
```

<br>

### delete

#### ▼ deleteとは

Minikube のコンポーネントを削除する。

#### ▼ --profile

```bash
$ minikube delete --profile foo
```

#### ▼ all --purge

すべてのコンポーネントを削除する。

```bash
$ minikube delete --all --purge
```

<br>

### docker-env

#### ▼ docker-envとは

ホストで `docker` コマンドを実行したときに、ホスト側の docker デーモンでなく、ゲスト仮想環境内の Node の docker デーモンにリクエストを送信できるように環境変数を設定する。

バージョンタグ名が `latest` であると、仮想環境外に対してイメージをプルしてしまうことに注意する。

**＊例＊**

```bash
$ minikube docker-env

export DOCKER_TLS_VERIFY="1"
export DOCKER_HOST="tcp://127.0.0.1:52838"
export DOCKER_CERT_PATH="/Users/*****/.minikube/certs"
export MINIKUBE_ACTIVE_DOCKERD="minikube"

# To point your shell to minikube's docker-daemon, run:
# eval $(minikube -p minikube docker-env)

$ eval $(minikube -p minikube docker-env)
```

これにより、以下の環境変数が追加される。

```bash
$ env | grep DOCKER

DOCKER_TLS_VERIFY=1
DOCKER_HOST=tcp://*.*.*.*:2376
DOCKER_CERT_PATH=/Users/hiroki.hasegawa/.minikube/certs
MINIKUBE_ACTIVE_DOCKERD=minikube
```

もし、 Makefile のターゲット内でこれを実行する場合は、`$(shell ...)` とする。

```makefile
docker-env:
	eval $(shell minikube -p minikube docker-env)
```

> - https://minikube.sigs.k8s.io/docs/commands/docker-env/

#### ▼ -u

ホスト側の docker デーモンを指定できるように、元に戻す。

```bash
$ eval $(minikube docker-env -u)
```

<br>

### ip

#### ▼ ipとは

ゲスト仮想環境内の Node の IP アドレスを取得する。

```bash
$ minikube ip

192.168.49.2
```

<br>

### kubectl

#### ▼ kubectlとは

Minikube の kube-apiserver をコンテキストとする `kubectl` コマンドを実行する。

ローカルマシンに `kubectl` コマンドがインストールされていなくとも、Minikube に対してこれを実行できる。Client と Server のバージョンが自動的に揃えられる。

```bash
$ minikube kubectl -- version

# kubectlコマンドのバージョン
Client Version: version.Info{
  Major:"1",
  Minor:"22",
  GitVersion:"v1.22.3",
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
  GitVersion:"v1.22.3", # Amazon EKSであれば、『v1.22.10-eks-84b4fe6』になっている。
  GitCommit:"*****",
  GitTreeState:"clean",
  BuildDate:"2021-11-17T15:41:42Z",
  GoVersion:"go1.16.9",
  Compiler:"gc",
  Platform:"linux/amd64"
}
```

> - https://minikube.sigs.k8s.io/docs/handbook/kubectl/
> - https://hiroki-it.github.io/tech-notebook/infrastructure_as_code/infrastructure_as_code_kubernetes_command.html

<br>

### node

#### ▼ add

Node を `1` 個だけ追加する。

#### ▼ --control-plane

コントロールプレーン Node を追加する。

```bash
$ minikube node add --control-plane
```

#### ▼ --worker

ワーカーNode を追加する。

```bash
$ minikube node add --worker
```

追加したワーカーNode に `.metadata.labeles` キーを追加すれば、node affinity や node selector を検証できる。

```bash
# minikube-m01 はコントロールプレーンNodeのため、ラベルづけ不要である。
```

```bash
# ArgoCDを作成するワーカーNodeの場合
$ kubectl label node minikube-m02 node-type=deploy --overwrite
$ kubectl label node minikube-m02 node-role.kubernetes.io/worker=worker --overwrite
```

```bash
# IngressやIngressGatewayを作成するワーカーNodeの場合
$ kubectl label node minikube-m03 node-type=ingress --overwrite
$ kubectl label node minikube-m03 node-role.kubernetes.io/worker=worker --overwrite
```

```bash
# アプリケーションを作成するワーカーNodeの場合
$ kubectl label node minikube-m04 node-type=app --overwrite
$ kubectl label node minikube-m04 node-role.kubernetes.io/worker=worker --overwrite
```

> - https://qiita.com/zaburo/items/efd7315161281d9822ed
> - https://stackoverflow.com/a/51563019

<br>

### mount

#### ▼ mountとは

ホスト側のファイルまたはディレクトリを、ゲスト仮想環境の指定したディレクトリにマウントする。

```bash
$ minikube mount /Users/hiroki.hasegawa/projects/foo:/data

📁  Mounting host path /Users/hiroki.hasegawa/projects/foo into VM as /data ...
    ▪ Mount type:
    ▪ User ID:      docker
    ▪ Group ID:     docker
    ▪ Version:      9p2000.L
    ▪ Message Size: 262144
    ▪ Permissions:  755 (-rwxr-xr-x)
    ▪ Options:      map[]
    ▪ Bind Address: 127.0.0.1:61268
🚀  Userspace file server: ufs starting
✅  Successfully mounted /Users/hiroki.hasegawa/projects/foo to /data

📌  NOTE: This process must stay alive for the mount to be accessible ...
```

> - https://minikube.sigs.k8s.io/docs/handbook/mount/

<br>

### update-context

Minikube の資格情報が誤っている場合、正しく修正する。

```bash
$ minikube update-context

🎉  "minikube" context has been updated to point to 192.168.64.16:8443
💗  Current context is "minikube"
```

> - https://minikube.sigs.k8s.io/docs/commands/update-context/

<br>

### service

#### ▼ serviceとは

NodePort Service を指定し、ホストから仮想サーバーを介して、Node 内の Service にポートフォワーディングを実行する。

`http://127.0.0.1:<自動的に発行されたポート番号>` の形式で URL が発行されるため、ブラウザや `curl` コマンドで接続を確認できる。

```bash
$ minikube service <NodePort Service名> -n foo-namespace

🏃  Starting tunnel for service <Service名>.
|-----------|--------------|-------------|------------------------|
| NAMESPACE   | NAME           | TARGET PORT   | URL                                      |
|-------------|----------------|---------------|------------------------------------------|
| default     | <Service名>    |               | http://127.0.0.1:<自動的に発行されたポート番号> |
| ----------- | -------------- | ------------- | -----I-------------------                |

Opening service <Service名> in default browser...
```

これは、Istio Ingress Gateway を NodePort Service で作成している場合も使える。

```bash
$ minikube service istio-ingressgateway -n istio-ingress
```

> - https://minikube.sigs.k8s.io/docs/commands/service/
> - https://cstoku.dev/posts/2018/k8sdojo-09/#minikube%E3%81%A7%E3%81%AEnodeport%E3%81%B8%E3%81%AE%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9

ただし、ポートフォワーディングのポート番号がランダムなため、もしポート番号を固定したい場合は、`kubectl port-forward` コマンドで Pod を指定するとよい。

```bash
# Podに直接的に指定する場合
$ kubectl port-forward pod/<Pod名> <ホストポート番号>:<Podのポート番号>

# Serviceの情報を使用して、Podを指定する場合
$ kubectl port-forward svc/<Service名> <ホストポート番号>:<Podのポート番号>

# ホストポートを介してPodのポートにリクエストを送信する。
$ curl http://127.0.0.1:<ホストポート番号>
```

> - https://mome-n.com/posts/minikube-service-fixed-port/

Service の IP アドレスが Node の IP アドレスと一致することは、`minikube ip` コマンドから確認できる。

```bash
$ minikube ip

*.*.*.*
```

補足として、`minikube service` コマンドを使用せずに、`ssh` コマンドで Node に接続しても、同様に Service にリクエストを送信できる。

```bash
$ minikube ssh

# Nodeの中
$ curl -X GET http://*.*.*.*:57761
```

> - https://stackoverflow.com/questions/50564446/minikube-how-to-access-pod-via-pod-ip-using-curl

#### ▼ list

すべての Service の情報を取得する。

```bash
$ minikube service list

|----------------------|---------------------------|--------------|---------------------------|
| NAMESPACE              | NAME                        | TARGET PORT    | URL                         |
|------------------------|-----------------------------|----------------|-----------------------------|
| default                | foo-service                 | http/80        | http://*.*.*.*:30001        |
| default                | bar-service                 | http/80        | http://*.*.*.*:30000        |
| default                | kubernetes                  | No node port   |                             |
| kube-system            | kube-dns                    | No node port   |                             |
| kubernetes-dashboard   | dashboard-metrics-scraper   | No node port   |                             |
| kubernetes-dashboard   | kubernetes-dashboard        | No node port   |                             |
| ---------------------- | --------------------------- | -------------- | --------------------------- |
```

#### ▼ --url

Minikube 仮想サーバー内の Node の IP アドレスと、NodePort Service のポート番号を取得する。

`http://127.0.0.1:<自動的に発行されたポート番号>` の形式で URL が発行されるため、ブラウザや `curl` コマンドで接続を確認できる。

`--url` オプションを使用しない場合とは異なり、ポートフォワーディングを実行しない。

```bash
$ minikube service <NodePort Service名> --url -n foo-namespace

http://127.0.0.1:<自動的に発行されたポート番号>
```

これは、Istio Ingress Gateway を NodePort Service で作成している場合も使える。

```bash
$ minikube service istio-ingressgateway --url -n istio-ingress
```

> - https://minikube.sigs.k8s.io/docs/handbook/accessing/
> - https://cstoku.dev/posts/2018/k8sdojo-09/#minikube%E3%81%A7%E3%81%AEnodeport%E3%81%B8%E3%81%AE%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9

<br>

### ssh

#### ▼ sshとは

仮想環境内の Node に SSH 公開鍵認証で接続する。

```bash
# DockerドライバーによるNodeの場合
$ minikube ssh

# ワーキングディレクトリ
docker@minikube:~$ pwd
/home/docker

# aptコマンドを使用できる。
docker@minikube:~$ sudo apt update -y && apt --help
```

```bash
# VirtualBoxドライバーによるNodeの場合
$ minikube ssh
                         _             _
            _         _ ( )           ( )
  ___ ___  (_)  ___  (_)| |/')  _   _ | |_      __
/' _ ` _ `\| |/' _ `\| || , <  ( ) ( )| '_`\  /'__`\
| ( ) ( ) || || ( ) || || |\`\ | (_) || |_) )(  ___/
(_) (_) (_)(_)(_) (_)(_)(_) (_)`\___/'(_,__/'`\____)


# ワーキングディレクトリ
$ pwd
/home/docker
```

```bash
# HyperKitドライバーによるNodeの場合
$ minikube ssh
                         _             _
            _         _ ( )           ( )
  ___ ___  (_)  ___  (_)| |/')  _   _ | |_      __
/' _ ` _ `\| |/' _ `\| || , <  ( ) ( )| '_`\  /'__`\
| ( ) ( ) || || ( ) || || |\`\ | (_) || |_) )(  ___/
(_) (_) (_)(_)(_) (_)(_)(_) (_)`\___/'(_,__/'`\____)


# ワーキングディレクトリ
$ pwd
/home/docker

# Minikube内で使用できるユーティリティ
$ busybox --list

addgroup
adduser
ar

...

xzcat
yes
zcat
```

Node のなかでは `docker` コマンドを実行でき、コンテナイメージもデバッグできる。

```bash
$ minikube ssh

# Nodeの中
$ docker run --rm -it <ビルドに失敗したコンテナイメージID> /bin/bash

# コンテナの中
[root@<コンテナID>:~] $ ls -la
```

> - https://minikube.sigs.k8s.io/docs/commands/ssh/
> - https://garafu.blogspot.com/2019/10/ssh-minikube-k8s-vm.html

#### ▼ `--` (ハイフン2つ)

Node に SSH 公開鍵認証で接続し、任意のコマンドを実行する。

**＊例＊**

```bash
$ minikube ssh -- ls -la

total 4
drwxr-xr-x 3 docker docker  80 Mar 15 09:30 .
drwxr-xr-x 3 root   root    60 Oct 27 23:07 ..
-rw------- 1 docker docker 126 Mar 15 10:10 .bash_history
drwx------ 2 docker docker  80 Jan  1  1970 .ssh
```

<br>

### start

#### ▼ startとは

ゲスト仮想環境を作成し、仮想環境内に Node を作成する。

**＊例＊**

```bash
$ minikube start

😄  minikube v1.24.0 on Darwin 11.3.1
✨  Automatically selected the docker driver. Other choices: virtualbox, ssh
👍  Starting control plane node minikube in cluster minikube
🚜  Pulling base image ...
💾  Downloading Kubernetes v1.22.3 preload ...
    > preloaded-images-k8s-v13-v1...: 501.73 MiB / 501.73 MiB  100.00% 2.93 MiB
    > gcr.io/k8s-minikube/kicbase: 355.78 MiB / 355.78 MiB  100.00% 1.71 MiB p/
🔥  Creating docker container (CPUs=2, Memory=7911MB) ...
🐳  Preparing Kubernetes v1.22.3 on Docker 20.10.8 ...
    ▪ Generating certificates and keys ...
    ▪ Booting up control plane ...
    ▪ Configuring RBAC rules ...
🔎  Verifying Kubernetes components...
    ▪ Using image gcr.io/k8s-minikube/storage-provisioner:v5
🌟  Enabled addons: storage-provisioner, default-storageclass
🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default
```

コントロールプレーン Node が作成されていることを確認できる。

```bash
$ kubectl get node

NAME       STATUS   ROLES                  AGE   VERSION
minikube   Ready    control-plane,master   14m   v1.22.3
```

> - https://minikube.sigs.k8s.io/docs/commands/start/

#### ▼ --container-runtime

コンテナランタイムを指定する。

コンテナランタイムごとに他にもオプションが必要になる。

```bash
$ minikube start --container-runtime=auto
```

```bash
$ minikube start --container-runtime=docker
```

```bash
$ minikube start --container-runtime=containerd
```

```bash
$ minikube start --container-runtime=cri-o
```

> - https://github.com/kubernetes/minikube/issues/11101#issuecomment-819917618

#### ▼ --cpus、--memory

Minikube の各 Node のハードウェアリソースを設定する (これは Minikube クラスターの上限ではない) 。

そのため、DockerDesktop の上限を高く設定しておかないと、ホスト OS が Minikube クラスターに割り当てられるハードウェアリソースが足りなくなり、Minikube の Node が `NotReady` になる。

また、Node を増やすと Minikube クラスター全体のハードウェアリソースの要求量が増える。

つまり最適解は、適度なハードウェアリソースを割り当てた Node を最低限冗長化することである。

CPU4 コアとメモリ 7168MiB を持った Node が 3 台作られる。

```bash
$ minikube start --cpus=4 --memory=16384 --nodes 3
```

実際に設定されたハードウェアリソースは、Minikube クラスター内から確認できる。

```bash
$ minikube ssh

# CPUとメモリを確認する。
$ top

top - 09:28:27 up 43 min,  0 users,  load average: 19.16, 13.99, 13.93

Tasks:  31 total,   1 running,  30 sleeping,   0 stopped,   0 zombie

# CPU
%Cpu(s): 61.8 us, 22.7 sy,  0.0 ni,  4.7 id,  2.6 wa,  0.0 hi,  8.2 si,  0.0 st

# メモリ
# Dockerドライバーの場合、total値はDockerプロセスの全体量である。ここから、cpuとmemoryの上限値しか使えない
MiB Mem :   8931.8 total,    163.0 free,   7356.1 used,   1412.7 buff/cache # メモリ
MiB Swap:   1024.0 total,    844.3 free,    179.7 used.   1298.8 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    991 root      20   0 1856264 581988  28852 S  27.8   6.4   6:35.21 kube-apiserver
    579 root      20   0 2486572  78828  18660 S  10.6   0.9   2:36.03 kubelet
...
```

```bash
$ minikube ssh

# メモリを確認する。
$ free -m
              total        used        free      shared  buff/cache   available
Mem:           7951        1853        3080         333        3017        5594
Swap:          1023           0        1023
```

metrics-server を入れて、`kubectl top node` コマンドを実行してもよいが、Minikube クラスター全体であれば `minikube ssh` コマンドで Minikube クラスターに入って確認したほうがよい。

#### ▼ --docker-env

別に `docker-env` コマンドを実行しつつ、`start` コマンドを実行する。

**＊例＊**

```bash
$ minikube start --docker-env
```

#### ▼ --ha

コントロールプレーン Node を `3` 個に冗長化する。

kube-apiserver は負荷が高まりクラッシュしやすいため、対策になる。

ただ、ワーカーNode 以外の Node 数が増える。

ため、DockerDesktop の上限を高く設定しておかないと、ホスト OS が Minikube クラスターに割り当てられるハードウェアリソースが足りなくなり、Minikube の Node が `NotReady` になる。

```bash
$ minikube start --ha

NAME      STATUS   ROLES           AGE   VERSION
foo       Ready    control-plane   95s   v1.32.3
foo-m02   Ready    control-plane   85s   v1.32.3
foo-m03   Ready    control-plane   75s   v1.32.3
```

個別にコントロールプレーン Node を追加してもよい。

```bash
$ minikube node add --control-plane
```

> - https://minikube.sigs.k8s.io/docs/tutorials/multi_control_plane_ha_clusters/

#### ▼ --driver

ゲスト仮想環境のドライバーを指定し、`start` コマンドを実行する。

ホストごとに標準の仮想環境が異なり、MacOS は Docker ドライバーがデフォルトである。

ドライバーの使用前に、これをインストールしておく必要があることに注意する。

**＊例＊**

```bash
# 事前にVirtualBoxのダウンロードが必要。
$ minikube start --driver=virtualbox
```

> - https://minikube.sigs.k8s.io/docs/drivers/

#### ▼ --kubernetes-vsersion

Minikube で稼働させる Kubernetes のバージョンを指定しつつ、`start` コマンドを実行する。

```bash
$ minikube start --kubernetes-version=v1.23.0
```

> - https://minikube.sigs.k8s.io/docs/handbook/config/#kubernetes-configuration

#### ▼ --listen--address

Kubernetes Cluster に、ホスト PC 以外の外部から接続できるようにする。

```bash
$ minikube start --listen-address=0.0.0.0
```

> - https://minikube.sigs.k8s.io/docs/faq/#how-can-i-access-a-minikube-cluster-from-a-remote-network

#### ▼ --mount、--mount--string

ホストとゲスト仮想環境間のマウントディレクトリを指定しつつ、`start` コマンドを実行する。

**＊例＊**

```bash
$ minikube start --mount=true --mount-string="/Users/hiroki.hasegawa/projects/foo:/data"
```

#### ▼ --nodes

作成する Node 数を指定し、`start` コマンドを実行する。

マルチ Node の Kubernetes Cluster を作成できる。

Minikube は、同じ CPU とメモリを持つ Node を冗長化するため、`--nodes` オプションで Node を増やすだけ、Pod のリソースに余裕がでる。

**＊例＊**

CPU4 コアとメモリ 7168GB を持った Node が 3 台作られる。

```bash
$ minikube start --nodes 3 --cpu 4 --memory 7168
```

**＊例＊**

```bash
$ minikube start --nodes 3

# Nodeを確認する。
$ kubectl get node
NAME           STATUS   ROLES                  AGE   VERSION
minikube       Ready    control-plane,master   76s   v1.22.0 # コントロールプレーンNode
minikube-m02   Ready    <none>                 42s   v1.22.0 # ワーカーNode
minikube-m03   Ready    <none>                 19s   v1.22.0
minikube-m04   Ready    <none>                 19s   v1.22.0


# Nodeを確認する。
$ minikube status

minikube # コントロールプレーンNode
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured

minikube-m02 # ワーカーNode
type: Worker
host: Running
kubelet: Running
```

補足として、コントロールプレーン Node も単なる Node の `1` 個なため、Deployment を作成すると、コントロールプレーン Node にも Pod をスケジューリングさせる。

```bash
$ kubectl get pod -o wide

NAME                     READY   STATUS    RESTARTS   AGE   IP           NODE           NOMINATED NODE   READINESS GATES
nginx-deployment-*****   1/1     Running   0          16m   10.244.0.3   minikube       <none>           <none>           # コントロールプレーンNode上にある。
nginx-deployment-*****   1/1     Running   0          16m   10.244.1.3   minikube-m02   <none>           <none>           # ワーカーNode上にある。
nginx-deployment-*****   1/1     Running   0          16m   10.244.1.2   minikube-m02   <none>           <none>
```

> - https://minikube.sigs.k8s.io/docs/tutorials/multi_node/

#### ▼ --profile

Kubernetes Cluster に名前をつけ、複数の Kubernetes Cluster を作成できる。

Cluster 名以外にも、例えば以下に影響する。

- Node のプレフィクス
- Docker のネットワーク名

```bash
$ minikube start --profile foo

$ kubectl config use-context foo
Switched to context "foo".

$ kubectl get nodes

NAME      STATUS   ROLES           AGE   VERSION
foo       Ready    control-plane   13d   v1.32.0
foo-m02   Ready    worker          13d   v1.32.0
foo-m03   Ready    worker          13d   v1.32.0
foo-m04   Ready    worker          13d   v1.32.0
foo-m05   Ready    worker          13d   v1.32.0
foo-m06   Ready    worker          13d   v1.32.0
```

注意点として、執筆時点 (2025/02/03) では複数の Kubernetes Cluster 間を同じネットワークに接続できない。

異なるネットワークにおいて、ホスト OS のドメイン (`host.minikube.internal`) を介して通信するしかない。

> - https://github.com/kubernetes/minikube/issues/14799#issuecomment-1216224631

#### ▼ --static-ip

Minikube の Node の IP アドレスを固定する。

マルチ Node に対応しておらず、Node を一台にしなければならない。

```bash
$ minikube start --static-ip 192.168.200.200
```

> - https://minikube.sigs.k8s.io/docs/tutorials/static_ip/
> - https://github.com/kubernetes/minikube/issues/18567

<br>

### tunnel

#### ▼ tunnelとは

LoadBalancer を一時的に作成し、LoadBalancer Service に自動的に紐付ける。

紐付けられた LoadBalancer Service には『External Endpoints (`http://127.0.0.1:80`) 』が割り当てられ、ここから LoadBalancer Service にリクエストを送信できるようになる。

Node 外から Pod へ通信できるようになる。`minikube ssh` コマンドで Node に接続しつつ、公開された Service へリクエストを送信できる。

**＊例＊**

```bash
$ minikube tunnel

✅  Tunnel successfully started

📌  NOTE: Please do not close this terminal as this process must stay alive for the tunnel to be accessible ...

❗  The service/ingress <Service名> requires privileged ports to be exposed: [80]
🔑  sudo permission will be asked for it.
🏃  Starting tunnel for service <Service名>.
```

> - https://minikube.sigs.k8s.io/docs/commands/tunnel/
> - https://minikube.sigs.k8s.io/docs/handbook/accessing/#using-minikube-tunnel

<br>

## 02. デバッグ

### --alsologtostderr

コマンドの詳細な実行ログを標準エラー出力に出力する。

```bash
$ minikube start --alsologtostderr
```

> - https://minikube.sigs.k8s.io/docs/handbook/troubleshooting/

<br>
