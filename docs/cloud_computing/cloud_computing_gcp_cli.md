---
title: 【IT技術の知見】GCP CLI＠GCP
description: GCP CLI＠GCPの知見を記録しています。
---

# GCP CLI＠GCP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. GCP CLIのセットアップ

### auth

#### ▼ authとは

GCPアカウントの認証を行う。

> ↪️ 参考：https://cloud.google.com/sdk/gcloud/reference/auth

#### ▼ application-default login

GCP CLIによるGCPリソースへのアクセスを認証するために使用する。

`~/.config/gcloud/application_default_credentials.json`ファイルを作成し、クレデンシャル情報を定義する。

また、これ使用してGCPにログインする。

`~/.config/gcloud/application_default_credentials.json`ファイルは`1`個のアカウントのクレデンシャル情報しか持てないため、アカウントを切り替える場合はファイルを再作成する必要がある。

```bash
$ gcloud auth application-default login
```

```yaml
# application_default_credentials.jsonファイル
{
  "client_id": "***.apps.googleusercontent.com",
  "client_secret": "***",
  "quota_project_id": "***",
  "refresh_token": "***",
  "type": "authorized_user",
}
```

> ↪️ 参考：https://christina04.hatenablog.com/entry/gcp-auth

#### ▼ login

GCP SDKによるGCPリソースへのアクセスを認証するために使用する。


```bash
$ gcloud auth login
```

> ↪️ 参考：https://christina04.hatenablog.com/entry/gcp-auth


#### ▼ login --update-adc

`gcloud auth application-default login`コマンドと`gcloud auth login`コマンドを同時に実行する。

これにより、GCP CLIのための認証情報 (`~/.config/gcloud/application_default_credentials.json`ファイル) とGCP SDKのための認証情報が更新される。

```bash
$ gcloud auth login --update-adc
```

> ↪️ 参考：https://blog.pokutuna.com/entry/application-default-credentials

<br>

### component

#### ▼ componentとは

`gcloud`コマンドのコンポーネントを管理する。

#### ▼ update

`gcloud`コマンドのコンポーネントをアップグレードする。

```bash
$ gcloud components update
```

#### ▼ list

`gcloud`コマンドのコンポーネントの一覧を取得する。

```bash
$ gcloud components list


Your current Google Cloud CLI version is: 386.0.0
The latest available version is: 400.0.0

┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                   Components                                                  │
├──────────────────┬──────────────────────────────────────────────────────┬──────────────────────────┬──────────┤
│      Status      │                         Name                         │            ID            │   Size   │
├──────────────────┼──────────────────────────────────────────────────────┼──────────────────────────┼──────────┤
│ Update Available │ BigQuery Command Line Tool                           │ bq                       │  1.6 MiB │
│ Update Available │ Cloud Storage Command Line Tool                      │ gsutil                   │ 15.5 MiB │

                                                       ...

│ Not Installed    │ kubectl-oidc                                         │ kubectl-oidc             │ 18.2 MiB │
│ Not Installed    │ pkg                                                  │ pkg                      │          │
└──────────────────┴──────────────────────────────────────────────────────┴──────────────────────────┴──────────┘
```

> ↪️ 参考：https://cloud.google.com/sdk/docs/components

<br>

### config

#### ▼ config

認証時のデフォルト値を設定する。

#### ▼ list

認証情報を取得する。

**＊実行例＊**

```bash
$ gcloud config list

[core]
account = hiroki.hasegawa
disable_usage_reporting = True

Your active configuration is: [default]
```

#### ▼ set

認証の特定の項目のデフォルト値を設定する。

**＊実行例＊**

```bash
$ gcloud config set project <プロジェクト名>

Updated property [core/project].
```

```bash
$ gcloud config set compute/region <リージョン名>

WARNING: Property validation for compute/region was skipped.
Updated property [compute/region].
```

<br>

### container clusters

#### ▼ container clustersとは

> ↪️ 参考：https://cloud.google.com/sdk/gcloud/reference/container/clusters

#### ▼ list

GKE Clusterの一覧を取得する。

> ↪️ 参考：https://cloud.google.com/kubernetes-engine/docs/how-to/managing-clusters#viewing_your_clusters

**＊実行例＊**

