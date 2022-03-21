---
title: 【知見を記録するサイト】ファイル共有システム＠基本ソフトウェア
description: ファイル共有システム＠基本ソフトウェアの知見をまとめました．
---

# ファイル共有システム＠基本ソフトウェア

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## NFS：Network File System

### NFSとは

NFSサーバーに配置されたファイルを，他のサーバー（NFSクライアント）にマウントできる．

<br>

### セットアップ

#### ・MacOS（Catalina）の場合

（１）ホスト側のMacOSにて，```/etc/exports```ファイルにマウントオプションを設定する．また，```/etc/exports```ファイルを検証する．

参考：https://qiita.com/imaiworks/items/b657046ea499ec8fd95c

```bash
# マウントオプションを設定する．
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

（２）MacOSにNFSサーバーを起動する．

```bash
# nfsdプロセスを起動する
$ sudo nfsd start

# 動作確認
$ showmount -e localhost

Exports list on localhost:
<マウント元のディレクトリ> <マウント先のサーバーのIPアドレス>
```

（３）NFSクライアントにて，必要なパッケージをインストールする．

参考：https://qiita.com/tukiyo3/items/c4dfd6a12bf3255ddc78

```bash
# Ubuntuの場合
$ sudo apt-get install -y nfs-common
```

（４）NFSクライアントにて，マウントを実行する．

```bash
$ sudo mount -t nfs \
  <MacOSのIPアドレス>:/System/Volumes/Data/Users/hiroki.hasegawa/projects/<マウント元のディレクトリ> \
  <マウントポイント>
```

