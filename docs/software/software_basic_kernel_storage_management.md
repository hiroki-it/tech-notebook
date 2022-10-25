---
title: 【IT技術の知見】ストレージ管理＠カーネル
description: ストレージ管理＠カーネルの知見を記録しています。
---

# ストレージ管理＠カーネル

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/index.html

<br>

## 01. ストレージ管理

### ストレージ管理の仕組み

> ℹ️ 参考：https://hogetech.info/linux/kernel/basic4

<br>

### ストレージの変更方法

（１）ストレージのサイズを現状から```100```GBまで拡張する。

（２）ストレージサイズをOSに適用するために、OSを再起動する。

（３）パーティション、物理ボリューム、論理ボリューム、ファイルシステムは拡張できていないため、拡張していく。

> ℹ️ 参考：https://isleofhoso.com/linux-lvm-extend/

```bash
$ lsblk

NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda             8:0    0  100G  0 disk             # <--- ストレージの拡張を適用できている。
├─sda1          8:1    0    1G  0 part /boot
└─sda2          8:2    0   49G  0 part             # <--- パーティションを拡張できていない。
  ├─root      253:0    0   44G  0 lvm  /           # <--- 論理ボリュームを拡張できていない。
  └─swap      253:1    0    5G  0 lvm  [SWAP]
sr0            11:0    1 1024M  0 rom
```

```bash
$ df -hT

Filesystem            Type       Size  Used  Avail  Use%  Mounted on
devtmpfs              devtmpfs   3.8G     0  3.8G     0%  /dev
tmpfs                 tmpfs      3.8G     0  3.8G     0%  /dev/shm
tmpfs                 tmpfs      3.8G  8.9M  3.8G     1%  /run
tmpfs                 tmpfs      3.8G     0  3.8G     0%  /sys/fs/cgroup
/dev/root             xfs         44G  4.9G   40G    12%  /               # <--- ファイルシステムを拡張できていない。
/dev/sda1             xfs       1014M  194M  821M    20%  /boot
tmpfs                 tmpfs      777M     0  777M     0%  /run/user/1000
```

（４）パーティションを```growpart```コマンドで拡張する。

```bash
$ growpart /dev/sda 2
```

（５）論理ボリュームを拡張できるように、事前に物理ボリュームを```pvresize```コマンドで拡張する。

```bash
$ pvresize /dev/sda2
```

（６）論理ボリュームをlvextendコマンドで拡張する。ここでは、空き領域いっぱいに拡張する。

```bash
$ lvextend -l +100%FREE /dev/root
```

（７）ファイルシステムのサイズを拡張する。

```bash
$ xfs_growfs -d /
```

（８）パーティション、物理ボリューム、論理ボリューム、ファイルシステム、を拡張できた。

```bash
$ lsblk

NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda             8:0    0  100G  0 disk             # <--- OK
├─sda1          8:1    0    1G  0 part /boot
└─sda2          8:2    0   99G  0 part             # <--- OK
  ├─root      253:0    0   94G  0 lvm  /           # <--- OK
  └─swap      253:1    0    5G  0 lvm  [SWAP]
sr0            11:0    1 1024M  0 rom
```

```bash
$ df -hT

Filesystem            Type       Size  Used  Avail  Use%  Mounted on
devtmpfs              devtmpfs   3.8G     0  3.8G     0%  /dev
tmpfs                 tmpfs      3.8G     0  3.8G     0%  /dev/shm
tmpfs                 tmpfs      3.8G  8.9M  3.8G     1%  /run
tmpfs                 tmpfs      3.8G     0  3.8G     0%  /sys/fs/cgroup
/dev/mapper/rhel-root xfs         94G  5.3G   89G     6%  /                # <--- OK
/dev/sda1             xfs       1014M  194M  821M    20%  /boot
tmpfs                 tmpfs      777M     0  777M     0%  /run/user/1000
```

