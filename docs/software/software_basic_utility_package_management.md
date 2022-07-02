---
title: 【IT技術の知見】管理ユーティリティ＠ユーティリティ
description: 管理ユーティリティ＠ユーティリティの知見を記録しています。
---

# 管理ユーティリティ＠ユーティリティ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 管理ユーティリティの種類

### 様々な管理ユーティリティ

様々な粒度のプログラムを対象にした管理ユーティリティがある。

![library_package_module](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/library_package_module.png)

<br>

## 02. パッケージ管理ユーティリティ

| OS系統   | ユーティリティ         |
| -------- | ---------------------- |
| Debian系 | apt、apt-get、apt-file |
| RedHat系 | rpm、yum、dnf          |

<br>

## 02-02. Debian系

### apt-file

#### ▼ search

指定したファイルを持つパッケージを検索する。拡張子も指定しても、ファイル名までしか絞れない。

参考：

- https://atmarkit.itmedia.co.jp/ait/articles/1709/08/news020.html
- https://embedded.hatenadiary.org/entry/20081101/p3

```bash
# apt-fileパッケージをインストールする。
$ apt-get install apt-file

$ apt-file update

# zlib.hファイルを持つパッケージを検索する。
$ apt-file search zlib.h

autoconf-archive: /usr/share/doc/autoconf-archive/html/ax_005fcheck_005fzlib.html
cc65: /usr/share/cc65/include/zlib.h
dovecot-dev: /usr/include/dovecot/istream-zlib.h
dovecot-dev: /usr/include/dovecot/ostream-zlib.h

# ～ 中略 ～

tcllib: /usr/share/doc/tcllib/html/tcllib_zlib.html
texlive-plain-generic: /usr/share/texlive/texmf-dist/tex4ht/ht-fonts/alias/arabi/nazlib.htf
tinc: /usr/share/doc/tinc/tinc.html/zlib.html
zlib1g-dev: /usr/include/zlib.h
```

<br>

## 02-03. RedHat系

### rpm：RedHat Package Manager

#### ▼ -ivh

パッケージをインストールまたは更新する。一度に複数のオプションを組み合わせて記述する。インストール時にパッケージ間の依存関係を解決できないので注意。

```bash
# パッケージをインストール
# -ivh：--install -v --hash 
$ rpm -ivh <パッケージ名>
```

```bash
# パッケージを更新
# -Uvh：--upgrade -v --hash 
$ rpm -Uvh <パッケージ名>
```

#### ▼ -qa

インストールされた全てのパッケージの中で、指定した文字を名前に含むものを取得する。

```bash
# -qa：
$ rpm -qa | grep <検索文字>
```

#### ▼ -ql

指定したパッケージ名で、関連する全てのファイルの場所を取得する。

```bash
# -ql：
$ rpm -ql <パッケージ名>
```

#### ▼ -qi

指定したパッケージ名で、インストール日などの情報を取得する。

```bash
# -qi：
$ rpm -qi <パッケージ名>
```

<br>

### yum、dnf

#### ▼ install、reinstall

rpmと同様に使用できる。また、インストール時にパッケージ間の依存関係を解決できる。

```bash
# パッケージをインストール
$ yum install -y <パッケージ名>

# 再インストールする時は、reinstallとすること
$ yum reinstall -y <パッケージ名>
```

#### ▼ list

インストールされたパッケージの一覧を取得する。

```bash
# 指定した文字を名前に含むものを表示。
$ yum list | grep <検索文字>
```

#### ▼ repolist

リポジトリか有効かどうかの一覧を取得する。

参考：https://kazmax.zpp.jp/linux_beginner/yum_repository_enable_disable.html

```bash
$ yum repolist all

Loaded plugins: fastestmirror
Determining fastest mirrors
 * base: download.cf.centos.org
 * epel: ftp.riken.jp
 * extras: download.cf.centos.org
 * remi-safe: ftp.riken.jp
 * updates: download.cf.centos.org
repo id                          repo name                       status
C7.0.1406-base/x86_64            CentOS-7.0.1406 - Base          disabled
C7.0.1406-centosplus/x86_64      CentOS-7.0.1406 - CentOSPlus    disabled
C7.0.1406-extras/x86_64          CentOS-7.0.1406 - Extras        disabled

# ～ 中略 ～

remi-test-debuginfo/x86_64       Remi's test RPM repository for  disabled
!updates/7/x86_64                CentOS-7 - Updates              enabled:  3,323
updates-source/7                 CentOS-7 - Updates Sources      disabled
repolist: 34,344
```

<br>

### リポジトリ

#### ▼ リポジトリとは

CentOS公式リポジトリはパッケージのバージョンが古いことがある。そこで、```--enablerepo```オプションを使用すると、CentOS公式リポジトリではなく、最新バージョンを扱う外部リポジトリ（RPM、EPEL、Remi）から、パッケージをインストールできる。外部リポジトリ間で依存関係にあるため、両方のリポジトリをインストールする必要がある。

#### ▼ リポジトリ自体のインストール

