---
title: 【IT技術の知見】Amazon EC2＠AWSリソース
description: Amazon EC2＠AWSリソースの知見を記録しています。
---

# Amazon EC2＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Amazon EC2：Elastic Compute Cloud

### Amazon EC2 とは

クラウドサーバーとして働く。

注意点があるものだけまとめる。

ベストプラクティスについては、以下のリンクを参考にせよ。

> - [Best practices for Amazon EC2 - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-best-practices.html)

<br>

## 01-02. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>AWS AMI：Amazon マシンイメージ</td>
      <td>AWS AMI を選択する。</td>
      <td></td>
    </tr>
    <tr>
      <td>インスタンスタイプ</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Amazon EC2 の数</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>ネットワーク</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>サブネット</td>
      <td>Amazon EC2 を配置するサブネットを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>自動割り当て IP アドレス</td>
      <td>Amazon EC2 へのパブリック IP アドレスの割り当てを有効化する。</td>
      <td>Amazon EC2 作成後に有効にできない。</td>
    </tr>
    <tr>
      <td>キャパシティの予約</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>ドメイン結合ディレクトリ</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>AWS IAM ロール</td>
      <td>Amazon EC2 に付与する AWS IAM ロールを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>シャットダウン動作</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>終了保護</td>
      <td>Amazon EC2 の削除を防ぐ。</td>
      <td>必ず有効化すること。</td>
    </tr>
    <tr>
      <td>モニタリング</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>テナンシー</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Elastic Inference</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>クレジット仕様</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>ストレージ</td>
      <td>Amazon EC2 のストレージを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>キーペア</td>
      <td>SSH 公開鍵認証のため、Amazon EC2 の秘密鍵とペアになる公開鍵をインストールできる。</td>
      <td>・AWS SSM Session Manager を使用して Amazon EC2 に接続する場合は、キーペアの作成は不要である。<br>・キーペアは、Amazon EC2 の最初の作成時しか作成できず、後から作成できない。<br>・キーペアに割り当てられるフィンガープリント値を調べることにより、公開鍵と秘密鍵の対応関係を調べられる。</td>
    </tr>
  </tbody>
</table>

<br>

### ダウンタイム

#### ▼ ダウンタイムの発生条件

以下の条件のとき、Amazon EC2 にダウンタイムが発生する。

Amazon EC2 を冗長化している場合は、ユーザーに影響を与えずに対処できる。

ダウンタイムが発生するほうのインスタンスを事前に ALB のターゲットグループから解除しておき、停止したインスタンスが起動した後に、ターゲットグループに再登録する。

<table>
  <thead>
    <tr>
      <th>変更する項目</th>
      <th>ダウンタイムの有無</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>インスタンスタイプ</td>
      <td>あり</td>
      <td>インスタンスタイプを変更するためには Amazon EC2 を停止する必要がある。そのため、ダウンタイムが発生する。</td>
    </tr>
    <tr>
      <td>ホスト物理サーバーのリタイアメント</td>
      <td>あり</td>
      <td>AWS から定期的にリタイアメントに関する警告メールが届く。ルートデバイスタイプが『AWS EBS』の場合、ホスト物理サーバーの引っ越しを実行するために Amazon EC2 の停止と起動が必要である。そのため、ダウンタイムが発生する。注意点として、再起動では引っ越しできない。</td>
    </tr>
  </tbody>
</table>

<br>

### インスタンスタイプ

#### ▼ 要素

インスタンス世代の数字が上がるにつれて、より小さなインスタンス世代と同じ大きさであっても、性能が上がり、金銭的コストが下がる。

<table>
  <thead>
    <tr>
      <th><nobr><code>&lt;ファミリー&gt;&lt;世代&gt;&lt;追加機能&gt;.&lt;サイズ&gt;</code></nobr><br>(例: <code>c5d.xlarge</code>)</th>
      <th>説明</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>インスタンスファミリー</td>
      <td>適するアプリケーションのドメインやハードウェアの種類を表す。</td>
      <td><code>t</code>,<code>a</code> など</td>
    </tr>
    <tr>
      <td>インスタンス世代</td>
      <td>同じインスタンスファミリー内での新しさを表す。</td>
      <td><code>2</code>、<code>3</code>、<code>4</code> など</td>
    </tr>
    <tr>
      <td>属性</td>
      <td>CPU の種類を表す。</td>
      <td><code>a</code> (AMD CPU)、<code>g</code> (Graviton CPU) 、<code>i</code>(Intel CPU) など</td>
    </tr>
    <tr>
      <td>インスタンスサイズ</td>
      <td>インスタンスのハードウェアリソースの大きさを表す。</td>
      <td><code>nano</code>、<code>small</code>、<code>medium</code>、<code>large</code>、<code>xlarge</code>、<code>2xlarge</code> など</td>
    </tr>
  </tbody>
</table>

> - https://pages.awscloud.com/rs/112-TZM-766/images/C2-07.pdf#page=24

AWS AMI の OS のバージョンによっては、新しく登場したインスタンスタイプを適用できないことがあるため注意する。

例えば、CentOS 6 系の AWS AMI では、`t3.small` を選択できない。

> - [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-gkh3rqhqbgzme?ref=cns_srchrow)

#### ▼ CPU バーストモード

バーストモードのインスタンスタイプの場合、一定水準のベースライン CPU 使用率を提供しつつ、これを超過できる。

CPU 使用率がベースラインを超えたとき、超過した分だけ Amazon EC2 は CPU クレジットを消費する。

CPU クレジットは一定の割合で回復する。

蓄積できる最大 CPU クレジット、クレジットの回復率、ベースライン CPU 使用率は、インスタンスタイプによって異なる。

詳しくは以下のリンクを参考にせよ。

> - [Burstable performance instances - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-performance-instances.html)

#### ▼ アプリケーションのドメインに合わせたインスタンスタイプ

