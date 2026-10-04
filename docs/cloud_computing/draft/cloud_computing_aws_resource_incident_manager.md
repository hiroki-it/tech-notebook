---
title: 【IT技術の知見】Incident Management＠AWS
description: Incident Management＠AWSの知見を記録しています。
---

# Incident Management＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Incident Manager とは

![aws_incident_manager](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_incident_manager.png)

Incident Manager をインシデント管理ツールとして使用する。

Amazon CloudWatch アラームのアラートを、Incident Manager にインシデントとして通知する。

また、各ロールの担当者にオンコールを自動的にエスカレーションする。

`(1)`

: エラーイベントの送信元 (例：手動、Amazon CloudWatch アラーム、Amazon EventBridge など) から Incident Manager に、エラーイベントを通知する。

`(2)`

: Incident Manager は、エラーイベントからインシデントを作成する。

     Automationが、インシデントの自動回復を試みる。

`(3)`

: Automation がインシデントを解決できなかったとする。

      Incident Managerは、インシデントを責任者 (インシデントコマンダー) にオンコールする。

`(4)`

: インシデントの通知を受けたオンコール担当者は、Incident Manager を確認する。

`(5)`

: インシデントを確認し、問題を解決する。

`(6)`

: 問題を解決できれば、クローズに移行する。

> - [Creating incidents automatically or manually in Incident Manager - Incident Manager](https://docs.aws.amazon.com/incident-manager/latest/userguide/incident-creation.html)
> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AWS-SystemsManager-IncidentManager_0430_v1.pdf#page=34
> - [Incident ManagerとAutomationを使って運用自動化を試してみた -その2 - サーバーワークスエンジニアブログ](https://blog.serverworks.co.jp/incidentmanager-automation-2)
> - [Wantedlyの障害対応文化とインシデントコマンダー / Wantedly Incident Commander - Speaker Deck](https://speakerdeck.com/irotoris/wantedly-incident-commander?slide=19)

<br>
