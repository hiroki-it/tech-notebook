---
title: 【IT技術の知見】コマンド＠Helm
description: コマンド＠Helmの知見を記録しています。
---

# コマンド＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. ```helm```コマンド

### create

#### ▼ createとは

指定したパスにチャートのサンプルファイルを作成する。

> ℹ️ 参考：https://helm.sh/docs/helm/helm_create/

```bash
$ helm create <チャートへのパス>
```

<br>

### dependency

#### ▼ build

```requirements.yaml```ファイルに定義された依存対象のチャートを、```chart```ディレクトリ内にダウンロードする。

> ℹ️ 参考：https://qiita.com/thinksphere/items/5f3e918015cf4e63a0bc#helm-dependency-build%E3%81%AB%E3%82%88%E3%82%8B%E4%BE%9D%E5%AD%98%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88%E3%81%AE%E3%83%80%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%89

```bash
$ helm dependency build

Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "foo" chart repository
Update Complete. ⎈Happy Helming!⎈
Saving 1 charts
```

<br>

### get

#### ▼ getとは

特定のリリースに含まれる```helm template```コマンドの結果を取得する。

> ℹ️ 参考：https://helm.sh/docs/helm/helm_get_manifest/

```bash
$ helm get <リリース名>
```

<br>

### history

#### ▼ historyとは

指定したリリースの履歴を取得する。

> ℹ️ 参考：https://helm.sh/docs/helm/helm_history/

```bash
$ helm history <リリース名>

REVISION     UPDATED                    STATUS     CHART               APP VERSION            DESCRIPTION
<リリース名>   Wed Jan 01 12:00:00 2020   SUSPENDED  foo-<バージョンタグ>   <バージョンタグ>          Initial install
<リリース名>   Wed Jan 01 12:00:00 2020   SUSPENDED  foo-1.1.0  1.1.0    Rolled back to 1
<リリース名>   Wed Jan 01 12:00:00 2020   DEPLOYED   foo-1.0.0  1.0.0    Upgraded successfully
```

<br>

### install

#### ▼ installとは

チャートなどを指定し、Kubernetesリソースとして作成する。チャートへのパスを指定する以外にも、指定方法には種類がある。

> ℹ️ 参考：https://helm.sh/docs/helm/helm_install/

```bash
$ helm install <リリース名> <チャートへのパス>
```

| パラメーター                                           | 例                                                              | 補足                                                                                                                                        |
|--------------------------------------------------|-----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| チャートへのパス                                         | ```./foo-chart```                                               |                                                                                                                                             |
| ```<チャートレジストリ名>/<チャートリポジトリ名>```                | ```foo-registry/foo-repository```                               | ℹ️ 参考：https://zenn.dev/mikutas/articles/2ab146fa1ea35b                                                                                    |
| チャートリポジトリURL                                     | ```https://example.com/foo-chart```                             |                                                                                                                                             |
| ```<チャートリポジトリURL> <チャートレジストリ名>/<チャートリポジトリ名>``` | ```https://example.com/foo-chart foo-registry/foo-repository``` |                                                                                                                                             |
| チャートアーカイブへのパス                                    | ```./foo-chart-<バージョンタグ>.tgz```                                 | ```values```ファイルを使用する場合、```values```ファイルはチャートアーカイブ（```.tgz```形式ファイル）の外にある必要がある。<br>ℹ️ 参考：https://helm.sh/docs/helm/helm_install/ |

#### ▼ --dry-run

Kubernetesに作成されるリソースのマニフェストを取得する。作成する前に、チャートの設定が正しいか否かを確認できる。

```bash
$ helm install --dry-run <リリース名> <チャートへのパス>

# Source: prd/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment

...
```

#### ▼ -f

指定した```values```ファイル使用して、```helm install```コマンドを実行する。チャートのルートパスに『```values.yaml```』の名前でファイルが存在している場合、自動的に読み込まれるため、このオプションは不要である。これ以外の名前の場合は、オプションによる```values```ファイルの指定が必要になる。

