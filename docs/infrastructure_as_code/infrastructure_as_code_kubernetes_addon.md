---
title: 【IT技術の知見】アドオン＠Kubernetes
description: アドオン＠Kubernetesの知見を記録しています。
---

# アドオン＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. admission-controllersアドオン

### admission-controllersアドオンとは

![kubernetes_admission-controllers](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers.png)

有効化すると、kube-apiserverにて、認証ステップと認可ステップの後にadmission-controllersアドオンのステップを実行できる。
> ℹ️ 参考：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/
> - https://knowledge.sakura.ad.jp/21129/
> - https://www.sobyte.net/post/2022-07/k8s-auth/

<br>

### admission-controllersアドオンのステップ

![kubernetes_admission-controllers_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_architecture.png)

admission-controllersアドオンは、mutating-admissionステップ、validating-admissionステップ、から構成されている。クライアント（```kubectl```クライアント、Kubernetesリソース）からのリクエスト（例：Kubernetesリソースに対する作成/更新/削除、kube-apiserverからのプロキシへの転送）時に、各ステップでadmissionアドオンによる処理（例：アドオンビルトイン処理、独自処理）を発火させられる。

> ℹ️ 参考：
>
> - https://kubernetes.io/blog/2019/03/21/a-guide-to-kubernetes-admission-controllers/
> - https://www.digihunch.com/2022/01/kubernetes-admission-control/
> - https://gashirar.hatenablog.com/entry/2020/10/31/141357

| ステップ名                   | 説明                                   |
| ---------------------------- | -------------------------------------- |
| mutating-admissionステップ   | リクエストの内容を変更する。           |
| validating-admissionステップ | リクエストを許可するか否かをを決める。 |

<br>

## 01-02. admissionアドオン

### admissionアドオンとは

admissionアドオンは、ビルトイン処理や独自処理を発火させられるアドオンから構成されている。kube-apiserverの起動時に実行される```kube-apiserver```コマンドの結果から、使用しているadmissionアドオンの一覧を取得できる。

> ℹ️ 参考：https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#which-plugins-are-enabled-by-default

```bash
$ kube-apiserver -h | grep enable-admission-plugins

CertificateApproval,
CertificateSigning,
CertificateSubjectRestriction,
DefaultIngressClass,
DefaultStorageClass,
DefaultTolerationSeconds,
LimitRanger,
MutatingAdmissionWebhook,
NamespaceLifecycle,
PersistentVolumeClaimResize,
PodSecurity,
Priority,
ResourceQuota,
RuntimeClass,
ServiceAccount,
StorageObjectInUseProtection,
TaintNodesByCondition,
ValidatingAdmissionWebhook,
```

<br>

### MutatingAdmissionWebhookアドオン

#### ▼ MutatingAdmissionWebhookアドオン

![kubernetes_admission-controllers_admission-review](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_admission-review.png)

MutatingAdmissionWebhookアドオンを使用すると、mutating-admissionステップ時に、webhookサーバーにAdmissionReviewのリクエストが送信され、独自処理を発火させられる。独自処理が定義されたwebhookサーバーを別途用意しておく必要がある。webhookサーバーから返信されたAdmissionReviewを含むレスポンスに基づいて、kube-apiserverに対するリクエストの内容を変更する。

> ℹ️ 参考：
>
> - https://gashirar.hatenablog.com/entry/2020/10/31/141357
> - https://medium.com/ibm-cloud/diving-into-kubernetes-mutatingadmissionwebhook-6ef3c5695f74

#### ▼ MutatingWebhookConfiguration

![kubernetes_admission-controllers_webhook](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_webhook.png)

MutatingWebhookConfigurationで、MutatingAdmissionWebhookアドオンの発火条件やwebhookサーバーの宛先を設定する。webhookサーバーは、Cluster内部に設置することが多い。

> ℹ️ 参考：
>
> - https://blog.mosuke.tech/entry/2022/05/15/admission-webhook-1/
> - https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-configuration

