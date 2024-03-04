---
title: 【IT技術の知見】Repmgr＠PostgreSQL
description: Repmgr＠PostgreSQLの知見を記録しています。
---

# Repmgr＠PostgreSQL

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Repmgrの仕組み

### アーキテクチャ

Repmgrは、repmgr、repmgrd、といったコンポーネントから構成されている。

OSSのPostgreSQLでは使用できず、Enterprised PostgreSQLを使用している必要がある。

<br>

### repmgr

repmgrは、PostgreSQLのDBをクラスタリングし、クラスターのインスタンス (プライマリーインスタンス、スタンバイインスタンス) として管理できるようにする。

![repmgr_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/repmgr_architecture.png)

> - https://www.2ndquadrant.com/en/resources-old/repmgr/

<br>

### repmgrd

repmgrdは、DBインスタンス間でフェイルオーバーできるようにする。

プライマリインスタンスで障害が起こった場合、フェイルオーバーを実行し、スタンバイインスタンスをプライマリインスタンスに昇格させる。

![repmgrd_fail-over](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/repmgrd_fail-over.png)

> - https://radondb.com/posts/211201_%E5%B7%A5%E5%85%B7_-pg-%E9%9B%86%E7%BE%A4%E5%A4%8D%E5%88%B6%E7%AE%A1%E7%90%86%E5%B7%A5%E5%85%B7-repmgr/

<br>

## 02. セットアップ

記入中...

> - https://repmgr.org/docs/current/installation-packages.html

<br>

## 03. `repmgr`コマンド

### cluster

#### ▼ show

DBインスタンスの情報 (例：プライマリーインスタンス、スタンバイインスタンス) を確認する。

```bash
$ repmgr cluster show

ID | Name  | Role    | Status    | Upstream | Location | Priority | Timeline | Connection string
---+-------+---------+-----------+----------+----------+----------+----------+-----------------------------------------
1  | node1 | primary | * running |          | default  | 100      | 1        | host=db_node1 dbname=repmgr user=repmgr
2  | node2 | standby |   running | node1    | default  | 100      | 1        | host=db_node2 dbname=repmgr user=repmgr
3  | node3 | standby |   running | node1    | default  | 100      | 1        | host=db_node3 dbname=repmgr user=repmgr
4  | node4 | standby |   running | node1    | default  | 100      | 1        | host=db_node4 dbname=repmgr user=repmgr
5  | node5 | witness | * running | node1    | default  | 0        | n/a      | host=db_node5 dbname=repmgr user=repmgr
```

> - https://repmgr.org/docs/current/repmgr-cluster-show.html

<br>
