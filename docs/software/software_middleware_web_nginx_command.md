---
title: 【知見を書きなぐるサイト】nginxコマンド
---

# nginxコマンド

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. コマンド

### -c

設定ファイルを指定して，nginxプロセスを実行する．

```bash
$ sudo nginx -c ./custom-nginx.conf
```

<br>

### reload

nginxプロセスを安全に再起動する．```systemctl```コマンドでも再起動できる．

```bash
$ sudo nginx -s reload
```

参考：

- https://serverfault.com/questions/378581/nginx-config-reload-without-downtime
- https://www.nyamucoro.com/entry/2019/07/27/222829
- https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_utility_package.html

<br>

### -t

設定ファイルのバリデーションを実行する．また，読み込まれている全ての設定ファイル（```include```ディレクティブの対象も含む）の内容の一覧を表示する．```service```コマンドでもバリデーションを実行できる．

```bash
$ sudo nginx -t
```

参考：

- https://www.nginx.com/resources/wiki/start/topics/tutorials/commandline/
- https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_utility_package.html