**＊例＊**

IstioのMutatingWebhookConfigurationは以下の通りである。

```yaml
apiVersion: admissionregistration.k8s.io/v1beta1
kind: MutatingWebhookConfiguration
metadata:
  name: istio-sidecar-injector-<リビジョン番号>
  labels:
    app: sidecar-injector
webhooks:
  - name: rev.namespace.sidecar-injector.istio.io
    admissionReviewVersions: ["v1", "v1beta1"]
    # mutating-admissionステップ発火条件を登録する。
    rules:
      - apiGroups: [""]
        apiVersions: ["v1"]
        operations: ["CREATE", "UPDATE"]
        resources: ["pods"]
        scope: "*"
    # Webhookの前段にあるServiceの情報を登録する。
    clientConfig:
      service:
        name: istiod-<リビジョン番号>
        namespace: istio-system
        # エンドポイント
        path: "/inject"
        port: 443
      caBundle: Ci0tLS0tQk...
    namespaceSelector:
      matchExpressions:
        - key: istio.io/rev
          operator: In
          values:
            - <リビジョン番号>
```

<br>

### ValidatingAdmissionWebhookアドオン

#### ▼ ValidatingAdmissionWebhookアドオン

ValidatingAdmissionWebhookアドオンを使用すると、validating-admissionステップ時に、webhookサーバーにAdmissionReviewのリクエストが送信され、独自処理を発火させられる。独自処理が定義されたwebhookサーバーを別途用意しておく必要がある。

> ℹ️ 参考：https://blog.mosuke.tech/entry/2022/05/15/admission-webhook-1/

#### ▼ ValidatingWebhookConfiguration

![kubernetes_admission-controllers_webhook](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_webhook.png)

ValidatingWebhookConfigurationで、ValidatingAdmissionWebhookアドオンの発火条件やwebhookサーバーの宛先を設定する。webhookサーバーは、Cluster内部に設置することが多い。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-configuration
> - https://speakerdeck.com/masayaaoyama/openshiftjp10-amsy810?slide=24
> - https://blog.mosuke.tech/entry/2022/05/15/admission-webhook-1/

**＊例＊**

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: istiod-default-validator
webhooks:
    # webhook名は完全修飾ドメイン名にする。
  - name: validation.istio.io
    admissionReviewVersions: ["v1", "v1beta1"]
    sideEffects: None
    timeoutSeconds: 5
    # 発火条件を登録する。（例：Podの作成/更新リクエスト時に発火する）
    rules:
      - apiGroups: ["security.istio.io", "networking.istio.io"]
        apiVersions: ["*"]
        operations: ["CREATE", "UPDATE"]
        resources: ["*"]
        scope: "*"
    # webhookサーバーの情報を登録する。
    clientConfig:
      # webhookサーバーの前段にあるServiceを登録する。
      service:
        namespace: istio-system
        name: istiod-<リビジョン番号>
        port: 443
        path: /validate
      # webhookサーバーをCluster内部に自作する場合は、webhookサーバーに証明書バンドルを登録する。
      caBundle: Ci0tLS0tQk...
