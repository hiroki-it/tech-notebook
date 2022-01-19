# dockerコマンド

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 手順

1. Docker Hubから，ベースとなるイメージをインストールする．
2. Dockerfileがイメージレイヤーからなるイメージをビルド．
3. コマンドによって，イメージ上にコンテナレイヤーを生成し，コンテナを構築．
4. コマンドによって，停止中コンテナを起動．
5. コマンドによって，起動中コンテナに接続．

![Dockerfileの作成からコンテナ構築までの手順](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Dockerfileの作成からコンテナ構築までの手順.png)

<br>

## 02. コマンド

### attach

#### ・オプション無し

**＊例＊**

デタッチドモードを用いて，起動中コンテナに接続する．

```bash
$ docker attach <起動中コンテナ名>
```

<br>

### build

#### ・-force-rm，--no-cache

**＊例＊**

キャッシュ無しで，指定のDockerfileを基に，イメージをビルドする．失敗した時は削除するように，```--force-rm```オプションを有効化する．

```bash
$ docker build --file Dockerfile --tag <イメージ名>:<バージョン> --force-rm=true --no-cache .
```

<br>

### commit

#### ・オプション無し

停止中コンテナからイメージを作成する．

**＊例＊**

```bash
$ docker commit <停止中コンテナ名> <コンテナID>

$ docker commit <停止中コンテナ名> <Docker Hubユーザー名>/<イメージ名>:<バージョン>
```

<br>

### container

#### ・prune

停止中コンテナのみを全て削除する．

**＊例＊**

```bash
$ docker container prune
```

<br>

### cp

#### ・オプション無し

Dockerfileの```COPY```コマンドを用いてコンテナ内に配置しているファイルに関して，変更のたびにイメージをビルドを行うことは面倒のため，ホストからコンテナにコピーし，再読み込みを行う．ただし，コンテナを再構築すると元に戻ってしまうことに注意．

**＊例＊**

```bash
# ホスト側のファイルをコンテナにコピー
$ docker cp ./docker/www/nginx.conf <コンテナID>:/etc/nginx/nginx.conf

# コンテナに接続後に，nginxの設定ファイルを再読み込み．
$ docker exec -it <コンテナ名> bin/bash # もしくはbin/sh
[root@<コンテナID>:~] $ nginx -s reload
[root@<コンテナID>:~] $ exit

# アクセスログを確認
$ docker logs <コンテナ名>
```

<br>

### create

#### ・オプション無し

**＊例＊**

コンテナレイヤーを生成し，コンテナを構築．起動はしない．

```bash
$ docker create <コンテナ名> <使用イメージ名>:<タグ>
```

<br>

### exec

#### ・-it

**＊例＊**

デタッチドモードを用いて，起動中コンテナ内でコマンドを実行する．実行するコマンドが```bash```や```bash```の場合，コンテナに接続できる．

```bash
# i：interactive，t：tty（対話モード）
$ docker exec -it <起動中コンテナ名> /bin/bash

# イメージ内に/bin/bash がない場合
$ docker exec -it <起動中コンテナ名> /bin/sh
```

#### ・attach，execの違い

まず```attach```コマンドでは，起動中コンテナに接続する．```exit```コマンドを用いて，コンテナとの接続を切断した後，コンテナが停止してしまう．

```bash
# デタッチドモードによる起動
$ docker run -d -it --name <コンテナ名> <使用イメージ名>:<タグ> /bin/bash

# デタッチドモードによって起動中コンテナに接続
$ docker attach <起動中コンテナ名>

# PID=1で，1つの/bin/bashプロセスが稼働していることを確認できる
[root@<コンテナID>:~] $ ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  16152  3872 pts/0    Ss+  18:06   0:00 /bin/bash
root        33  0.0  0.1  45696  3732 pts/1    R+   18:22   0:00 ps aux

# コンテナとの接続を切断
[root@<コンテナID>:~] $ exit

# コンテナの状態を確認
$ docker container ps -a --no-trunc # ==> コンテナのSTATUSがEXITedになっている
```

一方で```exec```コマンドでは，起動中コンテナでコマンドを実行する．実行するコマンドが```bash```や```bash```の場合，コンテナに接続できる．```exit```コマンドを用いて，コンテナとの接続を切断した後でも，コンテナが起動し続ける．

