---
title: 【IT技術の知見】Incident Management＠AWS
description: Incident Management＠AWSの知見を記録しています。
---

# Incident Management＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Incident Managerとは

![aws_incident_manager](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_incident_manager.png)

Incident Managerをインシデント管理ツールとして使用する。

CloudWatchアラームのアラートを、Incident Managerにインシデントとして通知する。

また、各ロールの担当者にオンコールを自動的にエスカレーションする。

`(1)`

: エラーイベントの送信元 (例：手動、CloudWatchアラーム、EventBridge、など) からIncident Managerに、エラーイベントを通知する。

`(2)`

: Incident Managerは、エラーイベントからインシデントを作成する。

     Automationが、インシデントの自動復旧を試みる。

`(3)`

: Automationがインシデントを解決できなかったとする。

      Incident Managerは、インシデントを責任者 (インシデントコマンダー) にオンコールする。

`(4)`

: インシデントの通知を受けたオンコール担当者は、Incident Managerを確認する。

`(5)`

: インシデントを確認し、問題を解決する。

`(6)`

: 問題を解決できれば、クローズに移行する。

> - https://docs.aws.amazon.com/incident-manager/latest/userguide/incident-creation.html
> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AWS-SystemsManager-IncidentManager_0430_v1.pdf#page=34
> - https://blog.serverworks.co.jp/incidentmanager-automation-2
> - https://speakerdeck.com/irotoris/wantedly-incident-commander?slide=19

<br>
