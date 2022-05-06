---
title: 【知見を記録するサイト】Docker＠仮想化
description: Docker＠仮想化の知見をまとめました．
---

# Docker＠仮想化

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Dockerの仕組み

### 構造

Dockerは，ホストOS，ベースイメージ，イメージレイヤー，コンテナレイヤー，から構成される．

参考：https://ragin.medium.com/docker-what-it-is-how-images-are-structured-docker-vs-vm-and-some-tips-part-1-d9686303590f

![docker_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker_architecture.png)

<br>

### イメージレイヤー

![イメージレイヤーからなるイメージのビルド](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/イメージのビルド.png)

イメージレイヤーの実体は，```/var/lib/docker/overlay2```ディレクトリ配下にハッシュ値の名前からなるファイルとして保存されている．Dockerは，オーバーレイファイルシステムを使用して，各ファイルを層状に管理する．1つの命令につき，1つのイメージレイヤーを積み重ねるようになっている．

参考：

- https://www.creationline.com/lab/35518
- https://tech-lab.sios.jp/archives/21103#OverlayFS

```bash
$ docker container inspect foo-container -f "{{json .GraphDriver.Data}}" | jq .

{
  "LowerDir": "/var/lib/docker/overlay2/*****-init/diff:/var/lib/docker/overlay2/*****/diff:/var/lib/docker/overlay2/*****/diff:/var/lib/docker/overlay2/*****/diff:/var/lib/docker/overlay2/*****/diff",
  "MergedDir": "/var/lib/docker/overlay2/*****/merged",
  "UpperDir": "/var/lib/docker/overlay2/*****/diff",
  "WorkDir": "/var/lib/docker/overlay2/*****/work"
}
```

<br>

### コンテナレイヤー

イメージからコンテナを構築する時に，イメージレイヤーの上にコンテナレイヤーが積み重ねられる．

参考：https://blog.codecamp.jp/programming-docker-image-container

![イメージ上へのコンテナレイヤーの積み重ね](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/イメージ上へのコンテナレイヤーの積み重ね.png)

<br>

### IaC

#### ▼ Dockerfile

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_container_docker_dockerfile.html

<br>

## 02. Dockerクライアント

### dockerクライアント

#### ▼ dockerクライアントとは

dockerクライアントは，dockerコマンドを使用してdockerデーモンAPIをコールできる．

参考：https://www.slideshare.net/zembutsu/docker-underlying-and-containers-lifecycle

![docker-daemon](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker-client.png)

<br>

### dockerデーモン

#### ▼ dockerデーモンとは

ホスト側で稼働し，コンテナの操作を担う常駐プログラム．dockerクライアントにdockerデーモンAPIを公開する．クライアントがdockerコマンドを実行すると，dockerデーモンAPIがコールされ，コマンドに沿ってコンテナが操作される．

![docker-daemon](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker-daemon.png)

<br>

## 03. Dockerマウント

### Dockerマウントとは

コンテナのファイルデータをホスト上のストレージに一時化/非永続化/永続化するための方法である．

参考：

- https://geekylane.com/what-is-docker-storage-learn-everything-about-docker-storage-theory/
- https://maku77.github.io/docker/mount/

![docker_storage](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker_storage.png)

<br>

### バインドマウント

#### ▼ バインドマウントとは

![docker_bind-mount](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker_bind-mount.png)

ホスト側のディレクトリをコンテナ側にマウントすることにより，データを永続化する方法．ホストで作成されるデータが継続的に変化する場合に適しており，例えば開発環境でアプリケーションをホストコンテナ間と共有する方法として推奨である．しかし，ホスト側のデータを永続化する方法としては不適である．

参考：

- https://docs.docker.com/storage/bind-mounts/
- https://www.takapy.work/entry/2019/02/24/110932

#### ▼ 使用方法

Dockerfileや```docker-compose.yml```ファイルへの定義，```docker```コマンドの実行，で使用できるが，```docker-compose.yml```ファイルでの定義が推奨である．