```

<br>

### AdmissionReview

#### ▼ AdmissionReviewとは

AdmissionReviewは、リクエストを定義するAdmissionRequestと、レスポンスを定義するAdmissionResponseからなる。admission-controllerアドオンとwebhookサーバーの間のリクエスト/レスポンスのデータである。

> ℹ️ 参考：https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview

```yaml
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  # AdmissionRequest
  "request": {},
  # AdmissionResponse
  "response": {}  
}
```

#### ▼ mutating-admissionステップのAdmissionRequest

kube-apiserverは、特定のリクエストを受信すると、webhookサーバーにAdmissionReview内のAdmissionRequestにリクエストパラメーターを格納し、リクエストとして送信する。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-request-and-response
> - https://tokibi.hatenablog.com/entry/2020/01/07/150359
> - https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview

**＊例＊**

```yaml
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  # AdmissionRequest
  "request": {
    "uid": "705ab4f5-6393-11e8-b7cc-42010a800002",
    "kind": {
      "group": "autoscaling",
      "version": "v1",
      "kind": "Scale"
    },
    # 変更されるKubernetesリソースの種類を表す。
    "resource": {
      "group": "apps",
      "version": "v1",
      "resource": "deployments"
    },
    # kube-apiserverの操作の種類を表す。
    "operation": "CREATE",
    # 認証/認可されたユーザーを表す。
    "userInfo": {
      "username": "admin",
      "uid": "014fbff9a07c",
      "groups": [
        "system:authenticated",
        "my-admin-group"
      ],
      "extra": {
        "some-key": [
          "some-value1",
          "some-value2"
        ]
      }
    },
    # 認証/認可された操作の種類を表す。
    "options": {
      "apiVersion": "meta.k8s.io/v1",
      "kind": "CreateOptions"
    },
    # ドライランモードで実行されていることを表す。
    # etcdに永続化されない。
    "dryRun": false
  }
  
  ...
}
```

#### ▼ mutating-admissionステップのAdmissionResponse

webhookサーバーは、AdmissionReview内のAdmissionResponseにpatch処理を格納し、レスポンスとして返信する。マニフェストのpatch処理の定義方法は、JSON Patchツールに依存している。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-request-and-response
> - https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview
> - https://github.com/morvencao/kube-sidecar-injector/blob/4e010f4cdee8baf3cd3f3f59ec9b95e5db9b9f01/cmd/webhook.go#L218-L225
> - https://jsonpatch.com/

**＊例＊**

```yaml
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  # AdmissionResponse
  "response": {
    "uid": "<value from request.uid>",
    # 宛先のwebhookサーバーが受信したか否かを表す。
    "allowed": true,
    # PathによるPatch処理を行う。
    "patchType": "JSONPatch",
    # Patch処理の対象となるKubernetesリソースと処理内容を表す。base64方式でエンコードされている。
    "patch": "W3sib3AiOiAiYWRkIiwgInBhdGgiOiAiL3NwZWMvcmVwbGljYXMiLCAidmFsdWUiOiAzfV0="
  }
}
```

```yaml
# patchキーをbase64方式でデコードした場合
[
  {
    # 追加処理を実行する。
    "op": "add",
    # .spec.replicasをターゲットとする。
    "path": "/spec/replicas",
    # 値は3とする。
    "value": 3
  }
]
```

#### ▼ validating-admissionステップのAdmissionRequest

kube-apiserverは、mutating-admissionステップと同じAdmissionReview内のAdmissionRequestにリクエストパラメータを格納し、リクエストとして送信する。

> ℹ️ 参考：https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview

#### ▼ validating-admissionステップのAdmissionResponse

webhookサーバーは、AdmissionReview内のAdmissionResponseにバリデーションの結果を格納し、レスポンスとして返信する。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-request-and-response
> - https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview

**＊例＊**

```yaml
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  # AdmissionResponse
  "response": {
    "uid": "<value from request.uid>",
    # 宛先のwebhookサーバーが受信したか否かを表す。
    "allowed": true,
    "status": {
      "code": 403,
      "message": "You cannot do this because it is Tuesday and your name starts with A"
    }
  }
}
```

<br>

## 02. cniアドオン

### cniアドオンとは

![kubernetes_cni-plugin](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cni-plugin.png)

cniアドオンで選べるモードごとに異なる仕組みによって、Clusterネットワークを作成する。また、Podに仮想NICを紐付け、ワーカーNode内のネットワークのIPアドレスをPodの仮想NICに割り当てる。これにより、PodをワーカーNode内のClusterネットワークに参加させ、異なるワーカーNode上のPod同士が通信できるようにする。cniアドオンは、kubeletによるPodの起動時に有効化される。

> ℹ️ 参考：
>
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=30
> - https://kubernetes.io/docs/concepts/cluster-administration/networking/

<br>

### アドオンで選べるモード

#### ▼ オーバーレイモード

![kubernetes_cni-addon_overlay-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cni-addon_overlay-mode.png)

オーバーレイネットワークを使用して、Clusterネットワークを作成し、異なるワーカーNode上のPod同士が通信できるようにする。

**＊例＊**

- Flannel-vxlan
- Calico-ipip
- Weave

> ℹ️ 参考：
> 
> - https://www.netone.co.jp/knowledge-center/netone-blog/20191226-1/
> - https://www.netstars.co.jp/kubestarblog/k8s-3/
> - https://www1.gifu-u.ac.jp/~hry_lab/rs-overlay.html

#### ▼ ルーティングモード

ルーティングテーブル（```L3```）を使用して、Clusterネットワークを作成し、異なるワーカーNode上のPod同士が通信できるようにする。

**＊例＊**

- clico-bgp
- flannel-hostgw
- sriov


> ℹ️ 参考：
> 
> - https://www.netstars.co.jp/kubestarblog/k8s-3/
> - https://medium.com/elotl-blog/kubernetes-networking-on-aws-part-ii-47906de2921d

#### ▼ アンダーレイモード

アンダーレイネットワークを使用して、Clusterネットワークを作成し、異なるワーカーNode上のPod同士が通信できるようにする。

- Aliyun

> ℹ️ 参考：https://www.netstars.co.jp/kubestarblog/k8s-3/

#### ▼ AWSの独自モード

![kubernetes_cni-addon_aws-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cni-addon_aws-mode.png)

AWSでは、ワーカーNode（EC2、Fargate）上でスケジューリングするPodの数だけワーカーNodeにENIを紐づけ、さらにこのENIにVPC由来のプライマリーIPアドレスとセカンダリーIPアドレスの```2```つを付与できる。ワーカーNodeのENIとPodを紐づけることにより、PodをVPCのネットワークに参加させ、異なるワーカーNode上のPod同士が通信できるようにする。ワーカーNodeのインスタンスタイプごとに、紐づけられるENI数に制限があるため、ワーカーNode上でスケジューリングするPod数がインスタンスタイプに依存する（2022/09/24時点で、Fargateではインスタンスタイプに限らず、ワーカーNode当たり```1```個しかPodをスケジューリングできない）。

> ℹ️ 参考：
>
> - https://itnext.io/kubernetes-is-hard-why-eks-makes-it-easier-for-network-and-security-architects-ea6d8b2ca965
> - https://medium.com/elotl-blog/kubernetes-networking-on-aws-part-ii-47906de2921d
> - https://github.com/awslabs/amazon-eks-ami/blob/master/files/eni-max-pods.txt

<br>

## 03. CoreDNSアドオン（旧kube-dns）

### CoreDNSアドオンとは

ワーカーNode内の権威DNSサーバーとして、Kubernetesリソースの名前解決を行う。

> ℹ️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=29

![kubernetes_coredns](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_coredns.png)

<br>


### セットアップ

#### ▼ ConfigMap

ConfigMapに```Corefile```ファイルを配置する。

> ℹ️ 参考：https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/#coredns-configmap-options

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-coredns
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

<br>

### CoreDNS Service/Pod

#### ▼ CoreDNS Service/Podとは

CoreDNSはワーカーNode内にPodとして稼働しており、これはCoreDNS Serviceによって管理されている。

> ℹ️ 参考：https://amateur-engineer-blog.com/kubernetes-dns/#toc6

```bash
# CoreDNS Service
$ kubectl get service -n kube-system

