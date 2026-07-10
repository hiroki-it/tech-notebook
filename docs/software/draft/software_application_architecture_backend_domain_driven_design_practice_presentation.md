---
title: 【IT技術の知見】15章＠ドメイン駆動設計実践入門
description: 15章＠ドメイン駆動設計実践入門の知見を記録しています。
---

# 15章＠ドメイン駆動設計実践入門

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 15-1 プレゼンテーションとは

プレゼンテーション層とは、アプリケーションの外部インターフェイスである。

この章でいう「外部」とは、人間のユーザーだけではなく、アプリケーションの外から操作・連携するものを指す。

- ブラウザ
- CLI
- API クライアント
- 外部システム
- テストクライアントなど

![software_application_architecture_backend_domain_driven_design_practice_presentation_15-1-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software_application_architecture_backend_domain_driven_design_practice_presentation_15-1-1.png)

プレゼンテーション層の責務は、主に次のとおりである。

- リクエストの受信
- 受信データのバリデーション
- アプリケーション層（ユースケース層）へ受信データを入力し、また処理結果の出力を取得
- レスポンスの返信
- 例外処理

プレゼンテーション層では、アプリケーションは Web フレームワークやパッケージに依存してよい。

一方で、アプリケーション層やドメイン層ではこれらに依存しないことが重要である。

## 15-2 Express.jsを利用した実装

『レビュー内容から推薦書籍データを取得する』というユースケースの機能として実装するまでの流れを解説する。

### 15-2-1 環境のセットアップ

まず、Express.js を利用するための最低限のセットアップを行う。

#### ▼ パッケージのインストール

```bash
npm i express@^5.1.0
npm i @types/express@^5.0.1 --save-dev
```

#### ▼ 動作確認

`src/Presentation/Express/index.ts` を作成し、まずは `Hello World!` を返信してみる。

```typescript
import express from "express";

const app = express();
const port = 3000;
app.get("/", (_, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

```bash
npx ts-node src/Presentation/Express/index.ts
```

『外部』のブラウザで `http://localhost:3000` に HTTP リクエストを送信し、 `Hello World!` が表示されれば成功である。

### 15-2-2 Web APIの実装

プレゼンテーション層で API を実装していく。

#### ▼ APIの共有処理

`CatalogService/src/Presentation/Express/index.ts` の API の共有処理の実装である。

```typescript
import express, {json, Response} from "express";
import {
  RegisterBookCommand,
  RegisterBookService,
} from "Application/Book/RegisterBookService/RegisterBookService";
import {
  AddReviewCommand,
  AddReviewService,
} from "Application/Review/AddReviewService/AddReviewService";
import {
  DeleteReviewCommand,
  DeleteReviewService,
} from "Application/Review/DeleteReviewService/DeleteReviewService";
import {
  EditReviewCommand,
  EditReviewService,
} from "Application/Review/EditReviewService/EditReviewService";
import {
  GetRecommendedBooksCommand,
  GetRecommendedBooksService,
} from "Application/Review/GetRecommendedBooksService/GetRecommendedBooksService";
import {SQLBookRepository} from "Infrastructure/SQL/Book/SQLBookRepository";
import {SQLReviewRepository} from "Infrastructure/SQL/Review/SQLReviewRepository";
import {SQLClientManager} from "Infrastructure/SQL/SQLClientManager";
import {SQLTransactionManager} from "Infrastructure/SQL/SQLTransactionManager";

// リクエストの受信
const app = express();
const port = 3000;
app.use(json());

// アプリケーション層（ユースケース層）へ受信データを入力し、また処理結果の出力を取得
const clientManager = new SQLClientManager();
const transactionManager = new SQLTransactionManager(clientManager);
const bookRepository = new SQLBookRepository(clientManager);
const reviewRepository = new SQLReviewRepository(clientManager);

// 受信データのバリデーション
const isStr = (v: any): v is string => typeof v === "string" && v.length > 0;
const isNum = (v: any): v is number => typeof v === "number" && !isNaN(v);

// レスポンスの返信
const invalid = (res: Response) =>
  res.status(400).json({ok: false, message: "Invalid request"});
```

#### ▼ 書籍登録API

