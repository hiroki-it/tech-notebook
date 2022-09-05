---
title: 【IT技術の知見】アドオン＠Kubernetes
description: アドオン＠Kubernetesの知見を記録しています。
---

# アドオン＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. admission-controllersアドオン

### admission-controllersアドオンとは

![kubernetes_admission-controllers](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers.png)

kube-apiserverにて、認証ステップと認可ステップの後にadmission-controllersアドオンのステップを実行できる。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/
> - https://knowledge.sakura.ad.jp/21129/
> - https://www.sobyte.net/post/2022-07/k8s-auth/

<br>

### admission-controllersアドオンのステップ

![kubernetes_admission-controllers_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_architecture.png)

admission-controllersアドオンは、mutating-admissionステップ、validating-admissionステップ、から構成されている。クライアントからのリクエスト（例：Kubernetesリソースに対する作成/更新/削除、kube-apiserverからのプロキシへの転送）時に、各ステップでadmissionアドオンによる処理（例：アドオンビルトイン処理、独自処理）を発火させられる。

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

admissionアドオンは、ビルトイン処理や独自処理を発火させられるアドオンから構成されている。```kube-apiserver```コマンドの結果から、使用しているadmissionアドオンの一覧を取得できる。

> ℹ️ 参考：https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#which-plugins-are-enabled-by-default

```bash
# admissionアドオンを確認する。
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

MutatingAdmissionWebhookアドオンを使用すると、mutating-admissionステップ時に、webhookサーバーにAdmissionReviewのリクエストを送信し、独自処理を発火させられる。独自処理が定義されたwebhookサーバーを別途用意しておく必要がある。webhookサーバーから返信されたAdmissionReviewを含むレスポンスに基づいて、kube-apiserverに対するリクエストの内容を変更する。

> ℹ️ 参考：
>
> - https://gashirar.hatenablog.com/entry/2020/10/31/141357
> - https://medium.com/ibm-cloud/diving-into-kubernetes-mutatingadmissionwebhook-6ef3c5695f74

#### ▼ MutatingWebhookConfiguration

![kubernetes_admission-controllers_webhook](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_webhook.png)

MutatingWebhookConfigurationでは、mutating-admissionステップのWebhookの発火条件やwebhookサーバーの宛先を設定する。webhookサーバーは、Cluster内部に設置することが多い。

> ℹ️ 参考：
>
> - https://blog.mosuke.tech/entry/2022/05/15/admission-webhook-1/
> - https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-configuration

**＊例＊**

```yaml
apiVersion: admissionregistration.k8s.io/v1beta1
kind: MutatingWebhookConfiguration
metadata:
  name: sidecar-injector-webhook-cfg
  labels:
    app: sidecar-injector
webhooks:
    # webhook名はDNS名にする。
  - name: sidecar-injector.morven.me
    # 発火条件を登録する。（例：Podの作成/更新リクエスト時に発火する）
    rules:
      - operations: ["CREATE", "UPDATE"]
        apiGroups: [""]
        apiVersions: ["v1"]
        resources: ["pods"]
    # webhookサーバーの情報を登録する。
    clientConfig:
      # webhookサーバーの前段にあるServiceを登録する。
      service:
        name: sidecar-injector-webhook-service
        namespace: sidecar-injector
        path: "/mutate"
      # webhookサーバーをCluster内部に自作する場合は、webhookサーバーに証明書バンドルを登録する。
      caBundle: Ci0tLS0tQk...
    # 特定のラベル値のNamespaceに属するPodのみを対象とする。
    namespaceSelector:
      matchLabels:
        # sidecar-injection=enabledのNamespaceに属するPodのみを対象とする。
        sidecar-injection: enabled
```

#### ▼ AdmissionRequest

kube-apiserverは、特定のリクエストを受信すると、webhookサーバーにAdmissionReview内のAdmissionRequestにリクエストパラメータを格納し、リクエストとして送信する。

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
    "subResource": "scale",
    "requestKind": {
      "group": "autoscaling",
      "version": "v1",
      "kind": "Scale"
    },
    "requestResource": {
      "group": "apps",
      "version": "v1",
      "resource": "deployments"
    },
    "requestSubResource": "scale",
    "name": "my-deployment",
    "namespace": "my-namespace",
    # kube-apiserverの操作の種類を表す。
    "operation": "UPDATE",
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
    # 新しく認証/認可されたオブジェクトを表す。
    "object": {
      "apiVersion": "autoscaling/v1",
      "kind": "Scale"
    },
    # Kubernetesリソースの操作前の状態を表す。
    "oldObject": {
      "apiVersion": "autoscaling/v1",
      "kind": "Scale"
    },
    # 認証/認可された操作の種類を表す。
    "options": {
      "apiVersion": "meta.k8s.io/v1",
      "kind": "UpdateOptions"
    },
    # ドライランモードで実行されていることを表す。
    # etcdに永続化されない。
    "dryRun": false
  }
}
```

