---
title: 【IT技術の知見】ストレージ＠ハードウェア
description: ストレージ＠ハードウェアの知見を記録しています。
---

# ストレージ＠ハードウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ストレージ (ディスク)

### ストレージ (ディスク) とは

『ディスク』ともいう。

データを永続化できる不揮発的な記憶装置のこと。

<br>

### ストレージの種類

HDDとSSDがある。

<br>

### 仮想ドライブ

ストレージ上に作成される仮想的なストレージのこと。

単に『ドライブ』ともいう。

Google Driveのストリーミング機能では、仮想ドライブをローカルマシン上に作成する。

仮想ドライブ上のファイルを変更すると、Google Driveにその状態が同期される。

> ↪️ 参考：
>
> - https://jisaku-pc.net/hddnavi/disk_drive.html
> - https://pctrouble.net/storage/disk_drive.html

<br>

## 02. ディスクドライブ

### HDD：Hard Disk Drive

#### ▼ デフラグメンテーション

断片化されたデータ領域を整理整頓する。

![p184-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p184-1.png)

![p184-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p184-2.png)

> ↪️ 参考：https://www.amazon.co.jp/dp/4297124513

#### ▼ RAID：Redundant Arrays of Inexpensive Disks

複数のHDDを仮想的に統合し、1つのHDDであるかのように見せかける。

| 種類  | 説明                                                         |
| ----- | :----------------------------------------------------------- |
| RAID0 | データを複数のHDDに振り分けて書き込む。                      |
| RAID1 | データを複数のHDDに複製して書き込む。                        |
| RAID5 | データとパリティ (誤り訂正符号) を`3`個以上のHDDに書き込む。 |

![RAIDの種類](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/RAIDの種類.png)

> ↪️ 参考：https://www.pro.logitec.co.jp/houjin/usernavigation/hddssd/20190809/

<br>

### SSD：Solid State Drive

<br>
