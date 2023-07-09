---
title: 【IT技術の知見】コマンド＠Helm
description: コマンド＠Helmの知見を記録しています。
---

# コマンド＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `helm`コマンド

### create

#### ▼ createとは

指定したパスにチャートのサンプルファイルを作成する。

```bash
$ helm create <チャートへのパス>
```

> - https://helm.sh/docs/helm/helm_create/

<br>

### destroy

#### ▼ destroyとは

指定したHelmリリースでインストールされたチャートを削除する。

```bash
$ helm destroy <Helmリリース名>
```

Helmは、CRDを含むチャートのインストールはサポートしているが、アップグレードとアンインストールをサポートしていない。

そのため、`helm destroy`コマンド時にはCRDを削除しない仕様になっている。

CRDは手動で削除する必要がある。

```bash
$ kubectl get crd

$ kubectl delete crd <CRD名>
```

> - https://github.com/helm/helm/issues/7418#issuecomment-581849772

<br>

### dependency

#### ▼ build

`requirements.yaml`ファイルに定義された依存対象のサブチャートを、`chart`ディレクトリ内にダウンロードする。

また、`Chart.lock`ファイルを作成する。

```bash
$ helm dependency build

Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "foo" chart repository
Update Complete. ⎈Happy Helming!⎈
Saving 1 charts
```

> - https://qiita.com/thinksphere/items/5f3e918015cf4e63a0bc#helm-dependency-build%E3%81%AB%E3%82%88%E3%82%8B%E4%BE%9D%E5%AD%98%E3%83%81%E3%83%A3%E3%83%BC%E3%83%88%E3%81%AE%E3%83%80%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%89
> - https://selfnote.work/20211129/programming/learning-helm-6/#Dependencies

<br>

### env

#### ▼ env

Helmの環境変数を表示する。

```bash
$ helm env

# Helmのバイナリファイルの場所
HELM_BIN="/usr/local/bin/helm"
# CRDのパフォーマンス制限
HELM_BURST_LIMIT="100"
# Helmのキャッシュファイルの場所
HELM_CACHE_HOME="/.cache/helm"
HELM_CONFIG_HOME="/.config/helm"
HELM_DATA_HOME="/.local/share/helm"
HELM_DEBUG="false"
HELM_KUBEAPISERVER=""
HELM_KUBEASGROUPS=""
HELM_KUBEASUSER=""
HELM_KUBECAFILE=""
HELM_KUBECONTEXT=""
HELM_KUBEINSECURE_SKIP_TLS_VERIFY="false"
HELM_KUBETOKEN=""
HELM_MAX_HISTORY="10"
HELM_NAMESPACE="default"
# Helmのプラグインの場所
HELM_PLUGINS="/.config/plugins"
# イメージ/チャートリポジトリの情報
HELM_REGISTRY_CONFIG="/.config/helm/registry.json"
HELM_REPOSITORY_CACHE="/.config/helm/repository"
HELM_REPOSITORY_CONFIG="/.config/helm/repositories.yaml"
```

> - https://helm.sh/docs/helm/helm/
> - https://stackoverflow.com/questions/62924278/where-are-helm-charts-stored-locally/66416122#66416122

### get

#### ▼ getとは

特定のHelmリリースに含まれる`helm template`コマンドの結果を取得する。

```bash
$ helm get <Helmリリース名>
```

> - https://helm.sh/docs/helm/helm_get_manifest/

<br>

### history

#### ▼ historyとは

指定したHelmリリースの履歴を取得する。

```bash
$ helm history <Helmリリース名>

REVISION         UPDATED                    STATUS     CHART               APP VERSION               DESCRIPTION
<Helmリリース名>   Wed Jan 01 12:00:00 2020   SUSPENDED  foo-<バージョンタグ>   <バージョンタグ>          Initial install
<Helmリリース名>   Wed Jan 01 12:00:00 2020   SUSPENDED  foo-1.1.0  1.1.0    Rolled back to 1
<Helmリリース名>   Wed Jan 01 12:00:00 2020   DEPLOYED   foo-1.0.0  1.0.0    Upgraded successfully
```

> - https://helm.sh/docs/helm/helm_history/

<br>

### install

#### ▼ installとは

チャートなどを指定し、Kubernetesリソースとして作成する。

チャートへのパスを指定する以外にも、指定方法には種類がある。

```bash
$ helm install <Helmリリース名> <チャートへのパス>
```

