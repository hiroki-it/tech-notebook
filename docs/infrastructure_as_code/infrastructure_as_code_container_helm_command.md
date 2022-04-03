---
title: 【知見を記録するサイト】コマンド＠Helm
description: コマンド＠Helmの知見をまとめました．
---

# コマンド＠Helm

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. helmコマンド

### create

指定したパスにチャートのサンプルファイルを作成する．

参考：https://helm.sh/docs/helm/helm_create/

```bash
$ helm create <チャートへのパス>
```

<br>

### history

指定したリリースの履歴を表示する．

参考：https://helm.sh/docs/helm/helm_history/

```bash
$ helm history <リリース名>

REVISION    UPDATED                   STATUS     CHART      APP VERSION   DESCRIPTION
<リリース名>  Wed Jan 01 12:00:00 2020  SUSPENDED  foo-1.0.0  1.0.0         Initial install
<リリース名>  Wed Jan 01 12:00:00 2020  SUSPENDED  foo-1.1.0  1.1.0         Rolled back to 1
<リリース名>  Wed Jan 01 12:00:00 2020  DEPLOYED   foo-1.0.1  1.1.1         Upgraded successfully
```

<br>

### install

#### ▼ オプション無し

チャートアーカイブを指定し，Kubernetesリソースとしてデプロイする．

参考：https://helm.sh/docs/helm/helm_install/

```bash
$ helm install <リリース名> <チャートアーカイブへのパス>
```

#### ▼ --dry-run

Kubernetesにデプロイされるリソースのマニフェストファイルを表示する．デプロイする前に，チャートの設定が正しいかどうかを確認できる．

```bash
$ helm install --dry-run <リリース名> <チャートアーカイブへのパス>

# Source: prd/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment

# 〜 中略 〜
```

#### ▼ -f

指定した```values```ファイル用いて，```helm install```コマンドを実行する．

参考：https://helm.sh/docs/helm/helm_install/#options

```bash
$ helm install -f <valuesファイルへのパス> <リリース名> <チャートアーカイブへのパス>
```

<br>

### lint

#### ▼ オプション無し

チャートのバリデーションを実行する．

参考：https://helm.sh/docs/helm/helm_lint/

```bash
$ helm lint <チャートへのパス>

==> Linting kubernetes
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

1 chart(s) linted, 0 chart(s) failed
```

#### ▼ -f

指定した```values```ファイル用いて，```helm lint```コマンドを実行する．

```bash
$ helm lint -f <valuesファイルへのパス> <チャートへのパス>

==> Linting kubernetes
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

1 chart(s) linted, 0 chart(s) failed
```

<br>

### list

Helmを用いてデプロイしたリソースの一覧を表示する．

参考：https://helm.sh/docs/helm/helm_list/

```bash
$ helm list

NAME         VERSION   UPDATED                   STATUS    CHART
<リリース名>   1         Wed Jan 01 12:00:00 2020  DEPLOYED  foo-chart-0.1.0
```

<br>

### package

チャートからチャートアーカイブを作成する．または，すでにアーカイブが存在する場合は更新する．アーカイブ名にはバージョンが設定される．

参考：https://helm.sh/docs/helm/helm_package/

```bash
$ helm package <チャートへのパス>

Successfully packaged chart and saved it to: /foo-1.0.0.tgz
```

<br>

### uninstall

指定したリリースによってデプロイされたKubernetesリソースを削除する．

参考：https://helm.sh/docs/helm/helm_uninstall/

```bash
$ helm uninstall <リリース名>
```

<br>

### upgrade

#### ▼ --install

新しいリビジョン番号を作成し，デプロイ済のリリースを更新する．

```bash
$ helm upgrade --install -f <valuesファイルへのパス> <リリース名> <チャートアーカイブへのパス>

Release "<リリース名>" has been upgraded. Happy Helming!
NAME: <リリース名>
LAST DEPLOYED: Sat Jan 1 12:00:00 2022
NAMESPACE: default
STATUS: deployed
REVISION: 3 # <---- リビジョン番号が増えていく
TEST SUITE: None
```

