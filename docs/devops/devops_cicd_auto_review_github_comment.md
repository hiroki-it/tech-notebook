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

## 03. オプション

### -k

`github-comment.yaml`ファイルのテンプレート名を指定して、レビューコメントを作成する。

```bash
$ ./github-comment exec -k <テンプレート名> -- <好きなコマンド>
```

> - https://suzuki-shunsuke.github.io/github-comment/getting-started

<br>

### -var

#### ▼ -varとは

レビューコメントのテンプレートの`{{ .Vars.<変数> }}`に出力できる変数を定義する。

実行コマンドごとに異なる文字列を使用したい場合に役立つ。

```bash
$ ./github-comment exec -k <テンプレート名>  -var "TestName:foo-test" -var "Description:〇〇を検証する" -- <好きなコマンド>
```

ここでは、以下のようなテンプレートを想定している。

````yaml
---
exec:
  default:
    - when: true
      template: |

        ## `{{ .Vars.TestName }}`

        | 項目 | 内容 |
        |-----|--------------------|
        | 静的解析 | `{{ .JoinCommand }}` |
        | 説明 | {{ .Vars.Description }} |
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

> - https://suzuki-shunsuke.github.io/github-comment/config/#define-variables

**＊実装例＊**

```bash
#!/bin/bash

./github-comment exec -var "TestName:trivy" -var "Description:報告されたCVEに基づいて、マニフェストの実装方法に起因する脆弱性を検証する" \
  -- trivy config --exit-code 1 --severity HIGH,CRITICAL --include-non-failures manifest.yaml
```

```bash
#!/bin/bash

./github-comment exec -var "TestName:polaris" -var "Description:一般に知られているK8sのベストプラクティスに基づいて、マニフェストのベストプラクティス違反を検証する" \
  -- polaris audit --config polaris-config.yaml --audit-path manifest.yaml --severity danger --only-show-failed-tests true --format pretty --set-exit-code-on-danger 1
```

#### ▼ 変数の出力

レビューコメント中に変数を出力できる。

**＊実装例＊**

```bash
#!/bin/bash

K8S_CURRENT_VERSION=1.26
K8S_NEXT_VERSION=1.26

echo Test "Current K8s Version: ${K8S_CURRENT_VERSION}"
./github-comment exec -var "TestName:pluto" -var "Description:指定したK8sバージョン (${K8S_CURRENT_VERSION}) に基づいて、マニフェストの非推奨なapiVersionを検証する" \
  -- /pluto detect -t k8s=v${K8S_CURRENT_VERSION} manifest.yaml \
  || true

echo Test "Next K8s Version: ${K8S_NEXT_VERSION}"
./github-comment exec -var "TestName:pluto" -var "Description:指定したK8sバージョン (${K8S_NEXT_VERSION}) に基づいて、マニフェストの非推奨なapiVersionを検証する" \
  -- /pluto detect -t k8s=v${K8S_NEXT_VERSION} manifest.yaml
```

```bash
#!/bin/bash

K8S_CURRENT_VERSION=1.26
K8S_NEXT_VERSION=1.26

echo Test "Current K8s Version: ${K8S_CURRENT_VERSION}"
./github-comment exec -var "TestName:kubeconform" -var "Description:指定したK8sバージョン (${K8S_CURRENT_VERSION}) のスキーマに基づいて、マニフェストの文法の誤りを検証する" \
  -- /kubeconform -kubernetes-version ${K8S_CURRENT_VERSION} -strict -summary -output text -schema-location 'default' -schema-location 'https://raw.githubusercontent.com/datreeio/CRDs-catalog/main/{{ .Group }}/{{ .ResourceKind }}_{{.ResourceAPIVersion}}.json' manifest.yaml \
  || true

echo Test "Next K8s Version: ${K8S_NEXT_VERSION}"
./github-comment exec -var "TestName:kubeconform" -var "Description:指定したK8sバージョン (${K8S_NEXT_VERSION}) のスキーマに基づいて、マニフェスト文法の誤りを検証する" \
  -- /kubeconform -kubernetes-version ${K8S_NEXT_VERSION} -strict -summary -output text -schema-location 'default' -schema-location 'https://raw.githubusercontent.com/datreeio/CRDs-catalog/main/{{ .Group }}/{{ .ResourceKind }}_{{.ResourceAPIVersion}}.json' manifest.yaml
```

<br>

## 04. コマンド

### exec

#### ▼ execとは

コマンドを実行し、標準出力/標準エラー出力の出力内容からレビューコメントを作成する。

```bash
$ ./github-comment exec -k <テンプレート名> -- <好きなコマンド>
```

