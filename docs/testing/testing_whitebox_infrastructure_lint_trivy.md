---
title: 【IT技術の知見】 trivy＠脆弱性テスト
description: trivy＠脆弱性テストの知見を記録しています。
---

# trivy＠脆弱性テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. trivyの仕組み

### 検出項目

IaC (Kubernetes、Terraform、Dockerfile) や イメージ (コンテナイメージ、マシンイメージ) で報告されたCVEに基づいて、ファイルの実装方法に起因する脆弱性を検証する。

Regoでカスタムポリシーを実装できる。

<br>

## 02. セットアップ

### インストール

#### ▼ バイナリとして

```bash
$ brew install trivy
```

#### ▼ コンテナとして

```bash
$ docker run aquasec/trivy
```

#### ▼ チャートとして

trivy-operatorをインストールする。

```bash
$ helm repo add <チャートリポジトリ名> https://aquasecurity.github.io/helm-charts/

$ helm repo update

$ kubectl create namespace trivy

$ helm install <Helmリリース名> <チャートリポジトリ名>/trivy-operator -n trivy
```

> - https://aquasecurity.github.io/trivy-operator/v0.15.1/getting-started/installation/helm/

<br>

## 03. 設定ファイル

### `.trivyignore`ファイル

検証したくないCVEの項目を設定する。

```bash
$ cat .trivyignore.yaml

vulnerabilities:
  - id: CVE-2022-40897
...
```

> - https://aquasecurity.github.io/trivy/v0.45/docs/configuration/filtering/#trivyignoreyaml

<br>

## 04. trivyコマンド

### config

#### ▼ configとは

> - https://aquasecurity.github.io/trivy/v0.45/docs/scanner/misconfiguration/
> - https://aquasecurity.github.io/trivy/v0.45/docs/references/configuration/cli/trivy_config/

#### ▼ --debug

デバッグモードを有効化する。

```bash
$ trivy config --debug <IaCファイル>

2023-08-02T04:52:32.908Z	DEBUG	Severities: ["HIGH" "CRITICAL"]
2023-08-02T04:52:32.912Z	DEBUG	cache dir:  /root/.cache/trivy
2023-08-02T04:52:32.912Z	INFO	Misconfiguration scanning is enabled
2023-08-02T04:52:32.912Z	DEBUG	Failed to open the policy metadata: open /root/.cache/trivy/policy/metadata.json: no such file or directory
2023-08-02T04:52:32.912Z	INFO	Need to update the built-in policies
2023-08-02T04:52:32.912Z	INFO	Downloading the built-in policies...
2023-08-02T04:52:32.912Z	DEBUG	Using URL: ghcr.io/aquasecurity/defsec:0 to load policy bundle
41.66 KiB / 41.66 KiB [-----------------------------------------------------------] 100.00% ? p/s 0s2023-08-02T04:52:33.743Z	DEBUG	Digest of the built-in policies: sha256:*****
2023-08-02T04:52:33.743Z	DEBUG	Policies successfully loaded from disk
2023-08-02T04:52:33.776Z	DEBUG	Walk the file tree rooted at '<IaCファイル>' in parallel
2023-08-02T04:52:33.776Z	DEBUG	Scanning Kubernetes files for misconfigurations...
2023-08-02T04:52:36.173Z	DEBUG	Scanning Helm files for misconfigurations...
2023-08-02T04:52:36.192Z	DEBUG	OS is not detected.
2023-08-02T04:52:36.192Z	INFO	Detected config files: 1
2023-08-02T04:52:36.192Z	DEBUG	Scanned config file: <IaCファイル>
```

> - https://aquasecurity.github.io/trivy/v0.45/docs/scanner/misconfiguration/

#### ▼ --exit-code

脆弱性が検出された時の終了コードを設定する。

デフォルトでは、いずれの結果でも終了コードが`0`になる。

```bash
$ trivy config --exit-code 1 <IaCファイル>
```

マニフェスト管理ツール (Helm、Kustomize) の作成したマニフェストファイルを渡しても良い。

```bash
$ helm template foo-chart. --set secret.PASSWORD=test -f foo-values.yaml > manifest.yaml

$ trivy config --exit-code 1 manifest.yaml
```

> - https://aquasecurity.github.io/trivy/v0.45/docs/configuration/others/#exit-code

#### ▼ --include-non-failures

もし解析結果に何も問題がなければ、成功したことを表示できるようにする。

デフォルトであると、成功が表示されない。

```bash
$ trivy config --include-non-failures <IaCファイル>
```

> - https://aquasecurity.github.io/trivy/v0.45/docs/references/configuration/cli/trivy_config/

#### ▼ --quiet

処理中のプログレスバー処理ログの両方を非表示にする。

```bash
# 非表示の場合
$ trivy config --quiet <IaCファイル>

# 表示する場合
$ trivy config <IaCファイル>

2023-08-02T04:50:04.261Z	INFO	Misconfiguration scanning is enabled
2023-08-02T04:50:04.261Z	INFO	Need to update the built-in policies
2023-08-02T04:50:04.261Z	INFO	Downloading the built-in policies...
41.66 KiB / 41.66 KiB [-----------------------------------------------------------] 100.00% ? p/s 0s
2023-08-02T04:50:08.303Z	INFO	Detected config files: 1
```

> - https://aquasecurity.github.io/trivy/v0.45/docs/scanner/misconfiguration/

#### ▼ --severity

検出する下限の重要度レベル (UNKNOWN、LOW、MEDIUM、HIGH、CRITICAL) を設定する。

```bash
$ trivy config --severity HIGH,CRITICAL <IaCファイル>
```

> - https://aquasecurity.github.io/trivy/v0.45/docs/configuration/filtering/#by-severity
> - https://csblog.casareal.co.jp/archives/382

<br>
