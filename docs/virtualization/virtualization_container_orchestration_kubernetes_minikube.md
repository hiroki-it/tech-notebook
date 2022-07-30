---
title: 【IT技術の知見】Minikube＠仮想化
description: Minikube＠仮想化の知見を記録しています。
---

# Minikube＠仮想化

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Minikubeの仕組み

### アーキテクチャ

#### ▼ 仮想サーバー系のドライバーの場合

ホストマシン上に仮想サーバーを作成する。この仮想サーバー内に単一のワーカーNodeを持つClusterを作成する。

ℹ️ 参考：

- https://minikube.sigs.k8s.io/docs/commands/
- https://richardroseblog.wordpress.com/2017/11/01/minikube-creating-a-cluster/

![minikube_architecture_virtual_machine_driver](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/minikube_architecture_virtual_machine_driver.png)

#### ▼ Dockerドライバーの場合

ホストマシン上にコンテナを作成する。このコンテナ内に仮想サーバーを作成し、単一のワーカーNodeを持つClusterを作成する。

ℹ️ 参考：https://zenn.dev/castaneai/articles/local-kubernetes-networking

![minikube_architecture_docker_driver](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/minikube_architecture_docker_driver.png)

<br>

### ドライバー

#### ▼ ドライバーとは

ゲスト（ワーカーNode）側のOSを設定する。ホスト側のOS（Linux、MacOS、Windows）や、これらOSのバージョンによって、使用できるドライバーが異なる。

ℹ️ 参考：https://ytooyama.hatenadiary.jp/entry/2021/06/04/154320

#### ▼ ドライバーの種類

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/drivers/

| ホスト側のOS | ゲスト（ワーカーNode）側のOS              |
|---------|--------------------------------|
| Linux   | VirtualBox、Docker、KVM2、...     |
| MacOS   | VirtualBox、Docker、HyperKit、... |
| Windows | VirtualBox、Docker、Hyper-V、...  |

<br>

### Podへの接続

#### ▼ NodePort Service経由

NodePort Serviceを作成しておく。```minikube ip```コマンドを実行することにより、NodeのIPアドレスが返却される。このIPアドレスからPodにアクセスできる。

ℹ️ 参考：https://future-architect.github.io/articles/20220112a/

```bash
$ minikube ip
```

#### ▼ LoadBalancer Service経由

LoadBalancer Serviceを作成しておく。```minikube tunnel```コマンドを実行することにより、LoadBalancer Serviceに```EXTERNAL-IP```が割り当てられる。このIPアドレスからPodにアクセスできる。

ℹ️ 参考：https://future-architect.github.io/articles/20220112a/

```bash
$ minikube tunnel
```

#### ▼ Ingress経由

ClusterIP ServiceとIngress（Minikubeアドオン製）を作成しておく。```kubectl get ingress```コマンドを実行することにより、Ingressに割り当てられたIPアドレスを取得できる。```minikube ssh```コマンドで仮想環境内に接続した後、このIPアドレスからPodにアクセスできる。

ℹ️ 参考：https://future-architect.github.io/articles/20220112a/

```bash
$ minikube ssh

Last login: Wed May 18 10:14:50 2022 from 192.168.49.1

docker@minikube:~$ curl -X GET http://<IPアドレス>
```

<br>

## 01-02. マウント

### ホストとワーカーNode間マウント

#### ▼ 標準のホストとワーカーNode間マウント

ホスト側の```$MINIKUBE_HOME/files```ディレクトリ配下に保存されたファイルは、ゲスト仮想環境内のワーカーNodeのルート直下にマウントされる。

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/handbook/filesync/

```bash
$ mkdir -p ~/.minikube/files/etc

$ echo nameserver 8.8.8.8 > ~/.minikube/files/etc/foo.conf

#  /etc/foo.conf に配置される
$ minikube start
```

#### ▼ 各ドライバーのホストとワーカーNode間マウント

