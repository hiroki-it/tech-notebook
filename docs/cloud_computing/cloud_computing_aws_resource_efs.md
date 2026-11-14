---
title: 【IT技術の知見】Amazon EFS
description: Amazon EFSの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# Amazon EFS

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


マウントターゲットと接続された片方の EC2 から、ファイルを読み出し、これをもう一方に出力する。

ファイルの実体はいずれかの EC2 に存在しているため、接続を切断している間、片方の EC2 内のファイルは無くなる。

再接続すると、切断直前のファイルが再び表示されようになる。

![AWS EFSのファイル共有機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/EFSのファイル共有機能.png)

<br>

## 02. 仕組み

## 03. セットアップ

### Terraformによる構築

terraform-aws-modules の EFS モジュールを使用し、暗号化したファイルシステムと 2 つの AZ のマウントターゲットを作成する。

既存の VPC と異なる AZ のサブネットを指定し、NFS 接続元のセキュリティグループを許可する。

```terraform
module "efs" {
  source  = "terraform-aws-modules/efs/aws"
  version = "2.2.1"

  name                  = "foo-efs"
  security_group_vpc_id = "vpc-0123456789abcdef0"
  mount_targets = {
    az_a = { subnet_id = "subnet-0123456789abcdef0" }
    az_c = { subnet_id = "subnet-0123456789abcdef1" }
  }
  security_group_ingress_rules = {
    nfs = {
      referenced_security_group_id = "sg-0123456789abcdef0"
    }
  }
}
```

> - [terraform-aws-modules/efs/aws (2.2.1) - Terraform Registry](https://registry.terraform.io/modules/terraform-aws-modules/efs/aws/2.2.1)

<br>

### ファイルシステムの初期設定

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
      <td>パフォーマンスモード</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>スループットモード</td>
      <td>AWS EFS のスループット性能を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>ライフサイクルポリシー</td>
      <td>しばらくリクエストされていないファイルが低頻度アクセス (IA：Infrequent Access) ストレージクラスに移動保管するまでの有効期限を設定する。</td>
      <td>・ライフサイクルポリシーを有効化しない場合、スタンダードストレージクラスのみが使用される。<br>・画面から両ストレージのサイズを確認できる。<br><a href="https://ap-northeast-1.console.aws.amazon.com/efs/home?region=ap-northeast-1#/file-systems/fs-f77d60d6">https://ap-northeast-1.console.aws.amazon.com/efs/home?region=ap-northeast-1#/file-systems/fs-f77d60d6</a></td>
    </tr>
    <tr>
      <td>ファイルシステムポリシー</td>
      <td>他の AWS リソースが AWS EFS を利用するときのポリシーを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>自動バックアップ</td>
      <td>AWS Backup に定期的に保管するか否かを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>ネットワーク</td>
      <td>マウントターゲットを配置するサブネット、セキュリティグループを設定する。</td>
      <td>・サブネットは、ファイル供給の速度の観点から、マウントターゲットにリクエストを送信する AWS リソースと同じにする。<br>・セキュリティグループは、EC2 からの NFS プロトコルアクセスを許可したものを設定する。EC2 のセキュリティグループを通過したアクセスのみを許可するために、IP アドレスでは、EC2 のセキュリティグループを設定する。</td>
    </tr>
  </tbody>
</table>

<br>

## 04. スループットの制御

### バーストモードの仕組み

スループット性能のオートスケーリングに残高があり、ベースラインを超過した分だけオートスケーリング残高が減っていく。

また、ベースライン未満の分は残高として蓄積されていく。

![burst-mode_balance](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/burst-mode_credit-balance-algorithm.png)

元の残高は、ファイルシステムのスタンダードストレージクラスのサイズに応じて大きくなる。

> - [Amazon EFS performance specifications - Amazon Elastic File System](https://docs.aws.amazon.com/efs/latest/ug/performance.html#efs-burst-credits)

![burst-mode_credit](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/burst-mode_credit-balance-size.png)

残高は、`BurstCreditBalance` メトリクスから確認できる。

このメトリクスが常に減少し続けている場合はプロビジョニングモードのほうがより適切である。

> - [Amazon EFS performance specifications - Amazon Elastic File System](https://docs.aws.amazon.com/efs/latest/ug/performance.html#using-throughputmode)

<br>

### プロビジョニングモードの仕組み

スループット性能のオートスケーリング機能はないが、一定の性能は保証されている。

![burst-mode_credit](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/provisioning-mode_credit-balance-size.png)

> - [Amazon EFS performance specifications - Amazon Elastic File System](https://docs.aws.amazon.com/efs/latest/ug/performance.html#provisioned-throughput)

<br>

## 05. ファイルシステムのマウント

### 登録

`mount` コマンドを使用して、AWS EFS にマウントする。

```bash
# mount -t efs -o tls <ファイルシステムID>:<マウント元ディレクトリ> <マウントポイント>
$ mount -t efs -o tls fs-*****:/ /var/www/foo
```

> - [AWS EFS をEC2にマウントしてみる #AWS - Qiita](https://qiita.com/tandfy/items/829f9fcc68c4caabc660)

<br>

### 解除

`unmount` コマンドを使用して、AWS EFS からアンマウントする。

`df` コマンドで、AWS EFS の DNS 名と、マウントされている EC2 内のディレクトリを確認した後、`unmount` コマンドを実行する。

```bash
$ df
Filesystem                                  1K-blocks Used Available Use% Mounted on
fs-*****.efs.ap-northeast-1.amazonaws.com:/ xxx       xxx  xxx       1%   /var/www/foo

$ umount /var/www/foo
```

> - [AWS EFS をEC2にマウントしてみる #AWS - Qiita](https://qiita.com/tandfy/items/829f9fcc68c4caabc660)

<br>
