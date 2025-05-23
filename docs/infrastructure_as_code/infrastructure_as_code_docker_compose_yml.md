---
title: 【IT技術の知見】docker-compose.yml＠Docker compose
description: docker-compose.yml＠Docker composeの知見を記録しています。
---

# docker-compose.yml＠Docker compose

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. docker-compose.ymlとは

コンテナを宣言的に定義し、コンテナのプロビジョニングを実行する。

プロビジョニングされるコンテナについては、以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/virtualization/virtualization_container_docker.html

<br>

## 02. services

### `services`とは

コンテナオーケストレーションにおける1つのコンテナを定義する。

サービス名には役割名 (`app`、`web`、`db`) を名付けると良い。

コンテナ名と異なり、サービス名は他のプロジェクトと重複しても良い。

`docker compose`コマンドの引数として指定するため、できるだけ簡潔にする。

オプション一覧は以下のリンクを参考にせよ。

> - https://docs.docker.jp/compose/compose-file.html

<br>

### `args`

Dockerfileの`ARGS`に展開する変数を定義する。

Dockerfileに直接的に実装することとの使い分けとして、Dockerfileの実装は簡単に変更できないが、`docker-compose.yml`ファイルにおける定義は変更しやすい。

そのため、使用者に変更して欲しくない変数はDockerfileに実装し、変更しても問題ない変数はこのオプションを使用する。

他に、マルチステージビルドを使用しており、全てのステージで共通した変数を展開したい場合、このオプションを使用すると展開する変数を共通化できる。

**＊実装例＊**

```yaml
services:
  app:
    build:
      - PARAM=$PARAM
```

```dockerfile
ARG PARAM

ENV PARAM=${PARAM}
```

**＊実装例＊**

```yaml
# ここに実装例
```

<br>

### `build`

#### ▼ `context`

指定したDockerfileのあるディレクトリをカレントディレクトリとして、dockerデーモンに送信するディレクトリを設定する。

**＊実装例＊**

```yaml
services:
  app:
    build:
      context: .
```

#### ▼ `dockerfile`

Dockerfileまでのパスを設定する。

**＊実装例＊**

```yaml
services:
  app:
    build:
      dockerfile: ./docker/app/Dockerfile
```

#### ▼ `target`

ビルドするステージ名を設定する。

マルチステージビルドの時に使用する。

ステージを指定しない場合、一番最後に定義したステージを使用してビルドが実行される。

**＊実装例＊**

```yaml
services:
  app:
    build:
      target: develop
```

<br>

### `command`

コンテナの起動時に最初に実行するコマンドを設定する。

Dockerfileを必要とせず、ベンダーが提供するイメージをそのまま使用するような場合に役立つ。

**＊実装例＊**

mysqlイメージを使用してコンテナを作成する時に、最初に文字コードを設定するコマンドを実行する。

```yaml
services:
  db:
    command: |
      mysqld --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci
```

<br>

### `container_name`

コンテナ名を命名する。

サービス名とは異なり、コンテナ名は他のプロジェクトと重複しないようにする必要があるため、接頭辞にプロジェクト名をつけると良い。

また、接尾辞をベンダー名とすると良い。

**＊実装例＊**

```yaml
services:
  web:
    container_name: foo
```

<br>

### `depends_on`

サービスを実行する順番を設定する。

**＊実装例＊**

DBサービスの起動後に、該当するコンテナを起動する。

```yaml
services:
  app:
    depends_on:
      - db
```

<br>

### `env_file`、`environment`

コンテナで展開する環境変数を定義する。

Dockerfile内での環境変数とは異なり、マルチステージビルドの全ステージで使用できる。

dotenv系パッケージを使用しなくてもよくなる。

**＊実装例＊**

mysqlイメージを使用した場合、DBの環境変数の設定が必要である。

DBの環境変数は、バックエンドコンテナでも必要なため、`environment`キーに直接的に環境変数を設定せずに、`env`ファイルに定義した環境変数を`environment`キーで参照すると良い。

