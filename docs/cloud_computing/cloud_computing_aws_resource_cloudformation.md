---
title: 【IT技術の知見】CloudFormation
description: CloudFormationの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# CloudFormation

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要

テンプレートに定義した AWS リソースを、スタックとしてまとめて作成・更新・削除できるサービスである。

> - [What is CloudFormation? - AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html)

<br>

## 02. 仕組み

## 03. セットアップ

### Terraformによる構築

hashicorp/aws プロバイダーを使用し、S3 バケットを管理する CloudFormation スタックを作成する。

バケット名には一意の名前を指定する。

```terraform
resource "aws_cloudformation_stack" "this" {
  name = "foo-storage"
  template_body = yamlencode({
    AWSTemplateFormatVersion = "2010-09-09"
    Resources = {
      Bucket = {
        Type = "AWS::S3::Bucket"
        Properties = {
          BucketName = "foo-data-123456789012"
        }
      }
    }
  })
}
```

> - [cloudformation_stack - Terraform Registry](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudformation_stack)

<br>

### スタックの作成

テンプレートファイルを作成し、AWS コンソールや AWS CLI から、そのテンプレートを指定した Stack を作成する。

<br>

## 04. リージョンをまたぐスタック管理

### 単一リージョン

#### ▼ Stack

CloudFormation では、通常の Stack を作成したリージョンでプロビジョニングが実行される。

そのため、単一リージョンの場合は、Stack のリージョンさえ注意すれば問題ない。

<br>

### 複数リージョン

#### ▼ StackSets

StackSets を使用すると、複数のリージョンのみでなく、複数のアカウント間でもプロビジョニングを実行できる。

![cloudformation_stacksets](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloudformation_stacksets.png)

> - [Managing stacks across accounts and Regions with StackSets - AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/what-is-cfnstacksets.html)
> - https://dev.classmethod.jp/articles/introducing-cloudformation-stacksets/clou

<br>

## 05. テンプレートとパラメーター

### テンプレートとは

スタックの鋳型のこと。

指定したパラメーターを渡すことにより、新しいスタックを作成できる。

<br>

### パラメーター

スタックに代入するオプションを設定する。

インフラの作成時にコンソール画面上で入力フォームが現れる。

また、更新時も画面上から対応できる。

```yaml
AWSTemplateFormatVersion: 2010-09-09
Description: WAF IPSet

# オプションを設定する。
Parameters:
  AllowAddresses:
    Description: IP list allowed to access
    Type: CommaDelimitedList
    Default: "*.*.*.*/*"

# スタック
Resources:
  IPWhiteList:
    Type: "AWS::WAFv2::IPSet"
    Properties:
      Name: foo-ip-white-list
      Scope: REGIONAL
      IPAddressVersion: IPV4
      # パラメーターを参照する。
      Addresses: !Ref AllowAddresses
```

> - [CloudFormation 文字列の配列をパラメータで渡してテンプレートを実行したいとき、CommaDelimitedListを使ってみる \| DevelopersIO](https://dev.classmethod.jp/articles/cloudfromation-used-commadelimitedlist/)

<br>

## 06. スタックの出力

特定のスタックで作成されたリソース値を他のスタックで使用できるようにする。

> - [CloudFormation template Outputs syntax - AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html)

<br>