> - https://suzuki-shunsuke.github.io/github-comment/getting-started

<br>

### hide

#### ▼ hideとは

テンプレートで定義した条件に応じて、レビューコメントを非表示にする。

テンプレート名は

```bash
$ ./github-comment hide -k <テンプレート名>
```

> - https://tech-blog.yayoi-kk.co.jp/entry/2022/05/10/110000
> - https://studist.tech/terraform-plan-9429ab6392a9
> - https://suzuki-shunsuke.github.io/github-comment/hide/

<br>

## 05. `github-comment.yaml`ファイル

### `github-comment.yaml`ファイルとは

GitHubに送信するレビューコメントのテンプレートを設定する。

文法は、Goテンプレートと同じである。

<br>

### 変数

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

### exec

#### ▼ execとは

`github-comment exec`コマンドの結果に使用するテンプレート

#### ▼ テンプレート名

```yaml
---
# github-comment execコマンドで使用するテンプレート
exec:
  # テンプレート名
  default:
    # hen=true は必ず設定する
    - when: true
      template: |
        ...
```

```yaml
---
# github-comment execコマンドで使用するテンプレート
exec:
  # テンプレート名
  default:
    # when=true は必ず設定する
    - when: true
      template: |
        ...

  test:
    - when: true
      template: |
        ...
```

#### ▼ 複数のテンプレート

````yaml
---
exec:
  # 静的解析以外の処理のためのテンプレート
  default:
    - when: true
      template: |

        ## `{{ .Vars.TestName }}`

        | 項目 | 内容 |
        |-----|--------------------|
        | コマンド | `{{ .JoinCommand }}` |
        | 説明 | {{ .Vars.Description }} |
        | 実行ジョブ | {{ template "link" . }} |

        ## 詳細

        <details>
        <summary>クリックで開く</summary>

        ```bash
        $ {{ .JoinCommand }}

        {{ .CombinedOutput | AvoidHTMLEscape }}
        ```

        </details>

  # 静的解析のためのテンプレート
  test:
    - when: true
      template: |

        ## `{{ .Vars.TestName }}`

        | 項目 | 内容 |
        |-----|--------------------|
        | 静的解析 | `{{ .JoinCommand }}` |
        | 説明 | {{ .Vars.Description }} |
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

> - https://github.com/suzuki-shunsuke/github-comment/blob/main/github-comment.yaml

#### ▼ 必要なコマンド

`default`のテンプレートを使用する場合、`-k`オプションは不要である。

```bash
$ ./github-comment exec -- <好きなコマンド>
```

`default`以外のテンプレートを使用する場合、`-k`オプションが必要である。

```bash
$ ./github-comment exec -k test -- <好きなコマンド>
```

<br>

### hide

非表示にするレビューコメントの条件を設定する。

```yaml
---
exec:
  default:
    # when=true は必ず設定する
    - when: true
      template: |
        ...
hide:
  old-comment:
    - when: true
      # 一致しないコミットによるレビューコメントは非表示にする
      template: |
        Comment.HasMeta && Comment.Meta.SHA1 != Commit.SHA1
```

各レビューコメントには、以下のようなメタデータが設定されている。

これを非表示の条件に使用する。

```html
<!-- github-comment: {"SHA1":"*****","TemplateKey":"test","Vars":{"target":""}} -->
```

> - https://github.com/suzuki-shunsuke/tfaction-example/blob/main/github-comment.yaml

<br>

### template

#### ▼ template

レビューコメントの内容を定義する。

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
  default:
    # when=true は必ず設定する
    - when: true
      template: |

        ## `{{ .Vars.TestName }}`

        | 項目 | 内容 |
        |-----|--------------------|
        | 静的解析 | `{{ .JoinCommand }}` |
        | 説明 | {{ .Vars.Description }} |
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

**＊実装例＊**

テンプレートが1つの場合は、`when`キーを`true`とする

````yaml
---
exec:
  test:
    # when=true は必ず設定する
    - when: true
      template: |

        ## `{{ .Vars.TestName }}`

        | 項目 | 内容 |
        |-----|--------------------|
        | 静的解析 | `{{ .JoinCommand }}` |
        | 説明 | {{ .Vars.Description }} |
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

**※実装例※**

終了コードを条件とする場合、`ExitCode`を使用する。

````yaml
---
exec:
  test:
    # 終了コードが成功以外の場合
    - when: ExitCode != 0
      template: |

        ## `{{ .Vars.TestName }}`

        | 項目 | 内容 |
        |-----|--------------------|
        | 静的解析 | `{{ .JoinCommand }}` |
        | 説明 | {{ .Vars.Description }} |
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
