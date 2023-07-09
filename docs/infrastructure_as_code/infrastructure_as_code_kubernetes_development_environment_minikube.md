---
title: 【IT技術の知見】Minikube＠開発環境
description: Minikube＠開発環境の知見を記録しています。
---

# Minikube＠開発環境

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Minikubeの仕組み

### アーキテクチャ

#### ▼ 仮想サーバー系のドライバーの場合

ホストマシン上にMinikube仮想サーバーを作成する。

このMinikube仮想サーバー内にNodeを持つClusterを作成する。

![minikube_architecture_virtual_machine_driver](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/minikube_architecture_virtual_machine_driver.png)

> - https://minikube.sigs.k8s.io/docs/commands/
> - https://richardroseblog.wordpress.com/2017/11/01/minikube-creating-a-cluster/

#### ▼ Dockerドライバーの場合

ホストマシン上にコンテナを作成する。

このコンテナ内にMinikube仮想サーバーを作成し、Nodeを持つClusterを作成する。

![minikube_architecture_docker_driver](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/minikube_architecture_docker_driver.png)

> - https://zenn.dev/castaneai/articles/local-kubernetes-networking

<br>

### ドライバー

#### ▼ ドライバーとは

ゲスト (Node) 側のOSを設定する。

ホスト側のOS (Linux、MacOS、Windows) や、これらOSのバージョンによって、使用できるドライバーが異なる。

> - https://ytooyama.hatenadiary.jp/entry/2021/06/04/154320

#### ▼ ドライバーの種類

| ホスト側のOS | ゲスト (Node) 側のOS              |
| ------------ | --------------------------------- |
| Linux        | VirtualBox、Docker、KVM2、...     |
| MacOS        | VirtualBox、Docker、HyperKit、... |
| Windows      | VirtualBox、Docker、Hyper-V、...  |

> - https://minikube.sigs.k8s.io/docs/drivers/

<br>

## 02. マウント

### ホストとNode間マウント

#### ▼ 標準のホストとNode間マウント

ホスト側の`$MINIKUBE_HOME/files`ディレクトリ配下に保存されたファイルは、ゲスト仮想環境内のNodeのルート直下にマウントされる。

```bash
$ mkdir -p ~/.minikube/files/etc

$ echo nameserver 8.8.8.8 > ~/.minikube/files/etc/foo.conf

#  /etc/foo.conf に配置される
$ minikube start
```

> - https://minikube.sigs.k8s.io/docs/handbook/filesync/

#### ▼ 各ドライバーのホストとNode間マウント

ホスト以下のディレクトリ配下に保存されたファイルは、ゲスト仮想環境内のNodeの決められたディレクトリにマウントされる。

| ドライバー名  | ホスト側のOS | ホスト側のディレクトリ   | ゲスト仮想環境内のNodeのディレクトリ |
| ------------- | ------------ | ------------------------ | ------------------------------------ |
| VirtualBox    | Linux        | `/home`                  | `/hosthome`                          |
| VirtualBox    | macOS        | `/Users`                 | `/Users`                             |
| VirtualBox    | Windows      | `C://Users`              | `/c/Users`                           |
| VMware Fusion | macOS        | `/Users`                 | `/mnt/hgfs/Users`                    |
| KVM           | Linux        | なし                     |                                      |
| HyperKit      | Linux        | なし (NFSマウントを参照) |                                      |

> - https://minikube.sigs.k8s.io/docs/handbook/mount/#driver-mounts

<br>

### Nodeとコンテナ間マウント

#### ▼ 標準のNodeとコンテナ間マウント

ゲスト仮想環境内のNodeでは、以下のディレクトリからPersistentVolumeが自動的に作成される。

そのため、Podでは作成されたPersistentVolumeをPersistentVolumeClaimで指定しさえすればよく、わざわざNodeのPersistentVolumeを作成する必要がない。

ただし、DockerドライバーとPodmanドライバーを使用する場合は、この機能がないことに注意する。

- `/data`
- `/var/lib/minikube`
- `/var/lib/docker`
- `/var/lib/containerd`
- `/var/lib/buildkit`
- `/var/lib/containers`
- `/tmp/hostpath_pv`
- `/tmp/hostpath-provisioner`

> - https://minikube.sigs.k8s.io/docs/handbook/persistent_volumes/

<br>

### ホスト-Nodeとコンテナ間

#### ▼ ホストをコンテナにマウントする方法

Minikubeでは、`mount`コマンド、ホスト側の`$MINIKUBE_HOME/files`ディレクトリ、ドライバーを使用して、ホスト側のディレクトリをゲスト仮想環境内のNodeのディレクトリにマウントできる。

またNodeでは、決められたディレクトリからPersistentVolumeを自動的に作成する。

ここで作成されたPersistentVolumeを、PodのPersistentVolumeClaimで指定する。

このように、ホストからNode、NodeからPodへマウントを実行することにより、ホスト側のディレクトリをPod内のコンテナに間接的にマウントできる。

> - https://stackoverflow.com/questions/48534980/mount-local-directory-into-pod-in-minikube

#### ▼ HyperKitドライバーを使用する場合

**＊例＊**

`【１】`

: HyperKitドライバーを使用する場合、ホストとNode間のマウント機能がない。そこで`mount`コマンドを使用して、ホスト側のディレクトリをNodeのボリュームにマウントする。

