---
title: 【IT技術の知見】エラー＠クリーンアーキテクチャ
description: エラー＠クリーンアーキテクチャの知見を記録しています。
---

# エラー＠クリーンアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. アーキテクチャにおけるレイヤー別の例外スロー

### スローされた例外の扱い

各レイヤーでは例外をスローするだけに留まり、スローされた例外を対処する責務は、より上位レイヤーに持たせる。

より上位レイヤーでは、そのレイヤーに合った例外へ詰め替えてスローする。

最終的には、インターフェース層まで持ち上げ、画面上のポップアップで警告文としてこれを表示する。

<br>

### インターフェース層

#### ▼ 例外の種類

<table>
  <thead>
    <tr>
      <th>例外名の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>BadRequestError</code></td>
      <td>リクエスト形式が不正</td>
    </tr>
    <tr>
      <td><code>UnauthorizedError</code></td>
      <td>認証されていない</td>
    </tr>
    <tr>
      <td><code>ForbiddenError</code></td>
      <td>認可されていない</td>
    </tr>
  </tbody>
</table>

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

#### ▼ ハンドリング

ユースケース層の処理を `try-catch` で囲い、スローされたユースケース例外をエラーレスポンスにして返信する。

<br>

### ユースケース層

#### ▼ 例外の種類

ユースケースの処理に失敗した例外である。

<table>
  <thead>
    <tr>
      <th>例外名の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>FooNotFoundError</code></td>
      <td>Foo ドメインオブジェクトが存在しない</td>
    </tr>
    <tr>
      <td><code>FooAlreadyExistsError</code></td>
      <td>Foo ドメインオブジェクトが重複する</td>
    </tr>
    <tr>
      <td><code>FooQuotaExceededError</code></td>
      <td>Foo ドメインオブジェクトの登録上限を超えている</td>
    </tr>
    <tr>
      <td><code>FooChangeFailedError</code></td>
      <td>更新系ユースケースが失敗した</td>
    </tr>
    <tr>
      <td><code>FooRegisterFailedError</code></td>
      <td>登録系ユースケースが失敗した</td>
    </tr>
    <tr>
      <td><code>FooGetDraftFailedError</code></td>
      <td>下書き系ユースケースが失敗した</td>
    </tr>
    <tr>
      <td><code>FooGetFailedError</code></td>
      <td>閲覧系ユースケースが失敗した</td>
    </tr>
    <tr>
      <td><code>FooDeleteFailedError</code></td>
      <td>削除系ユースケースが失敗した</td>
    </tr>
  </tbody>
</table>

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

#### ▼ ハンドリング

ユースケース層で囲ったトランザクションの処理を `try-catch` で囲い、スローされたインフラストラクチャ例外をドメイン例外にして返却する。

<br>

### ドメイン層

#### ▼ 例外の種類

ドメインルールに違反した例外である。

<table>
  <thead>
    <tr>
      <th>例外名の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>FooNameLengthExceededError</code></td>
      <td>Foo 名が許可された最大文字数を超えている</td>
    </tr>
    <tr>
      <td><code>FooNameRequiredError</code></td>
      <td>Foo 名が空である</td>
    </tr>
  </tbody>
</table>

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

#### ▼ ハンドリング

ドメイン層では `try-catch` が不要である。

<br>

### インフラストラクチャ層

#### ▼ 例外の種類

データベースに関する例外である。

<table>
  <thead>
    <tr>
      <th>例外名の例</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>UniqueConstraintError</code></td>
      <td>プライマリーキー違反</td>
    </tr>
    <tr>
      <td><code>ForeignKeyConstraintError</code></td>
      <td>外部キー制約違反</td>
    </tr>
    <tr>
      <td><code>DatabaseConnectionError</code></td>
      <td>DB 接続失敗</td>
    </tr>
    <tr>
      <td><code>QueryTimeoutError</code></td>
      <td>クエリがタイムアウトした</td>
    </tr>
  </tbody>
</table>

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

#### ▼ ハンドリング

トランザクションの処理を `try-catch` で囲い、スローされたインフラストラクチャ例外をドメイン例外にして返却する。

<br>
