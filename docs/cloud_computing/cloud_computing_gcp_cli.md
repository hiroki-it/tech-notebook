---
title: 【IT技術の知見】GCP CLI＠GCPリソース
description: GCP CLI＠GCPリソースの知見を記録しています。
---

# GCP CLI＠GCPリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. GCP CLIのセットアップ

### auth

#### ▼ authとは

プリンシパル (例：ユーザー、サービスアカウント、グループ、ドメイン、KubernetesのServiceAccount) の認証を行う。

> ↪️：https://cloud.google.com/sdk/gcloud/reference/auth

#### ▼ activate-service-account

指定したServiceAccountでログインする。

認証情報ファイルは使用後に削除した方が良いらしい。

```bash
$ gcloud auth activate-service-account foo1-serviceaccount \
    --key-file foo1-credentials.json \

$ gcloud auth list

Credentialed Accounts
ACTIVE  ACCOUNT
        foo1-serviceaccount@foo-project.iam.gserviceaccount.com
*       foo2-serviceaccount@foo-project.iam.gserviceaccount.com
```

```bash
$ gcloud auth activate-service-account bar-serviceaccount \
    --key-file bar-credentials.json \
    --project bar-project

$ gcloud auth list

Credentialed Accounts
ACTIVE  ACCOUNT
        foo1-serviceaccount@foo-project.iam.gserviceaccount.com
        foo2-serviceaccount@foo-project.iam.gserviceaccount.com
*       bar-serviceaccount@bar-project.iam.gserviceaccount.com
```

> ↪️：
>
> - https://cloud.google.com/sdk/gcloud/reference/auth/activate-service-account
> - https://qiita.com/zaru/items/a419f306385f240e4fe6#%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%82%A2%E3%82%AB%E3%82%A6%E3%83%B3%E3%83%88%E8%AA%8D%E8%A8%BC
> - https://stackoverflow.com/a/52387709

#### ▼ application-default login

GCP CLIによるGCPリソースへのアクセスを認証するために使用する。

`~/.config/gcloud/application_default_credentials.json`ファイルを作成し、認証情報を定義する。

また、これ使用してGCPにログインする。

`~/.config/gcloud/application_default_credentials.json`ファイルは`1`個のプリンシパルの認証情報しか持てないため、プリンシパルを切り替える場合はファイルを再作成する必要がある。

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

> ↪️：https://christina04.hatenablog.com/entry/gcp-auth

#### ▼ list

切り替え可能なプリンシパルの一覧を取得する。

```bash
$ gcloud auth list

Credentialed Accounts
ACTIVE  ACCOUNT
        example1@gmail.com
*       example2@gmail.com
```

#### ▼ login

IAMユーザーを認証する。

GCP SDKによるGCPリソースへのアクセスを認証するために使用する。

```bash
$ gcloud auth login
```

> ↪️：https://christina04.hatenablog.com/entry/gcp-auth

#### ▼ login --update-adc

`gcloud auth application-default login`コマンドと`gcloud auth login`コマンドを同時に実行する。

これにより、GCP CLIのための認証情報 (`~/.config/gcloud/application_default_credentials.json`ファイル) とGCP SDKのための認証情報が更新される。

```bash
$ gcloud auth login --update-adc
```

> ↪️：https://blog.pokutuna.com/entry/application-default-credentials

#### ▼ print-access-token

認証のトークンを取得する。

```bash
$ gcloud auth print-access-token
```

環境変数に設定して使用すると良い。

```bash
$ export GCP_AUTH_TOKEN=`gcloud auth print-access-token`
```

#### ▼ revoke

Configurationに設定されているプリンシパルを削除する。

```bash
$ gcloud auth list

Credentialed Accounts
ACTIVE  ACCOUNT
        foo1-serviceaccount@foo-project.iam.gserviceaccount.com
        foo2-serviceaccount@foo-project.iam.gserviceaccount.com
*       bar-serviceaccount@bar-project.iam.gserviceaccount.com

# foo2-serviceaccount@foo-project.iam.gserviceaccount.com を削除する
$ gcloud auth revoke foo2-serviceaccount@foo-project.iam.gserviceaccount.com
```

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

> ↪️：https://cloud.google.com/sdk/docs/components

<br>

### config configuration

#### ▼ config configurationとは

`gcloud`コマンドのConfigurationを操作する。

#### ▼ activate

複数のConfigurationがある場合に、これらを切り替える。

```bash
$ gcloud config configurations activate foo

Activated [foo].
```

#### ▼ create

Configurationを新しく作成する。

```bash
$ gcloud config configurations create bar

Created [bar].
Activated [bar].


# アクティブなConfigurationに新しいプロジェクトが設定されたことを確認できる。
$ gcloud config configurations list

NAME  IS_ACTIVE  ACCOUNT             PROJECT      COMPUTE_DEFAULT_ZONE  COMPUTE_DEFAULT_REGION
foo   False      example@gmail.com   foo-project
bar   True
```

> ↪️：https://cloud.google.com/sdk/gcloud/reference/config/configurations/create

#### ▼ list

全てのConfigurationと、アクティブプリンシパルとを一覧で取得する。

```bash
$ gcloud config configurations list

NAME  IS_ACTIVE  ACCOUNT             PROJECT      COMPUTE_DEFAULT_ZONE  COMPUTE_DEFAULT_REGION
foo   False      example@gmail.com   foo-project
bar   True       example@gmail.com   bar-project
```

#### ▼ rename

現在、非アクティブになっているConfigurationの特定の名前を変更する。

