---
title: 【IT技術の知見】カーネル（制御プログラム）＠基本ソフトウェア
description: カーネル（制御プログラム）＠基本ソフトウェアの知見を記録しています。
---

# カーネル（制御プログラム）＠基本ソフトウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. カーネルとは

狭義のOSである。広義のOSは、ユーティリティや言語プロセッサーも含む基本ソフトウェア全体である。

<br>

## 02. メモリ管理（記憶管理）

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_kernel_memory_management.html

<br>

## 03. 入出力管理

### 入出力管理とは

アプリケーションから低速な周辺機器へデータを出力する時、まず、CPUはスプーラにデータを出力する。Spoolerは、全てのデータをまとめて出力するのではなく、一時的にストレージ（Spool）にためておきながら、少しずつ出力する（Spooling）。

![スプーリング](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スプーリング.jpg)

<br>

### パーティション、物理ボリューム

#### ▼ パーティション、物理ボリュームとは

![partition_volume](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/partition_volume.png)

ディスク上の仮想的な仕切りを『パーティション』、また仕切られた領域を『物理ボリューム』という。1つの領域を複数に見せかけられる。```/dev```ディレクトリ配下にディスクに紐づくデバイスファイルがあり、デバイスファイル内でパーティションが設定されている。

> ℹ️ 参考：
>
> - https://win2012r2.com/2018/05/13/post-268/
> - http://www.miloweb.net/partition.html

#### ▼ パーティションの確認方法

**＊例＊**

Linuxでは、パーティションは```df```コマンドで確認できる。

> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/1610/24/news017.html#sample1

```bash
$ df

Filesystem     Size   Used  Avail  Use%   Mounted on
/dev/xvda1       8G   1.9G    14G   12%   /           # パーティションに紐づくデバイスファイル
/dev/nvme1n1   200G   161G    40G   81%   /var/lib
```

**＊例＊**

Windowsでは、CドライブとDドライブがパーティションに相当する。

> ℹ️ 参考：http://www.miloweb.net/partition.html

**＊例＊**

MacOSでは、```diskutil```コマンドを実行するとパーティションを確認できる。ディスクに紐づく```2```個のデバイスファイルが表示され、```disk0```ファイル は2つ、また```disk1```ファイルは6つのパーティションで区切られていることが確認できる。

```bash
$ diskutil list

# ディスク：disk0
/dev/disk0 (internal, physical):
   #:                       TYPE    NAME                       SIZE       IDENTIFIER
   0:      GUID_partition_scheme                               *500.3 GB  disk0
   1:                        EFI    EFI                        314.6 MB   disk0s1
   2:                 Apple_APFS    Container disk1            500.0 GB   disk0s2

# ディスク：disk1
/dev/disk1 (synthesized):
   #:                       TYPE    NAME                       SIZE       IDENTIFIER
   0:      APFS Container Scheme    -                          +500.0 GB  disk1
          Physical Store disk0s2
   1:                APFS Volume    Macintosh HD               22.7 GB    disk1s1
   2:              APFS Snapshot    com.apple.os.update-...    22.7 GB    disk1s1s1
   3:                APFS Volume    Macintosh HD - Data        147.0 GB   disk1s2
   4:                APFS Volume    Preboot                    396.3 MB   disk1s3
   5:                APFS Volume    Recovery                   622.1 MB   disk1s4
   6:                APFS Volume    VM                         3.2 GB     disk1s5
```

<br>

### 論理ボリューム

![logical-volume](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/logical-volume.png)

異なる物理ボリュームにまたがる領域を組み合わせ、一つの仮想的なボリュームとした扱ったもの。

> ℹ️ 参考：https://xtech.nikkei.com/it/article/Keyword/20071012/284413/

**＊例＊**

Linuxでは論理ボリュームは、```lvdisplay```コマンドで確認できる。

> ℹ️ 参考：https://atmarkit.itmedia.co.jp/flinux/rensai/linuxtips/a065lvminfo.html

