---
title: 【IT技術の知見】TSDB
description: TSDBの知見を記録しています。
---

# TSDB

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## TSDBとは

時系列データ (例：データポイント) を永続化する。

また、とある期間を単位として時系列データをグループ化し、一連の連続データとして表現する。

![tsdb](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/tsdb.png)

> - https://thecustomizewindows.com/2019/10/what-is-time-series-database-tsdb/

<br>

## テーブル

#### レコード

- タイムスタンプをレコードにする
- メトリクスの種類をレコードにする

> - https://qiita.com/KentOhwada_AlibabaCloudJapan/items/743ffcf8a2441de1167f#%E6%99%82%E7%B3%BB%E5%88%97%E3%83%87%E3%83%BC%E3%82%BF%E3%83%A2%E3%83%87%E3%83%AB

<br>
