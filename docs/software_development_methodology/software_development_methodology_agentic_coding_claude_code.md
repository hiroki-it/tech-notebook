---
title: 【IT技術の知見】Claude Code＠エージェンティックコーディング
description: Claude Code＠エージェンティックコーディングの知見を記録しています。
---

# Claude Code＠エージェンティックコーディング

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

# 01. claudeコマンド

## オプション

### --allow-dangerously-skip-permissions

承認を自動化する。

```bash
$ claude --allow-dangerously-skip-permissions
```

<br>

## 02. setting.json

`~/.claude/setting.json` に設定を実装する。

```yaml
{
  "env":
    {
      "ANTHROPIC_BASE_URL": "<APIのURL>",
      "ANTHROPIC_AUTH_TOKEN": "<トークンの文字列>",
      "ANTHROPIC_MODEL": "bedrock/claude-sonnet-4-5",
      "ANTHROPIC_SMALL_FAST_MODEL": "bedrock/claude-haiku-4-5",
      "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "32000",
    },
  "alwaysThinkingEnabled": false,
}
```

<br>
