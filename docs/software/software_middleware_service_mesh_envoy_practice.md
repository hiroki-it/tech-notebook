---
title: 【IT技術の知見】プラクティス@Envoy
description: プラクティス@Envoyの知見を記録しています。
---

# プラクティス@Envoy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `dial tcp lookup timeout` を解決する

### `dial tcp lookup timeout` とは

Envoy が CoreDNS との通信に失敗している可能性がある。

> - https://christina04.hatenablog.com/entry/istio-and-envoy-errors

<br>

### 解決方法

以下が原因である可能性もある。

- CoreDNS が停止している。
- CoreDNS へのリクエスト経路のネットワークパフォーマンスが低い

これらを解決する。

<br>

## 02. `upstream request timeout` を解決する

### `upstream request timeout` とは

Gateway Timeout (`504` ステータス) である。

Envoy からアップストリーム (宛先) への送信処理エラーである。

Envoy からのリクエスト処理が、リスナーからルートへのタイムアウト時間を超過し、宛先にリクエストを送信できなかったことを表している。

アウトバウンド通信またはインバウンド通信の違いで、宛先に当たる箇所が異なる。

<br>

### 宛先に当たる箇所

#### ▼ Envoyからのアウトバウンド通信の場合

Envoy からのアウトバウンド通信の場合、Envoy の宛先は他の Envoy や外部システムである。

Envoy から他の Envoy や外部システムへのリクエストでタイムアウトになっている。

```yaml
マイクロサービス # 送信元
⬇
Envoy
⬇
... # 宛先
```

![envoy_upstream-request-timeout_outbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_upstream-request-timeout_outbound.png)

> - https://christina04.hatenablog.com/entry/istio-and-envoy-errors
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage

#### ▼ Envoyへのインバウンド通信の場合

Envoy へのインバウンド通信の場合、Envoy の宛先はマイクロサービスである。

Envoy からマイクロサービスへのリクエストがタイムアウトになっている。

```yaml

... # 送信元
⬇
Envoy
⬇️
マイクロサービス # 宛先
```

![envoy_upstream-request-timeout_inbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_upstream-request-timeout_inbound.png)

> - https://christina04.hatenablog.com/entry/istio-and-envoy-errors
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage

<br>

### 解決方法

以下が原因である可能性もある。

- 宛先 (アウトバウンド通信の場合は Envoy、インバウンド通信の場合はマイクロサービス) がハードウェアリソース不足や高負荷状態にあり、処理し切れなかった
- タイムアウト時間が短すぎる
- ネットワークに問題がある。
- 処理に時間がかかりすぎている。

これらを解決する。

<br>

## 03. `upstream response timeout` を解決する

### `upstream response timeout` とは

Gateway Timeout (`504` ステータス) である。

Envoy からアップストリーム (宛先) への送信処理エラーである。

しかし、宛先からのレスポンス処理がタイムアウト時間を超過し、Envoy が宛先からレスポンスを受信できなかったことを表している。

アウトバウンド通信またはインバウンド通信の違いで、いずれが原因かが異なる。

<br>

### 宛先に当たる箇所

#### ▼ Envoyからのアウトバウンド通信の場合

アウトバウンド通信の場合、Envoy の宛先は他の Envoy や外部システムがである。

他の Envoy や外部システムからのレスポンス処理がタイムアウトになっている。

```yaml
マイクロサービス # 送信元
⬇
Envoy
⬇
... # 宛先
```

> - https://github.com/envoyproxy/envoy/issues/13068

#### ▼ Envoyへのインバウンド通信の場合

インバウンド通信の場合、Envoy の宛先はマイクロサービスである。

マイクロサービスからのレスポンス処理がタイムアウトになっている。

```yaml

... # 送信元
⬇️
Envoy
⬇️
マイクロサービス # 宛先
```

> - https://github.com/envoyproxy/envoy/issues/13068

<br>

### 解決方法

以下が原因である可能性もある。

- 宛先 (アウトバウンド通信の場合は Envoy、インバウンド通信の場合はマイクロサービス) がハードウェアリソース不足や高負荷状態にあり、処理し切れなかった
- タイムアウト時間が短すぎる
- ネットワークに問題がある。
- 処理に時間がかかりすぎている。

これらを解決する。

<br>

## 04. `downstream_remote_disconnect` を解決する

### `downstream_remote_disconnect` とは

Gateway Timeout (`504` ステータス) である。

Envoy のダウンストリーム (送信元) の返信処理エラーである。

<br>

### 送信元に当たる箇所

#### ▼ Envoyからのアウトバウンド通信の場合

Envoy からのアウトバウンド通信の場合、Envoy の送信元はマイクロサービスである。

```yaml
マイクロサービス # 送信元
⬇
Envoy
⬇
... # 宛先
```

マイクロサービスからのリクエストがタイムアウトになっている。

マイクロサービスから DB へのトランザクションで問題が起こると、Envoy で `downstream_remote_disconnect` が出る可能性もある。

#### ▼ Envoyへのインバウンド通信の場合

Envoy へのインバウンド通信の場合、Envoy の送信元はブラウザや Envoy である。

```yaml

... # 送信元
⬇
Envoy
⬇️
マイクロサービス # 宛先
```

ブラウザや Envoy からのリクエストがタイムアウトになっている。

<br>

### 解決方法

以下が原因である可能性もある。

- 送信元 (アウトバウンド通信の場合はマイクロサービス、インバウンド通信の場合はブラウザや Envoy) が通信を切断した。
- タイムアウト時間が短すぎる
- ネットワークに問題がある。

これらを解決する。

<br>

## 05 ヘッダー

### 1. 送信元Envoyから宛先Envoyへのリクエストヘッダー

記入中...

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#http-request-headers-set-on-upstream-calls

<br>

### 2. 宛先Envoyから送信元Envoyへのレスポンスヘッダー

#### ▼ 宛先Envoyから送信元Envoyへのレスポンスヘッダーとは

送信元 Envoy のアウトバウンド通信時に、宛先 Envoy から送信元 ENvoy へのレスポンスに設定されたヘッダーである。

#### ▼ x-envoy-immediate-health-check-fail

宛先でヘルスチェックに失敗していることを表す。

送信元 Envoy は、この Envoy をロードバランシングの宛先から外す。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-immediate-health-check-fail

<br>

### 3. 送信元Envoyからアプリへのレスポンスヘッダー

#### ▼ 送信元Envoyからアプリへのレスポンスヘッダーとは

送信元 Envoy のアウトバウンド通信時に、送信元 Envoy からアプリへのレスポンスに設定されたヘッダーである。

#### ▼ x-envoy-upstream-service-time

宛先マイクロサービスの処理時間と宛先 Envoy からのレスポンスタイムの合計時間を表す。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-upstream-service-time

#### ▼ x-envoy-overloaded

送信元 Envoy のアウトバウンド通信時に、サーキットブレイカーまたはメンテナンスモードによってリクエストが遮断されたことを表す。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-overloaded
> - https://aws.amazon.com/cn/blogs/china/how-to-use-metrics-and-logs-to-troubleshoot-app-mesh-related-network-problems/

#### ▼ x-envoy-loadl-overloaded

送信元 Envoy のインバウンド通信時に、サーキットブレイカーによってリクエストが遮断されたことを表す。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers#x-envoy-local-overloaded
> - https://github.com/envoyproxy/envoy/issues/1573#issue-254090540

<br>
