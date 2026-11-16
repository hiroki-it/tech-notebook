---
title: 【IT技術の知見】Amazon Aurora
description: Amazon Aurora
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
  - "RDS"
---

# Amazon Aurora

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要

Amazon RDS をよりマネージドにした AWS リソースである。

> - [What is Amazon Aurora? - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html)

<br>

## 02. 仕組み

### DB クラスター

DB エンジンに Amazon Aurora を選択した場合にのみ使用できる。

Amazon Aurora の DB インスタンスとクラスターボリュームから構成されている。

コンピューティングとして動作する Amazon Aurora の DB インスタンスと、ストレージとして動作するクラスターボリュームが分離されているため、Amazon Aurora の DB インスタンスが誤ってすべて削除されてしまったとしても、データを守れる。

また、両者が分離されていないエンジンタイプと比較して、再起動が早いため、再起動に伴うダウンタイムが短い。

![aurora-db-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/aurora-db-cluster.png)

> - [High availability for Amazon Aurora - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html)

<br>

### DB インスタンス

コンピューティング機能を持ち、クラスターボリュームを操作できる。

<br>

#### ▼ Amazon Aurora の DB インスタンスの種類

<table>
  <thead>
    <tr>
      <th></th>
      <th>プライマリーインスタンス</th>
      <th>リードレプリカ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ロール</td>
      <td>読み出し/書き込みインスタンス</td>
      <td>読み出しオンリーインスタンス</td>
    </tr>
    <tr>
      <td>CRUD 制限</td>
      <td>制限なし。アカウントの認可スコープに依存する。</td>
      <td>アカウントの認可スコープに関係なく、READ しか実行できない。</td>
    </tr>
    <tr>
      <td>エンドポイント</td>
      <td>Amazon Aurora の各 DB インスタンスに、リージョンのイニシャルに合わせたエンドポイントが割り振られる。</td>
      <td>Amazon Aurora の各 Amazon Aurora の DB インスタンスに、リージョンのイニシャルに合わせたエンドポイントが割り振られる。</td>
    </tr>
    <tr>
      <td>データ同期</td>
      <td>Amazon Aurora の DB クラスターに対するデータ変更を受けつける。</td>
      <td>読み出し/書き込みインスタンスのデータの変更が同期される。</td>
    </tr>
  </tbody>
</table>

<br>

### OS の隠蔽

Amazon Aurora は、EC2 内に DBMS が稼働したものであるが、このほとんどが隠蔽されている。

そのため DB サーバーのようには操作できず、OS のバージョン確認や SSH 公開鍵認証を行えない。

