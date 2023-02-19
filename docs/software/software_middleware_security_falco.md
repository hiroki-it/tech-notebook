---
title: 【IT技術の知見】Falco＠セキュリティ系ミドルウェア
description: Falco＠セキュリティ系ミドルウェアの知見を記録しています。
---

# Falco＠セキュリティ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Falcoの仕組み

### アーキテクチャ

![falco_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/falco_architecture.png)

コンテナ上のプロセスは、コンテナのカーネルに対してシステムコールを実行する。

システムコールのイベントが発生した時に、eBPFを使用して、Falcoの処理をフックする。

これにより、Falcoはシステムコールのイベントを収集し、異常なイベントを検知すれば、これを通知する。

Falco自体は、デーモンやDaemonSet配下のPodとして稼働させる。



> ↪️ 参考：
>
> - https://www.designet.co.jp/ossinfo/kubernetes/falco/
> - https://sysdig.jp/blog/sysdig-contributes-falco-kernel-ebpf-cncf-2/
> - https://gihyo.jp/admin/column/newyear/2022/cloudnative-prospect

<br>

## 02. ユースケース

### 監査ログの作成

システムコールのイベントを記載したログを作成する。



> ↪️ 参考：https://falco.org/docs/event-sources/kubernetes-audit/#kubernetes-audit-rules

**＊実行例＊**

Pod内のコンテナに接続し、コマンドを実行したとする。

すると、Falcoは以下のようなログを作成する。



```log
09:21:30.694701115: Notice Unexpected process spawned in container (command=cat /etc/hostname pid=24018 user=root k8s.ns=defalut k8s.pod=foo-pod container=foo image=foo@sha256:*****)\n,
```

> ↪️ 参考：https://qiita.com/EnKUMA/items/d03f0621a631a0a220cc#falco%E3%81%A7%E5%8F%96%E5%BE%97%E3%81%97%E3%81%9Flog%E3%81%AE%E7%A2%BA%E8%AA%8D

<br>