ホスト以下のディレクトリ配下に保存されたファイルは、ゲスト仮想環境内のワーカーNodeの決められたディレクトリにマウントされる。

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/handbook/mount/#driver-mounts

| ドライバー名        | ホスト側のOS | ホスト側のディレクトリ     | ゲスト仮想環境内のワーカーNodeのディレクトリ |
|---------------|---------|-----------------|--------------------------|
| VirtualBox    | Linux   | ```/home```     | ```/hosthome```          |
| VirtualBox    | macOS   | ```/Users```    | ```/Users```             |
| VirtualBox    | Windows | ```C://Users``` | ```/c/Users```           |
| VMware Fusion | macOS   | ```/Users```    | ```/mnt/hgfs/Users```    |
| KVM           | Linux   | なし              |                          |
| HyperKit      | Linux   | なし（NFSマウントを参照）  |                          |

<br>

### ワーカーNodeとコンテナ間マウント

#### ▼ 標準のワーカーNodeとコンテナ間マウント

ゲスト仮想環境内のワーカーNodeでは、以下のディレクトリからPersistentVolumeが自動的に作成される。そのため、Podでは作成されたPersistentVolumeをPersistentVolumeClaimで指定しさえすればよく、わざわざワーカーNodeのPersistentVolumeを作成する必要がない。ただし、DockerドライバーとPodmanドライバーを使用する場合は、この機能がないことに注意する。

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/handbook/persistent_volumes/

- ```/data```
- ```/var/lib/minikube```
- ```/var/lib/docker```
- ```/var/lib/containerd```
- ```/var/lib/buildkit```
- ```/var/lib/containers```
- ```/tmp/hostpath_pv```
- ```/tmp/hostpath-provisioner```

<br>

### ホスト-ワーカーNodeとコンテナ間

#### ▼ ホストをコンテナにマウントする方法

Minikubeでは、```mount```コマンド、ホスト側の```$MINIKUBE_HOME/files```ディレクトリ、ドライバーごとのを使用して、ホスト側のディレクトリをゲスト仮想環境内のワーカーNodeのディレクトリにマウントできる。またワーカーNodeでは、決められたディレクトリからPersistentVolumeを自動的に作成する。ここで作成されたPersistentVolumeを、PodのPersistentVolumeClaimで指定する。このように、ホストからワーカーNode、ワーカーNodeからPodへマウントを実行することにより、ホスト側のディレクトリをPod内コンテナに間接的にマウントできる。

ℹ️ 参考：https://stackoverflow.com/questions/48534980/mount-local-directory-into-pod-in-minikube

#### ▼ HyperKitドライバーを使用する場合

**＊例＊**

（１）HyperKitドライバーを使用する場合、ホストとワーカーNode間のマウント機能がない。そこで```mount```コマンドを使用して、ホスト側のディレクトリをワーカーNodeのボリュームにマウントする。

```bash
$ minikube start --driver=hyperkit --mount=true --mount-string="/Users/hiroki.hasegawa/projects/foo:/data"
```

（２）ワーカーNodeのボリュームをPod内コンテナにマウントする。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo-pod
    spec:
      containers:
        - name: foo-gin
          image: foo-gin:dev
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          volumeMounts:
            - name: foo-gin
              mountPath: /go/src
      volumes:
        - name: foo-gin
          hostPath:
            path: /data
            type: DirectoryOrCreate
```

<br>

## 01-03. ネットワーク

### KubernetesリソースのCIDRブロック

#### ▼ ワーカーNode

ワーカーNode内で```ip addr```コマンドを実行すると、ワーカーNodeに割り当てられたCIDRブロックを確認できる。

ℹ️ 参考：https://nishipy.com/archives/1467

**＊例＊**

CNIとしてBridgeアドオンを使用している。CIDRブロックは、```192.168.49.2/24```である。

```bash
$ minikube ssh

# ワーカーNodeの中
docker@minikube:~$ ip addr | grep eth0

