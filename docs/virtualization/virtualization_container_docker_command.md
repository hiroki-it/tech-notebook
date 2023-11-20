---
title: 【IT技術の知見】コマンド＠Docker
description: コマンド＠Dockerの知見を記録しています。
---

# コマンド＠Docker

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `docker`コマンド

### attach

#### ▼ attachとは

**＊例＊**

デタッチドモードを使用して、起動中コンテナに接続する。

```bash
$ docker attach <起動中コンテナ名>
```

<br>

### build

#### ▼ -force-rm、--no-cache

**＊例＊**

キャッシュ無しで、指定のDockerfileを基に、コンテナイメージをビルドする。失敗した時は削除するように、`--force-rm`オプションを有効化するか否かを設定する。

```bash
$ docker build --file Dockerfile --tag <コンテナイメージ名>:<バージョンタグ> --force-rm=true --no-cache .
```

#### ▼ --tag (-t)

ビルドしたコンテナイメージに、イメージ名とタグを付与する。

```bash
$ docker build --file Dockerfile --tag <コンテナイメージ名>:<バージョンタグ>
```

> - https://docs.docker.com/engine/reference/commandline/build/#tag

#### ▼ --target

ビルドするステージ名を設定する。

マルチステージビルドの時に使用する。

ステージを指定しない場合、一番最後に定義したステージを使用してビルドが実行される。

> - https://docs.docker.com/engine/reference/commandline/build/#specifying-target-build-stage---target

```bash
$ docker build --file Dockerfile --tag <コンテナイメージ名>:<バージョンタグ> --target dev .
```

<br>

### commit

#### ▼ commitとは

停止中コンテナからコンテナイメージを作成する。

**＊例＊**

```bash
$ docker commit <停止中コンテナ名> <コンテナID>

$ docker commit <停止中コンテナ名> <Docker Hubユーザー名>/<コンテナイメージ名>:<バージョンタグ>
```

<br>

### container

#### ▼ prune

停止中コンテナのみを全て削除する。

**＊例＊**

```bash
$ docker container prune
```

<br>

### cp

#### ▼ cpとは

Dockerfileの`COPY`コマンドを使用してコンテナ内に配置しているファイルに関して、変更のたびにコンテナイメージをビルドを実行することは面倒のため、ホストからコンテナにコピーし、再読み出しを実行する。

ただし、コンテナを再作成すると元に戻ってしまうことに注意。

**＊例＊**

```bash
# ホスト側のファイルをコンテナにコピー
$ docker cp ./docker/www/nginx.conf <コンテナID>:/etc/nginx/nginx.conf

# コンテナに接続後に、nginxの設定ファイルを再読み出し。
$ docker exec -it <コンテナ名> bin/bash # もしくはbin/sh
[root@<コンテナID>:~] $ nginx -s reload
[root@<コンテナID>:~] $ exit

# アクセスログを確認
$ docker logs <コンテナ名>
```

<br>

### create

#### ▼ createとは

**＊例＊**

コンテナレイヤーを作成し、コンテナを作成。

起動はしない。

```bash
$ docker create <コンテナ名> <コンテナイメージ名>:<バージョンタグ>
```

<br>

### exec

#### ▼ -it

**＊例＊**

デタッチドモードを使用して、起動中コンテナ内でコマンドを実行する。

実行するコマンドが`bash`や`shell`の場合、コンテナに通信できる。

```bash
# i：interactive、t：tty (対話モード)
$ docker exec -it <起動中コンテナ名> /bin/bash

# コンテナ内に/bin/bash がない場合
$ docker exec -it <起動中コンテナ名> /bin/sh
```

#### ▼ attach、execの違い

まず`docker attach`コマンドでは、起動中コンテナに接続する。

`exit`コマンドを使用して、コンテナとの接続を切断した後、コンテナが停止してしまう。