```bash
$ gcloud container clusters list

NAME               LOCATION         MASTER_VERSION   MASTER_IP  MACHINE_TYPE  NODE_VERSION    NUM_NODES  STATUS
foo-gke-cluster    asia-northeast1  1.22.0-gke  *.*.*.*         e2-medium     1.22.0-gke      3          RUNNING
```

<br>

### container node-pools

#### ▼ container node-poolsとは

記入中...

> ↪️ 参考：https://cloud.google.com/sdk/gcloud/reference/container/node-pools/describe

#### ▼ describe

GKE Node Poolの情報を取得する。

アップグレードの手法を確認することもできる。


**＊実行例＊**

```bash
$ gcloud container node-pools describe foo-node-pool --cluster=foo-anthos-cluster

...

upgradeSettings:
  blueGreenSettings:
    nodePoolSoakDuration: 1800s
    standardRolloutPolicy:
      batchNodeCount: 1
      batchSoakDuration: 10s
  strategy: BLUE_GREEN # ブルー/グリーンアップグレード
```

> ↪️ 参考：https://cloud.google.com/kubernetes-engine/docs/how-to/node-pool-upgrade-strategies#inspect-upgrade-settings


#### ▼ update

GKE Node Poolの設定を変更する。

**＊実行例＊**

ローリング方式 (サージ方式) のアップグレードを有効化する。

```bash
$ gcloud container node-pools update foo-node-pool \
    --cluster=foo-anthos-cluster \
    --enable-surge-upgrade
```

ローリング方式時に新しく追加できる最大インスタンス数と、削除できる最大インスタンス数を設定する。

```bash
$ gcloud container node-pools update foo-node-pool \
    --cluster=foo-anthos-cluster \
    --max-surge-upgrade=2 \
    --max-unavailable-upgrade=1
```

> ↪️ 参考：https://medium.com/google-cloud-jp/gke-upgrade-strategy-8568f450f9d0

<br>

### init

#### ▼ initとは

認証時のデフォルト値を対話方式で設定する。

**＊実行例＊**

```bash
$ gcloud init

Welcome! This command will take you through the configuration of gcloud.

Settings from your current configuration [default] are:
core:
  account: hiroki.hasegawa
  disable_usage_reporting: 'True'
  project: foo-project

Pick configuration to use:
 [1] Re-initialize this configuration [default] with new settings
 [2] Create a new configuration
Please enter your numeric choice:  1 # 再設定か新しいアカウントの設定かを選択する。

Your current configuration has been set to: [default]

You can skip diagnostics next time by using the following flag:
  gcloud init --skip-diagnostics

Network diagnostic detects and fixes local network connection issues.
Checking network connection...done.
Reachability Check passed.
Network diagnostic passed (1/1 checks passed).

Choose the account you would like to use to perform operations for this configuration:
[1] hiroki.hasegawa
[2] Log in with a new account
Please enter your numeric choice:  1 # デフォルトのアカウントを設定する。

You are logged in as: [hiroki.hasegawa].

Pick cloud project to use:
[1] foo-project
[2] bar-project
[3] baz-project

Please enter numeric choice or text value (must exactly match list item): 3 # デフォルトのプロジェクト名を設定する。
```

<br>

### project

#### ▼ projectとは

認可スコープの範囲内になるプロジェクトの一覧を取得する。

**＊実行例＊**

```bash
$ gcloud projects list

PROJECT_ID   NAME      PROJECT_NUMBER
foo-stg      foo-stg   *****
foo-prd      foo-prd   *****
```

<br>

## 02. GCPリソース別のプラクティス

### GCS

#### ▼ cp

指定したパスにあるオブジェクトを、ローカルマシンにコピーする。

```bash
$ gcloud storage cp gs://<GCS名>/<オブジェクトのファイルパス> <ローカルマシンのファイルパス>
```

> ↪️ 参考：https://cloud.google.com/sdk/gcloud/reference/storage/cp

ディレクトリごとコピーする場合は、`--recursive`オプションを使用する。

```bash
$ gcloud storage cp --recursive gs://<GCS名>/<オブジェクトのファイルパス> <ローカルマシンのファイルパス>
```

<br>

### kms

#### ▼ describeとは

KMSの暗号化キーを取得する。

```bash
$ gcloud kms keys describe <KMSのリソースID>
```

```bash
$ gcloud kms keys describe projects/foo-project/locations/global/keyRings/sops/cryptoKeys/sops-key
```

<br>
