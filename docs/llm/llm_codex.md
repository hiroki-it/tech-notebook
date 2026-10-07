---
title: 【IT技術の知見】Codex＠LLM
description: Codex＠LLMの知見を記録しています。
---

# Codex＠LLM

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. codex コマンド

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

# 使用するモデルを指定する
model="gpt-5.2"

# 使用するモデルプロバイダーを指定する
model_provider="<プロバイダー名>"

# モデルの推論にかける労力を低く設定する
model_reasoning_effort = "low"

# 通知時に実行するコマンドを指定する（この例ではMacの通知スクリプト）
notify = ["bash", "/Users/hiroki.hasegawa/.codex/notify_macos.sh"]

# 最新のインターネット情報を取得する検索を有効化する
web_search = "live"

# 承認なしで進める
approval_policy = "never"

# ファイルとネットワークへのアクセスを制限しない
sandbox_mode = "danger-full-access"

# 対応するモデルの会話スタイルを実務的にする
personality = "pragmatic"

# マルチエージェントの設定
[agents]
# マルチエージェント用のツールを有効化する
enabled = true
# 同時に開けるサブエージェントのスレッド数を20に制限する（主スレッドを除く）
max_concurrent_threads_per_session = 20

# シェルで実行する子プロセスの環境変数の設定
[shell_environment_policy]
# 親プロセスのすべての環境変数を継承する
inherit = "all"
# KEY、SECRET、TOKENを名前に含む環境変数の自動除外を無効化する
ignore_default_excludes = true

# ターミナルUIの設定
[tui]
# ステータス行に現在のディレクトリ、Gitブランチ、モデルをこの順に表示する
status_line = ["current-dir", "git-branch", "model"]
# 公式資料に説明なし：名前からはスクリーンリーダーの検出完了を記録する項目と読める
screen_reader_detection_done = true

# 公式資料に説明なし：モデルの利用可能性に関する初回案内の状態と思われる
[tui.model_availability_nux]
# このモデルに対応する状態値（4の意味は公式資料では確認できない）
"gpt-6.1-sol" = 4

# LiteLLMをモデルプロバイダーとして定義する
[model_providers.lite_llm]
# モデルプロバイダーのAPIのベースURLを指定する
base_url="<APIのURL>"
# APIキーを読み取る環境変数名を指定する
env_key="OPENAI_API_KEY"
# モデルプロバイダーの表示名を指定する
name="<プロバイダー名>"
# モデルとの通信にResponses API形式を使用する
wire_api="responses"
```

MacOS での通知スクリプトは次のとおり。

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

> - [新Codex CLIの使い方](https://blog.lai.so/codex-rs-intro/)

<br>

## 03. MCP サーバー

### MCP サーバーとは

MCP サーバー（実体はプロセス）を介して、外部の API から Codex のコンテキストを取得する。

<br>

### Chrome dev tools の場合

Codex がブラウザを読めるようになる。

```toml
[mcp_servers.chrome-devtools]
command = "npx"
args = ["-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"]
startup_timeout_sec = 60.0
```

<br>

### Confluence の場合

```toml
[mcp_servers.confluence]
startup_timeout_sec = 60
command = "uv"
args = ["run", "--native-tls", "mcp-atlassian", "--confluence-url=https://confluence.foo.com", "--confluence-personal-token=<Confluenceで発行したパーソナルアクセストークン>"]

[mcp_servers.confluence.env]
REQUESTS_CA_BUNDLE = "<必要であれば、リモートワークのプロキシの証明書>"
```

<br>

### GitHub の場合

```toml
[mcp_servers.github]
url = "https://api.githubcopilot.com/mcp/"
http_headers = { Authorization = "Bearer <ここにパーソナルアクセストークン>" }
```

<br>

### Playwright の場合

```toml
[mcp_servers.playwright]
command = "npx"
# memoryを指定することで、ログファイルを作成させない
args = ["-y", "@playwright/mcp@latest", "--output-mode=memory"]
startup_timeout_sec = 60.0
```

<br>

### IntelliJ の場合


```toml
[mcp_servers.idea]
url = "http://127.0.0.1:64342/stream"
```

## 04. Skills

### ディレクトリ

```yaml
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
  # ドルマークで検索したときに表示されるスキル名
  display_name: "do-something"
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
