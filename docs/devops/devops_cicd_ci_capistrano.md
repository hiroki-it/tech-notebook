---
title: 【IT技術の知見】Capistrano＠CIツール
description: Capistrano＠CIツールの知見を記録しています。
---

# Capistrano＠CIツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Capistranoの仕組み

### パイプライン構成

インプレースデプロイメントを実装する。

![capistrano_ec2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/capistrano_ec2.png)

`【１】`

: 自身のパソコンからデプロイサーバーにリモート通信する。

`【２】`

: デプロイサーバーの自動デプロイツール (例：Capistrano) が、デプロイサーバーからwebサーバーにリモート通信する。

`【３】`

: 自動デプロイツールが、webサーバーのGitを操作し、`git pull`コマンドあるいは`git clone`コマンドを実行する。

     その結果、GitHubリポジトリからデプロイサーバーに指定のブランチの状態が取り込まれる。

<br>
