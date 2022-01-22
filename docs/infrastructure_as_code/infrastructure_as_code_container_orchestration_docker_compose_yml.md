---
title: 【知見を記録するサイト】docker-compose.yml@Docker compose
---

# docker-compose.yml@Docker compose

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. services

### ```services```とは

コンテナオーケストレーションにおける1つのコンテナを定義する．コンテナ名と異なり，サービス名は他のプロジェクトと重複しても良い．```docker-compose```コマンドの引数として指定するため，できるだけ簡潔にする．オプション一覧は以下を参考にせよ．

参考：https://docs.docker.jp/compose/compose-file.html

<br>

### ```args```

Dockerfileの```ARGS```に展開する変数を定義する．Dockerfileに直接実装することとの使い分けとして，Dockerfileの実装は簡単に変更できないが，```docker-compose.yml```ファイルにおける定義は変更しやすい．そのため，使用者に変更して欲しくない変数はDockerfileに実装し，変更しても問題ない変数はこのオプションを用いる．他に，マルチステージビルドを用いており，全てのステージで共通した変数を展開したい場合，このオプションを用いると展開する変数を共通化できる．

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

### ```build```

#### ・```context```

指定したDockerfileのあるディレクトリをカレントディレクトリとして，dockerデーモンに送信するディレクトリを設定する． 

**＊実装例＊**

```yaml
services:
  app:
    build:
      context: .
```

#### ・```dockerfile```

Dockerfileまでのファイルパスを設定する．

**＊実装例＊**

```yaml
services:
  app:
    build:
      dockerfile: ./docker/app/Dockerfile
```

#### ・```target```

ビルドするステージ名．主に，マルチステージビルドの時に用いる．

**＊実装例＊**

```yaml
services:
  app:
    build:
      target: develop
```

<br>

### ```command```

コンテナの起動時に最初に実行するコマンドを設定する．Dockerfileを必要とせず，ベンダーが提供するイメージをそのまま用いるような場合に役立つ．

**＊実装例＊**

mysqlイメージを用いてコンテナを構築するときに，最初に文字コードを設定するコマンドを実行する．

```yaml
services:
  db:
    command: mysqld --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci
```

<br>

### ```container_name```

コンテナ名を命名する．サービス名とは異なり，コンテナ名は他のプロジェクトと重複しないようにする必要があるため，プレフィクスにプロジェクト名をつけると良い．

**＊実装例＊**

```yaml
services:
  web:
    container_name: foo-nginx
```

<br>

### ```depends_on```

コンテナが起動する順番を設定する．

**＊実装例＊**

DBコンテナの起動後に，該当するコンテナを起動するようにする．

```yaml
services:
  app:
    depends_on:
      - db
```

<br>

### ```env_file```，```environment```

コンテナで展開する環境変数を定義する．Dockerfile内での環境変数とは異なり，マルチステージビルドの全ステージで使用できる．dotenv系ライブラリを使用しなくてもよくなる．

**＊実装例＊**

mysqlイメージを用いた場合，データベースの環境変数の設定が必要である．データベースの環境変数は，バックエンドコンテナでも必要なため，```environment```キーに直接環境変数を設定せずに，```env```ファイルに定義した環境変数を```environment```キーで参照すると良い．

```yaml
services:
  db:
    env_file:
      - .env
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD} # rootユーザーのパス
      MYSQL_DATABASE: ${DB_DATABASE} # データベース名
      MYSQL_USER: ${DB_USER} # 一般ユーザー名
      MYSQL_PASSWORD: ${DB_PASSWORD} # 一般ユーザーのパス
```

```bash
# .envファイル
MYSQL_ROOT_PASSWORD=foo # rootユーザーのパス
MYSQL_DATABASE=bar # データベース名
MYSQL_USER=baz # 一般ユーザー名
MYSQL_PASSWORD=qux # 一般ユーザーのパス
```

mysqlイメージでは，環境変数の設定に応じて，コンテナ起動時にSQLが実行されるようになっている．データベース名の環境変数が設定されている場合は『```CREATE DATABASE```』，またユーザー名とパスワードが設定されている場合は『```CREATE USER```』と『```GRANT ALL ```』のSQLが実行される．

参考：https://github.com/docker-library/mysql/blob/master/5.7/docker-entrypoint.sh#L308-L322

ルートユーザー名は定義できず，『```root```』となる．

参考：https://github.com/docker-library/mysql/blob/master/5.7/docker-entrypoint.sh#L156

<br>

### ```expose```

他のコンテナに対してコンテナポートを開放する．ホスト側からはアクセスできないことに注意する．

参考：https://docs.docker.com/compose/compose-file/compose-file-v3/#expose

```
services:
  web:
    expose:
      - "80"
```

<br>

### ```extra_host```

