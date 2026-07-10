---
title: 【IT技術の知見】Packer＠IaC
description: Packer＠IaCの知見を記録しています。
---

# Packer＠IaC

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Packerの仕組み

### アーキテクチャ

テンプレートファイルに基づいて、さまざまなプラットフォームの仮想サーバーとこれのマシンイメージを作成する。

仮想サーバーは、マシンイメージの作成後に削除する。

<br>

### ユースケース

#### ▼ プラットフォームがAWSの場合

プロビジョナーを使用して Amazon EC2 をプロビジョニングし、その Amazon EC2 から AWS AMI を作成する。

AWS AMI の作成後、Amazon EC2 を削除する。

例えば、Packer でプロビジョナーとして Ansible を指定して AWS AMI を作成しつつ、Terraform で AWS AMI から Amazon EC2 を作成したとする。

これにより、クラウドインフラのプロビジョニングで Ansible と Terraform が共存できるようになる。

注意点として、起動中の Amazon EC2 から AWS AMI を作成するわけではなく、設定値が同じ新しい Amazon EC2 から AWS AMI を作成する。

また、AWS AMI に内蔵されている AWS EBS ボリュームも、既存の Amazon EC2 のものではなく、新品のものである。

既存の Amazon EC2 のバックアップツールとしては使用できない。

![packer_aws](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/packer_aws.png)

> - https://aws.amazon.com/jp/blogs/mt/migrating-from-hashicorp-packer-to-ec2-image-builder/
> - https://qiita.com/mitzi2funk/items/c963483a11a1912e3c44#01-2-use-case

<br>