```bash
$ minikube start --driver=hyperkit --mount=true --mount-string="/Users/hiroki.hasegawa/projects/foo:/data"
```

`【２】`

: NodeのボリュームをPod内のコンテナにマウントする。

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
        - name: app
          image: app:1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          volumeMounts:
            - name: app
              mountPath: /go/src
      volumes:
        - name: app
          hostPath:
            path: /data
            type: DirectoryOrCreate
```

<br>

## 03. ネットワーク

### KubernetesリソースのCIDRブロック

#### ▼ Nodeの場合

Node内で`ip addr`コマンドを実行することにより、Nodeに割り当てられたCIDRブロックを確認できる。

> - https://nishipy.com/archives/1467

**＊例＊**

CNIとしてBridgeアドオンを使用している。

CIDRブロックは、`192.168.49.2/24`である。

```bash
$ minikube ssh

# Nodeの中
docker@minikube:~$ ip addr | grep eth0

10: eth0@if11: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default
    inet 192.168.49.2/24 brd 192.168.49.255 scope global eth0
```

#### ▼ Pod

Node内で`/etc/cni/net.d`ディレクトリ配下にあるファイルを確認すると、Podに割り当てられたCIDRブロックを確認できる。

**＊例＊**

CNIとしてBridgeアドオンを使用している。

CIDRブロックは、`10.85.0.0/16`である。

```bash
$ minikube ssh

# 仮想環境の中
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

> - https://nishipy.com/archives/1467

<br>

## 04-02. Podへの接続

### Minikubeの制約

Minikubeは、クラウドプロバイダーとは状況が異なり、Minikube仮想サーバー内にNodeが稼働している。

そのため、ホストからMinikube仮想サーバーに接続するための操作が必要である。

> - https://unicorn.limited/jp/rd/kubernetes/20180521-minikube-access.html

<br>

### NodePort Serviceの場合

NodePort Serviceの場合、`minikube service`コマンドを使用して、Minikube仮想サーバー内のNodeに接続できる。

`http://127.0.0.1:<自動的に発行されたポート番号>`の形式でURLが発行されるため、ブラウザや`curl`コマンドで接続を確認できる。

```bash
$ minikube service <NodePort Service名> --url -n foo-namespace

$ curl http://127.0.0.1:<自動的に発行されたポート番号>
```

これは、IstioのIngressGatewayをNodePort Serviceで作成している場合も使える。

```bash
$ minikube service istio-ingressgateway --url -n istio-ingress
```

> - https://minikube.sigs.k8s.io/docs/handbook/accessing/#using-minikube-service-with-tunnel

<br>

#### LoadBalancer Serviceの場合

LoadBalancer Serviceの場合、`minikube tunnel`コマンドでLoadBalancer Serviceに`EXTERNAL-IP`が割り当てられるIPアドレスから、Minikube仮想サーバー内のNodeに接続できる。

```bash
$ minikube tunnel

$ curl http://<minikube tunnelコマンドでLoadBalancer Serviceに割り当てられるIPアドレス>:<LoadBalancer Serviceが待ち受けるポート番号>
```

> - https://minikube.sigs.k8s.io/docs/handbook/accessing/#using-minikube-service-with-tunnel

### ClusterIP Serviceの場合

#### ▼ ClusterIP Serviceで頑張る

ClusterIP Serviceの場合、やや難易度が高くなる。

クラウドプロバイダーとは状況が異なり、Node外にロードバランサーを構築できず、別の方法でホストから仮想サーバー内のNodeに接続する必要がある。

minikubeのingressアドオン (Nginxコントローラー) を有効化し、Ingressとnginxを指定したIngressClassを作成する。

```bash
$ minikube addons enable ingress
```

Nginxコントローラーを含むIngressコントローラーは、Hostヘッダーにドメインが割り当てられたリクエストを受信し、NodeのIPアドレスを返却する。

これをMinikube上で再現するために名前解決するために、ingress-dnsアドオンを有効化する。

```bash
$ minikube addons enable ingress-dns
```

また、`/etc/resolver/minikube-test `ファイルを以下の通りに編集する。

```bash
$ vim /etc/resolver/minikube-test

domain minikube
nameserver $(minikube ip)
search_order 1
timeout 5
```

あとは、`minikube`というドメインで、Minikube仮想サーバー内のNodeに接続できる。

```bash
$ curl http://foo.minikube
```

> - https://minikube.sigs.k8s.io/docs/handbook/addons/ingress-dns/
> - https://developer.mamezou-tech.com/containers/k8s/tutorial/app/minikube/

#### ▼ `kubectl port-forward`コマンドを使用する場合

妥協策として、Ingressを介さずに、Podに直接的に接続する。

```bash
# Podに直接的に指定する場合
$ kubectl port-forward pod/<Pod名> <ホストポート番号>:<Podのポート番号>

# Serviceの情報を使用して、Podを指定する場合
$ kubectl port-forward svc/<Service名> <ホストポート番号>:<Podのポート番号>
```

#### ▼ NodePort Serviceを別途作成する場合

妥協策として、開発環境のみで使用するNodePort Serviceを作成する。

> - https://minikube.sigs.k8s.io/docs/handbook/addons/ingress-dns/
> - https://developer.mamezou-tech.com/containers/k8s/tutorial/app/minikube/

<br>
