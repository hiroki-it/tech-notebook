---
title: 【IT技術の知見】Claude Code＠LLM
description: Claude Code＠LLMの知見を記録しています。
---

# Claude Code＠LLM

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. レイヤー

<table>
  <thead>
    <tr>
      <th>レイヤー</th>
      <th>読み込まれるタイミング</th>
      <th>用途</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>CLAUDE.md</code></td>
      <td>常時</td>
      <td>Claude Code の各コンテキストの目次として使用する</td>
    </tr>
    <tr>
      <td><code>.claude/agents</code></td>
      <td><code>claude --agent</code> によるセッションの起動時</td>
      <td>Claude Code のセッションに人格 (設計者、レビュアー、何らかの専門家) を与えたい場合に、人格、コンテキスト、命令を定義する</td>
    </tr>
    <tr>
      <td><code>.claude/hooks</code></td>
      <td>指定したイベント時 (例：セッション開始時、コンテキスト入力時、完了時)</td>
      <td>ガードレール (例：静的解析、コンテキストのルールどおりかを検証、処理完了の通知) を定義する</td>
    </tr>
    <tr>
      <td><code>.claude/rules</code></td>
      <td>常時</td>
      <td>Claude Code にインプットするコンテキストを定義する</td>
    </tr>
    <tr>
      <td><code>.claude/skills</code></td>
      <td><code>/&lt;スキル名&gt;</code> の実行時</td>
      <td>特定の場面のみで Claude Code にインプットさせたいコンテキストと、その命令を定義する。</td>
    </tr>
  </tbody>
</table>

> - [Claude Codeの CLAUDE.md、Rules、Skills、Subagents、MCPs使い分け - izanami](https://izanami.dev/post/47deb6b9-0965-41e7-b128-12f5937e8748)

<br>

## 02. claude コマンド

### セットアップ

```bash
$ npm i -g @openai/codex
```

<br>

### オプション

#### ▼ --allow-dangerously-skip-permissions

承認を自動化する。

```bash
$ claude --allow-dangerously-skip-permissions
```

<br>

## 03. setting.json

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