```yaml
services:
  db:
    env_file:
      - .env
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD} # root権限の実行ユーザーのパス
      MYSQL_DATABASE: ${DB_DATABASE} # DB名
      MYSQL_USER: ${DB_USER} # 一般ユーザー名
      MYSQL_PASSWORD: ${DB_PASSWORD} # 一般ユーザーのパス
```

```bash
# .envファイル

MYSQL_ROOT_PASSWORD=foo # root権限の実行ユーザーのパス
MYSQL_DATABASE=bar # DB名
MYSQL_USER=baz # 一般ユーザー名
MYSQL_PASSWORD=qux # 一般ユーザーのパス
```

mysqlイメージでは、環境変数の設定に応じて、コンテナ起動時にSQLが実行されるようになっている。

DB名の環境変数が設定されている場合は『`CREATE DATABASE`』、またユーザー名とパスワードが設定されている場合は『`CREATE USER`』と『`GRANT ALL `』のSQLが実行される。

> - https://github.com/docker-library/mysql/blob/master/5.7/docker-entrypoint.sh#L308-L322

Rootユーザー名は定義できず、『`root`』となる。

> - https://github.com/docker-library/mysql/blob/master/5.7/docker-entrypoint.sh#L156

<br>

### `expose`

他のコンテナに対してコンテナポートを開放する。

ホスト側からはアクセスできないことに注意する。

> - https://docs.docker.com/compose/compose-file/compose-file-v3/#expose

```yaml
services:
  web:
    expose:
      - "80"
```

<br>

### `extra_host`

コンテナに、ユーザー定義のプライベートIPアドレスと、これにマッピングされたホスト名を設定する。

マッピングは、`/etc/hosts`ファイルに書き込まれる。

もし設定しなかった場合、サービス名またはコンテナ名がホスト名として扱われる。

```yaml
services:
  web:
    extra_hosts:
      - web:162.242.195.82
```

```bash
$ cat /etc/hosts

127.0.0.1       127.0.0.1
::1     127.0.0.1 ip6-127.0.0.1 ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
# ユーザー定義のプライベートIPアドレスと、これにマッピングされたホスト名
162.242.195.82       web
172.23.0.3      c9bd8ace335d
```

<br>

### `healthcheck`

コンテナの起動時にヘルスチェックを実行し、トラフィックを処理可能になるまでコンテナの起動完了を待機する。

トラフィックが処理可能になったらコンテナのビルドを終了し、次のコンテナのビルドを始める。

DBのような、コンテナの起動後にトラフィックが処理可能になるまで時間がかかるツールで役立つ。

`wait`コマンドを実行することに相当する。

```yaml
services:
  # アプリコンテナ
  app:
    depends_on:
      db:
        condition: service_healthy

  # DBコンテナ
  db:
    container_name: foo-mysql
    image: mysql:5.7
    healthcheck:
      test:
        [
          "CMD",
          "mysqladmin",
          "ping",
          "-h",
          "localhost",
          "-u",
          "root",
          "-p$MYSQL_ROOT_PASSWORD",
        ]
      # 頻度が高すぎるとMySQLの起動前にヘルスチェック処理が終わってしまうため、10秒くらいがちょうどいい
      interval: 10s
      timeout: 10s
      retries: 5
```

> - https://stackoverflow.com/a/41854997
> - https://zenn.dev/sun_asterisk/articles/b4b17681d08018
> - https://github.com/peter-evans/docker-compose-healthcheck/blob/master/README_JP.md

<br>

### `hostname`

**＊実装例＊**

コンテナに割り当てられるプライベートIPアドレスに、指定したホスト名をマッピングする。

マッピングは、`/etc/hosts`ファイルに書き込まれる。

もし設定しなかった場合、サービス名またはコンテナ名がホスト名として扱われる。

**＊実装例＊**

```yaml
services:
  web:
    hostname: web
```