```bash
# デタッチドモードによる起動
$ docker run -d -it --name <コンテナ名> <使用イメージ名>:<タグ> /bin/bash

# 対話モードを用いて，デタッチドモードによって起動中コンテナに接続
$ docker exec -it <起動中コンテナ名> /bin/bash # もしくはbin/sh

# PID=1,17で，2つの/bin/bashプロセスが稼働していることを確認できる
[root@<コンテナID>:~] $ ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  16152  3872 pts/0    Ss+  18:06   0:00 /bin/bash
root        17  0.0  0.1  16152  4032 pts/1    Ss   18:21   0:00 /bin/bash
root        34  0.0  0.1  45696  3732 pts/1    R+   18:22   0:00 ps aux

# コンテナとの接続を切断
[root@<コンテナID>:~] $ exit

# コンテナの状態を確認
$ docker container ps -a --no-trunc # ==> コンテナのSTATUSがUPになっている
```

<br>

### search

#### ・オプション無し

**＊例＊**

レジストリ側に保管されているイメージを検索する．

```bash
$ docker search <イメージ名>
```

<br>

### images

#### ・オプション無し

**＊例＊**

ホストにインストールされたイメージを確認する．

```bash
$ docker images
```

#### ・prune

**＊例＊**

コンテナに使用されていないイメージを一括で削除

```bash
$ docker image prune
```

#### ・rmi

**＊例＊**

タグ名のないイメージのみを全て削除する．

```bash
$ docker rmi --force $(sudo docker images --filter "dangling=true" --all --quiet)
```

<br>

### inspect

#### ・オプション無し

**＊例＊**

起動中コンテナの全ての設定内容を表示する．```grep```とも組み合わせられる．

```bash
$ docker inspect <起動中コンテナ名>

$ docker inspect <起動中コンテナ名> | grep IPAddress
```

**＊例＊**

json-fileドライバーを用いている時に，ログファイルの出力先を確認する．

```bash
 $ docker inspect <起動中コンテナ名> | grep 'LogPath'
 
 "LogPath": "/var/lib/docker/containers/*****-json.log",
```

<br>

### log

#### ・--follow

標準出力（```/dev/stdout```）/標準エラー出力（```/dev/stderr```）に出力されたログを表示し続ける．ロギングドライバーが```json-file```の場合のみ有効．

```bash
$ docker logs -f <コンテナ名>
```

#### ・--tail

**＊例＊**

指定した行数だけ，ログを表示する．ロギングドライバーが```json-file```の場合のみ有効．

```bash
$ docker logs --follow=true --tail=500 <コンテナ名>
```

<br>

### network

#### ・ls

**＊例＊**

```bash
$ docker network ls

NETWORK ID          NAME                    DRIVER              SCOPE
ae25b9b7740b        bridge                  bridge              local
aeef782b227d        tech-notebook_default   bridge              local
```

#### ・prune

```bash
$ docker network prune
```

#### ・inspect

複数のコンテナが起動している時に，コンテナがいずれのネットワークを用いているかを確認する．

```bash
$ docker network inspect <ネットワーク名>
```

<br>

### ps

#### ・-a

**＊例＊**

コンテナの起動と停止にかかわらず，IDなどの一覧を表示する．

```bash
$ docker ps -a
```

<br>

### pull

**＊例＊**

レジストリ側のイメージをクライアント側にインストールする．

```bash
$ docker pull <イメージ名>:<バージョン>
```

<br>

### push

#### ・オプション無し

**＊例＊**

ホストで作成したイメージを，指定したDockerHubのユーザーにアップロードする．

```bash
$ docker push <Docker Hubユーザー名>/<イメージ名>:<バージョン>
```

**＊例＊**

ホストで作成したイメージを，指定したECRにアップロードする．ECRはタグ名がやや特殊のため，事前にタグを付け替える必要がある．

```bash
$ docker tag <ローカル上でのイメージ名>:<ローカル上でのバージョン> <リポジトリURL>/<ECR上でのイメージ名>:<ECR上でのバージョン>

$ docker push <リポジトリURL>/<ECR上でのイメージ名>:<ECR上でのバージョン>
```

<br>

### rm

#### ・--force

**＊例＊**

起動中/停止中の全てコンテナを強制的に削除する．

```bash
$ docker rm --force $(docker ps --all --quiet)
```

<br>

### run

#### ・--hostname

コンテナ内の```etc/hosts```ファイルで，コンテナのプライベートIPアドレスを確認できる．```hostname```オプションで命名していればその名前，指定していなければランダムな文字列が割り当てられる．

**＊例＊**

