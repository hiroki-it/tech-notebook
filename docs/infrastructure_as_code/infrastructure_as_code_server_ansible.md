---
title: 【知見を記録するサイト】Ansible
description: Ansibleの知見をまとめました．
---

# Ansible

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## Ansibleとは

### 設定ファイル

#### ・```playbook.yml```ファイル

ソフトウェアのインストールタスクの手順を設定する．

#### ・```inventory/*```ファイル

反映先のサーバーの情報を設定する．

#### ・```group_vars/*```ファイル

複数の仮想サーバーを構築する．

#### ・```host_vars/*```ファイル

単一の仮想サーバーを構築する．

