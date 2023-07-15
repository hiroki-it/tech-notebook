---
title: 【IT技術の知見】Kyverno＠CNCFプロジェクト
description: Kyverno＠CNCFプロジェクトの知見を記録しています。
---

# Kyverno＠CNCFプロジェクト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kyvernoの仕組み

![kyverno_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kyverno_architecture.png)

Kyvernoは、admission-controllersアドオン、webhookサーバー、Controller、などのコンポーネトから構成されている。

文法の誤りテストを実施する静的解析ツール (例：Kubeconform) とは異なり、kube-apiserverにマニフェストが送信された後に静的解析を実行する。

kube-apiserverのmutating-admissionステップとvalidating-admissionステップでKyvernoのwebhookサーバーにWebhookが送信される。

送信されたマニフェストの宣言が事前に設定されたルールに則っているかを検証し、もし則っていなければマニフェストの宣言を変更する。

> ↪️：
>
> - https://www.squadcast.com/blog/kyverno-policy-management-in-kubernetes
> - https://www.kreyman.de/index.php/others/linux-kubernetes/244-erhoehung-der-container-security-mit-kyverno

<br>
