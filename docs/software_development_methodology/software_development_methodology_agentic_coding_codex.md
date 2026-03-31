---
title: 【IT技術の知見】Codex＠エージェンティックコーディング
description: Codex＠エージェンティックコーディングの知見を記録しています。
---

# Codex＠エージェンティックコーディング

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. codexコマンド

### オプション

#### ▼ --config

`~/.codex/config.toml` 以外に `config.toml` ファイルを置いている場合に、それを指定する。

```bash
$ codex --config ./repository/.codex/config.toml
```

#### ▼ --dangerously-skip-permissions

承認を自動化する。

```bash
$ codex --dangerously-bypass-approvals-and-sandbox
```

<br>

## 02. config.toml

`~/.codex/config.toml` に設定を実装する。

```toml
# 思考過程の出力を非表示にする
hide_agent_reasoning = true

model="gpt-5.2"

model_provider="<プロバイダー名>"

# 思考にかける時間
model_reasoning_effort = "low"

# ネットワークへの接続を有効化する
network_access = true

# Macで通知を有効化する
notify = ["bash", "/Users/hiroki.hasegawa/.codex/notify_macos.sh"]

# インターネット検索を有効化する
web_search_request = true

# 承認なしで進める
approval_policy = "never"

# すべての操作を許可する
sandbox_mode = "danger-full-access"

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
RAW_MESSAGE=$(echo "$1" | jq -r '.["last-assistant-message"] // "Codex task completed"')

# 長すぎるとAppleScriptが壊れやすいので先頭80文字にトリム
TRIMMED_MESSAGE=$(echo "$RAW_MESSAGE" | head -c 80)

# AppleScript用に改行とダブルクオートを安全な形に変換
SAFE_MESSAGE=$(echo "$TRIMMED_MESSAGE" | tr '\n' ' ' | sed 's/"/\\"/g')

# osascriptで通知表示
osascript -e "display notification \"$SAFE_MESSAGE\" with title \"Codexの作業が完了\""
```

> - https://blog.lai.so/codex-rs-intro/

<br>

## 03. MCPサーバー

### MCPサーバーとは

MCPサーバー（実体はプロセス）を通じて、外部のAPIからCodexのコンテキストを取得する。

<br>

### Confluenceの場合

```toml
[mcp_servers.confluence]
startup_timeout_sec = 60

command = "uv"

args = ["run", "--native-tls", "mcp-atlassian", "--confluence-url=https://confluence.foo.com"]

env.REQUESTS_CA_BUNDLE = "<必要であれば、リモートワークのプロキシの証明書>"

env.CONFLUENCE_PERSONAL_TOKEN = "<Confluenceで発行したパーソナルアクセストークン>"
```

<br>

## 04. Skills

### ディレクトリ

```text
~/.codex/
└── skills
    └── create-foo
        ├── agents/ # スキルで呼び出すエージェントを定義する
        ├── references/ # スキルで呼び出す参考情報を定義する
        ├── scripts/ # スキルで呼び出すスクリプトを実装する
        └── SKILL.md # スキルを定義する
```

<br>

### スキル登録

執筆時点では、特定のプロジェクトだけでスキルを読み込ませるような方法はない。

ただ、スキルを `~/.codex/skills` で一括管理するわけにもいかない。

そこで、各プロジェクトにスキルを置き、`~/.codex/skills` ではシンボリックリンクのみを置く。

```text
~/.codex/
└── skills
    └── create-foo # シンボリックリンク
```

<br>

### 構成要素

#### ▼ agents

```yaml
# openai.yaml
interface:
  display_name: "Do something"
  short_description: "Help with Do something tasks"
```

#### ▼ SKILL.md

```markdown
---
name: feature-design
description: 手順に沿って機能を設計する
---

# 機能設計
```

<br>
