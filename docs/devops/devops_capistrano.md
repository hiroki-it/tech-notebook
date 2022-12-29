---
title: 【IT技術の知見】Capistrano＠DevOps
description: Capistrano＠DevOpsの知見を記録しています。
---

# Capistrano＠DevOps

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Capistranoの仕組み

### パイプライン構成

インプレースデプロイメントを実装する。



1. 自身のパソコンからデプロイサーバーにリモート通信する。


2. デプロイサーバーの自動デプロイツール（例：Capistrano）が、デプロイサーバーからwebサーバーにリモート通信する。


3. 自動デプロイツールが、webサーバーのGitを操作し、```git pull```あるいは```git clone```を実行する。

その結果、GitHubリポジトリからデプロイサーバーに指定のブランチの状態が取り込まれる。



![capistrano_ec2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/capistrano_ec2.png)

<br>
