---
title: 【IT技術の知見】組み込み機器
description: 組み込み機器の知見を記録しています。
tags:
  - "ハードウェア"
---

# 組み込み機器

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 組み込み機器

### 組み込みシステムとは

組み込み機器 (限定的な用途向けに特定の能力を果たすことを目的とした機器) を制御するシステムのこと。

※パソコンは、汎用機器 (汎用的な用途向けに多様な機能を果たすことを目的とした機器) に分類される。

![embedded-system](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/embedded-system.png)

<br>

### マイクロコンピュータとは

CPU として、『マイクロプロセッサ』を使用したコンピュータのこと。

![microcomputer](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microcomputer.png)

<br>

### センサによるアナログ情報の入力

外部のアナログ情報を計測し、マイコンにフォワーディングする。

- 温度センサ
- 加速度センサ
- 照度センサ

![p119-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p119-2.png)

> - https://www.amazon.co.jp/dp/4297124513

<br>

### A/D 変換器によるアナログ情報からデジタル情報への変換

A/D 変換器は、連続的に変化するアナログ信号を一定の間隔で区切り、段階的な値を持つデジタル信号に変換する。

![ad-conversion](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ad-conversion.png)

<br>

### D/A 変換器によるデジタル情報からアナログ情報への変換

D/A 変換器は、段階的な値を持つデジタル信号をなめらかにつなぎ、連続的に変化するアナログ信号に戻す。

![da-conversion](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/da-conversion.png)

<br>

### Actuator

入力されたエネルギーもしくはコンピュータが出力した電気信号を物理的運動に変換する装置のこと。

![p119-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p119-3.png)

> - https://www.amazon.co.jp/dp/4297124513

<br>

### 組み込みシステムの制御方式の種類

#### ▼ シーケンス制御

決められた順序や条件に従って、制御の各段階を進めていく制御方式。

洗濯機

![p120-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p120-1.png)

> - https://www.amazon.co.jp/dp/4297124513

#### ▼ フィードバック制御

そのときの状況を定期的に計測し、目標値との差分を基に、出力を調節する制御方式。

エアコン

![p120-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p120-2.png)

> - https://www.amazon.co.jp/dp/4297124513

<br>

## 02. 入出力機器

### キーボードからポインティングデバイス

#### ▼ ジョイスティック

<br>

### 読み取り機器

#### ▼ イメージスキャナ

#### ▼ Optical Character Reader

紙上の文字を文字列として読み取る機器。

#### ▼ Optical Mark Reader

マークシートの塗り潰し位置を読み取る機器。

![orm](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/orm.png)

#### ▼ キャプチャカード

#### ▼ デジタルカメラ

<br>

### ディスプレイ

#### ▼ CRT ディスプレイ

#### ▼ 液晶ディスプレイ

電圧の有無によって液晶分子を制御。

外部からの光によって画面を表示させる。

![liquid-crystal-molecule](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/liquid-crystal-molecule.png)

![lcd](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/lcd.jpg)

#### ▼ 有機 EL ディスプレイ

有機化合物に電圧を加えることによって発光させ、画面を表示させる。

![oled-display](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oled-display.jpg)

#### ▼ プラズマディスプレイ

![plasma-display](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/plasma-display.gif)

`2` 枚のガラスの間に、封入された希ガスに電圧をかけると放電し、紫外線が出る。

そして、この紫外線が蛍光体を発光させることによって画面を表示する。

液晶ディスプレイとのシェア差が大きくなり、2014 年に世界的に生産が終了された。

![plasma-display_panasonic](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/plasma-display_panasonic.jpg)

#### ▼ LED ディスプレイ

![led-display](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/led-display.jpg)

2018 年 1 月に開催された『CES 2018』でサムスンが発表した“マイクロ LED テレビ”『The Wall』は、従来の『液晶』や『有機 EL』とは異なる新たな表示方式を採用したテレビとして、大きな話題となった。

<br>

### プリンタ

#### ▼ ドットインパクトプリンタ

ドット単位でピンが飛び出す印字ヘッドでインクリボンを用紙に叩きつけ、インクを転写して印字するプリンタ。

![printer_dot-impact](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/printer_dot-impact.jpg)

![printer_dot-impact_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/printer_dot-impact_architecture.jpg)

#### ▼ インクジェットプリンタ

印字ヘッドのノズルから各色のインクを用紙に吐出して印字するプリンタ。

![printer_inkjet](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/printer_inkjet.jpg)

![printer_inkjet_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/printer_inkjet_architecture.jpg)

#### ▼ レーザプリンタ

感光ドラムにレーザを照射してトナーを引き寄せ、そのトナーを用紙に転写して印字するプリンタ。

![printer_laser](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/printer_laser.jpg)

![printer_laser_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/printer_laser_architecture.jpg)

#### ▼ プリンタの解像度

`1` インチ当たりのドット数 (dpi) によって、解像度が異なる。

復習ではあるが、PC 上では、ドット数がどのくらいのビット数を持つかで、解像度が変わる。

![dpi](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dpi.jpg)

dpi が大きくなるにつれて、解像度は大きくなる。

![dpi_comparison](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dpi_comparison.jpg)

#### ▼ プリンタの印字速度

ドットインパクトプリンタの印字速度は `1` 秒当たりの印字文字数を表す CPS で、レーザプリンタの印字速度は `1` 分当たりの印字ページ数を表す PPM で表す。

![cps_ppm](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cps_ppm.jpg)

<br>

## 02-02. 入出力インターフェイス

### Serial interface vs. Parallel interface

シリアルインターフェイスは、情報を `1`bit ずつフォワーディングする方式。

パラレルインターフェイスは、複数の bit の情報を同時にフォワーディングする方式。

パラレルインターフェイスは、同時にパケットを送受信しなければならない。

配線の形状や長さによって、信号のフォワーディング時間は異なる。

動作クロックが速ければ速いほど、配線間の同時フォワーディングに誤差が生じてしまうため、現代の高スペックパソコンには向いていない。

![parallel-interface_wiring-length](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/parallel-interface_wiring-length.png)

![serial_parallel](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/serial_parallel.jpg)

<br>

### Serial interface を使用している例

#### ▼ USB (Universal Serial Bus)

USB のコネクタには、A コネクタ、B コネクタ、C コネクタ、マイクロ B コネクタ、ミニ USB コネクタなどの形状の種類がある。

![interface_usb](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/interface_usb.png)

#### ▼ IEEE1394

ビデオカメラとの接続に使用されるインターフェイス

![interface_ieee](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/interface_ieee.jpg)

<br>

### Parallel interface を使用している例

#### ▼ IDE (Integrated Drive Electronics)

ストレージとの接続に使用されるインターフェイス。

![interface_ide](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/interface_ide.jpg)

#### ▼ SCSI (Small Computer System Interface)

ストレージ、CD-ROM、イメージスキャナなど、さまざまな周辺機器をデイジーチェーンするために使用するインターフェイス。

![interface_scsi](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/interface_scsi.jpg)

<br>

### 無線インターフェイス

#### ▼ IrDA (infrared Data Association)

赤外線を使用して、無線通信するためのインターフェイス。

![interface_irda](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/interface_irda.jpg)

#### ▼ Bluetooth

`2.4`GHz の電波を使用して無線通信するためのインターフェイス。

<br>
