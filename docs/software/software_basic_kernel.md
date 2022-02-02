---
title: 【知見を記録するサイト】カーネル（制御プログラム）＠OS
---

# カーネル（制御プログラム）＠OS

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. カーネルとは

狭義のOSである．広義のOSは，ユーティリティや言語プロセッサも含む基本ソフトウェア全体である．

<br>

## 02 ジョブ管理

### ジョブ管理とは

カーネルはジョブ（プロセスのセット）を管理する．クライアントは，マスタスケジュールに対して，ジョブを実行するための命令を与える．

<br>

### マスタスケジュラ，ジョブスケジュラ

#### ・マスタスケジュラ，ジョブスケジュラとは

![ジョブ管理とタスク管理の概要](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ジョブ管理とタスク管理の概要.jpg)

マスタスケジュラは，ジョブスケジュラにジョブの実行を命令する．データをコンピュータに入力し，複数の処理が実行され，結果が出力されるまでの一連の処理のこと．『Task』と『Job』の定義は曖昧なので，『process』と『set of processes』を用いるべきとのこと．

参考：https://stackoverflow.com/questions/3073948/job-task-and-process-whats-the-difference/31212568

複数のジョブ（プログラムやバッチ）の起動と終了を制御したり，ジョブの実行と終了を監視報告するソフトウェア．ややこしいことに，タスクスケジューラとも呼ぶ．

#### ・Reader

ジョブ待ち行列に登録

#### ・Initiator

ジョブステップに分解

#### ・Terminator

出力待ち行列に登録

#### ・Writer

優先度順に出力の処理フローを実行

<br>

### Initiatorによるジョブのジョブステップへの分解

Initiatorによって，ジョブはジョブステップに分解される．

![ジョブからジョブステップへの分解](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ジョブからジョブステップへの分解.png)

<br>

## 03. タスク管理

### タスク管理とは

![ジョブステップからタスクの生成](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ジョブステップからタスクの生成.png)

タスクとは，スレッドに似たような，単一のプロセスのこと．Initiatorによるジョブステップから，タスク管理によって，タスクが生成される．タスクが生成されると実行可能状態になる．ディスパッチャによって実行可能状態から実行状態になる．

<br>

### 優先順方式

各タスクに優先度を設定し，優先度の高いタスクから順に，ディスパッチしていく方式．

<br>

### 到着順方式

待ち行列に登録されたタスクから順に，ディスパッチしていく方式．

![到着順方式_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/到着順方式_1.png)

**＊例＊**

以下の様に，タスクがCPUに割り当てられていく．

![到着順方式_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/到着順方式_2.png)

<br>

### ラウンドロビン方式

ラウンドロビンは，『総当たり』の意味．一定時間（タイムクウォンタム）ごとに，実行状態にあるタスクが強制的に待ち行列に登録される．交代するように，他のタスクがディスパッチされる．

![ラウンドロビン方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ラウンドロビン方式.png)

**＊例＊**

生成されたタスクの到着時刻と処理時間は以下のとおりである．強制的なディスパッチは，『20秒』ごとに起こるとする．

![優先順方式_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/優先順方式_1.png)

1. タスクAが0秒に待ち行列へ登録される．
2. 20秒間，タスクAは実行状態へ割り当てられる．
3. 20秒時点で，タスクAは実行状態から待ち行列に追加される．同時に，待ち行列の先頭にいるタスクBは，実行可能状態から実行状態にディスパッチされる．
4. 40秒時点で，タスクCは実行状態から待ち行列に追加される．同時に，待ち行列の先頭にいるタスクAは，実行可能状態から実行状態にディスパッチされる．

![優先順方式_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/優先順方式_2.png)

<br>

## 04. 入出力管理

### 入出力管理とは

アプリケーションから低速な周辺機器へデータを出力する時，まず，CPUはスプーラにデータを出力する．Spoolerは，全てのデータをまとめて出力するのではなく，一時的に補助記憶装置（Spool）にためておきながら，少しずつ出力する（Spooling）．

![スプーリング](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スプーリング.jpg)

<br>

### デバイスファイル

#### ・デバイスファイルとは

カーネルが実際の入出力装置や標準入出力を操作できるように，これらのインターフェースをファイルとして扱ったもの．```/dev```ディレクトリ下に配置されている．各ファイルには具体的な入出力装置を示す番号（メジャー番号，マイナー番号）が割り当てられている．デバイスファイルを操作すると，入出力装置や標準入出力に対してその操作が実行される．

参考：

