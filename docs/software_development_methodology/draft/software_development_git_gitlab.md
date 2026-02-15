---
title: 【IT技術の知見】GitLab＠Git
description: GitLab＠Gitの知見を記録しています。
---

# GitLab＠Git

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.GitLab.io/tech-notebook/

<br>

## 01. Issue

### テンプレート

記入中...

<br>

## 02. プルリクエスト

### テンプレート

#### ▼ 配置場所

リポジトリの直下に `.gitlab/merge_request_templates` ディレクトリを配置し、任意の名前の `.md` ファイルを配置する。

```yaml
repository/
├── .gitlab/
├── merge_request_templates/
├── FIX.md
└── UPDATE.md
```

<br>
