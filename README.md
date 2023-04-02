# tech-notebook

## 概要

『俺の技術ノート』というサイトを運用しています。

[旧・俺の技術ノート](https://github.com/hiroki-it/tech-notebook_old)から、本サイトに移行しました。

新サイトは、[こちら](https://hiroki-it.github.io/tech-notebook) まで！！

<br>

## ツール

以下のツールを使用して、本サイトを運営しております。

| 役割                     | ツール名       |
| ------------------------ | -------------- |
| サイトジェネレーター     | MkDocs         |
| デプロイ                 | GitHub Actions |
| パッケージバージョン更新 | Renovate       |
| フォーマッター           | Prettier       |

<br>

## セットアップ

1. プラグインのURLを確認する。

```bash
$ asdf plugin list all | grep <.tool-versionsファイルに記載のプラグイン名>
```

2. 確認したURLを使用して、プラグインを登録する。

```bash
$ asdf plugin add <プラグイン名> <URL>
```

3. プラグインをインストールする。

```bash
$ asdf install
```

<br>

## 整形

1. インストールする。

```bash
$ yarn
```

2. フォーマッターを実行する。

```bash
$ yarn prettier -w --no-bracket-spacing **/*.md
```

<br>
