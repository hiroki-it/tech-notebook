---
title: 【IT技術の知見】JMeter＠総合テスト
description: JMeter＠総合テストの知見を記録しています。
---

# JMeter＠総合テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

JMeterをインストールし、環境を作成する。

> - https://jmeter.apache.org/download_jmeter.cgi

<br>

## 02. JMeterの仕組み

### アーキテクチャ

JMeterは、以下のコンポーネントから構成されている。

![jmeter_architecuture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/jmeter_architecuture.png)

> - https://www.guru99.com/jmeter-element-reference.html

<br>

### パラメーター

#### ▼ 全体像

![stress-test_parameter](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/stress-test_parameter.png)

> - https://tech-blog.rakus.co.jp/entry/2017/08/24/111332

#### ▼ スレッド数

リクエストのユーザー数に相当する。

#### ▼ ループ数

ユーザー当たりのリクエスト送信数に相当する。

#### ▼ ランプアップ秒

リクエストを送信する期間に相当する。

長くし過ぎすると、全てのリクエスト数を送信するまでに時間がかかるため、負荷が小さくなる。

<br>

## 03. ユースケース

### ロードテスト

以下の手順で、JMeterを使用したロードテストを実施する。

`【１】`

: URLのアクセスランキングを元に、リクエストを送信するためのURLリストを`csv`ファイルで作成する。Googleを参考にしたが、ALBアクセスログを参考にした方が、より正確かもしれない。

`【２】`

: JMeterのGUI版にて、シナリオ (`jmx`ファイル) を作成する。スループットコントローラーでURLリスト (`csv`ファイル) をJMeterのビルトイン関数で読み込むようにする。csvファイルのリストからランダムに読み出したい場合は、Random関数が適している。スレッド数が例えば`10000`個といった高負荷であると、ローカルマシンがフリーズするため注意すること。

> - https://jmeter.apache.org/usermanual/functions.html#__Random

`【３】`

: AWSリソースのスペック、VPNなど、ロードテストの周辺準備が整っていることを確認する。

`【４】`

: JMeterのCUI版のバイナリファイルに、`jmx`ファイルをドラッグ＆ドロップし、テストを実施する。または、バイナリファイルへのパスを通した上で、以下のコマンドでも実行できる。

```bash
$ jmeter -n \
    -t <JMXファイルへのパス> \
    -l <Resultファイルへのパス> \
    -e \
    -o <レポートファイルへのパス>
```

ここで、GUI版を使用しない理由は、コマンドの結果に表示される説明より、GUI版では正しい結果を得られないとのこと、のためである。

```bash
# コマンドの結果
Don't use GUI mode for load testing !, only for Test creation and Test debugging.For load testing, use CLI Mode (was NON GUI):
```

`【５】`

: テストを開始後に、結果 (`jtl`ファイル) とログ (`log`ファイル) が作成され、テストが終了するまで追記されていく。

`【６】`

: テストを修正して新しく実行したい場合、`jmx`ファイル、`jtl`ファイル、logファイルをコピーして、バックアアップしておく。

`【７】`

: JMeterのGUI版にて、スレッドグループに、結果をツリーで表示、結果を表で表示、のリスナーを追加する。これらの画面で、`jtl`ファイルを読み込むと、`jtl`ファイルに基づく集計データを得られる。

`【８】`

: 各種のCloudWatchメトリクスにて、テスト時間帯に着目し、プロットから、数値を読み取る。

<br>

### ストレステスト

記入中...

<br>