<br>

## 02. パーティション、物理ボリューム、マウントポイント

### パーティション、物理ボリューム

#### ▼ パーティション、物理ボリューム、とは

![partition_volume](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/partition_volume.png)

ストレージ上の仮想的な仕切りを『パーティション』、また仕切られた領域を『物理ボリューム』という。1つの領域を複数に見せかけられる。```/dev```ディレクトリ配下にストレージに紐づくデバイスファイルがあり、デバイスファイル内でパーティションが設定されている。

> ℹ️ 参考：
>
> - https://win2012r2.com/2018/05/13/post-268/
> - http://www.miloweb.net/partition.html

<br>

### マウントポイント

#### ▼ マウントポイントとは

パーティションにアクセスできるディレクトリのこと。

> ℹ️ 参考：https://allabout.co.jp/gm/gc/438839/

<br>

### パーティション、マウントポイント、の確認方法

#### ▼ Linuxの場合

Linuxでは、パーティションとマウントポイントは```df```コマンドで確認できる。

**＊例＊**

```Filesystem```列にパーティション、```Mounted on```列にパーティションに対応するマウントポイント、が表示される。

> ℹ️ 参考：
> 
> - https://atmarkit.itmedia.co.jp/ait/articles/1610/24/news017.html#sample1
> - https://atmarkit.itmedia.co.jp/flinux/rensai/linuxtips/750chkfstype.html

```bash
$ df

# パーティション、マウントポイント
Filesystem     Size   Used  Avail  Use%   Mounted on
/dev/xvda1       8G   1.9G    14G   12%   /          
/dev/nvme1n1   200G   161G    40G   81%   /var/lib
```

#### ▼ Windowsの場合

Windowsでは、CドライブとDドライブがパーティションに相当する。

> ℹ️ 参考：http://www.miloweb.net/partition.html

#### ▼ MacOSの場合

MacOSでは、```diskutil```コマンドを実行するとパーティションとマウントポイントを確認できる。

> ℹ️ 参考：https://qiita.com/sfp_waterwalker/items/188b536e3519058e3280

**＊例＊**

ストレージに紐づく```2```個のデバイスファイルが表示され、```disk0```ファイル は2つ、また```disk1```ファイルは6つのパーティションで区切られていることが確認できる。マウントポイントは、```IDENTIFIER```列で表示される（例：パーティション名が```/dev/disk0```なら、マウントポイントは```/dev/disk0<IDENTIFIER名>```になる）。

```bash
$ diskutil list

# ストレージ：disk0
/dev/disk0 (internal, physical):
   #:                       TYPE    NAME                       SIZE       IDENTIFIER
   0:      GUID_partition_scheme                               *500.3 GB  disk0
   1:                        EFI    EFI                        314.6 MB   disk0s1
   2:                 Apple_APFS    Container disk1            500.0 GB   disk0s2

# ストレージ：disk1
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

## 03. 論理ボリューム

### 論理ボリュームとは

![logical-volume](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/logical-volume.png)

異なる物理ボリュームにまたがる領域を組み合わせ、一つの仮想的なボリュームとした扱ったもの。

> ℹ️ 参考：https://xtech.nikkei.com/it/article/Keyword/20071012/284413/

<br>

### 論理ボリュームの確認方法

#### ▼ Linuxの場合

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


## 04. デバイスファイル

### デバイスファイルとは

カーネルが入出力装置や標準入出力を操作できるように、これらのインターフェースをファイルとして扱ったもの。```/dev```ディレクトリ配下に配置されている。各ファイルには具体的な入出力装置を示す番号（メジャー番号、マイナー番号）が割り当てられている。デバイスファイルを操作すると、入出力装置や標準入出力に対してその操作が実行される。

> ℹ️ 参考：
>
> - https://e-words.jp/w/%E3%83%87%E3%83%90%E3%82%A4%E3%82%B9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB.html
> - https://qiita.com/angel_p_57/items/1faafa275525469788b4

<br>

### デバイスファイルの確認方法

#### ▼ Linuxの場合

**＊例＊**

Linuxのデバイスファイルは```/dev```ディレクトリ配下にある。Dockerのデバイスファイルを確認すると、以下のデバイスファイルがある。

> ℹ️ 参考：https://zenn.dev/ysuito/articles/5abf6e3e6a8c13

```bash
$ ls -l /dev

