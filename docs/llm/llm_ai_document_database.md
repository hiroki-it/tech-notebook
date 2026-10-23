---
title: 【IT技術の知見】DB設計用のドキュメント＠AI用ドキュメント
description: DB設計用のドキュメント＠AI用ドキュメントの知見を記録しています。
---

# DB 設計用のドキュメント＠AI 用ドキュメント

# DB 設計のドキュメント

## DB 全体

記入中...

<br>

## テーブル

このドキュメントはテーブルの設計を考えるためのドキュメントであり、生成 AI に読み込ませることを想定している。

1. 検証対象の実装を読み込む。
2. 次のテーブルのプラクティスを読み込む。
3. 次の観点でテーブルを追加／改善する。

- 次のようにテーブル構造を整理して

<table>
  <thead>
    <tr>
      <th>物理名</th>
      <th>論理名</th>
      <th>型</th>
      <th>プライマリー／ユニークキー</th>
      <th style="text-align:center">NOT NULL 制約</th>
      <th>デフォルト値</th>
      <th>説明</th>
      <th>値の例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>foo_id</code></td>
      <td>foo ID</td>
      <td><code>VARCHAR(15)</code></td>
      <td>プライマリキー</td>
      <td style="text-align:center">禁止</td>
      <td>N/A</td>
      <td>foo に関する ID</td>
      <td><code>123456789</code></td>
    </tr>
    <tr>
      <td><code>foo_name</code></td>
      <td>foo 名</td>
      <td><code>VARCHAR(15)</code></td>
      <td>N/A</td>
      <td style="text-align:center">禁止</td>
      <td>N/A</td>
      <td>foo に関する名前</td>
      <td><code>hiroki.hasegawa</code></td>
    </tr>
    <tr>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td style="text-align:center">...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <td><code>created_at</code></td>
      <td>作成日時</td>
      <td><code>DATETIME(3)</code></td>
      <td>N/A</td>
      <td style="text-align:center">禁止</td>
      <td>CURRENT_TIMESTAMP(3)</td>
      <td>UTC のタイムスタンプ</td>
      <td><code>2025-01-01 12:34:00.000</code></td>
    </tr>
    <tr>
      <td><code>updated_at</code></td>
      <td>更新日時</td>
      <td><code>DATETIME(3)</code></td>
      <td>N/A</td>
      <td style="text-align:center">禁止</td>
      <td>CURRENT_TIMESTAMP(3)</td>
      <td>UTC のタイムスタンプ</td>
      <td><code>2025-01-01 12:34:05.250</code></td>
    </tr>
  </tbody>
</table>

- カラム
  - ドメイン上意味付けする必要があるものをカラムにできているか
  - ドメイン上意味付けする必要がないもの（単なる集計結果や複合データ）をカラムにしていないか
- リレーション
  - リレーションが重複しており、過剰でないか
- 複合プライマリーキー
  - バッチ処理では重複防止のために複合プライマリーを使用する
- 複合インデックス
  - SQL で `=` の等価指定のあるカラムを前におき、次に `IN` 句で複数の等価指定、最後に `BETWEEN` で範囲指定のあるカラムを後に置く。
- カーディナリティが低いほど、B-Tree インデックスの検索グループが増える。

  そのため、DB が処理しないといけないレコード数が増えてしまう。

  そこで、等価条件が複数ある場合は、カーディナリティの高いカラムをより前におく。
