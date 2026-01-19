---
title: 【IT技術の知見】DB仕様書＠RDB
description: DB仕様書＠RESTful-DBの知見を記録しています。
---

# DB仕様書＠RDB

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

### DBスキーマ駆動開発

#### ▼ DBスキーマ駆動開発とは

DB仕様書に基づいて、CRUDのコードを実装する。

#### ▼ Gorm Genの場合

```go
// cmd/gormgen/main.go
package main

import (
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gen"
	"gorm.io/gorm"
)

func main() {

	// DBに接続する
	dsn := "user:pass@tcp(127.0.0.1:3306)/app?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	// Generatorを作成する
	g := gen.NewGenerator(gen.Config{
		OutPath:      "internal/query",   // クエリコード生成先
		ModelPkgPath: "internal/dbmodel", // モデル生成先
		Mode:         gen.WithoutContext, // contextなしのAPIを生成
	})

	// 生成にDBを使う
	g.UseDB(db)

	// 生成対象を指定
	// テーブル名からモデル(struct)とCRUDっぽいクエリが生成される
	user := g.GenerateModel("users")

	// Queryに登録して自動作成する
	g.ApplyBasic(user)
	g.Execute()
}

```
