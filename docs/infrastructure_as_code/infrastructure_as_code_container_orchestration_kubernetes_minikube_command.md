# minikubeコマンド

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. minikubeコマンド

### minikubeコマンドとは

ゲスト仮想環境を構築し，また仮想環境下で単一のワーカーノードを持つクラスターを作成するコマンド．

参考：https://minikube.sigs.k8s.io/docs/commands/

<br>

### addons

#### ・addonsとは

minikubeのプラグインを操作する．

#### ・enable

プラグインを有効化する．

参考：https://minikube.sigs.k8s.io/docs/commands/addons/

**＊例＊**

開発環境専用のIngressコントローラーとして，NginxIngressコントローラーを有効化する．本番環境では，同じくNginxIngressコントローラーや，クラウドベンダーのロードバランサーなどを用いる．

参考：https://kubernetes.io/ja/docs/tasks/access-application-cluster/ingress-minikube/

```bash
$ minikube addons enable ingress
```

#### ・list

有効可能なプラグインの一覧を表示する．

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

### config

#### ・configとは

minikubeコマンドに関するパラメータを操作する．

#### ・set

パラメータのデフォルト値を設定する．

**＊例＊**

デフォルトのドライバーを設定する．

```bash
$ minikube config set driver virtualbox
```

デフォルトのメモリ容量を設定する．

```bash
$ minikube config set cpus 12
```

デフォルトのCPU容量を設定する．

```bash
$ minikube config set memory 4096
```

<br>

### dashboard

#### ・dashboardとは

Kubernetesのダッシュボードを開発環境に構築する．

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

#### ・docker-envとは

ホストでdockerコマンドを実行した時に，ホスト側のdockerデーモンでなく，ゲスト仮想環境内のワーカーノードのdockerデーモンをコールできるように環境変数を設定する．イメージタグが```latest```であると，仮想環境外に対してイメージをプルしてしまうことに注意する．

参考：https://minikube.sigs.k8s.io/docs/commands/docker-env/

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

<br>

### ip

#### ・ipとは

ゲスト仮想環境内のワーカーノードのIPアドレスを表示する．

#### ・オプションなし

```bash
$ minikube ip

192.168.49.2
```

<br>

### mount

#### ・mountとは

ホスト側のファイルまたはディレクトリを，ゲスト仮想環境の指定したディレクトリにマウントする．

参考：https://minikube.sigs.k8s.io/docs/handbook/mount/

#### ・オプション無し

```bash
$ minikube mount /Users/hiroki-it/projects/foo:/data

📁  Mounting host path /Users/hiroki-it/projects/foo into VM as /data ...
    ▪ Mount type:   
    ▪ User ID:      docker
    ▪ Group ID:     docker
    ▪ Version:      9p2000.L
    ▪ Message Size: 262144
    ▪ Permissions:  755 (-rwxr-xr-x)
    ▪ Options:      map[]
    ▪ Bind Address: 127.0.0.1:61268
🚀  Userspace file server: ufs starting
✅  Successfully mounted /Users/hiroki-it/projects/foo to /data

📌  NOTE: This process must stay alive for the mount to be accessible ...
```

<br>

### service

#### ・serviceとは

Serviceを操作する．

#### ・list

全てのServiceの情報を表示する．

```bash
$ minikube service list

|----------------------|---------------------------|--------------|---------------------------|
|      NAMESPACE       |           NAME            | TARGET PORT  |            URL            |
|----------------------|---------------------------|--------------|---------------------------|
| default              | foo-service               | http/80      | http://nnn.nnn.nn.n:30001 |
| default              | bar-service               | http/80      | http://nnn.nnn.nn.n:30000 |
| default              | kubernetes                | No node port |                           |
| kube-system          | kube-dns                  | No node port |                           |
| kubernetes-dashboard | dashboard-metrics-scraper | No node port |                           |
| kubernetes-dashboard | kubernetes-dashboard      | No node port |                           |
|----------------------|---------------------------|--------------|---------------------------|
```

#### ・--url

指定したServiceにアクセスするためのURLを表示する．ブラウザ上からServiceにリクエストを送信できるようになる．

