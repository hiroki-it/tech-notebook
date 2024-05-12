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

認証認可処理を実行する。

<br>

## 01-02. 仕組み

### アーキテクチャ

Keycloakは、認証処理サービス、Infinispan、RDBMS、といったコンポーネントから構成されている。

![keycloak_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/keycloak_architecture.png)

> - https://blog.palark.com/ha-keycloak-infinispan-kubernetes/

<br>

## Infinispan

キャッシュを保管する。

<br>

## RDBMS

アカウント情報を保管する。

<br>