```bash
# デタッチドモードによる起動
$ docker run -d -it --name <コンテナ名> <コンテナイメージ名>:<バージョンタグ> /bin/bash

# デタッチドモードによって起動中コンテナに接続
$ docker attach <起動中コンテナ名>

# PID=1で、1つのbashプロセスが稼働していることを確認できる
[root@<コンテナID>:~] $ ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  16152  3872 pts/0    Ss+  18:06   0:00 /bin/bash
root        33  0.0  0.1  45696  3732 pts/1    R+   18:22   0:00 ps aux

# コンテナとの接続を切断
[root@<コンテナID>:~] $ exit

# コンテナの状態を確認
$ docker container ps -a --no-trunc # コンテナのフェーズがEXITedになっている
```

一方で`docker exec`コマンドでは、起動中コンテナでコマンドを実行する。

実行するコマンドが`bash`や`shell`の場合、コンテナに通信できる。

`exit`コマンドを使用して、コンテナとの接続を切断した後でも、コンテナが起動し続ける。

```bash
# デタッチドモードによる起動
$ docker run -d -it --name <コンテナ名> <コンテナイメージ名>:<バージョンタグ> /bin/bash

# 対話モードを使用して、デタッチドモードによって起動中コンテナに接続
$ docker exec -it <起動中コンテナ名> /bin/bash # もしくはbin/sh

# PID=1,17で、2つのbashプロセスが稼働していることを確認できる
[root@<コンテナID>:~] $ ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  16152  3872 pts/0    Ss+  18:06   0:00 /bin/bash
root        17  0.0  0.1  16152  4032 pts/1    Ss   18:21   0:00 /bin/bash
root        34  0.0  0.1  45696  3732 pts/1    R+   18:22   0:00 ps aux

# コンテナとの接続を切断
[root@<コンテナID>:~] $ exit

# コンテナの状態を確認
$ docker container ps -a --no-trunc # コンテナのフェーズがUPになっている
```

<br>

### search

#### ▼ searchとは

**＊例＊**

レジストリ側に保管されているイメージを検索する。

```bash
$ docker search <コンテナイメージ名>
```

<br>

### images

#### ▼ imagesとは

**＊例＊**

ホストにインストールされたイメージを確認する。

```bash
$ docker images
```

#### ▼ prune

**＊例＊**

コンテナに使用されていないイメージを一括で削除

```bash
$ docker image prune -a
```

#### ▼ rmi

**＊例＊**

タグ名のないイメージのみを全て削除する。

```bash
$ docker rmi --force $(sudo docker images --filter "dangling=true" --all --quiet)
```

<br>

### inspect

#### ▼ inspectとは

**＊例＊**

起動中コンテナの全ての設定内容を取得する。

`grep`とも組み合わせられる。

```bash
$ docker inspect <起動中コンテナ名>

$ docker inspect <起動中コンテナ名> | grep IPAddress
```

**＊例＊**

json-fileドライバーを使用している時に、ログファイルの出力先を確認する。

```bash
 $ docker inspect <起動中コンテナ名> | grep LogPath

 "LogPath": "/var/lib/docker/containers/*****-json.log",
```

<br>

### log

#### ▼ --follow

標準出力 (`/dev/stdout`) /標準エラー出力 (`/dev/stderr`) に出力されたログを表示し続ける。ロギングドライバーが`json-file`の場合のみ有効。

```bash
$ docker logs -f <コンテナ名>
```

#### ▼ --tail

**＊例＊**

指定した行数だけ、ログを取得する。ロギングドライバーが`json-file`の場合のみ有効。

```bash
$ docker logs --follow=true --tail=500 <コンテナ名>
```

<br>

### login

#### ▼ login

イメージレジストリにログインする。

#### ▼ --password-stdin

コマンドへの標準入力をパスワードとしつつ、`docker login`コマンドを実行する。

```bash
$ echo "pass" \
    | docker login --username foo --password-stdin
```

<br>

### network

#### ▼ ls

**＊例＊**

```bash
$ docker network ls

NETWORK ID          NAME                    DRIVER              SCOPE
ae25b9b7740b        bridge                  bridge              local
aeef782b227d        tech-notebook_default   bridge              local
```

#### ▼ prune

```bash
$ docker network prune
```

#### ▼ inspect

複数のコンテナが稼働している時に、コンテナがいずれのネットワークを使用しているかを確認する。

```bash
$ docker network inspect <ネットワーク名>
```

<br>

### ps

