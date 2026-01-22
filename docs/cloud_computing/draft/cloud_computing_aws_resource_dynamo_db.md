---
title: 【IT技術の知見】AWS DynamoDB＠AWSリソース
description: AWS DynamoDB＠AWSリソースの知見を記録しています。
---

# AWS DynamoDB＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. DynamoDBとは

記入中...

<br>

## 02. セットアップ

### セットアップ(Terraformの場合)

ここでは、auth-userサービスがトークンをAWS DynamoDBに保存するとする。

```terraform
module "dynamodb_user" {
  source  = "terraform-aws-modules/dynamodb-table/aws"
  version = "~> 4.2"

  # テーブル名を設定する
  name                           = "auth-user"
  # PartitionKeyを設定する
  hash_key                       = "authUserToken"
  # SortKeyを設定する
  range_key                      = "createdAt"
  point_in_time_recovery_enabled = true

  attributes = [
    {
      name = "PartitionKey"
      type = "S"
    },
    {
      name = "SortKey"
      type = "S"
    },
  ]
}
```

<br>

## 03. ユースケース

### CREATE処理

ここでは、auth-userサービスがトークンをAWS DynamoDBに保存するとする。

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

// CREATE
func createUser(ctx context.Context, client *dynamodb.Client, tableName, token string) error {
	now := time.Now()

	_, err := client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item: map[string]types.AttributeValue{
			// Terraformでは、必ず使用する属性をPartitionKeyにする
			"authUserToken": &types.AttributeValueMemberS{Value: token},
			// Terraformでは、並び替えに使用する属性をSortKeyにする
			// DynamoDBのキー値をタイムスタンプで並び替えるために、ISO-8601形式を使用する
			"createdAt": &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
		},
	})

	return err
}

// READ
func getUser(ctx context.Context, client *dynamodb.Client, tableName, token, createdAt string) (map[string]types.AttributeValue, error) {

	out, err := client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"authUserToken": &types.AttributeValueMemberS{Value: token},
			"createdAt":     &types.AttributeValueMemberS{Value: createdAt},
		},
	})

	if err != nil {
		return nil, err
	}

	if out.Item == nil {
		return nil, fmt.Errorf("user not found: token=%s createdAt=%s", token, createdAt)
	}

	return out.Item, nil
}

func configure(cfg aws.Config) (*dynamodb.Client, string) {

	var client *dynamodb.Client

	// ローカルマシンではDynamoDBの仮のエンドポイントを設定する
	if endpoint := os.Getenv("DYNAMODB_ENDPOINT"); endpoint != "" {
		client = dynamodb.NewFromConfig(cfg, func(o *dynamodb.Options) {
			// AWSリージョンによってエンドポイントが自動的に決まる
			// https://dynamodb.ap-northeast-1.amazonaws.com
			o.BaseEndpoint = aws.String(endpoint)
		})
	} else {
		client = dynamodb.NewFromConfig(cfg)
	}

	// 例えば、auth-userテーブル
	tableName := os.Getenv("DYNAMODB_TABLE_NAME")

	if tableName == "" {
		log.Fatal("DYNAMODB_TABLE_NAME is required")
	}

	return client, tableName
}

func main() {
	ctx := context.Background()

	log.Printf("ENV AWS_REGION=%s", os.Getenv("AWS_REGION"))
	log.Printf("ENV DYNAMODB_ENDPOINT=%s", os.Getenv("DYNAMODB_ENDPOINT"))
	log.Printf("ENV DYNAMODB_TABLE_NAME=%s", os.Getenv("DYNAMODB_TABLE_NAME"))

	cfg, err := config.LoadDefaultConfig(ctx)

	if err != nil {
		log.Fatal(err)
	}

	client, tableName := configure(cfg)

	token := "*****"
	createdAt := "2024-01-01T00:00:00Z"

	// CREATEを実行する
	err = createUser(ctx, client, tableName, token)
	if err != nil {
		log.Fatal(err)
	}

	// READを実行する
	item, err := getUser(ctx, client, tableName, token, createdAt)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("GetItem OK: %v\n", item)

	fmt.Println("PutItem OK")
}
```

### リーダー選出 (分散ロック)

記入中

<br>
