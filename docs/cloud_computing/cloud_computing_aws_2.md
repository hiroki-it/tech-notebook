---
title: 【知見を記録するサイト】AWS：Amazon Web Service
description: AWS：Amazon Web Serviceの知見をまとめました。

---

# AWS：Amazon Web Service（E）

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. EC2：Elastic Computer Cloud

### EC2とは

クラウドサーバーとして働く。注意点があるものだけまとめる。ベストプラクティスについては、以下のリンクを参考にせよ。

参考：https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-best-practices.html

<br>

### セットアップ

| 設定項目                  | 説明                                                         | 補足                                                         |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| AMI：Amazonマシンイメージ | AMIを選択する。                                              |                                                              |
| インスタンスタイプ        |                                                              |                                                              |
| EC2インスタンス数         |                                                              |                                                              |
| ネットワーク              |                                                              |                                                              |
| サブネット                |                                                              |                                                              |
| 自動割り当てIPアドレス    |                                                              | EC2インスタンス作成後に有効にできない。                      |
| キャパシティの予約        |                                                              |                                                              |
| ドメイン結合ディレクトリ  |                                                              |                                                              |
| IAMロール                 | EC2に付与するIAMロールを設定する。                           |                                                              |
| シャットダウン動作        |                                                              |                                                              |
| 終了保護                  | EC2インスタンスの削除を防ぐ。                                | 必ず有効にすること。                                         |
| モニタリング              |                                                              |                                                              |
| テナンシー                |                                                              |                                                              |
| Elastic Inference         |                                                              |                                                              |
| クレジット仕様            |                                                              |                                                              |
| ストレージ                | EC2インスタンスのストレージを設定する。                      |                                                              |
| キーペア                  | SSH接続のため、EC2インスタンスの秘密鍵に対応した公開鍵をインストールできる。 | ・Session Managerを使用してEC2インスタンスに接続する場合は、キーペアの作成は不要である。<br>・キーペアは、EC2の最初の作成時しか作成できず、後から作成できない。<br>・キーペアに割り当てられるフィンガープリント値を調べることで、公開鍵と秘密鍵の対応関係を調べられる。 |

<br>

### ダウンタイム

#### ▼ ダウンタイムの発生条件

以下の条件の時にEC2にダウンタイムが発生する。EC2を冗長化している場合は、ユーザーに影響を与えずに対処できる。ダウンタイムが発生する方のインスタンスを事前にALBのターゲットグループから解除しておき、停止したインスタンスが起動した後に、ターゲットグループに再登録する。

| 変更する項目                       | ダウンタイムの有無 | 補足                                                         |
| ---------------------------------- | ------------------ | ------------------------------------------------------------ |
| インスタンスタイプ                 | あり               | インスタンスタイプを変更するためにはEC2を停止する必要がある。そのため、ダウンタイムが発生する。 |
| ホスト物理サーバーのリタイアメント | あり               | AWSから定期的にリタイアメントに関する警告メールが届く。ルートデバイスタイプが『EBS』の場合、ホスト物理サーバーの引っ越しを行うためにEC2の停止と起動が必要である。そのため、ダウンタイムが発生する。なお、再起動では引っ越しできない。 |

<br>

### インスタンスタイプ

#### ▼ 世代と大きさ

『世代』と『大きさ』からなる名前で構成される。世代の数字が上がるにつれて、より小さな世代と同じ大きさであっても、パフォーマンスと低コストになる。AMIのOSのバージョンによっては、新しく登場したインスタンスタイプを適用できないことがあるため注意する。例えば、CentOS 6系のAMIでは、```t3.small```を選択できない。

参考：https://aws.amazon.com/marketplace/pp/prodview-gkh3rqhqbgzme?ref=cns_srchrow

|        | 機能名                                                       |
| ------ | ------------------------------------------------------------ |
| 世代   | ```t2```、```t3```、```t3a```、```t4g```、```a1```           |
| 大きさ | ```nano```、```small```、```medium```、```large```、```xlarge```、```2xlarge``` |

#### ▼ CPUバーストモード

バーストモードのインスタンスタイプの場合、一定水準のベースラインCPU使用率を提供しつつ、これを超過できる。CPU使用率がベースラインを超えたとき、超過した分だけEC2はCPUクレジットを消費する。CPUクレジットは一定の割合で回復する。蓄積できる最大CPUクレジット、クレジットの回復率、ベースラインCPU使用率は、インスタンスタイプによって異なる。詳しくは以下のリンクを参考にせよ。

参考：https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-performance-instances.html

<br>

### ルートデバイスボリューム

#### ▼ ルートデバイスボリュームとは

EC2インスタンスでは、ブロックデバイスにルートデバイスボリュームが紐づいている。複数のブロックデバイスを用意し、それぞれを異なるルートデバイスボリュームから紐づけることもできる。さらに、このブロックデバイスが、マウントポイントtになるディレクトリ紐づいている。つまりEC2インスタンスが作成されると、ボリューム内に保管されたファイルは、ブロックデバイスを経由して、マウントポイントのディレクトリ内に生成される。また反対に、マウント先ディレクトリ内に保存されたファイルは、ルートデバイスボリューム内に保管される。複数のルートボリュームを紐づける場合は、最大サイズの大きなルートボリュームに紐づくルートデバイスを、サイズが大きくなり得るディレクトリにマウントするようにしておく。

参考：

- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html
- https://atmarkit.itmedia.co.jp/ait/articles/1802/23/news024.html

#### ▼ EBSボリューム

![ec2_ebs-backed-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ec2_ebs-backed-instance.png)

EBSで保管されているルートデバイスボリュームで、推奨の方法である。インスタンスストアボリュームとは異なり、コンピューティングとして機能するEC2インスタンスと、ストレージとして機能するルートデバイスボリュームが分離されている。そのため、EC2インスタンスが誤って削除されてしまったとしても、ボリュームは削除されずに、データを守れる。また、両者が分離されていないインスタンスボリュームと比較して、再起動が早いため、再起動に伴うダウンタイムが短い。

参考：

- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html#RootDeviceStorageConcepts
- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device
- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html#Using_RootDeviceStorage

#### ▼ インスタンスストアボリューム

![ec2_instance-store-backed-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ec2_instance-store-backed-instance.png)

インスタンスストアで保管されているルートデバイスボリュームで、非推奨の方法である。EBSボリュームとは異なり、コンピューティングとして機能するEC2インスタンス内にルートデバイスボリュームが存在している。そのため、インスタンスストアボリュームは、EC2インスタンスが終了すると一緒に削除されてしまう。

参考：

- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html#RootDeviceStorageConcepts
- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device

<br>

### キーペア

#### ▼ フィンガープリント値

ローカルマシンに配置されている秘密鍵が、該当するEC2に配置されている公開鍵とペアなのかどうか、フィンガープリント値を照合して確認する方法

```bash
$ openssl pkcs8 \
    -in <秘密鍵名>.pem \
    -inform PEM \
    -outform DER \
    -topk8 \
    -nocrypt | openssl sha1 -c
```

<br>

### EC2インスタンスへの接続

#### ▼ キーペアを使用したSSH接続

キーペアのうちの秘密鍵を使用して、対応する公開鍵を持つEC2インスタンスにSSH接続でアクセスできる。クライアントのSSHプロトコルのパケットは、まずインターネットを経由して、Internet Gatewayを通過する。その後、Route53、ALBを経由せず、そのままEC2へ向かう。

![ssh-port-forward](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ssh-port-forward.png)

#### ▼ Session Managerを使用したログインシェル起動

![ec2_session-manager](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ec2_session-manager.png)

| VPCエンドポイントの接続先 | プライベートDNS名                              | 説明                                                        |
| ------------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| EC2                       | ```ec2messages.ap-northeast-1.amazonaws.com``` | ローカルマシンからEC2インスタンスにコマンドを送信するため。 |
| Parameter Store           | ```ssm.ap-northeast-1.amazonaws.com```         | Parameter StoreにGETリクエストを送信するため。              |
| Secrets Manager           | ```ssmmessage.ap-northeast-1.amazonaws.com```  | Secrets Managerの機能を使用するため。                       |

Session Managerを使用してEC2インスタンスに接続し、ログインシェルを起動する。System Managerを使用してEC2インスタンスに接続する場合、EC2インスタンス自体にsystems-managerエージェントをインストールしておく必要がある。

参考：

- https://aws.amazon.com/jp/premiumsupport/knowledge-center/ec2-systems-manager-vpc-endpoints/
- https://garafu.blogspot.com/2020/08/connect-private-ec2-with-ssm.html
- https://dev.classmethod.jp/articles/ssh-through-session-manager/

<br>

## 01-02. EC2 based on AMI：Amazon Machine Image

### AMIとは

EC2インスタンスのマシンイメージであり、EC2インスタンス上でアプリケーションソフトウェアを稼働させるために必要なソフトウェア（OS、ミドルウェア）とEBSボリュームのコピーが内蔵されたテンプレートである。

参考：

- https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instances-and-amis.html
- https://aws.typepad.com/sajp/2014/04/trainingfaqbest10.html

<br>

### AMIタイプ

#### ▼ EBS-backed AMI

EBSボリュームを持つEC2インスタンスを作成するAMIのこと。

参考：https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device

#### ▼ instance store-backed AMI

インスタンスストアボリュームを持つEC2インスタンスを作成するAMIのこと。

参考：https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device

<br>

### AMI OS

#### ▼ Amazon Linux

#### ▼ CentOS

ベンダー公式あるいは非公式が提供しているAMIが区別しにくいので、確実に公式ベンダーが提供しているもの選択すること。

参考： https://wiki.centos.org/Cloud/AWS

<br>

## 01-03. EC2 with EBS：Elastic Block Storage

### EBSとは

EC2インスタンスのクラウド内蔵ストレージとして働く。

<br>

### セットアップ

| 設定項目         | 説明                                                        | 補足                                                         |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| ボリュームタイプ | EBSボリュームの種類を設定する。                             |                                                              |
| サイズ           | 選択したボリュームタイプでのサイズを設定する。               |                                                              |
| IOPS             | EC2インスタンスとEBSボリューム間のI/O処理のリクエスト数（個/秒）を設定する。 |                                                              |
| AZ               | EBSボリュームを作成するAZ。                                 | EC2インスタンスは、同じAZにあるEBSボリュームしか選択できないので注意する。 |
| 暗号化           | EC2インスタンスとEBSボリューム間のI/O処理を暗号化するかどうかを設定する。 | 参考：https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html |

<br>

### EBSボリュームタイプとサイズ

#### ▼ EBSボリュームの種類

| EBSボリュームタイプ                  | 対応する物理ストレージ | IOPS                                 | スループット                         |
| ------------------------------------ | ---------------------- | ------------------------------------ | ------------------------------------ |
| 汎用SSD（```gp2```）                 | SSD                    | サイズに応じて、自動的に設定される。 | 設定できない。                       |
| 汎用SSD（```gp3```）                 | 同上                   | サイズに関係なく、設定できる。       | サイズに関係なく、設定できる。       |
| プロビジョンド IOPS SSD（```io1```） | 同上                   | サイズに関係なく、設定できる。       | 設定できない。                       |
| プロビジョンド IOPS SSD（```io2```） | 同上                   | サイズに関係なく、設定できる。       | 設定できない。                       |
| Cold HDD                             | HDD                    | サイズに応じて、自動的に設定される。 | サイズに応じて、自動的に設定される。 |
| スループット最適化 HDD               | 同上                   | 設定できない。                       | サイズに応じて、自動的に設定される。 |
| マグネティック                       | 同上                   | 設定できない。                       | 設定できない。                       |

