---
title: 【IT技術の知見】github-comment＠自動レビューツール
description: github-comment＠自動レビューツールの知見を記録しています。
---

# github-comment＠自動レビューツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. github-commentとは

記入中...

<br>

## 02. セットアップ

```bash
$ curl -sL -O https://github.com/suzuki-shunsuke/github-comment/releases/download/v6.0.1/github-comment_6.0.1_linux_amd64.tar.gz

$ tar zxvf github-comment_<バージョン>_linux_amd64.tar.gz
```

<br>

## 03. コマンド

### exec

コマンドを実行し、標準出力/標準エラー出力の出力内容からコメントを作成する。

```bash
$ ./github-comment exec -k <テンプレートのキー名> -- <好きなコマンド>
```

> - https://suzuki-shunsuke.github.io/github-comment/getting-started

<br>

## 04. `github-comment.yaml`ファイル

GitHubに送信するコメントのテンプレートを設定する。

````yaml
# https://suzuki-shunsuke.github.io/github-comment/getting-started
---
# github-commentのコマンド名
exec:
  # テンプレート名
  test:
    # 終了コードが成功以外の場合
    - when: ExitCode != 0
      template: |

        ## 静的解析

        ```
        ${{.Command}}
        ```

        ## 結果

        CIが失敗しました。

        ```
        {{.Stderr}}
        ```

    # 終了コードが成功以外の場合
    - when: ExitCode == 0
      template: |

        ## 静的解析

        ```
        ${{.Command}}
        ```

        ## 結果

        CIが成功しました。

        ```
        {{.Stdout}}
        ```
````
