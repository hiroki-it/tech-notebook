---
title: 【IT技術の知見】OpenPolicyAgent＠認可
description: OpenPolicyAgent＠認可の知見を記録しています。
---

# OpenPolicyAgent＠認可

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. OpenPolicyAgentの仕組み

### アーキテクチャ

OpenPolicyAgentは、OpenPolicyエージェント、Regoコード、DB、から構成される。

> ℹ️ 参考：
> 
> - https://www.velotio.com/engineering-blog/deploy-opa-on-kubernetes
> - https://qiita.com/Hiroyuki_OSAKI/items/e2ec9f2c2ce441483728

![open-policy-agent_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/open-policy-agent_architecture.png)

<br>

### OpenPolicyエージェント

DBからアカウント情報を読み出し、```.rego```ファイルのロジックに基づいて、boolean型値を返却する。返却されたboolean型値を使用して、アプリケーションで認可処理を実施する。

> ℹ️ 参考：https://qiita.com/Hiroyuki_OSAKI/items/e2ec9f2c2ce441483728

![open-policy-agent](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/open-policy-agent.png)

<br>

### ```.rego```ファイル

認可スコープのロジックを定義する。

<br>

### DB

アカウント情報を```.json```形式、認可スコープ定義を```.rego```形式で、保管する。

<br>

## 02. セットアップ

### 必要な情報の設定

#### ▼ アカウント情報の作成

アカウント情報を```.json```形式で作成する。ここでは、各アカウントが一般社員または管理職のいずれかであるかを定義している。

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

アプリケーションは、OpenPolicyエージェントにアカウント情報を送信し、アカウント情報をDBに作成する。

```bash
$ curl \
    -X PUT \
    -H 'Content-Type:application/json' \
    --data-binary @subordinates.json \
    localhost:8181/v1/data/subordinates
```

#### ▼ 認可スコープ定義

認可スコープ定義のロジックを```.rego```形式で作成する。

> ℹ️ 参考：https://thinkit.co.jp/article/17511

```prolog
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

アプリケーションは、OpenPolicyエージェントに```.rego```ファイルを送信し、認可スコープ定義をDBに作成する。

```bash
$ curl \
    -X PUT \
    -H 'Content-Type: text/plain'\
    --data-binary @httpapi_authz.rego \
    localhost:8181/v1/policies/httpapi_authz
```

<br>

### 認可の実施

#### ▼ リクエスト内容の作成

リクエスト内容を```.json```形式で作成する。ここでは、aliceアカウントの参照権限の有無をリクエストを定義する。

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

アプリケーションは、aliceアカウントの参照権限の有無をOpenPolicyエージェントにリクエストし、OpenPolicyエージェントは```true```を返却する。

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
