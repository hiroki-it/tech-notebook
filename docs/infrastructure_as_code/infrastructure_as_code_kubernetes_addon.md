---
title: 【IT技術の知見】アドオン＠Kubernetes
description: アドオン＠Kubernetesの知見を記録しています。
---

# アドオン＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/index.html

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

admission-controllersアドオンは、mutating-admissionステップ、validating-admissionステップ、から構成されている。クライアント（```kubectl```実行者、Kubernetesリソース）からのリクエスト（例：Kubernetesリソースに対する作成/更新/削除、kube-apiserverからのプロキシへの転送）時に、各ステップでadmissionアドオンによる処理（例：アドオンビルトイン処理、独自処理）を発火させられる。

> ℹ️ 参考：
>
> - https://kubernetes.io/blog/2019/03/21/a-guide-to-kubernetes-admission-controllers/
> - https://www.digihunch.com/2022/01/kubernetes-admission-control/
> - https://gashirar.hatenablog.com/entry/2020/10/31/141357

| ステップ名                   | 説明                                   |
| ---------------------------- | -------------------------------------- |
| mutating-admissionステップ   | リクエストの内容を変更する。           |
| validating-admissionステップ | リクエストを許可するか否かを決定する。 |

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

## 03. core-dnsアドオン（旧kube-dns）

### core-dnsアドオンとは

ワーカーNode内の権威DNSサーバーとして、Kubernetesリソースの名前解決を行う。

> ℹ️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=29

![kubernetes_coredns](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_coredns.png)

<br>

### CoreDNS Service/Pod

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



## 04. AWS EKSアドオン

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
