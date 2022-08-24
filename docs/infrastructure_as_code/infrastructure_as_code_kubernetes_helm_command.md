---
title: 【IT技術の知見】コマンド＠Helm
description: コマンド＠Helmの知見を記録しています。
---

# コマンド＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. helmコマンド

### create

#### ▼ createとは

指定したパスにチャートのサンプルファイルを作成する。

ℹ️ 参考：https://helm.sh/docs/helm/helm_create/

```bash
$ helm create <チャートへのパス>
```

<br>

### history

#### ▼ historyとは

指定したリリースの履歴を取得する。

ℹ️ 参考：https://helm.sh/docs/helm/helm_history/

```bash
$ helm history <リリース名>

REVISION    UPDATED                   STATUS     CHART      APP VERSION   DESCRIPTION
<リリース名>  Wed Jan 01 12:00:00 2020  SUSPENDED  foo-<バージョンタグ>  <バージョンタグ>         Initial install
<リリース名>  Wed Jan 01 12:00:00 2020  SUSPENDED  foo-1.1.0  1.1.0         Rolled back to 1
<リリース名>  Wed Jan 01 12:00:00 2020  DEPLOYED   foo-1.0.1  1.1.1         Upgraded successfully
```

<br>

### install

#### ▼ installとは

チャートなどを指定し、Kubernetesリソースとして作成する。チャートへのパスを指定する以外にも、指定方法には種類がある。

ℹ️ 参考：https://helm.sh/docs/helm/helm_install/

```bash
$ helm install <リリース名> <チャートへのパス>
```

| パラメーター                                                 | 例                                                           | 補足                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| チャートへのパス                                             | ```./foo-chart```                                            |                                                              |
| ```<チャートレジストリ名>/<チャートリポジトリ名>```          | ```foo-registry/foo-repository```                            | ℹ️ 参考：https://zenn.dev/mikutas/articles/2ab146fa1ea35b       |
| チャートリポジトリURL                                        | ```https://example.com/foo-chart```                          |                                                              |
| ```<チャートリポジトリURL> <チャートレジストリ名>/<チャートリポジトリ名>``` | ```https://example.com/foo-chart foo-registry/foo-repository``` |                                                              |
| チャートアーカイブへのパス                                   | ```./foo-chart-<バージョンタグ>.tgz```                                  | ```values```ファイルを使用する場合、```values```ファイルはチャートアーカイブの外にある必要がある。<br>ℹ️ 参考：https://helm.sh/docs/helm/helm_install/ |

#### ▼ --dry-run

Kubernetesに作成されるリソースのマニフェストファイルを取得する。作成する前に、チャートの設定が正しいか否かを確認できる。

```bash
$ helm install --dry-run <リリース名> <チャートへのパス>

# Source: prd/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment

# 〜 中略 〜
```

#### ▼ -f

指定した```values```ファイル使用して、```helm install```コマンドを実行する。チャートのルートパスに『```values.yaml```』の名前でファイルが存在している場合、自動的に読み込まれるため、このオプションは不要である。これ以外の名前の場合は、オプションによる```values```ファイルの指定が必要になる。

ℹ️ 参考：https://helm.sh/docs/helm/helm_install/#options

```bash
$ helm install -f <valuesファイルへのパス> <リリース名> <チャートへのパス>
```

#### ▼ kube-context

helmコマンドの向き先を指定して、```helm install```コマンドを実行する。

```bash
# Minikubeの場合
helm install <リリース名> <チャートリポジトリ名> --kube-context minikube
```

```bash
# AWSの場合
$ helm install <リリース名> <チャートリポジトリ名> --kube-context <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/prd-foo-eks-cluster
```

<br>

### lint

#### ▼ lintとは

Helmの構文をバリデーションを実行する。あくまでHelmの構文マニフェストファイル自体の記法の誤りは検出してくれないことに注意する。

ℹ️ 参考：

