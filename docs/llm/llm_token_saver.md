---
title: 【IT技術の知見】トークン節約ツール
description: AIエージェントのトークン使用量を抑えるツールの知見を記録しています。
tags:
  - "LLM"
---

# トークン節約ツール

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. RTK

### RTKとは

RTK は、対応するコマンドの出力を短縮し、AI エージェントに渡す入力トークンを抑えるツールである。

MCP サーバーではなく、フックを通じて対応するコマンドを RTK 経由に書き換える。

> - [GitHub - rtk-ai/rtk: CLI proxy that reduces LLM token consumption by 60-90% on common dev commands. Single Rust binary, zero dependencies · GitHub](https://github.com/rtk-ai/rtk)

### セットアップ

macOS で Homebrew を使用する場合、次のようにインストールする。

```bash
$ brew install rtk

# Codexにフックを設定する
$ rtk init --global --codex

# Claude Codeにフックを設定する
$ rtk init --global
```

設定後は各エージェントを再起動する。

`rtk init --global` は Claude Code の設定である。

導入状況や削減量は次のコマンドで確認できる。

```bash
$ rtk init --show
$ rtk gain
```

`rtk gain` の削減量は推定値であり、対象外のコマンドや画像の確認には適用されない。

### 設定ファイル

macOS では `~/Library/Application Support/rtk/config.toml` を使用する。

ファイルがなくてもデフォルト設定で動作する。

設定を作成または確認するときは、次のコマンドを使用する。

```bash
$ rtk config --create
$ rtk config
```

代表的な設定例を次に示す。

```toml
[tracking]
enabled = true # 削減量の記録を有効にする
history_days = 90 # 記録を保持する日数

[retriever]
mode = "sqlite" # 元の出力の保存方式：sqlite、tee、disabled
retention_days = 30 # sqliteで保存した出力を保持する日数

[telemetry]
enabled = false # 匿名の利用状況送信を無効にする

[hooks]
exclude_commands = [] # 自動変換の対象外にするコマンド

[limits]
grep_max_results = 200 # 検索結果の表示件数の上限
status_max_files = 15 # git statusのファイル表示件数の上限
```

短縮前の出力を確認する方法などは、次のドキュメントを参照する。

> - [Configuration \| RTK](https://www.rtk-ai.app/docs/getting-started/configuration/)

<br>

## 02. Serena

### Serenaとは

Serena は、MCP を介して関数やシンボル、参照先を検索できるツールである。

必要なコードを絞って取得することで、AI エージェントに渡す入力トークン量の抑制に役立つ。

> - [GitHub - oraios/serena: A powerful MCP toolkit for coding, providing semantic retrieval and editing capabilities - the IDE for your agent · GitHub](https://github.com/oraios/serena)

### セットアップ

uv をインストールしたうえで、次のコマンドを実行する。

```bash
$ uv tool install -p 3.13 serena-agent
$ serena init

# CodexにMCPサーバーを登録する
$ serena setup codex

# Claude CodeにMCPサーバーを登録する
$ serena setup claude-code
```

設定後は各エージェントを再起動する。

登録内容は `codex mcp get serena` または `claude mcp get serena` で確認できる。

作業対象が自動的に有効化されない場合は、Serena で現在のディレクトリをプロジェクトとして有効化するようエージェントに依頼する。

> - [Installation \| uv](https://docs.astral.sh/uv/getting-started/installation/)

### 設定ファイル

グローバル設定は `~/.serena/serena_config.yml` に保存され、各プロジェクトに適用される。

代表的な設定例を次に示す。

```yaml
# 言語サーバーを使用する
language_backend: LSP

# エージェントに提供するインターフェース：tools または REPL
agent_interface: REPL

# ブラウザ用ダッシュボードを有効にする
web_dashboard: true

# GUIログウィンドウを無効にする
gui_log_window: false

# ツールの回答に使用する文字数のデフォルト上限
default_max_tool_answer_chars: 150000

# すべてのプロジェクトで除外するパス
ignored_paths: []

# プロジェクトごとの設定、キャッシュ、メモリーをホームディレクトリに置く
project_serena_folder_location: "/Users/hiroki.hasegawa/.serena/projects$projectDir/.serena"
```

`$projectDir` はプロジェクトの絶対パスに置き換えられる。

既存のプロジェクト内に `.serena` があり、中央の保存先がまだ存在しない場合は、既存の `.serena` が優先される。

詳細は次のドキュメントを参照する。

> - [Configuration — Serena Documentation](https://oraios.github.io/serena/02-usage/050_configuration.html)
