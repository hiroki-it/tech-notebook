---
title: 【知見を記録するサイト】Capistrano＠DevOps
description: Capistrano＠DevOpsの知見をまとめました。
---

# Capistrano＠DevOps

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Capistranoとは

#### ▼ 仕組み

インプレースデプロイメントを行う。

1. 自身のパソコンからデプロイサーバーにリモート接続する。
2. デプロイサーバーの自動デプロイツール（例：Capistrano）が、デプロイサーバーからWebサーバーにリモート接続する。
3. 自動デプロイツールが、WebサーバーのGitを操作し、```git pull```あるいは```git clone```を実行する。その結果、GitHubからデプロイサーバーに指定のブランチの状態が取り込まれる。

![capistorano_ec2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/capistorano_ec2.png)

<br>
