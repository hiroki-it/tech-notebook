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

Envoyからアップストリーム (アップストリーム) への送信処理エラーである。

Envoyからのリクエスト処理が、リスナーからルートへのタイムアウト時間を超過し、アップストリームにリクエストを送信できなかったことを表している。

アウトバウンド通信またはインバウンド通信の違いで、いずれが原因かが異なる。

#### ▼ Envoyからのアウトバウンド通信の場合

Envoyからのアウトバウンド通信の場合、Envoyのアップストリームは他のEnvoyや外部システムである。

```yaml
マイクロサービス # ダウンストリーム
⬇
Envoy
⬇
... # アップストリーム
```

Envoyから他のEnvoyや外部システムへのリクエストでタイムアウトになっている。

![envoy_upstream-request-timeout_outbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_upstream-request-timeout_outbound.png)

> - https://christina04.hatenablog.com/entry/istio-and-envoy-errors
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage

#### ▼ Envoyへのインバウンド通信の場合

Envoyへのインバウンド通信の場合、Envoyのアップストリームはマイクロサービスである。

```yaml

... # ダウンストリーム
⬇
Envoy
⬇︎
マイクロサービス # アップストリーム
```

Envoyからマイクロサービスへのリクエストがタイムアウトになっている。

![envoy_upstream-request-timeout_inbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/envoy_upstream-request-timeout_inbound.png)

> - https://christina04.hatenablog.com/entry/istio-and-envoy-errors
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage

#### ▼ 解決方法

以下が原因である可能性がある。

- アップストリーム (アウトバウンド通信の場合はEnvoy、インバウンド通信の場合はマイクロサービス) がハードウェアリソース不足や高負荷状態にあり、処理し切れなかった
- タイムアウト時間が短すぎる
- ネットワークに問題がある。
- 処理に時間がかかりすぎている。

これらを解決する。

<br>

### `upstream response timeout`を解決する

#### ▼ `upstream response timeout`とは

ステータスコードは`504`である。

Envoyからアップストリームへの送信処理エラーである。

しかし、アップストリームからのレスポンス処理がタイムアウト時間を超過し、Envoyがアップストリームからレスポンスを受信できなかったことを表している。

アウトバウンド通信またはインバウンド通信の違いで、いずれが原因かが異なる。

#### ▼ Envoyからのアウトバウンド通信の場合

アウトバウンド通信の場合、Envoyのアップストリームは他のEnvoyや外部システムがである。

```yaml
マイクロサービス # ダウンストリーム
⬇
Envoy
⬇
... # アップストリーム
```

他のEnvoyや外部システムからのレスポンスがタイムアウトになっている。

> - https://github.com/envoyproxy/envoy/issues/13068

#### ▼ Envoyへのインバウンド通信の場合

インバウンド通信の場合、Envoyのアップストリームはマイクロサービスである。

マイクロサービスからのレスポンスがタイムアウトになっている。

```yaml

... # ダウンストリーム
⬇
Envoy
⬇︎
マイクロサービス # アップストリーム
```

> - https://github.com/envoyproxy/envoy/issues/13068

#### ▼ 解決方法

以下が原因である可能性がある。

- アップストリーム (アウトバウンド通信の場合はEnvoy、インバウンド通信の場合はマイクロサービス) がハードウェアリソース不足や高負荷状態にあり、処理し切れなかった
- タイムアウト時間が短すぎる
- ネットワークに問題がある。
- 処理に時間がかかりすぎている。

これらを解決する。

<br>

### `downstream_remote_disconnect`を解決する

#### ▼ `downstream_remote_disconnect`とは

ステータスコードは`504`である。

Envoy (ダウンストリーム) から送信元への返信処理エラーである。

#### ▼ Envoyからのアウトバウンド通信の場合

Envoyからのアウトバウンド通信の場合、Envoyの送信元はマイクロサービスである。

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

Envoyへのインバウンド通信の場合、Envoyの送信元はブラウザやEnvoyである。

```yaml

... # ダウンストリーム
⬇
Envoy
⬇︎
マイクロサービス # アップストリーム
```

ブラウザやEnvoyからのリクエストがタイムアウトになっている。

#### ▼ 解決方法

以下が原因である可能性がある。

- 送信元 (アウトバウンド通信の場合はマイクロサービス、インバウンド通信の場合はブラウザやEnvoy) が通信を切断した。
- タイムアウト時間が短すぎる
- ネットワークに問題がある。

これらを解決する。

<br>