10: eth0@if11: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    inet 192.168.49.2/24 brd 192.168.49.255 scope global eth0
```

#### ▼ Pod

ワーカーNode内で```/etc/cni/net.d```ディレクトリ配下にあるファイルを確認すると、Podに割り当てられたCIDRブロックを確認できる。

ℹ️ 参考：https://nishipy.com/archives/1467

**＊例＊**

CNIとしてBridgeアドオンを使用している。CIDRブロックは、```10.85.0.0/16```である。

```bash
$ minikube ssh

# ワーカーNodeの中
docker@minikube:~$ ls -la /etc/cni/net.d
-rw-r--r-- 1 root root  438 Nov 11  2021 100-crio-bridge.conf
-rw-r--r-- 1 root root   54 Nov 11  2021 200-loopback.conf

docker@minikube:~$ cat /etc/cni/net.d/100-crio-bridge.conf 

{
    "cniVersion": "0.3.1",
    "name": "crio",
    "type": "bridge",
    "bridge": "cni0",
    "isGateway": true,
    "ipMasq": true,
    "hairpinMode": true,
    "ipam": {
        "type": "host-local",
        "routes": [
            { "dst": "0.0.0.0/0" },
            { "dst": "1100:200::1/24" }
        ],
        "ranges": [
            [{ "subnet": "10.85.0.0/16" }],
            [{ "subnet": "1100:200::/24" }]
        ]
    }
}
```

<br>

## 03. minikubeコマンド

### addons

#### ▼ addonsとは

Minikubeのアドオンを操作する。

#### ▼ enable

アドオンを有効化するか否かを設定する。

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/addons/

**＊例＊**

開発環境専用のIngressコントローラーとして、Nginx Ingressコントローラーを有効化するか否かを設定する。本番環境では、同じくNginxIngressコントローラーや、クラウドプロバイダーのロードバランサーなどを使用する。

ℹ️ 参考：https://kubernetes.io/docs/tasks/access-application-cluster/ingress-minikube/

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

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/start/

```bash
$ minikube start --cni=bridge
```

<br>

### config

#### ▼ configとは

minikubeコマンドに関するパラメーターを操作する。

#### ▼ set

```kubectl```コマンド実行時のデフォルト値を設定する。

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/config/

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

ℹ️ 参考：https://stackoverflow.com/questions/45181585/how-to-use-new-release-of-kubernetes-as-default-in-minikube

```bash
$ minikube config set kubernetes-version=v1.23.0
```

<br>

### dashboard

#### ▼ dashboardとは

Kubernetesのダッシュボードを開発環境に作成する。

**＊実行例＊**

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

ホストでdockerコマンドを実行した時に、ホスト側のdockerデーモンでなく、ゲスト仮想環境内のワーカーNodeのdockerデーモンをコールできるように環境変数を設定する。バージョンタグが```latest```であると、仮想環境外に対してイメージをプルしてしまうことに注意する。

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/docker-env/

**＊実行例＊**

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

ℹ️ 参考：

- https://minikube.sigs.k8s.io/docs/handbook/kubectl/
- https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_container_kubernetes_command.html

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

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/handbook/mount/

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

Minikubeのコンテキスト情報が誤っている場合に、正しく修正する。

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/update-context/

```bash
$ minikube update-context

🎉  "minikube" context has been updated to point to 192.168.64.16:8443
💗  Current context is "minikube"
```

<br>

### service

#### ▼ serviceとは

NodePort ServiceやLoadBalancer Serviceを指定し、ホストからServiceにポートフォワーディングを実行する。また、ServiceのIPアドレスを返却する。

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/service/

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

ただし、ポートフォワーディングのポート番号がランダムなため、もしポート番号を固定したい場合は、Serviceを経由せずに直接的にPodに接続できる```kubectl port-forward```コマンドを使用すると良い。

ℹ️ 参考：https://mome-n.com/posts/minikube-service-fixed-port/

```bash
$ kubectl port-forward <Service名> 8080:80
```

ServiceのIPアドレスがワーカーNodeのIPアドレスすることは、```minikube ip```コマンドから確認できる。

```bash
$ minikube ip

