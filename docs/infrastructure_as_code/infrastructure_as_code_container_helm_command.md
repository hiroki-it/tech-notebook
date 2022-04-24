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

#### ▼ createとは

指定したパスにチャートのサンプルファイルを作成する．

参考：https://helm.sh/docs/helm/helm_create/

```bash
$ helm create <チャートへのパス>
```

<br>

### history

#### ▼ historyとは

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

### repo

#### ▼ repoとは

チャートリポジトリを操作する．

#### ▼ add

ローカルPCにリポジトリ

```bash
$ helm repo add <チャート名> <チャートリポジトリのURL>

"リポジトリ名" has been added to your repositories
```

#### ▼ index

チャートリポジトリのメタデータが設定された```index.yaml```ファイルを生成する．

```bash
 $ helm repo index <チャートへのパス>
```

#### ▼ list

```bash
$ helm repo list

NAME　        URL                          
<チャート名>  <チャートリポジトリのURL>
```

<br>

### install

#### ▼ installとは

チャートアーカイブを指定し，Kubernetesリソースとしてデプロイする．

参考：https://helm.sh/docs/helm/helm_install/

| パラメーター                                                 | 例                                                   | 補足                                                   |
| ------------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------ |
| ```<チャートリポジトリ名>/<チャート名>```                    | ```foo-repository/foo-chart```                       | 参考：https://zenn.dev/mikutas/articles/2ab146fa1ea35b |
| チャートアーカイブへのパス                                   | ```./foo-chart-1.0.0.tgz```                          | 参考：https://helm.sh/docs/helm/helm_install/          |
| チャートへのパス                                             | ```./foo-chart```                                    |                                                        |
| チャートリポジトリURL                                        | ```https://example.com/charts/foo-chart-1.0.0.tgz``` |                                                        |
| ```<チャートリポジトリURL> <チャートリポジトリ名>/<チャート名>``` | ```https://example.com/charts/foo-chart-1.0.0.tgz``` |                                                        |

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

指定した```values```ファイル使用して，```helm install```コマンドを実行する．

参考：https://helm.sh/docs/helm/helm_install/#options

```bash
$ helm install -f <valuesファイルへのパス> <リリース名> <チャートアーカイブへのパス>
```

#### ▼ kube-context

helmコマンドの向き先を指定して，```helm install```コマンドを実行する．

```bash
$ helm install <リリース名> <チャートリポジトリn> --kube-context <アカウントID>.dkr.ecr.<リージョン>.amazonaws.com/prd-foo-eks-cluster
```

<br>

### lint

#### ▼ lintとは

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

指定した```values```ファイル使用して，```helm lint```コマンドを実行する．

```bash
$ helm lint -f <valuesファイルへのパス> <チャートへのパス>

==> Linting kubernetes
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

1 chart(s) linted, 0 chart(s) failed
```

複数のチャートに対して，同じ```values```ファイルを渡すこともできる．

```bash
❯ helm lint -f <valuesファイルへのパス> ./kubernetes ./istio ./argocd ./eks ./operator/istio

==> Linting ./kubernetes
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

==> Linting ./istio
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

==> Linting ./argocd
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

==> Linting ./eks
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

==> Linting ./operator/istio
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

5 chart(s) linted, 0 chart(s) failed
```

<br>

### list

#### ▼ listとは

Helmを使用してデプロイしたリソースの一覧を表示する．

参考：https://helm.sh/docs/helm/helm_list/

```bash
$ helm list

NAME         VERSION   UPDATED                   STATUS    CHART
<リリース名>   1         Wed Jan 01 12:00:00 2020  DEPLOYED  foo-chart-0.1.0
```

<br>

### package

#### ▼ packageとは

チャートからチャートアーカイブを作成する．または，すでにアーカイブが存在する場合は更新する．アーカイブ名にはバージョンが設定される．複数のチャートを指定できる．

参考：https://helm.sh/docs/helm/helm_package/

```bash
$ helm package <fooチャートへのパス> <barチャートへのパス> <bazチャートへのパス>

Successfully packaged chart and saved it to: /foo-1.0.0.tgz
```

#### ▼ -d

チャートアーカイブの作成先のディレクトリを指定しつつ，```helm package```コマンドを実行する．

```bash
$ helm package <チャートへのパス> -d ./archives
```

<br>

### pull

#### ▼ pullとは

指定したチャートリポジトリからチャートを圧縮ファイル形式（```.tgz```形式）でプルする．

#### ▼ --version

チャートのバージョンを指定して，```helm pull```コマンドを実行する．

```bash
$ helm pull oci://<アカウントID>.dkr.ecr.<リージョン>.amazonaws.com/<チャート名> --version <バージョン>
```

<br>

### search

#### ▼ searchとは

チャートリポジトリを検索する．

#### ▼ hub

チャートリポジトリをキーワードで検索する．

```bash
$ helm search hub <キーワード>

URL                                  CHART VERSION      APP VERSION                       DESCRIPTION                                                   https://artifacthub.io/example.com   1.0.0             1.0.0                            This is foo chart
<チャートリポジトリURL>                 <チャートバージョン>  <アプリケーションのリリースバージョン>  <説明文>
```

<br>

### show

#### ▼ show



#### ▼ chart

チャートの```index.yaml```ファイルを表示する．

```bash
$ helm show chart <チャート名>

apiVersion: v1
appVersion: 5.7.30
deprecated: true

# 〜 中略 〜

version: 1.6.9
```

<br>

### template

#### ▼ templateとは

Kubernetesにデプロイされるリソースのマニフェストファイルを出力する．YAMLファイルにリダイレクトするようにするとよい．

```bash
$ helm template <リリース名> <チャートアーカイブへのパス> >| <出力先ファイル>
```

#### ▼ -f

指定した```values```ファイル使用して，```helm template```コマンドを実行する．

```bash
$ helm template <リリース名> <チャートアーカイブへのパス> -f <valuesファイルへのパス> >| <出力先ファイル> --set foo.bar=baz
```

```yaml
# valuesファイル
foo:
  bar: qux # 上書きされる
```

#### ▼ -set

デフォルト値を上書きし，```helm template```コマンドを実行する．

```
$ helm template <リリース名> <チャートアーカイブへのパス> -f <valuesファイルへのパス> >| <出力先ファイル>
```

<br>

### uninstall

#### ▼ uninstallとは

指定したリリースによってデプロイされたKubernetesリソースを削除する．

参考：https://helm.sh/docs/helm/helm_uninstall/

```bash
$ helm uninstall <リリース名>
```

<br>

### upgrade

#### ▼ upgradeとは

Helmのリリースをアップグレードする．

#### ▼ --install

新しいリビジョン番号を作成し，デプロイ済のリリースをアップグレードする．

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