コンテナに，ユーザー定義のプライベートIPアドレスと，これにマッピングされたホスト名を設定する．マッピングは，```/etc/hosts```ファイルに書き込まれる．もし設定しなかった場合，サービス名またはコンテナ名がホスト名として扱われる．

```yaml
services:
  web:
    extra_hosts:
      - web:162.242.195.82
```

```bash
$ cat /etc/hosts

127.0.0.1       localhost
::1     localhost ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
# ユーザー定義のプライベートIPアドレスと，これにマッピングされたホスト名
162.242.195.82       web
172.23.0.3      c9bd8ace335d
```

<br>

### ```hostname```

**＊実装例＊**

コンテナに割り当てられるプライベートIPアドレスに，指定したホスト名をマッピングする．マッピングは，```/etc/hosts```ファイルに書き込まれる．もし設定しなかった場合，サービス名またはコンテナ名がホスト名として扱われる．

**＊実装例＊**

```yaml
services:
  web:
    hostname: web
```

```bash
$ cat /etc/hosts

127.0.0.1       localhost
::1     localhost ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
# プライベートIPアドレスにマッピングされたホスト名
172.18.0.3      web
```

<br>

### ```image```

イメージに名前をつける．デフォルトでは，『```プロジェクト名_サービス名```』となる．

**＊実装例＊**

```yaml
services:
  app:
    image: foo-app:<タグ名>
```

<br>

### ```logging```

#### ・```fluentd```

コンテナで生成されたログをFluentdコンテナに転送する．ログの転送元よりも先に起動するようにしておく必要がある．

参考：https://docs.fluentd.org/container-deployment/docker-compose#step-0-create-docker-compose.yml

**＊実装例＊**

```yaml
services:
  app:
    logging:
      driver: fluentd
      options:
        fluentd-address: localhost:24224
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

### ```networks```

![dockerエンジン内の仮想ネットワーク](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Dockerエンジン内の仮想ネットワーク.jpg)

コンテナを接続する内部/外部ネットワークのエイリアス名を設定する．ネットワーク名ではなく，エイリアス名を指定することに注意する．

**＊実装例＊**

```yaml
networks:
  # 内部/外部ネットワークのエイリアス名を設定する．
  - foo-network
```

ネットワークに接続されているコンテナはコマンドで確認できる．

```bash
# 指定したネットワークに接続するコンテナを確認する．
$ docker network inspect foo-network

