---
title: 【IT技術の知見】エラー＠クリーンアーキテクチャ
description: エラー＠クリーンアーキテクチャの知見を記録しています。
---

# エラー＠クリーンアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. 上位層への例外伝播

各レイヤーでは例外をスローするだけに留まり、スローされた例外を対処する責務は、より上位レイヤーに持たせる。

より上位レイヤーでは、そのレイヤーに合った例外へ詰め替えてスローする。

最終的には、インターフェース層まで持ち上げ、画面上のポップアップで警告文としてこれを表示する。

<br>

## 02. インターフェース層

### 例外の種類

#### ▼ BadRequestError

リクエスト形式が不正である。

```typescript
export class BadRequestError extends Error {
  private readonly _name: string;
  private readonly _statusCode: number;

  constructor() {
    // エラーメッセージ
    super("リクエスト形式が不正です");

    Object.setPrototypeOf(this, new.target.prototype);

    // エラー名
    this._name = "BadRequestError";
    // ステータスコード
    this._statusCode = 400;
  }
}
```

#### ▼ UnauthorizedError

認証されていない。

```typescript
export class UnauthorizedError extends Error {
  private readonly _name: string;
  private readonly _statusCode: number;

  constructor() {
    // エラーメッセージ
    super("認証されていません");

    Object.setPrototypeOf(this, new.target.prototype);

    // エラー名
    this._name = "UnauthorizedError";
    // ステータスコード
    this._statusCode = 401;
  }
}
```

#### ▼ ForbiddenError

認可されていない。

```typescript
export class ForbiddenError extends Error {
  private readonly _name: string;
  private readonly _statusCode: number;

  constructor() {
    // エラーメッセージ
    super("認可されていません");

    Object.setPrototypeOf(this, new.target.prototype);

    // エラー名
    this._name = "ForbiddenError";
    // ステータスコード
    this._statusCode = 403;
  }
}
```

<br>

### ハンドリング

ユースケース層の処理を `try-catch` で囲い、スローされたユースケース例外をエラーレスポンスにして返信する。

<br>

### クライアント別の例外

ドメイン例外やユースケース例外は何が起きたかだけを表し、どのクライアントから呼ばれたかやレスポンスの形式を知らない。

インターフェース層で、それぞれの例外を UI クライアント向けと API クライアント向けのエラーレスポンスに分けて詰め替える。

API クライアント向けのエラーレスポンスには、クライアントが処理を分岐できるように、変わらない `code` を持たせる。

```typescript
// ドメイン層：ドメインルールに違反した場合、ドメイン例外をスローする
export class FooName {
  constructor(private readonly value: string) {
    if (value.length > 20) {
      throw new FooNameLengthExceededError(value);
    }
  }
}

// ユースケース層：ユースケースの処理に失敗した場合、ユースケース例外をスローする
export async function changeFooName({ id, name }: { id: string; name: string }) {
  const foo = await fooRepository.findById(id);
  if (!foo) {
    throw new FooNotFoundError();
  }

  foo.changeName(new FooName(name));

  await fooRepository.save(foo);
}

// インターフェース層：UIクライアント向けのエラーレスポンス
export class UiNotFoundErrorResponse extends Response {
  constructor(error: FooNotFoundError) {
    super(
      JSON.stringify({
        error: { title: "404 Not Found", message: error.message },
      }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }
}

// インターフェース層：APIクライアント向けのエラーレスポンス
export class ApiNotFoundErrorResponse extends Response {
  constructor(error: FooNotFoundError) {
    super(
      JSON.stringify({
        title: "404 Not Found",
        message: error.message,
        code: "NOT_FOUND",
      }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }
}

export class ApiBadRequestErrorResponse extends Response {
  constructor(error: FooNameLengthExceededError) {
    super(
      JSON.stringify({
        title: "400 Bad Request",
        message: error.message,
        code: "BAD_REQUEST",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
}

// インターフェース層：APIクライアント向けのコントローラー
try {
  await changeFooName({ id, name });
} catch (error) {
  if (error instanceof FooNotFoundError) {
    throw new ApiNotFoundErrorResponse(error);
  }
  if (error instanceof FooNameLengthExceededError) {
    throw new ApiBadRequestErrorResponse(error);
  }
  throw error;
}
```

<br>

## 03. ユースケース層

### 例外の種類

ユースケースの処理に失敗した例外である。

#### ▼ FooNotFoundError

Foo ドメインオブジェクトが存在しない。

```typescript
export class FooNotFoundError extends Error {
  private readonly _name: string;

  constructor() {
    // エラーメッセージ
    super("Fooドメインオブジェクトが存在しません");

    Object.setPrototypeOf(this, new.target.prototype);

    // エラー名
    this._name = "FooNotFoundError";
  }
}
```

#### ▼ FooAlreadyExistsError

Foo ドメインオブジェクトが重複する。

#### ▼ FooQuotaExceededError

Foo ドメインオブジェクトの登録上限を超えている。

#### ▼ FooChangeFailedError

更新系ユースケースが失敗した。

#### ▼ FooRegisterFailedError

