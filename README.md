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

### Prettier

```bash
# インストール
$ yarn

# フォーマッターを実行
$ yarn prettier -w **/*.md
```

<br>
