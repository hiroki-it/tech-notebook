---
title: 【IT技術の知見】チャート＠Helm
description: チャート＠Helmの知見を記録しています。
---

# チャート＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. セットアップ

### インストール

#### ▼ aptリポジトリから

> ℹ️ 参考：https://helm.sh/docs/intro/install/#from-apt-debianubuntu

```bash
$ curl https://helm.baltorepo.com/organization/signing.asc | sudo apt-key add -
$ sudo apt-get install apt-transport-https --yes
$ echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
$ sudo apt-get update
$ sudo apt-get install helm
```

<br>

## 02. index.yamlファイル

### index.yamlファイルとは

チャートリポジトリ内の各チャートアーカイブ（```.tgz```形式ファイル）のメタデータを設定する。```helm repo index```コマンドによって、```Chart.yaml```ファイルに基づいて自動作成されるため、ユーザーが設定する項目は少ない。

> ℹ️ 参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### apiVersion

#### ▼ apiVersionとは

> ℹ️ 参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### entries

#### ▼ entriesとは

> ℹ️ 参考：https://helm.sh/docs/topics/chart_repository/#the-index-file

<br>

### generated

#### ▼ generatedとは

コマンドによって```index.yaml```ファイルが作成された日付を設定する。

```yaml
generated: "2022-01-01T12:00:00.197173+09:00"
```

<br>

## 03. Chart.yamlファイル

### apiVersion

#### ▼ apiVersionとは

Helm-APIのバージョンを設定する。```apiVersion```キーの```v1```はHelmの```v2```に対応しており、```v2```は```v3```に対応している。

```yaml
apiVersion: v2
```

> ℹ️ 参考：
>
> - https://helm.sh/docs/topics/charts/#the-apiversion-field
> - https://helm.sh/docs/topics/v2_v3_migration/

<br>

### appVersion

#### ▼ appVersionとは

Kubernetes上で稼働するアプリケーションのリリースバージョンを設定する。リリースバージョンは、GitHubのリリースタグで管理した方がよく、```appVersion```キーの値は特に変更しなくても良い。

> ℹ️ 参考：https://helm.sh/docs/topics/charts/#the-appversion-field

```yaml
appVersion: <バージョンタグ>
```

<br>

### description

#### ▼ descriptionとは

チャートの説明を設定する。

```yaml
description: The chart of foo
```

<br>

### dependencies

#### ▼ dependenciesとは

依存対象のチャートを設定する。設定されたチャートは、```charts```ディレクトリにダウンロードされる。

> ℹ️ 参考：https://helm.sh/docs/topics/charts/#chart-dependencies

```yaml
dependencies:
  - name: foo
    version: 1.2.3
    repository: https://foo.example.com/foo-chart
  - name: bar
    version: 3.2.1
    repository: https://bar.example.com/bar-chart
```

<br>

### maintainers

#### ▼ maintainersとは

チャートの管理者を設定する。

```yaml
maintainers:
  - name: hiroki hasegawa
    email: example@gmail.com
    url: https://example.com
```

<br>

### name

#### ▼ nameとは

Helmで作成されるKubernetesリソースの接頭辞を設定する。

> ℹ️ 参考：https://helm.sh/docs/topics/charts/#the-chartyaml-file

```yaml
name: foo
```

<br>

### type

#### ▼ typeとは

チャートのタイプを設定する。

> ℹ️ 参考：https://helm.sh/docs/topics/charts/#chart-types

```yaml
type: application
```

<br>

### version

#### ▼ versionとは

チャートアーカイブ（```.tgz```形式ファイル）のリリースバージョンを設定する。```template```ディレクトリ配下のファイルを変更した場合に更新する。

> ℹ️ 参考：https://helm.sh/docs/topics/charts/#charts-and-versioning

```yaml
version: <バージョンタグ>
```

<br>


## 04. ```_helpers.tpl```ファイル

### ```_helpers.tpl```ファイルとは

