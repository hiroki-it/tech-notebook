---
title: 【IT技術の知見】OpenPolicyAgent＠CNCF
description: OpenPolicyAgent＠CNCFの知見を記録しています。
---

# OpenPolicyAgent＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. OpenPolicyAgentの仕組み

### アーキテクチャ

OpenPolicyAgentは、OpenPolicyエージェント、`.rego`ファイル、DB、といったコンポーネントから構成される。

![open-policy-agent_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/open-policy-agent_architecture.png)

> - https://www.velotio.com/engineering-blog/deploy-opa-on-kubernetes
> - https://qiita.com/Hiroyuki_OSAKI/items/e2ec9f2c2ce441483728

<br>

### OpenPolicyエージェント

DBからアカウント情報を読み出し、認可処理を実行する。

この時、`.rego`ファイルのロジックに基づいて、boolean型値を返却する。

返却されたboolean型値を使用して、リクエストの送信元 (例：アプリケーション、kube-apiserver) で認可スコープ内の処理を実行する。

![open-policy-agent](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/open-policy-agent.png)

> - https://qiita.com/Hiroyuki_OSAKI/items/e2ec9f2c2ce441483728

<br>

### `.rego`ファイル

認可スコープのロジックを定義する。

<br>

### DB

アカウント情報を`.json`形式、認可スコープ定義を`.rego`形式で、保管する。

<br>

## 02. ユースケース

### アプリケーションの認可サービスとして

#### ▼ アプリケーションの認可サービスとは

アプリケーションの認可スコープ定義の責務を認可サービスとして切り分ける。

アプリケーションはOpenPolicyAgentにリクエストを送信し、OpenPolicyAgentは認可スコープに応じてboolean型値を返却する。

返却されたboolean型値を使用して、アプリケーションは認可スコープ内の処理を実行する。

#### ▼ アカウント情報の作成

`(1)`

: アカウント情報を`.json`形式で作成する。

     ここでは、各アカウントが一般社員または管理職のいずれかであるかを定義している。

> - https://thinkit.co.jp/article/17511

```yaml
# subordinates.jsonファイル
{"alice": ["bob"], "bob": [], "charlie": ["david"], "david": []}
```

`(2)`

: アプリケーションは、OpenPolicyエージェントにアカウント情報を送信し、アカウント情報をDBに作成する。

```bash
$ curl \
    -X PUT \
    -H 'Content-Type:application/json' \
    --data-binary @subordinates.json \
    127.0.0.1:8181/v1/data/subordinates
```

#### ▼ 認可スコープの定義

`(3)`

: 認可スコープ定義のロジックを`.rego`形式で作成する。

> - https://thinkit.co.jp/article/17511

```erlang
package httpapi.authz

# 社員のアカウント情報をインポートする。
import data.subordinates as subord

default allow = false

# 一般社員は、自身の給与のみで参照権限を持つ (trueを返却する) 。
allow {
  some username
  input.method == "GET"
  input.path = ["finance", "salary", username]
  input.user == username
}

# 管理職は、自身と部下社員の給与で参照権限を持つ (trueを返却する) 。
allow {
  some username
  input.method == "GET"
  input.path = ["finance", "salary", username]
  subord[input.user][_] == username
}
```

`(4)`

: アプリケーションは、OpenPolicyエージェントに`.rego`ファイルを送信し、認可スコープ定義をDBに作成する。

```bash
$ curl \
    -X PUT \
    -H 'Content-Type: text/plain'\
    --data-binary @httpapi_authz.rego \
    127.0.0.1:8181/v1/policies/httpapi_authz
```

#### ▼ 認可スコープのリクエスト

`(5)`

: 認可スコープを取得するためのリクエストを`.json`形式で作成する。

     実際は、aliceというアカウントがデータを参照できるかどうかを取得するために、アプリケーションがリクエストを作成する。

```yaml
# request.jsonファイル
{
  # リクエストの内容
  "input": {
      # GETメソッド
      "method": "GET",
      # パス
      "path": ["finance", "salary", "alice"],
      # アカウント名
      "user": "alice",
    },
}
```

