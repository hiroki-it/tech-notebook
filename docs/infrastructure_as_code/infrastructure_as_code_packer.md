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

記入中...

<br>

### ユースケース

#### ▼ AWSの場合

プロビジョナーを使用してEC2をプロビジョニングし、そのEC2からAMIを作成する。

AMIの作成後、EC2を削除する。

例えば、PackerでプロビジョナーとしてAnsibleを指定してAMIを作成しつつ、TerraformでAMIからEC2を作成したとする。

これにより、クラウドインフラのプロビジョニングでAnsibleとTerraformが共存できるようになる。

注意点として、起動中のEC2からAMIを作成するわけではなく、設定値が同じ新しいEC2からAMIを作成する。

また、AMIに内蔵されているEBSボリュームも、既存のEC2のものではなく、新品のものである。

既存のEC2のバックアップツールとしては使用できない。

![packer_aws](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/packer_aws.png)

> - https://aws.amazon.com/jp/blogs/mt/migrating-from-hashicorp-packer-to-ec2-image-builder/
> - https://qiita.com/mitzi2funk/items/c963483a11a1912e3c44#01-2-use-case

<br>