> ℹ️ 参考：https://helm.sh/docs/helm/helm_install/#options

```bash
$ helm install <リリース名> <チャートへのパス> -f <valuesファイルへのパス>
```

#### ▼ kube-context

```helm```コマンドの向き先を指定して、```helm install```コマンドを実行する。

```bash
# Minikubeの場合
$ helm install <リリース名> <チャートリポジトリ名> --kube-context minikube
```

```bash
# AWSの場合
$ helm install <リリース名> <チャートリポジトリ名> --kube-context <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/prd-foo-eks-cluster
```

<br>

### lint

#### ▼ lintとは

Helmの構文をバリデーションを実行する。あくまでHelmの構文マニフェスト自体の記法の誤りは検出してくれないことに注意する。

> ℹ️ 参考：
>
> - https://helm.sh/docs/helm/helm_lint/
> - https://redhat-cop.github.io/ci/linting-testing-helm-charts.html

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
$ helm lint <チャートへのパス> -f <valuesファイルへのパス>

==> Linting kubernetes
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

1 chart(s) linted, 0 chart(s) failed
```

複数のチャートに対して、同じ```values```ファイルを渡すこともできる。

```bash
$ helm lint <チャートへのパス> -f <valuesファイルへのパス>

==> Linting <チャート>
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

5 chart(s) linted, 0 chart(s) failed
```

<br>

### list

#### ▼ listとは

リリースの一覧を取得する。チャートは、バージョンによって中身の```.yaml```ファイルに差があるため、ここでチャートのバージョンを確認すると良い。

> ℹ️ 参考：https://helm.sh/docs/helm/helm_list/

```bash
$ helm list

NAME         VERSION   UPDATED                   STATUS    CHART
<リリース名>   1         Wed Jan 01 12:00:00 2020  DEPLOYED  foo-chart-<バージョンタグ> # <-- チャートのバージョンがわかる。
```

<br>

### package

#### ▼ packageとは

チャートからチャートアーカイブ（```.tgz```形式ファイル）を作成する。または、すでにアーカイブが存在する場合は更新する。アーカイブ名にはバージョンが設定される。複数のチャートを指定できる。

> ℹ️ 参考：https://helm.sh/docs/helm/helm_package/

```bash
$ helm package <fooチャートへのパス> <barチャートへのパス> <bazチャートへのパス>

Successfully packaged chart and saved it to: /foo-<バージョンタグ>.tgz
```

#### ▼ -d

チャートアーカイブ（```.tgz```形式ファイル）の作成先のディレクトリを指定しつつ、```helm package```コマンドを実行する。

```bash
$ helm package <チャートへのパス> -d <作成するチャートアーカイブのパス>
```

<br>

### plugin

#### ▼ install

プラグインをインストールする。

```bash
$ helm plugin install https://github.com/jkroepke/helm-secrets --version 1.0.0
```

#### ▼ list

インストール済みのプラグインの一覧を表示する。

```bash
$ helm plugin list

NAME     VERSION  DESCRIPTION                                                                 
diff     3.4.2    Preview helm upgrade changes as a diff                                      
secrets  3.7.0    plugin provides secrets values encryption for Helm charts secure storing
```

#### ▼ uninstall

指定したプラグインをアンインストールする。

```bash
$ helm plugin uninstall secrets
```

<br>

### pull

#### ▼ pullとは

指定したチャートリポジトリからチャートをチャートアーカイブ（```.tgz```形式ファイル）でプルする。チャートアーカイブは、チャートに解凍した上で使用した方がよい。

#### ▼ -d

チャートのプル先のディレクトリを指定して、```helm pull```コマンドを実行する。

```bash
$ helm pull <チャートリポジトリURL> -d <プル先のディレクトリ>
```

OCIリポジトリからもプルできる。

> ℹ️ 参考：https://helm.sh/blog/storing-charts-in-oci/

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

チャートリポジトリにチャートをプッシュする。プッシュする前にチャートをチャートアーカイブ（```.tgz```形式ファイル）に圧縮しておく必要がある。

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

```helm```コマンドの実行環境にチャートリポジトリを登録する。

> ℹ️ 参考：https://knowledge.sakura.ad.jp/23603/

```bash
$ helm repo add <チャートリポジトリ名> <チャートリポジトリURL>