#### ▼ 下限のサイズ

一般的なアプリケーションであれば、最低限```20```～```30```GiBのサイズがあると良い。しかし、踏み台サーバーの場合、プライベートサブネットに接続するための足場としての用途しかなく、大きなサイズのEBSボリュームを組み込む必要がない。そこでできるだけ最小限のボリュームを選択し、ストレージ合計を抑える必要がある。OSによって下限ボリュームサイズが異なることに注意する。

| OS           | 仮想メモリ | 下限EBSボリュームサイズ |
| ------------ | ---------- | ----------------------- |
| Amazon Linux | ```t2.micro```   | ```8```                       |
| CentOS       | ```t2.micro```   | ```10```                      |

#### ▼ サイズの変更

サイズを変更するためには、実際のEBSボリューム、パーティション、EBSボリュームに紐づくファイルシステム、に関してサイズを変更する必要がある。

参考：https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/recognize-expanded-volume-linux.html#extend-file-system

**＊例＊**

（１）バックアップのため、変更対象のEC2インスタンスのAMIを作成しておく。

（２）EC2インスタンスのEBSボリュームを```8```GiBから```16```GiBに変更する例を考える。```lsblk```コマンドで現在のブロックデバイスのサイズを確認すると、EBSボリュームとパーティションがともに```8```GiBである。また、```df```コマンドで現在のファイルシステムのサイズを確認すると、同じく```8```GiBである。

```bash
$ lsblk

NAME    MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvda    202:0    0   8G  0 disk            # EBSボリューム
└─xvda1 202:1    0   8G  0 part /          # パーティション

# ～ 中略 ～
```

```bash
$ df -h

Filesystem  Type  Size  Used  Avail  Use%  Mounted on
/dev/xvda1  ext4    8G  1.9G    14G   12%  /           # 各デバイスファイルに紐づくボリュームのサイズ

# ～ 中略 ～
```

（３）コンソール画面から、EBSボリュームを```16```GiBに変更する。ダウンタイムは発生しない。改めて```lsblk```コマンドを実行すると、該当のEBSボリュームが変更されたことを確認できる。

```bash
$ lsblk

NAME    MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvda    202:0    0  16G  0 disk            # EBSボリューム
└─xvda1 202:1    0   8G  0 part /          # パーティション

# ～ 中略 ～
```

（４）```growpart```コマンドを実行し、パーティションを拡張する。改めて```lsblk```コマンドを実行すると、該当のパーティションが変更されたことを確認できる。

```bash
$ sudo growpart /dev/xvda 1
```

```bash
$ lsblk

NAME    MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvda    202:0    0  16G  0 disk            # EBSボリューム
└─xvda1 202:1    0  16G  0 part /          # パーティション

# ～ 中略 ～
```

（５）ファイルシステムのうち、```/dev/xvda1```ファイルがEBSボリュームに紐づいている。```resize2fs ```コマンドを実行し、これのサイズを変更する。改めて```df```コマンドを実行すると、該当のファイルシステムが変更されたことを確認できる。

```bash
$ sudo resize2fs /dev/xvda1
```

```bash
$ df

Filesystem  Type  Size  Used  Avail  Use%  Mounted on
/dev/xvda1  ext4   16G  1.9G    14G   12%  /           # EBSボリュームに紐づくファイルシステム

# ～ 中略 ～
```

<br>

### EBSボリュームの永続化

#### ▼ EBSボリュームの永続化とは

EC2インスタンスの初期作成時に、ストレージの追加の項目で『終了時に削除』の設定を無効化しておく。これにより、EC2インスタンスが削除されても、EBSボリュームを削除しないようにできる。

参考：https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/RootDeviceStorage.html#Using_RootDeviceStorage

#### ▼ EC2インスタンスの作成後に永続化する

EC2インスタンスの作成後に、EBSボリュームを永続化したい場合は、CLIを実行する必要がある。

```bash
$ aws ec2 modify-instance-attribute \
    --instance-id <インスタンスID> 
    --block-device-mappings \
    file://example.json
```

```bash
# example.jsonファイル
[
  {
    "DeviceName": "/dev/sda1",
    "Ebs": {
      "DeleteOnTermination": false
    }
  }
]
```

#### ▼ 注意点

EC2インスタンスにオートスケーリングを適用している場合は、EBSボリュームを永続化しない方が良いかもしれない。オートスケーリングのスケールイン時に、削除されたEC2インスタンスのEBSボリュームが削除されないため、未使用のEBSボリュームがどんどん溜まっていく問題が起こる。

参考：https://qiita.com/YujiHamada3/items/c890a3de8937ea20bbb2

<br>

### スナップショット

#### ▼ スナップショットとは

バックアップとしてのEBSボリュームのコピーのこと。ソフトウェアとEBSボリュームのコピーの両方が内蔵されたAMIとは区別すること。

参考：https://aws.typepad.com/sajp/2014/04/trainingfaqbest10.html

#### ▼ セットアップ

| 設定項目                    | 説明                                                         |
| --------------------------- | ------------------------------------------------------------ |
| リソースタイプ              | 単一のボリュームのスナップショット、複数のボリュームを含むスナップショット、のいずれを作成するか、を設定する。 |
| ボリュームID/インスタンスID | スナップショットの元になるボリューム/EC2インスタンスを設定する。 |

<br>

## 02. ECR

### ECRとは

コンテナイメージやhelmチャートを管理できる。

<br>

### セットアップ

| 設定項目                 | 説明                                                         | 補足                                                         |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 可視性                   | イメージリポジトリをパブリックあるいはプライベートにするかを設定する。 | 様々なベンダーがパブリックリポジトリでECRイメージを提供している。<br>参考：https://gallery.ecr.aws/ |
| タグのイミュータビリティ | 同じタグ名でイメージがプッシュされた場合、バージョンタグを上書きできる/できないかを設定できる。 | -                                                            |
| プッシュ時にスキャン     | イメージがプッシュされた時に、コンテナイメージにインストールされているパッケージの脆弱性を検証し、一覧表示する。 | 参考：https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html |
| 暗号化設定               | -                                                            | -                                                            |

<br>

### イメージのプッシュ

#### ▼ コンテナイメージの場合

参考：https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html

（１）ECRにログインする。

```bash
$ aws ecr get-login-password --region ap-northeast-1 | docker login \
    --username AWS \
    --password-stdin <イメージリポジトリURL>

Login Succeeded
```

（２）イメージにタグを付与する。

```bash
# docker tag foo:latest <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
$ docker tag <イメージID> <イメージリポジトリURL>:<バージョンタグ>
```

（３）ECRにコンテナイメージをプッシュする。

```bash
# docker push <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/foo-repository:latest
$ docker push <イメージリポジトリURL>:<バージョンタグ>
```

#### ▼ helmチャートの場合

参考：https://docs.aws.amazon.com/AmazonECR/latest/userguide/push-oci-artifact.html

<br>

### ライフサイクル

#### ▼ ライフサイクルポリシー

ECRのコンテナイメージの有効期間を定義できる。

| 設定項目             | 説明                                                         | 補足                                                         |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ルールの優先順位     | 数字で、ルールの優先度を設定できる。                         | 数字が小さいほど、優先度は高くなる。数字は連続している必要はなく、例えば、```10```、```20```、```90```、のように設定しても良い。 |
| イメージのステータス | ルールを適用するイメージの条件として、タグの有無や文字列を設定できる。 |                                                              |
| 一致条件             | イメージの有効期間として、同条件に当てはまるイメージが削除される閾値を設定できる。 | 個数、プッシュされてからの期間、などを閾値として設定できる。 |

<br>

### バージョンタグ

#### ▼ タグ名のベストプラクティス

Dockerのベストプラクティスに則り、タグ名にlatestを使用しないようにする。その代わりに、コンテナイメージのバージョンごとに異なるタグ名になるようハッシュ値（例：GitHubのコミットID）を使用する。

参考：https://matsuand.github.io/docs.docker.jp.onthefly/develop/dev-best-practices/

<br>

## 03. ECS、EKS：Elastic Container/Kubernetes Service

### コントロールプレーンとデータプレーンの対応関係

| コントロールプレーン（コンテナオーケストレーション環境） | データプレーン（コンテナ実行環境） | 説明                                                         |
| ------------------------------------------------- |-------------------| ------------------------------------------------------------ |
| ECS                    | EC2、Fargate       | 単一のOS上でコンテナオーケストレーションを実行する。         |
| EKS                   | EC2、Fargate       | 複数のOS上それぞれでコンテナオーケストレーションを実行する。<br>参考：https://www.sunnycloud.jp/column/20210315-01/ |

<br>

### コントロールプレーン

#### ▼ コントロールプレーンとは

コンテナオーケストレーションを実行する環境を提供する。データプレーンのVPC外に存在している。

#### ▼ ECSの場合

開発者や他のAWSリソースからのアクセスを待ち受けるAPI、データプレーンを管理するコンポーネント、からなる。

参考：https://aws.amazon.com/jp/blogs/news/under-the-hood-amazon-elastic-container-service-and-aws-fargate-increase-task-launch-rates/

![ecs_control-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_control-plane.png)

#### ▼ EKSの場合

開発者や他のAWSリソースからのアクセスを待ち受けるAPI、アクセスをAPIにルーティングするNLB、データプレーンを管理するコンポーネント、からなる。

参考：https://aws.github.io/aws-eks-best-practices/reliability/docs/controlplane/

![eks_control-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_control-plane.png)

<br>

### データプレーン

#### ▼ データプレーンとは

コンテナの実行環境のこと。『```on EC2```』『```on Fargate```』という呼び方は、データプレーンがECSの実行環境（```execution environment```）の意味合いを持つからである。

#### ▼ EC2の場合

EC2インスタンスをホストとして、コンテナを作成する。

#### ▼ Fargateの場合

マネージドなサーバーをホストとして、コンテナを作成する。実体は、EC2インスタンスをホストとして、コンテナを稼働させている（ドキュメントに記載がないが、AWSサポートに確認済み）。

参考：https://aws.amazon.com/jp/blogs/news/under-the-hood-fargate-data-plane/

![fargate_data-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/fargate_data-plane.png)

<br>

## 03-02. ECSデータプレーン

### ECSクラスター

ECSサービスの管理グループ単位のこと。

参考：https://docs.aws.amazon.com/AmazonECS/latest/userguide/clusters.html

![ecs_cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_cluster.png)

<br>

### ECSサービス

ECSタスクの管理グループ単位のこと。ECSタスクへのロードバランシング、タスクの数の維持管理や、リリースの成否の管理を行う。

参考：https://docs.aws.amazon.com/AmazonECS/latest/userguide/service_definition_parameters.html

<br>

### ECSタスク

#### ▼ ECSタスク

コンテナインスタンスの管理グループ単位のこと。ECSタスク定義を基に作成される。

![ecs_task](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_task.png)

#### ▼ ECSコンテナエージェント

![ecs_task-execution-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_task-execution-role.png)

ECSタスク実行ロールを使用して、ECSタスクのライフサイクルを管理する。Fargateの場合、ECSコンテナエージェントがプリインストールされている。

参考：