[
    {
        "Name": "foo-network",
        
        # ～ 中略 ～
        
        "Containers": {
            "e681fb35e6aa5c94c85acf3522a324d7d75aad8eada13ed1779a4f8417c3fb44": {
                "Name": "<コンテナ名>",
                "EndpointID": "ef04da88901646359086eeb45aab81d2393c2f71b4266ccadc042ae49d684409",
                "MacAddress": "**:**:**:**:**:**",
                "IPv4Address": "nnn.nn.n.n/nn",
                "IPv6Address": ""
            "33632947e4210126874a7c26dce281642a6040e1acbebbdbbe8ba333c281dff8": {
                "Name": "<コンテナ名>",
                "EndpointID": "ef04da88901646359086eeb45aab81d2393c2f71b4266ccadc042ae49d684409",
                "MacAddress": "**:**:**:**:**:**",
                "IPv4Address": "nnn.nn.n.n/nn",
                "IPv6Address": ""            
            }
        },
        
        # ～ 中略 ～
        
        "Labels": {
            "com.docker.compose.network": "foo-network",
            "com.docker.compose.project": "<プロジェクト名>",
            "com.docker.compose.version": "1.29.0"
        }
    }
]
```

なお，接続するネットワークは明示的に指定しなくても良い．その場合，『<プロジェクト名>_default』というネットワークが，『default』というエイリアス名で作成される．

```yaml
services:
  web:
    networks:
      # defaultは，明示的に指定してもしなくてもどちらでも良い．
      - default
```

```bash
$ docker network inspect <プロジェクト名>_default

[
    {
        "Name": "<プロジェクト名>_default",
        
        # ～ 中略 ～
        
        "Containers": {
            "e681fb35e6aa5c94c85acf3522a324d7d75aad8eada13ed1779a4f8417c3fb44": {
                "Name": "<コンテナ名>",
                "EndpointID": "ef04da88901646359086eeb45aab81d2393c2f71b4266ccadc042ae49d684409",
                "MacAddress": "**:**:**:**:**:**",
                "IPv4Address": "nnn.nn.n.n/nn",
                "IPv6Address": ""
            "33632947e4210126874a7c26dce281642a6040e1acbebbdbbe8ba333c281dff8": {
                "Name": "<コンテナ名>",
                "EndpointID": "ef04da88901646359086eeb45aab81d2393c2f71b4266ccadc042ae49d684409",
                "MacAddress": "**:**:**:**:**:**",
                "IPv4Address": "nnn.nn.n.n/nn",
                "IPv6Address": ""            
            }
        },
        
        # ～ 中略 ～
        
        "Labels": {
            "com.docker.compose.network": "default",
            "com.docker.compose.project": "<プロジェクト名>",
            "com.docker.compose.version": "1.29.0"
        }
    }
]
```

<br>

### ```platform```

コンテナのCPUアーキテクチャを設定する．

**＊実装例＊**

```yaml
services:
  app:
    platform: linux/amd64
```

<br>

### ```ports```

ホストとコンテナの間のポートフォワーディングを設定する．コンテナのみポート番号を指定した場合，ホスト側のポート番号はランダムになる．

**＊実装例＊**

```yaml
services:
  web:
    ports:
      - "8080:80" # <ホスト側のポート番号>:<コンテナのポート番号>
```

<br>

### ```stdin_open```

docker-composeコマンドの裏側で実行される```run```コマンドで，```i```オプションを有効化する．

**＊実装例＊**

```yaml
services:
  app:
    stdin_open: true
```

<br>

### ```tty```

docker-composeコマンドの裏側で実行される```run```コマンドで，```t```オプションを有効化する．疑似ターミナルを割り当てるによって，```exit```の後もバックグラウンドでコンテナを起動させ続けられる．

**＊実装例＊**

```yaml
services:
  app:
    tty: true
```

<br>

### ```volumes```（バインドマウント）

最上層と```service```内で，異なるボリューム名を記述した場合，バインドマウントを定義する．ホスト側の```/Users```ディレクトリをコンテナ側にマウントする．

**＊実装例＊**


```yaml
services:
  app:
    volumes:
      - ./web:/var/www/foo # <ホスト側のディレクトリ>:<コンテナのディレクトリ>
```

<br>

### ```volumes```（ボリュームマウント）

最上層と```service```内の両方に，同じボリューム名を記述した場合，ボリュームマウントを定義する．dockerエリアにVolumeが作成され，```service```オプション内に設定した```volumes```オプションでボリュームマウントを行う．

参考：https://qiita.com/ysd_marrrr/items/e8a50c43cff87951385c

**＊実装例＊**

MySQLコンテナのdatadir（```/var/lib/mysql```）に，dockerエリアのボリュームをマウントする．

```yaml
service:
  db:
    volumes:
      # ボリュームマウント
      - mysql_volume:/var/lib/mysql
      
volumes:
  # ボリューム名
  mysql_volume:
    # localで，ホスト側のdockerエリアを指定
    driver: local   
```

権限，バインドボリュームで```datadir```ディレクトリにマウントしようとすると，権限エラーになる．

```bash
mysqld: Can't create/write to file '/var/lib/mysql/is_writable' (Errcode: 13 - Permission denied)
```

参考：https://t-cr.jp/memo/c5179ef2b476237a

<br>

### 変数展開

環境変数を```docker-compose.yml```ファイルに展開する．変数の展開にあたり，```docker-compose.yml```ファイルと同じ階層にある```.env```ファイルが自動的に読み込まれる．この展開に```env_file```オプションを用いることはできない．そのため，例えば```.env```ファイル以外の名前の環境変数ファイルを変数展開のために用いることはできない．

**＊実装例＊**

```yaml
services:
  app:
    build:
      # 出力元の値は，.envファイルに定義しなければならない．
      target: ${APP_ENV}
    image: ${APP_ENV}-foo-app
```

<br>

## 02. networks

### ```networks```とは

標準のネットワークを作成する．ただし定義しなくとも自動的に構築される．ネットワーク名は，指定しない場合に『<プロジェクト名>_default』になる．

<br>

#### ・```name```

ネットワーク名をユーザー定義名にする．

```yaml
networks:
  default:    
    # ユーザー定義のネットワーク名とエイリアス名    
    name: foo-network
```

なお，このネットワークを明示的に設定する場合は，エイリアス名（default）で設定する．

```yaml
services:
  web:
    networks:  
      # defaultは，明示的に指定してもしなくてもどちらでも良い．  
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
        
        # ～ 中略 ～
        
        "Containers": {
            "e681fb35e6aa5c94c85acf3522a324d7d75aad8eada13ed1779a4f8417c3fb44": {
                "Name": "<コンテナ名>",
                "EndpointID": "ef04da88901646359086eeb45aab81d2393c2f71b4266ccadc042ae49d684409",
                "MacAddress": "**:**:**:**:**:**",
                "IPv4Address": "nnn.nn.n.n/nn",
                "IPv6Address": ""
            "33632947e4210126874a7c26dce281642a6040e1acbebbdbbe8ba333c281dff8": {
                "Name": "<コンテナ名>",
                "EndpointID": "ef04da88901646359086eeb45aab81d2393c2f71b4266ccadc042ae49d684409",
                "MacAddress": "**:**:**:**:**:**",
                "IPv4Address": "nnn.nn.n.n/nn",
                "IPv6Address": ""            
            }
        },
        
        # ～ 中略 ～
        
        "Labels": {
            "com.docker.compose.network": "foo-network",
            "com.docker.compose.project": "<プロジェクト名>",
            "com.docker.compose.version": "1.29.0"
        }
    }
]
```

<br>

#### ・```external```

異なる```docker-compose.yml```ファイルから接続できるネットワークを作成する．作成されるネットワーク名とエイリアス名は，```external```キーの上部で設定したものになる．

**＊実装例＊**

バックエンドとフロントエンドが異なる```docker-compose.yml```ファイルで管理されている．フロントエンドコンテナからバックエンドコンテナに接続できるように，ネットワークを作成する．

```yaml
# バックエンドのDocker-compose
services:
  app:
    container_name: backend-container
    
# ～ 中略 ～
    
networks:
  # 作成したい外部ネットワーク名とエイリアス名
  backend:
    external: true  
```

フロントエンドコンテナにて，エイリアス名にネットワーク名を指定して，

```yaml
# フロントエンドのDocker-compose
services:
  app:
    container_name: frontend-container
    # 内部/外部ネットワークのいずれかのエイリアス名を設定する．
    networks:
      - backend

# ～ 中略 ～

networks:
  default:
    external:
      # 接続したい外部ネットワーク名とエイリアス名
      name: backend
```

作成した内部/外部ネットワークは，コマンドで確認できる．『<エイリアス名>_default』というネットワーク名になる．

**＊例＊**

```bash
$ docker network ls

NETWORK ID       NAME        DRIVER     SCOPE
************     backend     bridge     local
```

<br>

## 03. プラグイン

### Volumeプラグイン

#### ・NFSストレージ

NFSプラグインを用いることで，永続化データを```/var/lib/docker/volumes```ではなく，NFSストレージに保存する．

**＊実装例＊**

以下にdocker-composeを用いた場合を示す．

```yaml
version: "3.7"

services:
  app:
    build: # ～ 中略 ～
    ports: # ～ 中略 ～
    depends_on: # ～ 中略 ～
    volumes:
      - example:/data # 下方のオプションが適用される．
      
volumes:
  example:
    driver_opts: # NFSプラグインを使用し，NFSストレージに保存．
      type: "nfs"
      o: "addr=10.40.0.199,nolock,soft,rw"
      device: ":/nfs/example"
```

<br>

## 04. イメージ別Tips

### mysqlイメージ

#### ・ビルド時にSQL実行

mysqlコンテナには```docker-entrypoint-initdb.d```ディレクトリがある．このディレクトリに配置された```sql```ファイルや```bash```プロセスは，mysqlコンテナのビルド時に```docker-entrypoint.sh```ファイルによって実行される．そのため，バインドマウントを用いてこのディレクトリにファイルを置くことで，初期データの投入や複数データベースの作成を実現できる．具体的な実行タイミングについては，以下を参考にせよ．

参考：https://github.com/docker-library/mysql/blob/master/8.0/Dockerfile.debian#L92-L93

**＊実装例＊**

mysqlコンテナに，PHPUnitの実行時のみ用いるデータベースを追加する．以下のような，```docker-compose.yml```ファイルを作成する．

```yaml
version: "3.7"

services:
  db:
    container_name: foo-mysql
    hostname: foo-mysql
    image: mysql:5.7
    ports:
      - "3307:3306"
    volumes:
      - mysql_volume:/var/lib/mysql
      # docker-entrypoint-initdb.dディレクトリにバインドマウントを行う．
      - ./infra/docker/mysql/init:/docker-entrypoint-initdb.d
    environment:
      MYSQL_ROOT_PASSWORD: foo
      MYSQL_DATABASE: foo
      MYSQL_USER: foo
      MYSQL_PASSWORD: foo
      TZ: "Asia/Tokyo"
    command: mysqld --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci
    networks:
      - default
      
volumes:
  mysql_volume:
```

また，```docker-entrypoint-initdb.d```ディレクトリに配置するファイルとして，以下の```sql```ファイルを作成する．このファイルでは，```test```というデータベースを作成するためのSQLを実装する．

```sql
-- /infra/docker/mysql/initにSQLファイルを置く．
CREATE DATABASE IF NOT EXISTS `test` COLLATE 'utf8mb4_general_ci' CHARACTER SET 'utf8mb4';
GRANT ALL ON *.* TO 'foo'@'%' ;
```

PHPUnitで接続するデータベースを指定する方法については，以下を参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_object_oriented_language_php_testing_based_on_code.html

