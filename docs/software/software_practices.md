---
title: 【IT技術の知見】プラクティス集＠ソフトウェア
description: プラクティス集＠ソフトウェアの知見を記録しています。
---

# プラクティス集＠ソフトウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## このページについて

このノートでは、ソフトウェアに共通するプラクティスを整理する。

<br>

## 01. アップグレード

### 設計規約

#### ▼ アップグレードの粒度

マイナーバージョンごとにアップグレードを検証する。

> - https://speakerdeck.com/yoshiakiyamasaki/20181201-mysqlbaziyonatupufalseji-chu-zhi-shi?slide=33

#### ▼ アンケート

アップグレードの影響が大きい (例：ダウンタイムが発生する) 場合、ステークホルダーと対応日時を調整する必要がある。

そのために、アンケートを実施する。

| 実行環境 | 都合が良ければチェック | 日付    | 時間            | 補足 |
| -------- | ---------------------- | ------- | --------------- | ---- |
| `tes`    | [ ]                    | m月/d日 | `16:00 ~ 19:00` |      |
|          | [ ]                    | m月/d日 | `16:00 ~ 19:00` |      |
|          | [ ]                    | m月/d日 | `16:00 ~ 19:00` |      |
| `stg`    | [ ]                    | m月/d日 | `16:00 ~ 19:00` |      |
|          | [ ]                    | m月/d日 | `16:00 ~ 19:00` |      |
|          | [ ]                    | m月/d日 | `16:00 ~ 19:00` |      |
| `prd`    | [ ]                    | m月/d日 | `02:00 ~ 05:00` |      |
|          | [ ]                    | m月/d日 | `02:00 ~ 05:00` |      |
|          | [ ]                    | m月/d日 | `02:00 ~ 05:00` |      |

#### ▼ 周知

対応日時が決まり次第、周知する必要がある。

また、本番環境であればユーザーに事前に周知しておき、その時間以内でアップグレードを完了させる必要がある。

**＊例＊**

| 実行環境 | 日付    | 時間            | 補足                                                                            |
| -------- | ------- | --------------- | ------------------------------------------------------------------------------- |
| `tes`    | m月/d日 | `16:00 ~ 19:00` |                                                                                 |
| `stg`    | m月/d日 | `16:00 ~ 19:00` |                                                                                 |
| `prd`    | m月/d日 | `02:00 ~ 05:00` | ユーザーが実行環境を利用中のため、利用者の少ない`03:00`から実施する必要がある。 |

#### ▼ アップグレード作業中の通信経路の閉塞

アップグレード時、アプリケーションでダウンタイムが必ず発生する場合、通信経路を閉塞する必要がある。

閉塞方法として、アプリケーションの送信元にロードバランサー (例：AWS ALB) を配置する。

アップグレード作業中、ロードバランサーが全てのリクエストに対してメンテナンスページ (例：`503`ステータスの静的ファイル) を返却するように、アップグレード直前にロードバランサーの設定値を変更しておく。

<br>

### アップグレード影響の調査

| 次のバージョン         | `2.0.0` | `3.0.0` |
| ---------------------- | ------- | ------- |
| アップグレード要件     | ...     | ...     |
| 想定されるダウンタイム | ...     | ...     |
| 影響のある機能廃止     | ...     | ...     |
| 既知の問題             | ...     | ...     |

#### ▼ アップグレード要件

アップグレード要件として、依存パッケージのインストールやアップグレードを必要とするかどうかを調査する。

#### ▼ 想定されるダウンタイム

テスト環境でダウンタイムを計測し、ダウンタイムを想定する。

過去の実績があり、推定できるのであれば、計測する必要はない。

#### ▼ 影響のある機能廃止

ベンダーのリリースノートを確認し、どのような『機能追加』『バグ修正』『機能廃止』『非推奨機能』がマージされるかを調査する。

機能廃止や非推奨機能があり、これをソフトウェアが使用している場合、ソフトウェアに影響が出る可能性がある。

#### ▼ 既知の問題

アップグレード中やアップグレード後に起こる可能性のある問題が、公式で既知の問題として報告されているかどうかを調査する。

<br>

### アップグレード結果

#### ▼ 想定外の結果

本番環境での対応で想定外の問題が起こった場合に、これを記載しておく。

#### ▼ ブラックボックステストの実施

アップグレード後に必要であればブラックボックステスト (例：ロードテスト、性能テストなど) を実施する。

<br>
