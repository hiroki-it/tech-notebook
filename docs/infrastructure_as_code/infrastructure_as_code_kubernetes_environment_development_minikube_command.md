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

Minikubeのアドオンを操作する。

#### ▼ enable

アドオンを有効化するか否かを設定する。

> - https://minikube.sigs.k8s.io/docs/commands/addons/

**＊例＊**

開発環境専用のIngress Controllerとして、Nginx Ingress Controllerを有効化するか否かを設定する。

本番環境では、同じくNginx Ingress Controllerや、クラウドプロバイダーのロードバランサーなどを使用する。

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

使用するCNIを設定する。

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

CPUサイズの上限値を設定する。

```bash
$ minikube config set cpus 4
```

メモリサイズの上限値を設定する。

```bash
$ minikube config set memory 16384
```

Kubernetesのバージョンのデフォルト値を設定する。

```bash
$ minikube config set kubernetes-version=v1.23.0
```

> - https://minikube.sigs.k8s.io/docs/commands/config/
> - https://stackoverflow.com/questions/45181585/how-to-use-new-release-of-kubernetes-as-default-in-minikube

<br>

### dashboard

#### ▼ dashboardとは

Kubernetesのダッシュボードを開発環境に作成する。

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

Minikubeのコンポーネントを削除する。

#### ▼ --profile

```bash
$ minikube delete --profile foo
```

#### ▼ all --purge

全てのコンポーネントを削除する。

```bash
$ minikube delete --all --purge
```

<br>

### docker-env

#### ▼ docker-envとは

ホストで `docker` コマンドを実行したときに、ホスト側のdockerデーモンでなく、ゲスト仮想環境内のNodeのdockerデーモンにリクエストを送信できるように環境変数を設定する。

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

もし、 Makefileのターゲット内でこれを実行する場合は、`$(shell ...)` とする。

```makefile
docker-env:
	eval $(shell minikube -p minikube docker-env)
```

> - https://minikube.sigs.k8s.io/docs/commands/docker-env/

#### ▼ -u

ホスト側のdockerデーモンを指定できるように、元に戻す。

```bash
$ eval $(minikube docker-env -u)
```

<br>

### ip

#### ▼ ipとは

ゲスト仮想環境内のNodeのIPアドレスを取得する。

```bash
$ minikube ip

192.168.49.2
```

<br>

### kubectl

#### ▼ kubectlとは

Minikubeのkube-apiserverをコンテキストとする `kubectl` コマンドを実行する。

ローカルマシンに `kubectl` コマンドがインストールされていなくとも、Minikubeに対してこれを実行できる。ClientとServerのバージョンが自動的に揃えられる。

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

Nodeを `1` 個だけ追加する。

#### ▼ --control-plane

コントロールプレーンNodeを追加する。

```bash
$ minikube node add --control-plane
```

#### ▼ --worker

ワーカーNodeを追加する。

```bash
$ minikube node add --worker
```

追加したワーカーNodeに `.metadata.labeles` キーを追加すれば、node affinityやnode selectorを検証できる。

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

Minikubeの資格情報が誤っている場合、正しく修正する。

```bash
$ minikube update-context

🎉  "minikube" context has been updated to point to 192.168.64.16:8443
💗  Current context is "minikube"
```

> - https://minikube.sigs.k8s.io/docs/commands/update-context/

<br>

### service

#### ▼ serviceとは

NodePort Serviceを指定し、ホストから仮想サーバーを介して、Node内のServiceにポートフォワーディングを実行する。

`http://127.0.0.1:<自動的に発行されたポート番号>` の形式でURLが発行されるため、ブラウザや `curl` コマンドで接続を確認できる。

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

これは、Istio Ingress GatewayをNodePort Serviceで作成している場合も使える。

```bash
$ minikube service istio-ingressgateway -n istio-ingress
```

> - https://minikube.sigs.k8s.io/docs/commands/service/
> - https://cstoku.dev/posts/2018/k8sdojo-09/#minikube%E3%81%A7%E3%81%AEnodeport%E3%81%B8%E3%81%AE%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9