<table>
  <thead>
    <tr>
      <th>アプリケーションのドメイン例</th>
      <th>ドメインの特長</th>
      <th>ファミリー</th>
      <th>世代</th>
      <th>インスタンスサイズ</th>
      <th>おすすめ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ほとんどのアプリケーションサーバー</td>
      <td>いろいろ</td>
      <td><code>M</code> 系</td>
      <td rowspan="12">世代数は大きいほど高性能で値段も安い。そのため、その時点で一番新しい世代を選ぶ。</td>
      <td rowspan="12">サイズが一つ大きくなると、ハードウェアリソーススペックと料金が <code>2</code> 倍になる。ネットワーク帯域はあまり変わらない。アプリケーションが必要とするサイズを選ぶ。</td>
      <td>★</td>
    </tr>
    <tr>
      <td>ハードウェアリソース要求がスパイクするような、ほとんどのアプリケーションサーバー</td>
      <td>スパイク系</td>
      <td><code>T</code> 系</td>
      <td>★★</td>
    </tr>
    <tr>
      <td>Web サーバー、HPC、バッチ処理、広告配信、動画エンコーディング、ゲームサーバー、モデリング、分散分析</td>
      <td>CPU 消費系</td>
      <td><code>C</code> 系</td>
      <td></td>
    </tr>
    <tr>
      <td>NoSQL、インメモリ DB、データウェアハウス</td>
      <td>ストレージ I/O 消費系</td>
      <td><code>H</code> 系</td>
      <td></td>
    </tr>
    <tr>
      <td>NoSQL、インメモリ DB、データウェアハウス</td>
      <td>ストレージ I/O 消費系</td>
      <td><code>I</code> 系</td>
      <td></td>
    </tr>
    <tr>
      <td>高性能 DB サーバー、キャッシュサーバー、ビッグデータ処理</td>
      <td>メモリ消費系</td>
      <td><code>R</code> 系</td>
      <td></td>
    </tr>
    <tr>
      <td>高性能 DB サーバー、キャッシュサーバー、ビッグデータ処理</td>
      <td>メモリ消費系</td>
      <td><code>X</code> 系</td>
      <td></td>
    </tr>
    <tr>
      <td>高性能 DB サーバー、キャッシュサーバー、ビッグデータ処理</td>
      <td>メモリ消費系</td>
      <td>ハイメモリ</td>
      <td></td>
    </tr>
    <tr>
      <td>高性能 DB サーバー、キャッシュサーバー、ビッグデータ処理</td>
      <td>メモリ消費系</td>
      <td><code>Z</code> 系</td>
      <td></td>
    </tr>
    <tr>
      <td>3D レンダリング、動画、ゲーム</td>
      <td>GPU 消費系</td>
      <td><code>G</code> 系</td>
      <td></td>
    </tr>
    <tr>
      <td>機械学習、深層学習、HPC</td>
      <td>GPU 消費系</td>
      <td><code>P</code> 系</td>
      <td></td>
    </tr>
    <tr>
      <td>ゲノム分析、リスク計算、リアルタイムビデオ処理</td>
      <td>FPGA 消費系</td>
      <td><code>F</code> 系</td>
      <td></td>
    </tr>
  </tbody>
</table>