| パラメーター                                                            | 例                                                          | 補足                                                                                                                                                          |
| ----------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| チャートへのパス                                                        | `./foo-chart`                                               |                                                                                                                                                               |
| `<チャートレジストリ名>/<チャートリポジトリ名>`                         | `foo-registry/foo-repository`                               | - https://zenn.dev/mikutas/articles/2ab146fa1ea35b                                                                                                            |
| チャートリポジトリURL                                                   | `https://example.com/foo-chart`                             |                                                                                                                                                               |
| `<チャートリポジトリURL> <チャートレジストリ名>/<チャートリポジトリ名>` | `https://example.com/foo-chart foo-registry/foo-repository` |                                                                                                                                                               |
| チャートアーカイブへのパス                                              | `./foo-chart-<バージョンタグ>.tgz`                          | `values`ファイルを使用する場合、`values`ファイルはチャートアーカイブ (`.tgz`形式ファイル) の外にある必要がある。<br>- https://helm.sh/docs/helm/helm_install/ |

> - https://helm.sh/docs/helm/helm_install/

#### ▼ --disable-openapi-validation

チャートをインストールする時に、OpenAPIを使用したマニフェストの静的解析を無効化する。

特に、CRDのファイルサイズが大きすぎてインストールできない場合に使用する。

```bash
$ helm install --disable-openapi-validation <Helmリリース名> <チャートへのパス>
```

#### ▼ --dry-run

Kubernetesに作成されるリソースのマニフェストを取得する。

作成する前に、チャートの設定が正しいか否かを確認できる。

```bash
$ helm install --dry-run <Helmリリース名> <チャートへのパス>

# Source: prd/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment

...
```

#### ▼ -f

指定した`values`ファイル使用して、`helm install`コマンドを実行する。

チャートのルートパスに『`values.yaml`』の名前でファイルが存在している場合、自動的に読み込まれるため、このオプションは不要である。

これ以外の名前の場合は、オプションによる`values`ファイルの指定が必要になる。

```bash
$ helm install <Helmリリース名> <チャートへのパス> -f <valuesファイルへのパス>
```

> - https://helm.sh/docs/helm/helm_install/#options

#### ▼ kube-context

`helm`コマンドの向き先を指定して、`helm install`コマンドを実行する。

```bash
# Minikubeの場合
$ helm install <Helmリリース名> <チャートリポジトリ名> --kube-context minikube
```

```bash
# AWSの場合
$ helm install <Helmリリース名> <チャートリポジトリ名> --kube-context <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/prd-foo-eks-cluster
```

<br>

### lint

#### ▼ lintとは

Helmの構文をバリデーションを実行する。

あくまでHelmの構文マニフェスト自体の記法の誤りは検出してくれないことに注意する。

```bash
$ helm lint <チャートへのパス>

==> Linting kubernetes
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

1 chart(s) linted, 0 chart(s) failed
```

> - https://helm.sh/docs/helm/helm_lint/
> - https://redhat-cop.github.io/ci/linting-testing-helm-charts.html

#### ▼ -f

指定した`values`ファイル使用して、`helm lint`コマンドを実行する。

```bash
$ helm lint <チャートへのパス> -f <valuesファイルへのパス>

==> Linting kubernetes
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

1 chart(s) linted, 0 chart(s) failed
```

複数のチャートに対して、同じ`values`ファイルを渡すこともできる。

```bash
$ helm lint <チャートへのパス> -f <valuesファイルへのパス>

==> Linting <チャート>
[INFO] Chart.yaml: icon is recommended
[INFO] values.yaml: file does not exist

5 chart(s) linted, 0 chart(s) failed
```

#### ▼ --strict

`values`ファイルの値がHelmテンプレートで使用されていない場合に、これを警告する。

執筆時点 (2023/05/26) でまだリリースされていない。

```bash
$ helm lint --strict
```

> - https://github.com/helm/helm/pull/11760

<br>

### list

#### ▼ listとは

Helmリリースの一覧を取得する。

チャートは、バージョンによって中身の`.yaml`ファイルに差があるため、ここでチャートのバージョンを確認すると良い。

```bash
$ helm list

NAME         VERSION   UPDATED                   STATUS    CHART
<Helmリリース名>   1         Wed Jan 01 12:00:00 2020  DEPLOYED  foo-chart-<バージョンタグ> # <-- チャートのバージョンがわかる。
```

> - https://helm.sh/docs/helm/helm_list/

<br>

### package

#### ▼ packageとは

チャートからチャートアーカイブ (`.tgz`形式ファイル) を作成する。

または、すでにアーカイブが存在する場合は更新する。

アーカイブ名にはバージョンが設定される。

複数のチャートを指定できる。

```bash
$ helm package <fooチャートへのパス> <barチャートへのパス> <bazチャートへのパス>

Successfully packaged chart and saved it to: /foo-<バージョンタグ>.tgz
```