ただし、ポートフォワーディングのポート番号がランダムなため、もしポート番号を固定したい場合は、`kubectl port-forward` コマンドでPodを指定すると良い。

```bash
# Podに直接的に指定する場合
$ kubectl port-forward pod/<Pod名> <ホストポート番号>:<Podのポート番号>

# Serviceの情報を使用して、Podを指定する場合
$ kubectl port-forward svc/<Service名> <ホストポート番号>:<Podのポート番号>

# ホストポートを介してPodのポートにリクエストを送信する。
$ curl http://127.0.0.1:<ホストポート番号>
```

> - https://mome-n.com/posts/minikube-service-fixed-port/

ServiceのIPアドレスがNodeのIPアドレスと一致することは、`minikube ip` コマンドから確認できる。

```bash
$ minikube ip

*.*.*.*
```

補足として、`minikube service` コマンドを使用せずに、`ssh` コマンドでNodeに接続しても、同様にServiceにリクエストを送信できる。

```bash
$ minikube ssh

# Nodeの中
$ curl -X GET http://*.*.*.*:57761
```

> - https://stackoverflow.com/questions/50564446/minikube-how-to-access-pod-via-pod-ip-using-curl

#### ▼ list

全てのServiceの情報を取得する。

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

Minikube仮想サーバー内のNodeのIPアドレスと、NodePort Serviceのポート番号を取得する。

`http://127.0.0.1:<自動的に発行されたポート番号>` の形式でURLが発行されるため、ブラウザや `curl` コマンドで接続を確認できる。

`--url` オプションを使用しない場合とは異なり、ポートフォワーディングを実行しない。

```bash
$ minikube service <NodePort Service名> --url -n foo-namespace

http://127.0.0.1:<自動的に発行されたポート番号>
```

これは、Istio Ingress GatewayをNodePort Serviceで作成している場合も使える。

```bash
$ minikube service istio-ingressgateway --url -n istio-ingress
```

> - https://minikube.sigs.k8s.io/docs/handbook/accessing/
> - https://cstoku.dev/posts/2018/k8sdojo-09/#minikube%E3%81%A7%E3%81%AEnodeport%E3%81%B8%E3%81%AE%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9

<br>

### ssh

#### ▼ sshとは

仮想環境内のNodeにSSH公開鍵認証で接続する。

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

Nodeの中では `docker` コマンドを実行でき、コンテナイメージもデバッグできる。

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

NodeにSSH公開鍵認証で接続し、任意のコマンドを実行する。

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

ゲスト仮想環境を作成し、仮想環境内にNodeを作成する。

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

コントロールプレーンNodeが作成されていることを確認できる。

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

Minikubeの各Nodeのハードウェアリソースを設定する (これはMinikubeクラスターの上限ではない) 。

そのため、DockerDesktopの上限を高く設定しておかないと、ホストOSがMinikubeクラスターに割り当てられるハードウェアリソースが足りなくなり、MinikubeのNodeが `NotReady` になる。

また、Nodeを増やすとMinikubeクラスター全体のハードウェアリソースの要求量が増える。

つまり最適解は、適度なハードウェアリソースを割り当てたNodeを最低限冗長化することである。

CPU4コアとメモリ7168MiBを持ったNodeが3台作られる。

```bash
$ minikube start --cpus=4 --memory=16384 --nodes 3
```

実際に設定されたハードウェアリソースは、Minikubeクラスター内から確認できる。

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

metrics-serverを入れて、`kubectl top node` コマンドを実行してもよいが、Minikubeクラスター全体であれば `minikube ssh` コマンドでMinikubeクラスターに入って確認したほうが良い。

#### ▼ --docker-env

別に `docker-env` コマンドを実行しつつ、`start` コマンドを実行する。

**＊例＊**

```bash
$ minikube start --docker-env
```

#### ▼ --ha

コントロールプレーンNodeを `3` 個に冗長化する。

kube-apiserverは負荷が高まりクラッシュしやすいため、対策になる。

ただ、ワーカーNode以外のNode数が増える。

ため、DockerDesktopの上限を高く設定しておかないと、ホストOSがMinikubeクラスターに割り当てられるハードウェアリソースが足りなくなり、MinikubeのNodeが `NotReady` になる。