`CatalogService/src/Presentation/Express/index.ts` の書籍登録 API の実装である。

```typescript
// POST
app.post("/book", async (req, res) => {
  // 例外処理
  try {
    // リクエストの受信
    const {isbn, title, author, price} = req.body;

    // 受信データのバリデーション
    if (!isStr(isbn) || !isStr(title) || !isStr(author) || !isNum(price)) {
      return invalid(res);
    }

    // アプリケーション層（ユースケース層）へ受信データを入力し、また処理結果の出力を取得
    const service = new RegisterBookService(bookRepository, transactionManager);
    const command: RegisterBookCommand = {isbn, title, author, price};
    const book = await service.execute(command);

    // レスポンスの返信
    res.status(201).json({ok: true, book});
  } catch {
    res.status(500).json({ok: false});
  }
});
```

#### ▼ 推薦書籍取得API（中核ユースケースに対応）

`CatalogService/src/Presentation/Express/index.ts` の推薦書籍取得 API の実装である。

```typescript
// GET
app.get("/book/:isbn/recommendations", async (req, res) => {
  // 例外処理
  try {
    // リクエストの受信
    const {isbn} = req.params;
    const {maxCount} = req.query;

    // 受信データのバリデーション
    if (!isStr(isbn)) return invalid(res);
    if (maxCount && isNaN(Number(maxCount))) return invalid(res);

    // アプリケーション層（ユースケース層）へ受信データを入力し、また処理結果の出力を取得
    const service = new GetRecommendedBooksService(reviewRepository);
    const command: GetRecommendedBooksCommand = {
      bookId: isbn,
      maxCount: maxCount ? Number(maxCount) : undefined,
    };
    const recommendedBooks = await service.execute(command);

    // レスポンスの返信
    res.status(200).json({ok: true, recommendedBooks});
  } catch {
    res.status(500).json({ok: false});
  }
});
```

#### ▼ レビュー登録API

`CatalogService/src/Presentation/Express/index.ts` のレビュー登録 API の実装である。

```typescript
// POST
app.post("/book/:isbn/review", async (req, res) => {
  // 例外処理
  try {
    // リクエストの受信
    const {isbn} = req.params;
    const {name, rating, comment} = req.body;

    // 受信データのバリデーション
    if (!isStr(isbn) || !isStr(name) || !isNum(rating)) return invalid(res);
    if (comment && !isStr(comment)) return invalid(res);

    // アプリケーション層（ユースケース層）へ受信データを入力し、また処理結果の出力を取得
    const service = new AddReviewService(
      reviewRepository,
      bookRepository,
      transactionManager,
    );
    const command: AddReviewCommand = {bookId: isbn, name, rating, comment};
    const review = await service.execute(command);

    // レスポンスの返信
    res.status(201).json({ok: true, review});
  } catch {
    res.status(500).json({ok: false});
  }
});
```

#### ▼ レビュー編集API

`CatalogService/src/Presentation/Express/index.ts` のレビュー編集 API の実装である。

```typescript
// PUT
app.put("/review/:reviewId", async (req, res) => {
  // 例外処理
  try {
    // リクエストの受信
    const {reviewId} = req.params;
    const {name, rating, comment} = req.body;

    // 受信データのバリデーション
    if (!isStr(reviewId)) return invalid(res);
    if (name && !isStr(name)) return invalid(res);
    if (rating && !isNum(rating)) return invalid(res);
    if (comment && !isStr(comment)) return invalid(res);

    // アプリケーション層（ユースケース層）へ受信データを入力し、また処理結果の出力を取得
    const service = new EditReviewService(reviewRepository, transactionManager);
    const command: EditReviewCommand = {reviewId, name, rating, comment};
    const review = await service.execute(command);

    // レスポンスの返信
    res.status(200).json({ok: true, review});
  } catch {
    res.status(500).json({ok: false});
  }
});
```

#### ▼ レビュー削除API

`CatalogService/src/Presentation/Express/index.ts` のレビュー削除 API の実装である。