あらゆる場所から使用できるテンプレートを設定する。汎用的なテンプレート（```metadata.labels```キーなど）の出力で使用する。

> ℹ️ 参考：https://helm.sh/docs/chart_template_guide/builtin_objects/

<br>

### ```metadata.labels```キーの出力

```_helpers.tpl```ファイルで```metadata.labels```キーのセットをテンプレートとして定義しておく。マニフェストで、これらをまとめて出力する。

```yaml
{{- define "global.template.labels" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
helm.sh/chart: {{ .Chart.Name }}
{{- end }}
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    {{ include "global.template.labels" . | indent 4 }} # まとめて出力する。

...
```

<br>


## 05. values.yaml

### 共通オプション

#### ▼ 共通オプションとは

多くの外部チャートで共通して用意されている```values```ファイルのデフォルトオプションである。共通オプションは、外部チャート内の```_help.tpl```ファイルに出力される。

> ℹ️ 参考：https://knowledge.sakura.ad.jp/23603/

#### ▼ affinity

チャート内のDeploymentの```spec.template.spec.affinity```キーに値を設定する。

#### ▼ fullnameOverride

デフォルトでは、チャートのインストールによって作成されるKubernetesリソース名は、『```＜リリース名＞-＜Chart名＞```』になる。もし、```fullnameOverride```オプションを設定していた場合、Kubernetesリソースの名前は『```＜fullnameOverrideオプションの値＞```』になる。なおチャートごとに、Kubernetesリソース名の前後に特定の文字列（例：コンポーネント名、番号、インスタンスハッシュ値）がつくことがある。```nameOverride```オプションとは独立しており、```nameOverride```オプションでチャートをインストールした後に```fullnameOverride```オプションに移行したい場合、```nameOverride```オプションによるチャートを一度アンインストールする必要がある。しかし、そのまま```fullnameOverride```オプションに移行してしまうと、```nameOverride```オプション時のKubernetesリソースが残骸として残ってしまう可能性がある。

#### ▼ image.pullPolicy

チャート内のDeploymentの```spec.template.spec.containers.imagePullPolicy```キーに値を設定する。

#### ▼ imagePullSecrets

チャート内のDeploymentの```spec.template.spec.imagePullSecrets```キーに値を設定する。

#### ▼ image.repository

チャート内のDeploymentの```spec.template.spec.containers.image```キーに値を設定する。

#### ▼ image.tag

チャート内のオプションに値を設定する。

#### ▼ ingress.annotations

チャート内のIngressの```metadata.annotations```オプションに値を設定する。

#### ▼ ingress.enabled

Ingressの作成を有効化する。

#### ▼ ingress.hosts

チャート内のIngressの```spec.rules```キーに値を設定する。

#### ▼ ingress.tls

チャート内のIngressの```spec.tls```キーに値を設定する。

#### ▼ nameOverride

デフォルトでは、チャートによって作成されるKubernetesリソース名は、『```＜リリース名＞-＜Chart名＞```』になる。もし、```nameOverride```オプションを設定していた場合、Kubernetesリソース名は『```＜リリース名＞-＜nameOverrideオプションの値＞```』になる。なおチャートごとに、Kubernetesリソース名の前後に特定の文字列（例：コンポーネント名、番号、インスタンスハッシュ値）がつくことがある。```fullnameOverride```オプションとは独立しており、```fullnameOverride```オプションでチャートをインストールした後に```nameOverride```オプションに移行したい場合、```fullnameOverride```オプションによるチャートを一度アンインストールする必要がある。しかし、そのまま```nameOverride```オプションに移行してしまうと、```fullnameOverride```オプション時のKubernetesリソースが残骸として残ってしまう可能性がある。

#### ▼ nodeSelector

チャート内のDeploymentの```spec.template.spec.nodeSelector```キーに値を設定する。

#### ▼ podSecurityContext

チャート内のDeploymentの```spec.template.spec.securityContext```キーに値を設定する。