NAME       TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
kube-dns   ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   1m0s


# CoreDNS Pod
$ kubectl get pod -n kube-system

NAME                                     READY   STATUS    RESTARTS   AGE
coredns-558bd4d5db-hg75t                 1/1     Running   0          1m0s
coredns-558bd4d5db-ltbxt                 1/1     Running   0          1m0s
```

<br>


## 03-02. Serviceの名前解決

### Serviceの完全修飾ドメイン名

![coredns_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/coredns_service-discovery.png)

Podのスケジューリング時に、kubeletはPod内のコンテナの```/etc/resolv.conf```ファイルにCoreDNS ServiceのIPアドレスを設定する。Pod内のコンテナは、自身の```/etc/resolv.conf```ファイルを使用して、権威DNSサーバーを介して、宛先のPodに紐づくServiceのIPアドレスを正引きする。このServiceのIPアドレスを指定し、Podにアウトバウンド通信を送信する。

> ℹ️ 参考：
>
> - https://blog.mosuke.tech/entry/2020/09/09/kuubernetes-dns-test/
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=42
> - https://help.aliyun.com/document_detail/201873.html

```bash
# Pod内のコンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

# コンテナのresolv.confファイルの中身を確認する
[root@<Pod名>] $ cat /etc/resolv.conf 

