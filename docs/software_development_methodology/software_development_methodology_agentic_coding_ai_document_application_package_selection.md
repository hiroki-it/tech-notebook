---
title: 【IT技術の知見】パッケージ選定＠AI用ドキュメント
description: パッケージ選定＠AI用ドキュメントの知見を記録しています。
---

# パッケージ選定＠AI用ドキュメント

## バックエンドパッケージ

### 言語とフレームワーク

- 言語
  - Go：https://pkg.go.dev/golang.org/dl/go1.21.6
  - 選定理由：利用拡大時に性能や保守性を期待できるため

- フレームワーク
  - Gin：https://pkg.go.dev/github.com/gin-gonic/gin
  - 選定理由：〜

<br>

### API

- gRPC
  - grpc-go：https://pkg.go.dev/google.golang.org/grpc
  - 選定理由：デファクトスタンダードであるため

- Protobuf CLI
  - bufbuild/buf：https://pkg.go.dev/github.com/bufbuild/buf
  - 選定理由：〜

<br>

### DB

- ORM
  - gorm：https://pkg.go.dev/gorm.io/gorm
  - 選定理由：〜

- DBマイグレーション
  - golang-migrate/migrate：https://pkg.go.dev/github.com/golang-migrate/migrate/v4
  - 選定理由：〜

<br>

### テスト

- モックライブラリ
  - go.uber.org/mock：https://pkg.go.dev/go.uber.org/mock/gomock
  - 選定理由：〜

- テストライブラリ
  - stretchr/testify：https://pkg.go.dev/github.com/stretchr/testify
  - 選定理由：〜

<br>

### ユーティリティ

- ロガー
  - slog：https://pkg.go.dev/log/slog
  - 選定理由：〜

- バリデーションライブラリ
  - go-playground/validator：https://pkg.go.dev/github.com/go-playground/validator/v10
  - 選定理由：〜

- UUIDライブラリ
  - google/uuid：https://pkg.go.dev/github.com/google/uuid
  - 選定理由：〜

- 環境変数
  - spf13/viper：https://pkg.go.dev/github.com/spf13/viper
  - 選定理由：〜

<br>

### コマンド

- Go CLI
  - spf13/cobra：https://pkg.go.dev/github.com/spf13/cobra
  - 選定理由：〜

<br>

## フロントエンドパッケージ

### 言語とフレームワーク

- 言語
  - TypeScript：https://www.typescriptlang.org/
  - 選定理由：〜

- フレームワーク
  - Next.js：https://nextjs.org/
  - 選定理由：〜

<br>

### UI

- 基本的なUIコンポーネント
  - React：https://react.dev/
  - 選定理由：

- 通知・トーストコンポーネント：
  - shadcn/ui：https://shadcn.com/
  - 選定理由：〜

- フォーム管理
  - React Hook Form：https://react-hook-form.com/
  - 選定理由：〜

<br>

### バックエンド連携

- API通信
  - grpc/grpc-js：https://www.npmjs.com/package/@grpc/grpc-js
  - 選定理由：〜

- 認証
  - NextAuth.js：https://next-auth.js.org/
  - 選定理由：〜

<br>

### テスト

- テスト
  - Playwright：https://playwright.dev/
  - 選定理由：〜

- モック
  - Playwright：https://playwright.dev/
  - 選定理由：〜

<br>

### ユーティリティ

- ロガー
  - pino：https://www.npmjs.com/package/pino
  - 選定理由：〜

- バリデーション
  - Zod：https://zod.dev/
  - 選定理由：〜

<br>

### デザイン

- デザイン設計：
  - Figma：https://www.figma.com/
  - 選定理由：〜

- CSSスタイリング
  - Tailwind CSS：https://tailwindcss.com/
  - 選定理由：〜

<br>