#### ▼ replicaCount

チャート内のDeploymentの```spec.replicas```キーに値を設定する。

#### ▼ resources

チャート内のDeploymentの```spec.template.spec.containers.resources```オプションに値を設定する。

#### ▼ securityContext

チャート内のDeploymentの```spec.template.spec.containers.securityContext```オプションに値を設定する。

#### ▼ serviceAccount.create

ServiceAccountの作成を有効化する。

#### ▼ serviceAccount.annotations

チャート内のServiceAccountの```metadata.annotations```オプションに値を設定する。

#### ▼ service.type

チャート内のServiceの```spec.type```キーに値を設定する。

#### ▼ service.port

チャート内のServiceの```spec.ports.port```キーに値を設定する。

#### ▼ tolerations

チャート内のDeploymentの```spec.template.spec.tolerations```キーに値を設定する。

<br>

## 06. アクション

### アクションとは

テンプレートからマニフェストを作成するために必要な機能を提供する。

> ℹ️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

<br>

### コメントアウト

#### ▼ Helmのコメントアウト

Helmのテンプレート内にコメントアウトを定義する。YAMLのコメントアウト（例：```#```）であると、テンプレートの出力時に、YAMLのコメントアウトとしてそのまま出力されてしまうため、注意する。


```yaml
{{- /* コメント */}}
```

> ℹ️ 参考：
> 
> - https://helm.sh/docs/chart_best_practices/templates/#comments-yaml-comments-vs-template-comments

#### ▼ 細かな注意点

また、改行コードを削除するためのハイフン（```-}}```）は、定義しないようにする。また、```*/}}```にはスペースを含めずに、一繋ぎで定義する。

> ℹ️ 参考：https://github.com/helm/helm/issues/4191#issuecomment-417096290

```yaml
{{- /* コメント */}}
```


<br>

### include

#### ▼ includeとは

```define```関数で定義した文字列を加工して出力する。加工内容はパラメーターで設定できる。

> ℹ️ 参考：
>
> - https://helm.sh/docs/chart_template_guide/named_templates/#the-include-function
> - https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-include-function

<br>

### printf

#### ▼ printfとは

変数を文字列内に出力する。

#### ▼ エスケープ

Helmのテンプレート内に、アクションや変数以外の理由で```{}```を出力する場合（例：Alertmanagerのアラートの変数出力の定義）、これらとして認識されないようにエスケープする必要がある。エスケープのために```printf```アクションを使用することもできる。一方で、HelmではGoのテンプレートを使用していため、これと同じエスケープの方法（例：```{{`<記号を含む文字列全体>`}}```、```{{"<記号>"}}```）を使用できる。エスケープしたい文字列にバッククオートが含まれる場合、『```{{`<記号を含む文字列>`}}```』を使用できず、他のエスケープ方法（```{{"<記号>"}}```、```printf```アクション）が必要になる。

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

同じ階層にある他の```.yaml```ファイルのキーとその値を格納し、foreachのように出力する。ただし、```values```ファイルからキーと値の両方を出力する場合は、```range```関数を使用するとロジックが増えて可読性が低くなるため、使用しない方が良い。

> ℹ️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

```yaml
# values.yamlファイル
global:
  env: prd
  appName: foo
```

```yaml
apiVersion: apps/v1
kind: Deployment
# キーと値の両方を取得すると、ロジックが増えて可読性が低くなる。
{{- range $global := .Values.global }}
metadata:
  name: {{ $global.env }}-{{ $global.appName }}-pod
  labels:
    app.kubernetes.io/app: {{ $global.appName }}
    
    ...
    
{{- end }}
```

一方で、値のみを出力する場合は、可読性が高くなる。

> ℹ️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

```yaml
# values.yamlファイル
ipAddresses:
  - 192.168.1.1/32
  - 192.168.1.2/32
  - 192.168.1.3/32
```

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: blocked-ip-addresses-config-map
data:
  ip-addresses: |-
    {{- range .Values.ipAddresses }}
      - {{ . }} # 『.』を指定し、反復的に出力する。
    {{- end }} 
