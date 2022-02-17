---
title: 【知見を記録するサイト】datadogの設定ファイル＠可観測性
description: datadogの設定ファイル＠可観測性の知見をまとめました．
---

# datadogの設定ファイル＠可観測性

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ```/etc/datadog-agent/datadog.yaml```ファイル

### ```datadog.yaml```ファイルとは

datadogエージェントを設定する．Datadogにデータを送信するためには，アプリケーションにdatadogエージェントをインストールする必要がある．用いているOSやIaCツールごとに，インストール方法が異なる．datadogエージェントをインストールすると，```datadog.yaml.example```ファイルが生成されるため，これをコピーして作成する．発行されたAPIキーを追記する必要がある．

参考：

- https://app.datadoghq.com/account/settings#agent
- https://docs.datadoghq.com/getting_started/agent/#configuration
- https://docs.datadoghq.com/agent/guide/agent-configuration-files/
- https://github.com/DataDog/datadog-agent/blob/main/pkg/config/config_template.yaml

ちなみに，コンテナでdatadogエージェントを使用する場合は，環境変数から値を設定できる．

参考：https://docs.datadoghq.com/getting_started/agent/#configuration

<br>

### api_key

DatadogのAPIキーを設定する．

```yaml
#########################
## Basic Configuration ##
#########################

## @param api_key - string - required
## @env DD_API_KEY - string - required
## The Datadog API key to associate your Agent's data with your organization.
## Create a new API key here: https://app.datadoghq.com/account/settings
#
api_key: <APIキー>

# 〜 中略 〜
```

<br>

### logs_enabled

ログの収集はデフォルトで無効化されているため，有効化する必要がある．

```yaml
# 〜 中略 〜

##################################
## Log collection Configuration ##
##################################

## @param logs_enabled - boolean - optional - default: false
## @env DD_LOGS_ENABLED - boolean - optional - default: false
## Enable Datadog Agent log collection by setting logs_enabled to true.
#
logs_enabled: true

# 〜 中略 〜
```