- https://helm.sh/docs/helm/helm_lint/
- https://redhat-cop.github.io/ci/linting-testing-helm-charts.html

```bash
$ helm lint <チャートへのパス>

==> Linting kubernetes
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

1 chart(s) linted, 0 chart(s) failed
```

#### ▼ -f

指定した```values```ファイル使用して、```helm lint```コマンドを実行する。

```bash
$ helm lint -f <valuesファイルへのパス> <チャートへのパス>

==> Linting kubernetes
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

1 chart(s) linted, 0 chart(s) failed
```

複数のチャートに対して、同じ```values```ファイルを渡すこともできる。

```bash
$ helm lint -f <valuesファイルへのパス> ./kubernetes ./istio ./argocd ./eks ./operator/istio

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

リリースの一覧を取得する。チャートは、バージョンによって中身の```.yaml```ファイルに差があるため、ここでチャートのバージョンを確認すると良い。

ℹ️ 参考：https://helm.sh/docs/helm/helm_list/

```bash
$ helm list

NAME         VERSION   UPDATED                   STATUS    CHART
<リリース名>   1         Wed Jan 01 12:00:00 2020  DEPLOYED  foo-chart-<バージョンタグ> # <-- チャートのバージョンがわかる。
```

<br>

### package

#### ▼ packageとは

チャートからチャートアーカイブを作成する。または、すでにアーカイブが存在する場合は更新する。アーカイブ名にはバージョンが設定される。複数のチャートを指定できる。

ℹ️ 参考：https://helm.sh/docs/helm/helm_package/

```bash
$ helm package <fooチャートへのパス> <barチャートへのパス> <bazチャートへのパス>

Successfully packaged chart and saved it to: /foo-<バージョンタグ>.tgz
```

#### ▼ -d

チャートアーカイブの作成先のディレクトリを指定しつつ、```helm package```コマンドを実行する。

```bash
$ helm package <チャートへのパス> -d <作成するチャートアーカイブのパス>
```

<br>

### pull

#### ▼ pullとは

指定したチャートリポジトリからチャートをチャートアーカイブ（```.tgz```形式）でプルする。チャートアーカイブは、チャートに解凍した上で使用した方がよい。

#### ▼ -d

チャートのプル先のディレクトリを指定して、```helm pull```コマンドを実行する。

```bash
$ helm pull <チャートリポジトリURL> -d <プル先のディレクトリ>
```

OCIリポジトリからもプルできる。

ℹ️ 参考：https://helm.sh/blog/storing-charts-in-oci/

```bash
# AWSの場合
$ helm pull oci://<アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/<チャート名>
```

#### ▼ --version

チャートのバージョンを指定して、```helm pull```コマンドを実行する。

```bash
$ helm pull <チャートリポジトリURL> --version <バージョンタグ>
```

<br>

### push

#### ▼ pushとは

チャートリポジトリにチャートをプッシュする。プッシュする前にチャートをチャートアーカイブに圧縮しておく必要がある。

```bash
$ helm push <チャートアーカイブへのパス> <チャートリポジトリURL>
```

```bash
# AWSの場合
$ helm push <チャートアーカイブへのパス> oci://<アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com
```

<br>

### registry

#### ▼ registryとは

チャートリポジトリを操作する。

#### ▼ login

チャートリポジトリにログインする。

```bash
$ <チャートリポジトリのプロバイダーによる> | helm registry login \
    --username <ユーザ名> \
    --password-stdin \
    <チャートリポジトリ名>
```

```bash
# AWSの場合
$ aws ecr get-login-password --region ap-northeast-1 | helm registry login \
    --username AWS \
    --password-stdin \
    <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com
```

<br>

### repo

#### ▼ repoとは

チャートリポジトリを操作する。

#### ▼ add

helmコマンドの実行環境にチャートリポジトリを登録する。

ℹ️ 参考：https://knowledge.sakura.ad.jp/23603/

```bash
$ helm repo add <チャートリポジトリ名> <チャートリポジトリURL>

