---
title: 【IT技術の知見】関数＠チャート
description: アクション＠チャートの知見を記録しています。
---

# 関数＠チャート

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 変数

### 予約された変数

> ↪️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/2104/15/news009.html#042

<br>

### ローカルスコープの変数

同じファイル内で使用できる変数を定義する。

```yaml
{{- $domain := "https://{{ .Values.serviceName }}.argocd.com" }}
```

> ↪️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/2104/15/news009.html#042
> - https://kb.novaordis.com/index.php/Helm_Variables

<br>

### 条件内スコープの変数

条件分岐で定義した変数は、`{{- end }}`までしか使用できない。

```yaml
{{- if .Values.isProduction }}

  {{- $prefix := "prd" }}
  ... 変数を使用する。

{{- else }}

  {{- $prefix := "nonprd" }}
  ... 変数を使用する。

{{- end }}
```

> ↪️ 参考：
>
> - https://stackoverflow.com/a/57600807
> - https://stackoverflow.com/a/67886552

<br>

### グローバルスコープの変数

テンプレートの関数 (例：`include`、`template`) 、`_helpers.tpl`ファイルで定義する。

> ↪️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/2104/15/news009.html#042

<br>

## 02. Helmのコメントアウト

Helmのテンプレート内にコメントアウトを定義する。

`*/}}`にはスペースを含めずに、一繋ぎで定義する。

YAMLのコメントアウト (例：`#`) であると、テンプレートの出力時に、YAMLのコメントアウトとしてそのまま出力されてしまうため、注意する。

Helmのコメントの前に不要な改行が挿入されないように、`{{-`とする方が良い。

```yaml
{{- /* コメント */}}
```

もしコメントの後にも改行が挿入されてしまう場合は、`-}}`も付ける。

```yaml
{{- /* コメント */-}}
```

> ↪️ 参考：https://helm.sh/docs/chart_best_practices/templates/#comments-yaml-comments-vs-template-comments

`*/}}`にはスペースを含めずに、一繋ぎで定義する。

<br>

## 03. テンプレート作成の関数

### テンプレート作成の関数とは

`template`ディレクトリ配下のテンプレートを出力する。

> ↪️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

<br>

### include

#### ▼ includeとは

`define`関数で定義したテンプレートを加工して出力する。

加工内容はパラメーターで設定できる。

> ↪️ 参考：
>
> - https://helm.sh/docs/chart_template_guide/named_templates/#the-include-function
> - https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-include-function

<br>

### template

#### ▼ templateとは

`define`関数で定義したテンプレートをそのまま出力する。

`template`関数では出力内容を変数に格納できないため、これが可能な`include`関数が推奨されている。

> ↪️ 参考：
>
> - https://helm.sh/docs/chart_template_guide/named_templates/#the-include-function
> - https://itnext.io/use-named-templates-like-functions-in-helm-charts-641fbcec38da

<br>

## 04. `values`ファイルの関数

### Values

#### ▼ Valuesとは

`values`ファイルの特定のキー値を出力する。

特定の条件下で、`values`ファイルを２階層以上に設定できなくなる現象の理由がわかっていない...。

```yaml
# values.yamlファイル
global:
  env: prd
  appName: foo
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.global.env }}-{{ .Values.global.appName }}-pod
  labels:
    app.kubernetes.io/app: {{ .Values.global.appName }}
```

> ↪️ 参考：https://github.com/helm/helm/issues/8026

#### ▼ metadataキーで使用する場合の注意点

マニフェストの``.metadata.`キーの値には文字列しか設定できない。

`values`ファイルから出力した値が数字の場合、Helmは勝手にint型に変換しようとする。

そのため、metadataキーの値にint型を出力しようとしてエラーになる。

int型にならないように、`values`ファイルの出力先をダブルクオーテーションで囲うと良い。

```yaml
# values.yamlファイル
metadata:
  labels:
    # マニフェストで、int型で出力しようとする。
    id: "1"
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo
  labels:
    # int型にならないように、ダブルクオーテーションで囲う。
    id: "{{ .Values.metadata.labels.id }}"
