---
title: 【IT技術の知見】AWS Aurora＠AWSリソース
description: AWS Aurora＠AWSリソース
---

# AWS Aurora＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS Auroraとは

AWS RDSをよりマネージドにしたAWSリソースである。

> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html

<br>

## 02. セットアップ

### コンソール画面の場合

#### ▼ DBエンジン

| 設定項目           | 説明                                                                                 | 補足                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| エンジンタイプ     | ミドルウェアのDBMSの種類を設定する。                                                 |                                                                                             |
| エディション       | エンジンバージョンでAWS Auroraを選択した場合の互換性を設定する。                     |                                                                                             |
| エンジンバージョン | DBエンジンのバージョンを設定する。DBクラスター内の全てのDBインスタンスに適用される。 | ・AWS Auroraであれば、`SELECT AURORA_VERSION()`を使用して、エンジンバージョンを確認できる。 |

#### ▼ AWS AuroraのDBクラスター

ベストプラクティスについては、以下のリンクを参考にせよ。

| 設定項目                       | 説明                                                                                                                                                     | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| レプリケーション               | 単一のプライマリーインスタンス (シングルマスター) または複数のプライマリーインスタンス (マルチマスター) とするかを設定する。                             | フェイルオーバーを利用したダウンタイムの最小化時に、マルチマスターであれば変更の順番を気にしなくてよくなる。ただし、AWS AuroraのDBクラスターをクローンできないなどのデメリットもある。<br>https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-multi-master.html#aurora-multi-master-terms                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| AWS AuroraのDBクラスター識別子 | AWS AuroraのDBクラスター名を設定する。                                                                                                                   | インスタンス名は、最初に設定できず、AWS RDSの作成後に設定できる。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| VPCとサブネットグループ        | AWS AuroraのDBクラスターを配置するVPCとサブネットを設定する。                                                                                            | DBが配置されるサブネットはプライベートサブネットにする、これには、data storeサブネットと名付ける。アプリケーション以外は、踏み台サーバー (AWS EC2) 経由でしかDBにリクエストできないようにする。<br>![subnet_component-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/subnet_component-type.png)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| パラメーターグループ           | グローバルオプションを設定する。                                                                                                                         | デフォルトを使用せずに自前定義する場合、事前に作成しておく必要がある。クラスターパラメーターグループとインスタンスパラメーターグループがあるが、全てのインスタンスに同じパラメーターループを設定する必要があるなため、クラスターパラメーターを使用すれば良い。各パラメーターに適用タイプ (dynamic/static) があり、dynamicタイプは設定の適用に再起動が必要である。新しく作成したクラスタパラメーターグループにて以下の値を設定すると良い。<br>・`time_zone=Asia/Tokyo`<br>・`character_set_client=utf8mb4`<br>・`character_set_connection=utf8mb4`<br>・`character_set_database=utf8mb4`<br>・`character_set_results=utf8mb4`<br>・`character_set_server=utf8mb4`<br>・`server_audit_logging=1` (監査ログをAWS CloudWatchに送信するか否か) <br>・`server_audit_logs_upload=1`<br>・`general_log=1` (通常クエリログをAWS CloudWatchに送信するか否か) <br>・`slow_query_log=1` (スロークエリログをAWS CloudWatchに送信するか否か) <br>・`long_query_time=3` (スロークエリと見なす最短秒数) |
| DB認証                         | DBに接続するための認証方法を設定する。                                                                                                                   | AWS Auroraの各DBインスタンスに異なるDB認証を設定できるが、全てのAWS AuroraのDBインスタンスに同じ認証方法を設定すべきなため、AWS AuroraのDBクラスターでこれを設定すれば良い。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| マスタユーザー名               | DBのroot権限の実行ユーザーを設定                                                                                                                         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| マスターパスワード             | DBのroot権限の実行ユーザーのパスワードを設定                                                                                                             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 暗号化キー                     | AWS KMSを使用して、データを暗号化して保管する。                                                                                                          |
| バックアップ保管期間           | AWS AuroraのDBクラスター がバックアップを保管する期間を設定する。                                                                                        | `7`日間にしておく。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ログのエクスポート             | AWS CloudWatch Logsに送信するデータエンジン (例：MySQL) のログを設定する。DBエンジンの一般ログ、エラーログ、スロークエリログ、監査ログなどを選択できる。 | 全てのログを選択するとよい。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| セキュリティグループ           | AWS AuroraのDBクラスターのセキュリティグループを設定する。                                                                                               | コンピューティングからのリクエストのみを許可するように、これらのプライベートIPアドレス (`*.*.*.*/32`) を設定する。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 認証機関                       | AWS AuroraのDBクラスターに紐づけるSSL証明書を署名するルート認証局を設定する。                                                                            | アプリケーションがAWS AuroraのDBクラスターにHTTPSで通信する場合に必要である。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 削除保護                       | AWS AuroraのDBクラスターの削除を防ぐ。                                                                                                                   | AWS AuroraのDBクラスターを削除するとクラスターボリュームも削除されるため、これを防ぐ。補足として、AWS AuroraのDBクラスターの削除保護になっていてもAWS AuroraのDBインスタンスは削除できる。AWS AuroraのDBインスタンスを削除しても、再作成すればクラスターボリュームに接続されて元のデータにリクエストを送信できる。<br>https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_DeleteCluster.html#USER_DeletionProtection                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

