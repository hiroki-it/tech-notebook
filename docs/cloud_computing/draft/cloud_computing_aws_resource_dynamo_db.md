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

## 02. ユースケース

### データ保存

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

func putSample(ctx context.Context, client *dynamodb.Client, tableName, data string) error {
	now := time.Now()

	_, err := client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item: map[string]types.AttributeValue{
			// Partition key
			"fooKey": &types.AttributeValueMemberS{Value: data},
			// DynamoDBのキー値をタイムスタンプで並び替えるために、ISO-8601形式を使用する
			"createdAt": &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)},
		},
	})

	return err
}

func configure(cfg aws.Config) (*dynamodb.Client, string) {

	var client *dynamodb.Client

	// ローカル環境ではDynamoDBの仮のエンドポイントを設定する
	if endpoint := os.Getenv("DYNAMODB_ENDPOINT"); endpoint != "" {
		client = dynamodb.NewFromConfig(cfg, func(o *dynamodb.Options) {
			// AWSリージョンによってエンドポイントが自動的に決まる
			// https://dynamodb.ap-northeast-1.amazonaws.com
			o.BaseEndpoint = aws.String(endpoint)
		})
	} else {
		client = dynamodb.NewFromConfig(cfg)
	}

	// fooテーブル
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

	data := "data"
	if err := putSample(ctx, client, tableName, data); err != nil {
		log.Fatal(err)
	}

	fmt.Println("PutItem OK")
}
```

### リーダー選出 (分散ロック)

記入中

<br>
