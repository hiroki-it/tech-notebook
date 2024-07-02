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

![aws_incident_manager.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_incident_manager.png)

ここでは、Incident Managerをインシデント管理ツールとして使用する。

CloudWatchアラームに通知されたアラートを、Incident Managerにインシデントとして通知し、これをオンコール担当者が対応すると仮定する。

`(1)`

: CloudWatchアラームからIncident Managerに、インシデントを通知する。

`(2)`

: Automationが、インシデントの自動復旧を試みる。

`(2)`

: Automationがインシデントを解決できなかったとする。

     Incident Managerは、インシデントをメールや電話に通知する。

`(3)`

: インシデントの通知を受けたオンコール担当者は、Incident Managerを確認する。

`(4)`

: インシデントを確認し、問題を解決する。

`(5)`

: 問題を解決できれば、クローズに移行する。

> - https://blog.serverworks.co.jp/incidentmanager-automation-2

<br>