`(6)`

: アプリケーションは、aliceアカウントの参照権限の有無をOpenPolicyエージェントにリクエストを送信する。

     OpenPolicyエージェントは、アプリケーションに`true`を返却する。

```bash
$ curl \
    -X POST \
    -H 'Content-Type:application/json' \
    --data-binary @request.json \
    127.0.0.1:8181/v1/data/httpapi/authz/allow | jq .

{
  "result": "true"
}
```

<br>

### KubernetesのGatekeeperとして

#### ▼ Gatekeeperとは

内部的にOpenPolicyAgentを使用して、Kubernetesのマニフェストを検証する。

kube-apiserverのvalidating-admissionステップ時に、GatekeeperのwebhookサーバーにAdmissionReviewのリクエストが送信され、Gatekeeperの持つOpenPolicyAgentの処理を発火させる。

そのため、GitOpsのCDパイプライン上にバリデーションを実行できる。

![kubernetes_open-policy-agent](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_open-policy-agent.png)

> - https://blog.mosuke.tech/entry/2022/06/07/admission-webhook-opa/
> - https://www.infracloud.io/blogs/opa-and-gatekeeper/

#### ▼ gatekeeper-validating-webhook-configuration

Podの作成/更新時にwebhookサーバーにリクエストを送信できるように、ValidatingWebhookConfigurationでValidatingWebhookアドオンを設定する。

`.webhooks.failurePolicy`キーで設定している通り、webhookサーバーのコールに失敗した場合は、無視してkube-apiserverの処理を続ける。

そのため、Gatekeeperが起動に失敗しても、Podが中止されることはない。

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: gatekeeper-validating-webhook-configuration
  labels:
    gatekeeper.sh/system: "yes"
webhooks:
  # webhook名は完全修飾ドメイン名にする。
  - name: validation.gatekeeper.sh
    admissionReviewVersions: ["v1", "v1beta1"]
    clientConfig:
      # webhookサーバーをCluster内部に自作する場合は、webhookサーバーに証明書バンドルを登録する。
      caBundle: Ci0tLS0tQk...
      # WebhookのダウンストリームにあるServiceの情報を登録する。
      service:
        name: gatekeeper-webhook-service
        namespace: gatekeeper-system
        # エンドポイント
        path: /v1/admit
        port: 443
    failurePolicy: Ignore
    matchPolicy: Exact
    namespaceSelector:
      matchExpressions:
        - key: admission.gatekeeper.sh/ignore
          operator: DoesNotExist
    objectSelector: {}
    # validating-admissionステップ発火条件を登録する。
    rules:
      - apiGroups: ["*"]
        apiVersions: ["*"]
        operations: ["CREATE", "UPDATE"]
        resources: ["*"]
        scope: "*"
    sideEffects: None
    timeoutSeconds: 3
    # webhook名は完全修飾ドメイン名にする。
  - name: check-ignore-label.gatekeeper.sh
    admissionReviewVersions: ["v1", "v1beta1"]
    clientConfig:
      # webhookサーバーをCluster内部に自作する場合は、webhookサーバーに証明書バンドルを登録する。
      caBundle: Ci0tLS0tQk...
      # WebhookのダウンストリームにあるServiceの情報を登録する。
      service:
        name: gatekeeper-webhook-service
        namespace: gatekeeper-system
        # エンドポイント
        path: /v1/admitlabel
        port: 443
    # webhookサーバーのコールに失敗した場合の処理を設定する。
    failurePolicy: Fail
    matchPolicy: Exact
    namespaceSelector: {}
    objectSelector: {}
    # validating-admissionステップ発火条件を登録する。
    rules:
      - apiGroups: [""]
        apiVersions: ["*"]
        operations: ["CREATE", "UPDATE"]
        resources: ["namespaces"]
        scope: "*"
    sideEffects: None
    timeoutSeconds: 3
```

<br>
