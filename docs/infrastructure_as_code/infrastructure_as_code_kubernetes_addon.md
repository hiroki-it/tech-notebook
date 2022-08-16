---
title: 【IT技術の知見】アドオン＠Kubernetes
description: アドオン＠Kubernetesの知見を記録しています。
---

# アドオン＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. admission-controllersアドオン

### admission-controllersアドオンとは

![kubernetes_admission-controllers](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers.png)

kube-apiserverのリクエストの処理時には認証認可プロセスがある。admission-controllersアドオンを導入すると、この後に、作成リクエストや変更リクエストのパラメーターを条件に応じて書き換える処理や、パラメーターのバリデーションを実行する処理を定義できる。

ℹ️ 参考：

- https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/
- https://knowledge.sakura.ad.jp/21129/
- https://blog.mosuke.tech/entry/2022/05/15/admission-webhook-1/

<br>

### admission-controllersアドオンの仕組み

![kubernetes_admission-controllers_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_architecture.png)

admission-controllersアドオンは、2つのステップから構成されている。各ステップではadmissionアドオンを使用して処理を発火させることができ、組み込み処理または独自処理を発火させられる。

ℹ️ 参考：

- https://kubernetes.io/blog/2019/03/21/a-guide-to-kubernetes-admission-controllers/
- https://gashirar.hatenablog.com/entry/2020/10/31/141357

| ステップ名                    | 説明                                                         |
|--------------------------| ------------------------------------------------------------ |
| mutating-admissionステップ   | 作成リクエストや変更リクエストのパラメーターを条件に応じて書き換える処理を定義する。 |
| validating-admissionステップ | パラメーターのバリデーションを実行する独自処理を定義する。   |

<br>

## 01-02. admissionアドオン

### admissionアドオンとは

admission-controllersアドオンを使用している場合に、mutating-admissionステップとvalidating-admissionステップで特定の処理を発火させられる。```kube-apiserver```コマンドの結果から、使用しているadmissionアドオンの一覧を取得できる。

ℹ️ 参考：https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#which-plugins-are-enabled-by-default

```bash
$ kube-apiserver -h | grep enable-admission-plugins
```

<br>

### MutatingAdmissionWebhookアドオン

#### ▼ MutatingAdmissionWebhookアドオン

MutatingAdmissionWebhookアドオンを使用すると、mutating-admissionステップでWebhookによる独自処理を発火させられる。独自処理が定義されたwebhookサーバーを別途用意しておく必要がある。

ℹ️ 参考：https://blog.mosuke.tech/entry/2022/05/15/admission-webhook-1/

![kubernetes_admission-controllers_webhook](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_webhook.png)

#### ▼ MutatingWebhookConfiguration

MutatingWebhookConfigurationでは、mutating-admissionステップのWebhookの発火条件やwebhookサーバーの宛先を設定する。

ℹ️ 参考：

- https://gashirar.hatenablog.com/entry/2020/10/31/141357
- https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-configuration

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
    # 発火ルールを登録する。（例：Podの作成/更新リクエスト時に発火する）
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

#### ▼ AdmissionReviewリクエスト

kube-apiserverは、特定のリクエストを受信すると、webhookサーバーにAdmissionReview内のAdmissionRequestにリクエストパラメータを格納し、リクエストとして送信する。

ℹ️ 参考：

- https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-request-and-response
- https://zenn.dev/kanatakita/articles/6d6e5391336c1c5669c2
- https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview

**＊例＊**

```yaml
{
  "apiVersion": "admission.k8s.io/v1beta1",
  "kind": "AdmissionReview",
  # AdmissionRequest（webhookサーバーへのリクエストのパラメーター）
  "request": {
    "uid": "705ab4f5-6393-11e8-b7cc-42010a800002",
    "kind": {"group":"autoscaling","version":"v1","kind":"Scale"},
    "resource": {"group":"apps","version":"v1","resource":"deployments"},
    "subResource": "scale",
    "requestKind": {"group":"autoscaling","version":"v1","kind":"Scale"},
    "requestResource": {"group":"apps","version":"v1","resource":"deployments"},
    "requestSubResource": "scale",
    "name": "my-deployment",
    "namespace": "my-namespace",
    "operation": "UPDATE",
    "userInfo": {
      "username": "admin",
      "uid": "014fbff9a07c",
      "groups": ["system:authenticated","my-admin-group"],
      "extra": {
        "some-key":["some-value1", "some-value2"]
      }
    },
    # kube-apiserverでリクエストされたKubernetesリソースを表す。
    "object": {"apiVersion":"autoscaling/v1","kind":"Scale",...},
    "oldObject": {"apiVersion":"autoscaling/v1","kind":"Scale",...},
    "options": {"apiVersion":"meta.k8s.io/v1","kind":"UpdateOptions",...},
    "dryRun": false
  }
}
```

