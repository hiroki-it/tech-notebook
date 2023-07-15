---
title: 【IT技術の知見】静的解析ツール＠インフラのホワイトボックステスト
description: 静的解析ツール＠インフラのホワイトボックステストの知見を記録しています。
---

# 静的解析ツール＠インフラのホワイトボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 文法の誤りテスト

- kubeconform

<br>

## 02. ベストプラクティス違反テスト

- kube-score
- poralis
- tflint

> - https://tech.andpad.co.jp/entry/2022/08/30/100000
> - https://zenn.dev/tayusa/articles/9829faf765ab67#%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E7%B6%B2%E7%BE%85%E5%BA%A6

<br>

## 03. 非推奨テスト

### KubernetesのapiVersion

- pluto

<br>

## 04. 脆弱性テスト

- checkov
- kics
- trivy
- tfsec

> - https://zenn.dev/tayusa/articles/9829faf765ab67#%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E7%B6%B2%E7%BE%85%E5%BA%A6

<br>