登録系ユースケースが失敗した。

```typescript
export class FooRegisterFailedError extends Error {
  private readonly _name: string;

  constructor() {
    // エラーメッセージ
    super("Fooドメインオブジェクトの登録に失敗しました");

    Object.setPrototypeOf(this, new.target.prototype);

    // エラー名
    this._name = "FooRegisterFailedError";
  }
}
```

#### ▼ FooGetDraftFailedError

下書き系ユースケースが失敗した。

#### ▼ FooGetFailedError

閲覧系ユースケースが失敗した。

#### ▼ FooDeleteFailedError

削除系ユースケースが失敗した。

<br>

### ハンドリング

ユースケース層で囲ったトランザクションの処理を `try-catch` で囲い、スローされたインフラストラクチャ例外をドメイン例外にして返却する。

<br>

### ユースケース別の例外

ユースケースの処理に失敗した例外は、登録系・更新系・閲覧系・削除系といったユースケースの種類ごとに分ける。

どのユースケースで失敗したかが例外名からわかるため、インターフェース層でエラーメッセージやログを出し分けやすくなる。

```typescript
// 登録系ユースケース
export async function registerFoo({ name }: { name: string }) {
  try {
    await fooRepository.save(new Foo(new FooName(name)));
  } catch (error) {
    throw new FooRegisterFailedError();
  }
}

// 削除系ユースケース
export async function deleteFoo({ id }: { id: string }) {
  try {
    await fooRepository.delete(id);
  } catch (error) {
    throw new FooDeleteFailedError();
  }
}
```

<br>

## 04. ドメイン層

### 例外の種類

ドメインルールに違反した例外である。

#### ▼ FooNameLengthExceededError

Foo 名が許可された最大文字数を超えている。

```typescript
export class FooNameLengthExceededError extends Error {
  private readonly _name: string;
  private readonly _maxLength: number;

  constructor(fooName: string) {
    // エラーメッセージ
    super(`Foo名は20文字以内にしてください`);

    Object.setPrototypeOf(this, new.target.prototype);

    // エラー名
    this._name = "FooNameLengthExceededError";
    // ドメインルール
    this._maxLength = 20;
  }
}
```

#### ▼ FooNameRequiredError

Foo 名が空である。

```typescript
export class FooNameRequiredError extends Error {
  private readonly _name: string;

  constructor() {
    // エラーメッセージ
    super("Foo名は必須です");

    Object.setPrototypeOf(this, new.target.prototype);

    // エラー名
    this._name = "FooNameRequiredError";
  }
}
```

<br>

### ハンドリング

ドメイン層では `try-catch` が不要である。

<br>

### ドメインルール別の例外

ドメイン例外は、違反したドメインルールごとに分ける。

`FooNameInvalidError` のように 1 つにまとめると、どのドメインルールに違反したのかが例外名からわからなくなる。

```typescript
export class FooName {
  constructor(private readonly value: string) {
    // 必須のドメインルール
    if (value.length === 0) {
      throw new FooNameRequiredError();
    }

    // 最大文字数のドメインルール
    if (value.length > 20) {
      throw new FooNameLengthExceededError(value);
    }
  }
}
```

<br>

## 05. インフラストラクチャ層

### 例外の種類

データベースに関する例外である。

#### ▼ UniqueConstraintError

プライマリーキー制約に違反した。

```typescript
export class UniqueConstraintError extends Error {
  private readonly _name: string;

  constructor() {
    // エラーメッセージ
    super("プライマリーキー制約に違反しました");

    Object.setPrototypeOf(this, new.target.prototype);

    // エラー名
    this._name = "UniqueConstraintError";
  }
}
```

#### ▼ ForeignKeyConstraintError

外部キー制約に違反した。

#### ▼ DatabaseConnectionError

DB 接続に失敗した。

```typescript
export class DatabaseConnectionError extends Error {
  private readonly _name: string;

  constructor() {
    // エラーメッセージ
    super("DB接続に失敗しました");

    Object.setPrototypeOf(this, new.target.prototype);

    // エラー名
    this._name = "DatabaseConnectionError";
  }
}
```

#### ▼ QueryTimeoutError

クエリがタイムアウトした。

<br>

### ハンドリング

トランザクションの処理を `try-catch` で囲い、スローされたインフラストラクチャ例外をドメイン例外にして返却する。

<br>

### 障害の種類別の例外

インフラストラクチャ例外は、制約違反や接続失敗といった障害の種類ごとに分ける。

障害の種類によって、ユースケース層での対応（ユースケース例外への詰め替え、再試行など）が変わるためである。

```typescript
try {
  await fooRepository.save(foo);
} catch (error) {
  // 制約違反の場合、重複を表すユースケース例外に詰め替える
  if (error instanceof UniqueConstraintError) {
    throw new FooAlreadyExistsError();
  }

  // 一時的な障害の場合、再試行する
  if (
    error instanceof DatabaseConnectionError ||
    error instanceof QueryTimeoutError
  ) {
    return await retry(() => fooRepository.save(foo));
  }

  throw error;
}
```

<br>
