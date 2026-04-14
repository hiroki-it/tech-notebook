---
title: 【IT技術の知見】クリーンアーキテクチャ＠アーキテクチャ
description: クリーンアーキテクチャ＠アーキテクチャの知見を記録しています。
---

# クリーンアーキテクチャ＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. アーキテクチャ概要

### 思想

ドメイン駆動設計が適する機能的アプリケーションのみでなく、あらゆる種類 (例：非機能的アプリケーションなど) のソフトウェアに適用できる。

クリーンアーキテクチャ原著の序文にて、著者は「私は今まで色々な種類のシステムを作ってきたが、どのシステムでもアーキテクチャのルールは同じだった」と述べている。

異なるシステムでも同じルールを共有する必要がある』というようなことを述べている。

> - https://www.amazon.co.jp/dp/B07FSBHS2V

<br>

### 構成

> - https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

![clean-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/clean-architecture.jpeg)

### 各パターンの分類

オブジェクト指向型と手続き型のマルチパラダイム言語の場合、アプリケーションをクラスまたは関数で実装できる。

クリーンアーキテクチャはオブジェクト指向設計が前提にあるため、各レイヤーのパターンをクラスとして実装することが多い。

ただし、クラスとして実装するとインスタンス化の手間がある。関数として実装しても、アーキテクチャの思想に反しない場合がある (特に外側のレイヤー) 。

アーキテクチャのレイヤー別にこれを整理した。

| バックエンドレイヤー   | パターン                         | 責務                                                                                                                                             | インターフェース／実装 |
| ---------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| インフラストラクチャ層 | DB                               | データベースとの接続、コネクションの作成                                                                                                         | 実装                   |
|                        | EntityMappers (DTOに相当)        | ドメインとインフラ間のオブジェクトの詰め替え                                                                                                     | 実装                   |
|                        | Logger                           | ロギング                                                                                                                                         | 実装                   |
|                        | Middleware                       | ミドルウェアパターン                                                                                                                             | 実装                   |
|                        | Repositories                     | 実装リポジトリ                                                                                                                                   | 実装                   |
|                        | Listeners                        | リスナー                                                                                                                                         | 関数                   |
|                        | Routers                          | ルーティング                                                                                                                                     | 関数                   |
|                        | Seeder                           | 開発環境、CI環境のユニットテストやE2Eテスト、ステージング環境の動作確認に使用する初期データ挿入                                                  | 実装                   |
|                        | Drivers                          | SDK、ORM、CLIなど                                                                                                                                | 実装                   |
| プレゼンテーション層   | Controller                       | データの受信と返信                                                                                                                               | 実装                   |
|                        | RequestValidators                | 受信データのバリデーション                                                                                                                       | 実装                   |
|                        | ResponseValidators               | 返信データのバリデーション (受信データと比べてデータ構造は保証されているため、なくてもいい)                                                      | 実装                   |
|                        | Authenticators                   | 認証                                                                                                                                             | 実装                   |
|                        | Input (Commandとも呼ぶ)          | 型変換、入力データ翻訳、フロントエンドインターフェース (あるいは受信JSONデータ) からバックエンドインターフェースへのオブジェクトからへの詰め替え | 実装                   |
|                        | Output (DTOとも呼ぶ)             | 型変換、出力データ翻訳、バックエンドインターフェースからフロントエンドインターフェースへのオブジェクトからへの詰め替え                           | 実装                   |
| ユースケース層         | Interactor                       | ドメイン層で定義されたドメインルールを組み合わせ、ユースケースを具現化する。                                                                     | 実装                   |
|                        | InputBoundaries                  | Interactorのインターフェース                                                                                                                     | インターフェース       |
|                        | Input (Commandとも呼ぶ)          | 型変換、バックエンドインターフェースからユースケースのオブジェクトからへの詰め替え                                                               | 実装                   |
|                        | OutputBoundaries                 | Presenterのインターフェース                                                                                                                      | インターフェース       |
|                        | Output (DTOとも呼ぶ)             | 型変換、ユースケースからフロントエンドインターフェースへのオブジェクトからへの詰め替え                                                           | 実装                   |
|                        | Repositories（Gatewaysとも呼ぶ） | Repositoriesのインターフェース                                                                                                                   | インターフェース       |
| ドメイン層             | Entity                           | ドメインモデル、ドメインルールの定義                                                                                                             | 実装                   |
|                        | Id                               | ドメインモデルの識別子                                                                                                                           | 実装                   |
|                        | ValueObject                      | 値オブジェクト                                                                                                                                   | 実装                   |
|                        | Specification                    | ビジネスロジックのバリデーション                                                                                                                 | 実装                   |
|                        | Criterion                        | 検索条件オブジェクト                                                                                                                             | 実装                   |
|                        | Events                           | ドメインイベント                                                                                                                                 | 実装                   |
|                        | Service                          | ドメインサービス                                                                                                                                 | 実装                   |

