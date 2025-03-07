---
title: 【IT技術の知見】RedHat系＠管理ユーティリティ
description: RedHat系＠管理ユーティリティの知見を記録しています。
---

# RedHat系＠管理ユーティリティ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. rpm：RedHat Package Manager

### -ivh

パッケージをインストールまたは更新する。

一度に複数のオプションを組み合わせて記述する。

インストール時にパッケージ間の依存関係を解決できないので注意。

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

<br>

### qa

インストールされた全てのパッケージの中で、指定した文字を名前に含むものを取得する。

```bash
# -qa：
$ rpm -qa | grep <検索文字>
```

<br>

### -ql

指定したパッケージ名で、関連する全てのファイルの場所を取得する。

```bash
# -ql：
$ rpm -ql <パッケージ名>
```

<br>

### -qi

指定したパッケージ名で、インストール日などの情報を取得する。

```bash
# -qi：
$ rpm -qi <パッケージ名>
```

<br>

## 02. yum、dnf

### install、reinstall

rpmと同様に使用できる。

また、インストール時にパッケージ間の依存関係を解決できる。

```bash
# パッケージをインストール
$ yum install -y <パッケージ名>

# 再インストールする時は、reinstallとすること
$ yum reinstall -y <パッケージ名>
```

<br>

### list

インストールされたパッケージの一覧を取得する。

```bash
# 指定した文字を名前に含むものを表示。
$ yum list | grep <検索文字>
```

<br>

### repolist

リポジトリか有効か否かの一覧を取得する。

> - https://kazmax.zpp.jp/linux_beginner/yum_repository_enable_disable.html

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

...

remi-test-debuginfo/x86_64       Remi's test RPM repository for  disabled
!updates/7/x86_64                CentOS-7 - Updates              enabled:  3,323
updates-source/7                 CentOS-7 - Updates Sources      disabled
repolist: 34,344
```

<br>

## 03. リポジトリ

### リポジトリとは

CentOS公式リポジトリはパッケージのバージョンが古いことがある。

そこで、`--enablerepo`オプションを使用すると、CentOS公式リポジトリではなく、最新バージョンを扱う外部リポジトリ (RPM、EPEL、Remi) から、パッケージをインストールできる。

外部リポジトリ間で依存関係にあるため、両方のリポジトリをインストールする必要がある。

<br>

### リポジトリ自体のインストール

`(1)`

: CentOSのEPELリポジトリをインストール。インストール時の設定ファイルは、`/etc/yu.repos.d`ディレクトリ配下に配置される。

```bash
# 全てのバージョン
# @see https://dl.fedoraproject.org/pub/epel/

# CentOS7系の場合
# 非推奨のため、アーカイブ (https://archives.fedoraproject.org/pub/archive/epel/) に移動している
$ yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm

# CentOS8系の場合
$ dnf install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm

# CentOS9系の場合
$ dnf install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm

# こちらでもよい
$ yum install -y epel-release
```

`(2)`

: CentOSのRemiリポジトリをインストール。RemiバージョンはCentOSバージョンを要確認。インストール時の設定ファイルは、`/etc/yu.repos.d`ディレクトリ配下に配置される。

```bash
# CentOS7系の場合
$ yum install -y https://rpms.remirepo.net/enterprise/remi-release-7.rpm

# CentOS8系の場合
$ dnf install -y https://rpms.remirepo.net/enterprise/remi-release-8.rpm
```

`(3)`

: 設定ファイルへは、インストール先のリンクなどが自動的に書き込まれる。

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

<br>

### PHPのインストール

`(4)`

: Remiリポジトリの有効化オプションを永続的に使用できるようにする。

```bash
# CentOS7の場合
$ yum install -y yum-utils
# 永続的に有効化
$ yum-config-manager --enable remi-php74


# CentOS8の場合 (dnf moduleコマンドを使用)
$ dnf module enable php:remi-7.4
```

`(5)`

: remiリポジトリを指定して、php、php-mbstring、php-mcryptをインストールする。Remiリポジトリを経由してインストールしたソフトウェアは`/opt/remi/*`に配置される。

```bash
# CentOS7の場合
# 一時的に有効化できるオプションを使用して、明示的にremiを指定
$ yum install -y --enablerepo=remi,remi-php74 php php-mbstring php-mcrypt


# CentOS8の場合
# リポジトリの認識に失敗する場合があるため、enablerepoオプションは有効化しない。
$ dnf install -y php php-mbstring php-mcrypt
```

`(6)`

: 再インストールする時は、reinstallとすること。

```bash
# CentOS7の場合
# 一時的に有効化できるオプションを使用して、明示的にremiを指定
$ yum reinstall --enablerepo=remi,remi-php74 -y php php-mbstring php-mcrypt


# CentOS8の場合
# リポジトリの認識に失敗する場合があるのでオプション無し
$ dnf reinstall -y php php-mbstring php-mcrypt
```

<br>
