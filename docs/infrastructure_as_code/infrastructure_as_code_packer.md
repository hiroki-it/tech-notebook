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

プロビジョナーを使用してAWS EC2をプロビジョニングし、そのAWS EC2からAWS AMIを作成する。

AWS AMIの作成後、AWS EC2を削除する。

例えば、PackerでプロビジョナーとしてAnsibleを指定してAWS AMIを作成しつつ、TerraformでAWS AMIからAWS EC2を作成したとする。

これにより、クラウドインフラのプロビジョニングでAnsibleとTerraformが共存できるようになる。

注意点として、起動中のAWS EC2からAWS AMIを作成するわけではなく、設定値が同じ新しいAWS EC2からAWS AMIを作成する。

また、AWS AMIに内蔵されているAWS EBSボリュームも、既存のAWS EC2のものではなく、新品のものである。

既存のAWS EC2のバックアップツールとしては使用できない。

![packer_aws](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/packer_aws.png)

> - https://aws.amazon.com/jp/blogs/mt/migrating-from-hashicorp-packer-to-ec2-image-builder/
> - https://qiita.com/mitzi2funk/items/c963483a11a1912e3c44#01-2-use-case

<br>