#### ▼ -a

**＊例＊**

コンテナの起動と停止に関わらず、IDなどの一覧を取得する。

```bash
$ docker ps -a
```

<br>

### pull

#### ▼ pull

**＊例＊**

レジストリ側のコンテナイメージをクライアント側にインストールする。

```bash
$ docker pull <コンテナイメージ名>:<バージョンタグ>
```

<br>

### push

#### ▼ pushとは

**＊例＊**

ホストで作成したコンテナイメージを、指定したDockerHubのユーザーにアップロードする。

```bash
$ docker push <Docker Hubユーザー名>/<コンテナイメージ名>:<バージョンタグ>
```

**＊例＊**

ホストで作成したコンテナイメージを、指定したECRにアップロードする。

ECRはタグ名がやや特殊のため、事前にタグを付け替える必要がある。

```bash
# docker tag foo:latest <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
$ docker tag <ローカルマシンでのコンテナイメージ名>:<ローカルマシンでのバージョンタグ> <イメージレジストリ名>/<イメージリポジトリ名>:<バージョンタグ>

# docker push <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
$ docker push <イメージレジストリ名>/<イメージリポジトリ名>:<バージョンタグ>
```

<br>

### rm

#### ▼ --force

**＊例＊**

起動中/停止中の全てコンテナを強制的に削除する。

```bash
$ docker rm --force $(docker ps --all --quiet)
```

<br>

### run

#### ▼ --hostname

コンテナ内の`/etc/hosts`ファイルで、コンテナのプライベートIPアドレスを確認できる。

`--hostname`オプションで命名していればその名前、指定していなければランダムな文字列が割り当てられる。

**＊例＊**

```bash
$ docker run -d -it --hostname <ホスト名> --name <コンテナ名> --publish=8080:80 <コンテナイメージ名>:<バージョンタグ> /bin/bash
$ docker exec -it <起動中コンテナ名> /bin/bash

[root@<コンテナID>:/] $ cat /etc/hosts

127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
fe00::0	ip6-localnet
ff00::0	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
172.18.0.2	<ホスト名>
```

#### ▼ --publish

指定したホストポートとコンテナポートのマッピングを実行する。`--publish-all`オプションではホストポートをランダムに選択してポートマッピングを実行する。

> - https://www.whitesourcesoftware.com/free-developer-tools/blog/docker-expose-port/

```bash
$ docker run -d -it --name <コンテナ名> --publish=8080:80 <コンテナイメージ名>:<バージョンタグ> /bin/bash
```

#### ▼ --expose

他のコンテナに公開するコンテナポートを`--expose`オプションで設定できる。

これはDockerfileでEXPOSE命令として設定しても良い。

補足として、プロセスの受信するポートと合わせる必要がある。

> - https://www.whitesourcesoftware.com/free-developer-tools/blog/docker-expose-port/

```bash
$ docker run -d -it --name <コンテナ名> --expose=80 <コンテナイメージ名>:<バージョンタグ> /bin/bash
```

#### ▼ -a、-d

すでに停止中または起動中コンテナが存在していても、これとは別にコンテナを新しく作成し、起動する。

加えてそのコンテナ内でコマンドを実行する。

起動時に`bash`プロセスや`shell`プロセスを実行すると、コンテナに通信できる。

何も渡さない場合は、デフォルトのプロセスとして`bash`プロセスが実行される。

`docker run`コマンドでは、アタッチモードとデタッチモードを選択できる。

新しく起動したコンテナを停止後に自動削除する場合は、`rm`オプションを付けるようにする。

**＊例＊**

```bash
# アタッチモードによる起動。フォアグラウンドで起動する。
$ docker run -a -it --rm --name <コンテナ名> <コンテナイメージ名>:<バージョンタグ> /bin/bash

# デタッチドモードによる起動。バックグラウンドで起動する。
$ docker run -d -it --rm --name <コンテナ名> <コンテナイメージ名>:<バージョンタグ> /bin/bash
```

コンテナの起動時に、`bash`プロセスを実行すると以下のようなエラーが出ることがある。

その場合は、`shell`プロセスを実行する。

