---
title: 【IT技術の知見】クリーンアーキテクチャ＠アーキテクチャ
description: クリーンアーキテクチャ＠アーキテクチャの知見を記録しています。
---

# クリーンアーキテクチャ＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. アーキテクチャ概要

### 思想

ドメイン駆動設計が適する機能的アプリケーションのみでなく、あらゆる種類 (例：非機能的アプリケーションなど) のソフトウェアに適用できる。

クリーンアーキテクチャ原著の序文にて、著者は「私は今までいろいろな種類のシステムを作ってきたが、どのシステムでもアーキテクチャのルールは同じだった」と述べている。

異なるシステムでも同じルールを共有する必要がある』というようなことを述べている。

> - https://www.amazon.co.jp/dp/B07FSBHS2V

<br>

### 構成

> - [Clean Coder Blog](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

![clean-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/clean-architecture.jpeg)

### 各パターンの分類

オブジェクト指向型と手続き型のマルチパラダイム言語の場合、アプリケーションをクラスまたは関数で実装できる。

クリーンアーキテクチャはオブジェクト指向設計が前提にあるため、各レイヤーのパターンをクラスとして実装することが多い。

ただし、クラスとして実装するとインスタンス化の手間がある。関数として実装しても、アーキテクチャの思想に反しない場合がある (特に外側のレイヤー) 。

アーキテクチャのレイヤー別にこれを整理した。

<table>
  <thead>
    <tr>
      <th>バックエンドレイヤー</th>
      <th>パターン</th>
      <th>責務</th>
      <th>インターフェース／実装</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="9">インフラストラクチャ層</td>
      <td>DB</td>
      <td>データベースとの接続、コネクションの作成</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>EntityMappers (DTO に相当)</td>
      <td>DB カラム型からアプリデータ型への型変換（例：<code>BIGINT</code> や <code>DECIMAL</code> を情報量が減らないデータ型に変換）、ドメインとインフラ間のオブジェクトの詰め替え</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Logger</td>
      <td>ロギング</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Middleware</td>
      <td>ミドルウェアパターン</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Repositories</td>
      <td>実装リポジトリ</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Listeners</td>
      <td>リスナー</td>
      <td>関数</td>
    </tr>
    <tr>
      <td>Routers</td>
      <td>ルーティング</td>
      <td>関数</td>
    </tr>
    <tr>
      <td>Seeder</td>
      <td>開発環境、CI 環境のユニットテストや E2E テスト、ステージング環境の動作確認に使用する初期データ挿入</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Drivers</td>
      <td>SDK、ORM、CLI など</td>
      <td>実装</td>
    </tr>
    <tr>
      <td rowspan="6">プレゼンテーション層</td>
      <td>Controller</td>
      <td>データの受信と返信</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>RequestValidators</td>
      <td>受信データのバリデーション</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>ResponseValidators</td>
      <td>返信データのバリデーション (受信データと比べてデータ構造は保証されているため、なくてもいい)</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Authenticators</td>
      <td>認証</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Input (Command とも呼ぶ)</td>
      <td>型変換、入力データ翻訳、フロントエンドインターフェース (あるいは受信 JSON データ) からバックエンドインターフェースへのオブジェクトからへの詰め替え</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Output (DTO とも呼ぶ)</td>
      <td>型変換、出力データ翻訳、バックエンドインターフェースからフロントエンドインターフェースへのオブジェクトからへの詰め替え</td>
      <td>実装</td>
    </tr>
    <tr>
      <td rowspan="6">ユースケース層</td>
      <td>Interactor</td>
      <td>ドメイン層で定義されたドメインルールを組み合わせ、ユースケースを具現化する。</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>InputBoundaries</td>
      <td>Interactor のインターフェース</td>
      <td>インターフェース</td>
    </tr>
    <tr>
      <td>Input (Command とも呼ぶ)</td>
      <td>型変換、バックエンドインターフェースからユースケースのオブジェクトからへの詰め替え</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>OutputBoundaries</td>
      <td>Presenter のインターフェース</td>
      <td>インターフェース</td>
    </tr>
    <tr>
      <td>Output (DTO とも呼ぶ)</td>
      <td>型変換、ユースケースからフロントエンドインターフェースへのオブジェクトからへの詰め替え</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Repositories（Gateways とも呼ぶ）</td>
      <td>Repositories のインターフェース</td>
      <td>インターフェース</td>
    </tr>
    <tr>
      <td rowspan="7">ドメイン層</td>
      <td>Entity</td>
      <td>ドメインモデル、ドメインルールの定義</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Id</td>
      <td>ドメインモデルの識別子</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>ValueObject</td>
      <td>値オブジェクト</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Specification</td>
      <td>ビジネスロジックのバリデーション</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Criterion</td>
      <td>検索条件オブジェクト</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Events</td>
      <td>ドメインイベント</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Service</td>
      <td>ドメインサービス</td>
      <td>実装</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th>フロントエンドレイヤー</th>
      <th>パターン</th>
      <th>責務</th>
      <th>インターフェース／実装</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="3">プレゼンテーション層</td>
      <td>Presenter</td>
      <td>ドメインオブジェクトから JSON データへの詰め替え</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>Validators</td>
      <td>フロントエンドのバリデーション</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>ViewModel</td>
      <td>状態管理、JSON データをフロントエンドインターフェースのオブジェクトへの詰め替え</td>
      <td>実装</td>
    </tr>
    <tr>
      <td>UI 層</td>
      <td>View</td>
      <td>UI レンダリング、CSS スタイリング</td>
      <td>実装</td>
    </tr>
  </tbody>
</table>

<br>

### 実装例たち

<table>
  <thead>
    <tr>
      <th>言語</th>
      <th>あれば書籍名</th>
      <th>URL</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>TypeScript</td>
      <td>つくりながら学ぶ！ ドメイン駆動設計 実践入門</td>
      <td><a href="https://github.com/yamachan0625/hands-on-ddd-introduction/tree/main/chapter-21">https://github.com/yamachan0625/hands-on-ddd-introduction/tree/main/chapter-21</a></td>
    </tr>
    <tr>
      <td>Java</td>
      <td>なし</td>
      <td><a href="https://github.com/VaughnVernon/IDDD_Samples">https://github.com/VaughnVernon/IDDD_Samples</a></td>
    </tr>
    <tr>
      <td>Go</td>
      <td>なし</td>
      <td><a href="https://github.com/victorsteven/food-app-server">https://github.com/victorsteven/food-app-server</a></td>
    </tr>
    <tr>
      <td>C#</td>
      <td>ドメイン駆動設計入門 ボトムアップでわかる!ドメイン駆動設計の基本</td>
      <td><a href="https://github.com/nrslib/itddd">https://github.com/nrslib/itddd</a></td>
    </tr>
    <tr>
      <td>そのほか</td>
      <td>なし</td>
      <td><a href="https://github.com/stars/hiroki-it/lists/ddd-architecture">https://github.com/stars/hiroki-it/lists/ddd-architecture</a></td>
    </tr>
  </tbody>
</table>

<br>

## 02. アーキテクチャにおけるレイヤー別の例外スロー

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

## 03. 仕組みにする

### 静的解析

レイヤー間の依存関係の方向を静的解析で制御する。

例えば、`eslint-plugin-import` プラグインの `import/norestricted-paths` というルールが役立つ。

```typescript
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import * as importPlugin from "eslint-plugin-import";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {},
      },
    },
    rules: {
// (略)
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              // 依存禁止のパス
              // アプリケーション層に依存してはいけない
              from: "./src/Application/**/*",
              // 対象のファイル
              target: "./src/Domain/**/!(*.spec.ts|*.test.ts)",
              message:
                "Domain層でApplication層をimportしてはいけません。",
            },
            {
              // 依存禁止のパス
              // プレゼンテーション層に依存してはいけない
              from: "./src/Presentation/**/*",
              // 対象のファイル
              target: "./src/Domain/**/!(*.spec.ts|*.test.ts)",
              message:
                "Domain層でPresentation層をimportしてはいけません。",
            },
            {
              // 依存禁止のパス
              // インフラストラクチャ層に依存してはいけない
              from: "./src/Infrastructure/**/*!(test).ts",
              // 対象のファイル
              target: "./src/Domain/**/!(*.spec.ts|*.test.ts)",
              message:
                "Domain層でInfrastructure層をimportしてはいけません。",
            },

            {
              // 依存禁止のパス
              // プレゼンテーション層に依存してはいけない
              from: "./src/Presentation/**/*",
              // 対象のファイル
              target: "./src/Application/**/!(*.spec.ts|*.test.ts)",
              message:
                "Application層でPresentation層をimportしてはいけません。",
            },
            {
              // 依存禁止のパス
              // インフラストラクチャ層に依存してはいけない
              from: "./src/Infrastructure/**/*",
              // 対象のファイル
              target: "./src/Application/**/!(*.spec.ts|*.test.ts)",
              message:
                "Application層でInfrastructure層をimportしてはいけません。",
            },
          ],
        },
      ],
    },
  }
);
```

> - [「このパスでこのファイルのインポートをさせたくない、、、」をESLintでルール化する](https://zenn.dev/sqer/articles/35d56d9850efb2)

<br>
