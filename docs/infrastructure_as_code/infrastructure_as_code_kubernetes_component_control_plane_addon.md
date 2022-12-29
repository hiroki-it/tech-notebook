---
title: 【IT技術の知見】アドオン＠コントロールプレーンコンポーネント
description: アドオン＠コントロールプレーンコンポーネントの知見を記録しています。
---

# アドオン＠コントロールプレーンコンポーネント

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

| ステップ名                   | 説明                   |
|--------------------------|----------------------|
| mutating-admissionステップ   | リクエストの内容を変更する。     |
| validating-admissionステップ | リクエストを許可するか否かを決める。 |

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

MutatingWebhookConfigurationで、MutatingAdmissionWebhookアドオンの発火条件やwebhookサーバーの宛先を設定する。

webhookサーバーは、Cluster内部に設置することが多い。



> ℹ️ 参考：
>
> - https://blog.mosuke.tech/entry/2022/05/15/admission-webhook-1/
> - https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-configuration

**＊例＊**

IstioのMutatingWebhookConfigurationは以下の通りである。Podの作成のためのkube-apiserverのコール自体がエラーとなる。

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
    # webhookサーバーのコールに失敗した場合の処理を設定する。
    failurePolicy: Fail
    matchPolicy: Equivalent
    # 適用するNamaespaceを設定する。
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

ValidatingWebhookConfigurationで、ValidatingAdmissionWebhookアドオンの発火条件やwebhookサーバーの宛先を設定する。

webhookサーバーは、Cluster内部に設置することが多い。



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

webhookサーバーは、AdmissionReview内のAdmissionResponseにpatch処理を格納し、レスポンスとして返信する。

マニフェストのpatch処理の定義方法は、JSON Patchツールに依存している。



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