#### ▼ webhookサーバー

webhookサーバーは、Cluster内部または外部に設置できる。webhookサーバーはPod内で稼働させ、MutatingWebhookConfigurationで指定できるようにServiceでルーティングさせる。

ℹ️ 参考：https://gashirar.hatenablog.com/entry/2020/10/31/141357

#### ▼ AdmissionReviewレスポンス

webhookサーバーは、AdmissionReview内のAdmissionResponseにpatch処理を格納し、レスポンスとして返信する。マニフェストファイルのpatch処理の定義方法は、JSON Patchツールに依存している。

ℹ️ 参考：

- https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-request-and-response
- https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview
- https://github.com/morvencao/kube-sidecar-injector/blob/4e010f4cdee8baf3cd3f3f59ec9b95e5db9b9f01/cmd/webhook.go#L218-L225
- https://jsonpatch.com/

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

ℹ️ 参考：https://blog.mosuke.tech/entry/2022/05/15/admission-webhook-1/

![kubernetes_admission-controllers_webhook](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_admission-controllers_webhook.png)

#### ▼ ValidatingWebhookConfiguration

ValidatingWebhookConfigurationでは、validating-admissionステップのWebhookの発火条件やwebhookサーバーの宛先を設定する。

ℹ️ 参考：

- https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-configuration
- https://speakerdeck.com/masayaaoyama/openshiftjp10-amsy810?slide=24

**＊例＊**

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: foo-validation-webhook-configuration
webhooks:
    # webhook名はDNS名にする。
  - name: foo.example.com
    # 発火ルールを登録する。（例：Podの作成/更新リクエスト時に発火する）
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

#### ▼ AdmissionReviewリクエスト

kube-apiserverは、mutating-admissionステップと同じAdmissionReview内のAdmissionRequestにリクエストパラメータを格納し、リクエストとして送信する。

ℹ️ 参考：https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview

#### ▼ webhookサーバー

webhookサーバーは、Cluster内部または外部に設置できる。webhookサーバーはPod内で稼働させ、ValidatingWebhookConfigurationで指定できるようにServiceでルーティングさせる。

#### ▼ AdmissionReviewレスポンス

webhookサーバーは、AdmissionReview内のAdmissionResponseにバリデーションの結果を格納し、レスポンスとして返信する。

ℹ️ 参考：

- https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-request-and-response
- https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview

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

PodにNICを紐付け、Clusterネットワーク内のIPアドレスをPodのNICに割り当てる。これにより、Clusterネットワーク内にあるPodに通信できるようにする。cniアドオンは、kubeletによるPodの起動時に有効化される。Clusterネットワークの種類に応じたcniアドオンが用意されている。

ℹ️ 参考：

- https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=27
- https://kubernetes.io/docs/concepts/cluster-administration/networking/

<br>

## 03. core-dnsアドオン（旧kube-dns）

### core-dnsアドオンとは

ワーカーNode内の権威DNSサーバーとして、Kubernetesリソースの名前解決を行う。

ℹ️ 参考：https://speakerdeck.com/hhiroshell/kubernetes-network-fundamentals-69d5c596-4b7d-43c0-aac8-8b0e5a633fc2?slide=29

![kubernetes_coredns](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_coredns.png)

<br>

### CoreDNS Service/Pod

CoreDNSはワーカーNode内にPodとして稼働しており、これはCoreDNS Serviceによって管理されている。

ℹ️ 参考：https://amateur-engineer-blog.com/kubernetes-dns/#toc6

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
