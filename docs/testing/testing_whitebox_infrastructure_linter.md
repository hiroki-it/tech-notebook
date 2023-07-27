---
title: 【IT技術の知見】静的解析ツール＠インフラのホワイトボックステスト
description: 静的解析ツール＠インフラのホワイトボックステストの知見を記録しています。
---

# 静的解析ツール＠インフラのホワイトボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. IaCのソースコードの静的解析

### マニフェスト

#### ▼ マニフェストの静的解析

プロビジョニング前のIaCのソースコードを解析する。

#### ▼ 文法の誤りテスト

- kubeconform (新kubeval)

> - https://kubevious.io/blog/post/top-kubernetes-yaml-validation-tools

### ▼ 実装ポリシー違反テスト

- confest

### ▼ ベストプラクティス違反テスト

ベストプラクティスを幅広く検証するため、他のテスト (例：脆弱性テスト) と検査項目が重複する場合がある。

- kube-linter
- kube-score
- kubevious
- polaris
- tflint

> - https://kubevious.io/blog/post/top-kubernetes-yaml-validation-tools
> - https://github.com/kubevious/cli#-key-capabilities
> - https://tech.andpad.co.jp/entry/2022/08/30/100000
> - https://zenn.dev/tayusa/articles/9829faf765ab67#%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E7%B6%B2%E7%BE%85%E5%BA%A6

### ▼ バージョンテスト

- pluto

### ▼ 脆弱性テスト

- checkov
- kics
- krane
- kubeaudit
- kube-bench
- kube-hunter
- kube-scan
- kube-score
- kubesec
- tfsec
- trivy

> - https://kubevious.io/blog/post/top-kubernetes-security-vulnerability-scanners
> - https://kubevious.io/blog/post/top-kubernetes-yaml-validation-tools
> - https://zenn.dev/tayusa/articles/9829faf765ab67#%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E7%B6%B2%E7%BE%85%E5%BA%A6

<br>

### Helmチャート

#### ▼ Helmチャートの静的解析

マニフェストになる前のHelmチャートを解析する。

#### ▼ ベストプラクティス

- goldilocks (IaCのソースコード上のCPU/メモリの設定値と、Cluster上の実際のハードウェアリソース消費量を比較する)
- nova (Helmのチャートリポジトリ上のチャートバージョンと、Cluster上の実際のバージョンを比較する)

<br>

## 02. コンテナの静的解析

### コンテナイメージ

#### ▼ コンテナイメージの静的解析とは

コンテナのイメージレイヤーごとに解析する。

#### ▼ 脆弱性テスト

- trivy

> - https://snyk.io/learn/container-security/container-scanning/
> - https://thinkit.co.jp/article/17525

<br>

### コンテナ

#### ▼ コンテナの静的解析

稼働中のコンテナを解析する。

#### ▼ 脆弱性テスト

起動中のコンテナを解析する。

<br>
