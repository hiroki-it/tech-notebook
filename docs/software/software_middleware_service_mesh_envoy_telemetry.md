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

### アクセスログ形式と変数

#### ▼ 非構造化ログ (デフォルト)

Envoyは、マイクロサービスへのアクセスログ (インバウンド通信とアウトバウンド通信の両方) を作成し、標準出力に出力する。

例えば、以下の形式と変数で定義したとする。

```bash
[%START_TIME%] "%REQ(:METHOD)% %REQ(X-ENVOY-ORIGINAL-PATH?:PATH)% %PROTOCOL%" "%RESPONSE_CODE%" "%RESPONSE_FLAGS%" "%BYTES_RECEIVED%" "%BYTES_SENT%" "%DURATION%" "%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%" "%REQ(X-FORWARDED-FOR)%" "%REQ(USER-AGENT)%" "%REQ(X-REQUEST-ID)%" "%REQ(:AUTHORITY)%" "%UPSTREAM_HOST%"
```

これにより、以下のアクセスログを出力する。

```bash
[2016-04-15T20:17:00.310Z] "POST /api/v1/locations HTTP/2" 204 - 154 0 226 100 "10.0.35.28" "nsq2http" "cc21d9b0-cf5c-432b-8c7e-98aeb7988cd2" "locations" "tcp://10.0.2.1:80"
```

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#default-format-string

#### ▼ 構造化ログ

Envoyは、マイクロサービスへのアクセスログ (インバウンド通信とアウトバウンド通信の両方) を作成し、標準出力に出力する。

デフォルトでは非構造化ログを出力するが、ログを構造化できる。

例えば、以下の形式と変数で定義したとする。

```yaml
{
  "access_log_type": "%ACCESS_LOG_TYPE%",
  "bytes_received": "%BYTES_RECEIVED%",
  "bytes_sent": "%BYTES_SENT%",
  "downstream_transport_failure_reason": "%DOWNSTREAM_TRANSPORT_FAILURE_REASON%",
  "downstream_remote_port": "%DOWNSTREAM_REMOTE_PORT%",
  "duration": "%DURATION%",
  "grpc_status": "%GRPC_STATUS(CAMEL_STRING)%",
  "method": "%REQ(:METHOD)%",
  "path": "%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%",
  "protocol": "%PROTOCOL%",
  "response_code": "%RESPONSE_CODE%",
  "response_flags": "%RESPONSE_FLAGS%",
  "start_time": "%START_TIME%",
  "trace_id": "%TRACE_ID%",
  "traceparent": "%REQ(TRACEPARENT)%",
  "upstream_remote_port": "%UPSTREAM_REMOTE_PORT%",
  "upstream_transport_failure_reason": "%UPSTREAM_TRANSPORT_FAILURE_REASON%",
  "user_agent": "%REQ(USER-AGENT)%",
  "x_forwarded_for": "%REQ(X-FORWARDED-FOR)%",
}
```

これにより、以下のアクセスログを出力する。

```yaml
{
  "access_log_type": "DownstreamEnd",
  "bytes_received": 0,
  "bytes_sent": 438,
  "downstream_remote_port": 54078,
  "downstream_transport_failure_reason": null,
  "duration": 14,
  "filter_chain_name": "0.0.0.0_9080",
  "grpc_status": null,
  "method": "GET",
  "path": "/foo/1",
  "protocol": "HTTP/1.1",
  "response_code": 200,
  "response_flags": "-",
  "start_time": "2025-01-18T13:39:50.094Z",
  "trace_id": "d34ea2aa01d34d0fda79c6d09b097a83",
  "traceparent": "00-d34ea2aa01d34d0fda79c6d09b097a83-fd0eae41e95a263c-01",
  "upstream_host": "10.244.5.8:9080",
  "upstream_remote_port": 9080,
  "upstream_transport_failure_reason": null,
  "user_agent": "curl/8.7.1",
  "virtual_cluster_name": null,
  "x_forwarded_for": null,
}
```

#### ▼ `%ACCESS_LOG_TYPE%`

アクセスログの作成のタイミングを表す。

例えば、`DownstreamEnd`であれば、`http_connection_manager`が通信を終了した時に作成されたログである。

#### ▼ `%REQ()`

リクエストヘッダーから値を出力する。

