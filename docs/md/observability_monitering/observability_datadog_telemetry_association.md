# テレメトリー間の紐付け

## 01. タグ

### タグの種類

参考：

- https://docs.datadoghq.com/ja/getting_started/tagging/
- https://www.datadoghq.com/ja/blog/tagging-best-practices/

| タグ名        | 説明                                                         |
| ------------- | ------------------------------------------------------------ |
| ```host```    | メトリクス、ログ、分散トレースの送信元のホスト名を示す。テレメトリーが生成元とは別の場所から送信されている場合に役立つ。 |
| ```device```  |                                                              |
| ```source```  | ログの生成元のベンダー名を示す。                             |
| ```service``` | メトリクス、ログ、分散トレースの生成元のアプリケーション名を示す。 |
| ```env```     | メトリクス、ログ、分散トレースの生成元の実行環境名を示す。   |
| ```version``` | メトリクス、ログ、分散トレースの生成元のリリースバージョンを示す。 |

<br>

### 統合タグ付け

統合タグ（```service```、```env```、```version```）に同じ値を割り当てると、テレメトリー間を紐づけられる。

参考：https://docs.datadoghq.com/ja/getting_started/tagging/unified_service_tagging/?tab=kubernetes

<br>

### 各コンソール画面での使い方

参考：https://docs.datadoghq.com/ja/getting_started/tagging/using_tags/

<br>

## 02. 構造化ログと他テレメトリー間の紐付け

### 分散トレース全体との紐付け

スパンと構造化ログの統合タグ（```service```、```env```、```version```）に同じ値を割り当てると、分散トレース全体と構造化ログ間を紐付けられる。

参考：https://docs.datadoghq.com/ja/tracing/connect_logs_and_traces/

<br>

### スパンとの紐付け

スパンと構造化ログに、同じトレースIDとスパンIDを割り当てると、スパンと構造化ログ間を紐付けられる。これにより、その構造化ログが、いずれのサービスで、またどのタイミングで発生したものかを確認できる。

参考：https://docs.datadoghq.com/tracing/visualization/trace/?tab=logs

![datadog_trace-viewer](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/datadog_trace-viewer.png)

<br>

## 03. メトリクスと他テレメトリー間の紐付け

### サーバー/コンテナのメトリクスとの紐付け

スパンとコンテナのDockerLabelの統合タグ（```service```、```env```、```version```）に、同じ値を割り当てると、分散トレースとサーバー/コンテナのOSに関するメトリクスを紐付けられる。