> - https://helm.sh/docs/helm/helm_package/

#### ▼ -d

チャートアーカイブ (`.tgz`形式ファイル) の作成先のディレクトリを指定しつつ、`helm package`コマンドを実行する。

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

指定したチャートリポジトリからチャートをチャートアーカイブ (`.tgz`形式ファイル) でプルする。

チャートアーカイブは、チャートに解凍した上で使用した方がよい。

#### ▼ -d

チャートのプル先のディレクトリを指定して、`helm pull`コマンドを実行する。

```bash
$ helm pull <チャートリポジトリURL> -d <プル先のディレクトリ>
```

OCIリポジトリからもプルできる。

```bash
# AWSの場合
$ helm pull oci://<AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/<チャート名>
```

> - https://helm.sh/blog/storing-charts-in-oci/

#### ▼ --version

チャートのバージョンを指定して、`helm pull`コマンドを実行する。

```bash
$ helm pull <チャートリポジトリURL> --version <バージョンタグ>
```

<br>

### push

#### ▼ pushとは

チャートリポジトリにチャートをプッシュする。

プッシュする前にチャートをチャートアーカイブ (`.tgz`形式ファイル) に圧縮しておく必要がある。

```bash
$ helm push <チャートアーカイブへのパス> <チャートリポジトリURL>
```

```bash
# AWSの場合
$ helm push <チャートアーカイブへのパス> oci://<AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com
```

<br>

### registry

#### ▼ registryとは

チャートリポジトリを操作する。

#### ▼ login

チャートリポジトリにログインする。

```bash
$ <チャートリポジトリのプロバイダーによる> | helm registry login \
    --username <ユーザー名> \
    --password-stdin \
    <チャートリポジトリ名>
```

```bash
# AWSの場合
$ aws ecr get-login-password --region ap-northeast-1 | helm registry login \
    --username AWS \
    --password-stdin \
    <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com
```

<br>

### repo

#### ▼ repoとは

チャートリポジトリを操作する。

#### ▼ add

`helm`コマンドの実行環境にチャートリポジトリを登録する。

```bash
$ helm repo add <チャートリポジトリ名> <チャートリポジトリURL>

"<チャート名>" has been added to your repositories
```

登録していないチャートに`helm`コマンドでアクセスしようとするとエラーになってしまう。

```bash
$ helm show all <チャートリポジトリ名>

Error: failed to download "<チャートリポジトリ名>"
```

> - https://knowledge.sakura.ad.jp/23603/

#### ▼ index

チャートリポジトリのメタデータが設定された`index.yaml`ファイルを作成する。

```bash
$ helm repo index <チャートへのパス>
```

**＊例＊**

```bash
$ helm repo index ./foo-chart
```

#### ▼ list

事前に`helm repo add`コマンドで追加しておいたチャートリポジトリの一覧を取得する。

```bash
$ helm repo list

NAME                 URL
<チャートリポジトリ名>   https://example.com/charts
```

#### ▼ remove

事前に`helm repo add`コマンドで追加しておいたチャートリポジトリを削除する。

```bash
$ helm repo remove <チャート名>

"<チャートリポジトリ名>" has been removed from your repositories
```

**＊例＊**

```bash
$ helm repo remove foo-chart
```

#### ▼ update

事前に`helm repo add`コマンドで追加しておいたチャートリポジトリの情報を更新する。

チャートを特定のバージョンにアップグレードする前にリポジトリの情報を更新しておく必要がある。

```bash
$ helm repo update <チャートリポジトリ名>

Hang tight while we grab the latest from your chart repositories...
...
Update Complete. ⎈Happy Helming!⎈
```

> - https://helm.sh/docs/intro/using_helm/#helm-repo-working-with-repositories

<br>

### search

#### ▼ searchとは

事前に`helm repo add`コマンドで追加しておいたチャートリポジトリを検索する。

> - https://helm.sh/docs/intro/using_helm/#helm-search-finding-charts

#### ▼ hub

チャートリポジトリをキーワードで検索する。

```bash
$ helm search hub <キーワード>

URL               CHART VERSION      APP VERSION                       DESCRIPTION                                                   https://artifacthub.io/example.com   <バージョンタグ>             <バージョンタグ>                            This is foo chart
<OCIリポジトリURL>  <チャートバージョン>  <アプリケーションのHelmリリースバージョン>  <説明文>
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

チャートの`Chart.yaml`ファイルを取得する。

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

チャートに渡せるパラメーターを`values`ファイルとして取得する。

`values`ファイル本体は、チャートリポジトリで参照できる。

```bash
$ helm show values <チャート名>