```bash
 $ minikube service <Service名> --url
🏃  Starting tunnel for service <Service名>.
|-----------|--------------|-------------|------------------------|
| NAMESPACE |     NAME     | TARGET PORT |          URL           |
|-----------|--------------|-------------|------------------------|
| default   | <Service名>   |             | http://127.0.0.1:57761 |
|-----------|--------------|-------------|------------------------|
http://nnn.nnn.nn.n:57761
❗  Because you are using a Docker driver on darwin, the terminal needs to be open to run it.
```

表示されるIPアドレスは，ワーカーノードのIPアドレスである．

```bash
$ minikube ip

nnn.nnn.nn.n
```

ちなみに，```ssh```コマンドで仮想環境に接続しても，同様にServiceにリクエストを送信できるようになる．

参考：https://stackoverflow.com/questions/50564446/minikube-how-to-access-pod-via-pod-ip-using-curl

```bash
$ minikube ssh

# 仮想環境の中
$ curl http://nnn.nnn.nn.n:57761
```

<br>

### ssh

#### ・sshとは

仮想環境内のワーカーノードにSSH接続を行う．

参考：

- https://minikube.sigs.k8s.io/docs/commands/ssh/
- https://garafu.blogspot.com/2019/10/ssh-minikube-k8s-vm.html

ワーカーノードの中では```docker```コマンドを実行でき，イメージのデバッグも可能である．

```bash
$ minikube ssh  

# ワーカーノードの中
$ docker run --rm -it <ビルドに失敗したイメージID> /bin/bash

# コンテナの中
[root@<コンテナID>:~] $ ls -la 
```

#### ・オプション無し

```bash
# Dockerドライバーによる仮想環境の場合
$ minikube ssh  

docker@minikube:~$ pwd
/home/docker
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

$ pwd
/home/docker
```

<br>

### start

#### ・startとは

ゲスト仮想環境を構築し，仮想環境内にワーカーノードを作成する．

参考：https://minikube.sigs.k8s.io/docs/commands/start/

#### ・オプションなし

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

ワーカーノードが構築されていることを確認できる．

```bash
$ kubectl get nodes

NAME       STATUS   ROLES                  AGE   VERSION
minikube   Ready    control-plane,master   14m   v1.22.3
```

#### ・--docker-env

別に```docker-env```コマンドを実行しつつ，```start```コマンドを実行する．

**＊例＊**

```bash
$ minikube start --docker-env
```

#### ・--driver

ゲスト仮想環境のドライバーを指定し，```start```コマンドを実行する．ホストごとに標準の仮想環境が異なり，MacOSはDockerドライバーがデフォルトである．ドライバーの使用前に，これをインストールしておく必要があることに注意する．

参考：https://minikube.sigs.k8s.io/docs/drivers/

**＊例＊**

```bash
# 事前にVirtualBoxのダウンロードが必要．
$ minikube start --driver=virtualbox
```

#### ・--mount，--mount--string

ホストとゲスト仮想環境間のマウントディレクトリを指定しつつ，```start```コマンドを実行する．

**＊例＊**

```bash
$ minikube start --mount=true --mount-string="/Users/hiroki-it/projects/foo:/data"
```

#### ・--nodes

作成するワーカーノード数を指定し，```start```コマンドを実行する．

**＊例＊**

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

#### ・tunnelとは

LoadBalancerServiceを用いている場合に，ServiceのクラスターIPを外部エンドポイントにし，Serviceを公開する．```minikube ssh```コマンドでワーカーノードに接続しつつ，公開されたServiceにリクエストを送信できる．

参考：

- https://minikube.sigs.k8s.io/docs/commands/tunnel/
- https://minikube.sigs.k8s.io/docs/handbook/accessing/#using-minikube-tunnel

#### ・オプションなし

**＊例＊**

```bash
$ minikube tunnel
```

<br>

## 02. マウント

### ホスト-ワーカーノード間マウント

#### ・標準のホスト-ワーカーノード間マウント

