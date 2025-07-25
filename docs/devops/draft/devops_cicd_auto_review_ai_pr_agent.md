---
title: 【IT技術の知見】PR Agent＠自動レビューツール
description: PR Agent＠自動レビューツールの知見を記録しています。
---

# PR Agent＠自動レビューツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### GitLab

```yaml
workflow:
  rules:
    - if: $CI_COMMIT_TAG
    - if: $CI_COMMIT_BRANCH
    # もしworkflowのルールを設定している場合、merge_request_eventをルールの条件としないと、ワークフローが起動しない
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

stages:
  - build
  - test
  - pr_agent

pr_agent:
  stage: pr_agent
  image:
    name: pr-agent:latest
    entrypoint: [""]
  variables:
    # Cross-region-inferenceに対応するためにusを指定する
    # 対応不要の場合はap-northeast-1でもよい
    AWS_REGION_NAME: "us-east-1"
  before_script:
    # もしAWS Bedlockを使用する場合は、資格情報を取得する
  script:
    - cd /app
    - echo "Running PR Agent action step"
    - export MR_URL="$CI_MERGE_REQUEST_PROJECT_URL/merge_requests/$CI_MERGE_REQUEST_IID"
    - echo "MR_URL=$MR_URL"
    - export gitlab__url=$CI_SERVER_PROTOCOL://$CI_SERVER_FQDN
    - export gitlab__PERSONAL_ACCESS_TOKEN=$GITLAB_PERSONAL_ACCESS_TOKEN
    - export config__git_provider="gitlab"
    - python -m pr_agent.cli --pr_url="$MR_URL" describe
    - python -m pr_agent.cli --pr_url="$MR_URL" review
    - python -m pr_agent.cli --pr_url="$MR_URL" improve
  allow_failure: true
  rules:
    # merge_request_eventの時にJobを発火させないと、PR AgentはMRの情報を取得できずにエラーになってしまう
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

> - https://github.com/qodo-ai/pr-agent/blob/main/docs/docs/installation/gitlab.md

<br>

## 02. Webhook

### Webhookを使用したCI発火

PR上で`/<コマンド>`を実行することで、Webhookを介してPR-Agentを実行できる。

プッシュのたびにPR-Agentを実行させるとレビューへの修正負荷が高いため、PR-Agentの発火はWebhookで制御した方が良い。

<br>

### /describe

変更内容から、自動的にMRの種別や変更内容などをdescriptionに記載する。

### /review

変更したコードの問題点やセキュリティ的な脆弱性などをレビューし、PRにコメントする。

### /improve

コードの改善点をMRにコメントする。

### /ask <質問内容>

PR全体や特定の行について質問する。

### /config

現在のpr-agentの設定を出力する。

### /help

pr-agentの使い方を出力する。

<br>

## 03. configセクション

```toml
[config]
# メインで使用するmodel
model="bedrock/us.anthropic.claude-3-7-sonnet-20250219-v1:0"

# 処理に失敗した際のfallbackで使用するmodel
fallback_models=["bedrock/anthropic.claude-3-haiku-20240307-v1:0"]

# 言語設定
response_language="ja-JP"

# 0,1,2 大きい値を設定するとより詳細にログ出力する
verbosity_level=0
log_level="INFO"
```

> - https://github.com/qodo-ai/pr-agent/blob/main/pr_agent/settings/configuration.toml

<br>

## 04 github_appセクション

### handle_push_trigger

プッシュでPR-Agentが起動するフラグを設定する。

```toml
[github_app]
handle_push_trigger=false
```

<br>

## 05. pr_descriptionセクション

### extra_instructions

PRの説明欄に関するプロンプトを設定する。

```toml
[pr_description]
extra_instructions="""\
- impactレベルは「high」または「medium」のみを使用すること。「low」のimpactレベルを提案することは禁止である。
"""
```

> - https://github.com/qodo-ai/pr-agent/blob/main/pr_agent/settings/configuration.toml

<br>

## 06. pr_reviewerセクション

### extra_instructions

PRレビューに関するプロンプトを設定する。

```toml
[pr_reviewer]
extra_instructions="""\
- impactレベルは「high」または「medium」のみを使用すること。「low」のimpactレベルを提案することは禁止である。
"""
```

<br>

### require_score_review

PRスコア算出のフラグを設定する。

```toml
[pr_reviewer]
require_score_review=true
```

> - https://github.com/qodo-ai/pr-agent/blob/main/pr_agent/settings/configuration.toml

<br>

## 07. pr_code_suggestionsセクション

### extra_instructions

コード提案に関するプロンプトを設定する。

```toml
[pr_code_suggestions]
extra_instructions="""\
- impactレベルは「high」または「medium」のみを使用すること。「low」のimpactレベルを提案することは禁止である。
"""
```

<br>

### persistent_comment

レビューのたびに新しいコメントを追加するフラグを設定する

```toml
[pr_code_suggestions]
persistent_comment=false
```

> - https://github.com/qodo-ai/pr-agent/blob/main/pr_agent/settings/configuration.toml

<br>
