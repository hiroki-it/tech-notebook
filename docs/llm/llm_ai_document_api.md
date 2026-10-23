---
title: 【IT技術の知見】API定義書＠AI用ドキュメント
description: API定義書＠AI用ドキュメントの知見を記録しています。
---

# API 定義書＠AI 用ドキュメント

このドキュメントは、API のバックエンドロジックを実装するためのドキュメントであり、生成 AI に読み込ませることを想定している。

## API 概要

〇〇における API。

▲ からのリクエストに対し、レスポンスを返却する。

## エンドポイント

- ドメイン: `example.com`
- パス: `/api/v1/foo`
- メソッド: POST
- Content-Type: application/json

## リクエスト仕様

### JSON 例

ここでは、データ型名を値の例としている。

```json
{
  "user": {
    "userId": "string",
    "name": "string"
  }
}
```

### パラメータ定義

<table>
  <thead>
    <tr>
      <th>パラメータ名</th>
      <th>必須/任意</th>
      <th>Type</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>user</code></td>
      <td>必須</td>
      <td>Object</td>
      <td>ユーザ情報</td>
    </tr>
    <tr>
      <td>└ <code>userId</code></td>
      <td>必須</td>
      <td>String</td>
      <td>ユーザーID</td>
    </tr>
    <tr>
      <td>└ <code>name</code></td>
      <td>必須</td>
      <td>String</td>
      <td>ユーザー名</td>
    </tr>
  </tbody>
</table>

## レスポンス仕様

### JSON 例

ここでは、データ型名を値の例としている。

```json
{
  "code": "string",
  "user": {
    "userId": "string",
    "name": "string"
  }
}
```

### パラメータ定義

<table>
  <thead>
    <tr>
      <th>パラメータ名</th>
      <th>必須/任意</th>
      <th>Type</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>code</code></td>
      <td>必須</td>
      <td>String</td>
      <td>処理コード</td>
    </tr>
    <tr>
      <td><code>user</code></td>
      <td>必須</td>
      <td>Object</td>
      <td>ユーザ情報</td>
    </tr>
    <tr>
      <td>└ <code>userId</code></td>
      <td>必須</td>
      <td>String</td>
      <td>ユーザーID</td>
    </tr>
    <tr>
      <td>└ <code>name</code></td>
      <td>必須</td>
      <td>String</td>
      <td>ユーザー名</td>
    </tr>
  </tbody>
</table>

## 処理コード一覧

<table>
  <thead>
    <tr>
      <th>コード</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>00</code></td>
      <td>正常</td>
    </tr>
    <tr>
      <td><code>01</code></td>
      <td>処理中</td>
    </tr>
    <tr>
      <td><code>02</code></td>
      <td>処理失敗</td>
    </tr>
    <tr>
      <td><code>03</code></td>
      <td>処理なし</td>
    </tr>
    <tr>
      <td><code>99</code></td>
      <td>処理エラー</td>
    </tr>
  </tbody>
</table>
