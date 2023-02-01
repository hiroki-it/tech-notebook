---
title: 【IT技術の知見】関数＠チャート
description: アクション＠チャートの知見を記録しています。
---

# 関数＠チャート

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. テンプレートを出力する関数

### テンプレートを出力する関数とは

```template```ディレクトリ配下のテンプレートを出力する。



> ℹ️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

<br>

### include

#### ▼ includeとは

```define```関数で定義したテンプレートを加工して出力する。

加工内容はパラメーターで設定できる。



> ℹ️ 参考：
>
> - https://helm.sh/docs/chart_template_guide/named_templates/#the-include-function
> - https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-include-function

<br>

### printf

#### ▼ printfとは

変数を出力する。



#### ▼ エスケープ

Helmのテンプレート内に、アクションや変数以外の理由で```{}```を出力する場合（例：Alertmanagerのアラートの変数出力の定義）、これらとして認識されないようにエスケープする必要がある。

また、エスケープする場合は必ず改行（```|```、```|-```、```|+```）で出力する必要がある。エスケープのために```printf```アクションを使用することもできる。

一方で、HelmではGoのテンプレートを使用していため、これと同じエスケープの方法（例：```{{`<記号を含む文字列全体>`}}```、```{{"<記号>"}}```）を使用できる。

エスケープしたい文字列にバッククオートが含まれる場合、『```{{`<記号を含む文字列>`}}```』を使用できず、他のエスケープ方法（```{{"<記号>"}}```、```printf```アクション）が必要になる。

> ℹ️ 参考：https://github.com/helm/helm/issues/2798#issuecomment-890478869

```yaml
# Helmのテンプレート

# Alertmanagerの通知内容の定義は以下を参考にした。
# https://www.infinityworks.com/insights/slack-prometheus-alertmanager/

...

receivers:
  - name: slack_webhook
    slack_configs:
      - channel: prd
        send_resolved: true
        api_url: https://hooks.slack.com/services/*****
        # 波括弧（{}）をエスケープするために、『{{``}}』とprintfを使用している。
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
          
...
```



<br>

### range

#### ▼ rangeとは

同じ階層にある他の```.yaml```ファイルのキーとその値を格納し、foreach関数のように出力する。



> ℹ️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

#### ▼ マップ型を扱う場合

マップ型を入力値として使用できる。



**＊実装例＊**

もし、以下のような平文ファイルがあるとする。



```yaml
# plane.yamlファイル
foo: FOO
bar: bar
```

これを```base64```方式で変換し、```values```ファイルの```config```キー配下に定義したとする。



```yaml
# valuesファイル
config: eHh4OiB5eXkKenp6OiBxcXEK
```

```fromYaml```アクションを使用して、テキスト形式を```.yaml```形式に変換する。

その後、```range```アクションでキーと値を取得し、Secretのデータとして割り当てる。



```yaml
{{ $decoded := .Values.config | b64dec | fromYaml }}
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

#### ▼ 配列型を扱う場合

配列型を入力値として使用できる。



> ℹ️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

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

<br>

### required

#### ▼ requiredとは

調査中...

> ℹ️ 参考：https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-required-function

<br>

### template

#### ▼ templateとは

```define```関数で定義したテンプレートをそのまま出力する。

```template```関数では出力内容を変数に格納できないため、これが可能な```include```関数が推奨されている。



> ℹ️ 参考：
>
> - https://helm.sh/docs/chart_template_guide/named_templates/#the-include-function
> - https://itnext.io/use-named-templates-like-functions-in-helm-charts-641fbcec38da

<br>

## 01-02. ```values```ファイルを出力する関数

### Values

#### ▼ Valuesとは

```values```ファイルの特定のキー値を出力する。

特定の条件下で、```values```ファイルを２階層以上に設定できなくなる現象の理由がわかっていない...。



> ℹ️ 参考：https://github.com/helm/helm/issues/8026

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

#### ▼ metadataキーで使用する場合の注意点

マニフェストの```.metadata.``キーの値には文字列しか設定できない。

```values```ファイルから出力した値が数字の場合、Helmは勝手にint型に変換しようとする。

そのため、metadataキーの値にint型を出力しようとしてエラーになる。

int型にならないように、```values```ファイルの出力先をダブルクオーテーションで囲うと良い。



> ℹ️ 参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/#required-fields

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

<br>

### toYaml

#### ▼ toYamlとは

```.yaml```形式でテンプレートを出力する。

```values```ファイルの複数のキー値を出力する場合に使用する。



> ℹ️ 参考：https://qiita.com/keiSunagawa/items/db0db26579d918c81457#%E9%96%A2%E6%95%B0

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
data:
  {{- toYaml .Values.parameters | nindent 2 }}
