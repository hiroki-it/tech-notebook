---
title: 【IT技術の知見】API仕様書＠RESTful-API
description: API仕様書＠RESTful-APIの知見を記録しています。
---

# API仕様書＠RESTful-API

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. OpenAPI仕様

### OpenAPI仕様とは

RESTful-APIの仕様を実装により説明するためのフォーマットのこと。JSON型またはYAML型で実装できる。

いくつかのフィールドから構成されている。

> - https://spec.openapis.org/oas/v3.1.0#fixed-fields

```yaml
openapi: # openapiフィールド

info: # infoフィールド

servers: # serversフィールド

paths: # pathsフィールド

webhooks: # webhooksフィールド

components: # componentsフィールド

security: # securityフィールド

tags: # tagsフィールド

externalDocs: # externalDocsフィールド
```

<br>

### OpenAPI仕様の視覚化

#### ▼ ReDocの場合

ReDocを使用して、OpenAPI仕様から`.html`ファイルを作成する。

> - https://qiita.com/icck/items/97d00495ec324e1902d6

```bash
$ npm install -g redoc-cli

$ redoc-cli bundle openapi.yaml redoc.html
```

<br>

### クラウドプロバイダーとの統合

#### ▼ API Gatewayの場合

API GatewayによるOpenAPI仕様のインポートについては、以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/cloud_computing/cloud_computing_aws_resource_api_gateway_import.html

<br>

## 02. フィールド

### openapiフィールド (必須)

OpenAPI仕様のバージョンを定義する。

**＊実装例＊**

```yaml
openapi: 3.0.0
```

<br>

### infoフィールド (必須)

API名、作成者名、メールアドレス、ライセンス、などを定義する。

**＊実装例＊**

```yaml
info:
  title: Foo API # API名
  description: The API for Foo. # APIの説明
  termsOfService: https://www.foo.com/terms/ # 利用規約
  contact:
    name: API support # 連絡先名
    url: https://www.foo.com/support # 連絡先に関するURL
    email: support@foo.com # メールアドレス
  license:
    name: Apache 2.0 # ライセンス
    url: https://www.apache.org/licenses/LICENSE-2.0.html # URL
  version: <バージョンタグ> # APIドキュメントのバージョン
```

<br>

### serversフィールド

API自体のURL、などを定義する。

**＊実装例＊**

```yaml
servers:
  - url: https://{env}.foo.com/api/v1
    description: |
    variables:
      env:
        default: stg
        description: API environment
        enum:
          - stg
          - www
```

<br>

### pathsフィールド (必須)

APIのエンドポイント、HTTPメソッド、ステータスコード、などを定義する。

```yaml
paths:
  #===========================
  # pathsオブジェクト
  #===========================
  /users:
    #===========================
    # path itemオブジェクト
    #===========================
    get: # GETメソッドを設定する。
      tags:
        - ユーザー情報取得エンドポイント
      summary: ユーザー情報取得
      description: 全ユーザー情報を取得する。
      #===========================
      # リクエスト
      #===========================
      parameters: []
      #===========================
      # レスポンス
      #===========================
      responses:
        "200":
          description: OK レスポンス
          content:
            application/json: # MIME type
              foo: # レスポンスボディ例
                Users:
                  User:
                    userId: 1
                    name: Hiroki
              schema:
                $ref: "#/components/schemas/user" # Userモデルを参照する。
        "400":
          description: Bad Request レスポンス
          content:
            application/json: # MIME type
              foo: # レスポンスボディ例
                status: 400
                title: Bad Request
                errors:
                messages: ["不正なリクエストです。"]
              schema:
                $ref: "#/components/schemas/error" # 異常系モデルを参照する。
        "401":
          $ref: "#/components/responses/unauthorized" # 認証エラーを参照する。
    #===========================
    # path itemオブジェクト
    #===========================
    post: # POSTメソッドを設定する。
      tags:
        - ユーザー情報作成エンドポイント
      summary: ユーザー情報作成
      description: ユーザー情報を作成する。
      #===========================
      # リクエスト
      #===========================
      parameters: []
      requestBody: # メッセージボディにパラメーターを割り当てる。
        description: ユーザーID
        content:
          application/json: # MIME type
            foo: # メッセージボディ例
              userId: 1
            schema: # スキーマ
              $ref: "#/components/schemas/user" # Userモデルを参照する。
      #===========================
      # レスポンス
      #===========================
      responses:
        "200":
          description: OK レスポンス
          content:
            application/json: # MIME type
              foo: # レスポンスボディ例
                userId: 1
              schema:
                $ref: "#/components/schemas/normal" # スキーマとして、正常系モデルを参照する。
        "400":
          description: Bad Request レスポンス
          content:
            application/json: # MIME type
              foo: # レスポンスボディ例
                status: 400
                title: Bad Request
                errors:
                  messages: ["ユーザーIDは必ず指定してください。"]
              schema:
                $ref: "#/components/schemas/error" # スキーマとして、異常系モデルを参照する。
        "401":
          $ref: "#/components/responses/unauthorized" # 認証エラーを参照する。
  #===========================
  # pathsオブジェクト
  #===========================
  /users/{userId}:
    #===========================
    # path itemオブジェクト
    #===========================
    get:
      tags:
        - ユーザー情報取得エンドポイント
      summary: 指定ユーザー情報取得
      description: 指定したユーザー情報を取得する。
      #===========================
      # リクエスト
      #===========================
      parameters:
        - in: path # パスにパラメーターを割り当てる。
          name: userId
          required: "true"
          description: ユーザーID
          schema:
            type: string
            foo: # パスパラメーター例
              userId=1
      #===========================
      # レスポンス
      #===========================
      responses:
        "200":
          description: OK レスポンス
          content:
            application/json: # MIME type
              foo: # ボディ例
                userId: 1
                name: Hiroki
              schema: # スキーマ
                $ref: "#/components/schemas/user" # Userモデルを参照する。
        "400":
          description: Bad Request レスポンス
          content:
            application/json: # MIME type
              foo: # ボディ例
                status: 400
                title: Bad Request
                errors:
                  messages: ["ユーザーIDは必ず指定してください。"]
              schema:
                $ref: "#/components/schemas/error" # 異常系モデルを参照する。
        "401":
          $ref: "#/components/responses/unauthorized" # 認証エラーを参照する。
        "404":
          description: Not Found レスポンス
          content:
            application/json: # MIME type
              foo: # ボディ例
                status: 404
                title: Not Found
                errors:
                  messages: ["対象のユーザーが見つかりませんでした。"]
              schema:
                $ref: "#/components/schemas/error" # 異常系モデルを参照する。
    #===========================
    # path itemオブジェクト
    #===========================
    put:
      tags:
        - ユーザー情報更新エンドポイント
      summary: 指定ユーザー更新
      description: 指定したユーザー情報を更新する。
      #===========================
      # リクエスト
      #===========================
      parameters:
        - in: path # パスにパラメーターを割り当てる。
          name: userId
          required: "true"
          description: ユーザーID
          schema:
            type: string
            foo: # パスパラメーター例
              userId=1
      #===========================
      # レスポンス
      #===========================
      responses:
        "200":
          description: OK レスポンス
          content:
            application/json: # Content-Type
              foo: # ボディ例
                userId: 1
                name: Hiroki
              schema: # スキーマ
                $ref: "#/components/schemas/user" # Userモデルを参照する。
        "400":
          description: Bad Request レスポンス
          content:
            application/json: # Content-Type
              foo: # ボディ例
                status: 400
                title: Bad Request
                errors:
                  messages: ["ユーザーIDは必ず指定してください。"]
              schema:
                $ref: "#/components/schemas/error" # 異常系モデルを参照する。
        "401":
          $ref: "#/components/responses/unauthorized" # 認証エラーを参照する。
        "404":
          description: Not Found レスポンス
          content:
            application/json: # Content-Type
              foo: # ボディ例
                status: 404
                title: Not Found
                errors:
                  messages: ["対象のユーザーが見つかりませんでした。"]
              schema:
                $ref: "#/components/schemas/error" # 異常系モデルを参照する。
```

