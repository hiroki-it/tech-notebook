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
| `{{ .Command }}`        | 絶対パスの実行コマンド名               |
| `{{ .JoinCommand }}`    | バイナリ名のみの実行コマンド名         |
| `{{ .ExitCode }}`       | 終了ステータスコード                   |

> - https://suzuki-shunsuke.github.io/github-comment/config/#exec

<br>

### hide

#### ▼ hideとは

テンプレートで定義した条件に応じて、コメントを非表示にする。

テンプレート名は

```bash
$ ./github-comment hide -k <テンプレート名>
```

> - https://tech-blog.yayoi-kk.co.jp/entry/2022/05/10/110000
> - https://studist.tech/terraform-plan-9429ab6392a9
> - https://suzuki-shunsuke.github.io/github-comment/hide/

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

```bash
$ ./github-comment exec -k test -- <好きなコマンド>
```

<br>

### hide

非表示にするコメントの条件を設定する。

```yaml
---
exec:
  test:
    - when: true
      template: |
        ...
hide:
  old-comment:
    - when: true
      # 一致しないコミットによるコメントは非表示にする
      template: |
        Comment.HasMeta && Comment.Meta.SHA1 != Commit.SHA1
```

各コメントには、以下のようなメタデータが設定されている。

これを非表示の条件に使用する。

```html
<!-- github-comment: {"SHA1":"*****","TemplateKey":"test","Vars":{"target":""}} -->
```

> - https://github.com/suzuki-shunsuke/tfaction-example/blob/main/github-comment.yaml

<br>

### template

#### ▼ template

コメントの内容を定義する。

| 記法                        | 説明                                               | 中身                                                            |
| --------------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| `{{ template "status" . }}` | 終了ステータスコードが`0`なら ✅ 、それ以外なら ❌ | `:{{ if eq .ExitCode 0 }}white_check_mark{{ else }}x{{ end }}:` |
| `{{ template "link" . }}`   | Jobへのリンク                                      | CIツールによって異なる。                                        |

> - https://suzuki-shunsuke.github.io/github-comment/builtin-template

#### ▼ link

ジョブへのリンクを表示する。

````yaml
---
exec:
  test:
    - when: true
      template: |

        ## 概要

        | 項目 | 内容 |
        |-----|--------------------|
        | 解析コマンド | `{{ .JoinCommand }}` |
        | 成否 | {{ template "status" . }} |
        | 実行ジョブ | {{ template "link" . }} |

        ## 詳細

        <details>
        <summary>クリックで開く</summary>

        ```bash
        $ {{ .JoinCommand }}

        {{ .CombinedOutput | AvoidHTMLEscape }}
        ```

        </details>
````

> - https://suzuki-shunsuke.github.io/github-comment/builtin-template#link

<br>

### when

#### ▼ whenとは

テンプレートを使用する条件を設定する。

````yaml
---
exec:
  test:
    # 必ず実行する場合
    - when: true
      template: |

        ## 概要

        | 項目 | 内容 |
        |-----|--------------------|
        | 解析コマンド | `{{ .JoinCommand }}` |
        | 成否 | {{ template "status" . }} |
        | 実行ジョブ | {{ template "link" . }} |

        ## 詳細

        <details>
        <summary>クリックで開く</summary>

        ```bash
        $ {{ .JoinCommand }}

        {{ .CombinedOutput | AvoidHTMLEscape }}
        ```

        </details>
````

````yaml
---
exec:
  test:
    # 終了コードが成功以外の場合
    - when: ExitCode != 0
      template: |

        ## 概要

        | 項目 | 内容 |
        |-----|--------------------|
        | 解析コマンド | `{{ .JoinCommand }}` |
        | 成否 | :x: |
        | 実行ジョブ | {{ template "link" . }} |

        ## 詳細

        <details>
        <summary>クリックで開く</summary>

        ```bash
        $ {{ .JoinCommand }}

        {{ .CombinedOutput | AvoidHTMLEscape }}
        ```

        </details>
````

> - https://suzuki-shunsuke.github.io/github-comment/getting-started

<br>