（１）CentOSのEPELリポジトリをインストール。インストール時の設定ファイルは、```/etc/yu.repos.d```ディレクトリ配下に配置される。

```bash
# CentOS7系の場合
$ yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm

# CentOS8系の場合
$ dnf install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm

# こちらでもよい
$ yum install -y epel-release でもよい
```

（２）CentOSのRemiリポジトリをインストール。RemiバージョンはCentOSバージョンを要確認。インストール時の設定ファイルは、```/etc/yu.repos.d```ディレクトリ配下に配置される。

```bash
# CentOS7系の場合
$ yum install -y https://rpms.remirepo.net/enterprise/remi-release-7.rpm

# CentOS8系の場合
$ dnf install -y https://rpms.remirepo.net/enterprise/remi-release-8.rpm
```

（３）設定ファイルへは、インストール先のリンクなどが自動的に書き込まれる。

```ini
[epel]
name=Extra Packages for Enterprise Linux 6 - $basearch
#baseurl=http://download.fedoraproject.org/pub/epel/6/$basearch
mirrorlist=https://mirrors.fedoraproject.org/metalink?repo=epel-6&arch=$basearch
failovermethod=priority
enabled=0
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-6

[epel-debuginfo]
name=Extra Packages for Enterprise Linux 6 - $basearch - Debug
#baseurl=http://download.fedoraproject.org/pub/epel/6/$basearch/debug
mirrorlist=https://mirrors.fedoraproject.org/metalink?repo=epel-debug-6&arch=$basearch
failovermethod=priority
enabled=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-6
gpgcheck=1

[epel-source]
name=Extra Packages for Enterprise Linux 6 - $basearch - Source
#baseurl=http://download.fedoraproject.org/pub/epel/6/SRPMS
mirrorlist=https://mirrors.fedoraproject.org/metalink?repo=epel-source-6&arch=$basearch
failovermethod=priority
enabled=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-6
gpgcheck=1
```

#### ▼ PHPのインストール

（４）Remiリポジトリの有効化オプションを永続的に使用できるようにする。

```bash
# CentOS7の場合
$ yum install -y yum-utils
# 永続的に有効化
$ yum-config-manager --enable remi-php74


# CentOS8の場合（dnf moduleコマンドを使用）
$ dnf module enable php:remi-7.4
```

（５）remiリポジトリを指定して、php、php-mbstring、php-mcryptをインストールする。Remiリポジトリを経由してインストールしたソフトウェアは```/opt/remi/*```に配置される。

```bash
# CentOS7の場合
# 一時的に有効化できるオプションを使用して、明示的にremiを指定
$ yum install -y --enablerepo=remi,remi-php74 php php-mbstring php-mcrypt


# CentOS8の場合
# リポジトリの認識に失敗する場合があるので、enablerepoオプションは有効化しない。
$ dnf install -y php php-mbstring php-mcrypt
```

（６）再インストールする時は、reinstallとすること。

```bash
# CentOS7の場合
# 一時的に有効化できるオプションを使用して、明示的にremiを指定
$ yum reinstall --enablerepo=remi,remi-php74 -y php php-mbstring php-mcrypt


# CentOS8の場合
# リポジトリの認識に失敗する場合があるのでオプション無し
$ dnf reinstall -y php php-mbstring php-mcrypt
```

<br>

## 03. Linux汎用系

### brew

#### ▼ brewとは

Linuxで使用できるパッケージを管理する。異なるバージョンを同時に管理できない。M1 Macを使用している場合は、コマンドの前に```arch -arm64```をつける。

```bash
# M1 Macの場合
$ arch -arm64 brew install <パッケージ名>
```

#### ▼ install

```bash
# Intel Macの場合
$ brew install <パッケージ名>

$ brew install <パッケージ名>@<バージョン>
```

<br>

### asdf

#### ▼ asdfとは

Linuxで使用できるパッケージを管理する。また、異なるバージョンを同時に管理できる。ただ基本的には、開発時に複数のバージョンが並行して必要になるようなパッケージしか提供していない。また、```.tool-version```ファイルをリポジトリのルートディレクトリに置いておけば、異なる開発者がリポジトリ直下でパッケージをインストールした時に、特定のバージョンをインストールできる。

```bash
# .tool-versionsファイル

foo-plugin 1.0.0
```

#### ▼ plugin

```bash
 # プラグインのURLを調べる。
 $ asdf plugin list all | grep <プラグイン名>
 
 # プラグインをローカルマシンに登録する。（まだインストールされていない）
 $ asdf plugin add <プラグイン名> <URL>
```

#### ▼ install

```bash
# 登録済みのプラグインをインストールする。
$ asdf install
```

<br>

## 04. 言語バージョン管理ユーティリティ

### phpenv（PHP）

<br>

### pyenv（Python）

#### ▼ which

```bash
# pythonのインストールディレクトリを確認
$ pyenv which python
/.pyenv/versions/3.8.0/bin/python
```

<br>

### rbenv（Ruby）
