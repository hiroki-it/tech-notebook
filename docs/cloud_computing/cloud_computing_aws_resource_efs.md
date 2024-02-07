---
title: 【IT技術の知見】EFS＠AWSリソース
description: EFS＠AWSリソースの知見を記録しています。
---

# EFS＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. EFS：Elastic File Systemとは

マウントターゲットと接続された片方のEC2から、ファイルを読み出し、これをもう一方に出力する。

ファイルの実体はいずれかのEC2に存在しているため、接続を切断している間、片方のEC2内のファイルは無くなる。

再接続すると、切断直前のファイルが再び表示されようになる。

![EFSのファイル共有機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/EFSのファイル共有機能.png)

<br>

## 02. セットアップ

### コンソール画面の場合

| 設定項目                 | 説明                                                                                                                                | 補足                                                                                                                                                                                                                                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| パフォーマンスモード     |                                                                                                                                     |                                                                                                                                                                                                                                                                                                                             |
| スループットモード       | EFSのスループット性能を設定する。                                                                                                   |                                                                                                                                                                                                                                                                                                                             |
| ライフサイクルポリシー   | しばらくリクエストされていないファイルが低頻度アクセス (IA：Infrequent Access) ストレージクラスに移動保存するまでの期限を設定する。 | ・ライフサイクルポリシーを有効にしない場合、スタンダードストレージクラスのみが使用される。<br>・画面から両ストレージのサイズを確認できる。<br>https://ap-northeast-1.console.aws.amazon.com/efs/home?region=ap-northeast-1#/file-systems/fs-f77d60d6                                                                        |
| ファイルシステムポリシー | 他のAWSリソースがEFSを利用する時のポリシーを設定する。                                                                              |                                                                                                                                                                                                                                                                                                                             |
| 自動バックアップ         | AWS Backupに定期的に保存するか否かを設定する。                                                                                      |                                                                                                                                                                                                                                                                                                                             |
| ネットワーク             | マウントターゲットを配置するサブネット、セキュリティグループを設定する。                                                            | ・サブネットは、ファイル供給の速度の観点から、マウントターゲットにリクエストを送信するAWSリソースと同じにする。<br>・セキュリティグループは、EC2からのNFSプロトコルアクセスを許可したものを設定する。EC2のセキュリティグループを通過したアクセスのみを許可するために、IPアドレスでは、EC2のセキュリティグループを設定する。 |

<br>

## 02. スペック

### バーストモードの仕組み

スループット性能の自動スケーリングに残高があり、ベースラインを超過した分だけ自動スケーリング残高が減っていく。

また、ベースライン未満の分は残高として蓄積されていく。

![burst-mode_balance](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/burst-mode_credit-balance-algorithm.png)

元の残高は、ファイルシステムのスタンダードストレージクラスのサイズに応じて大きくなる。

> - https://docs.aws.amazon.com/efs/latest/ug/performance.html#efs-burst-credits

![burst-mode_credit](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/burst-mode_credit-balance-size.png)

残高は、`BurstCreditBalance`メトリクスから確認できる。

このメトリクスが常に減少し続けている場合はプロビジョニングモードの方がより適切である。

> - https://docs.aws.amazon.com/efs/latest/ug/performance.html#using-throughputmode

<br>

### プロビジョニングモードの仕組み

スループット性能の自動スケーリング機能は無いが、一定の性能は保証されている。

![burst-mode_credit](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/provisioning-mode_credit-balance-size.png)

> - https://docs.aws.amazon.com/efs/latest/ug/performance.html#provisioned-throughput

<br>

## マウントポイント

### 登録

`mount`コマンドを使用して、EFSに対してマウントポイントを登録する。

```bash
# mount -t efs -o tls <ファイルシステムID>:<マウント元ディレクトリ> <マウントポイント>
$ mount -t efs -o tls fs-*****:/ /var/www/foo
```

> - https://qiita.com/tandfy/items/829f9fcc68c4caabc660

<br>

### 解除

`unmount`コマンドを使用して、マウントポイントを解除する。

`df`コマンドで、EFSのDNS名と、マウントされているEC2内のディレクトリを確認した後、`unmount`コマンドを実行する。

```bash
$ df
Filesystem                                  1K-blocks Used Available Use% Mounted on
fs-*****.efs.ap-northeast-1.amazonaws.com:/ xxx       xxx  xxx       1%   /var/www/foo

$ umount /var/www/foo
```

> - https://qiita.com/tandfy/items/829f9fcc68c4caabc660

<br>
