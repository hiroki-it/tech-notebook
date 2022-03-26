---
title: 【知見を記録するサイト】チャート＠Helm
description: チャート＠Helmの知見をまとめました．
---

# チャート＠Helm

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Helmの仕組み

### 構造

![helm_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/helm_architecture.png)

Helmは，パッケージマネージャーとしてのHelmクライアント，パッケージとしてのチャートアーカイブ（```.tgz```形式），チャートアーカイブの元になるチャート，チャートアーカイブのリポジトリとしてのチャートリポジトリから構成される．Helmクライアントは，リポジトリからインストールしたチャートアーカイブに基づいてkube-apiserverをコールし，Kubernetes上にKubernetesリソースをデプロイする．

参考：

- https://cloudacademy.com/course/introduction-to-helm-1034/helm-architecture/
- https://helm.sh/ja/docs/glossary/
- https://deeeet.com/writing/2018/01/10/kubernetes-yaml/

<br>

## 02. セットアップ

### インストール

#### ・Apt経由

参考：https://helm.sh/docs/intro/install/#from-apt-debianubuntu

```bash
$ curl https://helm.baltorepo.com/organization/signing.asc | sudo apt-key add -
$ sudo apt-get install apt-transport-https --yes
$ echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
$ sudo apt-get update
$ sudo apt-get install helm
```

<br>

## 03. 設計ポリシー

### ディレクトリ構造

参考：

- https://helm.sh/docs/topics/charts/#the-chart-file-structure
- https://mixi-developers.mixi.co.jp/argocd-with-helm-7ec01a325acb

```bash
chart_directory/
├── charts/ # 依存する他のチャートを配置する．
├── temlaptes/ # ユーザー定義のチャートを配置する．ディレクトリ構造は自由である．
│   ├── tests/
│   ├── _helpers.tpl
│   └── template.yml # チャートの共通ロジックを設定する．
│
├── .helmignore # チャートアーカイブの作成時に無視するファイルを設定する．
├── Chart.yaml # チャートの概要を設定する．
└── values.yaml # チャートの展開する変数のデフォルト値を設定する．
```

<br>

## 04. Chart.yamlファイル

### apiVersion

#### ・apiVersionとは

Helm-APIのバージョンを設定する．

参考：https://helm.sh/docs/topics/charts/#the-apiversion-field

```yaml
apiVersion: v2
```

<br>

### appVersion

#### ・appVersionとは

Kubernetes上で稼働するアプリケーションのリリースバージョンを設定する．

参考：https://helm.sh/docs/topics/charts/#the-appversion-field

```yaml
appVersion: 1.0.0
```

<br>

### name

#### ・nameとは

Helmで作成されるKubernetesリソースの接頭辞を設定する．

参考：https://helm.sh/docs/topics/charts/#the-chartyaml-file

```yaml
name: foo
```

<br>

### type

#### ・typeとは

チャートのタイプを設定する．

参考：https://helm.sh/docs/topics/charts/#chart-types

```yaml
type: application
```

<br>

### version

#### ・versionとは

チャートアーカイブのリリースバージョンを設定する．

参考：https://helm.sh/docs/topics/charts/#charts-and-versioning

```yaml
version: 1.0.0
```

<br>

