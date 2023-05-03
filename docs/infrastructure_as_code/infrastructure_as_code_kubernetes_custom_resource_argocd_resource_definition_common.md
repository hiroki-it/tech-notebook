---
title: 【IT技術の知見】共通部分＠リソース定義
description: 共通部分＠リソース定義の知見を記録しています。
---

# 共通部分＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01.  ArgoCDの`.metadata.labels`キー

### ArgoCDの`.metadata.labels`キーとは

ArgoCDを使用している場合に、ArgoCDの情報をを設定する。

custom-controller (application-controller) が設定してくれるため、開発者が設定する必要はない。

<br>

### 種類

| キー                          | 値の例            | 説明                                                                                                                                                            |
| ----------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `argocd.argoproj.io/instance` | `foo-application` | ArgoCDのApplication名を設定する。もしKubernetesリソースに設定すれば親Applicationが自動的に紐付き、Applicationに設定さればApp-of-Appsでの親Applicationが紐づく。 |

<br>
