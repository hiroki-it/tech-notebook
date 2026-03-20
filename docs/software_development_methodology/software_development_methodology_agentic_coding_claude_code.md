---
title: 【IT技術の知見】Claude Code＠エージェンティックコーディング
description: Claude Code＠エージェンティックコーディングの知見を記録しています。
---

# Claude Code＠エージェンティックコーディング

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. レイヤー

| レイヤー         | 読み込まれるタイミング                                                | 用途                                                                                                                    |
| ---------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`      | 常時                                                                  | Claude Codeの各コンテキストの目次として使用する                                                                         |
| `.claude/agents` | `claude --agent` によるセッションの起動時                             | Claude Codeのセッションに人格 (設計者、レビュアー、何らかの専門家) を与えたい場合に、人格、コンテキスト、命令を定義する |
| `.claude/hooks`  | 指定したイベント時 (例：セッション開始時、コンテキスト入力時、完了時) | ガードレール (例：静的解析、コンテキストのルールどおりかを検証、処理完了の通知) を定義する                              |
| `.claude/rules`  | 常時                                                                  | Claude Codeにインプットするコンテキストを定義する                                                                       |
| `.claude/skills` | `/<スキル名>` の実行時                                                | 特定の場面のみでClaude Codeにインプットさせたいコンテキストと、その命令を定義する。                                     |

> - https://izanami.dev/post/47deb6b9-0965-41e7-b128-12f5937e8748

<br>

## 02. claudeコマンド

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

## 04. Skills

### ディレクトリ

```text
~/.claude/
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

ただ、スキルを `~/.claude/skills` で一括管理するわけにもいかない。

そこで、各プロジェクトにスキルを置き、`~/.claude/skills` ではシンボリックリンクのみを置く。

```text
~/.claude/
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