crw-------  acpi_thermal_rel      # CPU温度
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
brw-rw----  sda                   # ストレージ
brw-rw----  sda1                  # ストレージパーティション
brw-rw----  sda2                  # ストレージパーティション
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

<br>

### デバイスファイルの種類

#### ▼ ブロックデバイス（ブロックスペシャルファイル）

ある程度のまとまりでデータを処理する入出力装置にデータを転送するデバイスファイル。HHD（```/dev/hd```）、メモリ、などがある。

> ℹ️ 参考：https://ja.wikipedia.org/wiki/%E3%83%87%E3%83%90%E3%82%A4%E3%82%B9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB

#### ▼ キャラクターデバイス（キャラクタースペシャルファイル）

一文字単位でデータを処理する入出力装置にデータを転送するデバイスファイル。プリンター（```/dev/lp```）、モデム、ターミナル、などがある。

> ℹ️ 参考：https://ja.wikipedia.org/wiki/%E3%83%87%E3%83%90%E3%82%A4%E3%82%B9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB

#### ▼ 擬似デバイス

デバイスファイルの中で、実際の装置に対応していないデバイスファイル。標準入出力（```/dev/stdin```、```/dev/stdout```）や破棄（```/dev/null```）などがある。

> ℹ️ 参考：https://ja.wikipedia.org/wiki/%E3%83%87%E3%83%90%E3%82%A4%E3%82%B9%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB

<br>


## 05. ファイルシステム

### ファイルシステムとは

パーティション内のファイルをデータとして使用できるようにする機能のこと。

> ℹ️ 参考：https://ameblo.jp/bakery-diary/entry-12639340661.html

<br>


## 05-02. ファイル共有システム

### ファイル共有システムの種類

#### ▼ NFS：Network File System

NFSサーバーに配置されたファイルを、他のサーバー（NFSクライアント）にマウントできる。

<br>

### セットアップ

#### ▼ NFSの場合

（１）ホスト側のMacOSにて、```/etc/exports```ファイルにマウントオプションを設定する。また、```/etc/exports```ファイルを検証する。

> ℹ️ 参考：https://qiita.com/imaiworks/items/b657046ea499ec8fd95c

```bash
# マウントオプションを設定する。
$ echo '
  "/System/Volumes/Data/Users/hiroki.hasegawa/projects/<マウント元のディレクトリ>"
  -network <マウント先のサーバーのIPアドレス>
  -mask 255.255.255.0
  -alldirs
  -maproot=root:wheel
  ' >> /etc/exports"

# 検証
$ nfsd checkexports
```

（２）MacOSにNFSサーバーを起動する。

```bash
# nfsdプロセスを起動する
$ sudo nfsd start

# 動作確認
$ showmount -e localhost

Exports list on localhost:
<マウント元のディレクトリ> <マウント先のサーバーのIPアドレス>
```

（３）NFSクライアントにて、必要なパッケージをインストールする。

> ℹ️ 参考：https://qiita.com/tukiyo3/items/c4dfd6a12bf3255ddc78

```bash
# Ubuntuの場合
$ sudo apt-get install -y nfs-common
```

（４）NFSクライアントにて、マウントを実行する。

```bash
$ sudo mount -t nfs \
    <MacOSのIPアドレス>:/System/Volumes/Data/Users/hiroki.hasegawa/projects/<マウント元のディレクトリ> \
    <マウントポイント>
```

<br>
