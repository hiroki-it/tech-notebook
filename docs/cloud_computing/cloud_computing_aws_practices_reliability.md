---
title: 【IT技術の知見】信頼性＠AWS
description: 信頼性＠AWSの知見を記録しています。
---

# 信頼性＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 障害の対策

### インシデント管理

インシデント管理ツール (例：PagerDuty) を採用し、障害を担当者に迅速に通知する。

> - https://docs.aws.amazon.com/ja_jp/wellarchitected/2023-10-03/framework/rel-failmgmt.html

<br>

### 冗長化

#### ▼ マルチAZ

マルチAZを採用する。

それぞれのAZにEC2/ECSを冗長化する。

特定のAZで障害が発生した場合、ALBを起点にして、インバウンド通信の向き先を正常なAZのEC2/ECSに切り替える。

#### ▼ NAT Gateway

NAT Gatewayを冗長化する。

NAT GatewayをAZで冗長化し、特定のAZで障害が起こっても、他のAZのアウトバウンド通信に影響しないようにする。

#### ▼ Auto Scaling Group

Auto Scaling Groupを採用する。

EC2で障害が発生した場合、ALBを起点にして、正常なEC2に切り替える。

#### ▼ Managed Node Group

Managed Node Groupを採用する。

EKS EC2 Nodeで障害が発生した場合、ALBを起点にして、正常なEC2に切り替える。

#### ▼ Aurora

Auroraでフェイルオーバーを採用する。

プライマリーインスタンスで障害が発生した場合、フェイルオーバーにより、リードレプリカがプライマリーインスタンスに昇格します。

<br>

### スケーリング

#### ▼ Managed Node Group

EKS EC2 Nodeのスケールアップには、Cluster Autoscaler、Managed Node Group、を採用する。

Cluster AutoscalerとManaged Node Group、では、PodによるEC2 Nodeの負荷に応じてEC2 Nodeをスケーリングする。

#### ▼ Auto Scaling Group

EC2のスケールアップには、Auto Scaling Group、を採用する。

Auto Scaling Groupでは、EC2のハードウェアリソース (CPU、メモリ) の消費率に応じて、自動水平スケーリングします。

<br>

## 02. 災害の対策

### DRリージョン (BCPリージョン) とは

『BCPリージョン』ともいう。

メインリージョンで災害が起こった場合に、システムの障害にならないように、災害復旧用リージョンを用意しておく。

> - https://docs.aws.amazon.com/ja_jp/wellarchitected/2023-10-03/framework/rel-failmgmt.html

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
