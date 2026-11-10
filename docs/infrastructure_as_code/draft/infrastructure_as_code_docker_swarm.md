---
title: 【IT技術の知見】Docker Swarm
description: Docker Swarmの知見を記録しています。
---

# Docker Swarm

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概念

Docker Swarm は、docker コマンドから受け取った処理を各ノードの Docker Daemon に API 経由で通知し、複数のノードのコンテナをまとめて操作する。

![DockerSwarmの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/DockerSwarmの仕組み.png)

<br>
