---
title: 【IT技術の知見】コマンド＠GCP
description: コマンド＠GCPの知見を記録しています。
---

# コマンド＠GCP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### auth

#### ▼ authとは

GCPアカウントの認証を行う。

#### ▼ application-default login

GCP CLIによるGCPリソースへのアクセスを認証するために使用する。```~/.config/gcloud/application_default_credentials.json```ファイルを作成し、クレデンシャル情報を定義する。また、これ使用してGCPにログインする。```~/.config/gcloud/application_default_credentials.json```ファイルは一つのアカウントのクレデンシャル情報しか持てないため、アカウントを切り替える場合はファイルを再作成する必要がある。

ℹ️ 参考：https://christina04.hatenablog.com/entry/gcp-auth

```bash
$ gcloud auth application-default login
```

```bash
# application_default_credentials.jsonファイル
{
  "client_id": "***.apps.googleusercontent.com",
  "client_secret": "***",
  "quota_project_id": "***",
  "refresh_token": "***",
  "type": "authorized_user"
}
```

#### ▼ login

GCP SDKによるGCPリソースへのアクセスを認証するために使用する。

ℹ️ 参考：https://christina04.hatenablog.com/entry/gcp-auth

```bash
$ gcloud auth login
```

<br>

### config

#### ▼ config

認証時のデフォルト値を設定する。

#### ▼ set

認証の特定の項目のデフォルト値を設定する。

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

### init

#### ▼ initとは

認証時のデフォルト値を対話方式で設定する。

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
