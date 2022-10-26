---
title: 【IT技術の知見】コマンド＠Minikube
description: コマンド＠Minikubeの知見を記録しています。
---

# コマンド＠Minikube

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. minikubeコマンド

### addons

#### ▼ addonsとは

Minikubeのアドオンを操作する。

#### ▼ enable

アドオンを有効化するか否かを設定する。

> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/addons/

**＊例＊**

開発環境専用のIngressコントローラーとして、Nginx Ingressコントローラーを有効化するか否かを設定する。本番環境では、同じくNginxIngressコントローラーや、クラウドプロバイダーのロードバランサーなどを使用する。

> ℹ️ 参考：https://kubernetes.io/docs/tasks/access-application-cluster/ingress-minikube/

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

|-----------------------------|----------|--------------|-----------------------|
|         ADDON NAME          | PROFILE  |    STATUS    |      MAINTAINER       |
|-----------------------------|----------|--------------|-----------------------|
| ambassador                  | minikube | disabled     | unknown (third-party) |
| auto-pause                  | minikube | disabled     | google                |
| csi-hostpath-driver         | minikube | disabled     | kubernetes            |
| dashboard                   | minikube | enabled ✅   | kubernetes            |
| default-storageclass        | minikube | enabled ✅   | kubernetes            |
| efk                         | minikube | disabled     | unknown (third-party) |
| freshpod                    | minikube | disabled     | google                |
| gcp-auth                    | minikube | disabled     | google                |
| gvisor                      | minikube | disabled     | google                |
| helm-tiller                 | minikube | disabled     | unknown (third-party) |
| ingress                     | minikube | enabled ✅   | unknown (third-party) |
| ingress-dns                 | minikube | disabled     | unknown (third-party) |
| istio                       | minikube | disabled     | unknown (third-party) |
| istio-provisioner           | minikube | disabled     | unknown (third-party) |
| kubevirt                    | minikube | disabled     | unknown (third-party) |
| logviewer                   | minikube | disabled     | google                |
| metallb                     | minikube | disabled     | unknown (third-party) |
| metrics-server              | minikube | disabled     | kubernetes            |
| nvidia-driver-installer     | minikube | disabled     | google                |
| nvidia-gpu-device-plugin    | minikube | disabled     | unknown (third-party) |
| olm                         | minikube | disabled     | unknown (third-party) |
| pod-security-policy         | minikube | disabled     | unknown (third-party) |
| portainer                   | minikube | disabled     | portainer.io          |
| registry                    | minikube | disabled     | google                |
| registry-aliases            | minikube | disabled     | unknown (third-party) |
| registry-creds              | minikube | disabled     | unknown (third-party) |
| storage-provisioner         | minikube | enabled ✅   | kubernetes            |
| storage-provisioner-gluster | minikube | disabled     | unknown (third-party) |
| volumesnapshots             | minikube | disabled     | kubernetes            |
|-----------------------------|----------|--------------|-----------------------|
```

<br>

### cni

使用するcniアドオンを設定する。

> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/start/

```bash
$ minikube start --cni=bridge
```

<br>

### config

#### ▼ configとは

```minikube```コマンドに関するパラメーターを操作する。

#### ▼ set

```kubectl```コマンド実行時のデフォルト値を設定する。

> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/config/

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
minikube config set memory 16384
```

Kubernetesのバージョンのデフォルト値を設定する。

> ℹ️ 参考：https://stackoverflow.com/questions/45181585/how-to-use-new-release-of-kubernetes-as-default-in-minikube

```bash
$ minikube config set kubernetes-version=v1.23.0
```

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

### docker-env

#### ▼ docker-envとは

ホストで```docker```コマンドを実行した時に、ホスト側のdockerデーモンでなく、ゲスト仮想環境内のワーカーNodeのdockerデーモンにリクエストを送信できるように環境変数を設定する。バージョンタグが```latest```であると、仮想環境外に対してイメージをプルしてしまうことに注意する。

> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/docker-env/

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

もし、 Makefileのターゲット内でこれを実行する場合は、```$(shell ...)```とする。

```makefile
docker-env:
	eval $(shell minikube -p minikube docker-env)
```

#### ▼ -u

ホスト側のdockerデーモンを指定できるように、元に戻す。

```bash
$ eval $(minikube docker-env -u)
```

<br>

### ip

#### ▼ ipとは

ゲスト仮想環境内のワーカーNodeのIPアドレスを取得する。

```bash
$ minikube ip

192.168.49.2
```

<br>

### kubectl

#### ▼ kubectlとは

Minikubeのkube-apiserverをコンテキストとする```kubectl```コマンドを実行する。ローカルマシンに```kubectl```コマンドがインストールされていなくとも、Minikubeに対してこれを実行できる。ClientとServerのバージョンが自動的に揃えられる。