```bash
# barというConfigurationをアクティブにする
$ gcloud config configurations activate bar


# fooというConfigurationが非アクティブになっていることを確認する
$ gcloud config configurations list

NAME  IS_ACTIVE  ACCOUNT             PROJECT       COMPUTE_DEFAULT_ZONE  COMPUTE_DEFAULT_REGION
foo   False      example@gmail.com   foo-project   asia-northeast1-a
bar   True       example@gmail.com   bar-project   asia-northeast1-a


# fooというConfigurationの名前をfoo-fooに変更する
$ gcloud config configurations rename foo --new-name=foo-foo


# Configurationの名前が変わっている
NAME      IS_ACTIVE  ACCOUNT             PROJECT       COMPUTE_DEFAULT_ZONE  COMPUTE_DEFAULT_REGION
foo-foo   False      example@gmail.com   foo-project   asia-northeast1-a
bar       True       example@gmail.com   bar-project   asia-northeast1-a


# Configurationを切り替える
$ gcloud config configurations activate foo-foo
```

#### ▼ set

認証の特定の項目のデフォルト値を設定する。

**＊実行例＊**

```bash
# Configurationを新しく作成する
$ gcloud config configurations create foo


# アクティブなConfiguration上にプリンシパルを設定する。
$ gcloud config set core/account example@gmail.com

Updated property [core/project].


# アクティブなConfiguration上にプロジェクト名を設定する
$ gcloud config set core/project foo-project

Updated property [core/project].


# アクティブなConfiguration上にリージョンを設定する。
$ gcloud config set compute/region asia-northeast1-a

WARNING: Property validation for compute/region was skipped.
Updated property [compute/region].


# アクティブなConfigurationに一通り値が設定されたことを確認する。
$ gcloud config configurations list

NAME  IS_ACTIVE  ACCOUNT             PROJECT       COMPUTE_DEFAULT_ZONE  COMPUTE_DEFAULT_REGION
foo   False      example@gmail.com   foo-project   asia-northeast1-a
bar   True       example@gmail.com   bar-project   asia-northeast1-a
```

> ↪️：https://qiita.com/sonots/items/906798c408132e26b41c

<br>

### config list

#### ▼ list

現在の認証情報を取得する。

**＊実行例＊**

```bash
$ gcloud config list

[core]
account = example@gmail.com
disable_usage_reporting = True
project = foo-project

# 現在アクティブになっているConfiguration
Your active configuration is: [foo]
```

### container clusters

#### ▼ container clustersとは

> ↪️：https://cloud.google.com/sdk/gcloud/reference/container/clusters

#### ▼ list

GKE Clusterの一覧を取得する。

**＊実行例＊**

```bash
$ gcloud container clusters list

NAME               LOCATION         MASTER_VERSION   MASTER_IP    MACHINE_TYPE   NODE_VERSION    NUM_NODES   STATUS
foo-gke-cluster    asia-northeast1  1.22.0-gke       *.*.*.*      e2-medium      1.22.0-gke      3           RUNNING
```

> ↪️：https://cloud.google.com/kubernetes-engine/docs/how-to/managing-clusters#viewing_your_clusters

<br>

### container node-pools

#### ▼ container node-poolsとは

記入中...

> ↪️：https://cloud.google.com/sdk/gcloud/reference/container/node-pools/describe

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

> ↪️：https://cloud.google.com/kubernetes-engine/docs/how-to/node-pool-upgrade-strategies#inspect-upgrade-settings

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

> ↪️：https://medium.com/google-cloud-jp/gke-upgrade-strategy-8568f450f9d0

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
Please enter your numeric choice:  1 # 再設定か新しいプリンシパルの設定かを選択する。

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
Please enter your numeric choice:  1 # デフォルトのプリンシパルを設定する。

You are logged in as: [hiroki.hasegawa].

Pick cloud project to use:
[1] foo-project
[2] bar-project
[3] baz-project

Please enter numeric choice or text value (must exactly match list item): 3 # デフォルトのプロジェクト名を設定する。
```

<br>

### info

#### ▼ infoとは

現在使用している設定ファイルの場所を取得する。

```bash
$ gcloud info

# 認証情報ファイル
User Config Directory: /root/.config/gcloud]

...
```

> ↪️：https://cloud.google.com/sdk/docs/authorizing?hl=ja#find-cred-files

<br>

### project

#### ▼ projectとは

記入中...

#### ▼ list

現在のプリンシパルが使用できるプロジェクトの一覧を取得する。

注意点として、全てのプロジェクトではない。

**＊実行例＊**

```bash
$ gcloud projects list

PROJECT_ID         NAME          PROJECT_NUMBER
foo-project-***    foo-project   *****
bar-project-***    bar-project   *****
```

> ↪️：https://cloud.google.com/sdk/gcloud/reference/projects/list

<br>

## 02. GCPリソース別のプラクティス

### CloudLogging

#### ▼ read

CloudLoggingからログを読み出す。

```bash
$ gcloud logging read 'resource.labels.container_name="foo-container"' --limit 1
```

### GCS

#### ▼ cp

指定したパスにあるオブジェクトを、ローカルマシンにコピーする。

```bash
$ gcloud storage cp gs://<GCS名>/<オブジェクトのファイルパス> <ローカルマシンのファイルパス>
```

> ↪️：https://cloud.google.com/sdk/gcloud/reference/storage/cp

ディレクトリごとコピーする場合は、`--recursive`オプションを使用する。

```bash
$ gcloud storage cp --recursive gs://<GCS名>/<オブジェクトのファイルパス> <ローカルマシンのファイルパス>
```

<br>

### KMS

#### ▼ describeとは

KMSの暗号化キーを取得する。

```bash
$ gcloud kms keys describe <KMSのリソースID>
```

```bash
$ gcloud kms keys describe projects/foo-project/locations/global/keyRings/sops/cryptoKeys/sops-key
```

<br>
