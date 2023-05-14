---
title: 【IT技術の知見】テレメトリー＠Envoy
description: テレメトリー＠Envoyの知見を記録しています。
---

# テレメトリー＠Envoy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ログ (アクセスログのみ)

### アクセスログ

#### ▼ アクセスログ形式

Envoyは、Eアプリコンテナへのアクセスログを作成し、標準出力に出力する。

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

> ↪️：https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#default-format-string

<br>

## 02. メトリクス

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

Envoyは、分散トレースを作成できるように、自分で自分を通過した通信にHTTPヘッダーやRPCヘッダーに分散トレースIDを割り当てる。

> ↪️：https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/observability/tracing#arch-overview-tracing-context-propagation

<br>

### HTTPヘッダーの分散トレースID

#### ▼ 標準ヘッダー

| HTTPヘッダー名 | 説明                             |
| -------------- | -------------------------------- |
| `X-REQUEST-ID` | トレースIDが割り当てられている。 |

> ↪️：https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers

#### ▼ zipkin系ヘッダー

Envoyは、Zipkinが使用するヘッダーを追加する。

> ↪️：https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers

| HTTPヘッダー名      | 説明                                                                               |
| ------------------- | ---------------------------------------------------------------------------------- |
| `X-B3-SAMPLED`      |                                                                                    |
| `X-B3-SPANID`       | スパンIDが割り当てられている。                                                     |
| `X-B3-TRACEID`      | トレースIDが割り当てられている。                                                   |
| `X-B3-PARENTSPANId` | 親のスパンIDが割り当てられている。ルートスパンの場合、このヘッダーは追加されない。 |

#### ▼ AWS X-Ray系ヘッダー

Envoyは、AWS X-Rayが使用するヘッダーを追加する。

> ↪️：https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers

| HTTPヘッダー名    | 説明                             |
| ----------------- | -------------------------------- |
| `X-AMZN-TRACE-ID` | トレースIDが割り当てられている。 |

<br>

### RPCヘッダーの分散トレースID

#### ▼ 標準ヘッダー

| RPCヘッダー名    | 説明                             |
| ---------------- | -------------------------------- |
| `GRPC-TRACE-BIN` | トレースIDが割り当てられている。 |

> ↪️：https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/trace/v3/opencensus.proto#enum-config-trace-v3-opencensusconfig-tracecontext

<br>
