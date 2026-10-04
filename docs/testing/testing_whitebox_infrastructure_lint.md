---
title: 【IT技術の知見】静的解析＠インフラのホワイトボックステスト
description: 静的解析＠インフラのホワイトボックステストの知見を記録しています。
---

# 静的解析＠インフラのホワイトボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. YAML/JSON の静的解析

### YAML

#### ▼ 文法違反テスト

- yamllint

> - [GitHub - sbaudoin/yamllint: YAML Linter written in Java · GitHub](https://github.com/sbaudoin/yamllint)

なお、YAML の静的解析ツールで Helm チャートを検証したい場合、`Chart.yaml` ファイルや `values` ファイルは `yaml` ファイルなので検証できるが、Helm テンプレートを検証できない。

> - [Support for common YAML templates (specifically Helm) · Issue #16 · sbaudoin/yamllint · GitHub](https://github.com/sbaudoin/yamllint/issues/16)
> - [chart-testing/pkg/chart/chart.go at v3.9.0 · helm/chart-testing · GitHub](https://github.com/helm/chart-testing/blob/v3.9.0/pkg/chart/chart.go#L474-L482)

<br>

### JSON

#### ▼ 文法違反テスト

- jsonlint

> - [GitHub - zaach/jsonlint: A JSON parser and validator with a CLI. · GitHub](https://github.com/zaach/jsonlint)

<br>

## 02. IaC のソースコードの静的解析

### マニフェスト

#### ▼ マニフェストの静的解析

プロビジョニング前の IaC のソースコードを解析する。

#### ▼ 文法違反テスト

Kubernetes リソースのスキーマ (カスタムリソースであれば CRD) に基づいて、マニフェストの文法違反を検出する。

- kubeconform (新 kubeval)

> - [Top Kubernetes YAML Validation Tools \| Kubevious.io](https://kubevious.io/blog/post/top-kubernetes-yaml-validation-tools)

#### ▼ コード規約違反テスト

ユーザー定義のコード規約に基づいて、マニフェストのコード規約違反を検証する。

- confest

#### ▼ ベストプラクティス違反テスト

一般に知られているベストプラクティス項目に基づいて、マニフェストのベストプラクティス違反を検証する。

脆弱性、効率性、信頼性のいずれかの観点で検査するツールが多い。

- kube-linter
- kube-score
- kubevious
- krr (効率性)
- goldilocks (効率性)
- polaris

> - [Top Kubernetes YAML Validation Tools \| Kubevious.io](https://kubevious.io/blog/post/top-kubernetes-yaml-validation-tools)
> - [GitHub - kubevious/cli: Kubevious CLI - Prevent Kubernetes disasters at the early stages · GitHub](https://github.com/kubevious/cli#-key-capabilities)
> - [Kubernetesのmanifestを検証しよう - ANDPAD Tech Blog](https://tech.andpad.co.jp/entry/2022/08/30/100000)
> - [Terraform 静的検査ツール比較](https://zenn.dev/tayusa/articles/9829faf765ab67#%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E7%B6%B2%E7%BE%85%E5%BA%A6)
> - [Robusta · GitHub](https://github.com/robusta-dev)

#### ▼ バージョンテスト

指定した Kubernetes のバージョンに基づいて、マニフェストのバージョン (`apiVersion` キー) を検証する。

`helm install` コマンドにも、マニフェストの `apiVersion` キーが非推奨かどうかを検証する。

- pluto
- kubeplug
- kubent (kube-no-trouble)
- `helm install` コマンド

> - [Deprecated Kubernetes APIs \| Helm](https://helm.sh/docs/topics/kubernetes_apis/)

<br>

#### ▼ 脆弱性診断

報告された CVE に基づいて、マニフェストの実装方法に起因する脆弱性を検証する。

- checkov
- kics
- krane
- kubeaudit
- kube-bench
- kube-hunter
- kube-scan
- kube-score
- kubesec
- trivy

> - [Top Kubernetes Security Vulnerability Scanners \| Kubevious.io](https://kubevious.io/blog/post/top-kubernetes-security-vulnerability-scanners)
> - [Top Kubernetes YAML Validation Tools \| Kubevious.io](https://kubevious.io/blog/post/top-kubernetes-yaml-validation-tools)
> - [Terraform 静的検査ツール比較](https://zenn.dev/tayusa/articles/9829faf765ab67#%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E7%B6%B2%E7%BE%85%E5%BA%A6)

<br>

### Terraform

#### ▼ 文法違反テスト

- `terraform validate` コマンド

#### ▼ 脆弱性診断

- tfsec
- trivy

#### ▼ ベストプラクティス違反テスト

- tflint

#### ▼ 未 IaC 化テスト

- driftctl

<br>

### Helm チャート

#### ▼ Helm チャートの静的解析

マニフェストになる前の Helm チャートを解析する。

#### ▼ 構造の誤りテスト

チャートの公式ルールに基づいて、構造の誤りを検出する。

- `helm lint` コマンド

#### ▼ バージョンテスト

Helm チャートのバージョンを検証する。

- nova

<br>

## 03. コンテナの静的解析

### コンテナイメージ

#### ▼ コンテナイメージの静的解析とは

コンテナのイメージレイヤーごとに解析する。

#### ▼ ベストプラクティス違反テスト

- hadolint

#### ▼ 脆弱性診断

- dockle
- trivy

> - https://snyk.io/learn/container-security/container-scanning/
> - [コンテナの静的・動的スキャン \| コンテナをセキュアに運用するために考えること \| Think IT（シンクイット）](https://thinkit.co.jp/article/17525)

<br>

### コンテナ

#### ▼ コンテナの静的解析

稼働中のコンテナを解析する。

#### ▼ 脆弱性診断

起動中のコンテナを解析する。

- trivy

<br>