> - https://www.trendmicro.com/cloudoneconformity/knowledge-base/aws/RDS/
> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html

#### ▼ AWS AuroraのDBインスタンス

ベストプラクティスについては、以下のリンクを参考にせよ。

| 設定項目                               | 説明                                                                                                       | 補足                                                                                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| インスタンスクラス                     | AWS AuroraのDBインスタンスのスペックを設定する。サーバーレス、メモリ最適化、バースト可能などを選択できる。 | バースト可能クラスを選択するとよい。補足として、AuroraのDBサイズは自動的にスケーリングするため、設定する必要がない。                                       |
| パブリックアクセス                     | AWS AuroraのDBインスタンスにIPアドレスを割り当てるか否かを設定する。                                       |                                                                                                                                                            |
| キャパシティタイプ                     |                                                                                                            |                                                                                                                                                            |
| マルチAZ配置                           | プライマリーインスタンスとは別に、リードレプリカをマルチAZ配置で追加するか否かを設定する。                 | 後からでもリードレプリカを追加できる。また、フェイルオーバー時にリードレプリカが存在していなければ、昇格後のプライマリーインスタンスが自動的に作成される。 |
| 最初のDB名                             | AWS AuroraのDBインスタンスに自動的に作成されるDB名を設定                                                   |                                                                                                                                                            |
| マイナーバージョンの自動アップグレード | AWS AuroraのDBインスタンスのDBエンジンのバージョンを自動的に更新するかを設定する。                         | 開発環境では有効化、本番環境とステージング環境では無効化しておく。開発環境で新バージョンに問題が起こらなければ、ステージング環境と本番環境にも適用する。   |

> - https://www.trendmicro.com/cloudoneconformity/knowledge-base/aws/RDS/

### OSの隠蔽

#### ▼ OSの隠蔽とは

AWS Auroraは、EC2内にDBMSが稼働したものであるが、このほとんどが隠蔽されている。

そのためDBサーバーのようには操作できず、OSのバージョン確認やSSH公開鍵認証を行えない。

> - https://xtech.nikkei.com/it/article/COLUMN/20131108/516863/

#### ▼ 確認方法

Linux x86_64 (AMD64) が使用されているところまでは確認できるが、Linuxのバージョンは隠蔽されている。

AWS RDSでも確認方法は同じである。

```sql
-- AWS Auroraの場合
SHOW variables LIKE '%version%';

+-------------------------+------------------------------+
| Variable_name           | Value                        |
+-------------------------+------------------------------+
| aurora_version          | 2.09.0                       |
| innodb_version          | 5.7.0                        |
| protocol_version        | 10                           |
| slave_type_conversions  |                              |
| tls_version             | TLSv1,TLSv1.1,TLSv1.2        |
| version                 | 5.7.12-log                   |
| version_comment         | MySQL Community Server (GPL) |
| version_compile_machine | x86_64                       |
| version_compile_os      | Linux                        |
+-------------------------+------------------------------+
```

<br>

## 02-02. 踏み台サーバーをパブリックサブネットに置く場合の接続方法

### SSH公開鍵認証を使用する場合

#### ▼ この方法について

SSH公開鍵認証を使用する場合、ユーザーが自前でDB接続者を管理する必要がある。

この場合、踏み台サーバー (AWS EC2) をパブリックサブネットに置く必要があり、プライベートサブネットには置けない。

#### ▼ セットアップ

```bash
$ ssh -o serveraliveinterval=60 -f -N -L 3306:<AWS Auroraのリーダーエンドポイント>:3306 -i "~/.ssh/foo.pem" <踏み台サーバーの実行ユーザー>@<踏み台サーバー (AWS EC2) のホスト> -p 22
```

> - https://qiita.com/shimi7o/items/732e91126ab4a06162a7

<br>

## 02-03. 踏み台サーバーをプライベートサブネットに置く場合の接続方法

### AWS SSM Session Managerを使用したSSHセッション

#### ▼ この方法について

この場合、AWS SSM Session Managerを使用するため、踏み台サーバー (AWS EC2) をプライベートサブネットに置ける。

> - https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html#sessions-start-ssh

<br>

### AWS SSM Session Managerを使用したリモートホストへのポート転送 (StartPortForwardingSessionToRemoteHost)

#### ▼ この方法について

AWS SSM Session Managerの認証を使用する場合、AWS IAMでDB接続者を管理する。

