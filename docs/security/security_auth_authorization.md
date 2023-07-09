---
title: 【IT技術の知見】認可＠認証/認可
description: 認可＠認証/認可の知見を記録しています。
---

# 認可＠認証/認可

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 認可とは

認証済みのユーザーに対して、アクセス可能な権限範囲 (認可スコープ) を付与する。

基本的に、認可の実装は認証に依存する。

> - https://dev.classmethod.jp/articles/authentication-and-authorization/#toc-2

<br>

## 02. アプリケーションで実装する

アプリケーションで、認可処理を実装する。

クリーンアーキテクチャであれば、ドメインサービスやアプリケーションサービスである。

> - https://hiroki-it.github.io/tech-notebook/software/software_application_architecture_backend_domain_driven_design_clean_architecture.html

<br>

## 03. 委譲する

認可処理を実施してくれるツール (例：OpenPolicyAgent、など) に委譲する。

<br>
