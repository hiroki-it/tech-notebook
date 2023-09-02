---
title: 【IT技術の知見】テレメトリー＠Envoy
description: テレメトリー＠Envoyの知見を記録しています。
---

# テレメトリー＠Envoy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ログ (アクセスログのみ)

### アクセスログ形式

Envoyは、アプリコンテナへのアクセスログ (インバウンド通信とアウトバウンド通信の両方) を作成し、標準出力に出力する。

デフォルトで以下の形式でアクセスログを出力する。

```log
[%START_TIME%] "%REQ(:METHOD)% %REQ(X-ENVOY-ORIGINAL-PATH?:PATH)% %PROTOCOL%"
%RESPONSE_CODE% %RESPONSE_FLAGS% %BYTES_RECEIVED% %BYTES_SENT% %DURATION%
%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)% "%REQ(X-FORWARDED-FOR)%" "%REQ(USER-AGENT)%"
"%REQ(X-REQUEST-ID)%" "%REQ(:AUTHORITY)%" "%UPSTREAM_HOST%"\n
```

```log
[2016-04-15T20:17:00.310Z] "POST /api/v1/locations HTTP/2" 204 - 154 0 226 100 "10.0.35.28"
"nsq2http" "cc21d9b0-cf5c-432b-8c7e-98aeb7988cd2" "locations" "tcp://10.0.2.1:80"
```

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#default-format-string

なお、`%REQ()`を使用して、好きなリクエストヘッダーの値を出力できる。

これは、例えばユーザー定義のトレースIDを使用している場合に役立つ。

```log
[%START_TIME%] %REQ(<リクエストヘッダー名 (例：ユーザー定義のトレースIDのヘッダー)>)% ...
```

<br>

### 変数

#### ▼ `%RESPONSE_FLAGS%`

インバウンド/アウトバウンド通信時に、アプリコンテナから受信したレスポンスの補足メッセージを表す。

ステータスコードと合わせて、レスポンスのエラーや警告の理由を読み取ることに役立つ。

アウトバウンド通信に関する補足メッセージは以下の通りである。

| 名前  | 正式名称                          | ステータスコード | 説明                                                                                                                  |
| ----- | --------------------------------- | :--------------: | --------------------------------------------------------------------------------------------------------------------- |
| `NC`  | `NO_CLUSTER_FOUND`                |       なし       | アウトバウンド通信にて、クラスターの設定が見つからず、Envoyはアプリコンテナに接続できなかった。                       |
| `UC`  | `UPSTREAM_CONNECTION_TERMINATION` |      `503`       | 遭遇率が一番高い。アウトバウンド通信にて、Envoyは何らかの理由でアプリコンテナに接続できなかった。                     |
| `UF`  | `UPSTREAM_CONNECTION_FAILURE`     |      `503`       | アウトバウンド通信にて、Envoyは通信障害でアプリコンテナに接続できなかった。                                           |
| `UT`  | `UPSTREAM_REQUEST_TIMEOUT`        |      `503`       | アウトバウンド通信にて、Envoyはタイムアウトでアプリコンテナに接続できなかった。                                       |
| `UO`  | `UPSTREAM_OVERFLOW`               |      `503`       | アウトバウンド通信にて、意図的なサーキットブレイカーで、Envoyはアプリコンテナに接続できなかった。                     |
| `URX` | `UPSTREAM_RETRY_LIMIT_EXCEEDED`   |       なし       | アウトバウンド通信にて、アプリコンテナの通信試行回数制限の上限超過で、Envoyはアプリコンテナに接続拒否されてしまった。 |
| `UH`  | `NO_HEALTHY_UPSTREAM`             |      `503`       | アウトバウンド通信にて、Envoyはアプリコンテナの異常で接続できなかった。                                               |

インバウンド通信に関する補足メッセージは以下の通りである。

| 名前  | 正式名称                            | ステータスコード | 説明                                                                                                          |
| ----- | ----------------------------------- | :--------------: | ------------------------------------------------------------------------------------------------------------- |
| `DC`  | `DOWNSTREAM_CONNECTION_TERMINATION` |       なし       | インバウンド通信にて、Envoyのアプリコンテナへの通信が中断され、Envoyはレスポンスを受信できなかった。          |
| `DPE` | `DOWNSTREAM_PROTOCOL_ERROR`         |       なし       | インバウンド通信にて、EnvoyはHTTPプロトコルのエラーでアプリコンテナに接続できなかった。                       |
| `NR`  | `NO_ROUTE_FOUND`                    |      `404`       | インバウンド通信にて、ルートやフィルターチェーンの設定が見つからず、Envoyはアプリコンテナに接続できなかった。 |