"<チャート名>" has been added to your repositories
```

登録していないチャートにhelmコマンドでアクセスしようとするとエラーになる。

```bash
$ helm show all <チャートリポジトリ名>

Error: failed to download "<チャートリポジトリ名>"
```

#### ▼ index

チャートリポジトリのメタデータが設定された```index.yaml```ファイルを作成する。

```bash
 $ helm repo index <チャートへのパス>
```

#### ▼ list

事前に```helm repo add```コマンドで追加しておいたチャートリポジトリの一覧を取得する。

```bash
$ helm repo list

NAME　                URL                          
<チャートリポジトリ名>   https://example.com/charts
```

#### ▼ remove

事前に```helm repo add```コマンドで追加しておいたチャートリポジトリを削除する。

```bash
$ helm repo remove <チャート名>

"<チャートリポジトリ名>" has been removed from your repositories
```

```bash
# チャート名をreleasesとしている場合
$ helm repo remove releases
```

#### ▼ update

事前に```helm repo add```コマンドで追加しておいたチャートリポジトリの情報を更新する。チャートを特定のバージョンにアップグレードする前にリポジトリの情報を更新しておく必要がある。

ℹ️ 参考：https://helm.sh/docs/intro/using_helm/#helm-repo-working-with-repositories

```bash
$ helm repo update <チャートリポジトリ名>

Hang tight while we grab the latest from your chart repositories...
...
Update Complete. ⎈Happy Helming!⎈
```

<br>

### search

#### ▼ searchとは

事前に```helm repo add```コマンドで追加しておいたチャートリポジトリを検索する。

ℹ️ 参考：https://helm.sh/docs/intro/using_helm/#helm-search-finding-charts

#### ▼ hub

チャートリポジトリをキーワードで検索する。

```bash
$ helm search hub <キーワード>

URL               CHART VERSION      APP VERSION                       DESCRIPTION                                                   https://artifacthub.io/example.com   <バージョンタグ>             <バージョンタグ>                            This is foo chart
<OCIリポジトリURL>  <チャートバージョン>  <アプリケーションのリリースバージョン>  <説明文>
```

<br>

### show

#### ▼ show

チャートの情報を取得する。

#### ▼ all

チャート内の全てのマニフェストファイルを取得する。

```bash
$ helm show all <チャート名>
```

```bash
# チャート名をreleasesとしている場合
$ helm show all releases
```

#### ▼ chart

チャートの```Chart.yaml```ファイルを取得する。

```bash
$ helm show chart <チャート名>

apiVersion: v2
appVersion: <バージョンタグ>
maintainers:
  - name: hiroki hasegawa
name: foo-chart
type: application
version: <バージョンタグ>
```

#### ▼ values

チャートに渡せるパラメーターを```values```ファイルとして取得する。```values```ファイル本体は、チャートリポジトリで閲覧できる。

ℹ️ 参考：https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing

```bash
$ helm show values <チャート名>

# valuesファイルが表示される。
```

```bash
# チャート名をreleasesとしている場合
$ helm show values releases
```

<br>

### template

#### ▼ templateとは

Kubernetesに作成されるリソースのマニフェストファイルを出力する。```.yaml```ファイルにリダイレクトするようにすると良い。

```bash
$ helm template <リリース名> <チャートへのパス> >| <出力先ファイル>
```

```bash
# チャート名をreleasesとしている場合
$ helm template prd releases >| releases.yaml
```

#### ▼ -f

指定した```values```ファイル使用して、```helm template```コマンドを実行する。

```bash
$ helm template <リリース名> <チャートへのパス> -f <valuesファイルへのパス> >| <出力先ファイル>|
```

```yaml
# valuesファイル
foo:
  bar: QUX # 上書きされる
