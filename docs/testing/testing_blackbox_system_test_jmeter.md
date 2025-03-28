---
title: 【IT技術の知見】JMeter＠システムテスト
description: JMeter＠システムテストの知見を記録しています。
---

# JMeter＠システムテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### yumリポジトリから

```bash
$ yum install java-1.8.0-openjdk

$ wget http://ftp.meisei-u.ac.jp/mirror/apache/dist//jmeter/binaries/apache-jmeter-5.2.1.tgz

$ tar xvzf apache-jmeter-5.2.1.tgz
```

> - https://jmeter.apache.org/download_jmeter.cgi
> - https://bbh.bz/2020/04/13/how-to-use-jmeter-at-linux/

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

## 03. ロードテスト (負荷テスト)

### 実行

以下の手順で、JMeterを使用したロードテストを実施する。

`(1)`

: URLのアクセスランキングを元に、リクエストを送信するためのURLリストを`csv`ファイルで作成する。Googleを参考にしたが、ALBアクセスログを参考にした方が、より正確かもしれない。

`(2)`

: JMeterのGUI版にて、シナリオ (`jmx`ファイル) を作成する。スループットコントローラーでURLリスト (`csv`ファイル) をJMeterのビルトイン関数で読み込むようにする。

     csvファイルのリストからランダムに読み出したい場合は、Random関数が適している。スレッド数が例えば`10000`個といった高負荷であると、ローカルマシンがフリーズするため注意すること。

> - https://jmeter.apache.org/usermanual/functions.html#__Random

`(3)`

: AWSリソースのスペック、VPNなど、ロードテストの周辺準備が整っていることを確認する。

`(4)`

: JMeterのCUI版のバイナリファイルに、`jmx`ファイルをドラッグ＆ドロップし、テストを実施する。

     または、バイナリファイルへのパスを通した上で、以下のコマンドでも実行できる。

```bash
$ jmeter -n \
    -t <JMXファイルへのパス> \
    -l <Resultファイルへのパス> \
    -e \
    -o <レポートファイルへのパス>
```

ここで、GUI版を使用しない理由は、コマンドの結果に表示される説明より、GUI版では正しい結果を得られないとのことのためである。

```bash
# コマンドの結果
Don't use GUI mode for load testing !, only for Test creation and Test debugging.For load testing, use CLI Mode (was NON GUI):
```

`(5)`

: テストを開始後に、結果 (`jtl`ファイル) とログ (`log`ファイル) が作成され、テストが終了するまで追記されていく。

`(6)`

: テストを修正して新しく実行したい場合、`jmx`ファイル、`jtl`ファイル、logファイルをコピーして、バックアアップしておく。

<br>

### 結果の評価

`(7)`

: JMeterのGUI版にて、スレッドグループに、結果をツリーで表示、結果を表で表示のリスナーを追加する。

     これらの画面で、`jtl`ファイルを読み込むと、`jtl`ファイルに基づく集計データを得られる。

`(8)`

: 各種のAWS CloudWatch Metricsにて、テスト時間帯に着目し、プロットから、数値を読み取る。

<br>

## 04. ストレステスト

記入中...

<br>