> - https://github.com/istio/proxy/blob/1.14.3/extensions/common/util.cc#L29-L56
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage
> - https://medium.com/expedia-group-tech/all-about-istio-proxy-5xx-issues-e0221b29e692
> - https://discuss.istio.io/t/periodic-response-code-0-and-dc-response-flag/9349
> - https://karlstoney.com/2019/05/31/istio-503s-ucs-and-tcp-fun-times/

<br>

## 02. メトリクス

### メトリクスの種類

#### ▼ メトリクス名のルール

Envoyのメトリクスには、、

#### ▼ 通信全体に関するメトリクス

`envoy_downstream_*****` (インバウンド系)、`envoy_upstream_*****` (アウトバウンド系) のメトリクスがある。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/stats
> - https://docs.aws.amazon.com/ja_jp/app-mesh/latest/userguide/envoy-metrics.html

#### ▼ Envoy自身系

`envoy_server_*****`をプレフィクスとするメトリクスがある。

注意点として、ドキュメントではプレフィクスが省略されてしまっている。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/statistics

#### ▼ リスナー系

`envoy_downstream_*****` (インバウンド系)、`envoy_upstream_*****` (アウトバウンド系) をプレフィクスとするメトリクスがある。

注意点として、ドキュメントではプレフィクスが省略されてしまっている。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/listeners/stats
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/listeners/network_filters/tcp_proxy_filter#statistics

#### ▼ ルート系

記入中...

#### ▼ クラスター系

`envoy_downstream_*****` (インバウンド系)、`envoy_upstream_*****` (アウトバウンド系) をプレフィクスとするメトリクスがある。

注意点として、ドキュメントではプレフィクスが省略されてしまっている。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/upstream/cluster_manager/cluster_stats#config-cluster-manager-cluster-stats

#### ▼ エンドポイント系

記入中...

<br>

### エンドポイント

Envoyの`15090`番ポートでは、メトリクス収集ツール (例：Prometheus) からのリクエストを待ち受ける。

Envoyが、`/stats/prometheus`エンドポイントでリクエストを待ち受けており、データポイントを含むレスポンスを返信する。

もしサービスメッシュツール (例：Istio、Linkerd、など) を使用する場合、コントロールプレーン側にも同じエンドポイントがあり、メトリクス収集ツールはこちら側を指定することが多い。

```bash
# envoyコンテナからメトリクスを取得する。
$ kubectl exec \
    -it foo-pod \
    -n foo-namespace \
    -c envoy \
    -- bash -c "curl http://127.0.0.1:15090/stats/prometheus"
```

<br>

## 03. 分散トレース

### Envoyによるトレーシング

Envoyは、分散トレースを作成できるように、自分を通過した通信にHTTPヘッダーやRPCヘッダーに分散トレースIDを割り当てる。

> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/observability/tracing#arch-overview-tracing-context-propagation

<br>

### HTTPヘッダーの分散トレースID

#### ▼ 標準ヘッダー

| HTTPヘッダー名 | 説明                             |
| -------------- | -------------------------------- |
| `X-REQUEST-ID` | トレースIDが割り当てられている。 |

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers

#### ▼ zipkin系ヘッダー

Envoyは、Zipkinが使用するヘッダーを追加する。

| HTTPヘッダー名      | 説明                                                                               |
| ------------------- | ---------------------------------------------------------------------------------- |
| `X-B3-SAMPLED`      |                                                                                    |
| `X-B3-SPANID`       | スパンIDが割り当てられている。                                                     |
| `X-B3-TRACEID`      | トレースIDが割り当てられている。                                                   |
| `X-B3-PARENTSPANId` | 親のスパンIDが割り当てられている。ルートスパンの場合、このヘッダーは追加されない。 |

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers

#### ▼ AWS X-Ray系ヘッダー

Envoyは、AWS X-Rayが使用するヘッダーを追加する。

| HTTPヘッダー名    | 説明                                                        |
| ----------------- | ----------------------------------------------------------- |
| `X-AMZN-TRACE-ID` | トレースIDが割り当てられている。トレースIDはALBで作られる。 |

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers
> - https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/load-balancer-request-tracing.html

<br>

### RPCヘッダーの分散トレースID

#### ▼ 標準ヘッダー

| RPCヘッダー名    | 説明                             |
| ---------------- | -------------------------------- |
| `GRPC-TRACE-BIN` | トレースIDが割り当てられている。 |

> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/trace/v3/opencensus.proto#enum-config-trace-v3-opencensusconfig-tracecontext

<br>