```typescript
// DELETE
app.delete("/review/:reviewId", async (req, res) => {
  // 例外処理
  try {
    // リクエストの受信
    const {reviewId} = req.params;

    // 受信データのバリデーション
    if (!isStr(reviewId)) return invalid(res);

    // アプリケーション層（ユースケース層）へ受信データを入力し、また処理結果の出力を取得
    const service = new DeleteReviewService(
      reviewRepository,
      transactionManager,
    );
    const command: DeleteReviewCommand = {reviewId};
    await service.execute(command);

    // レスポンスの返信
    res.status(204).end();
  } catch {
    res.status(500).json({ok: false});
  }
});
```

### 15-2-2-1 動作確認

『外部』の CLI（ここでは `curl`）から HTTP リクエストを送信し、API がレスポンスを返信することを確認する。

#### ▼ 書籍登録API

書籍登録 API で書籍を登録する。

```bash
$ curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"isbn\":\"9784814400737\",\"title\":\"ドメイン駆動設計をはじめよう\",\"author\":\"Vlad Khononov\",\"price\":3960}" \
  http://localhost:3000/book
```

書籍登録 API は、以下のように書籍情報を `201` レスポンスで返信する。

```json
// 201レスポンス
{
  "ok": true,
  "book": {
    "id": "9784814400737",
    "title": "ドメイン駆動設計をはじめよう",
    "author": "Vlad Khononov",
    "price": {
      "amount": 3960,
      "currency": "JPY"
    }
  }
}
```

#### ▼ 推薦書籍取得API（中核ユースケースに対応）

推薦書籍取得 API で推薦書籍を取得する。

```bash
$ curl http://localhost:3000/book/9784814400737/recommendations
```

推薦書籍取得 API は、以下のように推薦書籍情報を `200` レスポンスで返信する。

```json
// 200レスポンス
{
  "ok": true,
  "recommendedBooks": {
    "sourceBookId": "9784814400737",
    "recommendedBooks": [
      " 実践ドメイン駆動設計 ",
      " エリック・エヴァンスのドメイン駆動設計 "
    ]
  }
}
```

#### ▼ レビュー登録API

レビュー登録 API でレビューを登録する。

```bash
$ curl \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"name\":\" 山田太郎 \",\"rating\":5,\"comment\":\" 素晴らしい本でした。『実践ドメイン駆動設計』を先に読むことを推奨します。\"}" \
  http://localhost:3000/book/9784814400737/review
```

レビュー登録 API は、以下のようにレビュー情報を `201` レスポンスで返信する。

```json
// 201レスポンス
{
  "ok": true,
  "review": {
    "id": "-L3ru-W1auxLZSCiGmIvG",
    // この部分は実際の ID に置き換わります
    "bookId": "9784814400737",
    "name": " 山田太郎 ",
    "rating": 5,
    "comment": " 素晴らしい本でした。『実践ドメイン駆動設計』を先に読むことを推奨します。"
  }
}
```

#### ▼ レビュー編集API

レビュー編集 API でレビューを編集する。

```bash
$ curl \
  -X PUT \
  -H "Content-Type: application/json" \
  -d "{\"rating\":3,\"comment\":\" 再読したところ、初心者には少し難しいかもしれません。\"}" \
  http://localhost:3000/review/-L3ru-W1auxLZSCiGmIvG
```

レビュー編集 API は、以下のように更新後のレビュー情報を `200` レスポンスで返信する。

```json
// 200レスポンス
{
  "ok": true,
  "review": {
    "id": "-L3ru-W1auxLZSCiGmIvG",
    "bookId": "9784814400737",
    "name": " 山田太郎 ",
    "rating": 3,
    "comment": " 再読したところ、初心者には少し難しいかもしれません。"
  }
}
```

#### ▼ レビュー削除API

レビュー削除 API でレビューを削除する。

```bash
$ curl -X DELETE http://localhost:3000/review/-L3ru-W1auxLZSCiGmIvG
```

レビュー削除 API は、メッセージボディのない `204` レスポンスを返信する。

## 15-3 まとめ

本章では、プレゼンテーション層に Web API を実装し、各ユースケースに対応するエンドポイントを確認した。

次のいずれの場合であっても、プレゼンテーション層で実装するべき責務は同じである。

- ブラウザ
- CLI
- API クライアント
- 外部システム
- テストクライアントなど

ドメイン駆動設計の戦術的設計の解説は 15 章で終了！！
