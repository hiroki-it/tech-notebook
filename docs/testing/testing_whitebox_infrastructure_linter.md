---
title: 【IT技術の知見】静的解析ツール＠インフラのホワイトボックステスト
description: 静的解析ツール＠インフラのホワイトボックステストの知見を記録しています。
---

# 静的解析ツール＠インフラのホワイトボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 文法の誤りテスト

各Kubernetesリソースのスキーマを使用して、マニフェストの文法の誤りを検出する。

- kubeconform

<br>

## 02. ベストプラクティス違反テスト

- poralis

<br>

## 03. 非推奨apiVersionテスト

- pluto

<br>

## 04. 脆弱性テスト

指定したKubernetesバージョンから、マニフェストの非推奨なapiVersionを検出する。


- checkov
- kics
- kube-score
- trivy

<br>
