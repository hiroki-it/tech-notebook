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

#### ▼ 解決方法

以下が原因である可能性がある。

- CoreDNSが停止している。
- CoreDNSへのリクエスト経路のネットワークパフォーマンスが低い

これらを解決する。

<br>

### `upstream request timeout`を解決する

#### ▼ `upstream request timeout`とは

ステータスコードは`504`である。

送信元Envoyからのリクエスト処理が、リスナーからルートへのタイムアウト時間を超過し、送信元Envoyから宛先にリクエストを送信できなかったことを表している。

アウトバウンド通信の場合、送信元Envoyの宛先はサーバー側Envoyや外部システムがであり、送信元Envoyから他のEnvoyや外部システムへのリクエストでタイムアウトになっている。

![envoy_upstream-request-timeout_outbound.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_upstream-request-timeout_outbound.png)

インバウンド通信の場合、送信元Envoyの宛先はマイクロサービスであり、送信元Envoyからマイクロサービスへのリクエストがタイムアウトになっている。

![envoy_upstream-request-timeout_inbound.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_upstream-request-timeout_inbound.png)

> - https://christina04.hatenablog.com/entry/istio-and-envoy-errors
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage

#### ▼ 解決方法

以下が原因である可能性がある。

- 送信元Envoyがハードウェアリソース不足や高負荷状態にあり、処理し切れなかった
- タイムアウト時間が短すぎる
- ネットワークに問題がある。
- 処理に時間がかかりすぎている。

これらを解決する。

<br>

### `upstream response timeout`を解決する

#### ▼ `upstream response timeout`とは

ステータスコードは`504`である。

送信元Envoyから宛先にはリクエストを送信できている。

しかし、宛先からのレスポンス処理がタイムアウト時間を超過し、送信元Envoyが宛先からレスポンスを受信できなかったことを表している。

アウトバウンド通信の場合、送信元Envoyの宛先はサーバー側Envoyや外部システムがであり、サーバー側Envoyや外部システムからのレスポンスがタイムアウトになっている。

インバウンド通信の場合、送信元Envoyの宛先はマイクロサービスであり、マイクロサービスからのレスポンスがタイムアウトになっている。

> - https://github.com/envoyproxy/envoy/issues/13068

#### ▼ 解決方法

以下が原因である可能性がある。

- 宛先Envoyがハードウェアリソース不足や高負荷状態にあり、処理し切れなかった
- タイムアウト時間が短すぎる
- ネットワークに問題がある。
- 処理に時間がかかりすぎている。

これらを解決する。

<br>
