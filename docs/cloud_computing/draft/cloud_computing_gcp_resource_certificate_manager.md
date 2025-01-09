---
title: 【IT技術の知見】Certificate Manager＠Google Cloudリソース
description: Certificate Manager＠Google Cloudリソースの知見を記録しています。
---

# Certificate Manager＠Google Cloudリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Certificate Manager

### セットアップ

#### ▼ SSL証明書

#### ▼ クライアント証明書

AWS Certificate Managerでクライアント証明書を作成する場合、AWSが署名する認証局 (プライベート認証局) を作成する必要がある。

オレオレのクライアント証明書と同じ手順が必要になる。

> - https://qiita.com/unitia0323/items/76882184c7359854ade8

<br>

### SSL証明書の設置場所

#### ▼ 認証局

| サーバー提供者 | 名前                             |
| -------------- | -------------------------------- |
| 中間認証局     | GTS：Google Cloud Trust Services |
| ルート認証局   | 記入中...                        |

<br>
