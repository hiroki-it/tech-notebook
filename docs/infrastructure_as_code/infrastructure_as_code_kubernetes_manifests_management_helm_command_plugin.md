---
title: 【IT技術の知見】helmプラグイン＠コマンド
description: helmプラグイン＠コマンドの知見を記録しています。
---

# helmプラグイン＠コマンド

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. helm-dashboard

### helm-dashboardとは

`helm` コマンドで確認できる情報 (例：インストールされている Helm チャート、リビジョン履歴など) をダッシュボードで表示する。

> - https://github.com/komodorio/helm-dashboard

<br>

### セットアップ

#### ▼ インストール

```bash
$ helm plugin install https://github.com/komodorio/helm-dashboard.git
```

> - https://github.com/komodorio/helm-dashboard#installing

#### ▼ 起動

```bash
$ helm dashboard
```

> - https://github.com/komodorio/helm-dashboard#running

<br>

## 02. helm-diff

### helm-diffとは

3 方向の戦略的マージパッチを使用して、『`helm get` コマンドによる最新のリリースによるマニフェスト』『`helm template` コマンドによる現在のチャートによるマニフェスト』『前回リリース後の Helm 以外の方法によるマニフェスト』を比較する。

```bash
$ helm diff
```

> - https://github.com/databus23/helm-diff/pull/304

<br>

### セットアップ

#### ▼ インストール

```bash
$ helm plugin install https://github.com/databus23/helm-diff --version 1.0.0
```

<br>

## 03. helm-s3

Amazon S3 をチャートリポジトリとして使用するために、チャートの圧縮ファイルを Amazon S3 に送信する。

> - https://github.com/hypnoglow/helm-s3

<br>

## 04. helm-secrets

### helm-secretsとは

暗号化ツールを使用して、`values` ファイルを復号し、Secret のデータとして注入する。

また反対に、Secret のデータを復号する。

> - https://scrapbox.io/mikutas/helm-secrets%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9

<br>

### セットアップ

#### ▼ インストール

```bash
$ helm plugin install https://github.com/jkroepke/helm-secrets --version 1.0.0
```

<br>

### 使用可能なバックエンド

Secret の元となるデータを管理するバックエンドとして、以下を選べる。

- SOPS
- vals

> - https://github.com/jkroepke/helm-secrets/wiki/Secret-Backends
> - https://github.com/jkroepke/helm-secrets/wiki/Secret-Backends#list-of-implemented-secret-backends

<br>

## 04-02. バックエンドがSOPSの場合

### 注意点

#### ▼ `secrets` ファイルの名前の制限

helm-secrets には、zendesk 製 (2022/11/29 時点でメンテナンスされていない) と、zendesk 製からフォークされた jkroepke 製がある。

zendesk 製を使用している場合、SOPS の `secrets` ファイルの名前を『`secrets.yaml`』『`secrets.<任意の名前>.yaml`』とする必要がある。

一方で jkeroepke 製では、執筆時点 (2022/11/29) で、`secrets` ファイルの名前が任意である。

> - https://github.com/zendesk/helm-secrets#usage-and-examples
> - https://github.com/jkroepke/helm-secrets/wiki/Usage

<br>

### secretsサブコマンド無しの場合

#### ▼ `secrets://`

SOPS の `secrets` ファイルを指定するときに `secrets://` を使用すると、サブコマンドの `secrets` が不要になる。

```bash
$ helm template . -f secrets://foo-secrets.yaml
```

> - https://github.com/jkroepke/helm-secrets#decrypt-secrets-via-protocol-handler

#### ▼ -f

暗号化された `values` ファイル (`secrets` ファイル) と、平文の `values` ファイルを使用して、`helm` コマンドを実行する。

これにより、暗号化された値を `helm` コマンドの実行時のみ復号し、マニフェストに出力できる。

補足としてこのとき、`values` ファイル側には `secrets` ファイルの値を設定しておく必要はない。

```bash
$ helm secrets template <チャートへのパス> -f <SOPSが作成したsecretsファイルへのパス> -f foo-values.yaml
```

**＊例＊**

以下のような SOPS の `secrets` ファイルがあるとする。

```yaml
# secretsファイル
foo: F799Q8CQ...

sops:
  kms:
    - arn: arn:aws:kms:ap-northeast-1:<AWSアカウントID>:key/<KMSのID>
      created_at: '2017-12-19T11:02:39Z'
      enc: AQICA...
      aws_profile: ""

  ...

  # 暗号化時に使用したSOPSのバージョン
  version: 3.7.0
```

また、以下のような Secret があるとする。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
type: Opaque
data:
  foo: {{.Values.foo | b64enc}}
```

このとき、`helm secrets` コマンドで `secrets` ファイルを指定すると、復号したうえで `.Values` に出力してくれる。

ArgoCD が使用する SOPS のバージョンは、暗号化時に使用した SOPS のバージョン (`sops` キーの値) に合わせたほうがよい。

結果的に、base64 方式でエンコードされ、マニフェストを作成する。

```bash
$ helm secrets template . -f foo-values.yaml -f foo-secrets.yaml

apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
type: Opaque
data:
  foo: Rjc5OVE4Q1E=...
```

> - https://www.thorsten-hans.com/encrypted-secrets-in-helm-charts/

<br>

### サブコマンド

#### ▼ decrypt

指定した `values` ファイルを復号し、`.yaml.dec` ファイルに出力する。

```bash
$ helm secrets decrypt <暗号化されたvaluesファイル>

Decrypting ./values/secrets.yaml
```

```yaml
# .yaml.decファイル
db:
  user: root
  password: password
```

> - https://qiita.com/knqyf263/items/4bb1c961037d0ea55a62

#### ▼ encrypt

指定した `values` ファイルを暗号化し、元の `values` ファイルを上書きする。

```bash
$ helm secrets encrypt <平文のvaluesファイル>

Encrypted ./values/secrets.yaml
```

```bash
$ cat ./values/secrets.yaml

# secretsファイル
db:
  user: *****
  password: *****

# SOPSキーが追記される。
sops:
  ...
```

> - https://qiita.com/knqyf263/items/4bb1c961037d0ea55a62

<br>
