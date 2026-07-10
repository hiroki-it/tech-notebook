---
title: 【IT技術の知見】admission-controllers＠コントロールプレーン系
description: admission-controllers＠コントロールプレーン系の知見を記録しています。
---

# admission-controllers＠コントロールプレーン系

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. admission-controllersアドオン

### admission-controllersアドオンとは

有効化すると、kube-apiserver にて、認証ステップと認可ステップの後に admission プラグインを実行できる。

![kubernetes_admission-controllers](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_admission-controllers.png)

> - https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/
> - https://knowledge.sakura.ad.jp/21129/
> - https://www.sobyte.net/post/2022-07/k8s-auth/

<br>

### admission-controllersアドオンのステップ

admission-controllers アドオンは、mutating-admission ステップ、validating-admission ステップ、といったコンポーネントから構成されている。

mutating-admission ステップは、リクエストの内容を変更する。

また validating-admission ステップは、リクエストを許可するか否かを決める。

kube-apiserver クライアント (`kubectl` クライアント、Kubernetes リソース) からのリクエスト (例：Kubernetes リソースに対する作成/更新/削除、kube-apiserver からのプロキシへのフォワーディング) 時、各ステップで admission プラグインによる処理 (例：アドオンビルトイン処理、ユーザー定義の処理) を発火させられる。

![kubernetes_admission-controllers_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_admission-controllers_architecture.png)

> - https://kubernetes.io/blog/2019/03/21/a-guide-to-kubernetes-admission-controllers/
> - https://www.digihunch.com/2022/01/kubernetes-admission-control/
> - https://gashirar.hatenablog.com/entry/2020/10/31/141357

<br>

## 01-02. admissionプラグイン

### admissionプラグイン

#### ▼ admissionプラグインとは

admission プラグインは、ビルトイン処理やユーザー定義の処理を発火させられるアドオンから構成されている。

kube-apiserver の起動時に実行される `kube-apiserver` コマンドの結果から、使用している admission プラグインの一覧を取得できる。

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

> - https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/#which-plugins-are-enabled-by-default

#### ▼ Webhook系プラグインのサーバー証明書

Webhook 系プラグイン (例：MutatingAdmissionWebhook、ValidatingAdmissionWebhook など) では、kube-apiserver から webhook サーバーに HTTPS リクエストを送信するとき、webhook サーバーのために SL 証明書が必要である。

このサーバー証明書は、Secret と Configuration (例：MutatingAdmissionConfiguration、ValidatingAdmissionConfiguration など) で管理している。

サーバー証明書を含む Secret の作成は `kube-webhook-certgen` イメージで `create` コマンドを実行することにより、Configuration への挿入は `patch` コマンドを実行することで実現している。

> - https://blog.sakamo.dev/post/ingress-nginx/#ingress-nginx-admission-create
> - https://blog.sakamo.dev/post/ingress-nginx/#ingress-nginx-admission-patch
> - https://tokibi.hatenablog.com/entry/2020/01/07/150359

<br>

### MutatingAdmissionWebhookプラグイン

#### ▼ MutatingAdmissionWebhookプラグイン

MutatingAdmissionWebhook プラグインを使用すると、mutating-admission ステップ時、webhook サーバーに AdmissionReview のリクエストが送信され、ユーザー定義の処理を発火させられる。

ユーザー定義の処理が定義された webhook サーバーを別途用意しておく必要がある。

webhook サーバーから返信された AdmissionReview を含むレスポンスに基づいて、kube-apiserver に対するリクエストの内容を変更する。

![kubernetes_admission-controllers_admission-review](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_admission-controllers_admission-review.png)

> - https://gashirar.hatenablog.com/entry/2020/10/31/141357
> - https://medium.com/ibm-cloud/diving-into-kubernetes-mutatingadmissionwebhook-6ef3c5695f74

#### ▼ MutatingWebhookConfiguration

MutatingWebhookConfiguration で、MutatingAdmissionWebhook プラグインの発火条件や webhook サーバーの宛先情報を設定する。

webhook サーバーは、Cluster 内部に配置することが多い。

![kubernetes_admission-controllers_webhook](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_admission-controllers_webhook.png)

**＊例＊**

Istio の MutatingWebhookConfiguration は以下の通りである。

Pod の作成のための kube-apiserver のコール自体がエラーとなる。

```yaml
apiVersion: admissionregistration.k8s.io/v1beta1
kind: MutatingWebhookConfiguration
metadata:
  name: istio-revision-tag-default
  labels:
    app: sidecar-injector
    istio.io/rev: <リビジョン>
    istio.io/tag: <エイリアス>
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
    # IstiodのServiceの宛先情報を登録する。
    clientConfig:
      service:
        name: istiod-<リビジョン>
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
            - <エイリアス>
```

> - https://blog.mosuke.tech/entry/2022/05/15/admission-webhook-1/
> - https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-configuration

<br>

### ValidatingAdmissionWebhookプラグイン

#### ▼ ValidatingAdmissionWebhookプラグイン

ValidatingAdmissionWebhook プラグインを使用すると、validating-admission ステップ時、webhook サーバーに AdmissionReview のリクエストが送信され、ユーザー定義の処理を発火させられる。

