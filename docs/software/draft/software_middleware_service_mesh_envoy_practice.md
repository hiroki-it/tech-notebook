---
title: 【IT技術の知見】プラクティス@Envoy
description: プラクティス@Envoyの知見を記録しています。
---

# プラクティス@Envoy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. エラー

### `dial tcp lookup timeout`を解決する

#### ▼ `dial tcp lookup timeout`とは

EnvoyがCoreDNSとの通信に失敗している可能性がある。

> - https://christina04.hatenablog.com/entry/istio-and-envoy-errors

#### ▼ 解決

以下が原因である可能性がある。

- CoreDNSが停止している。
- CoreDNSへの通信経路のネットワークパフォーマンスが低い

これらを解決する。

<br>

### `upstream request timeout`を解決する

#### ▼ `upstream request timeout`とは

送信元Envoyのリクエスト処理がタイムアウト時間を超過し、送信元Envoyから宛先にリクエストを送信できなかったことを表している。

インバウンド通信の場合、リバースプロキシ先のアプリが宛先となる。

アウトバウンド通信の場合、Envoyや外部システムが宛先となる。

> - https://christina04.hatenablog.com/entry/istio-and-envoy-errors

#### ▼ 解決

以下が原因である可能性がある。

- 送信元Envoyがハードウェアリソース不足や高負荷状態にあり、処理し切れなかった
- タイムアウト時間が短すぎる
- 通常でも時間がかかりすぎる処理である

これらを解決する。

#### ▼ 解決

送信元Envoyの正常性やネットワークの状況を確認し、エラーを解決する。

<br>

### `upstream response timeout`を解決する

#### ▼ `upstream response timeout`とは

宛先のレスポンス処理がタイムアウト時間を超過し、送信元Envoyが宛先からレスポンスを受信できなかったことを表している。

インバウンド通信の場合、リバースプロキシ先のアプリが宛先となる。

アウトバウンド通信の場合、Envoyや外部システムが宛先となる。

> - https://github.com/envoyproxy/envoy/issues/13068

#### ▼ 解決

以下が原因である可能性がある。

- 宛先Envoyがハードウェアリソース不足や高負荷状態にあり、処理し切れなかった
- タイムアウト時間が短すぎる
- 通常でも時間がかかりすぎる処理である

これらを解決する。

<br>