**＊例＊**

```bash
# ホストをコンテナ側にバインドマウント
$ docker run -d -it --name <コンテナ名> /bin/bash \
  --mount type=bind, src=home/projects/<ホスト側のディレクトリ名>, dst=/var/www/<コンテナ側のディレクトリ名>
```

#### ▼ マウント元として指定できるディレクトリ

以下の通り，ホスト側のマウント元のディレクトリにはいくつか選択肢がある．

![mount_host-directory](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/mount_host-directory.png)

<br>

### ボリュームマウント

#### ▼ ボリュームマウントとは

![docker_volume-mount](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker_volume-mount.png)

ホストにあるdockerエリア（```/var/lib/docker/volumes```ディレクトリ）のマウントポイント（```/var/lib/docker/volumes/<ボリューム名>/_data```）をコンテナ側にマウントすることより，データを永続化する方法．ホストで作成されるデータをめったに変更しない場合に適しており，例えばDBのデータをホストコンテナ間と共有する方法として推奨である．しかし，例えばアプリケーションやパッケージといったような変更されやすいデータを共有する方法としては不適である．

参考：

- https://docs.docker.com/storage/volumes/
- https://www.takapy.work/entry/2019/02/24/110932

#### ▼ ボリューム，マウントポイントとは

ホスト側のdockerエリア（```/var/lib/docker/volumes```ディレクトリ）に保存される永続データをボリュームという．また，マウント先のディレクトリ（```/var/lib/docker/volumes/<ボリューム名>/_data```）をマウントポイントという．

#### ▼ 使用方法

Dockerfileや```docker-compose.yml```ファイルへの定義，```docker```コマンドの実行，で使用できるが，```docker-compose.yml```ファイルでの定義が推奨である．

**＊例＊**

```bash
# ホストをコンテナ側にバインドマウント
$ docker run -d -it --name <コンテナ名> /bin/bash \
  --mount type=volume, src=home/projects/<ホスト側のディレクトリ名>, dst=/var/www/<コンテナ側のディレクトリ名>
```

#### ▼ Data Volumeコンテナによる永続化データの提供

ボリュームを使用する場合のコンテナ配置手法の一種．dockerエリアのボリュームをData Volumeをコンテナのディレクトリにマウントしておく．ボリュームを使用する時は，dockerエリアを参照するのではなく，Data Volumeコンテナを参照する．

![data-volumeコンテナ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/data-volumeコンテナ.png)

<br>

### バインドマウント，ボリュームマウント，```COPY```，NFS

#### ▼ 脆弱性の比較

本番環境で，ホストからコンテナにバインドマウントを実行できる．しかしバインドマウントでは，ホスト側のコードが隔離されておらず，コンテナ側のコードからホスト側のマウントに関係ないファイルへもアクセスできてしまう（例：```cd```コマンドによって，ホスト側のマウントに関係ないディレクトリにアクセスできてしまう）．一方でボリュームマウントでは，ホスト側のコードはdockerエリア内に隔離されており，ホストの他のファイルからは切り離されている．これにより，マウントに関係のないファイルへはアクセスできないようになっている．そのため，バインドマウントより安全である．

参考：

- https://geekylane.com/what-is-docker-storage-learn-everything-about-docker-storage-theory/
- https://blog.logrocket.com/docker-volumes-vs-bind-mounts/
- https://devops4solutions.com/storage-options-in-docker/
- https://www.takapy.work/entry/2019/02/24/110932

#### ▼ 本番環境での使いやすさの比較

脆弱性の観点から，本番環境ではボリュームマウント（```VOLUME```）や```COPY```を使用して，アプリケーションをdockerイメージに組み込むようにする．

参考：https://docs.docker.com/develop/dev-best-practices/#differences-in-development-and-production-environments