```bash
docker: Error response from daemon: OCI runtime create failed: container_linux.go:370: starting container process caused: exec: "/bin/bash": stat /bin/bash: no such file or directory: unknown.
```

アタッチモードは、フォアグラウンド起動である。

ターミナルにプロセスのログが表示されないため、同一ターミナルで他のコマンドを入力できる。

**＊例＊**

```bash
# -a：atattch mode
$ docker run -a -it --name <コンテナ名> <コンテナイメージ名>:<バージョンタグ> /bin/bash
```

デタッチドモードは、バックグラウンド起動である。

ターミナルにプロセスのログが表示され続けるため、同一ターミナルで他のコマンドを入力できない。

プロセスのログを監視できるが、他のプロセスを入力するためには、そのターミナル上でコンテナを停止させる必要がある。

**＊例＊**

```bash
# -d: detached mode
$ docker run -d -it --name <コンテナ名> <コンテナイメージ名>:<バージョンタグ> /bin/bash
```

<br>

### start

コンテナを起動する。

`start`コマンドでは、アタッチモードによる起動しかできない。

**＊例＊**

停止中コンテナをアタッチモードによって起動する。

```bash
$ docker start -i <停止中コンテナ名>
```

<br>

### trust

#### ▼ trustとは

コンテナイメージを署名する。

> - https://matsuand.github.io/docs.docker.jp.onthefly/engine/security/trust/#signing-images-with-docker-content-trust

#### ▼ inspect

署名されたコンテナイメージか否かを確認する。

> - https://websetnet.net/how-to-sign-your-docker-images-to-increase-trust/

```bash
$ docker trust inspect <コンテナイメージ名>:<バージョンタグ>

[
  {
    "Name": "<コンテナイメージ名>:<バージョンタグ>"
    "SignedTags": [
      {
        "SignedTag": "<バージョンタグ>"
        "Digest": "8be25..."
        "Signers": [
          "<署名者の名前>"
        ]
      }
    ],

    ...

  }
]
```

<br>

### stop

#### ▼ stopとは

**＊例＊**

起動中コンテナを停止する。

```bash
$ docker stop <起動中コンテナ名>
```

**＊例＊**

全てのコンテナを停止する。

```bash
$ docker stop $(docker ps --all --quiet)
```

<br>

### volume

#### ▼ create

ボリュームマウントを作成する。

`docker`コマンドではなく、`docker compose`コマンドで作成することが推奨である。

**＊例＊**

ホスト側のdockerエリアにボリュームを作成

```bash
$ docker volume create <ボリューム名>
```

#### ▼ ls

**＊例＊**

dockerエリアのVolumeの一覧を表示

```bash
$ docker volume ls
```

#### ▼ rm

**＊例＊**

dockerエリアのボリュームを削除

```bash
$ docker volume rm <ボリューム名>
```

#### ▼ inspect

**＊例＊**

dockerエリアのVolumeの詳細を表示

```bash
$ docker volume inspect <ボリューム名>

[
    {
        "CreatedAt": "2020-09-06T15:04:02Z",
        "Driver": "local",
        "Labels": {
            "com.docker.compose.project": "<プロジェクト名>",
            "com.docker.compose.version": "1.26.2",
            "com.docker.compose.volume": "foo"
        },
        "Mountpoint": "/var/lib/docker/volumes/<プロジェクト名>_foo/_data",
        "Name": "<プロジェクト名>_foo",
        "Options": null,
        "Scope": "local"
    }
]
```

```bash
# dockerエリアをボリュームマウントして起動
# マウントポイントのボリューム名を使用
$ docker run -d -it --name <コンテナ名> /bin/bash \
    --mount type=volume, src=<ホストボリューム名> volume-driver=local, dst=<コンテナ側ディレクトリ>
```

**＊実装例＊**

Dockerfileでボリュームマウントを実行する場合、コンテナ側のマウントポイントを設定する。

dockerエリアのマウントポイントは、自動的に作成される。

Docker Composeで実行することが推奨である。

```dockerfile
FROM ubuntu
RUN mkdir /myvol
RUN echo "hello world" > /myvol/greeting

# マウントポイント
VOLUME /myvol
```

<br>