> - [［5］RDSのつまずきポイント、DBサーバーと思うと失敗する \| 日経クロステック（xTECH）](https://xtech.nikkei.com/it/article/COLUMN/20131108/516863/)

#### ▼ 確認方法

Linux x86_64 (AMD64) が使用されているところまでは確認できるが、Linux のバージョンは隠蔽されている。

Amazon RDS でも確認方法は同じである。

```mysql
-- Amazon Auroraの場合
SHOW VARIABLES LIKE '%version%';

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

## 03. セットアップ

### DB エンジンと識別子

DB エンジンには MySQL 互換または PostgreSQL 互換の Aurora を選択する。

| 設定 | 役割 |
| --- | --- |
| DB エンジン | `aurora-mysql` または `aurora-postgresql` を指定する。 |
| DB クラスター識別子 | DB クラスターの名前を指定する。 |
| DB インスタンス識別子 | クラスターに所属する各 DB インスタンスの名前を、作成時に指定する。 |
| 初期データベース名 | クラスター内に最初に作成するデータベース名を指定する。クラスター名やインスタンス名とは異なる。 |

> - [CreateDBCluster - Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_CreateDBCluster.html)
> - [CreateDBInstance - Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_CreateDBInstance.html)

<br>

### Terraformによる構築

`terraform-aws-modules/rds-aurora/aws` モジュールを使用し、既存の DB サブネットグループとセキュリティグループに、DB クラスターと `2` 台の DB インスタンスを配置する。

```terraform
module "aurora" {
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "10.4.2"

  name                        = "foo-cluster"
  engine                      = "aurora-mysql"
  engine_version              = "8.0.mysql_aurora.3.05.2"
  cluster_instance_class      = "db.r6g.large"
  database_name               = "foo"
  master_username             = "admin"
  manage_master_user_password = true
  db_subnet_group_name        = "foo-db-subnet-group"
  create_security_group       = false
  vpc_security_group_ids      = ["sg-0123456789abcdef0"]

  instances = {
    one = {}
    two = {}
  }
}
```

> - [terraform-aws-modules/rds-aurora/aws - Terraform Registry](https://registry.terraform.io/modules/terraform-aws-modules/rds-aurora/aws/10.4.2)

<br>

## 04. DB への接続

### VPC とサブネットグループ

DB クラスターを配置する VPC と、DB インスタンスを配置するサブネットを DB サブネットグループで指定する。

例えば、DB 用のプライベートサブネットを data store サブネットとして分け、アプリケーションと管理用の踏み台からの通信だけを許可する。

![subnet_component-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/subnet_component-type.png)

### パブリックアクセス

DB インスタンスのパブリックアクセスを無効にすると、エンドポイントはプライベート IP アドレスを返す。

有効にした場合は VPC 外からパブリック IP アドレスで接続できる構成になるが、接続にはセキュリティグループなどによる許可も必要である。

> - [CreateDBInstance - Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_CreateDBInstance.html)

<br>

### エンドポイント

![rds_endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/rds_endpoint.png)

<table>
  <thead>
    <tr>
      <th>エンドポイント名</th>
      <th>役割</th>
      <th>送信先</th>
      <th>エンドポイント：ポート番号</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>クラスターエンドポイント</td>
      <td>書き込み/読み出し</td>
      <td>プライマリインスタンスのみ</td>
      <td><code>&lt;Amazon AuroraのDBクラスター名&gt;.cluster-&lt;id&gt;.ap-northeast-1.rds.amazonaws.com:&lt;ポート番号&gt;</code></td>
      <td>プライマリーインスタンスに通信できる。プライマリーインスタンスがダウンし、フェイルオーバーによってプライマリーインスタンスとリードレプリカが入れ替わった場合、エンドポイントのフォワーディング先は新しいプライマリーインスタンスに変更される。<br><a href="https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Amazon">https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Amazon</a> Aurora.Overview.Endpoints.html#Amazon Aurora.Endpoints.Cluster</td>
    </tr>
    <tr>
      <td>リーダーエンドポイント</td>
      <td>読み出し</td>
      <td>複数のリードレプリカに分散</td>
      <td><code>&lt;Amazon AuroraのDBクラスター名&gt;.cluster-ro-&lt;id&gt;.ap-northeast-1.rds.amazonaws.com:&lt;ポート番号&gt;</code></td>
      <td>リードレプリカに通信できる。Amazon Aurora の DB インスタンスが複数ある場合、クエリが自動的に割り振られる。フェイルオーバーによってプライマリーインスタンスとリードレプリカが入れ替わった場合、エンドポイントのフォワーディング先は新しいプライマリーインスタンスに変更される。もしリードレプリカがすべてダウンし、プライマリーインスタンスしか稼働していない状況の場合、プライマリーインスタンスにフォワーディングするようになる。<br><a href="https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Amazon">https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Amazon</a> Aurora.Overview.Endpoints.html#Amazon Aurora.Endpoints.Reader</td>
    </tr>
    <tr>
      <td>インスタンスエンドポイント</td>
      <td>書き込み/読み出し (指定した Amazon Aurora の DB インスタンスによる)</td>
      <td>特定の Amazon Aurora の DB インスタンス</td>
      <td><code>&lt;Amazon AuroraのDBインスタンス名&gt;.cwgrq25vlygf.ap-northeast-1.rds.amazonaws.com:&lt;ポート番号&gt;</code></td>
      <td>選択した Amazon Aurora の DB インスタンスに通信できる。フェイルオーバーによってプライマリーインスタンスとリードレプリカが入れ替わっても、エンドポイントは変わらないため、アプリケーションが影響を受ける。非推奨である。</td>
    </tr>
    <tr>
      <td>カスタムエンドポイント</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

> - [［Auroraの落とし穴］読み込みエンドポイントで分散されない \| 日経クロステック（xTECH）](https://xtech.nikkei.com/it/atcl/column/16/041400085/042600030/)
> - [【Aurora】各エンドポイントの違い #AWS - Qiita](https://qiita.com/pensuke628/items/5ca7f2d2a53a71528ad1)

<br>

### 踏み台サーバーをパブリックサブネットに置く場合の接続方法

#### ▼ SSH 公開鍵認証を使用する場合

##### ▼ この方法について

SSH 公開鍵認証を使用する場合、ユーザーが自前で DB 接続者を管理する必要がある。

この場合、踏み台サーバー (Amazon EC2) をパブリックサブネットに置く必要があり、プライベートサブネットには置けない。

##### ▼ セットアップ

```bash
$ ssh -o serveraliveinterval=60 -f -N -L 3306:<Amazon Auroraのリーダーエンドポイント>:3306 -i "~/.ssh/foo.pem" <踏み台サーバーの実行ユーザー>@<踏み台サーバー (Amazon EC2) のホスト> -p 22
```

> - [Auroraへの接続にはSSM Session Managerを利用したリモートホストへのポートフォワーディングがおすすめという話 #AWS - Qiita](https://qiita.com/shimi7o/items/732e91126ab4a06162a7)

<br>

### 踏み台サーバーをプライベートサブネットに置く場合の接続方法

#### ▼ AWS SSM Session Manager を使用した SSH セッション

##### ▼ この方法について

この場合、AWS SSM Session Manager を使用するため、踏み台サーバー (Amazon EC2) をプライベートサブネットに置ける。

> - [Start a session - AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html#sessions-start-ssh)

<br>

#### ▼ AWS SSM Session Manager を使用したリモートホストへのポートフォワーディング (StartPortForwardingSessionToRemoteHost)

##### ▼ この方法について

AWS SSM Session Manager の認証を使用する場合、AWS IAM で DB 接続者を管理する。

この場合、AWS SSM Session Manager を使用するため、踏み台サーバー (Amazon EC2) をプライベートサブネットに置ける。

> - [Start a session - AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html#sessions-remote-port-forwarding)

##### ▼ 前提条件

事前に、踏み台サーバー (Amazon EC2) のセキュリティグループのインバウンドルールでポート番号を開放しておく。

以下のツールをインストールすること

- AWS CLI (セットアップ時点で最新のもの)
- [Session Manager プラグイン](https://docs.aws.amazon.com/systems-manager/latest/userguide/install-plugin-macos-overview.html) (使用中の PC の OS に合わせること)

##### ▼ セットアップ

ローカル PC の任意のポート番号を使用して、ポートフォワーディングする。

ローカル PC では、コンテナなどが 3306 番ポートをすでに使用している可能性があり、他のポート番号がおすすめである。

```bash
# ポートフォワーディングのコマンドを実行する (事前にAWS Session Managerプラグインをインストールしないとエラーになる)
$ aws ssm start-session --target <踏み台サーバー (Amazon EC2) インスタンスID> \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters '{"host":["<Amazon Auroraのリーダーエンドポイント>"],"portNumber":["<Amazon Auroraのポート番号>"], "localPortNumber":["<ローカルPCのポート番号>"]}'
```

別ターミナルを開き、Amazon Aurora の DB にログインする。

AWS Secrets Manager の DB のユーザー名やパスワードを確認できる。

```bash
$ docker exec -it <DBコンテナ名> bash

bash# mysql -h host.docker.internal -P <前の手順で設定したローカルPCの好きなポート番号> -u <ユーザー名> -p<パスワード> <DB名>

mysql> SHOW TABLES;
+-------------------------------+
| Tables_in_<DB名>              |
+-------------------------------+
...
```

> - [SSM Session Managerを使ってポートフォワードする \| DevelopersIO](https://dev.classmethod.jp/articles/ssm-session-manage-port-forwarding/#toc-1)
> - [Start a session - AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html#sessions-remote-port-forwarding)
> - [Install the Session Manager plugin on macOS - AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/install-plugin-macos-overview.html)

<br>

### 踏み台 Pod を Amazon EKS クラスター内に置く場合の接続方法

#### ▼ 踏み台 Pod とは

これは、Amazon EKS を使用している場合に使用できる。

DB に接続したい場合、ポートフォワーディング用の踏み台 Pod を Amazon EKS 内に作成する。

Helm チャートを作成しておくと、簡単にセットアップできる。

> - [アプリ開発者のための kubectl 講座](https://zenn.dev/toshikish/articles/6a06017747cbba#%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9%E3%81%AB%E5%A4%A7%E9%87%8F%E3%81%AB%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E6%8C%BF%E5%85%A5%E3%81%97%E3%81%9F%E3%81%84)

<br>

#### ▼ troubleshooting リポジトリ

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

`.gitignore` ファイルでは、`values.example.yaml` ファイルのコピーから作成される `values.yaml` ファイルのバージョン管理を無視するように実装する。

```ignore
**/**/values.yaml
```

<br>

#### ▼ values.example.yaml

`.env` ファイルのように、バージョン管理しない `values.example.yaml` ファイルを用意しておく。

各開発者がローカル PC で `values.example.yaml` ファイルから `values.yaml` ファイルを作成する。

```bash
$ cp chart/values.example.yaml values.yaml
```

```yaml
name: port-forward-for-aws-aurora

remote:
  # Amazon Aurora のリーダーエンドポイントを設定する
  host: <ここに自分で値を設定する>
  # Amazon Aurora のポート番号を設定する
  port: <ここに自分で値を設定する>
```

##### ▼ pod.yaml

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

> - [marcnuri/port-forward - Docker Image](https://hub.docker.com/r/marcnuri/port-forward)

##### ▼ コマンド

ローカル PC の好きなポート番号を使用して、Amazon Aurora にポートフォワーディングを実行する。

ローカル PC では、コンテナなどが 3306 番ポートをすでに使用している可能性があり、他のポート番号がおすすめである。

```bash
$ kubectl port-forward deployment/port-forwarding-for-aws-aurora -n <Namespace名> <ローカルPCの好きなポート番号>:443
```

別ターミナルを開き、Amazon Aurora の DB にログインする。

AWS Secrets Manager の DB のユーザー名やパスワードを確認できる。

```bash
$ docker exec -it <DBコンテナ名> bash

bash# mysql -h host.docker.internal -P <前の手順で設定したローカルPCの好きなポート番号> -u <ユーザー名> -p<パスワード> <DB名>

mysql> SHOW TABLES;
+-------------------------------+
| Tables_in_<DB名>              |
+-------------------------------+
...
```

> - [アプリ開発者のための kubectl 講座](https://zenn.dev/toshikish/articles/6a06017747cbba#%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9%E3%81%AB%E5%A4%A7%E9%87%8F%E3%81%AB%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E6%8C%BF%E5%85%A5%E3%81%97%E3%81%9F%E3%81%84)

<br>

### Amazon ECS Fargate をプライベートサブネットに置く場合の接続方法

ECS Exec を有効化した Amazon ECS Fargate のタスクを踏み台にして、AWS Systems Manager Session Manager の `AWS-StartPortForwardingSessionToRemoteHost` ドキュメントでローカル PC から Amazon Aurora にポートフォワーディングする。

> - [ECS Fargateを踏み台にポートフォワードしてVPC内のRDSに接続する](https://zenn.dev/quiver/articles/1458e453118254)

<br>

## 05. ログ出力

### Amazon CloudWatch Logs へのエクスポート

DB エンジンが対応するログの種類から、Amazon CloudWatch Logs に送信するログを選ぶ。

Aurora MySQL では一般ログ、エラーログ、スロークエリログ、監査ログなどを出力でき、調査や監査で必要な種類を有効化する。

> - [Publishing Amazon Aurora MySQL logs to Amazon CloudWatch Logs - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Integrating.CloudWatch.html)

<br>

### スロークエリログ

Aurora MySQL のスロークエリログをエクスポートすると、Amazon CloudWatch Logs の `/aws/rds/cluster/<Amazon AuroraのDBクラスター名>/slowquery` というロググループに出力される。

### エラークエリログ

Aurora MySQL のエラーログをエクスポートすると、Amazon CloudWatch Logs の `/aws/rds/cluster/<Amazon AuroraのDBクラスター名>/error` というロググループに出力される。

<br>

## 06. アップグレード

### DB エンジンのバージョン

DB エンジンのバージョンは DB クラスター単位で指定し、所属する DB インスタンスに適用する。

Aurora のバージョンは SQL で確認できる。

```sql
SELECT AURORA_VERSION();
```

### マイナーバージョンの自動アップグレード

マイナーバージョンの自動アップグレードを有効にすると、AWS が自動更新の対象に指定したバージョンがメンテナンスウィンドウに適用される。

例えば、開発環境で有効化し、ステージング環境と本番環境では無効化して、開発環境での確認後に順次適用する運用がある。

> - [Maintaining an Amazon Aurora DB cluster - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_UpgradeDBInstance.Maintenance.html)

<br>

### ZDP (ゼロダウンタイムパッチ適用)

![zero-downtime-patching](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/zero-downtime-patching.png)

Amazon Aurora をエンジンバージョンとして選択した場合に使用でき、パッチバージョンとマイナーバージョンの更新で、条件を満たせば適用される。

特定の条件下のみで、アプリケーションとプライマリーインスタンスの接続を維持したまま、プライマリーインスタンスのパッチバージョンをアップグレードできる。

ゼロダウンタイムパッチ適用が発動した場合、Amazon RDS のイベントが記録される。

ただし、この機能に頼り切らないほうがよい。

ゼロダウンタイムパッチ適用の発動は AWS から事前にお知らせされるわけでもなく、ユーザーが条件を見て発動の有無を判断しなければならない。

ただ、実際に発動していても、ダウンタイムが発生した事例も報告されている。

ゼロダウンタイムパッチ適用時、以下の手順でエンジンバージョンがアップグレードされる。

1. プライマリーインスタンスのエンジンがアップグレードされ、このときにダウンタイムが発生しない代わりに、`5` 秒ほどプライマリーインスタンスの性能が低下する。

2. リードレプリカが再起動され、このときに `20`～`30` 秒ほどダウンタイムが発生する。これらの仕組みのため、アプリケーションでは読み出しエンドポイントを接続先として使用しないようにする必要がある。

> - https://qiita.com/tonishy/items/542f7dd10cc43fd299ab
> - [【注意】Amazon Aurora(MySQL)でZero Downtime Patch実行時に不具合が発生するケースがある【AWS】 #AWS - Qiita](https://qiita.com/tmiki/items/7ade95c33b8e43c7cb5f)
> - [【AWS】Auroraエンジンのダウンタイムなしアップグレードについて \| 個人利用で始めるAWS学習記](https://noname.work/2407.html)
> - [AWS RDSからAuroraへの移行 \| 優技録](https://www.yuulinux.tokyo/8070/)

<br>

### アップグレード可能かのバリデーション

アップグレードに伴う問題を静的解析で検出する。

Amazon Aurora に SSH 接続したうえで、DB に対して以下のコマンドを実行すると、`v5.7` から `v8` 系へのアップグレードで問題が起こるかを解析できる

ただ、アプリ側の SQL のロジックは解析できない。あくまで MySQL の設定値のみを解析でき、廃止予定のロジックを使っているかまでは見つけられない。

```bash
$ mysqlsh util.checkForServerUpgrade()
```

> - [Aurora v2 に Upgrade Checker Utility を実行してみた - mita2 database life](https://mita2db.hateblo.jp/entry/2023/05/24/214131)
> - https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-utilities-upgrade.html

<br>

### ダウンタイム

Amazon Aurora では、設定値 (例：OS、エンジンバージョン、MySQL) のアップグレード時に、Amazon Aurora の DB インスタンスの再起動が必要である。

再起動に伴ってダウンタイムが発生し、アプリケーションから DB に接続できなくなる。

この間、アプリケーションの利用者に与える影響を小さくできるように、計画的にダウンタイムを発生させる必要がある。

#### ▼ ダウンタイムの発生条件

Amazon RDS にはダウンタイムに関する情報が多いが、Amazon Aurora には情報が少ない。

ただし、経験上同じ項目でダウンタイムが発生しているため、他の項目についても Amazon RDS のダウンタイムも参考になる。

<table>
  <thead>
    <tr>
      <th>変更する項目</th>
      <th>ダウンタイムの有無</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>エンジンバージョン</td>
      <td>あり</td>
      <td>パッチバージョンのアップグレードでは、ZDP でダウンタイムが起こらない可能性がある。ダウンタイムが発生する場合は <code>20</code>～<code>30</code> 秒程度である。この時間は、ワークロード、クラスターサイズ、バイナリログデータのサイズ、ゼロダウンタイムパッチ適用の発動可否によって変動する。<br>・<a href="https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.html">https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.html</a> <br>・<a href="https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.Patching.html#AuroraMySQL.Updates.AMVU">https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.Patching.html#AuroraMySQL.Updates.AMVU</a> <br>一方、メジャーバージョンのアップグレードでは、<code>10</code> 分のダウンタイムが発生する。<br><a href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.MySQL.html#USER_UpgradeDBInstance.MySQL.Major.Overview">https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.MySQL.html#USER_UpgradeDBInstance.MySQL.Major.Overview</a></td>
    </tr>
  </tbody>
</table>

> - [Modifying an Amazon RDS DB instance - Amazon Relational Database Service](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.Settings)

#### ▼ エンジンタイプによるダウンタイムの最小化

コンピューティングとストレージが分離している Amazon Aurora はエンジンタイプのなかでもダウンタイムが短い。

#### ▼ ダウンタイムの計測例

アプリケーションにリクエストを送信する方法と、Amazon RDS にクエリを直接的に送信する方法がある。

レスポンスと Amazon RDS イベントログから、ダウンタイムを計測する。

Amazon Aurora MySQL のアップグレードに伴うダウンタイムを計測する。

踏み台サーバー (Amazon EC2) を経由して Amazon RDS に接続し、現在時刻を取得する SQL を送信する。

このとき、`for` 文や `watch` コマンドを使用する。

ただし、`watch` コマンドはプリインストールされていない可能性がある。

平常アクセス時のものも同時に実行することで、より正確なダウンタイムを取得する。

また、ヘルスチェックの時刻を正確に記録できるように、ローカルマシンから時刻を取得する。

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

上記のシェルスクリプトにより、例えば次のような MySQL のログを取得できる。

このログからは、`15:23:09` 〜 `15:23:14` の間で、接続に失敗していることを確認できる。

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

アップグレード時のプライマリーインスタンスの Amazon RDS イベントログは以下の通りで、ログによるダウンタイムは、再起動からシャットダウンまでの期間と一致することを確認する。

![rds-event-log_primary-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/rds-event-log_primary-instance.png)

補足として、リードレプリカは再起動のみを実行していることがわかる。

![rds-event-log_read-replica](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/rds-event-log_read-replica.png)

<br>

### B/G 式アップグレード

アップグレード時に、新しいバージョンからなる Amazon Aurora の DB クラスター (グリーン環境) を作成する。

クラスターエンドポイントを起点として、アプリケーションのクエリの向き先を既存の Amazon Aurora の DB クラスター (ブルー環境) から新 Amazon Aurora の DB クラスター (グリーン環境) に切り替える。

グリーン環境でアプリケーションが問題なく動作すれば、既存の Amazon Aurora の DB クラスター (ブルー環境) を削除する。

<br>

## 07. フェイルオーバー

### Amazon Aurora のフェイルオーバーとは

通常の Aurora DB クラスターは、書き込みを担当するプライマリーインスタンスと、読み取りを担当するリードレプリカで構成する。

プライマリーインスタンスに障害が発生した場合は、リードレプリカをプライマリーインスタンスに昇格する。

リードレプリカがない場合は、通常、同じ AZ にプライマリーインスタンスを再作成するため、リードレプリカの昇格より復旧に時間がかかる。

### リードレプリカのマルチ AZ 配置

AZ 全体の障害に備え、プライマリーインスタンスとは異なる AZ にリードレプリカを配置する。

リードレプリカはクラスター作成後にも追加できる。

> - [High availability for Amazon Aurora - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html)

<br>

### フェイルオーバーによるダウンタイムの最小化

Amazon Aurora の DB インスタンスがマルチ AZ 構成の場合、以下の手順を使用してダウンタイムを最小化できる。

1. アプリケーションの接続先をプライマリーインスタンスにする。

2. リードレプリカにダウンタイムの発生する変更を適用する。

    Amazon Auroraではフェールオーバーが自動的に実行される。

3. フェイルオーバー時に約 `1`～`2` 分のダウンタイムが発生する。

    フェイルオーバーを使用しない場合、Amazon AuroraのDBインスタンスの再起動でダウンタイムが発生する。

    ただし、これよりは時間が短いため、相対的にダウンタイムを短縮できる。

> - https://lab.taf-jp.com/rds%E3%81%AE%E3%83%95%E3%82%A7%E3%82%A4%E3%83%AB%E3%82%AA%E3%83%BC%E3%83%90%E3%83%BC%E6%99%82%E3%81%AE%E6%8C%99%E5%8B%95%E3%82%92%E7%90%86%E8%A7%A3%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B/

### Amazon Aurora の DB インスタンスの昇格優先順位

Amazon Aurora の場合、フェイルオーバーによって昇格する Amazon Aurora の DB インスタンスは次の順番で決定される。

Amazon Aurora の DB インスタンスごとにフェイルオーバーの優先度 (`0`～`15`) を設定でき、優先度の数値の小さい Amazon Aurora の DB インスタンスほど優先され、昇格対象になる。

優先度が同じだと、インスタンスクラスが大きい Amazon Aurora の DB インスタンスが昇格対象になる。

インスタンスクラスが同じだと、同じサブネットにある Amazon Aurora の DB インスタンスが昇格対象になる。

1. 優先度の順番

2. インスタンスクラスの大きさ

3. 同じサブネット

> - [High availability for Amazon Aurora - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html)

### ダウンタイムを最小化できない場合

エンジンバージョンのアップグレードは両方の Amazon Aurora の DB インスタンスで同時に実行する必要があるため、フェイルオーバーを使用できず、ダウンタイムを最小化できない。

<br>

## 08. 負荷分散と性能改善

### エンドポイントの使い分け

Amazon Aurora の DB インスタンスに応じたエンドポイントが用意されている。

アプリケーションからの CRUD の種類に応じて、宛先を振り分けることで、負荷を分散させられる。

読み出しオンリーエンドポイントで READ 以外の処理を実行すると、以下のとおりエラーとなる。

```bash
/* SQL Error (1290): The MySQL server is running with the --read-only option so it cannot execute this statement */
```

<br>

### リードレプリカの手動追加、AWS Auto Scaling グループ

リードレプリカの手動追加もしくは AWS Auto Scaling グループによって、Amazon Aurora に関するメトリクス (例：平均 CPU 使用率、平均 DB 接続数など) がターゲット値を維持できるように、リードレプリカの自動水平スケーリング (リードレプリカ数の増減) を実行する。

注意点として、Amazon RDS のスケーリングは、ストレージサイズを増加させる垂直スケーリングであり、Amazon Aurora のスケーリングとは仕様が異なっている。

> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Amazon Aurora.Integrating.AutoScaling.html
> - [AWS Aurora AutoScaling を設定して負荷分散する \| Wedding Park CREATORS Blog](https://engineers.weddingpark.co.jp/aws-aurora-autoscaling/)
> - https://qiita.com/1_ta/items/3880a8da8a29e4c8d8f0

<br>

### クエリキャッシュの利用

MySQL や Redis のクエリキャッシュ機能を利用する。

ただし、MySQL のクエリキャッシュ機能は、バージョン `8` で廃止されることになっている。

<br>

### ユニークキーまたはインデックスの利用

スロークエリを検出し、その SQL で対象としているカラムにユニークキーやインデックスを設定する。

スロークエリを検出する方法として、Amazon RDS の `long_query_time` パラメーターによる閾値や、`EXPLAIN` による予想実行時間の比較などがある。

CloudWatch Logs インサイト上で、閾値以上の実行時間のスロークエリを実行時間の昇順で取得できる。

```bash
fields @timestamp, @message
| parse @message /Query_time:\s*(?<Query_time>[0-9]+(?:\.[0-9]+)?)\s*[\s\S]*?;/
| display @timestamp, Query_time, @message
| sort Query_time desc
| limit 100
```

> - [AWSのCloudWatchLogsを使ったRDSのスロークエリ調査について - エキサイト TechBlog.](https://tech.excite.co.jp/entry/2023/02/17/114538)

<br>

### テーブルを正規化し過ぎない

テーブルを正規化すると保守性が高まるが、アプリケーションの SQL で `JOIN` が必要になる。

しかし、`JOIN` を含む SQL は、含まない SQL と比較して、実行速度が遅くなる。

そこで、戦略的に正規化し過ぎないようにする。

<br>

### インスタンスタイプのスケールアップ

DB インスタンスのキャパシティは、固定のインスタンスクラスを使う構成と、Aurora Serverless v2 で自動調整する構成から選ぶ。

固定のインスタンスクラスにはメモリ最適化やバースト可能などがあり、バースト可能クラスは負荷が断続的な用途で検討する。

インスタンスタイプをスケールアップさせることにより、接続過多のエラー (`ERROR 1040 (HY000): Too many connections`) に対処する。

補足として現在の最大接続数はパラメーターグループの値から確認できる。

現在適用されている最大接続数は、SQL で確認する。

```mysql
SHOW GLOBAL VARIABLES LIKE 'max_connections';

+-----------------+-------+
| Variable_name  | Value |
+-----------------+-------+
| max_connections | 640  |
+-----------------+-------+
1 row in set (0.00 sec)
```

<br>

### クラスターボリュームの自動拡張

Aurora のクラスターボリュームは、データ量に応じて自動的に拡張される。

DB インスタンスの CPU やメモリとは別に管理されるため、初期ストレージ容量を指定しておく必要はない。

<br>

## 09. イベント

コンソール画面ではイベントが英語で表示されているため、リファレンスも英語でイベントを探したほうがよい。

> - [Amazon RDS event categories and event messages for Aurora - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_Events.Messages.html)

<br>

## 10. リージョン間レプリケーション

### Amazon Aurora Global DB とは

リージョン間に跨いだ Amazon Aurora の DB クラスターから構成されている。

メインリージョンにあるプライマリークラスターのクラスターボリュームと、DR リージョンにあるセカンダリークラスターのクラスターボリュームは、データが定期的に同期される。

プライマリーインスタンスは、プライマリークラスターのみに存在している。

![aurora-db-cluster_global](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/aurora-db-cluster_global.png)

<br>

### クラスターボリュームのみのセカンダリーDB クラスター (ヘッドレスセカンダリーAmazon Aurora の DB クラスター)

『ヘッドレスセカンダリーDB クラスター』ともいう。

コスト削減などを目的として、クラスターボリュームのみのセカンダリ Amazon Aurora の DB クラスターがある。

セカンダリーDB クラスターのリードレプリカを削除すると、ヘッドレスセカンダリーDB クラスターを作成できる。

![aurora-db-cluster_global_secondary-headless](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/aurora-db-cluster_global_secondary-headless.png)

> - https://aws.amazon.com/blogs/database/achieve-cost-effective-multi-region-resiliency-with-amazon-aurora-global-database-headless-clusters/_
> - [Getting started with Amazon Aurora Global Database - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database-getting-started.html#aurora-global-database-attach.console.headless)
> - [Achieve cost-effective multi-Region resiliency with Amazon Aurora Global Database headless clusters \| AWS Database Blog](https://aws.amazon.com/blogs/database/achieve-cost-effective-multi-region-resiliency-with-amazon-aurora-global-database-headless-clusters/)

<br>

### 仕組み

#### ▼ ウォームスタンバイ構成

ウォームスタンバイ構成の場合、メインリージョンにはプライマリーインスタンスとリードレプリカ (クラスターボリュームを含む) がおり、DR リージョンにはリードレプリカ (クラスターボリュームを含む) のみがいる。

メインリージョンで障害が起こった場合は、DR リージョンのリードレプリカがプライマリインスタンスに昇格する。

1. メインリージョンで障害が発生する。

2. DR リージョンのセカンダリークラスターがプライマリークラスターに昇格し、クラスター内のリードレプリカインスタンスがプライマリーインスタンスになる。

3. メインリージョンのプライマリーインスタンスをフェイルオーバーさせる。

    各種エンドポイントが無効化され、アクセスできなくなる (`NXDOMAIN`になる) 。

4. メインリージョンの障害が回復する。

5. DR リージョンをフェイルオーバーさせる。

    メインリージョンのクラスターがプライマリークラスター、DRリージョンのクラスターがセカンダリークラスターになる。

> - [Amazon Aurora Global Databaseをリージョン間でフェイルオーバーさせてみた \| DevelopersIO](https://dev.classmethod.jp/articles/amazon-aurora-global-database-failover-between-region/#toc-2)
> - [Aurora「グローバルDB」を使って災対発動を想定したDRリージョン切り替えやってみた #AWS - Qiita](https://qiita.com/minorun365/items/2530cf1d1f5793c15c79)

注意点として、通常の Amazon Aurora の DB クラスターと比較して、機能が制限される。

> - [Using Amazon Aurora Global Database - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html#aurora-global-database.limitations)

#### ▼ コールドスタンバイ構成

コールドスタンバイ構成の場合、メインリージョンにはプライマリーインスタンスとリードレプリカがおり、DR リージョンにクラスターボリュームのみがいる。

つまり、DR リージョンに Amazon Aurora の DB インスタンスがない。

> - [Amazon Aurora Global Databaseをリージョン間でフェイルオーバーさせてみた \| DevelopersIO](https://dev.classmethod.jp/articles/amazon-aurora-global-database-failover-between-region/#toc-4)

<br>

### アップグレード

Amazon Aurora Global DB では、プライマリークラスターとセカンダリークラスターを同時にアップグレードできない。

マイナーバージョンのアップグレードの場合は、セカンダリーDB クラスターからアップグレードする。

メジャーバージョンのアップグレードの場合は、Amazon Aurora Global DB 自体をアップグレードする。

> - [Upgrading an Amazon Aurora global database - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database-upgrade.html)

<br>

### スナップショット

Amazon Aurora Global DB では、リージョン間でデータをコピーしている。

そのため、メインリージョンのプライマリークラスターでスナップショットを作成し、これを DR リージョンへコピーするようにする。

> - [RDS リージョン間データ移行する方法 \| DevelopersIO](https://dev.classmethod.jp/articles/lim-rds-move-region-jp/#toc-7)

<br>
## 11. DB クラスターの保持

### 空の Amazon Aurora の DB クラスターとは

DB インスタンスがなくても、DB クラスターとクラスターボリュームを保持できる。

例えば、Terraform で DB クラスターを作成した後に DB インスタンスの作成に失敗すると、DB クラスターだけが残ることがある。

DB インスタンスを追加すれば、保持していたデータに再びアクセスできる。

### 削除保護

削除保護を有効にすると、DB クラスターと、そのデータを保存するクラスターボリュームの削除を防げる。

削除保護を有効にしていても DB インスタンスは削除できるが、DB クラスターを残しておけば、インスタンスを再作成して元のデータにアクセスできる。

> - [Deleting Aurora DB clusters and DB instances - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_DeleteCluster.html)

<br>

## 12. DB 認証とアクセス制御

### DB 認証

DB に接続するための認証方法を設定する。

例えば IAM DB 認証の有効化は DB クラスター単位で設定し、クラスター内で共通の認証方針を適用する。

> - [CreateDBCluster - Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_CreateDBCluster.html)

### マスターユーザー

DB クラスターの管理用ユーザー名とパスワードを設定する。

マスターユーザーに付与される権限は DB エンジンによって異なり、OS の root や制限のない DB スーパーユーザーとは異なる。

> - [Master user account privileges - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/UsingWithRDS.MasterAccounts.html)

### セキュリティグループ

DB クラスターに関連付けるセキュリティグループで、アプリケーションや踏み台からの接続だけを許可する。

送信元には、接続元のセキュリティグループや、必要なプライベート IP アドレスの CIDR (例：`10.0.1.10/32`) を指定する。

<br>

## 13. 暗号化

### 保存データの暗号化

AWS KMS のキーを指定し、クラスターボリュームに保存するデータを暗号化する。

### DB 接続の TLS 暗号化

アプリケーションと DB 間の通信は、DB プロトコルに TLS を組み合わせて暗号化する。

DB サーバー証明書を署名する認証局を選び、接続元で証明書を検証する場合は、その認証局の証明書を信頼できるように設定する。

> - [Using SSL/TLS to encrypt a connection to a DB cluster - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/UsingWithRDS.SSL.html)

<br>

## 14. バックアップ

DB クラスターの自動バックアップ保管期間を `1`～`35` 日間から設定する。

例えば `7` 日間を基準とし、必要な復元可能期間に合わせて調整する。

> - [Backing up and restoring an Amazon Aurora DB cluster - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Managing.Backups.html)

<br>

## 15. DB パラメーター設定

### パラメーターグループの適用範囲

既定値を変更する場合は、カスタムパラメーターグループを作成し、DB クラスターや DB インスタンスに関連付ける。

| 種類 | 適用範囲 |
| --- | --- |
| DB クラスターパラメーターグループ | クラスター全体で共通にする設定と、インスタンス単位の設定の既定値を管理する。 |
| DB パラメーターグループ | DB インスタンス単位で適用する設定を管理する。 |

### パラメーターの適用タイミング

動的パラメーター (`dynamic`) は通常、再起動せずに適用でき、静的パラメーター (`static`) は再起動時に適用される。

新しいパラメーターグループへの切り替えでは再起動が必要になる場合があるため、値の変更とグループの切り替えを区別する。

> - [Overview of parameter groups - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/parameter-groups-overview.html)

### Aurora MySQL の設定例

使用するエンジンバージョンが対応するパラメーターを確認し、タイムゾーン、文字コード、ログ出力を設定する。

| パラメーター | 設定例 | 役割 |
| --- | --- | --- |
| `time_zone` | `Asia/Tokyo` | タイムゾーンを指定する。 |
| `character_set_client` | `utf8mb4` | クライアントから送信する文字列の文字コードを指定する。 |
| `character_set_connection` | `utf8mb4` | 接続で使用する文字コードを指定する。 |
| `character_set_database` | `utf8mb4` | データベースの文字コードを指定する。 |
| `character_set_results` | `utf8mb4` | クライアントへ返す結果の文字コードを指定する。 |
| `character_set_server` | `utf8mb4` | サーバーの既定の文字コードを指定する。 |
| `server_audit_logging` | `1` | 監査ログを有効化する。 |
| `server_audit_logs_upload` | `1` | 監査ログを CloudWatch Logs に送信する従来の設定方法で使用する。 |
| `general_log` | `1` | 一般ログを有効化する。 |
| `slow_query_log` | `1` | スロークエリログを有効化する。 |
| `long_query_time` | `3` | スロークエリとして記録する実行時間の閾値を秒単位で指定する。 |

ログの有効化と CloudWatch Logs へのエクスポートは別に設定する。

`server_audit_logs_upload` によるエクスポートには IAM ロールと `aws_default_logs_role` の設定も必要になるため、DB クラスターのログエクスポート設定を使う方法と区別する。

> - [Aurora MySQL configuration parameters - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Reference.ParameterGroups.html)
> - [Publishing Amazon Aurora MySQL logs to Amazon CloudWatch Logs - Amazon Aurora](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Integrating.CloudWatch.html)

<br>