ホスト側の```$MINIKUBE_HOME/files```ディレクトリに保存されたファイルは，ゲスト仮想環境内のワーカーノードのルート直下にマウントされる．

参考：https://minikube.sigs.k8s.io/docs/handbook/filesync/

```bash
$ mkdir -p ~/.minikube/files/etc

$ echo nameserver 8.8.8.8 > ~/.minikube/files/etc/foo.conf

#  /etc/foo.conf に配置される
$ minikube start
```

#### ・仮想化ドライバー別のホスト-ワーカーノード間マウント

ホスト以下のディレクトリに保存されたファイルは，ゲスト仮想環境内のワーカーノードの決められたディレクトリにマウントされる．

参考：https://minikube.sigs.k8s.io/docs/handbook/mount/#driver-mounts

| ドライバー名  | OS      | ホスト側のディレクトリ    | ゲスト仮想環境内のワーカーノードのディレクトリ |
| ------------- | ------- | ------------------------- | -------------------------------------- |
| VirtualBox    | Linux   | ```/home```               | ```/hosthome```                        |
| VirtualBox    | macOS   | ```/Users```              | ```/Users```                           |
| VirtualBox    | Windows | ```C://Users```           | ```/c/Users```                         |
| VMware Fusion | macOS   | ```/Users```              | ```/mnt/hgfs/Users```                  |
| KVM           | Linux   | なし                      |                                        |
| HyperKit      | Linux   | なし（NFSマウントを参照） |                                        |

<br>

### ワーカーノード-コンテナ間マウント

#### ・標準のワーカーノード-コンテナ間マウント

ゲスト仮想環境内のワーカーノードでは，以下のディレクトリからPersistentVolumeが自動的に作成される．そのため，Podでは作成されたPersistentVolumeをPersistentVolumeClaimで指定しさえすればよく，わざわざワーカーノードのPersistentVolumeを作成する必要がない．ただし，DockerドライバーとPodmanドライバーを用いる場合は，この機能がないことに注意する．

参考：https://minikube.sigs.k8s.io/docs/handbook/persistent_volumes/

- ```/data```
- ```/var/lib/minikube```
- ```/var/lib/docker```
- ```/var/lib/containerd```
- ```/var/lib/buildkit```
- ```/var/lib/containers```
- ```/tmp/hostpath_pv```
- ```/tmp/hostpath-provisioner```

<br>

### ホスト-ワーカーノード-コンテナ間

#### ・ホストをコンテナにマウントする方法

minikubeでは，```mount```コマンド，ホスト側の```$MINIKUBE_HOME/files```ディレクトリ，仮想化ドライバーごとのを用いて，ホスト側のディレクトリをゲスト仮想環境内のワーカーノードのディレクトリにマウントできる．またワーカーノードでは，決められたディレクトリからPersistentVolumeを自動的に作成する．ここで作成されたPersistentVolumeを，PodのPersistentVolumeClaimで指定する．このように，ホストからワーカーノード，ワーカーノードからPodへマウントを実行することにより，ホスト側のディレクトリをPod内のコンテナに間接的にマウントできる．

参考：https://stackoverflow.com/questions/48534980/mount-local-directory-into-pod-in-minikube

#### ・HyperKitドライバーを用いる場合

**＊例＊**

（１）HyperKitドライバーを用いる場合，ホストとワーカーノード間のマウント機能がない．そこで```mount```コマンドを用いて，ホスト側のディレクトリをワーカーノードのボリュームにマウントする．

```bash
$ minikube start --driver=hyperkit --mount=true --mount-string="/Users/h.hasegawa/projects/foo:/data"
```

（２）ワーカーノードのボリュームをPod内のコンテナにマウントする．

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: foo-pod
  template:
    metadata:
      labels:
        app: foo-pod
    spec:
      containers:
        - name: foo-lumen
          image: foo-lumen:dev
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 9000
          volumeMounts:
            - name: foo-lumen
              mountPath: /var/www/foo
          workingDir: /var/www/foo
        - name: foo-nginx
          image: foo-nginx:dev
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8000
      volumes:
        - name: foo-lumen
          hostPath:
            path: /data
            type: DirectoryOrCreate
```





