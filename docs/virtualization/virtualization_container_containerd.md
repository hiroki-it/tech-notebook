---
title: 【IT技術の知見】Containerd＠仮想化
description: Containerd＠仮想化の知見を記録しています。
---

# Containerd＠仮想化

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 仕組み

> - https://atmarkit.itmedia.co.jp/ait/articles/2206/03/news010.html

<br>

## 02. 設定ファイル

Containerdはデーモンとして稼働させる必要があるため、ユニットファイルで実行を定義する。

```ini
[Unit]
Description=containerd container runtime
Documentation=https://containerd.io
After=network.target local-fs.target

[Service]
ExecStartPre=-/sbin/modprobe overlay
ExecStart=/usr/local/bin/containerd

Type=notify
Delegate=yes
KillMode=process
Restart=always
RestartSec=5
LimitNPROC=infinity
LimitCORE=infinity
LimitNOFILE=infinity
TasksMax=infinity
OOMScoreAdjust=-999

[Install]
WantedBy=multi-user.target
```

> - https://github.com/containerd/containerd/blob/main/containerd.service

<br>

## 03. コマンド

> - https://intl.cloud.tencent.com/jp/document/product/457/31088

<br>

## 04. ログ

### 形式

Containerdは、テキスト形式ログを作成する。

ログメッセージの箇所が文字列またはJSONの場合がある。

<br>

### ログメッセージの構造

#### ▼ 文字列

ログメッセージの箇所が文字列の場合は、以下の通りである。

```log
2021-12-17T08:03:23.918838346+09:00 stderr F 2021/12/17 08:03:23 [INFO] start worker processes
```

#### ▼ JSON

ログメッセージの箇所がJSONの場合は、以下の通りである。

```bash
# わかりやすいように改行している。
2023-03-16T19:48:25.824524924+09:00 stderr F {
  "addr": "*.*.*.*:9000",
  "caller": "cluster.go:461",
  "component": "cluster",
  "err": "This is ERROR",
  "level": "error",
  "msg": "refresh",
  "result": "failure",
  "ts": "2023-03-16T10:48:25.824Z"
}
```

> - https://sotoiwa.hatenablog.com/entry/2021/09/14/081727

<br>

### Dockerのログとの比較

Dockerは、JSON形式をログを作成する。

```yaml
{
　"log":"2021/12/17 08:03:23 [INFO] start worker processes",
　"stream":"stdout",
　"time":"2021-12-16T23:32:06.226055453Z"
}
```

> - https://smallit.co.jp/blog/958/

<br>
