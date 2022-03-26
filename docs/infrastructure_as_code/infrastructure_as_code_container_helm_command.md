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

### install

#### ・オプション無し

チャートアーカイブを指定し，Kubernetesリソースとしてデプロイする．

参考：https://helm.sh/docs/helm/helm_install/

```bash
$ helm install <リリース名> <チャートアーカイブへのパス>
```

#### ・--dry-run

Kubernetesにデプロイされるリソースのマニフェストファイルを表示する．デプロイする前に，チャートの設定が正しいかどうかを確認できる．

```bash
$ helm install --dry-run <リリース名> <チャートアーカイブへのパス>

# Source: prd/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment

# 〜 中略 〜
```

#### ・-f

指定した```values```ファイル用いて，```helm install```コマンドを実行する．

参考：https://helm.sh/docs/helm/helm_install/#options

```bash
$ helm install -f <valuesファイルへのパス> <リリース名> <チャートアーカイブへのパス>
```

<br>

### package

チャートからチャートアーカイブを作成する．

参考：https://helm.sh/docs/helm/helm_package/

```
$ helm package <チャートへのパス> 
```

<br>

### uninstall

指定したリリースによってデプロイされたKubernetesリソースを削除する．

参考：https://helm.sh/docs/helm/helm_uninstall/

```bash
$ helm uninstall <リリース名>
```