# valuesファイルが表示される。
```

```bash
$ helm show values foo-chart
```

> - https://helm.sh/docs/intro/using_helm/#customizing-the-chart-before-installing

<br>

### template

#### ▼ templateとは

Kubernetesに作成されるリソースのマニフェストを出力する。

`.yaml`ファイルにリダイレクトするようにすると良い。

```bash
# チャート名をreleasesとしている場合
$ helm template . -f values.yaml >| releases.yaml
```

#### ▼ -f

指定した`values`ファイル使用して、`helm template`コマンドを実行する。

```bash
$ helm template <チャートへのパス> -f <valuesファイルへのパス> >| <出力先ファイル>
```

**＊例＊**

```bash
$ helm template ./foo-chart -f ./values.yaml >| release.yaml
```

#### ▼ -set

デフォルト値を上書きし、`helm template`コマンドを実行する。

マニフェストの暗号化ツール (例：SOPS) を使用している場合に、暗号化キーを使用せずに機密な変数のテスト値をSecretに出力する場合に使うと良い。

また、CI上でマニフェストの静的解析を実行したい場合に、CIの実行環境に暗号化キーの使用許可を付与することなく、マニフェストを展開できるようになる。

```bash
# 暗号化ツールを使用せずにSecretを作成する
$ helm template <チャートへのパス> -f <valuesファイルへのパス> -set user.password=test >| <出力先ファイル>
```

```yaml
# valuesファイル
user:
  password: ***** # 上書きされる
```

#### ▼ --include-crds

CRDを含めて、マニフェストを出力する。

```bash
$ helm template ./foo-chart -f ./values.yaml --include-crds >| release.yaml
```

#### ▼ --show-only

特定のディレクトリのテンプレートを出力する。

```bash
$ helm template ./foo-chart -f ./values.yaml --show-only ./foo-chart/templates/bar
```

> - https://stackoverflow.com/a/63159075

<br>

### uninstall

#### ▼ uninstallとは

Helmリリースを指定し、そのHelmリリースでインストールされたKubernetesリソースを削除する。

```bash
$ helm uninstall <Helmリリース名>
```

**＊例＊**

```bash
$ helm uninstall foo-release
```

> - https://helm.sh/docs/helm/helm_uninstall/

<br>

### upgrade

#### ▼ upgradeとは

指定したバージョンのチャートを使用して、Helmリリースをアップグレードする。

Helmは、CRDを含むチャートのインストールはサポートしているが、アップグレードとアンインストールをサポートしていない。

そのため、`helm upgrade`コマンド時にはCRDのインストールを実行する仕様になっている。

> - https://helm.sh/docs/intro/using_helm/#helm-upgrade-and-helm-rollback-upgrading-a-release-and-recovering-on-failure

#### ▼ --atomic

`helm upgrade`コマンドが正常に完了しなかった場合に、自動的にロールバックする。

```bash
$ helm upgrade --atomic <Helmリリース名> <チャートへのパス> -f <valuesファイルへのパス>
```

**＊例＊**

```bash
$ helm template --atomic ./foo-chart -f ./values.yaml >| release.yaml
```

#### ▼ --install

新しいリビジョン番号を作成し、インストール済のHelmリリースをアップグレードする。

```bash
$ helm upgrade --install <Helmリリース名> <チャートへのパス> -f <valuesファイルへのパス>

Release "<Helmリリース名>" has been upgraded. Happy Helming!
NAME: <Helmリリース名>
LAST DEPLOYED: Sat Jan 1 12:00:00 2022
NAMESPACE: default
STATUS: deployed
REVISION: 3 # <---- リビジョン番号が増えていく
TEST SUITE: None
```

#### ▼ --skip-crds

`install`オプションを有効化した上で、`--skip-crds`オプションを有効化する。

これにより、`helm upgrade`コマンド時にCRDのインストールをスキップし、非CRDのみをインストールできる。

```bash
$ helm upgrade --skip-crds --install <Helmリリース名> <チャートへのパス> -f <valuesファイルへのパス>
```

**＊例＊**

`helm upgrade`コマンド時に、CRDの作成をスキップし、非CRDのみをインストールする。

```bash
$ helm upgrade --skip-crds --install foo-release ./foo-chart -f ./values.yaml >| release.yaml
```

> - https://helm.sh/docs/helm/helm_upgrade/

#### ▼ --wait

作成したPodがReady状態になるまで、`helm upgrade`コマンドの完了を待機する。

```bash
$ helm upgrade --wait <Helmリリース名> <チャートへのパス> -f <valuesファイルへのパス>
```

**＊例＊**

```bash
$ helm upgrade --wait foo-release ./foo-chart -f ./values.yaml
```

<br>
