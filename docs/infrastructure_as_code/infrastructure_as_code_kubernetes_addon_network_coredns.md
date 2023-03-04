---
title: 【IT技術の知見】CoreDNS＠ネットワークアドオン
description: CoreDNS＠ネットワークアドオンの知見を記録しています。
---

# CoreDNS＠ネットワークアドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. CoreDNSアドオン (旧kube-dns)

### CoreDNSアドオンとは

CoreDNSのService、CoreDNSのPod、coredns-configmap、から構成される。Node内の権威DNSサーバーとして、Kubernetesリソースの名前解決を行う。

![kubernetes_coredns](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_coredns.png)

> ↪️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=29

<br>

### CoreDNSのService

#### ▼ CoreDNSのServiceとは

CoreDNSはNode内にPodとして稼働しており、これはCoreDNSのServiceによって管理されている。

```bash
$ kubectl get service -n kube-system

NAME       TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
kube-dns   ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   1m0s
```

> ↪️ 参考：https://amateur-engineer-blog.com/kubernetes-dns/#toc6

<br>

### CoreDNSのPod

#### ▼ CoreDNSのPodとは

```bash
$ kubectl get pod -n kube-system

NAME                        READY   STATUS    RESTARTS   AGE
coredns-558bd4d5db-hg75t    1/1     Running   0          1m0s
coredns-558bd4d5db-ltbxt    1/1     Running   0          1m0s
```

<br>

### coredns-configmap

#### ▼ coredns-configmapとは

ConfigMapに`Corefile`ファイルを配置する。

`Corefile`ファイルは、CoreDNSを設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns-configmap
  namespace: kube-system
data:
  Corefile: |
    .:53 {
        # エラーの出力先を設定する。
        errors
        # CoreDNSのヘルスチェックのレスポンスの待機時間を設定する。
        health {
            lameduck 5s
        }
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
            pods insecure
            fallthrough in-addr.arpa ip6.arpa
            ttl 30
        }
        prometheus :9153
        forward . /etc/resolv.conf {
          # まずはUDPプロトコルによるルーティングを使用し、失敗した場合におTCPプロトコルを使用する。
          prefer_udp
          max_concurrent 1000
        }
        cache 30
        loop
        reload
        # DNSロードバランシングを有効化する。
        loadbalance
        hosts {
          *.*.*.* <ホスト名>
        }
    }
```

> ↪️ 参考：https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/#coredns-configmap-options

<br>

## 02. Serviceの名前解決

### Serviceの名前解決の仕組み

![coredns_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/coredns_service-discovery.png)

Podのスケジューリング時に、kubeletはPod内のコンテナの`/etc/resolv.conf`ファイルに 権威DNSサーバー (CoreDNSのService) のIPアドレスを設定する。

Pod内のコンテナは、自身の`/etc/resolv.conf`ファイルを使用して、CoreDNSのServiceを介して、宛先のPodに紐づくServiceのIPアドレスを正引きする。

このServiceのIPアドレスを指定し、Podにアウトバウンド通信を送信する。

```bash
# Pod内のコンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

# コンテナのresolv.confファイルの中身を確認する
[root@<Pod名>] $ cat /etc/resolv.conf

nameserver 10.96.0.10 # 権威DNSサーバーのIPアドレス
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

```bash
# CoreDNSを権威DNSサーバーとして使用している場合
$ kubectl get service -n kube-system

NAME       TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
kube-dns   ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   1m0s
```

> ↪️ 参考：
>
> - https://blog.mosuke.tech/entry/2020/09/09/kuubernetes-dns-test/
> - https://isovalent.com/blog/post/its-dns/#kubernetes-dns-101
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=42
> - https://help.aliyun.com/document_detail/201873.html

<br>

### レコードタイプ別の完全修飾ドメイン名

#### ▼ レコードタイプ別の完全修飾ドメイン名とは

Clusterネットワーク内の全てのServiceに完全修飾ドメイン名が割り当てられている。

レコードタイプごとに、完全修飾ドメイン名が異なる。

#### ▼ `A/AAAA`レコードの場合

対応する完全修飾ドメイン名は、『`<Service名>.<Namespace名>.svc.cluster.local`』である。

通常のServiceの名前解決ではCluster-IPが返却される。一方でHeadless Serviceの名前解決ではPodのIPアドレスが返却される。

『`svc.cluster.local`』は省略でき、『`<Service名>.<Namespace名>`』のみを指定しても名前解決できる。

また、同じNamespace内でパケットを送受信する場合は、さらに『`<Namespace名>`』も省略でき、『`<Service名>`』のみで名前解決できる。

> ↪️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#services
> - https://ameblo.jp/bakery-diary/entry-12613605860.html
> - https://eng-blog.iij.ad.jp/archives/9998
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=44

#### ▼ `SRV`レコードの場合

対応する完全修飾ドメイン名は、『`_<ポート名>._<プロトコル>.<Service名>.<Namespace名>.svc.cluster.local`』である。

