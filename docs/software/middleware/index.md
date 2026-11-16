---
hide:
  - navigation
tags:
  - "ミドルウェア"
---

# セクションの目次

!!! info "このセクションについて"

    **量が多いため、[ソフトウェアセクション](https://hiroki-it.github.io/tech-notebook/software/index.html) から切り分けています**

<br>

## 🤝🏻ミドルウェア

### Web 系

!!! cards ":simple-nginx: Nginx"

    <div class="grid cards compact" markdown>

    - **[Nginx](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_nginx.html)**

      Nginx の nginx.conf とモジュール

    - **[nginx.conf](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_nginx_conf.html)**

      nginx.conf の設定ファイルの種類とディレクティブ

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_nginx_command.html)**

      nginx コマンドと service コマンドによる操作

    - **[ビルトインモジュール](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_nginx_module_builtin.html)**

      auth_request や core などの組み込みモジュール

    - **[ユーティリティモジュール](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_nginx_module_utility.html)**

      OpenTelemetry などの追加モジュールのビルド

    </div>

!!! cards ":simple-apache: Apache"

    <div class="grid cards compact" markdown>

    - **[Apache](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_apache.html)**

      Apache の apache.conf とコマンド

    - **[apache.conf](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_apache_conf.html)**

      apache.conf の設定ディレクティブ

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_apache_command.html)**

      apachectl と httpd コマンド

    </div>

<br>

### アプリケーション系

!!! cards ":simple-php: PHP-FPM"

    <div class="grid cards compact" markdown>

    - **[PHP-FPM](https://hiroki-it.github.io/tech-notebook/software/software_middleware_application_gi_fastcgi_php_fpm.html)**

      PHP-FPM の仕組みと設定

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_application_gi_fastcgi_php_fpm_conf.html)**

      global と www セクションによるプロセスの設定

    </div>

!!! cards ":simple-python: uWSGI"

    <div class="grid cards compact" markdown>

    - **[uWSGI](https://hiroki-it.github.io/tech-notebook/software/software_middleware_application_gi_wsgi_uwsgi.html)**

      uWSGI の仕組みと設定

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_application_gi_wsgi_uwsgi_conf.html)**

      uwsgi セクションによる起動時の設定

    </div>

!!! cards ":simple-python: Uvicorn"

    <div class="grid cards compact" markdown>

    - **[Uvicorn](https://hiroki-it.github.io/tech-notebook/software/software_middleware_application_gi_asgi_uvicorn.html)**

      Python の ASGI サーバー Uvicorn

    </div>

<br>

### リレーショナル DB 系

!!! cards ":material-database: RDBMS"

    <div class="grid cards compact" markdown>

    - **[RDBMS](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_rdbms.html)**

      RDBMS の仕組み、ACID、プラクティス

    - **[プラクティス集](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_rdbms_practices.html)**

      テーブル設計とアルゴリズム設計

    - **[ACID](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_rdbms_acid.html)**

      トランザクション、排他制御、リカバリー

    </div>

!!! cards ":simple-mysql: MySQL"

    <div class="grid cards compact" markdown>

    - **[MySQL](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_mysql.html)**

      MySQL の設定と DML、DCL、DDL

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_mysql_conf.html)**

      mysqld と client セクションの設定

    - **[DML (SQL)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_mysql_sql_dml.html)**

      SELECT、INSERT、EXPLAIN などのレコード操作

    - **[DCL (SQL)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_mysql_sql_dcl.html)**

      COMMIT、ROLLBACK、GRANT などのトランザクション制御

    - **[DDL (SQL)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_mysql_sql_ddl.html)**

      CREATE、DROP などのテーブル操作

    </div>

!!! cards ":simple-postgresql: PostgreSQL"

    PostgreSQL の設定と Repmgr

    <div class="grid cards compact" markdown>

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_postgresql_conf.html)**

      PostgreSQL のセットアップと設定

    - **[Repmgr](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_postgresql_repmgr.html)**

      Repmgr によるレプリケーションとフェイルオーバー

    </div>

