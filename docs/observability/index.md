---
hide:
  - navigation
tags:
  - "可観測性"
---

# セクションの目次

## 🔎 可観測性

### 可観測性、監視

!!! cards ":material-eye-outline: 可観測性"

    <div class="grid cards compact" markdown>

    - **[可観測性](https://hiroki-it.github.io/tech-notebook/observability/observability.html)**

      可観測性とテレメトリー、テレメトリー間の紐付け

    </div>

!!! cards ":material-monitor-eye: 監視"

    <div class="grid cards compact" markdown>

    - **[監視](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring.html)**

      監視、オンコール、インシデント管理、サービスレベル

    - **[オンコール](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_oncall.html)**

      オンコールとアラートの重要度

    - **[インシデント管理](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_incident_management.html)**

      インシデントの解決、組織化、事後評価

    - **[サービスレベル](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_service_level.html)**

      SLI、SLO、SLA とエラーバジェット

    </div>

<br>

### テレメトリー

!!! cards ":material-text-box-outline: ログ"

    <div class="grid cards compact" markdown>

    - **[ログ](https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_log.html)**

      ログの収集方式、フィールド、トレースとの相関

    </div>

!!! cards ":material-chart-line: メトリクス"

    <div class="grid cards compact" markdown>

    - **[メトリクス](https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_metrics.html)**

      監視するべきメトリクスとトレースとの相関

    </div>

!!! cards ":material-chart-gantt: 分散トレース"

    <div class="grid cards compact" markdown>

    - **[分散トレース](https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_trace.html)**

      分散トレースのトレースコンテキストとスパン

    </div>

<br>

### 監視ツール

!!! cards ":material-tools: 監視ツール"

    <div class="grid cards compact" markdown>

    - **[監視ツール](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools.html)**

      監視ツールの比較とテレメトリーを利用したデバッグ

    </div>

!!! cards ":simple-datadog: Datadog"

    <div class="grid cards compact" markdown>

    - **[Datadog](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog.html)**

      Datadog のエージェント設定とテレメトリー収集

    - **[datadog エージェントの設定](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_agent_conf.html)**

      datadog.yaml によるエージェントの設定

    - **[インテグレーション](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_integration.html)**

      AWS や PHP-FPM などのインテグレーション

    - **[メトリクス (テレメトリー収集)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_metrics.html)**

      Datadog エージェントによるメトリクス収集

    - **[ログ (テレメトリー収集)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_log.html)**

      Datadog エージェントによるログ収集

    - **[分散トレース (テレメトリー収集)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_trace.html)**

      Datadog エージェントによる分散トレース収集

    - **[テレメトリー間の紐付け (テレメトリー収集)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_telemetry_association.html)**

      統合タグによるテレメトリー間の紐付け

    - **[分散トレース (テレメトリー収集)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_datadog_client_package_trace.html)**

      PHP、JavaScript、Go の Datadog クライアント

    </div>

!!! cards ":simple-fluentbit: FluentBit/Fluentd"

    <div class="grid cards compact" markdown>

    - **[FluentBit/Fluentd](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_fluentbit_fluentd.html)**

      FluentBit/Fluentd によるログの収集と転送

    - **[設定ファイル (FluentBit)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_fluentbit_conf.html)**

      INPUT、PARSER、FILTER などのセクション

    - **[コマンド (FluentBit)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_fluentbit_command.html)**

      fluent-bit コマンドの使い方

    - **[リソース定義 (FluentBit)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_fluentbit_resource_definition.html)**

      FluentBit のチャートによるセットアップ

    </div>

!!! cards ":simple-grafana: Grafana"

    <div class="grid cards compact" markdown>

    - **[Grafana](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_grafana.html)**

      Grafana のダッシュボードと設定

    - **[リソース定義 (リソース定義)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_grafana_resource_definition.html)**

      Grafana のチャートによるセットアップ

    - **[ConfigMap 系 (リソース定義)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_grafana_resource_definition_configmap.html)**

      grafana.ini とデータソースの ConfigMap

    - **[ダッシュボード (リソース定義)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_grafana_resource_definition_dashboard.html)**

      ConfigMap によるダッシュボードの作成

    </div>

!!! cards ":simple-jaeger: Jaeger"

    <div class="grid cards compact" markdown>

    - **[Jaeger](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_jaeger.html)**

      Jaeger による分散トレースの可視化

    </div>

!!! cards ":custom-kiali: Kiali"

    <div class="grid cards compact" markdown>

    - **[Kiali](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_kiali.html)**

      Kiali によるサービスメッシュの可視化

    - **[ConfigMap 系 (リソース定義)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_kiali_resource_definition_configmap.html)**

      kiali-cm による Kiali の設定

    </div>

!!! cards ":simple-opentelemetry: OpenTelemetry"

    <div class="grid cards compact" markdown>

    - **[OpenTelemetry](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry.html)**

      OpenTelemetry による計装とテレメトリー収集

    - **[リソース定義](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_resource_definition.html)**

      Instrumentation と OpenTelemetryCollector

    - **[計装 (計装)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_client_package_instrumentation.html)**

      分散トレース、ログ、メトリクスの計装

    - **[クライアントパッケージ (計装)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_client_package_trace.html)**

      TracerProvider、Exporter、Span Processor

    - **[Go (計装)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_client_package_trace_go.html)**

      Go による分散トレースの計装

    - **[Python (計装)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_client_package_trace_python.html)**

      Python による分散トレースの計装

    - **[OpenTelemetry (OpenTelemetry Collector)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_collector.html)**

      OpenTelemetry Collector の仕組みとデザインパターン

    - **[設定ファイル (OpenTelemetry Collector)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_open_telemetry_collector_config.html)**

      receivers、processors、exporters の設定

    </div>

!!! cards ":simple-prometheus: Prometheus"

    <div class="grid cards compact" markdown>

    - **[Prometheus](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus.html)**

      Prometheus の Exporter、PromQL、設定

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_conf.html)**

      Prometheus と Alertmanager の設定

    - **[リソース定義](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_resource_definition.html)**

      PodMonitor、Probe、AlertmanagerConfig

    - **[Exporter (Exporter)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_exporter.html)**

      MySQL や PostgreSQL などの Exporter

    - **[Blackbox Exporter (Exporter)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_exporter_blackbox_exporter.html)**

      外部システムを監視する Blackbox Exporter

    - **[kube-state-metrics (Exporter)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_exporter_kube_state_metrics.html)**

      Kubernetes リソースのメトリクスを収集

    - **[Node Exporter (Exporter)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_exporter_node_exporter.html)**

      Node のメトリクスを収集する Node Exporter

    - **[メトリクス (メトリクス)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_metrics.html)**

      メトリクスのディメンションとプラクティス

    - **[PromQL (メトリクス)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_metrics_promql.html)**

      PromQL によるメトリクスの集約

    - **[クライアントパッケージ (メトリクス)](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_prometheus_metrics_client_package.html)**

      データポイントを公開するクライアントパッケージ

    </div>

!!! cards ":simple-google: Google アプリ"

    Google アナリティクスと Google サーチコンソール

    <div class="grid cards compact" markdown>

    - **[Google アナリティクス](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_google_analytics.html)**

      Google アナリティクスのセットアップと用語

    - **[Google サーチコンソール](https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring_tools_google_search_console.html)**

      Google サーチコンソールの用語

    </div>

<br>

### インシデント管理ツール

!!! cards ":simple-pagerduty: PagerDuty"

    <div class="grid cards compact" markdown>

    - **[PagerDuty](https://hiroki-it.github.io/tech-notebook/observability/observability_incident_management_pagerduty.html)**

      PagerDuty によるインシデント管理

    </div>

<br>
