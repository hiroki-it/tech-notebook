---
title: 【IT技術の知見】OpenPolicyAgent＠カスタムリソース
description: OpenPolicyAgent＠カスタムリソースの知見を記録しています。
---

# OpenPolicyAgent＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. OpenPolicyAgentの仕組み

### アーキテクチャ

OpenPolicyAgentは、OpenPolicyエージェント、```.rego```ファイル、DB、から構成される。

> ℹ️ 参考：
>
> - https://www.velotio.com/engineering-blog/deploy-opa-on-kubernetes
> - https://qiita.com/Hiroyuki_OSAKI/items/e2ec9f2c2ce441483728

![open-policy-agent_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/open-policy-agent_architecture.png)

<br>

### OpenPolicyエージェント

DBからアカウント情報を読み出し、```.rego```ファイルのロジックに基づいて、boolean型値を返却する。返却されたboolean型値を使用して、リクエストの送信元（例：アプリケーション、kube-apiserver）で認可処理を実施する。

> ℹ️ 参考：https://qiita.com/Hiroyuki_OSAKI/items/e2ec9f2c2ce441483728

![open-policy-agent](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/open-policy-agent.png)

<br>

### ```.rego```ファイル

認可スコープのロジックを定義する。

<br>

### DB

アカウント情報を```.json```形式、認可スコープ定義を```.rego```形式で、保管する。

<br>

## 02. ユースケース

### アプリケーションの認可サービスとして

#### ▼ アプリケーションの認可サービスとは

アプリケーションの認可スコープ定義の責務を認可サービスとして切り分ける。返却されたboolean型値を使用して、アプリケーションは認可処理を実施する。

#### ▼ アカウント情報の作成

（１）アカウント情報を```.json```形式で作成する。ここでは、各アカウントが一般社員または管理職のいずれかであるかを定義している。

> ℹ️ 参考：https://thinkit.co.jp/article/17511

```yaml
# subordinates.jsonファイル
{
  "alice": ["bob"],
  "bob": [],
  "charlie": ["david"],
  "david": []
}
```

（２）アプリケーションは、OpenPolicyエージェントにアカウント情報を送信し、アカウント情報をDBに作成する。

```bash
$ curl \
    -X PUT \
    -H 'Content-Type:application/json' \
    --data-binary @subordinates.json \
    localhost:8181/v1/data/subordinates
```

#### ▼ 認可スコープの定義

（３）認可スコープ定義のロジックを```.rego```形式で作成する。

> ℹ️ 参考：https://thinkit.co.jp/article/17511

```erlang
package httpapi.authz

# 社員のアカウント情報をインポートする。
import data.subordinates as subord

default allow = false

# 一般社員は、自身の給与のみで参照権限を持つ（trueを返却する）。
allow {
  some username
  input.method == "GET"
  input.path = ["finance", "salary", username]
  input.user == username
}

# 管理職は、自身と部下社員の給与で参照権限を持つ（trueを返却する）。
allow {
  some username
  input.method == "GET"
  input.path = ["finance", "salary", username]
  subord[input.user][_] == username
}
```

（４）アプリケーションは、OpenPolicyエージェントに```.rego```ファイルを送信し、認可スコープ定義をDBに作成する。

```bash
$ curl \
    -X PUT \
    -H 'Content-Type: text/plain'\
    --data-binary @httpapi_authz.rego \
    localhost:8181/v1/policies/httpapi_authz
```

#### ▼ 認可スコープのリクエスト

（５）リクエスト内容を```.json```形式で作成する。ここでは、aliceというアカウントの参照権限の有無をリクエストを定義する。

```yaml
# request.jsonファイル
{
  "input": {
    "method": "GET",
    "path": ["finance", "salary", "alice"],
    "user": "alice"
  }
}
```

（６）アプリケーションは、aliceアカウントの参照権限の有無をOpenPolicyエージェントにリクエストする。OpenPolicyエージェントは、アプリケーションに```true```を返却する。

```bash
$ curl \
    -s \
    -X POST \
    -H 'Content-Type:application/json' \
    --data-binary @request.json \
    localhost:8181/v1/data/httpapi/authz/allow | jq .

{
  "result": true
}
```

<br>

### KubernetesのGatekeeperとして

#### ▼ Gatekeeperとは

kube-apiserverのvalidating-admissionステップ時に、GatekeeperのwebhookサーバーにAdmissionReviewのリクエストが送信され、Gatekeeperの持つOpenPolicyAgentの処理を発火させる。


> ℹ️ 参考：https://blog.mosuke.tech/entry/2022/06/07/admission-webhook-opa/

![kubernetes_open-policy-agent](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_open-policy-agent.png)


#### ▼ gatekeeper-validating-webhook-configuration

Podの作成/更新時にwebhookサーバーにリクエストを送信できるように、ValidatingWebhookConfigurationでValidatingWebhookアドオンを設定する。

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
      # Webhookの前段にあるServiceの情報を登録する。
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
      # Webhookの前段にあるServiceの情報を登録する。
      service:
        name: gatekeeper-webhook-service
        namespace: gatekeeper-system
        # エンドポイント
        path: /v1/admitlabel
        port: 443
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
