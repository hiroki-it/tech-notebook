---
title: 【IT技術の知見】Kind＠開発環境
description: Kind＠開発環境の知見を記録しています。
---

# Kind＠開発環境

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kindの仕組み

### アーキテクチャ

ホスト上にコンテナを作成する。

このコンテナ内にMinikube仮想サーバーを作成し、仮想サーバー上にNodeを持つClusterを作成する。

> - https://kind.sigs.k8s.io/docs/design/initial

<br>