Serviceの`.spec.ports.name`キー数だけ、完全修飾ドメイン名が作成される。

> ↪️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#services
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=44

<br>

### 名前解決の仕組み

#### ▼ Pod内からServiceに対する正引き名前解決

Pod内のコンテナから宛先のServiceに対して、`nslookup`コマンドの正引きする。

Serviceに`.metadata.name`キーが設定されている場合、Serviceの完全修飾ドメイン名は、`.metadata.name`キーの値になる。

完全修飾ドメイン名の設定を要求された時は、設定ミスを防げるため、`.metadata.name`キーの値よりも完全修飾ドメイン名の方が推奨である。

```bash
# Pod内のコンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

# Pod内のコンテナから宛先のServiceに対して、正引きの名前解決を行う
[root@<Pod名>:~] $ nslookup <Service名>

Server:         10.96.0.10
Address:        10.96.0.10#53

Name:  <Serviceの完全修飾ドメイン名>
Address:  10.105.157.184
```

補足として、異なるNamespaceに属するServiceの名前解決を行う場合は、Serviceの完全修飾ドメイン名の後にNamespaceを指定する必要がある。

```bash
# Pod内のコンテナから正引きの名前解決を行う。
[root@<Pod名>:~] $ nslookup <Serviceの完全修飾ドメイン名>
```

> ↪️ 参考：
>
> - https://blog.mosuke.tech/entry/2020/09/09/kuubernetes-dns-test/
> - https://kubernetes.io/docs/tasks/debug-application-cluster/debug-service/#does-the-service-work-by-dns-name

#### ▼ Pod外からServiceに対する正引き名前解決

`【１】`

: NginxのPodにルーティングするServiceが稼働しているとする。

```bash
$ kubectl get service

NAME            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
nginx-service   ClusterIP   10.101.67.107   <none>        8080/TCP   3h34m
```

`【２】`

: CoreDNSのPodが稼働しているとする。

     ここで、CoreDNSのPodのIPアドレス (ここでは`10.244.0.2`) を確認しておく。

```bash
$ kubectl get pods -o wide -l k8s-app=kube-dns -n kube-system

NAME            READY   STATUS    RESTARTS   AGE     IP           NODE       NOMINATED NODE   READINESS GATES
coredns-*****   1/1     Running   0          3h53m   10.244.0.2   minikube   <none>           <none>
```

`【３】`

: ここで、Node内に接続する。Serviceの完全修飾ドメイン名 (ここでは`nginx-service.default.svc.cluster.local`) をCoreDNSに正引きする。すると、ServiceのIPアドレスを取得できる。

```bash
# Node内に接続する。
$ dig nginx-service.default.svc.cluster.local +short @10.244.0.2

10.101.67.107
```

> ↪️ 参考：https://zenn.dev/tayusa/articles/c705cd65b6ee74

<br>

### 疎通確認

#### ▼ 事前確認

`【１】`

: Serviceがルーティング先のポート番号を確認する。

```bash
$ kubectl get service <Service名> -o yaml | grep targetPort:
```

`【２】`

: Serviceがルーティング先のPodにて、コンテナが待ち受けるポート番号を確認する。注意点として、`.spec.containers[].ports`キーは単なる仕様であり、記載されていなくとも、コンテナのポートが公開されている可能性がある。

```bash
# 先にmetadata.labelキーから、Serviceのルーティング先のPodを確認する
$ kubectl get pod -l <名前>=<値> -o wide

$ kubectl get pod <Pod名> -o yaml | grep containerPort:
```

`【３】`

: 両方のポート番号が一致しているかを確認する。

#### ▼ Serviceを介したアウトバウンド通信の送信

Serviceを介して、宛先のPodにHTTPSプロトコルでアウトバウンド通信を送信する。

完全修飾ドメイン名またはIPアドレスを指定できる。

```bash
# Pod内のコンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>:~] $ curl -X GET https://<Serviceの完全修飾ドメイン名/IPアドレス>:<ポート番号>
```

<br>

## 03. Podの直接的な名前解決

### Podの直接的な名前解決の仕組み

Serviceの名前解決を介さずに、特定のPodのインスタンスに対して直接的に名前解決することもできる。

<br>

### レコードタイプ別の完全修飾ドメイン名

#### ▼ `A/AAAA`レコードの場合

対応する完全修飾ドメイン名は、『`<PodのIPアドレス>.<Namespace名>.pod.cluster.local`』である。

> ↪️ 参考：https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#a-aaaa-records-1

<br>

## 04. サービスディスカバリー

CoreDNSの名前解決と、Serviceとkube-proxyによるIPアドレスとポート番号の動的な検出を組み合わせることにより、サービスディスカバリーを実装できる。

> ↪️ 参考：
>
> - https://coredns.io/2017/03/01/coredns-for-kubernetes-service-discovery-take-2/
> - https://kubernetes.io/blog/2018/07/10/coredns-ga-for-kubernetes-cluster-dns/#introduction

<br>