```bash
$ lvdisplay

  --- Logical volume ---
  LV Name               /dev/VolGroup00/LogVol00
  VG Name               VolGroup00
  LV UUID               m2sx31-yglu-wjsG-yqq0-WPPn-3grk-n2LJBD
  LV Write Access       read/write
  LV Status             available
  # open                1
  LV Size               230.81 GB
  Current LE            7386
  Segments              1
  Allocation            inherit
  Read ahead sectors    0
  Block device          253:0

  --- Logical volume ---
  LV Name               /dev/VolGroup00/LogVol01
  VG Name               VolGroup00
  LV UUID               VR4EHJ-mpxW-uadd-CpTX-lEyz-2OEU-0TyYDn
  LV Write Access       read/write
  LV Status             available
  # open                1
  LV Size               1.94 GB
  Current LE            62
  Segments              1
  Allocation            inherit
  Read ahead sectors    0
  Block device          253:1
```

<br>

### デバイスファイル

#### ▼ デバイスファイルとは

カーネルが入出力装置や標準入出力を操作できるように、これらのインターフェースをファイルとして扱ったもの。```/dev```ディレクトリ配下に配置されている。各ファイルには具体的な入出力装置を示す番号（メジャー番号、マイナー番号）が割り当てられている。デバイスファイルを操作すると、入出力装置や標準入出力に対してその操作が実行される。

> ℹ️ 参考：
>
> - https://e-words.jp/w/%E3%83%87%E3%83%90%E3%82%A4%E3%82%B9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB.html
> - https://qiita.com/angel_p_57/items/1faafa275525469788b4

#### ▼ デバイスファイルの確認方法

**＊例＊**

Linuxのデバイスファイルは```/dev```ディレクトリ配下にある。Dockerのデバイスファイルを確認すると、以下のデバイスファイルがある。

> ℹ️ 参考：https://zenn.dev/ysuito/articles/5abf6e3e6a8c13