```

<br>

### required

> ℹ️ 参考：https://helm.sh/docs/howto/charts_tips_and_tricks/#using-the-required-function

<br>

### template

```define```関数で定義した文字列をそのまま出力する。```template```関数では出力内容を変数に格納できないため、これが可能な```include```関数が推奨されている。

> ℹ️ 参考：
>
> - https://helm.sh/docs/chart_template_guide/named_templates/#the-include-function
> - https://itnext.io/use-named-templates-like-functions-in-helm-charts-641fbcec38da

<br>

### Values

#### ▼ Valuesとは

チャートのルートパスにある```values.yaml```ファイル、または```helm```コマンドで指定した任意の```values```ファイルの値を出力する。特定の条件下で、```values```ファイルを２階層以上に設定できなくなる現象の理由がわかっていない...。

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

マニフェストの```metadata```キーの値には文字列しか設定できない。```values```ファイルから出力した値が数字の場合、Helmは勝手にint型に変換しようとする。そのため、metadataキーの値にint型を出力しようとしてエラーになる。int型にならないように、```values```ファイルの出力先をダブルクオーテーションで囲うと良い。

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

## 07. 出力時のパス

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

出力時に、YAMLファイルのルートを明示的に出力する。アクションの中でアクションで、YAMLファイルのルートにアクセスしたい場合に役立つ。

> ℹ️ 参考：https://helm.sh/docs/chart_template_guide/control_structures/

**＊実装例＊**

```range```アクションを使用すると、YAMLファイルへのアクセスのルートが変わってしまう。ルートを明示することにより、```range```アクション内でもYAMLファイルの正しいルートにアクセスできるようなる。

```yaml
{{- range $.Values.foo.namespaces }}
apiVersion: apps/v1
kind: Secrets
metadata:
  name: {{ $.Values.global.env }}-foo-secret
  namespace: {{ . }}
    
  ...

{{- end }}
```

<br>

## 08. 出力形式

### ```-```（ハイフン）

#### ▼ ハイフンとは

```{{-```であると、テンプレートの出力時にこれより前のインデントを削除する。反対に、```-}}```であると改行コードを削除し、不要な改行が挿入されないようにする。ただ、```-}}```は使用しない方が良いらしい。

> ℹ️ 参考：
> 
> - https://qiita.com/keiSunagawa/items/db0db26579d918c81457#%E5%9F%BA%E6%9C%AC%E7%9A%84%E3%81%AA%E6%A7%8B%E6%96%87
> - https://github.com/helm/helm/issues/4191#issuecomment-539149037

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

## 09. 変換

### b64enc

#### ▼ b64encとは

```base64```方式でエンコードする。Secretの```data```キーでは、他のKubernetesリソースへの出力時に自動的に```base64```方式でデコードするようになっており、相性が良い。

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
  username: {{ .Values.username | b64enc }}
  password: {{ .Values.password | b64enc }}
```

<br>

### sha256sum

#### ▼ sha256sumとは

入力内容をハッシュ値に変換する。SecretとConfigMapの設定値を変更した場合に、Podを配下にもつKubernetesリソース（例：Deployment、StatefulSet、DaemonSet）では、Podを再作成する必要がある。これらのKubernetesリソースのPodTemplateの```metadata.annotations```キーにて、テンプレートの出力を```sha256sum```に入力する。これにより、SecretとConfigMapを変更した場合に、ハッシュ値が変更される。そのため、PodTemplateが変更されたことになり、Podも再作成できるようになる。

> ℹ️ 参考：
> 
> - https://helm.sh/docs/howto/charts_tips_and_tricks/#automatically-roll-deployments
> - https://sminamot-dev.hatenablog.com/entry/2020/03/22/130017

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
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
        checksum/secret: {{ include (print $.Template.BasePath "/secret.yaml") . | sha256sum }}
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
