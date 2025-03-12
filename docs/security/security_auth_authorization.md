---
title: 【IT技術の知見】認可＠認証／認可
description: 認可＠認証／認可の知見を記録しています。
---

# 認可＠認証／認可

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 認可とは

認証済みのユーザーのリクエストに応じてリソースの操作を試み、権限範囲 (認可スコープ) に基づいてこれを許否します。

基本的に、認可の実装は認証に依存する。

![authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/authorization.png)

> - https://www.osohq.com/academy/what-is-authorization
> - https://dev.classmethod.jp/articles/authentication-and-authorization/#toc-2

<br>

## 02. アプリケーションで実装する

アプリケーションで、認可処理を実装する。

クリーンアーキテクチャであれば、ドメインサービスやアプリケーションサービスである。

<br>

## 03. 委譲する

認可処理を実行してくれるツール (例：OpenPolicyAgentなど) に委譲する。

<br>
