---
title: 【IT技術の知見】Docker＠コンテナ型仮想化
description: Docker＠コンテナ型仮想化の知見を記録しています。
---

# Docker＠コンテナ型仮想化

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Dockerの仕組み

### アーキテクチャ

Docker は、ホスト OS、Docker コンテナ (ベースイメージ、コンテナイメージレイヤー、コンテナレイヤー) といったコンポーネントから構成される。

![docker_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/docker_architecture.png)

> - https://ragin.medium.com/docker-what-it-is-how-images-are-structured-docker-vs-vm-and-some-tips-part-1-d9686303590f

<br>

### Dockerコンテナ

#### ▼ Dockerコンテナとは

namespace と cgroups を使用して、ホスト OS を分割した領域である。

namespace では、カーネルを分離できるため、カーネルの要素 (プロセス、マウントポイント、ネットワーク、ファイル構造、ユーザー、グループなど) を独立させられる。

> - https://www.itbook.info/network/docker06.html
> - https://tech-lab.sios.jp/archives/18811

#### ▼ ベースイメージ

ベースイメージは、実行 OS に依存せず一貫してビルドできる。

そのため、配布できる。

各イメージレジストリ (例：DockerHub、Amazon ECR、Google Container Registry、Artifactory、Harbor など) には、カスタマイズするうえでのベースとなるベースイメージが提供されている。

#### ▼ イメージレイヤー

![イメージレイヤーからなるコンテナイメージのビルド](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/コンテナイメージのビルド.png)

イメージレイヤーの実体は、`/var/lib/docker/overlay2` ディレクトリ配下にハッシュ値の名前からなるファイルとして保管されている。

Docker は、オーバーレイファイルシステムを使用して、各ファイルを層状に管理する。

1 つの命令につき、1 つのコンテナイメージレイヤーを積み重ねるようになっている。

```bash
$ docker container inspect foo-container -f "{{json .GraphDriver.Data}}" | jq .

{
  "LowerDir": "/var/lib/docker/overlay2/*****-init/diff:/var/lib/docker/overlay2/*****/diff:/var/lib/docker/overlay2/*****/diff:/var/lib/docker/overlay2/*****/diff:/var/lib/docker/overlay2/*****/diff",
  "MergedDir": "/var/lib/docker/overlay2/*****/merged",
  "UpperDir": "/var/lib/docker/overlay2/*****/diff",
  "WorkDir": "/var/lib/docker/overlay2/*****/work"
}
```

> - https://www.creationline.com/lab/35518
> - https://tech-lab.sios.jp/archives/21103#OverlayFS

#### ▼ コンテナレイヤー

コンテナイメージからコンテナを作成するときに、コンテナイメージレイヤーのうえにコンテナレイヤーが積み重ねられる。

![コンテナイメージ上へのコンテナレイヤーの積み重ね](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/コンテナイメージ上へのコンテナレイヤーの積み重ね.png)

> - https://blog.codecamp.jp/programming-docker-image-container

<br>

### 権限別コンテナの種類

#### ▼ 特権コンテナ

root ユーザー権限の Capability (CHOWN、NET_RAW、CAP_SYS_BOOT、CAP_AUDIT_WRITE など) のすべて持つユーザーで実行したコンテナのこと。

例えば、特権コンテナの実行ユーザーは、ルートファイルシステム上の `/proc` へ書き込む権限を持つ。

/proc 配下には Node へのアクセスを中継するファイルがあるため、特権コンテナの実行ユーザーは Node 上で任意のコマンドを実行できる。

> - https://jpn.nec.com/cybersecurity/blog/210730/index.html
> - https://zenn.dev/mizuba/articles/f37889a137e28d

#### ▼ 通常コンテナ

root ユーザーで実行したコンテナのこと。

> - https://jpn.nec.com/cybersecurity/blog/210730/index.html

#### ▼ 非rootコンテナ

コンテナランタイムとコンテナ自体の両方を非 root ユーザーで実行したコンテナのこと。

これらのユーザーは、Capability を全く持たない。

> - https://jpn.nec.com/cybersecurity/blog/210730/index.html
> - https://rootlesscontaine.rs/

<br>

## 02. Dockerクライアント

### dockerクライアント

#### ▼ dockerクライアントとは

docker クライアントは、`docker` コマンドを使用して docker デーモン API をコールできる。

![docker-daemon](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/docker-client.png)

> - https://www.slideshare.net/zembutsu/docker-underlying-and-containers-lifecycle#8

<br>

### dockerデーモン

#### ▼ dockerデーモンとは

ホスト側に常駐し、コンテナの操作を担うデーモン。

docker クライアントに docker デーモン API を公開する。

クライアントが `docker` コマンドを実行することにより、docker デーモン API がコールされ、コマンドに沿ってコンテナが操作される。

![docker-daemon](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/docker-daemon.png)

<br>

## 03. cgroups

コンテナが使用できるハードウェアリソースを分離する。

> - https://www.itbook.info/network/docker06.html

<br>

## 04. namespace

### namespaceとは

各 namespace を使用して、ホストのカーネルを論理的に分離する。

論理的に分離された各領域をコンテナとして使用する。

コンテナ間では、ハードウェアリソース要求やプロセス間通信が独立している。

注意点として、Kubernetes とは namespace の種類が異なる。

> - https://gihyo.jp/admin/serial/01/linux_containers/0002#sec4
> - https://www.ianlewis.org/en/what-are-kubernetes-pods-anyway
> - https://tech-lab.sios.jp/archives/18811

<br>