"<チャート名>" has been added to your repositories
```

登録していないチャートに```helm```コマンドでアクセスしようとするとエラーになる。

```bash
$ helm show all <チャートリポジトリ名>

Error: failed to download "<チャートリポジトリ名>"
```

#### ▼ index

チャートリポジトリのメタデータが設定された```index.yaml```ファイルを作成する。

```bash
 $ helm repo index <チャートへのパス>
```


**＊例＊**

```bash
$ helm repo index ./foo-chart
```

#### ▼ list

事前に```helm repo add```コマンドで追加しておいたチャートリポジトリの一覧を取得する。

```bash
$ helm repo list

NAME                 URL                          
<チャートリポジトリ名>   https://example.com/charts
```

#### ▼ remove

事前に```helm repo add```コマンドで追加しておいたチャートリポジトリを削除する。

```bash
$ helm repo remove <チャート名>

"<チャートリポジトリ名>" has been removed from your repositories
```

**＊例＊**

```bash
$ helm repo remove foo-chart
```

#### ▼ update

事前に```helm repo add```コマンドで追加しておいたチャートリポジトリの情報を更新する。チャートを特定のバージョンにアップグレードする前にリポジトリの情報を更新しておく必要がある。

> ℹ️ 参考：https://helm.sh/docs/intro/using_helm/#helm-repo-working-with-repositories

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

> ℹ️ 参考：https://helm.sh/docs/intro/using_helm/#helm-search-finding-charts

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

チャート内の全てのマニフェストを取得する。

```bash
$ helm show all <チャート名>
```

**＊例＊**

```bash
$ helm show all foo-chart
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

チャートに渡せるパラメーターを```values```ファイルとして取得する。```values```ファイル本体は、チャートリポジトリで参照できる。

> ℹ️ 参考：https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing

```bash
$ helm show values <チャート名>

# valuesファイルが表示される。
```

```bash
$ helm show values foo-chart
```

<br>

### template

#### ▼ templateとは

Kubernetesに作成されるリソースのマニフェストを出力する。```.yaml```ファイルにリダイレクトするようにすると良い。

```bash
# チャート名をreleasesとしている場合
$ helm template . -f values.yaml >| releases.yaml
```

#### ▼ -f

指定した```values```ファイル使用して、```helm template```コマンドを実行する。

```bash
$ helm template <チャートへのパス> -f <valuesファイルへのパス> >| <出力先ファイル>
```

**＊例＊**

```bash
$ helm template ./foo-chart -f ./values.yaml >| release.yaml
```


#### ▼ -set

デフォルト値を上書きし、```helm template```コマンドを実行する。機密な変数を一時的に出力する場合に使うと良い。

```bash
$ helm template <チャートへのパス> -f <valuesファイルへのパス> -set foo.user.password=$PASSWPRD >| <出力先ファイル>
```


```yaml
# valuesファイル
foo:
  bar: QUX # 上書きされる
```

<br>

### uninstall

#### ▼ uninstallとは

リリースを指定し、そのリリースでインストールされたKubernetesリソースを削除する。

> ℹ️ 参考：https://helm.sh/docs/helm/helm_uninstall/

```bash
$ helm uninstall <リリース名>
```

**＊例＊**

```bash
$ helm uninstall foo-release
```

<br>

### upgrade

#### ▼ upgradeとは

指定したバージョンのチャートを使用して、リリースをアップグレードする。

> ℹ️ 参考：https://helm.sh/docs/intro/using_helm/#helm-upgrade-and-helm-rollback-upgrading-a-release-and-recovering-on-failure

#### ▼ --atomic

```helm upgrade```コマンドが正常に完了しなかった場合に、ロールバックする。

