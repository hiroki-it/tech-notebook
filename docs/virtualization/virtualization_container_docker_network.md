---
title: 【IT技術の知見】ネットワーク＠Docker
description: ネットワーク＠Dockerの知見を記録しています。
---

# ネットワーク＠Docker

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. Dockerネットワーク

### bridgeネットワーク

#### ▼ bridgeネットワークとは

bridgeネットワークは、コンテナのネットワークインターフェース（```eth```）、ホストの仮想ネットワークインターフェース（```veth```）、ホストのブリッジ（```docker0```）、ホストのネットワークインターフェース（```eth*```）、から構成される。ホスト上にブリッジを作成し、```L2```（データリンク層）で複数のコンテナ間を接続する。また、ホストのiptablesがNAPTルーターとして働き、ブリッジとホストの間を接続する。

> ℹ️ 参考：https://www.itmedia.co.jp/enterprise/articles/1609/21/news001_5.html


```brctl```コマンドを使用し、```docker0```ブリッジがどの仮想インターフェースと接続されているかを確認できる。

```bash
$ brctl show docker0

bridge name     bridge id               STP enabled     interfaces
docker0         8000.02426c931c59       no              vethc06ae92
```

![docker_bridge-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker_bridge-network.png)

#### ▼ 経路例

サーバーに対するリクエストがコンテナに届くまでを以下に示す。サーバーの```8080```番ポートと、WWWコンテナの```80```番ポートのアプリケーションの間で、ポートフォワーディングを行う。これにより、『```http://<サーバーのプライベートIPアドレス（localhost）>:8080```』にリクエストを送信すると、WWWコンテナのポート番号に転送されるようになる。

| 処理場所   | リクエストの流れ             | プライベートIPアドレス例                                                    | ポート番号例   |
|:-----------|:----------------------|:------------------------------------------------------------------|-------------|
| コンテナ内プロセス | インバウンド通信を待ち受けるポート |                                                                   | ```:80```   |
|            | ↑                     |                                                                   |             |
| コンテナ       | コンテナポート               | ・```http://127.0.0.1```<br>・```http://<Dockerのhostnameの設定値>``` | ```:80```   |
|            | ↑                     |                                                                   |             |
| ホスト        | 仮想ネットワーク            | ```http://172.*.*.*```                                            |             |
|            | ↑                     |                                                                   |             |
| ホスト        | 仮想ブリッジ              |                                                                   |             |
|            | ↑                     |                                                                   |             |
| ホストハードウェア  | サーバーのNIC（Ethernetカード） | ```http://127.0.0.1```                                            | ```:8080``` |

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

![docker_host-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker_host-network.png)

hostネットワークは、コンテナのネットワークインターフェース（```eth```）、ホストのネットワークインターフェース（```eth*```）、から構成される。特定のコンテナとホストを直接的に接続する。コンテナのIPアドレスは、ホストのIPアドレスになる。

> ℹ️ 参考：https://www.itmedia.co.jp/enterprise/articles/1609/21/news001_5.html

```bash
$ docker network list

NETWORK ID          NAME                    DRIVER              SCOPE
ac017dda93d6        host                    host                local
```


<br>

## 02. ホストコンテナ間の接続方法

### ホストから

#### ▼ 『ホスト』から『コンテナ（```localhost```）』にリクエスト

あらかじめコンテナに対してポートフォワーディングを実行しておき、『ホスト』から『コンテナ』に対して、インバウンド通信を送信する。ここでのコンテナ側のホスト名は、『```localhost```』となる。ホストとコンテナの間のネットワーク接続の成否を確認できる。

**＊例＊**

『ホスト』から『コンテナ』に対してアウトバウンド通信を送信し、ホストと```app```コンテナの間の成否を確認する。

```bash
# ホストで実行
$ curl --fail http://127.0.0.1:8080
```

<br>

### コンテナから

#### ▼ 『コンテナ』から『コンテナ』にリクエスト

『コンテナ』から『コンテナ』に対して、アウトバウンド通信を送信する。ここでのコンテナのホスト名は、コンテナ内の『```/etc/hosts```』に定義されたものとなる。リクエストはホストを経由せず、そのままコンテナに送信される。コンテナ間のネットワーク接続の成否を確認できる。コンテナのホスト名の定義方法については、以下のリンクを参考にせよ。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_docker_compose_yml.html

**＊例＊**

『```app```コンテナ』から『```web```コンテナ』に対して、アウトバウンド通信を送信し、```app```コンテナと```web```コンテナの間の成否を確認する。

```bash
# コンテナ内で実行
$ curl --fail http://<webコンテナに割り当てたホスト名>:80/
```

#### ▼ 『コンテナ』から『ホスト（```host.docker.internal```）』にリクエスト

『コンテナ』から『ホスト』に対して、アウトバウンド通信を送信する。ここでのホスト側のホスト名は、『```host.docker.internal```』になる。リクエストは、ホストを経由して、ポートフォワーディングされたコンテナに転送される。ホストとコンテナの間のネットワーク接続の成否を確認できる。

**＊例＊**

```bash
# コンテナ内で実行
$ curl --fail http://host.docker.internal:8080
```

<br>