```bash
$ minikube start --ha

NAME      STATUS   ROLES           AGE   VERSION
foo       Ready    control-plane   95s   v1.32.3
foo-m02   Ready    control-plane   85s   v1.32.3
foo-m03   Ready    control-plane   75s   v1.32.3
```

個別にコントロールプレーンNodeを追加しても良い。

```bash
$ minikube node add --control-plane
```

> - https://minikube.sigs.k8s.io/docs/tutorials/multi_control_plane_ha_clusters/

#### ▼ --driver

ゲスト仮想環境のドライバーを指定し、`start` コマンドを実行する。

ホストごとに標準の仮想環境が異なり、MacOSはDockerドライバーがデフォルトである。

ドライバーの使用前に、これをインストールしておく必要があることに注意する。

**＊例＊**

```bash
# 事前にVirtualBoxのダウンロードが必要。
$ minikube start --driver=virtualbox
```

> - https://minikube.sigs.k8s.io/docs/drivers/

#### ▼ --kubernetes-vsersion

Minikubeで稼働させるKubernetesのバージョンを指定しつつ、`start` コマンドを実行する。

```bash
$ minikube start --kubernetes-version=v1.23.0
```

> - https://minikube.sigs.k8s.io/docs/handbook/config/#kubernetes-configuration

#### ▼ --listen--address

Kubernetes Clusterに、ホストPC以外の外部から接続できるようにする。

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

作成するNode数を指定し、`start` コマンドを実行する。

マルチNodeのKubernetes Clusterを作成できる。

Minikubeは、同じCPUとメモリを持つNodeを冗長化するため、`--nodes` オプションでNodeを増やすだけ、Podのリソースに余裕がでる。

**＊例＊**

CPU4コアとメモリ7168GBを持ったNodeが3台作られる。

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

補足として、コントロールプレーンNodeも単なるNodeの `1` 個なため、Deploymentを作成すると、コントロールプレーンNodeにもPodをスケジューリングさせる。

```bash
$ kubectl get pod -o wide

NAME                     READY   STATUS    RESTARTS   AGE   IP           NODE           NOMINATED NODE   READINESS GATES
nginx-deployment-*****   1/1     Running   0          16m   10.244.0.3   minikube       <none>           <none>           # コントロールプレーンNode上にある。
nginx-deployment-*****   1/1     Running   0          16m   10.244.1.3   minikube-m02   <none>           <none>           # ワーカーNode上にある。
nginx-deployment-*****   1/1     Running   0          16m   10.244.1.2   minikube-m02   <none>           <none>
```

> - https://minikube.sigs.k8s.io/docs/tutorials/multi_node/

#### ▼ --profile

Kubernetes Clusterに名前をつけ、複数のKubernetes Clusterを作成できる。

Cluster名以外にも、例えば以下に影響する。

- Nodeのプレフィクス
- Dockerのネットワーク名

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

注意点として、執筆時点 (2025/02/03) では複数のKubernetes Cluster間を同じネットワークに接続できない。

異なるネットワークにおいて、ホストOSのドメイン (`host.minikube.internal`) を介して通信するしかない。

> - https://github.com/kubernetes/minikube/issues/14799#issuecomment-1216224631

#### ▼ --static-ip

MinikubeのNodeのIPアドレスを固定する。

マルチNodeに対応しておらず、Nodeを一台にしなければならない。

```bash
$ minikube start --static-ip 192.168.200.200
```

> - https://minikube.sigs.k8s.io/docs/tutorials/static_ip/
> - https://github.com/kubernetes/minikube/issues/18567

<br>

### tunnel

#### ▼ tunnelとは

LoadBalancerを一時的に作成し、LoadBalancer Serviceに自動的に紐付ける。

紐付けられたLoadBalancer Serviceには『External Endpoints (`http://127.0.0.1:80`) 』が割り当てられ、ここからLoadBalancer Serviceにリクエストを送信できるようになる。

Node外からPodへ通信できるようになる。`minikube ssh` コマンドでNodeに接続しつつ、公開されたServiceへリクエストを送信できる。

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
