---
title: 【IT技術の知見】AWS Cognito＠AWSリソース
description: AWS Cognito＠AWSリソースの知見を記録しています。
---

# AWS Cognito＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS Cognitoとは

### ユーザープール

クラウド認証プロキシまたはクラウドIDプロバイダーとして機能する。

![aws_cognito_lambda](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_cognito_lambda.png)

> - https://dev.classmethod.jp/articles/tried-using-cognito-as-api-gateway-authorizer/#toc-cognito-api-gateway

<br>

### オーソライザー

クラウド認可サービスとして機能する。

![aws_cognito_lambda](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_cognito_lambda.png)

> - https://dev.classmethod.jp/articles/tried-using-cognito-as-api-gateway-authorizer/#toc-cognito-api-gateway

<br>

## 02. クラウド認証プロキシとして

認可リクエストを作成し、外部のIDプロバイダーにこれを転送する。

> - https://dev.classmethod.jp/articles/add-keycloak-to-cognito-with-oidc/
> - https://docs.aws.amazon.com/cognito/latest/developerguide/external-identity-providers.html

<br>

## 03. クラウドIDプロバイダーとして

アカウント情報を管理する。

> - https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html

<br>
