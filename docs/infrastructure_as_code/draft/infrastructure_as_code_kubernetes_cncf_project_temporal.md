---
title: 【IT技術の知見】Temporal＠CNCF
description: Temporal＠CNCFの知見を記録しています。
---

# Temporal＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Temporalの仕組み

### アーキテクチャ

Temporalは、Temporalサーバー、ステート用データベース、Temporalワーカー (ユーザーのアプリ) 、からなる。

> - https://michaelangelo.io/blog/temporal-sqs#temporal-components

<br>

## 02. ユースケース

### Sagaオーケストレーターとして

TemporalをSagaパターンのオーケストレーターとして使用する。

> - https://learn.temporal.io/tutorials/php/booking_saga/#review-the-saga-architecture-pattern
> - https://temporal.io/blog/saga-pattern-made-easy
> - https://github.com/efortuna/sagas-temporal-trip-booking/tree/main

<br>
