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

### テンプレート管理

#### ・テンプレート管理とは

Kubernetesのテンプレートファイルを部分的に共通化できる．

参考：https://qiita.com/Hiroyuki_OSAKI/items/8965ceb6c90bae3bea76

#### ・種類

Helmの他に，Kustomize，などがある．HelmよりもKustomizeの方がカスタマイズ性が高い．

参考：https://qiita.com/Nishi53454367/items/4a4716dfbeebd70295d1#%E3%81%93%E3%81%93%E3%81%A7%E4%BD%BF%E7%94%A8%E3%81%99%E3%82%8B%E6%8A%80%E8%A1%93%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6-1

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

## 03. Chart.yamlファイル

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

