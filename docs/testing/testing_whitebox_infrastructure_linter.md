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

Kubernetesリソースのスキーマに基づいて、マニフェストの文法の誤りを検証する。

- kubeconform

<br>

## 02. ベストプラクティス違反テスト

- poralis

<br>

## 03. 非推奨apiVersionテスト

指定したKubernetesのバージョンに基づいて、マニフェストの非推奨apiVersionを検証する。

- pluto

<br>

## 04. 脆弱性テスト

報告されている脆弱性レポートに基づいて、マニフェストの実装方法に起因する脆弱性を検証する。

- checkov
- kics
- kube-score
- trivy

<br>
