---
title: 【IT技術の知見】Codex＠エージェンティックコーディング
description: Codex＠エージェンティックコーディングの知見を記録しています。
---

# Codex＠エージェンティックコーディング

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

# 01. codexコマンド

## オプション

### --dangerously-skip-permissions

承認を自動化する。

```bash
$ codex --dangerously-bypass-approvals-and-sandbox
```

<br>

## 02. config.toml

`~/.codex/config.toml`に設定を実装する。

```toml
# 思考過程の出力を非表示にする
hide_agent_reasoning = true

model_provider="<プロバイダー名>"

model="gpt-5.1"

# ネットワークへの接続を有効化する
network_access = true

# Macで通知を有効化する
notify = ["bash", "/Users/hiroki.hasegawa/.codex/notify_macos.sh"]

# インターネット検索を有効化する
web_search_request = true

[model_providers.lite_llm]
base_url="<APIのURL>"
env_key="OPENAI_API_KEY"
name="<プロバイダー名>"
wire_api="responses"
```

MacOSでの通知スクリプトは次のとおり。

```bash
#!/bin/bash

# JSONから最後のエージェント発言を抽出
LAST_MESSAGE=$(echo "$1" | jq -r '.["last-assistant-message"] // "Codex task completed"')

# osascriptで通知表示
osascript -e "display notification \"$LAST_MESSAGE\" with title \"Codexの作業が完了\""
```

> - https://blog.lai.so/codex-rs-intro/

<br>
