---
title: 【IT技術の知見】ネットワーク＠Docker
description: ネットワーク＠Dockerの知見を記録しています。
---

# ネットワーク＠Docker

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Dockerネットワーク

### bridgeネットワーク

#### ▼ bridgeネットワークとは

![docker_bridge-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/docker_bridge-network.png)

bridgeネットワークは、

- コンテナイーサネット (`eth`)
- 両端にネットワークインターフェースを持つ仮想イーサネット (`veth`)
- 仮想ブリッジ (`docker0`)
- NATルーター (iptables)
- 両端にネットワークインターフェースを持つホストイーサネット (`eth`)

といったコンポーネントから構成される。

ホスト上に `docker0` ブリッジを作成し、`L2` (データリンク層) で複数のコンテナ間を接続する。

また、ホストのiptablesがNAPTルーターとして働き、ブリッジとホストの間を接続する。

`brctl` コマンドを使用し、`docker0` ブリッジがどの仮想インターフェースと接続されているかを確認できる。

```bash
$ brctl show docker0

bridge name     bridge id               STP enabled     interfaces
docker0         8000.02426c931c59       no              vethc06ae92
```

仮想ネットワークインターフェースのIPアドレス

```bash
docker network inspect foo-network

[
    {
        "Name": "foo-network",
        "Id": "*****",
        "Created": "2025-02-01T09:10:16.535005673Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    # docker0ブリッジのサブネットマスク
                    "Subnet": "172.18.0.0/16",
                    # docker0ブリッジのゲートウェイのIPアドレス
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {},
        "Options": {},
        "Labels": {}
    }
]
```

ブリッジのサブネットマスクとゲートウェイのIPアドレスは自動で割り当てられるが、明示的に設定することもできる。

```bash
$ docker network create foo-network --subnet=172.18.0.0/16 --gateway=172.18.0.1
```

> - https://www.itmedia.co.jp/enterprise/articles/1609/21/news001_5.html
> - https://tech.quartetcom.co.jp/2022/06/29/docker-bridge-network/
> - https://qiita.com/Toyo_m/items/52fa81948d5746dd2afc#docker%E3%81%AE%E3%83%8D%E3%83%83%E3%83%88%E3%83%AF%E3%83%BC%E3%82%AF%E3%81%AE%E3%83%99%E3%82%B9%E3%83%88%E3%83%97%E3%83%A9%E3%82%AF%E3%83%86%E3%82%A3%E3%82%B9

#### ▼ 経路例

サーバーに対するリクエストがコンテナに届くまでを以下に示す。サーバーの `8080` 番ポートと、WWWコンテナの `80` 番ポートのアプリケーションの間で、ポートフォワーディングを行う。これにより、『`http://<サーバーのプライベートIPアドレス (localhost) >:8080`』にリクエストを送信すると、WWWコンテナのポート番号にフォワーディングされるようになる。

| 処理場所           | リクエストの流れ                   | プライベートIPアドレス例                                      | ポート番号例 |
| :----------------- | :--------------------------------- | :------------------------------------------------------------ | ------------ |
| コンテナ内プロセス | インバウンド通信を待ち受けるポート |                                                               | `:80`        |
|                    | ⬆︎                                |                                                               |              |
| コンテナ           | コンテナポート                     | ・`http://127.0.0.1`<br>・`http://<Dockerのhostnameの設定値>` | `:80`        |
|                    | ⬆︎                                |                                                               |              |
| ホスト             | 仮想ネットワーク                   | `http://172.*.*.*`                                            |              |
|                    | ⬆︎                                |                                                               |              |
| ホスト             | 仮想ブリッジ                       |                                                               |              |
|                    | ⬆︎                                |                                                               |              |
| ホストハードウェア | サーバーのNIC (イーサネットカード) | `http://127.0.0.1`                                            | `:8080`      |

<br>

### noneネットワーク

#### ▼ noneネットワークとは

特定のコンテナを、ホストや他のコンテナとは、ネットワーク接続させない。

```bash
$ docker network list

NETWORK ID          NAME                    DRIVER              SCOPE
7edf2be856d7        none                    null                local
```

<br>

### hostネットワーク

#### ▼ hostネットワークとは

![docker_host-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/docker_host-network.png)

hostネットワークは、コンテナのネットワークインターフェース (`eth`) 、ホストのネットワークインターフェース (`eth*`) 、といったコンポーネントから構成される。

特定のコンテナとホストを直接的に接続する。

コンテナのIPアドレスは、ホストのIPアドレスになる。

```bash
$ docker network list

NETWORK ID          NAME                    DRIVER              SCOPE
ac017dda93d6        host                    host                local
```

> - https://www.itmedia.co.jp/enterprise/articles/1609/21/news001_5.html

<br>

## 02. ホストコンテナ間の接続方法

### ホストから

#### ▼ 『ホスト』から『コンテナ (`localhost`) 』にリクエスト

あらかじめコンテナに対してポートフォワーディングを実行しておき、『ホスト』から『コンテナ』に対して、リクエストを送信する。

ここでのコンテナ側のホスト名は、『`localhost`』となる。

ホストとコンテナの間のネットワーク接続の成否を確認できる。

**＊例＊**

『ホスト』から『コンテナ』に対してリクエストを送信し、ホストとアプリコンテナの間の成否を確認する。

```bash
# ホストで実行
$ curl --fail http://127.0.0.1:8080
```

<br>

### コンテナから

#### ▼ 『コンテナ』から『コンテナ』にリクエスト

『コンテナ』から『コンテナ』に対して、リクエストを送信する。

ここでのコンテナのホスト名は、コンテナ内の『`/etc/hosts`』に定義したものとなる。

リクエストはホストを経由せず、そのままコンテナに送信される。

コンテナ間のネットワーク接続の成否を確認できる。

**＊例＊**

『アプリコンテナ』から『Webコンテナ』に対して、リクエストを送信し、アプリコンテナとWebコンテナの間の成否を確認する。

```bash
# コンテナ内で実行
$ curl --fail http://<webコンテナに割り当てたホスト名>:80/
```

#### ▼ 『コンテナ』から『ホスト (`host.docker.internal`) 』にリクエスト

『コンテナ』から『ホスト』に対して、リクエストを送信する。

ここでのホスト側のホスト名は、『`host.docker.internal`』になる。

リクエストは、ホストを経由して、ポートフォワーディングされたコンテナにフォワーディングされる。

ホストとコンテナの間のネットワーク接続の成否を確認できる。

**＊例＊**

```bash
# コンテナ内で実行
$ curl --fail http://host.docker.internal:8080
```

<br>