> - https://pages.awscloud.com/rs/112-TZM-766/images/20210603-Instance_Choice_and_Graviton2.pdf#page=12
> - https://pages.awscloud.com/rs/112-TZM-766/images/C2-07.pdf#page=16
> - https://pages.awscloud.com/rs/112-TZM-766/images/C2-07.pdf#page=22
> - [インスタンスタイプ](https://aws.amazon.com/jp/ec2/instance-types/)
> - [EC2 インスタンスタイプの種類や選び方！AWS初心者向けに今一度整理 - ForgeVision Engineer Blog](https://techblog.forgevision.com/entry/aws-ec2-instance-bgr)
> - [【初心者向け】Amazon EC2インスタンスタイプの選び方は？種類ごとの特徴を解説 ｜コラム｜NURO Biz（ニューロ・ビズ）](https://biz.nuro.jp/column/aws-mama-022/)

#### ▼ ファミリーに応じたスペック範囲

<table>
  <thead>
    <tr>
      <th>ファミリー</th>
      <th>CPU 数</th>
      <th>メモリ数</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>A1</td>
      <td>1-16</td>
      <td>2-32</td>
    </tr>
    <tr>
      <td>T3</td>
      <td>2-8</td>
      <td>0.5-32</td>
    </tr>
    <tr>
      <td>T3a</td>
      <td>2-8</td>
      <td>0.5-32</td>
    </tr>
    <tr>
      <td>M5</td>
      <td>2-96</td>
      <td>8-384</td>
    </tr>
    <tr>
      <td>M5d</td>
      <td>2-96</td>
      <td>8-384</td>
    </tr>
    <tr>
      <td>M5a</td>
      <td>2-96</td>
      <td>8-384</td>
    </tr>
    <tr>
      <td>C5</td>
      <td>2-72</td>
      <td>4-144</td>
    </tr>
    <tr>
      <td>C5d</td>
      <td>2-72</td>
      <td>4-144</td>
    </tr>
    <tr>
      <td>C5n</td>
      <td>2-72</td>
      <td>5.25-192</td>
    </tr>
    <tr>
      <td>H1</td>
      <td>8-64</td>
      <td>32-256</td>
    </tr>
    <tr>
      <td>I3</td>
      <td>2-64</td>
      <td>15.25-488</td>
    </tr>
    <tr>
      <td>I3en</td>
      <td>2-96</td>
      <td>16-768</td>
    </tr>
  </tbody>
</table>

<br>

### ルートデバイスボリューム

#### ▼ ルートデバイスボリュームとは

Amazon EC2 では、ブロックデバイスにルートデバイスボリュームが紐づいている。

複数のブロックデバイスを用意し、それぞれを異なるルートデバイスボリュームから紐付けることもできる。

加えて、このブロックデバイスが、マウントポイントになるディレクトリ紐づいている。

つまり Amazon EC2 が作成されると、ボリューム内に保管したファイルは、ブロックデバイスを経由して、マウントポイントのディレクトリ内に作成される。

また反対に、マウント先ディレクトリ内に保管したファイルは、ルートデバイスボリューム内に保管される。

複数のルートボリュームを紐付ける場合は、最大サイズの大きなルートボリュームに紐づくルートデバイスを、サイズが大きくなり得るディレクトリへマウントするようにしておく。

> - [Root volumes for your Amazon EC2 instances - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html)
> - [【 mountpoint 】コマンド――指定した場所がマウントポイントかどうかを調べる：Linux基本コマンドTips（186） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/1802/23/news024.html)

#### ▼ AWS EBS ボリューム

![ec2_ebs-backed-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ec2_ebs-backed-instance.png)

名前がややこしいが、Amazon EC2 における仮想ストレージに相当し、仮想ボリュームではない。

AWS EBS で保管されているルートデバイスボリュームで、推奨の方法である。

インスタンスストアボリュームとは異なり、コンピューティングとして動作する Amazon EC2 と、ストレージとして動作するルートデバイスボリュームが分離されている。

そのため、Amazon EC2 が誤って削除されてしまったとしても、ボリュームは削除されずに、データを守れる。

また、両者が分離されていないインスタンスボリュームと比較して、再起動が早いため、再起動に伴うダウンタイムが短い。

> - [Root volumes for your Amazon EC2 instances - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html#RootDeviceStorageConcepts)
> - [AMI types and characteristics in Amazon EC2 - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device)
> - [Root volumes for your Amazon EC2 instances - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html#Using_RootDeviceStorage)

#### ▼ インスタンスストアボリューム

![ec2_instance-store-backed-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ec2_instance-store-backed-instance.png)

名前がややこしいが、Amazon EC2 における仮想ストレージに相当し、仮想ボリュームではない。

インスタンスストアで保管されているルートデバイスボリュームで、非推奨の方法である。

AWS EBS ボリュームとは異なり、コンピューティングとして動作する Amazon EC2 内にルートデバイスボリュームが存在している。

そのため、インスタンスストアボリュームは、Amazon EC2 を削除すると一緒に削除されてしまう。

> - [Root volumes for your Amazon EC2 instances - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html#RootDeviceStorageConcepts)
> - [AMI types and characteristics in Amazon EC2 - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device)

<br>

### Amazon EC2 のライフサイクルフェーズ

![aws_ec2_lifecycle_phase](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_ec2_lifecycle_phase.png)

Amazon EC2 のライフサイクルにはフェーズがある。

<table>
  <thead>
    <tr>
      <th>フェーズ名</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>pending</td>
      <td>インスタンスを開始する前に必要な準備があり、これが完了していない。</td>
    </tr>
    <tr>
      <td>running</td>
      <td>インスタンスの起動が完了し、実行中である。</td>
    </tr>
    <tr>
      <td>stopping</td>
      <td>インスタンスを停止している途中である。</td>
    </tr>
    <tr>
      <td>stopped</td>
      <td>インスタンスの停止が完了した。</td>
    </tr>
    <tr>
      <td>shutting-down</td>
      <td>インスタンスを削除している途中である。</td>
    </tr>
    <tr>
      <td>terminated</td>
      <td>インスタンスの削除が完了した。</td>
    </tr>
  </tbody>
</table>

> - [Amazon EC2 instance state changes - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html)

<br>

### Amazon EC2 への接続

#### ▼ キーペアを使用した SSH 公開鍵認証

キーペアのうちの秘密鍵を使用して、対応する公開鍵を持つ Amazon EC2 に SSH 公開鍵認証でリクエストできる。

クライアントの SSH のパケットは、まずインターネットを経由して、Internet Gateway を通過する。

その後、Amazon Route 53、ALB を経由せず、そのまま Amazon EC2 へ向かう。

![ssh-port-forward](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ssh-port-forward.png)

<br>

### キーペア

#### ▼ フィンガープリント値

ローカルマシンに配置されている秘密鍵が、該当する Amazon EC2 に配置されている公開鍵とペアなのか否かを、フィンガープリント値を照合して確認する方法

```bash
$ openssl pkcs8 \
    -in <秘密鍵名>.pem \
    -inform PEM \
    -outform DER \
    -topk8 \
    -nocrypt \
      | openssl sha1 -c
```

<br>

### ユーザーデータファイル

#### ▼ ユーザーデータファイルとは

Amazon EC2 の起動時に任意のコマンドを実行できるようにする。

#### ▼ 実行タイミング

ユーザーデータの実行タイミングは、`cloud-config.service` ファイルで設定している。

ネットワークがオンラインになった後、実行する。

つまり、Amazon EC2 のプロセスに関する設定 (systemd など) の後に、ユーザーデータを実行する。

```ini
# /usr/lib/systemd/system/cloud-config.serviceファイル

[Unit]
Description=Apply the settings specified in cloud-config

# ネットワークがオンラインになった後に実行する
After=network-online.target cloud-config.target

Wants=network-online.target cloud-config.target
ConditionPathExists=!/etc/cloud/cloud-init.disabled
ConditionKernelCommandLine=!cloud-init=disabled

[Service]
Type=oneshot
ExecStart=/usr/bin/cloud-init modules --mode=config
RemainAfterExit=yes
TimeoutSec=0

# Output needs to appear in instance console output
StandardOutput=journal+console

[Install]
WantedBy=multi-user.target
```

> - [インスタンス作成時にUser Dataで指定した設定が遅れる理由 #AWS - Qiita](https://qiita.com/yamada-hakase/items/657fead978491e8db92f#2-2-cloud-configservice%E3%81%AE%E4%B8%AD%E8%BA%AB%E3%82%92%E7%A2%BA%E8%AA%8D%E3%81%99%E3%82%8B)
> - [systemd 管理のサービスをcloud-init の後に実行する \| Oji-Cloud](https://oji-cloud.net/2022/06/30/post-7063/#3_sreake_motouchi_times)

<br>

## 02. Amazon EC2 based on AWS AMI：Amazon Machine Image

### AWS AMI とは

Amazon EC2 のマシンイメージであり、Amazon EC2 の完全なコピーを作成できる。

Amazon EC2 上でアプリケーションソフトウェアを稼働させるために必要なソフトウェア (OS、ミドルウェア) と AWS EBS ボリュームの両方が内蔵されたコピーのこと。

AWS AMI を入れ替える場合、コンテナイメージと同様に Amazon EC2 を作成し直す必要がある。

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instances-and-amis.html
> - https://aws.typepad.com/sajp/2014/04/trainingfaqbest10.html
> - [AMIとsnapshotによるバックアップと復元 #AWS - Qiita](https://qiita.com/Jerid/items/c8c7b09797fc5f9f182e#ami%E3%81%A8snapshot%E3%81%AE%E9%81%95%E3%81%84)

<br>

### AWS AMI タイプ

#### ▼ AWS EBS-backed AMI

AWS EBS ボリュームを持つ Amazon EC2 を作成する AWS AMI のこと。

> - [AMI types and characteristics in Amazon EC2 - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device)

#### ▼ instance store-backed AMI

インスタンスストアボリュームを持つ Amazon EC2 を作成する AWS AMI のこと。

> - [AMI types and characteristics in Amazon EC2 - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device)

<br>

### AWS AMI の作成

AMI の作成時に再起動が基本的に必要になる。

これは無効にできる。ただし、データが欠損する恐れもある。

> - [No RebootでAMIを作成したらファイルが消えたりした #AWS - Qiita](https://qiita.com/mechamogera/items/60a23cf5a52f8ebd8417)

<br>

### AWS AMI の共有

<table>
  <thead>
    <tr>
      <th>共有先</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>特定のリージョン間</td>
      <td><code>⭕️</code></td>
    </tr>
    <tr>
      <td>特定のアカウント間</td>
      <td><code>⭕️</code></td>
    </tr>
    <tr>
      <td>すべてのアカウント間 (パブリック)</td>
      <td><code>⭕️</code></td>
    </tr>
  </tbody>
</table>

> - [Understand shared AMI usage in Amazon EC2 - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/sharing-amis.html)

<br>

### AWS AMI OS

#### ▼ AWS AMI OS とは

Linux ディストリビューション別に AWS AMI OS を配布している。

> - [AWS での Linux](https://aws.amazon.com/jp/mp/linux/)

#### ▼ Amazon Linux

Amazon EC2 を作成するために最適化された Linux のこと。

> - https://www.acrovision.jp/service/aws/?p=609

#### ▼ CentOS

ベンダー公式あるいは非公式が提供している AWS AMI が区別しにくいので、確実に公式ベンダーが提供しているもの選択すること。

> - https://wiki.centos.org/Cloud/AWS

<br>

## 03. Amazon EC2 with AWS EBS：Elastic Block Storage

### AWS EBS とは

Amazon EC2 のクラウド内蔵ストレージとして働く。

<br>

## 03-02. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ボリュームタイプ</td>
      <td>AWS EBS ボリュームの種類を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>サイズ</td>
      <td>選択したボリュームタイプでのサイズを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>IOPS (I/O per second)</td>
      <td>Amazon EC2 と AWS EBS ボリューム間の I/O 処理のリクエスト数 (個/秒) を設定する。</td>
      <td>ストレージの I/O 処理は、読み書き処理に相当する。そのため、IOPS の数値が高いほど、高速で読み書きできることを表す。<br>- <a href="https://www.idcf.jp/words/io.html">https://www.idcf.jp/words/io.html</a></td>
    </tr>
    <tr>
      <td>AZ</td>
      <td>AWS EBS ボリュームを作成する AZ。</td>
      <td>Amazon EC2 は、同じ AZ にある AWS EBS ボリュームしか選択できないので注意する。</td>
    </tr>
    <tr>
      <td>暗号化</td>
      <td>Amazon EC2 と AWS EBS ボリューム間の I/O 処理を暗号化するか否かを設定する。</td>
      <td>・<a href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html">https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html</a></td>
    </tr>
  </tbody>
</table>

<br>

### AWS EBS ボリュームタイプとサイズ

#### ▼ AWS EBS ボリュームの種類

<table>
  <thead>
    <tr>
      <th>AWS EBS ボリュームタイプ</th>
      <th>対応する物理ストレージ</th>
      <th>IOPS (読み書き処理の毎秒リクエスト数)</th>
      <th>スループット</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>汎用 SSD (<code>gp2</code>)</td>
      <td rowspan="4">SSD</td>
      <td>サイズに応じて、自動的に設定される。</td>
      <td>設定できない。</td>
    </tr>
    <tr>
      <td>汎用 SSD (<code>gp3</code>)</td>
      <td>サイズに関係なく、設定できる。</td>
      <td>サイズに関係なく、設定できる。</td>
    </tr>
    <tr>
      <td>プロビジョンド IOPS SSD (<code>io1</code>)</td>
      <td>サイズに関係なく、設定できる。</td>
      <td>設定できない。</td>
    </tr>
    <tr>
      <td>プロビジョンド IOPS SSD (<code>io2</code>)</td>
      <td>サイズに関係なく、設定できる。</td>
      <td>設定できない。</td>
    </tr>
    <tr>
      <td>Cold HDD</td>
      <td rowspan="3">HDD</td>
      <td>サイズに応じて、自動的に設定される。</td>
      <td>サイズに応じて、自動的に設定される。</td>
    </tr>
    <tr>
      <td>スループット最適化 HDD</td>
      <td>設定できない。</td>
      <td>サイズに応じて、自動的に設定される。</td>
    </tr>
    <tr>
      <td>マグネティック</td>
      <td>設定できない。</td>
      <td>設定できない。</td>
    </tr>
  </tbody>
</table>

#### ▼ 下限のサイズ

一般的なアプリケーションであれば、最低限 `20`～`30`GiB のサイズがあるとよい。

しかし、踏み台サーバー (Amazon EC2) の場合、プライベートサブネットに接続するための足場としての用途しかなく、大きなサイズの AWS EBS ボリュームを組み込む必要がない。

そこでできるだけ最小限のボリュームを選択し、ストレージ合計を抑える必要がある。

OS によって下限ボリュームサイズが異なることに注意する。

<table>
  <thead>
    <tr>
      <th>OS</th>
      <th>仮想メモリ</th>
      <th>下限 AWS EBS ボリュームサイズ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Amazon Linux</td>
      <td><code>t2.micro</code></td>
      <td><code>8</code></td>
    </tr>
    <tr>
      <td>CentOS</td>
      <td><code>t2.micro</code></td>
      <td><code>10</code></td>
    </tr>
  </tbody>
</table>

#### ▼ 現在の空き容量の確認

AWS EBS ボリュームの現在の空き容量を確認するためには、`df` コマンドでパーティションの使用率を確認するか、cloudwatch エージェントでこのデータを収集する必要がある。

```bash
[ec2-user ~]$ df -hT /dev/xvda1

# パーティションの使用率が15%であることから、AWS EBSボリュームの使用率がわかる。
Filesystem     Type      Size  Used Avail Use% Mounted on
/dev/xvda1     xfs       8.0G  1.2G  6.9G  15% /
```

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-describing-volumes.html

<br>

### AWS EBS ボリュームの拡張

#### ▼ サイズの拡張

サイズを拡張するためには、実際のストレージ (AWS EBS ボリューム) 、AWS EBS ボリューム内のパーティション、Amazon EC2 内のファイルシステムについて作業する必要がある。

**＊例＊**

`(1)`

: 任意で、バックアップのために拡張対象の Amazon EC2 の AWS AMI を作成しておく。

`(2)`

: Amazon EC2 の AWS EBS ボリュームを `8`GiB から `16`GiB に拡張する例を考える。

     `lsblk`コマンドで現在のボリュームのサイズを確認すると、AWS EBSボリュームが`8`GiBである。

     この時、AWS EBSボリューム内にパーティションがある。

     `df`コマンドでパーティションのサイズを確認すると、同じく`8`GiBである。

```bash
$ lsblk

NAME    MAJ:MIN   RM   SIZE   RO   TYPE   MOUNTPOINT
xvda      202:0    0     8G    0   disk              # ストレージ (AWS EBSボリュームのルートボリューム)
└─xvda1   202:1    0     8G    0   part   /          # パーティション
nvme1n1   259:1    0   200G    0   disk   /var/lib   # ストレージ (AWS EBSボリュームの追加ボリューム)
...
```

```bash
$ df -h

Filesystem     Size   Used  Avail  Use%   Mounted on
/dev/xvda1       8G   1.9G    14G   12%   /           # パーティション
/dev/nvme1n1   200G   161G    40G   81%   /var/lib
...
```

`(3)`

: コンソール画面から、AWS EBS ボリュームを `16`GiB に拡張する。

     この時、ダウンタイムは発生しない。

     改めて`lsblk`コマンドを実行することで、該当のAWS EBSボリュームが拡張されたことを確認できる。

     ただ`df`コマンドで確認すると、パーティションはまだ拡張されていない。

```bash
$ lsblk

NAME          MAJ:MIN RM   SIZE  RO  TYPE  MOUNTPOINT
xvda          202:0    0    16G   0  disk             # ストレージ (AWS EBSボリュームのルートボリューム)
└─xvda1       202:1    0     8G   0  part  /          # パーティション
nvme1n1       259:1    0   200G   0  disk  /var/lib   # ストレージ (AWS EBSボリュームの追加ボリューム)
...
```

```bash
$ df -h

Filesystem     Size   Used  Avail  Use%   Mounted on
/dev/xvda1       8G   1.9G    14G   12%   /           # パーティション
/dev/nvme1n1   200G   161G    40G   81%   /var/lib
...
```

`(4)`

: パーティションに紐づくファイルシステムのタイプを確認する。今回は `ext4` タイプである。

```bash
$ df -hT

Filesystem     Type  Size  Used  Avail  Use%  Mounted on
/dev/xvda1     ext4    8G  1.9G    14G   12%  /           # ext4タイプ
/dev/nvme1n1   xfs    20G  8.0G    13G   40%  /var/lib
...
```

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/recognize-expanded-volume-linux.html#extend-file-system

#### ▼ AWS EBS ボリュームが複数のパーティションで区切られている場合

`(5)`

: `lsblk` コマンドの結果、AWS EBS ボリュームが複数のパーティションで区切られている場合、この手順が必要になる。

     今回、AWS EBSボリュームがパーティションに区切られている。

     そのため、`growpart`コマンドでパーティションの番号を指定し、パーティションのサイズを拡張する。パーティションに区切られていなければ、この手順は不要である。

```bash
# growpart <パーティションのデバイスファイル名> <パーティションの番号>
$ growpart /dev/xvda 1
```

`(6)`

: あらためて `lsblk` コマンドを実行することで、パーティションのサイズが拡張されていることを確認できる。

```bash
$ lsblk

NAME    MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvda    202:0    0  16G  0 disk            # ストレージ (AWS EBSボリューム)
└─xvda1 202:1    0  16G  0 part /          # パーティション
...
```

#### ▼ `ext4` タイプの場合

`(5)`

: ファイルシステムのサイズを拡張していく。

     もし、パーティションに紐づくファイルシステムのタイプが`ext4`タイプであった場合、`resize2fs`コマンドでパーティションのデバイスファイル名を指定し、これに紐づくファイルシステムのサイズを拡張する。

```bash
# 空きサイズの100%を使用して拡張する。
# sudo resize2fs <パーティションのデバイスファイル名>
$ sudo resize2fs /dev/xvda1
```

`(6)`

: あらためて `df` コマンドを実行することで、パーティションに紐づくファイルシステムを拡張できたことを確認できる。

```bash
$ df -hT

Filesystem  Type  Size  Used  Avail  Use%  Mounted on
/dev/xvda1  ext4   16G  1.9G    14G   12%  /var/lib     # パーティション
...
```

#### ▼ `xfs` タイプの場合

`(5)`

: ファイルシステムのサイズを拡張していく。

     もし、パーティションに紐づくファイルシステムのタイプが`xfs`タイプであった場合、`xfs_growfs`コマンドでファイルシステムのマウントポイントを指定し、ファイルシステムのサイズを拡張する。

     もし、`xfs_growfs`コマンドがない場合は、インストールする。

```bash
# xfs_growfs -d <ファイルシステムのマウントポイント名>
$ xfs_growfs -d /var/lib

# もし、xfs_growfsコマンドがない場合は、インストールする。
# yum install xfsprogs
```

`(6)`

: あらためて `df` コマンドを実行することで、パーティションに紐づくファイルシステムを拡張できたことを確認できる。

```bash
$ df -hT

Filesystem     Type  Size  Used  Avail  Use%  Mounted on
/dev/nvme1n1   xfs    20G  8.0G    13G   40%  /var/lib      # パーティション
...
```

<br>

### AWS EBS ボリュームの永続化

#### ▼ AWS EBS ボリュームの永続化とは

Amazon EC2 の初期作成時に、ストレージの追加の項目で『終了時に削除』の設定を無効化しておく。

これにより、Amazon EC2 が削除されても、AWS EBS ボリュームを削除しないようにできる。

> - [Root volumes for your Amazon EC2 instances - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html#Using_RootDeviceStorage)

#### ▼ Amazon EC2 の作成後に永続化する

Amazon EC2 の作成後に、AWS EBS ボリュームを永続化したい場合は、CLI を実行する必要がある。

```bash
$ aws ec2 modify-instance-attribute \
    --instance-id <インスタンスID>
    --block-device-mappings \
    file://example.json
```

```yaml
# example.json ファイル
[{"DeviceName": "/dev/sda1", "Ebs": {"DeleteOnTermination": "false"}}]
```

#### ▼ 注意点

Amazon EC2 に AutoScaling グループを適用している場合は、AWS EBS ボリュームを永続化しないほうがよいかもしれない。

AWS AutoScaling のスケールイン時に、削除された Amazon EC2 の AWS EBS ボリュームが削除されないため、未使用の AWS EBS ボリュームがどんどん溜まっていく問題が起こる。

> - [EBSの自動削除オフに気をつけよう #AWS - Qiita](https://qiita.com/YujiHamada3/items/c890a3de8937ea20bbb2)

<br>

### AWS EBS ボリュームのアタッチとデタッチ

#### ▼ デバイスパスの確認

AWS EBS ボリュームのデバイスパスと、OS 上での実際のデバイスパスが異なる。

例えば、`/dev/xvdb` をデバイスパスとしても、OS 上では `/dev/nvme1n1` になる。

```bash
$ df -hT

/dev/nvme1n1   xfs       100G  4.3G  96G   1% /var/lib
```

> - [EC2を開発環境にする #JavaScript - Qiita](https://qiita.com/motojouya/items/31346b968b41a10c4dd6#3-%E5%88%9D%E6%9C%9F%E5%8C%96%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%97%E3%83%88%E3%81%AE%E4%BD%9C%E6%88%90)

#### ▼ アタッチ

記入中...

> - [Attach an Amazon EBS volume to an Amazon EC2 instance - Amazon EBS](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-attaching-volume.html)

#### ▼ マルチアタッチ

ボリュームタイプが `io1` または `io2` の AWS EBS ボリュームは、複数の Amazon EC2 に横断して紐づけられる。

> - [Enable Multi-Attach for an Amazon EBS volume - Amazon EBS](https://docs.aws.amazon.com/ebs/latest/userguide/working-with-multi-attach.html)

#### ▼ デタッチ

起動中の Amazon EC2 からボリュームをアタッチする場合、`unmount` コマンドを実行する。

`target is busy` というエラーにより失敗する場合がある。その際はプロセスを停止しなければならない。結果として手順は複雑になる。

```bash
$ umount -d /dev/nvme1n1
```

代わりに、Amazon EC2 を停止したうえでボリュームをデタッチすると、コマンドを手動で実行する必要がなく簡単である。

> - [Detach an Amazon EBS volume from an Amazon EC2 instance - Amazon EBS](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-detaching-volume.html#umount-detach-volume)
> - [target is busyやdevice is busyをumountする方法 - \[Linux \[Red Hat/CentOSなど\]/サーバー\] ぺんたん info](https://pentan.info/server/linux/umount_busy.html)

<br>

### スナップショット

#### ▼ スナップショットとは

AWS EBS ボリュームのコピーのこと。

スナップショットは内部的に増分バックアップになっており、前回のスナップショットの増分を次回のスナップショットに追加する。

そのため、スナップショットの頻度が高ければ増分が少なくなり、スナップショットの作成時間が短くなる。

ソフトウェアと AWS EBS ボリュームのコピーの両方が内蔵された AWS AMI とは区別すること。

> - [Amazon EBS snapshots - Amazon EBS](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html#how_snapshots_work)
> - [EC2 AMI や EBS スナップショットの作成が遅くなる原因をトラブルシューティングする \| AWS re:Post](https://repost.aws/ja/knowledge-center/ebs-snapshot-ec2-ami-creation-slow)
> - https://aws.typepad.com/sajp/2014/04/trainingfaqbest10.html

#### ▼ セットアップ

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>リソースタイプ</td>
      <td>単一のボリュームのスナップショット、複数のボリュームを含むスナップショットのいずれを作成するかを設定する。</td>
    </tr>
    <tr>
      <td>ボリューム ID/インスタンス ID</td>
      <td>スナップショットの元になるボリューム/Amazon EC2 を設定する。</td>
    </tr>
  </tbody>
</table>

<br>

### AWS SSM Session Manager を使用したログインシェル

#### ▼ AWS SSM Session Manager を使用したログインシェル

AWS SSM Session Manager を使用して Amazon EC2 に接続し、ログインシェルを起動する。

![ec2_session-manager](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ec2_session-manager.png)

> - [Session Manager を使って Private EC2 にアクセスする方法 - galife](https://garafu.blogspot.com/2020/08/connect-private-ec2-with-ssm.html)
> - [セッションマネージャー越しにSSHアクセスすると何が嬉しいのか \| DevelopersIO](https://dev.classmethod.jp/articles/ssh-through-session-manager/)

#### ▼ systems-manager エージェント

AWS Systems Manager を使用して Amazon EC2 に接続する場合、Amazon EC2 自体に systems-manager エージェントをインストールしておく必要がある。

カスタム AMI であれば自身でインストールし、最適化された AWS AMI であれば事前にインストールされている。

> - [Find AMIs with the SSM Agent preinstalled - AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/ami-preinstalled-agent.html)

#### ▼ Amazon VPC エンドポイントの作成

<table>
  <thead>
    <tr>
      <th>Amazon VPC エンドポイントの接続先</th>
      <th>タイプ</th>
      <th>プライベート DNS 名</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Amazon EC2</td>
      <td>Interface</td>
      <td><code>ec2messages.ap-northeast-1.amazonaws.com</code></td>
      <td>ローカルマシンから Amazon EC2 にコマンドを送信するため。</td>
    </tr>
    <tr>
      <td>AWS Systems Manager</td>
      <td>Interface</td>
      <td><code>ssm.ap-northeast-1.amazonaws.com</code></td>
      <td>AWS Systems Manager のパラメーターストアに GET リクエストを送信するため。</td>
    </tr>
    <tr>
      <td>Secrets Manager</td>
      <td>Interface</td>
      <td><code>ssmmessage.ap-northeast-1.amazonaws.com</code></td>
      <td>Secrets Manager を使用するため。</td>
    </tr>
  </tbody>
</table>

> - https://aws.amazon.com/jp/premiumsupport/knowledge-center/ec2-systems-manager-vpc-endpoints/

<br>

## 04. ENI：Elastic Network Interface

### ENI とは

クラウドネットワークインターフェースとして働く。

ENI には、サブネットから IP アドレスが割り当てられている。

ENI を AWS リソースに紐づけると、ENI はその AWS リソースに IP アドレスを割り当てる。

また、Amazon EC2 のセキュリティグループも ENI に紐づいている。

ENI を再作成した場合、ENI は IP アドレスをサブネット内に一度解放し、新しい IP アドレスを ENI に紐づける。

<br>

### ENI の種類

#### ▼ プライマリーENI (`eth0`)

ENI が必要な AWS リソースには、デフォルトでプライマリーENI が紐づいている。

プライマリーENI は、Amazon EC2 から解除できない。

![aws_eni_primary-eni](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_eni_primary-eni.png)

> - [Elastic network interfaces - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#eni-basics)
> - https://crishantha.medium.com/handling-elastic-network-interface-s-enis-in-aws-part-01-9696fe6f6df0

#### ▼ セカンダリーENI (`eth1`)

プライマリーENI に加えて、セカンダリーENI を AWS リソースに紐づけられる。

セカンダリーENI は、Amazon EC2 から解除できる。

![aws_eni_secondary-eni](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_eni_secondary-eni.png)

> - [Multiple network interfaces for your Amazon EC2 instances - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/scenarios-enis.html)
> - https://crishantha.medium.com/handling-elastic-network-interface-s-enis-in-aws-part-01-9696fe6f6df0

<br>

### 紐付けられる AWS リソース

#### ▼ ALB

ENI に紐付けられた IP アドレスを、ALB に割り当てる。

#### ▼ Amazon EC2

ENI に紐付けられた IP アドレスを、Amazon EC2 に割り当てる。

- [Elastic network interfaces - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#eni-basics)

#### ▼ Fargate 環境の Amazon EC2

明言されていないため推測ではあるが、ENI に紐付けられた local インターフェースが、Fargate としての Amazon EC2 に紐付けられる。

Fargate 環境のホストが Amazon EC2 とは明言されていない。

- [詳細: Fargate データプレーン \| Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/under-the-hood-fargate-data-plane/)

#### ▼ Elastic IP

ENI に Elastic IP アドレスが紐付けられる。

この ENI を他の AWS リソースに紐付けることにより、ENI を経由して、Elastic IP を紐付けられる。

- [Elastic network interfaces - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#managing-network-interface-ip-addresses)

#### ▼ GlobalAccelerator

記入中...

#### ▼ AWS NAT Gateway

ENI に紐付けられたパブリック IP アドレスを、AWS NAT Gateway に割り当てる。

#### ▼ Amazon RDS

記入中...

#### ▼ セキュリティグループ

ENI にセキュリティグループが紐付けられる。

この ENI を他の AWS リソースに紐付けることにより、ENI を経由して、セキュリティグループを紐付けられる。

#### ▼ Amazon VPC エンドポイント

Interface 型の Amazon VPC エンドポイントとして動作する。

<br>

### Amazon VPC トラフィックミラーリング

ENI を経由して、同じ Amazon VPC 内の異なるインスタンスなどにパケットのコピーを送信する。

Amazon VPC エンドポイントを経由すれば異なる Amazon VPC に送信できる。

![vpc_traffic-mirroring](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vpc_traffic-mirroring.png)

> - [【ハンズオン】VPCトラフィクミラーリングを使ってEC2にログインせずにパケットキャプチャする方法を学ぼう#AWSSummit \| DevelopersIO](https://dev.classmethod.jp/articles/how-to-capture-packets-outside-ec2-with-vpc-traffic-mirroring/)
> - [\[アップデート\] Amazon VPC Traffic Mirroring が Gateway Load Balancer へのトラフィックの送信をサポートしました \| DevelopersIO](https://dev.classmethod.jp/articles/amazon-vpc-traffic-mirroring-supports-sending-mirrored-traffic-gateway-load-balancer/)

<br>

## 04-02. セカンダリーIP アドレス割り当て

### セカンダリーIP アドレス割り当てとは

記入中...

<br>

### IP アドレス数

<table>
  <thead>
    <tr>
      <th></th>
      <th>パブリック</th>
      <th>プライベート</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>説明</td>
      <td>ENI には、パブリック IP アドレスを割り当てられる。これらが割り当てられた ENI を AWS リソースに紐付ければ、その AWS リソースに <code>1</code> 個のパブリック IP アドレスを追加できる。</td>
      <td>ENI には、プライマリープライベート IP アドレスとセカンダリープライベート IP アドレスを割り当てられる。これらが割り当てられた ENI を AWS リソースに紐付ければ、その AWS リソースに <code>2</code> 個のプライベート IP アドレスを追加できる。</td>
    </tr>
  </tbody>
</table>

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/MultipleIP.html#ManageMultipleIP

<br>

## 04-03. IPv4 Prefix delegation

### IPv4 Prefix delegation とは

複数の CIDR (サブネット内の `*.*.*.*/28`) を ENI に割り当て、この ENI を Amazon EC2 に紐づける。

Amazon EC2 に紐づけた CIDR から IP アドレスを取得する。

使用できる IP アドレスを `16` 個の倍数で増やせる。

そのため、サブネットで `16` 個 (`*.*.*.*/28`) の連続した IP アドレスの範囲が空いている必要がある。

セカンダリーIP アドレス割り当てとは異なり、IP アドレスではなく CIDR を丸ごと ENI に割り当てられるため、Amazon EC2 内で使用可能な IP アドレス数を大きく増やせる。

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>自動割り当て</td>
      <td>予約の有無に関係なく、<code>*.*.*.*/28</code> の CIDR の数を指定し、その数だけ割り当てる。</td>
    </tr>
    <tr>
      <td>手動割り当て</td>
      <td>あらかじめサブネットに予約しておいた <code>*.*.*.*/28</code> の CIDR を指定し、割り当てる。</td>
    </tr>
  </tbody>
</table>

> - [Prefix delegation for Amazon EC2 network interfaces - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-prefix-eni.html)

<br>

### IP アドレス数

ENI に割り当てる CIDR (サブネット内の `*.*.*.*/28`) は、`16` 個の IP アドレスを持つ。

ENI には複数の CIDR を紐づけられるため、`16` 個の倍数だけ、Amazon EC2 内で取得できる IP アドレスが増える。

> - [Manage prefixes for your network interfaces - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/work-with-prefixes.html#view-prefix)

<br>

### CIDR (サブネット内の `*.*.*.*/28`) の事前予約

ENI に CIDR を手動/自動で割り当てるとき、サブネット内に断片化されていない `*.*.*.*/28` がないと、`InsufficientCidr` というエラーになる。

そこで、サブネットに CIDR (`*.*.*.*/28`) を予約しておき、これを IPv4 Prefix delegation のために使用する。

ただ、執筆時点 (2023/11/23) では、使用中のサブネットで割り当て済みセカンダリープライベート IP アドレスの分布を確認する方法がない。

サブネット内に CIDR (`*.*.*.*/28`) をいったん予約しておいて、Amazon EC2 の再作成によるセカンダリープライベート IP アドレス解放を待つとよい。

CIDR 内のセカンダリープライベート IP アドレスが使用中であっても CIDR を予約できる。

予約した CIDR 内のセカンダリープライベート IP アドレスが一度解放されれば、これを自動で再割り当てない仕組みになっている。

もちろん、サブネットを新しく作成すれば使用中のセカンダリープライベート IP アドレスがないため、その解放を待つ必要はない。

> - [Subnet CIDR reservations - Amazon Virtual Private Cloud](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-cidr-reservation.html)

<br>

### 外部のサブネットから IP アドレスを拝借する

> - [Custom Networking - EKS Best Practices Guides](https://aws.github.io/aws-eks-best-practices/networking/custom-networking/)

<br>

### CIDR の断片化の確認

ツールを使用して、CIDR が断片化されているかを確認するとよい。

```bash
$ python3 describe_unused_ips.py subnet-***

subnet_id='subnet-***' mode='normal'
cidr='*.*.*.*/*'
cidr_ips=['*.*.*.*', '*.*.*.*', ...]

-----------

# サブネットで予約したCIDRのうちで、実際に予約済みのIPアドレス
reserved_ips=['*.*.*.*', '*.*.*.*', ...]
-----------

# サブネット内で使用中のIPアドレス
used_ips=['*.*.*.*', '*.*.*.*', ...]
-----------

# サブネット内で未使用のIPアドレス
unused_ips=['*.*.*.*', '*.*.*.*', ...]
-----------

cidr=*.*.*.*/* cidr_ips=<全てのIPアドレス数> reserved=<予約されたIPアドレス数> used=<使用中のIPアドレス数> unused=<未使用のIPアドレス数>
```

> - [GitHub - shu85t/aws_describe_unused_ips: Python Script that describes Unused IPs for the specified Subnet · GitHub](https://github.com/shu85t/aws_describe_unused_ips)

<br>