nameserver 10.96.0.10 # 権威DNSサーバーのIPアドレス
search default.svc.cluster.local svc.cluster.local cluster.local 
options ndots:5

# CoreDNSを権威DNSサーバーとして使用している場合
$ kubectl get service -n kube-system

NAME       TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                  AGE
kube-dns   ClusterIP   10.96.0.10   <none>        53/UDP,53/TCP,9153/TCP   1m0s
```

<br>

### レコードタイプと完全修飾ドメイン名の関係

Clusterネットワーク内の全てのServiceに完全修飾ドメイン名が割り当てられている。レコードタイプごとに、完全修飾ドメイン名が異なる。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#services
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=44
> - https://eng-blog.iij.ad.jp/archives/9998

| レコードタイプ | 完全修飾ドメイン名                                           | 名前解決の仕組み                                                                            | 補足                                                                                                                                                                                                               |
| -------------- | -------------------------------------------------------- |-------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A/AAAAレコード | ```<Service名>.<Namespace名>.svc.cluster.local```        | ・通常のServiceの名前解決ではCluster-IPが返却される。<br>・一方でHeadless Serviceの名前解決ではPodのIPアドレスが返却される。 | ・```svc.cluster.local```は省略でき、```<Service名>.<Namespace名>```でも名前解決できる。また、同じNamespace内から通信する場合は、さらに```<Namespace名>```も省略でき、```<Service名>```のみで名前解決できる。<br>ℹ️ 参考：https://ameblo.jp/bakery-diary/entry-12613605860.html |
| SRVレコード    | ```_<ポート名>._<プロトコル>.<Service名>.<Namespace名>.svc.cluster.local``` | 調査中...                                                                              | Serviceの```spec.ports.name```キー数だけ、完全修飾ドメイン名が作成される。                                                                                                                                                              |

<br>

### 名前解決の仕組み

#### ▼ Pod内からServiceに対する正引き名前解決

Pod内のコンテナから宛先のServiceに対して、```nslookup```コマンドの正引きする。Serviceに```metadata.name```キーが設定されている場合、Serviceの完全修飾ドメイン名は、```metadata.name```キーの値になる。完全修飾ドメイン名の設定を要求された時は、設定ミスを防げるため、```metadata.name```キーの値よりも完全修飾ドメイン名の方が推奨である。

```bash
# Pod内のコンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

# Pod内のコンテナから宛先のServiceに対して、正引きの名前解決を行う
[root@<Pod名>:~] $ nslookup <Service名>

Server:         10.96.0.10
Address:        10.96.0.10#53