```

> ↪️ 参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/#required-fields

<br>

### toYaml

#### ▼ toYamlとは

出力されたデータをそのままの形で出力する。

`values`ファイルにmap型やlist型をそのまま出力する場合に使用する。

#### ▼ map型の場合

map型を出力する。

```yaml
# values.yamlファイル
parameters:
  foo: FOO
  bar: BAR
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
data: {{- toYaml .Values.parameters | nindent 2}}
```

> ↪️ 参考：https://qiita.com/keiSunagawa/items/db0db26579d918c81457#%E9%96%A2%E6%95%B0

#### ▼ list型の場合

list型を出力する。

```yaml
# values.yamlファイル
containers:
  - name: foo
    image: foo:latest
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers: {{- toYaml .Values.containers | nindent 4}}
```

<br>

## 05. キーパスの関数

### キーパスの関数とは

テンプレートや`values`ファイルを出力する時に、特定のキーパスにアクセスする。

<br>

### `.` (ドット)

#### ▼ ドットとは

テンプレートの内容をルートから出力する。

```yaml
{* tplファイル *}

{{- define "foo-template" }}

- foo: FOO
  bar: BAR

{{- end }}
```

```yaml
baz:
{{- include "foo-template" . }}
```

```yaml
# 結果
baz:
  - foo: FOO
    bar: BAR
```

<br>

### `$` (ドル)

#### ▼ ドルとは

出力時に、`.yaml`ファイルのルートを明示的に出力する。

アクションの中でアクションで、`.yaml`ファイルのルートにアクセスしたい場合に役立つ。

**＊実装例＊**

`range`関数を使用すると、`.yaml`ファイルへのアクセスのルートが変わってしまう。

ルートを明示することにより、`range`関数内でも`.yaml`ファイルの正しいルートにアクセスできるようなる。

```yaml
{{- range $.Values.foo.namespaces }}
apiVersion: apps/v1
kind: Secret
metadata:
  name: {{ $.Values.global.env }}-foo-secret
  namespace: {{ . }}

  ...

{{- end }}
```

> ↪️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

<br>

## 06. ループの関数

### range

#### ▼ rangeとは

同じ階層にある他の`.yaml`ファイルのキーとその値を格納し、foreach関数のように出力する。

> ↪️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

#### ▼ マップ型を扱う場合

マップ型を入力値として使用できる。

**＊実装例＊**

もし、以下のような平文ファイルがあるとする。

```yaml
# plane.yamlファイル
foo: FOO
bar: bar
```

これを`base64`方式で変換し、`values`ファイルの`config`キー配下に定義したとする。

```yaml
# valuesファイル
config: eHh4OiB5eXkKenp6OiBxcXEK
```

`fromYaml`関数を使用して、string型をmap型に変換する。

その後、`range`関数でキーと値を取得し、Secretのデータとして割り当てる。

```yaml
{{- $decoded := .Values.config | b64dec | fromYaml }}
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
type: Opaque
data:
  {{- range $key, $value := ($decoded) }}
  {{ $key }}: {{ $value }}
  {{- end }}
```

> ↪️ 参考：https://helm-playground.com/cheatsheet.html#loops

#### ▼ 配列型を扱う場合

配列型を入力値として使用できる。

```yaml
# valuesファイル
ipAddresses:
  - 192.168.0.1/32
  - 192.168.0.2/32
  - 192.168.0.3/32
```

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: blocked-ip-addresses-config-map
data:
  # 『.』を指定し、反復的に出力する。
  ip-addresses: |
    {{- range .Values.ipAddresses }}
    - {{ . }}
    {{- end }}
```

> ↪️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

<br>

### with

YAMLの現在のパスを変更する。

```yaml
foo:
  foo1: FOO1
  foo2: FOO2
```

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-config-map
data:
  # 現在のパスをfooに変更する。
  {{- with .Values.foo }}
  foo1: {{ .foo1 }}
  foo2: {{ .foo2 }}
  {{- end }}
