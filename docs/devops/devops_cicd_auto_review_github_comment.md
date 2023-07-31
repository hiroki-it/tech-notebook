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

#### ▼ execとは

コマンドを実行し、標準出力/標準エラー出力の出力内容からコメントを作成する。

```bash
$ ./github-comment exec -k <テンプレート名> -- <好きなコマンド>
```

> - https://suzuki-shunsuke.github.io/github-comment/getting-started

#### ▼ テンプレートに出力できる変数

| 変数                    | 説明                                   |
| ----------------------- | -------------------------------------- |
| `{{ .Stdout }}`         | 標準出力への出力内容                   |
| `{{ .Stderr }}`         | 標準エラー出力への出力内容             |
| `{{ .CombinedOutput }}` | 標準出力と標準エラー出力を結合した内容 |
| `{{ .Command }}`        | 実行コマンド                           |
| `{{ .JoinCommand }}`    | 実行コマンドと引数を結合した内容       |
| `{{ .ExitCode }}`       | 終了ステータスコード                   |

> - https://suzuki-shunsuke.github.io/github-comment/config/#exec

<br>

## 04. `github-comment.yaml`ファイル

### `github-comment.yaml`ファイルとは

GitHubに送信するコメントのテンプレートを設定する。

文法は、Goテンプレートと同じである。

```yaml
---
# github-comment execコマンドで使用するテンプレート
exec:
  # テンプレート名
  test: ...
```

<br>

### template

#### ▼ template

コメントの内容を定義する。

#### ▼ link

ジョブへのリンクを表示する。

````yaml
---
exec:
  test:
    template: |

      ## :{{ if eq .ExitCode 0 }}white_check_mark{{ else }}x{{ end }}:

      {{ template "link" . }}

      ```bash
      $ {{ .Command }}

      {{ if eq .ExitCode 0 }}
      {{ .Stdout }}
      {{ else }}
      {{ .Stderr }}
      {{ end }}
      ```
````

> - https://suzuki-shunsuke.github.io/github-comment/builtin-template#link

<br>

### when

特定の条件の場合のみ、テンプレートを使用する。

`````yaml
````yaml
---
exec:
  test:
      # 終了コードが成功以外の場合
    - when: ExitCode != 0
      template: |

        ## :x:

        ```bash
        ${{.Command}}

        {{.Stderr}}
        ```
`````

> - https://suzuki-shunsuke.github.io/github-comment/getting-started

<br>