この場合、AWS SSM Session Managerを使用するため、踏み台サーバー (AWS EC2) をプライベートサブネットに置ける。

> - https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html#sessions-remote-port-forwarding

#### ▼ 前提条件

事前に、踏み台サーバー (AWS EC2) のセキュリティグループのインバウンドルールでポート番号を開放しておく。

以下のツールをインストールすること

- AWS CLI (セットアップ時点で最新のもの)
- [Session Managerプラグイン](https://docs.aws.amazon.com/systems-manager/latest/userguide/install-plugin-macos-overview.html) (使用中のPCのOSに合わせること)

#### ▼ セットアップ

ローカルPCの好きなポート番号を使用して、ポートフォワーディングを実施する。

ローカルPCでは、コンテナなどが3306番ポートをすでに使用している可能性があり、他のポート番号がおすすめである。

```bash
# ポートフォワーディングのコマンドを実行する (事前にAWS Session Managerプラグインをインストールしないとエラーになる)
$ aws ssm start-session --target <踏み台サーバー (AWS EC2) インスタンスID> \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters '{"host":["<AWS Auroraのリーダーエンドポイント>"],"portNumber":["<AWS Auroraのポート番号>"], "localPortNumber":["<ローカルPCのポート番号>"]}'
```

別ターミナルを開き、AWS AuroraのDBにログインする。

AWS Secrets ManagerのDBのユーザー名やパスワードを確認できる。

```bash
$ docker exec -it <DBコンテナ名> bash

bash# mysql -h host.docker.internal -P <前の手順で設定したローカルPCの好きなポート番号> -u <ユーザー名> -p<パスワード> <DB名>

mysql> SHOW TABLES;
+-------------------------------+
| Tables_in_<DB名>              |
+-------------------------------+
...
```

> - https://dev.classmethod.jp/articles/ssm-session-manage-port-forwarding/#toc-1
> - https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html#sessions-remote-port-forwarding
> - https://docs.aws.amazon.com/systems-manager/latest/userguide/install-plugin-macos-overview.html

<br>

## 02-04. 踏み台PodをAWS EKSクラスター内に置く場合の接続方法

### 踏み台Podとは

これは、AWS EKSを使用している場合に使用できる。

DBに接続したい場合、ポートフォワーディング用の踏み台PodをAWS EKS内に作成する。

Helmチャートを作成しておくと、簡単にセットアップできる。

> - https://zenn.dev/toshikish/articles/6a06017747cbba#%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9%E3%81%AB%E5%A4%A7%E9%87%8F%E3%81%AB%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E6%8C%BF%E5%85%A5%E3%81%97%E3%81%9F%E3%81%84

<br>

### troubleshootingリポジトリ

```yaml
troubleshooting/
├── README.md
├── .gitignore
├── chart/
│   ├── Chart.yaml
│   ├── templates
│   │   └── deployment.yaml
│   │
│   ├── .helmignore
│   ├── values.example.yaml
│   └── values.yaml
└── helmfile.yaml
```

`.gitignore`ファイルでは、`values.example.yaml`ファイルのコピーから作成される`values.yaml`ファイルのバージョン管理を無視するように実装する。

```ignore
**/**/values.yaml
```

<br>

### values.example.yaml

`.env`ファイルのように、バージョン管理しない`values.example.yaml`ファイルを用意しておく。

各開発者がローカルPCで`values.example.yaml`ファイルから`values.yaml`ファイルを作成する。

```bash
$ cp chart/values.example.yaml values.yaml
```

```yaml
name: port-forward-for-aws-aurora

remote:
  # AWS Auroraのリーダーエンドポイントを設定する
  host: <ここに自分で値を設定する>
  # AWS Auroraのポート番号を設定する
  port: <ここに自分で値を設定する>
```

#### ▼ pod.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{.Values.name}}
spec:
  replicas: 1
  selector:
    matchLabels:
      name: {{.Values.name}}
  template:
    metadata:
      labels:
        name: {{.Values.name}}
    spec:
      containers:
        - name: {{.Values.name}}
          image: marcnuri/port-forward:latest
          ports:
            - containerPort: 443
          env:
            - name: LOCAL_PORT
              value: "443"
            - name: REMOTE_HOST
              value: {{.Values.remote.host}}
            - name: REMOTE_PORT
              value: {{.Values.remote.port | quote}}
```

```bash
$ helmfile -f helmfile.yaml diff

$ helmfile -f helmfile.yaml apply
```

> - https://hub.docker.com/r/marcnuri/port-forward

#### ▼ コマンド

ローカルPCの好きなポート番号を使用して、AWS Auroraにポートフォワーディングを実行する。

ローカルPCでは、コンテナなどが3306番ポートをすでに使用している可能性があり、他のポート番号がおすすめである。

```bash
$ kubectl port-forward deployment/port-forwarding-for-aws-aurora -n <Namespace名> <ローカルPCの好きなポート番号>:443
```

別ターミナルを開き、AWS AuroraのDBにログインする。

AWS Secrets ManagerのDBのユーザー名やパスワードを確認できる。

```bash
$ docker exec -it <DBコンテナ名> bash

bash# mysql -h host.docker.internal -P <前の手順で設定したローカルPCの好きなポート番号> -u <ユーザー名> -p<パスワード> <DB名>

mysql> SHOW TABLES;
+-------------------------------+
| Tables_in_<DB名>              |
+-------------------------------+
...
```

> - https://zenn.dev/toshikish/articles/6a06017747cbba#%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9%E3%81%AB%E5%A4%A7%E9%87%8F%E3%81%AB%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E6%8C%BF%E5%85%A5%E3%81%97%E3%81%9F%E3%81%84

<br>

## 02-05. AWS ECS Fargateをプライベートサブネットに置く場合の接続方法

記入中...

> - https://zenn.dev/quiver/articles/1458e453118254

<br>

## 03. AWS AuroraのDBクラスター

### AWS AuroraのDBクラスターとは

DBエンジンにAWS Auroraを選択した場合にのみ使用できる。

AWS AuroraのDBインスタンスとクラスターボリュームから構成されている。

コンピューティングとして動作するAWS AuroraのDBインスタンスと、ストレージとして動作するクラスターボリュームが分離されているため、AWS AuroraのDBインスタンスが誤って全て削除されてしまったとしても、データを守れる。

また、両者が分離されていないエンジンタイプと比較して、再起動が早いため、再起動に伴うダウンタイムが短い。

![aurora-db-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aurora-db-cluster.png)

> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html

<br>

### 空のAWS AuroraのDBクラスター

#### ▼ 空のAWS AuroraのDBクラスターとは

コンソール画面にて、AWS AuroraのDBクラスター内の全てのAWS AuroraのDBインスタンスを削除すると、AWS AuroraのDBクラスターも自動的に削除される。

一方で、AWS-APIをコールして全てのAWS AuroraのDBインスタンスを削除する場合、AWS AuroraのDBクラスターは自動的に削除されずに、空の状態になる。

例えば、Terraformを使用してAWS AuroraのDBクラスターを作成する時に、インスタンスの作成に失敗するとAWS AuroraのDBクラスターが空になる、

これは、TerraformがAWS-APIをコールした作成を行っているためである。

> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_DeleteCluster.html#USER_DeleteCluster.DeleteCluster

<br>

## 04. AWS AuroraのDBインスタンス

### AWS AuroraのDBインスタンスとは

コンピューティング機能を持ち、クラスターボリュームを操作できる。

<br>

### AWS AuroraのDBインスタンスの種類

|                | プライマリーインスタンス                                                                       | リードレプリカ                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| ロール         | 読み出し/書き込みインスタンス                                                                  | 読み出しオンリーインスタンス                                                                               |
| CRUD制限       | 制限なし。ユーザーの認可スコープに依存する。                                                   | ユーザーの認可スコープに関係なく、READしか実行できない。                                                   |
| エンドポイント | AWS Auroraの各DBインスタンスに、リージョンのイニシャルに合わせたエンドポイントが割り振られる。 | AWS Auroraの各AWS AuroraのDBインスタンスに、リージョンのイニシャルに合わせたエンドポイントが割り振られる。 |
| データ同期     | AWS AuroraのDBクラスターに対するデータ変更を受けつける。                                       | 読み出し/書き込みインスタンスのデータの変更が同期される。                                                  |

<br>

### エンドポイント

![rds_endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/rds_endpoint.png)

| エンドポイント名           | 役割                                                         | 送信先                           | エンドポイント：ポート番号                                                                   | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| クラスターエンドポイント   | 書き込み/読み出し                                            | プライマリインスタンスのみ       | `<AWS AuroraのDBクラスター名>.cluster-<id>.ap-northeast-1.rds.amazonaws.com:<ポート番号>`    | プライマリーインスタンスに通信できる。プライマリーインスタンスがダウンし、フェイルオーバーによってプライマリーインスタンスとリードレプリカが入れ替わった場合、エンドポイントの転送先は新しいプライマリーインスタンスに変更される。<br>https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.Endpoints.html#Aurora.Endpoints.Cluster                                                                                                                                                                |
| リーダーエンドポイント     | 読み出し                                                     | 複数のリードレプリカに分散       | `<AWS AuroraのDBクラスター名>.cluster-ro-<id>.ap-northeast-1.rds.amazonaws.com:<ポート番号>` | リードレプリカに通信できる。AWS AuroraのDBインスタンスが複数ある場合、クエリが自動的に割り振られる。フェイルオーバーによってプライマリーインスタンスとリードレプリカが入れ替わった場合、エンドポイントの転送先は新しいプライマリーインスタンスに変更される。もしリードレプリカが全てダウンし、プライマリーインスタンスしか稼働していない状況の場合、プライマリーインスタンスに転送するようになる。<br>https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.Endpoints.html#Aurora.Endpoints.Reader |
| インスタンスエンドポイント | 書き込み/読み出し (指定したAWS AuroraのDBインスタンスによる) | 特定のAWS AuroraのDBインスタンス | `<AWS AuroraのDBインスタンス名>.cwgrq25vlygf.ap-northeast-1.rds.amazonaws.com:<ポート番号>`  | 選択したAWS AuroraのDBインスタンスに通信できる。フェイルオーバーによってプライマリーインスタンスとリードレプリカが入れ替わっても、エンドポイントそのままなため、アプリケーションが影響を付ける。非推奨である。                                                                                                                                                                                                                                                                                                            |
| カスタムエンドポイント     |                                                              |                                  |                                                                                              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

> - https://xtech.nikkei.com/it/atcl/column/16/041400085/042600030/
> - https://qiita.com/pensuke628/items/5ca7f2d2a53a71528ad1

<br>

### DBエンジンのログ

#### ▼ スロークエリログ

AWS CloudWatch Logsの`/aws/rds/cluster/<AWS AuroraのDBクラスター名>/slowquery`というロググループにスロークエリログが出力される。

#### ▼ エラークエリログ

AWS CloudWatch Logsの`/aws/rds/cluster/<AWS AuroraのDBクラスター名>/error`というロググループにエラーログが出力される。

<br>

## 05. アップグレード

### ZDP (ゼロダウンタイムパッチ適用)

![zero-downtime-patching](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/zero-downtime-patching.png)

AWS Auroraをエンジンバージョンに選択した場合に使用できる。

特定の条件下のみで、アプリケーションとプライマリーインスタンスの接続を維持したまま、プライマリーインスタンスのパッチバージョンをアップグレードできる。

ゼロダウンタイムパッチ適用が発動した場合、AWS RDSのイベントが記録される。

ただし、この機能に頼り切らない方が良い。

ゼロダウンタイムパッチ適用の発動はAWSから事前にお知らせされるわけでもなく、ユーザーが条件を見て発動の有無を判断しなければならない。

また、実際に発動していても、ダウンタイムが発生した事例が報告されている。

ゼロダウンタイムパッチ適用時、以下の手順でエンジンバージョンがアップグレードされる。

`(1)`

: プライマリーインスタンスのエンジンがアップグレードされ、この時にダウンタイムが発生しない代わりに、`5`秒ほどプライマリーインスタンスの性能が低下する。

`(2)`

: リードレプリカが再起動され、この時に`20`～`30`秒ほどダウンタイムが発生する。これらの仕組みのため、アプリケーションでは読み出しエンドポイントを接続先として使用しないようにする必要がある。

> - https://qiita.com/tonishy/items/542f7dd10cc43fd299ab
> - https://qiita.com/tmiki/items/7ade95c33b8e43c7cb5f
> - https://noname.work/2407.html
> - https://www.yuulinux.tokyo/8070/

<br>

### アップグレード可能かのバリデーション

AWS AuroraにSSH接続した上で、DBに対して以下のコマンドを実行すると、`v5.7`から`v8`系へのアップグレードで問題が起こるかを解析できる

ただ、アプリ側のSQLのロジックを解析することはできず、あくまでMySQLの設定値のみを解析でき、廃止予定のロジックを使っているかまでは見つけられない。

```bash
$ mysqlsh util.checkForServerUpgrade()
```

> - https://mita2db.hateblo.jp/entry/2023/05/24/214131
> - https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-upgrade.html

<br>

### ダウンタイム

#### ▼ ダウンタイムとは

AWS Auroraでは、設定値 (例：OS、エンジンバージョン、MySQL) のアップグレード時に、AWS AuroraのDBインスタンスの再起動が必要である。

再起動に伴ってダウンタイムが発生し、アプリケーションからDBに接続できなくなる。

この間、アプリケーションの利用者に与える影響を小さくできるように、計画的にダウンタイムを発生させる必要がある。

#### ▼ ダウンタイムの発生条件

AWS RDSにはダウンタイムに関する情報が多いが、AWS Auroraには情報が少ない。

ただし、経験上同じ項目でダウンタイムが発生しているため、他の項目についてもRDSのダウンタイムも参考になる。

| 変更する項目       | ダウンタイムの有無 | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| エンジンバージョン | あり               | `20`～`30`秒のダウンタイムが発生する。この時間は、ワークロード、クラスターサイズ、バイナリログデータのサイズ、ゼロダウンタイムパッチ適用の発動可否、によって変動する。<br>・https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.html <br>・https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.Patching.html#AuroraMySQL.Updates.AMVU <br>また、メジャーバージョンのアップグレードには`10`分のダウンタイムが発生する。<br>https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.MySQL.html#USER_UpgradeDBInstance.MySQL.Major.Overview |

> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.Settings

#### ▼ エンジンタイプによるダウンタイムの最小化

コンピューティングとストレージが分離しているAWS Auroraはエンジンタイプの中でもダウンタイムが短い。

#### ▼ ダウンタイムの計測例

アプリケーションにリクエストを送信する方法と、AWS RDSにクエリを直接的に送信する方法がある。

レスポンスとAWS RDSイベントログから、ダウンタイムを計測する。

**＊実装例＊**

AWS Aurora MySQLのアップグレードに伴うダウンタイムを計測する。

踏み台サーバー (AWS EC2) を経由してAWS RDSに接続し、現在時刻を取得するSQLを送信する。

この時、`for`文や`watch`コマンドを使用する。

ただし、`watch`コマンドはプリインストールされていない可能性がある。

平常アクセス時のも同時に実行することにより、より正確なダウンタイムを取得する。

また、ヘルスチェックの時刻を正しくロギングできるように、ローカルマシンから時刻を取得する。

```bash
#!/bin/bash

set -x

BASTION_HOST=""
BASTION_USER=""
DB_HOST=""
DB_PASSWORD=""
DB_USER=""
SECRET_KEY="~/.ssh/foo.pem"
SQL="SELECT NOW();"

ssh -o serveraliveinterval=60 -f -N -L 3306:${DB_HOST}:3306 -i ${SECRET_KEY} ${BASTION_USER}@${BASTION_HOST} -p 22

# 約15分間コマンドを繰り返す。
for i in {1..900}; do
  echo "---------- No. ${i} Local PC: $(date +"%Y-%m-%d %H:%M:%S") ------------" >> health_check.txt
  echo "$SQL" | mysql -u "$DB_USER" -P 3306 -p"$DB_PASSWORD" >> health_check.txt 2>&1
  # 1秒待機する。
  sleep 1
done
```

```bash
#!/bin/bash

set -x

BASTION_HOST=""
BASTION_USER=""
DB_HOST=""
DB_PASSWORD=""
DB_USER=""
SECRET_KEY="~/.ssh/foo.pem"
SQL="SELECT NOW();"

ssh -o serveraliveinterval=60 -f -N -L 3306:${DB_HOST}:3306 -i ${SECRET_KEY} ${BASTION_USER}@${BASTION_HOST} -p 22

# 1秒ごとにコマンドを繰り返す。
watch -n 1 'echo "---------- No. ${i} Local PC: $(date +"%Y-%m-%d %H:%M:%S") ------------" >> health_check.txt && \
  echo ${SQL} | mysql -u ${DB_USER} -P 3306 -p${DB_PASSWORD} >> health_check.txt 2>&1'
```

上記のシェルスクリプトにより、例えば次のようなMySQLのログを取得できる。

このログからは、`15:23:09` 〜 `15:23:14`の間で、接続に失敗していることを確認できる。

```bash
---------- No. 242 Local PC: 2021-04-21 15:23:06 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
NOW()
2021-04-21 06:23:06
---------- No. 243 Local PC: 2021-04-21 15:23:07 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
NOW()
2021-04-21 06:23:08
---------- No. 244 Local PC: 2021-04-21 15:23:08 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2026 (HY000): SSL connection error: error:00000000:lib(0):func(0):reason(0)
---------- No. 245 Local PC: 2021-04-21 15:23:09 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 246 Local PC: 2021-04-21 15:23:10 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 247 Local PC: 2021-04-21 15:23:11 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 248 Local PC: 2021-04-21 15:23:13 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 249 Local PC: 2021-04-21 15:23:14 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 250 Local PC: 2021-04-21 15:23:15 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
NOW()
2021-04-21 06:23:16
---------- No. 251 Local PC: 2021-04-21 15:23:16 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
NOW()
2021-04-21 06:23:17
```

アップグレード時のプライマリーインスタンスのAWS RDSイベントログは以下の通りで、ログによるダウンタイムは、再起動からシャットダウンまでの期間と一致することを確認する。

![rds-event-log_primary-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/rds-event-log_primary-instance.png)

補足として、リードレプリカは再起動のみを実行していることがわかる。

![rds-event-log_read-replica](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/rds-event-log_read-replica.png)

<br>

### フェイルオーバー

#### ▼ AWS Auroraのフェイルオーバーとは

プライマリーインスタンスで障害が起こった場合に、リードレプリカをプライマリーインスタンスに自動的に昇格する。

AWS AuroraのDBクラスター内の全てのAWS AuroraのDBインスタンスが同じAZに配置されている場合、あらかじめ異なるAZにリードレプリカを新しく作成する必要がある。

また、フェイルオーバー時に、もしAWS AuroraのDBクラスター内にリードレプリカが存在していない場合、異なるAZに昇格後のプライマリーインスタンスが自動的に作成される。

リードレプリカが存在している場合、これがプライマリーインスタンスに昇格する。

> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html#Aurora.Managing.FaultTolerance

#### ▼ フェイルオーバーによるダウンタイムの最小化

AWS AuroraのDBインスタンスがマルチAZ構成の場合、以下の手順を使用してダウンタイムを最小化できる。

`(1)`

: アプリケーションの接続先をプライマリーインスタンスにする。

`(2)`

: リードレプリカにダウンタイムの発生する変更を適用する。

     AWS Auroraではフェールオーバーが自動的に実行される。

`(3)`

: フェイルオーバー時に約`1`～`2`分のダウンタイムが発生する。

     フェイルオーバーを使用しない場合、AWS AuroraのDBインスタンスの再起動でダウンタイムが発生する。

     ただし、これよりは時間が短いため、相対的にダウンタイムを短縮できる。

> - https://lab.taf-jp.com/rds%E3%81%AE%E3%83%95%E3%82%A7%E3%82%A4%E3%83%AB%E3%82%AA%E3%83%BC%E3%83%90%E3%83%BC%E6%99%82%E3%81%AE%E6%8C%99%E5%8B%95%E3%82%92%E7%90%86%E8%A7%A3%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B/

#### ▼ AWS AuroraのDBインスタンスの昇格優先順位

AWS Auroraの場合、フェイルオーバーによって昇格するAWS AuroraのDBインスタンスは次の順番で決定される。

AWS AuroraのDBインスタンスごとにフェイルオーバーの優先度 (`0`～`15`) を設定でき、優先度の数値の小さいAWS AuroraのDBインスタンスほど優先され、昇格対象になる。

優先度が同じだと、インスタンスクラスが大きいAWS AuroraのDBインスタンスが昇格対象になる。

インスタンスクラスが同じだと、同じサブネットにあるAWS AuroraのDBインスタンスが昇格対象になる。

`(1)`

: 優先度の順番

`(2)`

: インスタンスクラスの大きさ

`(3)`

: 同じサブネット

> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html

#### ▼ ダウンタイムを最小化できない場合

エンジンバージョンのアップグレードは両方のAWS AuroraのDBインスタンスで同時に実行する必要があるため、フェイルオーバーを使用できず、ダウンタイムを最小化できない。

<br>

### B/G式アップグレード

アップグレード時に、新しいバージョンからなるAWS AuroraのDBクラスター (グリーン環境) を作成する。

クラスターエンドポイントを起点として、アプリケーションのクエリの向き先を既存のAWS AuroraのDBクラスター (ブルー環境) から新AWS AuroraのDBクラスター (グリーン環境) に切り替える。

グリーン環境でアプリケーションが問題なく動作すれば、既存のAWS AuroraのDBクラスター (ブルー環境) を削除する。

<br>

## 06. 負荷対策

### エンドポイントの使い分け

AWS AuroraのDBインスタンスに応じたエンドポイントが用意されている。

アプリケーションからのCRUDの種類に応じて、アクセス先を振り分けることにより、負荷を分散させられる。

読み出しオンリーエンドポイントに対して、READ以外の処理を行うと、以下の通り、エラーとなる。

```bash
/* SQL Error (1290): The MySQL server is running with the --read-only option so it cannot execute this statement */
```

<br>

### リードレプリカの手動追加、AWS Auto Scalingグループ

リードレプリカの手動追加もしくはAWS Auto Scalingグループによって、AWS Auroraに関するメトリクス (例：平均CPU使用率、平均DB接続数など) がターゲット値を維持できるように、リードレプリカの自動水平スケーリング (リードレプリカ数の増減) を実行する。

注意点として、AWS RDSのスケーリングは、ストレージサイズを増加させる垂直スケーリングであり、AWS Auroraのスケーリングとは仕様が異なっている。

> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Integrating.AutoScaling.html
> - https://engineers.weddingpark.co.jp/aws-aurora-autoscaling/
> - https://qiita.com/1_ta/items/3880a8da8a29e4c8d8f0

<br>

### クエリキャッシュの利用

MySQLやRedisのクエリキャッシュ機能を利用する。

ただし、MySQLのクエリキャッシュ機能は、バージョン`8`で廃止されることになっている。

<br>

### ユニークキーまたはインデックスの利用

スロークエリを検出し、そのSQLで対象としているカラムにユニークキーやインデックスを設定する。

スロークエリを検出する方法として、AWS RDSの`long_query_time`パラメーターによる閾値や、`EXPLAIN`句による予想実行時間の比較などがある。

CloudWatch Logsインサイト上で、閾値以上の実行時間のスロークエリを実行時間の昇順で取得できる。

```bash
fields @timestamp, @message
| parse @message /Query_time:\s*(?<Query_time>[0-9]+(?:\.[0-9]+)?)\s*[\s\S]*?;/
| display @timestamp, Query_time, @message
| sort Query_time desc
| limit 100
```

> - https://tech.excite.co.jp/entry/2023/02/17/114538

<br>

### テーブルを正規化し過ぎない

テーブルを正規化すると保守性が高まるが、アプリケーションのSQLで`JOIN`句が必要になる。

しかし、`JOIN`句を含むSQLは、含まないSQLと比較して、実行速度が遅くなる。

そこで、戦略的に正規化し過ぎないようにする。

<br>

### インスタンスタイプのスケールアップ

インスタンスタイプをスケールアップさせることにより、接続過多のエラー (`ERROR 1040 (HY000): Too many connections`) に対処する。

補足として現在の最大接続数はパラメーターグループの値から確認できる。

コンソール画面からはおおよその値しかわからないため、SQLで確認した方が良い。

```sql
SHOW GLOBAL VARIABLES LIKE 'max_connections';

+-----------------+-------+
| Variable_name  | Value |
+-----------------+-------+
| max_connections | 640  |
+-----------------+-------+
1 row in set (0.00 sec)
```

<br>

## 07. イベント

コンソール画面ではイベントが英語で表示されているため、リファレンスも英語でイベントを探した方が良い。

> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_Events.Messages.html

<br>

## 08. AWS Aurora Global DB

### AWS Aurora Global DBとは

リージョン間に跨いだAWS AuroraのDBクラスターから構成されている。

メインリージョンにあるプライマリークラスターのクラスターボリュームと、DRリージョンのセカンダリークラスターのクラスターボリュームのデータは、定期的に同期される。

プライマリーインスタンスは、プライマリークラスターのみに存在している。

![aurora-db-cluster_global](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aurora-db-cluster_global.png)

<br>

### クラスターボリュームのみのセカンダリーDBクラスター (ヘッドレスセカンダリーAWS AuroraのDBクラスター)

『ヘッドレスセカンダリーDBクラスター』ともいう。

コスト削減などを目的として、クラスターボリュームのみのセカンダリAWS AuroraのDBクラスターがある。

セカンダリーDBクラスターのリードレプリカを削除すると、ヘッドレスセカンダリーDBクラスターを作成できる。

![aurora-db-cluster_global_secondary-headless](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aurora-db-cluster_global_secondary-headless.png)

> - https://aws.amazon.com/blogs/database/achieve-cost-effective-multi-region-resiliency-with-amazon-aurora-global-database-headless-clusters/_
> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database-getting-started.html#aurora-global-database-attach.console.headless
> - https://aws.amazon.com/blogs/database/achieve-cost-effective-multi-region-resiliency-with-amazon-aurora-global-database-headless-clusters/

<br>

### 仕組み

#### ▼ ウォームスタンバイ構成

ウォームスタンバイ構成の場合、メインリージョンにはプライマリーインスタンスとリードレプリカ (クラスターボリュームを含む) がおり、DRリージョンにはリードレプリカ (クラスターボリュームを含む) のみがいる。

メインリージョンで障害が起こった場合は、DRリージョンのリードレプリカがプライマリインスタンスに昇格する。

`(1)`

: メインリージョンで障害が発生する。

`(2)`

: DRリージョンのセカンダリークラスターがプライマリークラスターに昇格し、クラスター内のリードレプリカインスタンスがプライマリーインスタンスになる。

`(3)`

: メインリージョンのプライマリーインスタンスをフェイルオーバーさせる。

     各種エンドポイントが無効化され、アクセスできなくなる (`NXDOMAIN`になる) 。

`(4)`

: メインリージョンの障害が回復する。

`(5)`

: DRリージョンをフェイルオーバーさせる。

     メインリージョンのクラスターがプライマリークラスター、DRリージョンのクラスターがセカンダリークラスターになる。

> - https://dev.classmethod.jp/articles/amazon-aurora-global-database-failover-between-region/#toc-2
> - https://qiita.com/minorun365/items/2530cf1d1f5793c15c79

注意点として、通常のAWS AuroraのDBクラスターと比較して、機能が制限される。

> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html#aurora-global-database.limitations

#### ▼ コールドスタンバイ構成

コールドスタンバイ構成の場合、メインリージョンにはプライマリーインスタンスとリードレプリカがおり、DRリージョンにクラスターボリュームのみがいる。

つまり、DRリージョンにAWS AuroraのDBインスタンスがない。

> - https://dev.classmethod.jp/articles/amazon-aurora-global-database-failover-between-region/#toc-4

<br>

### アップグレード

AWS Aurora Global DBでは、プライマリークラスターとセカンダリークラスターを同時にアップグレードできない。

マイナーバージョンのアップグレードの場合は、セカンダリーDBクラスターからアップグレードする。

メジャーバージョンのアップグレードの場合は、AWS Aurora Global DB自体をアップグレードする。

> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database-upgrade.html

<br>

### スナップショット

AWS Aurora Global DBでは、リージョン間でデータをコピーしている。

そのため、メインリージョンのプライマリークラスターでスナップショットを作成し、これをDRリージョンにコピーするようにする。

> - https://dev.classmethod.jp/articles/lim-rds-move-region-jp/#toc-7

<br>
