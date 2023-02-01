---
title: 【IT技術の知見】ストレージ系＠パッケージ
description: ストレージ系＠パッケージの知見を記録しています。
---

# ストレージ系＠パッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. growpart

### growpartとは

パーティションのデバイスファイル名を指定し、パーティションのサイズを拡張する。



> ℹ️ 参考：https://blog.denet.co.jp/try-growpart/

```bash
$ growpart <パーティションのデバイスファイル名> <パーティションの番号>
```

パーティションのデバイスファイル名は、```fdisk```コマンドまたは```df```コマンドで確認できる。

パーティションのデバイスファイル名を確認するのみであれば、マウントされているパーティションしか表示しない```df```コマンドよりも、```fdisk```コマンドの方がよいかもしれない。



```bash
$ fdisk -l

ディスク /dev/vda: 20 GiB, 21474836480 バイト, 41943040 セクタ
単位: セクタ (1 * 512 = 512 バイト)
セクタサイズ (論理 / 物理): 512 バイト / 512 バイト
I/O サイズ (最小 / 推奨): 512 バイト / 512 バイト
ディスクラベルのタイプ: gpt
ディスク識別子: 301D27AA-0BF9-4B81-9B4A-3138251A4FD7

# パーティションの情報
デバイス   開始位置 最後から セクタ サイズ タイプ                          UUID
/dev/vda1      2048   206847   204800   100M Linux ファイルシステム 56713D43-4900-46EB-92D5-1D09C9449B11
/dev/vda2    206848  4401151  4194304     2G Linux スワップ         D156FFCF-97DE-45EB-A6B0-21A9B876129A
/dev/vda3   4401152 41943006 37541855  17.9G Linux ファイルシステム C7A19722-4C31-4646-8ED4-DD4D86EFBC50
```

```bash
$ df

Filesystem     Size   Used  Avail  Use%   Mounted on
/dev/xvda1       8G   1.9G    14G   12%   /           # パーティション
/dev/nvme1n1   200G   161G    40G   81%   /var/lib
```



> ℹ️ 参考：
>
> - https://qiita.com/aosho235/items/ad9a4764e77ba43c9d76#%E3%83%87%E3%82%A3%E3%82%B9%E3%82%AF%E3%83%91%E3%83%BC%E3%83%86%E3%82%A3%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E6%83%85%E5%A0%B1%E3%82%92%E8%AA%BF%E3%81%B9%E3%82%8B
> - https://atmarkit.itmedia.co.jp/ait/articles/1610/24/news017.html#sample1

**＊例＊**

先に、```lsblk```コマンドでパーティションを確認する。



```bash
$ lsblk

NAME          MAJ:MIN RM   SIZE  RO  TYPE  MOUNTPOINT
xvda          202:0    0    16G   0  disk             # ストレージ
└─xvda1       202:1    0     8G   0  part  /          # パーティション
nvme1n1       259:1    0   200G   0  disk  /var/lib   # ストレージ
```
また、```df```コマンドでパーティションを確認する。



```bash
$ df -h

Filesystem     Size   Used  Avail  Use%   Mounted on
/dev/xvda1       8G   1.9G    14G   12%   /           # パーティション
/dev/nvme1n1   200G   161G    40G   81%   /var/lib
```

パーティションのデバイスファイル名を指定し、パーティションを拡張する。

パーティションの番号は『```1```』である。



```bash
$ growpart /dev/xvda 1
```



<br>

### --dry-run

コマンドをドライランする。



```bash
$ growpart --dry-run /dev/xvda 1
```

<br>


## 02. resize2fs

### resize2fsとは

ファイルシステムを指定し、ファイルシステムのサイズを拡張する。



> ℹ️ 参考：https://atmarkit.itmedia.co.jp/flinux/rensai/linuxtips/a069expandlvm.html

```bash
# 空き領域の100%を使用して拡張する。
$ resize2fs <デバイスファイル名>
```

<br>

## 03. tree

### treeとは

ディレクトリ構造を取得する。



```bash
$ tree

.
├── foo/
│   └── foo.txt
│
├── bar/
│   └── bar.txt
│
└── baz/
    └── baz.txt
```

<br>

### -I

パターンにマッチしたファイルを除外し、それ以外のファイルの場合はディレクトリのみを取得する。```-o```オプションで作成されたファイルがある場合に役立つ。

```bash
$ tree -I tree.txt -o tree.txt
```

<br>

### -o

取得結果をファイルに出力する。



```bash
$ tree -o tree.txt
```

<br>

### -P

パターンにマッチしたファイルのみを取得し、それ以外のファイルの場合はディレクトリのみを取得する。

ディレクトリ内のファイル名にある程度の規則性がある場合、構造を把握するために役立つ。



```bash
# terraformのproviders.tfファイルのみを取得する。
$ tree -P providers.tf
```

<br>