ユーザー定義の処理が定義された webhook サーバーを別途用意しておく必要がある。

> - https://blog.mosuke.tech/entry/2022/05/15/admission-webhook-1/

#### ▼ ValidatingWebhookConfiguration

![kubernetes_admission-controllers_webhook](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_admission-controllers_webhook.png)

ValidatingWebhookConfiguration で、ValidatingAdmissionWebhook プラグインの発火条件や webhook サーバーの宛先情報を設定する。

webhook サーバーは、Cluster 内部に配置することが多い。

**＊例＊**

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: istiod-default-validator
  labels:
    istio.io/rev: <リビジョン>
webhooks:
  # webhook名は完全修飾ドメイン名にする。
  - name: validation.istio.io
    admissionReviewVersions: ["v1", "v1beta1"]
    sideEffects: None
    timeoutSeconds: 5
    # 発火条件を登録する (例：Podの作成/更新リクエスト時に発火する) 。
    rules:
      - apiGroups: ["security.istio.io", "networking.istio.io"]
        apiVersions: ["*"]
        operations: ["CREATE", "UPDATE"]
        resources: ["*"]
        scope: "*"
    # webhookサーバーの情報を登録する。
    clientConfig:
      # webhookサーバーの送信元にあるServiceを登録する。
      service:
        namespace: istio-system
        name: istiod-<リビジョン>
        port: 443
        path: /validate
      # webhookサーバーをCluster内部に自作する場合は、webhookサーバーに証明書バンドルを登録する。
      caBundle: Ci0tLS0tQk...
```

> - https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-configuration
> - https://speakerdeck.com/masayaaoyama/openshiftjp10-amsy810?slide=24
> - https://blog.mosuke.tech/entry/2022/05/15/admission-webhook-1/

<br>

## 01-03. AdmissionReviewとは

### AdmissionReviewとは

AdmissionReview は、リクエストを定義する AdmissionRequest と、レスポンスを定義する AdmissionResponse からなる。

admission-controller アドオンと webhook サーバーの間のリクエスト／レスポンスのデータである。

> - https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview

```yaml
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  # AdmissionRequest
  "request": {},
  # AdmissionResponse
  "response": {},
}
```

<br>

### mutating-admissionステップの場合

#### ▼ AdmissionRequest

kube-apiserver は、特定のリクエストを受信すると、webhook サーバーに AdmissionReview 内の AdmissionRequest にリクエストパラメーターを格納し、リクエストとして送信する。

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
    # 認証／認可されたユーザーを表す。
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
    # 認証／認可された操作の種類を表す。
    "options": {
      "apiVersion": "meta.k8s.io/v1",
      "kind": "CreateOptions"
    },
    # ドライランモードで実行されていることを表す。
    # etcdに永続化されない。
    "dryRun": "false"
  }

  ...
}
```

> - https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-request-and-response
> - https://tokibi.hatenablog.com/entry/2020/01/07/150359
> - https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview

#### ▼ AdmissionResponse

webhook サーバーは、AdmissionReview 内の AdmissionResponse に patch 処理を格納し、レスポンスとして返信する。

マニフェストの patch 処理の定義方法は、JSON Patch ツールに依存している。

**＊例＊**

```yaml
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  # AdmissionResponse
  "response": {
      "uid": "<value from request.uid>",
      # 宛先のwebhookサーバーが受信したか否かを表す。
      "allowed": "true",
      # PathによるPatch処理を行う。
      "patchType": "JSONPatch",
      # Patch処理の対象となるKubernetesリソースと処理内容を表す。base64方式でエンコードされている。
      "patch": "W3sib3AiOiAiYWRkIiwgInBhdGgiOiAiL3NwZWMvcmVwbGljYXMiLCAidmFsdWUiOiAzfV0=",
    },
}
```

```yaml
# patchキーをbase64方式でデコードした場合
[
  {
    # 追加処理を実行する。
    "op": "add",
    # .spec.replicasキーをターゲットとする。
    "path": "/spec/replicas",
    # 値は3とする。
    "value": 3,
  },
]
```

> - https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-request-and-response
> - https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview
> - https://github.com/morvencao/kube-sidecar-injector/blob/4e010f4cdee8baf3cd3f3f59ec9b95e5db9b9f01/cmd/webhook.go#L218-L225
> - https://jsonpatch.com/

<br>

### validating-admissionステップ

#### ▼ AdmissionRequest

kube-apiserver は、mutating-admission ステップと同じ AdmissionReview 内の AdmissionRequest にリクエストパラメータを格納し、リクエストとして送信する。

> - https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview

#### ▼ AdmissionResponse

webhook サーバーは、AdmissionReview 内の AdmissionResponse にバリデーションの結果を格納し、レスポンスとして返信する。

**＊例＊**

```yaml
{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  # AdmissionResponse
  "response": {
      "uid": "<value from request.uid>",
      # 宛先のwebhookサーバーが受信したか否かを表す。
      "allowed": "true",
      "status":
        {
          "code": 403,
          "message": "You cannot do this because it is Tuesday and your name starts with A",
        },
    },
}
```

> - https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/#webhook-request-and-response
> - https://pkg.go.dev/k8s.io/api@v0.24.3/admission/v1#AdmissionReview

<br>