> ℹ️ 参考：
>
> - https://minikube.sigs.k8s.io/docs/handbook/kubectl/
> - https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_kubernetes_command.html

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
  GitVersion:"v1.22.3", # EKSであれば、『v1.22.10-eks-84b4fe6』になっている。
  GitCommit:"*****",
  GitTreeState:"clean",
  BuildDate:"2021-11-17T15:41:42Z",
  GoVersion:"go1.16.9",
  Compiler:"gc",
  Platform:"linux/amd64"
}
```

<br>

### mount

#### ▼ mountとは

ホスト側のファイルまたはディレクトリを、ゲスト仮想環境の指定したディレクトリにマウントする。

> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/handbook/mount/

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

<br>

### update-context

Minikubeのコンテキスト情報が誤っている場合、正しく修正する。

> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/update-context/

```bash
$ minikube update-context

🎉  "minikube" context has been updated to point to 192.168.64.16:8443
💗  Current context is "minikube"
```

<br>

### service

#### ▼ serviceとは

NodePort ServiceやLoadBalancer Serviceを指定し、ホストからServiceにポートフォワーディングを実行する。また、ServiceのIPアドレスを返却する。

> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/service/

```bash
$ minikube service <NodePort Servie名/LoadBalancer Servie名>

🏃  Starting tunnel for service <Service名>.
|-----------|--------------|-------------|------------------------|
| NAMESPACE |     NAME     | TARGET PORT |          URL           |
|-----------|--------------|-------------|------------------------|
| default   | <Service名>  |             | http://127.0.0.1:57761 |
|-----------|--------------|-------------|------------------------|

Opening service <Service名> in default browser...
```

ただし、ポートフォワーディングのポート番号がランダムなため、もしポート番号を固定したい場合は、```kubectl port-forward```コマンドでPodを指定すると良い。

> ℹ️ 参考：https://mome-n.com/posts/minikube-service-fixed-port/

```bash
# Podに直接的に指定する場合
$ kubectl port-forward pod/<Pod名> <ホストポート番号>:<Podのポート番号>

# Serviceの情報を使用して、Podを指定する場合
$ kubectl port-forward svc/<Service名> <ホストポート番号>:<Podのポート番号>

# ホストポートを介してPodのポートにアクセスする。
$ curl http://127.0.0.1:<ホストポート番号>
```

ServiceのIPアドレスがワーカーNodeのIPアドレスすることは、```minikube ip```コマンドから確認できる。

```bash
$ minikube ip

*.*.*.*
```

ちなみに、```minikube service```コマンドを使用せずに、```ssh```コマンドで仮想環境に接続しても、同様にServiceにリクエストを送信できる。

> ℹ️ 参考：https://stackoverflow.com/questions/50564446/minikube-how-to-access-pod-via-pod-ip-using-curl

```bash
$ minikube ssh

# 仮想環境の中
$ curl -X GET http://*.*.*.*:57761
```

#### ▼ list

全てのServiceの情報を取得する。

```bash
$ minikube service list

|----------------------|---------------------------|--------------|---------------------------|
|      NAMESPACE       |           NAME            | TARGET PORT  |            URL            |
|----------------------|---------------------------|--------------|---------------------------|
| default              | foo-service               | http/80      | http://*.*.*.*:30001      |
| default              | bar-service               | http/80      | http://*.*.*.*:30000      |
| default              | kubernetes                | No node port |                           |
| kube-system          | kube-dns                  | No node port |                           |
| kubernetes-dashboard | dashboard-metrics-scraper | No node port |                           |
| kubernetes-dashboard | kubernetes-dashboard      | No node port |                           |
|----------------------|---------------------------|--------------|---------------------------|
```

#### ▼ --url

指定したServiceのIPアドレスを含むURLを取得する。

```bash
 $ minikube service <Service名> --url
 
http://*.*.*.*:57761
```

<br>

### ssh

#### ▼ sshとは

仮想環境にSSH接続を行う。

> ℹ️ 参考：
>
> - https://minikube.sigs.k8s.io/docs/commands/ssh/
> - https://garafu.blogspot.com/2019/10/ssh-minikube-k8s-vm.html

```bash
# Dockerドライバーによる仮想環境の場合
$ minikube ssh  

# ワーキングディレクトリ
docker@minikube:~$ pwd
/home/docker

# aptコマンドを使用できる。
docker@minikube:~$ sudo apt update -y && apt --help
```

```bash
# VirtualBoxドライバーによる仮想環境の場合
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
# HyperKitドライバーによる仮想環境の場合
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

ワーカーNodeの中では```docker```コマンドを実行でき、コンテナイメージもデバッグできる。

