# コンテナオーケストレーション

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. コンテナオーケストレーションの種類

### 単一ホスト上のコンテナオーケストレーション

単一ホスト上のコンテナが対象である．異なるDockerfileに基づいて，dockerイメージのビルド，コンテナレイヤーの生成，コンテナの構築，コンテナの起動，を実行できる．

| ツール名                       | ベンダー |
| ------------------------------ | -------- |
| Docker Compose                 | Docker   |
| ECS：Elastic Container Service | Amazon   |

<br>

### 複数ホストに渡るコンテナオーケストレーション

複数ホスト上のコンテナが対象である．どのホスト上のdockerデーモンに対して，どのコンテナに関する操作を行うのかを選択的に命令できる．

参考：https://www.techrepublic.com/article/simplifying-the-mystery-when-to-use-docker-docker-compose-and-kubernetes/

| ツール名                        | ベンダー |
| ------------------------------- | -------- |
| Docker Swarm                    | Docker   |
| Kubernetes                      | Google   |
| EKS：Elastic Kubernetes Service | Amazon   |

<br>

## 02. コンテナデザインパターン

### サイドカーパターン

#### ・サイドカーパターンとは

アプリケーションコンテナと同じECSタスクやPod内に，アプリケーションの一部の機能のみを持つコンテナを配置する．

#### ・ロギングコンテナの配置

FluentBitコンテナをサイドカーコンテナとして稼働させ，アプリケーションコンテナから送信されたログを他にルーティングする．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/observability_monitering/observability_fluentbit.html

#### ・メトリクス収集コンテナの配置

Datadogコンテナをサイドカーコンテナとして稼働させ，アプリケーションコンテナからメトリクスを収集する．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/observability_monitering/observability_datadog_metrics.html

<br>

### アンバサダーパターン

#### ・アンバサダーパターンとは

アプリケーションコンテナと同じECSタスクやPod内に，リバースプロキシコンテナ（Envoy，Linkerd，など）を配置する．サービスメッシュを実現するために採用される．サイドカーパターンではないが，このプロキシコンテナのことをサイドカーコンテナともいう．

参考：https://logmi.jp/tech/articles/321841

<br>

### アダプターパターン