#### ▼ AdmissionResponse

webhookサーバーは、AdmissionReview内のAdmissionResponseにpatch処理を格納し、レスポンスとして返信する。マニフェストファイルのpatch処理の定義方法は、JSON Patchツールに依存している。

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
# 例として、マニフェストファイルにキー（spec.replicas）と値（3）を追加する。
[
  {
    "op": "add",
    "path": "/spec/replicas",
    "value": 3
  }
]
```

<br>

### ValidatingAdmissionWebhookアドオン

#### ▼ ValidatingAdmissionWebhookアドオン

ValidatingAdmissionWebhookアドオンを使用すると、validating-admissionステップでWebhookによる独自処理を発火させられる。独自処理が定義されたwebhookサーバーを別途用意しておく必要がある。

> ℹ️ 参考：https://blog.mosuke.tech/entry/2022/05/15/admission-webhook-1/

#### ▼ ValidatingWebhookConfiguration

![kubernetes_admission-controllers_webhook](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_webhook.png)

ValidatingWebhookConfigurationでは、validating-admissionステップのWebhookの発火条件やwebhookサーバーの宛先を設定する。webhookサーバーは、Cluster内部に設置することが多い。

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
  name: foo-validation-webhook-configuration
webhooks:
    # webhook名はDNS名にする。
  - name: foo.example.com
    # 発火条件を登録する。（例：Podの作成/更新リクエスト時に発火する）
    rules:
      - apiGroups:   [""]
        apiVersions: ["v1"]
        operations:  ["CREATE", "UPDATE"]
        resources:   ["pods"]
        scope:       "Namespaced"
    # webhookサーバーの情報を登録する。
    clientConfig:
      # webhookサーバーの前段にあるServiceを登録する。
      service:
        namespace: foo-namespace
        name: foo-webhook-service
        port: 443
        path: /validate
      # webhookサーバーをCluster内部に自作する場合は、webhookサーバーに証明書バンドルを登録する。
      caBundle: Ci0tLS0tQk...
    admissionReviewVersions: ["v1"]
    sideEffects: None
    timeoutSeconds: 5
```

#### ▼ AdmissionRequest

kube-apiserverは、mutating-admissionステップと同じAdmissionReview内のAdmissionRequestにリクエストパラメータを格納し、リクエストとして送信する。

> ℹ️ 参考：https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview

#### ▼ AdmissionResponse

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

## 02. cluster-autoscalerアドオン

### cluster-autoscalerアドオンとは

![kubernetes_cluster-autoscaler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cluster-autoscaler.png)

ワーカーNodeの水平スケーリングを実行する。metrics-serverから取得したPodの最大リソース消費量（```spec.resources```キーの合計値）と、ワーカーNode全体のリソースの空き領域を比較し、ワーカーNodeをスケールアウト/スケールインさせる。現在の空き容量ではPodを新しく作成できないようであればワーカーNodeをスケールアウトし、反対に空き容量に余裕があればスケールインする。Kubernetes標準のリソースではなく、クラウドプロバイダーを使用する必要がある。マスターNodeに配置することが推奨されている。

> ℹ️ 参考：https://speakerdeck.com/oracle4engineer/kubernetes-autoscale-deep-dive?slide=8

<br>

### クラウドプロバイダー別

#### ▼ AWSの場合

AWSの場合、cluster-autoscalerアドオンの代わりにKarpenterを使用できる。

> ℹ️ 参考：https://sreake.com/blog/learn-about-karpenter/

<br>

## 03. cniアドオン

### cniアドオンとは

![kubernetes_cni-plugin](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cni-plugin.png)

PodにNICを紐付け、Clusterネットワーク内のIPアドレスをPodのNICに割り当てる。これにより、Clusterネットワーク内にあるPodに通信できるようにする。cniアドオンは、kubeletによるPodの起動時に有効化される。Clusterネットワークの種類に応じたcniアドオンが用意されている。

> ℹ️ 参考：
>
> - https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=27
> - https://kubernetes.io/docs/concepts/cluster-administration/networking/

<br>

## 04. core-dnsアドオン（旧kube-dns）

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
$ kubectl get pods -n kube-system

NAME                                     READY   STATUS    RESTARTS   AGE
coredns-558bd4d5db-hg75t                 1/1     Running   0          1m0s
coredns-558bd4d5db-ltbxt                 1/1     Running   0          1m0s
```

<br>