- https://dev.classmethod.jp/articles/ecs_ec2_iamrole/
- https://aws.amazon.com/jp/blogs/news/under-the-hood-task-networking-for-amazon-ecs/

#### ▼ ECSタスク定義

ECSタスクをどのような設定値を基に作成するかを設定できる。ECSタスク定義は、バージョンを示す『リビジョンナンバー』で番号づけされる。ECSタスク定義を削除するには、全てのリビジョン番号のECSタスク定義を登録解除する必要がある。

#### ▼ ECSタスクのライフサイクル

![ecs_task_life-cycle](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_task_life-cycle.png)

ECSタスクは、必須コンテナ異常停止時、デプロイ、自動スケーリング、手動操作、の時にライフサイクルを持つ。AWS側の操作が終了した時点でRunningステータスになるが、コンテナの起動に時間がかかるようなアプリケーション（例：SSR）の場合は、Runningステータスであっても使用できる状態ではないことに注意する。

参考：https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-lifecycle.html#lifecycle-states

正常停止と異常停止に関わらず、停止理由を確認できる。

参考：https://docs.aws.amazon.com/AmazonECS/latest/developerguide/stopped-task-errors.html

<br>

### ロール

#### ▼ サービスロール

ECSサービスがECSタスクを操作するために必要なロールである。サービスリンクロールに含まれ、ECSの作成時に自動的にアタッチされる。

参考：

- https://dev.classmethod.jp/articles/ecs_fargate_iamrole/
- https://dev.classmethod.jp/articles/ecs_ec2_iamrole/

#### ▼ コンテナインスタンスロール

![ecs_container-instance-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_container-instance-role.png)

コンテナのホストが他のAWSリソースにアクセスするために必要なロールである。Fargateの場合、不要である。

参考：

- https://dev.classmethod.jp/articles/ecs_fargate_iamrole/
- https://dev.classmethod.jp/articles/ecs_ec2_iamrole/

#### ▼ タスクロール

![ecs_task-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_task-role.png)

ECSタスク内のコンテナのアプリケーションが、他のAWSリソースにアクセスするために必要なロールである。アプリケーションにS3やSystems Managerへのアクセス権限を与えたい場合は、タスク実行ロールではなくタスクロールに権限をアタッチする。

参考：

- https://dev.classmethod.jp/articles/ecs_fargate_iamrole/
- https://dev.classmethod.jp/articles/ecs_ec2_iamrole/

**＊実装例＊**

アプリケーションからCloudWatchログにログを送信するために、ECSタスクロールにカスタマー管理ポリシーをアタッチする。

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:*:*:*"
      ]
    }
  ]
}
```

**＊実装例＊**

Parameter Storeから変数を取得するために、ECSタスクロールにインラインポリシーをアタッチする。

```yaml
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameters"
            ],
            "Resource": "*"
        }
    ]
}
```

#### ▼ タスク実行ロール

![ecs_task-execution-role](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_task-execution-role.png)

ECSタスク内のECSコンテナエージェントが、他のAWSリソースにアクセスするために必要なロールのこと。AWS管理ポリシーである『```AmazonECSTaskExecutionRolePolicy```』がアタッチされたロールを、タスクにアタッチする必要がある。このポリシーには、ECRへのアクセス権限の他、CloudWatchログにログを生成するための権限が設定されている。ECSタスク内のコンテナがリソースにアクセスするために必要なタスクロールとは区別すること。

参考：

- https://dev.classmethod.jp/articles/ecs_fargate_iamrole/
- https://dev.classmethod.jp/articles/ecs_ec2_iamrole/

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

**＊実装例＊**

datadogエージェントがECSクラスターやコンテナにアクセスできるように、ECSタスク実行ロールにカスタマー管理ポリシーをアタッチする。

```yaml
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "ecs:ListClusters",
                "ecs:ListContainerInstances",
                "ecs:DescribeContainerInstances"
            ],
            "Effect": "Allow",
            "Resource": "*"
        }
    ]
}
```

<br>

### ネットワークモードとコンテナ間通信

#### ▼ noneモード

外部ネットワークが無く、タスクと外と通信できない。

#### ▼ hostモード

EC2でのみ使用できる。Dockerのhostネットワークに相当する。

参考：https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-networkmode.html#networking-networkmode-host

![network-mode_host-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-mode_host-mode.png)

#### ▼ bridgeモード

EC2でのみ使用できる。Dockerのbridgeネットワークに相当する。

参考：https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-networkmode.html#networking-networkmode-bridge

![network-mode_host-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-mode_host-mode.png)

#### ▼ awsvpcモード

FargateとEC2の両方で使用できる。awsの独自ネットワークモード。タスクはElastic Networkインターフェースと紐付けられ、コンテナではなくタスク単位でプライベートIPアドレスが割り当てられる。Fargateの場合、同じタスクに属するコンテナ間は、localhostインターフェイスというENI経由で通信できるようになる（推測ではあるが、FargateとしてのEC2インスタンスにlocalhostインターフェースが紐付けられる）。これにより、コンテナからコンテナに通信するとき（例：NginxコンテナからPHP-FPMコンテナへのルーティング）は、通信元コンテナにて、通信先のアドレスを『localhost（```127.0.0.1```）』で指定すれば良い。また、awsvpcモードの独自の仕組みとして、同じECSタスク内であれば、互いにコンテナポートを開放せずとも、インバウンド通信を待ち受けるポートを指定するだけで、コンテナ間で通信できる。例えば、NginxコンテナからPHP-FPMコンテナにリクエストをルーティングするためには、PHP-FPMプロセスが```9000```番ポートでインバウンド通信を受信し、さらにコンテナが```9000```番ポートを開放する必要がある。しかし、awsvpcモードではコンテナポートを開放する必要はない。

参考：

- https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-networkmode.html#networking-networkmode-awsvpc
- https://docs.aws.amazon.com/AmazonECS/latest/userguide/fargate-task-networking.html

![network-mode_awsvpc](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-mode_awsvpc.png)

<br>

### マルチECSサービス

#### ▼ マルチECSサービスとは

ECSクラスターが複数のECSサービスから構成される。マイクロサービスアーキテクチャのアプリケーション群を稼働させる時、Kubernetesを使用するのが基本である。ただし、ECSクラスター内に複数のECSサービスを作成することで、Kubernetesのような構成を実現できる。

参考：https://tangocode.com/2018/11/when-to-use-lambdas-vs-ecs-docker-containers/

![ecs-fargate_microservices](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs-fargate_microservices.png)

#### ▼ ECSサービスディスカバリー

Istioと同様にして、マイクロサービスが他のマイクロサービスにリクエストを送信する時に、Route53を使用してIPアドレスの名前解決を行う。オートスケーリングなどでマイクロサービスのIPアドレスが変更されても、動的にレコードを変更する。

参考：

- https://practical-aws.dev/p/ecs-service-discovery/
- https://medium.com/@toddrosner/ecs-service-discovery-1366b8a75ad6
- https://dev.classmethod.jp/articles/ecs-service-discovery/

![ecs_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_service-discovery.png)

<br>

### プライベートサブネット内からのアウトバウンド通信

#### ▼ プライベートサブネット内へのデータプレーンの配置

プライベートサブネット内にデータプレーンを配置した場合、パブリックネットワークやVCP外のAWSリソースにアクセスするために、NAT GatewayやVPCエンドポイントが必要になる。パブリックサブネットに配置すればこれらは不要となるが、パブリックサブネットよりもプライベートサブネットにデータプレーンを配置する方が望ましい。

#### ▼ パブリックネットワークに対する通信

データプレーンをプライベートサブネットに配置した場合、パブリックネットワークに対してアウトバウンド通信を送信するためには、NAT Gatewayを配置する必要がある。

#### ▼ VPC外のAWSリソースに対する通信

データプレーンをプライベートサブネットに配置した場合、VPC外にあるAWSリソース（コントロールプレーン、ECR、S3、Systems Manager、CloudWatch、DynamoDB、など）に対してアウトバウンド通信を送信するためには、NAT GatewayあるいはVPCエンドポイントを配置する必要がある。もしNAT Gatewayを設置したとする。この場合、VPCエンドポイントよりもNAT Gatewayの方が高く、AWSリソースに対する通信でもNAT Gatewayを通過するため、高額料金を請求されてしまう。

参考：https://zenn.dev/yoshinori_satoh/articles/ecs-fargate-vpc-endpoint

![ecs_nat-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_nat-gateway.png)

代わりに、VPCエンドポイントを設置する。より低額でデータプレーンがVPC外のAWSリソースのアクセスできるようになる。

参考：https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/networking-connecting-vpc.html#networking-connecting-privatelink

![ecs_control-plane_vpc-endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_control-plane_vpc-endpoint.png)

<br>

### ログ転送

#### ▼ awslogsドライバー

標準出力/標準エラー出力に出力されたログをCloudWatch-APIに送信する。

参考：

- https://docs.docker.com/config/containers/logging/awslogs/
- https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html#create_awslogs_logdriver_options

| 設定項目                      | 説明                                                         | 補足                                                         |
| ----------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ```awslogs-group```           | ログ送信先のCloudWatchログのロググループを設定する。         |                                                              |
| ```awslogs-datetime-format``` | 日時フォーマットを定義し、またこれをログの区切り単位としてログストリームに出力する。 | 正規表現で設定する必要があり、さらにJSONでは『```\```』を『```\\```』にエスケープしなければならない。例えば『```\\[%Y-%m-%d %H:%M:%S\\]```』となる。<br>参考：https://docs.docker.com/config/containers/logging/awslogs/#awslogs-datetime-format |
| ```awslogs-region```          | ログ送信先のCloudWatchログのリージョンを設定する。           |                                                              |
| ```awslogs-stream-prefix```   | ログ送信先のCloudWatchログのログストリームのプレフィックス名を設定する。 | ログストリームには、『```<プレフィックス名>/<コンテナ名>/<タスクID>```』の形式で送信される。 |

#### ▼ FireLensコンテナ

以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/observability/observability_telemetry_fluentbit_firelens.html

<br>

## 03-02-02. on EC2

### EC2インスタンスのAMI

任意のEC2インスタンスを使用できるが、AWSが用意している最適化AMIを選んだ方が良い。このAMIには、EC2がECSと連携するために必要なソフトウェアがプリインストールされており、EC2インスタンスをセットアップする手間が省ける。

参考：https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI.html 

| AMI名                         | 説明                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| ECS最適化Amazon Linux 2       | 標準的なEC2インスタンスを作成できる。最も推奨。              |
| ECS最適化Amazon Linux 2022    | Amazon Linux 2よりも先進的な機能を持つEC2インスタンスを作成できる。<br>参考：https://docs.aws.amazon.com/linux/al2022/ug/compare-al2-to-AL2022.html |
| ECS最適化Amazon Linux         | 標準的なEC2インスタンスを作成できる。非推奨であり、Amazon Linux 2を使用した方が良い。 |
| ECS最適化Amazon Linux 2 arm64 | arm64ベースのGravitonプロセッサーが搭載されたEC2インスタンスを作成できる。 |
| ECS最適化Amazon Linux 2 GPU   | GPUが搭載されたEC2インスタンスを作成できる。                 |
| ECS最適化Amazon Linux 2 推定  | Amazon EC2 Inf1インスタンスを作成できる。                    |

<br>

### タスク配置戦略

ECSタスクをECSクラスターに配置する時のアルゴリズムを選択できる。

| 戦略    | 説明                                           |
| ------- | ---------------------------------------------- |
| Spread  | ECSタスクを各場所にバランスよく配置する        |
| Binpack | ECSタスクを1つの場所にできるだけ多く配置する。 |
| Random  | ECSタスクをランダムに配置する。                |

<br>

## 03-02-03. on Fargate

### セットアップ

#### ▼ ECSサービス

| 設定項目                    | 説明                                                         | 補足                                                         |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ECSタスク定義               | ECSサービスで維持管理するタスクの定義ファミリー名とリビジョン番号を設定する。 |                                                              |
| 起動タイプ                  | ECSタスク内のコンテナの起動タイプを設定する。                |                                                              |
| プラットフォームのバージョン | ECSコントロールプレーンのバージョンを設定する。              | バージョンによって、連携できるAWSリソースが異なる。          |
| サービスタイプ               |                                                              |                                                              |
| ECSタスクの必要数            | 非スケーリング時またはデプロイ時のタスク数を設定する。       | 最小ヘルス率と最大率の設定値に影響する。                     |
| 最小ヘルス率                 | ECSタスクの必要数の設定を```100```%とし、新しいタスクのデプロイ時に、稼働中タスクの最低合計数を割合で設定する。 | 例として、タスク必要数が4個だと仮定する。タスクヘルス最小率を50%とすれば、稼働中タスクの最低合計数は2個となる。デプロイ時の既存タスク停止と新タスク起動では、稼働中の既存タスク/新タスクの数が最低合計数未満にならないように制御される。<br>参考：https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments |
| 最大率                      | ECSタスクの必要数の設定を```100```%とし、新しいタスクのデプロイ時に、稼働中/停止中タスクの最高合計数を割合で設定する。 | 例として、タスク必要数が4個だと仮定する。タスク最大率を200%とすれば、稼働中/停止中タスクの最高合計数は８個となる。デプロイ時の既存タスク停止と新タスク起動では、稼働中/停止中の既存タスク/新タスクの数が最高合計数を超過しないように制御される。<br>参考：https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments |
| ヘルスチェックの猶予期間     | デプロイ時のALB/NLBのヘルスチェックの状態を確認するまでの待機時間を設定する。猶予期間を過ぎても、ALB/NLBのヘルスチェックが失敗していれば、サービスはタスクを停止し、新しいタスクを再起動する。 | ALB/NLBではターゲットを登録し、ヘルスチェックを実行するプロセスがある。特にNLBでは、これに時間がかかる。またアプリケーションによっては、コンテナの作成に時間がかかる。そのため、NLBのヘルスチェックが完了する前に、ECSサービスがNLBのヘルスチェックの結果を確認してしまうことがある。例えば、NLBとLaravelを使用する場合は、ターゲット登録とLaravelコンテナの築の時間を加味して、```330```秒以上を目安とする。例えば、ALBとNuxt.js（SSRモード）を使用する場合は、```600```秒以上を目安とする。なお、アプリケーションのコンテナ作成にかかる時間は、開発環境での所要時間を参考にする。 |
| タスクの最小数               | スケーリング時のタスク数の最小数を設定する。                 |                                                              |
| タスクの最大数               | スケーリング時のタスク数の最大数を設定する。                 |                                                              |
| ロードバランシング           | ALBでルーティングするコンテナを設定する。                    |                                                              |
| タスク数                   | ECSタスクの作成数をいくつに維持するかを設定する。            | タスクが何らかの原因で停止した場合、空いているAWSサービスを使用して、タスクが自動的に補填される。 |
| デプロイメント               | ローリングアップデート、ブルー/グリーンデプロイがある。      |                                                              |
| サービスロール               |                                                              |                                                              |

#### ▼ ECSタスク定義

| 設定項目                           | 説明                                                         | 補足                                                         |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ECSタスク定義名                    | ECSタスク定義の名前を設定する。                              |                                                              |
| ネットワークモード                 | ホストとコンテナ間を接続するネットワーク様式を設定する。     |                                                              |
| 互換性                             |                                                              |                                                              |
| オペレーティングシステムファミリー |                                                              |                                                              |
| タスクロール                       | ECSタスク内のコンテナのアプリケーションが、他のAWSリソースにアクセスするために必要なロールを設定する。 |                                                              |
| タスク実行ロール                   | ECSタスク内のECSコンテナエージェントが、他のAWSリソースにアクセスするために必要なロールを設定する。 |                                                              |
| タスクメモリ                       | ECSタスク当たりのコンテナの合計メモリサイズを設定する。      | ECSタスク内のコンテナに割り振ることを想定し、やや多めにメモリを設定した方が良い。 |
| タスクCPU                          | ECSタスク当たりのコンテナの合計CPUサイズを設定する。         | ・ECSタスク内のコンテナに割り振ることを想定し、やや多めにメモリを設定した方が良い。<br>・CPUごとに使用できるメモリサイズに違いがあり、大きなCPUほど小さなメモリを使用できない。 |
| コンテナ定義                       | ECSタスク内のコンテナを設定する。                            | JSONをインポートしても設定できる。                           |
| サービス統合                       |                                                              |                                                              |
| プロキシ                           |                                                              |                                                              |
| FireLens統合                       | FireLensコンテナを使用する場合に有効化する。                 |                                                              |
| ボリューム                         |                                                              |                                                              |

#### ▼ コンテナ定義

ECSタスク内のコンテナ1つに対して、環境を設定する。

参考：https://docs.aws.amazon.com/AmazonECS/latest/userguide/task_definition_parameters.html

| 設定項目                        | 対応するdockerコマンドオプション        | 説明                                                         | 補足                                                         |
| ------------------------------- | --------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| cpu                             | ```--cpus```                            | タスク全体に割り当てられたメモリ（タスクメモリ）のうち、該当のコンテナに最低限割り当てるCPUユニット数を設定する。cpuReservationという名前になっていないことに注意する。 CPUユニット数の比率に基づいて、タスク全体のCPUが各コンテナに割り当てられる。『ソフト制限』ともいう。 | 参考：<br>・https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_environment<br>・https://qiita.com/_akiyama_/items/e9760dd61d94b8031247 |
| dnsServers                      | ```--dns```                             | コンテナが名前解決に使用するDNSサーバーのIPアドレスを設定する。 |                                                              |
| essential                       |                                         | コンテナが必須か否かを設定する。                             | ・```true```の場合、コンテナが停止すると、タスクに含まれる全コンテナが停止する。<br>```false```の場合、コンテナが停止しても、その他のコンテナは停止しない。 |
| healthCheck<br>(command)        | ```--health-cmd```                      | ホストからFargateに対して、```curl```コマンドによるリクエストを送信し、レスポンス内容を確認。 |                                                              |
| healthCheck<br>(interval)       | ```--health-interval```                 | ヘルスチェックの間隔を設定する。                             |                                                              |
| healthCheck<br>(retries)        | ```--health-retries```                  | ヘルスチェックを成功と見なす回数を設定する。                 |                                                              |
| hostName                        | ```--hostname```                        | コンテナにホスト名を設定する。                               |                                                              |
| image                           |                                         | ECRのURLを設定する。                                         | 指定できるURLの記法は、Dockerfileの```FROM```と同じである。<br>参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_container_docker_dockerfile.html |
| logConfiguration<br>(logDriver) | ```--log-driver```                      | ログドライバーを指定することにより、ログの出力先を設定する。 | Dockerのログドライバーにおおよそ対応しており、Fargateであれば『awslogs、awsfirelens、splunk』に設定できる。EC2であれば『awslogs、json-file、syslog、journald、fluentd、gelf、logentries』を設定できる。 |
| logConfiguration<br>(options)   | ```--log-opt```                         | ログドライバーに応じて、詳細な設定を行う。                   |                                                              |
| portMapping                     | ```--publish```<br>```--expose```       | ホストとFargateのアプリケーションのポート番号をマッピングし、ポートフォワーディングを行う。 | ```containerPort```のみを設定し、```hostPort```は設定しなければ、EXPOSEとして定義できる。<br>参考：https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_PortMapping.html |
| secrets<br>(volumesFrom)        |                                         | Parameter Storeから出力する環境変数を設定する。           |                                                              |
| memory                          | ```--memory```                          | コンテナのメモリサイズの閾値を設定し、これを超えた場合にコンテナを停止する『ハード制限』ともいう。 | 参考：https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_memory |
| memoryReservation               | ```--memory-reservation```              | タスク全体に割り当てられたメモリ（タスクメモリ）のうち、該当のコンテナに最低限割り当てるメモリ分を設定する。『ソフト制限』ともいう。 | 参考：https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_memory |
| mountPoints                     |                                         | 隠蔽されたホストとコンテナの間でボリュームマウントを実行する。Fargateは、脆弱性とパフォーマンスの観点で、バインドマウントに対応していない。 | 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/virtualization/virtualization_container_docker.html |
| ulimit                          | Linuxコマンドの<br>```--ulimit```に相当 |                                                              |                                                              |

<br>

### IPアドレス

#### ▼ ECSタスクのIPアドレス

ECSタスクごとに異なるプライベートIPが割り当てられる。このIPアドレスに対して、ALBはルーティングを行う。

#### ▼ FargateのIPアドレス

![NatGatewayを介したFargateから外部サービスへのアウトバウンド通信](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/NatGatewayを介したFargateから外部サービスへのアウトバウンド通信.png)

Fargateは動的パブリックIPアドレス（Fargateの再作成後に変化するIPアドレス）を持ち、固定パブリックIPアドレスであるElastic IPアドレスを設定できない。アウトバウンド通信の先にある外部サービスが、セキュリティ上で静的なIPアドレスを要求する場合、アウトバウンド通信（パブリックネットワーク向き通信）時に送信元パケットに付加されるIPアドレスが動的になり、リクエストできなくなってしまう。そこで、Fargateのアウトバウンド通信が、Elastic IPアドレスを持つNAT Gatewayを経由する（Fargateは、パブリックサブネットとプライベートサブネットのどちらに置いても良い）。これによって、NAT GatewayのElastic IPアドレスが送信元パケットに付加されるため、Fargateの送信元IPアドレスを見かけ上静的に扱えるようになる。

参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/ecs-fargate-static-elastic-ip-address/

<br>

### ECSタスクの一時起動

#### ▼ マイグレーション

現在起動中のECSタスクとは別に、新しいタスクを一時的に起動する。CI/CDツールで実行する以外に、ローカルマシンから手動で実行する場合もある。起動時に、```overrides```オプションを使用して、指定したECSタスク定義のコンテナ設定を上書きできる。正規表現で設定する必要があり、さらにJSONでは『```\```』を『```\\```』にエスケープしなければならない。コマンドが実行された後に、タスクは自動的にStopped状態になる。

**＊実装例＊**

LaravelのSeederコマンドやロールバックコマンドを、ローカルマシンから実行する。

```bash
#!/bin/bash

set -x

echo "Set Variables"
SERVICE_NAME="prd-foo-ecs-service"
CLUSTER_NAME="prd-foo-ecs-cluster"
TASK_NAME="prd-foo-ecs-task-definition"
SUBNETS_CONFIG=$(aws ecs describe-services \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --query "services[].deployments[].networkConfiguration[].awsvpcConfiguration[].subnets[]")
SGS_CONFIG=$(aws ecs describe-services \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --query "services[].deployments[].networkConfiguration[].awsvpcConfiguration[].securityGroups[]")

# 実行したいコマンドをoverridesに設定する。
echo "Run Task"
TASK_ARN=$(aws ecs run-task \
  --launch-type FARGATE \
  --cluster ${CLUSTER_NAME} \
  --platform-version "1.4.0" \
  --network-configuration "awsvpcConfiguration={subnets=${SUBNETS_CONFIG},securityGroups=${SGS_CONFIG}}" \
  --task-definition ${TASK_NAME} \
  --overrides '{\"containerOverrides\": [{\"name\": \"laravel-container\",\"command\": [\"php\", \"artisan\", \"db:seed\", \"--class=DummySeeder\", \"--force\"]}]}' \
  --query "tasks[0].taskArn" | tr -d """)

echo "Wait until task stopped"
aws ecs wait tasks-stopped \
  --cluster ${CLUSTER_NAME} \
  --tasks ${TASK_ARN}

echo "Get task result"
RESULT=$(aws ecs describe-tasks \
  --cluster ${CLUSTER_NAME} \
  --tasks ${TASK_ARN})
echo ${RESULT}

EXIT_STATUS=$(echo ${RESULT} | jq .tasks[0].containers[0].exitStatus)
echo exitStatus ${EXIT_STATUS}
exit ${EXIT_STATUS}
```

なお、実行IAMユーザーを作成し、ECSタスクを起動できる最低限の権限をアタッチする。

```yaml
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "iam:PassRole",
                "ecs:RunTask",
                "ecs:DescribeServices",
                "ecs:DescribeTasks"
            ],
            "Resource": [
                "arn:aws:ecs:*:<アカウントID>:service/*",
                "arn:aws:ecs:*:<アカウントID>:task/*",
                "arn:aws:ecs:*:<アカウントID>:task-definition/*",
                "arn:aws:iam::<アカウントID>:role/*"
            ]
        }
    ]
}
```

<br>

### ECSタスクのデプロイ手法

#### ▼ ローリングアップデート

![rolling-update](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rolling-update.png)

参考：https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments/

1. 最小ヘルス率の設定値を基に、ローリングアップデート時の稼働中タスクの最低合計数が決定される。
2. 最大率の設定値を基に、ローリングアップデート時の稼働中/停止中タスクの最高合計数が決まる
3. ECSは、既存タスクを稼働中のまま、新タスクを最高合計数いっぱいまで作成する。
4. ECSは、猶予期間後にALB/NLBによる新タスクに対するヘルスチェックの結果を確認する。ヘルスチェックが成功していれば、既存タスクを停止する。ただし、最小ヘルス率によるタスクの最低合計数が保たれる。
5. 『新タスクの起動』と『ヘルスチェック確認後の既存タスクの停止』のプロセスが繰り返し実行され、徐々に既存タスクが新タスクに置き換わる。
6. 全ての既存タスクが新タスクに置き換わる。

#### ▼ ブルー/グリーンデプロイメント

CodeDeployを使用してデプロイを行う。

<br>

### プライベートサブネット内のFargateからVPC外のAWSリソースへのアクセス

![ecs_vpc-endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_vpc-endpoint.png)

| VPCエンドポイントの接続先 | プライベートDNS名                                            | 説明                                              |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| CloudWatchログ            | ```logs.ap-northeast-1.amazonaws.com```                      | ECSコンテナのログをPOSTリクエストを送信するため。 |
| ECR                       | ```api.ecr.ap-northeast-1.amazonaws.com```<br>```*.dkr.ecr.ap-northeast-1.amazonaws.com``` | イメージのGETリクエストを送信するため。           |
| S3                        | なし                                                         | イメージのレイヤーをPOSTリクエストを送信するため  |
| Parameter Store           | ```ssm.ap-northeast-1.amazonaws.com```                       | Parameter StoreにGETリクエストを送信するため。    |
| Secrets Manager           | ```ssmmessage.ap-northeast-1.amazonaws.com```                | Secrets Managerの機能を使用するため。             |

プライベートサブネット内のFargateからVPC外のAWSリソース（コントロールプレーン、ECR、S3、Systems Manager、CloudWatch、DynamoDB、など）にアクセスする場合、専用のVPCエンドポイントを設け、これに対してアウトバウンド通信を行うようにすると良い。NAT GatewayとVPCエンドポイントの両方を作成している場合、ルートテーブルでは、VPCエンドポイントへのアウトバウンド通信の方が優先される。そのため、NAT Gatewayがある状態でVPCエンドポイントを作成すると、接続先が自動的に変わってしまうことに注意する。注意点として、パブリックネットワークにアウトバウンド通信を送信する場合は、VPCエンドポイントだけでなくNAT Gatewayも作成する必要がある。

参考：

- https://docs.aws.amazon.com/AmazonECS/latest/userguide/vpc-endpoints.html#ecs-vpc-endpoint-ecsexec
- https://zenn.dev/yoshinori_satoh/articles/ecs-fargate-vpc-endpoint
- https://dev.classmethod.jp/articles/vpc-endpoint-gateway-type/

<br>

### Fargate上のコンテナへの接続

#### ▼ Session Managerを使用したECS Exec

![fargate_ecs-exec](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/fargate_ecs-exec.png)

Session Managerを使用してECSタスク内のコンテナに接続し、コンテナのログインシェルを起動する。System Managerを使用してコンテナに接続する場合、コンテナのホストにsystems-managerエージェントをインストールしておく必要がある。ただし、FargateとしてのEC2インスタンスには、systems-managerエージェントがプリインストールされているため、これは不要である。

参考：

- https://docs.aws.amazon.com/AmazonECS/latest/userguide/ecs-exec.html
- https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-setting-up-messageAPIs.html
- https://qiita.com/Shohei_Miwa/items/6e04c9b7f4c0c862eb9e

（１）ECSサービスで、ECS-Execオプションを有効化する。

（２）VPCエンドポイントにて、ssmmessagesエンドポイントを作成する。

（３）ECSタスク実行ロールにIAMポリシーを付与する。これにより、ECSタスクがSession Managerにアクセスできるようになる。

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        # ssmmessages APIへのアクセス権限
        "ssmmessages:CreateControlChannel",
        "ssmmessages:CreateDataChannel",
        "ssmmessages:OpenControlChannel",
        "ssmmessages:OpenDataChannel"
      ],
      "Resource": "*"
    }
  ]
}
```

（４）ECS Execを実行するユーザーに、実行権限のポリシーを付与する。

```yaml
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecs:ExecuteCommand",
            ],
            "Resource": [
                "arn:aws:ecs:*:<アカウントID>:cluster/*",
                "arn:aws:ecs:*:<アカウントID>:task/*",
            ]
        }
    ]
}
```

（５）事前の設定がなされているかどうかをecs-exec-checkerスクリプトを実行して確認する。

参考：https://github.com/aws-containers/amazon-ecs-exec-checker

```bash
#!/bin/bash

ECS_CLUSTER_NAME=prd-foo-ecs-cluster
ECS_TASK_ID=bar

bash <(curl -Ls https://raw.githubusercontent.com/aws-containers/amazon-ecs-exec-checker/main/check-ecs-exec.sh) $ECS_CLUSTER_NAME $ECS_TASK_ID
```

（６）ECSタスク内のコンテナに接続し、コンテナのログインシェルを起動する。bashを実行する時に、『```/bin/bash```』や『```/bin/sh```』で指定すると、binより上のパスもECSに送信されてしまう。例えば、Windowsなら『```C:/Program Files/Git/usr/bin/bash```』が送信される。これはCloudTrailでExecuteCommandイベントとして確認できる。ECSコンテナ内ではbashへのパスが異なるため、接続に失敗する。そのため、bashを直接的に指定する。

```bash
#!/bin/bash

set -xe

ECS_CLUSTER_NAME=prd-foo-ecs-cluster
ECS_TASK_ID=bar
ECS_CONTAINER_NAME=laravel

aws ecs execute-command \
    --cluster $ECS_CLUSTER_NAME \
    --task $ECS_TASK_ID \
    --container $ECS_CONTAINER_NAME \
    --interactive \
    --debug \
    --command "bash"
```

<br>

## 03-03. EKSデータプレーン

### セットアップ

#### ▼ EKS Cluster

（１）AWS CLIにクレデンシャル情報を設定する。

```bash
$ aws configure
```

（２）EKSのコンテキストを作成する。

参考：https://docs.aws.amazon.com/eks/latest/userguide/getting-started-console.html

```bash
$ aws eks update-kubeconfig --region ap-northeast-1 --name foo-eks-cluster
```

（３）kubectlコマンドの宛先を、EKSのkube-apiserverに変更する。

参考：https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html#deploy-dashboard

```bash
$ kubectl config use-context <ClusterのARN>
```

#### ▼ VPC

EKS Fargate Nodeはプライベートサブネットで稼働する。この時、パブリックネットワークにあるレジストリから、IstioやArgoCDのコンテナイメージをプルできるように、EKS Fargate NodeとInternet Gateway間のネットワークを繋げる必要がある。そのために、パブリックサブネットにNAT Gatewayを置く。

<br>

### EKSの仕組み

#### ▼ EKSとKubernetesの対応

参考：https://zenn.dev/yoshinori_satoh/articles/2021-02-13-eks-ecs-compare

![eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks.png)

| Kubernetes上でのリソース名 | EKS上でのリソース名     | 補足                                                         |
| -------------------------- | ----------------------- | ------------------------------------------------------------ |
| Cluster                    | EKS Cluster           | 参考：https://docs.aws.amazon.com/eks/latest/userguide/clusters.html |
| Ingress                    | ALB Ingress             | AWS LBコントローラーによって、自動的に作成される。<br>参考：<br>・https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html<br>・https://blog.linkode.co.jp/entry/2020/06/26/095917#AWS-ALB-Ingress-Controller-for-Kubernetes |
| Ingressコントローラー      | AWS LBコントローラー    | 参考：https://aws.amazon.com/jp/blogs/news/using-alb-ingress-controller-with-amazon-eks-on-fargate/ |
|                            | API Gateway＋NLB        | 参考：https://aws.amazon.com/jp/blogs/news/api-gateway-as-an-ingress-controller-for-eks/ |
| マスターNode               | EKSコントロールプレーン | 参考：https://docs.aws.amazon.com/eks/latest/userguide/platform-versions.html |
| ワーカーNode               | Fargate Node、EC2 Node  | 参考：https://docs.aws.amazon.com/eks/latest/userguide/eks-compute.html |
| PersistentVolume           | EBS、EFS                | 参考：https://docs.aws.amazon.com/eks/latest/userguide/storage.html |
| Secret                     | System Manager          | 参考：https://docs.aws.amazon.com/eks/latest/userguide/manage-secrets.html |
| kube-dns                   | CoreDNS                 |                                                              |
| kube-proxy                 | kube-proxy              |                                                              |
| 種々のCNIプラグイン        | aws-nodeコンテナ        | VPCのIPアドレスをPodに割り当て、Clusterネットワーク内にある通信がPodに接続できるようにする。<br>参考：<br>・https://docs.aws.amazon.com/eks/latest/userguide/pod-networking.html<br>・https://tech-blog.optim.co.jp/entry/2021/11/10/100000 |
| これら以外のリソース       | なし                    |                                                              |

<br>

### EKS Cluster

#### ▼ EKS Clusterとは

Fargate NodeやEC2 Nodeの管理グループ単位のこと。KubernetesのClusterに相当する。

参考：https://www.sunnycloud.jp/column/20210315-01/

#### ▼ セットアップ

| 設定項目                         | 説明                                                         | 補足                                                         |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 名前                             | クラスターの名前を設定する。                                 |                                                              |
| Kubernetesバージョン             | EKS上で稼働するKubernetesのバージョンを設定する。            | EKSが対応できるKubernetesのバージョンは以下を参考にせよ。<br>参考：https://docs.aws.amazon.com/eks/latest/userguide/platform-versions.html |
| クラスターサービスロール         | EKS Clusterのサービスリンクロールを設定する。              | 参考：https://docs.aws.amazon.com/eks/latest/userguide/service_IAM_role.html |
| シークレット                     | Secretに保持するデータをAWS KMSで暗号化するかどうかを設定する。 | AWS KMSについては、以下のリンクを参考にせよ。<br>参考：https://hiroki-it.github.io/tech-notebook-mkdocs/cloud_computing/cloud_computing_aws_4.html |
| VPC、サブネット                  | ENIを配置するサブネットを設定する。                          | 複数のAZにまたがっている必要がある。                         |
| クラスターセキュリティグループ   | EKS Clusterのセキュリティグループを設定する。              | インバウンドとアウトバウンドの両方のルールで、全てのIPアドレスを許可する必要がある。このセキュリティグループは、追加のセキュリティグループとして設定され、別途、AWSによって```eks-cluster-sg-<EKS Cluster名>```というセキュリティグループも自動設定される。<br>参考：https://yuutookun.hatenablog.com/entry/fargate_for_eks |
| クラスターIPアドレスファミリー   |                                                              |                                                              |
| CIDRブロック                     |                                                              |                                                              |
| クラスターエンドポイントアクセス |                                                              |                                                              |
| ネットワークアドオン             |                                                              |                                                              |
| コントロールプレーンのログ       |                                                              |                                                              |

<br>

### プライベートサブネット内のデータプレーンへのVPC外からのインバウンド通信

#### ▼ Podへのインバウンド通信

EKSでは、Podをプライベートサブネットに配置する必要がある。そのため、パブリックネットワークからのインバウンド通信をAWS LBコントローラーで受信し、ALB Ingressを使用してPodにルーティングする。

参考：https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/deploy-a-grpc-based-application-on-an-amazon-eks-cluster-and-access-it-with-an-application-load-balancer.html

![eks_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_architecture.png)

#### ▼ コントロールプレーンへのインバウンド通信

コントロールプレーンでは、```kubectl``` コマンドのエンドポイントとしてNLBが配置されている。VPC外からNLBへの```443```番ポートに対するアクセスはデフォルトでは許可されているが、拒否するように設定できる。もし拒否した場合、このNLBは閉じられ、VPC内からしか```443```番ポートでコントロールプレーンにアクセスできなくなる。この状態でコントロールプレーンにアクセスできるようにする方法としては、以下のパターンがある。

参考：

- https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html#private-access
- https://note.com/tyrwzl/n/nf28cd4372b18
- https://zenn.dev/yoshinori_satoh/articles/eks-kubectl-instance

| 接続元パターン               | 接続方法パターン     |
| ---------------------------- | -------------------- |
| ローカルマシン               | Session Manager      |
| VPC内の踏み台EC2インスタンス | Session Manager、SSH |
| VPC内のCloud9                | Session Manager、SSH |

<br>

### プライベートサブネット内のデータプレーンからのアウトバウンド通信

#### ▼ VPC外の他のAWSリソースへのアウトバウンド通信

EKSでは、Podをプライベートサブネットに配置する必要がある。プライベートサブネットにを配置した場合、VPC外にあるAWSリソース（ECR、S3、Systems Manager、CloudWatch、DynamoDB、など）に対してアウトバウンド通信を送信するためには、NAT GatewayまたはVPCエンドポイントを配置する必要がある。

参考：https://docs.aws.amazon.com/eks/latest/userguide/network_reqs.html

以下のようなエラーでPodが起動しない場合、Podが何らかの理由でイメージをプルできない可能性がある。また、Podが作成されない限り、Nodeも作成されないことに注意する。

```log
Pod provisioning timed out (will retry) for pod
```

#### ▼ VPC外のコントロールプレーンへのアウトバウンド通信

EKS Clusterを作成すると、ENIが作成される。これにより、データプレーンがVPC外のコントロールプレーンと通信できるようになる。2022/05/27現在、データプレーンがコントロールプレーンと通信するためには、VPCエンドポイントではなくNAT Gatewayを配置する必要がある。

参考：

- https://dev.classmethod.jp/articles/eks_basic/
- https://aws.amazon.com/jp/blogs/news/de-mystifying-cluster-networking-for-amazon-eks-worker-nodes/

<br>

### マルチNode

マルチNodeを作成する場合、AZごとにNodeを作成する。

参考：https://docs.aws.amazon.com/eks/latest/userguide/eks-networking.html

![eks_multi-node](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_multi-node.png)

<br>

### AWS LB Controller

#### ▼ セットアップ

（１）ローカルマシンにIAMポリシーのJSONファイルをダウンロードする。

参考：https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html

```bash
$ curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.4.0/docs/install/iam_policy.json
```

（２）JSONファイルを使用して、IAMポリシーを作成する。

```bash
$ aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json
```

（４）IAM Open ID Connect providerをEKSに紐づける。

```bash
$ eksctl utils associate-iam-oidc-provider \
    --region=ap-northeast-1 \
    --cluster=foo-eks-cluster \
    --approve
    
2022-05-30 23:39:04 [ℹ]  eksctl version 0.96.0
2022-05-30 23:39:04 [ℹ]  using region ap-northeast-1
2022-05-30 23:39:05 [ℹ]  IAM Open ID Connect provider is already associated with cluster "foo-eks-cluster" in "ap-northeast-1"
```

（５）ServiceAccountを作成し、IAMロールと紐づける。

```bash
$ eksctl create iamserviceaccount \
    --cluster=foo-eks-cluster \
    --namespace=kube-system \
    --name=aws-load-balancer-controller \
    --attach-policy-arn=arn:aws:iam::<アカウントID>:policy/AWSLoadBalancerControllerIAMPolicy \
    --override-existing-serviceaccounts \
    --approve

```

（６）ServiceAccountがデプロイされたことを確認する。

参考：https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-aws/

```bash
$ eksctl get iamserviceaccount \
  --cluster foo-eks-cluster \
  --name aws-load-balancer-controller \
  --namespace kube-system

2022-06-06 13:47:33 [ℹ]  eksctl version 0.96.0
2022-06-06 13:47:33 [ℹ]  using region ap-northeast-1
NAMESPACE       NAME                            ROLE ARN
kube-system     aws-load-balancer-controller    arn:aws:iam::<アカウントID>:role/eksctl-foo-eks-cluster-addon-i-Role1-****

# 作成されたServiceAccount
$ kubectl get serviceaccount -n kube-system aws-load-balancer-controller -o yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<アカウントID>:role/eksctl-foo-eks-cluster-addon-i-Role1-****
  creationTimestamp: "2022-05-29T12:59:15Z"
  labels:
    app.kubernetes.io/managed-by: eksctl
  name: aws-load-balancer-controller
  namespace: kube-system
  resourceVersion: "2103515"
  uid: *****
secrets:
- name: aws-load-balancer-controller-token-****
```

（７）指定したリージョンにAWS LBコントローラーをデプロイする。この時、事前に作成したServiceAcountをALBに紐づける。

```bash
# FargateにAWS LBコントローラーをデプロイする場合
$ helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName=foo-eks-cluster \
    --set serviceAccount.create=false \
    --set serviceAccount.name=aws-load-balancer-controller \
    --set image.repository=602401143452.dkr.ecr.ap-northeast-1.amazonaws.com/amazon/aws-load-balancer-controller \
    --set region=ap-northeast-1 \
    --set vpcId=<VPCID>
 
AWS Load Balancer controller installed!
```

```bash
# EC2にAWS LBコントローラーをデプロイする場合
$ helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName=foo-eks-cluster \
    --set serviceAccount.create=false \
    --set serviceAccount.name=aws-load-balancer-controller \
    --set image.repository=602401143452.dkr.ecr.ap-northeast-1.amazonaws.com/amazon/aws-load-balancer-controller
    
AWS Load Balancer controller installed!
```

（８）AWS LBコントローラーがデプロイされ、READY状態になっていることを確認する。

```bash
$ helm list -n kube-system

NAME                            NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                                   APP VERSION
aws-load-balancer-controller    kube-system     2               2022-01-01 00:00:00.309065 +0900 JST    deployed        aws-load-balancer-controller-1.4.2      v2.4.2

$ kubectl get deployment -n kube-system aws-load-balancer-controller

NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
aws-load-balancer-controller   2/2     2            0           22m
```

もし、以下の様に、```53```番ポートへの接続でエラーになる場合は、CoreDNSによる名前解決が正しくできていないため、CoreDNSが正常に稼働しているかを確認する。

```yaml
{"level":"error","ts":*****.*****,"logger":"controller-runtime.manager.controller.ingress","msg":"Reconciler error","name":"foo-ingress","namespace":"foo","error":"ingress: foo/foo-ingress: WebIdentityErr: failed to retrieve credentials\ncaused by: RequestError: send request failed\ncaused by: Post \"https://sts.ap-northeast-1.amazonaws.com/\": dial tcp: lookup sts.ap-northeast-1.amazonaws.com on nnn.nn.n.nn:53: read udp nnn.n.n.nnn:43958->nnn.nn.n.nn:53: read: connection refused"}
```

（９）Ingressをデプロイし、IngressからALB Ingressを自動的に作成させる。以下の条件を満たす必要がある。

参考：https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html

#### ▼ IngressとALBの紐付け

参考：

- https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.4/guide/ingress/annotations/
- https://qiita.com/murata-tomohide/items/ea4d9acefda92e05e20f

| 項目                                            | 説明                                                         |
| ----------------------------------------------- | ------------------------------------------------------------ |
| ```alb.ingress.kubernetes.io/certificate-arn``` | ALB IngressでHTTPS通信を受け付ける場合に、SSL証明書のARNを設定する。 |
| ```alb.ingress.kubernetes.io/listen-ports```    | ALB Ingressでインバウンド通信を受け付けるポート番号を設定する。 |
| ```alb.ingress.kubernetes.io/scheme```          | ALB Ingressのスキームを設定する。                            |
| ```alb.ingress.kubernetes.io/subnets```         | ALB Ingressのルーティング先とするサブネットを設定する。      |
| ```alb.ingress.kubernetes.io/target-type```     | ルーティング先のターゲットタイプを設定する。Fargateの場合は、```ip```を設定する必要がある。 |
| ```alb.ingress.kubernetes.io/waf-acl-id```      | LBに紐づけるWAFv1のIDを設定する。ALBと同じリージョンで、WAFv1を作成する必要がある。 |
| ```alb.ingress.kubernetes.io/wafv2-acl-arn```   | LBに紐づけるWAFv2のARNを設定する。ALBと同じリージョンで、WAFv2を作成する必要がある。 |

<br>

### デバッグ

#### ▼ ダッシュボード

（１）EKSのコンテキストを作成する。

参考：https://docs.aws.amazon.com/eks/latest/userguide/getting-started-console.html

```bash
$ aws eks update-kubeconfig --region ap-northeast-1 --name foo-eks-cluster
```

（２）kubectlコマンドの宛先を、EKSのkube-apiserverに変更する。

参考：https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html#deploy-dashboard

```bash
$ kubectl config use-context <ClusterのARN>
```

（３）manifest.yamlファイルを使用して、ダッシュボードのKubernetesリソースをEKSにデプロイする。

参考：https://docs.aws.amazon.com/eks/latest/userguide/dashboard-tutorial.html#eks-admin-service-account

```bash
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.5/aio/deploy/recommended.yaml
```

（４）ダッシュボードに安全に接続するために、ServiceAccountをEKSにデプロイする

```bash
$ kubectl apply -f service-account.yml
```

（５）トークンの文字列を取得する。

```bash
$ kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep eks-admin | awk '{print $1}')
```

（６）ローカルマシンからEKSにポートフォワーディングを実行する。

```bash
$ kubectl proxy
```

（７）ダッシュボードに接続する。

```http
GET http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#!/login HTTP/1.1
```

<br>

## 03-03-02. on Fargate

### セットアップ

#### ▼ 制約

EC2にはない制約については、以下のリンクを参考にせよ。

参考：

- https://docs.aws.amazon.com/eks/latest/userguide/fargate.html
- https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/install-ssm-agent-on-amazon-eks-worker-nodes-by-using-kubernetes-daemonset.html

#### ▼ メトリクス収集

ワーカーNode内のメトリクスのデータポイントを収集する上で、FargateはDaemonSetに非対応のため、メトリクス収集コンテナをサイドカーコンテナとして設置する必要がある。収集ツールとして、OpenTelemetryをサポートしている。

参考：https://aws.amazon.com/jp/blogs/news/introducing-amazon-cloudwatch-container-insights-for-amazon-eks-fargate-using-aws-distro-for-opentelemetry/

#### ▼ ログルーティング

ワーカーNode内のログを転送する上で、FargateはDaemonSetに非対応のため、ログ転送コンテナをサイドカーコンテナとして設置する必要がある。ロググーティングツールとして、FluentBitをサポートしている。

参考：https://docs.aws.amazon.com/eks/latest/userguide/fargate-logging.html

（１）ログ転送コンテナのためのNamespaceを作成する。名前は、必ず```aws-observability```とする。

参考：https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/ 

```yaml
kind: Namespace
apiVersion: v1
metadata:
  name: aws-observability
  labels:
    aws-observability: enabled
```

（２）```aws-observability```内で```aws-logging```という名前のConfigMapを作成することにより、ログ転送コンテナとしてFluentBitコンテナが作成され、PodからCloudWatchログにログを送信できるようになる。名前は、必ず```aws-logging```とする。

参考：https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/

```bash
$ kubectl apply -f config-map.yaml
```

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: aws-logging
  namespace: aws-observability
data:
  output.conf: |
    [OUTPUT]
        Name cloudwatch
        Match *
        region ap-northeast-1
        log_group_name fluent-bit-cloudwatch
        log_stream_prefix from-fluent-bit-
        auto_create_group true
```

（３）ワーカーNode（EC2、Fargate）にECRやCloudWatchへのアクセス権限を持つポッド実行ロールを付与しておく。これにより、KubernetesリソースにAWSへのアクセス権限が付与され、ServiceAccountやSecretを作成せずとも、PodがECRからコンテナイメージをプルできる様になる。一方で、Pod内のコンテナには権限が付与されないため、Podが作成された後に必要な権限（例：コンテナがRDSにアクセスする権限など）に関しては、ServiceAccountとIAMロールの紐付けが必要である。

参考：

- https://nishipy.com/archives/1122
- https://toris.io/2021/01/how-kubernetes-pulls-private-container-images-on-aws/
- https://docs.aws.amazon.com/eks/latest/userguide/fargate-getting-started.html
- https://kumano-te.com/activities/apply-iam-roles-to-eks-service-accounts
- https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/

<br>

### Fargate Node

#### ▼ Fargate Nodeとは

Fargate上で稼働するKubernetesのホストのこと。KubernetesのNodeに相当する。EC2と比べてカスタマイズ性が低く、Node当たりで稼働するPod数はAWSが管理する。一方で、各EC2のサチュレーションをユーザーが管理しなくてもよいため、Kubernetesのホストの管理が楽である。

参考：

- https://www.sunnycloud.jp/column/20210315-01/
- https://aws.amazon.com/jp/blogs/news/using-alb-ingress-controller-with-amazon-eks-on-fargate/

![eks_on_fargate](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_on_fargate.png)

#### ▼ Fargateプロファイル

Fargateを設定する。

参考：https://docs.aws.amazon.com/eks/latest/userguide/fargate-profile.html#fargate-profile-components

| コンポーネント名            | 説明                                                         | 補足                                                         |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Pod実行ロール               | kubeletがAWSリソースにアクセスできるように、Podにロールを設定する。 | ・実行ポリシー（AmazonEKSFargatePodExecutionRolePolicy）には、ECRへのアクセス権限のみが付与されている。<br>・信頼されたエンティティでは、```eks-fargate-pods.amazonaws.com```を設定する必要がある。<br>参考：https://docs.aws.amazon.com/eks/latest/userguide/pod-execution-role.html |
| サブネット                  | EKS Fargate Nodeが起動するサブネットIDを設定する。           | プライベートサブネットを設定する必要がある。                 |
| ポッドセレクタ（Namespace） | EKS Fargate Node上で稼働させるPodを固定できるように、PodのNamespaceの値を設定する。 | ・```kube-system```や```default```を指定するKubernetesリソースが稼働できるように、ポッドセレクタにこれを追加する必要がある。<br>・IstioやArgoCDを、それ専用のNamespaceで稼働させる場合は、そのNamespaceのためのプロファイルを作成しておく必要がある。 |
| ポッドセレクタ（Label）     | EKS Fargate Node上で稼働させるPodを固定できるように、Podの任意のlabelキーの値を設定する。 |                                                              |

<br>

## 03-03-03. on EC2

### EC2 Node

#### ▼ EC2 Nodeとは

EC2で稼働するKubernetesのホストのこと。Fargateと比べてカスタマイズ性が高く、Node当たりで稼働するPod数に重み付けを設定できる。一方で、各EC2のサチュレーションをユーザーが管理しなければならないため、Kubernetesのホストの管理が大変である。

参考：https://www.sunnycloud.jp/column/20210315-01/

![eks_on_ec2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_on_ec2.png)

<br>

## 04. EFS：Elastic File System

![EFSのファイル共有機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/EFSのファイル共有機能.png)

### EFSとは

マウントターゲットと接続された片方のEC2インスタンスから、ファイルを読み出し、これをもう一方に出力する。ファイルの実体はいずれかのEC2に存在しているため、接続を切断している間、片方のEC2インスタンス内のファイルは無くなる。再接続すると、切断直前のファイルが再び表示されようになる。

<br>

### セットアップ

| 設定項目                 | 説明                                                         | 補足                                                         |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| パフォーマンスモード     |                                                              |                                                              |
| スループットモード       | EFSのスループット性能を設定する。                            |                                                              |
| ライフサイクルポリシー   | しばらくリクエストされていないファイルが低頻度アクセス（IA：Infrequent Access）ストレージクラスに移動保存するまでの期限を設定する。 | ・ライフサイクルポリシーを有効にしない場合、スタンダードストレージクラスのみが使用される。<br>・画面から両ストレージのサイズを確認できる。<br>参考：https://ap-northeast-1.console.aws.amazon.com/efs/home?region=ap-northeast-1#/file-systems/fs-f77d60d6 |
| ファイルシステムポリシー | 他のAWSリソースがEFSを利用する時のポリシーを設定する。       |                                                              |
| 自動バックアップ         | AWS Backupに定期的に保存するかどうかを設定する。             |                                                              |
| ネットワーク             | マウントターゲットを設置するサブネット、セキュリティグループを設定する。 | ・サブネットは、ファイル供給の速度の観点から、マウントターゲットにアクセスするAWSリソースと同じにする。<br>・セキュリティグループは、EC2からのNFSプロトコルアクセスを許可したものを設定する。EC2のセキュリティグループを通過したアクセスだけを許可するために、IPアドレスでは、EC2のセキュリティグループを設定する。 |

<br>

### スペック

#### ▼ バーストモードの仕組み

スループット性能の自動スケーリングに残高があり、ベースラインを超過した分だけ自動スケーリング残高が減っていく。また、ベースライン未満の分は残高として蓄積されていく。

![burst-mode_balance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/burst-mode_credit-balance-algorithm.png)

元の残高は、ファイルシステムのスタンダードストレージクラスのサイズに応じて大きくなる。

参考：https://docs.aws.amazon.com/efs/latest/ug/performance.html#efs-burst-credits

![burst-mode_credit](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/burst-mode_credit-balance-size.png)

残高は、```BurstCreditBalance```メトリクスから確認できる。このメトリクスが常に減少し続けている場合はプロビジョニングモードの方がより適切である。

参考：https://docs.aws.amazon.com/efs/latest/ug/performance.html#using-throughputmode

#### ▼ プロビジョニングモードの仕組み

スループット性能の自動スケーリング機能は無いが、一定の性能は保証されている。

参考：https://docs.aws.amazon.com/efs/latest/ug/performance.html#provisioned-throughput

![burst-mode_credit](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/provisioning-mode_credit-balance-size.png)

<br>

### コマンド

#### ▼ マウント

DNS経由で、EFSマウントヘルパーを使用した場合を示す。

参考：https://qiita.com/tandfy/items/829f9fcc68c4caabc660

```bash
# EFSで、マウントポイントを登録
# mount -t efs -o tls <ファイルシステムID>:<マウント元ディレクトリ> <マウントポイント>
$ mount -t efs -o tls fs-*****:/ /var/www/foo

# マウントポイントを解除
$ umount /var/www/foo

# dfコマンドでマウントしているディレクトリを確認できる
$ df
Filesystem                                  1K-blocks Used Available Use% Mounted on
fs-*****.efs.ap-northeast-1.amazonaws.com:/ xxx       xxx  xxx       1%   /var/www/cerenavi
```

<br>

## 05. ElastiCache

### ElasticCacheとは

アプリケーションの代わりに、セッション、クエリキャッシュ、を管理する。RedisとMemcachedがある。

<br>

## 05-02. ElastiCache for Redis

### セットアップ

| 設定項目                         | 説明                                                         | 補足                                                         |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| クラスターエンジン               | 全てのRedisノードのキャッシュエンジンを設定する。Redis通常モード、Redisクラスターモードから選択する。 | Redisクラスターモードと同様に、Redis通常モードもクラスター構成になる。ただし、クラスターモードとはクラスターの構成方法が異なる。 |
| ロケーション                     |                                                              |                                                              |
| エンジンバージョンの互換性       | 全てのRedisノードのキャッシュエンジンのバージョンを設定する。 | マイナーバージョンが自動的に更新されないように、例えば『```6.x```』は設定しない方が良い。 |
| パラメーターグループ             | 全てのRedisノードのグローバルパラメーターを設定する。        | デフォルトを使用せずに独自定義する場合、事前に作成しておく必要がある。 |
| ノードのタイプ                   |                                                              |                                                              |
| レプリケーション数               | プライマリーノードとは別に、リードレプリカノードをいくつ作成するかを設定する。 | マルチAZにプライマリーノードとリードレプリカノードを1つずつ配置させる場合、ここでは『1個』を設定する。 |
| マルチAZ                         | プライマリーノードとリードレプリカを異なるAZに配置するかどうかを設定する。合わせて、自動フェイルオーバーを実行できるようになる。 |                                                              |
| サブネットグループ               | Redisにアクセスできるサブネットを設定する。                  |                                                              |
| セキュリティ                     | セキュリティグループを設定する。                             |                                                              |
| クラスターへのデータのインポート | あらかじめ作成しておいたバックアップをインポートし、これを元にRedisを作成する。 | セッションやクエリキャッシュを引き継げる。そのため、新しいRedisへのセッションデータの移行に役立つ。<br>参考：https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/backups-seeding-redis.html |
| バックアップ                     | バックアップの有効化、保持期間、時間を設定する。             | バックアップを取るほどでもないため、無効化しておいて問題ない。 |
| メンテナンス                     | メンテナンスの時間を設定する。                               |                                                              |

<br>

### Redisクラスター

#### ▼ Redisクラスターとは

![redis-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/redis-cluster.png)

複数のRedisノードを持つRedisシャードから構成されている。1つのリクエストを処理するグループ単位である。

参考：

- https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Terms.html

- https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Clusters

#### ▼ クラスターモード

クラスターモードを有効にすると、Redisクラスター内に複数のRedisシャードが作成される。反対に無効化すると、シャードは1つだけ作成される。

参考：https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.ReplicationGroups

<br>

### Redisシャード

#### ▼ Redisシャードとは

Redisノードのグループ。同じデータを保持するグループ単位であり、プライマリーノードとレプリカノードが含まれる。同じRedisシャード内にあるRedisノード間では、セッションやクエリキャッシュが同期される。一方で、AuroraのDBクラスターはこれに相当する概念である。

参考：https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Shards

<br>

### Redisノード

#### ▼ Redisノードとは

セッションやクエリキャッシュを保持するインスタンスのこと。

<br>

### セッション管理機能

#### ▼ セッション管理機能とは

サーバー内のセッションデータの代わりにセッションIDを管理し、冗長化されたアプリケーション間で共通のセッションIDを使用できるようにする。そのため、リリース後に既存のセッションが破棄されることがなくなり、ログイン状態を保持できるようになる。セッションIDについては、以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html

![ElastiCacheのセッション管理機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ElastiCacheのセッション管理機能.png)

<br>

### クエリキャッシュ管理機能

#### ▼ クエリキャッシュ管理機能とは

RDSに対するSQLと読み出されたデータを、キャッシュとして管理する。

![クエリCache管理機能_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クエリCache管理機能_1.png)

（１）アプリケーションは、RDSの前に、Redisに対してSQLを実行する。

```sql
SELECT * FROM users;
```

（２）始めて実行されたSQLの場合、RedisはSQLをキーとして保存し、キャッシュが無いことがアプリケーションに返却する。

（３）アプリケーションはRDSに対してSQLを実行する。

（４）データが読み出される。

（５）アプリケーションはRedisにデータを登録する。

```bash
# ElastiCacheには、SQLの実行結果がまだ保存されていない

*** no cache ***
{"id"=>"1", "name"=>"alice"}
{"id"=>"2", "name"=>"bob"}
{"id"=>"3", "name"=>"charles"}
{"id"=>"4", "name"=>"donny"}
{"id"=>"5", "name"=>"elie"}
{"id"=>"6", "name"=>"fabian"}
{"id"=>"7", "name"=>"gabriel"}
{"id"=>"8", "name"=>"harold"}
{"id"=>"9", "name"=>"Ignatius"}
{"id"=>"10", "name"=>"jonny"}
```

![クエリCache管理機能_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クエリCache管理機能_2.png)

（６）次回、アプリケーションは、RDSの前に、Redisに対してSQLを実行する。

```sql
SELECT * FROM users;
```

（７）Redisは、SQLをキーにしてデータを特定し、アプリケーションに返却する。

```bash
# ElastiCacheには、SQLの実行結果が既に保存されている

*** cache hit ***
{"id"=>"1", "name"=>"alice"}
{"id"=>"2", "name"=>"bob"}
{"id"=>"3", "name"=>"charles"}
{"id"=>"4", "name"=>"donny"}
{"id"=>"5", "name"=>"elie"}
{"id"=>"6", "name"=>"fabian"}
{"id"=>"7", "name"=>"gabriel"}
{"id"=>"8", "name"=>"harold"}
{"id"=>"9", "name"=>"Ignatius"}
{"id"=>"10", "name"=>"jonny"}
```

#### ▼ クエリキャッシュの操作

```bash
# Redis接続コマンド
$ /usr/local/sbin/redis-stable/src/redis-cli \
    -c \
    -h <Redisのホスト名> \
    -p 6379
```

```bash
# Redis接続中の状態
# 全てのキーを表示
redis *****:6379> keys *
```

```bash
# Redis接続中の状態
# キーを指定して、対応する値を表示
redis *****:6379> type <キー名>
```

```bash
# Redis接続中の状態
# Redisが受け取ったコマンドをフォアグラウンドで表示
redis *****:6379> monitor
```

<br>

### 障害対策

#### ▼ フェイルオーバー

ノードの障害を検知し、障害が発生したノードを新しいものに置き換わる。

| 障害の発生したノード | 挙動                                                         |
| -------------------- | ------------------------------------------------------------ |
| プライマリーノード   | リードレプリカの1つがプライマリーノードに昇格し、障害が起きたプライマリーノードと置き換わる。 |
| リードレプリカノード | 障害が起きたリードレプリカノードが、別の新しいものに置き換わる。 |

<br>

### Redisクラスターのダウンタイム

#### ▼ ダウンタイムの発生条件

| 変更する項目       | ダウンタイムの有無 | ダウンタイム                          |
| ------------------ | ------------------ | ------------------------------------- |
| エンジンバージョン | あり               | 1分30秒ほどのダウンタイムが発生する。 |

<br>

### 計画的なダウンタイム

#### ▼ 計画的なダウンタイムとは

Redisクラスターでは、エンジンバージョンなどのアップグレード時に、Redisノードの再起動が必要である。サイトの利用者に与える影響を小さくできるように、計画的にダウンタイムを発生させる必要がある。

#### ▼ バックアップとインポートによるダウンタイムの最小化

以下の手順で、ダウンタイムを最小限にしてアップグレードできる。

（１）RedisのセッションやクエリキャッシュをS3にエクスポートする。

（２）新しいRedisを作成する。この時、インポートを使用して、セッションやクエリキャッシュを引き継いだRedisクラスターを別途作成する。

（３）新しく作成したRedisクラスターをアップグレードする。

（４）アプリケーションの接続先を古いRedisクラスターから新しいものに変更する。

（５）古いRedisクラスターを削除する。

<br>

## 05. EventBridge（CloudWatchイベント）

### EventBridge（CloudWatchイベント）とは

AWSリソースで起こったイベントを、他のAWSリソースに転送する。サポート対象のAWSリソースは以下のリンクを参考にせよ。

参考：https://docs.aws.amazon.com/eventbridge/latest/userguide/what-is-amazon-eventbridge.html

<br>

### パターン

#### ▼ イベントパターン

指定したAWSリソースでイベントが起こると、以下のようなJSONが送信される。イベントパターンを定義し、JSON構造が一致するイベントのみをターゲットに転送する。イベントパターンに定義しないキーは任意のデータと見なされる。

参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/CloudWatchEventsandEventPatterns.html

```yaml
{
  "version": "0",
  "id": "*****",
  "detail-type": "<イベント名>",
  "source": "aws.<AWSリソース名>",
  "account": "*****",
  "time": "2021-01-01T00:00:00Z",
  "region": "us-west-1",
  "resources": [
    "<イベントを起こしたリソースのARN>"
  ],
  "detail": {
    // その時々のイベントごとに異なるデータ
  }
}
```

**＊実装例＊**

Amplifyの指定したIDのアプリケーションが、```Amplify Deployment Status Change```のイベントを送信し、これの```jobStatus```が```SUCCEED```/```FAILED```だった場合、これを転送する。

```yaml
{
  "detail": {
    "appId": [
      "foo",
      "bar"
    ],
    "jobStatus": [
      "SUCCEED",
      "FAILED"
    ]
  },
  "detail-type": [
    "Amplify Deployment Status Change"
  ],
  "source": "aws.amplify"
}
```

#### ▼ スケジュール

cron式またはrate式を使用して、スケジュールを定義する。これとLambdaを組み合わせることにより、バッチ処理を作成できる。

参考：https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html

<br>

### ターゲット

#### ▼ ターゲットの一覧

参考：https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-targets.html

#### ▼ デバッグ

EventBridgeでは、どのようなJSONのイベントをターゲットに転送したかを確認できない。そこで、デバッグ時はEventBridgeのターゲットにLambdaを設定し、イベント構造をログから確認する。

**＊実装例＊**

あらかじめ、イベントの内容を出力する関数をLambdaに作成しておく。

```javascript
// Lambdaにデバッグ用の関数を用意する
exports.handler = async (event) => {
    console.log(JSON.stringify({event}, null, 2));
};
```

対象のAWSリソースで任意のイベントが起こった時に、EventBridgeからLambdaに転送するように設定する。

```yaml
{
  "source": "aws.amplify"
}
```

AWSリソースで意図的にイベントを起こし、Lambdaのロググループから内容を確認する。```detail```キーにイベントが割り当てられている。

```yaml
{
    "event": {
        "version": "0",
        "id": "b4a07570-eda1-9fe1-da5e-b672a1705c39",
        "detail-type": "Amplify Deployment Status Change",
        "source": "aws.amplify",
        "account": "<アカウントID>",
        "time": "<イベントの発生時間>",
        "region": "ap-northeast-1",
        "resources": [
            "<AmplifyのアプリケーションのARN>"
        ],
        "detail": {
            "appId": "<アプリケーションID>",
            "branchName": "<ブランチ名>",
            "jobId": "<ジョブID>",
            "jobStatus": "<CI/CDのステータス>"
        }
    }
}
```

<br>

### 入力

#### ▼ 入力トランスフォーマー

入力パスで使用する値を抽出し、入力テンプレートで転送するJSONを定義できる。イベントのJSONの値を変数として出力できる。```event```キーをドルマークとして、ドットで繋いでアクセスする。

**＊実装例＊**

入力パスにて、使用する値を抽出する。Amplifyで起こったイベントのJSONを変数として取り出す。JSONのキー名が変数名として機能する。

```yaml
{
  "appId": "$.detail.appId",
  "branchName": "$.detail.branchName",
  "jobId": "$.detail.jobId",
  "jobStatus": "$.detail.jobStatus",
  "region": "$.region"
}
```

入力テンプレートにて、転送するJSONを定義する。例えばここでは、Slackに送信するJSONに出力する。出力するときは、入力パスの変数名を『```<>```』で囲う。Slackに送信するメッセージの作成ツールは、以下のリンクを参考にせよ。

参考：https://app.slack.com/block-kit-builder

```yaml
{
  "channel": "foo",
  "text": "Amplifyデプロイ完了通知",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":github: PullReq検証用環境"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "*結果*: <jobStatus>"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "*ブランチ名*: <branchName>"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "*検証URL*: https://<branchName>.<appId>.amplifyapp.com"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": ":amplify: <https://<region>.console.aws.amazon.com/amplify/home?region=<region>#/<appId>/<branchName>/<jobId>|*Amplifyコンソール*"

```

<br>