その上で，ボリュームマウントでは，組み込んだアプリケーションのコードをコンテナ起動後しか参照できないため，コードの組み込みとコンテナ起動の間にアプリケーションを加工する（例：ディレクトリの実行権限を変更するなど）場合は```COPY```の方が便利である．方法として，イメージレジストリ内のプライベートリポジトリにデプロイするイメージのビルド時に，ホスト側のアプリケーションをイメージ側に```COPY```しておく．これにより，本番環境ではこのイメージをプルしさえすれば，アプリケーションを使用できるようになる．

参考：

- https://www.nyamucoro.com/entry/2018/03/15/200412
- https://blog.fagai.net/2018/02/22/docker%E3%81%AE%E7%90%86%E8%A7%A3%E3%82%92%E3%81%84%E3%81%8F%E3%82%89%E3%81%8B%E5%8B%98%E9%81%95%E3%81%84%E3%81%97%E3%81%A6%E3%81%84%E3%81%9F%E8%A9%B1/

#### ▼ パフォーマンスの比較

アプリケーションが処理を実行する時，大量のパッケージが読み出される．この時，ホスト上で稼働するコンテナのパフォーマンスは，『```COPY，NFS > ボリュームマウント > バインドマウント```』の順で高い．

| コンテナへのコードの組み込み方 | パフォーマンスに関する説明                                   | 補足                                                         |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| バインドマウント               | バインドマウントでは，ホストとコンテナ間のライフサイクルは同じであり，ファイルの状態が同期されている．この時，コンテナからホストにアウトプット処理，またホストからコンテナにインプット処理が発生する．そのため，コンテナではアプリケーションの処理を実行しながら，合わせてホスト間とI/O処理も実行することになり，コンテナのパフォーマンスは悪い． | 参考：<br>・https://stackoverflow.com/questions/64629569/docker-bind-mount-directory-vs-named-volume-performance-comparison<br>・https://qiita.com/ucan-lab/items/a88e2e5c2a79f2426163 |
| ボリュームマウント             | ボリュームマウントでは，ホストとコンテナ間のライフサイクルは分離されており，ファイルの状態は同期されていない．そのため，ボリュームマウントよりはコンテナのパフォーマンスが良い． | 参考：https://qiita.com/ucan-lab/items/a88e2e5c2a79f2426163  |
| ```COPY```                     | ```COPY```では，イメージのビルド時にコードを組み込むだけで，以降，ホストとコンテナ間でコードのI/O処理は発生しない．そのため，バインドマウントやボリュームマウントと比べて，コンテナのパフォーマンスが良い．このことは，DockerだけでなくKubernetesでも同様である． |                                                              |
| NFS                            | NFSを使用したマウントでは，高速でI/O処理が実行される．そのため，コンテナのパフォーマンスが良い． | 参考：https://qiita.com/kunit/items/36d9e5fa710ad26f8010     |

<br>

## 04. ネットワーキング

### bridgeネットワーク

#### ▼ bridgeネットワークとは

複数のコンテナ間に対して，仮想ネットワークで接続させる．また，仮想ネットワークを物理ネットワークの間を，仮想ブリッジを使用してbridge接続する．ほとんどの場合，この方法を使用する．

参考：https://www.itmedia.co.jp/enterprise/articles/1609/21/news001.html

![Dockerエンジン内の仮想ネットワーク](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Dockerエンジン内の仮想ネットワーク.jpg)

サーバーへのリクエストメッセージがコンテナに届くまでを以下に示す．サーバーの```8080```番ポートと，WWWコンテナの```80```番ポートのアプリケーションの間で，ポートフォワーディングを行う．これにより，『```http://<サーバーのプライベートIPアドレス（localhost）>:8080```』にリクエストを送信すると，WWWコンテナのポート番号に転送されるようになる．