```

> ↪️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/#modifying-scope-using-with

<br>

### required

#### ▼ requiredとは

記入中...

> ↪️ 参考：https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-required-function

<br>

## 07. データ型変換の関数

### fromYaml

#### ▼ fromYamlとは

string型をmap型に変換する。

**＊実装例＊**

もし、以下のような平文ファイルあるとする。

```yaml
# plane.yamlファイル
foo: FOO
bar: bar
```

これを`base64`方式で変換し、`values`ファイルの`config`キー配下に定義したとする。

```yaml
# valuesファイル
config: eHh4OiB5eXkKenp6OiBxcXEK
```

`fromYaml`関数を使用して、string型をmap型に変換する。

```yaml
{{- $decoded := .Values.config | b64dec | fromYaml }}
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
type: Opaque
data:
  {{- range $key, $value := ($decoded) }}
  {{ $key }}: {{ $value }}
  {{- end }}
```

> ↪️ 参考：
>
> - https://helm.sh/docs/chart_template_guide/function_list/#fromyaml
> - https://fenyuk.medium.com/helm-for-kubernetes-handling-secrets-with-sops-d8149df6eda4
> - https://stackoverflow.com/a/62832814

<br>

### splitList

#### ▼ splitListとは

string型を指定した文字で分割し、list型に変換する

```yaml
url: https://github.com/hiroki-hasegawa/foo-repository.git
```

```yaml
# printf関数を使用して、一度strig型に変換している。
{{- printf "%s" .Values.url | splitList "/"}}
# [https:  github.com hiroki-hasegawa foo-repository.git]
```

> ↪️ 参考：https://helm-playground.com/#t=N7AEAcCcEsDsBcBmoBEBSAzi0A6AagIYA2ArgKYY4mRGgA%2BoG4R08AMtBvKgPTYC%2B-IA&v=K4JwNgXABAFgLnADgZwgejQcwJZxsAIwDoBjAewFs0ZsQyBrbAWhgENkBTTVgd1bQBmZMkxAdEZZLjIgAnkRxwAUEA

<br>

## 08. string型の関数

### printf

#### ▼ printfとは

様々なデータ型をstring型で出力する。

> ↪️ 参考：https://helm.sh/docs/chart_template_guide/function_list/#printf

#### ▼ エスケープ

Helmのテンプレート内に、アクションや変数以外の理由で`{}`を出力する場合 (例：Alertmanagerのアラートの変数出力の定義) 、これらとして認識されないようにエスケープする必要がある。

また、エスケープする場合は必ず改行 (`|`、`|-`、`|+`) で出力する必要がある。エスケープのために`printf`関数を使用することもできる。

一方で、HelmではGoのテンプレートを使用していため、これと同じエスケープの方法 (例：`` {{`<記号を含む文字列全体>`}} ``、`{{"<記号>"}}`) を使用できる。

エスケープしたい文字列にバッククオートが含まれる場合、『`` {{`<記号を含む文字列>`}} ``』を使用できず、他のエスケープ方法 (`{{"<記号>"}}`、`printf`関数) が必要になる。

```yaml
# Helmのテンプレート

# Alertmanagerの通知内容の定義は以下を参考にした。
# https://www.infinityworks.com/insights/slack-prometheus-alertmanager/

---
receivers:
  - name: slack_webhook
    slack_configs:
      - channel: prd
        send_resolved: true
        api_url: https://hooks.slack.com/services/*****
        # 波括弧 ({}) をエスケープするために、『{{``}}』とprintfを使用している。
        # エスケープする場合は、必ず改行で出力する必要がある。
        text: |
          {{`{{ range .Alerts }}`}}
          {{`*Summary:* {{ .Annotations.summary }}`}}
          {{ printf "*Severity:* `{{ .Labels.severity }}`" }}
          {{`*Description:* {{ .Annotations.description }}`}}
          *Details:*
          {{ printf "{{ range .Labels.SortedPairs }} • *{{ .Name }}:* `{{ .Value }}`" }}
          {{`{{ end }}`}}
          {{`{{ end }}`}}