- https://e-words.jp/w/%E3%83%87%E3%83%90%E3%82%A4%E3%82%B9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB.html
- https://qiita.com/angel_p_57/items/1faafa275525469788b4

**＊例＊**

全てのファイルシステムを確認する．

```bash
$ ls -la /dev
total 10
dr-xr-xr-x   3 root        wheel              4616 Oct 19 09:34 .
drwxr-xr-x  20 root        wheel               640 Jan  1  2020 ..

# ～ 中略 ～

dr-xr-xr-x   1 root        wheel                 0 Oct 19 09:34 fd

# ～ 中略 ～

crw-rw-rw-   1 root        wheel            3,   2 Nov 23 17:35 null

# ～ 中略 ～

lr-xr-xr-x   1 root        wheel                 0 Oct 19 09:34 stderr -> fd/2
lr-xr-xr-x   1 root        wheel                 0 Oct 19 09:34 stdin -> fd/0
lr-xr-xr-x   1 root        wheel                 0 Oct 19 09:34 stdout -> fd/1

# ～ 中略 ～

crw-rw-rw-   1 root        wheel            2,   0 Oct 19 09:34 tty

# ～ 中略 ～
```

#### ・ブロックデバイス（ブロックスペシャルファイル）

ある程度のまとまりでデータを扱う入出力装置にデータを転送するデバイスファイル．HHD（```/dev/hd```），メモリ，などがある．

参考：https://ja.wikipedia.org/wiki/%E3%83%87%E3%83%90%E3%82%A4%E3%82%B9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB

#### ・キャラクターデバイス（キャラクタースペシャルファイル）

一文字単位でデータを扱う入出力装置にデータを転送するデバイスファイル．プリンター（```/dev/lp```），モデム，ターミナル，などがある．

参考：https://ja.wikipedia.org/wiki/%E3%83%87%E3%83%90%E3%82%A4%E3%82%B9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB

#### ・擬似デバイス

デバイスファイルの中で，実際の装置に対応していないデバイスファイル．標準入出力（```/dev/stdin```，```/dev/stdout```）や破棄（```/dev/null```）などがある．

参考：https://ja.wikipedia.org/wiki/%E3%83%87%E3%83%90%E3%82%A4%E3%82%B9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB

<br>

### パーティションとボリューム

#### ・パーティションとボリュームとは

![partition_volume](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/partition_volume.png)

物理ストレージの仮想的な仕切りを『パーティション』，また仕切られたストレージ領域を『ボリューム』という．1つのストレージを複数に見せかけることができる．```/dev```ディレクトリ下に物理ストレージに紐づくデバイスファイルがあり，デバイスファイル内でパーティションが設定されている．Windowsでは，CドライブとDドライブがパーティションに相当する．

参考：

- http://www.miloweb.net/partition.html
- https://win2012r2.com/2018/05/13/post-268/

#### ・確認方法

**＊例＊**

MacOSでは，```diskutil```コマンドを実行するとパーティションを確認できる．物理ストレージに紐づく2つのデバイスファイルが表示され，```disk0```ファイル は2つ，また```disk1```ファイルは６つのパーティションで区切られていることが確認できる．

```bash
$ diskutil list

# 物理ストレージdisk0
/dev/disk0 (internal, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *500.3 GB   disk0
   1:                        EFI    EFI                        314.6 MB   disk0s1
   2:                 Apple_APFS    Container disk1            500.0 GB   disk0s2

# 物理ストレージdisk1
/dev/disk1 (synthesized):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      APFS Container Scheme -                      +500.0 GB   disk1
                                 Physical Store disk0s2
   1:                APFS Volume    Macintosh HD               22.7 GB    disk1s1
   2:              APFS Snapshot    com.apple.os.update-...    22.7 GB    disk1s1s1
   3:                APFS Volume    Macintosh HD - Data        147.0 GB   disk1s2
   4:                APFS Volume    Preboot                    396.3 MB   disk1s3
   5:                APFS Volume    Recovery                   622.1 MB   disk1s4
   6:                APFS Volume    VM                         3.2 GB     disk1s5
```

<br>

## 05. メモリ管理（記憶管理）

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_kernel_memory_management.html

<br>

## 06. その他の管理

### 通信管理

#### ・通信管理とは

デバイスドライバーとミドルウェア間で実行されるデータ通信処理を管理する．

参考：http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>

### 運用管理

#### ・運用管理とは

ミドルウェアやアプリケーションの運用処理（メトリクス収集，障害対応，記憶情報の保護）を管理する．

参考：http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>

### 障害管理

#### ・障害管理とは

ソフトウェアに障害が起こった時の障害修復を管理する．

参考：http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm
