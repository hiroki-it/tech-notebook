---
title: 【IT技術の知見】AWS EC2＠AWSリソース
description: AWS EC2＠AWSリソースの知見を記録しています。
---

# AWS EC2＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS EC2：Elastic Computer Cloud

### AWS EC2とは

クラウドサーバーとして働く。

注意点があるものだけまとめる。

ベストプラクティスについては、以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-best-practices.html

<br>

## 01-02. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

| 設定項目                      | 説明                                                                         | 補足                                                                                                                                                                                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AWS AMI：Amazonマシンイメージ | AWS AMIを選択する。                                                          |                                                                                                                                                                                                                                                                                |
| インスタンスタイプ            |                                                                              |                                                                                                                                                                                                                                                                                |
| AWS EC2の数                   |                                                                              |                                                                                                                                                                                                                                                                                |
| ネットワーク                  |                                                                              |                                                                                                                                                                                                                                                                                |
| サブネット                    | AWS EC2を配置するサブネットを設定する。                                      |                                                                                                                                                                                                                                                                                |
| 自動割り当てIPアドレス        | AWS EC2へのパブリックIPアドレスの割り当てを有効化する。                      | AWS EC2作成後に有効にできない。                                                                                                                                                                                                                                                |
| キャパシティの予約            |                                                                              |                                                                                                                                                                                                                                                                                |
| ドメイン結合ディレクトリ      |                                                                              |                                                                                                                                                                                                                                                                                |
| AWS IAMロール                 | AWS EC2に付与するAWS IAMロールを設定する。                                   |                                                                                                                                                                                                                                                                                |
| シャットダウン動作            |                                                                              |                                                                                                                                                                                                                                                                                |
| 終了保護                      | AWS EC2の削除を防ぐ。                                                        | 必ず有効化すること。                                                                                                                                                                                                                                                           |
| モニタリング                  |                                                                              |                                                                                                                                                                                                                                                                                |
| テナンシー                    |                                                                              |                                                                                                                                                                                                                                                                                |
| Elastic Inference             |                                                                              |                                                                                                                                                                                                                                                                                |
| クレジット仕様                |                                                                              |                                                                                                                                                                                                                                                                                |
| ストレージ                    | AWS EC2のストレージを設定する。                                              |                                                                                                                                                                                                                                                                                |
| キーペア                      | SSH公開鍵認証のため、AWS EC2の秘密鍵とペアになる公開鍵をインストールできる。 | ・セッションマネージャーを使用してAWS EC2に接続する場合は、キーペアの作成は不要である。<br>・キーペアは、AWS EC2の最初の作成時しか作成できず、後から作成できない。<br>・キーペアに割り当てられるフィンガープリント値を調べることにより、公開鍵と秘密鍵の対応関係を調べられる。 |

<br>

### ダウンタイム

#### ▼ ダウンタイムの発生条件

以下の条件の時にAWS EC2にダウンタイムが発生する。

AWS EC2を冗長化している場合は、ユーザーに影響を与えずに対処できる。

ダウンタイムが発生する方のインスタンスを事前にALBのターゲットグループから解除しておき、停止したインスタンスが起動した後に、ターゲットグループに再登録する。

| 変更する項目                       | ダウンタイムの有無 | 補足                                                                                                                                                                                                                                                      |
| ---------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| インスタンスタイプ                 | あり               | インスタンスタイプを変更するためにはAWS EC2を停止する必要がある。そのため、ダウンタイムが発生する。                                                                                                                                                       |
| ホスト物理サーバーのリタイアメント | あり               | AWSから定期的にリタイアメントに関する警告メールが届く。ルートデバイスタイプが『AWS EBS』の場合、ホスト物理サーバーの引っ越しを実行するためにAWS EC2の停止と起動が必要である。そのため、ダウンタイムが発生する。注意点として、再起動では引っ越しできない。 |

<br>

### インスタンスタイプ

#### ▼ 要素

インスタンス世代の数字が上がるにつれて、より小さなインスタンス世代と同じ大きさであっても、性能が上がり、金銭的コストが下がる。

| <nobr>`<ファミリー><世代><追加機能>.<サイズ>`</nobr><br>(例: `c5d.xlarge`) | 説明                                                         | 例                                                          |
| -------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| インスタンスファミリー                                                     | 適するアプリケーションのドメインやハードウェアの種類を表す。 | `t`,`a`など                                                 |
| インスタンス世代                                                           | 同じインスタンスファミリー内での新しさを表す。               | `2`、`3`、`4`など                                           |
| 属性                                                                       | CPUの種類を表す。                                            | `a` (AMD CPU)、`g` (Graviton CPU) 、`i`(Intel CPU) など     |
| インスタンスサイズ                                                         | インスタンスのハードウェアリソースの大きさを表す。           | `nano`、`small`、`medium`、`large`、`xlarge`、`2xlarge`など |

> - https://pages.awscloud.com/rs/112-TZM-766/images/C2-07.pdf#page=24

AWS AMIのOSのバージョンによっては、新しく登場したインスタンスタイプを適用できないことがあるため注意する。

例えば、CentOS 6系のAWS AMIでは、`t3.small`を選択できない。

> - https://aws.amazon.com/marketplace/pp/prodview-gkh3rqhqbgzme?ref=cns_srchrow

#### ▼ CPUバーストモード

バーストモードのインスタンスタイプの場合、一定水準のベースラインCPU使用率を提供しつつ、これを超過できる。

CPU使用率がベースラインを超えたとき、超過した分だけAWS EC2はCPUクレジットを消費する。

CPUクレジットは一定の割合で復旧する。

蓄積できる最大CPUクレジット、クレジットの復旧率、ベースラインCPU使用率は、インスタンスタイプによって異なる。

詳しくは以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-performance-instances.html

#### ▼ アプリケーションのドメインに合わせたインスタンスタイプ

| アプリケーションのドメイン例                                                                       | ドメインの特長      | ファミリー | 世代                                                                             | インスタンスサイズ                                                                                                                                        | おすすめ |
| -------------------------------------------------------------------------------------------------- | ------------------- | ---------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| ほとんどのアプリケーションサーバー                                                                 | いろいろ            | `M`系      | 世代数は大きいほど高性能で値段も安い。そのため、その時点で一番新しい世代を選ぶ。 | サイズが一つ大きくなると、ハードウェアリソーススペックと料金が`2`倍になる。ネットワーク帯域はあまり変わらない。アプリケーションが必要とするサイズを選ぶ。 | ★        |
| ハードウェアリソース要求がスパイクするような、ほとんどのアプリケーションサーバー                   | スパイク系          | `T`系      | 同上                                                                             | 同上                                                                                                                                                      | ★★       |
| Webサーバー、HPC、バッチ処理、広告配信、動画エンコーディング、ゲームサーバー、モデリング、分散分析 | CPU消費系           | `C`系      | 同上                                                                             | 同上                                                                                                                                                      |          |
| NoSQL、インメモリDB、データウェアハウス                                                            | ストレージI/O消費系 | `H`系      | 同上                                                                             | 同上                                                                                                                                                      |          |
| NoSQL、インメモリDB、データウェアハウス                                                            | ストレージI/O消費系 | `I`系      | 同上                                                                             | 同上                                                                                                                                                      |          |
| 高性能DBサーバー、キャッシュサーバー、ビッグデータ処理                                             | メモリ消費系        | `R`系      | 同上                                                                             | 同上                                                                                                                                                      |          |
| 高性能DBサーバー、キャッシュサーバー、ビッグデータ処理                                             | メモリ消費系        | `X`系      | 同上                                                                             | 同上                                                                                                                                                      |          |
| 高性能DBサーバー、キャッシュサーバー、ビッグデータ処理                                             | メモリ消費系        | ハイメモリ | 同上                                                                             | 同上                                                                                                                                                      |          |
| 高性能DBサーバー、キャッシュサーバー、ビッグデータ処理                                             | メモリ消費系        | `Z`系      | 同上                                                                             | 同上                                                                                                                                                      |          |
| 3Dレンダリング、動画、ゲーム                                                                       | GPU消費系           | `G`系      | 同上                                                                             | 同上                                                                                                                                                      |          |
| 機械学習、深層学習、HPC                                                                            | GPU消費系           | `P`系      | 同上                                                                             | 同上                                                                                                                                                      |          |
| ゲノム分析、リスク計算、リアルタイムビデオ処理                                                     | FPGA消費系          | `F`系      | 同上                                                                             | 同上                                                                                                                                                      |          |

> - https://pages.awscloud.com/rs/112-TZM-766/images/20210603-Instance_Choice_and_Graviton2.pdf#page=12
> - https://pages.awscloud.com/rs/112-TZM-766/images/C2-07.pdf#page=16
> - https://pages.awscloud.com/rs/112-TZM-766/images/C2-07.pdf#page=22
> - https://aws.amazon.com/jp/ec2/instance-types/
> - https://techblog.forgevision.com/entry/aws-ec2-instance-bgr
> - https://biz.nuro.jp/column/aws-mama-022/

#### ▼ ファミリーに応じたスペック範囲

| ファミリー | CPU数 | メモリ数  |
| ---------- | ----- | --------- |
| A1         | 1-16  | 2-32      |
| T3         | 2-8   | 0.5-32    |
| T3a        | 2-8   | 0.5-32    |
| M5         | 2-96  | 8-384     |
| M5d        | 2-96  | 8-384     |
| M5a        | 2-96  | 8-384     |
| C5         | 2-72  | 4-144     |
| C5d        | 2-72  | 4-144     |
| C5n        | 2-72  | 5.25-192  |
| H1         | 8-64  | 32-256    |
| I3         | 2-64  | 15.25-488 |
| I3en       | 2-96  | 16-768    |

<br>

### ルートデバイスボリューム

#### ▼ ルートデバイスボリュームとは

AWS EC2では、ブロックデバイスにルートデバイスボリュームが紐づいている。

複数のブロックデバイスを用意し、それぞれを異なるルートデバイスボリュームから紐付けることもできる。

加えて、このブロックデバイスが、マウントポイントになるディレクトリ紐づいている。

つまりAWS EC2が作成されると、ボリューム内に保管されたファイルは、ブロックデバイスを経由して、マウントポイントのディレクトリ内に作成される。

また反対に、マウント先ディレクトリ内に保管されたファイルは、ルートデバイスボリューム内に保管される。

複数のルートボリュームを紐付ける場合は、最大サイズの大きなルートボリュームに紐づくルートデバイスを、サイズが大きくなり得るディレクトリにマウントするようにしておく。

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html
> - https://atmarkit.itmedia.co.jp/ait/articles/1802/23/news024.html

#### ▼ AWS EBSボリューム

![ec2_ebs-backed-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ec2_ebs-backed-instance.png)

名前がややこしいが、AWS EC2における仮想ストレージに相当し、仮想ボリュームではない。

AWS EBSで保管されているルートデバイスボリュームで、推奨の方法である。

インスタンスストアボリュームとは異なり、コンピューティングとして動作するAWS EC2と、ストレージとして動作するルートデバイスボリュームが分離されている。

そのため、AWS EC2が誤って削除されてしまったとしても、ボリュームは削除されずに、データを守れる。

また、両者が分離されていないインスタンスボリュームと比較して、再起動が早いため、再起動に伴うダウンタイムが短い。

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html#RootDeviceStorageConcepts
> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device
> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html#Using_RootDeviceStorage

#### ▼ インスタンスストアボリューム

![ec2_instance-store-backed-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ec2_instance-store-backed-instance.png)

名前がややこしいが、AWS EC2における仮想ストレージに相当し、仮想ボリュームではない。

インスタンスストアで保管されているルートデバイスボリュームで、非推奨の方法である。

AWS EBSボリュームとは異なり、コンピューティングとして動作するAWS EC2内にルートデバイスボリュームが存在している。

そのため、インスタンスストアボリュームは、AWS EC2を削除すると一緒に削除されてしまう。

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html#RootDeviceStorageConcepts
> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device

<br>

### AWS EC2のライフサイクルフェーズ

![aws_ec2_lifecycle_phase](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_ec2_lifecycle_phase.png)

AWS EC2のライフサイクルにはフェーズがある。

| フェーズ名    | 説明                                                               |
| ------------- | ------------------------------------------------------------------ |
| pending       | インスタンスを開始する前に必要な準備があり、これが完了していない。 |
| running       | インスタンスの起動が完了し、実行中である。                         |
| stopping      | インスタンスを停止している途中である。                             |
| stopped       | インスタンスの停止が完了した。                                     |
| shutting-down | インスタンスを削除している途中である。                             |
| terminated    | インスタンスの削除が完了した。                                     |

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html

<br>

### AWS EC2への接続

#### ▼ キーペアを使用したSSH公開鍵認証

キーペアのうちの秘密鍵を使用して、対応する公開鍵を持つAWS EC2にSSH公開鍵認証でリクエストできる。

クライアントのSSHのパケットは、まずインターネットを経由して、Internet Gatewayを通過する。

その後、AWS Route53、ALBを経由せず、そのままAWS EC2へ向かう。

![ssh-port-forward](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ssh-port-forward.png)

<br>

### キーペア

#### ▼ フィンガープリント値

ローカルマシンに配置されている秘密鍵が、該当するAWS EC2に配置されている公開鍵とペアなのか否か、フィンガープリント値を照合して確認する方法

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

AWS EC2の起動時に任意のコマンドを実行できるようにする。

#### ▼ 実行タイミング

ユーザーデータの実行タイミングは、`cloud-config.service`ファイルで設定している。

ネットワークがオンラインになった後に実行する。

つまり、AWS EC2のプロセスに関する設定 (systemdなど) の後に、ユーザーデータを実行する。

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

> - https://qiita.com/yamada-hakase/items/657fead978491e8db92f#2-2-cloud-configservice%E3%81%AE%E4%B8%AD%E8%BA%AB%E3%82%92%E7%A2%BA%E8%AA%8D%E3%81%99%E3%82%8B
> - https://oji-cloud.net/2022/06/30/post-7063/#3_sreake_motouchi_times

<br>

## 02. AWS EC2 based on AWS AMI：Amazon Machine Image

### AWS AMIとは

AWS EC2のマシンイメージであり、AWS EC2の完全なコピーを作成できる。

AWS EC2上でアプリケーションソフトウェアを稼働させるために必要なソフトウェア (OS、ミドルウェア) とAWS EBSボリュームの両方が内蔵されたコピーのこと。

AWS AMIを入れ替える場合、コンテナイメージと同様にAWS EC2を作成し直す必要がある。

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instances-and-amis.html
> - https://aws.typepad.com/sajp/2014/04/trainingfaqbest10.html
> - https://qiita.com/Jerid/items/c8c7b09797fc5f9f182e#ami%E3%81%A8snapshot%E3%81%AE%E9%81%95%E3%81%84

<br>

### AWS AMIタイプ

#### ▼ AWS EBS-backed AMI

AWS EBSボリュームを持つAWS EC2を作成するAWS AMIのこと。

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device

#### ▼ instance store-backed AMI

インスタンスストアボリュームを持つAWS EC2を作成するAWS AMIのこと。

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device

<br>

### AWS AMIの作成

AMIの作成時に再起動が基本的に必要になる。

これを無効にできるが、データが欠損する恐れがある。

> - https://qiita.com/mechamogera/items/60a23cf5a52f8ebd8417

<br>

### AWS AMIの共有

| 共有先                          | 説明 |
| ------------------------------- | ---- |
| 特定のリージョン間              | `⭕️` |
| 特定のアカウント間              | `⭕️` |
| 全てのアカウント間 (パブリック) | `⭕️` |

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/sharing-amis.html

<br>

### AWS AMI OS

#### ▼ AWS AMI OSとは

Linuxディストリビューション別にAWS AMI OSを配布している。

> - https://aws.amazon.com/jp/mp/linux/

#### ▼ Amazon Linux

AWS EC2を作成するために最適化されたLinuxのこと。

> - https://www.acrovision.jp/service/aws/?p=609

#### ▼ CentOS

ベンダー公式あるいは非公式が提供しているAWS AMIが区別しにくいので、確実に公式ベンダーが提供しているもの選択すること。

> - https://wiki.centos.org/Cloud/AWS

<br>

## 03. AWS EC2 with AWS EBS：Elastic Block Storage

### AWS EBSとは

AWS EC2のクラウド内蔵ストレージとして働く。

<br>

## 03-02. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

| 設定項目              | 説明                                                                     | 補足                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ボリュームタイプ      | AWS EBSボリュームの種類を設定する。                                      |                                                                                                                                                        |
| サイズ                | 選択したボリュームタイプでのサイズを設定する。                           |                                                                                                                                                        |
| IOPS (I/O per second) | AWS EC2とAWS EBSボリューム間のI/O処理のリクエスト数 (個/秒) を設定する。 | ストレージのI/O処理は、読み書き処理に相当する。そのため、IOPSの数値が高いほど、高速で読み書きできることを表す。<br>- https://www.idcf.jp/words/io.html |
| AZ                    | AWS EBSボリュームを作成するAZ。                                          | AWS EC2は、同じAZにあるAWS EBSボリュームしか選択できないので注意する。                                                                                 |
| 暗号化                | AWS EC2とAWS EBSボリューム間のI/O処理を暗号化するか否かを設定する。      | ・https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html                                                                               |

<br>

### AWS EBSボリュームタイプとサイズ

#### ▼ AWS EBSボリュームの種類

| AWS EBSボリュームタイプ         | 対応する物理ストレージ | IOPS (読み書き処理の毎秒リクエスト数) | スループット                         |
| ------------------------------- | ---------------------- | ------------------------------------- | ------------------------------------ |
| 汎用SSD (`gp2`)                 | SSD                    | サイズに応じて、自動的に設定される。  | 設定できない。                       |
| 汎用SSD (`gp3`)                 | 同上                   | サイズに関係なく、設定できる。        | サイズに関係なく、設定できる。       |
| プロビジョンド IOPS SSD (`io1`) | 同上                   | サイズに関係なく、設定できる。        | 設定できない。                       |
| プロビジョンド IOPS SSD (`io2`) | 同上                   | サイズに関係なく、設定できる。        | 設定できない。                       |
| Cold HDD                        | HDD                    | サイズに応じて、自動的に設定される。  | サイズに応じて、自動的に設定される。 |
| スループット最適化 HDD          | 同上                   | 設定できない。                        | サイズに応じて、自動的に設定される。 |
| マグネティック                  | 同上                   | 設定できない。                        | 設定できない。                       |

#### ▼ 下限のサイズ

一般的なアプリケーションであれば、最低限`20`～`30`GiBのサイズがあると良い。

しかし、踏み台サーバーの場合、プライベートサブネットに接続するための足場としての用途しかなく、大きなサイズのAWS EBSボリュームを組み込む必要がない。

そこでできるだけ最小限のボリュームを選択し、ストレージ合計を抑える必要がある。

OSによって下限ボリュームサイズが異なることに注意する。

| OS           | 仮想メモリ | 下限AWS EBSボリュームサイズ |
| ------------ | ---------- | --------------------------- |
| Amazon Linux | `t2.micro` | `8`                         |
| CentOS       | `t2.micro` | `10`                        |

#### ▼ 現在の空き容量の確認

AWS EBSボリュームの現在の空き容量を確認するためには、`df`コマンドでパーティションの使用率を確認するか、cloudwatchエージェントでこのデータを収集する必要がある。

```bash
[ec2-user ~]$ df -hT /dev/xvda1

# パーティションの使用率が15%であることから、AWS EBSボリュームの使用率がわかる。
Filesystem     Type      Size  Used Avail Use% Mounted on
/dev/xvda1     xfs       8.0G  1.2G  6.9G  15% /
```

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-describing-volumes.html

<br>

### AWS EBSボリュームの拡張

#### ▼ サイズの拡張

サイズを拡張するためには、実際のストレージ (AWS EBSボリューム) 、AWS EBSボリューム内のパーティション、AWS EC2内のファイルシステム、に関して作業が必要にある。

**＊例＊**

`(1)`

: 任意で、バックアップのために拡張対象のAWS EC2のAWS AMIを作成しておく。

`(2)`

: AWS EC2のAWS EBSボリュームを`8`GiBから`16`GiBに拡張する例を考える。

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

: コンソール画面から、AWS EBSボリュームを`16`GiBに拡張する。

     この時、ダウンタイムは発生しない。

     改めて`lsblk`コマンドを実行することにより、該当のAWS EBSボリュームが拡張されたことを確認できる。

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

: パーティションに紐づくファイルシステムのタイプを確認する。今回は`ext4`タイプである。

```bash
$ df -hT

Filesystem     Type  Size  Used  Avail  Use%  Mounted on
/dev/xvda1     ext4    8G  1.9G    14G   12%  /           # ext4タイプ
/dev/nvme1n1   xfs    20G  8.0G    13G   40%  /var/lib
...
```

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/recognize-expanded-volume-linux.html#extend-file-system

#### ▼ AWS EBSボリュームが複数のパーティションで区切られている場合

`(5)`

: `lsblk`コマンドの結果、AWS EBSボリュームが複数のパーティションで区切られている場合、この手順が必要になる。

     今回、AWS EBSボリュームがパーティションに区切られている。

     そのため、`growpart`コマンドでパーティションの番号を指定し、パーティションのサイズを拡張する。パーティションに区切られていなければ、この手順は不要である。

```bash
# growpart <パーティションのデバイスファイル名> <パーティションの番号>
$ growpart /dev/xvda 1
```

`(6)`

: 改めて`lsblk`コマンドを実行することにより、パーティションのサイズが拡張されていることを確認できる。

```bash
$ lsblk

NAME    MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvda    202:0    0  16G  0 disk            # ストレージ (AWS EBSボリューム)
└─xvda1 202:1    0  16G  0 part /          # パーティション
...
```

#### ▼ `ext4`タイプの場合

`(5)`

: ファイルシステムのサイズを拡張していく。

     もし、パーティションに紐づくファイルシステムのタイプが`ext4`タイプであった場合、`resize2fs`コマンドでパーティションのデバイスファイル名を指定し、これに紐づくファイルシステムのサイズを拡張する。

```bash
# 空きサイズの100%を使用して拡張する。
# sudo resize2fs <パーティションのデバイスファイル名>
$ sudo resize2fs /dev/xvda1
```

`(6)`

: 改めて`df`コマンドを実行することにより、パーティションに紐づくファイルシステムを拡張できたことを確認できる。

```bash
$ df -hT

Filesystem  Type  Size  Used  Avail  Use%  Mounted on
/dev/xvda1  ext4   16G  1.9G    14G   12%  /var/lib     # パーティション
...
```

#### ▼ `xfs`タイプの場合

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

: 改めて`df`コマンドを実行することにより、パーティションに紐づくファイルシステムを拡張できたことを確認できる。

```bash
$ df -hT

Filesystem     Type  Size  Used  Avail  Use%  Mounted on
/dev/nvme1n1   xfs    20G  8.0G    13G   40%  /var/lib      # パーティション
...
```

<br>

### AWS EBSボリュームの永続化

#### ▼ AWS EBSボリュームの永続化とは

AWS EC2の初期作成時に、ストレージの追加の項目で『終了時に削除』の設定を無効化しておく。

これにより、AWS EC2が削除されても、AWS EBSボリュームを削除しないようにできる。

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html#Using_RootDeviceStorage

#### ▼ AWS EC2の作成後に永続化する

AWS EC2の作成後に、AWS EBSボリュームを永続化したい場合は、CLIを実行する必要がある。

```bash
$ aws ec2 modify-instance-attribute \
    --instance-id <インスタンスID>
    --block-device-mappings \
    file://example.json
```

```yaml
# example.jsonファイル
[{"DeviceName": "/dev/sda1", "Ebs": {"DeleteOnTermination": "false"}}]
```

#### ▼ 注意点

AWS EC2にAutoScalingグループを適用している場合は、AWS EBSボリュームを永続化しない方が良いかもしれない。

AWS AutoScalingのスケールイン時に、削除されたAWS EC2のAWS EBSボリュームが削除されないため、未使用のAWS EBSボリュームがどんどん溜まっていく問題が起こる。

> - https://qiita.com/YujiHamada3/items/c890a3de8937ea20bbb2

<br>

### AWS EBSボリュームのアタッチとデタッチ

#### ▼ デバイスパスの確認

AWS EBSボリュームのデバイスパスと、OS上での実際のデバイスパスが異なる。

例えば、`/dev/xvdb`をデバイスパスとしても、OS上では`/dev/nvme1n1`になる。

```bash
$ df -hT

/dev/nvme1n1   xfs       100G  4.3G  96G   1% /var/lib
```

> - https://qiita.com/motojouya/items/31346b968b41a10c4dd6#3-%E5%88%9D%E6%9C%9F%E5%8C%96%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%97%E3%83%88%E3%81%AE%E4%BD%9C%E6%88%90

#### ▼ アタッチ

記入中...

> - https://docs.aws.amazon.com/ebs/latest/userguide/ebs-attaching-volume.html

#### ▼ マルチアタッチ

ボリュームタイプが`io1`または`io2`のAWS EBSボリュームは、複数のAWS EC2に横断して紐づけられる。

> - https://docs.aws.amazon.com/ebs/latest/userguide/working-with-multi-attach.html

#### ▼ デタッチ

起動中のAWS EC2からボリュームをアタッチする場合、`unmount`コマンドを実行する。

`target is busy`というエラーが出る場合があり、プロセスを停止する必要があるため、手順が煩雑になる。

```bash
$ umount -d /dev/nvme1n1
```

代わりに、AWS EC2を停止した上でボリュームをデタッチすると、コマンドを手動で実行する必要がなく簡単である。

> - https://docs.aws.amazon.com/ebs/latest/userguide/ebs-detaching-volume.html#umount-detach-volume
> - https://pentan.info/server/linux/umount_busy.html

<br>

### スナップショット

#### ▼ スナップショットとは

AWS EBSボリュームのコピーのこと。

スナップショットは内部的に増分バックアップになっており、前回のスナップショットの増分を次回のスナップショットに追加する。

そのため、スナップショットの頻度が高ければ増分が少なくなり、スナップショットの作成時間が短くなる。

ソフトウェアとAWS EBSボリュームのコピーの両方が内蔵されたAWS AMIとは区別すること。

> - https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html#how_snapshots_work
> - https://repost.aws/ja/knowledge-center/ebs-snapshot-ec2-ami-creation-slow
> - https://aws.typepad.com/sajp/2014/04/trainingfaqbest10.html

#### ▼ セットアップ

| 設定項目                    | 説明                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| リソースタイプ              | 単一のボリュームのスナップショット、複数のボリュームを含むスナップショット、のいずれを作成するかを設定する。 |
| ボリュームID/インスタンスID | スナップショットの元になるボリューム/AWS EC2を設定する。                                                     |

<br>

### セッションマネージャーを使用したログインシェル

#### ▼ セッションマネージャーを使用したログインシェル

セッションマネージャーを使用してAWS EC2に接続し、ログインシェルを起動する。

![ec2_session-manager](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ec2_session-manager.png)

> - https://garafu.blogspot.com/2020/08/connect-private-ec2-with-ssm.html
> - https://dev.classmethod.jp/articles/ssh-through-session-manager/

#### ▼ systems-managerエージェント

AWS Systems Managerを使用してAWS EC2に接続する場合、AWS EC2自体にsystems-managerエージェントをインストールしておく必要がある。

カスタムAMIであれば自身でインストールし、最適化されたAWS AMIであれば事前にインストールされている。

> - https://docs.aws.amazon.com/systems-manager/latest/userguide/ami-preinstalled-agent.html

#### ▼ AWS VPCエンドポイントの作成

| AWS VPCエンドポイントの接続先 | タイプ    | プライベートDNS名                          | 説明                                                                   |
| ----------------------------- | --------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| AWS EC2                       | Interface | `ec2messages.ap-northeast-1.amazonaws.com` | ローカルマシンからAWS EC2にコマンドを送信するため。                    |
| AWS Systems Manager           | Interface | `ssm.ap-northeast-1.amazonaws.com`         | AWS Systems ManagerのパラメーターストアにGETリクエストを送信するため。 |
| Secrets Manager               | Interface | `ssmmessage.ap-northeast-1.amazonaws.com`  | Secrets Managerを使用するため。                                        |

> - https://aws.amazon.com/jp/premiumsupport/knowledge-center/ec2-systems-manager-vpc-endpoints/

<br>

## 04. ENI：Elastic Network Interface

### ENIとは

クラウドネットワークインターフェースとして働く。

ENIには、サブネットからIPアドレスが割り当てられている。

ENIをAWSリソースに紐づけると、ENIはそのAWSリソースにIPアドレスを割り当てる。

また、AWS EC2のセキュリティグループもENIに紐づいている。

ENIを再作成した場合、ENIはIPアドレスをサブネット内に一度解放し、新しいIPアドレスをENIに紐づける。

<br>

### ENIの種類

#### ▼ プライマリーENI (`eth0`)

ENIが必要なAWSリソースには、デフォルトでプライマリーENIが紐づいている。

プライマリーENIは、AWS EC2から解除できない。

![aws_eni_primary-eni](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_eni_primary-eni.png)

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#eni-basics
> - https://crishantha.medium.com/handling-elastic-network-interface-s-enis-in-aws-part-01-9696fe6f6df0

#### ▼ セカンダリーENI (`eth1`)

プライマリーENIに加えて、セカンダリーENIをAWSリソースに紐づけられる。

セカンダリーENIは、AWS EC2から解除できる。

![aws_eni_secondary-eni](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_eni_secondary-eni.png)

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/scenarios-enis.html
> - https://crishantha.medium.com/handling-elastic-network-interface-s-enis-in-aws-part-01-9696fe6f6df0

<br>

### 紐付けられるAWSリソース

#### ▼ ALB

ENIに紐付けられたIPアドレスを、ALBに割り当てる。

#### ▼ AWS EC2

ENIに紐付けられたIPアドレスを、AWS EC2に割り当てる。

- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#eni-basics

#### ▼ Fargate環境のAWS EC2

明言されていないため推測ではあるが、ENIに紐付けられたlocalインターフェースが、FargateとしてのAWS EC2に紐付けられる。

Fargate環境のホストがAWS EC2とは明言されていない。

- https://aws.amazon.com/jp/blogs/news/under-the-hood-fargate-data-plane/

#### ▼ Elastic IP

ENIにElastic IPアドレスが紐付けられる。

このENIを他のAWSリソースに紐付けることにより、ENIを経由して、Elastic IPを紐付けられる。

- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#managing-network-interface-ip-addresses

#### ▼ GlobalAccelerator

記入中...

#### ▼ AWS NAT Gateway

ENIに紐付けられたパブリックIPアドレスを、AWS NAT Gatewayに割り当てる。

#### ▼ RDS

記入中...

#### ▼ セキュリティグループ

ENIにセキュリティグループが紐付けられる。

このENIを他のAWSリソースに紐付けることにより、ENIを経由して、セキュリティグループを紐付けられる。

#### ▼ AWS VPCエンドポイント

Interface型のAWS VPCエンドポイントとして動作する。

<br>

### AWS VPCトラフィックミラーリング

ENIを経由して、同じAWS VPC内のインスタンスなどに、パケットのコピーを送信する。

AWS VPCエンドポイントを経由すれば異なるAWS VPCに送信することもできる。

![vpc_traffic-mirroring](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vpc_traffic-mirroring.png)

> - https://dev.classmethod.jp/articles/how-to-capture-packets-outside-ec2-with-vpc-traffic-mirroring/
> - https://dev.classmethod.jp/articles/amazon-vpc-traffic-mirroring-supports-sending-mirrored-traffic-gateway-load-balancer/

<br>

## 04-02. セカンダリーIPアドレス割り当て

### セカンダリーIPアドレス割り当てとは

記入中...

<br>

### IPアドレス数

|      | パブリック                                                                                                                                                    | プライベート                                                                                                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 説明 | ENIには、パブリックIPアドレスを割り当てられる。これらが割り当てられたENIをAWSリソースに紐付ければ、そのAWSリソースに`1`個のパブリックIPアドレスを追加できる。 | ENIには、プライマリープライベートIPアドレスとセカンダリープライベートIPアドレスを割り当てられる。これらが割り当てられたENIをAWSリソースに紐付ければ、そのAWSリソースに`2`個のプライベートIPアドレスを追加できる。 |

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/MultipleIP.html#ManageMultipleIP

<br>

## 04-03. IPv4 Prefix delegation

### IPv4 Prefix delegationとは

複数のCIDR (サブネット内の`*.*.*.*/28`) をENIに割り当て、このENIをAWS EC2に紐づける。

AWS EC2に紐づけたCIDRからIPアドレスを取得する。

使用できるIPアドレスを`16`個の倍数で増やせる。

そのため、サブネットで`16`個 (`*.*.*.*/28`) の連続したIPアドレスの範囲が空いている必要がある。

セカンダリーIPアドレス割り当てとは異なり、IPアドレスではなくCIDRを丸ごとENIに割り当てられるため、AWS EC2内で使用可能なIPアドレス数を大きく増やせる。

| 項目         | 説明                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| 自動割り当て | 予約の有無に関係なく、`*.*.*.*/28`のCIDRの数を指定し、その数だけ割り当てる。 |
| 手動割り当て | あらかじめサブネットに予約しておいた`*.*.*.*/28`のCIDRを指定し、割り当てる。 |

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-prefix-eni.html

<br>

### IPアドレス数

ENIに割り当てるCIDR (サブネット内の`*.*.*.*/28`) は、`16`個のIPアドレスを持つ。

ENIには複数のCIDRを紐づけられるため、`16`個の倍数だけ、AWS EC2内で取得できるIPアドレスが増える。

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/work-with-prefixes.html#view-prefix

<br>

### CIDR (サブネット内の`*.*.*.*/28`) の事前予約

ENIにCIDRを手動/自動で割り当てる時、サブネット内に断片化されていない`*.*.*.*/28`が無いと、`InsufficientCidr`というエラーになる。

そこで、サブネットにCIDR (`*.*.*.*/28`) を予約しておき、これをIPv4 Prefix delegationのために使用する。

ただ、執筆時点 (2023/11/23) では、使用中のサブネットで割り当て済みセカンダリープライベートIPアドレスの分布を確認する方法がない。

サブネット内にCIDR (`*.*.*.*/28`) を一旦予約しておいて、AWS EC2の再作成によるセカンダリープライベートIPアドレス解放を待つとよい。

CIDR内のセカンダリープライベートIPアドレスが使用中であってもCIDRを予約できる。

予約したCIDR内のセカンダリープライベートIPアドレスが一度解放されれば、これを自動で再割り当てない仕組みになっている。

もちろん、サブネットを新しく作成すれば使用中のセカンダリープライベートIPアドレスがないため、これの解放を待つ必要はない。

> - https://docs.aws.amazon.com/vpc/latest/userguide/subnet-cidr-reservation.html

<br>

### 外部のサブネットからIPアドレスを拝借する

> - https://aws.github.io/aws-eks-best-practices/networking/custom-networking/

<br>

### CIDRの断片化の確認

ツールを使用して、CIDRが断片化されているかを確認するとよい。

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

> - https://github.com/shu85t/aws_describe_unused_ips

<br>