```

> ↪️ 参考：https://github.com/helm/helm/issues/2798#issuecomment-890478869

<br>

### trimSuffix

#### ▼ trimSuffixとは

string型から指定した文字を削除し、再取得する。

```yaml
url: https://github.com/hiroki-hasegawa/foo-repository.git
```

```yaml
# printf関数を使用して、一度strig型に変換している。
{{- $list := printf "%s" .Values.url | splitList "/" }}

# [https:  github.com hiroki-hasegawa foo-repository.git]


# リポジトリ名のみを取得する。
{{- $repositoryName := last $list | trimSuffix ".git" }}

# foo-repository
```

> ↪️ 参考：https://helm-playground.com/#t=N7C0AIBIBsEsGcAu4BcBecAHATrAdogGbgBEApPCeAHQBqAhtAK4Cm81T204APuPJjiIAMgmQkA9FQC%2B0gFAgIkbC0wB7eLERrsATwBy9ALYtUGaPSRQ4VvolxGAyk0KFYAD1LUA5lpnzFKBV1TW09QxNwWSA&v=K4JwNgXABAFgLnADgZwgejQcwJZxsAIwDoBjAewFs0ZsQyBrbAWhgENkBTTVgd1bQBmZMkxAdEZZLjIgAnkRxwAUEA

<br>

## 08-02. list型の関数

### last

#### ▼ lastとは

list型の最後を取得する。

```yaml
lists:
  - foo
  - bar
  - baz # これのみを取得する
```

```yaml
{{.Values.lists | last}}
# baz
```

> ↪️ 参考：https://helm.sh/docs/chart_template_guide/function_list/#last-mustlast

<br>

## 09. セキュリティに関する機能

### b64enc

#### ▼ b64encとは

`base64`方式でエンコードする。

Secretの`.data`キーでは、他のKubernetesリソースへの出力時に自動的に`base64`方式でデコードするようになっており、相性が良い。

**＊実装例＊**

```yaml
# values.yamlファイル
username: hiroki-it
password: pass
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
data:
  # base64方式でエンコードする。
  username: {{.Values.username | b64enc}}
  password: {{.Values.password | b64enc}}
```

<br>

### default

出力された値が空文字 (`""`) や`false`の場合に、それを上書きしてデフォルト値として出力する。

キー自体は存在しなければならず、省略することはできないことに注意する。

```yaml
{{.Values.foo | default "foo"}}
```

> ↪️ 参考：https://helm-playground.com/cheatsheet.html#variables

<br>

### sha256sum

#### ▼ sha256sumとは

入力内容をハッシュ値に変換する。

SecretとConfigMapの設定値を変更した場合に、Podを配下にもつKubernetesリソース (例：Deployment、StatefulSet、DaemonSet) では、Podを再作成する必要がある。

これらのKubernetesリソースのPodTemplateの`.metadata.annotations`キーにて、テンプレートの出力を`sha256sum`に入力する。

これにより、SecretとConfigMapを変更した場合に、ハッシュ値が変更される。

そのため、PodTemplateが変更されたことになり、Podも再作成できるようになる。

**＊実装例＊**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod
  template:
    metadata:
      annotations:
        checksum/secret: "{{ include (print $.Template.BasePath '/foo-secret.yaml') . | sha256sum }}"
        checksum/config: "{{ include (print $.Template.BasePath '/foo-configmap.yaml') . | sha256sum }}"
    spec:
      containers:
        - name: foo-gin
          image: foo-gin:1.0.0
          ports:
            - containerPort: 8080
          envFrom:
            - secretRef:
                name: foo-secret
            - configMapRef:
                name: foo-secret
```

> ↪️ 参考：
>
> - https://helm.sh/docs/howto/charts_tips_and_tricks/#automatically-roll-deployments
> - https://sminamot-dev.hatenablog.com/entry/2020/03/22/130017