```bash
$ cat /etc/hosts

127.0.0.1       127.0.0.1
::1     127.0.0.1 ip6-127.0.0.1 ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
# プライベートIPアドレスにマッピングされたホスト名
172.18.0.3      web
```

<br>

### `image`

イメージに名前をつける。

デフォルトでは、『`プロジェクト名_サービス名`』となる。

**＊実装例＊**

```yaml
services:
  app:
    image: foo:<バージョンタグ>
```

<br>

### `include`

```yaml
include:
  - bar-docker-compose.yaml

services:
  app:
    image: foo:<バージョンタグ>
    depends_on:
      # 読み込んだdocker-compose内のサービス
      - bar
```

> - https://docs.docker.com/compose/how-tos/multiple-compose-files/include/

<br>

### `logging`

#### ▼ `fluentd`

コンテナで作成されたログをFluentdコンテナにフォワーディングする。

ログのフォワーディング元よりも先に起動するようにしておく必要がある。

> - https://docs.fluentd.org/container-deployment/docker-compose#step-0-create-docker-compose.yml

**＊実装例＊**

```yaml
services:
  app:
    logging:
      driver: fluentd
      options:
        fluentd-address: 127.0.0.1:24224
        tag: app
    depends_on:
      - log_router
  log_router:
    build:
      context: .
      dockerfile: ./docker/fluentd/Dockerfile
    ports:
      - "24224:24224"
```

<br>

### `networks`

![dockerエンジン内の仮想ネットワーク](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Dockerエンジン内の仮想ネットワーク.jpg)

コンテナを接続する内/外ネットワークのエイリアスを設定する。

ネットワーク名ではなく、エイリアスを指定することに注意する。

**＊実装例＊**

```yaml
networks:
  # 内/外ネットワークのエイリアスを設定する。
  - foo-network
```

ネットワークに接続されているコンテナはコマンドで確認できる。

```bash
# 指定したネットワークに接続するコンテナを確認する。
$ docker network inspect foo-network

[
    {
        "Name": "foo-network",

        ...

        "Containers": {
            "e681fb35e6aa5c94c85acf3522a324d7d75aad8eada13ed1779a4f8417c3fb44": {
                "Name": "<コンテナ名>",
                "EndpointID": "ef04da88901646359086eeb45aab81d2393c2f71b4266ccadc042ae49d684409",
                "MacAddress": "**:**:**:**:**:**",
                "IPv4Address": "*.*.*.*/*",
                "IPv6Address": ""
            "33632947e4210126874a7c26dce281642a6040e1acbebbdbbe8ba333c281dff8": {
                "Name": "<コンテナ名>",
                "EndpointID": "ef04da88901646359086eeb45aab81d2393c2f71b4266ccadc042ae49d684409",
                "MacAddress": "**:**:**:**:**:**",
                "IPv4Address": "*.*.*.*/*",
                "IPv6Address": ""
            }
        },

        ...

        "Labels": {
            "com.docker.compose.network": "foo-network",
            "com.docker.compose.project": "<プロジェクト名>",
            "com.docker.compose.version": "1.29.0"
        }
    }
]
```

注意点として、接続するネットワークは明示的に指定しなくても良い。その場合、『`<プロジェクト名>_default`』というネットワークが、『default』というエイリアスで作成される。

```yaml
services:
  web:
    networks:
      # defaultは、明示的に指定してもしなくてもどちらでも良い。
      - default
```