| リクエストヘッダー   | 出力方法                             | 例                                                        |
| -------------------- | ------------------------------------ | --------------------------------------------------------- |
| traceparent          | `%REQ(TRACEPARENT)%`                 | `00-d34ea2aa01d34d0fda79c6d09b097a83-fd0eae41e95a263c-01` |
| HTTPメソッド         | `%REQ(:METHOD)%`                     | `GET`                                                     |
| パス                 | `%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%` | `/foo/1`                                                  |
| ユーザーエージェント | `%REQ(USER-AGENT)%'`                 | `curl/8.7.1`                                              |
| X-Forwarded-for      | `%REQ(X-FORWARDED-FOR)%`             | 記入中...                                                 |

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#format-rules

#### ▼ `%RESP()`

レスポンスヘッダーから値を出力する。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#format-rules

#### ▼ `%TRACE_ID%`

トレースコンテキスト仕様 (例：traceparentなど) からトレースIDのみを取得し、抽出する。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#format-rules

#### ▼ `%GRPC_STATUS()%`

gRPCのステータスを出力する。

例えば、gRPCのステータスが`InvalidArgument` (ステータスコード`3`) だとする。

`%GRPC_STATUS(CAMEL_STRING)%`であれば、gRPCのステータスをキャメルケース (`InvalidArgument`) で出力する。

`%GRPC_STATUS(NUMBER)%`であれば、gRPCのステータスを数値 (`3`) で出力する。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#format-rules

<br>

#### ▼ `%RESPONSE_FLAGS%`

Cluster外からのリクエスト/Pod間通信時のレスポンスの補足メッセージを表す。

ステータスコードと合わせて、レスポンスのエラーや警告の理由を読み取ることに役立つ。

宛先が原因のメッセージは以下の通りである。

| 名前  | 正式名称                          | ステータスコード | 説明                                                                        |
| ----- | --------------------------------- | :--------------: | --------------------------------------------------------------------------- |
| `NC`  | `NO_CLUSTER_FOUND`                |       なし       | クラスターの設定が見つからず、Envoyは宛先に接続できなかった。               |
| `UC`  | `UPSTREAM_CONNECTION_TERMINATION` |      `503`       | 遭遇率が一番高い。Envoyは何らかの理由で宛先に接続できなかった。             |
| `UF`  | `UPSTREAM_CONNECTION_FAILURE`     |      `503`       | Envoyは通信障害で宛先に接続できなかった。                                   |
| `UH`  | `NO_HEALTHY_UPSTREAM`             |      `503`       | Envoyは宛先異常で接続できなかった。                                         |
| `UT`  | `UPSTREAM_REQUEST_TIMEOUT`        |      `503`       | Envoyはタイムアウトで宛先に接続できなかった。                               |
| `UO`  | `UPSTREAM_OVERFLOW`               |      `503`       | サーキットブレイカーで、Envoyは宛先に接続できなかった。                     |
| `URX` | `UPSTREAM_RETRY_LIMIT_EXCEEDED`   |       なし       | 宛先に対するリトライの上限数の超過で、Envoyは宛先に接続拒否されてしまった。 |

送信元が原因のメッセージは以下の通りである。

| 名前  | 正式名称                            | ステータスコード | 説明                                                                            |
| ----- | ----------------------------------- | :--------------: | ------------------------------------------------------------------------------- |
| `DC`  | `DOWNSTREAM_CONNECTION_TERMINATION` |       なし       | Envoyの宛先へのリクエストが中断され、Envoyはレスポンスを受信できなかった。      |
| `DPE` | `DOWNSTREAM_PROTOCOL_ERROR`         |       なし       | EnvoyはHTTPプロトコルのエラーで送信元に接続できなかった。                       |
| `NR`  | `NO_ROUTE_FOUND`                    |      `404`       | ルートやフィルターチェーンの設定が見つからず、Envoyは送信元に接続できなかった。 |

> - https://github.com/istio/proxy/blob/1.14.3/extensions/common/util.cc#L29-L56
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage
> - https://medium.com/expedia-group-tech/all-about-istio-proxy-5xx-issues-e0221b29e692
> - https://discuss.istio.io/t/periodic-response-code-0-and-dc-response-flag/9349
> - https://karlstoney.com/2019/05/31/istio-503s-ucs-and-tcp-fun-times/

<br>

### 監視バックエンドへの送信

#### ▼ AWS CloudWatch Logsの場合

直接的にAWS CloudWatch Logsに送信できない。