```

#### ▼ -set

デフォルト値を上書きし、```helm template```コマンドを実行する。

```bash
$ helm template <リリース名> <チャートへのパス> -f <valuesファイルへのパス> >| <出力先ファイル>
```

<br>

### uninstall

#### ▼ uninstallとは

リリースを指定し、そのリリースでインストールされたKubernetesリソースを削除する。

ℹ️ 参考：https://helm.sh/docs/helm/helm_uninstall/

```bash
$ helm uninstall <リリース名>
```

<br>

### upgrade

#### ▼ upgradeとは

指定したバージョンのチャートを使用して、リリースをアップグレードする。

ℹ️ 参考：https://helm.sh/docs/intro/using_helm/#helm-upgrade-and-helm-rollback-upgrading-a-release-and-recovering-on-failure

#### ▼ --atomic

```helm upgrade```コマンドが正常に完了しなかった場合に、ロールバックを実行する。

```bash
$ helm upgrade --atomic -f <valuesファイルへのパス> <リリース名> <チャートへのパス>
```

#### ▼ --install

新しいリビジョン番号を作成し、インストール済のリリースをアップグレードする。

```bash
$ helm upgrade --install -f <valuesファイルへのパス> <リリース名> <チャートへのパス>

Release "<リリース名>" has been upgraded. Happy Helming!
NAME: <リリース名>
LAST DEPLOYED: Sat Jan 1 12:00:00 2022
NAMESPACE: default
STATUS: deployed
REVISION: 3 # <---- リビジョン番号が増えていく
TEST SUITE: None
```

#### ▼ --skip-crds

Helmは、カスタムリソースを含むチャートのインストールはサポートしているが、アップグレードとアンインストールをサポートしていない。そのため、```helm upgrade```コマンド時にはカスタムリソースのインストールを実行する仕様になっている。```--skip-crds```オプションを有効化すると、このインストールをスキップし、非カスタムリソースのみをインストールできる。

ℹ️ 参考：

- https://helm.sh/docs/helm/helm_upgrade/

```bash
$ helm upgrade --skip-crds -f <valuesファイルへのパス> <リリース名> <チャートへのパス>
```

#### ▼ --wait

作成したPodがReady状態になるまで、```helm upgrade```コマンドの完了を待機する。

```bash
$ helm upgrade --wait -f <valuesファイルへのパス> <リリース名> <チャートへのパス>
```

<br>

## 02. プラグイン系コマンド

### helm-secrets

#### ▼ helm-secretsとは

Sopsを使用して、```values```ファイルを暗号化/復号化しつつ、helmコマンドを実行する。元々の平文ファイルの名前は、```secrets.yaml```または```secrets.***.yaml```とする必要がある。

ℹ️ 参考：https://scrapbox.io/mikutas/helm-secrets%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9

```bash
$ helm plugin install https://github.com/jkroepke/helm-secrets --version <バージョンタグ>
```

#### ▼ dec

指定した```values```ファイルを復号化し、```.yaml.dec```ファイルに出力する。

ℹ️ 参考：https://qiita.com/knqyf263/items/4bb1c961037d0ea55a62

```bash
$ helm secrets dec <暗号化されたvaluesファイル>

Decrypting ./values/secrets.yaml
```

```yaml
# .yaml.decファイル
db:
  user: root
  password: password
```

#### ▼ enc

指定した```values```ファイルを暗号化し、元々の```values```ファイルを上書きする。

ℹ️ 参考：https://qiita.com/knqyf263/items/4bb1c961037d0ea55a62

```bash
$ helm secrets enc <平文のvaluesファイル>

Encrypted ./values/secrets.yaml
```

```yaml
# secrets.yamlファイル
db:
  user: *****
  password: *****
# sopsキーが追記される。
sops:
  # 〜 中略 〜
```

#### ▼ view

指定した```values```ファイルを復号化して取得する。

ℹ️ 参考：https://qiita.com/knqyf263/items/4bb1c961037d0ea55a62

```bash
$ helm secrets view <暗号化されたvaluesファイル>

db:
  user: root
  password: password
```

<br>
