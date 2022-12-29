---
title: 【IT技術の知見】Minikube＠開発環境
description: Minikube＠開発環境の知見を記録しています。
---

# Minikube＠開発環境

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Minikubeの仕組み

### アーキテクチャ

#### ▼ 仮想サーバー系のドライバーの場合

ホストマシン上に仮想サーバーを作成する。

この仮想サーバー内にNodeを持つClusterを作成する。



> ℹ️ 参考：
>
> - https://minikube.sigs.k8s.io/docs/commands/
> - https://richardroseblog.wordpress.com/2017/11/01/minikube-creating-a-cluster/

![minikube_architecture_virtual_machine_driver](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/minikube_architecture_virtual_machine_driver.png)

#### ▼ Dockerドライバーの場合

ホストマシン上にコンテナを作成する。

このコンテナ内に仮想サーバーを作成し、Nodeを持つClusterを作成する。



> ℹ️ 参考：https://zenn.dev/castaneai/articles/local-kubernetes-networking

![minikube_architecture_docker_driver](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/minikube_architecture_docker_driver.png)

<br>

### ドライバー

#### ▼ ドライバーとは

ゲスト（Node）側のOSを設定する。

ホスト側のOS（Linux、MacOS、Windows）や、これらOSのバージョンによって、使用できるドライバーが異なる。



> ℹ️ 参考：https://ytooyama.hatenadiary.jp/entry/2021/06/04/154320

#### ▼ ドライバーの種類

> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/drivers/

| ホスト側のOS | ゲスト（Node）側のOS                 |
|----------|--------------------------------|
| Linux    | VirtualBox、Docker、KVM2、...     |
| MacOS    | VirtualBox、Docker、HyperKit、... |
| Windows  | VirtualBox、Docker、Hyper-V、...  |

<br>

### Podへの接続

#### ▼ NodePort Service経由

NodePort Serviceを作成しておく。

```minikube ip```コマンドを実行することにより、NodeのIPアドレスが返却される。

このIPアドレスからPodにアクセスできる。



> ℹ️ 参考：https://future-architect.github.io/articles/20220112a/

```bash
$ minikube ip
```

#### ▼ LoadBalancer Service経由

LoadBalancer Serviceを作成しておく。```minikube tunnel```コマンドを実行することにより、LoadBalancer Serviceに```EXTERNAL-IP```が割り当てられる。このIPアドレスからPodにアクセスできる。

> ℹ️ 参考：https://future-architect.github.io/articles/20220112a/

```bash
$ minikube tunnel
```

#### ▼ Ingress経由

ClusterIP ServiceとIngress（Minikubeアドオン製）を作成しておく。

```kubectl get ingress```コマンドを実行することにより、Ingressに割り当てられたIPアドレスを取得できる。

```minikube ssh```コマンドで仮想環境内に接続した後、このIPアドレスからPodにアクセスできる。



> ℹ️ 参考：https://future-architect.github.io/articles/20220112a/

```bash
$ minikube ssh

Last login: Wed May 18 10:14:50 2022 from 192.168.49.1

docker@minikube:~$ curl -X GET http://<IPアドレス>
```

<br>

## 01-02. マウント

### ホストとNode間マウント

#### ▼ 標準のホストとNode間マウント

ホスト側の```$MINIKUBE_HOME/files```ディレクトリ配下に保存されたファイルは、ゲスト仮想環境内のNodeのルート直下にマウントされる。



> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/handbook/filesync/

```bash
$ mkdir -p ~/.minikube/files/etc

$ echo nameserver 8.8.8.8 > ~/.minikube/files/etc/foo.conf

#  /etc/foo.conf に配置される
$ minikube start
```

#### ▼ 各ドライバーのホストとNode間マウント

ホスト以下のディレクトリ配下に保存されたファイルは、ゲスト仮想環境内のNodeの決められたディレクトリにマウントされる。



> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/handbook/mount/#driver-mounts

| ドライバー名       | ホスト側のOS | ホスト側のディレクトリ     | ゲスト仮想環境内のNodeのディレクトリ |
|---------------|----------|------------------|---------------------------|
| VirtualBox    | Linux    | ```/home```      | ```/hosthome```           |
| VirtualBox    | macOS    | ```/Users```     | ```/Users```              |
| VirtualBox    | Windows  | ```C://Users```  | ```/c/Users```            |
| VMware Fusion | macOS    | ```/Users```     | ```/mnt/hgfs/Users```     |
| KVM           | Linux    | なし               |                           |
| HyperKit      | Linux    | なし（NFSマウントを参照） |                           |

<br>

### Nodeとコンテナ間マウント

#### ▼ 標準のNodeとコンテナ間マウント

ゲスト仮想環境内のNodeでは、以下のディレクトリからPersistentVolumeが自動的に作成される。

そのため、Podでは作成されたPersistentVolumeをPersistentVolumeClaimで指定しさえすればよく、わざわざNodeのPersistentVolumeを作成する必要がない。

ただし、DockerドライバーとPodmanドライバーを使用する場合は、この機能がないことに注意する。



> ℹ️ 参考：https://minikube.sigs.k8s.io/docs/handbook/persistent_volumes/

- ```/data```
- ```/var/lib/minikube```
- ```/var/lib/docker```
- ```/var/lib/containerd```
- ```/var/lib/buildkit```
- ```/var/lib/containers```
- ```/tmp/hostpath_pv```
- ```/tmp/hostpath-provisioner```

<br>

### ホスト-Nodeとコンテナ間

#### ▼ ホストをコンテナにマウントする方法

Minikubeでは、```mount```コマンド、ホスト側の```$MINIKUBE_HOME/files```ディレクトリ、ドライバーを使用して、ホスト側のディレクトリをゲスト仮想環境内のNodeのディレクトリにマウントできる。

またNodeでは、決められたディレクトリからPersistentVolumeを自動的に作成する。

ここで作成されたPersistentVolumeを、PodのPersistentVolumeClaimで指定する。

このように、ホストからNode、NodeからPodへマウントを実行することにより、ホスト側のディレクトリをPod内のコンテナに間接的にマウントできる。



> ℹ️ 参考：https://stackoverflow.com/questions/48534980/mount-local-directory-into-pod-in-minikube

#### ▼ HyperKitドライバーを使用する場合

**＊例＊**

（１）HyperKitドライバーを使用する場合、ホストとNode間のマウント機能がない。そこで```mount```コマンドを使用して、ホスト側のディレクトリをNodeのボリュームにマウントする。

```bash
$ minikube start --driver=hyperkit --mount=true --mount-string="/Users/hiroki.hasegawa/projects/foo:/data"
```

（２）NodeのボリュームをPod内のコンテナにマウントする。

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

#### ▼ Nodeの場合

Node内で```ip addr```コマンドを実行すると、Nodeに割り当てられたCIDRブロックを確認できる。



> ℹ️ 参考：https://nishipy.com/archives/1467

**＊例＊**

CNIとしてBridgeアドオンを使用している。

CIDRブロックは、```192.168.49.2/24```である。



```bash
$ minikube ssh

# Nodeの中
docker@minikube:~$ ip addr | grep eth0

10: eth0@if11: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    inet 192.168.49.2/24 brd 192.168.49.255 scope global eth0
```

#### ▼ Pod

Node内で```/etc/cni/net.d```ディレクトリ配下にあるファイルを確認すると、Podに割り当てられたCIDRブロックを確認できる。



> ℹ️ 参考：https://nishipy.com/archives/1467

**＊例＊**

CNIとしてBridgeアドオンを使用している。

CIDRブロックは、```10.85.0.0/16```である。



```bash
$ minikube ssh

# Nodeの中
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

