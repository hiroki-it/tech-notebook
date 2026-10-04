---
title: 【IT技術の知見】Claude Code Actions＠LLM
description: Claude Code Actions＠LLMの知見を記録しています。
---

# Claude Code Actions＠LLM

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Claude Code Actionsとは

自律型のAIエージェントである。

人間のレビューを一度も介さずにIssue対処からマージできるのが理想である。

もし良くないコードがマージされてしまったとしても、品質が大きく低下しないIssue（フロントエンドのUIロジックのみのもの、変更行が N 行未満のもの、DBテーブルの変更を含まないものなど）をとりあえずやらせる。

次は運用しながら決めていく。

- Issueの作成も自動化させるのか
- どういうIssueをやらせるのか
- 誰がどのタイミングで発火Goさせるのか

<br>

## 02. セットアップ

### GitLab

```yaml
stages:
  - ai

claude:
  stage: ai
  image: node:24-alpine3.21
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  variables:
    GIT_STRATEGY: fetch
  before_script:
    - apk add --no-cache git curl bash
    - curl -fsSL https://claude.ai/install.sh | bash
    # インストール先を PATH に追加する
    - export PATH="$HOME/.local/bin:$PATH"
  script:
    - >
      claude
      -p "${AI_FLOW_INPUT:-リポジトリを確認し、改善が必要な箇所を報告してください}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write"
```

> - [Claude Code GitLab CI/CD - Claude Code Docs](https://code.claude.com/docs/ja/gitlab-ci-cd)

<br>