```

<br>

## 02. アクセスする関数

### アクセスする関数とは

テンプレートや```values```ファイルを出力する時に、特定の位置にアクセスする。



<br>

### ```.```（ドット）

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

### ```$```（ドル）

#### ▼ ドルとは

出力時に、```.yaml```ファイルのルートを明示的に出力する。

アクションの中でアクションで、```.yaml```ファイルのルートにアクセスしたい場合に役立つ。



> ℹ️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

**＊実装例＊**

```range```アクションを使用すると、```.yaml```ファイルへのアクセスのルートが変わってしまう。

ルートを明示することにより、```range```アクション内でも```.yaml```ファイルの正しいルートにアクセスできるようなる。



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

<br>

## 03. 除去する関数

### ```-```（ハイフン）

#### ▼ ハイフンとは

```{{-```であると、テンプレートの出力時にこれより前のインデントを削除する。

反対に、```-}}```であると改行コードを削除し、不要な改行が挿入されないようにする。

ただ、```-}}```は使用しない方が良いらしい。

> ℹ️ 参考：
>
> - https://qiita.com/keiSunagawa/items/db0db26579d918c81457#%E5%9F%BA%E6%9C%AC%E7%9A%84%E3%81%AA%E6%A7%8B%E6%96%87
> - https://github.com/helm/helm/issues/4191#issuecomment-539149037

**＊実装例＊**


```yaml
{* tplファイル *}

  {{- define "foo-template" }}

- foo: FOO
  bar: BAR

  {{- end }}
```

```yaml
baz:
  {{- include "foo-template" . }} # 『{{-』の前にあるインデントは削除される。
```

```yaml
# 結果
baz:
- foo: FOO
  bar: BAR
```

<br>

### indent

#### ▼ indentとは

改行せずに、そのままスペースを挿入した上で、内容を出力する。



> ℹ️ 参考：https://www.skyarch.net/blog/?p=16660#28

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

<br>

### nindent

#### ▼ nindentとは

改行しつつ、スペースを挿入した上で、内容を出力する。



> ℹ️ 参考：https://www.skyarch.net/blog/?p=16660#29


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


<br>

## 04. 変換する関数

### b64enc

#### ▼ b64encとは

```base64```方式でエンコードする。

Secretの```.data```キーでは、他のKubernetesリソースへの出力時に自動的に```base64```方式でデコードするようになっており、相性が良い。



**＊実装例＊**


```yaml
# values.yamlファイル
username: root
password: 12345
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
data:
  # base64方式でエンコードする。
  username: {{ .Values.username | b64enc }}
  password: {{ .Values.password | b64enc }}
```

<br>

### sha256sum

#### ▼ sha256sumとは

入力内容をハッシュ値に変換する。

SecretとConfigMapの設定値を変更した場合に、Podを配下にもつKubernetesリソース（例：Deployment、StatefulSet、DaemonSet）では、Podを再作成する必要がある。

これらのKubernetesリソースのPodTemplateの```.metadata.annotations```キーにて、テンプレートの出力を```sha256sum```に入力する。

これにより、SecretとConfigMapを変更した場合に、ハッシュ値が変更される。

そのため、PodTemplateが変更されたことになり、Podも再作成できるようになる。



> ℹ️ 参考：
>
> - https://helm.sh/docs/howto/charts_tips_and_tricks/#automatically-roll-deployments
> - https://sminamot-dev.hatenablog.com/entry/2020/03/22/130017

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
        checksum/secret: {{ include (print $.Template.BasePath "/foo-secret.yaml") . | sha256sum }}
        checksum/config: {{ include (print $.Template.BasePath "/foo-configmap.yaml") . | sha256sum }}
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
...
```

<br>

### fromYaml

#### ▼ fromYamlとは

テキスト形式を```.yaml```形式に変換する。



> ℹ️ 参考：
>
> - https://fenyuk.medium.com/helm-for-kubernetes-handling-secrets-with-sops-d8149df6eda4
> - https://stackoverflow.com/a/62832814

**＊実装例＊**

もし、以下のような平文ファイルあるとする。



```yaml
# plane.yamlファイル
foo: FOO
bar: bar
```

これを```base64```方式で変換し、```values```ファイルの```config```キー配下に定義したとする。



```yaml
# valuesファイル
config: eHh4OiB5eXkKenp6OiBxcXEK
```

```fromYaml```アクションを使用して、テキスト形式を```.yaml```形式に変換する。



```yaml
{{ $decoded := .Values.config | b64dec | fromYaml }}
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

<br>

## 05. 条件分岐

### AND条件

```and```演算子と```()```記号を使用する。



> ℹ️ 参考：https://stackoverflow.com/a/49819239

```yaml
{{- if and (eq .Values.enableFoo true) (eq .Values.enableBar true) }}
  ...
{{- end }}
```


### OR条件

```or```演算子と```()```記号を使用する。



> ℹ️ 参考：https://stackoverflow.com/a/49819239

```yaml
{{- if or (eq .Values.global.env "dev") (eq .Values.global.env "tes") }}
  ...
{{- end }}
```


<br>

## 06. コメントアウト

### Helmのコメントアウト

Helmのテンプレート内にコメントアウトを定義する。YAMLのコメントアウト（例：```#```）であると、テンプレートの出力時に、YAMLのコメントアウトとしてそのまま出力されてしまうため、注意する。


```yaml
{{- /* コメント */}}
```

> ℹ️ 参考：https://helm.sh/docs/chart_best_practices/templates/#comments-yaml-comments-vs-template-comments

<br>

### 細かな注意点

また、改行コードを削除するためのハイフン（```-}}```）は、定義しないようにする。また、```*/}}```にはスペースを含めずに、一繋ぎで定義する。

> ℹ️ 参考：https://github.com/helm/helm/issues/4191#issuecomment-417096290

```yaml
{{- /* コメント */}}
```

<br>