!!! cards ":material-alert-outline: アンチパターン"

    <div class="grid cards compact" markdown>

    - **[アンチパターン](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_antipatterns.html)**

      N+1 問題などの DB 操作のアンチパターン

    </div>

!!! cards ":material-table-network: ER 図"

    <div class="grid cards compact" markdown>

    - **[ER 図](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_er.html)**

      データモデルパターンと ER 図の事例

    </div>

<br>

### <u>接続プールプロキシ系</u>

!!! cards ":simple-postgresql: PgBouncer"

    <div class="grid cards compact" markdown>

    - **[PgBouncer](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_connection_pool_proxy_pgbouncer.html)**

      PgBouncer による DB 接続のプーリング

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_connection_pool_proxy_pgbouncer_conf.html)**

      pgbouncer と databases セクションの設定

    </div>

<br>

### <u>NoSQL DB 系</u>

!!! cards ":material-database-outline: NoSQL DB"

    <div class="grid cards compact" markdown>

    - **[NoSQL DB](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_nosqldb.html)**

      NoSQL の仕組みとリーダー選出

    </div>

!!! cards ":simple-redis: Redis"

    <div class="grid cards compact" markdown>

    - **[Redis](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_nosqldb_redis.html)**

      Redis の仕組みとコマンド

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_nosqldb_redis_command.html)**

      redis-cli と get、keys などのコマンド

    </div>

<br>

### 時系列 DB 系

!!! cards ":material-chart-timeline-variant: TSDB"

    <div class="grid cards compact" markdown>

    - **[TSDB](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_tsdb.html)**

      時系列データを永続化する TSDB

    </div>

!!! cards ":simple-victoriametrics: VictoriaMetrics"

    <div class="grid cards compact" markdown>

    - **[VictoriaMetrics](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_tsdb_victoriametrics.html)**

      VictoriaMetrics の仕組みとコマンド

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_tsdb_victoriametrics_command.html)**

      victoria-metrics-prod、vmctl、API

    </div>

<br>

### サービスメッシュ系

!!! cards ":material-graph-outline: サービスメッシュ"

    <div class="grid cards compact" markdown>

    - **[サービスメッシュ](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh.html)**

      サービスメッシュの仕組みと担う責務

    - **[サービスメッシュの担う責務](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_responsibility.html)**

      トラフィック管理、回復性、認証／認可の責務

    </div>

!!! cards ":simple-envoyproxy: Envoy"

    <div class="grid cards compact" markdown>

    - **[Envoy](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_envoy.html)**

      Envoy の envoy.yaml、API、テレメトリー

    - **[envoy.yaml](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_envoy_envoy_yaml.html)**

      listeners や clusters などの envoy.yaml の設定

    - **[テレメトリー](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_envoy_telemetry.html)**

      Envoy のアクセスログ、メトリクス、分散トレース

    - **[API](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_envoy_api.html)**

      Envoy の管理 API のエンドポイント

    - **[プラクティス](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_envoy_practice.html)**

      timeout などのエラーの解決方法

    </div>

