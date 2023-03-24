---
title: 【IT技術の知見】設定ファイル＠PostgreSQL
description: 設定ファイル＠PostgreSQLの知見を記録しています。
---

# 設定ファイル＠PostgreSQL

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ dnfリポジトリから

`psql`コマンドのみをインストールしたい場合

```bash
$ dnf install -y postgresql
```

<br>

### 動作確認

#### ▼ ステータス確認

PostgreSQLのプロセスが稼働していることを確認する。

```bash
$ systemctl status postgresql-13.service
```

#### ▼ 接続確認

DBに接続する。

```bash
# psql -U foo-user -h *.*.*.* -p 5432 -d foo-db
$ psql -U <ユーザー名> -h <DBホスト名> -p <ポート番号> -d <DB名>
```

パスワードを`psql`コマンドに渡す場合、環境変数か`.pgpass`ファイルで定義する。

```bash
<IPアドレス>:<ポート番号>:<DB名>:<ユーザ名>:<パスワード>
```

```bash
$ export PGPASSWORD=<パスワード>
```

> ↪️ 参考：https://qiita.com/IysKG213/items/2af29ba1f6da87199de0

<br>

## セクション

### log_directory

ログの出力先のディレクトリを設定する。

```ini
log_directory = /var/lib/pgsql
```

> ↪️ 参考：https://zatoima.github.io/postgresql-about-monitoring-log.html

<br>

### log_line_prefix

#### ▼ log_line_prefixとは

ログのプリフィクスの形式を設定する。

```
log_line_prefix = '%m [%p]: user=%u,db=%d,app=%a,client=%r,xid=%x '
```

> ↪️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/1702/16/news015_3.html

<br>

### log_min_duration_statement

スロークエリを検出する時の閾値秒数を設定する。

```ini
log_min_duration_statement = 100ms
```

> ↪️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/1702/16/news015_3.html

<br>

### logging_collector

標準エラー出力などに出力されるログを、ログファイルに出力する。

```ini
logging_collector = on
```

<br>