| フロントエンドレイヤー | パターン   | 責務                                                                           | インターフェース／実装 |
| ---------------------- | ---------- | ------------------------------------------------------------------------------ | ---------------------- |
| プレゼンテーション層   | Presenter  | ドメインオブジェクトからJSONデータへの詰め替え                                 | 実装                   |
|                        | Validators | フロントエンドのバリデーション                                                 | 実装                   |
|                        | ViewModel  | 状態管理、JSONデータをフロントエンドインターフェースのオブジェクトへの詰め替え | 実装                   |
| UI層                   | View       | UIレンダリング、CSSスタイリング                                                | 実装                   |

<br>

### 実装例たち

| 言語       | あれば書籍名                                                     | URL                                                                            |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| TypeScript | つくりながら学ぶ！ ドメイン駆動設計 実践入門                     | https://github.com/yamachan0625/hands-on-ddd-introduction/tree/main/chapter-21 |
| Java       | なし                                                             | https://github.com/VaughnVernon/IDDD_Samples                                   |
| Go         | なし                                                             | https://github.com/victorsteven/food-app-server                                |
| C#         | ドメイン駆動設計入門 ボトムアップでわかる!ドメイン駆動設計の基本 | https://github.com/nrslib/itddd                                                |
| そのほか   | なし                                                             | https://github.com/stars/hiroki-it/lists/ddd-architecture                      |

<br>

## 02. アーキテクチャにおけるレイヤー別の例外スロー

### スローされた例外の扱い

各レイヤーでは例外をスローするだけに留まり、スローされた例外を対処する責務は、より上位レイヤーに持たせる。

より上位レイヤーでは、そのレイヤーに合った例外へ詰め替えてスローする。

最終的には、インターフェース層まで持ち上げ、画面上のポップアップで警告文としてこれを表示する。

<br>

### インターフェース層

#### ▼ 例外クラス

```php
final class PresentationException extends Exception
{

}
```

#### ▼ 例外の種類

| 例外名の例          | 説明                 |
| ------------------- | -------------------- |
| `BadRequestError`   | リクエスト形式が不正 |
| `UnauthorizedError` | 認証されていない     |
| `ForbiddenError`    | 認可されていない     |

#### ▼ ハンドリング

ユースケース層の処理を `try-catch` で囲い、スローされたユースケース例外をエラーレスポンスにして返信する。

<br>

### ユースケース層

#### ▼ 例外クラス

```php
final class InteractorException extends Exception
{

}
```

#### ▼ 例外の種類

ユースケースの処理に失敗した例外である。

| 例外名の例               | 説明                                          |
| ------------------------ | --------------------------------------------- |
| `FooNotFoundError`       | Fooドメインオブジェクトが存在しない           |
| `FooAlreadyExistsError`  | Fooドメインオブジェクトが重複する             |
| `FooQuotaExceededError`  | Fooドメインオブジェクトの登録上限を超えている |
| `FooChangeFailedError`   | 更新系ユースケースが失敗した                  |
| `FooRegisterFailedError` | 登録系ユースケースが失敗した                  |
| `FooGetFailedError`      | 閲覧系ユースケースが失敗した                  |
| `FooDeleteFailedError`   | 削除系ユースケースが失敗した                  |

#### ▼ ハンドリング

ドメイン層の処理を `try-catch` で囲い、スローされたドメイン例外をユースケース例外にして返却する。

<br>

### ドメイン層

#### ▼ 例外クラス

```php
final class DomainException extends Exception
{

}
```

#### ▼ 例外の種類

ドメインルールに違反した例外である。

| 例外名の例            | 説明                                 |
| --------------------- | ------------------------------------ |
| `InvalidFooNameError` | Foo 名がドメインルールに違反している |

<br>

### インフラストラクチャ層

#### ▼ 例外クラス

```php
final class インフラストラクチャ層Exception extends Exception
{

}
```

#### ▼ 例外の種類

データベースに関する例外である。

| 例外名の例                  | 説明                     |
| --------------------------- | ------------------------ |
| `UniqueConstraintError`     | プライマリーキー違反     |
| `ForeignKeyConstraintError` | 外部キー制約違反         |
| `DatabaseConnectionError`   | DB接続失敗               |
| `QueryTimeoutError`         | クエリがタイムアウトした |

#### ▼ ハンドリング

トランザクションの処理を `try-catch` で囲い、スローされたインフラストラクチャ例外をドメイン例外にして返却する。

<br>

## 03. 仕組みにする

### 静的解析

レイヤー間の依存関係の方向を静的解析で制御する。

例えば、`eslint-plugin-import`プラグインの`import/norestricted-paths`というルールが役立つ。

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

(略)

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

> - https://zenn.dev/sqer/articles/35d56d9850efb2

<br>
