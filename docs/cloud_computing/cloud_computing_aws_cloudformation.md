---
title: 【知見を記録するサイト】CloudFormation＠AWS
description: CloudFormation＠AWSの知見をまとめました．
---

# CloudFormation＠AWS

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

<br>

## 02. リージョン

### 単一リージョン

#### ・Stack

CloudFormationでは，通常のStackを作成したリージョンでプロビジョニングが実行される．そのため，単一リージョンの場合は，Stackのリージョンさえ注意すれば問題ない．

<br>

### 複数リージョン

####  ・StackSets

![cloudformation_stacksets](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/cloudformation_stacksets.png)


StackSetsを用いると，複数のリージョンだけでなく，複数のアカウント間でもプロビジョニングを実行できる．

参考：

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html
- https://dev.classmethod.jp/articles/introducing-cloudformation-stacksets/clou

<br>

## 03. テンプレート

### テンプレートとは

スタックの鋳型のこと．指定したパラメーターを渡すことで，新しいスタックを作成できるようにできる．

<br>

### パラメーター

スタックに代入するパラメーターを設定する．インフラの構築時にコンソール画面上で入力フォームが現れる．また，更新時も画面上から対応できる．

参考：https://dev.classmethod.jp/articles/cloudfromation-used-commadelimitedlist/

```yaml
AWSTemplateFormatVersion: 2010-09-09
Description: WAF IPSet

# パラメーターを設定する．
Parameters:
  AllowAddresses:
    Description: IP list allowed to access
    Type: CommaDelimitedList
    Default: "n.n.n.n/n"

# スタック
Resources:
  IPWhiteList:
    Type: "AWS::WAFv2::IPSet"
    Properties:
      Name: foo-ip-white-list
      Scope: REGIONAL
      IPAddressVersion: IPV4
      # パラメーターを参照する．
      Addresses: !Ref AllowAddresses
```

<br>

## 04. 出力

特定のスタックで生成されたリソース値を他のスタックで用いることができるようにする．

参考：https://docs.aws.amazon.com/ja_jp/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html