| 処理場所            | リクエストメッセージの流れ              | プライベートIPアドレス例                                     | ポート番号例 |
| :----------------- | :--------------------------------- | :----------------------------------------------------------- | ------------ |
| コンテナ内プロセス    | インバウンド通信を待ち受けるポート        |                                                              | ```:80```    |
|                    | ↑                                  |                                                              |              |
| コンテナ            | コンテナポート                        | ・```http://127.0.0.1```<br>・```http://<Dockerのhostnameの設定値>``` | ```:80```    |
|                    | ↑                                  |                                                              |              |
| ホスト              | 仮想ネットワーク                      | ```http://172.XX.XX.XX```                                    |              |
|                    | ↑                                  |                                                              |              |
| ホスト              | 仮想ブリッジ                         |                                                              |              |
|                    | ↑                                  |                                                              |              |
| ホストハードウェア    | サーバーのNIC（Ethernetカード）       | ```http://127.0.0.1```                                       | ```:8080```  |

<br>

### noneネットワーク

#### ▼ noneネットワークとは

特定のコンテナを，ホストや他のコンテナとは，ネットワーク接続させない．


```bash
$ docker network list

NETWORK ID          NAME                    DRIVER              SCOPE
7edf2be856d7        none                    null                local
```

<br>


### hostネットワーク

#### ▼ hostネットワークとは

特定のコンテナに対して，ホストと同じネットワーク情報をもたせる．

```bash
$ docker network list

NETWORK ID          NAME                    DRIVER              SCOPE
ac017dda93d6        host                    host                local
```

<br>

### コンテナ間の接続方法

#### ▼ 『ホスト』から『ホスト（```localhost```）』にリクエスト

『ホスト』から『ホスト』に対して，アウトバウンド通信を送信する．ここでのホスト側のホスト名は，『```localhost```』となる．リクエストは，ポートフォワーディングされたコンテナに転送される．ホストとコンテナの間のネットワーク接続の成否を確認できる．

**＊例＊**

『ホスト』から『ホスト』に対してアウトバウンド通信を送信し，ホストとappコンテナの間の成否を確認する．

```bash
# ホストで実行
$ curl --fail http://127.0.0.1:8080
```

#### ▼ 『コンテナ』から『コンテナ』にリクエスト

『コンテナ』から『コンテナ』に対して，アウトバウンド通信を送信する．ここでのコンテナのホスト名は，コンテナ内の『```/etc/hosts```』に定義されたものとなる．リクエストはホストを経由せず，そのままコンテナに送信される．コンテナ間のネットワーク接続の成否を確認できる．コンテナのホスト名の定義方法については，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/virtualization/virtualization_container_orchestration.html

**＊例＊**

『appコンテナ』から『webコンテナ』に対して，アウトバウンド通信を送信し，appコンテナとwebコンテナの間の成否を確認する．

```bash
# コンテナ内で実行
$ curl --fail http://<webコンテナに割り当てたホスト名>:80/
```

#### ▼ 『コンテナ』から『ホスト（```host.docker.internal```）』にリクエスト

『コンテナ』から『ホスト』に対して，アウトバウンド通信を送信する．ここでのホスト側のホスト名は，『```host.docker.internal```』になる．リクエストは，ホストを経由して，ポートフォワーディングされたコンテナに転送される．ホストとコンテナの間のネットワーク接続の成否を確認できる．

```bash
# コンテナ内で実行
$ curl --fail http://host.docker.internal:8080
```

<br>

### ポートフォワーディング

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_authentication_authorization.html

<br>

## 05. ロギング

### ロギングドライバー

#### ▼ ロギングドライバーとは

コンテナ内の標準出力（```/dev/stdout```）と標準エラー出力（```/dev/stderr```）に出力されたログを，ファイルやAPIに対して転送する．

```bash
$ docker run -d -it --log-driver <ロギングドライバー名> --name  <コンテナ名> <イメージ名>:<バージョンタグ> /bin/bash
```

#### ▼ json-file

標準出力/標準エラー出力に出力されたログを，```/var/lib/docker/containers/＜コンテナID＞/＜コンテナID＞-json.log```ファイルに転送する．デフォルトの設定値である．

```bash
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3" 
  }
}
```

#### ▼ fluentd

構造化ログに変換し，サイドカーとして稼働するFluentdコンテナに送信する．ECSコンテナのawsfirelensドライバーは，fluentdドライバーをラッピングしたものである．