!!! cards ":simple-istio: Istio"

    <div class="grid cards compact" markdown>

    - **[Istio](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio.html)**

      Istio のコントロールプレーン、データプレーン、リソース

    - **[コントロールプレーン (サイドカーモード)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_sidecar_control_plane.html)**

      サイドカーモードの istiod と待ち受けるポート

    - **[データプレーン (サイドカーモード)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_sidecar_data_plane.html)**

      istio-proxy、istio-init、pilot-agent

    - **[コントロールプレーン (アンビエントモード)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_ambient_control_plane.html)**

      アンビエントモードの istiod と xDS API

    - **[データプレーン (アンビエントモード)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_ambient_data_plane.html)**

      ztunnel や waypoint によるデータプレーン

    - **[Istio を採用しない場合との比較](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_non.html)**

      Kubernetes のみの場合との比較とメリット

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_command.html)**

      istioctl の install、analyze、manifest diff

    - **[プラクティス集](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_practices.html)**

      トラフィック管理、アップグレード、アーキテクチャ特性

    - **[リソース](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_resource.html)**

      Gateway などの Istio リソースと Envoy 設定値の関係

    - **[設計パターン](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_patterns.html)**

      Cluster 数とコントロールプレーン数による構成パターン

    - **[リソース定義 (リソース定義)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_resource_definition.html)**

      AuthorizationPolicy や DestinationRule などの定義

    - **[共通項目 (リソース定義)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_resource_definition_common.html)**

      istio-proxy のインジェクションを決めるラベルとアノテーション

    - **[ConfigMap 系 (リソース定義)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_resource_definition_configmap.html)**

      mesh などの Istio の ConfigMap

    - **[Secret 系 (リソース定義)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_resource_definition_secret.html)**

      istio-ca-secret などの Istio の Secret

    - **[IstioOperator (IstioOperator)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_operator.html)**

      IstioOperator の仕組みと他の管理方法への移行

    - **[リソース定義 (IstioOperator)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_operator_resource_definition.html)**

      IstioOperator の metadata と spec

    </div>

<br>

### DNS 系

!!! cards ":custom-coredns: CoreDNS"

    <div class="grid cards compact" markdown>

    - **[CoreDNS](https://hiroki-it.github.io/tech-notebook/software/software_middleware_dns_coredns.html)**

      CoreDNS の仕組みと設定

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_dns_coredns_conf.html)**

      Corefile による名前解決の設定

    </div>

<br>

### セキュリティ系

!!! cards ":material-certificate: Cert Manager"

    <div class="grid cards compact" markdown>

    - **[Cert Manager](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_cert_manager.html)**

      Cert Manager による証明書の自動管理

    - **[リソース定義](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_cert_manager_resource_definition.html)**

      Certificate や Issuer などの証明書のリソース

    </div>

!!! cards ":simple-falco: Falco"

    <div class="grid cards compact" markdown>

    - **[Falco](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_falco.html)**

      Falco によるランタイムの脅威検知

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_falco_conf.html)**

      Falco のセットアップと設定ファイル

    </div>

!!! cards ":simple-keycloak: Keycloak"

    <div class="grid cards compact" markdown>

    - **[Keycloak](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_keycloak.html)**

      Keycloak による認証と認可

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_keycloak_conf.html)**

      keycloak.conf と環境変数による設定

    - **[JavaScript (クライアント)](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_keycloak_client_package_javascript.html)**

      JavaScript の Keycloak クライアント

    </div>

!!! cards ":custom-oauth2-proxy: OAuth2 Proxy"

    <div class="grid cards compact" markdown>

    - **[OAuth2 Proxy](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_oauth2_proxy.html)**

      OAuth2 Proxy による認証の前段処理

    - **[設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_oauth2_proxy_conf.html)**

      プロバイダーやリダイレクト URL などの設定

    </div>

<br>

### メッセージング系

!!! cards ":simple-rabbitmq: RabbitMQ"

    <div class="grid cards compact" markdown>

    - **[RabbitMQ](https://hiroki-it.github.io/tech-notebook/software/software_middleware_messaging_message_broker_rabbitmq.html)**

      RabbitMQ によるメッセージのキューイングとルーティング

    </div>

!!! cards ":simple-apachekafka: Apache Kafka"

    <div class="grid cards compact" markdown>

    - **[Apache Kafka](https://hiroki-it.github.io/tech-notebook/software/software_middleware_messaging_message_streamer_apache_kafka.html)**

      Apache Kafka によるメッセージストリーム

    </div>

<br>

### データ分析系

!!! cards ":material-chart-bar: データ分析"

    <div class="grid cards compact" markdown>

    - **[データ分析](https://hiroki-it.github.io/tech-notebook/software/software_middleware_data_analysis.html)**

      データレイク、データウェアハウス、データメッシュ

    </div>

<br>
