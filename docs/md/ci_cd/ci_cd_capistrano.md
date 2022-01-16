# Capistrano

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. Capistranoとは

#### ・仕組み

インプレースデプロイメントを行う。

1. 自身のパソコンからデプロイサーバーにリモート接続する。
2. デプロイサーバーの自動デプロイツール（例：Capistrano）が、デプロイサーバーからWebサーバーにリモート接続する。
3. 自動デプロイツールが、WebサーバーのGitを操作し、```pull```あるいは```clone```を実行する。その結果、GitHubからデプロイサーバーに指定のブランチの状態が取り込まれる。

![デプロイ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/デプロイ.png)
