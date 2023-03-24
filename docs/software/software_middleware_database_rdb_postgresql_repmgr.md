---
title: 【IT技術の知見】Repmgr＠PostgreSQL
description: Repmgr＠PostgreSQLの知見を記録しています。
---

# Repmgr＠PostgreSQL

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Repmgrの仕組み

### アーキテクチャ

Repmgrは、repmgr、repmgrd、といったコンポーネントから構成されている。

repmgrは、PostgreSQLのDBをクラスターのインスタンス (プライマリーインスタンス、スタンバイインスタンス) として管理できるようにする。

repmgrdは、DBインスタンス間でフェイルオーバーできるようにする。

![repmgr_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/repmgr_architecture.png)

> ↪️ 参考：https://www.2ndquadrant.com/en/resources-old/repmgr/

<br>

## 02. セットアップ

記入中...

> ↪️ 参考：https://repmgr.org/docs/current/installation-packages.html

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

> ↪️ 参考：https://repmgr.org/docs/current/repmgr-cluster-show.html

<br>