```bash
$ helm upgrade --atomic <リリース名> <チャートへのパス> -f <valuesファイルへのパス> 
```

**＊例＊**

```bash
$ helm template --atomic ./foo-chart -f ./values.yaml >| release.yaml
```


#### ▼ --install

新しいリビジョン番号を作成し、インストール済のリリースをアップグレードする。

```bash
$ helm upgrade --install <リリース名> <チャートへのパス> -f <valuesファイルへのパス>

Release "<リリース名>" has been upgraded. Happy Helming!
NAME: <リリース名>
LAST DEPLOYED: Sat Jan 1 12:00:00 2022
NAMESPACE: default
STATUS: deployed
REVISION: 3 # <---- リビジョン番号が増えていく
TEST SUITE: None
```

#### ▼ --skip-crds

Helmは、カスタムリソース定義を含むチャートのインストールはサポートしているが、アップグレードとアンインストールをサポートしていない。そのため、```helm upgrade```コマンド時にはカスタムリソース定義のインストールを実行する仕様になっている。```install```オプションを有効化した上で、```--skip-crds```オプションを有効化すると、```helm upgrade```コマンド時にカスタムリソース定義のインストールをスキップし、非カスタムリソース定義のみをインストールする。

> ℹ️ 参考：
>
> - https://helm.sh/docs/helm/helm_upgrade/

```bash
$ helm upgrade --skip-crds --install <リリース名> <チャートへのパス> -f <valuesファイルへのパス>
```

**＊例＊**

```helm upgrade```コマンド時に、カスタムリソース定義の作成をスキップし、非カスタムリソース定義のみをインストールする。

```bash
$ helm upgrade --skip-crds --install foo-release ./foo-chart -f ./values.yaml >| release.yaml
```

#### ▼ --wait

作成したPodがReady状態になるまで、```helm upgrade```コマンドの完了を待機する。

```bash
$ helm upgrade --wait <リリース名> <チャートへのパス> -f <valuesファイルへのパス>
```

**＊例＊**

```bash
$ helm upgrade --wait foo-release ./foo-chart -f ./values.yaml
```

<br>

## 02. helm-dashboard

### helm-dashboardとは

```helm```コマンドで確認できる情報（例：インストールされているHelmチャート、リビジョン履歴、など）をダッシュボードで表示する。

> ℹ️ 参考：https://github.com/komodorio/helm-dashboard

<br>

### セットアップ

#### ▼ インストール

> ℹ️ 参考：https://github.com/komodorio/helm-dashboard#installing

```bash
$ helm plugin install https://github.com/komodorio/helm-dashboard.git
```

#### ▼ 起動

> ℹ️ 参考：https://github.com/komodorio/helm-dashboard#running

```bash
$ helm dashboard
```

<br>

## 03. helm-diff

### helm-diffとは

```helm get```コマンドによる最新のリリースによるマニフェストと、```helm template```コマンドによる現在のチャートによるマニフェストを比較する。etcd上のマニフェストと比較しているわけでないことに注意する。

```bash
$ helm diff
```

<br>

### セットアップ

#### ▼ インストール

```bash
$ helm plugin install https://github.com/databus23/helm-diff --version 1.0.0
```

<br>

## 04. helm-secrets

### helm-secretsとは

暗号化ツールを使用して、```values```ファイルを暗号化/復号化しつつ、```helm```コマンドを実行する。

> ℹ️ 参考：https://scrapbox.io/mikutas/helm-secrets%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9

<br>

### セットアップ

#### ▼ インストール

```bash
$ helm plugin install https://github.com/jkroepke/helm-secrets --version 1.0.0
```

<br>

### バックエンド

#### ▼ バックエンドとは

helm-secretsの内部で使用する暗号化ツールのこと。

> ℹ️ 参考：https://github.com/jkroepke/helm-secrets/wiki/Secret-Backends

#### ▼ 使用可能なバックエンド例

- sops
- vals

> ℹ️ 参考：https://github.com/jkroepke/helm-secrets/wiki/Secret-Backends#list-of-implemented-secret-backends

