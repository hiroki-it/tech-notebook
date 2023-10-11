---
title: 【IT技術の知見】静的解析＠インフラのホワイトボックステスト
description: 静的解析＠インフラのホワイトボックステストの知見を記録しています。
---

# 静的解析＠インフラのホワイトボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. YAML/JSONの静的解析

### YAML

#### ▼ 文法の誤りテスト

- yamllint

> - https://github.com/sbaudoin/yamllint

なお、YAMLの静的解析ツールでHelmチャートを検証したい場合、`Chart.yaml`ファイルや`values`ファイルは`.yaml`ファイルなので検証できるが、Helmテンプレートを検証できない。

> - https://github.com/sbaudoin/yamllint/issues/16
> - https://github.com/helm/chart-testing/blob/v3.9.0/pkg/chart/chart.go#L474-L482

<br>

### JSON

#### ▼ 文法の誤りテスト

- jsonlint

> - https://github.com/zaach/jsonlint

<br>

## 02. IaCのソースコードの静的解析

### マニフェスト

#### ▼ マニフェストの静的解析

プロビジョニング前のIaCのソースコードを解析する。

#### ▼ 文法の誤りテスト

Kubernetesリソースのスキーマ (カスタムリソースであればCRD) に基づいて、マニフェストの文法の誤りを検出する。

- kubeconform (新kubeval)

> - https://kubevious.io/blog/post/top-kubernetes-yaml-validation-tools

#### ▼ コード規約違反テスト

ユーザー定義のコード規約に基づいて、マニフェストのコード規約違反を検証する。

- confest

#### ▼ ベストプラクティス違反テスト

一般に知られているベストプラクティス項目に基づいて、マニフェストのベストプラクティス違反を検証する。

脆弱性、効率性、信頼性、のいずれかの観点で検査するツールが多い。

- kube-linter
- kube-score
- kubevious
- goldilocks
- polaris

> - https://kubevious.io/blog/post/top-kubernetes-yaml-validation-tools
> - https://github.com/kubevious/cli#-key-capabilities
> - https://tech.andpad.co.jp/entry/2022/08/30/100000
> - https://zenn.dev/tayusa/articles/9829faf765ab67#%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E7%B6%B2%E7%BE%85%E5%BA%A6

#### ▼ バージョンテスト

指定したKubernetesのバージョンに基づいて、マニフェストのバージョン (`apiVersion`キー) を検証する。

`helm install`コマンドにも、マニフェストの`apiVersion`キーが非推奨かどうかを検証する。

- pluto
- kubeplug
- kube-no-trouble
- `helm install`コマンド

> - https://helm.sh/docs/topics/kubernetes_apis/

<br>

#### ▼ 脆弱性診断

報告されたCVEに基づいて、マニフェストの実装方法に起因する脆弱性を検証する。

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

> - https://kubevious.io/blog/post/top-kubernetes-security-vulnerability-scanners
> - https://kubevious.io/blog/post/top-kubernetes-yaml-validation-tools
> - https://zenn.dev/tayusa/articles/9829faf765ab67#%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E7%B6%B2%E7%BE%85%E5%BA%A6

<br>

### Terraform

#### ▼ 文法の誤りテスト

- `terraform validate`コマンド

#### ▼ 脆弱性診断

- tfsec
- trivy

#### ▼ ベストプラクティス

- tflint

<br>

### Helmチャート

#### ▼ Helmチャートの静的解析

マニフェストになる前のHelmチャートを解析する。

#### ▼ 構造の誤りテスト

チャートの公式ルールに基づいて、構造の誤りを検出する。

- `helm lint`コマンド

#### ▼ バージョンテスト

Helmチャートのバージョンを検証する。

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
> - https://thinkit.co.jp/article/17525

<br>

### コンテナ

#### ▼ コンテナの静的解析

稼働中のコンテナを解析する。

#### ▼ 脆弱性診断

起動中のコンテナを解析する。

- trivy

<br>
