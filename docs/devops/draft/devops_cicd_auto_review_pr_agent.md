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
stages:
  - build
  - test
  # すべてのステージの後にPR Agentを実行する
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
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

<br>

## 02. configセクション

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

## 03. pr_descriptionセクション

```toml
[pr_description]
# extra_instructions="""\
# ここにカスタムプロンプトを追加する
# """
```

> - https://github.com/qodo-ai/pr-agent/blob/main/pr_agent/settings/configuration.toml

<br>

## 04. pr_reviewerセクション

```toml
[pr_reviewer]
# extra_instructions="""\
# ここにカスタムプロンプトを追加する
# """

# PRスコア算出を有効化する
require_score_review=true

# 単一のPRで複数回実行した時のコメントの挙動を変更する
# trueの場合は1つのPRコメントにまとめ、falseの場合は個別のPRコメントを投稿する
persistent_comment=true
```

> - https://github.com/qodo-ai/pr-agent/blob/main/pr_agent/settings/configuration.toml

<br>

## 05. pr_code_suggestionsセクション

```toml
[pr_code_suggestions]
# extra_instructions="""\
# ここにカスタムプロンプトを追加する
# """

# 単一のPRで複数回実行した時のコメントの挙動を変更する
# trueの場合は1つのPRコメントにまとめ、falseの場合は個別のPRコメントを投稿する。
persistent_comment=true
```

> - https://github.com/qodo-ai/pr-agent/blob/main/pr_agent/settings/configuration.toml

<br>
