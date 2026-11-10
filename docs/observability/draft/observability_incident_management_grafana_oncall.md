---
title: 【IT技術の知見】Grafana OnCall
description: Grafana OnCallの知見を記録しています。
---

# Grafana OnCall

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Grafana OnCall とは

Grafana OnCall は、監視ツールから受信したアラートをグループ化し、オンコール当番のスケジュールやエスカレーションチェーンに基づいて担当者に通知するインシデント管理ツールである。

<br>

## 01. Grafana OnCall の仕組み

Grafana OnCall は、Grafana OnCall Engine、DB から構成されている。

![grafana-oncall_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grafana-oncall_architecture.png)

> - https://github.com/grafana/oncall/blob/dev/docs/img/architecture_diagram.png

<br>
