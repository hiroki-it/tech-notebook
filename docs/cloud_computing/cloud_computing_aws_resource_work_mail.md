---
title: 【IT技術の知見】WorkMail
description: WorkMailの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# WorkMail

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


Gmail、サンダーバード、Yahoo メールなどと同類のメール管理アプリケーション。

<br>

## 02. 仕組み

## 03. セットアップ

### Terraformによる構築

```terraform
# 記入中...
```

## 04. メール組織の設定

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Users</td>
      <td>WorkMail で管理するユーザーを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>Domains</td>
      <td>ユーザーに割り当てるメールアドレスのドメイン名を設定する。</td>
      <td><code>@{組織名}.awsapps.com</code> をドメイン名としてもらえる。ドメイン名の検証が完了した独自ドメイン名を設定もできる。</td>
    </tr>
    <tr>
      <td>Access Control rules</td>
      <td>受信するメール、受信を遮断するメールの条件を設定する。</td>
      <td></td>
    </tr>
  </tbody>
</table>

<br>