<br>

## 10. インデントの関数

### `-` (ハイフン)

#### ▼ `{{-`

`{{-`であると、テンプレートの出力時にこれより前のインデントを削除する。

**＊実装例＊**

```yaml
{* tplファイル *}

  {{- define "foo-template" }}

- foo: FOO
  bar: BAR

  {{- end }}
```

```yaml
baz: {{- include "foo-template" .}} # 『{{-』の前にあるインデントは削除される。
```

```yaml
# 結果
baz:
  - foo: FOO
    bar: BAR
```

> ↪️ 参考：https://qiita.com/keiSunagawa/items/db0db26579d918c81457#%E5%9F%BA%E6%9C%AC%E7%9A%84%E3%81%AA%E6%A7%8B%E6%96%87

#### ▼ `-}}`

`-}}`であると改行コードを削除し、不要な改行が挿入されないようにする。

ただ、`-}}`は使用しない方が良いらしい。

> ↪️ 参考：https://github.com/helm/helm/issues/4191#issuecomment-539149037

<br>

### indent

#### ▼ indentとは

改行せずに、そのままスペースを挿入した上で、内容を出力する。

**＊実装例＊**

```yaml
{* tplファイル *}

{{- define "foo-template" }}

- foo: FOO
  bar: BAR

{{- end }}
```

```yaml
# 2つ分のスペースを挿入した上で、出力する。
baz:
{{- include "foo-template" . | indent 2 }}
```

```yaml
# 結果
baz:
  - foo: FOO
    bar: BAR
```

> ↪️ 参考：
>
> - https://helm.sh/docs/chart_template_guide/function_list/#indent
> - https://www.skyarch.net/blog/?p=16660#28

<br>

### nindent

#### ▼ nindentとは

改行しつつ、スペースを挿入した上で、内容を出力する。

**＊実装例＊**

```yaml
{* tplファイル *}

{{- define "foo-template" }}

- foo: FOO
  bar: BAR

{{- end }}
```

```yaml
# 改行しつつ、2つ分のスペースを挿入した上で、出力する。
baz:
{{- include "foo-template" . | nindent 2 }}
```

```yaml
# 結果
baz:
  # ここで改行が入る
  - foo: FOO
    bar: BAR
```

> ↪️ 参考：
>
> - https://www.skyarch.net/blog/?p=16660#29
> - https://helm.sh/docs/chart_template_guide/function_list/#nindent

<br>

## 11. 検証の関数

### hasKey

キーが存在する場合、`true`を返却する。

キーが存在する場合にのみ、そのキー配下の構造を使用するような場面で役立つ。

一方で、別途`enabled`キーを用意するのもありである。

```yaml
foo:
  baz:
    - FOO
    - BAR
```

```yaml
{{- if hasKey .Values.foo "baz" }}
  baz:
    {{- range baz }}
    - {{ . }}
    {{- end }}
  ...
{{- end }}
```

> ↪️ 参考：
>
> - https://lzone.de/blog/Helm-template-check-if-key-exists
> - https://helm.sh/docs/chart_template_guide/function_list/#haskey

<br>

## 12. 条件分岐の関数

### AND条件

`and`演算子と`()`記号を使用する。

```yaml
{{- if and (eq .Values.enableFoo true) (eq .Values.enableBar true) }}
  ...
{{- end }}
```

> ↪️ 参考：https://stackoverflow.com/a/49819239

<br>

### OR条件

`or`演算子と`()`記号を使用する。

```yaml
{{- if or (eq .Values.global.env "dev") (eq .Values.global.env "tes") }}
  ...
{{- end }}
```

> ↪️ 参考：https://stackoverflow.com/a/49819239

<br>

### NOT条件

`ne`演算子 (not equalの略) を使用する。

```yaml
{{- if ne .Values.global.env "dev" }}
  ...
{{- end }}
```

> ↪️ 参考：https://helm-playground.com/cheatsheet.html#conditionals

<br>