<br>

### componentsフィールド (必須)

スキーマなど、他の項目で共通して利用するものを定義する。

```yaml
components:
  #===========================
  # callbackキーの共通化
  #===========================
  callbacks: {}
  #===========================
  # linkキーの共通化
  #===========================
  links: {}
  #===========================
  # responseキーの共通化
  #===========================
  responses:
    unauthorized:
      description: Unauthorized レスポンス
      content:
        application/json: # MIME type
          foo: # ボディ例
            status: 401
            title: Unauthorized
            errors:
              messages: ["APIキーの認可に失敗しました。"]
          schema:
            $ref: "#/components/schemas/error" # 異常系モデルを参照する。
  #===========================
  # schemaキーの共通化
  #===========================
  schemas:
    # ユーザー
    user:
      type: object
      properties:
        userId:
          type: string
        name:
          type: string
    # 正常系
    normal:
      type: object
      properties:
        userId:
          type: string
    # 異常系
    error:
      type: object
      properties:
        messages:
          type: array
          items:
            type: string
  #===========================
  # securityフィールドの共通化
  #===========================
  securitySchemes:
    # Basic認証
    basicAuth:
      description: Basic認証
      type: http
      scheme: basic
    # Bearer認証
    bearerAuth:
      description: Bearer認証
      type: http
      scheme: bearer
    # APIキー認証
    apiKeyAuth:
      description: APIキー認証
      type: apiKey
      name: x-api-key # ヘッダ名は『x-api-key』とする。小文字が推奨である。
      in: header
```

<br>

### securityフィールド

componentsフィールドで定義した認証方法を宣言する。

ルートで宣言すると、全てのパスに適用できる。

**＊実装例＊**

```yaml
security:
  - apiKeyAuth: []
```

<br>

### tagsフィールド

各項目に付けるタグを定義する。

同名のタグをつけると、自動的にまとめられる。

**＊実装例＊**

```yaml
tags:
  - name: ユーザー情報取得エンドポイント
    description: |
```

<br>

### externalDocsフィールド

APIを説明するドキュメントのリンクを定義する。

**＊実装例＊**

```yaml
externalDocs:
  description: 補足情報はこちら
  url: https://foo.com
```

<br>

## 03. スキーマ

### スキーマとは

RESTful-APIが受信するCRUDのデータ型や必須データを定義したもの。受信したデータのバリデーションに使用する。

<br>

### スキーマによるバリデーション

データ型や必須データにより、リクエスト/レスポンスのデータのバリデーションを実行する。

**＊実装例＊**

例えば、APIがレスポンス時に以下のようなJSON型データを返信する例を考える。

```yaml
{
  "id": 1,
  "name": "Taro Yamada",
  "age": 10,
  "sports": ["soccer", "baseball"],
  "subjects": "math",
}
```

ここで、スキーマを以下の様に定義しておき、APIからデータをレスポンスする時のバリデーションを実行する。

```yaml
{
  "$schema": "https://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties":
    {
      "id": {"type": "integer", "minimum": 1},
      "name": {"type": "string"},
      "age": {"type": "integer", "minimum": 0},
      "sports": {"type": "array", "items": {"type": "string"}},
      "subjects": {"type": "string"},
    },
  "required": ["id"],
}
```

> - https://spec.openapis.org/oas/v3.1.0#data-types

<br>