Name:  <Service名>.<Namespace名>.svc.cluster.local
Address:  10.105.157.184
```

ちなみに、異なるNamespaceに属するServiceの名前解決を行う場合は、Serviceの完全修飾ドメイン名の後にNamespaceを指定する必要がある。

```bash
# Pod内のコンテナから正引きの名前解決を行う。
[root@<Pod名>:~] $ nslookup <Service名>.<Namespace名>
```

> ℹ️ 参考：
>
> - https://blog.mosuke.tech/entry/2020/09/09/kuubernetes-dns-test/
> - https://kubernetes.io/docs/tasks/debug-application-cluster/debug-service/#does-the-service-work-by-dns-name


#### ▼ Pod外からServiceに対する正引き名前解決

（１）NginxのPodにルーティングするServiceが稼働しているとする。

```bash
$ kubectl get service
                                                       
NAME            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
nginx-service   ClusterIP   10.101.67.107   <none>        8080/TCP   3h34m
```

（２）CoreDNS Podが稼働しているとする。ここで、CoreDNSのPodのIPアドレス（ここでは```10.244.0.2```）を確認しておく。

```bash
$ kubectl -n kube-system get pods -o wide -l k8s-app=kube-dns

NAME            READY   STATUS    RESTARTS   AGE     IP           NODE       NOMINATED NODE   READINESS GATES
coredns-*****   1/1     Running   0          3h53m   10.244.0.2   minikube   <none>           <none>
```

（３）ここで、ワーカーNode内に接続する。Serviceの完全修飾ドメイン名（ここでは```nginx-service.default.svc.cluster.local```）をCoreDNSに正引きする。すると、ServiceのIPアドレスを取得できる。

```bash
# ワーカーNode内に接続する。
$ dig nginx-service.default.svc.cluster.local +short @10.244.0.2

10.101.67.107
```

> ℹ️ 参考：https://zenn.dev/tayusa/articles/c705cd65b6ee74

<br>

### 疎通確認

#### ▼ 事前確認

（１）Serviceがルーティング先のポート番号を確認する。

```bash
$ kubectl get service <Service名> -o yaml | grep targetPort:
```

（２）Serviceがルーティング先のPodにて、コンテナが待ち受けるポート番号を確認する。注意点として、```spec.containers.ports```キーは単なる仕様であり、記載されていなくとも、コンテナのポートが公開されている可能性がある。

```bash
# 先にmetadata.labelキーから、Serviceのルーティング先のPodを確認する
$ kubectl get pod -l <名前>=<値> -o wide

$ kubectl get pod <Pod名> -o yaml | grep containerPort:
```

（３）両方のポート番号が一致しているかを確認する。

#### ▼ Serviceを介したアウトバウンド通信の送信

Serviceを介して、宛先のPodにHTTPSプロトコルでアウトバウンド通信を送信する。完全修飾ドメイン名またはIPアドレスを指定できる。

```bash
# Pod内のコンテナに接続する。
$ kubectl exec -it <Pod名> -c <コンテナ名> -- bash

[root@<Pod名>:~] $ curl -X GET https://<Serviceの完全修飾ドメイン名/IPアドレス>:<ポート番号>
```

<br>

## 04. 外部Ingressコントローラー

### 外部Ingressコントローラーの種類

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/
> - https://www.nginx.com/blog/how-do-i-choose-api-gateway-vs-ingress-controller-vs-service-mesh/

| コントローラー名                                      | 開発環境 | 本番環境 |
| ----------------------------------------------------- | -------- | -------- |
| minikubeアドオン（実体はNginx Ingressコントローラー） | ✅        |         |
| AWS LBコントローラー                                 |         | ✅        |
| GCP CLBコントローラー                                 |         | ✅        |
| Nginx Ingressコントローラー                           | ✅        | ✅        |
| Istio Ingress                                         | ✅        | ✅        |
| Istio Gateway          | ✅        | ✅        |
| ...            | ...        | ...        |


<br>

### AWS LBコントローラー

#### ▼ セットアップ

（１）ローカルマシンにIAMポリシーの```.json```ファイルをダウンロードする。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html

```bash
$ curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.4.0/docs/install/iam_policy.json
```

（２）```.json```ファイルを使用して、IAMポリシーを作成する。

```bash
$ aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json
```

（４）IAM OIDC providerをEKS Clusterに紐づける。

```bash
$ eksctl utils associate-iam-oidc-provider \
    --region=ap-northeast-1 \
    --cluster=foo-eks-cluster \
    --approve
    