```bash
$ docker network inspect <プロジェクト名>_default

[
    {
        "Name": "<プロジェクト名>_default",

        ...

        "Containers": {
            "e681fb35e6aa5c94c85acf3522a324d7d75aad8eada13ed1779a4f8417c3fb44": {
                "Name": "<コンテナ名>",
                "EndpointID": "ef04da88901646359086eeb45aab81d2393c2f71b4266ccadc042ae49d684409",
                "MacAddress": "**:**:**:**:**:**",
                "IPv4Address": "*.*.*.*/*",
                "IPv6Address": ""
            "33632947e4210126874a7c26dce281642a6040e1acbebbdbbe8ba333c281dff8": {
                "Name": "<コンテナ名>",
                "EndpointID": "ef04da88901646359086eeb45aab81d2393c2f71b4266ccadc042ae49d684409",
                "MacAddress": "**:**:**:**:**:**",
                "IPv4Address": "*.*.*.*/*",
                "IPv6Address": ""
            }
        },

        ...

        "Labels": {
            "com.docker.compose.network": "default",
            "com.docker.compose.project": "<プロジェクト名>",
            "com.docker.compose.version": "1.29.0"
        }
    }
]
```

<br>

### `platform`

コンテナのCPUアーキテクチャ (例：Intel、AMD、ARM) を設定する。

**＊実装例＊**

```yaml
services:
  app:
    platform: linux/amd64
```

<br>

### `ports`

ホストとコンテナの間のポートフォワーディングを設定する。

コンテナのみポート番号を指定した場合、ホスト側のポート番号はランダムになる。

**＊実装例＊**

```yaml
services:
  web:
    ports:
      - "8080:80" # <ホスト側のポート番号>:<コンテナのポート番号>
```

```yaml
services:
  web:
    ports:
      # ホスト側のポート番号はランダムになる
      - ":80" # :<コンテナのポート番号>
```

<br>

### `stdin_open`

`docker compose`コマンドの裏側で実行される`docker run`コマンドで、`i`オプションを有効化するか否かを設定する。

**＊実装例＊**

```yaml
services:
  app:
    stdin_open: "true"
```

<br>

### `tty`

`docker compose`コマンドの裏側で実行される`docker run`コマンドで、`t`オプションを有効化するか否かを設定する。

疑似ターミナルを割り当てるによって、`exit`の後もバックグラウンドでコンテナを起動させ続けられる。

**＊実装例＊**

```yaml
services:
  app:
    tty: "true"
```

<br>

### `user`

`docker compose`コマンドの裏側で実行される`docker run`コマンドで、`u`オプションを有効化するか否かを設定する。

コンテナの実行ユーザーのユーザーIDとグループIDを設定する。

Root以外で実行するために使用する。

**＊実装例＊**

```yaml
services:
  app:
    user: "${UID}:${GID}"
```

<br>

### `volumes` (バインドマウント)

最上層と`service`内で、異なるボリューム名を記述した場合、バインドマウントを定義する。

ホスト側の`/Users`ディレクトリをコンテナ側にマウントする。

**＊実装例＊**

```yaml
services:
  app:
    volumes:
      - ./web:/var/www/foo # <ホスト側のディレクトリ>:<コンテナのディレクトリ>
```

<br>

### `volumes` (ボリュームマウント)

最上層と`service`内の両方に、同じボリューム名を記述した場合、ボリュームマウントを定義する。

dockerエリアにVolumeが作成され、`service`オプション内に設定した`volumes`オプションでボリュームマウントを実行する。

> - https://qiita.com/ysd_marrrr/items/e8a50c43cff87951385c

**＊実装例＊**

MySQLコンテナのdatadirディレクトリ (`/var/lib/mysql`) に、dockerエリアのボリュームをマウントする。

datadirディレクトリについては、以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_mysql_conf.html

```yaml
service:
  db:
    image: mysql
    volumes:
      # ボリュームマウント
      - db_data:/var/lib/mysql

volumes:
  # ボリューム名
  db_data:
    # localで、ホスト側のdockerエリアを指定
    driver: local
```

```bash
$ docker volume ls
                                                                                                                                                                                      (minikube/default)
DRIVER    VOLUME NAME
local     mysql_db_data
```

権限、バインドマウントで`datadir`ディレクトリにマウントしようとすると、権限エラーになってしまう。

```bash
mysqld: Can't create/write to file '/var/lib/mysql/is_writable' (Errcode: 13 - Permission denied)
```

> - https://t-cr.jp/memo/c5179ef2b476237a

<br>