参考：

- https://docs.docker.com/config/containers/logging/fluentd/
- https://aws.amazon.com/jp/blogs/news/under-the-hood-firelens-for-amazon-ecs-tasks/

```bash
 {
   "log-driver": "fluentd",
   "log-opts": {
     "fluentd-address": "<Fluentdコンテナのホスト名>:24224"
   }
 }
```

#### ▼ none

標準出力/標準エラー出力に出力されたログを，ファイルやAPIに転送しない． ファイルに出力しないことで，開発環境のアプリケーションサイズの肥大化を防ぐ．

#### ▼ awslogs

標準出力/標準エラー出力に出力されたログをCloudWatch-APIに送信する．

参考：https://docs.docker.com/config/containers/logging/awslogs/

```bash
{
  "log-driver": "awslogs",
  "log-opts": {
    "awslogs-region": "us-east-1"
  }
}
```

#### ▼ gcplogs

標準出力/標準エラー出力に出力されたログを，Google Cloud LoggingのAPIに転送する．

参考：https://docs.docker.com/config/containers/logging/gcplogs/

```bash
{
  "log-driver": "gcplogs",
  "log-opts": {
    "gcp-meta-name": "example-instance-12345"
  }
}
```

<br>

### 各ベンダーのイメージのログ出力先

#### ▼ dockerコンテナの標準出力/標準エラー出力

Linuxでは，標準出力は『```/proc/<プロセスID>/fd/1```』，標準エラー出力は『```/proc/<プロセスID>/fd/2```』である．dockerコンテナでは，『```/dev/stdout```』が『```/proc/self/fd/1```』のシンボリックリンク，また『```/dev/stderr```』が『```/proc/<プロセスID>/fd/2```』のシンボリックリンクとして設定されている．

```bash
[root@<コンテナID>:/dev] $ ls -la

total 4
drwxr-xr-x 5 root root  340 Oct 14 11:36 .
drwxr-xr-x 1 root root 4096 Oct 14 11:28 ..
lrwxrwxrwx 1 root root   11 Oct 14 11:36 core -> /proc/kcore
lrwxrwxrwx 1 root root   13 Oct 14 11:36 fd -> /proc/self/fd
crw-rw-rw- 1 root root 1, 7 Oct 14 11:36 full
drwxrwxrwt 2 root root   40 Oct 14 11:36 mqueue
crw-rw-rw- 1 root root 1, 3 Oct 14 11:36 null
lrwxrwxrwx 1 root root    8 Oct 14 11:36 ptmx -> pts/ptmx
drwxr-xr-x 2 root root    0 Oct 14 11:36 pts
crw-rw-rw- 1 root root 1, 8 Oct 14 11:36 random
drwxrwxrwt 2 root root   40 Oct 14 11:36 shm
lrwxrwxrwx 1 root root   15 Oct 14 11:36 stderr -> /proc/self/fd/2 # 標準エラー出力
lrwxrwxrwx 1 root root   15 Oct 14 11:36 stdin -> /proc/self/fd/0
lrwxrwxrwx 1 root root   15 Oct 14 11:36 stdout -> /proc/self/fd/1 # 標準出力
crw-rw-rw- 1 root root 5, 0 Oct 14 11:36 tty
crw-rw-rw- 1 root root 1, 9 Oct 14 11:36 urandom
crw-rw-rw- 1 root root 1, 5 Oct 14 11:36 zero
```

#### ▼ nginxイメージ

公式のnginxイメージは，```/dev/stdout```というシンボリックリンクを，```/var/log/nginx/access.log```ファイルに作成している．また，```/dev/stderr```というシンボリックリンクを，```/var/log/nginx/error.log```ファイルに作成している．これにより，これらのファイルに対するログの出力は，```/dev/stdout```と```/dev/stderr```に転送される．

参考：https://docs.docker.com/config/containers/logging/

#### ▼ php-fpmイメージ

要勉強．

<br>