2022-05-30 23:39:04 [ℹ]  eksctl version 0.96.0
2022-05-30 23:39:04 [ℹ]  using region ap-northeast-1
2022-05-30 23:39:05 [ℹ]  IAM Open ID Connect provider is already associated with cluster "foo-eks-cluster" in "ap-northeast-1"
```

（５）ServiceAccountを作成し、IAMロールと紐づける。

```bash
$ eksctl create iamserviceaccount \
    --cluster=foo-eks-cluster \
    -n kube-system \
    --name=aws-load-balancer-controller \
    --attach-policy-arn=arn:aws:iam::<アカウントID>:policy/AWSLoadBalancerControllerIAMPolicy \
    --override-existing-serviceaccounts \
    --approve
```

（６）ServiceAccountがデプロイされたことを確認する。

> ℹ️ 参考：https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/

```bash
$ eksctl get iamserviceaccount \
    --cluster foo-eks-cluster \
    --name aws-load-balancer-controller \
    --namespace kube-system

2022-06-06 13:47:33 [ℹ]  eksctl version 0.96.0
2022-06-06 13:47:33 [ℹ]  using region ap-northeast-1
NAMESPACE       NAME                            ROLE ARN
kube-system     aws-load-balancer-controller    arn:aws:iam::<アカウントID>:role/eksctl-foo-eks-cluster-addon-i-Role1-****


# 作成されたServiceAccount
$ kubectl get serviceaccount -n kube-system aws-load-balancer-controller -o yaml

apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<アカウントID>:role/eksctl-foo-eks-cluster-addon-i-Role1-****
  creationTimestamp: "2022-05-29T12:59:15Z"
  labels:
    app.kubernetes.io/managed-by: eksctl
  name: aws-load-balancer-controller
  namespace: kube-system
  resourceVersion: "2103515"
  uid: *****
secrets:
- name: aws-load-balancer-controller-token-****
```

（７）指定したリージョンにAWS LBコントローラーをデプロイする。この時、事前に作成したServiceAcountをALBに紐づける。

```bash
# FargateにAWS LBコントローラーをデプロイする場合
$ helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName=foo-eks-cluster \
    --set serviceAccount.create=false \
    --set serviceAccount.name=aws-load-balancer-controller \
    --set image.repository=602401143452.dkr.ecr.ap-northeast-1.amazonaws.com/amazon/aws-load-balancer-controller \
    --set region=ap-northeast-1 \
    --set vpcId=<VPCID>
 
AWS Load Balancer controller installed!
```

```bash
# EC2にAWS LBコントローラーをデプロイする場合
$ helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName=foo-eks-cluster \
    --set serviceAccount.create=false \
    --set serviceAccount.name=aws-load-balancer-controller \
    --set image.repository=602401143452.dkr.ecr.ap-northeast-1.amazonaws.com/amazon/aws-load-balancer-controller
    
AWS Load Balancer controller installed!
```

（８）AWS LBコントローラーがデプロイされ、READY状態になっていることを確認する。

```bash
$ helm list -n kube-system

NAME                            NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                                   APP VERSION
aws-load-balancer-controller    kube-system     2               2022-01-01 00:00:00.309065 +0900 JST    deployed        aws-load-balancer-controller-1.4.2      v2.4.2


$ kubectl get deployment -n kube-system aws-load-balancer-controller

NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
aws-load-balancer-controller   2/2     2            0           22m
```

もし、以下の様に、```53```番ポートへの接続でエラーになる場合は、CoreDNSによる名前解決が正しくできていないため、CoreDNSが正常に稼働しているか否かを確認する。

```yaml
{"level":"error","ts":*****.*****,"logger":"controller-runtime.manager.controller.ingress","msg":"Reconciler error","name":"foo-ingress","namespace":"foo","error":"ingress: foo/foo-ingress: WebIdentityErr: failed to retrieve credentials\ncaused by: RequestError: send request failed\ncaused by: Post \"https://sts.ap-northeast-1.amazonaws.com/\": dial tcp: lookup sts.ap-northeast-1.amazonaws.com on *.*.*.*:53: read udp *.*.*.*:43958->*.*.*.*:53: read: connection refused"}
```

（９）Ingressをデプロイし、IngressからALB Ingressを自動的に作成させる。以下の条件を満たす必要がある。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html

#### ▼ IngressとALBの紐付け

> ℹ️ 参考：
>
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.4/guide/ingress/annotations/
> - https://qiita.com/murata-tomohide/items/ea4d9acefda92e05e20f

| 項目                                            | 説明                                                         |
| ----------------------------------------------- | ------------------------------------------------------------ |
| ```alb.ingress.kubernetes.io/certificate-arn``` | ALB IngressでHTTPSプロトコルを受け付ける場合、SSL証明書のARNを設定する。 |
| ```alb.ingress.kubernetes.io/listen-ports```    | ALB Ingressでインバウンド通信を受け付けるポート番号を設定する。 |
| ```alb.ingress.kubernetes.io/scheme```          | ALB Ingressのスキームを設定する。                            |
| ```alb.ingress.kubernetes.io/subnets```         | ALB Ingressのルーティング先のサブネットを設定する。      |
| ```alb.ingress.kubernetes.io/target-type```     | ルーティング先のターゲットタイプを設定する。Fargateの場合は、```ip```を設定する必要がある。 |
| ```alb.ingress.kubernetes.io/waf-acl-id```      | LBに紐づけるWAFv1のIDを設定する。ALBと同じリージョンで、WAFv1を作成する必要がある。 |
| ```alb.ingress.kubernetes.io/wafv2-acl-arn```   | LBに紐づけるWAFv2のARNを設定する。ALBと同じリージョンで、WAFv2を作成する必要がある。 |

<br>


## 05. AWS EKSアドオン

### AWS EKSアドオンとは

EKSのコントロールプレーンとデータプレーン上でKubernetesを稼働させるために必要なアドオン。マネージドタイプとセルフマネージドタイプがあり、マネージドタイプではアドオンの設定値をAWSが管理し、ユーザーの設定を強制的に上書きする。一方で、セルフマネージドタイプではユーザーがアドオンの設定値を定義できる。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/add-ons-configuration.html
> - https://qiita.com/masahata/items/ba88d0f9c26b1c2bf6f9

<br>

### eks-code-dnsアドオン

#### ▼ eks-code-dnsアドオンとは

EKSの各ワーカーNode上で、```kube-dns```という名前のDeploymentとして稼働する。同じCluster内の全てのPodの名前解決を行う。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html

<br>

### eks-kube-proxy

#### ▼ eks-kube-proxyアドオンとは

EKSの各ワーカーNode上で、```kube-proxy```という名前のDaemonSetとして稼働する。EKSのコントロールプレーン上のkube-apiserverが、ワーカーNode外からPodにインバウンド通信をルーティングできるようにする。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/managing-kube-proxy.html

<br>

### eks-vpc-cniアドオン

#### ▼ eks-vpc-cniアドオンとは

![aws_eks-vpc-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/aws_eks-vpc-cni.png)

EKSのワーカーNode上で、```aws-node```という名前のDaemonSetとして稼働する。PodにAWS ENIを紐付け、Clusterネットワーク内のIPアドレスをPodのENIに割り当てる。これにより、EKSのClusterネットワーク内にあるPodにインバウンド通信をルーティングできるようにする。

> ℹ️ 参考：
>
> - https://aws.amazon.com/jp/blogs/news/amazon-vpc-cni-increases-pods-per-node-limits/
> - https://docs.aws.amazon.com/eks/latest/userguide/pod-networking.html

<br>