そのため、Envoyのログを一度標準出力に出力し、これをログ収集ツール (例：FluentBit) でAWS CloudWatch Logsにフォワーディングする。

<br>

## 02. メトリクス

### メトリクスの種類

#### ▼ メトリクス名のルール

Envoyのメトリクスには、`envoy_`というプレフィクスがついている。

#### ▼ 通信全体に関するメトリクス

`envoy_downstream_*****` (インバウンド系)、`envoy_upstream_*****` (アウトバウンド系) のメトリクスがある。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/stats
> - https://docs.aws.amazon.com/app-mesh/latest/userguide/envoy-metrics.html

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

### 監視バックエンドへの送信

Envoyの`15090`番ポートでは、メトリクス収集ツール (例：Prometheus) からのリクエストを待ち受ける。

Envoyが、`/stats/prometheus`エンドポイントでリクエストを待ち受けており、データポイントを含むレスポンスを返信する。

もしサービスメッシュツール (例：Istio、Linkerdなど) を使用する場合、コントロールプレーン側にも同じエンドポイントがあり、メトリクス収集ツールはこちら側を指定することが多い。

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

### Carrier

Envoyは、自身を通過したリクエストのCarrier (例：HTTPヘッダー、gRPCメタデータなど) にリクエストIDを設定する。

> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/observability/tracing

#### ▼ Carrierの種類

Envoyでは、さまざまなCarrierを使用できる。

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers

#### ▼ リクエストIDの作成

EnvoyはIDを自動作成する。

また、受信したリクエストのCarrier (例：HTTPヘッダー、gRPCメタデータなど) に`X-REQUEST-ID`ヘッダーを割り当てる。

> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/observability/tracing

#### ▼ IDの結合

Envoyは、`X-REQUEST-ID`ヘッダーの自動作成IDと`X-CLIENT-TRACE-ID`の外部作成IDを結合する

> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/observability/tracing
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers#config-http-conn-man-headers-x-client-trace-id

<br>

### 監視バックエンドへのスパンの送信

#### ▼ スパンの送信

Envoyは、Exporterとしてスパンを監視バックエンドに送信する。

これにより、マイクロサービス側でExporterを実装する必要がなくなる。

ただし、もしマイクロサービス側でExporterを設定しないとEnvoyとマイクロサービスの処理時間を合計したスパンを送信する。

マイクロサービスとEnvoyの両方で設定すると、Envoyとマイクロサービスをちゃんと区別したスパンになる。

> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/observability/tracing#arch-overview-tracing-context-propagation
> - https://istio.io/latest/about/faq/distributed-tracing/#how-envoy-based-tracing-works
> - https://aws.amazon.com/jp/blogs/news/ship-and-visualize-your-istio-virtual-service-traces-with-aws-x-ray-jp/

#### ▼ トレースコンテキスト仕様

監視バックエンドの種類を指定することで、送信するトレースコンテキストの仕様を切り替えられる。

- Datadog (Datadogコンテキスト)
- OpenTelemetry (W3C Trace Context、Baggage)
- X-Ray (X-Rayコンテキスト)
- Zipkin (B3)
- など

> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/observability/tracing
> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/trace/v3/http_tracer.proto#envoy-v3-api-msg-config-trace-v3-tracing

#### ▼ X-Rayの場合

スパンをX-Rayデーモンに送信して、X-Rayで分散トレースを監視できる。

一部のサービスメッシュツール (例：AWS VPC Lattice) では、Envoyのこの機能を使用して、X-Rayにスパンを送信する。

注意点として、サービスメッシュツール (例：Istio) によっては、X-Rayデーモンにスパンを送信できず、代わりにOpenTelemetry Collectorにスパンを送信しないといけない場合がある。

> - https://github.com/envoyproxy/envoy/blob/v1.27.0/api/envoy/config/trace/v3/xray.proto
> - https://github.com/istio/istio/issues/36599
> - https://www.appmeshworkshop.com/x-ray/

<br>

### スパン

#### ▼ operation

スパン名が決まる。

`x-envoy-decorator-operation`ヘッダーの値を変更することで上書きできる。

```yaml
{
  "route_config":
    {
      "routes":
        [
          {
            "decorator":
              {
                "operation": "<foo>.<foo-namespace>.svc.cluster.local:<ポート番号>/*",
              },
          },
        ],
    },
}
```

> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/route/v3/route_components.proto#config-route-v3-decorator
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#config-http-filters-router-x-envoy-decorator-operation

<br>
