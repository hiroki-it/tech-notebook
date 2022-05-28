---
title: 【知見を記録するサイト】チャート＠Helm
description: チャート＠Helmの知見をまとめました。
---

# チャート＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Helmの仕組み

### 構造

![helm_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/helm_architecture.png)

Helmは、パッケージマネージャーとしてのHelmクライアント、パッケージとしてのチャートアーカイブ（```.tgz```形式）、チャートアーカイブの元になるチャート、チャートアーカイブのレジストリとしてのチャートレジストリ、チャートレジストリ内にある複数のチャートリポジトリ、から構成される。Helmクライアントは、リポジトリからインストールしたチャートアーカイブに基づいてkube-apiserverをコールし、Kubernetes上にKubernetesリソースをデプロイする。

参考：

- https://cloudacademy.com/course/introduction-to-helm-1034/helm-architecture/
- https://helm.sh/ja/docs/glossary/
- https://deeeet.com/writing/2018/01/10/kubernetes-yaml/

<br>

### チャートリポジトリ

#### ▼ 構成

ルートディレクトリ配下に、```index.yaml```ファイル、チャートアーカイブ、を配置する。

参考：

- https://helm.sh/docs/topics/chart_repository/#the-chart-repository-structure
- https://zenn.dev/mikutas/articles/2ab146fa1ea35b

```bash
charts/
├── index.yaml
├── foo-0.1.2.tgz
├── bar-0.1.2.tgz
...
```

#### ▼ チャートリポジトリURL

| レジストリの種類  | 説明                                                           | 形式                                                         | 例                                      |
|-----------|--------------------------------------------------------------| ------------------------------------------------------------ | --------------------------------------- |
| チャートレジストリ | チャートのプッシュやプル時に、チャートレジストリ内のリポジトリを指定する場合は、HTTPSプロトコルを使用する。 | ```https://<チャートレジストリのドメイン名>/<チャートリポジトリ名>``` | ```https://example.com/foo-chart```     |
| OCIレジストリ  | チャートのプッシュやプル時に、OCIレジストリ内をチャートリポジトリを指定する場合は、OCIプロトコルを使用する。    | ```oci://<チャートレジストリ名>/<チャートリポジトリ名>```    | ```oci://foo-registry/foo-repository``` |

#### ▼ チャートレジストリ

チャートレジストリとして使用できるものの一覧を示す。

| レジストリ               | 補足                                                   |
|---------------------| ------------------------------------------------------ |
| ArtifactHub（Helm公式） | 参考：https://helm.sh/docs/topics/chart_repository/    |
| GitHub、GitHub Pages | 参考：https://zenn.dev/mikutas/articles/2ab146fa1ea35b |
| AWSリソース（ECR、S3）     |                                                        |
| GCPリソース             |                                                        |

<br>

## 02. セットアップ

### インストール

#### ▼ aptリポジトリから

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

#### ▼ apiVersionとは

Helm-APIのバージョンを設定する。

参考：https://helm.sh/docs/topics/charts/#the-apiversion-field

```yaml
apiVersion: v2
```

<br>

### appVersion

#### ▼ appVersionとは

Kubernetes上で稼働するアプリケーションのリリースバージョンを設定する。

参考：https://helm.sh/docs/topics/charts/#the-appversion-field

```yaml
appVersion: 1.0.0
```

<br>

### description

#### ▼ descriptionとは

チャートの説明を設定する。

```yaml
description: The chart of *****
```

<br>

### dependencies

#### ▼ dependenciesとは

依存対象のチャートを設定する。設定されたチャートは、```charts```ディレクトリにダウンロードされる。

参考：https://helm.sh/docs/topics/charts/#chart-dependencies

```yaml
dependencies:
  - name: foo
    version: 1.2.3
    repository: https://foo.example.com/foo-chart
  - name: bar
    version: 3.2.1
    repository: https://bar.example.com/bar-chart
```

<br>

### maintainers

#### ▼ maintainersとは

チャートの管理者を設定する。

```yaml
maintainers:
  - name: hiroki hasegawa
    email: example@gmail.com
    url: https://example.com
```

<br>

### name

#### ▼ nameとは

Helmで作成されるKubernetesリソースの接頭辞を設定する。

参考：https://helm.sh/docs/topics/charts/#the-chartyaml-file

```yaml
name: foo
```

<br>

### type

#### ▼ typeとは

チャートのタイプを設定する。

参考：https://helm.sh/docs/topics/charts/#chart-types

```yaml
type: application
```

<br>

### version

#### ▼ versionとは

チャートアーカイブのリリースバージョンを設定する。

参考：https://helm.sh/docs/topics/charts/#charts-and-versioning

```yaml
version: 1.0.0
```

<br>

## 04. index.yamlファイル

### index.yamlファイルとは

チャートのメタデータを設定する。```helm repo index```コマンドによって、```Chart.yaml```ファイルに基づいて自動生成されるため、ユーザーが設定する項目は少ない。

参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### apiVersion

#### ▼ apiVersionとは

参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### entries

#### ▼ entriesとは

参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### generated

#### ▼ generatedとは

コマンドによって```index.yaml```ファイルが生成された日付を設定する。

```yaml
generated: "2022-01-01T12:00:00.197173+09:00"
```

<br>

## 05. アクション

### アクションとは

テンプレートからmanifest.yamlファイルを作成するために必要な機能を提供する。

参考：https://helm.sh/docs/chart_template_guide/control_structures/

<br>

### include

#### ▼ includeとは

define関数で定義した文字列を加工して出力する。加工内容はパラメータで設定できる。

参考：

- https://helm.sh/docs/chart_template_guide/named_templates/#the-include-function
- https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-include-function

<br>

### required

参考：https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-required-function

<br>

### template

define関数で定義した文字列をそのまま出力する。template関数よりもinclude関数が推奨されている。

参考：https://helm.sh/docs/chart_template_guide/named_templates/#the-include-function

<br>

## 06. 関数

### ドット

#### ▼ ドットとは

何も加工せずに出力する。

```tpl
{* tplファイル *}

{{- define "foo-template" }}

{* 出力内容 *}

{{- end }}
```

```yaml
# YAMLファイル
{{- include "foo-template" . }}
```

<br>

### b64enc

#### ▼ b64encとは

base64方式でエンコードし、出力する。Secretの```data```キーでは、他のKubernetesリソースへの出力時に自動的にデコードするようになっており、相性が良い。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
data:
  username: {{ .Values.username | b64enc }}
  password: {{ .Values.password | b64enc }}
```



