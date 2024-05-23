---
title: 【IT技術の知見】Keycloak＠CNCF
description: Keycloak＠CNCFの知見を記録しています。
---

# Keycloak＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Keycloakとは

アプリケーションに代わって、認証認可処理を実行する。

認証認可に関するAPIを公開し、認証時のアカウントのCRUDや、認可時のアカウントに対する権限スコープ付与、を実行できる。

> - https://www.keycloak.org/docs-api/22.0.1/rest-api/index.html
> - https://blog.linkode.co.jp/entry/2023/08/23/000000

<br>

## 01-02. 仕組み

### アーキテクチャ

Keycloakは、認証処理サービス、Infinispan、アカウント管理用のRDBMS、といったコンポーネントから構成されている。

![keycloak_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/keycloak_architecture.png)

> - https://blog.palark.com/ha-keycloak-infinispan-kubernetes/

<br>

## Infinispan

キャッシュを保管する。

<br>

## RDBMS

アカウント情報を保管する。

<br>
