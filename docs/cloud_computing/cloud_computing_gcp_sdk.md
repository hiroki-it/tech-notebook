---
title: 【知見を記録するサイト】GCP SDK＠GCP
description: GCP SDK＠GCPの知見をまとめました。
---

# GCP SDK＠GCP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### auth

#### ▼ authとは

GCPアカウントの認証を行う。

#### ▼ login

GoogleアカウントGCPアカウントを連携する。コマンドを実行すると、Googleアカウントとの連携のため、Googleへのリダイレクトが発生する。

```bash
$ gcloud auth login
```

<br>

### config

#### ▼ config

GCP SDKの認証時のデフォルト値を設定する。

#### ▼ set

GCP SDKの特定の項目のデフォルト値を設定する。

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

GCP SDKの認証時のデフォルト値を対話方式で設定する。

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
