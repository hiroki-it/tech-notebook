---
title: 【IT技術の知見】ストレージ＠ハードウェア
description: ストレージ＠ハードウェアの知見を記録しています。
---

# ストレージ＠ハードウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. ストレージ (ディスク)

### ストレージ (ディスク) とは

『ディスク』ともいう。

データを永続化できる不揮発的な記憶装置のこと。

<br>

### ストレージの種類

HDD と SSD がある。

<br>

### 仮想ドライブ

ストレージ上に作成される仮想的なストレージのこと。

単に『ドライブ』ともいう。

Google Drive のストリーミング機能では、仮想ドライブをローカルマシン上に作成する。

仮想ドライブ上のファイルを変更すると、Google Drive にその状態が同期される。

> - [ドライブとディスクの違いって？同じじゃないの？ \| パソコントラブル 原因＆解決](https://jisaku-pc.net/hddnavi/disk_drive.html)
> - [「ディスク」と「ドライブ」の違い - PCと解](https://pctrouble.net/storage/disk_drive.html)

<br>

## 02. ディスクドライブ

### HDD：Hard Disk Drive

#### ▼ デフラグメンテーション

断片化されたデータ領域を整理整頓する。

![p184-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p184-1.png)

![p184-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p184-2.png)

> - https://www.amazon.co.jp/dp/4297124513

#### ▼ RAID：Redundant Arrays of Inexpensive Disks

複数の HDD を仮想的に統合し、1 つの HDD であるかのように見せかける。

<table>
  <thead>
    <tr>
      <th>種類</th>
      <th style="text-align:left">説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>RAID0</td>
      <td style="text-align:left">データを複数の HDD に振り分けて書き込む。</td>
    </tr>
    <tr>
      <td>RAID1</td>
      <td style="text-align:left">データを複数の HDD にコピーして書き込む。</td>
    </tr>
    <tr>
      <td>RAID5</td>
      <td style="text-align:left">データとパリティ (誤り訂正符号) を <code>3</code> 個以上の HDD に書き込む。</td>
    </tr>
  </tbody>
</table>

![RAIDの種類](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/RAIDの種類.png)

> - https://www.pro.logitec.co.jp/houjin/usernavigation/hddssd/20190809/

<br>

### SSD：Solid State Drive

<br>
