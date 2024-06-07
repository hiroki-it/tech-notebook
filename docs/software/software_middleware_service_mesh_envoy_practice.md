---
title: 【IT技術の知見】プラクティス@Envoy
description: プラクティス@Envoyの知見を記録しています。
---

# プラクティス@Envoy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `dial tcp lookup timeout`を解決する

### `dial tcp lookup timeout`とは

EnvoyがCoreDNSとの通信に失敗している可能性がある。

> - https://christina04.hatenablog.com/entry/istio-and-envoy-errors

<br>

### 解決方法

以下が原因である可能性がある。

- CoreDNSが停止している。
- CoreDNSへのリクエスト経路のネットワークパフォーマンスが低い

これらを解決する。

<br>

## 02. `upstream request timeout`を解決する

### `upstream request timeout`とは

ステータスコードは`504`である。

Envoyからアップストリーム (アップストリーム) への送信処理エラーである。

Envoyからのリクエスト処理が、リスナーからルートへのタイムアウト時間を超過し、アップストリームにリクエストを送信できなかったことを表している。

アウトバウンド通信またはインバウンド通信の違いで、アップストリームに当たる箇所が異なる。

<br>

### アップストリームに当たる箇所

#### ▼ Envoyからのアウトバウンド通信の場合

Envoyからのアウトバウンド通信の場合、Envoyのアップストリームは他のEnvoyや外部システムである。

Envoyから他のEnvoyや外部システムへのリクエストでタイムアウトになっている。

```yaml
マイクロサービス # ダウンストリーム
⬇
Envoy
⬇
... # アップストリーム
```

![envoy_upstream-request-timeout_outbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_upstream-request-timeout_outbound.png)

> - https://christina04.hatenablog.com/entry/istio-and-envoy-errors
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage

#### ▼ Envoyへのインバウンド通信の場合

Envoyへのインバウンド通信の場合、Envoyのアップストリームはマイクロサービスである。

Envoyからマイクロサービスへのリクエストがタイムアウトになっている。

```yaml

... # ダウンストリーム
⬇
Envoy
⬇︎
マイクロサービス # アップストリーム
```

![envoy_upstream-request-timeout_inbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_upstream-request-timeout_inbound.png)

> - https://christina04.hatenablog.com/entry/istio-and-envoy-errors
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage

<br>

### 解決方法

以下が原因である可能性がある。

- アップストリーム (アウトバウンド通信の場合はEnvoy、インバウンド通信の場合はマイクロサービス) がハードウェアリソース不足や高負荷状態にあり、処理し切れなかった
- タイムアウト時間が短すぎる
- ネットワークに問題がある。
- 処理に時間がかかりすぎている。

これらを解決する。

<br>

## 03. `upstream response timeout`を解決する

### `upstream response timeout`とは

ステータスコードは`504`である。

Envoyからアップストリームへの送信処理エラーである。

しかし、アップストリームからのレスポンス処理がタイムアウト時間を超過し、Envoyがアップストリームからレスポンスを受信できなかったことを表している。

アウトバウンド通信またはインバウンド通信の違いで、いずれが原因かが異なる。

<br>

### アップストリームに当たる箇所

#### ▼ Envoyからのアウトバウンド通信の場合

アウトバウンド通信の場合、Envoyのアップストリームは他のEnvoyや外部システムがである。

他のEnvoyや外部システムからのレスポンス処理がタイムアウトになっている。

```yaml
マイクロサービス # ダウンストリーム
⬇
Envoy
⬇
... # アップストリーム
```

> - https://github.com/envoyproxy/envoy/issues/13068

#### ▼ Envoyへのインバウンド通信の場合

インバウンド通信の場合、Envoyのアップストリームはマイクロサービスである。

マイクロサービスからのレスポンス処理がタイムアウトになっている。

```yaml

... # ダウンストリーム
⬇
Envoy
⬇︎
マイクロサービス # アップストリーム
```

> - https://github.com/envoyproxy/envoy/issues/13068

<br>

### 解決方法

以下が原因である可能性がある。

- アップストリーム (アウトバウンド通信の場合はEnvoy、インバウンド通信の場合はマイクロサービス) がハードウェアリソース不足や高負荷状態にあり、処理し切れなかった
- タイムアウト時間が短すぎる
- ネットワークに問題がある。
- 処理に時間がかかりすぎている。

これらを解決する。

<br>

## 04. `downstream_remote_disconnect`を解決する

### `downstream_remote_disconnect`とは

ステータスコードは`504`である。

Envoyのダウンストリームの返信処理エラーである。

<br>

### ダウンストリームに当たる箇所

#### ▼ Envoyからのアウトバウンド通信の場合

Envoyからのアウトバウンド通信の場合、Envoyのダウンストリームはマイクロサービスである。

```yaml
マイクロサービス # ダウンストリーム
⬇
Envoy
⬇
... # アップストリーム
```

マイクロサービスからのリクエストがタイムアウトになっている。

マイクロサービスからDBへのトランザクションで問題が起こると、Envoyで`downstream_remote_disconnect`が出ることがある。

#### ▼ Envoyへのインバウンド通信の場合

Envoyへのインバウンド通信の場合、EnvoyのダウンストリームはブラウザやEnvoyである。

```yaml

... # ダウンストリーム
⬇
Envoy
⬇︎
マイクロサービス # アップストリーム
```

ブラウザやEnvoyからのリクエストがタイムアウトになっている。

<br>

### 解決方法

以下が原因である可能性がある。

- ダウンストリーム (アウトバウンド通信の場合はマイクロサービス、インバウンド通信の場合はブラウザやEnvoy) が通信を切断した。
- タイムアウト時間が短すぎる
- ネットワークに問題がある。

これらを解決する。

<br>