*.*.*.*
```

ちなみに、```minikube service```コマンドを使用せずに、```ssh```コマンドで仮想環境に接続しても、同様にServiceにリクエストを送信できる。

ℹ️ 参考：https://stackoverflow.com/questions/50564446/minikube-how-to-access-pod-via-pod-ip-using-curl

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

ℹ️ 参考：

- https://minikube.sigs.k8s.io/docs/commands/ssh/
- https://garafu.blogspot.com/2019/10/ssh-minikube-k8s-vm.html

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

# 〜 中略 〜

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

**＊実行例＊**

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

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/commands/start/

**＊実行例＊**

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

ワーカーNodeが作成されていることを確認できる。

```bash
$ kubectl get nodes

NAME       STATUS   ROLES                  AGE   VERSION
minikube   Ready    control-plane,master   14m   v1.22.3
```

#### ▼ --cpus、--memory

MinikubeのNodeのスペックを設定する。

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

# 〜 中略 〜

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

**＊実行例＊**

```bash
$ minikube start --docker-env
```

#### ▼ --driver

ゲスト仮想環境のドライバーを指定し、```start```コマンドを実行する。ホストごとに標準の仮想環境が異なり、MacOSはDockerドライバーがデフォルトである。ドライバーの使用前に、これをインストールしておく必要があることに注意する。

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/drivers/

**＊実行例＊**

```bash
# 事前にVirtualBoxのダウンロードが必要。
$ minikube start --driver=virtualbox
```

#### ▼ --kubernetes-vsersion

Minikubeで稼働させるKubernetesのバージョンを指定しつつ、```start```コマンドを実行する。

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/handbook/config/#kubernetes-configuration

```bash
$ minikube start --kubernetes-version=v1.23.0
```

#### ▼ --mount、--mount--string

ホストとゲスト仮想環境間のマウントディレクトリを指定しつつ、```start```コマンドを実行する。

**＊実行例＊**

```bash
$ minikube start --mount=true --mount-string="/Users/hiroki.hasegawa/projects/foo:/data"
```

#### ▼ --nodes

作成するワーカーNode数を指定し、```start```コマンドを実行する。

**＊実行例＊**

```bash
$ minikube start --nodes 3

$ kubectl get nodes
NAME           STATUS   ROLES                  AGE   VERSION
minikube       Ready    control-plane,master   76s   v1.20.2
minikube-m02   Ready    <none>                 42s   v1.20.2
minikube-m03   Ready    <none>                 19s   v1.20.2
```

<br>

### tunnel

#### ▼ tunnelとは

LoadBalancerを一時的に作成し、LoadBalancer Serviceに自動的に紐づける。紐付けられたLoadBalancer Serviceには『External Endpoints（```http://127.0.0.1:80```）』が割り当てられ、ここからLoadBalancer Serviceにアクセスできるようになる。Clusterネットワーク外からPodに接続できるようになる。```minikube ssh```コマンドでワーカーNodeに接続しつつ、公開されたServiceにリクエストを送信できる。

ℹ️ 参考：

- https://minikube.sigs.k8s.io/docs/commands/tunnel/
- https://minikube.sigs.k8s.io/docs/handbook/accessing/#using-minikube-tunnel

**＊実行例＊**

```bash
$ minikube tunnel

✅  Tunnel successfully started

📌  NOTE: Please do not close this terminal as this process must stay alive for the tunnel to be accessible ...

❗  The service/ingress <Serivce名> requires privileged ports to be exposed: [80]
🔑  sudo permission will be asked for it.
🏃  Starting tunnel for service <Service名>.
```

<br>

## 03. デバッグ

### --alsologtostderr

コマンドの詳細な実行ログを標準エラー出力に出力する。

ℹ️ 参考：https://minikube.sigs.k8s.io/docs/handbook/troubleshooting/

```bash
$ minikube start --alsologtostderr
```



