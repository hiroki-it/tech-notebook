---
title: 【IT技術の知見】信頼性＠AWS
description: 信頼性＠AWSの知見を記録しています。
---

# 信頼性＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 災害

### DRリージョン (BCPリージョン) とは

『BCPリージョン』ともいう。

メインリージョンで災害が起こった場合に、システムの障害にならないように、災害復旧用リージョンを用意しておく。

<br>

### バックアップリストア構成

![dr-architecture_backup-restore](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dr-architecture_backup-restore.png)

DRリージョンにメインリージョンのAWSリソース (例：EBSボリューム、RDS) のスナップショットを定期的に作成しておく。

メインリージョンで障害が起こった場合は、スナップショットを使用して、DRリージョンにAWSリソースを復元する。

DRリージョンの準備が完了次第、リクエストをDRリージョンにルーティング可能にする。

障害が起こってから対応することが多いため、RTOが長くなってしまう。

RPOは最後のバックアップ時点である。

一方で金銭的コストが低い。

> - https://aws.amazon.com/jp/blogs/news/disaster-recovery-dr-architecture-on-aws-part-1-strategies-for-recovery-in-the-cloud/
> - https://michimani.net/post/aws-architecture-for-disaster-recovery/
> - https://aws.amazon.com/jp/cdp/cdp-dr/

<br>

### パイロットライト構成

![dr-architecture_pilot-light](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dr-architecture_pilot-light.png)

DRリージョンに低スペックなDBを作成しておき、メインリージョンとDRリージョンのDBを定期的に同期しておく。

メインリージョンで障害が起こった場合は、DRリージョンでDB以外のインフラコンポーネント (例：アプリケーション部分など) を作成し、またDBのスペックをメインリージョンと同等に上げる。

DRリージョンの準備が完了次第、リクエストをDRリージョンにルーティング可能にする。

障害が起こってから対応することが多いため、RTOがやや長くなってしまう。

RPOは最後の同期時点である。

一方で金銭的コストが低い。

> - https://aws.amazon.com/jp/blogs/news/disaster-recovery-dr-architecture-on-aws-part-1-strategies-for-recovery-in-the-cloud/
> - https://michimani.net/post/aws-architecture-for-disaster-recovery/

<br>

### ウォームスタンバイ構成

![dr-architecture_warm-standby](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dr-architecture_warm-standby.png)

DRリージョンにメインリージョンよりも低スペックなアプリケーションとDBを作成しておき、メインリージョンとDRリージョンのDBを定期的に同期しておく。

メインリージョンで障害が起こった場合は、DRリージョンでアプリケーションとDBのスペックをメインリージョンと同等に上げる。

DRリージョンの準備が完了次第、リクエストをDRリージョンにルーティング可能にする。

障害が起こった後、スペックを向上させ、またルーティング先を切り替えるのみで復旧できるため、RTOが短い。

RPOは最後の同期時点である。

一方で、金銭的コストが高い。

> - https://aws.amazon.com/jp/blogs/news/disaster-recovery-dr-architecture-on-aws-part-1-strategies-for-recovery-in-the-cloud/
> - https://michimani.net/post/aws-architecture-for-disaster-recovery/

<br>

### マルチサイトアクティブ構成

![dr-architecture_multi-site-active](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dr-architecture_multi-site-active.png)

DRリージョンにメインリージョンと同等なアプリケーションとDBを作成しておき、メインリージョンとDRリージョンのDBを定期的に同期しておく。

メインリージョンで障害が起こった場合は、リクエストをDRリージョンにルーティング可能にする。

障害が起こった後、ルーティング先を切り替えるのみで復旧できるため、RTOが短い。

RPOは最後の同期時点である。

一方で、金銭的コストが高い。

> - https://aws.amazon.com/jp/blogs/news/disaster-recovery-dr-architecture-on-aws-part-1-strategies-for-recovery-in-the-cloud/
> - https://michimani.net/post/aws-architecture-for-disaster-recovery/

<br>
