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

### GitHub

Issue や PR に `@claude この問題を調査してください` とコメントすると、Action がコメント本文を依頼として取り込み、結果を同じスレッドに返信する。
修正を依頼した場合、Issue では変更ブランチと PR 作成リンクを用意し、開いている PR ではそのブランチを更新する。
事前に `/install-github-app` で Claude の GitHub App と `ANTHROPIC_API_KEY` secret を設定し、以下のワークフローを `.github/workflows/claude.yml` としてデフォルトブランチに配置する。

```yaml
name: Claude Code

on:
  issue_comment:
    types: [created]

# 既定のトークン権限を無効化し、ジョブごとに必要な権限を追加する。
permissions: {}

concurrency:
  group: claude-${{ github.repository }}
  cancel-in-progress: false

jobs:
  claude:
    # メンションを含む、許可された投稿者の新規コメントだけを処理する。
    if: >-
      contains(github.event.comment.body, '@claude') &&
      contains(fromJSON('["OWNER","MEMBER","COLLABORATOR"]'),
               github.event.comment.author_association)
    runs-on: ubuntu-latest
    timeout-minutes: 30
    permissions:
      contents: write
      issues: write
      pull-requests: write
      # ClaudeのGitHub App認証に使うOIDCトークンの取得を許可する。
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          # Git設定にGitHubトークンを保存しない。
          persist-credentials: false
      - name: Respond to Claude mention
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          # ユーザーが投稿した「@claude ...」のコメント全文を、依頼のプロンプトとして受け取る。
          # ActionがIssue・PRの参考データと依頼を取り込み、Claudeへ渡す。
          # promptは指定せず、メンションへの応答モードを使用する。
          trigger_phrase: '@claude'
          # CLI引数で、エージェントの最大ターン数を指定する。
          claude_args: '--max-turns 50'
```

> - [Claude Code Action](https://github.com/anthropics/claude-code-action)
> - [Capabilities & Limitations](https://github.com/anthropics/claude-code-action/blob/main/docs/capabilities-and-limitations.md)