```bash
$ minikube ssh  

# ワーカーNodeの中
$ docker run --rm -it <ビルドに失敗したコンテナイメージID> /bin/bash

# コンテナの中
[root@<コンテナID>:~] $ ls -la 
```

#### ▼ ``--``（ハイフン2つ）

仮想環境にSSH接続を実行し、任意のコマンドを実行する。

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

ゲスト仮想環境を作成し、仮想環境内にワーカーNodeを作成する。

> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/start/

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

#### ▼ --cpus、--memory

MinikubeのワーカーNodeのスペックを設定する。

```bash
$ minikube start --cpus=4 --memory=16384
```

実際に設定されたハードウェアリソースは、Minikube内から確認できる。

```bash
$ minikube ssh

# CPUを確認する。
$ cat /proc/cpuinfo

processor       : 0
BogoMIPS        : 48.00
Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm jscvt fcma lrcpc dcpop sha3 asimddp sha512 asimdfhm dit uscat ilrcpc flagm sb paca pacg dcpodp flagm2 frint
CPU implementer : 0x00
CPU architecture: 8
CPU variant     : 0x0
CPU part        : 0x000
CPU revision    : 0

...

processor       : 3
BogoMIPS        : 48.00
Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm jscvt fcma lrcpc dcpop sha3 asimddp sha512 asimdfhm dit uscat ilrcpc flagm sb paca pacg dcpodp flagm2 frint
CPU implementer : 0x00
CPU architecture: 8
CPU variant     : 0x0
CPU part        : 0x000
CPU revision    : 0

# メモリの確認する。
$ free -m
              total        used        free      shared  buff/cache   available
Mem:           7951        1853        3080         333        3017        5594
Swap:          1023           0        1023
```

#### ▼ --docker-env

別に```docker-env```コマンドを実行しつつ、```start```コマンドを実行する。

**＊例＊**

```bash
$ minikube start --docker-env
```

#### ▼ --driver

ゲスト仮想環境のドライバーを指定し、```start```コマンドを実行する。ホストごとに標準の仮想環境が異なり、MacOSはDockerドライバーがデフォルトである。ドライバーの使用前に、これをインストールしておく必要があることに注意する。

> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/drivers/

**＊例＊**

```bash
# 事前にVirtualBoxのダウンロードが必要。
$ minikube start --driver=virtualbox
```

#### ▼ --kubernetes-vsersion

Minikubeで稼働させるKubernetesのバージョンを指定しつつ、```start```コマンドを実行する。

> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/handbook/config/#kubernetes-configuration

```bash
$ minikube start --kubernetes-version=v1.23.0
```

#### ▼ --mount、--mount--string

ホストとゲスト仮想環境間のマウントディレクトリを指定しつつ、```start```コマンドを実行する。

**＊例＊**

```bash
$ minikube start --mount=true --mount-string="/Users/hiroki.hasegawa/projects/foo:/data"
```

#### ▼ --nodes

作成するワーカーNode数を指定し、```start```コマンドを実行する。マルチワーカーNodeのClusterを作成できる。

> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/tutorials/multi_node/

**＊例＊**

```bash
$ minikube start --nodes 3

$ kubectl get node
NAME           STATUS   ROLES                  AGE   VERSION
minikube       Ready    control-plane,master   76s   v1.22.0 # コントロールプレーンNode
minikube-m02   Ready    <none>                 42s   v1.22.0 # ワーカーNode
minikube-m03   Ready    <none>                 19s   v1.22.0
minikube-m04   Ready    <none>                 19s   v1.22.0
```

<br>

### tunnel

#### ▼ tunnelとは

LoadBalancerを一時的に作成し、LoadBalancer Serviceに自動的に紐づける。紐付けられたLoadBalancer Serviceには『External Endpoints（```http://127.0.0.1:80```）』が割り当てられ、ここからLoadBalancer Serviceにアクセスできるようになる。ワーカーNode外からPodに通信できるようになる。```minikube ssh```コマンドでワーカーNodeに接続しつつ、公開されたServiceにリクエストを送信できる。

> ℹ️ 参考：
>
> - https://minikube.sigs.k8s.io/docs/commands/tunnel/
> - https://minikube.sigs.k8s.io/docs/handbook/accessing/#using-minikube-tunnel

**＊例＊**

```bash
$ minikube tunnel

✅  Tunnel successfully started

📌  NOTE: Please do not close this terminal as this process must stay alive for the tunnel to be accessible ...

❗  The service/ingress <Service名> requires privileged ports to be exposed: [80]
🔑  sudo permission will be asked for it.
🏃  Starting tunnel for service <Service名>.
```

<br>

## 03. デバッグ

### --alsologtostderr

コマンドの詳細な実行ログを標準エラー出力に出力する。

> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/handbook/troubleshooting/

```bash
$ minikube start --alsologtostderr
```



