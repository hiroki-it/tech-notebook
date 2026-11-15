---
hide:
  - navigation
tags:
  - "可観測性"
---

# セクションの目次

## 🔎 可観測性

### 可観測性、監視

<div class="grid cards compact" markdown>

- **[可観測性](https://hiroki-it.github.io/tech-notebook/observability/observability.html)**

  可観測性とテレメトリー、テレメトリー間の紐付け

- **監視**

  監視、オンコール、インシデント管理、サービスレベル

  [監視](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring.html) ・ [オンコール](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_oncall.html) ・ [インシデント管理](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_incident_management.html) ・ [サービスレベル](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_service_level.html)

</div>

<br>

### テレメトリー

<div class="grid cards compact" markdown>

- **[ログ](https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_log.html)**

  ログの収集方式、フィールド、トレースとの相関

- **[メトリクス](https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_metrics.html)**

  監視するべきメトリクスとトレースとの相関

- **[分散トレース](https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_trace.html)**

  分散トレースのトレースコンテキストとスパン

</div>

<br>

### 監視ツール

<div class="grid cards compact" markdown>

- **[監視ツール](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools.html)**

  監視ツールの比較とテレメトリーを利用したデバッグ

- **Datadog**

  Datadog のエージェント設定とテレメトリー収集

  [Datadog](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog.html) ・ [datadog エージェントの設定](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_agent_conf.html) ・ [インテグレーション](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_integration.html) ・ テレメトリー収集（[メトリクス](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_metrics.html)・[ログ](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_log.html)・[分散トレース](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_trace.html)・[テレメトリー間の紐付け](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_telemetry_association.html)・クライアントパッケージ（[分散トレース](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_client_package_trace.html)））

- **FluentBit/Fluentd**

  FluentBit/Fluentd によるログの収集と転送

  [FluentBit/Fluentd](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_fluentbit_fluentd.html) ・ FluentBit（[設定ファイル](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_fluentbit_conf.html)・[コマンド](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_fluentbit_command.html)・[リソース定義](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_fluentbit_resource_definition.html)）

- **Grafana**

  Grafana のダッシュボードと設定

  [Grafana](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_grafana.html) ・ リソース定義（[リソース定義](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_grafana_resource_definition.html)・[ConfigMap 系](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_grafana_resource_definition_configmap.html)・[ダッシュボード](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_grafana_resource_definition_dashboard.html)）

- **Jaeger**

  Jaeger による分散トレースの可視化

  [Jaeger](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_jaeger.html)

- **Kiali**

  Kiali によるサービスメッシュの可視化

  [Kiali](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_kiali.html) ・ リソース定義（[ConfigMap 系](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_kiali_resource_definition_configmap.html)）

- **OpenTelemetry**

  OpenTelemetry による計装とテレメトリー収集

  [OpenTelemetry](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry.html) ・ [リソース定義](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_resource_definition.html) ・ 計装（[計装](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_client_package_instrumentation.html)・分散トレース（[クライアントパッケージ](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_client_package_trace.html)・[Go](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_client_package_trace_go.html)・[Python](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_client_package_trace_python.html)）） ・ OpenTelemetry Collector（[OpenTelemetry](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_collector.html)・[設定ファイル](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_collector_config.html)）

- **Prometheus**

  Prometheus の Exporter、PromQL、設定

  [Prometheus](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus.html) ・ [設定ファイル](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_conf.html) ・ [リソース定義](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_resource_definition.html) ・ Exporter（[Exporter](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_exporter.html)・[Blackbox Exporter](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_exporter_blackbox_exporter.html)・[kube-state-metrics](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_exporter_kube_state_metrics.html)・[Node Exporter](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_exporter_node_exporter.html)） ・ メトリクス（[メトリクス](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_metrics.html)・[PromQL](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_metrics_promql.html)・[クライアントパッケージ](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_metrics_client_package.html)）

- **Google アプリ**

  Google アナリティクスと Google サーチコンソール

  [Google アナリティクス](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_google_analytics.html) ・ [Google サーチコンソール](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_google_search_console.html)

</div>

<br>

### インシデント管理ツール

<div class="grid cards compact" markdown>

- **[PagerDuty](https://hiroki-it.github.io/tech-notebook/observability/observability_incident_management_pagerduty.html)**

  PagerDuty によるインシデント管理

</div>

<br>