<br>

## 04-02. バックエンドがsopsの場合

### 注意点

#### ▼ ```secrets```ファイルの名前の制限

helm-secretsには、zendesk製（2022/11/29時点でメンテナンスされていない）と、zendesk製からフォークされたjkroepke製がある。zendesk製を使用している場合、sopsの```secrets```ファイルの名前を『```secrets.yaml```』『```secrets.<任意の名前>.yaml```』とする必要がある。一方でjkeroepke製では、執筆時点（2022/11/29）で、```secrets```ファイルの名前が自由である。

> ℹ️ 参考：
>
> - https://github.com/zendesk/helm-secrets#usage-and-examples
> - https://github.com/jkroepke/helm-secrets/wiki/Usage

<br>

### secretsサブコマンド無しの場合

#### ▼ ```secrets://```

sopsの```secrets```ファイルを指定する時に```secrets://```を使用すると、サブコマンドの```secrets```が不要になる。

> ℹ️ 参考：https://github.com/jkroepke/helm-secrets#decrypt-secrets-via-protocol-handler

```bash
$ helm template ./foo-chart -f secrets://secrets.yaml
```

<br>

### オプション

#### ▼ -f

暗号化された```values```ファイル（```secrets```ファイル）と、平文の```values```ファイルを使用して、```helm```コマンドを実行する。これにより、暗号化された値を```helm```コマンドの実行時のみ復号化し、マニフェストに出力できる。 なおこの時、```values```ファイル側には```secrets```ファイルの値を設定しておく必要はない。

> ℹ️ 参考：https://www.thorsten-hans.com/encrypted-secrets-in-helm-charts/

```bash
$ helm secrets template <チャートへのパス> -f <sopsが作成したsecrets.yamlファイルへのパス> -f <valuesファイルへのパス>
```

**＊例＊**

以下のようなsopsの```secrets```ファイルがあるとする。

```yaml
# secrets.yaml
foo: F799Q8CQ...

sops:
  kms:
    - arn: arn:aws:kms:ap-northeast-1:<アカウントID>:key/<KMSのID>
      created_at: '2017-12-19T11:02:39Z'
      enc: AQICA...
      aws_profile: ""
      
  ...
  
  # 暗号化時に使用したsopsのバージョン
  version: 3.7.0
```

また、以下のようなSecretがあるとする。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
type: Opaque
data:
  foo: {{ .Values.foo | b64enc }}
```

この時、```helm secrets```コマンドで```secrets```ファイルを指定すると、復号化した上で```.Values```に出力してくれる。ArgoCDが使用するsopsのバージョンは、暗号化時に使用したsopsのバージョン（```sops```キーの値）に合わせた方が良い。結果的に、base64方式でエンコードされ、マニフェストが作成される。

```bash
$ helm secrets template ./foo-chart -f secrets.yaml -f values.yaml

apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
type: Opaque
data:
  foo: Rjc5OVE4Q1E=...
```


<br>

### サブコマンド

#### ▼ dec

指定した```values```ファイルを復号化し、```.yaml.dec```ファイルに出力する。

> ℹ️ 参考：https://qiita.com/knqyf263/items/4bb1c961037d0ea55a62

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

指定した```values```ファイルを暗号化し、元の```values```ファイルを上書きする。

> ℹ️ 参考：https://qiita.com/knqyf263/items/4bb1c961037d0ea55a62

```bash
$ helm secrets enc <平文のvaluesファイル>

Encrypted ./values/secrets.yaml
```

```bash
$ cat ./values/secrets.yaml

# secrets.yamlファイル
db:
  user: *****
  password: *****

# sopsキーが追記される。
sops:
  ...
```

#### ▼ view

指定した```values```ファイルを復号化して取得する。

> ℹ️ 参考：https://qiita.com/knqyf263/items/4bb1c961037d0ea55a62

```bash
$ helm secrets view <暗号化されたvaluesファイル>

db:
  user: root
  password: password
```

<br>
