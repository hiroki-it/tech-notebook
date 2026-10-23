---
title: 【IT技術の知見】ネットワーク＠Docker
description: ネットワーク＠Dockerの知見を記録しています。
---

# ネットワーク＠Docker

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Docker ネットワーク

### bridge ネットワーク

#### ▼ bridge ネットワークとは

![docker_bridge-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/docker_bridge-network.png)

bridge ネットワークについて、以下に示す。

- コンテナイーサネット (`eth`)
- 両端にネットワークインターフェースを持つ仮想イーサネット (`veth`)
- 仮想ブリッジ (`docker0`)
- NAT ルーター (iptables)
- 両端にネットワークインターフェースを持つホストイーサネット (`eth`)

といったコンポーネントから構成される。

ホスト上に `docker0` ブリッジを作成し、`L2` (データリンク層) で複数のコンテナ間を接続する。

また、ホストの iptables が NAPT ルーターとして働き、ブリッジとホストの間を接続する。

`brctl` コマンドを使用し、`docker0` ブリッジがどの仮想インターフェースと接続されているかを確認できる。

```bash
$ brctl show docker0

bridge name     bridge id               STP enabled     interfaces
docker0         8000.02426c931c59       no              vethc06ae92
```

仮想ネットワークインターフェースの IP アドレス

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

ブリッジのサブネットマスクとゲートウェイの IP アドレスは自動で割り当てられるが、明示的に設定できる。

```bash
$ docker network create foo-network --subnet=172.18.0.0/16 --gateway=172.18.0.1
```

> - [第29回 Docker Networkingの基礎知識 標準的なネットワークを理解する：古賀政純の「攻めのITのためのDocker塾」（5/5 ページ） - ITmedia エンタープライズ](https://www.itmedia.co.jp/enterprise/articles/1609/21/news001_5.html)
> - [Dockerのブリッジネットワークについて調べました \| QUARTETCOM TECH BLOG](https://tech.quartetcom.co.jp/2022/06/29/docker-bridge-network/)
> - [Dockerのネットワーク、基礎理解は万全ですか？【Dockerコンテナ・グレートジャーニー④】 #container - Qiita](https://qiita.com/Toyo_m/items/52fa81948d5746dd2afc#docker%E3%81%AE%E3%83%8D%E3%83%83%E3%83%88%E3%83%AF%E3%83%BC%E3%82%AF%E3%81%AE%E3%83%99%E3%82%B9%E3%83%88%E3%83%97%E3%83%A9%E3%82%AF%E3%83%86%E3%82%A3%E3%82%B9)

#### ▼ 経路例

サーバーに対するリクエストがコンテナに届くまでを以下に示す。

サーバーの `8080` 番ポートと、WWW コンテナの `80` 番ポートのアプリケーションの間で、ポートフォワーディングを行う。

これにより、『`http://<サーバーのプライベートIPアドレス (localhost) >:8080`』へリクエストを送信すると、WWW コンテナのポート番号へフォワーディングされる。

<table>
  <thead>
    <tr>
      <th style="text-align:left">処理場所</th>
      <th style="text-align:left">リクエストの流れ</th>
      <th style="text-align:left">プライベート IP アドレス例</th>
      <th>ポート番号例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">コンテナ内プロセス</td>
      <td style="text-align:left">インバウンド通信を待ち受けるポート</td>
      <td style="text-align:left"></td>
      <td><code>:80</code></td>
    </tr>
    <tr>
      <td style="text-align:left"></td>
      <td style="text-align:left">⬆︎</td>
      <td style="text-align:left"></td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left">コンテナ</td>
      <td style="text-align:left">コンテナポート</td>
      <td style="text-align:left">・<code>http://127.0.0.1</code><br>・<code>http://&lt;Dockerのhostnameの設定値&gt;</code></td>
      <td><code>:80</code></td>
    </tr>
    <tr>
      <td style="text-align:left"></td>
      <td style="text-align:left">⬆︎</td>
      <td style="text-align:left"></td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left">ホスト</td>
      <td style="text-align:left">仮想ネットワーク</td>
      <td style="text-align:left"><code>http://172.*.*.*</code></td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left"></td>
      <td style="text-align:left">⬆︎</td>
      <td style="text-align:left"></td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left">ホスト</td>
      <td style="text-align:left">仮想ブリッジ</td>
      <td style="text-align:left"></td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left"></td>
      <td style="text-align:left">⬆︎</td>
      <td style="text-align:left"></td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left">ホストハードウェア</td>
      <td style="text-align:left">サーバーの NIC (イーサネットカード)</td>
      <td style="text-align:left"><code>http://127.0.0.1</code></td>
      <td><code>:8080</code></td>
    </tr>
  </tbody>
</table>

<br>

### none ネットワーク

#### ▼ none ネットワークとは

特定のコンテナを、ホストや他のコンテナとは、ネットワーク接続させない。

```bash
$ docker network list

NETWORK ID          NAME                    DRIVER              SCOPE
7edf2be856d7        none                    null                local
```

<br>

### host ネットワーク

#### ▼ host ネットワークとは

![docker_host-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/docker_host-network.png)

host ネットワークは、コンテナのネットワークインターフェース (`eth`) 、ホストのネットワークインターフェース (`eth*`) 、といったコンポーネントから構成される。

特定のコンテナとホストを直接的に接続する。

コンテナの IP アドレスは、ホストの IP アドレスになる。

```bash
$ docker network list

NETWORK ID          NAME                    DRIVER              SCOPE
ac017dda93d6        host                    host                local
```

> - [第29回 Docker Networkingの基礎知識 標準的なネットワークを理解する：古賀政純の「攻めのITのためのDocker塾」（5/5 ページ） - ITmedia エンタープライズ](https://www.itmedia.co.jp/enterprise/articles/1609/21/news001_5.html)

<br>

## 02. ホストコンテナ間の接続方法

### ホストから

#### ▼ 『ホスト』から『コンテナ (`localhost`) 』にリクエスト

あらかじめコンテナに対してポートフォワーディングを実行しておき、『ホスト』から『コンテナ』へリクエストを送信する。

ここでのコンテナ側のホスト名は、『`localhost`』となる。

ホストとコンテナ間のネットワーク接続の成否を確認できる。

**＊例＊**

『ホスト』から『コンテナ』へリクエストを送信し、ホストとアプリコンテナの間の成否を確認する。

```bash
# ホストで実行
$ curl --fail http://127.0.0.1:8080
```

<br>

### コンテナから

#### ▼ 『コンテナ』から『コンテナ』にリクエスト

『コンテナ』から『コンテナ』へリクエストを送信する。

ここでのコンテナのホスト名は、コンテナ内の『`/etc/hosts`』に定義したものとなる。

リクエストはホストを経由せず、そのままコンテナに送信される。

コンテナ間のネットワーク接続の成否を確認できる。

**＊例＊**

『アプリコンテナ』から『Web コンテナ』へリクエストを送信し、アプリコンテナと Web コンテナの間の成否を確認する。

```bash
# コンテナ内で実行
$ curl --fail http://<webコンテナに割り当てたホスト名>:80/
```

#### ▼ 『コンテナ』から『ホスト (`host.docker.internal`) 』にリクエスト

『コンテナ』から『ホスト』へリクエストを送信する。

ここでのホスト側のホスト名は、『`host.docker.internal`』になる。

リクエストは、ホストを経由して、ポートフォワーディングされたコンテナにフォワーディングされる。

ホストとコンテナ間のネットワーク接続の成否を確認できる。

**＊例＊**

```bash
# コンテナ内で実行
$ curl --fail http://host.docker.internal:8080
```

<br>
