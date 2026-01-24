---
title: 【IT技術の知見】パッケージ選定＠AI用ドキュメント
description: パッケージ選定＠AI用ドキュメントの知見を記録しています。
---

# パッケージ選定＠AI用ドキュメント

## バックエンドパッケージ

### API

- Protobuf CLI
  - bufbuild/buf：https://pkg.go.dev/github.com/bufbuild/buf
  - 選定理由：〜

- gRPC
  - grpc-go：https://pkg.go.dev/google.golang.org/grpc
  - 選定理由：〜

### DB

- ORM
  - gorm：https://pkg.go.dev/gorm.io/gorm
  - 選定理由：〜

- DBマイグレーション
  - golang-migrate/migrate：https://pkg.go.dev/github.com/golang-migrate/migrate/v4
  - 選定理由：〜

### オブザーバビリティ

- ロガー
  - slog：https://pkg.go.dev/log/slog
  - 選定理由：〜

### テスト

- mockライブラリ
  - go.uber.org/mock：https://pkg.go.dev/go.uber.org/mock/gomock
  - 選定理由：〜

- テストライブラリ
  - stretchr/testify：https://pkg.go.dev/github.com/stretchr/testify
  - 選定理由：〜

### ユーティリティ

- バリデーションライブラリ
  - go-playground/validator：https://pkg.go.dev/github.com/go-playground/validator/v10
  - 選定理由：〜

- UUIDライブラリ
  - google/uuid：https://pkg.go.dev/github.com/google/uuid
  - 選定理由：〜

- 環境変数
  - spf13/viper：https://pkg.go.dev/github.com/spf13/viper
  - 選定理由：〜

### コマンド

- Go CLI
  - spf13/cobra：https://pkg.go.dev/github.com/spf13/cobra
  - 選定理由：〜
