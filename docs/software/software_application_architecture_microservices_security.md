---
title: 【IT技術の知見】セキュリティ＠マイクロサービスアーキテクチャ
description: セキュリティ＠マイクロサービスアーキテクチャの知見を記録しています。
---

# セキュリティ＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 通信の認証/認可

### 相互TLS認証

記入中...

<br>

### JWTによるBearer認証

#### ▼ サイドカーサービスメッシュ

サイドカーサービスメッシュを使用し、JWTパターンを実装する。

サイドカーはリクエストからJWTを取得し、通信の認証/認可を実施する。

送信元のマイクロサービスを認証し、認証されていないマイクロサービスであればリクエストを拒否する。

また、送信元のマイクロサービスの認可スコープを検証し、もしマイクロサービスの認可スコープが不十分であれば、リクエストを拒否する。

![micro-authentication_type_jwt_service-mesh](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/micro-authentication_type_jwt_service-mesh.png)

> - https://thinkit.co.jp/article/22484
> - https://developer.mamezou-tech.com/blogs/2022/07/01/openapi-generator-5/

<br>

## 02. パケットペイロードの暗号化

記入中...

<br>

## 03. 保管データの暗号化

記入中...

<br>