```bash
$ ls -l /dev

crw-------  acpi_thermal_rel      # cpu温度
crw-r--r--  autofs                # 自動マウント、USBメモリ等
drwxr-xr-x  block                 # ブロックデバイス
drwxr-xr-x  bsg                   # SCSI ドライバー
crw-------  btrfs-control         # BTRFSファイルシステム
drwxr-xr-x  bus                   # USB デバイス フルアクセス
lrwxrwxrwx  cdrom -> sr0          # CDROM
drwxr-xr-x  char                  # Linux キャラクターデバイス
crw-------  console               # システムコンソール
lrwxrwxrwx  core -> /proc/kcore   # 仮想メモリファイル
drwxr-xr-x  cpu                   # cpu
crw-------  cpu_dma_latency       # cpu cステート制御
crw-------  cuse                  # ユーザスペース内でのキャラクターデバイス
drwxr-xr-x  disk                  # ディスクデバイス
brw-rw----  dm-0                  # LVM
drwxr-xr-x  dma_heap              # DMAアクセスバッファの共有
drwxr-xr-x  dri                   # GPUドライバ
crw-------  drm_dp_aux0           # ディスプレイ
crw-------  drm_dp_aux1           # ディスプレイ
crw-rw----  fb0                   # フレームバッファ
lrwxrwxrwx  fd -> /proc/self/fd   # ファイルディスクリプタ
crw-rw-rw-  full                  # full状態のデバイス(書き込みエラー)
crw-rw-rw-  fuse                  # FUSE（Filesytem in userspace）
crw-------  hidraw0               # USB、Bluetooth
crw-------  hidraw1               # USB、Bluetooth
crw-------  hpet                  # 割り込み
drwxr-xr-x  hugepages             # メモリー・ページの拡大
crw-------  hwrng                 # 乱数発生機
drwxr-xr-x  input                 # インプットデバイス（マウス、キーボード）
crw-r--r--  kmsg                  # カーネルログ
crw-rw-rw-  kvm                   # 仮想化のkvm
lrwxrwxrwx  log -> /run/systemd/journal/dev-log   # システムログ
crw-rw----  loop-control          # ループデバイス
drwxr-xr-x  mapper                # ディスクのマッピング
crw-------  mei0                  # インテルチップセット
crw-r-----  mem                   # メモリ
drwxrwxrwt  mqueue                # POSIX メッセージキュー
crw-------  mtd0                  # フラッシュデバイス
crw-------  mtd0ro                # フラッシュデバイス
crw-------  mtd1                  # フラッシュデバイス
crw-------  mtd1ro                # フラッシュデバイス
drwxr-xr-x  net                   # トンネル ネットワーク
crw-rw-rw-  null                  # nullデバイス（書き込むと消える）
crw-------  nvram                 # BIOSフラッシュメモリ
crw-r-----  port                  # システムメモリ
crw-------  ppp                   # pointo-to-point protocol ネットワーク
crw-------  psaux                 # PS2マウス、キーボード
crw-rw-rw-  ptmx                  # 仮想端末
crw-------  ptp0                  # 時刻同期
drwxr-xr-x  pts                   # 仮想端末
crw-rw-rw-  random                # 乱数作成
crw-rw-r--+ rfkill                # ワイヤレスデバイスのON/OFF
lrwxrwxrwx  rtc -> rtc0           # リアルタイムクロック
crw-------  rtc0                  # リアルタイムクロック
brw-rw----  sda                   # ディスク
brw-rw----  sda1                  # ディスクパーティション
brw-rw----  sda2                  # ディスクパーティション
crw-rw----  sg0                   # SCSIデバイス
crw-rw----+ sg1                   # SCSIデバイス
drwxrwxrwt  shm                   # 共有メモリ
crw-------  snapshot              # hibernation用
drwxr-xr-x  snd                   # サウンドデバイス
brw-rw----+ sr0                   # CDROM
lrwxrwxrwx  stderr -> /proc/self/fd/2   # エラー出力
lrwxrwxrwx  stdin -> /proc/self/fd/0    # 標準入力
lrwxrwxrwx  stdout -> /proc/self/fd/1   # 標準出力
crw-------  tpm0                  # Trusted Platform Module セキュリティ
crw-rw-rw-  tty                   # 制御端末
...
crw--w----  tty63                 # 制御端末
crw-rw----  ttyS0                 # シリアルポート
...
crw-rw----  ttyS31                # シリアルポート
crw-rw----  udmabuf               # DMAバッファ
crw-------  uhid                  # USB、Bluetooth
crw-------  uinput                # 仮想インプットデバイス
crw-rw-rw-  urandom               # 乱数作成　ブロックなし
drwxr-xr-x  usb                   # USB
crw-------  userio                # User I/O
crw-rw----  vcs                   # 仮想コンソールメモリ ttyのバッファ
...
crw-rw----  vcs6                  # 仮想コンソールメモリ ttyのバッファ
crw-rw----  vcsa                  # 仮想コンソールメモリ ttyのバッファ
...
crw-rw----  vcsa6                 # 仮想コンソールメモリ ttyのバッファ
crw-rw----  vcsu                  # 仮想コンソールメモリ ttyのバッファ ユニコード
...
crw-rw----  vcsu6                 # 仮想コンソールメモリ ttyのバッファ ユニコード
drwxr-xr-x  vfio                  # ユーザースペースドライバーインターフェース
crw-------  vga_arbiter           # VGAデバイス
crw-------  vhci                  # USBリダイレクト USB over ethernet
crw-rw----+ vhost-net             # 仮想ネットワーク
crw-rw-rw-  vhost-vsock           # 仮想ソケット
crw-------  watchdog              # システムリセット
crw-------  watchdog0             # システムリセット
crw-rw-rw-  zero                  # ゼロ出力 （読み込むとゼロ）
```

#### ▼ ブロックデバイス（ブロックスペシャルファイル）

ある程度のまとまりでデータを扱う入出力装置にデータを転送するデバイスファイル。HHD（```/dev/hd```）、メモリ、などがある。

> ℹ️ 参考：https://ja.wikipedia.org/wiki/%E3%83%87%E3%83%90%E3%82%A4%E3%82%B9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB

#### ▼ キャラクターデバイス（キャラクタースペシャルファイル）

一文字単位でデータを扱う入出力装置にデータを転送するデバイスファイル。プリンター（```/dev/lp```）、モデム、ターミナル、などがある。

> ℹ️ 参考：https://ja.wikipedia.org/wiki/%E3%83%87%E3%83%90%E3%82%A4%E3%82%B9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB

#### ▼ 擬似デバイス

デバイスファイルの中で、実際の装置に対応していないデバイスファイル。標準入出力（```/dev/stdin```、```/dev/stdout```）や破棄（```/dev/null```）などがある。

> ℹ️ 参考：https://ja.wikipedia.org/wiki/%E3%83%87%E3%83%90%E3%82%A4%E3%82%B9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB

<br>

## 04. ジョブ管理

### ジョブ管理とは

定期的に実行するように設定されたバッチ処理を、特に『ジョブ』という。ジョブ管理では、複数のジョブを管理でき、各ジョブを独立して実行する。UNIXでは```at```や```cron```に、またWindowsではタスクスケジューラーがジョブ管理機能を持つ。