### IPC namespace

SysV IPC オブジェクト、POSIX メッセージキューを分離する。

コンテナは、同じ IPC namespace に属するほかのプロセスと通信できる。

> - https://gihyo.jp/admin/serial/01/linux_containers/0002#sec4_h5

<br>

### Network namespace

ネットワークデバイス、アドレス、ポート、ルーティングテーブル、フィルタを分離する。

各コンテナが独立した、ネットワークデバイス、アドレス、ポート、ルーティングテーブル、フィルタを持てるようになる。

> - https://gihyo.jp/admin/serial/01/linux_containers/0002#sec4_h7

<br>

### Mount namespace

マウントに関する処理を分離する。

各コンテナが独立してマウントを処理できるようになる。

> - https://gihyo.jp/admin/serial/01/linux_containers/0002#sec4_h2

<br>

### PID namespace

プロセス ID を分離する。

各コンテナが独立した PID を持てるようになる。

逆に言うと、同じ PID namespace に属するプロセスの PID は同じになる。

> - https://gihyo.jp/admin/serial/01/linux_containers/0002#sec4_h5

<br>

### User namespace

ユーザーID (UID)、グループ ID (GID)を分離する。

各コンテナが独立した UID や GID を持てるようになる。

ただし、Docker では機能が制限されることを嫌って、User Namespace をデフォルトで無効化している。

そのため、コンテナとホストの UID/GID が同じになっている。

これに伴い、コンテナを root ユーザーで実行することに脆弱性がある。

> - https://gihyo.jp/admin/serial/01/linux_containers/0002#sec4_h8
> - https://docs.docker.com/engine/security/userns-remap/#user-namespace-known-limitations

<br>

### UTS namespace

ドメインを分離する。

各コンテナが独立したドメインを持てるようになる。

> - https://gihyo.jp/admin/serial/01/linux_containers/0002#sec4_h4

<br>

## 03. ロギング

### ロギングドライバー

#### ▼ ロギングドライバーとは

コンテナ内の標準出力 (`/dev/stdout`) と標準エラー出力 (`/dev/stderr`) に出力されたログを、ファイルや API に対してフォワーディングする。

```bash
$ docker run -d -it --log-driver <ロギングドライバー名> --name  <コンテナ名> <コンテナイメージ名>:<バージョンタグ> /bin/bash
```

#### ▼ json-file

標準出力/標準エラー出力に出力されたログを、`/var/lib/docker/containers/＜コンテナID＞/＜コンテナID＞-json.log` ファイルにフォワーディングする。

デフォルトの設定値である。

`labels` キーで文字列リストを設定すると、属性キーを付与できる。

```yaml
{
  "log-driver": "json-file",
  # ドライバーのオプション
  "log-opts": {
      "max-size": "10m",
      "max-file": "3",
      # JSONに付与する属性キー
      "labels": "app,env",
    },
}
```

> - https://docs.docker.com/config/containers/logging/configure/#use-environment-variables-or-labels-with-logging-drivers

#### ▼ fluentd

構造化ログに変換し、サイドカーとして稼働する Fluentd コンテナに送信する。

Amazon ECS コンテナの awsfirelens ドライバーは、fluentd ドライバーをラッピングしたものである。

```bash
 {
   "log-driver": "fluentd",
    # ドライバーのオプション
   "log-opts": {
     "fluentd-address": "<Fluentdコンテナのホスト名>:24224"
   }
 }
```

> - https://docs.docker.com/config/containers/logging/fluentd/
> - https://aws.amazon.com/jp/blogs/news/under-the-hood-firelens-for-amazon-ecs-tasks/

#### ▼ none

標準出力/標準エラー出力に出力されたログを、ファイルや API にフォワーディングしない。

ファイルに出力しないことにより、開発環境のアプリケーションサイズの肥大化を防ぐ。

#### ▼ awslogs

標準出力/標準エラー出力に出力されたログを Amazon CloudWatch-API に送信する。

```yaml
{
  "log-driver": "awslogs",
  # ドライバーのオプション
  "log-opts": {"awslogs-region": "us-east-1"},
}
```

> - https://docs.docker.com/config/containers/logging/awslogs/

#### ▼ gcplogs

標準出力/標準エラー出力に出力されたログを、Google Cloud Logging の API にフォワーディングする。

```yaml
{
  "log-driver": "gcplogs",
  # ドライバーのオプション
  "log-opts": {"gcp-meta-name": "example-instance-12345"},
}
```

> - https://docs.docker.com/config/containers/logging/gcplogs/

<br>

### 各ベンダーのコンテナイメージのログ出力先

#### ▼ コンテナの標準出力/標準エラー出力

Linux では、標準出力は『`/proc/<プロセスID>/fd/1`』、標準エラー出力は『`/proc/<プロセスID>/fd/2`』である。

コンテナでは、『`/dev/stdout`』が『`/proc/self/fd/1`』のシンボリックリンク、また『`/dev/stderr`』が『`/proc/<プロセスID>/fd/2`』のシンボリックリンクとして設定されている。

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

公式の nginx イメージは、`/dev/stdout` というシンボリックリンクを、`/var/log/nginx/access.log` ファイルに作成している。

また、`/dev/stderr` というシンボリックリンクを、`/var/log/nginx/error.log` ファイルに作成している。

これにより、これらのファイルに対するログの出力は、`/dev/stdout` と `/dev/stderr` にフォワーディングされる。

> - https://docs.docker.com/config/containers/logging/

#### ▼ php-fpmイメージ

記入中...

<br>