```bash
$ docker run -d -it --hostname <ホスト名> --name <コンテナ名> --publish=8080:80 <用いるイメージ名>:<タグ> /bin/bash
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

#### ・--publish

指定したホストポートとコンテナポートのマッピングを実行する．```--publish-all```オプションではホストポートをランダムに選んでポートマッピングを実行する．

参考：https://www.whitesourcesoftware.com/free-developer-tools/blog/docker-expose-port/

```bash
$ docker run -d -it --name <コンテナ名> --publish=8080:80 <用いるイメージ名>:<タグ> /bin/bash
```

#### ・--expose

他のコンテナに公開するコンテナポートを```expose```オプションで設定できる．これはDockerfileでEXPOSE命令として設定してもよい．なお，プロセスの受信するポートと合わせる必要がある．

参考：https://www.whitesourcesoftware.com/free-developer-tools/blog/docker-expose-port/

```bash
$ docker run -d -it --name <コンテナ名> --expose=80 <用いるイメージ名>:<タグ> /bin/bash
```

#### ・-a，-d

すでに停止中または起動中コンテナが存在していても，これとは別にコンテナを新しく構築し，起動する．さらにそのコンテナ内でコマンドを実行する．起動時に```bash```プロセスや```bash```プロセスを実行すると，コンテナに接続できる．何も渡さない場合は，デフォルトのプロセスとして```bash```プロセスが実行される．```run```コマンドでは，アタッチモードとデタッチモードを選ぶことができる．新しく起動したコンテナを停止後に自動削除する場合は，```rm```オプションを付けるようにする．

**＊例＊**

```bash
# アタッチモードによる起動．フォアグラウンドで起動する．
$ docker run -a -it --rm --name <コンテナ名> <使用イメージ名>:<タグ> /bin/bash

# デタッチドモードによる起動．バックグラウンドで起動する．
$ docker run -d -it --rm --name <コンテナ名> <使用イメージ名>:<タグ> /bin/bash
```

コンテナを起動する時に，```bash```プロセスを実行すると以下のようなエラーが出ることがある．その場合は，```bash```プロセスを実行するようにする．

```bash
docker: Error response from daemon: OCI runtime create failed: container_linux.go:370: starting container process caused: exec: "/bin/bash": stat /bin/bash: no such file or directory: unknown.
```

アタッチモードは，フォアグラウンド起動である．ターミナルにプロセスのログが表示されないため，同一ターミナルで他のコマンドを入力できる．

**＊例＊**

```bash
# -a：atattch mode
$ docker run -a -it --name <コンテナ名> <使用イメージ名>:<タグ> /bin/bash
```

デタッチドモードは，バックグラウンド起動である．ターミナルにプロセスのログが表示され続けるため，同一ターミナルで他のコマンドを入力できない．プロセスのログを監視できるが，他のプロセスを入力するためには，そのターミナル上でコンテナを停止させる必要がある．

**＊例＊**


```bash
# -d；detached mode
$ docker run -d -it --name <コンテナ名> <使用イメージ名>:<タグ> /bin/bash
```

<br>

### start

コンテナを起動する．```start```コマンドでは，アタッチモードによる起動しかできない．

**＊例＊**

停止中コンテナをアタッチモードによって起動する．

```bash
$ docker start -i <停止中コンテナ名>
```

<br>

### stop

#### ・オプション無し

**＊例＊**

起動中コンテナを停止する．

```bash
$ docker stop <起動中コンテナ名>
```

**＊例＊**

全てのコンテナを停止する．

```bash
$ docker stop $(docker ps --all --quiet)
```

<br>

### volume

#### ・create

ボリュームマウントを作成する．dockerコマンドではなく，docker-composeコマンドで作成することが推奨されている．

**＊例＊**

ホスト側のdockerエリアにボリュームを作成

```bash
$ docker volume create <ボリューム名>
```

#### ・ls

**＊例＊**

dockerエリアのVolumeの一覧を表示

```bash
$ docker volume ls
```

#### ・rm

**＊例＊**

dockerエリアのボリュームを削除

```bash
$ docker volume rm <ボリューム名>
```

#### ・inspect

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

Dockerfileでボリュームマウントを行う場合，マウント先のコンテナ側ディレクトリ名を設定する．dockerエリアのマウントポイントは，自動的に作成される．Docker Composeで行うことが推奨されている．

```dockerfile
FROM ubuntu
RUN mkdir /myvol
RUN echo "hello world" > /myvol/greeting

# マウント先のコンテナ側ディレクトリ名
VOLUME /myvol
```

