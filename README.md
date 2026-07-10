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

## 前提

- mise

## セットアップ

1. mise でツールをインストールする。

```bash
$ mise install
```

2. mise で Yarn をインストールする

```bash
$ mise use -g npm:yarn
```

3. PIP で python のパッケージをインストールする

```bash
$ pip3 install -r requirements.txt
```

<br>

## 整形

1. yarn でパッケージをインストールする。

```bash
$ yarn install
```

2. フォーマッターを実行する。

```bash
$ yarn prettier -w --no-bracket-spacing **/*.md
```

<br>

## Webサイト生成

1. ローカルマシンで Web サイトを生成する

```bash
$ mkdocs serve
```
