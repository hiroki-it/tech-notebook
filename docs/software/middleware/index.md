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

<div class="grid cards compact" markdown>

- **Nginx**

  [Nginx](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_nginx.html) ・ [nginx.conf](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_nginx_conf.html) ・ [コマンド](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_nginx_command.html) ・ [ビルトインモジュール](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_nginx_module_builtin.html) ・ [ユーティリティモジュール](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_nginx_module_utility.html)

- **Apache**

  [Apache](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_apache.html) ・ [apache.conf](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_apache_conf.html) ・ [コマンド](https://hiroki-it.github.io/tech-notebook/software/software_middleware_web_apache_command.html)

</div>

<br>

### アプリケーション系

<div class="grid cards compact" markdown>

- **PHP-FPM**

  [PHP-FPM](https://hiroki-it.github.io/tech-notebook/software/software_middleware_application_gi_fastcgi_php_fpm.html) ・ [設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_application_gi_fastcgi_php_fpm_conf.html)

- **uWSGI**

  [uWSGI](https://hiroki-it.github.io/tech-notebook/software/software_middleware_application_gi_wsgi_uwsgi.html) ・ [設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_application_gi_wsgi_uwsgi_conf.html)

- **Uvicorn**

  [Uvicorn](https://hiroki-it.github.io/tech-notebook/software/software_middleware_application_gi_asgi_uvicorn.html)

</div>

<br>

### リレーショナル DB 系

<div class="grid cards compact" markdown>

- **RDBMS**

  [RDBMS](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_rdbms.html) ・ [プラクティス集](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_rdbms_practices.html) ・ [ACID](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_rdbms_acid.html)

- **MySQL**

  [My︎SQL](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_mysql.html) ・ [設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_mysql_conf.html) ・ SQL（[DML](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_mysql_sql_dml.html)・[DCL](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_mysql_sql_dcl.html)・[DDL](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_mysql_sql_ddl.html)）

- **PostgreSQL**

  [設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_postgresql_conf.html) ・ [Repmgr](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_postgresql_repmgr.html)

- **[アンチパターン](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_antipatterns.html)**

- **[ER 図](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_er.html)**

</div>

<br>

### <u>接続プールプロキシ系</u>

<div class="grid cards compact" markdown>

- **PgBouncer**

  [PgBouncer](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_connection_pool_proxy_pgbouncer.html) ・ [設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_connection_pool_proxy_pgbouncer_conf.html)

</div>

<br>

### <u>NoSQL DB 系</u>

<div class="grid cards compact" markdown>

- **[NoSQL DB](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_nosqldb.html)**

- **Redis**

  [Redis](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_nosqldb_redis.html) ・ [コマンド](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_nosqldb_redis_command.html)

</div>

<br>

### 時系列 DB 系

<div class="grid cards compact" markdown>

- **[TSDB](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_tsdb.html)**

- **VictoriaMetrics**

  [VictoriaMetrics](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_tsdb_victoriametrics.html) ・ [コマンド](https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_tsdb_victoriametrics_command.html)

</div>

<br>

### サービスメッシュ系

<div class="grid cards compact" markdown>

- **サービスメッシュ**

  [サービスメッシュ](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh.html) ・ [サービスメッシュの担う責務](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_responsibility.html)

- **Envoy**

  [Envoy](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_envoy.html) ・ [envoy.yaml](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_envoy_envoy_yaml.html) ・ [テレメトリー](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_envoy_telemetry.html) ・ [API](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_envoy_api.html) ・ [プラクティス](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_envoy_practice.html)

- **Istio**

  [Istio](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio.html) ・ サイドカーモード（[コントロールプレーン](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_sidecar_control_plane.html)・[データプレーン](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_sidecar_data_plane.html)） ・ アンビエントモード（[コントロールプレーン](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_ambient_control_plane.html)・[データプレーン](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_ambient_data_plane.html)） ・ [Istio を採用しない場合との比較](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_non.html) ・ [コマンド](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_command.html) ・ [プラクティス集](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_practices.html) ・ [リソース](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_resource.html) ・ [設計パターン](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_patterns.html) ・ リソース定義（[リソース定義](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_resource_definition.html)・[共通項目](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_resource_definition_common.html)・[ConfigMap 系](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_resource_definition_configmap.html)・[Secret 系](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_resource_definition_secret.html)） ・ IstioOperator（[IstioOperator](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_operator.html)・[リソース定義](https://hiroki-it.github.io/tech-notebook/software/software_middleware_service_mesh_istio_operator_resource_definition.html)）

</div>

<br>

### DNS 系

<div class="grid cards compact" markdown>

- **CoreDNS**

  [CoreDNS](https://hiroki-it.github.io/tech-notebook/software/software_middleware_dns_coredns.html) ・ [設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_dns_coredns_conf.html)

</div>

<br>

### セキュリティ系

<div class="grid cards compact" markdown>

- **Cert Manager**

  [Cert Manager](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_cert_manager.html) ・ [リソース定義](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_cert_manager_resource_definition.html)

- **Falco**

  [Falco](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_falco.html) ・ [設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_falco_conf.html)

- **Keycloak**

  [Keycloak](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_keycloak.html) ・ [設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_keycloak_conf.html) ・ クライアント（[JavaScript](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_keycloak_client_package_javascript.html)）

- **OAuth2 Proxy**

  [OAuth2 Proxy](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_oauth2_proxy.html) ・ [設定ファイル](https://hiroki-it.github.io/tech-notebook/software/software_middleware_security_oauth2_proxy_conf.html)

</div>

<br>

### メッセージング系

<div class="grid cards compact" markdown>

- **[RabbitMQ](https://hiroki-it.github.io/tech-notebook/software/software_middleware_messaging_message_broker_rabbitmq.html)**

- **[Apache Kafka](https://hiroki-it.github.io/tech-notebook/software/software_middleware_messaging_message_streamer_apache_kafka.html)**

</div>

<br>

### データ分析系

<div class="grid cards compact" markdown>

- **[データ分析](https://hiroki-it.github.io/tech-notebook/software/software_middleware_data_analysis.html)**

</div>

<br>
