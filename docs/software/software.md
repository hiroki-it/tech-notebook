---
title: 【IT技術の知見】ソフトウェア
description: ソフトウェアの知見を記録しています。
---

# ソフトウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ソフトウェア

### ソフトウェアとは

システムのうちで、インフラ領域の『OS』『ミドルウェア』、アプリケーション領域全体の要素を合わせたグループのこと。

『OS』『ミドルウェア』『ハードウェア』をインフラとも呼ぶ。

![software](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software.png)

> - https://thinkit.co.jp/article/11526

<br>

## 02. アプリケーションソフトウェア (応用ソフトウェア)

### アプリケーションソフトウェアの一覧

|                    | ネイティブアプリ | Webアプリとクラウドアプリ | ハイブリッドアプリ |
| :----------------: | :--------------: | :-----------------------: | :----------------: |
| 利用できる通信状況 |      On/Off      |            On             |       On/Off       |

<br>

### ネイティブアプリケーション

端末のシステムによって稼働するアプリケーションのこと。

一度ダウンロードしてしまえば、インターネットに繋がっていなくとも、使用できる。

![ネイティブアプリ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ネイティブアプリ.png)

> - https://www.sbbit.jp/article/cont1/28197

**＊例＊**

Office、BookLiveのアプリ版

<br>

### Webアプリケーションとクラウドアプリケーション

![Webアプリ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Webアプリ.png)

#### ▼ Webアプリケーション

webサーバー上で稼働するソフトウェアのこと。

URLをwebサーバーにリクエストすることにより利用でき、随時、webサーバーとデータ通信を実行する。

全ての人が無料で利用できるものと、お金を払った人だけが利用できるものがある。

> - https://www.sbbit.jp/article/cont1/28197

**＊例＊**

- Googleアプリケーション
- Amazon
- BookLiveのブラウザ版
- サイボウズ

#### ▼ クラウドアプリケーション

webサーバー上のソフトウェアによって稼働するアプリケーションのうち、クラウドサービスを提供するもののこと。

**＊例＊**

- Google Drive
- Dropbox

<br>

### ハイブリッドアプリケーション

端末でWebviewを稼働させ、ソフトウェアの`.html`ファイルのレンダリングをWebview上で実行するアプリケーションのこと。

![Webviewよるアプリパッケージ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Webviewよるアプリパッケージ.png)

![ハイブリッドアプリ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ハイブリッドアプリ.png)

> - https://www.sbbit.jp/article/cont1/28197

**＊例＊**

クックパッド

<br>

## 03. ミドルウェア

### webサーバーのミドルウェア (リバースプロキシとしても機能する場合がある)

- Apache
- Nginx
- IIS
- Apache Tomcat (appサーバーとwebサーバーの両方の機能を持つ)

> - https://thinkit.co.jp/article/11837
> - https://www.javatpoint.com/apache-tomcat-server-vs-apache-webserver

<br>

### appサーバーのミドルウェア

- Apacheの拡張モジュール
- PHP-FPM
- NGINX Unit (webサーバーのNginxと組み合わせて使用できるミドルウェア)
- Apache Tomcat (appサーバーとwebサーバーの両方の機能を持つ)

> - https://thinkit.co.jp/article/11837
> - https://www.javatpoint.com/apache-tomcat-server-vs-apache-webserver

<br>

### dbサーバーのミドルウェア

- MySQL
- MariaDB
- PostgreSQL
- Oracle Database

> - https://thinkit.co.jp/article/11837

<br>

## 04. 基本ソフトウェア (広義のOS)

### 基本ソフトウェアの種類

#### ▼ Unix系OS

Unixを源流として派生したOS。

現在では主に、Linux系統 (緑色) 、BSD系統 (黄色) 、SystemV系統 (青色) の`3`個に分けられる。

※補足として、MacOSはBSD系統

![os_unix-like_history](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/os_unix-like_history.png)

#### ▼ WindowsOS

MS-DOSを源流として派生したOS。今では、全ての派生がWindows 10に集約された。

![os_windows_history](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/os_windows_history.png)

<br>

### 基本ソフトウェア

![基本ソフトウェアの構成](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/基本ソフトウェアの構成.png)

> - http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>

## 04-02. Unix系OS

### Linux系統

#### ▼ Linux系統とは

Unixから分岐したLinuxは、加えて3系統 (Debian、RedHat、Slackware) に分岐する。

![linux-distribution](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/linux-distribution.png)

> - http://officemiyajima.com/index.php?What%20is%20Linux

#### ▼ Debian系統

Debian、Ubuntu、など

```bash
# 確認方法
$ cat /etc/issue

Debian GNU/Linux 10 \n \l
```

> - https://aoi-f.blog.ss-blog.jp/2010-09-13

#### ▼ RedHat系統

RedHat、CentOS、Fedora、など

```bash
# 確認方法
$ cat /etc/issue

CentOS release 5.5 (Final)
Kernel \r on an \m
```

> - https://aoi-f.blog.ss-blog.jp/2010-09-13

#### ▼ Slackware系統

Slackwareなど

<br>

### BSD系統 (MacOSのみ

#### ▼ BSD系統とは

Unixから分岐したBSDは、加えて複数の系統 (例：MacOSなど) に分岐する。

<br>

## 05. デバイスドライバー

### デバイスドライバーとは

記入中...

<br>

## 06. Firmware

### Firmwareとは

ソフトウェア (ミドルウェア+基本ソフトウェア) とハードウェアの間の段階にあるソフトウェア。

ROMに組み込まれている。

### BIOS：Basic Input/Output System

![BIOS](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/BIOS.jpg)

<br>

### UEFI：United Extensible Firmware Interface

Windows 8以降で採用されている新しいFirmware

![UEFIとセキュアブート](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/UEFIとセキュアブート.jpg)

<br>

## 07. OSS：Open Source Software

### OSSとは

以下の条件を満たすソフトウェアをOSSと呼ぶ。

アプリケーションソフトウェアから基本ソフトウェアまで、様々なものがある。

- 利用者は、無償あるいは有償で自由に再配布できる。
- 利用者は、コードを入手できる。
- 利用者は、コードを自由に変更できる。また、変更後に提供する場合、異なるライセンスを追加できる。
- 差分情報の配布を認める場合には、同一性の保持を要求してもかまわない。 ⇒ よくわからない
- 提供者は、特定の個人やグループを差別できない。
- 提供者は、特定の分野を差別できない。
- 提供者は、全く同じOSSの再配布でライセンスを追加できない。
- 提供者は、特定の製品のみで有効なライセンスを追加できない。
- 提供者は、他のソフトウェアを制限するライセンスを追加できない。
- 提供者は、技術的に偏りのあるライセンスを追加できない。

### OSSの種類

![OSS一覧](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/OSS一覧.png)

> - https://openstandia.jp/oss_info/

<br>