> ℹ️ 参考：
>
> - https://ja.wikipedia.org/wiki/%E3%82%B8%E3%83%A7%E3%83%96%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0
> - https://strategicppm.wordpress.com/2010/01/20/batch-vs-job-processes-becoming-more-efficient/
> - https://www.quora.com/What-is-the-difference-between-cron-job-and-batch-job
> - https://japan.zdnet.com/glossary/exp/%E3%82%B8%E3%83%A7%E3%83%96%E3%82%B9%E3%82%B1%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%A9/?s=4

<br>

### ジョブ管理の仕組み

ジョブ管理は、マスタスケジューラー、ジョブスケジューラーから構成される。

![ジョブ管理とタスク管理の概要](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ジョブ管理とタスク管理の概要.jpg)

<br>

###  マスタースケジューラー

#### ▼ マスタースケジューラーとは

ジョブスケジューラーにジョブの実行を命令する。データをコンピュータに入力し、複数の処理が実行され、結果が出力されるまでの一連の処理のこと。『Task』と『Job』の定義は曖昧なので、『process』と『set of processes』を使用するべきとのこと。複数のジョブ（定期的に実行するように設定されたバッチ処理）の起動と終了を制御したり、ジョブの実行と終了を監視報告するソフトウェア。ややこしいことに、タスクスケジューラーとも呼ぶ。

> ℹ️ 参考：https://stackoverflow.com/questions/3073948/job-task-and-process-whats-the-difference/31212568

<br>

### ジョブスケジューラー

#### ▼ ジョブスケジューラーとは

マスタースケジューラーから命令を受け、実際にジョブを実行する。

#### ▼ リーダー

ジョブを待ち行列に登録する。

#### ▼ イニシエーター

ジョブをジョブステップに分解する。

![ジョブからジョブステップへの分解](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ジョブからジョブステップへの分解.png)

#### ▼ ターミネーター

ジョブを出力待ち行列に登録する。

#### ▼ ライター

優先度順に、ジョブの結果を出力する。

<br>

## 05. タスク管理

### タスク管理とは

![task_management](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/task_management.png)

タスク管理によって、イニシエーターによるジョブステップからタスクが作成される。タスクが作成されると実行可能状態になる。ディスパッチャによって実行可能状態から実行状態になる。

> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

<br>

### タスク管理方式の種類

#### ▼ 優先順方式

各タスクに優先度を設定し、優先度の高いタスクから順に、ディスパッチしていく方式。

#### ▼ 到着順方式

待ち行列に登録されたタスクから順に、ディスパッチしていく方式。

![到着順方式_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/到着順方式_1.png)

**＊例＊**

以下の様に、タスクがCPUに割り当てられていく。

![到着順方式_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/到着順方式_2.png)

#### ▼ ラウンドロビン方式

ラウンドロビンは、『総当たり』の意味。一定時間（タイムクウォンタム）ごとに、実行状態にあるタスクが強制的に待ち行列に登録される。交代するように、他のタスクがディスパッチされる。

![ラウンドロビン方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ラウンドロビン方式.png)

**＊例＊**

作成されたタスクの到着時刻と処理時間は以下のとおりである。強制的なディスパッチは、『20秒』ごとに起こるとする。

![優先順方式_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/優先順方式_1.png)

1. タスクAが0秒に待ち行列へ登録される。
2. 20秒間、タスクAは実行状態へ割り当てられる。
3. 20秒時点で、タスクAは実行状態から待ち行列に追加される。同時に、待ち行列の先頭にいるタスクBは、実行可能状態から実行状態にディスパッチされる。
4. 40秒時点で、タスクCは実行状態から待ち行列に追加される。同時に、待ち行列の先頭にいるタスクAは、実行可能状態から実行状態にディスパッチされる。

![優先順方式_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/優先順方式_2.png)

<br>

## 06. その他の管理

### 通信管理

#### ▼ 通信管理とは

デバイスドライバーとミドルウェア間で実行されるデータ通信処理を管理する。

> ℹ️ 参考：http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>

### 運用管理

#### ▼ 運用管理とは

ミドルウェアやアプリケーションの運用処理（メトリクス収集、障害対応、記憶情報の保護）を管理する。

> ℹ️ 参考：http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>

### 障害管理

#### ▼ 障害管理とは

ソフトウェアに障害が発生した時の障害修復を管理する。

> ℹ️ 参考：http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>