### 変数展開

環境変数を`docker-compose.yml`ファイルに展開する。変数の展開にあたり、`docker-compose.yml`ファイルと同じ階層にある`.env`ファイルが自動的に読み込まれる。この展開に`env_file`オプションを使用できない。そのため、例えば`.env`ファイル以外の名前の環境変数ファイルを変数展開のために使用できない。

**＊実装例＊**

```yaml
services:
  app:
    build:
      # 出力元の値は、.envファイルに定義しなければならない。
      target: ${APP_ENV}
    image: ${APP_ENV}-foo
```

<br>

## 03. networks

### `networks`とは

標準のネットワークを作成する。ただし定義しなくとも自動的に作成される。

ネットワーク名は、指定しない場合に『`<プロジェクト名>_default`』になる。

<br>

### `name`

ネットワーク名をユーザー定義名にする。

```yaml
networks:
  default:
    # ユーザー定義のネットワーク名とエイリアス
    name: foo-network
```

注意点として、このネットワークを明示的に設定する場合は、エイリアス (default) で設定する。

```yaml
services:
  web:
    networks:
      # defaultは、明示的に指定してもしなくてもどちらでも良い。
      - default
```

```bash
$ docker network ls

NETWORK ID       NAME                DRIVER     SCOPE
************     foo-network     bridge     local
```

```bash
$ docker network inspect foo-network

[
    {
        "Name": "foo-network",

        ...

        "Containers": {
            "e681fb35e6aa5c94c85acf3522a324d7d75aad8eada13ed1779a4f8417c3fb44": {
                "Name": "<コンテナ名>",
                "EndpointID": "ef04da88901646359086eeb45aab81d2393c2f71b4266ccadc042ae49d684409",
                "MacAddress": "**:**:**:**:**:**",
                "IPv4Address": "*.*.*.*/*",
                "IPv6Address": ""
            "33632947e4210126874a7c26dce281642a6040e1acbebbdbbe8ba333c281dff8": {
                "Name": "<コンテナ名>",
                "EndpointID": "ef04da88901646359086eeb45aab81d2393c2f71b4266ccadc042ae49d684409",
                "MacAddress": "**:**:**:**:**:**",
                "IPv4Address": "*.*.*.*/*",
                "IPv6Address": ""
            }
        },

        ...

        "Labels": {
            "com.docker.compose.network": "foo-network",
            "com.docker.compose.project": "<プロジェクト名>",
            "com.docker.compose.version": "1.29.0"
        }
    }
]
```

<br>

### `external`

#### ▼ `external`とは

![docker-compose_external](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/docker-compose_external.png)

異なる`docker-compose.yml`ファイルから相互に通信できるネットワークを作成する。

作成されるネットワーク名は、`<プロジェクト名>_<ネットワーク名>`になる。

**＊実装例＊**

フロントエンド領域とバックエンド領域が異なる`docker-compose.yml`ファイルで管理されている。

フロントエンドコンテナとバックエンドコンテナの間で相互に通信できるように、ネットワークを公開する。

(1) ネットワークを作成する。

```bash
$ docker network create shared-network
```

(2) バックエンドのdocker-composeを設定する。この時、`backend-network`というdockerネットワークを新しく作成し、また既存の`shared-network`に接続する。

```yaml
# バックエンドのDocker-compose
services:
  backend:
    container_name: backend-container
    networks:
      # 接続したいネットワーク名
      - shared-network
      - backend-network
  database:
    container_name: mysql
    networks:
      - backend-network

networks:
  # backendとdatabaseのサービスのためだけに、新しくdockerネットワークを作成する
  backend-network:
  shared-network:
    # ネットワークを新しく作成せずに、既存のネットワークに接続する
    external: true
```

(3) フロントエンドのdocker-composeを設定する。この時、既存の`shared-network`に接続する。

```yaml
# フロントエンドのDocker-compose
services:
  frontend:
    container_name: frontend-container
    networks:
      # 接続したいネットワーク名
      - shared-network

networks:
  # frontendサービスしかないため、frontend-networkの作成は不要である
  shared-netword:
    # ネットワークを新しく作成せずに、既存のネットワークに接続する
    external: true
```

(4) 各コンテナは `http://localhost:<コンテナごとのポート番号>` で相互に接続できるようになる。

> - https://docs.docker.com/compose/compose-file/compose-file-v2/#external-1
> - https://nishinatoshiharu.com/external-docker-network/
> - https://tech.anti-pattern.co.jp/docker-compose/

#### ▼ dockerネットワーク外からの通信

`external`オプションはdockerネットワーク間を接続する。

一方で、dockerネットワーク外からの通信であれば、`external`オプションは不要である。

例えば、仮想サーバーからDBコンテナに接続する場合、仮想サーバーで`localhost` (コンテナの`hostname`オプションではなく) を指定すればよい。

<br>

## 04. プラグイン

### Volumeプラグイン

#### ▼ NFSストレージ

NFSプラグインを使用することにより、永続データを`/var/lib/docker/volumes`ディレクトリではなく、NFSストレージに保管する。

**＊実装例＊**

以下にdocker-composeを使用した場合を示す。

```yaml
version: "3.9"

services:
  app:
    volumes:
      - app_data:/data # 下方のオプションが適用される。

volumes:
  app_data:
    driver_opts: # NFSプラグインを使用して、NFSストレージに保管。
      type: "nfs"
      o: "addr=10.40.0.199,nolock,soft,rw"
      device: ":/nfs/example"
```

```bash
$ docker volume ls
                                                                                                                                                                                      (minikube/default)
DRIVER    VOLUME NAME
local     app_data
```

<br>

## 05. イメージ別プラクティス

### mysqlイメージ

#### ▼ ビルド時にSQL実行

mysqlコンテナには`docker-entrypoint-initdb.d`ディレクトリがある。

このディレクトリ配下に配置された`sql`ファイルや`bash`プロセスは、mysqlコンテナのビルド時に`docker-entrypoint.sh`ファイルによって実行される。

そのため、バインドマウントを使用してこのディレクトリ配下にファイルを配置することにより、初期データの投入や複数DBの作成を実現できる。

具体的な実行タイミングについては、以下のリンクを参考にせよ。

> - https://github.com/docker-library/mysql/blob/master/8.0/Dockerfile.debian#L92-L93

**＊実装例＊**

mysqlコンテナに、PHPUnitの実行時のみ使用するDBを追加する。以下のような、`docker-compose.yml`ファイルを作成する。

```yaml
version: "3.9"

services:
  db:
    container_name: foo-mysql
    hostname: foo-mysql
    image: mysql:5.7
    ports:
      - "3307:3306"
    volumes:
      - db_data:/var/lib/mysql
      # docker-entrypoint-initdb.dディレクトリにバインドマウントを実行する。
      - ./infra/docker/mysql/initdb:/docker-entrypoint-initdb.d
    environment:
      MYSQL_ROOT_PASSWORD: foo
      MYSQL_DATABASE: foo
      MYSQL_USER: foo
      MYSQL_PASSWORD: foo
      TZ: "Asia/Tokyo"
    command: |
      mysqld --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci
    networks:
      - default

volumes:
  db_data:
```

また、`docker-entrypoint-initdb.d`ディレクトリ配下に配置するファイルとして、以下の`sql`ファイルを作成する。

```yaml
# initdbに複数のsqlファイルを置く
initdb
├── foo.sql
└── bar.sql
```

このSQLでは、`test`というDBを作成し、ユーザーが`test`DBに接続できるようにする。

```mysql
CREATE DATABASE IF NOT EXISTS `test` COLLATE 'utf8mb4_general_ci' CHARACTER SET 'utf8mb4';
GRANT ALL ON *.* TO 'foo'@'%' ;
```

PHPUnitで接続するDBを指定する方法については、以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_application_php.html

<br>
