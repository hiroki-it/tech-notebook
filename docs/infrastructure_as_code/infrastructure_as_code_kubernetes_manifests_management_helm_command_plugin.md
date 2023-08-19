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

`helm`コマンドで確認できる情報 (例：インストールされているHelmチャート、リビジョン履歴、など) をダッシュボードで表示する。

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

3方向の戦略的マージパッチを使用して、『`helm get`コマンドによる最新のリリースによるマニフェスト』『`helm template`コマンドによる現在のチャートによるマニフェスト』『前回リリース後のHelm以外の方法によるマニフェスト』を比較する。

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

## 03. helm-secrets

### helm-secretsとは

暗号化ツールを使用して、`values`ファイルを復号化し、Secretのデータとして注入する。

また反対に、Secretのデータを復号化する。

> - https://scrapbox.io/mikutas/helm-secrets%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9

<br>

### セットアップ

#### ▼ インストール

```bash
$ helm plugin install https://github.com/jkroepke/helm-secrets --version 1.0.0
```

<br>

### 使用可能なバックエンド

Secretの元となるデータを管理するバックエンドとして、以下を選べる。

- SOPS
- vals

> - https://github.com/jkroepke/helm-secrets/wiki/Secret-Backends
> - https://github.com/jkroepke/helm-secrets/wiki/Secret-Backends#list-of-implemented-secret-backends

<br>

## 03-02. バックエンドがSOPSの場合

### 注意点

#### ▼ `secrets`ファイルの名前の制限

helm-secretsには、zendesk製 (2022/11/29時点でメンテナンスされていない) と、zendesk製からフォークされたjkroepke製がある。

zendesk製を使用している場合、SOPSの`secrets`ファイルの名前を『`secrets.yaml`』『`secrets.<任意の名前>.yaml`』とする必要がある。

一方でjkeroepke製では、執筆時点 (2022/11/29) で、`secrets`ファイルの名前が任意である。

> - https://github.com/zendesk/helm-secrets#usage-and-examples
> - https://github.com/jkroepke/helm-secrets/wiki/Usage

<br>

### secretsサブコマンド無しの場合

#### ▼ `secrets://`

SOPSの`secrets`ファイルを指定する時に`secrets://`を使用すると、サブコマンドの`secrets`が不要になる。

```bash
$ helm template ./foo-chart -f secrets://secrets.yaml
```

> - https://github.com/jkroepke/helm-secrets#decrypt-secrets-via-protocol-handler

<br>

### -f

暗号化された`values`ファイル (`secrets`ファイル) と、平文の`values`ファイルを使用して、`helm`コマンドを実行する。

これにより、暗号化された値を`helm`コマンドの実行時のみ復号化し、マニフェストに出力できる。

補足としてこの時、`values`ファイル側には`secrets`ファイルの値を設定しておく必要はない。

```bash
$ helm secrets template <チャートへのパス> -f <SOPSが作成したsecretsファイルへのパス> -f foo-values.yaml
```

**＊例＊**

以下のようなSOPSの`secrets`ファイルがあるとする。

```yaml
# secrets.yaml
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

また、以下のようなSecretがあるとする。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: foo-secret
type: Opaque
data:
  foo: {{.Values.foo | b64enc}}
```

この時、`helm secrets`コマンドで`secrets`ファイルを指定すると、復号化した上で`.Values`に出力してくれる。

ArgoCDが使用するSOPSのバージョンは、暗号化時に使用したSOPSのバージョン (`sops`キーの値) に合わせた方が良い。

結果的に、base64方式でエンコードされ、マニフェストが作成される。

```bash
$ helm secrets template ./foo-chart -f foo-values.yaml -f foo-secrets.yaml

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

指定した`values`ファイルを復号化し、`.yaml.dec`ファイルに出力する。

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

指定した`values`ファイルを暗号化し、元の`values`ファイルを上書きする。

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

#### ▼ view

指定した`values`ファイルを復号化して取得する。

```bash
$ helm secrets view <暗号化されたvaluesファイル>

db:
  user: root
  password: password
```

> - https://qiita.com/knqyf263/items/4bb1c961037d0ea55a62

<br>
